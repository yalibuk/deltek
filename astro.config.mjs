// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import gorselOlcu from './scripts/gorsel-olcu-integration.mjs';

// https://astro.build/config
export default defineConfig({
  // Canlı sitenin kanonik host'u www'lu; apex -> www yönlendirmesi Cloudflare'de.
  site: 'https://www.deltek.com.tr',
  // Mevcut deltek.com.tr'deki tüm URL'ler sondaki eğik çizgiyle çalışıyor.
  // Slug'ları birebir korumak için bu ayar 'always' olmalı (bkz. CLAUDE.md).
  trailingSlash: 'always',
  integrations: [
    // Build sonrası dist HTML'lerinde width/height'sız <img>'lere ölçü ekler (CLS)
    gorselOlcu(),
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
