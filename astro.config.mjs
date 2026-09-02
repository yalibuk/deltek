// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://deltek.com.tr',
  integrations: [
    sitemap({
      // CMS paneli ve içeriksiz sayfaları sitemap dışında bırak
      filter: (page) => !page.includes('/admin'),
      // TR (kök) ↔ EN (/en/) sayfalarını hreflang ile eşle
      i18n: {
        defaultLocale: 'tr',
        locales: {
          tr: 'tr',
          en: 'en',
        },
      },
    }),
  ],
});
