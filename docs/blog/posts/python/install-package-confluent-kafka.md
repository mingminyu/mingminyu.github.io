---
date: 2025-06-09
authors:
  - mingminyu
categories:
  - 数据库
tags:
  - Python包
  - 消息队列
slug: install-python-package-confluent-kafka
readtime: 2
---

# Python安装Confluent Kafka库

> 参考文档：

- https://docs.confluent.io/kafka-clients/python/current/overview.html
- https://codemia.io/knowledge-hub/path/unable_to_install_confluent-kafka_fatal_error_librdkafkardkafkah_no_such_file_or_directory

## 1. Pip 安装

```bash
pip install confluent-kafka==1.9.2
```

!!! warning "注意"

    建议安装 confluent-kafka 1.9.2 版本，其他版本可能回出现公网发送消息报 `SSL_HANDSHAKE` 错误。此外，Centos 服务安装 `confluent-kafka` 更高版本时编译报错，无法正确安装。

## 2. Conda 安装

如果使用 `pip` 无法正确安装的情况下，可以试试 `conda` 安装，且该方式支持更高版本。

```bash
conda install conda-forge::python-confluent-kafka
```
