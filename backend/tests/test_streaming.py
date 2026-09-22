import pytest
import asyncio
from app.streaming.schema_registry import validator
from app.streaming.dev_streaming_bus import DevStreamingBus

def test_schemas_loaded():
    assert len(validator.schemas) >= 8
    assert "customer_event" in validator.schemas
    assert "payment_event" in validator.schemas
    assert "support_event" in validator.schemas
    assert "recovery_action" in validator.schemas

def test_validate_payment_event_valid():
    valid_payload = {
        "event_id": "evt_test1",
        "customer_id": "C1029",
        "event_type": "payment_failed",
        "event_time": "2026-09-22T10:30:00Z",
        "amount": 1499.0
    }
    valid, err = validator.validate_event("payment-events", valid_payload)
    assert valid is True
    assert err is None

def test_validate_payment_event_missing_required():
    invalid_payload = {
        "event_id": "evt_test2"
        # missing customer_id, event_type, amount
    }
    valid, err = validator.validate_event("payment-events", invalid_payload)
    assert valid is False
    assert err is not None

@pytest.mark.asyncio
async def test_dev_streaming_bus_produce_and_consume():
    bus = DevStreamingBus()
    received = []

    def callback(envelope):
        received.append(envelope)

    bus.subscribe("customer-events", callback)
    await bus.produce("customer-events", "C1029", {
        "event_id": "evt_c1",
        "customer_id": "C1029",
        "event_type": "page_view",
        "event_time": "2026-09-22T10:30:00Z"
    })

    assert len(received) == 1
    assert received[0]["customer_id"] == "C1029"
    assert received[0]["event_type"] == "page_view"
