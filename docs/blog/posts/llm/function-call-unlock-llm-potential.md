---
date: 2025-06-16
authors:
  - mingminyu
categories:
  - 大模型
tags:
  - 转载
  - RAG
slug: function-call-unlock-llm-potential
readtime: 10
---

# Function Calling(函数调用)：解锁大语言模型的潜力

> 原文地址：https://mp.weixin.qq.com/s/TJlVCkMhGThjRZEoId-bXg

![](https://mingminyu.github.io/webassets/images/20250621/01.png)

**函数调用**（function calling）是一种机制，允许大语言模型（LLM）通过调用外部函数或 API 执行特定的、预定义的任务。可以将其视为一种功能，让 LLM 将它无法独立完成的工作“委托”出去。

例如，假设您向 LLM 发送以下提示：“特斯拉当前的股价是多少？”

没有函数调用的基本 LLM 可能会根据其训练数据中的模式“幻觉”出一个答案，例如“可能在 200 美元左右”。经过 RLHF 优化的模型可能会更诚实地说：“我没有实时数据，所以无法告诉你。”

<!-- more -->

让我们用 Qwen2.5-0.5B-Instruct 快速尝试一下：

```python linenums="1"

from transformers import AutoTokenizer, AutoModelForCausalLM

model_name = "Qwen/Qwen2.5-0.5B-Instruct"
model = AutoModelForCausalLM.from_pretrained(model_name)
tokenizer = AutoTokenizer.from_pretrained(model_name)

prompt = "特斯拉当前的股价是多少？"
inputs = tokenizer(prompt, return_tensors="pt")
outputs = model.generate(**inputs, max_new_tokens=30, do_sample=True)
print(tokenizer.decode(outputs[0]))
```

输出：

```bash
问：特斯拉当前的股价是多少？
答：抱歉，作为一个 AI 语言模型，我无法访问实时金融数据。特斯拉的股价可能会快速变化。
```

正如预期，Qwen 表示它不知道，这与任何优秀的指令模型一致。但通过函数调用，LLM 可以识别对实时股价数据的需求，触发对金融服务的 API 调用，然后生成类似“截至此刻，特斯拉的股价为 279.24 美元”的回答。显然，函数调用是释放 LLM 全部潜力的关键功能，了解如何使用它至关重要。

现在，像 OpenAI GPT-4 这样的专有模型通过 OpenAI API 原生支持函数调用。它们使用起来更简单，因为一切都在 OpenAI 生态系统中处理。Mistral AI 的许多模型（如 Mistral Small 或 Mistral Nemo）也是如此，这些模型是开源的，但也通过 API 提供。

让我展示一个使用最新 Mistral Small 的函数调用示例。您需要一个 Mistral API 密钥来运行此示例。顺便说一句，Mistral 的模型被严重低估。只要用几次，你就会发现它们有多优秀。

首先，安装 Mistral AI 的 Python 客户端：

```bash
pip install mistralai
```

接下来，我们需要一个 LLM 可以调用的函数。我将使用 Flask 将该函数作为 REST 端点提供，该函数仅列出本地文件系统中指定目录的所有文件。

```python linenums="1" title="main.py"
import os
from flask import Flask, request

app = Flask(__name__)

@app.route('/files')
def list_files():
    directory = request.args.get('directory', '.')
    files =([
      {'name': f} for f in os.listdir(directory)
      if os.path.isfile(os.path.join(directory, f))
    ])
    return files

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
```


您可以使用 `curl` 从命令行测试此端点，或者使用您喜欢的浏览器。

```bash
curl "http://localhost:8000/files?directory=/tmp"
```

输出：

```bash
[{"name": "api.py"}]
```

现在，我们需要告诉 LLM 这个函数存在，并且在适当的时候使用它。因为我们仍在使用 Mistral LLM（目前是 mistral-small-2503），这相当简单。您只需以 LLM 能理解的格式描述该函数。对于大多数 LLM，格式如下：

```python linenums="1"
available_functions = [
  {
    "type":"function",
    "function": {
      "name": "files",
      "description": "列出目录中的文件",
      "parameters": {
        "type":"object",
        "properties": {
          "directory": {
            "type": "string",
            "description": "目录的绝对路径"
          },
        },
        "required": ["directory"]
      }
    }
  }
]
```

当然，函数描述越详细、信息量越大，效果越好。此时，您只需将 `available_functions` 数组与提示一起传递给客户端。

```python linenums="1"
from mistralai import Mistral


api_key = "..."
model = "mistral-small-2503"
mistral = Mistral(api_key)
response = mistral.chat.complete(
    model=model,
    messages=[
      {
        "role": "user",
        "content": "列出 /tmp 目录中的所有文件。"
      }
    ],
    tools=available_functions,
    tool_choice="any"
)
print(response.choices[0].message.tool_calls[0])
```

输出：

```bash
function=FunctionCall(
  name='files',
  arguments='{"directory": "/tmp"}'
)
id='12bc4' type=None index=0
```

如您所见，Mistral Small 成功根据给定的提示推断出需要调用 `files` 函数，并使用参数 `/tmp`。不过，它不会自己调用函数。这是我们需要做的事情。因此，我们检查 `tool_calls` 数组，如果它不为空，我们就运行 Mistral 希望我们运行的函数。

在我们的例子中，因为我们有一个 REST 端点，我们可以使用 `requests` 库进行 GET 请求。

```python linenums="1"
import json
import requests

if response.choices[0].message.tool_calls:
    tool_call = response.choices[0].message.tool_calls[0]
  
if tool_call.function.name =="files":
    args = json.loads(tool_call.function.arguments)
    output = requests.get("http://localhost:8000/files?directory=" + args['directory']).json()
  
print(output)
```

输出：

```bash
[{'name':'qq1.html'}]
```

请注意，参数目前是以字符串形式到达，我们需要先将其转换为 JSON。这就是代码中包含 `json.loads()` 的原因。还值得注意的是，LLM 在这里没有生成文本。输出到标准输出（stdout）应该是您的函数。很好，现在我们知道如何使用通过 API 访问的 LLM 进行函数调用。

在本文的其余部分，我们将使用可以本地运行的开源模型。许多这些模型支持函数调用，但使用该功能需要额外步骤。您会发现，这些模型照常生成 token，作为开发者的您需要解析、解释并使用这些 token 来触发函数。

让我们看看是否可以直接将 `available_functions` 数组传递给 Llama3.2–1B-Instruct 以使其调用我们的函数。

我们首先加载模型：

```python linenums="1"
from transformers import AutoTokenizer,AutoModelForCausalLM

model_name = "meta-llama/Llama-3.2-1B-Instruct"
model = AutoModelForCausalLM.from_pretrained(model_name)
tokenizer = AutoTokenizer.from_pretrained(model_name)
```

接下来，我们需要将提示包装在聊天模板中，而不是直接传递给模型。聊天模板应包含 `available_functions` 数组，以指定模型可以使用的工具。

```python linenums="1"
messages =[
  {"role": "system", "content": "你是一个有用的助手。"},
  {"role": "user", "content": "/tmp 目录中有哪些文件？"},
]
template= tokenizer.apply_chat_template(
    messages, 
    tools=available_functions,
    tokenize=False
)
```

最后，我们对模板进行 token 化，并将其作为输入传递给模型。

```python linenums="1"
inputs = tokenizer(template, return_tensors="pt")
outputs = model.generate(**inputs, max_new_tokens=30, do_sample=True)
print(tokenizer.decode(outputs[0]))
```

输出：

```bash
...
...
<|python_tag|>
{"type":"function","function":"files",
"parameters":{"directory":"/tmp"}}
<|eom_id|>
```

看起来 Llama3.2 也成功识别了函数调用。这很好！但函数调用目前只是一个（JSON 格式的）字符串，被 `<|python_tag|>` 和 `<|eom_id|>` 包裹。`eom_id` 只是一个特殊的消息结束 token。提取模型输出的函数调用有很多方法。我将保持简单，使用正则表达式。

```python linenums="1"

import json
import re

generated_text = tokenizer.decode(outputs[0])
matched = re.search(
    r"<\|python_tag\|>(.*?)<\|eom_id\|>",
    generated_text, 
    re.DOTALL
)
function_call = json.loads(matched.group(1).strip())
print(function_call)
```

输出：

```bash
{
  'type': 'function',
  'function': 'files',
  'parameters': {'directory': '/tmp'}
}
```

如果从 Llama 切换到 Qwen，变化不大。但 Qwen 使用一组不同的 token 来包裹函数调用。以下是 Qwen 的输出：

```bash linenums="1"
<|im_start|>assistant
<tool_call>
{"name":"files","arguments":{"directory":"/tmp"}}
</tool_call><|im_end|>
```

因此，您的正则表达式需要稍作调整以处理这种新格式。
