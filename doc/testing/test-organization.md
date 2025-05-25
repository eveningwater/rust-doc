## 测试的组织结构

正如本章开始时提到的，测试是一个复杂的学科，不同的人使用不同的术语和组织方式。Rust 社区将测试分为两个主要类别：单元测试和集成测试。单元测试规模较小且更加集中，一次只测试一个模块的隔离情况，并且可以测试私有接口。集成测试完全外部于你的库，它们像其他外部代码一样使用你的代码，只使用公共接口，并且可能一次测试多个模块。

编写这两种测试都很重要，以确保你的库的各个部分按照你期望的方式工作，无论是单独工作还是一起工作。

### 单元测试

单元测试的目的是将代码的每个单元与其余代码隔离开来进行测试，以便快速找出代码在哪里工作正常，在哪里工作不正常。你将把单元测试放在 src 目录中，与它们测试的代码放在同一个文件中。惯例是在每个文件中创建一个名为 tests 的模块来包含测试函数，并用`cfg(test)`注解该模块。

#### Tests 模块和`#[cfg(test)]`

在 tests 模块上的`#[cfg(test)]`注解告诉 Rust 只有在运行`cargo test`时才编译和运行测试代码，而不是在运行`cargo build`时。这在你只想构建库时节省了编译时间，并且由于测试不包括在内，所以在最终编译的产物中节省了空间。你会看到，因为集成测试位于不同的目录中，所以它们不需要`#[cfg(test)]`注解。然而，由于单元测试与代码位于同一个文件中，你将使用`#[cfg(test)]`来指定它们不应该包含在编译结果中。

回想一下，当我们在本章第一节生成新的 adder 项目时，Cargo 为我们生成了这段代码：

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

在自动生成的 tests 模块上，属性 cfg 代表配置，它告诉 Rust 只有在给定特定配置选项的情况下才包含以下项。在这种情况下，配置选项是 test，这是 Rust 为编译和运行测试提供的。通过使用 cfg 属性，Cargo 只有在我们主动运行`cargo test`时才编译我们的测试代码。这包括可能在此模块内的任何辅助函数，以及带有`#[test]`注解的函数。

#### 测试私有函数

在测试社区中，关于是否应该直接测试私有函数存在争议，其他语言使得测试私有函数变得困难或不可能。无论你遵循哪种测试理念，Rust 的隐私规则确实允许你测试私有函数。考虑示例 11-12 中带有私有函数 internal_adder 的代码。

文件名：src/lib.rs：

```rust
pub fn add_two(a: usize) -> usize {
    internal_adder(a, 2)
}

fn internal_adder(left: usize, right: usize) -> usize {
    left + right
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn internal() {
        let result = internal_adder(2, 2);
        assert_eq!(result, 4);
    }
}
```

示例 11-12：测试私有函数

注意，internal_adder 函数没有标记为 pub。测试只是 Rust 代码，而 tests 模块只是另一个模块。正如我们在"引用模块树中项目的路径"部分讨论的那样，子模块中的项可以使用其祖先模块中的项。在这个测试中，我们使用`use super::*;`将 tests 模块的父模块的所有项引入作用域，然后测试可以调用 internal_adder。如果你认为不应该测试私有函数，Rust 中没有什么会强制你这样做。

### 集成测试

在 Rust 中，集成测试完全外部于你的库。它们像其他代码一样使用你的库，这意味着它们只能调用作为你的库的公共 API 一部分的函数。它们的目的是测试你的库的许多部分是否正确地一起工作。单独工作正确的代码单元在集成时可能会出现问题，因此集成代码的测试覆盖也很重要。要创建集成测试，你首先需要一个 tests 目录。

#### tests 目录

我们在项目目录的顶层创建一个 tests 目录，与 src 目录相邻。Cargo 知道要在这个目录中查找集成测试文件。然后我们可以创建任意数量的测试文件，Cargo 将把每个文件编译为一个单独的 crate。

