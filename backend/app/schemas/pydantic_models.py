from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any, Literal
from datetime import datetime

# Common Event Schema
class BaseEvent(BaseModel):
    event_id: str
    customer_id: str
    event_type: str
    event_time: str
    session_id: Optional[str] = None
    source: str = "web-storefront"
    metadata: Dict[str, Any] = Field(default_factory=dict)

class PaymentEventPayload(BaseEvent):
    amount: float
    currency: str = "INR"
    payment_method: str = "card"
    failure_reason: Optional[str] = None
    retry_count: int = 0
    gateway: str = "razorpay"

class SupportEventPayload(BaseEvent):
    ticket_id: Optional[str] = None
    message: str
    channel: str = "chat"
    sentiment: Optional[Literal["positive", "neutral", "negative"]] = None
    sentiment_score: Optional[float] = None
    urgency: str = "normal"

class OrderEventPayload(BaseEvent):
    order_id: str
    items_count: int = 1
    total_amount: float
    currency: str = "INR"
    status: str = "created"

class DeliveryEventPayload(BaseEvent):
    order_id: str
    carrier: str = "BlueDart"
    delay_minutes: int = 0
    tracking_number: Optional[str] = None
    reason: Optional[str] = None

class SystemAnomalyPayload(BaseModel):
    anomaly_id: str
    anomaly_type: str
    severity: Literal["LOW", "MEDIUM", "HIGH", "CRITICAL"]
    metric_name: str
    current_value: float
    baseline_value: float
    anomaly_score: float = 0.85
    affected_subsystem: str = "payments"
    detected_at: str
    details: str

# Risk Factor
class RiskFactor(BaseModel):
    signal: str
    points: int
    description: str

class CustomerRiskPayload(BaseModel):
    event_id: str
    customer_id: str
    event_type: str = "risk_evaluated"
    event_time: str
    risk_score: int
    risk_level: Literal["LOW", "MEDIUM", "HIGH", "CRITICAL"]
    journey_state: Literal["NORMAL", "AT_RISK", "HIGH_RISK", "RECOVERING", "RECOVERED", "LOST"]
    factors: List[RiskFactor] = Field(default_factory=list)
    primary_issue: str
    detected_anomalies: List[str] = Field(default_factory=list)
    recommended_action: Optional[str] = None
    priority: Literal["LOW", "MEDIUM", "HIGH", "CRITICAL"] = "HIGH"

# Recovery Action Schemas
class RecoveryActionCreate(BaseModel):
    customer_id: str
    action_type: Literal[
        "PAYMENT_ASSISTANCE",
        "PRIORITY_SUPPORT",
        "DISCOUNT_OFFER",
        "ALTERNATIVE_PAYMENT",
        "DELIVERY_ESCALATION",
        "CUSTOMER_NOTIFICATION"
    ]
    priority: Literal["LOW", "MEDIUM", "HIGH", "CRITICAL"] = "HIGH"
    trigger_event: str = "manual_escalation"
    idempotency_key: Optional[str] = None
    reasons: List[str] = Field(default_factory=list)

class RecoveryActionResponse(BaseModel):
    id: str
    action_id: str
    customer_id: str
    action_type: str
    priority: str
    idempotency_key: str
    reason: List[str]
    status: str
    result: Optional[str] = None
    time: Optional[str] = None
    executed_at: Optional[str] = None

# Customer Response
class CustomerResponse(BaseModel):
    customer_id: str
    name: str
    email: str
    current_journey: str
    journey_state: str
    risk_score: int
    primary_issue: str
    sentiment: str
    sentiment_score: float
    potential_value: float
    status: str
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

# Simulator Request
class SimulatorScenarioRequest(BaseModel):
    scenario: Literal[
        "normal_journey",
        "payment_failure",
        "angry_customer",
        "delivery_delay",
        "website_slowdown",
        "checkout_abandonment",
        "critical_risk",
        "recovery_scenario"
    ]
    customer_id: str = "C1029"

# KPI / Business Analytics Response
class BusinessKpiResponse(BaseModel):
    at_risk_customers: int
    critical_risk_customers: int
    recovered_customers: int
    recovery_rate: float
    estimated_revenue_at_risk: float
    estimated_revenue_recovered: float
    average_mttd_seconds: float
    average_mttr_seconds: float
    payment_failure_rate: float
    active_incidents_count: int
    is_simulated: bool = True
