"""
title: Games Hub Filter
author: pkeffect
author_url: https://github.com/pkeffect
funding_url: https://github.com/open-webui
version: 6.0.0
description: Games Hub
"""

from pydantic import BaseModel, Field
from typing import Optional, Dict, List, Callable, Any
import time
import os


class Filter:
    class Valves(BaseModel):
        cache_directory_name: str = Field(
            default="games_hub",
            description="Directory name in cache for storing games and configurations",
        )
        command_prefix: str = Field(
            default="!games",
            description="Command prefix that triggers games hub commands",
        )
        case_sensitive: bool = Field(
            default=False, description="Whether command matching is case-sensitive"
        )
        debug_mode: bool = Field(
            default=True, description="Enable extensive debugging output"
        )

    def __init__(self):
        self.valves = self.Valves()
        self.toggle = True
        self.icon = """data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZT0iY3VycmVudENvbG9yIj4KICA8cGF0aCBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGQ9Ik0xMS40OCAxLjc3NUEuNzUuNzUgMCAwIDEgMTIgMS41aC4wMjVhLjc1Ljc1IDAgMCAxIC40OS4yNzNsNi40NzUgOC4wOTNhLjc1Ljc1IDAgMCAxLS4wOTYgMS4wNTRMOC4yNSAyMi41YS43NS43NSAwIDAgMS0xLjQzNS0uNTI0Vjh2LTQuNDhsLS4yNzMtLjQ5QS43NS43NSAwIDAgMSA3IDEuODA2aC4wMjVBLjc1Ljc1IDAgMCAxIDcuNTIgMS41OGwzLjk2IDEuMTk1WiIvPgo8L3N2Zz4="""
        self.was_toggled_off_last_call = False

    def _debug_log(self, message: str, data: Any = None):
        if self.valves.debug_mode:
            timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
            if data is not None:
                print(f"[GAMES HUB DEBUG] {timestamp} - {message}: {data}")
            else:
                print(f"[GAMES HUB DEBUG] {timestamp} - {message}")

    def _get_hub_url(self) -> str:
        return f"/cache/functions/{self.valves.cache_directory_name}/index.html"

    def _detect_command(self, message_content: str) -> Optional[str]:
        if not message_content:
            return None

        content_to_check = (
            message_content if self.valves.case_sensitive else message_content.lower()
        )
        prefix_to_check = (
            self.valves.command_prefix
            if self.valves.case_sensitive
            else self.valves.command_prefix.lower()
        )

        if not content_to_check.strip().startswith(prefix_to_check):
            return None

        command_part = content_to_check[len(prefix_to_check) :].strip()

        if (
            not command_part
            or command_part.startswith("open")
            or command_part.startswith("launch")
        ):
            return "games_open"

        return None

    def _find_last_user_message(self, messages: List[Dict]) -> tuple[int, str]:
        for i in range(len(messages) - 1, -1, -1):
            if messages[i].get("role") == "user":
                return i, messages[i].get("content", "")
        return -1, ""

    async def _open_games_hub(self, __event_call__) -> None:
        hub_url = self._get_hub_url()

        popup_script = f"""
const popup = window.open(
    '{hub_url}',
    'gamesHub_' + Date.now(),
    'width=1200,height=900,scrollbars=yes,resizable=yes'
);

if (!popup) {{
    alert('🚫 Popup blocked! Please allow popups.');
}} else {{
    popup.focus();
}}
"""

        if __event_call__:
            await __event_call__({"type": "execute", "data": {"code": popup_script}})

    async def inlet(
        self,
        body: dict,
        __event_emitter__: Callable[[dict], Any],
        __event_call__: Callable[[dict], Any] = None,
        __user__: Optional[dict] = None,
    ) -> dict:

        messages = body.get("messages", [])
        if not messages or not self.toggle:
            return body

        last_message_idx, original_content = self._find_last_user_message(messages)
        if last_message_idx == -1:
            return body

        detected_command = self._detect_command(original_content)
        if detected_command == "games_open":
            self._debug_log("Opening games hub")
            await self._open_games_hub(__event_call__)
            # Mute LLM response
            messages[last_message_idx]["content"] = ""

        return body

    async def outlet(
        self, body: dict, __event_emitter__=None, __user__: Optional[dict] = None
    ) -> dict:
        return body
