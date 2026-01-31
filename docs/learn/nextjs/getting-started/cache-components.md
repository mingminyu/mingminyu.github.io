# 缓存组件

> 原文地址：https://nextjs.org/docs/app/getting-started/cache-components#how-rendering-works-with-cache-components

!!! note "备注"

​	缓存组件是一项可选功能，通过在 Next 配置文件中将 `cacheComponents` 标志设置为 `true` 进行启用。



缓存组件允许我们在单个路由中混合静态、缓存和动态内容，为静态站点的速度和动态渲染的提供灵活性。

服务端渲染的应用程序通常强制在静态页面（访问快速但内容陈旧）和动态页面（内容较新但缓慢）之间进行选择，将这项工作转移到客户端会以平衡服务端更大的包和更慢的初始渲染的负载。

缓存组件通过预渲染路由转换为静态 HTML SHELL（static HTML shell），并立即发送到浏览器，当在 UI 准备就绪时更新 UI，从而消除上述权衡的影响。

## 1. 渲染如何与缓存组件一起工作

在构建时，Next.js 会渲染路由的组件树。只要组件不访问网络资源、某些系统 API，或者需要根据传入请求进行渲染的情况，它们的输出就会自动添加到静态 shell。否则，您必须选择如何处理它们：

- 通过将组件封装在 React 的`<Suspense>`中，将渲染推迟到请求时间，显示回退 UI，直到内容准备好；
- 使用 `use cache` 指令缓存结果，将其包含在静态 shell 中（如果不需要请求数据）。

因为这是提前发生的，在请求到达之前，我们将其称为 **预渲染**。这会生成一个静态 shell，其中包含用于初始页面加载的 HTML 和用于客户端导航的序列化 RSC 有效负载，确保无论用户直接导航到 URL 还是从另一个页面转换，浏览器都会立即收到完全呈现的内容。

Next.js 要求我们显式地处理预渲染期间无法完成的组件。如果它们没有包装在 `<Suspense>` 中或标记为 `use cache` ，您将在开发和构建期间看到 `Uncached data was accessed outside of <Suspense>` 错误。

!!! note "备注"

​	缓存可以在组件或函数级别应用，而回退 UI 可以在任何子树周围定义，这意味着我们可以在单个路由中组合静态、缓存和动态内容。

这种渲染方法称为部分预渲染，是缓存组件的默认行为。在本文其余部分，我们简单称之为“预渲染”，可以产生部分或完整的输出。

## 2. 自动预渲染内容

像同步地输入输出、模块导入和纯计算等操作可以在预渲染阶段完成，仅使用这些操作的组件，其渲染输出包含在静态 HTML Shell 中。

因为下面的 `Page` 组件中的所有操作都是在渲染期间完成的，所以它的渲染输出会自动包含在静态 shell 中。当布局和页面预渲染都成功时，整个路由就是静态 shell。

```tsx
import fs from 'node:fs'
 
export default async function Page() {
  // Synchronous file system read
  const content = fs.readFileSync('./config.json', 'utf-8')
 
  // Module imports
  const constants = await import('./constants.json')
 
  // Pure computations
  const processed = JSON.parse(content).items.map((item) => item.value * 2)
 
  return (
    <div>
      <h1>{constants.appName}</h1>
      <ul>
        {processed.map((value, i) => (
          <li key={i}>{value}</li>
        ))}
      </ul>
    </div>
  )
}
```

!!! note "备注"

    我们可以通过检查构建输出摘要来验证路由是否已完全预渲染，或者通过在浏览器中查看页面远吗来查看添加到任何页面的静态 shell 中的内容。

## 3. 延迟渲染到请求时间

在预渲染期间，当 Next.js 遇到无法完成的工作（例如网络请求、访问请求数据或异步操作）时，它需要我们显式处理它。要将渲染推迟到请求时间，父组件必须使用 `Suspense` 边界提供回退 UI。回退会成为静态 shell 的一部分，而实际内容则是在请求时解析。

将 `Suspense` 边界放置在尽可能靠近需要它们的组件的位置，这最大化了静态 shell 中的内容量，因为边界之外的所有内容仍然可以正常预渲染。

