import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
import uuid
import time

from app.database import init_db
from app.streaming.confluent_client import streaming_client
from app.api import health, customers, events, risk, incidents, recovery, analytics, integrations, simulator, websocket

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] [%(name)s] %(message)s"
)
logger = logging.getLogger("pulsercover.app")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing PulseRecover AI Enterprise Platform...")
    init_db()
    await streaming_client.connect()
    yield
    logger.info("Shutting down PulseRecover AI...")

app = FastAPI(
    title="PulseRecover AI - Real-Time Customer Experience Rescue & Revenue Protection",
    description="Enterprise event streaming, Flink real-time correlation, AI/ML risk scoring, and automated recovery actions platform.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS setup
origins = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins + ["*"], # Allow dev origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request ID & Observability middleware
@app.middleware("http")
async def add_process_time_and_request_id(request: Request, call_next):
    request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Request-ID"] = request_id
    response.headers["X-Process-Time-Sec"] = f"{process_time:.4f}"
    return response

# Register API Routers
app.include_router(health.router, prefix="/api", tags=["Health"])
app.include_router(customers.router, prefix="/api", tags=["Customers"])
app.include_router(events.router, prefix="/api", tags=["Events"])
app.include_router(risk.router, prefix="/api", tags=["Risk Monitor"])
app.include_router(incidents.router, prefix="/api", tags=["Incidents"])
app.include_router(recovery.router, prefix="/api", tags=["Recovery Actions"])
app.include_router(analytics.router, prefix="/api", tags=["Analytics"])
app.include_router(integrations.router, prefix="/api", tags=["Integrations"])
app.include_router(simulator.router, prefix="/api", tags=["Simulator"])
app.include_router(websocket.router, prefix="/api", tags=["WebSocket Stream"])

@app.get("/")
def root():
    return {
        "product": "PulseRecover AI",
        "tagline": "Detect customer friction before it becomes customer loss.",
        "status": "operational",
        "docs_url": "/docs"
    }
