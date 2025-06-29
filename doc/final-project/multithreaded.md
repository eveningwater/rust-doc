## 将单线程服务器转换为多线程服务器

目前，服务器将依次处理每个请求，这意味着它不会处理第二个连接，直到第一个连接处理完成。如果服务器收到越来越多的请求，这种串行执行将变得越来越不理想。如果服务器收到一个需要很长时间处理的请求，后续请求将必须等待，直到长请求完成，即使新请求可以快速处理。我们需要解决这个问题，但首先我们将看看这个问题的实际表现。

### 在当前服务器实现中模拟慢请求

我们将看看慢处理请求如何影响对我们当前服务器实现的其他请求。示例21-10实现了对`/sleep`的请求处理，带有模拟的慢响应，这将导致服务器在响应之前休眠五秒钟。

文件名：src/main.rs：

```rust
use std::{
    fs,
    io::{BufReader, prelude::*},
    net::{TcpListener, TcpStream},
    thread,
    time::Duration,
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
    // --snip--

    let buf_reader = BufReader::new(&stream);
    let request_line = buf_reader.lines().next().unwrap().unwrap();

    let (status_line, filename) = match &request_line[..] {
        "GET / HTTP/1.1" => ("HTTP/1.1 200 OK", "hello.html"),
        "GET /sleep HTTP/1.1" => {
            thread::sleep(Duration::from_secs(5));
            ("HTTP/1.1 200 OK", "hello.html")
        }
        _ => ("HTTP/1.1 404 NOT FOUND", "404.html"),
    };

    // --snip--

    let contents = fs::read_to_string(filename).unwrap();
    let length = contents.len();

    let response =
        format!("{status_line}\r\nContent-Length: {length}\r\n\r\n{contents}");

    stream.write_all(response.as_bytes()).unwrap();
}
```

示例21-10：通过休眠5秒来模拟慢请求

我们从`if`切换到`match`，现在我们有三种情况。我们需要显式匹配`request_line`的切片来对字符串字面值进行模式匹配；`match`不像相等方法那样进行自动引用和解引用。

第一个分支与示例21-9中的`if`块相同。第二个分支匹配对`/sleep`的请求。当收到该请求时，服务器将在渲染成功的HTML页面之前休眠五秒钟。第三个分支与示例21-9中的`else`块相同。

你可以看到我们的服务器是多么原始：真正的库会以更简洁的方式处理多个请求的识别！

使用`cargo run`启动服务器。然后打开两个浏览器窗口：一个用于`http://127.0.0.1:7878/`，另一个用于`http://127.0.0.1:7878/sleep`。如果你像之前一样多次输入`/` URI，你会看到它响应很快。但是如果你输入`/sleep`然后加载`/`，你会看到`/`等待，直到`sleep`完整休眠五秒钟后才加载。

我们可以使用多种技术来避免请求在慢请求后面排队，包括使用我们在第17章中所做的`async`；我们将实现的是线程池。

### 使用线程池提高吞吐量

线程池是一组已生成的线程，它们正在等待并准备处理任务。当程序收到新任务时，它将池中的一个线程分配给该任务，该线程将处理该任务。池中的其余线程可用于处理第一个线程处理时进入的任何其他任务。当第一个线程完成处理其任务时，它将返回到空闲线程池，准备处理新任务。线程池允许你并发处理连接，增加服务器的吞吐量。

我们将把池中的线程数量限制为一个较小的数字，以保护我们免受DoS攻击；如果我们让程序为每个请求创建一个新线程，那么有人向我们的服务器发出1000万个请求可能会通过耗尽所有服务器资源并使请求处理停止来造成破坏。

因此，我们不会生成无限的线程，而是在池中等待固定数量的线程。进入的请求被发送到池中进行处理。池将维护传入请求的队列。池中的每个线程将从该队列中弹出一个请求，处理该请求，然后向队列请求另一个请求。通过这种设计，我们可以并发处理多达N个请求，其中N是线程数。如果每个线程都在响应长时间运行的请求，后续请求仍然可以在队列中排队，但我们已经增加了在达到该点之前可以处理的长时间运行请求的数量。

这种技术只是提高Web服务器吞吐量的众多方法之一。你可能探索的其他选项是fork/join模型、单线程异步I/O模型和多线程异步I/O模型。如果你对这个主题感兴趣，你可以阅读更多关于其他解决方案的信息并尝试实现它们；使用像Rust这样的低级语言，所有这些选项都是可能的。

在我们开始实现线程池之前，让我们谈谈使用池应该是什么样子。当你试图设计代码时，首先编写客户端接口可以帮助指导你的设计。以你想要调用它的方式构建代码的API；然后在该结构内实现功能，而不是实现功能然后设计公共API。

类似于我们在第12章项目中使用测试驱动开发的方式，我们将在这里使用编译器驱动开发。我们将编写调用我们想要的函数的代码，然后我们将查看编译器的错误来确定我们接下来应该更改什么以使代码工作。然而，在我们这样做之前，我们将探索我们不打算用作起点的技术。

### 为每个请求生成一个线程

首先，让我们探索如果我们的代码确实为每个连接创建一个新线程，它可能看起来如何。如前所述，由于可能生成无限数量线程的问题，这不是我们的最终计划，但它是首先获得工作的多线程服务器的起点。然后我们将添加线程池作为改进，对比这两种解决方案将更容易。示例21-11显示了对`main`进行的更改，以在`for`循环内生成新线程来处理每个流。

