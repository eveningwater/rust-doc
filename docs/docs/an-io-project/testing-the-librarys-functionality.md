## 使用测试驱动开发来开发库的功能

现在我们已经将逻辑提取到 src/lib.rs 中，并将参数收集和错误处理留在 src/main.rs 中，为代码的核心功能编写测试变得容易多了。我们可以直接使用各种参数调用函数并检查返回值，而无需从命令行调用我们的二进制文件。

在本节中，我们将使用测试驱动开发（TDD）过程向 `minigrep` 程序添加搜索逻辑，步骤如下：

1. 编写一个会失败的测试，并运行它以确保它因你期望的原因而失败。
2. 编写或修改足够的代码以使新测试通过。
3. 重构你刚刚添加或更改的代码，并确保测试继续通过。
4. 从步骤 1 重复！

尽管 TDD 是编写软件的众多方法之一，但它可以帮助推动代码设计。在编写使测试通过的代码之前编写测试有助于在整个过程中保持较高的测试覆盖率。

我们将测试驱动实现实际执行在文件内容中搜索查询字符串并生成匹配查询的行列表的功能。我们将在一个名为 `search` 的函数中添加此功能。

## 编写一个失败的测试

因为我们不再需要它们，所以让我们从 src/lib.rs 和 src/main.rs 中删除用于检查程序行为的 `println!` 语句。然后，在 src/lib.rs 中，我们将添加一个带有测试函数的 `tests` 模块，就像我们在第 11 章中所做的那样。测试函数指定了我们希望 `search` 函数具有的行为：它将接受一个查询和要搜索的文本，并且只返回文本中包含查询的行。示例 12-15 显示了这个测试，它还不能编译。

文件名: src/lib.rs:

```rust
use std::error::Error;
use std::fs;

pub struct Config {
    pub query: String,
    pub file_path: String,
}

impl Config {
    pub fn build(args: &[String]) -> Result<Config, &'static str> {
        if args.len() < 3 {
            return Err("not enough arguments");
        }

        let query = args[1].clone();
        let file_path = args[2].clone();

        Ok(Config { query, file_path })
    }
}

pub fn run(config: Config) -> Result<(), Box<dyn Error>> {
    let contents = fs::read_to_string(config.file_path)?;

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn one_result() {
        let query = "duct";
        let contents = "\
Rust:
safe, fast, productive.
Pick three.";

        assert_eq!(vec!["safe, fast, productive."], search(query, contents));
    }
}
```

示例 12-15: 为我们希望拥有的 `search` 函数创建一个失败的测试

这个测试搜索字符串 `"duct"`。我们搜索的文本有三行，其中只有一行包含 `"duct"`（注意，开头的双引号后面的反斜杠告诉 Rust 不要在字符串字面量的开头放置换行符）。我们断言从 `search` 函数返回的值只包含我们期望的那一行。

我们还不能运行这个测试并观察它失败，因为测试甚至无法编译：`search` 函数还不存在！根据 TDD 原则，我们将添加足够的代码来使测试编译并运行，方法是添加一个 `search` 函数的定义，该函数始终返回一个空向量，如示例 12-16 所示。然后测试应该编译并失败，因为空向量与包含行 `"safe, fast, productive."` 的向量不匹配。

文件名: src/lib.rs:

```rust
use std::error::Error;
use std::fs;

pub struct Config {
    pub query: String,
    pub file_path: String,
}

impl Config {
    pub fn build(args: &[String]) -> Result<Config, &'static str> {
        if args.len() < 3 {
            return Err("not enough arguments");
        }

        let query = args[1].clone();
        let file_path = args[2].clone();

        Ok(Config { query, file_path })
    }
}

pub fn run(config: Config) -> Result<(), Box<dyn Error>> {
    let contents = fs::read_to_string(config.file_path)?;

    Ok(())
}

pub fn search<'a>(query: &str, contents: &'a str) -> Vec<&'a str> {
    vec![]
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn one_result() {
        let query = "duct";
        let contents = "\
Rust:
safe, fast, productive.
Pick three.";

        assert_eq!(vec!["safe, fast, productive."], search(query, contents));
    }
}
```

