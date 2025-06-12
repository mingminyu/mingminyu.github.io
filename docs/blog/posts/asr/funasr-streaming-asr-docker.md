---
date: 2025-06-01
authors:
  - mingminyu
categories:
  - 智能语音
tags:
  - 语音识别
  - FunASR
slug: funasr-streaming-asr-docker
readtime: 10
---

# FunASR实时语音识别接口

> 原文地址：
> 
>  - https://blog.lukeewin.top/archives/centos-streaming-asr
>  - https://www.cnblogs.com/fengmian13wl/p/18120250

## 1. 安装Docker

这里使用阿里官方打包好的docker镜像，所以我们先需要安装docker，如果你不想要使用docker方式安装，你也可以自己源码编译安装，不过推荐在Ubuntu系统中源码编译安装，如果你使用CentOS进行源码编译安装，有可能会编译失败。

```bash
yum -y install gcc g++ yum-utils
# 配置阿里云的 Docker Hub
yum-config-manager --add-repo http://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
# 安装 Docker CE
yum -y install docker-ce docker-ce-cli containerd.io 
# 启动 Docker
systemctl start docker
# 设置开机自启
systemctl enable docker
# 查看 Docker 运行状态
systemctl status docker
```

<!-- more -->

## 2. 启动容器

创建容器前一定先确定好端口映射，哪些端口需要映射到宿主机。

```bash linenums="1"
# 拉取镜像
docker pull registry.cn-hangzhou.aliyuncs.com/funasr_repo/funasr:funasr-runtime-sdk-online-cpu-0.1.12

# 创建模型目录
mkdir -p ./funasr-runtime-resources/models
# 运行容器
docker run -d -p 10096:10095 -it --privieged=true -v $PWD/funasr-runtime-resources/models:/workspace/models registry.cn-hangzhou.aliyuncs.com/funasr_repo/funasr:funasr-runtime-sdk-online-cpu-0.1.12
```

!!! note "Docker常用操作"

    1. `docker run` 使用 `-d` 参数可保证容器在后台运行；
    2. 删除正在运行容器需要先使用 `docker stop <container_id>` 停止容器，再使用 `docker rm <container_id>` 删除容器；
    3. 删除镜像需要使用 `docker rmi <image_id>`

## 3. 启动API接口

```bash linenums="1"
apt-get update -y 
apt-get install ffmpeg
cp /workspace/onnxruntime-linux-x64-1.14.0/lib/* /usr/lib

cd FunASR/runtime/
# 后台启动服务
nohup bash run_server_2pass.sh > run.log 2>&1 &
# 查看运行日志
tail -f run.log
```

此外，如果部署在云服务上的话，需要将 `run_server_2pass.sh` 脚本中的 `certfile` 设置成 0，然后通过 `ws://1.2.3.4:10096`  进行连接，注意不是 `wss`。

如果有域名的话，可以在 SSH 隧道中绑定本地端口，相当于做一个端口映射，这样在本地就可以访问云服务了。

```bash linenums="1"
ssh -CNg 10096:127.0.0.1:10096 root@ip -p 22
```

## 4. 启动应用服务

接下来，可以使用官方提供的 Python 版本的客户端连接服务，空：

```bash linenums="1"
wget https://isv-data.oss-cn-hangzhou.aliyuncs.com/ics/MaaS/ASR/sample/funasr_samples.tar.gz
# 本机服务
python funasr_wss_client.py --host localhost --port 10096 --mode 2pass
```

如果是希能在网页端访问，可以在开启一个静态服务：

```bash linenums="1"
cd samples/html/static
python -m http.server 8080
```

需要注意的是，由于启动的服务可能非 https 服务，需要在 Chrome 访问 `chrome://flags` 搜索 `unsafely-treat-insecure-origin-as-secure`，填入开发地址后并启用，如下图所示。

![](https://mingminyu.github.io/webassets/images/20250612/01.png)
