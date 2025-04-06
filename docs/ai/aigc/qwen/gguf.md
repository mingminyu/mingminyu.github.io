# GGUF

最近，在社区中本地运行 LLM 变得越来越流行，其中使用 llama.cpp 处理 GGUF 文件是一个典型的例子。通过 llama.cpp，您不仅可以为自己的模型构建 GGUF 文件，还可以进行低比特量化操作。在 GGUF 格式下，您可以直接对模型进行量化而无需校准过程，或者为了获得更好的量化效果应用 AWQ scale，亦或是结合校准数据使用 imatrix 工具。在这篇文档中，我们将展示最简便的模型量化方法，以及如何在对 Qwen 模型进行量化时应用 AWQ 比例以优化其质量。

## 1. 生成量化的 GGUF 模型文件

在进行量化操作之前，请确保你已经按照指导开始使用 llama.cpp。以下指引将不会提供有关安装和构建的步骤。现在，假设你要对 Qwen2-7B-Instruct 模型进行量化，首先需要按照如下所示的方式为 fp16 模型创建一个 GGUF 文件：

```bash linenums="1"
python convert-hf-to-gguf.py Qwen/Qwen2-7B-Instruct \  # (1)!
    --outfile models/7B/qwen2-7b-instruct-fp16.gguf  # (2)!
```

  1. 预训练模型所在的路径或者 HF 模型的名称
  2. 所生成的 GGUF 文件的路径

通过这种方式，你已经为你的 fp16 模型生成了一个 GGUF 文件，接下来你需要根据实际需求将其量化至低比特位。

```bash
./llama-quantize models/7B/qwen2-7b-instruct-fp16.gguf models/7B/qwen2-7b-instruct-q4_0.gguf q4_0
```

执行完成后，我们就将将模型量化为 4 比特的 GGUF 文件，其中 `q4_0` 表示 4 比特量化。现在，这个量化后的模型可以直接通过 llama.cpp 运行。

## 2. 使用 AWQ scales 量化模型

要提升量化模型的质量，一种可能的解决方案是应用 AWQ scales，可以参考[该脚本](https://github.com/casper-hansen/AutoAWQ/blob/main/docs/examples.md)。

具体操作步骤如下：首先在使用 AutoAWQ 运行 `model.quantize()` 时，请务必记得添加 `export_compatible=True` 参数，如下所示：

```python linenums="1" hl_lines="4"
model.quantize(
    tokenizer,
    quant_config=quant_config,
    export_compatible=True
)
model.save_pretrained(quant_path)
```

通过 `model.save_quantized()` 方法保存 AWQ scales 的 FP16 模型。然后，当你运行 convert-hf-to-gguf.py 脚本时，记得将模型路径替换为带有 AWQ scales 的 FP16 模型的路径。

```bash linenum="1"
python convert-hf-to-gguf.py ${quant_path} \
  --outfile models/7B/qwen2-7b-instruct-fp16-awq.gguf
```

通过这种方式，您可以在 GGUF 格式的量化模型中应用 AWQ scales，这有助于提升模型的质量。

我们通常可以将 FP16 模型量化为2、3、4、5、6、8 位模型。要执行不同低比特的量化，只需在命令中替换量化方法即可。例如，如果你想将你的模型量化为 2 位模型，你可以按照下面所示，将 `q4_0` 替换为 `q2_k`。

```bash linenums="1"
./llama-quantize models/7B/qwen2-7b-instruct-fp16.gguf models/7B/qwen2-7b-instruct-q2_k.gguf q2_k
```

目前支持的量化级别 GGUF 模型：`q2_k`、`q3_k_m`、`q4_0`、`q4_k_m`、`q5_0`、`q5_k_m`、 `q6_k` 和 `q8_0`。
