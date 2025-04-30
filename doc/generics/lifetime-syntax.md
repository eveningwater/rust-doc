## 使用生命周期验证引用

生命周期是我们已经在使用的另一种泛型。与确保类型具有我们想要的行为不同，生命周期确保引用在我们需要它们的整个时间内都是有效的。

在第 4 章的“引用与借用”部分中，我们没有讨论的一个细节是，在 Rust 中，每个引用都有一个生命周期，生命周期决定了该引用在什么范围内有效。大多数情况下，生命周期是隐式和推断的，就像大多数类型是推断的。当多个类型可能时，我们必须注解类型。类似地，当引用的生命周期可能以几种不同的方式相关时，我们必须注解生命周期。Rust 要求我们使用泛型生命周期参数注解这些关系，以确保在运行时使用的实际引用在整个生命周期内肯定是有效的。

注解生命周期是大多数其他编程语言没有的概念，因此这对你来说可能会感到陌生。虽然我们在本章中不会全面覆盖生命周期的内容，但我们会讨论你可能会遇到的生命周期语法，以便你能熟悉这一概念。

### 使用生命周期防止悬空引用

生命周期的主要目的是防止悬空引用，这种引用会导致程序引用不应该引用的数据。考虑 示例 10-16 中的程序，它有一个外部作用域和一个内部作用域。

```rust
fn main() {
    let r;

    {
        let x = 5;
        r = &x;
    }

    println!("r: {r}");
}
```

示例 10-16：尝试使用一个值已经超出作用域的引用

> 注意：在 示例 10-16、10-17 和 10-23 中，声明变量时没有给它们初始值，因此变量名存在于外部作用域。乍一看，这似乎与 Rust 没有空值的规定相冲突。然而，如果我们在给变量赋值之前尝试使用它，我们会遇到编译时错误，这表明 Rust 确实不允许空值。

外部作用域声明了一个名为`r`的变量，但没有初始值，而内部作用域声明了一个名为`x`的变量，其初始值为 5。在内部作用域中，我们尝试将`r`的值设置为`x`的引用。然后，内部作用域结束，我们尝试打印`r`中的值。由于`r`引用的值在我们尝试使用它之前已经超出作用域，因此这段代码无法编译。以下是错误信息：

```rust
$ cargo run
Compiling chapter10 v0.1.0 (file:///projects/chapter10)
error[E0597]: `x` does not live long enough
--> src/main.rs:6:13
|
5 | let x = 5;
| - binding `x` declared here
6 | r = &x;
| ^^ borrowed value does not live long enough
7 | }
| - `x` dropped here while still borrowed
8 |
9 | println!("r: {r}");
| --- borrow later used here

For more information about this error, try `rustc --explain E0597`.
error: could not compile `chapter10` (bin "chapter10") due to 1 previous error
```

错误信息表示变量`x`“生命周期不够长”。原因是当内部作用域在第 7 行结束时，`x`会超出作用域。但是`r`仍然有效，并且它的作用域更大，因此我们说它“活得更久”。如果 Rust 允许这段代码工作，`r`将会引用已经释放的内存，而我们尝试对`r`进行的任何操作都将无法正常工作。那么 Rust 是如何判断这段代码无效的呢？它使用了借用检查器。

### 借用检查器

Rust 编译器有一个借用检查器，它通过比较作用域来判断所有借用是否有效。示例 10-17 展示了与 示例 10-16 相同的代码，但添加了显示变量生命周期的注释。

```rust
fn main() {
    let r;                // ---------+-- 'a
                          //          |
    {                     //          |
        let x = 5;        // -+-- 'b  |
        r = &x;           //  |       |
    }                     // -+       |
                          //          |
    println!("r: {r}");   //          |
}                         // ---------+
```

示例 10-17：显示`r`和`x`生命周期的注释，分别命名为`'a`和`'b`

在这里，我们已经为`r`的生命周期注释了`'a`，为`x`的生命周期注释了`'b`。正如你所看到的，内层的`'b`块比外层的`'a`块小得多。在编译时，Rust 比较这两个生命周期的大小，并看到`r`的生命周期是`'a`，但它引用的内存的生命周期是`'b`。程序会被拒绝，因为`'b`的生命周期比`'a`短：引用的对象活得没有引用本身长。

示例 10-18 修正了代码，使其不再有悬空引用，且能够成功编译。

