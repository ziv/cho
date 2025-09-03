import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: "https://ziv.github.io/cho/",
  title: "CHO",
  description: "documentation",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "Home", link: "/" },
      { text: "Examples", link: "/markdown-examples" },
    ],

    sidebar: [
      {
        text: "Introduction",
        link: "/overview/introduction",
      },
      {
        text: "Quick Start",
        link: "/overview/quick-start",
      },
      {
        text: "Examples",
        items: [
          { text: "Markdown Examples", link: "/markdown-examples" },
          { text: "Runtime API Examples", link: "/api-examples" },
        ],
      },
      {
        text: "RFCs",
        items: [
          { text: "Dependency Injection", link: "/rfcs/di" },
          { text: "Web Interface", link: "/rfcs/web" },
        ],
      },
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/ziv/cho" },
    ],
  },
});
