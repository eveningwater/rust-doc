## 读取文件

现在我们将添加功能来读取 `file_path` 参数中指定的文件。首先，我们需要一个样本文件来测试：我们将使用一个包含少量文本的文件，这些文本分布在多行上，并且有一些重复的单词。示例 12-3 有一首艾米莉·狄金森的诗，这将很好地工作！在项目的根级别创建一个名为 `poem.txt` 的文件，并输入诗歌"I'm Nobody! Who are you?"

Filename: poem.txt:

```text
I'm nobody! Who are you?
Are you nobody, too?
Then there's a pair of us - don't tell!
They'd banish us, you know.

How dreary to be somebody!
How public, like a frog
To tell your name the livelong day
To an admiring bog!
```

示例 12-3：艾米莉·狄金森的一首诗是一个很好的测试案例。

文本就位后，编辑 `src/main.rs` 并添加代码来读取文件，如示例 12-4 所示。

Filename: src/main.rs:

```rust
use std::env;
use std::fs;

fn main() {
    // --snip--
    let args: Vec<String> = env::args().collect();

    let query = &args[1];
    let file_path = &args[2];

    println!("Searching for {query}");
    println!("In file {file_path}");

    let contents = fs::read_to_string(file_path)
        .expect("Should have been able to read the file");

    println!("With text:\n{contents}");
}
```

示例 12-4：读取由第二个参数指定的文件内容

首先，我们通过 `use` 语句引入标准库的相关部分：我们需要 `std::fs` 来处理文件。

在 main 中，新语句 `fs::read_to_string` 接受 file_path，打开该文件，并返回一个类型为 `std::io::Result<String>` 的值，其中包含文件的内容。

之后，我们再次添加一个临时的 println! 语句，在读取文件后打印 contents 的值，这样我们可以检查程序到目前为止是否正常工作。

让我们用任意字符串作为第一个命令行参数（因为我们还没有实现搜索部分）和 poem.txt 文件作为第二个参数来运行这段代码：

```rust
$ cargo run -- the poem.txt
   Compiling minigrep v0.1.0 (file:///projects/minigrep)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.0s
     Running `target/debug/minigrep the poem.txt`
Searching for the
In file poem.txt
With text:
I'm nobody! Who are you?
Are you nobody, too?
Then there's a pair of us - don't tell!
They'd banish us, you know.

How dreary to be somebody!
How public, like a frog
To tell your name the livelong day
To an admiring bog!
```

太好了！代码读取并打印了文件的内容。但是代码有一些缺陷。目前，`main` 函数有多个职责：通常，如果每个函数只负责一个想法，函数会更清晰，更容易维护。另一个问题是我们没有很好地处理错误。程序仍然很小，所以这些缺陷不是大问题，但随着程序的增长，干净地修复它们将变得更加困难。在开发程序时尽早开始重构是一个好习惯，因为重构较小的代码量要容易得多。接下来我们将做这个。
