## 实现面向对象的设计模式

状态模式是一种面向对象的设计模式。该模式的核心在于，我们定义了一个值可以在内部拥有的状态集合。这些状态由一组状态对象表示，并且值的行为会根据其状态而改变。我们将通过一个博客文章结构体的例子来讲解，它有一个字段来保存其状态，该状态将是“草稿”、“审核中”或“已发布”集合中的一个状态对象。

状态对象共享功能：在 Rust 中，我们当然使用结构体和特性，而不是对象和继承。每个状态对象负责其自身的行为，并管理何时应转换为另一个状态。持有状态对象的值对不同状态的行为或何时在状态之间转换一无所知。

使用状态模式的优点是，当程序业务需求发生变化时，我们无需更改持有状态的值的代码或使用该值的代码。我们只需更新其中一个状态对象内部的代码来更改其规则，或者可能添加更多状态对象。

首先，我们将以更传统的面向对象方式实现状态模式，然后我们将使用一种在 Rust 中更自然的方法。让我们深入研究，逐步实现一个使用状态模式的博客文章工作流。

最终功能将如下所示：

1. 博客文章以空草稿开始。
2. 草稿完成后，请求审核文章。
3. 文章获得批准后，即可发布。
4. 只有已发布的博客文章才能返回内容以供打印，因此未经批准的文章不会意外发布。

对文章进行的任何其他更改都应无效。例如，如果我们尝试在请求审核之前批准一篇草稿博客文章，则该文章应保持未发布的草稿状态。

示例 18-11 以代码形式展示了此工作流程：这是我们将在名为 blog 的库 crate 中实现的 API 的示例用法。由于我们尚未实现博客箱，因此此代码无法编译。

文件名: src/main.rs:

```rust
use blog::Post;

fn main() {
    let mut post = Post::new();

    post.add_text("I ate a salad for lunch today");
    assert_eq!("", post.content());

    post.request_review();
    assert_eq!("", post.content());

    post.approve();
    assert_eq!("I ate a salad for lunch today", post.content());
}
```

示例 18-11：演示博客箱所需行为的代码

我们希望允许用户使用 `Post::new` 创建一个新的草稿博客文章。我们希望允许向博客文章添加文本。如果我们尝试在批准之前立即获取文章内容，我们不应该得到任何文本，因为文章仍然是草稿。我们已经在代码中添加了 `assert_eq!` 用于演示目的。一个很好的单元测试是断言草稿博客文章的 `content` 方法返回一个空字符串，但我们不会为这个例子编写测试。

接下来，我们希望能够请求对文章进行审核，并且我们希望在等待审核期间内容返回一个空字符串。当文章获得批准后，它应该被发布，这意味着当调用 `content` 时将返回文章的文本。

请注意，我们从 crate 中交互的唯一类型是 `Post` 类型。此类型将使用状态模式，并将持有一个值，该值将是代表文章可能处于的各种状态（草稿、审核中或已发布）的三个状态对象之一。从一个状态更改为另一个状态将在 `Post` 类型内部进行管理。状态会根据我们库的用户在 `Post` 实例上调用的方法而改变，但他们不必直接管理状态更改。此外，用户不会在状态上犯错，例如在审核之前发布文章。

### 定义 Post 并创建草稿状态的新实例

让我们开始实现这个库！我们知道我们需要一个公共的 `Post` 结构体来保存一些内容，所以我们从结构体的定义和一个相关的公共 `new` 函数开始，以创建 `Post` 的实例，如示例 18-12 所示。我们还将创建一个私有的 `State`特性，它将定义 `Post` 的所有状态对象必须具有的行为。

然后 `Post` 将在名为 `state` 的私有字段中，在 `Option<T>` 内部持有一个 `Box<dyn State>` 的特性 对象，以保存状态对象。稍后你将看到为什么 `Option<T>` 是必要的。

文件名: src/lib.rs:

