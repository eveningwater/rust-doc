## 处理任意数量的 Future

在上一节中，当我们从使用两个 Future 切换到三个时，我们也不得不从使用 `join` 切换到使用 `join3`。每次我们改变想要 `join` 的 Future 数量时，都不得不调用不同的函数，这会很烦人。幸运的是，我们有一个 `join` 的宏形式，可以向其传递任意数量的参数。它还处理 Future 本身的 `await`。因此，我们可以将示例 17-13 中的代码重写为使用 `join!` 而不是 `join3`，如示例 17-14 所示。

文件名: src/main.rs:

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
                trpl::sleep(Duration::from_secs(1)).await;
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
                trpl::sleep(Duration::from_secs(1)).await;
            }
        };

        trpl::join!(tx1_fut, tx_fut, rx_fut);
    });
}
```

示例 17-14：使用 `join!` 等待多个 Future

这无疑比在 `join`、`join3`、`join4` 等之间来回切换要好得多！然而，即使是这种宏形式，也只在我们预先知道 Future 数量时才有效。但在实际的 Rust 开发中，将 Future 推入集合，然后等待其中部分或全部 Future 完成是一种常见模式。

为了检查集合中的所有 Future，我们需要遍历并 `join` 它们。`trpl::join_all` 函数接受任何实现了 `Iterator` trait 的类型，你可以在第 13 章的 [迭代器 trait 和 next 方法](https://doc.rust-lang.org/book/ch13-02-iterators.html#the-iterator-trait-and-the-next-method) 中了解到它，所以这似乎正是我们需要的。让我们尝试将 Future 放入一个 vector 中，并用 `join_all` 替换 `join!`，如示例 17-15 所示。

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
                trpl::sleep(Duration::from_secs(1)).await;
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
                trpl::sleep(Duration::from_secs(1)).await;
            }
        };

        let futures = vec![tx1_fut, rx_fut, tx_fut];

        trpl::join_all(futures).await;
    });
}
```

示例 17-15：将匿名 Future 存储在 vector 中并调用 `join_all`

不幸的是，这段代码无法编译。相反，我们得到了这个错误：

```rust
error[E0308]: mismatched types
  --> src/main.rs:45:37
   |
10 |         let tx1_fut = async move {
   |                       ---------- the expected `async` block
...
24 |         let rx_fut = async {
   |                      ----- the found `async` block
...
45 |         let futures = vec![tx1_fut, rx_fut, tx_fut];
   |                                     ^^^^^^ expected `async` block, found a different `async` block
   |
   = note: expected `async` block `{async block@src/main.rs:10:23: 10:33}`
              found `async` block `{async block@src/main.rs:24:22: 24:27}`
   = note: no two async blocks, even if identical, have the same type
   = help: consider pinning your async block and casting it to a trait object
```

这可能令人惊讶。毕竟，所有的异步块都没有返回任何东西，所以每个都生成一个 `Future<Output = ()>`。但是请记住，`Future` 是一个 trait，编译器会为每个异步块创建一个唯一的枚举。你不能将两个不同的手写结构体放入 `Vec` 中，同样的规则也适用于编译器生成的不同枚举。

