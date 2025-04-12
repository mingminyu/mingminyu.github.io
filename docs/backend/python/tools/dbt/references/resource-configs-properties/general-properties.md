# 通用属性

## 1. columns

`columns` 可以应用于 `models`、`sources`、`seeds`、`snapshots`、`analyses`。

=== "Models"

    ```yaml title="models/`<filename>`.yml" linenums="1"
    version: 2

    models:
      - name: <model_name>
        columns:
          - name: <column_name>
            data_type: <string>
            description: <markdown_string>
            quote: true | false
            tests: ...
            tags: ...
            meta: ...
          - name: <another_column>
            ...
    ```

=== "Sources"

    ```yaml title="models/`<filename>`.yml" linenums="1"
    version: 2

    sources:
      - name: <source_name>
        tables:
        - name: <table_name>
          columns:
            - name: <column_name>
              data_type: <string>
              description: <markdown_string>
              quote: true | false
              tests: ...
              tags: ...
              meta: ...
            - name: <another_column>
              ...
    ```

=== "Seeds"

    ```yaml title="seeds/`<filename>`.yml" linenums="1"
    version: 2

    seeds:
      - name: <seed_name>
        columns:
          - name: <column_name>
            data_type: <string>
            description: <markdown_string>
            quote: true | false
            tests: ...
            tags: ...
            meta: ...
          
          - name: <another_column>
            ...
    ```

=== "Snapshots"

    ```yaml title="snapshots/`<filename>`.yml" linenums="1"
    version: 2

    snapshots:
      - name: <snapshot_name>
        columns:
          - name: <column_name>
            data_type: <string>
            description: <markdown_string>
            quote: true | false
            tests: ...
            tags: ...
            meta: ...
          
          - name: <another_column>
            ...
    ```

=== "Analyses"

    ```yaml title="analyses/`<filename>`.yml" linenums="1"
    version: 2

    analyses:
      - name: <analysis_name>
        columns:
          - name: <column_name>
            data_type: <string>
            description: <markdown_string>
          
          - name: <another_column>
            ...
    ```

列本身并不是资源。相反，它们是另一种资源类型的子属性，它们可以定义与资源级别定义的属性类似的子属性：`tags`、`meta`、`tests`、`description`。

因为列不是资源，所以它们的 `tags` 和 `meta` 属性不是真正的配置。它们不会继承其父资源的 `tags` 或 `meta` 值。但是，我们可以选择在列上定义的通用测试，使用应用于其列或顶级资源的标签；

列可以选择定义 `data_type`，这是必要的：

- 执行模型规范
- 在其他包或插件中使用，例如 `sources` 和 `dbt-external-tables` 的 `external` 属性

## 2. config

`config` 属性允许我们在 YAML 文件中定义属性的同时配置资源，可以应用于 `models`、`sources`、`seeds`、`snapshots`、`tests`、`metrics`、`exposures`、`semantic models`、`saved queries`。

=== "Models"

    ```yaml title="models/`<filename>`.yml" linenums="1"
    version: 2

    models:
      - name: <model_name>
        config:
          <model_config>: <config_value>
          ...
    ```

=== "Seeds"

    ```yaml title="seeds/`<filename>`.yml" linenums="1"
    version: 2

    seeds:
      - name: <seed_name>
        config:
          <seed_config>: <config_value>
          ...
    ```

=== "Snapshots"

    ```yaml title="snapshots/`<filename>`.yml" linenums="1"
    version: 2

    seeds:
      - name: <snapshot_name>
        config:
          <snapshot_config>: <config_value>
          ...
    ```

=== "Tests"

    ```yaml title="tests/`<filename>`.yml" linenums="1"
    version: 2

    <resource_type>:
      - name: <resource_name>
        tests:
          - <test_name>:
              <argument_name>: <argument_value>
              config:
                <test_config>: <config_value>
                ...
        
        columns:
          - name: <column_name>
            tests:
              - <test_name>
              - <test_name>:
                  <argument_name>: <argument_value>
                  config:
                    <test_config>: <config_value>
                    ...
    ```

