## Future 与异步语法

Rust 中异步编程的关键要素是 future 以及 Rust 的 `async` 和 `await` 关键字。

Future 是一个可能现在还未就绪，但将来某个时候会就绪的值。（这个概念在许多语言中都有出现，有时也称为任务或 Promise。）Rust 提供了一个 `Future` trait 作为构建块，以便不同的异步操作可以使用不同的数据结构实现，但具有一个共同的接口。在 Rust 中，future 是实现 `Future` trait 的类型。每个 future 都包含其自身关于已取得的进展以及“就绪”意味着什么的信息。

你可以将 `async` 关键字应用于块和函数，以指定它们可以被中断和恢复。在 `async` 块或 `async` 函数中，你可以使用 `await` 关键字来等待一个 future（即，等待它变为就绪）。在 `async` 块或函数中等待 future 的任何点都是该 `async` 块或函数暂停和恢复的潜在位置。与 future 检查其值是否可用的过程称为轮询（polling）。

其他一些语言，例如 C# 和 JavaScript，也使用 `async` 和 `await` 关键字进行异步编程。如果你熟悉这些语言，你可能会注意到 Rust 的处理方式有一些显著差异，包括它如何处理语法。这是有充分理由的，我们将会看到！

在编写异步 Rust 时，我们大部分时间都使用 `async` 和 `await` 关键字。Rust 将它们编译成使用 `Future` trait 的等效代码，就像它将 `for` 循环编译成使用 `Iterator` trait 的等效代码一样。然而，由于 Rust 提供了 `Future` trait，你也可以在需要时为自己的数据类型实现它。我们将在本章中看到的许多函数都返回带有自己 `Future` 实现的类型。我们将在本章末尾回到 trait 的定义，并深入探讨它的工作原理，但这些细节足以让我们继续前进。

这可能感觉有点抽象，所以让我们编写我们的第一个异步程序：一个小型网络爬虫。我们将从命令行传入两个 URL，并发地获取它们，并返回其中任何一个先完成的结果。这个例子将包含一些新的语法，但不用担心——我们将在过程中解释你需要知道的一切。

### 我们的第一个异步程序

为了将本章的重点放在学习异步而不是处理生态系统上，我们创建了 `trpl` crate（`trpl` 是“The Rust Programming Language”的缩写）。它重新导出了你将需要的所有类型、trait 和函数，主要来自 `futures` 和 `tokio` crate。`futures` crate 是 Rust 异步代码实验的官方场所，它实际上是 `Future` trait 最初设计的地方。`tokio` 是当今 Rust 中使用最广泛的异步运行时，特别是对于 Web 应用程序。还有其他优秀的运行时，它们可能更适合你的目的。我们在 `trpl` 内部使用 `tokio` crate，因为它经过了充分测试并被广泛使用。

在某些情况下，`trpl` 还会重命名或包装原始 API，以让你专注于与本章相关的细节。如果你想了解这个 crate 的作用，我们鼓励你查看其源代码。你将能够看到每个重新导出来自哪个 crate，并且我们留下了大量的注释来解释这个 crate 的作用。

创建一个名为 `hello-async` 的新二进制项目，并将 `trpl` crate 添加为依赖项：

```rust
$ cargo new hello-async
$ cd hello-async
$ cargo add trpl
```

现在我们可以使用 `trpl` 提供的各种组件来编写我们的第一个异步程序。我们将构建一个小型命令行工具，它获取两个网页，从每个网页中提取 `<title>` 元素，并打印出哪个页面先完成整个过程的标题。

### 定义 `page_title` 函数

让我们从编写一个函数开始，该函数接受一个页面 URL 作为参数，向其发出请求，并返回标题元素的文本（参见 Listing 17-1）。

Filename: src/main.rs:

```rust
extern crate trpl; // required for mdbook test

fn main() {
    // TODO: we'll add this next!
}

use trpl::Html;

async fn page_title(url: &str) -> Option<String> {
    let response = trpl::get(url).await;
    let response_text = response.text().await;
    Html::parse(&response_text)
        .select_first("title")
        .map(|title_element| title_element.inner_html())
}
```

Listing 17-1: 定义一个异步函数以从 HTML 页面获取标题元素

首先，我们定义一个名为 `page_title` 的函数，并用 `async` 关键字标记它。然后我们使用 `trpl::get` 函数获取传入的任何 URL，并添加 `await` 关键字来等待响应。为了获取响应的文本，我们调用其 `text` 方法，并再次使用 `await` 关键字等待它。这两个步骤都是异步的。对于 `get` 函数，我们必须等待服务器发回响应的第一部分，其中将包含 HTTP 头、cookie 等，并且可以与响应正文分开传递。特别是如果正文非常大，它可能需要一些时间才能全部到达。因为我们必须等待整个响应到达，所以 `text` 方法也是异步的。

