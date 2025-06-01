## `RefCell<T>`和内部可变性模式

内部可变性是Rust中的一种设计模式，它允许你在有不可变引用的情况下修改数据；通常，借用规则不允许这种操作。为了修改数据，该模式在数据结构内部使用`unsafe`代码来绕过Rust通常管理修改和借用的规则。Unsafe代码向编译器表明我们正在手动检查规则，而不是依赖编译器为我们检查；我们将在第20章中更多地讨论unsafe代码。

我们只能在确保借用规则在运行时会被遵守的情况下使用内部可变性模式的类型，即使编译器不能保证这一点。涉及的`unsafe`代码随后被包装在安全的API中，外部类型仍然是不可变的。

让我们通过查看遵循内部可变性模式的`RefCell<T>`类型来探索这个概念。

### 在运行时使用`RefCell<T>`强制执行借用规则

与`Rc<T>`不同，`RefCell<T>`类型表示对其持有的数据的单一所有权。那么，是什么让`RefCell<T>`与`Box<T>`这样的类型不同呢？回想一下你在第4章中学到的借用规则：

* 在任何给定时间，你可以拥有一个可变引用或任意数量的不可变引用（但不能同时拥有两者）。
* 引用必须始终有效。

对于引用和`Box<T>`，借用规则的不变性在编译时强制执行。而对于`RefCell<T>`，这些不变性在运行时强制执行。使用引用时，如果你违反了这些规则，你会得到一个编译错误。使用`RefCell<T>`时，如果你违反了这些规则，你的程序将会panic并退出。

在编译时检查借用规则的优点是错误会在开发过程的早期被发现，并且由于所有分析都是预先完成的，所以对运行时性能没有影响。出于这些原因，在大多数情况下，在编译时检查借用规则是最佳选择，这就是为什么这是Rust的默认行为。

而在运行时检查借用规则的优势在于某些内存安全的场景会被允许，而这些场景在编译时检查中会被禁止。静态分析，如Rust编译器，本质上是保守的。代码的某些属性通过分析代码是不可能检测到的：最著名的例子是停机问题，这超出了本书的范围，但是一个有趣的研究主题。

因为某些分析是不可能的，如果Rust编译器不能确定代码符合所有权规则，它可能会拒绝一个正确的程序；这样，它是保守的。如果Rust接受了一个不正确的程序，用户将无法信任Rust做出的保证。然而，如果Rust拒绝了一个正确的程序，程序员会感到不便，但不会发生灾难性的事情。当你确信你的代码遵循借用规则，但编译器无法理解和保证这一点时，`RefCell<T>`类型就很有用。

与`Rc<T>`类似，`RefCell<T>`仅用于单线程场景，如果你尝试在多线程上下文中使用它，将会得到一个编译时错误。我们将在第16章中讨论如何在多线程程序中获得`RefCell<T>`的功能。

以下是选择`Box<T>`、`Rc<T>`或`RefCell<T>`的原因概述：

* `Rc<T>`允许同一数据有多个所有者；`Box<T>`和`RefCell<T>`有单一所有者。
* `Box<T>`允许在编译时检查的不可变或可变借用；`Rc<T>`只允许在编译时检查的不可变借用；`RefCell<T>`允许在运行时检查的不可变或可变借用。
* 因为`RefCell<T>`允许在运行时检查的可变借用，你可以在`RefCell<T>`是不可变的情况下修改`RefCell<T>`内部的值。

在不可变值内部修改值就是内部可变性模式。让我们看一个内部可变性有用的情况，并检查它是如何实现的。

### 内部可变性：对不可变值的可变借用

借用规则的一个结果是，当你有一个不可变值时，你不能可变地借用它。例如，这段代码不会编译：

```rust
fn main() {
    let x = 5;
    let y = &mut x;
}
```

如果你尝试编译这段代码，你会得到以下错误：