```rust
fn main() {
    let x = 5;            // ----------+-- 'b
                          //           |
    let r = &x;           // --+-- 'a  |
                          //   |       |
    println!("r: {r}");   //   |       |
                          // --+       |
}                         // ----------+
```

示例 10-18：一个有效的引用，因为数据的生命周期长于引用的生命周期

在这里，`x`的生命周期是`'b`，而`'a`在这种情况下更长。这意味着`r`可以引用`x`，因为 Rust 知道，`r`中的引用在`x`有效时始终是有效的。

现在你已经知道了引用的生命周期是什么以及 Rust 是如何分析生命周期以确保引用始终有效的，让我们来看看在函数中使用泛型生命周期参数和返回值的情况。

### 函数中的泛型生命周期

我们将编写一个函数，返回两个字符串切片中较长的一个。这个函数将接受两个字符串切片，并返回一个字符串切片。实现完`longest`函数后，示例 10-19 中的代码应该打印出“The longest string is abcd”。

文件名：src/main.rs：

```rust
fn main() {
    let string1 = String::from("abcd");
    let string2 = "xyz";

    let result = longest(string1.as_str(), string2);
    println!("The longest string is {result}");
}
```

示例 10-19：一个主函数，调用`longest`函数找到两个字符串切片中较长的一个

注意，我们希望函数接受的是字符串切片，而不是字符串，因为我们不希望`longest`函数获取其参数的所有权。有关为什么在 示例 10-19 中使用这些参数的更多讨论，请参见第 4 章的“字符串切片作为参数”部分。

如果我们尝试像 示例 10-20 中那样实现`longest`函数，它将无法编译。

文件名：src/main.rs：

```rust
fn main() {
    let string1 = String::from("abcd");
    let string2 = "xyz";

    let result = longest(string1.as_str(), string2);
    println!("The longest string is {result}");
}

fn longest(x: &str, y: &str) -> &str {
    if x.len() > y.len() {
        x
    } else {
        y
    }
}
```

示例 10-20：实现了`longest`函数，但没有编译通过，返回较长的两个字符串切片中的一个

相反，我们会得到以下的错误，错误信息涉及生命周期：

```rust
$ cargo run
Compiling chapter10 v0.1.0 (file:///projects/chapter10)
error[E0106]: missing lifetime specifier
--> src/main.rs:9:33
|
9 | fn longest(x: &str, y: &str) -> &str {
| ---- ---- ^ expected named lifetime parameter
|
= help: this function's return type contains a borrowed value, but the signature does not say whether it is borrowed from `x` or `y`
help: consider introducing a named lifetime parameter
|
9 | fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
| ++++ ++ ++ ++

For more information about this error, try `rustc --explain E0106`.
error: could not compile `chapter10` (bin "chapter10") due to 1 previous error
```

帮助信息表明，返回类型需要一个泛型生命周期参数，因为 Rust 无法判断返回的引用是引用自`x`还是`y`。事实上，我们也不知道，因为函数体中的`if`分支返回的是`x`的引用，而`else`分支返回的是`y`的引用！

在定义这个函数时，我们不知道将会传入哪些具体值，因此我们无法知道`if`分支还是`else`分支会执行。我们也不知道传入引用的具体生命周期，因此我们无法像在 示例 10-17 和 10-18 中那样查看作用域，来确定返回的引用是否始终有效。借用检查器也无法确定这一点，因为它不知道`x`和`y`的生命周期与返回值的生命周期如何相关。为了解决这个错误，我们需要添加泛型生命周期参数来定义引用之间的关系，以便借用检查器能够执行其分析。

### 生命周期注解语法

生命周期注解不会改变任何引用的生存时间。相反，它们描述了多个引用之间生命周期的关系，而不会影响生命周期。就像函数可以接受任何类型（当签名指定了泛型类型参数时），函数也可以通过指定泛型生命周期参数来接受具有任何生命周期的引用。

