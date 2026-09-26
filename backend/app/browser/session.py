from enum import Enum
from pydantic import BaseModel
from typing import Optional
import datetime
from playwright.async_api import Page, BrowserContext

class SessionStatus(str, Enum):
    STARTING = "STARTING"
    RUNNING = "RUNNING"
    IDLE = "IDLE"
    AUTOMATING = "AUTOMATING"
    STOPPING = "STOPPING"
    STOPPED = "STOPPED"
    ERROR = "ERROR"
    CRASHED = "CRASHED"

class BrowserSessionInfo(BaseModel):
    session_id: str
    status: SessionStatus
    current_url: str
    title: str
    creation_time: str
    last_activity: str

from app.websocket.manager import websocket_manager
import asyncio

class BrowserSession:
    def __init__(self, session_id: str, context: BrowserContext, page: Page):
        self.session_id = session_id
        self.context = context
        self.page = page
        self.status = SessionStatus.STARTING
        self.creation_time = datetime.datetime.now(datetime.UTC)
        self.last_activity = self.creation_time
        self.current_url = "about:blank"
        self.title = ""
        self.cdp_session = None

    async def initialize(self):
        self.status = SessionStatus.RUNNING
        self.page.on("framenavigated", self._on_navigate)
        
        # Setup CDP Session for Screencast
        try:
            self.cdp_session = await self.context.new_cdp_session(self.page)
            self.cdp_session.on("Page.screencastFrame", self._on_screencast_frame)
            await self.cdp_session.send("Page.startScreencast", {
                "format": "jpeg",
                "quality": 60,
                "maxWidth": 960,
                "maxHeight": 540,
                "everyNthFrame": 1
            })
        except Exception as e:
            # If CDP fails for any reason, log and continue without stream
            print(f"Failed to start CDP screencast for {self.session_id}: {e}")

    async def _on_screencast_frame(self, event):
        # Acknowledge the frame immediately so Chromium continues rendering smoothly
        if self.cdp_session:
            try:
                await self.cdp_session.send("Page.screencastFrameAck", {"sessionId": event["sessionId"]})
            except Exception:
                pass
            
        # Broadcast frame via WebSocket
        asyncio.create_task(websocket_manager.broadcast({
            "event": "screencast_frame",
            "session_id": self.session_id,
            "data": event["data"]
        }))

    async def _on_navigate(self, frame):
        if frame == self.page.main_frame:
            self.current_url = self.page.url
            try:
                self.title = await self.page.title()
            except Exception:
                pass
            self.update_activity()

    def update_activity(self):
        self.last_activity = datetime.datetime.now(datetime.UTC)

    async def navigate(self, url: str):
        self.status = SessionStatus.AUTOMATING
        try:
            await self.page.goto(url)
            self.status = SessionStatus.RUNNING
        except Exception as e:
            self.status = SessionStatus.ERROR
            raise e
        finally:
            self.update_activity()

    async def reload(self):
        await self.page.reload()
        self.update_activity()

    async def back(self):
        await self.page.go_back()
        self.update_activity()

    async def forward(self):
        await self.page.go_forward()
        self.update_activity()

    async def stop_loading(self):
        await self.page.evaluate("window.stop()")
        self.update_activity()

    async def close(self):
        self.status = SessionStatus.STOPPING
        await self.page.close()
        await self.context.close()
        self.status = SessionStatus.STOPPED

    def get_info(self) -> BrowserSessionInfo:
        return BrowserSessionInfo(
            session_id=self.session_id,
            status=self.status,
            current_url=self.current_url,
            title=self.title,
            creation_time=self.creation_time.isoformat(),
            last_activity=self.last_activity.isoformat()
        )
