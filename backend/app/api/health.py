from fastapi import APIRouter
from app.streaming.confluent_client import streaming_client
from datetime import datetime, timezone

router = APIRouter()

@router.get("/health")
def get_health():
    status = streaming_client.get_status()
    return {
        "status": "healthy",
        "service": "PulseRecover AI Core Engine",
        "version": "1.0.0",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "streaming": status
    }
