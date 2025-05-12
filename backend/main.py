# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware # Import CORS

app = FastAPI()

# --- CORS Middleware ---
# This is important for allowing your frontend (running on a different port)
# to communicate with your backend during development.
# For production, you might want to restrict origins more.
origins = [
    "http://localhost:5173",  # Default Vite React dev server port
    "http://localhost:3000",  # Common React dev server port (if you don't use Vite)
    # Add other origins if needed
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # Allow all methods (GET, POST, etc.)
    allow_headers=["*"], # Allow all headers
)
# --- End CORS Middleware ---

@app.get("/")
async def read_root():
    return {"message": "Hello from the Backend!"}

@app.get("/api/greeting")
async def get_greeting():
    return {"greeting": "Hello, Coder! Welcome to the platform."}