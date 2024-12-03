## 使用结构体的示例程序

为了理解何时可能需要使用结构体，让我们编写一个程序来计算矩形的面积。我们将从使用单个变量开始，然后重构程序，直到我们改用结构体。

让我们用 Cargo 创建一个名为 rectangles 的新二进制项目，它将获取以像素为单位指定的矩形的宽度和高度并计算矩形的面积。示例 5-8 展示了一个简短的程序，其中有一种方法可以在项目的 src/main.rs 中执行此操作。

文件名：src/main.rs: 

```rust
fn main() {
    let width1 = 30;
    let height1 = 50;

    println!(
        "The area of the rectangle is {} square pixels.",
        area(width1, height1)
    );
}

fn area(width: u32, height: u32) -> u32 {
    width * height
}
```

示例 5-8：计算由单独的宽度和高度变量指定的矩形的面积

现在，使用 `cargo run` 运行该程序：

```rust
$ cargo run
   Compiling rectangles v0.1.0 (file:///projects/rectangles)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.42s
     Running `target/debug/rectangles`
The area of the rectangle is 1500 square pixels.
```

此代码通过调用每个维度的面积函数成功计算出矩形的面积，但我们可以做更多的事情来使此代码清晰易读。

该代码的问题在area函数的签名中显而易见：

```rust
fn area(width: u32, height: u32) -> u32 {
    //...
}
```

area 函数应该计算一个矩形的面积，但我们编写的函数有两个参数，并且在我们的程序中没有任何地方明确指出这些参数是相关的。将 width 和 height 组合在一起会更易读且更易于管理。我们已经在第 3 章的“[元组类型](../common-concept/data-type.md#元组类型)”部分讨论了我们可以这样做的一种方式：使用元组。

### 使用元组重构