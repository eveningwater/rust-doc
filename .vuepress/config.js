const navConfig = require('./config/navConfig.js')
const sidebarConfig = require('./config/sidebarConfig.js')

module.exports = {
    dest: "./dist",
    base: "/rustDoc/",
    head: [
        ['link', {
            rel: 'icon',
            href: '/logo.svg'
        }]
    ],
    title: 'rust语言中文文档', //网站的标题
    description: 'rust语言的中文文档', //网站的描述
    themeConfig: {
        nav: navConfig,
        sidebar: sidebarConfig
    },
    plugins: {
        '@vuepress/medium-zoom': {
            selector: '.theme-default-content img',
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