```rust
$ cargo run
   Compiling borrowing v0.1.0 (file:///projects/borrowing)
error[E0596]: cannot borrow `x` as mutable, as it is not declared as mutable
 --> src/main.rs:3:13
  |
3 |     let y = &mut x;
  |             ^^^^^^ cannot borrow as mutable
  |
help: consider changing this to be mutable
  |
2 |     let mut x = 5;
  |         +++

For more information about this error, try `rustc --explain E0596`.
error: could not compile `borrowing` (bin "borrowing") due to 1 previous error
```

然而，在某些情况下，对于一个值在其方法中修改自身但对其他代码显示为不可变是有用的。值方法之外的代码将无法修改该值。使用`RefCell<T>`是获得内部可变性能力的一种方式，但`RefCell<T>`并没有完全绕过借用规则：编译器中的借用检查器允许这种内部可变性，而借用规则则在运行时检查。如果你违反了规则，你会得到一个`panic!`而不是编译器错误。

让我们通过一个实际的例子来了解如何使用`RefCell<T>`修改不可变值，并了解为什么这很有用。

#### 内部可变性的用例：模拟对象

有时在测试过程中，程序员会使用一种类型代替另一种类型，以观察特定行为并断言它被正确实现。这种占位类型被称为测试替身。可以将其想象为电影制作中的特技替身，一个人介入并替代演员完成特别棘手的场景。测试替身在我们运行测试时代替其他类型。模拟对象是测试替身的特定类型，它们记录测试期间发生的事情，以便你可以断言正确的操作已经发生。

Rust没有与其他语言相同意义上的对象，Rust的标准库中也没有像其他一些语言那样内置的模拟对象功能。然而，你绝对可以创建一个结构体，它将服务于与模拟对象相同的目的。

这是我们将要测试的场景：我们将创建一个库，它跟踪一个值与最大值的关系，并根据当前值与最大值的接近程度发送消息。例如，这个库可以用来跟踪用户被允许进行的API调用数量的配额。

我们的库只提供跟踪值与最大值的接近程度以及在什么时候应该发送什么消息的功能。使用我们库的应用程序将被期望提供发送消息的机制：应用程序可以在应用程序中放置消息，发送电子邮件，发送文本消息，或做其他事情。库不需要知道这些细节。它只需要一些实现我们将提供的名为`Messenger`的特性的东西。示例15-20显示了库代码。

文件名: src/lib.rs:

```rust
pub trait Messenger {
    fn send(&self, msg: &str);
}

pub struct LimitTracker<'a, T: Messenger> {
    messenger: &'a T,
    value: usize,
    max: usize,
}

impl<'a, T> LimitTracker<'a, T>
where
    T: Messenger,
{
    pub fn new(messenger: &'a T, max: usize) -> LimitTracker<'a, T> {
        LimitTracker {
            messenger,
            value: 0,
            max,
        }
    }

    pub fn set_value(&mut self, value: usize) {
        self.value = value;

        let percentage_of_max = self.value as f64 / self.max as f64;

        if percentage_of_max >= 1.0 {
            self.messenger.send("Error: You are over your quota!");
        } else if percentage_of_max >= 0.9 {
            self.messenger
                .send("Urgent warning: You've used up over 90% of your quota!");
        } else if percentage_of_max >= 0.75 {
            self.messenger
                .send("Warning: You've used up over 75% of your quota!");
        }
    }
}
```

示例15-20：一个库，用于跟踪一个值与最大值的接近程度，并在值达到特定水平时发出警告

这段代码的一个重要部分是`Messenger`特性有一个名为`send`的方法，它接受一个对`self`的不可变引用和消息的文本。这个特性是我们的模拟对象需要实现的接口，以便模拟对象可以以与真实对象相同的方式使用。另一个重要部分是我们想要测试`LimitTracker`上的`set_value`方法的行为。我们可以改变我们为`value`参数传入的内容，但`set_value`不返回任何东西供我们进行断言。我们希望能够说，如果我们创建一个`LimitTracker`，其中包含实现了`Messenger`特性的东西和一个特定的`max`值，当我们为`value`传递不同的数字时，messenger被告知发送适当的消息。

