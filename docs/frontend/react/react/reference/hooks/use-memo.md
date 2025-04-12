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

这里我们给 `useMemo` 传递了两个参数：

- 一个没有参数的计算函数，例如 `() =>`，并返回需要计算的内容。
- 依赖项列表，其中包括计算中使用的组件中的每个值。

在初始渲染上，我们从 `useMemo` 中获得的值将是调用您的计算的结果。在随后的每次渲染中，React 将依赖项与您在上次渲染中传递的依赖关系进行比较。如果依赖项没有更改（通过 `Object.is` 的方式进行比较），则 `useMemo` 将返回您之前已经计算出的值。否则，React 将重新运行您的计算并返回新值。

换句话说，`useMemo` 在重新渲染器之间缓存了一个计算结果，直到其依赖性发生变化为止。让我们再浏览一个例子，看看何时有用。

默认情况下，React 每次重新渲染时都会重新运行组件的整个主体。例如，如果此 `Todolist` 更新其状态或从其父母那里接收新 `props`，则 `FilterTodos` 函数将重新运行：

```ts linenums="1"
function TodoList({ todos, tab, theme }) {
  const visibleTodos = filterTodos(todos, tab);
  // ...
}
```

通常这不是问题，因为大多数计算都非常快。但是，如果您要过滤或转换大型阵列或进行一些昂贵的计算，则如果数据没有更改，您可能想再次跳过。如果 `Todos` 和 `Tab` 都与上次渲染期间相同，则将计算包装在 `useMemo` 中，就像以前一样让您重复使用以前已经计算出来的 `Visibletodos`。这种类型的缓存称为 **回忆**。

!!! note "补充"

    您应该仅依靠 `useMemo` 作为性能优化。如果您的代码没有它不起作用，请找到潜在的问题并首先解决。然后，您可以添加 `useMemo` 以提高性能。

??? info "如何判断计算是否昂贵"

    通常，除非您创建或循环数千个对象，否则计算可能并不昂贵。如果您想获得更多的信心，可以添加控制台日志以测量在一段代码中花费的时间：

    ```ts linenums="1" hl_lines="4"
    console.time('filter array');
    const visibleTodos = filterTodos(todos, tab);
    console.timeEnd('filter array');
    ```

    执行要测量的交互（例如输入）。然后，您将在控制台中看到诸如过 `filter array：0.15ms` 之类的日志。如果总体记录时间加起来花费时间较高（例如 1 毫秒或更多），则记忆计算可能是有意义的。作为实验，您可以将计算在 `useMemo` 中包装，以验证该相互作用的总记录时间是否减少：

    ```ts 
    console.time('filter array');
    const visibleTodos = useMemo(() => {
      return filterTodos(todos, tab); // Skipped if todos and tab haven't changed
    }, [todos, tab]);
    console.timeEnd('filter array');
    ```

    `useMemo` 不会使第一个渲染更快，它只能帮助您跳过不必要的更新工作。请记住，您的机器可能比用户的速度快，因此最好通过人工放缓来测试性能。例如，Chrome 为此提供了 CPU 节流选项。另请注意，测量开发性能不会给您带来最准确的结果。（例如，当严格模式开启时，您会看到每个组件呈现两次而不是一次。）要获得最准确的时间，请构建应用程序以进行生产，并在用户像用户一样在设备上进行测试。

