## 方法语法

方法类似于函数：我们用 fn 关键字和名称声明它们，它们可以有参数和返回值，并且它们包含一些在从其他地方调用该方法时运行的代码。与函数不同，方法是在结构体（或枚举或特征对象，我们分别在[第 6 章](../enums/enums.md)和第 17 章中介绍）的上下文中定义的，并且它们的第一个参数始终是 self，它表示调用该方法的结构体的实例。

## 方法定义

让我们将以 Rectangle 实例为参数的 area 函数改为在 Rectangle 结构体上定义一个 area 方法，如示例 5-13 所示。

文件名：src/main.rs:

```rust
#[derive(Debug)]
struct Rectangle {
    width: u32,
    height: u32,
}

impl Rectangle {
    fn area(&self) -> u32 {
        self.width * self.height
    }
}

fn main() {
    let rect1 = Rectangle {
        width: 30,
        height: 50,
    };

    println!(
        "The area of the rectangle is {} square pixels.",
        rect1.area()
    );
}
```

示例 5-13：在 Rectangle 结构体上定义面积方法

为了在 Rectangle 上下文中定义该函数，我们为 Rectangle 启动一个 impl（实现）块。此 impl 块内的所有内容都将与 Rectangle 类型相关联。然后，我们将 area 函数移到 impl 大括号内，并将签名中的第一个（在本例中是唯一的）参数更改为 self，并将它们放在主体内的所有位置。在 main 中，我们调用了 area 函数并将 rect1 作为参数传递，我们可以改用方法语法来调用 Rectangle 实例上的 area 方法。方法语法位于实例之后：我们添加一个点，后跟方法名称、括号和任何参数。

在 area 的签名中，我们使用 &self 而不是 `rectangle: &Rectangle`。`&self` 实际上是 `self: &Self` 的缩写。在 impl 块中，类型 Self 是 impl 块所针对类型的别名。方法的第一个参数必须有一个名为 self 且类型为 Self 的参数，因此 Rust 允许你在第一个参数位置仅使用名称 self 来缩写它。请注意，我们仍然需要在 self 简写前面使用 & 来表示此方法借用了 Self 实例，就像我们在 `rectangle: &Rectangle` 中所做的那样。方法可以取得 self 的所有权，不可变地借用 self（就像我们在这里所做的那样），或者可变地借用 self（就像它们可以对任何其他参数那样）。

我们在这里选择 &self 的原因与在函数版本中使用 &Rectangle 的原因相同：我们不想取得所有权，我们只想读取结构中的数据，而不是写入数据。如果我们想在方法执行的过程中更改调用该方法的实例，我们将使用 `&mut self` 作为第一个参数。使用 self 作为第一个参数来取得实例所有权的方法很少见；这种技术通常用于当方法将 self 转换为其他内容并且你想阻止调用者在转换后使用原始实例时。

除了提供方法语法和不必在每个方法的签名中重复 self 的类型之外，使用方法而不是函数的主要原因是为了组织代码。我们将可以使用类型实例执行的所有操作都放在一个 impl 块中，而不是让我们代码的未来用户在我们提供的库的各个地方搜索 Rectangle 的功能。

请注意，我们可以选择将方法命名为与结构体字段相同的名称。例如，我们可以在 Rectangle 上定义一个名为 width 的方法：

文件名：src/main.rs:

```rust
impl Rectangle {
    fn width(&self) -> bool {
        self.width > 0
    }
}

fn main() {
    let rect1 = Rectangle {
        width: 30,
        height: 50,
    };

    if rect1.width() {
        println!("The rectangle has a nonzero width; it is {}", rect1.width);
    }
}
```

在这里，我们选择让 width 方法在实例的 width 字段中的值大于 0 时返回 true，在值为 0 时返回 false：我们可以将同名方法中的字段用于任何目的。在 main 中，当我们在 rect1.width 后面加上括号时，Rust 知道我们指的是width方法。当我们不使用括号时，Rust 知道我们指的是width字段。

通常（但并非总是如此），当我们将方法命名为与字段相同的名称时，我们希望它仅返回字段中的值而不执行任何其他操作。像这样的方法称为 getter，Rust 不会像其他一些语言那样为结构字段自动实现它们。Getter 很有用，因为你可以将字段设为私有，但将方法设为公共，从而允许对该字段的只读访问作为类型公共 API 的一部分。我们将在第 7 章中讨论什么是公共和私有，以及如何将字段或方法指定为公共或私有。

> ## 操作符`->`在哪里？
>
> 在 C 和 C++ 中，调用方法使用两种不同的运算符：如果直接调用对象上的方法，则使用 `.`；如果调用指向对象的指针上的方法并需要先取消引用指针，则使用 `->`。换句话说，如果 object 是指针，则 `object->something()` 类似于 `(*object).something()`。
> Rust 没有与 `->` 运算符等效的运算符；相反，Rust 具有一项称为自动引用和取消引用的功能。调用方法是 Rust 中少数具有此行为的地方之一。
> 它的工作原理如下：当你使用 `object.something()` 调用方法时，Rust 会自动添加 `&`、`&mut` 或 `*`，以便 object 与方法的签名匹配。换句话说，以下内容相同：
>
> ```rust
> p1.distance(&p2);
> (&p1).distance(&p2);
> ```
>
> 第一个看起来更简洁。这种自动引用行为之所以有效，是因为方法有一个明确的接收者——`self`类型。给定接收者和方法名称，Rust 可以明确地确定该方法是读取（`&self`）、可变（`&mut self`）还是消费（`self`）。Rust 使方法接收者的借用隐式化，这一事实在实践中是使所有权符合人体工程学的重要部分。
> 

