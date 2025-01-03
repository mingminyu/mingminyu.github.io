# 结构体

结构体是一种用于创建自定义数据结构的数据类型，通过 `.x` 或者 `.y` 来访问结构体中的属性。

```rust linenums="1"
struct Point {
  x: i32,
  y: i32,
}
```

## 1. 关联函数

结构体中的关联函数有两种，一种通过实例调用（`&self`、`&mut self`、`self`），另外一种则是与类型相关联的函数，调用时采用 `结构体::函数名` 的方式。

???+ example "关联函数的使用"

    === "实例调用"

        ```rust linenums="1"
        impl Point {
          fn distance(&self, other: &Point) -> f64 {
            let dx = (self.x - other.x) as f64;
            let dy = (self.y - other.y) as f64;
            (dx * dx + dy * dy ).sqrt()
          }
        }
        ```

    === "与类型相关的函数"

        ```rust linenums="1"
        impl Point {
            // Self 指的是 Point，换成 Point 也可以
            fn new(x: u32, y: u32) -> Self{
                Point {x, y}
            }
        }
        ```

## 2. 关联变量

关联变量是指与结构体类型相关的变量，也可以在特质或枚举中，通过 `Point::PI` 进行调用。

```rust linenums="1"
impl Point {
    const PI: f64 = 3.14;
}
```

## 3. 代码示例

下面我们看一些代码示例，来更深入地理解 Rust 中的结构体使用。

???+ example "结构体案例"

    === "示例1"

        ```rust linenums="1"
        enum Flavor {
          Spicy,
          Sweet,
          Fruity,
        }

        struct Drink {
          flavor: Flavor,
          price: f64
        }

        fn print_drink(drink: Drink) {
          match drink.flavor {
            Flavor::Fruity => println!("fruity"),
            Flavor::Spicy => println!("spicy"),
            Flavor::Sweet => println!("sweet"),
          }
          println!("{}", drink.price);
        }

        fn main() {
          let sweet_drink = Drink {
            flavor: Flavor::Sweet,
            price: 6.0,
          };
          println!("{}", sweet_drink.price);
          print_drink(sweet_drink);
        }
        ```
    
    === "示例2"

        ```rust linenums="1"
        enum Flavor {
          Spicy,
          Sweet,
          Fruity,
        }

        struct Drink {
          flavor: Flavor,
          price: f64
        }

        impl Drink {
          // 关联变量
          const MAX_PRICE: f64 = 10.0;
          // 方法
          fn buy(&self) {
            if self.price > self::MAX_PRICE {
                println!("I am poor");
                return;
            }
            println!("buy it");
          }
          // 关联函数
          fn new(price: f64) -> Self {
            Drink {
                flavor: Flavor::Fruity,
                price
            }
          }
        }


        fn print_drink(drink: Drink) {
            match drink.flavor {
                Flavor::Fruity => println!("fruity"),
                Flavor::Spicy => println!("spicy"),
                Flavor::Sweet => println!("sweet"),
            }
            println!("{}", drink.price);
        }

        fn main() {
            let sweet_drink = Drink {
                flavor: Flavor::Sweet,
                price: 6.0,
            };
            let sweet_drink = Drink::new(12.0);
            sweet_drink.buy();
        }
        ```

## 4. Ownership与结构体

所有权机制的规则:

1. 每一个值都必须有一个 Owner
2. 同一时刻只能有一个 Owner
3. 当值超出作用域时，值会自动销毁

### 4.1 值传递语义

每当将值从一个位置传递到另外一个位置时，borrow checker 都会重新评估所有权：

- **不可变借用**: 使用不可变借用，值的所有权仍贵发送发所有，接收放直接接收对该值的引用，而不是该值的副本。但是，他们不能使用该引用来修改它指向的值，编译器不允许这样做。释放资源的责任仍由发送方负责，仅当发送方超出范围时，才会删除该值。
- **可变借用**: 使用可变借用时所有权和删除值的责任也由发送方承担，但是接收方能通过他们接收的引用来修改值。
- **移动**: 这是所有权从一个位置转移到另外一个位置，borrow checker 关于释放该值的决定将由该值的接受者（注意不是发送者）通知。由于所有权已经从发送方转移到接收方，因此发送方在将引用移动到另一个上下文后不能再使用该引用，发送方在移动后对 value 的任何使用都会导致错误。

### 4.2 结构体中关联函数的参数

接下来，我们介绍喜爱结构体中关联函数的参数，通常有 `&self`、`&mut self` 以及 `self`:

- 不可变引用: `&self (self: &self)`
- 可变引用: `&mut self (self: &mut self)`
- 移动: `self (self: Self)`


举例说明，其中 `self` 参数相当于 `Point::get(point)` 调用后丧失所有权，`&self` 参数相当于 `Point::get(&point)`，而 `&mut self` 参数相当于 `Point::get(&mut point)`。

```rust linenums="1"
impl Point {
    fn get(self: Self) -> i32 {
        self.x
    }
}
```

接下来，我们看一些代码示例，帮助我们更深刻理解结构体中所有权机制的变化。

```rust linenums="1"
struct Counter {
  number: i32,
}

impl Counter {
  fn new(number: i32) -> Self {
    Self {number}
  }
  
  // 不可变借用，相当于 Counter::get_number(self: &Self)
  fn get_number(&self) -> i32 {
    self.number
  }
  
  // 可变借用，相当于 Counter::add(self: &mut Self, increment)
  fn add(&mut self, increment: i32) {
    self.number += increment;
  }
  
  // 转移
  fn give_up(self) {
    println!("free {}", self.number);
  }
  
  fn combine(c1: Self, c2: Self) -> Self {
    Self {
        number: c1.number + c2.number,
    }
  }
}

fn main() {
  let mut c1 = Counter::new(0);
  println!("c1 number {}", c1.get_number());
  c1.add(2);
  println!("c1 number {}", c1.get_number());
  c1.give_up();
  
  let mut c1 = Counter::new(2);
  let mut c2 = Counter::new(1);
  let c3 = Counter::combine(c1, c2);
  println!("c3 number {}", c3.get_number());
}
```
