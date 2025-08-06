## 高级函数和闭包

本节探讨与函数和闭包相关的一些高级功能，包括函数指针和返回闭包。

## 函数指针

我们已经讨论了如何将闭包传递给函数；你也可以将常规函数传递给函数！当你想要传递一个你已经定义的函数而不是定义一个新的闭包时，这种技术很有用。函数会强制转换为`fn`类型（小写的f），不要与`Fn`闭包`trait`混淆。`fn`类型被称为函数指针。使用函数指针传递函数将允许你将函数用作其他函数的参数。

指定参数是函数指针的语法类似于闭包的语法，如示例20-28所示，我们在其中定义了一个将1加到其参数的函数`add_one`。函数`do_twice`接受两个参数：一个指向任何接受`i32`参数并返回`i32`的函数的函数指针，以及一个`i32`值。`do_twice`函数调用函数`f`两次，向其传递`arg`值，然后将两个函数调用结果相加。`main`函数调用`do_twice`，参数为`add_one`和`5`。

文件名：src/main.rs：

```rust
fn add_one(x: i32) -> i32 {
    x + 1
}

fn do_twice(f: fn(i32) -> i32, arg: i32) -> i32 {
    f(arg) + f(arg)
}

fn main() {
    let answer = do_twice(add_one, 5);

    println!("The answer is: {answer}");
}
```

示例20-28：使用`fn`类型接受函数指针作为参数

这段代码打印`The answer is: 12`。我们指定`do_twice`中的参数`f`是一个`fn`，它接受一个`i32`类型的参数并返回一个`i32`。然后我们可以在`do_twice`的主体中调用`f`。在`main`中，我们可以将函数名`add_one`作为第一个参数传递给`do_twice`。

与闭包不同，`fn`是一个类型而不是`trait`，所以我们直接指定`fn`作为参数类型，而不是声明一个泛型类型参数，其中一个`Fn` trait作为trait约束。

函数指针实现了所有三个闭包`trait`（`Fn`、`FnMut`和`FnOnce`），这意味着你总是可以将函数指针作为期望闭包的函数的参数传递。最好使用泛型类型和其中一个闭包`trait`来编写函数，这样你的函数可以接受函数或闭包。

也就是说，你只想接受`fn`而不是闭包的一个例子是与没有闭包的外部代码接口时：C函数可以接受函数作为参数，但C没有闭包。

作为你可以使用内联定义的闭包或命名函数的示例，让我们看看标准库中`Iterator` trait提供的`map`方法的使用。要使用`map`方法将数字向量转换为字符串向量，我们可以使用闭包，如示例20-29所示。

```rust
fn main() {
    let list_of_numbers = vec![1, 2, 3];
    let list_of_strings: Vec<String> =
        list_of_numbers.iter().map(|i| i.to_string()).collect();
}
```

示例20-29：使用闭包和`map`方法将数字转换为字符串

或者我们可以将函数名作为`map`的参数，而不是闭包。示例20-30显示了这看起来会是什么样子。

```rust
fn main() {
    let list_of_numbers = vec![1, 2, 3];
    let list_of_strings: Vec<String> =
        list_of_numbers.iter().map(ToString::to_string).collect();
}
```

示例20-30：使用`String::to_string`方法将数字转换为字符串

