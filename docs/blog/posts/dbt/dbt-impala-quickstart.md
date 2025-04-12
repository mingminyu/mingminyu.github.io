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

> 官方文档: https://docs.getdbt.com/guides/manual-install

Impala 并不是 DBT 官方支持的数据库，但开源社区提供了响应的组件，支持 DBT 的常用操作，本篇文章我们来介绍下如何使用 DBT-Core 操作 Impala 数据库。

<!-- more -->

## 1. 安装 DBT-Core 以及 Impala 组件

```bash
pip install dbt-core dbt-impala
```

[`dbt-impala`](https://docs.getdbt.com/docs/core/connect-data-platform/impala-setup) 是基于 `impyla` 开发而来，经常使用 Python 连接 Impala 的同学应该知道，这是个非常好用的 Impala 库。

目前 `dbt-impala` 支持如下功能：

| 名称 | 是否支持 |
| --- | --- |
| 表 | √ |
| 视图 | √ |
| 增量添加 | √ |
| 增量插入/覆盖式插入 | √ |
| 增量合并 |  |
| 本地加载 seed 文件| √ |
| 测试 | √ |
| 快照 | √ |
| 文档 | √ |
| LDAP 授权 | √ |
| Kerberos 授权 | √ |

## 2. 创建项目

安装好相关 Python 库之后，执行以下命令创建一个 DBT 项目。过程中 DBT 会询问你一些数据连接信息，按照终端中的提示输入就好。

```bash
dbt init featshop
```

创建项目之后，整体目录结构如下：

```bash linenums="1" hl_lines="11"
featshop
├── analyses/
├── logs/
├── macros/
├── models/
├── seed/
├── snapshots/
├── target/
├── tests/
├── .gitignore
├── dbt_project.yml
└── README.md
```

关于每个文件夹的描述与作用，官网上有非常详细的[介绍](https://docs.getdbt.com/docs/build/projects)，这里我们提前重点关注下 `dbt_project.yml` 文件内容。

```yaml linenums="1" title="dbt_project.yml" hl_lines="3"
name:  'featshop'
version: '1.0.0'
profile: 'featshop'

model-paths: ["models"]
analysis-paths: ["analyses"]
test-paths: ["tests"]
seed-paths: ["seed"]
macro-paths: ["macros"]
snapshot-paths: ["snapshots"]

clean-targets:
  - "target"
  - "dbt_packages"

models:
  featshop:
    example:
      materialized: view
```

值得注意的是，DBT 会根据 dbt_project.yml 配置文件中 `profile: 'featshop'` 去 ~/.dbt/profiles.yml 文件中找对应的 profile 信息（键为 `featshop`），然后根据配置信息去连接 Impala。

!!! warning ""

    如果我们将 Impala 数据库连接信息放在 `default` 下面，并未设置对应  `featshop` 项目的连接信息，那么需要将 dbt_project.yml 文件中 `profile: 'featshop'` 改为 `profile: 'default'`。否则后续使用 `dbt run` 命令运行会出现报错 “Runtime Error: Could not find profile named 'featshop'”。

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

需要注意的是，这里并没有 `featshop` 的数据连接信息，还需要在 profiles.yml 再配置一个连接信息：

```yaml linenums="1" title="profiles.yml" hl_lines="14-26"
default:
  output:
    dev:
      type: impala
      host: "xxx.xxx.xxx.xxx"
      port: 21050
      username: yumingmin
      password: "123"
      dbname: "public"
      schema: "public"
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
      dbname: "public"
      schema: "public"
      use_ssl: false
  target: dev
```

如果项目涉及到从多个数据源中取数，那么给不同数据库添加连接信息，`default` 可用来设置最常用的数据库。当然，如果工作中只会用到一个数据库，那么我们将其配置在 `default` 下面即可，这样所有新建的项目都通过 `profile: 'default'` 来连接数据库。

配置好之后，在 featshop 目录下执行 `dbt debug` 来查看项目配置信息是否正确。

## 3. 建立数据模型

DBT 创建项目默认会帮我们创建好示例模型，如果不需要的话可以直接删掉，这里我们依旧拿相应文件进行代码说明：

=== "schema.yml"

    ```yaml linenums="1" title="example/schema.yml" hl_lineqs="4,13"
    version: 2

    models:
      - name: fst_model
        description: "DBT source data"
        columns:
          - name: id
            description: "A unique primary ID for this model"
            data_tests:
              - unique
              - not_null
      
      - name: snd_model
        description: "filter id=1 from fst_model"
        columns:
          - name: id
            description: "A unique primary ID for this model"
            data_tests:
              - unique
              - not_null
    ```

    这里的 `name` 参数值需要与 `models` 目录下的文件名保持一致，不然会出现警告，且参数值即为在 Impala 的表名（`public.fst_model`，`public.snd_model`）。

=== "fst_model.sql"

    ```sql linenums="1" title="example/fst_model.sql"
    {{ config(materialized='table') }}

    WITH source_data AS (
      SELECT 1 AS id
      UNION ALL
      SELECT NULL AS id
    )

    SELECT * FROM source_data
    ```

=== "snd_model.sql"

    ```sql linenums="1" title="example/snd_model.sql"
    SELECT * FROM {{ ref('fst_model') }}
    WHERE id = 1
    ```

建立好数据模型之后，就可以使用 `dbt run` 命令来运行模型了。

!!! note "更多 Impala 组件支持的功能"

    你可以参考[impala-configs](https://docs.getdbt.com/reference/resource-configs/impala-configs) 来查看如何在 SQL 中定义更多的 Impala 配置。

## 4. 生成文档

DBT 自带的了文档功能，当然考虑集成自己平台上时，可以参考其功能与 UI。

```bash linenums="1"
dbt docs generate
dbt docs serve  # 默认 8080 端口
```
