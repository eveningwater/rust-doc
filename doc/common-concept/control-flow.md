## 控制流

根据条件是否为真(true)来运行一些代码，以及在条件为真(true)时重复运行一些代码，这些是大多数编程语言的基本构建块。允许你控制 Rust 代码执行流程的最常见结构是 if 表达式和循环。

### if表达式

if 表达式允许你根据条件分支代码。你提供一个条件，然后声明：“如果满足此条件，则运行此代码块。如果不满足条件，则不运行此代码块。”

在项目目录中创建一个名为 branch 的新项目来探索 if 表达式。在 src/main.rs 文件中，输入以下内容：

文件名: src/main.rs:

```rust
fn main() {
    let number = 3;

    if number < 5 {
        println!("condition was true");
    } else {
        println!("condition was false");
    }
}
```

所有 if 表达式都以关键字 if 开头，后跟条件。在本例中，条件检查变量 number 的值是否小于 5。我们将条件为真时执行的代码块放在条件之后的大括号内。与 if 表达式中的条件相关的代码块有时称为分支，就像我们在第 2 章的“[将猜测数字与秘密数字进行比较](../guess-game/guess-game.md#将猜测数字与秘密数字进行比较)”部分中讨论的 match 表达式中的分支一样。

我们还可以选择添加 else 表达式（前面示例我们选择了添加），以便在条件为 false 时为程序提供另一个代码块来执行。如果你不提供 else 表达式并且条件为 false，程序将直接跳过 if 块并继续执行下一段代码。

尝试运行此代码；你应该看到以下输出：

```rust
$ cargo run
   Compiling branches v0.1.0 (file:///projects/branches)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.31s
     Running `target/debug/branches`
condition was true
```

让我们尝试将 number 的值更改为使条件为假的值，看看会发生什么：

```rust
let number = 7;
```

再次运行程序，并查看输出：

```rust
$ cargo run
   Compiling branches v0.1.0 (file:///projects/branches)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.31s
     Running `target/debug/branches`
condition was false
```

还值得注意的是，此代码中的条件必须是布尔值。如果条件不是布尔值，我们将收到错误。例如，尝试运行以下代码：

文件名: src/main.rs:

```rust
fn main() {
    let number = 3;

    if number {
        println!("number was three");
    }
}
```

这次 if 条件的计算结果为 3，Rust 抛出错误：

```rust
$ cargo run
   Compiling branches v0.1.0 (file:///projects/branches)
error[E0308]: mismatched types
 --> src/main.rs:4:8
  |
4 |     if number {
  |        ^^^^^^ expected `bool`, found integer

For more information about this error, try `rustc --explain E0308`.
error: could not compile `branches` (bin "branches") due to 1 previous error
```

该错误表明 Rust 期望的是布尔值，但得到的却是整数。与 Ruby 和 JavaScript 等语言不同，Rust 不会自动尝试将非布尔值转换为布尔值。你必须明确说明，并始终以布尔值作为 if 的条件。例如，如果我们希望 if 代码块仅在数字不等于 0 时运行，我们可以将 if 表达式更改为以下内容：

文件名: src/main.rs:

```rust
fn main() {
    let number = 3;

    if number != 0 {
        println!("number was something other than zero");
    }
}
```

运行这段代码将会打印`number was something other than zero`。

#### 使用 else if 处理多个条件

你可以通过在 else if 表达式中组合 if 和 else 来使用多个条件。例如：

文件名: src/main.rs:

```rust
fn main() {
    let number = 6;

    if number % 4 == 0 {
        println!("number is divisible by 4");
    } else if number % 3 == 0 {
        println!("number is divisible by 3");
    } else if number % 2 == 0 {
        println!("number is divisible by 2");
    } else {
        println!("number is not divisible by 4, 3, or 2");
    }
}
```

此程序有四种可能的路径。运行后，你应该看到以下输出：

```rust
$ cargo run
   Compiling branches v0.1.0 (file:///projects/branches)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.31s
     Running `target/debug/branches`
number is divisible by 3
```

当此程序执行时，它会依次检查每个 if 表达式，并执行条件计算结果为 true 的第一个主体。请注意，即使 6 可以被 2 整除，我们也看不到输出'number is divisible by'，也看不到 else 块中的'number is not divisible by 4, 3, or 2'。这是因为 Rust 只执行第一个条件为 true 的块，一旦找到一个，它甚至不会检查其余的。

使用过多的 else if 表达式会使你的代码变得混乱，因此如果你有多个 else if 表达式，你可能需要重构代码。第 6 章针对这些情况描述了一种名为 match 的强大 Rust 分支构造。

#### 在 let 语句中使用 if