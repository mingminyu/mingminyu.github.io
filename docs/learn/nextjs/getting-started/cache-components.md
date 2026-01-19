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

​	借助 `Suspense` 边界，多个动态部分可以并行渲染，而不是相互阻塞，从而减少总加载时间。

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





### 3.3 非确定性操作







## 4. 使用 `use cache`



## 5. 把它们放在一起





## 6. 元数据和视口



## 7. 启用缓存组件



## 8. 导航使用 Activity



## 9. 迁移路由段配置
