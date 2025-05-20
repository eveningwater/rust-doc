## 闭包：捕获其环境的匿名函数

Rust 的闭包是匿名函数，你可以将它们保存在变量中或作为参数传递给其他函数。你可以在一个地方创建闭包，然后在其他地方调用闭包以在不同的上下文中评估它。与函数不同，闭包可以捕获它们定义范围内的值。我们将演示这些闭包特性如何实现代码重用和行为定制。

### 使用闭包捕获环境

我们将首先研究如何使用闭包捕获它们定义环境中的值以供以后使用。场景如下：我们的 T 恤公司每隔一段时间就会向邮件列表中的某人赠送一件独家限量版 T 恤作为促销。邮件列表中的人可以选择将他们喜欢的颜色添加到他们的个人资料中。如果被选中获得免费 T 恤的人设置了他们喜欢的颜色，他们就会得到那个颜色的 T 恤。如果该人没有指定喜欢的颜色，他们就会得到公司目前库存最多的颜色。

有很多方法可以实现这一点。在这个例子中，我们将使用一个名为 `ShirtColor` 的枚举，它有两个变体 `Red` 和 `Blue`（为了简单起见限制了可用颜色的数量）。我们用一个 `Inventory` 结构体表示公司的库存，该结构体有一个名为 `shirts` 的字段，其中包含一个表示当前库存 T 恤颜色的 `Vec<ShirtColor>`。在 `Inventory` 上定义的 `giveaway` 方法获取免费 T 恤获奖者可选的 T 恤颜色偏好，并返回该人将获得的 T 恤颜色。此设置如示例 13-1 所示：

Filename: src/main.rs:

```rust
#[derive(Debug, PartialEq, Copy, Clone)]
enum ShirtColor {
    Red,
    Blue,
}

struct Inventory {
    shirts: Vec<ShirtColor>,
}

impl Inventory {
    fn giveaway(&self, user_preference: Option<ShirtColor>) -> ShirtColor {
        user_preference.unwrap_or_else(|| self.most_stocked())
    }

    fn most_stocked(&self) -> ShirtColor {
        let mut num_red = 0;
        let mut num_blue = 0;

        for color in &self.shirts {
            match color {
                ShirtColor::Red => num_red += 1,
                ShirtColor::Blue => num_blue += 1,
            }
        }
        if num_red > num_blue {
            ShirtColor::Red
        } else {
            ShirtColor::Blue
        }
    }
}

fn main() {
    let store = Inventory {
        shirts: vec![ShirtColor::Blue, ShirtColor::Red, ShirtColor::Blue],
    };

    let user_pref1 = Some(ShirtColor::Red);
    let giveaway1 = store.giveaway(user_pref1);
    println!(
        "The user with preference {:?} gets {:?}",
        user_pref1, giveaway1
    );

    let user_pref2 = None;
    let giveaway2 = store.giveaway(user_pref2);
    println!(
        "The user with preference {:?} gets {:?}",
        user_pref2, giveaway2
    );
}
```

示例 13-1：T 恤公司赠品情况

`main` 中定义的 `store` 还有两件蓝色 T 恤和一件红色 T 恤用于这次限量版促销。我们为偏好红色 T 恤的用户和没有任何偏好的用户调用了 `giveaway` 方法。