生命周期注解有一种稍微不同的语法：生命周期参数的名称必须以撇号（'）开头，通常都是小写且非常简短，类似于泛型类型。大多数情况下，第一个生命周期注解使用名称 `'a`。我们将生命周期参数注解放在引用的 `&` 后面，使用空格将注解与引用的类型分开。

以下是一些示例：一个没有生命周期参数的 `i32` 引用，一个带有名为 `'a` 的生命周期参数的 `i32` 引用，以及一个具有相同生命周期 `'a` 的可变引用。

```rust
&i32        // 一个引用
&'a i32     // 一个具有明确生命周期的引用
&'a mut i32 // 一个具有明确生命周期的可变引用
```

单独的生命周期注解本身没有多大意义，因为这些注解的目的是告诉 Rust 如何将多个引用的生命周期参数之间的关系表示出来。让我们在 `longest` 函数的上下文中，查看生命周期注解是如何相互关联的。

### 函数签名中的生命周期注解

为了在函数签名中使用生命周期注解，我们需要在函数名和参数列表之间使用尖括号声明泛型生命周期参数，正如我们在使用泛型类型参数时所做的那样。

我们希望函数签名表达以下约束：返回的引用将与两个参数的有效时间一样长。也就是说，参数和返回值之间生命周期的关系。我们将生命周期命名为 `'a`，并将其添加到每个引用中，如下所示（在 Listing 10-21 中展示）。

文件名：`src/main.rs`:

```rust
fn main() {
    let string1 = String::from("abcd");
    let string2 = "xyz";

    let result = longest(string1.as_str(), string2);
    println!("The longest string is {result}");
}

fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() {
        x
    } else {
        y
    }
}
```

Listing 10-21：`longest` 函数定义，指定签名中的所有引用必须具有相同的生命周期 `'a`

当我们使用 Listing 10-19 中的 `main` 函数时，这段代码应该会编译并产生我们想要的结果。

函数签名现在告诉 Rust，对于某个生命周期 `'a`，该函数接受两个参数，它们都是字符串切片，且至少在生命周期 `'a` 内有效。函数签名还告诉 Rust，返回的字符串切片将至少在生命周期 `'a` 内有效。实际上，这意味着 `longest` 函数返回的引用生命周期将与传递给该函数的 `x` 和 `y` 的生命周期中较小的那个相同。Rust 使用这些关系来分析代码。

请记住，当我们在这个函数签名中指定生命周期参数时，我们并没有改变任何传入或返回值的生命周期。而是我们指定了借用检查器应当拒绝任何不符合这些约束的值。注意，`longest` 函数并不需要知道 `x` 和 `y` 会活多久，只需要知道某个作用域可以替代 `'a`，并满足此签名的要求。

在函数中注解生命周期时，注解放在函数签名中，而不是函数体内。生命周期注解成为函数的一部分，就像签名中的类型一样。将生命周期契约包含在函数签名中，使得 Rust 编译器进行分析时能够更简单。如果函数注解或调用方式有问题，编译器的错误信息会更精确地指向代码的相关部分和约束。如果 Rust 编译器对我们期望的生命周期关系进行了更多推断，编译器可能只能在离问题根源很远的地方指出问题。

当我们将具体的引用传递给 `longest` 时，代入 `'a` 的具体生命周期是 `x` 的生命周期与 `y` 的生命周期重叠的部分。换句话说，泛型生命周期 `'a` 将被代入为 `x` 和 `y` 的生命周期中较短的那个。由于我们将返回的引用注解为相同的生命周期参数 `'a`，因此返回的引用将在 `x` 和 `y` 的生命周期中较短的那个有效。

让我们看看生命周期注解如何通过传入具有不同具体生命周期的引用来限制 `longest` 函数。Listing 10-22 是一个直接的示例。

文件名：`src/main.rs`:

```rust
fn main() {
    let string1 = String::from("long string is long");

    {
        let string2 = String::from("xyz");
        let result = longest(string1.as_str(), string2.as_str());
        println!("The longest string is {result}");
    }
}

fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() {
        x
    } else {
        y
    }
}
```

Listing 10-22：使用具有不同具体生命周期的 `String` 值的引用调用 `longest` 函数

在此示例中，`string1` 的生命周期持续到外部作用域结束，`string2` 的生命周期持续到内部作用域结束，而 `result` 引用的是有效直到内部作用域结束的值。运行这段代码，你会看到借用检查器通过了；它将编译并打印出 `The longest string is long string is long`。

接下来，让我们尝试一个示例，显示 `result` 中的引用的生命周期必须是两个参数的较小生命周期。我们将 `result` 变量的声明移到外部作用域，但将赋值语句留在包含 `string2` 的内部作用域内。然后，我们将使用 `result` 的 `println!` 语句移到内部作用域结束之后的外部作用域。Listing 10-23 中的代码将无法编译。