文件名：src/main.rs：

```rust
use std::{
    fs,
    io::{BufReader, prelude::*},
    net::{TcpListener, TcpStream},
    thread,
    time::Duration,
};

fn main() {
    let listener = TcpListener::bind("127.0.0.1:7878").unwrap();

    for stream in listener.incoming() {
        let stream = stream.unwrap();

        thread::spawn(|| {
            handle_connection(stream);
        });
    }
}

fn handle_connection(mut stream: TcpStream) {
    let buf_reader = BufReader::new(&stream);
    let request_line = buf_reader.lines().next().unwrap().unwrap();

    let (status_line, filename) = match &request_line[..] {
        "GET / HTTP/1.1" => ("HTTP/1.1 200 OK", "hello.html"),
        "GET /sleep HTTP/1.1" => {
            thread::sleep(Duration::from_secs(5));
            ("HTTP/1.1 200 OK", "hello.html")
        }
        _ => ("HTTP/1.1 404 NOT FOUND", "404.html"),
    };

    let contents = fs::read_to_string(filename).unwrap();
    let length = contents.len();

    let response =
        format!("{status_line}\r\nContent-Length: {length}\r\n\r\n{contents}");

    stream.write_all(response.as_bytes()).unwrap();
}
```

示例21-11：为每个流生成新线程

正如你在第16章中学到的，`thread::spawn`将创建一个新线程，然后在新线程中运行闭包中的代码。如果你运行此代码并在浏览器中加载`/sleep`，然后在另外两个浏览器选项卡中加载`/`，你确实会看到对`/`的请求无需等待`/sleep`完成。然而，正如我们提到的，这最终会压垮系统，因为你会无限制地创建新线程。

你可能还记得第17章中这正是`async`和`await`真正发光的情况！在我们构建线程池时记住这一点，并思考使用`async`时事情会有什么不同或相同。

### 创建有限数量的线程

我们希望我们的线程池以类似、熟悉的方式工作，这样从线程切换到线程池就不需要对使用我们API的代码进行大的更改。示例21-12显示了我们想要使用的`ThreadPool`结构的假设接口，而不是`thread::spawn`。

文件名：src/main.rs：

```rust
use std::{
    fs,
    io::{BufReader, prelude::*},
    net::{TcpListener, TcpStream},
    thread,
    time::Duration,
};

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

fn handle_connection(mut stream: TcpStream) {
    let buf_reader = BufReader::new(&stream);
    let request_line = buf_reader.lines().next().unwrap().unwrap();

    let (status_line, filename) = match &request_line[..] {
        "GET / HTTP/1.1" => ("HTTP/1.1 200 OK", "hello.html"),
        "GET /sleep HTTP/1.1" => {
            thread::sleep(Duration::from_secs(5));
            ("HTTP/1.1 200 OK", "hello.html")
        }
        _ => ("HTTP/1.1 404 NOT FOUND", "404.html"),
    };

    let contents = fs::read_to_string(filename).unwrap();
    let length = contents.len();

    let response =
        format!("{status_line}\r\nContent-Length: {length}\r\n\r\n{contents}");

    stream.write_all(response.as_bytes()).unwrap();
}
```

示例21-12：我们理想的`ThreadPool`接口

我们使用`ThreadPool::new`创建一个具有可配置线程数的新线程池，在这种情况下是四个。然后，在`for`循环中，`pool.execute`具有与`thread::spawn`类似的接口，因为它接受池应该为每个流运行的闭包。我们需要实现`pool.execute`，使其接受闭包并将其提供给池中的线程运行。此代码尚无法编译，但我们将尝试，以便编译器可以指导我们如何修复它。

### 使用编译器驱动开发构建`ThreadPool`

对src/main.rs进行示例21-12中的更改，然后让我们使用`cargo check`的编译器错误来驱动我们的开发。这是我们得到的第一个错误：

```rust
$ cargo check
    Checking hello v0.1.0 (file:///projects/hello)
error[E0433]: failed to resolve: use of undeclared type `ThreadPool`
  --> src/main.rs:11:16
   |
11 |     let pool = ThreadPool::new(4);
   |                ^^^^^^^^^^ use of undeclared type `ThreadPool`

For more information about this error, try `rustc --explain E0433`.
error: could not compile `hello` (bin "hello") due to 1 previous error
```

很好！这个错误告诉我们需要一个`ThreadPool`类型或模块，所以我们现在将构建一个。我们的`ThreadPool`实现将独立于我们的Web服务器正在做的工作类型。因此，让我们将`hello` crate从二进制crate切换到库crate来保存我们的`ThreadPool`实现。切换到库crate后，我们还可以将单独的线程池库用于我们想要使用线程池完成的任何工作，而不仅仅是提供Web请求。

创建一个包含以下内容的src/lib.rs文件，这是我们现在可以拥有的`ThreadPool`结构的最简单定义：

文件名：src/lib.rs：

```rust
pub struct ThreadPool;
```

然后编辑main.rs文件，通过在src/main.rs顶部添加以下代码，将`ThreadPool`从库crate引入作用域：

文件名：src/main.rs：

