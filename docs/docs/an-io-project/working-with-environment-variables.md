## 使用环境变量

我们将通过添加一个额外的功能来改进`minigrep`：一个可以通过环境变量开启的大小写不敏感搜索选项。我们可以将这个功能做成命令行选项，要求用户每次想要应用它时都输入，但通过将其设为环境变量，我们允许用户设置一次环境变量，并在该终端会话中进行所有的大小写不敏感搜索。

## 为大小写不敏感的`search`函数编写一个失败测试

我们首先添加一个新的`search_case_insensitive`函数，当环境变量有值时将调用它。我们将继续遵循TDD过程，所以第一步仍然是编写一个失败测试。我们将为新的`search_case_insensitive`函数添加一个新测试，并将我们的旧测试从`one_result`重命名为`case_sensitive`，以明确两个测试之间的区别，如代码示例12-20所示。

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

代码示例12-20：为我们即将添加的大小写不敏感函数添加一个新的失败测试

注意，我们也编辑了旧测试的`contents`。我们添加了一行文本`"Duct tape."`，使用大写D，当我们以大小写敏感的方式搜索时，它不应该匹配查询`"duct"`。以这种方式更改旧测试有助于确保我们不会意外破坏已经实现的大小写敏感搜索功能。这个测试现在应该通过，并且在我们处理大小写不敏感搜索时应该继续通过。

大小写不敏感搜索的新测试使用`"rUsT"`作为查询。在我们即将添加的`search_case_insensitive`函数中，查询`"rUsT"`应该匹配包含大写R的`"Rust:"`行，并且匹配`"Trust me."`行，尽管两者的大小写与查询不同。这是我们的失败测试，它将无法编译，因为我们还没有定义`search_case_insensitive`函数。可以随意添加一个总是返回空向量的骨架实现，类似于我们在代码示例12-16中为`search`函数所做的那样，以查看测试编译并失败。

## 实现`search_case_insensitive`函数

`search_case_insensitive`函数，如代码示例12-21所示，将与`search`函数几乎相同。唯一的区别是我们将`query`和每个`line`都转换为小写，这样无论输入参数的大小写如何，在检查行是否包含查询时，它们都将是相同的大小写。

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

代码示例12-21：定义`search_case_insensitive`函数，在比较前将查询和行转换为小写

首先，我们将`query`字符串转换为小写，并将其存储在一个同名的新变量中，覆盖原始的`query`。对查询调用`to_lowercase`是必要的，这样无论用户的查询是`"rust"`、`"RUST"`、`"Rust"`还是`"rUsT"`，我们都会将查询视为`"rust"`，并且对大小写不敏感。虽然`to_lowercase`将处理基本的Unicode，但它不会100%准确。如果我们正在编写一个真实的应用程序，我们会想在这里做更多的工作，但本节是关于环境变量，而不是Unicode，所以我们在这里就此打住。

注意，`query`现在是一个`String`而不是一个字符串切片，因为调用`to_lowercase`创建了新数据，而不是引用现有数据。以`"rUsT"`为例：该字符串切片不包含我们可以使用的小写`u`或`t`，所以我们必须分配一个包含`"rust"`的新`String`。当我们现在将`query`作为参数传递给`contains`方法时，我们需要添加一个&符号，因为`contains`的签名被定义为接受一个字符串切片。

接下来，我们在每一行上添加对`to_lowercase`的调用，以将所有字符转换为小写。现在我们已经将`line`和`query`转换为小写，无论查询的大小写如何，我们都会找到匹配项。

让我们看看这个实现是否通过测试：

```rust
$ cargo test
   Compiling minigrep v0.1.0 (file:///projects/minigrep)
    Finished `test` profile [unoptimized + debuginfo] target(s) in 1.33s
     Running unittests src/lib.rs (target/debug/deps/minigrep-9cd200e5fac0fc94)

running 2 tests
test tests::case_insensitive ... ok
test tests::case_sensitive ... ok

test result: ok. 2 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s

     Running unittests src/main.rs (target/debug/deps/minigrep-9cd200e5fac0fc94)

running 0 tests

test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s

   Doc-tests minigrep

running 0 tests

test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
```

