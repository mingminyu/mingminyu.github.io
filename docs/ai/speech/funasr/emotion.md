# 情绪识别


```python linenums="1"
from funasr import AutoModel

model = AutoModel(model="iic/emotion2vec_plus_large")
wav_file = f"{model.model_path}/example/test.wav"
res = model.generate(wav_file, output_dir="./outputs", granularity="utterance", extract_embedding=False)
print(res)
```
