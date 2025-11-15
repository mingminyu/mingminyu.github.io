# 项目设置

## 1. dbt_project.yml

每个 DBT 项目都必需一个 dbt_project.yml 文件，这是让 DBT 知道此目录是 DBT 项目，同时它还包含告诉 DBT 如何操作项目的重要信息。

- DBT 配置文件使用 YAML 格式书写内容。
- 默认情况下，DBT 在当前工作目录及其父目录中查找 dbt_project.yml，但我们可以使用 `--project-dir` 标志或 `DBT_PROJECT_DIR` 环境变量设置不同的目录。
- 使用 DBT Cloud 配置下的 `project-id` 在 dbt_project.yml 文件中指定 DBT Cloud 项目 ID。在 DBT Cloud 项目 URL 中查找项目 ID，例如在 https://YOUR_ACCESS_URL/11/projects/123456 中，项目 ID 为 123456。
- 请注意，如果不是配置（例如宏），则无法在 dbt_project.yml 文件中设置“**属性**”，这适用于所有类型的资源。


```yaml linenums="1" title="dbt_project.yml"
name: string
config-version: 2
version: version
profile: profilename
model-paths: [directorypath]
seed-paths: [directorypath]
test-paths: [directorypath]
analysis-paths: [directorypath]
macro-paths: [directorypath]
snapshot-paths: [directorypath]
docs-paths: [directorypath]
asset-paths: [directorypath]
packages-install-path: directorypath
clean-targets: [directorypath]
query-comment: string
require-dbt-version: version-range | [version-range]

flags:
  <global-configs>

dbt-cloud:
  project-id: project_id # Required
  defer-env-id: environment_id # Optional

quoting:
  database: true| false
  schema: true | false
  identifier: true | false

metrics:
  <metric-configs>

models:
  <model-configs>

seeds:
  <seed-configs>

semantic-models:
  <semantic-model-configs>

saved-queries:
  <saved-queries-configs>

snapshots:
  <snapshot-configs>

sources:
  <source-configs>

tests:
  <test-configs>

vars:
  <variables>

on-run-start: sql-statement |[sql-statement]
on-run-end: sql-statement |[sql-statement]

dispatch:
  - macro_namespace: packagename
    search_order: [packagename]

restrict-access: true | false
```

对于 dbt_project.yml 文件中的配置，遵循正确的 YAML 命名约定非常重要，以确保 DBT 可以正确处理它们。

- 在 dbt_project.yml 文件中配置具有多个单词的资源类型时，请使用破折号 (`-`)。以下是已保存查询的示例：

    ```yaml linenums="1" title="dbt_project.yml" hl-lines="1-2"
    saved-queries:  # Use dashes for resource types in the dbt_project.yml file.
      my_saved_query:
        +cache:
          enabled: true
    ```

- 为 dbt_project.yml 文件以外的 YAML 文件配置多个单词的资源类型时，请使用下划线（`_`）。例如，以下是在 semantic_models.yml 文件中保存的相同查询资源：

    ```yaml linenums="1" title="dbt_project.yml" hl-lines="1-2"
    saved-queries:  # Use dashes for resource types in the dbt_project.yml file.
      - name: saved_query_name
        ...
        config:
          +cache:
            enabled: true
    ```

### 1.1 name

### 1.2 config-version

### 1.3 version

### 1.4 profile

### 1.5 model-paths

### 1.6 seed-paths

### 1.7 test-paths

### 1.8 analysis-paths

`analysis-paths` 用于指定分析所在目录，如果不指定的话，DBT 将不会编译任何 .sql 文件作为分析。

如果你使用 `dbt init` 初始化项目，会默认使用 `analyses` 填充 `analysis-paths`。如果修改为自定义的子目录路径，请确保该一定存在。

```yaml title="dbt_project.yml"
analysis-paths: ["analyses"]
```

!!! warning "注意"

    `analysis-paths` 中指定的路径必须 **相对于** dbt_project.yml 文件的位置，请避免使用 `/Users/username/project/analysis` 等绝对路径，因为这会导致意外的行为和结果。


### 1.9 macro-paths

### 1.10 snapshot-paths

### 1.11 docs-paths

### 1.12 asset-paths

`asset-paths` 是一个可选配置项，一般是运行 `dbt docs generate` 命令生成已经太文档时，指定要复制到 `target` 文件夹下的自定义目录列表，这对于在项目文档中渲染存储库中的图像非常有用。

默认情况下，DBT 不会复制任何其他文件作为文档生成的一部分，例如 `asset-paths: []`。


!!! warning "注意"

    `asset-paths` 中指定的路径必须 **相对于** dbt_project.yml 文件的位置，请避免使用 `/Users/username/project/assets` 等绝对路径，因为这会导致意外的行为和结果。

### 1.13 packages-install-path

### 1.14 clean-targets

### 1.15 query-comment

### 1.16 on-run-start & on-run-end

### 1.17 quoting

### 1.18 dispatch(config)

### 1.19 require-dbt-version


## 2. .dbtignore

我们可以在 DBT 项目的根目录中创建 .dbtignore 文件来指定应完全忽略的文件，该文件的作用类似于 .gitignore 文件，并且使用相同的语法。

```bash linenums="1"
# .dbtignore

# ignore individual .py files
not-a-dbt-model.py
another-non-dbt-model.py

# ignore all .py files
**.py

# ignore all .py files with "codegen" in the filename
*codegen*.py

# ignore all folders in a directory
path/to/folders/**

# ignore some folders in a directory
path/to/folders/subfolder/**
```
