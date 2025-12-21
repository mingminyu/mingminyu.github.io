# 第14章：进一步认识 Cargo 和 Crates.io

目前为止我们只使用过 Cargo 构建、运行和测试代码这些最基本的功能，不过它还可以做到更多。本章会讨论 Cargo 其他一些更为高级的功能，我们将展示如何：

- 使用发布配置来自定义构建
- 将库发布到 [crates.io](https://crates.io/)
- 使用工作空间来组织更大的项目
- 从 [crates.io](https://crates.io/) 安装二进制文件
- 使用自定义的命令来扩展 Cargo

Cargo 的功能不止本章所介绍的，关于其全部功能的详尽解释，请查看 [文档](https://rustwiki.org/zh-CN/cargo/)

## 1. [采用发布配置自定义构建](https://rustwiki.org/zh-CN/book/ch14-01-release-profiles.html#采用发布配置自定义构建)

在 Rust 中 **发布配置**（*release profiles*）是预定义的、可定制的带有不同选项的配置，他们允许开发者更灵活地控制代码编译的多种选项。每一个配置都彼此相互独立。

Cargo 有两个主要的配置：运行 `cargo build` 时采用的 `dev` 配置和运行 `cargo build --release` 的 `release` 配置。`dev` 配置被定义为开发时的好的默认配置，`release` 配置则有着良好的发布构建的默认配置。

这些配置名称可能很眼熟，因为它们出现在构建的输出中：

```text
$ cargo build
    Finished dev [unoptimized + debuginfo] target(s) in 0.0 secs
$ cargo build --release
    Finished release [optimized] target(s) in 0.0 secs
```

构建输出中的 `dev` 和 `release` 表明编译器在使用不同的配置。

当项目的 *Cargo.toml* 文件中没有任何 `[profile.*]` 部分的时候，Cargo 会对每一个配置都采用默认设置。通过在`[profile.*]`对应的部分中增加任何定制的配置，我们可以覆盖任意默认设置的子集。例如，如下是 `dev` 和 `release` 配置的 `opt-level` 设置的默认值：

文件名: Cargo.toml

```toml
[profile.dev]
opt-level = 0

[profile.release]
opt-level = 3
```

`opt-level` 设置控制 Rust 会对代码进行何种程度的优化。这个配置的值从 0 到 3。越高的优化级别需要更多的时间编译，所以如果你在进行开发并经常编译，可能会希望在牺牲一些代码性能的情况下编译得快一些。这就是为什么 `dev` 的 `opt-level` 默认为 `0`。当你准备发布时，花费更多时间在编译上则更好。只需要在发布模式编译一次，而编译出来的程序则会运行很多次，所以发布模式用更长的编译时间换取运行更快的代码。这正是为什么 `release` 配置的 `opt-level` 默认为 `3`。

我们可以选择通过在 *Cargo.toml* 增加不同的值来覆盖任何默认设置。比如，如果我们想要在开发配置中使用级别 1 的优化，则可以在 *Cargo.toml* 中增加这两行：

文件名: Cargo.toml

```toml
[profile.dev]
opt-level = 1
```

这会覆盖默认的设置 `0`。现在运行 `cargo build` 时，Cargo 将会使用 `dev` 的默认配置加上定制的 `opt-level`。因为 `opt-level` 设置为 `1`，Cargo 会比默认进行更多的优化，但是没有发布构建那么多。

对于每个配置的设置和其默认值的完整列表，请查看 [Cargo 的文档](https://rustwiki.org/zh-CN/cargo/reference/manifest.html#the-profile-sections)

## 2. 将 crate 发布到 Crates.io

我们曾经在项目中使用 [crates.io](https://crates.io/) 上的包作为依赖，不过你也可以通过发布自己的包来向别人分享代码。[crates.io](https://crates.io/) 用来分发包的源代码，所以它主要托管开源代码。

Rust 和 Cargo 有一些帮助别人更方便找到和使用你发布的包的功能。我们将介绍一些这样的功能，接着讲到如何发布一个包。

### 2.1 编写有用的文档注释

准确的包文档有助于其他用户理解如何以及何时使用他们，所以花一些时间编写文档是值得的。第 3 章中我们讨论了如何使用两斜杠 `//` 注释 Rust 代码。Rust 也有特定的用于文档的注释类型，通常被称为 **文档注释**（*documentation comments*），他们会生成 HTML 文档。这些 HTML 展示公有 API 文档注释的内容，他们意在让对库感兴趣的开发者理解如何 **使用** 这个 crate，而不是它是如何被 **实现** 的。

文档注释使用三斜杠 `///` 而不是两斜杆以支持 Markdown 标记来格式化文本。文档注释就位于需要文档的项的之前。示例 14-1 展示了一个 `my_crate` crate 中 `add_one` 函数的文档注释：

文件名: src/lib.rs

```rust
/// Adds one to the number given.
///
/// # Examples
///
/// ```
/// let arg = 5;
/// let answer = my_crate::add_one(arg);
///
/// assert_eq!(6, answer);
/// ```
pub fn add_one(x: i32) -> i32 {
    x + 1
}
```

示例 14-1：一个函数的文档注释

这里，我们提供了一个 `add_one` 函数工作的描述，接着开始了一个标题为 `Examples` 的部分，和展示如何使用 `add_one` 函数的代码。可以运行 `cargo doc` 来生成这个文档注释的 HTML 文档。这个命令运行由 Rust 分发的工具 `rustdoc` 并将生成的 HTML 文档放入 *target/doc* 目录。

为了方便起见，运行 `cargo doc --open` 会构建当前 crate 文档（同时还有所有 crate 依赖的文档）的 HTML 并在浏览器中打开。导航到 `add_one` 函数将会发现文档注释的文本是如何渲染的，如图 14-1 所示：

![`my_crate` 的 `add_one` 函数所渲染的文档注释 HTML](https://rustwiki.org/zh-CN/book/img/trpl14-01.png)

图 14-1：`add_one` 函数的文档注释 HTML

#### 2.1.1 常用（文档注释）部分](https://rustwiki.org/zh-CN/book/ch14-02-publishing-to-crates-io.html#常用文档注释部分)

示例 14-1 中使用了 `# Examples` Markdown 标题在 HTML 中创建了一个以 “Examples” 为标题的部分。其他一些 crate 作者经常在文档注释中使用的部分有：

- **Panics**：这个函数可能会 `panic!` 的场景。并不希望程序崩溃的函数调用者应该确保他们不会在这些情况下调用此函数。
- **Errors**：如果这个函数返回 `Result`，此部分描述可能会出现何种错误以及什么情况会造成这些错误，这有助于调用者编写代码来采用不同的方式处理不同的错误。
- **Safety**：如果这个函数使用 `unsafe` 代码（这会在第 19 章讨论），这一部分应该会涉及到期望函数调用者支持的确保 `unsafe` 块中代码正常工作的不变条件（invariants）。

大部分文档注释不需要所有这些部分，不过这是一个提醒你检查调用你代码的人有兴趣了解的内容的列表。

#### 2.1.2 文档注释作为测试

在文档注释中增加示例代码块是一个清楚的表明如何使用库的方法，这么做还有一个额外的好处：`cargo test` 也会像测试那样运行文档中的示例代码！没有什么比有例子的文档更好的了，但最糟糕的莫过于写完文档后改动了代码，而导致例子不能正常工作。尝试 `cargo test` 运行像示例 14-1 中 `add_one` 函数的文档；应该在测试结果中看到像这样的部分：

```text
   Doc-tests my_crate

running 1 test
test src/lib.rs - add_one (line 5) ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out
```

现在尝试改变函数或例子来使例子中的 `assert_eq!` 产生 panic。再次运行 `cargo test`，你将会看到文档测试捕获到了例子与代码不再同步！

#### 2.1.3 注释包含项的结构

还有另一种风格的文档注释，`//!`，为包含注释的项添加文档，而不是为注释之后的项增加文档。通常用于 crate 根文件（通常是 *src/lib.rs*）或模块的根文件，为 crate 或模块整体提供文档。

作为一个例子，如果我们希望增加描述包含 `add_one` 函数的 `my_crate` crate 目的的文档，可以在 *src/lib.rs* 开头增加以 `//!` 开头的注释，如示例 14-2 所示：

文件名: src/lib.rs

```rust
//! # My Crate
//!
//! `my_crate` is a collection of utilities to make performing certain
//! calculations more convenient.

/// Adds one to the number given.
// --snip--
```

示例 14-2：`my_crate` crate 整体的文档

注意 `//!` 的最后一行之后没有任何代码。因为他们以 `//!` 开头而不是 `///`，这是属于包含此注释的项而不是注释之后项的文档。在这个情况中，包含这个注释的项是 *src/lib.rs* 文件，也就是 crate 根文件。这些注释描述了整个 crate。

如果运行 `cargo doc --open`，将会发现这些注释显示在 `my_crate` 文档的首页，位于 crate 中公有项列表之上，如图 14-2 所示：

![crate 整体注释所渲染的 HTML 文档](https://rustwiki.org/zh-CN/book/img/trpl14-02.png)

图 14-2：包含 `my_crate` 整体描述的注释所渲染的文档

位于项之中的文档注释对于描述 crate 和模块特别有用。使用他们描述其容器整体的目的来帮助 crate 用户理解你的代码组织。

### 2.2 使用 `pub use` 导出合适的公有 API

第 7 章介绍了如何使用 `mod` 关键字来将代码组织进模块中，如何使用 `pub` 关键字将项变为公有，和如何使用 `use` 关键字将项引入作用域。然而你开发时候使用的文件架构可能并不方便用户。你的结构可能是一个包含多个层级的分层结构，不过这对于用户来说并不方便。这是因为想要使用被定义在很深层级中的类型的人可能很难发现这些类型的存在。他们也可能会厌烦要使用 `use my_crate::some_module::another_module::UsefulType;` 而不是 `use my_crate::UsefulType;` 来使用类型。

公有 API 的结构是你发布 crate 时主要需要考虑的。crate 用户没有你那么熟悉其结构，并且如果模块层级过大他们可能会难以找到所需的部分。

好消息是，即使文件结构对于用户来说 **不是** 很方便，你也无需重新安排内部组织：你可以选择使用 `pub use` 重导出（re-export）项来使公有结构不同于私有结构。重导出获取位于一个位置的公有项并将其公开到另一个位置，好像它就定义在这个新位置一样。

例如，假设我们创建了一个描述美术信息的库 `art`。这个库中包含了一个有两个枚举 `PrimaryColor` 和 `SecondaryColor` 的模块 `kinds`，以及一个包含函数 `mix` 的模块 `utils`，如示例 14-3 所示：

文件名: src/lib.rs

```rust
//! # Art
//!
//! A library for modeling artistic concepts.

pub mod kinds {
    /// The primary colors according to the RYB color model.
    pub enum PrimaryColor {
        Red,
        Yellow,
        Blue,
    }

    /// The secondary colors according to the RYB color model.
    pub enum SecondaryColor {
        Orange,
        Green,
        Purple,
    }
}

pub mod utils {
    use crate::kinds::*;

    /// Combines two primary colors in equal amounts to create
    /// a secondary color.
    pub fn mix(c1: PrimaryColor, c2: PrimaryColor) -> SecondaryColor {
        // --snip--
    }
}
```

示例 14-3：一个库 `art` 其组织包含 `kinds` 和 `utils` 模块

`cargo doc` 所生成的 crate 文档首页如图 14-3 所示：

![包含 `kinds` 和 `utils` 模块的 `art`](https://rustwiki.org/zh-CN/book/img/trpl14-03.png)

图 14-3：包含 `kinds` 和 `utils` 模块的库 `art` 的文档首页

注意 `PrimaryColor` 和 `SecondaryColor` 类型、以及 `mix` 函数都没有在首页中列出。我们必须点击 `kinds` 或 `utils` 才能看到他们。

另一个依赖这个库的 crate 需要 `use` 语句来导入 `art` 中的项，这包含指定其当前定义的模块结构。示例 14-4 展示了一个使用 `art` crate 中 `PrimaryColor` 和 `mix` 项的 crate 的例子：

文件名: src/main.rs

```rust
use art::kinds::PrimaryColor;
use art::utils::mix;

fn main() {
    let red = PrimaryColor::Red;
    let yellow = PrimaryColor::Yellow;
    mix(red, yellow);
}
```

示例 14-4：一个通过导出内部结构使用 `art` crate 中项的 crate

示例 14-4 中使用`art` crate 代码的作者不得不搞清楚 `PrimaryColor` 位于 `kinds` 模块、`mix` 位于 `utils` 模块。`art` crate 的模块结构对编写它的开发者更有意义，而不是使用者。对尝试如何使用它的人来说，其内部的 `kinds` 模块和 `utils` 模块的组织结构并没有提供任何有价值的信息。`art` crate 的模块结构因不得不搞清楚所需的内容在何处，以及必须在 `use` 语句中指定模块名称而显得混乱和不便。

为了从公有 API 中去掉 crate 的内部组织，我们可以采用示例 14-3 中的 `art` crate 并增加 `pub use` 语句来重导出项到顶层结构，如示例 14-5 所示：

文件名: src/lib.rs

```rust
//! # Art
//!
//! A library for modeling artistic concepts.

pub use self::kinds::PrimaryColor;
pub use self::kinds::SecondaryColor;
pub use self::utils::mix;

pub mod kinds {
    // --snip--
}

pub mod utils {
    // --snip--
}
```

示例 14-5：增加 `pub use` 语句重导出项

现在此 crate 由 `cargo doc` 生成的 API 文档会在首页列出重导出的项以及其链接，如图 14-4 所示，这使得 `PrimaryColor` 和 `SecondaryColor` 类型和 `mix` 函数更易于查找。

![Rendered documentation for the `art` crate with the re-exports on the front page](https://rustwiki.org/zh-CN/book/img/trpl14-04.png)

图 14-4：`art` 文档的首页，这里列出了重导出的项

`art` crate 的用户仍然可以看见和选择使用示例 14-4 中的内部结构，或者可以使用示例 14-5 中更为方便的结构，如示例 14-6 所示：

文件名: src/main.rs

```rust
use art::PrimaryColor;
use art::mix;

fn main() {
    // --snip--
}
```

示例 14-6：一个使用 `art` crate 中重导出项的程序

对于有很多嵌套模块的情况，使用 `pub use` 将类型重导出到顶级结构对于使用 crate 的人来说将会是大为不同的体验。

创建一个有用的公有 API 结构更像是一门艺术而非科学，你可以反复检视他们来找出最适合用户的 API。`pub use` 提供了解耦组织 crate 内部结构和与终端用户体现的灵活性。观察一些你所安装的 crate 的代码来看看其内部结构是否不同于公有 API。

### 2.3 创建 Crates.io 账号

在你可以发布任何 crate 之前，需要在 [crates.io](https://crates.io/) 上注册账号并获取一个 API token。为此，访问位于 [crates.io](https://crates.io/) 的首页并使用 GitHub 账号登陆。（目前 GitHub 账号是必须的，不过将来该网站可能会支持其他创建账号的方法）一旦登陆之后，查看位于 https://crates.io/me/ 的账户设置页面并获取 API token。接着使用该 API token 运行 `cargo login` 命令，像这样：

```text
$ cargo login abcdefghijklmnopqrstuvwxyz012345
```

这个命令会通知 Cargo 你的 API token 并将其储存在本地的 *~/.cargo/credentials* 文件中。注意这个 token 是一个 **秘密**（**secret**）且不应该与其他人共享。如果因为任何原因与他人共享了这个信息，应该立即到 [crates.io](https://crates.io/) 重新生成这个 token。

### 2.4 发布新 crate 之前

有了账号之后，比如说你已经有一个希望发布的 crate。在发布之前，你需要在 crate 的 *Cargo.toml* 文件的 `[package]` 部分增加一些本 crate 的元信息（metadata）。

首先 crate 需要一个唯一的名称。虽然在本地开发 crate 时，可以使用任何你喜欢的名称。不过 [crates.io](https://crates.io/) 上的 crate 名称遵守先到先得的分配原则。一旦某个 crate 名称被使用，其他人就不能再发布这个名称的 crate 了。请在网站上搜索你希望使用的名称来找出它是否已被使用。如果没有，修改 *Cargo.toml* 中 `[package]` 里的名称为你希望用于发布的名称，像这样：

文件名: Cargo.toml

```toml
[package]
name = "guessing_game"
```

即使你选择了一个唯一的名称，如果此时尝试运行 `cargo publish` 发布该 crate 的话，会得到一个警告接着是一个错误：

```text
$ cargo publish
    Updating registry `https://github.com/rust-lang/crates.io-index`
warning: manifest has no description, license, license-file, documentation,
homepage or repository.
--snip--
error: api errors: missing or empty metadata fields: description, license.
```

这是因为我们缺少一些关键信息：关于该 crate 用途的描述和用户可能在何种条款下使用该 crate 的 license。为了修正这个错误，需要在 *Cargo.toml* 中引入这些信息。

描述通常是一两句话，因为它会出现在 crate 的搜索结果中和 crate 页面里。对于 `license` 字段，你需要一个 **license 标识符值**（*license identifier value*）。[Linux 基金会的 Software Package Data Exchange (SPDX)](http://spdx.org/licenses/) 列出了可以使用的标识符。例如，为了指定 crate 使用 MIT License，增加 `MIT` 标识符：

文件名: Cargo.toml

```toml
[package]
name = "guessing_game"
license = "MIT"
```

如果你希望使用不存在于 SPDX 的 license，则需要将 license 文本放入一个文件，将该文件包含进项目中，接着使用 `license-file` 来指定文件名而不是使用 `license` 字段。

关于项目所适用的 license 指导超出了本书的范畴。很多 Rust 社区成员选择与 Rust 自身相同的 license，这是一个双许可的 `MIT OR Apache-2.0`。这个实践展示了也可以通过 `OR` 分隔为项目指定多个 license 标识符。

那么，有了唯一的名称、版本号、由 `cargo new` 新建项目时增加的作者信息、描述和所选择的 license，已经准备好发布的项目的 *Cargo.toml* 文件可能看起来像这样：

文件名: Cargo.toml

```toml
[package]
name = "guessing_game"
version = "0.1.0"
authors = ["Your Name <you@example.com>"]
edition = "2018"
description = "A fun game where you guess what number the computer has chosen."
license = "MIT OR Apache-2.0"

[dependencies]
```

[Cargo 的文档](https://rustwiki.org/zh-CN/cargo/) 描述了其他可以指定的元信息，他们可以帮助你的 crate 更容易被发现和使用！

### 2.5 发布到 Crates.io

现在我们创建了一个账号，保存了 API token，为 crate 选择了一个名字，并指定了所需的元数据，你已经准备好发布了！发布 crate 会上传特定版本的 crate 到 [crates.io](https://crates.io/) 以供他人使用。

发布 crate 时请多加小心，因为发布是 **永久性的**（*permanent*）。对应版本不可能被覆盖，其代码也不可能被删除。[crates.io](https://crates.io/) 的一个主要目标是作为一个存储代码的永久文档服务器，这样所有依赖 [crates.io](https://crates.io/) 中的 crate 的项目都能一直正常工作。而允许删除版本没办法达成这个目标。然而，可以被发布的版本号却没有限制。

再次运行 `cargo publish` 命令。这次它应该会成功：

```text
$ cargo publish
 Updating registry `https://github.com/rust-lang/crates.io-index`
Packaging guessing_game v0.1.0 (file:///projects/guessing_game)
Verifying guessing_game v0.1.0 (file:///projects/guessing_game)
Compiling guessing_game v0.1.0
(file:///projects/guessing_game/target/package/guessing_game-0.1.0)
 Finished dev [unoptimized + debuginfo] target(s) in 0.19 secs
Uploading guessing_game v0.1.0 (file:///projects/guessing_game)
```

恭喜！你现在向 Rust 社区分享了代码，而且任何人都可以轻松的将你的 crate 加入他们项目的依赖。

### 2.6 发布现存 crate 的新版本

当你修改了 crate 并准备好发布新版本时，改变 *Cargo.toml* 中 `version` 所指定的值。请使用 [语义化版本规则](http://semver.org/) 来根据修改的类型决定下一个版本号。接着运行 `cargo publish` 来上传新版本。

### 2.7 使用 `cargo yank` 从 Crates.io 撤回版本

虽然你不能删除之前版本的 crate，但是可以阻止任何将来的项目将他们加入到依赖中。这在某个版本因为这样或那样的原因被破坏的情况很有用。对于这种情况，Cargo 支持 **撤回**（*yanking*）某个版本。

撤回某个版本会阻止新项目开始依赖此版本，不过所有现存此依赖的项目仍然能够下载和依赖这个版本。从本质上说，撤回意味着所有带有 *Cargo.lock* 的项目的依赖不会被破坏，同时任何新生成的 *Cargo.lock* 将不能使用被撤回的版本。

为了撤回一个 crate，运行 `cargo yank` 并指定希望撤回的版本：

```text
$ cargo yank --vers 1.0.1
```

也可以撤销撤回操作，并允许项目可以再次开始依赖某个版本，通过在命令上增加 `--undo`：

```text
$ cargo yank --vers 1.0.1 --undo
```

撤回 **并没有** 删除任何代码。举例来说，撤回功能并不意在删除不小心上传的秘密信息。如果出现了这种情况，请立即重新设置这些秘密信息。

## 3. Cargo 工作空间

第 12 章中，我们构建一个包含二进制 crate 和库 crate 的包。你可能会发现，随着项目开发的深入，库 crate 持续增大，而你希望将其进一步拆分成多个库 crate。对于这种情况，Cargo 提供了一个叫 **工作空间**（*workspaces*）的功能，它可以帮助我们管理多个相关的协同开发的包。

### 3.1 创建工作空间

**工作空间** 是一系列共享同样的 *Cargo.lock* 和输出目录的包。让我们使用工作空间创建一个项目 —— 这里采用常见的代码以便可以关注工作空间的结构。有多种组织工作空间的方式；我们将展示一个常用方法。我们的工作空间有一个二进制项目和两个库。二进制项目会提供主要功能，并会依赖另两个库。一个库会提供 `add_one` 方法而第二个会提供 `add_two` 方法。这三个 crate 将会是相同工作空间的一部分。让我们以新建工作空间目录开始：

```text
$ mkdir add
$ cd add
```

接着在 *add* 目录中，创建 *Cargo.toml* 文件。这个 *Cargo.toml* 文件配置了整个工作空间。它不会包含 `[package]` 或其他我们在 *Cargo.toml* 中见过的元信息。相反，它以 `[workspace]` 部分作为开始，并通过指定 *adder* 的路径来为工作空间增加成员，如下会加入二进制 crate：

文件名: Cargo.toml

```toml
[workspace]

members = [
    "adder",
]
```

接下来，在 *add* 目录运行 `cargo new` 新建 `adder` 二进制 crate：

```text
$ cargo new adder
     Created binary (application) `adder` project
```

到此为止，可以运行 `cargo build` 来构建工作空间。*add* 目录中的文件应该看起来像这样：

```text
├── Cargo.lock
├── Cargo.toml
├── adder
│   ├── Cargo.toml
│   └── src
│       └── main.rs
└── target
```

工作空间在顶级目录有一个 *target* 目录；`adder` 并没有自己的 *target* 目录。即使进入 *adder* 目录运行 `cargo build`，构建结果也位于 *add/target* 而不是 *add/adder/target*。工作空间中的 crate 之间相互依赖。如果每个 crate 有其自己的 *target* 目录，为了在自己的 *target* 目录中生成构建结果，工作空间中的每一个 crate 都不得不相互重新编译其他 crate。通过共享一个 *target* 目录，工作空间可以避免其他 crate 多余的重复构建。

### 3.2 在工作空间中创建第二个 crate

接下来，让我们在工作空间中指定另一个成员 crate。这个 crate 位于 *add-one* 目录中，所以修改顶级 *Cargo.toml* 为也包含 *add-one* 路径：

文件名: Cargo.toml

```toml
[workspace]

members = [
    "adder",
    "add-one",
]
```

接着新生成一个叫做 `add-one` 的库：

```text
$ cargo new add-one --lib
     Created library `add-one` project
```

现在 *add* 目录应该有如下目录和文件：

```text
├── Cargo.lock
├── Cargo.toml
├── add-one
│   ├── Cargo.toml
│   └── src
│       └── lib.rs
├── adder
│   ├── Cargo.toml
│   └── src
│       └── main.rs
└── target
```

在 *add-one/src/lib.rs* 文件中，增加一个 `add_one` 函数：

文件名: add-one/src/lib.rs

```rust
pub fn add_one(x: i32) -> i32 {
    x + 1
}
```

现在工作空间中有了一个库 crate，让 `adder` 依赖库 crate `add-one`。首先需要在 *adder/Cargo.toml* 文件中增加 `add-one` 作为路径依赖：

文件名: adder/Cargo.toml

```toml
[dependencies]

add-one = { path = "../add-one" }
```

cargo并不假定工作空间中的Crates会相互依赖，所以需要明确表明工作空间中 crate 的依赖关系。

接下来，在 `adder` crate 中使用 `add-one` crate 的函数 `add_one`。打开 *adder/src/main.rs* 在顶部增加一行 `use` 将新 `add-one` 库 crate 引入作用域。接着修改 `main` 函数来调用 `add_one` 函数，如示例 14-7 所示。

文件名: adder/src/main.rs

```rust
use add_one;

fn main() {
    let num = 10;
    println!("Hello, world! {} plus one is {}!", num, add_one::add_one(num));
}
```

示例 14-7：在 `adder` crate 中使用 `add-one` 库 crate

在 *add* 目录中运行 `cargo build` 来构建工作空间！

```text
$ cargo build
   Compiling add-one v0.1.0 (file:///projects/add/add-one)
   Compiling adder v0.1.0 (file:///projects/add/adder)
    Finished dev [unoptimized + debuginfo] target(s) in 0.68 secs
```

为了在顶层 *add* 目录运行二进制 crate，需要通过 `-p` 参数和包名称来运行 `cargo run` 指定工作空间中我们希望使用的包：

```text
$ cargo run -p adder
    Finished dev [unoptimized + debuginfo] target(s) in 0.0 secs
     Running `target/debug/adder`
Hello, world! 10 plus one is 11!
```

这会运行 *adder/src/main.rs* 中的代码，其依赖 `add-one` crate

#### 3.2.1 在工作空间中依赖外部 crate

还需注意的是工作空间只在根目录有一个 *Cargo.lock*，而不是在每一个 crate 目录都有 *Cargo.lock*。这确保了所有的 crate 都使用完全相同版本的依赖。如果在 *Cargo.toml* 和 *add-one/Cargo.toml* 中都增加 `rand` crate，则 Cargo 会将其都解析为同一版本并记录到唯一的 *Cargo.lock* 中。使得工作空间中的所有 crate 都使用相同的依赖意味着其中的 crate 都是相互兼容的。让我们在 *add-one/Cargo.toml* 中的 `[dependencies]` 部分增加 `rand` crate 以便能够在 `add-one` crate 中使用 `rand` crate：

文件名: add-one/Cargo.toml

```toml
[dependencies]
rand = "0.5.5"
```

现在就可以在 *add-one/src/lib.rs* 中增加 `use rand;` 了，接着在 *add* 目录运行 `cargo build` 构建整个工作空间就会引入并编译 `rand` crate：

```text
$ cargo build
    Updating crates.io index
  Downloaded rand v0.5.5
   --snip--
   Compiling rand v0.5.5
   Compiling add-one v0.1.0 (file:///projects/add/add-one)
   Compiling adder v0.1.0 (file:///projects/add/adder)
    Finished dev [unoptimized + debuginfo] target(s) in 10.18 secs
```

现在顶级的 *Cargo.lock* 包含了 `add-one` 的 `rand` 依赖的信息。然而，即使 `rand` 被用于工作空间的某处，也不能在其他 crate 中使用它，除非也在他们的 *Cargo.toml* 中加入 `rand`。例如，如果在顶级的 `adder` crate 的 *adder/src/main.rs* 中增加 `use rand;`，会得到一个错误：

```text
$ cargo build
   Compiling adder v0.1.0 (file:///projects/add/adder)
error: use of unstable library feature 'rand': use `rand` from crates.io (see
issue #27703)
 --> adder/src/main.rs:1:1
  |
1 | use rand;
```

为了修复这个错误，修改顶级 `adder` crate 的 *Cargo.toml* 来表明 `rand` 也是这个 crate 的依赖。构建 `adder` crate 会将 `rand` 加入到 *Cargo.lock* 中 `adder` 的依赖列表中，但是这并不会下载 `rand` 的额外拷贝。Cargo 确保了工作空间中任何使用 `rand` 的 crate 都采用相同的版本。在整个工作空间中使用相同版本的 `rand` 节省了空间，因为这样就无需多个拷贝并确保了工作空间中的 crate 将是相互兼容的。

#### 3.2.2 为工作空间增加测试

作为另一个提升，让我们为 `add_one` crate 中的 `add_one::add_one` 函数增加一个测试：

文件名: add-one/src/lib.rs

```rust
pub fn add_one(x: i32) -> i32 {
    x + 1
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_works() {
        assert_eq!(3, add_one(2));
    }
}
```

在顶级 *add* 目录运行 `cargo test`：

```text
$ cargo test
   Compiling add-one v0.1.0 (file:///projects/add/add-one)
   Compiling adder v0.1.0 (file:///projects/add/adder)
    Finished dev [unoptimized + debuginfo] target(s) in 0.27 secs
     Running target/debug/deps/add_one-f0253159197f7841

running 1 test
test tests::it_works ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out

     Running target/debug/deps/adder-f88af9d2cc175a5e

running 0 tests

test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out

   Doc-tests add-one

running 0 tests

test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out
```

输出的第一部分显示 `add-one` crate 的 `it_works` 测试通过了。下一个部分显示 `adder` crate 中找到了 0 个测试，最后一部分显示 `add-one` crate 中有 0 个文档测试。在像这样的工作空间结构中运行 `cargo test` 会运行工作空间中所有 crate 的测试。

也可以选择运行工作空间中特定 crate 的测试，通过在根目录使用 `-p` 参数并指定希望测试的 crate 名称：

```text
$ cargo test -p add-one
    Finished dev [unoptimized + debuginfo] target(s) in 0.0 secs
     Running target/debug/deps/add_one-b3235fea9a156f74

running 1 test
test tests::it_works ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out

   Doc-tests add-one

running 0 tests

test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out
```

输出显示了 `cargo test` 只运行了 `add-one` crate 的测试而没有运行 `adder` crate 的测试。

如果你选择向 [crates.io](https://crates.io/)发布工作空间中的 crate，每一个工作空间中的 crate 需要单独发布。`cargo publish` 命令并没有 `--all` 或者 `-p` 参数，所以必须进入每一个 crate 的目录并运行 `cargo publish` 来发布工作空间中的每一个 crate。

现在尝试以类似 `add-one` crate 的方式向工作空间增加 `add-two` crate 来作为更多的练习！

随着项目增长，考虑使用工作空间：每一个更小的组件比一大块代码要容易理解。如果它们经常需要同时被修改的话，将 crate 保持在工作空间中更易于协调他们的改变。


## 4. 使用 `cargo install` 从 Crates.io 安装二进制文件

`cargo install` 命令用于在本地安装和使用二进制 crate。它并不打算替换系统中的包；它意在作为一个方便 Rust 开发者们安装其他人已经在 [crates.io](https://crates.io/) 上共享的工具的手段。只有拥有二进制目标文件的包能够被安装。**二进制目标** 文件是在 crate 有 *src/main.rs* 或者其他指定为二进制文件时所创建的可执行程序，这不同于自身不能执行但适合包含在其他程序中的库目标文件。通常 crate 的 *README* 文件中有该 crate 是库、二进制目标还是两者都是的信息。

所有来自 `cargo install` 的二进制文件都安装到 Rust 安装根目录的 *bin* 文件夹中。如果你使用 *rustup.rs* 安装的 Rust 且没有自定义任何配置，这将是 `$HOME/.cargo/bin`。确保将这个目录添加到 `$PATH` 环境变量中就能够运行通过 `cargo install` 安装的程序了。

例如，第 12 章提到的叫做 `ripgrep` 的用于搜索文件的 `grep` 的 Rust 实现。如果想要安装 `ripgrep`，可以运行如下：

```text
$ cargo install ripgrep
Updating registry `https://github.com/rust-lang/crates.io-index`
 Downloading ripgrep v0.3.2
 --snip--
   Compiling ripgrep v0.3.2
    Finished release [optimized + debuginfo] target(s) in 97.91 secs
  Installing ~/.cargo/bin/rg
```

最后一行输出展示了安装的二进制文件的位置和名称，在这里 `ripgrep` 被命名为 `rg`。只要你像上面提到的那样将安装目录加入 `$PATH`，就可以运行 `rg --help` 并开始使用一个更快更 Rust 的工具来搜索文件了！

## 5. Cargo 自定义扩展命令

Cargo 的设计使得开发者可以通过新的子命令来对 Cargo 进行扩展，而无需修改 Cargo 本身。如果 `$PATH` 中有类似 `cargo-something` 的二进制文件，就可以通过 `cargo something` 来像 Cargo 子命令一样运行它。像这样的自定义命令也可以运行 `cargo --list` 来展示出来。能够通过 `cargo install` 向 Cargo 安装扩展并可以如内建 Cargo 工具那样运行他们是 Cargo 设计上的一个非常方便的优点！

## 6. 总结

通过 Cargo 和 [crates.io](https://crates.io/) 来分享代码是使得 Rust 生态环境可以用于许多不同的任务的重要组成部分。Rust 的标准库是小而稳定的，不过 crate 易于分享和使用，并采用一个不同语言自身的时间线来提供改进。不要羞于在 [crates.io](https://crates.io/) 上共享对你有用的代码；因为它很有可能对别人也很有用！
