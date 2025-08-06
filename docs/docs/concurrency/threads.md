## 使用线程同时运行代码

在大多数当前的操作系统中，已执行程序的代码在一个进程中运行，操作系统会同时管理多个进程。在一个程序内部，你也可以拥有同时运行的独立部分。运行这些独立部分的功能被称为线程。例如，一个网络服务器可以拥有多个线程，这样它就可以同时响应多个请求。

将程序中的计算分割成多个线程以同时运行多个任务可以提高性能，但也增加了复杂性。因为线程可以同时运行，所以不同线程上的代码部分的运行顺序没有固有的保证。这可能导致以下问题：

* 竞态条件，其中线程以不一致的顺序访问数据或资源
* 死锁，其中两个线程相互等待，阻止两个线程继续执行
* 只在特定情况下发生且难以可靠地重现和修复的错误

Rust 尝试减轻使用线程的负面影响，但在多线程环境中编程仍然需要仔细思考，并且需要与单线程程序不同的代码结构。

编程语言以几种不同的方式实现线程，许多操作系统提供了语言可以调用的用于创建新线程的 API。Rust 标准库使用 1:1 的线程实现模型，即程序为每个语言线程使用一个操作系统线程。有些 crate 实现了其他线程模型，与 1:1 模型相比做出了不同的权衡。（我们将在下一章看到的 Rust 的异步系统也提供了另一种并发方法。）

## 使用`spawn`创建新线程

要创建一个新线程，我们调用`thread::spawn`函数并传递一个闭包（我们在第13章讨论过闭包），其中包含我们想在新线程中运行的代码。示例16-1从主线程打印一些文本，从新线程打印其他文本：

文件名：src/main.rs:

```rust
use std::thread;
use std::time::Duration;

fn main() {
    thread::spawn(|| {
        for i in 1..10 {
            println!("hi number {i} from the spawned thread!");
            thread::sleep(Duration::from_millis(1));
        }
    });

    for i in 1..5 {
        println!("hi number {i} from the main thread!");
        thread::sleep(Duration::from_millis(1));
    }
}
```

示例16-1：创建一个新线程打印一些内容，同时主线程打印其他内容

请注意，当Rust程序的主线程完成时，所有产生的线程都会被关闭，无论它们是否已经完成运行。这个程序的输出每次可能会有些不同，但它看起来会类似于以下内容：

```rust
hi number 1 from the main thread!
hi number 1 from the spawned thread!
hi number 2 from the main thread!
hi number 2 from the spawned thread!
hi number 3 from the main thread!
hi number 3 from the spawned thread!
hi number 4 from the main thread!
hi number 4 from the spawned thread!
hi number 5 from the spawned thread!
```

对`thread::sleep`的调用强制线程暂停执行一小段时间，允许不同的线程运行。线程可能会轮流执行，但这并不能保证：这取决于你的操作系统如何调度线程。在这次运行中，主线程首先打印，尽管代码中产生的线程的打印语句首先出现。而且尽管我们告诉产生的线程打印直到`i`是`9`，但在主线程关闭之前它只打印到了`5`。

如果你运行这段代码，只看到来自主线程的输出，或者没有看到任何重叠，尝试增加范围中的数字，为操作系统在线程之间切换创造更多机会。

## 使用`join`句柄等待所有线程完成

示例16-1中的代码不仅因为主线程结束而大多数时候过早地停止了产生的线程，而且由于线程运行顺序没有保证，我们也不能保证产生的线程会运行！

我们可以通过将`thread::spawn`的返回值保存在一个变量中来解决产生的线程不运行或过早结束的问题。`thread::spawn`的返回类型是`JoinHandle<T>`。`JoinHandle<T>`是一个拥有所有权的值，当我们在它上面调用`join`方法时，将等待其线程完成。示例16-2展示了如何使用我们在示例16-1中创建的线程的`JoinHandle<T>`，以及如何调用`join`以确保产生的线程在`main`退出前完成。

文件名：src/main.rs:

```rust
use std::thread;
use std::time::Duration;

fn main() {
    let handle = thread::spawn(|| {
        for i in 1..10 {
            println!("hi number {i} from the spawned thread!");
            thread::sleep(Duration::from_millis(1));
        }
    });

    for i in 1..5 {
        println!("hi number {i} from the main thread!");
        thread::sleep(Duration::from_millis(1));
    }

    handle.join().unwrap();
}
```

示例16-2：保存`thread::spawn`返回的`JoinHandle<T>`以保证线程运行完成

在句柄上调用`join`会阻塞当前运行的线程，直到由该句柄表示的线程终止。阻塞线程意味着该线程被阻止执行工作或退出。因为我们将对`join`的调用放在主线程的`for`循环之后，运行示例16-2应该产生类似于以下的输出：

```rust
hi number 1 from the main thread!
hi number 2 from the main thread!
hi number 1 from the spawned thread!
hi number 3 from the main thread!
hi number 2 from the spawned thread!
hi number 4 from the main thread!
hi number 3 from the spawned thread!
hi number 4 from the spawned thread!
hi number 5 from the spawned thread!
hi number 6 from the spawned thread!
hi number 7 from the spawned thread!
hi number 8 from the spawned thread!
hi number 9 from the spawned thread!
```

这两个线程继续交替执行，但主线程因为调用了`handle.join()`而等待，直到产生的线程完成才结束。

但让我们看看当我们将`handle.join()`移到`main`中的`for`循环之前会发生什么，像这样：

文件名：src/main.rs:

```rust
use std::thread;
use std::time::Duration;

fn main() {
    let handle = thread::spawn(|| {
        for i in 1..10 {
            println!("hi number {i} from the spawned thread!");
            thread::sleep(Duration::from_millis(1));
        }
    });

    handle.join().unwrap();

    for i in 1..5 {
        println!("hi number {i} from the main thread!");
        thread::sleep(Duration::from_millis(1));
    }
}
```

主线程将等待产生的线程完成，然后运行它的`for`循环，所以输出不会再交错，如下所示：

```rust
hi number 1 from the spawned thread!
hi number 2 from the spawned thread!
hi number 3 from the spawned thread!
hi number 4 from the spawned thread!
hi number 5 from the spawned thread!
hi number 6 from the spawned thread!
hi number 7 from the spawned thread!
hi number 8 from the spawned thread!
hi number 9 from the spawned thread!
hi number 1 from the main thread!
hi number 2 from the main thread!
hi number 3 from the main thread!
hi number 4 from the main thread!
```

像`join`被调用的位置这样的小细节，可以影响你的线程是否同时运行。

## 在线程中使用`move`闭包

