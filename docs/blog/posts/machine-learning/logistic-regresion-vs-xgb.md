---
date: 2025-06-09
authors:
  - mingminyu
categories:
  - 机器学习
tags:
  - LightGBM
  - LR
slug: logistic-regresion-vs-xgb
readtime: 15
---

# 逻辑回归 vs XGBoost

> 原文地址：https://mp.weixin.qq.com/s/uEMQXYs27MyZsN6-82-ccA

逻辑回归（Logistic Regression）和 XGBoost（eXtreme Gradient Boosting）是分类任务中广泛使用的两种机器学习模型，它们代表了机器学习中两种典型的思想：

- 逻辑回归：简洁的线性模型，适合解释性强、计算开销小的场景；
- XGBoost：复杂的集成模型，强调预测精度和模型能力，适合高维非线性任务。

我们将从模型结构、数学推导、损失函数、优化方法、泛化能力等等介绍。

<!-- more -->

## 1. 模型结构对比

### 1.1 逻辑回归（Logistic Regression）

逻辑回归是一个广义线性模型（GLM），用于二分类任务，它通过 `Sigmoid` 函数将线性回归的结果映射到概率空间：

$$
\hat{y} = \sigma(w^Tx + b) = \frac{1}{1 + e^{-(w^Tx + b)}}
$$

其中：

- $x \in \mathbb{R}$ 是输入特征；
- $w \in \mathbb{R}$ 是权重向量；
- $b \in \mathbb{R}$ 是偏置项；
- $\sigma(z) = \frac{1}{1 + e^{-z}}$ 是 `Sigmoid` 函数，将实数映射到 $[0, 1]$ 的区间。

### 1.2 XGBoost（eXtreme Gradient Boosting）

XGBoost 是一种集成学习模型，属于 **梯度提升树（GBDT）** 的优化实现，它将多个 CART（Classification and Regression Trees）树模型组合在一起：

$$
\hat{y_i} = \sum_{i=1}^{n} \hat{f_i}(x_i), \quad \hat{f_i}  \in {F}
$$

其中：

- $f_i$ 是第 $i$ 个树（基学习器，base learner）；
- $F$ 是所有可能 CART 树的空间；
- 每棵树将特征映射为一个预测值（通常是 log-odds）；
- 预测值 $\hat{y_i}$ 是所有基学习器的预测值之和。

## 2. 损失函数对比

## 3. 泛化能力与模型复杂度

| | 逻辑回归 | XGBoost |
| --- | --- | --- |
| 模型类型 | 线性模型 | 非线性集成树 |
| 拟合能力 | 弱，线性边界 | 强，支持高阶交互 |
| 正则化 | $L1$, $L2$ | 树结构正则 + shrinkage |
| 可解释性 | 高，特征权重直观 | 低，但可用 SHAP 分析 |
| 对异常值鲁棒性 | 低 | 高（树结构不敏感）|
| 对缺失值处理 | 需预处理 | 自动处理缺失 |
| 训练时间 | 快，适合大规模数据 | 慢，但可以并行加速 |
| 特征工程依赖 | 高 | 低，自动学习特征交互 |

## 4. 完整案例

我们在本案例中对比两类代表性模型：

- 逻辑回归：线性模型代表，以其简洁性和可解释性著称。
- XGBoost：基于梯度提升框架的集成模型，以其性能卓越、鲁棒性强而广泛应用于Kaggle竞赛和工业界。

代码中，构造了一个二维、便于模型区分度对比的虚拟数据集：

- 每个类别分布在不同的高斯分布上，添加一定的噪声；
- 特征数量为 2，便于可视化；
- 类别标签为0和1，构成二分类问题。