```rust
pub struct Post {
    state: Option<Box<dyn State>>,
    content: String,
}

impl Post {
    pub fn new() -> Post {
        Post {
            state: Some(Box::new(Draft {})),
            content: String::new(),
        }
    }
}

trait State {}

struct Draft {}

impl State for Draft {}
```

示例 18-12：`Post` 结构体和创建新 `Post` 实例的 `new` 函数、`State`特性 和 `Draft` 结构体的定义

`State`特性 定义了不同文章状态共享的行为。状态对象是 `Draft`（草稿）、`PendingReview`（待审核）和 `Published`（已发布），它们都将实现 `State`特性。目前，该特性 没有任何方法，我们将从只定义 `Draft` 状态开始，因为这是我们希望文章开始时的状态。

当我们创建一个新的 `Post` 时，我们将其 `state` 字段设置为一个持有 `Box` 的 `Some` 值。这个 `Box` 指向 `Draft` 结构体的一个新实例。这确保了每当我们创建一个新的 `Post` 实例时，它都将以草稿形式开始。由于 `Post` 的 `state` 字段是私有的，因此无法以任何其他状态创建 `Post`！在 `Post::new` 函数中，我们将 `content` 字段设置为一个新的空 `String`。

### 存储文章内容的文本

我们在示例 18-11 中看到，我们希望能够调用一个名为 `add_text` 的方法，并向其传递一个 `&str`，然后将其作为博客文章的文本内容添加。我们将其实现为一个方法，而不是将 `content` 字段公开为 `pub`，以便以后我们可以实现一个方法来控制 `content` 字段的数据如何读取。`add_text` 方法非常简单，所以让我们将示例 18-13 中的实现添加到 `impl Post` 块中。

文件名: src/lib.rs:

```rust
pub struct Post {
    state: Option<Box<dyn State>>,
    content: String,
}

impl Post {
    // --snip-- (省略了 add_text 方法，因为它与之前相同)
    pub fn new() -> Post {
        Post {
            state: Some(Box::new(Draft {})),
            content: String::new(),
        }
    }

    pub fn add_text(&mut self, text: &str) {
        self.content.push_str(text);
    }
}

trait State {}

struct Draft {}

impl State for Draft {}
```

示例 18-13：实现 `add_text` 方法以向文章内容添加文本

`add_text` 方法接受 `self` 的可变引用，因为我们正在更改调用 `add_text` 的 `Post` 实例。然后我们对 `content` 中的 `String` 调用 `push_str`，并传递 `text` 参数以添加到保存的内容中。此行为不依赖于文章所处的状态，因此它不是状态模式的一部分。`add_text` 方法根本不与 `state` 字段交互，但它是我们希望支持的行为的一部分。

### 确保草稿文章的内容为空

即使我们调用了 `add_text` 并向文章添加了一些内容，我们仍然希望 `content` 方法返回一个空字符串切片，因为文章仍处于草稿状态，如示例 18-11 的第 7 行所示。目前，让我们用最简单的方式实现 `content` 方法来满足这个要求：始终返回一个空字符串切片。一旦我们实现了更改文章状态以使其可以发布的功能，我们稍后会更改它。到目前为止，文章只能处于草稿状态，因此文章内容应始终为空。示例 18-14 显示了这个占位符实现。

文件名: src/lib.rs:

```rust
pub struct Post {
    state: Option<Box<dyn State>>,
    content: String,
}

impl Post {
    // --snip--
    pub fn new() -> Post {
        Post {
            state: Some(Box::new(Draft {})),
            content: String::new(),
        }
    }

    pub fn add_text(&mut self, text: &str) {
        self.content.push_str(text);
    }

    pub fn content(&self) -> &str {
        ""
    }
}

trait State {}

struct Draft {}

impl State for Draft {}
```

示例 18-14：为 `Post` 上的 `content` 方法添加一个始终返回空字符串切片的占位符实现

