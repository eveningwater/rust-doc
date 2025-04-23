## 使用字符串存储 UTF-8 编码的文本

我们在第 4 章中讨论过字符串，但现在我们将更深入地研究它们。
新 Rust 使用者通常会因为三个原因而在字符串上遇到困难：Rust 倾向于暴露可能的错误，字符串是比许多程序员认为的更复杂的数据结构，以及 UTF-8。这些因素结合在一起，当你从其他编程语言转过来时，可能会感到困难。

我们在集合的上下文中讨论字符串，因为字符串是作为字节集合实现的，加上一些方法，当这些字节被解释为文本时提供有用的功能。在本节中，我们将讨论`String`拥有的每种集合类型都有的操作，例如创建、更新和读取。我们还将讨论`String`与其他集合不同的方式，即如何索引到`String`中因人与计算机解释`String`数据的差异而变得复杂。

### 什么是字符串？

我们首先定义我们所说的*字符串*是什么。Rust 在核心语言中只有一种字符串类型，即字符串切片`str`，通常以其借用形式`&str`出现。在第 4 章中，我们讨论了*字符串切片*，它们是对存储在其他地方的一些 UTF-8 编码字符串数据的引用。例如，字符串字面值存储在程序的二进制文件中，因此它们是字符串切片。

`String`类型由 Rust 的标准库提供，而不是编码到核心语言中，它是一种可增长的、可变的、拥有所有权的、UTF-8 编码的字符串类型。当 Rustaceans 在 Rust 中提到"字符串"时，他们可能指的是`String`或字符串切片`&str`类型，而不仅仅是其中一种类型。尽管本节主要讨论`String`，但这两种类型在 Rust 的标准库中都被大量使用，并且`String`和字符串切片都是 UTF-8 编码的。

### 创建新字符串

`Vec<T>`可用的许多操作也可用于`String`，因为`String`实际上是作为带有一些额外保证、限制和功能的字节向量的包装器实现的。一个与`Vec<T>`和`String`工作方式相同的函数示例是`new`函数，用于创建实例，如示例 8-11 所示。

```rust
fn main() {
    let mut s = String::new();
}
```

示例 8-11 创建一个新的空`String`

这行代码创建了一个名为`s`的新的空字符串，我们可以向其中加载数据。通常，我们会有一些初始数据，希望用它来开始字符串。为此，我们使用`to_string`方法，该方法可用于任何实现`Display`特性的类型，如字符串字面值。示例 8-12 展示了两个例子。

```rust
fn main() {
    let data = "initial contents";

    let s = data.to_string();

    // the method also works on a literal directly:
    let s = "initial contents".to_string();
}
```

示例 8-12 使用`to_string`方法从字符串字面值创建`String`

这段代码创建了一个包含`initial contents`的字符串。

我们也可以使用函数`String::from`从字符串字面值创建`String`。示例 8-13 中的代码等同于使用`to_string`的示例 8-12 中的代码。

```rust
fn main() {
    let s = String::from("initial contents");
}
```

示例 8-13 使用`String::from`函数从字符串字面值创建`String`

因为字符串用于很多事情，我们可以为字符串使用许多不同的通用 API，为我们提供了很多选择。其中一些可能看起来是多余的，但它们都有自己的位置！在这种情况下，`String::from`和`to_string`做同样的事情，所以选择哪一个是风格和可读性的问题。

记住，字符串是 UTF-8 编码的，所以我们可以在其中包含任何正确编码的数据，如示例 8-14 所示。

```rust
fn main() {
    let hello = String::from("السلام عليكم");
    let hello = String::from("Dobrý den");
    let hello = String::from("Hello");
    let hello = String::from("שלום");
    let hello = String::from("नमस्ते");
    let hello = String::from("こんにちは");
    let hello = String::from("안녕하세요");
    let hello = String::from("你好");
    let hello = String::from("Olá");
    let hello = String::from("Здравствуйте");
    let hello = String::from("Hola");
}
```

示例 8-14 在字符串中存储不同语言的问候语

所有这些都是有效的`String`值。

### 更新字符串

`String`可以增长大小，其内容可以改变，就像`Vec<T>`的内容一样，如果你向其中推入更多数据。此外，你可以方便地使用`+`运算符或`format!`宏来连接`String`值。

#### 使用`push_str`和`push`附加到字符串

