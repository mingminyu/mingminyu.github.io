---
date: 2025-02-10
authors:
  - mingminyu
categories:
  - 大模型
tags:
  - DeepSeek
  - 转载
readtime: 10
---

# DeepSeek R1 Zero 复现教程

> 原文地址: https://mp.weixin.qq.com/s/o2l8XRryS5PWRriGQZytWQ

各位同学好，我是来自 Unlock-DeepSeek 开源项目团队的骆师傅。先说结论，我们（Datawhale X 似然实验室）使用 3 张 80G 的 A800计算卡训练了 20 小时，做出了可能是国内首批 DeepSeek R1 Zero 的中文复现版本，我们把它叫做 Datawhale-R1，用于 R1 Zero 复现教学。*

![alt text](https://mingminyu.github.io/webassets/../images/20250210-04.png)

按照 5.5 ~ 7.0 元每小时的价格计算，3 张 A800 花费最低为 3 x 5.5 x 20 = 330 元，预计花费接近 420 元，而 [TinyZero](https://github.com/Jiayi-Pan/TinyZero) 项目用了 4 张 A800 训练了 8 小时，预计花费为：224 元，这中间的差异可能是由于硬件性能瓶颈和框架差异带来的（我们用的是 Huggingface TRL，TinyZero 使用的是 veRL）。所以建议大家如果真的要复现，请使用 TinyZero 项目，我们出于教育目的使用 TRL 为大家报告这个结果。

另外，不是所有人都能随时随地调用 3 张 A800 的，我们正在努力减小硬件资源要求，让复现工作尽可能平民化（比如在 4090 上跑）。在这里特别感谢：似然实验室，提供本次复现的计算资源，并与 Datawhale 团队合作贡献了本教程。

回到正题，首先回答一个关键问题：为什么这个方案更贵，而我们却选择了它？答案就是：它更符合教育目的，截止本文发布，大部分同学没有足够的资源来亲手体验复现流程，但是我们希望大家能更清楚的看到，复现 R1 Zero 的过程中都发生了什么，真正对复现原理有个大致把握，就算做“云玩家”也要学到知识，看完骆师傅做一遍就好像自己也做了一遍。

> 本方案在 [mini-r1](https://www.philschmid.de/mini-deepseek-r1) 的基础上改进而来。

<!-- more -->

## 1. 环境搭建

### 1.1 基础工具

基础环境如下：

- CUDA > 12.0 （我们使用的是 CUDA 12.4）
- Python 建议版本为 3.12（我们使用 Miniforge 管理虚拟环境）
- Pytorch 版本为 2.5.1 （GPU版本）

> 建议使用 Miniforge / Conda 来安装 Pytorch，我们在南方科技大学的开源镜像源测试，下载速度会比官网 pip 安装快不少，请在下 [PyTorch 网址](https://pytorch.org/get-started/previous-versions) 找到适合你硬件的 2.5.1 版本，推荐使用 mamba 安装（安装  Miniforge 后直接将 conda 替换为 mamba）。

### 1.2 编译安装 Flash-Attn

接着重头戏就来了，我们需要编译安装 Flash Attention 包，这步非常消耗 CPU 资源，非常不建议 CPU 核心少的玩家执行。如果你没有办法在“有生之年”编译完 Flash Attention，可以在 https://github.com/Dao-AILab/flash-attention/releases 找到与你环境对应的编译好的包。（没对应上的话，改环境反而更快，相信我，编译很慢）。

这个步骤倒是很简单，执行下面的命令：

```bash linenums="1" hl_lines="8"
pip install packaging ninja  # ninja 用于加速编译

# 编译安装 Flash Attention 包
pip install flash-attn --no-build-isolation

# 注意！如果你的设备CPU核心多，但是运行内存小于 96 GB，请适当设置 MAX_JOBS 的数量，并替换为下面的命令
# 参考：https://github.com/Dao-AILab/flash-attention#installation-and-features
MAX_JOBS=4 pip install flash-attn --no-build-isolation
```

按下回车后，可以泡杯咖啡，打开 `htop` 看 CPU 疯狂运作，再重新品读一遍《[DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning](https://arxiv.org/abs/2501.12948)》。

等待 flash-attn 安装完毕后，我们就可以安装其他涉及到的库了，我们 在 [Unlock-DeepSeek](https://github.com/datawhalechina/unlock-deepseek) 项目中提供了一份 requirements.txt(1)，核心列表如下：
{.annotate}

1. 大家也可以在这个地址找到我们所有涉及的 Python 包列表：https://swanlab.cn/@anine09/datawhale-r1/runs/4tp31j1zxbm1fshjsi53b/environment/requirements。

```bash
setuptools<71.0.0
transformers==4.48.1
datasets==3.1.0
accelerate==1.3.0
hf-transfer==0.1.9
deepspeed==0.15.4
trl==0.14.0
vllm==0.7.0
modelscope==1.22.3
swanlab==0.4.6
huggingface-hub==0.28.1
```

### 1.3 下载模型和数据集

接下来我们需要下载数据集和模型，在本次实验中，我们使用的数据集为：[Jiayi-Pan/Countdown-Tasks-3to4](https://huggingface.co/datasets/Jiayi-Pan/Countdown-Tasks-3to4)，模型为 [Qwen/Qwen2.5-3B-Instruct](https://huggingface.co/Qwen/Qwen2.5-3B-Instruct)。

!!! warning "注意"

    我们目前不建议用小于 3B 的模型，其他社区多次报告，小于 3B 的模型无法学会推理，经过我们的测试，确实！！！

① 下载数据集：

```bash
# 更换为国内镜像源，这个只用执行一次，每次重新打开终端就要重新执行，或者写入 .bashrc
export HF_ENDPOINT=https://hf-mirror.com 

# 下载数据集，替换整个 <xxx> 为你自己的内容
huggingface-cli download \
    --repo-type dataset \
    --resume-download Jiayi-Pan/Countdown-Tasks-3to4 \
    --local-dir <你想要存放的路径，比如：dataset>
```

② 下载模型

=== "HuggingFace 下载"

    ```bash
    huggingface-cli download --resume-download Qwen/Qwen2.5-3B-Instruct --local-dir <你想要存放的路径，比如：models>
    ```

=== "ModelScope 下载"

    新建 model_download.py 文件，填入以下内容，保存后使用 python model_download.py 执行下载。

    ```python linenums="1"
    from modelscope import snapshot_download
    
    model_dir = snapshot_download('Qwen/Qwen2.5-3B-Instruct', cache_dir='models', revision='master')
    ```

### 1.4 编写配置文件和训练代码

接下来我们需要准备 3 个文件，我们会在 [Unlock-DeepSeek](https://github.com/datawhalechina/unlock-deepseek) 项目中提供完整的复现文件，方便同学们直接使用。

第一个是 Accelerate 配置文件，用于分布式训练（三张卡）。新建 deepspeed_zero3.yaml 填入以下内容并保存（不是 DeepSeek，别看错！）。

```yaml linenums="1" title="deepspeed_zero3.yaml"
compute_environment: LOCAL_MACHINE
debug: false
deepspeed_config:
  deepspeed_multinode_launcher: standard
  offload_optimizer_device: none
  offload_param_device: none
  zero3_init_flag: true
  zero3_save_16bit_model: true
  zero_stage: 3
distributed_type: DEEPSPEED
downcast_bf16: 'no'
machine_rank: 0
main_training_function: main
mixed_precision: bf16
num_machines: 1
num_processes: 8 # 我们在这里保持常规默认的 8 卡机器，会在后面的启动命令中覆盖新值
rdzv_backend: static
same_network: true
tpu_env: []
tpu_use_cluster: false
tpu_use_sudo: false
use_cpu: false
```

一般来说，这个文件内容不需要修改，如果有定制需求，请不要使用这个文件，运行 accelerate config 自行设定。　
在介绍下一个文件之前，我们强烈建议大家使用 Swanlab（https://swanlab.cn/） 来可视化追踪实验过程，打开：https://swanlab.cn/login ，登录之后点击图中所示的 Quick Start，或者打开：https://swanlab.cn/space/~/settings ，复制 API Key。

　