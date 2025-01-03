# Cargo 包管理器

## 1. 简介

现在主流的编程语言都有自己的包管理器，比如 Python 中的 pip，Java 中的 maven（实际上不是自带的），Rust 作为一根极具开发效率的一门语言，自然也有自己的包管理器 —— Cargo。

Cargo 可以帮助我们创建、编译、检测、测试以及运行 Rust 项目，在编译的过程中，它会隐式地调用 `rustc`。

| 命令                       | 描述                                |
|--------------------------|-----------------------------------|
| cargo new <project_name> | 创建新项目，也可加上 `--lib` 参数             |
| cargo build              | 构建项目，生成二进制可执行文件或库文件               |
| cargo build --release    | 优化 `cargo build` 生成的可执行文件，常用于生产环境 |
| cargo check              | 检测                                |
| cargo test               | 测试                                |
| cargo run                | 运行                                |

## 2. 项目结构

下面我们先用 `cargo new rust_cargo_new_project` 命令来创建一个 Rust 项目，并介绍下整体的项目结构。

```bash
rust_cargo_new_project
├─ src/
│  └─ main.rs  # (1)!
├─ target/  # (2)!
│  ├─ debug/
│  ├─ .rustc_info.json
│  └─ CACHEDIR.TAG
├─ Cargo.toml  # (3)!
├─ Cargo.lock  # (4)!
└─ .gitignore  # (5)!
```

  1. 如果添加 `--lib` 参数创建的库项目，则该文件为 `lib.rs`。
  2. 使用 `cargo build` 命令后才会自动生成
  3. 项目的配置文件
  4. 使用 `cargo build` 命令后才会自动生成，有点像 yarn.lock。
  5. Cargo 会默认给项目生成 .gitignore 文件


### 2.1 Cargo.toml 配置文件

Cargo.toml 文件是使用 `cargo new` 命令创建项目时自动生成的:

```ini linenums="1" title="Cargo.toml 默认配置"
[package]
name = "rust_cargo_new_project"
version = "0.1.0"
edition = "2021"

[dependencies]
```

除了默认配置中的内容，常用的还有 `build-dependencies` 和 `dev-dependencies`，下面我们做一个简单的介绍：

| 参数                 | 描述                                          |
|--------------------|---------------------------------------------|
| package            | 设置项目名称、版本号等                                 |
| dependencies       | 设置项目全局的依赖插件                                 |
| build-dependencies | 编译项目时所需的项目依赖，因为 Rust 很少出现这种依赖问题，所以该配置项用得比较少 |
| dev-dependencies   | 开发者模式编译项目时所需的项目依赖，主要用于测试                    |

更多配置信息请参阅[官方文档](https://doc.rust-lang.org/cargo/reference/manifest.html)。

## 3. 安装 Rust 第三方库

现如今 Python 如此受欢迎很大程度上得益于 PyPI 收录了大量优秀的第三方库，Rust 中也有这样的工具 [Crates](https://crates.io)，它也收录了大量的实用第三方库，一般这些库也会有对应的文档，使用时学习下相关文档即可。下面我们安装一个生成随机数的库 —— Rand，并编写一段简单的程序。

!!! warning "插件名称与系统有关" 
    
    对于 Windows 系统而言，可能某些插件名称与 Unix 不太一样，这个需要注意下避坑。

### 3.1 修改配置文件

我们可以在 Cargo.toml 配置文件添加 `Rand` 依赖，在编译时 Cargo 则会自动帮我们安装，非常方便。

???+ example "使用 Rand 生成随机数"

    === "参考示例"

        ```rust linenums="1"
        use rand::prelude::*;

        fn main() {
            if rand::random() { // generates a boolean
                // Try printing a random unicode code point (probably a bad idea)!
                println!("char: {}", rand::random::<char>());
            }

            let mut rng = rand::thread_rng();
            let _y: f64 = rng.gen(); // generates a float between 0 and 1
            
            let mut nums: Vec<i32> = (1..100).collect();
            nums.shuffle(&mut rng);
        }
        ```
  
    === "安装 Rand 库"

        ```ini linenums="1" hl_lines="7" title="Cargo.toml"
        [package]
        name = "rust_cargo_project"
        version = "0.1.0"
        edition = "2021"

        [dependencies]
        rand = "0.8.5"
        ```

### 3.2 添加依赖

另外一种方式就是像 Python 中 `pip install` 的方式一样手动安装插件，通过 `cargo add` 来进行安装，{++并且 Cargo 会根据执行命令自动将依赖追加到 Cargo.toml 文件++}：

```bash
# 安装最新的插件
cargo add rand
cargo add --build rand
cargo add --dev rand

# 安装指定版本的插件
cargo add rand@0.7.0
```

!!! tip "提示没有 cargo add 命令"
    如果你安装的是早期的 Rust 版本，那么 Cargo 可能没有 `add` 命令，我们需要先通过 `cargo install cargo-edit` 安装 Cargo-Edit 插件，安装后就可以使用 `cargo add` 命令来安装插件了，具体可以参阅 [Cargo-Edit](https://github.com/killercup/cargo-edit/blob/master/README.md#available-subcommands)。

删除安装的依赖也非常简单，直接使用如下命令卸载掉 Rand 插件，卸载完成后 Cargo.toml 文件也会同步更新。

```bash
# 如果安装了 Cargo-Edit，那么请使用 cargo rm rand
cargo remove rand
```

## 4. 设置国内安装源

和 Python 中 pip 一样，安装第三方库时可能会遇到下载速度慢的问题，这里推荐给 Cargo 设置下国内安装源 —— [RsProxy](https://rsproxy.cn)。

在配置文件中添加如下内容，如果没有此文件的话请手动创建一个:

```ini linenums="1" title="~/.cargo/config"
[source.crates-io]
replace-with = 'rsproxy-sparse'
[source.rsproxy]
registry = "https://rsproxy.cn/crates.io-index"
[source.rsproxy-sparse]
registry = "sparse+https://rsproxy.cn/index/"
[registries.rsproxy]
index = "https://rsproxy.cn/crates.io-index"
[net]
git-fetch-with-cli = true
```
