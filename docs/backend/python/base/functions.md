# Python函数

函数是很多编程语言的基本单位（Java中称为类方法），它允许我们将代码组织成 **可重用** 的块。Python 提供了灵活且强大的函数功能，包括创建和调用函数、形式参数与实际参数、位置参数、关键字参数、默认参数值、可变参数、返回值、变量作用域以及匿名函数（lambda）。本文将详细介绍这些内容，并提供相应的代码示例。

## 1. 创建函数

### 1.1 定义和调用

在 Python 中，函数是通过 `def` 关键字来定义的，并通过 `return` 语句返回结果（不一定是具体值，也可以是其他函数或类等）。函数定义的基本语法如下：

```python linenums="1"
def hello():
    print("hello")

hello()  # 调用函数

# 带参数无类型注解的函数
def greet(name):
    return f"Hello, {name}!"

greet("Amy")

# 带类型注解的函数
def greet2(name: str) -> str:
    return f"Hello, {name}!"

greet2("Amy")
```

**建议**：函数的参数都带上类型注解，这样能帮助阅读代码，更快理解函数的用途。

### 1.2 嵌套的函数调用

函数嵌套调用是指在一个函数内部调用另一个函数，==被调用的函数位置可以在后面定义==。示例代码如下：

```python linenums="1"
def sum_of_squares(a: int, b: int):
    return square(a) + square(b)

def square(x: int):
    return x * x

result = sum_of_squares(2, 3)
print(result)
print(square)  # <class 'function'>
```

### 1.3 函数文档

函数文档可以快速让其他人快速了解函数的用途，理解应该如何使用该函数

```python linenums="1" hl_lines="2"
def add(a: int, b: int) -> int:
    """返回两个数的和"""
    return a + b
```

常见 Docstring 示例风格有 Google / NumPy / reStructuredText 等风格，有助于多人协作开发时保持代码一致性。

=== "Google 风格"

    ```python linenums="1"
    def multiply(x: int, y: int) -> int:
        """
        Multiply two numbers.

        Args:
            x (int): The first number.
            y (int): The second number.

        Returns:
            int: The product of x and y.
        """
        return x * y
    ```

=== "NumPy 风格"

    ```python linenums="1"
    def multiply(x: int, y: int) -> int:
        """
        Multiply two numbers.

        Parameters
        ----------
        x : int
            The first number.
        y : int
            The second number.

        Returns
        -------
        int
            The product of x and y.
        """
        return x * y
    ```

### 1.4 函数返回值

函数可以使用 `return` 语句返回一个或多个值。如果没有使用 `return` 语句，函数将返回 `None`。

```python linenums="1"
def get_info() -> tuple[str, int]:
    name = "John"
    age = 25
    return name, age

name, age = get_info()
print(name, age)  # 输出: John 25
```

### 1.5 函数命名

Python 函数命名规范是指在编写 Python 函数时所遵循的一系列命名规则和约定。这些规则旨在让函数名能够清晰、准确地表达函数的功能，提高代码的可读性和可维护性。

- **可读性**：一个好的函数名能够让其他开发者（包括未来的自己）一眼就明白函数的用途，减少理解代码的时间。
- **可维护性**：当代码需要修改或扩展时，清晰的函数名能帮助开发者快速定位和理解相关代码，降低出错的风险。

主要的命名规范有：

- Python 推荐使用小写字母和下划线的组合来命名函数，这种命名风格被称为 snake_case。
- Python 有一些保留字（如 `if`, `else`, `for` 等），不能将这些保留字用作函数名。否则会导致语法错误；
- 使用动词开头：函数通常是执行某个操作，因此函数名最好以动词开头。例如：`get_user_info`, `update_user_profile` 等；
- 避免缩写：除非缩写是广泛认知的，否则应避免使用缩写。例如，不要将 `calculate_average` 缩写为 `calc_avg`，这样会降低代码的可读性；
- 保持一致性：在一个项目中，应保持函数命名风格的一致性。如果项目中已经使用了 snake_case 命名函数，就应该一直遵循这种风格。


