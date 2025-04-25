## 使用 panic! 处理不可恢复的错误

有时候，代码中会发生糟糕的事情，而你对此束手无策。在这些情况下，Rust 提供了 panic! 宏。在实践中，有两种方式会导致 panic：执行会导致代码 panic 的操作（比如访问数组末尾之外的位置）或者显式调用 panic! 宏。无论哪种情况，我们都会导致程序 panic。默认情况下，这些 panic 会打印一条错误信息，展开（unwind）并清理栈，然后退出。通过环境变量，你还可以让 Rust 在 panic 发生时显示调用栈，以便更容易追踪 panic 的来源。

> ## 在 Panic 时展开栈或终止程序
>
> 默认情况下，当 panic 发生时，程序会开始展开，这意味着 Rust 会回溯栈并清理它遇到的每个函数的数据。然而，回溯和清理需要大量工作。因此，Rust 允许你选择立即终止的替代方案，这会在不清理的情况下结束程序。
>
> 程序使用的内存随后需要由操作系统来清理。如果你的项目需要使生成的二进制文件尽可能小，可以通过在 Cargo.toml 文件的适当 [profile] 部分添加 panic = 'abort' 来将展开改为在 panic 时终止。例如，如果你想在发布模式下遇到 panic 时终止程序，添加以下内容：
>
> ```toml
> [profile.release]
> panic = 'abort'
> ```

让我们在一个简单的程序中尝试调用 panic!：

文件名：src/main.rs：

```rust
fn main() {
    panic!("crash and burn");
}
```

当你运行程序时，你会看到类似这样的输出：

```rust
$ cargo run
   Compiling panic v0.1.0 (file:///projects/panic)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.25s
     Running `target/debug/panic`
thread 'main' panicked at src/main.rs:2:5:
crash and burn
note: run with `RUST_BACKTRACE=1` environment variable to display a backtrace
```

对 panic! 的调用导致了最后两行中包含的错误信息。第一行显示了我们的 panic 消息和源代码中 panic 发生的位置：src/main.rs:2:5 表示这是 src/main.rs 文件的第 2 行第 5 个字符。

在这种情况下，指示的行是我们代码的一部分，如果我们查看该行，就会看到 panic! 宏调用。在其他情况下，panic! 调用可能在我们的代码调用的代码中，错误消息报告的文件名和行号将是其他人的代码中调用 panic! 宏的地方，而不是最终导致 panic! 调用的我们代码的行。

我们可以使用 panic! 调用来源的函数回溯来找出代码中导致问题的部分。为了理解如何使用 panic! 回溯，让我们看另一个例子，看看当 panic! 调用来自库而不是我们的代码直接调用宏时，由于我们代码中的错误会是什么样子。代码清单 9-1 尝试访问向量中超出有效索引范围的索引。

文件名：src/main.rs：

```rust
fn main() {
    let v = vec![1, 2, 3];
    v[99];
}
```

代码清单 9-1：尝试访问向量末尾之外的元素，这将导致调用 panic!

在这里，我们尝试访问向量的第 100 个元素（索引为 99，因为索引从零开始），但向量只有三个元素。在这种情况下，Rust 会 panic。使用 [] 应该返回一个元素，但如果你传递了一个无效的索引，Rust 无法返回正确的元素。

在 C 语言中，尝试读取数据结构末尾之外的内容是未定义行为。你可能会得到内存中与数据结构中该元素对应位置的任何内容，即使该内存不属于该结构。这被称为缓冲区过度读取（buffer overread），如果攻击者能够以某种方式操纵索引，从而读取存储在数据结构之后的不应该被允许读取的数据，就会导致安全漏洞。

为了保护你的程序免受这类漏洞的影响，如果你尝试读取不存在的索引处的元素，Rust 将停止执行并拒绝继续。让我们尝试一下：

```rust
$ cargo run
   Compiling panic v0.1.0 (file:///projects/panic)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.27s
     Running `target/debug/panic`
thread 'main' panicked at src/main.rs:4:6:
index out of bounds: the len is 3 but the index is 99
note: run with `RUST_BACKTRACE=1` environment variable to display a backtrace
```

这个错误指向我们的 main.rs 的第 4 行，我们尝试访问向量 v 中的索引 99。

note: 行告诉我们可以设置 RUST_BACKTRACE 环境变量来获取导致错误的确切过程的回溯。回溯是到达这一点所调用的所有函数的列表。Rust 中的回溯与其他语言中的工作方式相同：阅读回溯的关键是从顶部开始，直到看到你编写的文件。那就是问题的起源点。该点之上的行是你的代码调用的代码；该点之下的行是调用你的代码的代码。这些前后的行可能包括核心 Rust 代码、标准库代码或你正在使用的 crate。让我们通过将 RUST_BACKTRACE 环境变量设置为除 0 以外的任何值来尝试获取回溯。代码清单 9-2 显示了类似于你将看到的输出。

```rust
$ RUST_BACKTRACE=1 cargo run
thread 'main' panicked at src/main.rs:4:6:
index out of bounds: the len is 3 but the index is 99
stack backtrace:
   0: rust_begin_unwind
             at /rustc/f6e511eec7342f59a25f7c0534f1dbea00d01b14/library/std/src/panicking.rs:662:5
   1: core::panicking::panic_fmt
             at /rustc/f6e511eec7342f59a25f7c0534f1dbea00d01b14/library/core/src/panicking.rs:74:14
   2: core::panicking::panic_bounds_check
             at /rustc/f6e511eec7342f59a25f7c0534f1dbea00d01b14/library/core/src/panicking.rs:276:5
   3: <usize as core::slice::index::SliceIndex<[T]>>::index
             at /rustc/f6e511eec7342f59a25f7c0534f1dbea00d01b14/library/core/src/slice/index.rs:302:10
   4: core::slice::index::<impl core::ops::index::Index<I> for [T]>::index
             at /rustc/f6e511eec7342f59a25f7c0534f1dbea00d01b14/library/core/src/slice/index.rs:16:9
   5: <alloc::vec::Vec<T,A> as core::ops::index::Index<I>>::index
             at /rustc/f6e511eec7342f59a25f7c0534f1dbea00d01b14/library/alloc/src/vec/mod.rs:2920:9
   6: panic::main
             at ./src/main.rs:4:6
   7: core::ops::function::FnOnce::call_once
             at /rustc/f6e511eec7342f59a25f7c0534f1dbea00d01b14/library/core/src/ops/function.rs:250:5
note: Some details are omitted, run with `RUST_BACKTRACE=full` for a verbose backtrace.
```

代码清单 9-2：当设置了环境变量 RUST_BACKTRACE 时，由 panic! 调用生成的回溯

这是很多输出！你看到的确切输出可能会根据你的操作系统和 Rust 版本而有所不同。要获取带有此信息的回溯，必须启用调试符号。调试符号在使用 cargo build 或 cargo run 且没有 --release 标志时默认启用，就像我们在这里所做的那样。

在代码清单 9-2 的输出中，回溯的第 6 行指向我们项目中导致问题的行：src/main.rs 的第 4 行。如果我们不希望程序 panic，应该从指向我们编写的文件的第一行提到的位置开始调查。在代码清单 9-1 中，我们故意编写了会 panic 的代码，修复 panic 的方法是不请求超出向量索引范围的元素。当你的代码将来 panic 时，你需要弄清楚代码正在执行什么操作，使用什么值导致了 panic，以及代码应该做什么。

我们将在本章后面的"要 panic! 还是不要 panic!"部分回到 panic! 以及何时应该和不应该使用 panic! 来处理错误情况。接下来，我们将看看如何使用 Result 从错误中恢复。
