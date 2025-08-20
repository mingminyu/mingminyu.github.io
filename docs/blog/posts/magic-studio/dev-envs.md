---
date: 2025-07-01
authors:
  - mingminyu
categories:
  - 前端开发
tags:
  - NextJS
  - MagicStudio
slug: magic_dev_envs
readtime: 20
---

# Magic Studio开发者日志：开发环境搭建

开发过程我们需要与各种数据库进行交互，最佳的环境是使用物理机搭建各种数据库，但这种方式比较繁琐、耗时，所以我们选择使用 Docker 容器化数据库。

<!-- more -->

## 1. MySQL

> 创建容器

```bash linenums="1"
docker pull mysql:8.0
# 启动容器
docker run --name mysql -p 3306:3306 -e MYSQL_ROOT_PASSWORD=root -d mysql:8.0
```

> 授权 root 用户或新建用户允许外部连

```sql linenums="1"
-- 授权 root 外部连接
ALTER USER 'root'@'%' IDENTIFIED BY 'root';
FLUSH PRIVILEGES;

-- 新建用户并授权
CREATE USER 'magic'@'%' IDENTIFIED BY 'magic';
GRANT ALL PRIVILEGES ON *.* TO 'magic'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;
```

接下来使用 DBEaver 连接测试下是不是可以连接。

