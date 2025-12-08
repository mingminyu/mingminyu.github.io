# 第4章：数据预处理—构建好的训练数据集

> GitHub Notebook 地址: http://nbviewer.ipython.org/github/rasbt/python-machine-learning-book/blob/master/code/ch04/ch04.ipynb

机器学习算法最终学习结果的优劣取决于两个主要因素: 数据的质量和数据中蕴含的有用信息的数量。因此，在将数据集应用于学习算法之前，对其进行检验及预处理是至关重要的。在本章中，我们将讨论主要的预处理技术，使用这些技术可以高效地构建好的机器学习模型:

本章将涵盖如下主题:

- 数据集中缺失数据的删除和填充
- 数据格式化
- 模型构建中的特征选择

## 1. 缺失数据的处理

在实际应用过程中，样本由于各种原因缺少一个或多个值的情况并不少见。其原因主要有: 数据采集过程中出现了错误，常用的度量方法不适用于某些特征，或者在调查过程中某些数据未被填写，等等。通常，我们见到的缺失值是数据表中的空值，或者是类似于 `NaN` (Not A Number，非数字)的占位符。

遗憾的是，如果我们忽略这些缺失值，将导致大部分的计算工具无法对原始数据进行处理，或者得到某些不可预知的结果。因此，在做更深入的分析之前，必须对这些缺失值进行处理。而在讨论处理缺失值的几个技巧之前，我们先通过一个 CSV (comma-separed value, 以逗号为分隔的数据) 文件构造一个简单的例子，以便更好地把握问题的核心所在:

```python
import pandas as pd
from io import StringIO

csv_data = """A,B,C,D
1.0,2.0,3.0,4.0
5.0,6.0,,8.0
0.0,11.0,12.0,"""

# if you are using Python 2.7 you need
# to convert the string to unicode:
# csv_data = unicode(csv_data)
df = pd.read_csv(StringIO(csv_data))
print(df)
```

输出结果:

```python
     A     B     C    D
0  1.0   2.0   3.0  4.0
1  5.0   6.0   NaN  8.0
2  0.0  11.0  12.0  NaN
```

在上述代码中，我们通过 `read_csv` 函数将 CSV 格式的数据读取到 pandas 的数据框(DataFrame)中，可以看到: 其中两个缺失值由 `NaN` 替代。示例代码中的 `StringIO` 函数在此仅起到演示作用: 如果我们的数据是存储在硬盘上的 CSV 文件，就可以通过此函数以字符串的方式从文件中读取数据，并将其转换成 DataFrame 的格式赋值给 `csv_data`。

对于大的 DataFrame 来说，手工搜索缺失值是极其繁琐的，在此情况下，我们可以使用代码中的 `isnull` 方法返回一个布尔型的 DataFrame 值，若 DataFrame 的元素单元包含数字类型数值则返回值为假(False)，若数据值缺失则返回值为真(True)。通过 `sum` 方法，我们可以得到如下所示的每列中缺失值数量:

```python
print(df.isnull().sum())
```

输出结果：

```python
A    0
B    0
C    1
D    1
dtype: int64
```

通过这种方式，我们可以得到每列中缺失值的数量。在下面的小节中，我们将学习几种不同的处理缺失数据的策略。

> 虽然 scikit-learn 是在 NumPy 数组的基础上开发的，但有时使用 pandas 的 DataFrame 来处理数据会更为方便。在我们使用 scikit-learn 处理数据之前，可以通过 DataFrame 的 `values` 属性来访问相关的 NumPy 数组:

```python
print(df.values)
```

输出结果：

```python
[[ 1.  2.  3.  4.]
 [ 5.  6. nan  8.]
 [ 0. 11. 12. nan]]
```

### 1.1 将存在缺失值的特征或样本删除

处理缺失值数据最简单的方法就是: 将包含缺失数据的特征(列)或者样本(行)从数据集中删除。可通过 `dropna` 方法来删除数据集中包含缺失值的行:

```python
print(df.dropna())
```

输出结果:

```python
     A    B    C    D
0  1.0  2.0  3.0  4.0
```

类似的，我们可以将 `axis` 参数设为1，以删除数据集中至少包含1个 `NaN` 值的列:

```python
print(df.dropna(axis=1))
```

输出结果:

```python
     A     B
0  1.0   2.0
1  5.0   6.0
2  0.0  11.0
```

`dropna` 方法还支持其他参数，以应对各种缺失值得情况:

```python
# only drop rows where all columns are NaN
print(df.dropna(how='all'))

# drop rows that have not at least 4 non-NaN value
print(df.dropna(thresh=4))

# only drop rows where NaN appear in specific columns (here: 'C')
print(df.dropna(subset=['C']))
```

输出结果:

```python
     A     B     C    D
0  1.0   2.0   3.0  4.0
1  5.0   6.0   NaN  8.0
2  0.0  11.0  12.0  NaN

     A    B    C    D
0  1.0  2.0  3.0  4.0

     A     B     C    D
0  1.0   2.0   3.0  4.0
2  0.0  11.0  12.0  NaN
```

删除缺失数据看起来像是一种非常方便的方法，但也有一定的缺点，如: 我们可能会删除过多的样本，导致分析结果可靠性不高。从另一方面讲，如果删除了过多的特征列，有可能会面临丢失有价值信息的风险，而这些信息是分类器用来区分类别所必需的。在下一节，我们将学习另外一种最常用的处理缺失数据的方法，**插值技术**。

### 1.2 缺失数据填充

通常情况下，删除样本或者删除数据集中的整个特征列是不可行的，因为这样可能会丢失过多有价值的数据。在此情况下，我们可以使用不同的插值技术，通过数据集中其他训练样本的数据来估计缺失值。最常用的插值技术之一就是 **均值插补**(meaneinputation)，即使用相应的特征均值来替换缺失值。我们可使用 scikit-learn 中的 `Imputer` 类方法方便地实现此方法，代码如下:

```python
from sklearn.preprocessing import Imputer
import pandas as pd
from io import StringIO

csv_data = """A,B,C,D
1.0,2.0,3.0,4.0
5.0,6.0,,8.0
0.0,11.0,12.0,"""

df = pd.read_csv(StringIO(csv_data))

imr = Imputer(missing_values='NaN', strategy='mean', axis=0)
imr = imr.fit(df)
imputed_data = imr.transform(df.values)
print(imputed_data)
```

输出结果:

```python
[[ 1.   2.   3.   4. ]
 [ 5.   6.   7.5  8. ]
 [ 0.  11.  12.   6. ]]
```

