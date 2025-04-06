# Ollama

Ollama 帮助您通过少量命令即可在本地运行 LLM，它适用于 MacOS、Linux 和 Windows 操作系统。现在，Qwen2 正式上线 Ollama，您只需一条命令即可运行它：

```bash
ollama run qwen2
```

## 1. 快速开始

访问官方网站 [Ollama](https://ollama.com/download) ，下载并安装 Ollama。您还可以在网站上搜索模型，在这里您可以找到 Qwen2 系列模型。

除了默认模型之外，您可以通过以下方式选择运行不同大小（0.5B、1.5B、7B 以及 72B）的 Qwen2-Instruct 模型：

```bash linenums="1"
ollama run qwen2:0.5b
```

成功启动服务后（端口启动在 11434），可以通过发送请求来和 Qwen2 进行交互。

```python linenums="1"
import requests
import json

headers = {"Content-Type": "application/json"}
messages = [
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user", "content": "你好"}
]
model = "qwen2:0.5b"
ollama_url = "http://localhost:11434/v1/chat/completions"
data = {
    "model": model,
    "messages": messages
}

resp = requests.post(ollama_url, headers=headers, data=json.dumps(data))
resp
```



## 2. 运行 GGUF 文件

有时您可能不想拉取模型，而是希望直接使用自己的 GGUF 文件来配合 Ollama。假设您有一个名为  qwen2-7b-instruct-q5_0.gguf 的 Qwen2 的 GGUF 文件。在第一步中，您需要创建一个名为 Modelfile 的文件。

```bash linenums="1"
FROM qwen2-7b-instruct-q5_0.gguf

# set the temperature to 1 [higher is more creative, lower is more coherent]
PARAMETER temperature 0.7
PARAMETER top_p 0.8
PARAMETER repeat_penalty 1.05
PARAMETER top_k 20

TEMPLATE """{{ if and .First .System }}<|im_start|>system
{{ .System }}<|im_end|>
{{ end }}<|im_start|>user
{{ .Prompt }}<|im_end|>
<|im_start|>assistant
{{ .Response }}"""

# set the system message
SYSTEM """
You are a helpful assistant.
"""
```

然后通过运行下列命令来创建一个 Ollama 模型

```bash
ollama create qwen2_7b -f Modelfile
```

接下来，我们就可以运行自己的 Ollama 模型了：

```bash
ollama run qwen2_7b
```
