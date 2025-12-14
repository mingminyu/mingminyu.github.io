# 组件的导入与导出

组件的神奇之处在于它们的可重用性：你可以创建一个由其他组件构成的组件。但当你嵌套了越来越多的组件时，则需要将它们拆分成不同的文件。这样可以使得查找文件更加容易，并且能在更多地方复用这些组件。

!!! note "你将学习到"

    - 何为根组件
    - 如何导入和导出一个组件
    - 何时使用默认和具名导入导出
    - 如何在一个文件中导入导出多个组件
    - 如何将组件拆分成多个文件

## 1. 根组件文件

在 [你的第一个组件](https://zh-hans.react.dev/learn/your-first-component) 中，你创建了一个 `Profile` 组件，并且渲染在 `Gallery` 组件里。

```js linenums="1"
function Profile() {
  return (
    <img
      src="https://i.imgur.com/MK3eW3As.jpg"
      alt="Katherine Johnson"
    />
  );
}

export default function Gallery() {
  return (
    <section>
      <h1>了不起的科学家们</h1>
      <Profile />
      <Profile />
      <Profile />
    </section>
  );
}
```

在此示例中，所有组件目前都定义在 **根组件** `App.js` 文件中。具体还需根据项目配置决定，有些根组件可能会声明在其他文件中。如果你使用的框架基于文件进行路由，如 Next.js，那你每个页面的根组件都会不一样。

## 2. 导出和导入一个组件

如果将来需要在首页添加关于科学书籍的列表，亦或者需要将所有的资料信息移动到其他文件。这时将 `Gallery` 组件和 `Profile` 组件移出根组件文件会更加合理。这会使组件更加模块化，并且可在其他文件中复用。你可以根据以下三个步骤对组件进行拆分：

1. **创建** 一个新的 JS 文件来存放该组件。
2. **导出** 该文件中的函数组件（可以使用 [默认导出](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/export#using_the_default_export) 或 [具名导出](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/export#using_named_exports)）
3. 在需要使用该组件的文件中 **导入**（可以根据相应的导出方式使用 [默认导入](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/import#importing_defaults) 或 [具名导入](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/import#import_a_single_export_from_a_module)）。

这里将 `Profile` 组件和 `Gallery` 组件，从 `App.js` 文件中移动到了 `Gallery.js` 文件中。修改后，即可在 `App.js` 中导入 `Gallery.js` 中的 `Gallery` 组件:


???+ "拆分 Gallery 组件"

    === "App.js"

        ```js linenums="1"
        import Gallery from './Gallery.js';

        export default function App() {
        return (
            <Gallery />
            );
        }
        ```

    === "Gallery.js"

        ```js linenums="1"
        function Profile() {
            return (
                <img
                src="https://i.imgur.com/QIrZWGIs.jpg"
                alt="Alan L. Hart"
                />
            );
        }

        export default function Gallery() {
            return (
                <section>
                    <h1>了不起的科学家们</h1>
                    <Profile />
                    <Profile />
                    <Profile />
                </section>
            );
        }
        ```


该示例中需要注意的是，如何将组件拆分成两个文件：

1. `Gallery.js`:
    - 定义了 `Profile` 组件，该组件仅在该文件内使用，没有被导出。
    - 使用 **默认导出** 的方式，将 `Gallery` 组件导出

2. `App.js`:
   - 使用 **默认导入** 的方式，从 `Gallery.js` 中导入 `Gallery` 组件。
   - 使用 **默认导出** 的方式，将根组件 `App` 导出。

!!! warning "注意"

    引入过程中，你可能会遇到一些文件并未添加 `.js` 文件后缀，如下所示：

    ```js
    import Gallery from './Gallery';
    ```

    无论是 './Gallery.js' 还是 './Gallery'，在 React 里都能正常使用，只是前者更符合 原生 ES 模块。


## 3. 从同一文件中导出和导入多个组件

如果你只想展示一个 `Profile` 组，而不展示整个图集。你也可以导出 `Profile` 组件。但 `Gallery.js` 中已包含 **默认** 导出，此时，你不能定义 **两个** 默认导出。但你可以将其在新文件中进行默认导出，或者将 `Profile` 进行 **具名** 导出。**同一文件中，有且仅有一个默认导出，但可以有多个具名导出！**


!!! warning "注意"

    为了减少在默认导出和具名导出之间的混淆，一些团队会选择只使用一种风格（默认或者具名），或者禁止在单个文件内混合使用。这因人而异，选择最适合你的即可！

首先，用具名导出的方式，将 `Profile` 组件从 `Gallery.js` **导出**（不使用 `default` 关键字）：

```js linenums="1"
export function Profile() {
  // ...
}
```

接着，用具名导入的方式，从 `Gallery.js` 文件中 **导入** `Profile` 组件（用大括号）:

```js
import { Profile } from './Gallery.js';
```

最后，在 `App` 组件里 **渲染** `<Profile />`：

```js linenums="1"
export default function App() {
  return <Profile />;
}
```

现在，`Gallery.js` 包含两个导出：一个是默认导出的 `Gallery`，另一个是具名导出的 `Profile`。`App.js` 中均导入了这两个组件。尝试将 `<Profile />` 改成 `<Gallery />`，回到示例中：


???+ example "代码示例"

    === "App.js"

        ```js linenums="1"
        import Gallery from './Gallery.js';
        import { Profile } from './Gallery.js';

        export default function App() {
            return (
                <Profile />
            );
        }
        ```

    === "Gallery.js"

        ```js linenums="1"
        export function Profile() {
            return (
                <img
                src="https://i.imgur.com/QIrZWGIs.jpg"
                alt="Alan L. Hart"
                />
            );
        }

        export default function Gallery() {
            return (
                <section>
                <h1>了不起的科学家们</h1>
                <Profile />
                <Profile />
                <Profile />
                </section>
            );
        }
        ```

示例中混合使用了默认导出和具名导出：

- `Gallery.js`:
    - 使用 **具名导出** 的方式，将 `Profile` 组件导出，并取名为 `Profile`。
    - 使用 **默认导出** 的方式，将 `Gallery` 组件导出。

- `App.js`:

    - 使用 **具名导入** 的方式，从 `Gallery.js` 中导入 `Profile` 组件，并取名为 `Profile`。
    - 使用 **默认导入** 的方式，从 `Gallery.js` 中导入 `Gallery` 组件。
    - 使用 **默认导出** 的方式，将根组件 `App` 导出。

## 4. 摘要

在本章节中，你学到了：

- 何为根组件
- 如何导入和导出一个组件
- 何时和如何使用默认和具名导入导出
- 如何在一个文件里导出多个组件