```python linenums="1"
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.datasets import make_classification
from sklearn.linear_model import LogisticRegression
from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score, roc_auc_score, roc_curve, confusion_matrix,
    precision_recall_curve
)

sns.set(style="whitegrid")
plt.rcParams["font.family"] = "sans-serif"
plt.rcParams["font.sans-serif"] = ["Arial"]

# 生成虚拟数据
X, y = make_classification(
    n_samples=1000, n_features=10, n_informative=5,
    n_redundant=2, n_classes=2, random_state=42
)
X = pd.DataFrame(X, columns=[f"Feature {i}" for i in range(1, 11)])
y = pd.Series(y, name="Target")

# 划分训练集和测试集
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.3, random_state=42
)

# 模型训练
lr_model = LogisticRegression(max_iter=1000)
xgb_model = XGBClassifier(use_label_encoder=False, eval_metric="logloss")

lr_model.fit(X_train, y_train)
xgb_model.fit(X_train, y_train)

# 模型预测概率
y_pred_prob_lr = lr_model.predict_proba(X_test)[:, 1]
y_pred_prob_xgb = xgb_model.predict_proba(X_test)[:, 1]

# ROC曲线
fpr_lr, tpr_lr, _ = roc_curve(y_test, y_pred_prob_lr)
fpr_xgb, tpr_xgb, _ = roc_curve(y_test, y_pred_prob_xgb)

# PR曲线
precision_lr, recall_lr, _ = precision_recall_curve(y_test, y_pred_prob_lr)
precision_xgb, recall_xgb, _ = precision_recall_curve(y_test, y_pred_prob_xgb)

# 混淆矩阵
cm_lr = confusion_matrix(y_test, lr_model.predict(X_test))
cm_xgb = confusion_matrix(y_test, xgb_model.predict(X_test))

# AUC
auc_lr = roc_auc_score(y_test, y_pred_prob_lr)
auc_xgb = roc_auc_score(y_test, y_pred_prob_xgb)

# 开始画图（四合一图）
fig, axes = plt.subplots(2, 2, figsize=(16, 12))

# ROC 曲线
axes[0, 0].plot(fpr_lr, tpr_lr, label=f"Logistic Regression (AUC = {auc_lr:.2f})", color="dodgerblue", linewidth=2)
axes[0, 0].plot(fpr_xgb, tpr_xgb, label=f"XGBoost (AUC = {auc_xgb:.2f})", color="orange", linewidth=2)
axes[0, 0].plot([0, 1], [0, 1], "k--", lw=1)
axes[0, 0].set_title("ROC Curve", fontsize=14)
axes[0, 0].set_xlabel("False Positive Rate")
axes[0, 0].set_ylabel("True Positive Rate")
axes[0, 0].legend()
axes[0, 0].grid(True)

# PR 曲线
axes[0, 1].plot(recall_lr, precision_lr, label="Logistic Regression", color="dodgerblue", linewidth=2)
axes[0, 1].plot(recall_xgb, precision_xgb, label="XGBoost", color="orange", linewidth=2)
axes[0, 1].set_title("Precision-Recall Curve", fontsize=14)
axes[0, 1].set_xlabel("Recall")
axes[0, 1].set_ylabel("Precision")
axes[0, 1].legend()
axes[0, 1].grid(True)

# 混淆矩阵 - 逻辑回归
sns.heatmap(cm_lr, annot=True, fmt="d", cmap="Blues", ax=axes[1, 0])
axes[1, 0].set_title("Confusion Matrix - Logistic Regression", fontsize=14)
axes[1, 0].set_xlabel("Predicted Label")
axes[1, 0].set_ylabel("True Label")

# 混淆矩阵 - XGBoost
sns.heatmap(cm_xgb, annot=True, fmt="d", cmap="Oranges", ax=axes[1, 1])
axes[1, 1].set_title("Confusion Matrix - XGBoost", fontsize=14)
axes[1, 1].set_xlabel("Predicted Label")
axes[1, 1].set_ylabel("True Label")

plt.tight_layout()
plt.suptitle("模型性能对比图（Logistic Regression vs XGBoost）", fontsize=18, y=1.02)
plt.subplots_adjust(top=0.92)
```

> 对比结果

- ROC Curve（接收者操作特征曲线）：显示模型在所有分类阈值下的性能。曲线越靠近左上角，模型性能越好。XGBoost 的 AUC 值明显高于 Logistic Regression，说明其整体分类能力更强。

- Precision-Recall Curve（精准率-召回率曲线）：衡量在不同阈值下，模型对正类预测的准确性和完整性。在样本不平衡时，比 ROC 曲线更能真实反映分类器性能。XGBoost 的 PR 曲线更“高且右”，表示其在高召回率下还能保持较高精度。

- Confusion Matrix（Logistic Regression）：展示模型的预测分类错误和正确的数量。颜色越深表示对应类别数量越多。逻辑回归的假阳性偏多，说明对边界样本的辨识能力弱。

- Confusion Matrix（XGBoost）：相比逻辑回归，XGBoost 的总体预测更准确，误判更少。

最终的话，若模型的 **可解释性要求高、特征关系较线性、对部署性能敏感**，优先使用逻辑回归。若追求 **预测准确率、数据存在非线性关系、样本量中等偏大**：优先使用 XGBoost。

在某些情况下，可以将逻辑回归与 XGBoost 串联使用，比如：先用 XGBoost 做特征筛选，再用逻辑回归做决策解释，或者模型融合、Stacking 提升整体性能。
