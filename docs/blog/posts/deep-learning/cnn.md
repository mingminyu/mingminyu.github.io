---
date: 2025-02-22
authors:
  - mingminyu
categories:
  - 深度学习
tags:
  - 转载
  - 卷积神经网络
slug: cnn
readtime: 20
---

# 卷积神经网络

> 原文地址：https://mp.weixin.qq.com/s/ZdqhybBTt7Xd0CE2WEoYjg

![](https://mingminyu.github.io/webassets/images/20250222-03.png)

卷积神经网络（Convolutional Neural Network，CNN）是一种深度学习的架构，特别适用于处理具有网格拓扑结构的数据，如图像（2D网格）和音频（1D序列），它在计算机视觉、图像和视频识别、图像分类、医学图像分析等领域中非常流行且有效。

<!-- more -->

## 1. 卷积层

卷积层通过一组可学习的过滤器（或称核）对输入数据进行滤波操作，每个过滤器负责从原始图像数据中提取特定的特征。当过滤器在输入数据上滑动（或卷积）时，它计算过滤器与输入数据的局部区域之间的点积，生成输出中的一个激活值。这个过程在整个输入数据上重复进行，形成特征图（Feature Map）。

![特征图=输入图像x特征检测器](https://mingminyu.github.io/webassets/images/20250222-04.png)

**参数共享** 和 **局部连接** 是 CNN 中使用的两个原则。特征图中的所有神经元共享权重，这称为参数共享。局部连接是指每个神经元仅连接到输入图像的一部分（与所有神经元完全连接的神经网络相反），这减少了系统中的参数数量并加快了计算速度。

## 2. 填充和步幅

在卷积神经网络（CNN）中，**填充**（Padding）和 **步幅**（Stride）是两个关键的参数，它们影响卷积层如何在输入数据上应用滤波器。这两个参数对输出特征图的尺寸、模型的 **感受野** 大小以及总体网络结构的性能有重要作用。

填充的工作原理是增加卷积神经网络的处理区域。卷积核是一个神经网络过滤器，它在图片中移动，扫描每个像素并将数据转换为更小或更大的格式。将填充添加到图像帧中，通过为卷积核提供更多空间来覆盖图像来帮助卷积核处理图像。

![卷积的计算过程](https://mingminyu.github.io/webassets/images/20250222-05.gif)

步长决定滤波器如何在输入矩阵上进行卷积，即移动多少像素。当步长设置为 1 时，过滤器一次移动一个像素，当步长设置为 2 时，过滤器一次移动两个像素。步幅值越小，输出越小，反之亦然。

![不同步长](https://mingminyu.github.io/webassets/images/20250223-01.png)

## 3. 池化层

池化层用于降低特征图的空间尺寸，从而减少参数数量和计算复杂度，同时使特征检测更加鲁棒。常见的池化操作包括最大池化（取区域内的最大值）和平均池化（计算区域内的平均值）。

![池化](https://mingminyu.github.io/webassets/images/20250223-02.png)

## 4. 全连接层（Fully Connected Layer）

在卷积和池化层提取并组合特征后，全连接层用于对这些特征进行分类或回归分析。全连接层的每个神经元都与前一层的所有激活值相连，其输出通过权重总和计算得到。

```python linenums="1"
import numpy as np
from keras.datasets import mnist
from keras.models import Sequential
from keras.layers import Dense, Conv2D, Flatten, MaxPooling2D
from keras.utils import to_categorical

# 加载MNIST数据集
(train_images, train_labels), (test_images, test_labels) = mnist.load_data()
# 归一化图像数据
train_images = train_images.reshape((60000, 28, 28, 1))
test_images = test_images.reshape((10000, 28, 28, 1))
train_images = train_images.astype('float32') / 255
test_images = test_images.astype('float32') / 255

# 对标签进行one-hot编码
train_labels = to_categorical(train_labels)
test_labels = to_categorical(test_labels)

# 初始化模型
model = Sequential()
# 添加卷积层，使用32个3x3的滤波器和ReLU激活函数
model.add(Conv2D(32, (3, 3), activation='relu', input_shape=(28, 28, 1)))
# 添加最大池化层
model.add(MaxPooling2D((2, 2)))
# 添加另一个卷积层
model.add(Conv2D(64, (3, 3), activation='relu'))
# 添加另一个最大池化层
model.add(MaxPooling2D((2, 2)))
# 添加另一个卷积层
model.add(Conv2D(64, (3, 3), activation='relu'))
# 展平层，从卷积层到全连接层的过渡
model.add(Flatten())
# 添加全连接层
model.add(Dense(64, activation='relu'))
# 添加输出层，10个节点对应10个类别
model.add(Dense(10, activation='softmax'))
# 编译模型
model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
# 训练模型
model.fit(train_images, train_labels, epochs=5, batch_size=64)

# 在测试集上评估模型
test_loss, test_acc = model.evaluate(test_images, test_labels)
print('Test accuracy:', test_acc)
```
