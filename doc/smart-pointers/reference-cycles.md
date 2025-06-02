## 引用循环可能导致内存泄漏

Rust的内存安全保证使得意外创建永远不会被清理的内存（即内存泄漏）变得困难，但并非不可能。完全防止内存泄漏并不是Rust的保证之一，这意味着在Rust中内存泄漏是内存安全的。我们可以看到，通过使用`Rc<T>`和`RefCell<T>`，Rust允许内存泄漏：可以创建项目相互引用形成循环的引用。这会导致内存泄漏，因为循环中每个项目的引用计数永远不会达到0，这些值永远不会被丢弃。

### 创建引用循环

让我们看看引用循环是如何发生的以及如何防止它，首先从示例15-25中的`List`枚举定义和`tail`方法开始。

文件名: src/main.rs:

```rust
use crate::List::{Cons, Nil};
use std::cell::RefCell;
use std::rc::Rc;

#[derive(Debug)]
enum List {
    Cons(i32, RefCell<Rc<List>>),
    Nil,
}

impl List {
    fn tail(&self) -> Option<&RefCell<Rc<List>>> {
        match self {
            Cons(_, item) => Some(item),
            Nil => None,
        }
    }
}

fn main() {}
```

示例 15-25：一个包含`RefCell<T>`的cons列表定义，使我们能够修改`Cons`变体引用的内容

我们使用了与示例15-5中不同的`List`定义变体。`Cons`变体中的第二个元素现在是`RefCell<Rc<List>>`，这意味着我们不是像在示例15-24中那样修改`i32`值，而是要修改`Cons`变体指向的`List`值。我们还添加了一个`tail`方法，使我们能够方便地访问`Cons`变体的第二个项目。

在示例15-26中，我们添加了一个使用示例15-25中定义的`main`函数。这段代码在`a`中创建一个列表，在`b`中创建一个指向`a`中列表的列表。然后它修改`a`中的列表使其指向`b`，从而创建一个引用循环。在这个过程中，有一些`println!`语句用来显示在各个点上的引用计数。

文件名: src/main.rs:

```rust
use crate::List::{Cons, Nil};
use std::cell::RefCell;
use std::rc::Rc;

#[derive(Debug)]
enum List {
    Cons(i32, RefCell<Rc<List>>),
    Nil,
}

impl List {
    fn tail(&self) -> Option<&RefCell<Rc<List>>> {
        match self {
            Cons(_, item) => Some(item),
            Nil => None,
        }
    }
}

fn main() {
    let a = Rc::new(Cons(5, RefCell::new(Rc::new(Nil))));

    println!("a initial rc count = {}", Rc::strong_count(&a));
    println!("a next item = {:?}", a.tail());

    let b = Rc::new(Cons(10, RefCell::new(Rc::clone(&a))));

    println!("a rc count after b creation = {}", Rc::strong_count(&a));
    println!("b initial rc count = {}", Rc::strong_count(&b));
    println!("b next item = {:?}", b.tail());

    if let Some(link) = a.tail() {
        *link.borrow_mut() = Rc::clone(&b);
    }

    println!("b rc count after changing a = {}", Rc::strong_count(&b));
    println!("a rc count after changing a = {}", Rc::strong_count(&a));

    // Uncomment the next line to see that we have a cycle;
    // it will overflow the stack.
    // println!("a next item = {:?}", a.tail());
}
```

示例 15-26：创建两个相互指向的`List`值的引用循环

我们创建了一个`Rc<List>`实例，在变量`a`中保存一个初始值为5的`List`值和`Nil`。然后我们创建另一个`Rc<List>`实例，在变量`b`中保存另一个`List`值，其中包含值`10`并指向`a`中的列表。

我们修改`a`使其指向`b`而不是`Nil`，从而创建一个循环。我们通过使用`tail`方法获取`a`中的`RefCell<Rc<List>>`的引用，并将其放入变量`link`中。然后我们在`RefCell<Rc<List>>`上使用`borrow_mut`方法，将其内部的值从持有`Nil`值的`Rc<List>`更改为`b`中的`Rc<List>`。

