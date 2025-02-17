---
date: 2025-02-17
authors:
  - mingminyu
categories:
  - 大模型
tags:
  - DeepSeek
  - 知识蒸馏
  - 转载
readtime: 10
---

# DeepSeek-R1 蒸馏前后的 Qwen Tokenizer 变化

> 原文地址：https://mp.weixin.qq.com/s/HbqzdZOEWBfE3j16uAqsFw

![](https://mingminyu.github.io/webassets/images/20250217-06.png)

根据 DeepSeek-R1 的论文，DeepSeek-R1-Distill-Qwen-32B 是基于 Qwen2.5-32B 预训练 base 模型进行蒸馏 SFT 训练，而不是基于 Qwen2.5-32B-Instruct 的 Chat 模型。

接下来对比这三个开源模型（Qwen2.5-32B、Qwen2.5-32B-Instruct、DeepSeek-R1-Distill-Qwen-32B）的几个主要配置文件，并分析 tokenizer 的异同，最后实测 Chat 模版及 special token。

<!-- more -->

## 1. config.json 配置对比


## 2. tokenizer_config.json 配置对比

## 3. tokenizer.json 配置对比

## 4. generation_config.json 配置对比

## 5. Chat 模版

## 6. 总结

对于 Qwen2.5-32B 基础模型以及 DeepSeek-R1-Distill-Qwen-32B 蒸馏模型，主要有这么几点不同：

| 差异 | 描述 |
| --- | --- |
| Special Tokens | Deepseek 更改了 Qwen Tokenzier 的一些 special token id 对应的 token 内容。|
| Chat 模板 | Deepseek 更改了 Qwen 的 Chat 模版，沿用了其满血版模型系列的 Chat 模版，但存在 `bos_token` 重复两次的问题。|
| Generation Config | Deepseek 给出了蒸馏模型合适的模型推理参数，比如 `temperature` 为 0.6，`top_p` 为 0.95。|
