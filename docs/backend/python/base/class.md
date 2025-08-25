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
```

在这个示例中，`Person` 类有两个属性：`name` 和 `age`，以及一个方法 `introduce`。`__init__` 是一个特殊的方法，称为构造函数，它在创建对象时自动调用。

要实例化一个 `Person` 类，我们只需要调用类名并传递必要的参数。创建好的对象 `p1` 可以通过 `p1.introduce()` 来调用 `introduce` 方法。

```python linenums="1"
# 创建一个 Person 对象
p1 = Person("Alice", 25)

# 调用对象的方法
p1.introduce()

p2 = Person("Alice", 25)
p2.introduce()

print(p1 == p2)  # 输出：False
```

## 2. 继承

### 2.1 继承单个类

类的继承允许我们创建一个新类，该类继承了另一个类的属性和方法。以下是一个简单的继承示例：

```python linenums="1"
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
# 实现多个类的继承

```

## 3. getter 和 setter

### 3.1 @property

### 3.2 @setter

## 4. 静态方法 staticmethod

## 5. 类方法 classmethod


## 6. 抽象方法 abstractmethod

## 7. 枚举 enum

## 8. 构造函数


- https://geek-blogs.com/blog/instantiate-class-in-python/
- https://geek-blogs.com/blog/how-to-make-a-class-in-python/
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

