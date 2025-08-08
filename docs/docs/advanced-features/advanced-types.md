## 高级类型

Rust类型系统有一些我们到目前为止提到过但尚未讨论的功能。我们将首先讨论一般的newtype，检查为什么newtype作为类型很有用。然后我们将转向类型别名，这是一个类似于newtype但语义略有不同的功能。我们还将讨论`!`类型和动态大小类型。

## 使用Newtype模式实现类型安全和抽象

本节假设你已经阅读了前面的["使用Newtype模式在外部类型上实现外部特征"](./advanced-traits#使用newtype模式在外部类型上实现外部特征)部分。newtype模式对于我们迄今为止讨论的任务之外的任务也很有用，包括静态强制值永远不会混淆并指示值的单位。你在示例20-16中看到了使用newtype来指示单位的示例：回想一下`Millimeters`和`Meters`结构体在newtype中包装了`u32`值。如果我们编写一个参数类型为`Millimeters`的函数，我们将无法编译一个意外尝试用`Meters`类型或普通`u32`的值调用该函数的程序。

我们还可以使用newtype模式来抽象掉类型的一些实现细节：新类型可以暴露一个与私有内部类型的API不同的公共API。

Newtype也可以隐藏内部实现。例如，我们可以提供一个`People`类型来包装一个`HashMap<i32, String>`，该`HashMap`存储与其姓名关联的人员ID。使用`People`的代码只会与我们提供的公共API交互，例如向`People`集合添加姓名字符串的方法；该代码不需要知道我们在内部为姓名分配`i32` ID。newtype模式是实现封装以隐藏实现细节的轻量级方法，我们在第18章的["隐藏实现细节的封装"](../oop/what-is-oo#隐藏实现细节的封装)中讨论过这一点。

## 使用类型别名创建类型同义词

Rust提供了声明类型别名的能力，为现有类型提供另一个名称。为此我们使用`type`关键字。例如，我们可以像这样为`i32`创建别名`Kilometers`：

```rust
fn main() {
    type Kilometers = i32;

    let x: i32 = 5;
    let y: Kilometers = 5;

    println!("x + y = {}", x + y);
}
```

现在，别名`Kilometers`是`i32`的同义词；与我们在示例20-16中创建的`Millimeters`和`Meters`类型不同，`Kilometers`不是一个独立的新类型。具有`Kilometers`类型的值将被视为与`i32`类型的值相同：

```rust
fn main() {
    type Kilometers = i32;

    let x: i32 = 5;
    let y: Kilometers = 5;

    println!("x + y = {}", x + y);
}
```

因为`Kilometers`和`i32`是同一类型，我们可以添加两种类型的值，并且我们可以将`Kilometers`值传递给接受`i32`参数的函数。但是，使用这种方法，我们不会获得前面讨论的newtype模式的类型检查好处。换句话说，如果我们在某处混合了`Kilometers`和`i32`值，编译器不会给我们一个错误。

类型同义词的主要用例是减少重复。例如，我们可能有一个这样的冗长类型：

```rust
Box<dyn Fn() + Send + 'static>
```

在函数签名和类型注释中到处编写这种冗长的类型可能很繁琐且容易出错。想象一下有一个充满示例20-25中这样代码的项目。

```rust
fn main() {
    let f: Box<dyn Fn() + Send + 'static> = Box::new(|| println!("hi"));

    fn takes_long_type(f: Box<dyn Fn() + Send + 'static>) {
        // --snip--
    }

    fn returns_long_type() -> Box<dyn Fn() + Send + 'static> {
        // --snip--
        Box::new(|| ())
    }
}
```

示例20-25：在多个地方使用长类型

类型别名通过减少重复使这段代码更易于管理。在示例20-26中，我们为冗长的类型引入了一个名为`Thunk`的别名，并且可以用更短的别名`Thunk`替换该类型的所有使用。

```rust
fn main() {
    type Thunk = Box<dyn Fn() + Send + 'static>;

    let f: Thunk = Box::new(|| println!("hi"));

    fn takes_long_type(f: Thunk) {
        // --snip--
    }

    fn returns_long_type() -> Thunk {
        // --snip--
        Box::new(|| ())
    }
}
```

示例20-26：引入类型别名`Thunk`以减少重复

这段代码更容易阅读和编写！为类型别名选择一个有意义的名称也可以帮助传达你的意图（thunk是一个用于表示稍后要评估的代码的词，因此对于存储的闭包来说是一个合适的名称）。

类型别名也通常与`Result<T, E>`类型一起使用以减少重复。考虑标准库中的`std::io`模块。I/O操作通常返回`Result<T, E>`来处理操作失败的情况。这个库有一个`std::io::Error`结构体，代表所有可能的I/O错误。`std::io`中的许多函数将返回`Result<T, E>`，其中`E`是`std::io::Error`，例如`Write` trait中的这些函数：

```rust
use std::fmt;
use std::io::Error;

pub trait Write {
    fn write(&mut self, buf: &[u8]) -> Result<usize, Error>;
    fn flush(&mut self) -> Result<(), Error>;

    fn write_all(&mut self, buf: &[u8]) -> Result<(), Error>;
    fn write_fmt(&mut self, fmt: fmt::Arguments) -> Result<(), Error>;
}
```

`Result<..., Error>`重复了很多。因此，`std::io`有这个类型别名声明：

```rust
use std::fmt;

type Result<T> = std::result::Result<T, std::io::Error>;

pub trait Write {
    fn write(&mut self, buf: &[u8]) -> Result<usize>;
    fn flush(&mut self) -> Result<()>;

    fn write_all(&mut self, buf: &[u8]) -> Result<()>;
    fn write_fmt(&mut self, fmt: fmt::Arguments) -> Result<()>;
}
```

因为这个声明在`std::io`模块中，我们可以使用完全限定的别名`std::io::Result<T>`；也就是说，一个`Result<T, E>`，其中`E`被填充为`std::io::Error`。`Write` trait函数签名最终看起来像这样：

```rust
use std::fmt;

type Result<T> = std::result::Result<T, std::io::Error>;

pub trait Write {
    fn write(&mut self, buf: &[u8]) -> Result<usize>;
    fn flush(&mut self) -> Result<()>;

    fn write_all(&mut self, buf: &[u8]) -> Result<()>;
    fn write_fmt(&mut self, fmt: fmt::Arguments) -> Result<()>;
}
```

类型别名在两个方面有帮助：它使代码更容易编写，并在整个`std::io`中为我们提供一致的接口。因为它是一个别名，它只是另一个`Result<T, E>`，这意味着我们可以对其使用任何适用于`Result<T, E>`的方法，以及像`?`运算符这样的特殊语法。

## 永不返回的Never类型

Rust有一个名为`!`的特殊类型，在类型理论术语中称为空类型，因为它没有值。我们更喜欢称它为never类型，因为当函数永远不会返回时，它代表返回类型的位置。这里是一个例子：

```rust
fn bar() -> ! {
    // --snip--
    panic!();
}
```

这段代码读作"函数`bar`永不返回"。返回never的函数被称为发散函数。我们无法创建类型`!`的值，所以`bar`永远不可能返回。

但是你永远无法为其创建值的类型有什么用呢？回想一下示例2-5中的代码，数字猜测游戏的一部分；我们在示例20-27中复制了其中的一部分。

```rust
use std::cmp::Ordering;
use std::io;

use rand::Rng;

fn main() {
    println!("Guess the number!");

    let secret_number = rand::thread_rng().gen_range(1..=100);

    println!("The secret number is: {secret_number}");

    loop {
        println!("Please input your guess.");

        let mut guess = String::new();

        // --snip--

        io::stdin()
            .read_line(&mut guess)
            .expect("Failed to read line");

        let guess: u32 = match guess.trim().parse() {
            Ok(num) => num,
            Err(_) => continue,
        };

        println!("You guessed: {guess}");

        // --snip--

        match guess.cmp(&secret_number) {
            Ordering::Less => println!("Too small!"),
            Ordering::Greater => println!("Too big!"),
            Ordering::Equal => {
                println!("You win!");
                break;
            }
        }
    }
}
```

示例20-27：以`continue`结尾的`match`分支

当时，我们跳过了这段代码中的一些细节。在第6章的["`match`控制流构造"](../enums/match#match-控制流构造)中，我们讨论了`match`分支必须都返回相同的类型。所以，例如，以下代码不起作用：

```rust
fn main() {
    let guess = "3";
    let guess = match guess.trim().parse() {
        Ok(_) => 5,
        Err(_) => "hello",
    };
}
```

这段代码中`guess`的类型必须是整数和字符串，而Rust要求`guess`只有一种类型。那么`continue`返回什么呢？我们如何被允许从一个分支返回`u32`，而在示例20-27中有另一个以`continue`结尾的分支？

正如你可能已经猜到的，`continue`有一个`!`值。也就是说，当Rust计算`guess`的类型时，它查看两个`match`分支，前者有`u32`值，后者有`!`值。因为`!`永远不能有值，Rust决定`guess`的类型是`u32`。

描述这种行为的正式方式是类型`!`的表达式可以被强制转换为任何其他类型。我们被允许用`continue`结束这个`match`分支，因为`continue`不返回值；相反，它将控制权移回循环的顶部，所以在`Err`情况下，我们从不为`guess`分配值。

never类型对`panic!`宏也很有用。回想一下我们在`Option<T>`值上调用的`unwrap`函数，用这个定义产生一个值或panic：

```rust
enum Option<T> {
    Some(T),
    None,
}

use crate::Option::*;

impl<T> Option<T> {
    pub fn unwrap(self) -> T {
        match self {
            Some(val) => val,
            None => panic!("called `Option::unwrap()` on a `None` value"),
        }
    }
}
```

在这段代码中，发生了与示例20-27中的`match`相同的事情：Rust看到`val`有类型`T`，`panic!`有类型`!`，所以整个`match`表达式的结果是`T`。这段代码有效，因为`panic!`不产生值；它结束程序。在`None`情况下，我们不会从`unwrap`返回值，所以这段代码是有效的。

一个具有类型`!`的最后表达式是`loop`：

```rust
fn main() {
    print!("forever ");

    loop {
        print!("and ever ");
    }
}
```

这里，循环永远不会结束，所以`!`是表达式的值。但是，如果我们包含一个`break`，这就不会为真，因为当到达`break`时循环会终止。

## 动态大小类型和Sized trait

Rust需要了解其类型的某些细节，例如为特定类型的值分配多少空间。这让其类型系统的一个角落起初有点令人困惑：动态大小类型的概念。有时称为DST或无大小类型，这些类型让我们编写使用只能在运行时知道大小的值的代码。

让我们深入了解一个叫做`str`的动态大小类型的细节，我们在整本文档中一直在使用它。没错，不是`&str`，而是`str`本身，是一个DST。我们无法知道字符串有多长，直到运行时，这意味着我们无法创建类型为`str`的变量，也无法接受类型为`str`的参数。考虑以下不起作用的代码：

```rust
fn main() {
    let s1: str = "Hello there!";
    let s2: str = "How's it going?";
}
```

Rust需要知道为特定类型的任何值分配多少内存，并且一个类型的所有值必须使用相同数量的内存。如果Rust允许我们编写这段代码，这两个`str`值将需要占用相同数量的空间。但它们有不同的长度：`s1`需要12字节的存储空间，`s2`需要15字节。这就是为什么不可能创建持有动态大小类型的变量。

那么我们该怎么办？在这种情况下，你已经知道答案：我们让`s1`和`s2`的类型是`&str`而不是`str`。回想第4章["字符串切片"](../understand-ownership/slice-type#字符串切片)中，切片数据结构只存储切片的起始位置和长度。所以虽然`&T`是存储`T`所在内存地址的单个值，`&str`是两个值：`str`的地址和其长度。因此，我们可以在编译时知道`&str`值的大小：它是`usize`长度的两倍。也就是说，我们总是知道`&str`的大小，无论它引用的字符串有多长。一般来说，这是在Rust中使用动态大小类型的方式：它们有一个额外的元数据位，用于存储动态信息的大小。动态大小类型的黄金法则是我们必须始终将动态大小类型的值放在某种指针后面。

我们可以将`str`与各种指针组合：例如，`Box<str>`或`Rc<str>`。实际上，你以前见过这种情况，但使用的是不同的动态大小类型：`trait`。每个`trait`都是一个动态大小类型，我们可以通过使用`trait`的名称来引用它。在第18章的["使用trait对象来允许不同类型的值"](../oop/trait-objects#使用特征对象来允许不同类型的值)中，我们提到要将`trait`用作trait对象，我们必须将它们放在指针后面，例如`&dyn Trait`或`Box<dyn Trait>`（`Rc<dyn Trait>`也可以）。

为了处理DST，Rust提供了`Sized` trait来确定类型的大小在编译时是否已知。这个`trait`会自动为编译时大小已知的所有类型实现。此外，Rust隐式地为每个泛型函数添加了对`Sized`的约束。也就是说，像这样的泛型函数定义：

```rust
fn generic<T>(t: T) {
    // --snip--
}
```

实际上被视为我们写成这样：

```rust
fn generic<T: Sized>(t: T) {
    // --snip--
}
```

默认情况下，泛型函数只适用于在编译时具有已知大小的类型。但是，你可以使用以下特殊语法来放松这个限制：

```rust
fn generic<T: ?Sized>(t: &T) {
    // --snip--
}
```

对`?Sized`的trait约束意味着"`T`可能是也可能不是`Sized`"，这种表示法覆盖了泛型类型必须在编译时具有已知大小的默认值。具有这种含义的`?Trait`语法只对`Sized`可用，不适用于任何其他`trait`。

还要注意，我们将`t`参数的类型从`T`切换到`&T`。因为类型可能不是`Sized`，我们需要在某种指针后面使用它。在这种情况下，我们选择了引用。

接下来，我们将讨论函数和闭包！