!!! note "备注"
    借助 `Suspense` 边界，多个动态部分可以并行渲染，而不是相互阻塞，从而减少总加载时间。

### 3.1 动态内容

外部系统通过异步的方式提供内容，这通常需要不可预测的时间来解决，甚至可能失败，这就是预渲染不会自动执行它们的原因。

一般来说，当我们需要每个请求源的最新数据（例如实时或个性化内容）时，请通过提供带有 `Suspense` 边界的回退 UI 来推迟渲染。

例如，下面的 `DynamicContent` 组件使用多个不会自动预渲染的操作。

```tsx
import { Suspense } from 'react'
import fs from 'node:fs/promises'

async function DynamicContent() {
  // 处理网络请求
  const data = await fetch('https://api.example.com/data')
  // 处理数据库查询
  const users = await db.query('SELECT * FROM users')
  // 文件系统的异步操作
  const file = await fs.readFile('..', 'utf-8')
  // 模拟外部系统延时
  await new Promise((resolve) => setTimeout(resolve, 100))
  return <div>Not in the static shell</div>
}
```

要在页面中使用 `DynamicContent` ，请将其包装在 `<Suspense>` 中以定义回退 UI：

```tsx
export default async function Page(props) {
  return (
  	<>
    	<h1>Part of the static shell</h1>
      {/* <p>Loading..</p> is part of the static shell */}
      <Suspense fallback={<p>Loading..</p>}>
        <DynamicContent />
        <div>Sibling excluded from static shell</div>
      </Suspense>
    </>
  )
}
```

预渲染在 `fetch` 请求时停止，请求本身未启动，并且其底层的任何代码都不会执行。回退 ( `<p>Loading...</p>` ) 包含在静态 shell 中，而组件的内容则在请求时流式传输。

在此示例中，由于所有操作（网络请求、数据库查询、文件读取和超时）都在同一组件内按顺序运行，因此只有在它们全部完成后才会显示内容。

!!! note "备注"
    对于不经常更改的动态内容，您可以使用 `use cache` 将动态数据包含在静态 shell 中，而不是对其进行流式传输。

### 3.2 运行时数据

需要请求上下文的特定类型的动态数据，仅在用户发出请求时可用。

- `cookies()` ：用户的 cookie 数据
- `headers()` ：请求标头
- `searchParams`：URL 查询参数
- `params`：动态路由参数（除非通过 `generateStaticParams` 提供了至少一个示例）。有关详细模式，请参阅带有缓存组件的动态路由。

```tsx linenums="1" title="page.tsx"
import { cookies, headers } from 'next/headers'
import { Suspense } from 'react'
 
async function RuntimeData({ searchParams }) {
  // Accessing request data
  const cookieStore = await cookies()
  const headerStore = await headers()
  const search = await searchParams
 
  return <div>Not in the static shell</div>
}
```

要使用 `RuntimeData` 组件，请将其包装在 `<Suspense>` 边界：

```tsx linenums="1" title="page.tsx"
export default async function Page(props) {
  return (
    <>
      <h1>Part of the static shell</h1>
      {/* <p>Loading..</p> is part of the static shell */}
      <Suspense fallback={<p>Loading..</p>}>
        <RuntimeData searchParams={props.searchParams} />
        <div>Sibling excluded from static shell</div>
      </Suspense>
    </>
  )
}
```

如果您需要推迟请求时间而不访问上述任何运行时 API，请使用 `connection()`。

!!! note "备注"

    运行时数据无法使用 `use cache` 进行缓存，因为它需要请求上下文。访问运行时 API 的组件必须始终包装在`<Suspense>`。但是，您可以从运行时数据中提取值并将它们作为参数传递给缓存的函数。

### 3.3 非确定性操作

`Math.random()`、`Date.now()` 或 `crypto.randomUUID()` 等操作每次执行时都会产生不同的值。为了确保这些在请求时运行（每个请求生成唯一的值），缓存组件要求我们通过在动态或运行时数据访问后调用这些操作来明确表示此意图。


!!! note "备注"

    您可以 `use cache` 指定来缓存非确定性操作。


