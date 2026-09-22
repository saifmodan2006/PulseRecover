import os
import json
import logging
from typing import Dict, Any, Callable, Optional, List
from app.streaming.base import StreamingAdapter
from app.streaming.dev_streaming_bus import DevStreamingBus

logger = logging.getLogger("pulsercover.confluent")

class ConfluentStreamingClient(StreamingAdapter):
    """
    Native Confluent Cloud Kafka & Schema Registry Client.
    Uses SASL_SSL with Confluent API Key & Secret.
    Gracefully falls back to DevStreamingBus if credentials are not configured or librdkafka is unavailable.
    """
    def __init__(self):
        self.bootstrap_server = os.getenv("CONFLUENT_BOOTSTRAP_SERVER", "").strip()
        self.api_key = os.getenv("CONFLUENT_KAFKA_API_KEY", "").strip()
        self.api_secret = os.getenv("CONFLUENT_KAFKA_API_SECRET", "").strip()
        self.schema_registry_url = os.getenv("CONFLUENT_SCHEMA_REGISTRY_URL", "").strip()
        
        self.is_configured = bool(self.bootstrap_server and self.api_key and self.api_secret)
        self.dev_bus = DevStreamingBus()
        self.producer = None
        self.connected = False

    async def connect(self) -> bool:
        if not self.is_configured:
            logger.info("Confluent Cloud credentials not detected. Active backend: DevStreamingBus.")
            self.connected = False
            return await self.dev_bus.connect()

        try:
            from confluent_kafka import Producer
            conf = {
                'bootstrap.servers': self.bootstrap_server,
                'security.protocol': 'SASL_SSL',
                'sasl.mechanisms': 'PLAIN',
                'sasl.username': self.api_key,
                'sasl.password': self.api_secret,
                'client.id': 'pulsercover-ai-backend'
            }
            self.producer = Producer(conf)
            self.connected = True
            logger.info(f"Connected to Confluent Cloud Kafka at {self.bootstrap_server}")
            await self.dev_bus.connect() # Also connect dev bus for in-memory UI cache
            return True
        except ImportError:
            logger.warning("confluent-kafka package not installed. Using DevStreamingBus.")
            self.connected = False
            return await self.dev_bus.connect()
        except Exception as e:
            logger.error(f"Failed to connect to Confluent Cloud: {e}")
            self.connected = False
            return await self.dev_bus.connect()

    async def produce(self, topic: str, key: str, value: Dict[str, Any]) -> bool:
        # Always feed the local event ring-buffer for immediate real-time UI dashboard display
        await self.dev_bus.produce(topic, key, value)

        if self.connected and self.producer:
            try:
                payload_bytes = json.dumps(value).encode('utf-8')
                self.producer.produce(topic, key=key.encode('utf-8'), value=payload_bytes)
                self.producer.poll(0)
                return True
            except Exception as e:
                logger.error(f"Error producing to Confluent Cloud topic {topic}: {e}")
                return False
        return True

    def subscribe(self, topic: str, callback: Callable[[Dict[str, Any]], None]):
        self.dev_bus.subscribe(topic, callback)

    def get_status(self) -> Dict[str, Any]:
        return {
            "engine": "Confluent Cloud Kafka" if self.connected else "DevStreamingBus (In-Memory Engine)",
            "confluent_configured": self.is_configured,
            "connected": self.connected,
            "bootstrap_server": self.bootstrap_server if self.is_configured else "N/A (Local Mode)",
            "schema_registry_url": self.schema_registry_url if self.schema_registry_url else "Embedded Schema Validator",
            "total_messages": self.dev_bus.total_messages,
            "topic_counts": self.dev_bus.topic_counts,
            "topics": self.dev_bus.topics
        }

# Global singleton streaming client
streaming_client = ConfluentStreamingClient()