为了解决这个问题，我们需要使用 trait 对象，就像我们在第 12 章的 [从 `run` 函数返回错误](https://doc.rust-lang.org/book/ch12-03-improving-error-handling-and-modularity.html) 中所做的那样。（我们将在第 18 章详细介绍 trait 对象。）使用 trait 对象可以让我们将这些类型生成的每个匿名 Future 都视为相同的类型，因为它们都实现了 `Future` trait。

> 注意：在第 8 章的 [使用枚举存储多个值](https://doc.rust-lang.org/book/ch08-01-vectors.html#using-an-enum-to-store-multiple-types) 中，我们讨论了在 `Vec` 中包含多种类型的另一种方法：使用枚举来表示 `vector` 中可能出现的每种类型。但在这里我们不能这样做。一方面，我们无法命名这些不同的类型，因为它们是匿名的。另一方面，我们最初选择 `vector` 和 `join_all` 的原因是为了能够处理动态集合的 Future，而我们只关心它们具有相同的输出类型。

我们首先将 `vec!` 中的每个 Future 包装在 `Box::new` 中，如示例 17-16 所示。

文件名: src/main.rs:

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
                trpl::sleep(Duration::from_secs(1)).await;
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
                trpl::sleep(Duration::from_secs(1)).await;
            }
        };

        let futures =
            vec![Box::new(tx1_fut), Box::new(rx_fut), Box::new(tx_fut)];

        trpl::join_all(futures).await;
    });
}
```

示例 17-16：使用 `Box::new` 对齐 `Vec` 中 Future 的类型

不幸的是，这段代码仍然无法编译。实际上，我们得到了与之前相同的基本错误，针对第二个和第三个 `Box::new` 调用，以及引用 `Unpin` trait 的新错误。我们稍后会回到 `Unpin` 错误。首先，让我们通过显式标注 `futures` 变量的类型来修复 `Box::new` 调用上的类型错误（参见示例 17-17）。

文件名: src/main.rs:

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
                trpl::sleep(Duration::from_secs(1)).await;
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
                trpl::sleep(Duration::from_secs(1)).await;
            }
        };

        let futures: Vec<Box<dyn Future<Output = ()>>> =
            vec![Box::new(tx1_fut), Box::new(rx_fut), Box::new(tx_fut)];

        trpl::join_all(futures).await;
    });
}
```

示例 17-17：通过显式类型声明修复其余类型不匹配错误

这个类型声明有点复杂，我们来一步步分析：

1. 最内层的类型是 Future 本身。我们通过写入 `Future<Output = ()>` 明确指出 Future 的输出是单元类型 `()`。
2. 然后我们用 `dyn` 标注 trait，将其标记为动态的。
3. 整个 trait 引用被包装在一个 `Box` 中。
4. 最后，我们明确声明 `futures` 是一个包含这些项的 `Vec`。

这已经带来了很大的不同。现在当我们运行编译器时，我们只会得到提到 `Unpin` 的错误。尽管有三个错误，但它们的内容非常相似。

```rust
error[E0277]: `dyn Future<Output = ()>` cannot be unpinned
   --> src/main.rs:49:24
    |
49  |         trpl::join_all(futures).await;
    |         -------------- ^^^^^^^ the trait `Unpin` is not implemented for `dyn Future<Output = ()>`
    |         |
    |         required by a bound introduced by this call
    |
    = note: consider using the `pin!` macro
            consider using `Box::pin` if you need to access the pinned value outside of the current scope
    = note: required for `Box<dyn Future<Output = ()>>` to implement `Future`
note: required by a bound in `join_all`
   --> file:///home/.cargo/registry/src/index.crates.io-1949cf8c6b5b557f/futures-util-0.3.30/src/future/join_all.rs:105:14
    |
102 | pub fn join_all<I>(iter: I) -> JoinAll<I::Item>
    |        -------- required by a bound in this function
...
105 |     I::Item: Future,
    |              ^^^^^^ required by this bound in `join_all`

error[E0277]: `dyn Future<Output = ()>` cannot be unpinned
  --> src/main.rs:49:9
   |
49 |         trpl::join_all(futures).await;
   |         ^^^^^^^^^^^^^^^^^^^^^^^ the trait `Unpin` is not implemented for `dyn Future<Output = ()>`
   |
   = note: consider using the `pin!` macro
           consider using `Box::pin` if you need to access the pinned value outside of the current scope
   = note: required for `Box<dyn Future<Output = ()>>` to implement `Future`
note: required by a bound in `futures_util::future::join_all::JoinAll`
  --> file:///home/.cargo/registry/src/index.crates.io-1949cf8c6b5b557f/futures-util-0.3.30/src/future/join_all.rs:29:8
   |
27 | pub struct JoinAll<F>
   |            ------- required by a bound in this struct
28 | where
29 |     F: Future,
   |        ^^^^^^ required by this bound in `JoinAll`

error[E0277]: `dyn Future<Output = ()>` cannot be unpinned
  --> src/main.rs:49:33
   |
49 |         trpl::join_all(futures).await;
   |                                 ^^^^^ the trait `Unpin` is not implemented for `dyn Future<Output = ()>`
   |
   = note: consider using the `pin!` macro
           consider using `Box::pin` if you need to access the pinned value outside of the current scope
   = note: required for `Box<dyn Future<Output = ()>>` to implement `Future`
note: required by a bound in `futures_util::future::join_all::JoinAll`
  --> file:///home/.cargo/registry/src/index.crates.io-1949cf8c6b5b557f/futures-util-0.3.30/src/future/join_all.rs:29:8
   |
27 | pub struct JoinAll<F>
   |            ------- required by a bound in this struct
28 | where
29 |     F: Future,
   |        ^^^^^^ required by this bound in `JoinAll`

For more information about this error, try `rustc --explain E0277`.
error: could not compile `async_await` (bin "async_await") due to 3 previous errors
```

