## 使用发布配置文件自定义构建

在 Rust 中，发布配置文件是预定义的可自定义配置文件，具有不同的配置，允许程序员更好地控制各种代码编译选项。每个配置文件都独立于其他配置文件进行配置。

Cargo 有两个主要配置文件：运行 `cargo build` 时使用的 `dev` 配置文件和运行 `cargo build --release` 时使用的 `release` 配置文件。`dev` 配置文件定义了适合开发的良好默认值，而 `release` 配置文件定义了适合发布构建的良好默认值。

这些配置文件名称可能在你的构建输出中很熟悉：

```rust
$ cargo build
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.00s
$ cargo build --release
    Finished `release` profile [optimized] target(s) in 0.32s
```

`dev` 和 `release` 是编译器使用的不同配置文件。

当你未在项目的 Cargo.toml 文件中明确添加任何 `[profile.*]` 部分时，Cargo 会为每个配置文件应用默认设置。通过为要自定义的任何配置文件添加 `[profile.*]` 部分，你可以覆盖默认设置的任何子集。例如，以下是 `dev` 和 `release` 配置文件的 `opt-level` 设置的默认值：

Filename: Cargo.toml:

```toml
[profile.dev]
opt-level = 0

[profile.release]
opt-level = 3
```

`opt-level` 设置控制 Rust 将应用于代码的优化级别，范围为 0 到 3。应用更多优化会延长编译时间，因此如果你正在开发并经常编译代码，你会希望减少优化以加快编译速度，即使生成的代码运行速度较慢。因此，`dev` 的默认 `opt-level` 为 `0`。当你准备发布代码时，最好花更多时间进行编译。你只需在发布模式下编译一次，但会多次运行编译后的程序，因此发布模式以更长的编译时间换取更快的代码运行速度。这就是 `release` 配置文件的默认 `opt-level` 为 `3` 的原因。

你可以通过在 Cargo.toml 中为其添加不同的值来覆盖默认设置。例如，如果要在开发配置文件中使用优化级别 1，可以将以下两行添加到项目的 Cargo.toml 文件中：

Filename: Cargo.toml:

```toml
[profile.dev]
opt-level = 1
```

此代码覆盖了默认设置 `0`。现在，当我们运行 `cargo build` 时，Cargo 将使用 `dev` 配置文件的默认设置以及我们对 `opt-level` 的自定义设置。由于我们将 `opt-level` 设置为 `1`，Cargo 将应用比默认设置更多的优化，但不如发布构建中的优化多。

有关每个配置文件的完整配置选项和默认值列表，请参阅[Cargo 的文档](https://doc.rust-lang.org/cargo/reference/profiles.html)。