## 2. 函数参数

函数可以接受零个或多个参数，参数可以分为以下几种类型：

- **位置参数**：按照参数的位置顺序传递的参数；
- **默认参数**：在函数定义时为参数指定默认值，如果调用时没有传递该参数，则使用默认值。 
- **可变参数**：可以接受任意数量的参数，分为可变位置参数（`*args`）和可变关键字参数（`**kwargs`）。

```python linenums="1"
def calculate(a: int | float, b: int = 2, *args, **kwargs):
    """计算结果"""
    result = a + b
    
    for num in args:
        result += num
    
    for key, value in kwargs.items():
        result += value
    
    return result

# 调用函数
result1 = calculate(1)  # 使用默认参数
print(result1)  # 输出: 3

result2 = calculate(1, 3, 4, 5)  # 传递位置参数和可变位置参数
print(result2)  # 输出: 13

result3 = calculate(1, 3, 4, 5, x=6, y=7)  # 传递位置参数、可变位置参数和可变关键字参数
print(result3)  # 输出: 26
```

### 2.1 实参和形参

| 名称     | 作用                         | 举例                          |
| -------- | ---------------------------- | ----------------------------- |
| **形参** | 函数定义时的变量名           | `def foo(x):` 中的 `x` 是形参 |
| **实参** | 调用函数时传入的具体值或对象 | `foo(10)` 中的 `10` 是实参    |

```python linenums="1"
def greet(name: str):  # name 是形参
    print(f"你好，{name}")

greet("小明")       # "小明" 是实参
```

### 2.2 默认参数值

函数的参数可以有默认值，即在定义函数时，为参数指定了一个默认值。

```python linenums="1"
def greet(name: str, message: str = "Hello"):
    """根据给定的名字和消息进行问候"""
    print(f"{message}, {name}!")

greet("Alice")
greet("Bob", "Hi")
```

需要注意的是，当某个参数设置了默认值后，后面的参数都必须设置默认值，否则会报错。

```python linenums="1" title="错误示例"
def greet(name: str = "Amy", message: str):
    """根据给定的名字和消息进行问候"""
    print(f"{message}, {name}!")


greet("Alice")
```

### 2.3 位置参数和关键字参数

参数传递的方式分为位置参数和关键字参数两种：

```python linenums="1"
def greet(name: str, message: str):
    """根据给定的名字和消息进行问候"""
    print(f"{message}, {name}!")

# 位置传参
greet("Alice", "Hello")

# 关键字传参
greet(message="Hello", name="Alice")
```

此外，Python 还可以使用 `*` 以及 `/` 来规定参数传参方式。

=== "/ 位置传参"
    `/` 表示位置参数，此前的参数只能根据参数位置进行传递。

    ```python linenums="1"
    def greet(name: str, /):
        print(f"Hello, {name}")

    greet("小明")   # 正确
    greet(name="小明")  # 报错：name 是位置参数
    ```

=== "* 关键字传参"

    `*` 表示关键字参数，此前的参数只能根据参数名称进行传递。

    ```python linenums="1"
    def greet(*, name: str):
        print(f"Hello, {name}")

    greet(name="小明")
    greet("小明")  # 报错：name 是关键字参数
    ```

=== "/ 和 * 一起使用"

    ```python linenums="1"
    def func(a: int, b: int, /, c: int, *, d: int, e: int):
        print(a, b, c, d, e)

    func(1, 2, 3, d=4, e=5)  # 正确
    func(1, 2, c=3, d=4, e=5)  # 正确
    func(a=1, b=2, c=3, d=4, e=5)  # 报错，a、b 不能用关键字传入
    ```

### 2.4 参数解构

可变参数的传递方式有有 2 种：`*args` 和 `**kwargs`。

- `*args`：可变参数，将所有参数收集到一个元组中。
- `**kwargs`：可变关键字参数，将所有参数收集到一个字典中。

