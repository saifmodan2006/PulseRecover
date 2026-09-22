from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.entities import Customer

router = APIRouter()

@router.get("/risk")
def get_risk_monitor_data(db: Session = Depends(get_db)):
    customers = db.query(Customer).all()
    
    distribution = {
        "LOW": 0,
        "MEDIUM": 0,
        "HIGH": 0,
        "CRITICAL": 0
    }
    
    for c in customers:
        if c.risk_score >= 80:
            distribution["CRITICAL"] += 1
        elif c.risk_score >= 60:
            distribution["HIGH"] += 1
        elif c.risk_score >= 30:
            distribution["MEDIUM"] += 1
        else:
            distribution["LOW"] += 1

    top_causes = [
        {"cause": "Payment Failures & Gateway Rejections", "count": 142, "percentage": 42},
        {"cause": "Negative Customer Support Sentiment", "count": 68, "percentage": 20},
        {"cause": "Checkout Drop-off & Abandonment", "count": 54, "percentage": 16},
        {"cause": "High Website API Latency (>500ms)", "count": 42, "percentage": 12},
        {"cause": "Carrier Delivery Delays (>60m)", "count": 34, "percentage": 10}
    ]

    segments = [
        {"segment": "VIP / High Lifetime Value (>₹50k)", "at_risk": 12, "critical": 3},
        {"segment": "First-time Checkout Users", "at_risk": 38, "critical": 14},
        {"segment": "Repeat Tier-2 Customers", "at_risk": 22, "critical": 5},
        {"segment": "Mobile App Shoppers", "at_risk": 45, "critical": 18}
    ]

    return {
        "distribution": distribution,
        "total_evaluated": len(customers),
        "top_causes": top_causes,
        "affected_segments": segments
    }
