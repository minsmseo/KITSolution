#!/bin/bash
set -euo pipefail

PROJECT_ID="${GCP_PROJECT_ID:?Set GCP_PROJECT_ID}"
REGION="${GCP_REGION:-asia-northeast3}"
IMAGE_TAG="${IMAGE_TAG:-latest}"

BACKEND_IMAGE="asia-northeast3-docker.pkg.dev/${PROJECT_ID}/revmap/backend:${IMAGE_TAG}"
FRONTEND_IMAGE="asia-northeast3-docker.pkg.dev/${PROJECT_ID}/revmap/frontend:${IMAGE_TAG}"

echo "Building and pushing images..."
docker build -t "$BACKEND_IMAGE" ./backend
docker push "$BACKEND_IMAGE"

docker build -t "$FRONTEND_IMAGE" ./frontend
docker push "$FRONTEND_IMAGE"

echo "Deploying backend to Cloud Run..."
gcloud run deploy renode-backend \
  --image "$BACKEND_IMAGE" \
  --region "$REGION" \
  --platform managed \
  --allow-unauthenticated \
  --project "$PROJECT_ID"

echo "Deploying frontend to Cloud Run..."
gcloud run deploy renode-frontend \
  --image "$FRONTEND_IMAGE" \
  --region "$REGION" \
  --platform managed \
  --allow-unauthenticated \
  --project "$PROJECT_ID"

echo "Deployment complete!"
