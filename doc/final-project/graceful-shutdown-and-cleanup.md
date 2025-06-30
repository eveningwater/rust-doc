## 优雅关闭和清理

示例21-20中的代码通过使用线程池异步响应请求，正如我们预期的那样。我们得到一些关于`workers`、`id`和`thread`字段的警告，提醒我们没有以直接方式使用它们，这提醒我们没有清理任何东西。当我们使用不太优雅的`ctrl-c`方法来停止主线程时，所有其他线程也会立即停止，即使它们正在服务请求的中途。

接下来，我们将实现`Drop` trait在池中的每个线程上调用`join`，以便它们可以在关闭之前完成它们正在处理的请求。然后我们将实现一种方式来告诉线程它们应该停止接受新请求并关闭。为了看到这段代码的实际运行，我们将修改我们的服务器，在优雅关闭其线程池之前只接受两个请求。

需要注意的一点是：这些都不会影响处理执行闭包的代码部分，所以如果我们为异步运行时使用线程池，这里的一切都是一样的。

### 在`ThreadPool`上实现`Drop` Trait

让我们从在我们的线程池上实现`Drop`开始。当池被丢弃时，我们的线程都应该`join`以确保它们完成工作。示例21-22显示了`Drop`实现的第一次尝试；这段代码还不能完全正常工作。

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
    /// Create a new ThreadPool.
    ///
    /// The size is the number of threads in the pool.
    ///
    /// # Panics
    ///
    /// The `new` function will panic if the size is zero.
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

impl Drop for ThreadPool {
    fn drop(&mut self) {
        for worker in &mut self.workers {
            println!("Shutting down worker {}", worker.id);

            worker.thread.join().unwrap();
        }
    }
}

struct Worker {
    id: usize,
    thread: thread::JoinHandle<()>,
}

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

示例21-22：当线程池超出作用域时连接每个线程

首先，我们循环遍历线程池的每个`workers`。我们为此使用`&mut`，因为`self`是一个可变引用，并且我们还需要能够改变`worker`。对于每个`worker`，我们打印一条消息，说明这个特定的`Worker`实例正在关闭，然后我们在该`Worker`实例的线程上调用`join`。如果对`join`的调用失败，我们使用`unwrap`让Rust恐慌并进入不优雅的关闭。

这是我们编译此代码时得到的错误：

```rust
$ cargo check
    Checking hello v0.1.0 (file:///projects/hello)
error[E0507]: cannot move out of `worker.thread` which is behind a mutable reference
  --> src/lib.rs:52:13
   |
52 |             worker.thread.join().unwrap();
   |             ^^^^^^^^^^^^^ ------ `worker.thread` moved due to this method call
   |             |
   |             move occurs because `worker.thread` has type `JoinHandle<()>`, which does not implement the `Copy` trait
   |
note: `JoinHandle::<T>::join` takes ownership of the receiver `self`, which moves `worker.thread`
  --> /rustc/4eb161250e340c8f48f66e2b929ef4a5bed7c181/library/std/src/thread/mod.rs:1876:17

For more information about this error, try `rustc --explain E0507`.
error: could not compile `hello` (lib) due to 1 previous error
```

错误告诉我们不能调用`join`，因为我们只有每个`worker`的可变借用，而`join`获取其参数的所有权。为了解决这个问题，我们需要将线程从拥有`thread`的`Worker`实例中移出，以便`join`可以消费线程。我们在示例18-15中采用了这种方法。如果`Worker`持有`Option<thread::JoinHandle<()>>`，我们可以在`Option`上调用`take`方法将值从`Some`变体中移出，并在其位置留下`None`变体。换句话说，正在运行的`Worker`在`thread`中会有一个`Some`变体，当我们想要清理`Worker`时，我们会用`None`替换`Some`，这样`Worker`就没有线程可以运行。

然而，这只会在丢弃`Worker`时出现。作为交换，我们必须在访问`worker.thread`的任何地方处理`Option<thread::JoinHandle<()>>`。惯用的Rust很多时候都使用`Option`，但当你发现自己将你知道总是存在的东西包装在`Option`中作为这样的解决方法时，寻找替代方法是个好主意。它们可以使你的代码更清洁，错误更少。

在这种情况下，存在一个更好的替代方案：`Vec::drain`方法。它接受一个范围参数来指定要从`Vec`中删除哪些项目，并返回这些项目的迭代器。传递`..`范围语法将从`Vec`中删除每个值。

所以我们需要像这样更新`ThreadPool` drop实现：

文件名：src/lib.rs：

```rust
#![allow(unused)]
fn main() {
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
    /// Create a new ThreadPool.
    ///
    /// The size is the number of threads in the pool.
    ///
    /// # Panics
    ///
    /// The `new` function will panic if the size is zero.
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

impl Drop for ThreadPool {
    fn drop(&mut self) {
        for worker in self.workers.drain(..) {
            println!("Shutting down worker {}", worker.id);

            worker.thread.join().unwrap();
        }
    }
}

struct Worker {
    id: usize,
    thread: thread::JoinHandle<()>,
}

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
}
```

