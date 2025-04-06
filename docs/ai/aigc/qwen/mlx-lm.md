# MLX-LM

MLX-LM 能在 Apple Silicon 上运行大型语言模型，适用于 MacOS。目前 MLX-LM 已支持 Qwen 模型，此次我们提供直接可用的模型文件。

## 1. 安装

???+ "安装 mlx-lm"

    === "PIP"

        ```bash
        pip install mlx-lm
        ```

    === "CONDA"

        ```bash
        conda install -c conda-forge mlx-lm
        ```

## 2. 使用 MLX 模型文件

我们已在 Hugging Face 提供了适用于 MLX-LM 的模型文件，请搜索带 -MLX 的存储库。

```python linenums="1"
from mlx_lm import load, generate

model, tokenizer = load(
    'Qwen/Qwen2-7B-Instruct-MLX',
    tokenizer_config={"eos_token": "<|im_end|>"}
    )

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

response = generate(
    model, tokenizer, prompt=text, verbose=True, top_p=0.8, 
    temp=0.7, repetition_penalty=1.05, max_tokens=512
    )
```

## 3. 制作 MLX 格式模型

制作 MLX 格式的模型非常简单，仅仅需要一条命令就可以完成：

```bash linenums="1"
mlx_lm.convert --hf-path Qwen/Qwen2-7B-Intruct \  # (1)!
    --mlx-path mlx/Qwen2-7B-Instruct \  # (2)!
    - q  # (3)!
```

  1. HuggingFace Hub 上的模型名称或本地路径
  2. 输出模型文件的存储路径
  3. 启用量化
