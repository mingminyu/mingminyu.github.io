# 第7章：使用包、Crate和模块管理不断增长的项目

当你编写大型程序时，组织你的代码显得尤为重要，因为你想在脑海中通晓整个程序，那几乎是不可能完成的。通过对相关功能进行分组和划分不同功能的代码，你可以清楚在哪里可以找到实现了特定功能的代码，以及在哪里可以改变一个功能的工作方式。

到目前为止，我们编写的程序都在一个文件的一个模块中。伴随着项目的增长，你可以通过将代码分解为多个模块和多个文件来组织代码。一个包可以包含多个二进制 crate 项和一个可选的 crate 库。伴随着包的增长，你可以将包中的部分代码提取出来，做成独立的 crate，这些 crate 则作为外部依赖项。本章将会涵盖所有这些概念。对于一个由一系列相互关联的包组合而成的超大型项目，Cargo 提供了 “工作空间” 这一功能，我们将在第 14 章的 “[Cargo 工作空间](https://rustwiki.org/zh-CN/book/ch14-03-cargo-workspaces.html)” 对此进行讲解。

除了对功能进行分组以外，封装实现细节可以使你更高级地重用代码：你实现了一个操作后，其他的代码可以通过该代码的公共接口来进行调用，而不需要知道它是如何实现的。你在编写代码时可以定义哪些部分是其他代码可以使用的公共部分，以及哪些部分是你有权更改实现细节的私有部分。这是另一种减少你在脑海中记住项目内容数量的方法。

这里有一个需要说明的概念 “作用域（scope）”：代码所在的嵌套上下文有一组定义为 “in scope” 的名称。当阅读、编写和编译代码时，开发者和编译器需要知道特定位置的特定名称是否引用了变量、函数、结构体、枚举、模块、常量或者其他有意义的项。你可以创建作用域，以及改变哪些名称在作用域内还是作用域外。同一个作用域内不能拥有两个相同名称的项；可以使用一些工具来解决名称冲突。

Rust 有许多功能可以让你管理代码的组织，包括哪些内容可以被公开，哪些内容作为私有部分，以及程序每个作用域中的名字。这些功能。这有时被称为 “模块系统（the module system）”，包括：

- **包**（*Packages*）： Cargo 的一个功能，它允许你构建、测试和分享 crate。
- **Crates** ：一个模块的树形结构，它形成了库或二进制项目。
- **模块**（*Modules*）和 **use**： 允许你控制作用域和路径的私有性。
- **路径**（*path*）：一个命名例如结构体、函数或模块等项的方式

本章将会涵盖所有这些概念，讨论它们如何交互，并说明如何使用它们来管理作用域。到最后，你会对模块系统有深入的了解，并且能够像专业人士一样使用作用域！

## 1. 包和 crate

模块系统的第一部分，我们将介绍包和 crate。crate 是一个二进制项或者库。*crate root* 是一个源文件，Rust 编译器以它为起始点，并构成你的 crate 的根模块（我们将在[“定义模块来控制作用域与私有性”](https://rustwiki.org/zh-CN/book/ch07-02-defining-modules-to-control-scope-and-privacy.html)一节深入解读）。*包*（*package*）是提供一系列功能的一个或者多个 crate。一个包会包含有一个 *Cargo.toml* 文件，阐述如何去构建这些 crate。

包中所包含的内容由几条规则来确立。一个包中至多 **只能** 包含一个库 crate（library crate）；包中可以包含任意多个二进制 crate（binary crate）；包中至少包含一个 crate，无论是库的还是二进制的。

让我们来看看创建包的时候会发生什么。首先，我们输入命令 `cargo new`：

```text
$ cargo new my-project
     Created binary (application) `my-project` package
$ ls my-project
Cargo.toml
src
$ ls my-project/src
main.rs
```

当我们输入了这条命令，Cargo 会给我们的包创建一个 *Cargo.toml* 文件。查看 *Cargo.toml* 的内容，会发现并没有提到 *src/main.rs*，因为 Cargo 遵循的一个约定：*src/main.rs* 就是一个与包同名的二进制 crate 的 crate 根。同样的，Cargo 知道如果包目录中包含 *src/lib.rs*，则包带有与其同名的库 crate，且 *src/lib.rs* 是 crate 根。crate 根文件将由 Cargo 传递给 `rustc` 来实际构建库或者二进制项目。

在此，我们有了一个只包含 *src/main.rs* 的包，意味着它只含有一个名为 `my-project` 的二进制 crate。如果一个包同时含有 *src/main.rs* 和 *src/lib.rs*，则它有两个 crate：一个库和一个二进制项，且名字都与包相同。通过将文件放在 *src/bin* 目录下，一个包可以拥有多个二进制 crate：每个 *src/bin* 下的文件都会被编译成一个独立的二进制 crate。

一个 crate 会将一个作用域内的相关功能分组到一起，使得该功能可以很方便地在多个项目之间共享。举一个例子，我们在[第 2 章](https://rustwiki.org/zh-CN/book/ch02-00-guessing-game-tutorial.html#生成一个随机数)使用的 `rand` crate 提供了生成随机数的功能。通过将 `rand` crate 加入到我们项目的作用域中，我们就可以在自己的项目中使用该功能。`rand` crate 提供的所有功能都可以通过该 crate 的名字：`rand` 进行访问。

将一个 crate 的功能保持在其自身的作用域中，可以知晓一些特定的功能是在我们的 crate 中定义的还是在 `rand` crate 中定义的，这可以防止潜在的冲突。例如，`rand` crate 提供了一个名为 `Rng` 的特性（trait）。我们还可以在我们自己的 crate 中定义一个名为 `Rng` 的 `struct`。因为一个 crate 的功能是在自身的作用域进行命名的，当我们将 `rand` 作为一个依赖，编译器不会混淆 `Rng` 这个名字的指向。在我们的 crate 中，它指向的是我们自己定义的 `struct Rng`。我们可以通过 `rand::Rng` 这一方式来访问 `rand` crate 中的 `Rng` 特性（trait）。

接下来让我们来说一说模块系统！


## 2. 定义模块来控制作用域与私有性

在本节，我们将讨论模块和其它一些关于模块系统的部分，如允许你命名项的 *路径*（*paths*）；用来将路径引入作用域的 `use` 关键字；以及使项变为公有的 `pub` 关键字。我们还将讨论 `as` 关键字、外部包和 glob 运算符。现在，让我们把注意力放在模块上！

*模块* 让我们可以将一个 crate 中的代码进行分组，以提高可读性与重用性。模块还可以控制项的 *私有性*，即项是可以被外部代码使用的（*public*），还是作为一个内部实现的内容，不能被外部代码使用（*private*）。

在餐饮业，餐馆中会有一些地方被称之为 *前台*（*front of house*），还有另外一些地方被称之为 *后台*（*back of house*）。前台是招待顾客的地方，在这里，店主可以为顾客安排座位，服务员接受顾客下单和付款，调酒师会制作饮品。后台则是由厨师工作的厨房，洗碗工的工作地点，以及经理做行政工作的地方组成。

我们可以将函数放置到嵌套的模块中，来使我们的 crate 结构与实际的餐厅结构相同。通过执行 `cargo new --lib restaurant`，来创建一个新的名为 `restaurant` 的库。然后将示例 7-1 中所罗列出来的代码放入 *src/lib.rs* 中，来定义一些模块和函数。

```rust linenums="1" title="示例7-1(src/lib.rs)：一个包含着含有函数的其他模块们的 front_of_house 模块"
mod front_of_house {
    mod hosting {
        fn add_to_waitlist() {}

        fn seat_at_table() {}
    }

    mod serving {
        fn take_order() {}

        fn serve_order() {}

        fn take_payment() {}
    }
}
```

我们用关键字 `mod` 定义一个模块，指定模块的名字（在示例中为 `front_of_house`），并用大括号包围模块的主体。我们可以在模块中包含其他模块，就像本示例中的 `hosting` 和 `serving` 模块。模块中也可以包含其他项，比如结构体、枚举、常量、trait，或者像示例 7-1 一样——包含函数。

通过使用模块，我们可以把相关的定义组织起来，并通过模块命名来解释为什么它们之间有相关性。使用这部分代码的开发者可以更方便的循着这种分组找到自己需要的定义，而不需要通览所有。编写这部分代码的开发者通过分组知道该把新功能放在哪里以便继续让程序保持组织性。

之前我们提到，*src/main.rs* 和 *src/lib.rs* 被称为 crate 根。如此称呼的原因是，这两个文件中任意一个的内容会构成名为 `crate` 的模块，且该模块位于 crate 的被称为 *模块树* 的模块结构的根部（"at the root of the crate’s module structure"）。

示例 7-2 展示了示例 7-1 所对应的模块树。

```text title="示例7-2：模块树"
crate
 └── front_of_house
     ├── hosting
     │   ├── add_to_waitlist
     │   └── seat_at_table
     └── serving
         ├── take_order
         ├── serve_order
         └── take_payment
```

这个树展示了模块间是如何相互嵌套的（比如，`hosting` 嵌套在 `front_of_house` 内部）。这个树还展示了一些模块互为 *兄弟* ，即它们被定义在同一模块内（`hosting` 和 `serving` 都定义在 `front_of_house` 内）。继续使用家族比喻，如果模块A包含在模块B的内部，我们称模块A是模块B的 *孩子* 且模块B是模块A的 *父辈* 。注意整个模块树的根位于名为 `crate` 的隐式模块下。

模块树或许让你想起了电脑上文件系统的目录树。这是一个非常恰当的比喻！就像文件系统中的目录那样，你应使用模块来组织你的代码。而且就像一个目录中的文件那样，我们需要一个找到我们的模块的方式。

## 3. 路径用于引用模块树中的项

来看一下 Rust 如何在模块树中找到一个项的位置，我们使用路径的方式，就像在文件系统使用路径一样。如果我们想要调用一个函数，我们需要知道它的路径。

路径有两种形式：

- **绝对路径**（*absolute path*）从 crate 根部开始，以 crate 名或者字面量 `crate` 开头。
- **相对路径**（*relative path*）从当前模块开始，以 `self`、`super` 或当前模块的标识符开头。

绝对路径和相对路径都后跟一个或多个由双冒号（`::`）分割的标识符。

让我们回到示例 7-1。我们如何调用 `add_to_waitlist` 函数？还是同样的问题，`add_to_waitlist` 函数的路径是什么？在示例 7-3 中，我们通过删除一些模块和函数，稍微简化了一下我们的代码。我们在 crate 根部定义了一个新函数 `eat_at_restaurant`，并在其中展示调用 `add_to_waitlist` 函数的两种方法。`eat_at_restaurant` 函数是我们 crate 库的一个公共 API，所以我们使用 `pub` 关键字来标记它。在[“使用 `pub` 关键字暴露路径”](https://rustwiki.org/zh-CN/book/ch07-03-paths-for-referring-to-an-item-in-the-module-tree.html#使用-pub-关键字暴露路径)一节，我们将详细介绍 `pub`。注意，这个例子无法编译通过，我们稍后会解释原因。

```rust linenums="1" title="示例7-3(src/lib.rs)：使用绝对路径和相对路径来调用 add_to_waitlist 函数"
mod front_of_house {
    mod hosting {
        fn add_to_waitlist() {}
    }
}

pub fn eat_at_restaurant() {
    // 绝对路径
    crate::front_of_house::hosting::add_to_waitlist();

    // 相对路径
    front_of_house::hosting::add_to_waitlist();
}
```


第一种方式，我们在 `eat_at_restaurant` 中调用 `add_to_waitlist` 函数，使用的是绝对路径。`add_to_waitlist` 函数与 `eat_at_restaurant` 被定义在同一 crate 中，这意味着我们可以使用 `crate` 关键字为起始的绝对路径。

在 `crate` 后面，我们持续地嵌入模块，直到我们找到 `add_to_waitlist`。你可以想象出一个相同结构的文件系统，我们通过指定路径 `/front_of_house/hosting/add_to_waitlist` 来执行 `add_to_waitlist` 程序。我们使用 `crate` 从 crate 根部开始就类似于在 shell 中使用 `/` 从文件系统根开始。

第二种方式，我们在 `eat_at_restaurant` 中调用 `add_to_waitlist`，使用的是相对路径。这个路径以 `front_of_house` 为起始，这个模块在模块树中，与 `eat_at_restaurant` 定义在同一层级。与之等价的文件系统路径就是 `front_of_house/hosting/add_to_waitlist`。以名称为起始，意味着该路径是相对路径。

选择使用相对路径还是绝对路径，还是要取决于你的项目。取决于你是更倾向于将项的定义代码与使用该项的代码分开来移动，还是一起移动。举一个例子，如果我们要将 `front_of_house` 模块和 `eat_at_restaurant` 函数一起移动到一个名为 `customer_experience` 的模块中，我们需要更新 `add_to_waitlist` 的绝对路径，但是相对路径还是可用的。然而，如果我们要将 `eat_at_restaurant` 函数单独移到一个名为 `dining` 的模块中，还是可以使用原本的绝对路径来调用 `add_to_waitlist`，但是相对路径必须要更新。我们更倾向于使用绝对路径，因为把代码定义和项调用各自独立地移动是更常见的。

让我们试着编译一下示例 7-3，并查明为何不能编译！示例 7-4 展示了这个错误。

```console title="示例7-4：编译错误"
$ cargo build
   Compiling restaurant v0.1.0 (file:///projects/restaurant)
error[E0603]: module `hosting` is private
 --> src/lib.rs:9:28
  |
9 |     crate::front_of_house::hosting::add_to_waitlist();
  |                            ^^^^^^^ private module
  |
note: the module `hosting` is defined here
 --> src/lib.rs:2:5
  |
2 |     mod hosting {
  |     ^^^^^^^^^^^

error[E0603]: module `hosting` is private
  --> src/lib.rs:12:21
   |
12 |     front_of_house::hosting::add_to_waitlist();
   |                     ^^^^^^^ private module
   |
note: the module `hosting` is defined here
  --> src/lib.rs:2:5
   |
2  |     mod hosting {
   |     ^^^^^^^^^^^

For more information about this error, try `rustc --explain E0603`.
error: could not compile `restaurant` due to 2 previous errors
```

错误信息说 `hosting` 模块是私有的。换句话说，我们拥有 `hosting` 模块和 `add_to_waitlist` 函数的的正确路径，但是 Rust 不让我们使用，因为它不能访问私有片段。

模块不仅对于你组织代码很有用。他们还定义了 Rust 的 *私有性边界*（*privacy boundary*）：这条界线不允许外部代码了解、调用和依赖被封装的实现细节。所以，如果你希望创建一个私有函数或结构体，你可以将其放入模块。

Rust 中默认所有项（函数、方法、结构体、枚举、模块和常量）都是私有的。父模块中的项不能使用子模块中的私有项，但是子模块中的项可以使用他们父模块中的项。这是因为子模块封装并隐藏了他们的实现详情，但是子模块可以看到他们定义的上下文。继续拿餐馆作比喻，把私有性规则想象成餐馆的后台办公室：餐馆内的事务对餐厅顾客来说是不可知的，但办公室经理可以洞悉其经营的餐厅并在其中做任何事情。

Rust 选择以这种方式来实现模块系统功能，因此默认隐藏内部实现细节。这样一来，你就知道可以更改内部代码的哪些部分而不会破坏外部代码。你还可以通过使用 `pub` 关键字来创建公共项，使子模块的内部部分暴露给上级模块。

### 3.1 使用 `pub` 关键字暴露路径

让我们回头看一下示例 7-4 的错误，它告诉我们 `hosting` 模块是私有的。我们想让父模块中的 `eat_at_restaurant` 函数可以访问子模块中的 `add_to_waitlist` 函数，因此我们使用 `pub` 关键字来标记 `hosting` 模块，如示例 7-5 所示。

```rust linenums="1" hl_lines="2" title="示例7-5(src/lib.rs)：使用 pub 创建公共模块 hosting"
mod front_of_house {
    pub mod hosting {
        fn add_to_waitlist() {}
    }
}

pub fn eat_at_restaurant() {
    // 绝对路径
    crate::front_of_house::hosting::add_to_waitlist();

    // 相对路径
    front_of_house::hosting::add_to_waitlist();
}
```

示例 7-5: 使用 `pub` 关键字声明 `hosting` 模块使其可在 `eat_at_restaurant` 使用

不幸的是，示例 7-5 的代码编译仍然有错误，如示例 7-6 所示。

```console title="示例7-6：编译错误"
$ cargo build
   Compiling restaurant v0.1.0 (file:///projects/restaurant)
error[E0603]: function `add_to_waitlist` is private
 --> src/lib.rs:9:37
  |
9 |     crate::front_of_house::hosting::add_to_waitlist();
  |                                     ^^^^^^^^^^^^^^^ private function
  |
note: the function `add_to_waitlist` is defined here
 --> src/lib.rs:3:9
  |
3 |         fn add_to_waitlist() {}
  |         ^^^^^^^^^^^^^^^^^^^^

error[E0603]: function `add_to_waitlist` is private
  --> src/lib.rs:12:30
   |
12 |     front_of_house::hosting::add_to_waitlist();
   |                              ^^^^^^^^^^^^^^^ private function
   |
note: the function `add_to_waitlist` is defined here
  --> src/lib.rs:3:9
   |
3  |         fn add_to_waitlist() {}
   |         ^^^^^^^^^^^^^^^^^^^^

For more information about this error, try `rustc --explain E0603`.
error: could not compile `restaurant` due to 2 previous errors
```


发生了什么？在 `mod hosting` 前添加了 `pub` 关键字，使其变成公有的。伴随着这种变化，如果我们可以访问 `front_of_house`，那我们也可以访问 `hosting`。但是 `hosting` 的 **内容**（*contents*） 仍然是私有的；这表明使模块公有并不使其内容也是公有的。模块上的 `pub` 关键字只允许其父模块引用它。

示例 7-6 中的错误说，`add_to_waitlist` 函数是私有的。私有性规则不但应用于模块，还应用于结构体、枚举、函数和方法。

让我们继续将 `pub` 关键字放置在 `add_to_waitlist` 函数的定义之前，使其变成公有。如示例 7-7 所示。

```rust linenums="1" hl_lines="3" title="示例7-7(src/lib.rs)：使用 pub 创建公共函数 add_to_waitlist"
mod front_of_house {
    pub mod hosting {
        pub fn add_to_waitlist() {}
    }
}

pub fn eat_at_restaurant() {
    // 绝对路径
    crate::front_of_house::hosting::add_to_waitlist();

    // 相对路径
    front_of_house::hosting::add_to_waitlist();
}
```

示例 7-7: 为 `mod hosting` 和 `fn add_to_waitlist` 添加 `pub` 关键字使他们可以在 `eat_at_restaurant` 函数中被调用

现在代码可以编译通过了！让我们看看绝对路径和相对路径，并根据私有性规则，再检查一下为什么增加 `pub` 关键字使得我们可以在 `add_to_waitlist` 中调用这些路径。

在绝对路径，我们从 `crate`，也就是 crate 根部开始。然后 crate 根部中定义了 `front_of_house` 模块。`front_of_house` 模块不是公有的，不过因为 `eat_at_restaurant` 函数与 `front_of_house` 定义于同一模块中（即，`eat_at_restaurant` 和 `front_of_house` 是兄弟），我们可以从 `eat_at_restaurant` 中引用 `front_of_house`。接下来是使用 `pub` 标记的 `hosting` 模块。我们可以访问 `hosting` 的父模块，所以可以访问 `hosting`。最后，`add_to_waitlist` 函数被标记为 `pub` ，我们可以访问其父模块，所以这个函数调用是有效的！

在相对路径，其逻辑与绝对路径相同，除了第一步：不同于从 crate 根部开始，路径从 `front_of_house` 开始。`front_of_house` 模块与 `eat_at_restaurant` 定义于同一模块，所以从 `eat_at_restaurant` 中开始定义的该模块相对路径是有效的。接下来因为 `hosting` 和 `add_to_waitlist` 被标记为 `pub`，路径其余的部分也是有效的，因此函数调用也是有效的！

### 3.2 使用 `super` 起始的相对路径

我们还可以使用 `super` 开头来构建从父模块开始的相对路径。这么做类似于文件系统中以 `..` 开头的语法。我们为什么要这样做呢？

考虑一下示例 7-8 中的代码，它模拟了厨师更正了一个错误订单，并亲自将其提供给客户的情况。`fix_incorrect_order` 函数通过指定的 `super` 起始的 `serve_order` 路径，来调用 `serve_order` 函数：

```rust linenums="1" hl_lines="6" title="示例7-8(src/lib.rs)：使用 super 开头的相对路径从父目录开始调用函数"
fn serve_order() {}

mod back_of_house {
    fn fix_incorrect_order() {
        cook_order();
        super::serve_order();
    }

    fn cook_order() {}
}
```

`fix_incorrect_order` 函数在 `back_of_house` 模块中，所以我们可以使用 `super` 进入 `back_of_house` 父模块，也就是本例中的 `crate` 根。在这里，我们可以找到 `serve_order`。成功！我们认为 `back_of_house` 模块和 `serve_order` 函数之间可能具有某种关联关系，并且，如果我们要重新组织这个 crate 的模块树，需要一起移动它们。因此，我们使用 `super`，这样一来，如果这些代码被移动到了其他模块，我们只需要更新很少的代码。

### 3.3 创建公有的结构体和枚举

我们还可以使用 `pub` 来设计公有的结构体和枚举，不过有一些额外的细节需要注意。如果我们在一个结构体定义的前面使用了 `pub` ，这个结构体会变成公有的，但是这个结构体的字段仍然是私有的。我们可以根据情况决定每个字段是否公有。在示例 7-9 中，我们定义了一个公有结构体 `back_of_house::Breakfast`，其中有一个公有字段 `toast` 和私有字段 `seasonal_fruit`。这个例子模拟的情况是，在一家餐馆中，顾客可以选择随餐附赠的面包类型，但是厨师会根据季节和库存情况来决定随餐搭配的水果。餐馆可用的水果变化是很快的，所以顾客不能选择水果，甚至无法看到他们将会得到什么水果。

```rust linenums="1" title="示例7-9(src/lib.rs)：带有公有和私有字段的结构体"
mod back_of_house {
    pub struct Breakfast {
        pub toast: String,
        seasonal_fruit: String,
    }

    impl Breakfast {
        pub fn summer(toast: &str) -> Breakfast {
            Breakfast {
                toast: String::from(toast),
                seasonal_fruit: String::from("peaches"),
            }
        }
    }
}

pub fn eat_at_restaurant() {
    // 在夏天点一份黑麦面包作为早餐
    let mut meal = back_of_house::Breakfast::summer("Rye");
    // 更改我们想要的面包
    meal.toast = String::from("Wheat");
    println!("I'd like {} toast please", meal.toast);

    // 如果取消下一行的注释，将会导致编译失败；我们不被允许
    // 看到或更改随餐搭配的季节水果
    // meal.seasonal_fruit = String::from("blueberries");
}
```

因为 `back_of_house::Breakfast` 结构体的 `toast` 字段是公有的，所以我们可以在 `eat_at_restaurant` 中使用点号来随意的读写 `toast` 字段。注意，我们不能在 `eat_at_restaurant` 中使用 `seasonal_fruit` 字段，因为 `seasonal_fruit` 是私有的。尝试去除那一行修改 `seasonal_fruit` 字段值的代码的注释，看看你会得到什么错误！

还请注意一点，因为 `back_of_house::Breakfast` 具有私有字段，所以这个结构体需要提供一个公共的关联函数来构造 `Breakfast` 的实例（这里我们命名为 `summer`）。如果 `Breakfast` 没有这样的函数，我们将无法在 `eat_at_restaurant` 中创建 `Breakfast` 实例，因为我们不能在 `eat_at_restaurant` 中设置私有字段 `seasonal_fruit` 的值。

与之相反，如果我们将枚举设为公有，则它的所有成员都将变为公有。我们只需要在 `enum` 关键字前面加上 `pub`，就像示例 7-10 展示的那样。

```rust linenums="1 title="示例7-10(src/lib.rs)：设计公有枚举，使其所有成员公有"
mod back_of_house {
    pub enum Appetizer {
        Soup,
        Salad,
    }
}

pub fn eat_at_restaurant() {
    let order1 = back_of_house::Appetizer::Soup;
    let order2 = back_of_house::Appetizer::Salad;
}
```

因为我们创建了名为 `Appetizer` 的公有枚举，所以我们可以在 `eat_at_restaurant` 中使用 `Soup` 和 `Salad` 成员。如果枚举成员不是公有的，那么枚举会显得用处不大；给枚举的所有成员挨个添加 `pub` 是很令人恼火的，因此枚举成员默认就是公有的。结构体通常使用时，不必将它们的字段公有化，因此结构体遵循常规，内容全部是私有的，除非使用 `pub` 关键字。

还有一种使用 `pub` 的场景我们还没有涉及到，那就是我们最后要讲的模块功能：`use` 关键字。我们将先单独介绍 `use`，然后展示如何结合使用 `pub` 和 `use`。


## 4. 使用 `use` 关键字将名称引入作用域

到目前为止，似乎我们编写的用于调用函数的路径都很冗长且重复，并不方便。例如，示例 7-7 中，无论我们选择 `add_to_waitlist` 函数的绝对路径还是相对路径，每次我们想要调用 `add_to_waitlist` 时，都必须指定 `front_of_house` 和 `hosting`。幸运的是，有一种方法可以简化这个过程。我们可以使用 `use` 关键字将路径一次性引入作用域，然后调用该路径中的项，就如同它们是本地项一样。

在示例 7-11 中，我们将 `crate::front_of_house::hosting` 模块引入了 `eat_at_restaurant` 函数的作用域，而我们只需要指定 `hosting::add_to_waitlist` 即可在 `eat_at_restaurant` 中调用 `add_to_waitlist` 函数。

文件名: src/lib.rs

```rust linenums="1" title="示例7-11(src/lib.rs)：使用 use 将模块引入作用域"
mod front_of_house {
    pub mod hosting {
        pub fn add_to_waitlist() {}
    }
}

use crate::front_of_house::hosting;

pub fn eat_at_restaurant() {
    hosting::add_to_waitlist();
}
```

在作用域中增加 `use` 和路径类似于在文件系统中创建软连接（符号连接，symbolic link）。通过在 crate 根增加 `use crate::front_of_house::hosting`，现在 `hosting` 在作用域中就是有效的名称了，如同 `hosting` 模块被定义于 crate 根一样。通过 `use` 引入作用域的路径也会检查私有性，同其它路径一样。

你还可以使用 `use` 和相对路径来将一个项引入作用域。示例 7-12 展示了如何指定相对路径来取得与示例 7-11 中一样的行为。

```rust linenums="1" title="示例7-12(src/lib.rs)：使用 use 和相对路径将模块引入作用域"
mod front_of_house {
    pub mod hosting {
        pub fn add_to_waitlist() {}
    }
}

use front_of_house::hosting;

pub fn eat_at_restaurant() {
    hosting::add_to_waitlist();
}
```

### 4.1 创建惯用的 `use` 路径

在示例 7-11 中，你可能会比较疑惑，为什么我们是指定 `use crate::front_of_house::hosting`，然后在 `eat_at_restaurant` 中调用 `hosting::add_to_waitlist`，而不是通过指定一直到 `add_to_waitlist` 函数的 `use` 路径来得到相同的结果，如示例 7-13 所示。

文件名: src/lib.rs

```rust linenums="1" title="示例7-13(src/lib.rs)：使用 use 将函数 add_to_waitlist 引入作用域，这并不符合习惯"
mod front_of_house {
    pub mod hosting {
        pub fn add_to_waitlist() {}
    }
}

use crate::front_of_house::hosting::add_to_waitlist;

pub fn eat_at_restaurant() {
    add_to_waitlist();
}
```

虽然示例 7-11 和 7-13 都完成了相同的任务，但示例 7-11 是使用 `use` 将函数引入作用域的习惯用法。使用 `use` 将函数的父模块引入作用域意味着我们必须在调用函数时指定父模块，这样可以清晰地表明函数不是在本地定义的，同时使完整路径的重复度最小化。示例 7-13 中的代码则未表明 `add_to_waitlist` 是在哪里被定义的。

另一方面，使用 `use` 引入结构体、枚举和其他项时，习惯是指定它们的完整路径。示例 7-14 展示了将 `HashMap` 结构体引入二进制 crate 作用域的习惯用法。

```rust linenums="1" title="示例7-14(src/main.rs)：将 HashMap 引入作用域的习惯用法"
use std::collections::HashMap;

fn main() {
    let mut map = HashMap::new();
    map.insert(1, 2);
}
```

这种习惯用法背后没有什么硬性要求：它只是一种惯例，人们已经习惯了以这种方式阅读和编写 Rust 代码。

这个习惯用法有一个例外，那就是我们想使用 `use` 语句将两个具有相同名称的项带入作用域，因为 Rust 不允许这样做。示例 7-15 展示了如何将两个具有相同名称但不同父模块的 `Result` 类型引入作用域，以及如何引用它们。

```rust linenums="1" title="示例7-15(src/lib.rs)：使用父模块将两个具有相同名称的类型引入同一作用域"
use std::fmt;
use std::io;

fn function1() -> fmt::Result {
    // --snip--
}

fn function2() -> io::Result<()> {
    // --snip--
}
```

示例 7-15: 使用父模块将两个具有相同名称的类型引入同一作用域

如你所见，使用父模块可以区分这两个 `Result` 类型。如果我们是指定 `use std::fmt::Result` 和 `use std::io::Result`，我们将在同一作用域拥有了两个 `Result` 类型，当我们使用 `Result` 时，Rust 则不知道我们要用的是哪个。

### 4.2 使用 `as` 关键字提供新的名称

使用 `use` 将两个同名类型引入同一作用域这个问题还有另一个解决办法：在这个类型的路径后面，我们使用 `as` 指定一个新的本地名称或者别名。示例 7-16 展示了另一个编写示例 7-15 中代码的方法，通过 `as` 重命名其中一个 `Result` 类型。

```rust linenums="1" title="示例7-16(src/lib.rs)：使用 as 重命名引入作用域的类型"
use std::fmt::Result;
use std::io::Result as IoResult;

fn function1() -> Result {
    // --snip--
}

fn function2() -> IoResult<()> {
    // --snip--
}
```

在第二个 `use` 语句中，我们选择 `IoResult` 作为 `std::io::Result` 的新名称，它与从 `std::fmt` 引入作用域的 `Result` 并不冲突。示例 7-15 和示例 7-16 都是惯用的，如何选择都取决于你！

### 4.3 使用 `pub use` 重导出名称

当使用 `use` 关键字将名称导入作用域时，在新作用域中可用的名称是私有的。如果为了让调用你编写的代码的代码能够像在自己的作用域内引用这些类型，可以结合 `pub` 和 `use`。这个技术被称为 “*重导出*（*re-exporting*）”，因为这样做将项引入作用域并同时使其可供其他代码引入自己的作用域。

示例 7-17 展示了将示例 7-11 中使用 `use` 的根模块变为 `pub use` 的版本的代码。

```rust linenums="1" title="示例7-17(src/lib.rs)：使用 pub use 使名称可引入任何代码的作用域中"
mod front_of_house {
    pub mod hosting {
        pub fn add_to_waitlist() {}
    }
}

pub use crate::front_of_house::hosting;

pub fn eat_at_restaurant() {
    hosting::add_to_waitlist();
}
```

通过 `pub use`，现在可以通过新路径 `hosting::add_to_waitlist` 来调用 `add_to_waitlist` 函数。如果没有指定 `pub use`，`eat_at_restaurant` 函数可以在其作用域中调用 `hosting::add_to_waitlist`，但外部代码则不允许使用这个新路径。

当你的代码的内部结构与调用你的代码的开发者的思考领域不同时，重导出会很有用。例如，在这个餐馆的比喻中，经营餐馆的人会想到“前台”和“后台”。但顾客在光顾一家餐馆时，可能不会以这些术语来考虑餐馆的各个部分。使用 `pub use`，我们可以使用一种结构编写代码，却将不同的结构形式暴露出来。这样做使我们的库井井有条，方便开发这个库的开发者和调用这个库的开发者之间组织起来。

### 4.4 使用外部包

在第 2 章中我们编写了一个猜猜看游戏。那个项目使用了一个外部包，`rand`，来生成随机数。为了在项目中使用 `rand`，在 *Cargo.toml* 中加入了如下行：

```toml title="Cargo.toml"
[dependencies]
rand = "0.8.3"
```

在 *Cargo.toml* 中加入 `rand` 依赖告诉了 Cargo 要从 [crates.io](https://crates.io/) 下载 `rand` 和其依赖，并使其可在项目代码中使用。

接着，为了将 `rand` 定义引入项目包的作用域，我们加入一行 `use` 起始的包名，它以 `rand` 包名开头并列出了需要引入作用域的项。回忆一下第 2 章的 [“生成一个随机数”](https://rustwiki.org/zh-CN/book/ch02-00-guessing-game-tutorial.html#生成一个随机数) 部分，我们曾将 `Rng` trait 引入作用域并调用了 `rand::thread_rng` 函数：

```rust linenums="1"
use rand::Rng;

fn main() {
    let secret_number = rand::thread_rng().gen_range(1..101);
}
```

[crates.io](https://crates.io/) 上有很多 Rust 社区成员发布的包，将其引入你自己的项目都需要一道相同的步骤：在 *Cargo.toml* 列出它们并通过 `use` 将其中定义的项引入项目包的作用域中。

注意标准库（`std`）对于你的包来说也是外部 crate。因为标准库随 Rust 语言一同分发，无需修改 *Cargo.toml* 来引入 `std`，不过需要通过 `use` 将标准库中定义的项引入项目包的作用域中来引用它们，比如我们使用的 `HashMap`：

```rust
use std::collections::HashMap;
```

这是一个以标准库 crate 名 `std` 开头的绝对路径。

### 4.5 嵌套路径来消除大量的 `use` 行

当需要引入很多定义于相同包或相同模块的项时，为每一项单独列出一行会占用源码很大的空间。例如猜猜看章节示例 2-4 中有两行 `use` 语句都从 `std` 引入项到作用域：

```rust linenums="1" title="src/main.rs"
use std::cmp::Ordering;
use std::io;
// ---snip---
```

相反，我们可以使用嵌套路径将相同的项在一行中引入作用域。这么做需要指定路径的相同部分，接着是两个冒号，接着是大括号中的各自不同的路径部分，如示例 7-18 所示。

```rust linenums="1" title="示例7-18(src/main.rs): 指定嵌套的路径在一行中将多个带有相同前缀的项引入作用域"
use std::{cmp::Ordering, io};
// ---snip---
``

在较大的程序中，使用嵌套路径从相同包或模块中引入很多项，可以显著减少所需的独立 `use` 语句的数量！

我们可以在路径的任何层级使用嵌套路径，这在组合两个共享子路径的 `use` 语句时非常有用。例如，示例 7-19 中展示了两个 `use` 语句：一个将 `std::io` 引入作用域，另一个将 `std::io::Write` 引入作用域：

```rust linenums="1" title="示例7-19(src/lib.rs): 通过两行 use 语句引入两个路径，其中一个是另一个的子路径"
use std::io;
use std::io::Write;
```

两个路径的相同部分是 `std::io`，这正是第一个路径。为了在一行 `use` 语句中引入这两个路径，可以在嵌套路径中使用 `self`，如示例 7-20 所示。

```rust linenums="1" title="示例7-20(src/lib.rs): 将示例 7-19 中部分重复的路径合并为一个 use 语句"
use std::io::{self, Write};
```

这一行便将 `std::io` 和 `std::io::Write` 同时引入作用域。

### 4.6 通过 glob 运算符将所有的公有定义引入作用域

如果希望将一个路径下 **所有** 公有项引入作用域，可以指定路径后跟 glob 运算符 `*`：

```rust
use std::collections::*;
```

这个 `use` 语句将 `std::collections` 中定义的所有公有项引入当前作用域。使用 glob 运算符时请多加小心！Glob 会使得我们难以推导作用域中有什么名称和它们是在何处定义的。

glob 运算符经常用于测试模块 `tests` 中，这时会将所有内容引入作用域；我们将在第 11 章 [“如何编写测试”](https://rustwiki.org/zh-CN/book/ch11-01-writing-tests.html#如何编写测试) 部分讲解。glob 运算符有时也用于 prelude 模式；查看 [标准库中的文档](https://rustwiki.org/zh-CN/std/prelude/index.html#other-preludes) 了解这个模式的更多细节。

## 5. 将模块分割进不同文件

到目前为止，本章所有的例子都在一个文件中定义多个模块。当模块变得更大时，你可能想要将它们的定义移动到单独的文件中，从而使代码更容易阅读。

例如，我们从示例 7-17 开始，将 `front_of_house` 模块移动到属于它自己的文件 *src/front_of_house.rs* 中，通过改变 crate 根文件，使其包含示例 7-21 所示的代码。在这个例子中，crate 根文件是 *src/lib.rs*，这也同样适用于以 *src/main.rs* 为 crate 根文件的二进制 crate 项。

```rust linenums="1" title="示例7-21(src/lib.rs): 声明 front_of_house 模块，其内容将位于src/front_of_house.rs"
mod front_of_house;

pub use crate::front_of_house::hosting;

pub fn eat_at_restaurant() {
    hosting::add_to_waitlist();
}
```

*src/front_of_house.rs* 会获取 `front_of_house` 模块的定义内容，如示例 7-22 所示。

```rust linenums="1" title="示例7-22(src/front_of_house.rs): 在 src/front_of_house.rs 中定义 front_of_house 模块"
pub mod hosting {
    pub fn add_to_waitlist() {}
}
```

在 `mod front_of_house` 后使用分号，而不是代码块，这将告诉 Rust 在另一个与模块同名的文件中加载模块的内容。继续重构我们例子，将 `hosting` 模块也提取到其自己的文件中，仅对 *src/front_of_house.rs* 包含 `hosting` 模块的声明进行修改：

```rust linenums="1" title="示例7-23(src/front_of_house.rs): 模块声明 front_of_house 的内容位于 src/front_of_house.rs"
pub mod hosting;
```

接着我们创建一个 *src/front_of_house* 目录和一个包含 `hosting` 模块定义的 *src/front_of_house/hosting.rs* 文件：

```rust linenums="1"
pub fn add_to_waitlist() {}
```

模块树依然保持相同，`eat_at_restaurant` 中的函数调用也无需修改继续保持有效，即便其定义存在于不同的文件中。这个技巧让你可以在模块代码增长时，将它们移动到新文件中。

注意，*src/lib.rs* 中的 `pub use crate::front_of_house::hosting` 语句是没有改变的，在文件作为 crate 的一部分而编译时，`use` 不会有任何影响。`mod` 关键字声明了模块，Rust 会在与模块同名的文件中查找模块的代码。

## 6. 总结

Rust 提供了将包分成多个 crate，将 crate 分成模块，以及通过指定绝对或相对路径从一个模块引用另一个模块中定义的项的方式。你可以通过使用 `use` 语句将路径引入作用域，这样在多次使用时可以使用更短的路径。模块定义的代码默认是私有的，不过可以选择增加 `pub` 关键字使其定义变为公有。

接下来，让我们看看一些标准库提供的集合数据类型，你可以利用它们编写出漂亮整洁的代码。
