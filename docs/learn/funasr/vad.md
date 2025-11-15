# 语音端点检测

语音端点检测通常称为 VAD，用于检测有声音频片段。FunASR 中通过 fsmn-vad 模型进行调用，支持实时和非实时。

## 1. 非实时 VAD

非实时的 VAD 检测在 Python 中调用很简单，其输出格式是一个列表，每个元素为一个有效音频片段，包含开始和结束时间，单位为毫秒。

```python linenums="1"
from funasr import AutoModel

model = AutoModel(model="fsmn-vad")
wav_file = f"{model.model_path}/example/vad_example.wav"
res = model.generate(input=wav_file)
print(res)
```

## 2. 实时 VAD

FunASR 中 fsmn-vad 也可以进行实时语音端点检测，以下示例是读取一个音频文件，然后遍历字节流来模拟实时识别的场景。

```python linenums="1" hl_lines="15 19"
import soundfile
from funasr import AutoModel


chunk_size = 200  # Unit: ms
model = AutoModel(model="fsmn-vad")
wav_file = f"{model.model_path}/example/vad_example.wav"
speech, sample_rate = soundfile.read(wav_file)
chunk_stride = int(chunk_size * sample_rate / 1000)

cache = {}
total_chunk_num = int(len(speech - 1) / chunk_stride + 1)
for i in range(total_chunk_num):
    speech_chunk = speech[i * chunk_stride: (i + 1) * chunk_stride]
    is_final = i == total_chunk_num - 1
    res = model.generate(
        input=speech_chunk,
        cache=cache,
        is_final=is_final,
        chunk_size=chunk_size
        )
    
    if len(res[0]["value"]):
        print(res)
```

此外，流式 VAD 模型输出格式为与非实时场景也略有不同：

1. 同非实时 VAD 输出结果，列表中每个元素包含有效片段的开始和结束时间。
2. `[[beg, -1]]` 表示只检测到起始点。
3. `[[-1, end]]` 表示只检测到结束点。
4. `[]` 表示既没有检测到起始点，也没有检测到结束点。
