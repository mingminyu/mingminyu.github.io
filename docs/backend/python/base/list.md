# Python列表

列表（List）是 Python 中一种灵活且功能强大的数据结构，用于有序存储多个元素，它是最常用的数据类型之一，支持动态调整大小、嵌套结构以及丰富的操作方法。

## 1. 列表定义

使用方括号 `[]` 定义，元素之间用逗号分隔：

```python linenums="1"
empty_list = []                         # 空列表
numbers = [1, 2, 3, 4, 5]               # 数字列表
fruits = ['apple', 'banana', 'cherry']  # 字符串列表
mixed = [1, 'apple', True, 3.14]        # 混合类型列表
nested = [[1, 2], [3, 4], [5]]          # 嵌套列表
```

实际上，Python 中的列表元素可以是一切对象，包括其他列表、字典、函数、类等。

```python linenums="1" title="列表中函数调用" hl_lines="4"
def square(x: int) -> int:
    return x ** 2

lst = [1, square, 'apple']
print(lst[1](10))  # 输出：100
```

## 2. 列表的操作

### 2.1 列表的长度

列表的长度使用 `len()` 函数，返回列表的长度。

```python linenums="1" title="列表长度"
print(len([1, 2, 3, 4, 5]))
```

### 2.2 切片和索引

列表的索引和切片操作与字符串非常类似，使用上几乎无差异。

```python linenums="1"
fruits = ['apple', 'banana', 'cherry', 'date']

# 正向索引
print(fruits[0])    # 输出: apple
print(fruits[2])    # 输出: cherry

# 负向索引
print(fruits[-1])   # 输出: date
print(fruits[-3])   # 输出: banana

# 切片 [start:stop:step]
print(fruits[1:3])  # 输出: ['banana', 'cherry']
print(fruits[:2])   # 输出: ['apple', 'banana']
print(fruits[2:])   # 输出: ['cherry', 'date']
print(fruits[::2])  # 输出: ['apple', 'cherry']
print(fruits[::-1]) # 反转列表: ['date', 'cherry', 'banana', 'apple']
```

!!! warning "注意"

    列表的切片实际上是一种浅拷贝，它会出创建新的列表，大数据量的时候需要注意内存占用。

### 2.3 列表的修改

和字符串不一样的是，列表是可修改的，但列表中的字符串只能重新赋值，不可以直接修改。

```python linenums="1"
numbers = [1, 2, 3, 4]

# 修改元素
numbers[1] = 20
print(numbers)  # 输出: [1, 20, 3, 4]

# 切片赋值
numbers[1:3] = [200, 300]
print(numbers)  # 输出: [1, 200, 300, 4]

# 列表中字符串的修改
fruits = ['apple', 'banana', 'cherry']
fruits[1] = 'orange'
fruits[0][1] = 'zzz'  # 不会报错，但会报错
```

### 2.4 列表的遍历

结合 `for` 循环控制语句，可实现对列表元素的遍历。

```python linenums="1"
fruits = ['apple', 'banana', 'cherry']

for fruit in fruits:
    print(f'{fruit = }')

# 带索引遍历
for index, fruit in enumerate(fruits):
    print(index, fruit)
# 输出:
# 0 apple
# 1 banana
# 2 cherry

# 同时遍历多个列表
names = ['Alice', 'Bob', 'Charlie']
ages = [25, 30, 35]

for name, age in zip(names, ages):
    print(f'{name} is {age} years old.')
```

!!! note "生成器"

    如果你的列表长度非常大，那么遍历也能效率比较低，一种常见的做法就是使用 `yield` 生成器，将列表中的元素生成一个迭代器，然后使用 `next()` 函数获取迭代器的下一个元素。


### 2.5 列表的拼接

列表的拼接使用 `+` 运算符，将多个列表连接成一个新的列表，当然也可以使用 `extend` 方法来完成。

```python linenums="1"
numbers = [1, 2, 3]
new_list = numbers + [5, 6]
print(new_list)  # 输出: [1, 2, 3, 5, 6]
```

### 2.6 列表去重

