## 重构以提高模块化和错误处理

为了改进我们的程序，我们将解决四个与程序结构和潜在错误处理相关的问题。首先，我们的`main`函数现在执行两项任务：解析参数和读取文件。随着程序的增长，`main`函数处理的任务数量将会增加。当一个函数获得更多责任时，它变得更难以推理，更难以测试，更难以在不破坏其某一部分的情况下进行更改。最好将功能分离，使每个函数只负责一项任务。

这个问题也与第二个问题相关：尽管`query`和`file_path`是我们程序的配置变量，但像`contents`这样的变量用于执行程序的逻辑。`main`函数越长，我们需要引入作用域的变量就越多；作用域中的变量越多，就越难跟踪每个变量的用途。最好将配置变量分组到一个结构中，以明确它们的目的。

第三个问题是，当读取文件失败时，我们使用了`expect`来打印错误消息，但错误消息只是打印`Should have been able to read the file`（应该能够读取文件）。读取文件可能因多种原因而失败：例如，文件可能丢失，或者我们可能没有权限打开它。目前，无论情况如何，我们都会为所有情况打印相同的错误消息，这不会给用户提供任何信息！

第四，我们使用`expect`来处理错误，如果用户在运行程序时没有指定足够的参数，他们将从 Rust 获得一个`index out of bounds`（索引超出范围）错误，这并不能清楚地解释问题。最好将所有错误处理代码放在一个地方，这样未来的维护者只需要查看一个地方的代码，如果错误处理逻辑需要更改。将所有错误处理代码放在一个地方也将确保我们打印的消息对最终用户有意义。

让我们通过重构我们的项目来解决这四个问题。

### 二进制项目的关注点分离

将多个任务的责任分配给`main`函数的组织问题在许多二进制项目中很常见。因此，Rust 社区已经制定了在`main`开始变大时分割二进制程序的不同关注点的指导方针。这个过程有以下步骤：

- 将程序分为 main.rs 文件和 lib.rs 文件，并将程序的逻辑移至 lib.rs。
- 只要命令行解析逻辑很小，它可以保留在 main.rs 中。
- 当命令行解析逻辑开始变得复杂时，从 main.rs 中提取它并将其移至 lib.rs。

在此过程之后，`main`函数中剩余的责任应限于以下几点：

- 使用参数值调用命令行解析逻辑
- 设置任何其他配置
- 调用 lib.rs 中的`run`函数
- 如果`run`返回错误，则处理该错误

这种模式是关于分离关注点的：main.rs 处理程序的运行，lib.rs 处理手头任务的所有逻辑。因为你不能直接测试`main`函数，这种结构让你可以通过将所有程序逻辑移到 lib.rs 中的函数来测试它。main.rs 中剩余的代码将足够小，可以通过阅读来验证其正确性。让我们按照这个过程重新设计我们的程序。

#### 提取参数解析器

我们将把解析参数的功能提取到一个函数中，`main`将调用该函数，为将命令行解析逻辑移至 src/lib.rs 做准备。示例 12-5 显示了`main`的新开始，它调用了一个新函数`parse_config`，我们暂时将在 src/main.rs 中定义它。

文件名：src/main.rs：

```rust
use std::env;
use std::fs;

fn main() {
    let args: Vec<String> = env::args().collect();

    let (query, file_path) = parse_config(&args);

    // --snip--

    println!("Searching for {query}");
    println!("In file {file_path}");

    let contents = fs::read_to_string(file_path)
        .expect("Should have been able to read the file");

    println!("With text:\n{contents}");
}

fn parse_config(args: &[String]) -> (&str, &str) {
    let query = &args[1];
    let file_path = &args[2];

    (query, file_path)
}
```

示例 12-5：从`main`中提取`parse_config`函数

我们仍然将命令行参数收集到一个向量中，但是我们不再在`main`函数中将索引 1 处的参数值分配给变量`query`和索引 2 处的参数值分配给变量`file_path`，而是将整个向量传递给`parse_config`函数。`parse_config`函数然后保存确定哪个参数对应哪个变量的逻辑，并将值传回`main`。我们仍然在`main`中创建`query`和`file_path`变量，但`main`不再负责确定命令行参数和变量如何对应。

