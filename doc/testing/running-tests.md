## 控制测试如何运行

正如 cargo run 编译代码并运行生成的二进制文件一样，cargo test 以测试模式编译代码并运行生成的测试二进制文件。cargo test 生成的二进制文件的默认行为是并行运行所有测试，并捕获测试运行期间生成的输出，防止输出被显示，从而使与测试结果相关的输出更容易阅读。但是，你可以指定命令行选项来更改此默认行为。

一些命令行选项传递给 cargo test，一些传递给生成的测试二进制文件。要分隔这两种类型的参数，你需要列出传递给 cargo test 的参数，然后是分隔符 --，然后是传递给测试二进制文件的参数。运行 cargo test --help 显示可以与 cargo test 一起使用的选项，而运行 cargo test -- --help 显示可以在分隔符后使用的选项。这些选项也在 rustc 书的"Tests"部分中有文档说明。

### 并行或连续运行测试

当你运行多个测试时，默认情况下它们使用线程并行运行，这意味着它们运行得更快，你也能更快地获得反馈。由于测试同时运行，你必须确保测试不依赖于彼此或任何共享状态，包括共享环境，如当前工作目录或环境变量。

例如，假设你的每个测试都运行一些代码，这些代码在磁盘上创建一个名为 test-output.txt 的文件并向该文件写入一些数据。然后每个测试读取该文件中的数据，并断言该文件包含一个特定的值，这个值在每个测试中都不同。由于测试同时运行，一个测试可能会在另一个测试写入和读取文件之间的时间覆盖该文件。第二个测试将会失败，不是因为代码不正确，而是因为测试在并行运行时相互干扰。一种解决方案是确保每个测试写入不同的文件；另一种解决方案是一次运行一个测试。

如果你不想并行运行测试，或者想要对使用的线程数进行更精细的控制，你可以向测试二进制文件发送 `--test-threads` 标志和你想要使用的线程数。看看下面的例子：

```rust
$ cargo test -- --test-threads=1
```

我们将测试线程数设置为 1，告诉程序不要使用任何并行性。使用一个线程运行测试将比并行运行它们花费更长的时间，但如果它们共享状态，测试不会相互干扰。

### 显示函数输出

默认情况下，如果测试通过，Rust 的测试库会捕获打印到标准输出的任何内容。例如，如果我们在测试中调用 println! 并且测试通过，我们不会在终端中看到 println! 的输出；我们只会看到表明测试通过的那一行。如果测试失败，我们将看到打印到标准输出的内容以及其余的失败消息。

作为示例，清单 11-10 有一个简单的函数，它打印其参数的值并返回 10，以及一个通过的测试和一个失败的测试。

Filename: src/lib.rs:

```rust
fn prints_and_returns_10(a: i32) -> i32 {
    println!("I got the value {a}");
    10
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn this_test_will_pass() {
        let value = prints_and_returns_10(4);
        assert_eq!(value, 10);
    }

    #[test]
    fn this_test_will_fail() {
        let value = prints_and_returns_10(8);
        assert_eq!(value, 5);
    }
}
```

清单 11-10：对调用 println! 的函数的测试

当我们使用 cargo test 运行这些测试时，我们将看到以下输出：

```rust
$ cargo test
   Compiling silly-function v0.1.0 (file:///projects/silly-function)
    Finished `test` profile [unoptimized + debuginfo] target(s) in 0.58s
     Running unittests src/lib.rs (target/debug/deps/silly_function-160869f38cff9166)

running 2 tests
test tests::this_test_will_fail ... FAILED
test tests::this_test_will_pass ... ok

failures:

---- tests::this_test_will_fail stdout ----
I got the value 8
thread 'tests::this_test_will_fail' panicked at src/lib.rs:19:9:
assertion `left == right` failed
  left: 10
 right: 5
note: run with `RUST_BACKTRACE=1` environment variable to display a backtrace


failures:
    tests::this_test_will_fail

test result: FAILED. 1 passed; 1 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s

error: test failed, to rerun pass `--lib`
```

注意，在这个输出中，我们没有看到"I got the value 4"，这是在通过的测试运行时打印的。该输出已被捕获。失败测试的输出"I got the value 8"出现在测试摘要输出的部分中，该部分还显示了测试失败的原因。

如果我们也想看到通过测试的打印值，我们可以告诉 Rust 也显示成功测试的输出，使用 `--show-output`：

```rust
$ cargo test -- --show-output
```

当我们使用 --show-output 标志再次运行清单 11-10 中的测试时，我们会看到以下输出：

```rust
$ cargo test -- --show-output
   Compiling silly-function v0.1.0 (file:///projects/silly-function)
    Finished `test` profile [unoptimized + debuginfo] target(s) in 0.60s
     Running unittests src/lib.rs (target/debug/deps/silly_function-160869f38cff9166)

running 2 tests
test tests::this_test_will_fail ... FAILED
test tests::this_test_will_pass ... ok

successes:

---- tests::this_test_will_pass stdout ----
I got the value 4


successes:
    tests::this_test_will_pass

failures:

---- tests::this_test_will_fail stdout ----
I got the value 8
thread 'tests::this_test_will_fail' panicked at src/lib.rs:19:9:
assertion `left == right` failed
  left: 10
 right: 5
note: run with `RUST_BACKTRACE=1` environment variable to display a backtrace


failures:
    tests::this_test_will_fail

test result: FAILED. 1 passed; 1 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s

error: test failed, to rerun pass `--lib`
```

