## match 控制流构造

Rust 有一个非常强大的控制流构造，称为 match，它允许你将一个值与一系列模式进行比较，然后根据模式匹配执行代码。模式可以由文字值、变量名、通配符和许多其他内容组成；第 18 章介绍了所有不同类型的模式及其作用。match 的强大之处在于模式的表达能力以及编译器确认所有可能的情况都得到处理的事实。

可以将匹配表达式想象成一台硬币分类机：硬币沿着轨道滑下，轨道上有各种大小的孔，每枚硬币都会从它遇到的第一个适合它的孔中掉落。同样，值也会在匹配中经历每个模式，在值“适合”的第一个模式中，该值会落入关联的代码块中，以便在执行期间使用。

说到硬币，让我们用 match 来举例！我们可以编写一个函数，接受一个未知的美国硬币，并以与计数机类似的方式确定它是哪种硬币并返回其价值（以美分为单位），如示例 6-3 所示。

```rust
enum Coin {
    Penny,
    Nickel,
    Dime,
    Quarter,
}

fn value_in_cents(coin: Coin) -> u8 {
    match coin {
        Coin::Penny => 1,
        Coin::Nickel => 5,
        Coin::Dime => 10,
        Coin::Quarter => 25,
    }
}
```

示例 6-3：一个枚举和一个以枚举的变体作为模式的匹配表达式

让我们拆分理解一下 value_in_cents 函数中的 match。首先，我们列出 match 关键字，后面跟着一个表达式，在本例中是值 coin。这看起来与 if 中使用的条件表达式非常相似，但有一个很大的区别：对于 if，条件需要计算为布尔值，但在这里它可以是任何类型。本例中的硬币类型是我们在第一行定义的 Coin 枚举。

接下来是 match 分支。分支由两部分组成：模式和一些代码。这里的第一个分支有一个模式，其值为 Coin::Penny，然后是 => 运算符，它将模式和要运行的代码分开。本例中的代码只是值 1。每个分支与下一个分支之间用逗号分隔。

当 match 表达式执行时，它会按顺序将结果值与每个分支的模式进行比较。如果模式与值匹配，则执行与该模式关联的代码。如果该模式与值不匹配，则继续执行下一个分支，就像硬币分类机一样。我们可以根据需要拥有任意数量的分支：在示例 6-3 中，我们的 match 有四个分支。

与每个分支相关的代码是一个表达式，匹配分支中表达式的结果值是整个匹配表达式返回的值。

如果匹配分支代码较短，我们通常不使用花括号，如示例 6-3 中所示，其中每个分支仅返回一个值。如果要在匹配分支中运行多行代码，则必须使用花括号，分支后面的逗号是可选的。例如，以下代码每次使用 `Coin::Penny` 调用该方法时都会打印`“Lucky penny!”`，但仍然返回块的最后一个值 1：

```rust
fn value_in_cents(coin: Coin) -> u8 {
    match coin {
        Coin::Penny => {
            println!("Lucky penny!");
            1
        }
        Coin::Nickel => 5,
        Coin::Dime => 10,
        Coin::Quarter => 25,
    }
}
```

## 与值绑定的模式

匹配分支的另一个有用功能是它们可以绑定到与模式匹配的值的部分。这就是我们从枚举变量中提取值的方法。

举个例子，让我们修改一个枚举变量，使其内部保存数据。从 1999 年到 2008 年，美国铸造了 25 美分硬币，一面有 50 个州的图案。其他硬币都没有州图案，所以只有 25 美分硬币有这个额外的值。我们可以将这些信息添加到枚举中，方法是将 Quarter 变量更改为包含存储在其中的 UsState 值，我们在示例 6-4 中已经这样做了。

```rust
#[derive(Debug)] // 所以我们可以在一分钟内检查状态
enum UsState {
    Alabama,
    Alaska,
    // 省略
}

enum Coin {
    Penny,
    Nickel,
    Dime,
    Quarter(UsState),
}

fn main() {}
```

示例 6-4：Coin 枚举，其中 Quarter 变量还包含 UsState 值

假设一位朋友想收集全部 50 个州的 25 美分硬币。当我们按硬币类型对零钱进行分类时，我们还会标出每个 25 美分硬币所属州的名称，这样如果我们的朋友没有这个州的 25 美分硬币，他们就可以将其添加到自己的收藏中。