当我们运行这段代码时，暂时保持最后一个`println!`被注释掉，我们将得到以下输出：

```rust
$ cargo run
   Compiling cons-list v0.1.0 (file:///projects/cons-list)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.53s
     Running `target/debug/cons-list`
a initial rc count = 1
a next item = Some(RefCell { value: Nil })
a rc count after b creation = 2
b initial rc count = 1
b next item = Some(RefCell { value: Cons(5, RefCell { value: Nil }) })
b rc count after changing a = 2
a rc count after changing a = 2
```

在我们将`a`中的列表更改为指向`b`后，`a`和`b`中的`Rc<List>`实例的引用计数都是2。在`main`结束时，Rust会丢弃变量`b`，这会将`b`的`Rc<List>`实例的引用计数从2减少到1。此时，`Rc<List>`在堆上的内存不会被丢弃，因为它的引用计数是1，而不是0。然后Rust丢弃`a`，这也会将`a`的`Rc<List>`实例的引用计数从2减少到1。这个实例的内存也不能被丢弃，因为另一个`Rc<List>`实例仍然引用它。分配给列表的内存将永远不会被回收。为了可视化这个引用循环，我们创建了图15-4中的图表。

![](../images/trpl15-04.svg)

图15-4：列表`a`和`b`相互指向的引用循环

如果你取消注释最后一个`println!`并运行程序，Rust将尝试打印这个循环，`a`指向`b`，`b`指向`a`，依此类推，直到堆栈溢出。

与实际程序相比，在这个例子中创建引用循环的后果并不是很严重：在我们创建引用循环后，程序就结束了。然而，如果一个更复杂的程序在循环中分配了大量内存并长时间保持它，程序将使用比需要更多的内存，可能会使系统不堪重负，导致可用内存耗尽。

创建引用循环并不容易，但也不是不可能。如果你有包含`Rc<T>`值的`RefCell<T>`值，或者类似的具有内部可变性和引用计数的类型的嵌套组合，你必须确保不创建循环；你不能依赖Rust来捕获它们。创建引用循环将是程序中的逻辑错误，你应该使用自动化测试、代码审查和其他软件开发实践来最小化它。

避免引用循环的另一个解决方案是重新组织你的数据结构，使一些引用表示所有权，而一些引用不表示所有权。因此，你可以有由一些所有权关系和一些非所有权关系组成的循环，只有所有权关系影响一个值是否可以被丢弃。在示例15-25中，我们总是希望`Cons`变体拥有它们的列表，所以重新组织数据结构是不可能的。让我们看一个使用由父节点和子节点组成的图的例子，看看非所有权关系何时是防止引用循环的适当方式。

### 使用`Weak<T>`防止引用循环

到目前为止，我们已经证明调用`Rc::clone`会增加`Rc<T>`实例的`strong_count`，并且只有当`strong_count`为0时，`Rc<T>`实例才会被清理。你也可以通过调用`Rc::downgrade`并传递对`Rc<T>`的引用来创建对`Rc<T>`实例中值的弱引用。强引用是你共享`Rc<T>`实例所有权的方式。弱引用不表示所有权关系，它们的计数不影响`Rc<T>`实例何时被清理。它们不会导致引用循环，因为一旦涉及的值的强引用计数为0，任何包含弱引用的循环都会被打破。

当你调用`Rc::downgrade`时，你会得到一个类型为`Weak<T>`的智能指针。与将`Rc<T>`实例中的`strong_count`增加1不同，调用`Rc::downgrade`会将`weak_count`增加1。`Rc<T>`类型使用`weak_count`来跟踪存在多少个`Weak<T>`引用，类似于`strong_count`。不同之处在于，`Rc<T>`实例被清理时，`weak_count`不需要为0。

