---
date: 2025-02-20
authors:
  - mingminyu
categories:
  - 机器学习
tags:
  - 转载
  - XGBoost
slug: grid-search-and-kfold-in-xgboost
readtime: 20
---

# 使用网格搜索和K折交叉验证来优化 XGBoost 分类模型

> 原文地址：https://mp.weixin.qq.com/s/uBrIfGc8PXIx1xiKC1dtww


本篇文章将重点介绍如何在分类任务中对 XGBoost 进行优化，XGBoost 的优势在于其处理大规模数据、提高模型准确性的同时能够防止过拟合，然而要充分发挥 XGBoost 在分类任务中的潜力，选择合适的超参数至关重要。

为了寻找最佳的超参数组合，通常会借助 **网格搜索** 和 **K 折交叉验证** 优化技术。网格搜索通过系统地遍历多个超参数组合来确定最佳配置，而 K 折交叉验证则通过将数据集分成 K 个子集以评估模型的泛化能力，结合这两种方法，可以有效地避免单次训练可能带来的过拟合风险，并为模型选择最佳的超参数。

接下来，我们将通过具体的示例代码，详细演示如何运用网格搜索和K折交叉验证优化 XGBoost 分类模型的过程。

## 1. 数据预处理

```python linenums="1"
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split

df = pd.read_csv('Dataset.csv')

# 划分特征和目标变量
X = df.drop(['target'], axis=1)
y = df['target']

# 划分训练集和测试集，`stratify` 参数用于分层抽样
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=df['target']
    )
```

从 Dataset.csv 中读取数据，并将其分为训练集和测试集，为后续的模型训练和评估做好准备，通过分层采样（`stratify` 参数）保证训练集和测试集的类别分布一致，这对于模型的公平性和泛化能力至关重要，该数据集为二分类数据。

## 2. 定义 XGB 模型参数

```python linenums="1"

import xgboost as xgb
from sklearn.model_selection import GridSearchCV

# XGBoost模型参数
params_xgb = {
    'learning_rate': 0.02,
    'booster': 'gbtree',
    'objective': 'binary:logistic',
    'max_leaves': 127,
    'verbosity': 1,
    'seed': 42,
    'nthread': -1, 
    'colsample_bytree': 0.6,
    'subsample': 0.7,
    'eval_metric': 'logloss'
}
```

上述超参数的解释如下：

| 参数               | 描述                                                         |
| ------------------ | ------------------------------------------------------------ |
| `learning_rate`      | 学习率，控制每一步的步长，用于防止过拟合，通常值范围：0.01 ~ 0.1 |
| `booster`           | 提升方法，这里使用梯度提升树（Gradient Boosting Tree）        |
| `objective`         | 损失函数，这里使用逻辑回归，用于二分类任务；如果是多分类任务，可选值为 `multi:softmax` 或 `multi:softprob`。`'multi:softmax'` 或 `objective: 'multi:softprob'`，`multi:softmax:` 输出预测类别，`multi:softprob`: 输出每个类别的概率 |
| `num_class`        | 类别数，二分类任务为 2，多分类任务为类别数                     |
| `max_leaves`        | 每棵树的叶子节点数量，控制模型复杂度，较大值可以提高模型复杂度但可能导致过拟合 |
| `verbosity`         | 控制 XGBoost 输出信息的详细程度，0 表示无输出，1 表示输出进度信息 |
| `seed`              | 随机种子，用于重现模型的结果                                   |
| `nthread`           | 并行运算的线程数量，`-1` 表示使用所有可用的 CPU 核心                 |
| `colsample_bytree`  | 每棵树随机选择的特征比例，用于增加模型的泛化能力               |
| `subsample`         | 每次迭代时随机选择的样本比例，用于增加模型的泛化能力            |
| `eval_metric`       | 评价指标，二分类使用对数损失（`logloss`），多分类使用交叉熵（cross-entropy）或者多分类对数损失（`mlogloss`），其他指标还有 `merror` 等。 |



