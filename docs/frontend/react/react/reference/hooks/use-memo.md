# useMemo

> 原文地址: https://react.dev/reference/react/useMemo

```ts linenums="1" hl_lines="4"
import { useMemo } from 'react';

function TodoList({ todos, tab }) {
  const visibleTodos = useMemo(
    () => filterTodos(todos, tab),
    [todos, tab]
  )
}
```

`useMemo` 是一个 React 钩子，通过在组件上层进行调用，可以让我们缓存重新渲染之间计算的结果，使用语法如下：

```ts title="语法格式"
const cachedValue = useMemo(calculateValue, dependencies)
```

接下来我们解释一下 `useMemo` 函数的参数：

**参数**：

- `calculateValue`: 计算要缓存值的 **函数**，它应该是纯粹的，不应带任何参数，并且应返回任何类型的值。React 将在初始渲染期间调用您的功能。在下一步渲染器上，如果自上次渲染以来依赖项没有更改，React 将再次返回相同的值。否则，它将调用计算值，返回其结果并将其存储，以便以后重复使用。
- `dependencies`: 计算值代码内部引用的所有反应值列表，反应性值包括直接在组件主体内部声明的 `props`，`state` 和所有变量和函数。如果您的 Linter 配置为 React，它将验证每个反应值正确被指定为依赖关系。依赖项列表必须具有 **恒定** 数量的项目，并以 `[dep1，dep2，dep3]` 的形式写入。React 将使用对象比较将每个依赖性与其先前值进行比较（通过 `Object.is` 方式进行比较）。

**返回值**：在初始渲染中，`useMemo` 返回没有参数的调用 `calculateValue` 的结果。在接下来的渲染过程中，它将从最后一个渲染（如果依赖项尚未更改）返回已经存储的值，或者再次调用计算值，然后返回计算值已返回的结果。

**注意事项**：

- `usememo` 是一个钩子，因此您只能在组件的顶层或自己的钩子的顶层调用它。所以，我们并不能在循环或条件下调用 `usememo` 钩子。如果确实需要，请提取新组件并将状态移入其中。
- 在严格的模式下，React 将两次调用您的计算功能，以帮助您找到意外情况。但这仅是开发行为，并不影响生产。如果您的计算功能是纯粹的（应该是），则不应影响您的逻辑，其中一个调用的结果将被忽略。
- 除非有特定原因这样做，否则 React 不会丢弃缓存的值。例如，在开发中当您编辑组件的文件时，React 会丢弃缓存。在开发和生产中，如果您的组件在初始挂载过程中使用了 `suspend`，则 React 都会丢弃缓存。在未来版本中，React 可能会添加更多功能，以利用丢弃缓存的优势——例如，如果 React 在将来增加了对虚拟化列表的内置支持，则将对虚拟化表格视图下滚动出的项目所丢弃的缓存是很有意义的。如果您仅依靠 `usememo` 作为性能优化，这应该很好。否则，状态变量或 `ref` 依赖源项可能更合适。

!!! info "补充"

    像这样的缓存返回值的方式也被称为回忆，这就是为什么此钩子称为 `useMemo` 的原因。

## 1. 使用

### 1.1 跳过昂贵的重新计算

要缓存重新渲染之间的计算，请将其包裹在组件的最高级别的 `usememo` 调用中：

```ts linenums="1" hl_lines="4"
import { useMemo } from 'react';

function TodoList({ todos, tab, theme }) {
  const visibleTodos = useMemo(() => filterTodos(todos, tab), [todos, tab]);
  // ...
}
```

## 2. 疑难解答

