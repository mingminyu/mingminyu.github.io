
# Python异步编程：深入理解协程

在 Python 编程中，协程（Coroutine）是一种强大的并发编程工具。与传统的线程和进程相比，协程更加轻量级，并且可以在单线程内实现多个任务的并发操作（暂停和恢复），从而提高程序的性能和资源利用率。协程可以看作是一种特殊的生成器，它不仅可以生成值，还可以接收外部传入的值。

日常数据处理流程中，I/O 操作通常是程序性能的瓶颈。传统的同步 I/O 方式在进行 I/O 操作时会阻塞线程，导致程序无法同时处理其他任务。而异步 I/O（Asynchronous I/O）则提供了一种高效的解决方案，它允许程序在等待 I/O 操作完成的同时继续执行其他任务，从而显著提高程序的并发性能。

**同步与异步**

- 同步：在同步编程中，程序按照顺序依次执行每个任务，只有当前任务完成后，才会执行下一个任务。当进行 I/O 操作时，程序会等待操作完成后再继续执行后续代码。
- 异步：异步编程允许程序在等待 I/O 操作完成的同时继续执行其他任务。当 I/O 操作完成后，会通过回调函数或其他机制通知程序。

**阻塞与非阻塞**

- 阻塞：当一个线程执行阻塞操作时，该线程会被挂起，直到操作完成。在阻塞期间，线程无法执行其他任务。
- 非阻塞：非阻塞操作不会挂起线程，而是立即返回结果。如果操作尚未完成，会返回一个表示操作未完成的状态。

**事件循环**: 事件循环是异步编程的核心机制，它负责调度和执行异步任务。事件循环会不断地检查是否有任务完成或有新的事件发生，并根据任务的状态进行相应的处理。

**协程、线程、进程的区别**

- 进程：是程序在操作系统中的一次执行过程，是系统进行资源分配和调度的基本单位。进程之间相互独立，拥有自己独立的内存空间和系统资源，进程间通信（IPC）开销较大。

- 线程：是进程中的一个执行单元，是 CPU 调度和分派的基本单位。线程共享进程的内存空间和系统资源，线程间通信相对简单，但线程的创建和销毁开销较大，并且存在线程安全问题。

- 协程：是一种用户态的轻量级线程，由程序员自行控制协程的执行和切换。协程的创建和销毁开销极小，并且不存在线程安全问题，适合处理大量的 I/O 密集型任务。

## 1. 协程的使用方式

### 1.1 生成器作为协程

在 Python 中，生成器可以作为协程使用。通过 `yield` 关键字，生成器可以暂停执行并返回一个值，同时可以接收外部传入的值。

```python linenums="1"
def simple_coroutine1():
    print("Coroutine Started")
    x = yield
    print(f"Received: {x}")


coro1 = simple_coroutine1()
next(coro1)
coro1.send(42)
```

在 Python 里，生成器/协程结束时都会抛出 `StopIteration`。如果你不捕获，它就会显示为异常。

```python linenums="1"
def simple_coroutine2():
    print('Coroutine Started')
    x = yield
    print(f"Received: {x}")


coro2 = simple_coroutine2()
next(coro2)
try:
    coro2.send(42)
except StopIteration:
    print('Finished...')
```

我们希望生成器可以多次输出，是不是继续调用 `send` 方法就好？

```python linenums="1"
def simple_coroutine3():
    print('Coroutine Started')
    x = yield
    print(f"Received: {x}")


coro3 = simple_coroutine3()
next(coro3)
try:
    coro3.send(42)
    coro3.send(25)
except StopIteration:
    print('Finished...')
```

显然，结果并没有像我们预期那样，在输出 `42` 之后，并没有继续输出 `25`，这是因为 `simple_coroutine3` 函数已经运行完成，控制权已经交给主流程了。如果希望持续调用协程，我们可以在 `simple_coroutine3` 中添加 `for` 或者 `while` 循环。

```python linenums="1"
def simple_coroutine4():
    print('Coroutine Started')

    for _ in range(10):
        x = yield
        print(f"Received: {x}")

coro4 = simple_coroutine4()
next(coro4)
try:
    coro4.send(42)
    coro4.send(25)
except StopIteration:
    print('Finished...')   # 这里为什么没有打印输出呢？
```

如果手动调用 `close` 方法或，继续使用 `send` 就会报错，

```python linenums="1"
def simple_coroutine5():
    print('Coroutine Started')

    for _ in range(10):
        x = yield
        print(f"Received: {x}")

coro5 = simple_coroutine5()
next(coro5)
try:
    coro5.send(42)
    coro5.close()
    coro5.send(25)

except StopIteration:
    print('Finished...')

except TypeError:
    print('Generator has been closed!!!')
```