我们可以使用`push_str`方法来增长`String`，附加一个字符串切片，如示例 8-15 所示。

```rust
fn main() {
    let mut s = String::from("foo");
    s.push_str("bar");
}
```

示例 8-15 使用`push_str`方法将字符串切片附加到`String`

在这两行之后，`s`将包含`foobar`。`push_str`方法接受一个字符串切片，因为我们不一定想要获取参数的所有权。例如，在示例 8-16 的代码中，我们希望在将`s2`的内容附加到`s1`之后仍然能够使用`s2`。

```rust
fn main() {
    let mut s1 = String::from("foo");
    let s2 = "bar";
    s1.push_str(s2);
    println!("s2 is {s2}");
}
```

示例 8-16 在将字符串切片的内容附加到`String`后使用该字符串切片

如果`push_str`方法获取了`s2`的所有权，我们就不能在最后一行打印其值。然而，这段代码按我们预期的方式工作！

`push`方法接受一个字符作为参数，并将其添加到`String`中。示例 8-17 使用`push`方法将字母*l*添加到`String`中。

```rust
fn main() {
    let mut s = String::from("lo");
    s.push('l');
}
```

示例 8-17 使用`push`向`String`值添加一个字符

结果，`s`将包含`lol`。

#### 使用`+`运算符或`format!`宏进行连接

通常，你会想要组合两个现有的字符串。一种方法是使用`+`运算符，如示例 8-18 所示。

```rust
fn main() {
    let s1 = String::from("Hello, ");
    let s2 = String::from("world!");
    let s3 = s1 + &s2; // 注意s1已经被移动，不能再使用
}
```

示例 8-18 使用`+`运算符将两个`String`值组合成一个新的`String`值

字符串`s3`将包含`Hello, world!`。`s1`在加法之后不再有效，以及我们使用`s2`的引用的原因，与我们使用`+`运算符时调用的方法的签名有关。`+`运算符使用`add`方法，其签名看起来像这样：

```rust
fn add(self, s: &str) -> String {
    // --snip--
}
```

在标准库中，你会看到使用泛型和关联类型定义的`add`。这里，我们用具体类型替换，这是我们用`String`值调用此方法时发生的情况。我们将在第 10 章讨论泛型。这个签名给了我们理解`+`运算符棘手部分所需的线索。

首先，`s2`有一个`&`，意味着我们将第二个字符串的*引用*添加到第一个字符串。这是因为`add`函数中的`s`参数：我们只能将`&str`添加到`String`；我们不能将两个`String`值相加。但等等——`&s2`的类型是`&String`，不是`&str`，如`add`的第二个参数所指定的。那么为什么示例 8-18 能编译呢？

我们能够在调用`add`时使用`&s2`的原因是编译器可以将`&String`参数*强制转换*为`&str`。当我们调用`add`方法时，Rust 使用*解引用强制转换*，这里将`&s2`变成`&s2[..]`。我们将在第 15 章更深入地讨论解引用强制转换。因为`add`不获取`s`参数的所有权，`s2`在此操作后仍然是有效的`String`。

其次，我们可以在签名中看到`add`获取`self`的所有权，因为`self`_没有_`&`。这意味着示例 8-18 中的`s1`将被移动到`add`调用中，之后将不再有效。所以，尽管`let s3 = s1 + &s2;`看起来像是会复制两个字符串并创建一个新的字符串，但这个语句实际上获取了`s1`的所有权，附加了`s2`内容的副本，然后返回结果的所有权。换句话说，它看起来像是在做很多复制，但实际上并没有；实现比复制更高效。

如果我们需要连接多个字符串，`+`运算符的行为会变得笨拙：

```rust
fn main() {
    let s1 = String::from("tic");
    let s2 = String::from("tac");
    let s3 = String::from("toe");

    let s = s1 + "-" + &s2 + "-" + &s3;
}
```

此时，`s`将是`tic-tac-toe`。随着所有的`+`和`"`字符，很难看清发生了什么。对于更复杂的字符串组合，我们可以使用`format!`宏：

```rust
fn main() {
    let s1 = String::from("tic");
    let s2 = String::from("tac");
    let s3 = String::from("toe");

    let s = format!("{s1}-{s2}-{s3}");
}
```

