## 将错误消息写入标准错误而不是标准输出

目前，我们使用 `println!` 宏将所有输出写入终端。在大多数终端中，有两种输出：标准输出 (`stdout`) 用于一般信息，标准错误 (`stderr`) 用于错误消息。这种区别使用户可以选择将程序的成功输出定向到文件，但仍将错误消息打印到屏幕上。

`println!` 宏只能打印到标准输出，因此我们必须使用其他方法打印到标准错误。

### 检查错误写入位置

首先，让我们观察 `minigrep` 打印的内容目前是如何写入标准输出的，包括我们想要写入标准错误的任何错误消息。我们将通过将标准输出流重定向到文件来故意引起错误。我们不会重定向标准错误流，因此发送到标准错误的任何内容将继续显示在屏幕上。

命令行程序应将错误消息发送到标准错误流，这样即使我们将标准输出流重定向到文件，我们仍然可以在屏幕上看到错误消息。我们的程序目前表现不佳：我们将看到它将错误消息输出保存到文件中！

为了演示这种行为，我们将运行程序，使用 > 和文件路径 output.txt，我们将标准输出流重定向到该文件。我们不会传递任何参数，这应该会导致错误：

```rust
$ cargo run > output.txt
```

`>` 语法告诉 shell 将标准输出的内容写入 output.txt 而不是屏幕。我们没有看到预期的错误消息打印到屏幕上，这意味着它一定最终进入了文件。output.txt 的内容如下：

```rust
Problem parsing arguments: not enough arguments
```

是的，我们的错误消息正在打印到标准输出。将这样的错误消息打印到标准错误更有用，这样只有成功运行的数据才会最终进入文件。我们将改变这一点。

### 将错误打印到标准错误

我们将使用示例 12-24 中的代码来改变错误消息的打印方式。由于我们在本章前面进行的重构，所有打印错误消息的代码都在一个函数 `main` 中。标准库提供了 `eprintln!` 宏，该宏打印到标准错误流，因此让我们将我们调用 `println!` 打印错误的两处更改为使用 `eprintln!`。

文件名：src/main.rs：

```rust
use std::env;
use std::process;

use minigrep::Config;

fn main() {
    let args: Vec<String> = env::args().collect();

    let config = Config::build(&args).unwrap_or_else(|err| {
        eprintln!("Problem parsing arguments: {err}");
        process::exit(1);
    });

    if let Err(e) = minigrep::run(config) {
        eprintln!("Application error: {e}");
        process::exit(1);
    }
}
```

示例 12-24：使用 `eprintln!` 将错误消息写入标准错误而不是标准输出

现在让我们以相同的方式再次运行程序，不带任何参数并将标准输出重定向到 `>`：

```rust
$ cargo run > output.txt
Problem parsing arguments: not enough arguments
```

现在我们在屏幕上看到错误，并且 output.txt 不包含任何内容，这是我们期望命令行程序的行为。

让我们再次运行程序，带上不会导致错误的参数，但仍将标准输出重定向到文件，如下所示：

```rust
$ cargo run -- to poem.txt > output.txt
```

我们不会在终端上看到任何输出，并且 output.txt 将包含我们的结果：

文件名：output.txt：

```rust
Are you nobody, too?
How dreary to be somebody!
```

这表明我们现在正在适当地使用标准输出进行成功输出，使用标准错误进行错误输出。

## 总结

本章回顾了你迄今为止学到的一些主要概念，并介绍了如何在 Rust 中执行常见的 I/O 操作。通过使用命令行参数、文件、环境变量和用于打印错误的 `eprintln!` 宏，你现在已准备好编写命令行应用程序。结合前几章的概念，你的代码将组织良好，有效地将数据存储在适当的数据结构中，很好地处理错误，并且经过充分测试。

接下来，我们将探讨一些受函数式语言影响的 Rust 特性：闭包和迭代器。
