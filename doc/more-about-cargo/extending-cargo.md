## 使用自定义命令扩展 Cargo

Cargo 的设计使你可以通过新的子命令扩展它，而无需修改它本身。如果你的 `$PATH` 中有一个名为 `cargo-something` 的二进制文件，你可以通过运行 `cargo something` 来使用它，就像它是 Cargo 的子命令一样。这样的自定义命令在你运行 `cargo --list` 时也会被列出。能够使用 `cargo install` 安装扩展，然后像使用内置 Cargo 工具一样运行它们，这是 Cargo 设计的一个超级便利的好处！

## 总结

通过 Cargo 和 [crates.io](https://crates.io/) 共享代码是使 Rust 生态系统对许多不同任务有用的部分原因。Rust 的标准库小而稳定，但 crate 很容易共享、使用，并且可以按照与语言不同的时间表进行改进。不要羞于在 [crates.io](https://crates.io/) 上分享对你有用的代码；它很可能对其他人也有用！