让我们创建一个集成测试。在示例 11-12 的代码仍然在 src/lib.rs 文件中的情况下，创建一个 tests 目录，并创建一个名为 tests/integration_test.rs 的新文件。你的目录结构应该如下所示：

```rust
adder
├── Cargo.lock
├── Cargo.toml
├── src
│   └── lib.rs
└── tests
    └── integration_test.rs
```

将示例 11-13 中的代码输入到 tests/integration_test.rs 文件中。

文件名：tests/integration_test.rs：

```rust
use adder::add_two;

#[test]
fn it_adds_two() {
    let result = add_two(2);
    assert_eq!(result, 4);
}
```

示例 11-13：adder crate 函数的集成测试

tests 目录中的每个文件都是一个单独的 crate，所以我们需要将我们的库引入到每个测试 crate 的作用域中。为此，我们在代码顶部添加`use adder::add_two;`，这在单元测试中是不需要的。

我们不需要用`#[cfg(test)]`注解 tests/integration_test.rs 中的任何代码。Cargo 特殊对待 tests 目录，只有在我们运行`cargo test`时才编译这个目录中的文件。现在运行`cargo test`：

```rust
$ cargo test
   Compiling adder v0.1.0 (file:///projects/adder)
    Finished `test` profile [unoptimized + debuginfo] target(s) in 1.31s
     Running unittests src/lib.rs (target/debug/deps/adder-1082c4b063a8fbe6)

running 1 test
test tests::internal ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s

     Running tests/integration_test.rs (target/debug/deps/integration_test-1082c4b063a8fbe6)

running 1 test
test it_adds_two ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s

   Doc-tests adder

running 0 tests

test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
```

输出的三个部分包括单元测试、集成测试和文档测试。注意，如果一个部分中的任何测试失败，后续部分将不会运行。例如，如果单元测试失败，将不会有集成测试和文档测试的输出，因为这些测试只有在所有单元测试通过时才会运行。

单元测试的第一部分与我们一直看到的相同：每个单元测试一行（我们在示例 11-12 中添加的一个名为`internal`的测试），然后是单元测试的摘要行。

集成测试部分以`Running tests/integration_test.rs`行开始。接下来，该集成测试中的每个测试函数都有一行，以及在`Doc-tests adder`部分开始之前的集成测试结果的摘要行。

每个集成测试文件都有自己的部分，所以如果我们在 tests 目录中添加更多文件，将会有更多集成测试部分。

我们仍然可以通过将测试函数的名称指定为`cargo test`的参数来运行特定的集成测试函数。要运行特定集成测试文件中的所有测试，使用`cargo test`的`--test`参数，后跟文件名：

```rust
$ cargo test --test integration_test
   Compiling adder v0.1.0 (file:///projects/adder)
    Finished `test` profile [unoptimized + debuginfo] target(s) in 0.64s
     Running tests/integration_test.rs (target/debug/deps/integration_test-82e7799c1bc62298)

running 1 test
test it_adds_two ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
```

此命令仅运行`tests/integration_test.rs`文件中的测试。

#### 集成测试中的子模块

随着添加更多的集成测试，你可能想在 tests 目录中创建更多文件来帮助组织它们；例如，你可以按照它们测试的功能对测试函数进行分组。如前所述，tests 目录中的每个文件都被编译为自己的单独 crate，这对于创建单独的作用域以更紧密地模仿最终用户将如何使用你的 crate 很有用。然而，这意味着 tests 目录中的文件不像 src 中的文件那样共享相同的行为，正如你在第 7 章关于如何将代码分离到模块和文件中所学到的那样。

tests 目录文件的不同行为在你有一组要在多个集成测试文件中使用的辅助函数，并尝试按照第 7 章的"将模块分离到不同文件"部分中的步骤将它们提取到一个公共模块中时最为明显。例如，如果我们创建 tests/common.rs 并在其中放置一个名为 setup 的函数，我们可以添加一些代码到 setup 中，这些代码我们想从多个测试文件中的多个测试函数调用：

