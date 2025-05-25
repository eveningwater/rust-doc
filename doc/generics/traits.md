## 特性（Traits）：定义共享行为

特性定义了特定类型所具有并可与其他类型共享的功能。我们可以使用特性以抽象的方式定义共享行为。我们可以使用特性约束来指定泛型类型可以是任何具有特定行为的类型。

> 注意：特性类似于其他语言中常称为接口（interfaces）的功能，尽管有一些差异。

### 定义特性

类型的行为由我们可以在该类型上调用的方法组成。如果我们可以在所有这些类型上调用相同的方法，则不同类型共享相同的行为。特性定义是将方法签名组合在一起的方式，用于定义实现某些目的所需的一组行为。

例如，假设我们有多个结构体，它们持有各种类型和数量的文本：一个 NewsArticle 结构体，它保存在特定位置发布的新闻故事，以及一个 Tweet，它最多可以有 280 个字符，以及指示它是新推文、转发还是对另一条推文的回复的元数据。

我们想要创建一个名为 aggregator 的媒体聚合库 crate，它可以显示可能存储在 NewsArticle 或 Tweet 实例中的数据摘要。为此，我们需要从每种类型获取摘要，我们将通过在实例上调用 summarize 方法来请求该摘要。示例 10-12 显示了表达此行为的公共 Summary 特性的定义。

文件名：src/lib.rs：

```rust
pub trait Summary {
    fn summarize(&self) -> String;
}
```

示例 10-12：由 summarize 方法提供的行为组成的 Summary 特性

在这里，我们使用 trait 关键字声明一个特性，然后是特性的名称，在本例中是 Summary。我们还将特性声明为 pub，以便依赖此 crate 的 crate 也可以使用此特性，正如我们将在几个示例中看到的那样。在大括号内，我们声明描述实现此特性的类型的行为的方法签名，在本例中是 fn summarize(&self) -> String。

在方法签名之后，我们使用分号而不是在大括号内提供实现。每个实现此特性的类型都必须为方法体提供自己的自定义行为。编译器将强制任何具有 Summary 特性的类型都必须具有与此签名完全相同的 summarize 方法定义。

特性可以在其主体中有多个方法：方法签名每行列出一个，每行以分号结束。

### 在类型上实现特性

现在我们已经定义了 Summary 特性方法的所需签名，我们可以在媒体聚合器中的类型上实现它。示例 10-13 显示了 Summary 特性在 NewsArticle 结构体上的实现，该结构体使用标题、作者和位置来创建 summarize 的返回值。对于 Tweet 结构体，我们将 summarize 定义为用户名后跟推文的全部文本，假设推文内容已经限制为 280 个字符。

文件名：src/lib.rs：

```rust
pub trait Summary {
    fn summarize(&self) -> String;
}

pub struct NewsArticle {
    pub headline: String,
    pub location: String,
    pub author: String,
    pub content: String,
}

impl Summary for NewsArticle {
    fn summarize(&self) -> String {
        format!("{}, by {} ({})", self.headline, self.author, self.location)
    }
}

pub struct Tweet {
    pub username: String,
    pub content: String,
    pub reply: bool,
    pub retweet: bool,
}

impl Summary for Tweet {
    fn summarize(&self) -> String {
        format!("{}: {}", self.username, self.content)
    }
}
```

示例 10-13：在 NewsArticle 和 Tweet 类型上实现 Summary 特性

在类型上实现特性类似于实现常规方法。不同之处在于，在 impl 之后，我们放置要实现的特性名称，然后使用 for 关键字，然后指定要为其实现特性的类型名称。在 impl 块内，我们放置特性定义中定义的方法签名。我们不是在每个签名后添加分号，而是使用大括号并用我们希望特性方法对特定类型具有的特定行为填充方法体。

现在库已经在 NewsArticle 和 Tweet 上实现了 Summary 特性，crate 的用户可以像调用常规方法一样调用 NewsArticle 和 Tweet 实例上的特性方法。唯一的区别是用户必须将特性和类型都引入作用域。以下是二进制 crate 如何使用我们的 aggregator 库 crate 的示例：