添加此 `content` 方法后，示例 18-11 中直到第 7 行的所有内容都按预期工作。

### 请求审核更改文章状态

接下来，我们需要添加请求审核文章的功能，这应该将其状态从 `Draft` 更改为 `PendingReview`。示例 18-15 显示了此代码。

文件名: src/lib.rs:

```rust
pub struct Post {
    state: Option<Box<dyn State>>,
    content: String,
}

impl Post {
    // --snip--
    pub fn new() -> Post {
        Post {
            state: Some(Box::new(Draft {})),
            content: String::new(),
        }
    }

    pub fn add_text(&mut self, text: &str) {
        self.content.push_str(text);
    }

    pub fn content(&self) -> &str {
        ""
    }

    pub fn request_review(&mut self) {
        if let Some(s) = self.state.take() {
            self.state = Some(s.request_review())
        }
    }
}

trait State {
    fn request_review(self: Box<Self>) -> Box<dyn State>;
}

struct Draft {}

impl State for Draft {
    fn request_review(self: Box<Self>) -> Box<dyn State> {
        Box::new(PendingReview {})
    }
}

struct PendingReview {}

impl State for PendingReview {
    fn request_review(self: Box<Self>) -> Box<dyn State> {
        self
    }
}
```

示例 18-15：在 `Post` 和 `State`特性 上实现 `request_review` 方法

我们给 `Post` 一个名为 `request_review` 的公共方法，它将接受 `self` 的可变引用。然后我们对 `Post` 的当前状态调用一个内部的 `request_review` 方法，这个第二个 `request_review` 方法会消耗当前状态并返回一个新状态。

我们将 `request_review` 方法添加到 `State`特性 中；所有实现该特性 的类型现在都需要实现 `request_review` 方法。请注意，该方法的第一个参数不是 `self`、`&self` 或 `&mut self`，而是 `self: Box<Self>`。这种语法意味着该方法仅在持有该类型的 `Box` 上调用时才有效。这种语法会获取 `Box<Self>` 的所有权，使旧状态失效，以便 `Post` 的状态值可以转换为新状态。

为了消耗旧状态，`request_review` 方法需要获取状态值的所有权。这就是 `Post` 的 `state` 字段中的 `Option` 的作用：我们调用 `take` 方法将 `Some` 值从 `state` 字段中取出，并在其位置留下 `None`，因为 Rust 不允许我们在结构体中有未填充的字段。这使我们能够将状态值从 `Post` 中移出，而不是借用它。然后我们将 `post` 的状态值设置为此操作的结果。

我们需要暂时将 `state` 设置为 `None`，而不是直接使用 `self.state = self.state.request_review();` 这样的代码来设置它，以获取状态值的所有权。这确保了 `Post` 在我们将其转换为新状态后不能使用旧状态值。

`Draft` 上的 `request_review` 方法返回一个新的、装箱的 `PendingReview` 结构体实例，它表示文章等待审核时的状态。`PendingReview` 结构体也实现了 `request_review` 方法，但它不进行任何转换。相反，它返回自身，因为当我们对已处于 `PendingReview` 状态的文章请求审核时，它应该保持在 `PendingReview` 状态。

现在我们可以开始看到状态模式的优点：`Post` 上的 `request_review` 方法无论其状态值如何都是相同的。每个状态都负责自己的规则。

我们将 `Post` 上的 `content` 方法保持不变，返回一个空字符串切片。我们现在可以有一个处于 `PendingReview` 状态以及 `Draft` 状态的 `Post`，但我们希望在 `PendingReview` 状态下具有相同的行为。示例 18-11 现在直到第 10 行都有效！

### 添加 `approve` 以更改 `content` 的行为

`approve` 方法将类似于 `request_review` 方法：它会将状态设置为当前状态在被批准时应具有的值，如示例 18-16 所示：

文件名: src/lib.rs:

