# 响应事件

React 允许你向 JSX 添加事件处理程序。事件处理程序是你自己的函数，将被触发以响应单击、悬停、聚焦表单输入等交互。

!!! note "你将学习到"

    - 编写事件处理程序的不同方法
    - 如何从父组件传递事件处理逻辑
    - 事件如何传播以及如何阻止它们

## 1. 添加事件处理程序

要添加事件处理程序，你将首先定义一个函数，然后 [作为属性传递](https://react.nodejs.cn/learn/passing-props-to-a-component) 到适当的 JSX 标记。例如，这是一个尚未执行任何操作的按钮：

```jsx linenums="1" title="App.js"
export default function Button() {
  return (
    <button>
      I don't do anything
    </button>
  );
}
```

你可以按照以下三个步骤使其在用户单击时显示消息：

1. 在 `Button` 组件中声明一个名为 `handleClick` 的函数。
2. 在该函数内实现逻辑（使用 `alert` 显示消息）。
3. 将 `onClick={handleClick}` 添加到 `<button>` JSX。

```jsx linenums="1" title="App.js"
export default function Button() {
  function handleClick() {
    alert('You clicked me!');
  }

  return (
    <button onClick={handleClick}>
      Click me
    </button>
  );
}
```

你定义了 `handleClick` 函数，然后定义了 [作为属性传递它](https://react.nodejs.cn/learn/passing-props-to-a-component) 到 `<button>`。`handleClick` 是一个事件处理程序。事件处理函数：

- 通常在你的组件内部定义。
- 名称以 `handle` 开头，后跟事件名称。
    
按照惯例，**通常将事件处理程序命名为 `handle` 后跟事件名称**。你会经常看到 `onClick={handleClick}`、`onMouseEnter={handleMouseEnter}` 等。

或者，你可以在 JSX 中内联定义事件处理程序：

```jsx linenums="1"
<button onClick={function handleClick() {
  alert('You clicked me!');
}}>
```

或者，更简洁地说，使用箭头函数：

```jsx linenums="1"
<button onClick={() => {
  alert('You clicked me!');
}}>
```

所有这些风格都是等价的。内联事件处理程序对于短函数很方便。

???+ warning "容易犯错"

    传递给事件处理程序的函数必须被传递，而不是被调用。例如：
    
    | 传递函数（正确）                         | 调用函数（不正确）                          |
    |----------------------------------|------------------------------------|
    | `<button onClick={handleClick}>` | `<button onClick={handleClick()}>` |
    
    区别很微妙。在第一个示例中，`handleClick` 函数作为 `onClick` 事件处理程序传递。这告诉 React 记住它并且只在用户单击按钮时调用你的函数。
    
    在第二个示例中，`handleClick()` 末尾的 `()` 在 [渲染](https://react.nodejs.cn/learn/render-and-commit) 期间立即触发函数，没有任何点击。这是因为 [JSX `{` 和 `}`](https://react.nodejs.cn/learn/javascript-in-jsx-with-curly-braces) 中的 JavaScript 会立即执行。
    
    当你编写内联代码时，同样的陷阱会以不同的方式出现：
    
    | 传递函数（正确）                                | 调用函数（不正确）                         |
    |-----------------------------------------|-----------------------------------|
    | `<button onClick={() => alert('...')}>` | `<button onClick={alert('...')}>` |
    
    传递像这样的内联代码不会在单击时触发 - 它会在每次组件渲染时触发：

    ```
    // This alert fires when the component renders, not when clicked!<button onClick={alert('You clicked me!')}>
    ```
    
    如果你想内联定义事件处理程序，请将其封装在匿名函数中，如下所示：
    
    ```jsx
    <button onClick={() => alert('You clicked me!')}>
    ```
    
    这不是在每次渲染时都执行内部代码，而是创建一个稍后调用的函数。
    
    在这两种情况下，你要传递的是一个函数：

    - `<button onClick={handleClick}>` 传递 `handleClick` 函数。
    - `<button onClick={() => alert('...')}>` 传递 `() => alert('...')` 函数。

    [阅读有关箭头函数的更多信息。](https://javascript.info/arrow-functions-basics)

### 1.1 在事件处理程序中读取属性

因为事件处理程序是在组件内部声明的，所以它们可以访问组件的属性。这是一个按钮，单击该按钮时，会显示带有 `message` 属性的警报：

```jsx linenums="1" title="App.js"
function AlertButton({ message, children }) {
  return (
    <button onClick={() => alert(message)}>
      {children}
    </button>
  );
}

export default function Toolbar() {
  return (
    <div>
      <AlertButton message="Playing!">
        Play Movie
      </AlertButton>
      <AlertButton message="Uploading!">
        Upload Image
      </AlertButton>
    </div>
  );
}
```

这让这两个按钮显示不同的消息。尝试更改传递给它们的消息。

### 1.2 将事件处理程序作为属性传递

通常你会希望父组件指定子级的事件处理程序。考虑按钮：根据你使用 `Button` 组件的位置，你可能想要执行不同的功能 - 也许一个功能播放电影，另一个功能上传图片。

为此，传递组件从其父级接收的属性作为事件处理程序，如下所示：

```jsx linenums="1" title="App.js"
function Button({ onClick, children }) {
  return (
    <button onClick={onClick}>
      {children}
    </button>
  );
}

function PlayButton({ movieName }) {
  function handlePlayClick() {
    alert(`Playing ${movieName}!`);
  }

  return (
    <Button onClick={handlePlayClick}>
      Play "{movieName}"
    </Button>
  );
}

function UploadButton() {
  return (
    <Button onClick={() => alert('Uploading!')}>
      Upload Image
    </Button>
  );
}

export default function Toolbar() {
  return (
    <div>
      <PlayButton movieName="Kiki's Delivery Service" />
      <UploadButton />
    </div>
  );
}
```

此处，`Toolbar` 组件渲染 `PlayButton` 和 `UploadButton`：

- `PlayButton` 将 `handlePlayClick` 作为 `onClick` 属性传给里面的 `Button`。
- `UploadButton` 将 `() => alert('Uploading!')` 作为 `onClick` 属性传给里面的 `Button`。
    

最后，你的 `Button` 组件接受一个名为 `onClick` 的属性。它将该属性直接传递给带有 `onClick={onClick}` 的内置浏览器 `<button>`。这告诉 React 在点击时调用传递的函数。

如果你使用 [设计系统](https://uxdesign.cc/everything-you-need-to-know-about-design-systems-54b109851969)，像按钮等组件通常包含样式但不指定行为。而是，像 `PlayButton` 和 `UploadButton` 这样的组件将向下传递事件处理程序。

### 1.3 命名事件处理程序属性

`<button>` 和 `<div>` 等内置组件仅支持 [浏览器事件名称](https://react.nodejs.cn/reference/react-dom/components/common#common-props)，如 `onClick`。但是，当你构建自己的组件时，你可以按照自己喜欢的方式命名它们的事件处理程序属性。

按照惯例，事件处理程序属性应以 `on` 开头，后跟大写字母。

例如，`Button` 组件的 `onClick` 属性可以称为 `onSmash`：

```jsx linenums="1" title="App.js"
function Button({ onSmash, children }) {
  return (
    <button onClick={onSmash}>
      {children}
    </button>
  );
}

export default function App() {
  return (
    <div>
      <Button onSmash={() => alert('Playing!')}>
        Play Movie
      </Button>
      <Button onSmash={() => alert('Uploading!')}>
        Upload Image
      </Button>
    </div>
  );
}
```

在这个例子中，`<button onClick={onSmash}>` 表明浏览器 `<button>`（小写）仍然需要一个名为 `onClick` 的属性，但是你的自定义 `Button` 组件接收到的属性名称由你决定！

当你的组件支持多种交互时，你可以为特定于应用的概念命名事件处理程序属性。例如，这个 `Toolbar` 组件接收 `onPlayMovie` 和 `onUploadImage` 事件处理程序：

```jsx linenums="1" title="App.js"
export default function App() {
  return (
    <Toolbar
      onPlayMovie={() => alert('Playing!')}
      onUploadImage={() => alert('Uploading!')}
    />
  );
}

function Toolbar({ onPlayMovie, onUploadImage }) {
  return (
    <div>
      <Button onClick={onPlayMovie}>
        Play Movie
      </Button>
      <Button onClick={onUploadImage}>
        Upload Image
      </Button>
    </div>
  );
}

function Button({ onClick, children }) {
  return (
    <button onClick={onClick}>
      {children}
    </button>
  );
}
```

注意 `App` 组件不需要知道 `Toolbar` 将对 `onPlayMovie` 或 `onUploadImage` 做什么。这是 `Toolbar` 的实现细节。在这里，`Toolbar` 将它们作为 `onClick` 处理程序传递给它的 `Button`，但它稍后也可以通过键盘快捷键触发它们。在像 `onPlayMovie` 这样的特定于应用的交互之后命名属性可以让你灵活地更改它们以后的使用方式。

!!! warning "注意"

    确保为事件处理程序使用适当的 HTML 标记。例如，要处理点击，请使用 [`<button onClick={handleClick}>`](https://web.nodejs.cn/en-US/docs/Web/HTML/Element/button) 而不是 `<div onClick={handleClick}>`。使用真正的浏览器 `<button>` 启用内置浏览器行为，如键盘导航。如果你不喜欢按钮的默认浏览器样式并且想让它看起来更像一个链接或不同的 UI 元素，你可以使用 CSS 来实现。[了解有关编写可访问标记的更多信息。](https://web.nodejs.cn/en-US/docs/Learn/Accessibility/HTML)


## 2. 事件传播

事件处理程序还将捕获来自你的组件可能具有的任何子级的事件。我们说事件在树上 “冒泡” 或 “传播”：它从事件发生的地方开始，然后沿着树上升。

这个 `<div>` 包含两个按钮。`<div>` 和每个按钮都有自己的 `onClick` 处理程序。你认为单击按钮时会触发哪些处理程序？

```jsx linenums="1" title="App.js"
export default function Toolbar() {
  return (
    <div className="Toolbar" onClick={() => {
      alert('You clicked on the toolbar!');
    }}>
      <button onClick={() => alert('Playing!')}>
        Play Movie
      </button>
      <button onClick={() => alert('Uploading!')}>
        Upload Image
      </button>
    </div>
  );
}
```

如果你单击任一按钮，它的 `onClick` 将首先运行，然后是父 `<div>` 的 `onClick`。所以会出现两条消息。如果单击工具栏本身，则只有父级 `<div>` 的 `onClick` 会运行。

!!! danger "易犯错误"
    
    除了 `onScroll`，所有事件都在 React 中传播，它仅适用于你附加的 JSX 标签。

### 2.1 停止传播

事件处理程序接收事件对象作为其唯一参数。按照惯例，它通常被称为 `e`，代表 “event”。你可以使用此对象来读取有关事件的信息。

该事件对象还允许你停止传播。如果你想阻止事件到达父组件，你需要像 `Button` 组件那样调用 `e.stopPropagation()`：

```jsx linenums="1" title="App.js"
function Button({ onClick, children }) {
  return (
    <button onClick={e => {
      e.stopPropagation();
      onClick();
    }}>
      {children}
    </button>
  );
}

export default function Toolbar() {
  return (
    <div className="Toolbar" onClick={() => {
      alert('You clicked on the toolbar!');
    }}>
      <Button onClick={() => alert('Playing!')}>
        Play Movie
      </Button>
      <Button onClick={() => alert('Uploading!')}>
        Upload Image
      </Button>
    </div>
  );
}
```

当你点击一个按钮时：

1. React 调用传递给 `<button>` 的 `onClick` 处理程序。
2. `Button` 中定义的该处理程序执行以下操作：
   - 调用 `e.stopPropagation()`，防止事件进一步冒泡。
   - 调用 `onClick` 函数，它是从 `Toolbar` 组件传递的属性。
3. 该函数在 `Toolbar` 组件中定义，显示按钮自己的警报。
4. 由于传播已停止，父 `<div>` 的 `onClick` 处理程序不会运行。

作为 `e.stopPropagation()` 的结果，单击按钮现在仅显示一个警报（来自 `<button>`）而不是其中的两个（来自 `<button>` 和父工具栏 `<div>`）。单击按钮与单击周围的工具栏不同，因此停止传播对于此 UI 来说是有意义的。

???+ tip "捕获阶段事件"

      在极少数情况下，你可能需要捕获子元素上的所有事件，即使它们停止了传播。例如，你可能想要记录每次点击以进行分析，而不考虑传播逻辑。你可以通过在事件名称末尾添加 `Capture` 来执行此操作：

      ```jsx linenums="1"
      <div onClickCapture={() => { /* this runs first */ }}>
        <button onClick={e => e.stopPropagation()} />
        <button onClick={e => e.stopPropagation()} />
      </div>
      ```

      每个事件都分三个阶段传播：
      
      1. 它向下移动，调用所有 `onClickCapture` 处理程序。
      2. 它运行被单击元素的 `onClick` 处理程序。
      3. 它向上移动，调用所有 `onClick` 处理程序。
      
      捕获事件对于路由或分析等代码很有用，但你可能不会在应用代码中使用它们。

### 2.2 传递处理程序作为传播的替代方法

请注意此点击处理程序如何运行一行代码，然后调用父级传递的 `onClick` 属性：

```jsx linenums="1" hl_lines="4"
function Button({ onClick, children }) {
  return (
    <button onClick={e => {
      e.stopPropagation();
      onClick();
    }}>
      {children}
    </button>
  );
}
```

你也可以在调用父 `onClick` 事件处理程序之前向此处理程序添加更多代码。此模式提供了传播的替代方案。它让子组件处理事件，同时也让父组件指定一些额外的行为。与传播不同，它不是自动的。但这种模式的好处是你可以清楚地跟踪作为某个事件的结果执行的整个代码链。

如果你依赖于传播并且很难跟踪执行哪些处理程序以及执行原因，请尝试使用此方法。

### 2.3 阻止默认行为

某些浏览器事件具有与之关联的默认行为。例如，`<form>` 提交事件，当点击其中的按钮时发生，默认情况下将**重新加载整个页面**：

```jsx linenums="1" title="App.js"
export default function Signup() {
  return (
    <form onSubmit={() => alert('Submitting!')}>
      <input />
      <button>Send</button>
    </form>
  );
}
```

你可以在事件对象上调用 `e.preventDefault()` 来阻止这种情况的发生：

```jsx linenums="1" title="App.js" hl_lines="4"
export default function Signup() {
  return (
    <form onSubmit={e => {
      e.preventDefault();
      alert('Submitting!');
    }}>
      <input />
      <button>Send</button>
    </form>
  );
}
```

不要混淆 `e.stopPropagation()` 和 `e.preventDefault()`。它们都很有用，但不相关：

- [`e.stopPropagation()`](https://web.nodejs.cn/docs/Web/API/Event/stopPropagation) 停止触发附加到上述标签的事件处理程序。
- [`e.preventDefault()` ](https://web.nodejs.cn/docs/Web/API/Event/preventDefault) 阻止了少数事件的默认浏览器行为。


## 3. 事件处理程序可以有副作用吗？

绝对地！事件处理程序是处理副作用的最佳场所。

与渲染函数不同，事件处理程序不需要是 [纯粹的](https://react.nodejs.cn/learn/keeping-components-pure)，因此它是更改某些内容的好地方 - 例如，更改输入的值以响应键入，或更改列表以响应按钮按下。然而，为了改变一些信息，你首先需要一些方法来存储它。在 React 中，这是通过使用 [状态，组件的内存](https://react.nodejs.cn/learn/state-a-components-memory) 完成的。你将在下一页了解所有相关信息。

## 4. 回顾 

- 你可以通过将函数作为属性传递给像 `<button>` 这样的元素来处理事件。
- 事件处理程序必须被传递，而不是被调用！`onClick={handleClick}`，不是 `onClick={handleClick()}`。
- 你可以单独或内联定义事件处理函数。
- 事件处理程序在组件内部定义，因此它们可以访问属性。
- 你可以在父级中声明一个事件处理程序并将其作为属性传递给子级。
- 你可以使用特定于应用的名称定义自己的事件处理程序属性。
- 事件向上传播。在第一个参数上调用 `e.stopPropagation()` 以防止出现这种情况。
- 事件可能有不需要的默认浏览器行为。致电 `e.preventDefault()` 以防止出现这种情况。
- 从子处理程序显式调用事件处理程序属性是传播的一个很好的替代方法。
