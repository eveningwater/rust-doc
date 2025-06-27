## 宏

我们在本书中一直使用像`println!`这样的宏，但我们还没有完全探索宏是什么以及它是如何工作的。术语宏指的是Rust中的一系列功能：带有`macro_rules!`的声明式宏和三种过程宏：

* 自定义`#[derive]`宏，指定与在`struct`和`enum`上使用的`derive`属性一起添加的代码
* 类似属性的宏，定义可在任何项上使用的自定义属性
* 类似函数的宏，看起来像函数调用，但对指定为其参数的`token`进行操作

我们将依次讨论这些内容，但首先，让我们看看当我们已经有函数时，为什么我们还需要宏。

### 宏和函数之间的区别

从根本上说，宏是一种编写代码来编写其他代码的方式，这被称为元编程。在附录C中，我们讨论了`derive`属性，它为你生成各种`trait`的实现。我们在整本书中也使用了`println!`和`vec!`宏。所有这些宏都会展开以生成比你手动编写的代码更多的代码。

元编程对于减少你必须编写和维护的代码数量很有用，这也是函数的作用之一。然而，宏有一些函数没有的额外功能。

函数签名必须声明函数具有的参数数量和类型。另一方面，宏可以接受可变数量的参数：我们可以用一个参数调用`println!("hello")`，或者用两个参数调用`println!("hello {}", name)`。此外，宏在编译器解释代码含义之前展开，因此宏可以，例如，在给定类型上实现`trait`。函数不能这样做，因为它在运行时被调用，而`trait`需要在编译时实现。

实现宏而不是函数的缺点是宏定义比函数定义更复杂，因为你在编写编写Rust代码的Rust代码。由于这种间接性，宏定义通常比函数定义更难阅读、理解和维护。

宏和函数之间的另一个重要区别是，你必须在文件中调用宏之前定义宏或将其引入作用域，而不是函数，你可以在任何地方定义并在任何地方调用。

### 使用`macro_rules!`进行通用元编程的声明式宏

Rust中最广泛使用的宏形式是声明式宏。这些有时也被称为"示例宏"、"`macro_rules!`宏"或简称为"宏"。声明式宏的核心允许你编写类似于Rust `match`表达式的东西。正如第6章中讨论的，`match`表达式是控制结构，它接受一个表达式，将表达式的结果值与模式进行比较，然后运行与匹配模式关联的代码。宏也将值与与特定代码关联的模式进行比较：在这种情况下，值是传递给宏的字面Rust源代码；模式与该源代码的结构进行比较；与每个模式关联的代码在匹配时替换传递给宏的代码。这一切都在编译期间发生。

要定义宏，你使用`macro_rules!`构造。让我们通过查看`vec!`宏是如何定义的来探索如何使用`macro_rules!`。第8章介绍了我们如何使用`vec!`宏创建具有特定值的新向量。例如，以下宏创建一个包含三个整数的新向量：

```rust
#![allow(unused)]
fn main() {
    let v: Vec<u32> = vec![1, 2, 3];
}
```

我们也可以使用`vec!`宏创建一个包含两个整数的向量或一个包含五个字符串切片的向量。我们无法使用函数做同样的事情，因为我们不会提前知道值的数量或类型。

示例20-35显示了`vec!`宏的稍微简化的定义。

文件名：src/lib.rs：

```rust
#[macro_export]
macro_rules! vec {
    ( $( $x:expr ),* ) => {
        {
            let mut temp_vec = Vec::new();
            $(
                temp_vec.push($x);
            )*
            temp_vec
        }
    };
}
```

示例20-35：`vec!`宏定义的简化版本

> 注意：标准库中`vec!`宏的实际定义包括预先分配正确内存量的代码。该代码是一个优化，我们在这里不包括它，以使示例更简单。

`#[macro_export]`注解表示每当定义宏的`crate`被引入作用域时，这个宏就应该可用。如果没有这个注解，宏就不能被引入作用域。

