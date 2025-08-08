## 深入了解异步特性

在本章中，我们以各种方式使用了 `Future`、`Pin`、`Unpin`、`Stream` 和 `StreamExt` 特性。到目前为止，我们避免深入探讨它们的工作原理或如何协同工作，这在日常 Rust 工作中通常是没问题的。然而，有时你会遇到需要了解更多这些细节的情况。在本节中，我们将深入探讨足够多的细节来帮助你应对这些情况，同时将更深入的探讨留给其他文档。

## Future 特性

让我们先来仔细看看 `Future` 特性是如何工作的。以下是 Rust 对它的定义：

```rust
#![allow(unused)]
fn main() {
    use std::pin::Pin;
    use std::task::{Context, Poll};

    pub trait Future {
        type Output;

        fn poll(self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Self::Output>;
    }
}
```

这个特性定义包含了一堆新类型，以及一些我们以前没见过的语法，所以让我们逐一讲解这个定义。

首先，`Future` 的关联类型 `Output` 表示 `future` 解析后的结果。这类似于 `Iterator` 特性的 `Item` 关联类型。其次，`Future` 还有一个 `poll` 方法，它接受一个特殊的 `Pin` 引用作为其 `self` 参数，以及一个 `Context` 类型的可变引用，并返回一个 `Poll<Self::Output>`。我们稍后会详细讨论 `Pin` 和 `Context`。现在，让我们关注该方法返回的 `Poll` 类型：

```rust
#![allow(unused)]
fn main() {
    enum Poll<T> {
        Ready(T),
        Pending,
    }
}
```

这个 `Poll` 类型类似于 `Option`。它有一个包含值的变体 `Ready(T)`，以及一个不包含值的变体 `Pending`。然而，`Poll` 的含义与 `Option` 大不相同！`Pending` 变体表示 `future` 仍有工作要做，因此调用者需要稍后再次检查。`Ready` 变体表示 `future` 已完成其工作，并且 `T` 值可用。

> 注意：对于大多数 `future`，在 `future` 返回 `Ready` 后，调用者不应再次调用 `poll`。许多 `future` 在变为 `Ready` 后如果再次被 `poll`，将会 `panic`。可以安全地再次 `poll` 的 `future` 会在其文档中明确说明。这类似于 `Iterator::next` 的行为。

当你看到使用 `await` 的代码时，Rust 会在底层将其编译为调用 `poll` 的代码。如果你回顾示例 17-4，我们在其中打印了单个 URL 解析后的页面标题，Rust 会将其编译成类似（但不完全相同）这样的代码：

```rust
match page_title(url).poll() {
    Ready(page_title) => match page_title {
        Some(title) => println!("The title for {url} was {title}"),
        None => println!("{url} had no title"),
    }
    Pending => {
        // But what goes here?
    }
}
```

当 `future` 仍处于 `Pending` 状态时，我们该怎么办？我们需要某种方式来一次又一次地尝试，直到 `future` 最终准备就绪。换句话说，我们需要一个循环：

```rust
let mut page_title_fut = page_title(url);
loop {
    match page_title_fut.poll() {
        Ready(value) => match page_title {
            Some(title) => println!("The title for {url} was {title}"),
            None => println!("{url} had no title"),
        }
        Pending => {
            // continue
        }
    }
}
```

然而，如果 Rust 将其编译成完全相同的代码，那么每个 `await` 都将是阻塞的——这与我们想要达到的目标完全相反！相反，Rust 确保循环可以将控制权交给某个可以暂停此 `future` 的工作以处理其他 `future`，然后稍后再次检查此 `future` 的东西。正如我们所看到的，这个东西就是异步运行时，而这种调度和协调工作是其主要职责之一。

在本章前面，我们描述了等待 `rx.recv`。`recv` 调用返回一个 `future`，并且 `await` 该 `future` 会对其进行 `poll`。我们注意到，运行时会暂停 `future`，直到通道关闭时它准备好 `Some(message)` 或 `None`。通过我们对 `Future` 特性，特别是 `Future::poll` 的更深入理解，我们可以看到它是如何工作的。当 `future` 返回 `Poll::Pending` 时，运行时知道 `future` 尚未准备好。相反，当 `poll` 返回 `Poll::Ready(Some(message))` 或 `Poll::Ready(None)` 时，运行时知道 `future` 已准备好并推进它。