### 按名称运行测试子集

有时，运行完整的测试套件可能需要很长时间。如果你正在处理特定区域的代码，你可能只想运行与该代码相关的测试。你可以通过将要运行的测试的名称作为参数传递给 cargo test 来选择要运行的测试。

为了演示如何运行测试子集，我们将首先为我们的 add_two 函数创建三个测试，如清单 11-11 所示，并选择要运行的测试。

Filename: src/lib.rs:

```rust
pub fn add_two(a: usize) -> usize {
    a + 2
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn add_two_and_two() {
        let result = add_two(2);
        assert_eq!(result, 4);
    }

    #[test]
    fn add_three_and_two() {
        let result = add_two(3);
        assert_eq!(result, 5);
    }

    #[test]
    fn one_hundred() {
        let result = add_two(100);
        assert_eq!(result, 102);
    }
}
```

清单 11-11：具有三个不同名称的三个测试

如果我们不传递任何参数运行测试，如前所述，所有测试将并行运行：

```rust
$ cargo test
   Compiling adder v0.1.0 (file:///projects/adder)
    Finished `test` profile [unoptimized + debuginfo] target(s) in 0.62s
     Running unittests src/lib.rs (target/debug/deps/adder-92948b65e88960b4)

running 3 tests
test tests::add_three_and_two ... ok
test tests::add_two_and_two ... ok
test tests::one_hundred ... ok

test result: ok. 3 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s

   Doc-tests adder

running 0 tests

test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
```

#### 运行单个测试

我们可以将任何测试函数的名称传递给 cargo test，以仅运行该测试：

```rust
$ cargo test one_hundred
   Compiling adder v0.1.0 (file:///projects/adder)
    Finished `test` profile [unoptimized + debuginfo] target(s) in 0.69s
     Running unittests src/lib.rs (target/debug/deps/adder-92948b65e88960b4)

running 1 test
test tests::one_hundred ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 2 filtered out; finished in 0.00s
```

只有名为 one_hundred 的测试运行了；其他两个测试与该名称不匹配。测试输出通过在末尾显示 2 filtered out 让我们知道还有更多未运行的测试。

我们不能以这种方式指定多个测试的名称；只会使用给予 cargo test 的第一个值。但是有一种方法可以运行多个测试。

#### 过滤运行多个测试

我们可以指定测试名称的一部分，任何名称与该值匹配的测试都将运行。例如，因为我们的两个测试名称包含 add，我们可以通过运行 `cargo test add` 来运行这两个测试：

```rust
$ cargo test add
   Compiling adder v0.1.0 (file:///projects/adder)
    Finished `test` profile [unoptimized + debuginfo] target(s) in 0.61s
     Running unittests src/lib.rs (target/debug/deps/adder-92948b65e88960b4)

running 2 tests
test tests::add_three_and_two ... ok
test tests::add_two_and_two ... ok

test result: ok. 2 passed; 0 failed; 0 ignored; 0 measured; 1 filtered out; finished in 0.00s
```

此命令运行名称中包含 add 的所有测试，并过滤掉名为 one_hundred 的测试。还要注意，测试所在的模块成为测试名称的一部分，因此我们可以通过过滤模块的名称来运行模块中的所有测试。

### 除非特别请求，否则忽略某些测试

有时，一些特定的测试执行起来可能非常耗时，因此你可能希望在大多数 cargo test 运行期间排除它们。与其将所有你想运行的测试列为参数，你可以使用 ignore 属性注释耗时的测试以排除它们，如下所示：

Filename: src/lib.rs:

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

    #[test]
    #[ignore]
    fn expensive_test() {
        // code that takes an hour to run
    }
}
```

在 `#[test]` 之后，我们添加 `#[ignore]` 行到我们想要排除的测试。现在当我们运行测试时，it_works 会运行，但 expensive_test 不会：

```rust
$ cargo test
   Compiling adder v0.1.0 (file:///projects/adder)
    Finished `test` profile [unoptimized + debuginfo] target(s) in 0.60s
     Running unittests src/lib.rs (target/debug/deps/adder-92948b65e88960b4)

running 2 tests
test tests::expensive_test ... ignored
test tests::it_works ... ok

test result: ok. 1 passed; 0 failed; 1 ignored; 0 measured; 0 filtered out; finished in 0.00s

   Doc-tests adder

running 0 tests

test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
```

函数 `expensive_test` 被列为忽略。如果我们只想运行被忽略的测试，我们可以使用 `cargo test -- --ignored`：

```rust
$ cargo test -- --ignored
   Compiling adder v0.1.0 (file:///projects/adder)
    Finished `test` profile [unoptimized + debuginfo] target(s) in 0.61s
     Running unittests src/lib.rs (target/debug/deps/adder-92948b65e88960b4)

running 1 test
test expensive_test ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 1 filtered out; finished in 0.00s

   Doc-tests adder

running 0 tests

test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
```

通过控制运行哪些测试，你可以确保你的 cargo test 结果会快速返回。当你到了一个检查被忽略测试结果有意义的时候，并且你有时间等待结果，你可以运行 `cargo test -- --ignored`。如果你想运行所有测试，无论它们是否被忽略，你可以运行 `cargo test -- --include-ignored`。
