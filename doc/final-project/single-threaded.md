## 构建单线程Web服务器

我们将从让单线程Web服务器工作开始。在我们开始之前，让我们快速了解一下构建Web服务器所涉及的协议。这些协议的细节超出了本文档网站的范围，但简要概述将为你提供所需的信息。

Web服务器中涉及的两个主要协议是超文本传输协议（`HTTP`）和传输控制协议（`TCP`）。这两个协议都是请求-响应协议，意味着客户端发起请求，服务器监听请求并向客户端提供响应。这些请求和响应的内容由协议定义。

`TCP`是较低级别的协议，它描述了信息如何从一个服务器传输到另一个服务器的细节，但不指定该信息是什么。`HTTP`通过定义请求和响应的内容在`TCP`之上构建。技术上可以将`HTTP`与其他协议一起使用，但在绝大多数情况下，`HTTP`通过`TCP`发送其数据。我们将处理`TCP`和`HTTP`请求和响应的原始字节。

### 监听TCP连接

我们的Web服务器需要监听`TCP`连接，所以这是我们要处理的第一部分。标准库提供了一个`std::net`模块，让我们可以做到这一点。让我们以通常的方式创建一个新项目：

```rust
$ cargo new hello
     Created binary (application) `hello` project
$ cd hello
```

现在在`src/main.rs`中输入示例21-1中的代码开始。此代码将在本地地址`127.0.0.1:7878`监听传入的`TCP`流。当它获得传入流时，它将打印`Connection established!`。

文件名：src/main.rs：

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

示例21-1：监听传入流并在接收到流时打印消息

使用`TcpListener`，我们可以在地址`127.0.0.1:7878`监听`TCP`连接。在地址中，冒号前的部分是表示你的计算机的IP地址（这在每台计算机上都是相同的，并不特指作者的计算机），`7878`是端口。我们选择这个端口有两个原因：`HTTP`通常不在此端口上接受，因此我们的服务器不太可能与你机器上可能运行的任何其他Web服务器冲突，并且`7878`在电话上拼写为rust。

在这种情况下，`bind`函数的工作方式类似于`new`函数，它将返回一个新的`TcpListener`实例。该函数被称为`bind`，因为在网络中，连接到端口进行监听被称为"绑定到端口"。

`bind`函数返回一个`Result<T, E>`，这表明绑定可能失败。例如，连接到端口80需要管理员权限（非管理员只能监听高于1023的端口），所以如果我们尝试在不是管理员的情况下连接到端口80，绑定就不会工作。例如，如果我们运行程序的两个实例，因此有两个程序监听同一个端口，绑定也不会工作。因为我们正在编写一个基本服务器只是为了学习目的，我们不会担心处理这些类型的错误；相反，我们使用`unwrap`在发生错误时停止程序。

`TcpListener`上的`incoming`方法返回一个迭代器，该迭代器为我们提供了一系列流（更具体地说，是`TcpStream`类型的流）。单个流表示客户端和服务器之间的开放连接。连接是客户端连接到服务器、服务器生成响应以及服务器关闭连接的完整请求和响应过程的名称。因此，我们将从`TcpStream`读取以查看客户端发送了什么，然后将我们的响应写入流以将数据发送回客户端。总的来说，这个`for`循环将依次处理每个连接并为我们产生一系列流来处理。

现在，我们对流的处理包括调用`unwrap`以在流有任何错误时终止我们的程序；如果没有任何错误，程序打印一条消息。我们将在下一个示例中为成功情况添加更多功能。当客户端连接到服务器时我们可能从`incoming`方法接收错误的原因是我们实际上没有迭代连接。相反，我们正在迭代连接尝试。连接可能由于许多原因而不成功，其中许多是操作系统特定的。例如，许多操作系统对它们可以支持的同时打开连接数有限制；超出该数字的新连接尝试将产生错误，直到一些打开的连接被关闭。

让我们尝试运行这段代码！在终端中调用`cargo run`，然后在Web浏览器中加载`127.0.0.1:7878`。浏览器应该显示一个错误消息，如"Connection reset"，因为服务器当前没有发送回任何数据。但是当你查看你的终端时，你应该看到当浏览器连接到服务器时打印的几条消息！

```rust
     Running `target/debug/hello`
Connection established!
Connection established!
Connection established!
```

有时你会看到为一个浏览器请求打印多条消息；原因可能是浏览器正在为页面发出请求以及为其他资源（如出现在浏览器标签中的`favicon.ico`图标）发出请求。

