# Deltek — deltek.com.tr

Deltek kurumsal sitesi. Bu iskelet, Boremak sitesinden kopyalanıp markaya özgü tüm
ürün/makine içeriği çıkarılarak hazırlandı; layout, i18n, CMS ve SEO altyapısı korundu.

## Stack

- **Astro 7** (statik çıktı, `output` varsayılan `static`) — framework/UI kütüphanesi yok, saf `.astro` + vanilla JS
- **@astrojs/sitemap** — `sitemap-index.xml` + hreflang eşlemesi (`astro.config.mjs`)
- **Sveltia CMS** (git tabanlı, veritabanı yok) — panel `/admin`, ayarlar `public/admin/config.yml`
  - `decap-cms-app` / `decap-server` paketleri `package.json`'da duruyor; yerel panel için `npm run cms`
- **CSS**: tek global stylesheet (`src/styles/global.css`) + bileşen içi `<style>` blokları. Tailwind yok.
- **Node** ≥ 22.12.0

## Dizin yapısı

```
src/
  layouts/Layout.astro      tek layout — header, dil değiştirici, footer, meta/OG/JSON-LD
  pages/
    index.astro             TR ana sayfa (hero slider + hakkımızda + iletişim)
    projeler/               TR: liste + [slug] detay
    en/                     EN karşılıkları (index, projeler)
    admin/index.astro       Sveltia CMS paneli (noindex)
  data/
    site.ts                 SITE sabitleri, KATEGORILER, KBAR
    i18n.ts                 CEVIRI (tr/en) arayüz metinleri, KATEGORI_EN
  content/projeler/         CMS'in yazdığı markdown dosyaları
  content.config.ts         koleksiyon şeması (şu an sadece `projeler`)
  styles/global.css
public/
  admin/config.yml          CMS koleksiyon tanımları
  images/hero/              hero slider görselleri (şu an placeholder SVG)
  images/uploads/           CMS medya klasörü
  logo.svg, logo-beyaz.svg, favicon.svg   (placeholder — gerçek logo ile değiştirin)
```

## Dil yapısı (i18n)

- **TR kök dizinde**: `/`, `/projeler`, `/projeler/<slug>`
- **EN `/en/` altında**: `/en`, `/en/projeler`
- Dil, `Astro.url.pathname` `/en` ile başlıyor mu diye bakılarak belirlenir (`Layout.astro`).
- Arayüz metinleri `src/data/i18n.ts` içindeki `CEVIRI` nesnesinde; **sayfa içine sabit metin gömmeyin**,
  iki dilli bir metin gerekiyorsa `CEVIRI`'ye ekleyin.
- `Layout.astro` her sayfaya `hreflang` tr / en / x-default ve canonical basar.
  Yeni bir TR sayfası eklerken **karşılığını `/en/` altında da açın**, yoksa hreflang kırık kalır.
- Sitemap `astro.config.mjs` içinde `i18n: { defaultLocale: 'tr', locales: { tr, en } }` ile eşlenir.

## Deploy hedefi: Cloudflare Pages

- Build komutu: `npm run build` · Çıktı dizini: `dist` · Node sürümü: 22
- Statik çıktı; adapter/SSR **yok**. Sunucu tarafı çalışan bir şey eklenirse
  `@astrojs/cloudflare` adapter'ı gerekir — o karar ayrıca alınmalı.
- 301 yönlendirmeleri `public/_redirects` dosyasına yazılır (Cloudflare Pages formatı):
  `/eski-yol  /yeni-yol  301`
- Özel başlıklar gerekirse `public/_headers`.

## URL / slug kuralı (ZORUNLU)

> **Mevcut deltek.com.tr'deki tüm URL slug'ları yeni sitede aynen korunacak;
> değişen varsa 301 redirect listesine eklenecek.**

Uygulaması:

1. Bir sayfa taşınmadan önce mevcut canlı sitedeki yolu kontrol edin; dosya adını/route'u
   o slug'a göre kurun. Türkçe karakter, tire, çoğul/tekil farkı dahil **birebir** aynı olmalı.
2. Slug değişmek zorundaysa (ör. teknik kısıt), eski yolu `public/_redirects` içine
   `301` olarak ekleyin ve aşağıdaki tabloya işleyin.
3. Redirect'siz slug değişikliği yapılmaz.

### 301 redirect listesi

| Eski URL | Yeni URL | Not |
| --- | --- | --- |
| _(henüz yok)_ | | |

## Yapılacaklar (bu iskelette placeholder olan şeyler)

- `src/data/site.ts` — telefon, e-posta, adres, WhatsApp numarası, slogan (`TODO` işaretli)
- `src/data/i18n.ts` — `footer.slogan` (TR/EN)
- `public/logo.svg`, `public/logo-beyaz.svg`, `public/favicon.svg` — gerçek Deltek logosu
- `public/og-image.jpg` — **yok**; `Layout.astro` bu yola referans veriyor, 1200×630 bir görsel eklenmeli
- `public/images/hero/placeholder-*.svg` — gerçek hero görselleri
- `src/pages/index.astro` ve `src/pages/en/index.astro` — hero başlığı, hakkımızda kartları (placeholder metin)
- Renk paleti (`global.css` `:root`) Boremak iskeletinden devralındı; Deltek kurumsal renkleriyle güncellenmeli
- `public/admin/config.yml` — `backend.repo` gerçek GitHub deposuyla değiştirilmeli
- Ürün/hizmet kategorileri eklenecekse `src/data/site.ts` içindeki `KATEGORILER` doldurulur;
  dolduğunda header açılır menüsü ve ikon şeridi otomatik görünür hale gelir (`/kategori/<slug>`
  route'u ayrıca yazılmalı).

## Komutlar

| Komut | Ne yapar |
| --- | --- |
| `npm install` | Bağımlılıklar |
| `npm run dev` | Geliştirme sunucusu (http://localhost:4321) |
| `npm run build` | `dist/` üretir |
| `npm run preview` | Build çıktısını yerelde sunar |
| `npm run cms` | Sveltia/Decap yerel backend (panel `/admin`) |
