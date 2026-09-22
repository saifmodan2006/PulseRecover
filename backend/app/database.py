import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.models.entities import Base, Customer, IncidentRecord, SystemAnomalyRecord, RecoveryActionRecord, utcnow
from datetime import timedelta

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./pulsercover.db")

# For SQLite, enable check_same_thread=False
connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Create all tables and seed initial deterministic data if empty"""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Check if customers exist
        if db.query(Customer).count() == 0:
            seed_initial_data(db)
    finally:
        db.close()

def seed_initial_data(db: Session):
    """Seed deterministic enterprise demo data"""
    now = utcnow()
    
    customers = [
        Customer(
            id="C1029",
            name="Aarav Sharma",
            email="aarav.sharma@example.com",
            current_journey="Checkout",
            journey_state="NORMAL",
            risk_score=15,
            primary_issue="None",
            sentiment="neutral",
            sentiment_score=0.1,
            potential_value=14990.0,
            status="Low",
            created_at=now - timedelta(minutes=45),
            updated_at=now - timedelta(minutes=5)
        ),
        Customer(
            id="C1045",
            name="Priya Patel",
            email="priya.patel@example.com",
            current_journey="Payment",
            journey_state="AT_RISK",
            risk_score=55,
            primary_issue="Card Gateway Timeout",
            sentiment="neutral",
            sentiment_score=-0.2,
            potential_value=24500.0,
            status="Medium",
            created_at=now - timedelta(hours=2),
            updated_at=now - timedelta(minutes=12)
        ),
        Customer(
            id="C1082",
            name="Rohan Mehta",
            email="rohan.mehta@example.com",
            current_journey="Support",
            journey_state="HIGH_RISK",
            risk_score=78,
            primary_issue="Repeated Payment Failure & Negative Sentiment",
            sentiment="negative",
            sentiment_score=-0.8,
            potential_value=38900.0,
            status="High",
            created_at=now - timedelta(hours=1),
            updated_at=now - timedelta(minutes=2)
        ),
        Customer(
            id="C1099",
            name="Ananya Verma",
            email="ananya.v@example.com",
            current_journey="Order Tracking",
            journey_state="RECOVERED",
            risk_score=20,
            primary_issue="Delivery Delay (Resolved)",
            sentiment="positive",
            sentiment_score=0.7,
            potential_value=18200.0,
            status="Recovered",
            created_at=now - timedelta(days=1),
            updated_at=now - timedelta(minutes=18)
        ),
        Customer(
            id="C1104",
            name="Vikram Rao",
            email="vikram.rao@example.com",
            current_journey="Product View",
            journey_state="NORMAL",
            risk_score=10,
            primary_issue="None",
            sentiment="neutral",
            sentiment_score=0.0,
            potential_value=8500.0,
            status="Low",
            created_at=now - timedelta(minutes=30),
            updated_at=now - timedelta(minutes=8)
        )
    ]
    db.add_all(customers)

    # Seed an active incident
    incident = IncidentRecord(
        id="INC-8021",
        title="HDFC Gateway Latency & High Failure Rate",
        severity="HIGH",
        affected_customers=184,
        failure_rate=12.8,
        baseline_rate=2.1,
        status="INVESTIGATING",
        started_at=now - timedelta(minutes=22),
        details="Elevated timeout errors on payment_method=card via primary gateway."
    )
    db.add(incident)

    # Seed an anomaly
    anomaly = SystemAnomalyRecord(
        id="ANOM-301",
        anomaly_type="payment_failure_rate_anomaly",
        severity="HIGH",
        metric_name="payment_failure_rate",
        current_value=12.8,
        baseline_value=2.1,
        details="Payment failure rate breached 3-sigma anomaly threshold (12.8% vs 2.1% baseline).",
        detected_at=now - timedelta(minutes=20)
    )
    db.add(anomaly)

    db.commit()
