"""
Simple storage and DB helpers.

This module provides:
- init_db(): create sqlite DB and tables
- create_account(email, display_name) -> id
- create_profile(account_id, display_name, bio) -> id
- create_post(profile_id, text, media_path) -> id
- store_media(account_id, upload_file) -> relative path

Media files stored at backend/storage/buckets/{account_id}/
Image shrinking implemented with Pillow.
"""
import os
import sqlite3
import uuid
from datetime import datetime
from typing import Optional

from PIL import Image

ROOT = os.path.dirname(__file__)
DATA_DIR = os.path.join(ROOT, "data")
DB_PATH = os.path.join(DATA_DIR, "db.sqlite")
BUCKETS_DIR = os.path.join(ROOT, "storage", "buckets")


def ensure_dirs():
    os.makedirs(DATA_DIR, exist_ok=True)
    os.makedirs(BUCKETS_DIR, exist_ok=True)


def init_db():
    ensure_dirs()
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS accounts (
            id TEXT PRIMARY KEY,
            email TEXT,
            display_name TEXT,
            created_at TEXT
        )
    """
    )
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS profiles (
            id TEXT PRIMARY KEY,
            account_id TEXT,
            display_name TEXT,
            bio TEXT,
            created_at TEXT
        )
    """
    )
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS posts (
            id TEXT PRIMARY KEY,
            profile_id TEXT,
            text TEXT,
            media_path TEXT,
            created_at TEXT
        )
    """
    )
    conn.commit()
    conn.close()


def _conn():
    ensure_dirs()
    return sqlite3.connect(DB_PATH)


def create_account(email: str, display_name: Optional[str] = None) -> str:
    account_id = str(uuid.uuid4())
    conn = _conn()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO accounts (id, email, display_name, created_at) VALUES (?, ?, ?, ?)",
        (account_id, email, display_name, datetime.utcnow().isoformat()),
    )
    conn.commit()
    conn.close()
    return account_id


def create_profile(account_id: str, display_name: str, bio: Optional[str] = None) -> str:
    profile_id = str(uuid.uuid4())
    conn = _conn()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO profiles (id, account_id, display_name, bio, created_at) VALUES (?, ?, ?, ?, ?)",
        (profile_id, account_id, display_name, bio, datetime.utcnow().isoformat()),
    )
    conn.commit()
    conn.close()
    return profile_id


def create_post(profile_id: str, text: Optional[str] = None, media_path: Optional[str] = None) -> str:
    post_id = str(uuid.uuid4())
    conn = _conn()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO posts (id, profile_id, text, media_path, created_at) VALUES (?, ?, ?, ?, ?)",
        (post_id, profile_id, text, media_path, datetime.utcnow().isoformat()),
    )
    conn.commit()
    conn.close()
    return post_id


def list_posts(limit: int = 50):
    conn = _conn()
    cur = conn.cursor()
    cur.execute("SELECT id, profile_id, text, media_path, created_at FROM posts ORDER BY created_at DESC LIMIT ?", (limit,))
    rows = cur.fetchall()
    conn.close()
    posts = []
    for r in rows:
        posts.append({
            "id": r[0],
            "profile_id": r[1],
            "text": r[2],
            "media_path": r[3],
            "created_at": r[4],
        })
    return posts


def _account_bucket(account_id: str) -> str:
    path = os.path.join(BUCKETS_DIR, account_id)
    os.makedirs(path, exist_ok=True)
    return path


def store_media(account_id: str, upload_file) -> str:
    """Save uploaded file into the account's bucket. If image, shrink and return path to shrunk file."""
    bucket = _account_bucket(account_id)
    filename = upload_file.filename
    safe_name = f"{uuid.uuid4().hex}_{os.path.basename(filename)}"
    dest_path = os.path.join(bucket, safe_name)

    # write uploaded file to disk
    with open(dest_path, "wb") as f:
        content = upload_file.file.read()
        f.write(content)

    # if image, try to shrink
    try:
        with Image.open(dest_path) as img:
            img_format = img.format or "JPEG"
            max_w = 1024
            if img.width > max_w:
                ratio = max_w / float(img.width)
                new_h = int(img.height * ratio)
                img = img.resize((max_w, new_h), Image.LANCZOS)
            shrunk_name = f"shrunk_{safe_name}"
            shrunk_path = os.path.join(bucket, shrunk_name)
            img.save(shrunk_path, format=img_format, quality=75)
            # remove original to save space
            try:
                os.remove(dest_path)
            except Exception:
                pass
            # return relative path
            rel = os.path.relpath(shrunk_path, ROOT)
            return rel
    except Exception:
        # not an image or pillow failed; return relative path to original
        rel = os.path.relpath(dest_path, ROOT)
        return rel