因为`Weak<T>`引用的值可能已经被丢弃，所以要对`Weak<T>`指向的值做任何操作，你必须确保该值仍然存在。通过在`Weak<T>`实例上调用upgrade方法来实现这一点，该方法将返回一个`Option<Rc<T>>`。如果`Rc<T>`值尚未被丢弃，你将得到`Some`结果，如果`Rc<T>`值已被丢弃，则得到None结果。因为`upgrade`返回一个`Option<Rc<T>>`，Rust将确保Some情况和None情况都得到处理，不会有无效指针。

作为一个例子，我们将创建一个树，其中的项目不仅知道下一个项目，还知道它们的子项目和父项目。

### 创建树形数据结构：带有子节点的节点

首先，我们将构建一个树，其中的节点知道它们的子节点。我们将创建一个名为`Node`的结构体，它持有自己的`i32`值以及对其子`Node`值的引用：

文件名: src/main.rs:

```rust
use std::cell::RefCell;
use std::rc::Rc;

#[derive(Debug)]
struct Node {
    value: i32,
    children: RefCell<Vec<Rc<Node>>>,
}

fn main() {
    let leaf = Rc::new(Node {
        value: 3,
        children: RefCell::new(vec![]),
    });

    let branch = Rc::new(Node {
        value: 5,
        children: RefCell::new(vec![Rc::clone(&leaf)]),
    });
}
```

我们希望`Node`拥有其子节点，并且我们希望与变量共享这种所有权，以便我们可以直接访问树中的每个`Node`。为此，我们将`Vec<T>`项定义为`Rc<Node>`类型的值。我们还希望修改哪些节点是另一个节点的子节点，所以我们在`Vec<Rc<Node>>`周围有一个`RefCell<T>`。

接下来，我们将使用我们的结构体定义并创建一个名为`leaf`的`Node`实例，其值为3且没有子节点，以及另一个名为`branch`的实例，其值为`5`且`leaf`是其子节点之一，如示例15-27所示。

文件名: src/main.rs:

```rust
use std::cell::RefCell;
use std::rc::Rc;

#[derive(Debug)]
struct Node {
    value: i32,
    children: RefCell<Vec<Rc<Node>>>,
}

fn main() {
    let leaf = Rc::new(Node {
        value: 3,
        children: RefCell::new(vec![]),
    });

    let branch = Rc::new(Node {
        value: 5,
        children: RefCell::new(vec![Rc::clone(&leaf)]),
    });
}
```

示例 15-27：创建一个没有子节点的`leaf`节点和一个以`leaf`为子节点之一的`branch`节点

我们克隆`leaf`中的`Rc<Node>`并将其存储在`branch`中，这意味着`leaf`中的`Node`现在有两个所有者：`leaf`和`branch`。我们可以通过`branch.children`从`branch`到达`leaf`，但没有办法从`leaf`到达`branch`。原因是`leaf`没有对`branch`的引用，不知道它们有关联。我们希望`leaf`知道`branch`是它的父节点。接下来我们将实现这一点。

### 从子节点添加对其父节点的引用

为了让子节点知道其父节点，我们需要在`Node`结构体定义中添加一个`parent`字段。问题在于决定`parent`的类型应该是什么。我们知道它不能包含`Rc<T>`，因为这会创建一个引用循环，`leaf.parent`指向`branch`，`branch.children`指向`leaf`，这将导致它们的`strong_count`值永远不会为0。

从另一个角度思考关系，父节点应该拥有其子节点：如果父节点被丢弃，其子节点也应该被丢弃。然而，子节点不应该拥有其父节点：如果我们丢弃一个子节点，父节点应该仍然存在。这是弱引用的应用场景！

因此，我们将使`parent`的类型使用`Weak<T>`而不是`Rc<T>`，具体来说是`RefCell<Weak<Node>>`。现在我们的`Node`结构体定义如下：

Filename: src/main.rs:

```rust
use std::cell::RefCell;
use std::rc::{Rc, Weak};

#[derive(Debug)]
struct Node {
    value: i32,
    parent: RefCell<Weak<Node>>,
    children: RefCell<Vec<Rc<Node>>>,
}

fn main() {
    let leaf = Rc::new(Node {
        value: 3,
        parent: RefCell::new(Weak::new()),
        children: RefCell::new(vec![]),
    });

    println!("leaf parent = {:?}", leaf.parent.borrow().upgrade());

    let branch = Rc::new(Node {
        value: 5,
        parent: RefCell::new(Weak::new()),
        children: RefCell::new(vec![Rc::clone(&leaf)]),
    });

    *leaf.parent.borrow_mut() = Rc::downgrade(&branch);

    println!("leaf parent = {:?}", leaf.parent.borrow().upgrade());
}
```

一个节点将能够引用其父节点，但并不拥有其父节点。在示例15-28中，我们更新了`main`函数以使用这个新的定义，这样`leaf`节点就有了引用其父节点`branch`的方法。

文件名: src/main.rs:

```rust
use std::cell::RefCell;
use std::rc::{Rc, Weak};

#[derive(Debug)]
struct Node {
    value: i32,
    parent: RefCell<Weak<Node>>,
    children: RefCell<Vec<Rc<Node>>>,
}

fn main() {
    let leaf = Rc::new(Node {
        value: 3,
        parent: RefCell::new(Weak::new()),
        children: RefCell::new(vec![]),
    });

    println!("leaf parent = {:?}", leaf.parent.borrow().upgrade());

    let branch = Rc::new(Node {
        value: 5,
        parent: RefCell::new(Weak::new()),
        children: RefCell::new(vec![Rc::clone(&leaf)]),
    });

    *leaf.parent.borrow_mut() = Rc::downgrade(&branch);

    println!("leaf parent = {:?}", leaf.parent.borrow().upgrade());
}
```

示例 15-28：一个`leaf`节点对其父节点`branch`的弱引用

创建`leaf`节点看起来与示例15-27类似，除了`parent`字段：`leaf`开始时没有父节点，所以我们创建了一个新的、空的`Weak<Node>`引用实例。

此时，当我们尝试使用`upgrade`方法获取`leaf`的父节点的引用时，我们得到一个`None`值。我们在第一个`println!`语句的输出中看到了这一点：

```rust
leaf parent = None
```

当我们创建`branch`节点时，它的`parent`字段也将有一个新的`Weak<Node>`引用，因为`branch`没有父节点。我们仍然将`leaf`作为`branch`的子节点之一。一旦我们在`branch`中有了`Node`实例，我们就可以修改`leaf`，使其拥有对其父节点的`Weak<Node>`引用。我们在`leaf`的`parent`字段中的`RefCell<Weak<Node>>`上使用`borrow_mut`方法，然后使用`Rc::downgrade`函数从`branch`中的`Rc<Node>`创建一个对`branch`的`Weak<Node>`引用。

当我们打印`leaf`的父节点时，这次我们将得到一个包含`branch`的`Some`变体：现在`leaf`可以访问其父节点了！当我们打印`leaf`时，我们也避免了像示例15-26中那样最终导致堆栈溢出的循环；`Weak<Node>`引用被打印为`(Weak)`：

```rust
leaf parent = Some(Node { value: 5, parent: RefCell { value: (Weak) },
children: RefCell { value: [Node { value: 3, parent: RefCell { value: (Weak) },
children: RefCell { value: [] } }] } })
```

没有无限输出表明这段代码没有创建引用循环。我们也可以通过查看调用`Rc::strong_count`和`Rc::weak_count`得到的值来判断这一点。

### 可视化`strong_count`和`weak_count`的变化

让我们看看通过创建一个新的内部作用域并将`branch`的创建移动到该作用域中，`Rc<Node>`实例的`strong_count`和`weak_count`值如何变化。通过这样做，我们可以看到当`branch`被创建并在超出作用域时被丢弃时会发生什么。修改如示例15-29所示。

