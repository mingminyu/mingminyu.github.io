---
date: 2024-07-12
authors:
  - mingminyu
categories:
  - 机器学习
tags:
  - LightGBM
  - CatBoost
  - XGBoost
  - NGBoost
readtime: 15
---

# 提升树模型

<div class="grid cards annotate" markdown>

- :material-hexagon-multiple-outline: &nbsp; **[多种提升树模型集成预测](https://mp.weixin.qq.com/s/HrT_NsRGa0czcboP6-4eLA)**

    ---
    预测 California 的房价，分别训练 LGBM、XGB、CatBoost 与 NGB 4 个模型，对多个预测值取平均，使用 MSE、RMSE、MAE 以及 R^2^ 评估模型效果。

    ---
    **通过对 4 个模型的预测值取平均的方式，在评估指标上略优于 LGBM 和 XGB 的集成预测效果**

- :material-hexagon-multiple-outline: &nbsp; **[LightGBM 和 XGBoost 集成预测](https://mp.weixin.qq.com/s/ckdXc0TsVXERIayJVc3qMA)**

    ---
    预测城市循环燃油消耗 (1)，使用 KNN 算法填充特缺失值，对特征和标签都进行了归一化（最大最小缩放），分别训练 LGBM 和 XGB 模型，对两个模型的预测值取平均，使用 MSE、RMSE、MAE 以及 R^2^ 评估模型效果。

</div>
  1. 每加仑英里数 (Miles Per Gallon, MPG)

<!-- more -->

<div class="grid cards annotate" markdown>

- :material-hexagon-multiple-outline: &nbsp; **[Attention-LSTM 文本分类](https://mp.weixin.qq.com/s/h_p4mt5hEqz4p-OUFatLhw)**

    ---
    todo

</div>