文件名：`src/main.rs`:

```rust
fn main() {
    let string1 = String::from("long string is long");
    let result;
    {
        let string2 = String::from("xyz");
        result = longest(string1.as_str(), string2.as_str());
    }
    println!("The longest string is {result}");
}

fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() {
        x
    } else {
        y
    }
}
```

Listing 10-23：在 `string2` 已超出作用域后尝试使用 `result`

当我们尝试编译这段代码时，会出现如下错误：

```bash
$ cargo run
Compiling chapter10 v0.1.0 (file:///projects/chapter10)
error[E0597]: `string2` does not live long enough
--> src/main.rs:6:44
|
5 | let string2 = String::from("xyz");
| ------- binding `string2` declared here
6 | result = longest(string1.as_str(), string2.as_str());
| ^^^^^^^ borrowed value does not live long enough
7 | }
| - `string2` dropped here while still borrowed
8 | println!("The longest string is {result}");
| -------- borrow later used here

For more information about this error, try `rustc --explain E0597`.
error: could not compile `chapter10` (bin "chapter10") due to 1 previous error
```

错误信息显示，要使 `result` 在 `println!` 语句中有效，`string2` 需要在外部作用域结束之前有效。Rust 之所以知道这一点，是因为我们在函数参数和返回值中注解了相同的生命周期参数 `'a`。

作为人类，我们可以通过代码推测出，`string1` 比 `string2` 的生命周期更长，因此 `result` 将包含对 `string1` 的引用。因为 `string1` 在作用域内仍然有效，所以对 `string1` 的引用在 `println!` 语句中仍然有效。然而，编译器无法看到这一点。我们告诉 Rust 返回的引用生命周期与传递给 `longest` 函数的引用的生命周期中较小的那个相同。因此，借用检查器不允许 Listing 10-23 中的代码，因为它可能存在无效引用。

尝试设计更多的实验，改变传递给 `longest` 函数的引用的值和生命周期，以及如何使用返回的引用。在编译之前，先推测一下实验是否会通过借用检查器；然后检查是否正确！

### 从生命周期的角度思考

您需要如何指定生命周期参数取决于您的函数在做什么。例如，如果我们将 `longest` 函数的实现更改为始终返回第一个参数，而不是最长的字符串切片，我们就不需要为参数 `y` 指定生命周期。以下代码将会编译：

文件名：`src/main.rs`:

```rust
fn main() {
    let string1 = String::from("abcd");
    let string2 = "efghijklmnopqrstuvwxyz";

    let result = longest(string1.as_str(), string2);
    println!("The longest string is {result}");
}

fn longest<'a>(x: &'a str, y: &str) -> &'a str {
    x
}
```

我们为参数 `x` 和返回类型指定了生命周期参数 `'a`，但没有为参数 `y` 指定，因为 `y` 的生命周期与 `x` 或返回值没有任何关系。

在从函数返回引用时，返回类型的生命周期参数需要与其中一个参数的生命周期参数匹配。如果返回的引用不引用其中一个参数，则必须引用在该函数中创建的值。然而，这将是一个悬空引用，因为该值将在函数结束时超出作用域。考虑下面这个不会编译的 `longest` 函数的尝试实现：

文件名：`src/main.rs`:

```rust
fn main() {
    let string1 = String::from("abcd");
    let string2 = "xyz";

    let result = longest(string1.as_str(), string2);
    println!("The longest string is {result}");
}

fn longest<'a>(x: &str, y: &str) -> &'a str {
    let result = String::from("really long string");
    result.as_str()
}
```

在这里，尽管我们为返回类型指定了生命周期参数 `'a`，但这个实现会失败，因为返回值的生命周期与参数的生命周期完全没有关系。以下是我们得到的错误信息：

```bash
$ cargo run
Compiling chapter10 v0.1.0 (file:///projects/chapter10)
error[E0515]: cannot return value referencing local variable `result`
--> src/main.rs:11:5
|
11 | result.as_str()
| ------^^^^^^^^^
| |
| returns a value referencing data owned by the current function
| `result` is borrowed here

For more information about this error, try `rustc --explain E0515`.
error: could not compile `chapter10` (bin "chapter10") due to 1 previous error
```

