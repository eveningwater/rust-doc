# 使用 use 关键字将路径纳入上下文

必须写出调用函数的路径可能会让人觉得不方便且冗余。在示例 7-7 中，无论我们选择 add_to_waitlist 函数的绝对路径还是相对路径，每次我们想要调用 add_to_waitlist 时，我们都必须指定 front_of_house 和 hosting。幸运的是，有一种方法可以简化这个过程：我们可以使用 use 关键字创建一次路径的快捷方式，然后在作用域中的其他地方使用较短的名称。

在示例 7-11 中，我们将 `crate::front_of_house::hosting` 模块带入 eat_at_restaurant 函数的作用域，因此我们只需指定 `hosting::add_to_waitlist` 即可调用 eat_at_restaurant 中的 add_to_waitlist 函数。

文件名：src/lib.rs：

```rust
mod front_of_house {
    pub mod hosting {
        pub fn add_to_waitlist() {}
    }
}

use crate::front_of_house::hosting;

pub fn eat_at_restaurant() {
    hosting::add_to_waitlist();
}
```

示例 7-11：使用 use 将模块带入上下文

在上下文中添加 use 和路径类似于在文件系统中创建符号链接。通过在 crate 根中添加 `use crate::front_of_house::hosting`，hosting 现在是该上下文中的有效名称，就像 hosting 模块已在 crate 根中定义一样。使用 use 带入上下文的路径也会像任何其他路径一样检查隐私。

请注意，use 仅为使用发生的特定上下文创建快捷方式。示例 7-12 将 eat_at_restaurant 函数移动到名为 customer 的新子模块中，该子模块的上下文与 use 语句不同，因此函数体不会编译。

文件名：src/lib.rs：

```rust
// 此代码不会被编译
mod front_of_house {
    pub mod hosting {
        pub fn add_to_waitlist() {}
    }
}

use crate::front_of_house::hosting;

mod customer {
    pub fn eat_at_restaurant() {
        hosting::add_to_waitlist();
    }
}
```

示例 7-12： use 语句仅适用于其所在的上下文

编译器错误表明快捷方式不再适用于customer模块：

```rust
$ cargo build
   Compiling restaurant v0.1.0 (file:///projects/restaurant)
error[E0433]: failed to resolve: use of undeclared crate or module `hosting`
  --> src/lib.rs:11:9
   |
11 |         hosting::add_to_waitlist();
   |         ^^^^^^^ use of undeclared crate or module `hosting`
   |
help: consider importing this module through its public re-export
   |
10 +     use crate::hosting;
   |

warning: unused import: `crate::front_of_house::hosting`
 --> src/lib.rs:7:5
  |
7 | use crate::front_of_house::hosting;
  |     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  |
  = note: `#[warn(unused_imports)]` on by default

For more information about this error, try `rustc --explain E0433`.
warning: `restaurant` (lib) generated 1 warning
error: could not compile `restaurant` (lib) due to 1 previous error; 1 warning emitted
```

请注意，还有一个警告，提示 use 在其上下文内不再使用！要解决此问题，请将 use 也移到customer模块中，或者在子customer模块中使用 `super::hosting` 引用父模块中的快捷方式。

## 创建惯用 use 路径

在示例 7-11 中，你可能想知道为什么我们指定使用 `crate::front_of_house::hosting`，然后在 eat_at_restaurant 中调用 hosting::add_to_waitlist，而不是像示例 7-13 中那样一直指定使用路径到 add_to_waitlist 函数来实现相同的结果。

文件名：src/lib.rs：

```rust
mod front_of_house {
    pub mod hosting {
        pub fn add_to_waitlist() {}
    }
}

use crate::front_of_house::hosting::add_to_waitlist;

pub fn eat_at_restaurant() {
    add_to_waitlist();
}
```

示例 7-13：使用 use 将 add_to_waitlist 函数带入作用域，这是不符合习惯的

虽然示例 7-11 和示例 7-13 都完成了相同的任务，但示例 7-11 是使用 use 将函数带入作用域的惯用方法。使用 use 将函数的父模块带入作用域意味着我们必须在调用函数时指定父模块。在调用函数时指定父模块可以清楚地表明函数不是本地定义的，同时仍将完整路径的重复降至最低。示例 7-13 中的代码不清楚 add_to_waitlist 在哪里定义。

另一方面，当使用 use 引入结构、枚举和其他项目时，指定完整路径是惯用的。示例 7-14 展示了将标准库的 HashMap 结构带入二进制包作用域的惯用方法。

文件名：src/main.rs：

```rust
use std::collections::HashMap;