```rust
pub struct Post {
    state: Option<Box<dyn State>>,
    content: String,
}

impl Post {
    // --snip--
    pub fn new() -> Post {
        Post {
            state: Some(Box::new(Draft {})),
            content: String::new(),
        }
    }

    pub fn add_text(&mut self, text: &str) {
        self.content.push_str(text);
    }

    pub fn content(&self) -> &str {
        ""
    }

    pub fn request_review(&mut self) {
        if let Some(s) = self.state.take() {
            self.state = Some(s.request_review())
        }
    }

    pub fn approve(&mut self) {
        if let Some(s) = self.state.take() {
            self.state = Some(s.approve())
        }
    }
}

trait State {
    fn request_review(self: Box<Self>) -> Box<dyn State>;
    fn approve(self: Box<Self>) -> Box<dyn State>;
}

struct Draft {}

impl State for Draft {
    // --snip--
    fn request_review(self: Box<Self>) -> Box<dyn State> {
        Box::new(PendingReview {})
    }

    fn approve(self: Box<Self>) -> Box<dyn State> {
        self
    }
}

struct PendingReview {}

impl State for PendingReview {
    // --snip--
    fn request_review(self: Box<Self>) -> Box<dyn State> {
        self
    }

    fn approve(self: Box<Self>) -> Box<dyn State> {
        Box::new(Published {})
    }
}

struct Published {}

impl State for Published {
    fn request_review(self: Box<Self>) -> Box<dyn State> {
        self
    }

    fn approve(self: Box<Self>) -> Box<dyn State> {
        self
    }
}
```

示例 18-16：在 `Post` 和 `State`特性 上实现 `approve` 方法

我们将 `approve` 方法添加到 `State`特性 中，并添加一个实现 `State` 的新结构体，即 `Published` 状态。

类似于 `PendingReview` 上的 `request_review` 的工作方式，如果我们在 `Draft` 上调用 `approve` 方法，它将不起作用，因为 `approve` 将返回 `self`。当我们在 `PendingReview` 上调用 `approve` 时，它会返回一个 `Published` 结构体的新装箱实例。`Published` 结构体实现了 `State`特性，并且对于 `request_review` 方法和 `approve` 方法，它都返回自身，因为在这种情况下文章应该保持在 `Published` 状态。

现在我们需要更新 `Post` 上的 `content` 方法。我们希望 `content` 返回的值取决于 `Post` 的当前状态，因此我们将让 `Post` 委托给在其状态上定义的 `content` 方法，如示例 18-17 所示：

文件名: src/lib.rs:

```rust
pub struct Post {
    state: Option<Box<dyn State>>,
    content: String,
}

impl Post {
    // --snip--
    pub fn new() -> Post {
        Post {
            state: Some(Box::new(Draft {})),
            content: String::new(),
        }
    }

    pub fn add_text(&mut self, text: &str) {
        self.content.push_str(text);
    }

    pub fn content(&self) -> &str {
        self.state.as_ref().unwrap().content(self)
    }
    // --snip--

    pub fn request_review(&mut self) {
        if let Some(s) = self.state.take() {
            self.state = Some(s.request_review())
        }
    }

    pub fn approve(&mut self) {
        if let Some(s) = self.state.take() {
            self.state = Some(s.approve())
        }
    }
}

trait State {
    fn request_review(self: Box<Self>) -> Box<dyn State>;
    fn approve(self: Box<Self>) -> Box<dyn State>;
}

struct Draft {}

impl State for Draft {
    fn request_review(self: Box<Self>) -> Box<dyn State> {
        Box::new(PendingReview {})
    }

    fn approve(self: Box<Self>) -> Box<dyn State> {
        self
    }
}

struct PendingReview {}

impl State for PendingReview {
    fn request_review(self: Box<Self>) -> Box<dyn State> {
        self
    }

    fn approve(self: Box<Self>) -> Box<dyn State> {
        Box::new(Published {})
    }
}

struct Published {}

impl State for Published {
    fn request_review(self: Box<Self>) -> Box<dyn State> {
        self
    }

    fn approve(self: Box<Self>) -> Box<dyn State> {
        self
    }
}
```

