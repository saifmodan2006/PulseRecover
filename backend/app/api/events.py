from fastapi import APIRouter, Query
from typing import Optional, List
from app.streaming.confluent_client import streaming_client

router = APIRouter()

@router.get("/events")
def get_events(
    limit: int = Query(50, ge=1, le=500),
    topic: Optional[str] = Query(None),
    customer_id: Optional[str] = Query(None)
):
    events = streaming_client.dev_bus.get_events(limit=limit, topic=topic, customer_id=customer_id)
    return {
        "count": len(events),
        "events": events
    }
