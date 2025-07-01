## 附录 D - 实用开发工具

在本附录中，我们会讨论 Rust 项目提供的一些实用开发工具。我们将研究自动格式化、快速应用警告修复的方法、代码检查器以及与 IDE 的集成。

### 使用 `rustfmt` 进行自动格式化

`rustfmt` 工具根据社区代码风格重新格式化你的代码。许多协作项目使用 `rustfmt` 来防止在编写 Rust 代码时关于使用哪种风格的争论：每个人都使用该工具格式化他们的代码。

Rust 安装默认包含 `rustfmt`，所以你的系统上应该已经有了程序 `rustfmt` 和 `cargo-fmt`。这两个命令类似于 `rustc` 和 `cargo`，其中 `rustfmt` 允许更细粒度的控制，而 `cargo-fmt` 理解使用 Cargo 的项目的约定。要格式化任何 Cargo 项目，请输入以下内容：

```rust
$ cargo fmt
```

运行此命令会重新格式化当前 `crate` 中的所有 Rust 代码。这应该只改变代码风格，而不是代码语义。

此命令为你提供 `rustfmt` 和 `cargo-fmt`，类似于 Rust 为你提供 `rustc` 和 `cargo`。要格式化任何 Cargo 项目，请输入以下内容：

```rust
$ cargo fmt
```

运行此命令会重新格式化当前 `crate` 中的所有 Rust 代码。这应该只改变代码风格，而不是代码语义。有关 `rustfmt` 的更多信息，请参阅[其文档](https://github.com/rust-lang/rustfmt)。


### 使用 `rustfix` 修复你的代码

`rustfix` 工具包含在 Rust 安装中，可以自动修复具有明确纠正问题方法的编译器警告，这很可能是你想要的。你之前很可能见过编译器警告。例如，考虑这段代码：

文件名：src/main.rs：

```rust
fn main() {
    let mut x = 42;
    println!("{x}");
}
```

在这里，我们将变量 `x` 定义为可变的，但我们从未真正改变它。Rust 会对此发出警告：

```rust
$ cargo build
   Compiling myprogram v0.1.0 (file:///projects/myprogram)
warning: variable does not need to be mutable
 --> src/main.rs:2:9
  |
2 |     let mut x = 0;
  |         ----^
  |         |
  |         help: remove this `mut`
  |
  = note: `#[warn(unused_mut)]` on by default
```

警告建议我们删除 `mut` 关键字。我们可以通过运行命令 `cargo fix` 使用 `rustfix` 工具自动应用该建议：

```rust
$ cargo fix
    Checking myprogram v0.1.0 (file:///projects/myprogram)
      Fixing src/main.rs (1 fix)
    Finished dev [unoptimized + debuginfo] target(s) in 0.59s
```

当我们再次查看 *src/main.rs* 时，我们会看到 `cargo fix` 已经更改了代码：

文件名：src/main.rs：

```rust
fn main() {
    let x = 42;
    println!("{x}");
}
```

`x` 变量现在是不可变的，警告不再出现。

你还可以使用 `cargo fix` 命令在不同的 Rust 版本之间转换你的代码。版本在[附录 E](./appendix-e.md)中有介绍。

### 使用 Clippy 进行更多代码检查

Clippy 工具是一个代码检查集合，用于分析你的代码，以便你可以捕获常见错误并改进你的 Rust 代码。Clippy 包含在标准 Rust 安装中。

要在任何 Cargo 项目上运行 Clippy 的代码检查，请输入以下内容：

```rust
$ cargo clippy
```

例如，假设你编写了一个使用数学常数近似值的程序，比如 pi，就像这个程序所做的那样：

文件名：src/main.rs：

```rust
fn main() {
    let x = 3.1415;
    let r = 8.0;
    println!("the area of the circle is {}", x * r * r);
}
```

在此项目上运行 `cargo clippy` 会导致此错误：

```text
error: approximate value of `f{32, 64}::consts::PI` found
 --> src/main.rs:2:13
  |
2 |     let x = 3.1415;
  |             ^^^^^^
  |
  = note: `#[deny(clippy::approx_constant)]` on by default
  = help: consider using the constant directly
  = help: for further information visit https://rust-lang.github.io/rust-clippy/master/index.html#approx_constant
```

此错误让你知道 Rust 已经定义了更精确的 `PI` 常数，如果你使用该常数，你的程序会更正确。然后你会更改你的代码以使用 `PI` 常数。以下代码不会从 Clippy 产生任何错误或警告：

文件名：src/main.rs：

```rust
fn main() {
    let x = std::f64::consts::PI;
    let r = 8.0;
    println!("the area of the circle is {}", x * r * r);
}
```

有关 Clippy 的更多信息，请参阅[其文档](https://github.com/rust-lang/rust-clippy)。


### 使用 `rust-analyzer` 进行 IDE 集成

为了帮助 IDE 集成，Rust 社区推荐使用 [`rust-analyzer`](https://rust-analyzer.github.io)。此工具是一套以编译器为中心的实用程序，它使用[语言服务器协议](http://langserver.org/)，这是 IDE 和编程语言之间相互通信的规范。不同的客户端可以使用 `rust-analyzer`，比如 [Visual Studio Code 的 Rust analyzer 插件](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)。

访问 `rust-analyzer` 项目的[主页](https://rust-analyzer.github.io/)获取安装说明，然后在你的特定 IDE 中安装语言服务器支持。你的 IDE 将获得诸如自动完成、跳转到定义和内联错误等功能。
