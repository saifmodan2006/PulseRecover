import uuid
import json
from datetime import datetime, timezone
from typing import Dict, Any, Optional, Tuple
from sqlalchemy.orm import Session
from app.models.entities import RecoveryActionRecord, Customer, CustomerRiskSnapshotRecord, utcnow
from app.streaming.confluent_client import streaming_client

ALLOWED_ACTIONS = {
    "PAYMENT_ASSISTANCE",
    "PRIORITY_SUPPORT",
    "DISCOUNT_OFFER",
    "ALTERNATIVE_PAYMENT",
    "DELIVERY_ESCALATION",
    "CUSTOMER_NOTIFICATION"
}

class RecoveryActionService:
    """
    Enforces action safety, allow-lists, idempotency checks,
    and dispatches customer recovery workflows.
    """
    @classmethod
    async def execute_recovery_action(
        cls,
        db: Session,
        customer_id: str,
        action_type: str,
        trigger_event: str = "risk_threshold_breach",
        priority: str = "HIGH",
        reasons: Optional[list] = None,
        idempotency_key: Optional[str] = None
    ) -> Tuple[bool, Dict[str, Any], int]:
        """
        Executes a recovery action safely.
        Returns: (success, result_dict, status_code)
        """
        # 1. Allow-list validation
        if action_type not in ALLOWED_ACTIONS:
            return False, {
                "error": f"Invalid action_type '{action_type}'. Must be one of: {sorted(list(ALLOWED_ACTIONS))}"
            }, 400

        # 2. Idempotency Check
        if not idempotency_key:
            idempotency_key = f"rec_{customer_id}_{action_type}_{datetime.now(timezone.utc).strftime('%Y%m%d%H%M')}"

        existing = db.query(RecoveryActionRecord).filter(
            RecoveryActionRecord.idempotency_key == idempotency_key
        ).first()

        if existing:
            return True, {
                "message": "Action already executed (idempotency enforced)",
                "action": existing.to_dict(),
                "idempotent_hit": True
            }, 200

        # 3. Customer existence check
        customer = db.query(Customer).filter(Customer.id == customer_id).first()
        if not customer:
            return False, {"error": f"Customer {customer_id} not found"}, 404

        action_id = f"ACT-{uuid.uuid4().hex[:8].upper()}"
        now = utcnow()

        # Generate realistic action result details
        action_descriptions = {
            "PAYMENT_ASSISTANCE": f"Dispatched fallback zero-interest UPI payment gateway link via WhatsApp/SMS to {customer.name}. Reserved cart items for 60 minutes.",
            "PRIORITY_SUPPORT": f"Escalated {customer.name}'s active ticket to Tier-3 VIP Support queue with CSR routing.",
            "DISCOUNT_OFFER": f"Applied 15% instant customer-recovery concession code RECOVER15 to checkout session.",
            "ALTERNATIVE_PAYMENT": "Switched default checkout tender to Instant NetBanking / Rupay direct tunnel.",
            "DELIVERY_ESCALATION": "Re-assigned shipment to Priority Express courier with expedited 24h delivery SLA.",
            "CUSTOMER_NOTIFICATION": f"Sent proactive apology push notification explaining system slowdown."
        }
        result_details = action_descriptions.get(action_type, f"Executed recovery action {action_type}")

        # 4. Create and record action
        action_record = RecoveryActionRecord(
            id=action_id,
            customer_id=customer_id,
            action_type=action_type,
            trigger_event=trigger_event,
            priority=priority,
            idempotency_key=idempotency_key,
            reasons_json=json.dumps(reasons or ["Elevated risk threshold"]),
            status="SUCCESS",
            result_details=result_details,
            created_at=now,
            executed_at=now
        )
        db.add(action_record)

        # 5. Update customer state to RECOVERED / RECOVERING
        customer.journey_state = "RECOVERED"
        customer.status = "Recovered"
        customer.risk_score = 15 # Risk neutralized
        customer.primary_issue = f"{action_type} Applied"
        customer.sentiment = "positive"
        customer.sentiment_score = 0.8
        customer.updated_at = now

        db.commit()
        db.refresh(action_record)
        db.refresh(customer)

        # 6. Stream to recovery-actions topic
        recovery_payload = {
            "action_id": action_id,
            "customer_id": customer_id,
            "action_type": action_type,
            "trigger_event": trigger_event,
            "priority": priority,
            "idempotency_key": idempotency_key,
            "reasons": reasons or [],
            "status": "SUCCESS",
            "result": result_details,
            "created_at": now.isoformat(),
            "executed_at": now.isoformat()
        }
        await streaming_client.produce("recovery-actions", customer_id, recovery_payload)

        return True, {
            "message": "Recovery action executed successfully",
            "action": action_record.to_dict(),
            "customer": customer.to_dict(),
            "idempotent_hit": False
        }, 200

recovery_service = RecoveryActionService()
