import { defineConfig } from "vitepress";
import { sidebarList } from "./sidebar";
export default defineConfig({
  base: process.env.NODE_ENV === "production" ? "/rust-doc/" : "/",
  // 站点配置
  lang: "zh-CN",
  title: "Rust 编程语言",
  description: "Rust 编程语言中文文档",
  head: [['link', { rel: 'icon', href: '/rust-logo.svg' }]],
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

    search: {
      provider: "local",
    },

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
  },
});
