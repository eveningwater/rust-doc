## 变量和可变性

如“[使用变量存储值](./guess-game.md#用变量来存储值)”部分所述，默认情况下，变量是不可变的。这是 Rust 为你提供的众多提示之一，让你能够以充分利用 Rust 提供的安全性和轻松并发性的方式编写代码。但是，你仍然可以选择使变量可变。让我们探索 Rust 如何以及为何鼓励你青睐不变性，以及为什么有时你可能想要选择退出。

当变量不可变时，一旦将值绑定到名称，就无法更改该值。为了说明这一点，使用 `cargo new variables` 在项目目录中生成一个名为`variables`的新项目。

然后，在新的变量目录中，打开 src/main.rs 并将其代码替换为以下代码，该代码暂时不会编译：

文件名: main.rs

```rust
fn main() {
    let x = 5;
    println!("The value of x is: {x}");
    x = 6;
    println!("The value of x is: {x}");
}
```

保存并使用 cargo run 运行程序。你应该收到一条关于不可变性错误的错误消息，如以下输出所示：

```rust
$ cargo run
   Compiling variables v0.1.0 (file:///projects/variables)
error[E0384]: cannot assign twice to immutable variable `x`
 --> src/main.rs:4:5
  |
2 |     let x = 5;
  |         -
  |         |
  |         first assignment to `x`
  |         help: consider making this binding mutable: `mut x`
3 |     println!("The value of x is: {x}");
4 |     x = 6;
  |     ^^^^^ cannot assign twice to immutable variable

For more information about this error, try `rustc --explain E0384`.
error: could not compile `variables` (bin "variables") due to 1 previous error
```

此示例展示了编译器如何帮助你查找程序中的错误。编译器错误可能令人沮丧，但实际上它们仅意味着你的程序尚未安全地执行你想要它执行的操作；它们并不意味着你不是一名优秀的程序员！经验丰富的 Rust 爱好者 仍然会遇到编译器错误。

你收到错误消息`cannot assign twice to immutable variable "x"`(无法对不可变变量“x”进行两次赋值)，因为你尝试将第二个值分配给不可变的 x 变量。

当我们尝试更改指定为不可变的值时，我们收到编译时错误是很重要的，因为这种情况可能会导致错误。如果我们代码的一部分假设某个值永远不会改变，而另一部分代码改变了该值，那么第一部分代码可能不会按照设计执行。事后很难追踪这种错误的原因，尤其是当第二段代码只是偶尔改变值时。Rust 编译器保证，当你声明某个值不会改变时，它实际上不会改变，因此你不必亲自跟踪它。因此，你的代码更容易推理。

但可变性非常有用，可以使代码编写起来更方便。虽然变量默认是不可变的，但你可以通过在变量名前面添加 `mut` 来使它们可变，就像你在[第 2 章](./guess-game.md#用变量来存储值)中所做的那样。添加 mut 还可以向代码的未来读者传达意图，表明代码的其他部分将更改此变量的值。

例如，我们将 src/main.rs 更改为以下内容：

文件名: main.rs

```rust
fn main() {
    let mut x = 5;
    println!("The value of x is: {x}");
    x = 6;
    println!("The value of x is: {x}");
}
```

现在运行该程序，我们得到以下结果：

```rust
$ cargo run
   Compiling variables v0.1.0 (file:///projects/variables)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.30s
     Running `target/debug/variables`
The value of x is: 5
The value of x is: 6
```

使用 mut 时，我们可以将绑定到 x 的值从 5 更改为 6。最终，是否使用可变性取决于你，取决于你认为在特定情况下最清楚的是什么。

### 常量

与不可变变量一样，常量是与名称绑定且不允许更改的值，但常量和变量之间存在一些差异。

首先，你不能将 mut 与常量一起使用。常量不仅默认不可变 - 它们始终是不可变的。常量需要使用 const 关键字而不是 let 关键字声明，并且必须注释值的类型。我们将在下一节“[数据类型](./data-type.md)”中介绍类型和类型注释，所以现在不用担心细节。只要知道你必须始终注释类型即可。

常量可以在任何上下文内声明，包括全局上下文，这使得它们对于代码的许多部分需要了解的值很有用。

最后一个区别是常量只能设置为常量表达式，而不是只能在运行时计算的值的结果。

以下是常量声明的示例：

```rust
const THREE_HOURS_IN_SECONDS: u32 = 60 * 60 * 3;
```

该常量的名称为 THREE_HOURS_IN_SECONDS，其值设置为 60（一分钟的秒数）乘以 60（一小时的分钟数）乘以 3（我们想要在此程序中计算的小时数）的结果。Rust 的常量命名约定是全部使用大写字母，并在单词之间使用下划线。编译器能够在编译时评估一组有限的操作，这让我们可以选择以一种更容易理解和验证的方式写出这个值，而不是将此常量设置为值 10,800。有关声明常量时可以使用哪些操作的更多信息，请参阅[Rust 常量赋值](https://doc.rust-lang.org/reference/const_eval.html)。

常量在程序运行的整个时间内有效，在声明它们的上下文内。此属性使常量对于应用程序域中的值非常有用，程序的多个部分可能需要知道这些值，例如游戏中任何玩家可以获得的最大积分数或光速。

将整个程序中使用的硬编码值命名为常量有助于将该值的含义传达给代码的未来维护者。如果将来需要更新硬编码值，这也有助于在代码中只有一个地方需要更改。

### 变量遮蔽

正如你在第 2 章的[猜谜游戏教程](./guess-game.md#将猜测数字与秘密数字进行比较)中看到的那样，你可以声明一个与前一个变量同名的新变量。Rust 爱好者表示第一个变量被第二个变量变量遮蔽，这意味着当你使用该变量的名称时，编译器将看到第二个变量。实际上，第二个变量变量遮蔽了第一个变量，将变量名称的任何使用都归于自身，直到它本身被变量遮蔽或作用域结束。我们可以使用相同的变量名称并重复使用 let 关键字来变量遮蔽变量，如下所示：

文件名: main.rs:

```rust
fn main() {
    let x = 5;

    let x = x + 1;

    {
        let x = x * 2;
        println!("The value of x in the inner scope is: {x}");
    }

    println!("The value of x is: {x}");
}
```

变量遮蔽不同于将变量标记为 mut，因为如果我们不小心尝试在不使用 let 关键字的情况下重新赋值给此变量，我们将收到编译时错误。通过使用 let，我们可以对值执行一些转换，但在完成这些转换后，变量将是不可变的。

mut 和变量遮蔽之间的另一个区别是，因为当我们再次使用 let 关键字时，我们实际上是在创建一个新变量，所以我们可以更改值的类型但重用相同的名称。例如，假设我们的程序要求用户通过输入空格字符来显示他们希望在某些文本之间有多少个空格，然后我们希望将该输入存储为数字：

```rust
let spaces = "   ";
let spaces = spaces.len();
```

第一个 Spaces 变量是字符串类型，第二个 Spaces 变量是数字类型。因此，使用变量遮蔽处理可以让我们不必想出不同的名称，例如 Spaces_str 和 Spaces_num；相反，我们可以重用更简单的 Spaces 名称。但是，如果我们尝试使用 mut 来实现这一点，如下所示，我们将收到编译时错误：

```rust
let mut spaces = "   ";
spaces = spaces.len();
```

错误表明我们不允许改变变量的类型：

```rust
$ cargo run
   Compiling variables v0.1.0 (file:///projects/variables)
error[E0308]: mismatched types
 --> src/main.rs:3:14
  |
2 |     let mut spaces = "   ";
  |                      ----- expected due to this value
3 |     spaces = spaces.len();
  |              ^^^^^^^^^^^^ expected `&str`, found `usize`

For more information about this error, try `rustc --explain E0308`.
error: could not compile `variables` (bin "variables") due to 1 previous error
```

现在我们已经了解了变量的工作原理，让我们看看它们可以拥有的更多数据类型。