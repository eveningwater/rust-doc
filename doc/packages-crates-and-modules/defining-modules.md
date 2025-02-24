## 定义模块以控制上下文和私有作用域

在本节中，我们将讨论模块和模块系统的其他部分，即路径（允许你命名项目）、将路径纳入范围的 use 关键字以及使项目公开的 pub 关键字。我们还将讨论 as 关键字、外部包和 glob 运算符。

### 模块备忘单

在详细了解模块和路径之前，我们先简要介绍一下模块、路径、use 关键字和 pub 关键字在编译器中的工作方式，以及大多数开发人员如何组织代码。我们将在本章中介绍这些规则的示例，但这里是提醒大家模块如何工作的绝佳参考。

- **从依赖箱根开始**：编译依赖箱时，编译器首先在依赖箱根文件（对于库依赖箱，通常为 src/lib.rs；对于二进制 依赖箱，通常为 src/main.rs）中查找要编译的代码。
- **声明模块**：在依赖箱根文件中，你可以声明新模块；比如，你使用 `mod garden;` 声明了一个“garden”模块。编译器将在以下位置查找模块的代码：
  - 内联，在 mod garden 后面的花括号内替换分号
  - 在文件 src/garden.rs 中
  - 在文件 src/garden/mod.rs 中
- **声明子模块**：在除依赖箱根目录之外的任何文件中，你都可以声明子模块。例如，你可以在 src/garden.rs 中声明 `mod Vegetables;`。编译器将在以下位置在父模块命名的目录中查找子模块的代码：
  - 内联，直接在 mod Vegetables 后面，在花括号内替换分号
  - 在文件 src/garden/vegetables.rs 中
  - 在文件 src/garden/vegetables/mod.rs 中
- **模块中的代码路径**：一旦模块成为依赖箱的一部分，你就可以从同一依赖箱中的任何其他地方引用该模块中的代码，只要隐私规则允许，就可以使用代码路径。例如，`garden vegetables`模块中的 Asparagus 类型可在 依赖箱`::garden::vegetables::Asparagus` 中找到。
- **私有与公共**：默认情况下，模块内的代码对其父模块是私有的。要将模块声明为公共，请使用 `pub mod` 而不是 `mod` 进行声明。要将公共模块中的项目也声明为公共，请在其声明前使用 pub。
- **use 关键字**：在范围内，use 关键字会创建项目的快捷方式以减少长路径的重复。在任何可以引用依赖箱`::garden::vegetables::Asparagus`的范围内，你都可以使用 use 依赖箱`::garden::vegetables::Asparagus` 创建快捷方式；从那时起，你只需编写 Asparagus 即可在范围内使用该类型。

在这里，我们创建一个名为 backyard 的二进制依赖箱来说明这些规则。依赖箱的目录（也称为 backyard）包含以下文件和目录：

```rust
backyard
├── Cargo.lock
├── Cargo.toml
└── src
    ├── garden
    │   └── vegetables.rs
    ├── garden.rs
    └── main.rs
```

在这种情况下，依赖箱根文件是 src/main.rs，它包含：

文件名: src/main.rs:

```rust
use crate::garden::vegetables::Asparagus;

pub mod garden;

fn main() {
    let plant = Asparagus {};
    println!("I'm growing {plant:?}!");
}
```

`pub mod garden;` 行告诉编译器包含它在 src/garden.rs 中找到的代码，即：

文件名: src/garden.rs:

```rust
pub mod vegetables;
```

这里，`pub mod Vegetables;` 表示 `src/garden/vegetables.rs` 中的代码也包含在内。该代码是：

```rust
#[derive(Debug)]
pub struct Asparagus {}
```

现在让我们详细了解这些规则并实际演示它们！

### 将模块中的相关代码分组

模块让我们能够组织依赖箱内的代码，以提高可读性和易于重用性。模块还允许我们控制项目的隐私，因为模块内的代码默认是私有的。私有项目是内部实现细节，不可供外部使用。我们可以选择将模块及其中的项目公开，这样就可以公开它们，以允许外部代码使用和依赖它们。

举个例子，让我们编写一个提供餐厅功能的库依赖箱。我们将定义函数的签名，但将其主体留空，以专注于代码的组织，而不是餐厅的实现。

在餐饮业，餐厅的某些部分被称为前台，其他部分被称为后台。前台是顾客所在的地方；这包括主人接待顾客、服务员接受订单和付款以及调酒师调制饮料的地方。后台是厨师和厨师在厨房工作、洗碗工打扫卫生以及经理进行行政工作的地方。

要以这种方式构建我们的包，我们可以将其功能组织成嵌套模块。通过运行 `cargo new restaurant --lib` 创建一个名为 restaurant 的新库。然后将示例 7-1 中的代码输入到 src/lib.rs 中，以定义一些模块和函数签名；此代码是前台部分。

文件名：src/lib.rs:

```rust
mod front_of_house {
    mod hosting {
        fn add_to_waitlist() {}

        fn seat_at_table() {}
    }

    mod serving {
        fn take_order() {}

        fn serve_order() {}

        fn take_payment() {}
    }
}
```

示例 7-1：front_of_house 模块包含其他模块，这些模块又包含函数

我们用 mod 关键字定义一个模块，后面跟着模块的名称（在本例中为 front_of_house）。然后模块的主体放在花括号内。在模块内部，我们可以放置其他模块，在本例中就是 hosting 和 services 模块。模块还可以保存其他项目的定义，例如结构、枚举、常量、特征以及（如示例 7-1 所示）函数。

通过使用模块，我们可以将相关定义分组在一起并指出它们相关的原因。使用此代码的程序员可以根据组浏览代码，而不必通读所有定义，从而更容易找到与它们相关的定义。向此代码添加新功能的程序员会知道将代码放在哪里以保持程序井井有条。

前面我们提到 src/main.rs 和 src/lib.rs 称为依赖箱根。它们之所以这样命名，是因为这两个文件中的任何一个的内容都会在依赖箱模块结构的根（称为模块树）中形成一个名为依赖箱的模块。

示例 7-2 展示了示例 7-1 中的结构的模块树。

```rust
crate
 └── front_of_house
     ├── hosting
     │   ├── add_to_waitlist
     │   └── seat_at_table
     └── serving
         ├── take_order
         ├── serve_order
         └── take_payment
```

示例 7-2：示例 7-1 中代码的模块树

这棵树显示了一些模块如何嵌套在其他模块中；例如：`hosting`嵌套在 front_of_house 中。树还显示一些模块是兄弟模块，这意味着它们在同一个模块中定义；`hosting`和`serving`是 front_of_house 中定义的兄弟模块。如果模块 A 包含在模块 B 中，我们说模块 A 是模块 B 的子模块，模块 B 是模块 A 的父模块。请注意，整个模块树都植根于名为依赖箱的隐式模块下。

模块树可能会让你想起计算机上的文件系统目录树；这是一个非常恰当的比较！就像文件系统中的目录一样，你可以使用模块来组织代码。就像目录中的文件一样，我们需要一种方法来查找我们的模块。