示例 18-17：更新 `Post` 上的 `content` 方法以委托给 `State` 上的 `content` 方法

因为目标是将所有这些规则保留在实现 `State` 的结构体内部，所以我们对 `state` 中的值调用 `content` 方法，并将 `post` 实例（即 `self`）作为参数传递。然后我们返回使用 `state` 值上的 `content` 方法返回的值。

我们对 `Option` 调用 `as_ref` 方法，因为我们想要 `Option` 内部值的引用而不是值的所有权。因为 `state` 是 `Option<Box<dyn State>>`，当我们调用 `as_ref` 时，会返回一个 `Option<&Box<dyn State>>`。如果我们不调用 `as_ref`，我们会得到一个错误，因为我们无法将 `state` 从函数参数的借用 `&self` 中移出。

然后我们调用 `unwrap` 方法，我们知道它永远不会 panic，因为我们知道 `Post` 上的方法确保 `state` 在这些方法完成后总是包含一个 `Some` 值。这是我们在第 9 章的 <mcurl name="“你比编译器拥有更多信息的情况”" url="../error-handling/to-panic-or-not-to-panic.md#你比编译器拥有更多信息的情况"></mcurl> 中讨论过的一种情况，即我们知道 `None` 值永远不可能出现，即使编译器无法理解这一点。

此时，当我们对 `&Box<dyn State>` 调用 `content` 时，解引用强制转换将对 `&` 和 `Box` 生效，因此 `content` 方法最终将在实现 `State`特性 的类型上被调用。这意味着我们需要将 `content` 添加到 `State`特性 定义中，这就是我们将根据我们拥有的状态返回什么内容的逻辑所在，如示例 18-18 所示：

文件名: src/lib.rs:

```rust
pub struct Post {
    state: Option<Box<dyn State>>,
    content: String,
}

impl Post {
    pub fn new() -> Post {
        Post {
            state: Some(Box::new(Draft {})),
            content: String::new(),
        }
    }

    pub fn add_text(&mut self, text: &str) {
        self.content.push_str(text);
    }

    pub fn content(&self) -> &str {
        self.state.as_ref().unwrap().content(self)
    }

    pub fn request_review(&mut self) {
        if let Some(s) = self.state.take() {
            self.state = Some(s.request_review())
        }
    }

    pub fn approve(&mut self) {
        if let Some(s) = self.state.take() {
            self.state = Some(s.approve())
        }
    }
}

trait State {
    // --snip--
    fn request_review(self: Box<Self>) -> Box<dyn State>;
    fn approve(self: Box<Self>) -> Box<dyn State>;

    fn content<'a>(&self, post: &'a Post) -> &'a str {
        ""
    }
}

// --snip--

struct Draft {}

impl State for Draft {
    fn request_review(self: Box<Self>) -> Box<dyn State> {
        Box::new(PendingReview {})
    }

    fn approve(self: Box<Self>) -> Box<dyn State> {
        self
    }
}

struct PendingReview {}

impl State for PendingReview {
    fn request_review(self: Box<Self>) -> Box<dyn State> {
        self
    }

    fn approve(self: Box<Self>) -> Box<dyn State> {
        Box::new(Published {})
    }
}

struct Published {}

impl State for Published {
    // --snip--
    fn request_review(self: Box<Self>) -> Box<dyn State> {
        self
    }

    fn approve(self: Box<Self>) -> Box<dyn State> {
        self
    }

    fn content<'a>(&self, post: &'a Post) -> &'a str {
        &post.content
    }
}
```

示例 18-18：将 `content` 方法添加到 `State`特性

