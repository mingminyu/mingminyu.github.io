---
date: 2025-02-12
authors:
  - mingminyu
categories:
  - 大模型
tags:
    - DeepSeek
    - 转载
readtime: 10
---

# 将 DeepSeek R1 模型微调成 DeepDoctor

> 原文地址: https://mp.weixin.qq.com/s/cqh42XH60s0-8Xum04lSjw

DeepSeek 颠覆了 AI 领域，挑战 OpenAI 的主导地位，推出了一系列先进的推理模型。最令人兴奋的是？这些模型完全免费，且没有任何使用限制，人人都可以访问。

在本教程中，我们将对 DeepSeek-R1-Distill-Llama-8B 模型进行微调，使用来自 Hugging Face 的医学思维链数据集进行训练，该精简版 DeepSeek-R1 模型是通过在 DeepSeek-R1 生成的数据上微调 Llama 3.1 8B 模型而创建的。它展示了与原始模型相似的推理能力。

<!-- more -->

## 1. DeepSeek R1 介绍

DeepSeek-R1 和 DeepSeek-R1-Zero 在数学、编程和逻辑推理任务上与 OpenAI 的 o1 性能相当。但是 R1 和 R1-Zero 都是开源的。


<div class="grid cards" markdown>

-   __DeepSeek-R1-Zero__

    ---

    DeepSeek-R1-Zero 是首个完全通过大规模强化学习（Reinforcement Learning，RL）训练的开源模型，而不是通过监督微调（Supervised Fine-Tuning，SFT）作为初始步骤，这种方法使得模型能够独立探索思维链（Chain-of-Thought，CoT）推理，解决复杂问题，并迭代优化其输出。然而，这种方式也带来了一些挑战，如推理步骤重复、可读性差以及语言混杂，可能影响其清晰度和可用性。

</div>

<div class="grid cards" markdown>
-   __DeepSeek-R1__

    ---

    DeepSeek-R1 的推出旨在克服 DeepSeek-R1-Zero 的局限性，通过在 RL 之前引入 ==冷启动数据==，为推理和非推理任务提供了更为坚实的基础。

    这种多阶段训练使得该模型在数学、编程和推理基准测试中，能够达到与 OpenAI-o1 相媲美的领先水平，同时提升了输出的可读性和连贯性。

</div>

<div class="grid cards" markdown>
-   __DeepSeek 蒸馏__（Distillation）

    ---

    DeepSeek 还推出了蒸馏模型，这些更小、更高效的模型同样展示了卓越的推理性能。这些模型的参数范围从 1.5B 到 70B 不等，但保留了强大的推理能力，其中 DeepSeek-R1-Distill-Qwen-32B 在多个基准测试中超越了 OpenAI-o1-mini。

    更小的模型继承了大模型的推理模式，展示了蒸馏过程的有效性。
</div>


![](https://mingminyu.github.io/webassets/images/20250213-02.png)


## 2. 逐步微调 DeepSeek-R1

在本项目中，我们使用 Kaggle 作为云 IDE，因为它提供免费的 GPU 资源。我选择了两块 T4 GPU，但是看起来最终我只用了一块。如果你想用自己的电脑微调的话，那估计至少是要一块 16GB 显存的 RTX 3090 才行。

在本项目中，我们使用 Kaggle 作为云 IDE，因为它提供免费的 GPU 资源。我选择了两块 T4 GPU，但是看起来最终我只用了一块。如果你想用自己的电脑微调的话，那估计至少是要一块 16GB 显存的 RTX 3090 才行。


