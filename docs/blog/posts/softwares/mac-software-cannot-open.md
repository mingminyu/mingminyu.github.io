---
date: 2025-04-16
authors:
  - mingminyu
categories:
  - 软件工具
tags:
  - MAC
slug: mac-software-cannot-open
readtime: 2
---

# Mac软件安装后无法打开，提示已损坏

## 1. 通过命令打开权限

在终端中执行如下命令后，打开设置 -> 隐私与安全性 -> 安全性，会发现多了一个“任何来源”，此时再打开软件，就可以正常打开了。

=== "Sequoia"

    ```bash
    sudo spctl  --global-disable
    ```  

=== "其他"

    ```bash
    sudo spctl  --master-disable
    ```


## 2. 试一下另一种命令

如果上述情况不依然不行，则可以尝试以下命令，需要注意的是 `/Applications/DBeaverUltimate.app`需要替换成你安装的软件的路径。

```bash
sudo xattr -r -d com.apple.quarantine /Applications/DBeaverUltimate.app
```
