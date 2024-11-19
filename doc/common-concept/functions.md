## 函数

函数在 Rust 代码中非常普遍。你已经了解了该语言中最重要的函数之一：main 函数，它是许多程序的入口点。你还了解了 fn 关键字，它允许你声明新函数。

Rust 代码使用下划线命名法作为函数和变量名称的常规样式，其中所有字母均为小写，并用下划线分隔单词。以下是包含示例函数定义的程序：

文件名: main.rs:

```rust
fn main() {
    println!("Hello, world!");

    another_function();
}

fn another_function() {
    println!("Another function.");
}
```

在 Rust 中，我们通过输入 `fn` 后跟函数名和一组括号"()"来定义一个函数。花括号"{}"告诉编译器函数体的开始和结束位置。

我们可以通过输入函数名和一对括号来调用我们定义的任何函数。因为 `another_function` 是在程序中定义的，所以可以从 `main` 函数内部调用它。请注意，我们在源代码中将 `another_function` 定义在 `main` 函数之后；我们也可以在此之前定义它。Rust 并不关心你在哪里定义函数，只关心它们是否在调用者可以看到的作用域中定义。

让我们启动一个名为 `functions` 的新的项目来进一步探索函数。将 `another_function` 示例放在 `src/main.rs` 中并运行它。你应该看到以下输出：

```rust
$ cargo run
   Compiling functions v0.1.0 (file:///projects/functions)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.28s
     Running `target/debug/functions`
Hello, world!
Another function.
```

这些行按照它们在主函数中出现的顺序执行。首先打印“Hello, world!”消息，然后调用 `another_function` 并打印其消息。

### 参数

我们可以定义具有参数的函数，这些参数是函数签名的一部分的特殊变量。当函数具有参数时，你可以为其提供这些参数的具体值。从技术上讲，这些具体值称为参数，但在日常对话中，人们倾向于交替使用参数和参数这两个词来表示函数定义中的变量或调用函数时传入的具体值。

在此版本的 another_function 中我们添加了一个参数：

文件名: main.rs:

```rust
fn main() {
    another_function(5);
}

fn another_function(x: i32) {
    println!("The value of x is: {x}");
}
```

尝试运行该程序；你应该得到以下输出：

```rust
$ cargo run
   Compiling functions v0.1.0 (file:///projects/functions)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 1.21s
     Running `target/debug/functions`
The value of x is: 5
```

another_function 的声明有一个名为 x 的参数。x 的类型指定为 i32。当我们将 5 传递给 another_function 时，println! 宏会将 5 放在格式字符串中包含 x 的花括号对的位置。

在函数签名中，你必须声明每个参数的类型。这是 Rust 设计中的一个刻意决定：在函数定义中要求类型注释意味着编译器几乎不需要你在代码的其他地方使用它们来弄清楚你指的是什么类型。如果编译器知道函数需要什么类型，它还能够提供更有用的错误消息。

定义多个参数时，用逗号分隔参数声明，如下所示：

文件名: main.rs:

```rust
fn main() {
    print_labeled_measurement(5, 'h');
}

fn print_labeled_measurement(value: i32, unit_label: char) {
    println!("The measurement is: {value}{unit_label}");
}
```

此示例创建一个名为 print_labeled_measurement 的函数，该函数有两个参数。第一个参数名为 value，是 i32 类型。第二个参数名为 unit_label，是 char 类型。然后，该函数打印包含 value 和 unit_label 的文本。

让我们尝试运行此代码。将名为functions项目的 `src/main.rs` 文件中的当前程序替换为前面的示例，然后使用 `cargo run` 运行它：

```rust
$ cargo run
   Compiling functions v0.1.0 (file:///projects/functions)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.31s
     Running `target/debug/functions`
The measurement is: 5h
```

因为我们调用该函数时将 5 作为 value 的值并将 'h' 作为 unit_label 的值，所以程序输出包含这些值。

### 语句和表达式