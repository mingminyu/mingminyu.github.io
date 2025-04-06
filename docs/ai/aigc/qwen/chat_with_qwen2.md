# 与 Qwen2 进行交互

使用 Qwen2 最简单的方法就是利用 `transformers` 库与之对话。在本文档中，我们将展示如何在 **流式** 模式或 **非流式** 模式下与 Qwen2-7B-Instruct 进行对话。

## 1. 基本使用

你只需借助 `transformers` 库编写几行代码，就能与 Qwen2-Instruct 进行对话。实质上，我们通过 `from_pretrained` 方法构建 `tokenizer` 和模型，然后利用 `generate` 方法，在`tokenizer.apply_chat_template` 的辅助下进行对话。

???+ "Qwen2-7B-Instruct 使用示例"

    === "基本使用"

        ```python linenums="1"
        from transformers import AutoModelForCausalLM, AutoTokenizer
        
        
        device = "cuda"
        model = AutoModelForCausalLM.from_pretrained(
            "Qwen/Qwen2-7B-Instruct",
            torch_dtype="auto",
            device_map="auto"
        )
        tokenizer = AutoTokenizer.from_pretrained("Qwen/Qwen2-7B-Instruct")
        prompt = "Give me a short introduction to large language model."
        messages = [
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": prompt}
        ]
        text = tokenizer.apply_chat_template(
            messages,  # (1)!
            tokenize=False,
            add_generation_prompt=True  # (2)!
        )
        model_inputs = tokenizer([text], return_tensors="pt").to(device)
        generated_ids = model.generate(
            model_inputs.input_ids,
            max_new_tokens=512  # (3)!
        )
        generated_ids = [
            output_ids[len(input_ids):] 
            for input_ids, output_ids in zip(model_inputs.input_ids, generated_ids)
        ]

        response = tokenizer.batch_decode(  # ()!
            generated_ids, skip_special_tokens=True
            )[0]
        ```

            1. 默认情况下，如果没有指定系统提示，Qwen2 直接使用 `You are a helpful assistant.` 作为系统提示。
            2. 用于在输入中添加生成提示，该提示指向 `<|im_start|>assistant\n`。
            3. `max_new_tokens` 参数用于设置响应的最大长度。
            4. 使用 `tokenizer.batch_decode` 对响应进行解码。

    === "使用 Flash Attention2 加速推理"

        ```python linenums="1" hl_lines="5"
        model = AutoModelForCausalLM.from_pretrained(
            "Qwen/Qwen2-7B-Instruct",
            torch_dtype="auto",
            device_map="auto",
            attn_implementation="flash_attention_2",
        )
        ```


!!! warning "model.chat 方法已经废弃"

    请注意，原 Qwen 仓库中的旧方法 `model.chat` 现在已被 `model.generate` 方法替代。这里使用了 `tokenizer.apply_chat_template` 函数将消息转换为模型能够理解的格式。

## 2. 流式输出

针对流式输出模式，Qwen2 提供了 `TextStreamer` 和 `TextIteratorStreamer` 两种方式，`TextStreamer` 我们先前介绍过，而 `TextIteratorStreamer` 是将可打印的文本存储在一个队列中，以便下游应用程序作为迭代器来使用。

???+ "Qwen2 流式交互"

    === "TextStreamer"

        ```python linenums="1" hl_lines="1 10"
        from transformers import TextStreamer


        streamer = TextStreamer(
            tokenizer, skip_prompt=True, skip_special_tokens=True
            )
        generated_ids = model.generate(
            model_inputs,
            max_new_tokens=512,
            streamer=streamer,
        )
        ```

    === "TextIteratorStreamer"

        ```python linenums="1" hl_lines="1 5-9"
        from threading import Thread
        from transformers import TextIteratorStreamer


        streamer = TextIteratorStreamer(
            tokenizer, skip_prompt=True, skip_special_tokens=True
            )
        generation_kwargs = dict(model_inputs, streamer=streamer, max_new_tokens=512)
        thread = Thread(target=model.generate, kwargs=generation_kwargs)

        thread.start()
        generated_text = ""
        for new_text in streamer:
            generated_text += new_text
        
        print(generated_text)
        ```