示例 12-16: 定义足够的 search 函数，以便我们的测试能够编译

请注意，我们需要在 `search` 的签名中定义一个显式的生命周期 `'a`，并将该生命周期与 `contents` 参数和返回值一起使用。回想一下第 10 章，生命周期参数指定了哪个参数的生命周期与返回值的生命周期相关联。在这种情况下，我们表示返回的向量应该包含引用 `contents` 参数（而不是 `query` 参数）切片的字符串切片。

换句话说，我们告诉 Rust，`search` 函数返回的数据将与传递给 `search` 函数的 `contents` 参数中的数据一样长寿。这很重要！切片引用的数据需要有效，引用才能有效；如果编译器假设我们正在创建 `query` 而不是 `contents` 的字符串切片，它将错误地进行安全检查。

如果我们忘记了生命周期注解并尝试编译此函数，我们将收到此错误：

```rust
$ cargo build
   Compiling minigrep v0.1.0 (file:///projects/minigrep)
error[E0106]: missing lifetime specifier
  --> src/lib.rs:28:51
   |
28 | pub fn search(query: &str, contents: &str) -> Vec<&str> {
   |                      ----            ----         ^ expected named lifetime parameter
   |
   = help: this function's return type contains a borrowed value, but the signature does not say whether it is borrowed from `query` or `contents`
help: consider introducing a named lifetime parameter
   |
28 | pub fn search<'a>(query: &'a str, contents: &'a str) -> Vec<&'a str> {
   |              ++++         ++                 ++              ++

For more information about this error, try `rustc --explain E0106`.
error: could not compile `minigrep` (lib) due to 1 previous error
```

Rust 不可能知道我们需要哪个参数，所以我们需要明确地告诉它。因为 `contents` 是包含我们所有文本的参数，并且我们想要返回匹配的文本部分，所以我们知道 `contents` 是应该使用生命周期语法连接到返回值的参数。

其他编程语言不需要你在签名中将参数连接到返回值，但随着时间的推移，这种做法会变得更容易。你可能想将此示例与第 10 章“使用生命周期验证引用”部分中的示例进行比较。

现在让我们运行测试：

```rust
$ cargo test
   Compiling minigrep v0.1.0 (file:///projects/minigrep)
    Finished `test` profile [unoptimized + debuginfo] target(s) in 0.97s
     Running unittests src/lib.rs (target/debug/deps/minigrep-9cd200e5fac0fc94)

running 1 test
test tests::one_result ... FAILED

failures:

---- tests::one_result stdout ----
thread 'tests::one_result' panicked at src/lib.rs:44:9:
assertion `left == right` failed
  left: ["safe, fast, productive."]
 right: []
note: run with `RUST_BACKTRACE=1` environment variable to display a backtrace


failures:
    tests::one_result

test result: FAILED. 0 passed; 1 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s

error: test failed, to rerun pass `--lib`
```

太好了，测试失败了，正如我们预期的那样。让我们让测试通过！

## 编写代码以通过测试

目前，我们的测试失败是因为我们总是返回一个空向量。为了解决这个问题并实现 `search`，我们的程序需要遵循以下步骤：

1. 遍历内容的每一行。
2. 检查该行是否包含我们的查询字符串。
3. 如果包含，将其添加到我们要返回的值列表中。
4. 如果不包含，则不执行任何操作。
5. 返回匹配的结果列表。

让我们逐一完成每个步骤，从遍历行开始。

### 使用 `lines` 方法遍历行

Rust 有一个有用的方法来处理字符串的逐行迭代，方便地命名为 `lines`，其工作方式如示例 12-17 所示。请注意，这还不能编译。

文件名: src/lib.rs:

```rust
use std::error::Error;
use std::fs;

pub struct Config {
    pub query: String,
    pub file_path: String,
}

impl Config {
    pub fn build(args: &[String]) -> Result<Config, &'static str> {
        if args.len() < 3 {
            return Err("not enough arguments");
        }

        let query = args[1].clone();
        let file_path = args[2].clone();

        Ok(Config { query, file_path })
    }
}

pub fn run(config: Config) -> Result<(), Box<dyn Error>> {
    let contents = fs::read_to_string(config.file_path)?;

    Ok(())
}

pub fn search<'a>(query: &str, contents: &'a str) -> Vec<&'a str> {
    for line in contents.lines() {
        // do something with line
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn one_result() {
        let query = "duct";
        let contents = "\
Rust:
safe, fast, productive.
Pick three.";

        assert_eq!(vec!["safe, fast, productive."], search(query, contents));
    }
}
```

示例 12-17: 遍历 `contents` 中的每一行

`lines` 方法返回一个迭代器。我们将在第 13 章深入讨论迭代器，但回想一下，你在示例 3-5 中看到了这种使用迭代器的方式，我们在其中使用 `for` 循环和迭代器对集合中的每个项运行一些代码。

### 搜索每行中的查询

接下来，我们将检查当前行是否包含我们的查询字符串。幸运的是，字符串有一个有用的方法 `contains` 可以为我们完成这项工作！在 `search` 函数中添加对 `contains` 方法的调用，如示例 12-18 所示。请注意，这仍然不能编译。

文件名: src/lib.rs:

```rust
use std::error::Error;
use std::fs;

pub struct Config {
    pub query: String,
    pub file_path: String,
}

impl Config {
    pub fn build(args: &[String]) -> Result<Config, &'static str> {
        if args.len() < 3 {
            return Err("not enough arguments");
        }

        let query = args[1].clone();
        let file_path = args[2].clone();

        Ok(Config { query, file_path })
    }
}

pub fn run(config: Config) -> Result<(), Box<dyn Error>> {
    let contents = fs::read_to_string(config.file_path)?;

    Ok(())
}

pub fn search<'a>(query: &str, contents: &'a str) -> Vec<&'a str> {
    for line in contents.lines() {
        if line.contains(query) {
            // do something with line
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn one_result() {
        let query = "duct";
        let contents = "\
Rust:
safe, fast, productive.
Pick three.";

        assert_eq!(vec!["safe, fast, productive."], search(query, contents));
    }
}
```

示例 12-18: 添加功能以查看行是否包含 `query` 中的字符串

目前，我们正在构建功能。为了使代码编译，我们需要从函数体中返回一个值，正如我们在函数签名中指出的那样。

### 存储匹配的行

为了完成这个函数，我们需要一种方法来存储我们想要返回的匹配行。为此，我们可以在 `for` 循环之前创建一个可变向量，并调用 `push` 方法将 `line` 存储在向量中。在 `for` 循环之后，我们返回向量，如示例 12-19 所示。

文件名: src/lib.rs:

```rust
use std::error::Error;
use std::fs;

pub struct Config {
    pub query: String,
    pub file_path: String,
}

impl Config {
    pub fn build(args: &[String]) -> Result<Config, &'static str> {
        if args.len() < 3 {
            return Err("not enough arguments");
        }

        let query = args[1].clone();
        let file_path = args[2].clone();

        Ok(Config { query, file_path })
    }
}

pub fn run(config: Config) -> Result<(), Box<dyn Error>> {
    let contents = fs::read_to_string(config.file_path)?;

    Ok(())
}

pub fn search<'a>(query: &str, contents: &'a str) -> Vec<&'a str> {
    let mut results = Vec::new();

    for line in contents.lines() {
        if line.contains(query) {
            results.push(line);
        }
    }

    results
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn one_result() {
        let query = "duct";
        let contents = "\
Rust:
safe, fast, productive.
Pick three.";

        assert_eq!(vec!["safe, fast, productive."], search(query, contents));
    }
}
```

