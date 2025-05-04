## 如何编写测试

测试是 Rust 函数，用于验证非测试代码是否按预期方式运行。测试函数的主体通常执行以下三个操作：

- 设置所需的数据或状态。
- 运行要测试的代码。
- 断言结果符合预期。

让我们看看 Rust 专门为编写执行这些操作的测试提供的功能，包括 test 属性、一些宏和 should_panic 属性。

### 测试函数的剖析

最简单地说，Rust 中的测试是一个带有 test 属性标注的函数。属性是关于 Rust 代码片段的元数据；一个例子是我们在第 5 章中与结构体一起使用的 derive 属性。要将函数转变为测试函数，请在 fn 之前的行上添加 #[test]。当你使用 cargo test 命令运行测试时，Rust 会构建一个测试运行器二进制文件，它会运行带注解的函数并报告每个测试函数是通过还是失败。

每当我们使用 Cargo 创建一个新的库项目时，会自动为我们生成一个包含测试函数的测试模块。这个模块为你提供了编写测试的模板，这样你就不必在每次开始新项目时查找确切的结构和语法。你可以添加任意数量的额外测试函数和测试模块！

在我们实际测试任何代码之前，我们将通过实验模板测试来探索测试的工作原理的一些方面。然后我们将编写一些真实世界的测试，调用我们编写的代码并断言其行为是正确的。

让我们创建一个名为 adder 的新库项目，它将对两个数字进行相加：

```rust
$ cargo new adder --lib
     Created library `adder` project
$ cd adder
```

adder 库中 src/lib.rs 文件的内容应该如清单 11-1 所示。

文件名：src/lib.rs：

```rust
pub fn add(left: u64, right: u64) -> u64 {
    left + right
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_works() {
        let result = add(2, 2);
        assert_eq!(result, 4);
    }
}
```

清单 11-1：`cargo new` 自动生成的代码

该文件以一个示例 add 函数开始，这样我们就有东西可以测试。

现在，让我们只关注 it_works 函数。注意 #[test] 注解：这个属性表明这是一个测试函数，所以测试运行器知道将此函数视为测试。我们也可能在 tests 模块中有非测试函数来帮助设置常见场景或执行常见操作，所以我们总是需要指明哪些函数是测试。

示例函数体使用 assert_eq! 宏来断言 result（包含调用 add 函数传入 2 和 2 的结果）等于 4。这个断言作为典型测试格式的示例。让我们运行它，看看这个测试是否通过。

`cargo test` 命令运行项目中的所有测试，如清单 11-2 所示。

```rust
$ cargo test
   Compiling adder v0.1.0 (file:///projects/adder)
    Finished `test` profile [unoptimized + debuginfo] target(s) in 0.57s
     Running unittests src/lib.rs (file:///projects/adder/target/debug/deps/adder-7acb243c25ffd9dc)

running 1 test
test tests::it_works ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s

   Doc-tests adder

running 0 tests

test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
```

清单 11-2：运行自动生成的测试的输出

Cargo 编译并运行了测试。我们看到 running 1 test 这一行。下一行显示生成的测试函数的名称，称为 tests::it_works，以及运行该测试的结果是 ok。总体测试结果摘要 test result: ok. 表示所有测试都通过了，而读作 1 passed; 0 failed 的部分统计了通过或失败的测试数量。

可以将测试标记为忽略，这样它就不会在特定实例中运行；我们将在本章后面的"除非特别请求，否则忽略某些测试"部分中介绍这一点。因为我们在这里没有这样做，所以摘要显示 0 ignored。

0 measured 统计数据用于基准测试，测量性能。基准测试在撰写本文时仅在 nightly Rust 中可用。有关基准测试的更多信息，请参阅相关文档。

我们可以向 cargo test 命令传递参数，只运行名称匹配字符串的测试；这称为过滤，我们将在"按名称运行测试子集"部分中介绍。这里我们没有过滤正在运行的测试，所以摘要末尾显示 0 filtered out。

测试输出的下一部分从 Doc-tests adder 开始，是任何文档测试的结果。我们还没有任何文档测试，但 Rust 可以编译出现在我们 API 文档中的任何代码示例。这个功能有助于保持文档和代码同步！我们将在第 14 章的"文档注释作为测试"部分讨论如何编写文档测试。现在，我们将忽略 Doc-tests 输出。

