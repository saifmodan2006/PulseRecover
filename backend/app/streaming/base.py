from abc import ABC, abstractmethod
from typing import Dict, Any, Callable, List, Optional
import asyncio

class StreamingAdapter(ABC):
    @abstractmethod
    async def connect(self) -> bool:
        """Initialize connection to broker"""
        pass

    @abstractmethod
    async def produce(self, topic: str, key: str, value: Dict[str, Any]) -> bool:
        """Produce message to topic"""
        pass

    @abstractmethod
    def subscribe(self, topic: str, callback: Callable[[Dict[str, Any]], None]):
        """Subscribe to a topic"""
        pass

    @abstractmethod
    def get_status(self) -> Dict[str, Any]:
        """Return connectivity and topic telemetry"""
        pass
