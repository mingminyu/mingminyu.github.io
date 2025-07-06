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

# Magic Studio开发者日志：页面布局

![](https://mingminyu.github.io/webassets/images/magic-studio/04.png)

一个好的站点应该有一个好的页面布局，这利于页面能承载更多我们想要的内容，这里我们参考了 [Shadcn Blocks](https://ui.shadcn.com/blocks) 上的模板布局，并给 Shadcn 非常友好地给了详细代码。

除登录和注册页外，我们主体布局是支持整个平台各页面的，所以新建 `app/(main)` 文件夹，且布局并非是一个通用组件，所以不必放根目录下的 `components` 目录下。

<!-- more -->

## 1. 侧边栏

侧边栏的左上角会放 Logo 和平台名称，下面会放路由菜单以及子菜单项，一级菜单需要可折叠，并且支持菜单项能根据当前路由高亮。此外，针对不同用户的权限，我们的菜单的可见性也不一样。

### 1.1 Logo及平台名称

我们先实现一个 Logo 和平台名称，这个相对比较简单。

```tsx linenums="1" title="app/(main)/_components/AppSidebar.tsx"
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
import Logo from "@/components/Logo";
import Link from "next/link";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/" className="flex items-center gap-2">
                <div className="flex aspect-square size-6 items-center justify-center rounded-sm text-sidebar-primary-foreground">
                  <Logo />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="h-full truncate font-semibold text-lg self-center items-center">Magic Studio</span>
                </div>
              </Link>
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

### 1.2 侧边栏路由菜单




## 2. 顶部导航栏

![](file:///Users/yumm/websites/webassets/images/magic-studio/05.png)

接下来我们添加顶部导航栏，值得一提的是，收起/展开侧边栏面板的按钮放在顶部，并且用户信息我们放在顶部导航栏去，大多数的主流页面也是这么设计的。此外，我们还会放置用户头像（支持下拉菜单，显示用户名以及退出登录按钮），消息提醒数量以及面包屑导航。

```tsx linenums="1" title="app-header.tsx"
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BellIcon, LogOut, Sparkles, UserPen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
// import { signOut } from "next-auth/react";
import { signOut } from "@/auth";

// 实现用户信息的展示
export function HeaderUser() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="size-8 rounded-full">
          <AvatarImage src="/avatar/default-user.png" alt="" />
          <AvatarFallback className="rounded-lg">CN</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="min-w-40 rounded-lg"
        side="bottom"
        align="end"
        sideOffset={4}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar className="h-9 w-9 rounded-lg">
              <AvatarImage src="/avatar/default-user.png" alt="" />
              <AvatarFallback className="rounded-lg">CN</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">郁明敏</span>
              <span className="truncate text-sm text-primary/70">管理员</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Sparkles />
            升级会员
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <UserPen />
            个人中心
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer" onClick={async () => {
            "use server"
            await signOut()  // 实现登出
            }
          }>
          <LogOut  />
          退出登录
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// 实现消息提醒：支持传参消息数量
export function HeaderInformMessages({ messageNum }: { messageNum: number }) {
  return (
    <div className="relative inline-block">
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        aria-label="Notifications"
      >
        <BellIcon size={16} aria-hidden="true" />
        {messageNum > 0 && (
          <Badge className="rounded-full absolute -top-1 left-full w-5 h-5 -translate-x-2/3 px-1 bg-red-500">
            {messageNum >= 99 ? "99" : messageNum}
          </Badge>
        )}
      </Button>
    </div>
  );
}

// 实现顶部导航栏的面包屑导航
export function HeaderBreadcrumb() {

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className="hidden md:block">
          <BreadcrumbLink href="#">TODO1</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator className="hidden md:block" />
        <BreadcrumbItem>
          <BreadcrumbPage>TODO2</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}

// 顶部导航栏组件
export default function AppHeader() {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="w-full flex-row flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
        <div className="w-full flex justify-between self-center items-center">
          <HeaderBreadcrumb />
          <div className="flex gap-2 justify-center items-center self-center">
            <HeaderInformMessages messageNum={100} />
            <HeaderUser />
          </div>
        </div>
      </div>
    </header>
  );
}
```
