# 定义路由

本页面将指导您如何在 Next.js 应用程序中定义和组织路由。

## 1. 创建路由

Next.js 使用基于文件系统的路由器，其中使用文件夹来定义路由，每个文件夹代表一个映射到 URL 段的路由段。要创建嵌套路由，我们可以将文件夹相互嵌套。

![](https://mingminyu.github.io/webassets/images/r-04.png)

一个特殊的 [page.js](https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts#pages) 文件用于使路由段可被公开访问。

![img.png](https://mingminyu.github.io/webassets/images/dr-01.png)

在此示例中，`/dashboard/analytics` URL 路径不可公开访问，因为它没有相应的 page.js 文件。该文件夹可用于存储组件、样式表、图像或其他并置文件。

!!! warning "注意"

    `.js`、`.jsx` 或 `.tsx` 文件扩展名可用于特殊文件。

## 2. 创建 UI

特殊的文件约定用于为每个路由段创建 UI。最常见的是显示路线=由独有的 UI 页面，以及显示跨多个路由共享的 UI 布局。例如，要创建第一个页面，请在应用程序目录中添加 `page.js` 文件并导出 React 组件：

```jsx linenums="1" title="app/page.tsx"
export default function Page() {
  return <h1>Hello, Next.js!</h1>
}
```