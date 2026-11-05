<a id="part3-ch10"></a>

# 第3部分 · 第10章：MoE 并行

> [总索引](../README.md) ｜ [本部分目录](README.md) ｜ [上一章](ch09-长序列训练与上下文并行.md) ｜ [下一章](ch11-3D并行与混合并行策略.md)

## 本章目录

- [本章导读](#part3-ch10)

---

## 本章导读

> 发布 2026-04-16 · 标签 "MoE", "Expert Parallelism", "All-to-All", "负载均衡", "稀疏模型" · [单篇原文](../articles/part3/第10章-MoE并行.md)

### 📖 本章概述

MoE（Mixture of Experts）是当前千亿/万亿参数模型（DeepSeek-V3、Mixtral 等）的主流架构——用稀疏激活在不显著增加计算量的前提下扩大参数规模。MoE 引入了一种全新的并行维度：**Expert Parallelism（EP）**，及其标志性的 All-to-All 通信模式。本章独立成章，因为它的通信模式、负载均衡问题与稠密模型的并行有本质区别。

---

### 📑 章节结构

### 1. MoE 模型结构回顾

- 稠密 FFN → 稀疏 MoE：用 $E$ 个 Expert 替换单个 FFN
- Router（Gating Network）：为每个 token 选择 Top-K 个 Expert
- 稀疏激活：参数量 $\times E$，但单 token 计算量只增加 $K$ 倍
- 容量因子（Capacity Factor）与 token 丢弃

### 2. Expert Parallelism（EP）

- 核心思想：不同 Expert 放在不同 GPU 上，每卡只存 $\frac{E}{N}$ 个 Expert
- 与 TP 的区别：TP 切单个权重矩阵，EP 切的是"哪些 Expert 在哪"

### 3. All-to-All 通信（本章重点）

- 两次 All-to-All：dispatch（token 发往对应 Expert 所在 GPU）+ combine（结果发回原 GPU）
- 通信量分析：取决于 token 数、Top-K、Expert 分布
- 为什么 All-to-All 是 MoE 训练的主要瓶颈
- 通信优化：分组 All-to-All、计算通信重叠、DeepEP 等高性能通信库

### 4. 负载均衡问题

- Router 倾斜：少数 Expert 被过度选择 → 部分 GPU 过载、部分空闲
- Auxiliary Loss：引导 Router 均匀分发 token 的辅助损失
- DeepSeek 的无辅助损失负载均衡（aux-loss-free，bias 调整）
- Expert 容量与 drop/pad 策略

### 5. EP 与其他并行的组合

- EP × DP：EP 组与 DP 组的正交划分
- EP × TP：Expert 内部再做张量并行（超大 Expert）
- EP × PP：MoE 层与稠密层在流水线中的分配
- 实例：DeepSeek-V3 / Mixtral 的并行配置剖析

### 6. 动手实验

- 实现一个最小 MoE 层 + Top-2 Router，打印 token 路由分布
- 模拟 All-to-All dispatch/combine 过程
- 观察负载不均衡现象，加入 aux loss 后对比

---

### 🎯 本章学习目标

- 能画出 MoE 层的 Router → dispatch → Expert → combine 数据流
- 能解释 Expert Parallelism 的两次 All-to-All 各自传输什么
- 能说明 MoE 负载均衡问题的成因及 aux loss / aux-loss-free 两类解法
- 能分析 EP 与 DP/TP/PP 组合时的通信域划分

> ⚠️ 本站该章目前只有章节纲要，尚无正文。
