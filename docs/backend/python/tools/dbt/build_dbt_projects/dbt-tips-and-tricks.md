# DBT 提示和技巧

使用此页面获取宝贵的见解和实用建议，以增强 DBT 使用体验。无论DBT 新手还是经验丰富的用户，这些提示都旨在帮助您更高效地工作。

以下提示分为以下几类：

- 库提示可帮助我们简化工作流程。
- 高级提示和技术可帮助我们充分利用 DBT。

如果使用 DBT Cloud IDE 进行开发，可以参考键盘快捷键页面，以帮助每个人提高开发效率和轻松度。

## 1. 库提示

利用这些 DBT 包来简化工作流程：

| 库 | 描述 |
| --- | --- |
| `dbt_codegen` | 使用该库可帮助您生成模型和源的 YML 文件以及暂存模型的 SQL 文件。|
| `dbt_utils` | 该库包含对日常开发有用的宏。例如，`date_spine` 生成一个表，其中包含作为参数提供的日期之间的所有日期。|
| `dbt_project_evaluator` | 该库将 DBT 项目与最佳实践列表进行比较，并提供有关如何更新模型的建议和指南。|
| `dbt_expectations` | 该库含许多测试，而不是 DBT 中内置的测试。|
| `dbt_audit_helper` | 该库允许比较 2 个查询的输出，在重构现有逻辑时使用它来确保新结果相同。 |
| `dbt_artifacts` | 该库将有关 DBT 运行的信息直接保存到数据平台，以便可以跟踪模型随时间推移的性能。|
| `dbt_meta_testing` | 此库检查 DBT 项目是否经过充分的测试和记录。|

## 2. 高级提示和技术

- 使用文件夹结构作为主要选择器方法。`dbt build --select marts.marketing` 比依赖标记每个模型更简单、更有弹性。
- 从构建周期调度和 SLA 的角度考虑工作：同时运行具有每小时、每天或每周构建调度的模型。
- 使用 [`where config`](https://docs.getdbt.com/reference/resource-configs/where) 来测试记录子集上的断言。
- [`store_failures`](https://docs.getdbt.com/reference/resource-configs/store_failures) 允许我们检查导致测试失败的记录，以便可以根据需要修复数据或更改测试。
- 使用严谨阈值设置测试的可接受失败次数。
