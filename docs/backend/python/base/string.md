# Python字符串

字符串（String）是 Python 最常用的数据类型之一，用于表示文本数据。如果你从事与编程相关的工作，会发现我们经常会用字符串表示各种各样的对象，例如文件的路径、文件夹的名称、用户名、登录密码、执行 SQL等。

现实世界中，文本数据比较复杂，甚至很多存在脏文本数据，熟练使用字符串的操作，可以帮我们从杂乱的数据中提取出我们想要的文本，以形成结构化的数据进行下游应用。当然，我们还会学习到正则表达式，通过强大的正则可以更方便的清洗数据，以及一些常见的 NLP 算法对文本进行更高层级的处理。

## 1. 字符串定义

Python 使用单引号、双引号或三引号（用于多行字符串）定义字符串，接下里我们介绍下字符串的使用方法以及一些注意事项。

=== "单引号与双引号"

    只是定义单文本的话，那么使用单引号或双引号都可以。如果希望在打印文本中输出 `'` 或者 `"` 符号，可以使用转义字符 `\` 或者单双引号混合使用。

    ```python linenums="1" hl_lines="5-6"
    print('单引号：', 'abc')
    print("双引号：", "abc")

    # 输出 ' 符号
    print('输出单引号：', '\'abc', "'abc")
    print('输出双引号：', '\"abc', '"abc')
    ```

=== "三单引号或三双引号"

    三单引号或三双引号多用于书写文档，以及多行字符串的表示。

    ```python linenums="1"
    s3 = '''This is a 
        multi-line string'''  # 三引号

    html = """
        <html>
          <a>123</a>
        </html>
        """  # 三双引号
    print(html)

    def upper_text(text: str) -> str:
        """将文本进行进行大写处理
        :param text: 输入的文本
        """
        return text.upper()
    ```

    此外，我们还可以使用括号来完成多行字符串的输出。

    ```python linenums="1"
    text = (
      'This is a'
      'This is b'
      'This is c \n'  # \n 表示换行
      'This is d'
    )
    print(text)
    ```

上面我们提到了转义字符 `\n` 表示换行，类似的含有很多，例如 `\t` 表示制表符，`\b` 表示退格符，`\r` 表示回车符等。

```python linenums="1" title="转义字符的使用"
print('He said: "Hello!"')  # 输出: He said: "Hello!"
print('Line 1\nLine 2')     # 换行符
print('Tab\tSpacing')       # 制表符
print('Backslash: \\')      # 输出反斜杠本身
```

特别注意的是，Windows下因为文件路径是用 `\` 进行分隔，这与转义字符 `\` 的含义不同，所以 `\` 在 Windows 下需要写成 `\\`。

```python linenums="1" title="Windows下的文件路径"
print('C:\users\admin')   # 报错，因为没有 `\u` 对应的转义符
print('d:\tidy\admin')    #  输出： idydmin
print(r'C:\Users\Admin')  # 输出: C:\Users\Admin
```

## 2. 字符串的操作

常见的字符串操作有：拼接多个字符串、字符串复制、截取字符串中的部分文本、统计字符串的长度等。

### 2.1 切片

切片实际上就是截取部分文本的操作，通常需要指定单个索引值，或者左索引和右索引的值。Python 字符串的下标（索引）时从 0 开始，`-1` 表示取最后一个字符，相应的 `-2` 表示取倒数第二个字符。

```python linenums="1" title="字符串截取"
s = 'Hello World'
print(s[0])  # 输出：H
print(s[10])  # 输出：d，取最后一个字符
print(s[-1])  # 输出：d，取最后一个字符

print(s[:3])  # 输出：Hel，默认下标是从 0 开始
print(s[3:])  # 输出：lo World
print(s[1:3])  # 输出：el

print(s[::-1])  # 输出：dlroW olleH，倒序输出
print(s[4:10:2])  # 输出：oWr，间隔 2 个字符输出
```

此外，Python 奉行左开右闭的原则，切不包含右边位置，如果左右索引相等或者左索引小于右边索引时，输出内容。

```python linenums="1"
print(s[3:3]) # 无输出内容
print(s[4:3]) # 无输出内容
```

切片时左边索引小于 0，或者右边索引大于字符串长度，这种情况下 Python 内置处理。但直接超过访问索引范围，Python 会报错。

```python linenums="1"
s = 'Hello World'
print(s[-100:])
print(s[:100])
print(s[-100:100])

