# vLLM

我们建议您在部署 Qwen 时尝试使用 vLLM，它易于使用，且具有最先进的服务吞吐量、高效的 **注意力键值内存管理**（通过 PagedAttention 实现）、连续批处理输入请求、优化的 CUDA 内核等功能。

## 1. 安装

默认情况下，你可以通过 `pip` 来安装 vLLM：

```bash
pip install vLLM>=0.4.0
pip install ray  # 推荐安装
```

但如果你正在使用 CUDA 11.8，请查看官方文档中的注意事项，以获取有关安装的[帮助](https://docs.vllm.ai/en/latest/getting_started/installation.html)。 此外，建议通过安装`ray`，以便支持分布式服务。

## 2. 离线推理

vLLM 支持 Qwen2 所有模型都，离线批量推理是最简单的使用方式。

```python linenums="1"
from transformers import AutoTokenizer
from vllm import LLM, SamplingParams


tokenizer = AutoTokenizer.from_pretrained("Qwen/Qwen2-7B-Instruct")
# `max_tokens` 用于设置生成的最大长度
sampling_params = SamplingParams(
    temperature=0.7, top_p=0.8, repetition_penalty=1.05, max_tokens=512
    )
# 这里也支持 GPTQ 和 AWQ 模型
llm = LLM(model="Qwen/Qwen2-7B-Instruct")

prompt = "Tell me something about large language models."
messages = [
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user", "content": prompt}
]
text = tokenizer.apply_chat_template(
    messages,
    tokenize=False,
    add_generation_prompt=True
)
outputs = llm.generate([text], sampling_params)

for output in outputs:
    prompt = output.prompt
    generated_text = output.outputs[0].text
    print(f"Prompt: {prompt!r}, Generated text: {generated_text!r}")
```

## 3. 适配OpenAI-API的API服务

借助 vLLM，构建一个与 OpenAI API 兼容的服务十分简便，该服务可以作为实现 OpenAI API 协议的服务器进行部署。

默认情况下，服务将启动在 http://localhost:8000 端口上，另外可以通过 `--host` 和 `--port` 参数来自定义地址。这里我们不需担心 Chat 模板，因为默认会使用由 `tokenizer` 提供的 Chat 模板。

```bash
python -m vllm.entrypoints.openai.api_server --model Qwen/Qwen2-7B-Instruct
```

接下来，让我们尝试下与 vLLM 进行交互。

???+ note "与 vLLM 上的 Qwen 交互"
    
    === "CURL发送请求"

        ```bash linenums="1"
        curl http://localhost:8000/v1/chat/completions \
          -H "Content-Type: application/json" \ 
          -d '{
            "model": "Qwen/Qwen2-7B-Instruct",
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
            model="Qwen/Qwen2-7B-Instruct",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": "Tell me something about large language models."},
            ]
        )
        print("Chat response:", chat_response)
        ```


## 4.多卡分布式部署
要提高模型的处理吞吐量，可以通过利用更多的 GPU 设备来实现分布式服务。特别是对于像 Qwen2-72B-Instruct 这样的大模型，单个 GPU 显然无法支撑其在线服务。

这里我们通过演示如何仅通过传入参数 `tensor_parallel_size` ，来使用张量并行来运行 Qwen2-72B-Instruct 模型：

```python
from vllm import LLM, SamplingParams

llm = LLM(model="Qwen/Qwen2-72B-Instruct", tensor_parallel_size=4)
```

当然，我们也可以通过传递参数 `--tensor-parallel-size` 来运行多 GPU 服务：

```bash linenums="1"
python -m vllm.entrypoints.api_server \
    --model Qwen/Qwen2-72B-Instruct \
    --tensor-parallel-size 4
```

## 5. 部署量化模型

vLLM 支持多种类型的量化模型，例如 AWQ、GPTQ、 **SqueezeLLM** 等。接下来，我们将介绍下如何部署 AWQ 和 GPTQ 模型。使用方法与上述基本相同，只不过需要额外指定一个量化参数 `quantization`。

???+ example "部署 AWQ/GPTQ 模型"

    === "AWQ"

        ```python linenums="1"
        from vllm import LLM, SamplingParams

        llm = LLM(model="Qwen/Qwen2-72B-Instruct-AWQ", quantization="awq")
        ```

    === "GPTQ"

        ```python linenums="1"
        from vllm import LLM, SamplingParams

        llm = LLM(model="Qwen/Qwen2-72B-Instruct-GPTQ-Int4", quantization="gptq")
        ```

当然，在终端中启动服务时也可以添加 `--quantization` 参数。

???+ example "命令行中启动量化模型"

    === "AWQ"

        ```bash linenums="1" hl_lines="3"
        python -m vllm.entrypoints.openai.api_server \
          --model Qwen/Qwen2-72B-Instruct-AWQ \
          --quantization awq
        ```

    === "GPTQ"

        ```python linenums="1" hl_lines="3"
        python -m vllm.entrypoints.openai.api_server \
          --model Qwen/Qwen2-72B-Instruct-GPTQ-Int4 \
          --quantization gptq
        ```

此外，vLLM 也支持将 AWQ 或 GPTQ 模型与 **KV** 缓存量化相结合， 即FP8 E5M2 KV Cache 方案。

!!! note "vLLM使用量化模型并结合 KV 缓存"

    === "Python"

        ```python linenums="1" hl_lines="4"
        llm = LLM(
            model="Qwen/Qwen2-7B-Instruct-GPTQ-Int8",
            quantization="gptq", 
            kv_cache_dtype="fp8_e5m2"
            )
        ```

    === "命令行"

        ```bash linenums="1" hl_lines="4"
        python -m vllm.entrypoints.openai.api_server \
          --model Qwen/Qwen2-7B-Instruct-GPTQ-Int8 \
          --quantization gptq \
          --kv-cache-dtype fp8_e5m2
        ```

## 6. 常见问题

如果遇到令人烦恼的 OOM（内存溢出）问题，这里推荐您尝试两个参数进行修复。

- 第一个参数是 `--max-model-len`，目前提供的默认最大位置嵌入（`max_position_embedding`）为 32768，因此服务时的最大长度也是这个值，这会导致更高的内存需求。将此值适当减小通常有助于解决 OOM 问题。
- 另一个参数是 `--gpu-memory-utilization`，默认值为 0.9 ，我们可以将其调高以应对 OOM 问题。