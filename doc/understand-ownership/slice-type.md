## 切片

切片允许你引用集合中连续的元素序列，而不是整个集合。切片是一种引用，因此它没有所有权。

这是一个小编程问题：编写一个函数，该函数接受一个由空格分隔的单词字符串，并返回在该字符串中找到的第一个单词。如果函数在字符串中未找到空格，则整个字符串必须是一个单词，因此应返回整个字符串。

让我们研究一下如何在不使用切片的情况下编写此函数的签名，以了解切片将解决的 ​​ 问题：

```rust
fn first_word(s: &String) -> ?
```

first_word 函数有一个 &String 作为参数。我们不需要所有权，所以这没问题。但我们应该返回什么呢？我们真的没有办法了解字符串的一部分。但是，我们可以返回单词结尾的索引，用空格表示。让我们尝试一下，如示例 4-7 所示。

```rust
fn first_word(s: &String) -> usize {
    let bytes = s.as_bytes();

    for (i, &item) in bytes.iter().enumerate() {
        if item == b' ' {
            return i;
        }
    }

    s.len()
}
```

示例 4-7：first_word 函数将字节索引值返回到 String 参数中

因为我们需要逐个遍历元素那样地检查字符串并检查值是否为空格，所以我们将使用 as_bytes 方法将字符串转换为字节数组。

```rust
let bytes = s.as_bytes();
```

接下来，我们使用 iter 方法在字节数组上创建一个迭代器：

```rust
for (i, &item) in bytes.iter().enumerate() {
    // ....
}
```

我们将在第 13 章中更详细地讨论迭代器。现在，知道 iter 是一种返回集合中每个元素的方法，而 enumerate 包装了 iter 的结果并将每个元素作为元组的一部分返回。enumerate 返回的元组的第一个元素是索引，第二个元素是对该元素的引用。这比我们自己计算索引要方便一些。

因为 enumerate 方法返回一个元组，所以我们可以使用模式来解构该元组。我们将在第 6 章中进一步讨论模式。在 for 循环中，我们指定一个模式，该模式以 i 为元组中的索引，以 `&item` 为元组中的单个字节。因为我们从 `.iter().enumerate()` 获得了对元素的引用，所以我们在模式中使用 `&`。

在 for 循环中，我们使用字节文字语法搜索表示空格的字节。如果找到空格，则返回其位置。否则，我们使用 s.len() 返回字符串的长度。

```rust
if item == b' ' {
    return i;
}
s.len()
```

现在，我们有了一种方法，可以找出字符串中第一个单词的结尾索引，但有一个问题。我们返回了一个 usize，但它只是 &String 上下文中的一个有意义的数字。换句话说，因为它是一个独立于 String 的值，所以不能保证它在将来仍然有效。考虑示例 4-8 中使用示例 4-7 中的 first_word 函数的程序。

```rust
fn main() {
    let mut s = String::from("hello world");

    let word = first_word(&s); // word 将获得值 5

    s.clear(); // 这会清空字符串，使其等于 ""

    // word 在此处仍具有值 5，但不再有字符串
    // 我们可以有意义地使用值 5。word 现在完全无效！
}
```

示例 4-8：存储调用 first_word 函数的结果然后更改字符串内容

此程序编译时没有任何错误，如果我们在调用 s.clear() 后使用 word，也会没有任何错误。由于 word 完全不与 s 的状态相关联，因此 word 仍包含值 5。我们可以将值 5 与变量 s 一起使用，以尝试提取出第一个单词，但这会是一个错误，因为自从我们将 5 保存到 word 中后，s 的内容已经发生了变化。

担心 word 中的索引与 s 中的数据不同步是一件繁琐且容易出错的事情！如果我们编写一个 second_word 函数，管理这些索引会更加困难。它的签名必须如下所示：

```rust
fn second_word(s: &String) -> (usize, usize) {
    //...
}
```

现在，我们正在跟踪起始和结束索引，并且我们拥有更多根据特定状态下的数据计算出来的值，但这些值与该状态完全无关。我们有三个不相关的变量需要保持同步。

幸运的是，Rust 为这个问题提供了一个解决方案：字符串切片。

