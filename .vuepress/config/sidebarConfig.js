module.exports = [
  {
    title: "Rust介绍",
    path: "/doc/introduce/introduce",
    collapsable: true,
    sidebarDepth: 1,
  },
  {
    title: "入门",
    path: "/doc/getting-started/getting-started",
    collapsable: true,
    children: [
      {
        title: "安装",
        path: "/doc/getting-started/install",
        collapsable: true,
      },
      {
        title: "hello,world",
        path: "/doc/getting-started/hello-world",
        collapsable: true,
      },
      {
        title: "hello,cargo",
        path: "/doc/getting-started/hello-cargo",
        collapsable: true,
      },
    ],
  },
  {
    title: "猜一猜游戏",
    path: "/doc/guess-game/guess-game",
    collapsable: true,
    sidebarDepth: 1,
  },
  {
    title: "常用的编程概念",
    path: "/doc/common-concept/common-concept",
    collapsable: true,
    children: [
      {
        title: "变量与可变性",
        path: "/doc/common-concept/variable-and-mutability",
        collapsable: true,
      },
      {
        title: "数据类型",
        path: "/doc/common-concept/data-type",
        collapsable: true,
      },
      {
        title: "函数",
        path: "/doc/common-concept/functions",
        collapsable: true,
      },
      {
        title: "注释",
        path: "/doc/common-concept/comments",
        collapsable: true,
      },
      {
        title: "控制流",
        path: "/doc/common-concept/control-flow",
        collapsable: true,
      },
    ],
  },
  {
    title: "认识所有权",
    path: "/doc/understand-ownership/understand-ownership",
    collapsable: true,
    children: [
      {
        title: "什么是所有权",
        path: "/doc/understand-ownership/what-ownership",
        collapsable: true,
      },
      {
        title: "引用与借用",
        path: "/doc/understand-ownership/references-and-borrow",
        collapsable: true,
      },
      {
        title: "切片类型",
        path: "/doc/understand-ownership/slice-type",
        collapsable: true,
      },
    ],
  },
  {
    title: "使用结构体来构造相关数据",
    path: "/doc/structs/structs",
    collapsable: true,
    children: [
      {
        title: "定义和实例化结构体",
        path: "/doc/structs/defining-structs",
        collapsable: true,
      },
      {
        title: "使用结构体的示例程序",
        path: "/doc/structs/example-structs",
        collapsable: true,
      },
      {
        title: "方法语法",
        path: "/doc/structs/method-syntax",
        collapsable: true,
      },
    ],
  },
  {
    title: "枚举",
    path: "/doc/enums/enums",
    collapsable: true,
    children: [
      {
        title: "定义一个枚举",
        path: "/doc/enums/defining-an-enum",
        collapsable: true,
      },
      {
        title: "match控制流",
        path: "/doc/enums/match",
        collapsable: true,
      },
      {
        title: "使用if let语法简化控制流",
        path: "/doc/enums/if-let",
        collapsable: true,
      },
    ],
  },
  {
    title: "使用包、依赖箱和模块管理不断增长的项目",
    path: "/doc/packages-crates-and-modules/packages-crates-and-modules",
    collapsable: true,
    children: [
      {
        title: "包与依赖箱",
        path: "/doc/packages-crates-and-modules/packages-and-crates",
        collapsable: true,
      },
      {
        title: "定义模块以控制上下文和私有作用域",
        path: "/doc/packages-crates-and-modules/defining-modules",
        collapsable: true,
      },
      {
        title: "引用模块树中项目的路径",
        path: "/doc/packages-crates-and-modules/paths-for-referring-to",
        collapsable: true,
      },
      {
        title: "使用 use 关键字将路径纳入上下文",
        path: "/doc/packages-crates-and-modules/bringing-paths",
        collapsable: true,
      },
      {
        title: "将模块分成不同的文件",
        path: "/doc/packages-crates-and-modules/separating",
        collapsable: true,
      },
    ],
  },
  {
    title: "常用集合",
    path: "/doc/common-collections/common-collections",
    collapsable: true,
    children: [
      {
        title: "使用向量存储值列表",
        path: "/doc/common-collections/vectors",
        collapsable: true,
      },
      {
        title: "使用字符串存储 UTF-8 编码的文本",
        path: "/doc/common-collections/strings",
        collapsable: true,
      },
      {
        title: "在哈希映射中存储键值对",
        path: "/doc/common-collections/hash-maps",
        collapsable: true,
      },
    ],
  },
  {
    title: "错误处理",
    path: "/doc/error-handling/error-handling",
    collapsable: true,
    children: [
      {
        title: "使用 panic! 处理不可恢复的错误",
        path: "/doc/error-handling/unrecoverable-errors-with-panic",
        collapsable: true,
      },
      {
        title: "可恢复错误及结果",
        path: "/doc/error-handling/recoverable-errors-with-result",
        collapsable: true,
      },
      {
        title: "要 panic! 还是不要 panic!",
        path: "/doc/error-handling/to-panic-or-not-to-panic",
        collapsable: true,
      },
    ],
  },
  {
    title: "泛型类型、特性和生命周期",
    path: "/doc/generics/generics",
    collapsable: true,
    children: [
      {
        title: "泛型数据类型",
        path: "/doc/generics/generic-syntax",
        collapsable: true,
      },
      {
        title: "特性（Traits）：定义共享行为",
        path: "/doc/generics/traits",
        collapsable: true,
      },
      {
        title: "使用生命周期验证引用",
        path: "/doc/generics/lifetime-syntax",
        collapsable: true,
      },
    ],
  },
  {
    title: "测试",
    path: "/doc/testing/testing",
    collapsable: true,
    children: [
      {
        title: "编写测试",
        path: "/doc/testing/writing-tests",
        collapsable: true,
      },
      {
        title: "运行测试",
        path: "/doc/testing/running-tests",
        collapsable: true,
      },
      {
        title: "测试的组织结构",
        path: "/doc/testing/test-organization",
        collapsable: true,
      },
    ],
  },
  {
    title: "I/O 项目：构建命令行程序",
    path: "/doc/an-io-project/an-io-project",
    collapsable: true,
    children: [
      {
        title: "接受命令行参数",
        path: "/doc/an-io-project/accepting-command-line-arguments",
        collapsable: true,
      },
      {
        title: "读取文件",
        path: "/doc/an-io-project/reading-a-file",
        collapsable: true,
      },
      {
        title: "重构以提高模块化和错误处理",
        path: "/doc/an-io-project/improving-error-handling-and-modularity",
        collapsable: true,
      },
      {
        title: "使用测试驱动开发来开发库的功能",
        path: "/doc/an-io-project/testing-the-librarys-functionality",
        collapsable: true,
      },
      {
        title: "使用环境变量",
        path: "/doc/an-io-project/working-with-environment-variables",
        collapsable: true,
      },
      {
        title: "使用外部命令",
        path: "/doc/an-io-project/writing-to-stderr-instead-of-stdout",
        collapsable: true,
      },
    ],
  },
  {
    title: "函数式语言特性：迭代器与闭包",
    path: "/doc/functional-features/functional-features",
    collapsable: true,
    children: [
      {
        title: "闭包：捕获其环境的匿名函数",
        path: "/doc/functional-features/closures",
        collapsable: true,
      },
      {
        title: "使用迭代器处理一系列项",
        path: "/doc/functional-features/iterators",
        collapsable: true,
      },
      {
        title: "改进我们的 I/O 项目",
        path: "/doc/functional-features/improving-our-io-project",
        collapsable: true,
      },
      {
        title: "比较性能：循环 vs. 迭代器",
        path: "/doc/functional-features/performance",
        collapsable: true,
      },
    ],
  },
  {
    title: "关于 Cargo 和 Crates.io 的更多信息",
    path: "/doc/more-about-cargo/more-about-cargo",
    collapsable: true,
    children: [
      {
        title: "使用发布配置文件自定义构建",
        path: "/doc/more-about-cargo/release-profiles",
        collapsable: true,
      },
      {
        title: "将 Crate 发布到 Crates.io",
        path: "/doc/more-about-cargo/publishing-to-crates-io",
        collapsable: true,
      },
      {
        title: "使用 Cargo 构建工作空间",
        path: "/doc/more-about-cargo/cargo-workspaces",
        collapsable: true,
      },
      {
        title: "使用 `cargo install` 安装二进制文件",
        path: "/doc/more-about-cargo/installing-binaries",
        collapsable: true,
      },
      {
        title: "使用自定义命令扩展 Cargo",
        path: "/doc/more-about-cargo/extending-cargo",
        collapsable: true,
      },
    ],
  },
  {
    title: "智能指针",
    path: "/doc/smart-pointers/smart-pointers",
    collapsable: true,
    children: [
      {
        title: "使用 Box<T> 指向堆上的数据",
        path: "/doc/smart-pointers/box",
        collapsable: true,
      },
      {
        title: "通过`Deref`特性将智能指针视为常规引用",
        path: "/doc/smart-pointers/deref",
        collapsable: true,
      },
      {
        title: "使用`Drop`特性在清理时运行代码",
        path: "/doc/smart-pointers/drop",
        collapsable: true,
      },
      {
        title: "`Rc<T>`，引用计数智能指针",
        path: "/doc/smart-pointers/rc",
        collapsable: true,
      },
      {
        title: "`RefCell<T>`和内部可变性模式",
        path: "/doc/smart-pointers/interior-mutability",
        collapsable: true,
      },
      {
        title: "引用循环可能导致内存泄漏",
        path: "/doc/smart-pointers/reference-cycles",
        collapsable: true,
      },
    ],
  },
  {
    title: "无畏并发",
    path: "/doc/concurrency/concurrency",
    collapsable: true,
    children: [
      {
        title: "使用线程同时运行代码",
        path: "/doc/concurrency/threads",
        collapsable: true,
      },
      {
        title: "使用消息传递在线程间传递数据",
        path: "/doc/concurrency/message-passing",
        collapsable: true,
      },
      {
        title: "共享状态并发",
        path: "/doc/concurrency/shared-state",
        collapsable: true,
      },
      {
        title: "使用`Send`和`Sync`特性的可扩展并发",
        path: "/doc/concurrency/extensible-concurrency-sync-and-send",
        collapsable: true,
      },
    ],
  },
  {
    title: "异步编程基础：Async、Await、Futures 和 Streams",
    path: "/doc/async-await/async-await",
    collapsable: true,
    children: [
      {
        title: "Future 与异步语法",
        path: "/doc/async-await/futures-and-syntax",
        collapsable: true,
      },
      {
        title: "应用异步并发",
        path: "/doc/async-await/concurrency-with-async",
        collapsable: true,
      },
      {
        title: "处理任意数量的 Future",
        path: "/doc/async-await/more-futures",
        collapsable: true,
      },
      {
        title: "流：按顺序排列的 Future",
        path: "/doc/async-await/streams",
        collapsable: true,
      },
      {
        title: "深入了解异步特性",
        path: "/doc/async-await/traits-for-async",
        collapsable: true,
      },
      {
        title: "整合：Future、任务和线程",
        path: "/doc/async-await/futures-tasks-threads",
        collapsable: true,
      },
    ],
  },
  {
    title: "面向对象编程特性",
    path: "/doc/oop/oop",
    collapsable: true,
    children: [
      {
        title: "什么是面向对象",
        path: "/doc/oop/what-is-oo",
        collapsable: true,
      },
      {
        title: "使用特征对象来允许不同类型的值",
        path: "/doc/oop/trait-objects",
        collapsable: true,
      },
      {
        title: "实现面向对象的设计模式",
        path: "/doc/oop/oo-design-patterns",
        collapsable: true,
      },
    ],
  },
  {
    title: "模式与匹配",
    path: "/doc/patterns/patterns",
    collapsable: true,
    children: [
      {
        title: "模式可以使用的所有位置",
        path: "/doc/patterns/all-the-places-for-patterns",
        collapsable: true,
      },
      {
        title: "可驳性：模式是否可能匹配失败",
        path: "/doc/patterns/refutability",
        collapsable: true,
      },
      {
        title: "模式语法",
        path: "/doc/patterns/pattern-syntax",
        collapsable: true,
      },
    ],
  },
  {
    title: "高级特性",
    path: "/doc/advanced-features/advanced-features",
    collapsable: true,
    children: [
      {
        title: "不安全的rust",
        path: "/doc/advanced-features/unsafe-rust",
        collapsable: true,
      },
      {
        title: "高级特征",
        path: "/doc/advanced-features/advanced-traits",
        collapsable: true,
      },
      {
        title: "高级类型",
        path: "/doc/advanced-features/advanced-types",
        collapsable: true,
      },
      {
        title: "高级函数和闭包",
        path: "/doc/advanced-features/advanced-functions-and-closures",
        collapsable: true,
      },
      {
        title: "宏",
        path: "/doc/advanced-features/macros",
        collapsable: true,
      },
    ],
  },
  {
    title: "最终项目：构建多线程Web服务器",
    path: "/doc/final-project/final-project",
    collapsable: true,
    children: [
      {
        title: "构建单线程Web服务器",
        path: "/doc/final-project/single-threaded",
        collapsable: true,
      },
      {
        title: "将单线程服务器转换为多线程服务器",
        path: "/doc/final-project/multithreaded",
        collapsable: true,
      },
      {
        title: "优雅关闭和清理",
        path: "/doc/final-project/graceful-shutdown-and-cleanup",
        collapsable: true,
      }
    ],
  },
  {
    title: "附录",
    collapsable: true,
    children: [
      {
        title: "附录A: 关键字",
        path: "/doc/appendix/appendix-a",
        collapsable: true,
      },
      {
        title: "附录B: 运算符和符号",
        path: "/doc/appendix/appendix-b",
        collapsable: true,
      },
      {
        title: "附录C: 可衍生的特征",
        path: "/doc/appendix/appendix-c",
        collapsable: true,
      },
      {
        title: "附录D: 实用开发工具",
        path: "/doc/appendix/appendix-d",
        collapsable: true,
      },
      {
        title: "附录E: 版本",
        path: "/doc/appendix/appendix-e",
        collapsable: true,
      },
      {
        title: "附录F: 本书的翻译", 
        path: "/doc/appendix/appendix-f",
        collapsable: true,
      },
      {
        title: "附录G: Rust 是如何开发的以及 Nightly Rust",
        path: "/doc/appendix/appendix-g",
        collapsable: true,
      },
    ],
  },
];
