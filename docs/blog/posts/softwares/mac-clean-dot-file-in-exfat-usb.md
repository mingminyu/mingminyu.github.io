---
date: 2025-04-07
authors:
  - mingminyu
categories:
  - 软件工具
tags:
  - ExFAT
slug: mac-clean-dot-file-in-exfat-usb
readtime: 2
---

# Mac 删除 ExFAT USB 存储设备中的 ._ 文件

当你在 macOS 系统上使用 exFAT 文件系统的 U 盘或硬盘 时，会发现每个文件或文件夹旁边都会多出一个以 `._` 开头的隐藏文件（如 `._example.txt`）。这是正常现象，背后是 MacOS 的一个设计机制，用来扩展元数据。

<!-- more -->

使用 Linux 的 `find` 命令手动或批量删除这些文件：

```bash
find /Volumes/your_usb -name "._*" -delete
```

此外更推荐使用 `dot_clean`  工具全盘删除 `._` 文件：

```bash title="推荐"
dot_clean /Volumes/your_usb
```
