# 渲染列表

你可能经常需要通过 [JavaScript 的数组方法](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array#) 来操作数组中的数据，从而将一个数据集渲染成多个相似的组件。在这篇文章中，你将学会如何在 React 中使用 [`filter()`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/filter) 筛选需要渲染的组件和使用 [`map()`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/map) 把数组转换成组件数组。

!!! note "你将学习到"

    - 如何通过 JavaScript 的 `map()` 方法从数组中生成组件
    - 如何通过 JavaScript 的 `filter()` 筛选需要渲染的组件
    - 何时以及为何使用 React 中的 key

## 1. 从数组中渲染数据

这里我们有一个列表。

```html linenums="1"
<ul>
  <li>凯瑟琳·约翰逊: 数学家</li>
  <li>马里奥·莫利纳: 化学家</li>
  <li>穆罕默德·阿卜杜勒·萨拉姆: 物理学家</li>
  <li>珀西·莱温·朱利亚: 化学家</li>
  <li>苏布拉马尼扬·钱德拉塞卡: 天体物理学家</li>
</ul>
```

可以看到，这些列表项之间唯一的区别就是其中的内容/数据。未来你可能会碰到很多类似的情况，在那些场景中，你想基于不同的数据渲染出相似的组件，比如评论列表或者个人资料的图库。在这样的场景下，可以把要用到的数据存入 JavaScript 对象或数组，然后用 [`map()`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/map) 或 [`filter()`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/filter) 这样的方法来渲染出一个组件列表。

这里给出一个由数组生成一系列列表项的简单示例：

1. 首先，把数据 **存储** 到数组中：

    ```ts linenums="1"
    const people = [
        '凯瑟琳·约翰逊: 数学家',
        '马里奥·莫利纳: 化学家',
        '穆罕默德·阿卜杜勒·萨拉姆: 物理学家',
        '珀西·莱温·朱利亚: 化学家',
        '苏布拉马尼扬·钱德拉塞卡: 天体物理学家',
    ];
    ```

2. **遍历** `people` 这个数组中的每一项，并获得一个新的 JSX 节点数组 `listItems`：

    ```ts
    const listItems = people.map(person => <li>{person}</li>);
    ```

3. 把 `listItems` 用 `<ul>` 包裹起来，然后 **返回** 它：

    ```ts
    return <ul>{listItems}</ul>;
    ```

来看看运行的结果：

```ts linenums="1" title="App.js"
const people = [
  '凯瑟琳·约翰逊: 数学家',
  '马里奥·莫利纳: 化学家',
  '穆罕默德·阿卜杜勒·萨拉姆: 物理学家',
  '珀西·莱温·朱利亚: 化学家',
  '苏布拉马尼扬·钱德拉塞卡: 天体物理学家',
];

export default function List() {
  const listItems = people.map(person =>
    <li>{person}</li>
  );
  return <ul>{listItems}</ul>;
}
```

!!! warning "注意"

    注意上面的沙盒可能会输出这样一个控制台错误：

    ```ts linenums="1" title="Console"
    Warning: Each child in a list should have a unique “key” prop.
    ```

等会我们会学到怎么修复它。在此之前，我们先来看看如何把这个数组变得更加结构化。

## 2. 对数组项进行过滤

让我们把 `people` 数组变得更加结构化一点。

```ts linenums="1"
const people = [{
  id: 0,
  name: '凯瑟琳·约翰逊',
  profession: '数学家',
}, {
  id: 1,
  name: '马里奥·莫利纳',
  profession: '化学家',
}, {
  id: 2,
  name: '穆罕默德·阿卜杜勒·萨拉姆',
  profession: '物理学家',
}, {
  id: 3,
  name: '珀西·莱温·朱利亚',
  profession: '化学家',
}, {
  id: 4,
  name: '苏布拉马尼扬·钱德拉塞卡',
  profession: '天体物理学家',
}];
```

现在，假设你只想在屏幕上显示职业是 `化学家` 的人。那么你可以使用 JavaScript 的 `filter()` 方法来返回满足条件的项。这个方法会让数组的子项经过 “过滤器”（一个返回值为 `true` 或 `false` 的函数）的筛选，最终返回一个只包含满足条件的项的新数组。

既然你只想显示 `profession` 值是 `化学家` 的人，那么这里的 “过滤器” 函数应该长这样：`(person) => person.profession === '化学家'`。下面我们来看看该怎么把它们组合在一起：

1. 首先，**创建** 一个用来存化学家们的新数组 `chemists`，这里用到 `filter()` 方法过滤 `people` 数组来得到所有的化学家，过滤的条件应该是 `person.profession === '化学家'`：

    ```ts linenums="1"
    const chemists = people.filter(person =>
    person.profession === '化学家'
    );
    ```

2. 接下来 **用 map 方法遍历** `chemists` 数组:

    ```ts linenums="1"
    const listItems = chemists.map(person =>
    <li>
        <img
        src={getImageUrl(person)}
        alt={person.name}
        />
        <p>
        <b>{person.name}:</b>
        {' ' + person.profession + ' '}
        因{person.accomplishment}而闻名世界
        </p>
    </li>
    );
    ```

3. 最后，返回 `listItems：`

    ```ts
    return <ul>{listItems}</ul>;
    ```

???+ example "示例"

    === "App.js"

        ```ts linenums="1"
        import { people } from './data.js';
        import { getImageUrl } from './utils.js';

        export default function List() {
        const chemists = people.filter(person =>
            person.profession === '化学家'
        );
        const listItems = chemists.map(person =>
            <li>
                <img
                    src={getImageUrl(person)}
                    alt={person.name}
                />
                <p>
                    <b>{person.name}:</b>
                    {' ' + person.profession + ' '}
                    因{person.accomplishment}而闻名世界
                </p>
            </li>
        );
        return <ul>{listItems}</ul>;
        }
        ```

    === "data.js"

        ```ts
        export const people = [
            {
                id: 0,
                name: '凯瑟琳·约翰逊',
                profession: '数学家',
                accomplishment: '太空飞行相关数值的核算',
                imageId: 'MK3eW3A',
            },
            {
                id: 1,
                name: '马里奥·莫利纳',
                profession: '化学家',
                accomplishment: '北极臭氧空洞的发现',
                imageId: 'mynHUSa',
            },
            {
                id: 2,
                name: '穆罕默德·阿卜杜勒·萨拉姆',
                profession: '物理学家',
                accomplishment: '关于基本粒子间弱相互作用和电磁相互作用的统一理论',
                imageId: 'bE7W1ji',
            },
            {
                id: 3,
                name: '珀西·莱温·朱利亚',
                profession: '化学家',
                accomplishment: '开创性的可的松药物、类固醇和避孕药的研究',
                imageId: 'IOjWm71',
            },
            {
                id: 4,
                name: '苏布拉马尼扬·钱德拉塞卡',
                profession: '天体物理学家',
                accomplishment: '白矮星质量计算',
                imageId: 'lrWQx8l',
            },
        ];
        ```

    === "utils.js"

        ```ts linenums="1"
        export function getImageUrl(person) {
            return (
                'https://i.imgur.com/' +
                person.imageId +
                's.jpg'
            );
        }
        ```

!!! warning "陷阱"

    因为箭头函数会隐式地返回位于 `=>` 之后的表达式，所以你可以省略 `return` 语句。

    ```ts linenums="1"
    const listItems = chemists.map(person =>
        <li>...</li> // 隐式地返回！
    );
    ```

    不过，**如果你的 `=>` 后面跟了一对花括号 `{` ，那你必须使用 `return` 来指定返回值！**

    ```ts linenums="1"
    const listItems = chemists.map(person => { // 花括号
        return <li>...</li>;
    });
    ```

    箭头函数 `=> {` 后面的部分被称为 [“块函数体”](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Functions/Arrow_functions#function_body)，块函数体支持多行代码的写法，但要用 `return` 语句才能指定返回值。假如你忘了写 `return`，那这个函数什么都不会返回！

## 3. 用 `key` 保持列表项的顺序

如果把上面任何一个沙盒示例在新标签页打开，你就会发现控制台有这样一个报错：

```ts title="Console"
Warning: Each child in a list should have a unique “key” prop.
```

这是因为你必须给数组中的每一项都指定一个 `key`——它可以是字符串或数字的形式，只要能唯一标识出各个数组项就行：

```ts
<li key={person.id}>...</li>
```

!!! warning "注意"

    直接放在 `map()` 方法里的 JSX 元素一般都需要指定 `key` 值！

这些 key 会告诉 React，每个组件对应着数组里的哪一项，所以 React 可以把它们匹配起来。这在数组项进行移动（例如排序）、插入或删除等操作时非常重要。一个合适的 `key` 可以帮助 React 推断发生了什么，从而得以正确地更新 DOM 树。

用作 key 的值应该在数据中提前就准备好，而不是在运行时才随手生成：

???+ example "示例"

    === "App.js"

        ```ts linenums="1"
        import { people } from './data.js';
        import { getImageUrl } from './utils.js';

        export default function List() {
        const listItems = people.map(person =>
            <li key={person.id}>
                <img
                    src={getImageUrl(person)}
                    alt={person.name}
                />
                <p>
                    <b>{person.name}</b>
                    {' ' + person.profession + ' '}
                    因{person.accomplishment}而闻名世界
                </p>
            </li>
        );
        return <ul>{listItems}</ul>;
        }
        ```

    === "data.js"

        ```ts
        export const people = [
            {
                id: 0,
                name: '凯瑟琳·约翰逊',
                profession: '数学家',
                accomplishment: '太空飞行相关数值的核算',
                imageId: 'MK3eW3A',
            },
            {
                id: 1,
                name: '马里奥·莫利纳',
                profession: '化学家',
                accomplishment: '北极臭氧空洞的发现',
                imageId: 'mynHUSa',
            },
            {
                id: 2,
                name: '穆罕默德·阿卜杜勒·萨拉姆',
                profession: '物理学家',
                accomplishment: '关于基本粒子间弱相互作用和电磁相互作用的统一理论',
                imageId: 'bE7W1ji',
            },
            {
                id: 3,
                name: '珀西·莱温·朱利亚',
                profession: '化学家',
                accomplishment: '开创性的可的松药物、类固醇和避孕药的研究',
                imageId: 'IOjWm71',
            },
            {
                id: 4,
                name: '苏布拉马尼扬·钱德拉塞卡',
                profession: '天体物理学家',
                accomplishment: '白矮星质量计算',
                imageId: 'lrWQx8l',
            },
        ];
        ```

    === "utils.js"

        ```ts linenums="1"
        export function getImageUrl(person) {
            return (
                'https://i.imgur.com/' +
                person.imageId +
                's.jpg'
            );
        }
        ```


???+ tip "深入讨论"

    如果你想让每个列表项都输出多个 DOM 节点而非一个的话，该怎么做呢？

    Fragment 语法的简写形式 `<> </>` 无法接受 key 值，所以你只能要么把生成的节点用一个 `<div>` 标签包裹起来，要么使用长一点但更明确的 `<Fragment>` 写法：

    ```ts linenums="1"
    import { Fragment } from 'react';

    // ...

    const listItems = people.map(person =>
    <Fragment key={person.id}>
        <h1>{person.name}</h1>
        <p>{person.bio}</p>
    </Fragment>
    );
    ```

    这里的 Fragment 标签本身并不会出现在 DOM 上，这串代码最终会转换成 `<h1>`、`<p>`、`<h1>`、`<p>`…… 的列表。


### 3.1 如何设定 `key` 值

不同来源的数据往往对应不同的 key 值获取方式：

- **来自数据库的数据：** 如果你的数据是从数据库中获取的，那你可以直接使用数据表中的主键，因为它们天然具有唯一性。
- **本地产生数据：** 如果你数据的产生和保存都在本地（例如笔记软件里的笔记），那么你可以使用一个自增计数器或者一个类似 [`uuid`](https://www.npmjs.com/package/uuid) 的库来生成 key。

### 3.2 key 需要满足的条件

- **key 值在兄弟节点之间必须是唯一的。** 不过不要求全局唯一，在不同的数组中可以使用相同的 key。
- **key 值不能改变**，否则就失去了使用 key 的意义！所以千万不要在渲染时动态地生成 key。

### 3.3 React 中为什么需要 key？

设想一下，假如你桌面上的文件都没有文件名，取而代之的是，你需要通过文件的位置顺序来区分它们———第一个文件，第二个文件，以此类推。也许你也不是不能接受这种方式，可是一旦你删除了其中的一个文件，这种组织方式就会变得混乱无比。原来的第二个文件可能会变成第一个文件，第三个文件会成为第二个文件……

React 里需要 key 和文件夹里的文件需要有文件名的道理是类似的。它们（key 和文件名）都让我们可以从众多的兄弟元素中唯一标识出某一项（JSX 节点或文件）。而一个精心选择的 key 值所能提供的信息远远不止于这个元素在数组中的位置。即使元素的位置在渲染的过程中发生了改变，它提供的 `key` 值也能让 React 在整个生命周期中一直认得它。

!!! warning "陷阱"

    你可能会想直接把数组项的索引当作 key 值来用，实际上，如果你没有显式地指定 `key` 值，React 确实默认会这么做。但是数组项的顺序在插入、删除或者重新排序等操作中会发生改变，此时把索引顺序用作 key 值会产生一些微妙且令人困惑的 bug。

    与之类似，请不要在运行过程中动态地产生 key，像是 `key={Math.random()}` 这种方式。这会导致每次重新渲染后的 key 值都不一样，从而使得所有的组件和 DOM 元素每次都要重新创建。这不仅会造成运行变慢的问题，更有可能导致用户输入的丢失。所以，使用能从给定数据中稳定取得的值才是明智的选择。

    有一点需要注意，组件不会把 `key` 当作 props 的一部分。Key 的存在只对 React 本身起到提示作用。如果你的组件需要一个 ID，那么请把它作为一个单独的 prop 传给组件： `<Profile key={id} userId={id} />`。

## 4. 摘要

在这篇文章中，你学习了：

- 如何从组件中抽离出数据，并把它们放入像数组、对象这样的数据结构中。
- 如何使用 JavaScript 的 `map()` 方法来生成一组相似的组件。
- 如何使用 JavaScript 的 `filter()` 方法来筛选数组。
- 为何以及如何给集合中的每个组件设置一个 `key` 值：它使 React 能追踪这些组件，即便后者的位置或数据发生了变化。
