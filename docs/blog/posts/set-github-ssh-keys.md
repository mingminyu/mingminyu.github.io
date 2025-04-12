---
date: 2025-04-12
authors:
  - mingminyu
categories:
  - Git
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

不要用 rsa



