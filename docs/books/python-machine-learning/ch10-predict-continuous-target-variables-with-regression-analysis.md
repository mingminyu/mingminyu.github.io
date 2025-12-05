# 第10章：使用回归分析预测连续型目标变量

GitHub Notebook 地址: https://nbviewer.jupyter.org/github/rasbt/python-machine-learning-book/blob/master/code/ch10/ch10.ipynb

在前面的章节中，我们学习了许多关于监督学习的概念，并且针对分类问题训练了许多不同的模型来预测分组成员或样本的类标归属。本章我们将进入监督学习的另一个分支: **回归分析**(regression analysis)。

**回归模型**(regression model)可用于连续型目标变量的预测分析，这使得它在探寻变量间关系、评估趋势、作出预测等科学及工业领域应用中极具吸引力。具体的例子如: 预测公司在未来几个月的销售情况等。

在本章，我们将介绍回归模型的主要概念，将涵盖如下主题:

-   数据集的探索与优化
-   实现线性回归模型的不同方法
-   训练可处理异常的回归模型
-   回归模型的评估及常见问题
-   基于非线性数据拟合回归问题

# 10.1 简单的线性回归模型初探

简单(单变量)线性回归的目标是: 通过模型来描述某一特征(解释变量 $X$)与连续型输出(目标变量 $y$)之间的关系。当只有一个解释变量时，线性模型的函数定义如下:

$$
y = w_0 + w_1x
$$

其中，权值 $w_0$ 为函数在 $y$ 轴上截距，$w_1$ 为解释变量的系数。我们的目标是通过学习得到线性方程的这两个权值，并用它们解释变量与目标变量之间的关系，当解释变量为非训练数据集中数据时，可用此线性关系来预测对应的输出。

基于前面定义的线性方程，线性回归可看作是求解样本点的最佳拟合直线，如下图所示。

![在这里插入图片描述](https://img-blog.csdnimg.cn/2019090220343331.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L0x1Q2gxTW9uc3Rlcg==,size_16,color_FFFFFF,t_70)

这条最佳拟合线也被成为**回归线**(regression line)，回归线与样本之间的垂直连线即所谓的**偏移**(offset) 或**残差**(residual)——预测的误差。

在只有一个解释变量的特殊情况下，线性回归也称为**简单线性回归**(simple linear regression)，当然，我们可以将线性回归模型扩展到多个解释变量。此时，即为所谓的**多元线性回归**(multiple linear regression):

$$
y = w_0x_0 +w_1x_1 + \dots + w_mx_m 
\\ = \sum_{i=0}^n w_ix_i = w^Tx
$$

其中，$w_0$ 为 $x_0=1$ 时在 $y$ 轴上的截距。

# 10.2 波士顿房屋数据集

在实现第一个线性回归模型之前，先介绍一个新的数据集: 波士顿房屋数据集(Housing Dataset)，它是由 D.Harrison 和 D.L.Rubinfled 于 1978 年收集的波士顿郊区房屋的信息。此房屋数据可免费试用，读者可在 UCI 机器学习数据库中下载:  https://archive.ics.uci.edu/ml/datasets/Housing 。

数据集中 506 个样本的特征描述如下:

-   CRM : 房屋所在镇的犯罪率。
-   ZN : 用地面积远大于 25000 平方英尺的住宅所占比例。
-   INDUS : 房屋所在镇无零售业务区域所占比例。
-   CHAS : 与查尔斯河有关的虚拟变量(如果房屋位于河边则值为1，否则为 0)。
-   NOX : 一氧化氮浓度(每千万分之一)。
-   RM : 每处寓所的平均房间数。
-   AGE :业主自住房中，建于 1940之前的房屋所占比例。
-   DIS : 房屋距离波士顿五大就业中心的加权距离。
-   RAD : 距离房屋最近公路入口编号
-   TAX : 每一万美元全额财产税金额。
-   PTRATIO : 房屋所在镇的师生比。
-   B : 计算公式为 $1000(B_k-0.63)^2$，其中 $B_k$ 为房屋所在镇非裔美籍人口所占比例。
-   LSTAT : 弱势群体人口所占比例。
-   MEDV : 业主自住房的平均价格(以1000美元为单位)。

本章的后续内容中，我们将以房屋价格(MEDV) 作为目标变量——使用其他 13 个变量中的一个或多个值作为解释变量对其进行预测。在进一步研究数据集之前，我们先从 UCI 库中把它导入到 pandas 的 DataFrame 中:

```python
import pandas as pd
data_url = "https://archive.ics.uci.edu/ml/machine-learning-databases/housing/housing.data"
df = pd.read_csv(data_url, header=None, sep='\s+')
df.columns = ['CRIM', 'ZN', 'INDUS', 'CHAS', 'NOX', 
              'RM', 'AGE', 'DIS', 'RAD', 'TAX', 
              'PTRATIO', 'B', 'LSTAT', 'MEDV']
df.head()
```

为了确保数据已经正确加载，我们先显示数据集的前5行。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20190902203513412.png)

## 10.2.1 可视化数据集的重要特征

**探索性数据分析**(Exploratory Data Analysis, EDA) 是机器学习模型训练之前的一个重要步骤。在本节的后续内容中，借助 EDA 图形工具箱中那些简单切且有效的技术，可以帮助我们直观地发现数中的异常情况、数据的分布情况，以及特征间的相互关系。

首先，借助散点图矩阵，我们以可视化的方法汇总显示各不同特征两两之间的关系。为了绘制散点图矩阵，我们需要用到 seaborn 库中的 `pairplot` 函数(http://stanford.edu/~mwaskom/software/seaborn/ )，它是在 matplotlib 基础上绘制统计图像的 Python 库。

```python
import matplotlib.pyplot as plt
import seaborn as sns

sns.set(style='whitegrid', context='notebook')
cols = ['LSTAT', 'INDUS', 'NOX', 'RM', 'MEDV']
sns.pairplot(df[cols], size=2.5)
plt.show()
```

如下图所示，散点图以图形的方式对数据集中特征间关系进行了描述:

> 导入 `seaborn` 库后，会覆盖当前 Python 会话中 matplotlib 默认的图像显示方式。如果读者不希望使用 `seaborn` 风格的设置，可以通过如下命令重设为 `matplotlib` 的风格:

```python
sns.reset_orig()
```

出于篇幅限制及可读性的考虑，我们仅绘制了数据集中的 5列: LSTAT、INDUS、NOX、RM 和 MEDV。不过，建议读者绘制整个 DataFrame 的散点图矩阵，以对数据做进一步的探索。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20190902203600795.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L0x1Q2gxTW9uc3Rlcg==,size_16,color_FFFFFF,t_70)

