## 引用和借用

示例 4-5 中的元组代码的问题在于，我们必须将字符串返回给调用函数，这样在调用 calculate_length 之后我们仍然可以使用字符串，因为字符串已移入 calculate_length。相反，我们可以提供对字符串值的引用。引用就像指针，因为它是一个地址，我们可以跟踪它来访问存储在该地址的数据；该数据​​由其他变量拥有。与指针不同，引用保证在该引用的生命周期内指向特定类型的有效值。

下面说明了如何定义和使用 calculate_length 函数，该函数以对对象的引用作为参数，而不是获取该值的所有权：

文件名：src/main.rs:

```rust
fn main() {
    let s1 = String::from("hello");

    let len = calculate_length(&s1);

    println!("The length of '{s1}' is {len}.");
}

fn calculate_length(s: &String) -> usize {
    s.len()
}
```

首先，请注意变量声明和函数返回值中的所有元组代码都消失了。其次，请注意，我们将 &s1 传递给 calculate_length，并且在其定义中，我们采用 `&String` 而不是 String。这些 `&` 符号表示引用，它们允许您引用某个值而不拥有它的所有权。图 4-5 描述了这个概念。

![三个表：s 的表仅包含指向 s1 的表的指针。s1 的表包含 s1 的堆栈数据并指向堆上的字符串数据。](../images/trpl04-05.svg)

图 4-5: &String s 指向 String s1 的图

> 注意：与使用 `&` 进行引用相反的是解引用，它通过解引用运算符 `*` 来实现。我们将在第 8 章中看到解引用运算符的一些用法，并在第 15 章中讨论解引用的细节。

让我们仔细看看这里的函数调用：

```rust
let s1 = String::from("hello");

let len = calculate_length(&s1);
```

`&s1` 语法允许我们创建一个引用，它指向 s1 的值，但不拥有它。由于它不拥有它，因此当引用停止使用时，它指向的值不会被删除。

同样，函数签名使用 `&` 来表明参数 s 的类型是引用。我们来添加一些解释性注释：

```rust
fn calculate_length(s: &String) -> usize { // s 是对 String 的引用
    s.len()
} // 此处，s 超出范围。但由于它不拥有所引用内容的所有权，因此不会被删除。
```

变量 s 的有效上下文与任何函数参数的上下文相同，但当 s 停止使用时，引用指向的值不会被删除，因为 s 没有所有权。当函数将引用而不是实际值作为参数时，我们不需要返回值来归还所有权，因为我们从未拥有所有权。

我们将创建引用的行为称为借用。就像在现实生活中一样，如果某人拥有某物，你可以从他那里借用。用完后，你必须归还。你并不拥有它。

那么，如果我们尝试修改我们借用的东西会发生什么？试试示例 4-6 中的代码。剧透警告：它不起作用！

文件名：src/main.rs:

```rust
fn main() {
    let s = String::from("hello");

    change(&s);
}

fn change(some_string: &String) {
    // 修改借用值
    some_string.push_str(", world");
}
```

示例 4-6：尝试修改借用的值

错误如下：

```rust
$ cargo run
   Compiling ownership v0.1.0 (file:///projects/ownership)
error[E0596]: cannot borrow `*some_string` as mutable, as it is behind a `&` reference
 --> src/main.rs:8:5
  |
8 |     some_string.push_str(", world");
  |     ^^^^^^^^^^^ `some_string` is a `&` reference, so the data it refers to cannot be borrowed as mutable
  |
help: consider changing this to be a mutable reference
  |
7 | fn change(some_string: &mut String) {
  |                         +++

For more information about this error, try `rustc --explain E0596`.
error: could not compile `ownership` (bin "ownership") due to 1 previous error
```

正如变量默认是不可变的，引用也是如此。我们不允许修改我们引用的值。

### 可变的引用