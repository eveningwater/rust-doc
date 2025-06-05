## 共享状态并发

消息传递是处理并发的一种好方法，但它不是唯一的方法。另一种方法是让多个线程访问相同的共享数据。再次考虑Go语言文档中的这部分口号："不要通过共享内存来通信。"

通过共享内存进行通信会是什么样子？此外，为什么消息传递的爱好者会警告不要使用内存共享？

在某种程度上，任何编程语言中的通道都类似于单一所有权，因为一旦你通过通道传输一个值，你就不应该再使用该值。共享内存并发就像多重所有权：多个线程可以同时访问相同的内存位置。正如你在第15章中看到的，智能指针使多重所有权成为可能，多重所有权可能会增加复杂性，因为这些不同的所有者需要管理。Rust的类型系统和所有权规则极大帮助我们正确地进行这种管理。作为一个例子，让我们看看互斥锁，这是共享内存的一种更常见的并发原语。

### 使用互斥锁允许一次只有一个线程访问数据

互斥锁是互斥（mutual exclusion）的缩写，意思是互斥锁在任何给定时间只允许一个线程访问某些数据。要访问互斥锁中的数据，线程必须首先通过请求获取互斥锁的锁来表明它想要访问。锁是互斥锁的一部分数据结构，它跟踪谁当前拥有对数据的独占访问权。因此，互斥锁被描述为通过锁定系统保护它所持有的数据。

互斥锁因难以使用而声名狼藉，因为你必须记住两条规则：

1. 在使用数据之前，你必须尝试获取锁。
2. 当你完成了互斥锁保护的数据后，你必须解锁数据，这样其他线程才能获取锁。

对于互斥锁的现实世界比喻，想象一个只有一个麦克风的会议小组讨论。在发言者可以说话之前，他们必须询问或示意他们想要使用麦克风。当他们拿到麦克风时，他们可以想说多久就说多久，然后将麦克风交给下一个请求发言的小组成员。如果一个小组成员在使用完麦克风后忘记交出麦克风，那么其他人就无法发言。如果共享麦克风的管理出错，小组讨论就不会按计划进行！

互斥锁的管理可能非常难以正确实现，这就是为什么这么多人对通道充满热情的原因。然而，由于Rust的类型系统和所有权规则，你不可能错误地锁定和解锁。

#### `Mutex<T>`的API

作为如何使用互斥锁的一个例子，让我们从在单线程上下文中使用互斥锁开始，如示例16-12所示。

文件名：src/main.rs：

```rust
use std::sync::Mutex;

fn main() {
    let m = Mutex::new(5);

    {
        let mut num = m.lock().unwrap();
        *num = 6;
    }

    println!("m = {m:?}");
}
```

示例16-12：为了简单起见，在单线程上下文中探索`Mutex<T>`的API

与许多类型一样，我们使用关联函数`new`创建一个`Mutex<T>`。要访问互斥锁内部的数据，我们使用`lock`方法获取锁。这个调用将阻塞当前线程，使其无法做任何工作，直到轮到我们拥有锁。

如果另一个持有锁的线程发生恐慌，`lock`调用将失败。在这种情况下，没有人能够获取锁，所以我们选择`unwrap`，如果我们处于这种情况，就让这个线程恐慌。

在我们获取锁后，我们可以将返回值（在这种情况下命名为`num`）视为对内部数据的可变引用。类型系统确保我们在使用`m`中的值之前获取锁。`m`的类型是`Mutex<i32>`，而不是`i32`，所以我们必须调用`lock`才能使用`i32`值。我们不能忘记；否则类型系统不会让我们访问内部的`i32`。

你可能猜到了，`Mutex<T>`是一个智能指针。更准确地说，`lock`调用返回一个名为`MutexGuard`的智能指针，包装在我们通过调用`unwrap`处理的`LockResult`中。`MutexGuard`智能指针实现了`Deref`以指向我们的内部数据；该智能指针还有一个`Drop`实现，当`MutexGuard`超出作用域时自动释放锁，这发生在内部作用域的末尾。因此，我们不会忘记释放锁并阻止互斥锁被其他线程使用的风险，因为锁的释放是自动发生的。

在释放锁后，我们可以打印互斥锁的值，并看到我们能够将内部的`i32`更改为6。

#### 在多个线程之间共享`Mutex<T>`

现在让我们尝试使用`Mutex<T>`在多个线程之间共享一个值。我们将启动10个线程，每个线程将计数器值增加1，这样计数器就会从0增加到10。示例16-13中的例子将有一个编译器错误，我们将使用该错误来了解更多关于使用`Mutex<T>`的信息，以及Rust如何帮助我们正确使用它。

文件名：src/main.rs：

