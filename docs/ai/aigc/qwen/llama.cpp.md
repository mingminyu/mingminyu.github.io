# llama.cpp

[llama.cpp](https://github.com/ggerganov/llama.cpp) 是一个 C++ 库，用于简化 LLM 推理的设置，它使得在本地机器上运行 Qwen 成为可能。该库是一个纯 C/C++ 实现，不依赖任何外部库，并且针对 x86 架构提供了 AVX、AVX2 和 AVX512 加速支持。

此外，它还提供了 2、3、4、5、6 以及 8 位量化功能，以加快推理速度并减少内存占用。对于大于总 VRAM 容量的大规模模型，该库还支持 CPU+GPU 混合推理模式进行部分加速。本质上，llama.cpp 的用途在于运行 GGUF（由 GPT 生成的统一格式）模型。

## 1. 准备

这一操作适用于 Linux 或者 MacOS 系统。

```bash linenums="1"
git clone https://github.com/ggerganov/llama.cpp
cd llama.cpp
make
```

## 2.运行 GGUF 文件

我们在 Hugging Face 组织中提供了一系列 GGUF 模型，为了找到您需要的模型，您可以搜索仓库名称中包含 `-GGUF` 的部分。要下载所需的 GGUF 模型，请使用 `huggingface-cli` （首先需要通过命令 `pip install huggingface_hub` 安装它）：

```bash linenums="1"
# huggingface-cli download <model_repo> <gguf_file> \
#   --local-dir <local_dir> \
#   --local-dir-use-symlinks False
huggingface-cli download Qwen/Qwen2-7B-Instruct-GGUF qwen2-7b-instruct-q5_k_m.gguf \
    --local-dir . --local-dir-use-symlinks False
```

然后你可以用如下命令运行模型（你可以使用 `./llama-cli -h` 获取更多超参数的解释）：

```bash linenums="1"
./llama-cli -m qwen2-7b-instruct-q5_k_m.gguf \
    -n 512 \  # (1)!
    -co -i -if -f prompts/chat-with-qwen.txt \
    --in-prefix "<|im_start|>user\n" \
    --in-suffix "<|im_end|>\n<|im_start|>assistant\n" \
    -ngl 80 -fa
```

  1. 生成的最大 token 数量

## 3. 生成 GGUF 文件


## 4. PPL 评测

llama.cpp 为我们提供了评估 GGUF 模型 PPL 性能的方法。为了实现这一点，你需要准备一个数据集，比如 “wiki测试”。

???+ "PPL 测试"

    === "下载数据集"

        ```bash linenums="1"
        wget https://s3.amazonaws.com/research.metamind.io/wikitext/wikitext-2-raw-v1.zip?ref=salesforce-research -O wikitext-2-raw-v1.zip
        unzip wikitext-2-raw-v1.zip
        ```
    
    === "运行测试"

        ```bash
        ./llama-perplexity -m <gguf_path> -f wiki.test.raw
        ```

    === "输出结果"

        ```bash
        perplexity : calculating perplexity over 655 chunks
        24.43 seconds per pass - ETA 4.45 hours
        [1]4.5970,[2]5.1807,[3]6.0382,...
        ```

## 5. LM Studio 中使用 GGUF

如果你仍然觉得使用 llama.cpp 有困难，我建议你尝试一下 LM Studio 这个平台，它允许你搜索和运行本地的大规模语言模型。目前 Qwen2 已经正式成为 LM Studio的一部分。