让我们开始根据自己的需求定制测试。首先，将 it_works 函数的名称更改为不同的名称，例如 exploration，如下所示：

文件名：src/lib.rs：

```rust
pub fn add(left: u64, right: u64) -> u64 {
    left + right
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn exploration() {
        let result = add(2, 2);
        assert_eq!(result, 4);
    }
}
```

然后再次运行 cargo test。输出现在显示 exploration 而不是 it_works：

```rust
$ cargo test
   Compiling adder v0.1.0 (file:///projects/adder)
    Finished `test` profile [unoptimized + debuginfo] target(s) in 0.59s
     Running unittests src/lib.rs (target/debug/deps/adder-92948b65e88960b4)

running 1 test
test tests::exploration ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s

   Doc-tests adder

running 0 tests

test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s

```

现在我们将添加另一个测试，但这次我们将创建一个失败的测试！当测试函数中的某些内容发生 panic 时，测试就会失败。每个测试都在一个新线程中运行，当主线程看到测试线程已死亡时，测试被标记为失败。在第 9 章中，我们讨论了最简单的 panic 方式是调用 panic! 宏。将新测试作为名为 another 的函数输入，使你的 src/lib.rs 文件看起来像清单 11-3。

文件名：src/lib.rs：

```rust
pub fn add(left: u64, right: u64) -> u64 {
    left + right
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn exploration() {
        let result = add(2, 2);
        assert_eq!(result, 4);
    }

    #[test]
    fn another() {
        panic!("Make this test fail");
    }
}
```

清单 11-3：添加第二个测试，由于我们调用了 panic! 宏而失败

再次使用 cargo test 运行测试。输出应该如清单 11-4 所示，表明我们的 exploration 测试通过，another 测试失败。

```rust
$ cargo test
   Compiling adder v0.1.0 (file:///projects/adder)
    Finished `test` profile [unoptimized + debuginfo] target(s) in 0.72s
     Running unittests src/lib.rs (target/debug/deps/adder-92948b65e88960b4)

running 2 tests
test tests::another ... FAILED
test tests::exploration ... ok

failures:

---- tests::another stdout ----
thread 'tests::another' panicked at src/lib.rs:17:9:
Make this test fail
note: run with `RUST_BACKTRACE=1` environment variable to display a backtrace


failures:
    tests::another

test result: FAILED. 1 passed; 1 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s

error: test failed, to rerun pass `--lib`
```

清单 11-4：一个测试通过一个测试失败时的测试结果

不是 ok，test tests::another 行显示 FAILED。在单个结果和摘要之间出现了两个新部分：第一部分显示每个测试失败的详细原因。在这种情况下，我们得到的详细信息是 another 失败，因为它在 src/lib.rs 文件的第 17 行 panic 了，显示 'Make this test fail'。下一部分仅列出所有失败测试的名称，当有很多测试和很多详细的失败测试输出时，这很有用。我们可以使用失败测试的名称只运行该测试，以便更容易地调试它；我们将在"控制测试如何运行"部分中详细讨论运行测试的方法。

摘要行显示在末尾：总体而言，我们的测试结果是 FAILED。我们有一个测试通过，一个测试失败。

现在你已经看到了不同场景下的测试结果，让我们看看除了 panic! 之外在测试中有用的一些宏。

### 使用 `assert!` 宏检查结果

assert! 宏由标准库提供，当你想确保测试中的某些条件评估为 true 时很有用。我们给 assert! 宏一个计算为布尔值的参数。如果值为 true，则什么都不会发生，测试通过。如果值为 false，assert! 宏会调用 panic! 使测试失败。使用 assert! 宏帮助我们检查代码是否按照我们的意图运行。

在第 5 章的清单 5-15 中，我们使用了 Rectangle 结构体和 can_hold 方法，这里在清单 11-5 中重复。让我们将这段代码放入 src/lib.rs 文件中，然后使用 assert! 宏为它编写一些测试。

文件名：src/lib.rs：

```rust
#[derive(Debug)]
struct Rectangle {
    width: u32,
    height: u32,
}

impl Rectangle {
    fn can_hold(&self, other: &Rectangle) -> bool {
        self.width > other.width && self.height > other.height
    }
}
```

清单 11-5：第 5 章中的 Rectangle 结构体及其 can_hold 方法