同样，这段代码可以用多种方式实现，在这里，为了专注于闭包，我们坚持使用了你已经学过的概念，除了使用闭包的 `giveaway` 方法的主体。在 `giveaway` 方法中，我们将用户偏好作为 `Option<ShirtColor>` 类型的参数获取，并在 `user_preference` 上调用 `unwrap_or_else` 方法。`Option<T>` 上的 `unwrap_or_else` 方法由[标准库](https://doc.rust-lang.org/std/option/enum.Option.html#method.unwrap_or_else)定义。它接受一个参数：一个没有参数但返回一个 `T` 类型值（与 `Option<T>` 的 `Some` 变体中存储的类型相同，在本例中为 `ShirtColor`）的闭包。如果 `Option<T>` 是 `Some` 变体，`unwrap_or_else` 返回 Some 中的值。如果 `Option<T>` 是 `None` 变体，`unwrap_or_else` 调用闭包并返回闭包返回的值。

我们将闭包表达式 `|| self.most_stocked()` 指定为 `unwrap_or_else` 的参数。这是一个不接受任何参数的闭包（如果闭包有参数，它们将出现在两个竖线之间）。闭包的主体调用 `self.most_stocked()`。我们在这里定义闭包，如果需要结果，`unwrap_or_else` 的实现将在以后评估闭包。

运行此代码会打印：

```rust
$ cargo run
   Compiling shirt-company v0.1.0 (file:///projects/shirt-company)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.27s
     Running `target/debug/shirt-company`
The user with preference Some(Red) gets Red
The user with preference None gets Blue
```

这里一个有趣的方面是，我们传递了一个在当前 `Inventory` 实例上调用 `self.most_stocked()` 的闭包。标准库不需要知道我们定义的 `Inventory` 或 `ShirtColor` 类型，或者我们在此场景中想要使用的逻辑。闭包捕获对 `self` `Inventory` 实例的不可变引用，并将其与我们指定的代码一起传递给 `unwrap_or_else` 方法。另一方面，函数无法以这种方式捕获其环境。

### 闭包类型推断和注解

函数和闭包之间还有更多区别。闭包通常不需要像 `fn` 函数那样注解参数或返回值的类型。函数需要类型注解是因为类型是暴露给用户的一个显式接口的一部分。严格定义此接口对于确保每个人都同意函数使用和返回的值类型非常重要。另一方面，闭包不像这样用于暴露的接口：它们存储在变量中，并在不命名它们并将其暴露给库用户的情况下使用。

闭包通常很短，并且仅在狭窄的上下文中相关，而不是在任何任意场景中。在这些有限的上下文中，编译器可以推断参数和返回类型的类型，类似于它能够推断大多数变量的类型（在极少数情况下，编译器也需要闭包类型注解）。

与变量一样，如果我们想增加显式性和清晰度，可以添加类型注解，代价是比严格必要更冗长。为闭包注解类型看起来像示例 13-2 中所示的定义。在此示例中，我们定义了一个闭包并将其存储在变量中，而不是像示例 13-1 中那样在传递它作为参数的位置定义闭包。

Filename: src/main.rs:

```rust
use std::thread;
use std::time::Duration;

fn generate_workout(intensity: u32, random_number: u32) {
    let expensive_closure = |num: u32| -> u32 {
        println!("calculating slowly...");
        thread::sleep(Duration::from_secs(2));
        num
    };

    if intensity < 25 {
        println!("Today, do {} pushups!", expensive_closure(intensity));
        println!("Next, do {} situps!", expensive_closure(intensity));
    } else {
        if random_number == 3 {
            println!("Take a break today! Remember to stay hydrated!");
        } else {
            println!(
                "Today, run for {} minutes!",
                expensive_closure(intensity)
            );
        }
    }
}

fn main() {
    let simulated_user_specified_value = 10;
    let simulated_random_number = 7;

    generate_workout(simulated_user_specified_value, simulated_random_number);
}
```

示例 13-2：在闭包中添加参数和返回值类型的可选类型注解

添加类型注解后，闭包的语法看起来更像函数的语法。这里我们定义了一个函数，它将其参数加 1，以及一个具有相同行为的闭包，用于比较。我们添加了一些空格以对齐相关部分。这说明了闭包语法与函数语法的相似之处，除了使用竖线和可选语法的数量：

```rust
fn  add_one_v1   (x: u32) -> u32 { x + 1 }
let add_one_v2 = |x: u32| -> u32 { x + 1 };
let add_one_v3 = |x|             { x + 1 };
let add_one_v4 = |x|               x + 1  ;
```

第一行显示函数定义，第二行显示完全注解的闭包定义。在第三行中，我们从闭包定义中删除了类型注解。在第四行中，我们删除了括号，因为闭包主体只有一个表达式，所以括号是可选的。这些都是有效的定义，当它们被调用时会产生相同的行为。`add_one_v3` 和 `add_one_v4` 行要求评估闭包才能编译，因为类型将从它们的用法中推断出来。这类似于 `let v = Vec::new()`；需要类型注解或某种类型的值插入到 `Vec` 中，Rust 才能推断类型。

对于闭包定义，编译器将为其每个参数和返回值推断一个具体类型。例如，示例 13-3 显示了一个短闭包的定义，它只返回它接收到的参数值。除了用于此示例之外，此闭包不是很有用。请注意，我们没有向定义添加任何类型注解。由于没有类型注解，我们可以使用任何类型调用闭包，我们在这里第一次使用 `String` 进行了调用。如果我们然后尝试使用整数调用 `example_closure`，我们将收到一个错误。

Filename: src/main.rs:

```rust
fn main() {
    let example_closure = |x| x;

    let s = example_closure(String::from("hello"));
    let n = example_closure(5);
}
```

示例 13-3：尝试使用两种不同类型调用其类型被推断的闭包

编译器给我们这个错误：

```rust
$ cargo run
   Compiling closure-example v0.1.0 (file:///projects/closure-example)
error[E0308]: mismatched types
 --> src/main.rs:5:29
  |
5 |     let n = example_closure(5);
  |             --------------- ^- help: try using a conversion method: `.to_string()`
  |             |               |
  |             |               expected `String`, found integer
  |             arguments to this function are incorrect
  |
note: expected because the closure was earlier called with an argument of type `String`
 --> src/main.rs:4:29
  |
4 |     let s = example_closure(String::from("hello"));
  |             --------------- ^^^^^^^^^^^^^^^^^^^^^ expected because this argument is of type `String`
  |             |
  |             in this closure call
note: closure parameter defined here
 --> src/main.rs:2:28
  |
2 |     let example_closure = |x| x;
  |                            ^

For more information about this error, try `rustc --explain E0308`.
error: could not compile `closure-example` (bin "closure-example") due to 1 previous error
```

第一次我们使用 `String` 值调用 `example_closure` 时，编译器推断 `x` 的类型和闭包的返回类型为 `String`。然后这些类型被锁定在 `example_closure` 中的闭包中，当我们下次尝试使用不同类型调用同一个闭包时，就会收到类型错误。

### 捕获引用或移动所有权

闭包可以通过三种方式捕获环境中的值，这直接对应于函数接受参数的三种方式：不可变借用、可变借用和获取所有权。闭包将根据函数主体如何处理捕获的值来决定使用哪种方式。

在示例 13-4 中，我们定义了一个闭包，它捕获对名为 list 的向量的不可变引用，因为它只需要不可变引用来打印值：

Filename: src/main.rs:

```rust
fn main() {
    let list = vec![1, 2, 3];
    println!("Before defining closure: {list:?}");

    let only_borrows = || println!("From closure: {list:?}");

    println!("Before calling closure: {list:?}");
    only_borrows();
    println!("After calling closure: {list:?}");
}
```

示例 13-4：定义和调用捕获不可变引用的闭包

此示例还说明变量可以绑定到闭包定义，我们以后可以使用变量名和括号调用闭包，就像变量名是函数名一样。

因为我们可以同时拥有对 `list` 的多个不可变引用，所以 `list` 仍然可以从闭包定义之前的代码、闭包定义之后但在调用闭包之前以及调用闭包之后的代码中访问。此代码编译、运行并打印：

```rust
$ cargo run
   Compiling closure-example v0.1.0 (file:///projects/closure-example)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.43s
     Running `target/debug/closure-example`
Before defining closure: [1, 2, 3]
Before calling closure: [1, 2, 3]
From closure: [1, 2, 3]
After calling closure: [1, 2, 3]
```

接下来，在示例 13-5 中，我们更改闭包主体，使其向 `list` 向量添加一个元素。闭包现在捕获一个可变引用：

Filename: src/main.rs:

```rust
fn main() {
    let mut list = vec![1, 2, 3];
    println!("Before defining closure: {list:?}");

    let mut borrows_mutably = || list.push(7);

    borrows_mutably();
    println!("After calling closure: {list:?}");
}
```

示例 13-5：定义和调用捕获可变引用的闭包

此代码编译、运行并打印：

```rust
$ cargo run
   Compiling closure-example v0.1.0 (file:///projects/closure-example)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.43s
     Running `target/debug/closure-example`
Before defining closure: [1, 2, 3]
After calling closure: [1, 2, 3, 7]
```

请注意，在 `borrows_mutably` 闭包的定义和调用之间不再有 `println!`：当 `borrows_mutably` 被定义时，它捕获了对 `list` 的可变引用。在调用闭包后，我们不再使用闭包，因此可变借用结束。在闭包定义和闭包调用之间，不允许不可变借用来打印，因为存在可变借用时不允许其他借用。尝试在那里添加一个 `println!` 看看你会得到什么错误消息！

如果你想强制闭包获取它在环境中使用的值的所有权，即使闭包主体严格来说不需要所有权，你可以在参数列表之前使用 `move` 关键字。

这种技术主要用于将闭包传递给新线程以移动数据，以便新线程拥有数据。我们将在第 16 章讨论并发时详细讨论线程以及为什么你想使用它们，但现在，让我们简要探讨一下使用需要 `move` 关键字的闭包来生成新线程。示例 13-6 显示了修改后的示例 13-4，以便在新线程而不是主线程中打印向量：

Filename: src/main.rs:

```rust
use std::thread;

fn main() {
    let list = vec![1, 2, 3];
    println!("Before defining closure: {list:?}");

    thread::spawn(move || println!("From thread: {list:?}"))
        .join()
        .unwrap();
}
```

示例 13-6：使用 `move` 强制线程的闭包获取 `list` 的所有权

我们生成一个新线程，将一个闭包作为参数传递给线程运行。闭包主体打印出列表。在示例 13-4 中，闭包仅使用不可变引用捕获了 `list`，因为这是打印它所需的对 `list` 的最少访问权限。在此示例中，即使闭包主体仍然只需要不可变引用，我们也需要通过在闭包定义开头放置 `move` 关键字来指定应将 `list` 移动到闭包中。新线程可能在主线程的其余部分完成之前完成，或者主线程可能先完成。如果主线程保留了 `list` 的所有权但在新线程完成之前结束并丢弃了 `list`，则线程中的不可变引用将无效。因此，编译器要求将 `list` 移动到传递给新线程的闭包中，以便引用有效。尝试删除 `move` 关键字或在定义闭包后在主线程中使用 `list` 看看你会得到什么编译器错误！

### 移动捕获值出闭包和 `Fn` Trait

闭包一旦从定义闭包的环境中捕获了对值的引用或所有权（从而影响了什么值被移动到闭包中，如果有的话），闭包体中的代码就定义了当闭包稍后被求值时，这些引用或值会发生什么（从而影响了什么值被移出闭包，如果有的话）。闭包体可以执行以下任何操作：将捕获的值移出闭包，改变捕获的值，既不移动也不改变值，或者一开始就不从环境中捕获任何东西。

闭包捕获和处理环境中值的方式会影响闭包实现了哪些 trait，而 trait 是函数和结构体指定它们可以使用哪种闭包的方式。闭包会根据闭包体如何处理这些值，自动实现以下一个、两个或全部三个 Fn trait，这些 trait 是累加的：

1. `FnOnce` 适用于只能调用一次的闭包。所有闭包至少实现了这个 trait，因为所有闭包都可以被调用。将捕获的值移出其体的闭包将只实现 `FnOnce`，而不实现其他任何 `Fn` trait，因为它只能被调用一次。
2. `FnMut` 适用于不将捕获的值移出其体，但可能会改变捕获的值的闭包。这些闭包可以被多次调用。
3. `Fn` 适用于不将捕获的值移出其体且不改变捕获的值的闭包，以及不从环境中捕获任何东西的闭包。这些闭包可以多次调用而不会改变其环境，这在例如并发多次调用闭包的情况下非常重要。

让我们看看我们在 Listing 13-1 中使用的 `Option<T>` 上的 `unwrap_or_else` 方法的定义：

```rust
impl<T> Option<T> {
    pub fn unwrap_or_else<F>(self, f: F) -> T
    where
        F: FnOnce() -> T
    {
        match self {
            Some(x) => x,
            None => f(),
        }
    }
}
```

回想一下，`T` 是表示 Option 的 `Some` 变体中值类型的泛型类型。类型 `T` 也是 `unwrap_or_else` 函数的返回类型：例如，在 `Option<String>` 上调用 `unwrap_or_else` 的代码将获得一个 `String`。

接下来，请注意 `unwrap_or_else` 函数还有一个额外的泛型类型参数 `F`。类型 `F` 是名为 `f` 的参数的类型，它是我们在调用 `unwrap_or_else` 时提供的闭包。

泛型类型 `F` 上指定的 trait bound 是 `FnOnce() -> T`，这意味着 `F` 必须能够被调用一次，不接受任何参数，并返回一个 `T`。在 trait bound 中使用 `FnOnce` 表达了 `unwrap_or_else` 最多只会调用 `f` 一次的约束。在 `unwrap_or_else` 的体中，我们可以看到如果 `Option` 是 `Some`，`f` 将不会被调用。如果 `Option` 是 `None`，`f` 将被调用一次。因为所有闭包都实现了 `FnOnce`，所以 `unwrap_or_else` 接受所有三种类型的闭包，并且尽可能灵活。

> 注意：如果我们要做的操作不需要从环境中捕获值，我们可以使用函数名而不是闭包。例如，我们可以在 `Option<Vec<T>>` 值上调用 `unwrap_or_else(Vec::new)`，以便在值为 `None` 时获得一个新的空向量。编译器会自动为函数定义实现适用的 `Fn` trait。

现在让我们看看切片上定义的标准库方法 `sort_by_key`，看看它与 `unwrap_or_else` 有何不同，以及为什么 `sort_by_key` 使用 `FnMut` 而不是 `FnOnce` 作为 trait bound。闭包以对正在考虑的切片中当前项的引用的形式接收一个参数，并返回一个可以排序的 `K` 类型的值。当您想按每个项的特定属性对切片进行排序时，此函数非常有用。在 Listing 13-7 中，我们有一个 `Rectangle` 实例列表，我们使用 `sort_by_key` 按它们的 `width` 属性从低到高排序：

Filename: src/main.rs:

```rust
#[derive(Debug)]
struct Rectangle {
    width: u32,
    height: u32,
}

fn main() {
    let mut list = [
        Rectangle { width: 10, height: 1 },
        Rectangle { width: 3, height: 5 },
        Rectangle { width: 7, height: 12 },
    ];

    list.sort_by_key(|r| r.width);
    println!("{list:#?}");
}
```

Listing 13-7: 使用 `sort_by_key` 按宽度排序矩形

这段代码打印：

```rust
$ cargo run
   Compiling rectangles v0.1.0 (file:///projects/rectangles)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.41s
     Running `target/debug/rectangles`
[
    Rectangle {
        width: 3,
        height: 5,
    },
    Rectangle {
        width: 7,
        height: 12,
    },
    Rectangle {
        width: 10,
        height: 1,
    },
]
```

`sort_by_key` 被定义为接受 `FnMut` 闭包的原因是它会多次调用闭包：切片中的每个项调用一次。闭包 `|r| r.width` 不会从其环境中捕获、改变或移出任何东西，因此它满足 trait bound 要求。

相比之下，Listing 13-8 展示了一个只实现 `FnOnce` trait 的闭包示例，因为它将一个值移出了环境。编译器不允许我们将此闭包与 `sort_by_key` 一起使用：

Filename: src/main.rs:

```rust
#[derive(Debug)]
struct Rectangle {
    width: u32,
    height: u32,
}

fn main() {
    let mut list = [
        Rectangle { width: 10, height: 1 },
        Rectangle { width: 3, height: 5 },
        Rectangle { width: 7, height: 12 },
    ];

    let mut sort_operations = vec![];
    let value = String::from("closure called");

    list.sort_by_key(|r| {
        sort_operations.push(value);
        r.width
    });
    println!("{list:#?}");
}
```

Listing 13-8: 尝试将 FnOnce 闭包与 sort_by_key 一起使用

这是一种牵强附会（且不起作用）的方式，试图计算 `sort_by_key` 在排序 `list` 时调用闭包的次数。这段代码试图通过将 `value`——一个来自闭包环境的 `String`——推入 `sort_operations` 向量来完成计数。闭包捕获了 `value`，然后通过将 `value` 的所有权转移到 `sort_operations` 向量来将 `value` 移出闭包。这个闭包只能被调用一次；第二次尝试调用它将不起作用，因为 `value` 将不再在环境中再次被推入 `sort_operations`！因此，这个闭包只实现了 `FnOnce`。当我们尝试编译这段代码时，我们得到一个错误，提示 `value` 不能移出闭包，因为闭包必须实现 `FnMut`：

```rust
$ cargo run
   Compiling rectangles v0.1.0 (file:///projects/rectangles)
error[E0507]: cannot move out of `value`, a captured variable in an `FnMut` closure
  --> src/main.rs:18:30
   |
15 |     let value = String::from("closure called");
   |         ----- captured outer variable
16 |
17 |     list.sort_by_key(|r| {
   |                      --- captured by this `FnMut` closure
18 |         sort_operations.push(value);
   |                              ^^^^^ move occurs because `value` has type `String`, which does not implement the `Copy` trait
   |
help: consider cloning the value if the performance cost is acceptable
   |
18 |         sort_operations.push(value.clone());
   |                                   ++++++++

For more information about this error, try `rustc --explain E0507`.
error: could not compile `rectangles` (bin "rectangles") due to 1 previous error
```

错误指向闭包体中将 `value` 移出环境的那一行。要解决这个问题，我们需要修改闭包体，使其不将值移出环境。在环境中保留一个计数器并在闭包体中增加其值是计算闭包被调用次数的更直接的方法。Listing 13-9 中的闭包与 `sort_by_key` 一起使用，因为它只捕获了对 `num_sort_operations` 计数器的可变引用，因此可以被多次调用：

Filename: src/main.rs:

```rust
#[derive(Debug)]
struct Rectangle {
    width: u32,
    height: u32,
}

fn main() {
    let mut list = [
        Rectangle { width: 10, height: 1 },
        Rectangle { width: 3, height: 5 },
        Rectangle { width: 7, height: 12 },
    ];

    let mut num_sort_operations = 0;
    list.sort_by_key(|r| {
        num_sort_operations += 1;
        r.width
    });
    println!("{list:#?}, sorted in {num_sort_operations} operations");
}
```

Listing 13-9: 允许将 `FnMut` 闭包与 `sort_by_key` 一起使用

`Fn` trait 在定义或使用利用闭包的函数或类型时非常重要。在下一节中，我们将讨论迭代器。许多迭代器方法接受闭包参数，因此在我们继续时请记住这些闭包细节。