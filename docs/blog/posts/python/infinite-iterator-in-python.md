---
date: 2025-06-18
authors:
  - mingminyu
categories:
  - 后端开发
tags:
  - Python迭代器
slug: infinite-iterator-in-python
readtime: 5
---

# itertools三大无限循环迭代器：count、repeat、cycle

日常工作我们会用迭代器来提高一些遍历的效率，最常用的就是 `range` 函数，但是 `range` 函数的参数必须是整数，且需要设置上限。但是，如果数据量非常大，那么 `range` 函数也会消耗大量内存，并且执行效率非常低。本篇文将介绍 `itertools` 库的三大无限循环迭代器：`count`、`repeat`、`cycle`，帮助你提高程序执行效率。

<!-- more -->

## 1. count

`count` 函数创建一个无限循环迭代器，每次迭代都会返回一个数字，默认从 0 开始，可以通过参数设置起始值以及步长（支持正负以及小数）。你完全可以把它当作 `range` 使用，而不需要设置上限。

```python linenums="1"
from itertools import count

cnt1: count = count()
cnt2: count = count(10)
cnt3: count = count(10, 2)

print(next(cnt1))  # 0
print(next(cnt1))  # 1
print(next(cnt2))  # 10
print(next(cnt2))  # 11
print(next(cnt3))  # 12
print(next(cnt3))  # 14
```

## 2. repeat

如果你需要循环打印一个对象，那么使用 `repeat` 函数将非常适合，且它的执行效率比 `range` 快 50%。

```python linenums="1"
from itertools import repeat

name: repeat = repeat('Mike')
print(next(name))  # Mike
print(next(name))  # Mike
print(next(name))  # Mike
```

此外，`repeat` 函数的参数可以设置重复的次数，默认为无限循环。

```python linenums="1"
from itertools import repeat

name: repeat = repeat('Mike', 2)
print(next(name))  # Mike
print(next(name))  # Mike
print(next(name))  # 报错
```

接下来，我们测试一下 `repeat` 和 `range` 的执行效率。

```python linenums="1" hl_lines="18" title="repeat vs. range"
import timeit
from itertools import repeat

def itertools_repeat() -> None:
    for _ in repeat(None, 1_000_000):
        pass

def for_range() -> None:
    for _ in range(1_000_000):
        pass

def while_count() -> None:
    count: int = 0
    while count < 1_000_000:
        count += 1
        pass

repeat_time: float = timeit.timeit(itertools_repeat, number=100)
range_time: float = timeit.timeit(for_range, number=100)
while_time: float = timeit.timeit(while_count, number=100)
print(f"repeat time: {repeat_time:.4f}s")  # 0.9647s
print(f"range time: {range_time:.4f}s")  # 2.1447s
print(f"while time: {while_time:.4f}s")  # 3.6157s
```

为什么 `repeat` 函数会快这么多呢，本质上时因为 `range` 函数要构造 `int` 对象，而 `while_count` 更是要构造 `int` 对象以及进行运算。

## 3. cycle

通过 `cycle` 函数，可以创建一个无限循环迭代器，每次迭代都会返回列表中的元素，这在不定长元素进行分组非常有用。

```python linenums="1"
from itertools import cycle

peoples: list[str] = ['Mike', 'Tom', 'Jerry']
cycle_peoples = cycle(peoples)

print(next(cycle_peoples))  # Mike
print(next(cycle_peoples))  # Tom
print(next(cycle_peoples))  # Jerry
print(next(cycle_peoples))  # Mike
print(next(cycle_peoples))  # Tom
print(next(cycle_peoples))  # Jerry
```

