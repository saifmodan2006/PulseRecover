import argparse
import asyncio
import os
import sys

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, init_db
from app.simulator.scenarios import simulator

async def main():
    parser = argparse.ArgumentParser(description="PulseRecover AI - CLI Scenario Simulator")
    parser.add_argument(
        "--scenario",
        type=str,
        default="payment_failure",
        choices=[
            "normal_journey",
            "payment_failure",
            "angry_customer",
            "delivery_delay",
            "website_slowdown",
            "checkout_abandonment",
            "critical_risk",
            "recovery_scenario",
            "reset"
        ],
        help="Deterministic scenario to trigger"
    )
    parser.add_argument("--customer", type=str, default="C1029", help="Target Customer ID")

    args = parser.parse_args()

    print(f"\n============================================================")
    print(f"PULSERECOVER AI - CLI EVENT SIMULATOR")
    print(f"Scenario: {args.scenario} | Target Customer: {args.customer}")
    print(f"============================================================\n")

    init_db()
    db = SessionLocal()
    try:
        if args.scenario == "reset":
            res = simulator.reset_demo(db)
            print(f"[SUCCESS] {res['message']}")
        else:
            res = await simulator.run_scenario(db, args.scenario, args.customer)
            print(f"[RESULT] Scenario '{args.scenario}' executed successfully.")
            print(f"  - Final Risk Score: {res.get('final_risk_score', 'N/A')}")
            print(f"  - Risk Level: {res.get('risk_level', 'N/A')}")
            print(f"  - Recommended Action: {res.get('recommended_action', 'N/A')}")
            print(f"  - Events Streamed: {res.get('events_produced', 'N/A')}")
            print("\nEvents have been produced to streaming topics and processed in real time.\n")
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(main())
