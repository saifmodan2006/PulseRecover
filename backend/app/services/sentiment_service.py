import re
from typing import Dict, Any, Tuple

class SentimentAnalysisService:
    """
    Implements Flink's AI_SENTIMENT function semantics.
    Processes customer text inputs and extracts structured sentiment labels and confidence scores.
    """
    NEGATIVE_KEYWORDS = [
        "fail", "failed", "failure", "stuck", "error", "broken", "worst", "terrible",
        "slow", "refused", "decline", "declined", "frustrated", "angry", "hate",
        "horrible", "unacceptable", "scam", "lost money", "third time", "tried three times",
        "money deducted", "cancel", "disappointed", "not working", "doesn't work"
    ]
    
    POSITIVE_KEYWORDS = [
        "thank", "thanks", "great", "awesome", "fixed", "worked", "love", "helpful",
        "fast", "excellent", "resolved", "appreciate", "good", "perfect"
    ]

    @classmethod
    def analyze(cls, text: str) -> Tuple[str, float]:
        """
        Returns (sentiment_label, score)
        sentiment_label: 'positive' | 'neutral' | 'negative'
        score: -1.0 to 1.0
        """
        if not text:
            return "neutral", 0.0

        lower_text = text.lower()
        neg_matches = sum(1 for kw in cls.NEGATIVE_KEYWORDS if re.search(r'\b' + re.escape(kw) + r'\b', lower_text))
        pos_matches = sum(1 for kw in cls.POSITIVE_KEYWORDS if re.search(r'\b' + re.escape(kw) + r'\b', lower_text))

        if neg_matches > pos_matches:
            # Scale score between -0.4 and -1.0
            score = max(-1.0, -0.4 - (neg_matches * 0.2))
            return "negative", round(score, 2)
        elif pos_matches > neg_matches:
            score = min(1.0, 0.4 + (pos_matches * 0.2))
            return "positive", round(score, 2)
        else:
            return "neutral", 0.0

sentiment_service = SentimentAnalysisService()
