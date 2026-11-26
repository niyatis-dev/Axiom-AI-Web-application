import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv()


def get_clean_groq_api_key() -> str:
    """Return GROQ_API_KEY stripped of accidental whitespace or surrounding quotes."""
    raw = os.getenv("GROQ_API_KEY") or ""
    return raw.strip().strip('"').strip("'").strip()


def create_groq_client() -> Groq:
    """Create a Groq client using the sanitized GROQ_API_KEY."""
    return Groq(api_key=get_clean_groq_api_key())
