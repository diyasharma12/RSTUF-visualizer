"""Overview controller – builds the MetadataOverview response.

Follows the TUF metadata chain to assemble a clean overview with:
- timestamp/snapshot/root/targets summaries
- root key-to-role assignments with human-readable nicknames
- delegated bins with file counts
"""

from __future__ import annotations

from typing import Any

from dto.metadata import (
    BinOverview,
    MetadataOverview,
    RoleKeyAssignment,
    RootOverview,
    SnapshotOverview,
    TargetsOverview,
    TimestampOverview,
)
from models.storage import IStorage


def _resolve_key_names(root_signed: dict[str, Any]) -> dict[str, str]:
    """Build a map of keyid → human-readable name from root metadata."""
    keys = root_signed.get("keys", {})
    result: dict[str, str] = {}
    for keyid, kdata in keys.items():
        name = kdata.get("x-rstuf-key-name", keyid[:8])
        result[keyid] = name
    return result


def _build_root_roles(
    root_signed: dict[str, Any],
    key_names: dict[str, str],
) -> dict[str, RoleKeyAssignment]:
    """Build role → {threshold, key_names} mapping for the overview."""
    roles_dict = root_signed.get("roles", {})
    result: dict[str, RoleKeyAssignment] = {}
    for role_name, role_data in roles_dict.items():
        threshold = role_data.get("threshold", 1)
        keyids = role_data.get("keyids", [])
        names = [key_names.get(kid, kid[:8]) for kid in keyids]
        result[role_name] = RoleKeyAssignment(threshold=threshold, keys=names)
    return result


async def get_overview(storage: IStorage) -> MetadataOverview:
    """Fetch all metadata and return a structured overview."""
    all_meta = await storage.fetch_all()

    # Timestamp
    ts_signed = all_meta["timestamp"]["signed"]
    timestamp = TimestampOverview(
        version=ts_signed["version"],
        expires=ts_signed["expires"],
    )

    # Snapshot
    snap_signed = all_meta["snapshot"]["signed"]
    snapshot = SnapshotOverview(
        version=snap_signed["version"],
        expires=snap_signed["expires"],
    )

    # Root – with key assignments
    root_signed = all_meta["root"]["signed"]
    key_names = _resolve_key_names(root_signed)
    root_roles = _build_root_roles(root_signed, key_names)
    root = RootOverview(
        version=root_signed["version"],
        expires=root_signed["expires"],
        roles=root_roles,
    )

    # Targets – with delegation list
    tgt_signed = all_meta["targets"]["signed"]
    delegation_names: list[str] = []
    delegations_data = tgt_signed.get("delegations")
    if delegations_data:
        for d in delegations_data.get("roles", []):
            delegation_names.append(d["name"])
    targets = TargetsOverview(
        version=tgt_signed["version"],
        expires=tgt_signed["expires"],
        delegations=delegation_names,
    )

    # Bins
    bins: list[BinOverview] = []
    for name, meta in sorted(all_meta.items()):
        if name.startswith("bins-"):
            signed = meta["signed"]
            file_count = len(signed.get("targets", {}))
            bins.append(
                BinOverview(
                    name=name,
                    version=signed["version"],
                    file_count=file_count,
                    expires=signed["expires"],
                )
            )

    return MetadataOverview(
        timestamp=timestamp,
        snapshot=snapshot,
        root=root,
        targets=targets,
        bins=bins,
    )
