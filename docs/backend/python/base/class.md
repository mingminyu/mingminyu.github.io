# Python类

在 Python 编程中，类（class）是一个核心概念，它是面向对象编程（OOP）的基础构建代码块。通过类，我们可以将对象的 **属性** 和操作这些数据的 **方法**（函数）封装在一起，实现代码的模块化和可重用性。

另外一个最常见的概念就是对象，它是类的实例。当我们根据类及其参数创建一个具体的实例时，就得到了一个对象。每个对象都有自己独立的属性值，并且可以调用类中定义的方法。

## 1. 类的定义和使用

### 1.1 属性和方法

```python linenums="1" title="定义类"
class Person:
    def __init__(self, name: str, age: int):
        self.name = name
        self.age = age

    def introduce(self):
        print(f"Hello, my name is {self.name} and I am {self.age} years old.")


# 创建一个 Person 对象
p1 = Person("Alice", 25)

# 调用对象的方法
p1.introduce()

p2 = Person("Alice", 25)
p2.introduce()

print(p1 == p2)  # 输出：False
```

在这个示例中，`Person` 类有两个属性：`name` 和 `age`，以及一个方法 `introduce`。`__init__` 是一个特殊的方法，称为构造函数，它在创建对象时自动调用。

要实例化一个 `Person` 类，我们只需要调用类名并传递必要的参数。创建好的对象 `p1` 可以通过 `p1.introduce()` 来调用 `introduce` 方法。

### 1.2 类属性

类属性是类的所有实例共享的属性，而实例属性是每个实例独有的属性。

```python linenums="1"
class Counter:
    # 定义类变量
    count = 10

    def __init__(self, name: str):
        self.name = name

# 创建类的实例
c1 = Counter()
c2 = Counter()

# 访问类变量
print(c1.count)  # 输出: 10
print(c2.count)  # 输出: 10
```

类变量可以用于存储所有实例都需要共享的数据。例如，我们可以使用类变量来记录类的实例数量：

```python linenums="1"
class Counter:
    # 类变量，用于记录实例数量
    global_count = 0

    def __init__(self):
        # 每次创建实例时，实例数量加 1
        Counter.global_counts += 1

# 创建类的实例
c1 = Counter()
c2 = Counter()

# 输出实例数量
print(Counter.global_count)  # 输出: 2
```

在上述代码中，`global_count` 是一个类变量，它被所有实例共享。每次创建实例时，`global_count` 的值都会加 1。

### 1.3 文档字符串

文档字符串用于描述类、方法的功能和使用方法。可以使用 `__doc__` 属性来访问文档字符串。

```python linenums="1"
class Rectangle:
    """
    表示一个矩形类
    """
    def __init__(self, length, width):
        """
        初始化矩形的长和宽
        :param length: 矩形的长
        :param width: 矩形的宽
        """
        self.length = length
        self.width = width

    def area(self):
        """
        计算矩形的面积
        :return: 矩形的面积
        """
        return self.length * self.width

# 访问文档字符串
print(Rectangle.__doc__)
print(Rectangle.area.__doc__)
```

## 2. 继承

### 2.1 继承单个类

类的继承允许我们创建一个新类，该类继承了另一个类的属性和方法。以下是一个简单的继承示例：

```python linenums="1" hl_lines="11"
class Person:
    def __init__(self, name: str, age: int):
        self.name = name
        self.age = age

    def introduce(self):
        print(f"Hello, my name is {self.name} and I am {self.age} years old.")

class Student(Person):
    def __init__(self, name: str, age: int, student_id: str):
        super().__init__(name, age)
        self.student_id = student_id

    def study(self):
        print(f"{self.name} with student ID {self.student_id} is studying.")


# 实例化 Student 类
s1 = Student("Charlie", 20, "s12345")
s1.introduce()
s1.study()
```

在这个示例中，`Student` 类继承了 `Person` 类的属性和方法，并添加了一个新的属性 `student_id` 和一个新的方法 `study`。

### 2.2 继承多个类

继承多个类，可以通过多个类名（用逗号隔开），这样我们的类就可以继承多个类的属性和方法。

