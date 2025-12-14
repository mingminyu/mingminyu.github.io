# 附录

## 附录 A：关键字

下面的列表包含 Rust 中正在使用或者以后会用到的关键字。因此，这些关键字不能被用作标识符（除了 “[原始标识符](https://rustwiki.org/zh-CN/book/appendix-01-keywords.html#raw-identifiers)” 部分介绍的原始标识符），这包括函数、变量、参数、结构体字段、模块、crate、常量、宏、静态值、属性、类型、trait 或生命周期的名字。

### A1. 目前正在使用的关键字

如下关键字目前有对应其描述的功能。

- `as` - 强制类型转换，消除特定包含项的 trait 的歧义，或者对 `use` 和 `extern crate` 语句中的项重命名
- `async` - 返回一个 `Future` 而不是阻塞当前线程
- `await` - 暂停执行，直到 `Future` 的结果准备好
- `break` - 立刻退出循环
- `const` - 定义常量或不变裸指针（constant raw pointer）
- `continue` - 继续进入下一次循环迭代
- `crate` - 链接（link）一个外部 **crate** 或一个代表宏定义的 **crate** 的宏变量
- `dyn` - 动态分发 trait 对象
- `else` - 作为 `if` 和 `if let` 控制流结构的 fallback
- `enum` - 定义一个枚举
- `extern` - 链接一个外部 **crate** 、函数或变量
- `false` - 布尔字面量 `false`
- `fn` - 定义一个函数或 **函数指针类型** (*function pointer type*)
- `for` - 遍历一个迭代器或实现一个 trait 或者指定一个更高级的生命周期
- `if` - 基于条件表达式的结果分支
- `impl` - 实现自有或 trait 功能
- `in` - `for` 循环语法的一部分
- `let` - 绑定一个变量
- `loop` - 无条件循环
- `match` - 模式匹配
- `mod` - 定义一个模块
- `move` - 使闭包获取其所捕获项的所有权
- `mut` - 表示引用、裸指针或模式绑定的可变性
- `pub` - 表示结构体字段、`impl` 块或模块的公有可见性
- `ref` - 通过引用绑定
- `return` - 从函数中返回
- `Self` - 实现 trait 的类型的类型别名
- `self` - 表示方法本身或当前模块
- `static` - 表示全局变量或在整个程序执行期间保持其生命周期
- `struct` - 定义一个结构体
- `super` - 表示当前模块的父模块
- `trait` - 定义一个 trait
- `true` - 布尔字面量 `true`
- `type` - 定义一个类型别名或关联类型
- `unsafe` - 表示不安全的代码、函数、trait 或实现
- `use` - 引入外部空间的符号
- `where` - 表示一个约束类型的从句
- `while` - 基于一个表达式的结果判断是否进行循环

### A2. 保留做将来使用的关键字

如下关键字没有任何功能，不过由 Rust 保留以备将来应用。

- `abstract`
- `become`
- `box`
- `do`
- `final`
- `macro`
- `override`
- `priv`
- `try`
- `typeof`
- `unsized`
- `virtual`
- `yield`

### A3. 原始标识符

原始标识符（Raw identifiers）允许你使用通常不能使用的关键字，其带有 `r#` 前缀。

例如，`match` 是关键字。如果尝试编译如下使用 `match` 作为名称的函数：

```rust
fn match(needle: &str, haystack: &str) -> bool {
    haystack.contains(needle)
}
```

会得到这个错误：

```text
error: expected identifier, found keyword `match`
 --> src/main.rs:4:4
  |
4 | fn match(needle: &str, haystack: &str) -> bool {
  |    ^^^^^ expected identifier, found keyword
```

该错误表示你不能将关键字 `match` 用作函数标识符。你可以使用原始标识符将 `match` 作为函数名称使用：

文件名: src/main.rs

```rust
fn r#match(needle: &str, haystack: &str) -> bool {
    haystack.contains(needle)
}

fn main() {
    assert!(r#match("foo", "foobar"));
}
```

此代码编译没有任何错误。注意 `r#` 前缀需同时用于函数名定义和 `main` 函数中的调用。

原始标识符允许使用你选择的任何单词作为标识符，即使该单词恰好是保留关键字。 此外，原始标识符允许你使用以不同于你的 crate 使用的 Rust 版本编写的库。比如，`try` 在 2015 edition 中不是关键字，而在 2018 edition 则是。所以如果用 2015 edition 编写的库中带有 `try` 函数，在 2018 edition 中调用时就需要使用原始标识符语法，在这里是 `r#try`。有关版本的更多信息，请参见[附录 E](https://rustwiki.org/zh-CN/book/appendix-05-editions.html)。

## 附录 B：运算符与符号

该附录包含了 Rust 语法的词汇表，包括运算符以及其他的符号，这些符号单独出现或出现在路径、泛型、trait bounds、宏、属性、注释、元组以及大括号上下文中。

### B1. 运算符

表 B-1 包含了 Rust 中的运算符、运算符如何出现在上下文中的示例、简短解释以及该运算符是否可重载。如果一个运算符是可重载的，则该运算符上用于重载的相关 trait 也会列出。

表 B-1: 运算符

| 运算符 | 示例                                             | 解释                   | 是否可重载     |
| ------ | ------------------------------------------------ | ---------------------- | -------------- |
| `!`    | `ident!(...)`, `ident!{...}`, `ident![...]`      | 宏展开                 |                |
| `!`    | `!expr`                                          | 按位非或逻辑非         | `Not`          |
| `!=`   | `var != expr`                                    | 不等比较               | `PartialEq`    |
| `%`    | `expr % expr`                                    | 算术取模               | `Rem`          |
| `%=`   | `var %= expr`                                    | 算术取模与赋值         | `RemAssign`    |
| `&`    | `&expr`, `&mut expr`                             | 借用                   |                |
| `&`    | `&type`, `&mut type`, `&'a type`, `&'a mut type` | 借用指针类型           |                |
| `&`    | `expr & expr`                                    | 按位与                 | `BitAnd`       |
| `&=`   | `var &= expr`                                    | 按位与及赋值           | `BitAndAssign` |
| `&&`   | `expr && expr`                                   | 逻辑与                 |                |
| `*`    | `expr * expr`                                    | 算术乘法               | `Mul`          |
| `*=`   | `var *= expr`                                    | 算术乘法与赋值         | `MulAssign`    |
| `*`    | `*expr`                                          | 解引用                 |                |
| `*`    | `*const type`, `*mut type`                       | 裸指针                 |                |
| `+`    | `trait + trait`, `'a + trait`                    | 复合类型限制           |                |
| `+`    | `expr + expr`                                    | 算术加法               | `Add`          |
| `+=`   | `var += expr`                                    | 算术加法与赋值         | `AddAssign`    |
| `,`    | `expr, expr`                                     | 参数以及元素分隔符     |                |
| `-`    | `- expr`                                         | 算术取负               | `Neg`          |
| `-`    | `expr - expr`                                    | 算术减法               | `Sub`          |
| `-=`   | `var -= expr`                                    | 算术减法与赋值         | `SubAssign`    |
| `->`   | `fn(...) -> type`, `|...| -> type`               | 函数与闭包，返回类型   |                |
| `.`    | `expr.ident`                                     | 成员访问               |                |
| `..`   | `..`, `expr..`, `..expr`, `expr..expr`           | 右排除范围             |                |
| `..`   | `..expr`                                         | 结构体更新语法         |                |
| `..`   | `variant(x, ..)`, `struct_type { x, .. }`        | “与剩余部分”的模式绑定 |                |
| `...`  | `expr...expr`                                    | 模式: 范围包含模式     |                |
| `/`    | `expr / expr`                                    | 算术除法               | `Div`          |
| `/=`   | `var /= expr`                                    | 算术除法与赋值         | `DivAssign`    |
| `:`    | `pat: type`, `ident: type`                       | 约束                   |                |
| `:`    | `ident: expr`                                    | 结构体字段初始化       |                |
| `:`    | `'a: loop {...}`                                 | 循环标志               |                |
| `;`    | `expr;`                                          | 语句和语句结束符       |                |
| `;`    | `[...; len]`                                     | 固定大小数组语法的部分 |                |
| `<<`   | `expr << expr`                                   | 左移                   | `Shl`          |
| `<<=`  | `var <<= expr`                                   | 左移与赋值             | `ShlAssign`    |
| `<`    | `expr < expr`                                    | 小于比较               | `PartialOrd`   |
| `<=`   | `expr <= expr`                                   | 小于等于比较           | `PartialOrd`   |
| `=`    | `var = expr`, `ident = type`                     | 赋值/等值              |                |
| `==`   | `expr == expr`                                   | 等于比较               | `PartialEq`    |
| `=>`   | `pat => expr`                                    | 匹配准备语法的部分     |                |
| `>`    | `expr > expr`                                    | 大于比较               | `PartialOrd`   |
| `>=`   | `expr >= expr`                                   | 大于等于比较           | `PartialOrd`   |
| `>>`   | `expr >> expr`                                   | 右移                   | `Shr`          |
| `>>=`  | `var >>= expr`                                   | 右移与赋值             | `ShrAssign`    |
| `@`    | `ident @ pat`                                    | 模式绑定               |                |
| `^`    | `expr ^ expr`                                    | 按位异或               | `BitXor`       |
| `^=`   | `var ^= expr`                                    | 按位异或与赋值         | `BitXorAssign` |
| `|`    | `pat | pat`                                      | 模式选择               |                |
| `|`    | `expr | expr`                                    | 按位或                 | `BitOr`        |
| `|=`   | `var |= expr`                                    | 按位或与赋值           | `BitOrAssign`  |
| `||`   | `expr || expr`                                   | 逻辑或                 |                |
| `?`    | `expr?`                                          | 错误传播               |                |

### B2. 非运算符符号

下面的列表中包含了所有和运算符不一样功能的非字符符号；也就是说，他们并不像函数调用或方法调用一样表现。

表 B-2 展示了以其自身出现以及出现在合法其他各个地方的符号。

表 B-2：独立语法

| 符号                                        | 解释                                               |
| ------------------------------------------- | -------------------------------------------------- |
| `'ident`                                    | 命名生命周期或循环标签                             |
| `...u8`, `...i32`, `...f64`, `...usize`, 等 | 指定类型的数值常量                                 |
| `"..."`                                     | 字符串常量                                         |
| `r"..."`, `r#"..."#`, `r##"..."##`, etc.    | 原始字符串字面量, 未处理的转义字符                 |
| `b"..."`                                    | 字节字符串字面量; 构造一个 `[u8]` 类型而非字符串   |
| `br"..."`, `br#"..."#`, `br##"..."##`, 等   | 原始字节字符串字面量，原始和字节字符串字面量的结合 |
| `'...'`                                     | 字符字面量                                         |
| `b'...'`                                    | ASCII 码字节字面量                                 |
| `|...| expr`                                | 闭包                                               |
| `!`                                         | 离散函数的总是为空的类型                           |
| `_`                                         | “忽略” 模式绑定；也用于增强整型字面量的可读性      |

表 B-3 展示了出现在从模块结构到项的路径上下文中的符号

表 B-3：路径相关语法

| 符号                                    | 解释                                                         |
| --------------------------------------- | ------------------------------------------------------------ |
| `ident::ident`                          | 命名空间路径                                                 |
| `::path`                                | 与 crate 根相对的路径（如一个显式绝对路径）                  |
| `self::path`                            | 与当前模块相对的路径（如一个显式相对路径）                   |
| `super::path`                           | 与父模块相对的路径                                           |
| `type::ident`, `<type as trait>::ident` | 关联常量、函数以及类型                                       |
| `<type>::...`                           | 不可以被直接命名的关联项类型（如 `<&T>::...`，`<[T]>::...`， 等） |
| `trait::method(...)`                    | 通过命名定义的 trait 来消除方法调用的二义性                  |
| `type::method(...)`                     | 通过命名定义的类型来消除方法调用的二义性                     |
| `<type as trait>::method(...)`          | 通过命名 trait 和类型来消除方法调用的二义性                  |

表 B-4 展示了出现在泛型类型参数上下文中的符号。

表 B-4：泛型

| 符号                           | 解释                                                         |
| ------------------------------ | ------------------------------------------------------------ |
| `path<...>`                    | 为一个类型中的泛型指定具体参数（如 `Vec<u8>`）               |
| `path::<...>`, `method::<...>` | 为一个泛型、函数或表达式中的方法指定具体参数，通常指 turbofish（如 `"42".parse::<i32>()`） |
| `fn ident<...> ...`            | 泛型函数定义                                                 |
| `struct ident<...> ...`        | 泛型结构体定义                                               |
| `enum ident<...> ...`          | 泛型枚举定义                                                 |
| `impl<...> ...`                | 定义泛型实现                                                 |
| `for<...> type`                | 高级生命周期限制                                             |
| `type<ident=type>`             | 泛型，其一个或多个相关类型必须被指定为特定类型（如 `Iterator<Item=T>`） |

表 B-5 展示了出现在使用 trait bounds 约束泛型参数上下文中的符号。

表 B-5: Trait Bound 约束

| 符号                          | 解释                                                         |
| ----------------------------- | ------------------------------------------------------------ |
| `T: U`                        | 泛型参数 `T` 约束于实现了 `U` 的类型                         |
| `T: 'a`                       | 泛型 `T` 的生命周期必须长于 `'a`（意味着该类型不能传递包含生命周期短于 `'a` 的任何引用） |
| `T : 'static`                 | 泛型 T 不包含除 'static 之外的借用引用                       |
| `'b: 'a`                      | 泛型 `'b` 生命周期必须长于泛型 `'a`                          |
| `T: ?Sized`                   | 使用一个不定大小的泛型类型                                   |
| `'a + trait`, `trait + trait` | 复合类型限制                                                 |

表 B-6 展示了在调用或定义宏以及在其上指定属性时的上下文中出现的符号。

表 B-6: 宏与属性

| 符号          | 解释     |
| ------------- | -------- |
| `#[meta]`     | 外部属性 |
| `#![meta]`    | 内部属性 |
| `$ident`      | 宏替换   |
| `$ident:kind` | 宏捕获   |
| `$(…)…`       | 宏重复   |

表 B-7 展示了写注释的符号。

表 B-7: 注释

| 符号       | 注释           |
| ---------- | -------------- |
| `//`       | 行注释         |
| `//!`      | 内部行文档注释 |
| `///`      | 外部行文档注释 |
| `/*...*/`  | 块注释         |
| `/*!...*/` | 内部块文档注释 |
| `/**...*/` | 外部块文档注释 |

表 B-8 展示了出现在使用元组时上下文中的符号。

表 B-8: 元组

| 符号                                        | 解释                                                         |
| ------------------------------------------- | ------------------------------------------------------------ |
| `()`                                        | 空元组（亦称单元），即是字面量也是类型                       |
| `(expr)`                                    | 括号表达式                                                   |
| `(expr,)`                                   | 单一元素元组表达式                                           |
| `(type,)`                                   | 单一元素元组类型                                             |
| `(expr, ...)`                               | 元组表达式                                                   |
| `(type, ...)`                               | 元组类型                                                     |
| `expr(expr, ...)`                           | 函数调用表达式；也用于初始化元组结构体 `struct` 以及元组枚举 `enum` 变体 |
| `ident!(...)`, `ident!{...}`, `ident![...]` | 宏调用                                                       |
| `expr.0`, `expr.1`, etc.                    | 元组索引                                                     |

表 B-9 展示了使用大括号的上下文。

表 B-9: 大括号

| 符号         | 解释            |
| ------------ | --------------- |
| `{...}`      | 块表达式        |
| `Type {...}` | `struct` 字面量 |

表 B-10 展示了使用方括号的上下文。

表 B-10: 方括号

| 符号                                               | 解释                                                         |
| -------------------------------------------------- | ------------------------------------------------------------ |
| `[...]`                                            | 数组                                                         |
| `[expr; len]`                                      | 复制了 `len` 个 `expr` 的数组                                |
| `[type; len]`                                      | 包含 `len` 个 `type` 类型的数组                              |
| `expr[expr]`                                       | 集合索引。 重载（`Index`, `IndexMut`）                       |
| `expr[..]`, `expr[a..]`, `expr[..b]`, `expr[a..b]` | 集合索引，使用 `Range`，`RangeFrom`，`RangeTo` 或 `RangeFull` 作为索引来代替集合 slice |

## 附录 C：可派生的 trait

在本书的各个部分中，我们讨论了可应用于结构体和枚举定义的 `derive` 属性。`derive` 属性会在使用 `derive` 语法标记的类型上生成对应 trait 的默认实现的代码。

在本附录中提供了标准库中所有可以使用 `derive` 的 trait 的参考。这些部分涉及到：

- 该 trait 将会派生什么样的操作符和方法
- 由 `derive` 提供什么样的 trait 实现
- 由什么来实现类型的 trait
- 是否允许实现该 trait 的条件
- 需要 trait 操作的例子

如果你希望不同于 `derive` 属性所提供的行为，请查阅 [标准库文档](https://rustwiki.org/zh-CN/std/index.html) 中每个 trait 的细节以了解如何手动实现它们。

标准库中定义的其它 trait 不能通过 `derive` 在类型上实现。这些 trait 不存在有意义的默认行为，所以由你负责以合理的方式实现它们。

一个无法被派生的 trait 的例子是为终端用户处理格式化的 `Display` 。你应该时常考虑使用合适的方法来为终端用户显示一个类型。终端用户应该看到类型的什么部分？他们会找出相关部分吗？对他们来说最相关的数据格式是什么样的？Rust 编译器没有这样的洞察力，因此无法为你提供合适的默认行为。

本附录所提供的可派生 trait 列表并不全面：库可以为其自己的 trait 实现 `derive`，可以使用 `derive` 的 trait 列表事实上是无限的。实现 `derive` 涉及到过程宏的应用，这在第 19 章的 [“宏”](https://rustwiki.org/zh-CN/book/ch19-06-macros.html#macros) 有介绍。

### C1. 用于开发者输出的 `Debug`

`Debug` trait 用于开启格式化字符串中的调试格式，其通过在 `{}` 占位符中增加 `:?` 表明。

`Debug` trait 允许以调试目的来打印一个类型的实例，所以使用该类型的开发者可以在程序执行的特定时间点观察其实例。

例如，在使用 `assert_eq!` 宏时，`Debug` trait 是必须的。如果等式断言失败，这个宏就把给定实例的值作为参数打印出来，如此开发者可以看到两个实例为什么不相等。

### C2. 等值比较的 `PartialEq` 和 `Eq`

`PartialEq` trait 可以比较一个类型的实例以检查是否相等，并开启了 `==` 和 `!=` 运算符的功能。

派生的 `PartialEq` 实现了 `eq` 方法。当 `PartialEq` 在结构体上派生时，只有*所有* 的字段都相等时两个实例才相等，同时只要有任何字段不相等则两个实例就不相等。当在枚举上派生时，每一个成员都和其自身相等，且和其他成员都不相等。

例如，当使用 `assert_eq!` 宏时，需要比较比较一个类型的两个实例是否相等，则 `PartialEq` trait 是必须的。

`Eq` trait 没有方法。其作用是表明每一个被标记类型的值等于其自身。`Eq` trait 只能应用于那些实现了 `PartialEq` 的类型，但并非所有实现了 `PartialEq` 的类型都可以实现 `Eq`。浮点类型就是一个例子：浮点数的实现表明两个非数字（`NaN`，not-a-number）值是互不相等的。

例如，对于一个 `HashMap<K, V>` 中的 key 来说， `Eq` 是必须的，这样 `HashMap<K, V>` 就可以知道两个 key 是否一样了。

### C3. 次序比较的 `PartialOrd` 和 `Ord`

`PartialOrd` trait 可以基于排序的目的而比较一个类型的实例。实现了 `PartialOrd` 的类型可以使用 `<`、 `>`、`<=` 和 `>=` 操作符。但只能在同时实现了 `PartialEq` 的类型上使用 `PartialOrd`。

派生 `PartialOrd` 实现了 `partial_cmp` 方法，其返回一个 `Option<Ordering>` ，但当给定值无法产生顺序时将返回 `None`。尽管大多数类型的值都可以比较，但一个无法产生顺序的例子是：浮点类型的非数字值。当在浮点数上调用 `partial_cmp` 时，`NaN` 的浮点数将返回 `None`。

当在结构体上派生时，`PartialOrd` 以在结构体定义中字段出现的顺序比较每个字段的值来比较两个实例。当在枚举上派生时，认为在枚举定义中声明较早的枚举变体小于其后的变体。

例如，对于来自于 `rand` crate 中的 `gen_range` 方法来说，当在一个大值和小值指定的范围内生成一个随机值时，`PartialOrd` trait 是必须的。

`Ord` trait 也让你明白在一个带注明类型上的任意两个值存在有效顺序。`Ord` trait 实现了 `cmp` 方法，它返回一个 `Ordering` 而不是 `Option<Ordering>`，因为总存在一个合法的顺序。只可以在实现了 `PartialOrd` 和 `Eq`（`Eq` 依赖 `PartialEq`）的类型上使用 `Ord` trait 。当在结构体或枚举上派生时， `cmp` 和以 `PartialOrd` 派生实现的 `partial_cmp` 表现一致。

例如，当在 `BTreeSet<T>`（一种基于有序值存储数据的数据结构）上存值时，`Ord` 是必须的。

### C4. 复制值的 `Clone` 和 `Copy`

`Clone` trait 可以明确地创建一个值的深拷贝（deep copy），复制过程可能包含任意代码的执行以及堆上数据的复制。查阅第 4 章 [“变量和数据的交互方式：移动”](https://rustwiki.org/zh-CN/book/ch04-01-what-is-ownership.html#ways-variables-and-data-interact-clone) 以获取有关 `Clone` 的更多信息。

派生 `Clone` 实现了 `clone` 方法，其为整个的类型实现时，在类型的每一部分上调用了 `clone` 方法。这意味着类型中所有字段或值也必须实现了 `Clone`，这样才能够派生 `Clone` 。

例如，当在一个切片（slice）上调用 `to_vec` 方法时，`Clone` 是必须的。切片并不拥有其所包含实例的类型，但是从 `to_vec` 中返回的 vector 需要拥有其实例，因此，`to_vec` 在每个元素上调用 `clone`。因此，存储在切片中的类型必须实现 `Clone`。

`Copy` trait 允许你通过只拷贝存储在栈上的位来复制值而不需要额外的代码。查阅第 4 章 [“只在栈上的数据：拷贝”](https://rustwiki.org/zh-CN/book/ch04-01-what-is-ownership.html#stack-only-data-copy) 的部分来获取有关 `Copy` 的更多信息。

`Copy` trait 并未定义任何方法来阻止编程人员重写这些方法或违反不需要执行额外代码的假设。尽管如此，所有的编程人员可以假设复制（copy）一个值非常快。

可以在类型内部全部实现 `Copy` trait 的任意类型上派生 `Copy`。 但只可以在那些同时实现了 `Clone` 的类型上使用 `Copy` trait ，因为一个实现了 `Copy` 的类型也简单地实现了 `Clone`，其执行和 `Copy` 相同的任务。

`Copy` trait 很少使用；实现 `Copy` 的类型是可以优化的，这意味着你无需调用 `clone`，这让代码更简洁。

任何使用 `Copy` 的代码都可以通过 `Clone` 实现，但代码可能会稍慢，或者不得不在代码中的许多位置上使用 `clone`。

### C5. 固定大小的值到值映射的 `Hash`

`Hash` trait 可以实例化一个任意大小的类型，并且能够用哈希（hash）函数将该实例映射到一个固定大小的值上。派生 `Hash` 实现了 `hash` 方法。`hash` 方法的派生实现结合了在类型的每部分调用 `hash` 的结果，这意味着所有的字段或值也必须实现了 `Hash`，这样才能够派生 `Hash`。

例如，在 `HashMap<K, V>` 上存储数据，存放 key 的时候，`Hash` 是必须的。

### C6. 默认值的 `Default`

`Default` trait 使你创建一个类型的默认值。 派生 `Default` 实现了 `default` 函数。`default` 函数的派生实现调用了类型每部分的 `default` 函数，这意味着类型中所有的字段或值也必须实现了 `Default`，这样才能够派生 `Default` 。

`Default::default` 函数通常结合结构体更新语法一起使用，这在第 5 章的 [“使用结构体更新语法从其他实例中创建实例”](https://rustwiki.org/zh-CN/book/ch05-01-defining-structs.html#creating-instances-from-other-instances-with-struct-update-syntax) 部分有讨论。可以自定义一个结构体的一小部分字段而剩余字段则使用 `..Default::default()` 设置为默认值。

例如，当你在 `Option<T>` 实例上使用 `unwrap_or_default` 方法时，`Default` trait 是必须的。如果 `Option<T>` 是 `None` 的话, `unwrap_or_default` 方法将返回存储在 `Option<T>` 中 `T` 类型的 `Default::default` 的结果。

## 附录 D：实用开发工具

本附录，我们将讨论 Rust 项目提供的用于开发 Rust 代码的工具。

### D1. 通过 `rustfmt` 自动格式化

`rustfmt` 工具根据社区代码风格格式化代码。很多项目使用 `rustfmt` 来避免编写 Rust 风格的争论：所有人都用这个工具格式化代码！

安装 `rustfmt`：

```text
$ rustup component add rustfmt
```

这会提供 `rustfmt` 和 `cargo-fmt`，类似于 Rust 同时安装 `rustc` 和 `cargo`。为了格式化整个 Cargo 项目：

```text
$ cargo fmt
```

运行此命令会格式化当前 crate 中所有的 Rust 代码。这应该只会改变代码风格，而不是代码语义。请查看 [该文档](https://github.com/rust-lang-nursery/rustfmt) 了解 `rustfmt` 的更多信息。

### D2. 通过 `rustfix` 修复代码

如果你编写过 Rust 代码，那么你可能见过编译器警告。例如，考虑如下代码：

文件名: src/main.rs

```rust
fn do_something() {}

fn main() {
    for i in 0..100 {
        do_something();
    }
}
```

这里调用了 `do_something` 函数 100 次，不过从未在 `for` 循环体中使用变量 `i`。Rust 会警告说：

```text
$ cargo build
   Compiling myprogram v0.1.0 (file:///projects/myprogram)
warning: unused variable: `i`
 --> src/main.rs:4:9
  |
4 |     for i in 1..100 {
  |         ^ help: consider using `_i` instead
  |
  = note: #[warn(unused_variables)] on by default

    Finished dev [unoptimized + debuginfo] target(s) in 0.50s
```

警告中建议使用 `_i` 名称：下划线表明该变量有意不使用。我们可以通过 `cargo fix` 命令使用 `rustfix` 工具来自动采用该建议：

```text
$ cargo fix
    Checking myprogram v0.1.0 (file:///projects/myprogram)
      Fixing src/main.rs (1 fix)
    Finished dev [unoptimized + debuginfo] target(s) in 0.59s
```

如果再次查看 *src/main.rs*，会发现 `cargo fix` 修改了代码：

文件名: src/main.rs

```rust
fn do_something() {}

fn main() {
    for _i in 0..100 {
        do_something();
    }
}
```

现在 `for` 循环变量变为 `_i`，警告也不再出现。

`cargo fix` 命令可以用于在不同 Rust 版本间迁移代码。版本在附录 E 中介绍。

### D3. 通过 `clippy` 提供更多 lint 功能

`clippy` 工具是一系列 lint 的集合，用于捕捉常见错误和改进 Rust 代码。

安装 `clippy`：

```text
$ rustup component add clippy
```

对任何 Cargo 项目运行 clippy 的 lint：

```text
$ cargo clippy
```

例如，如果程序使用了如 pi 这样数学常数的近似值，如下：

文件名: src/main.rs

```rust
fn main() {
    let x = 3.1415;
    let r = 8.0;
    println!("the area of the circle is {}", x * r * r);
}
```

在此项目上运行 `cargo clippy` 会导致这个错误：

```text
error: approximate value of `f{32, 64}::consts::PI` found. Consider using it directly
 --> src/main.rs:2:13
  |
2 |     let x = 3.1415;
  |             ^^^^^^
  |
  = note: #[deny(clippy::approx_constant)] on by default
  = help: for further information visit https://rust-lang-nursery.github.io/rust-clippy/master/index.html#approx_constant
```

这告诉我们 Rust 定义了更为精确的常量，而如果使用了这些常量程序将更加准确。如下代码就不会导致 `clippy` 产生任何错误或警告：

文件名: src/main.rs

```rust
fn main() {
    let x = std::f64::consts::PI;
    let r = 8.0;
    println!("the area of the circle is {}", x * r * r);
}
```

请查看 [其文档](https://github.com/rust-lang/rust-clippy) 来了解 `clippy` 的更多信息。

### D4. 使用 Rust Language Server 的 IDE 集成

为了帮助 IDE 集成，Rust 项目分发了 `rls`，其为 Rust Language Server 的缩写。这个工具采用 [Language Server Protocol](http://langserver.org/)，这是一个 IDE 与编程语言沟通的规格说明。`rls` 可以用于不同的客户端，比如 [Visual Studio: Code 的 Rust 插件](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust)。

`rls` 工具的质量还未达到发布 1.0 版本的水平，不过目前有一个可用的预览版。请尝试使用并告诉我们它如何！

安装 `rls`：

```text
$ rustup component add rls
```

接着为特定的 IDE 安装 language server 支持，如此便会获得如自动补全、跳转到定义和 inline error 之类的功能。

请查看 [其文档](https://github.com/rust-lang/rls) 来了解 `rls` 的更多信息。

## 附录 E：版本

早在第 1 章，我们见过 `cargo new` 在 *Cargo.toml* 中增加了一些有关 `edition` 的元数据。本附录将解释其意义！

Rust 语言和编译器有一个为期 6 周的发布循环。这意味着用户会稳定得到新功能的更新。其他编程语言发布大更新但不甚频繁；Rust 选择更为频繁的发布小更新。一段时间之后，所有这些小更新会日积月累。不过随着小更新逐次的发布，或许很难回过头来感叹：“哇，从 Rust 1.10 到 Rust 1.31，Rust 的变化真大！”

每两到三年，Rust 团队会生成一个新的 Rust **版本**（*edition*）。每一个版本会结合已经落地的功能，并提供一个清晰的带有完整更新文档和工具的功能包。新版本会作为常规的 6 周发布过程的一部分发布。

这为不同的人群提供了不同的功能：

- 对于活跃的 Rust 用户，其将增量的修改与易于理解的功能包相结合。
- 对于非用户，它表明发布了一些重大进展，这意味着 Rust 可能变得值得一试。
- 对于 Rust 自身开发者，其提供了项目整体的集合点。

在本文档编写时，Rust 有两个版本：Rust 2015 和 Rust 2018。本书基于 Rust 2018 edition 编写。

*Cargo.toml* 中的 `edition` 字段表明代码应该使用哪个版本编译。如果该字段不存在，其默认为 `2015` 以提供后向兼容性。

每个项目都可以选择不同于默认的 2015 edition 的版本。这样，版本可能会包含不兼容的修改，比如新增关键字可能会与代码中的标识符冲突并导致错误。不过除非选择兼容这些修改，（旧）代码仍将能够编译，即便升级了 Rust 编译器的版本。

所有 Rust 编译器都支持任何之前存在的编译器版本，并可以链接任何支持版本的 crate。编译器修改只影响最初的解析代码的过程。因此，如果你使用 Rust 2015 而某个依赖使用 Rust 2018，你的项目仍旧能够编译并使用该依赖。反之，若项目使用 Rust 2018 而依赖使用 Rust 2015 亦可工作。

有一点需要明确：大部分功能在所有版本中都能使用。开发者使用任何 Rust 版本将能继续接收最新稳定版的改进。然而在一些情况，主要是增加了新关键字的时候，则可能出现了只能用于新版本的功能。只需切换版本即可利用新版本的功能。

请查看 [Edition Guide](https://rust-lang-nursery.github.io/edition-guide/) 了解更多细节，这是一个完全介绍版本的书籍，包括如何通过 `cargo fix` 自动将代码迁移到新版本。

## 附录 G：Rust 是如何开发的与 “Nightly Rust”

本附录介绍 Rust 是如何开发的以及这如何影响作为 Rust 开发者的你。

### G1. 稳定而不停滞

作为一个语言，Rust **非常**关心代码的稳定性。我们希望 Rust 成为你代码的坚实基础，假如持续地有东西在变，这个希望就实现不了。与此同时，如果不能试验新功能的话，在发布之前我们又无法发现其中重大的缺陷，而一旦发布便再也没有修改的机会了。

对于这个问题我们的解决方案被称为 “稳定而不停滞”（“stability without stagnation”），其指导性原则是：无需担心升级到最新的稳定版 Rust。每次升级应该是无痛的，并带来新功能，更少的 bug 和更快的编译速度。

### G2. 发布通道和乘坐火车

Rust 开发按照**火车时刻表**（*train schedule*）运行。也就是说，所有的开发工作都是在 Rust 仓库的 `master` 分支上完成的。Rust 发布采用火车模型发布模式（software release train model），其被用于思科 IOS 和其它软件项目。Rust 有三个**发布通道**（*release channel*）：

- Nightly（开发版）
- Beta（预览版）
- Stable（稳定版）

大部分 Rust 开发者主要采用稳定版通道，不过希望实验新功能的开发者可能会使用开发版或预览版。

下面是一个开发和发布过程如何运转的示例：假设 Rust 团队正在进行 Rust 1.5 的发布工作。该版本发布于 2015 年 12 月，但它将为我们提供真实的版本号。Rust 新增了一项功能：一个新的提交到 `master` 分支。每天晚上，会产生一个新的开发版（nightly 版）Rust。每天都是发布日，而这些发布由发布基础设施自动创建。所以随着时间推移，发布轨迹看起来像这样，每晚一次：

```text
nightly: * - - * - - *
```

每 6 周，是时候准备一个新版本了！Rust 仓库的 `beta` 分支会从开发版的 `master` 分支分出来。现在，有了两个发布版本：

```text
nightly: * - - * - - *
                     |
beta:                *
```

大部分 Rust 用户不会主动使用 beta 发布版本，不过在 CI 系统（持续集成系统）中对 beta 版本进行测试能帮助 Rust 发现可能的回归缺陷（regression）。同时，每晚仍产生开发发布版：

```text
nightly: * - - * - - * - - * - - *
                     |
beta:                *
```

比如我们发现了一个回归缺陷。好消息是在这些缺陷流入稳定发布之前还有一些时间来测试 beta 版本！修复在 `master` 分支进行，从而 nightly 版本得到了修复，接着将这些修复向后移植到 `beta` 分支，一个新的 beta 发布就产生了：

```text
nightly: * - - * - - * - - * - - * - - *
                     |
beta:                * - - - - - - - - *
```

在创建第一个 beta 版 6 周后，是时候发布稳定版本了！`stable` 分支从 `beta` 分支生成：

```text
nightly: * - - * - - * - - * - - * - - * - * - *
                     |
beta:                * - - - - - - - - *
                                       |
stable:                                *
```

好极了！Rust 1.5 发布了！然而，我们忘了些东西：因为 6 周过去了，我们还需发布**下一个** Rust 1.6 的全新 beta 版本。所以从 `beta` 生成 `stable` 分支后，下一版的 `beta` 分支也再次从 `nightly` 生成：

```text
nightly: * - - * - - * - - * - - * - - * - * - *
                     |                         |
beta:                * - - - - - - - - *       *
                                       |
stable:                                *
```

这被称为“火车模式”（train model），因为每 6 周，一个版本“离开车站”，不过从 beta 通道到达稳定通道还有一段旅程。

Rust 每 6 周发布一次，就像发条一样。如果你知道了某个 Rust 版本的发布日期，就可以知道下个版本的日期：6 周后。每 6 周发布一版的一个好处是下一班火车即将到来。如果一个功能在特定版本中错过了也无需担心：另一个版本很快就会到来！这有助于减少在发布截止日期前匆忙加入可能未完善的功能的压力。

多亏了这个过程，你可以随时切换到下一版本的 Rust 并验证它是否易于升级：如果 beta 版不能如期工作，你可以向 Rust 团队报告并在发布下一个稳定版之前得到修复！beta 版造成的破坏是非常少见的，但 `rustc` 也是一个软件，仍可能存在 bug。

### G3. 维护时间

Rust项目支持最新的稳定版本。当一个新的稳定版本发布时，旧版本就达到了其生命周期（EOL）。这意味着每个版本都支持六周。

### G4. 不稳定功能

这个发布模型中另一个值得注意的地方：不稳定功能（unstable features）。Rust 使用一个被称为 “功能标记”（“feature flags”）的技术来确定给定版本的某个功能是否启用。如果新功能正在积极地开发中，其提交到了 `master`，因此会出现在 nightly 版中，不过会位于一个 **功能标记** 之后。作为用户，如果你希望尝试这个正在开发的功能，则可以在源码中使用合适的标记来开启，不过必须使用 nightly 版。

如果使用的是 beta 或稳定版 Rust，则不能使用任何功能标记。这是在新功能被宣布为永久稳定之前获得实用价值的关键。这既满足了希望使用最尖端技术的同学，那些坚持稳定版的同学也知道其代码不会被破坏。这就是无停滞稳定。

本书只包含稳定的功能，因为还在开发中的功能仍可能改变，当其进入稳定版时肯定会与编写本书的时候有所不同。你可以在网上获取 nightly 版的文档。

### G5. Rustup 和 Rust Nightly 的职责

Rustup 使得改变不同发布通道的 Rust 更为简单，其在全局或分项目的层次工作。其默认会安装稳定版 Rust。例如为了安装 nightly：

```text
$ rustup install nightly
```

你会发现 `rustup` 也安装了所有的**工具链**（*toolchains*， Rust 和其相关组件）。如下是一位作者的 Windows 计算机上的例子：

```powershell
> rustup toolchain list
stable-x86_64-pc-windows-msvc (default)
beta-x86_64-pc-windows-msvc
nightly-x86_64-pc-windows-msvc
```

如你所见，默认是稳定版。大部分 Rust 用户在大部分时间使用稳定版。你可能也会这么做，不过如果你关心最新的功能，可以为特定项目使用 nightly 版。为此，可以在项目目录使用 `rustup override` 来设置当前目录 `rustup` 使用 nightly 工具链：

```text
$ cd ~/projects/needs-nightly
$ rustup override set nightly
```

现在，每次在 *~/projects/needs-nightly* 调用 `rustc` 或 `cargo`，`rustup` 会确保使用 nightly 版 Rust。在你有很多 Rust 项目时大有裨益！

### G6. RFC 过程和团队

那么你如何了解这些新功能呢？Rust 开发模式遵循一个 **Request For Comments (RFC，征求评审) 过程**。如果你希望改进 Rust，可以编写一个提议，也就是 RFC。

任何人都可以编写 RFC 来改进 Rust，同时这些 RFC 会被 Rust 团队评审和讨论，他们由很多不同分工的子团队组成。这里是 [Rust 官网上](https://www.rust-lang.org/governance) 所有团队的总列表，其包含了项目中每个领域的团队：语言设计、编译器实现、基础设施、文档等。各个团队会阅读相应的提议和评论，编写回复，并最终达成接受或回绝功能的一致。

如果功能被接受了，在 Rust 仓库会打开一个 issue，人们就可以实现它。实现功能的人当然可能不是最初提议功能的人！当实现完成后，其会合并到 `master` 分支并位于一个功能开关（feature gate）之后，正如 [“不稳定功能”](https://rustwiki.org/zh-CN/book/appendix-07-nightly-rust.html#unstable-features) 章节所讨论的。

在稍后的某个时间，一旦使用 nightly 版的 Rust 团队能够尝试这个功能了，团队成员会讨论这个功能，它如何在 nightly 中工作，并决定是否应该进入稳定版。如果决定继续推进，功能开关会移除，然后这个功能就被认为是稳定的了！乘着“发布的列车”，最终在新的稳定版 Rust 中出现。