```rust
use std::sync::Mutex;
use std::thread;

fn main() {
    let counter = Mutex::new(0);
    let mut handles = vec![];

    for _ in 0..10 {
        let handle = thread::spawn(move || {
            let mut num = counter.lock().unwrap();

            *num += 1;
        });
        handles.push(handle);
    }

    for handle in handles {
        handle.join().unwrap();
    }

    println!("Result: {}", *counter.lock().unwrap());
}
```

示例16-13：十个线程，每个线程都增加一个由`Mutex<T>`保护的计数器

我们创建一个`counter`变量来保存`Mutex<T>`内部的`i32`，就像我们在示例16-12中做的那样。接下来，我们通过迭代一系列数字来创建10个线程。我们使用`thread::spawn`并给所有线程相同的闭包：一个将计数器移动到线程中，通过调用`lock`方法获取`Mutex<T>`上的锁，然后将互斥锁中的值加1的闭包。当一个线程完成运行其闭包时，`num`将超出作用域并释放锁，这样另一个线程就可以获取它。

在主线程中，我们收集所有的join句柄。然后，就像我们在示例16-2中做的那样，我们在每个句柄上调用`join`以确保所有线程都完成。此时，主线程将获取锁并打印此程序的结果。

我们暗示这个例子不会编译。现在让我们找出原因！

```rust
$ cargo run
   Compiling shared-state v0.1.0 (file:///projects/shared-state)
error[E0382]: borrow of moved value: `counter`
  --> src/main.rs:21:29
   |
5  |     let counter = Mutex::new(0);
   |         ------- move occurs because `counter` has type `Mutex<i32>`, which does not implement the `Copy` trait
...
8  |     for _ in 0..10 {
   |     -------------- inside of this loop
9  |         let handle = thread::spawn(move || {
   |                                    ------- value moved into closure here, in previous iteration of loop
...
21 |     println!("Result: {}", *counter.lock().unwrap());
   |                             ^^^^^^^ value borrowed here after move
   |
help: consider moving the expression out of the loop so it is only moved once
   |
8  ~     let mut value = counter.lock();
9  ~     for _ in 0..10 {
10 |         let handle = thread::spawn(move || {
11 ~             let mut num = value.unwrap();
   |

For more information about this error, try `rustc --explain E0382`.
error: could not compile `shared-state` (bin "shared-state") due to 1 previous error
```

错误消息指出，`counter`值在循环的前一次迭代中被移动了。Rust告诉我们，我们不能将锁`counter`的所有权移动到多个线程中。让我们用我们在第15章中讨论的多重所有权方法来修复编译器错误。

#### 多线程的多重所有权

在第15章中，我们通过使用智能指针`Rc<T>`创建一个引用计数值，将一个值给了多个所有者。让我们在这里做同样的事情，看看会发生什么。我们将在示例16-14中将`Mutex<T>`包装在`Rc<T>`中，并在将所有权移动到线程之前克隆`Rc<T>`。

文件名：src/main.rs：

```rust
use std::rc::Rc;
use std::sync::Mutex;
use std::thread;

fn main() {
    let counter = Rc::new(Mutex::new(0));
    let mut handles = vec![];

    for _ in 0..10 {
        let counter = Rc::clone(&counter);
        let handle = thread::spawn(move || {
            let mut num = counter.lock().unwrap();

            *num += 1;
        });
        handles.push(handle);
    }

    for handle in handles {
        handle.join().unwrap();
    }

    println!("Result: {}", *counter.lock().unwrap());
}
```

示例16-14：尝试使用`Rc<T>`允许多个线程拥有`Mutex<T>`

再次编译，我们得到了...不同的错误！编译器正在教我们很多东西。

```rust
$ cargo run
   Compiling shared-state v0.1.0 (file:///projects/shared-state)
error[E0277]: `Rc<Mutex<i32>>` cannot be sent between threads safely
   --> src/main.rs:11:36
    |
11  |           let handle = thread::spawn(move || {
    |                        ------------- ^------
    |                        |             |
    |  ______________________|_____________within this `{closure@src/main.rs:11:36: 11:43}`
    | |                      |
    | |                      required by a bound introduced by this call
12  | |             let mut num = counter.lock().unwrap();
13  | |
14  | |             *num += 1;
15  | |         });
    | |_________^ `Rc<Mutex<i32>>` cannot be sent between threads safely
    |
    = help: within `{closure@src/main.rs:11:36: 11:43}`, the trait `Send` is not implemented for `Rc<Mutex<i32>>`
note: required because it's used within this closure
   --> src/main.rs:11:36
    |
11  |         let handle = thread::spawn(move || {
    |                                    ^^^^^^^
note: required by a bound in `spawn`
   --> file:///home/.rustup/toolchains/1.85/lib/rustlib/src/rust/library/std/src/thread/mod.rs:731:8
    |
728 | pub fn spawn<F, T>(f: F) -> JoinHandle<T>
    |        ----- required by a bound in this function
...
731 |     F: Send + 'static,
    |        ^^^^ required by this bound in `spawn`

For more information about this error, try `rustc --explain E0277`.
error: could not compile `shared-state` (bin "shared-state") due to 1 previous error
```

