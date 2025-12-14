# 项目结构

此页面概述了 Next.js 应用程序的项目结构，它涵盖了应用程序和页面目录中的顶层文件和文件夹、配置文件以及路由约定。

## 1. 顶层文件夹

顶级文件夹用于组织应用程序的代码和静态资源，通常有 2 种h构建形式：带 `src` 和不带 `src`。

![两种构建形式](https://nextjs.org/_next/image?url=%2Fdocs%2Flight%2Ftop-level-folders.png&w=1920&q=75)


![img.png](https://mingminyu.github.io/webassets/images/20250607/18.png)


| 文件夹                                                                                        | 描述           |
|--------------------------------------------------------------------------------------------|--------------|
| [`app`](https://nextjs.org/docs/app/building-your-application/routing)                     | App Router   |
| [`pages`](https://nextjs.org/docs/pages/building-your-application/routing)                 | Pages Router |
| [`public`](https://nextjs.org/docs/app/building-your-application/optimizing/static-assets) | 静态资源         |
| [`src`](https://nextjs.org/docs/app/building-your-application/configuring/src-directory)   | 可选的应用程序源文件夹  |

## 2. 顶层文件

顶层文件用于配置应用程序、管理依赖项、运行中间件、集成监视工具以及定义环境变量。

| 文件                                                                                                          | 描述           |
|-------------------------------------------------------------------------------------------------------------|--------------|
| [next.config.js](https://nextjs.org/docs/app/api-reference/next-config-js)                                  | Next.js 配置文件 |
| [package.json](https://nextjs.org/docs/getting-started/installation#manual-installation)                    | 项目依赖项和运行脚本   |
| [instrumentation.ts](https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation)      | OpenTelemetry 和 Instrumentation 文件           |
| [middleware.ts](https://nextjs.org/docs/app/building-your-application/routing/middleware)                   | 中间件文件 |
| [.env](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)             | 环境变量文件 |
| [.env.local](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)       | 本地环境变量文件 |
| [.env.production](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)  | 生产环境变量文件 |
| [.env.development](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables) | 生产环境变量文件 |
| [.eslintrc.json](https://nextjs.org/docs/app/building-your-application/configuring/eslint                   | ESLint 配置文件 |
| .gitignore                                                                                                  | Git 忽略文件 |
| next-env.d.ts                                                                                               | TypeScript 类型定义文件 |
| tsconfig.json                                                                                               | TypeScript 配置文件 |
| jsconfig.json                                                                                               | JavaScript 配置文件 |

## 3. 应用程序路由约定

以下文件约定用于定义路由，并处理应用程序路由器中的元数据。

### 3.1 路由文件

| 文件名                                                                                             | 文件名后缀                | 描述      |
|-------------------------------------------------------------------------------------------------|----------------------|---------|
| [layout](https://nextjs.org/docs/app/api-reference/file-conventions/layout)                     | 	`.js`、`.jsx`、`.tsx` | 布局      |
| [page](https://nextjs.org/docs/app/api-reference/file-conventions/page)                         | 	`.js`、`.jsx`、`.tsx` | 页面      |
| [loading](https://nextjs.org/docs/app/api-reference/file-conventions/loading)                   | 	`.js`、`.jsx`、`.tsx` | 加载的 UI  |
| [not-found](https://nextjs.org/docs/app/api-reference/file-conventions/not-found)               | 	`.js`、`.jsx`、`.tsx` | 找不到的 UI |
| [error](https://nextjs.org/docs/app/api-reference/file-conventions/error)                       | 	`.js`、`.jsx`、`.tsx` | 错误的 UI  |
| [global-error](https://nextjs.org/docs/app/api-reference/file-conventions/error#global-errorjs) | 	`.js`、`.jsx`、`.tsx` | 全局错误页面  |
| [route](https://nextjs.org/docs/app/api-reference/file-conventions/route)                       | `.js`、`.jsx`、`.tsx`  | 路由文件    |
| [template](https://nextjs.org/docs/app/api-reference/file-conventions/template)                 | `.js`、`.jsx`、`.tsx`  | 模板文件    |
| [default](https://nextjs.org/docs/app/api-reference/file-conventions/default)                   | `.js`、`.jsx`、`.tsx`  | 默认文件    |

### 3.2 嵌套路由

| 形式                                                                                           | 描述     |
|----------------------------------------------------------------------------------------------|--------|
| [folder](https://nextjs.org/docs/app/building-your-application/routing#route-segments)       | 分段路由   |
| [folder/folder](https://nextjs.org/docs/app/building-your-application/routing#nested-routes) | 嵌套分段路由 |

### 3.3 动态路由

| 形式                                                                                                                 | 描述          |
|--------------------------------------------------------------------------------------------------------------------|-------------|
| [`[folder]`](https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes#convention)              | 动态路由段       |
| [`[...folder]`](https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes#catch-all-segments)   | 捕获所有路由段     |
| [`[[...folder]]`](https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes#optional-catch-all-segments) | 可选项，捕获所有路由段 |


### 3.5 路由组和私立文件夹

| 形式                                                                                                 | 描述                    |
|----------------------------------------------------------------------------------------------------|-----------------------|
| [`(folder)`](https://nextjs.org/docs/app/building-your-application/routing/route-groups#convention) | 对路由进行分组，但不会影响路由路由     |
| [`_folder`](https://nextjs.org/docs/app/building-your-application/routing/colocation#private-folders) | 可选文件夹，该文件夹下所有路由段不参与路由 |

### 3.6 并行和拦截的路由

| 形式                                                                                                            | 描述            |
|---------------------------------------------------------------------------------------------------------------|---------------|
| [`@folder`](https://nextjs.org/docs/app/building-your-application/routing/parallel-routes#slots)              | 命名的插槽         |
| [`(.)folder`](https://nextjs.org/docs/app/building-your-application/routing/intercepting-routes#convention)   | 拦截同级路由        |
| [`(..)folder`](https://nextjs.org/docs/app/building-your-application/routing/intercepting-routes#convention)  | 拦截上一层级路由      |
| [`(..)(..)folder`](https://nextjs.org/docs/app/building-your-application/routing/intercepting-routes#convention) | 拦截上两层级路由      |
| [`(...)folder`](https://nextjs.org/docs/app/building-your-application/routing/intercepting-routes#convention) | 拦截 root 下所有路由 |

### 3.7 元数据文件约定

| 文件名 | 文件后缀                                | 描述          |
| ---- |-------------------------------------|-------------|
| favicon | `.ico`                              | 网站图标        |
| icon | `.ico`、`.jpg`、`.jpeg`、`.png`、`.svg` | APP 图标文件    |
| icon | `.js`、`.ts`、`.tsx`                  | 生成的 APP 图标  |
| apple-icon | `.jpg`、`.jpeg`、`.png`               | 苹果 APP 图标文件 |
| apple-icon | `.js`、`.ts`、`.tsx`                  | 生成的苹果应用程序图标 |


### 3.8 Open Graph 和 Twitter 图片

| 文件名             | 文件后缀                  | 描述                |
|-----------------|-----------------------|-------------------|
| opengraph-image | `.jpg`、`.jpeg`、`.png`、`.gif` | Open Graph 图片     |
| opengraph-image | `.js`、`.ts`、`.tsx`    | 生成的 Open Graph 图片 |
| twitter-image   | `.jpg`、`.jpeg`、`.png`、`.gif` | Twitter 图片文件      |
| twitter-image   | `.js`、`.ts`、`.tsx`    | 生成的 Twitter 图片    |

### 3.9 SEO

| 文件名             | 文件后缀       | 描述                |
|-----------------|------------|-------------------|
| sitemap | `.xml`     | 网站地图文件                 |
| sitemap | `.js`、`ts` | 生成的网站地图文件            |
| robots | `.txt`     | 搜索引擎机器人文件            |
| robots | `.js`、`ts` | 生成的搜索引擎机器人文件       |

## 4. 页面路由约定

以下文件约定用于定义页面路由器中的路由。

### 4.1 特殊文件

| 文件名             | 文件后缀       | 描述       |
|-----------------|------------|----------|
| `_app` | `.js`、`.ts`、`.tsx` | 自定义应用    |
| `_document` | `.js`、`.ts`、`.tsx` | 自定义文档    |
| `_error` | `.js`、`.ts`、`.tsx` | 错误页面     |
| `404` | `.js`、`.ts`、`.tsx` | 404 错误页面 |
| `500` | `.js`、`.ts`、`.tsx` | 500 错误页面 |

### 4.2 路由

| 文件夹           | 文件后缀       | 描述 |
|---------------|------------|----|
| `index`       | `.js`、`.ts`、`.tsx` | 主页 |
| `folder/index` | `.js`、`.ts`、`.tsx` | 嵌套页面 |


| 文件名            | 文件后缀       | 描述 |
|----------------|------------|----|
| `index`        | `.js`、`.ts`、`.tsx` | 主页 |
| `folder/index` | `.js`、`.ts`、`.tsx` | 嵌套页面 |


### 4.3 动态路由


| 文件夹                   | 文件后缀       | 描述          |
|-----------------------|------------|-------------|
| `[folder]/index`      | `.js`、`.ts`、`.tsx` | 动态路由段       |
| `[...folder]/index`   | `.js`、`.ts`、`.tsx` | 捕获所有路由段     |
| `[[...folder]]/index` | `.js`、`.ts`、`.tsx` | 可选项，捕获所有路由段 |


| 文件名            | 文件后缀       | 描述          |
|----------------|------------|-------------|
| `file`         | `.js`、`.ts`、`.tsx` | 动态路由段       |
| `[...file]`    | `.js`、`.ts`、`.tsx` | 捕获所有路由段     |
| `[[...file]]`  | `.js`、`.ts`、`.tsx` | 可选项，捕获所有路由段 |

