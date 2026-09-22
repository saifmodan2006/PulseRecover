import asyncio
import inspect
from datetime import datetime, timezone
from typing import Dict, Any, List, Callable, Optional
from collections import deque
import logging
from app.streaming.base import StreamingAdapter
from app.streaming.schema_registry import validator

logger = logging.getLogger("pulsercover.streaming_bus")

class DevStreamingBus(StreamingAdapter):
    """
    High-performance in-process streaming event bus implementing Kafka topic semantics.
    Supports topic subscriptions, partition routing, message ring-buffers, and schema validation.
    """
    def __init__(self, buffer_size: int = 2000):
        self.buffer_size = buffer_size
        self.topics = [
            "customer-events",
            "payment-events",
            "support-events",
            "order-events",
            "delivery-events",
            "customer-risk",
            "recovery-actions",
            "system-anomalies"
        ]
        self.subscribers: Dict[str, List[Callable[[Dict[str, Any]], Any]]] = {
            t: [] for t in self.topics
        }
        # In-memory circular buffer for dashboard event log
        self.event_log: deque = deque(maxlen=self.buffer_size)
        self.topic_counts: Dict[str, int] = {t: 0 for t in self.topics}
        self.total_messages: int = 0
        self.connected: bool = True
        self.created_at = datetime.now(timezone.utc)

    async def connect(self) -> bool:
        self.connected = True
        logger.info("DevStreamingBus initialized and ready.")
        return True

    async def produce(self, topic: str, key: str, value: Dict[str, Any]) -> bool:
        if topic not in self.topics:
            self.topics.append(topic)
            self.subscribers[topic] = []
            self.topic_counts[topic] = 0

        # Validate against Schema Registry
        valid, err = validator.validate_event(topic, value)
        if not valid:
            logger.warning(f"Schema validation warning on topic {topic}: {err}")

        envelope = {
            "time": value.get("event_time", datetime.now(timezone.utc).isoformat()),
            "topic": topic,
            "key": key,
            "event_type": value.get("event_type", "unknown"),
            "customer_id": value.get("customer_id", key),
            "source": value.get("source", "system"),
            "status": "PROCESSED",
            "payload": value
        }

        self.event_log.appendleft(envelope)
        self.topic_counts[topic] = self.topic_counts.get(topic, 0) + 1
        self.total_messages += 1

        # Dispatch to subscribers asynchronously
        callbacks = self.subscribers.get(topic, [])
        for cb in callbacks:
            try:
                if inspect.iscoroutinefunction(cb):
                    asyncio.create_task(cb(envelope))
                else:
                    cb(envelope)
            except Exception as e:
                logger.error(f"Error in subscriber callback for {topic}: {e}")

        return True

    def subscribe(self, topic: str, callback: Callable[[Dict[str, Any]], Any]):
        if topic not in self.subscribers:
            self.subscribers[topic] = []
        self.subscribers[topic].append(callback)

    def get_events(self, limit: int = 100, topic: Optional[str] = None, customer_id: Optional[str] = None) -> List[Dict[str, Any]]:
        results = []
        for evt in self.event_log:
            if topic and topic != "all" and evt["topic"] != topic:
                continue
            if customer_id and evt["customer_id"] != customer_id:
                continue
            results.append(evt)
            if len(results) >= limit:
                break
        return results

    def get_status(self) -> Dict[str, Any]:
        return {
            "engine": "DevStreamingBus (In-Memory Kafka Emulator)",
            "connected": self.connected,
            "total_messages": self.total_messages,
            "topic_counts": self.topic_counts,
            "topics": self.topics,
            "uptime_seconds": (datetime.now(timezone.utc) - self.created_at).total_seconds()
        }

    def clear(self):
        """Reset buffers for demo reset"""
        self.event_log.clear()
        for t in self.topic_counts:
            self.topic_counts[t] = 0
        self.total_messages = 0
