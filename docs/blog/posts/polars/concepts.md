---
date: 2025-10-16
authors:
  - mingminyu
categories:
  - Polars  
tags:
  - 官网文档
slug: concepts
readtime: 20
---

# Polars文档——概念

本章介绍了 Polars API 的核心概念。理解这些概念将有助于您日常优化查询。我们将涵盖以下主题：

- 数据类型与结构
- 表达式与上下文
- 惰性 API

<!-- more -->

## 1. 数据类型与结构

Polars 支持多种数据类型，大致分为以下几类

- 数值数据类型：有符号整数、无符号整数、浮点数和 Decimal 数。
- 嵌套数据类型：列表、结构体和数组。
- 时间类型：日期、日期时间、时间和时间差。
- 杂项：字符串、二进制数据、布尔值、分类数据、枚举和对象。

所有类型都支持由特殊值 null 表示的缺失值。这不应与浮点数数据类型中的特殊值 NaN 混淆；

### 1.1 Series

Polars 提供的核心基础数据结构是 Series 和 Dataframe。Series 是一种一维同构数据结构。“同构”意味着 Series 中的所有元素都具有相同的数据类型。下面的代码片段展示了如何创建一个命名 Series。

=== "Python"

    ```python linenums="1"
    import polars as pl

    s = pl.Series("ints", [1, 2, 3, 4, 5])
    print(s)
    ```

=== "Rust"

    ```rust linenums="1"
    use polars::prelude::*;

    let s = Series::new("ints".into(), &[1, 2, 3, 4, 5]);
    println!("{:?}", s)
    ```

创建 Series 时，Polars 会从您提供的值推断数据类型。您可以指定具体的数据类型来覆盖推断机制。

=== "Python"

    ```python
    
    ```

=== "Rust"

    ```rust linenums="1"
    use polars::prelude::*;

    let s1 = Series::new("ints".into(), &[1, 2, 3, 4, 5]);
    let s2 = Series::new("units".into(), &[1.1, 2.1, 3.1, 4.1, 5.1])
        .cast(&DataType::UInt64)
        .unwrap()
        ;
    println!("{} {}", s1.dtype(), s2.dtype());  // i32 u64
    ```

### 1.2 Dataframe

Dataframe 是一种二维异构数据结构，包含唯一命名的 Series。通过将数据存储在 Dataframe 中，您将能够使用 Polars API 编写查询来操作数据。您可以通过使用我们接下来将讨论的 Polars 提供的上下文和表达式来实现这一点。下面的代码片段展示了如何从列表字典创建 Dataframe。

=== "Python"

    ```python linenums="1"

    ```

=== "Rust"

    ```rust linenums="1"
    use polars::prelude::*;

    let df: DataFrame = df!(
        "name" => ["Alice Archer", "Ben Brown", "Chloe Cooper", "Daniel Donovan"],
        "birthdate" => [
            NaiveDate::from_ymd_opt(1997, 1, 10).unwrap(),
            NaiveDate::from_ymd_opt(1985, 2, 15).unwrap(),
            NaiveDate::from_ymd_opt(1983, 3, 22).unwrap(),
            NaiveDate::from_ymd_opt(1981, 4, 30).unwrap(),
        ],
        "weight" => [57.9, 72.5, 53.6, 83.1],  // (kg)
        "height" => [1.56, 1.77, 1.65, 1.75],  // (m)
      ).unwrap();
    println!("{}", df);
    ```

在本小节中，我们将展示一些有用的方法来快速检查 Dataframe。我们将使用之前创建的 Dataframe 作为起点。

#### 1.2.1 Head

函数 `head` 显示 Dataframe 的前几行。默认情况下，您会获得前 5 行，但您也可以指定所需的行数。


=== "Python"

    ```python linenums="1"
    s1 = pl.Series("ints", [1, 2, 3, 4, 5])
    s2 = pl.Series("uints", [1, 2, 3, 4, 5], dtype=pl.UInt64)
    print(s1.dtype, s2.dtype)
    ```

=== "Rust"

    ```rust linenums="1"
    let df_head = df.head(Some(3))
    println!("{}", df_head);
    ```
  
#### 1.2.2 Glimpse

函数 `glimpse` 是另一个显示 Dataframe 前几行值的函数，但其输出格式与 `head` 不同。在这里，输出的每一行对应一个单独的列，这使得检查更宽的 Dataframe 变得更容易。

!!! info "注意"

    `glimpse` 仅适用于 Python 用户。

=== "Python"

    ```python
    print(df.glimpse(return_as_string=True))
    ```

