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

### 2.2 不带 `generateStaticParams` 的动态段

如果动态段可以预渲染，但由于缺少 `generateStaticParams` 而无法预渲染，则路由将在请求时回退到动态渲染。

通过添加 `generateStaticParams` 确保路由在构建时静态生成：

```tsx title="app/blog/[slug]/page.tsx" linenums="1"
export async function generateStaticParams() {
  const posts = await fetch('https://.../posts').then((res) => res.json())
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  // ...
}
```

### 2.3 网络速度慢

在缓慢或不稳定的网络上，在用户单击链接之前预取可能无法完成，这可能会影响静态和动态路由。在这些情况下，`loading.js` 回退可能不会立即出现，因为它还没进行始预取。

为了提高感知性能，您可以使用 `useLinkStatus` 钩子在转换过程中显示即时反馈。

```tsx title="app/ui/loading-indicator.tsx" linenums="1"
'use client'

import { useLinkStatus } from 'next/link'


export default function LoadingIndicator() {
  const { pending } = useLinkStatus()
  return (
    <span aria-hidden className={`link-hint ${pending ? 'is-pending' : ''}`} />
  )
}
```

您可以通过添加初始动画延迟（例如 100 毫秒）并以不可见的方式开始（例如 `opacity: 0`）来“消除”提示。这意味着仅当导航时间超过指定延迟时才会显示加载指示器。

!!! note "备注"

    我们可以使用其他视觉反馈模式，例如进度条。


### 2.4 禁用预取

您可以通过将 `<Link>` 组件上的 `prefetch` 属性设置为 `false` 来选择退出预取。这对于避免渲染大型链接列表（例如无限滚动表）时不必要的资源使用很有用。

```tsx linenums="1"
<Link prefetch={false} href="/blog">
  Blog
</Link>
```

然而，禁用预取需要权衡：

- 仅当用户单击链接时才会获取静态路由。
- 动态路由需要首先在服务端上呈现，然后客户端才能导航到它。

要减少资源使用而不完全禁用预取，您可以仅在悬停时预取。这将预取限制为用户更有可能访问的路由，而不是视口中的所有链接。

```tsx title="app/ui/hover-prefetch-link.tsx" linenums="1"
'use client'

import Link from 'next/link'
import { useState } from 'react'


function HoverPrefetchLink({ href, children }: { href: string; children: React.ReactNode }) {
  const [active, setActive] = useState(false)
  return (
    <Link 
      href={href} 
      prefetch={active ? null : false} 
      onMouseEnter={() => setActive(true)}
    >
      {children}
    </Link>
  )
}
```

### 2.5 水合未完成

`<Link>` 是一个客户端组件，必须先进行水合才能预取路由。在初次访问时，大型 JavaScript 包可能会延迟水合作用，从而阻止预取立即开始。

!!! note "水合"

    水合（Hydration） 是前端框架里的一个核心概念，是指把服务器已经渲染好的 HTML，和浏览器中的 JavaScript 逻辑“接管并绑定起来”的过程。

React 通过选择性水合作用来缓解这种情况，您可以通过以下方式进一步改进：

- 使用 `@next/bundle-analyzer` 插件通过删除大型依赖项来识别和减少包大小。
- 尽可能将逻辑从客户端转移到服务器。

## 3. 示例

### 3.1 本机历史API

Next.js 允许您使用本机 `window.history.pushState` 和 `window.history.replaceState` 方法来更新浏览器的历史记录堆栈，而无需重新加载页面。

`pushState` 和 `replaceState` 调用集成到 Next.js Router 中，允许我们与 `usePathname` 和 `useSearchParams` 同步。

#### pushState

使用它可以将新条目添加到浏览器的历史记录堆栈中，用户可以导航回之前的状态。例如，要对产品列表进行排序：

```tsx linenums="1"
'use client'
 
import { useSearchParams } from 'next/navigation'
 
export default function SortProducts() {
  const searchParams = useSearchParams()
 
  function updateSorting(sortOrder: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('sort', sortOrder)
    window.history.pushState(null, '', `?${params.toString()}`)
  }
 
  return (
    <>
      <button onClick={() => updateSorting('asc')}>Sort Ascending</button>
      <button onClick={() => updateSorting('desc')}>Sort Descending</button>
    </>
  )
}
```

#### replaceState

用它来替换浏览器历史记录堆栈上的当前条目，用户无法导航回之前的状态。例如，要切换应用程序的区域设置：

```tsx linenums="1"
'use client'
 
import { usePathname } from 'next/navigation'
 
export function LocaleSwitcher() {
  const pathname = usePathname()
 
  function switchLocale(locale: string) {
    // e.g. '/en/about' or '/fr/contact'
    const newPath = `/${locale}${pathname}`
    window.history.replaceState(null, '', newPath)
  }
 
  return (
    <>
      <button onClick={() => switchLocale('en')}>English</button>
      <button onClick={() => switchLocale('fr')}>French</button>
    </>
  )
}
```
