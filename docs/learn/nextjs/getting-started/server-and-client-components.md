# 服务端和客户端组件

> 原文地址：https://nextjs.org/docs/app/getting-started/server-and-client-components

默认情况下，布局和页面是服务端组件，它允许我们在服务器上获取数据并渲染部分 UI，可以选择缓存结果，并将其流式传输到客户端。当您需要交互性或浏览器 API 时，可以使用客户端组件来堆积功能。

本页介绍了服务端和客户端组件如何在 Next.js 中工作以及何时使用它们，并提供了如何在应用程序中将它们组合在一起的示例。

## 1. 何时使用服务端和客户端组件？

客户端和服务端的环境具有不同的功能，服务端和客户端组件允许您根据实际用例在每个环境中运行逻辑。

当您需要时使用客户端组件：

- 状态和事件处理程序，例如 `onClick`、`onChange`。
- 生命周期逻辑，例如 `useEffect`。
- 仅限浏览器的 API，例如 `localStorage`、`window`、`Navigator.geolocation` 等。
