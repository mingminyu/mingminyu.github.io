# useCallback

```ts
const cachedFn = useCallback(fn, dependencies)
```

`useCallback` 是一个允许你在多次渲染中缓存函数的 React Hook，通过在组件顶层调用 useCallback 以便在多次渲染中缓存函数，这里解释下参数：

- `fn`: 想要缓存的函数，此函数可以接受任何参数并且返回任何值。在初次渲染时，React 将把函数返回给你（**注意不是调用它！**）。当进行下一次渲染时，如果 `dependencies` 相比于上一次渲染时没有改变，那么 React 将会返回相同的函数。否则，React 将返回在最新一次渲染中传入的函数，并且将其缓存以便之后使用。React 不会调用此函数，而是返回此函数。你可以自己决定何时调用以及是否调用。
- `dependencies`: 有关是否更新 `fn` 的所有响应式值的一个列表。响应式值包括 `props`、`state`，和所有在你组件内部直接声明的变量和函数。如果你的代码检查工具 配置了 React，那么它将校验每一个正确指定为依赖的响应式值。依赖列表必须具有确切数量的项，并且必须像 [dep1, dep2, dep3] 这样编写。React 使用 Object.is 比较每一个依赖和它的之前的值。

```ts
import { useCallback } from 'react';
 
export default function ProductPage({ productId, referrer, theme }) {
  const handleSubmit = useCallback((orderDetails) => {
    post('/product/' + productId + '/buy', {
      referrer,
      orderDetails,
    });
  }, [productId, referrer]);
```