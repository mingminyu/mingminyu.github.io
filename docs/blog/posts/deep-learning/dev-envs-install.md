---
date: 2025-01-17
authors:
  - mingminyu
categories:
  - 环境搭建
readtime: 30
---

# 开发环境搭建

## 1. 大数据环境



### 1.1 Hue

```bash
docker network create -d bridge quickstart-network
```

参考资料：

- https://hub.docker.com/r/gethue/hue
- https://cloud.tencent.com/developer/article/2007741

### 1.2 Impala

```bash
docker run -d --name kudu-impala -p 21000:21000 -p 21050:21050 -p 25000:25000 -p 25010:25010 -p 25020:25020 --memory=4096m apache/kudu:impala-latest impala
```

参考：https://gethue.com/blog/quickstart-sql-editor-for-apache-impala

### 1.3 Hadoop

```bash
docker run -d --name namenode \
    -e CLUSTER_NAME=hadoop-cluster \
    -p 9870:9870 \  # WebHDFS 端口
    -p 9000:9000 \
    bde2020/hadoop-namenode:2.0.0-hadoop3.2.1-java8

# DataNode 服务可选
docker run -d --name datanode \
    --link namenode:namenode \
    -e SERVICE_PRECONDITION=namenode:9000 \
    -p 9864:9864 \
    bde2020/hadoop-datanode:2.0.0-hadoop3.2.1-java8
```