列表去重使用 `set()` 函数，将列表转换为集合，集合不允许重复元素，再转换为列表。

```python linenums="1" title="列表去重"
numbers = [1, 3, 3, 3, 2, 0]
new_list = list(set(numbers))
print(new_list) # 输出: [0, 1, 2, 3 ]
```

上面方法虽然可以，但是列表元素的顺序可能会改变，如何在去重的同时保留顺序呢？

```python linenums="1" title="列表去重并保留顺序"
numbers = [1, 3, 3, 3, 2, 0]
print(dict.fromkeys(numbers))  # 输出：{1: None, 3: None, 2: None, 0: None}

new_list = list(dict.fromkeys(numbers))
print(new_list)  # 输出: [1, 3, 2, 0]
```

### 2.7 列表的比较

列表的比较使用运算符判断两个列表大小以及是否相等。

```python linenums="1" title="列表比较"
numbers = [1, 2, 3, 4, 5]
print(numbers == [1, 2, 3, 4, 5])

# 比较（按元素逐个比较）
print([1, 2] < [1, 3])  # 输出: True
```

## 3. 列表推导式

列表推导式是一种创建列表的快捷方式，基于一个可迭代对象，它可以根据快速地一个或多个表达式生成一个列表。

```python linenums="1"
squares = [x ** 2 for x in range(1, 6)]
```

同时列表推导数也可以添加过滤条件，生成指定的元素。

```python linenums="1" title="列表推导式"
evens = [x for x in range(10) if x % 2 == 0]
print(evens)  # 输出: [0, 2, 4, 6, 8]
```

此外，列表推导式也支持嵌套循环，即列表推导式中的 `for` 循环可以添加一个 `if` 语句，用于过滤元素。

```python linenums="1" title="列表推导式嵌套循环"
matrix = [[i * j for j in range(3)] for i in range(3)]
print(matrix)  # 输出: [[0, 0, 0], [0, 1, 2], [0, 2, 4]]

matrix = [
    [i * j for j in range(4) if j == 2] for i in range(4) if i % 2 == 0
    ]
print(matrix)
```

## 4. 列表的自带方法

| 方法 | 描述 |
| --- | --- |
| `index()` | 返回元素在列表中的索引 |
| `insert()` | 在指定位置插入元素 |
| `append()` | 添加元素到列表的末尾 |
| `extend()` | 添加列表中的元素到列表的末尾 |
| `clear()` | 删除列表中的所有元素 |
| `copy()` | 返回列表的浅拷贝 |
| `count()` | 返回列表中指定元素的个数 |
| `pop()` | 删除并返回列表末尾的元素 |
| `remove()` | 删除列表中指定元素的第一个匹配项 |
| `reverse()` | 反转列表的元素顺序 |
| `sort()` | 对列表进行排序 |

### 4.1 index

`index()` 方法返回列表中指定元素的 **首次** 索引，如果元素不存在，则返回 `ValueError` 错误。

```python linenums="1"
fruits = ['apple', 'banana', 'cherry', 'apple']

# index()：查找元素首次出现的索引
print(fruits.index('apple'))  # 输出: 0
```

此外，判断一个元素是否存在于列表中，我们也可以使用 `in` 运算。

```python linenums="1"
fruits = ['apple', 'banana', 'cherry', 'apple']
print('apple' in fruits)  # 输出: True
```

### 4.2 count

`count()` 方法返回列表中指定元素的个数，如果元素不存在，则返回 `0`。

```python linenums="1"
fruits = ['apple', 'banana', 'cherry', 'apple']
print(fruits.count('apple'))  # 输出: 2
```

### 4.2 insert / append / extend

`insert`、 `append`、`extend` 都可以向列表中添加元素，区别在于：

- `insert()` 方法用于在指定位置插入一个元素；
- `append()` 方法用于在列表的末尾添加一个元素；由于 `append` 是追加到列表末尾，所以它的执行效率会比 `insert()` 更高；
- `extend()` 方法用于将一个列表中的元素添加到另一个列表的末尾，即拼接多个列表使用。

