# 第一章：入门指南


让我们开始 Rust 之旅吧！有很多内容需要学习，但每次旅程总有起点。在本章中，我们会讨论：

- 在 Linux、macOS 和 Windows 上安装 Rust
- 编写一个打印 `Hello, world!` 的程序
- 使用 `cargo`，这是 Rust 的包管理器和构建系统

## 1. 安装

第一步是安装 Rust。我们将通过 `rustup` 来下载 Rust，这是一个管理 Rust 版本和相关工具的命令行工具。这需要互联网连接才能下载。

!!! warning "注意"

    如果你出于某些原因不想用 `rustup`，请参阅 [Rust 其他安装方法的页面](https://forge.rust-lang.org/infra/other-installation-methods.html)了解更多选项。

下面步骤将安装 Rust 编译器的最新稳定版本。Rust 的稳定性保证可确保本书中所有能编译的示例在更新的 Rust 版本中能够继续通过编译。不同版本之间的输出可能会略有不同，因为 Rust 经常会改进错误消息和警告。也就是说，任何通过这些步骤安装的较新稳定版本的 Rust 应该都可以正常运行本书的内容。

!!! note "命令行符号"
    
    在本章以及整本书中，我们将展示一些在终端中使用的命令。在终端中输入的行均以 `$` 开头，你不需输入 `$` 字符；它表示每个命令的开始。不以 `$` 开头的行通常表示上一个命令的输出内容。另外，专用于 PowerShell 的示例将使用 `>` 而不是 `$`。

### 1.1 在 Linux 或 macOS 上安装 `rustup`

如果你使用的是 Linux 或 macOS，打开终端并输入下面命令：

```console
$ curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh
```

这个命令将下载一个脚本并开始安装 `rustup` 工具，此工具将安装 Rust 的最新稳定版本。可能会提示你输入密码。如果安装成功，将出现下面这行：

```text
Rust is installed now. Great!
```

此外，你还需要一个链接器（linker），这是 Rust 用来将其编译的输出关联到一个文件中的程序。很可能你已经有一个了。如果你遇到了链接器错误，请尝试安装一个 C 编译器，其通常包括一个链接器。C 编译器也很有用，因为一些常见的 Rust 包依赖于 C 代码，因此需要安装一个 C 编译器。

在 macOS 上，可运行以下命令获得 C 编译器：

```console
$ xcode-select --install
```

Linux 用户一般应按照相应发行版的文档来安装 GCC 或 Clang。例如，如果你使用 Ubuntu，则可安装 `build-essential` 包。

### 1.2 在 Windows 上安装 `rustup`

在 Windows 上，访问 https://www.rust-lang.org/zh-CN/tools/install 页面并按照说明安装 Rust。在安装过程的某个步骤，你可能会收到一条消息，提示你还需要适用于 Visual Studio 2013 或更高版本的 C++ 的构建工具（C++ build tools）。获取这些构建工具的最简单方法是安装 [Visual Studio 2019 的构建工具](https://visualstudio.microsoft.com/visual-cpp-build-tools/)。当被问及要安装哪些内容时，请确保已选择 “C++ build tools”，并包括 Windows 10 SDK 和英文语言包。

本书的其余部分使用的命令行在 `cmd.exe` 和 `PowerShell` 中都可以运行。如果有特定差异，我们将说明使用哪个。

### 1.3 更新和卸载

通过 `rustup` 安装 Rust 后，更新到最新版本很简单。在 shell 中运行以下更新命令：

```console
$ rustup update
```

要卸载 Rust 和 `rustup`，在 shell 中运行以下卸载命令：

```console
$ rustup self uninstall
```

### 1.4 疑难解答

要检查是否正确安装了 Rust，可打开 shell 并输入下面这行：

```console
$ rustc --version
```

你应该看到最新发布的稳定版本的版本号、提交哈希值和提交日期，如下所示格式：

```text
rustc x.y.z (abcabcabc yyyy-mm-dd)
```

如果你看到此信息，则说明您已成功安装 Rust！如果没看到此信息，并且你使用的是 Windows，请检查 Rust 是否在 `%PATH%` 系统变量中。如果都正确，但 `Rust` 仍然无法正常工作，那么你可以在很多地方获得帮助。最简单的是去 [Rust 官方 Discord](https://discord.gg/rust-lang) 的 #beginners 频道 。在这里，你可以和其他 Rustacean（Rust 用户，自嘲的昵称）聊天并寻求帮助。其他不错的资源还有 [Rust 用户论坛](https://users.rust-lang.org/)和 [Stack Overflow](https://stackoverflow.com/questions/tagged/rust)。

### 1.5 本地文档

Rust 的安装还自带文档的本地副本，可以方便地离线阅读。运行 `rustup doc` 让浏览器打开本地文档。每当遇到标准库提供的类型或函数不知道怎么用时，都可以在 API 文档中查找到！

## 2. Hello, world!

我们已经安装好了 Rust，接着编写第一个 Rust 程序。按照传统，在学习一门新语言时都会编写一个输出“Hello, world!”（你好，世界）的简单程序，本章我们也是如此。

!!! warning "注意"

    本书假定你已经熟悉基本的命令行。Rust 本身对编辑器、工具或代码存放的位置都没有特殊要求。所以要是你更喜欢 IDE 而不是命令行的话，可以随意选用你喜爱的 IDE。目前很多 IDE 都提供了一定程度的 Rust 支持。有关详细信息，请查看 IDE 的文档。最近，Rust 团队一直致力于提供出色的 IDE 支持，并且在这方面取得了迅速的进步！

### 2.1 创建项目目录

首先，创建一个存放 Rust 代码的目录。Rust 不关心代码存放的位置，但是对于本书中的练习和项目，我们建议在操作系统的主目录（home，在 Windows 下即用户目录）中创建一个 *projects* 目录，并保存你的全部项目。

打开终端，输入下面命令来创建 *projects* 目录，以在此目录里面创建 “Hello, world!” 项目目录。



=== "Linux/MacOS"

    ```console
    $ mkdir ~/projects
    $ cd ~/projects
    $ mkdir hello_world
    $ cd hello_world
    ```

=== "Windows"

    ```cmd
    > mkdir "%USERPROFILE%\projects"
    > cd /d "%USERPROFILE%\projects"
    > mkdir hello_world
    > cd hello_world
    ```

### 2.2 编写和运行 Rust 程序

接下来，创建一个源文件并命名为 *main.rs*。Rust 文件通常以 *.rs* 扩展名结尾。如果文件名中使用了多个单词，请使用下划线将它们隔开。例如，命名为 *hello_world.rs*，而不是 *helloworld.rs*。

现在打开刚创建好的 *main.rs* 文件，输入如下代码，完成打印 `Hello, world!` 的程序。
。

```rust title="main.rs" linenums="1"
fn main() {
    println!("Hello, world!");
}
```

保存文件，并回到终端窗口。在 Linux 或 macOS 上，输入以下命令，编译并运行文件：

=== "Linux/MacOS"

    ```console
    $ rustc main.rs
    $ ./main
    Hello, world!
    ```

=== "Windows"

    在 Windows 上，输入 `.\main.exe` 来代替 `./main`：

    ```powershell
    > rustc main.rs
    > .\main.exe
    Hello, world!
    ```

不管你使用哪种操作系统，该字符串 `Hello, world!` 都应打印到了终端上。如果看不到此输出，请参考“安装”小节的[“疑难解答”](https://rustwiki.org/zh-CN/book/ch01-01-installation.html#troubleshooting)小节来查找解决方法。

如果 `Hello, world!` 打印成功，那么祝贺你！你已经正式编写了一个 Rust 程序。你已经成为了一名 Rust 开发者——欢迎加入 Rust 大家庭！

### 2.3 Rust 程序剖析

让我们详细回顾一下 “Hello, world!” 程序发生了什么。这是拼图的第一块:

```rust
fn main() {

}
```

这几行定义了 Rust 的函数。`main` 函数（也称为主函数）很特殊：它始终是每个可执行 Rust 程序中运行的第一个代码。第一行声明一个名为 `main` 的函数，不带参数也没有返回值。如果有参数，那么它们的名字会放到括号内，它们将放在括号 `()` 内。

另外，请注意，函数主体用大括号 `{}` 括起来。Rust 需要函数体的所有内容都被括号包围起来。一种好的代码风格是将左大括号放在函数声明的同一行，且之间带有一个空格。

如果想在 Rust 项目中坚持标准代码风格，则可以使用自动格式化程序工具 `rustfmt` 来将代码格式化为特定风格。Rust 团队已将此工具包含在标准 Rust 发行版中（如 `rustc`），因此它应该已经安装在你的计算机上！更多相关详细信息，请查看在线文档。

`main` 函数内部是以下代码：

```rust linenums="1" hl_lines="1"
#![allow(unused)]
fn main() {
    println!("Hello, world!");
}
```

该行完成了此简单程序中的所有工作：它将文本打印到屏幕上。这里有 4 个要注意的重要细节。

1. Rust 风格的缩进使用 4 个空格，而不是制表符。

2. `println!` 调用 Rust 宏。如果改为调用函数，则应该将其输入为 `println`（不含 `!`）。我们将在第 19 章中更详细地讨论 Rust 宏。现在只需要知道，当看到一个 `!`，则意味着调用的是宏而不是普通的函数。

3. 你看到 `"Hello, world!"` 字符串。我们将这个字符串作为参数传递给 `println!`，接着 `println!` 将字符串打印到屏幕上。

4. 我们用分号（`;`，注意这是英文分号）结束该行，这表明该表达式已结束，下一个表达式已准备好开始。Rust 代码的大多数行都以一个 `;` 结尾。

### 2.4 编译和运行是独立的步骤

刚才我们运行一个新创建的程序。现在我们将分解这个过程，并检查每个步骤。在运行 Rust 程序之前，必须使用 Rust 编译器来编译它，输入 `rustc` 命令并传入源文件的名称，如下所示：

```console
$ rustc main.rs
```

如果有 C 或 C++ 语言基础，你会注意到这点和 `gcc` 或 `clang` 类似。编译成功后，Rust 就会输出一个二进制可执行文件。

在 Linux、macOS 或 Windows 的 PowerShell 中，可通过输入 `ls` 命令来查看可执行文件。在 Linux 和 macOS 中，你将看到两个文件。使用 Windows 的 PowerShell，你将看到与使用 CMD 相同的三个文件。

=== "Linux/MacOS"

    ```console
    $ ls
    main  main.rs
    ```

=== "Windows"

    ```cmd linenums="1" hl_lines="3"
    > dir /B %= the /B option says to only show the file names =%
    main.exe
    main.pdb
    main.rs
    ```

这显示了带有 *.rs* 扩展名的源代码文件，可执行文件（在 Windows 上是 *main.exe*，在所有其他平台上是 *main*），以及在使用 Windows 时包含一个带有 *.pdb* 扩展名的调试信息的文件。在这里，运行 *main* 或 *main.exe* 文件，如下所示：

```console
$ ./main # or .\main.exe on Windows
```

如果 *main.rs* 是 “Hello, world!” 程序，这将会打印 `Hello, world!` 到终端上。

如果你只熟悉动态语言，如 Ruby、Python 或 JavaScript，你很可能不习惯分多个步骤来编译和运行程序的方式。Rust 是一门 **预编译** (*ahead-of-time compiled*) 语言，这意味着你可以编译一个程序，将编译后的可执行文件给别人，即使他们没有安装 Rust 也可以运行程序。如果你为其他人提供 *.rb*、*.py* 或 *.js* 文件，那么对方也需要分别安装对应 Ruby、Python 或 JavaScript 的语言支持环境。但是在这些语言中，只需要一条命令来编译和运行程序。一切都是语言设计权衡的结果。

使用 `rustc` 编译对简单的程序可以轻松胜任，但随着项目的增长，你将会想要管理项目中所有相关内容，并想让其他用户和项目能够容易共享你的代码。接下来，我们将引入 Cargo 工具，这将帮助你学会编写真实开发环境的 Rust 程序。

## 3. Hello, Cargo!

Cargo 是 Rust 的构建系统和包管理器。大多数 Rustacean 们使用 Cargo 来管理他们的 Rust 项目，因为它可以为你处理很多任务，比如构建代码、下载依赖库，以及编译这些库。（我们把代码所需要的库叫做 **依赖**（*dependency*））。

最简单的 Rust 程序（如我们刚刚编写的）不含任何依赖。所以如果使用 Cargo 来构建 “Hello, world!” 项目，将只会用到 Cargo 构建代码的那部分功能。在编写更复杂的 Rust 程序时，你将添加依赖项，如果使用 Cargo 启动项目，则添加依赖项将更容易。

由于绝大多数 Rust 项目使用 Cargo，本书接下来的部分假设你也使用 Cargo。如果使用[“安装”](https://rustwiki.org/zh-CN/book/ch01-01-installation.html#安装) 部分介绍的官方安装包的话，则自带了 Cargo。如果通过其他方式安装的话，可以在终端输入如下命令检查是否安装了 Cargo：

```console
$ cargo --version
```

如果你看到了版本号，说明安装成功！如果看到类似 `command not found` 的错误，你应该查看相应安装文档以确定如何单独安装 Cargo。

### 3.1 使用 Cargo 创建项目

我们使用 Cargo 创建一个新项目，然后看看与上面的 Hello, world! 项目有什么不同。回到 *projects* 目录（或者你存放代码的目录）。接下来，可在任何操作系统下运行以下命令：

```console linenums="1"
$ cargo new hello_cargo
$ cd hello_cargo
```

第一行命令新建了名为 *hello_cargo* 的目录。我们将项目命名为 *hello_cargo*，同时 Cargo 在一个同名目录中创建项目文件。

进入 *hello_cargo* 目录并列出文件。将会看到 Cargo 生成了两个文件和一个目录：一个 *Cargo.toml* 文件，一个 *src* 目录，以及位于 *src* 目录中的 *main.rs* 文件。

它也在 *hello_cargo* 目录初始化了一个 Git 仓库，并带有一个 *.gitignore* 文件。如果在现有的 Git 仓库中运行 `cargo new`，则不会生成 Git 文件；但你可以使用 `cargo new --vcs=git` 来无视此限制，强制生成 Git 文件。

!!! info "Git简介"

    Git 是一个常用的版本控制系统（version control system， VCS）。可以通过 `--vcs` 参数使 `cargo new` 切换到其它版本控制系统，或者不使用 VCS。运行 `cargo new --help` 查看可用的选项。

使用你喜欢的文本编辑器打开 *Cargo.toml* 文件，它应该看起来如下所示：

```toml title="Cargo.toml" linenums="1"
[package]
name = "hello_cargo"
version = "0.1.0"
edition = "2021"

[dependencies]
```

此文件使用 [*TOML*](https://toml.io/) (*Tom's Obvious, Minimal Language*) 格式，这是 Cargo 配置文件的格式。

1. `[package]` 是一个表块（section）标题，表明下面的语句用来配置一个包（package）。随着我们在这个文件增加更多的信息，还将增加其他表块。

2. 接下来的三行设置了 Cargo 编译程序所需的配置：项目的名称、版本，以及使用的 Rust 大版本号（edition，区别于 version）。[附录 E](https://rustwiki.org/zh-CN/book/appendix-05-editions.html) 会介绍 `edition`（译注：Rust 的核心版本，即 2015、2018、2021 版等） 的值。

3. `[dependencies]` 是一个表块的开头，你可以在其中列出你的项目所依赖的任何包。在 Rust 中，代码包被称为 *crate*。这个项目并不需要其他的 crate，不过在第 2 章的第一个项目会用到依赖，那时会用得上这个表块。

现在打开 *src/main.rs* 看看：

```rust title="src/main.rs" linenums="1"
fn main() {
    println!("Hello, world!");
}
```

Cargo 生成了一个 “Hello, world!” 程序，正如我们之前编写的示例 1-1！到目前为止，之前项目与 Cargo 生成项目的区别是，Cargo 将代码放在 *src* 目录，同时项目根目录包含一个 *Cargo.toml* 配置文件。

Cargo 期望源文件位于 *src* 目录中。项目根目录只存放说明文件（README）、许可协议（license）信息、配置文件和其他跟代码无关的文件。使用 Cargo 可帮助你保持项目干净整洁。这里为一切事物所准备，一切都位于正确的位置。

对于没有使用 Cargo 开始的项目，比如我们之前创建的 Hello,world! 项目，你可以将其转化为一个 Cargo 项目。将代码放入 *src* 目录，并创建一个合适的 *Cargo.toml* 文件。

### 3.2 构建并运行 Cargo 项目

现在让我们看看通过 Cargo 构建和运行 “Hello, world!” 程序有什么不同！在 *hello_cargo* 目录下，输入下面的命令来构建项目：

```console
$ cargo build
   Compiling hello_cargo v0.1.0 (file:///projects/hello_cargo)
    Finished dev [unoptimized + debuginfo] target(s) in 2.85 secs
```

这个命令会在 *target/debug/hello_cargo* 下创建一个可执行文件（在 Windows 上是 *target\debug\hello_cargo.exe*），而不是放在目前目录下。你可以使用下面的命令来运行它：

```console
$ ./target/debug/hello_cargo # 或者在 Windows 下为 .\target\debug\hello_cargo.exe
Hello, world!
```

如果一切顺利，终端上应该会打印出 `Hello, world!`。首次运行 `cargo build` 时，也会使 Cargo 在项目根目录创建一个新文件：*Cargo.lock*。这个文件记录项目依赖的实际版本。这个项目并没有依赖，所以其内容比较少。您不需要手动更改这个文件，Cargo 会为您管理好它。

我们刚刚使用 `cargo build` 构建了项目，并使用 `./target/debug/hello_cargo` 运行了程序，但是，我们也可以使用 `cargo run` 命令，一次性完成代码编译和运行的操作：

```console
$ cargo run
    Finished dev [unoptimized + debuginfo] target(s) in 0.0 secs
     Running `target/debug/hello_cargo`
Hello, world!
```

注意这一次并没有出现表明 Cargo 正在编译 `hello_cargo` 的输出。Cargo 发现文件并没有被改变，就直接运行了二进制文件。如果修改了源文件的话，Cargo 会在运行之前重新构建项目，并会出现像这样的输出：

```console
$ cargo run
   Compiling hello_cargo v0.1.0 (file:///projects/hello_cargo)
    Finished dev [unoptimized + debuginfo] target(s) in 0.33 secs
     Running `target/debug/hello_cargo`
Hello, world!
```

Cargo 还提供了一个名为 `cargo check` 的命令。该命令快速检查代码确保其可以编译，但并不产生可执行文件：

```console
$ cargo check
   Checking hello_cargo v0.1.0 (file:///projects/hello_cargo)
    Finished dev [unoptimized + debuginfo] target(s) in 0.32 secs
```

为什么你会不需要可执行文件呢？通常，`cargo check` 要比 `cargo build` 快得多，因为它省略了生成可执行文件的步骤。如果你在编写代码时不断检查你的代码，那么使用 `cargo check` 命令可以加快这个过程！为此很多 Rustacean 编写代码时会定期运行 `cargo check` 以确保它们可以编译。当准备好使用可执行文件时才运行 `cargo build`。

我们回顾下已学习的 Cargo 内容：

- 可以使用 `cargo build` 构建项目。
- 可以使用 `cargo run` 一步构建并运行项目。
- 可以使用 `cargo check` 构建项目而无需生成二进制文件来检查错误。
- Cargo 会将构建结果保存到 *target/debug* 目录，而不是源码所在的目录。

使用 Cargo 的一个额外的优点是，不管你使用什么操作系统，其命令都是一样的。所以从现在开始本书将不再为 Linux 、macOS 或 Windows 提供平台特定的命令。

### 3.3 发布构建

当项目最终准备好发布时，可以使用 `cargo build --release` 来优化编译项目。这会在 *target/release* 而不是 *target/debug* 下生成可执行文件。这些优化可以让 Rust 代码运行的更快，不过启用这些优化也需要消耗更长的编译时间。这也就是为什么会有两种不同的配置：一种是为了开发，你需要经常快速重新构建；另一种是为用户构建最终程序，它们不会经常重新构建，并且希望程序运行得越快越好。如果你要对代码运行时间进行基准测试，请确保运行 `cargo build --release` 并使用 *target/release* 下的可执行文件进行测试。

### [把使用 Cargo 当作习惯](https://rustwiki.org/zh-CN/book/ch01-03-hello-cargo.html#把使用-cargo-当作习惯)

对于简单项目而言，使用 Cargo 和直接使用 `rustc` 相比并没有太大的优势，但是在程序变得更加复杂时，它会证明自己的价值。对于拥有多个 crate 的复杂项目，交给 Cargo 来协调构建将简单得多。

尽管 `hello_cargo` 项目很简单，其所使用的很多实用工具，在你将来的 Rust 生涯中也会用得到。其实，要在已存在的项目上构建，可以使用以下命令，通过 Git 检出代码，进入到该项目目录并构建：

```console
$ git clone example.org/someproject
$ cd someproject
$ cargo build
```

关于更多 Cargo 的信息，请查阅[相应文档](https://rustwiki.org/zh-CN/cargo/)。

## 4. 总结

你已准备好开启 Rust 之旅了！在本章，你学习了：

- 使用 `rustup` 安装最新稳定版的 Rust
- 更新到新版的 Rust
- 打开本地安装的文档
- 直接通过 `rustc` 编写并运行 “Hello, world!” 程序
- 使用 Cargo 的惯例来创建和运行一个新项目

是时候通过构建更强大的程序来熟悉阅读和编写 Rust 代码了。所以在第 2 章，我们会构建一个猜数字游戏程序。如果你更希望从学习 Rust 常用的编程概念开始，请阅读第 3 章，接着再回到第 2 章。
