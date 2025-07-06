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
readtime: 20
---

# Magic Studio开发者日志：用户登录

> 参考文档：https://authjs.dev/getting-started/authentication/credentials

登录页面是用户使用平台的入口，如果一个平台连登录页面都做得极其 low，那么用户体验会非常差，甚至都不会有想要使用的欲望。此外，看似非常简单的登录流程，实际上也是麻雀虽小，五脏俱全，方方面面都会涉及到。本篇文章我们着手开发 Magic Studio 的用户登录功能，千里之堤始于足下，开干。

<!-- more -->

## 1. 原型设计

### 1.1 登录流程


### 1.2 登录页面

一个优秀的登录页面除了具备基础的登录窗口外，还应该有比较体现平台特性的背景图片，还应该需具备如下功能：

1. 登录成功后，跳转到用户主页；
2. 登录失败后，显示错误信息；
3. 登录成功后，保存用户信息、Cookie 以及 Token，以便下次登录时自动登录。

<!-- more -->

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
npx shadcn@latest add card separator button input form tabs sidebar badge dropdown-menu button avatar separator
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

### 2.4 配置ShadcnUI的CSS主样式

访问 [ShadcnUI 主题](hhttps://ui.shadcn.com/themes) 选择自己的样式，因为我们的 Logo 是深色图案，所以使用默认主题。

如果你喜欢其他样式的主题，点击右上角的 “Copy Code” 复制代码，并替换 `app/global.css` 文件对应的内容。

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

### 3.2 登录页面的表单

![](https://mingminyu.github.io/webassets/images/magic-studio/03.png)

平台需要实现一个登录表单，常规登录方式主要有以下几种：

1. 账号/邮箱/手机号+密码
2. 手机号+短信验证码
3. 邮箱+验证码
4. 企业微信/钉钉等应用扫码
5. Github / Google 等 OAuth2.0 授权

我们主要实现 1、2、4 的登录方式，这里使用到 Tabs、Form、Input、Button、Checkbox 等组件，并借助 zod 进行数据校验以及类型定义：

=== "登录页面"

    ```tsx linenums="1" title="app/(auth)/login/page.tsx" hl_lines="28"
    import Logo from "@/components/Logo";
    import MagicStudioOverview from "./_components/MagicStudioOverview";
    import {
      Card,
      CardContent,
      CardDescription,
      CardHeader,
      CardTitle,
    } from "@/components/ui/card";
    import LoginForm from "./_components/LoginForm";

    export default function Page() {
      return (
        <div className="flex h-screen w-screen items-center justify-center">
          <div className="w-3/4 self-center justify-center items-center flex">
            <Card className="w-96">
              <CardHeader className="w-full items-center flex flex-col justify-center">
                <CardTitle className="flex gap-4 items-center">
                  <Logo className="w-12"/>
                  <div className="h-full text-4xl font-semibold text-clip bg-clip-text text-transparent
                  bg-gradient-to-r to-blue-700 from-green-700">
                    Magic Studio
                  </div>
                </CardTitle>
                <CardDescription>Make building a ML model easily</CardDescription>
              </CardHeader>
              <CardContent>
                <LoginForm />
              </CardContent>
            </Card>        
          </div>
          <div className="h-screen bg-slate-50">
            <MagicStudioOverview  className="ml-16"/>
          </div>
        </div>
      );
    }
    ```

=== "登录表单"

    ```tsx linenums="1" title="app/(auth)/login/_components/LoginForm.tsx"
    "use client";
    import React from "react";
    import { Input } from "@/components/ui/input";
    import { Button } from "@/components/ui/button";
    import { Checkbox } from "@/components/ui/checkbox";
    import { Label } from "@/components/ui/label";
    import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
    import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
    import { UserRound, Lock, Smartphone, ShieldPlus } from "lucide-react";
    import { useForm } from "react-hook-form";
    import { zodResolver } from "@hookform/resolvers/zod";
    import { signInAccount, signInMobile } from "@/lib/auth";
    import { signInAccountSchema, SignInAccountSchemaType, signInMobileSchema, SignInMobileSchemaType } from "@/schema/signin";
    import Link from "next/link";
    import { redirect } from "next/navigation";

    export default function LoginForm() {
      const formAccount = useForm<SignInAccountSchemaType>({
        resolver: zodResolver(signInAccountSchema),
        defaultValues: {
          account: "",
          password: "",
        },
      });

      const formMobile = useForm<SignInMobileSchemaType>({
        resolver: zodResolver(signInMobileSchema),
        defaultValues: {
          mobile: "",
          code: "",
        },
      });

      async function onAccountSubmit(formData: SignInAccountSchemaType) {
        const isSuccess = await signInAccount(formData);
        if (isSuccess) {
          redirect("/");
        }
      }

      async function onMobileSubmit(formData: SignInMobileSchemaType) {
        const isSuccess = await signInMobile(formData);
        if (isSuccess) {
          redirect("/");
        }
      }

      return (
        <Tabs defaultValue="loginByAccount" className="w-full items-center">
          <TabsList className="w-full bg-transparent gap-1">
            <TabsTrigger
              value="loginByAccount"
              className="hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none after:left-1/2 after:-translate-x-1/2"
            >
              账号登录
            </TabsTrigger>
            <TabsTrigger
              value="loginByMobile"
              className="hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none after:left-1/2 after:-translate-x-1/2"
            >
              手机号登录
            </TabsTrigger>
            <TabsTrigger
              value="loginByScancode"
              className="hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none after:left-1/2 after:-translate-x-1/2"
            >
              扫码登录
            </TabsTrigger>
          </TabsList>
          <TabsContent value="loginByAccount" className="w-full">
            <Form {...formAccount}>
              <form
                className="space-y-4 mt-4"
                onSubmit={formAccount.handleSubmit(onAccountSubmit)}
              >
                <FormField
                  control={formAccount.control}
                  name="account"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative">
                          <Input
                            id="email"
                            className="peer ps-12"
                            placeholder="邮箱/手机号/账号"
                            type="text"
                            {...field}
                          />
                          <div
                            className="gap-1 text-muted-foreground/80 pointer-events-none absolute 
                        inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50"
                          >
                            <UserRound
                              size={16}
                              className="text-gray-500"
                              aria-hidden="true"
                            />
                          </div>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={formAccount.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative">
                          <Input
                            id="password"
                            className="peer ps-12"
                            placeholder="密码"
                            type="password"
                            {...field}
                          />
                          <div
                            className="gap-1 text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 
                      flex items-center justify-center ps-3 peer-disabled:opacity-50"
                          >
                            <Lock
                              size={16}
                              className="text-gray-500"
                              aria-hidden="true"
                            />
                          </div>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="w-full space-y-4 pt-2">
                  <div className="flex justify-between items-center">
                    <div className="flex gap-1 items-center">
                      <Checkbox id="rememberPassword" />
                      <Label htmlFor="rememberPassword">记住密码</Label>
                    </div>
                    <Link className="text-sm" href="#">
                      忘记密码？
                    </Link>
                  </div>
                  <Button type="submit" className="w-full bg-slate-700">
                    提交
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>
          <TabsContent value="loginByMobile" className="w-full">
            <Form {...formMobile}>
              <form
                className="space-y-4 mt-4"
                onSubmit={formMobile.handleSubmit(onMobileSubmit)}
              >
                <FormField
                  control={formMobile.control}
                  name="mobile"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative">
                          <Input
                            id="mobile"
                            className="peer ps-12"
                            placeholder="手机号"
                            type="text"
                            {...field}
                          />
                          <div
                            className="gap-1 text-muted-foreground/80 pointer-events-none absolute 
                        inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50"
                          >
                            <Smartphone
                              size={16}
                              className="text-gray-500"
                              aria-hidden="true"
                            />
                          </div>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={formMobile.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative flex items-center gap-2">
                          <div
                            className="gap-1 text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 
                      flex items-center justify-center ps-3 peer-disabled:opacity-50"
                          >
                            <ShieldPlus
                              size={16}
                              className="text-gray-500"
                              aria-hidden="true"
                            />
                          </div>
                          <Input
                            id="verifedCode"
                            className="peer ps-12 w-full -me-px"
                            placeholder="短信验证码"
                            type="text"
                            {...field}
                          />
                          <button className="bg-blue-600 text-white text-sm rounded-md w-36 h-full inline-flex items-center justify-center cursor-pointer">
                            发送验证码
                          </button>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="w-full space-y-4 pt-2">
                  <Button type="submit" className="w-full bg-slate-800">
                    提交
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>
          <TabsContent value="loginByScancode">
            <p className="text-muted-foreground p-4 text-center text-xs">
              Content for Tab 3
            </p>
          </TabsContent>
        </Tabs>
      );
    }
    ```


=== "登录验证"

    这里我们先简单定义一下验证方式，后面再完善：

    ```ts linenums="1" title="lib/auth.ts"
    import { signInAccountSchema, signInMobileSchema, SignInMobileSchemaType } from "@/schema/signin";

    type SignInAccountType = {
      account: string;
      password: string
    }

    type SignInMobileType = {
      mobile: string;
      code: string
    }

    export const signInAccount = async (credentials: SignInAccountType) => {
      console.log("@@Credentials", credentials);
      const { account, password } = await signInAccountSchema.parseAsync(credentials);

      if (account === "admin@admin.com" && password === "admin") {
        console.log("@@Login successfully!");
        const isSuccess = true;
        return { isSuccess };
      } else {
        throw new Error("Invalid credentials.");
      }
    };

    export const signInMobile = async (credentials: SignInMobileSchemaType) => {
      console.log("@@Credentials", credentials);
      const { mobile, code } = await signInMobileSchema.parseAsync(credentials);

      if (code === "123456") {
        console.log("@@Login successfully!");
        const isSuccess = true;
        return { isSuccess };
      } else {
        console.log("@@Login failed!");
      }
    }
    ```

=== "登录数据类型"

    ```tsx linenums="1" title="schema/signin.tsx"
    import { z } from "zod";

    export const signInAccountSchema = z.object({
      account: z.string({ required_error: "不能为空" }).min(3).max(20),
      password: z.string({ required_error: "不能为空" }).min(3).max(80),
    });

    export type SignInAccountSchemaType = z.infer<typeof signInAccountSchema>;

    export const signInMobileSchema = z.object({
      mobile: z.string({ required_error: "不能为空" }).length(11),
      code: z.string({ required_error: "不能为空" }).length(6),
    });

    export type SignInMobileSchemaType = z.infer<typeof signInMobileSchema>;
    ```


### 3.3 登录页面的模板

我们希望右侧的能够在登录和注册页都显示，这里将这部分的页面内容放在模板中：

```tsx linenums="1" title="app/(auth)/layout.tsx"
import MagicStudioOverview from "./_components/MagicStudioOverview";

export default function Layout({children}: {children: React.ReactNode}) {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="w-3/4 self-center justify-center items-center flex">
        {children}       
      </div>
      <div className="h-screen bg-slate-50">
        <MagicStudioOverview  className="ml-16 md:hidden"/>
      </div>
    </div>
  );
}
```

## 4. 登录验证

上面代码中我们实现了自定义登录验证处理，更好地方式使用优秀的外部库实现会更合理，比如 NextAuth.js，它可以帮助我们对全页面的登录状态进行管理。考虑到平台应用是本地的，这里我们使用 账号+密码的方式进行登录验证。

首先我们安装 NextAuth.js 库：

```bash
npm install next-auth@beta
npx auth secret
```

### 4.1 auth.ts

在根目录下新建 `auth.ts` 文件，后续我们在这个文件主要完成完整的验证逻辑代码，并写入以下代码：

```ts linenums="1" title="auth.ts"
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";

export type User = {
  id: string
  account: string
  email: string
  role: string
  name: string
};

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    CredentialsProvider({
      credentials: {
        account: {
          label: "Account",
          type: "text",
          placeholder: "请输入账号/邮箱/手机号",
        },
        password: {
          label: "Password",
          type: "password",
          placeholder: "请输入密码",
        }
      }
      ,
      authorize(credentials) {
        console.log("@credentials", credentials);

        let loginRes = {
          success: true,
          data: {
            user: {
              id: "89757",
              name: "郁明敏",
              email: "yumingmin@gmail.com",
              role: "admin",
            },
          },
        };

        return {
          id: loginRes.data.user.id,
          name: loginRes.data.user.name,
          email: loginRes.data.user.email,
          role: loginRes.data.user.role,
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      session.user = token.user as (User & { emailVerified: Date | null });
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

### 4.2 auth.config.ts

```ts linenums="1" title="auth.config.ts"
export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }: { auth: any, request: { nextUrl: URL } }) {
      const isLoggedIn = !!auth?.user;
      const isOnProtected = !nextUrl.pathname.startsWith('/login');

      if (isOnProtected) {
        return isLoggedIn ? true : false;
      } else if (isLoggedIn) {
        const callbackUrl = nextUrl.searchParams.get("callbackUrl") || "/";  // 获取登录校验前的访问地址
        return Response.redirect(new URL(callbackUrl, nextUrl));
      }
      return true;
    },
  },
  providers: [], 
};
```

### 4.3 middleware.ts

```ts title="middleware.ts" linenums="1"
import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

