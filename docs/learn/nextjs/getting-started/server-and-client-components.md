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

在这种模式中，所有服务端组件都将提前在服务器上渲染，包括那些作为 props 的组件，所生成的 RSC 有效负载将包含应在组件树中呈现客户端组件的位置的引用。

### 3.5 上下文提供者

React 上下文通常用于共享全局状态，例如当前主题。但是，服务端组件不支持 React 上下文。

要使用上下文，请创建一个接受 `children` props 的客户端组件：

```tsx linenums="1" title="app/ui/theme-provider.tsx" hl_lines="3"
'use client'
 
import { createContext } from 'react'
 
export const ThemeContext = createContext({})
 
export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return <ThemeContext.Provider value="dark">{children}</ThemeContext.Provider>
}
```

然后，将其导入服务端组件（例如布局）：

```tsx linenums="1" title="app/layout.tsx"
import ThemeProvider from './theme-provider'
 
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
```

服务端组件现在可以直接呈现 provider，并且应用程序中的所有其他客户端组件将能够使用此上下文。

!!! note "备注"

    您应该在树中尽可能深地渲染 provider，请注意 `ThemeProvider` 如何仅包装 `{children}` 而不是整个 `<html>` 文档。这使得 Next.js 可以更轻松地优化服务端组件的静态部分。

### 3.6 三方组件

当使用依赖于仅客户端功能的第三方组件时，我们可以将其包装在客户端组件中以确保其按预期工作。例如，`<Carousel />` 可以从 `acme-carousel` 包导入。该组件使用 `useState`，但它还没有 `"use client"` 指令。

如果你在客户端组件中使用了 `<Carousel />` ，它将按预期工作：

```tsx linenums="1" title="app/gallery.tsx"
'use client'
 
import { useState } from 'react'
import { Carousel } from 'acme-carousel'
 
export default function Gallery() {
  const [isOpen, setIsOpen] = useState(false)
 
  return (
    <div>
      <button onClick={() => setIsOpen(true)}>View pictures</button>
      {/* Works, since Carousel is used within a Client Component */}
      {isOpen && <Carousel />}
    </div>
  )
}
```

但是，如果我们尝试直接在服务器组件中使用它，则将看到错误。这是因为 Next.js 不知道 `<Carousel />` 正在使用仅限客户端的功能。

要解决此问题，我们可以将依赖于仅客户端功能的第三方组件包装在自己的客户端组件中：

```tsx linenums="1" title="app/carousel.tsx"
'use client'
 
import { Carousel } from 'acme-carousel'
 
export default Carousel
```

现在，可以在服务端组件中直接使用 `<Carousel />`：

```tsx linenums="1" title="app/page.tsx"
import Carousel from './carousel'
 
export default function Page() {
  return (
    <div>
      <p>View pictures</p>
      {/*  Works, since Carousel is a Client Component */}
      <Carousel />
    </div>
  )
}
```

!!! tip "给库作者的建议"

    如果您正在构建组件库，请将 `"use client"` 指令添加到依赖于仅限客户端功能的入口点，这使用户可以将组件导入到服务端组件中，而无需创建包装器。

    值得注意的是，一些捆绑程序可能会删除 `"use client"` 指令。您可以找到有关如何配置 esbuild 以在 React Wrap Balancer 和 Vercel Analytics 存储库中包含 `"use client"`  指令的示例。

### 3.7 防止环境中毒

JavaScript 模块可以在服务端和客户端组件模块之间共享，这意味着可能会意外地将仅服务端代码导入客户端。例如，考虑以下函数：

```ts linenums="1" title="app/data.ts"
export async function getData() {
  const res = await fetch('https://external-service.com/data', {
    headers: {
      authorization: process.env.API_KEY,
    },
  })
 
  return res.json()
}
```

该函数包含一个永远不应该暴露给客户端的 `API_KEY`。

在 Next.js 中，客户端捆绑包中仅包含前缀为 `NEXT_PUBLIC_` 的环境变量。如果变量没有前缀，Next.js 会将它们替换为空字符串。

因此，即使 `getData()` 可以在客户端导入并执行，它也不会按预期工作。

为了防止在客户端组件中的意外使用，我们可以使用 `server-only` 包。然后，将该包导入到包含仅服务端代码的文件中：

```ts linenums="1" title="app/data.ts"
import 'server-only'
 
export async function getData() {
  const res = await fetch('https://external-service.com/data', {
    headers: {
      authorization: process.env.API_KEY,
    },
  })
 
  return res.json()
}
```

现在，如果再尝试将该模块导入客户端组件，则会出现构建时错误。

相应的 `client-only` 包可用于标记包含仅客户端的逻辑（例如访问 `window` 对象的代码）的模块。

在 Next.js 中，安装 `server-only` 或 `client-only` 是可选的。但是，如果您的 linting 规则标记了无关的依赖项，您可以安装它们以避免出现问题。

```bash
npm install server-only
```

Next.js 在内部处理 `server-only` 和 `client-only` 导入，以便在错误环境中使用模块时提供更清晰的错误消息。 Next.js 不使用 NPM 中的这些包的内容。

Next.js 还为 `server-only` 和 `client-only` 以及 `noUncheckedSideEffectImports` 处于活动状态的 TypeScript 配置提供了自己的类型声明。
