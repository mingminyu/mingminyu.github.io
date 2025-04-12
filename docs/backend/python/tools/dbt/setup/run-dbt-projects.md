# 运行 DBT 项目

## 1. DBT CLI

我们可以在 DBT Cloud 或者 DBT Core 中运行 DBT 项目：

- DBT Cloud: 一个托管应用程序，我们可以使用 DBT Cloud IDE 直接在浏览器进行开发，它还原生支持使用命令行界面 DBT Cloud CLI 进行开发。除其他功能外，DBT Cloud 还提供：
  - 开发环境可帮助您更快地构建、测试、运行和版本控制项目；
  - 的团队共享 DBT 项目的文档；
  - 与 DBT Cloud IDE 集成，允许我们在 DBT Cloud UI 中运行开发任务和环境，以获得无缝体验；
  - DBT Cloud CLI 用于从本地命令行针对 DBT Cloud 开发环境开发和运行 `dbt` 命令。

- DBT Core: 开源项目，适合本地开发者。

DBT Cloud CLI 和 DBT Core 都是命令行工具，可让运行 `dbt` 命令，主要区别在于 DBT Cloud CLI 是针对 DBT Cloud 基础设施量身定制的，并与其所有功能集成。值得注意的是，在命令行运行 DBT 项目之前，请确保正在 DBT 项目目录中工作。

## 2. 常用命令

在 DBT Cloud 或 DBT Core 中，常用的命令有：

| 命令 | 描述 |
| --- | --- |
| `dbt run` | 运行项目中定义的模型 |
| `dbt build` | 构建并测试您选择的资源，例如模型、种子、快照和测试 |
| `dbt test` | 测试项目中定义的模型 |
| `dbt debug` | 调试 DBT 项目 |
| `dbt docs generate` | 生成 DBT 项目文档 |
| `dbt docs serve` | 启动 DBT 项目 WEB 文档服务，默认端口为 8000 |


有关所有 DBT 命令及其参数的信息，请参阅 [DBT 命令参考](https://docs.getdbt.com/reference/dbt-commands)。如果要从命令行列出所有 DBT 命令，请运行 `dbt --help`。要列出 `dbt` 命令的特定参数，请运行 `dbt COMMAND_NAME --help`。

