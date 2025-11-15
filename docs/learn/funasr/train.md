# 训练

## 1. 准备数据

训练所需的数据文件是 jsonl 格式（一行是一条 json 数据），通常我们会先准备好 .txt 和 .scp 文件，然后使用 `scp2jsonl` 工具来生成对应 jsonl 文件。

???+ note "训练数据文件"

    === "train_text.txt"

        实际上就两列，左列为数据唯一ID，需与 train_wav.scp 中的 ID 一一对应，右列为音频文件标注文本。

        ```
        ID0012W0013 当客户风险承受能力评估依据发生变化时
        ID0012W0014 所有只要处理 data 不管你是做 machine learning 做 deep learning
        ID0012W0015 he tried to think how it could be
        ```
    
    === "train_wav.scp"

        也是两列，左列为数据唯一ID，需与 train_text.txt 中的 ID 一一对应，右边为音频文件的路径。

        ```
        BAC009S0764W0121 https://isv-data.oss-cn-hangzhou.aliyuncs.com/ics/MaaS/ASR/test_audio/BAC009S0764W0121.wav
        BAC009S0916W0489 https://isv-data.oss-cn-hangzhou.aliyuncs.com/ics/MaaS/ASR/test_audio/BAC009S0916W0489.wav
        ID0012W0015 https://isv-data.oss-cn-hangzhou.aliyuncs.com/ics/MaaS/ASR/test_audio/asr_example_cn_en.wav
        ```

    === "train.jsonl 示例"

        ```json
        {"key": "ID0012W0013", "source": "https://isv-data.oss-cn-hangzhou.aliyuncs.com/ics/MaaS/ASR/test_audio/asr_example_zh.wav", "source_len": 88, "target": "欢迎大家来体验达摩院推出的语音识别模型", "target_len": 19}
        {"key": "ID0012W0014", "source": "https://isv-data.oss-cn-hangzhou.aliyuncs.com/ics/MaaS/ASR/test_audio/asr_example_en.wav", "source_len": 88, "target": "he tried to think how it could be", "target_len": 8}
        ```


接下来，我们使用 `scp2jsonl` 命令来生成训练数据文件。

```bash linenums="1" hl_lines="4"
scp2jsonl \
    ++scp_file_list='["https://mingminyu.github.io/webassets/../data/list/train_wav.scp", "https://mingminyu.github.io/webassets/../data/list/train_text.txt"]' \
    ++data_type_list='["source", "target"]' \
    ++jsonl_file_out="https://mingminyu.github.io/webassets/../data/list/train.jsonl"
```

!!! tip "将 jsonl 文件解析成 .txt 和 .scp 文件"

    `jsonl2scp` 命令是 `scp2jsonl` 的逆命令，用于将 jsonl 文件解析成 .txt 和 .scp 文件。

    ```bash linenums="1" hl_lines="4"
    jsonl2scp \
        ++scp_file_list='["https://mingminyu.github.io/webassets/../data/list/train_wav.scp", "https://mingminyu.github.io/webassets/../data/list/train_text.txt"]' \
        ++data_type_list='["source", "target"]' \
        ++jsonl_file_in="https://mingminyu.github.io/webassets/../data/list/train.jsonl"
    ```

## 2. 模型训练

### 2.1 命令行快速训练

FunASR 提供了命令行工具可以快速进行训练，这种方式仅用于快速测试，不推荐生产使用。

```bash linenums="1"
funasr-train ++model=paraformer-zh \
    ++train_data_set_list=data/list/train.jsonl \
    ++valid_data_set_list=data/list/val.jsonl 
    ++output_dir="./outputs" &> log.txt &
```

### 2.2 脚本训练

