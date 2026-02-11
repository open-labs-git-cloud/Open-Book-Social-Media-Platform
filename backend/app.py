from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from mangum import Mangum
import uvicorn

from . import storage
from . import models


app = FastAPI(title="OpenBook - Backend (Python)")


@app.on_event("startup")
def startup():
    storage.init_db()


@app.post("/accounts")
async def create_account(email: str = Form(...), display_name: str = Form(None)):
    # simple account creation - no auth for now
    account_id = storage.create_account(email=email, display_name=display_name)
    return JSONResponse({"id": account_id, "email": email, "display_name": display_name})


@app.post("/profiles")
async def create_profile(account_id: str = Form(...), display_name: str = Form(...), bio: str = Form(None)):
    # ensure account exists (basic check)
    # For now, optimistic: just create
    profile_id = storage.create_profile(account_id=account_id, display_name=display_name, bio=bio)
    return JSONResponse({"id": profile_id, "account_id": account_id, "display_name": display_name, "bio": bio})


@app.post("/posts")
async def create_post(profile_id: str = Form(...), text: str = Form(None), media: UploadFile = File(None)):
    # handle media upload and create post
    media_rel = None
    if media is not None:
        # determine account_id from profile (simple lookup)
        # For this minimal implementation, assume profile exists and get account
        # We'll query sqlite directly
        conn = storage._conn()
        cur = conn.cursor()
        cur.execute("SELECT account_id FROM profiles WHERE id = ?", (profile_id,))
        row = cur.fetchone()
        conn.close()
        if not row:
            raise HTTPException(status_code=404, detail="Profile not found")
        account_id = row[0]
        media_rel = storage.store_media(account_id, media)

    post_id = storage.create_post(profile_id=profile_id, text=text, media_path=media_rel)
    return JSONResponse({"id": post_id, "profile_id": profile_id, "text": text, "media_url": media_rel})


@app.get("/posts")
async def get_posts(limit: int = 50):
    posts = storage.list_posts(limit=limit)
    return JSONResponse(posts)


# expose handler for serverless (AWS Lambda via Mangum)
handler = Mangum(app)


if __name__ == "__main__":
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)
