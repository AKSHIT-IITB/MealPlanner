from dotenv import load_dotenv
import os

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
EXPRESS_API_URL = os.getenv("EXPRESS_API_URL", "http://localhost:5000/api")
CHROMA_PATH = os.getenv("CHROMA_PATH", "./chroma_db")
