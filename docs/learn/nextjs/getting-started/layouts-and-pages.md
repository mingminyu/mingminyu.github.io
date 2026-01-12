# 页面和布局

> 原文地址: https://nextjs.org/docs/app/getting-started/layouts-and-pages

Next.js 使用基于文件系统的路由，这意味着您可以使用文件夹和文件来定义路由。此页面将指导您如何创建布局和页面以及它们之间的链接。

## 1. 创建页面

页面是在特定路由上呈现的 UI。要创建页面，请在 `app` 目录中添加 `page` 文件并默认导出 React 组件。例如，要创建索引页 (`/`)：

![](https://mingminyu.github.io/webassets/images/nextjs/17.png)

```tsx title="app/page.tsx" linenums="1"
export default function Page() {
  return <h1>Hello Next.js!</h1>
}
```

## 2. 创建布局

布局是在多个页面之间共享的 UI。在导航时，布局将保留状态、保持交互性，并且 **不重新渲染**。

您可以通过从 `layout` 文件导出 React 组件来默认定义布局，该组件应该接受一个 `children` 属性，它可以是页面或其他布局。

例如，要创建接受索引页面作为子页面的布局，请在 `app` 目录中添加一个 `layout` 文件：

![](https://mingminyu.github.io/webassets/images/nextjs/18.png)

```tsx title="app/layout.tsx" linenums="1"
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {/* Layout UI */}
        {/* Place children where you want to render a page or nested layout */}
        <main>{children}</main>
      </body>
    </html>
  )
}
```

上面的布局称为根布局，因为它是在 `app` 根目录下定义的。根布局是必需的，并且必须包含 `html` 和 `body` 标签。

## 3. 创建嵌套路由

嵌套路由是由多个 URL 段组成的路由。例如，`/blog/[slug]` 路由由三段组成：

- `/`（根段）
- `blog`（子段）
- `[slug]`（叶子路由段）

在 Next.js 中：

- 文件夹用于定义映射到 URL 段的路由段。
- 文件（如 `page` 和 `layout`）用于创建为段显示的 UI。

要创建嵌套路由，您可以将文件夹相互嵌套。例如，要添加 `/blog` 的路由，请在 `app` 目录中创建一个名为 `blog` 文件夹。然后，要使 `/blog` 可供公开访问，请添加 `page.tsx` 文件：

![](https://mingminyu.github.io/webassets/images/nextjs/19.png)

```tsx title="app/blog/page.tsx" linenums="1"
// Dummy imports
import { getPosts } from '@/lib/posts'
import { Post } from '@/ui/post'
 
export default async function Page() {
  const posts = await getPosts()
 
  return (
    <ul>
      {posts.map((post) => (
        <Post key={post.id} post={post} />
      ))}
    </ul>
  )
}
```

您可以继续嵌套文件夹以创建嵌套路由。例如，要为特定博客文章创建路由，请在 `blog` 内创建一个新的 `[slug]` 文件夹并添加 `page` 文件：

![](https://mingminyu.github.io/webassets/images/nextjs/20.png)

```tsx title="app/blog/[slug]/page.tsx" linenums="1"
function generateStaticParams() {}
 
export default function Page() {
  return <h1>Hello, Blog Post Page!</h1>
}
```

将文件夹名称括在方括号中（例如 `[slug]`）会创建一个动态路由段，用于从数据生成多个页面。例如博客文章、产品页面等。

## 4. 嵌套布局

默认情况下，文件夹层次结构中的布局也是嵌套的，这意味着它们通过其 `children` 包装子布局。您可以通过在特定路由段（文件夹）内添加 `layout` 来嵌套布局。

例如，要为 `/blog` 路由创建布局，请在 `blog` 文件夹中添加新的 `layout` 文件。

![](https://mingminyu.github.io/webassets/images/nextjs/21.png)

```tsx title="app/blog/layout.tsx" linenums="1"
export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <section>{children}</section>
}
```

如果要组合上面的两个布局，根布局(`app/layout.js`) 将包装博客布局(`app/blog/layout.js` )，博客布局(`app/blog/layout.js`) 将包装博客(`app/blog/page.js`) 和博客文章页面(`app/blog/[slug]/page.js`)。

## 5. 创建动态段

动态路由段允许我们创建根据数据生成的路由。例如，我们可以创建动态分段来根据博客文章数据生成路由，而不是为每个单独的博客文章手动创建路由。

要创建动态段，请将段（文件夹）名称括在方括号中：`[segmentName]`。例如，在 `app/blog/[slug]/page.tsx` 路由中，`[slug]` 是动态段。

```tsx title="app/blog/[slug]/page.tsx" linenums="1"
export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await getPost(slug)
 
  return (
    <div>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </div>
  )
}
```

动态段中的嵌套布局也可以访问 `params` 属性。

## 6. 使用搜索参数渲染

在服务器组件页面中，您可以使用 `searchParams` 属性访问搜索参数：

```tsx title="app/page.tsx" linenums="1"
export default async function Page({
  searchParams,

}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const filters = (await searchParams).filters
}
```

使用 `searchParams` 会将您的页面选择为动态呈现，因为它需要传入请求才能从中读取搜索参数。客户端组件可以使用 `useSearchParams` 钩子读取搜索参数。

!!! note "使用什么以及何时使用"

    - 当您需要 `searchParams` 来加载页面数据时（例如分页、从数据库中过滤），请使用 `searchParams` 属性。
    - 当搜索参数仅在客户端使用时，可以使用 `useSearchParams`（例如过滤已通过 props 加载的列表）。
    - 作为一个小的优化，您可以在回调或事件处理程序中使用 `new URLSearchParams(window.location.search)` 来读取搜索参数，而不会触发重新渲染。

## 7. 页面间的链接

您可以使用 `<Link>` 组件在路线之间导航，`<Link>`是一个内置的 Next.js 组件，它扩展了 HTML `<a>` 标签以提供预取和客户端导航。例如，要生成博客文章列表，请从 `next/link` 导入 `<Link>` 并将 `href` 属性传递给组件：

```tsx title="app/ui/post.tsx" linenums="1" hl_lines="1 10"
import Link from 'next/link'
 
export default async function Post({ post }) {
  const posts = await getPosts()
 
  return (
    <ul>
      {posts.map((post) => (
        <li key={post.slug}>
          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
        </li>
      ))}
    </ul>
  )
}
```

!!! note "备注"

    `<Link>` 是 Next.js 中路由之间导航的主要方式，您还可以使用 `useRouter` 钩子进行更高级的导航。

## 8. 路由Props助手

Next.js 公开了从路由结构推断 `params` 和命名槽的实用程序类型：

- `PageProps`: `page` 组件的 Props，包括`params`和`searchParams`。
- `LayoutProps`: `layout` 组件的 Props，包括 `children` 和任何命名槽（例如 `@analytics` 之类的文件夹）。

这些是全局可用的帮助程序，在运行 `next dev` 、 `next build` 或 `next typegen` 时生成。

```tsx title="app/blog/[slug]/page.tsx" linenums="1"
export default async function Page(props: PageProps<'/blog/[slug]'>) {
  const { slug } = await props.params
  return <h1>Blog post: {slug}</h1>
}
```

```tsx title="app/dashboard/layout.tsx" linenums="1"
export default function Layout(props: LayoutProps<'/dashboard'>) {
  return (
    <section>
      {props.children}
      {/* If you have app/dashboard/@analytics, it appears as a typed slot: */}
      {/* {props.analytics} */}
    </section>
  )
}
```

!!! note "备注"

    - 静态路由将 `params` 解析为 `{}`。
    - `PageProps` 、`LayoutProps` 是全局助手——不需要导入。
    - 类型是 `next dev` 、`next build` 或 `next typegen` 期间生成的。
