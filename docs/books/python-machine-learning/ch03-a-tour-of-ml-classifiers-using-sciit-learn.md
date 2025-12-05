# 第3章：使用 scikit-learn 实现机器学习分类算法

> GitHub Notebook 地址: https://nbviewer.jupyter.org/github/rasbt/python-machine-learning-book/blob/master/code/ch03/ch03.ipynb

在本章中，我们从学术界和工业界常用的机器学习算法中，挑选了一些流行高效的算法进行讲解。在了解监督学习分类算法之间差异的同时，我们也能对各个算法的优势及劣势能有个直观的认识。此外，我们还要使用 scikit-learn 库迈出第一步，它为高效使用机器学习算法提供了一个用户友好的接口。

在本章中，我们将学到如下内容:

- 介绍常用分类算法的概念
- 使用 scikit-learn 机器学习库
- 选择机器学习算法时需要注意的问题

## 1. 分类算法的选择

由于每个算法都基于某些特定的假设，且均含有某些缺点，因此需要通过大量的实践为特定的问题选择合适的算法。再次借用一下“没有免费的午餐”理论: 没有任何一个分类器可以在所有可能的应用场景下都有良好的表现。实践证明，只有比较了多种学习算法的性能，才能为特定问题挑选出最合适的模型。这些模型针对不同数量的特征或者样本、数据集中噪声的数量，以及类别是否线性可分等问题时，表现各不相同。

总而言之，分类器的性能、计算能力和预测能力，在很大程度上都依赖于用于模型训练的相关数据。训练机器学习算法所涉及的五个主要步骤可以概述如下: 

1. 特征的选择
2. 确定性能评价标准
3. 选择分类器及其优化算法
4. 对模型性能的评估
5. 算法的调优

由于本书通过循序渐进地方式讲解机器学习的相关内容，因此本章将重点介绍不同分类算法的基本概念，并再次回顾特征选择、预处理及性能评价标准等内容，而关于超参调优等更详细的内容将在本书中的后续章节讨论。

## 2. 初涉 scikit-learn 的使用——训练感知器

在第2章中，我们学习了两种相关的分类算法，感知器规则算法和 Adaline 算法，我们使用 Python 自行实现了这两种算法。现在，了解一下 scikit-learn 的 API，它在实现几种高度优化的分类算法的同时，还提供了一个用户友好的接口。不过，scikit-learn 库不仅提供了大量的学习算法，还包含许多用于对数据进行预处理、调优和模型评估的功能。第4章和第5章会讨论这些问题和相关概念。

首先，我们使用 scikit-learn 训练一个感知器模型，此模型与第2章中实现的感知器模型类似，为了简单起见，我们将在本章后续几节中使用我们已经熟悉的鸢尾花数据集。由于鸢尾花数据集是一个简单、流行的数据集，它经常用于算法实验与测试，因此它已经默认包含在 scikit-learn 库中。同样，出于可视化应用的考虑，我们仍旧只使用鸢尾花数据集中的两个特征。

提取150个花朵样本中的花瓣长度和花瓣宽度两个特征的值，并由此构建特征矩阵 $X$，同时将对应花朵所属类型的类标赋值给向量 $y$ ：

```python linenums="1"
from sklearn import datasets
import numpy as np

iris = datasets.load_iris()
X = iris.data[:, [2,3]]
y = iris.target
```

如果执行 `np.unique(y)` 返回存储在 iris.target 中的各类花朵的类标，可以看到 scikit-learn 已分别将 Iris-Sentosa、Iris-Vensicolr 和 Iris-Virginia 的类名另存为整数 (0,1,2)。对许多机器学习库来说，这是针对性能优化一种推荐的做法。

为了评估训练得到的模型在未知数据上的表现，我们进一步将数据集划分为训练数据集和测试数据集。第5章会更详细地讨论关于模型验证的操作细节。

```python linenums="1"
from sklearn.cross_validation import train_test_split

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0)
```


使用 scikit-learn 中 `cross_validation` 模块中的 `train_test_split` 函数，随机将数据矩阵 $X$ 与类标向量 $y$ 按照 3:7 的比例划分为测试数据集(45个样本)和训练数据集(105个样本)。

第2章关于梯度下降得例子已经提到: 为了优化性能，许多机器学习和优化算法都要求对数据做特征缩放。在此，我们将使用 scikit-learn 的 `preprocessing` 模块中的 `StandardScaler` 类对特征进行标准化处理。

```python linenums="1"
from sklearn.preprocessing import StandardScaler

sc = StandardScaler()
sc.fit(X_train)
X_train_std = sc.transform(X_train)
x_test_std = sc.transform(X_test)
```

在上面的代码中，从 preprocessing 模块中加载了 `StandardScaler` 类，并实例化一个 `StandardScaler` 对象，用变量 sc 作为对它的引用。使用 StandardScaler 中的 `fit` 方法，可以计算训练数据集中的每个特征的 $\mu$ (样本均值)和 $\sigma$ (标准差)。通过调用 `transform` 方法，可以使用前面计算得到的 $\mu$ 和 $\sigma$ 来对训练数据做标准化处理。需要注意的是，我们要使用相同的缩放参数分别处理训练和测试数据集，以保证它们的值是彼此相当的。

在对训练数据做了标准化处理后，我们现在可以训练感知器模型了。scikit-learn 中的大多数算法本身就使用一对多(One-vs.-Rest, OvR)方法来支持多类别分类，因此，我们可以将三种鸢尾花的数据同时输入到感知器中。代码如下:

```python linenums="1"
from sklearn.linear_model import Perceptron

ppn = Perceptron(n_iter=40, eta0=0.1, random_state=0)
ppn.fit(X_train_std, y_train)
```

对于使用 scikit-learn 的接口训练感知器，其流程与我们在第2章中实现的感知器的流程类似: 在加载了 `linear_model` 模块中的 Perceptron 类后，我们实例化一个新的 Perceptron 对象，并通过 fit 方法训练模型。此模型中的参数 `eta0` 与我们自行实现的感知器中的学习速率 `eta` 等价，而参数 `n_iter` 定义了迭代的次数(遍历训练数据集的次数)。第2章提到: 合适的学习速率需要通过实验来获取。如果学习速率太大，算法可能会跳过全局最优点；如果学习速率太小，算法将需要更多次的迭代以达到收敛，这将导致训练速度变慢——尤其是面临巨大的数据集时。此外，我们使用 `random_state` 参数在每次迭代后初始化重排训练数据集。

与第2章实现的感知器一样，使用 scikit-learn 完成模型的训练后，就可以在测试数据集上使用 `predict` 方法进行预测了，代码如下:

```python
from sklearn.linear_model import Perceptron

ppn = Perceptron(n_iter=40, eta0=0.1, random_state=0)
ppn.fit(X_train_std, y_train)

y_pred = ppn.predict(X_test_std)
print('Misclassified samples: %d' % (y_test != y_pred).sum())
```

完整代码:

```python
import numpy as np
from sklearn import datasets
from sklearn.preprocessing import StandardScaler
from sklearn.cross_validation import train_test_split
from sklearn.linear_model import Perceptron


iris = datasets.load_iris()
X = iris.data[:, [2,3]]
y = iris.target
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0)

sc = StandardScaler()
sc.fit(X_train)
X_train_std = sc.transform(X_train)
X_test_std = sc.transform(X_test)
ppn = Perceptron(n_iter=40, eta0=0.1, random_state=0)
ppn.fit(X_train_std, y_train)

y_pred = ppn.predict(X_test_std)
print('Misclassified samples: %d' % (y_test != y_pred).sum())
```

执行上述代码，输出结果:

> Misclassified samples: 4

执行上述代码后，可以看到，在感知器对 45 朵花的分类结果中，有4个是错误的。也就是在测试数据集上的错误率为 0.089 或者说 8.9% (4/45 约等于 0.089)。

> 许多机器学习从业者通常使用准确率而不是误分类率来评判一个模型，它们之间的关系如下:
> $$ 1 - 误分类率 = 0.911 或 91.1\% $$

在 `metrics` 模块中，scikit-learn 还实现了许多不同的性能矩阵。例如，可以通过下列代码计算感知器在测试数据集上的分类准确率:

```python
from sklearn.metrics import accuracy_score
print('Accuracy: %.2f' % accuracy_score(y_test, y_pred))
```

执行上述代码，输出结果:

> Accuracy: 0.91

此处，y_test 是真是的类标，而 y_pred 是通过前面预测得到的类标。

> 本章我们使用测试集评估模型的性能。在第5章中，读者将学到使用诸如学习曲线等图形分析工具来检测并预防**过拟合**(overfitting)。过拟合意味着模型很好地捕获到了训练数据集中的模式，但是却无法泛化到未知的新数据上。

最后，可以使用在第2章中实现的 `plot_decision_regions` 函数绘制刚刚训练过的模型的**决策区域**，并观察不同花朵样本的分类效果。不过，我们做过少许修改: 使用小圆圈来高亮显示来自测试数据集的样本:

```python
import numpy as np
from matplotlib.colors import ListedColormap
import matplotlib.pyplot as plt

def plot_decision_regions(X, y, classifier, test_idx=None, resolution=0.02):
  
	# setup marker generator and color map
    markers = ('s', 'x', 'o', '^', 'v')
    colors = ('red', 'blue', 'lightgreen', 'gray', 'cyan')
    cmap = ListedColormap(colors[:len(np.unique(y))])

    # plot the decision surface
    x1_min, x1_max = X[:,0].min() - 1, X[:,0].max() + 1
    x2_min, x2_max = X[:,1].min() - 1, X[:,1].max() + 1

    xx1, xx2 = np.meshgrid(np.arange(x1_min, x1_max, resolution),
              			   np.arange(x2_min, x2_max, resolution))
    Z = classifier.predict(np.array([xx1.ravel(), xx2.ravel()]).T)
    Z = Z.reshape(xx1.shape)
    plt.contourf(xx1, xx2, Z, alpha=0.4, cmap=cmap)
    plt.xlim(xx1.min(), xx1.max())
    plt.ylim(xx2.min(), xx2.max())

    # plot all samples
    X_test, y_test = X[test_idx, :], y[test_idx]
    for idx, cl in enumerate(np.unique(y)):
    	plt.scatter(x=X[y == cl, 0], y=X[y == cl, 1], alpha=0.8, 
            c=cmap(idx), marker=markers[idx], label=cl)

    # highlight test samples
    if test_idx:
	    X_test, y_test = X[test_idx, :], y[test_idx]
	    plt.scatter(X_test[:, 0], X_test[:, 1], c='', alpha=1.0,
	          linewidth=1, marker='o', s=55, label='test set')
```

对 `plot_decision_regions` 函数稍作修改后(前面代码中加重显示的部分)，可以在结果呈现的图像中区分出哪些是我们需要预测的样本。代码如下:

```python
import numpy as np
import matplotlib.pyplot as plt
from sklearn import datasets
from sklearn.preprocessing import StandardScaler
from sklearn.cross_validation import train_test_split
from sklearn.linear_model import Perceptron
from sklearn.metrics import accuracy_score
from itools import plot_decision_regions

iris = datasets.load_iris()
X = iris.data[:, [2,3]]
y = iris.target

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0)

sc = StandardScaler()
sc.fit(X_train)
X_train_std = sc.transform(X_train)
X_test_std = sc.transform(X_test)

ppn = Perceptron(n_iter=40, eta0=0.1, random_state=0)
ppn.fit(X_train_std, y_train)

X_combined_std = np.vstack((X_train_std, X_test_std))
y_combined = np.hstack((y_train, y_test))
plot_decision_regions(X=X_combined_std, y=y_combined, classifier=ppn, test_idx=range(105,150))

plt.xlabel('petal length [standardized]')
plt.xlabel('petal width [standardized]')
plt.legend(loc='upper left')
plt.show()
```

从结果呈现的图像中我们可以看到，无法通过一个线性决策边界完美区分三类样本。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20190823235810988.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L0x1Q2gxTW9uc3Rlcg==,size_16,color_FFFFFF,t_70)


回忆一下第2章讨论过的内容: 对于无法完美线性可分的数据集，感知器算法将永远无法收敛，这也是在实践中一般不推荐使用感知器算法的原因。后续几节，我们将着眼于更加先进的线性分类器算法，即使是面对无法完美线性可分的数据集，这些算法也可以在一定程度上收敛。

