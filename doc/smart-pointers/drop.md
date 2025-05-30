## 使用`Drop`特性在清理时运行代码

对于智能指针模式来说，第二个重要的特性是`Drop`，它允许你自定义当值即将离开作用域时发生的事情。你可以为任何类型提供`Drop`特性的实现，这段代码可以用来释放资源，如文件或网络连接。

我们在智能指针的上下文中介绍`Drop`，因为`Drop`特性的功能几乎总是在实现智能指针时使用。例如，当`Box<T>`被丢弃时，它会释放该box指向的堆上的空间。

在某些语言中，对于某些类型，程序员必须在每次使用完这些类型的实例后调用代码来释放内存或资源。例如文件句柄、套接字和锁。如果他们忘记了，系统可能会过载并崩溃。在Rust中，你可以指定当值离开作用域时运行特定的代码，编译器会自动插入这段代码。因此，你不需要小心地在程序中的每个地方放置清理代码，即使特定类型的实例已经完成——你仍然不会泄漏资源！

你通过实现`Drop`特性来指定当值离开作用域时要运行的代码。`Drop`特性要求你实现一个名为`drop`的方法，该方法接受一个对`self`的可变引用。为了看看Rust何时调用`drop`，让我们暂时用`println!`语句来实现`drop`。

示例15-14展示了一个`CustomSmartPointer`结构体，其唯一的自定义功能是当实例离开作用域时打印`Dropping CustomSmartPointer!`，以显示Rust何时运行`drop`方法。

文件名: src/main.rs:

```rust
struct CustomSmartPointer {
    data: String,
}

impl Drop for CustomSmartPointer {
    fn drop(&mut self) {
        println!("Dropping CustomSmartPointer with data `{}`!", self.data);
    }
}

fn main() {
    let c = CustomSmartPointer {
        data: String::from("my stuff"),
    };
    let d = CustomSmartPointer {
        data: String::from("other stuff"),
    };
    println!("CustomSmartPointers created.");
}
```

示例15-14：实现了`Drop`特性的`CustomSmartPointer`结构体，我们会在其中放置清理代码

`Drop`特性包含在预导入（prelude）中，所以我们不需要将其引入作用域。我们在`CustomSmartPointer`上实现`Drop`特性，并为调用`println!`的`drop`方法提供实现。`drop`方法的主体是你放置任何你希望在类型实例离开作用域时运行的逻辑的地方。我们在这里打印一些文本，以直观地演示Rust何时调用`drop`。

在`main`中，我们创建了两个`CustomSmartPointer`实例，然后打印`CustomSmartPointers created`。在`main`的末尾，我们的`CustomSmartPointer`实例将离开作用域，Rust将调用我们放在`drop`方法中的代码，打印我们的最终消息。注意，我们不需要显式调用`drop`方法。

当我们运行这个程序时，我们将看到以下输出：

```rust
$ cargo run
   Compiling drop-example v0.1.0 (file:///projects/drop-example)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.60s
     Running `target/debug/drop-example`
CustomSmartPointers created.
Dropping CustomSmartPointer with data `other stuff`!
Dropping CustomSmartPointer with data `my stuff`!
```

当我们的实例离开作用域时，Rust自动为我们调用了`drop`，调用了我们指定的代码。变量按照创建顺序的相反顺序被丢弃，所以`d`在`c`之前被丢弃。这个例子的目的是给你一个关于`drop`方法如何工作的直观指南；通常你会指定你的类型需要运行的清理代码，而不是打印消息。

不幸的是，禁用自动`drop`功能并不简单。禁用`drop`通常是不必要的；`Drop`特性的全部要点是它会被自动处理。然而，有时你可能想要提前清理一个值。一个例子是当使用管理锁的智能指针时：你可能想要强制调用释放锁的`drop`方法，这样同一作用域中的其他代码就可以获取锁。Rust不允许你手动调用`Drop`特性的`drop`方法；相反，如果你想强制一个值在其作用域结束前被丢弃，你必须调用标准库提供的`std::mem::drop`函数。

