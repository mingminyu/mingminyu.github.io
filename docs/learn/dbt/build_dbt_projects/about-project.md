# 关于 DBT 项目

DBT 会从项目会得知上下文以及转换数据（构建数据集）的方式。根据设计，DBT 强制要求项目的顶级结构，例如 dbt_project.yml 文件、`models` 目录、`snapshots` 目录等。在顶级目录中，您可以按满足组织和数据管道需求的任何方式组织项目。

项目至少需要的是 dbt_project.yml 项目配置文件。DBT 支持许多不同的资源，因此项目还可能包括：

| 资源 | 描述 |
| --- | --- |
| `models` | 每个模型都位于单个文件中，并包含将原始数据转换为可用于分析的数据集的逻辑，或者更常见的是，它是此类转换的中间步骤。|
| `snapshots` | 一种捕获可变表状态的方法，以便我们以后可以参考它。|
| `seeds` | CSV 文件，其中包含可以使用 DBT 加载到数据平台中的静态数据。|
| `tests` | 您可以编写的 SQL 查询来测试项目中的模型和资源。|
| `macros` | 可以多次重用的代码块。|
| `docs` | 构建的项目的文档 |
| `sources` | 一种命名和描述通过 `Extract`（提取）和 `Load`（加载） 工具加载到仓库中的数据的方法。 |
| `exposures` | 一种定义和描述项目的下游使用的方法。|
| `metrics` | 一种用于定义项目指标的方法。|
| `groups` | 组可以在受限集合中实现协作节点组织。|
| `analysis` | 一种在项目中组织分析 SQL 查询的方法，例如 QuickBooks 中的总账。|
| `semantic_models` | 语义模型定义 MetricFlow 和 DBT 语义层中的基础数据关系，使您能够使用语义图查询指标。|
| `saved_queries` | 保存的查询通过将指标、维度和筛选器分组到 DBT DAG 中可见的节点中来组织可重用查询。|

在构建项目结构时，您应该考虑这些对组织工作流程的影响：

- **如何运行 DBT 命令** —— 选择路径。
- **如何在项目中导航** —— 无论是作为 IDE 中的开发人员还是文档中的利益相关者。
- **如何配置模型** —— 一些批量配置在目录级别更容易完成，因此人们不必记住在每个新模型的配置块中执行所有操作。

## 1. 项目配置

每个 DBT 项目都包含一个名为 dbt_project.yml 的项目配置文件,它定义了 DBT 项目和其他项目配置的目录。

dbt_project.yml 常见的项目配置参数如下：

| 参数 | 描述 |
| --- | --- |
| `name` | 项目名称 |
| `version` | 项目版本 |
| `require-dbt-version` | DBT 版本 |
| `profile` | 配置文件名称 |
| `model-paths` | 模型目录 |
| `seed-paths` | 种子文件的目录 |
| `test-paths` | 测试的路径 |
| `analysis-paths` | 分析的目录 |
| `macro-paths` | 宏的目录 |
| `snapshot-paths` | 快照的目录 |
| `docs-paths` | 文档的目录 |
| `vars`| 要用于数据编译的项目变量 |

## 2. 项目子目录

## 3. 创建新项目

使用 `dbt init` 命令创建新项目，在项目初始化期间，DBT 会在项目目录中创建示例模型文件，以帮助我们快速开始开发。

## 4. 示例项目

如果想更深入地探索 DBT 项目，可以在 GitHub 上克隆 DBT Labs 的 [Jaffle shop](https://github.com/dbt-labs/jaffle_shop)。它是一个可运行的项目，包含示例配置和有用的注释。

如果您想了解成熟的生产项目是什么样子，请查看 [GitLab 数据团队公共存储库](https://gitlab.com/gitlab-data/analytics/-/tree/master/transform/snowflake-dbt)。
