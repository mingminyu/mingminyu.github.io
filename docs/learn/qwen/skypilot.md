# SkyPilot

SkyPilot 是一个可以在任何云上运行 LLM、AI 应用以及批量任务的框架，旨在实现最大程度的成本节省、最高的 GPU 可用性以及受管理的执行过程。其特性包括：

- 通过跨区域和跨云充分利用多个资源池，以获得最佳的 GPU 可用性。
- 把费用降到最低 —— SkyPilot 在各区域和云平台中为您挑选最便宜的资源。无需任何托管解决方案的额外加价。
- 将服务扩展到多个副本上，所有副本通过单 —— endpoint 对外提供服务
- 所有内容均保存在您的云账户中（包括您的虚拟机和 bucket ）
- 完全私密，没有其他人能看到您的聊天记录

## 1. 安装

我们建议您按照 [指示](https://skypilot.readthedocs.io/en/latest/getting-started/installation.html) 安装 SkyPilot，通常我们使用 `pip` 就可以快速安装:

```bash
pip install "skypilot-nightly[aws,gcp]"
```

随后，您需要用如下命令确认是否能使用云：

```bash
sky check
```

或者我们也可以使用官方提供的 docker 镜像，可以自动克隆 SkyPilot 的主分支：

```bash linenums="1"
docker run --platform linux/amd64 \
  -td --rm --name sky \
  -v "$HOME/.sky:/root/.sky:rw" \
  -v "$HOME/.aws:/root/.aws:rw" \
  -v "$HOME/.config/gcloud:/root/.config/gcloud:rw" \
  berkeleyskypilot/skypilot-nightly

docker exec -it sky /bin/bash
```

## 2. 运行 Qwen2-72B-Instruct

[serve-72b.yaml](https://github.com/skypilot-org/skypilot/blob/master/llm/qwen/serve-72b.yaml) 中列出了支持的 GPU，我们可使用配备这类 GPU 的单个运算实例来部署 Qwen2-72B-Instruct 服务。该服务由 vLLM 搭建，并与 OpenAI API 兼容。

```bash
sky launch -c qwen serve-72b.yaml
```
接下来，我们可以向 endpoint 发送续写请求：

```bash linenums="1"
IP=$(sky status --ip qwen)

curl -L http://$IP:8000/v1/completions \
    -H "Content-Type: application/json" \
    -d '{
      "model": "Qwen/Qwen2-72B-Instruct",
      "prompt": "My favorite food is",
      "max_tokens": 512
  }' | jq -r '.choices[0].text'
```

也可以向该 endpoint 发送对话续写请求：

```bash linenums="1"
curl -L http://$IP:8000/v1/chat/completions \
    -H "Content-Type: application/json" \
    -d '{
      "model": "Qwen/Qwen2-72B-Instruct",
      "messages": [
        {
          "role": "system",
          "content": "You are a helpful and honest chat expert."
        },
        {
          "role": "user",
          "content": "What is the best food?"
        }
      ],
      "max_tokens": 512
  }' | jq -r '.choices[0].message.content'
```

## 3. 扩展服务规模

使用 SkyPilot Serve 扩展 Qwen 的服务规模非常容易，只需运行：

```bash
sky serve up -n qwen ./serve-72b.yaml
```

这将启动服务，使用多个副本部署在最经济的可用位置和加速器上。SkyServe 将自动管理这些副本，监控其健康状况，根据负载进行自动伸缩，并在必要时重启它们。服务将返回一个 endpoint ，所有发送至该 endpoint 的请求都将被路由至就绪状态的副本。

运行如下命令检查服务的状态：

```bash
sky serve status qwen
```

很快，您将看到如下输出：

```bash
Services
NAME        VERSION  UPTIME  STATUS        REPLICAS  ENDPOINT
Qwen  1        -       READY         2/2       3.85.107.228:30002

Service Replicas
SERVICE_NAME  ID  VERSION  IP  LAUNCHED    RESOURCES                   STATUS REGION
Qwen          1   1        -   2 mins ago  1x Azure({'A100-80GB': 8}) READY  eastus
Qwen          2   1        -   2 mins ago  1x GCP({'L4': 8})          READY  us-east4-a
```

如下所示：该服务现由两个副本提供支持，一个位于 Azure 平台，另一个位于 GCP 平台。同时，已为服务选择云服务商提供的 最经济实惠 的加速器类型。这样既最大限度地提升了服务的可用性，又尽可能降低了成本。

要访问模型，我们使用带有 `curl -L` （用于跟随重定向），将请求发送到 endpoint ：

```bash linenums="1"
ENDPOINT=$(sky serve status --endpoint qwen)

curl -L http://$ENDPOINT/v1/chat/completions \
    -H "Content-Type: application/json" \
    -d '{
      "model": "Qwen/Qwen2-72B-Instruct",
      "messages": [
        {
          "role": "system",
          "content": "You are a helpful and honest code assistant expert in Python."
        },
        {
          "role": "user",
          "content": "Show me the python code for quick sorting a list of integers."
        }
      ],
      "max_tokens": 512
  }' | jq -r '.choices[0].message.content'
```

## 4. 使用 Chat GUI 调用 Qwen2

可以通过 [FastChat](https://github.com/lm-sys/FastChat) 来使用 GUI 调用 Qwen2 的服务。开启一个 Chat Web UI：

```bash
sky launch -c qwen-gui ./gui.yaml --env ENDPOINT=$(sky serve status --endpoint qwen)
```

随后，我们可以通过返回的 gradio 链接来访问 GUI ：

```bash
| INFO | stdout | Running on public URL: https://6141e84201ce0bb4ed.gradio.live
```

我们可以通过使用不同的温度和 `top_p` 值来尝试取得更好的结果。

## 5. 总结

通过 SkyPilot，你可以轻松地在任何云上部署 Qwen2。我们建议您阅读 官方文档 了解更多用法和最新进展。
