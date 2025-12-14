# 更新状态中的对象

数组在 JavaScript 中是可变的，但在将它们存储在状态中时，你应该将它们视为不可变的。就像对象一样，当你想更新存储在状态中的数组时，你需要创建一个新数组（或复制现有数组），然后设置状态以使用新数组。

!!! note "你将学习到"

    - 如何在 React 状态下添加、删除或更改数组中的条目
    - 如何更新数组内的对象
    - 如何使用 Immer 减少数组复制的重复性

## 1. 更新数组而不改变

在 JavaScript 中，数组只是另一种对象。[就像对象](https://react.nodejs.cn/learn/updating-objects-in-state)，你应该将 React 状态下的数组视为只读。这意味着你不应该重新分配像 `arr[0] = 'bird'` 这样的数组内的项目，也不应该使用改变数组的方法，例如 `push()` 和 `pop()`。

而是，每次你想更新一个数组时，你都需要将一个新数组传递给你的状态设置函数。为此，你可以通过调用其非修改方法（如 `filter()` 和 `map()`）从你所在状态的原始数组创建一个新数组。然后你可以将你的状态设置为生成的新数组。

这里有一个常见数组操作的参考表。在处理 React 状态中的数组时，你需要避免使用左栏中的方法，而更优先右栏中的方法：


| 避免（改变数组） | 更喜欢（返回新数组）                 |                                                                                                            |
|----------|----------------------------|------------------------------------------------------------------------------------------------------------|
| 添加       | `push`, `unshift`          | `concat`、`[...arr]` 展开语法 ([示例](https://react.nodejs.cn/learn/updating-arrays-in-state#adding-to-an-array)) |
| 删除       | `pop`, `shift`, `splice`   | `filter`, `slice` ([示例](https://react.nodejs.cn/learn/updating-arrays-in-state#removing-from-an-array))    |
| 替换       | `splice`、`arr[i] = ...` 赋值 | `map`([示例](https://react.nodejs.cn/learn/updating-arrays-in-state#replacing-items-in-an-array))            |
| 排序       | `reverse`, `sort`          | 首先复制数组 ([示例](https://react.nodejs.cn/learn/updating-arrays-in-state#making-other-changes-to-an-array))     |

或者，你可以使用 [使用 Immer](https://react.nodejs.cn/learn/updating-arrays-in-state#write-concise-update-logic-with-immer)，它允许你使用两列中的方法。

!!! warning "易犯错误"

    不幸的是，[`slice`](https://web.nodejs.cn/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/slice) 和 [`splice`](https://web.nodejs.cn/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice) 的命名相似但差别很大：
    
    - `slice` 允许你复制一个数组或其中的一部分。
    - `splice` 改变数组（插入或删除项目）。
    
    在 React 中，你将更频繁地使用 `slice`（没有 `p`！），因为你不想改变状态中的对象或数组。[更新对象](https://react.nodejs.cn/learn/updating-objects-in-state) 解释了什么是突变以及为什么不建议将其用于状态。

### 1.1 添加到数组

`push()` 会改变一个你不想改变的数组：

```jsx linenums="1"
import { useState } from 'react';

let nextId = 0;

export default function List() {
  const [name, setName] = useState('');
  const [artists, setArtists] = useState([]);

  return (
    <>
      <h1>Inspiring sculptors:</h1>
      <input
        value={name}
        onChange={e => setName(e.target.value)}
      />
      <button onClick={() => {
        artists.push({
          id: nextId++,
          name: name,
        });
      }}>Add</button>
      <ul>
        {artists.map(artist => (
          <li key={artist.id}>{artist.name}</li>
        ))}
      </ul>
    </>
  );
}
```

而是，创建一个新数组，其中包含现有项目和末尾的新项目。有多种方法可以做到这一点，但最简单的方法是使用 `...` [数组展开](https://web.nodejs.cn/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax#spread_in_array_literals) 语法：

```jsx linenums="1" title="App.js" hl_lines="17-20"
import { useState } from 'react';

let nextId = 0;

export default function List() {
  const [name, setName] = useState('');
  const [artists, setArtists] = useState([]);

  return (
    <>
      <h1>Inspiring sculptors:</h1>
      <input
        value={name}
        onChange={e => setName(e.target.value)}
      />
      <button onClick={() => {
        setArtists([
          ...artists,
          { id: nextId++, name: name }
        ]);
      }}>Add</button>
      <ul>
        {artists.map(artist => (
          <li key={artist.id}>{artist.name}</li>
        ))}
      </ul>
    </>
  );
}
```

数组扩展语法还允许你通过将条目放在原始 `...artists` 之前来预先添加项目：

```jsx linenums="1"
setArtists([
  { id: nextId++, name: name },
  ...artists // Put old items at the end
]);
```

这样，展开可以通过添加到数组的末尾来完成 `push()` 的工作，也可以通过添加到数组的开头来完成 `unshift()` 的工作。在上面的沙盒中试试吧！


### 1.2 从数组中删除

从数组中删除项目的最简单方法是将其过滤掉。换句话说，你将生成一个不包含该条目的新数组。为此，请使用 `filter` 方法，例如：

```jsx linenums="1" title="App.js" hl_lines="23-25"
import { useState } from 'react';

let initialArtists = [
  { id: 0, name: 'Marta Colvin Andrade' },
  { id: 1, name: 'Lamidi Olonade Fakeye'},
  { id: 2, name: 'Louise Nevelson'},
];

export default function List() {
  const [artists, setArtists] = useState(
    initialArtists
  );

  return (
    <>
      <h1>Inspiring sculptors:</h1>
      <ul>
        {artists.map(artist => (
          <li key={artist.id}>
            {artist.name}{' '}
            <button onClick={() => {
              setArtists(
                artists.filter(a =>
                  a.id !== artist.id
                )
              );
            }}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}
```


单击 “删除” 按钮几次，然后查看其单击处理程序。

```jsx
setArtists(artists.filter(a => a.id !== artist.id));
```

这里，`artists.filter(a => a.id !== artist.id)` 的意思是“创建一个由 ID 与 `artist.id` 不同的 `artists` 组成的数组”。换句话说，每个艺术家的 “删除” 按钮将从数组中过滤出该艺术家，然后请求使用结果数组重新渲染。请注意，`filter` 不会修改原始数组。

### 1.3 转换数组

如果要更改数组的部分或全部项目，可以使用 `map()` 创建新数组。你将传递给 `map` 的函数可以根据其数据或索引（或两者）决定如何处理每个条目。

在此示例中，数组包含两个圆和一个方块的坐标。当你按下按钮时，它只会将圆圈向下移动 50 像素。它通过使用 `map()` 生成一个新的数据数组来做到这一点：

```jsx linenums="1" title="App.js"
import { useState } from 'react';

let initialShapes = [
  { id: 0, type: 'circle', x: 50, y: 100 },
  { id: 1, type: 'square', x: 150, y: 100 },
  { id: 2, type: 'circle', x: 250, y: 100 },
];

export default function ShapeEditor() {
  const [shapes, setShapes] = useState(
    initialShapes
  );

  function handleClick() {
    const nextShapes = shapes.map(shape => {
      if (shape.type === 'square') {
        // No change
        return shape;
      } else {
        // Return a new circle 50px below
        return {
          ...shape,
          y: shape.y + 50,
        };
      }
    });
    // Re-render with the new array
    setShapes(nextShapes);
  }

  return (
    <>
      <button onClick={handleClick}>
        Move circles down!
      </button>
      {shapes.map(shape => (
        <div
          key={shape.id}
          style={{
          background: 'purple',
          position: 'absolute',
          left: shape.x,
          top: shape.y,
          borderRadius:
            shape.type === 'circle'
              ? '50%' : '',
          width: 20,
          height: 20,
        }} />
      ))}
    </>
  );
}
```

### 1.4 替换数组中的条目

想要替换数组中的一个或多个条目是特别常见的。像 `arr[0] = 'bird'` 这样的赋值正在改变原始数组，因此你也需要为此使用 `map`。

要替换项目，请使用 `map` 创建一个新数组。在 `map` 调用中，你将收到项目索引作为第二个参数。用它来决定是否返回原始条目（第一个参数）或其他东西：

```jsx linenums="1" title="App.js" hl_lines="13-21"
import { useState } from 'react';

let initialCounters = [
  0, 0, 0
];

export default function CounterList() {
  const [counters, setCounters] = useState(
    initialCounters
  );

  function handleIncrementClick(index) {
    const nextCounters = counters.map((c, i) => {
      if (i === index) {
        // Increment the clicked counter
        return c + 1;
      } else {
        // The rest haven't changed
        return c;
      }
    });
    setCounters(nextCounters);
  }

  return (
    <ul>
      {counters.map((counter, i) => (
        <li key={i}>
          {counter}
          <button onClick={() => {
            handleIncrementClick(i);
          }}>+1</button>
        </li>
      ))}
    </ul>
  );
}
```

### 1.5 插入到数组

有时，你可能希望在既不是开头也不是结尾的特定位置插入一个条目。为此，你可以将 `...` 数组展开语法与 `slice()` 方法结合使用。`slice()` 方法可让你剪切数组的 “切片”。要插入一个条目，你将创建一个数组，该数组展开插入点之前的切片，然后是新条目，最后是原始数组的其余部分。

在此示例中，“插入”按钮始终在索引 `1` 处插入：

```jsx linenums="1" title="App.js" hl_lines="20 24"
import { useState } from 'react';

let nextId = 3;
const initialArtists = [
  { id: 0, name: 'Marta Colvin Andrade' },
  { id: 1, name: 'Lamidi Olonade Fakeye'},
  { id: 2, name: 'Louise Nevelson'},
];

export default function List() {
  const [name, setName] = useState('');
  const [artists, setArtists] = useState(
    initialArtists
  );

  function handleClick() {
    const insertAt = 1; // Could be any index
    const nextArtists = [
      // Items before the insertion point:
      ...artists.slice(0, insertAt),
      // New item:
      { id: nextId++, name: name },
      // Items after the insertion point:
      ...artists.slice(insertAt)
    ];
    setArtists(nextArtists);
    setName('');
  }

  return (
    <>
      <h1>Inspiring sculptors:</h1>
      <input
        value={name}
        onChange={e => setName(e.target.value)}
      />
      <button onClick={handleClick}>
        Insert
      </button>
      <ul>
        {artists.map(artist => (
          <li key={artist.id}>{artist.name}</li>
        ))}
      </ul>
    </>
  );
}
```

### 1.6 对数组进行其他更改

有些事情你不能单独使用扩展语法和非修改方法，如 `map()` 和 `filter()`。例如，你可能想要对数组进行反转或排序。JavaScript `reverse()` 和 `sort()` 方法正在改变原始数组，因此你不能直接使用它们。

**但是，你可以先复制数组，然后再对其进行更改。**

例如：

```jsx linenums="1" title="App.js" hl_lines="13-14 24-26"
import { useState } from 'react';

const initialList = [
  { id: 0, title: 'Big Bellies' },
  { id: 1, title: 'Lunar Landscape' },
  { id: 2, title: 'Terracotta Army' },
];

export default function List() {
  const [list, setList] = useState(initialList);

  function handleClick() {
    const nextList = [...list];
    nextList.reverse();
    setList(nextList);
  }

  return (
    <>
      <button onClick={handleClick}>
        Reverse
      </button>
      <ul>
        {list.map(artwork => (
          <li key={artwork.id}>{artwork.title}</li>
        ))}
      </ul>
    </>
  );
}
```

在这里，你首先使用 `[...list]` 扩展语法创建原始数组的副本。现在你有了一个副本，你可以使用 `nextList.reverse()` 或 `nextList.sort()` 等修改方法，甚至可以使用 `nextList[0] = "something"` 分配单个条目。

但是，即使复制数组，也无法直接改变其中的现有项。这是因为复制是浅层的 - 新数组将包含与原始数组相同的项目。因此，如果你修改复制数组中的对象，就会改变现有状态。例如，像这样的代码就是一个问题。

```jsx linenums="1" title="App.js"
const nextList = [...list];
nextList[0].seen = true; // Problem: mutates list[0]
setList(nextList);
```

虽然 `nextList` 和 `list` 是两个不同的数组，但 `nextList[0]` 和 `list[0]` 指向同一个对象。因此，通过更改 `nextList[0].seen`，你也会更改 `list[0].seen`。这是状态突变，你应该避免！你可以通过与 [更新嵌套的 JavaScript 对象](https://react.nodejs.cn/learn/updating-objects-in-state#updating-a-nested-object) 类似的方式解决此问题 - 通过复制你想要更改的单个条目而不是改变它们。就是这样。

## 2. 更新数组中的对象

对象并不是真正位于数组 “里面”。它们在代码中可能看起来是 “里面”，但数组中的每个对象都是一个单独的值，数组 “指向” 为该值。这就是为什么在更改像 `list[0]` 这样的嵌套字段时需要小心。另一个人的作品列表可能指向数组的同一个元素！

更新嵌套状态时，你需要从要更新的点开始创建副本，一直到顶层。让我们看看这是如何工作的。

在此示例中，两个单独的艺术品列表具有相同的初始状态。它们应该是隔离的，但由于突变，它们的状态被意外共享，选中一个列表中的框会影响另一个列表：

```jsx linenums="1" title="App.js" hl_lines="18-20 27-29"
import { useState } from 'react';

let nextId = 3;
const initialList = [
  { id: 0, title: 'Big Bellies', seen: false },
  { id: 1, title: 'Lunar Landscape', seen: false },
  { id: 2, title: 'Terracotta Army', seen: true },
];

export default function BucketList() {
  const [myList, setMyList] = useState(initialList);
  const [yourList, setYourList] = useState(
    initialList
  );

  function handleToggleMyList(artworkId, nextSeen) {
    const myNextList = [...myList];
    const artwork = myNextList.find(
      a => a.id === artworkId
    );
    artwork.seen = nextSeen;
    setMyList(myNextList);
  }

  function handleToggleYourList(artworkId, nextSeen) {
    const yourNextList = [...yourList];
    const artwork = yourNextList.find(
      a => a.id === artworkId
    );
    artwork.seen = nextSeen;
    setYourList(yourNextList);
  }

  return (
    <>
      <h1>Art Bucket List</h1>
      <h2>My list of art to see:</h2>
      <ItemList
        artworks={myList}
        onToggle={handleToggleMyList} />
      <h2>Your list of art to see:</h2>
      <ItemList
        artworks={yourList}
        onToggle={handleToggleYourList} />
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

问题出在这样的代码中：

```jsx linenums="1"
const myNextList = [...myList];
const artwork = myNextList.find(a => a.id === artworkId);
artwork.seen = nextSeen; // Problem: mutates an existing item
setMyList(myNextList);
```

虽然 `myNextList` 数组本身是新的，但条目本身与原始 `myList` 数组中的相同。因此，更改 `artwork.seen` 会更改原始艺术品条目。该艺术品条目也在 `yourList` 中，这导致了错误。像这样的错误可能很难考虑，但值得庆幸的是，如果你避免改变状态，它们就会消失。

**你可以使用 `map` 将旧条目替换为其更新版本而不会发生突变。**

```jsx linenums="1"
setMyList(myList.map(artwork => {
  if (artwork.id === artworkId) {
    // Create a *new* object with changes
    return { ...artwork, seen: nextSeen };
  } else {
    // No changes
    return artwork;
  }
}));
```

这里，`...` 是用于 [创建对象的副本](https://react.nodejs.cn/learn/updating-objects-in-state#copying-objects-with-the-spread-syntax) 的对象展开语法。

使用这种方法，现有状态项都不会发生变化，并且错误已修复：

```jsx linenums="1" title="App.js"
import { useState } from 'react';

let nextId = 3;
const initialList = [
  { id: 0, title: 'Big Bellies', seen: false },
  { id: 1, title: 'Lunar Landscape', seen: false },
  { id: 2, title: 'Terracotta Army', seen: true },
];

export default function BucketList() {
  const [myList, setMyList] = useState(initialList);
  const [yourList, setYourList] = useState(
    initialList
  );

  function handleToggleMyList(artworkId, nextSeen) {
    setMyList(myList.map(artwork => {
      if (artwork.id === artworkId) {
        // Create a *new* object with changes
        return { ...artwork, seen: nextSeen };
      } else {
        // No changes
        return artwork;
      }
    }));
  }

  function handleToggleYourList(artworkId, nextSeen) {
    setYourList(yourList.map(artwork => {
      if (artwork.id === artworkId) {
        // Create a *new* object with changes
        return { ...artwork, seen: nextSeen };
      } else {
        // No changes
        return artwork;
      }
    }));
  }

  return (
    <>
      <h1>Art Bucket List</h1>
      <h2>My list of art to see:</h2>
      <ItemList
        artworks={myList}
        onToggle={handleToggleMyList} />
      <h2>Your list of art to see:</h2>
      <ItemList
        artworks={yourList}
        onToggle={handleToggleYourList} />
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

一般来说，你应该只改变刚刚创建的对象。如果你要插入新的艺术品，则可以对其进行更改，但如果你正在处理已经处于状态的东西，则需要制作副本。


### 2.1 使用 Immer 编写简洁的更新逻辑

不改变地更新嵌套数组可能会有点重复。[就像对象一样](https://react.nodejs.cn/learn/updating-objects-in-state#write-concise-update-logic-with-immer)：

- 通常，你不需要更新超过几个层级的状态。如果你的状态对象非常深，你可能需要 [以不同的方式重组它们](https://react.nodejs.cn/learn/choosing-the-state-structure#avoid-deeply-nested-state) 以便它们变平。
- 如果你不想更改你的状态结构，你可能更喜欢使用 [Immer](https://github.com/immerjs/use-immer)，它允许你使用方便但可变的语法进行编写，并负责为你生成副本。

这是用 Immer 重写的艺术遗愿清单示例

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
        
        let nextId = 3;
        const initialList = [
          { id: 0, title: 'Big Bellies', seen: false },
          { id: 1, title: 'Lunar Landscape', seen: false },
          { id: 2, title: 'Terracotta Army', seen: true },
        ];
        
        export default function BucketList() {
          const [myList, updateMyList] = useImmer(
            initialList
          );
          const [yourList, updateYourList] = useImmer(
            initialList
          );
        
          function handleToggleMyList(id, nextSeen) {
            updateMyList(draft => {
              const artwork = draft.find(a =>
                a.id === id
              );
              artwork.seen = nextSeen;
            });
          }
        
          function handleToggleYourList(artworkId, nextSeen) {
            updateYourList(draft => {
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
                artworks={myList}
                onToggle={handleToggleMyList} />
              <h2>Your list of art to see:</h2>
              <ItemList
                artworks={yourList}
                onToggle={handleToggleYourList} />
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

请注意，使用 Immer，像 `artwork.seen = nextSeen` 这样的突变现在是可以的：

```jsx linenums="1"
updateMyTodos(draft => {
  const artwork = draft.find(a => a.id === artworkId);
  artwork.seen = nextSeen;
});
```

这是因为你没有改变原始状态，而是改变了 Immer 提供的特殊 `draft` 对象。同样，你可以将 `push()` 和 `pop()` 等修改方法应用于 `draft` 的内容。

在幕后，Immer 总是根据你对 `draft` 所做的更改从头开始构建下一个状态。这使你的事件处理程序非常简洁，而不会改变状态。

## 3. 回顾

- 你可以将数组放入状态，但不能更改它们。
- 与其改变数组，不如创建它的新版本，并更新它的状态。
- 你可以使用 `[...arr, newItem]` 数组展开语法来创建包含新项的数组。
- 你可以使用 `filter()` 和 `map()` 创建具有过滤或转换项目的新数组。
- 你可以使用 Immer 来保持代码简洁。