太好了！它们通过了。现在，让我们从`run`函数调用新的`search_case_insensitive`函数。首先，我们将向`Config`结构添加一个配置选项，以在大小写敏感和大小写不敏感搜索之间切换。添加这个字段将导致编译器错误，因为我们还没有在任何地方初始化这个字段：

Filename: src/lib.rs:

```rust
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

        Ok(Config { query, file_path })
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

我们添加了持有布尔值的`ignore_case`字段。接下来，我们需要`run`函数检查`ignore_case`字段的值，并使用它来决定是调用`search`函数还是`search_case_insensitive`函数，如代码示例12-22所示。这仍然无法编译。

Filename: src/lib.rs:

```rust
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

        Ok(Config { query, file_path })
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

代码示例12-22：基于`config.ignore_case`中的值调用`search`或`search_case_insensitive`

最后，我们需要检查环境变量。用于处理环境变量的函数在标准库的`env`模块中，所以我们在src/lib.rs的顶部将该模块引入作用域。然后我们将使用`env`模块中的`var`函数来检查是否为名为`IGNORE_CASE`的环境变量设置了任何值，如代码示例12-23所示。

Filename: src/lib.rs:

```rust
use std::env;
// --snip--

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

代码示例12-23：检查名为`IGNORE_CASE`的环境变量中的任何值

在这里，我们创建了一个新变量`ignore_case`。要设置其值，我们调用`env::var`函数并传递`IGNORE_CASE`环境变量的名称。`env::var`函数返回一个`Result`，如果环境变量设置为任何值，它将是成功的`Ok`变体，其中包含环境变量的值。如果环境变量未设置，它将返回`Err`变体。

我们在`Result`上使用`is_ok`方法来检查环境变量是否已设置，这意味着程序应该进行大小写不敏感的搜索。如果`IGNORE_CASE`环境变量未设置为任何值，`is_ok`将返回`false`，程序将执行大小写敏感的搜索。我们不关心环境变量的值，只关心它是否被设置或未设置，所以我们检查`is_ok`而不是使用`unwrap`、`expect`或我们在`Result`上看到的任何其他方法。

我们将`ignore_case`变量中的值传递给`Config`实例，以便`run`函数可以读取该值并决定是调用`search_case_insensitive`还是`search`，正如我们在代码示例12-22中实现的那样。

让我们试一试！首先，我们将在不设置环境变量的情况下运行程序，并使用查询`to`，它应该匹配包含全小写单词to的任何行：

```rust
$ cargo run -- to poem.txt
   Compiling minigrep v0.1.0 (file:///projects/minigrep)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.0s
     Running `target/debug/minigrep to poem.txt`
Are you nobody, too?
How dreary to be somebody!
```

看起来仍然有效！现在让我们将`IGNORE_CASE`设置为`1`，但使用相同的查询to：

```rust
$ IGNORE_CASE=1 cargo run -- to poem.txt
```

如果你使用的是PowerShell，你需要将环境变量设置和运行程序作为单独的命令：

```rust
PS> $Env:IGNORE_CASE=1; cargo run -- to poem.txt
```

这将使`IGNORE_CASE`在你的shell会话的剩余部分持续存在。可以使用`Remove-Item`命令取消设置：

```rust
PS> Remove-Item Env:IGNORE_CASE
```

我们应该得到包含to的行，可能有大写字母：

```rust
Are you nobody, too?
How dreary to be somebody!
To tell your name the livelong day
To an admiring bog!

```

太好了，我们也得到了包含To的行！我们的`minigrep`程序现在可以通过环境变量控制进行大小写不敏感的搜索。现在你知道如何管理使用命令行参数或环境变量设置的选项。

一些程序允许对同一配置使用参数和环境变量。在这些情况下，程序决定一个或另一个优先。作为你自己的另一个练习，尝试通过命令行参数或环境变量控制大小写敏感性。决定如果程序运行时一个设置为大小写敏感，一个设置为忽略大小写，命令行参数还是环境变量应该优先。

`std::env`模块包含许多更有用的处理环境变量的功能：查看其文档以了解可用的内容。