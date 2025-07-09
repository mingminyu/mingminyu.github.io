# Python控制语句

Python 中的控制语句用于控制程序的执行流程，使程序能够根据不同的条件执行不同的代码块，或重复执行某段代码。

## 1. if-elif-else

在 Python 编程中，`if-else` 语句是控制程序流程的基础工具之一。它允许根据条件的真假来执行不同的代码块，从而使程序能够根据不同的情况做出不同的响应。掌握 `if-else` 语句的语法和使用方法，对于编写灵活、智能的 Python 程序至关重要。

### 1.1 简单的 if 语句

简单的 if 语句只包含一个条件判断，如果条件为 `True`，则执行对应的代码块。

```python linenums="1" title="if语句" hl_lines="5"
x = 10
if x > 5:
    print("x 大于 5")

if 3 < x < 5:
    print("x 在 3 到 5 之间")
```

### 1.2 if-else 语句

`if-else` 语句在条件为 `True` 时执行 `if` 代码块，在条件为 `False` 时执行 `else` 代码块。

```python linenums="1" title="if-else语句"
x = 3
if x > 5:
    print("x 大于 5")
else:
    print("x 小于或等于 5")
```

### 1.3 `if-elif-else` 语句

`if-elif-else` 语句用于处理多个条件。它会依次检查每个条件，一旦某个条件为 `True`，则执行对应的代码块，并跳过其余的条件检查。

```python linenums="1" title="if-elif-else语句"
x = 7
if x < 5:
    print("x 小于 5")
elif x < 10:
    print("x 大于或等于 5 且小于 10")
else:
    print("x 大于或等于 10")
```

### 1.4 三元运算符

三元运算符（也称为条件表达式）可以在一行代码中实现简单的 `if-else` 逻辑。

```python linenums="1" title="三元运算符"
x = 8
result = "x 大于 5" if x > 5 else "x 小于或等于 5"
print(result)
```

### 1.5 嵌套 if 语句

嵌套 `if` 语句允许在一个 `if` 语句中包含另一个 `if` 语句。下面例子中，只有当 `x > 5` 和 `y > 15` 都为 `True` 时，才会打印出 `"x 大于 5 且 y 大于 15"`。

```python linenums="1" title="嵌套 if 语句"
x, y = 10, 20
if x > 5:
    if y > 15:
        print("x 大于 5 且 y 大于 15")
```

### 1.6 小结

> 保持条件简洁明了

: 尽量使用简单、易懂的条件。例如，避免使用过于复杂的布尔表达式，以免代码难以理解和维护。

> 避免不必要的嵌套

: 过多的嵌套会使代码变得复杂，降低可读性。如果可能，尽量使用 `if-elif-else` 语句来简化嵌套。

## 2. for

`for` 循环是一种强大且常用的控制流结构，它允许我们遍历可迭代对象（如列表、元组、字符串等）中的元素。掌握 `for` 循环的使用对于编写高效、简洁的 Python 代码至关重要。

!!! note "可迭代对象"

    可迭代对象是指可以被迭代（遍历）的对象，常见的可迭代对象包括：列表（list）、元组（tuple）、字符串（str）、字典（dict）、集合（set）。

### 2.1 简单遍历

```python linenums="1"
# 列表
fruits = ["apple", "banana", "cherry"]
for fruit in fruits:
    print(fruit)

# 字符串
message = "Hello"
for char in message:
    print(char)

# 字典
person = {"name": "John", "age": 30, "city": "New York"}
for key in person:
    print(key, ":", person[key])
```

`range()` 函数用于生成一个不可变的整数序列，常用于 `for` 循环中控制循环次数。

```python linenums="1"
# 打印 0 到 4 的整数
for i in range(5):
    print(i)

# 打印 2 到 6 的整数
for i in range(2, 7):
    print(i)

# 打印 2 到 10 之间的偶数
for i in range(2, 11, 2):
    print(i)
```

### 2.2 嵌套循环

嵌套循环是指在一个循环体中包含另一个循环。常用于处理二维数据，如矩阵。

```python linenums="1"
for i in range(1, 4):
    for j in range(1, 4):
        print(i * j, end=" ")
    
    print()
```


### 2.3 结合 enumerate 函数

`enumerate()` 函数用于将一个可迭代对象组合为一个索引序列，同时返回元素的索引和值。

