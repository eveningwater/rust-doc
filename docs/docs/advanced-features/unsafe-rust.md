## 不安全 Rust

到目前为止，我们讨论的所有代码都在编译时强制执行了 Rust 的内存安全保证。然而，Rust 中还有一种隐藏的语言，它不执行这些内存安全保证：它叫做不安全 Rust，和普通的 Rust 一样工作，但给我们提供了额外的超能力。

不安全 Rust 的存在是因为静态分析本质上是保守的。当编译器尝试判断代码是否遵守安全保证时，它宁愿拒绝一些有效的程序，也不接受一些无效的程序。虽然代码可能没问题，但如果 Rust 编译器没有足够的信息来确认它是安全的，它会拒绝这段代码。在这些情况下，你可以使用不安全代码来告诉编译器：“相信我，我知道我在做什么。”然而，请注意，使用不安全 Rust 是有风险的：如果你错误地使用不安全代码，可能会因为内存不安全的问题而发生故障，例如空指针解引用。

Rust 拥有不安全替身的另一个原因是底层计算机硬件本身就是不安全的。如果 Rust 不允许你执行不安全操作，你将无法完成某些任务。Rust 需要允许你进行低级系统编程，例如直接与操作系统交互，甚至编写自己的操作系统。进行低级系统编程是语言的一个目标。让我们来探索使用不安全 Rust 可以做什么，以及如何做。

## 不安全超能力

要切换到不安全的 Rust，只需使用 `unsafe` 关键字，然后开始一个新的代码块，其中包含不安全的代码。在不安全 Rust 中，你可以进行五种在安全 Rust 中不能进行的操作，这些操作我们称之为不安全超能力。这些超能力包括：

- 解引用原始指针
- 调用不安全的函数或方法
- 访问或修改可变的静态变量
- 实现不安全的 trait
- 访问联合体的字段

重要的是要理解，不安全并不会关闭借用检查器或禁用 Rust 的其他安全检查：如果你在不安全代码中使用了引用，它仍然会被检查。`unsafe` 关键字仅仅是让你访问这五个特性，这些特性不再由编译器检查内存安全性。即便在不安全块中，你仍然会获得一定程度的安全保障。

此外，不安全并不意味着块中的代码一定是危险的，也不代表它一定会有内存安全问题：其目的是作为程序员，你确保不安全块中的代码以有效的方式访问内存。

人是容易犯错的，错误是不可避免的，但通过要求这五种不安全操作必须在标记为 `unsafe` 的代码块中，你将知道与内存安全相关的任何错误必须位于不安全代码块内。保持不安全代码块尽可能小；当你调查内存错误时，你会感激这样做。

为了尽可能地隔离不安全代码，最好将这类代码封装在一个安全的抽象中，并提供一个安全的 API，我们将在本章后面讨论不安全函数和方法时详细说明。标准库的某些部分是通过对已审核的不安全代码进行安全抽象来实现的。将不安全代码包装在安全抽象中，能防止不安全的使用泄漏到你或你的用户可能希望在其中使用不安全代码功能的所有地方，因为使用安全抽象是安全的。

接下来，让我们依次看看这五种不安全超能力。我们还将讨论一些提供不安全代码安全接口的抽象。

## 解引用原始指针

