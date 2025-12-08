# 第11章：聚类分析

GitHub Notebook 地址: https://nbviewer.jupyter.org/github/rasbt/python-machine-learning-book/blob/master/code/ch11/ch11.ipynb

在前面的章节中，使用了监督学习技术来构建机器学习模型，其中训练数据都是事先已知预测结果的，即训练数据中已提供了数据的类标。在本章中，我们将转而研究聚类分析，它是一种无监督学习(unsupervised learning) 技术，可以在事先不知道正确结果(即无类标信息或逾期输出值)的情况下，发现数据本身所蕴含的结构等信息。聚类的目标是发现数据中自然形成的分组，使得每个簇内样本的相似度大于其他簇内样本的相似性。

由于聚类本身带有探索的性质，因此更能激发人们的兴趣。本章通过学习如下概念，我们能够更加有效地组织数据:

-   使用 KMeans 算法发现簇中心
-   使用自底向上的方法构建层次聚类树
-   基于密度聚类方法发现任意形状簇

## 1. 使用KMeans算法对相似对象进行分组

本节将讨论一种最流行的聚类算法: KMeans 算法，它在学术领域及业界都得到了广泛应用。聚类(或称为聚类分析)是一种可以找到相似对象群组的技术，与组间对象相比，组内对象之间具有更高的相似度。聚类在商业领域的应用包括: 按照**不同主题**对文档、音乐、电影等进行分组，或基于常见的购买行为，发现有相同兴趣爱好的顾客，并以此构建推荐引擎。

读者稍后将看到，与其他聚类算法相比，KMeans 算法易于实现，且具有很好的计算效率，这也许就是它得到广泛使用的原因。KMeans 算法是基于原型的聚类。在本章的后续内容汇总，我们还将讨论另外两种聚类: **层次聚类**(hierarchical cluster)和**基于密度的聚类**(density-based cluster)。基于原型的聚类意味着每个簇都对应一个原型，它可以是一些具有连续型特征的相似点的**中心点**(centerid)(平均值)，或者是类别特征情况下相似点的众数(medoid)——最典型或是出现频率最高的点。虽然 KMeans 算法高效识别球形簇，但是此算法的缺点在于必须事先指定先验的簇数量 k。如果 k 值选择不当，则可能导致聚类效果不佳。本章后续还将讨论**肘**(elbow)方法和**轮廓图**(silhouette plot)，它们可以用来评估聚类效果，并帮助我们选出最优 k 值。

尽管 KMeans 聚类适用于高维数据，但是出于可视化需要，我们将使用一个二维数据集的例子进行演示:

```python
from sklearn.datasets import make_blobs
import matplotlib.pyplot as plt

X, y = make_blobs(n_samples=150, n_features=2, centers=3, 
				  cluster_std=0.5, shuffle=True, random_state=0)
plt.scatter(X[:, 0], X[:, 1], c='white', marker='o', s=50)
plt.grid()
plt.show()
```

我们刚才创建的数据集包含 150 个随机生成的点，它们大致分为三个高密度区域，其二维散点图如下:

![](https://mingminyu.github.io/webassets/images/20251208/121.png)

在聚类算法的实际应用中，我们没有任何关于这些样本的类别基础信息；否则算法就要划分到监督学习的范畴了。由此，我们的目标就是根据样本自身特征的相似性对其进行分组，对此可采用 KMeans 算法，具有有如下四个步骤:

1.  从样本点中堆积选择 K 个点作为初始簇中心
2.  将每个样本点划分到距离它最近的中心点 $\mu^{(i)}, j \in \{1,\cdots,k \}$ 所代表的簇中
3.  用各簇中所有样本的中心点替代原有的中心点
4.  重复步骤2和3，直到中心点不变或者达到预定迭代次数时，算法终止

现在面临的一个问题就是: 如何度量对象至今的相似性？我们可以将相似性定义为距离的倒数，在 $m$ 维空间中，对于特征取值为连续型的聚类分析来说，常用的距离度量标准是欧几里得距离的平方:
$$
d(x, y)^2 = \sum_{j=1}^m (x_j - y_j)^2 = ||x - y||_2^2
$$
请注意，在前面的公式中，下标索引 $j$ 为样本点 $x$ 和 $y$ 的第 $j$ 个维度(特征列)。本节后续内容将分别使用上标 $i$ 和下标 $j$ 来代表样本索引和簇索引。

基于欧几里得度量标准，我们可以使用 KMeans 算法描述一个简单的优化问题，通过迭代使得簇内误差平方和(within-cluster sum of squared errors，SSE)，也称为**簇惯性**(cluster intertia)
$$
SSE = \sum_{i=1}^n \sum_{j=1}^k w^{(i, j)} = ||x^{(i)} - \mu^{(j)} ||_2^2
$$
其中，$\mu^{(i)}$ 为簇 $j$ 的中心点，如果样本 $x^{(i)}$ 属于簇 $j$，则有 $w^{(i,j)}=1$，否则 $w^{(i,j)}=0$。

至此，我们已经知道了简单 KMeans 算法的工作原理，现在借助 scikit-learn 中的 KMeans 类将 KMeans 算法应用于我们的示例数据集:

```python
from sklearn.cluster import KMeans

km = KMeans(n_clusters=3, init='random', n_init=10,
			max_iter=300, tol=1e-04, random_state=0)
y_km = km.fit_predict(X)
```

使用上述代码，我们将簇数量设定为 3个；指定先验的簇数量是 KMeans 算法的一个缺陷，设置 `n_init=10`，程序能够基于不同的随机初始中心点独立运行算法 10次，并从中选择 SSE 最小的作为最终模型。通过 `max_iter` 参数，指定算法每轮运行的迭代次数(在本例中为 300次)。**请注意**，在 scikit-learn 对 KMeans 算法的实现中，如果模型收敛了，即使未达到预定迭代次数，算法也将终止。

不过，在 KMeans 算法的某轮迭代中，可能会发生无法收敛的情况，特别是当我们设置了较大的 `max_iter` 值时，更有可能产生此类问题。解决收敛问题的一个方法就是 `tol` 参数设置一个较大的值，此参数控制对簇内误差平方和的容忍度，此容忍度用于判定算法是或否收敛。在上述代码中，我们设置的容忍度为 0.0001 。

### 1.1 KMeans++

到目前为止，我们已经讨论了经典的 KMeans 算法，它使用随机点作为初始中心点，若初始中心点选择不当，有可能会导致簇效果不佳或产生收敛速度慢等问题。解决此问题的一种方案就是在数据集上多次运行 KMeans 算法，并根据误差平方和(SSE) 选择性能最好的模型。另一种方案就是使用 KMeans++ 算法让初始中心点彼此尽可能远离，相比传统 KMeans 算法，它能够产生更好、更一致的结果[^1]。

KMeans++ 算法初始化过程可以概括如下:

1.  初始化一个空的集合 M，用于存储选定的 K 个中心点。
2.  从输入样本中随机选定第一个中心点 $\mu^{(j)}$，并将其加入到集合 M 中。
3.  对于集合 M 之外的任一样本点 $x^{(i)}$，通过计算找到与其平方距离最小的样本 $d(x^{(i)},M)^2$。
4.  使用加权概率分布 $\frac {d(\mu^{(p)}, M)^2}{\sum_i d(x^{(i)}, M)^2}$ 来随机选择下一个中心点 $\mu^{(p)}$。
5.  重复步骤 2、3，直到选定 K 个中心点。
6.  基于选定的中心点执行 KMean 算法。

>   通过 scikit-learn 的 KMeans 对象来实现 KMeans++ 算法，只需将 `init` 参数的值 `random` 替换为 KMeans++(默认值) 即可。

KMeans 算法还有另外一个问题，就是一个或多个簇的结果可能为空。但 k-medoids 或者模糊 C-means 算法中不存在这种问题，我们将在下一小节讨论这两种算法。不过，此问题在当前 scikit-learn 实现的 KMeans 算法中是存在的。如果某个簇为空，算法将搜索距离空簇中心点最远的样本，然后将此最远样本点作为中心点。

>   :bookmark: 当我们使用**欧几里得**距离作为度量标准将 KMeans 算法应用到真实数据中时，需要保证所有特征值的范围处于相同尺度，必要时可使用 **z-score 标准化**或**最小-最大缩放**方法对数据进行预处理。

我们已经将簇结果存储在 `y_km` 中，并且讨论了 KMeans 算法面临的挑战，现在对 KMeans 算法的簇结果及其相应的簇中心做可视化展示。簇中心保存在 KMeans 对象的 `centers_` 属性中:

```python
plt.scatter(X[y_km == 0, 0], X[y_km == 0, 1], s=50,
			c='lightgreen', marker='s', label='cluster 1')
plt.scatter(X[y_km == 1, 0], X[y_km == 1, 1], s=50,
			c='orange', marker='o', label='cluster 2')
plt.scatter(X[y_km == 2, 0], X[y_km == 2, 1], s=50,
			c='lightblue', marker='v', label='cluster 3')
plt.scatter(X[y_km == 3, 0], X[y_km == 3, 1], s=250,
			c='red', marker='*', label='centerids')
plt.legend()
plt.grid()
plt.show()
```

在下面的散点图中，我们可以看到，通过 KMeans 算法得到的 3个中心点位于各球状簇的圆心位置，在此数据集上，分组结果看起来是合理的。

虽然 KMeans 算法在这一简单数据集上运行良好，但我们还要注意 KMeans 算法面临的一些挑战。KMeans 的缺点之一就是我们必须指定一个先验的簇数量 k，但在实际应用中，簇数量并非总是显而易见的，特别当我们面对的是一个无法可视化展现的高维数据集。KMeans 的另一个特点就是簇不可重叠，也不可分层，并且假定每个簇至少会有一个样本。

![](https://mingminyu.github.io/webassets/images/20251208/122.png)

[^1]: D.Arthur and S.Vassilvitskii.k-means++: The Advantages of Careful Seeding. In Proceedings of the eighteenth annual ACM-SIAM symposium on Discrete algorithms, pages 1027-1035. Society for Industrial and Applied Mathematics, 2007. 

### 1.2 硬聚类与软聚类

**硬聚类**(hard clustering) 指的是数据集中每个样本只能划至一个簇的算法，例如我们在上一小节中讨论过的 KMeans 算法。相反，**软聚类**(soft clustering，有时也称作**模糊聚类**(fuzzy clustering)) 算法可以将一个样本划分到一个或者多个簇。一个常见的软聚类算法是**模糊 C-means**(fuzzy C-means，FCM) 算法(也称为 soft k-menas 或者 fuzzy k-means)。关于软聚类的最初构想可以追溯到 20世纪70年代，当时 Joseph C.Dunn 第一个提出了模糊聚类的早期版本，以提高 KMeans 的性能[^2]。10 年之后，James C.Bedzek 发表了他对模糊聚类算法进行改进的研究成果，即 FCM 算法[^3]。

FCM 的处理过程与 KMeans 十分相似。但是，我们使用每个样本点隶属于各簇的概率来替代硬聚类的划分。在 KMeans 中，我们使用二进制稀疏向量来表示各簇所含样本:
$$
\begin{bmatrix}
\mu^{(1)} \to 0 \\
\mu^{(2)} \to 1 \\
\mu^{(3)} \to 0
\end{bmatrix}
$$
其中，位置索引的值为 1 表示样本属于簇中心 $\mu^{(j)}$ 所在的簇(假定 k=3，则 $j \in \{1,2,3\}$)。相反，FCM 中的成员隶属向量可以表示如下:
$$
\begin{bmatrix}
\mu^{(1)} \to 0.1 \\
\mu^{(2)} \to 0.85 \\
\mu^{(3)} \to 0.05
\end{bmatrix}
$$
这里，每个值都在区间 `[0, 1]` 内，代表样本属于相应簇中心所在簇的概率。对于给定样本，其隶属于各簇的概率之和为 1。与 KMeans 算法类似，我们可以将 FCM 算法总结为四个核心步骤:

1.  指定 K 个中心点，并随机将每个样本点划分至某个簇。
2.  计算各簇中心 $\mu^{(j)}, j \in \{1,\cdots,k\}$。
3.  更新各样本所属簇的成员隶属度。
4.  重复步骤2、3，直到各样本点所属簇成员隶属度不变，或是达到用户自定义的容差阈值或最大迭代次数。

可以将 FCM 的目标函数简写为 $J_m$，它看起来与 KMeans 中需要最小化计算的簇内误差平方和(within cluster sum-squared-error) 很相似:
$$
J_m = \sum_{i=1}^n \sum_{j=1}^k w^{m(i,j)} || x^{(i)} -\mu^{(j)} ||_2^2, m \in [1, \infty]
$$
不过请注意: 此处的成员隶属度 $w^{(i,j)}$ 不同于 KMeans 算法中的二进制值( $w^{(i,j)} \in \{0,1\}$)，它是一个实数，表示样本隶属于某个簇的概率($w^{(i,j)} \in [0,1]$)。读者也许注意到了，我们在 $w^{(i,j)}$ 中增加了额外的一个指数 m，一般情况下其取值范围是大于等于 1 的整数(通常 m=2)，也称为**模糊系数**(fuzzy coefficient，或直接就叫**模糊器**(fuzzier))，用来控制模糊的程度。模糊聚类中，m 的值越大则成员隶属度 $w^{(i,j)}$ 越小。样本点属于某个簇的概率计算公式如下:
$$
w^{(i,j)} = \large [ \sum_{p=1}^k (\frac {||x^{(i)} - \mu^{(j)}||_2}{||x^{(i)} - \mu^{(p)}||_2})^{\frac {2}{m-1}} \large]^{-1}
$$
如同前面的 KMeans 例子，在此依旧使用 3个簇中心，可通过以下方式计算出样本 $x^{(i)}$ 属于簇 $\mu^{(j)}$ 的隶属度:
$$
w^{(i,j)} = \large [ (\frac {||x^{(i)} - \mu^{(j)}||_2}{||x^{(i)} - \mu^{(1)}||_2})^{\frac {2}{m-1}} 
+ (\frac {||x^{(i)} - \mu^{(j)}||_2}{||x^{(i)} - \mu^{(2)}||_2})^{\frac {2}{m-1}}
+ (\frac {||x^{(i)} - \mu^{(j)}||_2}{||x^{(i)} - \mu^{(3)}||_2})^{\frac {2}{m-1}}
\large]^{-1}
$$
以样本属于特定簇的隶属度为权重，此簇中心 $\mu^{(j)}$ 可以通过所有样本的加权均值计算得到:
$$
\mu^{(j)} = \frac {\sum_{i=1}^n w^{m(i,j)}x^{(i)}}{\sum_{i=1}^n w^{m(i,j)}}
$$
仅就计算样本数据簇的隶属度公式来说，直观上看，FCM 的单次迭代计算成本比 KMeans 的要高，但是 FCM 通常只需要较少的迭代次数便能收敛。遗憾的是，scikit-learn 目前还未实现 FCM 算法。不过，正如 Soumi Ghosh 与 Sanjay K.Dubey 的研究[^4] 所述，实际应用中 KMeans 和 FCM 算法通常会得到较为相似的结果。

[^2]: J.C.Dunn. A Fuzzy Relative of the Isodata Process and its Use in Detecting Compact Well-separated Clusters. 1973.
[^3]: J.C.Bezdek. Pattern Recognition with Fuzzy Object Function Algorithms. Springer Science & Business Media, 2013.
[^4]: S.Ghosh and S.K.Dubey. Comparative Analysis of KMeans and Fuzzy c-means Alogorithms. IJASCSA, 4:35-38, 2013.

### 1.3 使用肘方法确定簇的最佳数量

无监督学习中存在一个问题，就是我们并不知道问题的确切答案。由于没有数据集样本类标的确切数据，所以我们无法在无监督学习中使用第6章中用来评估监督学习模型性能的相关技术。因此，为了对聚类效果进行定量分析，我们需要使用模型内部的固有度量来比较不同的 KMeans 聚类结果的性能，例如本章先前讨论的簇内误差平方和(即聚类偏差)。在完成 KMeans 模型的拟合后，簇内误差平方和可以通过 `inertia` 属性来访问，因此，我们无需再次计算就可以直接拿来使用。

```python
print('Distortion: %.2f' % km.inertia_)
```

输出结果:

```reStructuredText
Distortion: 72.48
```

基于簇内误差平方和，我们可使用图形工具，即所谓的肘方法，针对给定任务估计出最优的簇数量 k。直观地看，增加 k 的值可以降低聚类偏差。这是因为样本会更加接近其所在簇的中心点。肘方法的基本理念就是找出聚类偏差骤增时的 k 值，我们可以绘制不用 k 值对应的聚类偏差图，以做更清晰的观察:

```python
distortions = []
for i in range(1, 11):
	km = KMeans(n_clusters=i, init='k-means++', n_init=10, 
				max_iter=300, random_state=0)
	km.fit(X)
	distortions.append(km.inertia_)
plt.plot(range(1, 11), distortions, marker='o')
plt.xlabel('Number of clusters')
plt.ylabel('Distortion')
plt.show()
```

如下图，当 k=3 时图案呈现了肘型，这标明对于此数据集来说，k=3 的确实一个号的选择:

![](https://mingminyu.github.io/webassets/images/20251208/123.png)

### 1.4 通过轮廓图定量分析聚类质量

另一种评估聚类质量的定量分析方法是**轮廓分析**(silhouette analysis)，此方法也可用于 KMeans 之外的聚类方法。轮廓分析可以使用一个图形工具来度量簇中样本聚集的密集程度。通过如下三个步骤，我们可以计算三个步骤，我们可以计算数据集中单个样本的**轮廓系数**(silhouette coefficient)。

1.  将某一个样本 $x^{(i)}$ 与簇类其他点之间的平均距离看作是簇的内聚度 $a^{(i)}$。
2.  将样本 $x^{(i)}$ 与其最近簇中所有点之间的平均距离看作是与下一最近簇的分离度 $b^{(i)}$。
3.  将簇分离度与簇内聚度之差除以二者中的较大者得到轮廓系数，如下式所示:

$$
s^{(i)} = \frac {b^{(i)} - a^{(i)}} {max(b^{(i)}, a^{(i)})}
$$

轮廓系数的值介于 -1 到 1之间。从上式可见，若簇内聚度与分离度相等($b^{(i)} = a^{(i)}$)，则轮廓系数值为 0.此外，由于 $b^{(i)}$ 衡量样本与其他簇内样本间的差异程度，而 $a^{(i)}$ 表示样本与簇内其他样本的相似程度。因此，如果 $b^{(i)} >> a^{(i)}$，我们可以近似得到一个值为 1的理想轮廓系数。

轮廓系数可通过 scikit-learn 中 `metric` 模块下的 `silhouette_samples` 计算得到，也可以选择使用 `silhouette_scores`。后者计算所有样本点的轮廓系数均值，等价于 `numpy.mean(silhouette_samples(...))`。执行下面的代码，我们可以绘制出 k=3 时 KMeans 算法的轮廓系数图:

```python
import numpy as np
from matplotlib import cm
from sklearn.metrics import silhouette_samples

km = KMeans(n_clusters=3, n_init='k-means++', n_init=10,
			max_iter=300, tol=1e-04, random_state=0)
y_km = km.fit_predict(X)
cluster_labels = np.unique(y_km)
n_clusters = cluster_labels.shape[0]
silhouette_vals = silhouette_samples(X, y_km, metric='euclidan')
y_ax_lower, y_ax_upper = 0, 0
yticks = []

for i, c in enumerate(cluster_labels):
	c_silhouette_vals = silhouette_vals[y_km == c]
	c_silhouette_vals.sort()
	y_ax_upper += len(c_silhouette_vals)
	color = cm.jet(i / n_clusters)
	plt.barh(range(y_ax_lower, y_ax_upper), c_silhouette_vals,
			 height=1.0, edgecolor='none', color=color)
	yticks.append((y_ax_lower + y_ax_upper) / 2)
	y_ax_lower += len(c_silhouette_vals)
silhouette_avg = np.mean(silhouette_vals)
plt.axvline(silhouette_avg, color='red', linestyle='--')
plt.yticks(yticks, cluster_labels+1)
plt.ylabel('Cluster')
plt.xlabel('Silhouette coefficient')
plt.show()
```

通过观察轮廓图，我们可以快速知晓不同簇的大小，而且能够判断簇中是否包含异常点。

![](https://mingminyu.github.io/webassets/images/20251208/124.png)

由上图可见，轮廓系数未接近 0 点，此指标显示聚类效果不错。此外，为了评价聚类效果的优劣，我们在图中增加了轮廓系数的平均值(虚线)。

为了解聚类效果不佳的轮廓图的形状，我们使用两个中心点来初始化 KMeans 算法:

```python
km = KMeans(n_clusters=2, init='k-means++', n_init=10, 
			max_iter=300, tol=1e-04, random_state=0)
y_km = km.fit_predict(X)
plt.scatter(X[y_km==0, 0], X[y_km==0, 1], s=50, c='lightgreen',
			marker='s', label='cluster 1')
plt.scatter(X[y_km==1, 0], X[y_km==1, 1], s=50, c='orange',
			marker='o', label='cluster 2')
plt.scatter(km.cluster_centers_[:, 0], km.cluster_centers_[:, 1], 
			s=250, c='red', marker='*', label='centroids')
plt.legend()
plt.grid()
plt.show()
```

由下图可见，样本点形成了三个球状分组，其中一个中心点落在了两个球状分组的中间。尽管聚类结果看上去不是特别糟糕，但它并不是最合适的结果。

![](https://mingminyu.github.io/webassets/images/20251208/122.png)

接下来，我们绘制轮廓图对聚类结果进行评估。请记住，在实际应用中，我们常常处理的是高维数据，因此并不奢望使用二维散点图对数据集记性可视化。

```python
cluster_labels = np.unique(y_km)
n_clusters = cluster_labels.shape[0]
silhouette_vals = silhouette_samples(X, y_km, metric='euclidan')
y_ax_lower, y_ax_upper = 0, 0
yticks = []

for i, c in enumerate(cluster_labels):
	c_silhouette_vals = silhouette_vals[y_km == c]
	c_silhouette_vals.sort()
	y_ax_upper += len(c_silhouette_vals)
	color = cm.jet(i / n_clusters)
	plt.barh(range(y_ax_lower, y_ax_upper), c_silhouette_vals,
			 height=1.0, edgecolor='none', color=color)
	yticks.append((y_ax_lower + y_ax_upper) / 2)
	y_ax_lower += len(c_silhouette_vals)
	yticks.append((y_ax_lower + y_ax_upper) / 2)
	y_ax_lower += len(c_silhouette_vals)
silhouette_avg = np.mean(silhouette_vals)
plt.axvline(silhouette_avg, color='red', linestyle='--')
plt.yticks(yticks, cluster_labels+1)
plt.ylabel('Cluster')
plt.xlabel('Silhouette coefficient')
plt.show()
```

由结果图像可见，轮廓具有明显不同的长度和宽度，这更进一步证明该聚类并非最优结果。

![](https://mingminyu.github.io/webassets/images/20251208/126.png)

## 2. 层次聚类

在本节中，我们将学习另一种基于原型的聚类: **层次聚类**(hierarchical clustering)。层次聚类的算法的一个优势在于: 它能够使我们绘制出**树状图**(dendrogram，基于二叉层次聚类的可视化)，这有助于我们使用有意义的分类法解释聚类效果。层次聚类的另一优势在于我们无需事先指定簇数量。

层次聚类有两种主要方法: **凝聚**(agglomerative) 层次聚类和**分裂**(divisible)层次聚类。在分裂层次聚类中，我们首先把所有样本看作是在同一个簇中，然后迭代地将簇划分为更小的簇，直到每个簇只包含一个样本。本节我们将主要介绍凝聚层次聚类，它与分裂层次聚类相反，最初我们把每个样本都看作是一个单独的簇，重复地将最近的一对簇进行合并，直到所有的样本都在一个簇中为止。

在凝聚层次聚类汇总，判断簇间距离的两个标准方法分别是**单连接**(single linkage)和**全连接**(complete linkage)。我们可以使用单连接方法计算每一对簇中最相似两个样本的距离，并合并距离最近的两个样本所属簇。与之相反，全连接的方法是通过比较找到分布于两个簇中最不相似的样本(距离最远的样本)，进而完成簇的合并。如下图所示:

![](https://mingminyu.github.io/webassets/images/20251208/125.png)

>   :bookmark: 凝聚层次剧烈中其他常用的方法还有**平均连接**(average linkage)和 **ward 连接**(ward linkage)。使用平均连接时，合并两个簇间所有成员间平均距离最小的两个簇。当使用 ward 连接时，被合并的是使得 SSE 增量最小的两个簇。

在本节，我们将重点关注基于全连接方法的凝聚层次剧聚类，其迭代过程可总结为如下:

1.  计算得到所有样本间的距离矩阵
2.  将每个数据点看作是一个单独的簇
3.  基于最不相似(距离最远)样本的距离，合并两个最接近的簇
4.  更新相似矩阵(样本间距离矩阵)
5.  重复步骤2到4，直到所有样本都合并到一个簇为止

现在我们来讨论一下如何计算距离矩阵(步骤1)。在此之前，需要先随机生成一些样本数据用于计算。其中行代表不同的样本(ID 值从 0 到 4)，列代表样本的不同特征(X, Y, Z)。

```python
import pandas as pd
import numpy as np
np.random.seed(123)
variables = ['X', 'Y', 'Z']
labels = ['ID_%d' % i for i range(5)]
X = np.random.random_sample([5, 3]) * 10
df = pd.DataFrame(X, columns=variables, index=lables)
```

执行上述代码后，可以得到如下距离矩阵:

|      |        X |        Y |        Z |
| ---: | -------: | -------: | -------: |
| ID_0 | 6.964692 | 2.861393 | 2.268515 |
| ID_1 | 5.513148 | 7.194690 | 4.231065 |
| ID_2 | 9.807642 | 6.848297 | 4.809319 |
| ID_3 | 3.921175 | 3.431780 | 7.290497 |
| ID_4 | 4.385722 | 0.596779 | 3.980443 |

### 2.1 基于距离矩阵进行层次聚类

我们使用 SciPy 中 `spatial.distinct` 子模块下的 `pdist` 函数来计算距离矩阵，此矩阵作为层次聚类算法的输入:

```python
from scipy.spatial.distance import pdist, squareform

row_dist = pd.DataFrame(squareform(pdist(df, metric='euclidan')),
				columns=labels, index=labels)
```

在上述代码中，我们基于样本的特征 X、Y 和 Z，使用欧几里得距离计算了样本间的两两距离。通过将 `pdist` 函数的返回值输入到 `squareform` 函数中，我们得到了一个记录成对样本间距离的对称矩阵:

|      |     ID_0 |     ID_1 |     ID_2 |     ID_3 |     ID_4 |
| ---: | -------: | -------: | -------: | -------: | -------: |
| ID_0 | 0.000000 | 4.973534 | 5.516653 | 5.899885 | 3.835396 |
| ID_1 | 4.973534 | 0.000000 | 4.347073 | 5.104311 | 6.698233 |
| ID_2 | 5.516653 | 4.347073 | 0.000000 | 7.244262 | 8.316594 |
| ID_3 | 5.899885 | 5.104311 | 7.244262 | 0.000000 | 4.382864 |
| ID_4 | 3.835396 | 6.698233 | 8.316594 | 4.382864 | 0.000000 |

下面我们使用 SciPy 中 `cluster.hierarchy` 子模块下的 `linkage` 函数，此函数以全连接作为距离判定标准，它能够返回一个所谓的**关联矩阵**(linkage matrix)。

不过在调用 `linkage` 函数之前，我们先仔细研究此函数相关的文档信息:

```python
from scipy.cluster.hierarchy import linkage
help(linkage)
```

从对函数的描述中可知: 我们可以将由 `pdist` 函数得到的稠密矩阵(上三角)作为输入项。或者，将初始化的欧几里得矩阵(将矩阵参数项的值设定为 `euclidean`) 作为 `linkage` 的输入。不过，我们不应该使用前面提及的用 `squareform` 函数得到的距离矩阵，因为这会生成与预期不同的距离值。综合来讲，这里可能出现三种不同的情况:

-   错误的方法: 在本方法中，我们使用了通过 `squareform` 函数得到的距离矩阵，代码如下:

```python
from scipy.cluster.hierarchy import linkage
row_clusters = linkage(row_dist, method='complete', metric='euclidan')
```

-   正确的方: 在本方法中，我们使用了稠密距离矩阵，代码如下:

```python
row_clusters = linkage(pdist(df, metric='euclidan'), method='complete')
```

-   正确的方法: 在本方法中，我们以矩阵格式的示例数据作为输入，代码如下:

```python
row_clusters = linkage(df.values, method='complete', metric='euclidan')
```

为了更进一步分析聚类结果，我们通过下面的方式将数据转换为 pandas 的 DataFrame 格式(最好在 IPython Notebook 中使用):

```python
pd.DataFrame(row_clusters,
     index=['culster %d' % (i+1) for i in range(row_clusters.shape[0])]
	 columns=['row label 1', 'row label 2', 'distince', 'no. of items in clust.'])
```

如下表所示，关联矩阵包含多行，每行代表一次簇的合并。矩阵的第一列和第二列分别表示每个簇中最不相似(距离最远)的样本，第三列为这些样本间的距离，最后一列为每个簇中样本的数量。

|           | row label 1 | row label 2 |  distance | no. of items in clust. |
| --------: | ----------: | ----------: | --------: | ---------------------: |
| cluster 1 |         0.0 |         4.0 |  6.521973 |                    2.0 |
| cluster 2 |         1.0 |         2.0 |  6.729603 |                    2.0 |
| cluster 3 |         3.0 |         5.0 |  8.539247 |                    3.0 |
| cluster 4 |         6.0 |         7.0 | 12.444824 |                    5.0 |

现在我们已经完成了关联矩阵的计算，下面采用树状图的形式对聚类结果进行可视化展示:

```python
from scipy.cluster.hierarchy import dendrogram

# make dendrogram black (part 1/2)
# from scipy.cluster.hierarchy import set_link_color_palette
# set_link_color_palette(['black'])
row_dendr = dendrogram(row_clusters, labels=labels)
# row_dendr = dendrogram(row_clusters, labels=labels, color_threshold=np.inf)
plt.tight_layout()
plt.ylabel('Euclidean distance')
plt.show()
```

如果是通过执行上述代码生成的图像，或者阅读本书的电子版本，会发现树状图的分支使用了不同的颜色。着色方案来自 matplotlib 的一个色彩列表，它基于树状图中的距离阈值循环生成不同的颜色。例如，通过删除上述代码中相关注释符，就可以使用黑色来绘制此树状图。

![](https://mingminyu.github.io/webassets/images/20251208/129.png)

此树状图描述了采用凝聚层次聚类合并生成不同簇的过程。例如，从图中可见，首先是 ID_0 和 ID_4 合并，接下来是 ID_1 和 ID_2 合并，也就是基于欧几里得距离矩阵，选择最不相似的样本进行合并。

### 2.2 树状图与热度图的关联

在实际应用中，层次聚类的树状图通常与热度图(heat map) 结合使用，这样我们可以使用不同的颜色来代表样本矩阵中的独立值。在本节中，我们讨论如何将树状图附加到热度图上，并同时显示在一行上。

不过，将树状图与热度图结合还是需要一点小技巧的，我们将逐步介绍这一步骤:

1.  创建一个 `figure` 对象，并通过 `add_axes` 属性来设定 x 轴位置、y 轴位置，以及树状图的宽度和高度。此外，我们沿逆时针方向将树状图旋转 90度，代码如下:

```python
fig = plt.figure(figsize=(8, 8))
axd = fig.add_axes([0.09, 0.1, 0.2, 0.6])
row_dendr = dendrogram(row_clusters, orientation='right')
```

2.  接下来，我们根据树状图对象中的簇类标重排初始化数据框(DataFrame) 对象中的数据，它本质上是一个 Python 字典，，可通过 `leaves` 键访问得到，代码如下:

```python
df_rowclust = df.ix[row_dendr['leaves'][::-1]]
```

3.  基于重排后的数据框(DataFrame) 数据，在树状图的右侧绘制热度图:

```python
axm = fig.add_axes([0.23, 0.1, 0.6, 0.6])
cax = axm.matshow(df_rowclust, interpolation='nearest', cmap='hot_r')
```

4.  最后，为了美化效果，我们删除了坐标轴标记，并将坐标轴的刻度隐藏。此外，我们还加入了色条，并分别在 x 和 y 轴上显示特征名和样本 ID 名称。代码如下:

```python
axd.set_xticks([])
axd.set_yticks([])
for i in axd.spines.values():
	i.set_visible(False)
fig.colorbar(cax)
axm.set_xticklabels([''] + list(df_rowclust.columns))
axm.set_yticklabels([''] + list(df_rowclust.columns))
plt.show()
```

通过上述步骤，便可看到热度图和树状图并列显示的图像:

![](https://mingminyu.github.io/webassets/images/20251208/130.png)

如上图所示，热度图中的行反映了树状图中样本聚类的情况。除了简单的树状图外，热度图中用颜色代表的各样本及其特征为我们提供了关于数据集的一个良好的概括。

### 2.3 通过 scikit-learn 进行凝聚聚类

在本节中，我们将使用 scikit-learn 进行基于凝聚的层次聚类。不过，scikit-learn 中已经实现了一个 `AgglomerativeClustering` 类，它允许我们选择返回簇的数量。当我们想要对层次聚类树进行剪枝时，这个功能是非常有用的。将参数 `n_cluster` 的值设定为 2，我们可以采用与前面相同的完全连接方法，基于欧几里得距离矩阵，将样本划分为两个簇:

```python
from sklearn.cluster import AgglomerativeClustering

ac = AgglomerativeClustering(n_clusters=2, affinity='euclidan', linkage='complete')
labels = ac.fit_predict(X)
print('Cluster labels: %s' % labels)
# Cluster labels: [0 1 1 0 0]
```

通过对簇类标的预测结果进行分析，我们可以看出: 第一、第四、第五个(ID_0，ID_3 和 ID_4) 样本被划分至第一个簇(ID_0)，样本 ID_1 和 ID_2 被划分到第二个簇(1)，这与此外通过树状图得到的结果一致。

## 3. 使用DBSCAN划分高密度区域

尽管无法在本章中介绍大量的聚类算法，但我们至少可以再介绍另一种聚类方法: (包含噪声情况下) 基于密度空间的聚类算法(Density-based Spatial Clustering of Applications with Noise，DBSCAN)。在 DBSCAN 中，密度被定义为指定半径 $\varepsilon$  范围内样本点的数量。

在 DBSCAN 中，基于以下标准，每个样本点(点)都被赋予一个特殊的标签:

-   如果在一个点周边的指定半径内，其他样本点的数量不小于指定数量(MinPts)，则此样本点称为**核心点**(core point)。
-   在指定半径 $\varepsilon$  内，如果一个点的邻居点少于 MinPts 个，但是却包含一个核心点，则此点称为**边界点**(border point)。

-   除了核心点和边界点外的其他样本点称为**噪声点**(noise point)。

完成对核心点、边界点和噪声点的标记后，DBSCAN 算法可总结为两个简单的步骤:

1.  基于每个核心点或者一组相连的核心点(如果核心点的距离很近，则将其看作是相连的) 形成一个单独的簇。
2.  将每个边界点划分到其对应核心点所在的簇中。

在实现具体算法之前，为了让读者对 DBSCAN 有个更好的直观认识，我们通过下图来了解核心点、边界点和噪声点:

![](https://mingminyu.github.io/webassets/images/20251208/131.png)

与 KMneans 算法不同，DBSCAN 的簇空间不一定是球状的，这也是此算法的优势之一。此外，不同于 KMeans 和层次聚类，由于 DBSCAN 可以识别并移除噪声点，因此它不一定回将所有的样本点都划分到某一簇中。

为了给出一个更能说明问题的例子，我们创建了一个半月形结构的数据集，以对 KMeans 聚类、层次聚类和 DBSCAN 聚类进行比较:

```python
from sklearn.datasets import make_moons

X, y = make_moons(n_samples=200, noise=0.05, random_state=0)
plt.scatter(X[:, 0], X[:, 1])
plt.show()
```

由结果图像可见，数据集明显被划分为两个半月形的分组，每个分组包含 100 个样本点:

![](https://mingminyu.github.io/webassets/images/20251208/132.png)

我们首先使用前面讨论过的 KMeans 算法和基于全连接的层次聚类算法，看它们是否能够成功识别出半月形的簇。代码如下:

```python
f, (ax1, ax2) = plt.subplots(1, 2, figsize=(8, 3))
km = KMeans(n_clusters=2, random_state=0)
y_km = km.fit_predict(X)
ax1.scatter(X[y_km==0, 0], X[y_km==0, 1], c='lightblue', 
		 	marker='o', s=40, label='cluster 1')
ax1.scatter(X[y_km==1, 0], X[y_km==1, 1], c='red', 
		 	marker='s', s=40, label='cluster 2')
ax1.set_title('K-means clustering')

ac = AgglomerativeClustering(n_clusters=2, affinity='euclidan', linkage='complete')
y_ac = ac.fit_predict(X)
ax2.scatter(X[y_km==0, 0], X[y_km==0, 1], c='lightblue', 
		 	marker='o', s=40, label='cluster 1')
ax2.scatter(X[y_km==1, 0], X[y_km==1, 1], c='red', 
		 	marker='s', s=40, label='cluster 2')
ax2.set_title('K-means clustering')
plt.legend()
plt.show()
```

从聚类结果图像可见，KMeans 算法无法将两个簇分开，而这种复杂形状的数据对层次聚类算法来说也是一种挑战:

![](https://mingminyu.github.io/webassets/images/20251208/133.png)

最后，我们尝试一下 DBSCAN 算法在数据集上的效果，看其是否能使用基于密度的方法发现两个半月形的簇:

```python
from sklearn.cluster import DBSCAN

db = DBSCAN(eps=0.2, min_samples=5, metric='euclidan')
y_db = db.fit_predict(X)
plt.scatter(X[y_db==0, 0], X[y_db==0, 1], c='lightblue',
			marker='o', s=40, label='cluster 1')
plt.scatter(X[y_db==1, 0], X[y_db==1, 1], c='lightblue',
			marker='s', s=40, label='cluster 1')
plt.legend()
plt.show()
```

DBSCAN 算法可以成功地对半月形数据进行划分，这也是 DBSCAN 的优势之一(可对任意形状的数据进行聚类)。

![](https://mingminyu.github.io/webassets/images/20251208/134.png)

同时，我们也应该注意到 DBSCAN 算法的一些缺点。对于一个给定样本数量的训练数据集，随着数据集中特征的增加，**维度灾难**(curse of dimensionality) 的负面影响会随之递增。在使用欧几里得距离度量时，此问题尤为突出。不过，并不是只有 DBSCAN 算法面临维度灾难问题，使用欧几里得距离度量的其他聚类算法，如 KMeans 和层次聚类算法也都面临此问题。此外，为了能够生成更优的聚类结果，需要对 DBSCAN 中的两个超参(MinPts 和 $\varepsilon$) 进行优化。如果数据集中的密度差异较大，则找到合适的 MinPts 和 $\varepsilon$ 的组合较为困难。

>   :bookmark: 到目前为止，我们介绍了三种最基本的聚类方法: KMeans 基于原型的聚类、凝聚层次聚类、使用 DBSCAN 基于密度的聚类。在此，有必要提一下另一种更为先进的聚类方法: **图聚类**。而图聚累系列中最为突出的方法应该是 **谱聚类** 方法。虽然实现谱聚类有多重不同的方法，但它们的共同之处在于: 均使用基于相似矩阵的特征向量来获得簇间的关系。由于谱聚类超出本书的讲解范围，有兴趣的读者可以通过以下链接了解详细内容: http://arxiv.org/pdf/0711.0819v1.pdf (U.Von Luxburg. A Tutorial on Spectral Clustering. Statistics and computing, 17(4):395-416, 2007)。

**请注意**，在实际应用中，对于给定的数据集，往往不太确定选择哪种算法是最为适宜的，特别是面对难以或者无法进行可视化处理的高维数据集。此外，需要强调的是，一个好的聚类并不仅仅依赖于算法及其超参的调整。相反，选择合适的距离度量标准和专业领域知识再实验设定时的应用可能会更有帮助。

## 4. 本章小结

本章中，读者学习了三种不同的聚类算法，它们可以帮助我们发现隐藏数据背后的结构或信息。本章开始就介绍了基于原型的 KMeans 算法，此算法可以基于指定数量的簇中心，将样本划分为球形的簇。由于聚类是一种无监督方法，我们无法奢求根据真实的类标来衡量模型的性能。因此，我们使用数据内在有用的性能指标(如肘方法，或者轮廓分析)来尝试对聚类的质量进行量化评定。

接下来，我们学习了另外一种聚类方法: 凝聚层次聚类。层次聚类不需要事先指定簇的数量，而且聚类的结果可以通过树状图进行可视化展示，这有助于分析和解释聚类结果。本章介绍的最后一个算法是 DBSCAN，此算法基于样本的密度对其进行分组，并且它可以处理异常值以及识别非球形簇。

在学习完监督学习知识后，是时候介绍一些监督学习领域最令人兴奋的机器学习算法: **多层人工神经网络**。随着近年来的复兴，神经网络又一次成为机器学习研究领域的人们话题。借助于新近推出的深度学习算法，神经网络被视为适用于图像分类和语音识别等多种复杂任务的最先进方法。在第12章，我们将从零开始构建多层神经网络。在第13章，我们将介绍一种功能强大的第三方库，它能够帮助我们高效地训练复杂的神经网络。