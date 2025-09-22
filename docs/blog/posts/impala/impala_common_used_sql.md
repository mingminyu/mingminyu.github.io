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

## 3. 添加列/多列

```sql title="添加列"
-- 添加单列
ALTER TABLE <YOUR_TABLE> ADD COLUMN new_column INT
;

-- 添加多列
ALTER TABLE <YOUR_TABLE> ADD COLUMNS (new_column1 INT, new_column2 INT)
```