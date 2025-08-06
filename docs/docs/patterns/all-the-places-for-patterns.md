## 模式可以使用的所有位置

模式在 Rust 的许多地方都会出现，你可能在不知不觉中已经大量使用了它们！本节将讨论模式有效的所有位置。

## `match` 表达式的分支

如第 6 章所述，我们在 `match` 表达式的臂中使用模式。形式上，`match` 表达式定义为关键字 `match`、一个要匹配的值，以及一个或多个 `match` 臂，每个臂由一个模式和一个在值匹配该臂模式时运行的表达式组成，如下所示：

```rust
match VALUE {
    PATTERN => EXPRESSION,
    PATTERN => EXPRESSION,
    PATTERN => EXPRESSION,
}
```

例如，这是示例 6-5 中的 `match` 表达式，它匹配变量 `x` 中的 `Option<i32>` 值：

```rust
match x {
    None => None,
    Some(i) => Some(i + 1),
}
```

此 `match` 表达式中的模式是每个箭头左侧的 `None` 和 `Some(i)`。

`match` 表达式的一个要求是它们必须是穷尽的，这意味着必须考虑 `match` 表达式中值的所有可能性。确保你涵盖了所有可能性的一种方法是为最后一个臂设置一个包罗万象的模式：例如，匹配任何值的变量名永远不会失败，因此涵盖了所有剩余的情况。