在此代码的匹配表达式中，我们向模式添加一个名为 state 的变量，该变量与变体 `Coin::Quarter` 的值匹配。当 `Coin::Quarter` 匹配时，state 变量将绑定到该 25 美分硬币的状态值。然后我们可以在该分支的代码中使用 state，如下所示：

```rust
fn value_in_cents(coin: Coin) -> u8 {
    match coin {
        Coin::Penny => 1,
        Coin::Nickel => 5,
        Coin::Dime => 10,
        Coin::Quarter(state) => {
            println!("State quarter from {state:?}!");
            25
        }
    }
}
```

如果我们调用 `value_in_cents(Coin::Quarter(UsState::Alaska))`，coin 将是 `Coin::Quarter(UsState::Alaska)`。当我们将该值与每个匹配分支进行比较时，它们都不匹配，直到我们到达 `Coin::Quarter(state)`。此时，state 的绑定将是值 `UsState::Alaska`。然后我们可以在 `println!` 表达式中使用该绑定，从而从 Quarter 的 Coin 枚举变量中获取内部状态值。

## 与 `Option<T>` 匹配

在上一节中，我们想要在使用 `Option<T>` 时从 Some 案例中获取内部 T 值；我们也可以使用 match 处理 `Option<T>`，就像我们对 Coin 枚举所做的那样！我们不会比较硬币，而是比较 `Option<T>` 的变体，但 match 表达式的工作方式保持不变。

假设我们想要编写一个函数，它接受一个 `Option<i32>`，如果里面有一个值，则将该值加 1。如果里面没有值，函数应该返回 None 值，而不是尝试执行任何操作。

由于 match，这个函数非常容易编写，如下所示。

```rust
fn plus_one(x: Option<i32>) -> Option<i32> {
    match x {
        None => None,
        Some(i) => Some(i + 1),
    }
}
let five = Some(5);
let six = plus_one(five);
let none = plus_one(None);
```
示例 6-5：在 `Option<i32>` 上使用匹配表达式的函数

让我们更详细地检查 plus_one 的第一次执行。当我们调用 plus_one(five) 时，plus_one 主体中的变量 x 将具有值 Some(5)。然后我们将其与每个匹配分支进行比较：

```rust
None => None
```

Some(5) 值与模式 None 不匹配，因此我们继续下一个分支：

```rust
Some(i) => Some(i + 1),
```

Some(5) 是否匹配 Some(i)？是的！我们有相同的变体。i 绑定到 Some 中包含的值，因此 i 取值 5。然后执行 match 分支中的代码，因此我们将 i 的值加 1，并创建一个新的 Some 值，其中包含我们的总数 6。

现在让我们考虑示例 6-5 中 plus_one 的第二次调用，其中 x 为 None。我们进入 match 并与第一个分支进行比较：

```rust
None => None,
```

匹配成功！没有值可以添加，因此程序停止并返回 `=>` 右侧的 None 值。由于第一个分支匹配成功，因此不再比较其他分支。

在许多情况下，将 match 和 enums 结合起来很有用。你会在 Rust 代码中经常看到这种模式：匹配 enum，将变量绑定到内部数据，然后根据它执行代码。一开始有点棘手，但一旦习惯了，你就会希望所有语言都有它。它一直是用户的最爱。

## 穷举匹配结果

我们需要讨论 match 的另一个方面：分支的模式必须涵盖所有可能性。考虑一下我们的 plus_one 函数的这个版本，它有一个错误并且无法编译：

```rust
fn main() {
    fn plus_one(x: Option<i32>) -> Option<i32> {
        match x {
            Some(i) => Some(i + 1),
        }
    }

    let five = Some(5);
    let six = plus_one(five);
    let none = plus_one(None);
}
```

我们没有处理 None 的情况，所以这段代码会导致错误。幸运的是，Rust 知道如何捕获这个错误。如果我们尝试编译这段代码，我们会得到这个错误：

