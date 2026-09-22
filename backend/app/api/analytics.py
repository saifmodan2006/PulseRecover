from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.business_metrics import business_metrics

router = APIRouter()

@router.get("/analytics")
def get_analytics(db: Session = Depends(get_db)):
    metrics = business_metrics.get_metrics(db)
    
    # Historical trend series (24h simulated intervals)
    trend_series = [
        {"time": "00:00", "risk_count": 14, "recovered_count": 8, "revenue_recovered": 120000},
        {"time": "04:00", "risk_count": 8, "recovered_count": 6, "revenue_recovered": 85000},
        {"time": "08:00", "risk_count": 28, "recovered_count": 22, "revenue_recovered": 310000},
        {"time": "12:00", "risk_count": 52, "recovered_count": 45, "revenue_recovered": 640000},
        {"time": "16:00", "risk_count": 68, "recovered_count": 59, "revenue_recovered": 820000},
        {"time": "20:00", "risk_count": 44, "recovered_count": 39, "revenue_recovered": 540000},
        {"time": "Now", "risk_count": metrics["at_risk_customers"], "recovered_count": metrics["recovered_customers"], "revenue_recovered": metrics["estimated_revenue_recovered"]}
    ]

    return {
        "kpis": metrics,
        "trends": trend_series
    }