我们需要一个模拟对象，当我们调用`send`时，它不会发送电子邮件或文本消息，而只会跟踪它被告知要发送的消息。我们可以创建模拟对象的新实例，创建使用模拟对象的`LimitTracker`，在`LimitTracker`上调用`set_value`方法，然后检查模拟对象是否有我们期望的消息。示例15-21显示了实现模拟对象的尝试，但借用检查器不允许这样做。

文件名: src/lib.rs:

```rust
pub trait Messenger {
    fn send(&self, msg: &str);
}

pub struct LimitTracker<'a, T: Messenger> {
    messenger: &'a T,
    value: usize,
    max: usize,
}

impl<'a, T> LimitTracker<'a, T>
where
    T: Messenger,
{
    pub fn new(messenger: &'a T, max: usize) -> LimitTracker<'a, T> {
        LimitTracker {
            messenger,
            value: 0,
            max,
        }
    }

    pub fn set_value(&mut self, value: usize) {
        self.value = value;

        let percentage_of_max = self.value as f64 / self.max as f64;

        if percentage_of_max >= 1.0 {
            self.messenger.send("Error: You are over your quota!");
        } else if percentage_of_max >= 0.9 {
            self.messenger
                .send("Urgent warning: You've used up over 90% of your quota!");
        } else if percentage_of_max >= 0.75 {
            self.messenger
                .send("Warning: You've used up over 75% of your quota!");
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    struct MockMessenger {
        sent_messages: Vec<String>,
    }

    impl MockMessenger {
        fn new() -> MockMessenger {
            MockMessenger {
                sent_messages: vec![],
            }
        }
    }

    impl Messenger for MockMessenger {
        fn send(&self, message: &str) {
            self.sent_messages.push(String::from(message));
        }
    }

    #[test]
    fn it_sends_an_over_75_percent_warning_message() {
        let mock_messenger = MockMessenger::new();
        let mut limit_tracker = LimitTracker::new(&mock_messenger, 100);

        limit_tracker.set_value(80);

        assert_eq!(mock_messenger.sent_messages.len(), 1);
    }
}
```

示例15-21：尝试实现一个不被借用检查器允许的`MockMessenger`

这段测试代码定义了一个`MockMessenger`结构体，它有一个`sent_messages`字段，其中包含一个`String`值的`Vec`，用于跟踪它被告知要发送的消息。我们还定义了一个关联函数`new`，以便于创建以空消息列表开始的新`MockMessenger`值。然后我们为`MockMessenger`实现`Messenger`特性，这样我们就可以将`MockMessenger`提供给`LimitTracker`。在`send`方法的定义中，我们将作为参数传入的消息存储在`MockMessenger`的`sent_messages`列表中。

在测试中，我们测试当`LimitTracker`被告知将`value`设置为超过`max`值75%的值时会发生什么。首先，我们创建一个新的`MockMessenger`，它将以空消息列表开始。然后我们创建一个新的`LimitTracker`，并给它一个对新`MockMessenger`的引用和一个`max`值`100`。我们在`LimitTracker`上调用`set_value`方法，值为`80`，这超过了100的75%。然后我们断言`MockMessenger`正在跟踪的消息列表现在应该有一条消息。

然而，这个测试有一个问题，如这里所示：

```rust
$ cargo test
   Compiling limit-tracker v0.1.0 (file:///projects/limit-tracker)
error[E0596]: cannot borrow `self.sent_messages` as mutable, as it is behind a `&` reference
  --> src/lib.rs:58:13
   |
58 |             self.sent_messages.push(String::from(message));
   |             ^^^^^^^^^^^^^^^^^^ `self` is a `&` reference, so the data it refers to cannot be borrowed as mutable
   |
help: consider changing this to be a mutable reference in the `impl` method and the `trait` definition
   |
2  ~     fn send(&mut self, msg: &str);
3  | }
...
56 |     impl Messenger for MockMessenger {
57 ~         fn send(&mut self, message: &str) {
   |

For more information about this error, try `rustc --explain E0596`.
error: could not compile `limit-tracker` (lib test) due to 1 previous error
warning: build failed, waiting for other jobs to finish...
```