#### 1.2.3 Tail

#### 1.2.4 Sample

如果您认为 Dataframe 的前几行或最后几行不能代表您的数据，您可以使用 `sample` 从 Dataframe 中获取任意数量的随机选择行。请注意，这些行不一定按它们在 Dataframe 中出现的相同顺序返回。

=== "Python"

    ```python linenums="1"

    ```

=== "Rust"

    ```rust linenums="1"
    let df_head = df.head(Some(3))
    println!("{}", df_head);
    ```

#### 1.2.5 Describe

### 1.3 Schema

在讨论数据（在 Dataframe 或其他地方）时，我们可以引用其 Schema。Schema 是列名或 Series 名称到这些列或 Series 数据类型的映射。您可以使用 `schema` 检查 Dataframe 的 Schema。

=== "Python"

    ```python linenums="1"

    ```

    在 Python 中，您可以使用字典将列名映射到数据类型来指定显式 Schema。如果您不希望覆盖给定列的推断，则可以使用值 `None`。

    ```python linenums="1"
    df = pl.DataFrame(
        {
            "name": ["Alice", "Ben", "Chloe", "Daniel"],
            "age": [27, 39, 41, 43],
        },
        schema={"name": None, "age": pl.UInt8},
    )

    print(df)
    ```

    如果您只需要覆盖某些列的推断，参数 `schema_overrides` 通常更方便，因为它允许您省略不想覆盖推断的列。

    ```python linenums="1"
    df = pl.DataFrame(
        {
            "name": ["Alice", "Ben", "Chloe", "Daniel"],
            "age": [27, 39, 41, 43],
        },
        schema_overrides={"age": pl.UInt8},
    )
    print(df)
    ```

=== "Rust"

    ```rust linenums="1"
    println!("{:?}", df.schema());
    ```

与 Series 类似，Polars 会在您创建 Dataframe 时推断其 Schema，但如果需要，您可以覆盖推断系统。

### 1.4 数据类型内部结构

Polars 利用 Arrow 列式格式进行数据定向。遵循此规范使得 Polars 能够以极小的开销与其他也使用 Arrow 规范的工具传输数据。

Polars 的大部分性能来自于其查询引擎、对查询计划执行的优化以及在运行表达式时采用的并行化。


### 1.5 浮点数

Polars 通常遵循 IEEE 754 浮点标准处理 `Float32` 和 `Float64`，但有一些例外情况：

- 任何 `NaN` 都与任何其他 `NaN` 比较相等，并且大于任何非 `NaN` 值。
- 操作不保证零或 `NaN` 的符号，也不保证 `NaN` 值的负载有任何特定行为。这不仅限于算术运算，例如，排序或分组操作可能会将所有零规范化为 +0，将所有 `NaN` 规范化为无负载的正 `NaN`，以实现高效的相等性检查。

Polars 始终尝试为浮点计算提供合理准确的结果，但除非另有说明，否则不保证误差。一般来说，实现 100% 准确的结果在经济上是不可行的（需要比 64 位浮点数大得多的内部表示），因此总会存在一些误差。

## 2. 表达式与上下文

Polars 开发了自己的领域特定语言 (DSL) 用于数据转换。该语言易于使用，支持复杂查询，同时保持可读性。本文将介绍的表达式和上下文，对于实现这种可读性以及让 Polars 查询引擎尽可能快地优化和运行您的查询都非常重要。

### 2.1 表达式

在 Polars 中，一个表达式是数据转换的惰性表示。表达式是模块化且灵活的，这意味着您可以将它们用作构建更复杂表达式的积木。以下是一个 Polars 表达式的示例：

```python linenums="1"
import polars as pl

pl.col("weight") / (pl.col("height") ** 2)
```

您可能已经猜到，这个表达式将名为“weight”的列的值除以名为“height”的列的值的平方，从而计算一个人的 BMI。

上述代码表达了一种抽象计算，我们可以将其保存到变量中，进行进一步操作，或者直接打印出来

```python linenums="1"
bmi_expr = pl.col("weight") / (pl.col("height") ** 2)
print(bmi_expr)
```

因为表达式是惰性的，所以尚未进行任何计算。这就是我们需要上下文的原因。

### 2.2 上下文

Polars 表达式需要一个上下文来执行并产生结果。根据使用的上下文，相同的 Polars 表达式可以产生不同的结果。在本节中，我们将了解 Polars 提供的四种最常见的上下文：

1. `select`
2. `with_columns`
3. `filter`
4. `group_by`