print(s[100:]) # 无输出，类似上面的 s[4:3]
print(s[:-100])  # 无输出，类似上面的 s[4:3]
print(s[-100])  # 报错：数组越界
print(s[100])  # 报错：数组越界
```

### 2.2 拼接多个字符串

通过 `+` 运算符，将多个字符串拼接成一个字符串。同时，字符串内置的 `join` 函数可以将多个字符串拼接成一个字符串。

```python linenums="1" title="字符串拼接"
s1 = 'Hello'
s2 = 'World'
print(s1 + ' ' + s2)  # 输出： Hello World
```

### 2.3 字符串复制

```python linenums="1" title="字符串复制"
s = 'Hello'
print(s * 3)  # 输出： HelloHelloHello
```

### 2.4 统计字符串的长度

使用 `len()` 函数可以获取字符串的长度。

```python linenums="1"
s = 'Hello World'
print(len(s))  # 输出：11，字符串长度
```

### 2.5 字符串的修改

创建的字符串是只读的，**不能进行修改**。如果确实需要修改字符串，那么可以使用 `replace()` 方法。当然也可以创建一个新的字符串，然后进行赋值。

```python linenums="1" title="字符串的修改"
s = 'Hello World'
s[0] = "zzz"  # 报错，不支持修改

# 利用切片创建新的字符串，需要注意的是，这里的变量 `s` 是新创建的变量，不再是原先的 `s` 变量。
s = "zzz" + s[1:]  

# 替换字符串，
s1 = s.replace('World', 'Python')
```

## 3. 字符串的格式化

字符串格式化很优化，因为日常工作中我们输入的内容不总是一成不变的，例如我们今天希望程序读取的 `reoprt-20250624.xlsx`，明天希望读取的 `report-20250625.xlsx`，那么我们就需要使用字符串格式化。

Python 自身提供了 `%` 符号，以及 `.format()` 方法，以及 `f-string` 格式化字符串。当然，一些外部包可能有自定义的格式化字符串，这个到时候看文档学习即可。

### 3.1 `%` 格式化

`%` 表示字符串格式化，`%s` 表示字符串，`%d` 表示数字，以及 `%f` 表示浮点数。需要注意的是，`%` 符号格式化是严格按照传递值的位置。

```python linenums="1"
name = 'Alice'
age = 25
print('My name is %s and I am %d years old.' % (name, age))
# 输出: My name is Alice and I am 25 years old.
```

### 3.2 `format()` 格式化

`format` 函数是字符串格式化的标准函数，`{}` 表示占位符，默认情况下 `format` 函数会按照传递值的位置进行格式化，当然也可以基于变量名以及位置。区别于 `%` 符号格式化，`format` 函数可以进行字符串进一步的格式化（例如，数字格式化，以及浮点数格式化），且可以在模板字符串中中指定格式话的变量的位置。

```python linenums="1"
print('My name is {} and I am {} years old.'.format(name, age))
# 输出: My name is Alice and I am 25 years old.

# 通过索引进行格式化
print('{0} loves {1}'.format('Bob', 'Python'))  # Bob loves Python
print('{1} loves {0}'.format('Bob', 'Python'))  # Python loves Bob
print('{0} loves {1}, {1} loves {0} too.'.format('Bob', 'Python'))  # Bob loves Python, Python loves Bob too.

# 格式化变量的二次格式化
print('{0:.2f}'.format(3.1415926))

# 直接使用变量名，则会按照变量名引用进行格式化
name, age = 'Alice', 25
print('My name is {name} and I am {age} years old, my sister is {age} too'.format(name=name, age=age))
```

### 3.3 f-strings

f-strings 是 Python 3.6 新增的字符串格式化方法，使用起来更方便，并且速度更快。它使用变量进行格式话，所以 **变量一定得存在**，且变量支持二次格式化输出。同时也支持的表达式调用，是最常用的格式化方法。

```python linenums="1"
name, age = 'Alice', 25.1234
print(f'{name = }')
print(f'{name = !s}')
print(f'My name is {name} and I am {age} years old.')
# 输出: My name is Alice and I am 25.1234 years old.
print(f'My name is {name} and I am {age:.2f} years old.')
# 输出: My name is Alice and I am 25.12 years old.

