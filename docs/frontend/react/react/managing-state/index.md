# 管理状态

随着你的应用的增长，更有意识地了解你的状态是如何组织的以及数据如何在你的组件之间流动是有帮助的。一般情况下，冗余或重复状态是错误的常见来源。

在本章中，你将学习如何很好地构建状态，如何保持状态更新逻辑的可维护性，以及如何在远距离组件之间共享状态。

!!! note "你将学习到"

    - [如何考虑 UI 随着状态的变化而变化](https://react.nodejs.cn/learn/reacting-to-input-with-state)
    - [如何很好地构建状态](https://react.nodejs.cn/learn/choosing-the-state-structure)
    - [”提升状态” 如何在组件之间共享它](https://react.nodejs.cn/learn/sharing-state-between-components)
    - [如何控制状态是被保留还是重置](https://react.nodejs.cn/learn/preserving-and-resetting-state)
    - [如何在一个函数中整合复杂的状态逻辑](https://react.nodejs.cn/learn/extracting-state-logic-into-a-reducer)
    - [没有 “属性钻取” 如何传递信息](https://react.nodejs.cn/learn/passing-data-deeply-with-context)
    - [如何随着应用的增长扩展状态管理](https://react.nodejs.cn/learn/scaling-up-with-reducer-and-context)

## 1. 使用状态对输入作出反应

使用 React，你不会直接从代码修改 UI。比如你不会写 “禁用按钮”、“启用按钮”、“显示成功信息” 等命令，而是针对你的组件的不同视觉状态（“初始状态”、“键入状态”、“成功状态”）描述你想看到的 UI，然后触发状态响应用户输入的变化（这类似于设计师对 UI 的看法）。

以下是一个使用 React 构建的测验表单，请注意它如何使用 `status` 状态变量来确定是启用还是禁用提交按钮，以及是否显示成功消息。

```jsx linenums="1" title="App.js"
import { useState } from 'react';

export default function Form() {
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('typing');

  if (status === 'success') {
    return <h1>That's right!</h1>
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('submitting');
    try {
      await submitForm(answer);
      setStatus('success');
    } catch (err) {
      setStatus('typing');
      setError(err);
    }
  }

  function handleTextareaChange(e) {
    setAnswer(e.target.value);
  }

  return (
    <>
      <h2>City quiz</h2>
      <p>
        In which city is there a billboard that turns air into drinkable water?
      </p>
      <form onSubmit={handleSubmit}>
        <textarea
          value={answer}
          onChange={handleTextareaChange}
          disabled={status === 'submitting'}
        />
        <br />
        <button disabled={
          answer.length === 0 ||
          status === 'submitting'
        }>
          Submit
        </button>
        {error !== null &&
          <p className="Error">
            {error.message}
          </p>
        }
      </form>
    </>
  );
}

function submitForm(answer) {
  // Pretend it's hitting the network.
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      let shouldError = answer.toLowerCase() !== 'lima'
      if (shouldError) {
        reject(new Error('Good guess but a wrong answer. Try again!'));
      } else {
        resolve();
      }
    }, 1500);
  });
}
```

## 2. 选择状态结构

良好地构建状态可以有效地区分一个易于修改和调试的组件，以及一个经常产生错误的组件。最重要的原则是 **状态不应包含冗余或重复的信息**。如果有不必要的状态，很容易忘记更新它，并引入错误！

例如，此形式有一个冗余的 `fullName` 状态变量：

```jsx linenums="1" title="App.js"
import { useState } from 'react';

export default function Form() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [fullName, setFullName] = useState('');

  function handleFirstNameChange(e) {
    setFirstName(e.target.value);
    setFullName(e.target.value + ' ' + lastName);
  }

  function handleLastNameChange(e) {
    setLastName(e.target.value);
    setFullName(firstName + ' ' + e.target.value);
  }

  return (
    <>
      <h2>Let’s check you in</h2>
      <label>
        First name:{' '}
        <input
          value={firstName}
          onChange={handleFirstNameChange}
        />
      </label>
      <label>
        Last name:{' '}
        <input
          value={lastName}
          onChange={handleLastNameChange}
        />
      </label>
      <p>
        Your ticket will be issued to: <b>{fullName}</b>
      </p>
    </>
  );
}
```

你可以通过在组件渲染时计算 `fullName` 来删除它并简化代码：

```jsx linenums="1" title="App.js"
import { useState } from 'react';

export default function Form() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const fullName = firstName + ' ' + lastName;

  function handleFirstNameChange(e) {
    setFirstName(e.target.value);
  }

  function handleLastNameChange(e) {
    setLastName(e.target.value);
  }

  return (
    <>
      <h2>Let’s check you in</h2>
      <label>
        First name:{' '}
        <input
          value={firstName}
          onChange={handleFirstNameChange}
        />
      </label>
      <label>
        Last name:{' '}
        <input
          value={lastName}
          onChange={handleLastNameChange}
        />
      </label>
      <p>
        Your ticket will be issued to: <b>{fullName}</b>
      </p>
    </>
  );
}
```

这似乎是一个小改动，但 React 应用中的许多错误都是通过这种方式修复的。

## 3. 在组件之间共享状态

有时，你希望两个组件的状态始终一起更改。要做到这一点，从它们两个中删除状态，将其移动到它们最近的共同父级，然后通过属性将其传递给它们。这被称为 “**提升状态**”，它是你在编写 React 代码时最常做的事情之一。

在此示例中，一次只能激活一个面板。为了实现这一点，父组件不是在每个单独的面板中保持活动状态，而是保存状态并为其子级指定属性。

```jsx linenums="1" title="App.js"
import { useState } from 'react';

export default function Accordion() {
  const [activeIndex, setActiveIndex] = useState(0);
  return (
    <>
      <h2>Almaty, Kazakhstan</h2>
      <Panel
        title="About"
        isActive={activeIndex === 0}
        onShow={() => setActiveIndex(0)}
      >
        With a population of about 2 million, Almaty is Kazakhstan's largest city. From 1929 to 1997, it was its capital city.
      </Panel>
      <Panel
        title="Etymology"
        isActive={activeIndex === 1}
        onShow={() => setActiveIndex(1)}
      >
        The name comes from <span lang="kk-KZ">алма</span>, the Kazakh word for "apple" and is often translated as "full of apples". In fact, the region surrounding Almaty is thought to be the ancestral home of the apple, and the wild <i lang="la">Malus sieversii</i> is considered a likely candidate for the ancestor of the modern domestic apple.
      </Panel>
    </>
  );
}

function Panel({
  title,
  children,
  isActive,
  onShow
}) {
  return (
    <section className="panel">
      <h3>{title}</h3>
      {isActive ? (
        <p>{children}</p>
      ) : (
        <button onClick={onShow}>
          Show
        </button>
      )}
    </section>
  );
}
```

## 4. 保留和重置状态

当你重新渲染一个组件时，React 需要决定树的哪些部分要保留（和更新），哪些部分要丢弃或从头开始重新创建。在大多数情况下，React 的自动行为工作得很好。默认情况下，React 会保留 “匹配” 与之前渲染的组件树的部分树。

但是，有时这不是你想要的。在此聊天应用中，键入消息然后切换收件人不会重置输入。这可能会使用户不小心将消息发送给错误的人：

???+ example "示例"

    === "App.js"
    
        ```jsx linenums="1"
        import { useState } from 'react';
        import Chat from './Chat.js';
        import ContactList from './ContactList.js';
        
        export default function Messenger() {
          const [to, setTo] = useState(contacts[0]);
          return (
            <div>
              <ContactList
                contacts={contacts}
                selectedContact={to}
                onSelect={contact => setTo(contact)}
              />
              <Chat contact={to} />
            </div>
          )
        }
        
        const contacts = [
          { name: 'Taylor', email: 'taylor@mail.com' },
          { name: 'Alice', email: 'alice@mail.com' },
          { name: 'Bob', email: 'bob@mail.com' }
        ];
        ```
    
    === "ContactList.js"
    
        ```jsx linenums="1"
        export default function ContactList({
          selectedContact,
          contacts,
          onSelect
        }) {
          return (
            <section className="contact-list">
              <ul>
                {contacts.map(contact =>
                  <li key={contact.email}>
                    <button onClick={() => {
                      onSelect(contact);
                    }}>
                      {contact.name}
                    </button>
                  </li>
                )}
              </ul>
            </section>
          );
        }
        ```
    
    === "Chat.js"
    
        ```jsx linenums="1"
        import { useState } from 'react';
        
        export default function Chat({ contact }) {
          const [text, setText] = useState('');
          return (
            <section className="chat">
              <textarea
                value={text}
                placeholder={'Chat to ' + contact.name}
                onChange={e => setText(e.target.value)}
              />
              <br />
              <button>Send to {contact.email}</button>
            </section>
          );
        }
        ```

React 允许你覆盖默认行为，并通过向组件传递不同的 `key`（例如 `<Chat key={email} />`）来强制组件重置其状态。这告诉 React，如果接收者不同，它应该被认为是一个不同的 `Chat` 组件，需要使用新数据（和 UI 之类的输入）从头开始重新创建。现在在收件人之间切换会重置输入字段 - 即使你渲染相同的组件。

???+ example "示例"

    === "App.js"
    
        ```jsx linenums="1"
        import { useState } from 'react';
        import Chat from './Chat.js';
        import ContactList from './ContactList.js';
        
        export default function Messenger() {
          const [to, setTo] = useState(contacts[0]);
          return (
            <div>
              <ContactList
                contacts={contacts}
                selectedContact={to}
                onSelect={contact => setTo(contact)}
              />
              <Chat key={to.email} contact={to} />
            </div>
          )
        }
        
        const contacts = [
          { name: 'Taylor', email: 'taylor@mail.com' },
          { name: 'Alice', email: 'alice@mail.com' },
          { name: 'Bob', email: 'bob@mail.com' }
        ];
        ```
    
    === "ContactList.js"
    
        ```jsx linenums="1"
        export default function ContactList({
          selectedContact,
          contacts,
          onSelect
        }) {
          return (
            <section className="contact-list">
              <ul>
                {contacts.map(contact =>
                  <li key={contact.email}>
                    <button onClick={() => {
                      onSelect(contact);
                    }}>
                      {contact.name}
                    </button>
                  </li>
                )}
              </ul>
            </section>
          );
        }
        ```
    
    === "Chat.js"
    
        ```jsx linenums="1"
        import { useState } from 'react';
        
        export default function Chat({ contact }) {
          const [text, setText] = useState('');
          return (
            <section className="chat">
              <textarea
                value={text}
                placeholder={'Chat to ' + contact.name}
                onChange={e => setText(e.target.value)}
              />
              <br />
              <button>Send to {contact.email}</button>
            </section>
          );
        }
        ```


## 5. 将状态逻辑提取到 reducer 中

具有许多分布在许多事件处理程序中的状态更新的组件可能会让人不知所措。对于这些情况，你可以将组件外部的所有状态更新逻辑合并到一个名为 “reducer” 的函数中。你的事件处理程序变得简洁，因为它们只指定了用户 “操作”。在文件的底部，reducer 函数指定了状态应该如何更新以响应每个动作！

```jsx linenums="1" title="App.js"
import { useReducer } from 'react';
import AddTask from './AddTask.js';
import TaskList from './TaskList.js';

export default function TaskApp() {
  const [tasks, dispatch] = useReducer(
    tasksReducer,
    initialTasks
  );

  function handleAddTask(text) {
    dispatch({
      type: 'added',
      id: nextId++,
      text: text,
    });
  }

  function handleChangeTask(task) {
    dispatch({
      type: 'changed',
      task: task
    });
  }

  function handleDeleteTask(taskId) {
    dispatch({
      type: 'deleted',
      id: taskId
    });
  }

  return (
    <>
      <h1>Prague itinerary</h1>
      <AddTask
        onAddTask={handleAddTask}
      />
      <TaskList
        tasks={tasks}
        onChangeTask={handleChangeTask}
        onDeleteTask={handleDeleteTask}
      />
    </>
  );
}

function tasksReducer(tasks, action) {
  switch (action.type) {
    case 'added': {
      return [...tasks, {
        id: action.id,
        text: action.text,
        done: false
      }];
    }
    case 'changed': {
      return tasks.map(t => {
        if (t.id === action.task.id) {
          return action.task;
        } else {
          return t;
        }
      });
    }
    case 'deleted': {
      return tasks.filter(t => t.id !== action.id);
    }
    default: {
      throw Error('Unknown action: ' + action.type);
    }
  }
}

let nextId = 3;
const initialTasks = [
  { id: 0, text: 'Visit Kafka Museum', done: true },
  { id: 1, text: 'Watch a puppet show', done: false },
  { id: 2, text: 'Lennon Wall pic', done: false }
];
```

## 6. 使用上下文深入传递数据

通常，你会通过属性将信息从父组件传递到子组件。但是如果你需要通过许多组件传递一些属性，或者如果许多组件需要相同的信息，那么传递属性会变得不方便。Context 允许父组件向其下面的树中的任何组件提供一些信息（无论它有多深），而无需通过属性显式传递它。

此处，`Heading` 组件通过 “询问” 最接近其级别的 `Section` 来确定其标题级别。每个 `Section` 通过询问父 `Section` 并向其添加一个来跟踪自己的级别。每个 `Section` 都在不传递属性的情况下向它下面的所有组件提供信息 - 它通过上下文来做到这一点。

???+ example "示例"

    === "App.js"
    
        ```jsx linenums="1"
        import Heading from './Heading.js';
        import Section from './Section.js';
        
        export default function Page() {
          return (
            <Section>
              <Heading>Title</Heading>
              <Section>
                <Heading>Heading</Heading>
                <Heading>Heading</Heading>
                <Heading>Heading</Heading>
                <Section>
                  <Heading>Sub-heading</Heading>
                  <Heading>Sub-heading</Heading>
                  <Heading>Sub-heading</Heading>
                  <Section>
                    <Heading>Sub-sub-heading</Heading>
                    <Heading>Sub-sub-heading</Heading>
                    <Heading>Sub-sub-heading</Heading>
                  </Section>
                </Section>
              </Section>
            </Section>
          );
        }
        ```
    
    === "Section.js"
    
        ```jsx linenums="1"
        import { useContext } from 'react';
        import { LevelContext } from './LevelContext.js';
        
        export default function Section({ children }) {
          const level = useContext(LevelContext);
          return (
            <section className="section">
              <LevelContext.Provider value={level + 1}>
                {children}
              </LevelContext.Provider>
            </section>
          );
        }
        ```
    
    === "Heading.js"
    
        ```jsx linenums="1"
        import { useContext } from 'react';
        import { LevelContext } from './LevelContext.js';
        
        export default function Heading({ children }) {
          const level = useContext(LevelContext);
          switch (level) {
            case 0:
              throw Error('Heading must be inside a Section!');
            case 1:
              return <h1>{children}</h1>;
            case 2:
              return <h2>{children}</h2>;
            case 3:
              return <h3>{children}</h3>;
            case 4:
              return <h4>{children}</h4>;
            case 5:
              return <h5>{children}</h5>;
            case 6:
              return <h6>{children}</h6>;
            default:
              throw Error('Unknown level: ' + level);
          }
        }
        ```
    
    === "LevelContext.js"
    
        ```jsx linenums="1"
        import { createContext } from 'react';
    
        export const LevelContext = createContext(0);
        ```

## 7. 使用 reducer 和上下文扩展状态管理

Reducer 让你可以整合组件的状态更新逻辑。上下文使你可以将信息深入传递给其他组件。你可以将 reducer 和上下文结合在一起来管理复杂屏幕的状态。

通过这种方法，具有复杂状态的父组件使用 reducer 对其进行管理。树中任何深处的其他组件都可以通过上下文读取其状态。它们还可以调度操作来更新该状态。

???+ example "示例"

    === "App.js"

        ```jsx linenums="1"
        import AddTask from './AddTask.js';
        import TaskList from './TaskList.js';
        import { TasksProvider } from './TasksContext.js';
        
        export default function TaskApp() {
          return (
            <TasksProvider>
              <h1>Day off in Kyoto</h1>
              <AddTask />
              <TaskList />
            </TasksProvider>
          );
        }
      ```

    === "TasksContext.js"

        ```jsx linenums="1"
        import { createContext, useContext, useReducer } from 'react';
        
        const TasksContext = createContext(null);
        const TasksDispatchContext = createContext(null);
        
        export function TasksProvider({ children }) {
          const [tasks, dispatch] = useReducer(
            tasksReducer,
            initialTasks
          );
        
          return (
            <TasksContext.Provider value={tasks}>
              <TasksDispatchContext.Provider
                value={dispatch}
              >
                {children}
              </TasksDispatchContext.Provider>
            </TasksContext.Provider>
          );
        }
        
        export function useTasks() {
          return useContext(TasksContext);
        }
        
        export function useTasksDispatch() {
          return useContext(TasksDispatchContext);
        }
        
        function tasksReducer(tasks, action) {
          switch (action.type) {
            case 'added': {
              return [...tasks, {
                id: action.id,
                text: action.text,
                done: false
              }];
            }
            case 'changed': {
              return tasks.map(t => {
                if (t.id === action.task.id) {
                  return action.task;
                } else {
                  return t;
                }
              });
            }
            case 'deleted': {
              return tasks.filter(t => t.id !== action.id);
            }
            default: {
              throw Error('Unknown action: ' + action.type);
            }
          }
        }
        
        const initialTasks = [
          { id: 0, text: 'Philosopher’s Path', done: true },
          { id: 1, text: 'Visit the temple', done: false },
          { id: 2, text: 'Drink matcha', done: false }
        ];

        ```

    === "AddTask.js"


        ```jsx linenums="1"
        import { useState, useContext } from 'react';
        import { useTasksDispatch } from './TasksContext.js';
        
        export default function AddTask({ onAddTask }) {
          const [text, setText] = useState('');
          const dispatch = useTasksDispatch();
          return (
            <>
              <input
                placeholder="Add task"
                value={text}
                onChange={e => setText(e.target.value)}
              />
              <button onClick={() => {
                setText('');
                dispatch({
                  type: 'added',
                  id: nextId++,
                  text: text,
                });
              }}>Add</button>
            </>
          );
        }
        
        let nextId = 3;
        ```

    === "TaskList.js"

        ```jsx linenums="1"
        import { useState, useContext } from 'react';
        import { useTasks, useTasksDispatch } from './TasksContext.js';
        
        export default function TaskList() {
          const tasks = useTasks();
          return (
            <ul>
              {tasks.map(task => (
                <li key={task.id}>
                  <Task task={task} />
                </li>
              ))}
            </ul>
          );
        }
        
        function Task({ task }) {
          const [isEditing, setIsEditing] = useState(false);
          const dispatch = useTasksDispatch();
          let taskContent;
          if (isEditing) {
            taskContent = (
              <>
                <input
                  value={task.text}
                  onChange={e => {
                    dispatch({
                      type: 'changed',
                      task: {
                        ...task,
                        text: e.target.value
                      }
                    });
                  }} />
                <button onClick={() => setIsEditing(false)}>
                  Save
                </button>
              </>
            );
          } else {
            taskContent = (
              <>
                {task.text}
                <button onClick={() => setIsEditing(true)}>
                  Edit
                </button>
              </>
            );
          }
          return (
            <label>
              <input
                type="checkbox"
                checked={task.done}
                onChange={e => {
                  dispatch({
                    type: 'changed',
                    task: {
                      ...task,
                      done: e.target.checked
                    }
                  });
                }}
              />
              {taskContent}
              <button onClick={() => {
                dispatch({
                  type: 'deleted',
                  id: task.id
                });
              }}>
                Delete
              </button>
            </label>
          );
        }
        ```
