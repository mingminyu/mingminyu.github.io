# 第7章 集成学习——组合不同的模型

> GitHub Notebook 地址: https://nbviewer.jupyter.org/github/rasbt/python-machine-learning-book/blob/master/code/ch07/ch07.ipynb

在上一章中，我们专注于不同分类模型的调优和评估等任务的实战操作。在本章中，我们将在这些技术的基础上探索一种新的方法，构建一组分类器的集合，使得整体分类效果优于其中人一个单独的分类器。我们将学到:

- 基于多数投票的预测
- 通过对训练数据集的重复抽样和随机组合降低模型的过拟合
- 通过弱学习机在误分类数据上的学习构建性能更好的模型

# 7.1 集成学习

集成方法(ensemble method)的目标是: 将不同的分类器组合称为一个元分类器，与包含于其中的单个分类器相比，元分类器具有更好的泛化性能。例如: 假设我们收集了 10位专家的预测结果，集成方法允许我们一定策略将这 10位专家的预测进行组合，与每位专家单独的预测相比，它具有更好的准确性和鲁棒性。本章我们将介绍几种不同的分类器集成方法。在本节，我们先介绍集成方法是如何工作的，以及它们为何能具备良好的泛化性能。

本章聚焦几种最流行的集成方法，它们都使用了多数投票(majority voting) 原则。多数投票则是指将大多数分类器预测的结果作为最终类标，也就是说，将得票率超过 50% 的结果作为类标。严格来说，多数投票仅用于二类别分类情形。不过，很容易将多数投票原则推广到多类别分类，也称作简单多数票法(plurality voting)。在此，我们选择得票的类标。下图解释了集成 10个分类器时，多数及简单多数票法表决的概念，其中每个单独的符号(三角形、正方形和圆)分别代表一个类标:

