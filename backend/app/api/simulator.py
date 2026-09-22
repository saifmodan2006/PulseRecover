from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.pydantic_models import SimulatorScenarioRequest
from app.simulator.scenarios import simulator

router = APIRouter()

@router.post("/simulator/scenario")
async def trigger_scenario(req: SimulatorScenarioRequest, db: Session = Depends(get_db)):
    result = await simulator.run_scenario(
        db=db,
        scenario=req.scenario,
        customer_id=req.customer_id
    )
    return result

@router.post("/simulator/reset")
def reset_demo(db: Session = Depends(get_db)):
    result = simulator.reset_demo(db)
    return result
