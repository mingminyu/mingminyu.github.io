# 导出模型

## 1. 命令行导出

```bash
funasr-export ++model=paraformer ++quantize=false
```

## 2. Python 导出

```python
from funasr import AutoModel

model = AutoModel(model="paraformer")
res = model.export(quantize=False)
```

## 3. 测试 ONNX

需要先安装好 `funasr-onnx` 库。

```python
from funasr_onnx import Paraformer

model_dir = "damo/speech_paraformer-large_asr_nat-zh-cn-16k-common-vocab8404-pytorch"
model = Paraformer(model_dir, batch_size=1, quantize=True)

wav_path = [
    '~/.cache/modelscope/hub/damo/speech_paraformer-large_asr_nat-zh-cn-16k-common-vocab8404-pytorch/example/asr_example.wav'
    ]

result = model(wav_path)
print(result)
```
