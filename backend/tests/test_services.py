"""Tests for biogas.services.oss — OSSService."""

from __future__ import annotations

from unittest.mock import MagicMock, patch

import pytest


class TestOSSServiceGetSignedURL:
    """Test OSSService.get_signed_url with mocked oss2."""

    def test_get_signed_url(self) -> None:
        """get_signed_url returns the URL produced by the underlying bucket."""
        mock_bucket = MagicMock()
        mock_bucket.sign_url.return_value = "https://example.com/signed/paper.pdf?Expires=1234"

        with patch("biogas.services.oss.settings") as mock_settings, patch(
            "biogas.services.oss.oss2"
        ) as mock_oss2:
            mock_settings.aliyun_oss_access_key = "fake-ak"
            mock_settings.aliyun_oss_secret_key = "fake-sk"
            mock_settings.aliyun_oss_bucket = "biogas-papers"
            mock_settings.aliyun_oss_endpoint = "oss-cn-qingdao.aliyuncs.com"

            mock_auth = MagicMock()
            mock_oss2.Auth.return_value = mock_auth
            mock_oss2.Bucket.return_value = mock_bucket

            from biogas.services.oss import OSSService

            svc = OSSService()
            url = svc.get_signed_url("papers/test.pdf", expires=7200)

            mock_oss2.Auth.assert_called_once_with("fake-ak", "fake-sk")
            mock_oss2.Bucket.assert_called_once_with(
                mock_auth, "oss-cn-qingdao.aliyuncs.com", "biogas-papers"
            )
            mock_bucket.sign_url.assert_called_once_with("GET", "papers/test.pdf", 7200)
            assert url == "https://example.com/signed/paper.pdf?Expires=1234"

    def test_get_signed_url_default_expires(self) -> None:
        """get_signed_url uses 3600 seconds by default."""
        mock_bucket = MagicMock()
        mock_bucket.sign_url.return_value = "https://example.com/signed"

        with patch("biogas.services.oss.settings") as mock_settings, patch(
            "biogas.services.oss.oss2"
        ) as mock_oss2:
            mock_settings.aliyun_oss_access_key = "ak"
            mock_settings.aliyun_oss_secret_key = "sk"
            mock_settings.aliyun_oss_bucket = "biogas-papers"
            mock_settings.aliyun_oss_endpoint = "oss-cn-qingdao.aliyuncs.com"
            mock_oss2.Auth.return_value = MagicMock()
            mock_oss2.Bucket.return_value = mock_bucket

            from biogas.services.oss import OSSService

            svc = OSSService()
            svc.get_signed_url("file.pdf")
            mock_bucket.sign_url.assert_called_once_with("GET", "file.pdf", 3600)
