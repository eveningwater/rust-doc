## 在哈希映射中存储键值对

我们的最后一个常见集合是*哈希映射*。类型`HashMap<K, V>`使用*哈希函数*存储类型为`K`的键到类型为`V`的值的映射，该函数决定了如何将这些键和值放入内存中。许多编程语言都支持这种数据结构，但它们通常使用不同的名称，如*哈希*、_映射_、_对象_、_哈希表_、*字典*或*关联数组*等。

当你想要通过键而不是索引查找数据时，哈希映射非常有用，这与向量不同，哈希映射的键可以是任何类型。例如，在游戏中，你可以使用哈希映射来跟踪每个队伍的得分，其中每个键是队伍的名称，值是每个队伍的得分。给定一个队伍名称，你可以检索其得分。

我们将在本节中介绍哈希映射的基本 API，但标准库中定义在`HashMap<K, V>`上的函数中还隐藏着更多好东西。一如既往，请查阅标准库文档以获取更多信息。

## 创建新的哈希映射

创建空哈希映射的一种方法是使用`new`并通过`insert`添加元素。在示例 8-20 中，我们跟踪两个队伍的得分，队伍名称分别是*Blue*和*Yellow*。Blue 队开始有 10 分，Yellow 队开始有 50 分。

```rust
fn main() {
    use std::collections::HashMap;

    let mut scores = HashMap::new();

    scores.insert(String::from("Blue"), 10);
    scores.insert(String::from("Yellow"), 50);
}
```

示例 8-20 创建新的哈希映射并插入一些键和值

注意，我们首先需要从标准库的集合部分`use`导入`HashMap`。在我们的三个常见集合中，这个是最不常用的，所以它不包含在预导入的特性中。哈希映射也从标准库获得的支持较少；例如，没有内置的宏来构造它们。

就像向量一样，哈希映射将数据存储在堆上。这个`HashMap`有类型为`String`的键和类型为`i32`的值。像向量一样，哈希映射是同质的：所有的键必须具有相同的类型，所有的值也必须具有相同的类型。

## 访问哈希映射中的值

我们可以通过向`get`方法提供键来从哈希映射中获取值，如示例 8-21 所示。

```rust
fn main() {
    use std::collections::HashMap;

    let mut scores = HashMap::new();

    scores.insert(String::from("Blue"), 10);
    scores.insert(String::from("Yellow"), 50);

    let team_name = String::from("Blue");
    let score = scores.get(&team_name).copied().unwrap_or(0);
}
```

示例 8-21 访问存储在哈希映射中的 Blue 队得分

这里，`score`将具有与 Blue 队关联的值，结果将是`10`。`get`方法返回一个`Option<&V>`；如果哈希映射中没有该键的值，`get`将返回`None`。这个程序通过调用`copied`来获取`Option<i32>`而不是`Option<&i32>`，然后使用`unwrap_or`在`scores`没有该键的条目时将`score`设置为零。

我们可以使用`for`循环以类似于向量的方式遍历哈希映射中的每个键值对：

```rust
fn main() {
    use std::collections::HashMap;

    let mut scores = HashMap::new();

    scores.insert(String::from("Blue"), 10);
    scores.insert(String::from("Yellow"), 50);

    for (key, value) in &scores {
        println!("{key}: {value}");
    }
}
```

这段代码将以任意顺序打印每个对：

```rust
Yellow: 50
Blue: 10
```

## 哈希映射和所有权

对于实现了`Copy`特性的类型，如`i32`，值被复制到哈希映射中。对于拥有所有权的值，如`String`，值将被移动，哈希映射将成为这些值的所有者，如示例 8-22 所示。

```rust
fn main() {
    use std::collections::HashMap;

    let field_name = String::from("Favorite color");
    let field_value = String::from("Blue");

    let mut map = HashMap::new();
    map.insert(field_name, field_value);
    // field_name and field_value are invalid at this point, try using them and
    // see what compiler error you get!
}
```

示例 8-22 展示一旦插入，键和值就由哈希映射拥有

在变量`field_name`和`field_value`通过调用`insert`移动到哈希映射后，我们无法使用它们。

如果我们将值的引用插入到哈希映射中，值不会被移动到哈希映射中。引用指向的值必须至少在哈希映射有效的时间内保持有效。我们将在第 10 章的["使用生命周期验证引用"]中更多地讨论这些问题。

## 更新哈希映射

虽然键值对的数量是可增长的，但每个唯一的键一次只能有一个与之关联的值（反之则不然：例如，Blue 队和 Yellow 队都可以在`scores`哈希映射中存储值`10`）。

当你想要更改哈希映射中的数据时，你必须决定如何处理键已经分配了值的情况。你可以用新值替换旧值，完全忽略旧值。你可以保留旧值并忽略新值，只在键*没有*已有值时添加新值。或者你可以合并旧值和新值。让我们看看如何做每一种！

### 覆盖值

如果我们在哈希映射中插入一个键和一个值，然后插入相同的键和不同的值，与该键关联的值将被替换。即使示例 8-23 中的代码调用了两次`insert`，哈希映射也只会包含一个键值对，因为我们两次都为 Blue 队的键插入了值。

