<a id="part3-ch5"></a>

# 第3部分 · 第5章：ZeRO显存优化系列

> [总索引](../README.md) ｜ [本部分目录](README.md) ｜ [上一章](ch04-数据并行.md) ｜ [下一章](ch06-张量并行与序列并行.md)

## 本章目录

- [本章导读](#part3-ch5)

---

## 本章导读

> 发布 2026-04-16 · 标签 "ZeRO", "DeepSpeed", "显存优化", "Offload", "通信分析" · [单篇原文](../articles/part3/第5章-ZeRO系列.md)

### 📖 本章概述

ZeRO（Zero Redundancy Optimizer）是 DeepSpeed 的核心技术。本章从"训练状态的冗余在哪里"出发，逐阶段讲解如何通过切分消除冗余，并分析每个阶段的通信代价和适用场景。

---

### 📑 章节结构

### 1. ZeRO 的核心洞察

- **冗余分析**：DDP 中每卡都冗余存储完整的优化器状态（$12\Psi$）、梯度（$2\Psi$）、参数（$2\Psi$），$N$ 卡集群有 $(N-1)/N$ 的存储是浪费
- **设计思想**："切分-聚合"范式——平时每卡只存 $\frac{1}{N}$，需要时通过通信获取完整数据，用完即弃
- **三阶段递进**：从最容易切的（优化器状态）到最难切的（参数），逐步消除冗余

### 2. ZeRO-1：切分优化器状态

- **切分内容**：Adam 的 FP32 参数副本 + 一阶动量 + 二阶动量（共 $12\Psi$ Bytes）
- **通信模式**：梯度仍需 AllReduce（与 DDP 相同），参数更新后需 AllGather 同步参数
- **显存节省**：每卡从 $16\Psi$ 降至 $4\Psi + \frac{12\Psi}{N}$
- **通信量**：与 DDP 相同（$2\Psi$）+ 额外 AllGather 参数
- **适用场景**：优化器状态是显存大头时（Adam 占 75%），少量通信增加换大幅显存节省

### 3. ZeRO-2：进一步切分梯度

- **切分内容**：在 ZeRO-1 基础上，梯度也按分片存储
- **通信模式**：反向传播时使用 ReduceScatter（替代 AllReduce），每卡只保留自己负责分片的聚合梯度
- **显存节省**：每卡降至 $2\Psi + \frac{14\Psi}{N}$
- **通信量**：ReduceScatter = $\Psi$（比 AllReduce 的 $2\Psi$ 少一半，但丢失了 AllReduce 隐含的 AllGather）
- **适用场景**：模型中等偏大，切分优化器+梯度后单卡能装下参数

### 4. ZeRO-3：连参数也切分

- **切分内容**：参数、梯度、优化器状态全部切分
- **通信模式**：
  - 前向：AllGather 重组当前层参数 → 计算 → 释放
  - 反向：AllGather 参数 → 计算梯度 → ReduceScatter 梯度 → 释放参数
- **显存节省**：每卡降至 $\frac{16\Psi}{N}$（理想线性缩放）
- **通信量**：$3\Psi$（前向 AllGather $\Psi$ + 反向 AllGather $\Psi$ + ReduceScatter $\Psi$），比 DDP 多 50%
- **适用场景**：模型参数本身单卡装不下，必须分片

### 5. ZeRO-Offload 与 ZeRO-Infinity

- **ZeRO-Offload**：将优化器状态和梯度计算卸载到 CPU，GPU 只做前向/反向
  - 适用场景：少卡（1-4卡）训练大模型
  - 代价：CPU-GPU 数据传输带宽成为瓶颈（PCIe 4.0: ~32 GB/s）
- **ZeRO-Infinity**：在 Offload 基础上进一步利用 NVMe SSD 存储
  - 适用场景：极大模型（万亿参数）在有限 GPU 上训练
  - 关键技术：分块预取（prefetch）、计算与 I/O 重叠

### 6. ZeRO 选型指南

| 阶段 | 显存节省 | 通信代价 | 适用场景 |
|------|---------|---------|---------|
| ZeRO-1 | 优化器状态 $\frac{12\Psi}{N}$ | 与 DDP 接近 | 参数+梯度单卡装得下 |
| ZeRO-2 | + 梯度 | 略高于 DDP | 参数单卡装得下 |
| ZeRO-3 | 全部 | 比 DDP 多 50% | 参数也装不下 |
| Offload | 利用 CPU 内存 | + PCIe 传输 | 少卡大模型 |

### 7. ZeRO 与 FSDP 的关系

- FSDP `FULL_SHARD` ≈ ZeRO-3，`SHARD_GRAD_OP` ≈ ZeRO-2
- ZeRO 是算法/论文层面的概念，FSDP 是 PyTorch 原生实现，DeepSpeed 是微软的独立实现
- 选 FSDP 还是 DeepSpeed：PyTorch 生态内优先 FSDP，需要 Offload/Infinity 或已有 DeepSpeed 配置用 DeepSpeed

---

### 🎯 本章学习目标

- 能画出 ZeRO-1/2/3 每个阶段的"切什么、怎么通信"示意图
- 能计算各阶段的每卡显存占用公式和每步通信量
- 能解释 ZeRO-Offload 的 CPU 卸载机制和性能瓶颈
- 能根据模型规模和硬件条件选择合适的 ZeRO 阶段

> ⚠️ 本站该章目前只有章节纲要，尚无正文。
