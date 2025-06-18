---
date: 2025-06-18
authors:
  - mingminyu
categories:
  - 后端开发
tags:
  - Python装饰器
slug: wraps-decorator-keep-function-metadata
readtime: 5
---

# 使用@wraps保持函数元数据

通常使用装饰器封装函数时，函数的真实名称、文档字符串、参数注解等会丢失，而这些丢失的信息其实可以认作是函数身份证，本篇文章介绍如何使用 `@wraps` 保持函数的元数据。

<!-- more -->

## 1. 函数的元数据

```python linenums="1"
import time

def expensive_function() -> None:
    """This is a function that does something expensive."""
    time.sleep(2)
    print("I'm done!")

def main() -> None:
    expensive_function()
    prnt(expensive_function.__name__)
    print(expensive_function.__doc__)
    print(expensive_function.__annotations__)

main()
```

接下来，我们定一个装饰器 `get_time` 用于装饰 `expensive_function` 函数，并打印函数执行所花费的时间。在 `main` 函数中打印 `expensive_function` 函数的元数据，可以看到输出结果并不归属于函数 `expensive_function` 。

```python linenums="1" hl_lines="16 23-25"
import time
from typing import Callable, Any

def get_time(func: Callable) -> Callable:
    """Get the time of function execution."""
    def wrapper(*args, **kwargs) -> Any:
        """Wrapper function."""
        start_time: float = time.perf_counter()
        result: Any = func(*args, **kwargs)
        end_time: float = time.perf_counter()
        print(f"Function {func.__name__} took {end_time - start_time:.4f} seconds.")

        return result
    return wrapper

@get_time
def expensive_function() -> None:
    """This is a function that does something expensive."""
    time.sleep(2)
    print("I'm done!")

def main() -> None:
    print(expensive_function.__name__)  # wrapper 
    print(expensive_function.__doc__)  # Wrapper function.
    print(expensive_function.__annotations__)  # {'return': typing.Any}

    expensive_function()

main()
```

## 2. 使用@wraps保留函数元数据

`@wraps` 是 `functools` 库提供的一个装饰器，它可以将函数的元数据（如名称、文档字符串、参数注解等）保留在装饰后的函数中。

```python linenums="1" hl_lines="16 25-27"
import time
from typing import Callable, Any
from functools import wraps

def get_time(func: Callable) -> Callable:
    """Get the time of function execution."""
    @wraps(func)
    def wrapper(*args, **kwargs) -> Any:
        """Wrapper function."""
        start_time: float = time.perf_counter()
        result: Any = func(*args, **kwargs)
        end_time: float = time.perf_counter()
        print(f"Function {func.__name__} took {end_time - start_time:.4f} seconds.")

        return result
    return wrapper

@get_time
def expensive_function() -> None:
    """This is a function that does something expensive."""
    time.sleep(2)
    print("I'm done!")

def main() -> None:
    print(expensive_function.__name__)  # expensive_function 
    print(expensive_function.__doc__)  # This is a function that does something expensive.
    print(expensive_function.__annotations__)  # {'return': None}

    expensive_function()

main()
```