我们为 `content` 方法添加了一个默认实现，它返回一个空字符串切片。这意味着我们不需要在 `Draft` 和 `PendingReview` 结构体上实现 `content`。`Published` 结构体将覆盖 `content` 方法并返回 `post.content` 中的值。

请注意，我们需要在此方法上添加生命周期注解，正如我们在第 10 章中讨论的那样。我们正在将对文章的引用作为参数，并返回对该文章一部分的引用，因此返回引用的生命周期与文章参数的生命周期相关。

我们完成了——示例 18-11 中的所有内容现在都有效了！我们已经使用博客文章工作流的规则实现了状态模式。与规则相关的逻辑存在于状态对象中，而不是分散在 `Post` 的各个部分。

> ### 为什么不是枚举？
>
> 你可能一直在想，为什么我们没有使用一个带有不同文章状态作为变体的枚举。这当然是一个可能的解决方案；尝试一下，比较最终结果，看看你更喜欢哪种！使用枚举的一个缺点是，每个检查枚举值的地方都需要一个 `match` 表达式或类似的东西来处理每个可能的变体。这可能比这种特性 对象解决方案更重复。

### 状态模式的权衡

我们已经展示了 Rust 能够实现面向对象的状态模式，以封装文章在每个状态下应具有的不同行为。`Post` 上的方法对各种行为一无所知。我们组织代码的方式是，我们只需在一个地方查看已发布文章的不同行为方式：`Published` 结构体上 `State`特性 的实现。

如果我们创建一个不使用状态模式的替代实现，我们可能会在 `Post` 上的方法中，甚至在检查文章状态并在这些地方改变行为的主代码中使用 `match` 表达式。这意味着我们必须查看多个地方才能理解文章处于已发布状态的所有含义！我们添加的状态越多，这种情况只会越严重：每个 `match` 表达式都需要另一个分支。

使用状态模式，`Post` 方法和我们使用 `Post` 的地方不需要 `match` 表达式，要添加一个新状态，我们只需要添加一个新的结构体并在该结构体上实现特性 方法。

使用状态模式的实现很容易扩展以添加更多功能。要了解维护使用状态模式的代码的简单性，请尝试以下一些建议：

- 添加一个 `reject` 方法，将文章的状态从 `PendingReview` 更改回 `Draft`。
- 要求两次调用 `approve` 才能将状态更改为 `Published`。
- 仅当文章处于 `Draft` 状态时才允许用户添加文本内容。提示：让状态对象负责内容可能发生的变化，但不负责修改 `Post`。

状态模式的一个缺点是，由于状态实现了状态之间的转换，因此某些状态彼此耦合。如果我们在 `PendingReview` 和 `Published` 之间添加另一个状态，例如 `Scheduled`，我们就必须更改 `PendingReview` 中的代码以转换为 `Scheduled`。如果 `PendingReview` 不需要随着新状态的添加而改变，那么工作量会更少，但这意味要切换到另一种设计模式。

另一个缺点是我们重复了一些逻辑。为了消除一些重复，我们可能会尝试为 `State`特性 上的 `request_review` 和 `approve` 方法创建返回 `self` 的默认实现；但是，这不起作用：当使用 `State` 作为特性 对象时，trait 不知道具体的 `self` 将是什么，因此返回类型在编译时是未知的。（这是前面提到的 `dyn` 兼容性规则之一。）

其他重复包括 `Post` 上 `request_review` 和 `approve` 方法的相似实现。这两个方法都使用 `Option::take` 和 `Post` 的 `state` 字段，如果 `state` 是 `Some`，它们会委托给包装值的相同方法的实现，并将 `state` 字段的新值设置为结果。如果 `Post` 上有很多方法遵循这种模式，我们可能会考虑定义一个宏来消除重复（参见第 20 章中的“宏”）。

通过完全按照面向对象语言的定义实现状态模式，我们没有充分利用 Rust 的优势。让我们看看我们可以对 `blog` crate 进行哪些更改，可以将无效状态和转换变成编译时错误。

