# 服务端组件

React 服务端组件允许您编写可以在服务器上渲染以及进行缓存的 UI（可选）。在 Next.js 中，渲染工作被路由段进一步分割，以实现**流式渲染**和**部分渲染**，并且存在三种不同的服务器渲染策略：

- [静态渲染（Static Rendering）](https://nextjs.org/docs/app/building-your-application/rendering/server-components#static-rendering-default)
- [动态渲染（Dynamic Rendering）](https://nextjs.org/docs/app/building-your-application/rendering/server-components#dynamic-rendering)
- [流式传输（Streaming）](https://nextjs.org/docs/app/building-your-application/rendering/server-components#streaming)

## 1. 服务端渲染的好处

在服务端上进行渲染工作有几个好处，包括：

- **数据获取**（Data Fetching）：服务器端组件允许我们将数据获取移至更靠近数据源的服务器，这减少了获取渲染所需数据的的时间，以及客户端需要发出的请求数量，从而提高整体性能。
- **安全**（Security）：服务器组件允许我们将敏感数据和逻辑（例如令牌和 API 密钥）保留在服务器上，而不存在将它们暴露给客户端的风险。
- **缓存**（Caching）：通过在服务端上进行渲染，将结果缓存并在后续请求和跨用户中复用，这样的机制可以减少每个请求上完成的渲染和数据获取量来提高性能并降低成本。
- **性能**（Performance）：服务端组件为您提供了额外的工具来优化基线性能。例如，如果我们从完全由客户端组件组成的应用程序开始，将 UI 的非交互式部分迁移到服务器组件，这样可以减少所需的客户端 JavaScript 数量。因为浏览器需要下载、解析和执行的客户端 JavaScript 越少，对于互联网速度较慢或设备功能较弱的用户来说是越有帮助的。
- **初始页面加载和首次内容绘制** (Initial Page Load and First Contentful Paint, FCP)：在服务端我们可以生成 HTML 以允许用户立即查看页面，而无需等待客户端下载、解析和执行渲染页面所需的 JavaScript。
- **搜索引擎优化和社交网络可共享性**（Search Engine Optimization and Social Network Shareability）：搜索引擎机器人可以使用渲染的 HTML 来索引您的页面，社交网络机器人可以使用渲染的 HTML 为您的页面生成社交卡预览。
- **流式传输**（Streaming）：服务端组件允许我们将渲染工作分成多个块，并在准备就绪时将它们 **流式** 传输到客户端。这可以让用户更早地看到页面的某些部分，而不必等待整个页面在服务端上完成渲染后再呈现。
 

## 2. 在 Next.js 中使用服务端组件

默认情况下，Next.js 使用服务端组件，在无需额外配置情况下允许我们自动实现服务器渲染，并且可以在需要时选择使用客户端组件，请参阅[客户端组件](https://nextjs.org/docs/app/building-your-application/rendering/client-components)。

## 3. 服务端组件如何进行渲染？

服务端上 Next.js 使用 React 的 API 实现编排渲染。整个渲染工作被分成多个块：由单独的路由段和 [Suspense Boundaries](https://react.dev/reference/react/Suspense) 组成。

每个块都分两步渲染：

1. React 将服务端组件呈现为一种特殊的数据格式，称为 React 服务端组件有效负载（RSC Payload）；
2. Next.js 使用 RSC 有效负载和客户端组件 JavaScript 指令在服务端上呈现 **HTML**。

然后，在客户端：

1. HTML 用于立即显示路由于的且非交互的快速预览，这仅适用于初始页面加载。
2. React 服务端组件有效负载用于协调客户端和服务器组件树，并更新 DOM。
3. JavaScript 指令用于补充客户端组件，并使得应用程序具有交互性。


??? tip "什么是 React 服务端组件负载（RSC Payload）？"

RSC Payload 是渲染的 React 服务端组件树的紧凑二进制表示。客户端上的 React 使用它来更新浏览器的 DOM。 RSC 有效负载包含：

- 服务端组件的渲染结果
- 客户端组件应呈现位置的占位符，以及对其 JavaScript 文件的引用
- 从服务端组件传递到客户端组件的任何 `props`

## 4. 服务端渲染策略

服务器渲染分为三个子集：静态、动态以及流式传输。

### 4.1 静态渲染（默认）

使用静态渲染时，路由会在**构建时**进行渲染，或者在数据重新验证后在后台渲染，其结果将被缓存并可以推送到 CDN（Content Delivery Network）。这样的优化允许您在用户和服务器请求之间共享渲染工作的结果。

当路由具有未针对用户个性化且可在构建时已知的数据（例如静态博客文章或产品页面）时，使用静态渲染将非常有用。

### 4.2 动态渲染

通过动态渲染，可以在请求时为每个用户渲染路由。当路由具有针对用户的个性化数据或具有仅在请求时才能知道的信息（例如 cookie 或 URL 的搜索参数）时，动态渲染将非常有用。

!!! note "动态路由中缓存数据"

    在大多数网站中，路由并不是完全静态或完全动态的，实际上它是一个频谱。例如，您可以拥有一个电子商务页面，该页面使用定期重新验证的缓存产品数据，但也包含未缓存的个性化客户数据。
    
    在 Next.js 中，我们可以在动态渲染中包含缓存和未缓存数据的路由。这是因为 RSC 有效负载和数据是分开缓存的。这使得我们可以自由选择动态渲染，而不必担心在请求时获取所有数据对性能的影响。
    
    了解有关[全路由缓存](https://nextjs.org/docs/app/building-your-application/caching#full-route-cache)和[数据缓存](https://nextjs.org/docs/app/building-your-application/caching#data-cache)的更多信息。

#### 4.2.1 切换动态渲染

在渲染过程中，如果发现[动态函数](https://nextjs.org/docs/app/building-your-application/rendering/server-components#dynamic-functions)或[未缓存的数据请求](https://nextjs.org/docs/app/building-your-application/data-fetching/fetching-caching-and-revalidating#opting-out-of-data-caching)，Next.js 将切换为动态渲染整个路由。下表总结了动态函数和数据缓存如何影响静态或动态渲染路由：

| 动态函数 | 数据  | Route |
|------|-----|-------|
| N    | 缓存  | 静态渲染  |
| Y    | 缓存  | 动态渲染  |
| N    | 未缓存 | 动态渲染  |
| Y    | 未缓存 | 动态渲染  |

在上表中，要使路由完全静态，必须缓存所有数据。但是，您可以拥有使用缓存和未缓存数据获取的动态渲染路由。

作为开发人员，我们无需在静态渲染和动态渲染之间进行选择，因为 Next.js 会根据所使用的功能和 API 自动为每个路由选择最佳渲染策略。相反，您可以选择何时[缓存或重新验证特定数据](https://nextjs.org/docs/app/building-your-application/data-fetching/fetching-caching-and-revalidating)，并且可以选择[流式传输](https://nextjs.org/docs/app/building-your-application/rendering/server-components#streaming)部分 UI。

#### 4.2.2 动态函数

动态函数依赖于只能在请求时获知的信息，例如用户的 cookie、当前请求标头或 URL 的搜索参数。在 Next.js 中，这些动态函数是：

- [`cookies()`](https://nextjs.org/docs/app/api-reference/functions/cookies) 和 [`headers()`](https://nextjs.org/docs/app/api-reference/functions/headers)：在服务端组件中使用这些函数将在请求时选择整个路由进行动态渲染。
- [`searchParams`](https://nextjs.org/docs/app/api-reference/file-conventions/page#searchparams-optional)：在[页面](https://nextjs.org/docs/app/api-reference/file-conventions/page)上使用 `searchParams` 属性将选择页面在请求时进行动态渲染。

### 4.3 流式

![img.png](https://mingminyu.github.io/webassets/images/20250607/35.png)

流式传输允许我们能够从服务器逐步渲染 UI。工作被分成多个块，并在准备就绪时流式传输到客户端。这使得用户能够在整个内容完成之前立即看到页面的部分内容。

![img.png](https://mingminyu.github.io/webassets/images/20250607/36.png)

默认情况下，流式传输内置于 Next.js 应用路由器中。这有助于提高初始页面加载性能，以及依赖于较慢数据获取（会阻止渲染整个路由）的 UI。例如，产品页面上的评论。

您可以使用 `loading.js` 和带有 [React Suspense](https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming) 的 UI 组件开始流式传输路线段。有关更多信息，请参阅[加载 UI 和流式传输](https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming)部分。

