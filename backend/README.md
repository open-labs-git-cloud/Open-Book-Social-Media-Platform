Open Book — Python backend

This lightweight backend provides minimal APIs to create accounts, profiles, and posts with media storage.
It's designed to be serverless-friendly (ASGI / Mangum) and also runnable locally with Uvicorn.

Features
- FastAPI app with endpoints: POST /accounts, POST /profiles, POST /posts, GET /posts
- SQLite metadata store (backend/data/db.sqlite)
- Per-account media buckets at backend/storage/buckets/{account_id}/
- Image shrinker using Pillow (resizes and reduces quality)

Run locally

1. Create a virtualenv and install dependencies:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

2. Start the server:

```bash
uvicorn app:app --reload --host 127.0.0.1 --port 8000
```

Serverless
- The app exposes `app` (FastAPI) and `handler` (Mangum) for easy deployment to AWS Lambda.

Notes
- Video compression is out-of-scope for this initial commit; placeholder endpoints accept video files and store them, but you should integrate ffmpeg or a video processing pipeline for production.
