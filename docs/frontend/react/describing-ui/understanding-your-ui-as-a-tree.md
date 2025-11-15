# 将 UI 视为树

当 React 应用程序逐渐成形时，许多组件会出现嵌套。那么 React 是如何跟踪应用程序组件结构的？

React 以及许多其他 UI 库，将 UI 建模为树。将应用程序视为树对于理解组件之间的关系以及调试性能和状态管理等未来将会遇到的一些概念非常有用。

!!! note "你将学习到"

    - React 如何看待组件结构
    - 渲染树是什么以及它有什么用处
    - 模块依赖树是什么以及它有什么用处

## 1. 将 UI 视为树

树是项目和 UI 之间的关系模型，通常使用树结构来表示 UI。例如，浏览器使用树结构来建模 HTML（[DOM](https://developer.mozilla.org/docs/Web/API/Document_Object_Model/Introduction)）与CSS（[CSSOM](https://developer.mozilla.org/docs/Web/API/CSS_Object_Model)）。移动平台也使用树来表示其视图层次结构。

![](https://react.nodejs.cn/images/docs/diagrams/preserving_state_dom_tree.png?w=1920&q=75)

与浏览器和移动平台一样，React 还使用树结构来管理和建模 React 应用程序中组件之间的关系。这些树是有用的工具，用于理解数据如何在 React 应用程序中流动以及如何优化呈现和应用程序大小。

## 2. 渲染树

组件的一个主要特性是能够由其他组件组合而成。在 [嵌套组件](https://zh-hans.react.dev/learn/your-first-component#nesting-and-organizing-components) 中有父组件和子组件的概念，其中每个父组件本身可能是另一个组件的子组件。

当渲染 React 应用程序时，可以在一个称为渲染树的树中建模这种关系。

下面的 React 应用程序渲染了一些鼓舞人心的引语。

???+ example "示例"

    === "App.js"

        ```ts linenums="1"
        import FancyText from './FancyText';
        import InspirationGenerator from './InspirationGenerator';
        import Copyright from './Copyright';

        export default function App() {
        return (
            <>
              <FancyText title text="Get Inspired App" />
              <InspirationGenerator>
                  <Copyright year={2004} />
              </InspirationGenerator>
            </>
          );
        }
        ```

    === "FancyText.js"

        ```ts linenums="1"
        export default function FancyText({title, text}) {
        return title
            ? <h1 className='fancy title'>{text}</h1>
            : <h3 className='fancy cursive'>{text}</h3>
        }
        ```
    
    === "InspirationGenerator.js"

        
        ```jsx linenums="1"
        import * as React from 'react';
        import quotes from './quotes';
        import FancyText from './FancyText';
        
        export default function InspirationGenerator({children}) {
          const [index, setIndex] = React.useState(0);
          const quote = quotes[index];
          const next = () => setIndex((index + 1) % quotes.length);
        
          return (
            <>
              <p>Your inspirational quote is:</p>
              <FancyText text={quote} />
              <button onClick={next}>Inspire me again</button>
              {children}
            </>
          );
        }
        ```
    
    === "Copyright.js"

        ```jsx linenums="1"
        export default function Copyright({year}) {
          return <p className='small'>©️ {year}</p>;
        }
        ```

    === "quote.js"

        ```jsx linenums="1"
        export default [
          "Don’t let yesterday take up too much of today.” — Will Rogers",
          "Ambition is putting a ladder against the sky.",
          "A joy that's shared is a joy made double.",
          ];
        ```

<figure markdown="span">
  ![](https://react.nodejs.cn/images/docs/diagrams/render_tree.png){ width="600"}
  <figcaption>React 创建的 UI 树是由渲染过的组件构成的，被称为渲染树。</figcaption>
</figure>

通过示例应用程序，可以构建上面的渲染树。这棵树由节点组成，每个节点代表一个组件。例如，`App`、`FancyText`、`Copyright` 等都是我们树中的节点。

在 React 渲染树中，根节点是应用程序的[根组件](https://zh-hans.react.dev/learn/importing-and-exporting-components#the-root-component-file)。在这种情况下，根组件是 App，它是 React 渲染的第一个组件。树中的每个箭头从父组件指向子组件。

!!! note "那么渲染树中的 HTML 标签在哪里呢？"
    
    也许会注意到在上面的渲染树中，没有提到每个组件渲染的 HTML 标签。这是因为渲染树仅由 React [组件](https://zh-hans.react.dev/learn/your-first-component#components-ui-building-blocks) 组成。

    React 是跨平台的 UI 框架。react.dev 展示了一些渲染到使用 HTML 标签作为 UI 原语的 web 的示例。但是 React 应用程序同样可以渲染到移动设备或桌面平台，这些平台可能使用不同的 UI 原语，如 [UIView](https://developer.apple.com/documentation/uikit/uiview) 或 [FrameworkElement](https://learn.microsoft.com/en-us/dotnet/api/system.windows.frameworkelement?view=windowsdesktop-7.0)。

    这些平台 UI 原语不是 React 的一部分。无论应用程序渲染到哪个平台，React 渲染树都可以为 React 应用程序提供见解。


渲染树表示 React 应用程序的单个渲染过程。在 [条件渲染](https://zh-hans.react.dev/learn/conditional-rendering) 中，父组件可以根据传递的数据渲染不同的子组件。我们可以更新应用程序以有条件地渲染励志语录或颜色。

???+ example "示例"

    === "App.js"

        ```ts linenums="1"
        import FancyText from './FancyText';
        import InspirationGenerator from './InspirationGenerator';
        import Copyright from './Copyright';

        export default function App() {
        return (
            <>
              <FancyText title text="Get Inspired App" />
              <InspirationGenerator>
                  <Copyright year={2004} />
              </InspirationGenerator>
            </>
          );
        }
        ```

    === "FancyText.js"

        ```js linenums="1"
        export default function FancyText({title, text}) {
          return title
            ? <h1 className='fancy title'>{text}</h1>
            : <h3 className='fancy cursive'>{text}</h3>
        }
        ```

    === "Color.js"

        ```ts linenums="1"
        export default function Color({value}) {
          return <div className="colorbox" style={{backgroundColor: value}} />
        }
        ```
    
    === "InspirationGenerator.js"
        
        ```jsx linenums="1"
        import * as React from 'react';
        import quotes from './quotes';
        import FancyText from './FancyText';
        
        export default function InspirationGenerator({children}) {
          const [index, setIndex] = React.useState(0);
          const quote = quotes[index];
          const next = () => setIndex((index + 1) % quotes.length);
        
          return (
            <>
              <p>Your inspirational {inspiration.type} is:</p>
              {inspiration.type === 'quote'
                ? <FancyText text={inspiration.value} />
                : <Color value={inspiration.value} />}
        
              <button onClick={next}>Inspire me again</button>
              {children}
            </>
          );
        }
        ```
    
    === "Copyright.js"

        ```jsx linenums="1"
        export default function Copyright({year}) {
          return <p className='small'>©️ {year}</p>;
        }
        ```

    === "inspirations.js"

        ```jsx linenums="1"
        export default [
          {type: 'quote', value: "Don’t let yesterday take up too much of today.” — Will Rogers"},
          {type: 'color', value: "#B73636"},
          {type: 'quote', value: "Ambition is putting a ladder against the sky."},
          {type: 'color', value: "#256266"},
          {type: 'quote', value: "A joy that's shared is a joy made double."},
          {type: 'color', value: "#F9F2B4"},
        ];
        ```

<figure markdown="span">
  ![](https://react.nodejs.cn/images/docs/diagrams/conditional_render_tree.png){ width="600"}
  <figcaption>通过条件渲染，在不同的渲染中，渲染树可能会渲染不同的组件。</figcaption>
</figure>


在此示例中，根据 `inspiration.type` 是什么，我们可能会渲染 `<FancyText>` 或 `<Color>`。每个渲染通道的渲染树可能不同。

尽管渲染树在渲染过程中可能有所不同，但这些树通常有助于识别 React 应用中的顶层组件和叶组件。顶层组件是距离根组件最近的组件，影响其下所有组件的渲染性能，并且通常包含最复杂的组件。叶子组件靠近树的底部，没有子组件，并且经常被频繁地重新渲染。

识别这些组件类别有助于理解应用程序的数据流和性能。

## 3. 模块依赖树

React 应用中可以使用树建模的另一个关系是应用的模块依赖。当我们将 [分解我们的组件](https://react.nodejs.cn/learn/importing-and-exporting-components#exporting-and-importing-a-component) 和逻辑放入单独的文件中时，我们创建了 [JS 模块](https://web.nodejs.cn/en-US/docs/Web/JavaScript/Guide/Modules)，可以在其中导出组件、函数或常量。

模块依赖树中的每个节点都是一个模块，每个分支代表该模块中的 `import` 语句。如果我们采用之前的 `Inspirations` 应用，我们可以构建一个模块依赖树，简称依赖树。

<figure markdown="span">
  ![](https://react.nodejs.cn/images/docs/diagrams/module_dependency_tree.png){ width="600"}
  <figcaption>Inspirations 应用的模块依赖树。</figcaption>
</figure>

树的根节点是根模块，也称为入口点文件。它通常是包含根组件的模块。

与同一应用的渲染树相比，结构相虽然似，但有一些显着差异：

- 组成树的节点代表模块，而不是组件。
- 非组件模块（如 `inspirations.js`）也在此树中表示，渲染树只封装组件。
- `Copyright.js` 显示在 `App.js` 下，但在渲染树中，组件 `Copyright` 显示为 `InspirationGenerator` 的子级。这是因为 `InspirationGenerator` 将 JSX 接受为 [子属性](https://react.nodejs.cn/learn/passing-props-to-a-component#passing-jsx-as-children)，因此它将 `Copyright` 渲染为子组件，但不导入该模块。

依赖树对于确定运行 React 应用所需的模块很有用。在构建用于生产的 React 应用时，通常有一个构建步骤，它将打包所有必要的 JavaScript 以发送到客户端。负责此操作的工具称为 [bundler](https://web.nodejs.cn/en-US/docs/Learn/Tools_and_testing/Understanding_client-side_tools/Overview#the_modern_tooling_ecosystem)，打包程序将使用依赖树来确定应包含哪些模块。

随着应用的增长，打包后的包大小通常也会随之增长。对于客户端来说，下载和运行大包的成本很高。较大的包大小可能会延迟 UI 绘制的时间。了解应用的依赖树可能有助于调试这些问题。

## 4. 回顾

- 树是表示实体之间关系的常用方法，它们通常用于对 UI 进行建模。
- 渲染树表示单个渲染中 React 组件之间的嵌套关系。
- 通过条件渲染，渲染树可能会在不同的渲染中发生变化。使用不同的属性值，组件可能会渲染不同的子组件。
- 渲染树有助于识别顶层组件和叶组件。顶层组件会影响其下所有组件的渲染性能，而叶组件通常会频繁重新渲染。识别它们对于理解和调试渲染性能很有用。
- 依赖树表示 React 应用中的模块依赖。
- 构建工具使用依赖树来打包交付应用所需的代码。
- 依赖树对于调试大的打包包非常有用，因为它们会减慢绘制时间并公开优化打包代码的机会。
