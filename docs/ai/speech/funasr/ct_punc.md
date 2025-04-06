# 标点恢复

使用 SenseVoice 或者 Paraformer ASR 模型，转写出来的文本都是字符级的，没有任何标点符号。幸运的是，我们可以在 FunASR 中使用 ct-punc 模型来修复标点，使得转写出来的文本更易于阅读。

```python linenums="1"
from funasr import AutoModel

model = AutoModel(model="ct-punc")
res = model.generate(input="那今天的会就到这里吧 happy new year 明年见")
print(res)
```
