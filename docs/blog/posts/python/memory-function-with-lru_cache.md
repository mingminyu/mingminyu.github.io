---
date: 2025-06-17
authors:
  - mingminyu
categories:
  - 后端开发
tags:
  - Python装时器
  - 缓存函数
slug: memory-function-with-lru_cache
readtime: 7
---

# 提升代码执行速度：使用lru_cache缓存函数避免重复计算

函数执行速度慢时，可以使用 `lru_cache` 缓存函数结果，避免重复计算，可极大地加快程序执行的速度。

## 1. 示例

以下函数用于统计元音字母的个数：

```python linenums="1" title="示例代码"
from tools import measure  # 自定义计时器函数

def count_vowels(sentence: str) -> int:
    return sum(sentence.count(vowel) for vowel in 'aeiouAEIOU')

@measure
def main():
    sentences = [
        'hello world',
        'this is a test sentence',
        'python is awesome',
    ]
    for sentence in sentences:
        for i in range(1_000_000):
            count_vowels(sentence)


if __name__ == '__main__':
    main()
```

接下来，我们使用 `lru_cache` 缓存函数 `count_vowels`，这极大加快执行速度。

```python linenums="1" title="缓存函数" hl_lines="2"
from functools import lru_cache
from tools import measure  # (1)!

@lru_cache(maxsize=128, typed=False)
def count_vowels(sentence: str) -> int:
    return sum(sentence.count(vowel) for vowel in 'aeiouAEIOU')


@measure
def main() -> None:
    sentences: list[str] = [
        'hello world',
        'this is a test sentence',
        'python is awesome',
    ]
    for sentence in sentences:
        for i in range(1_000_000):
            count_vowels(sentence)


if __name__ == '__main__':
    main()
    print(count_vowels.cache_info())
```

1.  `tools.measure` 是一个装饰器，用于测量函数执行时间。

## 2. 斐波那契缓存调用

使用 `lru_cache` 斐波那契数列的递归实现，你会发现连续调用时函数非常执行快到难以置信：

```python linenums="1" hl_lines="3" title="斐波那契数列的递归实现"
from functools import lru_cache

@lru_cache(maxsize=None)
def fib(n: int) -> int:
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)

if __name__ == '__main__':
    fib(35)
    print(count_vowels.cache_info())
```