fn main() {
    let mut map = HashMap::new();
    map.insert(1, 2);
}
```

示例 7-14：以惯用的方式将 HashMap 引入上下文

这种习惯用法背后没​​有强有力的理由：它只是一种惯例，人们已经习惯以这种方式阅读和编写 Rust 代码。

这种习惯用法的例外是，如果我们使用 use 语句将两个同名项目引入上下文，因为 Rust 不允许这样做。示例 7-15 展示了如何将两个具有相同名称但不同父模块的 Result 类型引入上下文，以及如何引用它们。

文件名：src/lib.rs：

```rust
use std::fmt;
use std::io;

fn function1() -> fmt::Result {
    // --略--
    Ok(())
}

fn function2() -> io::Result<()> {
    // --略--
    Ok(())
}
```

示例 7-15：将两个同名类型带入同一作用域需要使用它们的父模块。

如你所见，使用父模块可以区分两种 Result 类型。如果我们指定`use std::fmt::Result` 和 `use std::io::Result`，我们将在同一个作用域中拥有两种 Result 类型，而 Rust 不知道我们使用 Result 时指的是哪一种。

## 使用 as 关键字提供新名称

还有另一种方法可以解决使用 use 将两个同名类型带入同一作用域的问题：在路径之后，我们可以为该类型指定 as 和一个新的本地名称或别名。示例 7-16 展示了另一种编写示例 7-15 中代码的方法，即使用 as 重命名两个 Result 类型之一。

文件名：src/lib.rs：

```rust
use std::fmt::Result;
use std::io::Result as IoResult;

fn function1() -> Result {
    // --略--
    Ok(())
}

fn function2() -> IoResult<()> {
    // --略--
    Ok(())
}
```

示例 7-16：使用 as 关键字将类型带入上下文时对其进行重命名

在第二个 use 语句中，我们为 `std::io::Result` 类型选择了新名称 IoResult，这不会与我们同样带入上下文的 `std::fmt` 中的 Result 冲突。示例 7-15 和示例 7-16 被认为是惯用的，因此选择由你决定！

## 使用 pub use 重新导出名称

当我们使用 use 关键字将名称带入作用域时，新作用域中可用的名称是私有的。为了使调用我们代码的代码能够引用该名称，就好像它已在该代码的作用域中定义一样，我们可以将 pub 和 use 结合起来。这种技术称为重新导出，因为我们将一个项目带入作用域，同时也使该项目可供其他人带入其作用域。

示例 7-17 显示了示例 7-11 中的代码，其中根模块中的 use 更改为 pub use。

文件名：src/lib.rs：

```rust
mod front_of_house {
    pub mod hosting {
        pub fn add_to_waitlist() {}
    }
}

pub use crate::front_of_house::hosting;

pub fn eat_at_restaurant() {
    hosting::add_to_waitlist();
}
```

示例 7-17：使用 pub use 使名称可供任何代码从新上下文使用

在此更改之前，外部代码必须使用路径 `restaurant::front_of_house::hosting::add_to_waitlist()` 来调用 add_to_waitlist 函数，这也需要将 front_of_house 模块标记为 pub。现在，此 pub use 已从根模块重新导出 hosting 模块，外部代码可以改用路径 `restaurant::hosting::add_to_waitlist()`。

当代码的内部结构与调用代码的程序员对域的看法不同时，重新导出很有用。例如，在这个餐厅比喻中，经营餐厅的人会想到“前台”和“后台”。但光顾餐厅的顾客可能不会用这些术语来考虑餐厅的各个部分。使用 pub use，我们可以用一种结构编写代码，但公开不同的结构。这样做可以让我们的库对使用库的程序员和调用库的程序员来说井井有条。我们将在第 14 章的“使用 pub use 导出方便的公共 API”部分中查看 pub use 的另一个示例以及它如何影响你的 crate 文档。

## 使用外部包

在第 2 章中，我们编写了一个猜谜游戏项目，该项目使用名为 rand 的外部包来获取随机数。为了在我们的项目中使用 rand，我们在 Cargo.toml 中添加了以下行：

文件名：Cargo.toml：

```rust
rand = "0.8.5"
```

在 Cargo.toml 中添加 rand 作为依赖项会告诉 Cargo 从 crates.io 下载 rand 包和任何依赖项，并将 rand 提供给我们的项目。

然后，为了将 rand 定义纳入我们包的上下文，我们添加了一个 use 行，以 crate 的名称 rand 开头，并列出了我们想要纳入上下文的项目。回想一下，在第 2 章的“生成随机数”部分中，我们将 Rng 特征纳入上下文并调用 rand::thread_rng 函数：

```rust
use rand::Rng;