## 4. 使用 `use cache`

`'use cache'` 指令缓存异步函数和组件的返回值，我们可以在函数、组件或文件级别应用它。

父作用域下的参数和任何封闭值都会自动成为 **缓存键** 的一部分，这意味着不同的输入会产生单独的缓存条目。这可以实现个性化或参数化的缓存内容。

当动态内容不需要在每个请求时从源中获取新鲜内容时，缓存可以让我们在预渲染期间将内容包含在静态 shell 中，或者在运行时跨多个请求重用结果。

缓存的内容可以通过两种方式重新验证：根据缓存生命周期自动重新验证，或者按需使用带有 `revalidateTag` 或 `updateTag` 的标签。


!!! note "备注"
    
    有关可缓存内容以及参数如何工作的详细信息，请参阅序列化要求和约束。

### 4.1 预渲染期间

虽然动态内容是从外部源获取的，但它通常不太可能在访问之间发生变化。例如，产品目录数据会随着库存变化而更新，博客文章内容在发布后也很少发生变化，过去日期的分析报告基本上保持静态。

如果不依赖于运行时数据，则可以使用 `use cache` 指令将数据包含在静态 HTML shell 中。使用 `cacheLife` 定义缓存数据的使用时间。

当重新验证发生时，静态 shell 会更新为新内容。有关按需重新验证的详细信息，请参阅标记和重新验证。

```tsx linenum="1" title="app/page.tsx" hl_lines="1 4-5"
import { cacheLife } from 'next/cache'
 
export default async function Page() {
  'use cache'
  cacheLife('hours')
 
  const users = await db.query('SELECT * FROM users')
 
  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  )
}
```

`cacheLife` 函数接受缓存配置文件名称（如 `'hours'` 、`'days'` 或 `'weeks'`）或自定义配置对象来控制缓存行为：

```tsx hl_lines="1 4-8" title="app/page.tsx" linenums="1"
import { cacheLife } from 'next/cache'
 
export default async function Page() {
  'use cache'
  cacheLife({
    stale: 3600, // 1 hour until considered stale
    revalidate: 7200, // 2 hours until revalidated
    expire: 86400, // 1 day until expired
  })
 
  const users = await db.query('SELECT * FROM users')
 
  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  )
}
```

请参阅 `cacheLife` API 参考以获取可用的配置文件和自定义配置选项。

### 4.2 使用运行时数据

运行时数据和 `use cache` 不能在同一范围内使用。但是，我们可以从运行时 API 中提取值并将它们作为参数传递给缓存函数。

```tsx linenums="1" title="app/profile/page.tsx"
import { cookies } from 'next/headers'
import { Suspense } from 'react'
 
export default function Page() {
  // Page itself creates the dynamic boundary
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProfileContent />
    </Suspense>
  )
}
 
// Component (not cached) reads runtime data
async function ProfileContent() {
  const session = (await cookies()).get('session')?.value
 
  return <CachedContent sessionId={session} />
}
 
// Cached component/function receives data as props
async function CachedContent({ sessionId }: { sessionId: string }) {
  'use cache'
  // sessionId becomes part of cache key
  const data = await fetchUserData(sessionId)
  return <div>{data}</div>
}
```

在请求时，如果没有找到匹配的缓存条目， `CachedContent` 就会执行，并存储结果以供将来的请求使用。

### 4.3 非确定性操作

在 `use cache` 范围内，非确定性操作在预渲染期间执行。当我们希望为所有用户提供相同的渲染输出时，这非常有用：

```tsx linenums="1"
export default async function Page() {
  'use cache'
 
  // Execute once, then cached for all requests
  const random = Math.random()
  const random2 = Math.random()
  const now = Date.now()
  const date = new Date()
  const uuid = crypto.randomUUID()
  const bytes = crypto.getRandomValues(new Uint8Array(16))
 
  return (
    <div>
      <p>
        {random} and {random2}
      </p>
      <p>{now}</p>
      <p>{date.getTime()}</p>
      <p>{uuid}</p>
      <p>{bytes}</p>
    </div>
  )
}
```

