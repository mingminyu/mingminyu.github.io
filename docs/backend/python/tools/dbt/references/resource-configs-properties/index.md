# 资源配置和属性

项目中的资源（例如 `models`、`snapshots`、`seeds` 以及 `tests` 等）有很多声明的属性，此外资源还可以定义配置（一种提供额外功能的特殊属性）。

- 资源的属性在 properties.yml 文件中进行声明，通常嵌套在 `config` 属性下。它们还可以通过 `config()` 宏（就在 .sql 文件中）进行设置，并在 dbt_project.yml 中同时设置许多资源。
- 由于配置可以在多个地方设置，因此它们也可以采用分层应用，单个资源可能会继承或覆盖其他地方设置的配置。
- 基于 `config:` 配置的值选择资源，但不能选择未配置属性的值。
- 根据文件类型的不同，属性和配置的命名约定略有不同。

经验法则：属性声明最好是与项目资源有关的信息；配置执行了额外的步骤，它告诉 dbt 如何在数据库中构建这些资源。这通常是正确的，但并非总是如此，因此检查一下总是好的！

例如，我们可以使用资源属性来：

- 描述模型(models)、快照(snapshots)、种子文件(seeds)及其列。
- 通过数据测试的形式断言模型的“真相”，例如“这个 id 列是唯一的”。
- 通过 `source` 的方式给原始数据表添加指针，并断言该原始数据的预期 `freshness`。
- 显式地定义数据模型的下游用途。

我们可以使用配置完成以下事项：

- 更改模型的具体化方式（表、视图、增量等）
- 声明将在数据库中创建种子的位置 (`<database>.<schema>.<alias>`)
- 声明资源是否应将其描述作为注释保留在数据库中
- 应用标签和 `meta` 属性

## 1. 如何定义资源配置

根据资源类型，可以通过以下方式在 DBT 项目以及已安装的包中定义配置：

- 使用 `models`、`snapshots`、`seeds`、`analyses` 或 `tests` 目录中 .yml 文件中的配置属性
- 在 dbt_project.yml 文件中，在相应的资源属性下（`models:`、`snapshots:`、`tests:` 等）

### 1.1 配置继承

最具体的配置始终优先，通常遵循的顺序为（从高到底）：文件内 `config()` 块 --> .yml 文件中定义的属性 --> 项目文件中定义的配置。注意，特殊情况下，通用数据测试的工作方式略有不同。

在项目文件中，配置也是分层应用的，当然最具体的配置优先级最高。例如在项目文件中，作用于 `marketing` 子目录的配置将优先于作用于整个 `jaffle_shop` 项目的配置。要将配置应用于模型或模型目录，请将资源路径定义为嵌套字典键。

DBT 项目根目录下的配置比已安装软件包中的配置具有更高的优先级，这使我们能够覆盖已安装软件包的配置，从而更好地控制 DBT 运行。

### 1.2 组合配置

大多数配置在分层应用时都会被“破坏”，每当有 **更具体** 的值可用时，它将完全取代 **不太具体** 的值。请注意，一些配置具有不同的合并行为：

- `tags` 是可添加的，如果模型在 dbt_project.yml 中配置了一些标签，并在其 .sql 文件中应用了更多标签，则最终的标签集将包含所有标签。
- `meta` 字典被合并（更具体的键值对用相同的键替换不太具体的值）。
- `pre-hook` 和 `post-hook` 同样也是可添加的。

## 2. 如何定义属性

在 DBT 项目中，我们可以使用 properties.yml 文件来定义资源的属性，该文件位于与资源相同的目录中。这些 YAML 文件的命名可以随意，并将它们任意嵌套在每个目录内的子文件夹中。我们强烈建议在专用路径中定义属性及其所描述的资源。

!!! info "schema.yml 文件"

    早期版本的文档将这些文件称为 schema.yml 文件，我们已经放弃了该术语，因为在谈论数据库时，`schema` 一词常用于表示其他事物，并且人们通常将这些文件命名为 schema.yml。

    相反，我们现在将这些文件称为 properties.yml 文件。 当然，我们仍然可以随意将文件命名为 schema.yml。

### 2.1 哪些属性不是配置？

在 DBT 中，除了 `config()` 块和 dbt_project.yml 之外，我们还可以在 properties.yml 文件中定义节点配置。但是，一些特殊属性只能在 .yml 文件中定义，不能使用 `config()` 块或 dbt_project.yml 文件配置它们。

某些属性很特殊，因为：

- 它们有独特的 Jinja 渲染上下文
- 它们创建新的项目资源
- 它们作为分层配置时没有意义
- 它们是尚未被重新定义为配置的较旧属性

这些属性是：

- `description`
- `tests`
- `docs`
- `columns`
- `quote`
- `source` 属性（例如 `loaded_at_field`、`freshness`）
- `exposure` 属性（例如 `type`、`maturity`）
- `macro` 属性（例如 `arguments`）

## 3. 示例

接下来，我们看一个在项目中定义 `sources` 以及 `models` 的示例。