```python linenums="1"
# 可变位置参数
def sum_numbers(*args):
    return sum(args)

result = sum_numbers(1, 2, 3, 4, 5)
print(result)

# 可变关键字参数
def print_info(**kwargs):
    for key, value in kwargs.items():
        print(f"{key}: {value}")

print_info(name="Alice", age=25, city="New York")
```

一个典型的案例是，我们可以使用字典存储数据库的配置信息，并传递给数据库连接函数。

```python linenums="1" hl_lines="5" title="数据库配置信息传递"
def connect_to_database(**config):
    host = config.get('host', 'localhost')
    port = config.get('port', 5432)
    user = config.get('user', 'guest')
    password = config.get('password', 'password')
    print(f"Connecting to {host}:{port} as {user}")

connect_to_database(host='example.com', user='admin')
# 输出: Connecting to example.com:5432 as admin
```

### 2.5 避免可变对象的参数传递

```python linenums="1" hl_lines="7"
# 错误示例
def add_item(item: int, items: list[int] = []):
    items.append(item)
    return items

print(add_item(1))  # 输出: [1]
print(add_item(2))  # 输出: [1, 2]，不是预期的 [2]

# 正确示例
def add_item(item: int, items: list[int] = None):
    if items is None:
        items = []
    items.append(item)
    return items

print(add_item(1))  # 输出: [1]
print(add_item(2))  # 输出: [2]
```

## 3. 变量的作用域

在 Python 编程中，变量作用域（Variable Scoping）是一个至关重要的概念，它决定了变量的可见性和生命周期。理解变量作用域有助于我们编写出更清晰、更易于维护的代码，避免变量名冲突和意外的变量修改。本文将详细介绍 Python 变量作用域的基础概念、使用方法、常见实践以及最佳实践，通过丰富的代码示例帮助读者深入理解并高效使用这一概念。

### 3.1 全局作用域

全局作用域是指在整个程序文件中都可以访问的变量。全局变量通常在模块的顶层定义，即不在任何函数或类内部。以下是一个简单的示例：

```python linenums="1" title="局部变量"
# 全局变量
global_variable = 10

def print_global_variable():
    print(global_variable)

print_global_variable()  # 输出: 10
```

在这个例子中，`global_variable` 是一个全局变量，在函数 `print_global_variable` 内部可以直接访问。

### 3.2 局部作用域

局部作用域是指在函数内部定义的变量，这些变量只能在函数内部访问。当函数执行完毕后，局部变量会被销毁。示例如下：

```python linenums="1" hl_lines="3" title="局部作用域"
def print_local_variable():
    # 局部变量
    local_variable = 20
    print(local_variable)

print_local_variable()  # 输出: 20
# 尝试在函数外部访问局部变量
# print(local_variable)  # 这行代码会抛出 NameError
```

在这个例子中，`local_variable` 是一个局部变量，只能在 `print_local_variable` 函数内部访问。

### 3.3 嵌套作用域

当一个函数内部嵌套另一个函数时，就会产生嵌套作用域。内部函数可以访问外部函数的变量，这些变量被称为非局部变量，但不能使用该变量运算后再变。示例如下：

```python linenums="1" hl_lines="5" title="嵌套作用域"
def outer_function():
    outer_variable = 30
    def inner_function1():
        outer_variable = 10
        print(outer_variable)

    inner_function1()  # 10
    print(f"执行 inner_function1 后: {outer_variable}")   # 30

    def inner_function2():
        print(outer_variable)

    inner_function2()  # 30
    print(f"执行 inner_function2 后: {outer_variable}")   # 30

    def inner_function3():
        outer_variable_new = outer_variable + 10
        print(outer_variable_new)

    inner_function3()  # 40
    print(f"执行 inner_function3 后: {outer_variable}")  # 30

    def inner_function4():
        outer_variable = outer_variable + 10   # 报错：不能赋值为 outer_variable
        print(outer_variable)
    
    inner_function4()  # 报错

    def inner_function5():
        outer_variable_copy = outer_variable  # 报错：不能直接赋值新的变量
        outer_variable = outer_variable_copy + 10  
        print(outer_variable)
    
    inner_function5()  # 报错
    
outer_function()  # 输出: 30
```

