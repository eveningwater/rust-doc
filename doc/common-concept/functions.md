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