文件名：tests/common.rs：

```rust
pub fn setup() {
    // 这里会放置特定于你的库测试的设置代码
}
```

当我们再次运行测试时，我们将在测试输出中看到一个新的部分，即使这个文件不包含任何测试函数，我们也没有从任何地方调用`setup`函数：

```rust
$ cargo test
   Compiling adder v0.1.0 (file:///projects/adder)
    Finished `test` profile [unoptimized + debuginfo] target(s) in 0.89s
     Running unittests src/lib.rs (target/debug/deps/adder-92948b65e88960b4)

running 1 test
test tests::internal ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s

     Running tests/common.rs (target/debug/deps/common-92948b65e88960b4)

running 0 tests

test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s

     Running tests/integration_test.rs (target/debug/deps/integration_test-92948b65e88960b4)

running 1 test
test it_adds_two ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s

   Doc-tests adder

running 0 tests

test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
```

在测试结果中出现`common`并显示`running 0 tests`不是我们想要的。我们只想共享一些代码给其他集成测试文件。

为了避免在测试输出中出现`common`，我们将创建 tests/common/mod.rs 而不是创建 tests/common.rs。项目目录现在看起来像这样：

```rust
├── Cargo.lock
├── Cargo.toml
├── src
│   └── lib.rs
└── tests
    ├── common
    │   └── mod.rs
    └── integration_test.rs
```

这是我们在第 7 章的"替代文件路径"部分中提到的 Rust 也理解的旧命名约定。以这种方式命名文件告诉 Rust 不要将`common`模块视为集成测试文件。当我们将`setup`函数代码移动到 tests/common/mod.rs 并删除 tests/common.rs 文件后，测试输出中的部分将不再出现。tests 目录中子目录中的文件不会被编译为单独的 crate 或在测试输出中有部分。

创建 tests/common/mod.rs 后，我们可以将其作为模块从任何集成测试文件中使用。这是一个从 tests/integration_test.rs 中的`it_adds_two`测试调用`setup`函数的例子：

文件名：tests/integration_test.rs：

```rust
use adder::add_two;

mod common;

#[test]
fn it_adds_two() {
    common::setup();

    let result = add_two(2);
    assert_eq!(result, 4);
}
```

注意，`mod common;`声明与我们在示例 7-21 中演示的模块声明相同。然后在测试函数中，我们可以调用`common::setup()`函数。

#### 二进制 crate 的集成测试

如果我们的项目是一个只包含 src/main.rs 文件而没有 src/lib.rs 文件的二进制 crate，我们就不能在 tests 目录中创建集成测试并使用`use`语句将 src/main.rs 文件中定义的函数引入作用域。只有库 crate 才会暴露可供其他 crate 使用的函数；二进制 crate 是为了自己运行而设计的。

这是 Rust 项目提供二进制程序的原因之一，即它们在 src/main.rs 文件中有一个直接调用 src/lib.rs 文件中逻辑的简单函数。使用这种结构，集成测试可以通过`use`来测试库 crate，使重要的功能可用。如果重要的功能能够工作，src/main.rs 文件中的少量代码也会工作，而这少量代码不需要被测试。

### 总结

Rust 的测试功能提供了一种方法来指定代码应该如何运行，以确保它在你做出更改时继续按照你期望的方式工作。单元测试分别测试库的不同部分，并且可以测试私有实现细节。集成测试检查库的多个部分是否正确地一起工作，并使用库的公共 API 来测试代码，就像外部代码将使用它一样。尽管 Rust 的类型系统和所有权规则有助于防止某些类型的错误，但测试对于减少与代码预期行为有关的逻辑错误仍然很重要。

让我们将你在本章和前几章学到的知识结合起来，一起开展一个项目！
