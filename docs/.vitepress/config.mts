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
        text: "Examples",
        items: [
          { text: "Markdown Examples", link: "/markdown-examples" },
          { text: "Runtime API Examples", link: "/api-examples" },
        ],
      },
      {
        text: "Specs",
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
