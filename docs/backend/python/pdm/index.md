# PDM 简介

如前所述，PDM 是一个支持最新 PEP 标准的现代 Python 包和依赖项管理器。但它不仅仅是一个包管理器。它可以在各个方面提升您的开发工作流程。

PDM 有许多功能亮点:

- 简单快速的依赖解析器，主要用于大型二进制发行版。
- 根据 PEP 517 规范构建后端。
- 根据 PEP 621 规范解析项目元数据。
- 灵活而强大的插件系统。
- 多功能用户脚本。
- 使用 indygreg's python-build-standalone 进行安装其他版本的 Python。
- 参考 PNPM 设计思路，选择加入集中式安装缓存。

## 1. Virtualenv 和 PEP 582

除了 `virtualenv` 管理之外，PDM 还提供对 PEP 582 (1) 的实验性支持作为选择加入功能。
{ .annotate }

  1. 尽管 Python 指导委员会拒绝了 PEP 582,但您仍然可以使用 PDM 对其进行测试。

要了解有关这两种模式的更多信息， 请参阅有关使用 [使用 Virtualenv](https://pdm-project.org/zh-cn/latest/usage/venv) 和 [使用 PEP 582](https://pdm-project.org/zh-cn/latest/usage/pep582/) 使用 PEP 582 的相关章节。

## 2. PDM 生态系统

[Awesome PDM](https://github.com/pdm-project/awesome-pdm) 是精选的 PDM 插件和资源列表。
