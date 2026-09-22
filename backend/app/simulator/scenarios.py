import asyncio
import uuid
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.entities import Customer, CustomerEventRecord, CustomerRiskSnapshotRecord, utcnow
from app.streaming.confluent_client import streaming_client
from app.services.sentiment_service import sentiment_service
from app.services.risk_engine import risk_engine
from app.services.recovery_service import recovery_service
import json

class ScenarioSimulator:
    """
    Deterministic enterprise event simulator executing live multi-step streaming scenarios.
    Produces real Kafka topic events with realistic micro-timestamps.
    """
    @classmethod
    async def run_scenario(cls, db: Session, scenario: str, customer_id: str = "C1029") -> Dict[str, Any]:
        customer = db.query(Customer).filter(Customer.id == customer_id).first()
        if not customer:
            # Create on-the-fly if needed
            customer = Customer(
                id=customer_id,
                name="Aarav Sharma" if customer_id == "C1029" else f"Customer {customer_id}",
                email=f"{customer_id.lower()}@example.com",
                current_journey="Checkout",
                journey_state="NORMAL",
                risk_score=15,
                primary_issue="None",
                sentiment="neutral",
                sentiment_score=0.1,
                potential_value=14990.0,
                status="Low"
            )
            db.add(customer)
            db.commit()
            db.refresh(customer)

        now = utcnow()
        session_id = f"SES-{uuid.uuid4().hex[:6].upper()}"
        emitted_events: List[Dict[str, Any]] = []

        if scenario == "payment_failure":
            # =========================================================================
            # THE CORE CONFLUENT CHALLENGE PRESENTATION SCENARIO (Section 56)
            # =========================================================================
            t0 = now - timedelta(seconds=12)

            # Step 1: product_view
            evt1 = {
                "event_id": f"evt_{uuid.uuid4().hex[:8]}",
                "customer_id": customer_id,
                "event_type": "product_view",
                "event_time": (t0).isoformat(),
                "session_id": session_id,
                "source": "web-storefront",
                "metadata": {"product_name": "UltraComfort Executive Chair", "price": 14990}
            }
            await streaming_client.produce("customer-events", customer_id, evt1)
            emitted_events.append(evt1)

            # Step 2: checkout_started
            evt2 = {
                "event_id": f"evt_{uuid.uuid4().hex[:8]}",
                "customer_id": customer_id,
                "event_type": "checkout_started",
                "event_time": (t0 + timedelta(seconds=3)).isoformat(),
                "session_id": session_id,
                "source": "web-storefront",
                "metadata": {"cart_value": 14990}
            }
            await streaming_client.produce("customer-events", customer_id, evt2)
            emitted_events.append(evt2)

            # Step 3: payment_failed
            evt3 = {
                "event_id": f"evt_{uuid.uuid4().hex[:8]}",
                "customer_id": customer_id,
                "event_type": "payment_failed",
                "event_time": (t0 + timedelta(seconds=5)).isoformat(),
                "session_id": session_id,
                "amount": 14990.0,
                "currency": "INR",
                "payment_method": "card",
                "failure_reason": "insufficient_funds",
                "retry_count": 0,
                "source": "payment-service"
            }
            await streaming_client.produce("payment-events", customer_id, evt3)
            emitted_events.append(evt3)

            # Step 4: payment_retry
            evt4 = {
                "event_id": f"evt_{uuid.uuid4().hex[:8]}",
                "customer_id": customer_id,
                "event_type": "payment_retry",
                "event_time": (t0 + timedelta(seconds=7)).isoformat(),
                "session_id": session_id,
                "amount": 14990.0,
                "currency": "INR",
                "payment_method": "card",
                "failure_reason": "gateway_timeout",
                "retry_count": 1,
                "source": "payment-service"
            }
            await streaming_client.produce("payment-events", customer_id, evt4)
            emitted_events.append(evt4)

            # Step 5: support_message (Customer frustration)
            support_msg = "Payment has failed again. This is the third time."
            sentiment_label, sentiment_score = sentiment_service.analyze(support_msg)
            evt5 = {
                "event_id": f"evt_{uuid.uuid4().hex[:8]}",
                "customer_id": customer_id,
                "event_type": "support_message",
                "event_time": (t0 + timedelta(seconds=9)).isoformat(),
                "session_id": session_id,
                "ticket_id": f"TCK-{uuid.uuid4().hex[:6].upper()}",
                "message": support_msg,
                "channel": "chat",
                "sentiment": sentiment_label,
                "sentiment_score": sentiment_score,
                "urgency": "high",
                "source": "support-chat"
            }
            await streaming_client.produce("support-events", customer_id, evt5)
            emitted_events.append(evt5)

            # Step 6: Flink Window Join & Risk Calculation -> Hits EXACT 87
            score, level, factors, primary_issue, recommendation = risk_engine.calculate_risk(
                payment_failures=2,
                negative_sentiment=True,
                cart_abandoned=True,
                latency_spike=True,
                support_escalated=True
            )

            # Update DB customer entity
            customer.current_journey = "Checkout / Payment"
            customer.journey_state = "HIGH_RISK"
            customer.risk_score = score # 87
            customer.status = "Critical"
            customer.primary_issue = primary_issue
            customer.sentiment = sentiment_label
            customer.sentiment_score = sentiment_score
            customer.updated_at = now

            # Record Risk Event
            risk_evt = {
                "event_id": f"risk_{uuid.uuid4().hex[:8]}",
                "customer_id": customer_id,
                "event_type": "risk_evaluated",
                "event_time": (t0 + timedelta(seconds=10)).isoformat(),
                "risk_score": score,
                "risk_level": level,
                "journey_state": "HIGH_RISK",
                "factors": factors,
                "primary_issue": primary_issue,
                "detected_anomalies": ["payment_failure_retry_limit", "negative_sentiment_burst"],
                "recommended_action": recommendation,
                "priority": "HIGH"
            }
            await streaming_client.produce("customer-risk", customer_id, risk_evt)
            emitted_events.append(risk_evt)

            # Snapshot in DB
            snapshot = CustomerRiskSnapshotRecord(
                customer_id=customer_id,
                risk_score=score,
                risk_level=level,
                journey_state="HIGH_RISK",
                factors_json=json.dumps(factors),
                primary_issue=primary_issue,
                recommendation=recommendation,
                created_at=now
            )
            db.add(snapshot)
            db.commit()

            return {
                "scenario": scenario,
                "customer_id": customer_id,
                "final_risk_score": score,
                "risk_level": level,
                "recommended_action": recommendation,
                "events_produced": len(emitted_events),
                "emitted_events": emitted_events
            }

        elif scenario == "normal_journey":
            t0 = now - timedelta(seconds=10)
            events = [
                ("customer-events", "page_view", {"url": "/products/chairs"}),
                ("customer-events", "product_view", {"product_id": "P-902", "price": 8500}),
                ("customer-events", "add_to_cart", {"product_id": "P-902", "price": 8500}),
                ("customer-events", "checkout_started", {"cart_value": 8500}),
                ("payment-events", "payment_success", {"amount": 8500, "payment_method": "upi"}),
                ("order-events", "order_created", {"order_id": f"ORD-{uuid.uuid4().hex[:6].upper()}", "total_amount": 8500, "items_count": 1})
            ]
            for i, (topic, etype, meta) in enumerate(events):
                evt = {
                    "event_id": f"evt_{uuid.uuid4().hex[:8]}",
                    "customer_id": customer_id,
                    "event_type": etype,
                    "event_time": (t0 + timedelta(seconds=i*2)).isoformat(),
                    "session_id": session_id,
                    "source": "web-storefront",
                    **meta
                }
                await streaming_client.produce(topic, customer_id, evt)
                emitted_events.append(evt)

            customer.current_journey = "Order Complete"
            customer.journey_state = "NORMAL"
            customer.risk_score = 5
            customer.status = "Normal"
            customer.primary_issue = "None"
            customer.sentiment = "positive"
            customer.sentiment_score = 0.5
            db.commit()

            return {
                "scenario": scenario,
                "customer_id": customer_id,
                "final_risk_score": 5,
                "risk_level": "LOW",
                "events_produced": len(emitted_events)
            }

        elif scenario == "recovery_scenario":
            # Direct recovery execution
            success, res, _ = await recovery_service.execute_recovery_action(
                db=db,
                customer_id=customer_id,
                action_type="PAYMENT_ASSISTANCE",
                trigger_event="manual_presentation_recovery",
                priority="HIGH",
                reasons=["Repeated payment failures", "Negative customer sentiment", "Checkout abandonment"]
            )
            return {
                "scenario": scenario,
                "customer_id": customer_id,
                "recovered": success,
                "action_details": res
            }

        elif scenario == "angry_customer":
            t0 = now - timedelta(seconds=5)
            msg = "This service is completely unacceptable. Money got deducted twice and no order confirmed!"
            sent_label, sent_score = sentiment_service.analyze(msg)
            evt = {
                "event_id": f"evt_{uuid.uuid4().hex[:8]}",
                "customer_id": customer_id,
                "event_type": "support_message",
                "event_time": t0.isoformat(),
                "session_id": session_id,
                "ticket_id": f"TCK-{uuid.uuid4().hex[:6].upper()}",
                "message": msg,
                "channel": "chat",
                "sentiment": sent_label,
                "sentiment_score": sent_score,
                "urgency": "critical",
                "source": "support-chat"
            }
            await streaming_client.produce("support-events", customer_id, evt)
            emitted_events.append(evt)

            score, level, factors, primary_issue, rec = risk_engine.calculate_risk(
                negative_sentiment=True,
                support_escalated=True,
                base_score=40
            )
            customer.current_journey = "Support Escalation"
            customer.journey_state = "HIGH_RISK"
            customer.risk_score = score
            customer.status = "High"
            customer.primary_issue = "Severe Customer Frustration"
            customer.sentiment = sent_label
            customer.sentiment_score = sent_score
            db.commit()

            return {
                "scenario": scenario,
                "customer_id": customer_id,
                "final_risk_score": score,
                "risk_level": level,
                "events_produced": len(emitted_events)
            }

        elif scenario == "delivery_delay":
            t0 = now - timedelta(seconds=5)
            evt = {
                "event_id": f"evt_{uuid.uuid4().hex[:8]}",
                "customer_id": customer_id,
                "event_type": "delivery_delayed",
                "event_time": t0.isoformat(),
                "order_id": f"ORD-{uuid.uuid4().hex[:6].upper()}",
                "carrier": "BlueDart",
                "delay_minutes": 120,
                "reason": "Severe weather disruption at hub",
                "source": "logistics-hub"
            }
            await streaming_client.produce("delivery-events", customer_id, evt)
            emitted_events.append(evt)

            score, level, factors, primary_issue, rec = risk_engine.calculate_risk(
                delivery_delayed=True,
                support_escalated=True,
                base_score=35
            )
            customer.current_journey = "Delivery Tracking"
            customer.journey_state = "AT_RISK"
            customer.risk_score = score
            customer.status = "Medium"
            customer.primary_issue = "Logistics Carrier Delay (+120m)"
            db.commit()

            return {
                "scenario": scenario,
                "customer_id": customer_id,
                "final_risk_score": score,
                "risk_level": level,
                "events_produced": len(emitted_events)
            }

        elif scenario == "website_slowdown":
            t0 = now - timedelta(seconds=5)
            evt = {
                "event_id": f"evt_{uuid.uuid4().hex[:8]}",
                "customer_id": customer_id,
                "event_type": "checkout_abandoned",
                "event_time": t0.isoformat(),
                "session_id": session_id,
                "source": "web-storefront",
                "metadata": {"reason": "api_timeout_850ms"}
            }
            await streaming_client.produce("customer-events", customer_id, evt)
            emitted_events.append(evt)

            anom_evt = {
                "anomaly_id": f"ANOM-{uuid.uuid4().hex[:6].upper()}",
                "anomaly_type": "latency_spike",
                "severity": "HIGH",
                "metric_name": "checkout_p99_latency",
                "current_value": 850.0,
                "baseline_value": 180.0,
                "anomaly_score": 0.92,
                "affected_subsystem": "web-checkout-api",
                "detected_at": now.isoformat(),
                "details": "Elevated latency on checkout API causing customer abandonment."
            }
            await streaming_client.produce("system-anomalies", "system", anom_evt)
            emitted_events.append(anom_evt)

            score, level, factors, primary_issue, rec = risk_engine.calculate_risk(
                cart_abandoned=True,
                latency_spike=True,
                base_score=30
            )
            customer.current_journey = "Checkout Abandoned"
            customer.journey_state = "AT_RISK"
            customer.risk_score = score
            customer.status = "Medium"
            customer.primary_issue = "Website Latency & Checkout Drop"
            db.commit()

            return {
                "scenario": scenario,
                "customer_id": customer_id,
                "final_risk_score": score,
                "risk_level": level,
                "events_produced": len(emitted_events)
            }

        # Default fallback
        return {"scenario": scenario, "customer_id": customer_id, "status": "executed"}

    @classmethod
    def reset_demo(cls, db: Session) -> Dict[str, Any]:
        """Resets database and event buffers back to pristine demo state"""
        from app.database import Base, engine, seed_initial_data
        from app.streaming.confluent_client import streaming_client
        
        # Clear tables
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)
        seed_initial_data(db)

        # Clear in-memory event bus
        streaming_client.dev_bus.clear()

        return {"status": "success", "message": "Demo state reset successfully to baseline"}

simulator = ScenarioSimulator()
