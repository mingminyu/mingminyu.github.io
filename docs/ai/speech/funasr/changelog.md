# 更新日志

- 2024/07/04: [SenseVoice](https://github.com/FunAudioLLM/SenseVoice) 是一个基础语音理解模型，具备多种语音理解能力，涵盖了自动语音识别（ASR）、语言识别（LID）、情感识别（SER）以及音频事件检测（AED）。
- 2024/07/01: 中文离线文件转写服务 GPU 版本 1.1 发布，优化 bladedisc 模型兼容性问题。
- 2024/06/27: 中文离线文件转写服务 GPU 版本 1.0 发布，支持动态 batch，支持多路并发，在长音频测试集上单线 RTF 为 0.0076，多线加速比为 1200+（CPU 为 330+）。
- 2024/05/15: 新增加情感识别模型 [emotion2vec+large](https://modelscope.cn/models/iic/emotion2vec_plus_large/summary)、[emotion2vec+base](https://modelscope.cn/models/iic/emotion2vec_plus_base/summary)、[emotion2vec+seed](https://modelscope.cn/models/iic/emotion2vec_plus_seed/summary)，输出情感类别为：生气/angry，开心/happy，中立/neutral，难过/sad。
- 2024/05/15: 中文离线文件转写服务 4.5、英文离线文件转写服务 1.6、中文实时语音听写服务 1.10 发布，适配 FunASR 1.0 模型结构。
- 2024/03/05: 新增加 Qwen-Audio 与 Qwen-Audio-Chat 音频文本模态大模型，在多个音频领域测试榜单刷榜，中支持语音对话，详细用法见[示例](https://github.com/modelscope/FunASR/tree/main/examples/industrial_data_pretraining/qwen_audio)。
- 2024/03/05: 新增加 **Whisper-large-v3** 模型支持，多语言语音识别/翻译/语种识别，支持从 [modelscope](https://github.com/modelscope/FunASR/tree/main/examples/industrial_data_pretraining/whisper/demo.py) 仓库下载，也支持从 [OpenAI](https://github.com/modelscope/FunASR/tree/main/examples/industrial_data_pretraining/whisper/demo_from_openai.py) 仓库下载模型。
- 2024/03/05: 中文离线文件转写服务 4.4、英文离线文件转写服务 1.5、中文实时语音听写服务 1.9 发布，docker镜像支持 arm64 平台，升级 modelscope 版本。
- 2024/01/30: FunASR 1.0 发布。
- 2024/01/30: 新增加情感识别[模型链接](https://www.modelscope.cn/models/iic/emotion2vec_base_finetuned/summary)，原始模型 [repo](https://github.com/ddlBoJack/emotion2vec).
- 2024/01/25: 中文离线文件转写服务 4.2、英文离线文件转写服务 1.3，优化 vad 数据处理方式，大幅降低峰值内存占用，内存泄漏优化；中文实时语音听写服务 1.7 发布，客户端优化。
- 2024/01/09: funasr 社区软件包 windows 2.0 版本发布，支持软件包中文离线文件转写 4.1、英文离线文件转写1.2、中文实时听写服务1.6的最新功能，详细信息参阅 [FunASR社区软件包windows版本](https://www.modelscope.cn/models/damo/funasr-runtime-win-cpu-x64/summary)。
- 2024/01/03: 中文离线文件转写服务 4.0 发布，新增支持 8k 模型、优化时间戳不匹配问题及增加句子级别时间戳、优化英文单词 fst 热词效果、支持自动化配置线程参数，同时修复已知的 crash 问题及内存泄漏问题。
- 2024/01/03: 中文实时语音听写服务 1.6 发布，2pass-offline 模式支持 Ngram 语言模型解码、wfst 热词，同时修复已知的 crash 问题及内存泄漏问题。
- 2024/01/03: 英文离线文件转写服务 1.2 发布，修复已知的crash问题及内存泄漏问题。
- 2023/12/04: FunASR 社区软件包 Windows 1.0 版本发布，支持中文离线文件转写、英文离线文件转写、中文实时听写服务，详细信息参阅[FunASR社区软件包windows版本](https://www.modelscope.cn/models/damo/funasr-runtime-win-cpu-x64/summary)。
- 2023/11/08：中文离线文件转写服务 3.0 CPU 版本发布，新增标点大模型、Ngram 语言模型 与wfst 热词。
- 2023/10/17: 英文离线文件转写服务一键部署的 CPU 版本发布。
- 2023/10/13: [SlideSpeech](https://slidespeech.github.io/): 一个大规模的多模态音视频语料库，主要是在线会议或者在线课程场景，包含了大量与发言人讲话实时同步的幻灯片。
- 2023.10.10: [Paraformer-long-Spk](https://github.com/alibaba-damo-academy/FunASR/blob/main/egs_modelscope/asr_vad_spk/speech_paraformer-large-vad-punc-spk_asr_nat-zh-cn/demo.py) 模型发布，支持在长语音识别的基础上获取每句话的说话人标签。
- 2023.10.07: [FunCodec](https://github.com/alibaba-damo-academy/FunCodec): FunCodec 提供开源模型和训练工具，可以用于音频离散编码，以及基于离散编码的语音识别、语音合成等任务。
- 2023.09.01: 中文离线文件转写服务 2.0 CPU 版本发布，新增 ffmpeg、时间戳与热词模型支持。
- 2023.08.07: 中文实时语音听写服务一键部署的CPU版本发布。
- 2023.07.17: BAT 一种低延迟低内存消耗的 **RNN-T** 模型发布。
- 2023.06.26: ASRU2023 多通道多方会议转录挑战赛 2.0 完成竞赛结果公布，详细信息参阅（[M2MeT2.0](https://alibaba-damo-academy.github.io/FunASR/m2met2_cn/index.html)）


[^1]: https://github.com/modelscope/FunASR/blob/main/README_zh.md