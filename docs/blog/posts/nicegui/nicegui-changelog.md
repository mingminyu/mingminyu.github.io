---
date: 2025-06-13
authors:
  - mingminyu
categories:
  - WEB开发
tags:
  - NiceGUI
slug: nicegui-change-log
readtime: 5
---

# NiceGUI更新日志

| 日期 | 版本号 | 新特性 | BUG修复 | 
| --- | --- | --- | --- |
| 20250602 | 2.19.0 | 1.针对现代浏览器，通过跳过ES模块提升页面加载速度； <br> 2.通过延缓非重要的 JS 提升页面加载速度；<br>3.完善 `ui.aggrid` 完全配置（`getters`、`setters`、`from_pandas`、`from_polars`）;<br>4.如果 `ui.download.from_url` 是基于绝对路径 URL（可能引起问题） 被调用，则会发出警告提示 | 1.允许覆盖 PyWebview 的 `storage_path` 和 `private_mode`；<br>2.修复 `ui.markdown` 的语法突出显示，包括 codehilite.css 更稳定 |