=== "Sources"

    ```yaml title="models/`<filename>`.yml" linenums="1"
    version: 2

    sources:
      - name: <source_name>
        config:
          <source_config>: <config_value>
        
        tables:
          - name: <table_name>
            config:
              <table_config>: <config_value>
    ```

=== "Metrics"

    ```yaml title="models/`<filename>`.yml" linenums="1"
    version: 2

    metrics:
      - name: <metric_name>
        config:
          enabled: true | false
          group: <string>
          meta: {dictionary}
    ```

=== "Exposures"

    ```yaml title="models/`<filename>`.yml" linenums="1"
    version: 2

    exposures:
      - name: <exposure_name>
        config:
          enabled: true | false
          meta: {dictionary}
    ```

=== "Semantic models"

    ```yaml title="models/`<filename>`.yml" linenums="1"
    version: 2

    semantic_models:
      - name: <exposure_name>
        config:
          enabled: true | false
          group: <string>
          meta: {dictionary}
    ```

=== "Saved queries"

    ```yaml title="models/`<filename>`.yml" linenums="1"
    version: 2

    saved_queries:
      - name: <saved-query-name>
        config:
          cache:
            enabled: true | false
          enabled: true | false
          export_as: view | table
          group: <string>
          meta: {dictionary}
    ```

## 3. contraints

约束是许多数据平台的一个功能。指定后平台将在数据填充到新表中或插入到预先存在的表中时，会先对数据执行额外的验证。如果验证失败，则表创建或更新失败，操作将回滚，并且您将看到清晰的错误消息。

强制执行时，约束可保证我们永远不会在模型具体化的表中看到无效数据，不同数据平台的执行情况差异很大。

约束条件需要声明和执行模型规范。约束永远不会应用于短暂的模型或具体化为视图的模型，只有表模型和增量模型支持应用和强制约束。

### 3.1 定义约束

可以为单个列定义约束，也可以在模型级别为一个或多列定义约束。作为一般规则，我们建议直接在这些列上定义单列约束。

如果为单个模型定义多个 `primary_key` 约束，则必须在模型级别定义这些约束。不支持在列级别定义多个 `primary_key` 约束。

约束的结构是：

- `type`（必需的）: `not_null`、`unique`、`primary_key`、`check`、`foreign_key`、`custom`
- `expression`: 自由文本输入以限定约束。对于某些约束类型是必需的，对于其他约束类型是可选的。
- `name`（可选）: 约束名称，部分数据平台支持。
- `columns`（仅限模型级别）: 约束应用于的列名列表。

外键约束接受两个附加输入：

- `to`: 关系输入，可能是 `ref()`，指示引用的表。
- `to_columns`: 该表中包含相应主键或者唯一键的列名列表。


这种定义外键的语法使用 `ref`，这意味着它将捕获依赖关系并跨不同环境工作。它在 DBT Cloud“最新”和 DBT Core v1.9+ 中可用。

```yaml title="models/schema.yml" linenums="1"
models:
  - name: <model_name>
    
    # required
    config:
      contract: {enforced: true}
    
    # 模型层的约束
    constraints:
      - type: primary_key
        columns: [first_column, second_column, ...]
      - type: foreign_key  # 多列
        columns: [first_column, second_column, ...]
        to: ref('other_model_name')
        to_columns: [other_model_first_column, other_model_second_columns, ...]
      - type: check
        columns: [first_column, second_column, ...]
        expression: "first_column != second_column"
        name: human_friendly_name
      - type: ...
    
    columns:
      - name: first_column
        data_type: string
        
        # column-level constraints
        constraints:
          - type: not_null
          - type: unique
          - type: foreign_key
            to: ref('other_model_name')
            to_columns: [other_model_column]
          - type: ...
```

### 3.2 特殊平台支持

在事务数据库中，可以对某些列的允许值定义“约束”，比这些值的数据类型更严格。例如，Postgres 支持并强制执行 ANSI SQL 标准中的所有约束（非空、唯一、主键、外键），以及计算结果为布尔表达式的灵活的行级检查约束。

