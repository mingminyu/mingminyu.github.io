# 安装

PDM 需要安装 3.8 以上的 Python 版本。它适用于多个平台，包括 Windows、Linux 和 MacOS。

## 1. 推荐安装方式

与 PIP 一样，PDM 提供了一个安装脚本，用于将 PDM 安装到隔离环境中。

=== "Linux/Mac"

    ```bash
    curl -sSL https://pdm-project.org/install-pdm.py | python3 -
    ```

=== "Windows"

    ```powershell
    (Invoke-WebRequest -Uri https://pdm-project.org/install-pdm.py -UseBasicParsing).Content | py -
    ```

安装程序完成后，我们还需要在系统环境中添加执行路径：

- Linux/Mac: `$HOME/.local/bin`
- Windows: `%APPDATA%\Python\Scripts`

## 2. 其他安装方式

=== "Homebrew"

    ```bash
    brew install pdm
    ```

=== "Scoop"

    ```powershell
    scoop bucket add frostming https://github.com/frostming/scoop-frostming.git
    scoop install pdm
    ```

=== "uv"

    ```bash
    uv tool install pdm
    ```

=== "pipx"

    ```bash
    pipx install pdm
    ```

    安装 GitHub 存储库的最新版本，安装前确保您已在系统上安装了 Git LFS。

    ```bash
    pipx install git+https://github.com/pdm-project/pdm.git@main#egg=pdm
    ```

    通过如下命令安装 PDM 所有功能的：

    ```bash
    pipx install pdm[all]
    ```

=== "pip"

    ```bash
    pip install --user pdm
    ```

=== "asdf"

    ```
    asdf plugin add pdm
    asdf local pdm latest
    asdf install pdm
    ```

=== "inside project"

    通过将 [Pyprojectx](https://pyprojectx.github.io) 包装器脚本复制到一个项目中，您可以将 PDM 安装为该项目中的（npm 样式）开发依赖项。这允许不同的项目/分支使用不同的 PDM 版本。

    在项目文件夹中，执行对应系统的脚本:

    === "Linux/Mac"

        ```
        curl -LO https://github.com/pyprojectx/pyprojectx/releases/latest/download/wrappers.zip && unzip wrappers.zip && rm -f wrappers.zip
        ./pw --add pdm
        ```

    === "Windows"

        ```powershell
        Invoke-WebRequest https://github.com/pyprojectx/pyprojectx/releases/latest/download/wrappers.zip -OutFile wrappers.zip; Expand-Archive -Path wrappers.zip -DestinationPath .; Remove-Item -Path wrappers.zip
        .\pw --add pdm
        ```

    使用此方法安装 PDM 时, 需要通过 `pw` 包装器运行所有 `pdm` 命令:

    ```bash
    ./pw pdm install
    ```

## 3. 更新 PDM 版本

更新 PDM 非常简单，一行代码就可以轻松搞定。

```bash
pdm self update
```


## 4. Shell 命令补全

PDM 支持为 Bash、Zsh、Fish 或 Powershell 生成命令行参数补全脚本。

=== "Bash"

    ```bash
    pdm completion bash > /etc/bash_completion.d/pdm.bash-completion
    ```

=== "Zsh"

    ```bash
    # 确保在执行 compinit 参数之前将 ~/.zfunc 添加到fpath中。
    pdm completion zsh > ~/.zfunc/_pdm
    ```

    Oh-My-Zsh:

    ```bash
    mkdir $ZSH_CUSTOM/plugins/pdm
    pdm completion zsh > $ZSH_CUSTOM/plugins/pdm/_pdm
    ```

    Then make sure pdm plugin is enabled in ~/.zshrc

=== "Fish"

    ```bash
    pdm completion fish > ~/.config/fish/completions/pdm.fish
    ```

=== "Powershell"

    ```ps1
    # Create a directory to store completion scripts
    mkdir $PROFILE\..\Completions
    echo @'
    Get-ChildItem "$PROFILE\..\Completions\" | ForEach-Object {
        . $_.FullName
    }
    '@ | Out-File -Append -Encoding utf8 $PROFILE
    # Generate script
    Set-ExecutionPolicy Unrestricted -Scope CurrentUser
    pdm completion powershell | Out-File -Encoding utf8 $PROFILE\..\Completions\pdm_completion.ps1
    ```

