# FastAPI Backend Implementation Plan

## Goal
Transform the CLI-based Tutorial Generator into a web service using **FastAPI**. This will allow the system to be integrated into a frontend application or invoked remotely.

## Core Design
- **Async Processing**: Tutorial generation is time-consuming. We will use FastAPI's `BackgroundTasks` to handle generation effectively without blocking the API.
- **State Management**: We will track "Jobs" using a simple in-memory store (or file-based status) to allow clients to poll for progress.
- **Modularity**: We will refactor `main.py` to extract the core orchestration logic into a separate `service` module that can be imported by the API.

## Proposed Changes

### 1. Refactoring Core Logic
#### [NEW] `core/pipeline.py` (or extract from `main.py`)
- Create a function `run_tutorial_pipeline(params: dict)` that:
    - Sets up the `shared` dictionary.
    - runs `create_tutorial_flow`.
    - Handles exceptions and logging.
- This decoupling allows both `main.py` (CLI) and `server/app.py` (API) to use the exact same logic.

### 2. FastAPI Application Structure
New directory: `server/`

#### [NEW] `server/app.py`
- **POST /api/generate/text**
    - Body: `{"repo_url": "...", "clean": bool}`
    - Action: Starts `run_tutorial_pipeline` in background (Text mode).
    - Returns: `{"job_id": "...", "project_name": "..."}`

#### [NEW] `server/app.py` (Video)
- **POST /api/generate/video**
    - Body: `{"project_name": "...", "voice": "...", "style": "..."}`
    - Action: Starts `run_tutorial_pipeline` in background (Video mode).
    - Returns: `{"job_id": "..."}`

#### [NEW] `server/app.py` (Status & Artifacts)
- **GET /api/jobs/{job_id}**
    - Returns task status (queued, processing, completed, failed).
- **GET /api/projects/{project_name}/artifacts**
    - Returns list of generated files or serves them statically.

## Dependencies
- `fastapi`
- `uvicorn`
- `pydantic`

## Verification Plan
1.  Start server: `uvicorn server.app:app --reload`
2.  Open Swagger UI (`http://localhost:8000/docs`).
3.  Trigger text generation for a small repo.
4.  Poll status endpoint.
5.  Trigger video generation for the completed project.
6.  Verify outputs in the `output/` directory.
