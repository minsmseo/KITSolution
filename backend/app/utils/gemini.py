import google.generativeai as genai
from app.config import get_settings
import json
import re

settings = get_settings()


def _get_model():
    genai.configure(api_key=settings.GEMINI_API_KEY)
    return genai.GenerativeModel(settings.GEMINI_MODEL)


async def generate_assignment(
    lecture_title: str,
    lecture_text_excerpt: str,
    selected_keywords: list[str],
    assignment_type: str,
    difficulty: str = "medium",
) -> str:
    type_instructions = {
        "short_answer": "Create 3-5 short answer questions (each requiring 2-4 sentence answers)",
        "concept_explanation": "Ask the student to explain each selected concept in their own words",
        "compare_contrast": "Create a compare/contrast task between the selected concepts",
        "summary": "Ask the student to write a structured summary connecting all selected concepts",
        "mini_quiz": "Create 5 multiple-choice questions with 4 options each, focused on the selected concepts",
    }
    instruction = type_instructions.get(assignment_type, type_instructions["short_answer"])

    prompt = f"""You are an academic assignment generator for a lecture review platform.

Lecture Title: {lecture_title}
Difficulty Level: {difficulty}
Selected Concepts to Review: {', '.join(selected_keywords)}

Relevant Lecture Excerpt:
{lecture_text_excerpt[:3000]}

Task: {instruction}

Requirements:
- Focus exclusively on the selected concepts: {', '.join(selected_keywords)}
- Match the {difficulty} difficulty level
- Encourage deep understanding, not memorization
- Be specific to the lecture content
- Do NOT include generic questions unrelated to these concepts

Generate the assignment now:"""

    model = _get_model()
    response = model.generate_content(prompt)
    return response.text


async def extract_knowledge_graph(lecture_text: str) -> dict:
    prompt = f"""You are a knowledge graph extraction system for educational content.

Extract a knowledge graph from the following lecture text. Return ONLY valid JSON with this exact structure:
{{
  "nodes": [
    {{"id": "unique_id", "label": "concept name", "type": "Concept|Topic|Definition|Formula|Example|Prerequisite", "description": "brief description"}}
  ],
  "edges": [
    {{"source": "node_id", "target": "node_id", "relation": "EXPLAINS|RELATES_TO|PREREQUISITE_OF|PART_OF|EXAMPLE_OF"}}
  ]
}}

Rules:
- Extract 10-30 key concepts as nodes
- Create meaningful relationships between concepts
- Use descriptive but concise labels
- Avoid duplicate concepts
- Node IDs should be snake_case versions of labels

Lecture Text:
{lecture_text[:8000]}

Return only the JSON object, no markdown, no explanation:"""

    model = _get_model()
    response = model.generate_content(prompt)
    raw = response.text.strip()

    # Strip markdown code fences if present
    raw = re.sub(r"^```(?:json)?\n?", "", raw)
    raw = re.sub(r"\n?```$", "", raw)

    graph_data = json.loads(raw)

    # Normalize: deduplicate nodes by label
    seen_labels = {}
    clean_nodes = []
    for node in graph_data.get("nodes", []):
        label_key = node["label"].lower().strip()
        if label_key not in seen_labels:
            seen_labels[label_key] = node["id"]
            clean_nodes.append(node)

    graph_data["nodes"] = clean_nodes

    # Remove edges referencing non-existent nodes
    valid_ids = {n["id"] for n in clean_nodes}
    graph_data["edges"] = [
        e for e in graph_data.get("edges", [])
        if e["source"] in valid_ids and e["target"] in valid_ids
    ]

    return graph_data
