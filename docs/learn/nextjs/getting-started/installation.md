# 安装

> 原文地址: https://nextjs.org/docs/app/getting-started/installation

创建一个新的 Next.js 应用程序并在本地运行它。

## 1. 快速开始

1. 创建一个名为 `my-app` 的新 Next.js 应用程序
2. `cd my-app` 并启动​​开发服务器
3. 访问 http://localhost:3000。

```bash linenums="1" title="pnpm"
pnpm create next-app@latest my-app --yes  # (1)!
cd my-app
pnpm dev
```

1. `--yes` 使用保存的首选项或默认值跳过提示。默认设置启用 TypeScript、Tailwind、ESLint、App Router 和 Turbopack，并带有导入别名 `@/*`。

## 2. 系统要求

在开始之前，请确保您的开发环境满足以下要求：

- 最低 Node.js 版本：20.9
- 操作系统：macOS、Windows（包括 WSL）和 Linux。

## 3. 支持的浏览器

Next.js 以零配置支持现代浏览器：

Chrome 111
Edge 111+
Firefox 111+
Safari 16.4+

了解有关浏览器支持的更多信息，包括如何配置 polyfill 和针对特定浏览器。

## 4. 使用命令行创建

创建新的 Next.js 应用程序的最快方法是使用 `create-next-app`，它会自动为您设置所有内容。要创建项目，请运行：

```bash
npx create-next-app@latest
```

安装时，您将看到以下提示：

```bash
What is your project named? my-app
Would you like to use the recommended Next.js defaults?
    Yes, use recommended defaults - TypeScript, ESLint, Tailwind CSS, App Router, Turbopack
    No, reuse previous settings
    No, customize settings - Choose your own preferences
```

如果您选择自定义设置，您将看到以下提示：

