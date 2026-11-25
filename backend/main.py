import os
import logging
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from backend.routes.chat import router as chat_router
from backend.routes.settings import router as settings_router
from backend.routes.memories import router as memories_router
from fastapi.middleware.cors import CORSMiddleware
from backend.routes.auth import router as auth_router
from backend.routes.documents import router as documents_router
from dotenv import load_dotenv


load_dotenv()

# Configure logging so INFO and ERROR logs from services are clearly visible
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)

app = FastAPI(
    title="AI Learning Chatbot",
    version="1.0.0"
)

# Global exception handler ensuring CORS headers are included even on unhandled errors
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logging.getLogger(__name__).error(
        f"Unhandled exception on {request.method} {request.url.path}: {exc}",
        exc_info=True
    )
    origin = request.headers.get("origin")
    headers = {}
    if origin:
        headers["Access-Control-Allow-Origin"] = origin
        headers["Access-Control-Allow-Credentials"] = "true"
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred. Please try again."},
        headers=headers
    )


app.include_router(chat_router)
app.include_router(settings_router)
app.include_router(memories_router)
app.include_router(auth_router)
app.include_router(documents_router, prefix="/documents")




@app.get("/")
def home():

    return {
        "message": "Backend is running!"
    }


default_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://axiom-ai-web-application.onrender.com",
]

frontend_env = os.getenv("FRONTEND_URL")
if frontend_env:
    for raw in frontend_env.split(","):
        cleaned = raw.strip().rstrip("/")
        if cleaned and cleaned not in default_origins:
            default_origins.append(cleaned)

app.add_middleware(
    CORSMiddleware,
    allow_origins=default_origins,
    allow_origin_regex=r"^https://.*(\.onrender\.com|\.vercel\.app)$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)