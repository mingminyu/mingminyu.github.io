---
date: 2025-06-17
authors:
  - mingminyu
categories:
  - 后端开发
tags:
  - Python装饰器
slug: total_ordering-decorator-in-fcuntools
readtime: 7
---

# 对象比较装饰器——@total_ordering

`@total_ordering` 是 Python 中一个有趣的功能，它可以自动生成对象比较的其他运算符，只需要实现其中一个比较方法即可。这个装饰器可以方便地实现对象的比较，但也有一些性能和复杂性的权衡。

<!-- more -->

因为创建类实例对象的内存地址不一样，通常无法使用 `==` 运算符进项比较。

```python linenums="1" title="示例代码"
from functools import total_ordering
from typing import Self

class Person:
    def __init__(self, name: str, age: int) -> None:
        self.name = name
        self.age = age
    
    def work(self) -> None:
        print(f'{self.name} is working...')
    
    def eat(self) -> None:
        print(f'{self.name} cannot eat right now, because they have to work...')

    def sleep(self) -> None:
        print(f'{self.name} is now sleeping, but dreams about working...')

def main() -> None:
    bob: Person = Person('Bob',35)
    luigi: Person = Person('Luigi', 40)
    bob2: Person = Person('Bob', 35)
    print(bob == luigi)  # False
    print(bob == bob2)  # False
```

## 1. 使用内置构造方法

使用 `__eq__`、`__ne__`、`__lt__`、`__gt__`、`__le__`、`__ge__` 等构造方法可实现两个对象的大小比较，比较麻烦的是，要实现两个对象的完整比较操作，需要将这些方法都实现一遍。

```python linenums="1" hl_lines="15-16" title="使用内置构造方法"
class Person:
    def __init__(self, name: str, age: int) -> None:
        self.name = name
        self.age = age
    
    def work(self) -> None:
        print(f'{self.name} is working...')
    
    def eat(self) -> None:
        print(f'{self.name} cannot eat right now, because they have to work...')

    def sleep(self) -> None:
        print(f'{self.name} is now sleeping, but dreams about working...')

    def __eq__(self, other: Self) -> bool:
        return self.__dict__ == other.__dict__

    def __ne__(self, other: Self) -> bool:
        return not self.__eq__(other)

    def __lt__(self, other: Self) -> bool:
        return (self.name.lower(), self.age) < (other.name.lower(), other.age)
    
    def __gt__(self, other: Self) -> bool:
        return not self.__lt__(other) and self != other

    def __le__(self, other: Self) -> bool:
        return self.__lt__(other) or self.__eq__(other)

    def __ge__(self, other: Self) -> bool:
        return self.__gt__(other) or self.__eq__(other)
```

## 2. 使用装饰器--@total_ordering

`@total_ordering` 是一个装饰器，它可以自动生成对象比较的其他运算符，只需要实现其中一个比较方法即可，例如你想实现  `A < B` 和 `B >= A`，那么只需要实现 `A < B` 就可以了，即实现 `__lt__`。

```python linenums="1" hl_lines="2" title="@total_ordering"
@total_ordering
class Person:
    def __init__(self, name: str, age: int) -> None:
        self.name = name
        self.age = age
    
    def work(self) -> None:
        print(f'{self.name} is working...')
    
    def eat(self) -> None:
        print(f'{self.name} cannot eat right now, because they have to work...')

    def sleep(self) -> None:
        print(f'{self.name} is now sleeping, but dreams about working...')
    
    def __eq__(self, other: Self) -> bool:
        return self.__dict__ == other.__dict__

    def __lt__(self, other: Self) -> bool:
        return (self.name.lower(), self.age) < (other.name.lower(), other.age)
```
