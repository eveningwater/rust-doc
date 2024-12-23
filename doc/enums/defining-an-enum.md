## 定义一个枚举

结构体为你提供了一种将相关字段和数据组合在一起的方法，例如具有width和height的 Rectangle，而枚举为你提供了一种表示某个值是一组可能值之一的方法。例如，我们可能想说 Rectangle 是一组可能形状之一，该集合还包括 Circle 和 Triangle。为此，Rust 允许我们将这些可能性编码为枚举。

让我们看看我们可能想要在代码中表达的情况，看看为什么枚举在这种情况下比结构更有用、更合适。假设我们需要处理 IP 地址。目前，IP 地址使用两个主要标准：v4 和 v6。因为这些是我们的程序会遇到的唯一可能的 IP 地址，所以我们可以枚举所有可能的变量，这就是枚举名称的由来。

任何 IP 地址都可以是v4 或v6地址，但不能同时是两者。IP 地址的这一特性使得枚举数据结构非常合适，因为枚举值只能是其变体之一。v4 和v6地址从根本上来说仍然是 IP 地址，因此当代码处理适用于任何类型的 IP 地址的情况时，应将它们视为同一类型。

我们可以通过定义 IpAddrKind 枚举并列出 IP 地址可能的类型 V4 和 V6，在代码中表达这一概念。这些是枚举的变体：

```rust
enum IpAddrKind {
    V4,
    V6,
}
```

IpAddrKind 现在是一种自定义数据类型，我们可以在代码的其他地方使用它。

### 枚举值

我们可以像这样创建 IpAddrKind 的两个变量的实例：

```rust
let four = IpAddrKind::V4;
let six = IpAddrKind::V6;
```

请注意，枚举的变量在其标识符下命名，我们使用双冒号将两者分开。这很有用，因为现在 `IpAddrKind::V4` 和 `IpAddrKind::V6` 这两个值都属于同一类型：`IpAddrKind`。然后，例如，我们可以定义一个接受任何 `IpAddrKind` 的函数：

```rust
fn route(ip_kind: IpAddrKind) {}
```

我们可以用以下任一方式调用该函数：

```rust
route(IpAddrKind::V4);
route(IpAddrKind::V6);
```

使用枚举还有更多优势。仔细考虑一下我们的 IP 地址类型，目前我们没有办法存储实际的 IP 地址数据；我们只知道它是什么类型。鉴于你刚刚在第 5 章中学习了结构体，你可能会想用结构体来解决这个问题，如示例 6-1 所示。

```rust
enum IpAddrKind {
    V4,
    V6,
}
struct IpAddr {
    kind: IpAddrKind,
    address: String,
}
let home = IpAddr {
    kind: IpAddrKind::V4,
    address: String::from("127.0.0.1"),
};
let loopback = IpAddr {
    kind: IpAddrKind::V6,
    address: String::from("::1"),
};
```

示例 6-1：使用结构体存储 IP 地址的数据和 IpAddrKind 变量

这里，我们定义了一个结构体 IpAddr，它有两个字段：一个类型为 IpAddrKind（我们之前定义的枚举）的 kind 字段和一个类型为 String 的 address 字段。我们有两个此结构体的实例。第一个是 home，它的类型值为 `IpAddrKind::V4`，关联的地址数据为 `127.0.0.1`。第二个实例是 loopback。它的类型值为 IpAddrKind 的另一个变量 V6，关联的地址为 `::1`。我们使用结构体将类型和地址值捆绑在一起，因此现在变量与值相关联。

但是，仅使用枚举来表示相同的概念更为简洁：我们可以将数据直接放入每个枚举变量中，而不是将枚举放在结构体中。IpAddr 枚举的这个新定义表明 V4 和 V6 变量都将具有关联的字符串值：

```rust
enum IpAddr {
    V4(String),
    V6(String),
}
let home = IpAddr::V4(String::from("127.0.0.1"));
let loopback = IpAddr::V6(String::from("::1"));
```

