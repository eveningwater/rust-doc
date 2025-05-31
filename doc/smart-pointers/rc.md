## `Rc<T>`，引用计数智能指针

在大多数情况下，所有权是明确的：你确切地知道哪个变量拥有某个值。然而，有些情况下，单个值可能有多个所有者。例如，在图数据结构中，多个边可能指向同一个节点，而这个节点在概念上被所有指向它的边所共同拥有。只有当没有任何边指向它，也就是没有任何所有者时，节点才应该被清理。

你必须通过使用Rust的`Rc<T>`类型来显式启用多重所有权，`Rc<T>`是引用计数（reference counting）的缩写。`Rc<T>`类型会跟踪对一个值的引用数量，以确定该值是否仍在使用。如果对一个值的引用数量为零，则可以清理该值，而不会使任何引用变为无效。

可以将`Rc<T>`想象为家庭房间里的电视。当一个人进入房间观看电视时，他们会打开电视。其他人可以进入房间一起观看电视。当最后一个人离开房间时，他们会关掉电视，因为电视不再被使用。如果有人在其他人仍在观看时关掉电视，那么剩下的观众肯定会抗议！

当我们想在堆上分配一些数据供程序的多个部分读取，并且无法在编译时确定哪个部分最后完成对数据的使用时，我们会使用`Rc<T>`类型。如果我们知道哪个部分会最后完成，我们可以简单地让那个部分成为数据的所有者，然后编译时强制执行的正常所有权规则就会生效。

注意，`Rc<T>`仅适用于单线程场景。当我们在第16章讨论并发时，我们将介绍如何在多线程程序中进行引用计数。

### 使用`Rc<T>`共享数据

让我们回到示例15-5中的cons列表示例。回想一下，我们使用`Box<T>`定义了它。这次，我们将创建两个列表，它们都共享第三个列表的所有权。从概念上讲，这看起来类似于图15-3。

![](../images/trpl15-03.svg)

图15-3：两个列表`b`和`c`共享第三个列表`a`的所有权

我们将创建包含`5`和`10`的列表`a`。然后我们将创建另外两个列表：以`3`开头的`b`和以`4`开头的`c`。`b`和`c`列表随后都将继续到包含`5`和`10`的第一个`a`列表。换句话说，两个列表将共享包含`5`和`10`的第一个列表。

尝试使用我们用`Box<T>`定义的`List`来实现这个场景是行不通的，如示例15-17所示：

文件名: src/main.rs:

```rust
enum List {
    Cons(i32, Box<List>),
    Nil,
}

use crate::List::{Cons, Nil};

fn main() {
    let a = Cons(5, Box::new(Cons(10, Box::new(Nil))));
    let b = Cons(3, Box::new(a));
    let c = Cons(4, Box::new(a));
}
```

示例15-17：演示我们不允许使用`Box<T>`的两个列表尝试共享第三个列表的所有权

当我们编译这段代码时，会得到这个错误：

```rust
$ cargo run
   Compiling cons-list v0.1.0 (file:///projects/cons-list)
error[E0382]: use of moved value: `a`
  --> src/main.rs:11:30
   |
9  |     let a = Cons(5, Box::new(Cons(10, Box::new(Nil))));
   |         - move occurs because `a` has type `List`, which does not implement the `Copy` trait
10 |     let b = Cons(3, Box::new(a));
   |                              - value moved here
11 |     let c = Cons(4, Box::new(a));
   |                              ^ value used here after move

For more information about this error, try `rustc --explain E0382`.
error: could not compile `cons-list` (bin "cons-list") due to 1 previous error
```

`Cons`变体拥有它们持有的数据，所以当我们创建`b`列表时，`a`被移动到`b`中，`b`拥有`a`。然后，当我们尝试在创建`c`时再次使用`a`时，我们不被允许这样做，因为`a`已经被移动了。

我们可以将`Cons`的定义改为持有引用，但是这样我们就必须指定生命周期参数。通过指定生命周期参数，我们将指定列表中的每个元素至少要活得和整个列表一样长。这对于示例15-17中的元素和列表来说是成立的，但并非在所有场景中都如此。

相反，我们将把`List`的定义改为使用`Rc<T>`代替`Box<T>`，如示例15-18所示。每个`Cons`变体现在将持有一个值和一个指向`List`的`Rc<T>`。当我们创建`b`时，不是获取`a`的所有权，而是克隆`a`持有的`Rc<List>`，从而将引用计数从一增加到二，让`a`和`b`共享`Rc<List>`中数据的所有权。当我们创建`c`时，我们也会克隆`a`，将引用计数从二增加到三。每次我们调用`Rc::clone`，`Rc<List>`中数据的引用计数就会增加，只有当引用计数为零时，数据才会被清理。

