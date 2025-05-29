## 通过`Deref`特性将智能指针视为常规引用

实现`Deref`特性允许你自定义解引用运算符`*`的行为（不要与乘法或通配符运算符混淆）。通过以特定方式实现`Deref`，使智能指针能够像常规引用一样使用，你可以编写操作引用的代码，并将该代码用于智能指针。

让我们首先看看解引用运算符如何与常规引用一起工作。然后我们将尝试定义一个行为类似于`Box<T>`的自定义类型，并了解为什么解引用运算符在我们新定义的类型上不能像引用那样工作。我们将探索如何实现`Deref`特性，使智能指针能够以类似于引用的方式工作。然后我们将了解Rust的解引用强制转换功能，以及它如何让我们使用引用或智能指针。

> 注意：我们即将构建的`MyBox<T>`类型与真正的`Box<T>`有一个很大的区别：我们的版本不会在堆上存储数据。我们在这个例子中专注于Deref，所以数据实际存储在哪里不如指针般的行为重要。

### 跟随指针到值

常规引用是一种指针，可以将指针想象为指向存储在其他地方的值的箭头。在示例15-6中，我们创建了一个指向`i32`值的引用，然后使用解引用运算符跟随该引用到其指向的值。

文件名: src/main.rs:

```rust
fn main() {
    let x = 5;
    let y = &x;

    assert_eq!(5, x);
    assert_eq!(5, *y);
}
```

示例15-6：使用解引用运算符跟随引用到`i32`值

变量`x`持有一个`i32`值`5`。我们将`y`设置为指向`x`的引用。我们可以断言`x`等于`5`。然而，如果我们想对`y`中的值进行断言，我们必须使用`*y`来跟随引用到它所指向的值（即解引用），这样编译器才能比较实际的值。一旦我们解引用`y`，我们就可以访问`y`所指向的整数值，并将其与`5`进行比较。

如果我们尝试写成`assert_eq!(5, y)`，则会得到这样的编译错误：

```rust
$ cargo run
   Compiling deref-example v0.1.0 (file:///projects/deref-example)
error[E0277]: can't compare `{integer}` with `&{integer}`
 --> src/main.rs:6:5
  |
6 |     assert_eq!(5, y);
  |     ^^^^^^^^^^^^^^^^ no implementation for `{integer} == &{integer}`
  |
  = help: the trait `PartialEq<&{integer}>` is not implemented for `{integer}`
  = note: this error originates in the macro `assert_eq` (in Nightly builds, run with -Z macro-backtrace for more info)
help: consider dereferencing here
 --> file:///home/.rustup/toolchains/1.85/lib/rustlib/src/rust/library/core/src/macros/mod.rs:46:35
  |
46|                 if !(*left_val == **right_val) {
  |                                   +

For more information about this error, try `rustc --explain E0277`.
error: could not compile `deref-example` (bin "deref-example") due to 1 previous error
```

比较数字和数字的引用是不允许的，因为它们是不同的类型。我们必须使用解引用运算符来跟随引用到它所指向的值。

### 像引用一样使用`Box<T>`

我们可以重写示例15-6中的代码，使用`Box<T>`而不是引用；在示例15-7中对`Box<T>`使用的解引用运算符的功能与示例15-6中对引用使用的解引用运算符相同：

文件名: src/main.rs:

```rust
fn main() {
    let x = 5;
    let y = Box::new(x);

    assert_eq!(5, x);
    assert_eq!(5, *y);
}
```

示例15-7：对`Box<i32>`使用解引用运算符

示例15-7和示例15-6之间的主要区别是，这里我们将`y`设置为一个指向`x`的复制值的box实例，而不是指向`x`值的引用。在最后的断言中，我们可以使用解引用运算符来跟随box的指针，就像`y`是引用时我们所做的那样。接下来，我们将探索`Box<T>`的特殊之处，它使我们能够通过定义自己的类型来使用解引用运算符。

### 定义我们自己的智能指针

让我们构建一个类似于标准库提供的`Box<T>`类型的智能指针，以体验智能指针在默认情况下与引用的行为差异。然后我们将看看如何添加使用解引用运算符的能力。

最终，`Box<T>`类型被定义为一个只有一个元素的元组结构体，所以示例15-8以相同的方式定义了一个`MyBox<T>`类型。我们还将定义一个`new`函数，以匹配`Box<T>`上定义的`new`函数。

文件名: src/main.rs:

```rust
struct MyBox<T>(T);

impl<T> MyBox<T> {
    fn new(x: T) -> MyBox<T> {
        MyBox(x)
    }
}

fn main() {}
```

示例15-8：定义一个`MyBox<T>`类型