can_hold 方法返回一个布尔值，这意味着它是 assert! 宏的完美用例。在清单 11-6 中，我们编写了一个测试来测试 can_hold 方法，方法是创建一个宽度为 8、高度为 7 的 Rectangle 实例，并断言它可以容纳另一个宽度为 5、高度为 1 的 Rectangle 实例。

文件名：src/lib.rs：

```rust
#[derive(Debug)]
struct Rectangle {
    width: u32,
    height: u32,
}

impl Rectangle {
    fn can_hold(&self, other: &Rectangle) -> bool {
        self.width > other.width && self.height > other.height
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn larger_can_hold_smaller() {
        let larger = Rectangle {
            width: 8,
            height: 7,
        };
        let smaller = Rectangle {
            width: 5,
            height: 1,
        };

        assert!(larger.can_hold(&smaller));
    }
}
```

清单 11-6：测试 can_hold，检查一个更大的矩形是否确实可以容纳一个更小的矩形

注意 tests 模块内的 use super::\*; 行。tests 模块是一个常规模块，遵循我们在第 7 章"引用模块树中项目的路径"部分中介绍的常规可见性规则。因为 tests 模块是一个内部模块，我们需要将外部模块中的被测试代码引入内部模块的作用域。我们在这里使用通配符，所以外部模块中定义的任何内容都可用于这个 tests 模块。

我们将测试命名为 larger_can_hold_smaller，并创建了我们需要的两个 Rectangle 实例。然后我们调用 assert! 宏并传递调用 larger.can_hold(&smaller) 的结果。这个表达式应该返回 true，所以我们的测试应该通过。让我们看看！

```rust
$ cargo test
   Compiling rectangle v0.1.0 (file:///projects/rectangle)
    Finished `test` profile [unoptimized + debuginfo] target(s) in 0.66s
     Running unittests src/lib.rs (target/debug/deps/rectangle-6584c4561e48942e)

running 1 test
test tests::larger_can_hold_smaller ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s

   Doc-tests rectangle

running 0 tests

test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
```

确实通过了！让我们添加另一个测试，这次断言一个较小的矩形不能容纳一个较大的矩形：

文件名：src/lib.rs：

```rust
#[derive(Debug)]
struct Rectangle {
    width: u32,
    height: u32,
}

impl Rectangle {
    fn can_hold(&self, other: &Rectangle) -> bool {
        self.width > other.width && self.height > other.height
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn larger_can_hold_smaller() {
        // --snip--
        let larger = Rectangle {
            width: 8,
            height: 7,
        };
        let smaller = Rectangle {
            width: 5,
            height: 1,
        };

        assert!(larger.can_hold(&smaller));
    }

    #[test]
    fn smaller_cannot_hold_larger() {
        let larger = Rectangle {
            width: 8,
            height: 7,
        };
        let smaller = Rectangle {
            width: 5,
            height: 1,
        };

        assert!(!smaller.can_hold(&larger));
    }
}
```

因为在这种情况下 can_hold 函数的正确结果是 false，我们需要在将结果传递给 assert! 宏之前对其取反。因此，如果 can_hold 返回 false，我们的测试将通过：

```rust
$ cargo test
   Compiling rectangle v0.1.0 (file:///projects/rectangle)
    Finished `test` profile [unoptimized + debuginfo] target(s) in 0.66s
     Running unittests src/lib.rs (target/debug/deps/rectangle-6584c4561e48942e)

running 2 tests
test tests::larger_can_hold_smaller ... ok
test tests::smaller_cannot_hold_larger ... ok

test result: ok. 2 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s

   Doc-tests rectangle

running 0 tests

test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
```

两个测试都通过了！现在让我们看看当我们在代码中引入一个 bug 时，我们的测试结果会发生什么。我们将通过在比较宽度时将大于号替换为小于号来更改 can_hold 方法的实现：

```rust
#[derive(Debug)]
struct Rectangle {
    width: u32,
    height: u32,
}

// --snip--
impl Rectangle {
    fn can_hold(&self, other: &Rectangle) -> bool {
        self.width < other.width && self.height > other.height
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn larger_can_hold_smaller() {
        let larger = Rectangle {
            width: 8,
            height: 7,
        };
        let smaller = Rectangle {
            width: 5,
            height: 1,
        };

        assert!(larger.can_hold(&smaller));
    }

    #[test]
    fn smaller_cannot_hold_larger() {
        let larger = Rectangle {
            width: 8,
            height: 7,
        };
        let smaller = Rectangle {
            width: 5,
            height: 1,
        };

        assert!(!smaller.can_hold(&larger));
    }
}
```

