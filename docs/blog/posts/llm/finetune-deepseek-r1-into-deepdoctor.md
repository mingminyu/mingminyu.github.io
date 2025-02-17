---
date: 2025-02-17
authors:
  - mingminyu
categories:
  - 大模型
tags:
  - DeepSeek
  - 转载
readtime: 20
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

### 2.1 环境搭建

首先，启动一个新的 Kaggle notebook，并将你的 Hugging Face token 和 Weights & Biases token 添加为密钥。

![](https://mingminyu.github.io/webassets/images/20250217-02.png)

设置好密钥之后，安装 [unsloth](https://github.com/unslothai/unsloth) Python 包。Unsloth 是一个开源框架，旨在使大型语言模型（LLM）的微调速度提高一倍，并且更具内存效率。

```bash
pip install unsloth
pip install --force-reinstall --no-cache-dir --no-deps git+https://github.com/unslothai/unsloth.git
```

登录 Hugging Face CLI，我们后续下载数据集和上传微调后的模型用得到。

```python linenums="1"
from huggingface_hub import login
from kaggle_secrets import UserSecretsClient

user_secrets = UserSecretsClient()
hf_token = user_secrets.get_secret("HUGGINGFACE_TOKEN")
login(hf_token)
```

登录 Weights & Biases (WanDB)，并创建一个新项目，以跟踪实验和微调进展。

```python linenums="1"
import wandb


wb_token = user_secrets.get_secret("wandb")
wandb.login(key=wb_token)
run = wandb.init(
    project='Fine-tune-DeepSeek-R1-Distill-Llama-8B on Medical COT Dataset', 
    job_type="training", 
    anonymous="allow"
)
```

### 2.2 加载模型和 tokenzier

在本项目中，我们将加载 Unsloth 版本的 [DeepSeek-R1-Distill-Llama-8B](https://huggingface.co/unsloth/DeepSeek-R1-Distill-Llama-8B)。此外，为了优化内存使用和性能，我们将以 4-bit 量化的方式加载该模型。

```python linenums="1"
from unsloth import FastLanguageModel

max_seq_length = 2048 
dtype = None 
load_in_4bit = True

model, tokenizer = FastLanguageModel.from_pretrained(
    model_name="unsloth/DeepSeek-R1-Distill-Llama-8B",
    max_seq_length=max_seq_length,
    dtype=dtype,
    load_in_4bit=load_in_4bit,
    token=hf_token, 
)
```

### 2.3 微调前的模型推理

为了给模型创建提示模板，我们将定义一个系统提示，并在其中包含问题和回答生成的占位符。该提示将引导模型逐步思考，并提供一个逻辑严谨、准确的回答。

```python linenums="1"
prompt_style = """
Below is an instruction that describes a task, paired with an input that provides further context. Write a response that appropriately completes the request. Before answering, think carefully about the question and create a step-by-step chain of thoughts to ensure a logical and accurate response.

### Instruction:
You are a medical expert with advanced knowledge in clinical reasoning, diagnostics, and treatment planning. 
Please answer the following medical question. 

### Question:
{}

### Response:
<think>{}</think>"""
```

在这个示例中，我们将向 `prompt_style` 提供一个医学问题，将其转换为 token，然后将这些 token 传递给模型以生成回答。

```python linenums="1"
question = "A 61-year-old woman with a long history of involuntary urine loss during activities like coughing or sneezing but no leakage at night undergoes a gynecological exam and Q-tip test. Based on these findings, what would cystometry most likely reveal about her residual volume and detrusor contractions?"


FastLanguageModel.for_inference(model) 
inputs = tokenizer([prompt_style.format(question, "")], return_tensors="pt").to("cuda")

outputs = model.generate(
    input_ids=inputs.input_ids,
    attention_mask=inputs.attention_mask,
    max_new_tokens=1200,
    use_cache=True,
)
response = tokenizer.batch_decode(outputs)
print(response[0].split("### Response:")[1])
```

即使在没有微调的情况下，我们的模型也成功地生成了思维链，并在给出最终答案之前进行了推理，整个推理过程被封装在 `<think></think>` 标签内。

那么，为什么我们仍然需要微调呢？尽管推理过程详细，但它显得冗长且不简洁。此外，最终答案以项目符号格式呈现，这与我们希望微调的数据集的结构和风格有所偏离。

### 2.4 加载和处理数据集

我们将稍微调整提示模板，以处理数据集，方法是为复杂的思维链列添加第三个占位符。

```python linenums="1"

train_prompt_style = """
Below is an instruction that describes a task, paired with an input that provides further context. Write a response that appropriately completes the request. Before answering, think carefully about the question and create a step-by-step chain of thoughts to ensure a logical and accurate response.

### Instruction:
You are a medical expert with advanced knowledge in clinical reasoning, diagnostics, and treatment planning. 
Please answer the following medical question. 

### Question:
{}

### Response:
<think>
{}
</think>
{}"""
```

编写一个 Python 函数，在数据集中创建一个 `text` 列，该列由训练提示模板组成。将占位符填充为问题、思维链和答案。

```python linenums="1"
EOS_TOKEN = tokenizer.eos_token  # Must add EOS_TOKEN


def formatting_prompts_func(examples: Dict[str, List[str]]):
    inputs = examples["Question"]
    cots = examples["Complex_CoT"]
    outputs = examples["Response"]
    texts = []

    for input, cot, output in zip(inputs, cots, outputs):
        text = train_prompt_style.format(input, cot, output) + EOS_TOKEN
        texts.append(text)
    
    return {"text": texts}
```

我们将从 Hugging Face Hub 加载 [FreedomIntelligence/medical-o1-reasoning-SFT](https://huggingface.co/datasets/FreedomIntelligence/medical-o1-reasoning-SFT?row=46) 数据集的前 500个 样本。之后，我们将使用 `formatting_prompts_func` 函数对 `text` 列进行映射。

```python linenums="1"
from datasets import load_dataset

dataset = load_dataset(
  "FreedomIntelligence/medical-o1-reasoning-SFT", split="train[:500]", trust_remote=True
  )
dataset = dataset.map(formatting_prompts_func)
dataset["text"][0]
```

如输出所见，`text` 列包含了系统提示、指令、思维链和答案。

### 2.5 设置模型

通过使用目标模块，我们将通过向模型中添加低秩适配器（Low-Rank Adopter）来设置模型。

```python linenums="1"
model = FastLanguageModel.get_peft_model(
    model,
    r=16,  
    target_modules=[
        "q_proj",
        "k_proj",
        "v_proj",
        "o_proj",
        "gate_proj",
        "up_proj",
        "down_proj",
    ],
    lora_alpha=16,
    lora_dropout=0,  
    bias="none",  
    use_gradient_checkpointing="unsloth",  # True or "unsloth" for very long context
    random_state=3407,
    use_rslora=False,  
    loftq_config=None,
)
```

接下来，我们将设置训练参数和训练器，通过提供模型、tokenizer、数据集以及其他重要的训练参数，来优化我们的微调过程。

```python linenums="1"
from trl import SFTTrainer
from transformers import TrainingArguments
from unsloth import is_bfloat16_supported

trainer = SFTTrainer(
    model=model,
    tokenizer=tokenizer,
    train_dataset=dataset,
    dataset_text_field="text",
    max_seq_length=max_seq_length,
    dataset_num_proc=2,
    args=TrainingArguments(
        per_device_train_batch_size=2,
        gradient_accumulation_steps=4,
        # Use num_train_epochs = 1, warmup_ratio for full training runs!
        warmup_steps=5,
        max_steps=60,
        learning_rate=2e-4,
        fp16=not is_bfloat16_supported(),
        bf16=is_bfloat16_supported(),
        logging_steps=10,
        optim="adamw_8bit",
        weight_decay=0.01,
        lr_scheduler_type="linear",
        seed=3407,
        output_dir="outputs",
    ),
)
```

### 2.6 训练模型

执行如下代码：

```python linenums="1"
trainer_stats = trainer.train()
```

训练过程花费了 22 分钟完成。训练损失逐渐降低，这表明模型性能有所提升，这是一个积极的信号。通过登录 Weights & Biases 网站并查看完整的模型评估报告。

![WanDB训练过程](https://mingminyu.github.io/images/20250217-03.png)

### 2.7 微调后的模型推理

为了对比结果，我们将向微调后的模型提出与之前相同的问题，看看有什么变化。

```python linenums="1"
question = "A 61-year-old woman with a long history of involuntary urine loss during activities like coughing or sneezing but no leakage at night undergoes a gynecological exam and Q-tip test. Based on these findings, what would cystometry most likely reveal about her residual volume and detrusor contractions?"


FastLanguageModel.for_inference(model)  # Unsloth has 2x faster inference!
inputs = tokenizer([prompt_style.format(question, "")], return_tensors="pt").to("cuda")

outputs = model.generate(
    input_ids=inputs.input_ids,
    attention_mask=inputs.attention_mask,
    max_new_tokens=1200,
    use_cache=True,
)
response = tokenizer.batch_decode(outputs)
print(response[0].split("### Response:")[1])
```

![](https://mingminyu.github.io/images/20250217-04.png)

结果明显更好且更准确。思维链条简洁明了，答案直接且只用了一段话。微调成功。

### 2.9 保存本地模型

现在，让我们将适配器、完整模型和 tokenizer 保存在本地，以便在其他项目中使用。

```python linenums="1" hl_lines="2-5"
new_model_local = "DeepSeek-R1-Medical-COT"
model.save_pretrained(new_model_local) 
tokenizer.save_pretrained(new_model_local)

model.save_pretrained_merged(new_model_local, tokenizer, save_method = "merged_16bit",)
```

### 2.10 将模型推送到 Hugging Face Hub

我们还将把适配器、tokenizer 和模型推送到 Hugging Face Hub，以便 AI 社区能够通过将其集成到他们的系统中，充分利用这个模型。

```python linenums="1" hl_lines="5"
new_model_online = "realyinchen/DeepSeek-R1-Medical-COT"
model.push_to_hub(new_model_online)
tokenizer.push_to_hub(new_model_online)

model.push_to_hub_merged(new_model_online, tokenizer, save_method="merged_16bit")
```

![](https://mingminyu.github.io/images/20250217-05.png)

## 3. 总结

开源的 LLM 正在变得更加优秀、更快速、更高效，使得在较低的计算和内存资源下微调它们变得比以往更加容易。

在本教程中，我们探讨了 DeepSeek R1 推理模型，并学习了如何对其精简版进行微调，以应用于医学问答任务。微调后的推理模型不仅提升了性能，还使其能够应用于医学、急救服务和医疗等关键领域。

为了应对 DeepSeek R1 的发布，OpenAI 推出了两个强大的工具：一个更先进的推理模型：o3，以及 Operator AI Agent，依托全新的计算机使用 Agent（CUA，Computer Use Agent）模型，能够自主浏览网站并执行任务。

> 源代码： https://www.kaggle.com/code/realyinchen/deepseek-r1-medical-cot
