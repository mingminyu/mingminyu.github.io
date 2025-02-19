---
date: 2025-02-19
authors:
  - mingminyu
categories:
  - 数据工程
tags:
  - DBT
slug: dbt-impala-quickstart
readtime: 20
---

# DBT 使用 Imapala 快速入门

Impala 并不是 DBT 官方支持的数据库，但开源社区提供了响应的组件，支持 DBT 的常用操作。

## 1. 安装 DBT-Core 以及 Impala 组件

```bash
pip install dbt-core dbt-impala
```

`dbt-impala` 是基于 `impyla` 开发而来，经常使用 Python 连接 Impala 的同学应该知道，这是个非常好用的 Impala 库。

安装好之后，我们执行以下命令创建一个 DBT 项目：

```bash
dbt init featshop
```

过程中 DBT 会询问你一些连接信息，按照终端中的提示输入就好。


## 2. 配置 Impala 连接信息

项目创建好之后，你会发现用户目录下的 `.dbt` 文件夹中 profiles.yml 文件多了如下配置信息：

```yaml linenums="1" title="profiles.yml"
default:
  output:
    dev:
      type: impala
      host: "xxx.xxx.xxx.xxx"
      port: 21050
      username: yumingmin
      password: "123"
      dbname: "xxx"
      schema: "xxx"
      use_ssl: false
  target: dev
```

需要注意的是，这里还需要在 profiles.yml 再配置一个连接信息：

```yaml linenums="1" title="profiles.yml" hl_lines="14-26"
default:
  output:
    dev:
      type: impala
      host: "xxx.xxx.xxx.xxx"
      port: 21050
      username: yumingmin
      password: "123"
      dbname: "xxx"
      schema: "xxx"
      use_ssl: false
  target: dev

featshop:
  output:
    dev:
      type: impala
      host: "xxx.xxx.xxx.xxx"
      port: 21050
      username: yumingmin
      password: "123"
      dbname: "xxx"
      schema: "xxx"
      use_ssl: false
  target: dev
```


