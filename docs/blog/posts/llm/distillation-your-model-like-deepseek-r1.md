---
date: 2025-02-11
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

# 如何用 R1 的方式做自有模型的蒸馏

> 原文地址: https://zhuanlan.zhihu.com/p/23008763392

深度学习模型正在改变人工智能领域，但其庞大的规模和计算需求也成为了实际应用中的瓶颈。模型蒸馏是解决这一问题的一种强大技术手段，它通过 ==从一个复杂的大规模模型（教师）向一个小而高效的模型（学生）蒸馏知识== 来实现。

<!-- more -->

## 1. 知识蒸馏的介绍

蒸馏是机器学习的一种方法，其中较小的模型（“学生”）被训练来模仿较大、预训练过的模型（“老师”）的行为，其目标是保留教师大部分性能，同时大幅降低计算成本和内存占用。

!!! note ""

    这一思想最早在 Geoffrey Hinton 的论文《知识蒸馏》中提出。而不是直接对原始数据进行训练，而是学习教师模型输出或中间表示。这其实也是受人类教育启发。

自从 DeepSeek-R1 发布后，知识蒸馏这种方式被广泛关注起来，那为什么知识蒸馏为什么如此重要？

- **成本效率**：小模型计算资源消耗少。
- **速度**：适用于对时延敏感的应用（如APIs、边缘设备）
- **专业性**：针对特定领域定制模型，无需训练大模型。

通常知识蒸馏的方式有 3 种：

- **数据蒸馏**：在数据提炼阶段，教师模型生成合成数据或伪标签，然后用于训练学生模型，该方法可以应用于多种任务，甚至在 logits 不那么有信息的任务（例如开放性推理）上。
- **Logits蒸馏**：Logits 是神经网络在 `softmax` 函数作用前的原始输出分数。在 Logits 蒸馏过程中，学生模型训练的目标是与教师的 Logits 相匹配而不是（仅仅）最终预测。这种方法保留了教师信心（置信度）水平和决策过程更多的信息。
- **特征蒸馏**：特征蒸馏是通过教师模型中间层（的）知识向学生模型转移实现，通过让两个模型的隐藏表示对齐，学生可以学习到更丰富、抽象的特征。

为了让更多人能够使用，DeepSeek AI 基于 Qwen（Qwen, 2024b）、Llama(AI@Meta, 2024) 等流行架构提炼出了 6 个精简版，直接使用 DeepSeek-R1 筛选出的 800K 样本对开源模型进行微调。

尽管与 DeepSeek-R1 相比模型体积小很多倍，但蒸馏出的模型在各个基准上表现出了令人印象深刻（有效的提高）的能力，往往能匹配甚至超越更大规模模型。

