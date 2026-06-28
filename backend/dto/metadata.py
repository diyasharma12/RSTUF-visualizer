"""Pydantic DTOs for TUF metadata API responses.

These models define the exact JSON shapes returned by the API endpoints.
The frontend relies on these specific field names and structures.
"""

from __future__ import annotations

from typing import Any, Optional

from pydantic import BaseModel, Field


# ── Overview Response Models ────────────────────────────────────────────


class RoleKeyAssignment(BaseModel):
    """Key assignment for a role inside root overview."""
    threshold: int
    keys: list[str] = Field(
        default_factory=list,
        description="Human-readable key names assigned to this role.",
    )


class TimestampOverview(BaseModel):
    version: int
    expires: str


class SnapshotOverview(BaseModel):
    version: int
    expires: str


class RootOverview(BaseModel):
    version: int
    expires: str
    roles: dict[str, RoleKeyAssignment] = Field(
        default_factory=dict,
        description="Role name → key assignment (threshold + key names).",
    )


class TargetsOverview(BaseModel):
    version: int
    expires: str
    delegations: list[str] = Field(
        default_factory=list,
        description="List of delegated bin role names.",
    )


class BinOverview(BaseModel):
    name: str
    version: int
    file_count: int
    expires: str


class MetadataOverview(BaseModel):
    """Full overview returned by GET /api/metadata/overview."""
    timestamp: TimestampOverview
    snapshot: SnapshotOverview
    root: RootOverview
    targets: TargetsOverview
    bins: list[BinOverview] = Field(default_factory=list)


# ── Details Response Models ─────────────────────────────────────────────


class KeyDetail(BaseModel):
    """Key information for root details view."""
    name: str
    keytype: str
    keyid_short: str
    online: bool
    roles: list[str] = Field(default_factory=list)


class RoleThreshold(BaseModel):
    """Role threshold information for root details view."""
    threshold: int
    keyids: list[str] = Field(default_factory=list)


class TargetFileDetail(BaseModel):
    """Artifact entry inside a bin/targets detail view."""
    hashes: dict[str, str]
    length: int


class RoleDetails(BaseModel):
    """Full details for a specific role, returned by GET /api/metadata/details.

    Different roles populate different subsets of fields.
    """
    name: str
    version: int
    expires: str

    # Root-specific
    keys: Optional[list[KeyDetail]] = None
    roles: Optional[dict[str, RoleThreshold]] = None

    # Targets / bins
    signed_by: Optional[str] = None
    targets: Optional[dict[str, TargetFileDetail]] = None
    delegations: Optional[list[str]] = None

    # Timestamp-specific
    snapshot_version: Optional[int] = None

    # Snapshot-specific
    meta: Optional[dict[str, Any]] = None
