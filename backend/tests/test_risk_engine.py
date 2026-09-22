import pytest
from app.services.risk_engine import risk_engine
from app.services.sentiment_service import sentiment_service

def test_explainable_risk_calculation_presentation_scenario():
    """Verify exact 87 risk score calibration for the challenge presentation flow"""
    score, level, factors, primary_issue, rec = risk_engine.calculate_risk(
        payment_failures=2,
        negative_sentiment=True,
        cart_abandoned=True,
        latency_spike=True,
        support_escalated=True
    )
    assert score == 87
    assert level == "CRITICAL"
    assert rec == "PAYMENT_ASSISTANCE"
    assert len(factors) == 6

def test_normal_customer_low_risk():
    score, level, factors, primary_issue, rec = risk_engine.calculate_risk(
        payment_failures=0,
        negative_sentiment=False,
        cart_abandoned=False
    )
    assert score == 0
    assert level == "LOW"
    assert len(factors) == 0

def test_ai_sentiment_service():
    text = "Payment has failed again. This is the third time."
    label, score = sentiment_service.analyze(text)
    assert label == "negative"
    assert score <= -0.5

    pos_text = "Thank you so much, the problem was resolved quickly!"
    p_label, p_score = sentiment_service.analyze(pos_text)
    assert p_label == "positive"
    assert p_score > 0.0
