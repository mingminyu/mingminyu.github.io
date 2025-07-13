# Python异常处理

在 Python 编程中，错误处理是确保程序健壮性和稳定性的关键部分。`try` 语句是 Python 用于异常处理的核心机制之一，它允许我们捕获并处理程序运行时可能出现的错误，避免程序因异常而崩溃。

## 1. 异常处理的方式

在 Python 中，异常是程序执行过程中出现的错误。当 Python 解释器遇到无法处理的情况时，就会抛出一个异常。例如，当我们试图除以零或者访问不存在的列表元素时，Python 会抛出相应的异常。

```python linenums="1"
try:
    # 可能会抛出异常的代码块
    pass
except ExceptionType:
    # 处理特定类型异常的代码块
    pass
else:
    # 如果 try 代码块中没有抛出异常，执行此代码块
    pass
finally:
    # 无论 try 代码块中是否抛出异常，都会执行此代码块
    pass
```

### 1.1 抛出异常

可以使用 `raise` 抛出异常，经常在代码调试中经常使用，特别是在进行一些清理或记录后需要继续向上层传递异常时。

```python linenums="1"
x = 10
if x < 4:
    raise ValueError('x 必须大于等于 4')
```

### 1.2 try-except

`try` 语句用于捕获和处理异常，它允许我们将可能会抛出异常的代码块放在 `try` 子句中，然后使用 `except` 子句来捕获并处理这些异常。如果 `try` 子句中的代码没有抛出异常，`except` 子句将被跳过；如果抛出了异常，`try` 子句中的代码将立即停止执行，控制权将转移到匹配的 `except` 子句中。

```python linenums="3 8"
try:
    num = 10 / 0  # 这里会抛出 ZeroDivisionError 异常
except ZeroDivisionError:
    print("不能除以零！")

try:
    num = 10 / 0  # 这里会抛出 ZeroDivisionError 异常
except:  #(1)
    print("不能除以零！")
```

### 1.3 多个 except 子句

我们可以使用多个 `except` 子句来捕获不同类型的异常。

```python linenums="1" hl_lines="4 6"
try:
    num = int("abc")  # 这里会抛出 ValueError 异常
    result = 10 / num
except ValueError:
    print("输入的不是有效的整数！")
except ZeroDivisionError:
    print("不能除以零！")
```

### 1.4 else 子句

`else` 子句在 `try` 子句中的代码没有抛出异常时执行。

```python linenums="1" hl_lines="8"
try:
    num = int("5")
    result = 10 / num
except ValueError:
    print("输入的不是有效的整数！")
except ZeroDivisionError:
    print("不能除以零！")
else:
    print(f"结果是: {result}")
```

### 1.5 `finally` 子句

`finally` 子句无论 `try` 子句中是否抛出异常都会执行。

```python linenums="1" hl_lines="10"
try:
    num = int("5")
    result = 10 / num
except ValueError:
    print("输入的不是有效的整数！")
except ZeroDivisionError:
    print("不能除以零！")
else:
    print(f"结果是: {result}")
finally:
    print("无论是否发生异常，这里都会执行。")
```

## 2. 自定义异常

我们可以自定义异常类，然后在 `try` 语句中捕获这些异常。

```python linenums="1"
class MyCustomError(Exception):
    pass

try:
    raise MyCustomError("这是一个自定义异常！")
except MyCustomError as e:
    print(e)
```

## 3. 嵌套异常处理

嵌套 `try-except` 指的是在一个 `try` 或 `except` 块内部再嵌套另一个 `try-except` 结构。这可以帮助我们处理复杂的错误情况，当内层的 `try` 块无法处理异常时，异常会向外层传递，由外层的 `except` 块继续处理。