```rust
fn main() {
    use std::collections::HashMap;

    let mut scores = HashMap::new();

    scores.insert(String::from("Blue"), 10);
    scores.insert(String::from("Blue"), 25);

    println!("{scores:?}");
}
```

示例 8-23 替换存储在特定键中的值

这段代码将打印`{"Blue": 25}`。原始值`10`已被覆盖。

### 只在键没有值时添加键和值

检查哈希映射中是否已经存在特定键及其值，然后采取以下行动是很常见的：如果键确实存在于哈希映射中，现有值应保持不变；如果键不存在，则插入它和一个值。

哈希映射有一个特殊的 API，称为`entry`，它接受你想要检查的键作为参数。`entry`方法的返回值是一个名为`Entry`的枚举，表示可能存在或不存在的值。假设我们想要检查 Yellow 队的键是否有与之关联的值。如果没有，我们想要插入值`50`，对 Blue 队也一样。使用`entry` API，代码如示例 8-24 所示。

```rust
fn main() {
    use std::collections::HashMap;

    let mut scores = HashMap::new();
    scores.insert(String::from("Blue"), 10);

    scores.entry(String::from("Yellow")).or_insert(50);
    scores.entry(String::from("Blue")).or_insert(50);

    println!("{scores:?}");
}
```

示例 8-24 使用`entry`方法仅在键没有值时插入

`Entry`上的`or_insert`方法被定义为返回对应`Entry`键的值的可变引用，如果该键存在；如果不存在，则插入参数作为该键的新值，并返回对新值的可变引用。这种技术比我们自己编写逻辑要干净得多，而且，它与借用检查器配合得更好。

运行示例 8-24 中的代码将打印`{"Yellow": 50, "Blue": 10}`。第一次调用`entry`将为 Yellow 队插入键，值为`50`，因为 Yellow 队还没有值。第二次调用`entry`不会改变哈希映射，因为 Blue 队已经有值`10`。

### 基于旧值更新值

哈希映射的另一个常见用例是查找键的值，然后基于旧值更新它。例如，示例 8-25 展示了计算文本中每个单词出现次数的代码。我们使用哈希映射，其中单词作为键，并增加值来跟踪我们看到该单词的次数。如果是我们第一次看到一个单词，我们将首先插入值`0`。

```rust
fn main() {
    use std::collections::HashMap;

    let text = "hello world wonderful world";

    let mut map = HashMap::new();

    for word in text.split_whitespace() {
        let count = map.entry(word).or_insert(0);
        *count += 1;
    }

    println!("{map:?}");
}
```

示例 8-25 使用存储单词和计数的哈希映射来计算单词出现次数

这段代码将打印`{"world": 2, "hello": 1, "wonderful": 1}`。你可能会看到相同的键值对以不同的顺序打印：回想一下["访问哈希映射中的值"](#访问哈希映射中的值)，遍历哈希映射是以任意顺序进行的。

`split_whitespace`方法返回一个迭代器，它遍历`text`值中由空格分隔的子切片。`or_insert`方法返回对指定键的值的可变引用（`&mut V`）。这里，我们将该可变引用存储在`count`变量中，因此为了给该值赋值，我们必须首先使用星号（`*`）解引用`count`。可变引用在`for`循环结束时超出作用域，因此所有这些更改都是安全的，并且符合借用规则。

## Hashing Functions

默认情况下，`HashMap`使用一种称为*SipHash*的哈希函数，它可以提供对涉及哈希表的拒绝服务（DoS）攻击的抵抗力[siphash](https://en.wikipedia.org/wiki/SipHash)。这不是最快的哈希算法，但性能下降换来的更好的安全性是值得的。如果你分析你的代码并发现默认哈希函数对你的目的来说太慢，你可以通过指定不同的哈希器来切换到另一个函数。*哈希器*是实现`BuildHasher`特性的类型。我们将在第 10 章中讨论特性及其实现。你不一定要从头开始实现自己的哈希器；[crates.io](https://crates.io/)有其他 Rust 用户共享的库，提供实现许多常见哈希算法的哈希器。

## 总结

向量、字符串和哈希映射将提供大量在程序中需要存储、访问和修改数据时必要的功能。以下是一些你现在应该能够解决的练习：

1. 给定一个整数列表，使用向量并返回列表的中位数（排序后，中间位置的值）和众数（出现最频繁的值；哈希映射在这里会很有帮助）。
2. 将字符串转换为 Pig Latin。每个单词的第一个辅音字母被移到单词的末尾，并添加上*ay*，所以*first*变成*irst-fay*。以元音开头的单词则在末尾添加*hay*（*apple*变成*apple-hay*）。请记住 UTF-8 编码的细节！
3. 使用哈希映射和向量，创建一个文本界面，允许用户将员工名字添加到公司的部门中；例如，"Add Sally to Engineering"或"Add Amir to Sales"。然后让用户按部门检索部门中的所有人员或按部门检索公司中的所有人员，按字母顺序排序。

标准库 API 文档描述了向量、字符串和哈希映射具有的方法，这些方法对这些练习会有帮助！

我们正在进入更复杂的程序，其中操作可能会失败，所以现在是讨论错误处理的完美时机。我们将在下一章讨论这个问题！