```python linenums="1" title="列表添加元素"
fruits = ['apple', 'banana']

# append()：在末尾添加单个元素
fruits.append('cherry')
print(fruits)  # 输出: ['apple', 'banana', 'cherry']

# extend()：在末尾添加多个元素
fruits.extend(['date', 'elderberry'])
print(fruits)  # 输出: ['apple', 'banana', 'cherry', 'date', 'elderberry']

# insert()：在指定位置插入元素
fruits.insert(1, 'avocado')
print(fruits)  # 输出: ['apple', 'avocado', 'banana', 'cherry', 'date', 'elderberry']
```

### 4.3 pop / remove / clear

`pop()`、`remove()`、`clear()` 方法用于删除列表中的元素，区别在于：

- `pop()` 方法用于删除并返回列表末尾的元素，如果参数为索引，则删除并返回指定索引的元素；由于直接在尾部操作，所以它的执行效率会比 `remove()` 更高；
- `remove()` 方法用于删除列表中指定元素的第一个匹配项；
- `clear()` 方法用于删除列表中的所有元素。


```python linenums="1" title="列表删除元素"
fruits = ['apple', 'banana', 'cherry', 'date']

# remove()：按值删除
fruits.remove('banana')
print(fruits)  # 输出: ['apple', 'cherry', 'date']

# pop()：按索引删除并返回元素
popped = fruits.pop(1)
print(popped)  # 输出: cherry
print(fruits)  # 输出: ['apple', 'date']

# clear()：清空列表
fruits.clear()
print(fruits)  # 输出: []
```

### 4.4 reverse

`reverse()` 方法用于反转列表的元素顺序。

```python linenums="1" title="列表反转"
fruits = ['apple', 'banana', 'cherry', 'date']
print(fruits.reverse())
```

### 4.5 sort

`sort()` 方法用于对列表进行排序，默认情况下是升序排列，通过 `reverse=True` 参数可实现倒序排序。

```python linenums="1" title="列表排序"
numbers = [3, 1, 4, 1, 5, 9]

# sort()：原地排序
numbers.sort()
print(numbers)  # 输出: [1, 1, 3, 4, 5, 9]

# sort() 逆序
numbers.sort(reverse=True)
print(numbers)  # 输出: [9, 5, 4, 3, 1, 1]

a = [(1, 2), (3, 2), (2, 1)]
a.sort()
print(a)  # 输出: [(1, 2), (2, 1), (3, 2)]
```

### 4.6 copy

`copy()` 方法用于返回列表的浅拷贝，即创建一个新的列表，但新列表中的元素和原列表中的元素是相同的对象。

```python linenums="1" title="列表浅拷贝"
fruits = ['apple', 'banana', 'cherry']
new_fruits = fruits.copy()
print(new_fruits)
```

!!! note "浅拷贝与深拷贝"

    浅拷贝和深拷贝都是创建新的对象，区别在于：
    
    - 浅拷贝：制的是最外层的容器对象，但内部的元素（如果是可变对象）依然是引用；
    - 深拷贝：会递归复制所有层级的对象，生成的是完全独立的新对象。

    需要注意的是，如果只是 `[1, 2, 3, 4]` 这种列表，那么浅拷贝和深拷贝是相同的。

    ```python linenums="1" title="浅拷贝与深拷贝"
    import copy

    original = [[1, 2], [3, 4]]
    simple = original.copy()
    shallow = copy.copy(original)
    deep = copy.deepcopy(original)

    print("初始状态:")
    print("original:", original)
    print("shallow:", shallow)
    print("deep:   ", deep)

    # 修改原始对象内部的元素
    original[0][0] = 999

    print("\n修改 original[0][0] = 999 后:")
    print("original:", original)  # 输出：[[999, 2], [3, 4]]
    print("simple:", simple)  # 输出：[[999, 2], [3, 4]]
    print("shallow:", shallow)  # 输出：[[999, 2], [3, 4]]
    print("deep:   ", deep)     # 输出：[[1, 2], [3, 4]]
    ```

