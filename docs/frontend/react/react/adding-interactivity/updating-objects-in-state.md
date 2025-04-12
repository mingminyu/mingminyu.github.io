# 更新状态中的对象

状态可以保存任何类型的 JavaScript 值，包括对象。但是你不应该直接改变你在 React 状态下持有的对象。而是，当你想更新一个对象时，你需要创建一个新对象（或复制一个现有对象），然后设置状态以使用该副本。

!!! note "你将学习到"

    - 如何正确更新处于 React 状态的对象
    - 如何在不改变嵌套对象的情况下更新它
    - 什么是不可变性，以及如何不破坏它
    - 如何使用 Immer 减少对象复制的重复性

## 1. 什么是可变？

你可以在状态中存储任何类型的 JavaScript 值。

```jsx
const [x, setX] = useState(0);
```

到目前为止，你一直在处理数字、字符串和布尔值。这些类型的 JavaScript 值是 “不可变的”，表示不可更改或 “read-only”。你可以触发重新渲染以替换值：

```jsx
setX(5);
```

`x` 状态从 `0` 变为 `5`，但数字 `0` 本身没有变化。无法对 JavaScript 中的数字、字符串和布尔值等内置原始值进行任何更改。

现在考虑一个处于状态的对象：

```jsx
const [position, setPosition] = useState({ x: 0, y: 0 });
```

从技术上讲，可以更改对象本身的内容。这称为可变性：

```jsx
position.x = 5;
```

然而，尽管 React 状态中的对象在技术上是可变的，但你应该将它们视为不可变的，就像数字、布尔值和字符串一样。你应该始终替换它们，而不是改变它们。

## 2. 将状态视为只读

换句话说，你应该将任何放入状态的 JavaScript 对象视为只读。

此示例在状态中保存一个对象以表示当前指针位置。当你在预览区域上触摸或移动光标时，红点应该会移动。但是点停留在初始位置：

```jsx linenums="1" title="App.js" hl_lines="10-11"
import { useState } from 'react';
export default function MovingDot() {
  const [position, setPosition] = useState({x: 0, y: 0});
  return (
    <div
      onPointerMove={e => {
        position.x = e.clientX;
        position.y = e.clientY;
      }}
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
      }}>
      <div style={{
        position: 'absolute',
        backgroundColor: 'red',
        borderRadius: '50%',
        transform: `translate(${position.x}px, ${position.y}px)`,
        left: -10,
        top: -10,
        width: 20,
        height: 20,
      }} />
    </div>
  );
}
```

