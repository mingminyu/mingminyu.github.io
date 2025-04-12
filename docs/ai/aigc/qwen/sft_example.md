# 微调示例

Qwen 提供了一个非常简单的有监督微调脚本（该脚本是基于 **Fastchat** 的训练脚本修改而来），它使用 Hugging Face Trainer 对 Qwen 模型进行微调。你可以查看这个[脚本](https://github.com/QwenLM/Qwen2/blob/main/finetune.py) 实现细节，此外这个脚本还具有以下特点：

- 支持单卡和多卡分布式训练
- 支持全参数微调、[LoRA](https://arxiv.org/abs/2106.09685) 以及 [Q-LoRA](https://arxiv.org/abs/2305.14314)。

下面，我们介绍脚本的更多细节。

## 1. 安装

开始之前，确保你已经安装了以下代码库：

```bash
pip install peft deepspeed optimum accelerate
```

## 2. 准备数据

我们建议你放在 jsonl 文件中，每一行是一个如下所示的字典：

```json linenums="1"
[
  {
    "type": "chatml",
    "messages": [
        {
            "role": "system",
            "content": "You are a helpful assistant."
        },
        {
            "role": "user",
            "content": "Tell me something about large language models."
        },
        {
            "role": "assistant",
            "content": "Large language models are a type of language model that is trained on a large corpus of text data. They are capable of generating human-like text and are used in a variety of natural language processing tasks..."
        }
    ],
    "source": "unknown"
  },
  {
    "type": "chatml",
    "messages": [
        {
            "role": "system",
            "content": "You are a helpful assistant."
        },
        {
            "role": "user",
            "content": "What is your name?"
        },
        {
            "role": "assistant",
            "content": "My name is Qwen."
        }
    ],
    "source": "self-made"
  }
]
```

以上提供了该数据集中的每个样本的两个示例，每个样本都是一个 JSON 对象，包含以下字段：`type`、 `messages` 和 `source`。其中，`messages` 是必填字段，而其他字段则是供您标记数据格式和数据来源的可选字段。`messages` 字段是一个 JSON 对象列表，每个对象都包含两个字段：`role` 和 `content`。其中，`role` 可以是 `system`、`user` 或 `assistant`，表示消息的角色；`content` 则是消息的文本内容。而 `source` 字段代表了数据来源，可能包括 `self-made`、`alpaca`、`open-hermes` 或其他任意字符串。

你需要用 json 将一个字典列表存入 jsonl 文件中：


```python linenums="1"
import json

with open('data.jsonl', 'w') as f:
    for sample in samples:
        f.write(json.dumps(sample) + '\n')
```

## 3. 开始微调

为了让您能够快速开始微调，我们直接提供了一个 Shell 脚本，您可以无需关注具体细节即可运行。针对不同类型的训练（例如单 GPU 训练、多 GPU 训练、全参数微调、LoRA 或 Q-LoRA），您可能需要不同的超参数设置。

```bash linenums="1" hl_lines="4-5"
cd examples/sft
bash finetune.sh -m <model_path> -d <data_path> \
  --deepspeed <config_path> \ # (1)!
  [--use_lora True] \
  [--q_lora True]
```

  1. 指定 Deepspeed 配置文件

## 4. 高阶用法

接下来，我们介绍下 Python 以及 Shell 脚本的代码细节。

### 4.1 Shell 脚本

Shell 脚本中提供了一些指南，并且此处将以 finetune.sh 这个脚本为例进行解释说明。

要为分布式训练（或单 GPU 训练）设置环境变量，请指定以下变量：`GPUS_PER_NODE`、 `NNODES`、`NODE_RANK`、`MASTER_ADDR` 和 `MASTER_PORT`。不必过于担心这些变量，因为我们为您提供了默认设置。在命令行中，您可以通过传入参数 `-m` 和 `-d` 来分别指定模型路径和数据路径。您还可以通过传入参数 `--deepspeed` 来指定 Deepspeed 配置文件。我们为您提供针对 **ZeRO2** 和 **ZeRO3** 的两种配置文件，您可以根据需求选择其中之一。在大多数情况下，我们建议在多 GPU 训练中使用 ZeRO3，但针对Q-LoRA，我们推荐使用 ZeRO2。

我们可以指定 `--bf16` 或 `--fp16` 参数来设置混合精度训练所采用的精度级别。此外，还有其他一些重要的超参数如下：

- `--output_dir`: 模型或者 Adapters 保存路径
- `--num_train_epochs`: 训练周期数
- `--gradient_accumulation_steps`: 多少步进行一次梯度累加
- `--per_device_train_batch_size`: 指定每个 GPU 的训练批次大小，总的批次大小等于 `per_device_train_batch_size` × `number_of_gpus` × `gradient_accumulation_steps`。
- `--learning_rate`: 学习率
- `--warmup_steps`: 热启动的步数
- `--lr_scheduler_type`: 学习率调度器的类型
- `--weight_decay`: 权重衰减的值
- `--addm_beta2`: Adam 中 $\beta_2$ 的值
- `--model_max_length`: 最大的序列长度
- `--use_lora`: 是否使用 LoRA，通过指定 `--q_lora` 参数开启 Q-LoRA
- `--gradient_checkpointing`: 是否使用梯度检查点

### 4.2 Python 脚本

在本脚本中，我们主要使用来自 HF 的 `trainer` 和 `peft` 来训练我们的模型。同时，我们也利用 deepspeed 来加速训练过程。

```python linenums="1"
from dataclasses import dataclass

@dataclass
class ModelArguments:
    model_name_or_path: Optional[str] = field(default="Qwen/Qwen2-7B")


@dataclass
class DataArguments:
    data_path: str = field(
        default=None, metadata={"help": "Path to the training data."}
    )
    eval_data_path: str = field(
        default=None, metadata={"help": "Path to the evaluation data."}
    )
    lazy_preprocess: bool = False


@dataclass
class TrainingArguments(transformers.TrainingArguments):
    cache_dir: Optional[str] = field(default=None)
    optim: str = field(default="adamw_torch")
    model_max_length: int = field(
        default=8192,
        metadata={
            "help": "Maximum sequence length. Sequences will be right padded (and possibly truncated)."
        },
    )
    use_lora: bool = False


@dataclass
class LoraArguments:
    lora_r: int = 64
    lora_alpha: int = 16
    lora_dropout: float = 0.05
    lora_target_modules: List[str] = field(
        default_factory=lambda: [
            "q_proj",
            "k_proj",
            "v_proj",
            "o_proj",
            "up_proj",
            "gate_proj",
            "down_proj",
        ]
    )
    lora_weight_path: str = ""
    lora_bias: str = "none"
    q_lora: bool = False
```

我们通过参数类为模型、数据和训练指定超参数，如果使用 LoRA 或 Q-LoRA 训练模型，还会包含这两个方法的相关超参数。具体来说，`model-max-length` 是一个关键的超参数，它决定了训练数据的最大序列长度。

`LoRAArguments` 包含了 LoRA 或者 Q-LoRA 的超参数:

- `lora_r`: LoRA 的秩
- `lora_alpha`: LoRA 的 $\alpha$ 值
- `lora_dropout`: LoRA 的 `dropout` 比例
- `lora_target_modules`: LoRA 的目标模块，默认情况下会微调所有线性层
- `lora_weight_path`: LoRA 权重文件的路径
- `lora_bias`: LoRA 的偏差
- `q_lora`: 是否使用 Q-LoRA


```python linenums="1"
def maybe_zero_3(param):
    if hasattr(param, "ds_id"):
        assert param.ds_status == ZeroParamStatus.NOT_AVAILABLE
        with zero.GatheredParameters([param]):
            param = param.data.detach().cpu().clone()
    else:
        param = param.detach().cpu().clone()
    return param


# Borrowed from peft.utils.get_peft_model_state_dict
def get_peft_state_maybe_zero_3(named_params, bias):
    if bias == "none":
        to_return = {k: t for k, t in named_params if "lora_" in k}
    elif bias == "all":
        to_return = {k: t for k, t in named_params if "lora_" in k or "bias" in k}
    elif bias == "lora_only":
        to_return = {}
        maybe_lora_bias = {}
        lora_bias_names = set()
        for k, t in named_params:
            if "lora_" in k:
                to_return[k] = t
                bias_name = k.split("lora_")[0] + "bias"
                lora_bias_names.add(bias_name)
            elif "bias" in k:
                maybe_lora_bias[k] = t
        for k, t in maybe_lora_bias:
            if bias_name in lora_bias_names:
                to_return[bias_name] = t
    else:
        raise NotImplementedError
    to_return = {k: maybe_zero_3(v) for k, v in to_return.items()}
    return to_return


def safe_save_model_for_hf_trainer(
    trainer: transformers.Trainer, output_dir: str, bias="none"
):
    """Collects the state dict and dump to disk."""
    # check if zero3 mode enabled
    if deepspeed.is_deepspeed_zero3_enabled():
        state_dict = trainer.model_wrapped._zero3_consolidated_16bit_state_dict()
    else:
        if trainer.args.use_lora:
            state_dict = get_peft_state_maybe_zero_3(
                trainer.model.named_parameters(), bias
            )
        else:
            state_dict = trainer.model.state_dict()
    if trainer.args.should_save and trainer.args.local_rank == 0:
        trainer._save(output_dir, state_dict=state_dict)
```

方法 `safe_save_model_for_hf_trainer` 通过使用 `get_peft_state_maybe_zero_3` 有助于解决在保存采用或未采用 ZeRO3 技术训练的模型时遇到的问题。

```python linenums="1"
def preprocess(
    messages,
    tokenizer: transformers.PreTrainedTokenizer,
    max_len: int,
) -> Dict:
    """Preprocesses the data for supervised fine-tuning."""

    texts = []
    for i, msg in enumerate(messages):
        texts.append(
            tokenizer.apply_chat_template(
                msg,
                tokenize=True,
                add_generation_prompt=False,
                padding=True,
                max_length=max_len,
                truncation=True,
            )
        )
    input_ids = torch.tensor(texts, dtype=torch.int)
    target_ids = input_ids.clone()
    target_ids[target_ids == tokenizer.pad_token_id] = IGNORE_TOKEN_ID
    attention_mask = input_ids.ne(tokenizer.pad_token_id)

    return dict(
        input_ids=input_ids, target_ids=target_ids, attention_mask=attention_mask
    )
```

在数据预处理阶段，我们使用 `preprocess` 来整理数据。具体来说，我们应用 ChatML 模板对文本进行处理。如果您倾向于使用其他 Chat 模板，您也可以选择其他的，例如，仍然通过 `apply_chat_template()` 函数配合另一个 tokenizer 进行应用。Chat 模板存储在 HF 仓库中的 tokenizer_config.json 文件中。此外，我们还将每个样本的序列填充到最大长度，以便于训练。

```python linenums="1"
class SupervisedDataset(Dataset):
    """Dataset for supervised fine-tuning."""

    def __init__(
        self, raw_data, tokenizer: transformers.PreTrainedTokenizer, max_len: int
    ):
        super(SupervisedDataset, self).__init__()

        rank0_print("Formatting inputs...")
        messages = [example["messages"] for example in raw_data]
        data_dict = preprocess(messages, tokenizer, max_len)

        self.input_ids = data_dict["input_ids"]
        self.target_ids = data_dict["target_ids"]
        self.attention_mask = data_dict["attention_mask"]

    def __len__(self):
        return len(self.input_ids)

    def __getitem__(self, i) -> Dict[str, torch.Tensor]:
        return dict(
            input_ids=self.input_ids[i],
            labels=self.labels[i],
            attention_mask=self.attention_mask[i],
        )


class LazySupervisedDataset(Dataset):
    """Dataset for supervised fine-tuning."""

    def __init__(
        self, raw_data, tokenizer: transformers.PreTrainedTokenizer, max_len: int
    ):
        super(LazySupervisedDataset, self).__init__()
        self.tokenizer = tokenizer
        self.max_len = max_len

        rank0_print("Formatting inputs...Skip in lazy mode")
        self.tokenizer = tokenizer
        self.raw_data = raw_data
        self.cached_data_dict = {}

    def __len__(self):
        return len(self.raw_data)

    def __getitem__(self, i) -> Dict[str, torch.Tensor]:
        if i in self.cached_data_dict:
            return self.cached_data_dict[i]

        ret = preprocess([self.raw_data[i]["messages"]], self.tokenizer, self.max_len)
        ret = dict(
            input_ids=ret["input_ids"][0],
            labels=ret["target_ids"][0],
            attention_mask=ret["attention_mask"][0],
        )
        self.cached_data_dict[i] = ret

        return ret


def make_supervised_data_module(
    tokenizer: transformers.PreTrainedTokenizer,
    data_args,
    max_len,
) -> Dict:
    """Make dataset and collator for supervised fine-tuning."""
    dataset_cls = (
        LazySupervisedDataset if data_args.lazy_preprocess else SupervisedDataset
    )
    rank0_print("Loading data...")

    train_data = []
    with open(data_args.data_path, "r") as f:
        for line in f:
            train_data.append(json.loads(line))
    train_dataset = dataset_cls(train_data, tokenizer=tokenizer, max_len=max_len)

    if data_args.eval_data_path:
        eval_data = []
        with open(data_args.eval_data_path, "r") as f:
            for line in f:
                eval_data.append(json.loads(line))
        eval_dataset = dataset_cls(eval_data, tokenizer=tokenizer, max_len=max_len)
    else:
        eval_dataset = None

    return dict(train_dataset=train_dataset, eval_dataset=eval_dataset)
```

然后我们利用 `make_supervised_data_module`，通过使用 `SupervisedDataset` 或 `LazySupervisedDataset` 来构建数据集。

```python linenums="1"
def train():
    global local_rank

    parser = transformers.HfArgumentParser(
        (ModelArguments, DataArguments, TrainingArguments, LoraArguments)
    )
    (
        model_args,
        data_args,
        training_args,
        lora_args,
    ) = parser.parse_args_into_dataclasses()

    # This serves for single-gpu qlora.
    if (
        getattr(training_args, "deepspeed", None)
        and int(os.environ.get("WORLD_SIZE", 1)) == 1
    ):
        training_args.distributed_state.distributed_type = DistributedType.DEEPSPEED

    local_rank = training_args.local_rank

    device_map = None
    world_size = int(os.environ.get("WORLD_SIZE", 1))
    ddp = world_size != 1
    if lora_args.q_lora:
        device_map = {"": int(os.environ.get("LOCAL_RANK") or 0)} if ddp else "auto"
        if len(training_args.fsdp) > 0 or deepspeed.is_deepspeed_zero3_enabled():
            logging.warning("FSDP or ZeRO3 is incompatible with QLoRA.")

    model_load_kwargs = {
        "low_cpu_mem_usage": not deepspeed.is_deepspeed_zero3_enabled(),
    }

    compute_dtype = (
        torch.float16
        if training_args.fp16
        else (torch.bfloat16 if training_args.bf16 else torch.float32)
    )

    # Load model and tokenizer
    config = transformers.AutoConfig.from_pretrained(
        model_args.model_name_or_path,
        cache_dir=training_args.cache_dir,
    )
    config.use_cache = False

    model = AutoModelForCausalLM.from_pretrained(
        model_args.model_name_or_path,
        config=config,
        cache_dir=training_args.cache_dir,
        device_map=device_map,
        quantization_config=BitsAndBytesConfig(
            load_in_4bit=True,
            bnb_4bit_use_double_quant=True,
            bnb_4bit_quant_type="nf4",
            bnb_4bit_compute_dtype=compute_dtype,
        )
        if training_args.use_lora and lora_args.q_lora
        else None,
        **model_load_kwargs,
    )
    tokenizer = AutoTokenizer.from_pretrained(
        model_args.model_name_or_path,
        cache_dir=training_args.cache_dir,
        model_max_length=training_args.model_max_length,
        padding_side="right",
        use_fast=False,
    )

    if training_args.use_lora:
        lora_config = LoraConfig(
            r=lora_args.lora_r,
            lora_alpha=lora_args.lora_alpha,
            target_modules=lora_args.lora_target_modules,
            lora_dropout=lora_args.lora_dropout,
            bias=lora_args.lora_bias,
            task_type="CAUSAL_LM",
        )
        if lora_args.q_lora:
            model = prepare_model_for_kbit_training(
                model, use_gradient_checkpointing=training_args.gradient_checkpointing
            )

        model = get_peft_model(model, lora_config)

        # Print peft trainable params
        model.print_trainable_parameters()

        if training_args.gradient_checkpointing:
            model.enable_input_require_grads()

    # Load data
    data_module = make_supervised_data_module(
        tokenizer=tokenizer, data_args=data_args, max_len=training_args.model_max_length
    )

    # Start trainer
    trainer = Trainer(
        model=model, tokenizer=tokenizer, args=training_args, **data_module
    )

    # `not training_args.use_lora` is a temporary workaround for the issue that there are problems with
    # loading the checkpoint when using LoRA with DeepSpeed.
    # Check this issue https://github.com/huggingface/peft/issues/746 for more information.
    if (
        list(pathlib.Path(training_args.output_dir).glob("checkpoint-*"))
        and not training_args.use_lora
    ):
        trainer.train(resume_from_checkpoint=True)
    else:
        trainer.train()
    trainer.save_state()

    safe_save_model_for_hf_trainer(
        trainer=trainer, output_dir=training_args.output_dir, bias=lora_args.lora_bias
    )
```

`train` 方法是训练过程的关键所在。通常情况下，它会通过 `AutoTokenizer.from_pretrained()` 和 `AutoModelForCausalLM.from_pretrained()` 来加载tokenizer 和模型。如果使用了 LoRA，该方法将会用 `LoraConfig` 初始化 LoRA 配置。若应用 Q-LoRA，则应当采用 `prepare_model_for_kbit_training`。请注意，目前还不支持对 LoRA 的续训（resume）。接下来的任务就交给 trainer 处理。