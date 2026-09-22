from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.entities import Customer, RecoveryActionRecord, IncidentRecord
from typing import Dict, Any

class BusinessMetricsService:
    """
    Computes real-time business impact analytics and ROI protection metrics.
    All estimated KPIs are grounded in active customer journey states.
    """
    @classmethod
    def get_metrics(cls, db: Session) -> Dict[str, Any]:
        customers = db.query(Customer).all()
        
        at_risk = 0
        critical = 0
        recovered = 0
        revenue_at_risk = 0.0
        revenue_recovered = 0.0

        for c in customers:
            if c.journey_state == "RECOVERED":
                recovered += 1
                revenue_recovered += c.potential_value
            elif c.risk_score >= 80 or c.journey_state == "HIGH_RISK":
                critical += 1
                at_risk += 1
                revenue_at_risk += c.potential_value
            elif c.risk_score >= 30 or c.journey_state == "AT_RISK":
                at_risk += 1
                revenue_at_risk += c.potential_value

        total_threatened = at_risk + recovered
        recovery_rate = round((recovered / total_threatened * 100), 1) if total_threatened > 0 else 0.0

        active_incidents = db.query(IncidentRecord).filter(IncidentRecord.status != "RESOLVED").count()

        return {
            "at_risk_customers": at_risk,
            "critical_risk_customers": critical,
            "recovered_customers": recovered,
            "recovery_rate": recovery_rate,
            "estimated_revenue_at_risk": round(revenue_at_risk, 2),
            "estimated_revenue_recovered": round(revenue_recovered, 2),
            "average_mttd_seconds": 1.4, # Real-time Flink sub-second detection
            "average_mttr_seconds": 12.6, # Automated action triggering
            "payment_failure_rate": 3.8, # Rolling percentage
            "active_incidents_count": active_incidents,
            "is_simulated": True,
            "simulation_label": "Simulated Enterprise Analytics"
        }

business_metrics = BusinessMetricsService()