哇，这个错误消息真的很长！这里要关注的重要部分是：<code>`Rc<Mutex<i32>>` cannot be sent between threads safely</code>。编译器还告诉我们原因：<code>the trait `Send` is not implemented for `Rc<Mutex<i32>>`</code>。我们将在下一节讨论`Send`：它是确保我们与线程一起使用的类型适用于并发情况的特性之一。

不幸的是，`Rc<T>`不能安全地在线程间共享。当`Rc<T>`管理引用计数时，它为每次调用`clone`增加计数，并在每个克隆被丢弃时减少计数。但它没有使用任何并发原语来确保对计数的更改不会被另一个线程中断。这可能导致错误的计数——微妙的错误，反过来可能导致内存泄漏或在我们完成之前值被丢弃。我们需要的是一个类型，它与`Rc<T>`完全相同，但以线程安全的方式更改引用计数。

#### 使用`Arc<T>`进行原子引用计数

幸运的是，`Arc<T>`是一种类似于`Rc<T>`的类型，可以安全地用于并发情况。a代表原子（atomic），意味着它是一个原子引用计数类型。原子是我们在这里不会详细介绍的另一种并发原语：有关更多详细信息，请参阅标准库文档[std::sync::atomic](https://doc.rust-lang.org/std/sync/atomic/index.html)。此时，你只需要知道原子像原始类型一样工作，但可以安全地在线程之间共享。

你可能会想，为什么所有的原始类型都不是原子的，为什么标准库类型默认不使用`Arc<T>`实现。原因是线程安全带来了性能惩罚，你只想在真正需要时才付出这种代价。如果你只是在单个线程内对值执行操作，如果你的代码不必强制执行原子提供的保证，它可以运行得更快。

让我们回到我们的例子：`Arc<T>`和`Rc<T>`有相同的API，所以我们通过更改`use`行、对`new`的调用和对`clone`的调用来修复我们的程序。示例16-15中的代码最终将编译并运行。

文件名：src/main.rs：

```rust
use std::sync::{Arc, Mutex};
use std::thread;

fn main() {
    let counter = Arc::new(Mutex::new(0));
    let mut handles = vec![];

    for _ in 0..10 {
        let counter = Arc::clone(&counter);
        let handle = thread::spawn(move || {
            let mut num = counter.lock().unwrap();

            *num += 1;
        });
        handles.push(handle);
    }

    for handle in handles {
        handle.join().unwrap();
    }

    println!("Result: {}", *counter.lock().unwrap());
}
```

示例16-15：使用`Arc<T>`包装`Mutex<T>`以能够在多个线程之间共享所有权

这段代码将打印以下内容：

```rust
Result: 10
```

我们做到了！我们从0数到10，这可能看起来不是很令人印象深刻，但它确实教会了我们很多关于`Mutex<T>`和线程安全的知识。你也可以使用这个程序的结构来做比仅仅增加计数器更复杂的操作。使用这种策略，你可以将计算分成独立的部分，将这些部分分散到线程中，然后使用`Mutex<T>`让每个线程用它的部分更新最终结果。

请注意，如果你在进行简单的数值操作，标准库的[std::sync::atomic模块](https://doc.rust-lang.org/std/sync/atomic/index.html)提供了比`Mutex<T>`类型更简单的类型。这些类型为原始类型提供安全、并发、原子访问。我们选择在这个例子中使用带有原始类型的`Mutex<T>`，这样我们就可以专注于`Mutex<T>`如何工作。

### `RefCell<T>/Rc<T>`和`Mutex<T>/Arc<T>`之间的相似性

你可能已经注意到counter是不可变的，但我们可以获取对其内部值的可变引用；这意味着`Mutex<T>`提供了内部可变性，就像Cell家族一样。以同样的方式，我们在第15章中使用`RefCell<T>`允许我们改变`Rc<T>`内部的内容，我们使用`Mutex<T>`来改变`Arc<T>`内部的内容。

另一个需要注意的细节是，当你使用`Mutex<T>`时，Rust不能保护你免受所有类型的逻辑错误。回想一下第15章，使用`Rc<T>`带来了创建引用循环的风险，其中两个`Rc<T>`值相互引用，导致内存泄漏。同样，`Mutex<T>`带来了创建死锁的风险。当一个操作需要锁定两个资源，而两个线程各自获取了一个锁，导致它们永远相互等待时，就会发生这种情况。如果你对死锁感兴趣，尝试创建一个有死锁的Rust程序；然后研究任何语言中互斥锁的死锁缓解策略，并尝试在Rust中实现它们。`Mutex<T>`和`MutexGuard`的标准库API文档提供了有用的信息。

我们将通过讨论`Send`和`Sync`特性以及如何将它们与自定义类型一起使用来结束本章。