const navConfig = require('./config/navConfig.js')
const sidebarConfig = require('./config/sidebarConfig.js')

module.exports = {
    dest: "./dist",
    base: process.env.NODE_ENV !== 'development' ? "/rust-doc/" : '/',
    head: [
        ['link', {
            rel: 'icon',
            href: '/logo.svg'
        }],
        [
            'script', {type: 'text/javascript', src: 'https://fastly.jsdelivr.net/gh/stevenjoezhang/live2d-widget@latest/autoload.js'}
        ]
    ],
    title: 'rust语言中文文档', //网站的标题
    description: '一门赋予每个人构建可靠且高效软件能力的语言。', //网站的描述
    themeConfig: {
        nav: navConfig,
        sidebar: sidebarConfig
    },
    plugins: {
        '@vuepress/medium-zoom': {
            selector: '#app img',
            // medium-zoom options here
            // See: https://github.com/francoischalifour/medium-zoom#options
            options: {
                margin: 16
            }
        },
        '@vuepress/back-to-top': true
    },
    configureWebpack: {
        resolve: {
            alias: {
                '@': '/'
            }
        }
    }
}