注意我们必须使用我们在["高级特征"](./advanced-traits#高级特征)中讨论的完全限定语法，因为有多个名为`to_string`的函数可用。

这里，我们使用在`ToString` trait中定义的`to_string`函数，标准库为任何实现`Display`的类型实现了该trait。

回想第6章["枚举值"](../enums/defining-an-enum#枚举值)中，我们定义的每个枚举变体的名称也成为初始化函数。我们可以将这些初始化函数用作实现闭包`trait`的函数指针，这意味着我们可以将初始化函数指定为接受闭包的方法的参数，如示例20-31所示。

```rust
fn main() {
    enum Status {
        Value(u32),
        Stop,
    }

    let list_of_statuses: Vec<Status> = (0u32..20).map(Status::Value).collect();
}
```

示例20-31：使用枚举初始化器和`map`方法从数字创建`Status`实例

这里我们通过使用`Status::Value`的初始化函数，使用`map`调用的范围内的每个`u32`值创建`Status::Value`实例。有些人更喜欢这种风格，有些人更喜欢使用闭包。它们编译为相同的代码，所以使用对你来说更清楚的风格。

## 返回闭包

闭包由`trait`表示，这意味着你不能直接返回闭包。在大多数你可能想要返回`trait`的情况下，你可以使用实现该`trait`的具体类型作为函数的返回值。但是，你通常不能对闭包这样做，因为它们没有可返回的具体类型。例如，如果闭包从其作用域捕获任何值，则不允许使用函数指针`fn`作为返回类型。

相反，你通常会使用我们在第10章中学到的`impl Trait`语法。你可以使用`Fn`、`FnOnce`和`FnMut`返回任何函数类型。例如，示例20-32中的代码将正常工作。

```rust
#![allow(unused)]
fn main() {
    fn returns_closure() -> impl Fn(i32) -> i32 {
        |x| x + 1
    }
}
```

示例20-32：使用`impl Trait`语法从函数返回闭包

但是，正如我们在第13章["闭包类型推断和注解"](../functional-features/closures#闭包类型推断和注解)中指出的，每个闭包也是其自己的不同类型。如果你需要处理具有相同签名但不同实现的多个函数，你需要为它们使用trait对象。考虑如果你编写像示例20-33中所示的代码会发生什么。

文件名：src/main.rs：

```rust
fn main() {
    let handlers = vec![returns_closure(), returns_initialized_closure(123)];
    for handler in handlers {
        let output = handler(5);
        println!("{output}");
    }
}

fn returns_closure() -> impl Fn(i32) -> i32 {
    |x| x + 1
}

fn returns_initialized_closure(init: i32) -> impl Fn(i32) -> i32 {
    move |x| x + init
}
```

示例20-33：创建由返回`impl Fn`的函数定义的闭包的`Vec<T>`

这里我们有两个函数，`returns_closure`和`returns_initialized_closure`，它们都返回`impl Fn(i32) -> i32`。注意它们返回的闭包是不同的，即使它们实现相同的类型。如果我们尝试编译这个，Rust让我们知道它不会工作：

```rust
$ cargo build
   Compiling functions-example v0.1.0 (file:///projects/functions-example)
    error[E0308]: mismatched types
    --> src/main.rs:4:9
    |
    4  |         returns_initialized_closure(123)
    |         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ expected opaque type, found a different opaque type
    ...
    12 | fn returns_closure() -> impl Fn(i32) -> i32 {
    |                         ------------------- the expected opaque type
    ...
    16 | fn returns_initialized_closure(init: i32) -> impl Fn(i32) -> i32 {
    |                                              ------------------- the found opaque type
    |
    = note: expected opaque type `impl Fn(i32) -> i32` (opaque type at <src/main.rs:12:25>)
                found opaque type `impl Fn(i32) -> i32` (opaque type at <src/main.rs:16:46>)
    = note: distinct uses of `impl Trait` result in different opaque types

    For more information about this error, try `rustc --explain E0308`.
    error: could not compile `functions-example` (bin "functions-example") due to 1 previous error
```

错误消息告诉我们，每当我们返回`impl Trait`时，Rust会创建一个唯一的不透明类型，这是一种我们无法看到Rust为我们构造的细节的类型。因此，即使这些函数都返回实现相同`trait` `Fn(i32) -> i32`的闭包，Rust为每个生成的不透明类型都是不同的。这类似于Rust为不同的`async`块产生不同的具体类型，即使它们具有相同的输出类型，正如我们在第17章["处理任意数量的Future"](../async-await/more-futures#处理任意数量的-future)中看到的。我们现在已经多次看到了这个问题的解决方案：我们可以使用trait对象，如示例20-34所示。

```rust
fn main() {
    let handlers = vec![returns_closure(), returns_initialized_closure(123)];
    for handler in handlers {
        let output = handler(5);
        println!("{output}");
    }
}

fn returns_closure() -> Box<dyn Fn(i32) -> i32> {
    Box::new(|x| x + 1)
}

fn returns_initialized_closure(init: i32) -> Box<dyn Fn(i32) -> i32> {
    Box::new(move |x| x + init)
}
```

示例20-34：创建由返回`Box<dyn Fn>`的函数定义的闭包的`Vec<T>`，这样它们具有相同的类型

这段代码将正常编译。有关trait对象的更多信息，请参考第18章["使用trait对象来允许不同类型的值"](../oop/trait-objects#使用特征对象来允许不同类型的值)部分。

接下来，让我们看看宏！

