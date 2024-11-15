(window.webpackJsonp=window.webpackJsonp||[]).push([[39],{382:function(t,s,a){"use strict";a.r(s);var n=a(17),r=Object(n.a)({},(function(){var t=this,s=t._self._c;return s("ContentSlotsDistributor",{attrs:{"slot-key":t.$parent.slotKey}},[s("h2",{attrs:{id:"变量和可变性"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#变量和可变性"}},[t._v("#")]),t._v(" 变量和可变性")]),t._v(" "),s("p",[t._v("如“"),s("RouterLink",{attrs:{to:"/doc/guess-game/guess-game.html#用变量来存储值"}},[t._v("使用变量存储值")]),t._v("”部分所述，默认情况下，变量是不可变的。这是 Rust 为你提供的众多提示之一，让你能够以充分利用 Rust 提供的安全性和轻松并发性的方式编写代码。但是，你仍然可以选择使变量可变。让我们探索 Rust 如何以及为何鼓励你青睐不变性，以及为什么有时你可能想要选择退出。")],1),t._v(" "),s("p",[t._v("当变量不可变时，一旦将值绑定到名称，就无法更改该值。为了说明这一点，使用 "),s("code",[t._v("cargo new variables")]),t._v(" 在项目目录中生成一个名为"),s("code",[t._v("variables")]),t._v("的新项目。")]),t._v(" "),s("p",[t._v("然后，在新的变量目录中，打开 src/main.rs 并将其代码替换为以下代码，该代码暂时不会编译：")]),t._v(" "),s("p",[t._v("文件名: main.rs")]),t._v(" "),s("div",{staticClass:"language-rust extra-class"},[s("pre",{pre:!0,attrs:{class:"language-rust"}},[s("code",[s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("fn")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token function-definition function"}},[t._v("main")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("let")]),t._v(" x "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token number"}},[t._v("5")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token macro property"}},[t._v("println!")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token string"}},[t._v('"The value of x is: {x}"')]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n    x "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token number"}},[t._v("6")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token macro property"}},[t._v("println!")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token string"}},[t._v('"The value of x is: {x}"')]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n")])])]),s("p",[t._v("保存并使用 cargo run 运行程序。你应该收到一条关于不可变性错误的错误消息，如以下输出所示：")]),t._v(" "),s("div",{staticClass:"language-rust extra-class"},[s("pre",{pre:!0,attrs:{class:"language-rust"}},[s("code",[t._v("$ cargo run\n   "),s("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("Compiling")]),t._v(" variables v0"),s("span",{pre:!0,attrs:{class:"token number"}},[t._v(".1")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token number"}},[t._v("0")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("file"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("/")]),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("//projects/variables)")]),t._v("\nerror"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("[")]),s("span",{pre:!0,attrs:{class:"token constant"}},[t._v("E0384")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("]")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" cannot assign twice to immutable variable `x`\n "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("-")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("->")]),t._v(" src"),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("/")]),t._v("main"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("rs"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),s("span",{pre:!0,attrs:{class:"token number"}},[t._v("4")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),s("span",{pre:!0,attrs:{class:"token number"}},[t._v("5")]),t._v("\n  "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("|")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token number"}},[t._v("2")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("|")]),t._v("     "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("let")]),t._v(" x "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token number"}},[t._v("5")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n  "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("|")]),t._v("         "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("-")]),t._v("\n  "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("|")]),t._v("         "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("|")]),t._v("\n  "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("|")]),t._v("         first assignment to `x`\n  "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("|")]),t._v("         help"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" consider making this binding mutable"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" `"),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("mut")]),t._v(" x`\n"),s("span",{pre:!0,attrs:{class:"token number"}},[t._v("3")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("|")]),t._v("     "),s("span",{pre:!0,attrs:{class:"token macro property"}},[t._v("println!")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token string"}},[t._v('"The value of x is: {x}"')]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token number"}},[t._v("4")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("|")]),t._v("     x "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token number"}},[t._v("6")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n  "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("|")]),t._v("     "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("^")]),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("^")]),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("^")]),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("^")]),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("^")]),t._v(" cannot assign twice to immutable variable\n\n"),s("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("For")]),t._v(" more information about this error"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("try")]),t._v(" `rustc "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("-")]),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("-")]),t._v("explain "),s("span",{pre:!0,attrs:{class:"token constant"}},[t._v("E0384")]),t._v("`"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("\nerror"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" could not compile `variables` "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("bin "),s("span",{pre:!0,attrs:{class:"token string"}},[t._v('"variables"')]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" due to "),s("span",{pre:!0,attrs:{class:"token number"}},[t._v("1")]),t._v(" previous error\n")])])]),s("p",[t._v("此示例展示了编译器如何帮助你查找程序中的错误。编译器错误可能令人沮丧，但实际上它们仅意味着你的程序尚未安全地执行你想要它执行的操作；它们并不意味着你不是一名优秀的程序员！经验丰富的 Rust 爱好者 仍然会遇到编译器错误。")]),t._v(" "),s("p",[t._v("你收到错误消息"),s("code",[t._v('cannot assign twice to immutable variable "x"')]),t._v("(无法对不可变变量“x”进行两次赋值)，因为你尝试将第二个值分配给不可变的 x 变量。")]),t._v(" "),s("p",[t._v("当我们尝试更改指定为不可变的值时，我们收到编译时错误是很重要的，因为这种情况可能会导致错误。如果我们代码的一部分假设某个值永远不会改变，而另一部分代码改变了该值，那么第一部分代码可能不会按照设计执行。事后很难追踪这种错误的原因，尤其是当第二段代码只是偶尔改变值时。Rust 编译器保证，当你声明某个值不会改变时，它实际上不会改变，因此你不必亲自跟踪它。因此，你的代码更容易推理。")]),t._v(" "),s("p",[t._v("但可变性非常有用，可以使代码编写起来更方便。虽然变量默认是不可变的，但你可以通过在变量名前面添加 "),s("code",[t._v("mut")]),t._v(" 来使它们可变，就像你在"),s("RouterLink",{attrs:{to:"/doc/guess-game/guess-game.html#用变量来存储值"}},[t._v("第 2 章")]),t._v("中所做的那样。添加 mut 还可以向代码的未来读者传达意图，表明代码的其他部分将更改此变量的值。")],1),t._v(" "),s("p",[t._v("例如，我们将 src/main.rs 更改为以下内容：")]),t._v(" "),s("p",[t._v("文件名: main.rs")]),t._v(" "),s("div",{staticClass:"language-rust extra-class"},[s("pre",{pre:!0,attrs:{class:"language-rust"}},[s("code",[s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("fn")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token function-definition function"}},[t._v("main")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("let")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("mut")]),t._v(" x "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token number"}},[t._v("5")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token macro property"}},[t._v("println!")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token string"}},[t._v('"The value of x is: {x}"')]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n    x "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token number"}},[t._v("6")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token macro property"}},[t._v("println!")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token string"}},[t._v('"The value of x is: {x}"')]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n")])])]),s("p",[t._v("现在运行该程序，我们得到以下结果：")]),t._v(" "),s("div",{staticClass:"language-rust extra-class"},[s("pre",{pre:!0,attrs:{class:"language-rust"}},[s("code",[t._v("$ cargo run\n   "),s("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("Compiling")]),t._v(" variables v0"),s("span",{pre:!0,attrs:{class:"token number"}},[t._v(".1")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token number"}},[t._v("0")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("file"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("/")]),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("//projects/variables)")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("Finished")]),t._v(" `dev` profile "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("[")]),t._v("unoptimized "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("+")]),t._v(" debuginfo"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("]")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("target")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("s"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("in")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token number"}},[t._v("0")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("30s\n     "),s("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("Running")]),t._v(" `target"),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("/")]),t._v("debug"),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("/")]),t._v("variables`\n"),s("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("The")]),t._v(" value of x is"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token number"}},[t._v("5")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("The")]),t._v(" value of x is"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token number"}},[t._v("6")]),t._v("\n")])])]),s("p",[t._v("使用 mut 时，我们可以将绑定到 x 的值从 5 更改为 6。最终，是否使用可变性取决于你，取决于你认为在特定情况下最清楚的是什么。")]),t._v(" "),s("h3",{attrs:{id:"常量"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#常量"}},[t._v("#")]),t._v(" 常量")]),t._v(" "),s("p",[t._v("与不可变变量一样，常量是与名称绑定且不允许更改的值，但常量和变量之间存在一些差异。")]),t._v(" "),s("p",[t._v("首先，你不能将 mut 与常量一起使用。常量不仅默认不可变 - 它们始终是不可变的。常量需要使用 const 关键字而不是 let 关键字声明，并且必须注释值的类型。我们将在下一节“"),s("RouterLink",{attrs:{to:"/doc/common-concept/data-type.html"}},[t._v("数据类型")]),t._v("”中介绍类型和类型注释，所以现在不用担心细节。只要知道你必须始终注释类型即可。")],1),t._v(" "),s("p",[t._v("常量可以在任何上下文内声明，包括全局上下文，这使得它们对于代码的许多部分需要了解的值很有用。")]),t._v(" "),s("p",[t._v("最后一个区别是常量只能设置为常量表达式，而不是只能在运行时计算的值的结果。")]),t._v(" "),s("p",[t._v("以下是常量声明的示例：")]),t._v(" "),s("div",{staticClass:"language-rust extra-class"},[s("pre",{pre:!0,attrs:{class:"language-rust"}},[s("code",[s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("const")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token constant"}},[t._v("THREE_HOURS_IN_SECONDS")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("u32")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token number"}},[t._v("60")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("*")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token number"}},[t._v("60")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("*")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token number"}},[t._v("3")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n")])])]),s("p",[t._v("该常量的名称为 THREE_HOURS_IN_SECONDS，其值设置为 60（一分钟的秒数）乘以 60（一小时的分钟数）乘以 3（我们想要在此程序中计算的小时数）的结果。Rust 的常量命名约定是全部使用大写字母，并在单词之间使用下划线。编译器能够在编译时评估一组有限的操作，这让我们可以选择以一种更容易理解和验证的方式写出这个值，而不是将此常量设置为值 10,800。有关声明常量时可以使用哪些操作的更多信息，请参阅"),s("a",{attrs:{href:"https://doc.rust-lang.org/reference/const_eval.html",target:"_blank",rel:"noopener noreferrer"}},[t._v("Rust 常量赋值"),s("OutboundLink")],1),t._v("。")]),t._v(" "),s("p",[t._v("常量在程序运行的整个时间内有效，在声明它们的上下文内。此属性使常量对于应用程序域中的值非常有用，程序的多个部分可能需要知道这些值，例如游戏中任何玩家可以获得的最大积分数或光速。")]),t._v(" "),s("p",[t._v("将整个程序中使用的硬编码值命名为常量有助于将该值的含义传达给代码的未来维护者。如果将来需要更新硬编码值，这也有助于在代码中只有一个地方需要更改。")]),t._v(" "),s("h3",{attrs:{id:"变量遮蔽"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#变量遮蔽"}},[t._v("#")]),t._v(" 变量遮蔽")]),t._v(" "),s("p",[t._v("正如你在第 2 章的"),s("RouterLink",{attrs:{to:"/doc/guess-game/guess-game.html#将猜测数字与秘密数字进行比较"}},[t._v("猜谜游戏教程")]),t._v("中看到的那样，你可以声明一个与前一个变量同名的新变量。Rust 爱好者表示第一个变量被第二个变量变量遮蔽，这意味着当你使用该变量的名称时，编译器将看到第二个变量。实际上，第二个变量变量遮蔽了第一个变量，将变量名称的任何使用都归于自身，直到它本身被变量遮蔽或作用域结束。我们可以使用相同的变量名称并重复使用 let 关键字来变量遮蔽变量，如下所示：")],1),t._v(" "),s("p",[t._v("文件名: main.rs:")]),t._v(" "),s("div",{staticClass:"language-rust extra-class"},[s("pre",{pre:!0,attrs:{class:"language-rust"}},[s("code",[s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("fn")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token function-definition function"}},[t._v("main")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("let")]),t._v(" x "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token number"}},[t._v("5")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\n    "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("let")]),t._v(" x "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" x "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("+")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token number"}},[t._v("1")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\n    "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n        "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("let")]),t._v(" x "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" x "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("*")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token number"}},[t._v("2")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n        "),s("span",{pre:!0,attrs:{class:"token macro property"}},[t._v("println!")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token string"}},[t._v('"The value of x in the inner scope is: {x}"')]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n\n    "),s("span",{pre:!0,attrs:{class:"token macro property"}},[t._v("println!")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token string"}},[t._v('"The value of x is: {x}"')]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n")])])]),s("p",[t._v("变量遮蔽不同于将变量标记为 mut，因为如果我们不小心尝试在不使用 let 关键字的情况下重新赋值给此变量，我们将收到编译时错误。通过使用 let，我们可以对值执行一些转换，但在完成这些转换后，变量将是不可变的。")]),t._v(" "),s("p",[t._v("mut 和变量遮蔽之间的另一个区别是，因为当我们再次使用 let 关键字时，我们实际上是在创建一个新变量，所以我们可以更改值的类型但重用相同的名称。例如，假设我们的程序要求用户通过输入空格字符来显示他们希望在某些文本之间有多少个空格，然后我们希望将该输入存储为数字：")]),t._v(" "),s("div",{staticClass:"language-rust extra-class"},[s("pre",{pre:!0,attrs:{class:"language-rust"}},[s("code",[s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("let")]),t._v(" spaces "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token string"}},[t._v('"   "')]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("let")]),t._v(" spaces "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" spaces"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("len")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n")])])]),s("p",[t._v("第一个 Spaces 变量是字符串类型，第二个 Spaces 变量是数字类型。因此，使用变量遮蔽处理可以让我们不必想出不同的名称，例如 Spaces_str 和 Spaces_num；相反，我们可以重用更简单的 Spaces 名称。但是，如果我们尝试使用 mut 来实现这一点，如下所示，我们将收到编译时错误：")]),t._v(" "),s("div",{staticClass:"language-rust extra-class"},[s("pre",{pre:!0,attrs:{class:"language-rust"}},[s("code",[s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("let")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("mut")]),t._v(" spaces "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token string"}},[t._v('"   "')]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\nspaces "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" spaces"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("len")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n")])])]),s("p",[t._v("错误表明我们不允许改变变量的类型：")]),t._v(" "),s("div",{staticClass:"language-rust extra-class"},[s("pre",{pre:!0,attrs:{class:"language-rust"}},[s("code",[t._v("$ cargo run\n   "),s("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("Compiling")]),t._v(" variables v0"),s("span",{pre:!0,attrs:{class:"token number"}},[t._v(".1")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token number"}},[t._v("0")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("file"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("/")]),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("//projects/variables)")]),t._v("\nerror"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("[")]),s("span",{pre:!0,attrs:{class:"token constant"}},[t._v("E0308")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("]")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" mismatched types\n "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("-")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("->")]),t._v(" src"),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("/")]),t._v("main"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("rs"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),s("span",{pre:!0,attrs:{class:"token number"}},[t._v("3")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),s("span",{pre:!0,attrs:{class:"token number"}},[t._v("14")]),t._v("\n  "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("|")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token number"}},[t._v("2")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("|")]),t._v("     "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("let")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("mut")]),t._v(" spaces "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token string"}},[t._v('"   "')]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n  "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("|")]),t._v("                      "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("-")]),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("-")]),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("-")]),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("-")]),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("-")]),t._v(" expected due to this value\n"),s("span",{pre:!0,attrs:{class:"token number"}},[t._v("3")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("|")]),t._v("     spaces "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" spaces"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("len")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n  "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("|")]),t._v("              "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("^")]),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("^")]),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("^")]),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("^")]),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("^")]),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("^")]),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("^")]),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("^")]),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("^")]),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("^")]),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("^")]),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("^")]),t._v(" expected `"),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("&")]),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("str")]),t._v("`"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" found `"),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("usize")]),t._v("`\n\n"),s("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("For")]),t._v(" more information about this error"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("try")]),t._v(" `rustc "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("-")]),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("-")]),t._v("explain "),s("span",{pre:!0,attrs:{class:"token constant"}},[t._v("E0308")]),t._v("`"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("\nerror"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" could not compile `variables` "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("bin "),s("span",{pre:!0,attrs:{class:"token string"}},[t._v('"variables"')]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" due to "),s("span",{pre:!0,attrs:{class:"token number"}},[t._v("1")]),t._v(" previous error\n")])])]),s("p",[t._v("现在我们已经了解了变量的工作原理，让我们看看它们可以拥有的更多数据类型。")])])}),[],!1,null,null,null);s.default=r.exports}}]);