所有请求都将通过包含相同随机数、时间戳和 UUID 的路由进行服务，直到缓存重新生效。

### 4.4 标记和重新验证

使用 `cacheTag` 标记缓存数据，并在服务端操作中使用 `updateTag` 在突变后重新验证它以进行立即更新，或者在更新延迟时使用 `revalidateTag`。

#### 4.4.1 使用 `updateTag`

当需要在同一请求中过期并立即刷新缓存数据时，请使用 `updateTag`：

```tsx linenums="1" hl_lines="1 4-5"
import { cacheTag, updateTag } from 'next/cache'
 
export async function getCart() {
  'use cache'
  cacheTag('cart')
  // fetch data
}
 
export async function updateCart(itemId: string) {
  'use server'
  // write data using the itemId
  // update the user cart
  updateTag('cart')
}
```

#### 4.4.2 使用 `revalidateTag`


当我们想要对重新验证过时的行为来标记缓存条目无效时，请使用 `revalidateTag`。这对于允许最终一致性的静态内容来说是一个理想的选择。

```tsx linenums="1" hl_lines="1 4-5"
import { cacheTag, revalidateTag } from 'next/cache'
 
export async function getPosts() {
  'use cache'
  cacheTag('posts')
  // fetch data
}
 
export async function createPost(post: FormData) {
  'use server'
  // write data using the FormData
  revalidateTag('posts', 'max')
}
```

有关更详细的解释和使用示例，请参阅 `use cache` API 参考。

### 4.5 应该缓存什么？

缓存的内容应该是我们希望 UI 加载状态的函数。如果数据不依赖于运行时数据，并且可以接受在一段时间内为多个请求提供缓存值，请使用 `use cache` 和 `cacheLife` 来描述该行为。

对于具有更新机制的内容管理系统，请考虑使用具有较长缓存持续时间的标签，并依靠 `revalidateTag` 将静态初始 UI 标记为准备重新验证。这种模式允许我们提供快速的缓存响应，同时在内容实际更改时仍然更新内容，而不是抢先使缓存过期。

## 5. 把它们放在一起

下面是一个完整的示例，显示静态内容、缓存的动态内容和流式动态内容在单个页面上协同工作：

```tsx linenums="1" title="app/blog/page.tsx"
import { Suspense } from 'react'
import { cookies } from 'next/headers'
import { cacheLife } from 'next/cache'
import Link from 'next/link'
 
export default function BlogPage() {
  return (
    <>
      {/* Static content - prerendered automatically */}
      <header>
        <h1>Our Blog</h1>
        <nav>
          <Link href="/">Home</Link> | <Link href="/about">About</Link>
        </nav>
      </header>
 
      {/* Cached dynamic content - included in the static shell */}
      <BlogPosts />
 
      {/* Runtime dynamic content - streams at request time */}
      <Suspense fallback={<p>Loading your preferences...</p>}>
        <UserPreferences />
      </Suspense>
    </>
  )
}
 
// Everyone sees the same blog posts (revalidated every hour)
async function BlogPosts() {
  'use cache'
  cacheLife('hours')
 
  const res = await fetch('https://api.vercel.app/blog')
  const posts = await res.json()
 
  return (
    <section>
      <h2>Latest Posts</h2>
      <ul>
        {posts.slice(0, 5).map((post: any) => (
          <li key={post.id}>
            <h3>{post.title}</h3>
            <p>
              By {post.author} on {post.date}
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}
 
// Personalized per user based on their cookie
async function UserPreferences() {
  const theme = (await cookies()).get('theme')?.value || 'light'
  const favoriteCategory = (await cookies()).get('category')?.value
 
  return (
    <aside>
      <p>Your theme: {theme}</p>
      {favoriteCategory && <p>Favorite category: {favoriteCategory}</p>}
    </aside>
  )
}
```

在预渲染标题（静态）和从 API 获取的博客文章（`use cache` 进行缓存）期间，两者都与用户首选项的后备 UI 一起成为静态 shell 的一部分。


## 6. 元数据和视口



## 7. 启用缓存组件



## 8. 导航使用 Activity



## 9. 迁移路由段配置