文件名: src/main.rs:

```rust
use std::cell::RefCell;
use std::rc::{Rc, Weak};

#[derive(Debug)]
struct Node {
    value: i32,
    parent: RefCell<Weak<Node>>,
    children: RefCell<Vec<Rc<Node>>>,
}

fn main() {
    let leaf = Rc::new(Node {
        value: 3,
        parent: RefCell::new(Weak::new()),
        children: RefCell::new(vec![]),
    });

    println!(
        "leaf strong = {}, weak = {}",
        Rc::strong_count(&leaf),
        Rc::weak_count(&leaf),
    );

    {
        let branch = Rc::new(Node {
            value: 5,
            parent: RefCell::new(Weak::new()),
            children: RefCell::new(vec![Rc::clone(&leaf)]),
        });

        *leaf.parent.borrow_mut() = Rc::downgrade(&branch);

        println!(
            "branch strong = {}, weak = {}",
            Rc::strong_count(&branch),
            Rc::weak_count(&branch),
        );

        println!(
            "leaf strong = {}, weak = {}",
            Rc::strong_count(&leaf),
            Rc::weak_count(&leaf),
        );
    }

    println!("leaf parent = {:?}", leaf.parent.borrow().upgrade());
    println!(
        "leaf strong = {}, weak = {}",
        Rc::strong_count(&leaf),
        Rc::weak_count(&leaf),
    );
}
```

示例 15-29：在内部作用域中创建`branch`并检查强引用和弱引用计数

创建`leaf`后，其`Rc<Node>`的强引用计数为1，弱引用计数为0。在内部作用域中，我们创建`branch`并将其与`leaf`关联，此时当我们打印计数时，`branch`中的`Rc<Node>`的强引用计数为1，弱引用计数为1（因为`leaf.parent`通过`Weak<Node>`指向`branch`）。当我们打印`leaf`中的计数时，我们将看到它的强引用计数为2，因为`branch`现在在`branch.children`中存储了`leaf`的`Rc<Node>`的克隆，但弱引用计数仍为0。

当内部作用域结束时，`branch`超出作用域，`Rc<Node>`的强引用计数减少到0，因此其`Node`被丢弃。来自`leaf.parent`的弱引用计数1对`Node`是否被丢弃没有影响，所以我们没有内存泄漏！

如果在作用域结束后尝试访问`leaf`的父节点，我们将再次得到`None`。在程序结束时，`leaf`中的`Rc<Node>`的强引用计数为1，弱引用计数为0，因为变量`leaf`现在再次成为对`Rc<Node>`的唯一引用。

所有管理计数和值丢弃的逻辑都内置在`Rc<T>`和`Weak<T>`及其`Drop` trait的实现中。通过在`Node`的定义中指定子节点到其父节点的关系应该是`Weak<T>`引用，你就可以让父节点指向子节点，反之亦然，而不会创建引用循环和内存泄漏。

## 总结

本章介绍了如何使用智能指针来实现与Rust默认的常规引用不同的保证和权衡。`Box<T>`类型具有已知大小，并指向分配在堆上的数据。`Rc<T>`类型跟踪堆上数据的引用数量，以便数据可以有多个所有者。`RefCell<T>`类型及其内部可变性为我们提供了一种类型，当我们不需要可变类型但需要更改该类型的内部值时可以使用它；它还在运行时而不是编译时强制执行借用规则。

本章还讨论了`Deref`和`Drop` trait，它们实现了智能指针的许多功能。我们探讨了可能导致内存泄漏的引用循环，以及如何使用`Weak<T>`来防止它们。

如果本章引起了你的兴趣，并且你想实现自己的智能指针，请查阅[“The Rustonomicon”](https://doc.rust-lang.org/nomicon/index.html)以获取更多有用的信息。

接下来，我们将讨论Rust中的并发。你甚至会学到一些新的智能指针。