export default NextAuth(authConfig).auth;

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|.*\\.png$|$).*)',
  ],
};
```

### 4.4 route.ts

```ts title="app/api/auth/[...auth]/routes.ts" linenums="1"
import { handlers } from "@/auth"
export const { GET, POST } = handlers
```

### 4.5 表单提交

我们不再使用 `lib/auth.ts` 来验证，替换成根目录下 `auth.ts`，完成替换后 `lib/auth.ts` 文件可以删除。

```tsx linenums="1" title="app/(auth)/login/_components/LoginForm.tsx" hl_lines="1-2 9-11"
// import { signInAccount, signInMobile } from "@/lib/auth";  // 删除
import { signIn } from "next-auth/react" // (1)!

export default function LoginForm() {
  return (
    <Form {...formAccount}>
      <form
        className="space-y-4 mt-4"
        // onSubmit={formAccount.handleSubmit(onAccountSubmit)} // 删除
        onSubmit={formAccount.handleSubmit(async (formData: SignInAccountSchemaType) => {
          await signIn('credentials', formData);
        })}
      >
        ...
      </form>
    </Form>
  )
}
```

1. 因为我们使用 react-hook-form 库，这里直接使用 `import { signIn } from "@/auth"` 是会报错，并不能像官方示例中那样使用 `"use server"`。并且 `onSubmit={(formData: FormData) => {signIn("credentials", formData)}}` 以及 `onSubmit={async (formData: FormData) => {await signIn("credentials", formData)}}` 都不正确。


## 5. 注册页面

我们在 `app` 文件夹下创建 `(auth)/register` 文件夹，并在里面创建 `page.tsx` 文件，内容如下：

```tsx linenums="1" title="app/(auth)/register/page.tsx"
export default function Page() {
  return (
    <div>RegisterPage</div>
  )
}
```

## 6. 数据表设计

### 6.1 user

| 字段名 | 数据类型 | 是否为空 | 描述 |
| --- | --- | --- | --- |
| id | int | 否 | 用户自增ID |
| username | varchar(50) | 否 | 用户名 |
| realname | varchar(50) | 否 | 姓名 |
| password | varchar(128) | 否 | 密码 |
| mobile | varchar(20) | 否 | 手机号 |
| email | varchar(128) | 否 | 邮箱 |
| avatar | varchar(128) | 是 | 头像 |
| department | varchar(50) | 是 | 部门 |
| role | varchar(20) | 否 | 角色 |
| is_active | tinyint | 否 | 是否激活 |
| created_at | timestamp | 否 | 创建时间 |
| updated_at | timestamp | 否 | 更新时间 |

### 6.2 role


