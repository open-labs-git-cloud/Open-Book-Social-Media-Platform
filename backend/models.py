from pydantic import BaseModel, Field
from typing import Optional


class AccountCreate(BaseModel):
    email: str
    display_name: Optional[str] = None


class AccountOut(BaseModel):
    id: str
    email: str
    display_name: Optional[str]


class ProfileCreate(BaseModel):
    account_id: str
    display_name: str
    bio: Optional[str] = None


class ProfileOut(BaseModel):
    id: str
    account_id: str
    display_name: str
    bio: Optional[str]


class PostCreate(BaseModel):
    profile_id: str
    text: Optional[str] = None


class PostOut(BaseModel):
    id: str
    profile_id: str
    text: Optional[str]
    media_url: Optional[str] = None
    created_at: Optional[str] = None
