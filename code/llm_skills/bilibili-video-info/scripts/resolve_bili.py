#!/usr/bin/env python3
"""Resolve a Bilibili share link, b23.tv short link, full video URL or BV id
into canonical video information.

Always outputs: BV id + canonical URL containing the BV id.
Additionally outputs (when metadata is available): video title, publish time,
duration and uploader name (after applying user-defined aliases).

Usage:
  python3 resolve_bili.py "【手指发力技术教学-哔哩哔哩】 https://b23.tv/HlWsuVM"
  python3 resolve_bili.py "https://www.bilibili.com/video/BV1grWu6zEZ7?share_source=COPY"
  python3 resolve_bili.py BV1grWu6zEZ7 --json
  python3 resolve_bili.py --from-json -            # feed WebFetch API JSON via stdin
  python3 resolve_bili.py --from-json meta.json
"""

import argparse
import json
import re
import shutil
import subprocess
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

BV_RE = re.compile(r"BV[0-9A-Za-z]{10}")
URL_RE = re.compile(r"https?://[^\s<>\"'，。；）】]+")
API = "https://api.bilibili.com/x/web-interface/view?bvid={bv}"
CST = timezone(timedelta(hours=8))
ALIASES_FILE = Path(__file__).with_name("uploader_aliases.json")


def curl(*args, timeout=20):
    """Run curl and return stdout, or None on an empty result.

    A short-link redirect can print a usable %{url_effective} even when the
    final TLS connection fails (exit 35). Keep stdout in that case and let the
    caller decide whether the payload is usable.
    """
    if shutil.which("curl") is None:
        return None
    try:
        proc = subprocess.run(
            ["curl", "-sS", "--max-time", "15", *args],
            capture_output=True,
            text=True,
            timeout=timeout,
        )
    except (OSError, subprocess.TimeoutExpired):
        return None
    return proc.stdout or None


def load_aliases():
    """Load the user-defined uploader name mappings."""
    try:
        with ALIASES_FILE.open(encoding="utf-8") as handle:
            aliases = json.load(handle)
    except (OSError, json.JSONDecodeError):
        return {}
    return aliases if isinstance(aliases, dict) else {}


def parse_api_payload(raw):
    """Extract data{} from an API response, tolerating Markdown code fences."""
    if not raw or not raw.strip():
        return None
    start = raw.find("{")
    if start < 0:
        return None
    try:
        obj, _ = json.JSONDecoder().raw_decode(raw[start:])
    except (json.JSONDecodeError, ValueError):
        return None
    if not isinstance(obj, dict) or obj.get("code") not in (0, None):
        return None
    return obj.get("data") or None


def resolve_bv(text):
    """Extract a BV id directly, or by following a short link's redirects."""
    text = text or ""
    match = BV_RE.search(text)
    if match:
        return match.group(0)
    url_match = URL_RE.search(text)
    if url_match:
        url = url_match.group(0).rstrip(".,;，。、)]】>")
        effective = curl("-L", "-o", "/dev/null", "-w", "%{url_effective}", url)
        if effective:
            match = BV_RE.search(effective)
            if match:
                return match.group(0)
    return None


def fmt_duration(seconds):
    try:
        total = int(seconds)
    except (TypeError, ValueError):
        return ""
    if total < 3600:
        return f"{total // 60:02d}:{total % 60:02d}"
    return f"{total // 3600:d}:{total % 3600 // 60:02d}:{total % 60:02d}"


def fmt_pubdate(timestamp):
    try:
        return datetime.fromtimestamp(int(timestamp), CST).strftime("%Y-%m-%d %H:%M:%S")
    except (TypeError, ValueError, OSError, OverflowError):
        return ""


def build_result(bv, data):
    data = data or {}
    bv = data.get("bvid") or bv or ""
    owner = data.get("owner") or {}
    raw_uploader = owner.get("name") or ""
    uploader = load_aliases().get(raw_uploader, raw_uploader)
    return {
        "bvid": bv,
        "title": data.get("title") or "",
        "published_at": fmt_pubdate(data.get("pubdate")),
        "duration": fmt_duration(data.get("duration")),
        "uploader": uploader,
        "uploader_mid": owner.get("mid") or "",
        "url": f"https://www.bilibili.com/video/{bv}" if bv else "",
        "meta_complete": bool(data.get("title")),
    }


def render(result, as_json=False):
    if as_json:
        out = dict(result)
        if not result["meta_complete"]:
            out["hint"] = (
                "用 WebFetch 打开 "
                + API.format(bv=result["bvid"])
                + "，把返回的 JSON 通过 --from-json - 传回本脚本"
            )
        return json.dumps(out, ensure_ascii=False, indent=2)

    lines = [
        f"BV 号    : {result['bvid'] or '(未解析)'}",
        f"视频标题 : {result['title'] or '(未获取)'}",
        f"UP 主    : {result['uploader'] or '(未获取)'}"
        + (f"  (mid {result['uploader_mid']})" if result["uploader_mid"] else ""),
        f"发布时间 : {result['published_at'] or '(未获取)'}  (UTC+8)",
        f"视频时长 : {result['duration'] or '(未获取)'}",
        f"规范 URL : {result['url'] or '(未解析)'}",
    ]
    if not result["meta_complete"]:
        lines += [
            "",
            "[元数据未获取] 本机直连 api.bilibili.com 可能被网络策略拦截。",
            "下一步：用 WebFetch 打开以下 API 地址，再把返回内容通过",
            "`python3 resolve_bili.py --from-json -` 传回本脚本以补全字段：",
            API.format(bv=result["bvid"]),
        ]
    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(
        description="解析 B 站分享链接/b23.tv 短链/BV 号，输出视频标题、时间、UP 主与规范 URL"
    )
    parser.add_argument("input", nargs="?", help="分享文本、短链、完整视频 URL 或 BV 号")
    parser.add_argument(
        "--from-json",
        metavar="FILE",
        help="从文件、或 - (stdin) 读取 WebFetch 返回的 B 站 API JSON",
    )
    parser.add_argument("--json", action="store_true", help="以 JSON 格式输出")
    args = parser.parse_args()

    if args.from_json:
        if args.from_json == "-":
            raw = sys.stdin.read()
        else:
            with open(args.from_json, encoding="utf-8") as handle:
                raw = handle.read()
        data = parse_api_payload(raw)
        if not data:
            print("错误：--from-json 内容中未找到有效的 B 站 API data 对象", file=sys.stderr)
            return 1
        print(render(build_result(None, data), args.json))
        return 0

    if not args.input:
        parser.print_help()
        return 1

    bv = resolve_bv(args.input)
    if not bv:
        print(
            "错误：未能解析出 BV 号（支持 b23.tv 短链、完整视频 URL、BV 号）",
            file=sys.stderr,
        )
        return 1

    api_url = API.format(bv=bv)
    raw = curl(
        "-H",
        "User-Agent: Mozilla/5.0",
        "-H",
        "Referer: https://www.bilibili.com/",
        api_url,
    )
    print(render(build_result(bv, parse_api_payload(raw)), args.json))
    return 0


if __name__ == "__main__":
    sys.exit(main())