问题在于 `result` 在 `longest` 函数的结束时超出作用域并被清理。我们还试图返回对 `result` 的引用。没有办法可以指定生命周期参数来改变悬空引用，Rust 不允许我们创建悬空引用。在这种情况下，最好的解决方案是返回一个拥有数据类型，而不是引用，这样调用函数就负责清理这个值。

最终，生命周期语法是为了将各种参数和返回值的生命周期连接起来。一旦它们连接起来，Rust 就拥有足够的信息来允许内存安全操作并禁止可能导致悬空指针或其他违反内存安全的操作。

### 结构体中的生命周期注解

到目前为止，我们定义的结构体都持有拥有类型。我们可以定义持有引用的结构体，但在这种情况下，我们需要在结构体定义中的每个引用上添加生命周期注解。Listing 10-24 包含一个名为 `ImportantExcerpt` 的结构体，它持有一个字符串切片。

文件名：`src/main.rs`:

```rust
struct ImportantExcerpt<'a> {
    part: &'a str,
}

fn main() {
    let novel = String::from("Call me Ishmael. Some years ago...");
    let first_sentence = novel.split('.').next().unwrap();
    let i = ImportantExcerpt {
        part: first_sentence,
    };
}
```

Listing 10-24：一个持有引用的结构体，需要一个生命周期注解

这个结构体有一个字段 `part`，它持有一个字符串切片，即一个引用。与泛型数据类型一样，我们在结构体名称后面的尖括号中声明泛型生命周期参数的名称，以便我们可以在结构体定义的主体中使用生命周期参数。这个注解意味着 `ImportantExcerpt` 的实例不能超出它在 `part` 字段中持有的引用的有效性。

这里的主函数创建了一个 `ImportantExcerpt` 结构体的实例，该实例持有对变量 `novel` 所拥有的字符串的第一句的引用。`novel` 中的数据在创建 `ImportantExcerpt` 实例之前就已经存在。此外，`novel` 直到 `ImportantExcerpt` 超出作用域之后才会超出作用域，因此 `ImportantExcerpt` 实例中的引用是有效的。

### 生命周期省略

您已经了解到每个引用都有一个生命周期，并且您需要为使用引用的函数或结构体指定生命周期参数。然而，我们在 Listing 4-9 中定义的一个函数，即在 Listing 10-25 中再现的函数，在没有生命周期注解的情况下也能编译。

文件名：`src/lib.rs`:

```rust
fn first_word(s: &str) -> &str {
    let bytes = s.as_bytes();

    for (i, &item) in bytes.iter().enumerate() {
        if item == b' ' {
            return &s[0..i];
        }
    }

    &s[..]
}

fn main() {
    let my_string = String::from("hello world");

    // first_word works on slices of `String`s
    let word = first_word(&my_string[..]);

    let my_string_literal = "hello world";

    // first_word works on slices of string literals
    let word = first_word(&my_string_literal[..]);

    // Because string literals *are* string slices already,
    // this works too, without the slice syntax!
    let word = first_word(my_string_literal);
}
```

Listing 10-25：一个在没有生命周期注解的情况下编译的函数，尽管参数和返回类型是引用

这个函数能编译而没有生命周期注解的原因是历史因素：在 Rust 的早期版本（1.0 前），这段代码不会编译，因为每个引用都需要一个显式的生命周期。当时，函数签名的写法会是这样的：

```rust
fn first_word<'a>(s: &'a str) -> &'a str {
    // ...
}
```

在编写大量 Rust 代码后，Rust 团队发现，Rust 程序员在特定情况下反复输入相同的生命周期注解。这些情况是可预测的，并且遵循一些确定性模式。开发人员将这些模式编程到编译器代码中，以便借用检查器能够推断这些情况的生命周期，因此不需要显式的注解。

这段 Rust 历史是相关的，因为可能会出现更多确定性模式并被添加到编译器中。在未来，可能会需要更少的生命周期注解。

Rust 编译器分析引用时编程的模式称为生命周期省略规则。这些规则不是程序员遵循的规则；而是一组编译器将考虑的特定情况，如果您的代码符合这些情况，则不需要显式地编写生命周期。

对于函数或方法参数上的生命周期称为输入生命周期，返回值上的生命周期称为输出生命周期。

