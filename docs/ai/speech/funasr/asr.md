# 语音识别

语音识别是 FunASR 中非常核心的功能，它提供了实时以及非实时的多种模型（详见[模型仓库](./model_repo.md)），并且可以结合标点恢复、情感识别等模型一起使用。

在 Python 中调用 FunASR 进行语音识别非常简洁且高效，只需要简单几行代码就可以完成相应的功能，你可以选择不同的模型（如 SenseVoice、Paraformer 以及一些流式模型）来验证不同的识别效果。

## 1. 非实时 ASR

### 1.1 Paraformer

```python linenums="1"
from funasr import AutoModel

wav_file = "https://isv-data.oss-cn-hangzhou.aliyuncs.com/ics/MaaS/ASR/test_audio/vad_example.wav"
model = AutoModel(model="paraformer-zh")
res = model.generate(input=wav_file)
print(res)
```

输出结果为一个列表，包含文件名、转写文本以及时间戳信息。

```python linenums="1" title="输出结果"
[
  {
    'key': 'vad_example', 
    'text': '试 错 的 过 程 很 简 单 而 且 ...',
    'timestamp': [[390, 630], [650, 770], [770, 970], ...]  # (1)!
  }
]
```

  1. 每个转写字符对应时间戳。

此外，Paraformer-zh 是一个多功能的 ASR 模型，我们可以在 `AutoModel` 中指定端点检测、标点恢复、说话人识别等模型。

```python linenums="1"
from funasr import AutoModel

wav_file = "https://isv-data.oss-cn-hangzhou.aliyuncs.com/ics/MaaS/ASR/test_audio/vad_example.wav"
model = AutoModel(
  model="paraformer-zh", 
  vad_model="fsmn-vad",
  vad_kwargs={"max_single_segment_time": 60000},
  punc_model="ct-punc", 
  # spk_model="cam++"
  )
res = model.generate(
  input=wav_file, 
  batch_size_s=300,
  batch_size_threshold_s=60,
  hotword='魔搭'
  )
print(res)
```

### 1.2 SenseVoice

SenseVoice 提供了多种语音理解能力，涵盖了自动语音识别（ASR）、语言识别（LID）、情感识别（SER）以及音频事件检测（AED）。

```python linenums="1"
from funasr import AutoModel
from funasr.utils.postprocess_utils import rich_transcription_postprocess

model_dir = "iic/SenseVoiceSmall"

model = AutoModel(
    model=model_dir,
    vad_model="fsmn-vad",
    vad_kwargs={"max_single_segment_time": 30000},
    device="cuda:0",
)

res = model.generate(
    input=f"{model.model_path}/example/en.mp3",
    cache={},
    language="auto",  # (1)!
    use_itn=True,  # 输出结果中是否包含标点与逆文本正则化
    batch_size_s=60,
    merge_vad=True,
    merge_length_s=15,
)
text = rich_transcription_postprocess(res[0]["text"])
print(text)
```

  1. 支持 `zn`, `en`, `yue`, `ja`, `ko`, `nospeech`。

## 2. 实时 ASR

### 2.1 读取音频文件模拟实时 ASR

Paraformer-zh-streaming 是一个实时的语音识别引擎，以下示例是读取一个音频文件，然后遍历字节流来模拟实时识别的场景。

```python linenums="1" hl_lines="20"
import os
import soundfile
from funasr import AutoModel

#[0, 10, 5] => 600ms, [0, 8, 4] => 480ms
chunk_size = [0, 10, 5]  # (1)!
encoder_chunk_look_back = 4  # 自注意力编码器回溯的 chunk 数量
decoder_chunk_look_back = 1  # 交叉注意力编码器回溯的 chunk 数量 
model = AutoModel(model="paraformer-zh-streaming")

wav_file = os.path.join(model.model_path, "example/asr_example.wav")
speech, sample_rate = soundfile.read(wav_file)
chunk_stride = chunk_size[1] * 960  # 600ms

cache = {}
total_chunk_num = int(len(speech - 1) / chunk_stride + 1)

for i in range(total_chunk_num):
    speech_chunk = speech[i * chunk_stride: (i + 1) * chunk_stride]
    is_final = i == total_chunk_num - 1
    res = model.generate(
      input=speech_chunk, 
      cache=cache, 
      is_final=is_final,
      chunk_size=chunk_size, 
      encoder_chunk_look_back=encoder_chunk_look_back,
      decoder_chunk_look_back=decoder_chunk_look_back
      )
    print(res)
```

  1. `chunk_size` 为流式延时配置，`[0,10,5]` 表示上屏实时出字粒度为 10x60=600ms，未来信息为 5x60=300ms。每次推理输入为 600ms（采样点数为 16000x0.6=960），输出为对应文字，最后一个语音片段输入需要设置 `is_final=True` 来强制输出最后一个字。

### 2.2 使用麦克风进行实时 ASR

接下来，我们使用通过开启麦克风，进行实时语音识别。

