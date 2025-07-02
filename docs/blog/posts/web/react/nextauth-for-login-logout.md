---
date: 2025-07-01
authors:
  - mingminyu
categories:
  - 前端开发
tags:
  - NextJS
slug: nextauth-for-login-logout
readtime: 2
---

# NextAuth 实现登录登出

> 原文地址：https://mp.weixin.qq.com/s/MC_MVKXA9JzLnYh2n2Chnw

## 1. 环境搭建

### 1.1 创建项目

使用以下命令创建一个新的 Next.js 项目:

```bash 
npx create-next-app@latest
```

本项目采用以下技术栈：TypeScript、Tailwind CSS、src/ 目录结构、App Router 方案。

<!-- more -->

### 1.2 安装依赖

安装 NextAuth beta 版：

```bash
npm install next-auth@beta
```

确保 package.json 中的版本号不低于 `^5.0.0-beta.4`。

### 1.3 生成密钥

使用 openssl 生成认证密钥：

```bash
openssl rand -base64 32
```

!!! warning "注意"
    
    该密钥需要妥善保管，不要提交到代码仓库中。

### 1.4 配置环境变量

创建 `.env` 文件并添加认证密钥，记得将 `.env` 添加到 `.gitignore` 中。

```bash title=".env"
AUTH_SECRET=你的密钥
```

## 2. 项目结构

在基础的 Next.js 项目中需要新增以下文件：

```bash title="项目结构" hl_lines="5-7"
src/
  ├── app/
  │   └── login/        # 登录页面
  ├── lib/             # 工具函数
  ├── auth.config.ts   # 认证配置
  ├── auth.ts          # NextAuth 配置
  └── middleware.ts    # 中间件配置
```

## 3. 页面实现


=== "登录页面"

      ```tsx title="src/app/login/page.tsx" linenums="1"
      "use client"

      export default function Page() {
        return (
          <div>
            <h1>Log in Page</h1>
            <form className="flex flex-col">
              <input className="bg-blue-300 text-black" name="id" />
              <input 
                className="bg-yellow-300 text-black" 
                name="password" 
                type="password"
              />
              <button>Log In</button>
            </form>
          </div>
        )
      }
      ```

=== "Home 页面"

      ```tsx title="src/app/page.tsx" linenums="1"
      export default async function Home() {
        return (
          <div>
            <h1>Home Page</h1>
            <h2>Unavailable without auth</h2>
            <form>
              <button>Log Out</button>
            </form>
          </div>
        )
      }
      ```

使用 `npx next dev` 或 `npm run dev` 或 `yarn` 运行应用程序。

## 4. 权限认证配置

### 4.1 用户类型定义

```ts title="src/lib/definitions.ts" linenums="1"
export type User = {
    id: string
    email: string
    name: string
};
```

### 4.2 认证配置

```ts title="src/auth.config.ts" linenums="1"
import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnProtected = !nextUrl.pathname.startsWith('/login');
      
      if (isOnProtected) {
        if (isLoggedIn) return true;
        return false; // 重定向到登录页
      } else if (isLoggedIn) {
        return Response.redirect(new URL('/', nextUrl));
      }
      return true;
    },
  },
  providers: [], 
};
```

### 4.3 NextAuth 初始化

```ts title="src/auth.ts" linenums="1"
import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';

export const { signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        if (credentials.id && credentials.password) {
          // 这里添加实际的登录逻辑
          let loginRes = {
            success: true,
            data: {
              user: {
                ID: "john_doe",
                NAME: "John Doe", 
                EMAIL: "email@email.email",
              },
            }
          }
          if (!loginRes.success) return null;
          
          return {
            id: loginRes.data.user.ID,
            name: loginRes.data.user.NAME,
            email: loginRes.data.user.EMAIL,
          };
        }
        return null;
      },
    })
  ],
  callbacks: {
    async session({ session, token }) {
      session.user = token.user as User;
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.user = user;
      }
      return token;
    },
  },
});
```

### 4.4 中间件配置

```ts title="src/middleware.ts" linenums="1"
import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

export default NextAuth(authConfig).auth;

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
```

## 5. 部署注意事项

部署前需要在 `.env` 中配置以下环境变量:

```bash title=".env"
NEXTAUTH_URL=${部署域名}
NEXT_PUBLIC_API_URL=${部署域名}
```

!!! warning "注意"

		如果不配置这些变量，回调 URL 会默认使用 localhost:3000 导致报错。


