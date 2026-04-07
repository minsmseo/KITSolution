# RevMap — Setup Guide

## Prerequisites

- Docker & Docker Compose
- Node.js 20+ (for local frontend dev)
- Python 3.11+ (for local backend dev)
- Google Gemini API key
- (Optional for prod) GCP project with Cloud Storage & Cloud Run

---

## Quick Start with Docker Compose

```bash
# 1. Clone and set up environment
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY

# 2. Start all services
docker compose up --build

# Frontend: http://localhost:80
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
# Neo4j Browser: http://localhost:7474
```

---

## Local Development

### Backend

```bash
cd backend

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # or .venv\Scripts\activate on Windows

# Install dependencies
pip install -r requirements.txt

# Start PostgreSQL and Neo4j via Docker (just the DBs)
docker compose up postgres neo4j -d

# Copy and configure env
cp ../.env.example .env
# Edit .env

# Run the API server
uvicorn app.main:app --reload --port 8000
```

API docs available at: http://localhost:8000/docs

### Frontend

```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
# Proxies /api -> http://localhost:8000
```

---

## User Roles

| Role | Access |
|------|--------|
| `admin` | Full access to all features + admin dashboard |
| `instructor` | Create lectures, upload text, generate knowledge graphs |
| `student` | Browse lectures, select keywords, generate & submit assignments |
| `manager` | View participation analytics dashboard |

---

## Core Workflow

### Instructor Flow
1. Sign up as `instructor`
2. Go to **My Classes** → Create Lecture
3. Open lecture → paste/upload lecture text → Save Text
4. Click **Generate Knowledge Graph** → wait for completion
5. Graph appears — students can now use this lecture

### Student Flow
1. Sign up as `student`
2. Ask instructor to enroll you (or use self-enroll API)
3. Go to **My Classes** → open lecture
4. Interact with the knowledge graph — click nodes to explore
5. Select keywords you want to review
6. Choose assignment type → **Generate Assignment**
7. Read the AI-generated assignment, write your answer, **Submit**

### Manager Flow
1. Sign up as `manager`
2. Go to **Analytics** dashboard
3. See participation rates by instructor and lecture

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `SECRET_KEY` | JWT signing key (use a strong random string in prod) |
| `DATABASE_URL` | PostgreSQL connection string |
| `NEO4J_URI` | Neo4j bolt URI |
| `NEO4J_USER` | Neo4j username |
| `NEO4J_PASSWORD` | Neo4j password |
| `GEMINI_API_KEY` | Google Gemini API key |
| `GCS_BUCKET_NAME` | GCS bucket for lecture text storage |
| `GOOGLE_APPLICATION_CREDENTIALS` | Path to GCP service account JSON |
| `MAX_LECTURE_TEXT_LENGTH` | Max chars for lecture text (default: 50000) |

---

## API Reference

Full interactive docs: `http://localhost:8000/docs`

### Key endpoints

```
POST /auth/signup          Register a new user
POST /auth/login           Get JWT token
GET  /auth/me              Get current user

GET  /lectures             List lectures (role-filtered)
POST /lectures             Create lecture (instructor)
GET  /lectures/{id}        Get lecture detail
POST /lectures/{id}/upload-text   Upload lecture text
POST /lectures/{id}/generate-graph  Trigger KG generation
GET  /lectures/{id}/graph  Get graph data (nodes + edges)
POST /lectures/{id}/enroll-self   Student self-enroll

POST /lectures/{id}/assignments/generate  Generate assignment
GET  /lectures/{id}/assignments           List my assignments
POST /assignments/{id}/submit             Submit answer

GET  /analytics/instructors               All instructor analytics
GET  /analytics/instructors/{id}          Specific instructor
GET  /analytics/lectures/{id}             Specific lecture
```

---

## Architecture

```
Browser (React SPA)
     │
     ▼ HTTP/REST
FastAPI Backend (Python)
     ├── PostgreSQL  — users, lectures, assignments, submissions
     ├── Neo4j       — knowledge graph nodes & edges
     └── GCS         — lecture text files (raw)
          │
          └── Gemini API  — KG extraction + assignment generation
```
