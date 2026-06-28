"""IStorage – abstraction for fetching TUF metadata.

Supports two modes:
  • **HTTP mode** (default) – fetches JSON from a Python HTTP server
    (STORAGE_URL env var, defaults to http://localhost:8080).
  • **Mock mode** – reads from the local ``mock_data/`` directory when the
    ``MOCK_MODE`` env var is set to a truthy value (``1``, ``true``, ``yes``).
"""

from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any

import httpx


_MOCK_DIR = Path(__file__).resolve().parent.parent / "mock_data"

_TRUTHY = {"1", "true", "yes"}


def _is_mock_mode() -> bool:
    return os.getenv("MOCK_MODE", "").lower() in _TRUTHY


def _storage_base_url() -> str:
    return os.getenv("STORAGE_URL", "http://localhost:8080").rstrip("/")


class IStorage:
    """Fetch TUF metadata files either from a remote HTTP server or local mock data."""

    def __init__(self, base_url: str | None = None) -> None:
        self._base_url = base_url or _storage_base_url()
        self._mock = _is_mock_mode()

    # ── Private helpers ─────────────────────────────────────────────────

    async def _fetch_json(self, filename: str) -> dict[str, Any]:
        """Fetch a single JSON file by name."""
        if self._mock:
            return self._read_mock(filename)
        return await self._fetch_http(filename)

    async def _fetch_http(self, filename: str) -> dict:
        url = f"{self._base_url}/{filename}"
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.get(url)
            resp.raise_for_status()
            return resp.json()


    def _read_mock(self, filename: str) -> dict[str, Any]:
        filepath = _MOCK_DIR / filename
        if not filepath.exists():
            raise FileNotFoundError(
                f"Mock file not found: {filepath}"
            )
        return json.loads(filepath.read_text(encoding="utf-8"))

    # ── Public API ──────────────────────────────────────────────────────

    async def get_timestamp(self) -> dict[str, Any]:
        """Fetch ``timestamp.json`` (entry point of the version chain)."""
        return await self._fetch_json("timestamp.json")

    async def get_snapshot(self, version: int) -> dict[str, Any]:
        """Fetch ``<version>.snapshot.json``."""
        return await self._fetch_json(f"{version}.snapshot.json")

    async def get_root(self, version: int) -> dict[str, Any]:
        """Fetch ``<version>.root.json``."""
        return await self._fetch_json(f"{version}.root.json")

    async def get_targets(self, version: int) -> dict[str, Any]:
        """Fetch ``<version>.targets.json``."""
        return await self._fetch_json(f"{version}.targets.json")

    async def get_bin(self, name: str, version: int) -> dict[str, Any]:
        """Fetch ``<version>.<name>.json`` (delegated bin metadata)."""
        return await self._fetch_json(f"{version}.{name}.json")

    # ── Convenience: follow the full version chain ──────────────────────

    async def fetch_all(self) -> dict[str, dict[str, Any]]:
        """Walk timestamp → snapshot → root / targets / bins.

        Returns a dict keyed by role name (``"timestamp"``, ``"snapshot"``,
        ``"root"``, ``"targets"``, ``"bins-0"``, …).
        """
        result: dict[str, dict[str, Any]] = {}

        # 1. Timestamp
        ts = await self.get_timestamp()
        result["timestamp"] = ts

        # 2. Snapshot (version from timestamp)
        snap_version = ts["signed"]["meta"]["snapshot.json"]["version"]
        snap = await self.get_snapshot(snap_version)
        result["snapshot"] = snap

        # 3. Root, targets, delegated bins (versions from snapshot)
        snap_meta = snap["signed"]["meta"]

        root_version = snap_meta.get("root.json", {}).get("version", 1)
        result["root"] = await self.get_root(root_version)

        targets_version = snap_meta["targets.json"]["version"]
        result["targets"] = await self.get_targets(targets_version)

        # Delegated bins – any key in snapshot meta that is not root/targets/snapshot
        for meta_key, meta_val in snap_meta.items():
            # Strip ".json" to get the role name
            role_name = meta_key.replace(".json", "")
            if role_name in ("root", "targets", "snapshot"):
                continue
            bin_version = meta_val["version"]
            result[role_name] = await self.get_bin(role_name, bin_version)

        return result