在这个例子中，`outer_variable` 是外部函数 `outer_function` 的局部变量，但内部函数 `inner_function` 可以访问它。

### 3.4 变量作用域的查找顺序

当我们在代码中引用一个变量时，Python 解释器会按照以下顺序查找变量： 1) 局部作用域（Local） > 2) 嵌套作用域（Enclosing） 3) 全局作用域（Global） > 4) 内置作用域（Built-in），这个顺序也被称为 LEGB 规则。示例如下：

```python linenums="1" hl_lines="5" title="变量作用域的查找顺序"
# 全局变量
x = 1

def outer():
    x = 2
    print('(1):', x)  # 输出: 2
    
    def inner():
        x = 3
        print('(2):', x)  # 输出: 3

    def inner2():
        print('(3):', x)  # 输出: 2
    
    inner()
    inner2()

def outer2():
    print('(4):', x)  # 输出: 1

def outer3():
    print('(5):', x)  # 报错
    x = 2


outer()
outer2()
outer3()  # 报错
```

在这个例子中，`inner` 函数内部的 `x` 首先在局部作用域中找到，因此输出为 3。

### 3.5 `global` 和 `nonlocal` 关键字的使用

**`global` 关键字**：用于在函数内部修改全局变量。示例如下：

```python linenums="1" hl_lines="5" title="修改全局变量"
global_var = 5

def modify_global():
    global_var = 15   # 未修改全局变量

modify_global()
print(f"{global_var = }")

def modify_global2():
    global global_var
    global_var = 15

modify_global2()
print(f"{global_var = }")  # 输出: 15
```

**`nonlocal` 关键字**：用于在嵌套函数中修改非局部变量。示例如下：

```python linenums="1" hl_lines="5" title="修改非局部变量"
def outer_func():
    nonlocal_var = 25
    
    def inner_func():
        nonlocal_var = 10  # 未修改非局部变量

    inner_func()
    print(f"{nonlocal_var = }")  # 输出: 25

    def inner_func2():
        nonlocal nonlocal_var
        nonlocal_var = 35
    
    inner_func2()
    print(f"{nonlocal_var = }")  # 输出: 35

outer_func()
```

## 4. 进阶使用

一个典型的函数使用案例就是批量打开文件并读取内容，因为文件路径可能不存在，所以我们在过程中也进行处理异常：

```python linenums="1" title="打开文件并读取内容"
def read_file(file_path: str):
    try:
        with open(file_path, 'r') as file:
            content = file.read()
            return content
    except FileNotFoundError:
        print(f"文件 {file_path} 未找到。")
        return None
```

### 4.1 嵌套函数

函数可以在另一个函数内部定义，这种函数称为嵌套函数，嵌套函数可以访问外部函数的变量。

```python linenums="1"
def outer_function():
    x = 10
    def inner_function():
        print(x)
    inner_function()

outer_function()  # 输出: 10
```

### 4.2 递归函数

递归函数是指在函数内部调用自身的函数。递归函数通常用于解决可以分解为相同子问题的问题，如计算阶乘。

```python linenums="1" title="斐波那契数列"
def factorial(n):
    if n == 0 or n == 1:
        return 1
    else:
        return n * factorial(n - 1)

result = factorial(5)
print(result)  # 输出: 120
```

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

### 4.3 函数作为参数

高阶函数是指接受一个或多个函数作为参数，或者返回一个函数的函数，这种常见于回调函数的使用。

```python linenums="1"
from typing import Callable

def apply_operation(func: Callable, a: int, b: int):
    return func(a, b)

result = apply_operation(add, 3, 4)
print(result)  # 输出: 7

def fetch_data(callback):
    # 模拟数据获取
    data = [1, 2, 3, 4, 5]
    callback(data)

def process_data(data):
    print(f"Processing data: {sum(data)}")

fetch_data(process_data)
```

