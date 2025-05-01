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
