# 服务端和客户端组件

> 原文地址：https://nextjs.org/docs/app/getting-started/server-and-client-components

默认情况下，布局和页面是服务端组件，它允许我们在服务器上获取数据并渲染部分 UI，可以选择缓存结果，并将其流式传输到客户端。当您需要交互性或浏览器 API 时，可以使用客户端组件来堆积功能。

本页介绍了服务端和客户端组件如何在 Next.js 中工作以及何时使用它们，并提供了如何在应用程序中将它们组合在一起的示例。

## 1. 何时使用服务端和客户端组件？

客户端和服务端的环境具有不同的功能，服务端和客户端组件允许您根据实际用例在每个环境中运行逻辑。

当需要使用客户端组件：

- 状态和事件处理程序，例如 `onClick`、`onChange`。
- 生命周期逻辑，例如 `useEffect`。
- 仅限浏览器的 API，例如 `localStorage`、`window`、`Navigator.geolocation` 等。

当需要使用服务端组件：

- 从靠近源的数据库或 API 获取数据。
- 使用 API 密钥、令牌和其他机密，而不将其暴露给客户端。
- 改进首次内容绘制 (FCP)，并将内容逐步流式传输到客户端。

例如，`<Page>` 组件是一个服务端组件，它获取有关帖子的数据，并将其作为 props 传递给处理客户端交互的 `<LikeButton>`。

=== "app/[id]/page.tsx"

    ```tsx linenums="1"
    import LikeButton from '@/app/ui/like-button'
    import { getPost } from '@/lib/data'
    
    export default async function Page({
      params,
    }: {
      params: Promise<{ id: string }>
    }) {
      const { id } = await params
      const post = await getPost(id)
    
      return (
        <div>
          <main>
            <h1>{post.title}</h1>
            {/* ... */}
            <LikeButton likes={post.likes} />
          </main>
        </div>
      )
    }
    ```

=== "app/ui/like-button.tsx"

    ```tsx linenums="1"
    'use client'
    
    import { useState } from 'react'
    
    export default function LikeButton({ likes }: { likes: number }) {
      // ...
    }
    ```

## 2. 服务端和客户端组件如何在Next.js中工作？

### 2.1 在服务端

在服务器上，Next.js 使用 React API 进行编排渲染，渲染工作按单独的路由段（布局和页面）分为多个块：

- 服务端组件被渲染成一种特殊的数据格式，称为 React 服务端组件有效负载（RSC有效负载）。
- 客户端组件和 RSC 有效负载用于预渲染 HTML。

!!! note "什么是 React 服务端组件负载 (RSC)？"

    RSC Payload 是渲染的 React Server 组件树的紧凑二进制表示，客户端上的 React 使用它来更新浏览器的 DOM。 RSC 有效负载包含：

    - 服务端组件的渲染结果
    - 客户端组件应呈现的位置的占位符以及对其 JavaScript 文件的引用
    - 从服务端组件传递到客户端组件的任何 props


### 2.2 在客户端（首次加载）

然后，在客户端：

1. HTML 用于立即向用户显示路由的快速非交互式预览。
2. RSC Payload 用于协调客户端和服务端组件树。
3. JavaScript 用于补充客户端组件，并使应用程序具有交互性。

!!! note "什么是水化"

    水化（Hydration） 是 React 将事件处理程序附加到 DOM 的过程，以使静态 HTML 具有交互性。

### 2.3 后续导航

在后续导航中：

- RSC 有效负载已预取并缓存以进行即时导航。
- 客户端组件完全在客户端上呈现，而不需要服务器呈现的 HTM

## 3. 示例

### 3.1 使用客户端组件

我们可以通过在文件顶部导入上方添加 `"use client"` 指令来创建客户端组件。

```tsx title="app/ui/router.tsx" linenums="1"
'use client'
 
import { useState } from 'react'
 
export default function Counter() {
  const [count, setCount] = useState(0)
 
  return (
    <div>
      <p>{count} likes</p>
      <button onClick={() => setCount(count + 1)}>Click me</button>
    </div>
  )
}
```

`"use client"` 用于声明服务端和客户端模块图（树）之间的边界。

一旦文件被标记为 `"use client"`，其所有导入和子组件都被视为客户端包的一部分，这意味着不需要将指令添加到面向客户端的每个组件中。

### 3.2 减少 JS 包大小

要减少客户端 JavaScript 包的大小，请将 `"use client"` 添加到特定的交互式组件，而不是将 UI 的大部分标记为客户端组件。

例如，`<Layout>` 组件主要包含 Logo 和导航链接等静态元素，但包括交互式搜索栏。`<Search />` 是交互式的，需要声明2诶客户端组件，但是布局的其余部分可以保留服务端组件。

=== "app/layout.tsx"

    ```tsx linenums="1" hl_lines="12"
    // Client Component
    import Search from './search'
    // Server Component
    import Logo from './logo'
    
    // Layout is a Server Component by default
    export default function Layout({ children }: { children: React.ReactNode }) {
      return (
        <>
          <nav>
            <Logo />
            <Search />
          </nav>
          <main>{children}</main>
        </>
      )
    }
    ```

=== "app/ui/search.tsx"

    ```tsx linenums="1"
    'use client'

    export default function Search() {
      // ...
    }
    ```

### 3.3 将数据从服务端组件传递到客户端组件

我们可以使用 props 将数据从服务端组件传递到客户端组件。

=== "app/[id]/page.tsx"

    ```tsx linenums="1" hl_lines="1 11"
    import LikeButton from '@/app/ui/like-button'
    import { getPost } from '@/lib/data'
    
    export default async function Page({
      params,
    }: {
      params: Promise<{ id: string }>
    }) {
      const { id } = await params
      const post = await getPost(id)
    
      return <LikeButton likes={post.likes} />
    }
    ```

=== "app/ui/like-button.tsx"

    ```tsx linenums="1" hl_lines="1"
    'use client'
    
    export default function LikeButton({ likes }: { likes: number }) {
      // ...
    }
    ```

或者，您可以使用钩子（Hook） 将数据从服务端组件流式传输到客户端组件。

!!! note "备注"

    传递给客户端组件的 Props 需要由 React 进行序列化。

### 3.4 交错服务端和客户端组件

我们可以将服务端组件作为 props 传递给客户端组件，这允许我们在客户端组件中直观地嵌套服务端渲染的 UI。

一种常见的模式是使用 `children` 在 `<ClientComponent>` 创建一个插槽。例如，`<Cart>` 是在服务器上获取数据的组件，它位于 `<Modal>` 使用客户端状态来切换可见性的组件。

```tsx linenums="1" title="app/ui/modal.tsx"
'use client'
 
export default function Modal({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>
}
```

然后，在父服务端组件中（例如 `<Page>`），你可以传递 `<Cart>` 作为 `<Modal>` 的子项：

```tsx linenums="1" title="app/page.tsx"
import Modal from './ui/modal'
import Cart from './ui/cart'
 
export default function Page() {
  return (
    <Modal>
      <Cart />
    </Modal>
  )
}
```