```bash
Would you like to use TypeScript? No / Yes
Which linter would you like to use? ESLint / Biome / None
Would you like to use React Compiler? No / Yes
Would you like to use Tailwind CSS? No / Yes
Would you like your code inside a `src/` directory? No / Yes
Would you like to use App Router? (recommended) No / Yes
Would you like to customize the import alias (`@/*` by default)? No / Yes
What import alias would you like configured? @/*
```

出现提示后，`create-next-app` 将使用您的项目名称创建一个文件夹并安装所需的依赖项。

## 5. 手动安装

要手动创建新的 Next.js 应用程序，请安装所需的包：

```bash
pnpm i next@latest react@latest react-dom@latest
```

!!! tip "备注"

    App Router 使用内置的 React canary 版本，其中包括所有稳定的 React 19 更改，以及框架中正在验证的新功能。 Pages Router 使用您在 package.json 中安装的 React 版本。

然后，将以下脚本添加到 package.json 文件中：

```json title="package.json" linenums="1"
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "lint:fix": "eslint --fix"
  }
}
```

这些脚本涉及开发应用程序的不同阶段：

- `next dev`：使用 Turbopack（默认捆绑程序）启动开发服务器。
- `next build`：构建生产应用程序。
- `next start`：启动生产服务器。
- `eslint`: 运行 ESLint。

Turbopack 现在是默认的捆绑程序。要使用 Webpack，请运行 `next dev --webpack`` 或 `next build --webpack`。有关配置详细信息，请参阅 Turbopack 文档。

### 5.1 创建 app 目录

Next.js 使用文件系统路由，这意味着应用程序中的路由由您构建文件的方式决定。

创建一个应用程序文件夹。然后，在应用程序内部创建一个 layout.tsx 文件。该文件是根布局。这是必需的并且必须包含 `<html>` 和 `<body>` 标签。

```tsx title="app/layout.tsx" linenums="1"
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
```

使用一些初始内容创建主页 `app/page.tsx`：

```tsx title="app/page.tsx" linenums="1"
export default function Page() {
  return <h1>Hello, Next.js!</h1>
}
```

当用户访问应用程序的根目录 (`/`) 时，`layout.tsx` 和 `page.tsx` 都会被渲染。

!!! note "备注"

    - 如果您忘记创建根布局，Next.js 将在使用 `next dev` 运行开发服务器时自动创建此文件。
    - 您可以选择使用项目根目录中的 `src` 文件夹将应用程序的代码与配置文件分开。


### 5.2 创建 public 文件夹（可选）

在项目的根目录下创建一个 `public` 文件夹，用于存储图像、字体等静态资源。然后，您的代码可以从基本 URL (`/`) 开始引用 `public` 内的文件。

然后，您可以使用根路径 (`/`) 引用这些资源。例如，`public/profile.png` 可以被引用为 `/profile.png`：

```tsx title="app/page.tsx" linenums="1" hl_lines="3"
import Image from 'next/image'
 
export default function Page() {
  return <Image src="/profile.png" alt="Profile" width={100} height={100} />
}
```

## 6. 运行开发服务器

1. 运行 `npm run dev` 以启动开发服务器。
2. 访问 http://localhost:3000 查看您的应用程序。
3. 编辑 `app/page.tsx` 文件并保存以在浏览器中查看更新的结果。


???+ note "补充"

    服务开启后，打开控制台发现出现以下警告：

    ```bash title="Console"
    Warning: Extra attributes from the server: class
    ...
    ```

    这是因为浏览器安装了一些插件导致的，如果想要去除掉该警告，在如下文件中添加 `suppressHydrationWarning={true}`

    ```html title="src/app/layout.tsx" hl_lines="1"
    <html lang="en" suppressHydrationWarning={true}>
        <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
    </html>
    ```

    通常情况下，不建议关闭此警告。


## 7. 设置 TypeScript

!!! note "最低版本"

    最低 TypeScript 版本：v5.1.0


Next.js 带有内置的 TypeScript 支持。要将 TypeScript 添加到项目中，请将文件重命名为 `.ts` / `.tsx` 并运行 `next dev`。 Next.js 将自动安装必要的依赖项，并添加包含推荐配置选项的 `tsconfig.json` 文件。

### 7.1 IDE 插件

Next.js 包含一个自定义 TypeScript 插件和类型检查器，VSCode 和其他代码编辑器可以使用它来进行高级类型检查和自动完成。

您可以通过以下方式在 VS Code 中启用该插件：

1. 打开命令面板（Ctrl/⌘ + Shift + P）
2. 搜索“TypeScript：选择 TypeScript 版本”
3. 选择“使用工作区版本”

## 8. 设置 linting

Next.js 支持使用 ESLint 或 Biome 进行 linting。选择一个 linter 并直接通过 `package.json` 脚本运行它。

- 使用ESLint（综合规则）：

```json title="package.json" linenums="1"
{
  "scripts": {
    "lint": "eslint",
    "lint:fix": "eslint --fix"
  }
}
```

- 或者使用 Biome（快速 linter + 格式化程序）：

```json title="package.json" linenums="1"
{
  "scripts": {
    "lint": "biome check",
    "format": "biome format --write"
  }
}
```

如果您的项目之前使用过 `next lint`，请使用 codemod 将脚本迁移到 ESLint CLI：


```bash
npx @next/codemod@canary next-lint-to-eslint-cli .
```

如果您使用 ESLint，请创建显式配置（推荐 `eslint.config.mjs`）。 ESLint 支持旧版 `.eslintrc.*` 和较新的 eslint.config.mjs 格式。请参阅 ESLint API 参考以获取推荐的设置。

## 9. 设置绝对导入和模块路径别名

Next.js 内置支持 `tsconfig.json` 和 `jsconfig.json` 文件的 `"paths"` 和 `"baseUrl"` 选项。

这些选项允许您将项目目录别名为绝对路径，从而使导入模块变得更容易、更清晰。例如：

```tsx
// Before
import { Button } from '../../../components/button'
 
// After
import { Button } from '@/components/button'
```

要配置绝对导入，请将 `baseUrl` 配置选项添加到 `tsconfig.json` 或 `jsconfig.json` 文件中。例如：

```json title="tsconfig.json" linenums="1"
{
  "compilerOptions": {
    "baseUrl": "src/"
  }
}
```

除了配置 `baseUrl` 路径之外，您还可以使用 `"paths"` 选项来 `"alias"`（别名） 模块路径。


例如，以下配置将 `@/components/*` 映射到 `components/*`：

```json title="tsconfig.json" linenums="1"
{
  "compilerOptions": {
    "baseUrl": "src/",
    "paths": {
      "@/styles/*": ["styles/*"],
      "@/components/*": ["components/*"]
    }
  }
}
```

每个 `"paths"` 都相对于 `baseUrl` 位置。