我们必须显式地等待这两个 future，因为 Rust 中的 future 是惰性的：除非你使用 `await` 关键字要求它们，否则它们不会做任何事情。（事实上，如果你不使用 future，Rust 会显示一个编译器警告。）这可能会让你想起第 13 章中关于迭代器在“使用迭代器处理一系列项”一节中的讨论。迭代器除非你调用它们的 `next` 方法——无论是直接调用还是通过使用 `for` 循环或在底层使用 `next` 的方法（如 `map`）——否则它们不会做任何事情。同样，future 除非你显式地要求它们，否则它们不会做任何事情。这种惰性允许 Rust 避免运行异步代码，直到它真正需要时才运行。

> 注意：这与我们在上一章中使用 `thread::spawn` 在“使用 `spawn` 创建新线程”中看到的行为不同，在那里我们传递给另一个线程的闭包会立即开始运行。这与许多其他语言处理异步的方式也不同。但对于 Rust 来说，能够提供其性能保证非常重要，就像迭代器一样。

一旦我们有了 `response_text`，我们就可以使用 `Html::parse` 将其解析为 `Html` 类型的一个实例。现在我们不再是原始字符串，而是一种可以用来处理 HTML 作为更丰富数据类型的类型。特别是，我们可以使用 `select_first` 方法来查找给定 CSS 选择器的第一个实例。通过传入字符串 `"title"`，我们将获取文档中的第一个 `<title>` 元素（如果存在）。因为可能没有任何匹配的元素，`select_first` 返回一个 `Option<ElementRef>`。最后，我们使用 `Option::map` 方法，它允许我们处理 `Option` 中的项（如果存在），如果不存在则不执行任何操作。（我们也可以在这里使用 `match` 表达式，但 `map` 更符合习惯。）在提供给 `map` 的函数体中，我们对 `title_element` 调用 `inner_html` 以获取其内容，这是一个 `String`。最终，我们得到了一个 `Option<String>`。

请注意，Rust 的 `await` 关键字位于你正在等待的表达式之后，而不是之前。也就是说，它是一个后缀关键字。这可能与你使用其他语言中的异步时所习惯的不同，但在 Rust 中，它使得方法链更容易使用。因此，我们可以更改 `page_title` 的主体，将 `trpl::get` 和 `text` 函数调用与 `await` 链接在一起，如 Listing 17-2 所示。

Filename: src/main.rs:

```rust
extern crate trpl; // required for mdbook test

use trpl::Html;

fn main() {
    // TODO: we'll add this next!
}

async fn page_title(url: &str) -> Option<String> {
    let response_text = trpl::get(url).await.text().await;
    Html::parse(&response_text)
        .select_first("title")
        .map(|title_element| title_element.inner_html())
}
```

Listing 17-2: 使用 `await` 关键字进行链式调用

至此，我们已经成功编写了第一个异步函数！在我们添加一些代码到 `main` 中来调用它之前，让我们再多谈谈我们所写的内容以及它的含义。

当 Rust 看到用 `async` 关键字标记的块时，它会将其编译成一个唯一的匿名数据类型，该类型实现了 `Future` trait。当 Rust 看到用 `async` 标记的函数时，它会将其编译成一个非异步函数，其主体是一个 `async` 块。异步函数的返回类型是编译器为该 `async` 块创建的匿名数据类型的类型。

因此，编写 `async fn` 等同于编写一个返回返回类型 future 的函数。对于编译器来说，像 Listing 17-1 中的 `async fn page_title` 这样的函数定义等同于这样定义的非异步函数：

```rust
#![allow(unused)]
fn main() {
extern crate trpl; // required for mdbook test
use std::future::Future;
use trpl::Html;

fn page_title(url: &str) -> impl Future<Output = Option<String>> {
    async move {
        let text = trpl::get(url).await.text().await;
        Html::parse(&text)
            .select_first("title")
            .map(|title| title.inner_html())
    }
}
}
```

让我们逐一分析转换后的版本：

* 它使用了我们在第 10 章“Trait 作为参数”一节中讨论的 `impl Trait` 语法。
* 返回的 trait 是一个 `Future`，带有一个关联类型 `Output`。请注意，`Output` 类型是 `Option<String>`，这与 `async fn` 版本的 `page_title` 的原始返回类型相同。
* 原始函数体中调用的所有代码都包装在一个 `async move` 块中。请记住，块是表达式。整个块是函数返回的表达式。
* 这个 `async` 块生成一个类型为 `Option<String>` 的值，如前所述。该值与返回类型中的 `Output` 类型匹配。这就像你见过的其他块一样。
* 新的函数体是一个 `async move` 块，因为它使用了 `url` 参数。（我们将在本章后面更详细地讨论 `async` 与 `async move`。）

