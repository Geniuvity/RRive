from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware

from app.api.routes import router
from app.auth.auth_routes import auth_router
from app.config import APP_SECRET_KEY


app = FastAPI()

# Must be added BEFORE CORSMiddleware
app.add_middleware(
    SessionMiddleware,
    secret_key=APP_SECRET_KEY,
    # For running on your local system, always --> https_only=False,
    # For deploying on the server (like render), always --> https_only=True
    https_only=True, 
    # same_site="lax" is only for local deployment, since we have backend and frontend server on different domain, samesite="none"
    same_site="none",
    max_age=3600,
)

# Allows for both, local deployment, and server side deployment(like vercel).
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://rrive.vercel.app",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(router)