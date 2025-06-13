---
date: 2025-06-13
authors:
  - mingminyu
categories:
  - 大模型
tags:
  - 对话工具
slug: most-used-agent-dev-frameworks
readtime: 2
---

# 常用的Agents智能体开发框架

> 原文地址：
> - https://mp.weixin.qq.com/s/TJZ6yPk2I_QaxBFhiUPshA
> - https://mp.weixin.qq.com/s/sWZU_b6LfEdntiUIjI67EQ

打造一个个人 AI 代理，可以自动化我们的日常工作流程，例如邮件回复、报告生成、日程管理、内容草稿，甚至调试代码片段。选择合适的 AI 代理框架比构建代理本身还难，在尝试了十几种框架——从流畅的视觉化构建工具到高度可定制的代码优先堆栈后，整理一些内容文档以供选型。

<!-- more -->

![](https://mingminyu.github.io/webasstes/images/20250613/02.png)

让我们澄清一点，所谓的 AI 代理不仅仅是花哨的聊天机器人，它是一个能够完成以下任务的智能体：

- 感知：通过文本、语音、工具等输入
- 规划：决定做什么
- 行动：触发API、运行工具、委派任务
- 学习：使用记忆、上下文、历史

框架为这些能力提供结构，没有它们，你就像在用胶带粘 API，祈祷 GPT 不会在生产数据库中“幻觉”出错。框架让代理变得可靠、模块化、可扩展。

## 1. n8n

![n8n](https://mingminyu.github.io/webasstes/images/20250613/03.png)

> **适用场景**：想将 AI 代理接入700+现实应用，无需编码。

[n8n](https://n8n.io/) 是一个独特结合AI能力与业务流程自动化的工作流平台，像是增强版的 Zapier，但拥有完全的开发者自由，它视觉化高、强大、可在自有服务器部署。其AI模块不断扩展，你可以构建：

- 响应Slack消息
- 分析收件箱邮件
- 查询数据库
- 调用GPT4或Claude进行推理

## 2. Flowise

![flowise](https://mingminyu.github.io/webasstes/images/20250613/04.png)

> **适用场景**：喜欢 LangChain 但讨厌 YAML。

[Flowise](https://flowiseai.com) 是开源生成式AI开发平台，适合构建AI代理、LLM编排等。它是一个专为大型语言模型链式操作的拖拽式视觉构建工具，想象一下点击组合，就像GPT的视觉化乐高积木：

- 提示模板
- 记忆模块
- 检索引擎
- 行动工具（比如浏览或代码解释器）

## 3. Langflow

## 4. LangSmith

## 5. LangGraph

## 6. Rivet

## 7. CrewAI

## 8. AutoGen

## 9. SuperAGI

## 10. Superagent

![Superagent](https://mingminyu.github.io/webasstes/images/20250613/01.png)

[Superagent](https://github.com/superagent-ai/superagent?utm_source=chatgpt.com) 作为一个即插即用的系统，让你可以通过 API 快速部署 AI 代理。它简单、快速、不费脑子，几分钟内就能配置好，且像 **Zapier** 一样与大语言模型（LLMs）无缝协作，主要为不想折腾基础设施的开发者量身打造。

适用场景：想今天就让项目跑起来，构建与人交互或执行任务的工具。

## 11. LiveKit

## 12. Agent Zero

## 13. SmoLagents

## 14. OpenHands

## 15. Agent-LLM

## 16. CAMEL-AI

## 17. UFO

## 18. ChatDev

[ChatDev](https://github.com/OpenBMB/ChatDev) 想象一个完全由 AI 代理运营的初创公司：CEO、CTO、前端开发、后端开发，这就是 ChatDev。

每个代理扮演真实的开发角色，能完成完整的项目构建。对于想模拟 AI 如何运营开发机构，好奇全栈自主工作流，这个框架可以帮助到你。

## 19. Dify