我们使用下面的 DataFrame 来展示每个上下文如何工作。

=== "Python"

    ```python linenums="1"
    from datetime import date

    df = pl.DataFrame(
        {
            "name": ["Alice Archer", "Ben Brown", "Chloe Cooper", "Daniel Donovan"],
            "birthdate": [
                date(1997, 1, 10),
                date(1985, 2, 15),
                date(1983, 3, 22),
                date(1981, 4, 30),
            ],
            "weight": [57.9, 72.5, 53.6, 83.1],  # (kg)
            "height": [1.56, 1.77, 1.65, 1.75],  # (m)
        }
    )

    print(df)
    ```

=== "Rust"

    ```rust linenums="1"
    use chrono::prelude::*;
    use polars::prelude::*;

    let df: DataFrame = df!(
        "name" => ["Alice Archer", "Ben Brown", "Chloe Cooper", "Daniel Donovan"],
        "birthdate" => [
            NaiveDate::from_ymd_opt(1997, 1, 10).unwrap(),
            NaiveDate::from_ymd_opt(1985, 2, 15).unwrap(),
            NaiveDate::from_ymd_opt(1983, 3, 22).unwrap(),
            NaiveDate::from_ymd_opt(1981, 4, 30).unwrap(),
        ],
        "weight" => [57.9, 72.5, 53.6, 83.1],  // (kg)
        "height" => [1.56, 1.77, 1.65, 1.75],  // (m)
      )
      .unwrap();
    println!("{df}");
    ```

#### 2.2.1 select

选择上下文 `select` 将表达式应用于列。`select` 上下文可以生成新的列，这些列可以是聚合结果、其他列的组合或字面值。

=== "Python"

    ```python linenums="1"
    result = df.select(
        bmi=bmi_expr,
        avg_bmi=bmi_expr.mean(),
        ideal_max_bmi=25,
    )
    print(result)
    ```

=== "Rust"

    ```rust linenums="1"
    let bmi = col("weight") / col("height").pow(2);
    let result = df
        .clone()
        .lazy()
        .select([
            bmi.clone().alias("bmi"),
            bmi.clone().mean().alias("avg_bmi"),
            lit(25).alias("ideal_max_bmi"),
        ])
        .collect()?;
    println!("{result}");
    ```

`select` 上下文中的表达式必须产生长度全部相同的 Series，或者产生一个标量。标量将被广播以匹配其余 Series 的长度。字面值（如上面使用的数字）也会被广播。

请注意，广播也可以发生在表达式内部。例如，考虑下面的表达式

=== "Python"

    ```python linenums="1"
    result = df.select(deviation=(bmi_expr - bmi_expr.mean()) / bmi_expr.std())
    print(result)
    ```

=== "Rust"

    ```rust linenums="1"
    let result = df
        .clone()
        .lazy()
        .select([((bmi.clone() - bmi.clone().mean()) / bmi.clone().std(1)).alias("deviation")])
        .collect()?;
    println!("{result}");
    ```

减法和除法都在表达式内部使用了广播，因为计算均值和标准差的子表达式都评估为单个值。

`select` 上下文非常灵活和强大，允许您独立且并行地评估任意表达式。对于接下来将看到的其他上下文也是如此。

#### 2.2.2 with_columns

`with_columns` 上下文与 `select` 上下文非常相似。两者之间的主要区别在于，`with_columns` 上下文会创建一个新的 DataFrame，其中包含原始 DataFrame 中的列以及根据其输入表达式生成的新列，而 `select` 上下文只包含其输入表达式选择的列。


=== "Python"

    ```python linenums="1"
    result = df.with_columns(
        bmi=bmi_expr,
        avg_bmi=bmi_expr.mean(),
        ideal_max_bmi=25,
    )
    print(result)
    ```

=== "Rust"

    ```rust linenums="1"
    let result = df
        .clone()
        .lazy()
        .with_columns([
            bmi.clone().alias("bmi"),
            bmi.clone().mean().alias("avg_bmi"),
            lit(25).alias("ideal_max_bmi"),
        ])
        .collect()?;
    println!("{result}");
    ```

由于 `select` 和 `with_columns` 之间的区别，`with_columns` 上下文使用的表达式必须生成与 DataFrame 中原始列长度相同的 Series，而 `select` 上下文中的表达式只需生成彼此长度相同的 Series 即可。
  
#### 2.2.3 filter

`filter` 上下文根据一个或多个评估为布尔数据类型的表达式来筛选 DataFrame 的行。

