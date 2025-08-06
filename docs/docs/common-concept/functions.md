## 函数

函数在 Rust 代码中非常普遍。你已经了解了该语言中最重要的函数之一：main 函数，它是许多程序的入口点。你还了解了 fn 关键字，它允许你声明新函数。

Rust 代码使用下划线命名法作为函数和变量名称的常规样式，其中所有字母均为小写，并用下划线分隔单词。以下是包含示例函数定义的程序：

文件名: main.rs:

```rust
fn main() {
    println!("Hello, world!");

    another_function();
}

fn another_function() {
    println!("Another function.");
}
```

在 Rust 中，我们通过输入 `fn` 后跟函数名和一组括号"()"来定义一个函数。花括号"{}"告诉编译器函数体的开始和结束位置。

我们可以通过输入函数名和一对括号来调用我们定义的任何函数。因为 `another_function` 是在程序中定义的，所以可以从 `main` 函数内部调用它。请注意，我们在源代码中将 `another_function` 定义在 `main` 函数之后；我们也可以在此之前定义它。Rust 并不关心你在哪里定义函数，只关心它们是否在调用者可以看到的作用域中定义。

让我们启动一个名为 `functions` 的新的项目来进一步探索函数。将 `another_function` 示例放在 `src/main.rs` 中并运行它。你应该看到以下输出：

```rust
$ cargo run
   Compiling functions v0.1.0 (file:///projects/functions)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.28s
     Running `target/debug/functions`
Hello, world!
Another function.
```

这些行按照它们在主函数中出现的顺序执行。首先打印“Hello, world!”消息，然后调用 `another_function` 并打印其消息。

## 参数

我们可以定义具有参数的函数，这些参数是函数签名的一部分的特殊变量。当函数具有参数时，你可以为其提供这些参数的具体值。从技术上讲，这些具体值称为参数，但在日常对话中，人们倾向于交替使用参数和参数这两个词来表示函数定义中的变量或调用函数时传入的具体值。

在此版本的 another_function 中我们添加了一个参数：

文件名: main.rs:

```rust
fn main() {
    another_function(5);
}

fn another_function(x: i32) {
    println!("The value of x is: {x}");
}
```

尝试运行该程序；你应该得到以下输出：

```rust
$ cargo run
   Compiling functions v0.1.0 (file:///projects/functions)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 1.21s
     Running `target/debug/functions`
The value of x is: 5
```

another_function 的声明有一个名为 x 的参数。x 的类型指定为 i32。当我们将 5 传递给 another_function 时，println! 宏会将 5 放在格式字符串中包含 x 的花括号对的位置。

在函数签名中，你必须声明每个参数的类型。这是 Rust 设计中的一个刻意决定：在函数定义中要求类型注释意味着编译器几乎不需要你在代码的其他地方使用它们来弄清楚你指的是什么类型。如果编译器知道函数需要什么类型，它还能够提供更有用的错误消息。

定义多个参数时，用逗号分隔参数声明，如下所示：

文件名: main.rs:

```rust
fn main() {
    print_labeled_measurement(5, 'h');
}

fn print_labeled_measurement(value: i32, unit_label: char) {
    println!("The measurement is: {value}{unit_label}");
}
```

此示例创建一个名为 print_labeled_measurement 的函数，该函数有两个参数。第一个参数名为 value，是 i32 类型。第二个参数名为 unit_label，是 char 类型。然后，该函数打印包含 value 和 unit_label 的文本。

让我们尝试运行此代码。将名为 functions 项目的 `src/main.rs` 文件中的当前程序替换为前面的示例，然后使用 `cargo run` 运行它：

```rust
$ cargo run
   Compiling functions v0.1.0 (file:///projects/functions)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.31s
     Running `target/debug/functions`
The measurement is: 5h
```

因为我们调用该函数时将 5 作为 value 的值并将 'h' 作为 unit_label 的值，所以程序输出包含这些值。

## 语句和表达式

函数体由一系列语句组成，这些语句可以以表达式结尾。到目前为止，我们介绍的函数还没有包含结束表达式，但你已经看到表达式是语句的一部分。因为 Rust 是一种基于表达式的语言，所以这是一个需要理解的重要区别。其他语言没有相同的区别，所以让我们看看语句和表达式是什么，以及它们的差异如何影响函数体。

- **语句**是执行某些操作但不返回值的指令。
- **表达式**求值后得到结果值。我们来看一些例子。

我们实际上已经使用了语句和表达式。使用 let 关键字创建变量并为其赋值就是语句。在示例 3-1 中，`let y = 6;` 就是一个语句。

文件名: main.rs:

```rust
fn main() {
    let y = 6;
}
```

示例3-1: 包含一个语句的 main 函数声明

函数定义也是语句；前面的整个示例本身就是一个语句。（正如我们将在下面看到的，调用函数不是语句。）

语句不返回值。因此，你不能将 let 语句赋值给另一个变量，就像下面的代码尝试做的那样；你会得到一个错误：

文件名: main.rs:

```rust
fn main() {
    let x = (let y = 6);
}
```

当你运行此程序时，你会得到如下错误：