示例 12-19: 存储匹配的行以便我们可以返回它们

现在 `search` 函数应该只返回包含 `query` 的行，并且我们的测试应该通过。让我们运行测试：

```rust
$ cargo test
   Compiling minigrep v0.1.0 (file:///projects/minigrep)
    Finished `test` profile [unoptimized + debuginfo] target(s) in 1.22s
     Running unittests src/lib.rs (target/debug/deps/minigrep-9cd200e5fac0fc94)

running 1 test
test tests::one_result ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s

     Running unittests src/main.rs (target/debug/deps/minigrep-9cd200e5fac0fc94)

running 0 tests

test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s

   Doc-tests minigrep

running 0 tests

test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
```

我们的测试通过了，所以我们知道它有效！

此时，我们可以考虑重构 search 函数的实现，同时保持测试通过以维持相同的功能。search 函数中的代码还不错，但它没有利用迭代器的一些有用特性。我们将在第 13 章回到这个例子，在那里我们将详细探讨迭代器，并研究如何改进它。

### 在 `run` 函数中使用 `search` 函数

现在 `search` 函数已经工作并经过测试，我们需要从 `run` 函数中调用 `search`。我们需要将 `config.query` 值和 `run` 从文件中读取的 `contents` 传递给 `search` 函数。然后 `run` 将打印从 `search` 返回的每一行：

文件名: src/lib.rs:

```rust
use std::error::Error;
use std::fs;

pub struct Config {
    pub query: String,
    pub file_path: String,
}

impl Config {
    pub fn build(args: &[String]) -> Result<Config, &'static str> {
        if args.len() < 3 {
            return Err("not enough arguments");
        }

        let query = args[1].clone();
        let file_path = args[2].clone();

        Ok(Config { query, file_path })
    }
}

pub fn run(config: Config) -> Result<(), Box<dyn Error>> {
    let contents = fs::read_to_string(config.file_path)?;

    for line in search(&config.query, &contents) {
        println!("{line}");
    }

    Ok(())
}

pub fn search<'a>(query: &str, contents: &'a str) -> Vec<&'a str> {
    let mut results = Vec::new();

    for line in contents.lines() {
        if line.contains(query) {
            results.push(line);
        }
    }

    results
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn one_result() {
        let query = "duct";
        let contents = "\
Rust:
safe, fast, productive.
Pick three.";

        assert_eq!(vec!["safe, fast, productive."], search(query, contents));
    }
}
```

我们仍然使用 `for` 循环来返回 `search` 中的每一行并打印它。

现在整个程序应该可以工作了！让我们试一试，首先使用一个应该从 Emily Dickinson 的诗中返回一行单词：`frog`。

```rust
$ cargo run -- frog poem.txt
   Compiling minigrep v0.1.0 (file:///projects/minigrep)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.38s
     Running `target/debug/minigrep frog poem.txt`
How public, like a frog
```

太酷了！现在让我们尝试一个会匹配多行的单词，比如 body：

```rust
$ cargo run -- body poem.txt
   Compiling minigrep v0.1.0 (file:///projects/minigrep)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.0s
     Running `target/debug/minigrep body poem.txt`
I'm nobody! Who are you?
Are you nobody, too?
How dreary to be somebody!
```

最后，让我们确保当我们搜索诗中不存在的单词（例如 monomorphization）时，不会得到任何行：

```rust
$ cargo run -- monomorphization poem.txt
   Compiling minigrep v0.1.0 (file:///projects/minigrep)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.0s
     Running `target/debug/minigrep monomorphization poem.txt`
```

太棒了！我们构建了自己的经典工具的迷你版本，并学到了很多关于如何构建应用程序的知识。我们还学习了一些关于文件输入和输出、生命周期、测试和命令行解析的知识。

为了完成这个项目，我们将简要演示如何使用环境变量以及如何打印到标准错误，这两者在编写命令行程序时都非常有用。
