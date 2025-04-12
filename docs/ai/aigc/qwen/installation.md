# 安装

使用 Qwen2 需要安装 HuggingFace 的 `transformers` 库（建议使用最新版本，至少是 4.40.0 版本以上），安装完成之后就可以使用 Qwen2 集合中的模型了。

!!! note "Transformers 的三种安装方式"

    === "PIP"
        
        ```bash
        pip install transformers -U
        ```

    === "CONDA"

        ```bash
        conda install conda-forge::transformers
        ```

    === "源码安装"

        ```bash
        pip install git+https://github.com/huggingface/transformers
        ```

建议创建新的虚拟环境，再通过 pip 或 conda 进行安装。此外，建议使用 Python **3.8** 和 Pytorch **2.0** 以上版本。

!!! warning ""

    这里只是安装了 `transformers` 库，实际上使用 Qwen 还需要安装更多依赖库。
