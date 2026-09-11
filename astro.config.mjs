// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import gorselOlcu from './scripts/gorsel-olcu-integration.mjs';
import seoEk from './scripts/seo-integration.mjs';

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
      // hreflang eşlemesi BURADA DEĞİL: eklentinin i18n seçeneği yolları
      // önekle eşliyor (/x/ ↔ /en/x/), oysa EN adresler İngilizce. Eşleme
      // dosya adı üzerinden scripts/seo-integration.mjs'de yapılıyor.
    }),
    // sitemap'ten SONRA: lastmod'u onun yazdığı dosyaya ekler; ayrıca RSS, llms.txt, dış bağlantı rel
    seoEk(),
  ],
});
