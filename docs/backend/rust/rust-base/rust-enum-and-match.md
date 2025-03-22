# Rust 枚举与匹配模式

## 1. 枚举

枚举是一种用户自定义的数据类型，用于表示具有一组离散可能的变量。合适地使用枚举，能让我们的代码更加严谨，且更易于理解。

```rust linenums="1"
enum Shape {
    Cicle(f64),
    Rectangle(f64, f64),
    Square(f64),
}
```

在 Rust 中常用的枚举类型为 `Option` 和 `Result`。

???+ example "Option和Result的使用"
    === "Option"

        ```rust linenums="1"
        pub enum Option<T> {
          None,
          Some(T),
        }
        ```

    === "Result"

        ```rust linenums="1"
        pub enum Result<T, E> {
          Ok(T),
          Err(E),
        }
        ```

## 2. 匹配模式

Rust 中使用 `match` 关键字进行条件匹配，当 `match` 独立使用时，也结合 `_`、`..=`、三元表达式，功能非常强大，示例代码如下：

```rust linenums="1" title="match使用案例"
match number {
    0 => println!("Zero"),
    1 | 2 => println!("One or Two"),
    3..=9 => println!("From Three to None"),
    n if n % 2 == 0 => println!("Even number"),
    _ => println!("Other"),
}
```

此外，更多场景下，通常我们会匹配和枚举一起使用。

???+ example "枚举和匹配的使用"
    
    === "枚举和匹配"

        ```rust linenums="1"
        enum Color {
          Red,
          Yellow,
          Blue,
        }

        fn print_color(color: Color) {
          match color {
              Color::Red => println!("Red"),
              Color::Yellow => println!("Yellow"),
              Color::Blue => println!("Blue"),
              _ => (),
          }
        }

        fn main() {
          print_color(Color::Red);
        }
        ```

    === "枚举条件"

        ```rust
        enum BuildingLocation {
          Number(i32),
          Name(String),  // 不用 &str
          Unknown,  // 其他未知信息
        }

        impl BuildingLocation {
          fn print_location(&self) {
            match self {
                // BuildingLocation::Number(44)
                BuildingLocation::Number(c) => println!("Building Number: {}", c),
                // BuildingLocation::Name("ok".to_string())
                BuildingLocation::Name(c) => println!("Building Name: {}", c),    
                BuildingLocation::Unknown => println!("Unknown"),    
            }
          }
        }

        fn main() {
          let house_name = BuildingLocation::Name("abc".to_string());
          let house_number = BuildingLocation::Number(100);
          let house_unknown = BuildingLocation::Unknown;
          house_name.print_location();
          house_num.print_location();
        }
        ```
