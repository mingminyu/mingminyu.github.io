---
date: 2025-02-18
authors:
  - mingminyu
categories:
  - 深度学习
tags:
  - 转载
  - Transformer
slug: dive-into-tranformer
readtime: 20
---

# 终于将 Transformer 算法搞懂了

> 原文地址: https://mp.weixin.qq.com/s/uMICN3Qi4IZJGhtnmuaaGQ

![Transformer 架构](https://mingminyu.github.io/webassets/images/20250218-03.png)

Transformer 是一种深度学习模型架构，最早由 Vaswani 等人在 2017 年的论文《**Attention is All You Need**》中提出，专门为处理序列数据（如自然语言处理任务中、时间序列预测等）而设计。

与之前的递归神经网络（RNN）和长短期记忆网络（LSTM）相比，Transformer 通过 ==注意力机制（Attention Mechanism）来捕捉序列中各个元素之间的依赖关系==，从而避免了传统序列模型（RNN 和 LSTM）在处理长序列时的 **梯度消失或梯度爆炸** 的问题，显著提高了并行计算的能力，并且在处理长序列时具有更好的效果。

<!-- more -->

!!! info "知识补充"

    1. **梯度消失**：在反向传播过程中，梯度逐渐变小，最终趋近于零，导致模型参数无法有效更新，主要原因是 RNN 在处理序列数据时，会将 ==时间步展开==。每个时间步的梯度是通过链式法则计算的，梯度是多个小梯度的乘积。如果这些梯度值小于 1，多次相乘后会趋近于零。尤其是使用 `tanh` 或者 `sigmod` 等激活函数时，梯度值通常较小，进一步加剧了梯度消失问题。

    2. **梯度爆炸**：在反向传播过程中，梯度逐渐变大，最终导致数值溢出。随着时间步展开，如果梯度值大于1，多次相乘后会迅速增大，导致梯度爆炸。此外，权重初始化不当也可能引发梯度爆炸。

    LSTM 通过引入 **门控机制**（输入门、遗忘门、输出门）机制缓解了梯度消失问题，能更好地捕捉长期依赖关系。
    
    - **遗忘门**：控制哪些信息需要保留或丢弃。
    - **输入门**：控制新信息的输入。
    - **输出门**：控制输出信息。

    常规解决梯度消失或梯度爆炸的方法有:

    - **梯度裁剪**：对梯度进行裁剪，防止梯度爆炸。
    - **权重初始化**：使用合适的权重初始化方法，如 Xavier 或 He 初始化。
    - **激活函数**：使用 ReLU 等激活函数，缓解梯度消失。
    - **优化算法**：使用 Adam 等优化算法，自动调整学习率。
    - **网络结构**：使用 LSTM 或 GRU 等改进结构，替代标准 RNN。

## 1. 整体架构

![Transformer 整体架构](https://mingminyu.github.io/webassets/images/20250218-04.png)

Transformer 模型主要由两部分组成：**编码器**（Encoder）和 **解码器**（Decoder），编码器用于将输入序列映射到一个连续的表示，解码器则根据这个表示生成输出序列。

### 1.1 编码器

编码器将输入序列（例如一段文本）转化为一系列特征表示，它由 N 个相同层堆叠而成，每个层包括二个主要子层：

- 多头自注意力（Multi-Head Self-Attention，MHA）
- 前馈网络（Feed-Forward Network，FFN）

每个子层后都采用了残差连接和层归一化，用于提高模型训练的稳定性，加速收敛。

### 1.2 解码器

解码器根据编码器生成的表示和解码器的历史输出，逐步生成目标序列（例如翻译后的文本），它由 N 个相同层堆叠而成，每个层包括三个主要子层。

- 掩码多头自注意力机制（Masked Multi-Head Self-Attention）
- 编码器-解码器注意力机制（Encoder-Decoder Attention）
- 前馈神经网络（Feed-Forward Network）

与编码器类似，每个子层后也采用了残差连接和层归一化。

## 2. 核心组件

### 2.1 输入嵌入

在 Transformer 中，输入嵌入层将每个词（或子词）映射为一个 d 维的向量，假设输入序列为 $X = [x_1, x_2, \cdots, x_n]$，嵌入矩阵 $E$ 将每个词 $x_i$ 转换为一个向量 $e_i$：
$$ e_i = E x_i $$
其中 $e_i \in \mathbb{R}^d $ 表示词嵌入后的向量，$d$ 是词向量的维度。

![输入文本的嵌入表示](https://mingminyu.github.io/webassets/images/20250218-05.png)

### 2.2 位置编码

由于 Transformer 模型没有显式的递归结构，它无法直接捕捉序列中元素的顺序信息。因此，必须通过位置编码来为每个输入词向量添加位置信息，使得模型能够理解词语在序列中的相对位置。

![位置编码器](https://mingminyu.github.io/webassets/images/20250219-01.png)

常用的实现方法是使用正弦和余弦函数生成的位置编码：
$$
\begin{align}
PE(i, 2k) &= \sin \left(\frac{i}{1000^{2k/d}}\right) \\\\
PE(i, 2k+1) &= \cos \left(\frac{i}{1000^{2k/d}}\right)
\end{align}
$$
其中，$i$ 是词的位置（例如序列中第 $i$ 个词），$k$ 是位置编码的维度索引，$d$ 是嵌入的维度。

```python linenums="1" title="位置编码的实现" hl_lines="9-10"
from torch import nn

class PositionalEncoding(nn.Module):
    def __init__(self, d_model, max_len=5000):
        super(PositionalEncoding, self).__init__()
        pe = torch.zeros(max_len, d_model)
        position = torch.arange(0, max_len).float().unsqueeze(1)
        div_term = torch.exp(torch.arange(0, d_model, 2).float() * -(math.log(10000.0) / d_model))
        pe[:, 0::2] = torch.sin(position * div_term)
        pe[:, 1::2] = torch.cos(position * div_term)
        pe = pe.unsqueeze(0)
        self.register_buffer('pe', pe)

    def forward(self, x):
        return x + self.pe[:, :x.size(1)]
```

### 2.3 自注意力机制

自注意力机制是 Transformer 的核心，它通过计算输入序列中每个元素与其他元素的相关性，来捕捉序列中的全局依赖关系。

![自注意力机制](https://mingminyu.github.io/webassets/images/20250219-02.png)

计算步骤如下所示：

- **输入**：假设我们有一个输入矩阵 $X \in \mathbb{R}^{n \times d}$，其中 $n$ 是序列长度，$d$ 是每个词的维度。
- **生成查询（Q）、键（K）、值(V) 矩阵**：将输入矩阵 $X$ 分别他用过线性变换得到查询（Q）、键（K）、值(V) 矩阵 $$Q = XW_Q，K = XW_K，V = XW_V $$，其中 $W_Q, W_K, W_V$ 是训练得到的权重矩阵
- **计算注意力得分**：通过计算查询 $Q$ 和键 $K$ 的点积来衡量它们之间的相似性，然后对其进行缩放（除以 ）以避免梯度消失或爆炸。$$ \text{Attention Score} = \frac{QK^T}{\sqrt{d_k}}$$
- **应用 `softmax` 函数**：对注意力得分进行 `softmax` 操作，得到归一化的权重 $$ \text{Attention Weight} = \text{softmax}(\text{Attention Score}) = \text{softmax} \left(\frac{QK^T}{\sqrt{d_k}}\right)$$
- **加权求和**：将注意力权重与值矩阵 $V$ 相乘，得到加权后的输出。 $$ \text{Output} = \text{Attention Weight} \times V = \text{softmax} \left(\frac{QK^T}{\sqrt{d_k}}\right) V $$

### 2.4 多头注意力机制

多头自注意力机制（Multiple Head Attention， MHA）是自注意力机制的扩展，它通过并行计算多个自注意力头，来捕获输入序列中不同子空间的关系，从而增强模型的表达能力。

![多头注意力机制](https://mingminyu.github.io/webassets/images/20250219-03.png)

多头自注意力将查询、键、值矩阵分别分割成 $h$ 组，然后独立计算每组的注意力，最后将这些注意力结果拼接在一起，并通过一个线性变换得到最终输出。

数学公式如下： $$ \text{MHA}(Q, K, V) = \text{Concat}(h_1, \dots, h_h)W^O $$

其中，$h_i = \text{Attention}(QW_i^Q, KW_i^K, VW_i^V)$ 为每个头的输出，$W^o$ 是最终的线性变换矩阵。

```python linenums="1" title="多头注意力机制的实现"
import torch
import torch.nn as nn


class MultiHeadAttention(nn.Module):
    def __init__(self, d_model, n_heads):
        super(MultiHeadAttention, self).__init__()
        self.d_model = d_model
        self.n_heads = n_heads
        self.d_k = d_model // n_heads  # 每个头的维度
        
        # 查询、键、值的线性变换
        self.W_q = nn.Linear(d_model, d_model)
        self.W_k = nn.Linear(d_model, d_model)
        self.W_v = nn.Linear(d_model, d_model)
        self.W_o = nn.Linear(d_model, d_model)

    def forward(self, x):
        batch_size, seq_len, _ = x.size()

        # 线性变换得到查询、键、值
        Q = self.W_q(x)
        K = self.W_k(x)
        V = self.W_v(x)

        # 拆分为多个头
        Q = Q.view(batch_size, seq_len, self.n_heads, self.d_k).transpose(1, 2)
        K = K.view(batch_size, seq_len, self.n_heads, self.d_k).transpose(1, 2)
        V = V.view(batch_size, seq_len, self.n_heads, self.d_k).transpose(1, 2)

        # 计算注意力得分（Q和K的点积，除以sqrt(d_k)）
        scores = torch.matmul(Q, K.transpose(-2, -1)) / math.sqrt(self.d_k)

        # 使用softmax进行归一化
        attn_weights = F.softmax(scores, dim=-1)

        # 加权求和
        output = torch.matmul(attn_weights, V)

        # 合并所有头
        output = output.transpose(1, 2).contiguous().view(batch_size, seq_len, self.d_model)

        # 最后通过一个线性层
        output = self.W_o(output)

        return output
```

### 2.5 前馈神经网络

前馈神经网络是 Transformer 中每个编码器和解码器层的组成部分，用于进一步提取特征，前馈神经网络通常由两个全连接层和一个激活函数（如 ReLU）组成。
$$
\text{FFN}(x) = \max(0, xW_1 + b_1)W_2 + b_2
$$
其中，$W_1$ 和 $W_2$ 是全连接层的权重矩阵。

FFN 的作用是对每个位置的表示进行独立的非线性变换，增强模型的表达能力。

```python linenums="1" title="前馈神经网络的实现"
class FeedForward(nn.Module):
    def __init__(self, d_model, d_ff=2048):
        super(FeedForward, self).__init__()
        self.fc1 = nn.Linear(d_model, d_ff)
        self.fc2 = nn.Linear(d_ff, d_model)

    def forward(self, x):
        return self.fc2(F.relu(self.fc1(x)))
```

### 2.6 残差连接

在 Transformer 中，所有的子层（如自注意力、前馈神经网络）都采用了残差连接。残差连接通过将子层的输入直接添加到子层的输出，缓解了深层网络中的梯度消失问题，帮助模型训练更深层的网络。
$$
\text{Output} = \text{SubLayer}(x) + x
$$

### 2.7 层归一化

层归一化用于对每一层的输出进行归一化处理，从而加速训练并提高模型的稳定性。

$$ \text{LayerNorm}(x) = \frac{x - \mu}{\sigma} \cdot \gamma + \beta $$

其中，$\mu$ 和 $\sigma$ 分别是输入 $x$ 的均值和标准差，$\gamma$ 和 $\beta$ 是可学习的参数，分别用于缩放和平移归一化的结果。

```python linenums="1" title="层归一化的实现"
class ResidualLayerNorm(nn.Module):
    def __init__(self, layer, d_model):
        super(ResidualLayerNorm, self).__init__()
        self.layer = layer
        self.norm = nn.LayerNorm(d_model)
    
    def forward(self, x):
        return self.norm(x + self.layer(x))  # 残差连接
```

### 2.8 掩码多头注意力机制

在 Transformer 的解码器中，掩蔽多头自注意力机制用于确保生成每个单词时，只能依赖于当前和之前生成的单词，而不能“看到”未来的单词。

掩码多头自注意力机制（Masked Multi Head Attention，MMHA）的实现与普通的多头自注意力机制类似，区别在于在计算注意力得分时对未来的位置进行屏蔽。

假设输入的序列长度为 n，每个词向量通过线性变换得到了查询（Q）、键（K）和值（V）向量。
标准的自注意力计算过程如下：
$$
\text{Attention}(Q, K, V) = \text{softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right)V
$$

但在掩码多头自注意力中，我们对 $QK^T$ 的结果添加了一个掩蔽矩阵 $M$，掩码矩阵的目的是使得模型在预测时无法看到未来的信息。
$$
\text{MMHA}(Q, K, V) = \text{softmax} \left(\frac{QK^T }{\sqrt{d_k}} + M \right)V
$$
其中，$M$ 是掩码矩阵。

$$
M_{ij} = \begin{cases}
0 & \text{if } i \leq j \\
- \infty & \text{if } i > j
\end{cases}
$$

掩码矩阵中的负无穷值在 `softmax` 操作后会变为零，即不会对最终的注意力权重产生影响，从而确保当前位置只能关注当前和之前的词。

![掩码矩阵](https://mingminyu.github.io/webassets/images/20250219-06.png)

### 2.9 编码器-解码器注意力机制

编码器-解码器注意力机制（Encoder-Decoder Attention，EDA）是 Transformer 架构中的另一关键组件，它的主要作用是允许解码器在生成输出时，能够关注到编码器的输出。

具体来说，编码器-解码器注意力机制的查询向量（Q）来自解码器当前时刻的输出，而键向量（K）和值向量（V）来自编码器的输出。因此，解码器的每个位置都会关注到整个输入序列的信息，帮助解码器生成更符合上下文的输出。

$$
\text{EDA}(Q, K_{\text{encdoer}}, V_{\text{encdoer}}) = \text{softmax}\left(\frac{QK_{\text{encoder}}^T}{\sqrt{d_k}}\right)V_{{\text{encoder}}}
$$

这里，$Q$ 来自解码器当前时刻的输入，$K_{\text{encoder}}$ 和 $V_{{\text{encoder}}}$ 来自编码器的输出。

![Cross-Attention Block](https://mingminyu.github.io/webassets/images/20250219-03.png)