现在我们可以在 `main` 中调用 `page_title`。

### 确定单个页面的标题

首先，我们只获取单个页面的标题。在 Listing 17-3 中，我们遵循了第 12 章中在“接受命令行参数”一节中获取命令行参数的相同模式。然后我们将第一个 URL `page_title` 传递给它并等待结果。因为 future 生成的值是 `Option<String>`，所以我们使用 `match` 表达式打印不同的消息，以说明页面是否包含 `<title>`。

Filename: src/main.rs:

```rust
extern crate trpl; // required for mdbook test

use trpl::Html;

async fn main() {
    let args: Vec<String> = std::env::args().collect();
    let url = &args[1];
    match page_title(url).await {
        Some(title) => println!("The title for {url} was {title}"),
        None => println!("{url} had no title"),
    }
}

async fn page_title(url: &str) -> Option<String> {
    let response_text = trpl::get(url).await.text().await;
    Html::parse(&response_text)
        .select_first("title")
        .map(|title_element| title_element.inner_html())
}
```

Listing 17-3: 从 `main` 中调用 `page_title` 函数，带有一个用户提供的参数

不幸的是，这段代码无法编译。我们只能在异步函数或块中使用 `await` 关键字，Rust 不允许我们将特殊的 `main` 函数标记为异步。

```rust
error[E0752]: `main` function is not allowed to be `async`
 --> src/main.rs:6:1
  |
6 | async fn main() {
  | ^^^^^^^^^^^^^^^ `main` function is not allowed to be `async`
```

`main` 不能被标记为 `async` 的原因是异步代码需要一个运行时：一个管理异步代码执行细节的 Rust crate。程序的 `main` 函数可以初始化一个运行时，但它本身不是一个运行时。（我们稍后会看到为什么会这样。）每个执行异步代码的 Rust 程序至少有一个地方设置运行时并执行 future。

大多数支持异步的语言都捆绑了一个运行时，但 Rust 没有。相反，有许多不同的异步运行时可用，每个运行时都根据其目标用例做出不同的权衡。例如，一个拥有许多 CPU 核心和大量 RAM 的高吞吐量 Web 服务器与一个只有单个核心、少量 RAM 且没有堆分配能力的微控制器有非常不同的需求。提供这些运行时的 crate 通常也提供常见功能的异步版本，例如文件或网络 I/O。

在这里，以及在本章的其余部分，我们将使用 `trpl` crate 中的 `run` 函数，它接受一个 future 作为参数并将其运行到完成。在幕后，调用 `run` 会设置一个运行时，用于运行传入的 future。一旦 future 完成，`run` 会返回 future 生成的任何值。

我们可以将 `page_title` 返回的 future 直接传递给 `run`，一旦它完成，我们就可以匹配结果 `Option<String>`，就像我们在 Listing 17-3 中尝试的那样。然而，对于本章中的大多数示例（以及现实世界中的大多数异步代码），我们将不仅仅进行一次异步函数调用，因此我们将传递一个 `async` 块并显式等待 `page_title` 调用的结果，如 Listing 17-4 所示。

Filename: src/main.rs:

```rust
extern crate trpl; // required for mdbook test

use trpl::Html;

fn main() {
    let args: Vec<String> = std::env::args().collect();

    trpl::run(async {
        let url = &args[1];
        match page_title(url).await {
            Some(title) => println!("The title for {url} was {title}"),
            None => println!("{url} had no title"),
        }
    })
}

async fn page_title(url: &str) -> Option<String> {
    let response_text = trpl::get(url).await.text().await;
    Html::parse(&response_text)
        .select_first("title")
        .map(|title_element| title_element.inner_html())
}
```

Listing 17-4: 使用 `trpl::run` 等待一个异步块

当我们运行这段代码时，我们得到了最初预期的行为：

```rust
$ cargo run -- https://www.rust-lang.org
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.05s
     Running `target/debug/async_await 'https://www.rust-lang.org'`
The title for https://www.rust-lang.org was
            Rust Programming Language
```

呼——我们终于有了一些可用的异步代码！但在我们添加代码来让两个站点相互竞争之前，让我们简要地将注意力转回到 future 的工作原理。

每个 `await` 点——也就是说，代码中使用 `await` 关键字的每个地方——都表示控制权交还给运行时的地方。为了实现这一点，Rust 需要跟踪 `async` 块中涉及的状态，以便运行时可以启动其他工作，然后在准备好再次尝试推进第一个工作时返回。这是一个不可见的状态机，就好像你编写了一个这样的枚举来保存每个 `await` 点的当前状态：

