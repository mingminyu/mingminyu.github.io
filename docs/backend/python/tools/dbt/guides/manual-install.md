# 手动安装 DBT Core 快速入门

## 1. 简介

通过 DBT Core 使用 DBT 时，我们将使用代码编辑器在本地编辑，并使用命令行界面 (CLI) 运行项目。如果你想使用基于 Web UI 的 DBT 集成开发环境 (IDE) 编辑文件并运行项目，请参阅 [DBT Cloud 快速入门](https://docs.getdbt.com/guides)。此外，还可以使用 [DBT Cloud CLI](https://docs.getdbt.com/docs/cloud/cloud-cli-installation)（DBT Cloud 支持的命令行）开发和运行 `dbt` 命令。

完成 DBT Cloud 快速入门系列，需要必要的设置和加载数据步骤。例如，对于 BigQuery，完成[设置](https://docs.getdbt.com/guides/bigquery?step=2)和[加载数据](https://docs.getdbt.com/guides/bigquery?step=3)。设置好 BigQuery 后就可以使用 `dbt` 了，接着就能使用示例模型创建入门项目。

## 2. 创建项目

这里假设我们已经成功安装了 `dbt-core` 以及 `git` 工具，接下来我们新建一个项目：

```bash linenums="1"
dbt init feat_shop
```

过程中 DBT 会提示选择的数据库连接信息以及项目信息等，具体项目结构如下所示：

```bash
feat_shop
├── README.md
├── analyses
├── dbt_packages
├── dbt_project.yml
├── logs
│   └── dbt.log
├── macros
├── models
│   └── example
│       ├── my_first_dbt_model.sql
│       ├── my_second_dbt_model.sql
│       └── schema.yml
├── seeds
├── snapshots
├── target
│   ├── catalog.json
│   ├── compiled
│   │   └── feat_shop
│   │       └── models
│   ├── graph.gpickle
│   ├── graph_summary.json
│   ├── index.html
│   ├── manifest.json
│   ├── partial_parse.msgpack
│   ├── run
│   │   └── feat_shop
│   │       └── models
│   ├── run_results.json
│   └── semantic_manifest.json
└── tests
```

其中 `dbt_project.yml` 文件为项目的配置文件。

```yaml linenums="1" title="dbt_project.yml"
name: 'feat_shop'
version: '1.0.0'

# 该 profile 值需要与 ~/.dbt/profiles.yml 文件中配置的 profile 名称对应上
profile: 'feat_shop'

model-paths: ["models"]
analysis-paths: ["analyses"]
test-paths: ["tests"]
seed-paths: ["seeds"]
macro-paths: ["macros"]
snapshot-paths: ["snapshots"]

clean-targets:  # `dbt clean` 清除的目录
  - "target"
  - "dbt_packages"

models:
  feat_shop:
    # 通过 `+` 可以直接配置配置所有 models/example 下的文件
    example:
      +materialized: view
```

## 3. 配置数据库连接信息

这里以 Google BigQuery 为例，在 ~/.dbt/profiles.yml 文件中配置数据库连接信息。

```yaml linenums="1" title="~/.dbt/profiles.yml"
feat_shop:  # 需要与项目文件 dbt_project.yml 中 profile 字段值
  target: dev
  outputs:
    dev:
      type: bigquery
      method: service-account
      keyfile: /Users/yumingmin/.dbt/dbt-tutorial-project-331118.json # 全路径的秘钥文件
      project: grand-highway-265418 # 项目ID id
      dataset: dbt_bbagins # Replace this with dbt_your_name, e.g. dbt_bilbo
      threads: 1
      timeout_seconds: 300
      location: US
      priority: interactive
```

我们可以使用 `dbt debug` 命令来验证项目配置是否正确。

![调试](../images/20250102-01.png)

## 4. 运行项目

通过 `dbt run` 命令来运行项目，你会看到如下输出信息：

![alt text](../images/20250102-02.png)

## 5. 提交更改

我们建议使用 Git 来对项目进行版本控制，从而可对历史更改进行追溯与回滚。

```bash linenums="1"
git init
git branch -M main
git add .
git commit -m "Create a dbt project"
git remote add origin https://github.com/mingminyu/dbt-tutorial.git
git push -u origin main
```

执行完上述操作后，建议在 GitHub 上查看是否更改信息已成功提交。

## 6. 创建 Git 分支

对于项目的更改最好是创建一个分支，通过 Git 提供的强大功能，可以最便利地管理更改。

```bash linenums="1"
git checkout -b add-customers-model
```

## 7. 构建模型

在 `models` 目录下创建 `customers.sql` 文件，并添加以下内（关于 Redshift 和 Snowflake 可查看[示例代码](https://docs.getdbt.com/guides/manual-install?step=8)）：

=== "BigQuery"

    ```sql linenums="1"
    with customers as (
        select
            id as customer_id,
            first_name,
            last_name
        from `dbt-tutorial`.jaffle_shop.customers
    ),

    orders as (
        select
            id as order_id,
            user_id as customer_id,
            order_date,
            status

        from `dbt-tutorial`.jaffle_shop.orders
    ),

    customer_orders as (
        select
            customer_id,
            min(order_date) as first_order_date,
            max(order_date) as most_recent_order_date,
            count(order_id) as number_of_orders

        from orders
        group by 1
    ),

    final as (
        select
            customers.customer_id,
            customers.first_name,
            customers.last_name,
            customer_orders.first_order_date,
            customer_orders.most_recent_order_date,
            coalesce(customer_orders.number_of_orders, 0) as number_of_orders
        from customers
        left join customer_orders using (customer_id)
    )

    select * from final
    ```

=== "Databricks"

    ```sql linenums="1"
    with customers as (
        select
            id as customer_id,
            first_name,
            last_name
        from jaffle_shop_customers
    ),

    orders as (
        select
            id as order_id,
            user_id as customer_id,
            order_date,
            status
        from jaffle_shop_orders
    ),

    customer_orders as (
        select
            customer_id,
            min(order_date) as first_order_date,
            max(order_date) as most_recent_order_date,
            count(order_id) as number_of_orders
        from orders
        group by 1
    ),

    final as (
        select
            customers.customer_id,
            customers.first_name,
            customers.last_name,
            customer_orders.first_order_date,
            customer_orders.most_recent_order_date,
            coalesce(customer_orders.number_of_orders, 0) as number_of_orders
        from customers
        left join customer_orders using (customer_id)
    )

    select * from final
    ```

建立好数据模型后，使用 `dbt run` 命令来运行项目。

![alt text](../images/20250102-03.png)

## 8. 更改模型的具现化方式

DBT 最强大的功能之一是我们只需更改配置值即可更改模型在仓库中具体化的方式，它通过更改关键字来更改表和视图之间的内容，而不是编写数据定义语言 (DDL) 在幕后执行此操作。

默认情况下，所有内容都会创建为视图，我们可以在目录级别覆盖它，以便该目录中的所有内容都将具体化为不同的具体化。

1. 编辑 `dbt_project.yml` 文件，更新以下内容：

    ```yaml linenums="1" title="dbt_project.yml" hl_lines="1 18-21"
    name: 'jaffle_shop'
    version: '1.0.0'

    profile: 'feat_shop'

    model-paths: ["models"]
    analysis-paths: ["analyses"]
    test-paths: ["tests"]
    seed-paths: ["seeds"]
    macro-paths: ["macros"]
    snapshot-paths: ["snapshots"]

    clean-targets:
    - "target"
    - "dbt_packages"

    models:
    jaffle_shop:
        +materialized: table
        example:
        +materialized: view
    ```

2. 使用 `dbt run` 命令来运行项目，对应的 `customers` 模型将进行建表。

    !!! info "注意"

        执行过程汇总，DBT 会先执行 `DROP VIEW` 语句，然后执行 `CREATE TABLE AS` 语句。


3. 我们可以编辑 `models/customers.sql` 来覆盖 `dbt_project.yml` 文件中定义的 `materialized` 值，只需要将如下代码添加到顶部就好：

    ```sql linenums="1" title="models/customers.sql" hl_lines="1-3"
    {{
        config(materialized='view')
    }}

    with customers as (
        ...
    )
    ```

4. 使用 `dbt run` 命令来运行项目，对应的 `customers` 模型将重新进行构建视图。需要注意的是，对于 Google BigQuery，需要使用 `dbt run --full-refresh` 替换 `dbt run` 以确保视图被刷新。

5. 执行 `dbt run --full-refresh` 命令使更改得以生效。

## 9. 删除 example 模型

由于 `example` 模型是 DBT 给我们自带的示例数据模型，我们可以删除 `example` 文件夹·，并在 `dbt_project.yml` 文件中删除 `example` 相关值。

## 10. 在其他模型上构建模型

经常使用 SQL 构建特征的同学知道，很多时间我们会去做数据清洗以及数据转换，但很多时间这两者逻辑并不能完全分开。DBT 给我们非常便利的工具将逻辑分离为单独的模型，并通过 `ref` 函数在其他模型纸上进行引用。

![我们期望构建的 DAG](../images/20250102-04.png)

1. 在 `models` 目录下创建 `stg_customers.sql` 以及 `stg_orders.sql` 文件 ，并添加以下内容：

    === "stg_customers.sql"

        ```sql linenums="1"
        select
            id as customer_id,
            first_name,
            last_name
        from `dbt-tutorial`.jaffle_shop.customers
        ```
    
    === "stg_orders.sql"

        ```sql linenums="1"
        select
            id as order_id,
            user_id as customer_id,
            order_date,
            status

        from `dbt-tutorial`.jaffle_shop.orders
        ```

2. 编辑 models/customers.sql 文件中的 SQL，如下所示：

    ```sql linenums="1" title="models/customers.sql" hl_lines="2 6"
    with customers as (
        select * from {{ ref('stg_customers') }}
    ),

    orders as (
        select * from {{ ref('stg_orders') }}
    ),

    customer_orders as (
        select
            customer_id,
            min(order_date) as first_order_date,
            max(order_date) as most_recent_order_date,
            count(order_id) as number_of_orders
        from orders
        group by 1

    ),

    final as (
        select
            customers.customer_id,
            customers.first_name,
            customers.last_name,
            customer_orders.first_order_date,
            customer_orders.most_recent_order_date,
            coalesce(customer_orders.number_of_orders, 0) as number_of_orders
        from customers
        left join customer_orders using (customer_id)
    )

    select * from final
    ```

3. 使用 `dbt run` 命令来运行项目。


当我们执行 `dbt run` 命令时，DBT 将为 `stg_customers`、`stg_orders` 和 `customers` 创建单独的视图/表。DBT 将推断出运行这些模型的顺序。由于 `customers` 表依赖于 `stg_customers` 和 `stg_orders`，但我们不需要显式定义这些依赖项，DBT 会帮我们解决。

## 11. 创建模型测试

DBT 支持向项目添加测试有助于验证数据模型是否正常工作，以下演示下如何给模型添加测试。


1. 在 `models` 目录下创建 `schema.yml` 文件，并添加以下内容。

    ```yaml linenums="1" title="models/schema.yml" hl_lines="7-9"
    version: 2

    models:
    - name: customers
        columns:
        - name: customer_id
            tests:
            - unique
            - not_null

    - name: stg_customers
        columns:
        - name: customer_id
            tests:
            - unique
            - not_null

    - name: stg_orders
        columns:
        - name: order_id
            tests:
            - unique
            - not_null
        
        - name: status
            tests:
            - accepted_values:
                values: ['placed', 'shipped', 'completed', 'return_pending', 'returned']

        - name: customer_id
            tests:
            - not_null
            - relationships:
                to: ref('stg_customers')
                field: customer_id
    ```

2. 使用 `dbt test` 命令来运行测试。


当我们运行 `dbt test` 时，DBT 会迭代 YAML 文件，并为每个测试构建一个查询。每个查询将返回未通过测试的记录数。如果该数字为 0，则测试成功。

## 12. 建立模型文档

给项目添加文档可以详细描述模型，并与团队共享该信息。在这里，我们将为我们的项目添加一些基本文档。

1. 更新您的 models/schema.yml 文件以包含一些字段描述，如下所示。

    ```yaml linenums="1" title="models/schema.yml" hl_lines="5 8 13"
    version: 2

    models:
    - name: customers
        description: One record per customer
        columns:
        - name: customer_id
            description: Primary key
            tests:
            - unique
            - not_null
        - name: first_order_date
            description: NULL when a customer has not yet placed an order.

    - name: stg_customers
        description: This model cleans up customer data
        columns:
        - name: customer_id
            description: Primary key
            tests:
            - unique
            - not_null

    - name: stg_orders
        description: This model cleans up order data
        columns:
        - name: order_id
            description: Primary key
            tests:
            - unique
            - not_null
        - name: status
            tests:
            - accepted_values:
                values: ['placed', 'shipped', 'completed', 'return_pending', 'returned']
        - name: customer_id
            tests:
            - not_null
            - relationships:
                to: ref('stg_customers')
                field: customer_id
    ```

2. 运行 `dbt docs generate` 来生成项目的文档。DBT 会检查我们的项目和仓库，以生成一个 JSON 文件，其中包含有关项目的丰富文档。

3. 运行 `dbt docs serve` 来启动一个本地服务器，该服务器将显示项目文档。

## 13. 提交更新后的更改

如常规 Git 操作一样，我们将更改推送至远程仓库。

```bash linenums="1"
git add -A
git commit -m "Add customers model, tests, docs"
git push
```

## 14. 任务调度

我们建议使用 DBT Cloud 作为在生产中部署作业和自动化 DBT 项目的最简单、最可靠的方法。有关使用 DBT Core 任务调度的更多信息，请参阅 [DBT Airflow](https://docs.getdbt.com/blog/dbt-airflow-spiritual-alignment) 博客文章。

