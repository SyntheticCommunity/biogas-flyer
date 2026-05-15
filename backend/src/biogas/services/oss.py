"""Alibaba Cloud OSS service for file storage."""

from __future__ import annotations

import asyncio
import os
from typing import Optional

import oss2

from biogas.config import settings


class OSSService:
    """Wrapper around Alibaba Cloud OSS for uploading/downloading files.

    Bucket: biogas-papers in oss-cn-qingdao.aliyuncs.com
    """

    def __init__(self) -> None:
        auth = oss2.Auth(settings.aliyun_oss_access_key, settings.aliyun_oss_secret_key)
        self.bucket = oss2.Bucket(auth, settings.aliyun_oss_endpoint, settings.aliyun_oss_bucket)

    # -- async helpers (oss2 SDK is sync; we run blocking calls in threads) --

    async def upload_bytes(self, key: str, data: bytes) -> str:
        """Upload raw bytes to OSS and return the key."""
        loop = asyncio.get_running_loop()
        await loop.run_in_executor(None, lambda: self.bucket.put_object(key, data))
        return key

    async def upload_file(self, key: str, file_path: str) -> str:
        """Upload a local file to OSS and return the key."""
        loop = asyncio.get_running_loop()
        await loop.run_in_executor(None, lambda: self.bucket.put_object_from_file(key, file_path))
        return key

    async def download_bytes(self, key: str) -> bytes:
        """Download an object from OSS as bytes."""
        loop = asyncio.get_running_loop()
        result: oss2.models.PutObjectResult = await loop.run_in_executor(
            None, lambda: self.bucket.get_object(key)
        )
        return result.read()

    def get_signed_url(self, key: str, expires: int = 3600) -> str:
        """Return a time-limited signed URL for the given key (sync)."""
        return self.bucket.sign_url("GET", key, expires)

    async def delete(self, key: str) -> None:
        """Delete an object from OSS."""
        loop = asyncio.get_running_loop()
        await loop.run_in_executor(None, lambda: self.bucket.delete_object(key))


# Singleton instance
oss_service = OSSService()
