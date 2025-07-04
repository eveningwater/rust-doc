## 泛型数据类型

我们使用泛型来创建函数签名或结构体等项的定义，然后可以将其用于多种不同的具体数据类型。让我们首先看看如何使用泛型定义函数、结构体、枚举和方法。然后我们将讨论泛型如何影响代码性能。

### 在函数定义中使用

当定义使用泛型的函数时，我们将泛型放在函数签名中通常指定参数和返回值数据类型的位置。这样做使我们的代码更加灵活，为函数调用者提供更多功能，同时防止代码重复。

继续我们的 largest 函数，示例 10-4 展示了两个都能找出切片中最大值的函数。然后我们将它们合并成一个使用泛型的函数。

文件名：src/main.rs：

```rust
fn largest_i32(list: &[i32]) -> &i32 {
    let mut largest = &list[0];

    for item in list {
        if item > largest {
            largest = item;
        }
    }

    largest
}

fn largest_char(list: &[char]) -> &char {
    let mut largest = &list[0];

    for item in list {
        if item > largest {
            largest = item;
        }
    }

    largest
}

fn main() {
    let number_list = vec![34, 50, 25, 100, 65];

    let result = largest_i32(&number_list);
    println!("The largest number is {result}");
    assert_eq!(*result, 100);

    let char_list = vec!['y', 'm', 'a', 'q'];

    let result = largest_char(&char_list);
    println!("The largest char is {result}");
    assert_eq!(*result, 'y');
}
```

示例 10-4：两个只在名称和签名类型上有所不同的函数

largest_i32 函数是我们在示例 10-3 中提取的，用于找出切片中最大的 i32。largest_char 函数用于找出切片中最大的 char。这两个函数的函数体有相同的代码，所以让我们通过在单个函数中引入泛型类型参数来消除这种重复。

要在新的单个函数中参数化类型，我们需要命名类型参数，就像为函数命名值参数一样。你可以使用任何标识符作为类型参数名。但我们将使用 T，因为按照惯例，Rust 中的类型参数名称很短，通常只有一个字母，而且 Rust 的类型命名约定是 UpperCamelCase。T（type 的缩写）是大多数 Rust 程序员的默认选择。

当我们在函数体中使用参数时，必须在签名中声明参数名称，这样编译器才知道该名称的含义。同样，当我们在函数签名中使用类型参数名称时，必须在使用它之前声明类型参数名称。要定义泛型 largest 函数，我们将类型名称声明放在函数名称和参数列表之间的尖括号 <> 内，如下所示：

```rust
fn largest<T>(list: &[T]) -> &T {
    //....
}
```

我们这样理解这个定义：函数 largest 对某种类型 T 是泛型的。这个函数有一个名为 list 的参数，它是类型 T 的值的切片。largest 函数将返回与类型 T 相同类型的值的引用。

示例 10-5 展示了使用泛型数据类型在其签名中的 largest 函数定义的组合。该示例还展示了如何使用 i32 值或 char 值的切片调用该函数。注意，这段代码还不能编译，但我们将在本章后面修复它。

文件名：src/main.rs：

```rust
fn largest<T>(list: &[T]) -> &T {
    let mut largest = &list[0];

    for item in list {
        if item > largest {
            largest = item;
        }
    }

    largest
}

fn main() {
    let number_list = vec![34, 50, 25, 100, 65];

    let result = largest(&number_list);
    println!("The largest number is {result}");

    let char_list = vec!['y', 'm', 'a', 'q'];

    let result = largest(&char_list);
    println!("The largest char is {result}");
}
```

示例 10-5：使用泛型类型参数的 largest 函数；这段代码还不能编译

如果我们现在编译这段代码，会得到这个错误：

```rust
$ cargo run
Compiling chapter10 v0.1.0 (file:///projects/chapter10)
error[E0369]: binary operation `>` cannot be applied to type `&T`
--> src/main.rs:5:17
|
5 | if item > largest {
| ---- ^ ------- &T
| |
| &T
|
help: consider restricting type parameter `T`
|
1 | fn largest<T: std::cmp::PartialOrd>(list: &[T]) -> &T {
| ++++++++++++++++++++++

For more information about this error, try `rustc --explain E0369`.
error: could not compile `chapter10` (bin "chapter10") due to 1 previous error
```

