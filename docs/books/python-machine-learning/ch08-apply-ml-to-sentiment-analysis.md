# 第8章：使用机器学习进行情感分析

> GitHub Notebook 地址: https://nbviewer.jupyter.org/github/rasbt/python-machine-learning-book/blob/master/code/ch08/ch08.ipynb

互联网和社交媒体在我们的生活中无处不在，人们的观点、评论及建议已经称为政治和商业领域的宝贵资源。得益于现代技术，我们能够高效地收集和分析此类数据。在本章中，我们将深入研究自然语言处理(natural language processing, NLP)领域的一个分支——情感分析(sentiment analysis)，还将学习如何使用机器学习算法基于文档的情感倾向(ploarity)——作者的观点——对文档进行分类。本章将涉及如下主题:

- 清晰和准备文本数据
- 基于文本文档构建特征向量
- 训练机器学习模型用于区分电影的正面与负面评论
- 使用 out-of-score 学习处理大规模文本数据集

# 8.1 获取 IMDb 电影评论数据集

情感分析，有时也称为观点挖掘(opinion miniing)，是 NLP 领域一个非常流行的分支；它分析的是文档的情感倾向(polarity)。情感分析的一个常见任务就是根据作者对某一主题所表达的观点或是情感来自文档进行分类。

在本章中，我们将使用由 Maas 等人$1$ 收集的互联网数据库(Internet Moview Database, IMDb)中的大量电影评论数据。此数据集包含 50000 个关于电影的正面或负面的评论，正面的意思是影片在 IMDb 数据库中的评分高于 6星，而负面的意思是影片的评分低于 5星。在本章后续内容中，我们将学习如何从这些电影评论的子集抽取有意义的信息，以此来构建模型并用于预测评论者对影片的喜好。

> 注1: A.L.Maas, R.E.Daly, P.T.Pham, D.Huang, A.Y.Ng, and C.Potts. Learning Word Vectors for Sentiment Analysis. In the proceedings of the 49th Annual Meeting of the Association for Computational Linguistics: Human Language Technologies, pages 142-150, Portland, Oregon, USAm June 2011. Association for Computational Linguistics.

读者可以通过链接 http://ai.stanford.edu/~amaas/data/sentiment/ 下载电影评论数据集的 gzip 压缩文档(84.1MB):

- 如果读者使用的是 Linux 或者 MacOS，可以打开一个终端窗口，使用 cd 命令定位到 download 目录，并执行 `tar -zxf ac1Imdb_v1.tar.gz` 命令解压数据集。
- 若使用 Windows，可以下载免费软件(如7-Zip$2$)解压下载的压缩文件。

> 注2: http://www.7-zip.org .

