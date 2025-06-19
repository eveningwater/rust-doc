## 可驳性：模式是否可能匹配失败

模式有两种形式：可驳模式（refutable）和不可驳模式（irrefutable）。对于任何可能传入的值都能匹配成功的模式是不可驳模式。例如，`let x = 5;` 语句中的 `x` 就是一个不可驳模式，因为它能匹配任何值，因此不可能匹配失败。对于某些可能的值会匹配失败的模式是可驳模式。例如，`if let Some(x) = a_value` 表达式中的 `Some(x)` 就是一个可驳模式，因为如果 `a_value` 变量中的值是 `None` 而不是 `Some`，那么 `Some(x)` 模式将不会匹配。

函数参数、`let` 语句和 `for` 循环只能接受不可驳模式，因为当值不匹配时，程序无法执行任何有意义的操作。`if let` 和 `while let` 表达式以及 `let...else` 语句既可以接受可驳模式，也可以接受不可驳模式，但编译器会警告不可驳模式，因为根据定义，它们旨在处理可能的失败：条件语句的功能在于其根据成功或失败执行不同操作的能力。

通常，你不必担心可驳模式和不可驳模式之间的区别；但是，你确实需要熟悉可驳性的概念，以便在错误消息中看到它时能够做出响应。在这些情况下，你需要根据代码的预期行为，更改模式或使用模式的构造。

让我们看一个例子，当我们尝试在 Rust 需要不可驳模式的地方使用可驳模式，反之亦然时会发生什么。示例 19-8 展示了一个 `let` 语句，但对于模式，我们指定了 `Some(x)`，这是一个可驳模式。正如你所料，此代码将无法编译。

```rust
fn main() {
    let some_option_value: Option<i32> = None;
    let Some(x) = some_option_value;
}
```

示例 19-8：尝试在 `let` 语句中使用可驳模式

如果 `some_option_value` 是 `None` 值，它将无法匹配模式 `Some(x)`，这意味着该模式是可驳的。然而，`let` 语句只能接受不可驳模式，因为代码无法对 `None` 值执行任何有效操作。在编译时，Rust 会抱怨我们尝试在需要不可驳模式的地方使用可驳模式：

```rust
$ cargo run
   Compiling patterns v0.1.0 (file:///projects/patterns)
error[E0005]: refutable pattern in local binding
 --> src/main.rs:3:9
  |
3 |     let Some(x) = some_option_value;
  |         ^^^^^^^ pattern `None` not covered
  |
  = note: `let` bindings require an "irrefutable pattern", like a `struct` or an `enum` with only one variant
  = note: for more information, visit https://doc.rust-lang.org/book/ch19-02-refutability.html
  = note: the matched value is of type `Option<i32>`
help: you might want to use `let else` to handle the variant that isn't matched
  |
3 |     let Some(x) = some_option_value else { todo!() };
  |                                     ++++++++++++++++

For more information about this error, try `rustc --explain E0005`.
error: could not compile `patterns` (bin "patterns") due to 1 previous error
```

因为我们没有（也无法！）用模式 `Some(x)` 覆盖所有有效值，Rust 正确地产生了编译错误。

如果我们有一个可驳模式，而需要一个不可驳模式，我们可以通过更改使用该模式的代码来修复它：我们可以使用 `if let` 而不是 `let`。这样，如果模式不匹配，代码将跳过花括号中的代码，从而使其能够有效地继续执行。示例 19-9 展示了如何修复示例 19-8 中的代码。

```rust
fn main() {
    let some_option_value: Option<i32> = None;
    let Some(x) = some_option_value else {
        return;
    };
}
```

示例 19-9：使用 `let...else` 和一个带有可驳模式的块来代替 `let`

我们为代码提供了一个出口！现在这段代码是完全有效的。 然而，如果我们给 `if let` 一个不可驳模式（一个总是匹配的模式），例如示例 19-10 中所示的 `x`，编译器会给出警告。

```rust
fn main() {
    let x = 5 else {
        return;
    };
}
```

示例 19-10：尝试在 `if let` 中使用不可驳模式

Rust 抱怨在 `if let` 中使用不可驳模式没有意义：

```rust
$ cargo run
   Compiling patterns v0.1.0 (file:///projects/patterns)
warning: irrefutable `if let` pattern
 --> src/main.rs:2:8
  |
2 |     if let x = 5 {
  |        ^^^^^^^^^
  |
  = note: this pattern will always match, so the `if let` is useless
  = help: consider replacing the `if let` with a `let`
  = note: `#[warn(irrefutable_let_patterns)]` on by default

warning: `patterns` (bin "patterns") generated 1 warning
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.39s
     Running `target/debug/patterns`
5
```

因此，`match` 表达式的匹配臂必须使用可驳模式，除了最后一个匹配臂，它应该使用不可驳模式来匹配任何剩余的值。Rust 允许我们在只有一个匹配臂的 `match` 表达式中使用不可驳模式，但这种语法并不是特别有用，可以用更简单的 `let` 语句代替。

现在你已经了解了模式的使用位置以及可驳模式和不可驳模式之间的区别，接下来我们将介绍所有可用于创建模式的语法。
