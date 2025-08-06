## 使用 `Box<T>` 指向堆上的数据

最直接的智能指针是 box，其类型写作 `Box<T>`。Box 允许你将数据存储在堆上而不是栈上。留在栈上的则是指向堆数据的指针。请参考第 4 章来回顾栈和堆的区别。

Box 没有性能开销，除了将数据存储在堆上而不是栈上之外。但它们也没有很多额外的功能。你最常在如下场景中使用它们：

* 当你有一个在编译时无法知道大小的类型，而又想在需要确切大小的上下文中使用这个类型值的时候
* 当你有大量数据并希望在确保数据不被复制的情况下转移所有权的时候
* 当你希望拥有一个值并只关心它的类型是否实现了特定 trait 而不是其具体类型的时候

我们将在 ["使用 Box 实现递归类型"](#使用-box-实现递归类型) 中演示第一种情况。在第二种情况下，转移大量数据的所有权可能会花费很长时间，因为数据在栈上被复制。为了改善这种情况下的性能，我们可以将大量数据存储在堆上的 box 中。这样，只有少量的指针数据在栈上被复制，而它引用的数据则留在堆上的一个位置。第三种情况被称为 trait 对象，第 18 章的 ["使用允许不同类型值的 Trait 对象"](#) 专门讲述了这个主题。所以你在这里学到的内容将在那一节再次用到！

## 使用 `Box<T>` 在堆上存储数据

在讨论 `Box<T>` 的堆存储用例之前，我们将介绍语法以及如何与存储在 `Box<T>` 中的值交互。

示例 15-1 展示了如何使用 box 在堆上存储一个 `i32` 值。

文件名：src/main.rs：

```rust
fn main() {
    let b = Box::new(5);
    println!("b = {b}");
}
```

示例 15-1：使用 box 在堆上存储 `i32` 值

我们定义变量 `b` 的值为指向值 `5` 的 `Box`，该值分配在堆上。这个程序会打印出 `b = 5`；在这种情况下，我们可以像访问栈上数据一样访问 box 中的数据。与任何拥有所有权的值一样，当 box 离开作用域时，如同 `b` 在 `main` 的末尾那样，它将被释放。释放过程既针对 box（存储在栈上）也针对它指向的数据（存储在堆上）。

将单个值放在堆上并不是很有用，所以你不会经常单独这样使用 box。在大多数情况下，像单个 `i32` 这样的值放在栈上（默认存储方式）更为合适。让我们看一个 box 允许我们定义在没有 box 的情况下不允许的类型的情况。

## 使用 Box 实现递归类型

递归类型的值可以拥有作为其自身一部分的相同类型的另一个值。递归类型会造成问题，因为 Rust 需要在编译时知道一个类型占用多少空间。然而，递归类型的值的嵌套理论上可以无限地继续，所以 Rust 无法知道值需要多少空间。由于 box 有已知的大小，我们可以通过在递归类型定义中插入 box 来启用递归类型。

作为递归类型的一个例子，让我们探索一下 cons 列表。这是一种在函数式编程语言中常见的数据类型。除了递归之外，我们将定义的 cons 列表类型很简单；因此，在处理涉及递归类型的更复杂情况时，我们将在示例中使用的概念会很有用。

### 关于 Cons 列表的更多信息

Cons 列表是来自 Lisp 编程语言及其方言的数据结构，由嵌套的对组成，是 Lisp 版本的链表。它的名称来自 Lisp 中的 `cons` 函数（construct function 的缩写），该函数从其两个参数构造一个新的对。通过在由一个值和另一个对组成的对上调用 `cons`，我们可以构建由递归对组成的 cons 列表。

例如，这里是一个包含列表 `1, 2, 3` 的 `cons` 列表的伪代码表示，每个对用括号括起来：

```rust
(1, (2, (3, Nil)))
```

Cons 列表中的每一项包含两个元素：当前项的值和下一项。列表中的最后一项只包含一个称为 `Nil` 的值，没有下一项。Cons 列表通过递归调用 `cons` 函数产生。递归的基本情况的规范名称是 `Nil`。请注意，这与第 6 章中讨论的 "null" 或 "nil" 概念不同，后者是无效或缺失的值。

Cons 列表在 Rust 中并不常用。大多数情况下，当你在 Rust 中有一个项目列表时，`Vec<T>` 是更好的选择。其他更复杂的递归数据类型在各种情况下都很有用，但通过在本章开始时使用 cons 列表，我们可以探索 box 如何让我们定义递归数据类型，而不会有太多干扰。

示例 15-2 包含一个 cons 列表的枚举定义。请注意，这段代码还不能编译，因为 `List` 类型没有已知的大小，我们将演示这一点。

文件名：src/main.rs：

```rust
enum List {
    Cons(i32, List),
    Nil,
}

fn main() {}
```

示例 15-2：第一次尝试定义一个枚举来表示 `i32` 值的 cons 列表数据结构

> 注意：为了本例的目的，我们正在实现一个只持有 `i32` 值的 cons 列表。我们可以使用泛型来实现它，正如我们在第 10 章中讨论的那样，定义一个可以存储任何类型值的 cons 列表类型。

使用 `List` 类型存储列表 `1, 2, 3` 将如示例 15-3 中的代码所示。

文件名：src/main.rs：

```rust
enum List {
    Cons(i32, List),
    Nil,
}

use crate::List::{Cons, Nil};

fn main() {
    let list = Cons(1, Cons(2, Cons(3, Nil)));
}
```

示例 15-3：使用 `List` 枚举存储列表 `1, 2, 3`

第一个 `Cons` 值持有 `1` 和另一个 `List` 值。这个 `List` 值是另一个持有 `2` 和另一个 `List` 值的 `Cons` 值。这个 `List` 值是再一个持有 `3` 和一个 `List` 值的 `Cons` 值，这个 `List` 值最终是 `Nil`，表示列表结束的非递归变体。

如果我们尝试编译示例 15-3 中的代码，我们会得到示例 15-4 中显示的错误。

文件名：output.txt：

```rust
$ cargo run
   Compiling cons-list v0.1.0 (file:///projects/cons-list)
error[E0072]: recursive type `List` has infinite size
 --> src/main.rs:1:1
  |
1 | enum List {
  | ^^^^^^^^^
2 |     Cons(i32, List),
  |               ---- recursive without indirection
  |
help: insert some indirection (e.g., a `Box`, `Rc`, or `&`) to break the cycle
  |
2 |     Cons(i32, Box<List>),
  |               ++++    +

error[E0391]: cycle detected when computing when `List` needs drop
 --> src/main.rs:1:1
  |
1 | enum List {
  | ^^^^^^^^^
  |
  = note: ...which immediately requires computing when `List` needs drop again
  = note: cycle used when computing whether `List` needs drop
  = note: see https://rustc-dev-guide.rust-lang.org/overview.html#queries and https://rustc-dev-guide.rust-lang.org/query.html for more information

Some errors have detailed explanations: E0072, E0391.
For more information about an error, try `rustc --explain E0072`.
error: could not compile `cons-list` (bin "cons-list") due to 2 previous errors
```

示例 15-4：尝试定义递归枚举时得到的错误

错误显示这个类型 "具有无限大小"。原因是我们定义了一个具有递归变体的 `List`：它直接持有自身的另一个值。因此，Rust 无法计算存储 `List` 值需要多少空间。让我们分析一下为什么会得到这个错误。首先，我们来看看 Rust 如何决定需要多少空间来存储非递归类型的值。

### 计算非递归类型的大小

回想一下我们在第 6 章讨论枚举定义时在示例 6-2 中定义的 `Message` 枚举：

```rust
enum Message {
    Quit,
    Move { x: i32, y: i32 },
    Write(String),
    ChangeColor(i32, i32, i32),
}

fn main() {}
```

为了确定为 `Message` 值分配多少空间，Rust 会检查每个变体，看哪个变体需要最多的空间。Rust 发现 `Message::Quit` 不需要任何空间，`Message::Move` 需要足够的空间来存储两个 `i32` 值，依此类推。因为只会使用一个变体，所以 `Message` 值需要的最大空间就是存储其最大变体所需的空间。

将此与 Rust 尝试确定递归类型（如示例 15-2 中的 `List` 枚举）需要多少空间时发生的情况进行对比。编译器首先查看 `Cons` 变体，它持有一个 `i32` 类型的值和一个 `List` 类型的值。因此，`Cons` 需要的空间等于 `i32` 的大小加上 `List` 的大小。为了计算 `List` 类型需要多少内存，编译器查看其变体，从 `Cons` 变体开始。`Cons` 变体持有一个 `i32` 类型的值和一个 `List` 类型的值，这个过程无限继续，如图 15-1 所示。

![](../images/trpl15-01.svg)

图 15-1：由无限 `Cons` 变体组成的无限 `List`

### 使用 `Box<T>` 获得已知大小的递归类型

因为 Rust 无法计算递归定义类型需要分配多少空间，编译器给出了一个带有这个有用建议的错误：

```rust
help: insert some indirection (e.g., a `Box`, `Rc`, or `&`) to break the cycle
  |
2 |     Cons(i32, Box<List>),
  |               ++++    +
```

在这个建议中，间接意味着我们不应该直接存储值，而应该通过存储指向值的指针来改变数据结构，从而间接存储值。

因为 `Box<T>` 是一个指针，Rust 总是知道 `Box<T>` 需要多少空间：指针的大小不会基于它指向的数据量而改变。这意味着我们可以在 `Cons` 变体中放置一个 `Box<T>`，而不是直接放置另一个 `List` 值。`Box<T>` 将指向下一个 `List` 值，该值将位于堆上，而不是 `Cons` 变体内部。从概念上讲，我们仍然有一个列表，由持有其他列表的列表创建，但现在这个实现更像是将项目彼此相邻放置，而不是一个放在另一个内部。

我们可以将示例 15-2 中的 List 枚举定义和示例 15-3 中的 List 用法更改为示例 15-5 中的代码，这将可以编译。

文件名：src/main.rs：

```rust
enum List {
    Cons(i32, Box<List>),
    Nil,
}

use crate::List::{Cons, Nil};

fn main() {
    let list = Cons(1, Box::new(Cons(2, Box::new(Cons(3, Box::new(Nil))))));
}
```

示例 15-5：使用 `Box<T>` 定义 `List` 以获得已知大小

`Cons` 变体需要 `i32` 的大小加上存储 box 的指针数据的空间。`Nil` 变体不存储任何值，所以它比 `Cons` 变体需要更少的空间。现在我们知道任何 `List` 值将占用 `i32` 的大小加上 box 的指针数据的大小。通过使用 box，我们打破了无限递归链，因此编译器可以计算出存储 `List` 值需要的大小。图 15-2 展示了 `Cons` 变体现在的样子。

![](../images/trpl15-02.svg)

图 15-2：不是无限大小的 `List`，因为 `Cons` 持有一个 `Box`

Box 只提供了间接和堆分配；它们没有我们将在其他智能指针类型中看到的其他特殊功能。它们也没有这些特殊功能带来的性能开销，所以在像 cons 列表这样只需要间接功能的情况下，它们可能很有用。我们将在第 18 章中查看更多 box 的用例。

`Box<T>` 类型是一个智能指针，因为它实现了 `Deref` trait，允许 `Box<T>` 值被视为引用。当 `Box<T>` 值离开作用域时，由于 `Drop` trait 的实现，box 指向的堆数据也会被清理。这两个 trait 对于我们将在本章剩余部分讨论的其他智能指针类型提供的功能更加重要。让我们更详细地探讨这两个 trait。