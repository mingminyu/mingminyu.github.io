# TGI

 TGI（Hugging Face 的 Text Generation Inference）是一个专为部署大规模语言模型而设计的生产级框架，它提供了流畅的部署体验，并稳定支持如下特性：

- 推测解码 (Speculative Decoding) ：提升生成速度。
- 张量并行 (Tensor Parallelism) ：高效多卡部署。
- 流式生成 (Token Streaming) ：支持持续性生成文本。
- 灵活的硬件支持：与 AMD、Gaudi 和 AWS Inferentia 无缝衔接。

## 1. 安装

TGI 最简单的使用方式是 Docker 镜像，当然也可通过 Conda 实机安装或搭建服务。请参考 TGI [安装指南](https://huggingface.co/docs/text-generation-inference/installation)以及[命令行工具](https://huggingface.co/docs/text-generation-inference/en/basic_tutorials/using_cli) 了解详细说明。

## 2.通过 TGI 部署 Qwen2

在终端中运行以下命令，注意替换 model 为你想要使用的 Qwen2 模型、 volume 为本地的数据路径：

```bash linenums="1" title="TGI 运行 Qwen2-7B-Instruct"
model=Qwen/Qwen2-7B-Instruct
# 避免每次运行时下载权重，这里将本地目录挂载到 Docker 容器中
volume=$PWD/data

docker run --gpus all --shm-size 1g -p 8080:80 \
    -v $volume:/data \ 
    ghcr.io/huggingface/text-generation-inference:2.0 \
    --model-id $model
```

## 2. 使用 TGI API

一旦成功部署，API 将于选定的映射端口 (8080) 提供服务，TGI 提供了简单直接的 API 支持流式生成，同时也支持 OpenAI 风格的 API：

???+ note "TGI API 的使用"

    === "流式 API"

        ```json linenums="1"
        curl http://localhost:8080/generate_stream \
          -H "Content-Type: application/json" \
          -d '{
            "inputs": "Tell me something about large language models.",
            "parameters": {"max_new_tokens": 512}
          }'
        ```
    
    === "OpenAI"

        ```json linenums="1"
        // `model` 字段不会被 TGI 识别，这里可传入任意值。
        curl http://localhost:8080/v1/chat/completions \
          -H "Content-Type: application/json" \
          -d '{
            "model": "",
            "messages": [
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": "Tell me something about large language models."}
              ],
            "max_tokens": 512
          }'
        ```


    === "Python"

        ```python linenums="1"
        from openai import OpenAI


        client = OpenAI(
            base_url="http://localhost:8080/v1/",
            api_key="",
        )
        chat_completion = client.chat.completions.create(
            model="",  # (1)!
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": "Tell me something about large language models."},
            ],
            stream=True,
            max_tokens=512,
        )

        for message in chat_completion:
            print(message.choices[0].delta.content, end="")
        ```
          
          1. `model` 字段不会被 TGI 识别，我们可传入任意值。

## 3. 量化

### 3.1 GPTQ 与 AWQ

GPTQ 与 AWQ 均依赖数据进行量化，Qwen2 提供了不同大小且预先量化好的模型。当然我们也可以使用自己的业务数据集自行量化，从而取得更好效果。

```bash linenums="1" hl_lines="8"
model=Qwen/Qwen2-7B-Instruct-GPTQ-Int4
volume=$PWD/data

docker run --gpus all --shm-size 1g -p 8080:80 \
  -v $volume:/data \
  ghcr.io/huggingface/text-generation-inference:2.0 \
  --model-id $model \
  --quantize gptq  # (1)!
```

  1. 使用 GPTQ 量化方式，如果使用 AWQ 量化模型，则使用 `--quantize awq`。

### 3.2 不依赖数据的量化方案

EETQ 是一种不依赖数据的量化方案，可直接用于任意模型。请注意，我们需要传入原始模型，并使用 `--quantize eetq` 标志。

```bash linenums="1" hl_lines="8"
model=Qwen/Qwen2-7B-Instruct
volume=$PWD/data

docker run --gpus all --shm-size 1g -p 8080:80 \
  -v $volume:/data \
  ghcr.io/huggingface/text-generation-inference:2.0 \
  --model-id $model \
  --quantize eetq
```

### 3.3 延迟指标

以下为 Qwen2-7B-Instruct 量化模型在 4090 上的 token/s 结果：

- GPTQ int4: 6.8ms
- AWQ int4: 7.9ms
- EETQ int8: 9.7ms

## 4. 多卡部署

使用 `--num-shard` 指定显卡数量，请务必传入 `--shm-size 1g` 让 NCCL 发挥最好性能 ([说明](https://github.com/huggingface/text-generation-inference?tab=readme-ov-file#a-note-on-shared-memory-shm)) ：


```bash linenums="1" hl_lines="8"
model=Qwen/Qwen2-7B-Instruct
volume=$PWD/data

docker run --gpus all --shm-size 1g -p 8080:80 \
  -v $volume:/data \
  ghcr.io/huggingface/text-generation-inference:2.0 \
  --model-id $model \
  --num-shard 2
```

## 5. 推测性解码

推测性解码 (Speculative Decoding) 通过预先推测下一 token 来节约每 token 需要的时间，使用 `--speculative-decoding` 设定预先推测 token 的数量 （默认为 0，表示不预先推测）：

```bash linenums="1" hl_lines="8"
model=Qwen/Qwen2-7B-Instruct
volume=$PWD/data

docker run --gpus all --shm-size 1g -p 8080:80 \
  -v $volume:/data \
  ghcr.io/huggingface/text-generation-inference:2.0 \ 
  --model-id $model \
  --speculate 2
```

以下是 Qwen2-7B-Instruct 在 4090 GPU 上的实测指标：

- 无预先推测（默认）：17.4ms
- 预先推测 (n=2)：16.6ms

本例为代码生成，推测性解码相比于默认配置可加速 10%。推测性解码的加速效果依赖于任务类型，对于代码或重复性较高的文本生成任务，提速更明显。更多说明可查阅此[文档](https://huggingface.co/docs/text-generation-inference/conceptual/speculation)。

## 6. 使用 HF Inference Endpoints 零代码部署

使用 Hugging Face Inference Endpoints 不费吹灰之力：

- GUI interface: https://huggingface.co/inference-endpoints/dedicated
- Coding interface: https://huggingface.co/blog/tgi-messages-api

一旦部署成功，服务使用与本地无异。

## 7.常见问题

Qwen2 支持长上下文，谨慎设定 `--max-batch-prefill-tokens`、`--max-total-tokens` 和 `--max-input-tokens` 以避免内存溢出（out-of-memory, OOM）。如 OOM ，你将在启动 TGI 时收到错误提示。以下为修改这些参数的示例：

```bash linenums="1" hl_lines="8-10"
model=Qwen/Qwen2-7B-Instruct
volume=$PWD/data 

docker run --gpus all --shm-size 1g -p 8080:80 \
  -v $volume:/data \
  ghcr.io/huggingface/text-generation-inference:2.0 \
  --model-id $model \
  --max-batch-prefill-tokens 4096 \
  --max-total-tokens 4096 \
  --max-input-tokens 2048
```