我们经常在传递给`thread::spawn`的闭包中使用`move`关键字，因为闭包会获取它从环境中使用的值的所有权，从而将这些值的所有权从一个线程转移到另一个线程。在第13章的["使用闭包捕获环境"](../functional-features/closures#使用闭包捕获环境)中，我们讨论了闭包上下文中的`move`。现在，我们将更多地关注`move`和`thread::spawn`之间的交互。

注意在示例16-1中，我们传递给`thread::spawn`的闭包不接受任何参数：我们没有在产生的线程的代码中使用来自主线程的任何数据。要在产生的线程中使用来自主线程的数据，产生的线程的闭包必须捕获它需要的值。示例16-3展示了在主线程中创建一个向量并在产生的线程中使用它的尝试。然而，这还不能工作，你很快就会看到。

文件名：src/main.rs:

```rust
use std::thread;

fn main() {
    let v = vec![1, 2, 3];

    let handle = thread::spawn(|| {
        println!("Here's a vector: {v:?}");
    });

    handle.join().unwrap();
}
```

示例16-3：尝试在另一个线程中使用由`main`线程创建的向量

闭包使用了`v`，所以它会捕获`v`并使其成为闭包环境的一部分。因为`thread::spawn`在新线程中运行这个闭包，我们应该能够在新线程内部访问`v`。但当我们编译这个例子时，会得到以下错误：

```rust
$ cargo run
   Compiling threads v0.1.0 (file:///projects/threads)
error[E0373]: closure may outlive the current function, but it borrows `v`, which is owned by the current function
 --> src/main.rs:6:32
  |
6 |     let handle = thread::spawn(|| {
  |                                ^^ may outlive borrowed value `v`
7 |         println!("Here's a vector: {v:?}");
  |                                     - `v` is borrowed here
  |
note: function requires argument type to outlive `'static`
 --> src/main.rs:6:18
  |
6 |       let handle = thread::spawn(|| {
  |  __________________^
7 | |         println!("Here's a vector: {v:?}");
8 | |     });
  | |______^
help: to force the closure to take ownership of `v` (and any other referenced variables), use the `move` keyword
  |
6 |     let handle = thread::spawn(move || {
  |                                ++++

For more information about this error, try `rustc --explain E0373`.
error: could not compile `threads` (bin "threads") due to 1 previous error
```

Rust推断如何捕获`v`，因为`println!`只需要对`v`的引用，所以闭包尝试借用`v`。然而，有一个问题：Rust不能确定产生的线程会运行多长时间，所以它不知道对`v`的引用是否始终有效。

示例16-4提供了一个更可能有对`v`的引用无效的场景：

文件名：src/main.rs:

```rust
use std::thread;

fn main() {
    let v = vec![1, 2, 3];

    let handle = thread::spawn(|| {
        println!("Here's a vector: {v:?}");
    });

    drop(v); // oh no!

    handle.join().unwrap();
}
```

示例16-4：一个线程，其闭包尝试捕获对`v`的引用，而主线程会丢弃`v`

如果Rust允许我们运行这段代码，产生的线程可能会立即被放到后台而根本不运行。产生的线程内部有对`v`的引用，但主线程立即丢弃`v`，使用我们在第15章讨论过的`drop`函数。然后，当产生的线程开始执行时，`v`不再有效，所以对它的引用也无效。糟糕！

要修复示例16-3中的编译器错误，我们可以使用错误消息的建议：

```rust
help: to force the closure to take ownership of `v` (and any other referenced variables), use the `move` keyword
  |
6 |     let handle = thread::spawn(move || {
  |                                ++++
```

通过在闭包前添加`move`关键字，我们强制闭包获取它使用的值的所有权，而不是让Rust推断它应该借用这些值。示例16-5中对示例16-3的修改将按照我们的意图编译和运行。

文件名：src/main.rs:

```rust
use std::thread;

fn main() {
    let v = vec![1, 2, 3];

    let handle = thread::spawn(move || {
        println!("Here's a vector: {v:?}");
    });

    handle.join().unwrap();
}
```

示例16-5：使用`move`关键字强制闭包获取它使用的值的所有权

我们可能会尝试使用相同的方法来修复示例16-4中主线程调用`drop`的代码，使用`move`闭包。然而，这个修复不会起作用，因为示例16-4尝试做的事情因为不同的原因而被禁止。如果我们在闭包中添加`move`，我们会将`v`移动到闭包的环境中，并且我们不能再在主线程中对它调用`drop`。我们会得到这样的编译器错误：

```rust
$ cargo run
   Compiling threads v0.1.0 (file:///projects/threads)
error[E0382]: use of moved value: `v`
  --> src/main.rs:10:10
   |
4  |     let v = vec![1, 2, 3];
   |         - move occurs because `v` has type `Vec<i32>`, which does not implement the `Copy` trait
5  |
6  |     let handle = thread::spawn(move || {
   |                                ------- value moved into closure here
7  |         println!("Here's a vector: {v:?}");
   |                                     - variable moved due to use in closure
...
10 |     drop(v); // oh no!
   |          ^ value used here after move

For more information about this error, try `rustc --explain E0382`.
error: could not compile `threads` (bin "threads") due to 1 previous error
```

Rust的所有权规则再次拯救了我们！我们从示例16-3的代码中得到一个错误，因为Rust很保守，只为线程借用`v`，这意味着主线程理论上可以使产生的线程的引用无效。通过告诉Rust将`v`的所有权移动到产生的线程，我们向Rust保证主线程不会再使用`v`。如果我们以相同的方式更改示例16-4，当我们尝试在主线程中使用`v`时，我们就违反了所有权规则。`move`关键字覆盖了Rust保守的借用默认行为；它不允许我们违反所有权规则。

现在我们已经介绍了什么是线程以及线程API提供的方法，让我们看看一些可以使用线程的情况。