运行时如何做到这一点的具体细节超出了本文档的范围，但关键是了解 `future` 的基本机制：运行时 `poll` 它负责的每个 `future`，并在 `future` 尚未准备好时将其重新置于休眠状态。

## Pin 和 Unpin 特性

在 示例 17-16 中介绍 Pin 的概念时，我们遇到了一个非常棘手的错误消息。下面是它的相关部分：

```rust
error[E0277]: `{async block@src/main.rs:10:23: 10:33}` cannot be unpinned
  --> src/main.rs:48:33
   |
48 |         trpl::join_all(futures).await;
   |                                 ^^^^^ the trait `Unpin` is not implemented for `{async block@src/main.rs:10:23: 10:33}`
   |
   = note: consider using the `pin!` macro
           consider using `Box::pin` if you need to access the pinned value outside of the current scope
   = note: required for `Box<{async block@src/main.rs:10:23: 10:33}>` to implement `Future`
note: required by a bound in `futures_util::future::join_all::JoinAll`
  --> file:///home/.cargo/registry/src/index.crates.io-1949cf8c6b5b557f/futures-util-0.3.30/src/future/join_all.rs:29:8
   |
27 | pub struct JoinAll<F>
   |            ------- required by a bound in this struct
28 | where
29 |     F: Future,
   |        ^^^^^^ required by this bound in `JoinAll`
```

这个错误消息不仅告诉我们需要固定值，还告诉我们为什么需要固定。`trpl::join_all` 函数返回一个名为 `JoinAll` 的结构体。该结构体是泛型类型 `F`，它被约束为实现 `Future` 特性。直接使用 `await` 等待 future 会隐式地固定 future。这就是为什么我们不需要在每次等待 future 时都使用 `pin!`。

然而，我们在这里并没有直接等待 future。相反，我们通过将 future 集合传递给 `join_all` 函数来构造一个新的 future，即 `JoinAll`。`join_all` 的签名要求集合中所有项的类型都实现 `Future` 特性`Box<T>` 仅当它包装的 `T` 是实现 `Unpin` 特性的 future 时才实现 `Future`。

这需要吸收很多信息！为了真正理解它，让我们进一步深入了解 `Future` 特性的实际工作原理，特别是关于固定的部分。

再次查看 `Future` 特性的定义：

```rust
#![allow(unused)]
fn main() {
    use std::pin::Pin;
    use std::task::{Context, Poll};

    pub trait Future {
        type Output;

        // Required method
        fn poll(self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Self::Output>;
    }
}
```

cx 参数及其 Context 类型是运行时如何知道何时检查任何给定 Future 的关键，同时保持惰性。同样，其工作原理的细节超出了本章的范围，通常只有在编写自定义 Future 实现时才需要考虑这一点。我们将重点关注 self 的类型，因为这是我们第一次看到 self 带有类型注解的方法。self 的类型注解与其他函数参数的类型注解类似，但有两个关键区别：

- 它告诉 Rust `self` 必须是什么类型才能调用该方法。
- 它不能是任何类型。它被限制为方法所实现的类型、对该类型的引用或智能指针，或者一个包装了对该类型引用的 `Pin`。

我们将在第 18 章中看到更多关于这种语法的介绍。现在，只需知道如果我们要轮询一个 `future` 以检查它是 `Pending` 还是 `Ready(Output)`，我们需要一个 `Pin` 包装的可变引用。

`Pin` 是一个用于指针类型（如 `&`、`&mut`、`Box` 和 `Rc`）的包装器。（从技术上讲，`Pin` 适用于实现 `Deref` 或 `DerefMut` 特性的类型，但这实际上等同于只处理指针。）`Pin` 本身不是指针，也没有像 `Rc` 和 `Arc` 那样具有引用计数等自己的行为；它纯粹是编译器可以用来强制执行指针使用约束的工具。

