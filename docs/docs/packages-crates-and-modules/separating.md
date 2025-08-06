# 将模块分成不同的文件

到目前为止，本章中的所有示例都在一个文件中定义了多个模块。当模块变得庞大时，你可能希望将它们的定义移到单独的文件中，以便更容易地浏览代码。

例如，让我们从 7-17 示例中包含多个餐厅模块的代码开始。我们将把模块提取到文件中，而不是将所有模块都定义在 crate 根文件中。在这个例子中，crate 根文件是 src/lib.rs，但这个过程同样适用于 crate 根文件为 src/main.rs 的二进制 crate。

首先，我们将 front_of_house 模块提取到它自己的文件中。移除 front_of_house 模块大括号内的代码，只保留 mod front_of_house; 声明，使 src/lib.rs 包含 7-21 示例所示的代码。注意，在我们创建 src/front_of_house.rs 文件（见 7-22 示例）之前，这段代码无法编译。

文件名：src/lib.rs：

```rust
mod front_of_house;

pub use crate::front_of_house::hosting;

pub fn eat_at_restaurant() {
    hosting::add_to_waitlist();
}
```

7-21 示例：声明 front_of_house 模块，其主体将在 src/front_of_house.rs 文件中

接下来，将大括号中的代码放入一个名为 src/front_of_house.rs 的新文件中，如 7-22 示例所示。编译器之所以知道要在这个文件中查找，是因为它在 crate 根文件中遇到了 front_of_house 的模块声明。

文件名：src/front_of_house.rs：

```rust
pub mod hosting {
    pub fn add_to_waitlist() {}
}
```

7-22 示例：src/front_of_house.rs 文件中 front_of_house 模块内的定义

注意，在你的模块树中，只需要用 mod 声明加载一次文件。一旦编译器知道该文件是项目的一部分（并且知道代码在模块树中的位置，因为你放置 mod 语句的位置），项目中的其他文件应该使用声明时的路径来引用该文件的代码，具体可参考“[在模块树中引用项的路径](./paths-for-referring-to)”一节。换句话说，mod 并不是你在其他编程语言中见过的“include”操作。

接下来，我们将 hosting 模块提取到它自己的文件中。这个过程略有不同，因为 hosting 是 front_of_house 的子模块，而不是根模块的子模块。我们会将 hosting 的文件放在一个以其祖先命名的新目录中，在本例中为 src/front_of_house。

要开始移动 hosting，我们将 src/front_of_house.rs 修改为只包含 hosting 模块的声明：

文件名：src/front_of_house.rs：

```rust
pub mod hosting;
```

然后我们创建 src/front_of_house 目录，并在其中新建 hosting.rs 文件，包含 hosting 模块中的定义：

文件名：src/front_of_house/hosting.rs：

```rust
pub fn add_to_waitlist() {}
```

如果我们把 hosting.rs 放在 src 目录下，编译器会认为 hosting.rs 的代码属于 crate 根中声明的 hosting 模块，而不是 front_of_house 的子模块。编译器根据模块代码应在的文件规则，使目录和文件结构更贴近模块树。

> # 备用文件路径
>
> 到目前为止，我们介绍了 Rust 编译器使用的最惯用的文件路径，但 Rust 也支持一种较旧的文件路径风格。对于在 crate 根中声明的 front_of_house 模块，编译器会在以下位置查找模块代码：
>
> - src/front_of_house.rs（我们介绍的方式）
> - src/front_of_house/mod.rs（较旧风格，仍受支持）
>
> 对于 front_of_house 的子模块 hosting，编译器会在以下位置查找模块代码：
>
> - src/front_of_house/hosting.rs（我们介绍的方式）
> - src/front_of_house/hosting/mod.rs（较旧风格，仍受支持）
>   如果你对同一个模块同时使用两种风格，会导致编译错误。对于同一项目中的不同模块混用两种风格是允许的，但可能会让项目导航变得混乱。
>
> 使用 mod.rs 文件风格的主要缺点是，项目中可能会出现许多名为 mod.rs 的文件，当你同时在编辑器中打开它们时会很困惑。

我们已经将每个模块的代码移到了单独的文件中，模块树保持不变。eat_at_restaurant 函数中的调用无需任何修改即可正常工作，即使定义分布在不同的文件中。随着模块变大，这种技术可以让你将模块迁移到新文件中。

注意，src/lib.rs 中的 pub use crate::front_of_house::hosting 语句也没有改变，use 语句对哪些文件会被编译为 crate 的一部分没有影响。mod 关键字用于声明模块，Rust 会在与模块同名的文件中查找该模块的代码。

## 总结

Rust 允许你将一个包拆分为多个 crate，将一个 crate 拆分为多个模块，这样你就可以在一个模块中引用另一个模块中定义的项。你可以通过指定绝对路径或相对路径来实现。可以用 use 语句将这些路径引入作用域，从而在多次使用该项时使用更短的路径。模块代码默认是私有的，但你可以通过添加 pub 关键字使定义变为公有。

在下一章中，我们将介绍标准库中的一些集合数据结构，你可以在结构良好的代码中使用它们。
