import os
import uuid
import asyncio
from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Optional, List
from core.pipeline import run_tutorial_pipeline

app = FastAPI(title="PocketFlow Tutorial Generator API")

# --- CORS ---
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for development convenience
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- In-Memory Job Store ---
JOBS = {}  # { job_id: { status: "queued"|"processing"|"completed"|"failed", result: dict, error: str } }

# --- Models ---
class TextGenerationRequest(BaseModel):
    repo_url: str
    clean: Optional[bool] = False
    language: Optional[str] = "english"
    
class VideoGenerationRequest(BaseModel):
    repo_url: str # To identify project
    voice: Optional[str] = "en-US-AriaNeural"
    style: Optional[str] = "dark"

# --- Background Worker ---
def worker_task(job_id: str, params: dict):
    JOBS[job_id]["status"] = "processing"
    try:
        # Run synchronous pipeline
        result = run_tutorial_pipeline(params)
        JOBS[job_id]["status"] = "completed"
        JOBS[job_id]["result"] = {
            "project_name": result.get("project_name"),
            "final_output_dir": result.get("final_output_dir")
        }
    except Exception as e:
        JOBS[job_id]["status"] = "failed"
        JOBS[job_id]["error"] = str(e)
        print(f"Job {job_id} failed: {e}")

# --- Endpoints ---

@app.post("/api/generate/text")
async def generate_text(req: TextGenerationRequest, background_tasks: BackgroundTasks):
    job_id = str(uuid.uuid4())
    JOBS[job_id] = {"status": "queued", "type": "text"}
    
    params = {
        "repo_url": req.repo_url,
        "clean": req.clean,
        "language": req.language,
        "video_mode": "none"
    }
    
    background_tasks.add_task(worker_task, job_id, params)
    return {"job_id": job_id, "status": "queued"}

@app.post("/api/generate/video")
async def generate_video(req: VideoGenerationRequest, background_tasks: BackgroundTasks):
    job_id = str(uuid.uuid4())
    JOBS[job_id] = {"status": "queued", "type": "video"}
    
    params = {
        "repo_url": req.repo_url, # Project name derived from this
        "video_mode": "only",
        "voice": req.voice,
        "style": req.style
    }
    
    background_tasks.add_task(worker_task, job_id, params)
    return {"job_id": job_id, "status": "queued"}

@app.get("/api/jobs/{job_id}")
async def get_job_status(job_id: str):
    if job_id not in JOBS:
        raise HTTPException(status_code=404, detail="Job not found")
    return JOBS[job_id]

@app.get("/api/projects/{project_name}/artifacts")
async def list_artifacts(project_name: str):
    output_dir = "output"
    project_path = os.path.join(output_dir, project_name)
    
    if not os.path.exists(project_path):
        raise HTTPException(status_code=404, detail="Project artifacts not found")
        
    files = []
    for root, _, filenames in os.walk(project_path):
        for filename in filenames:
            rel_path = os.path.relpath(os.path.join(root, filename), project_path)
            files.append(rel_path)
            
    return {"project": project_name, "files": files}

# Mount output directory to serve static files (markdown, videos, images)
# Access: http://localhost:8000/output/project_name/filename.md
if not os.path.exists("output"):
    os.makedirs("output")
app.mount("/output", StaticFiles(directory="output"), name="output")

@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    return FileResponse("path/to/favicon.ico") if os.path.exists("path/to/favicon.ico") else JSONResponse({})