回想一下，`await` 是通过调用 `poll` 来实现的，这开始解释了我们之前看到的错误消息，但那是关于 `Unpin` 而不是 `Pin` 的。那么 `Pin` 和 `Unpin` 到底有什么关系，为什么 `Future` 需要 `self` 是 `Pin` 类型才能调用 `poll` 呢？

回想本章前面，`future` 中的一系列 `await` 点被编译成一个状态机，编译器确保该状态机遵循 Rust 所有关于安全性的正常规则，包括借用和所有权。为了实现这一点，Rust 会查看在一个 `await` 点和下一个 `await` 点或异步块结束之间需要哪些数据。然后，它会在编译后的状态机中创建一个相应的变体。每个变体都会获得它在源代码该部分中将使用的数据所需的访问权限，无论是通过获取该数据的所有权，还是通过获取对其的可变或不可变引用。

到目前为止，一切顺利：如果我们在给定的异步块中对所有权或引用有任何错误，借用检查器会告诉我们。当我们想要移动与该块对应的 `future` 时——比如将其移动到 `Vec` 中以传递给 `join_all`——事情就变得棘手了。

当我们移动一个 `future` 时——无论是通过将其推入数据结构以与 `join_all` 一起用作迭代器，还是通过从函数返回它——这实际上意味着移动 Rust 为我们创建的状态机。与 Rust 中的大多数其他类型不同，Rust 为异步块创建的 `future` 最终可能会在任何给定变体的字段中包含对自身的引用，如 图 17-4 中的简化图所示。

![](../images/trpl17-04.svg)

图 17-4：自引用数据类型。

然而，默认情况下，任何具有自引用的对象都是不安全的，因为引用总是指向它们所引用的实际内存地址（参见 图 17-5）。如果你移动数据结构本身，那些内部引用将指向旧位置。然而，该内存位置现在是无效的。一方面，当你更改数据结构时，它的值不会更新。另一方面——更重要的是——计算机现在可以自由地将该内存用于其他目的！你最终可能会在以后读取完全不相关的数据。

![](../images/trpl17-05.svg)

图 17-5：移动自引用数据类型的不安全结果

理论上，Rust 编译器可以尝试在每次移动对象时更新其所有引用，但这可能会增加大量的性能开销，特别是当整个引用网络需要更新时。如果我们能确保相关数据结构在内存中不移动，我们就无需更新任何引用。这正是 Rust 的借用检查器所要求的：在安全代码中，它会阻止你移动任何具有活动引用的项。

`Pin` 在此基础上为我们提供了我们需要的精确保证。当我们通过将指向该值的指针包装在 `Pin` 中来固定一个值时，它就不能再移动了。因此，如果你有 `Pin<Box<SomeType>>`，你实际上固定的是 `SomeType` 值，而不是 `Box` 指针。图 17-6 说明了此过程。

![](../images/trpl17-06.svg)

图 17-6：固定指向自引用 `future` 类型的 `Box`。

实际上，`Box` 指针仍然可以自由移动。请记住：我们关心的是确保最终被引用的数据保持在原位。如果指针移动，但它指向的数据在同一位置，如 图 17-7 所示，则没有潜在问题。作为一项独立练习，请查看这些类型的文档以及 `std::pin` 模块，并尝试找出如何使用包装了 `Box` 的 `Pin` 来实现这一点。关键是自引用类型本身不能移动，因为它仍然被固定。

![](../images/trpl17-07.svg)

图 17-7：移动指向自引用 `future` 类型的 `Box`。

然而，大多数类型即使在 `Pin` 包装器后面，也可以安全地移动。我们只需要在项目具有内部引用时考虑固定。数字和布尔值等基本类型是安全的，因为它们显然没有任何内部引用。Rust 中你通常使用的许多类型也没有。例如，你可以移动 `Vec`，而无需担心。根据我们目前所看到的情况，如果你有一个 `Pin<Vec<String>>`，你必须通过 `Pin` 提供的安全但受限制的 API 来完成所有操作，即使 `Vec<String>` 在没有其他引用的情况下总是可以安全移动的。我们需要一种方法来告诉编译器，在这种情况下移动项目是可以的——这就是 `Unpin` 发挥作用的地方。

