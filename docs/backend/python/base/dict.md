# Python字典

Python 字典是另一种可变容器模型，且可存储任意类型对象，如字符串、数字、元组等其他容器模型，其本质是提供给了一种类似编码器—解码器映射关系的结构，能够方便快速地根据键获取对应元素对象。

![](https://mingminyu.github.io/webassets/images/20250630/01.png)

## 1. 字典的定义

字典由键和对应值成对组成，也被称作关联数组或哈希表。基本语法如下：

```python linenums="1" hl_lines="3"
d1 = {'Alice': '2341', 'Beth': '9102', 'Cecil': '3258'}
d2 = dict(name='Alice')
d3 = dict(zip(['one', 'two', 'three'], [1, 2, 3]))
d4 = dict([('two', 2), ('one', 1), ('three', 3)])
d5 = dict({'one': 1, 'two': 2, 'three': 3})
d6 = dict({'one': 1, 'three': 3}, two=2)
```

需要注意的是，字典的键必须独一无二，但值则不必，如果同一个键传了 **2** 次值，那么会用后面的作为值。

```python linenums="1"
d = {'name': 'Zara', 'age': 7, 'name': 'Manni'};
print(d["name"])
```

此外，**字典的键是不可变的**，所以可以使用整数或者元祖作为键，但不可以使用列表作为键。

```python linenums="1" hl_lines="2"
d = {100: "zzz", ("a", 12): "z93"}
d1 = {[1, 2]: "z93"}  # 报错
```

## 2. 字典的操作

字典作为一个键值对存储对象，主要操作主要是

### 2.1 访问字典的值

```python linenums="1"
d = {"name": "张三", "gender": "男"}
print(d["name"])  # 张三
print(d["age"])   # 报错
```

使用 `["name"]` 方式访问字典的值时，需要确认该字典中一定存在此键，否则会报错。后面我们会介绍到 2 种处理方法 `get` 以及 `setdefault`，可避免访问时这种键不存在的情况。

### 2.2 修改字典的值

```python linenums="1"
d = {"name": "张三", "gender": "男"}
d["name"] = "李四"
d["name"] = 123   # 可修改为不一样的数据类型
print(d["name"])  # 123
```

### 2.3 删除字典的元素

使用 `del`  可删除字典的元素，删除后不可通过 `d["name"]` 访问值：

```python linenums="1"
d = {"name": "张三", "gender": "男"}
del d["name"]
```

使用 `clear()`  也可以清空字典的元素。

### 2.4 查看字典是否存在某个键

使用 `in`  可查看字典是否存在某个键：

```python linenums="1"
d = {"name": "张三", "gender": "男"}
print("name" in d)  # 输出：True
print("age" in d.keys())  # 输出：False
```

### 2.5 合并多个字典

当需要合并多个字典时，可以使用 `update()` 方法，也可以使用 `**` 运算符：

```python linenums="1"
d1 = {"name": "张三", "gender": "男"}
d2 = {"age": 18, "city": "上海"}
d3 = d1.update(d2)
d4 = {**d1, **d2}
```

## 3. 字典的推导式

字典的推导式，可创建字典，并返回字典。

```python linenums="1" title="字典推导式"
d = {i: i * i for i in range(1, 4)}
print(d)  # 输出：{1: 1, 2: 4, 3: 9}
```

如果我们希望对键值对进行互换，也可以通过推导式进行操作：

```python linenums="1" title="反转键值对"
d = {i: i * i for i in range(1, 4)}
d1 = {v: k for k, v in d.items()}
print(d1)  # 输出：{1: 1, 4: 2, 9: 3}
```

## 4. 字典自带方法

| 方法              | 描述                            |
| ----------------- | ------------------------------- |
| `copy()`          | 浅复制(指向同一内存地址) |
| `pop()`、`popitem()` 、`clear()` | `pop()`：给定键删除元素并返回删除的元素；`popitem()`：删除键值对并返回该元组 ；`clear()`：删除所有键值对 |
| `keys()` 、`values()` 、`items()` | `keys()`：以列表返回字典的所有键；`values()`：返回字典的所有值；`items()`：以元组形式返回所有键值对  |
| `get()`、`setdefault()` | 按键查找值，可设置未查到时返回的默认值。`setdefault()`：返回指定键的值，如果键不存在则创建并设置默认值。 |
| `update()`        | 更新键值对                      |
| `has_key()`       | 检查字典里是否有某 KEY          |
| `dict.fromkeys(seq, [, value])` | 用 seq 作健，对应同一个值 |

### 4.1 copy

与列表一样，`copy` 是一个字典的浅拷贝。需要注意的是，如果我们修改的字典值是不可变类型（例如整数 17），而不是引用类型（例如列表 `[1, 2, 3]`），那么 `copy` 函数不会改变原字典的值，相当于一个单独的副本。

```python linenums"1"
d1 = {'name': 'zhangsan', 'age': 17, 'friends': ['amy', "lucy"]}
d2 = d1.copy()
print(d2)

# 更新 d1 的字典值
d1['age'] = 28
print(d2)  # 输出：{'name': 'zhangsan', 'age': 17, 'friends': ['amy', "lucy"]}
d1['friends'].append('tom') 
print(d2)  # 输出：{'name': 'zhangsan', 'age': 17, 'friends': ['amy', "lucy", 'tom']}
```

### 4.2 pop / popitem / clear

=== "pop"

    `pop()` 方法用于删除字典中的指定项，它接收 2 个参数，第一个参数为键，第二个参数为可选参数，如果字典中不存在第一个参数中的键，则返回第二个参数。
    
    ```python linenums="1" hl_lines="5"
    d = {'name': 'zhangsan', 'age': 17, 'friends': ['amy', "lucy"]}
    d.pop('age')  # 输出：17
    print(d)  # 输出：{'name': 'zhangsan', 'friends': ['amy', "lucy"]}
    
    d.pop('gender', 'No Key')  # 输出：No Key
    ```

=== "popitem"

    **随机** 删除字典中某一键值对，并以元组的形式返回这一键值对，返回并删除字典中的最后一对键和值。

    ```python linenums="1" hl_lines="5"
    d = {'name': 'zhangsan', 'age': 17, 'friends': ['amy', "lucy"]}
    d.popitem()  # 输出：('age', 17)
    ```

=== "clear"

    `clear()` 方法用于删除字典中的所有项。

    ```python linenums="1"
    d = {'name': 'zhangsan', 'age': 17, 'friends': ['amy', "lucy"]}
    d.clear()
    print(d)  # 输出：{}
    ```

### 4.5 keys / values / items

=== "keys"
    
    以列表返回一个字典所有的键。

    ```python linenums="1"
    d = {'name': 'Alice', 'age': 23, 'address': 'Hangzhou'}
    print(d.keys())  # 输出：dict_keys(['name', 'age', 'address'])
    print(list(d.keys()))  # 输出 ：['name', 'age', 'address']
    ```

=== "values"

    返回字典中所有键对应的值。

    ```python linenums="1"
    d = {'name': 'Alice', 'age': 23, 'address': 'Hangzhou'}
    print(d.values())  # 输出：dict_values(['Alice', 23, 'Hangzhou'])
    print(list(d.values()))  # 输出 ：['Alice', 23, 'Hangzhou']
    ```

=== "items"

    以元组形式返回字典中所有键值对。

    ```python linenums="1"
    d = {'name': 'Alice', 'age': 23, 'address': 'Hangzhou'}
    print(d.items())  # 输出：dict_items([('name', 'Alice'), ('age', 23), ('address', 'Hangzhou')])
    ```

### 4.6 get / setdefault

=== "get"

    返回指定键的值，如果值不在字典中返回默认值，默认值为 `None`。

    ```python linenums="1" hl_lines="3"
    d = {'name': 'zhangsan', 'age': 17, 'friends': ['amy', "lucy"]}
    print(d.get('name'))  # 输出：zhangsan
    print(d.get('sex', 'male'))  # male
    print(d) # 输出：{'name': 'zhangsan', 'age': 17, 'friends': ['amy', 'lucy']}
    ```

=== "setdefault"

    设置字典的默认值，如果键不存在，则 **创建** 键并设置默认值。

    ```python linenums="1" hl_lines="3"
    d = {'name': 'zhangsan', 'age': 17, 'friends': ['amy', "lucy"]}
    print(d.setdefault('name', 'lisi'))  # 输出：zhangsan
    print(d.setdefault('sex', 'male'))   # 输出：male
    print(d)  # 输出：{'name': 'zhangsan', 'age': 17, 'friends': ['amy', 'lucy'], 'sex': 'male'}
    ```

### 4.7 update

更新字典的键-值对，将参数中字典中的键值对更新到字典中，此方法无返回值。

```python linenums="1" hl_lines="3"
d = {'name': 'zhangsan', 'age': 17, 'friends': ['amy', "lucy"]}
d.update({'name': 'lisi', 'sex': 'male'})
print(d)  # 输出：{'name': 'lisi', 'age': 17, 'friends': ['amy', 'lucy'], 'sex': 'male'}
```

### 4.8 dict.fromkeys

`dict.fromkeys` 是创造一个新的字典。就是事先造好一个空字典和一个列表，`fromkeys` 会接收两个参数，第一个参数为从外部传入的可迭代对象，会将循环取出元素作为字典的键，另外一个参数是字典的值，不写所有的键所对应的值均为 `None`，写了则为默认的值。

```python linenums="1"
seq = ('Google', 'Baidu', 'Taobao')
print(dict.fromkeys(seq))  # 输出：{'Google': None, 'Baidu': None, 'Taobao': None}
print(dict.fromkeys(seq, 1))  # 输出：{'Google': 1, 'Baidu': 1, 'Taobao': 1}
print(dict.fromkeys(range(5), 88))  # 输出：{0: 88, 1: 88, 2: 88, 3: 88, 4: 88}
```

## 5. 其他使用

### 5.1 collections.defaultdict

`collections.defaultdict` 自动为不存在的键提供一个默认值。

```python linenums="1"
from collections import defaultdict

d = defaultdict(int)
d['key1'] += 1  # 即使 'key1' 不存在，也会自动创建并初始化为0
```

### 5.2 collections.OrderedDict

```python linenums="1" title="有序字典"
from collections import OrderedDict

ordered_dict = OrderedDict([('key1', 'value1'), ('key2', 'value2')])
```

## 6. 其他方法

| 方法                       | 描述                                             |
| -------------------------- | ------------------------------------------------ |
| `len()`                    | 字典的长度                                       |
| `str()`                    | 返回字符串形式的 DICT(一个 KEY-VALUE 连一个那种) |