![在这里插入图片描述](https://img-blog.csdnimg.cn/20190830235543122.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L0x1Q2gxTW9uc3Rlcg==,size_16,color_FFFFFF,t_70)

基于训练集，我们首先训练 m 个不同的成员分类器($C_1,\dots,C_m$)。在多数投票原则下，可集成不同的分类算法，如决策树、支持向量机、Logistic回归等。此外，我们也可以使用相同的成员分类算法拟合不同的训练子集。这种方法典型的例子就是随机森林算法，它组合了不同的决策树分类器。下图解释了使用多数投票原则的通用集成方法的概念:

![在这里插入图片描述](https://img-blog.csdnimg.cn/20190830235614165.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L0x1Q2gxTW9uc3Rlcg==,size_16,color_FFFFFF,t_70)

想要通过简单的多数投票原则对类标进行预测，我们要汇总分类器 $C_j$ 的预测类标，并选出得票率最高的类标 $\hat y$:

$$
\hat y = model \{ C_1(x), C_2(x), \dots C_m(x) \}
$$

例如，在二类别分类中，假定 `class=-1`、`class=+1`，我们可以将多数投票预测表示为:

$$
C(x) = sign
\begin{bmatrix}
\sum_j^m C_j(x)
\end{bmatrix}= 
\begin{cases}
1 & \text 若 \sum_i C_j(x) \ge 0 \\
-1 & \text 其他
\end{cases}
$$

为了说明集成方法的效果为何好于单个成员分类器，我们借用下组合学中的概念。接下来的例子中，我们假定二类别中的 n 个成员分类器都有相同的出错率。此外，假定每个分类器都是独立的，且出错率之间是不相关的。基于这些假设，我们可以将成员分类器集成后的出错率简单表示为二项分布的概率密度函数:

$$
P(y \ge k) = \sum_k^n 
\langle \mathop{}_{k}^{n} \rangle
\varepsilon^k (1-\varepsilon)^{n-k} = \varepsilon_{ensemble}
$$

其中，$\langle \mathop{}_{k}^{n} \rangle$ 是 n选 k组合的二项式系数。换句话说，我们计算此集成分类器预测结果出错的概率。再来看一个更具体的例子: 假定使用 11个分类器(n=11)，单个分类器出错类为 0.25($\varepsilon =0.25$):

$$
P(y \ge k) = \sum_{k=6}^n 
\langle \mathop{}_{k}^{11 } \rangle
0.25^k (1-\varepsilon)^{11 -k} = 0.034
$$

正如我们所见，在满足所有假设的条件下，集成后的出错率(0.034) 远远小于单个分类器的出错率(0.25)。请注意，在此演示示例中，当集成分类中分类器个数 n 为偶数时，若预测结果为五五分，我们则将其以错误对待，不过仅有一半的可能会出现这种情况。为了比较成员分类器在不同出错率的情况下与集成分类器出错率的差异，我们利用 Python 实现其概率密度函数:

```python
from scipy.version import version as SCIPY_VERSION

if SCIPY_VERSION >= '1.0.0':
    from scipy.special import comb
else:
    from scipy.misc import comb
import math

def ensemble_error(n_classifier, error):
    k_start = math.ceil(n_classifier / 2.0)
    probs = [comb(n_classifier, k) * error ** k * (1 - error) ** (n_classifier - k)
             for k in range(k_start, n_classifier + 1)]
    return sum(probs)

ensemble_error(n_classifier=11, error=0.25)
```

输出结果:

```text
0.03432750701904297
```

实现 emsemble_error 函数后，在成员分类器出错略介于 0.0 到 1.0 范围内，我们可以计算对应集成分类器的出错率，并以函数曲线的形式绘制出它们之间的关系:

```python
import numpy as np
import matplotlib.pyplot as plt
%matplotlib inline

error_range = np.arange(0.0, 1.01, 0.01)
ens_errors = [ensemble_error(n_classifier=11, error=error) for error in error_range]
plt.plot(error_range, ens_errors, label="Ensemble error", linewidth=2)
plt.plot(error_range, error_range, linestyle="--", label="Base error", linewidth=2)
plt.xlabel("Base error")
plt.ylabel("Base/Ensemble error")
plt.legend(loc="upper left")
plt.grid()
plt.show()
```

![](https://imgconvert.csdnimg.cn/aHR0cDovL2dpdGh1Yi5jb20vbWluZ21pbnl1L2ltYWdlcy9yYXcvbWFzdGVyL3B5dGhvbi1tYWNoaW5lLWxlYXJuaW5nL2NoMDcvNy0zLmpwZw)


从结果图像可见: 当成员分类器出错率低于随机猜测时($\varepsilon < 0.5$)，集成分类器的出错率要低于单个分类器。请注意: y轴同时标识了成员分类器的出错率(虚线)和集成分了器的出错率(实现):

# 7.2 实现一个简单的多数投票分类器

通过上一小节的介绍，我们已经过集成学习有了初步的了解，现在来做一个热身练习: 基于多数投票原则，使用 Python 实现一个简单的集成分类器。虽然下述算法可通过简单错输投票推广到多分类器的情形，不过为了简单期间，我们仍旧使用更常出现在文献中的术语: 多数投票(majority voting)。

集成算法允许我们使用单独的权重对不同分类算法进行组合。我们的目标是构建一个更加强大的元分类器，以在特定的数据集上平衡单个分类器的弱点。通过更严格的数学概念，可以将加权多数投票记为:

$$
\hat y = arg \; \mathop{max}_{i}\sum_{j=1}^m w_j \chi_A(C_j(x) = i)
$$

其中，$w_j$ 是成员分类器 $C_j$ 对应的权重，$\hat y$ 是集成分类器的预测类标，$\chi_A$(希望字母chi)为特征函数 $[C_j(x)=i \in A]$，A 为类标的集合。如果权重均等，可以将此公式简化为:

$$
\hat y=mode\{ C_1(x),C_2(x),...C_m(x)\}
$$

为了更好地理解权重在这里的含义，我们来看看几个更加具体的例子。假定有三个成员分类器 $C_j(j \in \{1,2,3\})$，分别用它们预测样本的 $x$ 的类标。其中两个成员分类器的预测结果为类别 0，而另一个分类器 $C_3$ 的预测结果为类别 1.如果我们平等地看待每个成员分类器，基于多数投票原则，最终的预测结果应该是样本术语类别 0:

$$
C_1 \rightarrow 0, C_2 \rightarrow 0, C_3 \rightarrow 1 \\
\hat y = mode\{ 0,0,1 \} = 0
$$

我们将权重 0.6 赋给 $C_3$，而 $C_1$ 和 $C_2$ 均为 0.2，有:

$$
\begin{aligned}
\hat y &= arg \; \mathop{max}_{i}\sum_{j=1}^m w_j \chi_A(C_j(x) = i) \\
&= arg \; \mathop{max}_{i} [0.2 \times i_0 + 0.2 \times i_0 + 0.2 \times i_1] = 1
\end{aligned}
$$

更直观地，由于 $3 \times 0.2 = 0.6$，可以认为分类器 $C_3$ 的一次预测权重相当于分类器 $C_1$ 或 $C_2$ 的三次预测权重之和，我们可以写作:

$$
\hat y = mode \{ 0,0,1,1,1 \} = 1
$$

为了使用 Python 代码实现加权多数投票，可以使用 NumPy 中的 argmax 和 bincount 函数:

```python
import numpy as np

np.argmax(np.bincount([0, 0, 1], weights=[0.2, 0.2, 0.6]))
```

输出结果:

```text
1
```

我们将在第3章中曾讨论过，通过 predict_proba 方法，scikir-learn 中分类器可以返回样本属于预测类标的概率。如果集成分类器实现得到良好的修正，那么在多数投票中使用与猜测类别的概率替代类标会非常有用。使用类别概率进行预测的多数投票修改版本可记为:

$$
\hat y = arg \; \mathop{max}_{i} \sum_{j=1}^m w_jp_{ij}
$$

其中，$p_{ij}$ 是第 $j$ 个分类器预测样本类标为 $i$ 的概率。

继续前面的例子，假设我们面临一个二类别分类问题，其类标为 $i \in \{0,1\}$，下面集成这三个分类器 $C_j(j \in \{1,2,3\})$。假定分类器 $C_j$ 针对某一样本 x 按照如下概率返回类标的预测结果:

$$
C_1 \rightarrow [0.9,0.1], C_2 \rightarrow [0.8,0.2], C_3 \rightarrow [0.4,0.6] 
$$

我们按照如下方式计算所属类别的概率:

$$
\begin{aligned}
p(i_0|x) = 0.2 \times 0.9 + 0.2 \times 0.8 + 0.6 \times 0.4 = 0.58 \\
p(i_0|x) = 0.2 \times 0.1 + 0.2 \times 0.2 + 0.6 \times 0.6 = 0.42
\end{aligned}
$$

为实现基于类别预测概率的加权多数投票，我们可以再次使用 NumPy 中的 np.average 和 np.argmax 方法:

```python
ex = np.array([[0.9, 0.1], [0.8, 0.2], [0.4, 0.6]])
p = np.average(ex, axis=0, weights=[0.2, 0.2, 0.6])
print(p)
print(np.argmax(p))
```

输出结果:

```output
[0.58 0.42]
0
```

综上所述，我们使用 Python 来实现 MajorityVoteClassifier 类:

```python
from sklearn.base import BaseEstimator, ClassifierMixin, clone
from sklearn.preprocessing import LabelEncoder
from sklearn.externals import six
from sklearn.pipeline import _name_estimators
import numpy as np
import operator


class MajorityVoteClassifier(BaseEstimator, ClassifierMixin):
    """A majority vote ensemble classifier
    
    Parameters
    ----------
    classifiers : array-like, shape = [n_classifiers]
      Different classifiers for ensemble
    
    vote : str, {'classlabel', 'probability'}
      Default: 'classlabel'
      If 'classlabel' the prediction is based on
      the argmax of class labels. Else if
      'probability', the argmax of the sum of
      probabilities is used to predict the class label
      (recommend for calibrated classifiers).
    
    weights : array-like, shape = [n_classifiers]
      Optional, defaulr: None
      If a list of `int` or `float` values are
      provided, the classifiers are weigted by
      importancce; Uses uniform weights if `weights=None`.
    """
    def __init__(self, classifiers, vote='classlabel', weights=None):
        self.classifiers = classifiers
        self.named_classifiers = {key: value 
                for key, value in _name_estimators(classifiers)}
        self.vote = vote
        self.weights = weights
    
    def fit(self, X, y):
        """Fit classifiers.
        
        Parameters
        ----------
        X : {array-like, sparse matrix},
            shape = [n_samples, n_features]
            Matrix of training samples.
            
        y : array-like, shape = [n_samples]
            Vector of target class labels/
        
        Returns
        -------
        self : object
        """
        # Use LabelEncoder to ensure class labels start
        # with 0, which is important for np.argmax
        # call in self.predict
        self.labelnc_ = LabelEncoder()
        self.labelnc_.fit(y)
        self.classes_ = self.labelnc_.classes_
        self.classifiers_ = [clone(clf).fit(X, self.labelnc_.transform(y)) 
                               for clf in self.classifiers]
        return self
```

为了帮助读者更好地理解这部分内容，我在代码中加入了大量的注释。不过，在实现其他的方法之前，我们稍作中断，先快速地讨论一下看似让人眼花缭乱的代码。我们使用两个基类 BaseEstimator 和 ClassifierMixin 获取某些方法，包括设定分类器参数的 set_params 和返回参数的 get_params 方法，以及用于计算预测准确率的 score 方法。此外请注意，我们导入 six 包草丛而使得 MajorityVoteClassifier 与 Python 2.7 兼容。

接下来我们加入 predict 方法: 如果使用参数 `vote='classlabel'` 初始化 MajorityVote-Classifier 对象，我们就可以通过多数投票来预测类标，相反，如果使用参数 `vote='probability'` 初始化集成分类器，则可基于类别成员的概率进行类标预测。此外，我们还将加入 predict_proba 方法来返回平均概率，这在计算受试工作者特征线下区域(Receiver Operator Characteristic under the curve, ROC AUC) 时需要用到。

```python
from sklearn.base import BaseEstimator, ClassifierMixin, clone
from sklearn.preprocessing import LabelEncoder
from sklearn.externals import six
from sklearn.pipeline import _name_estimators
import numpy as np
import operator


class MajorityVoteClassifier(BaseEstimator, ClassifierMixin):
    """A majority vote ensemble classifier
    
    Parameters
    ----------
    classifiers : array-like, shape = [n_classifiers]
      Different classifiers for ensemble
    
    vote : str, {'classlabel', 'probability'}
      Default: 'classlabel'
      If 'classlabel' the prediction is based on
      the argmax of class labels. Else if
      'probability', the argmax of the sum of
      probabilities is used to predict the class label
      (recommend for calibrated classifiers).
    
    weights : array-like, shape = [n_classifiers]
      Optional, defaulr: None
      If a list of `int` or `float` values are
      provided, the classifiers are weigted by
      importancce; Uses uniform weights if `weights=None`.
    """
    def __init__(self, classifiers, vote='classlabel', weights=None):
        self.classifiers = classifiers
        self.named_classifiers = {key: value 
                for key, value in _name_estimators(classifiers)}
        self.vote = vote
        self.weights = weights
    
    def fit(self, X, y):
        """Fit classifiers.
        
        Parameters
        ----------
        X : {array-like, sparse matrix},
            shape = [n_samples, n_features]
            Matrix of training samples.
            
        y : array-like, shape = [n_samples]
            Vector of target class labels/
        
        Returns
        -------
        self : object
        """
        # Use LabelEncoder to ensure class labels start
        # with 0, which is important for np.argmax
        # call in self.predict
        self.labelnc_ = LabelEncoder()
        self.labelnc_.fit(y)
        self.classes_ = self.labelnc_.classes_
        self.classifiers_ = [clone(clf).fit(X, self.labelnc_.transform(y)) 
                               for clf in self.classifiers]
        return self
    
    def predict(self, X):
        """Predict class labels for X.
        
        Parametres
        ----------
        X : {array-like, sparse matrix},
            shape = [n_samples, n_features]
            Matrix of training samples.
        
        Returns
        ----------
        maj_vote : array-like, shape = [n_samples]
            Predicted class labels.
        """
        if self.vote == 'probability':
            maj_vote = np.argmax(self.predict_proba(X), axis=1)
        else: # 'classlabel' vite
            # Collect results from clf.predict class
            predictions = np.asarray([clf.predict(X) 
                        for clf in self.classifiers_]).T
            maj_vote = np.apply_along_axis(
                lambda x: np.argmax(np.bincount(x, weights=self.weights)),
                axis=1, arr=predictions)
        maj_vote = self.labelnc_.inverse_transform(maj_vote)
        return maj_vote

    def predict_proba(self, X):
        """Predict class probabilities for X.

            Parametres
            ----------
            X : {array-like, sparse matrix},
                shape = [n_samples, n_features]
                Training vecctors, where n_samples is
                the number of samples and n_feayures
                is the number of features.

            Returns
            ----------
           avg_proba : array_like
               shape = [n_samples, n_classes]
               Weighted average probability for
               each class per sample.
        """
        probas = np.asarray([clf.predict_proba(X) 
                        for clf in self.classifiers_])
        avg_proba = np.average(probas, axis=0, weights=self.weights)
        return avg_proba

    def get_params(self, deep=True):
        """Get classifier parameter names for GridSearcch"""
        if not deep:
            return super(MajorityVoteClassifier, self).get_params(deep=False)
        else:
            out = self.named_classifiers.copy()
            for name, step in six.iteritems(self.named_classifiers):
                for key, value in six.iteritems(step.get_params(deep=True)):
                    out['%s_%s' % (name, key)] = value
            return out
```

此外还请注意: 这里还定义了我们自行修改的 get_params 方法，以方便使用 `_name_estimators` 函数来访问集成分类器中独立成员函数的参数。其存储看起来这有点复杂，但是在后续小节中，我们将使用网络搜索来调整超参，那时你会感到这样做意义非凡。

🔖 主要出于演示的目的，我们才实现了 MajorityVoteClassifier 类，不过这也完成了 scikit-learn 中关于多数投票的一个相对复杂的版本。它将出现在下一个版本(v.0.17) 的 sklearn.ensemble.VotingClassifier 类中。

## 7.2.1 基于多数投票原则组合不同的分类算法

现在我们可以将上一小节实现的 MajorityVoteClassifier 用于实战了。不过，先准备一个可以用于测试的数据集。既然已经书写了从 CSV 文件中读取数据的方法，我们就走捷径从 scikit-learn 的 dataset 模块中加载鸢尾花数据结集。此外，为了使分类更具挑战，我们只选择其中的两个特征: 萼片宽度和花瓣长度。虽然 MajorityVoteClassifier 可应用到多类别分类问题，但我们只区分两个类别的样本: Iris-Versicolor 和 Iris-Virginica，并绘制其 ROC AUC。代码如下:

```py
from sklearn import datasets
from sklearn.cross_validation import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder

iris = datasets.load_iris()
X, y = iris.data[50:, [1,2]], iris.target[50:]
le = LabelEncoder()
y = le.fit_transform(y)
```

🔖 请注意，我们可以使用 sccikit-learn 中的 predict_proba 方法(如果适用)计算 ROC AUC 的评分。在第3章中，我们学习了如何通过 Logistic 回归模型来计算各类别的归属概率；在决策树中，此概率是通过训练时每个节点创建的频度向量(frequenccy vector) 来计算的。此向量收集对应节点中通过类标分布计算得到各类标频率值。进而对频率进行归一化存车处李，使得它们的和为 1.类似地，k-近邻算法分类器都返回了与 Logisticc 回归模型类似的概率值，但必须注意，这些值并非通过概率密度函数计算得到的。

下面我们将样本按照五五分划分为训练数据及猜测数据:

```python
X_train, X_test, y_train, y_test = \
    train_test_split(X, y, test_size=0.5, random_state=1)
```

我们使用训练数据集训练三种不同类型的分类器: Logistic 回归分类器、决策树分类器及 k-近邻分类器各一个，在将它们组合成集成分类器之前，我们先通过 10折交叉验证看一下各个分类器在训练数据集上的性能表现:

```python
from sklearn.cross_validation import cross_val_score
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import Pipeline
import numpy as np

clf_lr = LogisticRegression(penalty='l2', C=0.001, random_state=0)
clf_dt = DecisionTreeClassifier(max_depth=1, criterion='entropy', random_state=0)
clf_knn = KNeighborsClassifier(n_neighbors=1, p=2, metric='minkowski')
pipe_lr = Pipeline([['sc', StandardScaler()], ['clf', clf_lr]])
pipe_knn = Pipeline([['sc', StandardScaler()], ['clf', clf_knn]])

clf_labels = ['Logistic Regression', 'Decision Tree', 'KNN']
print('10-fold cross validation: \n')

for clf, label in zip([pipe_lr, clf_dt, pipe_knn], clf_labels):
    scores = cross_val_score(estimator=clf, X=X_train, y=y_train, 
                             cv=10, scoring='roc_auc')
    print("ROC AUC: %0.2f (+/- %0.2f) [%s]" 
          % (scores.mean(), scores.std(), label))
```

输出结果:

```Output
10-fold cross validation: 

ROC AUC: 0.92 (+/- 0.20) [Logistic Regression]
ROC AUC: 0.92 (+/- 0.15) [Decision Tree]
ROC AUC: 0.93 (+/- 0.10) [KNN]
```

读者可能会感到奇怪，为什么我们将 Logistic 回归和 KNN 分类器的训练作为流水线的一部分？原因在于: 如我们第 3章所述，不同于决策树，Logistic 回归与 KNN 算法(使用欧几里得举例作为距离度量标准) 对数据缩放不敏感。虽然鸢尾花特征都以相同的尺度(厘米)度量，不过对特征标准化处理是一个好习惯。

激动人心的时刻到了，我们现在基于多数投票原则，在 MajorityVoteClassifier 中组合各成员分类器:

```python
mv_clf = MajorityVoteClassifier(classifiers=[pipe_lr, clf_dt, pipe_knn])
clf_labels += ['Majority Voting']
all_clf = [pipe_lr, clf_dt, pipe_knn, mv_clf]

for clf, label in zip([pipe_lr, clf_dt, pipe_knn, mv_clf], clf_labels):
    scores = cross_val_score(estimator=clf, X=X_train, y=y_train, 
                             cv=10, scoring='roc_auc')
    print("Accuracy: %0.2f (+/- %0.2f) [%s]" 
          % (scores.mean(), scores.std(), label))
```

输出结果:

```output
Accuracy: 0.92 (+/- 0.20) [Logistic Regression]
Accuracy: 0.92 (+/- 0.15) [Decision Tree]
Accuracy: 0.93 (+/- 0.10) [KNN]
Accuracy: 0.97 (+/- 0.10) [Majority Voting]
```

正如我们所见，以 10折交叉验证作为评估标准，MajorityVotingClassifier 的性能与单个成员分类器相比有着质的提高。

# 7.3 评估与调优集成分类器

在本节，我们将在测试数据上计算 MajorityVoteClassifier 类的 ROC 曲线，以验证其在位置数据上的泛化能力。请记住，训练数据并未应用于模型选择，使用它们的唯一目的就是对分类系统的泛化能力做出无偏差的估计。代码如下:

```python
from sklearn.metrics import roc_curve
from sklearn.metrics import auc
import matplotlib.pyplot as plt

colors = ['black', 'orange', 'blue', 'green']
linestyles = [':', '--', '-.', '-']

for clf, label, clr, ls in zip(all_clf, clf_labels, colors, linestyles):
    # assuming the label of the positive class is 1
    y_pred = clf.fit(X_train, y_train).predict_proba(X_test)[:, 1]
    fpr, tpr, thresholds = roc_curve(y_true=y_test, y_score=y_pred)
    roc_auc = auc(x=fpr, y=tpr)
    plt.plot(fpr, tpr, color=clr, linestyle=ls, 
             label='%s (auc = %0.2f)' % (label, roc_auc))

plt.legend(loc='lower right')
plt.plot([0, 1], [0, 1], linestyle='--', color='gray', linewidth=2)
plt.xlim([-0.1, 1.1])
plt.ylim([-0.1, 1.1])
plt.grid()
plt.xlabel('False Positive Rate')
plt.ylabel('True Positive Rate')
plt.show()
```

由 ROC 结果我们可以看到，集成分类器在测试集上表现优秀(ROC AUC=0.95)，而 KNN 分类器对于训练数据有些过拟合(训练集上的 ROC AUC=0.93，测试集上 ROC AUC=0.86):

![在这里插入图片描述](https://img-blog.csdnimg.cn/20190830235737653.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L0x1Q2gxTW9uc3Rlcg==,size_16,color_FFFFFF,t_70)

因为只使用了分类样本中的两个特征，集成分类器的决策区域到底是什么样子可能会引起我们的兴趣。由于 Logistic 回归和 KNN 流水线会自动对数据进行预处理，因此不必实现对训练特征进行标准化。不过出于可视化考虑，也就是在相同的度量标准上实现决策区域，我们在此对训练数据集做了标准化处理。代码如下:

```python
from sklearn import datasets
from sklearn.cross_validation import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.preprocessing import LabelEncoder
from itertools import product

iris = datasets.load_iris()
X, y = iris.data[50:, [1,2]], iris.target[50:]
sc = StandardScaler()
X_train_std = sc.fit_transform(X_train)
x_min = X_train_std[:, 0].min() - 1
x_max = X_train_std[:, 0].max() + 1
y_min = X_train_std[:, 1].min() - 1
y_max = X_train_std[:, 1].max() + 1
xx, yy = np.meshgrid(np.arange(x_min, x_max, 0.1),
                     np.arange(y_min, y_max, 0.1))
f, axarr = plt.subplots(nrows=2, ncols=2, 
                        sharex='col', sharey='row',
                        figsize=(7,5))

clf_lr = LogisticRegression(penalty='l2', C=0.001, random_state=0)
clf_dt = DecisionTreeClassifier(max_depth=1, criterion='entropy', random_state=0)
clf_knn = KNeighborsClassifier(n_neighbors=1, p=2, metric='minkowski')
pipe_lr = Pipeline([['sc', StandardScaler()], ['clf', clf_lr]])
pipe_knn = Pipeline([['sc', StandardScaler()], ['clf', clf_knn]])
mv_clf = MajorityVoteClassifier(classifiers=[pipe_lr, clf_dt, pipe_knn])
clf_labels += ['Majority Voting']
all_clf = [pipe_lr, clf_dt, pipe_knn, mv_clf]

for idx, clf, tt in zip(product([0, 1], [0, 1]), all_clf, clf_labels):
    clf.fit(X_train_std, y_train)
    Z = clf.predict(np.c_[xx.ravel(), yy.ravel()])
    Z = Z.reshape(xx.shape)
    axarr[idx[0], idx[1]].contourf(xx, yy, Z, alpha=0.3)
    axarr[idx[0], idx[1]].scatter(X_train_std[y_train==0, 0],
            X_train_std[y_train==0, 1], c='b', marker='^', s=50)
    axarr[idx[0], idx[1]].scatter(X_train_std[y_train==1, 0],
            X_train_std[y_train==1, 1], c='r', marker='o', s=50)
    axarr[idx[0], idx[1]].set_title(tt)

plt.text(-3.5, -4.5, s='Sepal width [standardized]', 
         ha='center', va='center', fontsize=12)
plt.text(-10.5, 4.5, s='Petal length [standardized]', 
         ha='center', va='center', fontsize=12, rotation=90)
plt.show()
```

尽管有趣，但也如我们所预期的那样，集成分类器的决策区域看起来像是各成员分类器决策区域的混合。乍看之下，多数投票的决策区域与 KNN 分类器很相似。不过，正如单层决策树那样，我们可以看到它在 sepal width $\ge$ 1时正交于 y轴:

![在这里插入图片描述](https://img-blog.csdnimg.cn/20190830235753833.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L0x1Q2gxTW9uc3Rlcg==,size_16,color_FFFFFF,t_70)

在集成分类的成员分类器调优之前，我们调用一下 get_param 方法，以便对如何访问 GridSearch 对象内的单个参数有个基本的认识:

```py
mv_clf.get_params()
```

输出结果:

```output
{'decisiontreeclassifier': DecisionTreeClassifier(class_weight=None, criterion='entropy', max_depth=1,
             max_features=None, max_leaf_nodes=None,
             min_impurity_decrease=0.0, min_impurity_split=None,
             min_samples_leaf=1, min_samples_split=2,
             min_weight_fraction_leaf=0.0, presort=False, random_state=0,
             splitter='best'),
 'decisiontreeclassifier_class_weight': None,
 'decisiontreeclassifier_criterion': 'entropy',
 'decisiontreeclassifier_max_depth': 1,
 'decisiontreeclassifier_max_features': None,
 'decisiontreeclassifier_max_leaf_nodes': None,
 'decisiontreeclassifier_min_impurity_decrease': 0.0,
 'decisiontreeclassifier_min_impurity_split': None,
 'decisiontreeclassifier_min_samples_leaf': 1,
 'decisiontreeclassifier_min_samples_split': 2,
 'decisiontreeclassifier_min_weight_fraction_leaf': 0.0,
 'decisiontreeclassifier_presort': False,
 'decisiontreeclassifier_random_state': 0,
 'decisiontreeclassifier_splitter': 'best',
 'pipeline-1': Pipeline(memory=None,
      steps=[('sc', StandardScaler(copy=True, with_mean=True, with_std=True)), ['clf', LogisticRegression(C=0.001, class_weight=None, dual=False, fit_intercept=True,
           intercept_scaling=1, max_iter=100, multi_class='ovr', n_jobs=1,
           penalty='l2', random_state=0, solver='liblinear', tol=0.0001,
           verbose=0, warm_start=False)]]),
 'pipeline-1_clf': LogisticRegression(C=0.001, class_weight=None, dual=False, fit_intercept=True,
           intercept_scaling=1, max_iter=100, multi_class='ovr', n_jobs=1,
           penalty='l2', random_state=0, solver='liblinear', tol=0.0001,
           verbose=0, warm_start=False),
 'pipeline-1_clf__C': 0.001,
 'pipeline-1_clf__class_weight': None,
 'pipeline-1_clf__dual': False,
 'pipeline-1_clf__fit_intercept': True,
 'pipeline-1_clf__intercept_scaling': 1,
 'pipeline-1_clf__max_iter': 100,
 'pipeline-1_clf__multi_class': 'ovr',
 'pipeline-1_clf__n_jobs': 1,
 'pipeline-1_clf__penalty': 'l2',
 'pipeline-1_clf__random_state': 0,
 'pipeline-1_clf__solver': 'liblinear',
 'pipeline-1_clf__tol': 0.0001,
 'pipeline-1_clf__verbose': 0,
 'pipeline-1_clf__warm_start': False,
 'pipeline-1_memory': None,
 'pipeline-1_sc': StandardScaler(copy=True, with_mean=True, with_std=True),
 'pipeline-1_sc__copy': True,
 'pipeline-1_sc__with_mean': True,
 'pipeline-1_sc__with_std': True,
 'pipeline-1_steps': [('sc',
   StandardScaler(copy=True, with_mean=True, with_std=True)),
  ['clf',
   LogisticRegression(C=0.001, class_weight=None, dual=False, fit_intercept=True,
             intercept_scaling=1, max_iter=100, multi_class='ovr', n_jobs=1,
             penalty='l2', random_state=0, solver='liblinear', tol=0.0001,
             verbose=0, warm_start=False)]],
 'pipeline-2': Pipeline(memory=None,
      steps=[('sc', StandardScaler(copy=True, with_mean=True, with_std=True)), ['clf', KNeighborsClassifier(algorithm='auto', leaf_size=30, metric='minkowski',
            metric_params=None, n_jobs=1, n_neighbors=1, p=2,
            weights='uniform')]]),
 'pipeline-2_clf': KNeighborsClassifier(algorithm='auto', leaf_size=30, metric='minkowski',
            metric_params=None, n_jobs=1, n_neighbors=1, p=2,
            weights='uniform'),
 'pipeline-2_clf__algorithm': 'auto',
 'pipeline-2_clf__leaf_size': 30,
 'pipeline-2_clf__metric': 'minkowski',
 'pipeline-2_clf__metric_params': None,
 'pipeline-2_clf__n_jobs': 1,
 'pipeline-2_clf__n_neighbors': 1,
 'pipeline-2_clf__p': 2,
 'pipeline-2_clf__weights': 'uniform',
 'pipeline-2_memory': None,
 'pipeline-2_sc': StandardScaler(copy=True, with_mean=True, with_std=True),
 'pipeline-2_sc__copy': True,
 'pipeline-2_sc__with_mean': True,
 'pipeline-2_sc__with_std': True,
 'pipeline-2_steps': [('sc',
   StandardScaler(copy=True, with_mean=True, with_std=True)),
  ['clf',
   KNeighborsClassifier(algorithm='auto', leaf_size=30, metric='minkowski',
              metric_params=None, n_jobs=1, n_neighbors=1, p=2,
              weights='uniform')]]}
```

得到 get_params 方法的返回值后，我们现在知道怎样去访问成员分类器的属性了。出于演示的目的，先通过网格搜索来调整 Logistic 回归分类器的正则化系数 C 以及决策树的深度。代码如下:

```python
from sklearn.grid_search import GridSearchCV
params = {'decisiontreeclassifier__max_depth': [1, 2],
          'pipeline-1__clf__C': [0.001, 0.1, 100.0]}
grid = GridSearchCV(estimator=mv_clf, param_grid=params,
                    cv=10, scoring='roc_auc')
grid.fit(X_train, y_train)
```

输出结果:

```output
GridSearchCV(cv=10, error_score='raise',
       estimator=MajorityVoteClassifier(classifiers=[Pipeline(memory=None,
     steps=[('sc', StandardScaler(copy=True, with_mean=True, with_std=True)), ['clf', LogisticRegression(C=0.001, class_weight=None, dual=False, fit_intercept=True,
          intercept_scaling=1, max_iter=100, multi_class='ovr', n_jobs=1,
          penalty='l2', ra...ski',
           metric_params=None, n_jobs=1, n_neighbors=1, p=2,
           weights='uniform')]])],
            vote='classlabel', weights=None),
       fit_params={}, iid=True, n_jobs=1,
       param_grid={'decisiontreeclassifier__max_depth': [1, 2], 'pipeline-1__clf__C': [0.001, 0.1, 100.0]},
       pre_dispatch='2*n_jobs', refit=True, scoring='roc_auc', verbose=0)
```

完成网格搜索后，我们可以输出不同超参值的组合，以及 10折交叉验证计算得出的平均 ROC AUCC 得分。代码如下:

```python
for params, mean_score, scores in grid.grid_scores_:
    print("%0.3f +/- %0.2f %r" % (mean_score, scores.std()/2, params))

print('Best parameters: %s' % grid.best_params_)
print('Accuracy: %.2f' % grid.best_score_)
```

输出结果:

```output
0.967 +/- 0.05 {'decisiontreeclassifier__max_depth': 1, 'pipeline-1__clf__C': 0.001}
0.967 +/- 0.05 {'decisiontreeclassifier__max_depth': 1, 'pipeline-1__clf__C': 0.1}
1.000 +/- 0.00 {'decisiontreeclassifier__max_depth': 1, 'pipeline-1__clf__C': 100.0}
0.967 +/- 0.05 {'decisiontreeclassifier__max_depth': 2, 'pipeline-1__clf__C': 0.001}
0.967 +/- 0.05 {'decisiontreeclassifier__max_depth': 2, 'pipeline-1__clf__C': 0.1}
1.000 +/- 0.00 {'decisiontreeclassifier__max_depth': 2, 'pipeline-1__clf__C': 100.0}

Best parameters: {'decisiontreeclassifier__max_depth': 1, 'pipeline-1__clf__C': 100.0}
Accuracy: 1.00
```

正如我们所见，当选择的正则化强度较小时(C=100.0)，我们能够得到最佳的交叉验证结果，而决策树的深度似乎对性能没有任何影响，这意味着使用单层决策树足以对数据进行划分。请注意，在模型评估时，不止一次使用测试集并非一个好的做法，本节不打算讨论超参调优后的集成分类器泛化能力的评估。我们将在继续学习另外一种集成方法: bagging。

🔖 我们在本节实现的多数投票方法有时也称为堆叠(stacking)。不过，堆叠算法更典型地应用于组合 Logistic 回归模型，以各独立分类器的输出作为输入，通过针对这些输入结果的继承来预测最终的类标，详情请参阅 David H.Wolpert 的论文: Stacked generalization.Neural networks,5(2):241——259,1992。

# 7.4 bagging—通过 bootstrap 样本构建集成分类器

bagging 是一种与上一节实现的 MajorityVoteClassifier 关系紧密的集成学习技术，如下图所示:

![在这里插入图片描述](https://img-blog.csdnimg.cn/20190830235845185.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L0x1Q2gxTW9uc3Rlcg==,size_16,color_FFFFFF,t_70)

不过，此算法没有使用相同的训练集拟合集成分类器中的单个成员分类器。由于原始训练集使用了 bootstrap 抽样(有放回的随机抽样)，这也就是 bagging 被称为 bootstrap aggregating 的原因。为了用更具体的例子来解释 botstraping 的工作原理，我们使用下图所示的示例来说明。在此，我们🈶 7个不同的训练样例(使用索引1~7来表示)，在每一轮的 bagging 循环中，它们都被可放回随机抽样。每个 bootstrap 抽样都被用于分类器 $C_j$ 的悬链，这就是一棵典型的未剪枝的决策树:

![在这里插入图片描述](https://img-blog.csdnimg.cn/20190830235906566.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L0x1Q2gxTW9uc3Rlcg==,size_16,color_FFFFFF,t_70)


bagging 还与我们在第3章中曾经介绍过的随机森林紧密相关。实际上，随机森林是 bagging 的一个特例，它使用了随机的特征子集去拟合单棵决策。bagging 最早由 Leo Breiman 在1994年的一份技术报告中提出。他还表示，bagging 可以提高不稳定的准确率，并且可以降低过拟合的程度。我强烈建议读者阅读 L.Breiman 的论文$1$，以更深入了解 bagging。此文献可在网上免费获取。

> 注1: L.Breoman.Bagging Predictors. Machine Learning, 24(2):123-140,1996.

为了检验一下 bagging 的实际效果，我们使用第4章中用到的葡萄酒数据集构建一个更复杂的分类问题。在此我们只考虑葡萄酒中的类别2和类别3，且只选择 Alchohol 和 Hue 这两个特征。

```python
import pandas as pd

data_url = 'https://archive.ics.uci.edu/ml/machine-learning-databases/wine/wine.data'
df_wine = pd.read_csv(data_url, header=None)
df_wine.columns = ['Class label', 'Alcohol', 'Malic acid', 'Ash', 
        'Alcalinity of ash', 'Magnesium', 'Total phenols', 'Flavanoids',
        'Nonflavanoid phenols', 'Proanthocyanins', 'Color intensity',
        'Hue', 'OD280/OD315 of diluted wines', 'Proline']
df_wine = df_wine[df_wine['Class label'] != 1]
y = df_wine['Class label'].values
x = df_wine[['Alcohol', 'Hue']].values
```

接下来，我们将类标编码为二进制形式，并将数据集按照六四分的比例划分为训练集和测试集:

```python
from sklearn.preprocessing import LabelEncoder
from sklearn.cross_validation import train_test_split

le = LabelEncoder()
y = le.fit_transform(y)
X_train, X_test, y_train, y_test = \
    train_test_split(X, y, test_size=0.4, random_state=1)
```

scikit-learn 中已经实现了 BaggingClassifier 相关算法，我们可从 ensemble 子模块中导入使用。在此，我们将使用尾剪枝的决策树作为成员分类器，并在训练数据集上通过不同的 bootstrap 抽样拟合 500 棵决策树:

```python
from sklearn.ensemble import BaggingClassifier
from sklearn.tree import DecisionTreeClassifier

tree = DecisionTreeClassifier(criterion='entropy', max_depth=None)
bag = BaggingClassifier(base_estimator=tree, n_estimators=500,
        max_samples=1.0, max_features=1.0, bootstrap=True,
        bootstrap_features=False, n_jobs=1, random_state=1)
```

然后我们将计算训练数据集和测试数据集上的预测准确率，以比较 bagging 分类器与单棵未剪枝决策树的性能差异:

```python
from sklearn.metrics import accuracy_score

tree = tree.fit(X_train, y_train)
y_train_std = tree.predict(X_train)
y_test_std = tree.predict(X_test)
tree_train = accuracy_score(y_train, y_train_std)
tree_test = accuracy_score(y_test, y_test_std)
print('Decision tree train/test accuracies %.3f/%.3f' % (tree_train, tree_test))
```

输出结果:

```output
Decision tree train/test accuracies 1.000/0.833
```

基于上述代码执行的结果可见，未经剪枝的决策树准确地预测了训练数据的所有列类标；但是，测试数据上极低的准确率表明该模型方差过高(过拟合):

```python
bag = bag.fit(X_train, y_train)
y_train_pred = bag.predict(X_train)
y_test_pred = bag.predict(X_test)
bag_train = accuracy_score(y_train, y_train_pred)
bag_test = accuracy_score(y_test, y_test_pred)
print('Bagging train/test accuracies %.3f/%.3f' % (bag_train, bag_test))
```

输出结果:

```output
Bagging train/test accuracies 1.000/0.896
```

虽然决策树与 bagging 分类器在训练数据集上的准确率相似(均为 1.0)，但是 bagging 分类器在测试数据上的泛化性能稍有胜出。下面我们比较一下决策树与 bagging 分类器的决策区域:

```python
from sklearn import datasets
from sklearn.cross_validation import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.preprocessing import LabelEncoder
from itertools import product
from sklearn.ensemble import BaggingClassifier
from sklearn.tree import DecisionTreeClassifier
import pandas as pd

tree = DecisionTreeClassifier(criterion='entropy', max_depth=None)
bag = BaggingClassifier(base_estimator=tree, n_estimators=500,
        max_samples=1.0, max_features=1.0, bootstrap=True,
        bootstrap_features=False, n_jobs=1, random_state=1)

data_url = 'https://archive.ics.uci.edu/ml/machine-learning-databases/wine/wine.data'
df_wine = pd.read_csv(data_url, header=None)
df_wine.columns = ['Class label', 'Alcohol', 'Malic acid', 'Ash', 
        'Alcalinity of ash', 'Magnesium', 'Total phenols', 'Flavanoids',
        'Nonflavanoid phenols', 'Proanthocyanins', 'Color intensity',
        'Hue', 'OD280/OD315 of diluted wines', 'Proline']
df_wine = df_wine[df_wine['Class label'] != 1]
y = df_wine['Class label'].values
X = df_wine[['Alcohol', 'Hue']].values
le = LabelEncoder()
y = le.fit_transform(y)
X_train, X_test, y_train, y_test = \
    train_test_split(X, y, test_size=0.4, random_state=1)

x_min = X_train[:, 0].min() - 1
x_max = X_train[:, 0].max() + 1
y_min = X_train[:, 1].min() - 1
y_max = X_train[:, 1].max() + 1
xx, yy = np.meshgrid(np.arange(x_min, x_max, 0.1),
                     np.arange(y_min, y_max, 0.1))
f, axarr = plt.subplots(nrows=1, ncols=2, 
                        sharex='col', sharey='row',
                        figsize=(8,3))

for idx, clf, tt in zip([0, 1], [tree, bag], ['Decision Tree', 'Bagging']):
    clf.fit(X_train, y_train)
    Z = clf.predict(np.c_[xx.ravel(), yy.ravel()])
    Z = Z.reshape(xx.shape)
    axarr[idx].contourf(xx, yy, Z, alpha=0.3)
    axarr[idx].scatter(X_train[y_train==0, 0],
            X_train[y_train==0, 1], c='b', marker='^')
    axarr[idx].scatter(X_train[y_train==1, 0],
            X_train[y_train==1, 1], c='r', marker='o')
    axarr[idx].set_title(tt)

axarr[0].set_ylabel('Alcohol', fontsize=12)
plt.text(10.2, -1.2, s='Hue', ha='center', va='center', fontsize=12)
plt.show()
```



由结果图像可见，与深度为 3的决策树线性分段边界相比，bagging 集成分类器的决策边界显得更平滑:

![在这里插入图片描述](https://img-blog.csdnimg.cn/20190830235930575.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L0x1Q2gxTW9uc3Rlcg==,size_16,color_FFFFFF,t_70)

本节我们只是简单通过示例了解了 bagging。在实战中，分类任务会更加复杂，数据集维度会更高，使用单棵树很容易产生过拟合，这时 bagging 算法就可显示出其优势了。最后，我们需要注意 bagging 算法是降低模型方差的一种有效防范。然而，bagging 在降低模型偏差方面作用不大，这也是我们选择未剪枝决策树等低偏差分类器作为集成算法成员分类器的原因。

# 7.5 通过自适应 boosting 提高弱学习机的性能

在本节对集成方法的介绍中，我们将重点讨论 boosting 算法中一个常用例子:

🔖 AdaBoost 背后的最初想法是由 Robert Schapire 于 1990年提出的(R.E.Schapire.The Strength of Weak Learnability. Machine Learning, 5(2):197-227, 1990)。当 Robert Schapire 与 Yoav Freund 在第13届国际会议(ICML 1996)上发表 AdaBoost 算法后，随后的几年中，此算法就成为最广为应用的结合集成方法(Y.Freund, R.E.Schapire, et al.Experiments with a New Boosting Algorithm. In ICML, volume 96, pages 148-156,1996)。基于他们的开放性工作，Freund 和 Schapire 在2003年获得了 Goedel 奖，这是发表计算机科学领域论文最负盛名的奖项。

在 boosting 中，集成分类器包含多个非常简单的成员分类器，这些成员分类器仅稍好于随机猜测，常被称作弱学习机。典型的弱学习机例子就是单层决策树。boosting 主要针对难以区分的训练样本，也就是说，弱学习机通过在错误分类样本上的学习来提高集成分类的性能。与 bagging 不同，在 boosting 的初始化阶段，算法使用无放回抽样从训练样本中随机抽取一个子集。原始的 boosting 过程可总结为如下四个步骤:

1. 从训练街 $D$ 中以无放回抽样方式随机抽取一个训练子集 $d_1$，用于弱学习机 $C_1$ 的训练。
2. 从训练集 $D$ 中无放回抽样方式随机抽取第2个训练子集 $d2$，并将 $C_1$ $C_1$ 中误分类样本的 50% 加入到训练集中，训练得到弱学习机 $C_2$。
3. 从训练集 $D$ 中抽取 $C_1$ 和 $C_2$分类结果不一致的样本生成训练样本集 $d_3$，以此训练第 3个弱学习机 $C_3$。
4. 通过多数投票组合三个弱学习机 $C_1$、$C_2$ 和 $C_3$。

正如 Leo Breiman 所述$1$，与 bagging 模型相比，boosting 可同时降低偏差和方差。在实践中，boosting 算法(如 AdaBoost) 也存在明显的高方差问题，也就是说，对训练数据有过拟合倾向$2$。

> 注1: L.Breiman. Bias, Variance, and Arcing Classifiers. 1996.
> 注2: G.Raetsch, T.Onoda, and K.R.Mueller. An Improvement of Adaboost Aboid Overfitting. In Proc. of the Int. Conf. on Neural Inforamtion Processing. Citeseer, 1998.

AdaBoost 与这里讨论的原始 boosting 过程不同，它使用整个训练集来训练弱学习机，其中训练样本在每次迭代中都会重新被赋予一个权重，在上一弱学习机错误地基础上进行学习，进而构建一个更强大的分类器。在深入到 AdaBoost 算法具体细节之前，先通过下图更深入了解一下 AdaBoost 的基本概念:

![在这里插入图片描述](https://img-blog.csdnimg.cn/20190830235950580.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L0x1Q2gxTW9uc3Rlcg==,size_16,color_FFFFFF,t_70)

为循序渐进地介绍 AdaBoost，我们从子图1开始，它代表了一个二类别分类问题的训练集，其中所有的样本都被赋予相同的权重。基于此训练集，我们得到一棵单层决策树(以虚线表示)，它尝试尽可能通过最小化代价函数(或者是特殊情况下决策树集成中的不纯度得分)划分两类样本(三角形和圆形)。在下一轮(子图2)中，我们为前面误分类的样本(圆形)赋予更高的权重。此外，我们还降低被正确分类样本的权重。下一棵单层决策树将更加专注于具有最大权重的训练样本，也就是那些难于区分的样本。如子图2所示，弱学习机错误划分了圆形类的三个样本，它们在子图3中被赋予更大的权重。假定 AdaBoost 集成只包含 3轮 boosting 过程，我们就能够用加权多数投票将不同重采样训练子集上得到的三个弱学习机进行组合，如子图4所示。

现在我们队 AdaBoost 的基本概念有了更好的认识，下面通过伪代码更深入地学习该算法。为了便于阐述，我们用十字符号($\times$)来表示向量的元素相乘，用点号($\cdot$)表示两个向量的内积，算法步骤如下:

1. 以等值方式为权重向量 $w$ 赋值，其中 $\sum_i w_i=1$。
2. 在 $m$ 轮 boosting 操作中，对第 $j$ 轮做如下操作:
3. 训练一个加权的弱学习机: $C_j=train(X, y, w)$。
4. 预测样本类标 $\hat y = predict(C_j, X)$。
5. 计算权重错误率 $ \varepsilon = w \cdot (\hat y == y)$。
6. 计算相关系数: $ \alpha_j =0.5 \log \frac {1-\varepsilon}{\varepsilon}$。
7. 更新权重: $w:=w \times \exp(-\alpha_j \times \hat y \times y)$。
8. 归一化权重，使其和为 1: $w:w/ \sum_i w_i$。
9. 完成最终的预测: $\hat y = \large( \sum_{j=1}^ m (\alpha_j \times p redict(C_j, X) > 0) \large)$。

请注意，低5步中表达式 ($\hat y == y$) 的值为 1 或 0，其中 1表示对应的预测结果正确，0 表示错误。

虽然 AdaBoost 算法看上去很简单，我们接下来用下面表格中的 10 个样本作为讯轮机，通过一个具体的例子更深入地了解此算法:

![在这里插入图片描述](https://img-blog.csdnimg.cn/20190831000023348.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L0x1Q2gxTW9uc3Rlcg==,size_16,color_FFFFFF,t_70)

表格的第 1列为样本的索引序号，为 1~10。假设此表格代表了一个一维的数据集，第 2列就相当于单个样本的值。第 3列是对应于训练样本 $x_i$ 的真实类标 $y_i$，其中 $y_i \in \{1, -1\}$。第 4列为样本的初始权重，权重值相等，且通过归一化使其和为 1。在训练样本数量为 10 的情况下，我们将权重 $w$ 中的权重向量 $w$ 中的权值 $w_i$ 都设定为 0.1。假定我们的划分标准为 $x \leq 0.3$，第 5列存储了预测类标 $\hat y$。基于前面的伪代码给出的权重更新规则，最后一列存储了更新后的权重值。

咋一看，权重更新的计算似乎有些复杂，我们来逐步讲解计算过程。首先计算第 5步中权重的错误率:

$$
\begin{aligned}
\varepsilon & = 0.1 \times 0 + 0.1 \times 0 + 0.1 \times 0 + 0.1 \times 0 + 0.1 \times 0 + 0.1 \times 0 + 0.1 \times 0 + 0.1 \times 0 + 0.1 \times 0 + 0.1 \times 0   \\
& = \frac {3}{10}
\end{aligned}
$$

下面来计算相关系数 $\alpha_j$(第6步)，该系数将在第 7步权重更新及最后一个步骤多数投票预测中作为权重来使用。

$$
\alpha = \frac {0.5 \log (1-\varepsilon)}{\varepsilon} \thickapprox 0.424
$$

在计算得到相关系数 $\alpha_j$ 后，我们可根据下述公式更新权重向量:

$$
w: = w \times \exp(- \alpha_j \times \hat y \times y)
$$

其中，$\hat y \times y$ 为预测了类标向量和真实类标向量逐元素相乘。由此，如果某个预测值 $\hat y_i$ 正确，则 $\hat y \times y$ 的符号为正，而且 $\alpha_i$ 本神值为正，则第 $i$ 个权重会被降低:

$$
0.1 \times \exp(-0.424 \times 1 \times 1) \approx 0.066
$$

类似地，如果 $\hat y$ 预测的类标错误，则第 $i$ 个权重将按照如下方式更新:

$$
0.1 \times \exp(-0.424 \times 1 \times (-1)) \approx 0.153
$$

或者向这样:

$$
0.1 \times \exp(-0.424 \times (-1) \times (1)) \approx 0.153
$$

在完成所有权重向量值的更新后，我们通过归一化使所有权重的和为 1(第8个步骤):

$$
w: = \frac {w} {\sum_i w_i}
$$

其中, $\sum_i w_i = 7 \times 0.065 + 3 \times 0.153 = 0.914 $。

由此，对于分类正确的样本，其对应的权重在下一轮 boosting 中将从初始的 0.1 降为 $ 0.066/0/914 \approx 0.072$。同样，对于分类错误的样本，其对应权重将从 0.1 提高到 $0.153/0.914 \approx 0.167$。

简而言之，这就是 AdaBoost。下面进入实践操作，通过 scikit-learn 训练一个 AdaBoost 集成分类器。我们将使用上一节训练 bagging 元分类器的葡萄酒数据集。通过 base_estimator 属性，我们在 500 棵单层决策树上训练 AdaBoostClassifier 。

```python
from sklearn.ensemble import AdaBoostClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import accuracy_score
from sklearn.preprocessing import LabelEncoder
import pandas as pd

data_url = 'https://archive.ics.uci.edu/ml/machine-learning-databases/wine/wine.data'
df_wine = pd.read_csv(data_url, header=None)
df_wine.columns = ['Class label', 'Alcohol', 'Malic acid', 'Ash', 
        'Alcalinity of ash', 'Magnesium', 'Total phenols', 'Flavanoids',
        'Nonflavanoid phenols', 'Proanthocyanins', 'Color intensity',
        'Hue', 'OD280/OD315 of diluted wines', 'Proline']
df_wine = df_wine[df_wine['Class label'] != 1]
y = df_wine['Class label'].values
X = df_wine[['Alcohol', 'Hue']].values
le = LabelEncoder()
y = le.fit_transform(y)
X_train, X_test, y_train, y_test = \
    train_test_split(X, y, test_size=0.4, random_state=1)

tree = DecisionTreeClassifier(criterion='entropy', max_depth=1)
ada = AdaBoostClassifier(base_estimator=tree, n_estimators=500,
                         learning_rate=0.1, random_state=0)
tree = tree.fit(X_train, y_train)
y_train_pred = tree.predict(X_train)
y_test_pred = tree.predict(X_test)
tree_train = accuracy_score(y_train, y_train_pred)
tree_test = accuracy_score(y_test, y_test_pred)
print('Decision tree train/test accuracies %.3f/%.3f' 
      %(tree_train, tree_test))
```

输出结果:

```output
Decision tree train/test accuracies 0.845/0.854
```

由结果可见，与上一节中为剪枝决策树相比，单层决策树对于训练数据过拟合的程度更加严重一点:

```python
ada = ada.fit(X_train, y_train)
y_train_pred = ada.predict(X_train)
y_test_pred = ada.predict(X_test)
ada_train = accuracy_score(y_train, y_train_pred)
ada_test = accuracy_score(y_test, y_test_pred)
print('AdaBoost tree train/test accuracies %.3f/%.3f' 
      %(ada_train, ada_test))
```

还可以看到，AdaBoost 模型准确预测了所有的训练集类标，与单层决策树相比，它在测试集上的表现稍好。不过，在代码中也可看到，我们在降低模型偏差的同时，使得方差有了额外的增加。

处于演示的目的，我们使用了另外一个简单的例子，但可以发现，与单层决策树相比，AdaBoost  分类器能够些许提高分类性能，并且与上一节中训练的 bagging 分类其的准确率接近。不过请注意: 重复使用测试街进行模型选择不是一个好的方法。集成分类器的泛化性能可能会被过渡优化，对此我们在第6章中已经做过详细介绍。

最后，我们来看一下决策区域的形状:

```python
x_min = X_train[:, 0].min() - 1
x_max = X_train[:, 0].max() + 1
y_min = X_train[:, 1].min() - 1
y_max = X_train[:, 1].max() + 1
xx, yy = np.meshgrid(np.arange(x_min, x_max, 0.1),
                     np.arange(y_min, y_max, 0.1))
f, axarr = plt.subplots(nrows=1, ncols=2, 
                        sharex='col', sharey='row',
                        figsize=(8,3))

for idx, clf, tt in zip([0, 1], [tree, ada], 
                        ['Decision Tree', 'AdaBoost']):
    clf.fit(X_train, y_train)
    Z = clf.predict(np.c_[xx.ravel(), yy.ravel()])
    Z = Z.reshape(xx.shape)
    axarr[idx].contourf(xx, yy, Z, alpha=0.3)
    axarr[idx].scatter(X_train[y_train==0, 0],
            X_train[y_train==0, 1], c='b', marker='^')
    axarr[idx].scatter(X_train[y_train==1, 0],
            X_train[y_train==1, 1], c='r', marker='o')
    axarr[idx].set_title(tt)

axarr[0].set_ylabel('Alcohol', fontsize=12)
plt.text(10.2, -1.2, s='Hue', ha='center', va='center', fontsize=12)
plt.show()
```



通过观察决策区域，我们可以看到 AdaBoost 的决策区域比单层决策树的决策区域复杂得多。此外，还注意到 AdaBoost 对待特征空间的划分与上一节中训练的 bagging 分类器十分类似。

![在这里插入图片描述](https://img-blog.csdnimg.cn/2019083100005055.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L0x1Q2gxTW9uc3Rlcg==,size_16,color_FFFFFF,t_70)

对集成技术做一个总结: 毋庸置疑，与单层分类器相比，集成学习提高了计算复杂度。但在实践中，我们需仔细衡量是否愿意为适度预测性你那个而付出更多的计算成本。

关于预测性能与计算成本两者之间的权重问题，一个常被提及的例子就是著名的一百万美元的 Netflix 竞赛(`$1 Million Netfix Prize`)，最终胜出者就使用了集成技术。此算法的详细内容请参见 A.Toescher 等人的论文$3$。虽然获胜队伍得到了一百万美元的奖励，但由于模型高高复杂性，Netflix 公司一直未将该模型投诸实际应用中$4$:

> 注3: A.Toescher, M.Jahrer, and R.M.Bell. The Bigchaos Solution to the Netfix Grand Prize. Netflix prize documentation, 2009. (读者可通过 http://www.stat.osu.edu/~dmsl/GrandPrize2009_BPC_BigChaos.pdf 获取)。
> 注4: 请参见 http://techblog.netflix.com/2012/04/netflix-recommendations-beyond-5-stars.html 。


# 7.6 本章小结

在本章中，我们介绍了集成领域中最热门且应用最广泛的技术。集成方法通过组合不同的分类器模型来抵消分类器固有的缺陷，通常能够得到一个稳定且性能优异的模型，因此在业界和机器学习领域得到了广泛的追捧。

在本章开始的时候，我们用 Python 实现了一个 MajorityVoteClassifier 类，它可以通过组合不同的算法得到一个分类器。进而我们学习了 bagging，它能够在训练集上通过 boostrap 进行随机抽样，并以多数投票为准则组合多个单独训练的成员分类器，称为一种能够有效降低模型方差的模型。然后我们讨论了 AdaBoost，它是一种基于弱学习机的算法，能够从前一个弱学习机错误中进行学习。

在前面的章节中，我们讨论了各种学习算法、调优和评估技术。后面的章节，我们将着眼机器学习的一个特定应用——情感分析，这已成为和社交时代一个有趣的话题。