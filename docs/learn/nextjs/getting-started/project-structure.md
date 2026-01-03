# 项目结构和组织

> 原文地址: 

此页面概述了 Next.js 应用程序的项目结构，它涵盖了应用程序和页面目录中的顶层文件和文件夹、配置文件以及路由约定。

## 1. 文件夹和文件约定

### 1.1 顶层文件夹

顶级文件夹用于组织应用程序的代码和静态资源，通常有 2 种h构建形式：带 `src` 和不带 `src`。

![两种构建形式](https://mingminyu.github.io/webassets/images/20250607/18.png)


| 文件夹     | 描述           |
|----------------------|--------------|
| `app`| App Router   |
| `pages`  | Pages Router |
| `public` | 静态资源         |
| `src`  | 可选的应用程序源文件夹  |

### 1.2 顶层文件

顶层文件用于配置应用程序、管理依赖项、运行中间件、集成监视工具以及定义环境变量。

| 文件        | 描述           |
|----------|--------------|
| `next.config.js`  | Next.js 配置文件 |
| `package.json` | 项目依赖项和运行脚本   |
| `instrumentation.ts` | OpenTelemetry 和 Instrumentation 文件           |
| `proxy.conf.json` | 代理配置文件 |
| `middleware.ts`               | 中间件文件 |
| `.env`   | 环境变量文件 |
| `.env.local`       | 本地环境变量（不应由版本控制跟踪） |
| `.env.production`  | 生产环境变量（不应由版本控制跟踪） |
| `.env.development` | 开发环境变量（不应由版本控制跟踪） |
| `.eslint.config.mjs`        | ESLint 配置文件 |
| `.gitignore` | Git 忽略文件 |
| `next-env.d.ts`  | Next.js 的 TypeScript 声明文件（不应由版本控制跟踪） |
| `tsconfig.json`    | TypeScript 配置文件 |
| `jsconfig.json`  | JavaScript 配置文件 |


### 1.3 路由文件

添加页面 `page` 以暴露路由、共享 UI 的布局（例如页眉、导航或页脚）、加载的框架、错误边界的错误以及 API 的路由。

| 文件名      | 文件名后缀                | 描述      |
|------------------|----------------------|---------|
| `layout`     | 	`.js`、`.jsx`、`.tsx` | 布局      |
| `page`       | 	`.js`、`.jsx`、`.tsx` | 页面      |
| `loading`    | 	`.js`、`.jsx`、`.tsx` | 加载的 UI  |
| `not-found`  | 	`.js`、`.jsx`、`.tsx` | 找不到的 UI |
| `error`      | 	`.js`、`.jsx`、`.tsx` | 错误的 UI  |
| `global-error` | 	`.js`、`.jsx`、`.tsx` | 全局错误页面  |
| `route`      | 	`.js`、`.jsx`、`.tsx` | 路由文件    |
| `template`   | 	`.js`、`.jsx`、`.tsx` | 重新渲染布局    |
| `default`    | 	`.js`、`.jsx`、`.tsx` | 并行路由 fallback 页面    |


### 1.4 嵌套路由

文件夹定义 URL 段。嵌套文件夹会嵌套段。任何级别的布局都会包装其子段。当 `page` 或 `route` 文件存在时，路由将变为公开。


| 路径     | URL 匹配模式 | 描述     |
|------|--------|--------|
| `app/layout.tsx` | | 包裹所有路由的根布局 |
| `app/blog/layout.tsx` | | 包裹 `/blog` 的路由页面布局 |
| `app/page.tsx` | `/` | 公开路由 |
| `app/blog/page.tsx` | `/blog` | 公开路由 |
| `app/blog/authors/page.tsx` | `/blog/authors` | 公开路由 |

### 1.5 动态路由

用方括号参数化段：

- 使用 `[segment]` 作为单个参数；
- 使用 `[...segment]` 表示捕获所有路由，
- 使用 `[[...segment]]` 表示可选地捕获所有路由，并通过 `params` 属性访问值。

| 路径 | 描述          |
|---------------|-------------|
| `app/blog/[slug]/page.tsx` | `/blog/my-first-post` |
| `app/shop/[...slug]/page.tsx` | `/shop/clothing`，`/shop/clothing/shirts` |
| `app/shop/[[...slug]]/page.tsx` | `/docs`，`/docs/layouts-and-pages`，`/docs/api-reference/use-router` |


### 1.6 路由组和私立文件夹

使用路由组（`groups`）组织代码而不更改 URL，并将不可路由的文件放置在私有文件夹（`_folder` ）中。

| 路由 | URL 匹配模 | 描述           |
| ----- | ---------- | ------------- |
| `app/(marketing)/page.tsx` | `/` | URL 中省略的组 |
| `app/(shop)/cart/page.tsx` | `/cart` | `shop` 文件夹内路由共享布局 |
| `app/blog/_components/Post.tsx` | `-` | UI组件的文件夹，该组内文件将不会被路由 |
| `app/blog/_lib/data.ts` | `-` | 工具文件夹，该组内文件将不会被路由 |

### 1.7 并行和拦截的路由

这些功能适合特定的 UI 模式，例如基于 **槽** 的布局或模式路由。

将 `@slot` 用于由父布局呈现的命名槽。在不更改 URL 的情况下，使用拦截模式在当前布局内渲染另一个路由，例如，将详细信息视图显示为列表上的模式。

| 参数 | 含义 | 典型用例 |
| --- | --- | --- |
| `@folder` | 命名插槽 | 侧边栏+主要内容 |
| `(.)folder` | 拦截同级路由 | 在模态中预览同级路线 |
| `(..)folder` | 拦截上一层级路由 | 打开父级的子级作为叠加层 |
| `(..)(..)folder` | 拦截上两层级路由 | 深度嵌套覆盖 |
| `(...)folder` | 拦截 root 下所有路由 | 在当前视图中显示任意路线 |

### 1.8 元数据文件约定

#### 1.8.1 APP 图标文件

| 文件名 | 文件后缀     | 描述          |
| ---- |-----------|-------------|
| `favicon` | `.ico`   | 网站图标        |
| `icon` | `.ico`、`.jpg`、`.jpeg`、`.png`、`.svg` | APP 图标文件 |
| `icon` | `.js`、`.ts`、`.tsx`  | 生成的 APP 图标 |
| `apple-icon` | `.jpg`、`.jpeg`、`.png`  | 苹果 APP 图标文件 |
| `apple-icon` | `.js`、`.ts`、`.tsx`    | 生成的苹果应用程序图标 |


#### 1.8.2 Open Graph 和 Twitter 图片

| 文件名             | 文件后缀                  | 描述                |
|-----------------|-----------------------|-------------------|
| `opengraph-image` | `.jpg`、`.jpeg`、`.png`、`.gif` | Open Graph 图片     |
| `opengraph-image` | `.js`、`.ts`、`.tsx`    | 生成的 Open Graph 图片 |
| `twitter-image`   | `.jpg`、`.jpeg`、`.png`、`.gif` | Twitter 图片文件      |
| `twitter-image`   | `.js`、`.ts`、`.tsx`    | 生成的 Twitter 图片    |

#### 1.8.3 SEO

| 文件名             | 文件后缀       | 描述                |
|-----------------|------------|-------------------|
| `sitemap` | `.xml`     | 网站地图文件                 |
| `sitemap` | `.js`、`ts` | 生成的网站地图文件            |
| `robots` | `.txt`     | 搜索引擎机器人文件            |
| `robots` | `.js`、`ts` | 生成的搜索引擎机器人文件       |

## 2. 组织你的项目

Next.js 对于如何组织和放置项目文件没有任何意见，但它确实提供了一些功能来帮助您组织项目。

### 2.1 组件层次结构

特殊文件中定义的组件以特定的层次结构呈现：

- `layout.js`
- `template.js`
- `error.js`（React 错误边界）
- `loading.js`（React 加载边界）
- `not-found.js`（不存在 UI 的 React 错误边界）
- `page.js` 或者嵌套的 `layout.js`

![](https://mingminyu.github.io/webassets/images/nextjs/01.png)

组件在嵌套路由中递归呈现，这意味着路由段的组件将嵌套在其父段的组件内。

![](https://mingminyu.github.io/webassets/images/nextjs/02.png)

### 2.2 托管

在 `app` 目录中，嵌套文件夹定义路由结构。每个文件夹代表一个路由段，该路由段映射到 URL 路径中的相应段。

但是，即使路由结构是通过文件夹定义的，在将 `page.js` 或 `route.js` 文件添加到路由段之前，路由也 **无法公开访问**。

![](https://mingminyu.github.io/webassets/images/nextjs/03.png)

而且，即使路由可供公开访问，也只有 `page.js` 或 `route.js` 返回的内容会发送到客户端。

![](https://mingminyu.github.io/webassets/images/nextjs/04.png)

这意味着项目文件可以安全地放置在 `app` 目录的路由段内，而不会意外地被路由。

![](https://mingminyu.github.io/webassets/images/nextjs/05.png)

!!! note "备注"

    虽然您可以在 `app` 中并置项目文件，但您不必这么做。如果您愿意，可以将它们保留在 `app` 目录之外。

### 2.3 私有文件夹

可以通过在文件夹前添加下划线前缀来创建私人文件夹： `_folderName`。这表明该文件夹是私有实现细节，路由系统不应考虑该文件夹，因此该文件夹及其所有子文件夹都不进行路由。

![](https://mingminyu.github.io/webassets/images/nextjs/06.png)

由于默认情况下可以安全地托管 `app` 目录中的文件，但一般含的私有文件夹不需要托管。然而，它们可用于：

- 将 UI 逻辑与路由逻辑分离；
- 跨项目和 Next.js 生态系统一致地组织内部文件；
- 在代码编辑器中对文件进行排序和分组；
- 避免与未来的 Next.js 文件约定发生潜在的命名冲突。

!!! note "备注"

    虽然不是框架约定，但您也可以考虑使用相同的下划线模式将私有文件夹外部的文件标记为“私有”。
    
    您可以通过在文件夹名称前添加 `%5F`（下划线的 URL 编码形式）前缀来创建以下划线开头的 URL 段：`%5FfolderName`。

    如果您不使用私有文件夹，那么了解 Next.js 特殊文件约定将很有帮助，以防止意外的命名冲突。

### 2.4 路由组

可以通过将文件夹括在括号中来创建路由组：`(folderName)`。这表明该文件夹用于组织目的，不应包含在路由的 URL 路径中。

![](https://mingminyu.github.io/webassets/images/nextjs/07.png)

路由组可用于：

- 按站点部分、意图或团队组织路线，例如营销页面、管理页面等；
- 在同一路线段级别中启用嵌套布局：
    - 在同一段中创建多个嵌套布局，包括多个根布局；
    - 将布局添加到公共路段中的路由子集。

### 2.5 `src`文件夹

Next.js 支持将应用程序代码（包括 `app`）存储在可选的src文件夹中，这一特性可将应用程序代码与项目配置文件分开，项目配置文件主要位于项目的根目录中。

![](https://mingminyu.github.io/webassets/images/nextjs/08.png)

## 3. 示例

以下部分列出了常见策略的高度概述，最简单的要点是选择一种适合您和您的团队的策略，并在整个项目中保持一致。

!!! note "备注"

    在下面的示例中，我们使用 `components` 和 `lib` 文件夹作为通用占位符，它们的命名没有特殊的框架意义，您的项目可能使用其他文件夹，如 `ui` 、 `utils` 、`hooks` 、`styles` 等。

### 3.1 将项目文件存储在`app`之外

此策略将所有应用程序代码存储在项目根目录的共享文件夹中，并保留 `app` 目录纯粹用于路由目的。

![](https://mingminyu.github.io/webassets/images/nextjs/09.png)

### 3.2 将项目文件存储在app内的顶级文件夹中

此策略将所有应用程序代码存储在 `app` 根目录下。

![](https://mingminyu.github.io/webassets/images/nextjs/11.png)

### 3.3 组织路由而不影响URL路径

要在不影响 URL 的情况下组织路由，请创建一个组以将相关路由保存在一起。URL 中将忽略括号文件夹（例如`(marketing)`或`(shop)` ）。

![](https://mingminyu.github.io/webassets/images/nextjs/12.png)

即使 `(marketing)` 和 `(shop)` 内部的路由共享相同的 URL 层次结构，您也可以通过在其文件夹内添加 `layout.js` 文件来为每个组创建不同的布局。

### 3.4 选择特定路由部分共享同一布局

要将特定路由组织到一个布局中，请创建一个新的路线组（例如 `(shop)`）并将共享相同布局的路线移动到该组中（例如`account`和`cart`）。组外的路线不会共享布局（例如checkout ）。

![](https://mingminyu.github.io/webassets/images/nextjs/13.png)



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

