# Python元组和集合

## 1. 元组-tuple

Python 的元组与列表类似，不同之处在于元组的元素不能修改。列表使用方括号 `[]`，元组使用小括号 `()`。创建元组只需要在括号中添加元素，并使用逗号隔开即可。

```python linenums="1" hl_lines="2"
a = (2)
b = (2,)
print(a)  # 输出 2
print(b)  # 输出 (2,)
```

当元组中只有一个元素时，必须在该元素后面加上都好 `,`，否则则是 `int` 类型。

### 1.1 创建元组

```python linenums="1"
tup = (1, 2, 3)
print(type(tup))  # <class 'tuple'>
```

### 1.2 元组的操作

- 元组的元素访问方式：与列表一样，可以通过索引来访问元素。

```python linenums="1"
tup = (1, 2, 3, 2, 4, 5)
print(tup[0])
print(tup[-1])
print(tup[1:])
print(tup[:-1])
print(tup[::2])
print(tup[::-1])  # 元组反转
```

- 元组的元素修改：元组中的元素 **不能修改和删除**，但可以通过切片操作来修改元素。如果确实要修改，需要先将其转换成列表，修改后再使用 `tuple` 函数将其转换回元组。

```python linenums="1" hl_lines="4"
tup1 = (1, 2, 3)
lst1 = list(tup1)
lst1[0] = 0
tup1 = tuple(lst1)
print(tup1)  # 输出：(0, 2, 3)
```

- 查看元素是否存在：使用 `in` 运算符来判断元素是否存在于集合中。

```python linenums="1"
tup = (1, 2, 3)
print(1 in tup)  # 输出：True
```

- 元组的长度：使用 `len()` 函数来获取元组的长度。

```python linenums="1"
tup = (1, 2, 3)
print(len(tup))
```

- 元组的拼接：使用 `+` 运算符来拼接两个元组。

```python linenums="1"
tup1 = (1, 2, 3)
tup2 = (4, 5, 6)
tup3 = tup1 + tup2
print(tup3)  # 输出：(1, 2, 3, 4, 5, 6)
```

- 元组的复制：使用 `*` 运算符来复制元组。

```python linenums="1"
tup = (1, 2, 3)
tup2 = tup * 3
print(tup2)  # 输出：(1, 2, 3, 1, 2, 3, 1, 2, 3)
```

元组的自带方法就 2 个，即 `index` 和 `count` 。

### 1.3 扩展：collections.namedtuple

