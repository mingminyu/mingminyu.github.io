# 条件函数

Hive 提供了很多条件函数，主要有 `IF`、`ISNULL`、`ISNOTNULL`、`NVL`、`COALESCE`、`NULLIF`、`CASE...WHEN` 以及 `ASSERT_TRUE`，合理地使用这些函数不仅能帮我们处理非常复杂的逻辑，还能简化我们的 SQL 代码。

这里我们准备一个表，用于帮助大家更深入地理解条件函数的使用场景:

!!! example ""

    === "example表示例数据"

        | c1 | c2 | c3 | c4 | c5 |
        | --- | --- | --- | --- | --- |
        | NULL | 2 | NULL | NULL | 10 |
        | 3 | NULL | 4 | NULL | NULL |
        | NULL | NULL | 5 | 6 | NULL |

    === "表视图SQL"

        ```sql linenums="1"
        WITH example AS (
            SELECT NULL AS c1, 2 AS c2, NULL AS c3, NULL AS c4, 10 AS c5
                UNION ALL
            SELECT 3 AS c1, NULL AS c2, 4 AS c3, NULL AS c4, NULL AS c5
                UNION ALL
            SELECT NULL AS c1, NULL AS c2, 5 AS c3, 6 AS c4, NULL AS c5
        )
        ```


## 1. IF

## 2. ISNULL

## 3. ISNOTNULL

## 4. NVL

```sql title="NVL函数表达式"
NVL(T value, T default_value)
```

`NVL` 是一个空值处理函数，如果 `value` 值为空时返回 `default_value`（不管默认值是不是空值），否则返回 `value`。

下面我们看几个简单的示例:

```sql linenums="1" title="NVL 简单示例"
SELECT NVL(NULL, 20);  -- 20
SELECT NVL(3, 20);  -- 3
SELECT NVL(NULL, NULL);  -- NULL
```

为了更深入了解 `NVL` 的作用，我们看一个使用上面 `example` 的表:

???+ example "NVL使用案例"

    === "示例SQL"
        
        ```sql
        SELECT NVL(c1, c2) FROM example;
        ```

    === "输出结果"
    
        ```sql 
        2
        3
        NULL
        ```

!!! info "可以理解为缺失值填充"

    === "Pandas中缺失值填充"

        如果你熟悉 Python 中 Pandas 的话，可以将 `NVL` 理解为缺失值的填充。

        ```python title="fillna缺失值填充"
        df["col1"].fillna(df["col2"])
        ```
    
    === "变种 IF 和 IFNULL"

        `NVL` 实际上就是变相的 `IF` 和 `IFNULL` 语句，上面语句我们也可以这样实现:

        ```sql linenums="1"
        SELECT IF(c1 IS NULL, c2);
        SELECT IFNULL(c1, c2);
        ```

## 5. COALESCE

```sql title="COALESCE函数表达式"
NVL(T v1, T v2, ..., T vn)
```

`COALESCE` 是一个空值处理函数，它可以接收多个表达式，返回结果为第一个非空表达式，如果都为空值，那么返回结果为空。

```sql linenums="1" title="COALESCE 简单示例"
SELECT COALESCE(NULL, 2);  -- 2
SELECT COALESCE(3, NULL);  -- 3
SELECT COALESCE(NULL, NULL);  -- NULL
SELECT COALESCE(NULL, NULL, 4);  -- 4
SELECT COALESCE(NULL, NULL, 5, NULL);  -- 5
```

???+ example "COALESCE 使用案例"

    === "示例SQL"
        
        ```sql
        SELECT COALESCE(c1, c2, c3, c4, c5) FROM example;
        ```


    === "输出结果"
    
        ```sql 
        2
        3
        5
        ```

!!! note "小结"

    可以看到，相较于 `NVL` 函数，`COALESCE` 其实更强大，也推荐大家使用这个函数。

## 6. NULLIF

## 7. CASE...WHEN

`CASE...WHEN` 可以说分析中用的最常用的语句了，但实际上它也有使用语法，下面我们来介绍一下。

### 7.1 CASE WHEN

最常用的就是使用 `CASE WHEN` 来处理一列或者多列字段值:

???+ example "CASE WHEN 示例"
    === "处理单列"
        
        ```sql
        SELECT 
          CASE 
            WHEN c3 IS NULL THEN "a"
            WHEN c3 BETWEEN 2 AND 4 THEN "b"
            WHEN c3 >= 5 THEN "c"
          ELSE "d" END AS cate
        FROM example;

        -- 输出结果
        --  a
        --  b
        --  c
        ```
    
    === "处理多列"

        ```sql
        SELECT 
          CASE 
            WHEN c3 IS NULL AND c4 IS NULL THEN "a"
            WHEN c3 BETWEEN 2 AND 4 AND c4 != 3 THEN "b"
            WHEN c3 >= 5 AND c4 IS NOT NULL THEN "c"
          ELSE "d" END AS cate
        FROM example;

        -- 输出结果
        --  a
        --  d
        --  c
        ```

### 7.2 CASE a WHEN

实际上如果只是处理单列字段，我们可以还有一个更简单的写法，相当于 C 语言中的 `switch` 语句:

???+ example "NVL使用案例"

    === "CASE WHEN 处理单列最简洁的写法"
        
        ```sql linenums="1" title=""
        SELECT
          CASE c3
            WHEN NULL THEN "a"
            WHEN 4 THEN "b"
            WHEN 5 THEN "c"
            ELSE "d" END AS cate
        FROM example;
        ```


    === "输出结果"
    
        ```sql 
        a
        b
        c
        ```

!!! warning "注意事项"

    这种处理单列字段的写法，更适合于对于枚举值的分类，如果字段值涉及一定的逻辑处理，那么这样写显然就不太合适，需要使用 `CASE a WHEN` 这样的写法。


## 8. ASSERT_TRUE



## 9. 参考资料

- LanguageManual UDF: https://cwiki.apache.org/confluence/display/Hive/LanguageManual+UDF#LanguageManualUDF-ConditionalFunctions
- Hive中NVL和COLESCE的使用: https://www.cnblogs.com/wdh01/p/15843859.html