### 1.2 异步函数的调用与使用

Python 3.5 引入了 `async` 和 `await` 关键字，用于定义和使用异步函数和协程。

- `async` 关键字用于定义异步函数；
- `await` 关键字用于暂停异步函数的执行，等待另一个协程的完成。

```python linenums="1"
import asyncio

async def hello():
    print('Hello')
    await asyncio.sleep(1)
    print('World')

await hello()
```

```python linenums="1"
hello()
```

如果使用的是 Jupyter 之类的工具，那么直接可以调用 `await` 函数。如果是脚本中执行，那么需要调用 `asyncio` 库的 `get_event_loop` 以及 `run_until_complete` 方法。

```python
import asyncio

async def hello():
    print('Hello')
    await asyncio.sleep(1)
    print('World')

async def main():
    await hello()

# 创建事件循环
loop = asyncio.get_event_loop()
# 运行异步函数
loop.run_until_complete(main())
# 关闭事件循环
loop.close()
```

### 1.3 多个并发任务处理

使用 `asyncio.gather()` 函数可以并发地运行多个协程，并等待所有协程完成。需要注意的是，使用 `asyncio.create_task(task1())` 和直接使用 `await task1()` 略微有点区别，`create_task` 相当于创建一个任务但不会立即运行，它的执行依赖于 `asyncio.gather`。而 `await task1()` 则是直接运行且等待返回结果。

此外，`asyncio.gather()` 的 `return_exceptions=True` 参数：当并发执行多个任务时，如果某个任务抛出异常，默认情况下 `asyncio.gather` 会立即停止并抛出异常。通过设置 `return_exceptions=True`，我们可以让 `asyncio.gather` 继续执行其他任务，并将异常作为结果返回，这样可以更灵活地处理异常情况。

```python linenums="1"
async def task1():
    print('Task 1 started')
    await asyncio.sleep(2)
    print('Task 1 finished')
    return 'Task1'

async def task2():
    print('Task 2 started')
    await asyncio.sleep(1)
    print('Task 2 finished')
    return 'Task2'

async def run_multi_async_tasks():
    # 创建任务
    t1 = asyncio.create_task(task1())
    t2 = asyncio.create_task(task2())

    # 等待所有任务完成
    await asyncio.gather(t1, t2)

await asyncio.gather(task1(), task2())
```

### 1.4 异步的上下文管理

在使用协程处理资源时，需要确保资源的正确释放。可以使用 `async with` 语句来管理异步上下文管理器。

```python linenums="1"
class AsyncResource:
    def __init__(self):
        self.opened = False

    async def __aenter__(self):
        print('Resource opened')
        self.opened = True
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        print('Resource closed')
        self.opened = False

async def main2():
    async with AsyncResource() as resource:
        print(f'Resource is opened: {resource.opened}')

await main2()
```

### 1.5 异步锁

`asyncio.Lock()` 是 异步编程中的锁（mutex），作用是 在协程之间保护临界区，防止同时访问共享资源。

```python linenums="1"
lock = asyncio.Lock()
shared_counter = 0

async def worker(name):
    global shared_counter
    async with lock:  # 获取锁
        print(f"{name} acquired lock")
        tmp = shared_counter
        await asyncio.sleep(0.1)  # 模拟操作
        shared_counter = tmp + 1
        print(f"{name} released lock")

async def run_multi_works():
    await asyncio.gather(worker("A"), worker("B"), worker("C"))

await run_multi_works()
```

没有锁时，多个协程可能同时读 `shared_counter`，导致覆盖写，最后结果可能不正确。

### 2. 实践操作

接下来我们介绍一下几个异步处理的实例，深入理解下异步处理的作用。

## 2.1 异步I/O处理

协程在处理 I/O 密集型任务时非常高效，因为它可以在等待 I/O 操作完成时暂停执行，让其他协程继续执行。

```python linenums="1"
async def fetch_data(url: str):
    print(f'Fetching data from {url}')
    await asyncio.sleep(1)
    print(f'Data fetched from {url}')
    return f'Data from {url}'

async def main():
    tasks = [fetch_data(f'http://example.com/{i}') for i in range(3)]
    results = await asyncio.gather(*tasks)
    for result in results:
        print(result)

await main()
```

### 2.2 读取文件

通过 `loop.run_in_executor()` 在一个线程池中异步读取文件内容。这样可以避免阻塞事件循环，提高程序的并发性能。

```python
async def read_file():
    async with open('example.txt', 'r') as f:
        content = await loop.run_in_executor(None, f.read)
        print(content)
```

