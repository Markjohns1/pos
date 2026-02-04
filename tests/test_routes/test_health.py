"""
Tests for health check endpoints.
"""


def test_health_check(client):
    """Test that health check returns healthy status."""
    response = client.get("/api/v1/health")
    
    assert response.status_code == 200
    data = response.json()
    
    assert data["status"] == "healthy"
    assert "version" in data
    assert data["database"] == "connected"


def test_readiness_check(client):
    """Test Kubernetes readiness probe."""
    response = client.get("/api/v1/health/ready")
    
    assert response.status_code == 200
    assert response.json()["ready"] is True


def test_liveness_check(client):
    """Test Kubernetes liveness probe."""
    response = client.get("/api/v1/health/live")
    
    assert response.status_code == 200
    assert response.json()["alive"] is True


def test_root_endpoint(client):
    """Test root endpoint returns API info."""
    response = client.get("/")
    
    assert response.status_code == 200
    data = response.json()
    
    assert "name" in data
    assert "version" in data
