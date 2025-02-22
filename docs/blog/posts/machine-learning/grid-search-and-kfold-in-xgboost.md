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

<!-- more -->

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

## 3. 定义模型

使用定义的参数初始化XGBoost回归模型

```python
model_xgb = xgb.XGBRegressor(**params_xgb)
```

## 4. 定义参数网格


下面我们定义一个网格参数，

```python linenums="1"
param_grid = {
    'n_estimators': [100, 200, 300, 400, 500],  # 树的数量，控制模型的复杂度
    'max_depth': [3, 4, 5, 6, 7],  # 树的最大深度，控制模型的复杂度，防止过拟合
    'min_child_weight': [1, 2, 3, 4, 5],  # 节点最小权重，值越大，算法越保守，用于控制过拟合
}
```

定义需要进行网格搜索的参数范围，包括树的数量（`n_estimators`）、最大深度（`max_depth`）和最小节点权重（`min_child_weight`），这些参数用于调整模型的复杂度和防止过拟合。

当然除了这些参数以外还存在很对参数。下面给出一些参考（这些参数并没有参与网格调参），网格参数范围多少当对运行速度成倍数增长

```python linenums="1"
param_grid = {
    'learning_rate': [0.01, 0.02, 0.05, 0.1],  # 学习率，控制每一步的步长，防止过拟合
    'gamma': [0, 0.1, 0.2, 0.3],  # 节点分裂所需的最小损失减少量，值越大，算法越保守，用于控制过拟合
    'subsample': [0.6, 0.7, 0.8, 0.9],  # 每次迭代时随机选择的样本比例，防止过拟合
    'colsample_bytree': [0.5, 0.6, 0.7, 0.8],  # 每棵树随机选择的特征比例，防止过拟合
    'reg_alpha': [0, 0.01, 0.1, 1],  # L1正则化项的权重，值越大，模型越简单，用于防止过拟合
    'reg_lambda': [0, 0.01, 0.1, 1],  # L2正则化项的权重，值越大，模型越简单，用于防止过拟合
}
```

## 5. 创建 GridSearchCV 对象

`GridSearchCV` 用于进行网格搜索和交叉验证，`scoring` 设为 `neg_root_mean_squared_error`，即负均方根误差，作为评估指标，`cv=5` 表示使用5折交叉验证，`n_jobs=-1` 表示使用所有可用的 CPU 核心进行并行计算。

```python linenums="1"
grid_search = GridSearchCV(
    estimator=model_xgb, 
    param_grid=param_grid, 
    scoring='neg_root_mean_squared_error',
    cv=5, 
    n_jobs=-1, 
    verbose=1
)
```

## 6. 训练模型

```python linenums="1"
grid_search.fit(X_train, y_train)

# 输出最优参数
print("Best parameters found: ", grid_search.best_params_)
print("Best RMSE score: ", -grid_search.best_score_)
```

GridSearchCV 训练好之后，我们输出最优模型参数：

```python linenums="1"
Fitting 5 folders for each of 125 candidates, totalling 625 fits
Best parameters found:  { 
  'max_depth': 7, 
  'min_child_weight': 1, 
  'n_estimators': 500, 
}
Best RMSE score:  0.4666597060108463
```

- `5 folds` 表示使用 5 折交叉验证，即数据集被分成 5 个子集，每次使用其中的 4 个子集进行训练，1 个子集进行验证，这样进行 5 次，每个子集都作为一次验证集，
- 125 candidates: 表示总共有 125 组不同的参数组合需要评估（5x5x5），也就是定义的网格参数存在的组合形式，
- totalling 625 fits: 因为每个参数组合都要经过 5 次交叉验证，所以总共进行 625 次模型训练和评估（5x125=625）
- 最后模型找到的最佳参数组合为 `max_depth=7`、`min_child_weight=5`、`n_estimators=500`，使用这些参数，模型在验证集上的平均 RMSE 分数为 0.4666597060108463。


## 7. 最优参数下的模型

使用找到的最优参数重新训练模型，得到最终的最佳模型并保存。

```python
best_model = grid_search.best_estimator_
```

## 8. 模型评价

```python linenums="1"
from sklearn import metrics

# 预测
y_pred = best_model.predict(X_test)
y_pred_list = y_pred.tolist()  
mse = metrics.mean_squared_error(y_test, y_pred_list)
rmse = np.sqrt(mse)
mae = metrics.mean_absolute_error(y_test, y_pred_list)
r2 = metrics.r2_score(y_test, y_pred_list)
print("均方误差 (MSE):", mse)
print("均方根误差 (RMSE):", rmse)
print("平均绝对误差 (MAE):", mae)
print("拟合优度 (R-squared):", r2)
```

## 9. 可视化

这里采用 Matplotlib 进绘制实际值 (`y_test`) 和预测值 (`y_pred`) 之间的散点图，并在图中添加一个理想对角线（`y = x`），以便比较实际值和预测值的关系。

```python
import matplotlib.pyplot as plt

plt.figure(figsize=(10, 6), dpi=1200)
# 绘制 y_pred 和 y_test 的散点图
plt.scatter(y_test, y_pred, alpha=0.3, color='blue', label='Predicted vs Actual')
# 绘制一条 y = x 的对角线，用于参考
max_value = max(max(y_test), max(y_pred))
plt.plot([0, max_value], [0, max_value], color='red', linestyle='--', linewidth=2, label='Ideal Line (y = x)')
plt.title(f'Actual vs Predicted Values\nR-squared: {r2:.2f}')
plt.xlabel('Actual Values')
plt.ylabel('Predicted Values')
plt.legend()
plt.grid(True)
plt.show()
```

![真实值与预测值的散点图](https://mingminyu.github.io/webassets/images/20250221-01.png)
