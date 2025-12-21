# 路由基础知识

路由是每个应用程序的骨架，本页面将向您介绍 Web 路由的基本概念以及如何在 Next.js 中处理路由。

## 1. 术语

首先，您将看到整个文档中使用了这些术语，下面一个快速参考：

![img.png](https://mingminyu.github.io/webassets/images/20250607/25.png)

- **Tree**（树）：可视化层次结构的约定。例如，具有父组件和子组件的组件树、文件夹结构等。
- **SubTree**（子树）：树的一部分，从新的根节点（第一个）开始，到叶子节点（最后一个）结束。
- **Root**（根节点）：树或子树中的第一个节点，例如根布局。
- **Leaf**（叶子节点）：子树中没有向继续向下拆分的子节点，例如 URL 路径中的最后一段。

![img.png](https://mingminyu.github.io/webassets/images/20250607/26.png)

- **URL Segment**（URL 段）：由斜杠分隔的 URL 路径的一部分。
- **URL Path**（URL 段）：域名后面的 URL 部分（由段组成）。

## 2. 应用路由器

在版本 13 中，Next.js 引入了一个基于 React 服务端组件 (React Server Components) 构建的新应用路由器（App Router），它支持共享布局、嵌套路由、加载状态、错误处理等。

应用路由器在名为 `app` 的目录中工作。应用程序目录 `app` 与页面目录 `pages` 一起工作，以允许增量调用。这允许我们在 `pages` 目录中为之前的行为保持其他路由的同时，可以选择应用程序的某些路由嵌入到新行为中。如果您的应用程序使用页面目录，另请参阅[页面路由器（Page Router）](https://nextjs.org/docs/pages/building-your-application/routing)文档。

!!! warning "注意"

    App Router 的优先级高于 Pages Router，跨目录的路由不应解析为相同的 URL 路径，并且会导致构建时错误以防止冲突。    

![img.png](https://mingminyu.github.io/webassets/images/20250607/27.png)

默认情况下，应用程序内的组件是 [React 服务端组件](https://nextjs.org/docs/app/building-your-application/rendering/server-components)。这是一种性能优化，可以让您轻松调用它们，并且您还可以使用[客户端组件](https://nextjs.org/docs/app/building-your-application/rendering/client-components)。

!!! note "推荐"
    
    如果您不熟悉服务器组件，请查看服务器页面。

## 3. 文件夹和文件的角色

Next.js 使用基于文件系统的路由器，其中：

- 文件夹用于定义路由。路由是嵌套文件夹的单个路径，遵循从**根文件夹**到包含 `page.js` 文件的最终**叶子文件夹**的文件系统层次结构。请参阅[定义路由](https://nextjs.org/docs/app/building-your-application/routing/defining-routes)。
- 文件用于创建为路由段显示的 UI。请参阅[特殊文件](https://nextjs.org/docs/app/building-your-application/routing#file-conventions)。

## 4. 路由段

路由中的每个文件夹代表一个路由段。每个路由段都映射到 URL 路径中的相应分段。

![img.png](https://mingminyu.github.io/webassets/images/20250607/28.png)

## 5. 嵌套路由

要创建嵌套路由，您可以将文件夹相互嵌套。例如，我们可以通过在应用程序 `app` 目录中嵌套两个新文件夹，从而添加新的 `/dashboard/settings` 路由。

- `/`: 根分段
- `dashboard`: 分段
- `settings`: 叶子分段

## 6. 文件约定

Next.js 提供了一组特殊文件来创建在嵌套路由中具有特定行为的 UI：

| 文件或文件夹                                                                                                  | 描述                  |
|---------------------------------------------------------------------------------------------------------|---------------------|
| [`layout`](https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts#layouts)     | 分段及其子段的共享 UI        |
| [`page`](https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts#pages)         | 路由的唯一 UI，并使路由可被公开访问 |
| [`loading`](https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming)     | 加载 UI               |
| [`not-found`](https://nextjs.org/docs/app/api-reference/file-conventions/not-found)                     | 404 页面              |
| [`error`](https://nextjs.org/docs/app/building-your-application/routing/error-handling)                 | 分段及其子段的错误 UI        |
| [`global-error`](https://nextjs.org/docs/app/building-your-application/routing/error-handling)          | 全局错误 UI             |
| [`route`](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)                 | 服务端 API 端点          |
| [`template`](https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts#templates) | 专门重新渲染的布局 UI        |
| [`default`](https://nextjs.org/docs/app/api-reference/file-conventions/default)                         | 并行路由的后备 UI          |

!!! warning "注意"

    `.js`、`.jsx` 或 `.tsx` 文件扩展名可用于特殊文件。

## 7. 组件层次

路由段的特殊文件中定义的 React 组件将会以特定的层次结构呈现：

- `layout.js`
- `template.js`
- `error.js`（React error boundary）
- `loading.js`（React suspense boundary）
- `not-found.js`（React suspense boundary）
- `page.js` 或者嵌套的 `layout.js`

![img.png](https://mingminyu.github.io/webassets/images/20250607/29.png)

在嵌套路由中，分段的组件将嵌套在其父段的组件内。

![img.png](https://mingminyu.github.io/webassets/images/20250607/30.png)

## 8. 托管

除了特殊文件之外，您还可以选择将自己的文件（例如组件、样式、测试等）放置在应用程序目录的 `app` 文件夹中。这是因为虽然文件夹定义了路由，但只有 `page.js` 或 `route.js` 返回的内容是可公开访问的。你可以了解有关[项目组织和托管](https://nextjs.org/docs/app/building-your-application/routing/colocation)的更多信息。

![img.png](https://mingminyu.github.io/webassets/images/20250607/31.png)

## 9. 高级路由模式

应用路由器还提供了一组约定来帮助您实现更高级的路由模式。这些包括：

- [并行路由](https://nextjs.org/docs/app/building-your-application/routing/parallel-routes): 允许我们在同一视图中同时显示两个或多个可以独立导航的页面。您可以将它们用于具有自己的子导航的分割视图，例如仪表板。 
- [拦截路由](https://nextjs.org/docs/app/building-your-application/routing/intercepting-routes): 允许我们拦截一条路由并将其显示在另一条路由的上下文中。**当保留当前页面的上下文很重要时，您可以使用它们**。例如。在编辑一个任务或展开摘要中的一张照片时查看所有任务。

这些模式使我们能够构建更丰富、更复杂的 UI，从而更容易实现小型团队和个人开发人员过去难以实现的功能。