现在运行测试会产生以下结果：

```rust
$ cargo test
   Compiling rectangle v0.1.0 (file:///projects/rectangle)
    Finished `test` profile [unoptimized + debuginfo] target(s) in 0.66s
     Running unittests src/lib.rs (target/debug/deps/rectangle-6584c4561e48942e)

running 2 tests
test tests::larger_can_hold_smaller ... FAILED
test tests::smaller_cannot_hold_larger ... ok

failures:

---- tests::larger_can_hold_smaller stdout ----
thread 'tests::larger_can_hold_smaller' panicked at src/lib.rs:28:9:
assertion failed: larger.can_hold(&smaller)
note: run with `RUST_BACKTRACE=1` environment variable to display a backtrace


failures:
    tests::larger_can_hold_smaller

test result: FAILED. 1 passed; 1 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s

error: test failed, to rerun pass `--lib`
```

我们的测试捕获了 bug！因为 larger.width 是 8，smaller.width 是 5，can_hold 中宽度的比较现在返回 false：8 不小于 5。

### 使用 assert_eq! 和 assert_ne! 宏测试相等性

验证功能的一种常见方法是测试代码执行结果与预期返回值之间的相等性。你可以使用 assert! 宏并传入一个使用 == 运算符的表达式来实现这一点。然而，这种测试非常常见，以至于标准库提供了一对宏—— assert_eq! 和 assert_ne! ——来更方便地执行此测试。这些宏分别比较两个参数的相等性或不相等性。如果断言失败，它们还会打印出两个值，这使得更容易看出测试失败的原因；相反，assert! 宏只表明它得到了 == 表达式的 false 值，而不打印导致 false 值的值。

在示例 11-7 中，我们编写了一个名为 add_two 的函数，它将 2 添加到其参数中，然后我们使用 assert_eq! 宏测试这个函数。

Filename: src/lib.rs:

```rust
pub fn add_two(a: usize) -> usize {
    a + 2
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_adds_two() {
        let result = add_two(2);
        assert_eq!(result, 4);
    }
}
```

示例 11-7：使用 assert_eq! 宏测试函数 add_two

让我们检查它是否通过！

```rust
$ cargo test
   Compiling adder v0.1.0 (file:///projects/adder)
    Finished `test` profile [unoptimized + debuginfo] target(s) in 0.58s
     Running unittests src/lib.rs (target/debug/deps/adder-92948b65e88960b4)

running 1 test
test tests::it_adds_two ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s

   Doc-tests adder

running 0 tests

test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
```

我们创建了一个名为 result 的变量，它保存调用 add_two(2) 的结果。然后我们将 result 和 4 作为参数传递给 assert_eq!。这个测试的输出行是 test tests::it_adds_two ... ok，ok 文本表示我们的测试通过了！

让我们在代码中引入一个错误，看看 assert_eq! 在失败时是什么样子。将 add_two 函数的实现改为添加 3：

```rust
pub fn add_two(a: usize) -> usize {
    a + 3
}

// #[cfg(test)]
// mod tests {
//     use super::*;

//     #[test]
//     fn it_adds_two() {
//         let result = add_two(2);
//         assert_eq!(result, 4);
//     }
// }
```

再次运行测试：

```rust
$ cargo test
   Compiling adder v0.1.0 (file:///projects/adder)
    Finished `test` profile [unoptimized + debuginfo] target(s) in 0.61s
     Running unittests src/lib.rs (target/debug/deps/adder-92948b65e88960b4)

running 1 test
test tests::it_adds_two ... FAILED

failures:

---- tests::it_adds_two stdout ----
thread 'tests::it_adds_two' panicked at src/lib.rs:12:9:
assertion `left == right` failed
  left: 5
 right: 4
note: run with `RUST_BACKTRACE=1` environment variable to display a backtrace


failures:
    tests::it_adds_two

test result: FAILED. 0 passed; 1 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s

error: test failed, to rerun pass `--lib`
```

我们的测试捕获了这个错误！it_adds_two 测试失败了，消息告诉我们断言 `left == right` 失败，并显示了左值和右值是什么。这个消息帮助我们开始调试：左参数，也就是我们调用 add_two(2) 的结果，是 5，但右参数是 4。当我们有很多测试在进行时，你可以想象这会特别有帮助。