`Unpin` 是一个标记特性，类似于我们在第 16 章中看到的 `Send` 和 `Sync` 特性，因此它本身没有功能。标记特性只用于告诉编译器，在特定上下文中安全地使用实现给定特性的类型。`Unpin` 告知编译器，给定类型不需要保证所讨论的值是否可以安全移动。

与 `Send` 和 `Sync` 一样，编译器会自动为所有可以证明安全的类型实现 `Unpin`。一个特殊情况，同样类似于 `Send` 和 `Sync`，是 `Unpin` 未为某个类型实现的情况。其表示法是 `impl !Unpin for SomeType`，其中 `SomeType` 是一个类型名称，它确实需要遵守这些保证，以便在 `Pin` 中使用指向该类型的指针时是安全的。

换句话说，关于 `Pin` 和 `Unpin` 之间的关系，有两点需要记住。首先，`Unpin` 是“正常”情况，而 `!Unpin` 是特殊情况。其次，类型是否实现 `Unpin` 或 `!Unpin` 仅在你使用固定指针（如 `Pin<&mut SomeType>`）时才重要。

为了具体说明，考虑一个 `String`：它有一个长度和组成它的 Unicode 字符。我们可以将 `String` 包装在 `Pin` 中，如 图 17-8 所示。然而，`String` 会自动实现 `Unpin`，Rust 中的大多数其他类型也是如此。

![](../images/trpl17-08.svg)

图 17-8：固定 `String`；虚线表示 `String` 实现了 `Unpin` 特性，因此未被固定。

因此，我们可以做一些如果 `String` 实现了 `!Unpin` 就会非法的事情，例如在内存中的完全相同位置替换一个字符串，如 图 17-9 所示。这不违反 `Pin` 契约，因为 `String` 没有使其移动不安全的内部引用！这正是它实现 `Unpin` 而不是 `!Unpin` 的原因。

![](../images/trpl17-09.svg)

图 17-9：在内存中用完全不同的 `String` 替换 `String`。

现在我们已经足够了解，可以理解 示例 17-17 中 `join_all` 调用报告的错误了。我们最初尝试将异步块生成的 `future` 移动到 `Vec<Box<dyn Future<Output = ()>>>` 中，但正如我们所见，这些 `future` 可能具有内部引用，因此它们不实现 `Unpin`。它们需要被固定，然后我们可以将 `Pin` 类型传递到 `Vec` 中，确信 `future` 中的底层数据不会被移动。

`Pin` 和 `Unpin` 主要对于构建底层库或构建运行时本身很重要，而不是日常 Rust 代码。但是，当你在错误消息中看到这些特性时，现在你将更好地了解如何修复代码！

