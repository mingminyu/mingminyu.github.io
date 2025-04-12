# FunASR 命令行参数

成功安装好 FunASR 后，我们就可以在终端中直接使用 `funasr` 命令了。通过在命令行中指定 ASR、VAD、标点恢复等模型，便可以快速验证 FunASR 的效果

```bash linenums="1"
funasr  ++model=paraformer-zh \
        ++vad_model="fsmn-vad" \
        ++punc_model="ct-punc" \
        ++input=asr_example_zh.wav
```

!!! note "更推荐使用 Python API 方式"

    如果所使用的模型本地不存在，那么过程中 FunASR 会先下载对应的模型，但整个过程的响应时间较长。此外，就算此前已经下载了相应模型，再次执行此命令也需要等待较长时间。
