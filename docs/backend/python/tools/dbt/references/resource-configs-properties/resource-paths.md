# 资源路径

本文档在记录如何从 dbt_project.yml 文件配置资源类型（例如模型、种子、快照、测试、源等）时使用 `<resource-path>` 命名法。它使用嵌套字典键表示，提供该资源类型的目录路径，或按名称提供该资源类型的单个实例。

```yaml linenums="1" title="dbt_project.yml"
resource_type:
  project_name:
    directory_name:
      subdirectory_name:
        instance_of_resource_type (by name):
          ...
```

以下示例主要针对模型（`models`）和源（`source`），但相同的概念也适用于种子（`seeds`）、快照（`snapshots`）、测试（`tests`）、源（`sources`）和其他资源类型。

## 1. 将配置应用于所有模型

要将配置应用于所有模型，请勿使用 `<resource-path>`：

```yaml linenums="1" title="dbt_project.yml"
models:
  +enabled: false  # 关闭应用于所有模型设置
```

## 2. 将配置应用于项目中的所有模型

要将配置仅应用于项目中的所有模型，请使用项目名称作为 `<resource-path>`：

```yaml linenums="1" title="dbt_project.yml"
name: jaffle_shop

models:
  jaffle_shop:
    +enabled: false # 只关闭 jaffle_shop 项目中的所有模型应用设置
```

## 3. 将配置应用于子目录中的所有模型

将配置应用于项目子目录中的所有模型，例如 `staging`，将目录嵌套在项目名称下：

```yaml linenums="1" title="dbt_project.yml"
name: jaffle_shop

models:
  jaffle_shop:
    staging:
      +enabled: false  # 应用于项目中 `staging` 目录下的所有模型
```

在以下项目中，这将适用于 `staging` 目录中的模型，但不适用于 `marts` 目录中的模型：

```bash
.
├── dbt_project.yml
└── models
    ├── marts
    └── staging
```

## 4. 将配置应用于特定模型

要将配置应用于特定模型，请将完整路径嵌套在项目名称下。对于 `/staging/stripe/payments.sql` 中的模型，这看起来像：

```yaml linenums="1" title="dbt_project.yml"
name: jaffle_shop

models:
  jaffle_shop:
    staging:
      stripe:
        payments:
          +enabled: false  # 只应用于一个模型
```

在以下项目中，这仅适用于 `payments` 模型：

```bash
.
├── dbt_project.yml
└── models
    ├── marts
    │   └── core
    │       ├── dim_customers.sql
    │       └── fct_orders.sql
    └── staging
        ├── jaffle_shop
        │   ├── customers.sql
        │   └── orders.sql
        └── stripe
            └── payments.sql
```

## 5. 将配置应用于嵌套子文件夹中的源​

要禁用嵌套在子文件夹中的 YAML 文件中的源表，我们需要在该 YAML 文件的路径中提供子文件夹，以及 dbt_project.yml 文件中的源名称和表名称。以下示例显示如何禁用嵌套在子文件夹中的 YAML 文件中的源表：

```yaml linenums="1" title="dbt_project.yml"
sources:
  your_project_name:
    subdirectory_name:
      source_name:
        source_table_name:
          +enabled: false
```