# 表达式计算
x, y = 10, 20.12
print(f'The sum is {x + y}')  # 输出: The sum is 30
print(f'{y = :.2f}')  # 输出: x = 10
print(f'{x + y = }')  # 输出: x + y = 30
print(f'{bool(x) = }')  # 输出: bool(x) = True

# 格式化对象
banana: str ='
name: str = 'Bob'
today: date = datetime.now().date()
print(f'[{date!s}] {name!s} says: {banana!s}')
print(f'[{date!r}] {name!r} says: {banana!r}')
print(f'[{date!a}] {name!a} says: {banana!a}')

# 打印格式化时间
from datetime import datetime

fmt = '%Y-%m-%d'
print(f'The current time is {datetime.now():{fmt}}')
print(f'The current time is {datetime.now():%Y-%m-%d %H:%M:%S}')
# 输出: The current time is 2025-06-24 15:04:05
print(f'The current time is {datetime.now():%c}')
print(f'The current time is {datetime.now():%I%p}')

# 科学计算法
n1 = 100000
n2 = 100000.1234
print(f'{n1:_}', ' ' , f'{n1:,}', ' ', f'{n2:_.2f}', ' ', f'{n2:_.2e}')

# 填充字符
var = 'abc'
print(f'{var:>20}:')  # 右对齐，左侧填充 17 个空格
print(f'{var:<20}:')  # 左对齐
print(f'{var:^20}:')  # 居中对齐

# 指定填充字符
print(f'{var:_>20}:')  # 右对齐，左侧填充 17 个空格
print(f'{var:|<20}:')  # 左对齐
print(f'{var:#^20}:')  # 居中对齐
```

## 4. 字符串的自带方法

字符串本身就内置了很多方法，比如 `upper()`, `lower()`, `strip()`, `replace()`, `split()`, `join()`, `format()` 等等。

| 方法 | 描述 |
| --- | --- |
| `index()`、`rindex()` | 返回指定字符在字符串中的索引 |
| `count()` | 返回指定字符在字符串中出现的次数 |
| `find()`、`rfind()` | 返回指定字符在字符串中的索引 |
| `startswith()`、`endswith()` | 检查字符串是否以指定字符开头（结尾）|
| `upper()`、`lower()`、`swapcase()`、`title()`、`capitalize()` | 将字符串中进行转换为大小写 |
| `strip()`、`lstrip()`、`rstrip()` | 移除字符串中的空格，`lstrip()` 是移除左侧空格，`rstrip()` 是移除右侧空格 |
| `replace()` | 替换字符串中的字符 |
| `split()`、`rsplit()`、`splitlines()` | 将字符串按指定字符分割成列表 |
| `join()` | 将列表中的元素连接成一个字符串 |
| `format()`、`format_map()`  | 格式化字符串 |
| `encode()`、`decode()` | 将字符串编码（解码）成字节 |
| `partition()`、`rpartition()` | 搜索指定分隔符 |
| `zfill()` | 在字符串的左侧填充指定字符 |
| `center()`、`ljust()`、`rjust()` | 在字符串的指定位置填充指定字符 |
| `maketrans()`、`translate()` | 创建字符映射转换表，可批量替换多个字符 |
| `isdigit()` | 判断字符串是否只包含数字 |
| `isalpha()` | 判断字符串是否只包含字母 |
| `isdecimal()` | 判断字符串是否只包含十进制数字 |
| `isalnum()` | 判断字符串是否只包含数字 |
| `istitle()` | 判断字符串是否每个单词首字母大写 |
| `isupper()` | 判断字符串是否只包含大写字母 |
| `islower()` | 判断字符串是否只包含小写字母 |
| `isnumberic()` | 判断字符串是否只包含数字 |
| `isprintable()` | 判断字符串是否只包含空格 |
| `isspace()` | 判断字符串是否只包含空格 |

### 4.1 join

`join()` 方法用于将序列中的元素以指定的字符连接生成一个新的字符串。

```python linenums="1"
print(",".join(["a", "b", "c"]))  # 输出：a,b,c

