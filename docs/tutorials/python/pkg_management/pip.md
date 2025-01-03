# PIP 包管理器

## 1. 镜像源加速

学习 Python 的过程中，你一定遇到过使用 `pip` 安装包时下载速度贼慢，心态被搞得很爆炸。这是因为默认情况下，Python 安装第三方库所使用的安装源是 PyPI，这个网站是在美国的，所以没有梯子下载速度慢很正常。 要解决这个问题的方法也非常简单，**只需要将 PyPi 安装源更换为国内即可**。

国内比较好用的 PIP 镜像源主要有三个，个人比较推荐**豆瓣**镜像源:

- **豆瓣**: pypi.doubanio.com/simple
- **清华**: pypi.tuna.tsinghua.edu.cn/simple
- **阿里云**: mirrors.aliyun.com/pypi/simple

镜像源的使用通常有 3 种：

- 直接在命令行中指定镜像源：这个方式有一个弊端就是，以上面命令为例，只有 Pandas 的安装使用的是清华镜像源，但 Pandas 依赖包并不会使用该安装源进行安装。

```bash
pip install -i https://pypi.tuna.tsinghua.edu.cn/simple pandas
```

> 有些库安装时可能提示找不到对应的版本，这是因为国内镜像源没有同步这些库，比如 cn2an。通常这种情况，我们直接使用 pypi.org/simple 官方镜像源来安装。也有一些库，比如 `modelscope[audio]`，必须通过阿里云的镜像源进行安装。


- 通过 `pip config` 配置：配置后安装第三方库都会优先走所配置的镜像源

```bash
pip config set global.index-url https://mirrors.aliyun.com/pypi/simple/
pip config set global.trusted-host mirrors.aliyun.com 
```

- 在 pip 配置文件中设定镜像源: 对于 Linux/Mac 而言，PIP 配置文件路径为 ~/.pip/pip.conf；对于 Windows 系统而言，PIP 配置文件路径为 ~/pip/pip.ini，如果没有该文件，则手动进行创建。然后在文件中填入以下内容，更改默认安装镜像源。

```ini
[global]
index-url = https://pypi.doubanio.com/simple
timeout = 6000

[install]
trusted-host = pypi.doubanio.com
```

## 2. 设置代理

如果服务器对 PIP 镜像源做了代理设置，那么我们可以在名命令行中通过 `--proxy` 参数来设定代理:

```Bash
pip install pandas --proxy=https://pypi.ai.com/simple
```

当然，我们也可以在配置文件中直接添加此参数的代理 URL 值:

```ini
[global]
index-url = https://pypi.doubanio.com/simple
proxy=https://pypi.ai.com/simple
timeout = 6000

[install]
trusted-host = pypi.doubanio.com
```
