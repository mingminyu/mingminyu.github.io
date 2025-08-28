# Python类

在 Python 编程中，类（class）是一个核心概念，它是面向对象编程（OOP）的基础构建代码块。通过类，我们可以将对象的数据（属性）和操作这些数据的方法（函数）封装在一起，实现代码的模块化和可重用性。

另外一个最常见的概念就是对象，它是类的实例。当我们根据类及其参数创建一个具体的实例时，就得到了一个对象。每个对象都有自己独立的属性值，并且可以调用类中定义的方法。

## 1. 类的定义和使用

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

## 2. 文档字符串

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

```python linenums="1" hl_lines="3"
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

## 3. getter 和 setter

`Getter` 和 `Setter` 是一种用于控制属性访问的机制，它可以用来限制对属性的访问和修改。在 Python 中，我们可以使用 `@property` 和 `@setter` 来实现 `Getter` 和 `Setter`。

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


## 4. 静态方法 staticmethod

## 5. 类方法 classmethod

## 6. 抽象方法 abstractmethod

## 7. 枚举 enum

## 8. 构造函数

### 8.1 `__init__`

在 `__init__` 方法中初始化对象的属性，确保对象在创建时具有正确的初始状态。


## 9. 属性

### 9.1 只读属性


## 小结

遵循单一职责原则

: 每个类应该只负责一个明确的功能，避免类的功能过于复杂。

类的命名规范

: 类名通常使用大写字母开头的驼峰命名法，例如 `Person`、`Student`。



- [x] https://geek-blogs.com/blog/instantiate-class-in-python/
- [x] https://geek-blogs.com/blog/how-to-make-a-class-in-python/
- https://geek-blogs.com/blog/what-is-a-python-class/
- https://geek-blogs.com/blog/instantiate-class-in-python/
- https://geek-blogs.com/blog/python-class-and-function
- https://geek-blogs.com/blog/how-to-make-a-class-in-python/
- https://geek-blogs.com/blog/python-variable-in-class/
- https://geek-blogs.com/blog/how-to-create-python-class/
- https://geek-blogs.com/blog/python-build-class/
- https://geek-blogs.com/blog/python-classes-and-objects/

构造方法
- https://geek-blogs.com/blog/python-multiple-consturctors-example/
- https://geek-blogs.com/blog/python-constructors/
- https://geek-blogs.com/blog/what-is-constructor-in-python/
- https://geek-blogs.com/blog/python-class-constructor/

