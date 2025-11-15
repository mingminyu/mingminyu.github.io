# 模型仓库

FunASR开源了大量在工业数据上预训练模型，您可以在模型许可协议下自由使用、复制、修改和分享 FunASR 模型，下面列举代表性的模型。

🤗 表示Huggingface模型仓库，🍀表示OpenAI模型仓库

## 1. 语音识别模型

### 1.1 其他模型

| 模型 | 任务详情 | 训练数据 | 参数量 |
|:------------------------------------:|:------------------:|:--------------:|:------:|
| [SenseVoiceSmall](https://www.modelscope.cn/models/iic/SenseVoiceSmall) [🤗](https://huggingface.co/FunAudioLLM/SenseVoiceSmall) | 多种语音理解能力，涵盖了自动语音识别（ASR）、语言识别（LID）、情感识别（SER）以及音频事件检测（AED） | 400000小时，中文 | 330M |
| [Whisper-large-v3](https://www.modelscope.cn/models/iic/Whisper-large-v3/summary) [🍀](https://github.com/openai/whisper) | 语音识别，带时间戳输出，非实时 | 多语言 | 1550 M |
| [Qwen-Audio](https://github.com/modelscope/FunASR/blob/main/examples/industrial_data_pretraining/qwen_audio/demo.py) [🤗](https://huggingface.co/Qwen/Qwen-Audio) | 音频文本多模态大模型（预训练） | 多语言 | 8B |
| [Qwen-Audio-Chat](https://github.com/modelscope/FunASR/blob/main/examples/industrial_data_pretraining/qwen_audio/demo_chat.py) [🤗](https://huggingface.co/Qwen/Qwen-Audio-Chat) | 音频文本多模态大模型（chat版本） | 多语言 | 8B |
| [Emotion2vec+large](https://modelscope.cn/models/iic/emotion2vec_plus_large/summary) [🤗](https://huggingface.co/emotion2vec/emotion2vec_plus_large) | 情感识别模型 | 40000小时，4种情感类别 | 300M |

### 1.2 Paraformer 模型

| 模型名字 | 任务详情 | 训练数据 | 参数量 | 词典大小 | 是否实时 |
|:-----------|:------------------|:--------------|:------| :------| :------|
| [SeACoParaformer-zh](https://www.modelscope.cn/models/iic/speech_seaco_paraformer_large_asr_nat-zh-cn-16k-common-vocab8404-pytorch/summary) | 带热词功能的语音识别，带时间戳输出 | 60000小时，中文 | 220M | | 非实时 |
| [Paraformer-zh](https://www.modelscope.cn/models/damo/speech_paraformer-large-vad-punc_asr_nat-zh-cn-16k-common-vocab8404-pytorch/summary) &nbsp; [🤗](https://huggingface.co/funasr/paraformer-zh) | 能够处理任意长度的输入wav文件 | 60000小时，中文 | 220M | 8404 | 非实时 |
| [Paraformer-large-Spk](https://modelscope.cn/models/damo/speech_paraformer-large-vad-punc-spk_asr_nat-zh-cn/summary) | 分角色语音识别，在长音频功能的基础上添加说话人识别功能，带时间戳输出 | 60000小时，中文 | 220M | | 非实时 |
| [Paraformer-large](https://www.modelscope.cn/models/damo/speech_paraformer-large_asr_nat-zh-cn-16k-common-vocab8404-pytorch/summary) | 输入 wav 文件持续时间不超过20秒 | 中文和英文，阿里巴巴语音数据（60000小时） | 220M | 8404 | 非实时 |
| [Paraformer-zh-streaming](https://modelscope.cn/models/damo/speech_paraformer-large_asr_nat-zh-cn-16k-common-vocab8404-online/summary) [🤗](https://huggingface.co/funasr/paraformer-zh-streaming) | 处理流式输入 | 60000小时，中文 | 220M | 8404 | 实时 |
| [Paraformer-zh-Streaming-Small](https://www.modelscope.cn/models/iic/speech_paraformer_asr_nat-zh-cn-16k-common-vocab8404-online/summary) | 处理流式输入 | 60000小时，中文 | 220M | 8404 | 实时 |
| [Paraformer-large-en 长音频版本](https://www.modelscope.cn/models/damo/speech_paraformer-large-vad-punc_asr_nat-en-16k-common-vocab10020/summary) [🤗](https://huggingface.co/funasr/paraformer-en) | 能够处理任意长度的输入wav文件 | 英文，阿里巴巴语音数据（50000小时） | 220M | 10020 | 非实时 |
| [Paraformer-large 热词](https://www.modelscope.cn/models/damo/speech_paraformer-large-contextual_asr_nat-zh-cn-16k-common-vocab8404/summary) | 基于激励增强的热词定制支持，可以提高热词的召回率和准确率，输入wav文件持续时间不超过20秒 | 中文和英文，阿里巴巴语音数据（60000小时） | 220M | 8404 | 非实时 |
| [Paraformer](https://modelscope.cn/models/damo/speech_paraformer_asr_nat-zh-cn-16k-common-vocab8358-tensorflow1/summary) | 输入 wav 文件持续时间不超过20秒 | 中文和英文，阿里巴巴语音数据（50000小时） | 68M | 8358 | 离线 |
| [Paraformer-tiny](https://www.modelscope.cn/models/damo/speech_paraformer-tiny-commandword_asr_nat-zh-cn-16k-vocab544-pytorch/summary) | 轻量级Paraformer模型，支持普通话命令词识别 | 中文，阿里巴巴语音数据 (200hours) | 5.2M | 544 | 非实时 |
| [Paraformer-aishell](https://www.modelscope.cn/models/damo/speech_paraformer_asr_nat-aishell1-pytorch/summary) | 学术模型 | 中文，AISHELL (178hours) | 43M | 4234 | 非实时 |
| [ParaformerBert-aishell](https://modelscope.cn/models/damo/speech_paraformerbert_asr_nat-zh-cn-16k-aishell1-vocab4234-pytorch/summary) | 学术模型 | 中文，AISHELL (178hours) | 43M | 4234 | 非实时 |
| [Paraformer-aishell2](https://www.modelscope.cn/models/damo/speech_paraformer_asr_nat-zh-cn-16k-aishell2-vocab5212-pytorch/summary) | 学术模型 | 中文，AISHELL-2 (1000hours) | 64M | 5212 | 非实时 |
| [ParaformerBert-aishell2](https://www.modelscope.cn/models/damo/speech_paraformerbert_asr_nat-zh-cn-16k-aishell2-vocab5212-pytorch/summary) | 学术模型 | 中文，AISHELL-2 (1000hours) | 64M | 5212 | 非实时 |

### 1.3 UniASR 模型

| 模型名字 | 训练数据 | 词典量 | 参数量 | 是否实时 | 备注 |
|:------------|:--------|:-----------|:----------|:---------|:--------------|
| [UniASR](https://modelscope.cn/models/damo/speech_UniASR_asr_2pass-zh-cn-16k-common-vocab8358-tensorflow1-online/summary) | 中文和英文，阿里巴巴语音数据 (60000 小时) | 8358 | 100M | 实时 | 流式离线一体化模型 |
| [UniASR-large](https://modelscope.cn/models/damo/speech_UniASR-large_asr_2pass-zh-cn-16k-common-vocab8358-tensorflow1-offline/summary) | 中文和英文，阿里巴巴语音数据 (60000 小时) | 8358 | 220M | 非实时 | 流式离线一体化模型 |
| [UniASR English](https://modelscope.cn/models/damo/speech_UniASR_asr_2pass-en-16k-common-vocab1080-tensorflow1-online/summary) | 英文，阿里巴巴语音数据 (10000 小时) | 1080 | 95M | 实时 | 流式离线一体化模型 |
| [UniASR Russian](https://modelscope.cn/models/damo/speech_UniASR_asr_2pass-ru-16k-common-vocab1664-tensorflow1-online/summary) | 俄语， 阿里巴巴语音数据 (5000 小时) | 1664 | 95M | 实时 | 流式离线一体化模型 |
| [UniASR Japanese](https://modelscope.cn/models/damo/speech_UniASR_asr_2pass-ja-16k-common-vocab93-tensorflow1-online/summary) | 日语，阿里巴巴语音数据 (5000 小时) | 5977 | 95M | 实时 | 流式离线一体化模型 |
| [UniASR Korean](https://modelscope.cn/models/damo/speech_UniASR_asr_2pass-ko-16k-common-vocab6400-tensorflow1-online/summary) | 韩语，阿里巴巴语音数据 (2000 小时) | 6400 | 95M | 实时 | 流式离线一体化模型 |
| [UniASR Cantonese (CHS)](https://modelscope.cn/models/damo/speech_UniASR_asr_2pass-cantonese-CHS-16k-common-vocab1468-tensorflow1-online/summary) | 粤语（简体中文），阿里巴巴语音数据 (5000 小时) | 1468 | 95M | 实时 | 流式离线一体化模型 |
| [UniASR Indonesian](https://modelscope.cn/models/damo/speech_UniASR_asr_2pass-id-16k-common-vocab1067-tensorflow1-online/summary) | 印尼语，阿里巴巴语音数据 (1000 小时) | 1067 | 95M | 实时 | 流式离线一体化模型 |
| [UniASR Vietnamese](https://modelscope.cn/models/damo/speech_UniASR_asr_2pass-vi-16k-common-vocab1001-pytorch-online/summary) | 越南语 | 阿里巴巴语音数据 (1000 小时) | 1001 | 95M | 实时 | 流式离线一体化模型 |
| [UniASR Spanish](https://modelscope.cn/models/damo/speech_UniASR_asr_2pass-es-16k-common-vocab3445-tensorflow1-online/summary) | 西班牙语，阿里巴巴语音数据 (1000 小时) | 3445 | 95M | 实时 | 流式离线一体化模型 |
| [UniASR Portuguese](https://modelscope.cn/models/damo/speech_UniASR_asr_2pass-pt-16k-common-vocab1617-tensorflow1-online/summary) | 葡萄牙语，阿里巴巴语音数据 (1000 小时) | 1617 | 95M | 实时 | 流式离线一体化模型 |
| [UniASR French](https://modelscope.cn/models/damo/speech_UniASR_asr_2pass-fr-16k-common-vocab3472-tensorflow1-online/summary) | 法语，阿里巴巴语音数据 (1000 小时) | 3472 | 95M | 实时 | 流式离线一体化模型 |
| [UniASR German](https://modelscope.cn/models/damo/speech_UniASR_asr_2pass-de-16k-common-vocab3690-tensorflow1-online/summary) | 德语，阿里巴巴语音数据 (1000 小时) | 3690 | 95M | 实时 | 流式离线一体化模型 |
| [UniASR Persian](https://modelscope.cn/models/damo/speech_UniASR_asr_2pass-fa-16k-common-vocab1257-pytorch-online/summary) | 波斯语，阿里巴巴语音数据 (1000 小时) | 1257 | 95M | 实时 | 流式离线一体化模型 |
| [UniASR Burmese](https://modelscope.cn/models/damo/speech_UniASR_asr_2pass-my-16k-common-vocab696-pytorch/summary) | 缅甸语，阿里巴巴语音数据 (1000 小时) | 696 | 95M | 实时 | 流式离线一体化模型 |
| [UniASR Hebrew](https://modelscope.cn/models/damo/speech_UniASR_asr_2pass-he-16k-common-vocab1085-pytorch/summary) | 希伯来语，阿里巴巴语音数据 (1000 小时) | 1085 | 95M | 实时 | 流式离线一体化模型 |
| [UniASR Urdu](https://modelscope.cn/models/damo/speech_UniASR_asr_2pass-ur-16k-common-vocab877-pytorch/summary) | 乌尔都语，阿里巴巴语音数据 (1000 小时) | 877 | 95M | 实时 | 流式离线一体化模型 |
| [UniASR Turkish](https://modelscope.cn/models/damo/speech_UniASR_asr_2pass-tr-16k-common-vocab1582-pytorch/summary) | 土耳其语，阿里巴巴语音数据 (1000 小时) | 1582 | 95M | 实时 | 流式离线一体化模型 |

### 1.4 Conformer 模型

| 模型名字 | 训练数据 | 参数量 | 词典大小 | 是否实时 | 备注 |
|:-----------|:------------------ |:-------------- |:------- |:------- |:------- |
| [Conformer-en](https://modelscope.cn/models/damo/speech_conformer_asr-en-16k-vocab4199-pytorch/summary) [🤗](https://huggingface.co/funasr/conformer-en) | 50000小时，英文 | 220M | 4199 | 非实时 |
| [Conformer](https://modelscope.cn/models/damo/speech_conformer_asr_nat-zh-cn-16k-aishell1-vocab4234-pytorch/summary) | 中文，AISHELL (178hours) | 44M | 4234 | 非实时 | 输入wav文件持续时间不超过20秒 |
| [Conformer](https://www.modelscope.cn/models/damo/speech_conformer_asr_nat-zh-cn-16k-aishell2-vocab5212-pytorch/summary) | 中文，AISHELL-2 (1000hours) | 44M | 5212 | 非实时 | 输入wav文件持续时间不超过20秒 |

## 2. 多说话人语音识别模型

| 模型名字 | 训练数据 | 词典量 | 参数量 | 非实时/实时 | 备注 |
| :-------------------: | :-----: | :--------: | :--------: | :-------: | :---------: |
| [MFCCA](https://www.modelscope.cn/models/NPU-ASLP/speech_mfcca_asr-zh-cn-16k-alimeeting-vocab4950/summary) | 中文， AliMeeting、AISHELL-4、Simudata (917hours) | 4950 | 45M | 非实时 | 输入音频的持续时间不超过20秒，输入音频的通道数不超过8通道。 |

## 3. 语音端点检测模型

| 模型名字 | 训练数据 | 模型参数 | 采样率 | 实时 |
| :-----------------: | :--------------------------: |:-----------: | :--- | :--- |
| [FSMN-VAD](https://modelscope.cn/models/damo/speech_fsmn_vad_zh-cn-16k-common-pytorch/summary) [🤗](https://huggingface.co/funasr/fsmn-vad) | 阿里巴巴语音数据 (5000hours) | 0.4M | 16000 | 实时 |
| [FSMN-VAD](https://modelscope.cn/models/damo/speech_fsmn_vad_zh-cn-8k-common/summary) | 阿里巴巴语音数据 (5000hours) | 0.4M | 8000 | 实时 |

## 4. 标点恢复模型

| 模型 | 任务详情 | 训练数据 | 模型参数 | 词典大小 | 非实时/实时 |
| :----------------: | :--------: | :---------: | :------: | :--------: | :---------: |
| [CT-Transformer-Large](https://modelscope.cn/models/damo/punc_ct-transformer_cn-en-common-vocab471067-large/summary) | 支持中英文标点大模型 | 中文和英文，Alibaba Text Data(100M) | 1.1G | 471067 | 非实时 |
| [CT-Transformer](https://modelscope.cn/models/damo/punc_ct-transformer_zh-cn-common-vocab272727-pytorch/summary) | 支持中英文标点 | 中文和英文，Alibaba Text Data(70M) | 291M | 272727 | 非实时 |
| [CT-Transformer-Realtime](https://modelscope.cn/models/damo/punc_ct-transformer_zh-cn-common-vad_realtime-vocab272727/summary) | VAD点实时标点 | 中文和英文，Alibaba Text Data(70M) | 288M | 272727 | 实时 |
| [ct-punc](https://modelscope.cn/models/damo/punc_ct-transformer_cn-en-common-vocab471067-large/summary) [🤗](https://huggingface.co/funasr/ct-punc) | 标点恢复 | 100M，中文与英文 | 290M | | |

## 5. 语音模型

| 模型 | 训练数据 | 参数量 | 词典大小 |
| :-----------: | :---: | :-----------: | :------: |
| [Transformer](https://www.modelscope.cn/models/damo/speech_transformer_lm_zh-cn-common-vocab8404-pytorch/summary) | 阿里巴巴语音数据 | 57M | 8404 |

## 6. 说话人确认模型

| 模型 | 训练数据 | 参数量 |
| :-----------: | :---: | :-----------: |
| [Xvector](https://www.modelscope.cn/models/damo/speech_xvector_sv-zh-cn-cnceleb-16k-spk3465-pytorch/summary) | 中文，CNCeleb (1,200 小时)，3465 说话人 | 17.5M |
| [Xvector](https://www.modelscope.cn/models/damo/speech_xvector_sv-en-us-callhome-8k-spk6135-pytorch/summary) | 英文，CallHome (60 小时)，6135 说话人 | 61M |
| cam++ <br> [⭐](https://modelscope.cn/models/iic/speech_campplus_sv_zh-cn_16k-common/summary) [🤗](https://huggingface.co/funasr/campplus) | 5000小时 | 7.2M |

## 7. 说话人日志模型

| 模型 | 训练数据 | 参数量 |
| :-----------: | :---: | :-----------: |
| [SOND](https://www.modelscope.cn/models/damo/speech_diarization_sond-zh-cn-alimeeting-16k-n16k4-pytorch/summary) | 中文，AliMeeting (120 小时) | 40.5M |
| [SOND](https://www.modelscope.cn/models/damo/speech_diarization_sond-en-us-callhome-8k-n16k4-pytorch/summary) | 英文，CallHome (60 小时) | 12M |

## 8. 时间戳预测模型

| 模型 | 训练数据 | 参数量 |
| :-----------: | :---: | :-----------: |
| [TP-Aligner](https://modelscope.cn/models/damo/speech_timestamp_prediction-v1-16k-offline/summary) | 中文，阿里巴巴语音数据 (50000hours) | 37.8M |
| fa-zh <br> [⭐](https://modelscope.cn/models/damo/speech_timestamp_prediction-v1-16k-offline/summary) [🤗](https://huggingface.co/funasr/fa-zh) | 50000 小时，中文 | 38M |

## 9. 逆文本正则化

| 模型名字 | 语言 | 模型参数 | 备注 |
|:------------------------------------------|:---|:------|:--------------|
| [English](https://modelscope.cn/models/damo/speech_inverse_text_processing_fun-text-processing-itn-en/summary) | EN | 1.54M | ITN，语音识别文本后处理 |
| [Russian](https://modelscope.cn/models/damo/speech_inverse_text_processing_fun-text-processing-itn-ru/summary) | RU | 17.79M | ITN，语音识别文本后处理 |
| [Japanese](https://modelscope.cn/models/damo/speech_inverse_text_processing_fun-text-processing-itn-ja/summary) | JA | 6.8M | ITN，语音识别文本后处理 |
| [Korean](https://modelscope.cn/models/damo/speech_inverse_text_processing_fun-text-processing-itn-ko/summary) | KO | 1.28M | ITN，语音识别文本后处理 |
| [Indonesian](https://modelscope.cn/models/damo/speech_inverse_text_processing_fun-text-processing-itn-id/summary) | ID | 2.06M | ITN，语音识别文本后处理 |
| [Vietnamese](https://modelscope.cn/models/damo/speech_inverse_text_processing_fun-text-processing-itn-vi/summary) | VI | 0.92M | ITN，语音识别文本后处理 |
| [Tagalog](https://modelscope.cn/models/damo/speech_inverse_text_processing_fun-text-processing-itn-tl/summary) | TL | 0.65M | ITN，语音识别文本后处理 |
| [Spanish](https://modelscope.cn/models/damo/speech_inverse_text_processing_fun-text-processing-itn-es/summary) | ES | 1.32M | ITN，语音识别文本后处理 |
| [Portuguese](https://modelscope.cn/models/damo/speech_inverse_text_processing_fun-text-processing-itn-pt/summary) | PT | 1.28M | ITN，语音识别文本后处理 |
| [French](https://modelscope.cn/models/damo/speech_inverse_text_processing_fun-text-processing-itn-fr/summary) | FR | 4.39M | ITN，语音识别文本后处理 |
| [German](https://modelscope.cn/models/damo/speech_inverse_text_processing_fun-text-processing-itn-de/summary)| GE | 3.95M | ITN，语音识别文本后处理 |
