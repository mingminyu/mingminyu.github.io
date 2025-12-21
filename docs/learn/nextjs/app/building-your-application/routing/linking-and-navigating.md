# 链接与导航

Next.js 有四种在路由之间导航的方法：

- 使用 `<Link>` 组件
- 使用 `useRouter` 钩子
- 使用 `redirect` 函数
- 使用本机历史 API

本页将介绍如何使用每个选项，并深入探讨导航的工作原理。

## 1. `<Link>` 组件

`<Link>` 是一个内置组件，它扩展了 HTML `<a>` 标记以提供路由之间的[预先获取]()和客户端导航，这是 Next.js 中的路由之间导航的主要方式。我们可以通过从 `next/link` 导入它并将 `href` 属性传递给组件来使用它：

```jsx title="app/page.jsx"
import Link from 'next/link'
 
export default function Page() {
  return <Link href="/dashboard">Dashboard</Link>
}
```

您还可以将其他可选属性传递给 `<Link>`。有关更多信息，请参阅 API 参考。

### 1.1 示例：链接到动态段

当链接到动态段时，您可以使用[模板文字和插值](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Template_literals) 来生成链接列表。例如生成博客文章列表：

```jsx linenums="1" title="app/blog/PostList.js"
import Link from 'next/link';

export default function PostList({ posts }) {
  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>
          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
        </li>
      ))}
    </ul>
  )
}
```

### 1.2 示例：检查活跃链接

我们可以使用 `usePathname()` 来确定链接是否处于活动状态。例如，要将类添加到活动链接，您可以检查当前路径名 `pathname` 是否与链接的 `href` 匹配：

```jsx linenums="1" title="app/components/links.js"
'use client'
 
import { usePathname } from 'next/navigation'
import Link from 'next/link'
 
export function Links() {
  const pathname = usePathname()
 
  return (
    <nav>
      <ul>
        <li>
          <Link className={`link ${pathname === '/' ? 'active' : ''}`} href="/">
            Home
          </Link>
        </li>
        <li>
          <Link
            className={`link ${pathname === '/about' ? 'active' : ''}`}
            href="/about"
          >
            About
          </Link>
        </li>
      </ul>
    </nav>
  )
}
```

### 1.3 示例：滚动到 `id` 位置

Next.js 应用路由器的默认行为是滚动到新路由的顶部或保持滚动位置以进行向后和向前导航。如果想滚动到导航上的特定 ID，您可以在 URL 后附加 `#` 哈希链接，或者仅将哈希链接传递给 `href` 属性。这是可行的，因为 `<Link>` 最终是被渲染为 `<a>` 元素。

```jsx linenums="1"
<Link href="/dashboard#settings">Settings</Link>
 
// Output
<a href="/dashboard#settings">Settings</a>
```

!!! info "补充"

    如果导航时在视口中看不到 Next.js，则 Next.js 将滚动到该页面。

### 1.4 示例：禁用滚动恢复

Next.js 应用路由器的默认行为是滚动到新路由的顶部或保持滚动位置以进行向后和向前导航。如果您想禁用此行为，可以将 `scroll={false}` 传递给 `<Link>` 组件，或者将 `scroll: false` 传递给 `router.push()` 或 `router.replace()`。

=== "使用 `Link`"

    ```jsx linenums="1"
    // next/link
    <Link href="/dashboard" scroll={false}>
      Dashboard
    </Link>
    ```

=== "使用 `useRouter`"

    ```jsx linenums="1"
    // useRouter
    import { useRouter } from 'next/navigation'
     
    const router = useRouter()
     
    router.push('/dashboard', { scroll: false })
    ```

## 2. `useRouter` 钩子

`useRouter` 挂钩允许您以编程方式更改来自[客户端组件](https://nextjs.org/docs/app/building-your-application/rendering/client-components) 的路由。

```jsx linenums="1" title="app/page.jsx"
'use client';

import { useRouter } from 'next/navigaition';

export default function Page() {
  
}
```


## 3. `redirect` 函数

## 4. 使用本机历史 API

## 5. 路由和导航的工作原理

### 5.1 代码分割

### 5.2 预先获取

### 5.3 缓存

### 5.4 局部渲染

### 5.5 软导航

### 5.6 后退和前进导航

### 5.7 `/page` 和 `/app` 之间的路由