对于我们的小程序来说，这种重构可能看起来有些过度，但我们正在以小的、渐进的步骤进行重构。在做出这个改变后，再次运行程序以验证参数解析仍然有效。经常检查你的进展是很好的，这有助于在问题发生时识别原因。

#### 分组配置值

我们可以再进一步改进`parse_config`函数。目前，我们返回一个元组，但随后立即将该元组分解为单独的部分。这表明我们可能还没有找到正确的抽象方式。

另一个表明有改进空间的指标是`parse_config`中的`config`部分，它暗示我们返回的两个值是相关的，并且都是一个配置值的一部分。我们目前没有在数据结构中传达这种含义，除了将两个值分组到一个元组中；我们将改为把这两个值放入一个结构体中，并给每个结构体字段一个有意义的名称。这样做将使未来这段代码的维护者更容易理解不同值之间的关系以及它们的用途。

示例 12-6 展示了对`parse_config`函数的改进。

文件名：src/main.rs:

```rust
use std::env;
use std::fs;

fn main() {
    let args: Vec<String> = env::args().collect();

    let config = parse_config(&args);

    println!("Searching for {}", config.query);
    println!("In file {}", config.file_path);

    let contents = fs::read_to_string(config.file_path)
        .expect("Should have been able to read the file");

    // --snip--

    println!("With text:\n{contents}");
}

struct Config {
    query: String,
    file_path: String,
}

fn parse_config(args: &[String]) -> Config {
    let query = args[1].clone();
    let file_path = args[2].clone();

    Config { query, file_path }
}
```

示例 12-6：重构`parse_config`以返回`Config`结构体的实例

我们添加了一个名为`Config`的结构体，定义了名为`query`和`file_path`的字段。`parse_config`的签名现在表明它返回一个`Config`值。在`parse_config`的函数体中，我们之前返回的是引用`args`中`String`值的字符串切片，现在我们定义`Config`包含拥有所有权的`String`值。`main`中的`args`变量是参数值的所有者，只是让`parse_config`函数借用它们，这意味着如果`Config`尝试获取`args`中值的所有权，我们将违反 Rust 的借用规则。

我们有多种方式可以管理`String`数据；最简单的方法，尽管效率略低，是对值调用`clone`方法。这将为`Config`实例创建数据的完整副本以拥有所有权，这比存储对字符串数据的引用需要更多的时间和内存。然而，克隆数据也使我们的代码非常直接，因为我们不必管理引用的生命周期；在这种情况下，放弃一点性能以获得简单性是值得的权衡。

> ### 使用`clone`的权衡
>
> 许多 Rust 程序员倾向于避免使用 clone 来解决所有权问题，因为它的运行时成本。在第 13 章中，你将学习如何在这种情况下使用更高效的方法。但现在，复制几个字符串以继续取得进展是可以的，因为你只会复制一次，而且你的文件路径和查询字符串非常小。拥有一个稍微低效但能正常工作的程序比在第一次尝试时就试图过度优化代码要好。随着你对 Rust 的经验增加，开始使用最高效的解决方案会变得更容易，但现在，调用 clone 是完全可以接受的。

我们已经更新了`main`，使其将`parse_config`返回的`Config`实例放入名为`config`的变量中，并且我们更新了之前使用单独的`query`和`file_path`变量的代码，使其现在使用`Config`结构体上的字段。

现在我们的代码更清晰地表达了`query`和`file_path`是相关的，它们的目的是配置程序的工作方式。任何使用这些值的代码都知道在`config`实例中按照它们的用途命名的字段中找到它们。

#### 为 Config 创建一个构造函数

到目前为止，我们已经从 `main` 中提取出负责解析命令行参数的逻辑，并将其放在 `parse_config` 函数中。这样做帮助我们看到 `query` 和 `file_path` 值是相关的，这种关系应该在我们的代码中表达出来。然后我们添加了一个 `Config` 结构体来命名 `query` 和 `file_path` 的相关用途，并能够从 `parse_config` 函数返回值的名称作为结构体字段名。

