# 安装

## 1. PIP

建议先创建一个虚拟环境，避免干扰系统环境

```bash
pip install torch torchaudio funasr  # (1)!
```

  1. 如果是国内用户，建议使用加上 `-i https://mirror.sjtu.edu.cn/pypi/web/simple
  ` 来加快下载速度，否则整个下载过程会很慢。

如果需要使用工业预训练模型，还需要安装 modelscope 与 huggingface_hub。

```bash
pip install -U modelscope huggingface huggingface_hub
```

此外，因为 FunASR 依赖 ffmpeg 对音频进行处理，如果你使用的 conda 环境，我们建议您在 conda 环境中安装 ffmpeg:

```bash
conda install ffmpeg
```

## 2. 源码

通过以下命令 FunASR 源码安装:

```bash
git clone https://github.com/alibaba/FunASR.git && cd FunASR
pip3 install -e ./
```

## 3. Docker

!!! note "安装 Docker"

    === "Ubuntu"

      ```bash linenums="1"
      curl -fsSL https://test.docker.com -o test-docker.sh
      sudo sh test-docker.sh
      ```

    === "Debian"

      ```bash linenums="1"
      curl -fsSL https://get.docker.com -o get-docker.sh
      sudo sh get-docker.sh
      ```

    === "CentOS"

        ```bash linenums="1"
        curl -fsSL https://get.docker.com | bash -s docker --mirror Aliyun
        ```

    === "MacOS"

        ```bash linenums="1"
        brew install --cask --appdir=/Applications docker
        ```

### 3.1 FunASR 镜像

FunASR 提供了 CPU 和 GPU 版本的 Docker 镜像：

- CPU: registry.cn-hangzhou.aliyuncs.com/funasr_repo/funasr:funasr-runtime-sdk-cpu-0.4.1
- GPU: registry.cn-hangzhou.aliyuncs.com/modelscope-repo/modelscope:ubuntu20.04-py38-torch1.11.0-tf1.15.5-1.8.1

使用 `docker pull <image-name>:<tag>` 命令来拉取镜像。

### 3.2 启动服务

CPU 镜像与 GPU 镜像的启动方式略有差异，需要去掉 `--gpus all` 这一行。

```bash linenums="1" hl_lines="2" title="启动FunASR CPU镜像"
sudo docker run -itd \
  --gpus all \  # 使用 GPU
  --name funasr \
  -v <local_dir:dir_in_docker> <image-name>:<tag> /bin/bash

sudo docker exec -it funasr /bin/bash
```

### 3.3 停止服务

```bash linenums="1"
docker ps  # 查看正在运行的镜像
docker stop funasr
```

## 4. 常见问题

### 4.1 Mac M1 安装不兼容

如果在 Mac M1 上出现 “mach-o file, but is an incompatible architecture (have (x86_64), need (arm64e)” 错误，需要卸载掉 `cffi`、`pycparser` 库重新安装。

```bash linenums="1"
pip uninstall cffi pycparser
ARCHFLAGS="-arch arm64"
pip install cffi pycparser --compile --no-cache-dir
```