编译器使用三条规则来确定在没有显式注解时引用的生命周期。这第一条规则适用于输入生命周期，第二和第三条规则适用于输出生命周期。如果编译器在通过这三条规则后仍然无法确定生命周期，则会停止并出错。这些规则适用于函数定义以及 `impl` 块。

第一条规则是编译器为每个引用参数分配一个生命周期参数。换句话说，具有一个参数的函数会有一个生命周期参数：`fn foo<'a>(x: &'a i32)`；具有两个参数的函数会有两个生命周期参数：`fn foo<'a, 'b>(x: &'a i32, y: &'b i32)`；以此类推。

第二条规则是，如果正好有一个输入生命周期参数，则该生命周期被分配给所有输出生命周期参数：`fn foo<'a>(x: &'a i32) -> &'a i32`。

第三条规则是，如果有多个输入生命周期参数，但是其中一个是 `&self` 或 `&mut self`，因为这是一个方法，那么输出生命周期参数将被分配给 `&self` 的生命周期。这条规则使得方法的阅读和书写更加简洁，因为需要的符号更少。

让我们假装我们是编译器。我们将应用这些规则来确定 Listing 10-25 中 `first_word` 函数签名的引用生命周期。签名开始时没有与引用关联的任何生命周期：

```rust
fn first_word(s: &str) -> &str {
    // ...
}
```

然后编译器应用第一条规则，为每个参数分配一个生命周期。我们将其称为 `'a`，因此现在签名为：

```rust
fn first_word<'a>(s: &'a str) -> &str {
    // ...
}
```

第二条规则适用，因为只有一个输入生命周期。因此，第二条规则说明该唯一的输入参数的生命周期会分配给输出生命周期，因此签名现在为：

```rust
fn first_word<'a>(s: &'a str) -> &'a str {
    // ...
}
```

现在这个函数签名中的所有引用都有了生命周期，编译器可以继续其分析而无需程序员在这个函数签名中注解生命周期。

让我们看一个另一示例，这次使用 `longest` 函数，在我们开始讨论它时没有生命周期参数（在 Listing 10-20 中）：

```rust
fn longest(x: &str, y: &str) -> &str {
    // ...
}
```

让我们应用第一条规则：每个参数都有自己的生命周期。这次我们有两个参数而不是一个，所以我们有两个生命周期：

```rust
fn longest<'a, 'b>(x: &'a str, y: &'b str) -> &str {
    //...
}
```

您可以看到，第二条规则不适用，因为输入生命周期超过一个。第三条规则也不适用，因为 `longest` 是一个函数而不是方法，因此没有参数是 `self`。在应用完所有三条规则后，我们仍然没有确定返回类型的生命周期。这就是我们在编译 Listing 10-20 代码时遇到错误的原因：编译器经过生命周期省略规则之后，仍然无法确定签名中所有引用的生命周期。

因为第三条规则实际上只适用于方法签名，所以我们接下来将在这种上下文中查看生命周期，以了解为什么在方法签名中我们通常不需要注解生命周期。

### 方法定义中的生命周期注解

当我们在具有生命周期的结构体上实现方法时，我们使用与泛型类型参数相同的语法，如 Listing 10-11 所示。我们声明和使用生命周期参数的位置取决于它们是与结构体字段相关，还是与方法参数和返回值相关。

结构体字段的生命周期名称始终需要在 `impl` 关键字后声明，然后在结构体名称后使用，因为这些生命周期是结构体类型的一部分。

在 `impl` 块中的方法签名中，引用可能与结构体字段中的引用的生命周期相关，或它们可能是独立的。此外，生命周期省略规则通常使得在方法签名中不需要注解生命周期。让我们看看一些使用我们在 Listing 10-24 中定义的 `ImportantExcerpt` 结构体的示例。

首先，我们使用一种名为 `level` 的方法，其唯一参数是对 `self` 的引用，返回值是一个 `i32`，它不引用任何内容：

```rust
struct ImportantExcerpt<'a> {
    part: &'a str,
}

impl<'a> ImportantExcerpt<'a> {
    fn level(&self) -> i32 {
        3
    }
}

impl<'a> ImportantExcerpt<'a> {
    fn announce_and_return_part(&self, announcement: &str) -> &str {
        println!("Attention please: {announcement}");
        self.part
    }
}

fn main() {
    let novel = String::from("Call me Ishmael. Some years ago...");
    let first_sentence = novel.split('.').next().unwrap();
    let i = ImportantExcerpt {
        part: first_sentence,
    };
}
```

