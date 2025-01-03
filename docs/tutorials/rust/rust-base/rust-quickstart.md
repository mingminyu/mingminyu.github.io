
# Rust 快速入门

## 1. 安装

Rust 的安装在其[官方文档](https://www.rust-lang.org/tools/install) 上有非常详细的说明，整个安装过程也非常简单，当然不同系统的安装方式略有差异。

!!! info ""

    === "Windows"

        对于 Windows 而言，下载[最新的安装包](https://static.rust-lang.org/rustup/dist/x86_64-pc-windows-msvc/rustup-init.exe)，或者访问[安装包下载页面](https://forge.rust-lang.org/infra/other-installation-methods.html)下载对应的安装包，通过图形化的操作进行安装即可。不推荐使用 GNU 版本的 Rust
        
        值得注意的是，安装过程中可能需要我们安装 [Visual Studio C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools) 依赖。

    === "Unix(WSL也适用)"
        
        打开终端输入执行以下命令:

        ```bash
        curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
        source "$HOME/.cargo/env"
        ```

## 2. rustup 简单使用

### 2.1 Rust 更新、卸载、安装组件

`rustup` 是 Rust 自带的一个终端 CLI，我们通过此命令完成 Rust 的更新、卸载、组件安装以及版本查看:

| 命令                           | 描述         |
|------------------------------|------------|
| rustup update                | 更新 Rust    |
| rustup self uninstall        | 卸载 Rust    |
| rustup component add rustfmt | 添加 Rust 组件 |


### 2.2 Stable和Nightly版本

Rust 有 Stable 和 Nightly 两种版本，这里做个简单说明:

- **Stable**: 最稳定和可靠的版本，适用于大多数生产环境的应用程序。Rust 的稳定版经过了大量的测试和验证，确保了向后兼容性，这意味着你编写的代码在未来稳定版中也仍然可以运行。
- **Nightly**: 所构建的最新开发版本，包含了 Rust 最新的功能和实验性质的特性，当然也会存在一些 bug。Nightly 版本不适用于生产环境，但喜欢跟进 Rust 一些最新功能的同学可以尝试下。


!!! note ""

    === "安装Rust Stable"

        ```bash
        rustup install stable
        ```

    === "安装Rust Nightly"

        ```bash
        rustup install nightly
        ```

    === "设置默认版本"

        ```bash
        rustup default stable  # nightly
        ```

### 2.3 rustup 常用命令

`rustup` 有很多可用的命令，可以通过 `rustup --help` 进行查看，后续会有专门整理一篇文章介绍开发中常用的其他命令:

| 命令               | 描述           |
|-------------------|--------------|
| rustup --version | 查看 rustup 版本 |
| rustup --help    | rustup 的帮助文档 |
| rustup show      | 查看 Rust 版本信息 |

## 3. 编译器

Java 中使用 `javac` 来编译文件，Rust 中也是类似，对应的命令为 `rustc`，我们可以通过 `rustc --version` 来查看编译器的版本信息。通过 `rustc` 命令可以帮我们将 .rs 文件进行编译，也可以编译库文件。

!!! note "编译 .rs 文件"

    === "编译二进制执行文件"

        ```bash
        rustc -o test test.rs
        ```

    === "编译库文件"

        ```bash
        rustc --create-type lib test.rs
        ```

## 4. 第一个Rust程序

接下来，我们开始编写第一个 Rust 程序，和很多 Hello World 一样，这段程序最终输出 “Hello, Rust!”。

```rust linenums="1" title="main.rs"
fn main() {
    println!("Hello, Rust!")
}
```

在终端中执行如下命令进行编译，编译成功后应该会看到一个 **main** 文件 (1)。
{ .annotate }

  1. 注意是不带 .rs 后缀名的

```bash title="编译 main.rs"
rustc main.rs  # (1)!
```

  1. 默认情况下是编译生成与 .rs 同名且不带后缀名的执行文件，当然我们也可以自己通过 `-o` 来指定生成的文件名。

接下来我们执行编译后二进制执行文件，就可以看到 “Hello, Rust!” 的内容输出:

```bash title="执行 main 程序"
./main
```

## 5. 开发环境搭建

常见的 Rust 开发环境有 VS Code 或者 RustRover(由 JetBrains 出品)，对于使用 VS Code 作为 Rust 开发 IDE 的同学，并建议安装 `rust-analyzer` 和 `Error Lens` 插件。

## 6. 包管理

现在主流的编程语言都有自己的包管理器，例如 Python 中的 `pip`，Java 中的 `maven`（实际上不是自带的）。Rust 作为一根极具开发效率的一门语言，自然也有强大的包管理器 —— Cargo。

使用 Cargo 可以帮助我们创建、编译、检测、测试以及运行 Rust 项目，在编译的过程中，它会隐式地调用 `rustc` 命令。下面对于 cargo 的使用介绍比较简单，下一小节我们会专门对 cargo 的各种使用方式做一个更详细的介绍。

| 命令                       | 描述                                | 
|--------------------------|-----------------------------------|
| cargo new <project_name> | 创建新项目，也可加上 `--lib` 参数             |
| cargo build              | 构建项目，生成二进制可执行文件或库文件               |
| cargo build --release    | 优化 `cargo build` 生成的可执行文件，常用于生产环境 |
| cargo check              | 检测                                |
| cargo test               | 测试                                |
| cargo run                | 运行                                |
