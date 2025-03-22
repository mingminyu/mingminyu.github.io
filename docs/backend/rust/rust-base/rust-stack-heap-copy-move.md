# Rust 堆和栈以及复制与转移

## 1. 栈

栈（Stack）按照取值的 **顺序存储值**，并以相反顺序删除值。此外，栈具有操作高效的特点（函数作用域就是在栈上），栈上存储的所有数据都必须具有已知固定大小的数据。

在栈上可以存储基础数据类型、元组与数组、结构体、枚举，如果属性有 String 的数据类型，则会指向堆。

一般来说，在栈上的数据类型都是默认实现了 Copy，但结构体等默认是 Move，需要 Copy 只需要设置数据类型实战 Copy 特质即可，或者调用 Clone 函数（需要实现 Clone 特质）。

## 2. 堆

堆（heap）的 **规律性较差**，当我们把一些东西放到请求的堆上时，在请求时请求空间会返回一个指针，即该位置的地址。此外，堆所存储的数据长度是不确定的，例如 `Box`、`Rc`、`String`、`Vec` 等。

```rust linenums="1"
fn main() {
    let x = vec![1, 2, 3, 4];
    // 必须调用 clone，否则 x 后续无法使用
    let y = x.clone();
    println!("{:?}", y);
    println!("{:?}", x);
    
    let x = "abc".to_string();
    // 必须调用 clone，否则 x 后续无法使用
    let y = x.clone();
    println!("{:?}", x);
}
```

## 3. Box 指针

Box 是一个智能指针，它提供对堆分配内存的所有权，它允许我们将数据存储在堆上，而不是栈上，并且在复制或移动时保持对数据的唯一拥有权。使用 Box 可以避免一些内存管理问题，例如悬垂指针和重复释放。

Box 指针还具有以下优点：

- 所有权转移
- 释放内存
- 解引用
- 构建递归数据结构

```rust linenums="1"
struct Point {
    x: i32,
    y: i32,
}

fn main() {
    let box_point = Box::new(Point{x: 10, y: 20});
    println!("x:{}, y: {}", box_point.x, box_point.y);
    
    let mut box_point = Box::new(32);
    println!("{}", *box_point);
    // 加 10
    *box_point += 10;
    println!("{}", *box_point);
}
```

## 4. 复制与克隆

之前介绍过所有权转移(Move)，克隆(Clone) 则是深拷贝，而复制(Copy) 则是在克隆基础上建议的 Marker trait（Rust 中最类似继承的关系）。

- **特质**（trait）：一种定义共享行为的机制，Clone 也是特质
- **标记特质**（marker trait）：一个没有任何方法的 trait，主要用于向编译器传递某些信息，以改变类型的默认行为。