### 4.4 闭包

闭包是一种函数，它可以引用外部函数的变量。简单来说，当一个函数内部定义了另一个函数，并且内部函数可以访问外部函数的局部变量时，就形成了一个闭包（实际上后面我们介绍的装饰器就是一个闭包）。

闭包的形成条件：

1. 函数内部定义了另一个函数；
2. 内部函数引用了外部函数的局部变量。
3. 外部函数返回了内部函数。

#### 4.4.1 定义闭包函数

```python linenums="1" title="简单函数闭包"
def outer_function(x):
    def inner_function(y):
        return x + y
    return inner_function

# 创建闭包实例
closure = outer_function(10)

# 调用闭包
result = closure(5)
print(result)  # 输出: 15

def create_multiplier(factor):
    def multiplier(x):
        return x * factor
    return multiplier

double = create_multiplier(2)
triple = create_multiplier(3)

print(double(5))  # 10
print(triple(5))  # 15
```

在这个示例中，`outer_function` 是外部函数，`inner_function` 是内部函数。`inner_function` 引用了外部函数 `outer_function` 的局部变量 `x`，并且 `outer_function` 返回了 `inner_function`，这样就形成了一个闭包。

闭包的调用方式与普通函数类似，只需将闭包对象当作函数来调用，并传入相应的参数即可。

#### 4.4.2 常见实践

=== "数据封装与隐藏"
    
    闭包可以用于封装数据，使得数据只能通过特定的函数进行访问和修改，从而实现数据的隐藏。

    ```python linenums="1"
    def counter():
        count = 0
        def increment():
            nonlocal count
            count += 1
            return count
        return increment

    # 创建闭包实例
    c = counter()

    # 调用闭包
    print(c())  # 输出: 1
    print(c())  # 输出: 2
    ```

    在这个示例中，`count` 变量被封装在 `counter` 函数内部，外部无法直接访问。只能通过调用闭包 `increment` 函数来修改和获取 `count` 的值。

=== "函数工厂"

    闭包可以用于创建一系列具有特定功能的函数，这就是函数工厂的概念。

    ```python linenums="1"
    def power_factory(n):
        def power(x):
            return x ** n
        return power

    # 创建不同幂次的函数
    square = power_factory(2)
    cube = power_factory(3)

    # 调用函数
    print(square(2))  # 输出: 4
    print(cube(2))    # 输出: 8
    ```

=== "延迟计算"

    闭包可以用于实现延迟计算，即等到需要结果时才进行计算。

    ```python linenums="1"
    def lazy_sum(*args):
        def sum():
            ax = 0
            for n in args:
                ax = ax + n
            return ax
        return sum

    # 创建闭包实例
    f = lazy_sum(1, 2, 3, 4, 5)

    # 调用闭包进行计算
    print(f())  # 输出: 15
    ```

    在这个示例中，`lazy_sum` 函数返回一个闭包 `sum`，当调用 `f()` 时才会进行求和计算。

=== "动态生成函数"

    ```python linenums="1"
    def get_operation(operator):
        if operator == '+':
            def add(x, y):
                return x + y
            return add
        elif operator == '-':
            def subtract(x, y):
                return x - y
            return subtract
        else:
            print("Invalid operator")

    add_function = get_operation('+')
    subtract_function = get_operation('-')

    print(add_function(5, 3))  # 输出: 8
    print(subtract_function(5, 3))  # 输出: 2
    ```

=== "GUI"

    ```python linenums="1"
    import tkinter as tk

    def button_click_callback():
        print("按钮被点击了！")

    root = tk.Tk()
    button = tk.Button(root, text="点击我", command=button_click_callback)
    button.pack()
    root.mainloop()
    ```

=== "异步编程"

    ```python linenums="1"
    import asyncio

    async def async_operation(callback):
        await asyncio.sleep(1)
        result = 42
        callback(result)

    def callback_function(result):
        print(f"异步操作结果: {result}")

    async def main():
        await async_operation(callback_function)

    asyncio.run(main())
    ```

