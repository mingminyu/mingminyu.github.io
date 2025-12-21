# 第17章：Rust 的面向对象特性

面向对象编程（Object-Oriented Programming，OOP）是一种模式化编程方式。对象（Object）来源于 20 世纪 60 年代的 Simula 编程语言。这些对象影响了 Alan Kay 的编程架构中对象之间的消息传递。他在 1967 年创造了 **面向对象编程** 这个术语来描述这种架构。关于 OOP 是什么有很多相互矛盾的定义；在一些定义下，Rust 是面向对象的；在其他定义下，Rust 不是。在本章节中，我们会探索一些被普遍认为是面向对象的特性和这些特性是如何体现在 Rust 语言习惯中的。接着会展示如何在 Rust 中实现面向对象设计模式，并讨论这么做与利用 Rust 自身的一些优势实现的方案相比有什么取舍。

## 1. 面向对象语言的特征

关于一个语言被称为面向对象所需的功能，在编程社区内并未达成一致意见。Rust 被很多不同的编程范式影响，包括面向对象编程；比如第 13 章提到了来自函数式编程的特性。面向对象编程语言所共享的一些特性往往是对象、封装和继承。让我们看一下这每一个概念的含义以及 Rust 是否支持他们。

### 1.1 对象包含数据和行为

由 Erich Gamma、Richard Helm、Ralph Johnson 和 John Vlissides（Addison-Wesley Professional, 1994）编写的书 *Design Patterns: Elements of Reusable Object-Oriented Software* 被俗称为 *The Gang of Four* (字面意思为“四人帮”)，它是面向对象编程模式的目录。它这样定义面向对象编程：

> Object-oriented programs are made up of objects. An *object* packages both data and the procedures that operate on that data. The procedures are typically called *methods* or *operations*.
>
> 面向对象的程序是由对象组成的。一个 **对象** 包含数据和操作这些数据的过程。这些过程通常被称为 **方法** 或 **操作**。

在这个定义下，Rust 是面向对象的：结构体和枚举包含数据而 `impl` 块提供了在结构体和枚举之上的方法。虽然带有方法的结构体和枚举并不被 **称为** 对象，但是他们提供了与对象相同的功能，参考 *The Gang of Four* 中对象的定义。

### 1.2 封装隐藏了实现细节

另一个通常与面向对象编程相关的方面是 **封装**（*encapsulation*）的思想：对象的实现细节不能被使用对象的代码获取到。所以唯一与对象交互的方式是通过对象提供的公有 API；使用对象的代码无法深入到对象内部并直接改变数据或者行为。封装使得改变和重构对象的内部时无需改变使用对象的代码。

就像我们在第 7 章讨论的那样：可以使用 `pub` 关键字来决定模块、类型、函数和方法是公有的，而默认情况下其他一切都是私有的。比如，我们可以定义一个包含一个 `i32` 类型 vector 的结构体 `AveragedCollection `。结构体也可以有一个字段，该字段保存了 vector 中所有值的平均值。这样，希望知道结构体中的 vector 的平均值的人可以随时获取它，而无需自己计算。换句话说，`AveragedCollection` 会为我们缓存平均值结果。示例 17-1 有 `AveragedCollection` 结构体的定义：

文件名: src/lib.rs

```rust
pub struct AveragedCollection {
    list: Vec<i32>,
    average: f64,
}
```

示例 17-1: `AveragedCollection` 结构体维护了一个整型列表和集合中所有元素的平均值。

注意，结构体自身被标记为 `pub`，这样其他代码就可以使用这个结构体，但是在结构体内部的字段仍然是私有的。这是非常重要的，因为我们希望保证变量被增加到列表或者被从列表删除时，也会同时更新平均值。可以通过在结构体上实现 `add`、`remove` 和 `average` 方法来做到这一点，如示例 17-2 所示：

文件名: src/lib.rs

```rust
impl AveragedCollection {
    pub fn add(&mut self, value: i32) {
        self.list.push(value);
        self.update_average();
    }

    pub fn remove(&mut self) -> Option<i32> {
        let result = self.list.pop();
        match result {
            Some(value) => {
                self.update_average();
                Some(value)
            },
            None => None,
        }
    }

    pub fn average(&self) -> f64 {
        self.average
    }

    fn update_average(&mut self) {
        let total: i32 = self.list.iter().sum();
        self.average = total as f64 / self.list.len() as f64;
    }
}
```

示例 17-2: 在 `AveragedCollection` 结构体上实现了 `add`、`remove` 和 `average` 公有方法

公有方法 `add`、`remove` 和 `average` 是修改 `AveragedCollection` 实例的唯一方式。当使用 `add` 方法把一个元素加入到 `list` 或者使用 `remove` 方法来删除时，这些方法的实现同时会调用私有的 `update_average` 方法来更新 `average` 字段。

`list` 和 `average` 是私有的，所以没有其他方式来使得外部的代码直接向 `list` 增加或者删除元素，否则 `list` 改变时可能会导致 `average` 字段不同步。`average` 方法返回 `average` 字段的值，这使得外部的代码只能读取 `average` 而不能修改它。

因为我们已经封装好了 `AveragedCollection` 的实现细节，将来可以轻松改变类似数据结构这些方面的内容。例如，可以使用 `HashSet<i32>` 代替 `Vec<i32>` 作为 `list` 字段的类型。只要 `add`、`remove` 和 `average` 公有函数的签名保持不变，使用 `AveragedCollection` 的代码就无需改变。相反如果使得 `list` 为公有，就未必都会如此了： `HashSet<i32>` 和 `Vec<i32>` 使用不同的方法增加或移除项，所以如果要想直接修改 `list` 的话，外部的代码可能不得不做出修改。

如果封装是一个语言被认为是面向对象语言所必要的方面的话，那么 Rust 满足这个要求。在代码中不同的部分使用 `pub` 与否可以封装其实现细节。

## 2. 继承，作为类型系统与代码共享