在第 4 章的[《悬垂引用》](../understand-ownership/references-and-borrow#悬垂引用)中，我们提到过编译器会确保引用始终有效。不安全 Rust 引入了两种新类型，称为原始指针，它们类似于引用。与引用类似，原始指针可以是不可变的或可变的，分别表示为 `*const T` 和 `*mut T`。星号（`*`）不是解引用操作符，它是类型名称的一部分。在原始指针的上下文中，不可变意味着指针在解引用后不能直接进行赋值。

与引用和智能指针不同，原始指针：

- 允许忽略借用规则，可以同时存在不可变和可变指针，或者多个可变指针指向同一位置
- 不保证指向有效的内存
- 允许为空
- 不实现自动清理

通过选择放弃 Rust 强制执行这些保证，你可以以更高的性能或与其他语言或硬件接口的能力为交换，而这些地方 Rust 的保证并不适用。

下面的代码示例（示例 20-1）展示了如何创建不可变和可变的原始指针。

```rust
fn main() {
    let mut num = 5;

    let r1 = &raw const num;
    let r2 = &raw mut num;
}
```

示例 20-1：使用原始借用操作符创建原始指针

注意，我们在这段代码中没有使用 `unsafe` 关键字。我们可以在安全代码中创建原始指针；只是不能在 `unsafe` 块之外解引用原始指针，稍后你会看到。

我们通过使用原始借用操作符来创建原始指针：`&raw const num` 创建一个 `*const i32` 的不可变原始指针，而 `&raw mut num` 创建一个 `*mut i32` 的可变原始指针。由于我们直接从局部变量创建它们，我们知道这些特定的原始指针是有效的，但我们不能假设所有原始指针都是有效的。

为了演示这一点，接下来我们将创建一个原始指针，其有效性我们无法确定，使用 `as` 来转换一个值，而不是使用原始借用操作符。示例 20-2 展示了如何创建一个指向内存中任意位置的原始指针。尝试使用任意内存是未定义行为：该地址可能有数据，也可能没有，编译器可能优化代码以至于没有内存访问，或者程序可能因段错误终止。通常情况下，没有充分的理由编写这样的代码，尤其是在可以使用原始借用操作符的情况下，但这是可能的。

```rust
fn main() {
    let address = 0x012345usize;
    let r = address as *const i32;
}
```

示例 20-2：创建指向任意内存地址的原始指针

回想一下，我们可以在安全代码中创建原始指针，但不能解引用原始指针并读取其指向的数据。在示例 20-3 中，我们使用解引用操作符 `*` 来解引用一个原始指针，这需要在 `unsafe` 块中进行。

```rust
fn main() {
    let mut num = 5;

    let r1 = &raw const num;
    let r2 = &raw mut num;

    unsafe {
        println!("r1 is: {}", *r1);
        println!("r2 is: {}", *r2);
    }
}
```

示例 20-3：在 `unsafe` 块中解引用原始指针

创建一个指针本身没有害处；只有在我们尝试访问它所指向的值时，才可能遇到无效的值。

还要注意，在示例 20-1 和 20-3 中，我们创建了 `*const i32` 和 `*mut i32` 原始指针，它们都指向相同的内存位置，即存储 `num` 的位置。如果我们尝试为 `num` 创建一个不可变引用和一个可变引用，代码将无法编译，因为 Rust 的所有权规则不允许在同一时间拥有可变引用和任何不可变引用。而对于原始指针，我们可以创建一个可变指针和一个不可变指针，它们指向相同的位置，并通过可变指针修改数据，这可能会导致数据竞争。小心使用！

面对这些危险，为什么还要使用原始指针呢？其中一个主要的使用场景是在与 C 代码交互时，正如你将在下一节 ["调用不安全的函数或方法"](#调用不安全的函数或方法) 中看到的那样。另一个场景是在构建借用检查器无法理解的安全抽象时。我们将介绍不安全函数，并展示一个使用不安全代码的安全抽象示例。

## 调用不安全的函数或方法

在 `unsafe` 块中，你可以执行的第二类操作是调用不安全的函数。不安全函数和方法与常规函数和方法看起来完全一样，但它们在定义的前面加上了 `unsafe` 关键字。在这种情况下，`unsafe` 关键字表示该函数有一些我们在调用该函数时需要遵守的要求，因为 Rust 无法保证我们已经满足这些要求。通过在 `unsafe` 块中调用不安全函数，我们是在表明我们已经阅读了该函数的文档，并对遵守该函数的合同负责。

下面是一个名为 `dangerous` 的不安全函数，它的函数体没有做任何事情：

```rust
fn main() {
    unsafe fn dangerous() {}

    unsafe {
        dangerous();
    }
}
```

我们必须在一个单独的 `unsafe` 块中调用 `dangerous` 函数。如果我们尝试在没有 `unsafe` 块的情况下调用 `dangerous`，将会得到一个错误：

```rust
$ cargo run
   Compiling unsafe-example v0.1.0 (file:///projects/unsafe-example)
error[E0133]: call to unsafe function `dangerous` is unsafe and requires unsafe block
 --> src/main.rs:4:5
  |
4 |     dangerous();
  |     ^^^^^^^^^^^ call to unsafe function
  |
  = note: consult the function's documentation for information on how to avoid undefined behavior

For more information about this error, try `rustc --explain E0133`.
error: could not compile `unsafe-example` (bin "unsafe-example") due to 1 previous error
```

通过 `unsafe` 块，我们向 Rust 保证我们已经阅读了该函数的文档，理解如何正确使用它，并且已经验证我们正在履行该函数的契约。

在不安全函数的函数体内执行不安全操作时，你仍然需要使用 `unsafe` 块，就像在常规函数中一样，如果你忘记了，编译器会提醒你。这有助于将 `unsafe` 块保持尽可能小，因为整个函数体可能并不需要执行不安全操作。

### 创建一个安全的抽象来封装不安全代码

仅仅因为一个函数包含了不安全代码，并不意味着我们需要将整个函数标记为 `unsafe`。实际上，将不安全代码封装在一个安全函数中是一个常见的抽象方式。作为例子，我们来研究标准库中的 `split_at_mut` 函数，它需要一些不安全代码。我们将探讨如何实现它。这个安全方法是定义在可变切片上的：它接受一个切片，并通过在给定的索引处将切片分割成两个部分。示例 20-4 展示了如何使用 `split_at_mut`。

```rust
fn main() {
    let mut v = vec![1, 2, 3, 4, 5, 6];

    let r = &mut v[..];

    let (a, b) = r.split_at_mut(3);

    assert_eq!(a, &mut [1, 2, 3]);
    assert_eq!(b, &mut [4, 5, 6]);
}
```

示例 20-4：使用安全的 `split_at_mut` 函数

我们不能仅使用安全 Rust 来实现这个函数。一个尝试可能看起来像示例 20-5，但它无法编译。为了简化，我们将 `split_at_mut` 实现为一个函数，而不是方法，并且只针对 `i32` 类型的切片，而不是泛型类型 `T`。

```rust
fn split_at_mut(values: &mut [i32], mid: usize) -> (&mut [i32], &mut [i32]) {
    let len = values.len();

    assert!(mid <= len);

    (&mut values[..mid], &mut values[mid..])
}

fn main() {
    let mut vector = vec![1, 2, 3, 4, 5, 6];
    let (left, right) = split_at_mut(&mut vector, 3);
}
```

示例 20-5：尝试仅使用安全 Rust 实现 `split_at_mut`

这个函数首先获取切片的总长度。然后，它通过检查给定的索引是否小于或等于长度，来断言该索引在切片范围内。这个断言意味着，如果我们传递一个大于切片长度的索引来分割切片，函数会在尝试使用该索引之前发生 panic。

然后，我们返回一个元组，里面包含两个可变切片：一个从原始切片的开始到中间索引，另一个从中间到切片的末尾。

当我们尝试编译示例 20-5 中的代码时，会出现错误。

```rust
$ cargo run
   Compiling unsafe-example v0.1.0 (file:///projects/unsafe-example)
error[E0499]: cannot borrow `*values` as mutable more than once at a time
 --> src/main.rs:6:31
  |
1 | fn split_at_mut(values: &mut [i32], mid: usize) -> (&mut [i32], &mut [i32]) {
  |                         - let's call the lifetime of this reference `'1`
...
6 |     (&mut values[..mid], &mut values[mid..])
  |     --------------------------^^^^^^--------
  |     |     |                   |
  |     |     |                   second mutable borrow occurs here
  |     |     first mutable borrow occurs here
  |     returning this value requires that `*values` is borrowed for `'1`
  |
  = help: use `.split_at_mut(position)` to obtain two mutable non-overlapping sub-slices

For more information about this error, try `rustc --explain E0499`.
error: could not compile `unsafe-example` (bin "unsafe-example") due to 1 previous error
```

Rust 的借用检查器无法理解我们正在借用切片的不同部分；它只知道我们正在从同一个切片借用两次。借用切片的不同部分从根本上来说是可以的，因为这两个切片没有重叠，但 Rust 并不聪明到能够理解这一点。当我们知道代码是安全的，但 Rust 无法识别时，就需要使用不安全代码。

示例 20-6 展示了如何使用 `unsafe` 块、原始指针和一些调用不安全函数来使 `split_at_mut` 的实现正常工作。

```rust
use std::slice;

fn split_at_mut(values: &mut [i32], mid: usize) -> (&mut [i32], &mut [i32]) {
    let len = values.len();
    let ptr = values.as_mut_ptr();

    assert!(mid <= len);

    unsafe {
        (
            slice::from_raw_parts_mut(ptr, mid),
            slice::from_raw_parts_mut(ptr.add(mid), len - mid),
        )
    }
}

fn main() {
    let mut vector = vec![1, 2, 3, 4, 5, 6];
    let (left, right) = split_at_mut(&mut vector, 3);
}
```

示例 20-6：在 `split_at_mut` 函数实现中使用不安全代码

回顾第 4 章中的[“切片类型”](../understand-ownership/slice-type#切片)，切片是指向某些数据和切片长度的指针。我们使用 `len` 方法获取切片的长度，使用 `as_mut_ptr` 方法访问切片的原始指针。在这个例子中，因为我们有一个可变的 `i32` 值的切片，`as_mut_ptr` 返回一个类型为 `*mut i32` 的原始指针，我们将其存储在变量 `ptr` 中。

我们保留了对 `mid` 索引在切片内的断言。接下来进入不安全代码部分：`slice::from_raw_parts_mut` 函数接受一个原始指针和一个长度，并创建一个切片。我们使用它来创建一个从 `ptr` 开始并且长度为 `mid` 个元素的切片。然后，我们调用 `ptr` 上的 `add` 方法，传入 `mid` 作为参数，以获取一个从 `mid` 开始的原始指针，并使用这个指针和从 `mid` 之后剩余的元素数量来创建一个新的切片。

`slice::from_raw_parts_mut` 函数是 `unsafe` 的，因为它接受一个原始指针，并且必须信任这个指针是有效的。原始指针上的 `add` 方法也是不安全的，因为它必须信任偏移位置也是一个有效的指针。因此，我们必须将调用 `slice::from_raw_parts_mut` 和 `add` 的代码块放入 `unsafe` 块中，以便调用它们。通过查看代码并添加断言，确保 `mid` 必须小于或等于 `len`，我们可以确定在 `unsafe` 块中使用的所有原始指针都是有效的，指向切片内的数据。这是对不安全代码的一个可接受且合适的使用。

请注意，我们不需要将最终的 `split_at_mut` 函数标记为 `unsafe`，并且可以从安全 Rust 中调用这个函数。我们通过安全的方式创建了对不安全代码的抽象，通过实现该函数，使用不安全代码时确保它只从该函数可以访问的数据创建有效的指针。

相比之下，示例 20-7 中对 `slice::from_raw_parts_mut` 的使用在切片被使用时可能会崩溃。这段代码接受一个任意的内存位置，并创建一个长度为 10,000 个元素的切片。

```rust
fn main() {
    use std::slice;

    let address = 0x01234usize;
    let r = address as *mut i32;

    let values: &[i32] = unsafe { slice::from_raw_parts_mut(r, 10000) };
}
```

示例 20-7：从任意内存位置创建切片

我们并不拥有这个任意位置的内存，并且无法保证这个代码创建的切片包含有效的 `i32` 值。尝试将这些值当作有效的切片来使用会导致未定义行为。

### 使用 extern 函数调用外部代码

有时，你的 Rust 代码可能需要与其他语言编写的代码进行交互。为此，Rust 提供了 `extern` 关键字，它支持创建和使用外部函数接口（FFI）。FFI 是一种方式，允许一种编程语言定义函数，并使另一种（外部）编程语言能够调用这些函数。

示例 20-8 演示了如何与 C 标准库中的 `abs` 函数进行集成。声明在 `extern` 块中的函数通常是从 Rust 代码调用时不安全的，因此 `extern` 块必须标记为 `unsafe`。原因是其他语言不会强制执行 Rust 的规则和保证，而 Rust 无法进行检查，因此安全性责任由程序员承担，确保安全性。

文件名: src/main.rs:

```rust
unsafe extern "C" {
    fn abs(input: i32) -> i32;
}

fn main() {
    unsafe {
        println!("Absolute value of -3 according to C: {}", abs(-3));
    }
}
```

示例 20-8：声明和调用在其他语言中定义的 extern 函数

在 `unsafe extern "C"` 块内，我们列出了希望调用的来自其他语言的外部函数的名称和签名。`"C"` 部分定义了外部函数使用的应用程序二进制接口（ABI）：ABI 定义了如何在汇编级别调用该函数。`"C"` ABI 是最常见的，它遵循 C 编程语言的 ABI。Rust 支持的所有 ABI 的信息可以在 [Rust 参考文档](https://doc.rust-lang.org/reference/items/external-blocks.html#abi) 中找到。

在 `unsafe extern` 块中声明的每个项都隐式地是不安全的。然而，一些 FFI 函数是安全的。例如，C 标准库中的 `abs` 函数没有任何内存安全问题，我们知道它可以与任何 `i32` 一起调用。在这种情况下，我们可以使用 `safe` 关键字来表示即使该函数在 `unsafe extern` 块中，它仍然是安全的。一旦我们做出这个更改，调用它时就不再需要 `unsafe` 块，如示例 20-9 所示。

文件名: src/main.rs:

```rust
unsafe extern "C" {
    safe fn abs(input: i32) -> i32;
}

fn main() {
    println!("Absolute value of -3 according to C: {}", abs(-3));
}
```

示例 20-9：在不安全的 extern 块内显式标记函数为安全并安全调用

标记函数为安全并不意味着它本身就变得安全！相反，这就像是你对 Rust 做出的一个承诺，表示它是安全的。确保这个承诺得到履行仍然是你的责任！

> ## 从其他语言调用 Rust 函数
>
> 我们还可以使用 `extern` 创建一个接口，允许其他语言调用 Rust 函数。与创建整个 extern 块不同，我们只需在相关函数的 `fn` 关键字之前添加 `extern` 关键字并指定要使用的 ABI。我们还需要添加 `#[unsafe(no_mangle)]` 注解，以告知 Rust 编译器不要对该函数的名称进行名称修饰。名称修饰是编译器将我们为函数指定的名称修改为包含更多信息的名称，这些信息供编译过程中的其他部分使用，但对人类来说不太可读。每种编程语言的编译器对名称的修饰方式略有不同，因此为了让其他语言能够使用 Rust 函数的名称，我们必须禁用 Rust 编译器的名称修饰功能。这是危险的，因为在没有内建名称修饰的情况下，库之间可能会出现名称冲突，因此我们有责任确保我们选择的名称在不进行修饰的情况下是安全的。
>
> 在下面的示例中，我们将 `call_from_c` 函数在从 C 代码编译并链接为共享库后暴露给 C 代码：

```rust
#![allow(unused)]
   fn main() {
       #[unsafe(no_mangle)]
       pub extern "C" fn call_from_c() {
           println!("Just called a Rust function from C!");
       }
   }
}
```

> 这种使用 `extern` 只在属性中需要 `unsafe`，而不是在 extern 块中。

## 访问或修改可变的静态变量

在本书中，我们还没有讨论过全局变量，虽然 Rust 支持它们，但由于 Rust 的所有权规则，它们可能会带来问题。如果两个线程同时访问同一个可变的全局变量，就可能导致数据竞争。

在 Rust 中，全局变量称为静态变量。示例 20-10 显示了一个静态变量的声明和使用示例，其中包含一个字符串切片作为值。

文件名: src/main.rs:

```rust
static HELLO_WORLD: &str = "Hello, world!";

fn main() {
    println!("name is: {HELLO_WORLD}");
}
```

示例 20-10：定义和使用不可变静态变量

静态变量类似于常量，我们在第 3 章的“常量”部分讨论过。按照约定，静态变量的名称使用大写蛇形命名（SCREAMING_SNAKE_CASE）。静态变量只能存储具有 `'static` 生命周期的引用，这意味着 Rust 编译器可以自动推导出生命周期，我们不需要显式地为其添加生命周期注解。访问不可变的静态变量是安全的。

常量和不可变静态变量之间的一个微妙区别是，静态变量中的值在内存中具有固定的地址。使用这个值时，始终访问相同的数据。而常量则允许在每次使用时复制其数据。另一个区别是，静态变量可以是可变的。访问和修改可变的静态变量是危险的。示例 20-11 展示了如何声明、访问和修改一个名为 `COUNTER` 的可变静态变量。

文件名: src/main.rs:

```rust
static mut COUNTER: u32 = 0;

/// 安全性：从多个线程同时调用这个函数是未定义行为，因此你*必须*保证它每次只能从单个线程调用。
unsafe fn add_to_count(inc: u32) {
    unsafe {
        COUNTER += inc;
    }
}

fn main() {
    unsafe {
        // 安全性：这个函数只能从 `main` 函数中调用。
        add_to_count(3);
        println!("COUNTER: {}", *(&raw const COUNTER));
    }
}
```

示例 20-11：从可变静态变量读取或写入是危险的

与常规变量一样，我们使用 `mut` 关键字来指定可变性。任何读取或写入 `COUNTER` 的代码都必须在 `unsafe` 块内。此代码可以编译，并且按预期打印出 `COUNTER: 3`，因为它是单线程的。如果多个线程访问 `COUNTER`，可能会导致数据竞争，因此是未定义行为。因此，我们需要将整个函数标记为 `unsafe`，并记录安全性限制，以便调用该函数的任何人都知道他们可以安全地做什么，不能做什么。

每当我们编写一个 `unsafe` 函数时，惯例是在注释中以 `SAFETY` 开头，解释调用者需要做什么才能安全地调用该函数。同样，每当我们执行一个不安全的操作时，惯例是在注释中以 `SAFETY` 开头，解释如何遵守安全规则。

此外，编译器不允许你创建指向可变静态变量的引用。你只能通过原始指针访问它，这些原始指针是通过原始借用操作符之一创建的。这包括在引用隐式创建的情况下，例如当它在 `println!` 中使用时。要求只能通过原始指针创建指向静态可变变量的引用，有助于使使用它们的安全要求更加明确。

对于全局可访问的可变数据，确保没有数据竞争是困难的，这就是为什么 Rust 将可变静态变量视为不安全的原因。如果可能的话，最好使用我们在第 16 章中讨论的并发技术和线程安全智能指针，这样编译器可以检查不同线程之间的数据访问是否安全。

## 实现一个不安全的 Trait

我们可以使用 `unsafe` 来实现一个不安全的 trait。当其中至少一个方法有编译器无法验证的某些不变量时，trait 就是不安全的。我们通过在 `trait` 前加上 `unsafe` 关键字并将 trait 的实现标记为 `unsafe` 来声明该 trait 不安全，如示例 20-12 所示。

```rust
unsafe trait Foo {
    // methods go here
}

unsafe impl Foo for i32 {
    // method implementations go here
}

fn main() {}
```

示例 20-12：定义和实现不安全的 trait

通过使用 `unsafe impl`，我们承诺会遵守编译器无法验证的不变量。

举个例子，回想一下我们在第 16 章[《使用 Send 和 Sync 特性的可扩展并发》](../concurrency/extensible-concurrency-sync-and-send#使用send和sync特性的可扩展并发)中讨论的 `Sync` 和 `Send` 标记 trait：如果我们的类型完全由实现了 `Send` 和 `Sync` 的其他类型组成，编译器会自动实现这些 trait。如果我们实现的类型包含一个不实现 `Send` 或 `Sync` 的类型，例如原始指针，并且我们希望将该类型标记为 `Send` 或 `Sync`，我们必须使用 `unsafe`。Rust 无法验证我们的类型是否遵守它可以安全地跨线程传递或从多个线程访问的保证；因此，我们需要手动进行这些检查，并通过 `unsafe` 来标明这一点。

## 访问联合体的字段

最后，只有通过 `unsafe` 才能执行的操作是访问联合体的字段。联合体类似于结构体，但在某个特定实例中一次只使用一个声明的字段。联合体主要用于与 C 代码中的联合体进行接口交互。访问联合体字段是不安全的，因为 Rust 无法保证当前在联合体实例中存储的数据类型。你可以在 [Rust Reference](https://doc.rust-lang.org/reference/items/unions.html) 中了解更多关于联合体的内容。

## 使用 Miri 检查不安全代码

在编写不安全代码时，你可能希望检查你编写的代码是否真的安全且正确。检查的方法之一是使用 Miri，这是一个官方的 Rust 工具，用于检测未定义行为。与编译时工作的借用检查器不同，Miri 是一个动态工具，工作时机是在运行时。它通过运行程序或其测试套件，检测你是否违反了 Rust 应该如何工作的规则。

使用 Miri 需要 Rust 的 nightly 版本（我们在 [附录 G: Rust 的构建与“Nightly Rust”](#) 中有更多讨论）。你可以通过输入 `rustup +nightly component add miri` 来安装 nightly 版本的 Rust 和 Miri 工具。这不会改变你的项目使用的 Rust 版本；它只是将工具添加到你的系统中，这样你可以在需要时使用它。你可以通过输入 `cargo +nightly miri run` 或 `cargo +nightly miri test` 在项目中运行 Miri。

为了展示它有多有用，考虑一下当我们运行它检测示例 20-11 时会发生什么。

```rust
$ cargo +nightly miri run
   Compiling unsafe-example v0.1.0 (file:///projects/unsafe-example)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.01s
     Running `file:///home/.rustup/toolchains/nightly/bin/cargo-miri runner target/miri/debug/unsafe-example`
COUNTER: 3
```

Miri 正确地警告我们存在对可变数据的共享引用。在这种情况下，Miri 只发出警告，因为在这种情况下不能保证是未定义行为，并且它不会告诉我们如何修复问题。但至少我们知道存在未定义行为的风险，并可以思考如何使代码安全。在某些情况下，Miri 还可以检测到明确的错误——那些肯定是错误的代码模式，并给出如何修复这些错误的建议。

Miri 并不能捕捉到你编写不安全代码时所有的错误。Miri 是一个动态分析工具，它只会捕捉实际运行的代码中的问题。这意味着你需要结合良好的测试技巧，以增强对你编写的不安全代码的信心。Miri 也无法涵盖所有可能导致代码不安全的方式。

换句话说：如果 Miri 检测到问题，你知道有 bug，但仅仅因为 Miri 没有检测到 bug，并不意味着就没有问题。不过，它确实能够捕捉到很多问题。试着在本章的其他不安全代码示例上运行它，看看它会说什么！

你可以在 [Miri 的 GitHub 仓库](https://github.com/rust-lang/miri) 中了解更多信息。

## 何时使用不安全代码

使用 `unsafe` 来利用刚才讨论的五个特性并不错误，甚至不是被反对的，但它确实更加复杂，因为编译器无法帮助保持内存安全。当你有理由使用不安全代码时，你可以这样做，并且显式的 `unsafe` 注解使得在发生问题时更容易追踪问题来源。每当你编写不安全代码时，你可以使用 Miri 来帮助你更有信心地确保你编写的代码符合 Rust 的规则。

欲深入了解如何有效地与不安全的 Rust 代码一起工作，请阅读官方的 Rust 指南[Rustonomicon](https://doc.rust-lang.org/nomicon/)。
