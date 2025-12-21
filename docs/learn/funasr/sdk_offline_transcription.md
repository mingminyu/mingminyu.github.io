# FunASR 离线文件转写服务

FunASR 离线文件转写软件包，提供了一款功能强大的语音离线文件转写服务。拥有完整的语音识别链路，结合了语音端点检测、语音识别、标点等模型，可以将几十个小时的长音频与视频识别成带标点的文字，而且支持上百路请求同时进行转写。

FunASR 可以输出为带标点的文字，含有字级别时间戳，支持 ITN 与用户自定义热词等。服务端集成有 FFMPEG，支持各种音视频格式输入。软件包提供有 Html、Python、C++、Java 与 C# 等多种编程语言客户端，用户可以直接使用与进一步开发。

![FunASR 离线转写架构](https://github.com/modelscope/FunASR/blob/main/runtime/docs/images/offline_structure.jpg?raw=true)

## 1. 版本发布

| 时间 | 详情            | 镜像版本    | 镜像ID         |
|------------|-------------|--------------|--------------|
| 2024.05.15 | 适配FunASR 1.0模型结构 | funasr-runtime-sdk-cpu-0.4.5 | 058b9882ae67 |
| 2024.03.05 | Docker 镜像支持 Arm64 平台，升级 ModelScope 版本 | funasr-runtime-sdk-cpu-0.4.4 | 2dc87b86dc49 |
| 2024.01.25 | 优化 vad 数据处理方式，大幅降低峰值内存占用；内存泄漏优化| funasr-runtime-sdk-cpu-0.4.2 | befdc7b179ed |
| 2024.01.08 | 优化句子级时间戳 Json 格式 | funasr-runtime-sdk-cpu-0.4.1 | 0250f8ef981b |
| 2024.01.03 | 新增支持 8k 模型、优化时间戳不匹配问题及增加句子级别时间戳、优化英文单词 fst 热词效果、支持自动化配置线程参数，同时修复已知的 crash 问题及内存泄漏问题 | funasr-runtime-sdk-cpu-0.4.0 | c4483ee08f04 |
| 2023.11.08 | 支持标点大模型、支持 Ngram 模型、支持 fst 热词、支持服务端加载热词、runtime 结构变化适配 | funasr-runtime-sdk-cpu-0.3.0 | caa64bddbb43 |
| 2023.09.19 | 支持 ITN 模型  | funasr-runtime-sdk-cpu-0.2.2 | 2c5286be13e9 |
| 2023.08.22 | 集成 ffmpeg 支持多种音视频输入、支持热词模型、支持时间戳模型 | funasr-runtime-sdk-cpu-0.2.0 | 1ad3d19e0707 |
| 2023.07.03 | 1.0 发布   | funasr-runtime-sdk-cpu-0.1.0 | 1ad3d19e0707 |

## 2. 服务器配置

用户可以根据自己的业务需求，选择合适的服务器配置（推荐配置为 x86 计算型）：

| CPU | 内存 | 并发 |
| --- | --- | --- |
| 4核vCPU | 8G | 32 路并发 |
| 16核vCPU | 16G | 64 路并发 |
| 64核vCPU | 128G | 200 路并发 |

### 2.1 CPU 基准性能测试

FunASR 官方仓库上公布一组不同 CPU 使用 ONNX-CPP 基准测试结果[^1]。

```bash linenums="1"
./funasr-onnx-offline-rtf \
    --model-dir ./damo/speech_paraformer-large_asr_nat-zh-cn-16k-common-vocab8404-pytorch \
    --quantize true \  # (1)!
    --wav-path ./aishell1_test.scp  \
    --thread-num 32
```

  1. `--quantize false` 表示采用 FP32，否则使用 INT8.

## 3. 启动服务

### 3.1 启动镜像

```bash linenums="1"
sudo docker pull registry.cn-hangzhou.aliyuncs.com/funasr_repo/funasr:funasr-runtime-sdk-cpu-0.4.5
mkdir -p ./funasr-runtime-resources/models

sudo docker run -p 10095:10095 -it --privileged=true \
  -v $PWD/funasr-runtime-resources/models:/workspace/models \
  registry.cn-hangzhou.aliyuncs.com/funasr_repo/funasr:funasr-runtime-sdk-cpu-0.4.5
```

### 3.2 启动服务端

```bash linenums="1"
cd FunASR/runtime
nohup bash run_server.sh \
  --download-model-dir /workspace/models \
  --vad-dir damo/speech_fsmn_vad_zh-cn-16k-common-onnx \
  --model-dir damo/speech_paraformer-large-vad-punc_asr_nat-zh-cn-16k-common-vocab8404-onnx  \
  --punc-dir damo/punc_ct-transformer_cn-en-common-vocab471067-large-onnx \
  --lm-dir damo/speech_ngram_lm_zh-cn-ai-wesp-fst \
  --itn-dir thuduj12/fst_itn_zh \
  --hotword /workspace/models/hotwords.txt > log.txt 2>&1 &

# 如果您想关闭ssl，增加参数：--certfile 0
# 如果您想使用时间戳或者nn热词模型进行部署，请设置--model-dir为对应模型：
#   damo/speech_paraformer-large-vad-punc_asr_nat-zh-cn-16k-common-vocab8404-onnx（时间戳）
#   damo/speech_paraformer-large-contextual_asr_nat-zh-cn-16k-common-vocab8404-onnx（nn热词）
# 如果您想在服务端加载热词，请在宿主机文件./funasr-runtime-resources/models/hotwords.txt配置热词（docker映射地址为/workspace/models/hotwords.txt）:
#   每行一个热词，格式(热词 权重)：阿里巴巴 20（注：热词理论上无限制，但为了兼顾性能和效果，建议热词长度不超过10，个数不超过1k，权重1~100）
```


[^1]: 
    CPU Benchmark (ONNX-cpp): https://github.com/modelscope/FunASR/blob/main/runtime/docs/benchmark_onnx_cpp.md