# 连接对象必须先转成字符串
print("-".join([1, 2, 3]))
print("-".join(map(str, [1, 2, 3])))  # 使用 map 将元素转成字符串
```

### 4.2 count

`count()` 方法用于统计字符串中某个字符出现的次数。

```python linenums="1"
print("hello world".count("l"))   # 输出： 3
```

### 4.3 replace

`replace()` 方法用于替换字符串中某个字符或子串。

```python linenums="1"
print("hello world".replace("l", "L"))  # 输出：hello WorLd
```

同时 `replace()` 函数也可以接受一个可选的参数 `count`，用于指定替换的次数，默认值为 `-1`，全量进行替换。

```python linenums="1"
print("hello world".replace("l", "L", 2))  # 输出：heLLo World
```

### 4.4 zfill / center / ljust / rjust

- `zfill()` 函数用于将字符串填充为指定长度，填充的字符为 `0`。
- `center()` 函数用于将字符串居中填充为指定长度，填充的 character 为 `' '`。
- `ljust()` 函数用于将字符串左对齐填充为指定长度，填充的 character 为 `' '`。
- `rjust()` 函数用于将字符串右对齐填充为指定长度，填充的 character 为 `' '`。


```python linenums="1"
s = "abc"
print(s.zfill(10))  # 0000000abc

print(s.center(10))
print(s.center(10, '@'))  # 输出：@@@abc@@@@

print(s.ljust(10, '-'))  # 输出：abc-------
print(s.rjust(10, '#'))  # 输出：###abc####
```

### 4.5 index / rindex

`index` 和 `rindex` 都是查找字符串中某个字符的位置，区别在于 `index` 是从左往右查找， `rindex` 是从右往左查找。

```python linenums="1" title="查找字符"
s = "abcdefcg"
print(s.index('c'))  # 输出：2
print(s.rindex('c')) # 输出：6
```

### 4.6 find / rfind

`find` 和 `rfind` 函数功能类似，区别在于 `find` 是从左往右查找， `rfind` 是从右往左查找。

```python linenums="1" title="查找字符"
s = "abcdefcg"
print(s.find('c'))  # 输出：2
print(s.rfind('c')) # 输出：6
print(s.find('z'))  # 输出：-1
```

### 4.7 upper / lower / swapcase / title / capitalize

- `upper` 函数将字符串中的所有字符转为大写；
- `lower` 函数将字符串中的所有字符转为小写；
- `swapcase` 函数将字符串中的所有字符转为大写或小写；
- `title` 函数将字符串中的每个单词的第一个字母转为大写；
- `capitalize` 函数将字符串中的第一个字母转为大写。

```python linenums="1" title="大小写转换"
print('hello world'.upper())  # 输出：HELLO WORLD
print('HELLO world'.lower())  # 输出：hello world
print('HELLO world'.swapcase())  # 输出：hello WORLD
print('hello world'.title())  # 输出：Hello World
print('hello world'.capitalize())  # 输出：Hello world
```

### 4.8 split / rsplit / splitlines"

- `split` 函数：将字符串（默认为空格和换行符）按指定字符进行分割，返回一个列表;
- `rsplit` 函数：与 `split` 类似，只是从字符串的右边开始分割;
- `splitlines` 函数：将字符串按行进行分割，返回一个列表。

```python linenums="1"
s = 'hello world\nhello world'

# split：参数 maxsplit 用于最大分割次数，默认为 -1，即不限制
print(s.split())  # 输出：['hello', 'world', 'hello', 'world']
print(s.split(' '))  # 输出：['hello', 'world\nhello', 'world']
print(s.split(' ', 1))  # 输出：['hello', 'world\nhello world']

# rsplit：参数 maxsplit 用于最大分割次数，默认为 -1，即不限制
print(s.rsplit())  # 输出：['hello', 'world', 'hello', 'world']
print(s.rsplit(' '))  # 输出：['hello', 'world\nhello', 'world']
print(s.rsplit(' ', 1))  # 输出：['hello world\nhello', 'world']