```rust
use aggregator::{Summary, Tweet};

fn main() {
    let tweet = Tweet {
        username: String::from("horse_ebooks"),
        content: String::from(
            "of course, as you probably already know, people",
        ),
        reply: false,
        retweet: false,
    };

    println!("1 new tweet: {}", tweet.summarize());
}
```

此代码打印 1 new tweet: horse_ebooks: of course, as you probably already know, people。

依赖 aggregator crate 的其他 crate 也可以将 Summary 特性引入作用域，以便在自己的类型上实现 Summary。需要注意的一个限制是，只有当特性或类型或两者都是本地的（即在我们的 crate 中定义的）时，我们才能在类型上实现特性。例如，我们可以在自定义类型 Tweet 上实现标准库特性 Display，作为我们的 aggregator crate 功能的一部分，因为类型 Tweet 是本地于我们的 aggregator crate 的。我们还可以在我们的 aggregator crate 中的 Vec<T> 上实现 Summary，因为特性 Summary 是本地于我们的 aggregator crate 的。

但是我们不能在外部类型上实现外部特性。例如，我们不能在我们的 aggregator crate 中的 `Vec<T>` 上实现 Display 特性，因为 Display 和 Vec<T> 都定义在标准库中，不是本地于我们的 aggregator crate 的。这个限制是一个称为一致性（coherence）的属性的一部分，更具体地说是孤儿规则（orphan rule），之所以这样命名是因为父类型不存在。这条规则确保其他人的代码不能破坏你的代码，反之亦然。如果没有这条规则，两个 crate 可以为同一类型实现相同的特性，Rust 将不知道使用哪个实现。

### 默认实现

有时，为特性中的某些或所有方法提供默认行为而不是要求每种类型上的所有方法都有实现是很有用的。然后，当我们在特定类型上实现特性时，我们可以保留或覆盖每个方法的默认行为。

在示例 10-14 中，我们为 Summary 特性的 summarize 方法指定了一个默认字符串，而不是像我们在示例 10-12 中那样只定义方法签名。

文件名：src/lib.rs：

```rust
pub trait Summary {
    fn summarize(&self) -> String {
        String::from("(Read more...)")
    }
}

pub struct NewsArticle {
    pub headline: String,
    pub location: String,
    pub author: String,
    pub content: String,
}

impl Summary for NewsArticle {}

pub struct Tweet {
    pub username: String,
    pub content: String,
    pub reply: bool,
    pub retweet: bool,
}

impl Summary for Tweet {
    fn summarize(&self) -> String {
        format!("{}: {}", self.username, self.content)
    }
}
```

示例 10-14：定义带有 summarize 方法默认实现的 Summary 特性

要使用默认实现来总结 NewsArticle 实例，我们使用空的 impl 块指定 impl Summary for NewsArticle {}。

尽管我们不再直接在 NewsArticle 上定义 summarize 方法，但我们提供了默认实现并指定 NewsArticle 实现 Summary 特性。因此，我们仍然可以在 NewsArticle 实例上调用 summarize 方法，如下所示：

```rust
use aggregator::{self, NewsArticle, Summary};

fn main() {
    let article = NewsArticle {
        headline: String::from("Penguins win the Stanley Cup Championship!"),
        location: String::from("Pittsburgh, PA, USA"),
        author: String::from("Iceburgh"),
        content: String::from(
            "The Pittsburgh Penguins once again are the best \
             hockey team in the NHL.",
        ),
    };

    println!("New article available! {}", article.summarize());
}
```

此代码打印 New article available! (Read more...)。

创建默认实现不需要我们更改示例 10-13 中 Tweet 上 Summary 的实现。原因是覆盖默认实现的语法与实现没有默认实现的特性方法的语法相同。

