import os, json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional

from models import Problem, ProblemSummary, CodeSubmission, RunResult

app = FastAPI()

# CORS
origins = ["http://localhost:5173", "http://localhost:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")

def load_problem_data(pid: str) -> Optional[Problem]:
    path = os.path.join(DATA_DIR, f"{pid}.json")
    if not os.path.exists(path):
        return None
    with open(path) as f:
        return Problem(**json.load(f))

@app.get("/", response_model=dict)
def read_root():
    return {"message": "ICF.io Backend (exec mode)"}

@app.get("/api/problems", response_model=List[ProblemSummary])
def list_problems():
    summaries = []
    for fn in os.listdir(DATA_DIR):
        if fn.endswith(".json"):
            with open(os.path.join(DATA_DIR, fn)) as f:
                data = json.load(f)
                summaries.append(ProblemSummary(id=data["id"], title=data.get("title","")))
    return summaries

@app.get("/api/problems/{pid}", response_model=Problem)
def get_problem(pid: str):
    prob = load_problem_data(pid)
    if not prob:
        raise HTTPException(404, f"Problem '{pid}' not found")
    return prob

@app.post("/api/run", response_model=List[RunResult])
def run_code(sub: CodeSubmission):
    prob = load_problem_data(sub.problem_id)
    if not prob:
        raise HTTPException(404, "Problem not found")
    lvl = next((L for L in prob.levels if L.level_number == sub.level_number), None)
    if not lvl:
        raise HTTPException(404, "Level not found")

    # exec the user code
    namespace = {}
    try:
        exec(sub.user_code, namespace)
    except Exception as e:
        raise HTTPException(400, f"Error in submitted code: {e}")

    MainClass = namespace.get("Main")
    if not callable(MainClass):
        raise HTTPException(400, "No Main class defined in submission")

    inst = MainClass()
    results: List[RunResult] = []

    for tc in lvl.test_cases:
        for call in tc.calls:
            method = getattr(inst, call.method, None)
            if not callable(method):
                out = None
            else:
                try:
                    out = method(*call.args)
                except Exception:
                    out = None

            actual_str = None if out is None else str(out)
            passed = (out == call.expected_return)

            results.append(RunResult(
                method=call.method,
                args=call.args,
                expected=call.expected_return,
                actual=actual_str,
                passed=passed
            ))

    return results
