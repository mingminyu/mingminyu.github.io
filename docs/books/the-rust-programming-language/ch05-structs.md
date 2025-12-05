# 第五章：使用结构体组织相关联的数据

*struct*，或者 *structure*，是一个自定义数据类型，允许你命名和包装多个相关的值，从而形成一个有意义的组合。如果你熟悉一门面向对象语言，*struct* 就像对象中的数据属性。在本章中，我们会对元组和结构体进行比较和对比，以及演示如何定义和实例化结构体，并讨论如何定义关联函数，特别是被称为**方法**的那种关联函数，以指定与结构体类型相关的行为。你可以在程序中基于结构体和枚举（*enum*）（在第 6 章介绍）创建新类型，以充分利用 Rust 的编译时类型检查。

## 1. 定义并实例化结构体

结构体和我们在[“元组类型”](https://rustwiki.org/zh-CN/book/ch03-02-data-types.html#元组类型)章节论过的元组类似。和元组一样，结构体的每一部分可以是不同类型。但不同于元组，结构体需要命名各部分数据以便能清楚的表明其值的意义。由于有了这些名字，结构体比元组更灵活：不需要依赖顺序来指定或访问实例中的值。

定义结构体，需要使用 `struct` 关键字并为整个结构体提供一个名字。结构体的名字需要描述它所组合的数据的意义。接着，在大括号中，定义每一部分数据的名字和类型，我们称为 **字段**（*field*）。例如，示例 5-1 展示了一个存储用户账号信息的结构体：

```rust linenums="1" title="示例5-1: User结构体定义"
struct User {
  active: bool,
  username: String,
  email: String,
  sign_in_count: u64,
}
```

要在定义结构体后使用它，我们可以通过为每个字段指定具体值的方式来创建该结构体的**实例**。创建一个实例需要以结构体的名字开头，接着在大括号中使用 `key: value` 键-值对的形式提供字段，其中 key 是字段的名字，value 是需要存储在字段中的数据值。实例中字段的顺序不需要和它们在结构体中声明的顺序一致。换句话说，结构体的定义就像一个类型的通用模板，而实例则会在这个模板中放入特定数据来创建这个类型的值。例如，可以像示例 5-2 这样来声明一个特定的用户：

```rust linenums="1" title="示例5-2: 创建User结构体的实例"
fn main() {
  let user1 = User {
      email: String::from("someone@example.com"),
      username: String::from("someusername123"),
      active: true,
      sign_in_count: 1,
  };
}
```

为了从结构体中获取某个特定的值，可以使用点号。如果我们只想要用户的邮箱地址，可以用 `user1.email`。要更改结构体中的值，如果结构体的实例是可变的，我们可以使用点号并为对应的字段赋值。示例 5-3 展示了如何改变一个可变的 `User` 实例 `email` 字段的值：

```rust linenums="1" title="示例5-3: 改变User结构体的实例" hl_lines="8"
fn main() {
  let mut user1 = User {
      email: String::from("someone@example.com"),
      username: String::from("someusername123"),
      active: true,
      sign_in_count: 1,
  };
  user1.email = String::from("anotheremail@example.com");
}
```

注意整个实例必须是可变的；Rust 并不允许只将某个字段标记为可变。另外需要注意同其他任何表达式一样，我们可以在函数体的最后一个表达式中构造一个结构体的新实例，来隐式地返回这个实例。

示例5-4 显示了一个 `build_user` 函数，它返回一个带有给定的 email 和用户名的 `User` 结构体实例。`active` 字段的值为 `true`，并且 `sign_in_count` 的值为 `1`。

```rust linenums="1" title="示例5-4: 获取email和用户名并返回User实例"
fn build_user(email: String, username: String) -> User {
    User {
        email: email,
        username: username,
        active: true,
        sign_in_count: 1,
    }
}
```

为函数参数起与结构体字段相同的名字是可以理解的，但是不得不重复 `email` 和 `username` 字段名称与变量有些啰嗦。如果结构体有更多字段，重复每个名称就更加烦人了。幸运的是，有一个方便的简写语法！

### 1.1 变量与字段同名时的字段初始化简写语法

上述示例中的 **参数名与字段名都完全相同**，我们可以使用 **字段初始化简写语法**（*field init shorthand*）来重写 `build_user`，这样其行为与之前完全相同，不过无需重复 `email` 和 `username` 了，如示例 5-5 所示。

```rust linenums="1" title="示例5-5: 使用字段初始化简写语法" hl_lines="3-4"
fn build_user(email: String, username: String) -> User {
    User {
        email,
        username,
        active: true,
        sign_in_count: 1,
    }
}
```

这里我们创建了一个新的 `User` 结构体实例，它有一个叫做 `email` 的字段。我们想要将 `email` 字段的值设置为 `build_user` 函数 `email` 参数的值。因为 `email` 字段与 `email` 参数有着相同的名称，则只需编写 `email` 而不是 `email: email`。

### 1.2 使用结构体更新语法从其他实例创建实例

使用旧实例的大部分值但改变其部分值来创建一个新的结构体实例通常很有用。这可以通过 **结构体更新语法**（*struct update syntax*）实现。

首先，示例 5-6 展示了不使用更新语法时，如何在 `user2` 中创建一个新 `User` 实例。我们为 `email` 设置了新的值，其他值则使用了示例 5-2 中创建的 `user1` 中的同名值：

```rust linenums="1" title="示例5-6: 使用 user1 中的一个值创建一个新的 User 实例" hl_lines="5-6 8"
fn main() {
    // --snip--

    let user2 = User {
        active: user1.active,
        username: user1.username,
        email: String::from("another@example.com"),
        sign_in_count: user1.sign_in_count,
    };
}
```

使用结构体更新语法，我们可以通过更少的代码来达到相同的效果，如示例 5-7 所示。`..` 语法指定了剩余未显式设置值的字段应有与给定实例对应字段相同的值。

```rust linenums="1" title="示例5-7: 使用结构体更新语法" hl_lines="5-6"
fn main() {
    // --snip--

    let user2 = User {
        email: String::from("another@example.com"),
        ..user1
    };
}
```

示例 5-7：使用结构体更新语法为一个 `User` 实例设置一个新的 `email` 值，不过其余值来自 `user1` 变量中实例的字段

示例 5-7 中的代码还创建了一个新实例 `user2`，该实例具有不同的 `email` 值，但 `username`、 `active` 和 `sign_in_count` 字段的值与 `user1` 相同。`..user1` 必须放在最后，以指定其余的字段应从 `user1` 的相应字段中获取其值，但我们可以选择以任何顺序为任意字段指定值，而不用考虑结构体定义中字段的顺序。

请注意，结构更新语法就像带有 `=` 的赋值，因为它移动了数据，就像我们在[“变量与数据交互的方式（一）：移动”](https://rustwiki.org/zh-CN/book/ch04-01-what-is-ownership.html#变量与数据交互的方式一移动)部分讲到的一样。在这个例子中，我们在创建 `user2` 后不能再使用 `user1`，因为 `user1` 的 `username` 字段中的 `String` 被移到 `user2` 中。如果我们给 `user2` 的 `email` 和 `username` 都赋予新的 `String` 值，从而只使用 `user1` 的 `active` 和 `sign_in_count` 值，那么 `user1` 在创建 `user2` 后仍然有效。`active` 和 `sign_in_count` 的类型是实现 `Copy` trait 的类型，所以我们在[“变量与数据交互的方式（二）：克隆”](https://rustwiki.org/zh-CN/book/ch04-01-what-is-ownership.html#变量与数据交互的方式二克隆)部分讨论的行为同样适用。

### 1.3 使用没有命名字段的元组结构体来创建不同的类型

也可以定义与元组（在第 3 章讨论过）类似的结构体，称为**元组结构体**（*tuple struct*）。元组结构体有着结构体名称提供的含义，但没有具体的字段名，只有字段的类型。当你想给整个元组取一个名字，并使元组成为与其他元组不同的类型时，元组结构体是很有用的，这时像常规结构体那样为每个字段命名就显得多余和形式化了。

要定义元组结构体，以 `struct` 关键字和结构体名开头并后跟元组中的类型。例如，下面是两个分别叫做 `Color` 和 `Point` 元组结构体的定义和用法：

```rust linenums="1"
struct Color(i32, i32, i32);
struct Point(i32, i32, i32);

fn main() {
    let black = Color(0, 0, 0);
    let origin = Point(0, 0, 0);
}
```

注意 `black` 和 `origin` 值的类型不同，因为它们是不同的元组结构体的实例。你定义的每一个结构体有其自己的类型，即使结构体中的字段有着相同的类型。例如，一个获取 `Color` 类型参数的函数不能接受 `Point` 作为参数，即便这两个类型都由三个 `i32` 值组成。在其他方面，元组结构体实例类似于元组：可以将其解构为单独的部分，也可以使用 `.` 后跟索引来访问单独的值，等等。

### 1.4 没有任何字段的类单元结构体

我们也可以定义一个没有任何字段的结构体！它们被称为 **类单元结构体**（*unit-like structs*），因为它们类似于 `()`，即[“元组类型”](https://rustwiki.org/zh-CN/book/ch03-02-data-types.html#元组类型)一节中提到的 unit 类型。类单元结构体常常在你想要在某个类型上实现 trait 但不需要在类型中存储数据的时候发挥作用。我们将在第 10 章介绍 trait。下面是一个声明和实例化一个名为 `AlwaysEqual` 的 unit 结构的例子。

```rust linenums="1"
struct AlwaysEqual;

fn main() {
    let subject = AlwaysEqual;
}
```

要定义 `AlwaysEqual`，我们使用 `struct` 关键字，我们想要的名称，然后是一个分号。不需要花括号或圆括号！然后，我们可以以类似的方式获得 `AlwaysEqual` 的实例变量 `subject`：使用我们定义的名称，不需要任何花括号或圆括号。想象一下，我们将实现这个类型的行为，即每个实例始终等于每一个其他类型的实例，也许是为了获得一个已知的结果以便进行测试。我们不需要任何数据来实现这种行为，你将在第十章中，看到如何定义特性并在任何类型上实现它们，包括类单元结构体。

??? note "结构体数据的所有权"

    在示例 5-1 中的 `User` 结构体的定义中，我们使用了自身拥有所有权的 `String` 类型而不是 `&str` 字符串 slice 类型。这是一个有意而为之的选择，因为我们想要这个结构体拥有它所有的数据，为此只要整个结构体是有效的话其数据也是有效的。
    
    可以使结构体存储被其他对象拥有的数据的引用，不过这么做的话需要用上**生命周期**（*lifetime*），这是一个第 10 章会讨论的 Rust 功能。生命周期确保结构体引用的数据有效性跟结构体本身保持一致。如果你尝试在结构体中存储一个引用而不指定生命周期将是无效的，比如这样：

    ```rust title="src/main.rs" linenums="1"
    struct User {
        active: bool,
        username: &str,
        email: &str,
        sign_in_count: u64,
    }

    fn main() {
        let user1 = User {
            email: "someone@example.com",
            username: "someusername123",
            active: true,
            sign_in_count: 1,
        };
    }
    ```

    编译器会抱怨它需要生命周期标识符：
    
    ```console
    $ cargo run
    Compiling structs v0.1.0 (file:///projects/structs)
    error[E0106]: missing lifetime specifier
    --> src/main.rs:3:15
    |
    3 |     username: &str,
    |               ^ expected named lifetime parameter
    |
    help: consider introducing a named lifetime parameter
    |
    1 ~ struct User<'a> {
    2 |     active: bool,
    3 ~     username: &'a str,
    |

    error[E0106]: missing lifetime specifier
    --> src/main.rs:4:12
    |
    4 |     email: &str,
    |            ^ expected named lifetime parameter
    |
    help: consider introducing a named lifetime parameter
    |
    1 ~ struct User<'a> {
    2 |     active: bool,
    3 |     username: &str,
    4 ~     email: &'a str,
    |

    For more information about this error, try `rustc --explain E0106`.
    error: could not compile `structs` due to 2 previous errors
    ```

    第 10 章会讲到如何修复这个问题以便在结构体中存储引用，不过现在，我们会使用像 `String` 这类拥有所有权的类型来替代 `&str` 这样的引用以修正这个错误。

## 2. 一个使用结构体的示例程序

为了理解何时会需要使用结构体，让我们编写一个计算长方形面积的程序。我们会从单独的变量开始，接着重构程序直到使用结构体替代他们为止。

使用 Cargo 新建一个叫做 *rectangles* 的二进制程序，它获取以像素为单位的长方形的宽度和高度，并计算出长方形的面积。示例 5-8 显示了位于项目的 *src/main.rs* 中的小程序，它刚刚好实现此功能：

```rust linenums="1" title="示例5-8：通过分别指定长方形的宽和高的变量来计算长方形面积"
fn main() {
    let width1 = 30;
    let height1 = 50;

    println!(
        "The area of the rectangle is {} square pixels.",
        area(width1, height1)
    );
}

fn area(width: u32, height: u32) -> u32 {
    width * height
}
```

现在使用 `cargo run` 运行程序：

```console
$ cargo run
   Compiling rectangles v0.1.0 (file:///projects/rectangles)
    Finished dev [unoptimized + debuginfo] target(s) in 0.42s
     Running `target/debug/rectangles`
The area of the rectangle is 1500 square pixels.
```

虽然示例 5-8 可以运行，并在调用 `area` 函数时传入每个维度来计算出长方形的面积，不过我们可以做的更好。宽度和高度是相关联的，因为他们在一起才能定义一个长方形。

这些代码的问题突显在 `area` 的签名上：

```rust
fn area(width: u32, height: u32) -> u32 {
```

函数 `area` 本应该计算一个长方形的面积，不过函数却有两个参数。这两个参数是相关联的，不过程序本身却没有表现出这一点。将长度和宽度组合在一起将更易懂也更易处理。第 3 章的[“元组类型”](https://rustwiki.org/zh-CN/book/ch03-02-data-types.html#元组类型)章节已经讨论过了一种可行的方法：元组。

### 2.1 使用元组重构

示例 5-9 展示了使用元组的另一个程序版本。

```rust linenums="1" title="示例5-9：使用元组来指定长方形的宽高"
fn main() {
    let rect1 = (30, 50);

    println!(
        "The area of the rectangle is {} square pixels.",
        area(rect1)
    );
}

fn area(dimensions: (u32, u32)) -> u32 {
    dimensions.0 * dimensions.1
}
```

在某种程度上说，这个程序更好一点了。元组帮助我们增加了一些结构性，并且现在只需传一个参数。不过在另一方面，这个版本却有一点不明确了：元组并没有给出元素的名称，所以我们不得不使用索引来获取元组的每一部分，这导致计算变得更令人费解了。

在计算面积时将宽和高弄混倒无关紧要，不过当在屏幕上绘制长方形时就有问题了！我们必须牢记 `width` 的元组索引是 `0`，`height` 的元组索引是 `1`。如果其他人要使用这些代码，他们必须要搞清楚这一点，并也要牢记于心。我们没有在代码中表达数据的意义，所以很容易因为忘记或者混淆这些值而造成错误。

### 2.2 使用结构体重构：赋予更多意义

我们使用结构体为数据命名来为其赋予意义。我们可以将我们正在使用的元组转换成一个有整体名称而且每个部分也有对应名字的数据类型，如示例 5-10 所示：

```rust linenums="1" title="示例5-10：使用结构体来指定长方形的宽高"
struct Rectangle {
    width: u32,
    height: u32,
}

fn main() {
    let rect1 = Rectangle {
        width: 30,
        height: 50,
    };

    println!(
        "The area of the rectangle is {} square pixels.",
        area(&rect1)
    );
}

fn area(rectangle: &Rectangle) -> u32 {
    rectangle.width * rectangle.height
}
```

这里我们定义了一个结构体并称其为 `Rectangle`。在大括号中定义了字段 `width` 和 `height`，类型都是 `u32`。接着在 `main` 中，我们创建了一个具体的 `Rectangle` 实例，它的宽是 30，高是 50。

函数 `area` 现在被定义为接收一个名叫 `rectangle` 的参数，其类型是一个结构体 `Rectangle` 实例的不可变借用。第 4 章讲到过，我们希望借用结构体而不是获取它的所有权，这样 `main` 函数就可以保持 `rect1` 的所有权并继续使用它，所以这就是为什么在函数签名和调用的地方会有 `&`。

`area` 函数访问 `Rectangle` 实例的 `width` 和 `height` 字段。`area` 的函数签名现在明确的阐述了我们的意图：使用 `Rectangle` 的 `width` 和 `height` 字段，计算 `Rectangle` 的面积。这表明宽高是相互联系的，并为这些值提供了描述性的名称而不是使用元组的索引值 `0` 和 `1` 。结构体胜在更清晰明了。

### 2.3 通过派生 trait 增加实用功能

如果能够在调试程序时打印出 `Rectangle` 实例来查看其所有字段的值就更好了。示例 5-11 像前面章节那样尝试使用 [`println!` 宏](https://rustwiki.org/zh-CN/std/macro.println.html)。但这并不行。

```rust linenums="1" title="示例5-11：尝试打印出 Rectangle 实例"
struct Rectangle {
    width: u32,
    height: u32,
}

fn main() {
    let rect1 = Rectangle {
        width: 30,
        height: 50,
    };

    println!("rect1 is {}", rect1);
}
```

当我们运行这个代码时，会出现带有如下核心信息的错误：

```console
error[E0277]: `Rectangle` doesn't implement `std::fmt::Display`
```

`println!` 宏能处理很多类型的格式，不过，`{}` 默认告诉 `println!` 使用被称为 `Display` 的格式：意在提供给直接终端用户查看的输出。目前为止见过的基本类型都默认实现了 `Display`，因为它就是向用户展示 `1` 或其他任何基本类型的唯一方式。不过对于结构体，`println!` 应该用来输出的格式是不明确的，因为这有更多显示的可能性：是否需要逗号？需要打印出大括号吗？所有字段都应该显示吗？由于这种不确定性，Rust 不会尝试猜测我们的意图，所以结构体并没有提供一个 `Display` 实现。

但是如果我们继续阅读错误，将会发现这个有帮助的信息：

```console
   = help: the trait `std::fmt::Display` is not implemented for `Rectangle`
   = note: in format strings you may be able to use `{:?}` (or {:#?} for pretty-print) instead
```

让我们来试试！现在 `println!` 宏调用看起来像 `println!("rect1 is {:?}", rect1);` 这样。在 `{}` 中加入 `:?` 指示符告诉 `println!` 我们想要使用叫做 `Debug` 的输出格式。`Debug` 是一个 trait，它允许我们以一种对开发者有帮助的方式打印结构体，以便当我们调试代码时能看到它的值。

这样调整后再次运行程序。见鬼了！仍然能看到一个错误：

```text
error[E0277]: `Rectangle` doesn't implement `Debug`
```

不过编译器又一次给出了一个有帮助的信息：

```text
= help: the trait `Debug` is not implemented for `Rectangle`
= note: add `#[derive(Debug)]` to `Rectangle` or manually `impl Debug for Rectangle`
```

Rust **确实**包含了打印出调试信息的功能，不过我们必须为结构体显式选择这个功能。为此，在结构体定义之前加上外部属性 `#[derive(Debug)]`，如示例 5-12 所示：


```rust linenums="1" title="示例5-12：使用 Debug trait 来打印出 Rectangle 实例值"
#[derive(Debug)]
struct Rectangle {
    width: u32,
    height: u32,
}

fn main() {
    let rect1 = Rectangle {
        width: 30,
        height: 50,
    };

    println!("rect1 is {:?}", rect1);
}
```

现在我们再运行这个程序时，就不会有任何错误，并会出现如下输出：

```console
$ cargo run
   Compiling rectangles v0.1.0 (file:///projects/rectangles)
    Finished dev [unoptimized + debuginfo] target(s) in 0.48s
     Running `target/debug/rectangles`
rect1 is Rectangle { width: 30, height: 50 }
```

好极了！这并不是最漂亮的输出，不过它显示这个实例的所有字段，毫无疑问这对调试有帮助。当我们有一个更大的结构体时，能有更易读一点的输出就好了，为此可以使用 `{:#?}` 替换 `println!` 字符串中的 `{:?}`。如果在这个例子中使用了 `{:#?}` 风格的话，输出会看起来像这样：

```console
$ cargo run
   Compiling rectangles v0.1.0 (file:///projects/rectangles)
    Finished dev [unoptimized + debuginfo] target(s) in 0.48s
     Running `target/debug/rectangles`
rect1 is Rectangle {
    width: 30,
    height: 50,
}
```

另一种使用 `Debug` 格式打印数值的方法是使用 [`dbg!` 宏](https://rustwiki.org/zh-CN/std/macro.dbg.html)。`dbg!` 宏接收一个表达式的所有权，打印出代码中调用 `dbg!` 宏时所在的文件和行号，以及该表达式的结果值，并返回该值的所有权。

!!! tip "备注"

    与 `println!` 宏打印到标准输出控制流（`stdout`）不同，调用 `dbg!` 宏会打印到标准错误控制流（`stderr`）。我们将在[第 12 章 “将错误信息输出到标准错误而不是标准输出” 一节](https://rustwiki.org/zh-CN/book/ch12-06-writing-to-stderr-instead-of-stdout.html)中更多地讨论 `stderr` 和 `stdout`。

下面是一个例子，我们对分配给 `width` 字段的值以及 `rect1` 中整个结构的值感兴趣：

```rust linenums="1"
#[derive(Debug)]
struct Rectangle {
    width: u32,
    height: u32,
}

fn main() {
    let scale = 2;
    let rect1 = Rectangle {
        width: dbg!(30 * scale),
        height: 50,
    };

    dbg!(&rect1);
}
```

我们可以把 `dbg!` 放在表达式 `30 * scale` 周围，因为 `dbg!` 返回表达式的值的所有权，所以 `width` 字段将获得相同的值，就像我们在那里没有 `dbg!` 调用一样。我们不希望 `dbg!` 拥有 `rect1` 的所有权，所以我们在下一次调用 `dbg!` 时传入一个引用。下面是这个例子的输出结果：

```console
$ cargo run
   Compiling rectangles v0.1.0 (file:///projects/rectangles)
    Finished dev [unoptimized + debuginfo] target(s) in 0.61s
     Running `target/debug/rectangles`
[src/main.rs:10] 30 * scale = 60
[src/main.rs:14] &rect1 = Rectangle {
    width: 60,
    height: 50,
}
```

我们可以看到第一点输出来自 *src/main.rs* 第 10 行，我们正在调试表达式 `30 * scale`，其结果值是60（为整数实现的 `Debug` 格式化是只打印它们的值）。在 *src/main.rs* 第 14 行的 `dbg!` 调用输出 `&rect1` 的值，即 `Rectangle` 结构。这个输出使用了更为易读的 `Debug` 格式。当你试图弄清楚你的代码在做什么时，`dbg!` 宏可能真的很有帮助!

除了 `Debug` trait，Rust 还为我们提供了很多可以通过 `derive` 属性来使用的 trait，他们可以为我们的自定义类型增加实用的行为。[附录 C](https://rustwiki.org/zh-CN/book/appendix-03-derivable-traits.html) 中列出了这些 trait 和行为。第十章会介绍如何通过自定义行为来实现这些 trait，同时还有如何创建你自己的 trait。除了 `derive` 之外，还有很多属性；更多信息请参见 [《Rust 参考手册》](https://rustwiki.org/zh-CN/reference/attributes.html) 的 Attributes 部分。

我们的 `area` 函数非常特殊，它只计算长方形的面积。如果这个行为与 `Rectangle` 结构体再结合得更紧密一些就更好了，因为它不能用于其他类型。现在让我们看看如何继续重构这些代码，来将 `area` 函数协调进 `Rectangle` 类型定义的 `area` **方法**中。

## 3. 方法语法

**方法** 与函数类似：它们使用 `fn` 关键字和名称声明，可以拥有参数和返回值，同时包含在某处调用该方法时会执行的代码。不过方法与函数是不同的，因为它们在结构体的上下文中被定义（或者是枚举或 trait 对象的上下文，将分别在第 6 章和第 17 章讲解），并且它们第一个参数总是 `self`，它代表调用该方法的结构体实例。

### 3.1 定义方法

让我们把前面实现的获取一个 `Rectangle` 实例作为参数的 `area` 函数，改写成一个定义于 `Rectangle` 结构体上的 `area` 方法，如示例 5-13 所示：

```rust linenums="1" title="示例5-13：在 Rectangle 上定义 area 方法"
#[derive(Debug)]
struct Rectangle {
    width: u32,
    height: u32,
}

impl Rectangle {
    fn area(&self) -> u32 {
        self.width * self.height
    }
}

fn main() {
    let rect1 = Rectangle {
        width: 30,
        height: 50,
    };

    println!(
        "The area of the rectangle is {} square pixels.",
        rect1.area()
    );
}
```

为了使函数定义于 `Rectangle` 的上下文中，我们开始了一个 `impl` 块（`impl` 是 *implementation* 的缩写），这个 `impl` 块中的所有内容都将与 `Rectangle` 类型相关联。接着将 `area` 函数移动到 `impl` 大括号中，并将签名中的第一个（在这里也是唯一一个）参数和函数体中其他地方的对应参数改成 `self`。然后在 `main` 中将我们先前调用 `area` 方法并传递 `rect1` 作为参数的地方，改成使用**方法语法**（*method syntax*）在 `Rectangle` 实例上调用 `area` 方法。方法语法获取一个实例并加上一个点号，后跟方法名、圆括号以及任何参数。

在 `area` 的签名中，使用 `&self` 来替代 `rectangle: &Rectangle`，`&self` 实际上是 `self: &Self` 的缩写。在一个 `impl` 块中，`Self` 类型是 `impl` 块的类型的别名。方法的第一个参数必须有一个名为 `self` 的`Self` 类型的参数，所以 Rust 让你在第一个参数位置上只用 `self` 这个名字来缩写。注意，我们仍然需要在 `self` 前面使用 `&` 来表示这个方法借用了 `Self` 实例，就像我们在 `rectangle: &Rectangle` 中做的那样。方法可以选择获得 `self` 的所有权，或者像我们这里一样不可变地借用 `self`，或者可变地借用 `self`，就跟其他参数一样。

这里选择 `&self` 的理由跟在函数版本中使用 `&Rectangle` 是相同的：我们并不想获取所有权，只希望能够读取结构体中的数据，而不是写入。如果想要在方法中改变调用方法的实例，需要将第一个参数改为 `&mut self`。通过仅仅使用 `self` 作为第一个参数来使方法获取实例的所有权是很少见的；这种技术通常用在当方法将 `self` 转换成别的实例的时候，这时我们想要防止调用者在转换之后使用原始的实例。

使用方法替代函数，除了可使用方法语法和不需要在每个函数签名中重复 `self` 的类型之外，其主要好处在于组织性。我们将某个类型实例能做的所有事情都一起放入 `impl` 块中，而不是让将来的用户在我们的库中到处寻找 `Rectangle` 的功能。

请注意，我们可以选择将方法的名称与结构中的一个字段相同。例如，我们可以在 `Rectangle` 上定义一个方法，并命名为 `width`：

```rust linenums="1"
impl Rectangle {
    fn width(&self) -> bool {
        self.width > 0
    }
}

fn main() {
    let rect1 = Rectangle {
        width: 30,
        height: 50,
    };

    if rect1.width() {
        println!("The rectangle has a nonzero width; it is {}", rect1.width);
    }
}
```

在这里，我们选择让 `width` 方法的行为是如果实例的 `width` 字段的值大于 0，返回 `true`。如果该值为 0，则返回 `false`：我们可以在同名的方法中使用一个字段来达到任何目的。在 `main` 中，当我们在 `rect1.width` 后面加上括号时。Rust 知道我们指的是方法 `width`。当我们不使用圆括号时，Rust 知道我们指的是字段 `width`。

通常，但并不总是如此，与字段同名的方法将被定义为只返回字段中的值，而不做其他事情。这样的方法被称为 *getters*，Rust 并不像其他一些语言那样为结构字段自动实现它们。Getters 很有用，因为你可以把字段变成私有的，但方法是公共的，这样就可以把对字段的只读访问作为该类型公共 API 的一部分。我们将在第七章中讨论什么是公有和私有，以及如何将一个字段或方法指定为公有或私有。

??? note "`->` 运算符到哪去了？"

    在 C/C++ 语言中，有两个不同的运算符来调用方法：`.` 直接在对象上调用方法，而 `->` 在一个对象的指针上调用方法，这时需要先解引用（dereference）指针。换句话说，如果 `object` 是一个指针，那么 `object->something()` 就像 `(*object).something()` 一样。

    Rust 并没有一个与 `->` 等效的运算符；相反，Rust 有一个叫 **自动引用和解引用**（*automatic referencing d dereferencing*）的功能。方法调用是 Rust 中少数几个拥有这种行为的地方。
    它是这样工作的：当使用 `object.something()` 调用方法时，Rust 会自动为 `object` 添加 `&`、`&mut` 或 `*`便使 `object` 与方法签名匹配。也就是说，这些代码是等价的：
    ```rust
    p1.distance(&p2);
    (&p1).distance(&p2);
    ```
    第一行看起来简洁的多。这种自动引用的行为之所以有效，是因为方法有一个明确的接收者———— `self` 的类型。在给出接收者和方法名的前提下，Rust 可以明确地计算出方法是仅仅读取（`&self`），做出修改（`&mut self`）或者是获取所有权（`self`）。事实上，Rust 对方法接收者的隐式借用让所有权在实践中更友好。

### 3.2 带有更多参数的方法

让我们通过实现 `Rectangle` 结构体上的另一方法来练习使用方法。这回，我们让一个 `Rectangle` 的实例获取另一个 `Rectangle` 实例，如果 `self` 能完全包含第二个长方形则返回 `true`；否则返回 `false`。一旦定义了 `can_hold` 方法，就可以编写示例 5-14 中的代码。

```rust linenums="1" title="示例5-15：在 Rectangle 上定义 can_hold 方法"
fn main() {
    let rect1 = Rectangle {
        width: 30,
        height: 50,
    };
    let rect2 = Rectangle {
        width: 10,
        height: 40,
    };
    let rect3 = Rectangle {
        width: 60,
        height: 45,
    };

    println!("Can rect1 hold rect2? {}", rect1.can_hold(&rect2));
    println!("Can rect1 hold rect3? {}", rect1.can_hold(&rect3));
}
```

同时我们希望看到如下输出，因为 `rect2` 的两个维度都小于 `rect1`，而 `rect3` 比 `rect1` 要宽：

```text
Can rect1 hold rect2? true
Can rect1 hold rect3? false
```

因为我们想定义一个方法，所以它应该位于 `impl Rectangle` 块中。方法名是 `can_hold`，并且它会获取另一个 `Rectangle` 的不可变借用作为参数。通过观察调用方法的代码可以看出参数是什么类型的：`rect1.can_hold(&rect2)` 传入了 `&rect2`，它是一个 `Rectangle` 的实例 `rect2` 的不可变借用。这是可以理解的，因为我们只需要读取 `rect2`（而不是写入，这意味着我们需要一个不可变借用），而且希望 `main` 保持 `rect2` 的所有权，这样就可以在调用这个方法后继续使用它。`can_hold` 的返回值是一个布尔值，其实现会分别检查 `self` 的宽高是否都大于另一个 `Rectangle`。让我们在示例 5-13 的 `impl` 块中增加这个新的 `can_hold` 方法，如示例 5-15 所示：

```rust linenums="1" title="示例5-16：在 Rectangle 上定义 can_hold 方法，它获取另一个 Rectangle 实例作为参数"
impl Rectangle {
    fn area(&self) -> u32 {
        self.width * self.height
    }

    fn can_hold(&self, other: &Rectangle) -> bool {
        self.width > other.width && self.height > other.height
    }
}
```

如果结合示例 5-14 的 `main` 函数来运行，就会看到期望的输出。在方法签名中，可以在 `self` 后增加多个参数，而且这些参数就像函数中的参数一样工作。

### 3.3 关联函数

所有在 `impl` 块中定义的函数被称为 **关联函数**（*associated function*），因为它们与 `impl` 后面命名的类型相关。我们可以定义不以 `self` 为第一参数的关联函数（因此不是方法），因为它们并不作用于一个结构体的实例。我们已经使用了一个这样的函数，`String::from` 函数，它是在 `String` 类型上定义的。

关联函数经常被用作返回一个结构体新实例的构造函数。例如我们可以提供一个关联函数，它接受一个维度参数并且同时作为宽和高，这样可以更轻松的创建一个正方形 `Rectangle` 而不必指定两次同样的值：

```rust linenums="1"
impl Rectangle {
    fn square(size: u32) -> Rectangle {
        Rectangle {
            width: size,
            height: size,
        }
    }
}
```

使用结构体名和 `::` 语法来调用这个关联函数：比如 `let sq = Rectangle::square(3);`。这个方法位于结构体的命名空间中：`::` 语法用于关联函数和模块创建的命名空间。第 7 章会讲到模块。

### 3.4 多个 `impl` 块

每个结构体都允许拥有多个 `impl` 块。例如，示例 5-16 中的代码等同于示例 5-15，但每个方法有其自己的 `impl` 块。

```rust linenums="1" title="示例5-16：使用多个 impl 块"
impl Rectangle {
    fn area(&self) -> u32 {
        self.width * self.height
    }
}

impl Rectangle {
    fn can_hold(&self, other: &Rectangle) -> bool {
        self.width > other.width && self.height > other.height
    }
}
```

这里没有理由将这些方法分散在多个 `impl` 块中，不过这是有效的语法。第 10 章讨论泛型和 trait 时会看到实用的多 `impl` 块用例。

## 4. 总结

结构体让你可以创建出在你的领域中有意义的自定义类型。通过结构体，我们可以将相关联的数据片段联系起来并命名它们，这样可以使得代码更加清晰。在 `impl` 块中，你可以定义与你的类型相关联的函数，而方法是一种相关联的函数，让你指定结构体的实例所具有的行为。

但结构体并不是创建自定义类型的唯一方法：让我们转向 Rust 的枚举功能，为你的工具箱再添一个工具。
