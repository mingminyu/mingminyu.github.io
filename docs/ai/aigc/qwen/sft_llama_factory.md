# LLama Factory 微调

本届将介绍如何使用 LLaMA-Factory 微调 Qwen2 模型。本脚本包含如下特点：

- 支持单卡和多卡分布式训练
- 支持全参数微调、LoRA、Q-LoRA 和 DoRA。

## 1. 安装

根据 [LLaMA-Factory](https://github.com/hiyouga/LLaMA-Factory) 官方指引构建好你的环境:

```bash linenums="1"
pip install deepspeed
pip install flash-attn --no-build-isolation
```

!!! note "使用 Flash Attention2"

    如果使用 Flash Attention 2，请确保 CUDA 版本在 11.6 以上。

## 2. 准备数据

LLaMA-Factory 支持以 alpaca 或 sharegpt 格式的数据集，在 data 文件夹中提供了多个训练数据集 (1) 。如果您打算使用自定义数据集，请按照以下方式准备您的数据集。
{ .annotate }

  1. 自定义数据以 json 格式进行组织，并放入 data 文件夹中。


???+ "自定义数据集"

    === "Alpaca"

        ```json linenums="1"
        [
          {
            "instruction": "user instruction (required)",
            "input": "user input (optional)",
            "output": "model response (required)",
            "system": "system prompt (optional)",
            "history": [
              ["user instruction in the first round (optional)", "model response in the first round (optional)"],
              ["user instruction in the second round (optional)", "model response in the second round (optional)"]
            ]
          }
        ]
        ```
    
    === "ShareGPT"

        ```json linenums="1"
        [
          {
            "conversations": [
              {
                "from": "human",
                "value": "user instruction"
              },
              {
                "from": "gpt",
                "value": "model response"
              }
            ],
            "system": "system prompt (optional)",
            "tools": "tool description (optional)"
          }
        ]
        ```

在 data/dataset_info.json 文件中提供您的数据集定义，并采用以下格式：

???+ "dataset_info.json"

    === "Alpaca"

        ```json linenums="1"
        "dataset_name": {
          "file_name": "dataset_name.json",
          "columns": {
            "prompt": "instruction",
            "query": "input",
            "response": "output",
            "system": "system",
            "history": "history"
          }
        }
        ```
    
    === "ShareGPT"

        ```json linenums="1"
        "dataset_name": {
          "file_name": "dataset_name.json",
          "formatting": "sharegpt",
          "columns": {
            "messages": "conversations",
            "system": "system",
            "tools": "tools"
          },
          "tags": {
            "role_tag": "from",
            "content_tag": "value",
            "user_tag": "user",
            "assistant_tag": "assistant"
          }
        }
        ```

## 3. 训练

```bash linenums="1"
DISTRIBUTED_ARGS="
    --nproc_per_node $NPROC_PER_NODE \
    --nnodes $NNODES \
    --node_rank $NODE_RANK \
    --master_addr $MASTER_ADDR \
    --master_port $MASTER_PORT
  "

torchrun $DISTRIBUTED_ARGS src/train.py \
    --deepspeed $DS_CONFIG_PATH \
    --stage sft \
    --do_train \
    --use_fast_tokenizer \
    --flash_attn \
    --model_name_or_path $MODEL_PATH \
    --dataset your_dataset \
    --template qwen \
    --finetuning_type lora \
    --lora_target q_proj,v_proj\
    --output_dir $OUTPUT_PATH \
    --overwrite_cache \
    --overwrite_output_dir \
    --warmup_steps 100 \
    --weight_decay 0.1 \
    --per_device_train_batch_size 4 \
    --gradient_accumulation_steps 4 \
    --ddp_timeout 9000 \
    --learning_rate 5e-6 \
    --lr_scheduler_type cosine \
    --logging_steps 1 \
    --cutoff_len 4096 \
    --save_steps 1000 \
    --plot_loss \
    --num_train_epochs 3 \
    --bf16
```


如果要调整训练，我们可以通过修改训练命令中的参数来调整超参数。其中一个需要注意的参数是 `cutoff_len`，它代表训练数据的最大长度。通过控制这个参数，可以避免出现OOM（内存溢出）错误。

## 4. 合并 LoRA

如果你使用 LoRA 训练模型，可能需要将 adapter 参数合并到主分支中。请运行以下命令以执行 LoRA adapter 的合并操作。

```bash linenums="1"
CUDA_VISIBLE_DEVICES=0 llamafactory-cli export \
    --model_name_or_path path_to_base_model \
    --adapter_name_or_path path_to_adapter \
    --template qwen \
    --finetuning_type lora \
    --export_dir path_to_export \
    --export_size 2 \
    --export_legacy_format False
```