请注意，在某些语言和测试框架中，相等性断言函数的参数被称为 expected 和 actual，参数的指定顺序很重要。然而，在 Rust 中，它们被称为 left 和 right，我们指定预期值和代码产生的值的顺序并不重要。我们可以在这个测试中将断言写为 assert_eq!(4, result)，这将产生相同的失败消息，显示断言失败：`(left == right)`。

如果我们给 assert_ne! 宏的两个值不相等，它就会通过；如果它们相等，它就会失败。当我们不确定一个值会是什么，但知道它绝对不应该是什么时，这个宏最有用。例如，如果我们测试一个保证以某种方式改变其输入的函数，但输入改变的方式取决于我们运行测试的星期几，那么最好的断言可能是函数的输出不等于输入。

在底层，assert_eq! 和 assert_ne! 宏分别使用 == 和 != 运算符。当断言失败时，这些宏使用调试格式打印它们的参数，这意味着被比较的值必须实现 PartialEq 和 Debug 特性。所有基本类型和大多数标准库类型都实现了这些特性。对于你自己定义的结构体和枚举，你需要实现 PartialEq 来断言这些类型的相等性。你还需要实现 Debug 以便在断言失败时打印值。因为这两个特性都是可派生的特性，如第 5 章的示例 5-12 中所述，这通常只需要在结构体或枚举定义上添加 #[derive(PartialEq, Debug)] 注解就可以了。有关这些和其他可派生特性的更多详细信息，请参见附录 C，"[可派生特性](../appendix/appendix-c)"。

### 添加自定义失败消息

你还可以向 assert!、assert_eq! 和 assert_ne! 宏添加自定义消息，作为可选参数与失败消息一起打印。在必需参数之后指定的任何参数都会传递给 format! 宏（在第 8 章的"使用 + 运算符或 format! 宏进行连接"部分中讨论过），因此你可以传递一个包含 {} 占位符的格式字符串和要放入这些占位符的值。自定义消息对于记录断言的含义很有用；当测试失败时，你将更好地了解代码中的问题所在。

例如，假设我们有一个函数，它通过名字向人们问候，我们想测试我们传入函数的名字是否出现在输出中：

Filename: src/lib.rs:

```rust
pub fn greeting(name: &str) -> String {
    format!("Hello {name}!")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn greeting_contains_name() {
        let result = greeting("Carol");
        assert!(result.contains("Carol"));
    }
}
```

这个程序的需求还没有达成一致，我们很确定问候语开头的 Hello 文本将会改变。我们决定不希望在需求变更时必须更新测试，所以我们不检查从 greeting 函数返回的值是否完全相等，而只是断言输出包含输入参数的文本。

现在让我们通过更改 greeting 函数来排除名字，看看默认的测试失败是什么样子：

```rust
pub fn greeting(name: &str) -> String {
    String::from("Hello!")
}

// #[cfg(test)]
// mod tests {
//     use super::*;

//     #[test]
//     fn greeting_contains_name() {
//         let result = greeting("Carol");
//         assert!(result.contains("Carol"));
//     }
// }
```

运行这个测试会产生以下结果：

```rust
$ cargo test
   Compiling greeter v0.1.0 (file:///projects/greeter)
    Finished `test` profile [unoptimized + debuginfo] target(s) in 0.91s
     Running unittests src/lib.rs (target/debug/deps/greeter-170b942eb5bf5e3a)

running 1 test
test tests::greeting_contains_name ... FAILED

failures:

---- tests::greeting_contains_name stdout ----
thread 'tests::greeting_contains_name' panicked at src/lib.rs:12:9:
assertion failed: result.contains("Carol")
note: run with `RUST_BACKTRACE=1` environment variable to display a backtrace


failures:
    tests::greeting_contains_name

test result: FAILED. 0 passed; 1 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s

error: test failed, to rerun pass `--lib`
```

这个结果只表明断言失败了，以及断言在哪一行。更有用的失败消息会打印出 greeting 函数的值。让我们添加一个自定义失败消息，由一个格式字符串组成，其中包含一个占位符，填入我们从 greeting 函数得到的实际值：

```rust
pub fn greeting(name: &str) -> String {
    String::from("Hello!")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn greeting_contains_name() {
        let result = greeting("Carol");
        assert!(
            result.contains("Carol"),
            "Greeting did not contain name, value was `{result}`"
        );
    }
}
```

