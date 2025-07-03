---
date: 2024-07-12
authors:
  - mingminyu
categories:
  - 后端开发
tags:
  - Pyhton
  - Requests
slug: requests-download-media-file
readtime: 2
---

# Requests下载媒体文件

```python linenums="1"
import requests

def download_mp3(url: str, filename: str):
    try:
        response = requests.get(url, stream=True)
        response.raise_for_status()  # 如果响应失败会抛出异常

        with open(filename, "wb") as f:
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)

        print(f"下载完成：{filename}")

    except requests.exceptions.RequestException as e:
        print(f"下载失败：{e}")

# 示例调用
download_mp3("https://example.com/audio.mp3", "output.mp3")
```