官方仓库提供了可靠的[训练脚本](https://github.com/modelscope/FunASR/blob/main/examples/industrial_data_pretraining/paraformer/finetune.sh)，通过执行 `bash finetune.sh` 来进行模型训练。

```bash linenums="1"
funasr/bin/train.py \
    ++model="${model_name_or_model_dir}" \
    ++train_data_set_list="${train_data}" \
    ++valid_data_set_list="${val_data}" \
    ++dataset_conf.batch_size=20000 \
    ++dataset_conf.batch_type="token" \
    ++dataset_conf.num_workers=4 \
    ++train_conf.max_epoch=50 \
    ++train_conf.log_interval=1 \
    ++train_conf.resume=false \
    ++train_conf.validate_interval=2000 \
    ++train_conf.save_checkpoint_interval=2000 \
    ++train_conf.keep_nbest_models=20 \
    ++train_conf.avg_nbest_model=10 \
    ++optim_conf.lr=0.0002 \
    ++output_dir="${output_dir}" &> ${log_file}
```

这里对使用参数进行一个简要说明。

| 参数 | 说明 |
| ---- | ---- |
| model | 模型名称 |
| train_data_set_list | 训练数据文件路径，jsonl 格式 |
| valid_data_set_list | 验证数据文件路径，jsonl 格式 |
| dataset_conf.batch_type | 默认是 `example`，`length` 或者 `token` 表示动态组 batch。<br> `example` 表示每个 batch 中固定 `batch_size` 个样本；<br> `length` 表示每个 batch 固定样本长度，单位为 fbank 帧数（1 帧 10ms）；<br> `token` 标志每个 batch 中 token 个数数作为 `batch_size`。 |
| dataset_conf.batch_size | 与 `batch_type` 搭配使用 |
| train_conf.max_epoch | 训练周期数 |
| train_conf.log_interval | 打印日志间隔的 Step 数 |
| train_conf.resume | 默认为 `True`，是否开启断点重新训练 |
| train_conf.validate_interval | 默认为 5000，训练中做验证测试的间隔 Step 数 |
| train_conf.save_checkpoint_interval | 默认为 5000，训练中每隔 Step 数保存一版模型 |
| train_conf.avg_keep_nbest_models_type | 默认为 `acc`，保留 nbest 的标准为 Acc（越大越好）；`loss` 表示保留 nbest 的标准为 Loss（越小越好）。 |
| train_conf.keep_nbest_models | 默认为 500，保留最大多少个模型参数，配合 `avg_keep_nbest_models_type` 按照验证集 acc/loss 保留最佳的 n 个模型，其他删除，节约存储空间。 |
| train_conf.avg_nbest_model | 默认为 10，保留最大多少个模型参数，配合 `avg_keep_nbest_models_type` 按照验证集 acc/loss 对最佳的 n 个模型平均。|
| train_conf.accum_grad | 默认为 1，开启梯度累计功能 |
| train_conf.grad_clip | 默认为 10，开启梯度截断功能 |
| train_conf.use_fp16 | 默认为 `False`，开启 FP16 训练，加快训练速度。 |
| optim_conf.lr | 学习率 |
| output_dir | 模型保存路径 |

### 2.3 多GPU训练

#### 单机多GPU

```bash linenums="1"
export CUDA_VISIBLE_DEVICES="0,1"
gpu_num=$(echo $CUDA_VISIBLE_DEVICES | awk -F "," '{print NF}')

torchrun --nnodes 1 --nproc_per_node ${gpu_num} \
    https://mingminyu.github.io/webassets/../funasr/bin/train.py ${train_args}
```

其中，`--nnodes` 表示参与的节点总数，`--nproc_per_node` 表示每个节点上运行的进程数。

#### 多机多GPU

在主节点上，假设 IP 为 192.168.1.1，端口为 12345，使用的是 2 个 GPU，则运行如下命令：

```bash linenums="1"
export CUDA_VISIBLE_DEVICES="0,1"
gpu_num=$(echo $CUDA_VISIBLE_DEVICES | awk -F "," '{print NF}')

torchrun --nnodes 2 --node_rank 0 --nproc_per_node ${gpu_num} \
    --master_addr 192.168.1.1 --master_port 12345 \
    https://mingminyu.github.io/webassets/../funasr/bin/train.py ${train_args}
```

在从节点上（假设 IP 为 192.168.1.2），你需要确保 `MASTER_ADDR` 和 `MASTER_PORT` 环境变量与主节点设置的一致，并运行同样的命令：

```bash linenums="1" hl_lines="5"
export CUDA_VISIBLE_DEVICES="0,1"
gpu_num=$(echo $CUDA_VISIBLE_DEVICES | awk -F "," '{print NF}')

torchrun --nnodes 2 --node_rank 1 --nproc_per_node ${gpu_num} \
    --master_addr 192.168.1.1 --master_port 12345 \
    https://mingminyu.github.io/webassets/../funasr/bin/train.py ${train_args}
```

其中，`--nnodes` 表示参与的节点总数，`--node_rank` 表示当前节点 id，`--nproc_per_node` 表示每个节点上运行的进程数（通常为 gpu 个数）。

### 2.4 训练日志

```bash title="log.txt"
[2024-03-21 15:55:52,137][root][INFO] - train, rank: 3, epoch: 0/50, step: 6990/1, total step: 6990, (loss_avg_rank: 0.327), (loss_avg_epoch: 0.409), (ppl_avg_epoch: 1.506), (acc_avg_epoch: 0.795), (lr: 1.165e-04), [('loss_att', 0.259), ('acc', 0.825), ('loss_pre', 0.04), ('loss', 0.299), ('batch_size', 40)], {'data_load': '0.000', 'forward_time': '0.315', 'backward_time': '0.555', 'optim_time': '0.076', 'total_time': '0.947'}, GPU, memory: usage: 3.830 GB, peak: 18.357 GB, cache: 20.910 GB, cache_peak: 20.910 GB
[2024-03-21 15:55:52,139][root][INFO] - train, rank: 1, epoch: 0/50, step: 6990/1, total step: 6990, (loss_avg_rank: 0.334), (loss_avg_epoch: 0.409), (ppl_avg_epoch: 1.506), (acc_avg_epoch: 0.795), (lr: 1.165e-04), [('loss_att', 0.285), ('acc', 0.823), ('loss_pre', 0.046), ('loss', 0.331), ('batch_size', 36)], {'data_load': '0.000', 'forward_time': '0.334', 'backward_time': '0.536', 'optim_time': '0.077', 'total_time': '0.948'}, GPU, memory: usage: 3.943 GB, peak: 18.291 GB, cache: 19.619 GB, cache_peak: 19.619 GB
```

通过日志文件可以直接查看训练信息，这里对一些指标进行下说明:

- rank 表示 GPU ID。
- loss_avg_rank 表示当前 Step 所有 GPU 平均损失值。
- {++loss/ppl/acc++}_avg_epoch 表示当前 Epoch 截止当前 Step 数时，总平均 Loss/PPL/Acc。此外，Epoch 结束时的最后一个 Step 表示总平均 Loss/PPL/Acc，推荐使用 Acc 指标。
- lr 表示当前 Step 的学习率。
- `[('loss_att', 0.259), ('acc', 0.825), ('loss_pre', 0.04), ('loss', 0.299), ('batch_size', 40)]` 表示当前 GPU ID 的具体数据。
- total_time 表示单个 Step 总耗时。
- `GPU, memory` 分别表示“模型使用/峰值显存” 以及 “模型+缓存使用/峰值显存”。

你熟悉 TensorBoard 可视化工具的话，也可以对日志文件进行更直观的认识。开启服务后，在浏览器中访问 http://localhost:6006 查看日志信息。

```bash
tensorboard --logdir /xxxx/FunASR/examples/industrial_data_pretraining/paraformer/outputs/log/tensorboard
```

## 3. 模型测试

### 3.1 有 configuration.json

训练后的模型文件夹 `ft_model` 中存在 configuration.json 文件，只需要将之前 ModelScope 或 HuggingFace 上模型名称更改为 `ft_model` 即可，使用上并无太大差异。

???+ example "使用训练后的模型"

    === "命令行调用"

        ```bash linenums="1"
        python -m funasr.bin.inference ++model="./model_dir" \
            ++input=="${input}" \
            ++output_dir="${output_dir}"
        ```

    === "Python 调用"

        ```bash linenums="1"
        from funasr import AutoModel

        model = AutoModel(model="./model_dir")
        res = model.generate(input=wav_file)
        print(res)
        ```

### 3.2 无 configuration.json

如果训练后的模型文件夹 `ft_model` 中不存在 configuration.json 文件，那么需要手动指定配置文件。

```bash linenums="1"
python -m funasr.bin.inference \
    --config-path "${local_path}" \
    --config-name "${config}" \
    ++init_param="${init_param}" \
    ++tokenizer_conf.token_list="${tokens}" \
    ++frontend_conf.cmvn_file="${cmvn_file}" \
    ++input="${input}" \
    ++output_dir="${output_dir}" \
    ++device="${device}"
```

这里对上面参数做一个简要介绍。

| 参数 | 说明 |
| ---- | ---- |
| config-path | 训练中的 config.yaml 文件 |
| config-name | 配置文件名，一般为 config.yaml，支持 YAML 和 JSON 格式 |
| init_param | 需要测试的模型参数，一般为 model.pt |
| tokenizer_conf.token_list | 词表文件路径，一般在 config.yaml 有指定，无需再手动指定，当 config.yaml 中路径不正确时，需要在此处手动指定。 |
| frontend_conf.cmvn_file | wav 提取 fbank 中用到的 cmvn 文件，一般在 config.yaml 有指定，无需再手动指定，当 config.yaml 中路径不正确时，需要在此处手动指定。 |