既然 `parse_config` 函数的目的是创建一个 `Config` 实例，我们可以将 `parse_config` 从一个普通函数更改为与 `Config` 结构体关联的名为 `new` 的函数。进行这种更改将使代码更加符合惯用法。我们可以通过调用 `String::new` 来创建标准库中类型的实例，例如 `String`。类似地，通过将 `parse_config` 更改为与 `Config` 关联的 `new` 函数，我们将能够通过调用 `Config::new` 来创建 `Config` 的实例。示例 12-7 显示了我们需要进行的更改。

文件名：src/main.rs：

```rust
use std::env;
use std::fs;

fn main() {
    let args: Vec<String> = env::args().collect();

    let config = Config::new(&args);

    println!("Searching for {}", config.query);
    println!("In file {}", config.file_path);

    let contents = fs::read_to_string(config.file_path)
        .expect("Should have been able to read the file");

    println!("With text:\n{contents}");

    // --snip--
}

// --snip--

struct Config {
    query: String,
    file_path: String,
}

impl Config {
    fn new(args: &[String]) -> Config {
        let query = args[1].clone();
        let file_path = args[2].clone();

        Config { query, file_path }
    }
}
```

示例 12-7：将 `parse_config` 更改为 `Config::new`

我们已经更新了 `main`，将原来调用 `parse_config` 的地方改为调用 `Config::new`。我们将 `parse_config` 的名称更改为 `new` 并将其移到 `impl` 块中，这将 `new` 函数与 `Config` 关联起来。再次编译此代码以确保它能正常工作。

### 修复错误处理

现在我们将修复错误处理。回想一下，如果向量中的项目少于三个，尝试访问 `args` 向量中索引 1 或索引 2 的值将导致程序崩溃。尝试不带任何参数运行程序；它看起来像这样：

```rust
$ cargo run
   Compiling minigrep v0.1.0 (file:///projects/minigrep)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.0s
     Running `target/debug/minigrep`
thread 'main' panicked at src/main.rs:27:21:
index out of bounds: the len is 1 but the index is 1
note: run with `RUST_BACKTRACE=1` environment variable to display a backtrace
```

行 `index out of bounds: the len is 1 but the index is 1` 是一个面向程序员的错误消息。它不会帮助我们的最终用户理解他们应该做什么。现在让我们来修复这个问题。

#### 改进错误消息

在示例 12-8 中，我们在 `new` 函数中添加了一个检查，它将在访问索引 1 和索引 2 之前验证切片是否足够长。如果切片不够长，程序会崩溃并显示一个更好的错误消息。

文件名：src/main.rs：

```rust
use std::env;
use std::fs;

fn main() {
    let args: Vec<String> = env::args().collect();

    let config = Config::new(&args);

    println!("Searching for {}", config.query);
    println!("In file {}", config.file_path);

    let contents = fs::read_to_string(config.file_path)
        .expect("Should have been able to read the file");

    println!("With text:\n{contents}");
}

struct Config {
    query: String,
    file_path: String,
}

impl Config {
    // --snip--
    fn new(args: &[String]) -> Config {
        if args.len() < 3 {
            panic!("not enough arguments");
        }
        // --snip--

        let query = args[1].clone();
        let file_path = args[2].clone();

        Config { query, file_path }
    }
}
```

示例 12-8：添加对参数数量的检查

