# 快速入门

安装完 `transformers` 库后，我们通过一些示例（包含 HuggingFace 以及 vLLM 部署）来快速了解下 Qwen2 的使用。

## 1. HuggingFace & ModelScope Transformers

要快速上手 Qwen2，我们建议您首先尝试使用 `transformers` 进行推理，请确保已安装了 `transformers>=4.40.0` 版本。以下是一个非常简单的代码片段示例，展示如何运行Qwen2-Instruct 模型，其中包含 Qwen2-7B-Instruct 的实例：

```python linenums="1"
from transformers import AutoModelForCausalLM, AutoTokenizer  # (1)!


device = "cuda"
model = AutoModelForCausalLM.from_pretrained(
    "Qwen/Qwen2-7B-Instruct",
    torch_dtype="auto",
    device_map="auto"
)
tokenizer = AutoTokenizer.from_pretrained("Qwen/Qwen2-7B-Instruct")

# 不同于以前使用 的`model.chat` 方法，现在我们使用 `model.generate` 方法
# 但是我们需要先使用 `tokenizer.apply_chat_template` 方法来格式化输入
prompt = "Give me a short introduction to large language model."
messages = [
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user", "content": prompt}
]
text = tokenizer.apply_chat_template(  # (2)!
    messages,
    tokenize=False,
    add_generation_prompt=True
)
model_inputs = tokenizer([text], return_tensors="pt").to(device)

# 直接使用 `model.generate` 以及 `tokenizer.decode` 方法获取输出
generated_ids = model.generate(  # (3)!
    model_inputs.input_ids,
    max_new_tokens=512  # (4)!
)
generated_ids = [
    output_ids[len(input_ids):]   # (5)!
    for input_ids, output_ids in zip(model_inputs.input_ids, generated_ids)
]

response = tokenizer.batch_decode(  # (6)!
    generated_ids, skip_special_tokens=True
  )[0]
```

  1. 由于 HuggingFace 在国内下载速度慢的问题，我们推荐从 ModelScope 上进行下载，只需要更改为以下代码即可。

      ```python
      from modelscope import AutoModelForCausalLM, AutoTokenizer
      ```

  2. 先通过 `tokenizer.apply_chat_template` 方法对输入进行格式化，这也是 `transformers` 推荐的实践方式。
  3. 直接调用 `model.generate` 方法生成输出。需要注意的是，这里输出的并不是最终的文本内容，而是包含了输入的编码信息。
  4. 使用 `max_new_tokens` 参数限制输出催最大长度。
  5. 通常我们只关心输出的内容，所以这里从输入长度开始截取。
  6. 对截断后的编码进行解码，得到实际的输出内容。

如果你想使用 Flash Attention 2 (1)，你可以用下面这种方式读取模型：
{ .annotate }
  
  1. 强烈建议安装 Flash Attention 2，不然 Qwen 的推理速度实际上也是比较慢的。

```python linenums="1" hl_lines="5"
model = AutoModelForCausalLM.from_pretrained(
    "Qwen/Qwen2-7B-Instruct",
    torch_dtype="auto",
    device_map="auto",
    attn_implementation="flash_attention_2",
)
```

此外，结合 `transformers` 的 `TextStreamer` 类，可以轻松实现流式输出：

```python linenums="1" hl_lines="1 6"
from transformers import TextStreamer
streamer = TextStreamer(tokenizer, skip_prompt=True, skip_special_tokens=True)
generated_ids = model.generate(
    model_inputs.input_ids,
    max_new_tokens=512,
    streamer=streamer,
)
```

## 2. 使用 vLLM 部署

要部署 Qwen2，我们建议您使用 vLLM。vLLM 是一个用于 LLM 推理和服务的快速且易于使用的框架。以下，我们将展示如何使用 vLLM 构建一个与 OpenAI API 兼容的 API 服务。

???+ note "vLLM 的安装与运行"

    === "安装 vLLM"
        需要确保安装的 vLLM 版本在 0.4.0 以上。

        ```bash
        pip install vllm
        ```

    === "运行 vLLM 服务"

        ```bash
        python -m vllm.entrypoints.openai.api_server --model Qwen/Qwen2-7B-Instruct
        ```

接下来，我们可以 `curl` 或者 OpenAI 的 Python 接口来与 Qwen 进行交互：

???+ tip "vLLM 的安装与运行"

    === "直接使用 curl"

        ```bash
        curl http://localhost:8000/v1/chat/completions \ 
          -H "Content-Type: application/json" \
          -d '{
            "model": "Qwen/Qwen2-7B-Instruct",
            "messages": [
              {"role": "system", "content": "You are a helpful assistant."},
              {"role": "user", "content": "Tell me something about large language models."}
            ]
          }'
        ```

    === "调用 OpenAI 的接口"

        ```bash
        from openai import OpenAI
        # 设置 OpenAI 的 Key 和 API 接口（本地就是 vLLM 启动端口）
        openai_api_key = "EMPTY"
        openai_api_base = "http://localhost:8000/v1"

        client = OpenAI(
            api_key=openai_api_key,
            base_url=openai_api_base,
        )

        chat_response = client.chat.completions.create(
            model="Qwen/Qwen2-7B-Instruct",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": "Tell me something about large language models."},
              ]
            )
        print("Chat response:", chat_response)
        ```

