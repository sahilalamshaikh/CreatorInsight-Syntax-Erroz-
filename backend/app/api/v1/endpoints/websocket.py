"""
Simple WebSocket endpoint — no Redis needed for hackathon.
Sends a heartbeat ping every 30 seconds to keep the connection alive.
Real alert delivery can be added post-hackathon with Redis pub/sub.
"""
import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from app.core.security import decode_token

router = APIRouter(prefix="/ws", tags=["websocket"])


@router.websocket("/alerts")
async def alerts_websocket(websocket: WebSocket, token: str = Query(...)):
    try:
        payload = decode_token(token)
        user_id = payload["sub"]
    except Exception:
        await websocket.close(code=4001)
        return

    await websocket.accept()
    try:
        while True:
            await asyncio.sleep(30)
            await websocket.send_json({"type": "ping", "user_id": user_id})
    except WebSocketDisconnect:
        pass
