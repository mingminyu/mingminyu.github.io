# B 站视频信息接口参考

## 公开接口

```
GET https://api.bilibili.com/x/web-interface/view?bvid=<BV号>
```

也可用 `?aid=<aid>`。无需登录态即可读取公开视频的基本信息。请求时建议带：

```
User-Agent: Mozilla/5.0
Referer: https://www.bilibili.com/
```

## 字段映射

| 输出字段 | JSON 路径 | 类型 / 说明 |
|---|---|---|
| BV 号 | `data.bvid` | 字符串，`BV` + 10 位字符 |
| 视频标题 | `data.title` | 字符串 |
| 发布时间 | `data.pubdate` | Unix 秒（东八区展示用 `UTC+8`） |
| 视频时长 | `data.duration` | 秒（整数） |
| UP 主 | `data.owner.name` | 字符串 |
| UP 主 ID | `data.owner.mid` | 整数 |
| 封面 | `data.pic` | URL |
| 简介 | `data.desc` | 字符串 |
| 分 P 数 | `data.videos` | 整数；多 P 时各 P 信息在 `data.pages[]` |
| 是否竖屏短视频 | `data.is_story` | 布尔；不影响上述字段 |

顶层 `code == 0` 表示成功；`code` 为 `-404`（视频不存在）、`-403`（权限不足）、`62002`（稿件不可见）等时，`data` 为空或不存在，必须如实报告。

## 精简响应示例

```json
{
  "code": 0,
  "message": "OK",
  "data": {
    "bvid": "BV1grWu6zEZ7",
    "title": "手指发力技术教学",
    "pubdate": 1794315600,
    "duration": 101,
    "desc": "手指发力技术教学",
    "is_story": true,
    "owner": { "mid": 695949856, "name": "广益羽球" },
    "pages": [ { "page": 1, "part": "手指发力技术教学", "duration": 101 } ]
  }
}
```

对应输出：标题「手指发力技术教学」、发布时间 `2026-11-10 21:00:00`（UTC+8）、时长 `01:41`、UP 主「广益羽球」、规范 URL `https://www.bilibili.com/video/BV1grWu6zEZ7`。

## 短链与链接形态

| 输入形态 | 处理方式 |
|---|---|
| `【标题-哔哩哔哩】 https://b23.tv/HlWsuVM` | 正则取 URL → 跟随 302 → 提取 BV |
| `https://b23.tv/HlWsuVM` | 同上 |
| `https://www.bilibili.com/video/BV1grWu6zEZ7?spmid=...` | 直接正则命中 BV，丢弃查询串 |
| `BV1grWu6zEZ7` | 直接采用 |
| `https://bilibili.com/video/av<aid>` | 无 BV 号时用 API 的 `?aid=<aid>` 换取 `data.bvid` |

`b23.tv` 跳转后的完整地址示例（参数必须全部丢弃）：

```
https://www.bilibili.com/video/BV1grWu6zEZ7?buvid=...&is_story_h5=false&p=1&share_source=COPY&spmid=...&timestamp=...&unique_k=HlWsuVM&up_id=695949856
```

## 网络降级

本机直连 `api.bilibili.com` 与 `www.bilibili.com` 常失败（`SSL_ERROR_SYSCALL` 或 0 字节响应），而 `b23.tv` 短链解析正常。此时改用 WebFetch 打开 API 地址获取 JSON，再通过脚本 `--from-json -` 格式化。WebFetch 打开视频页面通常只能拿到 `<title>`，无法拿到 UP 主，因此务必使用 API 地址。

脚本 `--from-json` 会跳过首个 `{` 之前的所有内容，可容忍 Markdown 代码块围栏与前后说明文字。
