## 使用迭代器处理一系列项

迭代器模式允许你依次对一系列项执行某些任务。迭代器负责迭代每个项并确定序列何时结束的逻辑。当你使用迭代器时，你不必自己重新实现该逻辑。

在 Rust 中，迭代器是惰性的，这意味着除非你调用消耗迭代器以使用它的方法，否则它们不会产生任何效果。例如，示例 13-10 中的代码通过调用在 `Vec<T>` 上定义的 `iter` 方法，创建了一个向量 `v1` 中项的迭代器。这段代码本身并没有做任何有用的事情。

Filename: src/main.rs:

```rust
fn main() {
    let v1 = vec![1, 2, 3];

    let v1_iter = v1.iter();
}
```

Listing 13-10: Creating an iterator

迭代器存储在 `v1_iter` 变量中。一旦创建了迭代器，我们可以通过多种方式使用它。在第 3 章的示例 3-5 中，我们使用 `for` 循环迭代了一个数组，以便对其中的每个项执行一些代码。在底层，这隐式地创建并消耗了一个迭代器，但我们直到现在才详细介绍它是如何工作的。

在示例 13-11 的示例中，我们将迭代器的创建与在 `for` 循环中使用迭代器分开了。当使用 `v1_iter` 中的迭代器调用 `for` 循环时，迭代器中的每个元素都在循环的一次迭代中使用，这会打印出每个值。

Filename: src/main.rs:

```rust
fn main() {
    let v1 = vec![1, 2, 3];

    let v1_iter = v1.iter();

    for val in v1_iter {
        println!("Got: {val}");
    }
}
```

Listing 13-11: Using an iterator in a `for` loop

在没有标准库提供的迭代器的语言中，你可能会通过将变量从索引 0 开始，使用该变量索引到向量中以获取值，并在循环中递增变量值直到达到向量中的总项数来编写相同的功能。

迭代器为你处理所有这些逻辑，减少了你可能搞砸的重复代码。迭代器为你提供了更大的灵活性，可以使用相同的逻辑处理许多不同类型的序列，而不仅仅是你可以索引的数据结构，如向量。让我们看看迭代器是如何做到这一点的。

## `Iterator` Trait 和 `next` 方法

所有迭代器都实现了标准库中定义的名为 `Iterator` 的 trait。该 trait 的定义如下所示：

```rust
#![allow(unused)]
fn main() {
pub trait Iterator {
    type Item;

    fn next(&mut self) -> Option<Self::Item>;

    // methods with default implementations elided
}
}
```

请注意，此定义使用了一些新语法：`type Item` 和 `Self::Item`，它们正在为此 trait 定义一个关联类型。我们将在第 20 章深入讨论关联类型。现在，你只需要知道这段代码表示实现 `Iterator` trait 需要你同时定义一个 `Item` 类型，并且此 `Item` 类型用于 `next` 方法的返回类型。换句话说，`Item` 类型将是迭代器返回的类型。

`Iterator` trait 只要求实现者定义一个方法：`next` 方法，该方法一次返回迭代器的一个项，包装在 `Some` 中，当迭代结束时，返回 `None`。

我们可以直接在迭代器上调用 `next` 方法；示例 13-12 演示了对从向量创建的迭代器重复调用 `next` 返回的值。

Filename: src/lib.rs:

```rust
#[cfg(test)]
mod tests {
    #[test]
    fn iterator_demonstration() {
        let v1 = vec![1, 2, 3];

        let mut v1_iter = v1.iter();

        assert_eq!(v1_iter.next(), Some(&1));
        assert_eq!(v1_iter.next(), Some(&2));
        assert_eq!(v1_iter.next(), Some(&3));
        assert_eq!(v1_iter.next(), None);
    }
}
```

Listing 13-12: Calling the `next` method on an iterator

请注意，我们需要使 `v1_iter` 可变：在迭代器上调用 `next` 方法会更改迭代器用于跟踪其在序列中位置的内部状态。换句话说，这段代码消耗或用尽了迭代器。每次调用 `next` 都会从迭代器中消耗一个项。当我们使用 `for` 循环时，我们不需要使 `v1_iter` 可变，因为循环在幕后接管了 `v1_iter` 的所有权并使其可变。

另请注意，我们从调用 `next` 获得的值是向量中值的不可变引用。`iter` 方法生成一个不可变引用的迭代器。如果我们想创建一个接管 `v1` 所有权并返回拥有值的迭代器，我们可以调用 `into_iter` 而不是 `iter`。类似地，如果我们想迭代可变引用，我们可以调用 `iter_mut` 而不是 `iter`。

## 消耗迭代器的方法

`Iterator` trait 有许多具有标准库提供的默认实现的方法；你可以通过查看标准库 API 文档中的 `Iterator` trait 来了解这些方法。其中一些方法在其定义中调用了 `next` 方法，这就是为什么在实现 `Iterator` trait 时需要实现 `next` 方法的原因。

调用 `next` 的方法称为消耗适配器，因为调用它们会用尽迭代器。一个例子是 `sum` 方法，它接管迭代器的所有权，并通过重复调用 `next` 来迭代项，从而消耗迭代器。在迭代过程中，它将每个项添加到正在运行的总计中，并在迭代完成后返回总计。示例 13-13 有一个测试，演示了 `sum` 方法的使用。

Filename: src/lib.rs:

```rust
#[cfg(test)]
mod tests {
    #[test]
    fn iterator_sum() {
        let v1 = vec![1, 2, 3];

        let v1_iter = v1.iter();

        let total: i32 = v1_iter.sum();

        assert_eq!(total, 6);
    }
}
```

