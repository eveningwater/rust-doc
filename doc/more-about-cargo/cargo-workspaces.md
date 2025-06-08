## Cargo 工作空间

在第 12 章中，我们构建了一个包含二进制 crate 和库 crate 的包。随着项目的发展，你可能会发现库 crate 变得越来越大，你希望将包进一步拆分为多个库 crate。Cargo 提供了一个称为工作空间的功能，可以帮助管理同时开发的多个相关包。

### 创建工作空间

工作空间是一组共享相同 Cargo.lock 和输出目录的包。让我们使用工作空间创建一个项目——我们将使用简单的代码，这样我们可以专注于工作空间的结构。有多种方式可以构建工作空间，所以我们只展示一种常见的方式。我们将创建一个包含一个二进制文件和两个库的工作空间。二进制文件将提供主要功能，并依赖于这两个库。一个库将提供 `add_one` 函数，另一个库提供 `add_two` 函数。这三个 crate 将是同一个工作空间的一部分。我们首先为工作空间创建一个新目录：

```shell
$ mkdir add
$ cd add
```

接下来，在 add 目录中，我们创建 Cargo.toml 文件，该文件将配置整个工作空间。这个文件不会有 `[package]` 部分。相反，它将以 `[workspace]` 部分开始，允许我们向工作空间添加成员。我们还特意在工作空间中使用 Cargo 的最新解析器算法，通过将 `resolver` 设置为 `"3"`。

Filename: Cargo.toml:

```toml
[workspace]
resolver = "3"
```

接下来，我们将通过在 add 目录中运行 `cargo new` 来创建 `adder` 二进制 crate：

```rust
$ cargo new adder
    Creating binary (application) `adder` package
      Adding `adder` as member of workspace at `file:///projects/add`
```

在工作空间内运行 `cargo new` 也会自动将新创建的包添加到工作空间 `Cargo.toml` 中 `[workspace]` 定义的 `members` 键中，如下所示：

```toml
[workspace]
resolver = "3"
members = ["adder"]
```

此时，我们可以通过运行 `cargo build` 来构建工作空间。add 目录中的文件应该如下所示：

```rust
├── Cargo.lock
├── Cargo.toml
├── adder
│   ├── Cargo.toml
│   └── src
│       └── main.rs
└── target
```

工作空间在顶层有一个 target 目录，编译后的构件将放在其中；`adder` 包没有自己的 target 目录。即使我们从 adder 目录内运行 `cargo build`，编译后的构件仍然会放在 add/target 中，而不是 add/adder/target。Cargo 这样构建工作空间中的 target 目录是因为工作空间中的 crate 旨在相互依赖。如果每个 crate 都有自己的 target 目录，每个 crate 都必须重新编译工作空间中的其他 crate，以将构件放在自己的 target 目录中。通过共享一个 target 目录，crate 可以避免不必要的重新构建。

### 在工作空间中创建第二个包

接下来，让我们在工作空间中创建另一个成员包，并将其命名为 `add_one`。生成一个名为 `add_one` 的新库 crate：

```rust
$ cargo new add_one --lib
    Creating library `add_one` package
      Adding `add_one` as member of workspace at `file:///projects/add`