帮助文本提到了 `std::cmp::PartialOrd`，这是一个 trait，我们将在下一节讨论 trait。现在，请知道这个错误表明 largest 的函数体不适用于 T 可能是的所有可能类型。因为我们想在函数体中比较类型 T 的值，所以我们只能使用可以排序的类型。为了启用比较，标准库有 std::cmp::PartialOrd trait，你可以在类型上实现它（有关此 trait 的更多信息，请参见附录 C）。通过遵循帮助文本的建议，我们将 T 的有效类型限制为仅实现 PartialOrd 的类型，这个例子将会编译，因为标准库在 i32 和 char 上都实现了 PartialOrd。

### 在结构体定义中使用

我们也可以使用 `<>` 语法定义结构体，使其在一个或多个字段中使用泛型类型参数。示例 10-6 定义了一个 `Point<T>` 结构体，用于保存任何类型的 x 和 y 坐标值。

文件名：src/main.rs：

```rust
struct Point<T> {
    x: T,
    y: T,
}

fn main() {
    let integer = Point { x: 5, y: 10 };
    let float = Point { x: 1.0, y: 4.0 };
}
```

示例 10-6：一个 `Point<T>` 结构体，保存类型 T 的 x 和 y 值

在结构体定义中使用泛型的语法与在函数定义中使用的语法类似。首先，我们在结构体名称后的尖括号内声明类型参数的名称。然后我们在结构体定义中使用泛型类型，在原本指定具体数据类型的地方。

注意，因为我们只使用了一个泛型类型来定义 `Point<T>`，所以这个定义表明 `Point<T>` 结构体对某种类型 T 是泛型的，而字段 x 和 y 都是同一类型，无论该类型是什么。如果我们创建一个 `Point<T>` 实例，其中 x 和 y 是不同类型的值，如示例 10-7 所示，我们的代码将无法编译。

文件名：src/main.rs：

```rust
struct Point<T> {
    x: T,
    y: T,
}

fn main() {
    let wont_work = Point { x: 5, y: 4.0 };
}
```

示例 10-7：字段 x 和 y 必须是相同类型，因为它们都有相同的泛型数据类型 T。

在这个例子中，当我们将整数值 5 赋给 x 时，我们让编译器知道这个 `Point<T>` 实例的泛型类型 T 将是一个整数。然后当我们为 y 指定 4.0 时，由于我们已经将其定义为与 x 相同的类型，我们会得到类型不匹配错误，如下所示：

```rust
$ cargo run
Compiling chapter10 v0.1.0 (file:///projects/chapter10)
error[E0308]: mismatched types
--> src/main.rs:7:38
|
7 | let wont_work = Point { x: 5, y: 4.0 };
| ^^^ expected integer, found floating-point number

For more information about this error, try `rustc --explain E0308`.
error: could not compile `chapter10` (bin "chapter10") due to 1 previous error
```

要定义一个 x 和 y 都是泛型但可能有不同类型的 Point 结构体，我们可以使用多个泛型类型参数。例如，在示例 10-8 中，我们将 Point 的定义更改为对类型 T 和 U 是泛型的，其中 x 是类型 T，y 是类型 U。

文件名：src/main.rs：

```rust
struct Point<T, U> {
    x: T,
    y: U,
}

fn main() {
    let both_integer = Point { x: 5, y: 10 };
    let both_float = Point { x: 1.0, y: 4.0 };
    let integer_and_float = Point { x: 5, y: 4.0 };
}
```

示例 10-8：一个 `Point<T, U>` 对两种类型是泛型的，所以 x 和 y 可以是不同类型的值

现在所有展示的 Point 实例都是允许的！你可以在定义中使用任意多的泛型类型参数，但使用太多会使代码难以阅读。如果你发现你的代码中需要很多泛型类型，这可能表明你的代码需要重构成更小的部分。

