# 第20章：最后的项目: 构建多线程 Web 服务器
这是一次漫长的旅途，不过我们到达了本书的结束。在本章中，我们将一同构建另一个项目，来展示最后几章所学，同时复习更早的章节。

作为最后的项目，我们将要实现一个返回 “hello” 的 Web 服务器，它在浏览器中看起来就如图例 20-1 所示：

![hello from rust](https://rustwiki.org/zh-CN/book/img/trpl20-01.png)

图例 20-1: 我们最后将一起分享的项目

如下是我们将怎样构建此 Web 服务器的计划：

1. 学习一些 TCP 与 HTTP 知识
2. 在套接字（socket）上监听 TCP 请求
3. 解析少量的 HTTP 请求
4. 创建一个合适的 HTTP 响应
5. 通过线程池改善 server 的吞吐量

不过在开始之前，需要提到一点细节：这里使用的方法并不是使用 Rust 构建 Web 服务器最好的方法。[crates.io](https://crates.io/) 上有很多可用于生产环境的 crate，它们提供了比我们所要编写的更为完整的 Web 服务器和线程池实现。

然而，本章的目的在于学习，而不是走捷径。因为 Rust 是一个系统编程语言，我们能够选择处理什么层次的抽象，并能够选择比其他语言可能或可用的层次更低的层次。因此我们将自己编写一个基础的 HTTP server 和线程池，以便学习将来可能用到的 crate 背后的通用理念和技术。

## 1. 构建单线程 Web 服务器

首先让我们创建一个可运行的单线程 Web 服务器，不过在开始之前，我们将快速了解一下构建 Web 服务器所涉及到的协议。这些协议的细节超出了本书的范畴，不过一个简单的概括会提供我们所需的信息。

Web 服务器中涉及到的两个主要协议是 **超文本传输协议**（*Hypertext Transfer Protocol*，*HTTP*）和 **传输控制协议**（*Transmission Control Protocol*，*TCP*）。这两者都是 **请求-响应**（*request-response*）协议，也就是说，有 **客户端**（*client*）来初始化请求，并有 **服务端**（*server*）监听请求并向客户端提供响应。请求与响应的内容由协议本身定义。

TCP 是一个底层协议，它描述了信息如何从一个服务器到另一个的细节，不过其并不指定信息是什么。HTTP 构建于 TCP 之上，它定义了请求和响应的内容。为此，技术上讲可将 HTTP 用于其他协议之上，不过对于绝大部分情况，HTTP 通过 TCP 传输。我们将要做的就是处理 TCP 和 HTTP 请求与响应的原始字节数据。

### 1.1 监听 TCP 连接

我们的 Web 服务器需要监听 TCP 连接，所以这是我们讲解的第一部分内容。标准库提供了 `std::net` 模块处理这些功能。让我们一如既往新建一个项目：

```console
$ cargo new hello
     Created binary (application) `hello` project
$ cd hello
```

并在 `src/main.rs` 输入示例 20-1 中的代码作为开始。这段代码会在地址 `127.0.0.1:7878` 上监听传入的 TCP 流。当获取到传入的流，它会打印出 `Connection established!`：

文件名: src/main.rs

```rust
use std::net::TcpListener;

fn main() {
    let listener = TcpListener::bind("127.0.0.1:7878").unwrap();

    for stream in listener.incoming() {
        let stream = stream.unwrap();

        println!("Connection established!");
    }
}
```

示例 20-1: 监听传入的流并在接收到流时打印信息

`TcpListener` 用于监听 TCP 连接。我们选择监听地址 `127.0.0.1:7878`。将这个地址拆开，冒号之前的部分是一个代表本机的 IP 地址（这个地址在每台计算机上都相同，并不特指作者的计算机），而 `7878` 是端口。选择这个端口出于两个原因：通常 HTTP 接受这个端口而且 7878 在电话上打出来就是 "rust"（译者注：九宫格键盘上的英文）。

在这个场景中 `bind` 函数类似于 `new` 函数，在这里它返回一个新的 `TcpListener` 实例。这个函数叫做 `bind` 是因为，在网络领域，连接到监听端口被称为 “绑定到一个端口”（“binding to a port”）

`bind` 函数返回 `Result<T, E>`，这表明绑定可能会失败，例如，连接 80 端口需要管理员权限（非管理员用户只能监听大于 1024 的端口），所以如果不是管理员尝试连接 80 端口，则会绑定失败。另一个例子是如果运行两个此程序的实例这样会有两个程序监听相同的端口，绑定会失败。因为我们是出于学习目的来编写一个基础的服务器，将不用关心处理这类错误，使用 `unwrap` 在出现这些情况时直接停止程序。

`TcpListener` 的 `incoming` 方法返回一个迭代器，它提供了一系列的流（更准确的说是 `TcpStream` 类型的流）。**流**（*stream*）代表一个客户端和服务端之间打开的连接。**连接**（*connection*）代表客户端连接服务端、服务端生成响应以及服务端关闭连接的全部请求 / 响应过程。为此，`TcpStream` 允许我们读取它来查看客户端发送了什么，并可以编写响应。总体来说，这个 `for` 循环会依次处理每个连接并产生一系列的流供我们处理。

目前为止，处理流的过程包含 `unwrap` 调用，如果出现任何错误会终止程序，如果没有任何错误，则打印出信息。下一个示例我们将为成功的情况增加更多功能。当客户端连接到服务端时 `incoming` 方法返回错误是可能的，因为我们实际上没有遍历连接，而是遍历 **连接尝试**（*connection attempts*）。连接可能会因为很多原因不能成功，大部分是操作系统相关的。例如，很多系统限制同时打开的连接数；新连接尝试产生错误，直到一些打开的连接关闭为止。

让我们试试这段代码！首先在终端执行 `cargo run`，接着在浏览器中加载 `127.0.0.1:7878`。浏览器会显示出看起来类似于“连接重置”（“Connection reset”）的错误信息，因为服务端目前并没响应任何数据。但是如果我们观察终端，会发现当浏览器连接服务端时会打印出一系列的信息！

```text
     Running `target/debug/hello`
Connection established!
Connection established!
Connection established!
```

有时会看到对于一次浏览器请求会打印出多条信息；这可能是因为浏览器在请求页面的同时还请求了其他资源，比如出现在浏览器 tab 标签中的 *favicon.ico*。

这也可能是因为浏览器尝试多次连接服务器，因为服务器没有响应任何数据。当 `stream` 在循环的结尾离开作用域并被丢弃，其连接将被关闭，作为 `drop` 实现的一部分。浏览器有时通过重连来处理关闭的连接，因为这些问题可能是暂时的。现在重要的是我们成功的处理了 TCP 连接！

记得当运行完特定版本的代码后使用 ctrl-C 来停止程序。并在做出最新的代码修改之后执行 `cargo run` 重启服务。

### 1.2 读取请求

让我们实现读取来自浏览器请求的功能！为了分离获取连接和接下来对连接的操作的相关内容，我们将开始一个新函数来处理连接。在这个新的 `handle_connection` 函数中，我们从 TCP 流中读取数据并打印出来以便观察浏览器发送过来的数据。将代码修改为如示例 20-2 所示：

文件名: src/main.rs

```rust
use std::io::prelude::*;
use std::net::TcpListener;
use std::net::TcpStream;

fn main() {
    let listener = TcpListener::bind("127.0.0.1:7878").unwrap();

    for stream in listener.incoming() {
        let stream = stream.unwrap();

        handle_connection(stream);
    }
}

fn handle_connection(mut stream: TcpStream) {
    let mut buffer = [0; 1024];

    stream.read(&mut buffer).unwrap();

    println!("Request: {}", String::from_utf8_lossy(&buffer[..]));
}
```

示例 20-2: 读取 `TcpStream` 并打印数据

这里将 `std::io::prelude` 引入作用域来获取读写流所需的特定 trait。在 `main` 函数的 `for` 循环中，相比获取到连接时打印信息，现在调用新的 `handle_connection` 函数并向其传递 `stream`。

在 `handle_connection` 中，`stream` 参数是可变的。这是因为 `TcpStream` 实例在内部记录了所返回的数据。它可能读取了多于我们请求的数据并保存它们以备下一次请求数据。因此它需要是 `mut` 的因为其内部状态可能会改变；通常我们认为 “读取” 不需要可变性，不过在这个例子中则需要 `mut` 关键字。

接下来，需要实际读取流。这里分两步进行：首先，在栈上声明一个 `buffer` 来存放读取到的数据。这里创建了一个 1024 字节的缓冲区，它足以存放基本请求的数据并满足本章的目的需要。如果希望处理任意大小的请求，缓冲区管理将更为复杂，不过现在一切从简。接着将缓冲区传递给 `stream.read` ，它会从 `TcpStream` 中读取字节并放入缓冲区中。

接下来将缓冲区中的字节转换为字符串并打印出来。`String::from_utf8_lossy` 函数获取一个 `&[u8]` 并产生一个 `String`。函数名的 “lossy” 部分来源于当其遇到无效的 UTF-8 序列时的行为：它使用 `�`，`U+FFFD REPLACEMENT CHARACTER`，来代替无效序列。你可能会在缓冲区的剩余部分看到这些替代字符，因为他们没有被请求数据填满。

让我们试一试！启动程序并再次在浏览器中发起请求。注意浏览器中仍然会出现错误页面，不过终端中程序的输出现在看起来像这样：

```text
$ cargo run
   Compiling hello v0.1.0 (file:///projects/hello)
    Finished dev [unoptimized + debuginfo] target(s) in 0.42 secs
     Running `target/debug/hello`
Request: GET / HTTP/1.1
Host: 127.0.0.1:7878
User-Agent: Mozilla/5.0 (Windows NT 10.0; WOW64; rv:52.0) Gecko/20100101
Firefox/52.0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
Accept-Language: en-US,en;q=0.5
Accept-Encoding: gzip, deflate
Connection: keep-alive
Upgrade-Insecure-Requests: 1
������������������������������������
```

根据使用的浏览器不同可能会出现稍微不同的数据。现在我们打印出了请求数据，可以通过观察 `Request: GET` 之后的路径来解释为何会从浏览器得到多个连接。如果重复的连接都是请求 */*，就知道了浏览器尝试重复获取 */* 因为它没有从程序得到响应。

拆开请求数据来理解浏览器向程序请求了什么。

#### 1.2.1 仔细观察 HTTP 请求

HTTP 是一个基于文本的协议，同时一个请求有如下格式：

```text
Method Request-URI HTTP-Version CRLF
headers CRLF
message-body
```

第一行叫做 **请求行**（*request line*），它存放了客户端请求了什么的信息。请求行的第一部分是所使用的 *method*，比如 `GET` 或 `POST`，这描述了客户端如何进行请求。这里客户端使用了 `GET` 请求。

请求行接下来的部分是 */*，它代表客户端请求的 **统一资源标识符**（*Uniform Resource Identifier*，*URI*） —— URI 大体上类似，但也不完全类似于 URL（**统一资源定位符**，*Uniform Resource Locators*）。URI 和 URL 之间的区别对于本章的目的来说并不重要，不过 HTTP 规范使用术语 URI，所以这里可以简单的将 URL 理解为 URI。

最后一部分是客户端使用的 HTTP 版本，然后请求行以 **CRLF 序列** （CRLF 代表回车和换行，*carriage return line feed*，这是打字机时代的术语！）结束。CRLF 序列也可以写成 `\r\n`，其中 `\r` 是回车符，`\n` 是换行符。 CRLF 序列将请求行与其余请求数据分开。 请注意，打印 CRLF 时，我们会看到一个新行，而不是 `\r\n`。

观察目前运行程序所接收到的数据的请求行，可以看到 `GET` 是 method，*/* 是请求 URI，而 `HTTP/1.1` 是版本。

从 `Host:` 开始的其余的行是 headers；`GET` 请求没有 body。

如果你希望的话，尝试用不同的浏览器发送请求，或请求不同的地址，比如 `127.0.0.1:7878/test`，来观察请求数据如何变化。

现在我们知道了浏览器请求了什么。让我们返回一些数据！

### 1.3 编写响应

我们将实现在客户端请求的响应中发送数据的功能。响应有如下格式：

```text
HTTP-Version Status-Code Reason-Phrase CRLF
headers CRLF
message-body
```

第一行叫做 **状态行**（*status line*），它包含响应的 HTTP 版本、一个数字状态码用以总结请求的结果和一个描述之前状态码的文本原因短语。CRLF 序列之后是任意 header，另一个 CRLF 序列，和响应的 body。

这里是一个使用 HTTP 1.1 版本的响应例子，其状态码为 200，原因短语为 OK，没有 header，也没有 body：

```text
HTTP/1.1 200 OK\r\n\r\n
```

状态码 200 是一个标准的成功响应。这些文本是一个微型的成功 HTTP 响应。让我们将这些文本写入流作为成功请求的响应！在 `handle_connection` 函数中，我们需要去掉打印请求数据的 `println!`，并替换为示例 20-3 中的代码：

文件名: src/main.rs

```rust
fn handle_connection(mut stream: TcpStream) {
    let mut buffer = [0; 1024];

    stream.read(&mut buffer).unwrap();

    let response = "HTTP/1.1 200 OK\r\n\r\n";

    stream.write(response.as_bytes()).unwrap();
    stream.flush().unwrap();
}
```

示例 20-3: 将一个微型成功 HTTP 响应写入流

新代码中的第一行定义了变量 `response` 来存放将要返回的成功响应的数据。接着，在 `response` 上调用 `as_bytes`，因为 `stream` 的 `write` 方法获取一个 `&[u8]` 并直接将这些字节发送给连接。

因为 `write` 操作可能会失败，所以像之前那样对任何错误结果使用 `unwrap`。同理，在真实世界的应用中这里需要添加错误处理。最后，`flush` 会等待并阻塞程序执行直到所有字节都被写入连接中；`TcpStream` 包含一个内部缓冲区来最小化对底层操作系统的调用。

有了这些修改，运行我们的代码并进行请求！我们不再向终端打印任何数据，所以不会再看到除了 Cargo 以外的任何输出。不过当在浏览器中加载 *127.0.0.1:7878* 时，会得到一个空页面而不是错误。太棒了！我们刚刚手写了一个 HTTP 请求与响应。

### 1.4 返回真正的 HTML

让我们实现不只是返回空页面的功能。在项目根目录创建一个新文件，*hello.html* —— 而不是在 *src* 目录中。在此可以放入任何你期望的 HTML；列表 20-4 展示了一个可能的文本：

文件名: hello.html

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Hello!</title>
  </head>
  <body>
    <h1>Hello!</h1>
    <p>Hi from Rust</p>
  </body>
</html>
```

示例 20-4: 一个简单的 HTML 文件用来作为响应

这是一个极小化的 HTML5 文档，它有一个标题和一小段文本。为了在服务端接受请求时返回它，需要如示例 20-5 所示修改 `handle_connection` 来读取 HTML 文件，将其加入到响应的 body 中，并发送：

文件名: src/main.rs

```rust
use std::fs;
// --snip--

fn handle_connection(mut stream: TcpStream) {
    let mut buffer = [0; 1024];
    stream.read(&mut buffer).unwrap();

    let contents = fs::read_to_string("hello.html").unwrap();

    let response = format!(
        "HTTP/1.1 200 OK\r\nContent-Length: {}\r\n\r\n{}",
        contents.len(),
        contents
    );

    stream.write(response.as_bytes()).unwrap();
    stream.flush().unwrap();
}
```

示例 20-5: 将 *hello.html* 的内容作为响应 body 发送

在开头增加了一行来将标准库中的 `File` 引入作用域。打开和读取文件的代码应该看起来很熟悉，因为第 12 章 I/O 项目的示例 12-4 中读取文件内容时出现过类似的代码。

接下来，使用 `format!` 将文件内容加入到将要写入流的成功响应的 body 中。

使用 `cargo run` 运行程序，在浏览器加载 *127.0.0.1:7878*，你应该会看到渲染出来的 HTML 文件！

目前忽略了 `buffer` 中的请求数据并无条件的发送了 HTML 文件的内容。这意味着如果尝试在浏览器中请求 *127.0.0.1:7878/something-else* 也会得到同样的 HTML 响应。如此其作用是非常有限的，也不是大部分服务端所做的；让我们检查请求并只对格式良好（well-formed）的请求 `/` 发送 HTML 文件。

### 1.5 验证请求并有选择的进行响应

目前我们的 Web 服务器不管客户端请求什么都会返回相同的 HTML 文件。让我们增加在返回 HTML 文件前检查浏览器是否请求 */*，并在其请求任何其他内容时返回错误的功能。为此需要如示例 20-6 那样修改 `handle_connection`。新代码接收到的请求的内容与已知的 */* 请求的一部分做比较，并增加了 `if` 和 `else` 块来区别处理请求：

文件名: src/main.rs

```rust
// --snip--

fn handle_connection(mut stream: TcpStream) {
    let mut buffer = [0; 1024];
    stream.read(&mut buffer).unwrap();

    let get = b"GET / HTTP/1.1\r\n";

    if buffer.starts_with(get) {
        let contents = fs::read_to_string("hello.html").unwrap();

        let response = format!(
            "HTTP/1.1 200 OK\r\nContent-Length: {}\r\n\r\n{}",
            contents.len(),
            contents
        );

        stream.write(response.as_bytes()).unwrap();
        stream.flush().unwrap();
    } else {
        // 其他请求
    }
}
```

示例 20-6: 匹配请求并区别处理 */* 请求与其他请求

首先，将与 */* 请求相关的数据硬编码进变量 `get`。因为我们将原始字节读取进了缓冲区，所以在 `get` 的数据开头增加 `b""` 字节字符串语法将其转换为字节字符串。接着检查 `buffer` 是否以 `get` 中的字节开头。如果是，这就是一个格式良好的 */* 请求，也就是 `if` 块中期望处理的成功情况，并会返回 HTML 文件内容的代码。

如果 `buffer` **不** 以 `get` 中的字节开头，就说明接收的是其他请求。之后会在 `else` 块中增加代码来响应所有其他请求。

现在如果运行代码并请求 *127.0.0.1:7878*，就会得到 *hello.html* 中的 HTML。如果进行任何其他请求，比如 *127.0.0.1:7878/something-else*，则会得到像运行示例 20-1 和 20-2 中代码那样的连接错误。

现在向示例 20-7 的 `else` 块增加代码来返回一个带有 404 状态码的响应，这代表了所请求的内容没有找到。接着也会返回一个 HTML 向浏览器终端用户表明此意：

文件名: src/main.rs

```rust
    // --snip--
    } else {
        let status_line = "HTTP/1.1 404 NOT FOUND";
        let contents = fs::read_to_string("404.html").unwrap();

        let response = format!(
            "{}\r\nContent-Length: {}\r\n\r\n{}",
            status_line,
            contents.len(),
            contents
        );

        stream.write(response.as_bytes()).unwrap();
        stream.flush().unwrap();
    }
```

示例 20-7: 对于任何不是 */* 的请求返回 `404` 状态码的响应和错误页面

这里，响应的状态行有状态码 404 和原因短语 `NOT FOUND`。仍然没有返回任何 header，而其 body 将是 *404.html* 文件中的 HTML。需要在 *hello.html* 同级目录创建 *404.html* 文件作为错误页面；这一次也可以随意使用任何 HTML 或使用示例 20-8 中的示例 HTML：

文件名: 404.html

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Hello!</title>
  </head>
  <body>
    <h1>Oops!</h1>
    <p>Sorry, I don't know what you're asking for.</p>
  </body>
</html>
```

示例 20-8: 任何 404 响应所返回错误页面内容样例

有了这些修改，再次运行服务器。请求 *127.0.0.1:7878* 应该会返回 *hello.html* 的内容，而对于任何其他请求，比如 *127.0.0.1:7878/foo*，应该会返回 *404.html* 中的错误 HTML！

### 1.6 少量代码重构

目前 `if` 和 `else` 块中的代码有很多的重复：他们都读取文件并将其内容写入流。唯一的区别是状态行和文件名。为了使代码更为简明，将这些区别分别提取到一行 `if` 和 `else` 中，对状态行和文件名变量赋值；然后在读取文件和写入响应的代码中无条件的使用这些变量。重构后取代了大段 `if` 和 `else` 块代码后的结果如示例 20-9 所示：

文件名: src/main.rs

```rust
// --snip--

fn handle_connection(mut stream: TcpStream) {
    // --snip--

    let (status_line, filename) = if buffer.starts_with(get) {
        ("HTTP/1.1 200 OK", "hello.html")
    } else {
        ("HTTP/1.1 404 NOT FOUND", "404.html")
    };

    let contents = fs::read_to_string(filename).unwrap();

    let response = format!(
        "{}\r\nContent-Length: {}\r\n\r\n{}",
        status_line,
        contents.len(),
        contents
    );

    stream.write(response.as_bytes()).unwrap();
    stream.flush().unwrap();
}
```

示例 20-9: 重构使得 `if` 和 `else` 块中只包含两个情况所不同的代码

现在 `if` 和 `else` 块所做的唯一的事就是在一个元组中返回合适的状态行和文件名的值；接着使用第 18 章讲到的使用模式的 `let` 语句通过解构元组的两部分为 `filename` 和 `header` 赋值。

之前读取文件和写入响应的冗余代码现在位于 `if` 和 `else` 块之外，并会使用变量 `status_line` 和 `filename`。这样更易于观察这两种情况真正有何不同，还意味着如果需要改变如何读取文件或写入响应时只需要更新一处的代码。示例 20-9 中代码的行为与示例 20-8 完全一样。

好极了！我们有了一个 40 行左右 Rust 代码的小而简单的服务器，它对一个请求返回页面内容而对所有其他请求返回 404 响应。

目前服务器运行于单线程中，它一次只能处理一个请求。让我们模拟一些慢请求来看看这如何会成为一个问题，并进行修复以便服务器可以一次处理多个请求。


## 2. 将单线程服务器变为多线程服务器

目前服务器会依次处理每一个请求，意味着它在完成第一个连接的处理之前不会处理第二个连接。如果服务器正接收越来越多的请求，这类串行操作会使性能越来越差。如果一个请求花费很长时间来处理，随后而来的请求则不得不等待这个长请求结束，即便这些新请求可以很快就处理完。我们需要修复这种情况，不过首先让我们实际尝试一下这个问题。

### 2.1 在当前服务器实现中模拟慢请求

让我们看看一个慢请求如何影响当前服务器实现中的其他请求。示例 20-10 通过模拟慢响应实现了 */sleep* 请求处理，它会使服务器在响应之前休眠五秒。

文件名: src/main.rs

```rust
use std::thread;
use std::time::Duration;
// --snip--

fn handle_connection(mut stream: TcpStream) {
    // --snip--

    let get = b"GET / HTTP/1.1\r\n";
    let sleep = b"GET /sleep HTTP/1.1\r\n";

    let (status_line, filename) = if buffer.starts_with(get) {
        ("HTTP/1.1 200 OK", "hello.html")
    } else if buffer.starts_with(sleep) {
        thread::sleep(Duration::from_secs(5));
        ("HTTP/1.1 200 OK", "hello.html")
    } else {
        ("HTTP/1.1 404 NOT FOUND", "404.html")
    };

    // --snip--
}
```

示例 20-10: 通过识别 */sleep* 并休眠五秒来模拟慢请求

这段代码有些凌乱，不过对于模拟的目的来说已经足够。这里创建了第二个请求 `sleep`，我们会识别其数据。在 `if` 块之后增加了一个 `else if` 来检查 */sleep* 请求，当接收到这个请求时，在渲染成功 HTML 页面之前会先休眠五秒。

现在就可以真切的看出我们的服务器有多么的原始：真实的库将会以更简洁的方式处理多请求识别问题！

使用 `cargo run` 启动 server，并接着打开两个浏览器窗口：一个请求 *http://127.0.0.1:7878/* 而另一个请求 *http://127.0.0.1:7878/sleep* 。如果像之前一样多次请求 */*，会发现响应的比较快速。不过如果请求 */sleep* 之后在请求 */*，就会看到 */* 会等待直到 `sleep` 休眠完五秒之后才出现。

这里有多种办法来改变我们的 Web 服务器使其避免所有请求都排在慢请求之后；我们将要实现的一个便是线程池。

### 2.2 使用线程池改善吞吐量

**线程池**（*thread pool*）是一组预先分配的等待或准备处理任务的线程。当程序收到一个新任务，线程池中的一个线程会被分配任务，这个线程会离开并处理任务。其余的线程则可用于处理在第一个线程处理任务的同时处理其他接收到的任务。当第一个线程处理完任务时，它会返回空闲线程池中等待处理新任务。线程池允许我们并发处理连接，增加服务器的吞吐量。

我们会将池中线程限制为较少的数量，以防拒绝服务（Denial of Service， DoS）攻击；如果程序为每一个接收的请求都新建一个线程，某人向服务器发起千万级的请求时会耗尽服务器的资源并导致所有请求的处理都被终止。

不同于分配无限的线程，线程池中将有固定数量的等待线程。当新进请求时，将请求发送到线程池中做处理。线程池会维护一个接收请求的队列。每一个线程会从队列中取出一个请求，处理请求，接着向对队列索取另一个请求。通过这种设计，则可以并发处理 `N` 个请求，其中 `N` 为线程数。如果每一个线程都在响应慢请求，之后的请求仍然会阻塞队列，不过相比之前增加了能处理的慢请求的数量。

这个设计仅仅是多种改善 Web 服务器吞吐量的方法之一。其他可供探索的方法有 fork/join 模型和单线程异步 I/O 模型。如果你对这个主题感兴趣，则可以阅读更多关于其他解决方案的内容并尝试用 Rust 实现他们；对于一个像 Rust 这样的底层语言，所有这些方法都是可能的。

在开始之前，让我们讨论一下线程池应用看起来怎样。当尝试设计代码时，首先编写客户端接口确实有助于指导代码设计。以期望的调用方式来构建 API 代码的结构，接着在这个结构之内实现功能，而不是先实现功能再设计公有 API。

类似于第 12 章项目中使用的测试驱动开发。这里将要使用编译器驱动开发（compiler-driven development）。我们将编写调用所期望的函数的代码，接着观察编译器错误告诉我们接下来需要修改什么使得代码可以工作。

#### 2.2.1 为每一个请求分配线程的代码结构

首先，让我们探索一下为每一个连接都创建一个线程的代码看起来如何。这并不是最终方案，因为正如之前讲到的它会潜在的分配无限的线程，不过这是一个开始。示例 20-11 展示了 `main` 的改变，它在 `for` 循环中为每一个流分配了一个新线程进行处理：

文件名: src/main.rs

```rust
fn main() {
    let listener = TcpListener::bind("127.0.0.1:7878").unwrap();

    for stream in listener.incoming() {
        let stream = stream.unwrap();

        thread::spawn(|| {
            handle_connection(stream);
        });
    }
}
```

示例 20-11: 为每一个流新建一个线程

正如第 16 章讲到的，`thread::spawn` 会创建一个新线程并在其中运行闭包中的代码。如果运行这段代码并在在浏览器中加载 */sleep*，接着在另两个浏览器标签页中加载 */*，确实会发现 */* 请求不必等待 */sleep* 结束。不过正如之前提到的，这最终会使系统崩溃因为我们无限制的创建新线程。

#### 2.2.2 为有限数量的线程创建一个类似的接口

我们期望线程池以类似且熟悉的方式工作，以便从线程切换到线程池并不会对使用该 API 的代码做出较大的修改。示例 20-12 展示我们希望用来替换 `thread::spawn` 的 `ThreadPool` 结构体的假想接口：

文件名: src/main.rs

```rust
fn main() {
    let listener = TcpListener::bind("127.0.0.1:7878").unwrap();
    let pool = ThreadPool::new(4);

    for stream in listener.incoming() {
        let stream = stream.unwrap();

        pool.execute(|| {
            handle_connection(stream);
        });
    }
}
```

示例 20-12: 假想的 `ThreadPool` 接口

这里使用 `ThreadPool::new` 来创建一个新的线程池，它有一个可配置的线程数的参数，在这里是四。这样在 `for` 循环中，`pool.execute` 有着类似 `thread::spawn` 的接口，它获取一个线程池运行于每一个流的闭包。`pool.execute` 需要实现为获取闭包并传递给池中的线程运行。这段代码还不能编译，不过通过尝试编译器会指导我们如何修复它。

#### 2.2.3 采用编译器驱动构建 `ThreadPool` 结构体

继续并对示例 20-12 中的 *src/main.rs* 做出修改，并利用来自 `cargo check` 的编译器错误来驱动开发。下面是我们得到的第一个错误：

```text
$ cargo check
   Compiling hello v0.1.0 (file:///projects/hello)
error[E0433]: failed to resolve. Use of undeclared type or module `ThreadPool`
  --> src\main.rs:10:16
   |
10 |     let pool = ThreadPool::new(4);
   |                ^^^^^^^^^^^^^^^ Use of undeclared type or module
   `ThreadPool`

error: aborting due to previous error
```

好的，这告诉我们需要一个 `ThreadPool` 类型或模块，所以我们将构建一个。`ThreadPool` 的实现会与 Web 服务器的特定工作相独立，所以让我们从 `hello` crate 切换到存放 `ThreadPool` 实现的新库 crate。这也意味着可以在任何工作中使用这个单独的线程池库，而不仅仅是处理网络请求。

创建 *src/lib.rs* 文件，它包含了目前可用的最简单的 `ThreadPool` 定义：

文件名: src/lib.rs

```rust
pub struct ThreadPool;
```

接着创建一个新目录，*src/bin*，并将二进制 crate 根文件从 *src/main.rs* 移动到 *src/bin/main.rs*。这使得库 crate 成为 *hello* 目录的主要 crate；不过仍然可以使用 `cargo run` 运行 *src/bin/main.rs* 二进制文件。移动了 *main.rs* 文件之后，修改 *src/bin/main.rs* 文件开头加入如下代码来引入库 crate 并将 `ThreadPool` 引入作用域：

文件名: src/bin/main.rs

```rust
use hello::ThreadPool;
```

这仍然不能工作，再次尝试运行来得到下一个需要解决的错误：

```text
$ cargo check
   Compiling hello v0.1.0 (file:///projects/hello)
error[E0599]: no function or associated item named `new` found for type
`hello::ThreadPool` in the current scope
 --> src/bin/main.rs:13:16
   |
13 |     let pool = ThreadPool::new(4);
   |                ^^^^^^^^^^^^^^^ function or associated item not found in
   `hello::ThreadPool`
```

这告诉我们下一步是为 `ThreadPool` 创建一个叫做 `new` 的关联函数。我们还知道 `new` 需要有一个参数可以接受 `4`，而且 `new` 应该返回 `ThreadPool` 实例。让我们实现拥有此特征的最小化 `new` 函数：

文件夹: src/lib.rs

```rust
pub struct ThreadPool;

impl ThreadPool {
    pub fn new(size: usize) -> ThreadPool {
        ThreadPool
    }
}
```

这里选择 `usize` 作为 `size` 参数的类型，因为我们知道为负的线程数没有意义。我们还知道将使用 4 作为线程集合的元素数量，这也就是使用 `usize` 类型的原因，如第 3 章 [“整数类型”](https://rustwiki.org/zh-CN/book/ch03-02-data-types.html#integer-types) 部分所讲。

再次编译检查这段代码：

```text
$ cargo check
   Compiling hello v0.1.0 (file:///projects/hello)
warning: unused variable: `size`
 --> src/lib.rs:4:16
  |
4 |     pub fn new(size: usize) -> ThreadPool {
  |                ^^^^
  |
  = note: #[warn(unused_variables)] on by default
  = note: to avoid this warning, consider using `_size` instead

error[E0599]: no method named `execute` found for type `hello::ThreadPool` in the current scope
  --> src/bin/main.rs:18:14
   |
18 |         pool.execute(|| {
   |              ^^^^^^^
```

现在有了一个警告和一个错误。暂时先忽略警告，发生错误是因为并没有 `ThreadPool` 上的 `execute` 方法。回忆 [“为有限数量的线程创建一个类似的接口”](https://rustwiki.org/zh-CN/book/ch20-02-multithreaded.html#creating-a-similar-interface-for-a-finite-number-of-threads) 部分我们决定线程池应该有与 `thread::spawn` 类似的接口，同时我们将实现 `execute` 函数来获取传递的闭包并将其传递给池中的空闲线程执行。

我们会在 `ThreadPool` 上定义 `execute` 函数来获取一个闭包参数。回忆第 13 章的 [“使用带有泛型和 `Fn` trait 的闭包”](https://rustwiki.org/zh-CN/book/ch13-01-closures.html#storing-closures-using-generic-parameters-and-the-fn-traits) 部分，闭包作为参数时可以使用三个不同的 trait：`Fn`、`FnMut` 和 `FnOnce`。我们需要决定这里应该使用哪种闭包。最终需要实现的类似于标准库的 `thread::spawn`，所以我们可以观察 `thread::spawn` 的签名在其参数中使用了何种 bound。查看文档会发现：

```rust
pub fn spawn<F, T>(f: F) -> JoinHandle<T>
    where
        F: FnOnce() -> T + Send + 'static,
        T: Send + 'static
```

`F` 是这里我们关心的参数；`T` 与返回值有关所以我们并不关心。考虑到 `spawn` 使用 `FnOnce` 作为 `F` 的 trait bound，这可能也是我们需要的，因为最终会将传递给 `execute` 的参数传给 `spawn`。因为处理请求的线程只会执行闭包一次，这也进一步确认了 `FnOnce` 是我们需要的 trait，这里符合 `FnOnce` 中 `Once` 的意思。

`F` 还有 trait bound `Send` 和生命周期绑定 `'static`，这对我们的情况也是有意义的：需要 `Send` 来将闭包从一个线程转移到另一个线程，而 `'static` 是因为并不知道线程会执行多久。让我们编写一个使用带有这些 bound 的泛型参数 `F` 的 `ThreadPool` 的 `execute` 方法：

文件名: src/lib.rs

```rust
impl ThreadPool {
    // --snip--

    pub fn execute<F>(&self, f: F)
        where
            F: FnOnce() + Send + 'static
    {

    }
}
```

`FnOnce` trait 仍然需要之后的 `()`，因为这里的 `FnOnce` 代表一个没有参数也没有返回值的闭包。正如函数的定义，返回值类型可以从签名中省略，不过即便没有参数也需要括号。

这里再一次增加了 `execute` 方法的最小化实现：它没有做任何工作，只是尝试让代码能够编译。再次进行检查：

```text
$ cargo check
   Compiling hello v0.1.0 (file:///projects/hello)
warning: unused variable: `size`
 --> src/lib.rs:4:16
  |
4 |     pub fn new(size: usize) -> ThreadPool {
  |                ^^^^
  |
  = note: #[warn(unused_variables)] on by default
  = note: to avoid this warning, consider using `_size` instead

warning: unused variable: `f`
 --> src/lib.rs:8:30
  |
8 |     pub fn execute<F>(&self, f: F)
  |                              ^
  |
  = note: to avoid this warning, consider using `_f` instead
```

现在就只有警告了！这意味着能够编译了！注意如果尝试 `cargo run` 运行程序并在浏览器中发起请求，仍会在浏览器中出现在本章开始时那样的错误。这个库实际上还没有调用传递给 `execute` 的闭包！

> 一个你可能听说过的关于像 Haskell 和 Rust 这样有严格编译器的语言的说法是 “如果代码能够编译，它就能工作”。这是一个提醒大家的好时机，实际上这并不是普适的。我们的项目可以编译，不过它完全没有做任何工作！如果构建一个真实且功能完整的项目，则需花费大量的时间来开始编写单元测试来检查代码能否编译 **并且** 拥有期望的行为。

#### 2.2.4 在 `new` 中验证池中线程数量

这里仍然存在警告是因为其并没有对 `new` 和 `execute` 的参数做任何操作。让我们用期望的行为来实现这些函数。以考虑 `new` 作为开始。之前选择使用无符号类型作为 `size` 参数的类型，因为线程数为负的线程池没有意义。然而，线程数为零的线程池同样没有意义，不过零是一个完全有效的 `u32` 值。让我们增加在返回 `ThreadPool` 实例之前检查 `size` 是否大于零的代码，并使用 `assert!` 宏在得到零时 panic，如示例 20-13 所示：

文件名: src/lib.rs

```rust
impl ThreadPool {
    /// 创建线程池。
    ///
    /// 线程池中线程的数量。
    ///
    /// # Panics
    ///
    /// `new` 函数在 size 为 0 时会 panic。
    pub fn new(size: usize) -> ThreadPool {
        assert!(size > 0);

        ThreadPool
    }

    // --snip--
}
```

示例 20-13: 实现 `ThreadPool::new` 在 `size` 为零时 panic

这里用文档注释为 `ThreadPool` 增加了一些文档。注意这里遵循了良好的文档实践并增加了一个部分来提示函数会 panic 的情况，正如第 14 章所讨论的。尝试运行 `cargo doc --open` 并点击 `ThreadPool` 结构体来查看生成的 `new` 的文档看起来如何！

相比像这里使用 `assert!` 宏，也可以让 `new` 像之前 I/O 项目中示例 12-9 中 `Config::new` 那样返回一个 `Result`，不过在这里我们选择创建一个没有任何线程的线程池应该是不可恢复的错误。如果你想做的更好，尝试编写一个采用如下签名的 `new` 版本来感受一下两者的区别：

```rust
pub fn new(size: usize) -> Result<ThreadPool, PoolCreationError> {
```

#### 2.2.5 分配空间以储存线程

现在有了一个有效的线程池线程数，就可以实际创建这些线程并在返回之前将他们储存在 `ThreadPool` 结构体中。不过如何 “储存” 一个线程？让我们再看看 `thread::spawn` 的签名：

```rust
pub fn spawn<F, T>(f: F) -> JoinHandle<T>
    where
        F: FnOnce() -> T + Send + 'static,
        T: Send + 'static
```

`spawn` 返回 `JoinHandle<T>`，其中 `T` 是闭包返回的类型。尝试使用 `JoinHandle` 来看看会发生什么。在我们的情况中，传递给线程池的闭包会处理连接并不返回任何值，所以 `T` 将会是单元类型 `()`。

示例 20-14 中的代码可以编译，不过实际上还并没有创建任何线程。我们改变了 `ThreadPool` 的定义来存放一个 `thread::JoinHandle<()>` 的 vector 实例，使用 `size` 容量来初始化，并设置一个 `for` 循环了来运行创建线程的代码，并返回包含这些线程的 `ThreadPool` 实例：

文件名: src/lib.rs

```rust
use std::thread;

pub struct ThreadPool {
    threads: Vec<thread::JoinHandle<()>>,
}

impl ThreadPool {
    // --snip--
    pub fn new(size: usize) -> ThreadPool {
        assert!(size > 0);

        let mut threads = Vec::with_capacity(size);

        for _ in 0..size {
            // create some threads and store them in the vector
        }

        ThreadPool {
            threads
        }
    }

    // --snip--
}
```

示例 20-14: 为 `ThreadPool` 创建一个 vector 来存放线程

这里将 `std::thread` 引入库 crate 的作用域，因为使用了 `thread::JoinHandle` 作为 `ThreadPool` 中 vector 元素的类型。

在得到了有效的数量之后，`ThreadPool` 新建一个存放 `size` 个元素的 vector。本书还未使用过 `with_capacity`，它与 `Vec::new` 做了同样的工作，不过有一个重要的区别：它为 vector 预先分配空间。因为已经知道了 vector 中需要 `size` 个元素，预先进行分配比仅仅 `Vec::new` 要稍微有效率一些，因为 `Vec::new` 随着插入元素而重新改变大小。

如果再次运行 `cargo check`，会看到一些警告，不过应该可以编译成功。

#### 2.2.6 `Worker` 结构体负责从 `ThreadPool` 中将代码传递给线程

示例 20-14 的 `for` 循环中留下了一个关于创建线程的注释。如何实际创建线程呢？这是一个难题。标准库提供的创建线程的方法，`thread::spawn`，它期望获取一些一旦创建线程就应该执行的代码。然而，我们希望开始线程并使其等待稍后传递的代码。标准库的线程实现并没有包含这么做的方法；我们必须自己实现。

我们将要实现的行为是创建线程并稍后发送代码，这会在 `ThreadPool` 和线程间引入一个新数据类型来管理这种新行为。这个数据结构称为 `Worker`：这是一个池实现中的常见概念。想象一下在餐馆厨房工作的员工：员工等待来自客户的订单，他们负责接受这些订单并完成它们。

不同于在线程池中储存一个 `JoinHandle<()>` 实例的 vector，我们会储存 `Worker` 结构体的实例。每一个 `Worker` 会储存一个单独的 `JoinHandle<()>` 实例。接着会在 `Worker` 上实现一个方法，它会获取需要运行代码的闭包并将其发送给已经运行的线程执行。我们还会为每个 worker 分配一个 `id`，以便于在日志或调试中区别线程池中的不同 worker。

首先，让我们做出如此创建 `ThreadPool` 时所需的修改。在通过如下方式设置完 `Worker` 之后，我们会实现向线程发送闭包的代码：

1. 定义 `Worker` 结构体存放 `id` 和 `JoinHandle<()>`
2. 修改 `ThreadPool` 存放一个 `Worker` 实例的 vector
3. 定义 `Worker::new` 函数，它获取一个 `id` 数字并返回一个带有 `id` 和用空闭包分配的线程的 `Worker` 实例
4. 在 `ThreadPool::new` 中，使用 `for` 循环计数生成 `id`，使用这个 `id` 新建 `Worker`，并储存进 vector 中

如果你渴望挑战，在查示例 20-15 中的代码之前尝试自己实现这些修改。

准备好了吗？示例 20-15 就是一个做出了这些修改的例子：

文件名: src/lib.rs

```rust
use std::thread;

pub struct ThreadPool {
    workers: Vec<Worker>,
}

impl ThreadPool {
    // --snip--
    pub fn new(size: usize) -> ThreadPool {
        assert!(size > 0);

        let mut workers = Vec::with_capacity(size);

        for id in 0..size {
            workers.push(Worker::new(id));
        }

        ThreadPool {
            workers
        }
    }
    // --snip--
}

struct Worker {
    id: usize,
    thread: thread::JoinHandle<()>,
}

impl Worker {
    fn new(id: usize) -> Worker {
        let thread = thread::spawn(|| {});

        Worker {
            id,
            thread,
        }
    }
}
```

示例 20-15: 修改 `ThreadPool` 存放 `Worker` 实例而不是直接存放线程

这里将 `ThreadPool` 中字段名从 `threads` 改为 `workers`，因为它现在储存 `Worker` 而不是 `JoinHandle<()>`。使用 `for` 循环中的计数作为 `Worker::new` 的参数，并将每一个新建的 `Worker` 储存在叫做 `workers` 的 vector 中。

`Worker` 结构体和其 `new` 函数是私有的，因为外部代码（比如 *src/bin/main.rs* 中的 server）并不需要知道关于 `ThreadPool` 中使用 `Worker` 结构体的实现细节。`Worker::new` 函数使用 `id` 参数并储存了使用一个空闭包创建的 `JoinHandle<()>`。

这段代码能够编译并用指定给 `ThreadPool::new` 的参数创建储存了一系列的 `Worker` 实例，不过 **仍然** 没有处理 `execute` 中得到的闭包。让我们聊聊接下来怎么做。

#### 2.2.7 使用通道向线程发送请求

下一个需要解决的问题是传递给 `thread::spawn` 的闭包完全没有做任何工作。目前，我们在 `execute` 方法中获得期望执行的闭包，不过在创建 `ThreadPool` 的过程中创建每一个 `Worker` 时需要向 `thread::spawn` 传递一个闭包。

我们希望刚创建的 `Worker` 结构体能够从 `ThreadPool` 的队列中获取需要执行的代码，并发送到线程中执行他们。

在第 16 章，我们学习了 **通道** —— 一个沟通两个线程的简单手段 —— 对于这个例子来说则是绝佳的。这里通道将充当任务队列的作用，`execute` 将通过 `ThreadPool` 向其中线程正在寻找工作的 `Worker` 实例发送任务。如下是这个计划：

1. `ThreadPool` 会创建一个通道并充当发送端。
2. 每个 `Worker` 将会充当通道的接收端。
3. 新建一个 `Job` 结构体来存放用于向通道中发送的闭包。
4. `execute` 方法会在通道发送端发出期望执行的任务。
5. 在线程中，`Worker` 会遍历通道的接收端并执行任何接收到的任务。

让我们以在 `ThreadPool::new` 中创建通道并让 `ThreadPool` 实例充当发送端开始，如示例 20-16 所示。`Job` 是将在通道中发出的类型，目前它是一个没有任何内容的结构体：

文件名: src/lib.rs

```rust
// --snip--
use std::sync::mpsc;

pub struct ThreadPool {
    workers: Vec<Worker>,
    sender: mpsc::Sender<Job>,
}

struct Job;

impl ThreadPool {
    // --snip--
    pub fn new(size: usize) -> ThreadPool {
        assert!(size > 0);

        let (sender, receiver) = mpsc::channel();

        let mut workers = Vec::with_capacity(size);

        for id in 0..size {
            workers.push(Worker::new(id));
        }

        ThreadPool {
            workers,
            sender,
        }
    }
    // --snip--
}
```

示例 20-16: 修改 `ThreadPool` 来储存一个发送 `Job` 实例的通道发送端

在 `ThreadPool::new` 中，新建了一个通道，并接着让线程池在接收端等待。这段代码能够编译，不过仍有警告。

让我们尝试在线程池创建每个 worker 时将通道的接收端传递给他们。须知我们希望在 worker 所分配的线程中使用通道的接收端，所以将在闭包中引用 `receiver` 参数。示例 20-17 中展示的代码还不能编译：

文件名: src/lib.rs

```rust
impl ThreadPool {
    // --snip--
    pub fn new(size: usize) -> ThreadPool {
        assert!(size > 0);

        let (sender, receiver) = mpsc::channel();

        let mut workers = Vec::with_capacity(size);

        for id in 0..size {
            workers.push(Worker::new(id, receiver));
        }

        ThreadPool {
            workers,
            sender,
        }
    }
    // --snip--
}

// --snip--

impl Worker {
    fn new(id: usize, receiver: mpsc::Receiver<Job>) -> Worker {
        let thread = thread::spawn(|| {
            receiver;
        });

        Worker {
            id,
            thread,
        }
    }
}
```

示例 20-17: 将通道的接收端传递给 worker

这是一些小而直观的修改：将通道的接收端传递进了 `Worker::new`，并接着在闭包中使用它。

如果尝试 check 代码，会得到这个错误：

```text
$ cargo check
   Compiling hello v0.1.0 (file:///projects/hello)
error[E0382]: use of moved value: `receiver`
  --> src/lib.rs:27:42
   |
27 |             workers.push(Worker::new(id, receiver));
   |                                          ^^^^^^^^ value moved here in
   previous iteration of loop
   |
   = note: move occurs because `receiver` has type
   `std::sync::mpsc::Receiver<Job>`, which does not implement the `Copy` trait
```

这段代码尝试将 `receiver` 传递给多个 `Worker` 实例。这是不行的，回忆第 16 章：Rust 所提供的通道实现是多 **生产者**，单 **消费者** 的。这意味着不能简单的克隆通道的消费端来解决问题。即便可以，那也不是我们希望使用的技术；我们希望通过在所有的 worker 中共享单一 `receiver`，在线程间分发任务。

另外，从通道队列中取出任务涉及到修改 `receiver`，所以这些线程需要一个能安全的共享和修改 `receiver` 的方式，否则可能导致竞争状态（参考第 16 章）。

回忆一下第 16 章讨论的线程安全智能指针，为了在多个线程间共享所有权并允许线程修改其值，需要使用 `Arc<Mutex<T>>`。`Arc` 使得多个 worker 拥有接收端，而 `Mutex` 则确保一次只有一个 worker 能从接收端得到任务。示例 20-18 展示了所需的修改：

文件名: src/lib.rs

```rust
use std::sync::Arc;
use std::sync::Mutex;
// --snip--

impl ThreadPool {
    // --snip--
    pub fn new(size: usize) -> ThreadPool {
        assert!(size > 0);

        let (sender, receiver) = mpsc::channel();

        let receiver = Arc::new(Mutex::new(receiver));

        let mut workers = Vec::with_capacity(size);

        for id in 0..size {
            workers.push(Worker::new(id, Arc::clone(&receiver)));
        }

        ThreadPool {
            workers,
            sender,
        }
    }

    // --snip--
}

impl Worker {
    fn new(id: usize, receiver: Arc<Mutex<mpsc::Receiver<Job>>>) -> Worker {
        // --snip--
    }
}
```

示例 20-18: 使用 `Arc` 和 `Mutex` 在 worker 间共享通道的接收端

在 `ThreadPool::new` 中，将通道的接收端放入一个 `Arc` 和一个 `Mutex` 中。对于每一个新 worker，克隆 `Arc` 来增加引用计数，如此这些 worker 就可以共享接收端的所有权了。

通过这些修改，代码可以编译了！我们做到了！

#### 2.2.8 实现 `execute` 方法

最后让我们实现 `ThreadPool` 上的 `execute` 方法。同时也要修改 `Job` 结构体：它将不再是结构体，`Job` 将是一个有着 `execute` 接收到的闭包类型的 trait 对象的类型别名。第 19 章 [“类型别名用来创建类型同义词”](https://rustwiki.org/zh-CN/book/ch19-04-advanced-types.html#creating-type-synonyms-with-type-aliases) 部分提到过，类型别名允许将长的类型变短。观察示例 20-19：

文件名: src/lib.rs

```rust
// --snip--

type Job = Box<dyn FnOnce() + Send + 'static>;

impl ThreadPool {
    // --snip--

    pub fn execute<F>(&self, f: F)
        where
            F: FnOnce() + Send + 'static
    {
        let job = Box::new(f);

        self.sender.send(job).unwrap();
    }
}

// --snip--
```

示例 20-19: 为存放每一个闭包的 `Box` 创建一个 `Job` 类型别名，接着在通道中发出任务

在使用 `execute` 得到的闭包新建 `Job` 实例之后，将这些任务从通道的发送端发出。这里调用 `send` 上的 `unwrap`，因为发送可能会失败，这可能发生于例如停止了所有线程执行的情况，这意味着接收端停止接收新消息了。不过目前我们无法停止线程执行；只要线程池存在他们就会一直执行。使用 `unwrap` 是因为我们知道失败不可能发生，即便编译器不这么认为。

不过到此事情还没有结束！在 worker 中，传递给 `thread::spawn` 的闭包仍然还只是 **引用** 了通道的接收端。相反我们需要闭包一直循环，向通道的接收端请求任务，并在得到任务时执行他们。如示例 20-20 对 `Worker::new` 做出修改：

文件名: src/lib.rs

```rust
// --snip--

impl Worker {
    fn new(id: usize, receiver: Arc<Mutex<mpsc::Receiver<Job>>>) -> Worker {
        let thread = thread::spawn(move || {
            loop {
                let job = receiver.lock().unwrap().recv().unwrap();

                println!("Worker {} got a job; executing.", id);

                job();
            }
        });

        Worker {
            id,
            thread,
        }
    }
}
```

示例 20-20: 在 worker 线程中接收并执行任务

这里，首先在 `receiver` 上调用了 `lock` 来获取互斥器，接着 `unwrap` 在出现任何错误时 panic。如果互斥器处于一种叫做 **被污染**（*poisoned*）的状态时获取锁可能会失败，这可能发生于其他线程在持有锁时 panic 了且没有释放锁。在这种情况下，调用 `unwrap` 使其 panic 是正确的行为。请随意将 `unwrap` 改为包含有意义错误信息的 `expect`。

如果锁定了互斥器，接着调用 `recv` 从通道中接收 `Job`。最后的 `unwrap` 也绕过了一些错误，这可能发生于持有通道发送端的线程停止的情况，类似于如果接收端关闭时 `send` 方法如何返回 `Err` 一样。

调用 `recv` 会阻塞当前线程，所以如果还没有任务，其会等待直到有可用的任务。`Mutex<T>` 确保一次只有一个 `Worker` 线程尝试请求任务。

通过这个技巧，线程池处于可以运行的状态了！执行 `cargo run` 并发起一些请求：

```text
$ cargo run
   Compiling hello v0.1.0 (file:///projects/hello)
warning: field is never used: `workers`
 --> src/lib.rs:7:5
  |
7 |     workers: Vec<Worker>,
  |     ^^^^^^^^^^^^^^^^^^^^
  |
  = note: #[warn(dead_code)] on by default

warning: field is never used: `id`
  --> src/lib.rs:61:5
   |
61 |     id: usize,
   |     ^^^^^^^^^
   |
   = note: #[warn(dead_code)] on by default

warning: field is never used: `thread`
  --> src/lib.rs:62:5
   |
62 |     thread: thread::JoinHandle<()>,
   |     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
   |
   = note: #[warn(dead_code)] on by default

    Finished dev [unoptimized + debuginfo] target(s) in 0.99 secs
     Running `target/debug/hello`
Worker 0 got a job; executing.
Worker 2 got a job; executing.
Worker 1 got a job; executing.
Worker 3 got a job; executing.
Worker 0 got a job; executing.
Worker 2 got a job; executing.
Worker 1 got a job; executing.
Worker 3 got a job; executing.
Worker 0 got a job; executing.
Worker 2 got a job; executing.
```

成功了！现在我们有了一个可以异步执行连接的线程池！它绝不会创建超过四个线程，所以当服务器收到大量请求时系统也不会负担过重。如果请求 */sleep*，server 也能够通过另外一个线程处理其他请求。

> 注意如果同时在多个浏览器窗口打开 */sleep*，它们可能会彼此间隔地加载 5 秒，因为一些浏览器处于缓存的原因会顺序执行相同请求的多个实例。这些限制并不是由于我们的 Web 服务器造成的。

在学习了第 18 章的 `while let` 循环之后，你可能会好奇为何不能如此编写 worker 线程，如示例 20-21 所示：

文件名: src/lib.rs

```rust
// --snip--

impl Worker {
    fn new(id: usize, receiver: Arc<Mutex<mpsc::Receiver<Job>>>) -> Worker {
        let thread = thread::spawn(move || {
            while let Ok(job) = receiver.lock().unwrap().recv() {
                println!("Worker {} got a job; executing.", id);

                job();
            }
        });

        Worker {
            id,
            thread,
        }
    }
}
```

示例 20-21: 一个使用 `while let` 的 `Worker::new` 替代实现

这段代码可以编译和运行，但是并不会产生所期望的线程行为：一个慢请求仍然会导致其他请求等待执行。其原因有些微妙：`Mutex` 结构体没有公有 `unlock` 方法，因为锁的所有权依赖 `lock` 方法返回的 `LockResult<MutexGuard<T>>` 中 `MutexGuard<T>` 的生命周期。这允许借用检查器在编译时确保绝不会在没有持有锁的情况下访问由 `Mutex` 守护的资源，不过如果没有认真的思考 `MutexGuard<T>` 的生命周期的话，也可能会导致比预期更久的持有锁。因为 `while` 表达式中的值在整个块一直处于作用域中，`job()` 调用的过程中其仍然持有锁，这意味着其他 worker 不能接收任务。

相反通过使用 `loop` 并在循环块之内而不是之外获取锁和任务，`lock` 方法返回的 `MutexGuard` 在 `let job` 语句结束之后立刻就被丢弃了。这确保了 `recv` 调用过程中持有锁，而在 `job()` 调用前锁就被释放了，这就允许并发处理多个请求了。

## 3. 优雅停机与清理

示例 20-21 中的代码如期通过使用线程池异步的响应请求。这里有一些警告说 `workers`、`id` 和 `thread` 字段没有直接被使用，这提醒了我们并没有清理所有的内容。当使用不那么优雅的 ctrl-c 终止主线程时，所有其他线程也会立刻停止，即便它们正处于处理请求的过程中。

现在我们要为 `ThreadPool` 实现 `Drop` trait 对线程池中的每一个线程调用 `join`，这样这些线程将会执行完他们的请求。接着会为 `ThreadPool` 实现一个告诉线程他们应该停止接收新请求并结束的方式。为了实践这些代码，修改 server 在优雅停机（graceful shutdown）之前只接受两个请求。

### 3.1 为 `ThreadPool` 实现 `Drop` Trait

现在开始为线程池实现 `Drop`。当线程池被丢弃时，应该 join 所有线程以确保他们完成其操作。示例 20-23 展示了 `Drop` 实现的第一次尝试；这些代码还不能够编译：

文件名: src/lib.rs

```rust
impl Drop for ThreadPool {
    fn drop(&mut self) {
        for worker in &mut self.workers {
            println!("Shutting down worker {}", worker.id);

            worker.thread.join().unwrap();
        }
    }
}
```

示例 20-23: 当线程池离开作用域时 join 每个线程

这里首先遍历线程池中的每个 `workers`。这里使用了 `&mut` 因为 `self` 本身是一个可变引用而且也需要能够修改 `worker`。对于每一个线程，会打印出说明信息表明此特定 worker 正在关闭，接着在 worker 线程上调用 `join`。如果 `join` 调用失败，通过 `unwrap` 使得 panic 并进行不优雅的关闭。

如下是尝试编译代码时得到的错误：

```text
error[E0507]: cannot move out of borrowed content
  --> src/lib.rs:65:13
   |
65 |             worker.thread.join().unwrap();
   |             ^^^^^^ cannot move out of borrowed content
```

这告诉我们并不能调用 `join`，因为只有每一个 `worker` 的可变借用，而 `join` 获取其参数的所有权。为了解决这个问题，需要一个方法将 `thread` 移动出拥有其所有权的 `Worker` 实例以便 `join` 可以消费这个线程。示例 17-15 中我们曾见过这么做的方法：如果 `Worker` 存放的是 `Option<thread::JoinHandle<()>`，就可以在 `Option` 上调用 `take` 方法将值从 `Some` 成员中移动出来而对 `None` 成员不做处理。换句话说，正在运行的 `Worker` 的 `thread` 将是 `Some` 成员值，而当需要清理 worker 时，将 `Some` 替换为 `None`，这样 worker 就没有可以运行的线程了。

为此需要更新 `Worker` 的定义为如下：

文件名: src/lib.rs

```rust
struct Worker {
    id: usize,
    thread: Option<thread::JoinHandle<()>>,
}
```

现在依靠编译器来找出其他需要修改的地方。check 代码会得到两个错误：

```text
error[E0599]: no method named `join` found for type
`std::option::Option<std::thread::JoinHandle<()>>` in the current scope
  --> src/lib.rs:65:27
   |
65 |             worker.thread.join().unwrap();
   |                           ^^^^

error[E0308]: mismatched types
  --> src/lib.rs:89:13
   |
89 |             thread,
   |             ^^^^^^
   |             |
   |             expected enum `std::option::Option`, found struct
   `std::thread::JoinHandle`
   |             help: try using a variant of the expected type: `Some(thread)`
   |
   = note: expected type `std::option::Option<std::thread::JoinHandle<()>>`
              found type `std::thread::JoinHandle<_>`
```

让我们修复第二个错误，它指向 `Worker::new` 结尾的代码；当新建 `Worker` 时需要将 `thread` 值封装进 `Some`。做出如下改变以修复问题：

文件名: src/lib.rs

```rust
impl Worker {
    fn new(id: usize, receiver: Arc<Mutex<mpsc::Receiver<Job>>>) -> Worker {
        // --snip--

        Worker {
            id,
            thread: Some(thread),
        }
    }
}
```

第一个错误位于 `Drop` 实现中。之前提到过要调用 `Option` 上的 `take` 将 `thread` 移动出 `worker`。如下改变会修复问题：

文件名: src/lib.rs

```rust
impl Drop for ThreadPool {
    fn drop(&mut self) {
        for worker in &mut self.workers {
            println!("Shutting down worker {}", worker.id);

            if let Some(thread) = worker.thread.take() {
                thread.join().unwrap();
            }
        }
    }
}
```

如第 17 章我们见过的，`Option` 上的 `take` 方法会取出 `Some` 而留下 `None`。使用 `if let` 解构 `Some` 并得到线程，接着在线程上调用 `join`。如果 worker 的线程已然是 `None`，就知道此时这个 worker 已经清理了其线程所以无需做任何操作。

### 3.2 向线程发送信号使其停止接收任务

有了所有这些修改，代码就能编译且没有任何警告。不过也有坏消息，这些代码还不能以我们期望的方式运行。问题的关键在于 `Worker` 中分配的线程所运行的闭包中的逻辑：调用 `join` 并不会关闭线程，因为他们一直 `loop` 来寻找任务。如果采用这个实现来尝试丢弃 `ThreadPool` ，则主线程会永远阻塞在等待第一个线程结束上。

为了修复这个问题，修改线程既监听是否有 `Job` 运行也要监听一个应该停止监听并退出无限循环的信号。所以通道将发送这个枚举的两个成员之一而不是 `Job` 实例：

文件名: src/lib.rs

```rust
enum Message {
    NewJob(Job),
    Terminate,
}
```

`Message` 枚举要么是存放了线程需要运行的 `Job` 的 `NewJob` 成员，要么是会导致线程退出循环并终止的 `Terminate` 成员。

同时需要修改通道来使用 `Message` 类型值而不是 `Job`，如示例 20-24 所示：

文件名: src/lib.rs

```rust
pub struct ThreadPool {
    workers: Vec<Worker>,
    sender: mpsc::Sender<Message>,
}

// --snip--

impl ThreadPool {
    // --snip--

    pub fn execute<F>(&self, f: F)
        where
            F: FnOnce() + Send + 'static
    {
        let job = Box::new(f);

        self.sender.send(Message::NewJob(job)).unwrap();
    }
}

// --snip--

impl Worker {
    fn new(id: usize, receiver: Arc<Mutex<mpsc::Receiver<Message>>>) ->
        Worker {

        let thread = thread::spawn(move ||{
            loop {
                let message = receiver.lock().unwrap().recv().unwrap();

                match message {
                    Message::NewJob(job) => {
                        println!("Worker {} got a job; executing.", id);

                        job();
                    },
                    Message::Terminate => {
                        println!("Worker {} was told to terminate.", id);

                        break;
                    },
                }
            }
        });

        Worker {
            id,
            thread: Some(thread),
        }
    }
}
```

示例 20-24: 收发 `Message` 值并在 `Worker` 收到 `Message::Terminate` 时退出循环

为了适用 `Message` 枚举需要将两个地方的 `Job` 修改为 `Message`：`ThreadPool` 的定义和 `Worker::new` 的签名。`ThreadPool` 的 `execute` 方法需要发送封装进 `Message::NewJob` 成员的任务。然后，在 `Worker::new` 中当从通道接收 `Message` 时，当获取到 `NewJob`成员会处理任务而收到 `Terminate` 成员则会退出循环。

通过这些修改，代码再次能够编译并继续按照示例 20-21 之后相同的行为运行。不过还是会得到一个警告，因为并没有创建任何 `Terminate` 成员的消息。如示例 20-25 所示修改 `Drop` 实现来修复此问题：

文件名: src/lib.rs

```rust
impl Drop for ThreadPool {
    fn drop(&mut self) {
        println!("Sending terminate message to all workers.");

        for _ in &mut self.workers {
            self.sender.send(Message::Terminate).unwrap();
        }

        println!("Shutting down all workers.");

        for worker in &mut self.workers {
            println!("Shutting down worker {}", worker.id);

            if let Some(thread) = worker.thread.take() {
                thread.join().unwrap();
            }
        }
    }
}
```

示例 20-25：在对每个 worker 线程调用 `join` 之前向 worker 发送 `Message::Terminate`

现在遍历了 worker 两次，一次向每个 worker 发送一个 `Terminate` 消息，一个调用每个 worker 线程上的 `join`。如果尝试在同一循环中发送消息并立即 join 线程，则无法保证当前迭代的 worker 是从通道收到终止消息的 worker。

为了更好的理解为什么需要两个分开的循环，想象一下只有两个 worker 的场景。如果在一个单独的循环中遍历每个 worker，在第一次迭代中向通道发出终止消息并对第一个 worker 线程调用 `join`。如果此时第一个 worker 正忙于处理请求，那么第二个 worker 会收到终止消息并停止。我们会一直等待第一个 worker 结束，不过它永远也不会结束因为第二个线程接收了终止消息。死锁！

为了避免此情况，首先在一个循环中向通道发出所有的 `Terminate` 消息，接着在另一个循环中 join 所有的线程。每个 worker 一旦收到终止消息即会停止从通道接收消息，意味着可以确保如果发送同 worker 数相同的终止消息，在 join 之前每个线程都会收到一个终止消息。

为了实践这些代码，如示例 20-26 所示修改 `main` 在优雅停机 server 之前只接受两个请求：

文件名: src/bin/main.rs

```rust
fn main() {
    let listener = TcpListener::bind("127.0.0.1:7878").unwrap();
    let pool = ThreadPool::new(4);

    for stream in listener.incoming().take(2) {
        let stream = stream.unwrap();

        pool.execute(|| {
            handle_connection(stream);
        });
    }

    println!("Shutting down.");
}
```

示例 20-26: 在处理两个请求之后通过退出循环来停止 server

你不会希望真实世界的 web server 只处理两次请求就停机了，这只是为了展示优雅停机和清理处于正常工作状态。

`take` 方法定义于 `Iterator` trait，这里限制循环最多头 2 次。`ThreadPool` 会在 `main` 的结尾离开作用域，而且还会看到 `drop` 实现的运行。

使用 `cargo run` 启动 server，并发起三个请求。第三个请求应该会失败，而终端的输出应该看起来像这样：

```text
$ cargo run
   Compiling hello v0.1.0 (file:///projects/hello)
    Finished dev [unoptimized + debuginfo] target(s) in 1.0 secs
     Running `target/debug/hello`
Worker 0 got a job; executing.
Worker 3 got a job; executing.
Shutting down.
Sending terminate message to all workers.
Shutting down all workers.
Shutting down worker 0
Worker 1 was told to terminate.
Worker 2 was told to terminate.
Worker 0 was told to terminate.
Worker 3 was told to terminate.
Shutting down worker 1
Shutting down worker 2
Shutting down worker 3
```

可能会出现不同顺序的 worker 和信息输出。可以从信息中看到服务是如何运行的： worker 0 和 worker 3 获取了头两个请求，接着在第三个请求时，我们停止接收连接。当 `ThreadPool` 在 `main` 的结尾离开作用域时，其 `Drop` 实现开始工作，线程池通知所有线程终止。每个 worker 在收到终止消息时会打印出一个信息，接着线程池调用 `join` 来终止每一个 worker 线程。

这个特定的运行过程中一个有趣的地方在于：注意我们向通道中发出终止消息，而在任何线程收到消息之前，就尝试 join worker 0 了。worker 0 还没有收到终止消息，所以主线程阻塞直到 worker 0 结束。与此同时，每一个线程都收到了终止消息。一旦 worker 0 结束，主线程就等待其他 worker 结束，此时他们都已经收到终止消息并能够停止了。

恭喜！现在我们完成了这个项目，也有了一个使用线程池异步响应请求的基础 web server。我们能对 server 执行优雅停机，它会清理线程池中的所有线程。

如下是完整的代码参考：

文件名: src/bin/main.rs

```rust
use hello::ThreadPool;

use std::io::prelude::*;
use std::net::TcpListener;
use std::net::TcpStream;
use std::fs;
use std::thread;
use std::time::Duration;

fn main() {
    let listener = TcpListener::bind("127.0.0.1:7878").unwrap();
    let pool = ThreadPool::new(4);

    for stream in listener.incoming().take(2) {
        let stream = stream.unwrap();

        pool.execute(|| {
            handle_connection(stream);
        });
    }

    println!("Shutting down.");
}

fn handle_connection(mut stream: TcpStream) {
    let mut buffer = [0; 1024];
    stream.read(&mut buffer).unwrap();

    let get = b"GET / HTTP/1.1\r\n";
    let sleep = b"GET /sleep HTTP/1.1\r\n";

    let (status_line, filename) = if buffer.starts_with(get) {
        ("HTTP/1.1 200 OK\r\n\r\n", "hello.html")
    } else if buffer.starts_with(sleep) {
        thread::sleep(Duration::from_secs(5));
        ("HTTP/1.1 200 OK\r\n\r\n", "hello.html")
    } else {
        ("HTTP/1.1 404 NOT FOUND\r\n\r\n", "404.html")
    };

    let contents = fs::read_to_string(filename).unwrap();

    let response = format!("{}{}", status_line, contents);

    stream.write(response.as_bytes()).unwrap();
    stream.flush().unwrap();
}
```

文件名: src/lib.rs

```rust
use std::thread;
use std::sync::mpsc;
use std::sync::Arc;
use std::sync::Mutex;

enum Message {
    NewJob(Job),
    Terminate,
}

pub struct ThreadPool {
    workers: Vec<Worker>,
    sender: mpsc::Sender<Message>,
}

type Job = Box<dyn FnOnce() + Send + 'static>;

impl ThreadPool {
    /// 创建线程池。
    ///
    /// 线程池中线程的数量。
    ///
    /// # Panics
    ///
    /// `new` 函数在 size 为 0 时会 panic。
    pub fn new(size: usize) -> ThreadPool {
        assert!(size > 0);

        let (sender, receiver) = mpsc::channel();

        let receiver = Arc::new(Mutex::new(receiver));

        let mut workers = Vec::with_capacity(size);

        for id in 0..size {
            workers.push(Worker::new(id, Arc::clone(&receiver)));
        }

        ThreadPool {
            workers,
            sender,
        }
    }

    pub fn execute<F>(&self, f: F)
        where
            F: FnOnce() + Send + 'static
    {
        let job = Box::new(f);

        self.sender.send(Message::NewJob(job)).unwrap();
    }
}

impl Drop for ThreadPool {
    fn drop(&mut self) {
        println!("Sending terminate message to all workers.");

        for _ in &mut self.workers {
            self.sender.send(Message::Terminate).unwrap();
        }

        println!("Shutting down all workers.");

        for worker in &mut self.workers {
            println!("Shutting down worker {}", worker.id);

            if let Some(thread) = worker.thread.take() {
                thread.join().unwrap();
            }
        }
    }
}

struct Worker {
    id: usize,
    thread: Option<thread::JoinHandle<()>>,
}

impl Worker {
    fn new(id: usize, receiver: Arc<Mutex<mpsc::Receiver<Message>>>) ->
        Worker {

        let thread = thread::spawn(move ||{
            loop {
                let message = receiver.lock().unwrap().recv().unwrap();

                match message {
                    Message::NewJob(job) => {
                        println!("Worker {} got a job; executing.", id);

                        job();
                    },
                    Message::Terminate => {
                        println!("Worker {} was told to terminate.", id);

                        break;
                    },
                }
            }
        });

        Worker {
            id,
            thread: Some(thread),
        }
    }
}
```

这里还有很多可以做的事！如果你希望继续增强这个项目，如下是一些点子：

- 为 `ThreadPool` 和其公有方法增加更多文档
- 为库的功能增加测试
- 将 `unwrap` 调用改为更健壮的错误处理
- 使用 `ThreadPool` 进行其他不同于处理网络请求的任务
- 在 [crates.io](https://crates.io/) 上寻找一个线程池 crate 并使用它实现一个类似的 web server，将其 API 和鲁棒性与我们的实现做对比

## 4. 总结

好极了！你结束了本书的学习！由衷感谢你同我们一道加入这次 Rust 之旅。现在你已经准备好出发并实现自己的 Rust 项目并帮助他人了。请不要忘记我们的社区，这里有其他 Rustaceans 正乐于帮助你迎接 Rust 之路上的任何挑战。