??? info "你是否需要每处添加 useMemo?"

    如果您的应用程序就像此站点一样，并且大多数交互作用是粗糙的（例如更换页面或整个部分），则通常不需要记忆。另一方面，如果您的应用程序更像是绘图编辑器，并且大多数交互都是颗粒状的（例如移动形状），那么您可能会发现回忆非常有帮助。

    在少数情况下，使用 `useMemo` 进行优化仅是有价值的：

    - 您要进行的 `useMemo` 的计算明显缓慢，并且其依赖性很少发生变化。
    - 您将其作为 `props` 将其传递给封装在 `memo` 中的组件。如果在值没有更改的情况下，您想跳过重新渲染，内存会在依赖项不同时时才进行重新渲染组件。

    在其他情况下，将 `useMemo` 的计算封装没有好处，但这也没有明显的伤害，因此有些团队选择不考虑个别案件，并尽可能地记住。这种方法的缺点是代码变得不那么可读。同样，并非所有的 `memo` 都是有效的：一个“始终更新”的单个值足以打破整个组件的记忆（例如你的依赖项有使用到当前时间的函数）。

    在实践中，您可以通过遵循一些原则来使很多不必要的记忆：

    - 当组件上包裹其他组件时，让它接受 JSX 作为 `children`。这样，当包装器组件更新自己的状态时，React 知道其孩子不需要重新渲染。
    - React 注重局部状态，除非必要的情况下，否则不会进一步提升的状态。例如，不要保留诸如表单的瞬态状态，以及项目是否徘徊在树的顶部还是全局的状态库中。
    - 保持渲染逻辑纯净，如果重新渲染组件会引起问题或产生一些明显的视觉伪像，那么这是组件中的一个 BUG！这个时候需要修复错误，而不是添加回忆。
    - 避免更新状态时触发的不必要效果，React 应用程序中的大多数性能问题都是由更新的链条引起的，这些更新源于导致您的组件反复呈现的效果。
    - 尝试从效果中删除不必要的依赖性。例如，将某些对象或函数移入效果或组件之外通常更简单，而不是使用记忆。

    如果特定的互动仍然惰性加载，请使用 React Developer Tools Profiler 来查看哪些组件将从记忆中受益最大，并在需要时添加回忆。这些原则使您的组件更容易进行调试和理解，因此无论如何都可以跟随它们。从长远来看，我们正在研究自动进行颗粒状回忆，以一劳永逸地解决此问题。

