## 附录 G - Rust 是如何开发的以及 "Nightly Rust"

本附录介绍 Rust 是如何开发的，以及这如何影响你作为 Rust 开发者。

### 稳定而不停滞

作为一门语言，Rust *非常* 关心你代码的稳定性。我们希望 Rust 成为你可以构建的坚如磐石的基础，如果事物不断变化，那将是不可能的。同时，如果我们不能试验新功能，我们可能不会发现重要的缺陷，直到它们发布后，那时我们就不能再改变了。

我们对这个问题的解决方案是我们所说的 "稳定而不停滞"，我们的指导原则是：你永远不应该害怕升级到新版本的稳定 Rust。每次升级都应该是无痛的，但也应该为你带来新功能、更少的错误和更快的编译时间。

### 呜，呜！发布渠道和乘坐火车

Rust 开发按照 **火车时刻表**（*train schedule*）运行。也就是说，所有开发都在 Rust 仓库的 `master` 分支上进行。发布遵循软件发布火车模型，这已被 Cisco IOS 和其他软件项目使用。Rust 有三个 **发布渠道**（*release channel*）：

- Nightly
- Beta
- Stable

大多数 Rust 开发者主要使用稳定渠道，但那些想要尝试实验性新功能的人可能使用 nightly 或 beta。

这里有一个开发和发布过程如何工作的例子：让我们假设 Rust 团队正在开发 Rust 1.5 的发布。该发布发生在 2015 年 12 月，但它将为我们提供现实的版本号。一个新功能被添加到 Rust：一个新的提交落在 `master` 分支上。每晚，都会产生一个新的 nightly 版本的 Rust。每天都是发布日，这些发布由我们的发布基础设施自动创建。因此随着时间的推移，我们的发布看起来像这样，每晚一次：

```rust
nightly: * - - * - - *
```

每六周，是时候准备新的发布了！Rust 仓库的 `beta` 分支从 nightly 使用的 `master` 分支分出。现在，有两个发布：

```rust
nightly: * - - * - - *
                     |
beta:                *
```

大多数 Rust 用户不会主动使用 beta 发布，但在他们的 CI 系统中针对 beta 进行测试，以帮助 Rust 发现可能的回归。与此同时，每晚仍有一个 nightly 发布：

```rust
nightly: * - - * - - * - - * - - *
                     |
beta:                *
```

假设发现了一个回归。好在我们有一些时间在回归潜入稳定发布之前测试 beta 发布！修复被应用到 `master`，这样 nightly 就被修复了，然后修复被反向移植到 `beta` 分支，并产生一个新的 beta 发布：

```rust
nightly: * - - * - - * - - * - - * - - *
                     |
beta:                * - - - - - - - - *
```

在第一个 beta 创建六周后，是时候进行稳定发布了！`stable` 分支从 `beta` 分支产生：

```rust
nightly: * - - * - - * - - * - - * - - * - * - *
                     |
beta:                * - - - - - - - - *
                                       |
stable:                                *
```

万岁！Rust 1.5 完成了！然而，我们忘记了一件事：因为六周已经过去了，我们还需要 Rust *下一个* 版本 1.6 的新 beta。所以在 `stable` 从 `beta` 分出后，下一个版本的 `beta` 再次从 `nightly` 分出：

```rust
nightly: * - - * - - * - - * - - * - - * - * - *
                     |                         |
beta:                * - - - - - - - - *       *
                                       |
stable:                                *
```

这被称为 "火车模型"，因为每六周，一个发布 "离开车站"，但仍必须通过 beta 渠道的旅程，然后才能作为稳定发布到达。

Rust 每六周发布一次，像时钟一样准确。如果你知道一个 Rust 发布的日期，你就能知道下一个的日期：六周后。每六周安排发布的一个好处是下一班火车很快就来了。如果一个功能碰巧错过了特定的发布，没有必要担心：另一个很快就会发生！这有助于减少在发布截止日期附近偷偷加入可能未完善功能的压力。

