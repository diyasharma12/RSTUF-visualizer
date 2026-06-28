"""TUF Metadata Visualizer – FastAPI Application."""

from __future__ import annotations

import os
import sys
from pathlib import Path

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

# Ensure the backend package root is on sys.path so that our sub-packages
# (dto, models, controllers) can be imported by name.
_BACKEND_DIR = Path(__file__).resolve().parent
if str(_BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(_BACKEND_DIR))

from controllers.details import get_details  # noqa: E402
from controllers.overview import get_overview  # noqa: E402
from dto.metadata import MetadataOverview, RoleDetails  # noqa: E402
from models.storage import IStorage  # noqa: E402

app = FastAPI(
    title="TUF Metadata Visualizer",
    description="Read-only API for inspecting TUF repository metadata.",
    version="0.1.0",
)

# ── CORS ────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Dependency: storage instance ────────────────────────────────────────

def _get_storage() -> IStorage:
    return IStorage()


# ── API Routes ──────────────────────────────────────────────────────────


@app.get("/api/metadata/overview", response_model=MetadataOverview)
async def metadata_overview() -> MetadataOverview:
    """Return a high-level overview of all TUF metadata roles."""
    storage = _get_storage()
    try:
        return await get_overview(storage)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


@app.get("/api/metadata/details", response_model=RoleDetails)
async def metadata_details(
    role: str = Query(..., description="Role name, e.g. 'root', 'timestamp', 'bins-0'"),
) -> RoleDetails:
    """Return detailed metadata for a specific TUF role."""
    storage = _get_storage()
    try:
        return await get_details(role, storage)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


# ── Static Files (serve frontend) ──────────────────────────────────────

_FRONTEND_DIR = _BACKEND_DIR.parent / "frontend"
if _FRONTEND_DIR.is_dir():
    app.mount("/", StaticFiles(directory=str(_FRONTEND_DIR), html=True), name="frontend")
