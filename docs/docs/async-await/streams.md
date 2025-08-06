## 流：按顺序排列的 Future

到目前为止，在本章中，我们主要关注单个 future。一个主要的例外是我们使用的异步通道。回想一下我们如何在本章前面 [“消息传递”](https://doc.rust-lang.org/book/ch17-02-concurrency-with-async.html#message-passing) 部分中使用异步通道的接收器。异步 `recv` 方法会随着时间的推移生成一系列项。这是一个更通用模式的实例，称为流。

我们在第 13 章中看到了项的序列，当时我们查看了 [迭代器 trait 和 `next` 方法](https://doc.rust-lang.org/book/ch13-02-iterators.html#the-iterator-trait-and-the-next-method) 部分中的 `Iterator` trait，但迭代器和异步通道接收器之间有两个区别。第一个区别是时间：迭代器是同步的，而通道接收器是异步的。第二个是 API。当直接使用 `Iterator` 时，我们调用其同步的 `next` 方法。特别是对于 `trpl::Receiver` 流，我们调用了异步的 `recv` 方法。否则，这些 API 感觉非常相似，这种相似性并非巧合。流就像迭代的异步形式。然而，`trpl::Receiver` 特别等待接收消息，而通用流 API 则更广泛：它以 `Iterator` 的方式提供下一个项，但以异步方式。

Rust 中迭代器和流的相似性意味着我们实际上可以从任何迭代器创建流。与迭代器一样，我们可以通过调用其 `next` 方法并等待输出来使用流，如示例 17-30 所示。

文件名: src/main.rs:

```rust
extern crate trpl; // required for mdbook test

fn main() {
    trpl::run(async {
        let values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        let iter = values.iter().map(|n| n * 2);
        let mut stream = trpl::stream_from_iter(iter);

        while let Some(value) = stream.next().await {
            println!("The value was: {value}");
        }
    });
}
```

示例 17-30：从迭代器创建流并打印其值

我们从一个数字数组开始，将其转换为迭代器，然后调用 `map` 来将所有值加倍。然后我们使用 `trpl::stream_from_iter` 函数将迭代器转换为流。接下来，我们使用 `while let` 循环遍历流中到达的项。

不幸的是，当我们尝试运行代码时，它无法编译，而是报告没有可用的 `next` 方法：

```rust
error[E0599]: no method named `next` found for struct `Iter` in the current scope
  --> src/main.rs:10:40
   |
10 |         while let Some(value) = stream.next().await {
   |                                        ^^^^
   |
   = note: the full type name has been written to 'file:///projects/async-await/target/debug/deps/async_await-575db3dd3197d257.long-type-14490787947592691573.txt'
   = note: consider using `--verbose` to print the full type name to the console
   = help: items from traits can only be used if the trait is in scope
help: the following traits which provide `next` are implemented but not in scope; perhaps you want to import one of them
   |
1  + use crate::trpl::StreamExt;
   |
1  + use futures_util::stream::stream::StreamExt;
   |
1  + use std::iter::Iterator;
   |
1  + use std::str::pattern::Searcher;
   |
help: there is a method `try_next` with a similar name
   |
10 |         while let Some(value) = stream.try_next().await {
   |                                        ~~~~~~~~
```

正如这个输出所解释的，编译器错误的原因是我们需要在作用域中引入正确的 trait 才能使用 `next` 方法。根据我们目前的讨论，你可能会合理地认为这个 trait 是 `Stream`，但它实际上是 `StreamExt`。`Ext` 是 `extension` 的缩写，是 Rust 社区中用于通过另一个 trait 扩展一个 trait 的常见模式。

我们将在本章末尾更详细地解释 `Stream` 和 `StreamExt` trait，但现在你需要知道的是，`Stream` trait 定义了一个低级接口，它有效地结合了 `Iterator` 和 `Future` trait。`StreamExt` 在 `Stream` 之上提供了一组更高级的 API，包括 `next` 方法以及其他类似于 `Iterator` trait 提供的实用方法。`Stream` 和 `StreamExt` 尚未成为 Rust 标准库的一部分，但大多数生态系统 crate 都使用相同的定义。

编译器错误的修复方法是添加 `trpl::StreamExt` 的 `use` 语句，如示例 17-31 所示。

文件名: src/main.rs:

```rust
extern crate trpl; // required for mdbook test

use trpl::StreamExt;

fn main() {
    trpl::run(async {
        let values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        let iter = values.iter().map(|n| n * 2);
        let mut stream = trpl::stream_from_iter(iter);

        while let Some(value) = stream.next().await {
            println!("The value was: {value}");
        }
    });
}
```

示例 17-31：成功地将迭代器用作流的基础

将所有这些部分组合在一起，这段代码就能按我们想要的方式工作了！更重要的是，现在 `StreamExt` 在作用域中，我们可以使用它的所有实用方法，就像使用迭代器一样。例如，在示例 17-32 中，我们使用 `filter` 方法过滤掉除了 3 和 5 的倍数之外的所有内容。

文件名: src/main.rs:

```rust
extern crate trpl; // required for mdbook test

use trpl::StreamExt;

fn main() {
    trpl::run(async {
        let values = 1..101;
        let iter = values.map(|n| n * 2);
        let stream = trpl::stream_from_iter(iter);

        let mut filtered =
            stream.filter(|value| value % 3 == 0 || value % 5 == 0);

        while let Some(value) = filtered.next().await {
            println!("The value was: {value}");
        }
    });
}
```

示例 17-32：使用 `StreamExt::filter` 方法过滤流

当然，这并不是很有趣，因为我们可以用普通的迭代器做同样的事情，而且根本不需要异步。让我们看看流独有的功能。

## 组合流

许多概念自然地表示为流：队列中可用的项、当完整数据集对于计算机内存来说太大时从文件系统增量拉取的数据块，或者随时间通过网络到达的数据。因为流是 future，我们可以将它们与任何其他类型的 future 一起使用，并以有趣的方式组合它们。例如，我们可以批量处理事件以避免触发过多的网络调用，对一系列长时间运行的操作设置超时，或者限制用户界面事件以避免做不必要的工作。

让我们首先构建一个小的消息流，作为我们可能从 WebSocket 或其他实时通信协议中看到的数据流的替代，如示例 17-33 所示。

文件名: src/main.rs:

```rust
extern crate trpl; // required for mdbook test

use trpl::{ReceiverStream, Stream, StreamExt};

fn main() {
    trpl::run(async {
        let mut messages = get_messages();

        while let Some(message) = messages.next().await {
            println!("{message}");
        }
    });
}

fn get_messages() -> impl Stream<Item = String> {
    let (tx, rx) = trpl::channel();

    let messages = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"];
    for message in messages {
        tx.send(format!("Message: '{message}'")).unwrap();
    }

    ReceiverStream::new(rx)
}
```

示例 17-33：将 `rx` 接收器用作 `ReceiverStream`

首先，我们创建一个名为 `get_messages` 的函数，它返回 `impl Stream<Item = String>`。为了实现它，我们创建一个异步通道，遍历英文字母的前 10 个字母，并将它们发送到通道中。

我们还使用了一个新类型：`ReceiverStream`，它将 `trpl::channel` 中的 `rx` 接收器转换为具有 `next` 方法的 `Stream`。回到 `main` 中，我们使用 `while let` 循环打印流中的所有消息。

当我们运行这段代码时，我们得到了我们期望的结果：

```rust
Message: 'a'
Message: 'b'
Message: 'c'
Message: 'd'
Message: 'e'
Message: 'f'
Message: 'g'
Message: 'h'
Message: 'i'
Message: 'j'
```

同样，我们可以使用常规的 `Receiver` API 甚至常规的 `Iterator` API 来完成此操作，但是，让我们添加一个需要流的功能：添加一个适用于流中每个项的超时，以及我们发出的项的延迟，如示例 17-34 所示。

文件名: src/main.rs:

```rust
extern crate trpl; // required for mdbook test

use std::{pin::pin, time::Duration};
use trpl::{ReceiverStream, Stream, StreamExt};

fn main() {
    trpl::run(async {
        let mut messages =
            pin!(get_messages().timeout(Duration::from_millis(200)));

        while let Some(result) = messages.next().await {
            match result {
                Ok(message) => println!("{message}"),
                Err(reason) => eprintln!("Problem: {reason:?}"),
            }
        }
    })
}

fn get_messages() -> impl Stream<Item = String> {
    let (tx, rx) = trpl::channel();

    let messages = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"];
    for message in messages {
        tx.send(format!("Message: '{message}'")).unwrap();
    }

    ReceiverStream::new(rx)
}
```

## 示例 17-34：使用 `StreamExt::timeout` 方法设置流中项的时间限制

我们首先使用 `timeout` 方法向流中添加超时，该方法来自 `StreamExt` trait。然后我们更新 `while let` 循环的主体，因为流现在返回一个 `Result`。`Ok` 变体表示消息及时到达；`Err` 变体表示在任何消息到达之前超时已过。我们匹配该结果，并在成功接收到消息时打印消息，或者在超时时打印通知。最后，请注意，我们在对消息应用超时后将其固定，因为超时辅助函数会生成一个需要固定才能轮询的流。

然而，由于消息之间没有延迟，此超时不会改变程序的行为。让我们为发送的消息添加一个可变延迟，如示例 17-35 所示。

文件名: src/main.rs:

```rust
extern crate trpl; // required for mdbook test

use std::{pin::pin, time::Duration};

use trpl::{ReceiverStream, Stream, StreamExt};

fn main() {
    trpl::run(async {
        let mut messages =
            pin!(get_messages().timeout(Duration::from_millis(200)));

        while let Some(result) = messages.next().await {
            match result {
                Ok(message) => println!("{message}"),
                Err(reason) => eprintln!("Problem: {reason:?}"),
            }
        }
    })
}

fn get_messages() -> impl Stream<Item = String> {
    let (tx, rx) = trpl::channel();

    trpl::spawn_task(async move {
        let messages = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"];
        for (index, message) in messages.into_iter().enumerate() {
            let time_to_sleep = if index % 2 == 0 { 100 } else { 300 };
            trpl::sleep(Duration::from_millis(time_to_sleep)).await;

            tx.send(format!("Message: '{message}'")).unwrap();
        }
    });

    ReceiverStream::new(rx)
}
```

## 示例 17-35：通过 `tx` 发送带有异步延迟的消息，而无需将 `get_messages` 设为异步函数

在 `get_messages` 中，我们使用 `enumerate` 迭代器方法与 `messages` 数组，以便我们可以获取每个发送项的索引以及项本身。然后我们对偶数索引项应用 100 毫秒的延迟，对奇数索引项应用 300 毫秒的延迟，以模拟在现实世界中可能从消息流中看到的各种延迟。因为我们的超时是 200 毫秒，所以这应该会影响一半的消息。

为了在 `get_messages` 函数中在不阻塞的情况下在消息之间休眠，我们需要使用 `async`。但是，我们不能将 `get_messages` 本身设为异步函数，因为那样它将返回 `Future<Output = Stream<Item = String>>` 而不是 `Stream<Item = String>>`。调用者必须等待 `get_messages` 本身才能访问流。但请记住：给定 future 中的所有内容都是线性发生的；并发发生在 future 之间。等待 `get_messages` 将要求它发送所有消息，包括每条消息之间的休眠延迟，然后才返回接收器流。因此，超时将毫无用处。流本身不会有任何延迟；它们都会在流可用之前发生。

相反，我们将 `get_messages` 保留为一个返回流的常规函数，并生成一个任务来处理异步休眠调用。

> 注意：以这种方式调用 `spawn_task` 是可行的，因为我们已经设置了运行时；如果不是，它将导致 panic。其他实现选择不同的权衡：它们可能会生成一个新的运行时并避免 panic，但会产生一些额外的开销，或者它们可能根本不提供在不引用运行时的情况下生成任务的独立方式。请确保你知道你的运行时选择了哪种权衡，并相应地编写代码！

现在我们的代码有了更有趣的结果。每隔一对消息之间，都会出现 `Problem: Elapsed(())` 错误。

```rust
Message: 'a'
Problem: Elapsed(())
Message: 'b'
Message: 'c'
Problem: Elapsed(())
Message: 'd'
Message: 'e'
Problem: Elapsed(())
Message: 'f'
Message: 'g'
Problem: Elapsed(())
Message: 'h'
Message: 'i'
Problem: Elapsed(())
Message: 'j'
```

超时并不能阻止消息最终到达。我们仍然会收到所有原始消息，因为我们的通道是无界的：它可以容纳我们内存中能容纳的尽可能多的消息。如果消息在超时之前没有到达，我们的流处理程序会考虑到这一点，但是当它再次轮询流时，消息可能已经到达了。

如果需要，你可以通过使用其他类型的通道或更普遍的其他类型的流来获得不同的行为。让我们通过将时间间隔流与此消息流结合起来，在实践中看看其中一个。

## 合并流

首先，让我们创建另一个流，如果我们直接运行它，它将每毫秒发出一个项。为了简单起见，我们可以使用 `sleep` 函数发送延迟消息，并将其与我们在 `get_messages` 中使用的从通道创建流的相同方法结合起来。不同之处在于，这次我们将返回已过去的时间间隔计数，因此返回类型将是 `impl Stream<Item = u32>`，我们可以调用函数 `get_intervals`（参见示例 17-36）。

文件名: src/main.rs:

```rust
extern crate trpl; // required for mdbook test

use std::{pin::pin, time::Duration};

use trpl::{ReceiverStream, Stream, StreamExt};

fn main() {
    trpl::run(async {
        let mut messages =
            pin!(get_messages().timeout(Duration::from_millis(200)));

        while let Some(result) = messages.next().await {
            match result {
                Ok(message) => println!("{message}"),
                Err(reason) => eprintln!("Problem: {reason:?}"),
            }
        }
    })
}

fn get_messages() -> impl Stream<Item = String> {
    let (tx, rx) = trpl::channel();

    trpl::spawn_task(async move {
        let messages = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"];
        for (index, message) in messages.into_iter().enumerate() {
            let time_to_sleep = if index % 2 == 0 { 100 } else { 300 };
            trpl::sleep(Duration::from_millis(time_to_sleep)).await;

            tx.send(format!("Message: '{message}'")).unwrap();
        }
    });

    ReceiverStream::new(rx)
}

fn get_intervals() -> impl Stream<Item = u32> {
    let (tx, rx) = trpl::channel();

    trpl::spawn_task(async move {
        let mut count = 0;
        loop {
            trpl::sleep(Duration::from_millis(1)).await;
            count += 1;
            tx.send(count).unwrap();
        }
    });

    ReceiverStream::new(rx)
}
```

## 示例 17-36：创建一个流，其中包含一个计数器，该计数器将每毫秒发出一次

我们首先在任务中定义一个计数。（我们也可以在任务外部定义它，但限制任何给定变量的范围会更清晰。）然后我们创建一个无限循环。循环的每次迭代都会异步休眠一毫秒，增加计数，然后通过通道发送。因为这一切都封装在 `spawn_task` 创建的任务中，所以所有这些——包括无限循环——都将随着运行时的清理而清理。

这种无限循环，只有当整个运行时被销毁时才结束，在异步 Rust 中相当常见：许多程序需要无限期地运行。使用异步，这不会阻塞任何其他东西，只要循环的每次迭代中至少有一个 `await` 点。

现在，回到我们 `main` 函数的异步块中，我们可以尝试合并消息流和间隔流，如示例 17-37 所示。

文件名: src/main.rs:

```rust
extern crate trpl; // required for mdbook test

use std::{pin::pin, time::Duration};

use trpl::{ReceiverStream, Stream, StreamExt};

fn main() {
    trpl::run(async {
        let messages = get_messages().timeout(Duration::from_millis(200));
        let intervals = get_intervals();
        let merged = messages.merge(intervals);

        while let Some(result) = merged.next().await {
            match result {
                Ok(message) => println!("{message}"),
                Err(reason) => eprintln!("Problem: {reason:?}"),
            }
        }
    })
}

fn get_messages() -> impl Stream<Item = String> {
    let (tx, rx) = trpl::channel();

    trpl::spawn_task(async move {
        let messages = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"];
        for (index, message) in messages.into_iter().enumerate() {
            let time_to_sleep = if index % 2 == 0 { 100 } else { 300 };
            trpl::sleep(Duration::from_millis(time_to_sleep)).await;

            tx.send(format!("Message: '{message}'")).unwrap();
        }
    });

    ReceiverStream::new(rx)
}

fn get_intervals() -> impl Stream<Item = u32> {
    let (tx, rx) = trpl::channel();

    trpl::spawn_task(async move {
        let mut count = 0;
        loop {
            trpl::sleep(Duration::from_millis(1)).await;
            count += 1;
            tx.send(count).unwrap();
        }
    });

    ReceiverStream::new(rx)
}
```

## 示例 17-37：尝试合并消息流和间隔流

我们首先调用 `get_intervals`。然后我们使用 `merge` 方法合并消息流和间隔流，该方法将多个流合并为一个流，一旦项可用，它就会从任何源流中生成项，而不施加任何特定的顺序。最后，我们循环遍历合并后的流而不是消息流。

此时，`messages` 和 `intervals` 都不需要被固定或可变，因为它们都将合并到单个合并流中。然而，这个 `merge` 调用无法编译！（`while let` 循环中的下一个调用也无法编译，但我们稍后再讨论。）这是因为这两个流具有不同的类型。消息流的类型是 `Timeout<impl Stream<Item = String>>`，其中 `Timeout` 是为超时调用实现 `Stream` 的类型。间隔流的类型是 `impl Stream<Item = u32>`。要合并这两个流，我们需要转换其中一个以匹配另一个。我们将重做间隔流，因为 `messages` 已经是我们想要的基本格式，并且必须处理超时错误（参见示例 17-38）。

文件名: src/main.rs:

```rust
extern crate trpl; // required for mdbook test

use std::{pin::pin, time::Duration};

use trpl::{ReceiverStream, Stream, StreamExt};

fn main() {
    trpl::run(async {
        let messages = get_messages().timeout(Duration::from_millis(200));
        let intervals = get_intervals()
            .map(|count| format!("Interval: {count}"))
            .timeout(Duration::from_secs(10));
        let merged = messages.merge(intervals);
        let mut stream = pin!(merged);

        while let Some(result) = stream.next().await {
            match result {
                Ok(message) => println!("{message}"),
                Err(reason) => eprintln!("Problem: {reason:?}"),
            }
        }
    })
}

fn get_messages() -> impl Stream<Item = String> {
    let (tx, rx) = trpl::channel();

    trpl::spawn_task(async move {
        let messages = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"];
        for (index, message) in messages.into_iter().enumerate() {
            let time_to_sleep = if index % 2 == 0 { 100 } else { 300 };
            trpl::sleep(Duration::from_millis(time_to_sleep)).await;

            tx.send(format!("Message: '{message}'")).unwrap();
        }
    });

    ReceiverStream::new(rx)
}

fn get_intervals() -> impl Stream<Item = u32> {
    let (tx, rx) = trpl::channel();

    trpl::spawn_task(async move {
        let mut count = 0;
        loop {
            trpl::sleep(Duration::from_millis(1)).await;
            count += 1;
            tx.send(count).unwrap();
        }
    });

    ReceiverStream::new(rx)
}
```

## 示例 17-38：使间隔流的类型与消息流的类型对齐

首先，我们可以使用 `map` 辅助方法将间隔转换为字符串。其次，我们需要匹配来自消息的 `Timeout`。但是，由于我们实际上不需要间隔的超时，我们可以创建一个比我们使用的其他持续时间更长的超时。在这里，我们使用 `Duration::from_secs(10)` 创建一个 10 秒的超时。最后，我们需要使流可变，以便 `while let` 循环的 `next` 调用可以遍历流，并将其固定，以便安全地执行此操作。这几乎使我们达到了目标。所有类型都检查通过。但是，如果你运行它，会有两个问题。首先，它永远不会停止！你需要用 `ctrl-c` 停止它。其次，来自英文字母的消息将淹没在所有间隔计数器消息中：

```rust
--snip--
Interval: 38
Interval: 39
Interval: 40
Message: 'a'
Interval: 41
Interval: 42
Interval: 43
--snip--
```

示例 17-39 展示了解决最后两个问题的一种方法。

文件名: src/main.rs:

```rust
extern crate trpl; // required for mdbook test

use std::{pin::pin, time::Duration};

use trpl::{ReceiverStream, Stream, StreamExt};

fn main() {
    trpl::run(async {
        let messages = get_messages().timeout(Duration::from_millis(200));
        let intervals = get_intervals()
            .map(|count| format!("Interval: {count}"))
            .throttle(Duration::from_millis(100))
            .timeout(Duration::from_secs(10));
        let merged = messages.merge(intervals).take(20);
        let mut stream = pin!(merged);

        while let Some(result) = stream.next().await {
            match result {
                Ok(message) => println!("{message}"),
                Err(reason) => eprintln!("Problem: {reason:?}"),
            }
        }
    })
}

fn get_messages() -> impl Stream<Item = String> {
    let (tx, rx) = trpl::channel();

    trpl::spawn_task(async move {
        let messages = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"];
        for (index, message) in messages.into_iter().enumerate() {
            let time_to_sleep = if index % 2 == 0 { 100 } else { 300 };
            trpl::sleep(Duration::from_millis(time_to_sleep)).await;

            tx.send(format!("Message: '{message}'")).unwrap();
        }
    });

    ReceiverStream::new(rx)
}

fn get_intervals() -> impl Stream<Item = u32> {
    let (tx, rx) = trpl::channel();

    trpl::spawn_task(async move {
        let mut count = 0;
        loop {
            trpl::sleep(Duration::from_millis(1)).await;
            count += 1;
            tx.send(count).unwrap();
        }
    });

    ReceiverStream::new(rx)
}
```

## 示例 17-39：使用 `throttle` 和 `take` 管理合并流

首先，我们对间隔流使用 `throttle` 方法，使其不会淹没消息流。节流是一种限制函数调用速率的方法——或者在这种情况下，是限制流轮询频率的方法。每 100 毫秒一次就足够了，因为这大致是我们的消息到达的频率。

为了限制我们从流中接受的项的数量，我们对合并流应用 `take` 方法，因为我们希望限制最终输出，而不仅仅是其中一个流。

现在当我们运行程序时，它在从流中拉取 20 个项后停止，并且间隔不会淹没消息。我们也没有得到 `Interval: 100` 或 `Interval: 200` 等，而是得到 `Interval: 1`、`Interval: 2` 等——即使我们有一个每毫秒可以产生一个事件的源流。这是因为 `throttle` 调用会产生一个新流，该流包装了原始流，以便原始流仅以节流速率而不是其“原生”速率进行轮询。我们没有一堆未处理的间隔消息选择忽略。相反，我们根本没有产生这些间隔消息！这是 Rust futures 固有的“惰性”再次发挥作用，允许我们选择性能特征。

```rust
Interval: 1
Message: 'a'
Interval: 2
Interval: 3
Problem: Elapsed(())
Interval: 4
Message: 'b'
Interval: 5
Message: 'c'
Interval: 6
Interval: 7
Problem: Elapsed(())
Interval: 8
Message: 'd'
Interval: 9
Message: 'e'
Interval: 10
Interval: 11
Problem: Elapsed(())
Interval: 12
```

我们还需要处理最后一件事：错误！对于这两个基于通道的流，当通道的另一端关闭时，`send` 调用可能会失败——这只是运行时执行构成流的 futures 的方式问题。到目前为止，我们通过调用 `unwrap` 忽略了这种可能性，但在一个行为良好的应用程序中，我们应该明确处理错误，至少通过结束循环，这样我们就不会尝试发送更多消息。示例 17-40 展示了一个简单的错误策略：打印问题然后跳出循环。

```rust
extern crate trpl; // required for mdbook test

use std::{pin::pin, time::Duration};

use trpl::{ReceiverStream, Stream, StreamExt};

fn main() {
    trpl::run(async {
        let messages = get_messages().timeout(Duration::from_millis(200));
        let intervals = get_intervals()
            .map(|count| format!("Interval #{count}"))
            .throttle(Duration::from_millis(500))
            .timeout(Duration::from_secs(10));
        let merged = messages.merge(intervals).take(20);
        let mut stream = pin!(merged);

        while let Some(result) = stream.next().await {
            match result {
                Ok(item) => println!("{item}"),
                Err(reason) => eprintln!("Problem: {reason:?}"),
            }
        }
    });
}

fn get_messages() -> impl Stream<Item = String> {
    let (tx, rx) = trpl::channel();

    trpl::spawn_task(async move {
        let messages = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"];

        for (index, message) in messages.into_iter().enumerate() {
            let time_to_sleep = if index % 2 == 0 { 100 } else { 300 };
            trpl::sleep(Duration::from_millis(time_to_sleep)).await;

            if let Err(send_error) = tx.send(format!("Message: '{message}'")) {
                eprintln!("Cannot send message '{message}': {send_error}");
                break;
            }
        }
    });

    ReceiverStream::new(rx)
}

fn get_intervals() -> impl Stream<Item = u32> {
    let (tx, rx) = trpl::channel();

    trpl::spawn_task(async move {
        let mut count = 0;
        loop {
            trpl::sleep(Duration::from_millis(1)).await;
            count += 1;

            if let Err(send_error) = tx.send(count) {
                eprintln!("Could not send interval {count}: {send_error}");
                break;
            };
        }
    });

    ReceiverStream::new(rx)
}
```

示例 17-40：处理错误并关闭循环

通常，处理消息发送错误的正确方法会有所不同；只需确保你有一个策略。

现在我们已经看到了许多异步实践，让我们退一步，深入了解 Rust 用于使异步工作的 `Future`、`Stream` 和其他关键 trait 的一些细节。