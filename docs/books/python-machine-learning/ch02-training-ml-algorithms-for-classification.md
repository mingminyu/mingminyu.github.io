# 第2章：机器学习分类算法

> GitHub Notebook 地址: https://nbviewer.jupyter.org/github/rasbt/python-machine-learning-book/blob/master/code/ch02/ch02.ipynb

本章将介绍最早以算法方式描述的分类机器学习算法: **感知器**(perceptron) 和 **自适应线性神经元**(adaptive linear neuron)。我们将使用 Python 循序渐进地实现一个感知器，并且通过训练使其具备对鸢尾花数据集中数据进行分类的能力。这将帮助我们理解机器学习算法中分类的概念，以及如何使用 Python 高效地实现分类算法。通过对自适应线性神经元优化基础的讨论，将会对我们在第3章中使用 scikit-learn 机器学习库开发更加高效的分类器奠定基础。

本章将涵盖如下内容:

- 培养对机器学习算法的直观内容
- 使用 Pandas、Numpy 和 Matplotlib 读取、处理和可视化数据
- 使用 Python 实现线性分类算法

## 1.人造神经元——早期机器学习概览

在详细讨论感知器和相关算法之前，先大体了解一下早期机器学习的起源。为了理解大脑的工作原理以设计人工智能系统，沃伦.麦卡洛可(Warren McCullock) 与沃尔特.皮茨(Walter Pitts) 在1943年提出了第一个脑神经元的抽象模型，也称作麦卡洛可-皮茨神经元(McCullock-Pitts neuron, MCP)[^注1]，神经元是大脑中相互连接的神经细胞，它可以处理和传递化学和电信号，如下图所示:

![](https://mingminyu.github.io/webassets/images/20251208/10.png)

麦卡洛可和皮茨将神经细胞描述为一个具有二进制输出的逻辑门。树突接收多个输入信号，如果累加的信号超过某一阈值，经细胞体的整合就会生成一个输出信号，并通过轴突进行传递。

几年后，弗兰克.罗森布拉特(Frank Rossenblatt) 基于 MCP 神经元模型提出了第一个感知器法则[^注2]。在此感知器规则中，罗森布拉特提出一个自学习算法，此算法可以自动通过优化得到权重系数，此系数与输入值的乘积决定了神经元是否被激活。在监督学习与分类中，类似算法可用于预测样本所属的类别。

更严谨地讲，我们把这个问题看做一个二值分类的任务，为了简单起见，我们把两类分别记为 1(正类别) 和 -1(负类别)。我们可以定义一个 **激励函数**(activation function) $\phi (z)$，它以特定的输入值 $x$ 与相应的权值向量 $w$ 的线性组合作为输入，其中 $z$ 也称作净输入($z=w_1x_1 + \dots + w_mx_m$)

$$
w = \begin{bmatrix}
w_1 \\
\vdots \\
w_m
\end{bmatrix},
x = \begin{bmatrix}
x_1 \\
\vdots \\
x_m
\end{bmatrix}
$$

此时，对于一个特定样本 $x^{(i)}$ 的激励，也就是 $\phi (z)$ 的输出，如果其值大于预设的阈值 $\theta$，我们将其划分到 1 类，否则为 -1 类。在感知器算法中，激励函数 $\phi (\cdot)$ 是一个简单的分段函数。

$$
\phi(z) = \begin{cases}
1 & 若 z \geq \theta \\
-1 & 其他
\end{cases}
$$

为了简单起见，我们可以把阈值 $\theta$ 移到等式的左边，并增加一个初始项权重记为 $w_0 = -\theta$ 且设 $x_0 = 1$，这样我们就可以把 $z$ 写成一个更加紧凑的形式: $z = w_0x_0 + w_1x_1 + \dots + w_mx_m = w^Tx$，$\phi(z) = \begin{cases} 1 & 若 z \geq 0 \\\ -1 & 其他 \end{cases}$


!!! note "注意"

		在下面的小节中，借用了线性代数的部分符号。例如，使用向量点积(vector dot product) 来表示 $x$ 和 $w$ 乘积的和，而上标 $T$ 则 表示转置，它使得行向量和列向量之间能够相互转换:

$$
z = w_0x_0 + w_1x_1 + \dots + w_mx_m = \sum_{j=0}^m w_jx_j = w^Tx
$$

例如，$\begin{bmatrix} 1 & 2 & 3 \end{bmatrix} \times \begin{bmatrix} 4 \\\ 5 \\\ 6 \end{bmatrix} = 1 \times 4 + 2 \times 5 + 3 \times 6 = 32$

在本书中，我们仅使用了线性代数中最基本的符号。不过，如果读者想要快速复习一下相关内容，请参考 Zico Kolter 的线性代数可通过如下链接免费获取: http://www.cs.cmu.edu/~zkolter/course/linalg/linalg_notes.pdf 。

在本书中，左图说明了感知器模型的激励函数如何将输入 $z=w^Tx$ 转换到二值输出的(-1 或 1)，右图说明了感知器如何将两个可区分类别进行线性区分。

![](https://mingminyu.github.io/webassets/images/20251208/11.png)

MCP 神经元和罗森布拉特阈值感知器的理念就是，通过模拟的方式还原大脑中单个神经元的工作方式，它是否被被激活。这样，罗森布拉特感知器最初的规则非常简单，可总结为如下几步:

1. 将权值初始化为零或者一个极小的随机数。
2. 迭代所有训练样本 $x^{(i)}$，执行如下操作:
	(1) 计算输出值 $\widehat {y}$。
	(2) 更新权重值。

这里的输出值是指通过前面定义的单位阶跃函数预测得出的类标，而每次对权重向量中每一权重 $w$ 的更新方式为:

$$
w_j: = w_j + \Delta w_j
$$

对于用于更新权重 $w_j$ 的值 $\Delta w_j$，可通过感知器学习规则计算获得:

$$
\Delta w_j = \eta (y^{(i)} - \widehat {y}^{(i)})x_j^{(i)}
$$

其中，$\eta$ 为学习速率(一个介于 0.0 到 1.0 之间的常数)，$y^{(i)}$ 为第 $i$ 个样本的真实类标，$\widehat {y}^{(i)}$ 为预测得到的类标。需要特别注意，权重向量中的所有权重值都是同时更新的，这意味着在所有的权重 $\Delta w_j$ 更新前，我们无法重新计算 $\widehat {y}^{(i)}$。具体地，对于一个二维数据集，可通过下式进行更新:

$$
\Delta w_0 = \eta (y^{(i)} - output^{(i)}) \\
\Delta w_1 = \eta (y^{(i)} - output^{(i)})x_1^{(i)} \\
\Delta w_2 = \eta (y^{(i)} - output^{(i)})x_2^{(i)}
$$

在使用 Python 语言实现感知器之前，让我们通过一个简单的推导实验来体验一下这个学习规则的简洁之美。对于如下式所示的两种场景，若感知器对类标的预测正确，权重可不做更新:

$$
\Delta w_j = \eta (-1^{(i)} - (-1^{(i)}))x_j^{(i)} = 0 \\
\Delta w_j = \eta (1^{(i)} - 1^{(i)})x_j^{(i)} = 0
$$

但是，在类标错误的情况下，权重的值会分别趋向于正类别或者负类别的方向:

$$
\Delta w_j = \eta (1^{(i)} - (-1^{(i)}))x_j^{(i)} = \eta (2)x_j^{(i)} \\
\Delta w_j = \eta (-1^{(i)} - 1^{(i)})x_j^{(i)} = \eta (-2)x_j^{(i)}
$$

为了对乘法因子 $x_j^{(i)}$ 有个更直观的认识，我们看另一个简单的例子，其中：

$$
\widehat {y}_j^{(i)} = +1, y^{(i)} = -1, \eta = 1
$$

假定 $x_j^{(i)} = 0.5$，且模型将此样本错误地分到了 -1 类别内。在此情况下，我们应将相应的权值增1，以保证下次遇到此样本使得激励 $x_j^{(i)} = w_j^{(i)}$ 能将其更多地判定为正类别，这也相当于增大其值大于单位阶跃函数阈值的概率，以使得此样本被判定为 +1 类。

$$
\Delta w_j^{(i)} = (1^{(i)} - (-1^{(i)})) 0.5^{(i)} = (2) 0.5^{(i)} = 1
$$

权重的更新与 $x_j^{(i)}$ 的值成比例。例如，如果有另外一个样本 $x_j^{(i)} = 2$ 被错误分到了 -1 类别中，我们应更大幅度地移动决策边界，以保证下次遇到此样本时能正确分类。

$$
\Delta w_j = (1^{(i)} - (-1^{(i)})) 2^{(i)} = (2) 2^{(i)} = 4
$$

需要注意的是，感知器收敛的前提是两个类别必须是线性可分的，且学习速率足够小。如果两个类别无法通过一个线性决策边界进行划分，可以为模型在训练数据集上的学习迭代次数设置一个最大值，或者设置一个允许错误分类样本数量的阈值——否则，感知器训练算法将永远不停地更新权值。

![](https://mingminyu.github.io/webassets/images/20251208/12.png)

在学习下一小节中感知器的实现方法之前，我们先通过一个简单的示例图片总结一下刚刚学到的感知器的基本概念:

![](https://mingminyu.github.io/webassets/images/20251208/13.png)

上图说明了感知器如何接收样本 $x$ 的输入，并将其与权值 $w$ 进行加权以计算净输入(net input)。进而净输入被传递到激励函数(在此为单位阶跃函数)，然后生成值为 +1 或者 -1 的二值输出，并以其作为样本的预测类标。在学习阶段，此输出用来计算预测的误差并更新权重。

## 2. 使用 Python 实现感知器学习算法

在上一节中，我们已经学习了罗森布拉特感知器的工作方式，现在使用 Python 来实现它，并且将其应用于第1章中提到的鸢尾花数据集中。通过使用面向对象编程的方式在一个 Python 类中定义感知器的接口，使得我们可以初始化新的感知器对象，并使用类中定义的 `fit` 方法从数据中进行学习，使用 `predict `方法进行预测。按照 Python 开发的惯例，对于那些并非在初始化对象时创建，但是又被对象中其他方法调用的属性，可以在后面添加一个下划线，例如: `self.w_`。

若读者不熟悉 Python 的科学计算库，或者想对其有更深入的了解，请参见如下资料:

- Numpy : http://wiki.scipy.org/Tentative_NumPy_Tutorial
- pandas : http://pandas.pydata.org/pandas-docs/stable/tutorials.html
- matplotlib: http://matplotlib.org/users/beginner.html

此外，为了更好地学习书中的代码，建议读者通过 Packt 的网站下载与本书相关的 IPython notebook 文件。关于 IPython notebook 的使用介绍，请参见链接: https://ipython.org/ipython-doc/3/notebook/index.html

```python linenums="1"
import numpy as np

class Perceptron(object):
	"""Perceptron classifier:

	Parameters
	-----------
	eta : float
		Learning rate (between 0.0 and 3.0)
	n_iter : int
		Passes over the training dataset.

	Attributes
	-----------
	w_ : 1d-array
		Weights after fitting.
	errors_ : list
		Number of misclassifications in every ecoph.
	"""

	def __init__(self, eta=0.01, n_iter=10):
		self.eta = eta
		self.n_iter = n_iter

	def net_input(self, X):
		"""Calculate net input"""
		return np.dot(X, self.w_[1:]) + self.w_[0]

	def predict(self, X):
		"""Return class label after uint step."""
		return np.where(self.net_input(X) >= 0.0, 1, -1)

	def fit(self, X, y):
		"""Fit training data.

		Parameters
		-----------
		X : {array-like}, shape = [n_samples, n_features]
			Training vectors, where n_samples is the number of samples and 
			n_features is the number of features.
		y : array-like, shape = [n_shape]
			Target values.

		Returns
		-------
		self : object
		"""

		self.w_ = np.zeros(1 + X.shape[1])
		self.errors_ = []

		for _ in range(self.n_iter):
			errors = 0
			for xi, target in zip(X, y):
				update = self.eta * (target - self.predict(xi))
				self.w_[1:] += update * xi
				self.w_[0] += update
				errors += int(update != 0.0)
			self.errors_.append(errors)
		return self
```

在感知器实现过程中，我们实例化一个 Perceptron 对象时，给出了一个学习速率 `eta` 和在训练数据集上进行迭代的次数 `n_iter`。通过 `fit` 方法，我们将 `self.w_` 中的权值初始化为一个零向量 $R^{m+1}$，其中 $m$ 是数据集中维度(特征)的数量，我们在此基础上增加了一个 0 权重列(也就是阈值)。

> 与 Python 的列表类似，Numpy 也使用方括号([]) 对一维数组进行索引。对二维数组来说，第1个索引值对应数组的行，第2个索引值对应数组的列。例如，X[2, 3] 表示二维数组 X 中第3行第4列所对应的元素。

初始化权重后，`fit` 方法循环迭代数据集中的所有样本，并根据前面章节讨论过的感知器学习规则来更新权重。我们使用 `predict` 方法计算类标，这个方法在 `fit` 方法中也被调用，用于计算权重更新时的类标，在完成模型训练后，`predict` 方法也用于预测未知数据的类标。此外，在每次迭代的过程中，我们收集每轮迭代中错误分类样本的数量，并将其存放于列表 `self.errors_` 中，以便后续对感知器在训练中表现的好坏做出判定。另外，在 `net_input` 方法中使用 `np.dot` 方法用于计算向量的点积 $w^Tx$。

> 除了使用 Numpy 的 `a.dot(b)` 或者 `np.dot(a,b)` 计算两个数组 a 和 b 的点积之外，还可以通过类似 `sum(i*j for i,j in zip(a,b))` 这样经典的 Python for 循环结构来计算。与使用 Python 的循环结构相比，Numpy 的优势在于其算术运算的向量化。**向量化** 意味着一个算术运算操作会自动应用到数组中的所有元素上。通过在指令序列中配置所需的算术运算，我们便可充分利用现代处理器单指令流多数据流(Single Instruction, Multiple Data, SIMD) 架构的支持快速完成运算，而不是循环地对每个元素逐一进行计算。此外，Numpy 还使用了高度优化的线性代数库，如使用 C 或者 Fortran 实现的基本线性代数子程序(Basic Linear Algebra Subprogram, BLAS)和线性代数包(Linear Algebra Package, LAPACK)。最后，Numpy 还允许我们使用基本的线性代数操作这类更加紧凑和直观方式编写代码，如向量和矩阵的点积。

### 2.1 基于鸢尾花数据集训练感知器模型

为了测试前面实现的感知器算法，我们从鸢尾花数据集中挑选了 **山鸢尾**(Setosa) 和 **变色鸢尾**(Versicolor) 两种花的信息作为测试数据。虽然感知器并不将数据样本特征的数量限定为两个，但出于可视化方面的原因，我们会考虑数据集中 **萼片长度**(sepal length) 和 **花瓣长度**(petal length)这两个特征。同时，选择山鸢尾和变色鸢尾也是出于实践需要的考虑。不过，感知器算法可以扩展到多类别的分类器应用中，比如通过 **一对多**(One vs. All) 技术。

!!! tip "一对多"
一对多(One vs. All, OvA)，有时也称为一对其他(One vs. Rest, OvR)，是一种将二值分类器扩充到多类别任务上的一种技术。我们可以使用 OvA 针对每个类别进行训练一个分类器，其中分类器所对应类别的样本为正类别，其他所有类别的样本为负类别。当应用于新数据样本识别时，我们可以借助于分类器 $\phi (z)$，其中 $m$ 为类标数量，并将相关最高的类标赋给待识别样本。对于感知器来说，就是最大净输入值绝对值对应的类标。

首先，我们使用 pandas 库直接从 UCI 机器学习库中将鸢尾花数据集转换为 DataFrame 对象并加载到内存中，并使用 `tail` 方法显示数据的最后 5 行以确保数据正确加载。

```python linenums="1"
import pandas as pd

df = pd.read_csv(r'https://archive.ics.uci.edu/ml/machine-learning-databases/iris/iris.data', header=None)
df.tail()
```

输出结果:

```python
       0    1    2    3               4
145  6.7  3.0  5.2  2.3  Iris-virginica
146  6.3  2.5  5.0  1.9  Iris-virginica
147  6.5  3.0  5.2  2.0  Iris-virginica
148  6.2  3.4  5.4  2.3  Iris-virginica
149  5.9  3.0  5.1  1.8  Iris-virginica
```

接下来，我们从中提取前100个类标，其中分别包含50个山鸢尾类标和50变色鸢尾类标，并将这些类标用两个整数值来替代: 1代表变色鸢尾，-1代表山鸢尾，同时把 pandas DataFrame 产生的对应的整数类标赋给 NumPy 的向量 y。类似地，我们提取这 100 个训练样本和第一个特征列(萼片长度)和第三个特征列(花瓣长度)，并赋值给属性矩阵 $X$，这样我们就可以用二维散点图对这些数据进行可视化了。

```python linenums="1"
import pandas as pd
import matplotlib.pyplot as plt
import numpy as np

df = pd.read_csv(r'https://archive.ics.uci.edu/ml/machine-learning-databases/iris/iris.data', header=None)

y = df.iloc[0:100, 4].values
y = np.where(y == 'Iris-setosa', -1, 1)
X = df.iloc[0:100, [0, 2]].values
plt.scatter(X[:50, 0], X[:50, 1], color='red', marker='o', label='setosa')
plt.scatter(X[50:100, 0], X[50:100, 1], color='blue', marker='x', label='versicolor')
plt.xlabel('petal length')
plt.ylabel('sepal length')
plt.legend(loc='upper left')
plt.show()
```

上述代码的执行结果如下图所示:

![](https://mingminyu.github.io/webassets/images/20251208/14.png)

现在，我们可以利用抽取出的鸢尾花数据子集来训练感知器了。同时，我们还会绘制每次迭代的错误分类数量的折线图，以检验算法是否收敛并找到可以分开两种类型鸢尾花的决策边界。

```python linenums="1"
import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
from Perceptron import Perceptron

df = pd.read_csv(r'https://archive.ics.uci.edu/ml/machine-learning-databases/iris/iris.data', header=None)

y = df.iloc[0:100, 4].values
y = np.where(y == 'Iris-setosa', -1, 1)
X = df.iloc[0:100, [0, 2]].values

ppn = Perceptron(eta=0.1, n_iter=10)
ppn.fit(X, y)
plt.plot(range(1, len(ppn.errors_) + 1), ppn.errors_, marker='o')
plt.xlabel('Epochs')
plt.ylabel('Number of misclassifications')
plt.show()
```

执行上述代码，我们可以看到每次迭代对应的错误分类数量，如下图所示:

![](https://mingminyu.github.io/webassets/images/20251208/15.png)

如上图所示，我们的分类器在第6次迭代后就已经收敛，并且具备对训练样本进行正确分类的能力。下面通过一个简单的函数来实现对二维数据集决策边界的可视化。

```python linenums="1"
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.colors import ListedColormap

def plot_decision_regions(X, y, classifier, resolution=0.02):

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

	# plot class samples
	for idx, cl in enumerate(np.unique(y)):
		plt.scatter(x=X[y == cl, 0], y=X[y == cl, 1], alpha=0.8,
			 		c=cmap(idx), marker=markers[idx], label=cl)
```

我们先通过 ListedColormap 方法定义一些颜色(color) 和标记符号(marker)，并通过颜色列表生成了颜色示例图。然后对两个特征的最大值、最小值做了限定，使用 NumPy 的 `meshgrid` 函数将最大值、最小值向量生成二维数组 xx1 和 xx2。由于使用了两个特征来训练感知器，因此需要将二维数组展开，创建一个与鸢尾花数据训练数据集中列数相同的矩阵，以预测多维数组中所对应点的类标 z。将 z 变换为与 xx1 和 xx2 相同的维度后，我们就可以使用 matplotlib 中的 `contourf` 函数，对于网格数组中每个数组预测的类以不同的颜色绘制出预测得到的区域。

```python linenums="1"
import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
from Perceptron import Perceptron
from itools import plot_decision_regions

df = pd.read_csv(r'https://archive.ics.uci.edu/ml/machine-learning-databases/iris/iris.data', header=None)

y = df.iloc[0:100, 4].values
y = np.where(y == 'Iris-setosa', -1, 1)
X = df.iloc[0:100, [0, 2]].values

ppn = Perceptron(eta=0.1, n_iter=10)
ppn.fit(X, y)

plot_decision_regions(X, y, classifier=ppn)
plt.xlabel('sepal length [cm]')
plt.ylabel('petal length [cm]')
plt.legend(loc='upper left')
plt.show()
```

执行上述代码，我们可以看到决策区域的图像，如下图所示:

![](https://mingminyu.github.io/webassets/images/20251208/16.png)

正如我们从图中看到的那样，通过感知器学习得到的分类曲面可以完美地对训练子集中所有样本进行分类。

> 虽然在上例中感知器可以完美地划分两个类别的花，但 **感知器所面临的最大问题是算法的收敛**。Frank Rosenblatt 从数学上证明了: 如果两个类别可以通过线性超平面进行划分，则感知器算法一定会收敛。但是，如果两个类别无法通过线性判定边界完全正确地划分，则权重会不断更新。为防止发生此类事件，通常事先设置权重更新的最大迭代次数。

## 3. 自适应线性神经元及其学习的收敛性

本节将介绍另一种类型的单层神经网络: 自适应线性神经网络(Adaptive Linear Neuroon, Adaline)。在 Frank Rosenblatt 提出感知器算法几年后，Bernard Widrow 和他的博士生 Tedd Hoff 提出了 Adaline 算法，这可以看作对之前算法的改进。Adaline 算法相当有趣，它阐述了代数函数的核心概念，并且对其做了最小化优化，这是理解逻辑斯特回归(Logistic regression)、支持向量机(support vector machine) 和后续章节涉及的回归模型等基于回归的高级机器学习分类算法的基础。

基于 Adaline 规则的权重更新是通过一个连续的线性激励函数来完成的，而不像 Rosenblatt 感知器那样使用单位阶跃函数，这是二者的主要区别。Adaline 算法中作用于净输入的激励函数 $\phi (z)$ 是简单的恒等函数，即 $\phi (w^Tx) = w^Tx$。

线性激励函数在更新权重的同时，我们使用 **量化器**(quantizer) 对类标进行预测，量化器与前面提到的单位阶跃函数类似，如下图所示:

![](https://mingminyu.github.io/webassets/images/20251208/17.png)

将上图与前文介绍的感知器算法的示意图进行比较，可以看出区别在于: 这里使用线性激励函数的连续型输出值，而不是二类别分类类标来计算模型的误差以及更新权重。

### 3.1 通过梯度下降最小化代价函数

机器学习中监督学习算法的一个核心组成在于: 在学习阶段定义一个待优化的 **目标函数**。这个目标函数通常是需要我们做最小化处理的 **代价函数**。在 Adaline 中，我们可以将代价函数 $J$ 定义为通过模型得到的输出与实际类标之间的 **误差平方和**(Sum of Squared Error, SSE):

$$
J(w) = \frac {1}{2} \sum_i (y^{(i)} - \phi (z^{(i)}))^2
$$

在此，系数 1/2 只是出于方便的考虑，它使我们更容易导出梯度，具体将在下一段落中介绍。与单位阶跃函数相比，这种连续型激励函数的主要优点在于: 其代价函数是可导的。此代价函数的另一个优点在于: 它是一个凸函数；这样，我们可以通过简单、高效的 **梯度下降** 优化算法来得到权重，且能保证在对鸢尾花数据集中样本进行分类时代价函数最小。

如下图所示，我们将梯度下降的原理形象地描述为下山，直到获得一个局部或者全局最小值。在每次迭代中，根据给定的学习速率和梯度的斜率，能够确定每次移动的步幅，我们按照步幅沿着梯度方向向前进一步。

![](https://mingminyu.github.io/webassets/images/20251208/18.png)

通过梯度下降，我们可以基于代价函数 $J(w)$ 沿梯度 $\nabla J(w)$ 方向做一次权重更新:

$$
w: = w + \Delta w
$$
在此，权重增量 $\Delta w$ 定义为负梯度[^注3] 与学习速率 $\eta$ 的乘积:

$$
\Delta w = - \eta \Delta J(w)
$$
为了计算代价函数的梯度，我们需要计算代价函数相对于每个权重 $w_j$ 的偏导 $\frac {\partial J}{\partial w_i} = - \sum_i (y^{(i)} - \phi (z^{(i)}))x_j^{(i)}$，这样我们就可以把对权重 $w_j$ 的更新写作 $\Delta w_j = - \eta \frac {\partial J}{\partial w_i} = \mu \sum_i (y^{(i)} - \phi (z^{(i)}))x_j^{(i)}$。由于所有权重被同时更新，Adaline 学习规则可记为: $w = w + \Delta w$。

> 对于熟悉代数的读者来说，误差平方和代价函数对应于第 $j$ 个权重的偏导，可通过下列步骤得到:

$$
\begin{aligned}
\frac {\partial J}{\partial w_j} = & \frac {\partial}{\partial w_j} \frac {1}{2} \sum_i (y^{(i)} - \phi (z^{(i)}))^2 \\
= & \frac {1}{2} \frac {\partial}{\partial w_j} \sum_i (y^{(i)} - \phi (z^{(i)}))^2 \\
= & \frac {1}{2} \sum_i 2(y^{(i)} - \phi (z^{(i)})) \frac {\partial}{\partial w_j} (y^{(i)} - \phi (z^{(i)})) \\
= & \sum_i (y^{(i)} - \phi (z^{(i)})) \frac {\partial}{\partial w_j} ((y^{(i)} - \sum_i (w_j^{(i)}x_j^{(i)}) \\
= & \sum_i (y^{(i)} - \phi (z^{(i)}))(-x_j^{(i)}) \\
= & - \sum_i (y^{(i)} - \phi (z^{(i)}))x_j^{(i)}
\end{aligned}
$$

虽然 Adaline 学习规则与感知器规则看起来类似，不过 $\phi (z^{(i)})$ 中的 $z^{(i)} = w^Tx^{(i)}$ 是实数，而不是整数类标。此外，权重的更新是基于训练集中所有样本完成的(而不是每次一个样本渐进更新权重)，这也是此方法被称作“批量”梯度下下降的原因。

### 3.2 使用 Python 实现自适应线性神经元

感知器规则与 Adaline 非常相似，我们将在前面实现的感知器代码的基础上修改 `fit` 方法，将其权重的更新改为通过梯度下降最小化代价函数来实现 Adaline 算法。

```python linenums="1"
class AdalineGD(object):
	"""ADAptive Linear Neuron classifier:

	Parameters
	-----------
	eta : float
		Learning rate (between 0.0 and 3.0)
	n_iter : int
		Passes over the training dataset.

	Attributes
	-----------
	w_ : 1d-array
		Weights after fitting.
	errors_ : list
		Number of misclassifications in every ecoph.
	"""

	def __init__(self, eta=0.01, n_iter=10):
		self.eta = eta
		self.n_iter = n_iter

	def net_input(self, X):
		"""Calculate net input"""
		return np.dot(X, self.w_[1:]) + self.w_[0]

	def activation(self, X):
		"""Compute linear activation."""
		return self.net_input(X)
		
	def predict(self, X):
		"""Return class label after uint step."""
		return np.where(self.activation(X) >= 0.0, 1, -1)
		
	def fit(self, X, y):
		"""Fit training data.

		Parameters
		-----------
		X : {array-like}, shape = [n_samples, n_features]
			Training vectors, where n_samples is the number of samples and 
			n_features is the number of features.
		y : array-like, shape = [n_shape]
			Target values.

		Returns
		-------
		self : object
		"""

		self.w_ = np.zeros(1 + X.shape[1])
		self.cost_ = []

		for i in range(self.n_iter):
			output = self.net_input(X)
			errors = (y - output)
			self.w_[1:] += self.eta * X.T.dot(errors)
			self.w_[0] += self.eta * errors.sum()
			cost = (errors ** 2).sum() / 2.0
			self.cost_.append(cost)

		return self
```


与感知器中针对每一个样本做一次权重更新不同，我们基于训练数据集通过 `self.eta * errors.sum()` 来计算梯度的第0个位置的权重，通过 `self.eta * X.T.dot(errors)` 来计算 1 到 $m$ 位置的权重，其中 `X.T.dot(errors)` 是特征矩阵与误差向量之间的乘积。与前面感知器的实现类似，我们设置一个列表 `self.cost_` 来存储代价函数的输出值以检查本轮训练后算法是否收敛。

> 矩阵与向量的乘法计算类似于将矩阵中的每一行单独作为一个行向量与原列向量的点积计算。这种向量化方法使得书写更加紧凑，同时借助于 NumPy 也使得计算更加收敛。

$$
\begin{bmatrix}
1 & 2 & 3 \\
4 & 5 & 6 
\end{bmatrix} 
\times
\begin{bmatrix}
7 \\
8 \\
9
\end{bmatrix}
= \begin{bmatrix}
1 \times 7 + 2 \times 8 + 3 \times 9 \\
4 \times 7 + 5 \times 8 + 6 \times 9
\end{bmatrix}
=\begin{bmatrix}
50 \\
122
\end{bmatrix}
$$

在实践中，为优化收敛效果，常常需要通过实验来找到合适的学习速率 $\eta$。因此，我们分别使用 $\eta = 0.1$ 和 $\eta=0.0001$ 两个学习速率来绘制迭代次数与代价函数的图像，以观察 Adaline 通过训练数据进行学习的效果。

> 这里的学习效率 $\eta$ 和迭代次数 n_iter 都被称为感知器和 Adaline 算法的超参(hyperparameter)。第4章，我们将学习自动调整超参值以得到分类性能最优模型的各种技术。

现在我们分别绘制在两个不同的学习速率下，代价函数与迭代次数的图像。

```python
import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
from Perceptron import Perceptron, AdalineGD
from itools import plot_decision_regions

df = pd.read_csv(r'https://archive.ics.uci.edu/ml/machine-learning-databases/iris/iris.data', header=None)

y = df.iloc[0:100, 4].values
y = np.where(y == 'Iris-setosa', -1, 1)
X = df.iloc[0:100, [0, 2]].values

fig, ax = plt.subplots(nrows=1, ncols=2, figsize=(8,4))
ada1 = AdalineGD(n_iter=10, eta=0.01).fit(X, y)
ax[0].plot(range(1, len(ada1.cost_) + 1), np.log10(ada1.cost_), marker='o')
ax[0].set_xlabel('Epochs')
ax[0].set_ylabel('log(Sum-squared-error)')
ax[0].set_title('Adaline - Learning rate 0.01')

ada2 = AdalineGD(n_iter=10, eta=0.0001).fit(X, y)
ax[1].plot(range(1, len(ada2.cost_) + 1), np.log10(ada2.cost_), marker='o')
ax[1].set_xlabel('Epochs')
ax[1].set_ylabel('log(Sum-squared-error)')
ax[1].set_title('Adaline - Learning rate 0.0001')

plt.show()
```

从下面代价函数输出结果的图像可以看到，我们面临两种不同类型的问题。左边的图像显示学习速率过大可能会出现的问题——并没有使代价函数的值尽可能的低，反而因为算法跳过了全局最优解，导致误差随着迭代次数增加而增大。

![](https://mingminyu.github.io/webassets/images/20251208/19.png)

虽然在右边的图中代价函数逐渐减小，但是选择学习速率 $\eta = 0.0001$ 的值太小，以致为了达到算法的收敛的目标，需要更多的迭代次数。下图说明了我们如何通过特定的权重参数来最小化代价函数 $J$ (左下图)。右子图则展示了，如果学习速率选择过大会发生什么情况: 算法跳过全局最优解(全局最小值)。

![](https://mingminyu.github.io/webassets/images/20251208/20.png)

本书涉及的许多机器学习算法要求对特征值范围进行特征缩放，以优化算法的性能，我们将在第3章中做更深入的介绍。梯度下降就是通过特征缩放而受益的众多算法之一。在此，采用一种称作 **标准化** 的特征缩放方法，此方法可以使数据具备标准正态分布的特性: 各特征值均值为0，标准差为1。例如，为了对第 $j$ 个特征进行标准化处理，只需要将其值与所有样本的平均值 $\mu_j$ 相减，并除以其标准差 $\sigma_j$。

$$
x_j^{\prime} = \frac {x_j - \mu_j}{\sigma_j}
$$
这里的 $x_j$ 是包含训练样本 $n$ 中第 $j$ 个特征的所有值的向量。

标准化可以简单地通过 NumPy 的 `mean` 和 `std` 方法来完成:

```python
X_std = np.copy(X)
X_std[:,0] = (X[:,0] - X[:,0].mean()) / X[:,0].std()
X_std[:,1] = (X[:,1] - X[:,1].mean()) / X[:,1].std()
```

在进行标准化操作后，我们以学习速率 $\eta = 0.01$ 再次对 Adaline 进行训练，看看它是否是收敛的:

```python linenums="1"
import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
from Perceptron import Perceptron, AdalineGD
from itools import plot_decision_regions

df = pd.read_csv(r'https://archive.ics.uci.edu/ml/machine-learning-databases/iris/iris.data', header=None)

y = df.iloc[0:100, 4].values
y = np.where(y == 'Iris-setosa', -1, 1)
X = df.iloc[0:100, [0, 2]].values

X_std = np.copy(X)
X_std[:,0] = (X[:,0] - X[:,0].mean()) / X[:,0].std()
X_std[:,1] = (X[:,1] - X[:,1].mean()) / X[:,1].std()

ada = AdalineGD(n_iter=15, eta=0.01)
ada.fit(X_std, y)
plot_decision_regions(X_std, y, classifier=ada)
plt.title('Adaline - Gradient Descent')
plt.xlabel('sepal length [standardized]')
plt.ylabel('petal length [standardized]')
plt.legend(loc='upper left')
plt.show()

plt.plot(range(1, len(ada.cost_) + 1), ada.cost_, marker='o')
plt.xlabel('Epochs')
plt.ylabel('Sum-squared-error')
plt.show()
```

执行上述代码，我们可以看到途中判定区域，以及代价函数逐步减小的确实，如下图所示：

![](https://mingminyu.github.io/webassets/images/20251208/21.png)
![](https://mingminyu.github.io/webassets/images/20251208/22.png)

如上图所示，以 $\eta = 0.01$ 为学习效率，Adaline 算法在经过标准化特征处理的数据上训练可以收敛。虽然所有样本都被正确分类，但是其误差平方和(SSE)的值仍旧不为零。

### 3.3 大规模机器学习与随机梯度下降

在上一节中，我们学习了如何使用整个训练数据集沿着梯度相反的方向进行优化，以最小化代价函数；这也是此方法有时称作批量梯度下降的原因。假定现在有一个包含几百万条数据的巨大数据集，对许多机器学习应用来说，这个量是非常寻常的。由于向全局最优点移动的每一步都需要使用整个数据集进行评估，因此这种情况下使用批量梯度下降的计算成本非常高。

一个常用的替代批量梯度下降的优化算法是 **随机梯度下降**(stochastic gradient descent)，有时也称作 **迭代梯度下降**(iterative gradient descent) 或者 **在线梯度下降**(online gradient descent)。与基于所有样本 $x^{(i)}$ 累积误差更新权重的策略不同:

$$\Delta w = \eta \sum_i (y^{(i)} - \phi (z^{(i)}))x^{(i)}$$

我们每次使用一个训练样本渐进地更新权重:

$$\eta (y^{(i)} - \phi (z^{(i)}))x^{(i)}$$

虽然随机梯度下降可看作对梯度下降的近似，但是由于权重更新更频繁，通常它更快收敛。由于梯度的计算是基于单个训练样本来完成的，因此其误差曲面不及梯度下降的平滑，但这也使得随机梯度下降更容易跳出小范围的局部最优点。为了通过随机梯度下降得到更准确的结果，让数据以随机地方式提供算法是非常重要的，这也是我们每次是迭代都要打乱训练集以防止进入循环的原因。

> 当实现随机梯度下降时，通常使用随着时间变化的自适应学习速率来替代固定学习速率 $\eta$，例如: $\frac {c_1}{[迭代次数] + c_2}$，其中 $c_1$ 和 $c_2$均为常数。
> 请注意，随机梯度下降不一定会得到全局最优解，但会趋近于它。借助于自适应学习速率，我们可以更进一步趋近于全局最优解。

随机梯度下降的另一个优势是我们可以将其用于在线学习。通过在线学习，当有新的数据输入时模型会被实时训练。这在我们面对海量数据时特别有效，例如针对 Web 中的用户信息。使用在线学习，系统可以及时地适应变化，同时考虑存储成本的话，也可以将训练数据在完成对模型的更新后丢弃。

> 小批次学习是介于梯度下降和随机梯度下降之间的一种技术，可以将小批次学习理解为在相对较小的训练数据子集上应用梯度下降——例如，一次使用50个样本。与梯度下降相比，由于权重的更新更加频繁，因此其收敛性速度更快。此外，小批次使得我们可以用向量化操作来替代 for 循环，从而进一步提高学习算法的计算效率。

由于我们已经使用梯度下降实现了 Adaline 学习规则，因此只需要在此基础上将学习算法中的权重更新为通过随机梯度下降来实现即可。现在把 `fit` 方法改为使用单个训练样本来更新权重。此外，我们增加了一个 `partial_fit` 方法，对于在线学习，此方法不会重置权重。为了检验算法在训练后是否收敛，我们将每次迭代计算出的代价值作为训练样本的平均消耗。此外，我们还增加了一个 `shuffle` 训练数据选项，每次迭代前重排训练数据避免在优化代价函数阶段陷入循环。通过 `random_state` 参数，我们可以指定随机数种子以保持多次训练的一致性。

```python linenums="1"
import numpy as np
from numpy.random import seed

class AdalineSGD(object):
	"""ADAptive Linear Neuron classifier:

	Parameters
	-----------
	eta : float
		Learning rate (between 0.0 and 3.0)
	n_iter : int
		Passes over the training dataset.

	Attributes
	-----------
	w_ : 1d-array
		Weights after fitting.
	errors_ : list
		Number of misclassifications in every epoch.
	shuffle : bool (default: True)
		Shuffles training data every epoch
		if True to prevent cycles.
	random_state: int (default: None)
		Set random state for shuffling
		and initializing the weights.
	"""

	def __init__(self, eta=0.01, n_iter=10, shuffle=True, random_state=None):
		self.eta = eta
		self.n_iter = n_iter
		self.w_initialized = False
		self.shuffle = shuffle
		if random_state:
			seed(random_state)

	def net_input(self, X):
		"""Calculate net input"""
		return np.dot(X, self.w_[1:]) + self.w_[0]

	def activation(self, X):
		"""Compute linear activation."""
		return self.net_input(X)
		
	def predict(self, X):
		"""Return class label after uint step."""
		return np.where(self.activation(X) >= 0.0, 1, -1)

	def _shuffle(self, X, y):
		"""Shuffle training data"""
		r = np.random.permutation(len(y))
		return X[r], y[r]

	def _initialize_weights(self, m):
		"""Initialize weights to zeros"""
		self.w_ = np.zeros(1 + m)
		self.w_initialized = True

	def _update_weights(self, xi, target):
		"""Array Adaline learning rule to update the weights"""
		output = self.net_input(xi)
		error = (target - output)
		self.w_[1:] += self.eta * xi.dot(error)
		self.w_[0] += self.eta * error
		cost = 0.5 * error ** 2
		return cost

	def partial_fit(self, X, y):
		"""Fit training data without reinitializing the weights"""
		if not self.w_initialized:
			self._initialzie_weights(X.shape[1])
		if y.ravel().shape[0] > 1:
			for xi, target in zip(X, y):
				self._update_weights(xi, target)
		else:
			self._update_weights(X, y)
		return self

	def fit(self, X, y):
		"""Fit training data.

		Parameters
		-----------
		X : {array-like}, shape = [n_samples, n_features]
			Training vectors, where n_samples is the number of samples and 
			n_features is the number of features.
		y : array-like, shape = [n_shape]
			Target values.

		Returns
		-------
		self : object
		"""

		self._initialize_weights(X.shape[1])
		self.cost_ = []

		for i in range(self.n_iter):
			if self.shuffle:
				X, y = self._shuffle(X, y)
			cost = []
			for xi, target in zip(X, y):
				cost.append(self._update_weights(xi, target))
			avg_cost = sum(cost) / len(y)
			self.cost_.append(avg_cost)

		return self
```

分类器 AdalineSGD 中的 `_shuffle` 方法的工作原理如下: 通过 `numpy.random` 的 `permutation` 函数，我们生成一个包含 0~100 的不重复的随机序列。这些数字可以作为索引帮助打乱我们的特征矩阵和类标向量。

接下来，我们就可以通过 fit 方法训练 AdalineSGD 分类器，并应用 plot_decision_regions 方法绘制训练结果

```python linesnums="1"
import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
from Perceptron import AdalineSGD
from itools import plot_decision_regions

df = pd.read_csv(r'https://archive.ics.uci.edu/ml/machine-learning-databases/iris/iris.data', header=None)

y = df.iloc[0:100, 4].values
y = np.where(y == 'Iris-setosa', -1, 1)
X = df.iloc[0:100, [0, 2]].values

X_std = np.copy(X)
X_std[:,0] = (X[:,0] - X[:,0].mean()) / X[:,0].std()
X_std[:,1] = (X[:,1] - X[:,1].mean()) / X[:,1].std()

ada = AdalineGD(n_iter=15, eta=0.01, random_state=1)
ada.fit(X_std, y)
plot_decision_regions(X_std, y, classifier=ada)
plt.title('Adaline - Stochastic Gradient Descent')
plt.xlabel('sepal length [standardized]')
plt.ylabel('petal length [standardized]')
plt.legend(loc='upper left')
plt.show()

plt.plot(range(1, len(ada.cost_) + 1), ada.cost_, marker='o')
plt.xlabel('Epochs')
plt.ylabel('Average Cost')
plt.show()
```

执行前面的示例代码，我们得到下图:

![](https://mingminyu.github.io/webassets/images/20251208/23.png)
![](https://mingminyu.github.io/webassets/images/20251208/24.png)


可以看到，代价函数的均值下降得很快，经过15次迭代后，最终的分类界面与使用梯度下降得到的 Adaline 分类界面类似。如果要改进模型，例如用于处理流数据的在线学习，可以对单个样本简单地调用 `partial_fit` 方法，如 `ada.partial_fit(X_std[0,:], y[0])`。

## 3. 本章小结

在本章中，我们仔细讲解了监督学习中线性分类器的基本概念。在实现了感知器算法后，我们学习了如何通过向量化的梯度下降高效的实现自适应线性神经元，以及通过随机梯度下降实现在线学习。至此，我们已经知道了如何用 Python 来实现简单的分类器。在下一章节，我们将使用 Python 的 scikit-learn 机器学习库来获得一些现成的机器学习分类器，这些高效的分类器常应用于学术及工程领域。

[^注1]: W.S.McCulloch and W.Pitts. A Logical Calculus of the Ideas Immanent in Nervous Activity. The bulletin of mathematical biophyisics, 5(4):115-133, 1943.
[^注2]: F.Rosenblatt, The Perceptron, a Perceiving and Recognizing Automaton. Cornell Aeronautical Laboratory, 1957.
[^注3]: 梯度相反的方向是学习速率最快的方向