??? example "useMemo 和直接计算值之间的差异"

    === "使用 useMemo 跳过重新计算"

        在此示例中，`FilterTodos` 人为地放慢了速度，因此我们可以看到在渲染过程中调用某些 JavaScript 函数实际发生了什么，通过尝试切换选项卡并切换主题。

        切换选项卡时感觉很慢，因为它强制放缓的过滤器重新执行。这是预期的，因为标签已经改变，因此整个计算需要重新运行。（如果您很好奇它为什么运行两次，请在此处解释。）

        切换主题，多亏了 `useMemo`，尽管人为放缓，但它还是很快的！跳过了 `filterTodos` 的重新计算，因为自上次渲染以来，`todos` 和 `tab` 项都没有发生更改（作为 `useMemo` 的依赖项）。

        ```ts linenums="1" title="App.js"
        import { useState } from 'react';
        import { createTodos } from './utils.js';
        import TodoList from './TodoList.js';

        const todos = createTodos();

        export default function App() {
          const [tab, setTab] = useState('all');
          const [isDark, setIsDark] = useState(false);
          return (
            <>
              <button onClick={() => setTab('all')}>
                All
              </button>
              <button onClick={() => setTab('active')}>
                Active
              </button>
              <button onClick={() => setTab('completed')}>
                Completed
              </button>
              <br />
              <label>
                <input
                  type="checkbox"
                  checked={isDark}
                  onChange={e => setIsDark(e.target.checked)}
                />
                Dark mode
              </label>
              <hr />
              <TodoList
                todos={todos}
                tab={tab}
                theme={isDark ? 'dark' : 'light'}
              />
            </>
          );
        }
        ```

        ```ts linenums="1" title="TodoList.js"
        import { useMemo } from 'react';
        import { filterTodos } from './utils.js'

        export default function TodoList({ todos, theme, tab }) {
          const visibleTodos = useMemo(
            () => filterTodos(todos, tab),
            [todos, tab]
          );
          return (
            <div className={theme}>
              <p><b>Note: <code>filterTodos</code> is artificially slowed down!</b></p>
              <ul>
                {visibleTodos.map(todo => (
                  <li key={todo.id}>
                    {todo.completed ?
                      <s>{todo.text}</s> :
                      todo.text
                    }
                  </li>
                ))}
              </ul>
            </div>
          );
        }
        ```

        ```ts linenums="1" title="utils.js"
        export function createTodos() {
          const todos = [];
          for (let i = 0; i < 50; i++) {
            todos.push({
              id: i,
              text: "Todo " + (i + 1),
              completed: Math.random() > 0.5
            });
          }
          return todos;
        }

        export function filterTodos(todos, tab) {
          console.log('[ARTIFICIALLY SLOW] Filtering ' + todos.length + ' todos for "' + tab + '" tab.');
          let startTime = performance.now();
          while (performance.now() - startTime < 500) {
            // Do nothing for 500 ms to emulate extremely slow code
          }

          return todos.filter(todo => {
            if (tab === 'all') {
              return true;
            } else if (tab === 'active') {
              return !todo.completed;
            } else if (tab === 'completed') {
              return todo.completed;
            }
          });
        }
        ```

    === "总是重新计算一个值"

        在此示例中，`FilterTodos` 的实现也被人为地放慢速度，以便您可以看到当渲染过程中某些JavaScript 函数您调用时会发生什么。

        与上一个示例中不同，切换主题现在也很慢！这是因为此版本中没有 `useMemo` 调用，因此人为放慢的 `filterTodos` 会被调用每个重新渲染。即使只有主题已更改，也被进行调用。

        === "App.js"

            ```js linenums="1" 
            import { useState } from 'react';
            import { createTodos } from './utils.js';
            import TodoList from './TodoList.js';

            const todos = createTodos();

            export default function App() {
              const [tab, setTab] = useState('all');
              const [isDark, setIsDark] = useState(false);
              return (
                <>
                  <button onClick={() => setTab('all')}>
                    All
                  </button>
                  <button onClick={() => setTab('active')}>
                    Active
                  </button>
                  <button onClick={() => setTab('completed')}>
                    Completed
                  </button>
                  <br />
                  <label>
                    <input
                      type="checkbox"
                      checked={isDark}
                      onChange={e => setIsDark(e.target.checked)}
                    />
                    Dark mode
                  </label>
                  <hr />
                  <TodoList
                    todos={todos}
                    tab={tab}
                    theme={isDark ? 'dark' : 'light'}
                  />
                </>
              );
            }
            ```

        === "TodoList.js"

            ```js linenums="1"
            import { filterTodos } from './utils.js'

            export default function TodoList({ todos, theme, tab }) {
              const visibleTodos = filterTodos(todos, tab);
              return (
                <div className={theme}>
                  <ul>
                    <p><b>Note: <code>filterTodos</code> is artificially slowed down!</b></p>
                    {visibleTodos.map(todo => (
                      <li key={todo.id}>
                        {todo.completed ?
                          <s>{todo.text}</s> :
                          todo.text
                        }
                      </li>
                    ))}
                  </ul>
                </div>
              );
            }
            ```

        === "util.js"

            ```js linenums="1"
            export function createTodos() {
              const todos = [];
              for (let i = 0; i < 50; i++) {
                todos.push({
                  id: i,
                  text: "Todo " + (i + 1),
                  completed: Math.random() > 0.5
                });
              }
              return todos;
            }

            export function filterTodos(todos, tab) {
              console.log('[ARTIFICIALLY SLOW] Filtering ' + todos.length + ' todos for "' + tab + '" tab.');
              let startTime = performance.now();
              while (performance.now() - startTime < 500) {
                // Do nothing for 500 ms to emulate extremely slow code
              }

              return todos.filter(todo => {
                if (tab === 'all') {
                  return true;
                } else if (tab === 'active') {
                  return !todo.completed;
                } else if (tab === 'completed') {
                  return todo.completed;
                }
              });
            }
            ```
        
        但是，以下是相同的代码，可以删除人工放缓，缺乏 `useMemo` 是否会感到明显？

        === "App.js"

            ```js linenums="1" 
            import { useState } from 'react';
            import { createTodos } from './utils.js';
            import TodoList from './TodoList.js';

            const todos = createTodos();

            export default function App() {
              const [tab, setTab] = useState('all');
              const [isDark, setIsDark] = useState(false);
              return (
                <>
                  <button onClick={() => setTab('all')}>
                    All
                  </button>
                  <button onClick={() => setTab('active')}>
                    Active
                  </button>
                  <button onClick={() => setTab('completed')}>
                    Completed
                  </button>
                  <br />
                  <label>
                    <input
                      type="checkbox"
                      checked={isDark}
                      onChange={e => setIsDark(e.target.checked)}
                    />
                    Dark mode
                  </label>
                  <hr />
                  <TodoList
                    todos={todos}
                    tab={tab}
                    theme={isDark ? 'dark' : 'light'}
                  />
                </>
              );
            }
            ```

        === "TodoList.js"

            ```js linenums="1"
            import { filterTodos } from './utils.js'

            export default function TodoList({ todos, theme, tab }) {
              const visibleTodos = filterTodos(todos, tab);
              return (
                <div className={theme}>
                  <ul>
                    <p><b>Note: <code>filterTodos</code> is artificially slowed down!</b></p>
                    {visibleTodos.map(todo => (
                      <li key={todo.id}>
                        {todo.completed ?
                          <s>{todo.text}</s> :
                          todo.text
                        }
                      </li>
                    ))}
                  </ul>
                </div>
              );
            }
            ```

        === "util.js"

            ```js linenums="1"
            export function createTodos() {
              const todos = [];
              for (let i = 0; i < 50; i++) {
                todos.push({
                  id: i,
                  text: "Todo " + (i + 1),
                  completed: Math.random() > 0.5
                });
              }
              return todos;
            }

            export function filterTodos(todos, tab) {
              console.log('[ARTIFICIALLY SLOW] Filtering ' + todos.length + ' todos for "' + tab + '" tab.');
              let startTime = performance.now();
              while (performance.now() - startTime < 500) {
                // Do nothing for 500 ms to emulate extremely slow code
              }

              return todos.filter(todo => {
                if (tab === 'all') {
                  return true;
                } else if (tab === 'active') {
                  return !todo.completed;
                } else if (tab === 'completed') {
                  return todo.completed;
                }
              });
            }
            ```
        
        通常情况下没有回忆的代码效果很好，如果您的互动足够快，您可能不需要记忆。

        您可以尝试增加 utils.js 中的待办事项数量，并查看行为的变化。首先，这种特殊的计算并不是很昂贵，但是如果 todos 的数量显着增长，那么大多数开销将重新供应而不是在过滤中进行。继续阅读下面的内容，以了解如何通过 `useMemo` 优化重新渲染。

