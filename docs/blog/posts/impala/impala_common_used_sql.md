---
date: 2024-07-12
authors:
  - mingminyu
categories:
  - 数据库
tags:
  - Impala
slug: impala-common-used-sql
readtime: 2
---

# Impala 常用 SQL

## 1. 统计信息
 
```sql title="查看表占用空间"
SHOW TABLE STATS <YOUR_TABLE>;
```

## 2. 日期转换

```sql title="获取当前月最后1天日期"
SELECT LAST_DAY(NOW())
```
