## 使用结构体的示例程序

为了理解何时可能需要使用结构体，让我们编写一个程序来计算矩形的面积。我们将从使用单个变量开始，然后重构程序，直到我们改用结构体。

让我们用 Cargo 创建一个名为 rectangles 的新二进制项目，它将获取以像素为单位指定的矩形的宽度和高度并计算矩形的面积。示例 5-8 展示了一个简短的程序，其中有一种方法可以在项目的 src/main.rs 中执行此操作。

文件名：src/main.rs: 

```rust
fn main() {
    let width1 = 30;
    let height1 = 50;

    println!(
        "The area of the rectangle is {} square pixels.",
        area(width1, height1)
    );
}

fn area(width: u32, height: u32) -> u32 {
    width * height
}
```

示例 5-8：计算由单独的宽度和高度变量指定的矩形的面积

现在，使用 `cargo run` 运行该程序：

```rust
$ cargo run
   Compiling rectangles v0.1.0 (file:///projects/rectangles)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.42s
     Running `target/debug/rectangles`
The area of the rectangle is 1500 square pixels.
```

此代码通过调用每个维度的面积函数成功计算出矩形的面积，但我们可以做更多的事情来使此代码清晰易读。

该代码的问题在area函数的签名中显而易见：

```rust
fn area(width: u32, height: u32) -> u32 {
    //...
}
```

