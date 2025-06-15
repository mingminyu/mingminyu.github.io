---
date: 2025-06-13
authors:
  - mingminyu
categories:
  - 大模型
slug: most-used-agent-dev-frameworks
readtime: 2
---

# 常用的Agents智能体开发框架

> 原文地址：
> - https://mp.weixin.qq.com/s/TJZ6yPk2I_QaxBFhiUPshA
> - https://mp.weixin.qq.com/s/sWZU_b6LfEdntiUIjI67EQ

打造一个个人 AI 代理，可以自动化我们的日常工作流程，例如邮件回复、报告生成、日程管理、内容草稿，甚至调试代码片段。选择合适的 AI 代理框架比构建代理本身还难，在尝试了十几种框架——从流畅的视觉化构建工具到高度可定制的代码优先堆栈后，整理一些内容文档以供选型。

<!-- more -->

![](https://mingminyu.github.io/webassets/images/20250613/02.png)

让我们澄清一点，所谓的 AI 代理不仅仅是花哨的聊天机器人，它是一个能够完成以下任务的智能体：

- 感知：通过文本、语音、工具等输入
- 规划：决定做什么
- 行动：触发API、运行工具、委派任务
- 学习：使用记忆、上下文、历史

框架为这些能力提供结构，没有它们，你就像在用胶带粘 API，祈祷 GPT 不会在生产数据库中“幻觉”出错。框架让代理变得可靠、模块化、可扩展。

> 常见的生态框架组合

- LangChain + LangGraph + LangSmith：完整的LLM代理解决方案；调试、监控、向量存储和工具支持；庞大的社区
- CrewAI + CrewAI Studio：无代码和代码接口；开发者网络和开放模板；出色的入门+企业支持
- AutoGen + Semantic Kernel + Azure AI：能与 .NET 和企业系统无缝集成

![](https://mingminyu.github.io/webassets/images/20250613/09.png)

在框架的选择上不必只关注一个，选择对应的工具，构建一个协同工作的技术堆栈：

- n8n：触发工作流
- CrewAI：头脑风暴+撰写内容
- LangGraph：管理逻辑分支
- LangSmith：监控一切
- UFO：自动化本地UI应用

## 1. n8n

![n8n](https://mingminyu.github.io/webassets/images/20250613/03.png)

> **适用场景**：想将 AI 代理接入700+现实应用，无需编码。

[n8n](https://n8n.io/) 是一个独特结合AI能力与业务流程自动化的工作流平台，像是增强版的 Zapier，但拥有完全的开发者自由，它视觉化高、强大、可在自有服务器部署。其AI模块不断扩展，你可以构建：

- 响应Slack消息
- 分析收件箱邮件
- 查询数据库
- 调用GPT4或Claude进行推理

## 2. Flowise

![flowise](https://mingminyu.github.io/webassets/images/20250613/04.png)

> **适用场景**：喜欢 LangChain 但讨厌 YAML。

[Flowise](https://flowiseai.com) 是开源生成式 AI 开发平台，适合构建 AI 代理、LLM 编排等，其特点是无代码、低代码、界面友好，非程序员也能轻松上手。

它是一个专为大型语言模型链式操作的拖拽式视觉构建工具：

- 提示模板
- 记忆模块
- 检索引擎
- 行动工具（比如浏览或代码解释器）

## 3. Langflow

![](https://mingminyu.github.io/webassets/images/20250613/05.png)

> **适用场景**：用 LangChain 原型化代理但不想全部编码。

Langflow 是一个低代码构建工具，简化了构建可使用任何API、模型或数据库的强大AI。它介于无代码和低代码之间，提供 Flowise 的视觉化舒适感，同时支持更深层次的定制。

## 4. LangSmith

## 5. LangGraph

> 适用场景：反思过去的行为；根据结果重试或分支；处理长时间会话状态。

[LangGraph](https://github.com/langchain-ai/langgraph) 像画思维导图一样设计代理工作流程，支持“可以暂停、记忆、重新启动”的 AI 代理，像是真正会思考的机器，并允许你定义代理如何在多条路径上决策。

LangGraph 非常适合多代理谈判、研究流程或客户服务流程，对于喜欢视觉化思考的同学，它可以帮我们打造出强大的代理，不是简单的一行提示词那么简单。

## 6. Rivet

> **适用场景**：注重视觉化调试、透明度和 AI 流程图。

Rivet 是 开源 AI 编程环境，使用视觉化节点式图形编辑器。作为 AI 代理的 Figma，具有界面流畅、支持协作，可视化检查代理在每个节点的思考等有点。

## 7. CrewAI

![](https://mingminyu.github.io/webassets/images/20250613/07.png)


[CrewAI](https://www.crewai.com) 允许你定义“角色”，如开发者、分析师、编辑——每个角色由一个代理人格驱动。然后分配任务，它们相互交流解决问题。此外，其生态系统现包括无代码 Studio，支持快速构建智能体。

## 8. AutoGen

> 适用场景：想打造比小组项目搭档还聪明的工具；希望 AI 代理真正协作，而不仅仅是执行

[AutoGen](https://github.com/microsoft/autogen) 来源于微软，作为一个用于开发 AI 代理应用的框架，具备模块化、高可测试性特性，专为企业集成设计。构建一个 AI 代理团队，它们可以互相交流、分配任务，甚至拉上人类一起干活。

你可以定义代理、工具、记忆和策略——一切尽在掌握，能处理多步骤的复杂项目，适合一个代理不够用的工作流程。它非常非常适合对话AI、文档代理或需要多次GPT调用的任务。

此外，其生态还有一个 AgentGen Studio 

## 9. SuperAGI

![Superagent](https://mingminyu.github.io/webassets/images/20250613/06.png)

> **适用场景**：需要端到端自主代理堆栈。

[SuperAGI](https://superagi.com/) 不只是进入市场，而是主宰市场。它向我们提供了**向量数据库集成、任务监控和控制UI、代理遥测、代理市场**等特性。

## 10. Superagent

![Superagent](https://mingminyu.github.io/webassets/images/20250613/01.png)

> 适用场景：想今天就让项目跑起来，构建与人交互或执行任务的工具。

[Superagent](https://github.com/superagent-ai/superagent?utm_source=chatgpt.com) 作为一个即插即用的系统，让你可以通过 API 快速部署 AI 代理。它简单、快速、不费脑子，几分钟内就能配置好，且像 **Zapier** 一样与大语言模型（LLMs）无缝协作，主要为不想折腾基础设施的开发者量身打造。

## 11. LiveKit

![LiveKit](https://mingminyu.github.io/webassets/images/20250613/08.png)

[LiveKit](https://livekit.io/) 为实时交互的语音代理提供支持，结合 Whisper 和 GPT4 Turbo 用它构建了一个实时语音AI接待员。具备构建、部署和扩展实时代理，开源、企业级应用的特性。

## 12. Agent Zero

[Agent Zero](https://github.com/frdel/agent-zero) 是一个运行在虚拟计算机中的下一代AI助手，适合研究项目和内部工具开发，具备轻量、开放、逻辑优先的特性。

## 13. SmoLagents

[SmoLagents](https://github.com/huggingface/smolagents) 适合快速实验，它语法简单且迭代迅速。

## 14. OpenHands

> 适用场景：需要一个能编码而非只评论代码的 AI 助手；为开发者打造工具，由开发者驱动。

[OpenHands](https://github.com/All-Hands-AI/OpenHands) 是一个 AI 开发环境，代理可以修改代码、运行终端、浏览网页、调用 API等。

## 15. Agent-LLM

> **适用场景**：受够了健忘的聊天机器人；需要上下文丰富、持续进化的交互。

[Agent-LLM](https://github.com/idosal/AgentLLM) 是一个能记住你昨天说了什么的 AI 代理，它适合需要长期记忆的任务，易于扩展和调整。

## 16. Camel-AI

> **适用场景**：想观察代理如何思考；热衷于研究或制造点“混乱”。

[Camel-AI](https://github.com/camel-ai/camel) 能让两个 AI 代理对话、辩论、模拟工作，甚至设计产品，就像看两个 AI 实习生头脑风暴。

## 17. UFO

微软发布的桌面 AgentOS，非常适合与传统系统交互——Excel、CRM、桌面工具，

## 18. ChatDev

[ChatDev](https://github.com/OpenBMB/ChatDev) 想象一个完全由 AI 代理运营的初创公司：CEO、CTO、前端开发、后端开发，这就是 ChatDev。

每个代理扮演真实的开发角色，能完成完整的项目构建。对于想模拟 AI 如何运营开发机构，好奇全栈自主工作流，这个框架可以帮助到你。

## 19. Dify


## 20. Agenta

[Agenta](https://agenta.ai/) 是一个。


## 21. Julep

[Julep]() 适合复杂任务编排与分层计划。

## 22. MGX

[MGX]() 是一个具有反思逻辑的代理系统。

## 23. QuantaLogic

[QuantaLogic]() 基于思维树+ReAct推理。

## 24. Guardrails AI

[Guardrails AI]() LLM输出的防护与安全。
