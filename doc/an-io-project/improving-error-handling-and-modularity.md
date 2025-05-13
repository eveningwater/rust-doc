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

清单 12-6 展示了对`parse_config`函数的改进。

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

清单 12-6：重构`parse_config`以返回`Config`结构体的实例

我们添加了一个名为`Config`的结构体，定义了名为`query`和`file_path`的字段。`parse_config`的签名现在表明它返回一个`Config`值。在`parse_config`的函数体中，我们之前返回的是引用`args`中`String`值的字符串切片，现在我们定义`Config`包含拥有所有权的`String`值。`main`中的`args`变量是参数值的所有者，只是让`parse_config`函数借用它们，这意味着如果`Config`尝试获取`args`中值的所有权，我们将违反 Rust 的借用规则。

我们有多种方式可以管理`String`数据；最简单的方法，尽管效率略低，是对值调用`clone`方法。这将为`Config`实例创建数据的完整副本以拥有所有权，这比存储对字符串数据的引用需要更多的时间和内存。然而，克隆数据也使我们的代码非常直接，因为我们不必管理引用的生命周期；在这种情况下，放弃一点性能以获得简单性是值得的权衡。

> ### 使用`clone`的权衡
>
> 许多 Rust 程序员倾向于避免使用 clone 来解决所有权问题，因为它的运行时成本。在第 13 章中，你将学习如何在这种情况下使用更高效的方法。但现在，复制几个字符串以继续取得进展是可以的，因为你只会复制一次，而且你的文件路径和查询字符串非常小。拥有一个稍微低效但能正常工作的程序比在第一次尝试时就试图过度优化代码要好。随着你对 Rust 的经验增加，开始使用最高效的解决方案会变得更容易，但现在，调用 clone 是完全可以接受的。

我们已经更新了`main`，使其将`parse_config`返回的`Config`实例放入名为`config`的变量中，并且我们更新了之前使用单独的`query`和`file_path`变量的代码，使其现在使用`Config`结构体上的字段。

现在我们的代码更清晰地表达了`query`和`file_path`是相关的，它们的目的是配置程序的工作方式。任何使用这些值的代码都知道在`config`实例中按照它们的用途命名的字段中找到它们。

#### 为 Config 创建一个构造函数

到目前为止，我们已经从 `main` 中提取出负责解析命令行参数的逻辑，并将其放在 `parse_config` 函数中。这样做帮助我们看到 `query` 和 `file_path` 值是相关的，这种关系应该在我们的代码中表达出来。然后我们添加了一个 `Config` 结构体来命名 `query` 和 `file_path` 的相关用途，并能够从 `parse_config` 函数返回值的名称作为结构体字段名。

既然 `parse_config` 函数的目的是创建一个 `Config` 实例，我们可以将 `parse_config` 从一个普通函数更改为与 `Config` 结构体关联的名为 `new` 的函数。进行这种更改将使代码更加符合惯用法。我们可以通过调用 `String::new` 来创建标准库中类型的实例，例如 `String`。类似地，通过将 `parse_config` 更改为与 `Config` 关联的 `new` 函数，我们将能够通过调用 `Config::new` 来创建 `Config` 的实例。清单 12-7 显示了我们需要进行的更改。

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

清单 12-7：将 `parse_config` 更改为 `Config::new`

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

在清单 12-8 中，我们在 `new` 函数中添加了一个检查，它将在访问索引 1 和索引 2 之前验证切片是否足够长。如果切片不够长，程序会崩溃并显示一个更好的错误消息。

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

清单 12-8：添加对参数数量的检查

这段代码类似于我们在清单 9-13 中编写的 [Guess::new 函数](../error-handling/to-panic-or-not-to-panic#创建用于验证的自定义类型)，当 `value` 参数超出有效值范围时，我们调用了 `panic!`。这里我们不是检查值的范围，而是检查 `args` 的长度是否至少为 3，函数的其余部分可以在假设这个条件已经满足的情况下运行。如果 `args` 的项目少于三个，这个条件将为`true`，我们调用 `panic!` 宏立即结束程序。

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

这个输出更好：我们现在有了一个合理的错误消息。然而，我们也有不想提供给用户的额外信息。也许我们在清单 9-13 中使用的技术在这里不是最好的：正如[第 9 章中讨论](../error-handling/to-panic-or-not-to-panic#错误处理的指导原则)的，`panic!`调用更适合于编程问题而不是使用问题。相反，我们将使用你在第 9 章中学到的另一种技术——返回一个表示成功或错误的 [Result](../error-handling/recoverable-errors-with-result)。
