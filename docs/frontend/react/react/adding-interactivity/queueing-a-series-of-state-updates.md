# 队列：系列状态更新

设置状态变量将使另一个渲染排队。但有时你可能希望在排队下一次渲染之前对值执行多个操作。为此，有助于了解 React 如何批处理状态更新。

!!! note "你将学习到"

    - ”批处理” 是什么以及 React 如何使用它来处理多个状态更新
    - 如何连续对同一个状态变量应用多个更新

## 1. React 批量状态更新

你可能希望单击 “+3” 按钮会使计数器递增 3 次，因为它调用了 3 次 `setNumber(number + 1)`：

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

但是，你可能还记得上一节 [每个渲染器的状态值都是固定的](https://react.nodejs.cn/learn/state-as-a-snapshot#rendering-takes-a-snapshot-in-time)，所以第一个渲染事件处理程序中的 `number` 的值始终是 `0`，无论你调用 `setNumber(1)` 多少次：

```jsx linenums="1"
setNumber(0 + 1);
setNumber(0 + 1);
setNumber(0 + 1);
```

但这里还有另一个因素在起作用。在处理状态更新之前，React 会等到事件处理程序中的所有代码都已运行。这就是为什么重新渲染只发生在所有这些 setNumber() 调用之后。

这可能会让你想起在餐厅点菜的服务员。服务员不会一提到你的第一道菜就跑到厨房！而是，他们让你完成订单，让你对其进行更改，甚至接受桌上其他人的订单。

<figure markdown="span">
  ![img.png](https://mingminyu.github.io/webassets/images/qu-01.png)
</figure>


这使你可以更新多个状态变量 - 甚至来自多个组件 - 而不会触发太多 [重新渲染。](https://react.nodejs.cn/learn/render-and-commit#re-renders-when-state-updates) 但这也意味着在事件处理程序及其中的任何代码完成之前，UI 不会更新。这种行为（也称为批处理）使你的 React 应用运行得更快。它还避免处理只有部分变量已更新的令人困惑的 “half-finished” 渲染。

React 不会批量处理多个有意事件（例如点击） - 每次点击都是单独处理的。请放心，React 仅在通常安全的情况下才进行批处理。这确保了，例如，如果第一次单击按钮禁用了表单，则第二次单击不会再次提交它。

## 2. 在下次渲染前多次更新相同的状态

这是一个不常见的用例，但是如果你想在下一次渲染之前多次更新同一个状态变量，而不是像 `setNumber(number + 1)` 那样传递下一个状态值，你可以传递一个根据前一个状态计算下一个状态的函数到队列中，例如 `setNumber(n => n + 1)`。这是一种告诉 React “用状态值做某事” 而不是仅仅替换它的方法。

现在尝试增加计数器：

```jsx linenums="1" title="App.js"
import { useState } from 'react';

export default function Counter() {
  const [number, setNumber] = useState(0);

  return (
    <>
      <h1>{number}</h1>
      <button onClick={() => {
        setNumber(n => n + 1);
        setNumber(n => n + 1);
        setNumber(n => n + 1);
      }}>+3</button>
    </>
  )
}
```

这里，`n => n + 1` 被称为 **更新器函数**。当你将其传递给状态设置器时：

1. 在事件处理程序中的所有其他代码运行之后，React 将此函数排队等待处理。
2. 在下一次渲染期间，React 遍历队列并为你提供最终的更新状态。

```jsx linenums="1"
setNumber(n => n + 1);
setNumber(n => n + 1);
setNumber(n => n + 1);
```

以下是 React 在执行事件处理程序时如何处理这些代码行：

1. `setNumber(n => n + 1)`：`n => n + 1` 是一个函数。React 将其添加到队列中。
2. `setNumber(n => n + 1)`：`n => n + 1` 是一个函数。React 将其添加到队列中。
3. `setNumber(n => n + 1)`：`n => n + 1` 是一个函数。React 将其添加到队列中。

当你在下一次渲染期间调用 `useState` 时，React 会遍历队列。之前的 `number` 状态是 `0`，所以这就是 React 作为 `n` 参数传递给第一个更新函数的状态。然后 React 将你之前的更新函数的返回值作为 `n` 传递给下一个 updater，依此类推：

| 排队更新         | `n` | 返回          |
|--------------|-----|-------------|
| `n => n + 1` | `0` | `0 + 1 = 1` |
| `n => n + 1` | `1` | `1 + 1 = 2` |
| `n => n + 1` | `2` | `2 + 1 = 3` |


React 将 `3` 存储为最终结果并从 `useState` 返回它。这就是为什么在上例中单击 “+3” 会正确地将值增加 3。

### 2.1 在替换状态后更新状态

这个事件处理程序怎么样？你认为 `number` 会在下一次渲染中出现什么？

```jsx linenums="1" title="App.js" hl_lines="9-12"
import { useState } from 'react';

export default function Counter() {
  const [number, setNumber] = useState(0);

  return (
    <>
      <h1>{number}</h1>
      <button onClick={() => {
        setNumber(number + 5);
        setNumber(n => n + 1);
      }}>Increase the number</button>
    </>
  )
}
```

以下是此事件处理程序告诉 React 执行的操作：

1. `setNumber(number + 5)`：`number` 是 `0`，所以 `setNumber(0 + 5)`。React 将“替换为 `5`”添加到其队列中。
2. `setNumber(n => n + 1)`：`n => n + 1` 是一个更新函数。React 将该函数添加到它的队列中。

在下一次渲染期间，React 遍历状态队列：

| 排队更新     | `n`           | 返回        |
| ------------ | ------------- | ----------- |
| “替换为 `5`” | `0`（未使用） | `5`         |
| `n => n + 1` | `5`           | `5 + 1 = 6` |

React 将 `6` 存储为最终结果并从 `useState` 返回它。

!!! warning "注意"
    
    你可能已经注意到，`setState(5)` 实际上与 `setState(n => 5)` 一样工作，但 `n` 未被使用！


### 2.2 在替换状态后替换它

让我们再试一个例子。你认为 number 会在下一次渲染中出现什么？

```jsx
import { useState } from 'react';

export default function Counter() {
  const [number, setNumber] = useState(0);

  return (
    <>
      <h1>{number}</h1>
      <button onClick={() => {
        setNumber(number + 5);
        setNumber(n => n + 1);
        setNumber(42);
      }}>Increase the number</button>
    </>
  )
}
```

以下是 React 在执行此事件处理程序时如何处理这些代码行：

1. `setNumber(number + 5)`：`number` 是 `0`，所以 `setNumber(0 + 5)`。React 将“替换为 `5`”添加到其队列中。
2. `setNumber(n => n + 1)`：`n => n + 1` 是一个更新函数。React 将该函数添加到它的队列中。
3. `setNumber(42)`：React 将“替换为 `42`”添加到其队列中。

在下一次渲染期间，React 遍历状态队列：

| 排队更新         | `n`      | 返回          |
|--------------|----------|-------------|
| “替换为 `5`”    | `0`（未使用） | `5`         |
| `n => n + 1` | `5`      | `5 + 1 = 6` |
| “替换为 `42`”   | `6`（未使用） | `42`        |

然后 React 将 `42` 存储为最终结果并从 `useState` 返回它。

总而言之，你可以通过以下方式考虑传递给 `setNumber` 状态设置器的内容：

- 更新器函数（例如 `n => n + 1`）被添加到队列中。
- 任何其他值（例如数字 `5`）都会将“替换为 `5`”添加到队列中，忽略已排队的内容。

事件处理程序完成后，React 将触发重新渲染。在重新渲染期间，React 将处理队列。更新器函数在渲染期间运行，因此更新器函数必须是 [纯粹的](https://react.nodejs.cn/learn/keeping-components-pure) 并且仅返回结果。不要尝试从它们内部设置状态或运行其他副作用。在严格模式下，React 将运行每个更新程序函数两次（但丢弃第二次结果）以帮助你发现错误。


### 2.3 命名约定

通常用相应状态变量的首字母命名更新函数参数：

```jsx
setEnabled(e => !e);
setLastName(ln => ln.reverse());
setFriendCount(fc => fc * 2);
```

如果你喜欢更冗长的代码，另一个常见的约定是重复完整的状态变量名称，如 `setEnabled(enabled => !enabled)`，或使用像 `setEnabled(prevEnabled => !prevEnabled)` 这样的前缀。

## 3. 回顾

- 设置状态不会更改现有渲染中的变量，但它会请求一个新的渲染。
- React 在事件处理程序完成运行后处理状态更新。这称为批处理。
- 要在一个事件中多次更新某个状态，可以使用 `setNumber(n => n + 1)` 更新函数。
