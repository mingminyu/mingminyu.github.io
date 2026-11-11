# 项目长期记忆：mingminyu.github.io（M2Note）

## 站点技术栈
- Zensical 静态文档站（原生 `zensical.toml`，无 `mkdocs.yml`）；`site_name = "M2Note"`，`site_url = https://mingminyu.github.io`，`language = "zh"`，`custom_dir = "overrides"`。
- 内容全在 `docs/`，2026-11-10 盘点：361 个 md（docs 下 360 + 根 README.md 为空），nav 引用 204 条且全部有效，156 篇未列导航（其中 25 篇 blog/posts 由 blog 插件管理，119 篇为 5 本整本书未挂载）。
- 已启用 20 个 theme.features、24 个 markdown_extensions、tags + blog 插件；`overrides/` 有 main.html / login.html / rand_group.html 与自定义图标。
- **md 文档的展示/编写走 Zensical Studio**：VS Code 扩展（本机 `~/.vscode/extensions/zensical.zensical-studio-0.3.2`），编辑器内 Markdown Preview 实时预览 + Formatter + Linter。写 md 以 Studio 的 Python Markdown 解析为准（`!!!` admonition、代码块、frontmatter 不进正文等）；Studio Preview 是 project-aware 的快速编写视图，不复制主题 JS / 插件 / 自定义运行时，`zensical build` / `serve` 仅用于发布前验证最终主题与站点行为。
- **WorkBuddy 里不能直接跑 Zensical Studio**：Studio 是 VS Code 扩展（`dist/extension.js` 依赖扩展宿主与 webview，无独立 CLI）；WorkBuddy 不是 VS Code 内核（app.asar 无 `extensionsGallery` / 扩展宿主），自带 md 预览是通用 markdown-it，不解析 `!!!`、`==mark==`。要在 WorkBuddy 内看渲染，把 `zensical serve` 的 localhost URL 交给 `present_files` 用内置浏览器打开（完整站点主题）；Studio 原生预览只能在 VS Code 中用。本机 8000 端口常有现成的站点预览服务，可直接复用。

## 重要约定 / 坑
- **`zensical.toml` 的 nav 是跨多行的内联表**：Zensical 解析器接受，但 Python `tomllib` 解析会失败。写脚本处理配置时不要用 tomllib，用正则或先规范化。
- `navigation.indexes` 与 `toc.integrate` 互斥；`navigation.prune` 与 `navigation.expand` 互斥，项目已开前者组合，勿改。
- Zensical 没有 `zensical preview` 子命令，预览用 `zensical serve`；发布走 CI 的 `zensical build --clean`；strict 校验用 `--strict`。
- 搜索语言从 `theme.language` 派生，不要搬 MkDocs 的 `lang` / `pipeline`；调中文分词用 `[project.plugins.search] separator`。
- `[project.extra.status]` 目前是空表，要用页面 status 需先定义映射；新增 tags 需同步 `[project.extra.tags]` 与 `[project.theme.icon.tag]`。
- B 站视频卡片的 UP 主 tag 一律用映射后的名称：`羽球小宋老师`→`小宋老师`、`广益羽球`→`黄广益`；映射表在用户级技能 `~/.workbuddy/skills/bilibili-video-info/scripts/uploader_aliases.json`，脚本自动应用。
- **写 `!!!` admonition**：标题行后空一行，正文 4 空格缩进，**不得用 ``` 代码块包裹**；代码块内 `**加粗**` 不生效，需要加粗就用普通正文/缩进块。2026-11-07 那篇 `blog/posts/贝希英语/261107.md` 曾因被格式化成代码块出问题，已按此规则修正。
- 文档常在 VS Code / Zensical Studio 里被顺手格式化（表格对齐、`<br />`、引用块等），**编辑前必须重新读取文件最新内容**，不要按上一次写入的快照做整文件覆盖；用局部替换保留用户改动。

## 参考资料（后续写文档先查这里）
- **Zensical 官方全量离线参考库**：`/Users/yumm/.workbuddy/zensical-reference/`
  - `README.md` 索引与 54 页清单；`M2Note-PROJECT.md` 是本项目现状对照 + 优化建议（优先读）
  - `official/` 54 页官网 Markdown 原文（2026-11-10 抓取，官网生成器 zensical-0.1.0）
  - `notes/` 四份中文精读笔记：authoring.md（写作语法）、setup.md（配置）、compatibility.md（扩展/迁移/插件）、basics.md（CLI/构建/发布）
  - 刷新方式见 README「更新这份参考库」。
- 用户偏好：写文档/汇报偏好极简文字、密集图表与关键数值；本项目文档改动前先确认范围，不擅自批量改正文。
