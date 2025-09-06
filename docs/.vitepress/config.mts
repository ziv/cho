import { defineConfig } from "vitepress";

/*
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-SXHNBW6X10"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-SXHNBW6X10');
</script>
 */
// https://vitepress.dev/reference/site-config
export default defineConfig({
  markdown: {
    lineNumbers: true,
  },
  head: [
    [
      "script",
      {
        async: true,
        src: "https://www.googletagmanager.com/gtag/js?id=G-SXHNBW6X10",
      },
    ],
    [
      "script",
      {},
      ` 
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-SXHNBW6X10');
            `,
    ],
  ],
  base: "/cho/",

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
        text: "Guides",
        items: [
          {
            text: "Dependency Injection",
            collapsed: true,
            items: [
              { text: "Overview", link: "/guide/di-overview" },
              { text: "Providers", link: "/guide/di-providers" },
              {
                text: "Injectables",
                link: "/guide/di-injectables",
              },
              { text: "Modules", link: "/guide/di-modules" },
              { text: "Injector", link: "/guide/injectables" },
              { text: "Testing", link: "/guide/injectables" },
            ],
          },
          {
            text: "Web Server",
            collapsed: true,
            items: [
              {
                text: "Quick Start",
                link: "/guide/web-quick-start",
              },
              { text: "Controllers", link: "/guide/controllers" },
              { text: "Providers", link: "/guide/providers" },
              { text: "Middlewares", link: "/guide/middlewares" },
            ],
          },
          {
            text: "Other Servers",
            collapsed: true,
            items: [
              { text: "Controllers", link: "/guide/x" },
              { text: "Providers", link: "/guide/s" },
              { text: "Middlewares", link: "/guide/a" },
            ],
          },
        ],
      },
      {
        text: "Packages",
        items: [
          { text: "@chojs/core", link: "/packages/core" },
          { text: "@chojs/web", link: "/packages/web" },
          { text: "@chojs/vendor", link: "/packages/vendor" },
        ],
      },
      {
        text: "Specs",
        items: [
          { text: "Dependency Injection", link: "/rfcs/di" },
          { text: "Web Interface", link: "/rfcs/web" },
        ],
      },
      {
        text: "API Reference",
        link: "https://ziv.github.io/cho/ref/all_symbols.html",
      },
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/ziv/cho" },
    ],
  },
});