这解决了编译器错误，并且不需要对我们的代码进行任何其他更改。

### 向线程发出停止监听作业的信号

通过我们所做的所有更改，我们的代码编译时没有任何警告。然而，坏消息是这段代码还没有按照我们想要的方式运行。关键是`Worker`实例的线程运行的闭包中的逻辑：目前，我们调用`join`，但这不会关闭线程，因为它们永远循环寻找作业。如果我们尝试使用我们当前的`drop`实现丢弃我们的`ThreadPool`，主线程将永远阻塞，等待第一个线程完成。

为了解决这个问题，我们需要在`ThreadPool` drop实现中进行更改，然后在`Worker`循环中进行更改。

首先，我们将更改`ThreadPool` drop实现，在等待线程完成之前显式丢弃`sender`。示例21-23显示了对`ThreadPool`的更改，以显式丢弃`sender`。与线程不同，这里我们确实需要使用`Option`来能够用`Option::take`将`sender`从`ThreadPool`中移出。

文件名：src/lib.rs：

```rust
use std::{
    sync::{Arc, Mutex, mpsc},
    thread,
};

pub struct ThreadPool {
    workers: Vec<Worker>,
    sender: Option<mpsc::Sender<Job>>,
}
// --snip--

type Job = Box<dyn FnOnce() + Send + 'static>;

impl ThreadPool {
    /// Create a new ThreadPool.
    ///
    /// The size is the number of threads in the pool.
    ///
    /// # Panics
    ///
    /// The `new` function will panic if the size is zero.
    pub fn new(size: usize) -> ThreadPool {
        // --snip--

        assert!(size > 0);

        let (sender, receiver) = mpsc::channel();

        let receiver = Arc::new(Mutex::new(receiver));

        let mut workers = Vec::with_capacity(size);

        for id in 0..size {
            workers.push(Worker::new(id, Arc::clone(&receiver)));
        }

        ThreadPool {
            workers,
            sender: Some(sender),
        }
    }

    pub fn execute<F>(&self, f: F)
    where
        F: FnOnce() + Send + 'static,
    {
        let job = Box::new(f);

        self.sender.as_ref().unwrap().send(job).unwrap();
    }
}

impl Drop for ThreadPool {
    fn drop(&mut self) {
        drop(self.sender.take());

        for worker in self.workers.drain(..) {
            println!("Shutting down worker {}", worker.id);

            worker.thread.join().unwrap();
        }
    }
}

struct Worker {
    id: usize,
    thread: thread::JoinHandle<()>,
}

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

示例21-23：在连接`Worker`线程之前显式丢弃`sender`

丢弃`sender`会关闭通道，这表明不会再发送更多消息。当这种情况发生时，`Worker`实例在无限循环中对`recv`的所有调用都将返回错误。在示例21-24中，我们更改`Worker`循环以在这种情况下优雅地退出循环，这意味着当`ThreadPool` drop实现对它们调用`join`时线程将完成。

文件名：src/lib.rs：

```rust
use std::{
    sync::{Arc, Mutex, mpsc},
    thread,
};

pub struct ThreadPool {
    workers: Vec<Worker>,
    sender: Option<mpsc::Sender<Job>>,
}

type Job = Box<dyn FnOnce() + Send + 'static>;

impl ThreadPool {
    /// Create a new ThreadPool.
    ///
    /// The size is the number of threads in the pool.
    ///
    /// # Panics
    ///
    /// The `new` function will panic if the size is zero.
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
            sender: Some(sender),
        }
    }

    pub fn execute<F>(&self, f: F)
    where
        F: FnOnce() + Send + 'static,
    {
        let job = Box::new(f);

        self.sender.as_ref().unwrap().send(job).unwrap();
    }
}

impl Drop for ThreadPool {
    fn drop(&mut self) {
        drop(self.sender.take());

        for worker in self.workers.drain(..) {
            println!("Shutting down worker {}", worker.id);

            worker.thread.join().unwrap();
        }
    }
}

struct Worker {
    id: usize,
    thread: thread::JoinHandle<()>,
}