我们定义了一个名为`MyBox`的结构体，并声明了一个泛型参数`T`，因为我们希望我们的类型能够持有任何类型的值。`MyBox`类型是一个具有一个类型为`T`的元素的元组结构体。`MyBox::new`函数接受一个类型为`T`的参数，并返回一个持有传入值的`MyBox`实例。

让我们尝试将示例15-7中的`main`函数添加到示例15-8中，并将其更改为使用我们定义的`MyBox<T>`类型而不是`Box<T>`。示例15-9中的代码将无法编译，因为Rust不知道如何解引用`MyBox`。

文件名: src/main.rs:

```rust
struct MyBox<T>(T);

impl<T> MyBox<T> {
    fn new(x: T) -> MyBox<T> {
        MyBox(x)
    }
}

fn main() {
    let x = 5;
    let y = MyBox::new(x);

    assert_eq!(5, x);
    assert_eq!(5, *y);
}
```

示例15-9：尝试以与引用和`Box<T>`相同的方式使用`MyBox<T>`

这是产生的编译错误：

```rust
$ cargo run
   Compiling deref-example v0.1.0 (file:///projects/deref-example)
error[E0614]: type `MyBox<{integer}>` cannot be dereferenced
  --> src/main.rs:14:19
   |
14 |     assert_eq!(5, *y);
   |                   ^^

For more information about this error, try `rustc --explain E0614`.
error: could not compile `deref-example` (bin "deref-example") due to 1 previous error
```

我们的`MyBox<T>`类型不能被解引用，因为我们没有在我们的类型上实现该能力。要启用使用`*`运算符的解引用，我们需要实现`Deref`特性。

### 实现`Deref`特性

正如第10章中的"[在类型上实现特性](../generics/traits#在类型上实现特性)"所讨论的，要实现一个特性，我们需要为该特性的必需方法提供实现。标准库提供的Deref特性要求我们实现一个名为deref的方法，该方法借用self并返回对内部数据的引用。示例15-10包含了要添加到MyBox<T>定义中的Deref实现。

文件名: src/main.rs:

```rust
use std::ops::Deref;

impl<T> Deref for MyBox<T> {
    type Target = T;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

struct MyBox<T>(T);

impl<T> MyBox<T> {
    fn new(x: T) -> MyBox<T> {
        MyBox(x)
    }
}

fn main() {
    let x = 5;
    let y = MyBox::new(x);

    assert_eq!(5, x);
    assert_eq!(5, *y);
}
```

示例15-10：在MyBox<T>上实现Deref
`type Target = T;`语法为Deref特性定义了一个关联类型。关联类型是声明泛型参数的一种略微不同的方式，但现在你不需要担心它们；我们将在第20章中更详细地介绍它们。

我们用`&self.0`填充deref方法的主体，这样deref就会返回一个对我们想要用`*`运算符访问的值的引用；回想一下第5章中的"使用没有命名字段的元组结构体创建不同的类型"，`.0`访问元组结构体中的第一个值。示例15-9中调用`*`的MyBox<T>值的main函数现在可以编译了，断言也通过了！

没有Deref特性，编译器只能解引用`&`引用。deref方法使编译器能够获取任何实现Deref的类型的值，并调用deref方法来获取一个它知道如何解引用的`&`引用。

当我们在示例15-9中输入`*y`时，Rust在幕后实际上运行了这段代码：

```rust
*(y.deref())
```

Rust将`*`运算符替换为对deref方法的调用，然后进行普通的解引用，这样我们就不必考虑是否需要调用deref方法。这个Rust功能让我们能够编写功能相同的代码，无论我们有的是普通引用还是实现了Deref的类型。

deref方法返回值的引用，以及在`*(y.deref())`中括号外的普通解引用仍然是必要的，这与所有权系统有关。如果deref方法直接返回值而不是对值的引用，那么值将从self中移出。在这种情况下，或者在我们使用解引用运算符的大多数情况下，我们不想获取MyBox<T>内部值的所有权。

请注意，每次我们在代码中使用`*`时，`*`运算符都会被替换为对deref方法的调用，然后只调用一次`*`运算符。由于`*`运算符的替换不会无限递归，我们最终得到的是类型为i32的数据，这与示例15-9中assert_eq!中的5相匹配。

### 函数和方法的隐式解引用强制转换

解引用强制转换将实现了`Deref`特性的类型的引用转换为另一种类型的引用。例如，解引用强制转换可以将`&String`转换为`&str`，因为`String`实现了`Deref`特性，使其返回`&str`。解引用强制转换是Rust对函数和方法的参数执行的一种便利操作，它只适用于实现了`Deref`特性的类型。当我们将特定类型值的引用作为参数传递给函数或方法，而该参数类型与函数或方法定义中的参数类型不匹配时，它会自动发生。对`deref`方法的一系列调用将我们提供的类型转换为参数需要的类型。

