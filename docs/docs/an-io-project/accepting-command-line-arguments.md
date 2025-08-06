## 接受命令行参数

让我们像往常一样使用 `cargo new` 创建一个新项目。我们将我们的项目命名为 minigrep，以区别于你系统上可能已经有的 grep 工具。

```rust
$ cargo new minigrep
     Created binary (application) `minigrep` project
$ cd minigrep
```

第一个任务是让 `minigrep` 接受它的两个命令行参数：文件路径和要搜索的字符串。也就是说，我们希望能够使用 `cargo run` 运行我们的程序，两个连字符表示后面的参数是给我们的程序而不是给 `cargo` 的，一个要搜索的字符串，以及要搜索的文件路径，如下所示：

```rust
$ cargo run -- searchstring example-filename.txt
```

目前，由 `cargo new` 生成的程序无法处理我们给它的参数。[crates.io](https://crates.io/) 上的一些现有库可以帮助编写接受命令行参数的程序，但由于你刚刚学习这个概念，让我们自己实现这个功能。

## 读取参数值

为了使 `minigrep` 能够读取我们传递给它的命令行参数值，我们需要 Rust 标准库中提供的 `std::env::args` 函数。这个函数返回传递给 `minigrep` 的命令行参数的迭代器。我们将在第 13 章全面介绍迭代器。现在，你只需要知道关于迭代器的两个细节：迭代器产生一系列的值，我们可以在迭代器上调用 `collect` 方法将其转换为集合，例如包含迭代器产生的所有元素的向量。

示例 12-1 中的代码允许你的 `minigrep` 程序读取传递给它的任何命令行参数，然后将值收集到一个向量中。

Filename: src/main.rs:

```rust
use std::env;

fn main() {
    let args: Vec<String> = env::args().collect();
    dbg!(args);
}
```

示例 12-1：将命令行参数收集到向量中并打印它们

首先，我们通过 use 语句将 `std::env` 模块引入作用域，以便我们可以使用它的 args 函数。注意，`std::env::args` 函数嵌套在两个级别的模块中。正如我们在第 7 章中讨论的，在所需函数嵌套在多个模块中的情况下，我们选择将父模块引入作用域而不是函数本身。通过这样做，我们可以轻松使用 `std::env` 中的其他函数。这也比添加 use `std::env::args` 然后仅用 `args` 调用函数更不容易混淆，因为 `args` 可能很容易被误认为是当前模块中定义的函数。

> ## `args` 函数和无效的 Unicode
>
> 注意，如果任何参数包含无效的 Unicode，`std::env::args` 将会 panic。如果你的程序需要接受包含无效 Unicode 的参数，请使用 `std::env::args_os` 代替。该函数返回一个产生 `OsString` 值而不是 `String` 值的迭代器。我们在这里选择使用 `std::env::args` 是为了简单，因为 `OsString` 值因平台而异，比 `String` 值更复杂。

在 `main` 的第一行，我们调用 `env::args`，并立即使用 `collect` 将迭代器转换为包含迭代器产生的所有值的向量。我们可以使用 `collect` 函数创建多种类型的集合，所以我们明确注明 `args` 的类型，指定我们想要一个字符串向量。虽然在 Rust 中你很少需要注明类型，但 `collect` 是一个你经常需要注明的函数，因为 Rust 无法推断你想要的集合类型。

最后，我们使用调试宏打印向量。让我们先尝试不带参数运行代码，然后再带两个参数运行：

```rust
$ cargo run
   Compiling minigrep v0.1.0 (file:///projects/minigrep)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.61s
     Running `target/debug/minigrep`
[src/main.rs:5:5] args = [
    "target/debug/minigrep",
]
```

```rust
$ cargo run -- needle haystack
   Compiling minigrep v0.1.0 (file:///projects/minigrep)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 1.57s
     Running `target/debug/minigrep needle haystack`
[src/main.rs:5:5] args = [
    "target/debug/minigrep",
    "needle",
    "haystack",
]
```

注意，向量中的第一个值是 `"target/debug/minigrep"`，这是我们的二进制文件的名称。这与 C 中的参数列表行为相匹配，让程序使用它们在执行中被调用的名称。如果你想在消息中打印程序名称，或者根据用于调用程序的命令行别名来改变程序的行为，访问程序名称通常很方便。但对于本章的目的，我们将忽略它，只保存我们需要的两个参数。

## 将参数值保存在变量中

程序目前能够访问指定为命令行参数的值。现在我们需要将两个参数的值保存在变量中，以便我们可以在程序的其余部分使用这些值。我们在示例 12-2 中做到这一点。

Filename: src/main.rs:

```rust
use std::env;

fn main() {
    let args: Vec<String> = env::args().collect();

    let query = &args[1];
    let file_path = &args[2];

    println!("Searching for {query}");
    println!("In file {file_path}");
}
```

示例 12-2：创建变量来保存查询参数和文件路径参数

正如我们在打印向量时看到的，程序的名称占据了向量中 `args[0]` 的第一个值，所以我们从索引 1 开始参数。`minigrep` 接受的第一个参数是我们要搜索的字符串，所以我们将对第一个参数的引用放在变量 `query` 中。第二个参数将是文件路径，所以我们将对第二个参数的引用放在变量 `file_path` 中。

我们暂时打印这些变量的值，以证明代码按我们的意图工作。让我们再次运行这个程序，使用参数 `test` 和 `sample.txt`：

```rust
$ cargo run -- test sample.txt
   Compiling minigrep v0.1.0 (file:///projects/minigrep)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.0s
     Running `target/debug/minigrep test sample.txt`
Searching for test
In file sample.txt
```

太好了，程序正在工作！我们需要的参数的值被保存到了正确的变量中。稍后我们将添加一些错误处理来处理某些潜在的错误情况，例如当用户不提供任何参数时；现在，我们将忽略这种情况，转而添加文件读取功能。