也可能是浏览器试图多次连接到服务器，因为服务器没有响应任何数据。当`stream`超出作用域并在循环结束时被丢弃时，连接作为`drop`实现的一部分被关闭。浏览器有时通过重试来处理关闭的连接，因为问题可能是暂时的。

浏览器有时也会在不发送任何请求的情况下打开到服务器的多个连接，这样如果它们稍后确实发送请求，它们可以更快地发生。当这种情况发生时，我们的服务器将看到每个连接，无论该连接上是否有任何请求。例如，许多基于Chrome的浏览器版本都会这样做；你可以通过使用私人浏览模式或使用不同的浏览器来禁用该优化。

重要的因素是我们已经成功获得了`TCP`连接的句柄！

记住在你完成运行特定版本的代码时按`ctrl-c`停止程序。然后在你进行每组代码更改后通过调用`cargo run`命令重新启动程序，以确保你运行的是最新代码。

### 读取请求

让我们实现从浏览器读取请求的功能！为了分离首先获得连接然后对连接采取某些操作的关注点，我们将为处理连接启动一个新函数。在这个新的`handle_connection`函数中，我们将从`TCP`流读取数据并打印它，以便我们可以看到从浏览器发送的数据。将代码更改为如示例21-2所示。

文件名：src/main.rs：

```rust
use std::{
    io::{BufReader, prelude::*},
    net::{TcpListener, TcpStream},
};

fn main() {
    let listener = TcpListener::bind("127.0.0.1:7878").unwrap();

    for stream in listener.incoming() {
        let stream = stream.unwrap();

        handle_connection(stream);
    }
}

fn handle_connection(mut stream: TcpStream) {
    let buf_reader = BufReader::new(&stream);
    let http_request: Vec<_> = buf_reader
        .lines()
        .map(|result| result.unwrap())
        .take_while(|line| !line.is_empty())
        .collect();

    println!("Request: {http_request:#?}");
}
```

示例21-2：从`TcpStream`读取并打印数据

我们将`std::io::prelude`和`std::io::BufReader`引入作用域，以获取允许我们从流读取和写入的`trait`和类型。在`main`函数的`for`循环中，我们现在调用新的`handle_connection`函数并将流传递给它，而不是打印说我们建立了连接的消息。

在`handle_connection`函数中，我们创建一个新的`BufReader`实例，它包装对流的引用。`BufReader`通过为我们管理对`std::io::Read` trait方法的调用来添加缓冲。

我们创建一个名为`http_request`的变量来收集浏览器发送到我们服务器的请求行。我们通过添加`Vec<_>`类型注释来表示我们想要将这些行收集到向量中。

`BufReader`实现了`std::io::BufRead` trait，它提供了`lines`方法。`lines`方法通过在看到换行字节时拆分数据流返回`Result<String, std::io::Error>`的迭代器。要获得每个`String`，我们映射并解包每个`Result`。如果数据不是有效的UTF-8或从流读取时出现问题，`Result`可能是错误。同样，生产程序应该更优雅地处理这些错误，但我们选择在错误情况下停止程序以简化。

浏览器通过连续发送两个换行符来表示`HTTP`请求的结束，所以要从流中获得一个请求，我们获取行直到我们得到一个空字符串的行。一旦我们将行收集到向量中，我们使用漂亮的调试格式打印它们，以便我们可以查看Web浏览器发送到我们服务器的指令。

让我们尝试这段代码！启动程序并再次在Web浏览器中发出请求。请注意，我们仍然会在浏览器中得到一个错误页面，但我们程序在终端中的输出现在看起来类似于这样：

```rust
$ cargo run
   Compiling hello v0.1.0 (file:///projects/hello)
    Finished dev [unoptimized + debuginfo] target(s) in 0.42s
     Running `target/debug/hello`
Request: [
    "GET / HTTP/1.1",
    "Host: 127.0.0.1:7878",
    "User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:99.0) Gecko/20100101 Firefox/99.0",
    "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language: en-US,en;q=0.5",
    "Accept-Encoding: gzip, deflate, br",
    "DNT: 1",
    "Connection: keep-alive",
    "Upgrade-Insecure-Requests: 1",
    "Sec-Fetch-Dest: document",
    "Sec-Fetch-Mode: navigate",
    "Sec-Fetch-Site: none",
    "Sec-Fetch-User: ?1",
    "Cache-Control: max-age=0",
]
```

根据你的浏览器，你可能会得到略有不同的输出。现在我们正在打印请求数据，我们可以通过查看请求第一行中`GET`后的路径来了解为什么我们从一个浏览器请求得到多个连接。如果重复连接都在请求`/`，我们知道浏览器试图重复获取`/`，因为它没有从我们的程序得到响应。