默认实现可以调用同一特性中的其他方法，即使这些其他方法没有默认实现。通过这种方式，特性可以提供大量有用的功能，并且只要求实现者指定其中的一小部分。例如，我们可以定义 Summary 特性，使其具有一个必须实现的 summarize_author 方法，然后定义一个具有调用 summarize_author 方法的默认实现的 summarize 方法：

```rust
pub trait Summary {
    fn summarize_author(&self) -> String;

    fn summarize(&self) -> String {
        format!("(Read more from {}...)", self.summarize_author())
    }
}

pub struct Tweet {
    pub username: String,
    pub content: String,
    pub reply: bool,
    pub retweet: bool,
}

impl Summary for Tweet {
    fn summarize_author(&self) -> String {
        format!("@{}", self.username)
    }
}
```

要使用这个版本的 Summary，我们只需要在类型上实现特性时定义 summarize_author：

```rust
pub trait Summary {
    fn summarize_author(&self) -> String;

    fn summarize(&self) -> String {
        format!("(Read more from {}...)", self.summarize_author())
    }
}

pub struct Tweet {
    pub username: String,
    pub content: String,
    pub reply: bool,
    pub retweet: bool,
}

impl Summary for Tweet {
    fn summarize_author(&self) -> String {
        format!("@{}", self.username)
    }
}
```

在我们定义 summarize_author 之后，我们可以在 Tweet 结构体的实例上调用 summarize，而 summarize 的默认实现将调用我们提供的 summarize_author 定义。因为我们已经实现了 summarize_author，Summary 特性已经为我们提供了 summarize 方法的行为，而无需我们编写更多代码。以下是它的样子：

```rust
use aggregator::{self, Summary, Tweet};

fn main() {
    let tweet = Tweet {
        username: String::from("horse_ebooks"),
        content: String::from(
            "of course, as you probably already know, people",
        ),
        reply: false,
        retweet: false,
    };

    println!("1 new tweet: {}", tweet.summarize());
}
```

此代码打印 1 new tweet: (Read more from @horse_ebooks...)。

请注意，无法从同一方法的覆盖实现中调用默认实现。

### 特性作为参数

现在你知道了如何定义和实现特性，我们可以探索如何使用特性来定义接受多种不同类型的函数。我们将使用在示例 10-13 中在 NewsArticle 和 Tweet 类型上实现的 Summary 特性来定义一个 notify 函数，该函数调用其 item 参数上的 summarize 方法，该参数是实现 Summary 特性的某种类型。为此，我们使用 impl Trait 语法，如下所示：

```rust
pub trait Summary {
    fn summarize(&self) -> String;
}

pub struct NewsArticle {
    pub headline: String,
    pub location: String,
    pub author: String,
    pub content: String,
}

impl Summary for NewsArticle {
    fn summarize(&self) -> String {
        format!("{}, by {} ({})", self.headline, self.author, self.location)
    }
}

pub struct Tweet {
    pub username: String,
    pub content: String,
    pub reply: bool,
    pub retweet: bool,
}

impl Summary for Tweet {
    fn summarize(&self) -> String {
        format!("{}: {}", self.username, self.content)
    }
}

pub fn notify(item: &impl Summary) {
    println!("Breaking news! {}", item.summarize());
}
```

我们不是为 item 参数指定具体类型，而是指定 impl 关键字和特性名称。此参数接受任何实现指定特性的类型。在 notify 的函数体中，我们可以调用来自 Summary 特性的任何方法，比如 summarize。我们可以调用 notify 并传入任何 NewsArticle 或 Tweet 的实例。使用任何其他类型（如 String 或 i32）调用该函数将不会编译，因为这些类型没有实现 Summary。

### 特性约束语法

impl Trait 语法适用于直接的情况，但实际上是一种更长形式的语法糖，称为特性约束；它看起来像这样：

```rust
pub fn notify<T: Summary>(item: &T) {
    println!("Breaking news! {}", item.summarize());
}
```

这种更长的形式等同于前一节中的示例，但更冗长。我们在泛型类型参数声明后的冒号内和尖括号内放置特性约束。