area 函数应该计算一个矩形的面积，但我们编写的函数有两个参数，并且在我们的程序中没有任何地方明确指出这些参数是相关的。将 width 和 height 组合在一起会更易读且更易于管理。我们已经在第 3 章的“[元组类型](../common-concept/data-type.md#元组类型)”部分讨论了我们可以这样做的一种方式：使用元组。

### 使用元组重构

示例 5-9 展示了使用元组的另一个程序版本。

文件名：src/main.rs:

```rust
fn main() {
    let rect1 = (30, 50);

    println!(
        "The area of the rectangle is {} square pixels.",
        area(rect1)
    );
}

fn area(dimensions: (u32, u32)) -> u32 {
    dimensions.0 * dimensions.1
}
```

示例 5-9：使用元组指定矩形的宽度和高度

一方面，这个程序更好。元组让我们可以添加一些结构，现在我们只传递一个参数。但另一方面，这个版本不太清楚：元组没有命名它们的元素，所以我们必须索引元组的各个部分，这使得我们的计算不太明显。

混合宽度和高度对于面积计算来说无关紧要，但如果我们想在屏幕上绘制矩形，那就很重要了!我们必须记住宽度是元组索引 0，高度是元组索引 1。如果其他人使用我们的代码，这将更难弄清楚并记住这一点。因为我们没有在代码中传达数据的含义，所以现在更容易引入错误。

### 使用结构体重构：增加更多含义

我们使用结构体来标记数据，从而增加含义。我们可以将使用的元组转换为结构体，为整体和部分指定名称，如示例 5-10 所示。

文件名：src/main.rs:

```rust
struct Rectangle {
    width: u32,
    height: u32,
}

fn main() {
    let rect1 = Rectangle {
        width: 30,
        height: 50,
    };

    println!(
        "The area of the rectangle is {} square pixels.",
        area(&rect1)
    );
}

fn area(rectangle: &Rectangle) -> u32 {
    rectangle.width * rectangle.height
}
```

示例 5-10：定义一个 Rectangle 结构体

这里我们定义了一个结构体，并将其命名为 Rectangle。在花括号内，我们将字段定义为 width 和 height，这两个字段的类型都是 u32。然后，在 main 中，我们创建了一个特定的 Rectangle 实例，其宽度为 30，高度为 50。

现在，area 函数被定义为一个参数，我们将其命名为 rectangle，其类型是结构体 Rectangle 实例的不可变借用。如第 4 章所述，我们希望借用该结构体，而不是获取它的所有权。这样，main 保留了它的所有权，并且可以继续使用 rect1，这就是我们在函数签名和调用该函数的地方使用 & 的原因。

area 函数访问 Rectangle 实例的 width 和 height 字段（请注意，访问借用的结构体实例的字段不会移动字段值，这就是你经常看到结构体借用的原因）。area 函数签名现在准确地表达了我们的意思：使用 Rectangle 的 width 和 height 字段计算其面积。这传达了宽度和高度相互关联的信息，并为这些值提供了描述性名称，而不是使用 0 和 1 的元组索引值。这有利于清晰理解。

### 使用派生特征添加有用的功能

在调试程序时，能够打印 Rectangle 的实例并查看其所有字段的值会很有用。示例 5-11 尝试使用 [`println!` 宏](https://doc.rust-lang.org/std/macro.println.html)，就像我们在前几章中使用过的那样。然而，这不起作用。

```rust
struct Rectangle {
    width: u32,
    height: u32,
}

fn main() {
    let rect1 = Rectangle {
        width: 30,
        height: 50,
    };

    println!("rect1 is {}", rect1);
}
```

示例 5-11：尝试打印一个 Rectangle 实例

当我们编译此代码时，我们收到以下核心错误信息：

```rust
error[E0277]: `Rectangle` doesn't implement `std::fmt::Display`
```

println! 宏可以进行多种格式化，默认情况下，花括号告诉 println! 使用称为 Display 的格式：输出旨在供最终用户直接使用。到目前为止，我们看到的原始类型默认实现 Display，因为只有一种方法可以向用户显示 1 或任何其他原始类型。但是对于结构体，println! 格式化输出的方式不太明确，因为显示可能性更多：是否要逗号？是否要打印花括号？是否应显示所有字段？由于这种模糊性，Rust 不会尝试猜测我们想要什么，并且结构体没有提供的 Display 实现来与 println! 和 {} 占位符一起使用。

如果我们继续阅读错误，我们会发现这个有用的注释：

```rust
= help: the trait `std::fmt::Display` is not implemented for `Rectangle`
= note: in format strings you may be able to use `{:?}` (or {:#?} for pretty-print) instead
```

让我们试试吧!println!宏调用现在看起来像 `println!(“rect1 is {rect1:?}”);`。将说明符 `:?`放在花括号内告诉 println!我们想要使用一种名为 Debug 的输出格式。Debug 特征使我们能够以对开发人员有用的方式打印我们的结构，以便我们在调试代码时可以看到它的值。

使用此更改编译代码。糟糕!我们仍然收到错误：

```rust
error[E0277]: `Rectangle` doesn't implement `Debug`
```

Rust 确实包含打印调试信息的功能，但我们必须明确选择让该功能在我们的结构体中可用。为此，我们在结构体定义之前添加外部属性 `#[derive(Debug)]`，如示例 5-12 所示。

文件名：src/main.rs:

```rust
#[derive(Debug)]
struct Rectangle {
    width: u32,
    height: u32,
}

fn main() {
    let rect1 = Rectangle {
        width: 30,
        height: 50,
    };

    println!("rect1 is {rect1:?}");
}
```

示例 5-12：添加属性以派生 Debug 特征并使用调试格式打印 Rectangle 实例

现在当我们运行程序时，我们不会看到任何错误，并且我们将看到以下输出：

```rust
$ cargo run
   Compiling rectangles v0.1.0 (file:///projects/rectangles)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.48s
     Running `target/debug/rectangles`
rect1 is Rectangle { width: 30, height: 50 }
```

太棒了!虽然输出效果不是最漂亮的，但它显示了此实例的所有字段的值，这在调试过程中肯定很有帮助。当我们有更大的结构体时，让输出更易于阅读会很有用；在这种情况下，我们可以在 println! 字符串中使用 `{:#?}` 而不是 `{:?}`。在此示例中，使用 `{:#?}` 样式将输出以下内容：

```rust
$ cargo run
   Compiling rectangles v0.1.0 (file:///projects/rectangles)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.48s
     Running `target/debug/rectangles`
rect1 is Rectangle {
    width: 30,
    height: 50,
}
```

使用 Debug 格式打印出值的另一种方法是使用 [dbg!宏](https://doc.rust-lang.org/std/macro.dbg.html)，它获取表达式的所有权（与获取引用的 println!相反），打印代码中发生该 dbg!宏调用的文件和行号以及该表达式的结果值，并返回该值的所有权。

> 注意：调用 dbg! 宏会打印到标准错误控制台流 (stderr)，而 println! 则会打印到标准输出控制台流 (stdout)。我们将在第 12 章的“将错误消息写入标准错误而不是标准输出”部分中详细讨论 stderr 和 stdout。

下面是一个例子，可能会让我们对分配给 width 字段的值以及 rect1 中整个结构的值感兴趣：

```rust
#[derive(Debug)]
struct Rectangle {
    width: u32,
    height: u32,
}

fn main() {
    let scale = 2;
    let rect1 = Rectangle {
        width: dbg!(30 * scale),
        height: 50,
    };

    dbg!(&rect1);
}
```

我们可以将 dbg! 放在表达式 30 * scale 周围，因为 dbg! 返回表达式值的所有权，所以宽度字段将获得与我们没有 dbg! 调用时相同的值。我们不希望 dbg! 拥有 rect1 的所有权，因此我们在下一个调用中使用对 rect1 的引用。此示例的输出如下所示：

```rust
$ cargo run
   Compiling rectangles v0.1.0 (file:///projects/rectangles)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.61s
     Running `target/debug/rectangles`
[src/main.rs:10:16] 30 * scale = 60
[src/main.rs:14:5] &rect1 = Rectangle {
    width: 60,
    height: 50,
}
```

我们可以看到第一个输出来自 src/main.rs 第 10 行，其中我们正在调试表达式 30 * scale，其结果值为 60（为整数实现的 Debug 格式是仅打印其值）。src/main.rs 第 14 行的 dbg! 调用输出 &rect1 的值，即 Rectangle 结构。此输出使用 Rectangle 类型的漂亮 Debug 格式。当你试图弄清楚代码在做什么时，dbg! 宏非常有用！

除了 Debug 特征之外，Rust 还提供了多个特征供我们与 derive 属性一起使用，这些特征可以为我们的自定义类型添加有用的行为。这些特征及其行为列在[附录 C](../appendix/appendix-c.md)中。我们将在第 10 章中介绍如何使用自定义行为实现这些特征以及如何创建自己的特征。除了 derive 之外，还有许多其他属性；有关更多信息，请参阅 Rust“属性”部分。

我们的 area 函数非常具体：它仅计算矩形的面积。将此行为与我们的 Rectangle 结构更紧密地联系起来会很有帮助，因为它不适用于任何其他类型。让我们看看如何通过将 area 函数转换为在 Rectangle 类型上定义的 area 方法来继续重​​构此代码。