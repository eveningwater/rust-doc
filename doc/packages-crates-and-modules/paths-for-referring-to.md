## 引用模块树中项目的路径

为了向 Rust 展示在模块树中查找项目的位置，我们使用路径的方式与在文件系统中导航时使用路径的方式相同。要调用函数，我们需要知道它的路径。

路径可以采用两种形式：

- 绝对路径是从依赖箱根开始的完整路径；对于来自外部依赖箱的代码，绝对路径以依赖箱名称开头，对于来自当前依赖箱的代码，绝对路径以文字依赖箱开头。
- 相对路径从当前模块开始，并使用当前模块中的 self、super 或标识符。

绝对路径和相对路径后面都跟有一个或多个用双冒号 (`::`) 分隔的标识符。

回到示例 7-1，假设我们想要调用 add_to_waitlist 函数。这等同于问：add_to_waitlist 函数的路径是什么？示例 7-3 包含示例 7-1，但删除了一些模块和函数。

我们将展示两种从依赖箱根中定义的新函数 eat_at_restaurant 调用 add_to_waitlist 函数的方法。这些路径是正确的，但还有另一个问题会阻止此示例按原样编译。我们稍后会解释原因。

eat_at_restaurant 函数是我们库依赖箱的公共 API 的一部分，因此我们用 pub 关键字标记它。在“[使用 pub 关键字公开路径](#使用-pub-关键字公开路径)”部分，我们将更详细地介绍 pub。

文件名:lib.rs

```rust
mod front_of_house {
    mod hosting {
        fn add_to_waitlist() {}
    }
}

pub fn eat_at_restaurant() {
    // 绝对路径
    crate::front_of_house::hosting::add_to_waitlist();

    // 相对路径
    front_of_house::hosting::add_to_waitlist();
}
```

示例 7-3：使用绝对路径和相对路径调用 add_to_waitlist 函数

第一次在 eat_at_restaurant 中调用 add_to_waitlist 函数时，我们使用绝对路径。add_to_waitlist 函数与 eat_at_restaurant 在同一个依赖箱中定义，这意味着我们可以使用 `crate` 关键字来开始绝对路径。然后，我们包含每个连续的模块，直到我们到达 add_to_waitlist。你可以想象一个具有相同结构的文件系统：我们指定路径 /front_of_house/hosting/add_to_waitlist 来运行 add_to_waitlist 程序；使用依赖箱名称从依赖箱根开始就像使用 `/` 从 shell 中的文件系统根开始一样。

第二次在 eat_at_restaurant 中调用 add_to_waitlist 时，我们使用相对路径。路径以 front_of_house 开头，这是在模块树的同一级别定义的模块的名称，与 eat_at_restaurant 相同。此处文件系统等效项将使用路径 front_of_house/hosting/add_to_waitlist。以模块名称开头表示路径是相对的。

选择使用相对路径还是绝对路径取决于你的项目，并且取决于你是否更有可能将项目定义代码与使用该项目的代码分开移动或一起移动。例如，如果我们将 front_of_house 模块和 eat_at_restaurant 函数移动到名为 customer_experience 的模块中，我们需要更新 add_to_waitlist 的绝对路径，但相对路径仍然有效。但是，如果我们将 eat_at_restaurant 函数单独移动到名为 dining 的模块中，add_to_waitlist 调用的绝对路径将保持不变，但相对路径需要更新。我们通常倾向于指定绝对路径，因为我们更有可能希望彼此独立地移动代码定义和项目调用。

让我们尝试编译示例 7-3，并找出它无法编译的原因！我们得到的错误如示例 7-4 所示。

```rust
$ cargo build
   Compiling restaurant v0.1.0 (file:///projects/restaurant)
error[E0603]: module `hosting` is private
 --> src/lib.rs:9:28
  |
9 |     crate::front_of_house::hosting::add_to_waitlist();
  |                            ^^^^^^^  --------------- function `add_to_waitlist` is not publicly re-exported
  |                            |
  |                            private module
  |
note: the module `hosting` is defined here
 --> src/lib.rs:2:5
  |
2 |     mod hosting {
  |     ^^^^^^^^^^^

error[E0603]: module `hosting` is private
  --> src/lib.rs:12:21
   |
12 |     front_of_house::hosting::add_to_waitlist();
   |                     ^^^^^^^  --------------- function `add_to_waitlist` is not publicly re-exported
   |                     |
   |                     private module
   |
note: the module `hosting` is defined here
  --> src/lib.rs:2:5
   |
2  |     mod hosting {
   |     ^^^^^^^^^^^

For more information about this error, try `rustc --explain E0603`.
error: could not compile `restaurant` (lib) due to 2 previous errors
```

示例 7-4：构建示例 7-3 中的代码时出现的编译器错误

错误消息表明模块 hosting 是私有的。换句话说，我们有 hosting 模块和 add_to_waitlist 函数的正确路径，但 Rust 不允许我们使用它们，因为它无权访问私有部分。在 Rust 中，所有项目（函数、方法、结构、枚举、模块和常量）默认对父模块都是私有的。如果要将函数或结构等项目设为私有，请将其放在模块中。

父模块中的项目不能使用子模块内的私有项目，但子模块中的项目可以使用其祖先模块中的项目。这是因为子模块包装并隐藏了它们的实现细节，但子模块可以看到它们定义的上下文。继续我们的比喻，将隐私规则想象成餐厅的后台办公室：那里发生的事情对餐厅顾客来说是私密的，但办公室经理可以看到和做他们经营的餐厅里的一切。

Rust 选择让模块系统以这种方式运行，以便隐藏内部实现细节是默认的。这样，你就知道可以更改内部代码的哪些部分而不会破坏外部代码。但是，Rust 确实允许你使用 pub 关键字将某项公开，从而将子模块代码的内部部分公开给外部祖先模块。

### 使用 pub 关键字公开路径

让我们回到示例 7-4 中提示 hosting 模块是私有的错误。我们希望父模块中的 eat_at_restaurant 函数能够访问子模块中的 add_to_waitlist 函数，因此我们用 pub 关键字标记 hosting 模块，如示例 7-5 所示。

文件名: src/lib.rs

```rust
mod front_of_house {
    pub mod hosting {
        fn add_to_waitlist() {}
    }
}

pub fn eat_at_restaurant() {
    // 绝对路径
    crate::front_of_house::hosting::add_to_waitlist();

    // 相对路径
    front_of_house::hosting::add_to_waitlist();
}
```

示例 7-5：将 hosting 模块声明为 pub 以便在 eat_at_restaurant 中使用它

不幸的是，示例 7-5 中的代码仍然会导致编译器错误，如示例 7-6 所示。

```rust
$ cargo build
   Compiling restaurant v0.1.0 (file:///projects/restaurant)
error[E0603]: function `add_to_waitlist` is private
 --> src/lib.rs:9:37
  |
9 |     crate::front_of_house::hosting::add_to_waitlist();
  |                                     ^^^^^^^^^^^^^^^ private function
  |
note: the function `add_to_waitlist` is defined here
 --> src/lib.rs:3:9
  |
3 |         fn add_to_waitlist() {}
  |         ^^^^^^^^^^^^^^^^^^^^

error[E0603]: function `add_to_waitlist` is private
  --> src/lib.rs:12:30
   |
12 |     front_of_house::hosting::add_to_waitlist();
   |                              ^^^^^^^^^^^^^^^ private function
   |
note: the function `add_to_waitlist` is defined here
  --> src/lib.rs:3:9
   |
3  |         fn add_to_waitlist() {}
   |         ^^^^^^^^^^^^^^^^^^^^

For more information about this error, try `rustc --explain E0603`.
error: could not compile `restaurant` (lib) due to 2 previous errors
```

示例 7-6：构建示例 7-5 中的代码时出现的编译器错误

发生了什么？在 mod hosting 前面添加 pub 关键字会使模块公开。通过此更改，如果我们可以访问 front_of_house，我们就可以访问 hosting。但 hosting 的内容仍然是私有的；将模块公开并不会使其内容公开。模块上的 pub 关键字只允许其祖先模块中的代码引用它，而不能访问其内部代码。因为模块是容器，所以仅将模块公开我们能做的事情不多；我们需要更进一步，选择将模块中的一个或多个项目也公开。

示例 7-6 中的错误表明 add_to_waitlist 函数是私有的。隐私规则适用于结构、枚举、函数和方法以及模块。

让我们通过在定义前添加 pub 关键字将 add_to_waitlist 函数公开，如示例 7-7 所示。

文件名:src/lib.rs

```rust
mod front_of_house {
    pub mod hosting {
        pub fn add_to_waitlist() {}
    }
}

pub fn eat_at_restaurant() {
    // 绝对路径
    crate::front_of_house::hosting::add_to_waitlist();

    // 相对路径
    front_of_house::hosting::add_to_waitlist();
}
```

示例 7-7：向 mod hosting 和 fn add_to_waitlist 添加 pub 关键字让我们可以从 eat_at_restaurant 调用该函数

现在代码可以编译了！要了解为什么添加 pub 关键字可以让我们在隐私规则方面在 eat_at_restaurant 中使用这些路径，让我们看看绝对路径和相对路径。

在绝对路径中，我们从 `crate` 开始，这是我们依赖箱模块树的根。front_of_house 模块在依赖箱根中定义。虽然 front_of_house 不是公开的，但由于 eat_at_restaurant 函数与 front_of_house 定义在同一个模块中（即 eat_at_restaurant 和 front_of_house 是兄弟），我们可以从 eat_at_restaurant 引用 front_of_house。接下来是标记为 pub 的 hosting 模块。我们可以访问 hosting 的父模块，因此我们可以访问 hosting。最后，add_to_waitlist 函数标记为 pub，我们可以访问其父模块，因此此函数调用有效！

在相对路径中，除了第一步之外，其逻辑与绝对路径相同：路径不是从依赖箱根开始，而是从 front_of_house 开始。front_of_house 模块与 eat_at_restaurant 定义在同一个模块中，因此从定义 eat_at_restaurant 的模块开始的相对路径是有效的。然后，由于 hosting 和 add_to_waitlist 标记为 pub，因此路径的其余部分有效，并且此函数调用有效！

如果你计划共享库 crate，以便其他项目可以使用你的代码，则你的公共 API 是你与依赖箱用户的合同，它决定了他们如何与你的代码交互。在管理公共 API 的更改方面有很多注意事项，以使人们更容易依赖你的 crate。这些注意事项超出了本文档的范围；如果你对这个主题感兴趣，请参阅 [Rust API 指南](https://rust-lang.github.io/api-guidelines/)。

> **包含二进制文件和库的软件包的最佳实践**
>
> 我们提到，软件包可以同时包含 src/main.rs 二进制包根和 src/lib.rs 库包根，并且默认情况下两个包都具有软件包名称。通常，具有包含库和二进制包的这种模式的软件包将在二进制包中拥有足够的代码来启动可执行文件，该可执行文件调用库包中的代码。这让其他项目可以从软件包提供的大部分功能中受益，因为库包的代码可以共享。
>
> 模块树应在 src/lib.rs 中定义。然后，可以通过以软件包名称开头的路径在二进制包中使用任何公共项目。二进制包成为库包的用户，就像完全外部的包使用库包一样：它只能使用公共 API。这有助于你设计一个好的 API；你不仅是作者，还是客户！
>
> 在第 12 章中，我们将使用包含二进制包和库包的命令行程序演示这种组织实践。

### 以 super 开头的相对路径

通过在路径开头使用 super，我们可以构造从父模块而不是当前模块或包根开始的相对路径。这就像使用 `..` 语法开始文件系统路径一样。使用 super 允许我们引用我们知道在父模块中的项目，当模块与父模块密切相关但父模块可能有一天会移动到模块树的其他位置时，这可以使重新排列模块树更容易。

考虑示例 7-8 中的代码，该代码模拟了厨师修复错误订单并亲自将其带给客户的情况。back_of_house 模块中定义的函数 fix_incorrect_order 通过指定 deliver_order 的路径（以 super 开头）来调用父模块中定义的函数 deliver_order。

文件名：src/lib.rs

```rust
fn deliver_order() {}

mod back_of_house {
    fn fix_incorrect_order() {
        cook_order();
        super::deliver_order();
    }

    fn cook_order() {}
}
```

示例 7-8：使用以 super 开头的相对路径调用函数

fix_incorrect_order 函数位于 back_of_house 模块中，因此我们可以使用 super 转到 back_of_house 的父模块，在本例中是 crate，即根。从那里，我们寻找 deliver_order 并找到它。成功！我们认为，如果我们决定重新组织 crate 的模块树，back_of_house 模块和 deliver_order 函数可能会保持相同的相互关系并一起移动。因此，我们使用 super，这样如果此代码被移动到其他模块，我们将来更新代码的地方就会更少。

### 使结构体和枚举公开

我们还可以使用 pub 将结构体和枚举指定为公共的，但在结构体和枚举中使用 pub 还有一些额外的细节。如果我们在结构体定义之前使用 pub，我们将结构体设为公共的，但结构的字段仍将是私有的。我们可以根据具体情况将每个字段设为公共的或不设为公共的。在示例 7-9 中，我们定义了一个公共的 back_of_house::Breakfast 结构体，它有一个公共的 toast 字段和一个私有的 seasonal_fruit 字段。这模拟了餐厅中的情况，顾客可以选择随餐附带的面包类型，但厨师根据当季和库存情况决定搭配餐点的水果。可用的水果变化很快，因此顾客无法选择水果，甚至无法看到他们会得到哪种水果。

文件名：src/lib.rs

```rust
mod back_of_house {
    pub struct Breakfast {
        pub toast: String,
        seasonal_fruit: String,
    }

    impl Breakfast {
        pub fn summer(toast: &str) -> Breakfast {
            Breakfast {
                toast: String::from(toast),
                seasonal_fruit: String::from("peaches"),
            }
        }
    }
}

pub fn eat_at_restaurant() {
    // 订购一份夏季早餐，包括黑麦吐司
   let mut meal = back_of_house::Breakfast::summer("Rye");
    // 改变我们想要的面包的想法
    meal.toast = String::from("Wheat");
    println!("I'd like {} toast please", meal.toast);
    // 如果取消注释，下一行将无法编译；我们不允许
    // 查看或修改餐点附带的时令水果
    // meal.seasonal_fruit = String::from("blueberries");
}
```

示例 7-9：具有一些公共字段和一些私有字段的结构体

由于 back_of_house::Breakfast 结构中的 toast 字段是公共的，因此在 eat_at_restaurant 中，我们可以使用点符号写入和读取 toast 字段。请注意，我们不能在 eat_at_restaurant 中使用 seasonal_fruit 字段，因为 seasonal_fruit 是私有的。尝试取消注释修改 seasonal_fruit 字段值的行，看看会得到什么错误！

另请注意，由于 back_of_house::Breakfast 有一个私有字段，因此该结构需要提供一个公共关联函数来构造 Breakfast 的实例（我们在这里将其命名为 summer）。如果 Breakfast 没有这样的函数，我们就无法在 eat_at_restaurant 中创建 Breakfast 的实例，因为我们无法设置 eat_at_restaurant 中私有 seasonal_fruit 字段的值。

相反，如果我们将枚举设为公共，则其所有变体都是公共的。我们只需要在 enum 关键字前加上 pub，如示例 7-10 所示。

文件名： src/lib.rs

```rust
mod back_of_house {
    pub enum Appetizer {
        Soup,
        Salad,
    }
}

pub fn eat_at_restaurant() {
    let order1 = back_of_house::Appetizer::Soup;
    let order2 = back_of_house::Appetizer::Salad;
}
```

示例 7-10：将枚举指定为公共会使其所有变量都变为公共

因为我们将 Appetizer 枚举设为公共，所以我们可以在 eat_at_restaurant 中使用 Soup 和 Salad 变体。

枚举的用途不大，除非它们的变体是公共的；在每种情况下都必须用 pub 注释所有枚举变体会很烦人，因此枚举变体的默认值是公共的。结构体通常在其字段不公开的情况下很有用，因此结构体字段遵循一般规则，即默认情况下所有内容都是私有的，除非用 pub 注释。

还有一种涉及 pub 的情况我们还没有介绍，那就是我们的最后一个模块系统功能：use 关键字。我们将首先介绍 use 本身，然后介绍如何结合使用 pub 和 use。