然后我们用`macro_rules!`和我们正在定义的宏的名称（不带感叹号）开始宏定义。在这种情况下，名称`vec`后跟花括号，表示宏定义的主体。

`vec!`主体中的结构类似于`match`表达式的结构。这里我们有一个带有模式`( $( $x:expr ),* )`的分支，后跟`=>`和与此模式关联的代码块。如果模式匹配，将发出关联的代码块。鉴于这是此宏中的唯一模式，只有一种有效的匹配方式；任何其他模式都会导致错误。更复杂的宏将有多个分支。

宏定义中的有效模式语法与第19章中涵盖的模式语法不同，因为宏模式是与Rust代码结构而不是值匹配的。让我们逐步了解示例20-29中的模式片段的含义；有关完整的宏模式语法，请参阅[Rust参考](https://doc.rust-lang.org/reference/macros-by-example.html)。

首先，我们使用一组圆括号来包含整个模式。我们使用美元符号（`$`）在宏系统中声明一个变量，该变量将包含与模式匹配的Rust代码。美元符号明确表示这是一个宏变量，而不是常规的Rust变量。接下来是一组圆括号，用于捕获在圆括号内匹配模式的值，以便在替换代码中使用。在`$()`内是`$x:expr`，它匹配任何Rust表达式并给表达式命名`$x`。

`$()`后面的逗号表示字面逗号分隔符字符必须出现在与`$()`内代码匹配的代码的每个实例之间。`*`指定模式匹配零个或多个前面的内容。

当我们用`vec![1, 2, 3];`调用这个宏时，`$x`模式与三个表达式`1`、`2`和`3`匹配三次。

现在让我们看看与此分支关联的代码主体中的模式：`$()*`内的`temp_vec.push()`为模式中与`$()`匹配的每个部分生成，零次或多次，取决于模式匹配的次数。`$x`被替换为每个匹配的表达式。当我们用`vec![1, 2, 3];`调用这个宏时，替换此宏调用生成的代码将是以下内容：

```rust
{
    let mut temp_vec = Vec::new();
    temp_vec.push(1);
    temp_vec.push(2);
    temp_vec.push(3);
    temp_vec
}
```

我们已经定义了一个宏，它可以接受任意数量的任意类型的参数，并可以生成代码来创建包含指定元素的向量。

要了解更多关于如何编写宏的信息，请查阅在线文档或其他资源，例如Daniel Keep开始并由Lukas Wirth继续的["Rust宏小册子"](https://veykril.github.io/tlborm/)。

### 用于从属性生成代码的过程宏

宏的第二种形式是过程宏，它更像函数（并且是一种过程类型）。过程宏接受一些代码作为输入，对该代码进行操作，并产生一些代码作为输出，而不是像声明式宏那样与模式匹配并用其他代码替换代码。三种过程宏是自定义`derive`、类似属性和类似函数，它们都以类似的方式工作。

创建过程宏时，定义必须驻留在具有特殊`crate`类型的自己的`crate`中。这是出于复杂的技术原因，我们希望在未来消除。在示例20-36中，我们展示了如何定义过程宏，其中`some_attribute`是使用特定宏变体的占位符。

文件名：src/lib.rs：

```rust
use proc_macro;

#[some_attribute]
    pub fn some_name(input: TokenStream) -> TokenStream {
}
```

示例20-36：定义过程宏的示例

定义过程宏的函数接受`TokenStream`作为输入并产生`TokenStream`作为输出。`TokenStream`类型由Rust附带的`proc_macro` crate定义，表示`token`序列。这是宏的核心：宏操作的源代码构成输入`TokenStream`，宏产生的代码是输出`TokenStream`。该函数还有一个附加的属性，指定我们正在创建哪种过程宏。我们可以在同一个`crate`中拥有多种过程宏。

让我们看看不同种类的过程宏。我们将从自定义`derive`宏开始，然后解释使其他形式不同的小差异。

### 如何编写自定义`derive`宏

让我们创建一个名为`hello_macro`的`crate`，它定义一个名为`HelloMacro`的`trait`，其中有一个名为`hello_macro`的关联函数。我们将提供一个过程宏，而不是让我们的用户为每种类型实现`HelloMacro` trait，这样用户可以用`#[derive(HelloMacro)]`注解他们的类型以获得`hello_macro`函数的默认实现。默认实现将打印`Hello, Macro! My name is TypeName!`，其中`TypeName`是定义此`trait`的类型的名称。换句话说，我们将编写一个`crate`，使另一个程序员能够使用我们的`crate`编写如示例20-37的代码。

文件名：src/main.rs：

```rust
use hello_macro::HelloMacro;
use hello_macro_derive::HelloMacro;

#[derive(HelloMacro)]
struct Pancakes;

fn main() {
    Pancakes::hello_macro();
}
```

示例20-37：我们的`crate`用户在使用我们的过程宏时能够编写的代码

完成后，此代码将打印`Hello, Macro! My name is Pancakes!`。第一步是创建一个新的库`crate`，如下所示：

```rust
$ cargo new hello_macro --lib
```

接下来，我们将定义`HelloMacro` trait及其关联函数：

文件名：src/lib.rs：

```rust
pub trait HelloMacro {
    fn hello_macro();
}
```

示例20-38：我们将与`derive`宏一起使用的简单`trait`

我们有一个`trait`及其函数。此时，我们的`crate`用户可以实现`trait`以实现所需的功能，如示例20-39所示。

文件名：src/main.rs：

```rust
use hello_macro::HelloMacro;

struct Pancakes;

impl HelloMacro for Pancakes {
    fn hello_macro() {
        println!("Hello, Macro! My name is Pancakes!");
    }
}

fn main() {
    Pancakes::hello_macro();
}
```

示例20-39：如果用户编写`HelloMacro` trait的手动实现，它会是什么样子

但是，他们需要为每个要与`hello_macro`一起使用的类型编写实现块；我们希望让他们免于做这项工作。

此外，我们还不能为`hello_macro`函数提供默认实现来打印实现`trait`的类型的名称：Rust没有反射功能，因此它无法在运行时查找类型的名称。我们需要一个宏来在编译时生成代码。

下一步是定义过程宏。在撰写本文时，过程宏需要在自己的`crate`中。最终，这个限制可能会被取消。构造`crate`和宏`crate`的约定如下：对于名为`foo`的`crate`，自定义`derive`过程宏`crate`称为`foo_derive`。让我们在我们的`hello_macro`项目中启动一个名为`hello_macro_derive`的新`crate`：

```rust
$ cargo new hello_macro_derive --lib
```

我们的两个`crate`紧密相关，因此我们在`hello_macro` crate的目录中创建过程宏`crate`。如果我们更改`hello_macro`中的`trait`定义，我们也必须更改`hello_macro_derive`中过程宏的实现。这两个`crate`需要单独发布，使用这些`crate`的程序员需要将两者都添加为依赖项并将它们都引入作用域。我们可以让`hello_macro` crate使用`hello_macro_derive`作为依赖项并重新导出过程宏代码。然而，我们构造项目的方式使程序员即使不想要`derive`功能也可以使用`hello_macro`。

我们需要将`hello_macro_derive` crate声明为过程宏`crate`。我们还需要来自`syn`和`quote` crate的功能，正如你稍后会看到的，所以我们需要将它们添加为依赖项。将以下内容添加到`hello_macro_derive`的Cargo.toml文件中：

文件名：hello_macro_derive/Cargo.toml：

```toml
[lib]
proc-macro = true

[dependencies]
syn = "2.0"
quote = "1.0"
```

要开始定义过程宏，请将示例20-40中的代码放入`hello_macro_derive` crate的src/lib.rs文件中。请注意，在我们添加`impl_hello_macro`函数的定义之前，此代码不会编译。

文件名：hello_macro_derive/src/lib.rs：

```rust
use proc_macro::TokenStream;
use quote::quote;

#[proc_macro_derive(HelloMacro)]
pub fn hello_macro_derive(input: TokenStream) -> TokenStream {
    // Construct a representation of Rust code as a syntax tree
    // that we can manipulate.
    let ast = syn::parse(input).unwrap();

    // Build the trait implementation.
    impl_hello_macro(&ast)
}
```

示例20-40：大多数过程宏`crate`为了处理Rust代码而需要的代码

注意我们已经将代码分成了`hello_macro_derive`函数（负责解析`TokenStream`）和`impl_hello_macro`函数（负责转换语法树）：这使得编写过程宏更方便。外部函数（在这种情况下是`hello_macro_derive`）中的代码对于你看到或创建的几乎每个过程宏`crate`都是相同的。你在内部函数（在这种情况下是`impl_hello_macro`）主体中指定的代码将根据你的过程宏的目的而有所不同。

我们已经引入了三个新的`crate`：`proc_macro`、[syn](https://crates.io/crates/syn)和[quote](https://crates.io/crates/quote)。`proc_macro` crate随Rust一起提供，所以我们不需要将其添加到Cargo.toml中的依赖项中。`proc_macro` crate是编译器的API，允许我们从我们的代码中读取和操作Rust代码。

`syn` crate将Rust代码从字符串解析为我们可以执行操作的数据结构。`quote` crate将`syn`数据结构转换回Rust代码。这些`crate`使解析我们可能想要处理的任何类型的Rust代码变得更加简单：为Rust代码编写完整的解析器不是一项简单的任务。

当库用户在类型上指定`#[derive(HelloMacro)]`时，将调用`hello_macro_derive`函数。这是可能的，因为我们在这里用`proc_macro_derive`注解了`hello_macro_derive`函数并指定了名称`HelloMacro`，它与我们的`trait`名称匹配；这是大多数过程宏遵循的约定。

`hello_macro_derive`函数首先将输入从`TokenStream`转换为我们可以解释和执行操作的数据结构。这就是`syn`发挥作用的地方。`syn`中的`parse`函数接受`TokenStream`并返回表示解析的Rust代码的`DeriveInput`结构。示例20-41显示了我们从解析`struct Pancakes;`字符串中获得的`DeriveInput`结构的相关部分。

```rust
DeriveInput {
    // --snip--

    ident: Ident {
        ident: "Pancakes",
        span: #0 bytes(95..103)
    },
    data: Struct(
        DataStruct {
            struct_token: Struct,
            fields: Unit,
            semi_token: Some(
                Semi
            )
        }
    )
}
```

示例20-41：当解析示例20-37中具有宏属性的代码时，我们获得的`DeriveInput`实例

此结构的字段显示我们解析的Rust代码是一个单元结构，其`ident`（标识符，表示名称）为`Pancakes`。此结构上有更多字段用于描述各种Rust代码；查看[`DeriveInput`的syn文档](https://docs.rs/syn/2.0/syn/struct.DeriveInput.html)以获取更多信息。

很快我们将定义`impl_hello_macro`函数，这是我们构建要包含的新Rust代码的地方。但在我们这样做之前，请注意我们的`derive`宏的输出也是`TokenStream`。返回的`TokenStream`被添加到我们的`crate`用户编写的代码中，因此当他们编译他们的`crate`时，他们将获得我们在修改的`TokenStream`中提供的额外功能。

你可能已经注意到，如果对`syn::parse`函数的调用失败，我们调用`unwrap`来导致`hello_macro_derive`函数恐慌。我们的过程宏有必要在错误时恐慌，因为`proc_macro_derive`函数必须返回`TokenStream`而不是`Result`以符合过程宏API。我们通过使用`unwrap`简化了此示例；在生产代码中，你应该通过使用`panic!`或`expect`提供更具体的错误消息，说明出了什么问题。

现在我们有了将带注解的Rust代码从`TokenStream`转换为`DeriveInput`实例的代码，让我们生成在带注解类型上实现`HelloMacro` trait的代码，如示例20-42所示。

文件名：hello_macro_derive/src/lib.rs：

```rust
use proc_macro::TokenStream;
use quote::quote;

#[proc_macro_derive(HelloMacro)]
pub fn hello_macro_derive(input: TokenStream) -> TokenStream {
    // Construct a representation of Rust code as a syntax tree
    // that we can manipulate
    let ast = syn::parse(input).unwrap();

    // Build the trait implementation
    impl_hello_macro(&ast)
}

fn impl_hello_macro(ast: &syn::DeriveInput) -> TokenStream {
    let name = &ast.ident;
    let generated = quote! {
        impl HelloMacro for #name {
            fn hello_macro() {
                println!("Hello, Macro! My name is {}!", stringify!(#name));
            }
        }
    };
    generated.into()
}
```

示例20-42：使用解析的Rust代码实现`HelloMacro` trait

我们使用`ast.ident`获得包含带注解类型名称（标识符）的`Ident`结构实例。示例20-33中的结构显示，当我们在示例20-31中的代码上运行`impl_hello_macro`函数时，我们获得的`ident`将具有值为`"Pancakes"`的`ident`字段。因此，示例20-34中的`name`变量将包含一个`Ident`结构实例，当打印时，将是字符串`"Pancakes"`，即示例20-37中结构的名称。

`quote!`宏让我们定义我们想要返回的Rust代码。编译器期望的东西与`quote!`宏执行的直接结果不同，因此我们需要将其转换为`TokenStream`。我们通过调用`into`方法来做到这一点，该方法消耗这个中间表示并返回所需的`TokenStream`类型的值。

`quote!`宏还提供了一些非常酷的模板机制：我们可以输入`#name`，`quote!`会用变量`name`中的值替换它。你甚至可以进行一些类似于常规宏工作方式的重复。查看[`quote` crate的文档](https://docs.rs/quote)以获得全面的介绍。

我们希望我们的过程宏为用户注解的类型生成我们的`HelloMacro` trait的实现，我们可以通过使用`#name`获得该类型。`trait`实现有一个函数`hello_macro`，其主体包含我们想要提供的功能：打印`Hello, Macro! My name is`然后是带注解类型的名称。

这里使用的`stringify!`宏内置于Rust中。它接受一个Rust表达式，如`1 + 2`，并在编译时将表达式转换为字符串字面量，如`"1 + 2"`。这与`format!`或`println!`宏不同，后者计算表达式然后将结果转换为`String`。有可能`#name`输入可能是要按字面打印的表达式，所以我们使用`stringify!`。使用`stringify!`还通过在编译时将`#name`转换为字符串字面量来节省分配。

此时，`cargo build`应该在`hello_macro`和`hello_macro_derive`中都成功完成。让我们将这些`crate`连接到示例20-31中的代码，看看过程宏的运行情况！使用`cargo new pancakes`在你的项目目录中创建一个新的二进制项目。我们需要将`hello_macro`和`hello_macro_derive`作为依赖项添加到`pancakes` crate的Cargo.toml中。如果你将你的`hello_macro`和`hello_macro_derive`版本发布到crates.io，它们将是常规依赖项；如果没有，你可以将它们指定为路径依赖项，如下所示：

```rust
hello_macro = { path = "../hello_macro" }
hello_macro_derive = { path = "../hello_macro/hello_macro_derive" }
```

将示例20-37中的代码放入src/main.rs，然后运行`cargo run`：它应该打印`Hello, Macro! My name is Pancakes!`来自过程宏的`HelloMacro` trait的实现被包含在内，而`pancakes` crate不需要实现它；`#[derive(HelloMacro)]`添加了`trait`实现。

接下来，让我们探索其他类型的过程宏与自定义`derive`宏的不同之处。