这段代码修改了从 [之前的渲染](https://react.nodejs.cn/learn/state-as-a-snapshot#rendering-takes-a-snapshot-in-time) 分配给 `position` 的对象。但是没有使用状态设置函数，React 不知道对象发生了变化。所以 React 不会做任何响应。这就像在你已经吃完饭后试图改变订单。虽然改变状态在某些情况下可行，但我们不推荐这样做。你应该将在渲染中有权访问的状态值视为只读。

在本例中，要实际执行 [触发重新渲染](https://react.nodejs.cn/learn/state-as-a-snapshot#setting-state-triggers-renders)，请创建一个新对象并将其传递给状态设置函数：

```jsx linenums="1"
onPointerMove={e => {
  setPosition({
    x: e.clientX,
    y: e.clientY
  });
}}
```

使用 `setPosition`，你告诉 React：

- 用这个新对象替换 `position`
- 并再次渲染这个组件

当你触摸或悬停在预览区域上时，请注意红点现在如何跟随你的指针：

```jsx linenums="1" title="App.js"
import { useState } from 'react';
export default function MovingDot() {
  const [position, setPosition] = useState({
    x: 0,
    y: 0
  });
  return (
    <div
      onPointerMove={e => {
        setPosition({
          x: e.clientX,
          y: e.clientY
        });
      }}
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
      }}>
      <div style={{
        position: 'absolute',
        backgroundColor: 'red',
        borderRadius: '50%',
        transform: `translate(${position.x}px, ${position.y}px)`,
        left: -10,
        top: -10,
        width: 20,
        height: 20,
      }} />
    </div>
  );
}
```

???+ tip "局部突变没问题"

这样的代码是一个问题，因为它修改了状态中的现有对象：

```jsx linenums="1"
position.x = e.clientX;
position.y = e.clientY;
```

但是这样的代码绝对没问题，因为你正在改变刚刚创建的新对象：

```jsx linenums="1"
const nextPosition = {};
nextPosition.x = e.clientX;
nextPosition.y = e.clientY;
setPosition(nextPosition);
```

事实上，它完全等同于这样写：

```jsx linenums="1"
setPosition({
  x: e.clientX,
  y: e.clientY
});
```

只有当你更改已处于状态的现有对象时，修改才会成为问题。改变刚刚创建的对象是可以的，因为还没有其他代码引用它。更改它不会意外影响依赖于它的东西。这称为 “局部突变”。你甚至可以在 [渲染时](https://react.nodejs.cn/learn/keeping-components-pure#local-mutation-your-components-little-secret) 做局部突变。 非常方便，完全可以！

## 3. 使用展开语法复制对象

在前面的示例中，`position` 对象始终是从当前光标位置重新创建的。但通常，你会希望将现有数据作为你正在创建的新对象的一部分。例如，你可能只想更新表单中的一个字段，但保留所有其他字段的先前值。

这些输入字段不起作用，因为 `onChange` 处理程序改变了状态：

```jsx linenums="1" title="App.js"
import { useState } from 'react';

export default function Form() {
  const [person, setPerson] = useState({
    firstName: 'Barbara',
    lastName: 'Hepworth',
    email: 'bhepworth@sculpture.com'
  });

  function handleFirstNameChange(e) {
    person.firstName = e.target.value;
  }

  function handleLastNameChange(e) {
    person.lastName = e.target.value;
  }

  function handleEmailChange(e) {
    person.email = e.target.value;
  }

  return (
    <>
      <label>
        First name:
        <input
          value={person.firstName}
          onChange={handleFirstNameChange}
        />
      </label>
      <label>
        Last name:
        <input
          value={person.lastName}
          onChange={handleLastNameChange}
        />
      </label>
      <label>
        Email:
        <input
          value={person.email}
          onChange={handleEmailChange}
        />
      </label>
      <p>
        {person.firstName}{' '}
        {person.lastName}{' '}
        ({person.email})
      </p>
    </>
  );
}
```

例如，这一行改变了过去渲染的状态：

```jsx linenums="1"
person.firstName = e.target.value;
```

获得所需行为的可靠方法是创建一个新对象并将其传递给 `setPerson`。但在这里，你还想将现有数据复制到其中，因为只有一个字段发生了更改：

```jsx linenums="1"
setPerson({
  firstName: e.target.value, // New first name from the input
  lastName: person.lastName,
  email: person.email
});
```

你可以使用 `...` [对象展开](https://web.nodejs.cn/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax#spread_in_object_literals) 语法，这样你就不需要单独复制每个属性。

```jsx linenums="1" hl_lines="2-3"
setPerson({
  ...person, // Copy the old fields
  firstName: e.target.value // But override this one
});
```

现在表单生效了！

请注意你没有为每个输入字段声明单独的状态变量。对于大型表单，将所有数据分组到一个对象中非常方便 - 只要你正确地更新它！

```jsx linenums="1" title="App.js"
import { useState } from 'react';

export default function Form() {
  const [person, setPerson] = useState({
    firstName: 'Barbara',
    lastName: 'Hepworth',
    email: 'bhepworth@sculpture.com'
  });

  function handleFirstNameChange(e) {
    setPerson({
      ...person,
      firstName: e.target.value
    });
  }

  function handleLastNameChange(e) {
    setPerson({
      ...person,
      lastName: e.target.value
    });
  }

  function handleEmailChange(e) {
    setPerson({
      ...person,
      email: e.target.value
    });
  }

  return (
    <>
      <label>
        First name:
        <input
          value={person.firstName}
          onChange={handleFirstNameChange}
        />
      </label>
      <label>
        Last name:
        <input
          value={person.lastName}
          onChange={handleLastNameChange}
        />
      </label>
      <label>
        Email:
        <input
          value={person.email}
          onChange={handleEmailChange}
        />
      </label>
      <p>
        {person.firstName}{' '}
        {person.lastName}{' '}
        ({person.email})
      </p>
    </>
  );
}
```

请注意，`...` 展开语法是 “浅的” - 它只复制一层深度的内容。这使它变得很快，但这也意味着如果你想更新一个嵌套的属性，你将不得不多次使用它。


??? tip "对多个字段使用单个事件处理程序"

你还可以在对象定义中使用 `[` 和 `]` 大括号来指定具有动态名称的属性。这是相同的示例，但使用单个事件处理程序而不是三个不同的事件处理程序：

```jsx linenums="1" title="App.js" hl_lines="13"
import { useState } from 'react';

export default function Form() {
  const [person, setPerson] = useState({
    firstName: 'Barbara',
    lastName: 'Hepworth',
    email: 'bhepworth@sculpture.com'
  });

  function handleChange(e) {
    setPerson({
      ...person,
      [e.target.name]: e.target.value
    });
  }

  return (
    <>
      <label>
        First name:
        <input
          name="firstName"
          value={person.firstName}
          onChange={handleChange}
        />
      </label>
      <label>
        Last name:
        <input
          name="lastName"
          value={person.lastName}
          onChange={handleChange}
        />
      </label>
      <label>
        Email:
        <input
          name="email"
          value={person.email}
          onChange={handleChange}
        />
      </label>
      <p>
        {person.firstName}{' '}
        {person.lastName}{' '}
        ({person.email})
      </p>
    </>
  );
}
```


这里，`e.target.name` 指的是赋予 `<input>` DOM 元素的 `name` 属性。

## 4. 更新嵌套对象

考虑这样的嵌套对象结构：

```jsx linenums="1"
const [person, setPerson] = useState({
  name: 'Niki de Saint Phalle',
  artwork: {
    title: 'Blue Nana',
    city: 'Hamburg',
    image: 'https://i.imgur.com/Sd1AgUOm.jpg',
  }
});
```

如果你想更新 `person.artwork.city`，很清楚如何用可变性来做：

```jsx
person.artwork.city = 'New Delhi';
```

但是在 React 中，你将状态视为不可变的！为了更改 `city`，你首先需要生成新的 `artwork` 对象（预先填充了前一个对象的数据），然后生成指向新的 `artwork` 的新的 `person` 对象：

```jsx linenums="1"
const nextArtwork = { ...person.artwork, city: 'New Delhi' };
const nextPerson = { ...person, artwork: nextArtwork };
setPerson(nextPerson);
```

或者，写成单个函数调用：

```jsx linenums="1"
setPerson({
  ...person, // Copy other fields
  artwork: { // but replace the artwork
    ...person.artwork, // with the same one
    city: 'New Delhi' // but in New Delhi!
  }
});
```

这有点罗嗦，但在很多情况下都可以正常工作：

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


??? tip "对象并没有真正嵌套"

    像这样的对象在代码中出现 “嵌套”：
    
    ```jsx linenums="1"
    let obj = {
      name: 'Niki de Saint Phalle',
      artwork: {
        title: 'Blue Nana',
        city: 'Hamburg',
        image: 'https://i.imgur.com/Sd1AgUOm.jpg',
      }
    };
    ```
    
    但是，“嵌套” 是一种不准确的思考对象行为方式的方法。当代码执行时，没有 “嵌套” 对象这样的东西。你真的在看两个不同的对象：
    
    `obj1` 对象不是在 `obj2` “里面” 。例如，`obj3` 也可以 “指向” `obj1`：
    
    ```jsx linenums="1"
    let obj1 = {
      title: 'Blue Nana',
      city: 'Hamburg',
      image: 'https://i.imgur.com/Sd1AgUOm.jpg',
    };
    
    let obj2 = {
      name: 'Niki de Saint Phalle',
      artwork: obj1
    };
    
    let obj3 = {
      name: 'Copycat',
      artwork: obj1
    };
    ```
    
    如果你要突变 `obj3.artwork.city`，它会影响 `obj2.artwork.city` 和 `obj1.city`。这是因为 `obj3.artwork`、`obj2.artwork` 和 `obj1` 是同一个对象。当你将对象视为 “嵌套” 时，很难看出这一点。而是，它们是具有属性的彼此独立的对象 “指向”。

### 4.1 使用 Immer 编写简洁的更新逻辑

如果你的状态嵌套很深，你可能想考虑 [展平它。](https://react.nodejs.cn/learn/choosing-the-state-structure#avoid-deeply-nested-state) 但是，如果你不想改变你的状态结构，你可能更喜欢嵌套传播的捷径。[Immer](https://github.com/immerjs/use-immer) 是一个流行的库，它允许你使用方便但可变的语法进行编写，并负责为你生成副本。使用 Immer，你编写的代码看起来就像你是 “打破规则” 并且正在改变一个对象：

```jsx linenums="1"
updatePerson(draft => {
  draft.artwork.city = 'Lagos';
});
```

??? tip "Immer 是如何工作的？"

    Immer 提供的 `draft` 是一种特殊类型的对象，称为 [代理](https://web.nodejs.cn/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)，即 “记录” 你用它做什么。这就是为什么你可以随心所欲地改变它！在引擎盖下，Immer 找出 `draft` 的哪些部分已被更改，并生成一个包含你的编辑的全新对象。

尝试 Immer：

1. 运行 `npm install use-immer` 以将 Immer 添加为依赖
2. 然后用 `import { useImmer } from 'use-immer'` 替换 `import { useState } from 'react'`

这是上面的示例转换为 Immer：

???+ example "示例"

      === "package.json"
      
          ```json linenums="1" title="package.json"
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

请注意事件处理程序变得多么简洁。你可以根据需要在单个组件中混合搭配 `useState` 和 `useImmer`。Immer 是保持更新处理程序简洁的好方法，尤其是在你的状态中存在嵌套并且复制对象会导致重复代码的情况下。

??? tip "为什么在 React 中不推荐改变状态？"

    有几个原因：
    
    - 调试如果你使用 `console.log` 并且不改变状态，你过去的日志将不会被最近的状态更改所破坏。所以你可以清楚地看到状态在渲染之间是如何变化的。
    - 优化如果前一个属性或状态与下一个相同，则通用 React [优化策略](https://react.nodejs.cn/reference/react/memo) 依赖于跳过工作。如果你从不改变状态，那么检查是否有任何变化是非常快的。如果是 `prevObj === obj`，你可以确定它内部没有任何变化。
    - 新功能：我们正在构建的新 React 功能依赖于状态为 [像快照一样对待。](https://react.nodejs.cn/learn/state-as-a-snapshot) 如果你正在改变过去版本的状态，那可能会阻止你使用新功能。
    - 要求变更：某些应用功能，如实现撤消/重做、显示更改历史或让用户将表单重置为较早的值，在没有任何变化时更容易实现。这是因为你可以在内存中保留过去的状态副本，并在适当的时候重用它们。如果你从可变方法开始，以后可能很难添加此类功能。
    - 更简单的实现：因为 React 不依赖于修改，所以它不需要对你的对象做任何特殊的事情。它不需要劫持它们的属性，总是将它们封装到代理中，或者像许多 “反应式” 解决方案那样在初始化时做其他工作。这也是 React 允许你将任何对象放入状态的原因 - 无论对象有多大 - 没有额外的性能或正确性缺陷。
  
    在实践中，你通常可以在 React 中使用可变状态 “逃脱”，但我们强烈建议你不要这样做，以便你可以使用以这种方法开发的新 React 功能。未来的贡献者，甚至你未来的自己都会感谢你！

## 5. 回顾

- 将 React 中的所有状态视为不可变的。
- 当你将对象存储在状态中时，改变它们不会触发渲染，并且会更改先前渲染 “快照” 中的状态。
- 与其改变对象，不如创建它的新版本，并通过为其设置状态来触发重新渲染。
- 你可以使用 `{...obj, something: 'newValue'}` 对象展开语法来创建对象的副本。
- 展开语法很浅：它只复制一层深。
- 要更新嵌套对象，你需要从要更新的位置一直向上创建副本。
- 要减少重复复制代码，请使用 Immer。