大多数分析数据平台支持并强制执行非空约束，但它们要么不支持，要么不强制执行其余约束。有时仍然需要添加“信息”约束，因为知道它没有强制执行，以便与遗留数据目录或实体关系图工具集成（dbt-core#3295）。如果我们指定额外关键字，某些数据平台可以选择使用主键或外键约束来优化查询。

为此，我们可以在任何过滤器上指定两个可选字段：

- 当 `warn_unenforced: False` 时，则跳过此数据平台支持但不强制执行的约束的警告。该约束将包含在模板化 DDL 中。
- 当 `warn_unsupported: False` 时，则跳过此数据平台不支持的约束的警告，因此不会包含在模板化 DDL 中。


以下为 PostgreSQL 的示例，其他数据库请参考[此文档](https://docs.getdbt.com/reference/resource-properties/constraints)：

```sql title="models/constraints_example.sql" linenums="1"
{{
  config(
    materialized = "table"
  )
}}

select 
  1 as id, 
  'My Favorite Customer' as customer_name, 
  cast('2019-01-01' as date) as first_transaction_date
```

```yaml title="models/schema.yaml" linenums="1"
models:
  - name: dim_customers
    config:
      contract:
        enforced: true
    columns:
      - name: id
        data_type: int
        constraints:
          - type: not_null
          - type: primary_key
          - type: check
            expression: "id > 0"
      - name: customer_name
        data_type: text
      - name: first_transaction_date
        data_type: date
```

预期 DDL 强制执行约束：

```sql title="target/run/.../constraints_example.sql" linenums="1"
create table "database_name"."schema_name"."constraints_example__dbt_tmp"
( 
    id integer not null primary key check (id > 0),
    customer_name text,
    first_transaction_date date    
)
;
insert into "database_name"."schema_name"."constraints_example__dbt_tmp" 
(   
    id,
    customer_name,  
    first_transaction_date
) 
(
select 
    1 as id, 
    'My Favorite Customer' as customer_name, 
    cast('2019-01-01' as date) as first_transaction_date
);
```

### 3.3 自定义约束

在 DBT Cloud 和 DBT Core 中，我们可以对模型使用自定义约束来进行表的高级配置。不同的数据仓库支持不同的语法和功能。

自定义约束允许我们向特定列添加配置，例如：

- 使用 `Create Table As Select` 语法创建表时，在 Snowflake 中设置掩码策略。
- 其他数据仓库（例如 Databrikcs 和 BigQuery） 有自己的一组参数，可以在其 CTAS 语句中为列设置这些参数。

我们可以通过几种不同的方式实现约束：

??? info "带标签的自定义约束"

    以下是如何使用以下语法通过合同和约束实施基于标签的掩码策略的示例：

    ```yaml title="models/constraints_example.yml" linenums="1"
    models:
      - name: my_model
        config:
          contract:
            enforced: true
          materialized: table
        columns:
          - name: id
            data_type: int
            constraints:
              - type: custom
                expression: "tag (my_tag = 'my_value')"  #  自定义 SQL 表达式被用来给列强制添加约束
    ```

    使用此语法需要配置所有列及其类型，因为这是将 `create` 或 `replace <cols_info_with_masking> mytable as ...` 发送的唯一方法不能只使用部分列列表来做到这一点。这意味着确保 `columns` 和 `constraints` 字段已完全定义。

    要生成包含所有列的 YAML，我们可以使用 [dbt-codegen](https://github.com/dbt-labs/dbt-codegen/tree/0.12.1/?tab=readme-ov-file#generate_model_yaml-source) 中的 `generate_model_yaml`。


??? info "不带标签的自定义约束"

    或者，我们可以添加不带标签的掩码策略：

    ```yaml title="models/constraints_example.yml" linenums="1"
    models:
      - name: my_model
        config:
          contract:
            enforced: true
          materialized: table
        columns:
          - name: id
            data_type: int
            constraints:
              - type: custom
                expression: "masking policy my_policy"
    ```

## 4. deprecation_date