#### 4.4.3 避免循环变量陷阱

在使用闭包时，如果在循环中创建闭包，需要注意循环变量的问题。

```python linenums="1"
# 错误示例
functions = []
for i in range(3):
    def func():
        return i
    functions.append(func)

for f in functions:
    print(f())  # 输出: 2, 2, 2

# 正确示例
functions = []
for i in range(3):
    def make_func(x):
        def func():
            return x
        return func
    functions.append(make_func(i))

for f in functions:
    print(f())  # 输出: 0, 1, 2
```

在错误示例中，由于闭包引用的是循环变量 `i`，而不是 `i` 的值，当循环结束后，`i` 的值为 2，所以所有闭包调用的结果都是 2。在正确示例中，通过将 `i` 的值作为参数传递给内部函数，避免了这个问题。

## 5. 匿名函数

### 5.1 简单匿名函数

匿名函数是一种没有名称的函数，使用 `lambda` 关键字定义，通常用于简单的函数。

```python linenums="1"
add = lambda x, y: x + y
result = add(3, 5)
print(result)  # 输出: 8
```

### 5.2 带参数类型注解的匿名函数

那可不可以给匿名函数的参数添加类型注解呢？

```python linenums="1"
add = lambda (x: int, y: int) : x + y  # 报错
```

尝试一下就知道，这种方式是不行的。实际上，匿名函数无法注解给参数添加类型注解，但可以给具体函数名添加。

```python linenums="1"
from typing import Callable

f: Callable[[int, int], int] = lambda x, y: x + y
```

### 5.3 带条件判断的匿名函数

`lambda` 函数可以结合条件表达式进行条件判断。


```python linenums="1"
is_positive = lambda x: True if x > 0 else False
print(is_positive(5))  # 输出: True
print(is_positive(-3))  # 输出: False
```

### 5.4 处理列表元素

```python linenums="1"
fruits = [{'name': 'apple', 'price': 2}, {'name': 'banana', 'price': 1}]
prices = list(map(lambda x: x['price'], fruits))
print(prices)  # 输出: [2, 1]
```

### 5.5 作为回调函数

在一些需要传递回调函数的场景中，内联函数可以作为简单的回调函数使用。例如，在使用 `threading` 模块创建线程时，可以使用内联函数作为线程的目标函数。

```python linenums="1"
import threading

# 定义一个内联函数作为线程的目标函数
task = lambda: print("This is a task running in a thread.")

# 创建一个线程并启动
thread = threading.Thread(target=task)
thread.start()
```

### 6.6 小结

保持简洁

: Lambda 函数的主要目的是提供一种简洁的方式来定义小型函数。因此，应该避免在 Lambda 函数中编写复杂的逻辑，否则会降低代码的可读性。如果逻辑比较复杂，建议使用普通的函数定义。

明确参数和返回值

: 虽然 Lambda 函数可以省略函数名，但应该确保参数和返回值的含义清晰。可以在代码注释中说明 Lambda 函数的作用和参数的含义。

合理使用

: Lambda 函数适用于一次性使用的简单函数。如果一个函数需要多次使用，或者逻辑比较复杂，建议使用普通的函数定义，以提高代码的可维护性。

## 6. 装饰器

装饰器是一种特殊的高阶函数，它可以用来修改其他函数的行为。以下是一个简单的装饰器示例，定义一个装饰器 `timer`，用于记录函数的执行时间：

```python linenums="1"
import time
from typing import Callable

def timer(func: Callable):
    def wrapper(*args, **kwargs):
        start_time = time.time()
        result = func(*args, **kwargs)
        end_time = time.time()
        print(f"Function {func.__name__} took {end_time - start_time} seconds to execute.")
        return result
    return wrapper

@timer
def slow_function():
    time.sleep(2)

slow_function()
```

!!! note "扩展"

    这里装饰器介绍得非常简单，除此之外，还有函数重载、偏函数、异步函数等内容。

