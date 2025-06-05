---
date: 2024-07-25
authors:
  - mingminyu
categories:
  - 容器化
tags:
  - Docker
readtime: 2
---

# Docker拉取镜像证书过期错误

> 参考文档：https://blog.csdn.net/qq_44895681/article/details/120524753

在使用 `docker pull` 命令拉取镜像时，出现证书过期错误：

```bash title="错误信息"
docker: Get https://registry.cn-hangzhou.aliyuncs.com/funasr_repo/funasr:funasr-runtime-sdk-online-cpu-0.1.12: x509: certificate has expired or is not yet valid.
```

这种情况一般时证书问题或者系统时间问题导致的，可以先执行 `date` 看一下系统时间是否正确，如果服务器系
统时间跟现实实际时间对不上的话，一般就是系统时间问题，同步时间即可。

## 1. 修正系统时间

安装 `ntpdate` 工具同步时间：

```bash
yum install ntpdate -y
ntpdate cn.pool.ntp.org
```

使用 `date` 再次查看下时间已经修正后，执行以下命令时便能正常获取镜像了：

```bash
docker pull registry.cn-hangzhou.aliyuncs.com/funasr_repo/funasr:funasr-runtime-sdk-online-cpu-0.1.12
```

## 2. 修正证书时间

如果是证书问题，则需要在 `/etc/docker/daemon.json` 文件中添加以下内容：

```json
"registry-mirrors": [
  "https://docker.mirrors.ustc.edu.cn"
]
```

接下来更新 Docker 配置并重启服务：

```bash
systemctl daemon-reload
systemctl restart docker
```