```rust
$ cargo run
   Compiling functions v0.1.0 (file:///projects/functions)
error: expected expression, found `let` statement
 --> src/main.rs:2:14
  |
2 |     let x = (let y = 6);
  |              ^^^
  |
  = note: only supported directly in conditions of `if` and `while` expressions

warning: unnecessary parentheses around assigned value
 --> src/main.rs:2:13
  |
2 |     let x = (let y = 6);
  |             ^         ^
  |
  = note: `#[warn(unused_parens)]` on by default
help: remove these parentheses
  |
2 -     let x = (let y = 6);
2 +     let x = let y = 6;
  |

warning: `functions` (bin "functions") generated 1 warning
error: could not compile `functions` (bin "functions") due to 1 previous error; 1 warning emitted
```

let y = 6 语句不返回值，因此 x 没有任何可绑定的内容。这与其他语言（如 C 和 Ruby）中的情况不同，在这些语言中，赋值会返回赋值的值。在这些语言中，你可以编写 x = y = 6，并且 x 和 y 都具有值 6；但在 Rust 中情况并非如此。

表达式求值后会得到一个值，它构成了 Rust 中代码的其余大部分内容。考虑一个数学运算，例如 5 + 6，它是一个求值为 11 的表达式。表达式可以是语句的一部分：在示例 3-1 中，语句 let y = 6; 中的 6 是一个求值为 6 的表达式。调用函数是一个表达式。调用宏是一个表达式。用花括号创建的新的块级作用域是一个表达式，例如：

文件名: main.rs:

```rust
fn main() {
    let y = {
        let x = 3;
        x + 1
    };

    println!("The value of y is: {y}");
}
```

此表达式：

```rust
{
    let x = 3;
    x + 1
}
```

是一个块，在本例中，它的计算结果为 4。该值作为 let 语句的一部分绑定到 y。请注意，x + 1 行末尾没有分号，这与你迄今为止看到的大多数行不同。表达式不包括结尾分号。如果在表达式末尾添加分号，则会将其变成语句，然后它将不会返回值。在接下来探索函数返回值和表达式时，请记住这一点。

## 具有返回值的函数

函数可以向调用它们的代码返回值。我们不命名返回值，但我们必须在箭头 (->) 后声明它们的类型。在 Rust 中，函数的返回值与函数主体块中最后一个表达式的值同义。你可以使用 return 关键字并指定一个值从函数中提前返回，但大多数函数都会隐式返回最后一个表达式。以下是返回值的函数示例：

文件名: main.rs:

```rust
fn five() -> i32 {
    5
}

fn main() {
    let x = five();

    println!("The value of x is: {x}");
}
```

five 函数中没有函数调用、宏，甚至没有 let 语句，只有数字 5 本身。这是 Rust 中完全有效的函数。请注意，函数的返回类型也指定为 `-> i3`2`。尝试运行此代码；输出应如下所示：

```rust
$ cargo run
   Compiling functions v0.1.0 (file:///projects/functions)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.30s
     Running `target/debug/functions`
The value of x is: 5
```

five 中的 5 是函数的返回值，这就是返回类型为 i32 的原因。让我们更详细地研究一下。有两个重要部分：首先，行 `let x = five();` 表明我们正在使用函数的返回值来初始化变量。因为函数 five 返回 5，所以该行与以下内容相同：

```rust
let x = 5;
```

其次，five 函数没有参数，并且定义了返回值的类型，但是函数体只有一个 5，没有分号，因为它是一个我们想要返回其值的表达式。

我们来看另一个例子：

文件名: main.rs:

```rust
fn main() {
    let x = plus_one(5);

    println!("The value of x is: {x}");
}

fn plus_one(x: i32) -> i32 {
    x + 1
}
```

运行此代码将打印`The value of x is: 6`。但是，如果我们在包含 x + 1 的行末尾放置一个分号，将其从表达式更改为语句，则会出现错误：

文件名: main.rs:

```rust
fn main() {
    let x = plus_one(5);

    println!("The value of x is: {x}");
}

fn plus_one(x: i32) -> i32 {
    x + 1; // 注意这里加了一个分号
}
```

编译此代码会产生错误，如下所示：

```rust
$ cargo run
   Compiling functions v0.1.0 (file:///projects/functions)
error[E0308]: mismatched types
 --> src/main.rs:7:24
  |
7 | fn plus_one(x: i32) -> i32 {
  |    --------            ^^^ expected `i32`, found `()`
  |    |
  |    implicitly returns `()` as its body has no tail or `return` expression
8 |     x + 1;
  |          - help: remove this semicolon to return this value

For more information about this error, try `rustc --explain E0308`.
error: could not compile `functions` (bin "functions") due to 1 previous error
```

主要错误消息“类型不匹配”揭示了此代码的核心问题。函数 plus_one 的定义表明它将返回一个 i32，但语句不会计算为一个值，该值由单位类型 `()` 表示。因此，没有返回任何内容，这与函数定义相矛盾并导致错误。在此输出中，Rust 提供了一条消息可能有助于纠正此问题：`remove this semicolon to return this value`建议删除分号，这将修复错误。