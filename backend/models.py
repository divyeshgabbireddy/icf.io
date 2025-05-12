# icf.io/backend/models.py
from pydantic import BaseModel
from typing import List, Optional

class Level(BaseModel):
    level_number: int
    title: str
    description_specific: str
    test_cases_preview: List[str]

class Problem(BaseModel):
    id: str
    title: str
    description_overview: str
    description_roadmap: Optional[str] = None # <-- ADD THIS LINE (make it optional)
    initial_code_stub: str
    levels: List[Level]

class ProblemSummary(BaseModel): # For listing problems
    id: str
    title: str