如果我们尝试通过修改示例15-14中的`main`函数来手动调用`Drop`特性的`drop`方法，如示例15-15所示，我们会得到一个编译错误。

文件名: src/main.rs:

```rust
struct CustomSmartPointer {
    data: String,
}

impl Drop for CustomSmartPointer {
    fn drop(&mut self) {
        println!("Dropping CustomSmartPointer with data `{}`!", self.data);
    }
}

fn main() {
    let c = CustomSmartPointer {
        data: String::from("some data"),
    };
    println!("CustomSmartPointer created.");
    c.drop();
    println!("CustomSmartPointer dropped before the end of main.");
}
```

示例15-15：尝试手动调用`Drop`特性的`drop`方法以提前清理

当我们尝试编译这段代码时，我们会得到这个错误：

```rust
$ cargo run
   Compiling drop-example v0.1.0 (file:///projects/drop-example)
error[E0040]: explicit use of destructor method
  --> src/main.rs:16:7
   |
16 |     c.drop();
   |       ^^^^ explicit destructor calls not allowed
   |
help: consider using `drop` function
   |
16 |     drop(c);
   |     +++++ ~

For more information about this error, try `rustc --explain E0040`.
error: could not compile `drop-example` (bin "drop-example") due to 1 previous error
```

这个错误消息表明我们不允许显式调用`drop`。错误消息使用了析构函数这个术语，这是一个通用的编程术语，指的是清理实例的函数。析构函数类似于构造函数，后者创建一个实例。Rust中的`drop`函数是一种特定的析构函数。

Rust不允许我们显式调用`drop`，因为Rust仍然会在`main`结束时自动调用值上的`drop`。这会导致双重释放错误，因为Rust会尝试两次清理同一个值。

我们不能禁用当值离开作用域时自动插入`drop`，也不能显式调用`drop`方法。因此，如果我们需要强制提前清理一个值，我们使用`std::mem::drop`函数。

`std::mem::drop`函数与`Drop`特性中的`drop`方法不同。我们通过传递我们想要强制丢弃的值作为参数来调用它。该函数在预导入中，所以我们可以修改示例15-15中的`main`来调用`drop`函数，如示例15-16所示。

文件名: src/main.rs:

```rust
struct CustomSmartPointer {
    data: String,
}

impl Drop for CustomSmartPointer {
    fn drop(&mut self) {
        println!("Dropping CustomSmartPointer with data `{}`!", self.data);
    }
}

fn main() {
    let c = CustomSmartPointer {
        data: String::from("some data"),
    };
    println!("CustomSmartPointer created.");
    drop(c);
    println!("CustomSmartPointer dropped before the end of main.");
}
```

示例15-16：调用`std::mem::drop`在值离开作用域前显式丢弃它

运行这段代码将打印以下内容：

```rust
$ cargo run
   Compiling drop-example v0.1.0 (file:///projects/drop-example)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.73s
     Running `target/debug/drop-example`
CustomSmartPointer created.
Dropping CustomSmartPointer with data `some data`!
CustomSmartPointer dropped before the end of main.
```

文本<code>Dropping CustomSmartPointer with data `some data`</code>!打印在`CustomSmartPointer created`.和`CustomSmartPointer dropped before the end of main`.文本之间，表明`drop`方法代码被调用以在那一点丢弃`c`。

你可以以多种方式使用`Drop`特性实现中指定的代码，使清理变得方便和安全：例如，你可以用它来创建自己的内存分配器！使用`Drop`特性和Rust的所有权系统，你不必记得去清理，因为Rust会自动完成。

你也不必担心因意外清理仍在使用的值而导致的问题：确保引用始终有效的所有权系统也确保`drop`只在值不再被使用时调用一次。

现在我们已经研究了`Box<T>`和智能指针的一些特性，让我们看看标准库中定义的其他一些智能指针。