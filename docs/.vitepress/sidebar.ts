export const sidebarList = [
  {
    text: "Rust介绍",
    link: "/docs/introduce/introduce",
  },
  {
    text: "入门",
    link: "/docs/getting-started/getting-started",
    items: [
      {
        text: "安装",
        link: "/docs/getting-started/install",
      },
      {
        text: "hello,world",
        link: "/docs/getting-started/hello-world",
      },
      {
        text: "hello,cargo",
        link: "/docs/getting-started/hello-cargo",
      },
    ],
  },
  {
    text: "猜一猜游戏",
    link: "/docs/guess-game/guess-game",
  },
  {
    text: "常用的编程概念",
    link: "/docs/common-concept/common-concept",
    items: [
      {
        text: "变量与可变性",
        link: "/docs/common-concept/variable-and-mutability",
      },
      {
        text: "数据类型",
        link: "/docs/common-concept/data-type",
      },
      {
        text: "函数",
        link: "/docs/common-concept/functions",
      },
      {
        text: "注释",
        link: "/docs/common-concept/comments",
      },
      {
        text: "控制流",
        link: "/docs/common-concept/control-flow",
      },
    ],
  },
  {
    text: "认识所有权",
    link: "/docs/understand-ownership/understand-ownership",
    items: [
      {
        text: "什么是所有权",
        link: "/docs/understand-ownership/what-ownership",
      },
      {
        text: "引用与借用",
        link: "/docs/understand-ownership/references-and-borrow",
      },
      {
        text: "切片类型",
        link: "/docs/understand-ownership/slice-type",
      },
    ],
  },
  {
    text: "使用结构体来构造相关数据",
    link: "/docs/structs/structs",
    items: [
      {
        text: "定义和实例化结构体",
        link: "/docs/structs/defining-structs",
      },
      {
        text: "使用结构体的示例程序",
        link: "/docs/structs/example-structs",
      },
      {
        text: "方法语法",
        link: "/docs/structs/method-syntax",
      },
    ],
  },
  {
    text: "枚举",
    link: "/docs/enums/enums",
    items: [
      {
        text: "定义一个枚举",
        link: "/docs/enums/defining-an-enum",
      },
      {
        text: "match控制流",
        link: "/docs/enums/match",
      },
      {
        text: "使用if let语法简化控制流",
        link: "/docs/enums/if-let",
      },
    ],
  },
  {
    text: "使用包、依赖箱和模块管理不断增长的项目",
    link: "/docs/packages-crates-and-modules/packages-crates-and-modules",

    items: [
      {
        text: "包与依赖箱",
        link: "/docs/packages-crates-and-modules/packages-and-crates",
      },
      {
        text: "定义模块以控制上下文和私有作用域",
        link: "/docs/packages-crates-and-modules/defining-modules",
      },
      {
        text: "引用模块树中项目的路径",
        link: "/docs/packages-crates-and-modules/links-for-referring-to",
      },
      {
        text: "使用 use 关键字将路径纳入上下文",
        link: "/docs/packages-crates-and-modules/bringing-links",
      },
      {
        text: "将模块分成不同的文件",
        link: "/docs/packages-crates-and-modules/separating",
      },
    ],
  },
  {
    text: "常用集合",
    link: "/docs/common-collections/common-collections",
    items: [
      {
        text: "使用向量存储值列表",
        link: "/docs/common-collections/vectors",
      },
      {
        text: "使用字符串存储 UTF-8 编码的文本",
        link: "/docs/common-collections/strings",
      },
      {
        text: "在哈希映射中存储键值对",
        link: "/docs/common-collections/hash-maps",
      },
    ],
  },
  {
    text: "错误处理",
    link: "/docs/error-handling/error-handling",
    items: [
      {
        text: "使用 panic! 处理不可恢复的错误",
        link: "/docs/error-handling/unrecoverable-errors-with-panic",
      },
      {
        text: "可恢复错误及结果",
        link: "/docs/error-handling/recoverable-errors-with-result",
      },
      {
        text: "要 panic! 还是不要 panic!",
        link: "/docs/error-handling/to-panic-or-not-to-panic",
      },
    ],
  },
  {
    text: "泛型类型、特性和生命周期",
    link: "/docs/generics/generics",
    items: [
      {
        text: "泛型数据类型",
        link: "/docs/generics/generic-syntax",
      },
      {
        text: "特性（Traits）：定义共享行为",
        link: "/docs/generics/traits",
      },
      {
        text: "使用生命周期验证引用",
        link: "/docs/generics/lifetime-syntax",
      },
    ],
  },
  {
    text: "测试",
    link: "/docs/testing/testing",
    items: [
      {
        text: "编写测试",
        link: "/docs/testing/writing-tests",
      },
      {
        text: "运行测试",
        link: "/docs/testing/running-tests",
      },
      {
        text: "测试的组织结构",
        link: "/docs/testing/test-organization",
      },
    ],
  },
  {
    text: "I/O 项目：构建命令行程序",
    link: "/docs/an-io-project/an-io-project",
    items: [
      {
        text: "接受命令行参数",
        link: "/docs/an-io-project/accepting-command-line-arguments",
      },
      {
        text: "读取文件",
        link: "/docs/an-io-project/reading-a-file",
      },
      {
        text: "重构以提高模块化和错误处理",
        link: "/docs/an-io-project/improving-error-handling-and-modularity",
      },
      {
        text: "使用测试驱动开发来开发库的功能",
        link: "/docs/an-io-project/testing-the-librarys-functionality",
      },
      {
        text: "使用环境变量",
        link: "/docs/an-io-project/working-with-environment-variables",
      },
      {
        text: "使用外部命令",
        link: "/docs/an-io-project/writing-to-stderr-instead-of-stdout",
      },
    ],
  },
  {
    text: "函数式语言特性：迭代器与闭包",
    link: "/docs/functional-features/functional-features",
    items: [
      {
        text: "闭包：捕获其环境的匿名函数",
        link: "/docs/functional-features/closures",
      },
      {
        text: "使用迭代器处理一系列项",
        link: "/docs/functional-features/iterators",
      },
      {
        text: "改进我们的 I/O 项目",
        link: "/docs/functional-features/improving-our-io-project",
      },
      {
        text: "比较性能：循环 vs. 迭代器",
        link: "/docs/functional-features/performance",
      },
    ],
  },
  {
    text: "关于 Cargo 和 Crates.io 的更多信息",
    link: "/docs/more-about-cargo/more-about-cargo",
    items: [
      {
        text: "使用发布配置文件自定义构建",
        link: "/docs/more-about-cargo/release-profiles",
      },
      {
        text: "将 Crate 发布到 Crates.io",
        link: "/docs/more-about-cargo/publishing-to-crates-io",
      },
      {
        text: "使用 Cargo 构建工作空间",
        link: "/docs/more-about-cargo/cargo-workspaces",
      },
      {
        text: "使用 `cargo install` 安装二进制文件",
        link: "/docs/more-about-cargo/installing-binaries",
      },
      {
        text: "使用自定义命令扩展 Cargo",
        link: "/docs/more-about-cargo/extending-cargo",
      },
    ],
  },
  {
    text: "智能指针",
    link: "/docs/smart-pointers/smart-pointers",
    items: [
      {
        text: "使用 Box<T> 指向堆上的数据",
        link: "/docs/smart-pointers/box",
      },
      {
        text: "通过`Deref`特性将智能指针视为常规引用",
        link: "/docs/smart-pointers/deref",
      },
      {
        text: "使用`Drop`特性在清理时运行代码",
        link: "/docs/smart-pointers/drop",
      },
      {
        text: "`Rc<T>`，引用计数智能指针",
        link: "/docs/smart-pointers/rc",
      },
      {
        text: "`RefCell<T>`和内部可变性模式",
        link: "/docs/smart-pointers/interior-mutability",
      },
      {
        text: "引用循环可能导致内存泄漏",
        link: "/docs/smart-pointers/reference-cycles",
      },
    ],
  },
  {
    text: "无畏并发",
    link: "/docs/concurrency/concurrency",
    items: [
      {
        text: "使用线程同时运行代码",
        link: "/docs/concurrency/threads",
      },
      {
        text: "使用消息传递在线程间传递数据",
        link: "/docs/concurrency/message-passing",
      },
      {
        text: "共享状态并发",
        link: "/docs/concurrency/shared-state",
      },
      {
        text: "使用`Send`和`Sync`特性的可扩展并发",
        link: "/docs/concurrency/extensible-concurrency-sync-and-send",
      },
    ],
  },
  {
    text: "异步编程基础：Async、Await、Futures 和 Streams",
    link: "/docs/async-await/async-await",
    items: [
      {
        text: "Future 与异步语法",
        link: "/docs/async-await/futures-and-syntax",
      },
      {
        text: "应用异步并发",
        link: "/docs/async-await/concurrency-with-async",
      },
      {
        text: "处理任意数量的 Future",
        link: "/docs/async-await/more-futures",
      },
      {
        text: "流：按顺序排列的 Future",
        link: "/docs/async-await/streams",
      },
      {
        text: "深入了解异步特性",
        link: "/docs/async-await/traits-for-async",
      },
      {
        text: "整合：Future、任务和线程",
        link: "/docs/async-await/futures-tasks-threads",
      },
    ],
  },
  {
    text: "面向对象编程特性",
    link: "/docs/oop/oop",
    items: [
      {
        text: "什么是面向对象",
        link: "/docs/oop/what-is-oo",
      },
      {
        text: "使用特征对象来允许不同类型的值",
        link: "/docs/oop/trait-objects",
      },
      {
        text: "实现面向对象的设计模式",
        link: "/docs/oop/oo-design-patterns",
      },
    ],
  },
  {
    text: "模式与匹配",
    link: "/docs/patterns/patterns",
    items: [
      {
        text: "模式可以使用的所有位置",
        link: "/docs/patterns/all-the-places-for-patterns",
      },
      {
        text: "可驳性：模式是否可能匹配失败",
        link: "/docs/patterns/refutability",
      },
      {
        text: "模式语法",
        link: "/docs/patterns/pattern-syntax",
      },
    ],
  },
  {
    text: "高级特性",
    link: "/docs/advanced-features/advanced-features",
    items: [
      {
        text: "不安全的rust",
        link: "/docs/advanced-features/unsafe-rust",
      },
      {
        text: "高级特征",
        link: "/docs/advanced-features/advanced-traits",
      },
      {
        text: "高级类型",
        link: "/docs/advanced-features/advanced-types",
      },
      {
        text: "高级函数和闭包",
        link: "/docs/advanced-features/advanced-functions-and-closures",
      },
      {
        text: "宏",
        link: "/docs/advanced-features/macros",
      },
    ],
  },
  {
    text: "最终项目：构建多线程Web服务器",
    link: "/docs/final-project/final-project",
    items: [
      {
        text: "构建单线程Web服务器",
        link: "/docs/final-project/single-threaded",
      },
      {
        text: "将单线程服务器转换为多线程服务器",
        link: "/docs/final-project/multithreaded",
      },
      {
        text: "优雅关闭和清理",
        link: "/docs/final-project/graceful-shutdown-and-cleanup",
      },
    ],
  },
  {
    text: "附录",
    link: "/docs/appendix/appendix-a",
    items: [
      {
        text: "附录A: 关键字",
        link: "/docs/appendix/appendix-a",
      },
      {
        text: "附录B: 运算符和符号",
        link: "/docs/appendix/appendix-b",
      },
      {
        text: "附录C: 可衍生的特征",
        link: "/docs/appendix/appendix-c",
      },
      {
        text: "附录D: 实用开发工具",
        link: "/docs/appendix/appendix-d",
      },
      {
        text: "附录E: 版本",
        link: "/docs/appendix/appendix-e",
      },
      {
        text: "附录F: 翻译",
        link: "/docs/appendix/appendix-f",
      },
      {
        text: "附录G: Rust 是如何开发的以及 Nightly Rust",
        link: "/docs/appendix/appendix-g",
      },
    ],
  },
];
