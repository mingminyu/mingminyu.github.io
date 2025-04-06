# 特定平台设置

## 1. Apache Impala

### 1.1 表配置项

将模型具体化为表时，除了标准模型配置之外，我们还可以包含特定于 dbt-impala 插件的几个可选配置。

| 选项 | 描述 | 是否必须 | 示例 |
| --- | --- | --- | --- |
| `partiton_by` | 按列分区，通常每个分区创建一个目录 | | `partition_by=['name']` |
| `sort_by` | 按列排序 | | `sort_by=['age']` |
| `raw_format` | 单个记录所使用的格式 | | `raw_format='delimited'` |
| `stored_as` | 数据表的底层存储格式 | | `stored_as='PARQUET'` |
| `location` | 存储位置，通常是 HDFS 路径 |  | `location='/user/data'` |
| `comment` | 表的注释 | | `comment='This is a table'` |
| `serde_properties` | 表的序列化属性 | | `serde_properties="('quoteChar'=''', 'escapeChar'='\')"` |  
| `tbl_properties` | 表的属性 | | `tbl_properties="('dbt_test'='1')"` |
| `is_cached` | 是否缓存表 | | 默认为 `false` |
| `cache_pool` | 当 `is_cached=true` 时所使用的缓存池名称 | | |
| `replication_factor` | 当 `is_cached=true` 时所使用的缓存复制因子 | | |
| `external` | 是否为外部表 | | `external=true` |

> 上述参数的其他配置值，可以参考 Cloudera [Create Table特定选项](https://docs.cloudera.com/documentation/enterprise/6/6.3/topics/impala_create_table.html)。

### 1.2 增量模型

增量模型支持 `append` 以及 `insert_overwrite` 模式:

- `append`: 在不更新或者覆盖任何现有数据的基础上，插入新数据记录。
- `insert_overwrite`: 删除所有现有数据，然后插入新数据。

因为底层仓库不支持 `unique_key` 以及 `merge` 模式，所以 `dbt-impala` 也不支持。

```sql title="impala_partition_by.sql" linenums="1"
{{
  config(
    materialized='table',
    partition_by=['batchdate'],
  )
}}

WITH source_data AS (
  SELECT 1 AS id, '2022-01-01' AS batchdate
  UNION ALL
  SELECT 2 AS id, '2022-01-02' AS batchdate
  UNION ALL
  SELECT 3 AS id, '2022-01-03' AS batchdate
)

SELECT * FROM source_data
```

在上面的示例中，使用 `partition_by` 和其他配置选项创建了一个示例表。使用 `partition_by` 选项时需要注意的一件事是，`SELECT` 查询应始终将 `partition_by` 选项中使用的列名作为最后一个，正如上面查询中使用的 `batchdate` 列名所示。如果 `partition_by` 子句与 `SELECT` 语句中的最后一列不同，Impala将在尝试创建模型时标记错误。

## 2. Apache Spark

## 3. Amazon Athena

## 4. BigQuery

## 5. Clickhouse

## 6. Databricks

## 7. Drois/SelectDB

## 8. Firebolt

## 9. Greeplum

## 10. Infer

## 11. Microsoft Azure Synapse

## 12. Microsoft Fabric DWH

## 13. Microsoft SQL Server

## 14. MindsDB

## 15. Oracle

## 16. PostgreSQL

## 17. RedShift

## 18. Snowflake

## 19. SingleStore

## 20. Starburst/Trino

## 21. Teradata

## 22. Vertica

## 23. Upsolver

## 24. Yellowbrick