```python linenums="1"
class Furniture:
    def __init__(self, material: str, furniture_id: int, cost: float):
        self.material = material
        self.id = furniture_id
        self.cost = cost

    def description(self):
        return f"家具编号：{self.id}，主要材料：{self.material}，成本价： ${self.cost}。"

    def assemble(self):
        print(f"家具 {self.id} 已被组装好。")

# 子类
class Chair(Furniture):
    def __init__(self, material: str, furniture_id: int, cost: float):
        super().__init__(material, furniture_id, cost)

    def set_number_of_legs(self, number_of_legs):
        self.number_of_legs = number_of_legs
        
    def description(self):
        return super().description() + f"共有 {self.number_of_legs} 条腿。"

    def add_pillow(self):
        print(f"靠枕已被安装在椅子 {self.id} 上。")

# 另一个子类
class Table(Furniture):
    def __init__(self, material: str, furniture_id: int, cost: float):
        super().__init__(material, furniture_id, cost)

    def set_shape(self, shape: str):
        self.shape = shape
        
    def description(self):
        return super().description() + f"桌子形状： {self.shape}。"

    def lay_tablecloth(self):
        print(f"已经为桌子 {self.id} 铺设了桌布。")

# 多重继承，同时继承了 Chair 和 Table
class ChairWithTableAttached(Chair, Table):
    def __init__(self, material, furniture_id, cost):
        super().__init__(material, furniture_id, cost) 

    # 重写 description 方法
    def description(self):
        # 下面直接使用类名调用了父类中的方法，这里没办法使用 super()函数，
        # 因为这里要使用多个父类，而 super()函数只能返回其中一个父类
        chair_desc = Chair.description(self)  
        table_desc = Table.description(self)  
        return f"椅子部分：{chair_desc}  桌子部分：{table_desc}"

# 示例
item = ChairWithTableAttached("实木", 101, 150.00)
item.set_number_of_legs(4)
item.set_shape("圆形")

print(item.description())
item.assemble()
item.add_pillow()
item.lay_tablecloth()
```

### 2.3 抽象方法类

抽象类（Abstraction）指的是从多个不同的类中抽取出共同的特性，形成一个更为通用、概括的概念或模型。这个概念或模型，可以表现为一个抽象类。在这个类中，我们定义共同的属性和行为，但不必关注具体的实现细节。通过抽象，可以让设计出来的系统降低复杂性。通过隐藏不必要的细节，只展现最关键的特性，抽象可以让我们更容易理解和设计系统。并且通过定义通用的属性和行为，可以避免在多个地方重复相同的代码。在基于抽象的类上，将会更容易进行扩展或重写，形成各种具体的子类。

比如：当我们考虑设计一个宠物店的系统时，在这个系统中，有多种动物，如猫、狗。尽管这些动物有很多不同的特性，但它们也有一些共同点。例如，每种动物都有一个名字，都需要吃食物，都可以发出声音。这些共同点，就可以抽象成为一个“动物”抽象类：

```python linenums="1"
from abc import ABC, abstractmethod

class Animal(ABC):
    def __init__(self, name):
        self.name = name

    @abstractmethod
    def eat(self):
        pass

    @abstractmethod
    def speak(self):
        pass

class Dog(Animal):
    def speak(self):
        return "汪汪！"

class Cat(Animal):
    def speak(self):
        return "喵喵！"
```

在这个 `Animal` 类中，我们定义了共同的属性 `name`，以及两个方法 `eat` 和 `speak`。但是，我们并没有为这些方法提供具体的实现，只是留下了一个占位符。


## 3. 多态

多态是指同一个操作作用于不同的对象会得到不同的结果，比如。

```python linenums="1"
class Animal:
    def speak(self):
        pass

class Dog(Animal):
    def speak(self):
        print("汪汪汪")

class Cat(Animal):
    def speak(self):
        print("喵喵喵")

# 创建不同的对象
dog = Dog()
cat = Cat()

# 调用相同的方法
dog.speak()
cat.speak()
```

在这个例子中，`Dog` 和 `Cat` 类都继承了 `Animal` 类的 `speak` 方法，但它们对该方法做出了不同的实现。


## 4. 静态方法和类方法

### 4.1 静态方法 

如果在实现某个功能时，不需要访问实例或类的任何属性，那么应该使用静态方法。静态方法如果放在类的外面，作为一个普通函数，功能上也不会有任何区别。放在类里面更多的是为了实现类的封装，相关的方法和数据应该尽量组织在一起。

静态方法使用 `@staticmethod` 装饰器来声明。它的使用方法与类方法相同。比如，我们可以为 Animal 类添加一个静态方法，根据动物的叫声来判断动物是否健康。它不需要用到任何类或实例的属性，仅根据输入的声音做判断：

