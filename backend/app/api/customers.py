from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.entities import Customer, CustomerRiskSnapshotRecord, RecoveryActionRecord
from app.streaming.confluent_client import streaming_client
import json

router = APIRouter()

@router.get("/customers")
def get_customers(
    status: Optional[str] = Query(None),
    journey_state: Optional[str] = Query(None),
    min_risk: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Customer)
    if status and status != "all":
        query = query.filter(Customer.status.ilike(status))
    if journey_state and journey_state != "all":
        query = query.filter(Customer.journey_state == journey_state)
    if min_risk is not None:
        query = query.filter(Customer.risk_score >= min_risk)
    
    customers = query.order_by(Customer.risk_score.desc()).all()
    return [c.to_dict() for c in customers]

@router.get("/customers/{customer_id}")
def get_customer_detail(customer_id: str, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail=f"Customer {customer_id} not found")

    # Fetch snapshots
    snapshots = db.query(CustomerRiskSnapshotRecord).filter(
        CustomerRiskSnapshotRecord.customer_id == customer_id
    ).order_by(CustomerRiskSnapshotRecord.created_at.desc()).limit(5).all()

    # Fetch recovery actions history
    actions = db.query(RecoveryActionRecord).filter(
        RecoveryActionRecord.customer_id == customer_id
    ).order_by(RecoveryActionRecord.created_at.desc()).all()

    # Fetch recent timeline events from streaming bus
    events = streaming_client.dev_bus.get_events(limit=30, customer_id=customer_id)

    # Latest risk factors
    latest_snapshot = snapshots[0] if snapshots else None
    factors = latest_snapshot.to_dict()["factors"] if latest_snapshot else []

    return {
        "customer": customer.to_dict(),
        "factors": factors,
        "snapshots": [s.to_dict() for s in snapshots],
        "actions": [a.to_dict() for a in actions],
        "timeline": events,
        "recommendation": customer.primary_issue if customer.journey_state != "RECOVERED" else "Recovery Completed"
    }
