# Rust 字符串

Rust 中字符串有两种类型，分别为 `String` 和 `&str`（称为字面量）：

- `String` 是一个堆分配的可变字符串类型
- `&str` 则是指字符串切片借用，它实在栈上分配的。

此外，`&str` 是不可变借用，指向存储在其他地方的 UTF-8 编码的字符串数据，由指针和长度构成。

之前也简单提到过，String 类型实际上就是使用了 `Vec` 类型，这个从源码中也能直观看出来。

```rust linenums="1"
pub struct String {
    vec: Vec<u8>,
}
```

String 是具有所有权的，而 `&str` 是没有的。`Struct` 中属性使用 String，如果不使用显式声明生命周期无法使用 `&str`。

对于函数参数的类型，如果不想交出所有权，那么推荐使用 `&str`。当参数类型为 `&str`，可以传递 `&str` 和 String。当参数类型为 `&String`，那么只能传递 `&String`，而不能传递 `&str`。

???+ example "字符串的使用"
    === "字符串定义"

        ```rust linenums="1"
        let name = String::from("C++");
        let course = "Rust".to_string();
        let new_name = name.replace("C++", "CPP");
        println!("{name} {course} {new_name}");
        // 字面量可以直接进行 ASCII 编码
        let rust = "\x52\75\73\74";
        println!("{rust}");
        ```
  
    === "结构体中字符串"

        ```rust linenums="1"
        struct Person {
          name: String,
          age: i32,
        }

        fn main() {
          let name = "John".to_string();
          let age = 89;
          let people = Person{
              name: name,
              age: age
          };
        }
        ```

    === "手动标记生命周期"

        ```rust linenums="1"
        struct Person<'a> {
            name: &a str,
            age: i32,
        }

        fn print(data: &str) {
            println!("{}", data);
        }

        // 只能传 String 的借用
        fn print_string_borrow(data: &String) {
            println!("{}", data);
        }


        fn main() {
            let name = "John";
            let age = 89;
            let people = Person{
                name: name,
                age: age
            };
            let value = "value".to_owned();
            print(&value);
            // print_string_borrow("abc");  // 会报错
            print_string_borrow(&value);
        }
        ```