### 1.2 跳过重新渲染的组件

在某些情况下，`useMemo` 还可以帮助您优化重新渲染儿童组件的性能。为了说明这一点，假设这个 `todoList` 的组件将 `visibleTodos` 作为一个道具传递给 `List` 子组件：

```js linenums="1"
export default function TodoList({ todos, tab, theme }) {
  // ...
  return (
    <div className={theme}>
      <List items={visibleTodos} />
    </div>
  );
}
```

您kennel已经注意到，切换 `theme` 属性会暂时冻结该应用程序，但是如果从您的 JSX 中删除 `<List />` ，就会感觉很快。这告诉我们，值得尝试去优化 `List` 组件。

```js linenums="1" hl_lines="3"
import { memo } from 'react';

const List = memo(function List({ items }) {
  // ...
});
```

通过此更改，如果清单与上次渲染相同，则列表将跳过重新渲染。这是缓存计算变得重要的地方！想象一下，您在没有 `useMemo` 的情况下计算了 `visibleTodos`：

```js linenums="1" hl_lines="3 8"
export default function TodoList({ todos, tab, theme }) {
  // Every time the theme changes, this will be a different array...
  const visibleTodos = filterTodos(todos, tab);
  return (
    <div className={theme}>
      {/* ... so List's props will never be the same, and it will re-render every time */}
      <List items={visibleTodos} />
    </div>
  );
}
```

在上面的示例中，`filterTodos` 函数始终会创建一个不同的数组，类似于 `{}` 对象字面始终创建新对象的方式。通常这不是一个问题，但这意味着 `List` 属性将永远不会相同，而您的 `useMemo` 优化将无法使用。这是 `useMemo` 派上用场了：

```js linenums="1" hl_lines="3 8"
export default function TodoList({ todos, tab, theme }) {
  // Tell React to cache your calculation between re-renders...
  const visibleTodos = useMemo(
    () => filterTodos(todos, tab),
    [todos, tab] // ...so as long as these dependencies don't change...
  );
  return (
    <div className={theme}>
      {/* ...List will receive the same props and can skip re-rendering */}
      <List items={visibleTodos} />
    </div>
  );
}
```

通过将visibletodos计算包装在UseMemo中，您可以确保其在重新汇率之间具有相同的值（直到依赖性更改）。除非出于某种特定原因进行，否则您不必在UseMemo中包装计算。在此示例中，原因是您将其传递给包裹在备忘录中的组件，这使其可以跳过重新渲染。还有其他一些原因添加UseMemo，这些原因在此页面上进行了进一步描述。


## 2. 疑难解答

