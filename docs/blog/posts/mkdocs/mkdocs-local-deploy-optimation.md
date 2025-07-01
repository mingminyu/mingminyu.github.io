---
date: 2025-04-07
authors:
  - mingminyu
categories:
  - 软件工具
tags:
  - Mkdocs
slug: mkdocs-local-deploy-optimation
readtime: 2
---

# Material-Mkdocs 本地部署优化

使用 Material Mkdocs 搭建了一个 Wiki 文档，部署环境为离线的 Linux 环境，尝试过 `mkdocs serve` 以及使用 HTTP 服务部署，但都存在一个问题是打开首页加载及其缓慢，可能需要两三分钟，且重新打开一个标签页依然加载缓慢。

本篇文档我们记录下如何优化离线环境下 Material Mkdocs 的部署，优化页面加载速度。

<!-- more -->

## 1. 禁用 Google Font

默认情况下，Material Mkdocs 会从 Google Fonts 加载字体，但是由于网络问题，加载速度很慢。我们可以通过修改 `mkdocs.yml` 文件来禁用 Google Fonts。

```yaml linenums="1"
theme:
  font: false
```

## 2. 禁用 offline 插件

如果你使用了 office 插件，mkline 默认会从 unpkg.com 加载 iframe-worker 的 shim 脚本，因为离线环境下网络问题，也导致尝试时间过长，强烈建议关闭此插件。此外，如果你已经使用 `mkdocs build` 生成了静态文件，那么需要在 `site/index.html` 文件中找到对应的 iframe-worker 取消或删除掉。
