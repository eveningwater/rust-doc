## 应用异步并发

在本节中，我们将把异步应用到我们在第 16 章中使用线程解决的一些相同并发挑战中。因为我们已经讨论了很多关键思想，所以本节我们将重点关注线程和 Future 之间的区别。

在许多情况下，使用异步处理并发的 API 与使用线程的 API 非常相似。在其他情况下，它们最终会大相径庭。即使 API 在线程和异步之间看起来相似，它们通常也具有不同的行为——而且它们几乎总是具有不同的性能特征。

### 使用 `spawn_task` 创建新任务

我们在[使用 `spawn` 创建新线程](https://doc.rust-lang.org/book/ch16-01-threads.html#creating-a-new-thread-with-spawn)中解决的第一个操作是在两个单独的线程上计数。让我们使用异步来做同样的事情。`trpl` crate 提供了一个 `spawn_task` 函数，它看起来与 `thread::spawn` API 非常相似，还有一个 `sleep` 函数，它是 `thread::sleep` API 的异步版本。我们可以将它们一起使用来实现计数示例，如示例 17-6 所示。

Filename: src/main.rs:

```rust
extern crate trpl; // required for mdbook test

use std::time::Duration;

fn main() {
    trpl::run(async {
        trpl::spawn_task(async {
            for i in 1..10 {
                println!("hi number {i} from the first task!");
                trpl::sleep(Duration::from_millis(500)).await;
            }
        });

        for i in 1..5 {
            println!("hi number {i} from the second task!");
            trpl::sleep(Duration::from_millis(500)).await;
        }
    });
}
```

示例 17-6：创建一个新任务，在主任务打印其他内容时打印一个内容

作为起点，我们使用 `trpl::run` 设置了 `main` 函数，以便我们的顶级函数可以是异步的。

> 注意：从本章的这一点开始，每个示例都将包含与 `main` 中的 `trpl::run` 完全相同的包装代码，因此我们通常会像处理 `main` 一样跳过它。不要忘记将其包含在您的代码中！

然后我们在此块中编写两个循环，每个循环都包含一个 `trpl::sleep` 调用，该调用会等待半秒（500 毫秒）然后发送下一条消息。我们将一个循环放在 `trpl::spawn_task` 的主体中，另一个放在顶层 `for` 循环中。我们还在 `sleep` 调用后添加了一个 `await`。

此代码的行为类似于基于线程的实现——包括您在自己的终端中运行它时可能会看到消息以不同顺序出现的事实：

```rust
hi number 1 from the second task!
hi number 1 from the first task!
hi number 2 from the first task!
hi number 2 from the second task!
hi number 3 from the first task!
hi number 3 from the second task!
hi number 4 from the first task!
hi number 4 from the second task!
hi number 5 from the first task!
```

此版本在主异步块中的 `for` 循环一结束就停止，因为 `spawn_task` 派生的任务在 `main` 函数结束时被关闭。如果您希望它一直运行直到任务完成，您将需要使用一个 `join` 句柄来等待第一个任务完成。对于线程，我们使用 `join` 方法“阻塞”直到线程运行完成。在示例 17-7 中，我们可以使用 `await` 来做同样的事情，因为任务句柄本身就是一个 `Future`。它的 `Output` 类型是 `Result`，所以我们在 `await` 它之后也对其进行 `unwrap`。

Filename: src/main.rs:

```rust
extern crate trpl; // required for mdbook test

use std::time::Duration;

fn main() {
    trpl::run(async {
        let handle = trpl::spawn_task(async {
            for i in 1..10 {
                println!("hi number {i} from the first task!");
                trpl::sleep(Duration::from_millis(500)).await;
            }
        });

        for i in 1..5 {
            println!("hi number {i} from the second task!");
            trpl::sleep(Duration::from_millis(500)).await;
        }

        handle.await.unwrap();
    });
}
```

示例 17-7：使用 `await` 和 `join` 句柄来运行任务直到完成

此更新版本会一直运行直到两个循环都完成。

```rust
hi number 1 from the second task!
hi number 1 from the first task!
hi number 2 from the first task!
hi number 2 from the second task!
hi number 3 from the first task!
hi number 3 from the second task!
hi number 4 from the first task!
hi number 4 from the second task!
hi number 5 from the first task!
hi number 6 from the first task!
hi number 7 from the first task!
hi number 8 from the first task!
hi number 9 from the first task!
```

到目前为止，异步和线程似乎给我们带来了相同的结果，只是语法不同：使用 `await` 而不是在 `join` 句柄上调用 `join`，以及 `await` `sleep` 调用。

更大的区别在于我们不需要为此派生另一个操作系统线程。事实上，我们甚至不需要在这里派生一个任务。因为异步块编译为匿名 `Future`，我们可以将每个循环放在一个异步块中，并让运行时使用 `trpl::join` 函数将它们都运行完成。

在[使用 `join` 句柄等待所有线程完成](https://doc.rust-lang.org/book/ch16-01-threads.html#waiting-for-all-threads-to-finish-using-join-handles)一节中，我们展示了如何在调用 `std::thread::spawn` 时返回的 `JoinHandle` 类型上使用 `join` 方法。`trpl::join` 函数类似，但适用于 `Future`。当您给它两个 `Future` 时，它会生成一个新的 `Future`，其输出是一个元组，其中包含您传入的每个 `Future` 完成后的输出。因此，在示例 17-8 中，我们使用 `trpl::join` 来等待 `fut1` 和 `fut2` 都完成。我们不 `await` `fut1` 和 `fut2`，而是 `await` `trpl::join` 生成的新 `Future`。我们忽略输出，因为它只是一个包含两个单元值的元组。

Filename: src/main.rs:

```rust
extern crate trpl; // required for mdbook test

use std::time::Duration;

fn main() {
    trpl::run(async {
        let fut1 = async {
            for i in 1..10 {
                println!("hi number {i} from the first task!");
                trpl::sleep(Duration::from_millis(500)).await;
            }
        };

        let fut2 = async {
            for i in 1..5 {
                println!("hi number {i} from the second task!");
                trpl::sleep(Duration::from_millis(500)).await;
            }
        };

        trpl::join(fut1, fut2).await;
    });
}
```

示例 17-8：使用 `trpl::join` 等待两个匿名 `Future`

当我们运行它时，我们看到两个 `Future` 都运行完成：

```rust
hi number 1 from the first task!
hi number 1 from the second task!
hi number 2 from the first task!
hi number 2 from the second task!
hi number 3 from the first task!
hi number 3 from the second task!
hi number 4 from the first task!
hi number 4 from the second task!
hi number 5 from the first task!
hi number 6 from the first task!
hi number 7 from the first task!
hi number 8 from the first task!
hi number 9 from the first task!
```

现在，您每次都会看到完全相同的顺序，这与我们使用线程时看到的非常不同。这是因为 `trpl::join` 函数是公平的，这意味着它会平等地检查每个 `Future`，在它们之间交替，并且如果另一个 `Future` 准备就绪，它绝不会让一个 `Future` 领先。对于线程，操作系统决定检查哪个线程以及让它运行多长时间。对于异步 Rust，运行时决定检查哪个任务。（实际上，细节变得复杂，因为异步运行时可能会在底层使用操作系统线程作为其管理并发的一部分，因此保证公平性对于运行时来说可能需要更多的工作——但仍然是可能的！）运行时不必保证任何给定操作的公平性，它们通常提供不同的 API，让您选择是否需要公平性。

尝试以下这些等待 `Future` 的变体，看看它们会做什么：

* 移除一个或两个循环周围的异步块。
* 在定义每个异步块后立即等待它。
* 只将第一个循环包装在一个异步块中，并在第二个循环的主体之后等待生成的 `Future`。

对于额外的挑战，看看您是否能在运行代码之前弄清楚每种情况下的输出会是什么！

### 使用消息传递在两个任务上计数

`Future` 之间的数据共享也会很熟悉：我们将再次使用消息传递，但这次使用异步版本的类型和函数。我们将采取与[使用消息传递在线程之间传输数据](https://doc.rust-lang.org/book/ch16-02-message-passing.html)中略有不同的路径，以说明基于线程和基于 `Future` 的并发之间的一些关键区别。在示例 17-9 中，我们将从一个单独的异步块开始——而不是像我们派生单独线程那样派生一个单独的任务。

Filename: src/main.rs:

```rust
extern crate trpl; // required for mdbook test

fn main() {
    trpl::run(async {
        let (tx, mut rx) = trpl::channel();

        let val = String::from("hi");
        tx.send(val).unwrap();

        let received = rx.recv().await.unwrap();
        println!("Got: {received}");
    });
}
```

示例 17-9：创建一个异步通道并将两半分配给 `tx` 和 `rx`

在这里，我们使用 `trpl::channel`，它是我们在第 16 章中使用线程的多生产者、单消费者通道 API 的异步版本。该 API 的异步版本与基于线程的版本只有一点不同：它使用可变而不是不可变的接收器 `rx`，并且其 `recv` 方法会生成一个我们需要 `await` 的 `Future`，而不是直接生成值。现在我们可以从发送方向接收方发送消息。请注意，我们不必派生单独的线程甚至任务；我们只需要 `await` `rx.recv` 调用。

`std::mpsc::channel` 中的同步 `Receiver::recv` 方法会阻塞直到收到消息。`trpl::Receiver::recv` 方法不会，因为它是一个异步方法。它不会阻塞，而是将控制权交还给运行时，直到收到消息或通道的发送端关闭。相比之下，我们不 `await` `send` 调用，因为它不会阻塞。它不需要阻塞，因为我们发送到的通道是无界的。

> 注意：由于所有这些异步代码都在 `trpl::run` 调用中的异步块中运行，因此其中的所有内容都可以避免阻塞。但是，外部代码将阻塞在 `run` 函数返回上。这就是 `trpl::run` 函数的全部意义：它允许您选择在何处阻塞一组异步代码，从而在同步和异步代码之间进行转换。在大多数异步运行时中，`run` 实际上因此被称为 `block_on`。

请注意此示例中的两件事。首先，消息会立即到达。其次，尽管我们在这里使用了一个 `Future`，但还没有并发。示例中的所有内容都按顺序发生，就像没有 `Future` 参与一样。

让我们通过发送一系列消息并在它们之间休眠来解决第一部分，如示例 17-10 所示。

文件名：src/main.rs：

```rust
extern crate trpl; // required for mdbook test

use std::time::Duration;

fn main() {
    trpl::run(async {
        let (tx, mut rx) = trpl::channel();

        let vals = vec![
            String::from("hi"),
            String::from("from"),
            String::from("the"),
            String::from("future"),
        ];

        for val in vals {
            tx.send(val).unwrap();
            trpl::sleep(Duration::from_millis(500)).await;
        }

        while let Some(value) = rx.recv().await {
            println!("received '{value}'");
        }
    });
}
```

示例 17-10：通过异步通道发送和接收多条消息，并在每条消息之间使用 await 休眠

除了发送消息，我们还需要接收它们。在这种情况下，因为我们知道有多少消息会进来，我们可以通过手动调用 `rx.recv().await` 四次来完成。然而，在实际情况中，我们通常会等待一些未知数量的消息，所以我们需要持续等待，直到我们确定没有更多消息。

我们可以使用 `while let` 循环来做到这一点，如示例 17-11 所示。

In Listing 16-10, we used a for loop to process all the items received from a synchronous channel. Rust doesn’t yet have a way to write a for loop over an asynchronous series of items, however, so we need to use a loop we haven’t seen before: the while let conditional loop. This is the loop version of the if let construct we saw back in the section [Concise Control Flow with if let and let else](https://doc.rust-lang.org/book/ch06-03-if-let.html). The loop will continue executing as long as the pattern it specifies continues to match the value.

`rx.recv` 调用会产生一个 `Future`，我们对其进行 `await`。运行时会暂停该 `Future` 直到它准备就绪。一旦消息到达，该 `Future` 将解析为 `Some(message)`，消息到达多少次就解析多少次。当通道关闭时，无论是否有消息到达，该 `Future` 都将解析为 `None`，表示没有更多值，因此我们应该停止轮询——即停止 `await`。

`while let` 循环将所有这些结合在一起。如果调用 `rx.recv().await` 的结果是 `Some(message)`，我们就可以访问该消息并在循环体中使用它，就像使用 `if let` 一样。如果结果是 `None`，循环就结束。每次循环完成时，它都会再次到达 `await` 点，因此运行时会再次暂停它，直到另一条消息到达。

现在代码成功发送和接收所有消息。不幸的是，仍然存在一些问题。首先，消息不是以半秒的间隔到达的。它们在程序启动 2 秒（2000 毫秒）后一次性全部到达。其次，这个程序永远不会退出！相反，它会永远等待新消息。您需要使用 `ctrl-c` 关闭它。

让我们开始研究为什么消息会在完全延迟后一次性全部到达，而不是在每条消息之间都有延迟。在给定的异步块中，`await` 关键字出现的顺序也是它们在程序运行时执行的顺序。

示例 17-10 中只有一个异步块，所以其中的所有内容都是线性运行的。仍然没有并发。所有的 `tx.send` 调用都会发生，其间穿插着所有的 `trpl::sleep` 调用及其相关的 `await` 点。只有这样，`while let` 循环才能通过 `recv` 调用上的任何 `await` 点。

为了获得我们想要的行为，即在每条消息之间发生休眠延迟，我们需要将 `tx` 和 `rx` 操作放在它们自己的异步块中，如示例 17-11 所示。然后运行时可以使用 `trpl::join` 分别执行它们，就像计数示例中一样。我们再次 `await` 调用 `trpl::join` 的结果，而不是单独的 `Future`。如果按顺序 `await` 单独的 `Future`，我们最终只会回到顺序流中——这正是我们试图避免的。

Filename: src/main.rs:

```rust
extern crate trpl; // required for mdbook test

use std::time::Duration;

fn main() {
    trpl::run(async {
        let (tx, mut rx) = trpl::channel();

        let tx_fut = async {
            let vals = vec![
                String::from("hi"),
                String::from("from"),
                String::from("the"),
                String::from("future"),
            ];

            for val in vals {
                tx.send(val).unwrap();
                trpl::sleep(Duration::from_millis(500)).await;
            }
        };

        let rx_fut = async {
            while let Some(value) = rx.recv().await {
                println!("received '{value}'");
            }
        };

        trpl::join(tx_fut, rx_fut).await;
    });
}
```

示例 17-11：将发送和接收分离到它们自己的异步块中，并 `await` 这些块的 `Future`

使用示例 17-11 中更新的代码，消息会以 500 毫秒的间隔打印，而不是在 2 秒后一股脑地全部打印出来。

然而，程序仍然不会退出，这是因为 `while let` 循环与 `trpl::join` 的交互方式：

* `trpl::join` 返回的 `Future` 只有在传递给它的两个 `Future` 都完成后才会完成。
* `tx` `Future` 在发送 `vals` 中的最后一条消息并休眠结束后完成。
* `rx` `Future` 不会完成，直到 `while let` 循环结束。
* `while let` 循环不会结束，直到 `await` `rx.recv` 产生 `None`。
* `await` `rx.recv` 只有在通道的另一端关闭后才会返回 `None`。
* 通道只有在我们调用 `rx.close` 或发送端 `tx` 被丢弃时才会关闭。
* 我们没有在任何地方调用 `rx.close`，并且 `tx` 不会在传递给 `trpl::run` 的最外层异步块结束之前被丢弃。
* 该块无法结束，因为它被 `trpl::join` 的完成所阻塞，这又将我们带回了此列表的顶部。

我们可以手动关闭 `rx`，通过在某个地方调用 `rx.close`，但这没有多大意义。在处理完任意数量的消息后停止会使程序关闭，但我们可能会错过消息。我们需要其他方法来确保 `tx` 在函数结束之前被丢弃。

现在，我们发送消息的异步块只借用了 `tx`，因为发送消息不需要所有权，但如果我们可以将 `tx` 移动到该异步块中，那么一旦该块结束，它就会被丢弃。在第 13 章的[捕获引用或移动所有权](https://doc.rust-lang.org/book/ch13-01-closures.html#capturing-references-or-moving-ownership)一节中，您学习了如何在闭包中使用 `move` 关键字，并且，正如第 16 章的[将 `move` 闭包与线程一起使用](https://doc.rust-lang.org/book/ch16-01-threads.html#using-move-closures-with-threads)一节中所讨论的，在使用线程时，我们经常需要将数据移动到闭包中。同样的基本动态也适用于异步块，因此 `move` 关键字在异步块中的工作方式与在闭包中相同。

在示例 17-12 中，我们将用于发送消息的块从 `async` 更改为 `async move`。当我们运行此版本的代码时，它会在发送和接收完最后一条消息后优雅地关闭。

Filename: src/main.rs:

```rust
extern crate trpl; // required for mdbook test

use std::time::Duration;

fn main() {
    trpl::run(async {
        let (tx, mut rx) = trpl::channel();

        let tx_fut = async move {
            let vals = vec![
                String::from("hi"),
                String::from("from"),
                String::from("the"),
                String::from("future"),
            ];

            for val in vals {
                tx.send(val).unwrap();
                trpl::sleep(Duration::from_millis(500)).await;
            }
        };

        let rx_fut = async {
            while let Some(value) = rx.recv().await {
                println!("received '{value}'");
            }
        };

        trpl::join(tx_fut, rx_fut).await;
    });
}
```

示例 17-12：示例 17-11 代码的修订版，完成后正确关闭

这个异步通道也是一个多生产者通道，所以如果我们想从多个 `Future` 发送消息，我们可以在 `tx` 上调用 `clone`，如示例 17-13 所示。

文件名：src/main.rs：

```rust
extern crate trpl; // required for mdbook test

use std::time::Duration;

fn main() {
    trpl::run(async {
        let (tx, mut rx) = trpl::channel();

        let tx1 = tx.clone();
        let tx1_fut = async move {
            let vals = vec![
                String::from("hi"),
                String::from("from"),
                String::from("the"),
                String::from("future"),
            ];

            for val in vals {
                tx1.send(val).unwrap();
                trpl::sleep(Duration::from_millis(500)).await;
            }
        };

        let rx_fut = async {
            while let Some(value) = rx.recv().await {
                println!("received '{value}'");
            }
        };

        let tx_fut = async move {
            let vals = vec![
                String::from("more"),
                String::from("messages"),
                String::from("for"),
                String::from("you"),
            ];

            for val in vals {
                tx.send(val).unwrap();
                trpl::sleep(Duration::from_millis(1500)).await;
            }
        };

        trpl::join3(tx1_fut, tx_fut, rx_fut).await;
    });
}
```

示例 17-13：使用异步块的多个生产者

首先，我们克隆 `tx`，在第一个异步块之外创建 `tx1`。我们将 `tx1` 移动到该块中，就像我们之前对 `tx` 所做的那样。然后，我们稍后将原始 `tx` 移动到一个新的异步块中，在那里我们以稍慢的延迟发送更多消息。我们碰巧将这个新的异步块放在接收消息的异步块之后，但它也可以放在它之前。关键是 `Future` 被 `await` 的顺序，而不是它们被创建的顺序。

两个用于发送消息的异步块都需要是 `async move` 块，以便 `tx` 和 `tx1` 在这些块完成时都被丢弃。否则，我们将回到我们开始的无限循环中。最后，我们从 `trpl::join` 切换到 `trpl::join3` 来处理额外的 `Future`。

现在我们看到了来自两个发送 `Future` 的所有消息，并且由于发送 `Future` 在发送后使用了稍微不同的延迟，因此消息也以这些不同的间隔接收。

```rust
received 'hi'
received 'more'
received 'from'
received 'the'
received 'messages'
received 'future'
received 'for'
received 'you'
```

这是一个好的开始，但它将我们限制在少数几个 `Future`：两个使用 `join`，或者三个使用 `join3`。让我们看看如何处理更多的 `Future`。