```python linenums="1"
import aiofiles


async def read_file_aiofiles():
    async with aiofiles.open('.gitignore', 'r') as f:
        content = await f.read()
        print(content[:20])

await read_file_aiofiles()
```

### 2.3 Pandas读取网络文件

Pandas 本身没有异步处理接口，对于 CSV 文件的解析也是同步的。但是针对读取远程文件的场景，如果文件大小很大，本身下载或者读取数据流的时间就会很长，我们通过先异步下载文件再读取的方式，可以提高处理效率。

```python linenums="1"
import time
import aiohttp
import pandas as pd
from io import StringIO

async def fetch_csv(url: str) -> pd.DataFrame:
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as resp:
            text = await resp.text()
            return pd.read_csv(StringIO(text))

async def read_remote_csv():
    url = "https://people.sc.fsu.edu/~jburkardt/data/csv/airtravel.csv"
    df = await fetch_csv(url)
    return df.head()


start_async = time.time()
for _ in range(10):
    await read_remote_csv()

(time.time() - start_async) / 10
```

```python linenums="1"
start_sync = time.time()
for _ in range(10):
    _ = pd.read_csv("https://people.sc.fsu.edu/~jburkardt/data/csv/airtravel.csv").head()

(time.time() - start_sync) / 10
```

```python linenums="1"
# 多个任务
start_async2 = time.time()
for _ in range(10):
    await asyncio.gather(read_remote_csv(), main())

(time.time() - start_async2) / 10
```

```python linenums="1"
start_sync2 = time.time()
for _ in range(10):
    pd.read_csv("https://people.sc.fsu.edu/~jburkardt/data/csv/airtravel.csv").head()
    await main()

(time.time() - start_sync2) / 10
```

### 2.4 异步函数与多线程结合使用

在某些情况下，可能需要将异步函数与多线程结合使用。可以使用 `asyncio.to_thread()` 函数将一个同步函数转换为异步函数。

```python linenums="1"
def sync_function():
    time.sleep(1)
    return "Done"

async def async_with_thread():
    result = await asyncio.to_thread(sync_function)
    print(result)

await async_with_thread()
```

## 3. 异步请求-aiohttp

网络请求是 Python 开发中常见的操作，传统的 `requests` 库是同步的，这意味着在进行网络请求时，程序会阻塞直到请求完成，这在需要处理大量请求时会严重影响效率。Python 的异步编程特性为解决这个问题提供了方案，结合 `requests` 库的异步版本（通常使用 `aiohttp` 来实现异步 HTTP 请求），可以显著提高程序处理网络请求的效率。

`aiohttp` 是一个基于 `asyncio` 的异步 HTTP 客户端/服务器库，用于在 Python 中进行异步网络请求。它提供了类似于 `requests` 库的 API，方便开发者使用。

```bash
pip install aiohttp
```

```python linenums="1"
async def fetch(
    session: aiohttp.client.ClientSession, 
    url: str, semaphore: int
):
    async with semaphore:
        try:
            async with session.get(url, timeout=aiohttp.ClientTimeout(total=3)) as response:  # 处理请求超时
                response.raise_for_status()  # 检查响应状态码
                return await response.text()

        except aiohttp.ClientError as e:
            print(f"Client error: {e}")

        except Exception as e:
            print(f"Error fetching {url}: {e}")
            return None


async def run():
    urls = [
        "https://www.example.com",
        "https://www.python.org",
        "https://www.github.com",
    ]

    semaphore = asyncio.Semaphore(2)  # 限制并发请求数量为 2
    async with aiohttp.ClientSession() as session:
        tasks = [fetch(session, url, semaphore) for url in urls]
        results = await asyncio.gather(*tasks)
        for result in results:
            if result:
                print(result[:20])

await run()
```

`response.raise_for_status()`：该方法用于检查响应的状态码，如果状态码不是 200，会抛出 `aiohttp.ClientResponseError` 异常

## 4. 异步文件处理—aiofiles

## 5. 小结

- 错误处理: 在异步编程中，错误处理非常重要。可以使用 `try-except` 块捕获和处理协程中抛出的异常。
- 性能优化: 避免在协程中使用阻塞 I/O 操作，尽量使用异步库；合理设置并发任务的数量，避免资源耗尽。
- 使用线程池和进程池：对于一些 CPU 密集型任务，可以使用 `loop.run_in_executor()` 在线程池或进程池中执行，避免阻塞事件循环。
- 使用异步队列：在处理大量异步任务时，可以使用异步队列（`asyncio.Queue`）来管理任务的调度和资源的分配。
