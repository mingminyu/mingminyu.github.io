# Python安装

Python 作为一种跨平台的语言，支持 Linux、MacOS 以及 Windows 操作系统，每个系统都有现成的安装包，安装步骤也非常简单。

## 1. 选择合适的安装包

Python 安装包非常多，常见的有官方的装包、Miniconda / Anaconda 集成安装包，作为一个 Python 老鸟，新手学习我只推荐 Miniconda。

| 安装包 | 优点 | 缺点 |
| --- | --- | --- |
| 官方 | 体积非常小 | 安装一些底层C或者C++编译包非常困难，学习第三方库时对新手非常不友好 |
| [Anaconda](https://www.anaconda.com/download/success) | 集成了 Python、**Conda**、Spyder 等常用工具，且已经集成常用的一些第三方库，Conda 在安装一些第三方库时非常有用 | 1.安装包体积较大，下载、安装甚至卸载速度都很慢。<br>2.虽然自带了 IDE 编辑器，但非常难用；<br>3.过多地集成了第三方库，其实很多库老手很长时间都不一定会用到 |
| [Miniconda](https://www.anaconda.com/download/success) | 最小化 Python 运行环境以及 Conda 工具，保留 Anaconda 很多优秀的特性，体积小，仅略大于官方包含 | 未集成 Pandas、Scikit-learn 这些第三方常用库，但这些库的安装借助 `conda` 实际上也非常简单 |

针对不同系统，其[下载安装包](https://repo.anaconda.com/miniconda)也有几种不同的版本，具体如下所示：

| 版本 | 描述 |
| --- | --- |
| Miniconda3-latest-Windows-x86.exe | Windows系统 32 位安装包 |
| Miniconda3-latest-Windows-x86_64.exe | Windows系统 64 位安装包 |
| Miniconda3-latest-Mac0SX-x86.sh | MacOS系统 32 位安装脚本 |
| Miniconda3-latest-Mac0SX-x86_64.sh | MacOS系统 64 位安装脚本 |
| Miniconda3-latest-Mac0SX-x86_64.pkg | MacOS系统 64 位 **二进制** 安装包 |
| Miniconda3-latest-Mac0SX-arm64.sh | MacOS系统 64 位安装脚本（M系列芯片） |
| Miniconda3-latest-Mac0sX-arm64.pkg | MacOS系统 64 位二进制安装包（M系列芯片） |
| Miniconda3-latest-Linux-x86.sh | Linux系统 64 位安装脚本 |
| Miniconda3-latest-Linux-x86_64.sh | Linux系统 64 位安装脚本 |
| Miniconda3-latest-Linux-aarch64.sh | |
| Miniconda3-latest-Linux-s390x.sh | |
| Miniconda3-latest-Linux-ppc64le.sh | |
| Miniconda3-latest-Linux-armv7l.sh | |


!!! tip "如何选择32位与64位"

    1. 除非你的机器是很老的配置，搭建的系统是32位系统，需要选择 32 位安装包。现在主流的操作系统都是 64 位，尽量选择 64 位安装包。需要注意的是，64位系统可以选择32位安装，但是32位系统不能使用64位安装包。
    2. `_x86` 后缀表示32位安装包；`x86_64` 后缀则表示64位安装包。
    3. `arm` 后缀表示 ARM 架构的安装包；
    4. `pkg` 后缀表示 MacOS 安装包。

## 2. Windows

Windows 安装非常简单，下载好安装包后基本一路 next 就可以了，但如下这个地方 “Add Miniconda3 to my PATH environment variable” 最好勾选上。如果未勾选，安装完成后在终端（Cmd 以及 PowerShell）中执行 `conda` 命令会提示没有 conda 命令，这需要后续手动添加环境变量（参照4.1小节）。

![](https://mingminyu.github.io/webassets/images/20250616/01.png)

## 3. Linux/MacOS

如果是 MacOS 系统，你可以选择 `.pkg` 安装包，但我更建议使用 `.sh` 安装脚本（对 Linux 也是通用），方便我们后续对于环境进行管理，也方便我们深入理解与学习 Python。

打开命令行终端，执行以下命令并按照操作指示进行安装：

=== "命令行执行"

    ```bash title="命令行执行" 
    bash Miniconda3-latest-Mac0SX-x86_64.sh 
    ```

=== "过程中确认与输入"

    ```bash linenums="1" hl_lines="9 13"
    Please, press ENTER to continue
    >>>

    Do you accept the license terms? [yes|no]
    >>> yes

    # 输入安装目录
    Miniconda3 will now be installed into this location:
    /Users/yumm/bigdata/miniconda3

    Do you wish the installer to initialize Miniconda3
    by running conda init? [yes|no]
    >>> yes
    ```

如果第13行未添加 `conda` 初始化，可能在终端中无法正确使用 `python` 以及 `conda` 命令，请参见 4.2 小节进行添加。

正常安装完之后，记得执行 `source ~/.bashrc`，来激活环境，并可以在终端验证环境是否已经成功安装：

```bash linenums="1"
# 查看conda版本
conda --version

# 查看Python版本
python -V
```

如果系统上已经安装了类似工具，可以使用 `which python` 以及 `which conda` 来查看已经安装的 Python 和 Conda 的路径，避免与其他环境冲突了。

## 4. 环境变量

### 4.1 Windows配置Python环境变量

打开 Windows 的“系统属性”->“高级系统设置”->“环境变量”->“系统变量”->“Path”->“新建”，逐个添加如下路径：

```bash title="D:\Miniconda3替换成自己的安装路径"
D:\Miniconda3;
D:\Miniconda3\Scripts;
D:\Miniconda3\Library\bin
```

添加完成后需要重新打开终端，再次验证下 Python 是否安装完成。

### 4.2 Linux/MacOS配置Python环境变量

使用 `vim` 打开 `~/.bashrc` 文件，并添加如下内容：

```bash linenums="1" title="~/.bashrc"
# >>> conda initialize >>>
# !! Contents within this block are managed by 'conda init' !!
__conda_setup="$('/Users/yumm/bigdata/miniconda3/bin/conda' 'shell.zsh' 'hook' 2> /dev/null)"
if [ $? -eq 0 ]; then
    eval "$__conda_setup"
else
    if [ -f "/Users/yumm/bigdata/miniconda3/etc/profile.d/conda.sh" ]; then
        . "/Users/yumm/bigdata/miniconda3/etc/profile.d/conda.sh"
    else
        export PATH="/Users/yumm/bigdata/miniconda3/bin:$PATH"
    fi
fi
unset __conda_setup
# <<< conda initialize <<<
```

添加完成完成后，记得执行 `source ~/.bashrc`，并使用 `conda --version` 命令检查是否安装成功。

## 5. 卸载

实际上卸载都比较方便：

- Windows：直接在“设置”->“应用”中搜索并删除 Miniconda3；
- MacOS/Linux：在终端中执行 `rm -rf ~/bigdata/miniconda3`。

如果你是 MacOS 系统，且选择了 `.pkg` 安装包，你还需要确定 Python 被安装到哪个目录下了。

## 6. 总结

- 如果你打算深入学习 Python，那么 Miniconda 是一个很好的选择，且一定要尝试在 Linux 上安装和操作；
- 删除后最好谨慎，确认删除路径是否正确后再进行操作；
- 如果你想要升级 Python 的版本，最好的方式是使用虚拟环境，网上很多教你直接升级的教程，都很扯淡，且会破坏你的开发环境。（当然，有时间的话还是建议新手多折腾折腾）
