---
date: 2025-06-18
authors:
  - mingminyu
categories:
  - 机器学习
tags:
  - 转载
  - 自动归因
slug: auto-attribution-by-adtributor-mcts
readtime: 20
---

# 自动归因算法：Adtributor 和 MCTS

> 原文地址：https://mp.weixin.qq.com/s/E5SxU5PwzOnp07_I9HdrPw

数据分析和数据运营每天都得花些时间回答灵魂拷问：指标为啥降了/为啥涨了？回答这些问题，不仅耗时耗力，还容易怀疑人生，啥也没干，咋指标又变了。不是所有的问题都有正确答案，但是所有的问题都可以有一套科学的思考逻辑去尝试，至少可以往前走一步，离答案更进一步；

学会用下面这些自动化归因算法，数据同学们在波动归因时可以往前多走一步，快速定位可能的根因，能节省不少时间。

<!-- more -->

## 1. Adtributor

### 1.1 解释度和惊喜度

Adtributor 是通过将波动转化为两个量化指标：解释度和惊喜度，通过两个指标对比挑选出最高的单一维度，并且只能拆解单一维度。

**解释度**（Explanatory Power）：就是某维度某变量的波动量除以该维度总波动量；比如西城区波动量除以区域维度整体的波动量；是数据同学每天拆解的计算方式，非常直观的计算公式；

