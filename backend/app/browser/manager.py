from playwright.async_api import async_playwright, Playwright, Browser
from .session import BrowserSession
from typing import Dict, List, Optional
import asyncio

class BrowserManager:
    def __init__(self):
        self.playwright: Optional[Playwright] = None
        self.browser: Optional[Browser] = None
        self.sessions: Dict[str, BrowserSession] = {}
        self._session_counter = 0

    async def start(self):
        self.playwright = await async_playwright().start()
        
        # Chromium launch arguments for smooth media playback and unthrottled rendering
        launch_args = [
            "--autoplay-policy=no-user-gesture-required",
            "--disable-background-timer-throttling",
            "--disable-backgrounding-occluded-windows",
            "--disable-renderer-backgrounding",
            "--disable-dev-shm-usage",
            "--disable-features=CalculateNativeWinOcclusion",
            "--no-sandbox",
        ]
        
        # Prefer system Google Chrome or Edge for full proprietary codec support (H.264, AAC, VP9)
        try:
            self.browser = await self.playwright.chromium.launch(
                channel="chrome",
                headless=True,
                args=launch_args,
            )
        except Exception:
            try:
                self.browser = await self.playwright.chromium.launch(
                    channel="msedge",
                    headless=True,
                    args=launch_args,
                )
            except Exception:
                self.browser = await self.playwright.chromium.launch(
                    headless=True,
                    args=launch_args,
                )
        
    async def stop(self):
        # Close all active sessions
        for session in list(self.sessions.values()):
            await session.close()
        self.sessions.clear()

        if self.browser:
            await self.browser.close()
            self.browser = None
            
        if self.playwright:
            await self.playwright.stop()
            self.playwright = None

    async def create_session(self) -> BrowserSession:
        if not self.browser:
            raise RuntimeError("Browser manager is not started")

        self._session_counter += 1
        session_id = f"browser-{self._session_counter:03d}"
        
        # Create an isolated context with desktop viewport
        context = await self.browser.new_context(
            viewport={"width": 1280, "height": 720},
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
            ignore_https_errors=True,
        )
        page = await context.new_page()
        
        session = BrowserSession(session_id, context, page)
        await session.initialize()
        self.sessions[session_id] = session
        
        return session

    async def close_session(self, session_id: str):
        if session_id in self.sessions:
            await self.sessions[session_id].close()
            del self.sessions[session_id]

    def get_session(self, session_id: str) -> Optional[BrowserSession]:
        return self.sessions.get(session_id)

    def list_sessions(self) -> List[BrowserSession]:
        return list(self.sessions.values())

browser_manager = BrowserManager()
