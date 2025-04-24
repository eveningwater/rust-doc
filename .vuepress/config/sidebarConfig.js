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
        title: "使用字符串存储 UTF-8 编码的文本",
        path: "/doc/common-collections/hash-maps",
        collapsable: true,
      },
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
    ],
  },
];
