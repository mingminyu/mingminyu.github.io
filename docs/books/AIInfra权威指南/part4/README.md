# 第 4 部分 · 推理优化

> LLM 推理基础、vLLM 引擎核心技术、nano-vllm 源码、量化、投机解码、PD 解耦与端侧推理。

> 本部分按原站章节拆为 **10 个独立 md 文件**；返回总索引 ｜ 单篇原文目录 ｜ [图片目录](../_images/)

## 章节目录

- [第1章：LLM 推理基础](ch01-LLM推理基础.md)（2 篇）
    - 1.1 LLM 推理基础
    - 1.2 vLLM 快速入门：从安装到部署你的第一个 LLM 推理服务
- [第2章：推理引擎核心技术](ch02-推理引擎核心技术.md)（5 篇）
    - 2.1 PagedAttention：像操作系统管理内存一样管理 KV Cache
    - 2.2 Continuous Batching：让 GPU 不再空等的动态批处理
    - 2.3 Prefix Cache 与 RadixAttention：复用共享前缀的 KV
    - 2.4 Chunked Prefill 与统一 Token Budget 调度
    - 2.5 Attention 后端与图优化：把 Decode 的 CPU 开销榨干
- [第3章：nano-vllm 源码解读](ch03-nano-vllm源码解读.md)（6 篇）
    - 3.1 项目全景与四层架构
    - 3.2 配置、入口与一次 generate 的全流程
    - 3.3 模型骨架与核心算子
    - 3.4 KV Cache 与 BlockManager
    - 3.5 Scheduler 与连续批处理
    - 3.6 ModelRunner、CUDA Graph 与性能基准
- [第4章：量化](ch04-量化.md)（6 篇）
    - 4.1 量化基础：Scale、粒度与 PTQ/QAT
    - 4.2 W8A8 量化：SmoothQuant 如何处理激活离群值
    - 4.3 Weight-only INT4：GPTQ、AWQ 与 Marlin
    - 4.4 KV Cache 量化：KIVI 与 FP8 缓存
    - 4.5 FP8 与 NVFP4/MXFP4：低比特浮点怎样工作
    - 4.6 量化选型与 vLLM 实战
- [第5章：Speculative Decoding](ch05-Speculative-Decoding.md)（5 篇）
    - 5.1 投机解码核心原理：先猜一段，再让大模型验收
    - 5.2 Draft 模型与无模型方案：怎样便宜地猜得更准
    - 5.3 Medusa、EAGLE 与 MTP：复用大模型信息生成更好的草稿
    - 5.4 投机解码的收益边界：接受率高，为什么仍可能变慢
    - 5.5 vLLM 投机解码实战：配置、接受率与性能一起测
- [第6章：分布式推理与大模型部署](ch06-分布式推理.md)（仅章纲）
- [第7章：Prefill/Decode 解耦架构](ch07-PD解耦架构.md)（仅章纲）
- [第8章：性能分析与 Benchmark](ch08-性能分析与Benchmark.md)（仅章纲）
- [第9章：生产部署与运维](ch09-生产部署与运维.md)（仅章纲）
- [第10章：端侧推理](ch10-端侧推理.md)（1 篇）
    - 10.1 端侧推理基础：从模型导出到异构硬件执行

> 来源：[caomaolufei/AIInfraGuide](https://github.com/caomaolufei/AIInfraGuide/tree/main/docs/guides) `docs/guides/` 下对应模块目录。
