import asyncio
import json
import logging
from typing import List
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.streaming.confluent_client import streaming_client

logger = logging.getLogger("pulsercover.websocket")
router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket client connected. Active connections: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"WebSocket client disconnected. Active connections: {len(self.active_connections)}")

    async def broadcast(self, message: dict):
        dead_connections = []
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                dead_connections.append(connection)
        for dc in dead_connections:
            self.disconnect(dc)

manager = ConnectionManager()

def on_stream_event(envelope: dict):
    """Callback hooked into streaming bus to broadcast live events to all browser tabs"""
    asyncio.create_task(manager.broadcast({
        "type": "NEW_EVENT",
        "data": envelope
    }))

# Subscribe to all topics on the dev streaming bus
for topic in streaming_client.dev_bus.topics:
    streaming_client.subscribe(topic, on_stream_event)

@router.websocket("/live/stream")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        # Send initial welcome & status
        await websocket.send_json({
            "type": "CONNECTED",
            "message": "Connected to PulseRecover AI Live Streaming Backbone"
        })
        while True:
            # Keep connection alive; receive client ping or heartbeats
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_json({"type": "PONG"})
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.warning(f"WebSocket connection error: {e}")
        manager.disconnect(websocket)
