import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import init_db

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_database():
    init_db()

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "streaming" in data

def test_get_customers():
    response = client.get("/api/customers")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1

def test_get_customer_detail():
    response = client.get("/api/customers/C1029")
    assert response.status_code == 200
    data = response.json()
    assert data["customer"]["customer_id"] == "C1029"
    assert "factors" in data
    assert "timeline" in data

def test_get_events():
    response = client.get("/api/events?limit=10")
    assert response.status_code == 200
    data = response.json()
    assert "events" in data

def test_get_risk():
    response = client.get("/api/risk")
    assert response.status_code == 200
    data = response.json()
    assert "distribution" in data
    assert "top_causes" in data

def test_get_analytics():
    response = client.get("/api/analytics")
    assert response.status_code == 200
    data = response.json()
    assert "kpis" in data
    assert data["kpis"]["is_simulated"] is True

def test_integrations_status_no_secrets():
    response = client.get("/api/integrations/status")
    assert response.status_code == 200
    data = response.json()
    assert "integrations" in data
    text = response.text
    # Ensure no secrets or API keys are exposed
    assert "CONFLUENT_KAFKA_API_SECRET" not in text
    assert "YOUR_" not in text

def test_execute_recovery_action_idempotency():
    payload = {
        "customer_id": "C1029",
        "action_type": "PAYMENT_ASSISTANCE",
        "priority": "HIGH",
        "idempotency_key": "test_idempotent_key_101",
        "reasons": ["Automated test trigger"]
    }
    # First call
    res1 = client.post("/api/recovery-actions", json=payload)
    assert res1.status_code == 200
    assert res1.json()["idempotent_hit"] is False

    # Second call with same idempotency key
    res2 = client.post("/api/recovery-actions", json=payload)
    assert res2.status_code == 200
    assert res2.json()["idempotent_hit"] is True
