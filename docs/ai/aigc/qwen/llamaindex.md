# LlamaIndex

为了实现 Qwen2 与外部数据（例如文档、网页等）的连接，我们提供了 LlamaIndex 的详细教程。本指南旨在帮助用户利用 LlamaIndex 与 Qwen2 快速部署检索增强生成（RAG）技术。

## 1. 安装

为实现检索增强生成（RAG），我们建议您首先安装与 LlamaIndex 相关的软件包。

```bash linenums="1"
pip install llama-index
pip install llama-index-llms-huggingface
pip install llama-index-readers-web
```

## 2. 设置参数

现在，我们可以设置语言模型和向量模型。Qwen2-Instruct 支持包括英语和中文在内的多种语言对话。您可以使用 `bge-base-en-v1.5` 模型来检索英文文档，下载 `bge-base-zh-v1.5` 模型以检索中文文档。根据您的计算资源，您还可以选择`bge-large` 或 `bge-small` 作为向量模型，或调整上下文窗口大小或文本块大小。Qwen2模型系列支持最大 32K 上下文窗口大小（Qwen2-7B-Instruct 与Qwen2-72B-Instruct 可支持 128K 上下文，但需要额外配置）。

```python linenums="1"
import torch
from llama_index.core import Settings
from llama_index.core.node_parser import SentenceSplitter
from llama_index.llms.huggingface import HuggingFaceLLM
from llama_index.embeddings.huggingface import HuggingFaceEmbedding

# Set prompt template for generation (optional)
from llama_index.core import PromptTemplate

def completion_to_prompt(completion):
   return f"<|im_start|>system\n<|im_end|>\n<|im_start|>user\n{completion}<|im_end|>\n<|im_start|>assistant\n"

def messages_to_prompt(messages):
    prompt = ""
    for message in messages:
        if message.role == "system":
            prompt += f"<|im_start|>system\n{message.content}<|im_end|>\n"
        elif message.role == "user":
            prompt += f"<|im_start|>user\n{message.content}<|im_end|>\n"
        elif message.role == "assistant":
            prompt += f"<|im_start|>assistant\n{message.content}<|im_end|>\n"

    if not prompt.startswith("<|im_start|>system"):
        prompt = "<|im_start|>system\n" + prompt

    prompt = prompt + "<|im_start|>assistant\n"

    return prompt

# Set Qwen2 as the language model and set generation config
Settings.llm = HuggingFaceLLM(
    model_name="Qwen/Qwen2-7B-Instruct",
    tokenizer_name="Qwen/Qwen2-7B-Instruct",
    context_window=30000,
    max_new_tokens=2000,
    generate_kwargs={"temperature": 0.7, "top_k": 50, "top_p": 0.95},
    messages_to_prompt=messages_to_prompt,
    completion_to_prompt=completion_to_prompt,
    device_map="auto",
)

# Set embedding model
Settings.embed_model = HuggingFaceEmbedding(
    model_name = "BAAI/bge-base-en-v1.5"
)

# Set the size of the text chunk for retrieval
Settings.transformations = [SentenceSplitter(chunk_size=1024)]
```

## 2. 构建索引

以下代码片段展示了如何为本地名为 document 的文件夹中的文件（无论是 PDF 格式还是TXT 格式）构建索引。

```python linenums="1"
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader

documents = SimpleDirectoryReader("./document").load_data()
index = VectorStoreIndex.from_documents(
    documents,
    embed_model=Settings.embed_model,
    transformations=Settings.transformations
)
```

以下代码片段展示了如何为一系列网站的内容构建索引。

```python linenums="1"
from llama_index.readers.web import SimpleWebPageReader
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader

documents = SimpleWebPageReader(html_to_text=True).load_data(
    ["web_address_1","web_address_2",...]
)
index = VectorStoreIndex.from_documents(
    documents,
    embed_model=Settings.embed_model,
    transformations=Settings.transformations
)
```

要保存和加载已构建的索引，您可以使用以下代码示例。

```python linenums="1"
from llama_index.core import StorageContext, load_index_from_storage

# save index
storage_context = StorageContext.from_defaults(persist_dir="save")

# load index
index = load_index_from_storage(storage_context)
```

## 4. 检索增强

现在您可以输入查询，Qwen2 将基于索引文档的内容提供答案。

```python linenums="1"
query_engine = index.as_query_engine()
your_query = "<your query here>"
print(query_engine.query(your_query).response)
```