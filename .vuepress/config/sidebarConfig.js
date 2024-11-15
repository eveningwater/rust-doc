module.exports = [
    {
        title: 'Rust介绍',
        path: '/doc/introduce/introduce', 
        collapsable: true,
        sidebarDepth:1
    },
    {
        title: '入门',
        path: '/doc/getting-started/getting-started', 
        collapsable: true,
        children: [
            {
                title: '安装',
                path:"/doc/getting-started/install",
                collapsable: true
            },
            {
                title: 'hello,world',
                path:"/doc/getting-started/hello-world",
                collapsable: true
            },
            {
                title: 'hello,cargo',
                path:"/doc/getting-started/hello-cargo",
                collapsable: true
            }
        ]
    },
    {
        title: '猜一猜游戏',
        path: '/doc/guess-game/guess-game', 
        collapsable: true,
        sidebarDepth:1
    },
    {
        title: '常用的编程概念',
        path: '/doc/common-concept/common-concept', 
        collapsable: true,
        children:[
            {
                title: '变量与可变性',
                path:"/doc/common-concept/variable-and-mutability",
                collapsable: true
            },
            {
                title: '数据类型',
                path:"/doc/common-concept/data-type",
                collapsable: true
            },
            {
                title: '函数',
                path:"/doc/common-concept/functions",
                collapsable: true
            },
            {
                title: '控制流',
                path:"/doc/common-concept/control-flow",
                collapsable: true
            },
        ]
    },
    {
        title: '认识所有权',
        path: '/doc/understand-ownership/understand-ownership', 
        collapsable: true,
        children:[
            {
                title: '什么是所有权',
                path:"/doc/understand-ownership/what-ownership",
                collapsable: true
            },
            {
                title: '引用与借用',
                path:"/doc/understand-ownership/references-and-borrow",
                collapsable: true
            },
            {
                title: '切片类型',
                path:"/doc/understand-ownership/slice-type",
                collapsable: true
            },
        ]
    },
    {
        title: '使用结构体来构造相关数据',
        path: '/doc/structs/structs', 
        collapsable: true,
        children:[
            {
                title: '定义和实例化结构体',
                path:"/doc/structs/defining-structs",
                collapsable: true
            },
        ]
    },
    {
        title: '附录',
        collapsable: true,
        children:[
            {
                title: '附录A: 关键字',
                path:"/doc/appendix/appendix-a",
                collapsable: true
            },
            {
                title: '附录B: 运算符和符号',
                path:"/doc/appendix/appendix-b",
                collapsable: true
            },
        ]
    },
]