**继承**（*Inheritance*）是一个很多编程语言都提供的机制，一个对象可以定义为继承另一个对象的定义，这使其可以获得父对象的数据和行为，而无需重新定义。

如果一个语言必须有继承才能被称为面向对象语言的话，那么 Rust 就不是面向对象的。无法定义一个结构体继承父结构体的成员和方法。然而，如果你过去常常在你的编程工具箱使用继承，根据你最初考虑继承的原因，Rust 也提供了其他的解决方案。

选择继承有两个主要的原因。第一个是为了重用代码：一旦为一个类型实现了特定行为，继承可以对一个不同的类型重用这个实现。相反 Rust 代码可以使用默认 trait 方法实现来进行共享，在示例 10-14 中我们见过在 `Summary` trait 上增加的 `summarize` 方法的默认实现。任何实现了 `Summary` trait 的类型都可以使用 `summarize` 方法而无须进一步实现。这类似于父类有一个方法的实现，而通过继承子类也拥有这个方法的实现。当实现 `Summary` trait 时也可以选择覆盖 `summarize` 的默认实现，这类似于子类覆盖从父类继承的方法实现。

第二个使用继承的原因与类型系统有关：表现为子类型可以用于父类型被使用的地方。这也被称为 **多态**（*polymorphism*），这意味着如果多种对象共享特定的属性，则可以相互替代使用。

> 多态（Polymorphism）
>
> 很多人将多态描述为继承的同义词。不过它是一个有关可以用于多种类型的代码的更广泛的概念。对于继承来说，这些类型通常是子类。 Rust 则通过泛型来对不同的可能类型进行抽象，并通过 trait bounds 对这些类型所必须提供的内容施加约束。这有时被称为 *bounded parametric polymorphism*。

近来继承作为一种语言设计的解决方案在很多语言中失宠了，因为其时常带有共享多于所需的代码的风险。子类不应总是共享其父类的所有特征，但是继承却始终如此。如此会使程序设计更为不灵活，并引入无意义的子类方法调用，或由于方法实际并不适用于子类而造成错误的可能性。某些语言还只允许子类继承一个父类，进一步限制了程序设计的灵活性。

因为这些原因，Rust 选择了一个不同的途径，使用 trait 对象而不是继承。让我们看一下 Rust 中的 trait 对象是如何实现多态的。

## 3. 为使用不同类型的值而设计的 trait 对象

在第 8 章中，我们谈到了 vector 只能存储同种类型元素的局限。示例 8-10 中提供了一个定义 `SpreadsheetCell` 枚举来储存整型，浮点型和文本成员的替代方案。这意味着可以在每个单元中储存不同类型的数据，并仍能拥有一个代表一排单元的 vector。这在当编译代码时就知道希望可以交替使用的类型为固定集合的情况下是完全可行的。

然而有时我们希望库用户在特定情况下能够扩展有效的类型集合。为了展示如何实现这一点，这里将创建一个图形用户接口（Graphical User Interface， GUI）工具的例子，它通过遍历列表并调用每一个项目的 `draw` 方法来将其绘制到屏幕上 —— 此乃一个 GUI 工具的常见技术。我们将要创建一个叫做 `gui` 的库 crate，它含一个 GUI 库的结构。这个 GUI 库包含一些可供开发者使用的类型，比如 `Button` 或 `TextField`。在此之上，`gui` 的用户希望创建自定义的可以绘制于屏幕上的类型：比如，一个开发者可能会增加 `Image`，另一个可能会增加 `SelectBox`。

这个例子中并不会实现一个功能完善的 GUI 库，不过会展示其中各个部分是如何结合在一起的。编写库的时候，我们不可能知晓并定义所有其他开发者希望创建的类型。我们所知晓的是 `gui` 需要记录一系列不同类型的值，并需要能够对其中每一个值调用 `draw` 方法。这里无需知道调用 `draw` 方法时具体会发生什么，只要该值会有那个方法可供我们调用。

在拥有继承的语言中，可以定义一个名为 `Component` 的类，该类上有一个 `draw` 方法。其他的类比如 `Button`、`Image` 和 `SelectBox` 会从 `Component` 派生并因此继承 `draw` 方法。它们各自都可以覆盖 `draw` 方法来定义自己的行为，但是框架会把所有这些类型当作是 `Component` 的实例，并在其上调用 `draw`。不过 Rust 并没有继承，我们得另寻出路。

### 3.1 定义通用行为的 trait

