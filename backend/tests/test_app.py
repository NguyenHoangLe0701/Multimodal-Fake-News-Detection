"""
Test cơ bản cho Backend API.
Sử dụng mock để tránh phụ thuộc vào thư viện AI nặng (torch, cv2, transformers)
khi chạy trong môi trường CI/CD.
"""
import sys
from unittest.mock import MagicMock, patch

import pytest


def _mock_heavy_modules():
    """Mock các module AI nặng trước khi import run.py"""
    modules_to_mock = [
        'cv2', 'torch', 'torch.nn', 'torch.nn.functional',
        'torchvision', 'torchvision.transforms',
        'transformers', 'pytesseract',
    ]
    for mod in modules_to_mock:
        if mod not in sys.modules:
            sys.modules[mod] = MagicMock()


# Mock trước khi import bất kỳ module nào của ứng dụng
_mock_heavy_modules()

# Patch _load_model để không thực sự tải model AI
with patch('app.services.ai_service._load_model', MagicMock()):
    from run import app  # noqa: E402

from fastapi.testclient import TestClient  # noqa: E402


@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c


def test_health_check(client):
    """Test endpoint gốc trả về status ok"""
    response = client.get('/')
    assert response.status_code == 200
    data = response.json()
    assert data['status'] == 'ok'
    assert 'message' in data


def test_not_found(client):
    """Test endpoint không tồn tại trả về 404"""
    response = client.get('/api/nonexistent-route')
    assert response.status_code == 404