### 在枚举定义中使用

正如我们对结构体所做的那样，我们可以定义枚举来在其变体中保存泛型数据类型。让我们再看一下标准库提供的 `Option<T>` 枚举，我们在第 6 章中使用过：

```rust
#![allow(unused)]
fn main() {
    enum Option<T> {
        Some(T),
        None,
    }
}
```

这个定义现在对你来说应该更有意义了。如你所见，`Option<T>` 枚举对类型 T 是泛型的，有两个变体：Some，它持有一个类型 T 的值，和一个不持有任何值的 None 变体。通过使用 `Option<T>` 枚举，我们可以表达可选值的抽象概念，而且因为 `Option<T>` 是泛型的，我们可以使用这个抽象，无论可选值的类型是什么。

枚举也可以使用多个泛型类型。我们在第 9 章中使用的 Result 枚举的定义就是一个例子：

```rust
#![allow(unused)]
fn main() {
    enum Result<T, E> {
        Ok(T),
        Err(E),
    }
}
```

Result 枚举对两种类型 T 和 E 是泛型的，有两个变体：Ok，它持有一个类型 T 的值，和 Err，它持有一个类型 E 的值。这个定义使得 Result 枚举在任何可能成功（返回某种类型 T 的值）或失败（返回某种类型 E 的错误）的操作中都很方便使用。实际上，这就是我们在示例 9-3 中打开文件时使用的，其中 T 被填充为类型 std::fs::File（当文件成功打开时），E 被填充为类型 std::io::Error（当打开文件出现问题时）。

当你在代码中识别出多个结构体或枚举定义，它们只在持有的值的类型上有所不同时，你可以通过使用泛型类型来避免重复。

### 在方法定义中使用

我们可以在结构体和枚举上实现方法（就像我们在第 5 章中做的那样），也可以在它们的定义中使用泛型类型。示例 10-9 展示了我们在示例 10-6 中定义的 `Point<T>` 结构体，并在其上实现了一个名为 x 的方法。

文件名：src/main.rs：

```rust
struct Point<T> {
    x: T,
    y: T,
}

impl<T> Point<T> {
    fn x(&self) -> &T {
        &self.x
    }
}

fn main() {
    let p = Point { x: 5, y: 10 };

    println!("p.x = {}", p.x());
}
```

示例 10-9：在 `Point<T>` 结构体上实现一个名为 x 的方法，它将返回对类型 T 的 x 字段的引用

这里，我们在 `Point<T>` 上定义了一个名为 x 的方法，它返回对字段 x 中数据的引用。

注意，我们必须在 impl 后面声明 T，这样我们就可以指定我们在类型 `Point<T>` 上实现方法。通过在 impl 后声明 T 为泛型类型，Rust 可以识别 Point 中尖括号内的类型是泛型类型而不是具体类型。我们可以为这个泛型参数选择一个与结构体定义中声明的泛型参数不同的名称，但使用相同的名称是惯例。如果你在声明泛型类型的 impl 中编写方法，无论最终替代泛型类型的具体类型是什么，该方法都将在该类型的任何实例上定义。

我们也可以在定义类型的方法时为泛型类型指定约束。例如，我们可以只在 `Point<f32>` 实例上实现方法，而不是在任何泛型类型的 `Point<T>` 实例上。在示例 10-10 中，我们使用具体类型 f32，这意味着我们在 impl 后不声明任何类型。

文件名：src/main.rs：

```rust
struct Point<T> {
    x: T,
    y: T,
}

impl<T> Point<T> {
    fn x(&self) -> &T {
        &self.x
    }
}

impl Point<f32> {
    fn distance_from_origin(&self) -> f32 {
        (self.x.powi(2) + self.y.powi(2)).sqrt()
    }
}

fn main() {
    let p = Point { x: 5, y: 10 };

    println!("p.x = {}", p.x());
}
```

示例 10-10：一个 impl 块，它只适用于具有特定具体类型的泛型类型参数 T 的结构体

