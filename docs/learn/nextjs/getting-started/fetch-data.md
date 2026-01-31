# 获取数据

> 原文地址： 

本页将引导您了解如何在服务器和客户端组件中获取数据，以及如何流式传输依赖于数据的组件。

## 1. 获取数据

### 1.1 服务端组件

您可以使用任何异步 I/O 在服务器组件中获取数据，例如：

1. `fetch` API 接口；
2. ORM 或数据库
3. 使用 Node.js API（例如 `fs` 从文件系统读取数据）

#### 1.1.1 使用 `fetch` API

要使用 `fetch` API 获取数据，请将组件转换为异步函数，并等待 `fetch` 调用。例如：

```tsx title="app/blog/page.tsx" linenums="1"
export default async function Page() {
  const data = await fetch('https://api.vercel.app/blog')
  const posts = await data.json()
  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>nnnnhhhyjjkkfgvrx{post.title}</li>
      ))}
    </ul>
  )
}
```

!!! note "备注"
    默认情况下不缓存 `fetch` 响应。但是，Next.js 将预渲染路由，并且输出将被缓存以提高性能。如果你想选择动态渲染，请使用 `{ cache: 'no-store' }` 选项。请参考 `fetch` API。

    在开发过程中，您可以记录 `fetch` 调用以获得更好的可见性和调试。请参阅 `logging` API 参考。


#### 1.1.2 使用 ORM 或数据库

由于服务端组件是在服务器上呈现的，因此我们可以使用 ORM 或数据库客户端安全地进行数据库查询。将服务端组件转换为异步函数，并等待调用：

```tsx title="app/page.tsx" linenums="1"
import { db, posts } from '@/lib/db'
 
export default async function Page() {
  const allPosts = await db.select().from(posts)
  return (
    <ul>
      {allPosts.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  )
}
```

### 1.2 客户端组件

有两种方法可以在客户端组件中获取数据，使用：

- React 的 `use` 钩子
- 像 SWR 或 React Query 这样的社区库

#### 1.2.1 使用 `use` 钩子流式传输数据

我们可以使用 React 的 `use` 钩子将数据从服务端流式传输到客户端。首先在服务端组件中获取数据，并将 Promise 作为 prop 传递给客户端组件：

```tsx title="app/blog/page.tsx" linenums="1"
import Posts from '@/app/ui/posts'
import { Suspense } from 'react'
 
export default function Page() {
  // Don't await the data fetching function
  const posts = getPosts()
 
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Posts posts={posts} />
    </Suspense>
  )
}
```

然后，在客户端组件中，使用 `use` 钩子来读取 promise ：

```tsx title="app/ui/posts.tsx" linenums="1"
'use client'
import { use } from 'react'
 
export default function Posts({
  posts,
}: {
  posts: Promise<{ id: string; title: string }[]>
}) {
  const allPosts = use(posts)
 
  return (
    <ul>
      {allPosts.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  )
}
```

