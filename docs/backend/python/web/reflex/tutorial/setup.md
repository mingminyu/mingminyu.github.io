# 创建项目

我们创建一个新的项目 ChatApp，并使用 reflex 来初始化项目结构。

```bash
mingminyu> mkdir chatapp
mingminyu> cd chatapp

# 推荐使用虚拟环境作为开发环境
mingminyu> conda create -n reflex python==3.10.12
mingminyu> conda activate reflex
mingminyu> pip install reflex

# 使用 reflex 初始化项目
mingminyu> reflex init
────────────────────────────────── Initializing chatapp ───────────────────────────────────
Success: Initialized chatapp

mingminyu> ls
assets          chatapp         rxconfig.py     venv
```

???+ warning "初始化项目失败"

    使用 `reflex init` 初始化项目时有可能失败，原因在于 reflex 需要使用 `fnm` 下载并安装 NodeJS 18.14，但由于 `fnm` 默认的 NodeJS 安装镜像源是 nodejs.org，网络原因可能导致无法成功安装。

    **解决办法** : 手动将 `fnm` 更改为清华镜像源，参考[此帮助文档](https://mirrors.tuna.tsinghua.edu.cn/help/nodejs-release)。

    ```bash
    export FNM_NODE_DIST_MIRROR=https://mirrors.tuna.tsinghua.edu.cn/nodejs-release/
    ```

成功初始化项目项目后，我们就可以使用 `reflex run` 命令来运行服务。

```bash
mingminyu> reflex run
─────────────────────────────────── Starting Reflex App ───────────────────────────────────
Compiling:  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 100% 1/1 0:00:00
─────────────────────────────────────── App Running ───────────────────────────────────────
App running at: http://localhost:3000
```

接下来，我们就可以通过在浏览器中输入 http://localhost:3000 来访问 Reflex 服务。

!!! tip "基于 FastAPI 的后端服务"

    实际上 Reflex 还会启动一个基于 FastAPI 的后端服务器，负责处理所有状态管理和与前端的通信。您可以通过访问 http://localhost:8000 来测试后端服务器是否正在运行。

