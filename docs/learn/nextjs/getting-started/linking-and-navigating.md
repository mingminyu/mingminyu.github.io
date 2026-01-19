# 链接和导航

> 原文地址: https://nextjs.org/docs/app/getting-started/linking-and-navigating

在 Next.js 中，默认情况下在服务器上呈现路由。这通常意味着客户端必须等待服务器响应才能显示新路由。Next.js 具有内置预取、流式传输和客户端转换功能，可确保导航保持快速且响应灵敏。

本指南解释了 Next.js 中导航的工作原理以及如何针对动态路由和慢速网络对其进行优化。

## 1. 导航的工作原理


### 1.1 服务端渲染

在 Next.js 中，布局和页面默认是 React 服务器组件。在初始和后续导航中，服务器组件有效负载在发送到客户端之前在服务器上生成。

根据发生的时间，服务器渲染有两种类型：

- **静态渲染**（或预渲染）发生在构建时或重新验证期间，并且结果被缓存。
- **动态渲染** 在请求时发生，以响应客户端请求。

服务器渲染的权衡是客户端必须等待服务器响应才能显示新路由。Next.js 通过预取用户可能访问的路线并执行客户端转换来解决此延迟。

!!! note "备注"

    初次访问时还会生成 HTML。

### 1.2 预取

预取是在用户导航到某个路由之前在后台加载该路线的过程，这使得应用程序中的路由之间的导航感觉是即时的，因为当用户单击链接时，呈现下一个路由的数据已经在客户端可用。

当它们进入用户的视点时，Next.js 会自动预取与 `<Link>` 组件链接的路由。

```tsx title="app/layout.tsx" linenums="1"
import Link from 'next/link'
 
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <nav>
          {/* Prefetched when the link is hovered or enters the viewport */}
          <Link href="/blog">Blog</Link>
          {/* No prefetching */}
          <a href="/contact">Contact</a>
        </nav>
        {children}
      </body>
    </html>
  )
}
```

预取多少路由取决于它是静态的还是动态的：

- **静态路由**：预取完整路由。
- **动态路由**：跳过预取，或者如果存在 `loading.tsx` ，则部分预取路由。

通过跳过或部分预取动态路由，Next.js 避免了服务器上对用户可能永远不会访问的路由进行不必要的工作。但是，在导航之前等待服务器响应可能会给用户留下应用程序没有响应的印象。

![](https://mingminyu.github.io/webassets/images/nextjs/22.png)

要改善动态路由的导航体验，您可以使用流式传输。

### 1.2 流式传输

流式传输允许服务器在准备好后立即将动态路由的一部分发送到客户端，而不是等待整个路由被渲染，这意味着用户可以更快地看到某些内容，即使页面的某些部分仍在加载。

对于动态路由，这意味着它们可以部分预取。也就是说，可以提前请求共享布局和加载骨架。

![](https://mingminyu.github.io/webassets/images/nextjs/23.png)

要使用流式传输，请在路由文件夹中创建一个 `loading.tsx`：

![](https://mingminyu.github.io/webassets/images/nextjs/24.png)

```tsx title="app/dashboard/load ing.tsx" linenums="1"
export default function Loading() {
  // Add fallback UI that will be shown while the route is loading.
  return <LoadingSkeleton />
}
```


在场景背后，Next.js 会自动将 `page.tsx` 内容包装在 `<Suspense>` 边界中。预取的后备 UI 将在加载路由时显示，并在准备好后切换为实际内容。

!!! note "备注"

    您还可以使用 `<Suspense>` 为嵌套组件创建加载 UI。

使用 `loading.tsx` 的好处：

- 为用户提供即时导航和视觉反馈；
- 共享布局保持交互性，并且导航是可中断的；
- 改为的核心 Web Vitals：TTFB、FCP 和 TTI。

为了进一步改善导航体验，Next.js 使用 `<Link>` 组件进行客户端过渡。

### 1.3 客户端过渡

传统上，导航到服务器呈现的页面会触发完整页面加载，这会清楚状态、重置滚动未知，并组织交互。

Next.js 使用 `<Link>` 组件通过客户端转换来避免这种情况，它不是重新加载页面，而是通过以下方式动态更新内容：

- 保留所有共享的布局和 UI。
- 用预取的加载状态或新页面（如果可用）替换当前页面。

客户端转换特性使得应用程序在服务器渲染感觉和客户端渲染一样，当配合预取和流式传输使用时，它可以实现快速转换，即使对于动态路由也是如此。

## 2. 什么会导致过渡变慢？

这些 Next.js 优化使导航变得快速且响应灵敏。然而，在某些情况下，过渡仍然会感觉很慢。以下是一些常见原因以及如何改善用户体验。

### 2.1 动态路由未使用 `loading.tsx`

导航到动态路由时，客户端必须等待服务器响应后才能显示结果，这会给用户留下应用程序没有响应的印象。

我们建议将 `loading.tsx` 添加到动态路由中，以启用部分预取、触发立即导航并在路由渲染时显示加载UI。

```tsx title="app/blog/[id]/loading.tsx" linenums="1"
export default function Loading() {
  return <LoadingSkeleton />
}
```

!!! note "备注"

    在开发模式下，我们可以使用 Next.js Devtools 来识别路由是静态还是动态。有关详细信息，请参阅 `devIndicators`。



## 3. 示例