```python linenums="1"
try:
    # 外层 try 块
    outer_variable = 10 / 0  # 这里会引发 ZeroDivisionError
    try:
        # 内层 try 块
        inner_variable = int('abc')  # 这里会引发 ValueError
    except ValueError:
        print("内层 try 捕获到 ValueError 异常")
except ZeroDivisionError:
    print("外层 try 捕获到 ZeroDivisionError 异常")
```

在这个示例中，外层 `try` 块中的 `10 / 0` 会引发 `ZeroDivisionError`，因此不会执行内层的 `try` 块，而是直接跳转到外层的 `except` 块处理该异常。

## 3.实践

### 3.1 记录异常日志信息

在处理异常时，最好记录异常的详细信息，以便后续调试。

```python linenums="1" hl_lines="10"
import logging

try:
    num = int("abc")
except ValueError as e:
    logging.error(f"发生了 ValueError 异常: {e}")
```

### 3.2 与文件操作结合

在处理文件时，打开文件、读取或写入数据都可能引发异常。`try-else` 可以帮助我们在文件操作成功完成后执行额外的逻辑。

```python linenums="1"
try:
    file = open('example.txt', 'r')
    content = file.read()
    file.close()
except FileNotFoundError:
    print("文件未找到")
else:
    print(f"文件内容: {content}")
```

### 3.3 与数据库操作结合

在进行数据库查询、插入等操作时，也可能出现各种异常，`try-else` 可以确保在数据库操作成功后进行必要的后续处理。

```python linenums="1"
import sqlite3

try:
    conn = sqlite3.connect('example.db')
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM users')
    rows = cursor.fetchall()
    conn.close()
except sqlite3.Error as e:
    print(f"数据库错误: {e}")
else:
    for row in rows:
        print(row)
```

### 3.4 处理网络请求异常

在进行网络请求时，可能会遇到网络连接失败、超时等异常。嵌套 `try-except` 可以帮助我们更好地处理这些异常。

```python linenums="1"
import requests

try:
    response = requests.get("https://www.example.com")
    response.raise_for_status()  # 检查响应状态码
    print(response.text)
except requests.exceptions.HTTPError as http_err:
    print(f"HTTP 错误：{http_err}")
except requests.exceptions.RequestException as req_err:
    print(f"请求错误：{req_err}")
```

### 3.5 重试机制

在每次重试之间增加一定的延迟，避免短时间内频繁重试，给系统一些恢复的时间：

```python linenums="1"
import time
import requests

max_attempts = 3
url = "https://example.com"

for attempt in range(max_attempts):
    try:
        response = requests.get(url)
        response.raise_for_status()
        print("请求成功:", response.text)
        break
    except requests.RequestException as e:
        print(f"第 {attempt + 1} 次请求失败，原因：{e}")
        if attempt < max_attempts - 1:
            time.sleep(2)  # 等待 2 秒后重试
else:
    print("达到最大尝试次数，请求失败")
```



## 4. 小结

只捕获必要的异常

: 在编写 `try` 语句时，应该只捕获那些你预期会发生的异常。这样可以避免捕获到一些不应该捕获的异常，从而更好地调试程序。

保持 `try` 代码块的简洁

: `try` 代码块应该只包含可能会抛出异常的代码，避免将过多的代码放在 `try` 代码块中，这样可以提高代码的可读性和可维护性。

避免过度使用

: 虽然 `try-else` 提供了灵活的异常处理机制，但不应过度使用。尽量在编写代码时提前进行条件判断，避免不必要的异常捕获。例如，在进行除法运算前，可以先检查除数是否为零，而不是依赖异常处理。

清晰的异常处理

: 在 `except` 子句中，要明确处理每种可能的异常，避免使用通用的异常捕获。这样可以提高代码的可读性和可维护性。同时，`else` 块中的代码应该与 `try` 块的成功执行逻辑紧密相关，不要包含与异常处理无关的复杂逻辑。

使用 `finally` 确保资源释放

: 如果需要确保资源无论在何种情况下都会释放，`finally` 是必不可少的。