## 7. 函数重载

函数重载是指在同一个类或作用域中定义 **多个同名** 函数，但这些函数具有不同的参数列表，支持不同参数类型传参时自动调用相应参数的函数。在 Python 里，由于它是动态类型语言，并不像其他一些编程语言（如 Java、C++）那样原生支持，不能直接通过定义同名但参数类型或数量不同的函数来实现传统意义上的重载。不过，我们可以通过一些技巧和库来模拟实现函数重载，这有助于提高代码的可读性和可维护性。

### 7.1 条件判断

最基本的实现函数重载的方法，就是通过在函数内部使用 `if-else` 语句根据参数的类型或数量来执行不同的逻辑。

```python linenums="1"
def add(a: int, b: int = None):
    if b is None:
        return a + a
    return a + b

# 测试
print(add(5))  # 输出: 10
print(add(5, 3))  # 输出: 8
```

### 7.2 functools.singledispatch

`functools.singledispatch` 是 Python 标准库中的一个工具，它可以根据第一个参数的类型来调度不同的函数实现。

```python linenums="1"
from functools import singledispatch

@singledispatch
def process(data):
    print(f"Processing general data: {data}")

@process.register(int)
def _(data):
    print(f"Processing integer data: {data}")

@process.register(str)
def _(data):
    print(f"Processing string data: {data}")

# 测试
process(10)  # 输出: Processing integer data: 10
process("hello")  # 输出: Processing string data: hello
process([1, 2, 3])  # 输出: Processing general data: [1, 2, 3]
```

### 7.3 multipledispatch

`multipledispatch` 是一个第三方库（通过 `pip` 安装），它可以根据多个参数的类型来实现函数重载。

```python linenums="1"
from multipledispatch import dispatch

@dispatch(int, int)
def add(a, b):
    return a + b

@dispatch(str, str)
def add(a, b):
    return a + " " + b

# 测试
print(add(5, 3))  # 输出: 8
print(add("Hello", "World"))  # 输出: Hello World
```

在实际开发中，我们可能需要对不同类型的输入进行不同的处理。例如，处理整数和字符串时采用不同的逻辑。

```python linenums="1"
from multipledispatch import dispatch

@dispatch(int)
def handle_input(data):
    return data * 2

@dispatch(str)
def handle_input(data):
    return data.upper()

# 测试
print(handle_input(5))  # 输出: 10
print(handle_input("hello"))  # 输出: HELLO
```

### 7.4 typing.overload


```python linenums="1"
from typing import overload, Union

@overload
def greet(name: str) -> str: ...

@overload
def greet(name: int) -> str: ...

def greet(name: Union[str, int]) -> str:
    if isinstance(name, str):
        return f"Hello, {name}"
    elif isinstance(name, int):
        return f"Hello, user #{name}"
    raise TypeError("Invalid type")

print(greet("Alice"))  # Hello, Alice
print(greet(123))      # Hello, user #123
```

这种方法对 mypy、pyright 有效，但 Python 运行时只执行最后一个实现函数。仅用于类型检查器，无运行时效果，在实际运行时，只有最后那个 `greet()` 会存在，前两个 `@overload` 的函数根本不会执行，Python 甚至会跳过它们的定义体。

### 7.5 小结

保持函数功能的一致性

: 无论使用哪种方法实现函数重载，都应该确保同名函数的功能具有一致性。也就是说，不同的实现应该围绕同一个核心功能进行不同的处理。

合理使用类型注解

: 使用类型注解可以提高代码的可读性和可维护性，特别是在使用 `functools.singledispatch` 或 `multipledispatch` 时，类型注解可以让代码更加清晰。

## 8. 偏函数

偏函数（Partial Function）是一个非常实用的工具，它允许我们固定一个函数的某些参数，从而创建一个新的可调用对象。这在需要多次调用同一个函数，且部分参数保持不变的场景下非常有用。