```python linenums="1"
class Animal:
    @staticmethod
    def is_healthy(sound):
        return sound != "silent"

# 使用静态方法
sound = "barking"
print(Animal.is_healthy(sound))   输出： True
```

静态方法非常适合存放一些公共函数、常用的工具函数、辅助函数等。这样不需要创建对象，这些函数即可被其它代码调用。比如下面的示例中，一个作为工具函数的计算两点间距离的函数设置为了静态方法：

```python linenums="1"
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    @staticmethod
    def distance(p1, p2):
        """计算两点之间的距离"""
        return ((p1.x - p2.x)**2 + (p1.y - p2.y)**2)**0.5


p1 = Point(1, 2)
p2 = Point(3, 4)
print(Point.distance(p1, p2))
```

### 4.2 类方法

类方法是绑定到类而不是实例的方法，**可以通过类名直接调用**，不需要实例化对象，我们可以使用类方法来创建不同的构造函数。

```python linenums="1" hl_lines="6-9"
class Person:
    def __init__(self, name: str, age: int):
        self.name = name
        self.age = age

    @classmethod
    def from_string(cls, person_info: str):
        name, age = person_info.split(',')
        return cls(name, int(age))

# 使用 __init__ 方法创建对象
person1 = Person("Alice", 25)
print(person1.name, person1.age)

# 使用类方法创建对象
person_info = "Bob,30"
person2 = Person.from_string(person_info)
print(person2.name, person2.age)
```

## 7. 枚举 enum

`enum` 类似于枚举，但是 `enum` 是一个类，而枚举是一个对象。

```python linenums="1"
from enum import Enum

class Color(Enum):
    RED = 1
    GREEN = 2
    BLUE = 3

print(Color.RED.value)
print(Color.RED.name)
print(Color(1))
print(Color['RED'])
```

## 5. getter 和 setter

`Getter` 和 `Setter` 是一种用于控制属性访问的机制，它可以用来限制对属性的访问和修改。在 Python 中，我们可以使用 `@property` 和 `@setter` 来实现 `Getter` 和 `Setter`。其中 `@property` 装饰器可以将一个方法转换为属性，使得可以像访问属性一样访问方法。

```python linenums="1"
class BankAccount:
    def __init__(self, balance: float):
        self.__balance = balance

    @balance.setter
    def balance(self, amount: float):
        if amount > 0:
            self.__balance += amount
            print(f"Deposited {amount}. New balance: {self.__balance}")
        else:
            print("Invalid deposit amount.")

    @property
    def balance(self) -> str:
        return '有钱' if self.__balance >= 1000 else '没钱'

account = BankAccount(1000)
account.balance = 500
print(account.balance)
```

在这个示例中，`__balance` 是一个私有属性，外部不能直接访问，只能通过 `balance` 方法来获取状态，并通过 `setter` 实现赋值。



## 8. 构造函数

类构造函数是一个非常重要的概念，它是类中的一个特殊方法，用于在创建类的实例时初始化对象的属性。

### 8.1 `__init__`

我们在 `__init__` 方法中初始化对象的属性，确保对象在创建时具有正确的初始状态。当创建一个类的实例时，Python 会自动调用这个方法来初始化对象的属性。`__init__` 方法是类中的一个实例方法，它的第一个参数通常是 `self`，用于引用类的实例本身。`self` 参数之后可以跟随其他参数，用于接收创建实例时传递的值。

```python linenums="1"
class Person:
    def __init__(self, name: str, age: int):
        self.name = name
        self.age = age


# 创建 Person 类的实例
p = Person("Alice", 25)
print(p.name)  # 输出: Alice
print(p.age)   # 输出: 25
```

在这个示例中，`Person` 类有一个构造函数 `__init__`，它接收两个参数 `name` 和 `age`。在构造函数中，将这两个参数的值分别赋给实例的 `name` 和 `age` 属性。

构造函数依然是函数，它的参数可以有默认值，这样在创建实例时可以不传递这些参数。例如：

```python linenums="1"
class Circle:
    def __init__(self, radius=1):
        self.radius = radius

    def area(self):
        return 3.14 * self.radius ** 2

# 创建 Circle 类的实例，不传递参数
c1 = Circle()
print(c1.area())  # 输出: 3.14

# 创建 Circle 类的实例，传递参数
c2 = Circle(5)
print(c2.area())  # 输出: 78.5
```

