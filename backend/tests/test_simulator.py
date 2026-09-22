import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_simulator_payment_failure_scenario():
    req = {
        "scenario": "payment_failure",
        "customer_id": "C1029"
    }
    res = client.post("/api/simulator/scenario", json=req)
    assert res.status_code == 200
    data = res.json()
    assert data["scenario"] == "payment_failure"
    assert data["final_risk_score"] == 87
    assert data["risk_level"] == "CRITICAL"
    assert data["recommended_action"] == "PAYMENT_ASSISTANCE"
    assert data["events_produced"] >= 5

def test_simulator_recovery_scenario():
    req = {
        "scenario": "recovery_scenario",
        "customer_id": "C1029"
    }
    res = client.post("/api/simulator/scenario", json=req)
    assert res.status_code == 200
    data = res.json()
    assert data["recovered"] is True

def test_simulator_reset_demo():
    res = client.post("/api/simulator/reset")
    assert res.status_code == 200
    assert res.json()["status"] == "success"