# splitlines：设置为 True，则按行进行分割
print(s.splitlines())  # 输出：['hello world', 'hello world']
print(s.splitlines(True))  # 输出：['hello world\n', 'hello world']
```

### 4.9 strip / rstrip / lstrip

- `strip` 函数用于去除字符串的开头和结尾的空格；
- `rstrip` 函数用于去除字符串的结尾的空格；
- `lstrip` 函数用于去除字符串的开头的空格。

```python linenums="1" title="去除空格"
print(' hello world '.strip())
print(' hello world '.rstrip())
print(' hello world '.lstrip())
```

### 4.10 format / format_map

`format` 是字符串格式化方法，`format_map` 是字符串格式化方法，`format_map` 可以使用字典进行格式化。

```python linenums="1" title="格式化"
# format
print('hello {name}'.format(name='world'))
print('hello {}'.format('world' ))
print('hello {} {}'.format('world', 'python'))
print('hello {0} {1}'.format('world', 'python'))

# format_map：如果格式化变量不存在，则报错
print('hello {name}'.format_map({'name': 'world'}))
print('hello {age}'.format_map({'name': 'world'}))  # 报错
```

### 4.11 startswith / endsiwth

`startswith()` 和 `endswith()` 方法用于判断字符串是否以指定字符开头（结尾）：

```python linenums="1"
s = "Hello World"
print(s.startswith("He"))  # True
print(s.endswith("ld"))  # True
```

此外，这两个函数还支持判断字符串指定切片是否以指定字符开头（结尾）：

```python linenums="1" title="支持切片匹配"
s = "Hello World"
print(s.startswith("He", 0, 3))
print(s.endswith("ld", 5, 10))
```

### 4.12 partition / rpartition

`partition()` 方法用于搜索指定分隔符，返回一个元组，包含分隔符左边的字符串、分隔符本身、分隔符右边的字符串，其中 `rpartition()` 是从右边开始搜索进行分隔。

```python linenums="1"
s1 = "http://www.w3cschool.cc/"
print(s.partition("://"))  # 输出：('http', '://', 'www.w3cschool.cc/')
print(s.partition("www")) # 输出：('http://', 'www', '.w3cschool.cc/')

s2 = "aabbccadbb"
print(s2.rpartition("bb"))  # 输出：('aabbccad', 'bb', '')
print(s2.rpartition("d"))  # 输出：('aabbcca', 'd', 'bb')
```

### 4.13 maketrans / translate

`maketrans()` 方法用于给 `translate()` 方法创建字符映射转换表，它被 `str` 对象调用，返回一个转换表。需要注意的是，它只支持单一字符映射，不支持多字符子串 → 多字符子串 的映射（比如 `'th' → '7'` 或 `'is' → 'zz'` 这种）。。

```python linenums="1"
intab = "aeiou"
outtab = "12345"
deltab = "thw"

trantab1 = str.maketrans(intab, outtab)  # 创建字符映射转换表
trantab2 = str.maketrans(intab, outtab, deltab)  # 创建字符映射转换表，并删除指定字符

test = "this is string example....wow!!!"
print(test.translate(trantab1))  # 输出：th3s 3s str3ng 2x1mpl2....w4w!!!
print(test.translate(trantab2))  # 输出：3s 3s sr3ng 2x1mpl2....4!!!
```

### 4.14 isalpha / isprintable / isspace

### 4.15 istitle / isupper / islower

### 4.16 isdigit / isdecimal / isalnum / isnumberic


## 5. 字符串的编码问题

Python3 中字符串默认使用 `utf-8` 编码，很多时候我们发现拿到的文本输出是乱码（尤其是 Windows 记事本中的文本内容放到 Linux 或者 MacOS 上输出文件内容时，经常会出现这个问题），那么我们需要对字符串进行转义。

```python linenums="1"
greet = '你好'
# 编码为bytes
greet_utf8 = greet.encode('utf-8')  # b'\xe4\xbd\xa0\xe5\xa5\xbd'
greet_gbk = greet.encode('gbk')    # b'\xc4\xe3\xba\xc3'

# 解码为字符串
print(greet_utf8.decode('utf-8'))  # 你好
print(greet_gbk.decode('gbk'))    # 你好
```
