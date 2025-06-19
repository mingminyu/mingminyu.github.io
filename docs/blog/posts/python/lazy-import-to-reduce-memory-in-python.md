---
date: 2025-06-19
authors:
  - mingminyu
categories:
  - 后端开发
tags:
  - Python惰性导入
slug: lazy-import-to-reduce-memory
readtime: 2
---

# 通过惰性导入减少内存使用

在 Python 中即时导入库可能占用内存比较多，我们可以使用惰性导入（Lazy Import）实现模块的按需加载，从而大幅减少初始内存的占用，降低启动时间。本片文章我们介绍下如何通过自定义类实现按需加载，并结合 `psutil` 演示内存使用对比，解析延迟导入在大型项目中的应用场景，同时揭露其代码提示缺失、性能延迟等潜在缺陷。掌握这种技术可精准控制模块加载时机，优化资源分配，适合追求极致性能的开发者解锁高级编程技巧！

<!-- more -->

!!! warning "注意"

    如果你尝试在 Jupyter Notebook 中运行这段代码，可能会看不到演示的效果，原因在于 Jupyter Notebook 采用内核机制，一旦模块被导入（`import`）后就会常驻内存，即 `numpy = LazyImport("numpy")` 此表达语句就已经被加载到内存里了，而不是在首次使用才会加载，且内核结束前都不会被释放。

=== "示例代码"

    ```python linenums="1" hl_lines="24"
    import os
    import importlib
    from typing import Any
    from psutil import Process

    def get_memory_usage() -> float:
        process: Process = Process(os.getpid())
        megabytes: float = process.memory_info().rss / 1024.0 ** 2
        return round(megabytes, 2)


    class LazyImport:
        def __init__(self, module_name: str) -> None:
            self.module_name: str = module_name
            self._module: Any = None

        def __getattr__(self, attr: str) -> Any:
            if self._module is None:
                self._module = importlib.import_module(self.module_name)
            
            return getattr(self._module, attr)

    def main():
        numpy: Any = LazyImport("numpy")
        
        while True:
            user_input: str = input("You: ")

            if user_input.lower() == 'exit':
                break
            
            messages: list[str] = user_input.split()

            if 'pi' in messages:
                message = f'Bot: {numpy.pi}'
            else:
                message = f'Bot: {user_input}'
            
            print(f'{message} (Memory usage: {get_memory_usage()} MB)')

    if __name__ == "__main__":
        main()
    ```

=== "输出结果"

    ```bash linenums="1" hl_lines="6"
    You: hi
    Bot: hi (Memory usage: 14.94 MB)
    You: hello
    Bot: hello (Memory usage: 14.94 MB)
    You: pi
    Bot: 3.141592653589793 (Memory usage: 27.21 MB)
    You: hi
    Bot: hi (Memory usage: 27.21 MB)
    You: exit
    ```