=== "Python"

    ```python linenums="1"
    result = df.filter(
        pl.col("birthdate").is_between(date(1982, 12, 31), date(1996, 1, 1)),
        pl.col("height") > 1.7,
    )
    print(result)
    ```

=== "Rust"

    ```rust linenums="1"
    let result = df
        .clone()
        .lazy()
        .filter(
            col("birthdate")
                .is_between(
                    lit(NaiveDate::from_ymd_opt(1982, 12, 31).unwrap()),
                    lit(NaiveDate::from_ymd_opt(1996, 1, 1).unwrap()),
                    ClosedInterval::Both,
                )
                .and(col("height").gt(lit(1.7))),
        )
        .collect()?;
    println!("{result}");
    ```

    !!! warning "注意"

        `is_between` 暂未在 Rust 中实现，后续会支持。

#### 2.2.4 group_by 和聚合

在 `group_by` 上下文中，行根据分组表达式的唯一值进行分组。然后，您可以将表达式应用于结果组，这些组的长度可能是可变的。在使用 `group_by` 上下文时，您可以使用表达式动态计算分组。

=== "Python"

    ```python linenums="1"
    result = df.group_by(
        (pl.col("birthdate").dt.year() // 10 * 10).alias("decade"),
    ).agg(pl.col("name"))
    print(result)
    ```

=== "Rust"

    ```rust linenums="1"
    let result = df
        .clone()
        .lazy()
        .group_by([(col("birthdate").dt().year() / lit(10) * lit(10)).alias("decade")])
        .agg([col("name")])
        .collect()?;
    println!("{result}");
    ```

使用 `group_by` 后，我们使用 `agg` 将聚合表达式应用于分组。由于在上述示例中我们只指定了列名，因此我们将该列的分组结果作为列表获取。

我们可以指定任意数量的分组表达式，`group_by` 上下文将根据指定表达式的 DISTINCT 值对行进行分组。在这里，我们根据出生年代和身高是否小于 1.7 米的组合进行分组

=== "Python"

    ```python linenums="1"
    result = df.group_by(
        (pl.col("birthdate").dt.year() // 10 * 10).alias("decade"),
        (pl.col("height") < 1.7).alias("short?"),
    ).agg(pl.col("name"))
    print(result)
    ```

=== "Rust"

    ```rust linenums="1"
    let result = df
        .clone()
        .lazy()
        .group_by([
            (col("birthdate").dt().year() / lit(10) * lit(10)).alias("decade"),
            (col("height").lt(lit(1.7)).alias("short?")),
        ])
        .agg([col("name")])
        .collect()?;
    println!("{result}");
    ```

应用聚合表达式后，结果 DataFrame 的左侧包含每个分组表达式对应的一列，然后是表示聚合表达式结果所需的任意数量的列。反过来，我们可以指定任意数量的聚合表达式。

=== "Python"

    ```python linenums="1"
    result = df.group_by(
        (pl.col("birthdate").dt.year() // 10 * 10).alias("decade"),
        (pl.col("height") < 1.7).alias("short?"),
    ).agg(
        pl.len(),
        pl.col("height").max().alias("tallest"),
        pl.col("weight", "height").mean().name.prefix("avg_"),
    )
    print(result)
    ```

=== "Rust"

    ```rust linenums="1"
    let result = df
        .clone()
        .lazy()
        .group_by([
            (col("birthdate").dt().year() / lit(10) * lit(10)).alias("decade"),
            (col("height").lt(lit(1.7)).alias("short?")),
        ])
        .agg([
            len(),
            col("height").max().alias("tallest"),
            cols(["weight", "height"]).mean().name().prefix("avg_"),
        ])
        .collect()?;
    println!("{result}");
    ```

有关其他分组上下文，另请参阅 `group_by_dynamic` 和 `rolling`。


### 2.3 表达式扩展

最后一个示例包含两个分组表达式和三个聚合表达式，但结果 DataFrame 却包含了六列而非五列。如果仔细观察，最后一个聚合表达式提到了两个不同的列：“weight”和“height”。

Polars 表达式支持一项名为表达式展开的功能。表达式展开类似于一种速记法，用于当您希望将相同的转换应用于多个列时。正如我们所见，该表达式

```python
pl.col("weight", "height").mean().name.prefix("avg_")
```

将计算“weight”和“height”列的均值，并分别将它们重命名为“avg_weight”和“avg_height”。实际上，上述表达式等同于使用以下两个表达式

```python
[
    pl.col("weight").mean().alias("avg_weight"),
    pl.col("height").mean().alias("avg_height"),
]
```

