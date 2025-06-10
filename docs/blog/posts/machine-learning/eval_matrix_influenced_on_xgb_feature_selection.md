---
date: 2025-06-10
authors:
  - mingminyu
categories:
  - 机器学习
tags:
  - 转载
  - XGBoost
  - 特征选择
slug: eval_matrix_influenced_on_xgb_feature_selection
readtime: 20
---

# 评估指标差异对XGBoost特征筛选与模型性能排名的影响

> 原文地址：https://mp.weixin.qq.com/s/uySG1mER1vHitV-k7mSsSg

在机器学习中，特征选择是提高模型性能、减少计算复杂度和避免过拟合的关键步骤。而选择合适的特征选择方法，可以大大提升模型的准确性和训练效率。常见的特征选择方法有很多，这里介绍两种方法 **前向特征选择** 和 **递归特征消除（RFE）**。

前向特征选择和RFE的主要区别就在于它们如何进行特征排名和模型训练：

- **前向特征选择会固定特征排名**：在前向特征选择中，特征是按照某种标准进行预排序的。每次添加一个特征（排名最高），模型训练一次，并评估该特征对模型性能的影响。每个特征的排名是基于初始的预排序结果确定的，所以在整个过程中特征的排名不会动态变化。
- **递归特征消除（RFE）是动态特征排名**：与前向特征选择不同，RFE是动态的，每次删除一个特征后（排名最低），都会重新训练模型，并计算剩余特征的相对重要性。每次训练和删除都会影响特征的排名，因此每次训练后特征排名会发生变化。这使得RFE在筛选特征时的顺序是动态变化的，因此最后的特征选择结果会受到每次模型训练的影响，RFE也可以看作是后向特征筛选的一种实现形式。

实际上，前向特征选择和递归特征消除（RFE） 都与 **特征排名** 密切相关。无论是通过逐步添加特征，还是通过递归删除不重要的特征，它们的选择过程都依赖于特征的重要性排序。因此，特征的排名直接决定了哪些特征被选中，哪些特征被剔除。如果特征排名发生变化，最终的特征选择结果也会发生显著变化。特征排名的不同将会直接影响模型中保留的特征，进而影响模型的表现。

为了深入理解这种影响，本文将利用 XGBoost模型探讨不同评估指标下特征排名对特征筛选的影响。

<!-- more -->

## 1. 基础代码

```python linenums="1"
import numpy as np
import pandas as pd
import xgboost as xgb
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split


plt.rcParams['font.family'] = 'Times New Roman'
plt.rcParams['axes.unicode_minus'] = False
df = pd.read_excel('data.xlsx')
# 划分特征和目标变量
X = df.drop(['序号', 'Tensile strength/MPa'], axis=1)
y = df['Tensile strength/MPa']
# 划分训练集和测试集
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
# 构建XGBoost回归模型
xgb_reg = xgb.XGBRegressor(random_state=42)

# 用训练集数据训练模型
xgb_reg.fit(X_train, y_train)

# 获取模型中特征的重要性，分别使用不同的评估指标
importance_weight = xgb_reg.get_booster().get_score(importance_type='weight')
importance_gain = xgb_reg.get_booster().get_score(importance_type='gain')
importance_cover = xgb_reg.get_booster().get_score(importance_type='cover')
```

![](https://mingmin.github.io/mingminyu/webassets/images/20250610/01.png)

使用 XGBoost 构建回归模型（XGBRegressor），训练数据集后，提取并计算特征在模型中的重要性排名前20的特征（原始数据存在130个特征），分别通过 `weight`、`gain` 和 `cover` 三种评估指标来衡量特征的重要性（但除了这三种，还可以使用SHAP值、置换重要性、基于树的特征重要性和Lasso/Ridge正则化等方法来衡量特征的重要性）。需要注意的是，XGBoost 也可以用于分类任务，只需将 XGBRegressor 修改为 XGBClassifier，即可用于分类模型的训练和特征重要性计算。

![](https://mingmin.github.io/mingminyu/webassets/images/20250610/02.png)

可以发现根据不同的重要性计算方法（Weight、Gain、Cover），得出的重要特征及其排名有显著差异

![](https://mingmin.github.io/mingminyu/webassets/images/20250610/03.png)

这三张图分别展示使用 XGBoost 模型的 Weight、Gain 和 Cover三种不同特征重要性度量方法，进行前向特征选择时，模型性能（平均R²）随特征数量增加的变化情况。不同的特征重要性评估指标，特征选择和模型性能表现有所不同：

- 在 Weight 指标下，重点选择了约 6 个特征（如 C21-2、E15-1、E15-2等）。随着这些特征的加入，模型的 $R^2$ 迅速提升，尤其是 C21-2 特征，加入前几个特征后，$R^2$ 在 4-6 个特征时趋于平稳，达到约 0.80 左右，继续增加特征对性能提升不明显，甚至可能略有下降；
- 在 Gain 指标下，选择了约 11 个特征（如 E12-2、C3-2、A2-2等）。模型的 $R^2$ 随着特征的加入持续上升，在 9-11 个特征后达到约 0.85，性能较为稳定。此时，E12-2 特征的增益远高于其他特征，后续特征的增益迅速减小；
- 在 Cover 指标下，重点选择了约 9 个特征（如 C8-1、A2-2、A3-1 等），模型 $R^2$ 在加入特征后稳步提升，在9个特征，$R^2$ 达到 0.83-0.84。与前两者不同 Cover 指标下的特征重要性分布较为平均，多个特征如 C8-1、A2-2 和 A3-1显示出较高的贡献率。

值得注意的是，与其他两种方法相比，基于 Weight 选择特征时，模型的 $R^2$ 置信区间（浅红色阴影）在加入更多特征后相对最窄。这表明，当使用 Weight 指标筛选特征时，模型的性能更为稳定，且在不同数据抽样下，预测精度的波动较小

所以在实际应用此类方法进行特征选择时，强烈建议尝试基于不同特征排名规则进行多轮特征筛选，以全面评估特征的真实价值，并避免因单一评价标准带来的片面性。当然除了追求最高的模型预测性能（例如 $R^2$ 最大化）之外，模型性能的稳定性也是一个至关重要的评估因素。 图中的置信区间（浅红色阴影区域）直观反映了这一点。例如，即使某个指标选出的特征组合平均性能略逊一筹，但如果其性能波动范围（置信区间）更窄，则可能意味着该模型在面对新数据时表现更稳健、更可靠。因此，在决策最终特征集时，应综合考量模型的平均效能与稳定性。
