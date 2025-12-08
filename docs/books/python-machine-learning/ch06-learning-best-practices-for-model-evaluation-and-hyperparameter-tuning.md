# 第6章：模型评估与参数调优实战

> GitHub Notebook 地址: http://nbviewer.ipython.org/github/rasbt/python-machine-learning-book/blob/master/code/ch06/ch06.ipynb

在前面的章节中，读者学习了用于分类的机器学习基础算法，以及在使用算法前的数据预处理方法。在本章中，我们将使用代码进行实践，通过对算法进行调优来构建性能良好的机器学习模型，并对模型的性能进行评估。我们将学习如下内容:

- 模型性能的无偏估计
- 处理机器学习算法中常见的问题
- 机器学习模型调优
- 使用不同的性能指标评估预测模型

## 6.1 基于流水线的工作流

我们在前面章节中学习了不同的数据预处理技术，无论是第4张中介绍的用于特征缩放的标准化方法，还是第5章中介绍的用于介绍数据压缩的主成分分析等，我们在使用训练数据对模型进行拟合时就得到了一些参数，但将模型用于新数据时需重设这些参数。本节读者将学到一个方便使用的工具: scikit-learn 中的 Pipeline 类。它使得我们可以拟合出包含任意多个处理步骤的模型，并将模型用于新数据的预测。

### 1.1 加载威斯康星乳腺癌数据集

本章我们将使用威斯康星乳腺癌(Breast Cancer Wisconsin) 数据集进行讲解，此数据集共包含 569 个恶性或者良性肿瘤细胞样本。数据集中的前两列分别存储了样本唯一的 ID 以及对样本的诊断结果(M 代表恶性，B 代表良性)。数据集的 3~32 列包含了 30个从细胞核照片汇总提取、用实数值标识的特征，它们可以用于构建判定模型，对肿瘤是良性还是恶性做出预测，威斯康星乳腺癌数据集已经存储子 UCI 机器学习数据库中，关于此数据集更多的信息请访问链接: https://archive.ics.uci.edu/ml/datasets/Breast+Cancer+Wisconsin+(Diagnostic)。

在本节，我们三个步骤来去读数据集，并将其划分为训练数据集和测试数据集。

1) 使用 pandas 从 UCI 网站直接读取数据集:

```python
import pandas as pd
df = pd.read_csv('https://archive.ics.uci.edu/ml/machine-learning-databases/breast-cancer-wisconsin/wdbc.data')
```

2) 接下来，将数据集的 30 个特征的赋值给一个 NumPy 的数组对象 X。使用 scikit-learn 中的 LabelEncoder 类，我们可以将类标从原始的字符串表示(M 或 B)转换为整数:

```python
from sklearn.preprocessing import LabelEncoder
X = df.loc[:, 2:].values
y = df.loc[:, 1].values
le = LabelEncoder()
y = le.fit_transform(y)
```


转换后的类标(诊断结果)存储在一个数组 y 汇总，此时恶性肿瘤和良性肿瘤分别被标识为类 1 和类 0，我们可以通过调用 LabelEncoder 的 transform 方法来显示虚拟类标(0 和 1):

```python
>>> le.transform(['M', 'B'])
array([1, 0])
```

3) 在构建第一个流水线模型前，先将数据集划分为训练数据集(原始数据集80%的数据)和一个单独的测试数据集(原始数据集 20% 的数据):

```python
from sklearn.cross_validation import train_test_split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.20, random_state=1)
```

### 1.2 在流水线中集成数据转换及评估操作

通过前面章节的学习，我们了解到: 处于性能优化的目的，许多学习算法要求将不同特征的值缩放到相同的范围。这样，我们在使用 Logistic 回归模型等线性分类器分析 Wisconsin 乳腺癌数据集之前，需要对其特征列做标准化处理。此外，我们还想通过第5章中介绍过的主成分分析(PCA) —— 使用特征抽取进行降维的技术，将最初的 30 维数据压缩到一个二维的子空间上。我们无需再训练数据集和测试数据集上分别进行模型拟合、数据转换，而是通过流水线将 StandScaler、PCA，以及 LogisticRegression 对象串联起来:

```python
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline

pipe_lr = Pipeline([('scl', StandardScaler()),
                    ('pca', PCA(n_components=2)),
                    ('clf', LogisticRegression(random_state=1))])
pipe_lr.fit(X_train, y_train)
print('Test Accuracy: %.3f' % pipe_lr.score(X_test, y_test))

# 输出
Test Accuracy: 0.947
```

Pipeline 对象采用元素的序列作为输入，其中每个元组的第一个值为一个字符串，它可以是任意的标识符，我们通过它来访问流水线中的元素，而元组的第二个值则为 scikit-learn 中的一个转换器或者评估器。

流水线中包含 scikit-learn 中用于数据预处理的类，最后还包括一个评估器。在前面的示例代码中，流水线中有两个预处理环节，分别是用于数据缩放和转换的 StandardScaler 及 PCA，最后还有一个座位评估器的 Logistic 回归分类器。当在流水线 pipe_lr 上执行 fit 方法时，StandScaler 会在训练集上执行 fit 和 trans 和 transform 操作，经过转换后的训练数据将传递给流水线上的下一个对象——PCA。与前面的步骤类似，PCA 会在前一步转换后的输入数据上执行 fit 和 transform 操作，并将处理过的数据传递给流水线中的最后一个对象——评估器。我们应该注意到: 流水线没有限定中间步骤的数量。流水线的工作方式可用下图来描述:

