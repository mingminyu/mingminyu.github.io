# GPTQ

GPTQ 是一种针对类 GPT 大型语言模型的量化方法，它基于近似 **二阶信息** 进行一次性权重量化。在本文档中，我们介绍下如何使用 `transformers` 库加载并应用量化后的模型，以及如何通过 AutoGPTQ 来对您自己的模型进行量化处理。

## 1. 在 Transformers 中使用 GPTQ 模型

现在，Transformers 正式支持了 AutoGPTQ，这意味着我们能够直接在 Transformers 中使用量化后的模型。

```python linenums="1"
from transformers import AutoModelForCausalLM, AutoTokenizer


device = "cuda"
model = AutoModelForCausalLM.from_pretrained(
    "Qwen/Qwen2-7B-Instruct-GPTQ-Int8",
    device_map="auto"
)
tokenizer = AutoTokenizer.from_pretrained("Qwen/Qwen2-7B-Instruct-GPTQ-Int8")
prompt = "Give me a short introduction to large language model."
messages = [
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user", "content": prompt}
]
text = tokenizer.apply_chat_template(
    messages,
    tokenize=False,
    add_generation_prompt=True
)
model_inputs = tokenizer([text], return_tensors="pt").to(device)

generated_ids = model.generate(
    model_inputs.input_ids,
    max_new_tokens=512
)
generated_ids = [
    output_ids[len(input_ids):] 
    for input_ids, output_ids in zip(model_inputs.input_ids, generated_ids)
]

response = tokenizer.batch_decode(
        generated_ids, skip_special_tokens=True
        )[0]
```

## 2. 在 vLLM 中使用 GPTQ 模型

vLLM 已经支持了 GPTQ，这意味着我们可以直接使用 GPTQ 模型，或者将 AutoGPTQ 训练得到的模型与 vLLM 结合使用。实际上，其用法与 vLLM 的基本用法相同。

???+ note "使用 GPTQ 模型"

    === "运行 vLLM 服务"

        ```bash
        python -m vllm.entrypoints.openai.api_server --model Qwen/Qwen2-7B-Instruct-GPTQ-Int8
        ```
    
    === "CURL发送请求"

        ```bash linenums="1"
        curl http://localhost:8000/v1/chat/completions \
          -H "Content-Type: application/json" \ 
          -d '{
            "model": "Qwen/Qwen2-7B-Instruct-GPTQ-Int8",
            "messages": [
              {"role": "system", "content": "You are a helpful assistant."},
              {"role": "user", "content": "Tell me something about large language models."}
            ],
          }'
        ```
    
    === "Python发送请求"

        ```python linenums="1"
        from openai import OpenAI

        openai_api_key = "EMPTY"
        openai_api_base = "http://localhost:8000/v1"

        client = OpenAI(
            api_key=openai_api_key,
            base_url=openai_api_base,
        )

        chat_response = client.chat.completions.create(
            model="Qwen/Qwen2-7B-Instruct-GPTQ-Int8",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": "Tell me something about large language models."},
            ]
        )
        print("Chat response:", chat_response)
        ```

## 3. 使用 AutoGPTQ 量化你的模型

如果你想将微调后的模型量化为 GPTQ 模型，我们建议你使用 AutoGPTQ 工具。推荐通过安装源代码的方式获取并安装最新版本的该软件包。

```python linenums="1"
git clone https://github.com/AutoGPTQ/AutoGPTQ
cd AutoGPTQ
pip install -e .
```

假设你已经基于 Qwen2-7B 模型进行了微调，并将该微调后的模型命名为 Qwen2-7B-finetuned ，且使用的是自己的数据集，比如 Alpaca。要构建你自己的 GPTQ 量化模型，你需要使用训练数据进行校准。

```python linenums="1"
from auto_gptq import AutoGPTQForCausalLM, BaseQuantizeConfig
from transformers import AutoTokenizer

model_path = "your_model_path"
quant_path = "your_quantized_model_path"
quantize_config = BaseQuantizeConfig(
    bits=8, # (1)!
    group_size=128,
    damp_percent=0.01,
    desc_act=False,  # (2)!
    static_groups=False,
    sym=True,
    true_sequential=True,
    model_name_or_path=None,
    model_file_base_name="model"
)
max_len = 8192
tokenizer = AutoTokenizer.from_pretrained(model_path)  # (3)!
model = AutoGPTQForCausalLM.from_pretrained(model_path, quantize_config)
```
  
  1. 可设置为 4 或 8 位
  2. 设置为 `False` 可以明显加速推理，但困惑度可能有点差
  3. 如果想要了解使用多 GPU 加载模型，请参阅 [AutoGPTQ文档](https://github.com/AutoGPTQ/AutoGPTQ/blob/main/docs/tutorial/02-Advanced-Model-Loading-and-Best-Practice.md)。


但是，如果你想使用多 GPU 来读取模型，你需要使用 `max_memory` 而不是 `device_map`。

```python linenums="1"
model = AutoGPTQForCausalLM.from_pretrained(
    model_path,
    quantize_config,
    max_memory={i:"20GB" for i in range(4)}
)
```

接下来，你需要准备数据进行校准。你需要做的是将样本放入一个列表中，其中每个样本都是一段文本。由于我们直接使用微调数据进行校准，所以我们首先使用 ChatML 模板对它进行格式化处理。

```python linenums="1"
import torch

data = []
for msg in messages:  # (1) !
    text = tokenizer.apply_chat_template(msg, tokenize=False, add_generation_prompt=False)
    model_inputs = tokenizer([text])
    input_ids = torch.tensor(model_inputs.input_ids[:max_len], dtype=torch.int)
    data.append(dict(
        input_ids=input_ids, 
        attention_mask=input_ids.ne(tokenizer.pad_token_id)
        ))
```

  1. `msg` 的内容如下:

    ```python linenums="1"
    [
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Tell me who you are."},
        {"role": "assistant", "content": "I am a large language model named Qwen..."}
    ]
    ```

然后只需通过一行代码运行校准过程：

```python
model.quantize(data, cache_examples_on_gpu=False)
```

最后，保存量化模型：

```python linenums="1"
model.save_quantized(quant_path, use_safetensors=True)
tokenizer.save_pretrained(quant_path)
```

!!! warning "不支持切片"

    `save_quantized` 方法不支持模型分片。若要实现模型分片，我们需要先加载模型，然后使用来自 transformers 库的 `save_pretrained` 方法来保存并分片模型。
