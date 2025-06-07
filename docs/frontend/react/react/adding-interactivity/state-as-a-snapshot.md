# 状态快照

状态变量可能看起来像你可以读取和写入的常规 JavaScript 变量。但是，状态的行为更像是快照。设置它不会更改你已有的状态变量，而是会触发重新渲染。

!!! note "你将学习到"

    - 设置状态如何触发重新渲染
    - 状态何时以及如何更新
    - 为什么设置后状态不会立即更新
    - 事件处理程序如何访问状态的 “快照”

## 1. 设置状态触发渲染

你可能认为你的用户界面会直接响应用户事件（如点击）而发生变化。在 React 中，它的工作方式与这种心智模型略有不同。在上一页中，你看到了来自 React 的 [设置状态请求重新渲染](https://react.nodejs.cn/learn/render-and-commit#step-1-trigger-a-render)。这意味着要让界面对事件做出 React，你需要更新状态。

在这个例子中，当你按下 “发送” 时，`setIsSent(true)` 告诉 React 重新渲染 UI：

```jsx linenums="1" title="App.js"
import { useState } from 'react';

export default function Form() {
  const [isSent, setIsSent] = useState(false);
  const [message, setMessage] = useState('Hi!');
  if (isSent) {
    return <h1>Your message is on its way!</h1>
  }
  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      setIsSent(true);
      sendMessage(message);
    }}>
      <textarea
        placeholder="Message"
        value={message}
        onChange={e => setMessage(e.target.value)}
      />
      <button type="submit">Send</button>
    </form>
  );
}

function sendMessage(message) {
  // ...
}
```

单击按钮时会发生以下情况：

1. `onSubmit` 事件处理程序执行。
2. `setIsSent(true)` 将 `isSent` 设置为 `true` 并将新渲染排队。
3. React 根据新的 `isSent` 值重新渲染组件。

让我们仔细看看状态和渲染之间的关系。

## 2. 渲染及时拍快照

[”渲染”](https://react.nodejs.cn/learn/render-and-commit#step-2-react-renders-your-components) 表示 React 正在调用你的组件，这是一个函数。从该函数返回的 JSX 就像 UI 的及时快照。它的属性、事件处理程序和局部变量都是使用渲染时的状态来计算的。

与照片或电影画面不同，你返回的 UI “快照” 是交互式的。它包括类似事件处理程序的逻辑，用于指定响应输入时发生的事情。React 更新屏幕以匹配此快照并连接事件处理程序。因此，按下按钮将触发来自 JSX 的点击处理程序。

当 React 重新渲染一个组件时：

1. React 再次调用你的函数。
2. 你的函数返回一个新的 JSX 快照。
3. 然后 React 更新屏幕以匹配函数返回的快照。

![img.png](https://mingminyu.github.io/webassets/images/20250607/37.png)

作为组件的内存，状态不像一个常规变量，在你的函数返回后就消失了。实际上在 React 本身中声明 “存在” - 就像束之高阁一样！在你的函数之外。当 React 调用你的组件时，它会为你提供该特定渲染的状态快照。你的组件返回 UI 的快照，并在其 JSX 中包含一组新的属性和事件处理程序，所有这些都使用该渲染中的状态值进行计算！

![img.png](https://mingminyu.github.io/webassets/images/20250607/38.png)


这是一个小实验，向你展示这是如何工作的。在此示例中，你可能希望单击 “+3” 按钮会使计数器递增 3 次，因为它调用了 3 次 `setNumber(number + 1)`。

看看当你点击 “+3” 按钮时会发生什么：

```jsx linenums="1" title="App.js"
import { useState } from 'react';

export default function Counter() {
  const [number, setNumber] = useState(0);

  return (
    <>
      <h1>{number}</h1>
      <button onClick={() => {
        setNumber(number + 1);
        setNumber(number + 1);
        setNumber(number + 1);
      }}>+3</button>
    </>
  )
}
```

请注意，`number` 每次点击只会增加一次！

设置状态只会为下一次渲染更改它。在第一次渲染中，`number` 是 `0`。这就是为什么在该渲染器的 `onClick` 处理程序中，即使在调用 `setNumber(number + 1)` 之后，`number` 的值仍然是 `0`：

```jsx linenums="1"
<button onClick={() => {
  setNumber(number + 1);
  setNumber(number + 1);
  setNumber(number + 1);
}}>+3</button>
```

以下是此按钮的点击处理程序告诉 React 执行的操作：

1. `setNumber(number + 1)`：`number` 是 `0` 所以 `setNumber(0 + 1)`。
   - React 准备在下一次渲染时将 `number` 更改为 `1`。
2. `setNumber(number + 1)`：`number` 是 `0` 所以 `setNumber(0 + 1)`。
   - React 准备在下一次渲染时将 `number` 更改为 `1`。
3. `setNumber(number + 1)`：`number` 是 `0` 所以 `setNumber(0 + 1)`。
   - React 准备在下一次渲染时将 `number` 更改为 `1`。

即使你调用了 `setNumber(number + 1)` 三次，在此渲染的事件处理程序中，`number` 始终是 `0`，因此你将状态设置为 `1` 三次。这就是为什么在事件处理程序完成后，React 会重新渲染 `number` 等于 `1` 而不是 `3` 的组件。

你还可以通过在代码中用状态变量的值在心里替换它们来形象化这一点。由于此渲染的 `number` 状态变量为 `0`，因此其事件处理程序如下所示：

```jsx linenums="1"
<button onClick={() => {
  setNumber(0 + 1);
  setNumber(0 + 1);
  setNumber(0 + 1);
}}>+3</button>
```

对于下一个渲染，`number` 是 `1`，因此渲染的点击处理程序如下所示：

```jsx linenums="1"
<button onClick={() => {
  setNumber(1 + 1);
  setNumber(1 + 1);
  setNumber(1 + 1);
}}>+3</button>
```

这就是为什么再次单击该按钮会将计数器设置为 `2`，然后在下一次单击时设置为 `3`，依此类推。

## 3. 随时间变化的状态

好吧，那很有趣。尝试猜测点击这个按钮会提示什么：

```jsx linenums="1" title="App.js"
import { useState } from 'react';

export default function Counter() {
  const [number, setNumber] = useState(0);

  return (
    <>
      <h1>{number}</h1>
      <button onClick={() => {
        setNumber(number + 5);
        alert(number);
      }}>+5</button>
    </>
  )
}
```

如果你使用之前的替换方法，你可以猜测警报显示 “0”：

```jsx linenums="1"
setNumber(0 + 5);
alert(0);
```

但是，如果你将计时器置于警报状态，使其仅在组件重新渲染后触发怎么办？它会说 “0” 还是 “5”？猜一猜！

```jsx linenums="1" title="App.js"
import { useState } from 'react';

export default function Counter() {
  const [number, setNumber] = useState(0);

  return (
    <>
      <h1>{number}</h1>
      <button onClick={() => {
        setNumber(number + 5);
        setTimeout(() => {
          alert(number);
        }, 3000);
      }}>+5</button>
    </>
  )
}
```

惊讶吗？如果使用替换方法，你可以看到传递给警报的状态的 “快照”。

```jsx linenums="1"
setNumber(0 + 5);
setTimeout(() => {
  alert(0);
}, 3000);
```

警报运行时存储在 React 中的状态可能已经改变，但它是使用用户与之交互时的状态快照来安排的！

状态变量的值在渲染中永远不会改变，即使其事件处理程序的代码是异步的。在该渲染器的 `onClick` 中，即使在调用 `setNumber(number + 5)` 之后，`number` 的值仍然是 `0`。当通过调用你的组件对 UI 进行 React “拍了快照” 时，它的值为 “固定”。

下面是一个示例，说明这如何使你的事件处理程序更不容易出现计时错误。下面是一个以五秒延迟发送消息的表单。想象一下这个场景：

1. 你按下 “发送” 按钮，将 “你好” 发送给 Alice。
2. 在五秒延迟结束之前，你将 “到达” 字段的值更改为 “Bob”。

你期望 `alert` 显示什么？它会显示 “你向 Alice 问好” 吗？或者它会显示，“你向 Bob 问好”？根据你所知道的进行猜测，然后尝试：

```jsx linenums="1" title="App.js"
import { useState } from 'react';

export default function Form() {
  const [to, setTo] = useState('Alice');
  const [message, setMessage] = useState('Hello');

  function handleSubmit(e) {
    e.preventDefault();
    setTimeout(() => {
      alert(`You said ${message} to ${to}`);
    }, 5000);
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        To:{' '}
        <select
          value={to}
          onChange={e => setTo(e.target.value)}>
          <option value="Alice">Alice</option>
          <option value="Bob">Bob</option>
        </select>
      </label>
      <textarea
        placeholder="Message"
        value={message}
        onChange={e => setMessage(e.target.value)}
      />
      <button type="submit">Send</button>
    </form>
  );
}
```

React 将状态值 “固定” 保存在一个渲染器的事件处理程序中。你无需担心代码运行时状态是否发生了变化。

但是如果你想在重新渲染之前读取最新状态怎么办？你会想要使用 [状态更新函数](https://react.nodejs.cn/learn/queueing-a-series-of-state-updates)，将在下一页介绍！

## 4. 回顾

- 设置状态请求新的渲染。
- React 将状态存储在组件外部，就像束之高阁一样。
- 当你调用 `useState` 时，React 会为你提供该渲染状态的快照。
- 变量和事件处理程序在重新渲染时不会 “幸存”。每个渲染器都有自己的事件处理程序。
- 每个渲染器（以及其中的函数）都将始终 “看到” React 提供给该渲染器的状态快照。
- 你可以在心理上替换事件处理程序中的状态，类似于你对渲染的 JSX 的看法。
- 过去创建的事件处理程序具有创建它们时所在的渲染中的状态值。
