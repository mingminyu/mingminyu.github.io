---
date: 2025-07-01
authors:
  - mingminyu
categories:
  - 前端开发
tags:
  - NextJS
  - MagicStudio
slug: magic_studio_user_login
readtime: 20
---

# 页面布局

![](https://mingminyu.github.io/webassets/images/magic-studio/04.png)

一个好的站点应该有一个好的页面布局，这利于页面能承载更多我们想要的内容，这里我们参考了 [Shadcn Blocks](https://ui.shadcn.com/blocks) 上的模板布局，并给 Shadcn 非常友好地给了详细代码。

除登录和注册页外，我们主体布局是支持整个平台各页面的，所以新建 `app/(main)` 文件夹，且布局并非是一个通用组件，所以不必放根目录下的 `components` 目录下。

## 1. 侧边栏

```tsx linenums="1" title="app/(main)/_components/AppSidebar.tsx">
"use client";

import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Logo from "@/components/Logo";  // 自定义 Logo 组件

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-sm text-sidebar-primary-foreground">
                  <Logo className="w-16" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold ">Magic Studio</span>
                  <span className="truncate text-xs text-muted-foreground">
                    xxxx公司
                  </span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        TODO
      </SidebarContent>
      <SidebarFooter></SidebarFooter>
    </Sidebar>
  );
}
```

## 2. 顶部导航栏

接下来我们添加顶部导航栏，值得一提的是，收起/展开侧边栏面板的按钮放在顶部，并且用户信息我们放在顶部导航栏去，大多数的主流页面也是这么设计的。

```tsx linenums="1" title="app-header.tsx"

```