这段代码意味着类型 `Point<f32>` 将有一个 distance_from_origin 方法；其他 T 不是 f32 类型的 `Point<T>` 实例将没有这个方法定义。该方法测量我们的点距离坐标 (0.0, 0.0) 的距离，并使用只对浮点类型可用的数学运算。

结构体定义中的泛型类型参数并不总是与你在同一结构体的方法签名中使用的泛型类型相同。示例 10-11 使用 Point 结构体的泛型类型 X1 和 Y1，以及 mixup 方法签名的 X2 Y2，使例子更清晰。该方法创建一个新的 Point 实例，其 x 值来自 self Point（类型为 X1），y 值来自传入的 Point（类型为 Y2）。

文件名：src/main.rs：

```rust
struct Point<X1, Y1> {
    x: X1,
    y: Y1,
}

impl<X1, Y1> Point<X1, Y1> {
    fn mixup<X2, Y2>(self, other: Point<X2, Y2>) -> Point<X1, Y2> {
        Point {
            x: self.x,
            y: other.y,
        }
    }
}

fn main() {
    let p1 = Point { x: 5, y: 10.4 };
    let p2 = Point { x: "Hello", y: 'c' };

    let p3 = p1.mixup(p2);

    println!("p3.x = {}, p3.y = {}", p3.x, p3.y);
}
```

示例 10-11：一个使用与其结构体定义不同的泛型类型的方法

在 main 中，我们定义了一个 Point，其 x 为 i32 类型（值为 5），y 为 f64 类型（值为 10.4）。p2 变量是一个 Point 结构体，其 x 为字符串切片（值为 "Hello"），y 为 char 类型（值为 c）。在 p1 上使用参数 p2 调用 mixup 会得到 p3，它的 x 将是 i32 类型，因为 x 来自 p1。p3 变量的 y 将是 char 类型，因为 y 来自 p2。println! 宏调用将打印 p3.x = 5, p3.y = c。

这个例子的目的是展示一种情况，其中一些泛型参数是用 impl 声明的，一些是用方法定义声明的。这里，泛型参数 X1 和 Y1 是在 impl 后声明的，因为它们与结构体定义相关。泛型参数 X2 和 Y2 是在 fn mixup 后声明的，因为它们只与方法相关。

### 使用泛型的代码性能

你可能想知道使用泛型类型参数是否会有运行时成本。好消息是，使用泛型类型不会使你的程序比使用具体类型运行得更慢。

Rust 通过在编译时对使用泛型的代码执行单态化（monomorphization）来实现这一点。单态化是将泛型代码转变为特定代码的过程，通过在编译时填充所使用的具体类型。在这个过程中，编译器做的与我们在示例 10-5 中创建泛型函数所做的步骤相反：编译器查看所有调用泛型代码的地方，并为泛型代码被调用的具体类型生成代码。

让我们通过使用标准库的泛型 `Option<T>` 枚举来看看这是如何工作的：

```rust
let integer = Some(5);
let float = Some(5.0);
```

当 Rust 编译这段代码时，它执行单态化。在这个过程中，编译器读取 `Option<T>` 实例中使用的值，并识别出两种 `Option<T>`：一种是 i32，另一种是 f64。因此，它将泛型定义的 `Option<T>` 扩展为两个针对 i32 和 f64 的定义，从而用特定的定义替换泛型定义。

单态化后的版本看起来类似于以下代码（编译器使用的名称与我们在这里用于说明的名称不同）：

文件名：src/main.rs：

```rust
enum Option_i32 {
    Some(i32),
    None,
}

enum Option_f64 {
    Some(f64),
    None,
}

fn main() {
    let integer = Option_i32::Some(5);
    let float = Option_f64::Some(5.0);
}
```

泛型 `Option<T>` 被编译器创建的特定定义所替代。因为 Rust 将泛型代码编译成指定每个实例类型的代码，所以我们在使用泛型时不会付出运行时成本。当代码运行时，它的执行效果就像我们手动复制了每个定义一样。单态化过程使 Rust 的泛型在运行时非常高效。
