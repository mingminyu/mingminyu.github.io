# 保持组件纯粹

部分 JavaScript 函数是 **纯粹** 的，这类函数通常被称为纯函数。纯函数仅执行计算操作，不做其他操作。你可以通过将组件按纯函数严格编写，以避免一些随着代码库的增长而出现的、令人困扰的 bug 以及不可预测的行为。但为了获得这些好处，你需要遵循一些规则。

!!! note "你将学习到"

    - 纯函数是什么，以及它如何帮助你避免 bug
    - 如何将数据变更与渲染过程分离，以保持组件的纯粹
    - 如何使用严格模式发现组件中的错误

## 1. 纯函数：组件作为公式

在计算机科学中（尤其是函数式编程的世界中），[纯函数](https://wikipedia.org/wiki/Pure_function) 通常具有如下特征：

- **只负责自己的任务**。它不会更改在该函数调用前就已存在的对象或变量。
- **输入相同，则输出相同**。给定相同的输入，纯函数应总是返回相同的结果。

举个你非常熟悉的纯函数示例：数学中的公式。

考虑如下数学公式：y = 2x。

- 若 x = 2 则 y = 4。永远如此。
- 若 x = 3 则 y = 6。永远如此。
- 若 x = 3，那么 y 并不会因为时间或股市的影响，而有时等于 9 、 –1 或 2.5。
- 若 y = 2x 且 x = 3, 那么 y *永远* 等于 6.

我们使用 JavaScript 的函数实现，看起来将会是这样：

```ts linenums="1"
function double(number) {
  return 2 * number;
}
```

上述例子中，`double()` 就是一个 **纯函数**。如果你传入 `3` ，它将总是返回 `6` 。

React 便围绕着这个概念进行设计。**React 假设你编写的所有组件都是纯函数**。也就是说，对于相同的输入，你所编写的 React 组件必须总是返回相同的 JSX。

```ts linenums="1" title="App.js"
function Recipe({ drinkers }) {
  return (
    <ol>    
      <li>Boil {drinkers} cups of water.</li>
      <li>Add {drinkers} spoons of tea and {0.5 * drinkers} spoons of spice.</li>
      <li>Add {0.5 * drinkers} cups of milk to boil and sugar to taste.</li>
    </ol>
  );
}

export default function App() {
  return (
    <section>
      <h1>Spiced Chai Recipe</h1>
      <h2>For two</h2>
      <Recipe drinkers={2} />
      <h2>For a gathering</h2>
      <Recipe drinkers={4} />
    </section>
  );
}
```

当你给函数 `Recipe` 传入 `drinkers={2}` 参数时，它将返回包含 `2 cups of water` 的 JSX。永远如此。而当你传入 `drinkers={4}` 时，它将返回包含 `4 cups of water` 的 JSX。永远如此。

就像数学公式一样。

你可以把你的组件当作食谱：如果你遵循它们，并且在烹饪过程中不引入新食材，你每次都会得到相同的菜肴。那这道 “菜肴” 就是组件用于 React [渲染](https://zh-hans.react.dev/learn/render-and-commit) 的 JSX。

## 2. 副作用：（不符合）预期的后果

React 的渲染过程必须自始至终是纯粹的。组件应该只 **返回** 它们的 JSX，而不 **改变** 在渲染前，就已存在的任何对象或变量 — 这将会使它们变得不纯粹！

以下是违反这一规则的组件示例：

```ts linenums="1" title="App.js"
let guest = 0;

function Cup() {
  // Bad：正在更改预先存在的变量！
  guest = guest + 1;
  return <h2>Tea cup for guest #{guest}</h2>;
}

export default function TeaSet() {
  return (
    <>
      <Cup />
      <Cup />
      <Cup />
    </>
  );
}
```

该组件正在读写其外部声明的 `guest` 变量。这意味着 **多次调用这个组件会产生不同的 JSX**！并且，如果 **其他** 组件读取 `guest` ，它们也会产生不同的 JSX，其结果取决于它们何时被渲染！这是无法预测的。

回到我们的公式 y = 2x ，现在即使 x = 2 ，我们也不能相信 y = 4 。我们的测试可能会失败，我们的用户可能会感到困扰，飞机可能会从天空坠毁——你将看到这会引发多么扑朔迷离的 bugs！

你可以 [将 `guest` 作为 prop 传入](https://zh-hans.react.dev/learn/passing-props-to-a-component) 来修复此组件：

```ts linenums="1" title="App.js"
function Cup({ guest }) {
  return <h2>Tea cup for guest #{guest}</h2>;
}

export default function TeaSet() {
  return (
    <>
      <Cup guest={1} />
      <Cup guest={2} />
      <Cup guest={3} />
    </>
  );
}
```

现在你的组件就是纯粹的，因为它返回的 JSX 只依赖于 `guest` prop。

一般来说，你不应该期望你的组件以任何特定的顺序被渲染。调用 y = 5x 和 y = 2x 的先后顺序并不重要：这两个公式相互独立。同样地，每个组件也应该“独立思考”，而不是在渲染过程中试图与其他组件协调，或者依赖于其他组件。渲染过程就像是一场学校考试：每个组件都应该自己计算 JSX！

???+ example "深入讨论：使用严格模式检测不纯的计算"

    尽管你可能还没使用过，但在 React 中，你可以在渲染时读取三种输入：[props](https://zh-hans.react.dev/learn/passing-props-to-a-component)，[state](https://zh-hans.react.dev/learn/state-a-components-memory) 和 [context](https://zh-hans.react.dev/learn/passing-data-deeply-with-context)。你应该始终将这些输入视为只读。

    当你想根据用户输入 *更改* 某些内容时，你应该 [设置状态](https://zh-hans.react.dev/learn/state-a-components-memory)，而不是直接写入变量。当你的组件正在渲染时，你永远不应该改变预先存在的变量或对象。

    React 提供了 “严格模式”，在严格模式下开发时，它将会调用每个组件函数两次。**通过重复调用组件函数，严格模式有助于找到违反这些规则的组件**。

    我们注意到，原始示例显示的是 “Guest #2”、“Guest #4” 和 “Guest #6”，而不是 “Guest #1”、“Guest #2” 和 “Guest #3”。原来的函数并不纯粹，因此调用它两次就出现了问题。但对于修复后的纯函数版本，即使调用该函数两次也能得到正确结果。**纯函数仅仅执行计算，因此调用它们两次不会改变任何东西** — 就像两次调用 `double(2)` 并不会改变返回值，两次求解 y = 2x 不会改变 y 的值一样。相同的输入，总是返回相同的输出。

    严格模式在生产环境下不生效，因此它不会降低应用程序的速度。如需引入严格模式，你可以用 `<React.StrictMode>` 包裹根组件。一些框架会默认这样做。

### 2.1 局部 mutation：组件的小秘密

上述示例的问题出在渲染过程中，组件改变了 **预先存在的** 变量的值。为了让它听起来更可怕一点，我们将这种现象称为 **突变（mutation）** 。纯函数不会改变函数作用域外的变量、或在函数调用前创建的对象——这会使函数变得不纯粹！

但是，**你完全可以在渲染时更改你 \*刚刚\* 创建的变量和对象**。在本示例中，你创建一个 `[]` 数组，将其分配给一个 `cups` 变量，然后 `push` 一打 cup 进去：

```ts linenums="1" title="App.js"
function Cup({ guest }) {
  return <h2>Tea cup for guest #{guest}</h2>;
}

export default function TeaGathering() {
  let cups = [];
  for (let i = 1; i <= 12; i++) {
    cups.push(<Cup key={i} guest={i} />);
  }
  return cups;
}
```

如果 `cups` 变量或 `[]` 数组是在 `TeaGathering` 函数之外创建的，这将是一个很大的问题！因为如果那样的话，当你调用数组的 push 方法时，就会更改 **预先存在的** 对象。

但是，这里不会有影响，因为每次渲染时，你都是在 `TeaGathering` 函数内部创建的它们。`TeaGathering` 之外的代码并不会知道发生了什么。这就被称为 **“局部 mutation”** — 如同藏在组件里的小秘密。

## 3. 哪些地方 **可能** 引发副作用 

函数式编程在很大程度上依赖于纯函数，但 **某些事物** 在特定情况下不得不发生改变。这是编程的要义！这些变动包括更新屏幕、启动动画、更改数据等，它们被称为 **副作用**。它们是 **“额外”** 发生的事情，与渲染过程无关。

在 React 中，**副作用通常属于 [事件处理程序](https://zh-hans.react.dev/learn/responding-to-events)**。事件处理程序是 React 在你执行某些操作（如单击按钮）时运行的函数。即使事件处理程序是在你的组件 **内部** 定义的，它们也不会在渲染期间运行！ **因此事件处理程序无需是纯函数**。

如果你用尽一切办法，仍无法为副作用找到合适的事件处理程序，你还可以调用组件中的 [`useEffect`](https://zh-hans.react.dev/reference/react/useEffect) 方法将其附加到返回的 JSX 中。这会告诉 React 在渲染结束后执行它。**然而，这种方法应该是你最后的手段**。

如果可能，请尝试仅通过渲染过程来表达你的逻辑。你会惊讶于这能带给你多少好处！

???+ tip "React 为何侧重于纯函数? "

    编写纯函数需要遵循一些习惯和规程。但它开启了绝妙的机遇：

    - 你的组件可以在不同的环境下运行 — 例如，在服务器上！由于它们针对相同的输入，总是返回相同的结果，因此一个组件可以满足多个用户请求。
    - 你可以为那些输入未更改的组件来 [跳过渲染](https://zh-hans.react.dev/reference/react/memo)，以提高性能。这是安全的做法，因为纯函数总是返回相同的结果，所以可以安全地缓存它们。
    - 如果在渲染深层组件树的过程中，某些数据发生了变化，React 可以重新开始渲染，而不会浪费时间完成过时的渲染。纯粹性使得它随时可以安全地停止计算。

    我们正在构建的每个 React 新特性都利用到了纯函数。从数据获取到动画再到性能，保持组件的纯粹可以充分释放 React 范式的能力。

## 4. 摘要

- 一个组件必须是纯粹的，就意味着：
  - **只负责自己的任务。** 它不会更改在该函数调用前就已存在的对象或变量。
  - **输入相同，则输出相同。** 给定相同的输入，组件应该总是返回相同的 JSX。
- 渲染随时可能发生，因此组件不应依赖于彼此的渲染顺序。
- 你不应该改变任何用于组件渲染的输入。这包括 props、state 和 context。通过 [“设置” state](https://zh-hans.react.dev/learn/state-a-components-memory) 来更新界面，而不要改变预先存在的对象。
- 努力在你返回的 JSX 中表达你的组件逻辑。当你需要“改变事物”时，你通常希望在事件处理程序中进行。作为最后的手段，你可以使用 `useEffect`。
- 编写纯函数需要一些练习，但它充分释放了 React 范式的能力。
