---
date: 2025-10-27
authors:
  - mingminyu
categories:
  - Pandas
readtime: 2
---

# 增强性能

在本教程的这一部分中，我们将研究如何 `DataFrame` 使用 Cython、Numba 和`pandas.eval()`。一般来说，使用 Cython 和 Numba 可以比使用 Cython 和 Numba 提供更大的加速，`pandas.eval()` 但需要更多代码。

!!! note ""

    除了遵循本教程中的步骤之外，强烈建议对增强性能感兴趣的用户安装 [推荐的 pandas 依赖项](https://pandas.pydata.org/docs/getting_started/install.html#install-recommended-dependencies)。默认情况下通常不会安装这些依赖项，但如果存在，将会提高速度。

<!-- more -->

## 1. Cython（为 Pandas 编写 C 扩展）

对于许多用例来说，用纯 Python 和 NumPy 编写 pandas 就足够了。然而，在一些计算量大的应用程序中，可以通过将工作卸载到 Cython 来实现相当大的加速。

本教程假设您已在 Python 中进行了尽可能多的重构，例如尝试删除 `for` 循环并使用 NumPy 矢量化。首先在 Python 中进行优化总是值得的。

本教程将介绍对慢速计算进行 Cython 化的“典型”过程。我们使用 Cython 文档中的示例 ，但在 Pandas 的上下文中。我们最终的 cythonized 解决方案比纯 Python 解决方案快大约 100 倍。

### 1.1 纯 Python

我们有一个 DataFrame 需要按行应用函数进行处理。

```python linenums="1"
import pandas as pd
import numpy as np

def f(x: float) -> float:
    return x * (x - 1)

def integrate_f(a: float, b: float, N: int) -> float:
    s = 0
    dx = (b - a) / N

    for i in range(N):
        s += f(a + i * dx)
    return s * dx


df = pd.DataFrame(
    {
        "a": np.random.randn(1000),
        "b": np.random.randn(1000),
        "N": np.random.randint(100, 1000, (1000)),
        "x": "x",
    }
)
```

我们通过使用 `DataFrame.apply()`（逐行）来实现我们的结果：

```python linenums="1" title="IPython"
%timeit df.apply(lambda x: integrate_f(x["a"], x["b"], x["N"]), axis=1)
74.9 ms +- 728 us per loop (mean +- std. dev. of 7 runs, 10 loops each)
```

让我们使用 prun ipython 魔术函数来看看这个操作期间花费的时间在哪里：

```python linenums="1" title="Linux下运行"
%prun -l 4 df.apply(lambda x: integrate_f(x["a"], x["b"], x["N"]), axis=1)
605956 function calls (605938 primitive calls) in 0.167 seconds
```

到目前为止，大部分时间都花在 `integrate_f`，f因此我们将集中精力对这两个函数进行 cython 化。

### 1.2 普通 Cython

首先，我们需要将 Cython 魔术函数导入 IPython：

```python linenums="1" title="无法编译"
%load_ext Cython

%%cython
def f_plain(x: float) -> float:
    return x * (x - 1)

def integrate_f_typed(a: float, b: float, N: int) -> float:
    s = 0
    dx = (b - a) / N

    for i in range(N):
        s += f_plain(a + i * dx)
    return s * dx

%timeit df.apply(lambda x: integrate_f_typed(x["a"], x["b"], x["N"]), axis=1)
46.6 ms +- 466 us per loop (mean +- std. dev. of 7 runs, 10 loops each)
```

与纯 Python 方法相比，这将性能提高了三分之一。

### 1.3 声明 C 类型

### 1.4 使用 ndarray

### 1.5 禁用编译器指令

## 2. Numba（JIT 编译）

### 2.1 Pandas Numba 引擎

### 2.2 自定义函数示例

### 2.3 注意事项

## 3. 进行表达式评估 eval

### 3.1 支持的语法

### 3.2 pandas.eval 解析器

### 3.3 eval性能比较

### 3.4 表达式求值限制 numexpr

