# Rust 所有权机制

每种编程语言都有自己的内存管理，像 C/C++ 这种编程语言，需要我们手动编写代码去做内存管理，而 Python/C#/Java 则是直接交给 GC（非常安全但是 stop the world 对程序性能伤害巨大），而 Rust 编译器则是非常特殊的一个，采用 Ownership 的 rule、Borrow Checker 以及 Lifetime，做到了更好地内存管理。

## 1. 内存管理

### 1.1 Stop the world

“Stop the world” 是与垃圾回收(Garbage Collection) 相关术语，它指的是在进行垃圾回收时系统暂停程序的运行。这个术语主要用于描述一种全局性的暂停，即所有应用线程都被停止，以便垃圾回收器能够安全地进行工作。这种全局性停止会导致一些潜在的问题，特别是对于需要低延迟和高性能的应用程度。

!!! warning ""

    并非所有的垃圾回收算法都需要 “stop the world”，有一些现代的垃圾回收器采用了一些技术来减少全局停顿的影响，比如并发垃圾回收和增量垃圾回收。

### 1.2 C/C++ 内存错误大全

以下简单给出一些在 C/C++ 中内存错误的示例，这里我们当做扩展知识了解下就好。

???+ example "内存错误示例"

    === "内存泄漏"

        ```c linenums="1" 
        int* ptr = new int;
        // 忘记释放内存
        // delete ptr;
        ```

    === "悬空指针"

        ```c linenums="1" 
        int* ptr = new int;
        delete ptr;  // ptr 现在是悬空指针
        ```
    
    === "重复释放"

        ```c linenums="1" 
        int* ptr = new int;
        delete ptr;
        delete ptr;
        ```

    === "数组越界"

        ```c linenums="1" 
        int arr[5];
        arr[5] = 10;
        ```

    === "使用已释放的内存"

        ```c linenums="1" 
        int* ptr = new int;
        delete ptr;
        *ptr = 10;  // ptr 已经被释放了
        ```

除了上面这几种，还有堆栈溢出、不匹配的 new/delete 或者 malloc/free。

## 2. Rust 内存管理模型 {collapsible="true" default-state="expanded"}

Rust 中内存管理模型共分为以下几部分内容：

- 所有权系统
- 借用，包含不可变借用和可变借用
- 生命周期
- 引用计数

### 2.1 所有权系统

之前我们简单介绍过所有权机制，所有权机制就是在变量间赋值时，会将所有权进行转移，通常转移之后，之前的变量就会被销毁，如果我还希望继续使用之前的变量，那么需要使用 `.clone` 方法。

!!! warning "变量类型的所有权转移"

    如果是基础类型的话，变量间的赋值会采用复制操作。如果是特殊类型，例如 `String::from` 构建的字符串，那么就会启用所有权机制。

!!! note "变量在函数调用时的所有权转移"

    传给函数的变量也会把所有权交出去，并在函数结束之后销毁变量。如果还希望使用该变量，则需要借助函数的返回值。

???+ example "内存错误示例"

    === "复制"

        ```rust linenums="1" 
        let a = "aa";
        let b = a;
        println!("{}", b);
        
        // 与所有权转移不一样的是，这里的 `a` 并不会被销毁，依然可以使用
        println!("{}", a);
        ```

    === "所有权转移"

        ```rust linenums="1" 
        let str_item = String::from("aa");
        // String 类型就将所有权进行转移操作，前面的 `str_item` 就不存在了
        let str_item_mv = str_item;
        // 也就是说，在上面一行代码后，你无法再使用 `str_item` 变量了
        println!("{}", str_item_mv);
        ```

    === "clone 方法"

        ```rust linenums="1" 
        let str_item = String::from("aa");
        // String 类型就将所有权进行转移操作，由于使用的是 clone 方法，
        // 前面的 `str_item` 依旧存在和可用
        let str_item_mv = str_item.clone();
        println!("{}", str_item);
        ```

    === "函数中的所有权"

        ```rust linenums="1" 
        fn get_length(s: String) {
            println!("{}", s.len());
        }

        fn main() {
            let str_item = String::from("aa");
            // String 类型就将所有权进行转移操作，由于使用的是 clone 方法，
            // 前面的 `str_item` 依旧存在和可用
            let str_item_mv = str_item.clone();
            get_length(str_item);
            // println!("{}", str_item);  // 报错
        }
        ```

    === "函数中的所有权"

        ```rust linenums="1" 
        fn get_length(s: String) {
            println!("{}", s.len());
        }

        fn main() {
            let str_item = String::from("aa");
            // String 类型就将所有权进行转移操作，由于使用的是 clone 方法，
            // 前面的 `str_item` 依旧存在和可用
            let str_item_mv = str_item.clone();
            get_length(str_item);
            // println!("{}", str_item);  // 报错
        }
        ```
    
    === "函数中返回值"

        ```rust linenums="1" 
        fn get_length(s: String) -> usize {
          println!("{}", s.len());
          s.len()
        }

        fn main() {
          let str_item = String::from("aa");
          let str_item_mv = str_item.clone();
          let s_len = get_length(str_item_mv);
          // println!("{}", s_len);
        }
        ```

### 2.2 函数返回类型为字符串的错误

我们知道基础字符串类型为 `&str`，但是我们指定函数返回类型为 `&str` 时需要非常注意。

!!! warning ""

    `String` 和 `&str` 不是同一种类型，所以返回值的类型必须要与指定返回类型一致。


???+ example "内存错误示例"

    === ":x: 错误示例"

        ```rust linenums="1" 
        // 错误示例1
        fn error_example1() -> &str {
            "abc"
        }

        // 错误示例2: 返回类型与返回值不一致
        fn error_example2() -> String {
            "abc"
        }
        ```

    === ":white_check_mark: 正确示例"

        ```rust linenums="1" 
        // 必须指定一个参数，且类型为 &str
        fn right_example1(s: &str) -> &str {
            "abc"
        }

        fn right_example2() -> String {
            String::from("abc")
        }

        fn right_example3(s: &str) -> String {
            String::from("abc")
        }

        // 使用静态生命周期，不推荐使用
        fn not_recommend_method() -> &'static str {
            "abc"
        }
        ```

此外，还有一种方式，保持函数的输入输出都是切片。

```rust linenums="1"
fn first_word(s: &str) -> &str {
  let bytes = s.as_bytes();
  for (i, &item) in bytes.iter().enumerate() {
      if item == b' ' {
          return &s[0..i];
      }
  }
  &s[..]  // 使用 &s 也可以
}

fn main() {
    println!("{}", first_word("hello rust"));
}
```

## 3. 字符串切片

这里简单提下字符串的切片，其实和 Python 中很相似，差异性不大。

```rust linenums="1" 
fn main() {
    let s1 = "hello rust";
    let s2 = String::from("hello python");
    
    // 都可以使用 borrowing 方式来切片
    println!("{}", &s1[6..10]);
    println!("{}", &s1[0..8]);
    println!("{}", &s1[0..]);
    println!("{}", &s1[..]);
    println!("{}", &s2[6..12]);
    println!("{}", &s2[6..]);
}
```
