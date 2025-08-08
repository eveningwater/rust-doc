## 使用特征对象来允许不同类型的值

在第八章中，我们提到向量的一个限制是它们只能存储一种类型的元素。我们在示例 8-9 中创建了一个变通方法，其中我们定义了一个 `SpreadsheetCell` 枚举，它有用于保存整数、浮点数和文本的变体。这意味着我们可以在每个单元格中存储不同类型的数据，并且仍然有一个表示一行单元格的向量。当我们的可互换项是编译代码时已知的固定类型集时，这是一个非常好的解决方案。

然而，有时我们希望库用户能够扩展在特定情况下有效的类型集。为了展示如何实现这一点，我们将创建一个图形用户界面（GUI）工具示例，该工具遍历项目列表，并在每个项目上调用 `draw` 方法以将其绘制到屏幕上——这是 GUI 工具的常用技术。我们将创建一个名为 `gui` 的库 crate，其中包含 GUI 库的结构。这个 crate 可能包含一些供人们使用的类型，例如 `Button` 或 `TextField`。此外，`gui` 用户会希望创建他们自己的可绘制类型：例如，一个程序员可能会添加一个 `Image`，另一个可能会添加一个 `SelectBox`。

我们不会为这个例子实现一个功能齐全的 GUI 库，但会展示各个部分如何组合在一起。在编写库时，我们无法知道和定义其他程序员可能想要创建的所有类型。但我们确实知道 `gui` 需要跟踪许多不同类型的值，并且需要对这些不同类型的值中的每一个调用 `draw` 方法。它不需要确切知道调用 `draw` 方法时会发生什么，只需要知道该值将具有可供我们调用的方法。

要在具有继承的语言中执行此操作，我们可能会定义一个名为 `Component` 的类，它上面有一个名为 `draw` 的方法。其他类，例如 `Button`、`Image` 和 `SelectBox`，将继承自 `Component`，从而继承 `draw` 方法。它们可以各自覆盖 `draw` 方法来定义其自定义行为，但框架可以将所有类型视为 `Component` 实例并对其调用 `draw`。但由于 Rust 没有继承，我们需要另一种方式来构建 `gui` 库，以允许用户使用新类型对其进行扩展。

## 定义通用行为的特征

为了实现我们希望 `gui` 具有的行为，我们将定义一个名为 `Draw` 的特征，它将有一个名为 `draw` 的方法。然后我们可以定义一个接受特征对象的向量。特征对象指向实现我们指定特征的类型实例以及用于在运行时查找该类型上特征方法的表。我们通过指定某种指针（例如 `&` 引用或 `Box<T>` 智能指针），然后是 `dyn` 关键字，然后指定相关特征来创建特征对象。（我们将在第 20 章的“动态大小类型和 `Sized` 特征”中讨论特征对象必须使用指针的原因。）我们可以使用特征对象来代替泛型或具体类型。无论我们使用特征对象，Rust 的类型系统都将在编译时确保在该上下文中使用的任何值都将实现特征对象的特征。因此，我们不需要在编译时知道所有可能的类型。

我们提到，在 Rust 中，我们避免将结构体和枚举称为“对象”，以区别于其他语言的对象。在结构体或枚举中，结构体字段中的数据和 `impl` 块中的行为是分离的，而在其他语言中，数据和行为组合成一个概念通常被称为对象。然而，特征对象更像其他语言中的对象，因为它们结合了数据和行为。但特征对象与传统对象的不同之处在于我们不能向特征对象添加数据。特征对象不像其他语言中的对象那样普遍有用：它们的特定目的是允许跨通用行为进行抽象。

示例 18-3 展示了如何定义一个名为 `Draw` 的特征，其中包含一个名为 `draw` 的方法。

文件名: src/lib.rs:

```rust
pub trait Draw {
    fn draw(&self);
}
```

示例 18-3: `Draw` 特征的定义

这种语法应该与我们在第 10 章中关于如何定义特征的讨论中熟悉。接下来是一些新语法：示例 18-4 定义了一个名为 `Screen` 的结构体，它包含一个名为 `components` 的向量。这个向量的类型是 `Box<dyn Draw>`，这是一个特征对象；它代表了 `Box` 中实现 `Draw` 特征的任何类型。

文件名: src/lib.rs:

```rust
pub trait Draw {
    fn draw(&self);
}

pub struct Screen {
    pub components: Vec<Box<dyn Draw>>,
}
```

示例 18-4: `Screen` 结构体的定义，其中 `components` 字段包含一个实现 `Draw` 特征的特征对象向量

