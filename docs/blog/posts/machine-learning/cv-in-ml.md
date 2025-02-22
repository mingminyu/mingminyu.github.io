---
date: 2025-02-22
authors:
  - mingminyu
categories:
  - 机器学习
tags:
  - 转载
  - 交叉验证
slug: cv-in-ml
readtime: 20
---

# 机器学习中的交叉验证

> 原文地址：https://mp.weixin.qq.com/s/q0pMvHDXLl7xWxmB4OqSvw

交叉验证（Cross-Validation）是机器学习中一种常用的模型验证技术，用于评估模型的表现，并防止模型过拟合。它通过在不同的训练-验证集划分上重复训练模型，从而得到更稳健的模型评估结果，其核心思想是将数据集划分为多个子集，通过在这些子集之间轮流训练和验证模型，评估模型的泛化能力。

<!-- more -->

## 1. 交叉验证的作用

- 泛化：交叉验证有助于评估模型对独立数据集的泛化程度，防止过度拟合或欠拟合。
- 模型选择：通过比较不同模型或超参数设置之间的性能指标来帮助选择最佳模型。
- 偏差-方差权衡：它提供了对模型的偏差-方差权衡的见解，有助于平衡复杂性和性能。

常见的交叉验证方法包括：K 折交叉验证、留一交叉验证、分层 K 折交叉验证等，各验证方法都有自己的优缺点，如下表。

| 方法               | 优点                                                         | 缺点                                                         |
| ------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| K 折交叉验证        | K 折交叉验证充分利用了整个数据集，使得评估结果更为稳健。此外，由于每个样本都在验证集中出现过，评估结果不会过于依赖某一部分数据。                                                     | 随着 K 值的增加，需要进行 K 次训练和验证，计算成本较高。                                                 |
| 分层 K 折交叉验证    | 类别平衡，在类别不平衡的数据集上，分层 K 折交叉验证能够避免某些折中类别样本过少，导致评估偏差 | 稍微复杂，与普通 K 折交叉验证相比，分层 K 折交叉验证在实现上稍微复杂，但大多数机器学习库（如 scikit-learn）都已内置了该功能。 |
| 留一交叉验证        |LOO-CV 使用了最大可能的数据进行训练，并对每个样本单独验证，理论上能提供最准确的评估。在数据量较小时，LOOCV可以最大限度地利用数据。 | 由于需要进行 N 次训练和验证，对于大数据集，LOO-CV 的计算成本极高。LOOCV 可能会导致评估结果方差较大，因为每次验证都仅基于单个样本。 |


## 2. K 折交叉验证

![](https://mingminyu.github.io/webassets/images/20250222-01.png)

K 折交叉验证是最常用的交叉验证方法之一，它通过将数据集划分为 **K** 份（折），并多次进行模型训练和验证，从而评估模型的性能。K 折交叉验证的步骤如下：

- **数据集划分**：将数据集随机划分为 K 个子集（或称为折），每个子集大小大致相同。
- **训练和验证**：
    - 依次选择其中一个子集作为验证集，剩余的 K-1 个子集合并为训练集。
    - 在训练集上训练模型，并在验证集上评估模型性能。
- **重复 K 次**：这个过程会重复 K 次，每次选择不同的子集作为验证集，其余部分作为训练集。
- **结果平均**：最终，计算每次验证的性能指标（如准确率、均方误差等），然后取这些指标的平均值，作为模型的最终评估结果。


```python linenums="1" hl_lines="8"
from sklearn.datasets import load_iris
from sklearn.model_selection import KFold, cross_val_score
from sklearn.linear_model import LogisticRegression

data = load_iris()
X, Y = data.data, data.target

kf = KFold(n_splits=5, shuffle=True, random_state=42)
lr_model = LogisticRegression(max_iter=200)

scores = cross_val_score(lr_model, X, Y, cv=kf)
print("K 折交叉验证的准确率: ", scores)
print("平均准确率: ", scores.mean())
```

## 3. 分层 K 折交叉验证

![](https://mingminyu.github.io/webassets/images/20250222-02.png)

分层 K 折交叉验证是 K 折交叉验证的一个变种，主要用于分类问题。它在划分数据集时，确保每个子集中各类别样本的比例与原始数据集保持一致。分层 K 折交叉验证的步骤如下：

- **数据集划分**：根据数据集中各类别的比例，将数据集划分为 K 份，每份中的类别比例与原始数据集相同。
- **训练和验证**：像普通的 K 折交叉验证一样，依次选择每个子集作为验证集，剩余的子集作为训练集。
- **结果平均**：最终，计算每次验证的性能指标（如准确率、均方误差等），然后取这些指标的平均值，作为模型的最终评估结果。

## 4. 留一交叉验证

留一法（LOO-CV）是一种特殊的 K 折交叉验证，其中 K 等于数据集的样本数。这意味着每次验证时，==只用一个样本作为验证集，其他所有样本作为训练集==。**在数据量较小时尤其有用，但计算开销较大**。


留一法交叉验证步骤如下：

- **数据集划分**：将数据集中的每个样本作为一个单独的折，所有其他样本作为训练集。
- **训练和验证**：对于每一个样本，使用其余样本训练模型，然后使用这个单一样本作为验证集。
- **重复 K 次**：这一过程会重复 N 次（N 为数据集样本总数），每次使用不同的样本作为验证集。
- **结果平均**：最终，计算每次验证的性能指标（如准确率、均方误差等），然后取这些指标的平均值，作为模型的最终评估结果。

```python linenums="1" hl_lines="8"
from sklearn.datasets import load_iris
from sklearn.model_selection import LeaveOneOut, cross_val_score
from sklearn.linear_model import LogisticRegression

data = load_iris()
X, Y = data.data, data.target

loo = LeaveOneOut()
lr_model = LogisticRegression(max_iter=200)
scores = cross_val_score(lr_model, X, Y, cv=loo)
print("留一交叉验证的准确率: ", scores)
print("平均准确率: ", scores.mean())
```
