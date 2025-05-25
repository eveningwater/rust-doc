## 改进我们的 I/O 项目

有了关于迭代器的新知识，我们可以通过使用迭代器来改进第 12 章中的 I/O 项目，使代码中的某些地方更清晰、更简洁。让我们看看迭代器如何改进我们对 `Config::build` 函数和搜索函数的实现。

### 使用迭代器移除 `clone`

在示例 12-6 中，我们添加了代码，该代码接受一个 String 值切片，并通过索引到切片并克隆这些值来创建一个 `Config` 结构体实例，从而允许 `Config` 结构体拥有这些值。在示例 13-17 中，我们重现了示例 12-23 中 `Config::build` 函数的实现。

Filename: src/lib.rs:

```rust
use std::env;
use std::error::Error;
use std::fs;

pub struct Config {
    pub query: String,
    pub file_path: String,
    pub ignore_case: bool,
}

impl Config {
    pub fn build(args: &[String]) -> Result<Config, &'static str> {
        if args.len() < 3 {
            return Err("not enough arguments");
        }

        let query = args[1].clone();
        let file_path = args[2].clone();

        let ignore_case = env::var("IGNORE_CASE").is_ok();

        Ok(Config {
            query,
            file_path,
            ignore_case,
        })
    }
}

pub fn run(config: Config) -> Result<(), Box<dyn Error>> {
    let contents = fs::read_to_string(config.file_path)?;

    let results = if config.ignore_case {
        search_case_insensitive(&config.query, &contents)
    } else {
        search(&config.query, &contents)
    };

    for line in results {
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

pub fn search_case_insensitive<'a>(
    query: &str,
    contents: &'a str,
) -> Vec<&'a str> {
    let query = query.to_lowercase();
    let mut results = Vec::new();

    for line in contents.lines() {
        if line.to_lowercase().contains(&query) {
            results.push(line);
        }
    }

    results
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn case_sensitive() {
        let query = "duct";
        let contents = "\
Rust:
safe, fast, productive.
Pick three.
Duct tape.";

        assert_eq!(vec!["safe, fast, productive."], search(query, contents));
    }

    #[test]
    fn case_insensitive() {
        let query = "rUsT";
        let contents = "\
Rust:
safe, fast, productive.
Pick three.
Trust me.";

        assert_eq!(
            vec!["Rust:", "Trust me."],
            search_case_insensitive(query, contents)
        );
    }
}
```

示例 13-17：示例 12-23 中 `Config::build` 函数的重现

当时，我们说不用担心低效的 `clone` 调用，因为我们将来会移除它们。现在，是时候了！

这里需要 `clone` 是因为我们在参数 `args` 中有一个包含 `String` 元素的切片，但 `build` 函数不拥有 `args`。为了返回 `Config` 实例的所有权，我们必须克隆 `Config` 的 `query` 和 `file_path` 字段中的值，以便 `Config` 实例可以拥有其值。

有了关于迭代器的新知识，我们可以将 `build` 函数更改为接受迭代器的所有权作为其参数，而不是借用切片。我们将使用迭代器功能，而不是检查切片长度和索引到特定位置的代码。这将使 `Config::build` 函数正在做什么更清晰，因为迭代器将访问这些值。

一旦 `Config::build` 获得迭代器的所有权并停止使用借用的索引操作，我们可以将 `String` 值从迭代器移动到 `Config` 中，而不是调用 `clone` 并进行新的分配。

### 直接使用返回的迭代器

打开您的 I/O 项目的 src/main.rs 文件，它应该看起来像这样：

Filename: src/main.rs:

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

    // --snip--

    if let Err(e) = minigrep::run(config) {
        eprintln!("Application error: {e}");
        process::exit(1);
    }
}
```

我们将首先将示例 12-24 中 `main` 函数的开头更改为示例 13-18 中的代码，这次使用迭代器。这在我们也更新 `Config::build` 之前不会编译。

Filename: src/main.rs:

```rust
use std::env;
use std::process;

use minigrep::Config;

fn main() {
    let config = Config::build(env::args()).unwrap_or_else(|err| {
        eprintln!("Problem parsing arguments: {err}");
        process::exit(1);
    });

    // --snip--

    if let Err(e) = minigrep::run(config) {
        eprintln!("Application error: {e}");
        process::exit(1);
    }
}
```

示例 13-18：将 `env::args` 的返回值传递给 `Config::build`

`env::args` 函数返回一个迭代器！现在，我们不是将迭代器值收集到一个向量中，然后将切片传递给 `Config::build`，而是直接将从 `env::args` 返回的迭代器的所有权传递给 `Config::build`。

接下来，我们需要更新 `Config::build` 的定义。在您的 I/O 项目的 src/lib.rs 文件中，让我们将 `Config::build` 的签名更改为示例 13-19 的样子。这仍然不会编译，因为我们需要更新函数体。

Filename: src/lib.rs:

```rust
use std::env;
use std::error::Error;
use std::fs;