```rust
$ cargo run
   Compiling enums v0.1.0 (file:///projects/enums)
error[E0004]: non-exhaustive patterns: `None` not covered
 --> src/main.rs:3:15
  |
3 |         match x {
  |               ^ pattern `None` not covered
  |
note: `Option<i32>` defined here
 --> /rustc/eeb90cda1969383f56a2637cbd3037bdf598841c/library/core/src/option.rs:574:1
 ::: /rustc/eeb90cda1969383f56a2637cbd3037bdf598841c/library/core/src/option.rs:578:5
  |
  = note: not covered
  = note: the matched value is of type `Option<i32>`
help: ensure that all possible cases are being handled by adding a match arm with a wildcard pattern or an explicit pattern as shown
  |
4 ~             Some(i) => Some(i + 1),
5 ~             None => todo!(),
  |

For more information about this error, try `rustc --explain E0004`.
error: could not compile `enums` (bin "enums") due to 1 previous error
```

Rust 知道我们没有涵盖所有可能的情况，甚至知道我们忘记了哪种模式！Rust 中的匹配是*exhaustive*（穷举，详尽）的：我们必须穷尽所有可能性才能使代码有效。特别是在 `Option<T>` 的情况下，当 Rust 防止我们忘记明确处理 None 的情况时，它可以防止我们在可能为 null 时假设我们有一个值，从而避免前面讨论的十亿美元错误。

## 捕获所有模式和 `_` 占位符

使用枚举，我们还可以针对一些特定值采取特殊操作，但对于所有其他值，则采取一个默认操作。假设我们正在实现一款游戏，如果你掷骰子得到 3，你的玩家不会移动，而是得到一顶新的花式帽子。如果你掷出 7，你的玩家将失去一顶花式帽子。对于所有其他值，你的玩家将在游戏板上移动该数量的空格。下面是实现该逻辑的代码，掷骰子的结果被硬编码而不是随机值，所有其他逻辑都由没有主体的函数表示，因为实际实现它们超出了本示例的范围：

```rust
let dice_roll = 9;
match dice_roll {
    3 => add_fancy_hat(),
    7 => remove_fancy_hat(),
    other => move_player(other),
}

fn add_fancy_hat() {}
fn remove_fancy_hat() {}
fn move_player(num_spaces: u8) {}
```

对于前两个分支，模式是文字值 3 和 7。对于涵盖所有其他可能值的最后一个分支，模式是我们选择命名为 other 的变量。为另一个分支运行的代码通过将变量传递给 move_player 函数来使用该变量。

即使我们没有列出 u8 可能具有的所有值，此代码也可以编译，因为最后一个模式将匹配未明确列出的所有值。此捕获所有模式满足匹配必须详尽的要求。请注意，我们必须将捕获所有分支放在最后，因为模式是按顺序评估的。如果我们将捕获所有分支放在前面，其他分支将永远不会运行，因此如果我们在捕获所有分支之后添加分支，Rust 会警告我们！

Rust 还有一种模式，当我们想要捕获所有分支但不想使用捕获所有分支模式中的值时可以使用它：`_` 是一种特殊模式，它匹配任何值并且不绑定到该值。这告诉 Rust 我们不会使用该值，因此 Rust 不会警告我们未使用的变量。

让我们改变游戏规则：现在，如果你掷出的点数不是 3 或 7，则必须重新掷骰子。我们不再需要使用万能值，因此我们可以更改代码以使用 `_` 而不是名为 other 的变量：

```rust
let dice_roll = 9;
match dice_roll {
    3 => add_fancy_hat(),
    7 => remove_fancy_hat(),
    _ => reroll(),
}
fn add_fancy_hat() {}
fn remove_fancy_hat() {}
fn reroll() {}
```

最后，我们将再次改变游戏规则，这样如果你掷出 3 或 7 以外的任何数字，轮到你时就不会发生任何其他事情。我们可以通过使用单位值（我们在“[元组类型](../common-concept/data-type#元组类型)”部分中提到的空元组类型）作为与`_` 分支一起使用的代码来表达这一点：

```rust
let dice_roll = 9;
match dice_roll {
    3 => add_fancy_hat(),
    7 => remove_fancy_hat(),
    _ => (),
}

fn add_fancy_hat() {}
fn remove_fancy_hat() {}
```

在这里，我们明确地告诉 Rust，我们不会使用任何与先前分支中的模式不匹配的其他值，并且我们不想在这种情况下运行任何代码。

我们将在第 18 章中介绍有关模式和匹配的更多信息。现在，我们将转到 `if let` 语法，这在匹配表达式有点冗长的情况下很有用。