在此，首先计算各特征列的均值，然后使用相应的特征均值对 `NaN` 进行替换。如果我们把参数 `axis=0` 改为 `axis=1`，则用每行的均值来进行相应的替换。参数 `strategy` 的可选项还有 `medium` 或者 `most_frequent`，后者代表使用对应行或者列中出现频次最高的值来替换缺失值，常用于填充类别特征值。

### 1.3 理解 scikit-learn 预估器的 API

在上一节中，我们使用了 scikit-learn 中的 `Imputer` 类填充我们数据集中的缺失值。`Imputer` 类属于 scikit-learn 中的转换器类，主要用于数据的转换。这些类中常用的两个方法是 `fit` 和 `transform`。其中，`fit` 方法用于对数据集中的参数进行识别并构建相应的数据补齐模型，而 `transform` 方法则使用刚构建的数据补齐模型对数据集中相应参数的缺失值进行补齐。所有待补齐数据的维度应该与数据补齐模型中其他数据的维度相同。下图解释了转换器如何对训练和测试数据进行数据处理(在此是数据补齐):

![](https://mingminyu.github.io/webassets/images/20251208/48.png)


我们在第3章中用到了分类器，它们在 scikit-learn 中属于预估器类别，其中 API 的设计与转换器非常相似。在后续内容中我们看到，预估器类包含一个 `predict` 方法，同时也包含一个 `transform` 方法。读者应该记得，我们在训练预估器用于分类任务时，同样使用了一个 `fit` 方法来对参数进行设定。在监督学习中，我们额外提供了类标用于构建模型，而模型可通过 `predict` 方法对新的样本数据展开预测，如下图所示:

![](https://mingminyu.github.io/webassets/images/20251208/49.png)

## 2. 处理类别数据

到目前为止，我们仅学习了处理数值型数据的方法。然而，在真实数据集中，经常会出现一个或多个类别数据的特征列。我们在讨论类别数据时，又可以进一步将他们划分为 **标称特征**(normal feature) 和 **有序特征**(ordinal feature)。可以将有序特征理解为类别的值是有序的或者是可以排序的。如Ｔ恤衫的尺寸就是一个有序特征，因为我们可以为其值排序 `XL` > `L` > `M`。相反，标称数据则不具备排序的特征。继续刚才的例子，我们可以将Ｔ恤衫的颜色看做一个标称特征，因为一般说来，对颜色进行比较，如红色大于蓝色这种说法不符合常理的。

在探索类别数据的处理技巧之前，我们先构建了一个数据集用来描述问题:

```python
import pandas as pd

data = [['green', 'M', 10.1, 'class1'],
		['red', 'L', 13.5, 'class2'],
		['blue', 'XL', 15.3, 'class1']]

df = pd.DataFrame(data)

df.columns = ['color', 'size', 'price', 'classlabel']
print(df)
```

输出结果:

```python
   color size  price classlabel
0  green    M   10.1     class1
1    red    L   13.5     class2
2   blue   XL   15.3     class1
```

从代码的输出结果可以看到，我们新构造的 DataFrame 分别包含一个标称特征(颜色)、一个有序特征(尺寸)以及一个数值特征(价格)。类标(此处假定我们构造的数据集用于监督学习)存储在最后一列。在本书中，我们讨论的分类学习算法中均不使用有序信息作为类标。

### 2.1 有序特征的映射

为了确保学习算法可以正确地使用有序特征，我们需要将类别字符串转换为整数。但是，没有一个适当的方法可以自动将尺寸特征转换为正确的顺序。由此，需要我们手工定义相应的映射。在接下来的例子中，假设我们了解了特征值间的差异，如: `XL=L+1=M+2`。

```python
df.columns = ['color', 'size', 'price', 'classlabel']
size_mapping = {'XL':3, 'L':2, 'M':1}
df['size'] = df['size'].map(size_mapping)
print(df)
```

输出结果:

```python
   color  size  price classlabel
0  green     1   10.1     class1
1    red     2   13.5     class2
2   blue     3   15.3     class1
```


如果在后续过程中需要将整数值还原为有序字符串，可以简单地定义一个逆映射字典，`inv_size_mapping = {v:k for k, v in size_mapping.items()}`，与前面用到的 `size_mapping` 类似，可以通过 pandas 的 `map` 方法将 `inv_size_mapping` 应用于转换的特征列上。

```python
inv_size_mapping = {v: k for k,v in size_mapping.items()}
df['size'] = df['size'].map(inv_size_mapping)
print(df)
```

输出结果:

```python
   color size  price classlabel
0  green    M   10.1     class1
1    red    L   13.5     class2
2   blue   XL   15.3     class1
```

### 2.2 类标的编码

许多机器学习库要求类标以整数值得方式进行编码。虽然 scikit-learn 中大多数分类预估器都会在内部将类标转换为整数，但通过将类转换为整数序列能够从技术角度避免某些问题的产生，在实践中这被认为是一个很好地做法。为了对类标进行编码，可以采用与前面讨论的有序特征映射相类似的方式。要清楚一点，类标并不是有序的，而且对于特定的字符串类标，赋予哪个整数值给它对我们来说并不重要。因此，我们可以简单地以枚举类型的方式从 0 开始设定类标。

```python
import numpy as np

class_mapping = {label: idx for idx, label in enumerate(np.unique(df['classlabel']))}
print(class_mapping)
```

输出结果:

```python
{'class2': 1, 'class1': 0}
```

接下来，我们可以使用映射字典将类标转换为整数:

```python
df['classlabel'] = df['classlabel'].map(class_mapping)
print(df)
```

输出结果:

```python
   color  size  price  classlabel
0  green     1   10.1           0
1    red     2   13.5           1
2   blue     3   15.3           0
```


我们可以通过下列代码将映射字典中的键-值对倒置，以将转换过的类标还原成原始的字符串表示:

```python
inv_class_mapping = {v: k for k,v in class_mapping.items()}
df['classlabel'] = df['classlabel'].map(inv_class_mapping)
print(df)
```

输出结果:

```python
   color  size  price classlabel
0  green     1   10.1     class1
1    red     2   13.5     class2
2   blue     3   15.3     class1
```

此外，使用 scikit-learn 中的 `LabelEncoder `类可以更加方便地完成对类标的整数编码工作:

```python
import pandas as pd
from sklearn.preprocessing import LabelEncoder

data = [['green', 'M', 10.1, 'class1'],
		['red', 'L', 13.5, 'class2'],
		['blue', 'XL', 15.3, 'class1']]
df = pd.DataFrame(data)
df.columns = ['color', 'size', 'price', 'classlabel']
class_le = LabelEncoder()
y = class_le.fit_transform(df['classlabel'].values)
print(y)
```

输出结果:

```python
[0 1 0]
```

请注意，`fit_transform` 方法相当于分别调用 `fit` 和 `transform` 方法的快捷方式，我们还以使用 `inverse_transform` 方法将整数类标还原为原始的字符串表示:

```python
print(class_le.inverse_transform(y))
```

输出结果；

```python
['class1' 'class2' 'class1']
```

### 2.3 标称特征上的独热编码

在前面小节中，我们曾使用字典映射的方法将有序的尺寸特征转换为整数。由于 scikit-learn 的预估器将类标作为无序数据进行处理，可以使用 scikit-learn 中的 `LabelEncoder` 类将字符串类标转换为整数。同样，也可以用此方法处理数据集中标称数据格式的 color 列，代码如下:

```python
X = df[['color', 'size', 'price']].values
color_le = LabelEncoder()
X[:, 0] = color_le.fit_transform(X[:, 0])
print(X)
```

输出结果:

```python
[[1 1 10.1]
 [2 2 13.5]
 [0 3 15.3]]
```

执行上述代码，NumPy 数组 X 的第一列现在被赋予新的 color 值，具体编码结果如下:

- blue $\to$ 0
- green $\to$ 1
- red $\to$ 2

如果我们就此打住，直接将得到的数组导入分类器，那么就会犯处理类别数据时最常见的错误。读者发现问题所在了吗？虽然颜色的值并没有特定的顺序，但是学习算法将假定 green 大于 blue、red 大于 green。虽然算法的这一假定不太合理，但最终还是能够生成有用的结果。然而，这个结果可能不是最优的。

解决此问题最常用的方法就是**独热编码**(one-hot encoding)技术。这种方法的理念就是创建一个新的**虚拟特征**(dummy feature)，虚拟特征的每一列各代表标称数据的一个值。在此，我们将 color 特征转换为三个新的特征: blue、green 以及 red。此时可以使用二进制值来标识样本的样色。例如，蓝色样本可以表示为: blue=1，green=0 以及 red=0。此编码转换操作可以使用 `scikiit-learn.preprocessing` 模块中的 `OneHotEncoder` 来实现:

```python
import pandas as pd
from sklearn.preprocessing import LabelEncoder
from sklearn.preprocessing import OneHotEncoder

data = [['green', 'M', 10.1, 'class1'],
		['red', 'L', 13.5, 'class2'],
		['blue', 'XL', 15.3, 'class1']]
df = pd.DataFrame(data)
df.columns = ['color', 'size', 'price', 'classlabel']
size_mapping = {'XL':3, 'L':2, 'M':1}
df['size'] = df['size'].map(size_mapping)

class_le = LabelEncoder()
y = class_le.fit_transform(df['classlabel'].values)
print(y)

X = df[['color', 'size', 'price']].values
color_le = LabelEncoder()
X[:, 0] = color_le.fit_transform(X[:, 0])
print(X)

ohe = OneHotEncoder(categorical_features=[0])
print(ohe.fit_transform(X).toarray())
```

输出结果:

```python
[[  0.    1.    0.    1.   10.1]
 [  0.    0.    1.    2.   13.5]
 [  1.    0.    0.    3.   15.3]]
```


当我们初始化 `OneHotEncoder` 对象时，需要通过 `categorical_features` 参数来选定我们要转换的特征所在的位置(如 color 是特征矩阵 X 的第1列)。默认情况下，当我们调用 `OneHotEncoder` 的 `transform` 方法时，它会返回一个**稀疏矩阵**。出于可视化的考虑，我们可以通过 `toarray` 方法将其转换为一个常规的 NumPy 数组。稀疏矩阵是存储大型数据集的一个有效方法，被许多 scikit-learn 函数所支持，特别是在数据包含很多零值时非常有用。为了略过 `toarray` 的使用步骤，我们也可以通过在初始化阶段使用 `OneHotEncoder(...,sparse=False)` 来返回一个常规的 NumPy 数组。

另外，我们可以通过 pandas 中的 `get_dummies` 方法，更加方便地实现独热编码技术中的虚拟特征。当应用于 DataFrame 数据时，`get_dummies` 方法只对字符串进行转换，而其他的列保持不变。

```python
print(pd.get_dummies(df[['price', 'color', 'size']]))
```

输出结果:

```python
   price  size  color_blue  color_green  color_red
0   10.1     1           0            1          0
1   13.5     2           0            0          1
2   15.3     3           1            0          0
```

## 3. 将数据划分为训练数据集和测试数据集

在第1章和第3章中，我们简单介绍了将数据集划分为训练数据集和测试数据集的相关内容。请记住，我们可以将测试数据集理解为模型投诸于现实应用的最终测试集。在本小节，我们准备了一个新的数据集，葡萄酒数据集(Wine dataset)。在完成数据集的预处理后，我们将探讨不同的特征选择技巧以降低数据集的维度。

葡萄酒数据集是另一个开源数据集，可以通过 UCI 机器学习样本数据库获得 (https://archive.ics.uci.edu/ml/datasets/Wine )，它包含178个葡萄酒样本，每个样本通过13个特征对其化学特征进行描述。

借助于 pandas 库，可以直接从 UCI 机器学习样本数据库中在线读取开源的葡萄酒数据集。

```python
import pandas as pd
import numpy as np

df_wine = pd.read_csv(r'https://archive.ics.uci.edu/ml/machine-learning-databases/wine/wine.data', header=None)
df_wine.columns = ['Class label', 'Alcohol', 'Malic acid', 'Ash', 'Alcalinity of ash', 
	'Magnesium', 'Total phenols', 'Flavanoids', 'Nonflavanoid phenols', 
	'Proanthocyanins', 'Color intensity', 'Hue', 'OD280/OD315 of diluted wines', 'Proline']
print('Class labels', np.unique(df_wine['Class label']))
print(df_wine.head())
```

输出结果:

```python
('Class labels', array([1, 2, 3]))

   Class label  Alcohol  Malic acid   Ash  Alcalinity of ash  Magnesium  \
0            1    14.23        1.71  2.43               15.6        127   
1            1    13.20        1.78  2.14               11.2        100   
2            1    13.16        2.36  2.67               18.6        101   
3            1    14.37        1.95  2.50               16.8        113   
4            1    13.24        2.59  2.87               21.0        118   

   Total phenols  Flavanoids  Nonflavanoid phenols  Proanthocyanins  \
0           2.80        3.06                  0.28             2.29   
1           2.65        2.76                  0.26             1.28   
2           2.80        3.24                  0.30             2.81   
3           3.85        3.49                  0.24             2.18   
4           2.80        2.69                  0.39             1.82   

   Color intensity   Hue  OD280/OD315 of diluted wines  Proline  
0             5.64  1.04                          3.92     1065  
1             4.38  1.05                          3.40     1050  
2             5.68  1.03                          3.17     1185  
3             7.80  0.86                          3.45     1480  
4             4.32  1.04                          2.93      735  
```

这些样本属于类标分别为 1、2、3 的三个不同的类别，对应与三种生长在意大利不同地区的葡萄种类。

想要将此数据集随机划分为测试数据集和训练数据集，一个简便方法是使用 scikit-learn 下 `cross_validation` 子模块中的 `train_test_split` 函数(`cross_validation` 现更新为 `model_selection`):

```python
from sklearn.cross_validation import train_test_split

X, y = df_wine.iloc[:, 1:].values, df_wine.iloc[:, 0].values
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0)
```

首先，将 NumPy 数组中的第1~13个特征赋值给变量 X，将第1列的类标赋值给变量 y。然后，使用 `train_test_split` 函数随机地将 X 和 y 各自划分为训练数据集和测试数据集。设定 `test_size=0.3`，可以将 30% 的样本划分到 `X_test` 和 `y_test`，剩余的 70% 样本划分到 `X_train` 及 `y_train`。

> 如果要将数据集划分为训练和测试数据集，必须牢记: 尽量保留有价值的信息，这些信息将有利于训练机器学习算法。因此，我们一般不会为测试数据集分配太多的数据。不过，测试集越小，对泛化误差的估计就越不准确。在对数据集进行划分时，需要对此进行衡量。在实际应用中，基于原始数据的大小，常用的划分比例是 60:40、70:30 或者 80:20。对于非常庞大的数据集，将训练集和测试集的比例按照 90:10 或者 99:1 进行划分也是常见且可以接受的。为了让模型获得最佳的性能，完成分类模型的测试后，通常在整个数据集上需要再次对模型进行训练。

## 4. 将特征值缩放到相同的区间

**特征缩放**(feature scaling) 是数据预处理过程中至关重要的一步，但却极易被人们忽略。**决策树和随机森林是机器学习算法中为数不多的不需要进行特征缩放的算法**。然而，对大多数机器学习和优化算法而言，将特征的值缩放到相同的区间可以使其性能更佳，例如在对第2章实现的**梯度下降**(gradient descent) 优化算法。

特征缩放的重要性可以通过一个简单的例子来描述。假定我们有两个特征: 一个特征值的范围为 1 ~ 10；另一个特征值的范围为 1~100000。回忆一下第2章中 Adaline 的平方误差函数，直观地说，算法将主要根据第二个特征上较大的误差进行权重的优化。另外还有 **k-近邻**(k-nearest neighbor, KNN) 算法，它以**欧几里得距离**作为相似性度量，样本间距离的计算也以第二个特征为主。

目前，将不同的特征缩放到相同的有两个常用的方法，**归一化**(normalization) 和**标准化**(standardization)。这两个词在不同的领域中使用较为宽松，其含义由具体语境所确定。多数情况下，**归一化**指的是将特征的值缩放到区间 `[0, 1]`，它是**最小-最大缩放**的一个特例。为了对数据进行规范化处理，我们可以简单地在每个特征列上使用 `min-max` 缩放，通过如下公式可以计算出一个新的样本 $x^{(i)}$ 的值 $x_{norm}^{(i)}$:

$$
x_{norm}^{(i)} = \frac {x^{(i)} - x_{min}}{x_{max} - x_{min}}
$$

其中，$x^{(i)}$ 是一个特定的样本，$x_{min}$ 和 $x_{max}$ 分别是某特征列的最小值和最大值。

在 scikit-learn 中，已经实现了最小-最大缩放，使用方法如下:

```python
from  sklearn.preprocessing import MinMaxScaler

mms = MinMaxScaler()
X_train_norm = mms.fit_transform(X_train)
X_test_norm = mms.transform(X_test)
```

当遇到需将数值限定在一个有界区间的情况时，我们常采用最小-最大缩放进行有效的规范化。但在大部分机器学习算法中，标准化的方法却更加实用。这是因为: 许多线性模型，如第4章中讨论的逻辑斯蒂回归和支持向量机，在对它们进行训练的最初阶段，即权重初始化阶段，可将其值设定0 或者趋近于0 的随机极小值。通过标准化，我们可以将特征列的均值设为0，方差为1，使得特征列的值呈现标准正态分布，这更易于权重的更新。此外，与最小-最大缩放将值限定在一个有限的区间不同，标准化方法保持了异常值所蕴含的有用信息，并且使得算法受到这些值得影响较小。

$$
x_{std}^{(i)} = \frac {x^{(i)} - \mu_x}{\sigma_x}
$$
其中，$\mu_x$ 和 $\sigma_x$ 分别为样本某个特征列的均值和标准差。

在包含值为 0~5 的数据样本上，采用标准化和归一化两种常用的技术进行特征缩放，其两者之间的区别如下所示:

| 输入 |   标准化    | 归一化 |
| :--: | :---------: | :----: |
| 0.0  | -1.46385011 |  0.0   |
| 1.0  | -0.87831007 |  0.2   |
| 2.0  | -0.29277002 |  0.4   |
| 3.0  | 0.29277002  |  0.6   |
| 4.0  | 0.87831007  |  0.8   |
| 5.0  | 1.46385011  |  1.0   |

均值为2.5，方差 $\sigma^2 = 2 \cdot \frac {1}{6} \left( 2.5^2 + 1.5^2 + 0.5^2 \right) = \frac {35}{12}$。

与 `MinMaxScale` 类似，scikit-learn 也已经实现了标准化类:

```python
from sklearn.preprocessing import StandardScaler

stdsc = StandardScaler()
X_train_std = stdsc.fit_transform(X_train)
X_test_std = stdsc.transform(X_test)
```

需要再次强调，我们只是使用了 StandardScaler 对训练数据进行拟合，并使用相同的拟合参数来完成对测试集以及未知数据的转换。

## 5. 选择有意义的特征

如果一个模型在训练数据集上的表现比测试数据集上好很多，这意味着模型**过拟合**(overfitting)于训练数据。过拟合是指模型参数对于训练数据集的特定观测值拟合得非常接近，但训练数据集的分布与真实数据并不一致——我们称之为模型具有较高的方差。产生过拟合的原因是建立在给定训练数据集上的模型过于复杂，而常用的降低泛化误差的方案有:

1. 收集更多的训练数据
2. 通过正则化引入惩罚项
3. 选择一个参数相对较小的模型
4. 降低数据的维度

一般来说，收集更多的训练数据不太适用。在下一章中，我们将讨论一种更为有用的技术，以验证收集更多训练数据是否能够对解决过拟合问题有所帮助。而在本章的后续内容中，我们将讨论正则化和特征选择降维这两种常用的减少过拟合问题的方法。

### 5.1 使用 L1 正则化满足数据稀疏化

回归一下第3章中的内容，L2 正则化是通过对大的权重增加惩罚项以降低模型复杂度的一种方法。其中，权重向量 $w$ 的 L2 范数如下:

$$
L2: \parallel  w \parallel_2^2 = \sum_{j=1}^{m} w_j^2 
$$
另外一种降低模型复杂度的方法则与 L1 正则化相关：

$$
L1: \parallel  w \parallel_1 = \sum_{j=1}^{m} |w_j|
$$
在此，我们只是简单地将权重的平方和用权重的绝对值的和来替代。与 L2 正则化不同，L1 正则化可生成稀疏的特征向量，且大多数的权值为0。当高维数据集中包含许多不相关的特征，尤其是不相关的特征数量大于样本数量时，权重稀疏化处理能够发挥很大的作用。从这个角度来看，L1 正则化可以被看作一种特征选择技术。

为了更好地理解 L1 正则化如何对数据进行稀疏化，我们先退一步，来看一下正则化的几何解释。我们先绘制权重系数 $w_1$ 和 $w_2$ 的凸代价函数的等高线。在此，我们将使用第2章中 Adaline 算法所采用的代价函数——误差平方和(sum of the squared errors, SSE) 作为代价函数，因为它的图像是对称的，且比逻辑斯蒂回归的代价函数易于绘制。在后续内容中，我们将再次使用此代价函数。请记住，我们的目标是找到一个权重系数的组合，能够使得训练数据的代价函数最小，如下图所示(椭圆中心的圆点):

![](https://mingminyu.github.io/webassets/images/20251208/50.png)


至此，我们可以将正则化看作是在代价函数中增加一个惩罚项，以对小的权重做出激励，换句话说，我们对大的权重做出了惩罚。

这样，通过正则化参数 $\lambda$ 来增加正则化项的强度，使得权重向 0 收缩，就降低了模型对训练数据的依赖程度。我们使用下图来阐述 L2 惩罚项的概念。

![](https://mingminyu.github.io/webassets/images/20251208/50.png)

我们使用阴影表示的球代表二次的 L2 正则化项。在此，我们的权重系数不能超出正则化的区域——权重的组合不能落在阴影以外的区域。另一方面，我们仍然希望能够使得代价函数最小化。在惩罚项的约束下，最好的选择就是 L2 球与不含有惩罚项的代价函数等高线的切点。正则化参数 $\lambda$ 的值越大，含有惩罚项的代价函数增长得就越快，L2 的球就会越小。例如，如果增大正则化参数的值，使之趋向于无穷大，权重系数将趋近于0，即图像上所示的 L2 球的圆心。总结一下这个例子的主要内容: 我们的目标是使得代价函数和惩罚项之和最小，这可以理解为通过增加偏差使得模型趋向于简单，以降低在训练数据不足的情况下拟合得到的模型的方差。

现在来讨论 L1 正则化与稀疏问题。L1 正则化的主要概念与我们之前所讨论的相类似。不过，由于 L1 的惩罚项是权重系数的绝对值的和(请记住L2惩罚项是二次的)，我们可以将其表示为菱形区域，如下图所示:

![](https://mingminyu.github.io/webassets/images/20251208/51.png)

在上图中，代价函数等高线与 L1 菱形在 $w_1$ 处相交。由于 L1 的边界不是圆滑的，这个交叉点更有可能是最优的——也就是说，椭圆形的代价函数边界与 L1 菱形边界的交点位于坐标轴上，这也就使得模型更加稀疏。L1 正则化如何导致数据稀疏的数学论证已经超出了本书的范围。如果你感兴趣，请参阅 Trevor Hastie、Robert Tibshirani 和 Jerome Friedman 的著作 The Elements of Statistical Learning 中的第3，4节，里面有关于 L2 与 L1 正则化的精彩论述。

对于 scikit-learn 中支持 L1 的正则化模型，我们可以通过将 `penalty` 参数设定为 `'l1'` 来进行简单的数据稀疏处理:

```python linenums="1"
from sklearn.linear_model import LogisticRegression
LogisticRegression(penalty='l1')	
```

将其应用于经过标准化处理的葡萄酒数据，经过 L1 正则化的逻辑斯蒂回归模型可以产生如下稀疏化结果:

```python
import pandas as pd
import numpy as np
from sklearn.cross_validation import train_test_split
from  sklearn.preprocessing import MinMaxScaler
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression

df_wine = pd.read_csv(r'https://archive.ics.uci.edu/ml/machine-learning-databases/wine/wine.data', header=None)
df_wine.columns = ['Class label', 'Alcohol', 'Malic acid', 'Ash', 'Alcalinity of ash', 
	'Magnesium', 'Total phenols', 'Flavanoids', 'Nonflavanoid phenols', 
	'Proanthocyanins', 'Color intensity', 'Hue', 'OD280/OD315 of diluted wines', 'Proline']
# print('Class labels', np.unique(df_wine['Class label']))

X, y = df_wine.iloc[:, 1:].values, df_wine.iloc[:, 0].values
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0)

mms = MinMaxScaler()
X_train_norm = mms.fit_transform(X_train)
X_test_norm = mms.transform(X_test)

stdsc = StandardScaler()
X_train_std = stdsc.fit_transform(X_train)
X_test_std = stdsc.transform(X_test)

lr = LogisticRegression(penalty='l1', C=0.1)
lr.fit(X_train_std, y_train)
print('Training accuracy: ', lr.score(X_train_std, y_train))
print('Test accuracy: ', lr.score(X_test_std, y_test))
```

输出结果:

```python
('Training accuracy: ', 0.9838709677419355)
('Test accuracy: ', 0.98148148148148151)
```

训练和测试的准确度(均为98%) 显示此模型未出现过拟合。通过 `lr.intercept_` 属性得到截距项后，可以看到代码返回了包含三个数值的数组:

```python
print(lr.coef_)
```

输出结果:

```python
[[ 0.28044324  0.          0.         -0.02790873  0.          0.
   0.71024779  0.          0.          0.          0.          0.
   1.23607524]
 [-0.64377174 -0.06896526 -0.05717346  0.          0.          0.          0.
   0.          0.         -0.9272206   0.0598155   0.         -0.37100844]
 [ 0.          0.06150185  0.          0.          0.          0.
  -0.63552342  0.          0.          0.49784365 -0.35835311 -0.57186354
   0.        ]]
```

通过 `lr.coef_` 属性得到的权重数组包含三个权重系数向量，每一个权重向量对应一个分类。每一个向量包含 13个权重值，通过13维的葡萄酒数据集中的特征数据相乘来计算模型的输入:

$$
z = w_1x_1 + \cdots + w_mx_m = \sum_{j=0}^m x_jw_j = w^Tx
$$

我们注意到，权重向量是稀疏的，这意味着只有少数几个非零项。在 L1 正则化特征选择的作用下，我们训练了一个模型，该模型对数据集上可能存在的不相关特征是鲁棒的。

最后，我们来绘制一下正则化效果的图，它展示了将权重系数(正则化参数) 应用于多个特征上时产生的不同的正则化效果:

```python linenums="1"
import matplotlib.pyplot as plt
import numpy as np
from sklearn.linear_model import LogisticRegression
import pandas as pd
from sklearn.cross_validation import train_test_split
from sklearn.preprocessing import StandardScaler

df_wine = pd.read_csv(r'https://archive.ics.uci.edu/ml/machine-learning-databases/wine/wine.data', header=None)
df_wine.columns = ['Class label', 'Alcohol', 'Malic acid', 'Ash', 'Alcalinity of ash', 
	'Magnesium', 'Total phenols', 'Flavanoids', 'Nonflavanoid phenols', 
	'Proanthocyanins', 'Color intensity', 'Hue', 'OD280/OD315 of diluted wines', 'Proline']

X, y = df_wine.iloc[:, 1:].values, df_wine.iloc[:, 0].values
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0)

stdsc = StandardScaler()
X_train_std = stdsc.fit_transform(X_train)
X_test_std = stdsc.transform(X_test)

fig = plt.figure()
ax = plt.subplot(111)
colors = ['blue', 'green', 'red', 'cyan', 'magenta', 'yellow', 'black',
		  'pink', 'lightgreen', 'lightblue', 'gray', 'indigo', 'orange']
weights, params = [], []

for c in np.arange(-4, 6):
	lr = LogisticRegression(penalty='l1', C=10.0**c, random_state=0)
	lr.fit(X_train_std, y_train)
	weights.append(lr.coef_[1])
	params.append(10.0**c)

weights = np.array(weights)

for column, color in zip(range(weights.shape[1]), colors):
	plt.plot(params, weights[:, column], label=df_wine.columns[column+1], color=color)

plt.axhline(0, color='black', linestyle='--', linewidth=3)
plt.xlim(10**(-5), 10**5)
plt.ylabel('weight coefficient')
plt.xlabel('C')
plt.xscale('log')
plt.legend(loc='upper left')
ax.legend(loc='upper center', bbox_to_anchor=(1.38, 1.03), ncol=1, fancybox=True)
plt.show()
```

通过下图，我们能对 L1 正则化有个更深入的认识。可以看到，在强的正则化参数(C < 0.1)作用下，惩罚项使得所有的特征权重都趋近于 0，这里，C 是正则化参数 $\lambda$ 的倒数。

![](https://mingminyu.github.io/webassets/images/20251208/52.png)

### 5.2 序列特征选择算法

另外一种降低模型复杂度从而解决过拟合问题的方法是通过特征选择 **降维**(dimensionality reduction)，该方法对未经正则化处理的模型特别有效。降维技术主要分为两个大类: 特征选择和特征提取。通过特征选择，我们可以选出原始特征的一个子集。而在特征提取中，通过对现有的特征信息进行推演，构造出一个新的特征子空间。在本节，我们将着眼于一些经典的特征选择算法。第5章会介绍几种特征抽取技术，以将数据集压缩到低维的特征子空间。

序列特征选择算法是一种贪婪搜索算法，用于将原始的 $d$ 维特征空间压缩到一个 $k$ 维特征子空间，其中 $k<d$。使用特征选择算法出于以下考虑: 能够剔除不不相关特征或噪声，自动选出与问题最相关的特征子集，从而提高计算效率或是降低模型的泛化误差。这在模型不支持正则化尤为有效。一个经典的序列特征选择算法时序列后向选择算法(Sequential Backward Selection, SBS),其目的是在分类性能衰减的约束下，降低原始特征空间上的数据维度，以提高效率。在某些情况下，SBS 甚至可以在模型面临过拟合问题时提高模型的能力。

> 与穷举搜索算法相比，贪心算法可以在组合搜索的各阶段找到一个局部最优选择，进而得到待解决问题的次优解。不过在实际应用中，由于巨大的计算成本，往往使得穷举搜索算法不可行，而贪心算法可以找到不那么复杂，且计算效率更高的解决方案。

SBS 算法背后的理念非常简单，SBS 依次从特征集合中删除某些特征，直到新的特征子空间包含指定数量的特征。为了确定每一步中所需删除的特征，我们定义一个需要最小化的标准衡量函数 $J$。该函数的计算准则是: 比较判定分类器的性能在删除某个特定特征前后的差异。由此，每一步中待删除的特征，就是那些能够使得标准衡量函数值尽可能大的特征，或者更直观地说: 每一步中特征被删除后，所引起的模型性能损失最小。基于上述对 SBS 的定义，我们可以将算法总结为四个简单的步骤:

1. 设 $k=d$ 进行算法初始化，其中 $d$ 是特征空间 $X_d$ 的维度。
2. 定义 $x^-$ 为满足标准 $x^- = argmaxJ(X_k - x)$ 最大化的特征，其中 $x \in X_k$。
3. 将特征 $x^-$ 从特征集中删除: $X_{k-1} = X_k - x^-$，$k=k-1$
4. 如果 $k$ 等于目标特征数量，算法终止，否则跳转第2步。

> 如果想更多了解序列特征选择算法的先关问题，请参阅文献: Comparative Study of Techniques for Large Scale Feature Selection, F.Ferri, P.Pudil, M.Hatef, and J.Kittler. Comparative study of techniques for large-scale feature selection. Pattern Recognition in Practice Tv, pages 403-413, 1994.

遗憾的是，scikit-learn 中并没有实现 SBS 算法。不过它相当简单，我们可以使用 Python 来实现:

```python linenums="1"
from sklearn.base import clone
from itertools import combinations
import numpy as np
from sklearn.cross_validation import train_test_split
from sklearn.metrics import accuracy_score

class SBS():
    def __init__(self, estimator, k_features, 
        scoring=accuracy_score, test_size=0.25, random_state=1):
        self.scoring = scoring
        self.estimator = clone(estimator)
        self.k_features = k_features
        self.test_size = test_size
        self.random_state = random_state

	def fit(self, X, y):
		X_train, X_test, y_train, y_test = train_test_split(X, y, 
					test_size=self.test_size, random_state=self.random_state)
        dim = X_train.shape[1]
        self.indices_ = tuple(range(dim))
        self.subsets_ = [self.indices_]
        score = self._calc_score(X_train, y_train, X_test, y_test, self.indices_)
        self.scores_ = [score]

        while dim > self.k_features:
          	scores = []
          	subsets = []

			for p in combinations(self.indices_, r=dim-1):
					score = self._calc_score(X_train, y_train, X_test, y_test, p)
					scores.append(score)
					subsets.append(p)

			best = np.argmax(scores)
			self.indices_ = subsets[best]
			self.subsets_.append(self.indices_)
			dim -= 1

			self.scores_.append(scores[best])
		self.k_score_ = self.scores_[-1]
		return self

	def trainform(self, X):
		return x[:, self.indices_]

	def _calc_score(self, X_train, y_train, X_test, y_test, indices):
		self.estimator.fit(X_train[:, indices], y_train)
		y_pred = self.estimator.predict(X_test[:, indices])
		score = self.scoring(y_test, y_pred)
		return score
```

在前面的实现中，我们使用参数 `k_features` 来指定需返回的特征数量。默认情况下，我们使用 scikit-learn 中的 accuracy_score 去衡量分类器的模型和评估器在特定空间上的性能。在 fit 方法的 while 循环中，通过 itertools.combination 函数创建的特征子集循环地进行评估和删减，直到特征子集达到预期维度。在每次迭代中，基于内部测试数据集 `X_test` 创建的 `self.scores_` 列表存储了最优特征子集的准确度分值。后续我们将使用这些分值来对结果做出评价。最终特征子集的列标被赋值给 `self.indices_`，我们可以通过 transform 方法返回由选定特征列构成的一个新数组。请注意，我们没有在 fit 方法中明确地计算评价标准，而只是简单地删除了那些没有包含在最优特征子集中的特征。

现在，来看一下我们实现的 SBS 应用于 scikit-learn 中 KNN 分类器的效果:

```python
from sklearn.neighbors import KNeighborsClassifier
import matplotlib.pyplot as plt
import numpy as np
from sklearn.linear_model import LogisticRegression
import pandas as pd
from sklearn.cross_validation import train_test_split
from sklearn.preprocessing import StandardScaler
from SBS import SBS

df_wine = pd.read_csv(r'https://archive.ics.uci.edu/ml/machine-learning-databases/wine/wine.data', header=None)
df_wine.columns = ['Class label', 'Alcohol', 'Malic acid', 'Ash', 'Alcalinity of ash', 
		'Magnesium', 'Total phenols', 'Flavanoids', 'Nonflavanoid phenols', 
		'Proanthocyanins', 'Color intensity', 'Hue', 'OD280/OD315 of diluted wines', 'Proline']

X, y = df_wine.iloc[:, 1:].values, df_wine.iloc[:, 0].values
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0)

stdsc = StandardScaler()
X_train_std = stdsc.fit_transform(X_train)
X_test_std = stdsc.transform(X_test)

knn = KNeighborsClassifier(n_neighbors=2)
sbs = SBS(knn, k_features=1)
sbs.fit(X_train_std, y_train)
```

在 SBS 的实现中，已经在 fit 函数内将数据集划分为测试数据集和训练数据集，我们依旧将训练数据集 `X_train` 输入到算法中。SBS 的 fit 方法将建立在一个新的训练子集用于测试(验证) 和训练，这也是为什么这里的测试数据集被称为**验证数据集**的原因。这也是一种避免原始测试数据集变成训练数据集的必要方法。

我们的 SBS 算法在每一步中存储了最优特征子集的分值，下面进入代码实现中更为精彩的部分: 绘制出 KNN 分类器的分类准确率，准确率数值实在验证数据集上计算出的。代码如下:

```python
k_feat = [len(k) for k in sbs.subsets_]
plt.plot(k_feat, sbs.scores_, marker='o')
plt.ylim([0.7, 1.1])
plt.ylabel('Accuracy')
plt.xlabel('Number of features')
plt.grid()
plt.show()
```

通过下图可以看到: 当我们减少了特征的数量后，KNN 分类器在验证数据集上的准确率提高了，这可能归因于在第3章中介绍 KNN 算法时讨论的“维度灾难”。此外，图中还显示，当 `k={5, 6, 7, 8, 9, 10}` 时，算法可以达到百分百的准确率。

![](https://mingminyu.github.io/webassets/images/20251208/53.png)


为了满足一下自己的好奇心，现在让我们看一下是哪5个特征在验证数据集上有如此好的表现:

```python
k5 = list(sbs.subsets_[8])
```

输出结果:

```python
Index([u'Alcohol', u'Malic acid', u'Alcalinity of ash', u'Hue', u'Proline'], dtype='object')
```

使用上述代码，我们从 `sbs.subsets_` 的第9列获取了5个特征子集的列标，并通过以 pandas 的 DataFrame 格式存储的葡萄酒数据对应的索引中提取到了相应的特征名称。

下面我们验证一下 KNN 分类器在原始测试集上的表现；

```python
knn.fit(X_train_std, y_train)
print('Training accuracy: ', knn.score(X_train_std, y_train))
print('Test accuracy: ', knn.score(X_test_std, y_test))
```

输出结果:

```python
('Training accuracy: ', 0.9838709677419355)
('Test accuracy: ', 0.94444444444444442)
```

在上述代码中，我们在训练数据集上使用了所有的特征并得到了大约 98.4% 的准确率。不过，在测试数据集上的准确率稍低(约为94.4%)，此时指标暗示稍有过拟合。现在让我们在选定的5个特征集上看一下 KNN 的性能:

```python
k5 = list(sbs.subsets_[8])
knn.fit(X_train_std[:, k5], y_train)
print('Training accuracy: ', knn.score(X_train_std[:, k5], y_train))
print('Test accuracy: ', knn.score(X_test_std[:, k5], y_test))
```

输出结果:

```python
('Training accuracy: ', 0.95967741935483875)
('Test accuracy: ', 0.96296296296296291)
```

当特征数量不及葡萄酒输几局原始特征数量的一半时，在测试数据集上的预测准确率提升了两个百分点。同时，通过测试数据集(约为 96.3%) 和训练数据集(约为96.0%)上准确率之间的微小差别可以发现，过拟合现象得以缓解。

???+ note "scikit-learn 中的特征选择算法"

		scikit-learn 提供了许多其他的特征选择算法，包括: 基于特征权重的递归后向消除算法(recursive backward elimination based on feature weights)、基于特征重要性的特征选择树方法(tree-based methods to select features by importance)，以及单变量统计测试(univariate statistical tests)。对特征选择方法进行更深入的讨论已经超出了本书的范围，对这些算法的总结性描述及其示例请参见链接: http://scikit-learn.org/stable/modules/feature_selection.html 。

## 6. 通过随机森林判定特征的重要性

在前面几节，我们学习了如何在逻辑斯蒂回归上通过 L1 正则化将不相关特征删除，并且学习了用于特征选择的 SBS 算法。另一种从数据集中选择相关特征的有效方法是使用随机森林，也就是第3章中介绍的集成技术。我们可以通过森林中所有决策树得到的平均不纯度衰减来度量特征的重要性，而不必考虑数据是否线性可分。更加方便的是: scikit-learn 中实现的随机森林已经为我们收集好了关于特征重要程度的信息，在拟合了 RandomForestClassifier 后，可以通过 `feature_importances_` 得到这些内容。执行以下代码，可在葡萄酒数据集上训练 10 000 棵树，并且分别根据其重要程度对 13 个特征给出重要性等级。请记住(在第3章中曾讨论过的)，无需对基于树的模型做标准化或归一化处理。代码如下：

```python
from sklearn.ensemble import RandomForestClassifier
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.cross_validation import train_test_split

df_wine = pd.read_csv(r'./wine.data', header=None)
df_wine.columns = ['Class label', 'Alcohol', 'Malic acid', 'Ash', 'Alcalinity of ash', 
		'Magnesium', 'Total phenols', 'Flavanoids', 'Nonflavanoid phenols', 
		'Proanthocyanins', 'Color intensity', 'Hue', 'OD280/OD315 of diluted wines', 'Proline']

X, y = df_wine.iloc[:, 1:].values, df_wine.iloc[:, 0].values
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0)

feat_labels = df_wine.columns[1:]
forest = RandomForestClassifier(n_estimators=10000, random_state=0, n_jobs=-1)
forest.fit(X_train, y_train)
importances = forest.feature_importances_
indices = np.argsort(importances)[::-1]
for f in range(X_train.shape[1]):
	print('%2d) %-*s %f' % (f+1, 30, feat_labels[f], importances[indices[f]]))
```

输出结果:

```python
  "This module will be removed in 0.20.", DeprecationWarning)
 1) Alcohol                        0.182483
 2) Malic acid                     0.158610
 3) Ash                            0.150948
 4) Alcalinity of ash              0.131987
 5) Magnesium                      0.106589
 6) Total phenols                  0.078243
 7) Flavanoids                     0.060718
 8) Nonflavanoid phenols           0.032033
 9) Proanthocyanins                0.025400
10) Color intensity                0.022351
11) Hue                            0.022078
12) OD280/OD315 of diluted wines   0.014645
13) Proline                        0.013916
```

绘制可视化柱形图:

```python
plt.title('Feature Importances')
plt.bar(range(X_train.shape[1]), importances[indices], color='lightblue', align='center')
plt.xticks(range(X_train.shape[1]), feat_labels, rotation=90)
plt.xlim([-1, X_train.shape[1]])
plt.tight_layout()
plt.show()
```

执行上述代码后，根据特征在葡萄酒数据集中的相对重要性，绘制出根据特征重要性排序的图，请注意，这些特征重要性经过归一化处理，其和为 1.0。

![](https://mingminyu.github.io/webassets/images/20251208/54.png)

由上图我们讨论得到结论: 基于 10 000 棵决策树平均不纯度衰减的计算，数据集上最具判别效果的特征是 'alcohol'。有趣的是，上图中排名靠前的四个特征中有三个也出现在前面章节中使用 SBS 算法所选的五个特征中。不过，就可解释性而言，随机森林有一个重要的特征性值得一提。例如: 如果两个或者更多个特征是高度相关的，一个特征的相关特征未被完全包含进来，那么此特征可能会得到一个较高的评分。另一方面，如果我们的关注点仅在模型的预测性能上，scikit-learn 还实现了一个 transform 方法，可以在用户设定阈值的基础上进行特征选择，这在我们将 RandomForestClassifier 作为特征选择器，并将其作为 scikit-learn 实现分析流程环节中的一个步骤时尤为有效，它使得我们可以通过同一个预估器来连接不同的预处理步骤，我们将在第6章中对这些相关内容进行他探讨。例如，将阈值设为 0.15，我们可以使用下列代码将数据压缩到是哪个最重要的特征: Alcohol、Malic acid 和 Ash:

```python linenums="1"
X_selected = forest.transform(X_train, threshold=0.15)
print(X_selected.shape)
```

输出结果:

```python
(124, 3)
```

如果你使用的 scikit-learn 版本大于 0.18，那么上述代码会报错，可以使用以下代码:

```python
from sklearn.feature_selection import SelectFromModel
sfm = SelectFromModel(forest, threshold=0.15, prefit=True)
X_selected = sfm.transform(X_train)
print(X_selected.shape)
```

输出结果；

```python
(124, 3)
```

## 7. 本章小结

本章的开始着眼于正确处理缺失数据的有用技术。在我们将数据导入到机器学习算法之前，应保证已对类别变量进行了正确的编码，我们还分别讨论了如何将有序的特征和标称特征的值映射为整数的方法。

此外，我们还简要地讨论了 L1 正则化，它可以通过降低模型的复杂度来帮助我们避免过拟合。作为另外一种剔除不相关特征的方法，我们使用了序列特征选择算法从数据集中选择有意义的特征。

在下一篇中，读者将学习到另外一种降维的有效方法: 特征提取。它使得我们可以将特征压缩到一个低维空间，而不是像特征选择那样完全剔除不相关特征。