pub struct Config {
    pub query: String,
    pub file_path: String,
    pub ignore_case: bool,
}

impl Config {
    pub fn build(
        mut args: impl Iterator<Item = String>,
    ) -> Result<Config, &'static str> {
        // --snip--
        if args.len() < 3 {
            return Err("not enough arguments");
        }

        let query = args[1].clone();
        let file_path = args[2].clone();

        let ignore_case = env::var("IGNORE_CASE").is_ok();

        Ok(Config {
            query,
            file_path,
            ignore_case,
        })
    }
}

pub fn run(config: Config) -> Result<(), Box<dyn Error>> {
    let contents = fs::read_to_string(config.file_path)?;

    let results = if config.ignore_case {
        search_case_insensitive(&config.query, &contents)
    } else {
        search(&config.query, &contents)
    };

    for line in results {
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

pub fn search_case_insensitive<'a>(
    query: &str,
    contents: &'a str,
) -> Vec<&'a str> {
    let query = query.to_lowercase();
    let mut results = Vec::new();

    for line in contents.lines() {
        if line.to_lowercase().contains(&query) {
            results.push(line);
        }
    }

    results
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn case_sensitive() {
        let query = "duct";
        let contents = "\
Rust:
safe, fast, productive.
Pick three.
Duct tape.";

        assert_eq!(vec!["safe, fast, productive."], search(query, contents));
    }

    #[test]
    fn case_insensitive() {
        let query = "rUsT";
        let contents = "\
Rust:
safe, fast, productive.
Pick three.
Trust me.";

        assert_eq!(
            vec!["Rust:", "Trust me."],
            search_case_insensitive(query, contents)
        );
    }
}
```

示例 13-19：更新 `Config::build` 的签名以期望一个迭代器

`env::args` 函数的标准库文档显示，它返回的迭代器类型是 `std::env::Args`，并且该类型实现了 Iterator trait 并返回 String 值。

我们已经更新了 `Config::build` 函数的签名，以便参数 `args` 具有泛型类型，其 trait 约束为 `impl Iterator<Item = String>`，而不是 `&[String]`。这种使用我们在第 10 章的“Trait 作为参数”部分讨论的 `impl Trait` 语法意味着 `args` 可以是任何实现了 `Iterator` trait 并返回 `String` 项的类型。

因为我们正在获取 `args` 的所有权，并且将通过迭代它来改变 `args`，所以我们可以在 `args` 参数的规范中添加 `mut` 关键字使其可变。

### 使用 `Iterator` Trait 方法代替索引

接下来，我们将修复 `Config::build` 的函数体。因为 `args` 实现了 `Iterator` trait，我们知道可以调用它的 `next` 方法！示例 13-20 更新了示例 12-23 中的代码以使用 `next` 方法。

Filename: src/lib.rs:

```rust
use std::env;
use std::error::Error;
use std::fs;

pub struct Config {
    pub query: String,
    pub file_path: String,
    pub ignore_case: bool,
}

impl Config {
    pub fn build(
        mut args: impl Iterator<Item = String>,
    ) -> Result<Config, &'static str> {
        args.next();

        let query = match args.next() {
            Some(arg) => arg,
            None => return Err("Didn't get a query string"),
        };

        let file_path = match args.next() {
            Some(arg) => arg,
            None => return Err("Didn't get a file path"),
        };

        let ignore_case = env::var("IGNORE_CASE").is_ok();

        Ok(Config {
            query,
            file_path,
            ignore_case,
        })
    }
}

