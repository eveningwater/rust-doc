## 整合：Future、任务和线程

正如我们在第 16 章中看到的，线程提供了一种并发方法。在本章中，我们看到了另一种方法：将 async 与 future 和 stream 结合使用。如果你想知道何时选择哪种方法，答案是：视情况而定！在许多情况下，选择不是线程或 async，而是线程和 async。

许多操作系统几十年来一直提供基于线程的并发模型，许多编程语言也因此支持它们。然而，这些模型并非没有权衡。在许多操作系统上，它们为每个线程使用相当多的内存，并且在启动和关闭时会产生一些开销。线程也只有在你的操作系统和硬件支持它们时才是一种选择。与主流台式机和移动计算机不同，一些嵌入式系统根本没有操作系统，因此它们也没有线程。

async 模型提供了一组不同且最终互补的权衡。在 async 模型中，并发操作不需要自己的线程。相反，它们可以在任务上运行，就像我们在 stream 部分中使用 `trpl::spawn_task` 从同步函数中启动工作一样。任务类似于线程，但它不是由操作系统管理，而是由库级代码（即运行时）管理。

在上一节中，我们看到可以通过使用 async 通道并生成一个可以从同步代码调用的 async 任务来构建 stream。我们可以用线程做同样的事情。在示例 17-40 中，我们使用了 `trpl::spawn_task`和`trpl::sleep`。在示例 17-41 中，我们用标准库中的 `thread::spawn ` 和`thread::sleep`API 替换了`get_intervals`函数中的这些内容。

文件名: src/main.rs:

```rust
extern crate trpl; // required for mdbook test

use std::{pin::pin, thread, time::Duration};

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

    // This is *not* `trpl::spawn` but `std::thread::spawn`!
    thread::spawn(move || {
        let mut count = 0;
        loop {
            // Likewise, this is *not* `trpl::sleep` but `std::thread::sleep`!
            thread::sleep(Duration::from_millis(1));
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

示例 17-41: 在 `get_intervals` 函数中使用 `std::thread` API 而不是 async `trpl` API

如果你运行这段代码，输出与示例 17-40 的输出相同。请注意，从调用代码的角度来看，这里几乎没有变化。更重要的是，即使我们的一个函数在运行时上生成了一个 async 任务，另一个函数生成了一个操作系统线程，生成的 stream 也没有受到差异的影响。

尽管它们有相似之处，但这两种方法的行为方式却大相径庭，尽管在这个非常简单的例子中我们可能很难衡量它。我们可以在任何现代个人计算机上生成数百万个 async 任务。如果我们尝试用线程来做，我们真的会耗尽内存！

然而，这些 API 如此相似是有原因的。线程充当一组同步操作的边界；并发在线程之间是可能的。任务充当一组异步操作的边界；并发在任务之间和任务内部都是可能的，因为任务可以在其主体中的 future 之间切换。最后，future 是 Rust 最细粒度的并发单元，每个 future 都可能代表一个其他 future 的树。运行时——特别是其执行器——管理任务，任务管理 future。在这方面，任务类似于轻量级的、运行时管理的线程，具有由运行时而非操作系统管理而带来的附加功能。

这并不意味着 async 任务总是比线程更好（反之亦然）。线程并发在某些方面比 async 并发更简单的编程模型。这可能是一个优点，也可能是一个缺点。线程有点“即发即弃”；它们没有与 future 等效的原生机制，因此它们只是运行直到完成，除非被操作系统本身中断。也就是说，它们没有像 future 那样内置对任务内并发的支持。Rust 中的线程也没有取消机制——这是我们本章没有明确涵盖的主题，但隐含的事实是，每当我们结束一个 future 时，其状态都会被正确清理。

这些限制也使得线程比 future 更难组合。例如，使用线程来构建诸如本章前面构建的 `timeout`和 `throttle`方法要困难得多。future 是更丰富的数据结构这一事实意味着它们可以更自然地组合在一起，正如我们所看到的。

因此，任务赋予我们对 future 的额外控制，允许我们选择在哪里以及如何对它们进行分组。事实证明，线程和任务通常配合得很好，因为任务（至少在某些运行时中）可以在线程之间移动。事实上，在底层，我们一直在使用的运行时——包括 `spawn_blocking`和 `spawn_task`函数——默认是多线程的！许多运行时使用一种称为工作窃取的方法，根据线程的当前利用率，透明地在线程之间移动任务，以提高系统的整体性能。这种方法实际上需要线程和任务，因此也需要 future。

在考虑何时使用哪种方法时，请考虑以下经验法则：

- 如果工作是高度可并行化的，例如处理大量数据，其中每个部分都可以单独处理，那么线程是更好的选择。
- 如果工作是高度并发的，例如处理来自许多不同来源的消息，这些消息可能以不同的间隔或不同的速率到达，那么 async 是更好的选择。

如果你既需要并行性又需要并发性，你无需在线程和 async 之间做出选择。你可以自由地将它们一起使用，让它们各自发挥其最佳作用。例如，示例 17-42 展示了真实世界 Rust 代码中这种混合的常见示例。

文件名: src/main.rs:

```rust
extern crate trpl; // for mdbook test

use std::{thread, time::Duration};

fn main() {
    let (tx, mut rx) = trpl::channel();

    thread::spawn(move || {
        for i in 1..11 {
            tx.send(i).unwrap();
            thread::sleep(Duration::from_secs(1));
        }
    });

    trpl::run(async {
        while let Some(message) = rx.recv().await {
            println!("{message}");
        }
    });
}
```

示例 17-42: 在线程中发送阻塞代码消息并在 async 块中等待消息

我们首先创建一个 async 通道，然后生成一个线程，该线程拥有通道发送端的所有权。在线程中，我们发送数字 1 到 10，每个数字之间休眠一秒。最后，我们运行一个由传递给`trpl::run`的 async 块创建的 future，就像我们在本章中一直做的那样。在该 future 中，我们等待这些消息，就像我们看到的其他消息传递示例一样。

回到我们本章开头的情景，想象一下使用专用线程运行一组视频编码任务（因为视频编码是计算密集型的），但通过 async 通道通知 UI 这些操作已完成。在实际用例中，这种组合的例子不胜枚举。

## 总结

这不是你在这本文档中最后一次看到并发。第 21 章中的项目将把这些概念应用到比这里讨论的简单示例更真实的场景中，并更直接地比较使用线程和任务解决问题的方法。

无论你选择哪种方法，Rust 都为你提供了编写安全、快速、并发代码所需的工具——无论是用于高吞吐量的 Web 服务器还是嵌入式操作系统。

接下来，我们将讨论随着 Rust 程序变得越来越大，如何以惯用的方式建模问题和构建解决方案。此外，我们还将讨论 Rust 的惯用语与你可能熟悉的面向对象编程中的惯用语之间的关系。
