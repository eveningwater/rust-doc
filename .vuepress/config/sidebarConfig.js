module.exports = [
    {
        title: 'Rust介绍',
        path: '/doc/introduce', 
        collapsable: true,
        sidebarDepth:1
    },
    {
        title: '入门',
        path: '/doc/getting-started', 
        collapsable: true,
        children: [
            {
                title: '安装',
                path:"/doc/install",
                collapsable: true
            },
            {
                title: 'hello,world',
                path:"/doc/hello-world",
                collapsable: true
            },
            {
                title: 'hello,cargo',
                path:"/doc/hello-cargo",
                collapsable: true
            }
        ]
    },
    {
        title: '猜一猜游戏',
        path: '/doc/guess-game', 
        collapsable: true,
        sidebarDepth:1
    },
    {
        title: '常用的编程概念',
        path: '/doc/common-concept', 
        collapsable: true,
        children:[
            {
                title: '变量与可变性',
                path:"/doc/variable-and-mutability",
                collapsable: true
            },
            {
                title: '数据类型',
                path:"/doc/data-type",
                collapsable: true
            },
            {
                title: '函数',
                path:"/doc/functions",
                collapsable: true
            },
            {
                title: '控制流',
                path:"/doc/control-flow",
                collapsable: true
            },
        ]
    },
    {
        title: '明白所有权',
        path: '/doc/understand-ownership', 
        collapsable: true,
        children:[
            {
                title: '什么是所有权',
                path:"/doc/what-ownership",
                collapsable: true
            },
            {
                title: '引用与借用',
                path:"/doc/references-and-borrow",
                collapsable: true
            },
            {
                title: '切片类型',
                path:"/doc/slice-type",
                collapsable: true
            },
        ]
    },
]