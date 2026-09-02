# Deltek — www.deltek.com.tr

Deltek kurumsal sitesinin yeni sürümü. **Amaç: mevcut deltek.com.tr'nin içeriği ve
görsel kimliği mümkün olduğunca korunacak; değişen yalnızca arkadaki mimari.**
İskelet, Boremak sitesinden kopyalanıp markaya özgü tüm içerik çıkarılarak hazırlandı.

## Stack

- **Astro 7** (statik çıktı) — framework/UI kütüphanesi yok, saf `.astro` + vanilla JS
- **@astrojs/sitemap** — `sitemap-index.xml` + hreflang eşlemesi
- **Sveltia CMS** (git tabanlı, veritabanı yok) — panel `/admin/`, ayarlar `public/admin/config.yml`
- **CSS**: tek global stylesheet (`src/styles/global.css`) + bileşen içi `<style>`. Tailwind yok.
- **Node** ≥ 22.12.0
- Kaynak site: **WordPress 4.4.33** (taşınacak olan)

## URL / slug kuralı (ZORUNLU)

> **Mevcut deltek.com.tr'deki tüm URL slug'ları yeni sitede aynen korunacak;
> değişen varsa 301 redirect listesine eklenecek.**

Bunun mimariye yansıması:

1. **Blog yazıları kök dizinde yayınlanır** — `/<slug>/`. Canlı sitede de böyle;
   `/blog/` yalnızca liste sayfasıdır. Route: `src/pages/[slug].astro`.
2. **Slug = dosya adı.** `src/content/blog/tr/<slug>.md`. Frontmatter'da `slug`
   alanı bilerek yok — tek doğru kaynak dosya adıdır.
3. **`trailingSlash: 'always'`** (`astro.config.mjs`). Canlı sitedeki tüm URL'ler
   sondaki eğik çizgiyle çalışıyor. İç bağlantılar da `/blog/`, `/<slug>/` biçiminde
   yazılmalı; eğik çizgisiz bağlantı dev sunucuda 404 verir.
4. **Kanonik host `www.deltek.com.tr`** — canlı sitenin bugünkü canonical'ı bu.
   Apex → www 301'i Cloudflare tarafında kurulur.
5. Slug değişmek zorundaysa `public/_redirects` içine `301` olarak eklenir ve
   aşağıdaki tabloya işlenir. Redirect'siz slug değişikliği yapılmaz.
6. **Emniyet:** kök seviyeye statik sayfa eklerken (ör. `src/pages/hakkimizda.astro`)
   aynı adda bir yazı varsa Astro çakışma hatası verir. Bu kasıtlı.

### 301 redirect listesi

`public/_redirects` dosyasıyla senkron tutulacak.

| Eski URL | Yeni URL | Not |
| --- | --- | --- |
| `/2017/*`, `/2026/*` | `/blog/` | WordPress tarih arşivleri yeni sitede yok |
| `/feed/` | `/blog/` | WordPress RSS |
| `/wp-login.php` | `/` | WordPress artığı |

## Taşınacak içerik envanteri (canlı siteden)

**Blog — 10 yazı, hepsi kök dizinde** (`/blog/` sadece liste):
`the-crossing-group-dondurucu-soguklarda-rekor-kiran-hdd-kesisimini-gerceklestirdi`,
`ssen-96-milyon-sterlinlik-m27-projesinde-hdd-yontemine-guveniyor`,
`iskandinavya-ai-super-otoyolunu-guclendirmek-icin-yonlendirilebilir-yatay-delgi-yyd-hdd`,
`national-grid-temze-nehrinin-altinda-271-tonluk-dev-makineyi-harekete-gecirdi`,
`avrupada-devasa-bir-yuzen-gunes-enerji-santrali-hizmete-girdi`,
`yatay-delgi-dizel-elektrik-karsilastirma`, `4058-metre-dunya-rekoru`,
`yonlendirilebilir-yatay-delgi-hakkinda`, `miamide-kanalizasyon-yapimi`, `gunde-1-km`

**Statik sayfalar** (henüz taşınmadı): `/hakkimizda/`, `/hizmetlerimiz/`,
`/referanslar/`, `/medyalar/`, `/iletisim/`

**Teknoloji / hizmet sayfaları** (henüz taşınmadı): `/yatay-sondaj-kazisiz-yatay-delgi/`,
`/yonlendirilebilir-yatay-sondaj-nedir/`, `/yonlendirilebilir-yatay-sondaj-makinesi`,
`/yonlendirilebilir-yatay-sondaj-yapim-metodu`, `/yatay-sondaj-teknoloji/`,
`/yatay-sondaj-camuru/`, `/delgi-tijleri/`, `/genisletme-basligi/`, `/yonlendirme-basligi/`,
`/manyetik-alan/`, `/yer-belirleme/`, `/uzerinden-takip/`, `/boru-surmecakma/`,
`/boru-surme-boru-cakma-auger-boring/`, `/auger-boring-nedir-modern-yatay-delgi-teknolojisi/`,
`/boru-yenileme/`, `/mikrotunel-nedir/`, `/akilli-altyapi/`,
`/kazisiz-altyapi-ve-kazisiz-teknolojiler/`