![](https://mingminyu.github.io/webassets/images/20250621/02.png)

**惊喜度**（Surprise）: `p` 和 `q` 可以看做两个日期的维度所有值的概率分布，然后通过 JS 散度来计算 `p` 和 `q` 两个概率分布的差异度；这里不用 KL 散度是因为 KL 不是对称，JS 是对称的，我们的应用场景是两个分布的差异，不是强调用 `p` 来拟合 `q`，或 `q` 拟合 `p`；

![](https://mingminyu.github.io/webassets/images/20250621/03.png)

### 1.2 算法实现

对每一个维度所有变量遍历，按照惊喜度降序，判断当前解释度是否高于阈值 1，如果是，则累计解释度和惊喜度，如果否，则忽略改变量，重新遍历；当解释度累积到某个阈值，则停止遍历，得到累计惊喜度；最终的结果按照累计惊喜度降序排列，最高的 topN 就是根本波动原因；

![算法实现](https://mingminyu.github.io/webassets/images/20250621/04.png)

**数据示例**：北京某店铺销售额下降超过 10.1%，需要分析主要原因；

![](https://mingminyu.github.io/webassets/images/20250621/05.png)

```python linenum="1"
def surprise_cal(p: float, q: float):
    """计算惊喜度""""
    if p > 0 and q > 0: 
      s = 0.5 * (p * np.log(2 * p / (p + q)) + q * np.log(2 * q / (p + q))) 
    else:
      s = 0
    
    return s

def get_df_dim(df: pd.DataFrame, col: str, dt1: str, dt2: str):
    """
    dt1 对应 0517，而 dt2 对应 0510
    """
    df_tmp = df.groupby(col)[[dt1, dt2]].sum().reset_index()
    df_tmp['diff'] = df_tmp[dt1] -  df_tmp[dt2]
    df_tmp['p'] = ((df_tmp[dt1] + 1) / df_tmp[dt1].sum()).round(6)
    df_tmp['q'] = ((df_tmp[dt2] + 1) / df_tmp[dt2].sum()).round(6)
    df_tmp['sup'] = df_tmp[['p', 'q']].apply(lambda x: surprise_cal(x[0], x[1]), axis=1)
    df_tmp['ep'] = ((df_tmp['dt2'] - df_tmp['dt1']) / (df_tmp['dt2'].sum() - df_tmp['dt1'].sum())).round(6)
    df_tmp = df_tmp.sort_values(by='sup', ascending=False).reset_index(drop=True)
    return df_tmp


get_df_dim(df_raw, '区域', '5月17销售额', '5月10销售额')
```

![](https://mingminyu.github.io/webassets/images/20250621/06.png)

```python linenums="1"
teep = 0.001  # 单个维度的解释度阈值
tep = 0.9   # 累计解释度阈值
dim_lst = df_raw.columns[:3]

exp_set = []
for x in dim_lst:
    df_tmp = get_df_dim(df_raw, '区域', '5月17销售额', '5月10销售额')
    candidate = {'dim': [], 'sup': 0, 'ep': 0}
    tmp_lst = []
    explains, surprises = 0, 0

    for i in range(len(df_tmp)):
        if df_tmp['ep'][i] > teep:
            tmp_lst.append(df_tmp[i][[x, 'sup', 'ep']].values())
            surprises += df_tmp['sup'][i]
            explains += df_tmp['ep'][i]

            if explains >= tep:
                candidate['dim'] = tmp_lst
                candidate['sup'] = surprises
                candidate['ep'] = explains
                exp_set = candidate
                
                break
```

所以得出下降主要原因是：品类下降，其中奶茶下降最严重，蛋糕其次；

```python linenums="1"
sorted_data = dict(sorted(exp_set.items(), key=lambda x: x[1]['sup'], reverse=True))
print('波动贡献最大的维度：')

rank = 0
for k, v in sorted_data.items():
    rank += 1
    sup = round(v['sup'], 6)
    ep = round(v['ep'], 6)
    print(f'第{rank}名是：{k}，累计惊喜度为：{sup}，累计解释度为{ep}')
    print('维度最大的变量')
    print(pd.DataFrame(v['dim'], columns=['变量名', '惊喜度', '解释度']))
```

![](https://mingminyu.github.io/webassets/images/20250621/07.png)

## 2. HotSpot

### 2.1 潜在得分和蒙特卡洛树搜索

Adtributor 只能计算单维度，HotSpot 可以计算多个维度组合，比如奶茶和新用户组合维度；通过 Potential Score 和 MCTS 树算法遍历，找到贡献度最大的根因组合。

**潜在得分**（Potential Score）：已知5月17日和5月10日两组真实值，通过涟漪效应计算出5月17日的预估值，在通过预估值和真实值的距离和两组真实值的距离来得到不同维度的潜在得分，得分越大说明这组维度贡献的波动越大；

![](https://mingminyu.github.io/webassets/images/20250621/08.png)

**涟漪效应**（Ripple Effect）：某个维度如果是根因，则该维度和其他维度的组合下降也应该很大，且比例可计算；比如，品类维度是根因，那么咖啡、奶茶理应波动值也很大，且是按照同比例下降；

**MCTS树蒙特卡洛树搜索**（Monte Carlo Tree Search）：潜在得分遍历所有的维度组合计算效率太低，比如某维度有 n 个变量，那么遍历空间有 `2*n-1` 个。日常使用中维度一般超过 10 个计算就很困难了，比如按省份区域就有 30 个变量，计算效率太低；在前面的数据示例中，一共有 4*3*2=24 中变量，如果要完全遍历需要 2*24-1=16777215 个组合。通过MCTS能够节省大幅度提升计算效率；

MCTS 分为四步，简单说就是先从根节点触发，从单个变量逐渐添加 ps 最多的其他变量，每次添加更新 ps 值（如果添加的新变量后的 ps > 添加前 ps），并更新父节点分值；直到ps值达到收敛阈值，则停止；或迭代大于预设的最大次数，也停止；

![](https://mingminyu.github.io/webassets/images/20250621/09.png)

**层级剪枝**：为了进一步提升MCTS效率，用层级剪枝过滤得分大概率会很低的子组合；比如品类的蛋糕ps得分很低,那么蛋糕+海淀、蛋糕+朝阳大概率也不会高，直接过滤到这些树节点；

## 2.2 算法实现

从低维度到高维度组合，遍历 MCTS 计算 ps，直到得到ps>既定收敛阈值世界树，当前的维度就是波动归因；

![](https://mingminyu.github.io/webassets/images/20250621/10.png)

```python linenums="1"
import math
import pandas as pd

class MCTSNode:
    def __init__(self, state, parent = None):
        self.parent = parent
        self.children = []
        self.state = state
        self.visits = 0
        self.value = 0
        self.untried_actions = []

    def fully_expanded(self):
        return len(self.untried_actions) == 0

    def best_child(self, c_param: float = math.sqrt(2)):
        weights = [
            (node.value + c_param * math.sqrt(math.log(self.visits + 1) / (node.visits + 1))) 
            for node in self.children
          ]
        return self.children[weights.index(max(weights))]

# Ripple Effect 模拟 Potential Score
def ripple_effect(candicate_set: list, df_score: pd.DataFrame) -> float:
    """candidate_set: 候选组合集合，df_score 包含了0517和0510销售额的完整表"""
    simulated = df_score['5月17号销售额'].copy()
    for k in candicate_set:
        if k in simulated.index:
            simulated[k] = df_score['a'][k]
        
    d1 = ((df_score['5月10号销售额'] - simulated) ** 2).sum() ** 0.5
    d2 = ((df_score['5月10号销售额'] - df_score['5月10号销售额']) ** 2).sum() ** 0.5
    return max(1 - d1 / d2, 0) if d2 != 0 else 0.0, df_score['ele_key'][k], d1, d2
```

简易版 MTCS 实现，没有循环计算 ps 值版本：

```python linenums="1"
# MCTS 核心搜索逻辑
def mcts_search(elements: list, df_score: pd.DataFrame, max_iter: int = 20):
    root = MCTSNode(state=[])
    root.untried_actions = elements.copy()
    iter_time = 0
    for _ in range(max_iter):
        node = root
        iter_time += 1
        # Selection
        while node.fully_expanded() and node.children:
            node = node.best_child()

        if node.untried_actions:
            action = node.untried_actions.pop(0)
            new_state = node.state + [action]

            child = MCTSNode(state=new_state, parent=node)
            child.untried_actions = [e for e in elements if e not in new_state]
            node.children.append(child)
            node = child

        # Evaluation
        ps, state_temp, dl_d2 = ripple_potential_score(node.state, df_score)
        node.visits += 1
        node.value = max(node.value, ps)

        # Backup
        parent = node.parent
        while parent:
            parent.visits += 1
            parent.value = max(parent.value, ps)
            parent = parent.parent

    # 输出 value 最高的节点
    best = max(root.children, key=lambda n: n.value)
    return best.state, best.value
```

运行结果得出下降主要原因是：蛋糕_西城、奶茶_东城和奶茶_朝阳下降最严重；

```python linenums="1"
# 执行搜索
best_subset, best_score = mcts_search(element_pool, df_raw, 30)
print(f"贡献最大的组合维度是：", df_raw['ele_key'][best_subset], best_score)

sbest_subset, sbest_score = mcts_search([i for i in element_pool if i not in best_subset], df_raw, 30)
print(f"贡献第二大的组合维度是：", df_raw['ele_key'][sbest_subset], sbest_score)

tbest_subset, tbest_score = mcts_search(
  [i for i in element_pool if i not in best_subset + sbest_subset], df_raw, 30
  )
print(f"贡献第三大的组合维度是：", df_raw['ele_key'][tbest_subset], tbest_score)
```


## 3. Squeeze

Adtributor 和 HotSpot 只能处理加性指标（pv 收入等绝对值指标等），不能处理衍生指标（如 ctr 和人均收入，Adtributor 理论上可以，但是假设条件太苛刻要求分子分母是独立的，现实中很难满足）。 Squeeze 可以支持加性指标和衍生指标。

## 4. 总结

本文主要介绍 Adtributor 和 HotSpot 算法原理，并基于样例数据实战运行。真实情况的数据肯定要比示例复杂得多，有时一个维度的不同变化波动方向可能不同，A 增 B 降，这样自动归因算法可能结果不明显；有时候指标波动来自外部因素影响，这些因素不能被业务量化，就很难解释为啥指标降了。

不是所有的问题都有正确答案，这些自动化归因算法，至少可以往前走一步，离答案更进一步。