这段代码也将`s`设置为`tic-tac-toe`。`format!`宏的工作方式类似于`println!`，但不是将输出打印到屏幕，而是返回一个包含内容的`String`。使用`format!`的代码版本更容易阅读，并且`format!`宏生成的代码使用引用，所以这个调用不会获取任何参数的所有权。

### 索引到字符串

在许多其他编程语言中，通过索引引用字符串中的单个字符是有效且常见的操作。然而，如果你尝试在 Rust 中使用索引语法访问`String`的部分，你会得到一个错误。考虑示例 8-19 中的无效代码。

```rust
fn main() {
    let s1 = String::from("hello");
    let h = s1[0];
}
```

示例 8-19 尝试对 String 使用索引语法

这段代码将导致以下错误：

```console
$ cargo run
   Compiling collections v0.1.0 (file:///projects/collections)
error[E0277]: the type `str` cannot be indexed by `{integer}`
 --> src/main.rs:3:16
  |
3 |     let h = s1[0];
  |                ^ string indices are ranges of `usize`
  |
  = help: the trait `SliceIndex<str>` is not implemented for `{integer}`, which is required by `String: Index<_>`
  = note: you can use `.chars().nth()` or `.bytes().nth()`
          for more information, see chapter 8 in The Book: <https://doc.rust-lang.org/book/ch08-02-strings.html#indexing-into-strings>
  = help: the trait `SliceIndex<[_]>` is implemented for `usize`
  = help: for that trait implementation, expected `[_]`, found `str`
  = note: required for `String` to implement `Index<{integer}>`

For more information about this error, try `rustc --explain E0277`.
error: could not compile `collections` (bin "collections") due to 1 previous error
```

错误和注释讲述了故事：Rust 字符串不支持索引。但为什么不呢？要回答这个问题，我们需要讨论 Rust 如何在内存中存储字符串。

#### 内部表示

`String`是`Vec<u8>`的包装器。让我们看看示例 8-14 中一些正确编码的 UTF-8 示例字符串。首先，这个：

```rust
fn main() {
    let hello = String::from("السلام عليكم");
    let hello = String::from("Dobrý den");
    let hello = String::from("Hello");
    let hello = String::from("שלום");
    let hello = String::from("नमस्ते");
    let hello = String::from("こんにちは");
    let hello = String::from("안녕하세요");
    let hello = String::from("你好");
    let hello = String::from("Olá");
    let hello = String::from("Здравствуйте");
    let hello = String::from("Hola");
}
```

在这种情况下，`len`将是`4`，这意味着存储字符串`"Hola"`的向量长度为 4 个字节。这些字母中的每一个在 UTF-8 编码中都占用一个字节。然而，下面这行可能会让你感到惊讶（注意这个字符串以大写的西里尔字母*Ze*开头，而不是数字 3）：

```rust
fn main() {
    let hello = String::from("السلام عليكم");
    let hello = String::from("Dobrý den");
    let hello = String::from("Hello");
    let hello = String::from("שלום");
    let hello = String::from("नमस्ते");
    let hello = String::from("こんにちは");
    let hello = String::from("안녕하세요");
    let hello = String::from("你好");
    let hello = String::from("Olá");
    let hello = String::from("Здравствуйте");
    let hello = String::from("Hola");
}
```

如果有人问你这个字符串有多长，你可能会说 12。事实上，Rust 的答案是 24：这是在 UTF-8 中编码"Здравствуйте"所需的字节数，因为该字符串中的每个 Unicode 标量值占用 2 个字节的存储空间。因此，字符串字节的索引并不总是与有效的 Unicode 标量值相关。为了演示，考虑这个无效的 Rust 代码：

```rust
let hello = "Здравствуйте";
let answer = &hello[0];
```

你已经知道`answer`不会是`З`，即第一个字母。当在 UTF-8 中编码时，`З`的第一个字节是`208`，第二个是`151`，所以看起来`answer`实际上应该是`208`，但`208`本身不是一个有效的字符。返回`208`可能不是用户在请求这个字符串的第一个字母时想要的；然而，这是 Rust 在字节索引 0 处唯一拥有的数据。用户通常不希望返回字节值，即使字符串只包含拉丁字母：如果`&"hi"[0]`是有效的代码并返回字节值，它将返回`104`，而不是`h`。

因此，答案是，为了避免返回意外值并导致可能不会立即被发现的错误，Rust 根本不编译这段代码，并在开发过程的早期防止误解。