impl Trait 语法方便且使简单情况下的代码更简洁，而更完整的特性约束语法可以在其他情况下表达更复杂的内容。例如，我们可以有两个实现 Summary 的参数。使用 impl Trait 语法，它看起来像这样：

```rust
pub fn notify(item1: &impl Summary, item2: &impl Summary) {
    // ...
}
```

如果我们希望此函数允许 item1 和 item2 具有不同的类型（只要两种类型都实现 Summary），则使用 impl Trait 是合适的。但是，如果我们想强制两个参数具有相同的类型，则必须使用特性约束，如下所示：

```rust
pub fn notify<T: Summary>(item1: &T, item2: &T) {
    //...
}
```

作为 item1 和 item2 参数类型的泛型类型 T 约束了函数，使得作为 item1 和 item2 参数的实参的具体类型必须相同。

### 使用 + 语法指定多个特性约束

我们还可以指定多个特性约束。假设我们希望 notify 在 item 上使用显示格式化以及 summarize：我们在 notify 定义中指定 item 必须同时实现 Display 和 Summary。我们可以使用 + 语法来实现：

```rust
pub fn notify(item: &(impl Summary + Display)) {
    //...
}
```

+ 语法也适用于泛型类型上的特性约束：

```rust
pub fn notify<T: Summary + Display>(item: &T) {
    //...
}
```

有了这两个特性约束，notify 的函数体可以调用 summarize 并使用 {} 来格式化 item。

### 使用 where 子句更清晰地表达特性约束

使用太多特性约束有其缺点。每个泛型都有自己的特性约束，因此具有多个泛型类型参数的函数可能在函数名称和参数列表之间包含大量特性约束信息，使函数签名难以阅读。为此，Rust 有一种在函数签名后使用 where 子句指定特性约束的替代语法。所以，与其写：

```rust
fn some_function<T: Display + Clone, U: Clone + Debug>(t: &T, u: &U) -> i32 {
    //...
}
```

我们可以使用 where 子句，如下所示：

```rust
fn some_function<T, U>(t: &T, u: &U) -> i32
where
    T: Display + Clone,
    U: Clone + Debug,
{
    unimplemented!()
}
```

这个函数的签名不那么混乱：函数名称、参数列表和返回类型紧密地放在一起，类似于没有很多特性约束的函数。

### 返回实现特性的类型

我们还可以在返回位置使用 impl Trait 语法来返回实现某个特性的某种类型的值，如下所示：

```rust
pub trait Summary {
    fn summarize(&self) -> String;
}

pub struct NewsArticle {
    pub headline: String,
    pub location: String,
    pub author: String,
    pub content: String,
}

impl Summary for NewsArticle {
    fn summarize(&self) -> String {
        format!("{}, by {} ({})", self.headline, self.author, self.location)
    }
}

pub struct Tweet {
    pub username: String,
    pub content: String,
    pub reply: bool,
    pub retweet: bool,
}

impl Summary for Tweet {
    fn summarize(&self) -> String {
        format!("{}: {}", self.username, self.content)
    }
}

fn returns_summarizable() -> impl Summary {
    Tweet {
        username: String::from("horse_ebooks"),
        content: String::from(
            "of course, as you probably already know, people",
        ),
        reply: false,
        retweet: false,
    }
}
```

通过为返回类型使用 impl Summary，我们指定 returns_summarizable 函数返回某种实现 Summary 特性的类型，而不命名具体类型。在这种情况下，returns_summarizable 返回一个 Tweet，但调用此函数的代码不需要知道这一点。

仅通过其实现的特性来指定返回类型的能力在闭包和迭代器的上下文中特别有用，我们将在第 13 章中介绍。闭包和迭代器创建只有编译器知道的类型或非常长的类型。impl Trait 语法允许你简洁地指定函数返回实现 Iterator 特性的某种类型，而不需要写出很长的类型。

但是，你只能在返回单一类型时使用 impl Trait。例如，这段返回 NewsArticle 或 Tweet 并将返回类型指定为 impl Summary 的代码将不起作用：