在这种情况下，此表达式展开为两个独立的表达式，Polars 可以并行执行。在其他情况下，我们可能无法预先知道一个表达式将展开成多少个独立的表达式。

考虑这个简单但具有启发性的示例

```python
(pl.col(pl.Float64) * 1.1).name.suffix("*1.1")
```

此表达式会将所有数据类型为 `Float64` 的列乘以 `1.1`。此表达式适用的列数取决于每个 DataFrame 的架构。在我们一直使用的 DataFrame 中，它适用于两列。


=== "Python"

    ```python linenums="1"
    expr = (pl.col(pl.Float64) * 1.1).name.suffix("*1.1")
    result = df.select(expr)
    print(result)
    ```

=== "Rust"

    ```rust linenums="1"
    let expr = (dtype_col(&DataType::Float64) * lit(1.1))
        .name()
        .suffix("*1.1");
    let result = df.clone().lazy().select([expr.clone()]).collect()?;
    println!("{result}");
    ```

在下面的 DataFrame `df2` 的情况下，同样的表达式展开为 0 列，因为没有列的数据类型是 `Float64`。

=== "Python"

    ```python linenums="1"
    df2 = pl.DataFrame(
        {
            "ints": [1, 2, 3, 4],
            "letters": ["A", "B", "C", "D"],
        }
    )
    result = df2.select(expr)
    print(result)
    ```

=== "Rust"

    ```rust linenums="1"
    let df2: DataFrame = df!(
        "ints" => [1, 2, 3, 4],
        "letters" => ["A", "B", "C", "D"],
    )
    .unwrap();
    let result = df2.clone().lazy().select([expr.clone()]).collect()?;
    println!("{result}");
    ```

同样容易想象，在某些场景下，相同的表达式会展开为数十列。

接下来，您将了解惰性 API 和 `explain` 函数，您可以使用它来预览给定架构下表达式将展开为何种形式。

## 3. 惰性 API

Polars 支持两种操作模式：**惰性**（lazy）和 **即时**（eager）。到目前为止的示例都使用了即时API，其中查询会立即执行。而在惰性API中，查询只有在被 *收集* 后才会被评估。将执行推迟到最后一刻可以带来显著的性能优势，这也是为什么在大多数情况下首选惰性API的原因。让我们通过一个例子来演示这一点。

=== "Python"

    ```python linenums="1"
    df = pl.read_csv("data/iris.csv")
    df_small = df.filter(pl.col("sepal_length") > 5)
    df_agg = df_small.group_by("species").agg(pl.col("sepal_width").mean())
    print(df_agg)
    ```

=== "Rust"

    ```rust linenums="1"
    let df = CsvReadOptions::default()
        .try_into_reader_with_file_path(Some("data/iris.csv".into()))
        .unwrap()
        .finish()
        .unwrap();
    let mask = df.column("sepal_length")?.f64()?.gt(5.0);
    let df_small = df.filter(&mask)?;
    #[allow(deprecated)]
    let df_agg = df_small
        .group_by(["species"])?
        .select(["sepal_width"])
        .mean()?
        ;
    println!("{}", df_agg);
    ```


在此示例中，我们使用即时API进行操作，以实现以下目的：

1. 读取 iris [数据集](https://archive.ics.uci.edu/dataset/53/iris)。
2. 根据萼片长度筛选数据集。
3. 计算每个物种的萼片宽度平均值。

每个步骤都立即执行并返回中间结果。这可能会非常浪费，因为我们可能会执行未使用的操作或加载额外的数据。如果我们转而使用惰性API，并等到所有步骤都定义后再执行，那么查询规划器就可以执行各种优化。在这种情况下：

- 谓词下推：在读取数据集时尽可能早地应用筛选器，从而只读取萼片长度大于 5 的行。
- 投影下推：在读取数据集时只选择所需的列，从而无需加载额外的列（例如，花瓣长度和花瓣宽度）。

=== "Python"

        ```python linenums="1"
        q = (
            pl.scan_csv("datasets/iris.csv")
            .filter(pl.col("sepal_length") > 5)
            .group_by("species")
            .agg(pl.col("sepal_width").mean())
        )
        df = q.collect()
        ```

=== "Rust"

        ```rust linenums="1"
        let q = LazyCsvReader::new(PlPath::new("datasets/iris.csv"))
            .with_has_header(true)
            .finish()?
            .filter(col("sepal_length").gt(lit(5.0)))
            .group_by(vec![col("species")])
            .agg([col("sepal_width").mean()])?;
        let df = q.collect()?;
        println!("{df}");
        ```
