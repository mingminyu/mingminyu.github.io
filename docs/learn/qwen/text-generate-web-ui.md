# Text Generate Web UI

Text Generation Web UI （简称TGW）是一款流行的文本生成 Web 界面工具，类似于 AUTOMATIC1111/stable-diffusion-webui 。它拥有多个交互界面，并支持多种模型后端，包括 Transformers、llama.cpp（通过 llama-cpp-python 实现）、ExLlamaV2 、AutoGPTQ 、AutoAWQ 、GPTQ-for-LLaMa 、CTransformers 以及 QuIP# 。在本节中，我们将介绍如何在本地环境中使用 TGW 运行 Qwen2。

!!! tip "建议您使用其他 WEB UI"

    TGW 的 WEB 界面还是比较简陋的，如果你熟悉 Streamlit，建议您自己编写一个颜值更高的 UI 界面。

最简单的运行 TGW 的方法是使用[仓库](https://github.com/oobabooga/text-generation-webui) 中提供的 Shell 脚本。

```bash
git clone https://github.com/oobabooga/text-generation-webui
cd text-generation-webui
```

你可以根据你的操作系统直接运行相应的脚本:

???+ "不同系统运行脚本"
    === "Windows"

        ```bash
        ./start_windows.bat
        ```
    
    === "Linux"

        ```bash
        ./start_linunx.sh
        ```

    === "MacOS"

        ```bash
        ./start_macos.sh
        ```

另外，你也可以选择手动在conda环境中安装所需的依赖项，这里以 MacOS 系统（Apple Silicon）为例进行实践操作。

```bash linenums="1"
conda create -n textgen python=3.11
conda activate textgen
pip install torch torchvision torchaudio
pip install -r requirements_apple_silicon.txt
```

对于 requirements 中的 `bitsandbytes` 和 `llama-cpp-python`，我们建议您直接通过 `pip` 进行安装。但是，暂时请不要使用GGUF，因为其与 TGW 配合时的性能表现不佳。在完成所需包的安装之后，您需要准备模型，将模型文件或目录放在 ./models 文件夹中。例如，您应按照以下方式将 Qwen2-7B-Instruct 模型放置到相应位置。

```bash title="存放位置"
text-generation-webui
├── models
│   ├── Qwen2-7B-Instruct
│   │   ├── config.json
│   │   ├── generation_config.json
│   │   ├── model-00001-of-00004.safetensor
│   │   ├── model-00002-of-00004.safetensor
│   │   ├── model-00003-of-00004.safetensor
│   │   ├── model-00004-of-00004.safetensor
│   │   ├── model.safetensor.index.json
│   │   ├── merges.txt
│   │   ├── tokenizer_config.json
│   │   └── vocab.json
```

接下来，通过运行 `python server.py` 来启动网页服务，并访问 http://localhost:7860 来与 Qwen2 进行交互。