#### 将状态和行为编码为类型

我们将向你展示如何重新思考状态模式以获得一组不同的权衡。我们不会完全封装状态和转换，以便外部代码对它们一无所知，而是将状态编码为不同的类型。因此，Rust 的类型检查系统将通过发出编译器错误来阻止在只允许已发布文章的地方使用草稿文章的尝试。

让我们考虑示例 18-11 中 `main` 函数的第一部分：

文件名: src/main.rs:

```rust
use blog::Post;

fn main() {
    let mut post = Post::new();

    post.add_text("I ate a salad for lunch today");
    assert_eq!("", post.content());

    post.request_review();
    assert_eq!("", post.content());

    post.approve();
    assert_eq!("I ate a salad for lunch today", post.content());
}
```

我们仍然允许使用 `Post::new` 创建草稿状态的新文章，并能够向文章内容添加文本。但是，我们不再让草稿文章的 `content` 方法返回空字符串，而是让 `DraftPost` 结构体根本没有 `content` 方法。这样，如果我们尝试获取 `DraftPost` 实例的内容，我们将得到一个编译器错误，提示该方法不存在。因此，我们将不可能在生产环境中意外显示草稿文章内容，因为该代码甚至无法编译。示例 18-19 显示了 `Post` 结构体和 `DraftPost` 结构体的定义，以及它们各自的方法。

文件名: src/lib.rs:

```rust
pub struct Post {
    content: String,
}

pub struct DraftPost {
    content: String,
}

impl Post {
    pub fn new() -> DraftPost {
        DraftPost {
            content: String::new(),
        }
    }

    pub fn content(&self) -> &str {
        &self.content
    }
}

impl DraftPost {
    pub fn add_text(&mut self, text: &str) {
        self.content.push_str(text);
    }
}
```

示例 18-19：一个带有 `content` 方法的 `Post` 和一个没有 `content` 方法的 `DraftPost`

`Post` 和 `DraftPost` 结构体都有一个私有的 `content` 字段，用于存储博客文章的文本。这些结构体不再有 `state` 字段，因为我们将状态的编码转移到了结构体的类型中。`Post` 结构体将表示一个已发布的文章，并且它有一个返回内容的 `content` 方法。

我们仍然有一个 `Post::new` 函数，但它不再返回 `Post` 的实例，而是返回 `DraftPost` 的实例。由于 `content` 是私有的，并且没有任何函数返回 `Post`，因此目前无法创建 `Post` 的实例。

`DraftPost` 结构体有一个 `add_text` 方法，因此我们可以像以前一样向 `content` 添加文本，但请注意 `DraftPost` 没有定义 `content` 方法！因此，现在程序确保所有文章都以草稿文章开始，并且草稿文章的内容不可用于显示。任何试图绕过这些限制的尝试都将导致编译错误。

#### 将转换实现为不同类型的转换

那么我们如何获得已发布的文章呢？我们希望强制执行的规则是，草稿文章必须经过审核和批准才能发布。处于待审核状态的文章仍然不应显示任何内容。让我们通过添加另一个结构体 `PendingReviewPost` 来实现这些约束，并在 `DraftPost` 上定义 `request_review` 方法以返回 `PendingReviewPost`，以及在 `PendingReviewPost` 上定义 `approve` 方法以返回 `Post`，如示例 18-20 所示。

文件名: src/lib.rs:

```rust
pub struct Post {
    content: String,
}

pub struct DraftPost {
    content: String,
}

impl Post {
    pub fn new() -> DraftPost {
        DraftPost {
            content: String::new(),
        }
    }

    pub fn content(&self) -> &str {
        &self.content
    }
}

impl DraftPost {
    // --snip-- (省略了 add_text 方法，因为它与之前相同)
    pub fn add_text(&mut self, text: &str) {
        self.content.push_str(text);
    }

    pub fn request_review(self) -> PendingReviewPost {
        PendingReviewPost {
            content: self.content,
        }
    }
}

pub struct PendingReviewPost {
    content: String,
}

impl PendingReviewPost {
    pub fn approve(self) -> Post {
        Post {
            content: self.content,
        }
    }
}
```

