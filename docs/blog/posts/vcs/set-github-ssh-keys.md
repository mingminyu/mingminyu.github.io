---
date: 2025-04-12
authors:
  - mingminyu
categories:
  - 版本控制
tags:
  - SSH
slug: set_github_ssh_keys
readtime: 2
---

# 设置 SSH Keys

```bash
ssh-keygen -t ed25519 -C "$(whoami)@$(hostname)"
ssh -T git@github.com
```

!!! warning "注意"
  
    很多教程上使用的还是 RSA，实际添加密钥后仍然无法成功连接 Github，建议使用 ED25519。


此外，如果需要提交更改，是需要设置 GIT 配置信息：

```bash
git config --global user.email "you@example.com"
git config --global user.name "Your Name"
```
