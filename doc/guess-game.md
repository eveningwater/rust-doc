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

回想一下在程序的第一行代码中，我们通过使用`use std::io;`语句来从标准库中获取到的有关用户输入输出的关联函数，现在我们从`io`模块中调用`stdin`函数。如下:

```rust
    io::stdin().read_line(&mut guess);
```

如果我们在程序的开头的代码中并没有写`use std::io;`，我们在这里调用这个函数的时候需要重写成`std::io::stdin`。`stdin`是一个返回类型为[std::io::stdin](https://doc.rust-lang.org/std/io/struct.Stdin.html)的实例，也就是一种类型，代表着为你的终端处理标准的输出。

下一部分代码,`.read_line(&mut guess)`,调用[read_line](https://doc.rust-lang.org/std/io/struct.Stdin.html#method.read_line)方法在标准输入中获取并处理用户的输入。我们也为`read_line`方法传递了一个参数:`&mut guess`。

`read_line`的工作就是将用户输入的任何内容带入标准输入库中，并放置到字符串中，所以它将该字符串作为参数。字符串参数必须是可变，因此可以通过添加用户的输入来更改字符串的内容。

`&`标识符代表参数是引用，它为我们提供了一种方式，也就是我们的代码的很多地方都可以访问到一条数据，也因此不需要做复制数据到内存中的操作。引用是一种复杂的特性，使用引用也比较安全和便捷，这也是`Rust`的主要优势之一。我们并不需要为了完成这个程序而了解引用的太多细节，现在我们需要知道的就像变量，引用默认是不可变的
因此我们需要写`&mut guess`而不是`&guess`来让变量可变。（第4章会解释引用的更多信息。）

### 使用返回的结果来处理潜在的故障

我们接着讨论一下第三行代码，也是属于这一部分的代码，它是一个方法:

```rust
 expect("调用read_line失败!");
```

当我们使用类似`.foo()`的格式来调用方法时，最明智的做法就是引入换行符或者是其它空格来将很长的一行代码进行分隔，因此我们需要重写如上的代码如下:

```rust
   io::stdin().read_line(&mut guess).expect("调用read_line失败!");
```

然而这样很长的一行是很难阅读的，所以最好要分割它。现在我们来讨论一下这一行都做了什么。

正如更早之前所提到的，`read_line`将用户键入的内容放入我们要传递的字符串中，但它还会返回一个值，在这种情况下为[io::Result](https://doc.rust-lang.org/std/io/type.Result.html)。`Rust`在它的标准库(一种通用的[Result](https://doc.rust-lang.org/std/result/enum.Result.html)也作为一个特殊的版本的子模块，就像`io::Result`)中有一种数值类型叫做`Result`。

`Result`是可以进行[枚举](https://doc.rust-lang.org/book/ch06-00-enums.html)操作的，通常也被作为枚举来提及。一个枚举值也是一个类型可以有许多被修复和设置的值，并且这些值通常也被叫做枚举的变体。第六章会详细介绍枚举。

> 变体，也可以把它理解为回调函数吧。

对于`Result`，通常变体就是`Ok`或者`Err`。