通过此散点图矩阵，我们可以快速了解数据是如何分布的，以及其中是否包含异常值。例如，我们可直观看出 RM 和房屋价格 MEDV(第5列和第4行) 之间存在线性关系。此外，从 MEDV 直方图(散点图矩阵的右下角子图)中可以发现: MEDV 呈正态分布，但包含几个异常值。

> **请注意**，不同于人们通常的理解，训练一个线回归模型并不需要解释数量或者目标变量呈正态分布。正态假设适用于某些统计检验和假设检验(Montgomery, D.C., Peck.E.A., and Vining, G.G. Introduction to linear regression analysis. John Wiley and Sons, 2012, pp.318-319)，这些内容已经超出了本书讲解的范围，有兴趣的读者可以根据自身情况进行学习。

为了量化特征之间的关系，我们创建一个相关系数矩阵。相关系数矩阵与我们第5章“主成分分析”一节中讨论过的协方差矩阵是密切相关的。直观上看，我们可以把相关系数矩阵看作是协方差矩阵的标准版。实际上，相关系数矩阵就是在数据标准化得到的协方差矩阵。

**相关系数矩阵**是一个包含**皮尔逊积相关系数**(Pearson product-moment correlation coefficient，通常记为 Pearson-r)的矩阵，它用来衡量两两之间的线性依赖关系。相关系数取值范围为 -1 到 1。如果 `r=1`，代表两个特征完全正相关，如果 `r=0`，则不存在相关关系；如果 `r=-1`，则两个特征完全负相关。如前所述，皮尔逊系数可用两个特征 $x$ 和 $y$ 之间的协方差(分子) 除以它们标准差的乘积(分母)来计算。

$$
r = \frac {\sum_{i=1}^n [(x^{(i)}-\mu_x)(y^{(i)}-\mu_y)]}
{\sqrt {\sum_{i=1}^n (x^{(i)}-\mu_x)^2} \sqrt {\sum_{i=1}^n {(y^{(i)}-\mu_y)^2}}} = \frac {\sigma_{xy}}{\sigma_x \sigma_y}
$$

其中，$\mu$ 为样本对应特征的均值，$\sigma_{xy}$ 为特征 $x$ 和 $y$ 间的协方差，而$\sigma_x$ 和 $\sigma_y$ 分别为两个特征的标准差。

> 可以证明: 经过标准化各特征间的协方差实际上等价于它们的线性相关系数。

首先对特征 $x$ 和 $y$ 做标准化处理，得到它们的 **z分数**(z-score)，并分别记为 $x'$ 和 $y'$:

$$
x' = \frac {x-\mu_x}{\sigma_x}, y' = \frac {y-\mu_y}{\sigma_y}
$$

我们曾使用下面的公式计算两个特征(人口)间的协方差:

$$
\sigma_{xy} = \frac {1}{n} \sum_{i}^n [(x^{(i)}-\mu_x)(y^{(i)}-\mu_y)]
$$

由于特征经过标准化后，其均值为 0，由此，可通过下式来计算特征经缩放后的协方差:

$$
\sigma_{xy}' = \frac {1}{n}  \sum_{i}^n (x'-0)(y'-0)
$$

将 $x'$ 和 $y'$ 带入后，可得:

$$
\sigma_{xy}' = \frac {1}{n} \sum_i^n (\frac {x - \mu_x}{\sigma_x})(\frac {y - \mu_y}{\sigma_y}) \\
= \frac {1}{n \cdot \sigma_x \sigma_y} \sum_{i}^n(x^{(i)}-\mu_x)(y^{(i)}-\mu_y)
$$

上式可简写为:

$$
\sigma_{xy}' = \frac {\sigma_{xy}}{\sigma_x \sigma_y}
$$

在下面的示例代码中，将使用 NumPy 的 `corrcoef` 函数计算前面散点图矩阵中 5个特征间的相关系数矩阵，并使用 seaborn 的 `heatmap` 函数绘制其对应的热度图:

```python
import numpy as np

cm = np.corrcoef(df[cols].values.T)
sns.set(font_scale=1.5)
hm = sns.heatmap(cm, cbar=True, annot=True, square=True,
                 fm='.2f', annot_kws={'size': 15}, 
                 yticklabels=cols, xticklabels=cols)
plt.show()
```

从结果图像中可见，相关系数矩阵为我们提供了另外一种有用的图形化数据描述方式，由此可以根据各特征间的线性相关性进行特征选择:

![在这里插入图片描述](https://img-blog.csdnimg.cn/20190902203836350.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L0x1Q2gxTW9uc3Rlcg==,size_16,color_FFFFFF,t_70)

为了拟合线性回归模型，我们主要关注那些跟目标变量 MEDV 高度相关的特征。观察前面的相关系数矩阵，可以发现 MEDV 与变量 LSTAT 的相关性最大(-0.74)。大家应该还记得，前面的散点图矩阵显示 LSTAT 和 MEDV 之间存在明显的非线性关系。另一方面，正如散点图矩阵所示，RM 和 MEDV 间的相关性也较高(0.70)，考虑到从散点图中观察到了这两个变量之间的线性关系，因此，在后续小节中使用 RM 作为解释变量进行简单线性回归模型训练，是一个较好的选择。

# 10.3 基于最小二乘法构建线性回归模型

在本章开始时讨论过，可将线性回归模型看作通过训练数据的样本点来寻找一条最佳拟合直线。不过，在此既没有对最佳拟合做出定义，也没有研究拟合类似模型的各种技术。在接下来的小节中，我们将消除读者对上述问题的疑惑: 通过最小二乘法(Ordinary Least Squares, OLS) 估计回归曲线的参数，使得回归曲线到样本点垂直距离(残差或误差)的平方和最小。

## 10.3.1 通过梯度下降计算回归参数

回顾一下第2章中介绍的自适应线性神经元(Adaptive Linear Neuron, Adaline): 人工神经元中使用了一个线性激励函数，同时还定义了一个代价函数 $J(\cdot)$，通过梯度下降(Gradient Descent，GD)、随机梯度下降(Stochastic Gradient Descent，GD) 等优化算法使得代价函数最小，从而得到相应的权重。Adaline 中的代价函数就是**误差平方和**(Sum of Squared Error，SSE)，它等同于我们定义的 OLS 代价函数:

$$
J(w) = \frac {1}{2} \sum_i^n (y^{(i)} - \hat y^{(i)})^2
$$

其中，$\hat y$ 为通过 $\hat y = w^Tx$ 得到的预测值(注意，此处的系数 1/2 仅是为了方便推导 GD 更新规则)。本质上，OLS 线性回归可以理解为无单位阶跃函数的 Adaline，这样我们得到的是连续型的输出值，而不是以 `-1` 和 `1` 来代表的类标。为了说明两者的相似程度，使用第2章中实现的 GD 方法，并且移除其单位阶跃函数来实现我们第一个线性回归模型:

```python
class LinearRegressionGD:
    def __init__(self, eta=0.001, n_iter=20):
        self.eta = eta
        self.n_iter = n_iter

    def fit(self, X, y):
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

    def net_input(self, X):
    	return np.dot(X, self.w_[1:]) + self.w_[0]

    def predict(self, X):
    	return self.net_input(X)
```

如果读者需要补习权重更新的内容——为何沿着与梯度相反的方向前进一步，请再复习第2章中的相关内容。

为了在实践中熟悉 LinearRegressionGD 类，我们使用了房屋数据集中的 RM(房间数量) 作为解释变量来训练模型以预测 MEDV(房屋价格)。此外，为了使得梯度下降算法收敛性更佳，在此对相关变量做了标准化处理，代码如下:

```python
from sklearn.preprocessing import StandardScaler

X = df['RM'].values
y = df['MEDV'].values
sc_x = StandardScaler()
sc_y = StandardScaler()
X_std = sc_x.fit_transform(X)
y_std = sc_y.fit_transform(y)
lr.LinearRegressionGD()
lr.fit(X_std, y_std)
```

第2章中曾介绍过，梯度下降算法能够进行收敛性检查，使用这类优化算法时，将代价看作迭代次数的函数(基于训练数据集)，并将其绘制成图是个非常好的做法。简而言之，我们将再次绘制迭代次数对应的代价函数的值，以检查线性回归是否收敛:

```python
plt.plot(range(1, lr.n_iter + 1). lr.cost_)
plt.ylabel('SSE')
plt.xlabel('Epoch')
plt.show()
```

从下图中可以看到，经过第5次迭代后，GD 算法收敛了:

![在这里插入图片描述](https://img-blog.csdnimg.cn/20190902204352974.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L0x1Q2gxTW9uc3Rlcg==,size_16,color_FFFFFF,t_70)

接下来，我们将线性回归曲线与训练数据拟合情况绘制成图。为达到此目的，我们定义了一个辅助函数用来绘制训练样本的散点图，同时绘制出相应的回归曲线:

```python
def lin_regplot(X, y, model):
	plt.scatter(X, y, c='blue')
	plt.plot(X, model.predict(X), color='red')
	return None
```

至此，我们使用 `lin_regplot` 函数绘制房间数与房屋价格之间的关系图:

```python
lin_regplot(X_std, y_std, lr)
plt.xlabel('Average number of rooms [RM] (standardized)')
plt.ylabel('Price in $1000\'s [MEDV] (standardized)')
plt.show()
```

正如下图所示，线性回归曲线反映出了一般趋势，随着房间数量的增加，房价呈增长趋势:

![在这里插入图片描述](https://img-blog.csdnimg.cn/20190902204414806.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L0x1Q2gxTW9uc3Rlcg==,size_16,color_FFFFFF,t_70)

上述结论是基于直觉观察得到的，但是数据也同样告诉我们，房间数在很多情况下并不能很好地解释房价。本章后续内容将讨论如何量化回归模型的性能。有趣的是，我们观察到一条奇怪的直线 `y=3`，这意味着房价被限定了上界。在某些应用中，给出变量在原始取值区间上的预测值也是非常重要的。为了将预测价格缩放到以 1000 美元为价格单位的坐标轴上，我们使用 `StandardScaler` 的 `inverse_transform` 方法:

```python
num_room_std = sc_x.transform([5.0])
price_std = lr.predict(num_room_std)
print("Price in $1000's: %.3f" % sc_y.inverse_transform(price_std))
# 输出结果: Price in $1000's: 10.840
```

上述代码中，我们使用了之前训练好的线性回归模型来预测带有 5个房间的房屋价格。根据我们模型的预测，此房屋价值 10840 美元。

值得一提的是: 对于经过标准化处理的变量，我们无需更新其截距的权重，因为它们在 y 轴上的截距始终为 0。我们可以通过输出其权重来快速确认这一点:

```python
print('Slope: %.3f' % lr.w_[1])
# Slope: 0.695
print('Intercept: %.3f' % lr.w_[0])
# Intercept: -0.000
```

## 10.3.2 使用 scikit-learn 估计回归模型的系数

上一小节中，我们实现了一个可用的回归分析模型。不过在实际应用中，我们可能会更关注如何高效地实现模型，例如 scikit-learn 中的 `LinearRegression` 对象中使用 `LIBLINEAR` 库以及先进的优化算法，可以更好地使用经过标准化的变量。这正是特定应用所需要的:

```python
from sklearn.linear_model import LinearRegression
slr = LinearRegression()
slr.fit(X, y)
print('Slope: %.3f' % slr.w_[1])
# Slope: 9.102
print('Intercept: %.3f' % slr.w_[0])
# Intercept: -34.671
```

执行上述代码可见，使用经过标准化处理的 RM 和 MEDV 数据拟合 scikit-learn 中的 `LinearRegression` 模型得到了不同的模型系数。我绘制出 MEDV 与 RM 之间的关系图，并与 GD 算法实现的模型进行比较:

```python
lin_regplot(X, y, slr)
plt.xlabel('Average number of rooms [RM] (standardized)')
plt.ylabel('Price in $1000\'s [MEDV] (standardized)')
plt.show()
```

上述代码绘制出了训练数据和拟合模型的图像，从图中可以看出，总体结果与 GD 算法实现的模型是一致的:

![在这里插入图片描述](https://img-blog.csdnimg.cn/20190902204643362.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L0x1Q2gxTW9uc3Rlcg==,size_16,color_FFFFFF,t_70)

>   在大多数介绍统计科学的教科书中，都可以找到使用最小二乘法求解线性方程组的封闭方法:
>   $$ w_1 = (X^TX)^{-1}X^Ty \\ w_0 = \mu_y - \mu_{\hat y}\mu_{\hat y}$$ 
> 其中，$\mu_y$ 为真实目标值的均值，为经预测得到目标值的均值。

这种方法的优点在于: 它一定能够分析找到最优解。不过，如果要处理的数据集量很大，公式中逆矩阵的计算成本会非常高，或者矩阵本身为奇异矩阵(不可逆)，这就是在特定情况下我们更倾向于使用交互式方法的原因。

若读者对如何得到正规方程感兴趣，建议阅读 Stephen Pollck 博士在英国莱斯特大学演讲讲义中的章节“The Classical Linear Regression Model”，可通过链接 http://www.le.ac.uk/users/dsgp1/COURSES/MESOMET/ECMETXT/06mesmet.pdf 获取。

# 10.4 使用 RANSAC 拟合高鲁棒性回归模型

异常值对线性回归模型具有严重的影响。某些情况下，数据集的一个非常小的子集也可能会对模型参数的估计造成很大的影响。目前已有许多统计检测方法能够检测异常值，但该部分内容已超出本书范围。不过，作为数据方面的研究人员，我们需要根据相关领域的专业知识，并结合自身的判断清除异常值。

作为清除异常值的一种高鲁棒性回归方法，在此我们将学习**随机抽样一致性**(RANdom SAmple Consensus, RANSAC) 算法，使用数据的一个子集(即所谓的内点， inlier) 来进行回归模型的拟合。

我们将 RANSAC 算法的工作流程总结如下:

1.  从数据集中随机抽取样本构建内点集合来拟合模型。
2.  使用剩余数据对上一步得到的模型进行测试，并将落在预定公差范围内的样本点增至内点集合中。
3.  使用全部的内点集合数据再次进行模型的拟合。
4.  使用内点集合来估计模型的误差。
5.  如果模型性能达到了用户设定的特定阈值或者迭代达到了预定次数，则算法终止，否则跳转到第1步。

现在使用 scikit-learn 的 `RANSACRegressor` 对象来实现我们的线性模型:

```python
from sklearn.linear_model import RANSACRegressor
ransac = RANSACRegressor(LinearRegression(), 
        max_trials=100, min_samples=50, 
        residual_metric=lambda x: np.sum(np.abs(x), axis=1), 
        residual_threshold=5.0, random_state=0)
ransac.fit(X, y)
```

我们将 `RANSACRegressor` 的最大迭代次数设定为 100，设定参数 `min_samples=50`，即随机抽取作为内点的最小样本数量设定为 50，使用 `residual_metric` 参数，我们向其传递了一个 `lambda` 函数，此函数能够拟合曲线与样本间垂直距离的绝对值。同时将 `residual_threshold` 参数的值设定为 5.0，这样只有与拟合曲线垂直距离小于 5 个单位长度的样本点才能加入到内点集合，此设置在特定数据集上表现良好。scikit-learn 默认使用 `MAD 估计`来设置内点阈值，其中 MAD 是目标值 $y$ 的**中位数绝对偏差**(Median Absolute Deviation) 的缩写。不过，内点阈值的确定是与具体问题相关的，这也是 RANSAC 的一个问题所在。近年来，已经出现了多种能自动选出适宜的内点阈值的方法。读者可以通过 R.Toldo 和 A.Fusiello 的论文了解详细内容。

完成 RANSAC 模型的拟合后，我们使用该 RANSAC 线性回归模型来获取内点和异常值的集合，并将它们与使用内点拟合得到的曲线一同绘制:

```python
inlier_mask = ransac.inlier_mask_
outlier_mask = np.logical_not(inlier_mask)
line_X = np.arange(3, 10, 1)
line_y_ransac = ransac.predict(line_X[:, np.newaxis])
plt.scatter(X[inlier_mask], y[inlier_mask], c='b', 
            marker='o', label='Inliers')
plt.scatter(X[outlier_mask], y[outlier_mask], c='lightgreen', 
            marker='s', label='Outliers')
plt.plot(line_X, line_y_ransac, c='r')
plt.xlabel('Average number of rooms [RM]')
plt.ylabel('Price in $1000\'s [MEDV]')
plt.legend(loc='upper left')
plt.show()
```

从下面的散点图可以看出，线性回归模型是通过内点(圆)集合拟合得到的:

![在这里插入图片描述](https://img-blog.csdnimg.cn/20190902204735732.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L0x1Q2gxTW9uc3Rlcg==,size_16,color_FFFFFF,t_70)


我们使用下面的代码来显示模型的斜率和截距，可以看到结果与前面未使用 RANSAC 得到的拟合曲线稍有不同:

```python
print('Slope: %.3f' % ransac.estimator_.coef_[1])
# Slope: 9.621
print('Intercept: %.3f' % ransac.estimator_.intercept_)
# Intercept: -37.6137
```

使用 RANSAC，我们降低了数据集中异常点的潜在影响，但无法确定该方法对未知数据的预测性能是或否存在正面影响。因此，下一节中将讨论回归模型评估的不同方法，这是预测模型构造系统中的一个重要组成部分。

# 10.5 线性回归模型性能的评估

在前面的小节中，我们讨论了如何在训练数据上拟合回归模型。然而，通过前面章节的学习，我们了解到: 为了获得模型性能的无偏估计，在训练过程中使用未知数据对模型进行测试是至关重要的。

还记得在第6章中，将数据集划分为训练数据集和测试数据集，前者用于模型的拟合，后者用于评估模型在未知数据上的泛化性能。简单回归模型的介绍就到这里，我们现在使用数据集中的所有变量训练多元回归模型:

```python
from sklearn.model_selection import train_test_split

X = df.iloc[:, :-1].values
y = df['MEDV'].values
X_train, X_test, y_train, y_test = \
    train_test_split(X, y, test_size=0.3, random_state=0)
slr = LinearRegression()
slr.fit(X_train, y_train)
y_train_pred = slr.predict(X_train)
y_test_pred = slr.predict(X_test)
```

这个模型使用了多个解释变量，我们无法在二维图上绘制线性回归曲线(更确切地说是超平面)，不过可以绘制出预测值的残差(真实值与预测值之间的差异或者垂直距离)图，从而对回归模型进行评估。残差图作为常用的图形分析方法，可对回归模型进行评估、获取模型的异常值，同时还可检查模型是否是线性的，以及误差是否随机分布。

使用如下代码，我们绘制得到残差图，其中，通过将预测结果减去对应目标值真实值，便可获得残差的值:

```python
plt.scatter(y_train_pred, y_train_pred - y_train, c='b',
         marker='o', label='Training data')
plt.scatter(y_train_pred, y_test_pred - y_test, c='b', 
         marker='o', label='Training data')
plt.xlabel('Predicted values')
plt.ylabel('Rasiuals')
plt.legend(loc='upper left')
plt.hlines(y=0, xmin=-10, xmax=50, lw=2, color='red')
plt.xlim([-10, 50])
plt.show()
```

执行上述代码，我们应该看到如下残差图像，其中包含一条穿过 $x$ 轴原点的直线，如下图所示:

![在这里插入图片描述](https://img-blog.csdnimg.cn/2019090220490864.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L0x1Q2gxTW9uc3Rlcg==,size_16,color_FFFFFF,t_70)

完美的预测结果其残差应为 0，但在实际应用中，这种情况可能永远都不会发生。不过，**对于一个好的回归模型，我们期望误差是随机分布的，同时残差也随机分布与中心线附近**。如果我们从残差图中找出规律，这意味着模型遗漏了某些能够影响残差的解释信息，就如图刚看到的残差图那样，其中有着些许规律。另外，我们还可以使用残差图来发现异常值，这些异常值点看上去距离中心线有较大的偏差。

另外一种对模型性能进行定量评估的方法称为均方误差(Mean Squared Error，MSE)，它是线性回归模型拟合过程中，最小化误差平方和(SSE) 代价函数的平均值。MSE 可用于不同回归模型的比较，或是通过**网格搜索**进行参数调优，以及交叉验证等:

$$
MSE = \frac {1}{n}(y^{(i)} - \hat y^{(i)})^2
$$

执行如下代码:

```python
from sklearn.metrics import mean_squared_error

print('MSE train: %.3f, test: %.3f' % (
    mean_squared_error(y_train, y_train_pred),
    mean_squared_error(y_test, y_test_pred)))
```

可以看到，训练集上的 MSE 值为 19.96，而测试集上的 MSE 值骤升为 27.20，这意味着我们的模型过拟合于训练数据。

某些情况下**决定系数**(coefficient of determination) ($R^2$) 显得尤为有用，它可以看作是 MSE 的标准化版本，用于更好地解释模型的性能。换句话说，$R^2$ 是模型捕获的响应方差的分数。$R^2$ 的值定义如下:

$$
R^2 = 1 - \frac {SSE}{SST}
$$

其中，SSE 是误差平方和，而 $SST = \sum_i^n (y^{(i)} - \mu_y)^2$，换句话说，$R^2$ 就是预测值的方差。

我们来看一下使用 MSE 定义的 $R^2$:

$$
\begin{aligned}
R^2 &= 1 - \frac {SSE}{SST} \\
&= 1 - \frac {\frac{1}{n} \sum_i^n (y^{(i)} - \hat y^{(i)})^2}{\frac{1}{n} \sum_i^n (y^{(i)} - \mu_y)^2} \\
&=  1 - \frac {MSE}{Var(y)}
\end{aligned}
$$

对于训练数据集来说，$R^2$的取值范围介于区间 `[0, 1]`，对于测试集来说，其值可能为负。如果 $R^2$=1，此时 `MSE=0`，这意味着模型完美拟合数据。

在训练集上进行评估，$R^2$ 的值为 0.765，看起来还不错。不过，在测试上 $R^2$ 的值仅为 0.673，计算代码如下:

```python
from sklearn.metrics import r2_score
print('r^2 train: %.3f, test: %.3f' % (
    mean_squared_error(y_train, y_train_pred),
    mean_squared_error(y_test, y_test_pred)))
```

# 10.6 回归中的正则化方法

正如第3章中所讨论的，**正则化**是通过模型中加入额外信息来解决过拟合信息来解决过拟合问题的一种方法，引入惩罚项增加了模型复杂性，但却降低了模型参数的影响。最常见的正则化线性回归方法就是所谓的**岭回归**(Ridge Regression)、**最小绝对收缩**及**算子选择**(Least Absolute Shrinkage and Selection Operator，LASSO) 以及**弹性网络**(Elastic Net) 等。

**岭回归**是基于 L2 惩罚项的模型，我们只是在最小二乘代价函数中加入了权重的平方和:

$$
J(w)_{Ridge} = \sum_{i=1}^n (y^{(i)} - \hat y^{(i)})^2 + \lambda ||w||_2^2
$$

其中: 

$$
L2 : \lambda ||w||_2^2 = \lambda \sum_{i=1}^m w_j^2
$$

通过增加超参的值，我们可以增加正则化的强度，同时也就降低了权重对模型的影响。请注意，正则化不影响截距 $w_0$。

对于基于系数数据训练的模型，还有另外一种解决方案，即 LASSO。基于正则化项的强度，某些权重可以变为零，这也使得 LASSO 称为一种监督特征选择技术:

$$
J(w)_{LASSO} = \sum_{i=1}^n (y^{(i)} - \hat y^{(i)})^2 + \lambda ||w||_1
$$

其中:

$$
L1 : \lambda ||w||_1 = \lambda \sum_{i=1}^m |w_j|
$$

不过 LASSO 存在一个限制，即如果 $m > n$，则至多可以完成 n 个变量的筛选。**弹性网络则是岭回归和 LASSO 之间的一个折中**，其中包含一个用于稀疏化的 L1 惩罚项，以及一个消除 LASSO 限制(如可筛选变量数量) 的 L2 惩罚项。

$$
J(w)_{ElasticNet} = \sum_{i=1}^n (y^{(i)} - \hat y^{(i)})^2 + \lambda_1 \sum_{j=1}^m w_j^2 + \lambda_2 \sum_{j=1}^m |w_j|
$$

scikit-learn 中包含前面提及的所有正则化回归模型，除了需要参数指定正则化强度外，这些模型的使用方式与 K 折交叉验证等普通回归模型的使用方法相同。

岭回归模型的初始化方式如下:

```python
from sklearn.linear_model import Ridge
ridge = Ridge(alpha=1.0)
```

请注意，正则化强度通过 `alpha` 来调节，它类似于参数。同样，我们可以使用 `linear_model` 子模块下的 Lasso 对象来初始化 LASSO 回归:

```python
from sklearn.linear_model import Lasso
lasso = Lasso(alpha=1.0)
```

例如，如果将 `l1_ratio` 设置为 1.0，此时 ElasticNet 回归等同于 LASSO 回归。如果想了解线性回归不同实现方式的更多信息请参数: http://scikit-learn.org/stable/modules/linear_model.html 。

# 10.7 线性回归模型的曲线化-多项式回归

在前面的小结中，我们假定了单一解释变量与响应变量的线性关系。对于不符合线性假设的问题，一种常用的解释方法就是通过加入多项式项来使用多项式回归模型:
$$
y = w_0 + w_1x_1 + w_2x^2 + \cdots + w_dx^d
$$
其中，$d$ 为多项式的次数。虽然我们可以使用多项式回归对非线性关系建模，但由于线性回归系数 $w$ 的缘故，多项式回归仍旧被看作是多元线性回归模型。

我们现在来讨论一下，如何使用 scikit-learn 中的 PolynominalFeatures 转换类在只含一个解释变量的简单回归问题中加入二次项(``d=2`)，并且将多项式回归与线性回归进行线性拟合比较。步骤如下:

1.  **增加一个二次多项式项**

```python
from sklearn.preprocessing import PolynomialFeatures
X = np.array([258.0, 270.0, 294.0, 320.0, 342.0, 368.0, 396.0, 446.0, 480.0, 586.0])[:, np.newaxis]
y = np.array([236.4, 234.4, 252.8, 298.6, 314.2, 314.2, 360.8, 368.0, 391.2, 390.8])
lr = LinearRegression()
pr = LinearRegression()
quadratic = PolynomialFeatures(degree=2)
X_quad = quadratic.fit_transform(X)
```

2.  **拟合一个用于对比的简单线性回归模型**

```python
lr.fit(X, y)
X_fit = np.arange(250, 600, 10)[:, np.newaxis]
y_lin_fit = lr.predict(X_fit)
```

3.  **使用经过转换后的特征针对多项式回归拟合一个多元线性回归模型**

```python
pr.fit(X_quad, y)
y_quad_fit = pr.predict(quadratic.fit_transform(X_fit))
plt.scatter(X, y, label='training points')
plt.plot(X_fit, y_lin_fit, label='linear fit', linestyle='--')
plt.plot(X_fit, y_quad_fit, label='quadratic fit')
plt.legend(loc='upper left')
plt.show()
```

从结果图像中可以看出，与线性拟合相比，多项式拟合可以更好地捕获到解释变量与响应变量之间的关系。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20190902203250177.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L0x1Q2gxTW9uc3Rlcg==,size_16,color_FFFFFF,t_70)



```python
y_lin_pred = lr.predict(X)
y_quad_pred = pr.predict(X_quad)
print('Training MSE linear: %.3f, quadratic: %.3f' % (
        mean_squared_error(y, y_lin_pred),
        mean_squared_error(y, y_quad_pred)))
# Training MSE linear: 569.780, quadratic: 61.330
print('Training R^2 linear: %.3f, quadratic: %.3f' % (
        r2_score(y, y_lin_pred),
        r2_score(y, y_quad_pred)))
# Training R^2 linear: 0.832, quadratic: 0.982
```

执行上述代码后，MSE 的值有线性拟合的 580 下降到了二次拟合的 61。同时，与线性拟合的结果($R^2$=0.832)相比，二次模型的判断系数的结果($R^2$=0.982)更好，说明二次拟合在此问题上的效果更佳。

## 10.7.1 房屋数据集中的非线性关系建模

在上一小节中，我们通过一个简单问题，讨论了如何通过多项式特征来拟合非线性关系。现在来看一个更加具体的例子，并将这些概念应用到房屋数据集中。通过执行下面的代码，我们将使用二次和三次多项式对房屋价格和 LSTAT(弱势群体人口所占比例)之间的关系进行建模，并与线性拟合进行对比。

代码如下:

```python
X = df[['LSTAT']].values
y = df['MEDV'].values
regr = LinearRegression()

# create polynomial features
quadratic = PolynomialFeatures(degree=2)
cubic = PolynomialFeatures(degree=3)
X_quad = quadratic.fit_transform(X)
X_cubic = cubic.fit_transform(X)

# linear fit
X_fit = np.arange(X.min(), X.max(), 1)[:, np.newaxis]
regr = regr.fit(X, y)
y_lin_fit = regr.predict(X_fit)
linear_r2 = r2_score(y, regr.predict(X))

# quadratic fit
regr = regr.fit(X_quad, y)
y_quad_fit = regr.predict(quadratic.fit_transform(X_fit))
quadratic_r2 = r2_score(y, regr.predict(X_quad))

# cubic fit
regr = regr.fit(X_cubic, y)
y_cubic_fit = regr.predict(cubic.fit_transform(X_fit))
cubic_r2 = r2_score(y, regr.predict(X_cubic))

# plot results
plt.scatter(X, y, label='training points', color='lightgray')
plt.plot(X_fit, y_lin_fit, label='linear (d=1), $R^2=%.2f$' % linear_r2,
         color='blue', lw=2, ls=':')
plt.plot(X_fit, y_quad_fit, label='quadratic (d=2), $R^2=%.2f$' % quadratic_r2,
         color='red', lw=2, ls='-')
plt.plot(X_fit, y_cubic_fit, label='cubic (d=2), $R^2=%.2f$' % cubic_r2,
         color='green', lw=2, ls='--')
plt.xlabel('% lower status of the population [LSTAT]')
plt.ylabel('Price in $10000\'s [MEDV]')
plt.legend(loc='upper left')
plt.show()
```

由图像结果可知，相较于线性拟合和二次拟合，三次拟合更好地捕获了房屋价格与 LSTAT 之间的关系。不过，我们应该意识到，加入越来越多的多项式特征会增加模型的复杂度，从而更易导致过拟合。由此，在实际应用中，建议在单独的测试数据集上评价模型的性能，进而对泛化性能进行评估:

![在这里插入图片描述](https://img-blog.csdnimg.cn/20190902213106377.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L0x1Q2gxTW9uc3Rlcg==,size_16,color_FFFFFF,t_70)

此外，多项式特征并非总是非线性关系建模的最佳选择。例如，仅就 MEDV-LSTAT 的散点图来说，我们可将 LSTAT 特征变量的对数值以及 MEDV 的平方根映射到一个线性特征空间，并使用线性回归进行拟合。可通过执行下面的代码对此假设进行验证:

```python
# transform features
X_log = np.log(X)
y_sqrt = np.sqrt(y)

# fit features
X_fit = np.arange(X_log.min() - 1, X_log.max() + 1)[:, np.newaxis]
regr = regr.fit(X_log, y_sqrt)
y_lin_fit = regr.predict(X_fit)
linear_r2 = r2_score(y_sqrt, regr.predict(X_log))

# plot results
plt.scatter(X_log, y_sqrt, label='training points', color='lightgray')
plt.plot(X_fit, y_lin_fit, label='linear (d=1), $R^2=%.2f$' % linear_r2,
         color='blue', lw=2)
plt.xlabel('log(% lower status of the population [LSTAT])')
plt.ylabel('$\sqrt {Price \; in \; \$1000\'s [MEDV]}$')
plt.legend(loc='upper left')
plt.show()
```

在将解释变量映射到对数空间以及取目标变量的平方根后，我们可以捕获到两者之间的线性关系，其拟合度 $R^2=0.69$ 看似优于前面使用的任何一种多项式回归:

![在这里插入图片描述](https://img-blog.csdnimg.cn/20190902214131160.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L0x1Q2gxTW9uc3Rlcg==,size_16,color_FFFFFF,t_70)

## 10.7.2 使用随机森林处理非线性关系

在本节，我们将了解一下**随机森林**(random forest) 回归，它从概念上异于本章中介绍的其他回归模型。随机森林是多棵**决策树**(decision tree)，与先前介绍的线性回归和多项式回归不同，它可以被理解为分段线性函数的集成。换句话说，通过决策树算法，我们把输入空间细分为更小的区域以更好地管理。

1.  **决策树回归**

决策树算法的一个优点在于: 如果我们处理的是非线性数据，无需对其进行特征转换。在第3章中曾经介绍过，我们迭代地对节点进行划分来构建决策树，直到所有叶子节点的不纯度为 0，或者满足终止条件才停止迭代。当使用决策树进行分类时，定义熵作为不纯度的衡量标准，旨在通过最大信息增益(Information Gain, IG) 对特征进行划分，由此可定义如下二分规则:
$$
IG(D_p, x) = I(D_p) - \frac{1}{N_p} I
$$
其中，$x$ 为待划分特征，$N_p$ 为父节点中样本数量，$I$ 为不纯度函数，$D_p$ 为父节点中训练样本的子集，（D) 和 (D) 为划分后所有节点中样本的数量。请记住，我们的目标是通过特征的划分来使得信息增益最大化，换句话说，我们试图找到使得子节点中信息不纯度最低的特征划分。在第3章汇总，我们使用熵作为不纯度度量，这是用于分类的一个有效标准。为了将决策树用于回归，我们使用 MSE 替代熵作为节点 $t$ 的不纯度度量标准:
$$
I(t) = MSE(t) = \frac {1}{N_p} \sum_{i \in D_t} (y^{(i)} - \hat y_t)^2
$$
其中。$N_t$ 为节点 t 中训练样本的数量，$D_t$ 为节点 t 中训练样本的子集，$y^{(i)}$ 为真实的目标值，$\hat y_t$ 为预测目标值(样本均值):
$$
\hat y_t = \frac {1}{N} \sum_{i \in D_t} y^{(i)}
$$
MSE 用于决策树回归时，也常称为内方差，这就是分裂标准常称为缩减(variance reduction) 的原因。为了知道决策树的拟合效果，我们使用 scikit-learn 中的 DecisionTreeRegressor 类对 MEDV 和 LSTAT 两个变量之间的非线性关系进行建模:

```python
from sklearn.tree import DecisionTreeRegressor

X = df[['LSTAT']].values
y = df['MEDV'].values
tree =  DecisionTreeRegressor(max_depth=3)
tree.fit(X, y)
sort_idx = X.flatten().argsort()
lin_regplot(X[sort_idx], y[sort_idx], tree)
plt.xlabel('% lower status of the population [LSTAT]')
plt.ylabel('Price in $1000\'s [MEDV]')
plt.show()
```

从结果图中可以看到，决策树捕捉到了数据的整体趋势。不过，此模型的一个局限在于: 它无法捕获期望预测的连续型与可导性。此外，我们还需注意要为树选择合适的深度，以免造成过拟合或欠拟合，在此例中，深度为3的树看起来是比较合适的:

![在这里插入图片描述](https://img-blog.csdnimg.cn/2019090221424754.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L0x1Q2gxTW9uc3Rlcg==,size_16,color_FFFFFF,t_70)

下一节，我们将学习一种更鲁棒性的决策树拟合方法: 随机森林。

2.  **随机森林回归**

正如我们在第3章讨论的那样，随机森林算法是组合多棵决策树的一种集成技术。由于随机性有助于降低模型的方差，与单棵决策树相比，随机森林通常具有更好的泛化性能。随机森林的另一个优势在于: 它对数据集中的异常值不敏感，且无需过多的参数调优。随机森林中唯一需要我们通过实验来获得的参数就是待集成决策树的数量。随机森林用于回归的基本方法与我们在第3章中讨论过的随机森林用于分类的方法基本一致。唯一的区别在于: 随机森林回归使用 MSE 作为当棵决策树生成的标准，同时所有决策树预测值的平均数作为预测目标变量的值。

现在，我们使用房屋数据集中的所有特征来拟合一个随机森林回归模型，其中 60% 的样本用于模型的训练，剩余的 40% 用于对模型进行评估，代码如下:

```python
from sklearn.ensemble import RandomForestRegressor

X = df.iloc[:, :-1].values
y = df['MEDV'].values
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.4, random_state=1)
forest = RandomForestRegressor(n_estimators=1000, criterion='mse', random_state=1, n_jobs=-1)
forest.fit(X_train, y_train)
y_train_pred = forest.predict(X_train)
y_test_pred = forest.predict(X_test)
print('MSE train: %.3f, test: %.3f' % (
    mean_squared_error(y_train, y_train_pred),
     mean_squared_error(y_test, y_test_pred)))
print('R^2 train: %.3f, test: %.3f' % (
        r2_score(y_train, y_train_pred),
        r2_score(y_test, y_test_pred)))
```

输出结果:

```reStructuredText
MSE train: 3.235, test: 11.635
R^2 train: 0.960, test: 0.871
```

遗憾的是，我们发现随机森林对于训练数据有些过拟合。不过，它仍旧能够较好地解释目标变量与解释变量之间的关系(在测试数据集上，$R^2$=0.871)

最后，让我们来看一下预测的残差:

```python
plt.scatter(y_train_pred, y_train_pred - y_train, c='black', marker='o', 
            s=35, alpha=0.5, label='Training data')
plt.scatter(y_test_pred, y_test_pred - y_test, c='lightgreen', marker='s', 
            s=35, alpha=0.7, label='Test data')
plt.xlabel('Predicted values')
plt.ylabel('Residuals')
plt.legend(loc='upper left')
plt.hlines(y=0, xmin=-10, xmax=50, lw=2, color='red')
plt.xlim([-10, 50])
plt.show()
```

根据决定系数 $R^2$ 的值可知，模型在训练数据上的拟合效果要好于测试数据，这与下图中 $y$ 轴方向出现异常值所反映的情况一致。此外，残差没有完全随机分布在中心点附近，这意味着模型无法捕获所有的解释信息。不过，与本章前面小节中绘制的线性模型的残差图相比，随机森林回归的残差图有了很大的改进:

![在这里插入图片描述](https://img-blog.csdnimg.cn/20190902214313729.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L0x1Q2gxTW9uc3Rlcg==,size_16,color_FFFFFF,t_70)

>   :bookmark: 在第3章中，我们已经讨论过核技巧，并将其应用到了支持向量机(SVM) 的分类中，若需要处理非线性问题，此技巧是非常有用的。虽然此话题已经超出了本书的范围，但是支持向量机的确可以用于非线性回归任务。关于支持向量机在回归中的应用问题，S.R.Gunn 在其报告中做了精彩的论述: S.R.Gunn et al. Vector Machines for Classification and Regression.(ISIS technical report, 14, 1998)，感兴趣的读者都可以通过此文件了解更多信息。scikit-learn 中已经实现了支持向量机的回归模型，关于其详细信息请见链接: http://scikit-learn.org/stable/modules/generated/sklarn.svm,SVR.html#sklearn.svm.SVR 。

# 10.8 本章小结

本章开始，我们学习了如何使用简单回归模型对单个解释变量和连续目标变量之间的关系进行建模。进而，我们讨论了一种用于了解数据中模式与异常点的解释性数据分析技术，这是预测模型构建中最重要的一步。

基于梯度的方法，我们构建并实现了第1个线性回归模型。我们学习了如何使用 scikit-learn 中的线性回归模型，并且针对异常值的处理实现了一个鲁棒性的线性回归模型(RANSAC)。为了更深入了解回归模型的预测性能，我们计算了误差平方和的平均值，以及 R2 等衡量标准。此外，我们还讨论了一种诊断回归模型所存在问题的图像化方法: 残差图。

之后，我们讨论了如何将正则化方法应用于回归模型，以降低模型复杂度及避免过拟合，此外还介绍了非线性关系建模的几种方法，包括多项式特征转换和随机森林回归。

在前面的章节中，我们详细介绍了监督学习、分类以及回归分析的相关内容。下一章中，我们将讨论机器学习的另一个有趣的子领域: 无监督学习。届时，读者将学到如何使用聚类分析在无目标变量的情况下挖掘数据中的潜在结构。

[^1]: Automatic Estimation of the Inlier Threshold in Robust Multiple Structures Fitting, in Image Analysis and Processing-ICIAP 2009, pages 123-131. Springer, 2009.