这需要消化的内容很多，所以我们来分解一下。消息的第一部分告诉我们，第一个异步块（src/main.rs:8:23: 20:10）没有实现 `Unpin` trait，并建议使用 `pin!` 或 `Box::pin` 来解决。在本章后面，我们将深入探讨 `Pin` 和 `Unpin` 的更多细节。不过，目前我们可以按照编译器的建议来解决问题。在示例 17-18 中，我们首先从 `std::pin` 导入 `Pin`。接下来，我们更新 `futures` 的类型注解，用 `Pin` 包装每个 `Box`。最后，我们使用 `Box::pin` 来 `pin` Future 本身。

文件名: src/main.rs:

```rust
extern crate trpl; // required for mdbook test

use std::pin::Pin;

// -- snip --

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
                trpl::sleep(Duration::from_secs(1)).await;
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
                trpl::sleep(Duration::from_secs(1)).await;
            }
        };

        let futures: Vec<Pin<Box<dyn Future<Output = ()>>>> =
            vec![Box::pin(tx1_fut), Box::pin(rx_fut), Box::pin(tx_fut)];

        trpl::join_all(futures).await;
    });
}
```

示例 17-18：使用 `Pin` 和 `Box::pin` 使 `Vec` 类型检查通过

如果我们编译并运行它，我们最终会得到我们期望的输出：

```rust
received 'hi'
received 'more'
received 'from'
received 'messages'
received 'the'
received 'for'
received 'future'
received 'you'
```

呼！

这里还有一些值得探讨的地方。首先，使用 `Pin<Box<T>>` 会因为将这些 Future 放到堆上而增加少量开销——我们这样做只是为了让类型对齐。毕竟，我们实际上不需要堆分配：这些 Future 是此特定函数的局部变量。如前所述，`Pin` 本身是一个包装类型，因此我们可以获得在 `Vec` 中拥有单一类型的好处——这是我们最初选择 `Box` 的原因——而无需进行堆分配。我们可以使用 `std::pin::pin` 宏直接将 `Pin` 用于每个 Future。

然而，我们仍然必须明确 `pin` 引用的类型；否则，Rust 仍然不知道将它们解释为动态 trait 对象，而这正是我们在 `Vec` 中所需要的。因此，我们将 `pin` 添加到 `std::pin` 的导入列表中。然后，我们可以在定义每个 Future 时使用 `pin!`，并将 `futures` 定义为一个包含 `pin` 动态 Future 类型可变引用的 `Vec`，如示例 17-19 所示。

文件名: src/main.rs:

```rust
extern crate trpl; // required for mdbook test

use std::pin::{Pin, pin};

// -- snip --

use std::time::Duration;

fn main() {
    trpl::run(async {
        let (tx, mut rx) = trpl::channel();

        let tx1 = tx.clone();
        let tx1_fut = pin!(async move {
            // --snip--
            let vals = vec![
                String::from("hi"),
                String::from("from"),
                String::from("the"),
                String::from("future"),
            ];

            for val in vals {
                tx1.send(val).unwrap();
                trpl::sleep(Duration::from_secs(1)).await;
            }
        });

        let rx_fut = pin!(async {
            // --snip--
            while let Some(value) = rx.recv().await {
                println!("received '{value}'");
            }
        });

        let tx_fut = pin!(async move {
            // --snip--
            let vals = vec![
                String::from("more"),
                String::from("messages"),
                String::from("for"),
                String::from("you"),
            ];

            for val in vals {
                tx.send(val).unwrap();
                trpl::sleep(Duration::from_secs(1)).await;
            }
        });

        let futures: Vec<Pin<&mut dyn Future<Output = ()>>> =
            vec![tx1_fut, rx_fut, tx_fut];

        trpl::join_all(futures).await;
    });
}
```

示例 17-19：直接使用 `pin!` 宏 `Pin` Future 以避免不必要的堆分配

我们之所以能走到这一步，是因为我们忽略了可能存在不同 `Output` 类型的事实。例如，在示例 17-20 中，`a` 的匿名 Future 实现了 `Future<Output = u32>`，`b` 的匿名 Future 实现了 `Future<Output = &str>`，而 `c` 的匿名 Future 实现了 `Future<Output = bool>`。

文件名: src/main.rs:

```rust
extern crate trpl; // required for mdbook test

fn main() {
    trpl::run(async {
        let a = async { 1u32 };
        let b = async { "Hello!" };
        let c = async { true };

        let (a_result, b_result, c_result) = trpl::join!(a, b, c);
        println!("{a_result}, {b_result}, {c_result}");
    });
}
```

示例 17-20：三个不同类型的 Future

我们可以使用 `trpl::join!` 来等待它们，因为它允许我们传入多个 Future 类型并生成这些类型的元组。我们不能使用 `trpl::join_all`，因为它要求传入的所有 Future 都具有相同的类型。请记住，正是这个错误让我们开始了 `Pin` 的冒险！

这是一个基本的权衡：我们可以使用 `join_all` 处理动态数量的 Future，只要它们都具有相同的类型；或者我们可以使用 `join` 函数或 `join!` 宏处理固定数量的 Future，即使它们具有不同的类型。这与我们在 Rust 中处理任何其他类型时面临的情况相同。Future 并非特殊，尽管我们有一些很好的语法来处理它们，这是一件好事。

## 竞速 Future

当我们使用 `join` 系列函数和宏“连接”Future 时，我们要求所有 Future 都完成后才能继续。然而，有时我们只需要集合中的某个 Future 完成即可继续——这有点类似于让一个 Future 与另一个 Future 竞速。

在示例 17-21 中，我们再次使用 `trpl::race` 让两个 Future，`slow` 和 `fast` 相互竞速。

文件名: src/main.rs:

```rust
extern crate trpl; // required for mdbook test

use std::time::Duration;

fn main() {
    trpl::run(async {
        let slow = async {
            println!("'slow' started.");
            trpl::sleep(Duration::from_millis(100)).await;
            println!("'slow' finished.");
        };

        let fast = async {
            println!("'fast' started.");
            trpl::sleep(Duration::from_millis(50)).await;
            println!("'fast' finished.");
        };

        trpl::race(slow, fast).await;
    });
}
```

示例 17-21：使用 `race` 获取最先完成的 Future 的结果