偏函数是 `functools` 模块中的一个功能，它基于现有的函数创建一个新的函数，新函数会固定原函数的一部分参数。这种特性使得我们可以在不修改原函数定义的情况下，方便地复用函数。

### 8.1 底层原理

偏函数通过将原函数和固定的参数封装起来，返回一个新的可调用对象。当调用这个新对象时，它会自动将固定的参数和新传入的参数一起传递给原函数。

### 8.2 使用方法

要使用偏函数，需要导入 `functools` 模块中的 `partial` 函数。下面是一个简单的示例：

```python linenums="1"
from functools import partial

# 定义一个简单的函数
def add(a: int, b: int):
    return a + b

# 创建一个偏函数，固定第一个参数为 10
add_ten = partial(add, 10)

# 调用偏函数
result = add_ten(5)
print(result)  # 输出: 15
```

在这个示例中，我们定义了一个 `add` 函数，然后使用 `partial` 函数创建了一个新的偏函数 `add_ten`，并将 `add` 函数的第一个参数固定为 10。当调用 `add_ten(5)` 时，实际上相当于调用 `add(10, 5)`。

### 8.4 常见实践

#### 8.4.1 简化函数调用

在需要多次调用同一个函数，且部分参数保持不变的情况下，使用偏函数可以简化代码。例如，我们需要多次将字符串转换为整数，且默认使用十进制：

```python linenums="1"
from functools import partial

# 创建一个偏函数，固定 base 参数为 10
int_base_10 = partial(int, base=10)

# 调用偏函数
num1 = int_base_10('123')
num2 = int_base_10('456')
print(num1, num2)  # 输出: 123 456
```

#### 8.4.2 回调函数的参数固定

在使用回调函数时，有时需要传递额外的参数。偏函数可以帮助我们固定这些参数。例如，使用 `threading.Timer` 时：

```python linenums="1"
import threading
from functools import partial

def print_message(message: str):
    print(message)

# 创建一个偏函数，固定 message 参数
print_hello = partial(print_message, "Hello, World!")

# 启动一个定时器，5 秒后调用偏函数
timer = threading.Timer(5, print_hello)
timer.start()
```

### 8.5 小结

避免过度使用

: 虽然偏函数很方便，但过度使用可能会导致代码的可读性降低。因此，应该在必要时使用偏函数，避免创建过多的偏函数。

明确命名

: 为偏函数取一个有意义的名称，这样可以提高代码的可读性。例如，在上面的 add_ten 示例中，名称清晰地表明了偏函数的功能。

结合其他特性使用

: 偏函数可以与 Python 的其他特性（如装饰器、高阶函数等）结合使用，以实现更复杂的功能。


## 9. 小结

函数命名规范

: 函数名应该具有描述性，能够清晰地表达函数的功能。通常使用小写字母和下划线的组合，遵循 Python 的命名规范（PEP 8）。

函数的单一职责原则

: 一个函数应该只负责完成一个明确的任务，这样可以提高函数的可读性和可维护性。如果一个函数承担了过多的职责，应该将其拆分为多个函数。

避免全局变量的滥用以及副作用

: 全局变量会增加代码的耦合性，降低代码的可维护性。尽量在函数内部使用局部变量，如果需要在函数之间共享数据，可以通过参数和返回值来传递。

合理使用 `global` 和 `nonlocal`

: 虽然 `global` 和 `nonlocal` 关键字可以方便地修改全局变量和非局部变量，但过度使用会使代码变得难以理解。只有在必要时才使用这些关键字。

闭包实现时避免循环变量陷阱

: 在使用闭包时，如果在循环中创建闭包，需要注意循环变量的问题。

合理使用闭包提高代码可读性

: 闭包可以将一些相关的代码封装在一起，使得代码更加模块化和易于理解。但也要注意不要过度使用闭包，以免导致代码变得复杂难懂。

注意内存管理

: 由于闭包会保留对外部函数局部变量的引用，可能会导致内存泄漏。因此，在使用闭包时，要确保在不需要时及时释放这些引用。
