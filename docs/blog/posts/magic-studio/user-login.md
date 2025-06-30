---
date: 2025-06-25
authors:
  - mingminyu
categories:
  - 前端开发
tags:
  - NextJS
  - MagicStudio
slug: magic_studio_user_login
readtime: 2
---

# Magic Studio开发者日志：用户登录

登录页面是用户使用平台的入口，如果一个平台连登录页面都做得极其 low，那么用户体验会非常差，甚至都不会有想要使用的欲望。此外，看似非常简单的登录流程，实际上也是麻雀虽小，五脏俱全，方方面面都会涉及到。本篇文章我们着手开发 Magic Studio 的用户登录功能，千里之堤始于足下，开干。

<!-- more -->

## 1. 原型设计

### 1.1 登录流程


### 1.2 登录页面

一个优秀的登录页面除了具备基础的登录窗口外，还应该有比较体现平台特性的背景图片，还应该需具备如下功能：

1. 登录成功后，跳转到用户主页；
2. 登录失败后，显示错误信息；
3. 登录成功后，保存用户信息、Cookie 以及 Token，以便下次登录时自动登录。

## 2. 创建项目

我们使用 Git 以及 GitHub 对项目代码做版本控制，在 Github 上创建好项目并克隆到本地，终端下进入项目文件夹下使用如下命令创建 NextJS 项目。需要注意的是，你需要先安装最新版本的 Node.js，以及项目文件夹下为空文件夹。

```bash
npx create-next-app@latest .
```

过程中会提示你选择项目的一些选项设置（以下是我的选项）：

![项目选项](https://mingminyu.github.io/webassets/images/magic-studio/01.png)

创建好项目后，执行命令 `npm run dev` 启动项目，访问 `http://localhost:3000`，可以看到项目启动成功，并显示如下界面，这也是 NextJS 默认项目模板。

![初始界面](https://mingminyu.github.io/webassets/images/magic-studio/02.png)

因为这里面的一些文件都是 NextJS 默认生成的，很多内容和文件都是我们不需要的，你可以删除掉 `public` 文件下的所有内容。此外，`app/page.tsx` 中默认内容我们也不需要，保持如下内容即可，其余都可以删掉。

```tsx linenums="1" title="app/page.tsx"
export default function Home() {
  return (
    <div className="h-screen justify-center text-8xl self-center flex items-center">
    Welcome to Magic Studio
    </div>
  );
}
```

此外，我们使用 ShadcnUI 以及 Lucide-React 作为前端页面和图标组件，这两个个组件库非常优秀，整个项目可能会用到以下组件库：

```bash linenums="1"
npx shadcn@latest add card separator button input form tabs
npm install lucide-react
```


### 2.1 GoogleFont字体问题

```bash linenums="1"
Error while requesting resource
There was an issue establishing a connection while requesting https://fonts.googleapis.com/css2?family=Geist+Mono:wght@100..900&display=swap.
```

正常启动服务后，查看终端信息，你会发现上面提示信息：

```tsx linenums="1" title="app/layout.tsx"
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
```

这个主要是国内使用谷歌字体的时候，会因为网络问题导致无法访问，一个解决办法就是讲字体下载到本地，并改用 `next/font/local`。

```tsx linenums="1" title="app/layout.tsx" hl_lines="4-7"
import localFont from 'next/font/local';
import type { Metadata } from "next";
import "./globals.css";

const geistSans = localFont({
  src: "../public/fonts/Geist-Regular.ttf",
  display: "swap",
});

const geistMono = localFont({
  src: "../public/fonts/GeistMono-Regular.ttf",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans} ${geistMono} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
```

### 2.2 Logo组件

我们从 iconfont 上找了 Magic 图标（建议使用 SVG 文件）作为平台的 Logo，并封装成一个可用的组件。

```tsx linenums="1" title="components/Logo.tsx"
import React from "react";

export default function Logo({className}: {className?: string}) {
  return (
    <svg
      className={className || "icon"}
      viewBox="0 0 1024 1024"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      p-id="6766"
      width="64"
      height="64"
    >
    ...
    </svg>
  )
}
```

### 2.3 更改站点的Metadata和图标

接下来我们需要把站点的 Metadata 进行更改，以保证打开页面时候的标题不是默认标题。

```tsx linenums="1" title="app/layout.tsx"
export const metadata: Metadata = {
  title: "Magic Studio",
  description: "Make building a ML model easily",
};
```

同样将 iconfont 下载的 png 图片保存为 favicon.ico，并替换 `apps` 目录下的同名文件。

## 3. 登录页面

我们在 `app` 文件夹下创建 `(auth)/login` 文件夹，并在里面创建 `page.tsx` 文件，内容如下：

```tsx linenums="1" title="app/(auth)/login/page.tsx"
export default function Page() {
  return (
    <div>LoginPage</div>
  )
}
```

### 3.1 登录页面的背景图

为了让我们的登录页面看起来更有逼格，体现出来平台灵活调度、自动化程度高等特性，。我们用 Windmill 官网上的 SVG 作为宣传图，并封装到 `app/(auth)/login/_components/MagicStudioOverview.tsx`。

### 3.3 登录页面

登录表现

![](https://mingminyu.github.io)

### 3.2 登录页面的模板

我们希望


## 4. 注册页面

我们在 `app` 文件夹下创建 `(auth)/register` 文件夹，并在里面创建 `page.tsx` 文件，内容如下：

```tsx linenums="1" title="app/(auth)/register/page.tsx"
export default function Page() {
  return (
    <div>RegisterPage</div>
  )
}
```
