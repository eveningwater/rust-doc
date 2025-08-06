## 控制流

根据条件是否为真(true)来运行一些代码，以及在条件为真(true)时重复运行一些代码，这些是大多数编程语言的基本构建块。允许你控制 Rust 代码执行流程的最常见结构是 if 表达式和循环。

## if 表达式

if 表达式允许你根据条件分支代码。你提供一个条件，然后声明：“如果满足此条件，则运行此代码块。如果不满足条件，则不运行此代码块。”

在项目目录中创建一个名为 branch 的新项目来探索 if 表达式。在 src/main.rs 文件中，输入以下内容：

文件名: src/main.rs:

```rust
fn main() {
    let number = 3;

    if number < 5 {
        println!("condition was true");
    } else {
        println!("condition was false");
    }
}
```

所有 if 表达式都以关键字 if 开头，后跟条件。在本例中，条件检查变量 number 的值是否小于 5。我们将条件为真时执行的代码块放在条件之后的大括号内。与 if 表达式中的条件相关的代码块有时称为分支，就像我们在第 2 章的“[将猜测数字与秘密数字进行比较](../guess-game/guess-game.md#将猜测数字与秘密数字进行比较)”部分中讨论的 match 表达式中的分支一样。

我们还可以选择添加 else 表达式（前面示例我们选择了添加），以便在条件为 false 时为程序提供另一个代码块来执行。如果你不提供 else 表达式并且条件为 false，程序将直接跳过 if 块并继续执行下一段代码。

尝试运行此代码；你应该看到以下输出：

```rust
$ cargo run
   Compiling branches v0.1.0 (file:///projects/branches)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.31s
     Running `target/debug/branches`
condition was true
```

让我们尝试将 number 的值更改为使条件为假的值，看看会发生什么：

```rust
let number = 7;
```

再次运行程序，并查看输出：

```rust
$ cargo run
   Compiling branches v0.1.0 (file:///projects/branches)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.31s
     Running `target/debug/branches`
condition was false
```

还值得注意的是，此代码中的条件必须是布尔值。如果条件不是布尔值，我们将收到错误。例如，尝试运行以下代码：

文件名: src/main.rs:

```rust
fn main() {
    let number = 3;

    if number {
        println!("number was three");
    }
}
```

这次 if 条件的计算结果为 3，Rust 抛出错误：

```rust
$ cargo run
   Compiling branches v0.1.0 (file:///projects/branches)
error[E0308]: mismatched types
 --> src/main.rs:4:8
  |
4 |     if number {
  |        ^^^^^^ expected `bool`, found integer

For more information about this error, try `rustc --explain E0308`.
error: could not compile `branches` (bin "branches") due to 1 previous error
```

该错误表明 Rust 期望的是布尔值，但得到的却是整数。与 Ruby 和 JavaScript 等语言不同，Rust 不会自动尝试将非布尔值转换为布尔值。你必须明确说明，并始终以布尔值作为 if 的条件。例如，如果我们希望 if 代码块仅在数字不等于 0 时运行，我们可以将 if 表达式更改为以下内容：

文件名: src/main.rs:

```rust
fn main() {
    let number = 3;

    if number != 0 {
        println!("number was something other than zero");
    }
}
```

运行这段代码将会打印`number was something other than zero`。

### 使用 else if 处理多个条件

你可以通过在 else if 表达式中组合 if 和 else 来使用多个条件。例如：

文件名: src/main.rs:

```rust
fn main() {
    let number = 6;

    if number % 4 == 0 {
        println!("number is divisible by 4");
    } else if number % 3 == 0 {
        println!("number is divisible by 3");
    } else if number % 2 == 0 {
        println!("number is divisible by 2");
    } else {
        println!("number is not divisible by 4, 3, or 2");
    }
}
```

此程序有四种可能的路径。运行后，你应该看到以下输出：

```rust
$ cargo run
   Compiling branches v0.1.0 (file:///projects/branches)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.31s
     Running `target/debug/branches`
number is divisible by 3
```

当此程序执行时，它会依次检查每个 if 表达式，并执行条件计算结果为 true 的第一个主体。请注意，即使 6 可以被 2 整除，我们也看不到输出'number is divisible by'，也看不到 else 块中的'number is not divisible by 4, 3, or 2'。这是因为 Rust 只执行第一个条件为 true 的块，一旦找到一个，它甚至不会检查其余的。

使用过多的 else if 表达式会使你的代码变得混乱，因此如果你有多个 else if 表达式，你可能需要重构代码。第 6 章针对这些情况描述了一种名为 match 的强大 Rust 分支构造。

### 在 let 语句中使用 if

因为 if 是一个表达式，所以我们可以在 let 语句的右边使用它来将结果赋给变量，如示例 3-2 所示。

文件名: src/main.rs:

```rust
fn main() {
    let condition = true;
    let number = if condition { 5 } else { 6 };

    println!("The value of number is: {number}");
}
```

示例 3-2：将 if 表达式的结果赋值给变量

根据 if 表达式的结果，number 变量将绑定到一个值。运行此代码以查看会发生什么：

```rust
$ cargo run
   Compiling branches v0.1.0 (file:///projects/branches)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.30s
     Running `target/debug/branches`
The value of number is: 5
```

请记住，代码块的计算结果取决于其中的最后一个表达式，数字本身也是表达式。在这种情况下，整个 if 表达式的值取决于执行哪个代码块。这意味着 if 的每个分支可能返回的值必须是同一类型；在示例 3-2 中，if 分支和 else 分支的结果都是 i32 整数。如果类型不匹配，如以下示例所示，我们将收到错误：

文件名: src/main.rs:

```rust
fn main() {
    let condition = true;

    let number = if condition { 5 } else { "six" };

    println!("The value of number is: {number}");
}
```

当我们尝试编译此代码时，我们会收到错误。 if 和 else 分支的值类型不兼容，而 Rust 会准确指出在程序中哪里可以找到问题：

```rust
$ cargo run
   Compiling branches v0.1.0 (file:///projects/branches)
error[E0308]: `if` and `else` have incompatible types
 --> src/main.rs:4:44
  |
4 |     let number = if condition { 5 } else { "six" };
  |                                 -          ^^^^^ expected integer, found `&str`
  |                                 |
  |                                 expected because of this

For more information about this error, try `rustc --explain E0308`.
error: could not compile `branches` (bin "branches") due to 1 previous error
```

if 块中的表达式求值为整数，而 else 块中的表达式求值为字符串。这行不通，因为变量必须具有单一类型，而 Rust 需要在编译时明确知道数字变量的类型。知道数字的类型可以让编译器在我们使用数字的任何地方验证该类型是否有效。如果数字的类型仅在运行时确定，Rust 将无法做到这一点；如果编译器必须跟踪任何变量的多种假设类型，它将更加复杂，并且对代码做出的保证更少。

## 循环重复

多次执行代码块通常很有用。对于此任务，Rust 提供了多个循环，这些循环将运行循环体内的代码直至结束，然后立即从头开始。要尝试循环，让我们创建一个名为 loops 的新项目。

Rust 有三种循环：loop、while 和 for。让我们尝试一下每一种。

### loop 循环代码

loop 关键字告诉 Rust 永远重复执行一个代码块，或者直到你明确告诉它停止。

例如，将 loops 目录中的 src/main.rs 文件更改为如下所示：

文件名: src/main.rs:

```rust
fn main() {
    loop {
        println!("again!");
    }
}
```

当我们运行这个程序时，我们会看到 again! 不断打印，直到我们手动停止该程序。大多数终端都支持键盘快捷键 <kbd>ctrl</kbd> + <kbd>c</kbd> 来中断陷入持续循环的程序。试一试：

```rust
$ cargo run
   Compiling loops v0.1.0 (file:///projects/loops)
    Finished dev [unoptimized + debuginfo] target(s) in 0.29s
     Running `target/debug/loops`
again!
again!
again!
again!
^Cagain!
```

符号 `^C` 表示你按下 <kbd>ctrl</kbd> + <kbd>c</kbd> 的位置。你可能会也可能不会看到 `^C` 后面打印的单词 again!，具体取决于代码在收到中断信号时处于循环中的哪个位置。

幸运的是，Rust 还提供了一种使用代码跳出循环的方法。你可以在循环中放置 break 关键字来告诉程序何时停止执行循环。回想一下，我们在第 2 章“[猜对后退出](../guess-game/guess-game.md#猜对后退出)”部分的猜谜游戏中这样做过，当用户猜对数字赢得游戏时退出程序。

我们还在猜谜游戏中使用了 `continue`，它在循环中告诉程序跳过本次循环中剩余的代码并进入下一次循环。

### 从循环返回值

循环的用途之一是重试你知道可能会失败的操作，例如检查线程是否已完成其工作。你可能还需要将该操作的结果从循环中传递到代码的其余部分。为此，你可以在用于停止循环的 break 表达式后添加要返回的值；该值将在循环外返回，以便你可以使用它，如下所示：

```rust
fn main() {
    let mut counter = 0;

    let result = loop {
        counter += 1;

        if counter == 10 {
            break counter * 2;
        }
    };

    println!("The result is {result}");
}
```

在循环之前，我们声明一个名为 counter 的变量并将其初始化为 0。然后我们声明一个名为 result 的变量来保存从循环返回的值。在循环的每次迭代中，我们将 counter 变量加 1，然后检查 counter 是否等于 10。如果等于，我们使用 break 关键字，值为 counter \* 2。循环结束后，我们使用分号来结束将值赋给 result 的语句。最后，我们打印 result 中的值，在本例中为 20。

你也可以从循环内部返回。虽然 break 仅退出当前循环，但 return 始终退出当前函数。

### 循环标签用于消除多个循环之间的歧义

如果循环内有循环，break 和 continue 会应用于此时的最内层循环。你可以选择在循环上指定循环标签，然后将其与 break 或 continue 一起使用，以指定这些关键字应用于带标签的循环而不是最内层循环。循环标签必须以单引号开头。以下是包含两个嵌套循环的示例：

```rust
fn main() {
    let mut count = 0;
    'counting_up: loop {
        println!("count = {count}");
        let mut remaining = 10;

        loop {
            println!("remaining = {remaining}");
            if remaining == 9 {
                break;
            }
            if count == 2 {
                break 'counting_up;
            }
            remaining -= 1;
        }

        count += 1;
    }
    println!("End count = {count}");
}
```

外循环带有标签 `'counting_up`，它会从 0 计数到 2。没有标签的内循环会从 10 计数到 9。第一个未指定标签的 break 将仅退出内循环。`break 'counting_up;` 语句将退出外循环。此代码打印：

```rust
$ cargo run
   Compiling loops v0.1.0 (file:///projects/loops)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.58s
     Running `target/debug/loops`
count = 0
remaining = 10
remaining = 9
count = 1
remaining = 10
remaining = 9
count = 2
remaining = 10
End count = 2
```

### 使用 while 的条件循环

程序经常需要在循环中评估条件。当条件为真时，循环运行。当条件不再为真时，程序将调用 break 来停止循环。可以使用 loop、if、else 和 break 的组合来实现这样的行为；如果你愿意，现在可以在程序中尝试一下。但是，这种模式非常常见，Rust 有一个内置的语言构造，称为 while 循环。在示例 3-3 中，我们使用 while 循环程序三次，每次倒计时，然后在循环结束后打印一条消息并退出。

文件名: src/main.rs:

```rust
fn main() {
    let mut number = 3;

    while number != 0 {
        println!("{number}!");

        number -= 1;
    }

    println!("LIFTOFF!!!");
}
```

示例 3-3: 使用 while 循环在条件成立时运行代码

这种结构消除了使用 loop、if、else 和 break 时必须进行的大量嵌套，而且更清晰。当条件评估为真时，代码运行；否则，代码退出循环。

### 使用 for 循环遍历集合

你还可以使用 while 结构来循环遍历集合（例如数组）的元素。例如，示例 3-4 中的循环打印数组 `a` 中的每个元素。

文件名: src/main.rs:

```rust
fn main() {
    let a = [10, 20, 30, 40, 50];
    let mut index = 0;

    while index < 5 {
        println!("the value is: {}", a[index]);

        index += 1;
    }
}
```

示例 3-4: 使用 while 循环遍历集合中的每个元素

这里，代码对数组中的元素进行计数。它从索引 0 开始，然后循环直到到达数组中的最后一个索引（即当索引 < 5 不再成立时）。运行此代码将打印数组中的每个元素：

```rust
$ cargo run
   Compiling loops v0.1.0 (file:///projects/loops)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.32s
     Running `target/debug/loops`
the value is: 10
the value is: 20
the value is: 30
the value is: 40
the value is: 50
```

正如预期的那样，所有五个数组值都出现在终端中。尽管索引在某个时候会达到值 5，但循环会在尝试从数组中获取第六个值之前停止执行。

但是，这种方法很容易出错；如果索引值或测试条件不正确，我们可能会导致程序崩溃。例如，如果你将数组的定义更改为包含四个元素，但忘记将条件更新为 `while index < 4`，则代码 ​​ 将崩溃。它也很慢，因为编译器添加了运行时代码来执行条件检查，以确定索引是否在循环的每次迭代中位于数组的边界内。

作为一种更简洁的替代方法，你可以使用 for 循环并对集合中的每个项目执行一些代码。for 循环看起来像示例 3-5 中的代码。

文件名: src/main.rs:

```rust
fn main() {
    let a = [10, 20, 30, 40, 50];

    for element in a {
        println!("the value is: {element}");
    }
}
```

示例 3-5：使用 for 循环遍历集合中的每个元素

运行此代码时，我们将看到与示例 3-4 相同的输出。更重要的是，我们现在提高了代码的安全性，并消除了因超出数组末尾或元素不够而导致丢失某些项目而导致的错误的可能性。

使用 for 循环，如果你改变了数组中的值的数量，你不需要记住更改任何其他代码，就像使用示例 3-4 中的方法一样。

for 循环的安全性和简洁性使其成为 Rust 中最常用的循环构造。即使在你想要运行某些代码一定次数的情况下，例如示例 3-3 中使用 while 循环的倒计时示例，大多数 Rust 爱好者都会使用 for 循环。这样做的方法是使用标准库提供的 Range，它会按顺序生成所有数字，从一个数字开始，在另一个数字之前结束。

以下是使用 for 循环和另一种我们尚未讨论的方法 rev 来反转范围的倒计时：

文件名: src/main.rs:

```rust
fn main() {
    for number in (1..4).rev() {
        println!("{number}!");
    }
    println!("LIFTOFF!!!");
}
```

这段代码是不是更简洁好看一点呢？

## 总结

你成功了！这一章内容丰富：你学习了变量、标量和复合数据类型、函数、注释、if 表达式和循环！要练习本章讨论的概念，请尝试构建程序来执行以下操作：

- 在华氏温度和摄氏温度之间转换。
- 生成第 n 个斐波那契数。
- 打印圣诞颂歌“圣诞节的十二天”的歌词，利用歌曲中的重复。

当你准备好继续学习时，我们将讨论 Rust 中一个在其他编程语言中并不常见的概念：所有权。