## 5. 其他方法

| 方法 | 描述 |
| --- | --- |
| `len()` | 返回列表的长度 |
| `max()` | 返回列表中的最大值 |
| `min()` | 返回列表中的最小值 |
| `sum()` | 返回列表中的和 |
| `any()` | 检查列表中是否有至少一个真值 |
| `all()` | 检查列表中的所有元素是否都为真 |
| `enumerate()` | 返回一个枚举对象，包含索引和元素 |
| `zip()` | 返回一个迭代器，用于将多个列表中的元素组合在一起 |
| `map()` | 返回一个迭代器，用于将函数应用于列表中的每个元素 |
| `filter()` | 返回一个迭代器，用于过滤列表中的元素 |
| `sorted()` | 返回一个新的列表，用于对列表进行排序，支持升序和降序，以及自定义排序方法 |

### 5.1 len

列表的长度使用 `len()` 函数，返回列表的长度。

```python linenums="1" title="列表长度"
print(len([1, 2, 3, 4, 5]))
```

### 5.2 max / min / sum

`max()`、`min()`、`sum()` 函数分别返回列表中的最大值、最小值和和。

```python linenums="1"
print(max([1, 2, 3, 4, 5]))
print(min([1, 2, 3, 4, 5]))
print(sum([1, 2, 3, 4, 5]))
```

### 5.3 any / all

`any()` 函数返回列表中是否至少有一个真值，`all()` 函数返回列表中的所有元素是否都为真。

```python linenums="1" title="any / all"
print(any([True, False, True]))  # 输出: True
print(all([True, False, True]))  # 输出: False
```

### 5.4 enumerate

`enumerate()` 函数返回一个枚举对象，包含索引和元素。

```python linenums="1" title="enumerate"
for i, fruit in enumerate(['apple', 'banana', 'cherry']):
    print(i, fruit)
```

### 5.5 zip

`zip()` 函数返回一个迭代器，用于将多个列表中的元素组合在一起。

```python linenums="1" title="zip"
for fruit, price in zip(['apple', 'banana', 'cherry'], [1.5, 2.0, 3.0]):
    print(fruit, price)
```

### 5.6 map

`map()` 函数返回一个迭代器，用于将处理函数应用于列表中的每个元素。

```python linenums="1" title="map"
for fruit in map(lambda x: x.upper(), ['apple', 'banana', 'cherry']):
    print(fruit)
```

### 5.7 filter

`filter()` 函数返回一个迭代器，用于过滤列表中的元素。

```python linenums="1" title="filter"
for fruit in filter(lambda x: x.startswith('a'), ['apple', 'banana', 'cherry']):
    print(fruit)
```

### 5.8 sorted

`sorted()` 函数返回一个新的列表，用于对列表进行排序，支持升序和降序，以及自定义排序方法。

```python linenums="1" title="sorted"
print(sorted([3, 1, 4, 1, 5, 9]))
print(sorted([3, 1, 4, 1, 5, 9], reverse=True))
print(sorted(['apple', 'banana', 'cherry'], key=len))
print(sorted([3, 1, 4, 1, 5, 9], key=lambda x: -x))

# 按照第 2 个元素进行排序
print(sorted([(1, 2), (2, 1)], key=lambda x: x[1]))

# 自定义排序：优先第 2 个元素升序，第 1 个元素降序
data = [(1, 2), (2, 1), (3, 2)]
sorted_data = sorted(data, key=lambda x: (x[1], -x[0]))
print(sorted_data)

```

## 6. 总结

1. **列表操作性能**：
   
   - `append()`和`pop()`在尾部操作效率高（O (1)）。
   - `insert()`和`remove()`在中间操作效率低（O (n)）。
   - 列表切片会创建新列表，大数据量时需注意内存占用。

2. **替代数据结构**：
    
    - 若需频繁在头部插入 / 删除，考虑使用 `collections.deque`。
    - 若需高效查找，考虑使用集合（Set）或字典（Dictionary）。

3. **列表生成式**
4. **浅拷贝与深拷贝**
