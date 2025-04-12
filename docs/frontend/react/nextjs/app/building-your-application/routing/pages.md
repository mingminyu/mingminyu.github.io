# 页面

页面是路由特有的 UI，我们可以默认从 `page.js` 文件导出组件来定义页面。例如，要创建索引页面 `index`，请在应用程序目录 `app` 中添加 `page.js` 文件：

![img.png](https://mingminyu.github.io/webassets/images/abrp-01.png)

```jsx linenums="1" title="app/page.tsx"
// `app/page.tsx` is the UI for the `/` URL
export default function Page() {
  return <h1>Hello, Home page!</h1>
}
```

然后，要创建更多页面，请创建一个文件夹并在其中添加 `page.js` 文件。例如，要为 `/dashboard` 路由创建页面，请创建一个名为 `dashboard` 的新文件夹，并在其中添加 `page.js` 文件：

```jsx linenums="1" title="app/dashboard/page.tsx"
// `app/dashboard/page.tsx` is the UI for the `/dashboard` URL
export default function Page() {
  return <h1>Hello, Dashboard Page!</h1>
}
```

!!! note "补充"
    
    - `.js`、`.jsx` 或 `.tsx` 文件扩展名可用于页面
    - 页面始终是路由子树的叶子节点
    - 需要 `page.js` 文件才能公开访问路由段
    - 默认情况下，页面是服务端组件，但也可以设置为客户端组件
    - 页面可以获取数据，查看[数据获取](https://nextjs.org/docs/app/building-your-application/data-fetching)部分以获取更多信息
