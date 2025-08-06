## 附录 A：关键字

以下列表包含 Rust 语言为当前或未来使用而保留的关键字。因此，它们不能用作标识符（除了我们将在“[原始标识符](#原始标识符)”部分讨论的原始标识符）。标识符是函数、变量、参数、结构字段、模块、包、常量、宏、静态值、属性、类型、特征或生命周期的名称。

## 当前使用的关键字

以下是当前使用的关键字列表及其功能描述。

- as - 执行原始转换，消除包含项目的特定特征的歧义，或在 use 语句中重命名项目
- async - 返回 Future 而不是阻止当前线程 (Future 表示一个可能还没有计算完成的值，或者是一个可以在将来某个时刻完成的操作。)
- await - 暂停执行，直到 Future 的结果准备就绪
- break - 立即退出循环
- const - 定义常量项目或常量原始指针
- continue - 继续进行下一次循环迭代
- crate - 在模块路径中，引用 crate 根
- dyn - 动态分派到特征对象
- else - if 和 if let 控制流构造的回退
- enum - 定义枚举
- extern - 链接外部函数或变量
- false - 布尔 false 文字
- fn - 定义函数或函数指针类型
- for - 循环遍历迭代器中的项目，实现特征或指定更高级别的生命周期
- if - 根据条件表达式的结果进行分支
- impl - 实现固有或特征功能
- in - for 循环语法的一部分
- let - 绑定变量
- loop - 无条件循环
- match - 将值与模式匹配
- mod - 定义 module
- move - 使闭包拥有其所有捕获的所有权
- mut - 表示引用、原始指针或模式绑定中的可变性
- pub - 表示结构字段、impl 块或模块中的公共可见性
- ref - 通过引用绑定
- return - 从函数返回
- Self - 我们正在定义或实现的类型的类型别名
- self - 方法主体或当前模块
- static - 全局变量或持续整个程序执行的生命周期
- struct - 定义结构
- super - 当前模块的父模块
- trait - 定义特征
- true - 布尔真文字
- type - 定义类型别名或关联类型
- union - 定义[联合](https://doc.rust-lang.org/reference/items/unions.html)；仅在联合声明中使用时才是关键字
- unsafe - 表示不安全的代码、函数、特征或实现
- use - 将符号带入范围
- where - 表示约束类型的子句
- while - 根据表达式的结果有条件地循环

## 为将来使用而保留的关键字

以下关键字尚不具备任何功能，但由 Rust 保留以供将来使用。

- abstract
- become
- box
- do
- final
- macro
- override
- priv
- try
- typeof
- unsized
- virtual
- yield

## 原始标识符

原始标识符是一种语法，它允许你在通常不允许使用关键字的地方使用关键字。你可以通过在关键字前加上 `r#` 来使用原始标识符。

例如，match 是一个关键字。如果你尝试编译以下使用 match 作为其名称的函数：

文件名：src/main.rs

```rust
fn match(needle: &str, haystack: &str) -> bool {
    haystack.contains(needle)
}
```

你将收到此错误：

```shell
error: expected identifier, found keyword `match`
 --> src/main.rs:4:4
  |
4 | fn match(needle: &str, haystack: &str) -> bool {
  |    ^^^^^ expected identifier, found keyword
```

错误表明你不能使用关键字 match 作为函数标识符。要将 match 用作函数名，你需要使用原始标识符语法，如下所示：

文件名：src/main.rs

```rust
fn r#match(needle: &str, haystack: &str) -> bool {
    haystack.contains(needle)
}

fn main() {
    assert!(r#match("foo", "foobar"));
}
```

此代码将编译而不会出现任何错误。请注意函数定义中函数名称的 `r#` 前缀以及在 main 中调用该函数的位置。

原始标识符允许你使用你选择的任何单词作为标识符，即使该单词恰好是保留关键字。这让我们可以更自由地选择标识符名称，并让我们能够与使用这些单词不是关键字的语言编写的程序集成。此外，原始标识符允许你使用与当前依赖项使用的 Rust 版本不同的版本编写的库。例如，try 在 2015 版中不是关键字，但在 2018 版中是关键字。如果你依赖使用 2015 版编写且具有 try 函数的库，则需要使用原始标识符语法（在本例中为 `r#try`）从 2018 版代码中调用该函数。有关版本的更多信息，请参阅[附录 E](./appendix-e.md)。