```rust
#![allow(unused)]
fn main() {
extern crate trpl; // required for mdbook test

enum PageTitleFuture<'a> {
    Initial { url: &'a str },
    GetAwaitPoint { url: &'a str },
    TextAwaitPoint { response: trpl::Response },
}
}
```

然而，手动编写在每个状态之间转换的代码将是繁琐且容易出错的，特别是当你以后需要为代码添加更多功能和更多状态时。幸运的是，Rust 编译器会自动为异步代码创建和管理状态机数据结构。围绕数据结构的正常借用和所有权规则仍然适用，令人高兴的是，编译器也会为我们检查这些规则并提供有用的错误消息。我们将在本章后面讨论其中的一些。

最终，必须有东西来执行这个状态机，而这个东西就是运行时。（这就是为什么你在研究运行时时可能会遇到执行器（executor）的引用：执行器是运行时中负责执行异步代码的部分。）

现在你可以明白为什么编译器在 Listing 17-3 中阻止我们将 `main` 本身设为异步函数了。如果 `main` 是一个异步函数，那么就需要有其他东西来管理 `main` 返回的任何 future 的状态机，但 `main` 是程序的起点！相反，我们在 `main` 中调用了 `trpl::run` 函数来设置一个运行时，并运行 `async` 块返回的 future 直到它完成。

> 注意：一些运行时提供了宏，因此你可以编写一个异步 `main` 函数。这些宏将 `async fn main() { ... }` 重写为普通的 `fn main`，这与我们在 Listing 17-4 中手动完成的事情相同：调用一个函数，该函数以 `trpl::run` 的方式将 future 运行到完成。

现在让我们将这些部分组合起来，看看如何编写并发代码。

### 我们的两个 URL 相互竞争

在 Listing 17-5 中，我们使用从命令行传入的两个不同 URL 调用 `page_title` 并让它们竞争。

Filename: src/main.rs:

```rust
extern crate trpl; // required for mdbook test

use trpl::{Either, Html};

fn main() {
    let args: Vec<String> = std::env::args().collect();

    trpl::run(async {
        let title_fut_1 = page_title(&args[1]);
        let title_fut_2 = page_title(&args[2]);

        let (url, maybe_title) =
            match trpl::race(title_fut_1, title_fut_2).await {
                Either::Left(left) => left,
                Either::Right(right) => right,
            };

        println!("{url} returned first");
        match maybe_title {
            Some(title) => println!("Its page title is: '{title}'"),
            None => println!("Its title could not be parsed."),
        }
    })
}

async fn page_title(url: &str) -> (&str, Option<String>) {
    let text = trpl::get(url).await.text().await;
    let title = Html::parse(&text)
        .select_first("title")
        .map(|title| title.inner_html());
    (url, title)
}
```

Listing 17-5:

我们首先为每个用户提供的 URL 调用 `page_title`。我们将结果 future 保存为 `title_fut_1` 和 `title_fut_2`。请记住，这些现在还没有做任何事情，因为 future 是惰性的，我们还没有等待它们。然后我们将这些 future 传递给 `trpl::race`，它返回一个值，指示哪个传入的 future 先完成。

> 注意：在底层，`race` 是建立在一个更通用的函数 `select` 之上的，你将在实际的 Rust 代码中更常见地遇到它。`select` 函数可以做很多 `trpl::race` 函数不能做的事情，但它也有一些额外的复杂性，我们现在可以跳过。

任何一个 future 都可以合法地“赢”，因此返回 `Result` 没有意义。相反，`race` 返回一个我们以前没有见过的类型，`trpl::Either`。`Either` 类型有点类似于 `Result`，因为它有两种情况。然而，与 `Result` 不同，`Either` 中没有内置成功或失败的概念。相反，它使用 `Left` 和 `Right` 来表示“二者之一”：

```rust
#![allow(unused)]
fn main() {
enum Either<A, B> {
    Left(A),
    Right(B),
}
}
```

`race` 函数在第一个 future 参数先完成时返回 `Left` 及其输出，或者在第二个 future 参数先完成时返回 `Right` 及其输出。这与调用函数时参数出现的顺序相匹配：第一个参数在第二个参数的左侧。

我们还更新了 `page_title` 以返回传入的相同 URL。这样，如果先返回的页面没有我们可以解析的 `<title>`，我们仍然可以打印有意义的消息。有了这些信息，我们通过更新 `println!` 输出，指示哪个 URL 先完成以及该网页的 `<title>` 是什么（如果有的话）。

你现在已经构建了一个小型可用的网络爬虫！选择几个 URL 并运行命令行工具。你可能会发现有些网站始终比其他网站快，而在其他情况下，更快的网站会因运行而异。更重要的是，你已经学会了使用 Future 的基础知识，所以现在我们可以更深入地研究异步编程能做什么。