```python linenums="1"
fruits = ["apple", "banana", "cherry"]
for index, fruit in enumerate(fruits):
    print(index, ":", fruit)
```

### 2.4 提前终止循环

如果在循环过程中满足某个条件需要提前终止循环，可以使用 `break` 语句。

```python linenums="1"
numbers = [1, 2, 3, 4, 5]
for num in numbers:
    if num == 3:
        break
    print(num)
```

如果在循环过程中需要跳过当前迭代，可以使用 `continue` 语句。

```python linenums="1"
numbers = [1, 2, 3, 4, 5]
for num in numbers:
    if num == 3:
        continue
    
    print(num)
```

### 2.5 for-else

这个例子中，一旦找到目标元素，`break` 语句会被执行，循环终止；如果循环正常结束（没有执行 `break`），则会执行 `else` 子句。

```python linenums="1"
fruits = ["apple", "banana", "cherry", "date"]
target = "cherry"
for fruit in fruits:
    if fruit == target:
        print(f"找到了 {target}")
        break
else:
    print(f"没有找到 {target}")
```

### 2.6 小结

> 避免不必要的嵌套

: 虽然嵌套循环在处理复杂数据结构时很有用，但过多的嵌套会使代码难以理解和维护。尽量将复杂的逻辑拆分成多个函数或使用其他数据结构简化。

> 使用描述性的变量名

: 在 `for` 循环中，使用具有描述性的变量名可以提高代码的可读性。例如，使用 `fruit` 而不是 `x` 来遍历水果列表。

> 合理使用 `else` 子句

: 在 `for` 循环中使用 `else` 子句可以在循环正常结束时执行一些操作，与 `break` 语句结合使用可以更清晰地表达逻辑。

## 3. while

`while` 循环是一种常用的控制流结构，它允许代码块在条件满足的情况下重复执行。然而，在某些特定情况下，我们可能需要提前终止 `while` 循环，以避免不必要的计算或响应特定的条件，Python 提供了 `break` 语句来实现这一目的。

### 3.1 简单示例

在 `while` 循环中使用 `break` 语句非常简单，只需在需要终止循环的条件满足时，使用 `break` 语句即可。

```python linenums="1" 
count = 0
while True:
    count = count + 1
    if count == 5:
        break
    print(count)

print("循环跳出")
```

在上述代码中，`while True` 创建了一个无限循环，因为 `True` 条件始终为真。在循环内部，每次循环 `count` 的值加 1，当 `count` 等于 5 时，`break` 语句被执行，循环终止，程序继续执行 `print("Loop has been broken.")` 这一行代码。

### 3.2 while-else

```python linenums="1"
numbers = [1, 3, 5, 7, 9, 11]
target = 7
index = 0
while index < len(numbers):
    if numbers[index] == target:
        print(f"找到目标元素 {target}，索引为 {index}")
        break
    index += 1
else:
    print(f"未找到目标元素 {target}")
```

这个示例中，我们使用 `while` 循环遍历列表 `numbers`，并在找到目标元素 `target` 时使用 `break` 语句终止循环。如果循环正常结束（即没有找到目标元素），则会执行 `else` 语句块。

### 3.3 实践-用户输入验证

在需要用户输入的场景中，我们可以使用 while 循环结合 break 语句来验证用户输入的有效性。例如，要求用户输入一个大于 0 的整数：

```python linenums="1" title="用户输入验证"
while True:
    try:
        num = int(input("输入一个正整数: "))
        if num > 0:
            print(f"你输入的正整数为：{num}")
            break
        else:
            print("请输入一个正整数！")
    except ValueError:
        print("输入错误，请输入一个正整数！")
```

!!! warning "注意"

    如果在嵌套的 `while` 循环中使用 `break` 语句，要注意 `break` 语句只会跳出最内层的循环。如果需要跳出多层循环，可以考虑使用函数或标志变量来简化逻辑。

### 3.4 小结

> 保持循环条件清晰

: 在使用 `while` 循环和 `break` 语句时，应尽量保持循环条件清晰，避免使用过于复杂的条件。这样可以提高代码的可读性和可维护性。

> 避免过度使用 `break`