让我们分解这个请求数据，以了解浏览器对我们程序的要求。

### 仔细查看HTTP请求

`HTTP`是一个基于文本的协议，请求采用这种格式：

```rust
Method Request-URI HTTP-Version CRLF
headers CRLF
message-body
```

第一行是请求行，包含关于客户端请求什么的信息。请求行的第一部分表示正在使用的方法，如`GET`或`POST`，它描述了客户端如何发出此请求。我们的客户端使用了`GET`请求，这意味着它正在请求信息。

请求行的下一部分是`/`，它表示客户端请求的统一资源标识符（`URI`）：`URI`几乎与统一资源定位符（`URL`）相同，但不完全相同。对于本章的目的，`URI`和`URL`之间的区别并不重要，但`HTTP`规范使用术语`URI`，所以我们可以在这里将`URL`替换为`URI`。

最后一部分是客户端使用的`HTTP`版本，然后请求行以`CRLF`序列结束。（`CRLF`代表回车和换行，这些是打字机时代的术语！）`CRLF`序列也可以写成`\r\n`，其中`\r`是回车，`\n`是换行。`CRLF`序列将请求行与其余请求数据分开。请注意，当打印`CRLF`时，我们看到一个新行开始，而不是`\r\n`。

查看我们到目前为止运行程序收到的请求行数据，我们看到`GET`是方法，`/`是请求`URI`，`HTTP/1.1`是版本。

在请求行之后，从`Host:`开始的其余行是标头。`GET`请求没有正文。

尝试从不同的浏览器发出请求或请求不同的地址，如`127.0.0.1:7878/test`，以查看请求数据如何变化。

现在我们知道浏览器在请求什么，让我们发送回一些数据！

### 编写响应

我们将实现发送数据以响应客户端请求。响应具有以下格式：

```rust
HTTP-Version Status-Code Reason-Phrase CRLF
headers CRLF
message-body
```

第一行是状态行，包含响应中使用的`HTTP`版本、总结请求结果的数字状态代码和提供状态代码文本描述的原因短语。在`CRLF`序列之后是任何标头、另一个`CRLF`序列和响应的正文。

这是一个使用`HTTP`版本1.1的示例响应，状态代码为200，`OK`原因短语，没有标头，没有正文：

```rust
HTTP/1.1 200 OK\r\n\r\n
```

状态代码200是标准成功响应。文本是一个微小的成功`HTTP`响应。让我们将此作为我们对成功请求的响应写入流！从`handle_connection`函数中，删除打印请求数据的`println!`并将其替换为示例21-3中的代码。

文件名：src/main.rs：

```rust
use std::{
    io::{BufReader, prelude::*},
    net::{TcpListener, TcpStream},
};

fn main() {
    let listener = TcpListener::bind("127.0.0.1:7878").unwrap();

    for stream in listener.incoming() {
        let stream = stream.unwrap();

        handle_connection(stream);
    }
}

fn handle_connection(mut stream: TcpStream) {
    let buf_reader = BufReader::new(&stream);
    let http_request: Vec<_> = buf_reader
        .lines()
        .map(|result| result.unwrap())
        .take_while(|line| !line.is_empty())
        .collect();

    let response = "HTTP/1.1 200 OK\r\n\r\n";

    stream.write_all(response.as_bytes()).unwrap();
}
```

示例21-3：将微小的成功`HTTP`响应写入流

第一个新行定义了保存成功消息数据的`response`变量。然后我们在我们的响应上调用`as_bytes`以将字符串数据转换为字节。流上的`write_all`方法接受`&[u8]`并将这些字节直接发送到连接。因为`write_all`操作可能失败，我们像以前一样对任何错误结果使用`unwrap`。同样，在真实应用程序中，你会在这里添加错误处理。

通过这些更改，让我们运行我们的代码并发出请求。我们不再向终端打印任何数据，所以我们不会看到除了Cargo的输出之外的任何输出。当你在Web浏览器中加载`127.0.0.1:7878`时，你应该得到一个空白页面而不是错误。你刚刚手工编码了接收`HTTP`请求和发送响应！

### 返回真正的HTML

让我们实现返回不仅仅是空白页面的功能。在你的项目目录的根目录中创建新文件`hello.html`，而不是在`src`目录中。你可以输入任何你想要的`HTML`；示例21-4显示了一种可能性。

文件名：hello.html：

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

示例21-4：在响应中返回的示例`HTML`文件

这是一个最小的`HTML5`文档，带有标题和一些文本。为了在收到请求时从服务器返回此内容，我们将修改`handle_connection`，如示例21-5所示，以读取`HTML`文件，将其作为正文添加到响应中，并发送它。