![](https://mingminyu.github.io/webassets/images/20251208/78.png)

## 2. 使用 k 折交叉验证评估模型性能

构建机器学习模型的一个关键步骤就是在新数据上对模型的性能进行评估。现在假设我们使用训练数据对模型进行拟合，并且使用同样的数据对其性能进行评估。回忆一下 3.3.4 节，如果一个模型过于简单，将会面临欠拟合(高偏差)的问题，而模型基于训练数据构造得过于复杂，则会导致过拟合(高方差)的问题。为了在偏差和方差之间找到可接受的折中方案，我们需要对模型进行评估。在本节，读者将学到有用的交叉验证技术: holdout 交叉验证(holdout cross_validation) 和 k折交叉验证(k-fold cross_validation)，借助于这两种方法，我们可以得到模型泛化误差的可靠估计，即模型在新数据上的性能表现。

### 2.1 holdout 方法

holdout 交叉验证是评估机器学习模型泛化能力的一个景点且常用的方法。通过 holdout 方法，我们将最初的数据集划分为训练集和测试数据集: 前者用于模型的训练，而后者则用于性能的评估。然而，在典型的机器学习应用中，为进一步提高模型在预测未知数据上的性能，我们还要对不同参数设置进行调优和比较。该过程称为模型选择(model selection)，指的是针对给定分类问题，我们调整参数以寻求最优值(也称为超参，hyperparamter)的过程。

但是，如果我们再模型选择过程中不断重复使用相同的测试数据，它们可看作训练数据的一部分，模型更易于过拟合。尽管存在此问题，许多人在模型选择过程中使用这些测试数据，这对机器学习来说不是一种好的做法。

使用 holdout 进行模型选择更好的方法是将数据划分为三个部分吗: 训练数据集、验证数据集和测试数据集。悬链数据集用于不同模型的拟合，模型在验证数据集上的性能表现作为模型选择的标准。使用模型训练集模型选择阶段不曾使用的数据作为测试数据集的优势在于: 评估模型应用于新数据上能够获得较小的偏差。下图介绍了 holdout 交叉验证的一些概念。交叉验证中，在使用不同参数值对模型进行训练之后，我们使用验证数据集反复进行模型性能的评估。一旦参数优化获得较为满意的结果，我们就可以在测试数据集上对模型的泛化能力误差进行评估:

![](https://mingminyu.github.io/webassets/images/20251208/79.png)

holdout 方法的一个缺点在于: 模型性能的评估对训练数据集划分为训练及验证子集的方法是敏感的；评价的结果会随着样本的不同而发生改变。在下一小节中，我们将学习一种鲁棒性更好的性能评价技术: k折交叉验证，我们将在 k个训练数据子集上重复 holdout 方法措多次。

> 🔖 读者可能对有放回抽样和无放回抽样不太熟悉，我们在此简单做个介绍。假设我们在玩彩票游戏，游戏规则是从一个盒子中随机抽取数字。盒子中包含 5 个数字 0、1、2、3 和 4，每轮我们都只能取出其中一个。在第一轮汇总，我们抽到某个特定数字的概率为 1/5。现在我们采用无放回抽样，也就是完成数字的抽取后，不再将其放回盒子。这时，抽到某个特定数字的概率依赖于上一轮的抽取结果。例如，如果盒子中剩余的数字为 0、1、2 和 4，则下一轮抽取中得到数字 0 的概率为 1/4。


不过，在有放回随机抽样中，我们将抽取到的数字再放回到盒子中，这样每一轮抽取到么讴歌特定数字的概率不发生改变，同时我们也可以措辞抽取到同一个数字。换句话说，在有放回抽样中，样本(数字)是相互独立的，它们的协方差为0。例如，5次随机抽样的结果可能如下:

- 无放回抽样: 2, 1, 3, 4, 0
- 有放回随机抽样: 1, 3, 3, 4, 1

基于这些独立且不同的数据子集上得到的模型性能评价结果，我们可以计算出其平均性能，与 holdout 方法相比，这样得到的结果对数据划分方法的敏感性相对较低。通常情况下，我们将 k折价差验证用于模型的调优，也就是找到使得模型泛化性能最优的超参值。一旦找打了满意的超参值，我们就可以在全部的训练数据上重新训练模型，并使用独立的测试数据集对模型性能做出最终评价。

由于 k 折交叉验证使用了无重复抽样技术，该方法的有时在于(每次迭代过程中) 每个样本点只有一次被划入训练集或测试数据集的机会，与 holdout 方法相比，这将使得模型性能的评估的评估具有较小的方差。下图总结了 k 折交叉验证的相关概念，其中 k=10。训练数据集被划分为 10 块，在 10 次迭代中，每次迭代都将 9 块用于训练，剩余的 1块作为测试集用于模型的评估。此外，每次迭代中得到的心梗评价指标 $E_i$(例如，分类的准确性或者误差) 可用来计算模型的估计平均性能 E:

![](https://mingminyu.github.io/webassets/images/20251208/80.png)


k 折交叉验证中 k 的标准值为 10，这对大多数应用来说都是合理的。但是，如果训练数据集相对较小，那就有必要加大 k 的值。如果我们增大 k 的值，在每次迭代中将会有更多的数据用于模型的训练，这样通过计算各性能评估结果的平均值对模型的泛化能力进行评价时，可以得到较小的偏差。但是，k 值的增加将导致交叉验证算法运行时间延长，而且由于各训练块间高度相似，也会导致评价结果方差较高。另一方面，如果数据集较大，则可以选择较小的 k 值，如 k=5，这不光能够降低模型在不同数据上进行重复拟合和性能评估的计算成本，还可以在平均性能的基础上获得对模型的准确评估。

> 🔖 k 折交叉验证的一个特例就是留一(leave-one-out，LOO) 交叉验证法。在 LOO 中，我们将数据子集划分的数量等同于样本数(k=n)，这样每次只有一个样本用于测试。当数据非常小时，建议是使用此方法进行验证。

分层 k 折交叉验证对标准 k 折交叉验证做了稍许改进，它可以获得偏差和方差都较低的评估结果，特别是类别比例相差较大时，详见 R.Kohavi 等人的研究$^{注1}$。在分层交叉验证中，类别比例在每个分块中得以保持，这使得每个分块中的类别比例与训练数据集的整体比例一致，下面通过 scikit-learn 中的 StratifiedKFold 迭代器来演示:

```python
import numpy as np
from sklearn.cross_validation import StratifiedKFold

kfold = StratifiedKFold(y=y_train, n_folds=10, random_state=1)
scores = []
for k, (train, test) in enumerate(kfold):
    pipe_lr.fit(X_train[train], y_train[train])
    score = pipe_lr.score(X_train[test], y_train[test])
    scores.append(score)
    print('Fold: %s, Class dist.: %s, Acc: %.3f' % (k+1, np.bincount(y_train[train]), score))

# 输出
Fold: 1, Class dist.: [256 153], Acc: 0.891
Fold: 2, Class dist.: [256 153], Acc: 0.978
Fold: 3, Class dist.: [256 153], Acc: 0.978
Fold: 4, Class dist.: [256 153], Acc: 0.913
Fold: 5, Class dist.: [256 153], Acc: 0.935
Fold: 6, Class dist.: [257 153], Acc: 0.978
Fold: 7, Class dist.: [257 153], Acc: 0.933
Fold: 8, Class dist.: [257 153], Acc: 0.956
Fold: 9, Class dist.: [257 153], Acc: 0.978
Fold: 10, Class dist.: [257 153], Acc: 0.956

print('CV accuracy: %.3f +/- %.3f' % (np.mean(scores), np.std(scores)))
# 输出
CV accuracy: 0.950 +/- 0.029
```

首先，我们用训练集中的类标 y_train 来初始化 sklearn.cross_validation 模块下的 StratifiedKFold 迭代器，并通过 n_folds 参数来设置块的数量。当我们使用 kfold 迭代器在 k 个块中进行循环时，使用 train 返回的索引去拟合本章开始时所构建的 Logistic 流水线。通过 pipe_lr 流水线，我们可以保证每次迭代中样本都得到适当的缩放(如标准化)。然后使用 test 索引计算模型的准确率，将其存储在 socre 列表中，用于计算平均准确率以及性能评估标准差。

尽管之前的代码清楚地介绍了 k 折交叉验证的工作方式，scikit-learn 中同样也实现了 k 折交叉验证评分的计算，这使得我们可以更加高效地使用分层 k 折交叉验证对模型进行评估:

```python
from sklearn.cross_validation import cross_val_score
scores = cross_val_score(estimator=pipe_lr, X=X_train, y=y_train, cv=10, n_jobs=1)
print('CV accuracy scores: \n%s' % scores)

# 输出
CV accuracy scores: 
[0.89130435 0.97826087 0.97826087 0.91304348 0.93478261 0.97777778
 0.93333333 0.95555556 0.97777778 0.95555556]
 
print('CV accuracy: %.3f +/- %.3f' % (np.mean(scores), np.std(scores)))
# 输出
CV accuracy: 0.950 +/- 0.029
```

cross_val_score 方法具备一个极为有用的特点，它可以将不同分块的性能评估分布到多个 CPU 上进行处理。如果将 n_jobs 参数的值设为 1，则与例子中使用的 StratifiedKFold 类似，只使用一个 CPU 性能进行评估。如果设定 n_jobs=2，我们可以将10轮的交叉验证分布到两块 CPU(如果使用的计算机支持)上进行，如果设置 n_jobs=-1，则可利用计算机所有的 CPU 并行地进行计算。

> 🔖 关于交叉验证中泛化性能方差的估计已经超出了本书的讨论范围，不过读者可以参阅 M.Markaou 等人的论文$^{注2}$，该文章对上述问题做了精彩的描述。

同时，读者也可以了解其他的交叉验证技术，如 .632 Bootstrap 交叉验证(.632 Bootstrap cross_validation) 方法$^{注3}$:

> 注1: R.Konavi et al. A Study of Cross_validation and Bootstrap for accuracy Estimation and Model Selection. In Ijcai, volume 14, pages 1137-1145, 1995.
> 注2: M.Markatou, H. Tian, S. Biswas, and G.M.Hripcsak. Analysis of Variance of Cross_validation Estimators of the Generalization Error. Journal of Machine Learning Research, 6:1127-1168, 2005.
> 注3: B.Efron and R.Tibshirani. Improvements on Cross_validation: The 632+ Bootstrap Method. Journal of American Statistical Assocation, 92(438): 548-560, 1997.

## 3. 通过学习及验证曲线来调试算法

在本节，我们将学习两个有助于提高学习算法的简单但功能强大的判定工具: 学习曲线(learning curve)与验证曲线(validation curve)。在下一小节中，我们将讨论如何使用学习曲线来判定学习算法是否面临过拟合(高方差)或欠拟合(高偏差)问题。此外，我们还将了解一下验证权限，它可以曲线我们找到学习算法中的常见问题。

### 3.1 使用学习曲线判定偏差和方差问题

如果一个模型在给定训练数据上构造得过于复杂——模型中有太多的自由度或者参数，这时模型可能对训练数据过拟合，而对未知数据泛化能力低下。通常情况下，收集更多的训练样本有助于降低模型的过拟合程度。但是，在实践中，收集更多数据会带来高昂的成本，或者根本不可行。通过将模型的训练及准确性验证看作是训练数据集大小的函数，并绘制其图像，我们可以很容易看出模型是面临高方差还是高偏差的问题，以及收集更多的数据是否有助于解决问题。在讲解如何通过 scikit-learn 绘制学习曲线之前，我们先通过下图来讨论一下模型常见的两个问题:

![](https://mingminyu.github.io/webassets/images/20251208/81.png)

左上方图像显示的是一个高偏差模型。此模型的训练准确率和交叉验证准确率都很低，这表明此模型未能很好地拟合数据。解决此问题的常用方法是增加模型中参数的数量，例如，收集或构建额外特征，或者降低类似于 SVM 和 Logistic 回归器等模型的正则化程度。右上方图像中模型面临高方差的问题，我们可以收集更多的训练数据或者降低模型的复杂度，如增加正则化的参数；对于不适合正则化的模型，也可以通过第4章介绍的特征选择，或者第5章中特征提取来降低特征的数量。需要注意的是: 收集更多的训练数据可以降低模型过拟合的概率。不过该方法并不适用于所有问题，例如: 训练数据中噪声数据比较多，或者模型本身已经接近于最优。

在下一小节中，我们将看到如何使用验证曲线来解决模型中存在的问题，不过先看一下如何使用 scikit-learn 中的学习曲线评估模型:

```python
import matplotlib.pyplot as plt
from sklearn.pipeline import Pipeline
from sklearn.learning_curve import learning_curve
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression

plt.style.use('ggplot')
pipe_lr = Pipeline([('scl', StandardScaler()),
                    ('clf', LogisticRegression(penalty='l2', random_state=0))])
train_sizes, train_scores, test_scores = learning_curve(estimator=pipe_lr,
                X=X_train, y=y_train, train_sizes=np.linspace(0.1, 1.0, 10), cv=10, n_jobs=-1)
train_mean = np.mean(train_scores, axis=1)
train_std = np.std(train_scores, axis=1)
test_mean = np.mean(test_scores, axis=1)
test_std = np.std(test_scores, axis=1)

plt.plot(train_sizes, train_mean, c='b', marker='o', markersize=5, label='training accuracy')
plt.fill_between(train_sizes, train_mean + train_std, train_mean - train_std, alpha=0.15, color='blue')
plt.plot(train_sizes, test_mean, c='g', linestyle='--', marker='s', markersize=5, label='validation accuracy')
plt.fill_between(train_sizes, test_mean + test_std, test_mean - test_std, alpha=0.15, color='green')
plt.grid()
plt.xlabel('Number of training samples')
plt.ylabel('Accuracy')
plt.legend(loc='lower right')
plt.ylim([0.8, 1.0])
plt.show()
```

![](https://mingminyu.github.io/webassets/images/20251208/82.png)


通过 learning_curve 函数的 train_size 参数，我们可以控制用于生成学习曲线的样本的绝对或相对数量。在此，通过设置 `train_sizes=np.linspace(0.1,1.0,10)` 来使用训练数据集上等距间隔的 10 个样本。默认情况下，learning_curve 函数使用分层 k 折交叉验证来计算交叉验证的准确性，通过 cv 参数将 k 的值设置为 10。然后，我们可以简单地通过不同规模训练集上返回的交叉验证和测试评分来计算平均准确率，并且我们使用 matplotlib 的 plot 函数绘制出准确率的图像。此外，在绘制图像时，我们通过 fill_between 函数加入了平均准确率标准差的信息，用以表示评价结果的方差。

通过前面学习曲线图像可见，模型在测试数据集上表现很好。但是，在训练准确率曲线与交叉验证准确率之间，存在着相对较小差距，这意味模型对训练数据有轻微的过拟合。

### 3.2 通过验证曲线来判定过拟合与欠拟合

验证曲线是一种通过定位过拟合或欠拟合等诸多问题所在，来帮助提高模型性能的有效工具。验证曲线与学习曲线相似，不会绘制的不是样本大小与悬链准确率、测试准确率之间的函数关系，而是准确率与模型参数之间的关系，例如 Logistic 回归模型中的正则化参数 C。我们继续看下如何使用 scikit-learn 来绘制验证曲线:

```python linenums="1"
from sklearn.learning_curve import validation_curve

plt.style.use('ggplot')

param_range = [0.001, 0.01, 0.1, 1.0, 10.0, 100.0]
pipe_lr = Pipeline([('scl', StandardScaler()),
                    ('clf', LogisticRegression(penalty='l2', random_state=0))])
train_scores, test_scores = validation_curve(estimator=pipe_lr,
            X=X_train, y=y_train, param_name='clf__C', param_range=param_range, cv=10, n_jobs=-1)
train_mean = np.mean(train_scores, axis=1)
train_std = np.std(train_scores, axis=1)
test_mean = np.mean(test_scores, axis=1)
test_std = np.std(test_scores, axis=1)

plt.plot(param_range, train_mean, color='b', marker='o', markersize=5, label='training accuracy')
plt.fill_between(param_range, train_mean + train_std, train_mean - train_std, alpha=0.15, color='blue')
plt.plot(param_range, test_mean, c='g', linestyle='--', marker='s', markersize=5, label='validation accuracy')
plt.fill_between(param_range, test_mean + test_std, test_mean - test_std, alpha=0.15, color='green')
plt.grid()
plt.xscale('log')
plt.legend(loc='lower right')
plt.xlabel('Paramter C')
plt.ylabel('Accuracy')
plt.ylim([0.8, 1.0])
plt.show()
```

![](https://mingminyu.github.io/webassets/images/20251208/83.png)

与 learning_curve 函数类似，如果我们使用的是分类算法，则 validation_curve 函数默认使用分层 k 折交叉验证来评价模型的性能。在 validation_curve 函数内，我们可以指定想要验证的参数。在本例中，需要验证的是参数 C，即定义在 scikit-learn 流水线中的 Logistic 回归分类器的正则化参数，我们将其记为 `'clf__C'`，并通过 param_range 参数类设定其值的范围。与上一节的学习曲线类似，我们绘制了平均训练准确率、交叉验证准确率及对应的标准差。

虽然不同 C 值之间的准确率的异常非常小，但我们可以看到，如果加大正则化强度(较小的 C 值)，会导致模型轻微的欠拟合；如果增加 C 值，这意味着降低正则化的强度，因此模型会趋向于过拟合。在本例中，最优点在 `C=0.1` 附近。

## 4. 使用网格搜索调优机器学习模型

在机器学习中，有两类参数: 通过训练数据学习得到的参数，如 Logistic 回归中的回归系数；以及学习算法中需要单独进行优化的参数。后者即为调优参数，也称为超参，对模型来说，就如 Logistic 回归中的正则化系数，或者决策树中的深度参数。

在上一节中，我们使用验证曲线通过调优超参提高模型的性能。本节中，我们将学习一种功能强大的超参数优化技巧: 网格搜索(grid search)，它通过寻找最优的超参值的组合以进一步提高模型的性能。

### 4.1 使用网格搜索调优超参

网格搜索法非常简单，它通过我们指定的不同超参列表进行暴力穷举搜索，并计算评估每个组合对模型性能的影响，以获得参数的最优组合。

```python
if Version(sklearn_version) < '0.18':
    from sklearn.grid_search import GridSearchCV
else:
    from sklearn.model_selection import GridSearchCV

from sklearn.svm import SVC
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
import matplotlib.pyplot as plt

pipe_svc = Pipeline([('scl', StandardScaler()),
                     ('clf', SVC(random_state=1))])
param_range = [0.0001, 0.001, 0.01, 0.1, 1.0, 10.0, 100.0, 1000.0]
param_grid = [{'clf__C': param_range, 'clf__kernel': ['linear']},
              {'clf__C': param_range, 'clf__gamma': param_range, 'clf__kernel': ['rbf']}]
gs = GridSearchCV(estimator=pipe_svc, param_grid=param_grid, scoring='accuracy', cv=10)
gs = gs.fit(X_train, y_train)
print('best score: ', gs.best_score_)
print('best params: ', gs.best_params_)

# 输出
best score:  0.978021978021978
best params:  {'clf__C': 0.1, 'clf__kernel': 'linear'}
```

使用上述到代码，我们初始化了一个 sklearn.grid_search 模块下的 GridSearchCV 对象，用于对支持向量机流水线的训练与调优。我们将 GridSearchCV 的 param_grid 参数以字典的方式定义待调优的参数。对线性 SVC 来说，我们只需要调优正则化参数(C)；对基于 RBF 核的 SVM 来说，我们同事需要调优 C 和 gamma 参数。请注意此处的 gamma 是针对核 SVM 特别定义的。在训练数据集上完成网格搜索后，可以通过 best_score_ 属性得到最优模型的性能评分，具体参数信息可通过 best_params_ 属性得到。在本例中，当 `'clf__C=0.1'`，线性 SVM 模型可得到的最优 k 折交叉交叉验证准确率为 97.8%。

最后，我们将使用独立的测试数据集，通过 GridSearchCV 对象的 best_estimator_ 属性对模型进行性能评估:

```python
clf = gs.best_estimator_
clf.fit(X_train, y_train)
print('Test accuracy: %.3f' % clf.score(X_train, y_train))

# 输出
Test accuracy: 0.985
```

> 🔖 虽然网格搜索是寻找最优参数集合的一种功能强大的方法，但评估所有参数组合的计算成本也是相当昂贵的。使用 scikit-learn 抽取不同参数组合的另一种方法就是随机搜索(randomized search)。借助于 scikit-learn 中的 RandomoizedSearchCV 类，我们可以以特定的代价从抽样分布中抽取随机的参数组合。关于此方法的更详细细节及其示例请访问链接: http://scikit-learn.org/stable/modules/grid_search.html#randomized-paramter-optimation 。

### 4.2 通过嵌套交叉验证选择算法

在上一节中我们看到，结合网格搜索进行 k 折交叉验证，通过超参数值的改动对机器学习模型进行调优，这是一种有效提高机器学习模型性能的方法。如果要在不同机器学习算法中做出选择，则推荐另外一种方法——嵌套交叉验证，在一项对误差估计的偏差情形研究中，Varma 和 Simon 给出了如下结论: 使用嵌套交叉验证，估计的真实误差与在测试集上得到的结果几乎没有差距$^{注1}$。

在嵌套交叉验证的外围循环中，我们将数据划分为训练块及测试块；而在用于模型选择的内部循环中，我们则基于这些训练块使用 k 折交叉验证。下图通过 5个外围模块及2个内部模型解释了嵌套交叉验证的概念，这适用于计算性能要求比较高的大规模数据集。这种特殊类型的嵌套交叉验证也称为 5x2 交叉验证(5x2 cross-validation):

![](https://mingminyu.github.io/webassets/images/20251208/84.png)


借助于 scikit-learn，我们可以通过如下方式使用嵌套交叉验证:

```python
if Version(sklearn_version) < '0.18':
    from sklearn.grid_search import GridSearchCV
else:
    from sklearn.model_selection import GridSearchCV
    
if Version(sklearn_version) < '0.18':
    from sklearn.cross_validation import cross_val_score
else:
    from sklearn.model_selection import cross_val_score

from sklearn.svm import SVC
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

pipe_svc = Pipeline([('scl', StandardScaler()),
                     ('clf', SVC(random_state=1))])
param_range = [0.0001, 0.001, 0.01, 0.1, 1.0, 10.0, 100.0, 1000.0]
param_grid = [{'clf__C': param_range, 'clf__kernel': ['linear']},
              {'clf__C': param_range, 'clf__gamma': param_range, 'clf__kernel': ['rbf']}]
gs = GridSearchCV(estimator=pipe_svc, param_grid=param_grid, scoring='accuracy', cv=10, n_jobs=-1)
scores = cross_val_score(gs, X, y, scoring='accuracy', cv=5)
print('CV accuracy: %.3f +/- %.3f' % (np.mean(scores), np.std(scores)))

# 输出
CV accuracy: 0.972 +/- 0.012
```

代码返回的交叉验证准确率平均值对模型超参调优的预期值给出了很好的估计，且使用该值优化过的模型能够预测未知数据。例如，我们可以使用嵌套交叉验证方法比较 SVM 模型与简单的决策树分类器了；为了简单起见，我们只调优树的深度参数:

```python linenums="1"
if Version(sklearn_version) < '0.18':
    from sklearn.grid_search import GridSearchCV
else:
    from sklearn.model_selection import GridSearchCV
    
if Version(sklearn_version) < '0.18':
    from sklearn.cross_validation import cross_val_score
else:
    from sklearn.model_selection import cross_val_score

from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.tree import DecisionTreeClassifier

gs = GridSearchCV(estimator=DecisionTreeClassifier(random_state=0), scoring='accuracy', cv=10, n_jobs=-1,
                  param_grid=[{'max_depth': [1, 2, 3, 4, 5, 6, 7, None]}])
scores = cross_val_score(gs, X_train, y_train, scoring='accuracy', cv=5)
print('CV accuracy: %.3f +/- %.3f' % (np.mean(scores), np.std(scores)))

# 输出
CV accuracy: 0.910 +/- 0.044
```

在此可见，嵌套交叉验证对 SVM 模型性能的评分(97.8%) 远高于决策树的(90.8%)。由此，可以预期: SVM 是用于对此数据集未知数据进行分类的一个好的选择。

> 注1: A.Varma and R.Simon.Bias in Error Estimation When Using Crossing-validation for Model Selection. BMC bioinfomatics, 7(1):91,2006.


## 5. 了解不同的性能评价指标

在前面章节中，我们使用模型准确性对模型进行了评估，这是通常情况下有效量化模型性能的一个指标。不过还有其他几个性能指标就可以用来衡量模型的相关性能，比如准确率(precision)、召回率(recall) 以及F1分数(F1-score)。

### 5.1 读取混淆矩阵

在我们详细讨论不同评分标准之前，先回执一个所谓的混淆矩阵(confusion matrix): 即展示学习算法性能的一种矩阵。混淆矩阵是一个简单的方阵3，用于展示一个分类器预测结果——真正(true positive)、真负(false negative)、假正(false positive)即假负(false negative)——数量，如下图所示:

![](https://mingminyu.github.io/webassets/images/20251208/85.png)

虽然这指标的数据可以通过人工比较真实类标与预测类标来获得，不过 scikit-learn 提供了一个方便使用的 confusion_matrix 函数，其使用方法如下:

```python
from sklearn.metrics import confusion_matrix
from sklearn.svm import SVC
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

pipe_svc = Pipeline([('scl', StandardScaler()),
                     ('clf', SVC(random_state=1))])
pipe_svc.fit(X_train, y_train)
y_pred = pipe_svc.predict(X_test)
confmat = confusion_matrix(y_true=y_test, y_pred=y_pred)
print(confmat)

# 输出
[[71  1]
 [ 2 40]]
```

在执行上述代码后，返回的数组提供了分类器在测试集上生成的不同错误信息，我们可以使用 matplotlib 中的 matshow 函数将它们表示为上图所示的混淆矩阵形式:

```python
import matplotlib.pyplot as plt

fig, ax = plt.subplots(figsize=(2.5, 2.5))
ax.matshow(confmat, cmap=plt.cm.Blues, alpha=0.3)

for i in range(confmat.shape[0]):
    for j in range(confmat.shape[1]):
        ax.text(x=j, y=i, s=confmat[i, j], va='center', ha='center')

plt.xlabel('predicted label')
plt.ylabel('true label')
plt.show()
```

下图所示的混淆矩阵

![](https://mingminyu.github.io/webassets/images/20251208/86.png)

在本例中，嘉定类别 1(恶性)为正类，模型正确地预测了 71 个术语类别 0 的样本(真负)，以及 40 个属于类别 1的样本(真正)。不过，我们的模型也错误地将两个属于类别 0的样本划分到了类别 1(假负)，另外还将一个恶性肿瘤误判为良性的(假正)。在下一节中，我们将使用这些信息计算不同的误差度量。

### 5.2 优化分类模型的准确率和召回率

预测误差(error, ERR)和准确率(accuracy, AUC) 都提供了误分类样本数量的相关信息。误差可以理解为预测错误样本的数量与所有被预测样本数量的比值，而准确率计算方法则是正确预测样本的数量与所有被预测样本数量的比值:

$$
ERR = \frac {FP+FN}{FP+FN+TP+TN}
$$

预测准确率也可以通过误差直接计算:

$$
ACC = \frac {TP+FN}{FP+FN+TP+TN} = 1 - ERR
$$

对于类别数量不均衡的分类问题来说，真正率(TPR)与假正率(FPR)是非常有用的性能指标:

$$
FPR = \frac {FP}{N} = \frac {FP}{FP+TN} \\
TPR = \frac {TP} {P} = \frac {TP}{FN+TP}
$$

以肿瘤诊断为例，我们更为关注的是正确检测出恶性肿瘤，使得病人得到恰当治疗。然而，降低良性肿瘤(假正)错误地划分为恶性肿瘤事例的数量固然重要，但对患者来说影响并不大。与 FPR 相反，真正率提供了有关正确识别出来的恶性肿瘤样本(或相关样本)的有用信息。

准确率(precision, PRE)和召回率(recall, REC)是与真正率、真负率相关的性能评价指标，实际上，召回率与真正率含义相同:

$$
PRE = \frac {TP}{TP + FP} \\
REC = TPR = \frac {TP}{P} = \frac {TP}{FN+TP}
$$

在实践中，常采用准确率与召回率的组合，称为 F1 分数:

$$
F1 = 2 \frac {PRE \times REC}{PRE + REC}
$$

所有这些评分指标均以在 scikit-learn 中实现，可以从 sklearn.metric 模块中导入使用，示例代码如下:

```py
from sklearn.metrics import precision_score
from sklearn.metrics import recall_score, f1_score

print('Precision: %.3f' % precision_score(y_true=y_test, y_pred=y_pred))
print('Recall: %.3f' % recall_score(y_true=y_test, y_pred=y_pred))
print('F1: %.3f' % f1_score(y_true=y_test, y_pred=y_pred))

# 输出
Precision: 0.976
Recall: 0.952
F1: 0.964
```

此外，通过评分参数，我们还可以在 GridSearch 中使用包括准确率在内的其他多种不同的评分标准。可通过网址 http://scikit-learn.org/stable/modules/model_evaluation.html 了解评分参数可使用的所有不同值的列表。

请记住 scikit-learn 中将正类类标标识为 1。如果我们想指定一个不同的正类类标，可通过 make_scorer 函数来构建我们自己的评分，那样我们就可以将其以参数的形式提供给 GridSearchCV:

```python
from sklearn.metrics import make_scorer, f1_score
from sklearn.svm import SVC
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

pipe_svc = Pipeline([('scl', StandardScaler()),
                     ('clf', SVC(random_state=1))])
param_range = [0.0001, 0.001, 0.01, 0.1, 1.0, 10.0, 100.0, 1000.0]
param_grid = [{'clf__C': param_range, 'clf__kernel': ['linear']},
              {'clf__C': param_range, 'clf__gamma': param_range, 'clf__kernel': ['rbf']}]

scorer = make_scorer(f1_score, pos_label=0)
gs = GridSearchCV(estimator=pipe_svc, param_grid=param_grid, scoring=scorer, cv=10)
```

### 5.3 绘制 ROC 曲线

受试者工作特征曲线(receiver operator characteristic, ROC)是基于模型假正率和真正率等性能指标进行分类模型选择的有用工具，假正率和真正率可以通过移动分类器的分类阈值来计算。ROC 的对角线可以理解为随机猜测，如果分类器性能曲线在对角线以下，那么其性能就比随机猜测还差。对于完美的分类器来说，其真正率为 1，假正率为 0，这时的 ROC 曲线即为横轴 0 与纵轴 1 组成的折线。基于 ROC 曲线，我们就可以计算所谓的 ROC 线下区域(area under the curve, AUC)，用来刻画分类模型的性能。

> 🔖 与 ROC 曲线类似，我们也可以计算不同概率阈值下一个分类器的准确率-召回率曲线。回执此准确率-召回率曲线的方法也在 scikit-learn 中得以实现，其文档请参阅链接: http://scikit-learn.org/stable/modules/generated/sklearn.metrics.precision_recall_curve.html 。

在下面的代码中，我们只使用了 Wisconsin 乳腺癌数据集中的两个特征来判定肿瘤是良性还是恶性，并绘制了相应的 ROC 曲线。虽然再次使用了前面定义的 Logistic 回归流水线，但是为了使 ROC 曲线视觉上更加生动，我们队分类器的设置比过去更具有挑战性。处于相同的考虑，我们还将 StratifiedKFold 验证器中分块数量减少为 3。代码如下:

```python
from sklearn.metrics import roc_curve, auc
from scipy import interp
from sklearn.cross_validation import StratifiedKFold
import matplotlib.pyplot as plt

X_train2 = X_train[:, [4, 14]]
cv = StratifiedKFold(y_train, n_folds=3, random_state=1)
fig = plt.figure(figsize=(7,5))
mean_tpr = 0.0
mean_fpr = np.linspace(0, 1, 100)
all_tpr = []

for i, (train, test) in enumerate(cv):
    probas = pipe_lr.fit(X_train2[train], y_train[train]).predict_proba(X_train2[test])
    fpr, tpr, thresholds = roc_curve(y_train[test], probas[:, 1], pos_label=1)
    mean_tpr += interp(mean_fpr, fpr, tpr)
    mean_tpr[0] = 0.0
    roc_auc = auc(fpr, tpr)
    plt.plot(fpr, tpr, lw=1, Label='ROC fold %d (area = %.2f)' % (i+1, roc_auc))

plt.plot([0, 1], [0, 1], linestyle='--', color=(0.6, 0.6, 0.6), label='random guessing')
mean_tpr /= len(cv)
mean_tpr[-1] = 1.0
mean_auc = auc(mean_fpr, mean_tpr)

plt.plot(mean_fpr, mean_tpr, 'k--', label='mean ROC (area = %.2f)' % mean_auc, lw=2)
plt.plot([0, 0, 1], [0, 1, 1], lw=2, linestyle=':', color='black')
plt.xlim([-0.05, 1.05])
plt.ylim([-0.05, 1.05])
plt.xlabel('false positive rate')
plt.ylabel('true positive rate')
plt.title('Receiver Operator Characteristic')
plt.legend(loc='lower right')
plt.show()
```

![](https://mingminyu.github.io/webassets/images/20251208/87.png)

前面的示例代码使用了 scikit-learn 中我们已经熟悉的 StratifiedKFold 类，并且在 pipe_lr 流水线的每次迭代中都石永红了 sklearn.metrics 模块中的 roc_curve 函数，以计算 Logistic-Regression 分类器的 ROC 性能。此外，我们通过 SciPy 中的 interp 函数利用三个块数据对 ROC 曲线的内插均值进行了计算，并使用 auc 函数计算了低于 ROC 曲线区域的面积。最终的 ROC 曲线表明不同的块之间存在一定的方差，且平均 ROC AUC(0.75) 位于最理想情况(1.0) 与随机猜测(0.5) 之间。

如果我们仅对 ROC AUC 的得分感兴趣，也可以直接从 sklearn.metrics 子模块中导入 roc_auc_curve 函数。分类器在只有两个特征的训练集上完成拟合后，使用如下代码计算分类器在单独测试集上的 ROC AUC 得分:

```python
from sklearn.metrics import roc_auc_score
from sklearn.metrics import accuracy_score

pipe_svc = pipe_svc.fit(X_train2, y_train)
y_pred2 = pipe_svc.predict(X_test[:, [4, 14]])
print('ROC AUC: %.3f' % roc_auc_score(y_true=y_test, y_score=y_pred2))
print('Accuracy: %.3f' % accuracy_score(y_true=y_test, y_pred=y_pred2))

# 输出
ROC AUC: 0.671
Accuracy: 0.728
```

通过 ROC AUC 得到的分类器性能可以让我们进一步东西分类器在类别不均衡样本集合上的性能。然而，既然准确率评分可以解释为 ROC 曲线上某个单点处的值，A.P.Bradley 认为 ROC AUC 与准确率矩阵之间是相互一致的$^{注1}$。

> 注1: A.P.Bradley. The Use of the Area Under the ROC Curve in the Evaluation of Machine Learning Algorithms. Pattern recognition, 30(7): 1145-1159, 1997.

### 5.4 多类别分类的评价标准

本节中讨论的评分标准都是基于二类别分类系统的。不过，scikit-learn 实现了 macro(宏)及 micro(微)均值方法。旨在通过一对多(One vs All, OvA)的方式将评分标准扩展到了多类别分类问题。微均值是通过系统的真正、真负、假正，以及假负来计算的。例如，k 类别分类系统的准确率评分的微均值可按如下公式进行计算:

$$
PRE_{micro} = \frac {TP_1 + \dots + TP_k} {TP_1 + \dots + TP_k + FP_1 + \dots +FP_k}
$$

宏均值仅计算不同系统的平均分值:

$$
PRE_{macro} = \frac {PRE_1 + \dots + PRE_k}{k}
$$


当我们等同看待每个实例或每次预测时，微均值是有用的，而宏均值则是我们等同看待各个类别，将其用于评估分类器针对最频繁类别(即样本数量最多的类)的整体性能。

如果我们使用二类别性能指标来衡量 scikit-learn 中的多类别分类模型，会默认使用一个归一化或者是宏均值的一个加权变种。计算加权宏均值时，各类别以类内实例的数量作为评分的权值。当数据中类中样本分布不均衡时，也就是类标数量不一致时，采用加权宏均值比较有效。

由于加权宏均值是 scikit-learn 中多类别问题的默认值，我们可以通过 sklearn.metrics 模块导入其他不同的评分函数，如 precision_score 或 make_scorer 函数等，并利用函数内置的 average 参数定义平均方法:

```python
pre_scorer = make_scorer(score_func=precision_score, pos_label=1, 
                         greater_is_better=True, average='micro')
```

## 6. 本章小结

在本章的开始时，我们讨论了通过便捷的流水线模型串联不同的数据转换技术与分类器，以帮助我们更高效地训练与评估机器学习模型。进而我们使用流水线进行 k 折交叉验证，k 折交叉验证是模型选择及评估的一种基本技术。使用 k 折交叉验证，我们绘制了学习曲线和验证曲线以诊断学习算法中过拟合与欠拟合等常见问题。使用网格搜索，进一步对模型进行微调。最后我们学习了混淆矩阵以及各种不同性能评价指标，在针对特定问题需要进一步优化模型时，这些指标可能是非常有用的。到目前为止，我们已经具备了使用监督机器学习模型来成功构建分类器的基本技能。

在下一章，我们将学习算法集成方法，它使得我们可以通过混合多个模型与分类算法进一步提高机器学习系统的性能。