```yaml title="models/jaffle_shop.yml" linenums="1" hl_lines="3 31"
version: 2

sources:
  - name: raw_jaffle_shop
    description: A replica of the postgres database used to power the jaffle_shop app.
    tables:
      - name: customers
        columns:
          - name: id
            description: Primary key of the table
            tests:
              - unique
              - not_null

      - name: orders
        columns:
          - name: id
            description: Primary key of the table
            tests:
              - unique
              - not_null

          - name: user_id
            description: Foreign key to customers

          - name: status
            tests:
              - accepted_values:
                  values: ['placed', 'shipped', 'completed', 'return_pending', 'returned']

models:
  - name: stg_jaffle_shop__customers
    config:
      tags: ['pii']
    columns:
      - name: customer_id
        tests:
          - unique
          - not_null

  - name: stg_jaffle_shop__orders
    config:
      materialized: view
    columns:
      - name: order_id
        tests:
          - unique
          - not_null
      - name: status
        tests:
          - accepted_values:
              values: ['placed', 'shipped', 'completed', 'return_pending', 'returned']
              config:
                severity: warn
```

## 4. 常见问题

??? question "包含测试和描述的 YAML 文件是否需要命名为 schema.yml ？"

    不需要，我们可以将文件命名为任意名称，只需要满足如下条件：

    - 该文件位于 `models` 目录下
    - 该文件必须以 `.yml` 为后缀

    如果我们要声明 `seeds`、`snapshots` 或 `macros` 的属性，还可以将此文件分别放置在相关目录中。

??? question "既然可以随意命名，那么应该命名成什么？"

    一般这取决于个人喜好，通常有下几种选择：

    - 默认可以命名为 `schema.yml`（尽管这确实使得随着时间的推移很难找到正确的文件）。
    - 使用与目录相同的名称（假设我们为目录使用合理的名称）。
    - 如果我们测试并记录每个文件一个模型（或种子、快照、宏等），则可以为其指定与模型（或种子、快照、宏等）相同的名称。

??? question "使用单独的文件来生声明资源属性，还是使用一个大文件？"

    这取决于个人的喜好：

    - 有些人发现每个模型（或种子、快照、宏等）一个文件会很有用）有一个文件会很有用。
    - 有些人发现每个目录都有一个记录多个模型的文档以及测试的文件会很有用。

??? question "可以在配置块中添加测试和描述吗？"

    除了 `config()` 块和 dbt_project.yml 之外，DBT 还能够在 .yml 文件中定义节点配置。但反之正则不然：.yml 文件中的某些内容只能在其中定义。

    某些属性很特殊，因为：

    - 它们有独特的 Jinja 渲染上下文
    - 它们创建新的项目资源
    - 它们作为分层配置时没有意义
    - 它们是尚未被重新定义为配置的较旧属性

    这些属性是：

    - `description`
    - `tests`
    - `docs`
    - `columns`
    - `quote`
    - `source` 属性（例如 `loaded_at_field`、`freshness`）
    - `exposure` 属性（例如 `type`、`maturity`）
    - `macro` 属性（例如 `arguments`）

??? question "为什么模型和源 YAML 文件咋总是以 `version: 2` 开头？"

    曾几何时，这些 .yml 文件的结构非常不同（对于当时使用 DBT 的任何人来说都是如此！），添加 `version: 2` 使我们能够使这个结构更具可扩展性。

    资源 YAML 文件当前不需要此配置。如果指定，我们仅支持 `version：2`。虽然我们不期望很快将 yml 文件更新到 `version：3`，但是有了这个配置将使我们将来更容易引入新的结构。

??? question "可以使用 .yaml 文件扩展名？"

    不可以。目前 DBT 只会搜索文件扩展名为 .yml 的文件。在未来版本中，DBT 还将搜索具有 **.yaml** 文件扩展名的文件。

## 5. 常见错误故障排除

??? failure "Invalid test config given in [model name]"

    当 .yml 文件不符合 DBT 预期的结构时，就会出现此错误。完整的错误消息可能如下所示：

    ```bash
    * Invalid test config given in models/schema.yml near {'namee': 'event', ...}
    Invalid arguments passed to "UnparsedNodeUpdate" instance: 'name' is a required property, Additional properties are not allowed ('namee' was unexpected)
    ```

    虽然报错很冗长，但像这样的错误应该可以帮助您找到问题。在这里，名称字段意外地被提供为 `namee`。要修复此错误，请确保我们的 .yml 符合本指南中描述的预期结构。


??? failure "Invalid syntax in your schema.yml file"

    如果 .yml 文件不是有效的 YAML，那么 DBT 将向您显示如下错误：

    ```bash
    Runtime Error
    Syntax error near line 6
    ------------------------------
    5  |   - name: events
    6  |     description; "A table containing clickstream events from the marketing website"
    7  |

    Raw Error:
    ------------------------------
    while scanning a simple key
        in "<unicode string>", line 6, column 5:
            description; "A table containing clickstream events from the marketing website"
            ^
    ```

    发生此错误的原因是在描述字段后面意外使用了分号 (`;`)，而不是冒号 (`:`)。要解决此类问题，请找到错误消息中引用的 .yml 文件并修复该文件中存在的任何语法错误。有在线 YAML 验证器可以在这里提供帮助，但请注意向第三方应用程序提交敏感信息！
