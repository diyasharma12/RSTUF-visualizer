"""Details controller – builds RoleDetails for a specific role.

Returns different shapes depending on the role:
- root: keys list, roles thresholds
- targets: signed_by, delegations, targets
- bins-*: signed_by, targets (artifacts)
- timestamp: snapshot_version
- snapshot: meta (version map)
"""

from __future__ import annotations

from typing import Any

from dto.metadata import (
    KeyDetail,
    RoleDetails,
    RoleThreshold,
    TargetFileDetail,
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


def _find_signing_key_name(
    role_name: str,
    root_signed: dict[str, Any],
    key_names: dict[str, str],
) -> str | None:
    """Find the human-readable name of the key that signs a given role."""
    roles = root_signed.get("roles", {})
    role_def = roles.get(role_name)
    if not role_def:
        # For bin roles, look up targets role (bins inherit targets' key)
        role_def = roles.get("targets")
    if role_def:
        keyids = role_def.get("keyids", [])
        if keyids:
            return key_names.get(keyids[0], keyids[0][:8])
    return None


def _build_root_details(
    root_signed: dict[str, Any],
    key_names: dict[str, str],
) -> tuple[list[KeyDetail], dict[str, RoleThreshold]]:
    """Build key details and role threshold mappings for root."""
    # Build reverse map: keyid → list of roles it signs
    roles_dict = root_signed.get("roles", {})
    keyid_to_roles: dict[str, list[str]] = {}
    for role_name, role_data in roles_dict.items():
        for kid in role_data.get("keyids", []):
            keyid_to_roles.setdefault(kid, []).append(role_name)

    # Key details
    keys_dict = root_signed.get("keys", {})
    keys: list[KeyDetail] = []
    for keyid, kdata in keys_dict.items():
        is_online = "x-rstuf-online-key-uri" in kdata
        keys.append(
            KeyDetail(
                name=key_names.get(keyid, keyid[:8]),
                keytype=kdata.get("keytype", ""),
                keyid_short=keyid[:8],
                online=is_online,
                roles=keyid_to_roles.get(keyid, []),
            )
        )

    # Role thresholds
    roles: dict[str, RoleThreshold] = {}
    for role_name, role_data in roles_dict.items():
        roles[role_name] = RoleThreshold(
            threshold=role_data.get("threshold", 1),
            keyids=[kid[:8] for kid in role_data.get("keyids", [])],
        )

    return keys, roles


async def get_details(role: str, storage: IStorage) -> RoleDetails:
    """Fetch metadata for a specific role and return structured details."""
    all_meta = await storage.fetch_all()

    if role not in all_meta:
        raise ValueError(f"Unknown role: {role}")

    metadata = all_meta[role]
    signed = metadata["signed"]
    root_signed = all_meta["root"]["signed"]
    key_names = _resolve_key_names(root_signed)

    details = RoleDetails(
        name=role,
        version=signed["version"],
        expires=signed["expires"],
    )

    if role == "root":
        keys, roles = _build_root_details(root_signed, key_names)
        details.keys = keys
        details.roles = roles

    elif role == "timestamp":
        ts_meta = signed.get("meta", {})
        snap_ref = ts_meta.get("snapshot.json", {})
        details.snapshot_version = snap_ref.get("version")

    elif role == "snapshot":
        details.meta = signed.get("meta")

    elif role == "targets":
        details.signed_by = _find_signing_key_name(role, root_signed, key_names)
        # Delegation names
        deleg = signed.get("delegations")
        if deleg:
            details.delegations = [d["name"] for d in deleg.get("roles", [])]
        # Direct targets
        targets_raw = signed.get("targets", {})
        details.targets = {
            name: TargetFileDetail(hashes=tdata["hashes"], length=tdata["length"])
            for name, tdata in targets_raw.items()
        }

    elif role.startswith("bins-"):
        details.signed_by = _find_signing_key_name(role, root_signed, key_names)
        targets_raw = signed.get("targets", {})
        details.targets = {
            name: TargetFileDetail(hashes=tdata["hashes"], length=tdata["length"])
            for name, tdata in targets_raw.items()
        }

    return details