我们不能修改`MockMessenger`来跟踪消息，因为`send`方法接受一个对`self`的不可变引用。我们也不能采纳错误文本中的建议，在`impl`方法和`trait`定义中都使用`&mut` self。我们不想仅仅为了测试而改变`Messenger`特性。相反，我们需要找到一种方法，使我们的测试代码能够与我们现有的设计正确地工作。

这是一个内部可变性可以帮助的情况！我们将在`RefCell<T>`中存储`sent_messages`，然后`send`方法将能够修改`sent_messages`以存储我们看到的消息。示例15-22显示了这是什么样子。

文件名: src/lib.rs:

```rust
pub trait Messenger {
    fn send(&self, msg: &str);
}

pub struct LimitTracker<'a, T: Messenger> {
    messenger: &'a T,
    value: usize,
    max: usize,
}

impl<'a, T> LimitTracker<'a, T>
where
    T: Messenger,
{
    pub fn new(messenger: &'a T, max: usize) -> LimitTracker<'a, T> {
        LimitTracker {
            messenger,
            value: 0,
            max,
        }
    }

    pub fn set_value(&mut self, value: usize) {
        self.value = value;

        let percentage_of_max = self.value as f64 / self.max as f64;

        if percentage_of_max >= 1.0 {
            self.messenger.send("Error: You are over your quota!");
        } else if percentage_of_max >= 0.9 {
            self.messenger
                .send("Urgent warning: You've used up over 90% of your quota!");
        } else if percentage_of_max >= 0.75 {
            self.messenger
                .send("Warning: You've used up over 75% of your quota!");
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::cell::RefCell;

    struct MockMessenger {
        sent_messages: RefCell<Vec<String>>,
    }

    impl MockMessenger {
        fn new() -> MockMessenger {
            MockMessenger {
                sent_messages: RefCell::new(vec![]),
            }
        }
    }

    impl Messenger for MockMessenger {
        fn send(&self, message: &str) {
            self.sent_messages.borrow_mut().push(String::from(message));
        }
    }

    #[test]
    fn it_sends_an_over_75_percent_warning_message() {
        // --snip--
        let mock_messenger = MockMessenger::new();
        let mut limit_tracker = LimitTracker::new(&mock_messenger, 100);

        limit_tracker.set_value(80);

        assert_eq!(mock_messenger.sent_messages.borrow().len(), 1);
    }
}
```

示例15-22：使用`RefCell<T>`修改内部值，而外部值被视为不可变

`sent_messages`字段现在的类型是`RefCell<Vec<String>>`而不是`Vec<String>`。在`new`函数中，我们在空向量周围创建一个新的`RefCell<Vec<String>>`实例。

对于`send`方法的实现，第一个参数仍然是对`self`的不可变借用，这与特性定义相匹配。我们在`self.sent_messages`中的`RefCell<Vec<String>>`上调用`borrow_mut`，以获取`RefCell<Vec<String>>`内部值的可变引用，即向量。然后我们可以在向量的可变引用上调用`push`，以跟踪测试期间发送的消息。

我们必须做的最后一个更改是在断言中：要查看内部向量中有多少项，我们在`RefCell<Vec<String>>`上调用`borrow`以获取对向量的不可变引用。

现在你已经看到了如何使用`RefCell<T>`，让我们深入了解它是如何工作的！

#### 在运行时使用`RefCell<T>`跟踪借用

当创建不可变和可变引用时，我们分别使用`&`和`&mut`语法。使用`RefCell<T>`时，我们使用`borrow`和`borrow_mut`方法，它们是属于`RefCell<T>`的安全API的一部分。`borrow`方法返回智能指针类型`Ref<T>`，而`borrow_mut`返回智能指针类型`RefMut<T>`。这两种类型都实现了`Deref`，所以我们可以像普通引用一样对待它们。

`RefCell<T>`跟踪当前有多少`Ref<T>`和`RefMut<T>`智能指针处于活动状态。每次我们调用`borrow`，`RefCell<T>`就会增加其活动的不可变借用计数。当一个`Ref<T>`值离开作用域时，不可变借用的计数减少1。就像编译时借用规则一样，`RefCell<T>`允许我们在任何时候有多个不可变借用或一个可变借用。

