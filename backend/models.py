from pydantic import BaseModel, Field
from typing import Any, List, Optional

class TestCall(BaseModel):
    method: str
    args: List[Any]
    expected_return: Optional[Any]
    comment: Optional[str] = None

class TestCase(BaseModel):
    name: str
    calls: List[TestCall]

class Level(BaseModel):
    level_number: int
    title: str
    description_specific: str
    test_cases_preview: List[str]
    test_cases: List[TestCase] = Field(default_factory=list)

class Problem(BaseModel):
    id: str
    title: str
    description_overview: str
    description_roadmap: Optional[str] = None
    initial_code_stub: str
    levels: List[Level]

class ProblemSummary(BaseModel):
    id: str
    title: str

class CodeSubmission(BaseModel):
    problem_id: str
    level_number: int
    user_code: str
    language: str

class RunResult(BaseModel):
    method: str
    args: List[Any]
    expected: Any
    actual: Optional[str]
    passed: bool
