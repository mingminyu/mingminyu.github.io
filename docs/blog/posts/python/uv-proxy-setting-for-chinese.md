---
date: 2025-06-12
authors:
  - mingminyu
categories:
  - 环境搭建
tags:
  - Huey
slug: uv-proxy-setting-for-chinese
readtime: 2
---

# 国内使用UV的代理设置

> 原文地址：https://www.yangyanxing.com/article/uv-proxy-setting

## 1. 安装第三方包时的镜像设置

在使用 `uv add` 命令安装第三方包时，有两种方法可以设置国内加速镜像：

### 1.1 命令行中指定镜像

使用 `--index` 或者 `--default-index` 参数指定镜像地址，例如：

```bash linenums="1"
uv add fastapi --index https://mirrors.aliyun.com/pypi/simple/

uv add fastapi --default-index https://mirrors.aliyun.com/pypi/simple/
```

简单说明下两者的区别：

| 参数 | 环境变量 | 描述 |
| --- | --- | --- |
| `--index` | `UV_INDEX` |  可以设置多个索引源，多个索引源之间以空格分开，适用于同时使用多个索引源 |
| `--default-index` | `UV_DEFAULT_INDEX` | 只设置一个索引源，用于替换默认的 PyPI 源 |

一般情况下，我们只需配置 `UV_DEFAULT_INDEX` 即可，常用的镜像源有：

- 清华源: https://mirrors.tuna.tsinghua.edu.cn/pypi/web/simple
- 阿里源: https://mirrors.aliyun.com/pypi/simple/

### 1.2 设置环境变量

可以在 `.bashrc` 文件中添加环境变量 `UV_INDEX` 和 `UV_DEFAULT_INDEX`，然后执行 `source .bashrc` 使其生效。

## 2. 安装 Python 时的镜像设置

UV 提供了通过 GitHub Releases 下载 Python 的功能，可以通过以下 `--mirror` 和 `--pypy-mirror` 两个参数和环境变量来设置镜像：

- `--mirror`: 用于设置 CPython 的安装包镜像，可以通过设置环境变量 `UV_PYTHON_INSTALL_MIRROR` 来指定下载镜像。
- `--pypy-mirror`: 用于设置 PyPy 的安装包镜像，可以通过设置环境变量 `UV_PYPY_INSTALL_MIRROR` 来指定下载镜像。


| 维度           | CPython                          | PyPy          |
| -------------- | -------------------| --------------------------------------------- |
| 实现语言       | C 语言编写，官方标准解释器       | RPython 编写，基于 JIT 编译技术               |
| 性能表现       | 解释执行字节码，性能较低         | JIT 编译热点代码为机器码，性能提升 3-4 倍     |
| 内存管理       | 引用计数 + GIL，存在内存碎片问题 | 增量垃圾回收 + 分代回收，无 GIL 限制          |
| 并发支持       | 单线程并发（GIL 限制多线程性能） | 支持微线程（Stackless 模型），适合高并发场景  |
| 生态系统兼容性 | 完整支持所有 Python 库           | 兼容大部分纯 Python 库，对 C 扩展库支持有限   |
| 典型应用场景   | Web 服务、自动化脚本、科学计算   | 数值计算、长时间运行的服务、高并发 API 服务器 |
| 启动时间       | 快速启动                         | 需 JIT 预热期                                 |

!!! info ""

    目前国内还没有一个完全同步的下载镜像，所以使用 `uv python install` 下载非常慢，南京大学的镜像站提供了 UV 的最新下载：https://mirror.nju.edu.cn/github-release/indygreg/python-build-standalone

## 3. 总结

- **UV_PYTHON_INSTALL_MIRROR**：用于设置使用 `uv python install` 命令下载安装 Python 时的镜像。
- **UV_DEFAULT_INDEX**：用于设置使用 `uv add` 命令安装第三方包时的镜像。
- **UV_INDEX**：用于设置额外的安装镜像，如公司内部的包索引地址。

**建议**：如果你的网络环境可以正常访问 GitHub，则无需设置镜像。如果访问不了，可以设置南京大学的下载镜像，并配置 `UV_DEFAULT_INDEX` 为阿里源或清华源来加速 `uv add`（等同于 `pip install`）的安装过程。

通过合理设置镜像源，可以显著提升在国内使用 UV 进行软件包管理和 Python 安装的效率。