pub fn run(config: Config) -> Result<(), Box<dyn Error>> {
    let contents = fs::read_to_string(config.file_path)?;

    let results = if config.ignore_case {
        search_case_insensitive(&config.query, &contents)
    } else {
        search(&config.query, &contents)
    };

    for line in results {
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

pub fn search_case_insensitive<'a>(
    query: &str,
    contents: &'a str,
) -> Vec<&'a str> {
    let query = query.to_lowercase();
    let mut results = Vec::new();

    for line in contents.lines() {
        if line.to_lowercase().contains(&query) {
            results.push(line);
        }
    }

    results
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn case_sensitive() {
        let query = "duct";
        let contents = "\
Rust:
safe, fast, productive.
Pick three.
Duct tape.";

        assert_eq!(vec!["safe, fast, productive."], search(query, contents));
    }

    #[test]
    fn case_insensitive() {
        let query = "rUsT";
        let contents = "\
Rust:
safe, fast, productive.
Pick three.
Trust me.";

        assert_eq!(
            vec!["Rust:", "Trust me."],
            search_case_insensitive(query, contents)
        );
    }
}
```

示例 13-20：更改 `Config::build` 的函数体以使用迭代器方法

请记住，`env::args` 返回值的第一个值是程序名称。我们想忽略它并获取下一个值，所以首先我们调用 `next` 并且不对返回值做任何处理。然后我们调用 `next` 来获取我们想要放入 `Config` 的 `query` 字段的值。如果 `next` 返回 `Some`，我们使用 match 来提取值。如果返回 `None`，则表示没有提供足够的参数，我们提前返回一个 `Err` 值。我们对 `file_path` 值也做同样的处理。

### 使用迭代器适配器使代码更清晰

我们还可以在 I/O 项目的 `search` 函数中利用迭代器，该函数在示例 13-21 中重现，与示例 12-19 中的一样：

Filename: src/lib.rs:

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

示例 13-21：`search` 函数的实现，来自示例 12-19

我们可以使用迭代器适配器方法以更简洁的方式编写此代码。这样做还可以避免使用可变的中间 `results` 向量。函数式编程风格倾向于最小化可变状态的数量，以使代码更清晰。移除可变状态可能会使未来的增强功能能够并行搜索，因为我们不必管理对 `results` 向量的并发访问。示例 13-22 显示了此更改：

Filename: src/lib.rs:

```rust
use std::env;
use std::error::Error;
use std::fs;

pub struct Config {
    pub query: String,
    pub file_path: String,
    pub ignore_case: bool,
}

impl Config {
    pub fn build(
        mut args: impl Iterator<Item = String>,
    ) -> Result<Config, &'static str> {
        args.next();

        let query = match args.next() {
            Some(arg) => arg,
            None => return Err("Didn't get a query string"),
        };

        let file_path = match args.next() {
            Some(arg) => arg,
            None => return Err("Didn't get a file path"),
        };

        let ignore_case = env::var("IGNORE_CASE").is_ok();

        Ok(Config {
            query,
            file_path,
            ignore_case,
        })
    }
}

pub fn run(config: Config) -> Result<(), Box<dyn Error>> {
    let contents = fs::read_to_string(config.file_path)?;

    let results = if config.ignore_case {
        search_case_insensitive(&config.query, &contents)
    } else {
        search(&config.query, &contents)
    };

    for line in results {
        println!("{line}");
    }

    Ok(())
}

pub fn search<'a>(query: &str, contents: &'a str) -> Vec<&'a str> {
    contents
        .lines()
        .filter(|line| line.contains(query))
        .collect()
}

pub fn search_case_insensitive<'a>(
    query: &str,
    contents: &'a str,
) -> Vec<&'a str> {
    let query = query.to_lowercase();
    let mut results = Vec::new();

    for line in contents.lines() {
        if line.to_lowercase().contains(&query) {
            results.push(line);
        }
    }

    results
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn case_sensitive() {
        let query = "duct";
        let contents = "\
Rust:
safe, fast, productive.
Pick three.
Duct tape.";

        assert_eq!(vec!["safe, fast, productive."], search(query, contents));
    }

    #[test]
    fn case_insensitive() {
        let query = "rUsT";
        let contents = "\
Rust:
safe, fast, productive.
Pick three.
Trust me.";

        assert_eq!(
            vec!["Rust:", "Trust me."],
            search_case_insensitive(query, contents)
        );
    }
}
```

示例 13-22：在 `search` 函数的实现中使用迭代器适配器方法

回想一下，`search` 函数的目的是返回 `contents` 中包含 `query` 的所有行。与示例 13-16 中的 `filter` 示例类似，此代码使用 `filter` 适配器仅保留 `line.contains(query)` 返回 `true` 的行。然后，我们使用 `collect` 将匹配的行收集到另一个向量中。简单多了！您也可以随意对 `search_case_insensitive` 函数进行相同的更改，以使用迭代器方法。

### 选择循环还是迭代器

下一个合乎逻辑的问题是，在您自己的代码中应该选择哪种风格以及原因：示例 13-21 中的原始实现还是示例 13-22 中使用迭代器的版本。大多数 Rust 程序员更喜欢使用迭代器风格。一开始可能有点难掌握，但一旦您熟悉了各种迭代器适配器及其功能，迭代器就更容易理解了。代码不再纠结于循环的各种细节和构建新向量，而是专注于循环的高级目标。这抽象掉了一些常见的代码，因此更容易看到此代码独有的概念，例如迭代器中每个元素必须通过的过滤条件。

但是这两种实现真的等价吗？直观的假设可能是较低级别的循环会更快。让我们谈谈性能。