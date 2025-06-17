---
date: 2025-06-17
authors:
  - mingminyu
categories:
  - 后端开发
tags:
  - Python上下文管理
  - Python装饰器
slug: context-manager-in-python
readtime: 5
---

# contextmanager装饰器轻松搞定Python上下文管理

使用 `contextlib.contextmanager` 装饰器，可以轻松地在 Python 中创建上下文管理器。

<!-- more -->

## 1. 文件IO管理器

```python linenums="1" title="示例代码"
from contextlib import contextmanager
from typing import Generator, IO, Any

@contextmanager
def file_manager(path: str, mode: str) -> Generator[IO, Any, None]:
    file: IO = open(path, mode)
    print(f"Opening file: {path}")

    try:
        yield file
    except Exception as e:
        print(f"Error occurred: {e}")
    finally:
        print(f"Closing file: {path}")
        if file:
            file.close()

with file_manager("example.txt", "w") as f:
    f.write("Hello, World!")

with file_manager("example.txt", "r") as f:
    f.write("Hello, World!")
```

## 2. 带上下文管理的计时器


```python linenums="1"
import time
from contextlib import contextmanager
from typing import Generator, IO, Any
from datetime import datetime

@contextmanager
def timer(name: str) -> Generator[None, Any, None]:
    start: float = time.perf_counter()
    print(f'Started at: {datetime.now():%H:%M:%S}')
    try:
        yield
    finally:
        print(f"{name} took {time.perf_counter() - start:.4f} seconds")
        print(f'Ended at: {datetime.now():%H:%M:%S}')

with timer("test"):
    text: str = ''
    for i in range(1000000):
        text += str(i)
```