```rust
pub trait Summary {
    fn summarize(&self) -> String;
}

pub struct NewsArticle {
    pub headline: String,
    pub location: String,
    pub author: String,
    pub content: String,
}

impl Summary for NewsArticle {
    fn summarize(&self) -> String {
        format!("{}, by {} ({})", self.headline, self.author, self.location)
    }
}

pub struct Tweet {
    pub username: String,
    pub content: String,
    pub reply: bool,
    pub retweet: bool,
}

impl Summary for Tweet {
    fn summarize(&self) -> String {
        format!("{}: {}", self.username, self.content)
    }
}

fn returns_summarizable(switch: bool) -> impl Summary {
    if switch {
        NewsArticle {
            headline: String::from(
                "Penguins win the Stanley Cup Championship!",
            ),
            location: String::from("Pittsburgh, PA, USA"),
            author: String::from("Iceburgh"),
            content: String::from(
                "The Pittsburgh Penguins once again are the best \
                 hockey team in the NHL.",
            ),
        }
    } else {
        Tweet {
            username: String::from("horse_ebooks"),
            content: String::from(
                "of course, as you probably already know, people",
            ),
            reply: false,
            retweet: false,
        }
    }
}
```

由于编译器中 impl Trait 语法的实现方式的限制，不允许返回 NewsArticle 或 Tweet。我们将在第 18 章的"使用允许不同类型值的特性对象"部分中介绍如何编写具有此行为的函数。

### 使用特性约束有条件地实现方法

通过在使用泛型类型参数的 impl 块上使用特性约束，我们可以为实现指定特性的类型有条件地实现方法。例如，示例 10-15 中的类型 `Pair<T>` 总是实现 new 函数来返回 `Pair<T>` 的新实例（回想一下第 5 章的"定义方法"部分，Self 是 impl 块类型的类型别名，在本例中是 `Pair<T>`）。但在下一个 impl 块中，只有当其内部类型 T 实现允许比较的 PartialOrd 特性和允许打印的 Display 特性时，`Pair<T>` 才会实现 cmp_display 方法。

文件名：src/lib.rs：

```rust
use std::fmt::Display;

struct Pair<T> {
    x: T,
    y: T,
}

impl<T> Pair<T> {
    fn new(x: T, y: T) -> Self {
        Self { x, y }
    }
}

impl<T: Display + PartialOrd> Pair<T> {
    fn cmp_display(&self) {
        if self.x >= self.y {
            println!("The largest member is x = {}", self.x);
        } else {
            println!("The largest member is y = {}", self.y);
        }
    }
}
```

示例 10-15：根据特性约束有条件地在泛型类型上实现方法

我们还可以为任何实现另一个特性的类型有条件地实现特性。对满足特性约束的任何类型实现特性称为覆盖实现（blanket implementations），在 Rust 标准库中被广泛使用。例如，标准库为任何实现 Display 特性的类型实现了 ToString 特性。标准库中的 impl 块看起来类似于这段代码：

```rust
impl<T: Display> ToString for T {
    // --snip--
}
```

由于标准库有这个覆盖实现，我们可以在任何实现 Display 特性的类型上调用由 ToString 特性定义的 to_string 方法。例如，我们可以将整数转换为它们对应的 String 值，因为整数实现了 Display：

```rust
#![allow(unused)]
fn main() {
let s = 3.to_string();
}
```

覆盖实现出现在特性文档的"Implementors"部分。

特性和特性约束让我们能够使用泛型类型参数编写代码以减少重复，同时向编译器指定我们希望泛型类型具有特定行为。编译器可以使用特性约束信息来检查我们代码中使用的所有具体类型是否提供了正确的行为。在动态类型语言中，如果我们调用一个类型没有定义的方法，我们会在运行时得到错误。但是 Rust 将这些错误移到编译时，因此我们被迫在代码甚至能够运行之前修复问题。此外，我们不必编写在运行时检查行为的代码，因为我们已经在编译时检查了。这样做提高了性能，而不必放弃泛型的灵活性。