虽然 `break` 语句可以方便地提前终止循环，但过度使用会使代码逻辑变得复杂，降低代码的可读性。在可能的情况下，应优先考虑使用更清晰的循环条件来控制循环的终止。

> 使用 `else` 子句

: 在 `while` 循环中，可以使用 `else` 子句来处理循环正常结束的情况。`else` 子句会在循环条件变为 `False` 且没有执行 `break` 语句时执行。

## 4. match ... case

!!! warning "3.10 新特性"

    `match` 语句在 Python 3.10 新增。

模式匹配是一种在数据结构中查找特定模式的技术。在Python中，`match` 语句允许你将一个对象与一系列模式进行比较，当找到匹配的模式时，执行相应的代码块。这种方式使得处理多条件逻辑变得更加直观和高效。

### 4.1 简单示例

=== "简单匹配"

    ```python linenums="1"
    day_of_week = 3

    match day_of_week:
        case 1:
            print("Monday")
        case 2:
            print("Tuesday")
        case 3:
            print("Wednesday")
        case 4:
            print("Thursday")
        case 5:
            print("Friday")
        case 6:
            print("Saturday")
        case 7:
            print("Sunday")
        case _:
            print("Invalid day number")
    ```

=== "元组"

    ```python linenums="1"
    point = (2, 3)

    match point:
        case (0, 0):
            print("Origin")
        case (0, y):
            print(f"On the y-axis at y={y}")
        case (x, 0):
            print(f"On the x-axis at x={x}")
        case (x, y):
            print(f"At coordinates ({x}, {y})")
    ```

=== "字典"

    ```python linenums="1"
    person = {"name": "Alice", "age": 30}

    match person:
    case {"name": "Alice", "age": 30}:
        print("It's Alice, 30 years old!")
    case {"name": name, "age": age} if age < 18:
        print(f"{name} is a minor.")
    case {"name": name, "age": age}:
        print(f"{name} is {age} years old.")

    ```

=== "类实例"

    ```python linenums="1"
    class Shape:
        pass

    class Circle(Shape):
        def __init__(self, radius):
            self.radius = radius

    class Rectangle(Shape):
        def __init__(self, width, height):
            self.width = width
            self.height = height

    shape = Circle(5)

    match shape:
        case Circle(radius) if radius < 1:
            print("Small circle")
        case Circle(radius):
            print(f"Circle with radius {radius}")
        case Rectangle(width, height):
            print(f"Rectangle with width {width} and height {height}")
        case _:
            print("Unknown shape")
    ```

### 4.2 通配符与绑定

`match` 语句支持使用通配符 `_` 来忽略某些值，同时可以通过变量绑定来获取匹配部分的值。在下面这个例子中，`case [1, _, x]` 匹配列表的第一个元素为 1 的情况，`_` 忽略第二个元素，`x` 绑定第三个元素。

```python linenums="1"
def process_list(lst):
    match lst:
        case [1, _, x]:
            print(f"First element is 1, third element is {x}")
        case [_, 2, _]:
            print("Second element is 2")
        case _:
            print("Other list")


process_list([1, 10, 20])
```

### 4.3 实践 

=== "命令行参数"

    使用 `match` 语句可以更清晰地处理命令行参数。

    ```python linenums="1"
    import sys

    args = sys.argv[1:]

    match args:
        case ["--help"]:
            print("Usage: program [--help] [--version]")
        case ["--version"]:
            print("Version 1.0")
        case _:
            print("Invalid arguments")
    ```

=== "状态机"

    状态机是一种常用于处理复杂逻辑的设计模式，`match`语句可以很好地实现状态机。

    ```python linenums="1"
    class StateMachine:
        def __init__(self):
            self.state = "start"

        def transition(self, event):
            match (self.state, event):
                case ("start", "next"):
                    self.state = "middle"
                case ("middle", "next"):
                    self.state = "end"
                case ("end", "reset"):
                    self.state = "start"
                case _:
                    pass

    sm = StateMachine()
    sm.transition("next")
    sm.transition("next")
    sm.transition("reset")
    print(sm.state)
    ```

### 4.4 小结

> 保持模式的简洁性

: 尽量保持模式的简洁和清晰，避免使用过于复杂的模式，以免降低代码的可读性。

> 处理默认情况

: 始终包含 `case _` 来处理默认情况，确保程序在没有匹配到任何模式时也能有合理的行为。