## 具有更多参数的方法

让我们通过在 Rectangle 结构上实现第二个方法来练习使用方法。这次，我们希望 Rectangle 的一个实例接受另一个 Rectangle 实例，如果第二个 Rectangle 可以完全容纳在 self（第一个 Rectangle）中，则返回 true；否则，它应该返回 false。也就是说，一旦我们定义了 can_hold 方法，我们就希望能够编写如示例 5-14 所示的程序。

文件名：src/main.rs:

```rust
fn main() {
    let rect1 = Rectangle {
        width: 30,
        height: 50,
    };
    let rect2 = Rectangle {
        width: 10,
        height: 40,
    };
    let rect3 = Rectangle {
        width: 60,
        height: 45,
    };

    println!("Can rect1 hold rect2? {}", rect1.can_hold(&rect2));
    println!("Can rect1 hold rect3? {}", rect1.can_hold(&rect3));
}
```

示例 5-14：使用尚未编写的 can_hold 方法

预期输出将如下所示，因为 rect2 的两个尺寸都小于 rect1 的尺寸，但 rect3 比 rect1 宽：

```rust
Can rect1 hold rect2? true
Can rect1 hold rect3? false
```

我们知道我们想要定义一个方法，所以它将在 impl Rectangle 块中。方法名称将是 can_hold，它将以另一个 Rectangle 的不可变借用作为参数。我们可以通过查看调用该方法的代码来判断参数的类型：rect1.can_hold(&rect2) 传入 &rect2，它是 Rectangle 实例 rect2 的不可变借用。这是有道理的，因为我们只需要读取 rect2（而不是写入，这意味着我们需要一个可变借用），并且我们希望 main 保留 rect2 的所有权，以便在调用 can_hold 方法后再次使用它。can_hold 的返回值将是一个布尔值，实现将分别检查 self 的宽度和高度是否大于另一个 Rectangle 的宽度和高度。让我们将新的 can_hold 方法添加到示例 5-13 中的 impl 块中，如示例 5-15 所示。

文件名：src/main.rs:

```rust
impl Rectangle {
    fn area(&self) -> u32 {
        self.width * self.height
    }

    fn can_hold(&self, other: &Rectangle) -> bool {
        self.width > other.width && self.height > other.height
    }
}
```

示例 5-15：实现 Rectangle 的 can_hold 方法，以另一个 Rectangle 实例作为参数

当我们使用示例 5-14 中的 main 函数运行此代码时，我们将获得所需的输出。方法可以采用我们在 self 参数之后添加到签名中的多个参数，这些参数的工作方式与函数中的参数一样。

## 关联函数

impl 块中定义的所有函数都称为关联函数，因为它们与以 impl 命名的类型相关联。我们可以定义不以 self 作为其第一个参数的关联函数（因此不是方法），因为它们不需要使用该类型的实例即可工作。我们已经使用过一个这样的函数：在 String 类型上定义的 `String::from` 函数。

不是方法的关联函数通常用于将返回结构体新实例的构造函数。这些通常被称为 new，但 new 不是特殊名称，也不是语言内置的。例如，我们可以选择提供一个名为 square 的关联函数，该函数有一个维度参数，并将其用作宽度和高度，从而更容易创建一个square相关的Rectangle结构体，而不必两次指定相同的值：

文件名：src/main.rs:

```rust
impl Rectangle {
    fn square(size: u32) -> Self {
        Self {
            width: size,
            height: size,
        }
    }
}
```

返回类型和函数主体中的 Self 关键字是 impl 关键字后出现的类型的别名，在本例中为 Rectangle。

要调用此关联函数，我们使用 `::` 语法和结构名称； `let sq = Rectangle::square(3);` 就是一个例子。此函数由结构命名空间：`::` 语法用于关联函数和模块创建的命名空间。我们将在第 7 章中讨论模块。

## 多个 impl 块

每个结构体允许有多个 impl 块。例如，示例 5-15 相当于示例 5-16 所示的代码，其中每个方法都在自己的 impl 块中。

```rust
impl Rectangle {
    fn area(&self) -> u32 {
        self.width * self.height
    }
}

impl Rectangle {
    fn can_hold(&self, other: &Rectangle) -> bool {
        self.width > other.width && self.height > other.height
    }
}
```

示例 5-16：使用多个 impl 块重写示例 5-15

这里没有必要将这些方法分成多个 impl 块，但这是有效的语法。我们将在第 10 章中看到多个 impl 块有用的情况，我们将在该章中讨论泛型类型和特征。

## 总结

结构体允许你创建对你的领域有意义的自定义类型。通过使用结构体，你可以将关联的数据片段彼此连接，并命名每个片段以使你的代码清晰易懂。在 impl 块中，你可以定义与你的类型关联的函数，方法是一种关联函数，可让你指定结构体实例的行为。

但结构体并不是创建自定义类型的唯一方式：让我们转向 Rust 的枚举功能，为你的工具箱添加另一个工具。