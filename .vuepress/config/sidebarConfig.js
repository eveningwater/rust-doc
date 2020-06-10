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
]