Listing 13-13: Calling the `sum` method to get the total of all items in the iterator

我们在调用 `sum` 后不允许使用 `v1_iter`，因为 `sum` 接管了我们调用它的迭代器的所有权。

## 生成其他迭代器的方法

迭代器适配器是定义在 `Iterator` trait 上的方法，它们不消耗迭代器。相反，它们通过更改原始迭代器的某些方面来生成不同的迭代器。

示例 13-14 显示了一个调用迭代器适配器方法 `map` 的示例，该方法接受一个闭包，以便在迭代项时对每个项进行调用。`map` 方法返回一个新的迭代器，该迭代器生成修改后的项。这里的闭包创建了一个新的迭代器，其中向量中的每个项都将递增 1：

Filename: src/main.rs:

```rust
fn main() {
    let v1: Vec<i32> = vec![1, 2, 3];

    v1.iter().map(|x| x + 1);
}
```

Listing 13-14: Calling the iterator adapter `map` to create a new iterator

但是，这段代码会产生一个警告：

```rust
$ cargo run
   Compiling iterators v0.1.0 (file:///projects/iterators)
warning: unused `Map` that must be used
 --> src/main.rs:4:5
  |
4 |     v1.iter().map(|x| x + 1);
  |     ^^^^^^^^^^^^^^^^^^^^^^^^
  |
  = note: iterators are lazy and do nothing unless consumed
  = note: `#[warn(unused_must_use)]` on by default
help: use `let _ = ...` to ignore the resulting value
  |
4 |     let _ = v1.iter().map(|x| x + 1);
  |     +++++++

warning: `iterators` (bin "iterators") generated 1 warning
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.47s
     Running `target/debug/iterators`
```

示例 13-14 中的代码没有做任何事情；我们指定的闭包从未被调用。警告提醒我们原因：迭代器适配器是惰性的，我们需要在这里消耗迭代器。

为了解决此警告并消耗迭代器，我们将使用 `collect` 方法，我们在第 12 章中与示例 12-1 中的 `env::args` 一起使用过。此方法消耗迭代器并将结果值收集到集合数据类型中。

在示例 13-15 中，我们将调用 `map` 返回的迭代器迭代结果收集到一个向量中。这个向量最终将包含原始向量中的每个项，并递增 1。

Filename: src/main.rs:

```rust
fn main() {
    let v1: Vec<i32> = vec![1, 2, 3];

    let v2: Vec<_> = v1.iter().map(|x| x + 1).collect();

    assert_eq!(v2, vec![2, 3, 4]);
}
```

Listing 13-15: Calling the `map` method to create a new iterator and then calling the `collect` method to consume the new iterator and create a vector

因为 `map` 接受一个闭包，我们可以指定我们想要对每个项执行的任何操作。这是一个很好的例子，说明闭包如何让你自定义某些行为，同时重用 `Iterator` trait 提供的迭代行为。

你可以链式调用多个迭代器适配器，以可读的方式执行复杂的操作。但由于所有迭代器都是惰性的，你必须调用其中一个消耗适配器方法才能从迭代器适配器的调用中获得结果。

## 使用捕获其环境的闭包

许多迭代器适配器接受闭包作为参数，通常我们指定为迭代器适配器参数的闭包将是捕获其环境的闭包。

对于此示例，我们将使用接受闭包的 `filter` 方法。闭包从迭代器中获取一个项并返回一个 `bool`。如果闭包返回 `true`，则该值将包含在 `filter` 生成的迭代中。如果闭包返回 `false`，则该值将不包含在内。

在示例 13-16 中，我们使用 `filter` 和一个捕获其环境中 `shoe_size` 变量的闭包，以迭代 `Shoe` 结构体实例的集合。它将只返回指定尺寸的鞋子。

Filename: src/lib.rs:

```rust
#[derive(PartialEq, Debug)]
struct Shoe {
    size: u32,
    style: String,
}

fn shoes_in_size(shoes: Vec<Shoe>, shoe_size: u32) -> Vec<Shoe> {
    shoes.into_iter().filter(|s| s.size == shoe_size).collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn filters_by_size() {
        let shoes = vec![
            Shoe {
                size: 10,
                style: String::from("sneaker"),
            },
            Shoe {
                size: 13,
                style: String::from("sandal"),
            },
            Shoe {
                size: 10,
                style: String::from("boot"),
            },
        ];

        let in_my_size = shoes_in_size(shoes, 10);

        assert_eq!(
            in_my_size,
            vec![
                Shoe {
                    size: 10,
                    style: String::from("sneaker")
                },
                Shoe {
                    size: 10,
                    style: String::from("boot")
                },
            ]
        );
    }
}
```

Listing 13-16: Using the `filter` method with a closure that captures `shoe_size`

`shoes_in_size` 函数接管了鞋子向量和鞋子尺寸的所有权作为参数。它返回一个只包含指定尺寸鞋子的向量。

在 `shoes_in_size` 的函数体中，我们调用 `into_iter` 创建一个接管向量所有权的迭代器。然后我们调用 `filter` 将该迭代器转换为一个新的迭代器，该迭代器只包含闭包返回 `true` 的元素。

闭包捕获环境中的 `shoe_size` 参数，并将该值与每只鞋子的尺寸进行比较，只保留指定尺寸的鞋子。最后，调用 `collect` 将经过适配的迭代器返回的值收集到一个向量中，该向量由函数返回。

测试表明，当我们调用 `shoes_in_size` 时，我们只得到了与我们指定的值相同尺寸的鞋子。
