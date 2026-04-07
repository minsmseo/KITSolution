from google.cloud import storage
from app.config import get_settings

settings = get_settings()

_client: storage.Client | None = None


def get_gcs_client() -> storage.Client:
    global _client
    if _client is None:
        _client = storage.Client()
    return _client


def upload_text(content: str, destination_blob_name: str) -> str:
    """Upload text content to GCS and return the GCS path."""
    client = get_gcs_client()
    bucket = client.bucket(settings.GCS_BUCKET_NAME)
    blob = bucket.blob(destination_blob_name)
    blob.upload_from_string(content, content_type="text/plain")
    return f"gs://{settings.GCS_BUCKET_NAME}/{destination_blob_name}"


def download_text(blob_name: str) -> str:
    """Download text content from GCS."""
    client = get_gcs_client()
    bucket = client.bucket(settings.GCS_BUCKET_NAME)
    blob = bucket.blob(blob_name)
    return blob.download_as_text()


def delete_blob(blob_name: str):
    client = get_gcs_client()
    bucket = client.bucket(settings.GCS_BUCKET_NAME)
    blob = bucket.blob(blob_name)
    blob.delete()