### 字符串切片

字符串切片是对字符串的一部分的引用，它看起来像这样：

```rust
let s = String::from("hello world");
let hello = &s[0..5];
let world = &s[6..11];
```

hello 不是对整个字符串的引用，而是对字符串的一部分的引用，在额外的 `[0..5]` 位中指定。我们通过指定 `[starting_index..ending_index]` 在括号内使用范围创建切片，其中 starting_index(开始索引) 是切片中的第一个位置，ending_index(结束索引)比切片中的最后一个位置多一个。在内部，切片数据结构存储切片的起始位置和长度，该长度对应于 `ending_index` 减去 `starting_index`。因此，在 `let world = &s[6..11];` 的情况下，world 将是一个切片，其中包含指向 s 索引 6 处的字节的指针，其长度值为 5。

图 4-7 以图表形式显示了这一情况。

![三个表：一个表表示s的堆栈数据，指向堆上字符串数据“hello world”的表中索引0处的字节。第三个表表示切片world的堆栈数据，其长度值为5，指向堆数据表的第6个字节。](../images/trpl04-07.svg)

图 4-7：字符串切片引用字符串的一部分

使用 Rust 的 `..` 范围语法，如果要从索引 0 开始，可以删除两个句点之前的值。换句话说，它们是相等的：

```rust
let s = String::from("hello");

let slice = &s[0..2];
let slice = &s[..2]; // 与前一行相同！
```

同样的道理，如果你的切片包含字符串的最后一个字节，你可以删除尾随的数字。这意味着它们是相等的：

```rust
let s = String::from("hello");

let len = s.len();

let slice = &s[3..len];
let slice = &s[3..]; // 与前一行相同！
```

你还可以删除这两个值以取整个字符串的片段。因此，它们是相等的：

```rust
let s = String::from("hello");

let len = s.len();

let slice = &s[0..len];
let slice = &s[..];
```

> 注意：字符串切片范围索引必须出现在有效的 UTF-8 字符边界处。如果你尝试在多字节字符中间创建字符串切片，程序将退出并出现错误。为了介绍字符串切片，我们在本节中仅假设 ASCII；有关 UTF-8 处理的更详细讨论请参阅第 8 章的“使用字符串存储 UTF-8 编码文本”部分。

记住所有这些信息后，让我们重写 first_word 以返回一个切片。表示“字符串切片”的类型写为 &str：

文件名：src/main.rs:

```rust
fn first_word(s: &String) -> &str {
    let bytes = s.as_bytes();

    for (i, &item) in bytes.iter().enumerate() {
        if item == b' ' {
            return &s[0..i];
        }
    }

    &s[..]
}
```

我们通过查找空格的第一次出现，以与示例 4-7 中相同的方式获取单词结尾的索引。当我们找到空格时，我们使用字符串的开头和空格的索引作为起始和结束索引，返回一个字符串切片。

现在，当我们调用 first_word 时，我们会返回一个与底层数据绑定的值。该值由对切片起点的引用和切片中的元素数组成。

返回切片也适用于 second_word 函数：

```rust
fn second_word(s: &String) -> &str { 
    // ...
}
```

现在我们有了一个简单的 API，它更难出错，因为编译器将确保对字符串的引用保持有效。还记得示例 4-8 中程序中的错误吗？当我们将索引移到第一个单词的末尾时，但随后清除了字符串，因此我们的索引无效？该代码在逻辑上是不正确的，但并没有立即显示任何错误。如果我们继续尝试将第一个单词索引与空字符串一起使用，问题将在稍后显示出来。切片使这个错误不可能发生，并让我们更快地知道我们的代码有问题。使用 first_word 的切片版本将引发编译时错误：

文件名：src/main.rs:

```rust
fn main() {
    let mut s = String::from("hello world");

    let word = first_word(&s);

    s.clear(); // 错误

    println!("the first word is: {word}");
}
```

编译器报错如下：