> 注意：`Pin` 和 `Unpin` 的这种组合使得在 Rust 中安全地实现一整类复杂的类型成为可能，否则这些类型会因为自引用而变得具有挑战性。需要 `Pin` 的类型目前最常出现在异步 Rust 中，但偶尔你也会在其他上下文中看到它们。
>
> `Pin` 和 `Unpin` 的具体工作方式以及它们需要遵守的规则在 `std::pin` 的 API 文档中得到了广泛的介绍，因此如果你有兴趣了解更多信息，这是一个很好的起点。
>
> 如果你想更详细地了解内部工作原理，请参阅 [Rust 中的异步编程](https://rust-lang.github.io/async-book/) 的第 2 章和第 4 章。

## Stream 特性

现在你对 `Future`、`Pin` 和 `Unpin` 特性有了更深入的理解，我们可以将注意力转向 `Stream` 特性。正如你在本章前面所了解到的，流类似于异步迭代器。然而，与 `Iterator` 和 `Future` 不同，`Stream` 在撰写本文时在标准库中没有定义，但 `futures` crate 中有一个非常常见的定义，在整个生态系统中都有使用。

在查看 `Stream` 特性如何将它们合并在一起之前，让我们回顾一下 `Iterator` 和 `Future` 特性的定义。从 `Iterator` 中，我们有了序列的概念：它的 `next` 方法提供了一个 `Option<Self::Item>`。从 `Future` 中，我们有了随时间就绪的概念：它的 `poll` 方法提供了一个 `Poll<Self::Output>`。为了表示随时间就绪的项序列，我们定义了一个将这些功能组合在一起的 `Stream` 特性：

```rust
#![allow(unused)]
fn main() {
    use std::pin::Pin;
    use std::task::{Context, Poll};

    trait Stream {
        type Item;

        fn poll_next(
            self: Pin<&mut Self>,
            cx: &mut Context<'_>
        ) -> Poll<Option<Self::Item>>;
    }
}
```

`Stream` 特性定义了一个名为 `Item` 的关联类型，用于流生成的项的类型。这类似于 `Iterator`，其中可能存在零个到多个项，并且与 `Future` 不同，`Future` 总是只有一个 `Output`，即使它是单元类型 `()`。

`Stream` 还定义了一个获取这些项的方法。我们称之为 `poll_next`，以明确它以与 `Future::poll` 相同的方式进行轮询，并以与 `Iterator::next` 相同的方式生成项序列。它的返回类型结合了 `Poll` 和 `Option`。外部类型是 `Poll`，因为它必须像 `future` 一样检查就绪状态。内部类型是 `Option`，因为它需要像迭代器一样指示是否还有更多消息。

与此定义非常相似的内容很可能会成为 Rust 标准库的一部分。与此同时，它是大多数运行时工具包的一部分，因此你可以依赖它，我们接下来介绍的所有内容通常都适用！

然而，在我们流式处理部分看到的示例中，我们没有使用 `poll_next` 或 `Stream`，而是使用了 `next` 和 `StreamExt`。当然，我们可以通过手动编写自己的 `Stream` 状态机来直接使用 `poll_next` API，就像我们可以通过 `poll` 方法直接使用 `future` 一样。然而，使用 `await` 要好得多，而 `StreamExt` 特性提供了 `next` 方法，这样我们就可以做到这一点：

```rust
#![allow(unused)]
fn main() {
    use std::pin::Pin;
    use std::task::{Context, Poll};

    trait Stream {
        type Item;
        fn poll_next(
            self: Pin<&mut Self>,
            cx: &mut Context<'_>,
        ) -> Poll<Option<Self::Item>>;
    }

    trait StreamExt: Stream {
        async fn next(&mut self) -> Option<Self::Item>
        where
            Self: Unpin;

        // other methods...
    }
}
```

> 注意：我们之前在本章中使用的实际定义与此略有不同，因为它支持尚不支持在特性中使用异步函数的 Rust 版本。
> 因此，它看起来像这样：

```rust
fn next(&mut self) -> Next<'_, Self> where Self: Unpin;
```

> 那个 `Next` 类型是一个实现了 `Future` 的结构体，它允许我们使用 `Next<'_, Self>` 来命名 `self` 引用的生命周期，以便 `await` 可以与此方法一起使用。

`StreamExt` 特性也是可用于流的所有有趣方法的所在地。`StreamExt` 会自动为每个实现 `Stream` 的类型实现，但这些特性是分开定义的，以便社区可以在不影响基础特性的情况下迭代便利 API。

在 `trpl` crate 中使用的 `StreamExt` 版本中，该特性不仅定义了 `next` 方法，还提供了一个 `next` 的默认实现，该实现正确处理了调用 `Stream::poll_next` 的细节。这意味着即使你需要编写自己的流数据类型，你也只需要实现 `Stream`，然后任何使用你的数据类型的人都可以自动使用 `StreamExt` 及其方法。

这就是我们将要介绍的这些特性的底层细节。最后，让我们考虑 `future`（包括流）、任务和线程如何协同工作！
