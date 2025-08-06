## 使用 `cargo install` 安装二进制文件

`cargo install` 命令允许你在本地安装和使用二进制 crate。这并不是为了替代系统包管理器，而是为 Rust 开发者提供一种便捷的方式来安装其他人在 [crates.io](https://crates.io/) 上分享的工具。请注意，你只能安装具有二进制目标的包。二进制目标是指当 crate 有 src/main.rs 文件或者另一个指定为二进制文件的文件时创建的可运行程序，这与不能独立运行但适合包含在其他程序中的库目标不同。通常，crate 在 README 文件中会有信息说明该 crate 是库、二进制目标，或者两者都是。

所有通过 `cargo install` 安装的二进制文件都存储在安装根目录的 bin 文件夹中。如果你使用 rustup.rs 安装了 Rust 且没有任何自定义配置，这个目录将是 `$HOME/.cargo/bin`。确保该目录在你的 `$PATH` 中，这样你才能运行通过 `cargo install` 安装的程序。

例如，在第 12 章中我们提到了一个用于搜索文件的 `grep` 工具的 Rust 实现，叫做 `ripgrep`。要安装 `ripgrep`，我们可以运行以下命令：

```rust
$ cargo install ripgrep
    Updating crates.io index
  Downloaded ripgrep v14.1.1
  Downloaded 1 crate (213.6 KB) in 0.40s
  Installing ripgrep v14.1.1
--snip--
   Compiling grep v0.3.2
    Finished `release` profile [optimized + debuginfo] target(s) in 6.73s
  Installing ~/.cargo/bin/rg
   Installed package `ripgrep v14.1.1` (executable `rg`)
```

输出的倒数第二行显示了已安装二进制文件的位置和名称，在 `ripgrep` 的情况下是 `rg`。只要安装目录在你的 `$PATH` 中，如前所述，你就可以运行 `rg --help` 并开始使用这个更快、更 Rust 化的文件搜索工具！