现在当我们运行测试时，我们会得到一个更有信息量的错误消息：

```rust
$ cargo test
   Compiling greeter v0.1.0 (file:///projects/greeter)
    Finished `test` profile [unoptimized + debuginfo] target(s) in 0.93s
     Running unittests src/lib.rs (target/debug/deps/greeter-170b942eb5bf5e3a)

running 1 test
test tests::greeting_contains_name ... FAILED

failures:

---- tests::greeting_contains_name stdout ----
thread 'tests::greeting_contains_name' panicked at src/lib.rs:12:9:
Greeting did not contain name, value was `Hello!`
note: run with `RUST_BACKTRACE=1` environment variable to display a backtrace


failures:
    tests::greeting_contains_name

test result: FAILED. 0 passed; 1 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s

error: test failed, to rerun pass `--lib`
```

我们可以在测试输出中看到我们实际得到的值，这将帮助我们调试发生了什么，而不是我们期望发生的事情。

### 使用 should_panic 检查 panic

除了检查返回值外，确保我们的代码按预期处理错误条件也很重要。例如，考虑我们在第 9 章的代码清单 9-13 中创建的 Guess 类型。使用 Guess 的其他代码依赖于 Guess 实例只包含 1 到 100 之间的值的保证。我们可以编写一个测试，确保尝试创建一个值超出该范围的 Guess 实例会导致 panic。

我们通过在测试函数上添加 should_panic 属性来实现这一点。如果函数内的代码发生 panic，测试就通过；如果函数内的代码没有 panic，测试就失败。

代码清单 11-8 展示了一个测试，用于检查 Guess::new 的错误条件是否在我们预期的情况下发生。

Filename: src/lib.rs:

```rust
pub struct Guess {
    value: i32,
}

impl Guess {
    pub fn new(value: i32) -> Guess {
        if value < 1 || value > 100 {
            panic!("Guess value must be between 1 and 100, got {value}.");
        }

        Guess { value }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    #[should_panic]
    fn greater_than_100() {
        Guess::new(200);
    }
}
```

代码清单 11-8：测试某个条件会导致 panic!

我们将 `#[should_panic]` 属性放在 `#[test]` 属性之后，并在它所适用的测试函数之前。让我们看看这个测试通过时的结果：

```rust
$ cargo test
   Compiling guessing_game v0.1.0 (file:///projects/guessing_game)
    Finished `test` profile [unoptimized + debuginfo] target(s) in 0.58s
     Running unittests src/lib.rs (target/debug/deps/guessing_game-57d70c3acb738f4d)

running 1 test
test tests::greater_than_100 - should panic ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s

   Doc-tests guessing_game

running 0 tests

test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
```

看起来不错！现在让我们在代码中引入一个 bug，移除 new 函数在值大于 100 时会 panic 的条件：

```rust
pub struct Guess {
    value: i32,
}

// --snip--
impl Guess {
    pub fn new(value: i32) -> Guess {
        if value < 1 {
            panic!("Guess value must be between 1 and 100, got {value}.");
        }

        Guess { value }
    }
}

// #[cfg(test)]
// mod tests {
//     use super::*;

//     #[test]
//     #[should_panic]
//     fn greater_than_100() {
//         Guess::new(200);
//     }
// }
```

当我们运行代码清单 11-8 中的测试时，它会失败：

```rust
$ cargo test
   Compiling guessing_game v0.1.0 (file:///projects/guessing_game)
    Finished `test` profile [unoptimized + debuginfo] target(s) in 0.62s
     Running unittests src/lib.rs (target/debug/deps/guessing_game-57d70c3acb738f4d)

running 1 test
test tests::greater_than_100 - should panic ... FAILED

failures:

---- tests::greater_than_100 stdout ----
note: test did not panic as expected

failures:
    tests::greater_than_100

test result: FAILED. 0 passed; 1 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s

error: test failed, to rerun pass `--lib`
```

在这种情况下，我们没有得到非常有用的信息，但是当我们查看测试函数时，我们看到它被标注为 `#[should_panic]`。我们得到的失败意味着测试函数中的代码没有引起 panic。

