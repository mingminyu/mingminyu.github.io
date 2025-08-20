---
date: 2025-08-20
authors:
  - mingminyu
categories:
  - 软件工具
tags:
  - PyCharm
slug: pycharm-connect-hive-and-impala
readtime: 5
---

# PyCharm 连接 Hive 和 Impala

PyCharm 没有 Impala 驱动，并且默认 Hive 驱动不能适配低版本的 Hive，我们需要下载匹配的驱动进行调整后，才能连接 Apache Hive 和 Apache Impala。

<!-- more -->

## 1. 下载驱动

使用 PyCharm 自带 Hive 驱动无法正常连接到 Hive 服务，我们需要从 Cloudera 官网上下载对应的驱动：

- Hive JDBC: https://www.cloudera.com/downloads/connectors/hive/jdbc/2-6-2.html
- Impala JDBC: https://www.cloudera.com/downloads/connectors/impala/jdbc/2-6-4.html

## 2. 更改 Apache Hive 的默认驱动

删除 PyCharm 默认 Hive 驱动：

1. 添加解压后的驱动文件 HiveJDBC42.jar；
2. 选择 `com.cloudera.hive.jdbc.HS2Driver` 类；
3. 设置URL模板：`jdbc:hive2://{host::localhost}?[:{port::10000}][/{database:::schema}?][;<;,user={user},password={password},{:identifier}={:identifier}>]`

## 3. 添加 Apache Impala 的驱动

操作基本上和添加 Hive 几乎一样：

1. 添加解压后的驱动文件 ImpalaJDBC42.jar；
2. 选择 `com.cloudera.impala.jdbc.Driver` 类；
3. 设置URL模板：`jdbc:impala://{host::localhost}?[:{port::10000}][/{database:::schema}?][;<;,user={user},password={password},{:identifier}={:identifier}>]`
