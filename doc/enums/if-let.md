## 使用 if let 进行简洁的控制流程

`if let` 语法让你可以将 if 和 let 组合成一种更简洁的方式，以处理匹配一个模式的值而忽略其余的值。考虑示例 6-6 中的程序，该程序匹配 config_max 变量中的 `Option<u8>` 值，但仅在该值为 Some 变体时才执行代码。

```rust
fn main() {
    let config_max = Some(3u8);
    match config_max {
        Some(max) => println!("The maximum is configured to be {max}"),
        _ => (),
    }
}
```

示例 6-6：仅当值为 Some 时才关心执行代码的 match

如果值为 Some，我们将通过将值绑定到模式中的变量 max 来打印出 Some 变量中的值。我们不想对 None 值执行任何操作。为了满足匹配表达式，我们必须在处理一个变量后添加 `_ => ()`，这是令人讨厌的样板代码。

相反，我们可以使用 if let 以更短的方式编写此代码。以下代码的行为与示例 6-6 中的匹配相同：

```rust
fn main() {
    let config_max = Some(3u8);
    if let Some(max) = config_max {
        println!("The maximum is configured to be {max}");
    }
}
```

语法 if let 采用一个模式和一个表达式，中间用等号隔开。它的工作方式与 match 相同，其中表达式被赋予 match，而模式是它的第一个分支。在本例中，模式是 Some(max)，max 绑定到 Some 内的值。然后，我们可以在 if let 块的主体中​​使用 max，就像我们在相应的 match 分支中使用 max 一样。如果值与模式不匹配，则不会运行 if let 块中的代码。

使用 if let 意味着更少的输入、更少的缩进和更少的样板代码。但是，你会失去 match 强制执行的详尽检查。在 match 和 if let 之间进行选择取决于你在特定情况下要做什么，以及获得简洁性是否是失去详尽检查的适当权衡。

换句话说，你可以将 if let 视为 match 的语法糖，当值与一个模式匹配时运行代码，然后忽略所有其他值。

我们可以在 if let 中包含一个 else。与 else 搭配的代码块与 match 表达式中与 _ 情况搭配的代码块相同，相当于 if let and else。回想一下示例 6-4 中的 Coin 枚举定义，其中 Quarter 变量也保存了一个 UsState 值。如果我们想要计算我们看到的所有非 25 美分硬币，同时宣布 25 美分硬币的状态，我们可以使用 match 表达式来实现，如下所示：

```rust
#[derive(Debug)]
enum UsState {
    Alabama,
    Alaska,
    // ...
}

enum Coin {
    Penny,
    Nickel,
    Dime,
    Quarter(UsState),
}

fn main() {
    let coin = Coin::Penny;
    let mut count = 0;
    match coin {
        Coin::Quarter(state) => println!("State quarter from {state:?}!"),
        _ => count += 1,
    }
}
```

或者我们可以使用 if let 和 else 表达式，如下所示：

```rust
#[derive(Debug)]
enum UsState {
    Alabama,
    Alaska,
    // ...
}

enum Coin {
    Penny,
    Nickel,
    Dime,
    Quarter(UsState),
}

fn main() {
    let coin = Coin::Penny;
    let mut count = 0;
    if let Coin::Quarter(state) = coin {
        println!("State quarter from {state:?}!");
    } else {
        count += 1;
    }
}
```

如果你的程序中的逻辑过于冗长而无法使用 match 来表达，请记住 if let 也在你的 Rust 工具箱中。

## 总结

我们现在已经介绍了如何使用枚举来创建自定义类型，这些类型可以是一组枚举值之一。我们展示了标准库的 Option<T> 类型如何帮助你使用类型系统来防止错误。当枚举值中包含数据时，你可以使用 match 或 if let 来提取和使用这些值，具体取决于你需要处理多少个案例。

你的 Rust 程序现在可以使用结构和枚举来表达你域中的概念。创建自定义类型以在你的 API 中使用可确保类型安全：编译器将确保你的函数仅获取每个函数期望的类型的值。

为了向你的用户提供一个组织良好的 API，该 API 易于使用，并且只公开你的用户所需的内容，现在让我们转向 Rust 的模块。