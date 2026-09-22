from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.entities import IncidentRecord

router = APIRouter()

@router.get("/incidents")
def get_incidents(db: Session = Depends(get_db)):
    incidents = db.query(IncidentRecord).order_by(IncidentRecord.started_at.desc()).all()
    return [inc.to_dict() for inc in incidents]
