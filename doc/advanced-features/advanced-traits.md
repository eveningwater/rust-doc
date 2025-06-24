## 高级特征

我们在第10章的["特征：定义共享行为"](../generics/traits#特性traits定义共享行为)中首次介绍了特征，但我们没有讨论更高级的细节。现在你对Rust了解得更多了，我们可以深入探讨其精髓。

### 关联类型

关联类型将一个类型占位符与`trait`连接起来，使得`trait`方法定义可以在其签名中使用这些占位符类型。`trait`的实现者将指定用于特定实现的占位符类型的具体类型。这样，我们可以定义一个使用某些类型的`trait`，而无需在实现`trait`之前确切知道这些类型是什么。

我们在本章中描述的大多数高级功能很少被需要。关联类型介于中间：它们的使用频率比本书其余部分解释的功能要低，但比本章讨论的许多其他功能更常见。

一个带有关联类型的`trait`示例是标准库提供的`Iterator` trait。关联类型名为`Item`，代表实现`Iterator` trait的类型正在迭代的值的类型。`Iterator` trait的定义如示例20-13所示。

```rust
pub trait Iterator {
    type Item;

    fn next(&mut self) -> Option<Self::Item>;
}
```

示例20-13：带有关联类型`Item`的`Iterator` trait定义

类型`Item`是一个占位符，`next`方法的定义显示它将返回`Option<Self::Item>`类型的值。`Iterator` trait的实现者将为`Item`指定具体类型，`next`方法将返回包含该具体类型值的`Option`。

关联类型可能看起来与泛型类似的概念，因为后者允许我们定义一个函数而不指定它可以处理什么类型。为了检查这两个概念之间的差异，我们将看一个在名为`Counter`的类型上实现`Iterator` trait的示例，该类型指定`Item`类型为`u32`：

文件名：src/lib.rs：

```rust
struct Counter {
    count: u32,
}

impl Counter {
    fn new() -> Counter {
        Counter { count: 0 }
    }
}

impl Iterator for Counter {
    type Item = u32;

    fn next(&mut self) -> Option<Self::Item> {
        // --snip--
        if self.count < 5 {
            self.count += 1;
            Some(self.count)
        } else {
            None
        }
    }
}
```

这种语法看起来与泛型的语法相当。那么为什么不像示例20-14那样用泛型定义`Iterator` trait呢？

```rust
pub trait Iterator<T> {
    fn next(&mut self) -> Option<T>;
}
```

示例20-14：使用泛型的`Iterator` trait的假设定义

区别在于，当使用泛型时，如示例20-14所示，我们必须在每个实现中注释类型；因为我们也可以为`Counter`实现`Iterator<String>`或任何其他类型，所以我们可能有`Counter`的多个`Iterator`实现。换句话说，当`trait`有泛型参数时，它可以为一个类型实现多次，每次改变泛型类型参数的具体类型。当我们在`Counter`上使用`next`方法时，我们必须提供类型注释来指示我们想要使用`Iterator`的哪个实现。

使用关联类型，我们不需要注释类型，因为我们不能为一个类型多次实现`trait`。在示例20-13中使用关联类型的定义中，我们只能选择`Item`的类型一次，因为只能有一个`impl Iterator for Counter`。我们不必指定我们想要在`Counter`上调用`next`的每个地方都要一个`u32`值的迭代器。

关联类型也成为`trait`契约的一部分：`trait`的实现者必须提供一个类型来代替关联类型占位符。关联类型通常有一个描述类型如何使用的名称，在API文档中记录关联类型是一个好习惯。

### 默认泛型类型参数和运算符重载

当我们使用泛型类型参数时，我们可以为泛型类型指定一个默认的具体类型。如果默认类型有效，这消除了`trait`实现者指定具体类型的需要。你在声明泛型类型时使用`<PlaceholderType=ConcreteType>`语法指定默认类型。

这种技术有用的一个很好的例子是运算符重载，在其中你可以在特定情况下自定义运算符（如`+`）的行为。

Rust不允许你创建自己的运算符或重载任意运算符。但你可以通过实现与运算符相关的`trait`来重载`std::ops`中列出的操作和相应的`trait`。例如，在示例20-15中，我们重载`+`运算符来将两个`Point`实例相加。我们通过在`Point`结构体上实现`Add` trait来做到这一点。

文件名：src/main.rs：

```rust
use std::ops::Add;

#[derive(Debug, Copy, Clone, PartialEq)]
struct Point {
    x: i32,
    y: i32,
}

impl Add for Point {
    type Output = Point;

    fn add(self, other: Point) -> Point {
        Point {
            x: self.x + other.x,
            y: self.y + other.y,
        }
    }
}

fn main() {
    assert_eq!(
        Point { x: 1, y: 0 } + Point { x: 2, y: 3 },
        Point { x: 3, y: 3 }
    );
}
```

示例20-15：实现`Add` trait来重载`Point`实例的`+`运算符

`add`方法将两个`Point`实例的`x`值和两个`Point`实例的`y`值相加以创建一个新的`Point`。`Add` trait有一个名为`Output`的关联类型，它确定从`add`方法返回的类型。

此代码中的默认泛型类型在`Add` trait内。这是它的定义：

```rust
#![allow(unused)]
fn main() {
    trait Add<Rhs=Self> {
        type Output;

        fn add(self, rhs: Rhs) -> Self::Output;
    }
}
```

这段代码看起来应该很熟悉：一个有一个方法和一个关联类型的`trait`。新的部分是`Rhs=Self`：这种语法称为默认类型参数。`Rhs`泛型类型参数（"right-hand side"的缩写）定义了`add`方法中`rhs`参数的类型。如果我们在实现`Add` trait时不为`Rhs`指定具体类型，`Rhs`的类型将默认为`Self`，这将是我们实现`Add`的类型。

当我们为`Point`实现`Add`时，我们使用了`Rhs`的默认值，因为我们想要添加两个`Point`实例。让我们看一个实现`Add` trait的例子，我们想要自定义`Rhs`类型而不是使用默认值。

我们有两个结构体，`Millimeters`和`Meters`，保存不同单位的值。这种将现有类型包装在另一个结构体中的薄包装称为newtype模式，我们在["使用Newtype模式在外部类型上实现外部特征"](#使用newtype模式在外部类型上实现外部特征)部分中更详细地描述了它。我们想要将以毫米为单位的值添加到以米为单位的值中，并让`Add`的实现正确地进行转换。我们可以为`Millimeters`实现`Add`，将`Meters`作为`Rhs`，如示例20-16所示。

文件名：src/lib.rs：

```rust
use std::ops::Add;

struct Millimeters(u32);
struct Meters(u32);

impl Add<Meters> for Millimeters {
    type Output = Millimeters;

    fn add(self, other: Meters) -> Millimeters {
        Millimeters(self.0 + (other.0 * 1000))
    }
}
```

示例20-16：在`Millimeters`上实现`Add` trait以将`Millimeters`添加到`Meters`

为了添加`Millimeters`和`Meters`，我们指定`impl Add<Meters>`来设置`Rhs`类型参数的值，而不是使用`Self`的默认值。

你将在两种主要方式中使用默认类型参数：

1. 在不破坏现有代码的情况下扩展类型
2. 在大多数用户不需要的特定情况下允许自定义

标准库的`Add` trait是第二个目的的一个例子：通常，你会添加两个相同的类型，但`Add` trait提供了超越这一点的自定义能力。在`Add` trait定义中使用默认类型参数意味着你在大多数时候不必指定额外的参数。换句话说，不需要一点实现样板，使得使用`trait`更容易。

第一个目的类似于第二个，但相反：如果你想要向现有`trait`添加类型参数，你可以给它一个默认值，以允许扩展`trait`的功能而不破坏现有的实现代码。

### 在同名方法之间进行消歧

Rust中没有什么阻止`trait`拥有与另一个`trait`方法同名的方法，Rust也不阻止你在一个类型上实现两个`trait`。也可以直接在类型上实现一个与`trait`方法同名的方法。

当调用同名方法时，你需要告诉Rust你想要使用哪一个。考虑示例20-17中的代码，我们定义了两个`trait`，`Pilot`和`Wizard`，它们都有一个名为`fly`的方法。然后我们在已经实现了名为`fly`的方法的`Human`类型上实现这两个`trait`。每个`fly`方法做不同的事情。

文件名：src/main.rs：

```rust
trait Pilot {
    fn fly(&self);
}

trait Wizard {
    fn fly(&self);
}

struct Human;

impl Pilot for Human {
    fn fly(&self) {
        println!("This is your captain speaking.");
    }
}

impl Wizard for Human {
    fn fly(&self) {
        println!("Up!");
    }
}

impl Human {
    fn fly(&self) {
        println!("*waving arms furiously*");
    }
}

fn main() {}
```

示例20-17：定义了两个具有方法的`trait`并在`Human`类型上实现，同时直接在`Human`上实现了一个`fly`方法

当我们在`Human`的实例上调用`fly`时，编译器默认调用直接在类型上实现的方法，如示例20-18所示。

文件名：src/main.rs：

```rust
trait Pilot {
    fn fly(&self);
}

trait Wizard {
    fn fly(&self);
}

struct Human;

impl Pilot for Human {
    fn fly(&self) {
        println!("This is your captain speaking.");
    }
}

impl Wizard for Human {
    fn fly(&self) {
        println!("Up!");
    }
}

impl Human {
    fn fly(&self) {
        println!("*waving arms furiously*");
    }
}

fn main() {
    let person = Human;
    person.fly();
}
```

示例20-18：在`Human`的实例上调用`fly`

运行此代码将打印`*waving arms furiously*`，显示Rust调用了直接在`Human`上实现的`fly`方法。

要调用`Pilot` trait或`Wizard` trait中的`fly`方法，我们需要使用更明确的语法来指定我们的意思是哪个`fly`方法。示例20-19演示了这种语法。

文件名：src/main.rs：

```rust
trait Pilot {
    fn fly(&self);
}

trait Wizard {
    fn fly(&self);
}

struct Human;

impl Pilot for Human {
    fn fly(&self) {
        println!("This is your captain speaking.");
    }
}

impl Wizard for Human {
    fn fly(&self) {
        println!("Up!");
    }
}

impl Human {
    fn fly(&self) {
        println!("*waving arms furiously*");
    }
}

fn main() {
    let person = Human;
    Pilot::fly(&person);
    Wizard::fly(&person);
    person.fly();
}
```

示例20-19：指定我们想要调用哪个`trait`的`fly`方法

在方法名前指定`trait`名向Rust澄清了我们想要调用`fly`的哪个实现。我们也可以写`Human::fly(&person)`，这等同于我们在示例20-19中使用的`person.fly()`，但如果我们不需要消歧，这写起来有点长。

运行此代码打印以下内容：

```rust
$ cargo run
   Compiling traits-example v0.1.0 (file:///projects/traits-example)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.46s
     Running `target/debug/traits-example`
This is your captain speaking.
Up!
*waving arms furiously*
```

因为`fly`方法接受一个`self`参数，如果我们有两个都实现一个`trait`的类型，Rust可以根据`self`的类型弄清楚要使用`trait`的哪个实现。

然而，不是方法的关联函数没有`self`参数。当有多个类型或`trait`定义具有相同函数名的非方法函数时，除非你使用完全限定语法，否则Rust并不总是知道你的意思是哪种类型。例如，在示例20-20中，我们为想要给所有小狗命名为`Spot`的动物收容所创建一个`trait`。我们创建一个带有关联非方法函数`baby_name`的`Animal` trait。`Animal` trait为`Dog`结构体实现，我们也在其上直接提供关联非方法函数`baby_name`。

文件名：src/main.rs：

```rust
trait Animal {
    fn baby_name() -> String;
}

struct Dog;

impl Dog {
    fn baby_name() -> String {
        String::from("Spot")
    }
}

impl Animal for Dog {
    fn baby_name() -> String {
        String::from("puppy")
    }
}

fn main() {
    println!("A baby dog is called a {}", Dog::baby_name());
}
```

示例20-20：一个带有关联函数的`trait`和一个具有同名关联函数且也实现该`trait`的类型

我们在`Dog`上定义的`baby_name`关联函数中实现了将所有小狗命名为`Spot`的代码。`Dog`类型也实现了`Animal` trait，该`trait`描述了所有动物都具有的特征。小狗被称为puppies，这在`Dog`上`Animal` trait的实现中的与`Animal` trait关联的`baby_name`函数中表达。

在`main`中，我们调用`Dog::baby_name`函数，它调用直接在`Dog`上定义的关联函数。此代码打印以下内容：

```rust
$ cargo run
   Compiling traits-example v0.1.0 (file:///projects/traits-example)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.54s
     Running `target/debug/traits-example`
A baby dog is called a Spot
```

这个输出不是我们想要的。我们想要调用作为我们在`Dog`上实现的`Animal` trait一部分的`baby_name`函数，这样代码就会打印A baby dog is called a puppy。我们在示例20-19中使用的指定`trait`名的技术在这里没有帮助；如果我们将`main`更改为示例20-21中的代码，我们将得到编译错误。

文件名：src/main.rs：

```rust
trait Animal {
    fn baby_name() -> String;
}

struct Dog;

impl Dog {
    fn baby_name() -> String {
        String::from("Spot")
    }
}

impl Animal for Dog {
    fn baby_name() -> String {
        String::from("puppy")
    }
}

fn main() {
    println!("A baby dog is called a {}", Animal::baby_name());
}
```

示例20-21：尝试调用`Animal` trait中的`baby_name`函数，但Rust不知道要使用哪个实现

因为`Animal::baby_name`没有`self`参数，并且可能有其他实现`Animal` trait的类型，Rust无法弄清楚我们想要`Animal::baby_name`的哪个实现。我们将得到这个编译器错误：

```rust
$ cargo run
   Compiling traits-example v0.1.0 (file:///projects/traits-example)
error[E0790]: cannot call associated function on trait without specifying the corresponding `impl` type
  --> src/main.rs:20:43
   |
2  |     fn baby_name() -> String;
   |     ------------------------- `Animal::baby_name` defined here
...
20 |     println!("A baby dog is called a {}", Animal::baby_name());
   |                                           ^^^^^^^^^^^^^^^^^^^ cannot call associated function of trait
   |
help: use the fully-qualified path to the only available implementation
   |
20 |     println!("A baby dog is called a {}", <Dog as Animal>::baby_name());
   |                                           +++++++       +

For more information about this error, try `rustc --explain E0790`.
error: could not compile `traits-example` (bin "traits-example") due to 1 previous error
```

为了消歧并告诉Rust我们想要使用`Dog`的`Animal`实现而不是某些其他类型的`Animal`实现，我们需要使用完全限定语法。示例20-22演示了如何使用完全限定语法。

文件名：src/main.rs：

```rust
trait Animal {
    fn baby_name() -> String;
}

struct Dog;

impl Dog {
    fn baby_name() -> String {
        String::from("Spot")
    }
}

impl Animal for Dog {
    fn baby_name() -> String {
        String::from("puppy")
    }
}

fn main() {
    println!("A baby dog is called a {}", <Dog as Animal>::baby_name());
}
```

示例20-22：使用完全限定语法指定我们想要调用`Dog`上实现的`Animal` trait中的`baby_name`函数

我们在尖括号中为Rust提供了类型注释，它指示我们想要调用`Animal` trait中的`baby_name`方法，如在`Dog`上实现的那样，通过说我们想要在这个函数调用中将`Dog`类型视为`Animal`。此代码现在将打印我们想要的内容：

```rust
$ cargo run
   Compiling traits-example v0.1.0 (file:///projects/traits-example)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.48s
     Running `target/debug/traits-example`
A baby dog is called a puppy
```

一般来说，完全限定语法定义如下：

```rust
<Type as Trait>::function(receiver_if_method, next_arg, ...);
```

对于不是方法的关联函数，不会有接收者：只会有其他参数的列表。你可以在调用函数或方法的任何地方使用完全限定语法。然而，你被允许省略Rust可以从程序中的其他信息推断出的这种语法的任何部分。你只需要在有多个使用相同名称的实现且Rust需要帮助来识别你想要调用哪个实现的情况下使用这种更冗长的语法。

### 使用超特征

有时你可能会编写一个依赖于另一个`trait`的`trait`定义：为了让类型实现第一个`trait`，你想要要求该类型也实现第二个`trait`。你这样做是为了让你的`trait`定义可以使用第二个`trait`的关联项。你的`trait`定义所依赖的`trait`称为你的`trait`的超`trait`。

例如，让我们说我们想要制作一个`OutlinePrint` trait，它有一个`outline_print`方法，该方法将打印一个给定值，格式化后用星号框起来。也就是说，给定一个实现标准库`trait` `Display`的`Point`结构体，结果为`(x, y)`，当我们在`x`为1、`y`为3的`Point`实例上调用`outline_print`时，它应该打印以下内容：

```rust
**********
*        *
* (1, 3) *
*        *
**********
```

在`outline_print`方法的实现中，我们想要使用`Display` trait的功能。因此，我们需要指定`OutlinePrint` trait只适用于也实现`Display`并提供`OutlinePrint`需要的功能的类型。我们可以在`trait`定义中通过指定`OutlinePrint: Display`来做到这一点。这种技术类似于向`trait`添加`trait`约束。示例20-23显示了`OutlinePrint` trait的实现。

文件名：src/main.rs：

```rust
use std::fmt;

trait OutlinePrint: fmt::Display {
    fn outline_print(&self) {
        let output = self.to_string();
        let len = output.len();
        println!("{}", "*".repeat(len + 4));
        println!("*{}*", " ".repeat(len + 2));
        println!("* {output} *");
        println!("*{}*", " ".repeat(len + 2));
        println!("{}", "*".repeat(len + 4));
    }
}

fn main() {}
```

示例20-23：实现需要`Display`功能的`OutlinePrint` trait

因为我们指定了`OutlinePrint`需要`Display` trait，我们可以使用为任何实现`Display`的类型自动实现的`to_string`函数。如果我们尝试使用`to_string`而不在`trait`名后添加冒号并指定`Display` trait，我们会得到一个错误，说在当前作用域中没有为类型`&Self`找到名为`to_string`的方法。

让我们看看当我们尝试在不实现`Display`的类型上实现`OutlinePrint`时会发生什么，比如`Point`结构体：

文件名：src/main.rs：

```rust
use std::fmt;

trait OutlinePrint: fmt::Display {
    fn outline_print(&self) {
        let output = self.to_string();
        let len = output.len();
        println!("{}", "*".repeat(len + 4));
        println!("*{}*", " ".repeat(len + 2));
        println!("* {output} *");
        println!("*{}*", " ".repeat(len + 2));
        println!("{}", "*".repeat(len + 4));
    }
}

struct Point {
    x: i32,
    y: i32,
}

impl OutlinePrint for Point {}

fn main() {
    let p = Point { x: 1, y: 3 };
    p.outline_print();
}
```

我们得到一个错误，说需要`Display`但未实现：

```rust
$ cargo run
   Compiling traits-example v0.1.0 (file:///projects/traits-example)
error[E0277]: `Point` doesn't implement `std::fmt::Display`
  --> src/main.rs:20:23
   |
20 | impl OutlinePrint for Point {}
   |                       ^^^^^ `Point` cannot be formatted with the default formatter
   |
   = help: the trait `std::fmt::Display` is not implemented for `Point`
   = note: in format strings you may be able to use `{:?}` (or {:#?} for pretty-print) instead
note: required by a bound in `OutlinePrint`
  --> src/main.rs:3:21
   |
3  | trait OutlinePrint: fmt::Display {
   |                     ^^^^^^^^^^^^ required by this bound in `OutlinePrint`

error[E0277]: `Point` doesn't implement `std::fmt::Display`
  --> src/main.rs:24:7
   |
24 |     p.outline_print();
   |       ^^^^^^^^^^^^^ `Point` cannot be formatted with the default formatter
   |
   = help: the trait `std::fmt::Display` is not implemented for `Point`
   = note: in format strings you may be able to use `{:?}` (or {:#?} for pretty-print) instead
note: required by a bound in `OutlinePrint::outline_print`
  --> src/main.rs:3:21
   |
3  | trait OutlinePrint: fmt::Display {
   |                     ^^^^^^^^^^^^ required by this bound in `OutlinePrint::outline_print`
4  |     fn outline_print(&self) {
   |        ------------- required by a bound in this associated function

For more information about this error, try `rustc --explain E0277`.
error: could not compile `traits-example` (bin "traits-example") due to 2 previous errors
```

为了修复这个问题，我们在`Point`上实现`Display`并满足`OutlinePrint`需要的约束，如下所示：

文件名：src/main.rs：

```rust
trait OutlinePrint: fmt::Display {
    fn outline_print(&self) {
        let output = self.to_string();
        let len = output.len();
        println!("{}", "*".repeat(len + 4));
        println!("*{}*", " ".repeat(len + 2));
        println!("* {output} *");
        println!("*{}*", " ".repeat(len + 2));
        println!("{}", "*".repeat(len + 4));
    }
}

struct Point {
    x: i32,
    y: i32,
}

impl OutlinePrint for Point {}

use std::fmt;

impl fmt::Display for Point {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "({}, {})", self.x, self.y)
    }
}

fn main() {
    let p = Point { x: 1, y: 3 };
    p.outline_print();
}
```

然后，在`Point`上实现`OutlinePrint` trait将成功编译，我们可以在`Point`实例上调用`outline_print`来在星号轮廓内显示它。

### 使用Newtype模式在外部类型上实现外部特征

在第10章的["在类型上实现特征"](../generics/traits#在类型上实现特性)中，我们提到了孤儿规则，该规则规定我们只允许在`trait`或类型（或两者）对我们的`crate`是本地的情况下在类型上实现`trait`。可以使用newtype模式绕过这个限制，该模式涉及在元组结构体中创建新类型。（我们在第5章的["使用没有命名字段的元组结构来创建不同类型"](../structs/defining-structs#使用没有命名字段的元组结构来创建不同类型)中介绍了元组结构体。）元组结构体将有一个字段，并且是我们想要实现`trait`的类型的薄包装器。然后包装器类型对我们的`crate`是本地的，我们可以在包装器上实现`trait`。Newtype是一个起源于Haskell编程语言的术语。使用此模式没有运行时性能损失，包装器类型在编译时被消除。

作为一个例子，让我们说我们想要在`Vec<T>`上实现`Display`，孤儿规则阻止我们直接这样做，因为`Display` trait和`Vec<T>`类型都在我们的`crate`之外定义。我们可以创建一个包含`Vec<T>`实例的`Wrapper`结构体；然后我们可以在`Wrapper`上实现`Display`并使用`Vec<T>`值，如示例20-24所示。

文件名：src/main.rs：

```rust
use std::fmt;

struct Wrapper(Vec<String>);

impl fmt::Display for Wrapper {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "[{}]", self.0.join(", "))
    }
}

fn main() {
    let w = Wrapper(vec![String::from("hello"), String::from("world")]);
    println!("w = {w}");
}
```

示例20-24：围绕`Vec<String>`创建`Wrapper`类型来实现`Display`

`Display`的实现使用`self.0`来访问内部的`Vec<T>`，因为`Wrapper`是一个元组结构体，而`Vec<T>`是元组中索引0处的项。然后我们可以在`Wrapper`上使用`Display` trait的功能。

使用这种技术的缺点是`Wrapper`是一个新类型，所以它没有它所持有的值的方法。我们必须直接在`Wrapper`上实现`Vec<T>`的所有方法，这样这些方法就会委托给`self.0`，这将允许我们完全像`Vec<T>`一样对待`Wrapper`。如果我们希望新类型拥有内部类型的每个方法，在`Wrapper`上实现`Deref` trait以返回内部类型将是一个解决方案（我们在第15章的["通过Deref特征将智能指针视为常规引用"](../smart-pointers/deref#通过deref特性将智能指针视为常规引用)中讨论了实现`Deref` trait）。如果我们不希望`Wrapper`类型拥有内部类型的所有方法——例如，为了限制`Wrapper`类型的行为——我们必须手动实现我们确实想要的方法。

即使不涉及`trait`，这种newtype模式也很有用。让我们转换焦点，看看一些与Rust类型系统交互的高级方法。