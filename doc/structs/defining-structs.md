## 定义和实例化结构体

结构体类似于“[元组类型](../common-concept/data-type.md#元组类型)”部分中讨论的元组，因为两者都包含多个相关值。与元组一样，结构体的各个部分可以是不同的类型。与元组不同，在结构体中，你将命名每个数据部分，以便清楚地了解值的含义。添加这些名称意味着结构体比元组更灵活：你不必依赖数据的顺序来指定或访问实例的值。

要定义结构体，我们输入关键字 struct 并命名整个结构体。结构体的名称应该描述将数据组合在一起的意义。然后，在花括号内，我们定义数据的名称和类型，我们称之为字段。例如，示例 5-1 显示了一个存储有关用户帐户信息的结构体。

文件名：src/main.rs:

```rust
struct User {
    active: bool,
    username: String,
    email: String,
    sign_in_count: u64,
}
```

示例 5-1：User 结构体定义

要在定义结构体后使用它，我们需要通过为每个字段指定具体值来创建该结构的实例。我们通过声明结构体的名称来创建实例，然后添加包含键：值对的大括号，其中键是字段的名称，值是我们想要存储在这些字段中的数据。我们不必按照在结构体中声明字段的顺序指定字段。换句话说，结构体定义就像类型的通用模板，实例用特定数据填充该模板以创建类型的值。例如，我们可以声明一个特定的用户，如示例 5-2 所示。

文件名：src/main.rs:

```rust
fn main() {
    let user1 = User {
        active: true,
        username: String::from("someusername123"),
        email: String::from("someone@example.com"),
        sign_in_count: 1,
    };
}
```

示例 5-2：创建 User 结构体的实例

要从结构体中获取特定值，我们使用点符号。例如，要访问此用户的电子邮件地址，我们使用 `user1.email`。如果实例是可变的，我们可以使用点符号并分配给特定字段来更改值。示例 5-3 显示了如何更改可变 User 实例的 email 字段中的值。

```rust
fn main() {
    let mut user1 = User {
        active: true,
        username: String::from("someusername123"),
        email: String::from("someone@example.com"),
        sign_in_count: 1,
    };

    user1.email = String::from("anotheremail@example.com");
}
```

示例 5-3：更改用户实例的电子邮件字段的值

请注意，整个实例必须是可变的；Rust 不允许我们仅将某些字段标记为可变。与任何表达式一样，我们可以构造结构体的新实例作为函数体中的最后一个表达式，以隐式返回该新实例。

示例 5-4 显示了 build_user 函数，该函数返回具有给定电子邮件和用户名的 User 实例。active 字段的值为 true，sign_in_count 的值为 1。

文件名：src/main.rs:

```rust
fn build_user(email: String, username: String) -> User {
    User {
        active: true,
        username: username,
        email: email,
        sign_in_count: 1,
    }
}
```

示例 5-4：build_user 函数接受电子邮件和用户名作为参数并返回一个 User 实例

将函数参数命名为与结构字段相同的名称是有意义的，但必须重复电子邮件和用户名字段名称和变量有点乏味。如果结构体有更多字段，重复每个名称会变得更加烦人。幸运的是，有一个方便的简写！

### 字段初始化简写用法

由于示例 5-4 中的参数名称和结构体字段名称完全相同，我们可以使用字段 init 简写语法来重写 build_user，使其行为完全相同，但没有重复的用户名和电子邮件，如示例 5-5 所示。

文件名：src/main.rs:

```rust
fn build_user(email: String, username: String) -> User {
    User {
        active: true,
        username,
        email,
        sign_in_count: 1,
    }
}
```

示例 5-5：build_user 函数使用字段 init 简写形式，因为 username 和 email 参数与结构体字段同名

这里，我们创建了 User 结构体的一个新实例，该结构体有一个名为 email 的字段。我们想将 email 字段的值设置为 build_user 函数的 email 参数中的值。由于 email 字段和 email 参数同名，因此我们只需要写 email 而不是 email: email。

### 使用结构更新语法从其他实例创建实例

创建一个结构体的新实例通常很有用，该实例包含另一个实例中的大多数值，但会更改一些值。你可以使用结构体更新语法来执行此操作。

首先，在示例 5-6 中，我们展示了如何在不使用更新语法的情况下定期在 user2 中创建一个新的 User 实例。我们为 email 设置了一个新值，但其他方面使用我们在示例 5-2 中创建的 user1 中的相同值。

文件名：src/main.rs:

```rust
// struct User {
//     active: bool,
//     username: String,
//     email: String,
//     sign_in_count: u64,
// }
//....

fn main() {
     // ....
    // let user1 = User {
    //     email: String::from("someone@example.com"),
    //     username: String::from("someusername123"),
    //     active: true,
    //     sign_in_count: 1,
    // };

    let user2 = User {
        active: user1.active,
        username: user1.username,
        email: String::from("another@example.com"),
        sign_in_count: user1.sign_in_count,
    };
}
```

示例 5-6：使用 user1 中除一个值以外的所有值创建一个新的 User 实例

使用结构体更新语法，我们可以用更少的代码实现相同的效果，如示例 5-7 所示。语法 `..` 指定未明确设置的其余字段应具有与给定实例中的字段相同的值。

文件名：src/main.rs:

```rust
// struct User {
//     active: bool,
//     username: String,
//     email: String,
//     sign_in_count: u64,
// }

fn main() {
    // let user1 = User {
    //     email: String::from("someone@example.com"),
    //     username: String::from("someusername123"),
    //     active: true,
    //     sign_in_count: 1,
    // };

    let user2 = User {
        email: String::from("another@example.com"),
        ..user1
    };
}
```

示例 5-7：使用结构更新语法为 User 实例设置新的电子邮件值，但使用 user1 中的其余值

示例 5-7 中的代码还在 user2 中创建了一个实例，该实例的 email 值与 user1 不同，但 username、active 和 sign_in_count 字段的值与 user1 相同。..user1 必须放在最后，以指定任何剩余字段应从 user1 中的相应字段中获取其值，但我们可以选择以任意顺序为任意数量的字段指定值，而不管结构定义中字段的顺序如何。

请注意，结构体更新语法使用 = 就像赋值一样；这是因为它会移动数据，就像我们在“[变量和数据的移动](../understand-ownership/what-ownership.md#变量和数据的移动)”部分中看到的那样。在此示例中，在创建 user2 后，我们无法再将 user1 作为一个整体使用，因为 user1 的 username 字段中的字符串已移入 user2。如果我们为 user2 的 email 和 username 赋予了新的字符串值，因此仅使用来自 user1 的 active 和 sign_in_count 值，则在创建 user2 后，user1 仍然有效。active 和 sign_in_count 都是实现 Copy 特征的类型，因此我们在“[仅堆栈数据复制](../understand-ownership/what-ownership.md#仅堆栈数据复制)”部分中讨论的行为将适用。我们仍然可以在此示例中使用 user1.email，因为它的值没有被移出。

### 使用没有命名字段的元组结构来创建不同类型

Rust 还支持类似于元组的结构体，称为元组结构体。元组结构体具有结构体名称提供的附加含义，但没有与其字段关联的名称；相反，它们只有字段的类型。当你想给整个元组命名并使元组具有与其他元组不同的类型时，以及当像在常规结构体中一样命名每个字段会冗长或冗余时，元组结构体非常有用。

要定义元组结构体，请从 struct 关键字和结构体名称开始，后跟元组中的类型。例如，这里我们定义并使用两个名为 Color 和 Point 的元组结构体：

文件名：src/main.rs:

```rust
struct Color(i32, i32, i32);
struct Point(i32, i32, i32);

fn main() {
    let black = Color(0, 0, 0);
    let origin = Point(0, 0, 0);
}
```

请注意，black 和 origin 值是不同的类型，因为它们是不同元组结构体的实例。你定义的每个结构体都是其自己的类型，即使结构体中的字段可能具有相同的类型。例如，接受 Color 类型参数的函数不能将 Point 作为参数，即使这两种类型都是由三个 i32 值组成的。除此之外，元组结构体实例与元组类似，因为你可以将它们解构为各个部分，并且可以使用 `.` 后跟索引来访问单个值。

### 没有任何字段的单元状结构体

你还可以定义没有任何字段的结构体！这些被称为类单元结构体，因为它们的行为类似于 `()`，后者是我们在“[元组类型](../common-concept/data-type.md#元组类型)”部分中提到的单元类型。当你需要在某种类型上实现特征但没有任何要存储在类型本身中的数据时，类单元结构体会很有用。我们将在第 10 章中讨论特征。以下是声明和实例化名为 AlwaysEqual 的单元结构的示例：

文件名：src/main.rs:

```rust
struct AlwaysEqual;

fn main() {
    let subject = AlwaysEqual;
}
```

要定义 AlwaysEqual，我们使用 struct 关键字、我们想要的名称，然后是分号。不需要花括号或圆括号！然后我们可以以类似的方式在subobject变量中获取 AlwaysEqual 的实例：使用我们定义的名称，不需要任何花括号或圆括号。想象一下，稍后我们将为这种类型实现行为，使得 AlwaysEqual 的每个实例始终等于任何其他类型的每个实例，也许是为了测试目的而获得已知结果。我们不需要任何数据来实现该行为！你将在第 10 章中看到如何定义特征并在任何类型（包括类似单元的结构体）上实现它们。

> **结构体数据的所有权**
>
> 在示例 5-1 中的 User 结构体定义中，我们使用了自有 String 类型，而不是 &str 字符串切片类型。这是经过深思熟虑的选择，因为我们希望此结构体的每个实例都拥有其所有数据，并且只要整个结构体有效，这些数据就有效。
> 结构体也可以存储对其他对象所拥有的数据的引用，但这样做需要使用生命周期，这是我们将在第 10 章中讨论的 Rust 特性。生命周期确保结构体引用的数据在结构体存在期间一直有效。假设你尝试在不指定生命周期的情况下将引用存储在结构体中，如下所示；这将不起作用：
>
> 文件名：src/main.rs:
> 
> ```rust
> struct User {
>     active: bool,
>     username: &str,
>     email: &str,
>     sign_in_count: u64,
> }
>
> fn main() {
>     let user1 = User {
>         active: true,
>         username: "someusername123",
>         email: "someone@example.com",
>         sign_in_count: 1,
>     };
> }
> ```
>
> 编译器会抱怨它需要生命周期说明符：
>
> ```rust
> $ cargo run
>    Compiling structs v0.1.0 (file:///projects/structs)
> error[E0106]: missing lifetime specifier
>  --> src/main.rs:3:15
>   |
> 3 |     username: &str,
>   |               ^ expected named lifetime parameter
>   |
> help: consider introducing a named lifetime parameter
>   |
> 1 ~ struct User<'a> {
> 2 |     active: bool,
> 3 ~     username: &'a str,
>   |
>
> error[E0106]: missing lifetime specifier
>  --> src/main.rs:4:12
>   |
> 4 |     email: &str,
>   |            ^ expected named lifetime parameter
>   |
> help: consider introducing a named lifetime parameter
>   |
> 1 ~ struct User<'a> {
> 2 |     active: bool,
> 3 |     username: &str,
> 4 ~     email: &'a str,
>   |
>
> For more information about this error, try `rustc --explain E0106`.
> error: could not compile `structs` (bin "structs") due to 2 previous errors
> ```
> 
> 在第 10 章中，我们将讨论如何修复这些错误，以便你可以将引用存储在结构体中，但现在，我们将使用 String 等自有的类型而不是 `&str` 等引用来修复此类错误。