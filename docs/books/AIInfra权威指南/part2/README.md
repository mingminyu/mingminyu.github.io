# 第 2 部分 · CUDA编程与算子优化

> 从 CUDA 编程模型、内存模型到 Warp 执行与性能优化，再到 Reduce / GEMM / Softmax / FlashAttention / Triton 实战。

> 本部分按原站章节拆为 **8 个独立 md 文件**；返回总索引 ｜ 单篇原文目录 ｜ [图片目录](../_images/)

## 章节目录

- [第1章：CUDA 编程入门](ch01-CUDA编程入门.md)（4 篇）
    - 1.1 CUDA 开发环境搭建
    - 1.2 CUDA 编程模型
    - 1.3 CUDA 内存模型
    - 1.4 第一个实用 Kernel：向量加法
- [第2章：CUDA 性能优化基础](ch02-CUDA性能优化基础.md)（4 篇）
    - 2.1 Warp 与执行模型
    - 2.2 内存访问优化
    - 2.3 Occupancy 与资源分配
    - 2.4 同步与原子操作
- [第3章：经典算子实现—Reduce](ch03-经典算子实现-Reduce.md)（1 篇）
    - 3.1 CUDA Reduce算子优化
- [第4章：经典算子实现—GEMM](ch04-经典算子实现-GEMM.md)（1 篇）
    - 4.1 CUDA GEMM算子性能优化
- [第5章：经典算子实现—Softmax 与算子融合](ch05-经典算子实现-Softmax与算子融合.md)（2 篇）
    - 5.1 CUDA Softmax 朴素实现优化
    - 5.2 CUDA Online Softmax 实现优化
- [第6章：Attention 算子](ch06-Attention算子.md)（2 篇）
    - 6.1 FlashAttention V1详解
    - 6.2 FlashAttention V2详解
- [第7章：AI 编译器](ch07-AI编译器.md)（1 篇）
    - 7.1 Triton 编程框架介绍
- [第8章：性能分析工具链](ch08-性能分析工具链.md)（仅章纲）
- [附录 · CUDA 编程入门指南（模块导读）](appendix-CUDA编程入门指南.md)

> 来源：[caomaolufei/AIInfraGuide](https://github.com/caomaolufei/AIInfraGuide/tree/main/docs/guides) `docs/guides/` 下对应模块目录。