在 `Screen` 结构体上，我们将定义一个名为 `run` 的方法，它将调用其每个组件上的 `draw` 方法，如 示例 18-5 所示。

文件名: src/lib.rs:

```rust
pub trait Draw {
    fn draw(&self);
}

pub struct Screen {
    pub components: Vec<Box<dyn Draw>>,
}

impl Screen {
    pub fn run(&self) {
        for component in self.components.iter() {
            component.draw();
        }
    }
}
```

示例 18-5: `Screen` 上的 `run` 方法，它调用每个组件上的 `draw` 方法

这与定义一个使用带有特征约束的泛型类型参数的结构体不同。泛型类型参数一次只能替换为一个具体类型，而特征对象允许在运行时用多个具体类型填充特征对象。例如，我们可以使用泛型类型和特征约束定义 `Screen` 结构体，如 示例 18-6 所示：

文件名: src/lib.rs:

```rust
pub trait Draw {
    fn draw(&self);
}

pub struct Screen<T: Draw> {
    pub components: Vec<T>,
}

impl<T> Screen<T>
where
    T: Draw,
{
    pub fn run(&self) {
        for component in self.components.iter() {
            component.draw();
        }
    }
}
```

示例 18-6: `Screen` 结构体及其 `run` 方法的另一种实现，使用泛型和特征约束

这限制了我们只能使用一个 `Screen` 实例，该实例的组件列表全部是 `Button` 类型或全部是 `TextField` 类型。如果你只会有同质集合，则使用泛型和特征约束是更优的选择，因为定义将在编译时单态化以使用具体类型。

另一方面，使用特征对象的方法，一个 `Screen` 实例可以包含一个 `Vec<T>`，其中包含 `Box<Button>` 和 `Box<TextField>`。让我们看看这是如何工作的，然后我们将讨论运行时性能影响。

## 实现特征

现在我们将添加一些实现 `Draw` 特征的类型。我们将提供 `Button` 类型。同样，实际实现 GUI 库超出了本文档的范围，因此 `draw` 方法在其主体中不会有任何有用的实现。要想象实现可能是什么样子，`Button` 结构体可能具有 `width`、`height` 和 `label` 字段，如 示例 18-7 所示：

文件名: src/lib.rs:

```rust
pub trait Draw {
    fn draw(&self);
}

pub struct Screen {
    pub components: Vec<Box<dyn Draw>>,
}

impl Screen {
    pub fn run(&self) {
        for component in self.components.iter() {
            component.draw();
        }
    }
}

pub struct Button {
    pub width: u32,
    pub height: u32,
    pub label: String,
}

impl Draw for Button {
    fn draw(&self) {
        // code to actually draw a button
    }
}
```

示例 18-7: 实现 `Draw` 特征的 `Button` 结构体

`Button` 上的 `width`、`height` 和 `label` 字段将与其他组件上的字段不同；例如，`TextField` 类型可能具有这些相同的字段以及一个占位符字段。我们希望在屏幕上绘制的每种类型都将实现 `Draw` 特征，但将在 `draw` 方法中使用不同的代码来定义如何绘制该特定类型，就像 `Button` 在这里所做的那样（没有实际的 GUI 代码，如前所述）。例如，`Button` 类型可能有一个额外的 `impl` 块，其中包含与用户单击按钮时发生的事情相关的方法。这些类型的方法不适用于 `TextField` 等类型。

如果使用我们库的人决定实现一个具有 `width`、`height` 和 `options` 字段的 `SelectBox` 结构体，他们也会在 `SelectBox` 类型上实现 `Draw` 特征，如 示例 18-8 所示：

文件名: src/main.rs:

```rust
use gui::Draw;

struct SelectBox {
    width: u32,
    height: u32,
    options: Vec<String>,
}

impl Draw for SelectBox {
    fn draw(&self) {
        // code to actually draw a select box
    }
}

fn main() {}
```

示例 18-8: 另一个使用 `gui` 并在 `SelectBox` 结构体上实现 `Draw` 特征的 crate

我们的库用户现在可以编写他们的 `main` 函数来创建一个 `Screen` 实例。他们可以将 `SelectBox` 和 `Button` 添加到 `Screen` 实例中，方法是将每个放入 `Box<T>` 中以成为特征对象。然后他们可以调用 `Screen` 实例上的 `run` 方法，该方法将调用每个组件上的 `draw`。示例 18-9 展示了此实现：

文件名: src/main.rs:

```rust
use gui::Draw;

struct SelectBox {
    width: u32,
    height: u32,
    options: Vec<String>,
}

impl Draw for SelectBox {
    fn draw(&self) {
        // code to actually draw a select box
    }
}

use gui::{Button, Screen};

fn main() {
    let screen = Screen {
        components: vec![
            Box::new(SelectBox {
                width: 75,
                height: 10,
                options: vec![
                    String::from("Yes"),
                    String::from("Maybe"),
                    String::from("No"),
                ],
            }),
            Box::new(Button {
                width: 50,
                height: 10,
                label: String::from("OK"),
            }),
        ],
    };

    screen.run();
}
```

示例 18-9: 使用特征对象存储实现相同特征的不同类型的值

当我们编写库时，我们不知道有人可能会添加 `SelectBox` 类型，但我们的 `Screen` 实现能够对新类型进行操作并绘制它，因为 `SelectBox` 实现了 `Draw` 特征，这意味着它实现了 `draw` 方法。

这个概念——只关注值响应的消息而不是值的具体类型——类似于动态类型语言中的鸭子类型概念：如果它走起来像鸭子，叫起来像鸭子，那么它一定是鸭子！在 示例 18-5 中 `Screen` 上 `run` 的实现中，`run` 不需要知道每个组件的具体类型是什么。它不检查组件是 `Button` 还是 `SelectBox` 的实例，它只是调用组件上的 `draw` 方法。通过将 `Box<dyn Draw>` 指定为 `components` 向量中值的类型，我们已经定义了 `Screen` 需要我们可以调用 `draw` 方法的值。

使用特征对象和 Rust 的类型系统编写类似于使用鸭子类型代码的优点是，我们永远不必在运行时检查值是否实现了特定方法，也不必担心如果值没有实现方法但我们仍然调用它而导致错误。如果值没有实现特征对象所需的特征，Rust 将不会编译我们的代码。

例如，示例 18-10 展示了如果我们尝试使用 `String` 作为组件创建 `Screen` 会发生什么。

文件名: src/main.rs:

```rust
use gui::Screen;

fn main() {
    let screen = Screen {
        components: vec![Box::new(String::from("Hi"))],
    };

    screen.run();
}
```

示例 18-10: 尝试使用未实现特征对象特征的类型

我们将收到此错误，因为 `String` 未实现 `Draw` 特征：

```rust
$ cargo run
   Compiling gui v0.1.0 (file:///projects/gui)
error[E0277]: the trait bound `String: Draw` is not satisfied
 --> src/main.rs:5:26
  |
5 |         components: vec![Box::new(String::from("Hi"))],
  |                          ^^^^^^^^^^^^^^^^^^^^^^^^^^^^ the trait `Draw` is not implemented for `String`
  |
  = help: the trait `Draw` is implemented for `Button`
  = note: required for the cast from `Box<String>` to `Box<dyn Draw>`

For more information about this error, try `rustc --explain E0277`.
error: could not compile `gui` (bin "gui") due to 1 previous error
```

此错误告诉我们，要么我们传递给 `Screen` 的内容不是我们想要传递的，因此应该传递不同的类型，要么我们应该在 `String` 上实现 `Draw`，以便 `Screen` 能够在其上调用 `draw`。

## 特征对象执行动态分发

回顾第 10 章中 [“使用泛型的代码性能”](../generics/generic-syntax#使用泛型的代码性能) 中我们关于编译器对泛型执行的单态化过程的讨论：编译器为我们用来代替泛型类型参数的每个具体类型生成函数和方法的非泛型实现。单态化产生的代码正在执行静态分发，即编译器在编译时知道你正在调用哪个方法。这与动态分发相反，动态分发是编译器在编译时无法判断你正在调用哪个方法。在动态分发的情况下，编译器会发出代码，该代码将在运行时确定要调用哪个方法。

当我们使用特征对象时，Rust 必须使用动态分发。编译器不知道可能与使用特征对象的代码一起使用的所有类型，因此它不知道要调用哪个类型上实现的哪个方法。相反，在运行时，Rust 使用特征对象内部的指针来知道要调用哪个方法。这种查找会产生运行时成本，而静态分发则不会。动态分发还会阻止编译器选择内联方法代码，这反过来又阻止了一些优化，并且 Rust 有一些规则，称为 `dyn` 兼容性，关于你可以在哪里以及不能在哪里使用动态分发。这些规则超出了本次讨论的范围，但你可以在参考资料中阅读更多相关信息。然而，我们在 示例 18-5 中编写的代码以及在 示例 18-9 中能够支持的代码确实获得了额外的灵活性，因此这是一个需要考虑的权衡。