为了实现 `gui` 所期望的行为，让我们定义一个 `Draw` trait，其中包含名为 `draw` 的方法。接着可以定义一个存放 **trait 对象**（*trait object*） 的 vector。trait 对象指向一个实现了我们指定 trait 的类型的实例，以及一个用于在运行时查找该类型的 trait 方法的表。我们通过指定某种指针来创建 trait 对象，例如 `&` 引用或 `Box<T>` 智能指针，还有 `dyn` keyword， 以及指定相关的 trait（第 19 章 [“动态大小类型和 `Sized` trait”](https://rustwiki.org/zh-CN/book/ch19-04-advanced-types.html#dynamically-sized-types-and-the-sized-trait) 部分会介绍 trait 对象必须使用指针的原因）。我们可以使用 trait 对象代替泛型或具体类型。任何使用 trait 对象的位置，Rust 的类型系统会在编译时确保任何在此上下文中使用的值会实现其 trait 对象的 trait。如此便无需在编译时就知晓所有可能的类型。

之前提到过，Rust 刻意不将结构体与枚举称为 “对象”，以便与其他语言中的对象相区别。在结构体或枚举中，结构体字段中的数据和 `impl` 块中的行为是分开的，不同于其他语言中将数据和行为组合进一个称为对象的概念中。trait 对象将数据和行为两者相结合，从这种意义上说 **则** 其更类似其他语言中的对象。不过 trait 对象不同于传统的对象，因为不能向 trait 对象增加数据。trait 对象并不像其他语言中的对象那么通用：其（trait 对象）具体的作用是允许对通用行为进行抽象。

示例 17-3 展示了如何定义一个带有 `draw` 方法的 trait `Draw`：

文件名: src/lib.rs

```rust
pub trait Draw {
    fn draw(&self);
}
```

示例 17-3：`Draw` trait 的定义

因为第 10 章已经讨论过如何定义 trait，其语法看起来应该比较眼熟。接下来就是新内容了：示例 17-4 定义了一个存放了名叫 `components` 的 vector 的结构体 `Screen`。这个 vector 的类型是 `Box<dyn Draw>`，此为一个 trait 对象：它是 `Box` 中任何实现了 `Draw` trait 的类型的替身。

文件名: src/lib.rs

```rust
pub struct Screen {
    pub components: Vec<Box<dyn Draw>>,
}
```

示例 17-4: 一个 `Screen` 结构体的定义，它带有一个字段 `components`，其包含实现了 `Draw` trait 的 trait 对象的 vector

在 `Screen` 结构体上，我们将定义一个 `run` 方法，该方法会对其 `components` 上的每一个组件调用 `draw` 方法，如示例 17-5 所示：

文件名: src/lib.rs

```rust
impl Screen {
    pub fn run(&self) {
        for component in self.components.iter() {
            component.draw();
        }
    }
}
```

示例 17-5：在 `Screen` 上实现一个 `run` 方法，该方法在每个 component 上调用 `draw` 方法

这与定义使用了带有 trait bound 的泛型类型参数的结构体不同。泛型类型参数一次只能替代一个具体类型，而 trait 对象则允许在运行时替代多种具体类型。例如，可以定义 `Screen` 结构体来使用泛型和 trait bound，如示例 17-6 所示：

文件名: src/lib.rs

```rust
pub struct Screen<T: Draw> {
    pub components: Vec<T>,
}

impl<T> Screen<T>
    where T: Draw {
    pub fn run(&self) {
        for component in self.components.iter() {
            component.draw();
        }
    }
}
```

示例 17-6: 一种 `Screen` 结构体的替代实现，其 `run` 方法使用泛型和 trait bound

这限制了 `Screen` 实例必须拥有一个全是 `Button` 类型或者全是 `TextField` 类型的组件列表。如果只需要同质（相同类型）集合，则倾向于使用泛型和 trait bound，因为其定义会在编译时采用具体类型进行单态化。

另一方面，通过使用 trait 对象的方法，一个 `Screen` 实例可以存放一个既能包含 `Box<Button>`，也能包含 `Box<TextField>` 的 `Vec<T>`。让我们看看它是如何工作的，接着会讲到其运行时性能影响。

### 3.2 实现 trait

现在来增加一些实现了 `Draw` trait 的类型。我们将提供 `Button` 类型。再一次重申，真正实现 GUI 库超出了本书的范畴，所以 `draw` 方法体中不会有任何有意义的实现。为了想象一下这个实现看起来像什么，一个 `Button` 结构体可能会拥有 `width`、`height` 和 `label` 字段，如示例 17-7 所示：

文件名: src/lib.rs

```rust
pub struct Button {
    pub width: u32,
    pub height: u32,
    pub label: String,
}

impl Draw for Button {
    fn draw(&self) {
        // 实际绘制按钮的代码
    }
}
```

示例 17-7: 一个实现了 `Draw` trait 的 `Button` 结构体

在 `Button` 上的 `width`、`height` 和 `label` 字段会和其他组件不同，比如 `TextField` 可能有 `width`、`height`、`label` 以及 `placeholder` 字段。每一个我们希望能在屏幕上绘制的类型都会使用不同的代码来实现 `Draw` trait 的 `draw` 方法来定义如何绘制特定的类型，像这里的 `Button` 类型（并不包含任何实际的 GUI 代码，这超出了本章的范畴）。除了实现 `Draw` trait 之外，比如 `Button` 还可能有另一个包含按钮点击如何响应的方法的 `impl` 块。这类方法并不适用于像 `TextField` 这样的类型。

如果一些库的使用者决定实现一个包含 `width`、`height` 和 `options` 字段的结构体 `SelectBox`，并且也为其实现了 `Draw` trait，如示例 17-8 所示：

文件名: src/main.rs

```rust
use gui::Draw;

struct SelectBox {
    width: u32,
    height: u32,
    options: Vec<String>,
}

impl Draw for SelectBox {
    fn draw(&self) {
        // code to actually draw a select box
    }
}
```

示例 17-8: 另一个使用 `gui` 的 crate 中，在 `SelectBox` 结构体上实现 `Draw` trait

库使用者现在可以在他们的 `main` 函数中创建一个 `Screen` 实例。至此可以通过将 `SelectBox` 和 `Button` 放入 `Box<T>` 转变为 trait 对象来增加组件。接着可以调用 `Screen` 的 `run` 方法，它会调用每个组件的 `draw` 方法。示例 17-9 展示了这个实现：

文件名: src/main.rs

```rust
use gui::{Screen, Button};

fn main() {
    let screen = Screen {
        components: vec![
            Box::new(SelectBox {
                width: 75,
                height: 10,
                options: vec![
                    String::from("Yes"),
                    String::from("Maybe"),
                    String::from("No")
                ],
            }),
            Box::new(Button {
                width: 50,
                height: 10,
                label: String::from("OK"),
            }),
        ],
    };

    screen.run();
}
```

示例 17-9: 使用 trait 对象来存储实现了相同 trait 的不同类型的值

当编写库的时候，我们不知道何人会在何时增加 `SelectBox` 类型，不过 `Screen` 的实现能够操作并绘制这个新类型，因为 `SelectBox` 实现了 `Draw` trait，这意味着它实现了 `draw` 方法。

这个概念 —— 只关心值所反映的信息而不是其具体类型 —— 类似于动态类型语言中称为 **鸭子类型**（*duck typing*）的概念：如果它走起来像一只鸭子，叫起来像一只鸭子，那么它就是一只鸭子！在示例 17-5 中 `Screen` 上的 `run` 实现中，`run` 并不需要知道各个组件的具体类型是什么。它并不检查组件是 `Button` 或者 `SelectBox` 的实例。通过指定 `Box<dyn Draw>` 作为 `components` vector 中值的类型，我们就定义了 `Screen` 为需要可以在其上调用 `draw` 方法的值。

使用 trait 对象和 Rust 类型系统来进行类似鸭子类型操作的优势是无需在运行时检查一个值是否实现了特定方法或者担心在调用时因为值没有实现方法而产生错误。如果值没有实现 trait 对象所需的 trait 则 Rust 不会编译这些代码。

例如，示例 17-10 展示了当创建一个使用 `String` 做为其组件的 `Screen` 时发生的情况：

文件名: src/main.rs

```rust
use gui::Screen;

fn main() {
    let screen = Screen {
        components: vec![
            Box::new(String::from("Hi")),
        ],
    };

    screen.run();
}
```

示例 17-10: 尝试使用一种没有实现 trait 对象的 trait 的类型

我们会遇到这个错误，因为 `String` 没有实现 `rust_gui::Draw` trait：

```text
error[E0277]: the trait bound `std::string::String: gui::Draw` is not satisfied
  --> src/main.rs:7:13
   |
 7 |             Box::new(String::from("Hi")),
   |             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^ the trait gui::Draw is not
   implemented for `std::string::String`
   |
   = note: required for the cast to the object type `gui::Draw`
```

这告诉了我们，要么是我们传递了并不希望传递给 `Screen` 的类型并应该提供其他类型，要么应该在 `String` 上实现 `Draw` 以便 `Screen` 可以调用其上的 `draw`。

### 3.3 trait 对象执行动态分发

回忆一下第 10 章 [“泛型代码的性能”](https://rustwiki.org/zh-CN/book/ch10-01-syntax.html#performance-of-code-using-generics) 部分讨论过的，当对泛型使用 trait bound 时编译器所进行单态化处理：编译器为每一个被泛型类型参数代替的具体类型生成了非泛型的函数和方法实现。单态化所产生的代码进行 **静态分发**（*static dispatch*）。静态分发发生于编译器在编译时就知晓调用了什么方法的时候。这与 **动态分发**（*dynamic dispatch*）相对，这时编译器在编译时无法知晓调用了什么方法。在动态分发的情况下，编译器会生成在运行时确定调用了什么方法的代码。

当使用 trait 对象时，Rust 必须使用动态分发。编译器无法知晓所有可能用于 trait 对象代码的类型，所以它也不知道应该调用哪个类型的哪个方法实现。为此，Rust 在运行时使用 trait 对象中的指针来知晓需要调用哪个方法。动态分发也阻止编译器有选择的内联方法代码，这会相应的禁用一些优化。尽管在编写示例 17-5 和可以支持示例 17-9 中的代码的过程中确实获得了额外的灵活性，但仍然需要权衡取舍。

### 3.4 Trait 对象要求对象安全

只有 **对象安全**（*object safe*）的 trait 才可以组成 trait 对象。围绕所有使得 trait 对象安全的属性存在一些复杂的规则，不过在实践中，只涉及到两条规则。如果一个 trait 中所有的方法有如下属性时，则该 trait 是对象安全的：

- 返回值类型不为 `Self`
- 方法没有任何泛型类型参数

`Self` 关键字是我们要实现 trait 或方法的类型的别名。对象安全对于 trait 对象是必须的，因为一旦有了 trait 对象，就不再知晓实现该 trait 的具体类型是什么了。如果 trait 方法返回具体的 `Self` 类型，但是 trait 对象忘记了其真正的类型，那么方法不可能使用已经忘却的原始具体类型。同理对于泛型类型参数来说，当使用 trait 时其会放入具体的类型参数：此具体类型变成了实现该 trait 的类型的一部分。当使用 trait 对象时其具体类型被抹去了，故无从得知放入泛型参数类型的类型是什么。

一个 trait 的方法不是对象安全的例子是标准库中的 `Clone` trait。`Clone` trait 的 `clone` 方法的参数签名看起来像这样：

```rust
pub trait Clone {
    fn clone(&self) -> Self;
}
```

`String` 实现了 `Clone` trait，当在 `String` 实例上调用 `clone` 方法时会得到一个 `String` 实例。类似的，当调用 `Vec<T>` 实例的 `clone` 方法会得到一个 `Vec<T>` 实例。`clone` 的签名需要知道什么类型会代替 `Self`，因为这是它的返回值。

如果尝试做一些违反有关 trait 对象的对象安全规则的事情，编译器会提示你。例如，如果尝试实现示例 17-4 中的 `Screen` 结构体来存放实现了 `Clone` trait 而不是 `Draw` trait 的类型，像这样：

```rust
pub struct Screen {
    pub components: Vec<Box<dyn Clone>>,
}
```

将会得到如下错误：

```text
error[E0038]: the trait `std::clone::Clone` cannot be made into an object
 --> src/lib.rs:2:5
  |
2 |     pub components: Vec<Box<dyn Clone>>,
  |     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ the trait `std::clone::Clone`
  cannot be made into an object
  |
  = note: the trait cannot require that `Self : Sized`
```

这意味着不能以这种方式使用此 trait 作为 trait 对象。如果你对对象安全的更多细节感兴趣，请查看 [Rust RFC 255](https://github.com/rust-lang/rfcs/blob/master/text/0255-object-safety.md)。

## 4. 面向对象设计模式的实现](https://rustwiki.org/zh-CN/book/ch17-03-oo-design-patterns.html#面向对象设计模式的实现)

**状态模式**（*state pattern*）是一个面向对象设计模式。该模式的关键在于一个值有某些内部状态，体现为一系列的 **状态对象**，同时值的行为随着其内部状态而改变。状态对象共享功能：当然，在 Rust 中使用结构体和 trait 而不是对象和继承。每一个状态对象负责其自身的行为，以及该状态何时应当转移至另一个状态。持有一个状态对象的值对于不同状态的行为以及何时状态转移毫不知情。

使用状态模式意味着当程序的业务需求改变时，无需修改保存状态值的代码或使用值的代码。我们只需更新某个状态对象内部的代码，即可改变其规则，也可以增加更多的状态对象。让我们看看一个有关状态模式和如何在 Rust 中使用它的例子。

为了探索这个概念，我们将实现一个增量式的发布博文的工作流。这个博客的最终功能看起来像这样：

1. 博文从空白的草案开始。
2. 一旦草案完成，请求审核博文。
3. 一旦博文过审，它将被发表。
4. 只有被发表的博文的内容会被打印，这样就不会意外打印出没有被审核的博文的文本。

任何其他对博文的修改尝试都是没有作用的。例如，如果尝试在请求审核之前通过一个草案博文，博文应该保持未发布的状态。

示例 17-11 展示这个工作流的代码形式：这是一个我们将要在一个叫做 `blog` 的库 crate 中实现的 API 的示例。这段代码还不能编译，因为还未实现 `blog`。

文件名: src/main.rs

```rust
use blog::Post;

fn main() {
    let mut post = Post::new();

    post.add_text("I ate a salad for lunch today");
    assert_eq!("", post.content());

    post.request_review();
    assert_eq!("", post.content());

    post.approve();
    assert_eq!("I ate a salad for lunch today", post.content());
}
```

示例 17-11: 展示了 `blog` crate 期望行为的代码

我们希望允许用户使用 `Post::new` 创建一个新的博文草案。接着希望能在草案阶段为博文编写一些文本。如果尝试在审核之前立即打印出博文的内容，什么也不会发生因为博文仍然是草案。这里增加的 `assert_eq!` 出于演示目的。一个好的单元测试将是断言草案博文的 `content` 方法返回空字符串，不过我们并不准备为这个例子编写单元测试。

接下来，我们希望能够请求审核博文，而在等待审核的阶段 `content` 应该仍然返回空字符串。最后当博文审核通过，它应该被发表，这意味着当调用 `content` 时博文的文本将被返回。

注意我们与 crate 交互的唯一的类型是 `Post`。这个类型会使用状态模式并会存放处于三种博文所可能的状态之一的值 —— 草案，等待审核和发布。状态的改变由 `Post` 类型内部进行管理。状态会随着用户对 `Post` 实例方法的调用而改变，但是不能直接对状态进行管理。这意味着用户不会在状态管理上犯错，比如在过审前发布博文。

### 4.1 定义 `Post` 并新建一个草案状态的实例

让我们开始实现这个库吧！我们知道需要一个公有 `Post` 结构体来存放一些文本，所以让我们从结构体的定义和一个创建 `Post` 实例的公有关联函数 `new` 开始，如示例 17-12 所示。还需定义一个私有 trait `State`。`Post` 将在私有字段 `state` 中存放一个 `Option<T>` 类型的 trait 对象 `Box<dyn State>`。稍后将会看到为何 `Option<T>` 是必须的。

文件名: src/lib.rs

```rust
pub struct Post {
    state: Option<Box<dyn State>>,
    content: String,
}

impl Post {
    pub fn new() -> Post {
        Post {
            state: Some(Box::new(Draft {})),
            content: String::new(),
        }
    }
}

trait State {}

struct Draft {}

impl State for Draft {}
```

示例 17-12: `Post` 结构体的定义和新建 `Post` 实例的 `new` 函数，`State` trait 和结构体 `Draft`

`State` trait 定义了所有不同状态的博文所共享的行为，同时 `Draft`、`PendingReview` 和 `Published` 状态都会实现 `State` 状态。现在这个 trait 并没有任何方法，同时开始将只定义 `Draft` 状态因为这是我们希望博文的初始状态。

当创建新的 `Post` 时，我们将其 `state` 字段设置为一个存放了 `Box` 的 `Some` 值。这个 `Box` 指向一个 `Draft` 结构体新实例。这确保了无论何时新建一个 `Post` 实例，它都会从草案开始。因为 `Post` 的 `state` 字段是私有的，也就无法创建任何其他状态的 `Post` 了！。`Post::new` 函数中将 `content` 设置为新建的空 `String`。

### 4.2 存放博文内容的文本

在示例 17-11 中，展示了我们希望能够调用一个叫做 `add_text` 的方法并向其传递一个 `&str` 来将文本增加到博文的内容中。选择实现为一个方法而不是将 `content` 字段暴露为 `pub` 。这意味着之后可以实现一个方法来控制 `content` 字段如何被读取。`add_text` 方法是非常直观的，让我们在示例 17-13 的 `impl Post` 块中增加一个实现：

文件名: src/lib.rs

```rust
impl Post {
    // --snip--
    pub fn add_text(&mut self, text: &str) {
        self.content.push_str(text);
    }
}
```

示例 17-13: 实现方法 `add_text` 来向博文的 `content` 增加文本

`add_text` 获取一个 `self` 的可变引用，因为需要改变调用 `add_text` 的 `Post` 实例。接着调用 `content` 中的 `String` 的 `push_str` 并传递 `text` 参数来保存到 `content` 中。这不是状态模式的一部分，因为它的行为并不依赖博文所处的状态。`add_text` 方法完全不与 `state` 状态交互，不过这是我们希望支持的行为的一部分。

### 4.3 确保博文草案的内容是空的

即使调用 `add_text` 并向博文增加一些内容之后，我们仍然希望 `content` 方法返回一个空字符串 slice，因为博文仍然处于草案状态，如示例 17-11 的第 8 行所示。现在让我们使用能满足要求的最简单的方式来实现 `content` 方法：总是返回一个空字符串 slice。当实现了将博文状态改为发布的能力之后将改变这一做法。但是目前博文只能是草案状态，这意味着其内容应该总是空的。示例 17-14 展示了这个占位符实现：

文件名: src/lib.rs

```rust
impl Post {
    // --snip--
    pub fn content(&self) -> &str {
        ""
    }
}
```

列表 17-14: 增加一个 `Post` 的 `content` 方法的占位实现，它总是返回一个空字符串 slice

通过增加这个 `content` 方法，示例 17-11 中直到第 8 行的代码能如期运行。

### 4.4 请求审核博文来改变其状态

接下来需要增加请求审核博文的功能，这应当将其状态由 `Draft` 改为 `PendingReview`。示例 17-15 展示了这个代码：

文件名: src/lib.rs

```rust
impl Post {
    // --snip--
    pub fn request_review(&mut self) {
        if let Some(s) = self.state.take() {
            self.state = Some(s.request_review())
        }
    }
}

trait State {
    fn request_review(self: Box<Self>) -> Box<dyn State>;
}

struct Draft {}

impl State for Draft {
    fn request_review(self: Box<Self>) -> Box<dyn State> {
        Box::new(PendingReview {})
    }
}

struct PendingReview {}

impl State for PendingReview {
    fn request_review(self: Box<Self>) -> Box<dyn State> {
        self
    }
}
```

示例 17-15: 实现 `Post` 和 `State` trait 的 `request_review` 方法

这里为 `Post` 增加一个获取 `self` 可变引用的公有方法 `request_review`。接着在 `Post` 的当前状态下调用内部的 `request_review` 方法，并且第二个 `request_review` 方法会消费当前的状态并返回一个新状态。

这里给 `State` trait 增加了 `request_review` 方法；所有实现了这个 trait 的类型现在都需要实现 `request_review` 方法。注意不同于使用 `self`、 `&self` 或者 `&mut self` 作为方法的第一个参数，这里使用了 `self: Box<Self>`。这个语法意味着该方法只可在持有这个类型的 `Box` 上被调用。这个语法获取了 `Box<Self>` 的所有权使老状态无效化，以便 `Post` 的状态值可转换为一个新状态。

为了消费老状态，`request_review` 方法需要获取状态值的所有权。这就是 `Post` 的 `state` 字段中 `Option` 的来历：调用 `take` 方法将 `state` 字段中的 `Some` 值取出并留下一个 `None`，因为 Rust 不允许结构体实例中存在值为空的字段。这使得我们将 `state` 的值移出 `Post` 而不是借用它。接着我们将博文的 `state` 值设置为这个操作的结果。

我们需要将 `state` 临时设置为 `None` 来获取 `state` 值，即老状态的所有权，而不是使用 `self.state = self.state.request_review();` 这样的代码直接更新状态值。这确保了当 `Post` 被转换为新状态后不能再使用老 `state` 值。

`Draft` 的 `request_review` 方法需要返回一个新的，装箱的 `PendingReview` 结构体的实例，其用来代表博文处于等待审核状态。结构体 `PendingReview` 同样也实现了 `request_review` 方法，不过它不进行任何状态转换。相反它返回自身，因为当我们请求审核一个已经处于 `PendingReview` 状态的博文，它应该继续保持 `PendingReview` 状态。

现在我们能看出状态模式的优势了：无论 `state` 是何值，`Post` 的 `request_review` 方法都是一样的。每个状态只负责它自己的规则。

我们将继续保持 `Post` 的 `content` 方法实现不变，返回一个空字符串 slice。现在我们可以拥有 `PendingReview` 状态和 `Draft` 状态的 `Post` 了，不过我们希望在 `PendingReview` 状态下 `Post` 也有相同的行为。现在示例 17-11 中直到 10 行的代码是可以执行的！

### 4.5 增加改变 `content` 行为的 `approve` 方法

`approve` 方法将与 `request_review` 方法类似：它会将 `state` 设置为审核通过时应处于的状态，如示例 17-16 所示。

文件名: src/lib.rs

```rust
impl Post {
    // --snip--
    pub fn approve(&mut self) {
        if let Some(s) = self.state.take() {
            self.state = Some(s.approve())
        }
    }
}

trait State {
    fn request_review(self: Box<Self>) -> Box<dyn State>;
    fn approve(self: Box<Self>) -> Box<dyn State>;
}

struct Draft {}

impl State for Draft {
    // --snip--
    fn approve(self: Box<Self>) -> Box<dyn State> {
        self
    }
}

struct PendingReview {}

impl State for PendingReview {
    // --snip--
    fn approve(self: Box<Self>) -> Box<dyn State> {
        Box::new(Published {})
    }
}

struct Published {}

impl State for Published {
    fn request_review(self: Box<Self>) -> Box<dyn State> {
        self
    }

    fn approve(self: Box<Self>) -> Box<dyn State> {
        self
    }
}
```

示例 17-16: 为 `Post` 和 `State` trait 实现 `approve` 方法

这里为 `State` trait 增加了 `approve` 方法，并新增了一个实现了 `State` 的结构体，`Published` 状态。

类似于 `request_review`，如果对 `Draft` 调用 `approve` 方法，并没有任何效果，因为它会返回 `self`。当对 `PendingReview` 调用 `approve` 时，它返回一个新的、装箱的 `Published` 结构体的实例。`Published` 结构体实现了 `State` trait，同时对于 `request_review` 和 `approve` 两方法来说，它返回自身，因为在这两种情况博文应该保持 `Published` 状态。

现在更新 `Post` 的 `content` 方法：如果状态为 `Published` 希望返回博文 `content` 字段的值；否则希望返回空字符串 slice，如示例 17-17 所示：

文件名: src/lib.rs

```rust
impl Post {
    // --snip--
    pub fn content(&self) -> &str {
        self.state.as_ref().unwrap().content(self)
    }
    // --snip--
}
```

示例 17-17: 更新 `Post` 的 `content` 方法来委托调用 `State` 的`content` 方法

因为目标是将所有像这样的规则保持在实现了 `State` 的结构体中，我们将调用 `state` 中的值的 `content` 方法并传递博文实例（也就是 `self`）作为参数。接着返回 `state` 值的 `content` 方法的返回值。

这里调用 `Option` 的 `as_ref` 方法是因为需要 `Option` 中值的引用而不是获取其所有权。因为 `state` 是一个 `Option<Box<State>>`，调用 `as_ref` 会返回一个 `Option<&Box<State>>`。如果不调用 `as_ref`，将会得到一个错误，因为不能将 `state` 移动出借用的 `&self` 函数参数。

接着调用 `unwrap` 方法，这里我们知道它永远也不会 panic，因为 `Post` 的所有方法都确保在他们返回时 `state` 会有一个 `Some` 值。这就是一个第 9 章 [“当我们比编译器知道更多的情况”](https://rustwiki.org/zh-CN/book/ch09-03-to-panic-or-not-to-panic.html#cases-in-which-you-have-more-information-than-the-compiler) 部分讨论过的我们知道 `None` 是不可能的而编译器却不能理解的情况。

接着我们就有了一个 `&Box<State>`，当调用其 `content` 时，解引用强制转换会作用于 `&` 和 `Box` ，这样最终会调用实现了 `State` trait 的类型的 `content` 方法。这意味着需要为 `State` trait 定义增加 `content`，这也是放置根据所处状态返回什么内容的逻辑的地方，如示例 17-18 所示：

文件名: src/lib.rs

```rust
trait State {
    // --snip--
    fn content<'a>(&self, post: &'a Post) -> &'a str {
        ""
    }
}

// --snip--
struct Published {}

impl State for Published {
    // --snip--
    fn content<'a>(&self, post: &'a Post) -> &'a str {
        &post.content
    }
}
```

示例 17-18: 为 `State` trait 增加 `content` 方法

这里增加了一个 `content` 方法的默认实现来返回一个空字符串 slice。这意味着无需为 `Draft` 和 `PendingReview` 结构体实现 `content` 了。`Published` 结构体会覆盖 `content` 方法并会返回 `post.content` 的值。

注意这个方法需要生命周期标注，如第 10 章所讨论的。这里获取 `post` 的引用作为参数，并返回 `post` 一部分的引用，所以返回的引用的生命周期与 `post` 参数相关。

现在示例完成了 —— 现在示例 17-11 中所有的代码都能工作！我们通过发布博文工作流的规则实现了状态模式。围绕这些规则的逻辑都存在于状态对象中而不是分散在 `Post` 之中。

### 4.6 状态模式的权衡取舍

我们展示了 Rust 是能够实现面向对象的状态模式的，以便能根据博文所处的状态来封装不同类型的行为。`Post` 的方法并不知道这些不同类型的行为。通过这种组织代码的方式，要找到所有已发布博文的不同行为只需查看一处代码：`Published` 的 `State` trait 的实现。

如果要创建一个不使用状态模式的替代实现，则可能会在 `Post` 的方法中，或者甚至于在 `main` 代码中用到 `match` 语句，来检查博文状态并在这里改变其行为。这意味着需要查看很多位置来理解处于发布状态的博文的所有逻辑！这在增加更多状态时会变得更糟：每一个 `match` 语句都会需要另一个分支。

对于状态模式来说，`Post` 的方法和使用 `Post` 的位置无需 `match` 语句，同时增加新状态只涉及到增加一个新 `struct` 和为其实现 trait 的方法。

这个实现易于扩展增加更多功能。为了体会使用此模式维护代码的简洁性，请尝试如下一些建议：

- 增加 `reject` 方法将博文的状态从 `PendingReview` 变回 `Draft`
- 在将状态变为 `Published` 之前需要两次 `approve` 调用
- 只允许博文处于 `Draft` 状态时增加文本内容。提示：让状态对象负责内容可能发生什么改变，但不负责修改 `Post`。

状态模式的一个缺点是因为状态实现了状态之间的转换，一些状态会相互联系。如果在 `PendingReview` 和 `Published` 之间增加另一个状态，比如 `Scheduled`，则不得不修改 `PendingReview` 中的代码来转移到 `Scheduled`。如果 `PendingReview` 无需因为新增的状态而改变就更好了，不过这意味着切换到另一种设计模式。

另一个缺点是我们会发现一些重复的逻辑。为了消除他们，可以尝试为 `State` trait 中返回 `self` 的 `request_review` 和 `approve` 方法增加默认实现，不过这会违反对象安全性，因为 trait 不知道 `self` 具体是什么。我们希望能够将 `State` 作为一个 trait 对象，所以需要其方法是对象安全的。

另一个重复是 `Post` 中 `request_review` 和 `approve` 这两个类似的实现。他们都委托调用了 `state` 字段中 `Option` 值的同一方法，并在结果中为 `state` 字段设置了新值。如果 `Post` 中的很多方法都遵循这个模式，我们可能会考虑定义一个宏来消除重复（查看第 19 章的 [“宏”](https://rustwiki.org/zh-CN/book/ch19-06-macros.html#macros) 部分）。

完全按照面向对象语言的定义实现这个模式并没有尽可能地利用 Rust 的优势。让我们看看一些代码中可以做出的修改，来将无效的状态和状态转移变为编译时错误。

#### 4.6.1 将状态和行为编码为类型

我们将展示如何稍微反思状态模式来进行一系列不同的权衡取舍。不同于完全封装状态和状态转移使得外部代码对其毫不知情，我们将状态编码进不同的类型。如此，Rust 的类型检查就会将任何在只能使用发布博文的地方使用草案博文的尝试变为编译时错误。

让我们考虑一下示例 17-11 中 `main` 的第一部分：

文件名: src/main.rs

```rust
fn main() {
    let mut post = Post::new();

    post.add_text("I ate a salad for lunch today");
    assert_eq!("", post.content());
}
```

我们仍然希望能够使用 `Post::new` 创建一个新的草案博文，并能够增加博文的内容。不过不同于存在一个草案博文时返回空字符串的 `content` 方法，我们将使草案博文完全没有 `content` 方法。这样如果尝试获取草案博文的内容，将会得到一个方法不存在的编译错误。这使得我们不可能在生产环境意外显示出草案博文的内容，因为这样的代码甚至就不能编译。示例 17-19 展示了 `Post` 结构体、`DraftPost` 结构体以及各自的方法的定义：

文件名: src/lib.rs

```rust
pub struct Post {
    content: String,
}

pub struct DraftPost {
    content: String,
}

impl Post {
    pub fn new() -> DraftPost {
        DraftPost {
            content: String::new(),
        }
    }

    pub fn content(&self) -> &str {
        &self.content
    }
}

impl DraftPost {
    pub fn add_text(&mut self, text: &str) {
        self.content.push_str(text);
    }
}
```

示例 17-19: 带有 `content` 方法的 `Post` 和没有 `content` 方法的 `DraftPost`

`Post` 和 `DraftPost` 结构体都有一个私有的 `content` 字段来储存博文的文本。这些结构体不再有 `state` 字段因为我们将状态编码改为结构体类型。`Post` 将代表发布的博文，它有一个返回 `content` 的 `content` 方法。

仍然有一个 `Post::new` 函数，不过不同于返回 `Post` 实例，它返回 `DraftPost` 的实例。现在不可能创建一个 `Post` 实例，因为 `content` 是私有的同时没有任何函数返回 `Post`。

`DraftPost` 上定义了一个 `add_text` 方法，这样就可以像之前那样向 `content` 增加文本，不过注意 `DraftPost` 并没有定义 `content` 方法！如此现在程序确保了所有博文都从草案开始，同时草案博文没有任何可供展示的内容。任何绕过这些限制的尝试都会产生编译错误。

#### 4.6.2 实现状态转移为不同类型的转换

那么如何得到发布的博文呢？我们希望强制执行的规则是草案博文在可以发布之前必须被审核通过。等待审核状态的博文应该仍然不会显示任何内容。让我们通过增加另一个结构体 `PendingReviewPost` 来实现这个限制，在 `DraftPost` 上定义 `request_review` 方法来返回 `PendingReviewPost`，并在 `PendingReviewPost` 上定义 `approve` 方法来返回 `Post`，如示例 17-20 所示：

文件名: src/lib.rs

```rust
impl DraftPost {
    // --snip--

    pub fn request_review(self) -> PendingReviewPost {
        PendingReviewPost {
            content: self.content,
        }
    }
}

pub struct PendingReviewPost {
    content: String,
}

impl PendingReviewPost {
    pub fn approve(self) -> Post {
        Post {
            content: self.content,
        }
    }
}
```

列表 17-20: `PendingReviewPost` 通过调用 `DraftPost` 的 `request_review` 创建，`approve` 方法将 `PendingReviewPost` 变为发布的 `Post`

`request_review` 和 `approve` 方法获取 `self` 的所有权，因此会消费 `DraftPost` 和 `PendingReviewPost` 实例，并分别转换为 `PendingReviewPost` 和发布的 `Post`。这样在调用 `request_review` 之后就不会遗留任何 `DraftPost` 实例，后者同理。`PendingReviewPost` 并没有定义 `content` 方法，所以尝试读取其内容会导致编译错误，`DraftPost` 同理。因为唯一得到定义了 `content` 方法的 `Post` 实例的途径是调用 `PendingReviewPost` 的 `approve` 方法，而得到 `PendingReviewPost` 的唯一办法是调用 `DraftPost` 的 `request_review` 方法，现在我们就将发博文的工作流编码进了类型系统。

这也意味着不得不对 `main` 做出一些小的修改。因为 `request_review` 和 `approve` 返回新实例而不是修改被调用的结构体，所以我们需要增加更多的 `let post = `覆盖赋值来保存返回的实例。也不再能断言草案和等待审核的博文的内容为空字符串了，我们也不再需要他们：不能编译尝试使用这些状态下博文内容的代码。更新后的 `main` 的代码如示例 17-21 所示：

文件名: src/main.rs

```rust
use blog::Post;

fn main() {
    let mut post = Post::new();

    post.add_text("I ate a salad for lunch today");

    let post = post.request_review();

    let post = post.approve();

    assert_eq!("I ate a salad for lunch today", post.content());
}
```

示例 17-21: `main` 中使用新的博文工作流实现的修改

不得不修改 `main` 来重新赋值 `post` 使得这个实现不再完全遵守面向对象的状态模式：状态间的转换不再完全封装在 `Post` 实现中。然而，得益于类型系统和编译时类型检查，我们得到了的是无效状态是不可能的！这确保了某些特定的 bug，比如显示未发布博文的内容，将在部署到生产环境之前被发现。

尝试为示例 17-20 之后的 `blog` crate 实现这一部分开始所建议的增加额外需求的任务来体会使用这个版本的代码是何感觉。注意在这个设计中一些需求可能已经完成了。

即便 Rust 能够实现面向对象设计模式，也有其他像将状态编码进类型这样的模式存在。这些模式有着不同的权衡取舍。虽然你可能非常熟悉面向对象模式，重新思考这些问题来利用 Rust 提供的像在编译时避免一些 bug 这样有益功能。在 Rust 中面向对象模式并不总是最好的解决方案，因为 Rust 拥有像所有权这样的面向对象语言所没有的功能。

## 5. 总结

阅读本章后，不管你是否认为 Rust 是一个面向对象语言，现在你都见识了 trait 对象是一个 Rust 中获取部分面向对象功能的方法。动态分发可以通过牺牲少量运行时性能来为你的代码提供一些灵活性。这些灵活性可以用来实现有助于代码可维护性的面向对象模式。Rust 也有像所有权这样不同于面向对象语言的功能。面向对象模式并不总是利用 Rust 优势的最好方式，但也是可用的选项。

接下来，让我们看看另一个提供了多样灵活性的 Rust 功能：模式。贯穿全书的模式, 我们已经和它们打过照面了，但并没有见识过它们的全部本领。让我们开始探索吧！