```

顶层 Cargo.toml 现在将在 `members` 列表中包含 `add_one` 路径：

Filename: Cargo.toml:

```toml
[workspace]
resolver = "3"
members = ["adder", "add_one"]
```

你的 add 目录现在应该有这些目录和文件：

```rust
├── Cargo.lock
├── Cargo.toml
├── add_one
│   ├── Cargo.toml
│   └── src
│       └── lib.rs
├── adder
│   ├── Cargo.toml
│   └── src
│       └── main.rs
└── target
```

在 add_one/src/lib.rs 文件中，让我们添加一个 `add_one` 函数：

Filename: add_one/src/lib.rs:

```rust
pub fn add_one(x: i32) -> i32 {
    x + 1
}
```

现在我们可以让带有二进制文件的 `adder` 包依赖于有我们库的 `add_one` 包。首先，我们需要在 adder/Cargo.toml 中添加对 `add_one` 的路径依赖。

Filename: adder/Cargo.toml:

```toml
[dependencies]
add_one = { path = "../add_one" }
```

Cargo 不假设工作空间中的 crate 会相互依赖，所以我们需要明确指出依赖关系。

接下来，让我们在 `adder` crate 中使用 `add_one` 函数（来自 `add_one` crate）。打开 adder/src/main.rs 文件并修改 `main` 函数以调用 `add_one` 函数，如示例 14-7 所示。

Filename: adder/src/main.rs:

```rust
fn main() {
    let num = 10;
    println!("Hello, world! {num} plus one is {}!", add_one::add_one(num));
}
```

示例 14-7：在 `adder` crate 中使用 `add_one` 库 crate

让我们通过在顶层 add 目录中运行 `cargo build` 来构建工作空间！

```rust
$ cargo build
   Compiling add_one v0.1.0 (file:///projects/add/add_one)
   Compiling adder v0.1.0 (file:///projects/add/adder)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.22s
```

要从 add 目录运行二进制 crate，我们可以使用 `-p` 参数和包名与 `cargo run` 一起指定要运行的工作空间中的包：

```rust
$ cargo run -p adder
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.00s
     Running `target/debug/adder`
Hello, world! 10 plus one is 11!
```

这会运行 adder/src/main.rs 中的代码，该代码依赖于 `add_one` crate。

#### 在工作空间中依赖外部包

注意，工作空间在顶层只有一个 Cargo.lock 文件，而不是在每个 crate 的目录中都有 Cargo.lock。这确保所有 crate 都使用所有依赖项的相同版本。如果我们在 adder/Cargo.toml 和 add_one/Cargo.toml 文件中添加 `rand` 包，Cargo 会将这两个包解析为一个版本的 `rand`，并将其记录在一个 Cargo.lock 中。使工作空间中的所有 crate 使用相同的依赖项意味着这些 crate 将始终相互兼容。让我们在 add_one/Cargo.toml 文件的 `[dependencies]` 部分添加 `rand` crate，以便我们可以在 `add_one` crate 中使用 `rand` crate：

Filename: add_one/Cargo.toml:

```toml
[dependencies]
rand = "0.8.5"
```

现在我们可以将 `use rand;` 添加到 add_one/src/lib.rs 文件中，通过在 add 目录中运行 `cargo build` 构建整个工作空间将引入并编译 `rand` crate。我们会得到一个警告，因为我们没有引用我们引入作用域的 `rand`：

```rust
$ cargo build
    Updating crates.io index
  Downloaded rand v0.8.5
   --snip--
   Compiling rand v0.8.5
   Compiling add_one v0.1.0 (file:///projects/add/add_one)
warning: unused import: `rand`
 --> add_one/src/lib.rs:1:5
  |
1 | use rand;
  |     ^^^^
  |
  = note: `#[warn(unused_imports)]` on by default

warning: `add_one` (lib) generated 1 warning (run `cargo fix --lib -p add_one` to apply 1 suggestion)
   Compiling adder v0.1.0 (file:///projects/add/adder)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.95s
```

顶层 Cargo.lock 现在包含有关 `add_one` 对 `rand` 的依赖信息。然而，即使 `rand` 在工作空间的某个地方使用，我们也不能在工作空间的其他 crate 中使用它，除非我们也在它们的 Cargo.toml 文件中添加 `rand`。例如，如果我们在 `adder` 包的 adder/src/main.rs 文件中添加 `use rand;`，我们会得到一个错误：

```rust
$ cargo build
  --snip--
   Compiling adder v0.1.0 (file:///projects/add/adder)
error[E0432]: unresolved import `rand`
 --> adder/src/main.rs:2:5
  |
2 | use rand;
  |     ^^^^ no external crate `rand`
```

要解决这个问题，编辑 `adder` 包的 Cargo.toml 文件，并指出 `rand` 也是它的依赖项。构建 `adder` 包将把 `rand` 添加到 Cargo.lock 中 `adder` 的依赖项列表中，但不会下载 `rand` 的额外副本。Cargo 将确保工作空间中使用 `rand` 包的每个 crate 在每个包中都使用相同的版本，只要它们指定兼容版本的 `rand`，这样可以节省空间并确保工作空间中的 crate 相互兼容。

如果工作空间中的 crate 指定了同一依赖项的不兼容版本，Cargo 将解析每个版本，但仍会尝试解析尽可能少的版本。

#### 向工作空间添加测试

对于另一个增强功能，让我们在 `add_one` crate 中添加对 `add_one::add_one` 函数的测试：

Filename: add_one/src/lib.rs:

```rust
pub fn add_one(x: i32) -> i32 {
    x + 1
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_works() {
        assert_eq!(3, add_one(2));
    }
}
```

现在在顶层 add 目录中运行 `cargo test`。在像这样结构化的工作空间中运行 `cargo test` 将运行工作空间中所有 crate 的测试：

```rust
$ cargo test
   Compiling add_one v0.1.0 (file:///projects/add/add_one)
   Compiling adder v0.1.0 (file:///projects/add/adder)
    Finished `test` profile [unoptimized + debuginfo] target(s) in 0.20s
     Running unittests src/lib.rs (target/debug/deps/add_one-93c49ee75dc46543)

running 1 test
test tests::it_works ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s

     Running unittests src/main.rs (target/debug/deps/adder-3a47283c568d2b6a)

running 0 tests

test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s

   Doc-tests add_one

running 0 tests

test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
```

输出的第一部分显示 `add_one` crate 中的 `it_works` 测试通过了。下一部分显示在 `adder` crate 中没有找到测试，然后最后一部分显示在 `add_one` crate 中没有找到文档测试。

我们也可以通过使用 `-p` 标志并指定我们想要测试的 crate 名称，从顶层目录运行工作空间中特定 crate 的测试：

```rust
$ cargo test -p add_one
    Finished `test` profile [unoptimized + debuginfo] target(s) in 0.00s
     Running unittests src/lib.rs (target/debug/deps/add_one-93c49ee75dc46543)

running 1 test
test tests::it_works ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s

   Doc-tests add_one

running 0 tests

test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
```

此输出显示 `cargo test` 只运行了 `add_one` crate 的测试，没有运行 `adder` crate 的测试。

如果你将工作空间中的 crate 发布到 [crates.io](https://crates.io/)，工作空间中的每个 crate 都需要单独发布。与 `cargo test` 类似，我们可以使用 `-p` 标志并指定要发布的 crate 名称，来发布工作空间中的特定 crate。

作为额外练习，以与 `add_one` crate 类似的方式向这个工作空间添加一个 `add_two` crate！

随着项目的增长，考虑使用工作空间：它使你能够使用更小、更容易理解的组件，而不是一大块代码。此外，如果 crate 经常同时更改，将它们保存在工作空间中可以使 crate 之间的协调更容易。