这段代码类似于我们在示例 9-13 中编写的 [Guess::new 函数](../error-handling/to-panic-or-not-to-panic#创建用于验证的自定义类型)，当 `value` 参数超出有效值范围时，我们调用了 `panic!`。这里我们不是检查值的范围，而是检查 `args` 的长度是否至少为 3，函数的其余部分可以在假设这个条件已经满足的情况下运行。如果 `args` 的项目少于三个，这个条件将为`true`，我们调用 `panic!` 宏立即结束程序。

在 `new` 中添加这几行额外的代码后，让我们再次不带任何参数运行程序，看看错误现在是什么样子：

```rust
$ cargo run
   Compiling minigrep v0.1.0 (file:///projects/minigrep)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.0s
     Running `target/debug/minigrep`
thread 'main' panicked at src/main.rs:26:13:
not enough arguments
note: run with `RUST_BACKTRACE=1` environment variable to display a backtrace
```

这个输出更好：我们现在有了一个合理的错误消息。然而，我们也有不想提供给用户的额外信息。也许我们在示例 9-13 中使用的技术在这里不是最好的：正如[第 9 章中讨论](../error-handling/to-panic-or-not-to-panic#错误处理的指导原则)的，`panic!`调用更适合于编程问题而不是使用问题。相反，我们将使用你在第 9 章中学到的另一种技术——返回一个表示成功或错误的 [Result](../error-handling/recoverable-errors-with-result)。

#### 返回 `Result` 而不是调用 `panic!`

我们可以改为返回一个 `Result` 值，在成功的情况下它将包含一个 `Config` 实例，在错误的情况下它将描述问题。我们还将函数名从 `new` 改为 `build`，因为许多程序员期望 `new` 函数永远不会失败。当 `Config::build` 与 `main` 通信时，我们可以使用 `Result` 类型来表示出现了问题。然后我们可以更改 `main` 将 `Err` 变体转换为对我们的用户来说更实用的错误，而不会出现调用 `panic!` 导致的关于 `thread 'main'` 和 `RUST_BACKTRACE` 的周围文本。

示例 12-9 显示了我们需要对现在称为 `Config::build` 的函数的返回值以及需要返回 `Result` 的函数体进行的更改。请注意，在我们更新 `main` 之前，这不会编译，我们将在下一个示例中进行更新。

文件名：src/main.rs：

```rust
use std::env;
use std::fs;

fn main() {
    let args: Vec<String> = env::args().collect();

    let config = Config::new(&args);

    println!("Searching for {}", config.query);
    println!("In file {}", config.file_path);

    let contents = fs::read_to_string(config.file_path)
        .expect("Should have been able to read the file");

    println!("With text:\n{contents}");
}

struct Config {
    query: String,
    file_path: String,
}

impl Config {
    fn build(args: &[String]) -> Result<Config, &'static str> {
        if args.len() < 3 {
            return Err("not enough arguments");
        }

        let query = args[1].clone();
        let file_path = args[2].clone();

        Ok(Config { query, file_path })
    }
}
```

示例 12-9：从 `Config::build` 返回 `Result`

我们的 `build` 函数返回一个 `Result`，在成功的情况下包含一个 `Config` 实例，在错误的情况下包含一个字符串字面量。我们的错误值将始终是具有 `'static` 生命周期的字符串字面量。

我们在函数体中做了两处更改：当用户没有传递足够的参数时，我们现在返回一个 `Err` 值，而不是调用 `panic!`，并且我们将 `Config` 返回值包装在 `Ok` 中。这些更改使函数符合其新的类型签名。

从 `Config::build` 返回 `Err` 值允许 `main` 函数处理从 build 函数返回的 `Result` 值，并在错误情况下更干净地退出进程。

#### 调用 `Config::build` 并处理错误

为了处理错误情况并打印用户友好的消息，我们需要更新 main 来处理 `Config::build` 返回的 Result，如示例 12-10 所示。我们还将从 panic! 中移除以非零错误代码退出命令行工具的责任，而是手动实现它。非零退出状态是一种约定，用于向调用我们程序的进程发出信号，表明程序以错误状态退出。

文件名：src/main.rs：

```rust
use std::env;
use std::fs;
use std::process;

fn main() {
    let args: Vec<String> = env::args().collect();

    let config = Config::build(&args).unwrap_or_else(|err| {
        println!("Problem parsing arguments: {err}");
        process::exit(1);
    });

    // --snip--

    println!("Searching for {}", config.query);
    println!("In file {}", config.file_path);

    let contents = fs::read_to_string(config.file_path)
        .expect("Should have been able to read the file");

    println!("With text:\n{contents}");
}

struct Config {
    query: String,
    file_path: String,
}

impl Config {
    fn build(args: &[String]) -> Result<Config, &'static str> {
        if args.len() < 3 {
            return Err("not enough arguments");
        }

        let query = args[1].clone();
        let file_path = args[2].clone();

        Ok(Config { query, file_path })
    }
}
```

示例 12-10：如果构建 `Config` 失败则以错误代码退出

在这个示例中，我们使用了一个我们尚未详细介绍的方法：`unwrap_or_else`，它由标准库在 `Result<T, E>` 上定义。使用 `unwrap_or_else` 允许我们定义一些自定义的、非 `panic!` 错误处理。如果 `Result` 是一个 `Ok` 值，这个方法的行为类似于 `unwrap`：它返回 `Ok` 包装的内部值。然而，如果值是一个 `Err` 值，这个方法会调用闭包中的代码，闭包是我们定义并作为参数传递给 `unwrap_or_else` 的匿名函数。我们将在第 13 章中更详细地介绍闭包。现在，你只需要知道 `unwrap_or_else` 会将 `Err` 的内部值（在这种情况下是我们在示例 12-9 中添加的静态字符串 `"not enough arguments"`）传递给我们的闭包，在参数 `err` 中，它出现在竖线之间。闭包中的代码可以在运行时使用 `err` 值。

我们添加了一个新的 `use` 行，将标准库中的 `process` 引入作用域。在错误情况下将运行的闭包中的代码只有两行：我们打印 `err` 值，然后调用 `process::exit`。`process::exit` 函数将立即停止程序并返回作为退出状态代码传递的数字。这类似于我们在示例 12-8 中使用的基于 `panic!` 的处理，但我们不再获得所有额外的输出。让我们试一试：

```rust
$ cargo run
   Compiling minigrep v0.1.0 (file:///projects/minigrep)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.48s
     Running `target/debug/minigrep`
Problem parsing arguments: not enough arguments
```

太好了！这个输出对我们的用户来说更友好。

### 从 `main` 中提取逻辑

现在我们已经完成了配置解析的重构，让我们转向程序的逻辑。正如我们在"[二进制项目的关注点分离](#二进制项目的关注点分离)"中所述，我们将提取一个名为 `run` 的函数，它将包含当前在 `main` 函数中的所有逻辑，这些逻辑与设置配置或处理错误无关。当我们完成后，`main` 将变得简洁且易于通过检查进行验证，我们将能够为所有其他逻辑编写测试。

示例 12-11 显示了提取的 `run` 函数。目前，我们只是在进行提取函数的小幅增量改进。我们仍然在 src/main.rs 中定义该函数。

文件名：src/main.rs：

```rust
use std::env;
use std::fs;
use std::process;

fn main() {
    // --snip--

    let args: Vec<String> = env::args().collect();

    let config = Config::build(&args).unwrap_or_else(|err| {
        println!("Problem parsing arguments: {err}");
        process::exit(1);
    });

    println!("Searching for {}", config.query);
    println!("In file {}", config.file_path);

    run(config);
}

fn run(config: Config) {
    let contents = fs::read_to_string(config.file_path)
        .expect("Should have been able to read the file");

    println!("With text:\n{contents}");
}

// --snip--

struct Config {
    query: String,
    file_path: String,
}

impl Config {
    fn build(args: &[String]) -> Result<Config, &'static str> {
        if args.len() < 3 {
            return Err("not enough arguments");
        }

        let query = args[1].clone();
        let file_path = args[2].clone();

        Ok(Config { query, file_path })
    }
}
```

示例 12-11：提取包含程序其余逻辑的 `run` 函数

`run` 函数现在包含了 `main` 中的所有剩余逻辑，从读取文件开始。`run` 函数将 Config 实例作为参数。

#### 从 `run` 函数返回错误

随着剩余程序逻辑被分离到 `run` 函数中，我们可以改进错误处理，就像我们在示例 12-9 中对 `Config::build` 所做的那样。不是通过调用 `expect` 让程序崩溃，`run` 函数将在出错时返回 `Result<T, E>`。这将让我们能够以用户友好的方式进一步将处理错误的逻辑整合到 `main` 中。示例 12-12 显示了我们需要对 `run` 的签名和函数体进行的更改。

文件名：src/main.rs：

```rust
use std::env;
use std::fs;
use std::process;
use std::error::Error;

// --snip--


fn main() {
    let args: Vec<String> = env::args().collect();

    let config = Config::build(&args).unwrap_or_else(|err| {
        println!("Problem parsing arguments: {err}");
        process::exit(1);
    });

    println!("Searching for {}", config.query);
    println!("In file {}", config.file_path);

    run(config);
}

fn run(config: Config) -> Result<(), Box<dyn Error>> {
    let contents = fs::read_to_string(config.file_path)?;

    println!("With text:\n{contents}");

    Ok(())
}

struct Config {
    query: String,
    file_path: String,
}

impl Config {
    fn build(args: &[String]) -> Result<Config, &'static str> {
        if args.len() < 3 {
            return Err("not enough arguments");
        }

        let query = args[1].clone();
        let file_path = args[2].clone();

        Ok(Config { query, file_path })
    }
}
```

示例 12-12：更改 `run` 函数以返回 `Result`

我们在这里做了三个重要的更改。首先，我们将 `run` 函数的返回类型更改为 `Result<(), Box<dyn Error>>`。这个函数之前返回单元类型 `()`，我们在 `Ok` 情况下保持该值作为返回值。

对于错误类型，我们使用了特征对象 `Box<dyn Error>`（并且我们通过顶部的 use 语句将 `std::error::Error` 引入作用域）。我们将在第 18 章中介绍特征对象。现在，只需知道 `Box<dyn Error>` 意味着该函数将返回一个实现 `Error` 特征的类型，但我们不必指定返回值的具体类型。这使我们能够灵活地在不同的错误情况下返回可能是不同类型的错误值。`dyn` 关键字是 dynamic 的缩写。

其次，我们移除了对 `expect` 的调用，转而使用 `?` 运算符，正如我们在第 9 章中讨论的那样。与在错误时 `panic!` 不同，`?` 将从当前函数返回错误值，供调用者处理。

第三，`run` 函数现在在成功情况下返回 `Ok` 值。我们在签名中将 `run` 函数的成功类型声明为 `()`，这意味着我们需要将单元类型值包装在 `Ok` 值中。这种 `Ok(())` 语法一开始可能看起来有点奇怪，但使用 `()` 这样是表示我们调用 `run` 只是为了它的副作用的惯用方式；它不返回我们需要的值。

当你运行这段代码时，它会编译但会显示一个警告：

```rust
$ cargo run -- the poem.txt
   Compiling minigrep v0.1.0 (file:///projects/minigrep)
warning: unused `Result` that must be used
  --> src/main.rs:19:5
   |
19 |     run(config);
   |     ^^^^^^^^^^^
   |
   = note: this `Result` may be an `Err` variant, which should be handled
   = note: `#[warn(unused_must_use)]` on by default
help: use `let _ = ...` to ignore the resulting value
   |
19 |     let _ = run(config);
   |     +++++++

warning: `minigrep` (bin "minigrep") generated 1 warning
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.71s
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

Rust 告诉我们，我们的代码忽略了 `Result` 值，而 `Result` 值可能表示发生了错误。但我们没有检查是否发生了错误，编译器提醒我们，我们可能打算在这里有一些错误处理代码！让我们现在纠正这个问题。

#### 在 `main` 中处理从 `run` 返回的错误

我们将检查错误并使用类似于我们在示例 12-10 中对 `Config::build` 使用的技术来处理它们，但有一点不同：

文件名：src/main.rs：

```rust
use std::env;
use std::error::Error;
use std::fs;
use std::process;

fn main() {
    // --snip--

    let args: Vec<String> = env::args().collect();

    let config = Config::build(&args).unwrap_or_else(|err| {
        println!("Problem parsing arguments: {err}");
        process::exit(1);
    });

    println!("Searching for {}", config.query);
    println!("In file {}", config.file_path);

    if let Err(e) = run(config) {
        println!("Application error: {e}");
        process::exit(1);
    }
}

fn run(config: Config) -> Result<(), Box<dyn Error>> {
    let contents = fs::read_to_string(config.file_path)?;

    println!("With text:\n{contents}");

    Ok(())
}

struct Config {
    query: String,
    file_path: String,
}

impl Config {
    fn build(args: &[String]) -> Result<Config, &'static str> {
        if args.len() < 3 {
            return Err("not enough arguments");
        }

        let query = args[1].clone();
        let file_path = args[2].clone();

        Ok(Config { query, file_path })
    }
}
```

我们使用 `if let` 而不是 `unwrap_or_else` 来检查 `run` 是否返回 `Err` 值，并在返回时调用 `process::exit(1)`。`run` 函数不返回我们想要 `unwrap` 的值，就像 `Config::build` 返回 `Config` 实例那样。因为 `run` 在成功情况下返回 `()`，我们只关心检测错误，所以我们不需要 `unwrap_or_else` 来返回解包的值，这只会是 `()`。

`if let` 和 `unwrap_or_else` 函数的函数体在两种情况下都是相同的：我们打印错误并退出。

### 将代码拆分为库 Crate

到目前为止，我们的 `minigrep` 项目看起来不错！现在我们将拆分 src/main.rs 文件，并将一些代码放入 src/lib.rs 文件中。这样，我们可以测试代码，并拥有一个责任更少的 src/main.rs 文件。

让我们将 src/main.rs 中不在 `main` 函数中的所有代码移动到 src/lib.rs：

- `run` 函数定义
- 相关的 `use` 语句
- `Config` 的定义
- `Config::build` 函数定义

src/lib.rs 的内容应该具有示例 12-13 中显示的签名（为了简洁起见，我们省略了函数体）。请注意，在我们按照示例 12-14 修改 src/main.rs 之前，这不会编译。

文件名：src/lib.rs：

```rust
use std::error::Error;
use std::fs;

pub struct Config {
    pub query: String,
    pub file_path: String,
}

impl Config {
    pub fn build(args: &[String]) -> Result<Config, &'static str> {
        // --snip--
        if args.len() < 3 {
            return Err("not enough arguments");
        }

        let query = args[1].clone();
        let file_path = args[2].clone();

        Ok(Config { query, file_path })
    }
}

pub fn run(config: Config) -> Result<(), Box<dyn Error>> {
    // --snip--
    let contents = fs::read_to_string(config.file_path)?;

    println!("With text:\n{contents}");

    Ok(())
}
```

示例 12-13：将 `Config` 和 `run` 移动到 src/lib.rs

我们大量使用了 `pub` 关键字：在 `Config` 上，在其字段和 `build` 方法上，以及在 `run` 函数上。我们现在有了一个可以测试的公共 API 的库 crate！

现在我们需要将移动到 src/lib.rs 的代码引入到 src/main.rs 中二进制 crate 的作用域，如示例 12-14 所示。

文件名：src/main.rs：

```rust
use std::env;
use std::process;

use minigrep::Config;

fn main() {
    // --snip--
    let args: Vec<String> = env::args().collect();

    let config = Config::build(&args).unwrap_or_else(|err| {
        println!("Problem parsing arguments: {err}");
        process::exit(1);
    });

    println!("Searching for {}", config.query);
    println!("In file {}", config.file_path);

    if let Err(e) = minigrep::run(config) {
        // --snip--
        println!("Application error: {e}");
        process::exit(1);
    }
}
```

示例 12-14：在 src/main.rs 中使用 `minigrep` 库 crate

我们添加了一行 use `minigrep::Config` 将 `Config` 类型从库 crate 引入到二进制 crate 的作用域中，并且我们在 `run` 函数前加上了我们的 crate 名称。现在所有功能应该都已连接并且可以工作。使用 `cargo run` 运行程序，确保一切正常工作。

呼！这是一项艰巨的工作，但我们为未来的成功做好了准备。现在处理错误变得更加容易，我们已经使代码更加模块化。从现在开始，我们几乎所有的工作都将在 src/lib.rs 中完成。

让我们利用这种新发现的模块化，做一些在旧代码中会很困难但在新代码中很容易的事情：我们将编写一些测试！
