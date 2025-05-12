# icf.io/backend/main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import json # To load JSON
import os   # To construct file paths
from typing import List, Optional # For type hinting

# Import Pydantic models from models.py
from models import Problem, Level, ProblemSummary # Changed to direct import

app = FastAPI()

origins = [
    "http://localhost:5173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_DIR = os.path.join(os.path.dirname(__file__), 'data') # Path to the data directory

def load_problem_data(problem_id: str) -> Optional[Problem]:
    problem_file_path = os.path.join(DATA_DIR, f"{problem_id}.json")
    if not os.path.exists(problem_file_path):
        return None
    try:
        with open(problem_file_path, 'r') as f:
            data = json.load(f)
            return Problem(**data) # Validate data with Pydantic model
    except Exception as e:
        print(f"Error loading or parsing problem {problem_id}: {e}") # For debugging
        return None

def get_available_problems() -> List[ProblemSummary]:
    summaries = []
    if not os.path.exists(DATA_DIR):
        return summaries # Return empty list if data directory doesn't exist

    for filename in os.listdir(DATA_DIR):
        if filename.endswith(".json"):
            problem_id = filename[:-5] # Remove .json
            try:
                # For summary, we only need id and title, could optimize later
                # by not loading the whole file if many problems.
                # For MVP, loading the whole file to get title is fine.
                problem_file_path = os.path.join(DATA_DIR, filename)
                with open(problem_file_path, 'r') as f:
                    data = json.load(f)
                    summaries.append(ProblemSummary(id=problem_id, title=data.get("title", "Untitled Problem")))
            except Exception as e:
                print(f"Error processing summary for {filename}: {e}")
    return summaries
# --- End Helper Functions ---


@app.get("/")
async def read_root():
    return {"message": "Hello from the Backend!"}

@app.get("/api/greeting")
async def get_greeting():
    return {"greeting": "Hello, Coder! Welcome to the platform."}

# --- New API Endpoints for Problems ---
@app.get("/api/problems", response_model=List[ProblemSummary])
async def list_problems():
    """
    Returns a list of available problems with their IDs and titles.
    """
    return get_available_problems()

@app.get("/api/problems/{problem_id}", response_model=Problem)
async def get_problem_details(problem_id: str):
    """
    Returns the full details for a specific problem.
    """
    problem = load_problem_data(problem_id)
    if problem is None:
        raise HTTPException(status_code=404, detail=f"Problem '{problem_id}' not found")
    return problem