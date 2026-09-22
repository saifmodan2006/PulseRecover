from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.entities import RecoveryActionRecord
from app.schemas.pydantic_models import RecoveryActionCreate
from app.services.recovery_service import recovery_service
from typing import List, Dict, Any

router = APIRouter()

@router.get("/recovery-actions")
def get_recovery_actions(db: Session = Depends(get_db)):
    actions = db.query(RecoveryActionRecord).order_by(RecoveryActionRecord.created_at.desc()).all()
    return [a.to_dict() for a in actions]

@router.post("/recovery-actions")
async def handle_http_sink_action(action_in: RecoveryActionCreate, db: Session = Depends(get_db)):
    """
    Invoked by Confluent Cloud HTTP Sink V2 Connector when a recovery action
    is emitted to the 'recovery-actions' Kafka topic.
    """
    success, res, code = await recovery_service.execute_recovery_action(
        db=db,
        customer_id=action_in.customer_id,
        action_type=action_in.action_type,
        trigger_event=action_in.trigger_event,
        priority=action_in.priority,
        reasons=action_in.reasons,
        idempotency_key=action_in.idempotency_key
    )
    if not success:
        raise HTTPException(status_code=code, detail=res)
    return res

@router.post("/recovery-actions/{action_type}/execute")
async def execute_manual_action(
    action_type: str,
    payload: Dict[str, Any],
    db: Session = Depends(get_db)
):
    customer_id = payload.get("customer_id")
    if not customer_id:
        raise HTTPException(status_code=400, detail="customer_id is required")

    success, res, code = await recovery_service.execute_recovery_action(
        db=db,
        customer_id=customer_id,
        action_type=action_type,
        trigger_event="manual_operations_trigger",
        priority=payload.get("priority", "HIGH"),
        reasons=payload.get("reasons", ["Manual operator intervention"]),
        idempotency_key=payload.get("idempotency_key")
    )
    if not success:
        raise HTTPException(status_code=code, detail=res)
    return res
