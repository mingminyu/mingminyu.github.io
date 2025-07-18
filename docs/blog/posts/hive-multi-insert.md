---
date: 2024-07-25
authors:
  - mingminyu
categories:
  - 网络爬虫
tags:
  - API
readtime: 2
---

# Hive Multi Insert



```sql
create table haier_afterloan_dev.yumm_multi_insert_demo
(
	id bigint,
  name string
)
partitioned by (batchdate string)
;

from (
	select 1 as id, 'n1' as name
  union all
  select 2 as id, 'n2' as name
)
insert into table haier_afterloan_dev.yumm_multi_insert_demo partiton(batchdate='2025-01-01') select * where id=1
insert into table haier_afterloan_dev.yumm_multi_insert_demo partiton(batchdate='2025-01-01') select * where id=1
```