> Not: `/mikrotunel-nedir/` ve `/auger-boring-nedir-.../` gibi bazı slug'lar hem
> içerik sayfası hem blog yazısı gibi durabiliyor. Taşırken hangisinin blog
> koleksiyonuna, hangisinin statik sayfaya gideceği tek tek karara bağlanmalı —
> **ikisi aynı slug'ı alamaz.**

## Dizin yapısı

```
src/
  layouts/Layout.astro      tek layout — header, dil değiştirici, footer, meta/OG/JSON-LD
  pages/
    index.astro             TR ana sayfa
    [slug].astro            TR blog yazısı → /<slug>/
    blog/index.astro        TR blog listesi → /blog/
    en/index.astro          EN ana sayfa → /en/
    en/[slug].astro         EN blog yazısı → /en/<slug>/
    en/blog/index.astro     EN blog listesi → /en/blog/
    admin/index.astro       Sveltia CMS paneli (noindex)
  data/
    site.ts                 SITE sabitleri, KATEGORILER, KBAR
    i18n.ts                 CEVIRI (tr/en) arayüz metinleri
    blog.ts                 yazilar(dil), cevirisiVarMi(slug, dil)
  content/blog/tr/<slug>.md   Türkçe yazılar (ana dil)
  content/blog/en/<slug>.md   İngilizce çeviriler (zorunlu değil)
  content.config.ts
  styles/global.css
public/
  admin/config.yml          CMS koleksiyon tanımları (i18n: multiple_folders)
  _redirects                Cloudflare Pages 301'leri
  images/hero/              hero slider görselleri (şu an placeholder SVG)
  images/uploads/           CMS medya klasörü
```

## Dil yapısı (i18n)

- **TR kök dizinde**: `/`, `/blog/`, `/<slug>/`
- **EN `/en/` altında**: `/en/`, `/en/blog/`, `/en/<slug>/`
- Slug iki dilde **aynı** kalır; ayıran tek şey `/en/` öneki.
- Dil, `pathname.startsWith('/en/')` ile belirlenir (`Layout.astro`).
- Arayüz metinleri `src/data/i18n.ts` içindeki `CEVIRI`'de. **Sayfa içine iki dilli
  sabit metin gömmeyin**, `CEVIRI`'ye ekleyin.
- **İçerik iki dilli**: CMS'te her yazının TR ve EN sekmesi var
  (`i18n: multiple_folders`), dosyalar `content/blog/tr/` ve `content/blog/en/`'e yazılır.
- **Çevirisi olmayan yazı**: EN route hiç üretilmez; TR sayfası da EN `hreflang`'ini
  basmaz ve dil düğmesi `/en/`'e düşer. Bunu `Layout`'un `cevirisiVar` prop'u yönetir —
  yeni bir çift dilli sayfa yazarken bu prop'u geçirmeyi unutmayın.

## Deploy hedefi: Cloudflare Pages

- Build: `npm run build` · Çıktı: `dist` · Node 22
- Statik çıktı; adapter/SSR **yok**. SSR gerekirse `@astrojs/cloudflare` adapter'ı
  ayrı bir karar.
- 301'ler `public/_redirects`, özel başlıklar `public/_headers`.
- Apex → www yönlendirmesi Cloudflare tarafında kurulmalı.

## Bilinen tuzak

`astro build`, içerik koleksiyonunu **`node_modules/.astro/data-store.json`**'dan
okur. Bir markdown dosyasını silmek yeterli değil — dosya silindikten sonra da
build çıktısında görünmeye devam eder. Yerelde silme sonrası:

```bash
rm -rf node_modules/.astro .astro dist && npm run build
```

Cloudflare Pages'te `node_modules` her build'de sıfırdan kurulduğu için orada sorun olmaz.

## Yapılacaklar

- [ ] 10 blog yazısını canlı siteden içerik + görselleriyle taşı
- [ ] Boremak ürün sayfası şablonlarını (içerik boş) geri al — teknoloji/hizmet sayfaları için
- [ ] Statik ve teknoloji/hizmet sayfalarını taşı (yukarıdaki envanter)
- [ ] Görsel tasarımı canlı siteye yaklaştır (renk paleti `global.css` `:root` içinde,
      şu an Boremak iskeletinden devralındı)
- [ ] `src/data/site.ts` — telefon, e-posta, adres, WhatsApp, slogan (`TODO` işaretli)
- [ ] `src/data/i18n.ts` — `footer.slogan` (TR/EN)
- [ ] `public/logo.svg`, `logo-beyaz.svg`, `favicon.svg` — gerçek Deltek logosu
- [ ] `public/og-image.jpg` — **yok**; `Layout.astro` bu yola referans veriyor, 1200×630 eklenmeli
- [ ] `public/images/hero/placeholder-*.svg` — gerçek hero görselleri
- [ ] Ana sayfa hero başlığı ve hakkımızda kartları (placeholder metin)
- [ ] `public/admin/config.yml` — `backend.repo` gerçek GitHub deposuyla değiştirilmeli

## Komutlar

| Komut | Ne yapar |
| --- | --- |
| `npm install` | Bağımlılıklar |
| `npm run dev` | Geliştirme sunucusu (http://localhost:4321) |
| `npm run build` | `dist/` üretir |
| `npm run preview` | Build çıktısını yerelde sunar |
| `npm run cms` | Sveltia/Decap yerel backend (panel `/admin/`) |