如果我们尝试违反这些规则，而不是像使用引用那样得到编译器错误，`RefCell<T>`的实现将在运行时panic。示例15-23显示了对示例15-22中`send`实现的修改。我们故意尝试为同一作用域创建两个活动的可变借用，以说明`RefCell<T>`在运行时阻止我们这样做。

文件名: src/lib.rs:

```rust
pub trait Messenger {
    fn send(&self, msg: &str);
}

pub struct LimitTracker<'a, T: Messenger> {
    messenger: &'a T,
    value: usize,
    max: usize,
}

impl<'a, T> LimitTracker<'a, T>
where
    T: Messenger,
{
    pub fn new(messenger: &'a T, max: usize) -> LimitTracker<'a, T> {
        LimitTracker {
            messenger,
            value: 0,
            max,
        }
    }

    pub fn set_value(&mut self, value: usize) {
        self.value = value;

        let percentage_of_max = self.value as f64 / self.max as f64;

        if percentage_of_max >= 1.0 {
            self.messenger.send("Error: You are over your quota!");
        } else if percentage_of_max >= 0.9 {
            self.messenger
                .send("Urgent warning: You've used up over 90% of your quota!");
        } else if percentage_of_max >= 0.75 {
            self.messenger
                .send("Warning: You've used up over 75% of your quota!");
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::cell::RefCell;

    struct MockMessenger {
        sent_messages: RefCell<Vec<String>>,
    }

    impl MockMessenger {
        fn new() -> MockMessenger {
            MockMessenger {
                sent_messages: RefCell::new(vec![]),
            }
        }
    }

    impl Messenger for MockMessenger {
        fn send(&self, message: &str) {
            let mut one_borrow = self.sent_messages.borrow_mut();
            let mut two_borrow = self.sent_messages.borrow_mut();

            one_borrow.push(String::from(message));
            two_borrow.push(String::from(message));
        }
    }

    #[test]
    fn it_sends_an_over_75_percent_warning_message() {
        let mock_messenger = MockMessenger::new();
        let mut limit_tracker = LimitTracker::new(&mock_messenger, 100);

        limit_tracker.set_value(80);

        assert_eq!(mock_messenger.sent_messages.borrow().len(), 1);
    }
}
```

示例15-23：在同一作用域中创建两个可变引用，以查看`RefCell<T>`将会panic

我们为从`borrow_mut`返回的`RefMut<T>`智能指针创建一个变量`one_borrow`。然后我们以相同的方式在变量`two_borrow`中创建另一个可变借用。这在同一作用域中创建了两个可变引用，这是不允许的。当我们运行我们库的测试时，示例15-23中的代码将编译而不会有任何错误，但测试将失败：

```rust
$ cargo test
   Compiling limit-tracker v0.1.0 (file:///projects/limit-tracker)
    Finished `test` profile [unoptimized + debuginfo] target(s) in 0.91s
     Running unittests src/lib.rs (target/debug/deps/limit_tracker-e599811fa246dbde)

running 1 test
test tests::it_sends_an_over_75_percent_warning_message ... FAILED

failures:

---- tests::it_sends_an_over_75_percent_warning_message stdout ----

thread 'tests::it_sends_an_over_75_percent_warning_message' panicked at src/lib.rs:60:53:
already borrowed: BorrowMutError
note: run with `RUST_BACKTRACE=1` environment variable to display a backtrace


failures:
    tests::it_sends_an_over_75_percent_warning_message

test result: FAILED. 0 passed; 1 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s

error: test failed, to rerun pass `--lib`
```

注意代码以消息`already borrowed: BorrowMutError`panic。这就是`RefCell<T>`在运行时处理借用规则违规的方式。

选择在运行时而不是编译时捕获借用错误，就像我们在这里所做的那样，意味着你可能会在开发过程的后期发现代码中的错误：可能直到你的代码部署到生产环境才会发现。此外，由于在运行时而不是编译时跟踪借用，你的代码会产生小的运行时性能损失。然而，使用`RefCell<T>`可以编写一个模拟对象，它可以修改自身以跟踪它在只允许不可变值的上下文中看到的消息。尽管有权衡，你可以使用`RefCell<T>`获得比普通引用提供更多的功能。