使用 should_panic 的测试可能不够精确。即使测试因为我们预期之外的原因而 panic，should_panic 测试也会通过。为了使 should_panic 测试更精确，我们可以在 should_panic 属性中添加一个可选的 expected 参数。测试工具将确保失败消息包含所提供的文本。例如，考虑代码清单 11-9 中 Guess 的修改代码，其中 new 函数根据值是太小还是太大而使用不同的消息进行 panic。

Filename: src/lib.rs:

```rust
pub struct Guess {
    value: i32,
}

// --snip--

impl Guess {
    pub fn new(value: i32) -> Guess {
        if value < 1 {
            panic!(
                "Guess value must be greater than or equal to 1, got {value}."
            );
        } else if value > 100 {
            panic!(
                "Guess value must be less than or equal to 100, got {value}."
            );
        }

        Guess { value }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    #[should_panic(expected = "less than or equal to 100")]
    fn greater_than_100() {
        Guess::new(200);
    }
}
```

代码清单 11-9：使用包含指定子字符串的 panic! 消息进行测试

这个测试将通过，因为我们在 should_panic 属性的 expected 参数中放置的值是 Guess::new 函数 panic 消息的子字符串。我们可以指定我们期望的整个 panic 消息，在这种情况下将是 Guess value must be less than or equal to 100, got 200。你选择指定的内容取决于 panic 消息中有多少是唯一的或动态的，以及你希望测试有多精确。在这种情况下，panic 消息的子字符串足以确保测试函数中的代码执行 else if value > 100 分支。

为了看看当带有预期消息的 should_panic 测试失败时会发生什么，让我们再次通过交换 if value < 1 和 else if value > 100 块的主体在代码中引入一个 bug：

```rust
pub struct Guess {
    value: i32,
}

impl Guess {
    pub fn new(value: i32) -> Guess {
        if value < 1 {
            panic!(
                "Guess value must be less than or equal to 100, got {value}."
            );
        } else if value > 100 {
            panic!(
                "Guess value must be greater than or equal to 1, got {value}."
            );
        }

        Guess { value }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    #[should_panic(expected = "less than or equal to 100")]
    fn greater_than_100() {
        Guess::new(200);
    }
}
```

这次当我们运行 should_panic 测试时，它将失败：

```rust
$ cargo test
   Compiling guessing_game v0.1.0 (file:///projects/guessing_game)
    Finished `test` profile [unoptimized + debuginfo] target(s) in 0.66s
     Running unittests src/lib.rs (target/debug/deps/guessing_game-57d70c3acb738f4d)

running 1 test
test tests::greater_than_100 - should panic ... FAILED

failures:

---- tests::greater_than_100 stdout ----
thread 'tests::greater_than_100' panicked at src/lib.rs:12:13:
Guess value must be greater than or equal to 1, got 200.
note: run with `RUST_BACKTRACE=1` environment variable to display a backtrace
note: panic did not contain expected string
      panic message: `"Guess value must be greater than or equal to 1, got 200."`,
 expected substring: `"less than or equal to 100"`

failures:
    tests::greater_than_100

test result: FAILED. 0 passed; 1 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s

error: test failed, to rerun pass `--lib`
```

### 在测试中使用 `Result<T, E>`

到目前为止，我们的测试在失败时都会 panic。我们也可以使用 `Result<T, E>` 编写测试！这里是代码清单 11-1 中的测试，重写为使用 `Result<T, E>` 并在 panic 时返回 Err：

```rust
pub fn add(left: u64, right: u64) -> u64 {
    left + right
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_works() -> Result<(), String> {
        let result = add(2, 2);

        if result == 4 {
            Ok(())
        } else {
            Err(String::from("two plus two does not equal four"))
        }
    }
}
```

it_works 函数现在有 `Result<(), String>` 返回类型。在函数体中，我们不再调用 assert_eq! 宏，而是在测试通过时返回 `Ok(())`，在测试失败时返回带有 `String` 的 Err。

编写返回 `Result<T, E>` 的测试使你能够在测试体中使用问号运算符，这可以是编写应该在其中的任何操作返回 `Err` 变体时失败的测试的便捷方式。

你不能在使用 `Result<T, E>` 的测试上使用 `#[should_panic]` 注解。要断言一个操作返回 `Err` 变体，不要在 `Result<T, E>` 值上使用问号运算符。相反，使用 `assert!(value.is_err())`。

现在你知道了几种编写测试的方法，让我们看看运行测试时发生了什么，并探索我们可以使用 `cargo test` 的不同选项。
