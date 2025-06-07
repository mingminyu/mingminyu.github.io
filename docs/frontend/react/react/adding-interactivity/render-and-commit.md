# 渲染和提交

在你的组件显示在屏幕上之前，它们必须由 React 渲染。了解此过程中的步骤将帮助你思考代码的执行方式并解释其行为。

!!! note "你将学习到"

    - React 中的渲染意味着什么
    - React 何时以及为何渲染组件
    - 在屏幕上显示组件所涉及的步骤
    - 为什么渲染并不总是产生 DOM 更新

想象一下，你的组件是厨房里的厨师，用食材烹制美味佳肴。在这个场景中，React 是一个服务员，负责接收客户的请求并为他们带来订单。这个请求和提供 UI 的过程分为三个步骤：

1. 触发渲染（将客人的订单送到厨房）
2. 渲染组件（在厨房准备订单）
3. 提交给 DOM（将订单放在表格上）

![](https://mingminyu.github.io/webassets/images/20250607/42.png)

## 1. 触发渲染

组件渲染的原因有两个：

1. 这是组件的初始渲染。
2. 组件（或其祖级之一）的状态已更新。

### 1.1 初步渲染

当你的应用启动时，你需要触发初始渲染。框架和沙箱有时会隐藏此代码，但它是通过使用目标 DOM 节点调用 [`createRoot`](https://react.nodejs.cn/reference/react-dom/client/createRoot)，然后使用你的组件调用其 `render` 方法来完成的：

???+ example "示例"
    
    === "index.js"
    
        ```jsx linenums="1"
        import Image from './Image.js';
        import { createRoot } from 'react-dom/client';
        
        const root = createRoot(document.getElementById('root'))
        root.render(<Image />);
        ```
    
    === "Image.js"
    
        ```jsx linenums="1"
        export default function Image() {
          return (
            <img
              src="https://i.imgur.com/ZF6s192.jpg"
              alt="'Floralis Genérica' by Eduardo Catalano: a gigantic metallic flower sculpture with reflective petals"
            />
          );
        }
        ```

尝试注释掉 `root.render()` 调用，然后看到组件消失了！

### 1.2 状态更新时重新渲染

组件最初渲染后，你可以通过使用 [`set` 函数](https://react.nodejs.cn/reference/react/useState#setstate) 更新其状态来触发进一步的渲染。更新组件的状态会自动对渲染进行排队。（你可以把这些想象成餐厅客人在第一次点菜后点茶、甜点和各种各样的东西，这取决于他们的口渴或饥饿状态。）

![img.png](https://mingminyu.github.io/webassets/images/20250607/33.png)

## 2. React渲染组件

触发渲染后，React 会调用你的组件来确定要在屏幕上显示的内容。“渲染” 是 React 调用你的组件。

- 在初始渲染时，React 将调用根组件。
- 对于后续的渲染，React 将调用其状态更新触发渲染的函数组件。

这个过程是递归的：如果更新的组件返回一些其他组件，React 将接下来渲染该组件，如果该组件也返回一些东西，它将接下来渲染该组件，依此类推。这个过程将一直持续到没有更多的嵌套组件并且 React 确切地知道应该在屏幕上显示什么。

在下面的例子中，React 将多次调用 `Gallery()` 和 `Image()`：


???+ example "示例"
    
    === "index.js"
    
        ```jsx linenums="1"
        import Gallery from './Gallery.js';
        import { createRoot } from 'react-dom/client';
        
        const root = createRoot(document.getElementById('root'))
        root.render(<Gallery />);
        ```
    
    === "Gallery.js"
    
        ```jsx linenums="1"
        export default function Gallery() {
          return (
            <section>
              <h1>Inspiring Sculptures</h1>
              <Image />
              <Image />
              <Image />
            </section>
          );
        }
        
        function Image() {
          return (
            <img
              src="https://i.imgur.com/ZF6s192.jpg"
              alt="'Floralis Genérica' by Eduardo Catalano: a gigantic metallic flower sculpture with reflective petals"
            />
          );
        }
        ```

- 在初始渲染期间，React 将为 `<section>`、`<h1>` 和三个 `<img>` 标签使用 [创建 DOM 节点](https://web.nodejs.cn/docs/Web/API/Document/createElement)。
- 在重新渲染期间，React 将计算自上次渲染以来它们的哪些属性（如果有）发生了更改。在下一步，即提交阶段之前，它不会对这些信息做任何事情。

!!! warning "易犯错误"

    渲染必须始终为 [纯计算](https://react.nodejs.cn/learn/keeping-components-pure)：
    
    - 相同的输入，相同的输出。给定相同的输入，组件应该始终返回相同的 JSX。（当有人点西红柿沙拉时，他们不应该收到洋葱沙拉！）
    - 它只管自己的事。它不应更改渲染前存在的任何对象或变量。（一个订单不应更改任何其他人的订单。）
    
    否则，随着代码库变得越来越复杂，你可能会遇到令人困惑的错误和不可预知的行为。在 “严格模式” 开发时，React 会调用每个组件的函数两次，这可以帮助表面因函数不纯而导致的错误。

??? tip "优化性能"

    如果更新组件在树中的位置非常高，则渲染嵌套在更新组件中的所有组件的默认行为对于性能来说并不是最佳的。如果遇到性能问题，[性能](https://react.nodejs.cn/docs/optimizing-performance.html) 部分中描述了几种选择加入的方法来解决它。不要过早优化！

## 3. React提交更改给DOM

在渲染（调用）你的组件后，React 将修改 DOM。

- 对于初始渲染，React 将使用 [`appendChild()`](https://web.nodejs.cn/docs/Web/API/Node/appendChild) DOM API 将其创建的所有 DOM 节点放在屏幕上。
- 对于重新渲染，React 将应用最少的必要操作（在渲染时计算！）以使 DOM 匹配最新的渲染输出。

如果渲染之间存在差异，React 只会更改 DOM 节点。例如，这里有一个组件每秒使用从其父级传递的不同属性重新渲染。请注意如何将一些文本添加到 `<input>` 中，更新其 `value`，但当组件重新渲染时文本不会消失：

```jsx linenums="1" title="Clock.js"
export default function Clock({ time }) {
  return (
    <>
      <h1>{time}</h1>
      <input />
    </>
  );
}
```

这是可行的，因为在最后一步中，React 仅使用新的 `time` 更新 `<h1>` 的内容。它看到 `<input>` 出现在 JSX 中与上次相同的位置，因此 React 不会触及 `<input>` — 或其 `value`！

## 4. 结语：浏览器画图

渲染完成并且 React 更新 DOM 后，浏览器将重新绘制屏幕。尽管此过程称为 “浏览器渲染”，但我们将其称为 “绘制” 以避免在整个文档中造成混淆。

![img.png](https://mingminyu.github.io/webassets/images/20250607/34.png)

## 5. 回顾

1. React 应用中的任何屏幕更新都分三步进行：触发、渲染、提交
2. 你可以使用严格模式查找组件中的错误
3. 如果渲染结果与上次相同，React 不会触及 DOM