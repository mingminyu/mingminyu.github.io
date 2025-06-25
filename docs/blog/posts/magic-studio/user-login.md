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

## 1. 登录流程



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

