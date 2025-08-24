---
date: 2025-08-23
authors:
  - mingminyu
categories:
  - 后端开发
tags:
  - Python进度条
slug: add_progressbar_for_your_app
readtime: 5
---

# 给应用终端输出添加Python进度条

很多时候，给你的程序添加一个进度条，可以比较直观地看到当前整个任务的进展。Python 常用的进度条有如下几个 [tqdm](https://github.com/tqdm/tqdm)、[rich](https://github.com/Textualize/rich)。此外，像 progressbar、[pyprind](https://github.com/rasbt/pyprind)、[progressive](https://github.com/hfaran/progressive) 这些库已经很久没更新了，这里不建议使用。

<!-- more -->

## 1. tqdm

## 2. rich

## 3. progressbar

## 4. pyprind

[PyPrind](https://github.com/rasbt/pyprind) 没有比较官方的网址，其详细使用教程就放在 GitHub 主页，有兴趣的同学可以自己看下其他使用方法，非常的简单易用。

```python linenums="1"
import pyprind
import time

bar = pyprind.ProgBar(n, monitor=True)
for i in range(n):
    time.sleep(timesleep) # your computation here
    bar.update()
print(bar)
```

!!! warning "注意"

    截止 20250822，PyPrind 已经 4 年没有更新了，请尽可能使用 tqdm 或者 rich。

## 5. progressive

[Progressive](https://progressive.readthedocs.io/en/latest) 是一个 Python 库，用于在终端中显示进度条。

```python linenums="1"
from progressive.bar import Bar

bar = Bar(max_value=100)
bar.cursor.clear_lines(2)  # Make some room
bar.cursor.save()  # Mark starting line

for i in range(101):
    sleep(0.1)  # Do some work
    bar.cursor.restore()  # Return cursor to start
    bar.draw(value=i)  # Draw the bar!
```

!!! warning "注意"

    progressive 库最近一次更新是 7 年前了，请尽可能使用 tqdm 或者 rich。
