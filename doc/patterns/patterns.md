## 模式与匹配

模式是 Rust 中一种特殊的语法，用于匹配复杂和简单类型的结构。将模式与 `match` 表达式和其他构造结合使用，可以更好地控制程序的控制流。模式由以下一些组合构成：

- 字面量
- 解构数组、枚举、结构体或元组
- 变量
- 通配符
- 占位符

一些模式示例包括 `x`、`(a, 3)` 和 `Some(Color::Red)`。在模式有效的上下文中，这些组件描述了数据的形状。然后，我们的程序将值与模式进行匹配，以确定它是否具有正确的数据形状来继续运行特定的代码。

要使用模式，我们将其与某个值进行比较。如果模式与值匹配，我们将在代码中使用该值的各个部分。回想第 6 章中使用模式的 `match` 表达式，例如硬币分类机的例子。如果值符合模式的形状，我们就可以使用命名部分。如果不符合，与模式关联的代码将不会运行。

本章是关于模式所有内容的参考。我们将介绍模式的有效使用位置、可驳斥模式和不可驳斥模式之间的区别，以及你可能会看到的不同类型的模式语法。在本章结束时，你将知道如何使用模式以清晰的方式表达许多概念。
