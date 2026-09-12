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
  // CSS HTML'e gömülür (2026-09-12). İki stylesheet toplam ~10 KB ama ayrı
  // istek olarak yavaş 4G'de boyamayı 868 + 340 ms engelliyordu (PageSpeed
  // "render blocking requests"). Gömülünce istek sıfır; bedeli sayfa başına
  // ~10 KB tekrar ve CSS'in sayfalar arası önbellekten gelmemesi — statik
  // sitede ihmal edilebilir. Varsayılan 'auto' yalnız 4 KB altını gömüyordu.
  build: { inlineStylesheets: 'always' },
  integrations: [
    // Build sonrası dist HTML'lerinde width/height'sız <img>'lere ölçü ekler (CLS)
    gorselOlcu(),
    sitemap({
      // CMS paneli ve noindex sayfaları sitemap dışında bırak.
      // 404: TR'yi Astro zaten özel sayfa sayıp eklemiyor, ama `en/404.astro`
      // trailingSlash yüzünden `/en/404/` olarak normal sayfa gibi görünüyordu
      // ve sitemap'e giriyordu — hem noindex hem de build sonrası
      // `en/404.html`e taşındığı için var olmayan bir adres (bkz.
      // gorsel-olcu-integration.mjs). Search Console'da tarama hatası olurdu.
      filter: (page) => !page.includes('/admin') && !page.includes('/404'),
      // hreflang eşlemesi BURADA DEĞİL: eklentinin i18n seçeneği yolları
      // önekle eşliyor (/x/ ↔ /en/x/), oysa EN adresler İngilizce. Eşleme
      // dosya adı üzerinden scripts/seo-integration.mjs'de yapılıyor.
    }),
    // sitemap'ten SONRA: lastmod'u onun yazdığı dosyaya ekler; ayrıca RSS, llms.txt, dış bağlantı rel
    seoEk(),
  ],
});
