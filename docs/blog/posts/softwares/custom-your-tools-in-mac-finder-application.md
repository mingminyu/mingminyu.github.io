---
date: 2025-06-26
authors:
  - mingminyu
categories:
  - 软件工具
tags:
  - Mac
  - Finder扩展
slug: simplest-build-bigdata-dev-envs
readtime: 10
---

# 在 Mac Finder 中添加自定义工具

Mac 上访达应用虽然很好用，但没有像 Windows 下的右键菜单一样方便，例如我们可以右键直接在当前文件夹下打开终端。我们可以借助一些第三方工具来实现针对访达的功能扩展，从而使得我们操作更轻松。

<!-- more -->

## 1. 配置终端工具

> 参考文档：https://github.com/Ji4n1ng/OpenInTerminal/blob/master/Resources/README-Config-zh.md


从 MacOS 15 开始，Apple 从系统设置中移除了 Finder 同步扩展的配置。要启用 Finder 扩展，可以使用 `pluginkit` 命令行工具，如下所示：

```bash
pluginkit -mAD -p com.apple.FinderSync -vvv
```

会看到类似以下的输出：

```bash
wang.jianing.app.OpenInTerminal.OpenInTerminalFinderExtension(2.3.5)
           Path = /Applications/OpenInTerminal.app/Contents/PlugIns/OpenInTerminalFinderExtension.appex
           UUID = F2547F13-4E43-4E88-9D8F-56DF05C020D8
      Timestamp = 2024-09-17 09:34:07 +0000
            SDK = com.apple.FinderSync
  Parent Bundle = /Applications/OpenInTerminal.app
   Display Name = OpenInTerminalFinderExtension
     Short Name = OpenInTerminalFinderExtension
    Parent Name = OpenInTerminal
       Platform = macOS
```

要手动启用 Finder 扩展，请使用输出中的 UUID 运行以下命令：

```bash
pluginkit -e "use" -u "F2547F13-4E43-4E88-9D8F-56DF05C020D8"
```

此外，您也可以使用一个名为 [FinderSyncer](https://zigz.ag/FinderSyncer/) 的图形界面工具来启用扩展。

!!! note "MacOS14之前版本"

    对于 MacOS 14 及更早版本，请确保通过系统偏好设置启用了 Finder 扩展：打开 OpenInTerminal 应用 ➔ “系统偏好设置 -> 扩展 -> Finder 扩展” ➔ 勾选 OpenInTerminalFinderExtension 旁的复选框。

