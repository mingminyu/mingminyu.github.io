# 第二十二章 全书总结

## 第一章 Docker 简介

## 本章小结

- Docker 是一种轻量级虚拟化技术，核心价值是 **环境一致性**
- 与虚拟机相比，Docker 更轻量、更快速、资源利用率更高
- Docker 基于 Linux 内核的 Namespace、Cgroups 和 Union FS 技术
- Docker 推动了容器技术的标准化 (OCI) 和生态发展

Docker 的核心价值可以用一句话概括：**让应用的开发、测试、部署保持一致，同时极大提高资源利用效率。** 笔者认为，对于现代软件开发者来说，Docker 已经不是 “要不要学” 的问题，而是 **必备技能**。无论你是前端、后端、运维还是全栈开发者，掌握 Docker 都能让你的工作更高效。

---

> 📝 **发现错误或有改进建议？** 欢迎提交 [Issue](https://github.com/yeasy/docker_practice/issues) 或 [PR](https://github.com/yeasy/docker_practice/pulls)。

## 第二章 基本概念

## 本章小结

本章介绍了 Docker 的三个核心概念：镜像、容器和仓库。

| 概念 | 要点 |
|------|------|
| **镜像是什么** | 只读的应用模板，包含运行所需的一切 |
| **分层存储** | 多层叠加，共享基础层，节省空间 |
| **只读特性** | 构建后不可修改，保证一致性 |
| **层的陷阱** | 删除操作只是标记，不减小体积 |
| **容器是什么** | 镜像的运行实例，本质是隔离的进程 |
| **容器 vs 虚拟机** | 共享内核，更轻量，但隔离性较弱 |
| **存储层** | 可写层随容器删除而消失 |
| **数据持久化** | 使用 Volume 或 Bind Mount |
| **生命周期** | 与主进程 (PID 1) 绑定 |
| **Registry** | 存储和分发镜像的服务 |
| **仓库 (Repository)** | 同一软件的镜像集合 |
| **标签 (Tag)** | 版本标识，默认为 latest |
| **Docker Hub** | 默认的公共 Registry |
| **私有 Registry** | 企业内部使用，推荐 Harbor |

现在你已经了解了 Docker 的三个核心概念：镜像、容器 和仓库。接下来，让我们开始 安装 Docker，动手实践！
---

> 📝 **发现错误或有改进建议？** 欢迎提交 [Issue](https://github.com/yeasy/docker_practice/issues) 或 [PR](https://github.com/yeasy/docker_practice/pulls)。

## 第三章 安装 Docker

## 本章小结

Docker 支持在多种平台上安装和使用，选择合适的安装方式是顺利使用 Docker 的第一步。

| 平台 | 推荐方式 | 说明 |
|------|---------|------|
| **Ubuntu/Debian** | 官方 APT 仓库 | 最完善的支持，推荐首选 |
| **CentOS/Fedora** | 官方 DNF/YUM 仓库 | 注意验证防火墙与 `iptables` 兼容性 |
| **macOS** | Docker Desktop | 图形化安装，默认集成 Compose |
| **Windows 10/11** | Docker Desktop（WSL 2 或 Hyper-V） | 按机器能力与企业策略选择后端 |
| **Raspberry Pi** | 官方 APT 仓库或 Debian `arm64` 方案 | 32 位系统已停止接收 v29+ 新主版本 |
| **离线环境** | 二进制包安装 | 适用于无法联网的服务器 |

### 安装后验证

安装完成后，运行以下命令验证 Docker 是否正常工作：

```bash
$ docker version
$ docker run --rm hello-world
```

### 延伸阅读

- 镜像加速器：解决国内拉取镜像慢的问题
- 开启实验特性：使用最新功能
- Docker Hub：官方镜像仓库
---

> 📝 **发现错误或有改进建议？** 欢迎提交 [Issue](https://github.com/yeasy/docker_practice/issues) 或 [PR](https://github.com/yeasy/docker_practice/pulls)。

## 第四章 使用镜像

## 本章小结

本章介绍了 Docker 镜像的获取、列出、删除以及构建方式。

| 操作 | 命令 |
|------|------|
| 拉取镜像 | `docker pull 镜像名:标签` |
| 拉取所有标签 | `docker pull -a 镜像名` |
| 指定平台 | `docker pull --platform linux/amd64 镜像名` |
| 用摘要拉取 | `docker pull 镜像名@sha256:...` |
| 列出所有镜像 | `docker images` |
| 按仓库名过滤 | `docker images nginx` |
| 列出虚悬镜像 | `docker images -f dangling=true` |
| 只输出 ID | `docker images -q` |
| 显示摘要 | `docker images --digests` |
| 自定义格式 | `docker images --format "..."` |
| 查看空间占用 | `docker system df` |
| 删除指定镜像 | `docker rmi 镜像名:标签` |
| 强制删除 | `docker rmi -f 镜像名` |
| 删除虚悬镜像 | `docker image prune` |
| 删除未使用镜像 | `docker image prune -a` |
| 批量删除 | `docker rmi $(docker images -q -f ...)` |

### 延伸阅读

- 获取镜像：从 Registry 拉取镜像
- 列出镜像：查看和过滤镜像
- 删除镜像：清理本地镜像
- 镜像加速器：加速镜像下载
- Docker Hub：官方镜像仓库
- 镜像：理解镜像概念
- 删除容器：清理容器
- 数据卷：清理数据卷
---

> 📝 **发现错误或有改进建议？** 欢迎提交 [Issue](https://github.com/yeasy/docker_practice/issues) 或 [PR](https://github.com/yeasy/docker_practice/pulls)。

## 第五章 操作容器

## 本章小结

本章介绍了 Docker 容器的启动、停止、进入和删除等核心操作。

| 操作 | 命令 | 说明 |
|------|------|------|
| 新建并运行 | `docker run` | 最常用的启动方式 |
| 交互式启动 | `docker run -it` | 用于调试或临时操作 |
| 后台运行 | `docker run -d` | 用于服务类应用 |
| 启动已停止的容器 | `docker start` | 重用已有容器 |
| 优雅停止 | `docker stop` | 先 SIGTERM，超时后 SIGKILL |
| 强制停止 | `docker kill` | 直接 SIGKILL |
| 重启 | `docker restart` | 停止后立即启动 |
| 停止全部 | `docker stop $(docker ps -q)` | 停止所有运行中容器 |
| 进入容器调试 | `docker exec -it 容器名 bash` | 推荐方式 |
| 执行单条命令 | `docker exec 容器名 命令` | 不进入交互模式 |
| 查看主进程输出 | `docker attach 容器名` | 慎用，退出可能停止容器 |
| 删除已停止容器 | `docker rm 容器名` | 需先停止 |
| 强制删除运行中容器 | `docker rm -f 容器名` | 直接删除 |
| 删除容器及匿名卷 | `docker rm -v 容器名` | 同时清理匿名卷 |
| 清理所有已停止容器 | `docker container prune` | 批量清理 |

### 延伸阅读

- 后台运行：理解 `-d` 参数和容器生命周期
- 进入容器：操作运行中的容器
- 网络配置：理解端口映射的原理
- 数据管理：数据持久化方案
- 删除镜像：清理镜像
- 数据卷：数据卷管理
---

> 📝 **发现错误或有改进建议？** 欢迎提交 [Issue](https://github.com/yeasy/docker_practice/issues) 或 [PR](https://github.com/yeasy/docker_practice/pulls)。

## 第六章 访问仓库

## 本章小结

本章介绍了 Docker Hub 的使用、私有仓库的搭建以及 Nexus 3 等企业级方案。

| 功能 | 说明 |
|------|------|
| **官方镜像** | 优先使用的基础镜像 |
| **拉取限制** | 匿名 100 次/6h，登录 200 次/6h |
| **安全** | 推荐开启 2FA 并使用 Access Token |
| **自动化** | 支持 Webhooks 和自动构建 |

### 延伸阅读

- 私有仓库：搭建自己的 Registry
- 镜像加速器：加速下载
---

> 📝 **发现错误或有改进建议？** 欢迎提交 [Issue](https://github.com/yeasy/docker_practice/issues) 或 [PR](https://github.com/yeasy/docker_practice/pulls)。

## 第七章 Dockerfile 指令详解

## 本章小结

本章详细介绍了 Dockerfile 的所有核心指令，以下是各指令要点的速查表。

| 指令 | 作用 | 关键要点 |
|------|------|---------|
| **FROM** | 指定基础镜像 | 必须是第一条构建指令；只有全局 `ARG` 能写在它之前 |
| **RUN** | 在新层执行命令 | 合并命令、清理缓存以减小体积 |
| **COPY** | 复制文件 | 优先使用，支持 `--from` |
| **ADD** | 更高级的复制 | 自动解压 tar；公开远程 artifact 应配合 `--checksum` |
| **CMD** | 容器启动默认命令 | 可被 `docker run` 参数覆盖 |
| **ENTRYPOINT** | 容器入口点 | 固定启动命令，CMD 作为默认参数 |
| **ENV** | 设置环境变量 | 构建时 + 运行时均生效 |
| **ARG** | 构建参数 | 仅构建时生效，FROM 后需重新声明 |
| **VOLUME** | 定义匿名卷 | 运行时挂载会遮蔽镜像内目录；构建后续写入语义依赖 builder |
| **EXPOSE** | 声明端口 | 仅文档作用，不自动映射 |
| **WORKDIR** | 指定工作目录 | 替代 `RUN cd`，目录不存在会自动创建 |
| **USER** | 指定运行用户 | 用户必须已存在，推荐 gosu |
| **HEALTHCHECK** | 健康检查 | 支持 starting/healthy/unhealthy 状态 |
| **ONBUILD** | 延迟执行指令 | 只继承一次，不可级联 |
| **LABEL** | 添加元数据 | 推荐 OCI 标准标签，替代 MAINTAINER |
| **SHELL** | 更改默认 shell | 推荐 `["/bin/bash", "-o", "pipefail", "-c"]` |

### 生产镜像快速检查清单

在将镜像推向生产之前，建议逐条过一遍以下清单：

- [ ] 基础镜像选择了最小化版本（如 `alpine`、`distroless`）
- [ ] 使用了多阶段构建，最终镜像不含编译工具链
- [ ] 以非 root 用户运行（`USER` 指令）
- [ ] `COPY` 优先于 `ADD`，且仅复制必要文件
- [ ] `RUN` 指令合并了 `apt-get update && install && rm -rf /var/lib/apt/lists/*`
- [ ] 设置了 `HEALTHCHECK`
- [ ] 使用了 `.dockerignore` 排除 `.git`、`node_modules` 等无关文件
- [ ] 镜像标签使用了具体版本号或 commit hash，而非 `latest`

> 更完整的编写指南见附录：Dockerfile 最佳实践。

### 延伸阅读

- 使用 Dockerfile 定制镜像：Dockerfile 入门
- 多阶段构建：优化镜像大小
- Dockerfile 最佳实践：编写指南
- 安全：容器安全实践
- Compose 模板文件：Compose 中的配置
---

> 📝 **发现错误或有改进建议？** 欢迎提交 [Issue](https://github.com/yeasy/docker_practice/issues) 或 [PR](https://github.com/yeasy/docker_practice/pulls)。

## 第八章 数据管理

## 本章小结

本章介绍了 Docker 的三种数据管理方式：数据卷 (Volume)、绑定挂载 (Bind Mount) 和 tmpfs 挂载。

| 方式 | 特点 | 适用场景 |
|------|------|---------|
| **数据卷 (Volume)** | Docker 管理，生命周期独立于容器 | 数据库、应用数据（推荐生产环境） |
| **绑定挂载 (Bind Mount)** | 挂载宿主机目录，更灵活 | 开发环境、配置文件、日志 |
| **tmpfs 挂载** | 仅存储在内存中，容器停止即消失 | 临时敏感数据、高速缓存 |

| 操作 | 命令 |
|------|------|
| 创建数据卷 | `docker volume create name` |
| 列出数据卷 | `docker volume ls` |
| 查看详情 | `docker volume inspect name` |
| 删除数据卷 | `docker volume rm name` |
| 清理未用 | `docker volume prune` |
| 挂载数据卷 | `-v name:/path` 或 `--mount source=name,target=/path` |

### 延伸阅读

- 数据卷：Docker 管理的持久化存储
- 绑定挂载：挂载宿主机目录
- tmpfs 挂载：内存中的临时存储
- 存储驱动：Docker 存储的底层原理
- Compose 数据管理：Compose 中的挂载配置
---

> 📝 **发现错误或有改进建议？** 欢迎提交 [Issue](https://github.com/yeasy/docker_practice/issues) 或 [PR](https://github.com/yeasy/docker_practice/pulls)。

## 第九章 网络配置

## 本章小结

本章介绍了 Docker 网络配置的各个方面：

| 概念 | 要点 |
|------|------|
| **DNS 配置** | 自定义网络支持嵌入式 DNS，可通过容器名解析 |
| **网络类型** | bridge（默认）、host、none、overlay、macvlan |
| **自定义网络** | 推荐使用，支持容器名 DNS 解析和更好的隔离 |
| **容器互联** | 同一自定义网络内容器可直接通过容器名通信 |
| **端口映射** | `-p 宿主机端口:容器端口` 暴露服务到外部 |
| **网络隔离** | 不同网络默认隔离，增强安全性 |
| **--link** | 已废弃，使用自定义网络替代 |

### 延伸阅读

- 配置 DNS：自定义 DNS 设置
- 网络类型：Bridge、Host、None 等网络模式
- 自定义网络：创建和管理自定义网络
- 容器互联：容器间通信方式
- 端口映射：高级端口配置
- 网络隔离：网络安全与隔离策略
- EXPOSE 指令：在 Dockerfile 中声明端口
- Compose 网络：Compose 中的网络配置
---

> 📝 **发现错误或有改进建议？** 欢迎提交 [Issue](https://github.com/yeasy/docker_practice/issues) 或 [PR](https://github.com/yeasy/docker_practice/pulls)。

## 第十章 Docker Buildx

## 本章小结

Docker Buildx 是 Docker 构建系统的重要进化，提供了高效、安全且支持多平台的镜像构建能力。

| 概念 | 要点 |
|------|------|
| **BuildKit** | 下一代构建引擎，Docker 23+ 默认启用 |
| **缓存挂载** | `RUN --mount=type=cache` 加速依赖安装 |
| **Secret 挂载** | `RUN --mount=type=secret` 安全传递密钥 |
| **buildx build** | 替代 `docker build`，支持更多构建功能 |
| **构建检查** | `--check` 可在不执行构建的情况下检查 Dockerfile 与构建参数 |
| **多架构构建** | `--platform` 参数一键构建多种架构镜像 |
| **Manifest List** | 多架构镜像的索引文件 |
| **SBOM** | 通过 `--sbom=true` 生成软件物料清单 |

### 延伸阅读

- Dockerfile 指令详解：Dockerfile 编写基础
- 多阶段构建：优化镜像体积
- Dockerfile 最佳实践：编写高效 Dockerfile
---

> 📝 **发现错误或有改进建议？** 欢迎提交 [Issue](https://github.com/yeasy/docker_practice/issues) 或 [PR](https://github.com/yeasy/docker_practice/pulls)。

## 第十一章 Docker Compose

## 本章小结

Docker Compose 是管理多容器应用的利器，通过 YAML 文件声明式地定义服务、网络和数据卷。

| 概念 | 要点 |
|------|------|
| **核心概念** | 服务 (service) 和项目 (project) |
| **配置文件** | `compose.yaml`（推荐）或 `docker-compose.yml` |
| **版本** | Compose V2 为 Go 编写的 CLI 插件，通过 `docker compose` 使用 |
| **启动** | `docker compose up -d` 启动所有服务 |
| **停止** | `docker compose down` 停止并移除容器 |
| **查看状态** | `docker compose ps` 查看服务状态 |
| **查看日志** | `docker compose logs` 查看服务日志 |
| **模板文件** | 支持 `services`、`networks`、`volumes` 等顶级配置 |

### 延伸阅读

- Compose 模板文件：详细模板语法参考
- Compose 命令说明：完整命令列表
- 网络配置：Docker 网络基础
- 数据管理：数据卷管理
---

> 📝 **发现错误或有改进建议？** 欢迎提交 [Issue](https://github.com/yeasy/docker_practice/issues) 或 [PR](https://github.com/yeasy/docker_practice/pulls)。

## 第十二章 底层实现

## 本章小结

本章深入介绍了 Docker 的底层实现，包括命名空间、控制组和联合文件系统三大核心技术。

| 技术 | 作用 | 要点 |
|------|------|------|
| **Namespace** | 资源隔离 | Docker 默认启用 PID、NET、MNT、UTS、IPC（cgroup v2 主机上还有 Cgroup）；USER 默认**不**启用，Time 未被使用 |
| **Cgroups** | 资源限制 | 限制 CPU、内存、磁盘 I/O、进程数 |
| **Union FS** | 分层存储 | 镜像分层与 Copy-on-Write 是核心；Engine 29 新装默认 containerd image store，overlay2 是经典 graph driver 场景的主要后备 |

| Namespace | 隔离内容 | 一句话说明 |
|-----------|---------|-----------|
| PID | 进程 ID | 容器有自己的进程树 |
| NET | 网络 | 容器有自己的 IP 和端口 |
| MNT | 文件系统 | 容器有自己的根目录 |
| UTS | 主机名 | 容器有自己的 hostname |
| IPC | 进程间通信 | 容器间 IPC 隔离 |
| USER | 用户 ID | 启用 `userns-remap` 后容器 root 才 ≠ 宿主机 root；**默认不启用** |

| 资源 | 限制参数 | 示例 |
|------|---------|------|
| **内存** | `-m` | `-m 512m` |
| **CPU 核心数** | `--cpus` | `--cpus=1.5` |
| **CPU 绑定** | `--cpuset-cpus` | `--cpuset-cpus="0,1"` |
| **磁盘 I/O** | `--device-write-bps` | `--device-write-bps /dev/sda:10mb` |
| **进程数** | `--pids-limit` | `--pids-limit=100` |

### 延伸阅读

- 命名空间：资源隔离机制详解
- 控制组 (Cgroups)：资源限制机制
- 联合文件系统：分层存储的实现
- 安全：容器安全实践
- 镜像：理解镜像分层
- 容器：容器存储层
- 构建镜像：Dockerfile 层的创建
---

> 📝 **发现错误或有改进建议？** 欢迎提交 [Issue](https://github.com/yeasy/docker_practice/issues) 或 [PR](https://github.com/yeasy/docker_practice/pulls)。

## 第十三章 容器编排基础

## 本章小结

Kubernetes 是当前最主流的容器编排平台，其声明式管理模型和丰富的 API 为大规模容器化应用提供了坚实的基础。

| 概念 | 要点 |
|------|------|
| **Pod** | 最小调度单位，包含一组共享网络和存储的容器 |
| **Deployment** | 管理无状态应用的 Pod 副本集，支持滚动更新和回滚 |
| **StatefulSet** | 管理有状态应用，提供稳定的网络标识和持久化存储 |
| **DaemonSet** | 确保每个节点运行一个 Pod 副本，适用于日志、监控等场景 |
| **Job/CronJob** | 运行一次性或定时任务，确保任务成功完成 |
| **Service** | 为 Pod 提供稳定的网络访问入口和负载均衡 |
| **Namespace** | 资源隔离和多租户支持 |
| **ConfigMap/Secret** | 配置与敏感信息的管理 |
| **Master 节点** | 运行 API Server、Scheduler、Controller Manager |
| **Worker 节点** | 运行 kubelet、kube-proxy 和容器运行时 |

### 延伸阅读

- 部署 Kubernetes：搭建 Kubernetes 集群
- Etcd：Kubernetes 使用的分布式存储
- 底层实现：容器技术原理
---

> 📝 **发现错误或有改进建议？** 欢迎提交 [Issue](https://github.com/yeasy/docker_practice/issues) 或 [PR](https://github.com/yeasy/docker_practice/pulls)。

## 第十四章 部署 Kubernetes

## 本章小结

部署 Kubernetes 集群有多种方式，应根据使用场景选择合适的方案。

| 部署方式 | 适用场景 | 特点 |
|---------|---------|------|
| **kubeadm** | 生产环境 | 官方推荐的集群部署工具 |
| **Docker Desktop** | 本地开发 | 一键启用，开箱即用 |
| **Kind** | CI/CD 测试 | Kubernetes IN Docker，快速创建集群 |
| **K3s** | 边缘计算/IoT | 轻量级，资源占用少 |
| **手动部署** | 学习原理 | 逐步配置每个组件，加深理解 |

### 延伸阅读

- 容器编排基础：Kubernetes 核心概念
- 可视化管理界面：Headlamp 与历史 Dashboard 迁移参考
- kubectl：命令行工具使用指南
---

> 📝 **发现错误或有改进建议？** 欢迎提交 [Issue](https://github.com/yeasy/docker_practice/issues) 或 [PR](https://github.com/yeasy/docker_practice/pulls)。

## 第十五章 Etcd 项目

## 本章小结

etcd 是 Kubernetes 的核心存储组件，为分布式系统提供可靠的键值存储和服务发现能力。

| 概念 | 要点 |
|------|------|
| **定位** | 分布式键值存储系统，用于配置管理和服务发现 |
| **协议** | 基于 Raft 一致性算法，保证数据强一致 |
| **API** | 提供 gRPC 和 HTTP API |
| **集群** | 建议使用奇数节点（3 或 5 个）部署 |
| **etcdctl** | 命令行管理工具，支持 put/get/del/watch 等操作 |
| **安全** | 支持 TLS 加密通信和 RBAC 访问控制 |

### 延伸阅读

- 容器编排基础：Kubernetes 如何使用 etcd
- 部署 Kubernetes：在集群中部署 etcd
---

> 📝 **发现错误或有改进建议？** 欢迎提交 [Issue](https://github.com/yeasy/docker_practice/issues) 或 [PR](https://github.com/yeasy/docker_practice/pulls)。

## 第十六章 容器与云计算

## 本章小结

本章介绍了公有云服务对 Docker 的积极支持，以及新出现的容器云平台。

事实上，Docker 技术的出现自身就极大推动了云计算行业的发展。

通过整合公有云的虚拟机和 Docker 方式，可能获得更多的好处，包括

* 更快速的持续交付和部署能力；
* 利用内核级虚拟化，对公有云中服务器资源进行更加高效地利用；
* 利用公有云和 Docker 的特性更加方便的迁移和扩展应用。

同时，容器将作为与虚拟机类似的业务直接提供给用户使用，极大的丰富了应用开发和部署的场景。
---

> 📝 **发现错误或有改进建议？** 欢迎提交 [Issue](https://github.com/yeasy/docker_practice/issues) 或 [PR](https://github.com/yeasy/docker_practice/pulls)。

## 第十七章 容器其他生态

## 本章小结

Docker 并非容器生态的唯一选择，了解其他工具有助于根据场景做出合适的技术选型。

| 项目 | 定位 | 特点 |
|------|------|------|
| **Fedora CoreOS** | 容器化操作系统 | 自动更新、不可变基础设施、专为运行容器设计 |
| **Podman** | 容器管理引擎 | 无守护进程、兼容 Docker CLI、支持 Rootless 模式、支持原生 Pod |
| **Buildah** | 镜像构建工具 | Daemonless 工作模式、灵活的脚本化构建能力 |
| **Skopeo** | 镜像仓库管理 | 无需拉取即可检查远端镜像、跨仓库/格式无缝迁移镜像 |
| **containerd** | 核心底层运行时 | 稳定高效、符合 CRI 规范、是 Docker 的基石之一 |
| **安全容器** | 强隔离沙箱运行 | 利用轻量级虚拟机 (Kata) 或用户态内核 (gVisor) 防止越狱，极其安全 |
| **Wasm** | 新型工作负载 | 体积极小、冷启动超快且具备跨平台及高度特征化沙盒能力的后端架构新方向 |

### Podman vs Docker

两者的主要区别：

| 对比项 | Docker | Podman |
|--------|--------|--------|
| **守护进程** | 需要 dockerd | 无需守护进程 |
| **权限** | 默认需要 root | 原生支持 Rootless |
| **CLI 兼容** | - | 与 Docker 命令兼容 |
| **Pod 支持** | 不支持 | 原生支持 Pod 概念 |
| **Compose** | docker compose | podman-compose 或兼容模式 |

### 延伸阅读

- 底层实现：容器技术的内核基础
- 安全：容器安全实践
---

> 📝 **发现错误或有改进建议？** 欢迎提交 [Issue](https://github.com/yeasy/docker_practice/issues) 或 [PR](https://github.com/yeasy/docker_practice/pulls)。

## 第十八章 安全

## 本章小结

Docker 的安全性依赖于多层隔离机制的协同工作，同时需要用户遵循最佳实践。本章涵盖的核心安全维度包括：

| 维度 | 关键措施 |
|------|---------|
| **内核隔离** | Namespace 隔离进程/网络/文件系统，Cgroups 限制资源使用 |
| **权限控制** | 非 root 运行、`--cap-drop ALL` 最小能力集、`--read-only` 只读根文件系统 |
| **镜像安全** | 使用可信基础镜像、定期扫描漏洞（Trivy / Snyk）、启用 Sigstore / Notation / Registry 原生签名验证；DCT 仅作为遗留迁移对象 |
| **运行时防护** | Seccomp 系统调用过滤、AppArmor / SELinux 强制访问控制 |
| **网络隔离** | 自定义 bridge 网络隔离容器通信、限制容器对宿主机网络的访问 |

总体来看，Docker 容器还是十分安全的，特别是在容器内不使用 root 权限来运行进程的话。

另外，用户可以使用现有工具，比如 [Apparmor](https://docs.docker.com/engine/security/apparmor/)，[Seccomp](https://docs.docker.com/engine/security/seccomp/)，SELinux，GRSEC 来增强安全性；甚至自己在内核中实现更复杂的安全机制。
---

> 📝 **发现错误或有改进建议？** 欢迎提交 [Issue](https://github.com/yeasy/docker_practice/issues) 或 [PR](https://github.com/yeasy/docker_practice/pulls)。

## 第十九章 容器监控与日志

## 本章小结

本章从三个维度介绍了容器可观测性：

* **指标监控**：以 Prometheus + Grafana 为主，完成指标采集、存储与可视化。
* **日志管理**：以 EFK/ELK 为例，完成容器日志的集中采集、检索与分析。
* **性能优化与故障诊断**：把观测到的数据落到资源限制、瓶颈定位与线上排错上。

生产环境中，建议将“可观测性”当成一个完整闭环：**采集 -> 存储 -> 展示 -> 告警 -> 排错 -> 容量治理**。

## 扩展阅读：Docker 日志驱动

Docker 提供了多种日志驱动 (Log Driver)，用于将容器标准输出的日志转发到不同后端。

常见的日志驱动包括：

* `json-file`：默认驱动，将日志以 JSON 格式写入本地文件。
* `syslog`：将日志转发到 syslog 服务器。
* `journald`：将日志写入 systemd journal。
* `fluentd`：将日志转发到 fluentd 收集器。
* `gelf`：支持 GELF 协议的日志后端（如 Graylog）。
* `awslogs`：发送到 Amazon CloudWatch Logs。

生产建议：无论采用哪种驱动，都要明确日志的保留周期、容量上限与传输可靠性，避免“日志把磁盘写满”或“链路抖动导致丢日志”。

## 19.4 日志平台选型对比与注意事项

日志平台通常由“采集/处理/存储/查询展示”几部分组成。常见选型包括：

* **EFK/ELK**：Elasticsearch + Fluentd/Logstash + Kibana，适合全文检索与结构化查询。
* **Loki + Grafana**：更偏“日志像指标一样存储”的思路，部署与成本可能更友好，但查询能力与使用习惯不同。

选型时建议关注：

* **写入压力与背压**：当存储端变慢时，采集端是否会缓冲、落盘、重试，是否会影响业务。
* **容量治理**：是否具备按天/按大小滚动、保留策略、生命周期管理 (ILM) 等能力。
* **安全与合规**：鉴权、TLS、审计、敏感字段脱敏。
* **可运维性**：升级策略、备份恢复、告警指标是否齐全。

## 19.5 上线前检查清单

你可以用下面的清单快速检查“是否具备最小生产可用性”：

* Prometheus 数据目录已持久化，并设置了合理的保留周期。
* Prometheus Targets 全部为 `UP`，并且关键查询（CPU/内存/容器指标）有数据。
* Grafana 已导入面板并能定位到具体实例/容器；默认账号密码已修改。
* 至少有一条关键告警已打通 Alertmanager 的接收链路，并验证告警能被正确发送与抑制。
* Elasticsearch 数据目录已持久化，并有明确的日志保留周期与容量上限策略。
* Kibana 能查询到最新日志；当 UI 异常时能用 Elasticsearch API 验证入库。
* 可观测性组件未直接暴露到公网，访问已加鉴权或置于内网。
---

> 📝 **发现错误或有改进建议？** 欢迎提交 [Issue](https://github.com/yeasy/docker_practice/issues) 或 [PR](https://github.com/yeasy/docker_practice/pulls)。

## 第二十章 实战案例 - 操作系统

## 本章小结

本章讲解了典型操作系统镜像的下载和使用。

除了官方的镜像外，在 `Docker Hub` 上还有许多第三方组织或个人上传的 Docker 镜像。

读者可以根据具体情况来选择。一般来说：

* 官方镜像体积都比较小，只带有一些基本的组件。精简的系统有利于安全、稳定和高效的运行，也适合进行个性化定制。

* 出于安全考虑，几乎所有官方制作的镜像都没有安装 SSH 服务，无法通过用户名和密码直接登录到容器中。
---

> 📝 **发现错误或有改进建议？** 欢迎提交 [Issue](https://github.com/yeasy/docker_practice/issues) 或 [PR](https://github.com/yeasy/docker_practice/pulls)。

## 第二十一章 实战案例 - DevOps

## 本章小结

本章通过一个完整的 DevOps 工作流示例，串联了从代码提交、自动化测试、镜像构建、
到部署发布的一整套实践路径。

在落地时，建议重点把握以下原则：

* **不可变交付物**：同一份产物（镜像）在不同环境中流转，使用 commit hash 等方式标识版本。
* **最小权限与密钥管理**：CI 平台权限尽量收敛，敏感信息使用 Secret 管理并定期轮换。
* **流水线可观测与可回滚**：为关键步骤保留日志与制品，发布失败时能快速定位并回滚。
* **开发环境一致性**：通过 Dev Containers / compose 开发容器减少“在我电脑上可以”的问题。

下一步你可以根据团队现状选择一条主线深入：

* 已在用 GitHub：优先补全 Actions 的缓存、制品、发布策略。
* 自建体系：结合私有 Registry、Kubernetes 与 GitOps 工具完善部署与审计。
---

> 📝 **发现错误或有改进建议？** 欢迎提交 [Issue](https://github.com/yeasy/docker_practice/issues) 或 [PR](https://github.com/yeasy/docker_practice/pulls)。