在成功提取数据集后，我们现在着手将从压缩文件中得到的各文本文档组合为一个 CSV 文件。在下面的代码中，我们把电影的评论读取到 pandas 的 DataFrame 对象中，使用普通的计算机该过程大约需要 10分钟的时间。为了实现处理过程的可视化，同时能够预测剩余处理时间，这里会用到 PyPrind 包(Python Progress Indicator，https://pypi.python.org/pypi/PyPrind/ )。读者可以执行 pip install pyprind 命令安装 PyPrind。

```python
import pyprind
import pandas as pd
import os

pbar = pyprind.ProgBar(50000)
labels = {'pos':1, 'neg':0}
df = pd.DataFrame()

for s in ('test', 'train'):
    for l in ('pos', 'neg'):
        path = './aclImdb/%s/%s' % (s, l)
        for file in os.listdir(path):
            with open(os.path.join(path, file), 'r') as infile:
                txt = infile.read()
                df = df.append([[txt, labels[l]]], ignore_index=True)
                pbar.update()
df.columns = ['review', 'sentiment']
```

输出结果:

```output
0% [##############################] 100% | ETA: 00:00:00
Total time elapsed: 00:01:52
```

执行上述代码，我们首先初始了一个包含 50000 次迭代的进度条对象 pbar，这也是我们准备读取的文档的数量。使用嵌套的 for 循环，我们迭代地读取 aclImdb 目录下的 train 和 test 两个子目录，以及 pos 和 neg 二级子目录下的文本文件，并将其附加到 DataFrame 对象 df 中，同时加入的还有文档对应的整数型类标(1 代表正面，0 代表负面)。

由于集成处理过后数据集中的类标是经过排序的，我们现在将使用 np.random 子模块下的 permutation 函数对 DataFrame 对象进行重排——由于在后续小节中我们将直接从本都驱动器中读取数据，因此重排对于后续将数据集划分为训练集和测试集的操作是非常有用的。出于使用方便的使考虑，我们将经过集成处理及重排后的评论数据集均存储为 CSV 文件:

```python
import numpy as np

np.random.seed(0)
df = df.reindex(np.random.permutation(df.index))
df.to_csv('./movie_data.csv', index=False)
```

本章后续内容中会使用该数据集，现在读取并输出前三个样本的摘要，以此来快速确认数据已按正确格式存储:

```python
import pandas as pd

df = pd.read_csv('./movie_data.csv')
df.head(3)
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/20190831000331553.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L0x1Q2gxTW9uc3Rlcg==,size_16,color_FFFFFF,t_70)


# 8.2 词袋模型简介

记得在第4章中，我们需要将文本或者单词等分类数据转换为数值格式，以方便在机器学习算法中使用。在本节，我们将介绍词袋模型(bag-of-words model)，它将文本以数值特征向量的形式来表示。词袋模型的理念很简单，可描述如下:

1. 我们在整个文档上为每个词汇创建了唯一的标记，例如单词。
2. 我们为每个文档构建一个特征向量，其中包含每个单词在此文档中出现的次数。

由于每个文档中出现的单词数量只是整个词袋中单词总量很小的一个子集，因此特征向量中的大多数元素为零，这也是我们称之为稀疏(sparse)的原因。这些内容听起来过于抽样，不过不用担心，下面我们将逐步讲解创建简单词袋模型的过程。

## 8.2.1 将单词转换为特征向量

如需根据每个文档中的单词数量构建词袋模型，我们可以使用 scikit-learn 中的 Count-Vectorizer 类。如下述代码所示，CountVectorizer 以文本数据数组作为输入，其中文本数据可以是个文档或仅仅是个句子，返回的就是我们所要构建的词袋模型:

```python
import numpy as np
from sklearn.feature_extraction.text import CountVectorizer

count = CountVectorizer()
docs = np.array([
    'The sun is shining','The weather is sweet',
    'The sun is shining and the weather is sweet'])
bag = count.fit_transform(docs)
```

通过调用 CountVectorizer 的 fit_transform 方法，我们创建了词袋模型的词汇库，并将下面三个句子转换为稀疏的特征向量:

1. The sun is shining
2. The weather is sweet
3. The sun is shining and the weather is sweet

 我们将相关词汇的内容显示出来，以更好地理解相关概念:

 ```python
 print(count.vocabulary_)
 ```

 输出结果:

 ```output
 {'the': 5, 'sun': 3, 'is': 1, 'shining': 2, 'weather': 6, 'sweet': 4, 'and': 0}
 ```

由上述命令的运行结果可见，词汇以 Python 字典的格式存储，将单个的单词映射为一个整数索引。下面我们来看一下之前创建的特征向量:

```python
print(bag.toarray())
```

输出结果:

```output
[[0 1 1 1 0 1 0]
 [0 1 0 0 1 1 1]
 [1 2 1 1 1 2 1]]
```

特征向量中的每个索引位置与通过 CountVectorizer 得到的词汇表字典中存储的整数值对应。例如，索引位置为 0的第一个特征对应单词 and，它只在最后一个文档中出现过；单词 is 的索引位置是 1(文档向量中的第二个特征)，它在三个句子中都出现过。出现在特征向量中的值也称作原始词频(raw term frequency):tf(t,d)——词汇 t 在文档 d 中出现的次数。

> 🔖 我们刚刚创建的词袋模型中，各项目的序列也称为 1元组(1-gram)或者单元组(unigram)模型——词汇表中的每一项或者每个单元代表一个词汇。更普遍地，自然语言处理(NLP)中各项(包括单词、字母、符号)的序列，也称作 n 元组(n-gram)。n 元组模型中数字 n 的选择依赖于特定的应用；例如，Kanaris 等人通过研究发现，在发垃圾邮件过滤中，n 的值为 3或者 4的 n 元组即可得到很好的效果(Ioannis Kanaris, Konstantinos Kanaris, Ioannis Houvardas, and Efstathios Stamatatos. Words vs Character N-Grams for Anti-Spam Filtering. International Journal on Artificial Intelligence Tools,16(06):1047-1067,2007)。对 n元组表示的概念做个总结，分别使用 1元组和 2元组来表示文档 “the sun is shining” 的结果如下:
> - 1元组: "the", "sun", "is", "shining" 
> - 2元组: "the sun", "sun is", "is shining"

借助于 scikit-learn 中的 CountVectorizer 类，我们可以通过设置其 `ngram_range` 参数来使用不同的 n 元组模型。此类默认为 1元组，使用 `ngram_range=(2,2)` 初始化一个新的 CountVectorizer 类，可以得到一个 z 元组表示。

## 8.2.2 通过词频-逆文档频率计算单词关联度

当我们分析文本数据时，经常遇到的问题就是: 一个单词出现在两种类型的多个文档中。这种频繁出现的单词通常不包含有用或具备辨识度的新式。在本小节中，我们将学习一种称作词频-逆文档频率(term frequency-inverse document frequency, tf-idf)的技术，它可以用于解决特征向量中单词频繁出现的问题。tf-idf 可以定义为词频与逆文档频率的乘积:

$$
\text{tf-idf}(t,d) = tf(t,d) \times idf(t, d)
$$

其中，`tf(t,d)` 是我们上一节中介绍的词频，而逆文档频率 `idf(t,d)` 可通过如下公式计算:

$$
idf(t,d) = \log \frac {n_d}{1 + df(d,t)}
$$

这里的 $n_d$ 为文档的总数，`df(d,t)` 为包含词汇 t 的文档 d 的数量。请注意，分母中加入常数 1是可选的，对于没有出现任何训练样本中的词汇，它能保证分母不为零；取对数是为了保证文档中出现频率较低的诋毁不会被赋予过大的权重。

scikit-learn 还实现了另外一个转换器: tfidfTransformer，它以 CountVectorizer 的原始词频作为输入，big将其转换为 tf-idf:

```python
from sklearn.feature_extraction.text import TfidfTransformer

count = CountVectorizer()
docs = np.array([
    'The sun is shining','The weather is sweet',
    'The sun is shining and the weather is sweet'])
tfidf = TfidfTransformer()
np.set_printoptions(precision=2)
print(tfidf.fit_transform(count.fit_transform(docs)).toarray())
```

输出结果:

```output
[[0.   0.43 0.56 0.56 0.   0.43 0.  ]
 [0.   0.43 0.   0.   0.56 0.43 0.56]
 [0.4  0.48 0.31 0.31 0.31 0.48 0.31]]
```

在上一小节中我们看到，is 在第三个文档中具有最高的词频，它是文档中出现得最为频繁地单词。但是在将特征向量转换为 tf-idf 后，单词 is 在第三个文档中只得到了一个相对较小的 tf-idf(0.48)，这是由于第以个第二个文档中都包含单词 is，因此它不太可能包含有用或是有辨识度的信息。

不过，如果我们人工计算特征向量中单个条目的 tf-idf 值，就会发现，TfidfTransformer 中对 tf-idf 的计算方式与我们此前定义的标准计算公式不同。scikit-learn 中实现的 idf 和 tf-idf 分别为:

$$
idf(t, d) = \log \frac {1+n_d}{1+df(d, t)}
$$

在 scikit-learn 中使用的 tf-idf 公式为:

$$
\text{tf-idf} (t, d) = tf(t, d) \times (idf(t,d)+1)
$$

通常在计算 tf-idf 之前都会对原始词频进行归一化处理，TfidfTransformer 就直接对 tf-idf 做了归一化。默认情况下(norm='l2')，scikit-learn 中的 TfidfTransformer 使用了 L2 归一化，它通过与一个未归一化特征向量 L2 范数的比值，使得返回向量的长度为 1:

$$
\nu_{norm} = \frac {\nu}{||\nu||_2} = \frac {\nu}{\sqrt {\nu_1^2 + \nu_2^2 + \dots + \nu_n^2}} = \frac {\nu}{(\sum_{i=1}^n \nu_i)^2}
$$

为确保读者能够理解 TfidfTransformer 的工作方式，为此我们给出一个例子，计算第三个文档中单词 is 的 tf-idf。

在文档 3中，单词 is 的瓷片为2(tf=2)，由于 is 在三个文档中都出现过，因此它的文档频率为 3(df=3)。由此，idf 的计算方法如下:

$$
idf("is", d3)=\log \frac{1 + 3}{1+3} = 0
$$

为了计算 tf-idf，我们需要为逆文档频率的值加 1，并且将其与词频相乘:

$$
\text {tf-idf}("is", d3) = 2 \times (0+1)=2
$$

如果我们对第三个文档中的所有条目重复此过程，将会得到如下 tf-idf 向量: `[1.69,2.00,1.29,1.29,1.29,2.00,1.29]`。大家应该注意到了，这里得到的特征向量的值不同于此前我们使用 TfidfTransformer 得到的值。最后还缺号一个队 tf-idf 进行 L2 进行归一化的步骤，计算方式如下:

$$
\text{tf-idf} ("is", d3)_norm \frac {[1.69,2.00,1.29,1.29,1.29,2.00,1.29]}{\sqrt 
{1.69^2+ 2.00^2+1.29^2+1.29^2+1.29^2+2.00^2+1.29^2}} \\
= [0.40, 0.48, 0.31, 0.31, 0.31, 0.48, 0.31]
$$

可以看到，现在的结果与使用 scikit-learn 中 TfidfTransformer 得到的值相同。既然已经理解了 tf-idf 的计算方式，我们进入下一节，将这些概念应用于电影评论数据集。

## 8.2.3 清洗文本数据

在前面的小节中，我们学习了词袋模型、词频以及逆文档频率。不过在构建词袋模型之前，最重要的一步就是——通过去除所有不需要的字符对文本数据进行清洗。为了说明此步骤的重要性，我们先展示一下经过重排数据集中第一个文档中的最后 50个字符:

```python
import pandas as pd

df = pd.read_csv('./movie_data.csv')
df.loc[0, 'review'][-50:]
```

输出结果:

```output
'to Star Cinema!! Way to go, Jericho and Claudine!!'
```

正如我们所见，文本中包含 HTML 标记、标点符号以及其他非字母字符。HTML 标记并未包含很多有用语义，标点符号可以在某些 NLP 语境中提供有用及附加信息。不过，为了简单起见，我们将去除标点符号，只保留标签符号，如 ":)"，因为它们在情感分析中通常是有用的。为了完成此任务，我们将使用 Python 的正则表达式(regex)库: re，代码如下:

```python
import re

def preprocessor(text):
    text = re.sub('<[^>]*>', '', text)
    emoticons = re.findall('(?::|;|=)(?:-)?(?:\)|\(|D|P)', text)
    text = re.sub('[\W]+', ' ', text.lower()) + \
        ' '.join(emoticons).replace('-', '')
    return text
```

通过代码中的第一个正则表达式 `<[^>]*>`，我们试图移除电影评论中所有的 HTML 标记。虽然许多程序员通常建议不要使用正则表达式机械 HTML，但这个正则表达式足以清理特定数据集。在移除了 HTML 标记后，我们使用稍微复杂的正则表达式寻找表情符号，并将其临时存储在 emoticons 中。接下来，我们通用正则表达式 `[\W]+`删除文本中所有的非单词字符，将文本转换为小写字母，最后将 emoticons 中临时存储的表情符号追加在经过处理的文档字符串后。此后，为了保证表情符号的一致，我们还删除了表情符号中代表鼻子的字符(-)。

> 🔖 虽然正则表达式为我们提供了一种在字符串中搜索特定字符的方便且有效的方法，但掌握它会有一个相对陡峭的学习曲线，而对正则表达式的讨论也超出了本书的范围。不过，读可以通过谷歌开发者门户找到相关的入门教程: https://developers.google.com/edu/python/regular-expressions ，或者查看 Python 中 re 模块的官方文档: https://docs.python.org/3.4/library/re.html 。

尽管将表情符号追加到经过清洗的文档字符串的最后，看上去不是最简洁的方法，但是当词袋模型中所有的符号都由单个单词组成时，单词的顺序并不重要。在对文档划分成条目、单词及符号进一步讨论之前，先来确认一下预处理操作是否能正常工作:

```python
print(preprocessor(df.loc[0, 'review'][-50:]))
print(preprocessor("<</a>This :) is :( a test :-)!"))
```

输出结果:

```output
'to star cinema way to go jericho and claudine '
'this is a test :) :( :)'
```

最后，由于我们将在下一节中反复使用在此经过清洗的文本数据，现在通过 preprocessor 函数移除 DataFrame 中所有的电影评论信息:

```python
df['review'] = df['review'].apply(preprocessor)
```

## 8.2.4 标记文档

准备好电影评论数据集后，我们需要考虑如何将文本语料拆分为单独的元素。标记(tokenize) 文档的一种常用方法就是通过文档的空白字符将其拆分为单独的单词。

```python
def tokenizer(text):
    return text.split()

tokenizer('runners like running and thus they run')
```

输出结果:

```output
['runners', 'like', 'running', 'and', 'thus', 'they', 'run']
```

在对文本进行标记的过程中，另外一种有用的技术就是词干提取(word steamming)，这是一个提取单词原形的过程，那样我们就可以将一个单词映射到其对应的词干上。最初的词干提取算法时由 Martin F.Porter 于 1979年提出的，由此也称为 Porter Steammer 算法$1$。Python 自然语言处理工具包(NLTK, http://www.nltk.org/ )实现了 Porter Stemming 算法，我们将在下一小节中用到它。要安装 NLTK，只要执行命令: `pip install nltk`。

> 注1: Martin F.Porter. An algorithm for suffix stripping. Program: electronic library and information systems, 14(3):130-137.1980.

```python
from nltk.stem.porter import PorterStemmer

porter = PorterStemmer()

def tokenizer_porter(text):
    return [porter.stem(word) for word in text.split()]

tokenizer_porter('runners like running and thus they run')
```

输出结果:

```output
['runner', 'like', 'run', 'and', 'thu', 'they', 'run']
```

> 🔖 尽管 NLTK 不是本章的重点，若读者对自然语言处理更进一步的兴趣，作者强烈建议访问 NLTK 的网站及其官方资料，它们均可通过链接 http://www.nltk.org/book/ 免费获得。

使用 nltk 包中的 PorterStemmer 修改 tokenizer 函数，使单词都恢复到其原始形式，借用前面的例子，单词 running 恢复为 run。

> 🔖 Porter stemming 算法可能是最原始也是最简单的词干提取算法了。其他流行的词干提取算法包括 Snowball steammer(Porter2，也称为“English” stemmer) 以及 Lancaster stemmer(Paice Husk stemmer)，与 Porter stemming 算法相比，它们提取速度更高不过提取时也更加野蛮。这些算法也在 nltk 包中得以实现(http://www.nltk.org/api/nltk.stem.html )。

正如前面例子所示，词干提取也可能生成一些不存在的单词，例如前面例子中提到的 thu(通过提取 thus 得到)，词形还原(lemmeatization)是一种以获得单个单词标准形式(语法上正确)——也就是所谓的词元(lemma)——为目的的技术。不过，相较于词干提取，词形还原的计算更加复杂和昂贵，通过实际应用中的观察发现，在文本分类中，这两种技术对分类结果的影响不大(Michal Tomanm Roman Tesarm and Karel Jezek. Influence of word normalization on the text classification. Proceedings of InSciT, pages 354-358,2006)。

下一章将使用词袋模型训练一个机器学习模型，在此之前，我们简要介绍下另一种有用的技术: 停用词移除(stop-word removal)。停用词是指在各种文本中太过常见，以致没有(或很少)含有用于区分文本所属雷白的有用信息。常见的停用词有 is、and、has 等。由于 tf-idf 可以降低频繁出现单词的权重，因此当我们使用原始或归一化的词频而不是 tf-idf 时，移除停用词是很有用的。

我们可以通过调用 nltk.download 函数得到 NLTK 库提供的停用词，并使用其中的 127 个停用词对电影评论数据进行停用词移除处理:

```python
import nltk

nltk.download('stopwords')
```

完成之后，可以通过如下方式加载和使用由 nltk.download 得到的英文停用词集:

```python
from  nltk.corpus import stopwords

stop = stopwords.words('english')
[w for w in tokenizer_porter('a runner likes running and runs a lot')[-10:] if w not in stop]
```

输出结果:

```output
['runner', 'like', 'run', 'run', 'lot']
```

# 8.3 训练用于文档分类的 Logistic 回归

在本节中，我们将训练一个 Logistic 回归模型以将电影评论划分为正面评价或负面评价。首先，将上一节中清洗过的文本文档对象 DataFrame 划分为 25000 个训练文档和 25000 个预测文档:

```python
import pandas as pd
from sklearn.model_selection import train_test_split

df = pd.read_csv('./movie_data.csv')
X_train, X_test, y_train, y_test = train_test_split(df['review'], df['sentiment'], test_size=0.5, random_state=0)
```
接下来，我们将使用 GridSearchCV 对象，并使用 5折分层交叉验证找到 Logistic 回归模型最佳的参数组合:

```python
from sklearn.grid_search import GridSearchCV
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.feature_extraction.text import TfidfVectorizer
from  nltk.corpus import stopwords

def tokenizer(text):
    return text.split()

def tokenizer_porter(text):
    return [porter.stem(word) for word in text.split()]

stop = stopwords.words('english')
tfidf = TfidfVectorizer(strip_accents=None, lowercase=False, preprocessor=None)
param_grid = [{'vect__ngram_range': [(1,1)],
               'vect__stop_words': [stop, None],
               'vect__tokenizer': [tokenizer, tokenizer_porter],
               'clf__penalty': ['l1', 'l2'],
               'clf__C': [1.0, 10.0, 100.0]},
              {'vect__ngram_range': [(1,1)],
               'vect__stop_words': [stop, None],
               'vect__tokenizer': [tokenizer, tokenizer_porter],
               'vect__use_idf': [False],
               'vect__norm': [None],
               'clf__penalty': ['l1', 'l2'],
               'clf__C': [1.0, 10.0, 100.0]}]
lr_tfidf = Pipeline([('vect', tfidf), ('clf', LogisticRegression(random_state=0))])
gs_lr_tfidf = GridSearchCV(lr_tfidf, param_grid, scoring='accuracy', cv=5, verbose=1, n_jobs=-1)
gs_lr_tfidf.fit(X_train.values, y_train.values)
```

在上述代码中使用参数组合初始化 GridSearchCV 对象时，我们严格限制了参数组合的数量，这是因为涉及大量的特征向量，以及数量众多的单词，会导致网格搜索的计算成本很高，使用普通的计算机，完成网格索大约需要 40分钟的时间。

在上述示例代码中，由于 TfidfVectorizer 组合使用了 CountVectorizer 和 TfidfTransformer，因此我们用 TfidfVectorizer 替代后面的两个类。param_grid 包含两个参数字典。在第一个字典中，我们使用了 TfidfVectorizer 的默认设置(`use_idf=True, smooth_idf=True` 以及 `norm='l2'`) 计算 tf-idf；我们在第二个字典中将采纳数设置为 `use_idf=False, smooth_idf=True`，以及 `norm='l2'`，以及原始词频上完成模型的训练。此外，对于 Logistic 回归算法，我们通过惩罚项使用了 L2 和 L1 正则化，并通过逆正则参数 C 定义一个取值区间来比较不同正则化强度之间的差异。

在网格搜索结束后，我们可以输出最佳的参数集:

```python
print('Best parameter set: %s ' % gs_lr_tfidf.best_params_)
```

输出结果:

```output
Best parameter set: {'clf__C': 10.0, 'clf__penalty': 'l2', 'vect__ngram_range': (1, 1), 'vect__stop_words': None, 'vect__tokenizer': <function tokenizer at 0x1a14edbe18>} 
```

由此可见，网格索索返回的最佳参数设置集合为: 使用不含有停用词的常规标记(tokeh)生成器，同时在 Logistic 回归中使用 tf-idf，其中 Logistic 回归分类器使用 L2 正则化，正则化强度 C=10.0。

使用网格索索得到的最佳模型，我们分别输出训练集上 5折交叉验证的准确率得分，以及在测试集上的分类准确率:

```python
print('CV Accuracy: %.3f' % gs_lr_tfidf.best_score_)
clf = gs_lr_tfidf.best_estimator_
print('Test Accuracy: %.3f' % clf.score(X_test, y_test))
```

输出结果:

```output
CV Accuracy: 0.890
Test Accuracy: 0.890
```

结果表明，我们的机器学习模型针对电影评论是正面评价还是负面评价的分类准确率为 90%。

> 🔖 朴素贝叶斯分类器(Naive Bayes classifier)是迄今为止执行文本分类十分流行的一种分类器，特别是用于垃圾邮件过滤。朴素贝叶斯分类器易于实现，计算性能高效，相对于其他算法，它在小数据集上的表现异常出色。虽然本书并未讨论朴素贝叶斯分类器，有兴趣的读者可以阅读我在 arXiv 上关于朴素贝叶斯分类的论文(S.Raschka.Naive Bayes and Text Classification I-introduction and Theory. Computing Research Repository(CoRR), abs/1410.5329,2014. http://arxiv.org/pdf/1410.5329v3.pdf )。

# 8.4 使用大数据——在线算法与外存学习

如果你执行上一节中的示例代码，就会发现: 在网格搜索阶段为包含 50000个电影评论的数据集构建特征向量的计算成本很高。在许多真实应用汇总，经常会用到更大的数据集，数据集大小甚至超出计算机内存的容量。并不是每个人都有机会使用超级计算设备，因此我们将通过一种称为外存学习的技术来处理大数据集。

回归一下第2章中我们曾经介绍过的随机梯度下降(stochastic gradient descent)的概念，此优化算法每次使用一个样本更新模型的权重信息。在本节，我们将使用 scikit-learn 中 SGDClassifier 的 partial_fit 函数读取本地存储设备，并且使用小型子批次(minibatches) 文档来训练一个 Logistic 回归模型。

本章开始，我们构建了 movie_data.csv 数据文件，且在移除停用词阶段对此单词做了 token 处理。首先，我们定义一个 tokenizer 函数来清理 movie_data.csv 文件中未经处理的文本数据:

```python
import numpy as np
import re
from nltk.corpus import stopwords

stop = stopwords.words('english')

def tokenizer(text):
    text = re.sub('<[^>]*>', '', text)
    emoticons = re.findall('(?::|;|=)(?:-)?(?:\)|\(|D|P)', text)
    text = re.sub('[\W]+', ' ', text.lower()) + ' '.join(emoticons).replace('-', '')
    tokenozed = [w for w in text.split() if w not in stop]
    return tokenhized
```

接下来，我们定义一个生成器: stream_docs，它每次读取器且返回一个文档的内容:

```python
def stream_docs(path):
    with open(path, 'r') as csv:
        next(csv) # skip header
        for line in csv:
            text, label = line[:-3], int(line[-2])
            yield text, label
```

为了验证 stream_docs 函数是否能正常工作，我们来读取一下 movie_data.csv 文件的第一个文档，它返回一个包含评论信息和对应类标的元组:

```python
next(stream_docs(path='./movie_data.csv'))
```

输出结果:

```output
('"My family and I normally ...Claudine!!"', 1)
```

定义一个 get_minibatch 函数，它以 stream_doc 函数得到的文档数据流作为输入，并输入参数 size 返回指定数量的文档内容:

```python
def get_minibatch(doc_stream, size):
    docs, y = [], []
    try:
        for _ in range(size):
            text, label = next(doc_stream)
            docs.append(text)
            y.append(label)
    except StopIteration:
        return None, None
    return docs, y
```

不幸的是，由于需要将所有的词汇加载到内存中，我们无法通过 CountVectorizer 来使用外存学习方法。另外，TfidfVectorizer 需要将所有训练数据集中的特征向量加载到内存以计算逆文档频率。不过，scikit-learn 提供了另外一个处理文本信息的向量处理器: HashingVector。HashVectorizer 是独立于数据的，其哈希算法使用了 Austin Appleby 提出的 32位 MurmurHash3 算法(https://sites.google.com/site/murmurhash/ )。

```python
from sklearn.feature_extraction.text import HashingVectorizer
from sklearn.linear_model import SGDClassifier

vect = HashingVectorizer(decode_error='ignore', n_features=2**21, preprocessor=None, tokenizer=tokenizer)
clf = SGDClassifier(loss='log', random_state=1, max_iter=1)
doc_stream = stream_docs(path='./movie_data.csv')
```

在上述代码中，我们使用 tokenizer 函数初始化 HashingVectorizer，并且将特征的数量设定为 $2^{21}$。此外，我们将 SGDClassifier 中的 loss 参数的值设定为 log 来重新初始化 Logistic 回归分类器。请注意: 通过为 HashingVector 设定一个大的特征向量，降低了哈希碰撞的概率，不过同时也增加了 Logistic 回归模型中系数的数量。

现在带了真正有趣的部分。设置好所有的辅助函数后，我们可以通过下述代码使用外存学习:

```python
import pyprind

pbar = pyprind.ProgBar(45)
classes = np.array([0, 1])

for _ in range(45):
    X_train, y_train = get_minibatch(doc_stream, size=1000)
    if not X_train:
        break
    X_train = vect.transform(X_train)
    clf.partial_fit(X_train, y_train, classes=classes)
    pbar.update()
```

为了估计学习算法的进度，我们再一次是哟经 PyPrind 包。将进度条对象设定为 45次迭代。在接下来的 for 循环中，我们在 45 个文档的子批次上进行迭代，每个子批次包含 1000个文档。

完成了增量学习后，我们将使用剩余的 5000个文档来评估模型的性能:

```python
X_test, y_test = get_minibatch(doc_stream, size=1000)
X_test = vect.fit_transform(X_test)
print('Accuracy: %.3f' % clf.score(X_test, y_test))
```

输出结果:

```output
Accuracy: 0.872
```

可以看到，模型的准确率约为 87%，略微低于我们再上一节使用网格索索进行超参调优得到的模型。不过外存学习的存储效率很高，只用了不到一分钟的时间就完成了计算。最后，我们可以通过剩下的 5000 个文档来升级模型:

```py
clf = clf.partial_fit(X_test, y_test)
```

如果读者希望直接进入第9章，建议不要关闭当前的 Python 会话窗口。在下一章中，我们学习如何将刚刚训练得到的模型存储到硬盘以供后续使用，以及如何将其嵌入到 Web 应用中。

> 🔖 虽然词袋模型仍旧是文本分类领域最为流行的模型，但是它没有考虑句子的结构和语法。一种流行的词袋模型扩展就是潜狄利克雷(Latent Dirichlet Allocation)，这是一种考虑句子潜在预期的主题模型(D.B.Blei, A.Y.Ng, and M.I.T.Jordan. Latent Dirichlet allocation. The Journal of machine Learning research, 3:993-1022,2003)。

word2vec 是最近提出的一种词袋模型的替代算法，它由谷歌公司在 2013年提出(T.Mikolovm K.Chenm G.Corrado, and J.Dean.Efficient Estimation of Word Representation in Vector Space .arXiv preprint arXiv:1301.3781,2013)。word2vec 算法时基于神经网络的一种无监督算法，它会自动尝试学习单词之间的关系。word2vec 背后的理念就是将词义相近的单词划分到相同的簇中；通过巧妙的向量间隔，此模型可以通过简单的向量计算来得到合适的单词，例如: king-man+woman=queen。

读者可以通过链接 https://code.google.com/p/word2vec/ 找到 word2vec 模型原始的 C 语言实现、相关的论文及其替代实现代码。

# 8.5 本章小结

在本章中，我们学习了如何使用机器学习算法根据文档的情感倾向对其进行分类，这是自然语言处理领域中情感分析的基本工作。我们不仅学习了如何使用词袋模型对文档进行编码，而且学习了如何使用词频-逆文档频率来矫正词频权重。

在对文本进行情感分析的过程中，由于生成的特征向量巨大，导致文本数据处理会产生较高的计算成本。最后一节中，我们学习了外存和增量学习算法，它们无需将整个数据集同时加载到内存就能够完成对机器学习模型的训练。

在下一章，我们将使用文档分类器，并将学习如何将其嵌入到 Web 应用中。