下面我们看一个实际案例，在 Python 连接 Impala 数据库，并提供执行 SQL 获取结果的功能。

```python linenums="1"
from impala.dbapi import connect

class ImpalaRunner:
    def __init__(self, host: str, port: int, user: str, password: str):
        self.conn = connect(host=host, port=port, user=user, password=password)
        self.cursor = self.conn.cursor()

    def execute(self, sql: str) -> list:
        self.cursor.execute(sql)
        return self.cursor.fetchall()

    def close(self):
        self.conn.close()

# 创建 DatabaseConnection 类的实例
db = ImpalaRunner("localhost", 21050, "admin", "admin")
result = db.execute("SELECT * FROM users")
print(result)
db.close()
```

### 8.2 `__new__`

`__new__` 是一个创建对象的静态方法，它在 `__init__` 之前调用。通常情况下，使用 `__init__` 就足够了，但在某些特殊情况下，如创建单例模式时，可以使用 `__new__` 方法。

```python linenums="1"
class Singleton:
    _instance = None

    def __new__(cls):
        if not cls._instance:
            cls._instance = super().__new__(cls)
        return cls._instance

# 创建 Singleton 类的实例
s1 = Singleton()
s2 = Singleton()
print(s1 is s2)  # 输出 True，说明 s1 和 s2 是同一个对象
```

### 8.3 `__call__`

### 8.4 `__repr__` 和 `__str__`

```python linenums="1"
class Point:
    # 初始化一个新创建的对象
    def __init__(self, x=0, y=0):
        self.x = x
        self.y = y
        print(f"创建点 ({self.x}, {self.y})")

    # 析构方法，当对象被销毁时调用
    def __del__(self):
        print(f"点 ({self.x}, {self.y}) 被销毁")

    # 返回一个“正式”的表示，通常可以用它来重新创建这个对象
    def __repr__(self):
        return f"点 ({self.x}, {self.y})"

    # 返回一个“非正式”的表示，用于打印或日志
    def __str__(self):
        return f"({self.x}, {self.y})"
        
# 测试一下：
p = Point(1, 2)      # 输出: 创建点 (1, 2)
print(p)             # 输出: (1, 2)
print(repr(p))       # 输出: 点 (1, 2)
del p                # 输出: 点 (1, 2) 被销毁
```

在上面的程序中：