```python
import sys
import sounddevice as sd
import numpy as np
import queue
import threading
import time
from funasr import AutoModel


sample_rate = 16000  # 采样率
device = 0  # 输入设备ID，可以用 `sd.query_devices()` 查看
chunk_size = [0, 10, 5]  
encoder_chunk_look_back = 4  # 自注意力编码器回溯的 chunk 数量
decoder_chunk_look_back = 1  # 交叉注意力编码器回溯的 chunk 数量 
chunk_stride = chunk_size[1] * 960

# 初始化 FunASR 模型
asr_model = AutoModel(model="paraformer-zh-streaming")

# 创建音频队列
audio_queue = queue.Queue()
cache = {}
texts = []

def audio_callback(indata, frames, time, status):
    if status:
        print(status, file=sys.stderr)
    # 将音频数据放入队列中
    audio_queue.put(indata.copy())

def recognize_audio():
    print("开始实时语音识别...")
    while True:
        # 从队列中获取音频块
        if not audio_queue.empty():
            audio_data = audio_queue.get()
            # 将音频数据转换为适合模型输入的格式
            audio_data = audio_data.flatten()
            # 调用模型进行识别
            # result = asr_model(audio_data)
            res = asr_model.generate(
                input=audio_data, 
                cache=cache, 
                is_final=False,
                chunk_size=chunk_size, 
                encoder_chunk_look_back=encoder_chunk_look_back,
                decoder_chunk_look_back=decoder_chunk_look_back
                )
            
            texts.append(res[0]["text"])
            print("识别结果:", res[0]["text"])

            if "关机" in "".join(texts):
                print("检测到语音播报：", "关机")
                sys.exit()
            
# 创建音频流
with sd.InputStream(
    samplerate=sample_rate, blocksize=chunk_stride, 
    device=device, channels=1, callback=audio_callback
    ):
    # 启动识别线程
    recognition_thread = threading.Thread(target=recognize_audio)
    recognition_thread.start()

    # 让主线程持续运行
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n停止实时语音识别。")
```


## 3. AutoModel API 使用

### 3.1 定义

```python linenums="1"
model = AutoModel(
    model: str,
    device: str = "cuda:0",
    ncpu: int = 4,
    output_dir: str = None,
    batch_size: int = 1
    hub: str = "ms",
    **kwrags
)
```

| 参数 | 说明 |
| ---- | ---- |
| model | 模型名称 |
| device | 默认使用 GPU 推理，需要使用 CPU 的话请设置为 `cpu` |
| ncpu | 处理线程数，默认为 4 |
| output_dir | 结果的输出路径 |
| batch_size | 解码时的批处理样本个数 |
| hub | 默认是从 ModelScope 上下载模型，指定为 `hf` 则会从 HuggingFace 上下载模型 |
| vad_model | 端点检测模型，通常模型限制输入时长为 30s，使用 VAD 后可任意扩展 |
| vad_kwargs | VAD 模型的参数，例如 `max_single_segment_time=6000` 用于设置最大切割长度为 6s。 |
| punc_kwargs | 标点恢复模型 |
| spk_kwargs | 说话人识别模型 |

### 3.2 推理

使用 `AutoModel.generate` 函数进行推理：

```python linenums="1"
res = model.generate(
  input="xxx", 
  output_dir="xxx",
  batch_size_s=300,
  batch_size_threshold_s=60,
  hotword='魔搭'
  )
```

| 参数 | 说明 |
| ---- | ---- |
| input | 支持 wav、pcm、音频字节流、wav.scp 格式的输入，使用 wav.scp 格式时，则必须指定 `output_dir`。|
| output_dir | 结果的输出路径，如果在定义时已经设定，则不需要再设置 |
| batch_size_s | 启用动态 batch，每个 batch中总音频时长，单位为秒。 |
| batch_size_threshold_s | 是否将 vad 模型切割的短音频碎片合成，合并后长度为`merge_length_s`，单位为秒。 |
| merge_length_s | 合成音频长度，单位为秒 |
| merge_vad | 是否将 VAD 模型切割的短音频碎片合成，合并后长度为 `merge_length_s`，单位为秒。 |
| use_itn | 输出结果中是否包含标点与逆文本正则化。 |
| ban_emo_unk | 禁用 `emo_unk` 标签，禁用后所有的句子都会被赋与情感标签。 |
| beam_size | |
| decoding_ctc_weight | |

!!! tip "长音频内存溢出问题"

    输入为长音频，运行时遇到 OOM 问题，通常是因为显存占用与音频时长呈平方关系增加，一般分为 3 种情况:

    - 推理起始阶段，显存主要取决于 `batch_size_s`，适当减小该值，可以减少显存占用。
    - 推理中间阶段，遇到 VAD 切割的长音频片段，总 token 数小于 `batch_size_s`，仍然出现 OOM，可以适当减小 `batch_size_threshold_s`，超过阈值强制 batch 为 1。
    - 推理快结束阶段，遇到 VAD 切割的长音频片段，总 token 数小于 `batch_size_s`，且超过阈值`batch_size_threshold_s`，强制 batch 为 1。仍然出现 OOM，可以适当减小`max_single_segment_time`，使得 VAD 切割音频时长变短。
