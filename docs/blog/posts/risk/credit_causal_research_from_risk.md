---
date: 2025-06-09
authors:
  - mingminyu
categories:
  - 风控策略
tags:
  - 转载
  - 风控策略
slug: credit-causal-research-from-risk
readtime: 2
---

# 信贷额度对风险的因果推断研究

> 原文地址：https://mp.weixin.qq.com/s/xL8j3z6QIdjQwMTW4UhibA

在信贷领域的因果推断研究中，传统方法多聚焦于二元处理变量（如是否发放营销优惠券）的因果效应估计。然而，当涉及贷款额度、利率等连续型处理变量时，传统二元处理变量的因果推断框架不再适用，需采用适用于连续处理变量的分析方法。

本文聚焦于贷款额度这一连续型处理变量的因果推断问题，采用公开的lendingclub的贷款数据集，结合Imbens《 The propensity score with continuous treatments》这篇文章中的广义倾向得分方法，对连续性处理变量的因果效应进行分析。

<!-- more -->

## 1. 数据预处理
