# AWQ

对于量化模型，我们推荐使用 **AWQ** 结合 **AutoAWQ** ，激活值感知的权重量化（Activation-aware Weight Quantization, AWQ）是一种针对 LLM 的低比特权重量化的硬件友好方法。而 AutoAWQ 是一个易于使用的工具包，用于 4 比特量化模型。

相较于 FP16，AutoAWQ 能够将模型的运行速度提升 3 倍，并将内存需求降低至原来的 1/3。AutoAWQ 实现了 AWQ 算法，可用于 LLM 的量化处理。在本文档中，我们将向您展示如何在 Transformers 框架下使用量化模型，以及如何对您自己的模型进行量化。

## 1. 在 Transformers 中使用 AWQ 量化模型

现在，Transformers 已经正式支持 AutoAWQ，这意味着您可以直接在 Transformers 中使用量化模型。以下是一个非常简单的代码片段，展示如何运行量化模型 Qwen2-7B-Instruct-AWQ：

```python linenums="1" hl_lines="6 9"
from transformers import AutoModelForCausalLM, AutoTokenizer


device = "cuda"
model = AutoModelForCausalLM.from_pretrained(
    "Qwen/Qwen2-7B-Instruct-AWQ",
    device_map="auto"
)
tokenizer = AutoTokenizer.from_pretrained("Qwen/Qwen2-7B-Instruct-AWQ")

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


## 2. 在 vLLM 中使用 AWQ 量化模型

vLLM 已经支持了 AWQ，这意味着您可以直接使用我们提供的 AWQ 模型，或者是通过 AutoAWQ 训练得到的与 vLLM 兼容的模型。实际上，其用法与 vLLM 的基本用法相同。我们提供了一个简单的示例，展示了如何通过 vLLM 启动与 OpenAI API 兼容的接口，并使用 Qwen2-7B-Instruct-AWQ 模型：

???+ "vllm 使用 AWQ 模型 "

    === "开启Qwen2-7B-Instruct-AWQ服务"

        ```bash
        python -m vllm.entrypoints.openai.api_server --model Qwen/Qwen2-7B-Instruct-AWQ
        ```

    === "CURL发送请求"

        ```bash
        curl http://localhost:8000/v1/chat/completions \
          -H "Content-Type: application/json" \
          -d '{
            "model": "Qwen/Qwen2-7B-Instruct-AWQ",
            "messages": [
              {"role": "system", "content": "You are a helpful assistant."},
              {"role": "user", "content": "Tell me something about large language models."}
            ],
          }'
        ```

    === "Pyhton客户端发送请求"

        ```python
        from openai import OpenAI
        
        openai_api_key = "EMPTY"
        openai_api_base = "http://localhost:8000/v1"

        client = OpenAI(
            api_key=openai_api_key,
            base_url=openai_api_base,
        )

        chat_response = client.chat.completions.create(
            model="Qwen/Qwen2-7B-Instruct-AWQ",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": "Tell me something about large language models."},
            ]
        )
        print("Chat response:", chat_response)
        ```

## 3. 使用 AutoAWQ 量化模型

如果您希望将自定义模型量化为 AWQ 量化模型，我们建议您使用 AutoAWQ。推荐通过安装源代码来获取并安装该工具包的最新版本：

```bash linenums="1"
git clone https://github.com/casper-hansen/AutoAWQ.git
cd AutoAWQ
pip install -e .
```

假设你已经基于 Qwen2-7B 模型进行了微调，并将其命名为 Qwen2-7B-finetuned，且使用的是你自己的数据集，比如 Alpaca。若要构建你自己的 AWQ 量化模型，你需要使用训练数据进行校准。以下，我们将为你提供一个简单的演示示例以便运行：

```python linenums="1"
from awq import AutoAWQForCausalLM
from transformers import AutoTokenizer


model_path = "your_model_path"
quant_path = "your_quantized_model_path"
quant_config = { "zero_point": True, "q_group_size": 128, "w_bit": 4, "version": "GEMM" }

# Load your tokenizer and model with AutoAWQ
tokenizer = AutoTokenizer.from_pretrained(model_path)
model = AutoAWQForCausalLM.from_pretrained(
    model_path, device_map="auto", safetensors=True
    )
```

接下来，您需要准备数据以进行校准。您需要做的就是将样本放入一个列表中，其中每个样本都是一段文本。由于我们直接使用微调数据来进行校准，所以我们首先使用 ChatML 模板对其进行格式化。

```python linenums="1"
data = []
for msg in messages:  # (1)!
    msg = c['messages']
    text = tokenizer.apply_chat_template(
              msg, tokenize=False, add_generation_prompt=False
              )
    data.append(text.strip())
```

  1. 每个 `msg` 是一个典型的聊天消息

      ```python linenums="1"
      [
          {"role": "system", "content": "You are a helpful assistant."},
          {"role": "user", "content": "Tell me who you are."},
          {"role": "assistant", "content": "I am a large language model named Qwen..."}
      ]
      ```

然后只需通过一行代码运行校准过程：

```python
model.quantize(tokenizer, quant_config=quant_config, calib_data=data)
```

最后，保存量化模型：

```python linenums="1"
model.save_quantized(quant_path, safetensors=True, shard_size="4GB")
tokenizer.save_pretrained(quant_path)
```

这样你就可以得到一个可以用于部署的 AWQ 量化模型。