- 当一个新对象被创建后，`__init__` 方法就会立刻执行，用于初始化对象的状态。在这里，我们初始化了 x 和 y 两个属性。
- 当对象被销毁（例如，当它不再被引用时）时，`__del__` 方法会被调用。我们的例子中只是打印了一个简单的消息，但在实际的应用中，它可能会被用于释放资源，如关闭文件、断开网络连接等。
- repr() 函数会调用 `__repr__` 方法。它返回一个字符串，表示Python表达式，重新创建这个对象时可以用这个表达式。在我们的例子中，repr(point) 将返回像 Point(1, 2) 这样的字符串。在[打印自身的程序](https://py.qizhen.xyz/miscellaneous#repr-函数)一节，有一个关于这个函数的比较有趣的应用。
- 当我们打印一个对象或将其转化为字符串时，`__str__` 方法会被调用。在我们的例子中，str(point)将返回(1, 2)。

### 8.5 `__del__`

如果有多个变量同时指向一个对象，那么要等到所有指向这个对象的变量都被删除后，才会真正调用 `__del__` 销毁对象。

```python linenums="1"
class Point:
    def __init__(self, x=0, y=0):
        self.x = x
        self.y = y
        print(f"创建点 ({self.x}, {self.y})")

    def __del__(self):
        print(f"点 ({self.x}, {self.y}) 被销毁")

p = Point(1, 2)      # 构造函数被调用
print("=====分割线======")
q = p                # 新变量指向原有对象，构造函数不会被调用
del p                # 还有其它变量指向这个对象，析构函数不会被调用
print("=====分割线======")
del q                # 所有变量均被删除，调用析构函数销毁对象

# 输出：
# 创建点 (1, 2)
# =====分割线======
# =====分割线======
# 点 (1, 2) 被销毁
```

### 8.6 属性访问

属性访问魔法方法用于自定义属性的访问、设置、删除等行为。以下是一些常用的属性访问魔法方法：

- `__getattr__(self, name)`: 当尝试访问一个不存在的属性时调用此方法。
- `__setattr__(self, name, value)`: 设置一个属性的值时调用此方法。
- `__delattr__(self, name)`: 当尝试删除一个属性时调用此方法。
- `__getattribute__(self, name)`: 当尝试访问任何属性时都会调用此方法。

假设我们要创建一个类，该类在设置任何属性时都会存储历史记录，并且我们想要确保某些属性名称不能被设置。

```python linenums="1"
class HistoricalAttributes:
    def __init__(self):
        # 使用字典来存储属性历史记录
        self._history = {}
        self._forbidden_attributes = ["forbidden", "history"]

    def __setattr__(self, name, value):
        # 检查 _forbidden_attributes 是否已定义
        if hasattr(self, '_forbidden_attributes'):
            # 禁止设置某些属性
            if name in self._forbidden_attributes:
                raise AttributeError(f"'{name}' 是一个只读属性。")
            
            # 将属性值添加到历史记录中
            if name not in self._history:
                self._history[name] = []
            self._history[name].append(value)
        
        # 使用超类的__setattr__方法来实际设置属性
        super().__setattr__(name, value)

    def history_of(self, name):
        # 返回属性的历史记录
        return self._history.get(name, [])

# 测试
obj = HistoricalAttributes()
obj.x = 10
obj.x = 20
obj.y = 5
print(obj.history_of('x'))  # 输出：[10, 20]
print(obj.history_of('y'))  # 输出：[5]
# obj.forbidden = 99        # 抛出 AttributeError: 'forbidden' 是一个只读属性。
```

### 8.7 算数运算符

算术魔法方法用于重新定义对象的算术运算符行为。最常用的方法包括：

- `__add__(self, other)`: 定义加法行为。当程序中，使用 + 符号计算加法时，调用的就是对象的这个方法。
- `__sub__(self, other)`: 定义减法行为。
- `__mul__(self, other)`: 定义乘法行为。
- `__truediv__(self, other)`: 定义实数除法行为（Python 3 中的 /）。
- `__floordiv__(self, other)`: 定义整数除法行为（Python 3 中的 //）。
- `__mod__(self, other)`: 定义模除法（取余）行为。
- `__pow__(self, power[, modulo])`: 定义乘方行为。

Python 内置有一个 Fraction 类，它用于表示数学上的分数。我们下面编写一个简化版的 Fraction 类，用它来演示算术魔法方法的实现与使用。Fraction 类有两个属性分别表示分子和分母。它的实现方法如下：


```python linenums="1"
from math import gcd

class Fraction:
    def __init__(self, numerator, denominator=1):
        if denominator == 0:
            raise ValueError("分母不能为 0！")
        
        common = gcd(numerator, denominator)
        self.numerator = numerator // common
        self.denominator = denominator // common

    def __add__(self, other):
        new_numerator = self.numerator * other.denominator + other.numerator * self.denominator
        new_denominator = self.denominator * other.denominator
        return Fraction(new_numerator, new_denominator)

    def __sub__(self, other):
        new_numerator = self.numerator * other.denominator - other.numerator * self.denominator
        new_denominator = self.denominator * other.denominator
        return Fraction(new_numerator, new_denominator)

    def __mul__(self, other):
        new_numerator = self.numerator * other.numerator
        new_denominator = self.denominator * other.denominator
        return Fraction(new_numerator, new_denominator)

    def __truediv__(self, other):
        new_numerator = self.numerator * other.denominator
        new_denominator = self.denominator * other.numerator
        return Fraction(new_numerator, new_denominator)

    def __repr__(self):
        return f"{self.numerator}/{self.denominator}"

# 测试代码
f1 = Fraction(3, 4)
f2 = Fraction(5, 6)

print(f"{f1} + {f2} = {f1 + f2}")       # 输出: 3/4 + 5/6 = 19/12
print(f"{f1} - {f2} = {f1 - f2}")       # 输出: 3/4 - 5/6 = -1/12
print(f"{f1} * {f2} = {f1 * f2}")       # 输出: 3/4 * 5/6 = 5/8
print(f"{f1} / {f2} = {f1 / f2}")       # 输出: 3/4 / 5/6 = 9/10
```

需要注意的是，这几个常用的运算符都是二元运算符，是两个对象之间的运算。在运算时，程序调用的是第一个对象的对应方法。以加法为例，在运算 `f1 + f2` 时，它会调用对象 f1 的 `__add__(self, other)` 方法。并且传递给这个方法的参数中，self 是 f1，other 是 f2。

运算符两端的对象可以不是同类型的数据，只要第一个对象的 `__add__` 方法支持就行。比如，我们可以把这个 Fraction 类中的 `__add__` 方法改造一下，让它能够与一个整数相加：

```python linenums="1"
from math import gcd

class Fraction:
    def __init__(self, numerator, denominator=1):
        if denominator == 0:
            raise ValueError("分母不能为 0！")
        
        common = gcd(numerator, denominator)
        self.numerator = numerator // common
        self.denominator = denominator // common

    def __add__(self, other):
        if isinstance(other, Fraction):
            new_numerator = self.numerator * other.denominator + other.numerator * self.denominator
            new_denominator = self.denominator * other.denominator
        elif isinstance(other, int):
            new_numerator = self.numerator + other * self.denominator
            new_denominator = self.denominator
        else:
            raise TypeError("加法运算仅支持 Fraction 或整数类型")
        
        return Fraction(new_numerator, new_denominator)

    def __repr__(self):
        return f"{self.numerator}/{self.denominator}"
        
# 测试代码
frac1 = Fraction(1, 2)
frac2 = Fraction(3, 4)

result1 = frac1 + frac2  # Fraction 类实例相加
result2 = frac1 + 3      # Fraction 类实例与整数相加

print(result1)           # 输出:  5/4
print(result2)           # 输出:  7/2
```

在上面的程序中，`__add__` 方法中检查了 other 参数的数据类型，如果它是另一个分数，那么使用分数的算法；如果它是一个整数，则采用整数的算法。因此，我们可以计算 `frac1 + 3`，分数与整数相加。但是如果试图计算 `3 + frac1` 就会出错，因为 int 对象的 `__add__` 方法并没有实现对 Fraction 对象的支持。

### 8.8 比较运算符

顾名思义，比较魔法方法用于重新定义对象之间的比较行为，常见的比较魔法方法包括：

- `__eq__(self, other)`: 定义等于的行为，使用 `==`。
- `__ne__(self, other)`: 定义不等于的行为，使用 `!=`。
- `__lt__(self, other)`: 定义小于的行为，使用 `<`。
- `__le__(self, other)`: 定义小于或等于的行为，使用 `<=`。
- `__gt__(self, other)`: 定义大于的行为，使用 `>`。
- `__ge__(self, other)`: 定义大于或等于的行为，使用 `>=`。

我们可以继续使用简化的 Fraction 类，比较魔法方法，比较两个分数之间的大小。

```python linenums="1"
from math import gcd

class Fraction:
    def __init__(self, numerator, denominator=1):
        if denominator == 0:
            raise ValueError("分母不能为 0！")
        
        common = gcd(numerator, denominator)
        self.numerator = numerator // common
        self.denominator = denominator // common

    def __eq__(self, other):
        return self.numerator == other.numerator and self.denominator == other.denominator

    def __lt__(self, other):
        # 两个分数a/b 和 c/d的比较，转化为a*d < c*b
        return self.numerator * other.denominator < other.numerator * self.denominator

    def __le__(self, other):
        return self.numerator * other.denominator <= other.numerator * self.denominator

    def __gt__(self, other):
        return self.numerator * other.denominator > other.numerator * self.denominator

    def __ge__(self, other):
        return self.numerator * other.denominator >= other.numerator * self.denominator

    def __repr__(self):
        return f"{self.numerator}/{self.denominator}"

# 测试
f1 = Fraction(1, 2)  # 1/2
f2 = Fraction(3, 4)  # 3/4

print(f1 == f2)  # False
print(f1 < f2)   # True
print(f1 <= f2)  # True
print(f1 > f2)   # False
print(f1 >= f2)  # False
```

### 8.9 类型转换

类型转换魔法方法用于对象的数据类型转换， Python 内置类型转换函数会调用它们。常见的方法包括：

- `__int__(self)`: 使用 int(obj) 时调用。
- `__float__(self)`: 使用 float(obj) 时调用。
- `__bool__(self)`: 使用 bool(obj) 时调用。

我们仍然使用简化的 Fraction 类，用它演示类型转换方法，例如转换为整数、浮点数和布尔值。

```python linenums="1"
class Fraction:
    def __init__(self, numerator, denominator):
        if denominator == 0:
            raise ValueError("分母不能为 0！")
        self.numerator = numerator
        self.denominator = denominator

    def __int__(self):
        # 转换为整数，实际上是分子除以分母的整数结果
        return self.numerator // self.denominator

    def __float__(self):
        # 转换为浮点数
        return self.numerator / self.denominator

    def __bool__(self):
        # 如果分数不为 0，那么为 True，否则为 False
        return self.numerator != 0

    def __str__(self):
        return f"{self.numerator}/{self.denominator}"

# 测试
f = Fraction(3, 4)

print(int(f))     # 0, 因为 3//4 = 0
print(float(f))   # 0.75, 因为 3/4 = 0.75
print(bool(f))    # True, 因为 3/4 = not 0

f_zero = Fraction(0, 1)
print(bool(f_zero))  # False, 因为分子是 0
```

### 8.10 数据结构

容器魔法方法用于定义自定义那种类似于 Python 容器（例如列表、字典）的对象。以下是一些常见的容器魔法方法：

- `__len__(self)`: 返回容器中的元素数。对应于内置函数 len()。
- `__getitem__(self, key)`: 用于访问容器中的元素。对应于 obj[key] 的行为。
- `__setitem__(self, key, value)`: 为容器中的某个元素分配值。对应于 obj[key] = value 的行为。
- `__delitem__(self, key)`: 删除容器中的某个元素。对应于 del obj[key] 的行为。
- `__contains__(self, item)`: 用于检查容器是否包含某个元素。对应于 item in obj 的行为。
- `__iter__(self)`: 返回容器的迭代器。对应于 iter(obj) 的行为。

假设我们要创建一个简单的排序序列类，该类的行为类似 Python 自带的列表的基本功能，独特之处在于它内部的数据总是按大小排序。为了简单起见，我们在其内部用普通列表来保存数据，虽然这样效率不高。

```python linenums="1"
class SortedList:
    def __init__(self, initial_data=None):
        self.data = sorted(initial_data)

    def __len__(self):
        return len(self.data)

    def __getitem__(self, index):
        return self.data[index]

    def __setitem__(self, index, value):
        self.data[index] = value
        self.data.sort()

    def __delitem__(self, index):
        del self.data[index]

    def __contains__(self, value):
        return value in self.data

    def append(self, value):
        self.data.append(value)
        self.data.sort()

    def __iter__(self):
        return iter(self.data)

    def __repr__(self):
        return repr(self.data)

# 测试
lst = SortedList([3, 1, 2])
print(lst)           # [1, 2, 3]
lst.append(0)
print(lst)           # [0, 1, 2, 3]
lst[1] = 5           # 把第一个元素的值改为 5,之后，数据会重新排序
print(lst)           # [0, 2, 3, 5]
del lst[2]
print(lst)           # [0, 2, 5]
```

### 8.11 上下文管理

当使用with语句时，上下文管理器可以保证资源，如文件、网络连接或数据库连接，被正确地获取和释放，无论在上下文中是否出现了异常。两个与此相关的方法分别是：

- `__enter__(self)`： 当执行with语句时被调用。这个方法的返回值被 with 语句的目标（或as子句中的变量）所使用。常用于初始化和返回需要管理的资源。
- `__exit__(self, exc_type, exc_value, traceback)`： 当 with 块的代码执行完毕（或在执行过程中抛出异常时）被调用。如果在 with 块中没有发生异常，exc_type、 exc_value 和 traceback 将会是 None。如果这个方法返回 True，表示压制 with 块中抛出的异常，否则异常会继续传播。

假设， 我们需要编写一个计时器类，这个计时器会在 with 块的代码执行时开始计时，并在代码执行完成后停止计时，然后打印出执行时间。

```python linenums="1"
import time

class Timer:
    def __enter__(self):
        self.start = time.time()
        return self  # 这里的 self 会被 with 语句的 as 子句所使用

    def __exit__(self, exc_type, exc_value, traceback):
        self.end = time.time()
        print(f"耗时: {self.end - self.start:.2f} 秒")
        return False  # 如果发生异常，不要压制它

# 使用示例
with Timer() as t:
    print(t)
    for _ in range(1000000):
        pass

# 输出类似于:耗时: 0.13 秒
```

### 8.12 其他

除了 `__dict__` 和 `__slots__` 外， 还有 `__name__`、`__module__`、`__doc__`、`__bases__`、`__class__` 常用魔术方法，这里不一一进行介绍。


#### `__dict__`

这是一个字典，包含了对象的所有属性。当创建一个对象时，Python 通常会为其创建一个字典来保存所有属性，这样可以在运行时动态地向对象添加新的属性。

```python linenums="1"
class MyClass:
    def __init__(self, x, y):
        self.x = x
        self.y = y

obj = MyClass(1, 2)
print(obj.__dict__)  # 输出：{'x': 1, 'y': 2}

obj.value = 3        # 为对象添加一个新属性
print(obj.__dict__)  # 输出：{'x': 1, 'y': 2, 'value': 3}
```

#### `__slots__`

使用字典保存对象的属性虽然灵活，但字典有额外的内存开销。如果我们已经知道对象只需要固定的几个属性，那么使用 `__slots__` 可以避免这种字典开销，从而更有效地使用内存。定义 `__slots__` 的方法是在类中创建一个名为 `__slots__` 的属性，并将期望的属性名作为字符串保存在一个元组或列表中。

```python linenums="1"
class Fraction:
    __slots__ = ('numerator', 'denominator')
    
    def __init__(self, numerator, denominator=1):
        if denominator == 0:
            raise ValueError("分母不能为 0！")
        
        common = gcd(numerator, denominator)
        self.numerator = numerator // common
        self.denominator = denominator // common

# 测试
f = Fraction(1, 2)  # 1/2

# 下面的代码会报错，因为 __slots__ 限制了只能有 'numerator' 和 'denominator' 这两个属性
# f.value = 3
```

在上面的例子中，我们只能为 Fraction 的实例设置 numerator 和 denominator 这两个属性。尝试设置其他属性会抛出一个 AttributeError。

## 9. 访问限制

封装是指将对象的属性和方法隐藏起来，只对外提供必要的接口。在 Python 中，可以使用单下划线（`_`）和双下划线（`__`）给函数命名来实现封装。通常这只是一种命名约定，而不是强制性的访问控制，但多数情况下，只能起到提醒作用。

### 9.2 受保护属性和方法

使用 `_` 开头表示私有方法，不能在类外访问。

```python linenums="1"
class MyClass:
    def __init__(self):
        self._protected_variable = "Protected"
    
    def _protected_method(self):
        return "这是一个受保护方法"
```

在上面的代码中，`__private_variable` 和 `__private_method` 在内部实际上被改写为 `_MyClass__private_variable` 和 `_MyClass__private_method`。这种改写是自动的，所以从类的外部直接访问 `__private_variable` 会导致一个属性错误。


```python linenums="1"
class MyClass:
    def __init__(self):
        self.__private_variable = "Private"
    
    def __private_method(self):
        return "这是一个私有方法"
```

### 9.1 私有属性和方法

```python linenums="1"
class BankAccount:
    def __init__(self, balance):
        self.__balance = balance

    def deposit(self, amount):
        self.__balance += amount

    def withdraw(self, amount):
        if amount <= self.__balance:
            self.__balance -= amount
        else:
            print("Insufficient funds.")

    def get_balance(self):
        return self.__balance

account = BankAccount(1000)
account.deposit(500)
account.withdraw(200)
print(account.get_balance())  # 输出: 1300
```

## 11. 小结

**遵循单一职责原则**

: 每个类应该只负责一个明确的功能，避免类的功能过于复杂。

**类的命名规范**

: 类名通常使用大写字母开头的驼峰命名法，例如 `Person`、`Student`。

**保持构造函数简洁**
: 构造函数的主要目的是初始化对象的属性，应该尽量保持简洁。避免在构造函数中执行复杂的计算或逻辑操作，这些操作可以放在其他方法中实现。


**合理使用属性和方法**
: 尽量将相关的属性和方法封装在同一个类中，提高代码的内聚性。避免在类中定义过多的属性和方法，保持类的简洁性。


**适当使用继承和多态**
: 继承和多态可以提高代码的复用性和可扩展性。但要避免过度使用，以免增加代码的复杂度。

**合理使用类变量和实例变量**

: 在设计类时，我们应该根据变量的用途来选择使用类变量还是实例变量。如果变量的值需要被所有实例共享，那么应该使用类变量；如果变量的值需要根据实例的不同而不同，那么应该使用实例变量。