```rust
$ cargo run
   Compiling ownership v0.1.0 (file:///projects/ownership)
error[E0502]: cannot borrow `s` as mutable because it is also borrowed as immutable
  --> src/main.rs:18:5
   |
16 |     let word = first_word(&s);
   |                           -- immutable borrow occurs here
17 |
18 |     s.clear(); // error!
   |     ^^^^^^^^^ mutable borrow occurs here
19 |
20 |     println!("the first word is: {word}");
   |                                  ------ immutable borrow later used here

For more information about this error, try `rustc --explain E0502`.
error: could not compile `ownership` (bin "ownership") due to 1 previous error
```

回想一下借用规则，如果我们对某个对象有一个不可变引用，我们就不能同时获取一个可变引用。因为 clear 需要截断字符串，所以它需要获取一个可变引用。调用 clear 之后的 println! 使用 word 中的引用，因此不可变引用此时必须仍然处于活动状态。Rust 不允许 clear 中的可变引用和 word 中的不可变引用同时存在，编译会失败。Rust 不仅使我们的 API 更易于使用，而且还消除了编译时出现的一整类错误！

#### 字符串文字作为切片

回想一下，我们讨论过字符串文字存储在二进制文件中。现在我们了解了切片，我们可以正确理解字符串文字：

```rust
let s = "Hello, world!";
```

此处 s 的类型为 `&str`:它是指向二进制文件特定点的切片。这也是字符串文字不可变的原因；`&str` 是不可变引用。

#### 字符串切片作为参数

知道可以对文字和字符串值进行切片后，我们可以对 first_word 进行进一步改进，这就是它的签名：

```rust
fn first_word(s: &String) -> &str {
    // ...
}
```
更有经验的 Rust爱好者 会改写示例 4-9 中所示的签名，因为它允许我们对 `&String` 值和 `&str` 值使用相同的函数。

```rust
fn first_word(s: &str) -> &str {
    // ...
}
```

示例 4-9：通过使用字符串切片作为 s 参数的类型来改进 first_word 函数

如果我们有一个字符串切片，我们可以直接传递它。如果我们有一个字符串，我们可以传递字符串的切片或对字符串的引用。这种灵活性利用了强制解引用，我们将在第 15 章的“使用函数和方法进行隐式强制解引用”部分介绍这一功能。

定义一个函数来获取字符串切片而不是对字符串的引用，使我们的 API 更加通用和有用，而不会丢失任何功能：

文件名：src/main.rs:

```rust
fn main() {
    let my_string = String::from("hello world");

    // `first_word` 适用于 `String` 的切片，无论是部分切片还是全部切片
    let word = first_word(&my_string[0..6]);
    let word = first_word(&my_string[..]);
    // `first_word` 还适用于对 `String` 的引用，它们相当于
    // 整个 `String` 切片
    let word = first_word(&my_string);

    let my_string_literal = "hello world";

    // `first_word` 适用于字符串文字的切片，无论是部分切片还是全部切片
    let word = first_word(&my_string_literal[0..6]);
    let word = first_word(&my_string_literal[..]);

    // 因为字符串文字已经是字符串切片了，
    // 这也行得通，无需切片语法！
    let word = first_word(my_string_literal);
}
```

### 其它切片

你可能想象得到，字符串切片特定于字符串。但是还有一种更通用的切片类型。考虑这个数组：

```rust
let a = [1, 2, 3, 4, 5];
```

正如我们可能想要引用字符串的一部分一样，我们可能想要引用数组的一部分。我们可以这样做：

```rust
let a = [1, 2, 3, 4, 5];

let slice = &a[1..3];

assert_eq!(slice, &[2, 3]);
```

此切片的类型为 `&[i32]`。它的工作方式与字符串切片相同，即存储对第一个元素的引用和长度。你将使用这种切片来处理各种其他集合。我们将在第 8 章讨论向量时详细讨论这些集合。

所有权、借用和切片的概念确保了 Rust 程序在编译时的内存安全。Rust 语言让你可以像其他系统编程语言一样控制内存使用情况，但当数据所有者超出范围时，数据所有者会自动清理数据，这意味着你不必编写和调试额外的代码来获得这种控制。

所有权会影响 Rust 许多其他部分的工作方式，因此我们将在本文档的其余部分进一步讨论这些概念。让我们继续第 5 章，看看如何在结构体中将数据片段分组在一起。