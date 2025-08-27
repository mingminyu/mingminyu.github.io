---
date: 2025-08-27
authors:
  - mingminyu
categories:
  - 版本控制
slug: git_faqs
readtime: 2
---

# Git 常见问题

## 1. 连接GITHUB服务失败

最近在使用 `git` 时，发现 `git pull` 时经常会出现下面的报错 `kex_exchange_identification: Connection closed by remote host`，导致无法正常拉取代码。

```bash
$ git pull
kex_exchange_identification: Connection closed by remote host
Connection closed by 192.30.255.113 port 22
fatal: Could not read from remote repository.
 
Please make sure you have the correct access rights
and the repository exists.
```

<!-- more -->

这种情况主要是因为网络代理导致的，一些代理服务商为了安全考虑，避免被人当作跳板，会主动拒绝 22 端口的连接，导致无法正常连接到 Github 的服务器。

常规的解决办法有如下几种：

- 临时关闭代理
- 修改代理软件配置，22 端口走直连
- 改用 HTTPS 协议，走 443 端口

个人最推荐的办法是改用 HTTPS 协议，走 443 端口，因为这样不仅可以解决上面的问题，还可以通过代理提高下载速度。

```bash linenums="1" title="~/.ssh/config"
Host github.com
    Hostname ssh.github.com
    Port 443
    User git
```

在 `~/.ssh/config` 文件中添加下面的配置即可，之后就可以正常使用 `git pull` 等操作了。