> 更多 namedtuple 的用法，请查看文档 [一个被低估的Python数据结构Namedtuple](https://segmentfault.com/a/1190000037514765)

NamedTuple 是 Python 中的一种增强型元组，它不仅具备普通 tuple 的不可变性和索引访问特性，还支持字段命名，极大地提高了代码的可读性和可维护性。

相比直接使用 tuple 进行类型注解，NamedTuple 让字段有了明确的名称，使代码更清晰，同时还能被静态类型检查工具（如 mypy）验证，减少潜在的错误。如果你的数据结构是只读的、固定格式的，NamedTuple 是比 tuple 更优雅的选择，让你的 Python 代码更直观、易懂且安全！

```python linenums="1" title="namedtuple示例"
from collections import namedtuple

Point = namedtuple('Point', ['x', 'y'])
p = Point(1, 2)
print(f"{p.x = }")  # 输出：p.x = 1
print(f"{p.y = }")  # 输出：p.y = 2

print(p[0])  # 输出：1
print(p[1])  # 输出：2

# 添加类型注解
class DataRecord(NamedTuple):
    name: str
    count: int
    score: float
    metadata: dict
```

与普通元组相比，NamedTuple 具有以下优点：

- 可读性更强：通过字段名称访问数据，而不是依赖索引。
- 不可变性：NamedTuple 的字段值一旦赋值，就不能修改，类似于普通元组。
- 兼具元组和字典的特点：既可以像元组一样进行索引访问 (p[0])，也可以像字典一样使用字段名 (p.x)。
- 节省内存：相比字典，NamedTuple 使用 __slots__ 机制，避免了额外的存储开销。

!!! note "NamedTuple vs. DataClass"

    `namedtuple` 和 `dataclass` 都能用来存储结构化数据，但它们的设计目标不同，适用于不同的场景。

    使用 namedtuple：如果你的数据 **不可变**，希望它 高效、占用更少内存，并且像元组一样轻量。
    
    使用 dataclass：如果你需要 **可变数据**、丰富的功能、更符合面向对象设计，或者你的数据对象可能会增加额外逻辑。

## 2. 集合-set

集合是不重复元素的序列，它典型的特性是无序和无索引。

### 2.1 创建集合

可以直接使用花括号 `{}` 创建集合，也可以使用关键字 `set()` 创建集合。

```python linenums="1"
s1 = {1, 2, 3}
print(type(s1))  # <class 'set'>

s2 = set([1, 2, 3])
print(type(s2))  # <class 'set'>
```

### 2.2 集合的操作

- 访问元素：集合因为无序特性，所以不能通过索引来访问元素。一种方式是转成列表，另外一种则是用 `for` 循环。

- 添加元素：使用 `add()` 方法来添加元素。

```python linenums="1"
s = {1, 2, 3}
s.add(4)
print(s)  # 输出：{1, 2, 3, 4}
```

- 删除元素：使用 `remove()` 、`pop`、`discard` 以及 `clear`  方法来删除元素。

```python linenums="1"
s = {1, 2, 3}
s.remove(1)
print(s)  # 输出：{2, 3}

s.pop()  # 2
print(s) # 输出：{3}
```

### 2.3 集合的方法

| 方法 | 描述 |
| --- | --- |
| `add()` | 添加元素 |
| `remove()`<br/>`pop()`<br/>`discard()`<br/>`clear` | `remove` - 删除指定元素；<br/>`pop`- 除并返回集合中的第一个元素；<br/>`discard` - 删除指定元素，如果元素不存在则不执行任何操作；<br/>`clear` - 删除集合中的所有元素 |
| `copy()` | 返回集合的浅拷贝 |
| `difference()`<br>`difference_update()` | `difference` - 返回两个集合的差集；<br/>`difference_update` - 删除集合中的元素，该元素在指定的集合中存在 |
| `intersection()`<br/>`intersection_update()` | `intersection` - 返回两个集合的交集；<br/>`intersection_update` - 保留两个集合的交集 |
| `isdisjoint()` | 返回两个集合是否没有元素相同 |
| `issubset()`、`issuperset()` | 判断一个集合是否为另一个集合的子集（父集） |

=== "remove / pop / discard / clear"

    ```python linenums="1"
    s = {1, 2, 3, 4, 5}
    # remove：删除指定元素
    s.remove(1)
    print(s)  # 输出：{2, 3, 4, 5}

    # pop：除并返回集合中的第一个元素
    s.pop()   # 2
    print(s)  # 输出：{3, 4, 5}

    # discard：删除指定元素，如果元素不存在则不执行任何操作
    s.discard(3)
    print(s)  # 输出：{4, 5}
    s.discard(10)

    # clear：删除集合中的所有元素
    s.clear()
    print(s)  # 输出：set()
    ```

=== "difference / difference_update"

    - `difference`：返回两个集合的差集；
    - `difference_update`：删除集合中的元素，该元素在指定的集合中存在

    ```python linenums="1"
    s1 = {1, 2, 3, 4, 5}
    s2 = {4, 5, 6, 7, 8}
    print(s1.difference(s2))  # 输出：{1, 2, 3}
    print(s1)  # 输出：{1, 2, 3, 4, 5}

    s1.difference_update(s2)
    print(s1)  # 输出：{1, 2, 3}
    ```

=== "intersection / intersection_update"

    - `intersection`：返回两个集合的交集；
    - `intersection_update`：保留两个集合的交集

    ```python linenums="1"
    s1 = {1, 2, 3, 4, 5}
    s2 = {4, 5, 6, 7, 8}
    print(s1.intersection(s2))  # 输出：{4, 5}
    print(s1)  # 输出：{1, 2, 3, 4, 5}

    s1.intersection_update(s2)
    print(s1)  # 输出：{4, 5}
    ```

=== "issubset / issuperset"

    - `issubset`：判断一个集合是否为另一个集合的子集；
    - `issuperset`：判断一个集合是否为另一个集合的父集

    ```python linenums="1"
    s1 = {1, 2, 3, 4, 5}
    s2 = {4, 5, 6, 7, 8}
    s3 = {1, 2, 3}

    print(s1.issubset(s2)) # 输出：False
    print(s3.issubset(s1))  # 输出：True
    print(s1.issuperset(s3)) # 输出：True
    print(s2.issuperset(s1)) # 输出：False
    ```

=== "isdisjoint"

    `isdisjoint` 判断两个集合是否没有元素相同，没有相同元素输出 `True`，否则输出 `False`。

    ```python linenums="1"
    s1 = {1, 2, 3, 4, 5}
    s2 = {6, 7, 8, 9, 10}
    s3 = {1, 2, 3}

    print(s1.isdisjoint(s2))  # 输出：True
    print(s1.isdisjoint(s3))  # 输出：False
    ```

## 3. 元组和集合的区别

元组的和集合的区别是：

- 元组 `tuple` 是有序的，可通过索引来访问的，而集合 `set` 是无序的，无法通过索引来访问元素；
- 元组 `tuple` 中的元素是可以重复的，而集合 `set` 自带去重的功能，其元素是无法重复的；
- 元组 `tuple` 中的元素值是不可修改的（但可以进行切片操作），而集合 `set` 中的元素是可修改的，比如删除指定的元素。
