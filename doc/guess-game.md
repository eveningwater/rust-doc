### 编写猜一猜游戏

让我们一起动手来编写一个Rust小程序吧！在这个小程序中，我们将学到`let`关键字,`match`关键字，方法，关联的函数，以及使用的依赖（crates），甚至更多知识点。这个小程序会自动生成1~100之间的正整数，然后由用户输入数字，程序将根据用户输入的数字来进行匹配，如果用户输入错误，则提示用户数字过大或者过小，直到用户猜对为止，然后就退出小程序。

### 创建一个新项目

接下来继续使用cargo工具在你的项目根目录创建一个新项目，命令如下:

```rust
$ cargo new guessing_game
$ cd guessing_game
```

第一行命令`cargo new`表示创建一个新的项目，项目名为`guessing_game`,第二行命令则是跳转到该目录下。

接下来，看一下`cargo.toml`文件:

```rust
[package]
name = "guessing_game"
version = "0.1.0"
authors = ["Your Name <you@example.com>"]
edition = "2018"

# See more keys and their definitions at https://doc.rust-lang.org/cargo/reference/manifest.html

[dependencies]
```

如果`cargo`默认生成的信息有些不符合你的要求，可根据需要来进行修改并保存。接下来让我们继续看着`main.rs`文件，`cargo`默认会创建一个函数，然后函数体里面就是打印`hello,world!`。代码如下:

```rust
fn main(){
    println!("hello,world!");
}
```

让我们尝试用`cargo run`命令来进行调试，同样的步骤如前面所述，如下:

```rust
$ cargo run
   Compiling guessing_game v0.1.0 (file:///projects/guessing_game)
    Finished dev [unoptimized + debuginfo] target(s) in 1.50s
     Running `target/debug/guessing_game`
Hello, world!
```

接下来才是我们的重头戏，让我们重写`main.rs`文件里的代码。

### 处理用户输入的数字

首先我们需要要求用户输入信息，并且处理输入的信息，然后检查用户输入的信息是否是我们所期待的正确答案。最开始，我们需要让用户输入猜测的数字，代码如下:

```rust
use std::io;
fn main(){
    println!("猜数字游戏现在开始!")
    println!("请输入正整数!");

    let mut guess = String::new();

    io::stdin().read_line(&mut guess).expected("程序出现问题!");

    println!("你猜测的数字是:{}",guess);
}
```

这些代码包含了太多的知识点了，让我们一行一行的来分析吧！首先，为了提示用户输入并且能够打印出结果作为输出，我们需要使用`io`(input/output,输入输出)库,`io`库来自`Rust`的一个标准库，这个标准库就被叫做`std(standard library)`。

```rust
use std::io;
```

默认情况下，`Rust`会将一些类型添加进程序的作用域中，即[the prelude](https://doc.rust-lang.org/std/prelude/index.html)（这个就是指rust默认会自动引入的一些依赖列表，也可被叫做默认依赖包）。如果需要使用的类型不在这个默认依赖包中，那么我们就需要使用`use`语句来显式的引入到作用域中。使用`std::io`库会有很多有用的功能，这其中也包括我们接下来要使用到的能够允许用户输入的能力。

正如前面所介绍到的，每个`Rust`程序的入口就是`main`函数。

```rust
fn main(){}
```

`fn`语法表示声明一个函数，括号`()`内可以添加参数，但在这里是没有参数的，而`{}`则代表函数的主体，我们将要编写的所有功能代码都在这个函数主体中。

`println`则可以算作是一个集合，就是将用户输入的信息打印在终端上。

```rust
println!("猜数字游戏现在开始!")
println!("请输入正整数!");
```

这两行代码无非就是提示用户这个小程序是做什么的。

### 用变量来存储值

接下来，我们将创建一个变量用来存储用户输入的信息，代码如下:

```rust
let mut guess = String::new();
```

这个小程序变得十分有趣了！这一行代码做了很多事情，注意`let`语句是用来创建一个变量的，我们来看另一个示例代码如下:

```rust
let foo = bar;
```

这一行代码创建了一个`foo`变量，并且将变量的值赋值为`bar`.`Rust`语言的变量默认是不可变(`immutable`)的,后续会讨论[变量的可变性](https://doc.rust-lang.org/book/ch03-01-variables-and-mutability.html#variables-and-mutability)。下面的例子展示了如果在变量之前使用`mut`关键字即可让变量可变(`mutable`)。

```rust
let foo = 50;//不可变
let mut bar = 100;//可变
```

>注意：//语法就是注释语句，注释一直持续到行尾。 Rust忽略了注释中的所有内容，第3章将对此进行详细讨论。

现在我们也就知道了`let mut guess`无非就是定义一个可变的变量，变量名就叫做`guess`。而`=`右边的值就是该变量所赋的值，也就是`String::new`。这是一个函数，会返回一个`String`实例。[String](https://doc.rust-lang.org/std/string/struct.String.html)是标准库中的一种数据类型，被叫做字符串，也是`UTF-8`编码的文本类型。

`::new`中的`::`符号表示该类型关联一种函数，也就是`String`的关联函数。关联函数(在这里是`String`类型)是在类型上实现的，而不是在`String`的特定实例上实现的，在一些语言当中，也把它称作是静态方法。

`new`函数会创建一个新的空的字符串实例，你会发现在许多类型当中都会有`new`函数，因为它只是一个通用函数的名称而已，并且它会创建某种新的值。

总而言之，`let mut guess = String::new();`这一行代码就是创建一个可变的变量，并且这个变量的值是一个空的字符串实例。