文件名：src/main.rs：

```rust
use std::{
    fs,
    io::{BufReader, prelude::*},
    net::{TcpListener, TcpStream},
};
// --snip--

fn main() {
    let listener = TcpListener::bind("127.0.0.1:7878").unwrap();

    for stream in listener.incoming() {
        let stream = stream.unwrap();

        handle_connection(stream);
    }
}

fn handle_connection(mut stream: TcpStream) {
    let buf_reader = BufReader::new(&stream);
    let http_request: Vec<_> = buf_reader
        .lines()
        .map(|result| result.unwrap())
        .take_while(|line| !line.is_empty())
        .collect();

    let status_line = "HTTP/1.1 200 OK";
    let contents = fs::read_to_string("hello.html").unwrap();
    let length = contents.len();

    let response =
        format!("{status_line}\r\nContent-Length: {length}\r\n\r\n{contents}");

    stream.write_all(response.as_bytes()).unwrap();
}
```

示例21-5：发送`hello.html`的内容作为响应的正文

我们已经将`fs`添加到`use`语句中，以将标准库的文件系统模块引入作用域。将文件内容读取到字符串的代码应该看起来很熟悉；当我们在示例12-4中为我们的I/O项目读取文件内容时，我们使用了它。

接下来，我们使用`format!`将文件的内容作为成功响应的正文添加。为了确保有效的`HTTP`响应，我们添加了`Content-Length`标头，该标头设置为我们响应正文的大小，在这种情况下是`hello.html`的大小。

使用`cargo run`运行此代码并在浏览器中加载`127.0.0.1:7878`；你应该看到你的`HTML`被渲染！

目前，我们忽略`http_request`中的请求数据，只是无条件地发送回`HTML`文件的内容。这意味着如果你尝试在浏览器中请求`127.0.0.1:7878/something-else`，你仍然会得到相同的`HTML`响应。目前，我们的服务器非常有限，不会做大多数Web服务器所做的事情。我们想要根据请求自定义我们的响应，只为对`/`的良好形式的请求发送回`HTML`文件。

### 验证请求并有选择地响应

现在，无论客户端请求什么，我们的Web服务器都会返回文件中的`HTML`。让我们添加功能来检查浏览器是否在返回`HTML`文件之前请求`/`，如果浏览器请求其他任何内容则返回错误。为此，我们需要修改`handle_connection`，如示例21-6所示。这个新代码检查收到的请求内容与我们知道对`/`的请求的样子，并添加`if`和`else`块以不同地处理请求。

文件名：src/main.rs：

```rust
use std::{
    fs,
    io::{BufReader, prelude::*},
    net::{TcpListener, TcpStream},
};

fn main() {
    let listener = TcpListener::bind("127.0.0.1:7878").unwrap();

    for stream in listener.incoming() {
        let stream = stream.unwrap();

        handle_connection(stream);
    }
}
// --snip--

fn handle_connection(mut stream: TcpStream) {
    let buf_reader = BufReader::new(&stream);
    let request_line = buf_reader.lines().next().unwrap().unwrap();

    if request_line == "GET / HTTP/1.1" {
        let status_line = "HTTP/1.1 200 OK";
        let contents = fs::read_to_string("hello.html").unwrap();
        let length = contents.len();

        let response = format!(
            "{status_line}\r\nContent-Length: {length}\r\n\r\n{contents}"
        );

        stream.write_all(response.as_bytes()).unwrap();
    } else {
        // some other request
    }
}
```

示例21-6：以不同于其他请求的方式处理对`/`的请求

我们只查看`HTTP`请求的第一行，所以不是将整个请求读入向量，我们调用`next`从迭代器获取第一项。第一个`unwrap`处理`Option`并在迭代器没有项时停止程序。第二个`unwrap`处理`Result`并具有与示例21-2中添加的映射中的`unwrap`相同的效果。

接下来，我们检查`request_line`以查看它是否等于对`/`路径的`GET`请求的请求行。如果是，`if`块返回我们`HTML`文件的内容。

如果`request_line`不等于对`/`路径的`GET`请求，这意味着我们收到了其他一些请求。我们将在稍后向`else`块添加代码以响应所有其他请求。

现在运行此代码并请求`127.0.0.1:7878`；你应该得到`hello.html`中的`HTML`。如果你发出任何其他请求，如`127.0.0.1:7878/something-else`，你将得到连接错误，就像你在运行示例21-1和示例21-2中的代码时看到的那样。