#### 字节、标量值和字形簇！天啊！

关于 UTF-8 的另一点是，从 Rust 的角度看，实际上有三种相关的方式来看待字符串：作为字节、标量值和字形簇（最接近我们所说的*字母*的东西）。

如果我们看用梵文写的印地语单词"नमस्ते"，它存储为`u8`值的向量，看起来像这样：

```rust
[224, 164, 168, 224, 164, 174, 224, 164, 184, 224, 165, 141, 224, 164, 164,
224, 165, 135]
```

这是 18 个字节，计算机最终就是这样存储这些数据的。如果我们将它们看作 Unicode 标量值，即 Rust 的`char`类型，那些字节看起来像这样：

```rust
['न', 'म', 'स', '्', 'त', 'े']
```

这里有六个`char`值，但第四个和第六个不是字母：它们是单独没有意义的变音符号。最后，如果我们将它们看作字形簇，我们会得到一个人所说的组成印地语单词的四个字母：

```rust
["न", "म", "स्", "ते"]
```

Rust 提供了不同的方式来解释计算机存储的原始字符串数据，这样每个程序都可以选择它需要的解释，无论数据是什么人类语言。

Rust 不允许我们索引到`String`以获取字符的最后一个原因是，索引操作预期总是花费常量时间（O(1)）。但对于`String`，无法保证这种性能，因为 Rust 必须从头遍历内容到索引，以确定有多少有效字符。

### 切片字符串

索引到字符串通常是个坏主意，因为不清楚字符串索引操作的返回类型应该是什么：字节值、字符、字形簇或字符串切片。因此，如果你真的需要使用索引来创建字符串切片，Rust 要求你更加明确。

与其使用`[]`和单个数字进行索引，你可以使用`[]`和一个范围来创建包含特定字节的字符串切片：

```rust
let hello = "Здравствуйте";

let s = &hello[0..4];
```

这里，`s`将是一个`&str`，包含字符串的前四个字节。前面我们提到，这些字符中的每一个是两个字节，这意味着`s`将是`Зд`。

如果我们尝试只切片一个字符的部分字节，比如`&hello[0..1]`，Rust 会在运行时恐慌，就像访问向量中的无效索引一样：

```rust
$ cargo run
   Compiling collections v0.1.0 (file:///projects/collections)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.43s
     Running `target/debug/collections`
thread 'main' panicked at src/main.rs:4:19:
byte index 1 is not a char boundary; it is inside 'З' (bytes 0..2) of `Здравствуйте`
note: run with `RUST_BACKTRACE=1` environment variable to display a backtrace
```

在使用范围创建字符串切片时应该小心，因为这样做可能会使你的程序崩溃。

### 迭代字符串的方法

操作字符串片段的最佳方式是明确你是想要字符还是字节。对于单个 Unicode 标量值，使用`chars`方法。在"Зд"上调用`chars`会分离出并返回两个`char`类型的值，你可以迭代结果来访问每个元素：

```rust
for c in "Зд".chars() {
    println!("{c}");
}
```

这段代码将打印以下内容：

```rust
З
д
```

或者，`bytes`方法返回每个原始字节，这可能适合你的领域：

```rust
for b in "Зд".bytes() {
    println!("{b}");
}
```

这段代码将打印组成这个字符串的四个字节：

```rust
208
151
208
180
```

但请记住，有效的 Unicode 标量值可能由多个字节组成。

从字符串获取字形簇，如梵文脚本，是复杂的，所以标准库没有提供这个功能。如果你需要这个功能，可以在[crates.io](https://crates.io/)<!-- ignore -->上找到相关的 crate。

### 字符串并不那么简单

总结一下，字符串很复杂。不同的编程语言对如何向程序员呈现这种复杂性做出不同的选择。Rust 选择将正确处理`String`数据作为所有 Rust 程序的默认行为，这意味着程序员必须预先更多地考虑处理 UTF-8 数据。这种权衡暴露了比其他编程语言中明显的更多的字符串复杂性，但它防止你在开发生命周期的后期处理涉及非 ASCII 字符的错误。

好消息是，标准库提供了许多基于`String`和`&str`类型的功能，帮助正确处理这些复杂情况。请务必查看文档中有用的方法，如用于在字符串中搜索的`contains`和用于替换字符串部分的`replace`。

让我们转向一些不那么复杂的东西：哈希映射！
