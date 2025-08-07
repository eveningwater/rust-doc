import { defineConfig } from "vitepress";
import { sidebarList } from "./sidebar";
export default defineConfig({
  base: process.env.NODE_ENV === "production" ? "/rust-doc/" : "/",
  // 站点配置
  lang: "zh-CN",
  title: "Rust 编程语言",
  description: "Rust 编程语言中文文档",
  head: [
    ['link', { rel: 'icon', href: process.env.NODE_ENV === "production" ? '/rust-doc/rust-logo.svg' : '/rust-logo.svg' }],
    ['meta', { name: 'theme-color', content: '#f97316' }],
    ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
    ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' }],
  ],
  
  // 外观配置
  appearance: true,

  // 最后更新时间
  lastUpdated: true,

  // 主题配置
  themeConfig: {
    logo: "/rust-logo.svg",
    
    // 导航栏
    nav: [
      { text: "首页", link: "/" },
      {
        text: "Rust入门教程",
        link: "https://www.eveningwater.com/docs/index.html?type=rust-course",
      },
      {
        text: "英文原版",
        link: "https://doc.rust-lang.org/book/title-page.html",
      },
    ],

    // 侧边栏
    sidebar: sidebarList,

    // 文章翻页
    docFooter: {
      prev: "上一篇",
      next: "下一篇",
    },

    // 搜索配置
    search: {
      provider: 'local',
      options: {
        locales: {
          zh: {
            translations: {
              button: {
                buttonText: "搜索文档",
                buttonAriaLabel: "搜索文档"
              },
              modal: {
                noResultsText: "无法找到相关结果",
                resetButtonTitle: "清除查询条件",
                footer: {
                  selectText: "选择",
                  navigateText: "切换"
                }
              }
            }
          }
        }
      }
    },

    // 社交链接
    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/eveningwater/rust-doc",
      },
    ],

    // 页脚
    footer: {
      message: "MIT Licensed | Copyright © 2020-present eveningwater",
    },

    // 大纲配置
    outline: {
      level: [2, 3],
      label: '目录'
    },

    // 最后更新时间
    lastUpdated: {
      text: '最后更新',
      formatOptions: {
        dateStyle: 'full',
        timeStyle: 'medium'
      }
    },

    // 编辑链接
    editLink: {
      pattern: 'https://github.com/eveningwater/rust-doc/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页'
    }
  }
});