文件名: src/main.rs:

```rust
enum List {
    Cons(i32, Rc<List>),
    Nil,
}

use crate::List::{Cons, Nil};
use std::rc::Rc;

fn main() {
    let a = Rc::new(Cons(5, Rc::new(Cons(10, Rc::new(Nil)))));
    let b = Cons(3, Rc::clone(&a));
    let c = Cons(4, Rc::clone(&a));
}
```

示例15-18：使用`Rc<T>`的`List`定义

我们需要添加一个`use`语句来将`Rc<T>`引入作用域，因为它不在预导入模块中。在`main`中，我们创建了包含5和10的列表，并将其存储在一个新的`Rc<List>`中的`a`中。然后当我们创建`b`和`c`时，我们调用`Rc::clone`函数并传递对`a`中`Rc<List>`的引用作为参数。

我们可以调用`a.clone()`而不是`Rc::clone(&a)`，但是Rust的惯例是在这种情况下使用`Rc::clone`。`Rc::clone`的实现不像大多数类型的`clone`实现那样进行深拷贝。`Rc::clone`的调用只会增加引用计数，这不会花费太多时间。深拷贝数据可能需要大量时间。通过使用`Rc::clone`进行引用计数，我们可以在视觉上区分深拷贝类型的克隆和增加引用计数类型的克隆。当查找代码中的性能问题时，我们只需要考虑深拷贝克隆，可以忽略对`Rc::clone`的调用。

### 克隆`Rc<T>`会增加引用计数

让我们修改示例15-18中的工作示例，以便我们可以看到在创建和删除对`a`中`Rc<List>`的引用时引用计数如何变化。

在示例15-19中，我们将修改`main`，使其在列表`c`周围有一个内部作用域；然后我们可以看到当`c`离开作用域时引用计数如何变化。

文件名: src/main.rs:

```rust
enum List {
    Cons(i32, Rc<List>),
    Nil,
}

use crate::List::{Cons, Nil};
use std::rc::Rc;

fn main() {
    let a = Rc::new(Cons(5, Rc::new(Cons(10, Rc::new(Nil)))));
    println!("count after creating a = {}", Rc::strong_count(&a));
    let b = Cons(3, Rc::clone(&a));
    println!("count after creating b = {}", Rc::strong_count(&a));
    {
        let c = Cons(4, Rc::clone(&a));
        println!("count after creating c = {}", Rc::strong_count(&a));
    }
    println!("count after c goes out of scope = {}", Rc::strong_count(&a));
}
```

示例15-19：打印引用计数

在程序中引用计数变化的每个点，我们都会打印引用计数，这是通过调用`Rc::strong_count`函数获得的。这个函数被命名为`strong_count`而不是count，因为`Rc<T>`类型也有一个`weak_count`；我们将在["使用Weak<T>防止引用循环"](#)中看到`weak_count`的用途。

这段代码打印以下内容：

```rust
$ cargo run
   Compiling cons-list v0.1.0 (file:///projects/cons-list)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.45s
     Running `target/debug/cons-list`
count after creating a = 1
count after creating b = 2
count after creating c = 3
count after c goes out of scope = 2
```

我们可以看到`a`中的`Rc<List>`初始引用计数为1；然后每次我们调用`clone`，计数增加1。当`c`离开作用域时，计数减少1。我们不必像调用`Rc::clone`增加引用计数那样调用函数来减少引用计数：当`Rc<T>`值离开作用域时，`Drop`特性的实现会自动减少引用计数。

在这个例子中我们看不到的是，当`b`然后是`a`在`main`结束时离开作用域时，计数变为0，`Rc<List>`被完全清理。使用`Rc<T>`允许单个值有多个所有者，并且计数确保只要任何所有者仍然存在，该值就保持有效。

通过不可变引用，`Rc<T>`允许你在程序的多个部分之间共享数据，但仅用于读取。如果`Rc<T>`也允许你拥有多个可变引用，你可能会违反第4章中讨论的借用规则之一：对同一位置的多个可变借用可能导致数据竞争和不一致性。但是能够修改数据是非常有用的！在下一节中，我们将讨论内部可变性模式和`RefCell<T>`类型，你可以将其与`Rc<T>`结合使用，以处理这种不可变性限制。