impl Worker {
    fn new(id: usize, receiver: Arc<Mutex<mpsc::Receiver<Job>>>) -> Worker {
        let thread = thread::spawn(move || {
            loop {
                let message = receiver.lock().unwrap().recv();

                match message {
                    Ok(job) => {
                        println!("Worker {id} got a job; executing.");

                        job();
                    }
                    Err(_) => {
                        println!("Worker {id} disconnected; shutting down.");
                        break;
                    }
                }
            }
        });

        Worker { id, thread }
    }
}
```

示例21-24：当`recv`返回错误时显式跳出循环

为了看到这段代码的实际运行，让我们修改`main`以在优雅关闭服务器之前只接受两个请求，如示例21-25所示。

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

    for stream in listener.incoming().take(2) {
        let stream = stream.unwrap();

        pool.execute(|| {
            handle_connection(stream);
        });
    }

    println!("Shutting down.");
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

示例21-25：通过退出循环在服务两个请求后关闭服务器

你不会希望真实世界的web服务器在只服务两个请求后就关闭。这段代码只是演示了优雅关闭和清理正在正常工作。

`take`方法在`Iterator` trait中定义，将迭代限制为最多前两个项目。`ThreadPool`将在`main`的末尾超出作用域，`drop`实现将运行。

用`cargo run`启动服务器，并发出三个请求。第三个请求应该出错，在你的终端中你应该看到类似这样的输出：

```rust
$ cargo run
   Compiling hello v0.1.0 (file:///projects/hello)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.41s
     Running `target/debug/hello`
Worker 0 got a job; executing.
Shutting down.
Shutting down worker 0
Worker 3 got a job; executing.
Worker 1 disconnected; shutting down.
Worker 2 disconnected; shutting down.
Worker 3 disconnected; shutting down.
Worker 0 disconnected; shutting down.
Shutting down worker 1
Shutting down worker 2
Shutting down worker 3
```

你可能会看到不同的`Worker` ID和打印消息的顺序。我们可以从消息中看到这段代码是如何工作的：`Worker`实例0和3得到了前两个请求。服务器在第二个连接后停止接受连接，`ThreadPool`上的`Drop`实现甚至在`Worker` 3开始其作业之前就开始执行。丢弃`sender`会断开所有`Worker`实例的连接并告诉它们关闭。每个`Worker`在断开连接时都会打印一条消息，然后线程池调用`join`等待每个`Worker`线程完成。

注意这个特定执行的一个有趣方面：`ThreadPool`丢弃了`sender`，在任何`Worker`收到错误之前，我们尝试连接`Worker` 0。`Worker` 0还没有从`recv`得到错误，所以主线程阻塞等待`Worker` 0完成。与此同时，`Worker` 3收到了一个作业，然后所有线程都收到了错误。当`Worker` 0完成时，主线程等待其余的`Worker`实例完成。此时，它们都已经退出了循环并停止了。

恭喜！我们现在已经完成了我们的项目；我们有一个使用线程池异步响应的基本web服务器。我们能够执行服务器的优雅关闭，这会清理池中的所有线程。

这是完整的代码以供参考：

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

    for stream in listener.incoming().take(2) {
        let stream = stream.unwrap();

        pool.execute(|| {
            handle_connection(stream);
        });
    }

    println!("Shutting down.");
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

文件名：src/lib.rs：

```rust
use std::{
    sync::{Arc, Mutex, mpsc},
    thread,
};

pub struct ThreadPool {
    workers: Vec<Worker>,
    sender: Option<mpsc::Sender<Job>>,
}

type Job = Box<dyn FnOnce() + Send + 'static>;

impl ThreadPool {
    /// Create a new ThreadPool.
    ///
    /// The size is the number of threads in the pool.
    ///
    /// # Panics
    ///
    /// The `new` function will panic if the size is zero.
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
            sender: Some(sender),
        }
    }

    pub fn execute<F>(&self, f: F)
    where
        F: FnOnce() + Send + 'static,
    {
        let job = Box::new(f);

        self.sender.as_ref().unwrap().send(job).unwrap();
    }
}

impl Drop for ThreadPool {
    fn drop(&mut self) {
        drop(self.sender.take());

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
    fn new(id: usize, receiver: Arc<Mutex<mpsc::Receiver<Job>>>) -> Worker {
        let thread = thread::spawn(move || {
            loop {
                let message = receiver.lock().unwrap().recv();

                match message {
                    Ok(job) => {
                        println!("Worker {id} got a job; executing.");

                        job();
                    }
                    Err(_) => {
                        println!("Worker {id} disconnected; shutting down.");
                        break;
                    }
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

我们可以在这里做更多！如果你想继续增强这个项目，这里有一些想法：

* 为`ThreadPool`及其公共方法添加更多文档。
* 添加库功能的测试。
* 将对`unwrap`的调用更改为更强大的错误处理。
* 使用`ThreadPool`执行除了服务web请求之外的其他任务。
* 在[crates.io](https://crates.io/)上找一个线程池crate，用该crate实现类似的web服务器。然后将其API和健壮性与我们实现的线程池进行比较。

## 总结

干得好！你已经完成了本文档！我们要感谢你加入我们的Rust之旅。你现在已经准备好实现自己的Rust项目并帮助其他人的项目。请记住，有一个热情的Rustaceans社区，他们很乐意帮助你解决在Rust旅程中遇到的任何挑战。