现在让我们将示例21-7中的代码添加到`else`块中，以返回状态代码404的响应，这表示未找到请求的内容。我们还将返回一些`HTML`，用于在浏览器中渲染的页面，向最终用户指示响应。

文件名：src/main.rs：

```rust
use std::{
    fs,
    io::{BufReader, prelude::*},
    net::{TcpListener, TcpStream},
};

fn main() {
    let listener = TcpListener::bind("127.0.0.1:7878").unwrap();

    for stream in listener.incoming() {
        let stream = stream.unwrap();

        handle_connection(stream);
    }
}

fn handle_connection(mut stream: TcpStream) {
    let buf_reader = BufReader::new(&stream);
    let request_line = buf_reader.lines().next().unwrap().unwrap();

    if request_line == "GET / HTTP/1.1" {
        let status_line = "HTTP/1.1 200 OK";
        let contents = fs::read_to_string("hello.html").unwrap();
        let length = contents.len();

        let response = format!(
            "{status_line}\r\nContent-Length: {length}\r\n\r\n{contents}"
        );

        stream.write_all(response.as_bytes()).unwrap();
    // --snip--
    } else {
        let status_line = "HTTP/1.1 404 NOT FOUND";
        let contents = fs::read_to_string("404.html").unwrap();
        let length = contents.len();

        let response = format!(
            "{status_line}\r\nContent-Length: {length}\r\n\r\n{contents}"
        );

        stream.write_all(response.as_bytes()).unwrap();
    }
}
```

示例21-7：如果请求的不是`/`，则以状态代码404和错误页面响应

在这里，我们的响应有一个状态行，状态代码为404，原因短语为`NOT FOUND`。响应的正文将是文件`404.html`中的`HTML`。你需要在`hello.html`旁边创建一个`404.html`文件用于错误页面；再次随意使用任何你想要的`HTML`或使用示例21-8中的示例`HTML`。

文件名：404.html：

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

示例21-8：与任何404响应一起发送回的页面的示例内容

通过这些更改，再次运行你的服务器。请求`127.0.0.1:7878`应该返回`hello.html`的内容，任何其他请求，如`127.0.0.1:7878/foo`，应该返回来自`404.html`的错误`HTML`。

### 少量重构

目前，`if`和`else`块有很多重复：它们都在读取文件并将文件内容写入流。唯一的区别是状态行和文件名。让我们通过将这些差异提取到单独的`if`和`else`行中来使代码更简洁，这些行将状态行和文件名的值分配给变量；然后我们可以在代码中无条件地使用这些变量来读取文件和写入响应。示例21-9显示了替换大的`if`和`else`块后的结果代码。

文件名：src/main.rs：

```rust
use std::{
    fs,
    io::{BufReader, prelude::*},
    net::{TcpListener, TcpStream},
};

fn main() {
    let listener = TcpListener::bind("127.0.0.1:7878").unwrap();

    for stream in listener.incoming() {
        let stream = stream.unwrap();

        handle_connection(stream);
    }
}
// --snip--

fn handle_connection(mut stream: TcpStream) {
    // --snip--
    let buf_reader = BufReader::new(&stream);
    let request_line = buf_reader.lines().next().unwrap().unwrap();

    let (status_line, filename) = if request_line == "GET / HTTP/1.1" {
        ("HTTP/1.1 200 OK", "hello.html")
    } else {
        ("HTTP/1.1 404 NOT FOUND", "404.html")
    };

    let contents = fs::read_to_string(filename).unwrap();
    let length = contents.len();

    let response =
        format!("{status_line}\r\nContent-Length: {length}\r\n\r\n{contents}");

    stream.write_all(response.as_bytes()).unwrap();
}
```

示例21-9：重构`if`和`else`块，只包含两种情况之间不同的代码

现在`if`和`else`块只在元组中返回状态行和文件名的适当值；然后我们使用解构在`let`语句中使用模式将这两个值分配给`status_line`和`filename`，如第19章中讨论的。

之前重复的代码现在在`if`和`else`块之外，并使用`status_line`和`filename`变量。这使得更容易看到两种情况之间的区别，这意味着如果我们想要更改文件读取和响应写入的工作方式，我们只有一个地方需要更新代码。示例21-9中代码的行为将与示例21-7中的相同。

太棒了！我们现在有一个大约40行Rust代码的简单Web服务器，它用内容页面响应一个请求，并用404响应响应所有其他请求。

目前，我们的服务器在单个线程中运行，这意味着它一次只能服务一个请求。让我们通过模拟一些慢请求来检查这如何成为问题。然后我们将修复它，以便我们的服务器可以一次处理多个请求。