在 `impl` 后声明生命周期参数并在类型名称后使用是必需的，但由于第一条省略规则，我们不需要注解对 `self` 的引用的生命周期。

以下是一个应用第三条生命周期省略规则的示例：

```rust
struct ImportantExcerpt<'a> {
    part: &'a str,
}

impl<'a> ImportantExcerpt<'a> {
    fn level(&self) -> i32 {
        3
    }
}

impl<'a> ImportantExcerpt<'a> {
    fn announce_and_return_part(&self, announcement: &str) -> &str {
        println!("Attention please: {announcement}");
        self.part
    }
}

fn main() {
    let novel = String::from("Call me Ishmael. Some years ago...");
    let first_sentence = novel.split('.').next().unwrap();
    let i = ImportantExcerpt {
        part: first_sentence,
    };
}
```

有两个输入生命周期，因此 Rust 应用第一条生命周期省略规则，并为 `&self` 和 `announcement` 分配各自的生命周期。然后，由于其中一个参数是 `&self`，返回类型便获得了 `&self` 的生命周期，所有的生命周期都已被考虑。

### 静态生命周期

一个需要讨论的特殊生命周期是 `'static`，它表示相关的引用可以在程序的整个持续期间内生存。所有字符串文字都有 `'static` 生命周期，我们可以如下标注：

```rust
#![allow(unused)]
fn main() {
    let s: &'static str = "I have a static lifetime.";
}
```

这个字符串的文本直接存储在程序的二进制文件中，始终可用。因此，所有字符串文字的生命周期都是 `'static`。

您可能在错误信息中看到建议使用 `'static` 生命周期。但在指定某个引用的生命周期为 `'static` 之前，请考虑您拥有的引用是否确实在程序的整个生命周期内有效，以及您是否希望如此。大多数情况下，建议使用 `'static` 生命周期的错误信息源于尝试创建悬空引用或生命周期不匹配。在这种情况下，解决方案是修复这些问题，而不是简单地指定 `'static` 生命周期。

### 泛型类型参数、特征界限与生命周期的结合

让我们简单查看在一个函数中同时指定泛型类型参数、特征界限和生命周期的语法！

```rust
fn main() {
    let string1 = String::from("abcd");
    let string2 = "xyz";

    let result = longest_with_an_announcement(
        string1.as_str(),
        string2,
        "Today is someone's birthday!",
    );
    println!("The longest string is {result}");
}

use std::fmt::Display;

fn longest_with_an_announcement<'a, T>(
    x: &'a str,
    y: &'a str,
    ann: T,
) -> &'a str
where
    T: Display,
{
    println!("Announcement! {ann}");
    if x.len() > y.len() {
        x
    } else {
        y
    }
}
```

这是从 Listing 10-21 中派生出的 `longest` 函数，现在返回两个字符串切片中较长的那个，但追加了一个名为 `ann` 的额外参数，其泛型类型 `T` 可以通过 `where` 子句指定为任何实现了 `Display` 特征的类型。这个额外参数将会使用 `{}` 打印，因此需要 `Display` 特征界限。因为生命周期也是一种泛型，所以生命周期参数 `'a` 和泛型类型参数 `T` 的声明放在函数名称之后的尖括号内的同一列表中。

### 总结

我们在本章中涵盖了很多内容！现在，您了解了泛型类型参数、特征与特征界限、以及泛型生命周期参数，您已准备好编写灵活的代码，适用于多种情况，而不必重复。泛型类型参数让您可以将代码应用于不同的类型。特征与特征界限确保即使类型是泛型的，它们仍然具有代码所需的行为。您还学会了使用生命周期注解来确保这些灵活的代码不会产生悬空引用。而这一切的分析都是在编译时完成的，不会影响运行时性能！

信不信由你，我们讨论的主题还有很多：第18章将讨论特征对象，这是另一种使用特征的方法。还有涉及生命周期注解的更复杂的场景，您只会在非常高级的场景中需要；要了解这些，您需要阅读 Rust 参考。但接下来，您将学习如何在 Rust 中编写测试，以确保您的代码按照预期工作。