> Perceptron 以及 scikit-learn 中其他的一些函数和类都包含许多额外的参数，为了清晰起见，我们忽略了这些参数。读者可以通过 Python 中的 help 函数(如 help(Perceptron) 或者通过 scikit-learn 的在线文档(http://scikit-learn.org/stable/ ) 来了解这些参数的相关信息。

## 3. 逻辑斯蒂回归中的类别概率
感知器是机器学习分类算法中优雅易用的一个入门级算法，不过其最大的缺点在于: 在样本不是完全线性可分的情况下，它永远不会收敛。上一小节中关于分类的任务就是这样的一个例子。直观上，可以把原因归咎于: 在每次迭代过程中，总是存在至少一个分类错误的样本，从而导致了权重持续更新。当然，你也可以改变学习速率并增加迭代次数，不过感知器在此类数据集上仍旧无法收敛。为了提高分类的效率，我们学习另外一种针对线性二类别分类问题的简单但更高效的算法: 逻辑斯蒂回归(Logistic Regression)。请注意，不要被其名字所迷惑，逻辑斯蒂回归是一个分类模型，而不是回归模型。

### 3.1 Logistic回归中的类别概率

逻辑斯蒂回归是针对线性可分问题的一种易于实现且性能优异的分类模型。它是业界应用最为广泛的分类模型之一。与感知器及 Adaline 类似，逻辑斯蒂回归模型也是适用于二类别分类问题的线性模型，通过一对多(OvR)技术扩展到多类别分类。

在介绍逻辑斯蒂回归作为一种概率模型所具有的特性之前，我们先介绍一下**几率比**(odd ratio)[^注1]，它指的是特定事件发生的几率。用数学公式表示为 $\frac {p}{1-p}$，其中 $p$ 为**正事件**发生的概率。此处，正事件并不意味着好的事件，而是指我们所要预测的事件，以一个患者患有某种疾病的概率为例，我们可以将正事件的类标记为 $y=1$。更进一步，我们可以定义 logit 函数，它是几率比的对数函数(log-odds，对数几率)。

$$
logit(p) = log \frac {p}{1-p}
$$
logit 函数的输入值范围介于区间 [0, 1]，它能将输入转换到整个实数范围内，由此可以将对数几率记为输入特征值的线性表达式:

$$
logit(p(y=1|x)) = w_0x_0 + w_1x_1 + \dots + w_mx_m = \sum_{i=0}^n w_mx_m = w^Tx
$$
此处，$p(y=1|x)$ 是在给定特征 $x$ 的条件下，某一个样本属于类别 1 的条件概率。

我们在此的真正目的是预测某一样本属于特定类别的概率，它是 logit 函数的反函数，也称作 logistic 函数，由于它的图像呈 S 形，因此有时候也简称为 sigmod 函数:

$$
\phi (z) = \frac {1}{1+e^{-z}}
$$
这里的 $z$ 为净输入，也就是样本特征与权重的线性组合，其计算方式为:

$$
z = w^Tx = w_0x_0 + w_1x1 + \dots + w_mx_m
$$
我们来绘制一下自变量取值介于区间 [-7,7] 的 sigmod 函数的图像:

```python
import matplotlib.pyplot as plt
import numpy as np

def sigmod(z):
	return 1.0 / (1.0 + np.exp(-z))

z = np.arange(-7, 7, 0.1)
phi_z = sigmod(z)
plt.plot(z, phi_z)
plt.axvline(0.0, color='k')
plt.axhspan(0.0, 1.0, facecolor='1.0', alpha=1.0, ls='dotted')
plt.axhline(y=0.0, ls='dotted', color='k')
plt.axhline(y=0.5, ls='dotted', color='k')
plt.axhline(y=1.0, ls='dotted', color='k')
plt.yticks([0.0, 0.5, 1.0])
plt.ylim(-0.1, 1.1)
plt.xlabel('z')
plt.ylabel('$\phi (z)$')
plt.show()
```

执行上述代码，将会呈现一个 S 形(sigmoidal) 曲线:

![](https://imgconvert.csdnimg.cn/aHR0cDovL2dpdGh1Yi5jb20vbWluZ21pbnl1L2ltYWdlcy9yYXcvbWFzdGVyL3B5dGhvbi1tYWNoaW5lLWxlYXJuaW5nL2NoMDMvMy0yLmpwZw)


可以看到，当 $z$ 趋向于无穷大($z \to +\infty$)时，$\phi (z)$ 趋近于1，这是由于 $e^{-z}$ 在 $z$ 值极大的情况下其值变得极小。类似地，当 $z$ 趋向于负无穷($z \to - \infty$)时，$\phi (z)$ 趋近于 0，这是由于此时分母越来越大的结果。由此，可以得出结论: sigmod 函数以实数值作为输入并将其映射到 [0, 1] 区间，其拐点位于 $\phi (z) = 0.5$处。

为了对逻辑斯蒂回归有个直观的认识，我们可以将其与第2章介绍的 Adaline 联系起来。在 Adaline 中，我们使用恒等函数 $\phi (z)=z$ 作为激励函数。而在逻辑斯蒂回归中，只是简单地将前面提及的 sigmod 函数作为激励函数，如下图所示:

![在这里插入图片描述](https://img-blog.csdnimg.cn/20190823235909295.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L0x1Q2gxTW9uc3Rlcg==,size_16,color_FFFFFF,t_70)


在给定特征 $x$ 及其权重 $w$ 的情况下，sigmod 函数的输出给出了特定样本 $x$ 属于类别 1 的概率 $\phi (z) = P(y=1|x; w)$ 。例如，针对某一样本我们求得 $\phi (z)=0.8$，这意味着样本属于变色鸢尾的概率为 80%。类似地，该样本属于山鸢尾的概率可计算为 $P(y=0|x; w) = 1 -P(y=1|x; w)=0.2$，也就是 20%。预测得到的概率可以通过一个量化器(单位阶跃函数) 简单地转换为二元输出:

$$
\widehat y = \begin{cases}
1 & 若 \phi (z) \geq 0.5 \\
0 & 其他
\end{cases}
$$

对照前面给出的 sigmod 函数的图像，它其实相当于:

$$
\widehat y = \begin{cases}
1 & 若 z \geq 0.0 \\
0 & 其他
\end{cases}
$$

对于许多应用实践来说，我们不但对类标预测感兴趣，而且对事件属于某一类别的概率进行预测也非常有用。例如，将逻辑斯蒂应用于天气预报，不仅要预测某天是否会下雨，还要推测出下雨有多大的可能性。同样，逻辑斯蒂回归还可以预测在出现某些症状的情况下，患者患有某种疾病的可能性，这也是逻辑斯蒂回归在医疗领域得到最广泛应用的原因。

### 3.2 通过逻辑斯蒂回归模型的代价函数获得权重

我们已经学会了如何使用逻辑斯蒂回归模型预测概率和类标。现在简要介绍一下模型的参数，例如这里的权重 $w$。在上一章中，我们将其代价函数定义为误差平方和(sum-squared-error):

$$
J(w) = \sum_i \frac {1}{2} (\phi (z^{(i)}) - y^{(i)})^2
$$

通过最小化此代价函数，我们可以得到 Adaline 分类模型的权重 $w$。为了推导出逻辑斯蒂回归模型中的代价函数，我们在构建逻辑斯蒂回归模型时，需要先定义一个最大似然函数 $L$，假定数据集中的每个样本都是相互独立的，其计算公式如下:

$$
L(w) = P(y|x; w) = \prod_{i=1}^n  (\phi (z^{(i)}))^{y^{(i)}} (1 - \phi (z^{(i)}))^{1-y^{(i)}}
$$
在实际应用中，很容易对此方程(自然)对数进行最大化处理(求其极大值)，故定义了对数似然函数:

$$
l(w) = \log L(w) = \sum_{i=1}^n \log (\phi (z^{(i)}))+(1-y^{(i)}) \log (1-\phi (z^{(i)}))
$$

!!! fatal "错误"

    此处书中存在错误，修正为: 
    $$
    l(w) = \log L(w) = \sum_{i=1}^n y^{(i)} \log (\phi (z^{(i)}))+(1-y^{(i)}) \log (1-\phi (z^{(i)}))
    $$


首先，在似然函数值非常小的时候，可能出现数值溢出的情况，使用对数函数降低了这种情况发生的可能性。其次，我们可以对各因子的连乘转换为和的形式，利用微积分中的方法，通过加法转换技巧可以更容易对函数求导。

现在可以通过梯度上升等优化算法最大化似然函数。或者，改写一下对数似然函数作为代价函数 $J$，这样就可以使用第2章中的梯度下降做最小化处理了。

$$
J(w) = \sum_{i=1}^n -\log (\phi (z^{(i)})) - (1-y^{(i)}) \log (1-\phi (z^{(i)}))
$$


!!! fatal "错误"

    此处书中存在错误，修正为: 
    
    $$
    J(w) = \sum_{i=1}^n -y^{(i)} \log (\phi (z^{(i)})) - (1-y^{(i)}) \log (1-\phi (z^{(i)}))
    $$

为了更好地理解这一代价函数，先了解一下如何计算单个样本实例的成本:

$$
J(\phi (z), y; w) = -y \log(\phi (z)) - (1-y) \log (1 - \phi (z))
$$

通过上述公式可以发现: 如果 y=0, 则第一项为 0；如果 y=1, 则第二项为 0。

$$
J(\phi (z), y; w) = \begin{cases}
-\log (\phi (z)) & 若 y=1 \\
-\log (1 - \phi (z)) & 若 y=0
\end{cases}
$$

下图解释了在不同 $\phi (z)$ 值时对单一示例样本进行分类的代价:

可以看到，如果将样本正确地划分到类别1中，代价将趋近于0(实线)。类似地，如果正确将样本划分到类别0中，$y$ 轴所代表的代价也将趋近于0(虚线)。然而，如果分类错误，代价函数将趋近于无穷。这也就意味着错误预测带来的代价将越来越大。

### 3.3 使用 scikit-learn 训练逻辑斯蒂回归模型

如果想要自己编写代码实现逻辑斯蒂回归模型，只要将第2章中的代价函数 $J$ 替换为下面的代价函数:

$$
J(w) = - \sum_i y^{(i)} \log(\phi (z^{(i)})) +(1-y^{(i)}) \log (1 - \phi (z^{(i)}))
$$
该函数通过计算每次迭代过程中训练所有样本的成本，最终得到一个可用的逻辑斯蒂回归模型。然而，由于 scikit-learn 已经有现成的经过高度优化的逻辑斯蒂算法，而且还支持多类别分类，因此，我们不再尝试自己实现算法，转而使用 `scikit-learn.linear_model.LogisticRegression` 类来完成，同时使用我们已经非常熟悉的 `fit` 方法在鸢尾花训练数据集上训练模型。

```python
from sklearn.linear_model import LogisticRegression
import numpy as np
import matplotlib.pyplot as plt
from sklearn import datasets
from sklearn.preprocessing import StandardScaler
from sklearn.cross_validation import train_test_split
from sklearn.linear_model import Perceptron
from sklearn.metrics import accuracy_score
from itools import plot_decision_regions

iris = datasets.load_iris()
X = iris.data[:, [2,3]]
y = iris.target

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0)

sc = StandardScaler()
sc.fit(X_train)
X_train_std = sc.transform(X_train)
X_test_std = sc.transform(X_test)

X_combined_std = np.vstack((X_train_std, X_test_std))
y_combined = np.hstack((y_train, y_test))

lr = LogisticRegression(C=1000.0, random_state=0)
lr.fit(X_train_std, y_train)
plot_decision_regions(X_combined_std, y_combined, classifier=lr, test_idx=range(105,150))
plt.xlabel('petal length [standardized]')
plt.ylabel('petal width [standardized]')
plt.legend(loc='upper left')
plt.savefig('../images/fig_03.png')
plt.show()
```

在训练数据集上对模型进行训练后，我们在二维图像中绘制了决策区域、训练样本和测试样本，如下图所示:


分析前面用来训练 LogisticRegression 模型的代码，你也许会思考: “那个神秘的参数C代表什么?” 下一节先介绍一下过拟合和正则化的概念，然后再来讨论这个神秘的参数。

此外，可以通过 predict_proba 方法来预测样本属于某一类别的概率。例如，可以预测第一个样本属于各个类别的概率:

```python
from sklearn.linear_model import LogisticRegression
import numpy as np
import matplotlib.pyplot as plt
from sklearn import datasets
from sklearn.preprocessing import StandardScaler
from sklearn.cross_validation import train_test_split
from sklearn.linear_model import Perceptron
from sklearn.metrics import accuracy_score
from itools import plot_decision_regions

iris = datasets.load_iris()
X = iris.data[:, [2,3]]
y = iris.target

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0)

sc = StandardScaler()
sc.fit(X_train)
X_train_std = sc.transform(X_train)
X_test_std = sc.transform(X_test)

X_combined_std = np.vstack((X_train_std, X_test_std))
y_combined = np.hstack((y_train, y_test))

lr = LogisticRegression(C=1000.0, random_state=0)
lr.fit(X_train_std, y_train)

print(lr.predict_proba(X_test_std[0, :]).round(3))
```

通过此代码可得到如下数组:

> [[0., 0.063, 0.937]]

此数组表明模型预测此样本属于 iris-Virginica 的概率为 93.7%，属于 Iris-Versicolor 的概率为 6.3%。

可以证明，逻辑斯蒂回归中的回归系数更新用到的梯度下降的本质上与第2章中的公式是相同的。首先，计算对数似然函数第 $j$ 个权重的偏导:

$$
\frac {\partial} {\partial w_j} l(w) = 
\left ( y \frac {1}{\phi (z)} - (1-y) \frac {1}{1-\phi (z)} \right) \frac {\partial} {\partial w_j} \phi (z)
$$

在进入下一步之前，先计算一下 sigmod 函数的偏导:

$$
\frac {\partial} {\partial w_j} \phi (z) = 
\frac {\partial} {\partial z} \frac {1}{(1+e^{(-z)})^2} e^{-z} = 
\frac {1}{1+e^{-z}} \left( 1- \frac {1}{1+e^{-z}} \right) = 
\phi(z)(1 - \phi(z))
$$

将 $\frac {\partial} {\partial w_j} \phi (z) = \phi(z)(1 - \phi(z))$ 代入第一个方程中，可以得到:

$$
\left ( y \frac {1}{\phi (z)} - (1-y) \frac {1}{1-\phi (z)} \right) \frac {\partial} {\partial w_j} \phi (z) \\
\begin{aligned}
= & \left ( y \frac {1}{\phi (z)} - (1-y) \frac {1}{1-\phi (z)} \right) \phi(z)(1-\phi(z)) \frac {\partial} {\partial w_j} z \\
= & (y(1-\phi(z)) - (1-y)\phi(z))x_j \\
= & (y - \phi(z))x_j
\end{aligned}
$$

我们的目标是求得能够使对数似然函数最大化的权重值，在此需按如下公式更新所有权重:

$$
w_j: = w_j + \eta \sum_{i=1}^n (y^{(i)} - \phi(z^{(i)}))x^{(i)}
$$

由于我们是同时更新所有的权重的，因此可以将更新规则记为:

$$
w: = w + \Delta w
$$
其中，$\Delta w$ 定义为:

$$
\Delta w = \eta \nabla l(w)
$$
由于最大化对数似然函数等价于最小化前面定义的代价函数 $J$，因此可以将梯度下降得更新规则定义为:

$$
\Delta w_j= -\eta \frac {\partial J}{\partial w} = \eta \sum_{i=1}^n (y^{(i)} - \phi(z^{(i)})x^{(i)}) \\
w: = w + \Delta w, \Delta w = -\eta \nabla J(w)
$$

这等价于第2章中的梯度下降规则。

### 3.4 通过正则化解决过拟合问题

过拟合是机器学习中的常见问题，它是指模型在训练数据集上表现良好，但是用于未知数据(测试数据)时性能不佳。如果一个模型出现了过拟合问题，我们也说此模型有高方差，这有可能是因为使用了相关数据中过多的参数，从而使模型变得过于复杂。同样，模型也可能面临**欠拟合**(高偏差)问题，这意味着模型过于简单，无法发现训练数据集中隐含的模式，这也会使得模型应用于未知数据时性能不佳。

虽然我们目前只介绍了分类中的线性模型，但对于过拟合与欠拟合问题，最好使用更加复杂的非线性决策边界来阐明，如下图所示:


> 如果我们多次重复训练一个模型，如使用训练数据集中不同的子集，方差可以用来衡量模型对特定样本实例预测的一致性(或者说变化)。可以说模型对训练数据中的随机性是敏感的。相反，当我们在不同的训练数据集上多次重建模型时，偏差可以从总体上衡量预测值与实际值之间的差异；偏差并不是由样本的随机性导致的，它衡量的是系统错误。

偏差 - 方差权衡(bais-variable tradeoff)就是通过正则化调整模型的复杂度。正则化是解决共线性(特征间高度相关)的很有用的一个方法，它可以过滤数据中的噪声，并最终防止过拟合。正则化背后的概念是引入额外的信息(偏差)来对极端参数权重做出惩罚。最常用的正则化形式称为 L2 正则化(L2 regularization)，它有时也称作 L2 收缩(L2 shrinkage) 或权重衰减(weight decay)，可写作:

$$
\frac {\lambda}{2} \parallel w \parallel^2 = \frac {\lambda}{2} \sum_{j=1}^m w_j^2
$$
其中，$\lambda$ 为正则化系数。

> 特征缩放(如标准化等)之所以重要，其中一个原因就是正则化。为了使得正则化起作用，需要确保所有特征量的衡量标准保持统一。

使用正则化方法时，我们只需要在逻辑斯蒂回归的代价函数中加入正则项，以降低回归系数带来的副作用:

$$
J(w) = \left \{ \sum_{i=1}^n (-\log (\phi(z^{(i)})) + (1-y^{(i)})(-\log (1 - \phi(z^{(i)}))) \right \} + \frac {\lambda}{2} \parallel w \parallel^2
$$

通过正则化系数 $\lambda$，保持权值较小时，我们就可以控制模型与训练数据的拟合程度。增加 $\lambda$ 的值，可以增强正则化的强度。

前面用到了 scikit-learn 库中的 LogisticRegression 类，其中的参数 $C$ 来自下一小节要介绍的支持向量机的约定，它是正则化系数的倒数:

$$
C = \frac {1}{\lambda}
$$


由此，我们可以将逻辑斯蒂回归中经过正则化的代价函数写作:

$$
J(w) = C \left \{ \sum_{i=1}^n (-\log (\phi(z^{(i)})) + (1-y^{(i)})(-\log (1 - \phi(z^{(i)}))) \right \} + \frac {\lambda}{2} \parallel w \parallel^2
$$

因此，减小正则化参数倒数 $C$ 的值相当于增加正则化的强度，这可以通过绘制对两个权重系数进行 L2 正则化后的图像予以展示:

```python
from sklearn.linear_model import LogisticRegression
import numpy as np
import matplotlib.pyplot as plt
from sklearn import datasets
from sklearn.preprocessing import StandardScaler
from sklearn.cross_validation import train_test_split
from sklearn.linear_model import Perceptron
from sklearn.metrics import accuracy_score
from itools import plot_decision_regions

iris = datasets.load_iris()
X = iris.data[:, [2,3]]
y = iris.target

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0)

sc = StandardScaler()
sc.fit(X_train)
X_train_std = sc.transform(X_train)
X_test_std = sc.transform(X_test)

X_combined_std = np.vstack((X_train_std, X_test_std))
y_combined = np.hstack((y_train, y_test))

weights, params = [], []
for c in np.arange(-5, 5):
	lr = LogisticRegression(C=10.0**c, random_state=0)
    lr.fit(X_train_std, y_train)
    weights.append(lr.coef_[1])
    params.append(10.0**c)

weights = np.array(weights)
plt.plot(params, weights[:,0], label='petal length')
plt.plot(params, weights[:,1], linestyle='--', label='petal width')
plt.ylabel('weight coeficient')
plt.xlabel('C')
plt.legend(loc='upper left')
plt.xscale('log')
plt.savefig('../images/fig_04.png')
plt.show()
```

执行上述代码，我们使用不同的逆正则化参数 $C$ 拟合了 10 个逻辑斯蒂回归模型。出于演示的目的，我们仅仅记录了类别2区别于其他类别的权重系数。请牢记，我们使用 OvR 技术来实现多类别分类。

通过结果图像可以看到，如果我们减小参数 $C$ 的值，也就是增加正则化的强度，可以导致权重系数逐渐收缩。


> 由于深入理解每个分类算法的细节已经超出了本书的讨论范围，因此强烈建议读者阅读 Scott Menard 博士的书籍(Logistic Regression: From Introductory to Advanced Concepts and Applications, Sage Publications) 以了解更多关于逻辑斯蒂回归的内容。

## 4. 使用支持向量机最大化分类间隔

另一种性能强大且广泛应用的学习算法是**支持向量机**(support vector machine, SVM)，它可以看作对感知器的扩展。在感知器算法中，我们可以最小化分类错误。而在 SVM 中，我们的优化目标是最大化分类间隔。此处间隔是指两个分离的超平面(决策边界)间的距离，而最靠近超平面的训练样本称作**支持向量**(support vector)，如下图所示:


### 4.1 对分类间隔最大化的直观认识

决策边界间具有较大的间隔意味着模型具有较小的泛化误差，而较小的间隔则意味着模型可能过拟合。为了对间隔最大化有个直观的认识，我们仔细观察一下两条平行的的决策边界，我们分别称其为正、负平面，可表示为:

$$
\begin{aligned}
& w_0 + w^Tx_{pos} = 1 \quad (1) \\
& w_0 + w^Tx_{neg} = -1 \quad (2)
\end{aligned}
$$

如果我们将等式 (1)(2) 相减，可以得到:
$$
\Rightarrow w^T(x_{pos} - x_{neg}) = 2
$$


我们可以通过向量 $w$ 的长度来对其进行规范化，做如下定义:

$$
\parallel w \parallel = \sqrt {\sum_{j=1}^m w_j^2}
$$
由此可以得到如下等式:

$$
\frac {w^T(x_{pos} - x_{neg})}{\parallel w \parallel} = \frac {2}{\parallel w \parallel}
$$

上述等式的左侧可以解释为正、负超平面间的距离，也就是我们要最大化间隔。

在样本正确划分的前提下，最大化分类间隔也就是使 $\frac {2}{\parallel w \parallel}$ 最大化，这也是 SVM 的目标函数，记为:

$$
\begin{aligned}
w_0 + w^Tx^{(i)} \geq 1 & \quad 若 y^{(i)} = 1 \\
w_0 + w^Tx^{(i)} < -1 & \quad 若  y^{(i)} = -1
\end{aligned}
$$

这两个方程可以解释我: 所有的负样本都落在负超平面一侧，而所有的正样本则在正超平面划分出来的区域中。它们可以写成更紧凑的形式:

$$
y^{(i)}(w_0 + w^Tx^{(i)}) \geq 1 \quad \forall_i \\
$$

在实践中，通过二次规划的方法，很容易对目标函数的倒数项 $\frac {1}{2} \parallel w \parallel$ 进行最小化处理，不过关于二次规划的详细内容超出了本书的内容，如果读者感兴趣，可以通过阅读由 Springer 出版社出版，Vladimir Vapnik 的 *The Nature of Statistical Learning Theory*一书，或者查阅 Chris J.C.Burger 在其论文 “A Tutorial on Support Vector Machines for Pattern Recognition” (发表于 *Data mining and knowledge discovery, 2(2):121~167, 1998*) 中的精彩解释。

### 4.2 使用松弛变量解决非线性可分问题

我们无需对间隔分类背后的数学概念进行更深入的探讨，在此只是简单介绍一下，在此只是简单介绍一下松弛变量 $\xi$ 的概念。它由 Vladimir Vapnik 在1995年引入，并由此提出所谓的软间隔分类。介绍松弛系数 $\xi$ 的目的是: 对于非线性可分的数据来说，需要放松线性约束条件，以保证在适当的惩罚项成本下，对错误分类的情况进行优化时能够收敛。

取值为正的松弛变量可以简单地加入到线性约束中:

$$
\begin{aligned}
w^Tx^{(i)} \geq 1 & \quad 若 y^{(i)} = 1 - \xi^{(i)} \\
w^Tx^{(i)} < -1 & \quad 若 y^{(i)} = 1 + \xi^{(i)}
\end{aligned} 
$$

由此，在前面提及的约束条件下，新的优化目标为最小化下式:

$$
\frac {1}{2} \parallel w \parallel^2 + C (\sum_i \xi^{(i)})
$$

通过变量 $C$，我们可以控制对错误分类的惩罚程度。$C$ 值较大时，对应打的错误惩罚，当选择小的 $C$ 值时，则对错误分类的惩罚没那么严格。因此，使用参数 $C$ 来控制间隔的大小，进而可以在偏差和方差之间取得平衡，如下图所示:


前面在回归的正则化中已经做了讨论，我们通过增加 $C$ 的值来增加偏差并降低模型的方差。

至此，我们已经学习了线性 SVM 的基本概念，现在让我们来训练一个 SVM 模型以对鸢尾花数据集中的样本进行分类。

```python
from sklearn.svm import SVC
import numpy as np
import matplotlib.pyplot as plt
from sklearn import datasets
from sklearn.preprocessing import StandardScaler
from sklearn.cross_validation import train_test_split
from sklearn.linear_model import Perceptron
from sklearn.metrics import accuracy_score
from itools import plot_decision_regions

iris = datasets.load_iris()
X = iris.data[:, [2,3]]
y = iris.target

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0)

sc = StandardScaler()
sc.fit(X_train)
X_train_std = sc.transform(X_train)
X_test_std = sc.transform(X_test)

X_combined_std = np.vstack((X_train_std, X_test_std))
y_combined = np.hstack((y_train, y_test))

svm = SVC(kernel='linear', C=1.0, random_state=0)
svm.fit(X_train_std, y_train)

plot_decision_regions(X_combined_std, y_combined, classifier=svm, test_idx=range(105,150))
plt.xlabel('petal length [standardized]')
plt.ylabel('petal width [standardized]')
plt.legend(loc='upper left')
plt.savefig('../images/fig_04.png')
plt.show()
```

执行上述代码可以通过 SVM 获得的决策区域可以可视化，结果如下图所示:


> **逻辑斯蒂回归与支持想谅解**
> 在实际分类任务中，线性逻辑斯蒂回归与支持向量机往往能得到非常相似的结果。逻辑斯蒂回归会尽量最大化训练数据集的条件似然，这使得它比支持向量机易于处理离群点。而支持向量机则更关注接近决策边界(支持向量机)的点。逻辑斯蒂回归的另一个优势在于模型简单从而容易实现。此外，逻辑斯蒂回归模型更新方便，当应用于流数据分析时，这是非常具备吸引力的。

### 4.3 使用 scikit-learn 实现 SVM

前面章节中用到了 scikit-learn 中的 Perceptron 和 LogisticRegression 类，它们都使用了 LIBLINEAR 库，LIBLINEAR 是一个由中国台湾大学(http://www.csie.ntu.edu.tw/~cjlin/liblinear/ )使用 C/C++ 语言开发的经过高度优化的库。类似地，用于训练 SVM 模型的 SVC 类使用了 LIBLINEAR 库，它是一个专门用于 SVM 的 C/C++ 库(http://www.csie.ntu.edu.tw/~cjlin/libsvm/ )。

与使用原生 Python 代码实现线性分类器相比，使用 LIBLINEAR 和 LIBSVM 库实现有其优点: 在用于大型数据时，可以获得极高的训练速度。然而，有些时候数据集非常巨大以致无法加载到内存中，针对这种情况，scikit-learn 提供了 SGDClassifier 类供用户选择，这个类还通过 partial_fit 方法支持在线学习。SGDClassifier 类背后的概念类似于第2章中实现的随机梯度算法。我们可以使用默认的参数以如下方式分别初始化基于随机梯度下降的感知器、逻辑斯蒂回归以及支持向量机模型。

```python
from sklearn.linear_model import SGDClassifier

ppn = SGDClassifier(loss='Perceptron')
lr = SGDClassifier(loss='log')
svm = SGDClassifier(loss='hinge')
```

## 5. 使用核 SVM 解决非线性问题

支持向量机在机器学习爱好者中广受欢迎的另一原因是: 它可以很容易地使用“核技巧”来解决非线性问题。在讨论 SVM 的核的基本概念之前，先通过一个例子来认识一下所谓的非线性可分问题到底是什么。

通过如下代码，我们使用 Numpy 的 logical_xor 函数创建了一个经过“异或”操作的数据集，其中 100 个样本属于类别1，另外的100个样本被划定为类别 -1:

```python
import numpy as np
import matplotlib.pyplot as plt

np.random.seed(0)
X_xor = np.random.randn(200, 2)
y_xor = np.logical_xor(X_xor[:, 0] > 0, X_xor[:, 1] > 0)
y_xor = np.where(y_xor, 1, -1)

plt.scatter(X_xor[y_xor==1, 0], X_xor[y_xor==1, 1], c='b', marker='x', label='1')
plt.scatter(X_xor[y_xor==-1, 0], X_xor[y_xor==-1, 1], c='r', marker='s', label='-1')
plt.ylim(-3.0)
plt.legend(loc='upper left')
plt.savefig('../images/fig_05.png')
plt.show()
```

执行上述代码后，我们用过随机噪声得到一个“异或”数据集，其二维分布图如下所示:


显然，如果使用前面小节讨论过的线性逻辑斯蒂回归或者线性 SVM 模型，并将线性超平面当做决策边界，无法将样本正确划分为正类别或负类别。

核方法处理此类非线性可分数据的基本概念就是: 通过映射函数 $\phi(\cdot)$ 将样本的原始特征映射到一个使样本线性可分的更高维空间中。如下图所示，我们可以将二维数据集通过下列映射转换到新的三维特征空间中，从而使得样本可分:

$$
\phi(x_1, x_2) = (z_1, z_2, z_3) = (x_1, x_2, x_1^2+x_2^2)
$$

这使得我们可以将图中的两个类别通过线性超平面进行分割，如果我们把此超平面映射回原始特征空间，则可线性分割两类数据的超平面就变为非线性的了。


**使用核技巧在高维空间中发现分离超平面**

为了使用 SVM 解决非线性问题，我们通过一个映射函数 $\phi(\cdot)$ 将训练数据映射到更高维的特征空间，并在新的特征空间上训练一个线性 SVM 模型。然后将同样的映射函数 $\phi(\cdot)$ 应用于新的、未知数据上的(即使用此映射将未知数据映射到新的特征空间)，进而使用新特征空间上的线性 SVM 模型进行分类。

但是，这种映射方法面临的一个问题就是: 构建新的特征空间带来非常大的计算成本，特别是在处理高维数据的时候。这时就用到了我们称作核技巧的方法。我们不会过多关注 SVM 训练中所需解决的二次规划问题，在实践中，我们所需要做的就是将点积 $x^{(i)T}x^{(j)}$ 映射为 $\phi(x^{(i)})^T \phi(x^{(j)})$。为了降低两点之间点积精确计算阶段的成本耗费，我们定义为一个所谓的核函数: $k(x^{(i)}, x^{(j)}) = \phi(x^{(i)})^T \phi(x^{(j)})$。

一个最广为使用的核函数就是**径向基函数核**(Radial Basis Function kernel, RBF kernel) 或高斯核(Gaussian kernel):

$$
k(x^{(i)}, x^{(j)}) = exp \left( -\frac {\parallel x^{(i)} - x^{(j)} \parallel^2}{2\sigma^2} \right)
$$
此公式简写为:

$$
k(x^{(i)}, x^{(j)}) = exp -\gamma {\parallel x^{(i)} - x^{(j)} \parallel^2}
$$
这里，$\gamma = \frac {1}{2\sigma^2}$ 是待优化的自由参数。

粗略地说，“核”可解释为一对样本之间的“相似函数”。此处的负号将距离转换为相似性评分，而由于指数项的存在，使得相似性评分会介于 0 之间(差异巨大的样本)和 1(完全相同的样本)。

现在我们已经知道了使用核技巧的重点，尝试能否训练一个核 SVM，使之可以通过一个非线性决策边界来对“异或”数据进行分类。在此，我们只是简单使用前面已经导入的 scikit-learn 包中的 SVM 类，并将参数 `kernel='linear'` 替换为 `kernel='rbf'`:

```python
import numpy as np
from sklearn.svm import SVC
import matplotlib.pyplot as plt
from itools import plot_decision_regions

np.random.seed(0)
X_xor = np.random.randn(200, 2)
y_xor = np.logical_xor(X_xor[:, 0] > 0, X_xor[:, 1] > 0)
y_xor = np.where(y_xor, 1, -1)

svm = SVC(kernel='rbf', random_state=0, gamma=0.10, C=10.0)
svm.fit(X_xor, y_xor)

plot_decision_regions(X_xor, y_xor, classifier=svm)
plt.legend(loc='upper left')
plt.savefig('../images/fig_06.png')
plt.show()
```

正如结果图像所示，核 SVM 相对较好地完成了对”异或“数据的划分。


在这里我们将参数 $\gamma=0.1$，这可以理解为高斯球面的**截止参数**(cut-off parameter)。如果我们减少 $\gamma$ 的值，将会增加受影响的训练样本的范围，这将导致决策边界更加宽松。为了对 $\gamma$ 有个更好的直观认识，我们将基于 RBF 核的 SVM 应用于鸢尾花数据集。

```python
import numpy as np
import matplotlib.pyplot as plt
from sklearn import datasets
from sklearn.svm import SVC
from sklearn.preprocessing import StandardScaler
from sklearn.cross_validation import train_test_split
from sklearn.linear_model import Perceptron
from sklearn.metrics import accuracy_score
from itools import plot_decision_regions

iris = datasets.load_iris()
X = iris.data[:, [2,3]]
y = iris.target

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0)

sc = StandardScaler()
sc.fit(X_train)
X_train_std = sc.transform(X_train)
X_test_std = sc.transform(X_test)

X_combined_std = np.vstack((X_train_std, X_test_std))
y_combined = np.hstack((y_train, y_test))

svm = SVC(kernel='rbf', random_state=0, gamma=0.2, C=1.0)
svm.fit(X_train_std, y_train)

plot_decision_regions(X_combined_std, y_combined, classifier=svm, test_idx=range(105,150))
plt.xlabel('petal length [standardized]')
plt.ylabel('petal width [standardized]')
plt.legend(loc='upper left')
plt.savefig('../images/fig_07.png')
plt.show()
```

由于我们选择了一个较小的 $\gamma$ 的值，因此基于 RBF 核的 SVM 模型的决策边界就相对宽松，如下图所示:


现在增加 $\gamma$ 的值，并观察它对决策边界的影响:

```python
import numpy as np
import matplotlib.pyplot as plt
from sklearn import datasets
from sklearn.svm import SVC
from sklearn.preprocessing import StandardScaler
from sklearn.cross_validation import train_test_split
from sklearn.linear_model import Perceptron
from sklearn.metrics import accuracy_score
from itools import plot_decision_regions

iris = datasets.load_iris()
X = iris.data[:, [2,3]]
y = iris.target

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0)

sc = StandardScaler()
sc.fit(X_train)
X_train_std = sc.transform(X_train)
X_test_std = sc.transform(X_test)

X_combined_std = np.vstack((X_train_std, X_test_std))
y_combined = np.hstack((y_train, y_test))

svm = SVC(kernel='rbf', random_state=0, gamma=100.0, C=1.0)
svm.fit(X_train_std, y_train)

plot_decision_regions(X_combined_std, y_combined, classifier=svm, test_idx=range(105,150))
plt.xlabel('petal length [standardized]')
plt.ylabel('petal width [standardized]')
plt.legend(loc='upper left')
plt.savefig('../images/fig_08.png')
plt.show()
```

通过结果图像可以看到，使用一个相对较大的 $\gamma$ 的值，使得类别 0 和 1的决策边界紧凑了许多。


虽然模型对训练数据的拟合非常好，但是类似地分类器对未知数据会有一个较高的泛化误差，这说明对 $\gamma$ 的调优在控制过拟合方面也起到了重要作用。

## 6. 决策树

决策树吸引人的地方在于其模型的可解释性。正如其名称“决策树”所意味着那样，我们可以把此模型看作将数据自顶向下进行划分，然后通过回答一些列问题来做出决策的方法。

以下雨为例，我们使用决策树来决定某一天的活动:


基于训练数据集的特征，决策树模型通过一系列的问题来推断样本的类标。虽然上述的示例在类别变量的基础上给出了决策树的概念，但这些概念在面对特征变量也同样适用。此模型也适用于数据特征值为实数的鸢尾花数据集。例如，我们可以简单为萼片宽度设定一个临界值，并提出一个二元问题: “萼片宽度是否达到2.8厘米?”

使用决策树算法，我们从树根开始，基于可获得的最大信息熵(information gain, IG) 的特征来对数据进行划分，我们将在下一节详细介绍信息增益的概念。通过迭代处理，在每个子节点上重复此类别划分过程，直到叶子节点。这意味着在每一个节点处，所有的样本都属于同一类别。在实际应用中，这可能会导致生成一颗深度很大且拥有众多节点的树，这样容易产生过拟合问题，由此，我们一般通过对树进行 “剪枝” 来限定树的最大深度。

## 3.6.1 最大化信息增益——获知尽可能准确的结果

为了子可获得最大信息增益的特征处进行节点划分，需要定义一个可通过树学习算法进行优化的目标函数。在此，目标函数能够在每次划分时实现对信息增益的最大化，其定义如下:

$$
IG(D_p, f) = I(D_p) - \sum)_{j=1}^m \frac {N_j}{N_p} I(D_p)
$$
其中，$f$ 为将要进行划分的特征，$D_p$ 与 $D_j$ 分别为父节点个第 $j$ 个子节点，$I$ 为不纯度衡量标准，$N_p$ 为父节点中样本的数量，$N_j$ 为第 $j$ 个子节点样本的数量。可见，信息增益只不过是父节点的不纯度与所有子节点不纯度与不纯度总和之差——子节点的不纯度越低，信息增益越大。然而，出于简化和缩小组合搜索空间的考虑，大多数(包括 scikit-learn) 库中实现的都是二叉决策树。这意味着每个父节点被划分为两个子节点: $D_{left}$ 和 $D_right$。

$$
IG(D_p, a) = I(D_p) - \frac {N_{left}}{N_p}I(D_{left}) - \frac {N_{right}}{N_p}I(D_{right})
$$
就目前来说，二叉决策树中常用的三个不纯度衡量标准或划分标准分别是: **基尼系数**(Gini index, $I_a$)、熵(entropy, $I_H$) 以及**误差分类率**(classifier error, $I_E$)。我们从非空类别($p(i|t) \neq 0$) 熵的定义开始讲解:

$$
I_H(t) = -\sum_{i=1}^c p(i|t) \log_2 p(i|t)
$$
其中，$p(i|t)$ 为特定节点 $t$ 中，属于类别 $c$ 的样本占特定节点 $t$ 中样本总数的比例。如果某一节点所有的样本都属于同一类别，则其熵为 0，当样本以相同的比例分属于不同的类时，熵的值最大。例如，对二类别分类来说，当 $p(i=1|t) = 0.5$ 且 $p(i=1|t)=0.5$ 时，熵为1。因此，我们可以说在决策树中熵的准则就是使得互信息最大化。

直观地说，基尼系数可以理解为降低误分类可能性的标准:

$$
I_o(t) = \sum_{i=1}^c p(i|t) (- p(i|t)) = 1 - \sum_{i=1}^c p(i|t)^2
$$
与熵类似，当所有类别是等比例分布时，基尼系数的值最大，例如在二类别分类中($c=2$):

$$
1 - \sum_{i=1}^c 0.5^2 = 0.5
$$
然而，在实践中，基尼系数与熵通常会生成非常类似地结果，并不值得话费大量实践使用不纯度标准评估树的好坏，而通常尝试使用不同的剪枝算法。

另一种不纯度衡量标准是误分类率:

$$
I_E = 1 - max\{ p(i|t)\}
$$
这是一个对于剪枝得方法很有用的准则，但是不建议用于决策树的构建过程，因为它对节点中各类别样本数量的变动不敏感。我们通过下图中两种可能的划分情况对此进行解释:

$$\color {blue}{插图 P49-1}$$

以数据集 $D_p$ 为例(在父节点 $D_p$)，它包含属于类别1的40个样本和属于类别2的40个样本，我们将它们分别划分到 $D_{left}$ 和 $D_{right}$。在 A 和 B 两种划分情况下，使用误分类率得到的信息增益都是相同的($IG_E=0.25$):

$$
\begin{aligned}
I_E(D_p) = 1 - 0.5 = 0.5 \\
A:I_E(D_{left}) = 1 - \frac {3}{4} = 0.25 \\
A:I_E(D_{right}) = 1 - \frac {3}{4} = 0.25 \\
A:IG_E = 0.5 - \frac {4}{8} 0.25 - \frac {4}{8} 0.25= 0.25 \\
B:I_E(D_{left}) = 1 - \frac {4}{6} = \frac {1}{3} \\
B:I_E(D_{right}) = 1 - 1 =0 \\
B:IG_E = 0.5 - \frac {6}{8} \times \frac {1}{3} = 0.25
\end{aligned}
$$

然而，在使用基尼系数时，与划分 $A$ ($IG_G=0.125$)相比，更倾向于使用 $B$ ($IG_G=0.16$) 的划分，因为这样子节点处的类别纯度相对更高:

$$
\begin{aligned}
I_G(D_p) = 1 - (0.5^2+0.5^2) = 0.5 \\
A:I_G(D_{left}) = 1 - \left ( (\frac {3}{4})^2 + (\frac {1}{4})^2 \right ) = \frac {3}{8} = 0.375 \\
A:I_G(D_{right}) = 1 - \left ( (\frac {1}{4})^2 + (\frac {3}{4})^2 \right ) = \frac {3}{8} = 0.375 \\
A:I_G = 0.5 - \frac {4}{8} 0.375 - \frac {4}{8} 0.375= 0.125 \\
B:I_G(D_{left}) =  1 - \left ( (\frac {2}{6})^2 + (\frac {4}{6})^2 \right ) = \frac {4}{9} = 0.4 \\
B:I_G(D_{right}) = 1 - (1^2 + 0^2) =0 \\
B:IG_G = 0.5 - \frac {6}{8} 0.\overline4 - 0 = 0.1\overline {\overline {6}}
\end{aligned}
$$

同样，以熵为评估标准时，也是 B($IG_G=0.31$) 的信息增益大于 A($IG_G=0.19$):

$$
\begin{aligned}
I_H(D_p) = -(0.5 \log_2(0.5) + 0.5 \log_2(0.5)) = 1 \\
A:I_H(D_{left}) = - \left ( \frac {3}{4} \log_2(\frac {3}{4}) + \frac {1}{4} \log_2(\frac {1}{4}) \right ) = 0.81 \\
A:I_H(D_{right}) = - \left( \frac{1}{4} \log_2(\frac{1}{4}) + \frac{3}{4} \log_2(\frac{3}{4}) \right) = 0.81 \\
A:IG_H = 1 - \frac{4}{8} \times 0.81 - \frac{4}{8} \times 0.81 = 0.19 \\
B:I_H(D_{left}) = - \left( \frac{2}{6} \log_2(\frac{2}{6}) + \frac{4}{6} \log_2(\frac{4}{6}) \right) = 0.92 \\
B:I_H(D_{right}) = 0 \\
B:IG_H = 1 - \frac{6}{8} \times 0.92 - 0 = 0.31
\end{aligned}
$$

为了更直观地比较前面提到的三种不同的不纯度衡量标准，我们绘制出样本属于类别概率介于 [0,1] 情况下不纯度的图像。注意，我们在图像中对熵(entropt/2) 做了缩放，以便直接观察熵和误分类率对基尼系数的影响。代码如下:

```python
import matplotlib.pyplot as plt
import numpy as np

def gini(p):
	return p * (1 - p) + (1 - p) * (1 - (1 - p))

def entropy(p):
	return -p * np.log2(p) - (1 - p) * np.log2(1 - p)

def error(p):
	return 1 - np.max([p, 1-p])

x = np.arange(0.0, 1.0, 0.01)
ent = [entropy(p) if p != 0 else None for p in x]
sc_ent = [e*0.5 if e else None for e in ent]
err = [error(i) for i in x]
fig = plt.figure()
ax = plt.subplot(111)
for i, lab, ls, c, in zip(
  		[ent, sc_ent, gini(x), err],
		['Entropy', 'Entropy (scaled)', 'Gini Impurity', 'Misclassification Error'],
		['-', '-', '--', '-.'],
		['black', 'lightgray', 'red', 'green', 'cyan']):
	line = ax.plot(x, i, label=lab, linestyle=ls, lw=2, color=c)

ax.legend(loc='upper center', bbox_to_anchor=(0.5, 1.15), ncol=3, fancybox=True, shadow=False)
ax.axhline(y=0.5, linewidth=1, color='k', linestyle='--')
ax.axhline(y=1.0, linewidth=1, color='k', linestyle='--')
plt.ylim([0, 1.1])
plt.xlabel('p(i=1)')
plt.ylabel('Impurity Index')
plt.show()
```

执行上述代码后可得到如下图像:


## 3.6.2 构建决策树

决策树可以通过将特征空间进行矩形划分的方式来构建复杂的决策边界。然而，必须注意: 深度越大的决策树，鞠策边界也就越复杂，因为很容易产生过拟合现象。借助于 scikit-learn，我们将可以以熵作为不纯度度量标准，构建一棵深度为3的决策树。虽然特征缩放是出于可视化的目的，但在决策树算法中，这不是必须的。代码如下:

```python
from sklearn.tree import DecisionTreeClassifier
import numpy as np
import matplotlib.pyplot as plt
from sklearn import datasets
from sklearn.svm import SVC
from sklearn.preprocessing import StandardScaler
from sklearn.cross_validation import train_test_split
from sklearn.linear_model import Perceptron
from sklearn.metrics import accuracy_score
from itools import plot_decision_regions

iris = datasets.load_iris()
X = iris.data[:, [2,3]]
y = iris.target

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0)

tree = DecisionTreeClassifier(criterion='entropy', max_depth=3, random_state=0)

tree.fit(X_train, y_train)

X_combined_std = np.vstack((X_train, X_test))
y_combined = np.hstack((y_train, y_test))

plot_decision_regions(X_combined_std, y_combined, classifier=tree, test_idx=range(105,150))
plt.xlabel('petal length [standardized]')
plt.ylabel('petal width [standardized]')
plt.legend(loc='upper left')
plt.savefig('../images/fig_10.png')
plt.show()
```

执行上述代码，我们得到了决策树中与坐标轴平行的典型决策边界:



scikit-learn 一个吸引人的功能就是，它允许将训练后得到的决策树导出为 .dot 格式的文件，这使得我们可以使用 GraphViz 程序进行可视化处理。GraphViz 支持 Linux、Windows 和 MacOS X 系统，可在 http://www.graphviz.org 免费下载。

```python
import numpy as np
import matplotlib.pyplot as plt
from sklearn import datasets
from sklearn.tree import DecisionTreeClassifier
from sklearn.cross_validation import train_test_split
from sklearn.tree import export_graphviz

iris = datasets.load_iris()
X = iris.data[:, [2,3]]
y = iris.target

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0)

tree = DecisionTreeClassifier(criterion='entropy', max_depth=3, random_state=0)

tree.fit(X_train, y_train)

export_graphviz(tree, out_file='tree.dot', feature_names=['petal length', 'petal width'])
```

在电脑上安装好 GraphViz 后，通过命令行窗口在保存 tree.dot 文件的路径处执行下面的命令，可将 tree.dot 文件转换为 PNG 文件。

```bash
dot -Tpng tree.dot -o ../images/tree.png
```


通过观察 GraphViz 创建的图像，可以很好地回溯决策树在训练数据集上对各节点进行划分的过程。最初，决策树根节点包含 105 个样本，以花瓣宽度 $\leq 0.75$ 厘米为界限，将其划分为分别包含 34 和 74 个样本的两个子节点。第一次划分后，可以看到: 左子树上的样本均来自 Iris-Setosa (熵=0)，已经无需再划分。在右子树上进一步划分，直到将 Iris-Vensicolor 和 Iris-Virginica 两类分开。

## 3.6.3 通过随机森林将弱分类器集成为强分类器

由于具备好的分类能力、可扩展性、易用性等特点，**随机森林**(random forest) 过去十年间在机器学习应用领域获得了广泛的关注。直观上，随机森林可以视为多棵决策树的集成。集成学习的基本理念就是将弱分类器即成为鲁棒性更强的模型，即一个能力更强的分类器，集成后具备更好的泛化误差，不易产生过拟合现象。随机森林算法可以概括为四个简单的步骤:

1. 使用 bootsrap 抽样方法随机选择 $n$ 个样本用于训练(从训练集中随机可重复地选择 $n$ 个样本)。
2. 使用第1步选定的样本构造一颗决策树。节点划分规则如下:
  - 不重复地随机选择 $d$ 个特征
  - 根据目标函数的要求，如最大化信息增益，使用选定的特征对节点进行划分。
3. 重复上述过程 1~2000 次。
4. 汇总每棵决策树的类标进行**多数投票**(majority vote)。多数投票将在第7章中详细介绍。

此处，步骤2对单棵决策树的训练做了少许修改: 在对节点进行最优划分的判定时，并未使用所有的特征，而只是随机选择了一个子集。

虽然随机森林没有决策树那样良好的解释性，但其显著的优势在于不必担心超参值得选择。我们通常不需要对随机森林进行剪枝，因为相对于单棵决策树来说，集成模型对噪声的鲁棒性更好。在实践中，我们真正需要关心的参数是为构建随机森林所需的决策树数量(步骤3)。通常情况下，决策树的数量越多，但是随机森林整体的分类表现就越好，但这同时也相应地增加了计算成本。

尽管在实践中不常见，但是随机森林可优化的其他超参分别是: bootstrap 抽样的数量(步骤2的(1)) 以及在节点划分中使用的特征数量(步骤2中的(2))，它们所采用的技术将在第5章中讨论，通过选择 bootstrap 抽样中样本的数量 $n$，我们可以控制随机森林的偏差与方差权衡的问题。如果 $n$ 的值较大，就降低了随机性，由此更可能导致随机森林的过拟合。反之，我们可以基于模型的性能，通过选择较小的 $n$ 值来降低过拟合。包括 scikit-learn 中的 RandomForestClassifier 在内的大多数对随机森林的实现中，bootstrap 抽样的数量一般与原始训练集中的样本数量相同，因为这样在折中偏差与方差方面一般会有一个好的均衡结果。而对于在每次节点划分中用到的特征数量 $m$，我们选择一个比训练集中特征总量小的值。在 scikit-learn 及其他程序实现中常用的默认值一般是 $d=\sqrt{m}$，其中 $m$ 是训练集中特征总量小的值。

为了方便起见，我们不是自己从决策树开始构造随机森林，而是使用 scikit-learn 中已有的实现来完成:

```python
import numpy as np
import matplotlib.pyplot as plt
from sklearn import datasets
from sklearn.cross_validation import train_test_split
from sklearn.ensemble import RandomForestClassifier 
from itools import plot_decision_regions

iris = datasets.load_iris()
X = iris.data[:, [2,3]]
y = iris.target

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0)


X_combined = np.vstack((X_train, X_test))
y_combined = np.hstack((y_train, y_test))

forest = RandomForestClassifier(criterion='entropy', n_estimators=10, random_state=1, n_jobs=2)
forest.fit(X_train, y_train)

plot_decision_regions(X_combined, y_combined, classifier=forest,
                      test_idx=range(105,150))
plt.xlabel('petal length [standardized]')
plt.ylabel('petal width [standardized]')
plt.legend(loc='upper left')
plt.savefig('../images/fig_11.png')
plt.show()
```

执行上述代码后，通过随机森林中决策树的组合形成的决策区域如下图所示:



在上述代码中，我们节点划分中以熵为不纯度衡量标准，且通过参数 `n_estimators` 使用了 10 棵决策树进行随机森林的训练。虽然我们只是在一个很小的训练数据集上构建了一个非常小的随机森林，但是出于演示的要求，我们使用 n_jobs 参数来设定训练过程中所需的处理器内核的数量(在此使用了 CPU 的两个内核)。

## 7. 惰性学习算法:k-近邻算法

本章将要讨论的最后一个监督学习算法是**k-近邻算法**(k-nearest neighbor classifier, KNN)，此算法非常有趣，因为它区别于目前已经介绍过的所有学习算法。

KNN 是惰性徐诶算法的典型例子。说它具有惰性不是因为它看起来简单，而是因为它仅仅对训练数据集有记忆功能，而不会从训练集中通过学习得到一个判别函数

> $\color {red}{参数模型与非参数模型}$
> 机器学习算法可以划分为参数化模型和非参数化模型。当使用参数化模型时，需要我们通过训练数据估计参数，并通过学习得到一个模式，以便在无需原始训练数据信息的情况下对新的数据点进行分类操作。典型的参数化模型包括: 感知器、逻辑斯蒂回归和线性支持向量机等。与之相反，非参数化模型无法通过一组固定的参数来进行表征，而参数的数量也会随着训练数据的增加而递增。我们已经学习了两个非参数化模型: 决策树(包括随机森林) 和核 SVM。
> KNN 属于非参数化模型的一个子类，它可以被描述为基于实例的学习(instance-based learning)。此类模型的特点是会对训练数据进行记忆；而惰性学习(lazy learning) 则是基于实例学习的一个特例，它在学习阶段的计算成本为0。

KNN 算法本身是很简单的，可以归纳为以下几步:

1. 选择近邻的数量 $k$ 和距离度量方法
2. 找到待分类样本的 $k$ 个最近邻。
3. 根据最近邻的类标进行多数投票。

下图说明了新的数据点(问号所在位置) 如何根据最近的5个邻居进行多数投票而被标记上三角形类标:


基于选定的距离度量标准，KNN 算法从训练数据集中[^注2]找到与待预测目标点的 $k$ 个距离最近的样本(最相似)。目标点的类标基于这 $k$ 个最近邻的邻居的类标使用多数投票。

这种基于记忆的学习算法的有点在于: 分类器可以快速地适应新的数据。不过其缺点也是显而易见的: 在最坏的请款下，计算复杂度随着样本数量的增多而呈现线性增长，除非数据集中的样本维度(特征数量)有限，而且使用了高效的数据结构(如 KD 树等)。具体请参照 J.H.Friedman、J.L.Bentley 在 R.A.Finkel 发表在 ACM Transactions on Mathematical Software(TOMS) 3(3):209-226,1977 的论文 ”An algorithm for finding best matches in logarithmic expected time”。此外，我们还不能忽视训练样本，因为此模型没有训练的步骤。由此一来，如果使用了大型数据集，对于存储空间来说也是一个挑战。

使用以下代码，以欧几里得距离作为度量标准，使用 scikit-learn 实现了一个 KNN 模型。

```python
import numpy as np
import matplotlib.pyplot as plt
from sklearn import datasets
from sklearn.cross_validation import train_test_split
from sklearn.neighbors import  KNeighborsClassifier
from itools import plot_decision_regions

iris = datasets.load_iris()
X = iris.data[:, [2,3]]
y = iris.target

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0)


X_combined = np.vstack((X_train, X_test))
y_combined = np.hstack((y_train, y_test))

knn = KNeighborsClassifier(n_neighbors=5, p=2, metric='minkowski')
knn.fit(X_train, y_train)

plot_decision_regions(X_combined, y_combined, classifier=knn, test_idx=range(105,150))
plt.xlabel('petal length [standardized]')
plt.ylabel('petal width [standardized]')
plt.legend(loc='upper left')
plt.savefig('../images/fig_12.png')
plt.show()
```

将此数据集上的 KNN 模型的最近邻数量设定为 5 个，我们得到了相对平滑的决策边界，如下图所示:


> 通常情况下，scikit-learn 中实现的 KNN 算法对类标的判定倾向于与样本距离最近邻居的类标。如果几个邻居的距离相同，则判定为训练数据集中位置靠前的那个样本的类标。

就 KNN 来说，找到正确的 $k$ 值是在过拟合与欠拟合之间找到平衡的关键所在。我们还必须保证所选的距离度量标准适用于数据集中的特征。相对简单的欧几里得距离度量标准常用于特征值为实数的样本，如鸢尾花数据集中的花朵，其特征值是以厘米为单位的实数。注意，当我们使用欧几里得距离时，对数据进行标准化处理，保持各属性度量的尺度统一也是非常重要的。在代码中用到的 “闵可夫斯基”(minkowski) 距离是对欧几里得距离及曼哈顿距离的一种泛化，可写作:

$$
d(x^{(i)}, x{(j)}) = \sqrt [p]{\sum_k |x_k^{(i)} x_k^{(j)}|^p}
$$
如果将参数设定为 $p=2$，则为欧几里得距离；当 $p=1$ 时，就是曼哈顿距离。scikit-learn 中还实现了许多其他的距离度量标准，具体内容可见如下网址: http://scikit-learn.org/stable/modules/generated/sklearn.neighbors.DistanceMetric.html 。

!!! note "维度灾难"
    
    由于维度灾难(curse of dimensionality) 的原因，使得 KNN 算法易于过拟合。维度灾难是指这样一种现象: 对于一个样本数量大小稳定的训练数据集，随着其特征数量的增加，样本中有具体值的特征数量变得极其稀疏(大多数特征的取值为空)。直观地说，可以认为即使是最近的邻居，它们在高维空间中的实际距离也是非常远的，因此难以给出一个合适的类标判定。
    
    在逻辑斯蒂回归一节中，我们讨论了通过正则化使其避免过拟合。不过，正则化方法并不适用于诸如决策树和 KNN 等算法，但可以使用特征选择和降维等技术来帮助其避免维度灾难。具体内容将在下一章节中探讨。

## 8. 本章小结

在本章中，我们学到了许多不同的机器学习算法，可以用于处理线性或者非线性问题。如果关注算法的可解释性，那么决策树是一种特别具有吸引力的算法。逻辑斯蒂回归不仅是可以通过梯度下降进行优化的一种有用的在线学习方法，而且可以给出待预测问题可能发生的概率。虽然支持向量机是一种强大的线性模型，而且可以通过核技巧扩展到非线性问题，但是为了达到好的预测效果，它需要调整众多的参数。而集成方法(如速记森林)不需要调整众多的参数且不像决策树那样容易产生过拟合现象，因此在解决实际问题中成为常用的一个模型。作为惰性学习算法，k-近邻算法使得我们在分类领域可以尝试另外一种方式，它不是通过训练模型来进行预测，而更多的是通过计算来完成。

但是，比选择合适的学习算法更重要的是: 训练数据集中有什么样的可用数据。任何算法都无法使用缺乏翔实、无歧义的特征而获得好的预测效果。

在下一章，我们将讨论数据预处理、特征选择，以及降维等相关的重要内容，这些都是构建优秀的机器学习模型所必需的。在后续的第6章中，我们将学到如何评估及比较模型的性能，并学习一些有用的、微调不同算法的技巧。

[^注1]: 某一事件发生与不发生的概率的比值。
[^注2]: 此处不应叫训练数据集，与协同过滤类似，就是数据集。