![知识蒸馏模型对比各家大模型的基础能力](https://mingminyu.github.io/webassets/images/20250212-01.png)

## 2. 蒸馏方式

### 2.1 安装依赖库

```bash
pip install -q torch transformers datasets accelerate bitsandbytes flash-attn --no-build-isolation
```

### 2.2 数据集生成与格式化

通过部署 DeepSeek-R1，使用 ollama 或任何其他部署框架，在我们的开发环境中生成自定义域名相关数据集。但是，本教程使用的是 Magpie-Reasoning-V2 数据集，该数据集由 DeepSeek-R1 生成了 25 万条 Chain-of-Thought（CoT）推理样本，这些题目涵盖了数学推理、编程和一般问题解决等不同任务。

=== "Instruct数据"

    ```json
    {
      "instruction": "Solve for x: 2x + 5 = 15",
      "response": "<think>First, subtract 5 from both sides: 2x = 10. Then, divide by 2: x = 5.</think>"
    }
    ```

=== "包含推理逻辑"

    ```json
    {'text': 
      "<|user|>\n制造零部件过程时间长度服从正态分布，均值为30分钟，标准差为4分钟。记录时间大于33分钟的概率是多少？\n<|end|>\n
      <|assistant|>\n<think>\n对了，我这里有个问题关于生产过程时长。说明时间服从正态分布，均值30分钟，标准差4分钟。求出时间大于33分钟的概率。
      嗯，我得想想怎么解决这个问题。首先我想起在正态分布中，大于均值的概率是0.5，因为其对称性。但是这里我们处理的是一个具体的数值，
      33分钟高于平均值30分钟。所以，我需要计算出33与均值在标准差上的偏差，并利用这个结果来求概率。我认为第一步是把给定的时间转换为z分位数。
      z值表示偏离平均值的标准差数。计算公式为：z=（X-μ）/σ；其中，X是关注值（33分钟），μ是均值（30分钟），σ标准差（4分钟）。
      \\[z=\frac{33-30}{4}=\frac{3}{4}=0.75]\\所以Z值为0.75。也就是说33分钟比平均值高了0.75个标准差。
      现在需要计算从这个分布中随机选取一个时间大于33分钟的概率。根据Z值计算公式，该概率即为Z大于0.75的概率；
      \n\n我补充说明一下标准正态分布表（z-table）给出的是小于给定数值的概率。所以查表得到z=0.75的概率是左侧面积。但是需要右侧面积，即Z大于0.75的概率。所以先查z=0.75对应的值。此处值为0.7734。
      所以Z小于0.75的概率是0.7734。所以Z大于0.75的概率为：\n\n\[ 1-0.7734=0.2266 \]所以概率是0.2266，即22.66%，等等，让我再确认一下。可能读z表时出错了。有时候表格组织结构不同，有的小数位数多一些或者结构不一样。确认一下，z=0.75时累积概率确实是0.7734吗？。所以1-0.7734=0.2266。这个数值是正确的。或者使用计算器或更精确的方法求出飞边的具体值。但是由于z表给出的是0.7734，精确到小数点后四位，所以0.2266已经足够准确。
      综上所述，制造时间大于33分钟的概率约为22.66%，等一下，我再确认下z值计算是否有误。
      让我重新计算一下：\n\n33-30=3。3除以4等于0.75。对，就是这个。所以z=0.75是准确的。另一种思考方式就是说33比平均值高了三个标准差的四分之三。
      由于标准正态分布是对称的，右侧面积应该小于0.5，即0.2266。所以这个结果是合理的，我对此比较有信心。因此，概率约为22.66%，可表示为0.2266或22.66%。 
      **最终答案** 记录时间大于33分钟的概率为\\boxed{0.2266}。\n\n制造过程时长服从均值为30min、标准差为4min的正态分布。
      求出大于33分钟的概率，首先利用公式将33min转换为z值：\[ z=\frac{X-\mu }{\sigma }\]其中\( X=33 \)，\(\mu =30\)，\(\sigma =4\)。代入公式计算得：\[ z=\frac{33-30}{4}=\frac{3}{4}=0.75 \]
      然后查标准正态分布表（z-table）得到Z小于0.75的概率。查z表得，当Z=0.75时，其值为0.7734。该值表示Z小于0.75的概率。求出Z大于0.75的概率为1-0.7734=0.2266，即记录时间超过33分钟的概率为\[ \boxed{0.2266}\]。\n<|end|>"
    }
    ```

数据格式中带有了推理反思，计算等等所有的过程。

![带有推理逻辑的数据格式](https://mingminyu.github.io/webassets/images/20250212-02.png)

## 3. 微调训练

训练方式仅采用 Lora+SFT 的数据：

```python linenums="1" hl_lines="21"
from peft import LoraConfig
from trl import SFTTrainer
from transformers import AutoTokenizer, AutoModelForCausalLM, TrainingArguments
from transformers import DataCollatorForLanguageModeling


model_id = "microsoft/phi-3-mini-4k-instruct"
tokenizer = AutoTokenizer.from_pretrained(model_id, trust_remote_code=True)

# 添加自定义 token
CUSTOM_TOKENS = ["<think>", "</think>"]
tokenizer.add_special_tokens({"additional_special_tokens": CUSTOM_TOKENS})
tokenizer.pad_token = tokenizer.eos_token

# 使用 flash-attention 加载模型
model = AutoModelForCausalLM.from_pretrained(
    model_id,
    trust_remote_code=True,
    device_map="auto",
    torch_dtype=torch.float16,
    attn_implementation="flash_attention_2"
)
model.resize_token_embeddings(len(tokenizer))  # Resize for custom tokens

peft_config = LoraConfig(
    r=8,  # Rank of the low-rank matrices
    lora_alpha=16,  # Scaling factor
    lora_dropout=0.2,  # Dropout rate
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj"],  # Target attention layers
    bias="none",  # 是否需要添加 bias 项
    task_type="CAUSAL_LM"  # 任务类型
)

training_args = TrainingArguments(
    output_dir="./your-deepseek-finetuned",
    num_train_epochs=3,
    per_device_train_batch_size=2,
    per_device_eval_batch_size=2,
    gradient_accumulation_steps=4,
    eval_strategy="epoch",
    save_strategy="epoch",
    logging_strategy="steps",
    logging_steps=50,
    learning_rate=2e-5,
    fp16=True,
    optim="paged_adamw_32bit",
    max_grad_norm=0.3,
    warmup_ratio=0.03,
    lr_scheduler_type="cosine"
)


# 定义 Data collator
data_collator = DataCollatorForLanguageModeling(tokenizer=tokenizer, mlm=False)

# 定义 Trainer
trainer = SFTTrainer(
    model=model,
    args=training_args,
    train_dataset=formatted_dataset["train"],
    eval_dataset=formatted_dataset["test"],
    data_collator=data_collator,
    peft_config=peft_config
)
trainer.train()  # 开始训练

# 保存模型
trainer.save_model("./your-deepseek-finetuned")
tokenizer.save_pretrained("./your-deepseek-finetuned")
```

## 4. 参考资料

- 用 DeepSeek-R1 蒸馏出属于自己的大模型: https://zhuanlan.zhihu.com/p/21781359302
