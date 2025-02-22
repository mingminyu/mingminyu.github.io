---
date: 2025-02-17
authors:
  - mingminyu
categories:
  - 大模型
tags:
  - Agent
  - 转载
slug: light-ai-agent-hf-smolagents
readtime: 10
---

# 轻量级的 Agent 框架 —— SmolAgents

> 原文地址：https://mp.weixin.qq.com/s/KhyGyajIDhUX-xfjK99wFg

[Smolagents](https://github.com/huggingface/smolagents) 是一个可以让你通过几行代码运行强大的 Agent 的 Python 库。它具有以下特点：

- 简洁性：Agent 的逻辑大约只有 1000 行代码。
- 一流的 Code Agent 支持：CodeAgent 是一种能够通过代码执行任务的 Agent。传统的 Agent 通常依赖于一些预定义的动作或外部指令，而 CodeAgent 能够动态地生成并执行代码来完成任务。具体来说，CodeAgent 的动作是通过编写实际的代码来实现的，而不是仅仅生成类似 JSON 的命令或指令。

CodeAgent 的关键特点包括：

- **代码执行**：它生成并执行实际的代码来处理任务。例如，它可能会调用外部 API、计算某些值、处理数据等。
- **高安全性**：为了确保执行过程中的安全，CodeAgent 可以在沙箱环境中运行，避免潜在的安全风险。
- **灵活性**：它能够动态适应任务需求，通过编写不同的代码来应对多变的工作流。

相比传统的工具调用型 Agent，CodeAgent 的优势在于它具有更高的灵活性和可定制性，能够根据任务需求实时生成和执行代码，适用于更复杂和动态的工作流。

- **Hub 集成**：你可以将工具共享到 HuggingFace Hub，也可以从 HuggingFace Hub 加载工具，未来还会有更多功能！
- **模型无关性**：smolagents 支持任何 LLM。可以是本地的 Transformers 或 Ollama 模型，也可以是 Hub 上的多个模型提供者，或者通过 LiteLLM 集成使用 OpenAI、Anthropic 等公司的模型。
- **模态无关性**：Agent 支持文本、视觉、视频，甚至音频输入！
- **工具无关性**：可以使用 LangChain、Anthropic 的 MCP 等工具，甚至可以将 Hub 空间作为工具使用。

<!-- more -->

## 1. 快速使用

Smolagents 的安装非常简单，执行如下代码进行安装：

```bash
pip install smolagents
```

定义 Agent，为其提供所需的工具并运行：

```python linenums="1"
from smolagents import CodeAgent, DuckDuckGoSearchTool, HfApiModel

agent = CodeAgent(tools=[DuckDuckGoSearchTool()], model=HfApiModel())
agent.run("How many seconds would it take for a leopard at full speed to run through Pont des Arts?")
```

我们还可以将自己的 Agent 分享到 Hub：

```python linenums="1"
agent.push_to_hub("m-ric/my_agent")
```

## 2. 使用多个 LLM

使用 HfApiModel，4 个推理提供商的网关：


=== "DeepSeek-R1"

    ```python linenums="1"
    from smolagents import HfApiModel

    model = HfApiModel(
        model_id="deepseek-ai/DeepSeek-R1",
        provider="together",
    )
    ```

=== "Claude"

    ```python linenums="1"
    from smolagents import LiteLLMModel

    model = LiteLLMModel(
        "anthropic/claude-3-5-sonnet-latest",
        temperature=0.2,
        api_key=os.environ["ANTHROPIC_API_KEY"]
    )
    ```

=== "OpenAI"

    ```python linenums="1"
    import os
    from smolagents import OpenAIServerModel

    model = OpenAIServerModel(
        model_id="deepseek-ai/DeepSeek-R1",
        api_base="https://api.together.xyz/v1/",  # 留空查询OpenAI服务器
        api_key=os.environ["TOGETHER_API_KEY"],  # 替换为你目标服务器的API密钥
    )
    ```

=== "本地 Qwen2.5"

    ```python linenums="1"
    from smolagents import TransformersModel

    model = TransformersModel(
        model_id="Qwen/Qwen2.5-Coder-32B-Instruct",
        max_new_tokens=4096,
        device_map="auto"
    )
    ```

=== "Azure"

    ```python linenums="1"
    import os
    from smolagents import AzureOpenAIServerModel

    model = AzureOpenAIServerModel(
        model_id = os.environ.get("AZURE_OPENAI_MODEL"),
        azure_endpoint=os.environ.get("AZURE_OPENAI_ENDPOINT"),
        api_key=os.environ.get("AZURE_OPENAI_API_KEY"),
        api_version=os.environ.get("OPENAI_API_VERSION")    
    )
    ```

## 3. 命令行工具

你可以使用两个命令行工具来运行 Agent：`smolagent` 和 `webagent`。

=== "SmolAgent"

    smolagent 是一个通用命令，用于运行多步骤的 CodeAgent，支持多种工具。

    ```bash
    smolagent "Plan a trip to Tokyo, Kyoto and Osaka between Mar 28 and Apr 7."  --model-type "HfApiModel" --model-id "Qwen/Qwen2.5-Coder-32B-Instruct" --imports "pandas numpy" --tools "web_search translation"

    ```

=== "WebAgent"

    `webagent` 是一个使用 helium 的专用的网页浏览 Agent。

    ```bash
    webagent "go to xyz.com/men, get to sale section, click the first clothing item you see. Get the product details, and the price, return them. note that I'm shopping from France" --model-type "LiteLLMModel" --model-id "gpt-4o"
    ```

## 4. Code Agents 的工作机制

CodeAgent 的工作方式大致与经典的 ReAct Agent 相同，唯一的区别是 LLM 引擎将其动作写成 Python 代码片段。

![](https://mingminyu.github.io/webassets/images/20250218-01.png)

CodeAgent 的工作方式大致与经典的 ReAct Agent 相同，唯一的区别是 LLM 引擎将其动作写成 Python 代码片段。

```python linenums="1"
requests_to_search = ["gulf of mexico america", "greenland denmark", "tariffs"]

for request in requests_to_search:
    print(f"Here are the search results for {request}:", web_search(request))
```

将动作写成代码片段被证明比当前行业实践——让 LLM 输出它想要调用的工具的字典——更有效：使用的步骤减少了 30%（因此 LLM 调用减少了 30%），并且在较难的基准测试上表现更好。

特别是，由于代码执行可能带来安全问题（如任意代码执行！），smolagents 在运行时提供了以下选项：

- 使用安全的 Python 解释器，以更安全地在你的环境中执行代码（比直接执行代码更安全，但仍然有风险）
- 使用 E2B 沙箱环境（消除对你自己系统的风险）

## 5. 基准测试表现

![](https://mingminyu.github.io/webassets/images/20250218-02.png)