### 使用`Rc<T>`和`RefCell<T>`允许多个所有者拥有可变数据

使用`RefCell<T>`的一种常见方式是与`Rc<T>`结合使用。回想一下，`Rc<T>`允许你对某些数据有多个所有者，但它只提供对该数据的不可变访问。如果你有一个持有`RefCell<T>`的`Rc<T>`，你可以获得一个可以有多个所有者且可以修改的值！

例如，回想一下示例15-18中的cons列表示例，我们使用`Rc<T>`允许多个列表共享另一个列表的所有权。因为`Rc<T>`只持有不可变值，一旦创建了列表中的值，我们就不能改变它们。让我们添加`RefCell<T>`，以便能够更改列表中的值。示例15-24显示，通过在Cons定义中使用`RefCell<T>`，我们可以修改存储在所有列表中的值。

Filename: src/main.rs:

```rust
#[derive(Debug)]
enum List {
    Cons(Rc<RefCell<i32>>, Rc<List>),
    Nil,
}

use crate::List::{Cons, Nil};
use std::cell::RefCell;
use std::rc::Rc;

fn main() {
    let value = Rc::new(RefCell::new(5));

    let a = Rc::new(Cons(Rc::clone(&value), Rc::new(Nil)));

    let b = Cons(Rc::new(RefCell::new(3)), Rc::clone(&a));
    let c = Cons(Rc::new(RefCell::new(4)), Rc::clone(&a));

    *value.borrow_mut() += 10;

    println!("a after = {a:?}");
    println!("b after = {b:?}");
    println!("c after = {c:?}");
}
```

示例15-24：使用`Rc<RefCell<i32>>`创建一个我们可以修改的`List`

我们创建一个`Rc<RefCell<i32>>`实例的值，并将其存储在名为`value`的变量中，以便稍后直接访问它。然后我们在`a`中创建一个`List`，其中包含一个持有`value`的`Cons`变体。我们需要克隆`value`，这样`a`和`value`都拥有内部`5`值的所有权，而不是将所有权从`value`转移到`a`或让`a`从`value`借用。

我们将列表`a`包装在一个`Rc<T>`中，这样当我们创建列表`b`和`c`时，它们都可以引用`a`，这就是我们在示例15-18中所做的。

在我们创建了列表`a`、`b`和`c`之后，我们想要在`value`中的值上加10。我们通过在`value`上调用`borrow_mut`来做到这一点，它使用我们在第5章中讨论的自动解引用功能（["操作符->在哪里？"](../structs/method-syntax#操作符-在哪里)）来解引用`Rc<T>`到内部的`RefCell<T>`值。`borrow_mut`方法返回一个`RefMut<T>`智能指针，我们在其上使用解引用操作符并更改内部值。

当我们打印`a`、`b`和`c`时，我们可以看到它们都有修改后的值`15`而不是`5`：

```rust
$ cargo run
   Compiling cons-list v0.1.0 (file:///projects/cons-list)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.63s
     Running `target/debug/cons-list`
a after = Cons(RefCell { value: 15 }, Nil)
b after = Cons(RefCell { value: 3 }, Cons(RefCell { value: 15 }, Nil))
c after = Cons(RefCell { value: 4 }, Cons(RefCell { value: 15 }, Nil))
```

这种技术非常巧妙！通过使用`RefCell<T>`，我们有一个外部不可变的`List`值。但是我们可以使用`RefCell<T>`上的方法，这些方法提供对其内部可变性的访问，因此我们可以在需要时修改我们的数据。借用规则的运行时检查保护我们免受数据竞争，有时为了在我们的数据结构中获得这种灵活性而牺牲一点速度是值得的。注意，`RefCell<T>`不适用于多线程代码！`Mutex<T>`是`RefCell<T>`的线程安全版本，我们将在第16章中讨论`Mutex<T>`。