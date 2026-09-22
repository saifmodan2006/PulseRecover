from datetime import datetime, timezone
import json
from typing import Optional, Dict, Any, List
from sqlalchemy import Column, String, Integer, Float, DateTime, Text, Boolean, ForeignKey
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

def utcnow():
    return datetime.now(timezone.utc)

class Customer(Base):
    __tablename__ = "customers"

    id = Column(String(64), primary_key=True, index=True) # e.g. "C1029"
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)
    current_journey = Column(String(64), default="Checkout", nullable=False)
    journey_state = Column(String(32), default="NORMAL", nullable=False) # NORMAL, AT_RISK, HIGH_RISK, RECOVERING, RECOVERED, LOST
    risk_score = Column(Integer, default=0, nullable=False) # 0-100
    primary_issue = Column(String(255), default="None", nullable=False)
    sentiment = Column(String(32), default="neutral", nullable=False) # positive, neutral, negative
    sentiment_score = Column(Float, default=0.0, nullable=False) # -1.0 to 1.0
    potential_value = Column(Float, default=14990.0, nullable=False) # In INR or base currency
    status = Column(String(32), default="Normal", nullable=False) # Low, Medium, High, Critical, Recovered
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)

    # Relationships
    recovery_actions = relationship("RecoveryActionRecord", back_populates="customer", cascade="all, delete-orphan")
    risk_snapshots = relationship("CustomerRiskSnapshotRecord", back_populates="customer", cascade="all, delete-orphan")

    def to_dict(self) -> Dict[str, Any]:
        return {
            "customer_id": self.id,
            "name": self.name,
            "email": self.email,
            "current_journey": self.current_journey,
            "journey_state": self.journey_state,
            "risk_score": self.risk_score,
            "primary_issue": self.primary_issue,
            "sentiment": self.sentiment,
            "sentiment_score": self.sentiment_score,
            "potential_value": self.potential_value,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class CustomerEventRecord(Base):
    __tablename__ = "customer_events"

    id = Column(String(64), primary_key=True, index=True)
    customer_id = Column(String(64), ForeignKey("customers.id", ondelete="CASCADE"), index=True, nullable=False)
    event_type = Column(String(64), nullable=False, index=True)
    event_time = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    session_id = Column(String(64), nullable=True)
    source = Column(String(64), default="web-storefront", nullable=False)
    payload_json = Column(Text, default="{}", nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "event_id": self.id,
            "customer_id": self.customer_id,
            "event_type": self.event_type,
            "event_time": self.event_time.isoformat() if self.event_time else None,
            "session_id": self.session_id,
            "source": self.source,
            "payload": json.loads(self.payload_json) if self.payload_json else {},
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class PaymentRecord(Base):
    __tablename__ = "payments"

    id = Column(String(64), primary_key=True, index=True)
    customer_id = Column(String(64), ForeignKey("customers.id", ondelete="CASCADE"), index=True, nullable=False)
    amount = Column(Float, nullable=False)
    currency = Column(String(16), default="INR", nullable=False)
    payment_method = Column(String(32), default="card", nullable=False)
    failure_reason = Column(String(255), nullable=True)
    retry_count = Column(Integer, default=0, nullable=False)
    status = Column(String(32), default="pending", nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)


class SupportTicketRecord(Base):
    __tablename__ = "support_tickets"

    id = Column(String(64), primary_key=True, index=True)
    customer_id = Column(String(64), ForeignKey("customers.id", ondelete="CASCADE"), index=True, nullable=False)
    ticket_id = Column(String(64), index=True, nullable=False)
    message = Column(Text, nullable=False)
    channel = Column(String(32), default="chat", nullable=False)
    sentiment = Column(String(32), default="neutral", nullable=False)
    sentiment_score = Column(Float, default=0.0, nullable=False)
    status = Column(String(32), default="open", nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)


class DeliveryRecord(Base):
    __tablename__ = "deliveries"

    id = Column(String(64), primary_key=True, index=True)
    customer_id = Column(String(64), ForeignKey("customers.id", ondelete="CASCADE"), index=True, nullable=False)
    order_id = Column(String(64), index=True, nullable=False)
    carrier = Column(String(64), default="BlueDart", nullable=False)
    delay_minutes = Column(Integer, default=0, nullable=False)
    status = Column(String(32), default="in_transit", nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)


class RecoveryActionRecord(Base):
    __tablename__ = "recovery_actions"

    id = Column(String(64), primary_key=True, index=True) # action_id
    customer_id = Column(String(64), ForeignKey("customers.id", ondelete="CASCADE"), index=True, nullable=False)
    action_type = Column(String(64), nullable=False) # PAYMENT_ASSISTANCE, PRIORITY_SUPPORT, etc.
    trigger_event = Column(String(128), default="risk_threshold_exceeded", nullable=False)
    priority = Column(String(32), default="HIGH", nullable=False) # LOW, MEDIUM, HIGH, CRITICAL
    idempotency_key = Column(String(128), unique=True, index=True, nullable=False)
    reasons_json = Column(Text, default="[]", nullable=False)
    status = Column(String(32), default="PENDING", nullable=False) # PENDING, TRIGGERED, SUCCESS, FAILED
    result_details = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    executed_at = Column(DateTime(timezone=True), nullable=True)

    customer = relationship("Customer", back_populates="recovery_actions")

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "action_id": self.id,
            "customer_id": self.customer_id,
            "action_type": self.action_type,
            "trigger": self.trigger_event,
            "priority": self.priority,
            "idempotency_key": self.idempotency_key,
            "reason": json.loads(self.reasons_json) if self.reasons_json else [],
            "status": self.status,
            "result": self.result_details,
            "time": self.created_at.isoformat() if self.created_at else None,
            "executed_at": self.executed_at.isoformat() if self.executed_at else None,
        }


class IncidentRecord(Base):
    __tablename__ = "incidents"

    id = Column(String(64), primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    severity = Column(String(32), default="HIGH", nullable=False) # LOW, MEDIUM, HIGH, CRITICAL
    affected_customers = Column(Integer, default=0, nullable=False)
    failure_rate = Column(Float, default=0.0, nullable=False)
    baseline_rate = Column(Float, default=2.1, nullable=False)
    status = Column(String(32), default="INVESTIGATING", nullable=False) # INVESTIGATING, MITIGATING, RESOLVED
    started_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    details = Column(Text, nullable=True)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "title": self.title,
            "severity": self.severity,
            "affected_customers": self.affected_customers,
            "failure_rate": self.failure_rate,
            "baseline_rate": self.baseline_rate,
            "status": self.status,
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "resolved_at": self.resolved_at.isoformat() if self.resolved_at else None,
            "details": self.details,
        }


class CustomerRiskSnapshotRecord(Base):
    __tablename__ = "customer_risk_snapshots"

    id = Column(Integer, primary_key=True, autoincrement=True)
    customer_id = Column(String(64), ForeignKey("customers.id", ondelete="CASCADE"), index=True, nullable=False)
    risk_score = Column(Integer, nullable=False)
    risk_level = Column(String(32), nullable=False) # LOW, MEDIUM, HIGH, CRITICAL
    journey_state = Column(String(32), nullable=False)
    factors_json = Column(Text, default="[]", nullable=False)
    primary_issue = Column(String(255), default="None", nullable=False)
    recommendation = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)

    customer = relationship("Customer", back_populates="risk_snapshots")

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "customer_id": self.customer_id,
            "risk_score": self.risk_score,
            "risk_level": self.risk_level,
            "journey_state": self.journey_state,
            "factors": json.loads(self.factors_json) if self.factors_json else [],
            "primary_issue": self.primary_issue,
            "recommendation": self.recommendation,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class SystemAnomalyRecord(Base):
    __tablename__ = "system_anomalies"

    id = Column(String(64), primary_key=True, index=True)
    anomaly_type = Column(String(64), nullable=False)
    severity = Column(String(32), default="HIGH", nullable=False)
    metric_name = Column(String(64), nullable=False)
    current_value = Column(Float, nullable=False)
    baseline_value = Column(Float, nullable=False)
    details = Column(Text, nullable=True)
    detected_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "anomaly_type": self.anomaly_type,
            "severity": self.severity,
            "metric_name": self.metric_name,
            "current_value": self.current_value,
            "baseline_value": self.baseline_value,
            "details": self.details,
            "detected_at": self.detected_at.isoformat() if self.detected_at else None,
        }