```rust
use hello::ThreadPool;
use std::{
    fs,
    io::{BufReader, prelude::*},
    net::{TcpListener, TcpStream},
    thread,
    time::Duration,
};

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

fn handle_connection(mut stream: TcpStream) {
    let buf_reader = BufReader::new(&stream);
    let request_line = buf_reader.lines().next().unwrap().unwrap();

    let (status_line, filename) = match &request_line[..] {
        "GET / HTTP/1.1" => ("HTTP/1.1 200 OK", "hello.html"),
        "GET /sleep HTTP/1.1" => {
            thread::sleep(Duration::from_secs(5));
            ("HTTP/1.1 200 OK", "hello.html")
        }
        _ => ("HTTP/1.1 404 NOT FOUND", "404.html"),
    };

    let contents = fs::read_to_string(filename).unwrap();
    let length = contents.len();

    let response =
        format!("{status_line}\r\nContent-Length: {length}\r\n\r\n{contents}");

    stream.write_all(response.as_bytes()).unwrap();
}
```

此代码仍然无法工作，但让我们再次检查它以获得我们需要解决的下一个错误：

```rust
$ cargo check
    Checking hello v0.1.0 (file:///projects/hello)
error[E0599]: no function or associated item named `new` found for struct `ThreadPool` in the current scope
  --> src/main.rs:12:28
   |
12 |     let pool = ThreadPool::new(4);
   |                            ^^^ function or associated item not found in `ThreadPool`

For more information about this error, try `rustc --explain E0599`.
error: could not compile `hello` (bin "hello") due to 1 previous error
```

此错误表明接下来我们需要为`ThreadPool`创建一个名为`new`的关联函数。我们还知道`new`需要有一个可以接受`4`作为参数的参数，并且应该返回一个`ThreadPool`实例。让我们实现具有这些特征的最简单的`new`函数：

文件名：src/lib.rs：

```rust
pub struct ThreadPool;

impl ThreadPool {
    pub fn new(size: usize) -> ThreadPool {
        ThreadPool
    }
}
```

