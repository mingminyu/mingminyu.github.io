---
date: 2024-07-12
authors:
  - mingminyu
categories:
  - 数据库
tags:
  - Impala
slug: impala_substr_func_make_chinese_mojibake
readtime: 2
---

# Impala截取中文乱码

```sql linenums="1"
SELECT 
  SUBSTR('我的中国心', 1, 2) AS text1,
  LEFT('我的中国心', 2) AS text2
```

在 Impala 中使用 `SUBSTR` 和 `LEFT` 函数截取中文字符串，结果会乱码。但这种表达式在 Hive 中运行结果则是正常的，主要原因是 Impala 中一个中文字符串实际占用 3 个长度，需要自己手动调整截取长度。

<!-- more -->

```sql linenums="1"
SELECT 
  SUBSTR('我的中国心', 1, 6) AS text1,
  LEFT('我的中国心', 3) AS text2
```

!!! success "推荐操作"

    ```sql linenums="1"
    SELECT 
      REGEXP_EXTRACT('我的中国心', '(.)', 1) AS text1,
      REGEXP_EXTRACT('我的中国心', '(.{2})', 1) AS text2
    ```

