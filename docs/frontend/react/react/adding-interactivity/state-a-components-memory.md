# 状态：组件的内存

作为交互的结果，组件通常需要更改屏幕上的内容。在表单中输入应该更新输入字段，单击图片轮播上的 “下一个” 应该更改显示的图片，单击 “购买” 应该将产品放入购物车。组件需要 “记住” 的东西：当前输入值，当前图片，购物车。在 React 中，这种特定于组件的内存称为状态。

!!! note "你将学习到"
    
    - 如何使用 [`useState`](https://react.nodejs.cn/reference/react/useState) 钩子添加状态变量
    - `useState` 钩子返回哪对值
    - 如何添加多个状态变量
    - 为什么状态在局部被调用

## 1. 当常规变量不够时

这是一个渲染雕塑图片的组件。单击 “下一个” 按钮应显示下一个雕塑，方法是将 `index` 更改为 `1`，然后更改为 `2`，依此类推。但是，这行不通（你可以尝试一下！）：

???+ example "示例"

    === "App.js"

        ```jsx linenums="1" hl_lines="7"
        import { sculptureList } from './data.js';
        import { useState } from 'react';
        
        export default function Gallery() {
          let index = 0;
          
          function handleClick() {
            index += 1;
          }
          
          let sculpture = sculptureList[index];
          return (
              <>
                <button onClick={handleClick}>Next</button>
                <h2>
                  <i>{sculpture.name}</i> by {sculpture.artist}
                </h2>
                <h3>({index + 1} of {sculptureList.length})</h3>
                <img src={sculpture.url} alt={sculpture.alt} />
                <p>{sculpture.description}</p>
              </>
          )
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

`handleClick` 事件处理程序正在更新局部变量 `index`。但是有两件事阻止了这种变化是可见的：

1. 局部变量不会在渲染之间持续存在。当 React 第二次渲染此组件时，它会从头开始渲染它 - 它不会考虑对局部变量的任何更改。
2. 对局部变量的更改不会触发渲染。React 没有意识到它需要用新数据再次渲染组件。

要使用新数据更新组件，需要发生两件事：

1. 保留渲染之间的数据。
2. 触发 React 以使用新数据渲染组件（重新渲染）。

[`useState`](https://react.nodejs.cn/reference/react/useState) 钩子提供了这两件事：

1. 用于保留渲染之间数据的状态变量。
2. 一个状态设置函数，用于更新变量并触发 React 再次渲染组件。

## 2. 添加状态变量

要添加状态变量，请在文件顶部从 React 导入 `useState`，然后替换这一行 `let index = 0;` 为：

```jsx
import { useState } from 'react';

const [index, setIndex] = useState(0);  // (1)
```

  1. `index` 是状态变量，`setIndex` 是设置函数。这里的 `[` 和 `]` 语法称为[数组解构](https://javascript.info/destructuring-assignment)，它允许你从数组中读取值。`useState` 返回的数组始终恰好有两项。

这就是它们在 `handleClick` 中的合作方式：

```jsx
function handleClick() {
  setIndex(index + 1);
}
```

现在点击 “下一个” 按钮切换当前雕塑：

???+ example "示例"

    === "App.js"

        ```jsx linenums="1" hl_lines="7"
        import { sculptureList } from './data.js';
        import { useState } from 'react';
        
        export default function Gallery() {
          const [index, setIndex] = useState(0);
          
          function handleClick() {
            setIndex(index + 1);
          }
          
          let sculpture = sculptureList[index];
          return (
              <>
                <button onClick={handleClick}>Next</button>
                <h2>
                  <i>{sculpture.name}</i> by {sculpture.artist}
                </h2>
                <h3>({index + 1} of {sculptureList.length})</h3>
                <img src={sculpture.url} alt={sculpture.alt} />
                <p>{sculpture.description}</p>
              </>
          )
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

### 2.1 认识你的第一个钩子

在 React 中，`useState` 以及任何其他以“`use`”开头的函数都称为 Hook。**钩子** 是特殊函数，只有在 React 是 [渲染](https://react.nodejs.cn/learn/render-and-commit#step-1-trigger-a-render) 时才可用（我们将在下一页详细介绍）。它们让你拥有 “接入” 种不同的 React 特性。状态只是其中的一个特性，但你稍后会遇到其他钩子。

!!! warning "易犯错误"

    Hooks（以 `use` 开头的函数）**只能在组件的顶层调用**，或者 [你自己的钩子](https://react.nodejs.cn/learn/reusing-logic-with-custom-hooks) 你不能在条件、循环或其他嵌套函数内调用钩子。钩子是函数，但将它们视为关于组件需求的无条件声明会很有帮助。你在组件顶部的 “use” React 特性类似于你在文件顶部的 “导入” 模块。

### 2.2 useState 的剖析

当你调用 `useState` 时，你是在告诉 React 你想让这个组件记住一些东西：

```jsx
import { useState } from 'react';

const [index, setIndex] = useState(0);
```

在这种情况下，你希望 React 记住 index。

!!! note "补充"

    惯例是将这对命名为 `const [something, setSomething]`。实际上，你可以随意命名，但这样的约定会让项目代码更容易理解。

`useState` 的唯一参数是状态变量的初始值。在本例中，`index` 的初始值设置为 `0` 和 `useState(0)`。每次你的组件渲染时，`useState` 都会为你提供一个包含两个值的数组：

1. 状态变量 (`index`) 以及你存储的值。
2. 状态设置函数（`xsetIndex`），可以更新状态变量并触发 React 再次渲染组件。

这是实际发生的情况：

```jsx
import { useState } from 'react';

const [index, setIndex] = useState(0);
```

1. 组件第一次渲染：因为你将 `0` 传递给 `useState` 作为 `index` 的初始值，它会返回 `[0, setIndex]`。React 记住 `0` 是最新的状态值。
2. 更新状态：当用户单击该按钮时，它会调用 `setIndex(index + 1)`。`index` 是 `0`，所以它是 `setIndex(1)`。这告诉 React 记住 `index` 现在是 `1` 并触发另一个渲染。
3. 组件的第二次渲染：React 仍然看到 `useState(0)`，但因为 React 记住你将 `index` 设置为 `1`，所以它返回 `[1, setIndex]`。
4. 以此类推！


## 3. 为组件提供多个状态变量

你可以在一个组件中拥有任意数量的状态变量。该组件有两个状态变量，一个是数字 `index`，另一个是当你单击 “显示详细资料” 时切换的布尔值 `showMore`：

???+ example "示例"

    === "App.js"
        
        ```jsx linenums="1" hl_lines="16"
        import { useState } from 'react';
        import { sculptureList } from './data.js';
        
        export default function Gallery() {
          const [index, setIndex] = useState(0);
          const [showMore, setShowMore] = useState(false);
          
          function handleClick() {
            setIndex(index + 1);
          }
          
          function handleMoreClick() {
            setShowMore(!showMore);
          }
          
          let sculpture = sculptureList[index];  // 会出现数组越界
          return (
            <>
              <button onClick={handleNextClick}>Next</button>
              <h2>
                <i>{sculpture.name}</i> by {sculpture.artist}
              </h2>
              <h3>({index + 1} of {sculptureList.length})</h3>
              <button onClick={handleMoreClick}>
                {showMore ? 'Hide' : 'Show'} details
              </button>
                {showMore && <p>{sculpture.description}</p>}
              <img src={sculpture.url} alt={sculpture.alt} />
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

如果状态变量不相关，那么拥有多个状态变量是个好主意，例如本例中的 `index` 和 `showMore`。但是，如果你发现经常一起更改两个状态变量，则将它们合并为一个可能会更容易。例如，如果你有一个包含许多字段的表单，则使用一个包含对象的状态变量比每个字段的状态变量更方便。阅读 [选择状态结构](https://react.nodejs.cn/learn/choosing-the-state-structure) 了解更多提示。

??? tip "React 如何知道要返回哪个状态？"

    你可能已经注意到 `useState` 调用没有收到任何关于它引用哪个状态变量的信息。没有传递给 `useState` 的 “标识符”，那么它如何知道要返回哪个状态变量呢？它是否依赖于一些魔法，比如解析你的函数？答案是不。
    
    相反，为了实现简洁的语法，Hook 依赖于同一组件的每次渲染的稳定调用顺序。这在实践中效果很好，因为如果你遵循上面的规则 (“只在顶层调用钩子”)，Hooks 将始终以相同的顺序被调用。此外，[代码检查插件](https://www.npmjs.com/package/eslint-plugin-react-hooks) 可以捕捉到大多数错误。
    
    在内部，React 为每个组件保存一组状态对。它还维护当前对索引，该索引在渲染前设置为 `0`。每次调用 `useState` 时，React 都会为你提供下一个状态对并递增索引。你可以在 [React 钩子：不是魔法，只是数组。](https://medium.com/@ryardley/react-hooks-not-magic-just-arrays-cd4f1857236e) 中阅读有关此机制的更多信息。
    
    此示例不使用 React，但它让你了解 `useState` 的内部工作原理：
    
    === "index.js"
    
        ```js linenums="1"
        let componentHooks = [];
        let currentHookIndex = 0;
        
        // How useState works inside React (simplified).
        function useState(initialState) {
          let pair = componentHooks[currentHookIndex];
          if (pair) {
            // This is not the first render,
            // so the state pair already exists.
            // Return it and prepare for next Hook call.
            currentHookIndex++;
            return pair;
          }
        
          // This is the first time we're rendering,
          // so create a state pair and store it.
          pair = [initialState, setState];
        
          function setState(nextState) {
            // When the user requests a state change,
            // put the new value into the pair.
            pair[0] = nextState;
            updateDOM();
          }
        
          // Store the pair for future renders
          // and prepare for the next Hook call.
          componentHooks[currentHookIndex] = pair;
          currentHookIndex++;
          return pair;
        }
        
        function Gallery() {
          // Each useState() call will get the next pair.
          const [index, setIndex] = useState(0);
          const [showMore, setShowMore] = useState(false);
        
          function handleNextClick() {
            setIndex(index + 1);
          }
        
          function handleMoreClick() {
            setShowMore(!showMore);
          }
        
          let sculpture = sculptureList[index];
          // This example doesn't use React, so
          // return an output object instead of JSX.
          return {
            onNextClick: handleNextClick,
            onMoreClick: handleMoreClick,
            header: `${sculpture.name} by ${sculpture.artist}`,
            counter: `${index + 1} of ${sculptureList.length}`,
            more: `${showMore ? 'Hide' : 'Show'} details`,
            description: showMore ? sculpture.description : null,
            imageSrc: sculpture.url,
            imageAlt: sculpture.alt
          };
        }
        
        function updateDOM() {
          // Reset the current Hook index
          // before rendering the component.
          currentHookIndex = 0;
          let output = Gallery();
        
          // Update the DOM to match the output.
          // This is the part React does for you.
          nextButton.onclick = output.onNextClick;
          header.textContent = output.header;
          moreButton.onclick = output.onMoreClick;
          moreButton.textContent = output.more;
          image.src = output.imageSrc;
          image.alt = output.imageAlt;
          if (output.description !== null) {
            description.textContent = output.description;
            description.style.display = '';
          } else {
            description.style.display = 'none';
          }
        }
        
        let nextButton = document.getElementById('nextButton');
        let header = document.getElementById('header');
        let moreButton = document.getElementById('moreButton');
        let description = document.getElementById('description');
        let image = document.getElementById('image');
        let sculptureList = [{
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
        
        // Make UI match the initial state.
        updateDOM();
        ```
    
    === "index.html"
    
        ```html
        <button id="nextButton">
          Next
        </button>
        <h3 id="header"></h3>
        <button id="moreButton"></button>
        <p id="description"></p>
        <img id="image">
        
        <style>
        
        * { box-sizing: border-box; }
        body { font-family: sans-serif; margin: 20px; padding: 0; }
        button { display: block; margin-bottom: 10px; }
        </style>
        ```
  
    你不必了解它就可以使用 React，但你可能会发现这是一个有用的心智模型。


## 4. 状态是隔离的和私有的

状态对于屏幕上的组件实例是局部的。换句话说，如果你渲染同一个组件两次，每个副本都将具有完全隔离的状态！更改其中之一不会影响另一个。

在此示例中，先前的 `Gallery` 组件被渲染了两次，其逻辑没有任何变化。尝试单击每个图库内的按钮。请注意，它们的状态是独立的：

???+ example "示例"

    === "App.js"
    
        ```jsx linenums="1"
        import Gallery from './Gallery.js';
        
        export default function Page() {
          return (
            <div className="Page">
              <Gallery />
              <Gallery />
            </div>
          );
        }
        ```
    
    === "Gallery.js"
    
        ```jsx linenums="1"
        import { useState } from 'react';
        import { sculptureList } from './data.js';
        
        export default function Gallery() {
          const [index, setIndex] = useState(0);
          const [showMore, setShowMore] = useState(false);
        
          function handleNextClick() {
            setIndex(index + 1);
          }
        
          function handleMoreClick() {
            setShowMore(!showMore);
          }
        
          let sculpture = sculptureList[index];
          return (
            <section>
              <button onClick={handleNextClick}>Next</button>
              <h2>
                <i>{sculpture.name} </i>by {sculpture.artist}
              </h2>
              <h3>({index + 1} of {sculptureList.length})</h3>
              <button onClick={handleMoreClick}>
                {showMore ? 'Hide' : 'Show'} details
              </button>
              {showMore && <p>{sculpture.description}</p>}
              <img src={sculpture.url} alt={sculpture.alt} />
            </section>
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

这就是状态不同于你可能在模块顶部声明的常规变量的原因。状态不依赖于特定的函数调用或代码中的位置，但它是 “局部的” 到屏幕上的特定位置。你渲染了两个 `<Gallery />` 组件，因此它们的状态是分开存储的。

还要注意 `Page` 组件如何不 “知道” 关于 `Gallery` 状态的任何信息，甚至它是否有任何信息。与属性不同，state 对于声明它的组件来说是完全私有的。父组件无法更改它。这使你可以在不影响其余组件的情况下向任何组件添加状态或将其删除。

如果你希望两个图库的状态保持同步怎么办？在 React 中正确的做法是从子组件中移除状态并将其添加到它们最近的共享父级中。接下来的几页将专注于组织单个组件的状态，但我们将在 [在组件之间共享状态](https://react.nodejs.cn/learn/sharing-state-between-components) 中回到这个主题。

## 5. 回顾

- 当组件需要在渲染之间 “记住” 某些信息时使用状态变量。
- 状态变量是通过调用 `useState` 钩子来声明的。
- 钩子是以 `use` 开头的特殊函数。它们让你 “接入” React 特性，比如状态。
- 钩子可能会让你想起导入：它们需要无条件地被调用。调用钩子，包括 `useState`，只在一个组件的顶层或另一个钩子有效。
- `useState` 钩子返回一对值：当前状态和更新它的函数。
- 你可以拥有多个状态变量。在内部，React 按顺序匹配它们。
- 状态对组件是私有的。如果你在两个地方渲染它，每个副本都有自己的状态。
