# 添加交互

界面上的控件会根据用户的输入而更新。例如，点击按钮切换轮播图的展示。在 React 中，随时间变化的数据被称为状态（**state**）。你可以向任何组件添加状态，并按需进行更新。在本章节中，你将学习如何编写处理交互的组件，更新它们的状态，并根据时间变化显示不同的效果。

!!! note "本章节"

    - [如何处理用户发起的事件](https://zh-hans.react.dev/learn/responding-to-events)
    - [如何用状态使组件“记住”信息](https://zh-hans.react.dev/learn/state-a-components-memory)
    - [React 是如何分两个阶段更新 UI 的](https://zh-hans.react.dev/learn/render-and-commit)
    - [为什么状态在你改变后没有立即更新](https://zh-hans.react.dev/learn/state-as-a-snapshot)
    - [如何排队进行多个状态的更新](https://zh-hans.react.dev/learn/queueing-a-series-of-state-updates)
    - [如何更新状态中的对象](https://zh-hans.react.dev/learn/updating-objects-in-state)
    - [如何更新状态中的数组](https://zh-hans.react.dev/learn/updating-arrays-in-state)

## 1. 响应事件

React 允许你向 JSX 中添加事件处理程序。事件处理程序是你自己的函数，它将在用户交互时被触发，如点击、悬停、焦点在表单输入框上等等。

`<button>` 等内置组件只支持内置浏览器事件，如 `onClick`。但是，你也可以创建你自己的组件，并给它们的事件处理程序的 `props` 指定你喜欢的任何特定于应用的名称。

```js title="App.js" linenums="1"
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

## 2. 状态是组件的内存

作为交互的结果，组件通常需要更改屏幕上的内容。在表单中输入应该更新输入字段，单击图片轮播上的 “下一个” 应该更改显示的图片，单击 “购买” 将产品放入购物车。组件需要 “记住” 的东西：当前输入值，当前图片，购物车。在 React 中，这种特定于组件的内存称为状态。

你可以使用 [`useState`](https://react.nodejs.cn/reference/react/useState) 钩子将状态添加到组件。钩子是让你的组件使用 React 功能的特殊函数（状态是这些功能之一）。`useState` 钩子允许你声明一个状态变量，它采用初始状态并返回一对值：当前状态，以及一个让你更新它的状态设置函数。

```jsx linenums="1"
const [index, setIndex] = useState(0);
const [showMore, setShowMore] = useState(false);
```

以下是图片库如何在点击时使用和更新状态：

???+ example "示例"

    === "App.js"

        ```jsx linenums="1"
        import { useState } from 'react';
        import { sculptureList } from './data.js';
        
        export default function Gallery() {
          const [index, setIndex] = useState(0);
          const [showMore, setShowMore] = useState(false);
          const hasNext = index < sculptureList.length - 1;
        
          function handleNextClick() {
            if (hasNext) {
              setIndex(index + 1);
            } else {
              setIndex(0);
            }
          }
        
          function handleMoreClick() {
            setShowMore(!showMore);
          }
        
          let sculpture = sculptureList[index];
          return (
            <>
              <button onClick={handleNextClick}>
                Next
              </button>
              <h2>
                <i>{sculpture.name} </i>
                by {sculpture.artist}
              </h2>
              <h3>
                ({index + 1} of {sculptureList.length})
              </h3>
              <button onClick={handleMoreClick}>
                {showMore ? 'Hide' : 'Show'} details
              </button>
              {showMore && <p>{sculpture.description}</p>}
              <img
                src={sculpture.url}
                alt={sculpture.alt}
              />
            </>
          );
        }
        ```

    === "data.js"

        ```jsx linenums="1"
        export const sculptureList = [{
          name: 'Homenaje a la Neurocirugía',
          artist: 'Marta Colvin Andrade',
          description: 'Although Colvin is predominantly known for abstract themes that allude to pre-Hispanic symbols, this gigantic sculpture, an homage to neurosurgery, is one of her most recognizable public art pieces.',
          url: 'https://i.imgur.com/Mx7dA2Y.jpg',
          alt: 'A bronze statue of two crossed hands delicately holding a human brain in their fingertips.'
        }, {
          name: 'Floralis Genérica',
          artist: 'Eduardo Catalano',
          description: 'This enormous (75 ft. or 23m) silver flower is located in Buenos Aires. It is designed to move, closing its petals in the evening or when strong winds blow and opening them in the morning.',
          url: 'https://i.imgur.com/ZF6s192m.jpg',
          alt: 'A gigantic metallic flower sculpture with reflective mirror-like petals and strong stamens.'
        }, {
          name: 'Eternal Presence',
          artist: 'John Woodrow Wilson',
          description: 'Wilson was known for his preoccupation with equality, social justice, as well as the essential and spiritual qualities of humankind. This massive (7ft. or 2,13m) bronze represents what he described as "a symbolic Black presence infused with a sense of universal humanity."',
          url: 'https://i.imgur.com/aTtVpES.jpg',
          alt: 'The sculpture depicting a human head seems ever-present and solemn. It radiates calm and serenity.'
        }, {
          name: 'Moai',
          artist: 'Unknown Artist',
          description: 'Located on the Easter Island, there are 1,000 moai, or extant monumental statues, created by the early Rapa Nui people, which some believe represented deified ancestors.',
          url: 'https://i.imgur.com/RCwLEoQm.jpg',
          alt: 'Three monumental stone busts with the heads that are disproportionately large with somber faces.'
        }, {
          name: 'Blue Nana',
          artist: 'Niki de Saint Phalle',
          description: 'The Nanas are triumphant creatures, symbols of femininity and maternity. Initially, Saint Phalle used fabric and found objects for the Nanas, and later on introduced polyester to achieve a more vibrant effect.',
          url: 'https://i.imgur.com/Sd1AgUOm.jpg',
          alt: 'A large mosaic sculpture of a whimsical dancing female figure in a colorful costume emanating joy.'
        }, {
          name: 'Ultimate Form',
          artist: 'Barbara Hepworth',
          description: 'This abstract bronze sculpture is a part of The Family of Man series located at Yorkshire Sculpture Park. Hepworth chose not to create literal representations of the world but developed abstract forms inspired by people and landscapes.',
          url: 'https://i.imgur.com/2heNQDcm.jpg',
          alt: 'A tall sculpture made of three elements stacked on each other reminding of a human figure.'
        }, {
          name: 'Cavaliere',
          artist: 'Lamidi Olonade Fakeye',
          description: "Descended from four generations of woodcarvers, Fakeye's work blended traditional and contemporary Yoruba themes.",
          url: 'https://i.imgur.com/wIdGuZwm.png',
          alt: 'An intricate wood sculpture of a warrior with a focused face on a horse adorned with patterns.'
        }, {
          name: 'Big Bellies',
          artist: 'Alina Szapocznikow',
          description: "Szapocznikow is known for her sculptures of the fragmented body as a metaphor for the fragility and impermanence of youth and beauty. This sculpture depicts two very realistic large bellies stacked on top of each other, each around five feet (1,5m) tall.",
          url: 'https://i.imgur.com/AlHTAdDm.jpg',
          alt: 'The sculpture reminds a cascade of folds, quite different from bellies in classical sculptures.'
        }, {
          name: 'Terracotta Army',
          artist: 'Unknown Artist',
          description: 'The Terracotta Army is a collection of terracotta sculptures depicting the armies of Qin Shi Huang, the first Emperor of China. The army consisted of more than 8,000 soldiers, 130 chariots with 520 horses, and 150 cavalry horses.',
          url: 'https://i.imgur.com/HMFmH6m.jpg',
          alt: '12 terracotta sculptures of solemn warriors, each with a unique facial expression and armor.'
        }, {
          name: 'Lunar Landscape',
          artist: 'Louise Nevelson',
          description: 'Nevelson was known for scavenging objects from New York City debris, which she would later assemble into monumental constructions. In this one, she used disparate parts like a bedpost, juggling pin, and seat fragment, nailing and gluing them into boxes that reflect the influence of Cubism’s geometric abstraction of space and form.',
          url: 'https://i.imgur.com/rN7hY6om.jpg',
          alt: 'A black matte sculpture where the individual elements are initially indistinguishable.'
        }, {
          name: 'Aureole',
          artist: 'Ranjani Shettar',
          description: 'Shettar merges the traditional and the modern, the natural and the industrial. Her art focuses on the relationship between man and nature. Her work was described as compelling both abstractly and figuratively, gravity defying, and a "fine synthesis of unlikely materials."',
          url: 'https://i.imgur.com/okTpbHhm.jpg',
          alt: 'A pale wire-like sculpture mounted on concrete wall and descending on the floor. It appears light.'
        }, {
          name: 'Hippos',
          artist: 'Taipei Zoo',
          description: 'The Taipei Zoo commissioned a Hippo Square featuring submerged hippos at play.',
          url: 'https://i.imgur.com/6o5Vuyu.jpg',
          alt: 'A group of bronze hippo sculptures emerging from the sett sidewalk as if they were swimming.'
        }];
        ```


## 3. 渲染和提交

在你的组件显示在屏幕上之前，它们必须被 React 渲染。了解此过程中的步骤将帮助你思考代码的执行方式并解释其行为。


想象一下，你的组件是厨房里的厨师，用食材烹制美味佳肴。在这个场景中，React 是一个服务员，负责接收客户的请求并为他们带来订单。这个请求和提供 UI 的过程分为三个步骤：

- 触发渲染（将用餐者的订单传送到厨房）
- 渲染组件（在厨房准备订单）
- 提交给 DOM（将订单放在表格上）

![img.png](https://mingminyu.github.io/webassets/images/20250607/42.png)

## 4. 状态快照

与常规 JavaScript 变量不同，React 状态的行为更像是快照。设置它不会更改你已有的状态变量，而是会触发重新渲染。起初这可能令人惊讶！

```js linenums="1" hl_lines="3"
console.log(count);  // 0
setCount(count + 1); // Request a re-render with 1
console.log(count);  // Still 0!
```

此行为可帮助你避免细微的错误。这是一个小聊天应用。尝试猜测如果你先按 “发送” 然后将收件人更改为 Bob 会发生什么。五秒后 alert 中会出现谁的名字？

```jsx linenums="1" title="App.js"
import { useState } from 'react';

export default function Form() {
  const [to, setTo] = useState('Alice');
  const [message, setMessage] = useState('Hello');

  function handleSubmit(e) {
    e.preventDefault();
    setTimeout(() => {
      alert(`You said ${message} to ${to}`);
    }, 5000);
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        To:{' '}
        <select
          value={to}
          onChange={e => setTo(e.target.value)}>
          <option value="Alice">Alice</option>
          <option value="Bob">Bob</option>
        </select>
      </label>
      <textarea
        placeholder="Message"
        value={message}
        onChange={e => setMessage(e.target.value)}
      />
      <button type="submit">Send</button>
    </form>
  );
}
```

[状态快照](https://react.nodejs.cn/learn/state-as-a-snapshot) 解释了为什么会这样。设置状态请求新的重新渲染，但不会在已经运行的代码中更改它。因此，在你调用 setScore(score + 1) 之后，score 仍然是 0。

## 5. 队列一系列状态更新

这个组件有问题：单击 “+3” 只会增加一次分数。

```jsx linenums="1" title="App.js"
import { useState } from 'react';

export default function Counter() {
  const [score, setScore] = useState(0);

  function increment() {
    setScore(score + 1);
  }

  return (
    <>
      <button onClick={() => increment()}>+1</button>
      <button onClick={() => {
        increment();
        increment();
        increment();
      }}>+3</button>
      <h1>Score: {score}</h1>
    </>
  )
}
```

[状态快照](https://react.nodejs.cn/learn/state-as-a-snapshot) 解释了为什么会这样。设置状态请求新的重新渲染，但不会在已经运行的代码中更改它。因此，在你调用 `setScore(score + 1)` 之后，`score` 仍然是 `0`。

```jsx linenums="1"
console.log(score);  // 0
setScore(score + 1); // setScore(0 + 1);
console.log(score);  // 0
setScore(score + 1); // setScore(0 + 1);
console.log(score);  // 0
setScore(score + 1); // setScore(0 + 1);
console.log(score);  // 0
```

你可以通过在设置状态时传递更新程序函数来解决此问题。请注意如何用 `setScore(s => s + 1)` 替换 `setScore(score + 1)` 来修复 “+3” 按钮。这使你可以对多个状态更新进行排队。

```jsx linenums="1" title="App.js" hl_lines="7"
import { useState } from 'react';

export default function Counter() {
  const [score, setScore] = useState(0);

  function increment() {
    setScore(s => s + 1);
  }

  return (
    <>
      <button onClick={() => increment()}>+1</button>
      <button onClick={() => {
        increment();
        increment();
        increment();
      }}>+3</button>
      <h1>Score: {score}</h1>
    </>
  )
}
```

## 6. 更新状态中的对象

状态可以保存任何类型的 JavaScript 值，包括对象。但是你不应该直接改变你在 React 状态下持有的对象和数组。而是，当你想更新一个对象和数组时，你需要创建一个新的（或复制一个现有的），然后更新状态以使用该副本。

通常，**你将使用 `...` 扩展语法来复制要更改的对象和数组**。例如，更新嵌套对象可能如下所示：

```jsx linenums="1" title="App.js"
import { useState } from 'react';

export default function Form() {
  const [person, setPerson] = useState({
    name: 'Niki de Saint Phalle',
    artwork: {
      title: 'Blue Nana',
      city: 'Hamburg',
      image: 'https://i.imgur.com/Sd1AgUOm.jpg',
    }
  });

  function handleNameChange(e) {
    setPerson({
      ...person,
      name: e.target.value
    });
  }

  function handleTitleChange(e) {
    setPerson({
      ...person,
      artwork: {
        ...person.artwork,
        title: e.target.value
      }
    });
  }

  function handleCityChange(e) {
    setPerson({
      ...person,
      artwork: {
        ...person.artwork,
        city: e.target.value
      }
    });
  }

  function handleImageChange(e) {
    setPerson({
      ...person,
      artwork: {
        ...person.artwork,
        image: e.target.value
      }
    });
  }

  return (
    <>
      <label>
        Name:
        <input
          value={person.name}
          onChange={handleNameChange}
        />
      </label>
      <label>
        Title:
        <input
          value={person.artwork.title}
          onChange={handleTitleChange}
        />
      </label>
      <label>
        City:
        <input
          value={person.artwork.city}
          onChange={handleCityChange}
        />
      </label>
      <label>
        Image:
        <input
          value={person.artwork.image}
          onChange={handleImageChange}
        />
      </label>
      <p>
        <i>{person.artwork.title}</i>
        {' by '}
        {person.name}
        <br />
        (located in {person.artwork.city})
      </p>
      <img
        src={person.artwork.image}
        alt={person.artwork.title}
      />
    </>
  );
}
```

如果在代码中复制对象变得乏味，你可以使用像 [Immer](https://github.com/immerjs/use-immer) 这样的库来减少重复代码：

???+ example "示例"

    === "package.json"

        ```json linenums="1"
        {
          "dependencies": {
            "immer": "1.7.3",
            "react": "latest",
            "react-dom": "latest",
            "react-scripts": "latest",
            "use-immer": "0.5.1"
          },
          "scripts": {
            "start": "react-scripts start",
            "build": "react-scripts build",
            "test": "react-scripts test --env=jsdom",
            "eject": "react-scripts eject"
          },
          "devDependencies": {}
        }
        ```
    
    === "App.js"    

        ```jsx linenums="1"
        import { useImmer } from 'use-immer';
        
        export default function Form() {
          const [person, updatePerson] = useImmer({
            name: 'Niki de Saint Phalle',
            artwork: {
              title: 'Blue Nana',
              city: 'Hamburg',
              image: 'https://i.imgur.com/Sd1AgUOm.jpg',
            }
          });
        
          function handleNameChange(e) {
            updatePerson(draft => {
              draft.name = e.target.value;
            });
          }
        
          function handleTitleChange(e) {
            updatePerson(draft => {
              draft.artwork.title = e.target.value;
            });
          }
        
          function handleCityChange(e) {
            updatePerson(draft => {
              draft.artwork.city = e.target.value;
            });
          }
        
          function handleImageChange(e) {
            updatePerson(draft => {
              draft.artwork.image = e.target.value;
            });
          }
        
          return (
            <>
              <label>
                Name:
                <input
                  value={person.name}
                  onChange={handleNameChange}
                />
              </label>
              <label>
                Title:
                <input
                  value={person.artwork.title}
                  onChange={handleTitleChange}
                />
              </label>
              <label>
                City:
                <input
                  value={person.artwork.city}
                  onChange={handleCityChange}
                />
              </label>
              <label>
                Image:
                <input
                  value={person.artwork.image}
                  onChange={handleImageChange}
                />
              </label>
              <p>
                <i>{person.artwork.title}</i>
                {' by '}
                {person.name}
                <br />
                (located in {person.artwork.city})
              </p>
              <img
                src={person.artwork.image}
                alt={person.artwork.title}
              />
            </>
          );
        }
        ```

## 7. 更新状态数组

数组是另一种类型的可变 JavaScript 对象，你可以将其存储在状态中，并应将其视为只读。就像对象一样，当你想更新存储在状态中的数组时，你需要创建一个新数组（或复制现有数组），然后设置状态以使用新数组：

```jsx linenums="1" title="App.js"
import { useState } from 'react';

const initialList = [
  { id: 0, title: 'Big Bellies', seen: false },
  { id: 1, title: 'Lunar Landscape', seen: false },
  { id: 2, title: 'Terracotta Army', seen: true },
];

export default function BucketList() {
  const [list, setList] = useState(
    initialList
  );

  function handleToggle(artworkId, nextSeen) {
    setList(list.map(artwork => {
      if (artwork.id === artworkId) {
        return { ...artwork, seen: nextSeen };
      } else {
        return artwork;
      }
    }));
  }

  return (
    <>
      <h1>Art Bucket List</h1>
      <h2>My list of art to see:</h2>
      <ItemList
        artworks={list}
        onToggle={handleToggle} />
    </>
  );
}

function ItemList({ artworks, onToggle }) {
  return (
    <ul>
      {artworks.map(artwork => (
        <li key={artwork.id}>
          <label>
            <input
              type="checkbox"
              checked={artwork.seen}
              onChange={e => {
                onToggle(
                  artwork.id,
                  e.target.checked
                );
              }}
            />
            {artwork.title}
          </label>
        </li>
      ))}
    </ul>
  );
}
```

如果在代码中复制数组变得乏味，你可以使用像 [Immer](https://github.com/immerjs/use-immer) 这样的库来减少重复代码：

???+ example "示例"

    === "package.json"

        ```json linenums="1"
        {
          "dependencies": {
            "immer": "1.7.3",
            "react": "latest",
            "react-dom": "latest",
            "react-scripts": "latest",
            "use-immer": "0.5.1"
          },
          "scripts": {
            "start": "react-scripts start",
            "build": "react-scripts build",
            "test": "react-scripts test --env=jsdom",
            "eject": "react-scripts eject"
          },
          "devDependencies": {}
        }
        ```
    
    === "App.js"    

        ```jsx linenums="1"
        import { useState } from 'react';

        import { useImmer } from 'use-immer';
        
        const initialList = [
          { id: 0, title: 'Big Bellies', seen: false },
          { id: 1, title: 'Lunar Landscape', seen: false },
          { id: 2, title: 'Terracotta Army', seen: true },
        ];
        
        export default function BucketList() {
          const [list, updateList] = useImmer(initialList);
        
          function handleToggle(artworkId, nextSeen) {
            updateList(draft => {
              const artwork = draft.find(a =>
                a.id === artworkId
              );
              artwork.seen = nextSeen;
            });
          }
        
          return (
            <>
              <h1>Art Bucket List</h1>
              <h2>My list of art to see:</h2>
              <ItemList
                artworks={list}
                onToggle={handleToggle} />
            </>
          );
        }
        
        function ItemList({ artworks, onToggle }) {
          return (
            <ul>
              {artworks.map(artwork => (
                <li key={artwork.id}>
                  <label>
                    <input
                      type="checkbox"
                      checked={artwork.seen}
                      onChange={e => {
                        onToggle(
                          artwork.id,
                          e.target.checked
                        );
                      }}
                    />
                    {artwork.title}
                  </label>
                </li>
              ))}
            </ul>
          );
        }
        ```