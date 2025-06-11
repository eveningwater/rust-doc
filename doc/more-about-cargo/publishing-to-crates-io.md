## 将 Crate 发布到 Crates.io

我们已经使用 [crates.io](https://crates.io/) 上的包作为项目的依赖，但你也可以通过发布自己的包来与其他人分享你的代码。 [crates.io](https://crates.io/) 上的 crate 注册表分发你的包的源代码，因此它主要托管开源代码。

Rust 和 Cargo 具有一些特性，可以使你发布的包更容易被人们找到和使用。接下来我们将讨论其中一些特性，然后解释如何发布一个包。

### 编写有用的文档注释

准确地记录你的包将帮助其他用户了解如何以及何时使用它们，因此花时间编写文档是值得的。在第三章中，我们讨论了如何使用两个斜杠 `//` 来注释 Rust 代码。Rust 还有一种特殊的文档注释，方便地称为文档注释，它将生成 HTML 文档。HTML 会显示公共 API 项的文档注释内容，这些内容是为那些对如何使用你的 crate 感兴趣而不是对你的 crate 如何实现感兴趣的程序员准备的。

文档注释使用三个斜杠 `///` 而不是两个，并支持 Markdown 语法来格式化文本。将文档注释放在它们要记录的项之前。示例 14-1 展示了名为 `my_crate` 的 crate 中 `add_one` 函数的文档注释。

Filename: src/lib.rs:

```rust
//! `my_crate` is a collection of utilities to make performing certain
//! calculations more convenient.

/// Adds one to the number given.
///
/// # Examples
///
/// ```
/// let arg = 5;
/// let answer = my_crate::add_one(arg);
///
/// assert_eq!(6, answer);
/// ```
pub fn add_one(x: i32) -> i32 {
    x + 1
}
```

示例 14-1：函数的文档注释

这里，我们描述了 `add_one` 函数的功能，以 `# Examples` 标题开始一个部分，然后提供演示如何使用 `add_one` 函数的代码。我们可以通过运行 `cargo doc` 命令从这个文档注释生成 HTML 文档。这个命令会运行 Rust 自带的 `rustdoc` 工具，并将生成的 HTML 文档放在 target/doc 目录中。

为了方便，运行 `cargo doc --open` 会为当前 crate 的文档（以及所有 crate 依赖的文档）构建 HTML，并在 Web 浏览器中打开结果。导航到 `add_one` 函数，你将看到文档注释中的文本是如何渲染的，如图 14-1 所示：

![](../images/trpl14-01.png)

图 14-1：`add_one` 函数的 HTML 文档

#### 常用的部分

我们在示例 14-1 中使用了 `# Examples` Markdown 标题在 HTML 中创建了一个标题为“Examples”的部分。以下是 crate 作者在文档中常用的一些其他部分：

* Panics：被文档化的函数可能发生 panic 的场景。不希望程序 panic 的函数调用者应该确保他们不在这些情况下调用函数。
* Errors：如果函数返回 Result，描述可能发生的错误类型以及可能导致这些错误返回的条件对调用者很有帮助，这样他们就可以编写代码以不同的方式处理不同类型的错误。
* Safety：如果函数调用不安全（我们在第 20 章讨论不安全性），应该有一个部分解释为什么函数不安全，并涵盖函数期望调用者遵守的不变量。

大多数文档注释不需要所有这些部分，但这仍然是一个很好的示例，可以提醒你用户会感兴趣的代码方面。

#### 文档注释作为测试

在文档注释中添加示例代码块可以帮助演示如何使用你的库，这样做还有一个额外的好处：运行 `cargo test` 会将文档中的代码示例作为测试运行！没有什么比带有示例的文档更好的了。但Nothing 比因为代码更改而导致示例无法工作的文档更糟糕的了。如果我们使用示例 14-1 中 `add_one` 函数的文档运行 `cargo test`，我们将在测试结果中看到类似以下的部分：

```rust
   Doc-tests my_crate

running 1 test
test src/lib.rs - add_one (line 5) ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.27s
```

现在，如果我们更改函数或示例，使得示例中的 `assert_eq!` 发生 panic，并再次运行 `cargo test`，我们将看到文档测试会捕获到示例和代码不同步的情况！

#### 注释包含的项

`//!` 风格的文档注释是为包含注释的项添加文档，而不是为注释后面的项添加文档。我们通常在 crate 根文件（按照惯例是 src/lib.rs）或模块内部使用这些文档注释来文档化整个 crate 或模块。

例如，要添加描述包含 `add_one` 函数的 `my_crate` crate 用途的文档，我们在 src/lib.rs 文件的开头添加以 `//!` 开头的文档注释，如示例 14-2 所示：

Filename: src/lib.rs:

```rust
//! # My Crate
//!
//! `my_crate` is a collection of utilities to make performing certain
//! calculations more convenient.

/// Adds one to the number given.
///
/// # Examples
///
/// ```
/// let arg = 5;
/// let answer = my_crate::add_one(arg);
///
/// assert_eq!(6, answer);
/// ```
pub fn add_one(x: i32) -> i32 {
    x + 1
}
```

Listing 14-2: Documentation for the `my_crate` crate as a whole

注意，以 `//!` 开头的最后一行之后没有任何代码。因为我们以 `//!` 而不是 `///` 开头注释，所以我们是在文档化包含此注释的项，而不是此注释后面的项。在这种情况下，该项是 src/lib.rs 文件，它是 crate 根。这些注释描述了整个 crate。

当我们运行 `cargo doc --open` 时，这些注释将显示在 `my_crate` 文档的首页上，位于 crate 中公共项列表的上方，如图 14-2 所示。

![](../images/trpl14-02.png)

图 14-2：`my_crate` 的渲染文档，包括描述整个 crate 的注释

项内的文档注释对于描述 crate 和模块特别有用。使用它们来解释容器的整体目的，以帮助用户理解 crate 的组织结构。

### 使用 `pub use` 导出方便的公共 API

发布 crate 时，公共 API 的结构是一个主要考虑因素。使用你的 crate 的人不如你熟悉其结构，如果你的 crate 有一个大型模块层次结构，他们可能会难以找到他们想要使用的部分。

在第七章中，我们介绍了如何使用 `pub` 关键字使项成为公共的，以及如何使用 `use` 关键字将项引入作用域。然而，你在开发 crate 时觉得有意义的结构可能对你的用户来说是很方便。你可能希望将你的结构体组织成包含多个层次的层次结构，但这样一来，想要使用你在层次结构深处定义的类型的用户可能会难以发现该类型的存在。他们也可能会因为不得不输入 `use my_crate::some_module::another_module::UsefulType;` 而不是 `use my_crate::UsefulType;` 而感到恼火。

好消息是，如果结构对其他人从另一个库中使用不方便，你无需重新安排你的内部组织：相反，你可以通过使用 `pub use` 来重新导出项，以创建一个与你的私有结构不同的公共结构。重新导出将一个公共项从一个位置导出到另一个位置，就像它是在另一个位置定义的一样。

例如，假设我们创建了一个名为 art 的库，用于建模艺术概念。该库中有两个模块：一个 `kinds` 模块包含两个名为 `PrimaryColor` 和 `SecondaryColor` 的枚举，以及一个 `utils` 模块包含一个名为 `mix` 的函数，如示例 14-3 所示：

Filename: src/lib.rs:

```rust
//! # Art
//!
//! A library for modeling artistic concepts.

pub use self::kinds::PrimaryColor;
pub use self::kinds::SecondaryColor;
pub use self::utils::mix;

pub mod kinds {
    /// The primary colors according to the RYB color model.
    pub enum PrimaryColor {
        Red,
        Yellow,
        Blue,
    }

    /// The secondary colors according to the RYB color model.
    pub enum SecondaryColor {
        Orange,
        Green,
        Purple,
    }
}

pub mod utils {
    use crate::kinds::*;

    /// Combines two primary colors in equal amounts to create
    /// a secondary color.
    pub fn mix(c1: PrimaryColor, c2: PrimaryColor) -> SecondaryColor {
        // --snip--
        unimplemented!();
    }
}
```

示例 14-3：一个 `art` 库，其项组织在 `kinds` 和 `utils` 模块中

图 14-3 显示了 `cargo doc` 为此 crate 生成的文档首页的样子：

![](../images/trpl14-03.png)

图 14-3：`art` 文档的首页，列出了 `kinds` 和 `utils` 模块

请注意，`PrimaryColor` 和 `SecondaryColor` 类型以及 `mix` 函数并未列在首页上。我们必须点击 `kinds` 和 `utils` 才能看到它们。

依赖于此库的另一个 crate 需要 `use` 语句将 `art` 中的项引入作用域，指定当前定义的模块结构。示例 14-4 显示了一个使用 `art` crate 中的 `PrimaryColor` 和 `mix` 项的 crate 示例：

Filename: src/main.rs:

```rust
use art::kinds::PrimaryColor;
use art::utils::mix;

fn main() {
    let red = PrimaryColor::Red;
    let yellow = PrimaryColor::Yellow;
    mix(red, yellow);
}
```

示例 14-4：一个使用 `art` crate 项并导出其内部结构的 crate

示例 14-4 中使用 `art` crate 的代码作者必须弄清楚 `PrimaryColor` 在 `kinds` 模块中，而 `mix` 在 `utils` 模块中。`art` crate 的模块结构对于开发 `art` crate 的开发者来说比使用它的开发者更相关。内部结构对于试图理解如何使用 `art` crate 的人来说不包含任何有用的信息，反而会造成困惑，因为使用它的开发者必须弄清楚在哪里查找，并且必须在 `use` 语句中指定模块名称。

为了从公共 API 中移除内部组织结构，我们可以修改示例 14-3 中的 `art` crate 代码，添加 `pub use` 语句以在顶层重新导出项，如示例 14-5 所示：

Filename: src/lib.rs:

```rust
//! # Art
//!
//! A library for modeling artistic concepts.

pub use self::kinds::PrimaryColor;
pub use self::kinds::SecondaryColor;
pub use self::utils::mix;

pub mod kinds {
    // --snip--
    /// The primary colors according to the RYB color model.
    pub enum PrimaryColor {
        Red,
        Yellow,
        Blue,
    }

    /// The secondary colors according to the RYB color model.
    pub enum SecondaryColor {
        Orange,
        Green,
        Purple,
    }
}

pub mod utils {
    // --snip--
    use crate::kinds::*;

    /// Combines two primary colors in equal amounts to create
    /// a secondary color.
    pub fn mix(c1: PrimaryColor, c2: PrimaryColor) -> SecondaryColor {
        SecondaryColor::Orange
    }
}
```

示例 14-5：添加 `pub use` 语句以重新导出项

`cargo doc` 为此 crate 生成的 API 文档现在将在首页上列出并链接重新导出的项，如图 14-4 所示，使得 `PrimaryColor` 和 `SecondaryColor` 类型以及 `mix` 函数更容易找到。

![](../images/trpl14-04.png)

图 14-4：`art` 文档的首页，列出了重新导出的项

`art` crate 的用户仍然可以像示例 14-4 中所示那样查看和使用示例 14-3 中的内部结构，或者他们可以使用示例 14-5 中更方便的结构，如示例 14-6 所示：

Filename: src/main.rs:

```rust
use art::PrimaryColor;
use art::mix;

fn main() {
    // --snip--
    let red = PrimaryColor::Red;
    let yellow = PrimaryColor::Yellow;
    mix(red, yellow);
}
```

示例 14-6：一个使用 `art` crate 中重新导出项的程序

在有许多嵌套模块的情况下，使用 `pub use` 在顶层重新导出类型可以显著改善使用 crate 的人的体验。`pub use` 的另一个常见用途是在当前 crate 中重新导出依赖项的定义，以使该 crate 的定义成为你的 crate 公共 API 的一部分。

创建一个有用的公共 API 结构更像是一门艺术而不是科学，你可以迭代以找到最适合你的用户的 API。选择 `pub use` 使你在内部组织 crate 时具有灵活性，并将该内部结构与你呈现给用户的结构解耦。查看你安装的一些 crate 的代码，看看它们的内部结构是否与它们的公共 API 不同。

### 设置 Crates.io 账户

在发布任何 crate 之前，你需要在 [crates.io](https://crates.io/) 上创建一个账户并获取一个 API 令牌。为此，请访问 [crates.io](https://crates.io/) 的主页并通过 GitHub 账户登录。（目前需要 GitHub 账户，但将来该网站可能会支持其他创建账户的方式。）登录后，访问你的账户设置 https://crates.io/me/ 并检索你的 API 密钥。然后运行 `cargo login` 命令并在提示时粘贴你的 API 密钥，如下所示：

```rust
$ cargo login
abcdefghijklmnopqrstuvwxyz012345
```

此命令将通知 Cargo 你的 API 令牌并将其本地存储在 `~/.cargo/credentials` 中。请注意，此令牌是秘密的：不要与任何人分享。如果出于任何原因与任何人分享，你应该撤销它并在 [crates.io](https://crates.io/) 上生成一个新令牌。

### 为新 Crate 添加元数据

假设你有一个想要发布的 crate。在发布之前，你需要在 crate 的 Cargo.toml 文件的 `[package]` 部分添加一些元数据。

你的 crate 需要一个唯一的名称。当你在本地开发 crate 时，你可以随意命名 crate。然而，[crates.io](https://crates.io/) 上的 crate 名称是先到先得分配的。一旦 crate 名称被占用，其他人就不能发布同名的 crate。在尝试发布 crate 之前，搜索你想要使用的名称。如果该名称已被使用，你需要找到另一个名称并编辑 Cargo.toml 文件中 `[package]` 部分下的 `name` 字段，以使用新名称进行发布，如下所示：

Filename: Cargo.toml:

```toml
[package]
name = "guessing_game"
```

即使你选择了唯一的名称，此时运行 `cargo publish` 发布 crate，你也会收到警告，然后是错误：

```rust
$ cargo publish
    Updating crates.io index
warning: manifest has no description, license, license-file, documentation, homepage or repository.
See https://doc.rust-lang.org/cargo/reference/manifest.html#package-metadata for more info.
--snip--
error: failed to publish to registry at https://crates.io

Caused by:
  the remote server responded with an error (status 400 Bad Request): missing or empty metadata fields: description, license. Please see https://doc.rust-lang.org/cargo/reference/manifest.html for more information on configuring these fields

```

这会导致错误，因为你缺少一些关键信息：需要描述和许可证，以便人们知道你的 crate 的作用以及他们可以在什么条款下使用它。在 Cargo.toml 中，添加一个只有一两句话的描述，因为它会出现在你的 crate 的搜索结果中。对于 `license` 字段，你需要提供一个许可证标识符值。[Linux Foundation 的软件包数据交换 (SPDX)](http://spdx.org/licenses/) 列出了你可以用于此值的标识符。例如，要指定你使用 MIT 许可证授权你的 crate，添加 `MIT` 标识符：

Filename: Cargo.toml:

```toml
[package]
name = "guessing_game"
license = "MIT"
```

如果你想使用 SPDX 中没有的许可证，你需要将该许可证的文本放在一个文件中，将该文件包含在你的项目中，然后使用 `license-file` 指定该文件的名称，而不是使用 `license` 键。

关于哪种许可证适合你的项目的指导超出了本文档的范围。Rust 社区中的许多人使用与 Rust 相同的方式授权他们的项目，即使用 `MIT OR Apache-2.0` 双重许可证。这种做法表明你也可以指定多个许可证标识符，用 OR 分隔，以便你的项目拥有多个许可证。

添加了唯一的名称、版本、描述和许可证后，准备发布的项目的 Cargo.toml 文件可能如下所示：

Filename: Cargo.toml:

```toml
[package]
name = "guessing_game"
version = "0.1.0"
edition = "2024"
description = "A fun game where you guess what number the computer has chosen."
license = "MIT OR Apache-2.0"

[dependencies]
```

[Cargo 的文档](https://doc.rust-lang.org/cargo/) 描述了你可以指定的其他元数据，以确保其他人更容易发现和使用你的 crate。

### 发布到 Crates.io

现在你已经创建了账户，保存了 API 令牌，选择了 crate 的名称，并指定了所需的元数据，你就可以发布了！发布 crate 会将特定版本上传到 [crates.io](https://crates.io/) 供其他人使用。

请注意，发布是永久性的。版本永远不能被覆盖，代码也不能被删除。[crates.io](https://crates.io/) 的一个主要目标是作为代码的永久存档，以便所有依赖于 [crates.io](https://crates.io/) 中 crate 的项目的构建都能继续工作。允许删除版本将使实现该目标成为不可能。但是，你可以发布的 crate 版本数量没有限制。

再次运行 cargo publish 命令。现在应该会成功：

```rust
$ cargo publish
    Updating crates.io index
   Packaging guessing_game v0.1.0 (file:///projects/guessing_game)
   Verifying guessing_game v0.1.0 (file:///projects/guessing_game)
   Compiling guessing_game v0.1.0
(file:///projects/guessing_game/target/package/guessing_game-0.1.0)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.19s
   Uploading guessing_game v0.1.0 (file:///projects/guessing_game)
```

恭喜！你现在已经与 Rust 社区分享了你的代码，任何人都可以轻松地将你的 crate 添加到他们的项目中作为依赖项。

### 发布现有 Crate 的新版本

当你对 crate 进行了更改并准备发布新版本时，你需要更改 Cargo.toml 文件中指定的 `version` 值并重新发布。使用 [语义版本控制规则](http://semver.org/) 根据你所做的更改类型来决定合适的下一个版本号。然后运行 `cargo publish` 上传新版本。

### 使用 `cargo yank` 从 Crates.io 撤回版本

虽然你无法删除 crate 的先前版本，但你可以阻止任何未来的项目将其添加为新的依赖项。当某个 crate 版本由于某种原因损坏时，这非常有用。在这种情况下，Cargo 支持撤回 crate 版本。

撤回版本会阻止新项目依赖该版本，同时允许所有依赖该版本的现有项目继续使用。本质上，撤回意味着所有带有 Cargo.lock 的项目都不会中断，并且将来生成的任何 Cargo.lock 文件都不会使用被撤回的版本。

要撤回 crate 的某个版本，在你之前发布的 crate 的目录中，运行 `cargo yank` 并指定你要撤回的版本。例如，如果我们发布了一个名为 `guessing_game` 的 crate 的 1.0.1 版本，并且我们想撤回它，在 `guessing_game` 的项目目录中，我们将运行：

```rust
$ cargo yank --vers 1.0.1
    Updating crates.io index
        Yank guessing_game@1.0.1
```

通过在命令中添加 `--undo`，你也可以撤销撤回，并允许项目再次开始依赖该版本：

```rust
$ cargo yank --vers 1.0.1 --undo
    Updating crates.io index
      Unyank guessing_game@1.0.1
```

撤回不会删除任何代码。例如，它不能删除意外上传的秘密信息。如果发生这种情况，你必须立即重置这些秘密信息。