示例 18-20：通过在 `DraftPost` 上调用 `request_review` 创建的 `PendingReviewPost`，以及将 `PendingReviewPost` 转换为已发布 `Post` 的 `approve` 方法

`request_review` 和 `approve` 方法都获取 `self` 的所有权，从而消费 `DraftPost` 和 `PendingReviewPost` 实例，并将它们分别转换为 `PendingReviewPost` 和已发布的 `Post`。这样，在我们调用 `request_review` 之后，就不会有任何残留的 `DraftPost` 实例，依此类推。`PendingReviewPost` 结构体上没有定义 `content` 方法，因此尝试读取其内容会导致编译错误，就像 `DraftPost` 一样。因为获取定义了 `content` 方法的已发布 `Post` 实例的唯一方法是在 `PendingReviewPost` 上调用 `approve` 方法，而获取 `PendingReviewPost` 的唯一方法是在 `DraftPost` 上调用 `request_review` 方法，所以我们现在已经将博客文章的工作流编码到类型系统中了。

但是我们还需要对 `main` 函数进行一些小的更改。`request_review` 和 `approve` 方法返回新的实例，而不是修改它们被调用的结构体，因此我们需要添加更多的 `let post =` 遮蔽赋值来保存返回的实例。我们也不能再对草稿和待审核文章的内容进行空字符串断言，也不需要它们：我们无法再编译尝试使用这些状态下文章内容的代码了。`main` 中更新后的代码如示例 18-21 所示。

文件名: src/main.rs:

```rust
use blog::Post;

fn main() {
    let mut post = Post::new();

    post.add_text("I ate a salad for lunch today");

    let post = post.request_review();

    let post = post.approve();

    assert_eq!("I ate a salad for lunch today", post.content());
}
```

示例 18-21：`main` 函数的修改，以使用博客文章工作流的新实现

我们需要对 `main` 函数进行修改以重新赋值 `post`，这意味着这个实现不再完全遵循面向对象的状态模式：状态之间的转换不再完全封装在 `Post` 的实现中。然而，我们的收获是，由于类型系统和编译时发生的类型检查，现在不可能出现无效状态！这确保了某些错误，例如显示未发布文章的内容，将在它们进入生产环境之前被发现。

尝试在本节开头建议的关于 `blog` crate 的任务，在示例 18-21 之后，看看你对这个版本代码的设计有何看法。请注意，其中一些任务可能在此设计中已经完成。

我们已经看到，尽管 Rust 能够实现面向对象的设计模式，但其他模式，例如将状态编码到类型系统中，在 Rust 中也可用。这些模式具有不同的权衡。尽管你可能非常熟悉面向对象的模式，但重新思考问题以利用 Rust 的特性可以带来好处，例如在编译时防止某些错误。由于某些特性，如所有权，面向对象语言不具备，因此面向对象的模式在 Rust 中不总是最佳解决方案。

## 总结

无论你在阅读本章后是否认为 Rust 是一种面向对象的语言，你现在都知道可以使用特性对象在 Rust 中获得一些面向对象的特性。动态分发可以为你的代码提供一些灵活性，以换取一点运行时性能。你可以利用这种灵活性来实现面向对象的模式，这有助于代码的可维护性。Rust 还有其他特性，例如所有权，这是面向对象语言所不具备的。面向对象的模式不总是利用 Rust 优势的最佳方式，但它是一个可用的选项。

接下来，我们将研究模式，这是 Rust 的另一个特性，它提供了很大的灵活性。我们已经在本书中简要地介绍过它们，但尚未看到它们的全部功能。让我们开始吧！