> 避免过度嵌套

: 虽然 `match` 语句可以嵌套，但过度嵌套会使代码变得难以理解和维护，尽量保持逻辑的扁平化。

## 5. break / continue / pass / ...

### 5.1 break

`break` 语句是 Python 中的一个控制流语句，主要用于循环结构（`for` 循环和 `while` 循环）中。当 `break` 语句在循环体中被执行时，它会立即终止当前所在的循环，程序将跳出该循环，并继续执行循环之后的代码。也就是说，一旦遇到 `break` 语句，循环将不再执行剩余的迭代，无论循环条件是否仍然为真。

```python linenums="1"
# for 循环
fruits = ["apple", "banana", "cherry", "date"]
for fruit in fruits:
    if fruit == "cherry":
        break
    print(fruit)

# while 循环
count = 0
while count < 10:
    if count == 5:
        break
    print(count)
    count = count + 1
```

**嵌套循环中的跳出**：`break` 语句在嵌套循环中只会终止它所在的那一层循环。

```python linenums="1"
for i in range(3):
    for j in range(3):
        if j == 1:
            break
        
        print(f"i: {i}, j: {j}")
```


最常见的应用实践是查找特定元素以及避免无限循环。

=== "查找特定元素"

    ```python linenums="1"
    numbers = [10, 20, 30, 40, 50]
    target = 30
    found = False
    for num in numbers:
        if num == target:
            found = True
            break

    if found:
        print(f"找到了目标元素 {target}")
    else:
        print(f"未找到目标元素 {target}")
    ```

=== "避免无限循环"

    ```python linenums="1"
    while True:
    user_input = input("请输入 'quit' 退出：")
    if user_input == "quit":
        break
    print(f"你输入的是：{user_input}")
    ```

> 保持代码的可读性

: 在使用 `break` 语句时，应该确保代码的逻辑清晰，避免在复杂的嵌套循环中过度使用 `break` 语句，以免影响代码的可读性。如果需要在嵌套循环中使用 `break` 语句，可以考虑将内层循环封装成函数，以提高代码的可维护性。

> 结合条件判断使用

: `break` 语句应该与合适的条件判断结合使用，确保在满足特定条件时才终止循环。这样可以使代码更加健壮，避免意外终止循环。

### 5.2 continue

`continue` 语句的作用是中断当前循环的本次迭代，直接进入下一次迭代。当程序执行到 `continue` 语句时，它会忽略该语句之后的所有代码，立即跳转到循环的开始位置，准备执行下一次迭代。这一特性使得我们可以根据特定的条件，有选择地跳过某些不需要执行的代码块。

!!! warning "注意"

    `continue` 语句只能用于循环结构中，非循环结构中将导致错误。

```python linenums="1"
# for 循环
fruits = ["apple", "banana", "cherry", "date"]

for fruit in fruits:
    if fruit == "cherry":
        continue
    print(fruit)

# while 循环
count = 0
while count < 5:
    count += 1
    if count == 3:
        continue
    print(count)
```

下面看 2 个应用实例：

=== "跳过特定元素"

    ```python linenums="1"
    numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    even_numbers = []

    for number in numbers:
        if number % 2!= 0:
            continue
        even_numbers.append(number)

    print(even_numbers)
    ```

=== "条件过滤"

    ```python linenums="1"
    students = [
        {"name": "Alice", "age": 20, "grade": "A"},
        {"name": "Bob", "age": 22, "grade": "C"},
        {"name": "Charlie", "age": 19, "grade": "B"},
        {"name": "David", "age": 21, "grade": "A"}
    ]

    for student in students:
        if student["grade"]!= "A":
            continue
        print(f"{student['name']} has an A grade.")
    ```

> 避免过度使用

: 虽然 `continue` 语句可以使代码逻辑更加清晰，但过度使用可能会导致代码可读性下降。尽量保持循环逻辑的简洁，避免在一个循环中出现过多的 `continue` 语句。如果发现需要频繁使用 `continue`，可能需要重新审视代码结构，考虑是否有更清晰的方式来表达相同的逻辑。

> 结合条件判断优化逻辑

: 在使用 `continue` 语句时，结合合理的条件判断可以使代码更加高效。尽量将条件判断放在循环开始的位置，避免在循环中执行不必要的代码。
