## 使用消息传递在线程间传输数据

确保安全并发的一种日益流行的方法是消息传递，其中线程或行为体通过相互发送包含数据的消息来通信。这个想法在[Go语言文档](https://golang.org/doc/effective_go.html#concurrency)中有一句口号："不要通过共享内存来通信；而是通过通信来共享内存。"

为了实现消息发送并发，Rust的标准库提供了通道的实现。通道是一个通用的编程概念，通过它可以将数据从一个线程发送到另一个线程。

你可以把编程中的通道想象成一个有方向的水道，比如溪流或河流。如果你把橡皮鸭放入河流，它会顺流而下到达水道的尽头。

通道有两个部分：发送端和接收端。发送端是上游位置，你在那里把橡皮鸭放入河流，接收端是橡皮鸭最终到达的下游位置。你的代码的一部分调用发送端的方法发送你想发送的数据，另一部分检查接收端是否有到达的消息。如果发送端或接收端任一部分被丢弃，通道就被认为是关闭的。

在这里，我们将逐步构建一个程序，它有一个线程生成值并通过通道发送，另一个线程接收这些值并打印出来。我们将使用通道在线程之间发送简单的值来说明这个特性。一旦你熟悉了这种技术，你就可以为任何需要相互通信的线程使用通道，比如聊天系统或者许多线程执行计算的一部分并将这些部分发送给一个汇总结果的线程的系统。

首先，在示例16-6中，我们将创建一个通道，但不对它做任何操作。注意，这还不能编译，因为Rust无法确定我们想通过通道发送什么类型的值。

文件名：src/main.rs：

```rust
use std::sync::mpsc;

fn main() {
    let (tx, rx) = mpsc::channel();
}
```

示例16-6：创建一个通道并将两个部分分配给`tx`和`rx`

我们使用`mpsc::channel`函数创建一个新的通道；`mpsc`代表多生产者，单消费者（multiple producer, single consumer）。简而言之，Rust标准库实现通道的方式意味着一个通道可以有多个发送端产生值，但只有一个接收端消费这些值。想象多条溪流汇聚成一条大河：任何溪流中发送的东西最终都会在河的尽头汇合。我们现在先从单个生产者开始，但当这个例子运行起来后，我们会添加多个生产者。

`mpsc::channel`函数返回一个元组，其中第一个元素是发送端——发送器，第二个元素是接收端——接收器。缩写`tx`和`rx`在许多领域中传统上分别用于发送器和接收器，所以我们将变量命名为这样以表示每个端。我们使用带有解构元组的模式的`let`语句；我们将在第19章讨论`let`语句中的模式使用和解构。现在，只需知道以这种方式使用`let`语句是提取`mpsc::channel`返回的元组片段的便捷方法。

让我们将发送端移动到一个生成的线程中，并让它发送一个字符串，这样生成的线程就可以与主线程通信，如示例16-7所示。这就像在上游河流中放入一个橡皮鸭或从一个线程向另一个线程发送聊天消息。

文件名：src/main.rs：

```rust
use std::sync::mpsc;
use std::thread;

fn main() {
    let (tx, rx) = mpsc::channel();

    thread::spawn(move || {
        let val = String::from("hi");
        tx.send(val).unwrap();
    });
}
```

示例16-7：将`tx`移动到一个生成的线程并发送`"hi"`

同样，我们使用`thread::spawn`创建一个新线程，然后使用`move`将`tx`移动到闭包中，这样生成的线程就拥有了`tx`。生成的线程需要拥有发送器才能通过通道发送消息。

发送器有一个`send`方法，它接收我们想要发送的值。`send`方法返回一个`Result<T, E>`类型，所以如果接收端已经被丢弃，没有地方可以发送值，发送操作将返回一个错误。在这个例子中，我们调用`unwrap`在出现错误时触发panic。但在实际应用中，我们会正确处理它：回到第9章复习适当的错误处理策略。

在示例16-8中，我们将在主线程中从接收器获取值。这就像从河流尽头的水中取回橡皮鸭或接收聊天消息。

文件名：src/main.rs：

```rust
use std::sync::mpsc;
use std::thread;

fn main() {
    let (tx, rx) = mpsc::channel();

    thread::spawn(move || {
        let val = String::from("hi");
        tx.send(val).unwrap();
    });

    let received = rx.recv().unwrap();
    println!("Got: {received}");
}
```

示例16-8：在主线程中接收值`"hi"`并打印它

接收器有两个有用的方法：`recv`和`try_recv`。我们使用的是`recv`，即receive的缩写，它会阻塞主线程的执行并等待，直到有值通过通道发送过来。一旦值被发送，`recv`将在`Result<T, E>`中返回它。当发送器关闭时，`recv`将返回一个错误，表示不会再有值到来。

`try_recv`方法不会阻塞，而是立即返回一个`Result<T, E>`：如果有消息可用，则返回包含消息的`Ok`值，如果这次没有任何消息，则返回`Err`值。如果这个线程在等待消息时有其他工作要做，使用`try_recv`是有用的：我们可以编写一个循环，每隔一段时间调用`try_recv`，如果有消息可用就处理它，否则做一段时间的其他工作，然后再次检查。

在这个例子中，我们为了简单起见使用了`recv`；主线程除了等待消息外没有其他工作要做，所以阻塞主线程是合适的。

当我们运行示例16-8中的代码时，我们将看到从主线程打印出的值：

```rust
Got: hi
```

完美！

### 通道和所有权转移

所有权规则在消息发送中起着至关重要的作用，因为它们帮助你编写安全的并发代码。在整个Rust程序中考虑所有权的优势是防止并发编程中的错误。让我们做一个实验，展示通道和所有权如何一起工作来防止问题：我们将尝试在将`val`值发送到通道后在生成的线程中使用它。尝试编译示例16-9中的代码，看看为什么不允许这样做。

文件名：src/main.rs：

```rust
use std::sync::mpsc;
use std::thread;

fn main() {
    let (tx, rx) = mpsc::channel();

    thread::spawn(move || {
        let val = String::from("hi");
        tx.send(val).unwrap();
        println!("val is {val}");
    });

    let received = rx.recv().unwrap();
    println!("Got: {received}");
}
```

示例16-9：尝试在将`val`发送到通道后使用它

在这里，我们尝试在通过`tx.send`将`val`发送到通道后打印它。允许这样做将是一个坏主意：一旦值被发送到另一个线程，该线程可能会在我们再次尝试使用该值之前修改或丢弃它。潜在地，另一个线程的修改可能会由于不一致或不存在的数据而导致错误或意外结果。然而，如果我们尝试编译示例16-9中的代码，Rust会给我们一个错误：

```rust
$ cargo run
   Compiling message-passing v0.1.0 (file:///projects/message-passing)
error[E0382]: borrow of moved value: `val`
  --> src/main.rs:10:26
   |
8  |         let val = String::from("hi");
   |             --- move occurs because `val` has type `String`, which does not implement the `Copy` trait
9  |         tx.send(val).unwrap();
   |                 --- value moved here
10 |         println!("val is {val}");
   |                          ^^^^^ value borrowed here after move
   |
   = note: this error originates in the macro `$crate::format_args_nl` which comes from the expansion of the macro `println` (in Nightly builds, run with -Z macro-backtrace for more info)

For more information about this error, try `rustc --explain E0382`.
error: could not compile `message-passing` (bin "message-passing") due to 1 previous error
```

我们的并发错误导致了编译时错误。`send`函数获取其参数的所有权，当值被移动时，接收者获取它的所有权。这阻止我们在发送值后意外地再次使用它；所有权系统检查一切是否正常。

### 发送多个值并观察接收者等待

示例16-8中的代码编译并运行了，但它没有清楚地显示两个独立的线程通过通道相互通信。在示例16-10中，我们做了一些修改，证明示例16-8中的代码是并发运行的：生成的线程现在将发送多个消息，并在每个消息之间暂停一秒钟。

文件名：src/main.rs：

```rust
use std::sync::mpsc;
use std::thread;
use std::time::Duration;

fn main() {
    let (tx, rx) = mpsc::channel();

    thread::spawn(move || {
        let vals = vec![
            String::from("hi"),
            String::from("from"),
            String::from("the"),
            String::from("thread"),
        ];

        for val in vals {
            tx.send(val).unwrap();
            thread::sleep(Duration::from_secs(1));
        }
    });

    for received in rx {
        println!("Got: {received}");
    }
}
```

示例16-10：发送多个消息并在每个消息之间暂停

这次，生成的线程有一个我们想要发送到主线程的字符串向量。我们遍历它们，单独发送每一个，并通过调用带有一秒钟`Duration`值的`thread::sleep`函数在每个之间暂停。

在主线程中，我们不再显式调用`recv`函数：相反，我们将`rx`视为一个迭代器。对于每个接收到的值，我们都会打印它。当通道关闭时，迭代将结束。

当运行示例16-10中的代码时，你应该看到以下输出，每行之间有一秒钟的暂停：

```rust
Got: hi
Got: from
Got: the
Got: thread
```

因为我们在主线程的`for`循环中没有任何暂停或延迟的代码，我们可以看出主线程正在等待从生成的线程接收值。

### 通过克隆发送者创建多个生产者

早些时候我们提到`mpsc`是多生产者、单消费者的缩写。让我们使用`mpsc`并扩展示例16-10中的代码，创建多个线程，它们都向同一个接收者发送值。我们可以通过克隆发送者来做到这一点，如示例16-11所示。

文件名：src/main.rs：

```rust
use std::sync::mpsc;
use std::thread;
use std::time::Duration;

fn main() {
    let (tx, rx) = mpsc::channel();

    let tx1 = tx.clone();
    thread::spawn(move || {
        let vals = vec![
            String::from("hi"),
            String::from("from"),
            String::from("the"),
            String::from("thread"),
        ];

        for val in vals {
            tx1.send(val).unwrap();
            thread::sleep(Duration::from_secs(1));
        }
    });

    thread::spawn(move || {
        let vals = vec![
            String::from("more"),
            String::from("messages"),
            String::from("for"),
            String::from("you"),
        ];

        for val in vals {
            tx.send(val).unwrap();
            thread::sleep(Duration::from_secs(1));
        }
    });

    for received in rx {
        println!("Got: {received}");
    }
}
```

示例16-11：从多个生产者发送多个消息

这次，在我们创建第一个生成的线程之前，我们对发送者调用`clone`。这将给我们一个新的发送者，我们可以将其传递给第一个生成的线程。我们将原始发送者传递给第二个生成的线程。这给我们两个线程，每个线程向一个接收者发送不同的消息。

当你运行代码时，你的输出应该看起来像这样：

```rust
Got: hi
Got: more
Got: from
Got: messages
Got: for
Got: the
Got: thread
Got: you
```

你可能会看到不同顺序的值，这取决于你的系统。这就是并发既有趣又困难的原因。如果你尝试使用`thread::sleep`，在不同的线程中给它不同的值，每次运行将更加不确定，并且每次都会产生不同的输出。

现在我们已经了解了通道如何工作，让我们看看另一种并发方法。