我们直接将数据附加到枚举的每个变量，因此不需要额外的结构体。在这里，也更容易看到枚举如何工作的另一个细节：我们定义的每个枚举变量的名称也成为构造枚举实例的函数。也就是说，`IpAddr::V4()` 是一个函数调用，它接受一个 String 参数并返回一个 IpAddr 类型的实例。我们自动获得这个构造函数的定义，这是定义枚举的结果。

使用枚举而不是结构还有另一个优势：每个变量可以具有不同类型和数量的关联数据。版本 4 IP 地址将始终具有四个数字组件，其值介于 0 到 255 之间。如果我们想将 V4 地址存储为四个 u8 值，但仍将 V6 地址表示为一个字符串值，则无法使用结构体。枚举可以轻松处理这种情况：

```rust
enum IpAddr {
    V4(u8, u8, u8, u8),
    V6(String),
}
let home = IpAddr::V4(127, 0, 0, 1);
let loopback = IpAddr::V6(String::from("::1"));
```

我们已经展示了几种定义数据结构来存储版本 4 和版本 6 IP 地址的不同方法。然而，事实证明，想要存储 IP 地址并编码其类型是如此常见，以至于[标准库有一个我们可以使用的定义](https://doc.rust-lang.org/std/net/enum.IpAddr.html)！让我们看看标准库如何定义 IpAddr：它具有我们定义和使用的确切枚举和变量，但它以两种不同结构的形式将地址数据嵌入到变量中，每个变量的定义不同：

```rust
#![allow(unused)]
fn main() {
    struct Ipv4Addr {
        // --snip--
    }

    struct Ipv6Addr {
        // --snip--
    }

    enum IpAddr {
        V4(Ipv4Addr),
        V6(Ipv6Addr),
    }
}
```

此代码说明，你可以将任何类型的数据放入枚举变量中：例如字符串、数字类型或结构。你甚至可以包含另一个枚举！此外，标准库类型通常不会比你可能想到的复杂得多。

请注意，尽管标准库包含 IpAddr 的定义，但我们仍然可以创建和使用自己的定义而不会发生冲突，因为我们没有将标准库的定义纳入我们的作用域。我们将在第 7 章中进一步讨论如何将类型纳入作用域。

让我们看一下示例 6-2 中的另一个枚举示例：这个示例的变量中嵌入了多种类型。

```rust
enum Message {
    Quit,
    Move { x: i32, y: i32 },
    Write(String),
    ChangeColor(i32, i32, i32),
}
```

示例 6-2：一个 Message 枚举，其每个变量都存储不同数量和类型的值

此枚举有四种不同类型的变体：

* Quit 根本没有与之关联的数据。
* Move 有命名字段，就像结构一样。
* Write 包含单个字符串。
* ChangeColor 包含三个 i32 值。

定义带有变量的枚举（如示例 6-2 中所示）类似于定义不同类型的结构体定义，只是枚举不使用 struct 关键字，并且所有变体都归入 Message 类型。以下结构体可以保存前面枚举变量保存的相同数据：

```rust
struct QuitMessage; // unit struct
struct MoveMessage {
    x: i32,
    y: i32,
}
struct WriteMessage(String); // tuple struct
struct ChangeColorMessage(i32, i32, i32); // tuple struct
```

但是如果我们使用不同的结构体，每个结构体都有自己的类型，我们就无法像示例 6-2 中定义的 Message 枚举那样轻松地定义一个函数来接收任何这些类型的消息，因为它只有一种类型。

枚举和结构之间还有一个相似之处：就像我们能够使用 impl 在结构上定义方法一样，我们也能够在枚举上定义方法。以下是我们可以在我们的 Message 枚举上定义名为 call 的方法：

```rust
impl Message {
    fn call(&self) {
        // method body would be defined here
    }
}
let m = Message::Write(String::from("hello"));
m.call();
```

方法主体将使用 self 来获取我们调用该方法时的值。在此示例中，我们创建了一个变量 m，其值为 `Message::Write(String::from("hello"))`，当 m.call() 运行时，self 将会位于 call 方法主体中。

让我们看一下标准库中另一个非常常见且有用的枚举：Option。

### Option Enum 及其相对于 Null 值的优势