Rust添加解引用强制转换是为了让程序员在编写函数和方法调用时不需要添加太多显式的引用和解引用，如`&`和`*`。解引用强制转换功能还允许我们编写更多可以同时适用于引用或智能指针的代码。

要看到解引用强制转换的实际效果，让我们使用我们在示例15-8中定义的`MyBox<T>`类型以及我们在示例15-10中添加的`Deref`实现。示例15-11显示了一个具有字符串切片参数的函数的定义。

文件名: src/main.rs:

```rust
fn hello(name: &str) {
    println!("Hello, {name}!");
}

fn main() {}
```

示例15-11：一个具有类型为`&str`的参数`name`的`hello`函数

我们可以用字符串切片作为参数调用`hello`函数，例如`hello("Rust");`。解引用强制转换使得可以用`MyBox<String>`类型的值的引用调用`hello`，如示例15-12所示。

文件名: src/main.rs:

```rust
use std::ops::Deref;

impl<T> Deref for MyBox<T> {
    type Target = T;

    fn deref(&self) -> &T {
        &self.0
    }
}

struct MyBox<T>(T);

impl<T> MyBox<T> {
    fn new(x: T) -> MyBox<T> {
        MyBox(x)
    }
}

fn hello(name: &str) {
    println!("Hello, {name}!");
}

fn main() {
    let m = MyBox::new(String::from("Rust"));
    hello(&m);
}
```

示例15-12：用`MyBox<String>`值的引用调用`hello`，这是因为解引用强制转换起作用

这里我们用参数`&m`调用`hello`函数，它是一个指向`MyBox<String>`值的引用。因为我们在示例15-10中为`MyBox<T>`实现了`Deref`特性，Rust可以通过调用`deref`将`&MyBox<String>`转换为`&String`。标准库在`String`上提供了`Deref`的实现，它返回一个字符串切片，这在`Deref`的API文档中有说明。Rust再次调用`deref`将`&String`转换为`&str`，这与`hello`函数的定义相匹配。

如果Rust没有实现解引用强制转换，我们就必须编写示例15-13中的代码，而不是示例15-12中的代码，来用`&MyBox<String>`类型的值调用`hello`。

文件名: src/main.rs:

```rust
use std::ops::Deref;

impl<T> Deref for MyBox<T> {
    type Target = T;

    fn deref(&self) -> &T {
        &self.0
    }
}

struct MyBox<T>(T);

impl<T> MyBox<T> {
    fn new(x: T) -> MyBox<T> {
        MyBox(x)
    }
}

fn hello(name: &str) {
    println!("Hello, {name}!");
}

fn main() {
    let m = MyBox::new(String::from("Rust"));
    hello(&(*m)[..]);
}
```

示例15-13：如果Rust没有解引用强制转换，我们必须编写的代码

`(*m)`将`MyBox<String>`解引用为`String`。然后`&`和`[..]`获取`String`的字符串切片，该切片等于整个字符串，以匹配`hello`的签名。没有解引用强制转换的代码更难阅读、编写和理解，因为涉及所有这些符号。解引用强制转换允许Rust自动为我们处理这些转换。

当为涉及的类型定义了`Deref`特性时，Rust将分析类型并根据需要多次使用`Deref::deref`来获取与参数类型匹配的引用。需要插入`Deref::deref`的次数在编译时解析，所以利用解引用强制转换没有运行时惩罚！

### 解引用强制转换如何与可变性交互

类似于使用`Deref`特性来重写不可变引用上的`*`运算符，你可以使用`DerefMut`特性来重写可变引用上的`*`运算符。

Rust在找到类型和特性实现时，在三种情况下进行解引用强制转换：

1. 当`T: Deref<Target=U>`时，从`&T`到`&U`
2. 当`T: DerefMut<Target=U>`时，从`&mut T`到`&mut U`
3. 当`T: Deref<Target=U>`时，从`&mut T`到`&U`

前两种情况是相同的，只是第二种实现了可变性。第一种情况表明，如果你有一个`&T`，并且`T`实现了对某种类型`U`的`Deref`，你可以透明地获得一个`&U`。第二种情况表明，对于可变引用，同样的解引用强制转换也会发生。

第三种情况更复杂：Rust还会将可变引用强制转换为不可变引用。但反过来是不可能的：不可变引用永远不会强制转换为可变引用。由于借用规则，如果你有一个可变引用，那么该可变引用必须是对该数据的唯一引用（否则，程序将无法编译）。将一个可变引用转换为一个不可变引用永远不会破坏借用规则。将不可变引用转换为可变引用将要求初始不可变引用是对该数据的唯一不可变引用，但借用规则不保证这一点。因此，Rust不能假设将不可变引用转换为可变引用是可能的。