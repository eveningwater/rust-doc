(window.webpackJsonp=window.webpackJsonp||[]).push([[16],{397:function(t,s,a){"use strict";a.r(s);var n=a(25),e=Object(n.a)({},(function(){var t=this,s=t.$createElement,a=t._self._c||s;return a("ContentSlotsDistributor",{attrs:{"slot-key":t.$parent.slotKey}},[a("h3",{attrs:{id:"编写猜一猜游戏"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#编写猜一猜游戏"}},[t._v("#")]),t._v(" 编写猜一猜游戏")]),t._v(" "),a("p",[t._v("让我们一起动手来编写一个Rust小程序吧！在这个小程序中，我们将学到"),a("code",[t._v("let")]),t._v("关键字,"),a("code",[t._v("match")]),t._v("关键字，方法，关联的函数，以及使用的依赖（crates），甚至更多知识点。这个小程序会自动生成1~100之间的正整数，然后由用户输入数字，程序将根据用户输入的数字来进行匹配，如果用户输入错误，则提示用户数字过大或者过小，直到用户猜对为止，然后就退出小程序。")]),t._v(" "),a("h3",{attrs:{id:"创建一个新项目"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#创建一个新项目"}},[t._v("#")]),t._v(" 创建一个新项目")]),t._v(" "),a("p",[t._v("接下来继续使用cargo工具在你的项目根目录创建一个新项目，命令如下:")]),t._v(" "),a("div",{staticClass:"language-rust extra-class"},[a("pre",{pre:!0,attrs:{class:"language-rust"}},[a("code",[t._v("$ cargo new guessing_game\n$ cd guessing_game\n")])])]),a("p",[t._v("第一行命令"),a("code",[t._v("cargo new")]),t._v("表示创建一个新的项目，项目名为"),a("code",[t._v("guessing_game")]),t._v(",第二行命令则是跳转到该目录下。")]),t._v(" "),a("p",[t._v("接下来，看一下"),a("code",[t._v("cargo.toml")]),t._v("文件:")]),t._v(" "),a("div",{staticClass:"language-rust extra-class"},[a("pre",{pre:!0,attrs:{class:"language-rust"}},[a("code",[a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("[")]),t._v("package"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("]")]),t._v("\nname "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[t._v('"guessing_game"')]),t._v("\nversion "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[t._v('"0.1.0"')]),t._v("\nauthors "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("[")]),a("span",{pre:!0,attrs:{class:"token string"}},[t._v('"Your Name <you@example.com>"')]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("]")]),t._v("\nedition "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[t._v('"2018"')]),t._v("\n\n# "),a("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("See")]),t._v(" more keys and their definitions at https"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("/")]),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("/")]),t._v("doc"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("rust"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("-")]),t._v("lang"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("org"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("/")]),t._v("cargo"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("/")]),t._v("reference"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("/")]),t._v("manifest"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("html\n\n"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("[")]),t._v("dependencies"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("]")]),t._v("\n")])])]),a("p",[t._v("如果"),a("code",[t._v("cargo")]),t._v("默认生成的信息有些不符合你的要求，可根据需要来进行修改并保存。接下来让我们继续看着"),a("code",[t._v("main.rs")]),t._v("文件，"),a("code",[t._v("cargo")]),t._v("默认会创建一个函数，然后函数体里面就是打印"),a("code",[t._v("hello,world!")]),t._v("。代码如下:")]),t._v(" "),a("div",{staticClass:"language-rust extra-class"},[a("pre",{pre:!0,attrs:{class:"language-rust"}},[a("code",[a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("fn")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token function-definition function"}},[t._v("main")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    "),a("span",{pre:!0,attrs:{class:"token macro property"}},[t._v("println!")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token string"}},[t._v('"hello,world!"')]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n")])])]),a("p",[t._v("让我们尝试用"),a("code",[t._v("cargo run")]),t._v("命令来进行调试，同样的步骤如前面所述，如下:")]),t._v(" "),a("div",{staticClass:"language-rust extra-class"},[a("pre",{pre:!0,attrs:{class:"language-rust"}},[a("code",[t._v("$ cargo run\n   "),a("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("Compiling")]),t._v(" guessing_game v0"),a("span",{pre:!0,attrs:{class:"token number"}},[t._v(".1")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("0")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("file"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("/")]),a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("//projects/guessing_game)")]),t._v("\n    "),a("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("Finished")]),t._v(" dev "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("[")]),t._v("unoptimized "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("+")]),t._v(" debuginfo"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("]")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("target")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("s"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("in")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("1")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("50s\n     "),a("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("Running")]),t._v(" `target"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("/")]),t._v("debug"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("/")]),t._v("guessing_game`\n"),a("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("Hello")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token macro property"}},[t._v("world!")]),t._v("\n")])])]),a("p",[t._v("接下来才是我们的重头戏，让我们重写"),a("code",[t._v("main.rs")]),t._v("文件里的代码。")]),t._v(" "),a("h3",{attrs:{id:"处理用户输入的数字"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#处理用户输入的数字"}},[t._v("#")]),t._v(" 处理用户输入的数字")]),t._v(" "),a("p",[t._v("首先我们需要要求用户输入信息，并且处理输入的信息，然后检查用户输入的信息是否是我们所期待的正确答案。最开始，我们需要让用户输入猜测的数字，代码如下:")]),t._v(" "),a("div",{staticClass:"language-rust extra-class"},[a("pre",{pre:!0,attrs:{class:"language-rust"}},[a("code",[a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("use")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token namespace"}},[t._v("std"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("::")])]),t._v("io"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("fn")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token function-definition function"}},[t._v("main")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    "),a("span",{pre:!0,attrs:{class:"token macro property"}},[t._v("println!")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token string"}},[t._v('"猜数字游戏现在开始!"')]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n    "),a("span",{pre:!0,attrs:{class:"token macro property"}},[t._v("println!")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token string"}},[t._v('"请输入正整数!"')]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\n    "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("let")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("mut")]),t._v(" guess "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("String")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("::")]),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("new")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\n    "),a("span",{pre:!0,attrs:{class:"token namespace"}},[t._v("io"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("::")])]),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("stdin")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("read_line")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("&")]),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("mut")]),t._v(" guess"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("expected")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token string"}},[t._v('"程序出现问题!"')]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\n    "),a("span",{pre:!0,attrs:{class:"token macro property"}},[t._v("println!")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token string"}},[t._v('"你猜测的数字是:{}"')]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("guess"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n")])])]),a("p",[t._v("这些代码包含了太多的知识点了，让我们一行一行的来分析吧！首先，为了提示用户输入并且能够打印出结果作为输出，我们需要使用"),a("code",[t._v("io")]),t._v("(input/output,输入输出)库,"),a("code",[t._v("io")]),t._v("库来自"),a("code",[t._v("Rust")]),t._v("的一个标准库，这个标准库就被叫做"),a("code",[t._v("std(standard library)")]),t._v("。")]),t._v(" "),a("div",{staticClass:"language-rust extra-class"},[a("pre",{pre:!0,attrs:{class:"language-rust"}},[a("code",[a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("use")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token namespace"}},[t._v("std"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("::")])]),t._v("io"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n")])])]),a("p",[t._v("默认情况下，"),a("code",[t._v("Rust")]),t._v("会将一些类型添加进程序的作用域中，即"),a("a",{attrs:{href:"https://doc.rust-lang.org/std/prelude/index.html",target:"_blank",rel:"noopener noreferrer"}},[t._v("the prelude"),a("OutboundLink")],1),t._v("（这个就是指rust默认会自动引入的一些依赖列表，也可被叫做默认依赖包）。如果需要使用的类型不在这个默认依赖包中，那么我们就需要使用"),a("code",[t._v("use")]),t._v("语句来显式的引入到作用域中。使用"),a("code",[t._v("std::io")]),t._v("库会有很多有用的功能，这其中也包括我们接下来要使用到的能够允许用户输入的能力。")]),t._v(" "),a("p",[t._v("正如前面所介绍到的，每个"),a("code",[t._v("Rust")]),t._v("程序的入口就是"),a("code",[t._v("main")]),t._v("函数。")]),t._v(" "),a("div",{staticClass:"language-rust extra-class"},[a("pre",{pre:!0,attrs:{class:"language-rust"}},[a("code",[a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("fn")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token function-definition function"}},[t._v("main")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n")])])]),a("p",[a("code",[t._v("fn")]),t._v("语法表示声明一个函数，括号"),a("code",[t._v("()")]),t._v("内可以添加参数，但在这里是没有参数的，而"),a("code",[t._v("{}")]),t._v("则代表函数的主体，我们将要编写的所有功能代码都在这个函数主体中。")]),t._v(" "),a("p",[a("code",[t._v("println")]),t._v("则可以算作是一个集合，就是将用户输入的信息打印在终端上。")]),t._v(" "),a("div",{staticClass:"language-rust extra-class"},[a("pre",{pre:!0,attrs:{class:"language-rust"}},[a("code",[a("span",{pre:!0,attrs:{class:"token macro property"}},[t._v("println!")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token string"}},[t._v('"猜数字游戏现在开始!"')]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token macro property"}},[t._v("println!")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token string"}},[t._v('"请输入正整数!"')]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n")])])]),a("p",[t._v("这两行代码无非就是提示用户这个小程序是做什么的。")]),t._v(" "),a("h3",{attrs:{id:"用变量来存储值"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#用变量来存储值"}},[t._v("#")]),t._v(" 用变量来存储值")]),t._v(" "),a("p",[t._v("接下来，我们将创建一个变量用来存储用户输入的信息，代码如下:")]),t._v(" "),a("div",{staticClass:"language-rust extra-class"},[a("pre",{pre:!0,attrs:{class:"language-rust"}},[a("code",[a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("let")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("mut")]),t._v(" guess "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("String")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("::")]),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("new")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n")])])]),a("p",[t._v("这个小程序变得十分有趣了！这一行代码做了很多事情，注意"),a("code",[t._v("let")]),t._v("语句是用来创建一个变量的，我们来看另一个示例代码如下:")]),t._v(" "),a("div",{staticClass:"language-rust extra-class"},[a("pre",{pre:!0,attrs:{class:"language-rust"}},[a("code",[a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("let")]),t._v(" foo "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" bar"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n")])])]),a("p",[t._v("这一行代码创建了一个"),a("code",[t._v("foo")]),t._v("变量，并且将变量的值赋值为"),a("code",[t._v("bar")]),t._v("."),a("code",[t._v("Rust")]),t._v("语言的变量默认是不可变("),a("code",[t._v("immutable")]),t._v(")的,后续会讨论"),a("a",{attrs:{href:"https://doc.rust-lang.org/book/ch03-01-variables-and-mutability.html#variables-and-mutability",target:"_blank",rel:"noopener noreferrer"}},[t._v("变量的可变性"),a("OutboundLink")],1),t._v("。下面的例子展示了如果在变量之前使用"),a("code",[t._v("mut")]),t._v("关键字即可让变量可变("),a("code",[t._v("mutable")]),t._v(")。")]),t._v(" "),a("div",{staticClass:"language-rust extra-class"},[a("pre",{pre:!0,attrs:{class:"language-rust"}},[a("code",[a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("let")]),t._v(" foo "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("50")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("//不可变")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("let")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("mut")]),t._v(" bar "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("100")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("//可变")]),t._v("\n")])])]),a("blockquote",[a("p",[t._v("注意：//语法就是注释语句，注释一直持续到行尾。 Rust忽略了注释中的所有内容，第3章将对此进行详细讨论。")])]),t._v(" "),a("p",[t._v("现在我们也就知道了"),a("code",[t._v("let mut guess")]),t._v("无非就是定义一个可变的变量，变量名就叫做"),a("code",[t._v("guess")]),t._v("。而"),a("code",[t._v("=")]),t._v("右边的值就是该变量所赋的值，也就是"),a("code",[t._v("String::new")]),t._v("。这是一个函数，会返回一个"),a("code",[t._v("String")]),t._v("实例。"),a("a",{attrs:{href:"https://doc.rust-lang.org/std/string/struct.String.html",target:"_blank",rel:"noopener noreferrer"}},[t._v("String"),a("OutboundLink")],1),t._v("是标准库中的一种数据类型，被叫做字符串，也是"),a("code",[t._v("UTF-8")]),t._v("编码的文本类型。")]),t._v(" "),a("p",[a("code",[t._v("::new")]),t._v("中的"),a("code",[t._v("::")]),t._v("符号表示该类型关联一种函数，也就是"),a("code",[t._v("String")]),t._v("的关联函数。关联函数(在这里是"),a("code",[t._v("String")]),t._v("类型)是在类型上实现的，而不是在"),a("code",[t._v("String")]),t._v("的特定实例上实现的，在一些语言当中，也把它称作是静态方法。")]),t._v(" "),a("p",[a("code",[t._v("new")]),t._v("函数会创建一个新的空的字符串实例，你会发现在许多类型当中都会有"),a("code",[t._v("new")]),t._v("函数，因为它只是一个通用函数的名称而已，并且它会创建某种新的值。")]),t._v(" "),a("p",[t._v("总而言之，"),a("code",[t._v("let mut guess = String::new();")]),t._v("这一行代码就是创建一个可变的变量，并且这个变量的值是一个空的字符串实例。")]),t._v(" "),a("p",[t._v("回想一下在程序的第一行代码中，我们通过使用"),a("code",[t._v("use std::io;")]),t._v("语句来从标准库中获取到的有关用户输入输出的关联函数，现在我们从"),a("code",[t._v("io")]),t._v("模块中调用"),a("code",[t._v("stdin")]),t._v("函数。如下:")]),t._v(" "),a("div",{staticClass:"language-rust extra-class"},[a("pre",{pre:!0,attrs:{class:"language-rust"}},[a("code",[t._v("    "),a("span",{pre:!0,attrs:{class:"token namespace"}},[t._v("io"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("::")])]),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("stdin")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("read_line")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("&")]),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("mut")]),t._v(" guess"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n")])])]),a("p",[t._v("如果我们在程序的开头的代码中并没有写"),a("code",[t._v("use std::io;")]),t._v("，我们在这里调用这个函数的时候需要重写成"),a("code",[t._v("std::io::stdin")]),t._v("。"),a("code",[t._v("stdin")]),t._v("是一个返回类型为"),a("a",{attrs:{href:"https://doc.rust-lang.org/std/io/struct.Stdin.html",target:"_blank",rel:"noopener noreferrer"}},[t._v("std::io::stdin"),a("OutboundLink")],1),t._v("的实例，也就是一种类型，代表着为你的终端处理标准的输出。")]),t._v(" "),a("p",[t._v("下一部分代码,"),a("code",[t._v(".read_line(&mut guess)")]),t._v(",调用"),a("a",{attrs:{href:"https://doc.rust-lang.org/std/io/struct.Stdin.html#method.read_line",target:"_blank",rel:"noopener noreferrer"}},[t._v("read_line"),a("OutboundLink")],1),t._v("方法在标准输入中获取并处理用户的输入。我们也为"),a("code",[t._v("read_line")]),t._v("方法传递了一个参数:"),a("code",[t._v("&mut guess")]),t._v("。")]),t._v(" "),a("p",[a("code",[t._v("read_line")]),t._v("的工作就是将用户输入的任何内容带入标准输入库中，并放置到字符串中，所以它将该字符串作为参数。字符串参数必须是可变，因此可以通过添加用户的输入来更改字符串的内容。")]),t._v(" "),a("p",[a("code",[t._v("&")]),t._v("标识符代表参数是引用，它为我们提供了一种方式，也就是我们的代码的很多地方都可以访问到一条数据，也因此不需要做复制数据到内存中的操作。引用是一种复杂的特性，使用引用也比较安全和便捷，这也是"),a("code",[t._v("Rust")]),t._v("的主要优势之一。我们并不需要为了完成这个程序而了解引用的太多细节，现在我们需要知道的就像变量，引用默认是不可变的\n因此我们需要写"),a("code",[t._v("&mut guess")]),t._v("而不是"),a("code",[t._v("&guess")]),t._v("来让变量可变。（第4章会解释引用的更多信息。）")]),t._v(" "),a("h3",{attrs:{id:"使用返回的结果来处理潜在的故障"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#使用返回的结果来处理潜在的故障"}},[t._v("#")]),t._v(" 使用返回的结果来处理潜在的故障")]),t._v(" "),a("p",[t._v("我们接着讨论一下第三行代码，也是属于这一部分的代码，它是一个方法:")]),t._v(" "),a("div",{staticClass:"language-rust extra-class"},[a("pre",{pre:!0,attrs:{class:"language-rust"}},[a("code",[t._v(" "),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("expect")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token string"}},[t._v('"调用read_line失败!"')]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n")])])]),a("p",[t._v("当我们使用类似"),a("code",[t._v(".foo()")]),t._v("的格式来调用方法时，最明智的做法就是引入换行符或者是其它空格来将很长的一行代码进行分隔，因此我们需要重写如上的代码如下:")]),t._v(" "),a("div",{staticClass:"language-rust extra-class"},[a("pre",{pre:!0,attrs:{class:"language-rust"}},[a("code",[t._v("   "),a("span",{pre:!0,attrs:{class:"token namespace"}},[t._v("io"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("::")])]),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("stdin")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("read_line")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("&")]),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("mut")]),t._v(" guess"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("expect")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token string"}},[t._v('"调用read_line失败!"')]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n")])])]),a("p",[t._v("然而这样很长的一行是很难阅读的，所以最好要分割它。现在我们来讨论一下这一行都做了什么。")]),t._v(" "),a("p",[t._v("正如更早之前所提到的，"),a("code",[t._v("read_line")]),t._v("将用户键入的内容放入我们要传递的字符串中，但它还会返回一个值，在这种情况下为"),a("a",{attrs:{href:"https://doc.rust-lang.org/std/io/type.Result.html",target:"_blank",rel:"noopener noreferrer"}},[t._v("io::Result"),a("OutboundLink")],1),t._v("。"),a("code",[t._v("Rust")]),t._v("在它的标准库(一种通用的"),a("a",{attrs:{href:"https://doc.rust-lang.org/std/result/enum.Result.html",target:"_blank",rel:"noopener noreferrer"}},[t._v("Result"),a("OutboundLink")],1),t._v("也作为一个特殊的版本的子模块，就像"),a("code",[t._v("io::Result")]),t._v(")中有一种数值类型叫做"),a("code",[t._v("Result")]),t._v("。")]),t._v(" "),a("p",[a("code",[t._v("Result")]),t._v("是可以进行"),a("a",{attrs:{href:"https://doc.rust-lang.org/book/ch06-00-enums.html",target:"_blank",rel:"noopener noreferrer"}},[t._v("枚举"),a("OutboundLink")],1),t._v("操作的，通常也被作为枚举来提及。一个枚举值也是一个类型可以有许多被修复和设置的值，并且这些值通常也被叫做枚举的变体。第六章会详细介绍枚举。")]),t._v(" "),a("blockquote",[a("p",[t._v("变体，也可以把它理解为回调函数吧。")])]),t._v(" "),a("p",[t._v("对于"),a("code",[t._v("Result")]),t._v("，通常变体就是"),a("code",[t._v("Ok")]),t._v("或者"),a("code",[t._v("Err")]),t._v("。")])])}),[],!1,null,null,null);s.default=e.exports}}]);