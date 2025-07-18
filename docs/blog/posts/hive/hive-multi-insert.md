---
date: 2024-07-25
authors:
  - mingminyu
categories:
  - 数据库
tags:
  - Hive
readtime: 2
---

# Hive Multi Insert


## 1. 分区表

```sql linenums="1"
CREATE TABLE mydb.yumm_multi_insert_demo
(
	id BIGINT,
  name STRING
)
PARTITIONED BY (batchdate STRING)
;

```

## 2. Multi Insert插入数据

```sql linenums="1"
FROM (
	SELECT 1 AS id, 'n1' AS name
  UNION ALL
  SELECT 2 AS id, 'n2' as name
)
INSERT INTO TABLE haier_afterloan_dev.yumm_multi_insert_demo PARTITION(batchdate='2025-01-01') SELECT * WHERE id = 1
INSERT INTO TABLE haier_afterloan_dev.yumm_multi_insert_demo PARTITION(batchdate='2025-01-02') SELECT * WHERE id = 2
```