我们选择`usize`作为`size`参数的类型，因为我们知道负数的线程数没有任何意义。我们还知道我们将使用这个`4`作为线程集合中元素的数量，这就是`usize`类型的用途，如第3章中["整数类型"](../common-concept/data-type#整数类型)所讨论的。

让我们再次检查代码：

```rust
$ cargo check
    Checking hello v0.1.0 (file:///projects/hello)
error[E0599]: no method named `execute` found for struct `ThreadPool` in the current scope
  --> src/main.rs:17:14
   |
17 |         pool.execute(|| {
   |         -----^^^^^^^ method not found in `ThreadPool`

For more information about this error, try `rustc --explain E0599`.
error: could not compile `hello` (bin "hello") due to 1 previous error
```

现在错误发生是因为我们在`ThreadPool`上没有`execute`方法。回想一下["创建有限数量的线程"](#创建有限数量的线程)，我们决定我们的线程池应该有一个类似于`thread::spawn`的接口。此外，我们将实现`execute`函数，使其接受给定的闭包并将其提供给池中的空闲线程运行。

我们将在`ThreadPool`上定义`execute`方法以接受闭包作为参数。回想一下第13章中["移动捕获值出闭包和`Fn` Trait"](../functional-features/closures#移动捕获值出闭包和-fn-trait)，我们可以使用三个不同的`trait`接受闭包作为参数：`Fn`、`FnMut`和`FnOnce`。我们需要决定在这里使用哪种闭包。我们知道我们最终会做类似于标准库`thread::spawn`实现的事情，所以我们可以查看`thread::spawn`的签名在其参数上有什么边界。文档向我们显示了以下内容：

```rust
pub fn spawn<F, T>(f: F) -> JoinHandle<T>
    where
        F: FnOnce() -> T,
        F: Send + 'static,
        T: Send + 'static,
```

`F`类型参数是我们在这里关心的；`T`类型参数与返回值相关，我们不关心这个。我们可以看到`spawn`使用`FnOnce`作为`F`上的`trait`边界。这可能也是我们想要的，因为我们最终会将我们在`execute`中得到的参数传递给`spawn`。我们可以进一步确信`FnOnce`是我们想要使用的`trait`，因为运行请求的线程只会执行该请求的闭包一次，这与`FnOnce`中的`Once`匹配。

`F`类型参数还有`trait`边界`Send`和生命周期边界`'static`，这在我们的情况下很有用：我们需要`Send`将闭包从一个线程转移到另一个线程，需要`'static`因为我们不知道线程执行需要多长时间。让我们在`ThreadPool`上创建一个`execute`方法，该方法将采用具有这些边界的类型`F`的泛型参数：

文件名：src/lib.rs：

```rust
pub struct ThreadPool;

impl ThreadPool {
    // --snip--
    pub fn new(size: usize) -> ThreadPool {
        ThreadPool
    }

    pub fn execute<F>(&self, f: F)
    where
        F: FnOnce() + Send + 'static,
    {
    }
}
```

我们仍然在`FnOnce`后使用`()`，因为这个`FnOnce`表示一个不接受参数并返回单元类型的闭包。就像函数定义一样，返回类型可以从签名中省略，但即使我们没有参数，我们仍然需要括号。

同样，这是`execute`方法的最简单实现：它什么都不做，但我们只是试图让我们的代码编译。让我们再次检查：

```rust
$ cargo check
    Checking hello v0.1.0 (file:///projects/hello)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.24s
```

它编译了！但是请注意，如果你尝试`cargo run`并在浏览器中发出请求，你将看到我们在本章开头看到的错误。我们的库实际上还没有调用传递给`execute`的闭包！

> 注意：你可能听说过关于具有严格编译器的语言（如Haskell和Rust）的一句话："如果代码编译，它就能工作。"但这句话并不普遍正确。我们的项目编译了，但它绝对什么都不做！如果我们正在构建一个真正的、完整的项目，这将是开始编写单元测试的好时机，以检查代码编译并具有我们想要的行为。

考虑：如果我们要执行`future`而不是闭包，这里会有什么不同？

#### 在`new`中验证线程数

我们没有对`new`和`execute`的参数做任何事情。让我们用我们想要的行为实现这些函数的主体。首先，让我们考虑`new`。早先我们为`size`参数选择了无符号类型，因为负数的线程池没有意义。然而，零个线程的池也没有意义，但零是完全有效的`usize`。我们将添加代码来检查`size`是否大于零，然后再返回`ThreadPool`实例，如果程序收到零，则使用`assert!`宏让程序恐慌，如示例21-13所示。

文件名：src/lib.rs：

```rust
pub struct ThreadPool;

impl ThreadPool {
    /// 创建一个新的ThreadPool。
    ///
    /// size是池中的线程数。
    ///
    /// # Panics
    ///
    /// 如果size为零，`new`函数将恐慌。
    pub fn new(size: usize) -> ThreadPool {
        assert!(size > 0);

        ThreadPool
    }

    // --snip--
    pub fn execute<F>(&self, f: F)
    where
        F: FnOnce() + Send + 'static,
    {
    }
}
```

示例21-13：实现`ThreadPool::new`在`size`为零时恐慌

我们还为我们的`ThreadPool`添加了一些文档注释。请注意，我们遵循了良好的文档实践，添加了一个部分来说明我们的函数可能恐慌的情况，如第14章中所讨论的。尝试运行`cargo doc --open`并点击`ThreadPool`结构来查看`new`的生成文档是什么样子！

我们可以更改`new`为`build`并返回`Result`，就像我们在示例12-9中的I/O项目中对`Config::build`所做的那样，而不是像我们在这里所做的那样添加`assert!`宏。但我们在这种情况下决定，试图创建没有任何线程的线程池应该是不可恢复的错误。如果你感到雄心勃勃，试着编写一个名为`build`的函数，其签名如下，与`new`函数进行比较：

```rust
pub fn build(size: usize) -> Result<ThreadPool, PoolCreationError> {
    //...
}
```

#### 创建存储线程的空间

现在我们有了一种方法来知道我们有一个有效的线程数来存储在池中，我们可以创建这些线程并在返回结构之前将它们存储在`ThreadPool`结构中。但是我们如何"存储"一个线程？让我们再看看`thread::spawn`签名：

```rust
pub fn spawn<F, T>(f: F) -> JoinHandle<T>
    where
        F: FnOnce() -> T,
        F: Send + 'static,
        T: Send + 'static,
```

`spawn`函数返回一个`JoinHandle<T>`，其中`T`是闭包返回的类型。让我们尝试也使用`JoinHandle`看看会发生什么。在我们的情况下，我们传递给线程池的闭包将处理连接并且不返回任何内容，所以`T`将是单元类型`()`。

示例21-14中的代码将编译但还没有创建任何线程。我们已经更改了`ThreadPool`的定义以保存`thread::JoinHandle<()>`实例的向量，用`size`的容量初始化向量，设置一个`for`循环来运行一些代码来创建线程，并返回包含它们的`ThreadPool`实例。

文件名：src/lib.rs：

```rust
use std::thread;

pub struct ThreadPool {
    threads: Vec<thread::JoinHandle<()>>,
}

impl ThreadPool {
    // --snip--
    /// 创建一个新的ThreadPool。
    ///
    /// size是池中的线程数。
    ///
    /// # Panics
    ///
    /// 如果size为零，`new`函数将恐慌。
    pub fn new(size: usize) -> ThreadPool {
        assert!(size > 0);

        let mut threads = Vec::with_capacity(size);

        for _ in 0..size {
            // 创建一些线程并将它们存储在向量中
        }

        ThreadPool { threads }
    }
    // --snip--

    pub fn execute<F>(&self, f: F)
    where
        F: FnOnce() + Send + 'static,
    {
    }
}
```

示例21-14：为`ThreadPool`创建一个向量来保存线程

我们已经将`std::thread`引入库crate的作用域，因为我们使用`thread::JoinHandle`作为`ThreadPool`中向量中项目的类型。

一旦收到有效的大小，我们的`ThreadPool`就会创建一个可以保存`size`项的新向量。`with_capacity`函数执行与`Vec::new`相同的任务，但有一个重要区别：它在向量中预分配空间。因为我们知道需要在向量中存储`size`个元素，所以提前进行此分配比使用`Vec::new`（它会在插入元素时调整自身大小）稍微更有效率。

当你再次运行`cargo check`时，它应该成功。

#### 负责将代码从`ThreadPool`发送到线程的`Worker`结构

我们在示例21-14的`for`循环中留下了关于创建线程的注释。在这里，我们将看看我们实际上如何创建线程。标准库提供`thread::spawn`作为创建线程的方式，`thread::spawn`期望获得线程创建后应该立即运行的一些代码。然而，在我们的情况下，我们想要创建线程并让它们等待我们稍后发送的代码。标准库的线程实现不包括任何这样做的方式；我们必须手动实现它。

我们将通过在`ThreadPool`和线程之间引入一个新的数据结构来实现这种行为，该数据结构将管理这种新行为。我们将这个数据结构称为`Worker`，这是池化实现中的常见术语。`Worker`拾取需要运行的代码并在`Worker`的线程中运行代码。

想象一下在餐厅厨房工作的人：工人等待来自顾客的订单，然后他们负责接受这些订单并完成它们。

我们不会在线程池中存储`JoinHandle<()>`实例的向量，而是存储`Worker`结构的实例。每个`Worker`将存储单个`JoinHandle<()>`实例。然后我们将在`Worker`上实现一个方法，该方法将接受要运行的代码闭包并将其发送到已经运行的线程执行。我们还将给每个`Worker`一个`id`，这样我们就可以在记录或调试时区分池中`Worker`的不同实例。

这是创建`ThreadPool`时将发生的新过程。我们将在以这种方式设置`Worker`后实现将闭包发送到线程的代码：

1. 定义一个`Worker`结构，它保存一个`id`和一个`JoinHandle<()>`。
2. 更改`ThreadPool`以保存`Worker`实例的向量。
3. 定义一个`Worker::new`函数，它接受一个`id`数字并返回一个`Worker`实例，该实例保存`id`和用空闭包生成的线程。
4. 在`ThreadPool::new`中，使用`for`循环计数器生成一个`id`，用该`id`创建一个新的`Worker`，并将worker存储在向量中。

如果你准备迎接挑战，在查看示例21-15中的代码之前尝试自己实现这些更改。

准备好了吗？这是示例21-15，其中包含进行前述修改的一种方法。

文件名：src/lib.rs：

```rust
use std::thread;

pub struct ThreadPool {
    workers: Vec<Worker>,
}

impl ThreadPool {
    // --snip--
    /// 创建一个新的ThreadPool。
    ///
    /// size是池中的线程数。
    ///
    /// # Panics
    ///
    /// 如果size为零，`new`函数将恐慌。
    pub fn new(size: usize) -> ThreadPool {
        assert!(size > 0);

        let mut workers = Vec::with_capacity(size);

        for id in 0..size {
            workers.push(Worker::new(id));
        }

        ThreadPool { workers }
    }
    // --snip--

    pub fn execute<F>(&self, f: F)
    where
        F: FnOnce() + Send + 'static,
    {
    }
}

struct Worker {
    id: usize,
    thread: thread::JoinHandle<()>,
}

impl Worker {
    fn new(id: usize) -> Worker {
        let thread = thread::spawn(|| {});

        Worker { id, thread }
    }
}
```

示例21-15：修改`ThreadPool`以直接保存`Worker`实例而不是直接保存线程

我们已经将`ThreadPool`上字段的名称从`threads`更改为`workers`，因为它现在保存`Worker`实例而不是`JoinHandle<()>`实例。我们使用`for`循环中的计数器作为`Worker::new`的参数，并将每个新的`Worker`存储在名为`workers`的向量中。

外部代码（如我们在src/main.rs中的服务器）不需要知道在`ThreadPool`内使用`Worker`结构的实现细节，所以我们将`Worker`结构及其`new`函数设为私有。`Worker::new`函数使用我们给它的`id`并存储一个`JoinHandle<()>`实例，该实例通过使用空闭包生成新线程创建。

> 注意：如果操作系统由于没有足够的系统资源而无法创建线程，`thread::spawn`将恐慌。这将导致我们的整个服务器恐慌，即使某些线程的创建可能成功。为了简单起见，这种行为是可以的，但在生产线程池实现中，你可能希望使用[`std::thread::Builder`](https://doc.rust-lang.org/std/thread/struct.Builder.html)及其返回`Result`的[`spawn`](https://doc.rust-lang.org/std/thread/struct.Builder.html#method.spawn)方法。

此代码将编译并将存储我们指定为`ThreadPool::new`参数的`Worker`实例数。但我们仍然没有处理我们在`execute`中得到的闭包。让我们接下来看看如何做到这一点。

#### 通过通道向线程发送请求

我们将要解决的下一个问题是给`thread::spawn`的闭包绝对不做任何事情。目前，我们在`execute`方法中获得我们想要执行的闭包。但我们需要在创建每个`Worker`期间创建`ThreadPool`时给`thread::spawn`一个闭包来运行。

我们希望刚创建的`Worker`结构从`ThreadPool`中保存的队列中获取要运行的代码，并将该代码发送到其线程运行。

我们在第16章中学到的通道——一种在两个线程之间通信的简单方法——对于这个用例来说是完美的。我们将使用通道作为作业队列，`execute`将从`ThreadPool`向`Worker`实例发送作业，这些实例将作业发送到其线程。这是计划：

1. `ThreadPool`将创建一个通道并持有发送者。
2. 每个`Worker`将持有接收者。
3. 我们将创建一个新的`Job`结构，该结构将保存我们想要通过通道发送的闭包。
4. `execute`方法将通过发送者发送它想要执行的作业。
5. 在其线程中，`Worker`将循环其接收者并执行它收到的任何作业的闭包。

让我们从在`ThreadPool::new`中创建通道并让`ThreadPool`实例持有发送者开始，如示例21-16所示。`Job`结构目前不包含任何内容，但将是我们通过通道发送的项目的类型。

文件名：src/lib.rs：

```rust
use std::{sync::mpsc, thread};

pub struct ThreadPool {
    workers: Vec<Worker>,
    sender: mpsc::Sender<Job>,
}

struct Job;

impl ThreadPool {
    // --snip--
    /// 创建一个新的ThreadPool。
    ///
    /// size是池中的线程数。
    ///
    /// # Panics
    ///
    /// 如果size为零，`new`函数将恐慌。
    pub fn new(size: usize) -> ThreadPool {
        assert!(size > 0);

        let (sender, receiver) = mpsc::channel();

        let mut workers = Vec::with_capacity(size);

        for id in 0..size {
            workers.push(Worker::new(id));
        }

        ThreadPool { workers, sender }
    }
    // --snip--

    pub fn execute<F>(&self, f: F)
    where
        F: FnOnce() + Send + 'static,
    {
    }
}

struct Worker {
    id: usize,
    thread: thread::JoinHandle<()>,
}

impl Worker {
    fn new(id: usize) -> Worker {
        let thread = thread::spawn(|| {});

        Worker { id, thread }
    }
}
```

示例21-16：修改`ThreadPool`以存储发送`Job`实例的通道的发送者

在`ThreadPool::new`中，我们创建了新通道并让池持有发送者。这将成功编译。

让我们尝试在线程池创建通道时将通道的接收者传递给每个`Worker`。我们知道我们想要在`Worker`实例生成的线程中使用接收者，所以我们将在闭包中引用`receiver`参数。示例21-17中的代码还不能完全编译。

文件名：src/lib.rs：

```rust
use std::{sync::mpsc, thread};

pub struct ThreadPool {
    workers: Vec<Worker>,
    sender: mpsc::Sender<Job>,
}

struct Job;

impl ThreadPool {
    // --snip--
    /// 创建一个新的ThreadPool。
    ///
    /// size是池中的线程数。
    ///
    /// # Panics
    ///
    /// 如果size为零，`new`函数将恐慌。
    pub fn new(size: usize) -> ThreadPool {
        assert!(size > 0);

        let (sender, receiver) = mpsc::channel();

        let mut workers = Vec::with_capacity(size);

        for id in 0..size {
            workers.push(Worker::new(id, receiver));
        }

        ThreadPool { workers, sender }
    }
    // --snip--

    pub fn execute<F>(&self, f: F)
    where
        F: FnOnce() + Send + 'static,
    {
    }
}

// --snip--


struct Worker {
    id: usize,
    thread: thread::JoinHandle<()>,
}

impl Worker {
    fn new(id: usize, receiver: mpsc::Receiver<Job>) -> Worker {
        let thread = thread::spawn(|| {
            receiver;
        });

        Worker { id, thread }
    }
}
```

示例21-17：将接收者传递给每个`Worker`

我们做了一些小而直接的更改：我们将接收者传递给`Worker::new`，然后在闭包内使用它。

当我们尝试检查此代码时，我们得到这个错误：

```rust
$ cargo check
    Checking hello v0.1.0 (file:///projects/hello)
error[E0382]: use of moved value: `receiver`
  --> src/lib.rs:26:42
   |
21 |         let (sender, receiver) = mpsc::channel();
   |                      -------- move occurs because `receiver` has type `std::sync::mpsc::Receiver<Job>`, which does not implement the `Copy` trait
...
25 |         for id in 0..size {
   |         ----------------- inside of this loop
26 |             workers.push(Worker::new(id, receiver));
   |                                          ^^^^^^^^ value moved here, in previous iteration of loop
   |
note: consider changing this parameter type in method `new` to borrow instead if owning the value isn't necessary
  --> src/lib.rs:47:33
   |
47 |     fn new(id: usize, receiver: mpsc::Receiver<Job>) -> Worker {
   |        --- in this method       ^^^^^^^^^^^^^^^^^^^ this parameter takes ownership of the value
help: consider moving the expression out of the loop so it is only moved once
   |
25 ~         let mut value = Worker::new(id, receiver);
26 ~         for id in 0..size {
27 ~             workers.push(value);
   |

For more information about this error, try `rustc --explain E0382`.
error: could not compile `hello` (lib) due to 1 previous error
```

代码试图将`receiver`传递给多个`Worker`实例。这不会工作，正如你从第16章中回忆的：Rust提供的通道实现是多生产者、单消费者。这意味着我们不能只是克隆通道的消费端来修复此代码。我们也不想多次向多个消费者发送消息；我们想要一个消息列表，其中有多个`Worker`实例，这样每个消息都被处理一次。

此外，从通道队列中取出作业涉及改变`receiver`，所以线程需要一种安全的方式来共享和修改`receiver`；否则，我们可能会遇到竞争条件（如第16章中所涵盖的）。

回想一下第16章中讨论的线程安全智能指针：要在多个线程之间共享所有权并允许线程改变值，我们需要使用`Arc<Mutex<T>>`。`Arc`类型将让多个`Worker`实例拥有接收者，`Mutex`将确保一次只有一个`Worker`从接收者获得作业。示例21-18显示了我们需要进行的更改。

文件名：src/lib.rs：

```rust
use std::{
    sync::{Arc, Mutex, mpsc},
    thread,
};
// --snip--

pub struct ThreadPool {
    workers: Vec<Worker>,
    sender: mpsc::Sender<Job>,
}

struct Job;

impl ThreadPool {
    // --snip--
    /// 创建一个新的ThreadPool。
    ///
    /// size是池中的线程数。
    ///
    /// # Panics
    ///
    /// 如果size为零，`new`函数将恐慌。
    pub fn new(size: usize) -> ThreadPool {
        assert!(size > 0);

        let (sender, receiver) = mpsc::channel();

        let receiver = Arc::new(Mutex::new(receiver));

        let mut workers = Vec::with_capacity(size);

        for id in 0..size {
            workers.push(Worker::new(id, Arc::clone(&receiver)));
        }

        ThreadPool { workers, sender }
    }

    // --snip--

    pub fn execute<F>(&self, f: F)
    where
        F: FnOnce() + Send + 'static,
    {
    }
}

// --snip--

struct Worker {
    id: usize,
    thread: thread::JoinHandle<()>,
}

impl Worker {
    fn new(id: usize, receiver: Arc<Mutex<mpsc::Receiver<Job>>>) -> Worker {
        // --snip--
        let thread = thread::spawn(|| {
            receiver;
        });

        Worker { id, thread }
    }
}
```

示例21-18：使用`Arc`和`Mutex`在`Worker`实例之间共享接收者

在`ThreadPool::new`中，我们将接收者放在`Arc`和`Mutex`中。对于每个新的`Worker`，我们克隆`Arc`以增加引用计数，这样`Worker`实例就可以共享接收者的所有权。

通过这些更改，代码编译了！我们正在取得进展！

#### 实现`execute`方法

最后让我们在`ThreadPool`上实现`execute`方法。我们还将`Job`从结构更改为保存`execute`接收的闭包类型的`trait`对象的类型别名。如第20章中["使用类型别名创建类型同义词"](../advanced-features/advanced-types#使用类型别名创建类型同义词)所讨论的，类型别名允许我们使长类型更短以便于使用。看看示例21-19。

文件名：src/lib.rs：

```rust
use std::{
    sync::{Arc, Mutex, mpsc},
    thread,
};

pub struct ThreadPool {
    workers: Vec<Worker>,
    sender: mpsc::Sender<Job>,
}

// --snip--

type Job = Box<dyn FnOnce() + Send + 'static>;

impl ThreadPool {
    // --snip--
    /// 创建一个新的ThreadPool。
    ///
    /// size是池中的线程数。
    ///
    /// # Panics
    ///
    /// 如果size为零，`new`函数将恐慌。
    pub fn new(size: usize) -> ThreadPool {
        assert!(size > 0);

        let (sender, receiver) = mpsc::channel();

        let receiver = Arc::new(Mutex::new(receiver));

        let mut workers = Vec::with_capacity(size);

        for id in 0..size {
            workers.push(Worker::new(id, Arc::clone(&receiver)));
        }

        ThreadPool { workers, sender }
    }

    pub fn execute<F>(&self, f: F)
    where
        F: FnOnce() + Send + 'static,
    {
        let job = Box::new(f);

        self.sender.send(job).unwrap();
    }
}

// --snip--

struct Worker {
    id: usize,
    thread: thread::JoinHandle<()>,
}

impl Worker {
    fn new(id: usize, receiver: Arc<Mutex<mpsc::Receiver<Job>>>) -> Worker {
        let thread = thread::spawn(|| {
            receiver;
        });

        Worker { id, thread }
    }
}
```

示例21-19：为保存每个闭包的`Box`创建`Job`类型别名，然后通过通道发送作业

在使用我们在`execute`中得到的闭包创建新的`Job`实例后，我们将该作业发送到通道的发送端。我们在`send`上调用`unwrap`以防发送失败的情况。例如，如果我们停止所有线程执行，这意味着接收端已停止接收新消息，这种情况可能会发生。目前，我们无法停止线程执行：只要池存在，我们的线程就会继续执行。我们使用`unwrap`的原因是我们知道失败情况不会发生，但编译器不知道这一点。

但我们还没有完全完成！在`Worker`中，传递给`thread::spawn`的闭包仍然只引用通道的接收端。相反，我们需要闭包永远循环，向通道的接收端请求作业，并在获得作业时运行作业。让我们对`Worker::new`进行示例21-20中显示的更改。

文件名：src/lib.rs：

```rust
use std::{
    sync::{Arc, Mutex, mpsc},
    thread,
};

pub struct ThreadPool {
    workers: Vec<Worker>,
    sender: mpsc::Sender<Job>,
}

type Job = Box<dyn FnOnce() + Send + 'static>;

impl ThreadPool {
    /// 创建一个新的ThreadPool。
    ///
    /// size是池中的线程数。
    ///
    /// # Panics
    ///
    /// 如果size为零，`new`函数将恐慌。
    pub fn new(size: usize) -> ThreadPool {
        assert!(size > 0);

        let (sender, receiver) = mpsc::channel();

        let receiver = Arc::new(Mutex::new(receiver));

        let mut workers = Vec::with_capacity(size);

        for id in 0..size {
            workers.push(Worker::new(id, Arc::clone(&receiver)));
        }

        ThreadPool { workers, sender }
    }

    pub fn execute<F>(&self, f: F)
    where
        F: FnOnce() + Send + 'static,
    {
        let job = Box::new(f);

        self.sender.send(job).unwrap();
    }
}

struct Worker {
    id: usize,
    thread: thread::JoinHandle<()>,
}

// --snip--

impl Worker {
    fn new(id: usize, receiver: Arc<Mutex<mpsc::Receiver<Job>>>) -> Worker {
        let thread = thread::spawn(move || {
            loop {
                let job = receiver.lock().unwrap().recv().unwrap();

                println!("Worker {id} got a job; executing.");

                job();
            }
        });

        Worker { id, thread }
    }
}
```

示例21-20：在`Worker`实例线程中接收和执行作业

在这里，我们首先在`receiver`上调用`lock`来获取互斥锁，然后调用`unwrap`来对任何错误进行恐慌。如果互斥锁处于中毒状态，获取锁可能会失败，如果某个其他线程在持有锁时恐慌而不是释放锁，就会发生这种情况。在这种情况下，调用`unwrap`让这个线程恐慌是正确的行动。随意将此`unwrap`更改为带有对你有意义的错误消息的`expect`。

如果我们获得了互斥锁上的锁，我们调用`recv`从通道接收`Job`。最后的`unwrap`也会移过这里的任何错误，如果持有发送者的线程已关闭，可能会发生这种情况，类似于`send`方法在接收者关闭时返回`Err`的方式。

对`recv`的调用会阻塞，所以如果还没有作业，当前线程将等待直到作业可用。`Mutex<T>`确保一次只有一个`Worker`线程尝试请求作业。

我们的线程池现在处于工作状态！给它一个`cargo run`并发出一些请求：

```rust
$ cargo run
   Compiling hello v0.1.0 (file:///projects/hello)
warning: field `workers` is never read
 --> src/lib.rs:7:5
  |
6 | pub struct ThreadPool {
  |            ---------- field in this struct
7 |     workers: Vec<Worker>,
  |     ^^^^^^^
  |
  = note: `#[warn(dead_code)]` on by default

warning: fields `id` and `thread` are never read
  --> src/lib.rs:48:5
   |
47 | struct Worker {
   |        ------ fields in this struct
48 |     id: usize,
   |     ^^
49 |     thread: thread::JoinHandle<()>,
   |     ^^^^^^

warning: `hello` (lib) generated 2 warnings
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 4.91s
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

成功！我们现在有一个异步执行连接的线程池。创建的线程永远不会超过四个，所以如果服务器收到大量请求，我们的系统不会过载。如果我们对`/sleep`发出请求，服务器将能够通过让另一个线程运行它们来为其他请求提供服务。

> 注意：如果你同时在多个浏览器窗口中打开`/sleep`，它们可能会在五秒间隔内一次加载一个。一些Web浏览器出于缓存原因会顺序执行同一请求的多个实例。这个限制不是由我们的Web服务器引起的。

在学习了第17章和第18章中的`while let`循环后，你可能想知道为什么我们不像示例21-21中所示那样编写工作线程代码。

文件名：src/lib.rs：

```rust
use std::{
    sync::{Arc, Mutex, mpsc},
    thread,
};

pub struct ThreadPool {
    workers: Vec<Worker>,
    sender: mpsc::Sender<Job>,
}

type Job = Box<dyn FnOnce() + Send + 'static>;

impl ThreadPool {
    /// 创建一个新的ThreadPool。
    ///
    /// size是池中的线程数。
    ///
    /// # Panics
    ///
    /// 如果size为零，`new`函数将恐慌。
    pub fn new(size: usize) -> ThreadPool {
        assert!(size > 0);

        let (sender, receiver) = mpsc::channel();

        let receiver = Arc::new(Mutex::new(receiver));

        let mut workers = Vec::with_capacity(size);

        for id in 0..size {
            workers.push(Worker::new(id, Arc::clone(&receiver)));
        }

        ThreadPool { workers, sender }
    }

    pub fn execute<F>(&self, f: F)
    where
        F: FnOnce() + Send + 'static,
    {
        let job = Box::new(f);

        self.sender.send(job).unwrap();
    }
}

struct Worker {
    id: usize,
    thread: thread::JoinHandle<()>,
}
// --snip--

impl Worker {
    fn new(id: usize, receiver: Arc<Mutex<mpsc::Receiver<Job>>>) -> Worker {
        let thread = thread::spawn(move || {
            while let Ok(job) = receiver.lock().unwrap().recv() {
                println!("Worker {id} got a job; executing.");

                job();
            }
        });

        Worker { id, thread }
    }
}
```

示例21-21：使用`while let`的`Worker::new`的替代实现

此代码编译和运行，但不会导致所需的线程行为：慢请求仍然会导致其他请求等待处理。原因有些微妙：`Mutex`结构没有公共`unlock`方法，因为锁的所有权基于`lock`方法返回的`LockResult<MutexGuard<T>>`内`MutexGuard<T>`的生命周期。在编译时，借用检查器可以强制执行受`Mutex`保护的资源不能在我们不持有锁的情况下访问的规则。然而，如果我们不注意`MutexGuard<T>`的生命周期，这种实现也可能导致锁被持有的时间比预期更长。

示例21-20中使用`let job = receiver.lock().unwrap().recv().unwrap();`的代码工作，因为使用`let`，等号右侧表达式中使用的任何临时值在`let`语句结束时立即被丢弃。然而，`while let`（以及`if let`和`match`）不会丢弃临时值，直到相关块结束。在示例21-21中，锁在调用`job()`期间保持持有，这意味着其他`Worker`实例无法接收作业。 