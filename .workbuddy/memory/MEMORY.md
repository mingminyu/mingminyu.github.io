# 项目长期记忆：mingminyu.github.io（M2Note）

## 站点技术栈
- Zensical 静态文档站（原生 `zensical.toml`，无 `mkdocs.yml`）；`site_name = "M2Note"`，`site_url = https://mingminyu.github.io`，`language = "zh"`，`custom_dir = "overrides"`。
- 内容全在 `docs/`，2026-11-10 盘点：361 个 md（docs 下 360 + 根 README.md 为空），nav 引用 204 条且全部有效，156 篇未列导航（其中 25 篇 blog/posts 由 blog 插件管理，119 篇为 5 本整本书未挂载）。
- 已启用 20 个 theme.features、24 个 markdown_extensions、tags + blog 插件；`overrides/` 有 main.html / login.html / rand_group.html 与自定义图标。

## 重要约定 / 坑
- **`zensical.toml` 的 nav 是跨多行的内联表**：Zensical 解析器接受，但 Python `tomllib` 解析会失败。写脚本处理配置时不要用 tomllib，用正则或先规范化。
- `navigation.indexes` 与 `toc.integrate` 互斥；`navigation.prune` 与 `navigation.expand` 互斥，项目已开前者组合，勿改。
- Zensical 没有 `zensical preview` 子命令，预览用 `zensical serve`；发布走 CI 的 `zensical build --clean`；strict 校验用 `--strict`。
- 搜索语言从 `theme.language` 派生，不要搬 MkDocs 的 `lang` / `pipeline`；调中文分词用 `[project.plugins.search] separator`。
- `[project.extra.status]` 目前是空表，要用页面 status 需先定义映射；新增 tags 需同步 `[project.extra.tags]` 与 `[project.theme.icon.tag]`。

## 参考资料（后续写文档先查这里）
- **Zensical 官方全量离线参考库**：`/Users/yumm/.workbuddy/zensical-reference/`
  - `README.md` 索引与 54 页清单；`M2Note-PROJECT.md` 是本项目现状对照 + 优化建议（优先读）
  - `official/` 54 页官网 Markdown 原文（2026-11-10 抓取，官网生成器 zensical-0.1.0）
  - `notes/` 四份中文精读笔记：authoring.md（写作语法）、setup.md（配置）、compatibility.md（扩展/迁移/插件）、basics.md（CLI/构建/发布）
  - 刷新方式见 README「更新这份参考库」。
- 用户偏好：写文档/汇报偏好极简文字、密集图表与关键数值；本项目文档改动前先确认范围，不擅自批量改正文。