每个 Future 在开始运行时打印一条消息，通过调用并等待 `sleep` 暂停一段时间，然后在完成时打印另一条消息。然后我们将 `slow` 和 `fast` 都传递给 `trpl::race` 并等待其中一个完成。（这里的结果并不令人惊讶：`fast` 赢了。）与我们在 [“我们的第一个异步程序”](https://doc.rust-lang.org/book/ch17-01-futures-and-syntax.html#our-first-async-program) 中使用 `race` 不同，我们在这里忽略了它返回的 `Either` 实例，因为所有有趣的行为都发生在异步块的主体中。

请注意，如果你颠倒 `race` 参数的顺序，即使 `fast` Future 总是首先完成，“started”消息的顺序也会改变。这是因为这个特定的 `race` 函数的实现是不公平的。它总是按照传入参数的顺序运行 Future。其他实现是公平的，会随机选择哪个 Future 首先进行轮询。无论我们使用的 `race` 实现是否公平，其中一个 Future 都将在其主体中的第一个 `await` 点之前运行，然后另一个任务才能开始。

回想一下 [我们的第一个异步程序](https://doc.rust-lang.org/book/ch17-01-futures-and-syntax.html#our-first-async-program) 中，在每个 `await` 点，如果正在等待的 Future 尚未准备好，Rust 会给运行时一个暂停任务并切换到另一个任务的机会。反之亦然：Rust 只在 `await` 点暂停异步块并将控制权交还给运行时。`await` 点之间的一切都是同步的。

这意味着如果你在没有 `await` 点的异步块中执行大量工作，该 Future 将阻止任何其他 Future 的进展。你有时可能会听到这被称为一个 Future“饿死”其他 Future。在某些情况下，这可能不是什么大问题。但是，如果你正在进行某种昂贵的设置或长时间运行的工作，或者你的 Future 将无限期地执行某个特定任务，你就需要考虑何时何地将控制权交还给运行时。

同样，如果你有长时间运行的阻塞操作，异步可以成为一个有用的工具，为程序的不同部分相互关联提供方式。

But how would you hand control back to the runtime in those cases?

## Yielding Control to the Runtime

Let’s simulate a long-running operation. Listing 17-22 introduces a slow function.

文件名: src/main.rs:

```rust
extern crate trpl; // required for mdbook test

use std::{thread, time::Duration};

fn main() {
    trpl::run(async {
        // We will call `slow` here later
    });
}

fn slow(name: &str, ms: u64) {
    thread::sleep(Duration::from_millis(ms));
    println!("'{name}' ran for {ms}ms");
}
```

Listing 17-22: Using thread::sleep to simulate slow operations
This code uses std::thread::sleep instead of trpl::sleep so that calling slow will block the current thread for some number of milliseconds. We can use slow to stand in for real-world operations that are both long-running and blocking.

In Listing 17-23, we use slow to emulate doing this kind of CPU-bound work in a pair of futures.

文件名: src/main.rs:

```rust
extern crate trpl; // required for mdbook test

use std::{thread, time::Duration};

fn main() {
    trpl::run(async {
        let a = async {
            println!("'a' started.");
            slow("a", 30);
            slow("a", 10);
            slow("a", 20);
            trpl::sleep(Duration::from_millis(50)).await;
            println!("'a' finished.");
        };

        let b = async {
            println!("'b' started.");
            slow("b", 75);
            slow("b", 10);
            slow("b", 15);
            slow("b", 350);
            trpl::sleep(Duration::from_millis(50)).await;
            println!("'b' finished.");
        };

        trpl::race(a, b).await;
    });
}

fn slow(name: &str, ms: u64) {
    thread::sleep(Duration::from_millis(ms));
    println!("'{name}' ran for {ms}ms");
}
```

示例 17-23：使用 `thread::sleep` 模拟慢速操作

首先，每个 Future 只有在执行完一系列慢速操作后才将控制权交还给运行时。如果你运行此代码，你将看到以下输出：

```rust
'a' started.
'a' ran for 30ms
'a' ran for 10ms
'a' ran for 20ms
'b' started.
'b' ran for 75ms
'b' ran for 10ms
'b' ran for 15ms
'b' ran for 350ms
'a' finished.
```

与我们之前的示例一样，`race` 仍然在 `a` 完成后立即结束。然而，两个 Future 之间没有交错执行。`a` Future 会完成所有工作，直到 `trpl::sleep` 调用被 `await`，然后 `b` Future 会完成所有工作，直到它自己的 `trpl::sleep` 调用被 `await`，最后 `a` Future 完成。为了让两个 Future 在它们的慢速任务之间取得进展，我们需要 `await` 点，以便将控制权交还给运行时。这意味着我们需要一些可以 `await` 的东西！

我们已经可以在示例 17-23 中看到这种交接：如果我们移除 `a` Future 末尾的 `trpl::sleep`，它将在 `b` Future 完全没有运行的情况下完成。让我们尝试使用 `sleep` 函数作为起点，让操作轮流进行，如示例 17-24 所示。

文件名: src/main.rs:

```rust
extern crate trpl; // required for mdbook test

use std::{thread, time::Duration};

fn main() {
    trpl::run(async {
        let one_ms = Duration::from_millis(1);

        let a = async {
            println!("'a' started.");
            slow("a", 30);
            trpl::sleep(one_ms).await;
            slow("a", 10);
            trpl::sleep(one_ms).await;
            slow("a", 20);
            trpl::sleep(one_ms).await;
            println!("'a' finished.");
        };

        let b = async {
            println!("'b' started.");
            slow("b", 75);
            trpl::sleep(one_ms).await;
            slow("b", 10);
            trpl::sleep(one_ms).await;
            slow("b", 15);
            trpl::sleep(one_ms).await;
            slow("b", 350);
            trpl::sleep(one_ms).await;
            println!("'b' finished.");
        };

        trpl::race(a, b).await;
    });
}

fn slow(name: &str, ms: u64) {
    thread::sleep(Duration::from_millis(ms));
    println!("'{name}' ran for {ms}ms");
}
```

示例 17-24：使用 `sleep` 让操作轮流进行

在示例 17-24 中，我们在每次调用 `slow` 之间添加了带有 `await` 点的 `trpl::sleep` 调用。现在两个 Future 的工作是交错进行的：

```rust
'a' started.
'b' started.
'a' ran for 30ms
'b' ran for 75ms
'a' ran for 10ms
'b' ran for 10ms
'a' ran for 20ms
'b' ran for 15ms
'a' finished.
'b' ran for 350ms
'b' finished.
```

`a` Future 在将控制权交给 `b` 之前仍然会运行一段时间，因为它在调用 `trpl::sleep` 之前就调用了 `slow`，但在此之后，每当其中一个 Future 达到 `await` 点时，它们就会来回切换。在这种情况下，我们在每次调用 `slow` 之后都这样做了，但我们可以根据最适合我们的方式来分解工作。

然而，我们这里并不真的想休眠：我们希望尽可能快地取得进展。我们只需要将控制权交还给运行时。我们可以直接使用 `yield_now` 函数来做到这一点。在示例 17-25 中，我们将所有这些 `sleep` 调用替换为 `yield_now`。

文件名: src/main.rs:

```rust
extern crate trpl; // required for mdbook test

use std::{thread, time::Duration};

fn main() {
    trpl::run(async {
        let a = async {
            println!("'a' started.");
            slow("a", 30);
            trpl::yield_now().await;
            slow("a", 10);
            trpl::yield_now().await;
            slow("a", 20);
            trpl::yield_now().await;
            println!("'a' finished.");
        };

        let b = async {
            println!("'b' started.");
            slow("b", 75);
            trpl::yield_now().await;
            slow("b", 10);
            trpl::yield_now().await;
            slow("b", 15);
            trpl::yield_now().await;
            slow("b", 350);
            trpl::yield_now().await;
            println!("'b' finished.");
        };

        trpl::race(a, b).await;
    });
}

fn slow(name: &str, ms: u64) {
    thread::sleep(Duration::from_millis(ms));
    println!("'{name}' ran for {ms}ms");
}
```

示例 17-25：使用 `yield_now` 让操作轮流进行

这段代码不仅意图更清晰，而且比使用 `sleep` 快得多，因为像 `sleep` 这样的计时器通常在粒度上有限制。例如，我们使用的 `sleep` 版本即使我们传入一纳秒的 `Duration`，也总是会至少休眠一毫秒。再说一次，现代计算机速度很快：它们在一毫秒内可以做很多事情！

你可以通过设置一个小的基准测试来亲自验证这一点，例如示例 17-26 中的测试。（这不是一种特别严格的性能测试方法，但足以在这里展示差异。）

文件名: src/main.rs:

```rust
extern crate trpl; // required for mdbook test

use std::time::{Duration, Instant};

fn main() {
    trpl::run(async {
        let one_ns = Duration::from_nanos(1);
        let start = Instant::now();
        async {
            for _ in 1..1000 {
                trpl::sleep(one_ns).await;
            }
        }
        .await;
        let time = Instant::now() - start;
        println!(
            "'sleep' version finished after {} seconds.",
            time.as_secs_f32()
        );

        let start = Instant::now();
        async {
            for _ in 1..1000 {
                trpl::yield_now().await;
            }
        }
        .await;
        let time = Instant::now() - start;
        println!(
            "'yield' version finished after {} seconds.",
            time.as_secs_f32()
        );
    });
}
```

示例 17-26：比较 `sleep` 和 `yield_now` 的性能

在这里，我们跳过所有状态打印，向 `trpl::sleep` 传递一个一纳秒的 `Duration`，并让每个 Future 独立运行，不在 Future 之间进行切换。然后我们运行 1,000 次迭代，看看使用 `trpl::sleep` 的 Future 与使用 `trpl::yield_now` 的 Future 相比需要多长时间。

`yield_now` 版本要快得多！

这意味着异步即使对于计算密集型任务也很有用，这取决于你的程序还在做什么，因为它提供了一个有用的工具来构建程序不同部分之间的关系。这是一种协作式多任务处理形式，其中每个 Future 都有权通过 `await` 点决定何时交出控制权。因此，每个 Future 也有责任避免阻塞太长时间。在一些基于 Rust 的嵌入式操作系统中，这是唯一的多任务处理方式！

当然，在实际代码中，你通常不会在每一行都交替使用函数调用和 `await` 点。虽然以这种方式交出控制权相对便宜，但它并非没有成本。在许多情况下，尝试分解计算密集型任务可能会使其显著变慢，因此有时为了整体性能，最好让操作短暂阻塞。始终进行测量以查看代码的实际性能瓶颈在哪里。但是，如果你看到大量工作串行发生而你期望它们并发发生，那么底层动态很重要。

## 构建我们自己的异步抽象

我们还可以将 Future 组合在一起以创建新的模式。例如，我们可以使用已有的异步构建块来构建一个超时函数。完成后，结果将是另一个构建块，我们可以用它来创建更多的异步抽象。

示例 17-27 展示了我们期望这个超时函数如何与一个慢速 Future 一起工作。

文件名: src/main.rs:

```rust
extern crate trpl; // required for mdbook test

use std::time::Duration;

fn main() {
    trpl::run(async {
        let slow = async {
            trpl::sleep(Duration::from_millis(100)).await;
            "I finished!"
        };

        match timeout(slow, Duration::from_millis(10)).await {
            Ok(message) => println!("Succeeded with '{message}'"),
            Err(duration) => {
                println!("Failed after {} seconds", duration.as_secs())
            }
        }
    });
}
```

示例 17-27：使用我们设想的超时函数来运行有时间限制的慢速操作

让我们来实现它！首先，让我们考虑一下 `timeout` 的 API：

- 它本身需要是一个 `async` 函数，这样我们就可以 `await` 它。
- 它的第一个参数应该是一个要运行的 Future。我们可以将其泛型化，使其适用于任何 Future。
- 它的第二个参数将是最大等待时间。如果我们使用 `Duration`，这将很容易传递给 `trpl::sleep`。
- 它应该返回一个 `Result`。如果 Future 成功完成，`Result` 将是 `Ok`，其中包含 Future 产生的值。如果超时首先过去，`Result` 将是 `Err`，其中包含超时等待的持续时间。

示例 17-28 展示了此声明。

文件名: src/main.rs:

```rust
extern crate trpl; // required for mdbook test

use std::time::Duration;

fn main() {
    trpl::run(async {
        let slow = async {
            trpl::sleep(Duration::from_secs(5)).await;
            "Finally finished"
        };

        match timeout(slow, Duration::from_millis(10)).await {
            Ok(message) => println!("Succeeded with '{message}'"),
            Err(duration) => {
                println!("Failed after {} seconds", duration.as_secs())
            }
        }
    });
}

async fn timeout<F: Future>(
    future_to_try: F,
    max_time: Duration,
) -> Result<F::Output, Duration> {
    // Here is where our implementation will go!
}
```

示例 17-28：定义 `timeout` 的签名

这满足了我们对类型的目标。现在让我们考虑一下我们需要的功能：我们希望将传入的 Future 与持续时间进行竞争。我们可以使用 `trpl::sleep` 从持续时间创建一个计时器 Future，并使用 `trpl::race` 将该计时器与调用者传入的 Future 一起运行。

我们还知道 `race` 是不公平的，它按照参数传入的顺序轮询。因此，我们首先将 `future_to_try` 传递给 `race`，这样即使 `max_time` 是一个非常短的持续时间，它也有机会完成。如果 `future_to_try` 首先完成，`race` 将返回 `Left`，其中包含 `future_to_try` 的输出。如果计时器首先完成，`race` 将返回 `Right`，其中包含计时器的输出 `()`。

In Listing 17-29, we match on the result of awaiting trpl::race.

文件名: src/main.rs:

```rust
extern crate trpl; // required for mdbook test

use std::time::Duration;

use trpl::Either;

// --snip--

fn main() {
    trpl::run(async {
        let slow = async {
            trpl::sleep(Duration::from_secs(5)).await;
            "Finally finished"
        };

        match timeout(slow, Duration::from_secs(2)).await {
            Ok(message) => println!("Succeeded with '{message}'"),
            Err(duration) => {
                println!("Failed after {} seconds", duration.as_secs())
            }
        }
    });
}

async fn timeout<F: Future>(
    future_to_try: F,
    max_time: Duration,
) -> Result<F::Output, Duration> {
    match trpl::race(future_to_try, trpl::sleep(max_time)).await {
        Either::Left(output) => Ok(output),
        Either::Right(_) => Err(max_time),
    }
}
```

示例 17-29：使用 `race` 和 `sleep` 定义 `timeout`

如果 `future_to_try` 成功并返回 `Left(output)`，我们返回 `Ok(output)`。如果 `sleep` 计时器反而超时并返回 `Right(())`，我们忽略 `()` 并返回 `Err(max_time)`。

这样，我们就用另外两个异步辅助函数构建了一个可用的超时函数。如果运行我们的代码，它将在超时后打印失败模式：

```rust
Failed after 2 seconds
```

因为 Future 可以与其他 Future 组合，所以你可以使用更小的异步构建块来构建真正强大的工具。例如，你可以使用相同的方法将超时与重试结合起来，进而将它们用于网络调用等操作（本章开头的一个示例）。

实际上，你通常会直接使用 `async` 和 `await`，其次是 `join`、`join_all`、`race` 等函数和宏。你只需要偶尔使用 `pin` 来将 Future 与这些 API 结合使用。

我们现在已经看到了同时处理多个 Future 的多种方法。接下来，我们将研究如何使用流（streams）按时间顺序处理多个 Future。不过，这里还有几点你可能需要首先考虑：

- 我们使用 `Vec` 和 `join_all` 来等待某个组中的所有 Future 完成。你如何使用 `Vec` 来按顺序处理一组 Future 呢？这样做有什么权衡？
- 查看 `futures` crate 中的 `futures::stream::FuturesUnordered` 类型。使用它与使用 `Vec` 有何不同？(不用担心它是来自 crate 的流部分；它与任何 Future 集合都能很好地配合使用。)
