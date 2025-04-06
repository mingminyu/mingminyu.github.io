# 时间戳预测

时间戳预测是指转写后的每个字符对应到音频片段的开始时间和结束时间，我们需要提供输入音频以及转写后的文本。

```python linenums="1"
from funasr import AutoModel

model = AutoModel(model="fa-zh")
wav_file = f"{model.model_path}/example/asr_example.wav"
text_file = f"{model.model_path}/example/text.txt"  # (1)!
res = model.generate(input=(wav_file, text_file), data_type=("sound", "text"))
print(res)
```

  1. 实际文本并没有空格间隔每个字符，需要与输出结果中的 `text` 区别开来。

输出结果是一个列表，每个元素为文本字符的开始和结束时间。

```python title="输出结果"
[
  {
    'key': 'rand_key_2yW4Acq9GFz6Y',
    'text': '欢 迎 大 家 来 到 魔 搭 社 区 进 行 体 验',
    'timestamp': [
      [1190, 1410],
      [1410, 1610],
      [1610, 1830],
      [1830, 2010],
      [2010, 2230],
      [2230, 2430],
      [2430, 2650],
      [2650, 2890],
      [2890, 3130],
      [3130, 3370],
      [3410, 3650],
      [3690, 3930],
      [3950, 4190],
      [4230, 4395]
      ]
  }
]
```
