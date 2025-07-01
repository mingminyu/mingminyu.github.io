---
date: 2025-07-01
authors:
  - mingminyu
categories:
  - 软件工具
tags:
  - Mkdocs
slug: mkdocs-config-custom-domain-for-github-page
readtime: 2
---

# Material-Mkdocs 配置 Github Page 自定义域名


## 问题汇总

### 1. 配置域名失效

在访问自己仓库域名时，我们自己有域名的情况下，可以给站点配置一个自定义域名。但奇怪的是，我们配置完后就每次提交更改后配置的域名就失效了，必须得重新配置一次才可以。

这是因为每次在 Custom domain 添加后都会给我们生成一个 CNAME 的文件，但是因为项目我们没有 pull 到本地，所以造成了，每次 push 之后 CNAME 信息被情动了。

解决办法很简单，在 `/docs` 目录下新建一个 `CNAME` 文件（注意是 `/docs` 目录不是根目录），并写入自己的域名：

```bash linenums="1" title="docs/CNAME"
www.xxx.com
```
