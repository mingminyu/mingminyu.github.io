# CONDA 虚拟环境管理


```bash
channels:
  - defaults
show_channel_urls: true
default_channels:
  - https://mirrors.tuna.tsinghua.edu.cn/anaconda/pkgs/main
  - https://mirrors.tuna.tsinghua.edu.cn/anaconda/pkgs/r
  - https://mirrors.tuna.tsinghua.edu.cn/anaconda/pkgs/msys2
custom_channels:
  conda-forge: https://mirrors.tuna.tsinghua.edu.cn/anaconda/cloud
  msys2: https://mirrors.tuna.tsinghua.edu.cn/anaconda/cloud
  bioconda: https://mirrors.tuna.tsinghua.edu.cn/anaconda/cloud
  menpo: https://mirrors.tuna.tsinghua.edu.cn/anaconda/cloud
  pytorch: https://mirrors.tuna.tsinghua.edu.cn/anaconda/cloud
  simpleitk: https://mirrors.tuna.tsinghua.edu.cn/anaconda/cloud
```

对于 Windows 用户而言，默认是找不到 CONDA 的配置文件的(由于系统的限制，我们也不能直接创建以 . 开头的文件)，我们可以通过如下命令直接和配置清华镜像源，执行完我们就可以在用户根目录下找到 .condarc 文件了:

```bash
conda config --add channels https://mirrors.tuna.tsinghua.edu.cn/anaconda/pkgs/free/
conda config --add channels https://mirrors.tuna.tsinghua.edu.cn/anaconda/pkgs/main/
conda config --set show_channel_urls yes
```

如果执行 `conda` 安装命令时，出现 “certificate verify failed: certificate is not ...” 错误，执行以下命令关闭 SSL 验证。

```bash
conda config --set ssl_verify false 
```



## 10. 自动创建环境

```bash
conda create --prefix ./venv python==3.10.12
conda activate ./venv
```

```bash
pip install torch torchaudio funasr modelscope
conda install ffmpeg
```

导出

```bash
conda env export --prefix ./venv > environment.yml
```

安装:

```bash
conda env create --prefix ./venv --file environment.yml
conda activate .venv
```

