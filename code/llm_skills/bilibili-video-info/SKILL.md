---
name: bilibili-video-info
description: 把 B 站视频分享文本、b23.tv 短链、完整视频 URL 或 BV 号解析成规范视频信息，输出视频标题、发布时间与视频时长、UP 主名称，以及带 BV 号的规范视频 URL。当用户要求「提取 BV 号」「解析 B 站短链」「查这个视频的标题／UP 主／发布时间」，或需要把 B 站视频整理进文档、表格、Markdown 卡片时使用。关键词：B站、哔哩哔哩、bilibili、b23.tv、BV号、视频号、UP主、视频信息。
agent_created: true
---

# B 站视频信息解析

## Overview

把一个 B 站分享链接（常带「【标题-哔哩哔哩】」前缀）、`b23.tv` 短链、完整视频 URL 或裸 BV 号，转换成固定四要素：**视频标题、时间（发布时间 + 时长）、UP 主、带 BV 号的规范 URL**。该技能同时负责剥离短链跳转后附带的分享追踪参数、应用用户指定的 UP 主名称映射，输出可直接写入文档或表格的干净链接。

## 何时使用

- 用户给出 B 站链接并要求提取 BV 号 / 视频号。
- 用户询问某个 B 站视频的标题、UP 主、发布时间、时长。
- 需要把 B 站视频批量整理成清单、表格或文档卡片，且需要统一链接格式与 UP 主 tag。
- 用户给出的是 `b23.tv`、`bilibili.com/video/...?spmid=...` 等带参数的链接。

## 工作流程

### Step 1 — 解析链接并把整段分享文本交给脚本

优先执行 `scripts/resolve_bili.py`，把用户原文（含标题前缀、多余参数）**整段**作为位置参数传入，不需要手工清洗：

```bash
python3 ~/.workbuddy/skills/bilibili-video-info/scripts/resolve_bili.py "【手指发力技术教学-哔哩哔哩】 https://b23.tv/HlWsuVM"
```

脚本行为：正则命中裸 BV 号则直接采用；否则取原文中的 URL，用 `curl -L -w '%{url_effective}'` 跟随 302 跳转，从最终地址里提取 BV 号，并生成 `https://www.bilibili.com/video/<BV>`。加 `--json` 可输出机器可读结果。

### Step 2 — 补全元数据（标题 / 时间 / UP 主）

脚本会尝试请求公开接口 `https://api.bilibili.com/x/web-interface/view?bvid=<BV>`。若输出中出现「[元数据未获取]」，执行降级流程（本机常见，见「常见坑」）：

1. 用 **WebFetch** 打开输出里给出的 API 地址（注意：是 API 地址，不是视频页面 —— 视频页面通常只能拿到标题，拿不到 UP 主）。
2. 把 WebFetch 返回的 JSON 原文喂回脚本的 `--from-json`：

```bash
# 方式 A：管道传入 stdin
printf '%s' '<WebFetch 返回的 JSON 原文>' | python3 ~/.workbuddy/skills/bilibili-video-info/scripts/resolve_bili.py --from-json -

# 方式 B：先把 JSON 存成文件
python3 ~/.workbuddy/skills/bilibili-video-info/scripts/resolve_bili.py --from-json meta.json
```

脚本能容忍 Markdown 代码块包裹、前后多余文字，会自动定位第一个 JSON 对象并读取 `data`。字段映射与响应示例见 `references/bilibili_api.md`。

### Step 3 — 按固定字段输出结果

始终输出以下字段，缺失字段显式标注「未获取」，不要凭猜测补写：

| 字段 | 说明 |
|---|---|
| 视频标题 | `data.title` |
| 发布时间 | `data.pubdate`（Unix 秒 → UTC+8，`YYYY-MM-DD HH:MM:SS`） |
| 视频时长 | `data.duration`（秒 → `mm:ss`，超过 1 小时用 `h:mm:ss`） |
| UP 主 | `data.owner.name` **经名称映射后**的写法，可附 `data.owner.mid` |
| 规范 URL | `https://www.bilibili.com/video/<BV>`，不含任何查询参数 |
| BV 号 | 一并给出，便于文档引用 |

「时间」同时给发布时间与时长两项，避免歧义。用户只要其中一项时，按需省略另一项。

### Step 4 — UP 主名称映射（强制）

输出视频信息、写入文档卡片或任何面向用户的文本时，**直接把下列 B 站账号名替换为指定写法**，不要保留原名、不要在括号里附原名、不要额外解释：

| B 站账号名 | 输出写法 |
|---|---|
| `羽球小宋老师` | `小宋老师` |
| `广益羽球` | `黄广益` |

映射表存于 `scripts/uploader_aliases.json`，脚本会自动读取并应用，因此脚本输出本身就是映射后的名字，直接拿来用即可。新增或修改映射时只编辑该 JSON，不要改动脚本逻辑，也不要在 SKILL.md 里另写一份规则。

### Step 5 — 写入文档时（可选）

需要把视频加进 Zensical / MkDocs 文档时，使用统一的卡片格式，UP 主名保持与站内已有 tag 一致（映射后的写法即站内约定写法）：

```markdown
-   :fontawesome-brands-bilibili:{ .bl } [视频标题](https://www.bilibili.com/video/<BV>) &nbsp; `UP主`{.md-tag}

    ---
    **动作要点**：
```

「动作要点」在没看过视频内容时留空，不要编造。

## 常见坑

- `b23.tv/<id>` 是 302 短链，跳转后的地址带 `buvid` / `spmid` / `timestamp` / `unique_k` / `up_id` 等分享追踪参数；**只保留 BV 号**，其余一律丢弃。
- BV 号格式为 `BV` + 10 位字母数字（共 12 字符），正则用 `BV[0-9A-Za-z]{10}`。
- 本机 `curl` 直连 `api.bilibili.com` / `www.bilibili.com` 可能被网络策略拦截（空响应或 `SSL_ERROR_SYSCALL`），但 `b23.tv` 可通、WebFetch 可通 API；因此 Step 2 的降级流程是常规路径而非异常，遇到即按流程走，不要反复重试直连。
- `data.pubdate` 是 Unix 秒，`data.duration` 是秒；竖屏短视频（`is_story: true`）同样有这两个字段。
- B 站 API 返回 `code != 0`（如 `-404` 视频不存在）时，脚本会判定元数据缺失，此时如实告知用户，不要编造标题或 UP 主。
- B 站账号名与站内 tag 写法常常不同；一律按 Step 4 的映射表输出，不要临时判断或保留原始账号名。

## Resources

- `scripts/resolve_bili.py` — 链接解析、BV 提取、元数据获取与格式化输出（可直接执行，无需读入上下文）。
- `scripts/uploader_aliases.json` — 用户指定的 UP 主名称映射表，脚本自动读取；新增映射只改此文件。
- `references/bilibili_api.md` — B 站公开接口字段映射、响应示例、错误码与网络降级说明。
