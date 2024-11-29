## 引用和借用

示例 4-5 中的元组代码的问题在于，我们必须将字符串返回给调用函数，这样在调用 calculate_length 之后我们仍然可以使用字符串，因为字符串已移入 calculate_length。相反，我们可以提供对字符串值的引用。引用就像指针，因为它是一个地址，我们可以跟踪它来访问存储在该地址的数据；该数据 ​​ 由其他变量拥有。与指针不同，引用保证在该引用的生命周期内指向特定类型的有效值。

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

首先，请注意变量声明和函数返回值中的所有元组代码都消失了。其次，请注意，我们将 &s1 传递给 calculate_length，并且在其定义中，我们采用 `&String` 而不是 String。这些 `&` 符号表示引用，它们允许你引用某个值而不拥有它的所有权。图 4-5 描述了这个概念。

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

我们可以修复示例 4-6 中的代码，以便我们只需进行一些小的调整就可以修改借用的值，即使用可变引用：

文件名：src/main.rs:

```rust
fn main() {
    let mut s = String::from("hello");

    change(&mut s);
}

fn change(some_string: &mut String) {
    some_string.push_str(", world");
}
```

首先，我们将 s 改为 mut。然后，我们用 `&mut s` 创建可变引用，并在其中调用 change 函数，并更新函数签名以接受带有 `some_string: &mut String` 的可变引用。这非常清楚地表明，change 函数将改变其借用的值。

可变引用有一个很大的限制：如果你有一个对值的可变引用，你就不能再有对该值的引用。以下代码尝试创建两个对 s 的可变引用，但会失败：

文件名：src/main.rs:

```rust
let mut s = String::from("hello");
let r1 = &mut s;
let r2 = &mut s;
println!("{}, {}", r1, r2);
```

错误如下：

```rust
$ cargo run
   Compiling ownership v0.1.0 (file:///projects/ownership)
error[E0499]: cannot borrow `s` as mutable more than once at a time
 --> src/main.rs:5:14
  |
4 |     let r1 = &mut s;
  |              ------ first mutable borrow occurs here
5 |     let r2 = &mut s;
  |              ^^^^^^ second mutable borrow occurs here
6 |
7 |     println!("{}, {}", r1, r2);
  |                        -- first borrow later used here

For more information about this error, try `rustc --explain E0499`.
error: could not compile `ownership` (bin "ownership") due to 1 previous error
```

此错误表示此代码无效，因为我们不能一次多次借用 s 作为可变引用。第一个可变借用在 r1 中，并且必须持续到在 println! 中使用为止，但在创建该可变引用和使用它之间，我们试图在 r2 中创建另一个可变引用，该引用借用了与 r1 相同的数据。

限制同时阻止对同一数据的多个可变引用允许以非常受控的方式进行变异。这是 rust 爱好者所难以接受的事情，因为大多数语言都允许你随时进行变异。有此限制的好处是 Rust 可以在编译时防止数据竞争。数据竞争类似于竞争条件，当发生以下三种行为时会发生：

- 两个或多个指针同时访问同一数据。
- 至少有一个指针用于写入数据。
- 没有使用机制来同步对数据的访问。

数据竞争会导致未定义的行为，当你尝试在运行时追踪它们时可能很难诊断和修复；Rust 通过拒绝编译具有数据竞争的代码来防止这个问题！

与往常一样，我们可以使用花括号来创建一个新的作用域，允许多个可变引用，但不能同时引用：

```rust
let mut s = String::from("hello");

{
  let r1 = &mut s;
} // r1 超出范围，因此我们可以毫无问题地创建新的引用。

let r2 = &mut s;
```

Rust 对可变和不可变引用的组合也执行了类似的规则。此代码会导致错误：

```rust
let mut s = String::from("hello");
let r1 = &s; // 没问题
let r2 = &s; // 没问题
let r3 = &mut s; // 大问题
println!("{}, {}, and {}", r1, r2, r3);
```

错误如下:

```rust
$ cargo run
   Compiling ownership v0.1.0 (file:///projects/ownership)
error[E0502]: cannot borrow `s` as mutable because it is also borrowed as immutable
 --> src/main.rs:6:14
  |
4 |     let r1 = &s; // no problem
  |              -- immutable borrow occurs here
5 |     let r2 = &s; // no problem
6 |     let r3 = &mut s; // BIG PROBLEM
  |              ^^^^^^ mutable borrow occurs here
7 |
8 |     println!("{}, {}, and {}", r1, r2, r3);
  |                                -- immutable borrow later used here

For more information about this error, try `rustc --explain E0502`.
error: could not compile `ownership` (bin "ownership") due to 1 previous error
```

