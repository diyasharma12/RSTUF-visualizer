"""IStorage - fetches TUF metadata from web server."""
from __future__ import annotations

import asyncio
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
    def __init__(self, base_url: str | None = None) -> None:
        self._base_url = base_url or _storage_base_url()
        self._mock = _is_mock_mode()

    async def _fetch_json(
        self, filename: str, client: httpx.AsyncClient | None = None
    ) -> dict[str, Any]:
        if self._mock:
            return self._read_mock(filename)
        return await self._fetch_http(filename, client)

    async def _fetch_http(
        self, filename: str, client: httpx.AsyncClient | None = None
    ) -> dict[str, Any]:
        url = f"{self._base_url}/{filename}"
        if client is not None:
            resp = await client.get(url)
            resp.raise_for_status()
            return resp.json()
        async with httpx.AsyncClient(timeout=httpx.Timeout(30.0)) as new_client:
            resp = await new_client.get(url)
            resp.raise_for_status()
            return resp.json()

    def _read_mock(self, filename: str) -> dict[str, Any]:
        filepath = _MOCK_DIR / filename
        if not filepath.exists():
            raise FileNotFoundError(f"Mock file not found: {filepath}")
        return json.loads(filepath.read_text(encoding="utf-8"))

    async def get_timestamp(self) -> dict[str, Any]:
        return await self._fetch_json("timestamp.json")

    async def get_snapshot(self, version: int) -> dict[str, Any]:
        return await self._fetch_json(f"{version}.snapshot.json")

    async def get_root(self, version: int) -> dict[str, Any]:
        return await self._fetch_json(f"{version}.root.json")

    async def get_targets(self, version: int) -> dict[str, Any]:
        return await self._fetch_json(f"{version}.targets.json")

    async def get_bin(self, name: str, version: int) -> dict[str, Any]:
        return await self._fetch_json(f"{version}.{name}.json")

    async def fetch_all(self) -> dict[str, dict[str, Any]]:
        """Walk timestamp -> snapshot -> root / targets / bins.

        All delegated bin fetches happen concurrently over a single shared
        HTTP client/connection pool, instead of one-at-a-time, since a real
        repo can have hundreds of bins (e.g. 256) and sequential fetches
        easily exceed a frontend's request timeout.
        """
        result: dict[str, dict[str, Any]] = {}

        async with httpx.AsyncClient(timeout=httpx.Timeout(30.0)) as client:
            ts = await self._fetch_json("timestamp.json", client)
            result["timestamp"] = ts

            snap_version = ts["signed"]["meta"]["snapshot.json"]["version"]
            snap = await self._fetch_json(f"{snap_version}.snapshot.json", client)
            result["snapshot"] = snap

            snap_meta = snap["signed"]["meta"]

            root_version = snap_meta.get("root.json", {}).get("version", 1)
            targets_version = snap_meta["targets.json"]["version"]

            bin_jobs: list[tuple[str, str]] = []
            for meta_key, meta_val in snap_meta.items():
                role_name = meta_key.replace(".json", "")
                if role_name in ("root", "targets", "snapshot"):
                    continue
                bin_jobs.append((role_name, f"{meta_val['version']}.{role_name}.json"))

            # Fire root, targets, and every bin fetch concurrently.
            root_task = self._fetch_json(f"{root_version}.root.json", client)
            targets_task = self._fetch_json(f"{targets_version}.targets.json", client)
            bin_tasks = [self._fetch_json(filename, client) for _, filename in bin_jobs]

            root_result, targets_result, *bin_results = await asyncio.gather(
                root_task, targets_task, *bin_tasks
            )

            result["root"] = root_result
            result["targets"] = targets_result
            for (role_name, _), bin_data in zip(bin_jobs, bin_results):
                result[role_name] = bin_data

        return result