fn main() {
    let secret_number = rand::thread_rng().gen_range(1..=100);
}
```
Rust 社区的成员已在 crates.io 上提供许多软件包，将它们中的任何一个拉入你的软件包都涉及相同的步骤：将它们列在软件包的 Cargo.toml 文件中，并使用 use 将它们的 crate 中的项目带入上下文。

请注意，标准 std 库也是我们软件包外部的 crate。由于标准库随 Rust 语言一起提供，因此我们无需更改 Cargo.toml 以包含 std。但我们确实需要使用 use 引用它，以便将其中的项目带入我们软件包的上下文。例如，对于 HashMap，我们将使用以下行：

```rust
use std::collections::HashMap;
```

这是以 std（标准库 crate 的名称）开头的绝对路径。

## 使用嵌套路径清理大型使用列表

如果我们使用在同一个 crate 或同一个模块中定义的多个项目，则将每个项目列在自己的行上会占用文件中的大量垂直空间。例如，示例 2-4 中的猜谜游戏中的这两个 use 语句将项目从 std 带入上下文：

文件名：src/main.rs：

```rust
use rand::Rng;

use std::cmp::Ordering;
use std::io;


fn main() {
    println!("Guess the number!");

    let secret_number = rand::thread_rng().gen_range(1..=100);

    println!("The secret number is: {secret_number}");

    println!("Please input your guess.");

    let mut guess = String::new();

    io::stdin()
        .read_line(&mut guess)
        .expect("Failed to read line");

    println!("You guessed: {guess}");

    match guess.cmp(&secret_number) {
        Ordering::Less => println!("Too small!"),
        Ordering::Greater => println!("Too big!"),
        Ordering::Equal => println!("You win!"),
    }
}
```

相反，我们可以使用嵌套路径将相同的项目带入一行上下文。我们通过指定路径的公共部分，后跟两个冒号，然后用花括号括住路径不同部分的列表来实现此目的，如示例 7-18 所示。

文件名：src/main.rs：

```rust
use rand::Rng;
use std::{cmp::Ordering, io};


fn main() {
    println!("Guess the number!");

    let secret_number = rand::thread_rng().gen_range(1..=100);

    println!("The secret number is: {secret_number}");

    println!("Please input your guess.");

    let mut guess = String::new();

    io::stdin()
        .read_line(&mut guess)
        .expect("Failed to read line");

    let guess: u32 = guess.trim().parse().expect("Please type a number!");

    println!("You guessed: {guess}");

    match guess.cmp(&secret_number) {
        Ordering::Less => println!("Too small!"),
        Ordering::Greater => println!("Too big!"),
        Ordering::Equal => println!("You win!"),
    }
}
```

示例 7-18：指定嵌套路径以将具有相同前缀的多个项带入上下文

在较大的程序中，使用嵌套路径将来自同一包或模块的多个项带入上下文可以大大减少所需的单独 use 语句的数量！

我们可以在路径的任何级别使用嵌套路径，这在组合共享子路径的两个 use 语句时很有用。例如，示例 7-19 显示了两个 use 语句：一个将 std::io 带入上下文，另一个将 std::io::Write 带入上下文。

文件名：src/lib.rs：

```rust
use std::io;
use std::io::Write;
```

示例 7-19：两个 use 语句，其中一个是另一个的子路径

这两个路径的共同部分是 std::io，这是完整的第一个路径。要将这两个路径合并为一个 use 语句，我们可以在嵌套路径中使用 self，如示例 7-20 所示。

文件名：src/lib.rs：

```rust
use std::io::{self, Write};
```

示例 7-20：将示例 7-19 中的路径合并为一个 use 语句

此行将 `std::io` 和 `std::io::Write` 带入上下文。

## 全局运算符

如果我们想将路径中定义的所有公共项都纳入上下文，我们可以指定该路径，后跟 `*` glob 运算符：

```rust
use std::collections::*;
```

此 use 语句将 std::collections 中定义的所有公共项都纳入当前上下文。使用 glob 运算符时要小心！glob 会使分辨哪些名称在上下文内以及程序中使用的名称在何处定义变得更加困难。

在测试时，通常会使用 glob 运算符将测试中的所有内容纳入测试模块；我们将在第 11 章的“如何编写测试”部分讨论这一点。glob 运算符有时也用作 prelude 模式的一部分：有关该模式的更多信息，请参阅[标准库文档](https://doc.rust-lang.org/std/prelude/index.html#other-preludes)。