我们也不能有同时拥有指向同一值的不可变引用的可变引用。

不可变引用的用户不希望值突然从他们手中改变！但是，允许多个不可变引用，因为任何只读取数据的人都无法影响其他人对数据的读取。

请注意，引用的范围从引入它的地方开始，一直持续到最后一次使用该引用。例如，此代码将编译，因为不可变引用的最后一次使用 println! 发生在引入可变引用之前：

```rust
let mut s = String::from("hello");
let r1 = &s; // 没问题
let r2 = &s; // 没问题
println!("{r1} and {r2}");
// 此后变量 r1 和 r2 将不再使用
let r3 = &mut s; // 没问题
println!("{r3}");
```

不可变引用 r1 和 r2 的作用域在它们最后一次使用 println! 之后结束，也就是在可变引用 r3 创建之前。这些作用域不重叠，因此允许出现以下代码：编译器可以在作用域结束之前的某个时间点判断出该引用不再被使用。

尽管借用错误有时会令人沮丧，但请记住，Rust 编译器会尽早指出潜在的错误（在编译时而不是在运行时），并向你准确显示问题所在。这样，你就不必追踪数据为何与你想象的不一样。

### 悬垂引用

在带有指针的语言中，很容易错误地创建悬空指针（指向可能已分配给其他人的内存位置的指针），方法是释放一些内存，同时保留指向该内存的指针。相比之下，在 Rust 中，编译器保证引用永远不会是悬空引用：如果你引用了某些数据，编译器将确保数据不会在对数据的引用超出范围之前超出范围。

让我们尝试创建一个悬垂引用，看看 Rust 如何通过编译时错误来防止它们：

文件名：src/main.rs:

```rust
fn main() {
    let reference_to_nothing = dangle();
}

fn dangle() -> &String {
    let s = String::from("hello");

    &s
}
```

错误如下:

```rust
$ cargo run
   Compiling ownership v0.1.0 (file:///projects/ownership)
error[E0106]: missing lifetime specifier
 --> src/main.rs:5:16
  |
5 | fn dangle() -> &String {
  |                ^ expected named lifetime parameter
  |
  = help: this function's return type contains a borrowed value, but there is no value for it to be borrowed from
help: consider using the `'static` lifetime, but this is uncommon unless you're returning a borrowed value from a `const` or a `static`
  |
5 | fn dangle() -> &'static String {
  |                 +++++++
help: instead, you are more likely to want to return an owned value
  |
5 - fn dangle() -> &String {
5 + fn dangle() -> String {
  |

error[E0515]: cannot return reference to local variable `s`
 --> src/main.rs:8:5
  |
8 |     &s
  |     ^^ returns a reference to data owned by the current function

Some errors have detailed explanations: E0106, E0515.
For more information about an error, try `rustc --explain E0106`.
error: could not compile `ownership` (bin "ownership") due to 2 previous errors
```

此错误消息涉及我们尚未涉及的功能：生命周期。我们将在第 10 章中详细讨论生命周期。但是，如果你忽略有关生命周期的部分，该消息确实包含了此代码存在问题的关键：

```rust
this function's return type contains a borrowed value, but there is no value
for it to be borrowed from
```

让我们仔细看看悬垂引用代码的每个阶段到底发生了什么：

文件名：src/main.rs:

```rust
fn dangle() -> &String { // dangle 返回对字符串的引用

  let s = String::from("hello"); // s 是一个新的字符串

  &s // 我们返回对字符串 s 的引用
} // 这里，s 超出范围，被丢弃。它的内存消失了。
// 危险！
```

因为 s 是在 dangle 内部创建的，所以当 dangle 的代码完成时，s 将被释放。但我们试图返回对它的引用。这意味着这个引用将指向一个无效的字符串。这可不行！Rust 不允许我们这样做。

这里的解决方案是直接返回字符串：

```rust
fn no_dangle() -> String {
  let s = String::from("hello");
  s
}
```

这样做没有任何问题。所有权被移出，并且没有任何东西被释放。

### 引用规则

让我们回顾一下我们讨论过的关于引用的内容：

- 在任何给定时间，你都可以拥有一个可变引用或任意数量的不可变引用。
- 引用必须始终有效。

接下来，我们将研究另一种引用：切片。
