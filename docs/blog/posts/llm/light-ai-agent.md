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

Smolagents 是一个可以让你通过几行代码运行强大的 Agent 的 Python 库。它具有以下特点：



✨ 简洁性：Agent 的逻辑大约只有 1000 行代码。



🧑‍💻 一流的 Code Agent 支持：CodeAgent 是一种能够通过代码执行任务的 Agent。传统的 Agent 通常依赖于一些预定义的动作或外部指令，而 CodeAgent 能够动态地生成并执行代码来完成任务。具体来说，CodeAgent 的动作是通过编写实际的代码来实现的，而不是仅仅生成类似 JSON 的命令或指令。

CodeAgent 的关键特点包括：

代码执行：它生成并执行实际的代码来处理任务。例如，它可能会调用外部 API、计算某些值、处理数据等。

高安全性：为了确保执行过程中的安全，CodeAgent 可以在沙箱环境中运行，避免潜在的安全风险。

灵活性：它能够动态适应任务需求，通过编写不同的代码来应对多变的工作流。

相比传统的工具调用型 Agent，CodeAgent 的优势在于它具有更高的灵活性和可定制性，能够根据任务需求实时生成和执行代码，适用于更复杂和动态的工作流。



🤗 Hub 集成：你可以将工具共享到 HuggingFace Hub，也可以从 HuggingFace Hub 加载工具，未来还会有更多功能！



🌐 模型无关性：smolagents 支持任何 LLM。可以是本地的 Transformers 或 Ollama 模型，也可以是 Hub 上的多个模型提供者，或者通过 LiteLLM 集成使用 OpenAI、Anthropic 等公司的模型。



👁️ 模态无关性：Agent 支持文本、视觉、视频，甚至音频输入！



🛠️ 工具无关性：可以使用 LangChain、Anthropic 的 MCP 等工具，甚至可以将 Hub 空间作为工具使用。