由于这个过程，你总是可以检查 Rust 的下一个构建并自己验证升级是否容易：如果 beta 发布没有按预期工作，你可以向团队报告并在下一个稳定发布发生之前修复它！beta 发布中的破坏相对较少，但 `rustc` 仍然是一个软件，错误确实存在。

### 维护时间

Rust 项目支持最新的稳定版本。当新的稳定版本发布时，旧版本到达其生命周期结束（EOL）。这意味着每个版本支持六周。

### 不稳定功能

这个发布模型还有一个问题：不稳定功能。Rust 使用一种称为 "功能标志" 的技术来确定在给定发布中启用哪些功能。如果新功能正在积极开发中，它会落在 `master` 上，因此在 nightly 中，但在 **功能标志**（*feature flag*）后面。如果你作为用户希望尝试正在进行中的功能，你可以，但你必须使用 Rust 的 nightly 发布并用适当的标志注释你的源代码以选择加入。

如果你使用 Rust 的 beta 或稳定发布，你不能使用任何功能标志。这是允许我们在宣布新功能永远稳定之前获得实际使用的关键。那些希望选择最前沿的人可以这样做，那些想要坚如磐石体验的人可以坚持稳定版本，并知道他们的代码不会破坏。稳定而不停滞。

这本书只包含关于稳定功能的信息，因为正在进行的功能仍在变化，当然它们在这本书编写时和它们在稳定构建中启用时会有所不同。你可以在线找到仅限 nightly 功能的文档。

### Rustup 和 Rust Nightly 的作用

`Rustup` 使在 Rust 的不同发布渠道之间切换变得容易，在全局或每个项目的基础上。默认情况下，你将安装稳定的 Rust。例如，要安装 nightly：

```console
$ rustup toolchain install nightly
```

你可以看到你用 `rustup` 安装的所有 **工具链**（*toolchain*）（Rust 的发布和相关组件）。这是你的作者之一的 Windows 计算机上的一个例子：

```powershell
> rustup toolchain list
stable-x86_64-pc-windows-msvc (default)
beta-x86_64-pc-windows-msvc
nightly-x86_64-pc-windows-msvc
```

如你所见，稳定工具链是默认的。大多数 Rust 用户大部分时间使用稳定版本。你可能想要大部分时间使用稳定版本，但在特定项目上使用 nightly，因为你关心最前沿的功能。为此，你可以在该项目的目录中使用 `rustup override` 将 nightly 工具链设置为当你在该目录中时 `rustup` 应该使用的工具链：

```console
$ cd ~/projects/needs-nightly
$ rustup override set nightly
```

现在，每次你在 *~/projects/needs-nightly* 内调用 `rustc` 或 `cargo` 时，`rustup` 将确保你使用的是 nightly Rust，而不是你的默认稳定 Rust。当你有很多 Rust 项目时，这会很方便！

### RFC 过程和团队

那么你如何了解这些新功能呢？Rust 的开发模型遵循 **征求意见（RFC）过程**（*Request For Comments (RFC) process*）。如果你想改进 Rust，你可以写一个提案，称为 RFC。

任何人都可以写 RFC 来改进 Rust，提案由 Rust 团队审查和讨论，该团队由许多主题子团队组成。在 [Rust 的网站](https://www.rust-lang.org/governance)上有团队的完整列表，其中包括项目每个领域的团队：语言设计、编译器实现、基础设施、文档等等。适当的团队阅读提案和评论，写一些他们自己的评论，最终，有共识接受或拒绝该功能。

如果功能被接受，在 Rust 仓库上打开一个 issue，有人可以实现它。实现它的人很可能不是最初提出功能的人！当实现准备好时，它会落在 `master` 分支上的功能门后面，正如我们在 ["不稳定功能"](#不稳定功能)<!-- ignore --> 部分讨论的。

一段时间后，一旦使用 nightly 发布的 Rust 开发者能够尝试新功能，团队成员将讨论该功能，它在 nightly 上的表现如何，并决定它是否应该进入稳定的 Rust。如果决定继续前进，功能门被移除，该功能现在被认为是稳定的！它乘坐火车进入 Rust 的新稳定发布。