特殊的模式 `_` 将匹配任何内容，但它从不绑定到变量，因此它通常用于最后一个 `match` 臂。例如，当你想要忽略任何未指定的值时，`_` 模式会很有用。我们将在本章后面的 [“在模式中忽略值”](#) 中更详细地介绍 `_` 模式。

## 条件 `if let` 表达式

在第 6 章中，我们讨论了如何使用 `if let` 表达式，它主要是编写只匹配一个情况的 `match` 表达式的更短方式。`if let` 可以选择性地带有一个相应的 `else` 块，其中包含在 `if let` 中的模式不匹配时运行的代码。

示例 19-1 展示了混合使用 `if let`、`else if` 和 `else if let` 表达式的可能性。这样做比 `match` 表达式提供了更大的灵活性，因为 `match` 表达式只能表达一个值来与模式进行比较。此外，Rust 不要求一系列 `if let`、`else if`、`else if let` 臂中的条件相互关联。

示例 19-1 中的代码根据一系列条件检查来确定背景颜色。在这个例子中，我们创建了带有硬编码值的变量，而实际程序可能会从用户输入中接收这些值。

文件名: src/main.rs:

```rust
fn main() {
    let favorite_color: Option<&str> = None;
    let is_tuesday = false;
    let age: Result<u8, _> = "34".parse();

    if let Some(color) = favorite_color {
        println!("Using your favorite color, {color}, as the background");
    } else if is_tuesday {
        println!("Tuesday is green day!");
    } else if let Ok(age) = age {
        if age > 30 {
            println!("Using purple as the background color");
        } else {
            println!("Using orange as the background color");
        }
    } else {
        println!("Using blue as the background color");
    }
}
```

示例 19-1：混合使用 `if let`、`else if`、`else if let` 和 `else`

如果用户指定了喜欢的颜色，则该颜色将用作背景。如果没有指定喜欢的颜色且今天是星期二，则背景颜色为绿色。否则，如果用户将其年龄指定为字符串并且我们可以成功将其解析为数字，则颜色将根据数字的值是紫色或橙色。如果这些条件都不适用，则背景颜色为蓝色。

这种条件结构使我们能够支持复杂的需求。对于我们在此处硬编码的值，此示例将打印 `Using purple as the background color`。

你可以看到 `if let` 也可以引入新的变量，以与 `match` 臂相同的方式遮蔽现有变量：`if let Ok(age) = age` 这一行引入了一个新的 `age` 变量，其中包含 `Ok` 变体内部的值，遮蔽了现有的 `age` 变量。这意味着我们需要将 `if age > 30` 条件放在该块中：我们不能将这两个条件组合成 `if let Ok(age) = age && age > 30`。我们想要与 30 比较的新 `age` 在新作用域以花括号开始之前是无效的。

使用 `if let` 表达式的缺点是编译器不检查穷尽性，而 `match` 表达式则会检查。如果我们省略了最后一个 `else` 块，从而遗漏了某些情况的处理，编译器将不会提醒我们可能存在的逻辑错误。

## `while let` 条件循环

与 `if let` 结构类似，`while let` 条件循环允许 `while` 循环在模式持续匹配的情况下运行。在示例 19-2 中，我们展示了一个 `while let` 循环，它等待线程之间发送的消息，但在此示例中，它检查的是 `Result` 而不是 `Option`。

```rust
fn main() {
    let (tx, rx) = std::sync::mpsc::channel();
    std::thread::spawn(move || {
        for val in [1, 2, 3] {
            tx.send(val).unwrap();
        }
    });

    while let Ok(value) = rx.recv() {
        println!("{value}");
    }
}
```

示例 19-2：使用 `while let` 循环打印值，只要 `rx.recv()` 返回 `Ok`

此示例打印 1、2，然后是 3。`recv` 方法从通道的接收端取出第一条消息并返回 `Ok(value)`。当我们在第 16 章首次看到 `recv` 时，我们直接解包了错误，或者使用 `for` 循环将其作为迭代器进行交互。然而，如示例 19-2 所示，我们也可以使用 `while let`，因为只要发送者存在，`recv` 方法每次消息到达时都会返回 `Ok`，一旦发送者断开连接，就会产生 `Err`。

## `for` 循环

在 `for` 循环中，直接跟在关键字 `for` 后面的值是一个模式。例如，在 `for x in y` 中，`x` 就是模式。示例 19-3 演示了如何在 `for` 循环中使用模式来解构（或分解）元组，作为 `for` 循环的一部分。

```rust
fn main() {
    let v = vec!['a', 'b', 'c'];

    for (index, value) in v.iter().enumerate() {
        println!("{value} is at index {index}");
    }
}
```

示例 19-3：在 `for` 循环中使用模式解构元组

示例 19-3 中的代码将打印以下内容：

```
$ cargo run
   Compiling patterns v0.1.0 (file:///projects/patterns)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.52s
     Running `target/debug/patterns`
a is at index 0
b is at index 1
c is at index 2
```

我们使用 `enumerate` 方法调整了一个迭代器，使其生成一个值和该值的索引，并将其放入一个元组中。生成的第一个值是元组 `(0, 'a')`。当这个值与模式 `(index, value)` 匹配时，`index` 将是 0，`value` 将是 `'a'`，从而打印出输出的第一行。

## `let` 语句

在本章之前，我们只明确讨论了在 `match` 和 `if let` 中使用模式，但实际上，我们也在其他地方使用了模式，包括在 `let` 语句中。例如，考虑这个直接的 `let` 变量赋值：

```rust
#![allow(unused)]
fn main() {
    let x = 5;
}
```

每次你使用这样的 `let` 语句时，你都在使用模式，尽管你可能没有意识到！更正式地说，`let` 语句看起来像这样：

```rust
let PATTERN = EXPRESSION;
```

在 `let x = 5;` 这样的语句中，`PATTERN` 位置的变量名只是模式的一种特别简单的形式。Rust 将表达式与模式进行比较，并分配它找到的任何名称。因此，在 `let x = 5;` 示例中，`x` 是一个模式，意思是“将此处匹配的内容绑定到变量 `x`”。因为名称 `x` 是整个模式，所以这个模式实际上意味着“将所有内容绑定到变量 `x`，无论值是什么”。

为了更清楚地看到 `let` 的模式匹配方面，请考虑示例 19-4，它使用 `let` 的模式来解构元组。

```rust
fn main() {
    let (x, y, z) = (1, 2, 3);
}
```

示例 19-4：使用模式解构元组并一次创建三个变量

在这里，我们将一个元组与一个模式进行匹配。Rust 将值 `(1, 2, 3)` 与模式 `(x, y, z)` 进行比较，并发现该值与模式匹配，因为两者的元素数量相同，所以 Rust 将 1 绑定到 `x`，2 绑定到 `y`，3 绑定到 `z`。你可以将此元组模式视为在其内部嵌套了三个单独的变量模式。

如果模式中的元素数量与元组中的元素数量不匹配，则整体类型将不匹配，我们将收到编译错误。例如，示例 19-5 展示了尝试将一个包含三个元素的元组解构为两个变量，这将不起作用。

```rust
fn main() {
    let (x, y) = (1, 2, 3);
}
```

示例 19-5：错误地构造了一个模式，其变量与元组中的元素数量不匹配

尝试编译此代码会导致以下类型错误：

```rust
$ cargo run
   Compiling patterns v0.1.0 (file:///projects/patterns)
error[E0308]: mismatched types
 --> src/main.rs:2:9
  |
2 |     let (x, y) = (1, 2, 3);
  |         ^^^^^^   --------- this expression has type `({integer}, {integer}, {integer})`
  |         |
  |         expected a tuple with 3 elements, found one with 2 elements
  |
  = note: expected tuple `({integer}, {integer}, {integer})`
             found tuple `(_, _)`

For more information about this error, try `rustc --explain E0308`.
error: could not compile `patterns` (bin "patterns") due to 1 previous error
```

要修复此错误，我们可以使用 `_` 或 `..` 忽略元组中的一个或多个值，如 [“在模式中忽略值”](#) 部分所示。如果问题是模式中的变量过多，解决方案是通过删除变量使类型匹配，从而使变量数量等于元组中的元素数量。

## 函数参数

函数参数也可以是模式。示例 19-6 中的代码声明了一个名为 `foo` 的函数，它接受一个名为 `x`、类型为 `i32` 的参数，现在看起来应该很熟悉了。

```rust
fn foo(x: i32) {
    // code goes here
}

fn main() {}
```

示例 19-6：函数签名在参数中使用模式

`x` 部分就是一个模式！就像我们在 `let` 语句中所做的那样，我们可以在函数的参数中将元组与模式进行匹配。示例 19-7 在我们将元组传递给函数时，将其中的值进行拆分。

文件名: src/main.rs:

```rust
fn print_coordinates(&(x, y): &(i32, i32)) {
    println!("Current location: ({x}, {y})");
}

fn main() {
    let point = (3, 5);
    print_coordinates(&point);
}
```

示例 19-7：一个带有解构元组参数的函数

这段代码打印 `Current location: (3, 5)`。值 `&(3, 5)` 与模式 `&(x, y)` 匹配，因此 `x` 的值为 3，`y` 的值为 5。

我们也可以在闭包参数列表中使用模式，其方式与函数参数列表相同，因为闭包与函数类似，如第 13 章所讨论的。

至此，你已经看到了几种使用模式的方法，但模式并非在所有可以使用它们的地方都以相同的方式工作。在某些地方，模式必须是不可驳的；在其他情况下，它们可以是可驳的。接下来我们将讨论这两个概念。
