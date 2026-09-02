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

## Taşınan içerik

Canlı siteden taşınan **39 URL** (10 blog yazısı + 28 sayfa + `/blog/`).
Slug'lar birebir korundu; `sitemap.xml` + `/feed/` ile diff'lenerek doğrulandı.

**Blog yazıları** → `src/content/blog/tr/<slug>.md`, `/<slug>/` adresinde.

**Sayfalar** → `src/content/sayfalar/tr/<slug>.md`, yine `/<slug>/` adresinde:

- Menüde: `hakkimizda` (Kurumsal), `yatay-sondaj-teknoloji` (Teknoloji),
  `hizmetlerimiz`, `referanslar`, `medyalar`, `iletisim`
- Teknoloji/hizmet: `yonlendirilebilir-yatay-sondaj-nedir`,
  `yonlendirilebilir-yatay-sondaj-yapim-metodu`, `yonlendirilebilir-yatay-sondaj-makinesi`,
  `yatay-delgi-nedir`, `yatay-sondaj`, `yonlendirilebilir-yatay-delgi`,
  `yonlendirilebilir-yatay-sondaj`, `delgi-tijleri`, `yonlendirme-basligi`,
  `genisletme-basligi`, `yer-belirleme`, `uzerinden-takip`, `manyetik-alan`,
  `yatay-sondaj-camuru`, `boru-surmecakma`, `boru-yenileme`, `akilli-altyapi`,
  `auger-boring-nedir-modern-yatay-delgi-teknolojisi`, `mikrotunel-nedir`,
  `boru-surme-boru-cakma-auger-boring`, `kazisiz-altyapi-ve-kazisiz-teknolojiler`,
  `yatay-sondaj-kazisiz-yatay-delgi`

> `sitemap.xml` canlı sitede eksikti (`hizmetlerimiz` yok, yeni yazıların çoğu yok).
> Envanter, sitemap + `/feed/` + menü taraması birleştirilerek çıkarıldı.

### Taşımada bilinçli olarak değişenler

- **WPBakery sekmeleri ve akordiyonları düz başlığa açıldı.** İçerik korundu ama
  sekme/akordiyon etkileşimi yok; bölümler art arda `###` başlıkla akıyor.
- **Yan menü (sidebar) atıldı** — yeni sitede header menüsü karşılıyor.
- **İletişim formu (Contact Form 7) kaldırıldı.** Statik sitede çalışmıyor;
  form alanları düz metin olarak sızdığı için tamamen çıkarıldı. `/iletisim/`
  sayfasındaki "Bize Yazın" başlığı formsuz duruyor — form yeniden kurulmalı.
- **Cloudflare e-posta gizlemesi çözüldü**, adresler gerçek `mailto:` bağlantısı oldu.
- **Google harita ve Vimeo gömüleri korundu** (`<div class="gomu">` sarmalayıcısıyla,
  responsive 16:9).
- **Referans logoları** `duzen: logo-izgara` alanıyla yan yana diziliyor
  (markdown her görseli ayrı paragrafa koyduğu için).

## Dizin yapısı

```
src/
  layouts/Layout.astro      tek layout — header, dil değiştirici, footer, meta/OG/JSON-LD
  pages/
    index.astro             TR ana sayfa
    [slug].astro            TR yazı VE sayfa → /<slug>/ (iki koleksiyon tek route)
    blog/index.astro        TR blog listesi → /blog/
    en/index.astro          EN ana sayfa → /en/
    en/[slug].astro         EN yazı VE sayfa → /en/<slug>/
    en/blog/index.astro     EN blog listesi → /en/blog/
    admin/index.astro       Sveltia CMS paneli (noindex)
  data/
    site.ts                 SITE sabitleri, KATEGORILER, KBAR
    i18n.ts                 CEVIRI (tr/en) arayüz metinleri
  data/icerik.ts            yazilar() sayfalar() kokIcerik() cevirisiVarMi() menuSayfalari()
  content/blog/tr/<slug>.md      Türkçe blog yazıları
  content/blog/en/<slug>.md      İngilizce çevirileri (zorunlu değil)
  content/sayfalar/tr/<slug>.md  Türkçe sayfalar
  content/sayfalar/en/<slug>.md  İngilizce çevirileri (zorunlu değil)
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

## Sayfa düzenleri

`sayfalar` koleksiyonundaki her sayfa `duzen` alanıyla üç düzenden birini seçer.
CMS'te "İçerik düzeni" açılır listesinden değiştirilir; kod değişikliği gerekmez.

| `duzen` | Ne yapar | Örnek |
| --- | --- | --- |
| _(boş)_ | Normal makale akışı — markdown gövdesi | `hakkimizda`, `hizmetlerimiz` |
| `logo-izgara` | Art arda gelen görselleri yan yana dizer | `referanslar` |
| `urun` | Ürün/teknoloji şablonu | `delgi-tijleri` + 13 teknoloji/hizmet sayfası |

Hangi sayfa hangi düzende olduğunu görmek için:

```bash
grep -l "^duzen: urun" src/content/sayfalar/tr/*.md      # ürün şablonu (14)
grep -L "^duzen:" src/content/sayfalar/tr/*.md           # normal akış (13)
```

**Normal akışta kalanlar ve nedeni:** `hakkimizda`, `hizmetlerimiz`, `iletisim`,
`medyalar` kurumsal sayfalar; `mikrotunel-nedir`, `auger-boring-nedir-…`,
`yatay-delgi-nedir`, `yatay-sondaj`, `yonlendirilebilir-yatay-delgi`,
`yonlendirilebilir-yatay-sondaj`, `yatay-sondaj-kazisiz-yatay-delgi`,
`kazisiz-altyapi-ve-kazisiz-teknolojiler`, `boru-surme-boru-cakma-auger-boring`
ise **hiç görseli olmayan**, başlık/liste yapılı uzun makaleler — ürün şablonuna
sokulursa boş görsel kutuları çıkardı.

### `duzen: urun`

Boremak sitesindeki ekipman sayfası şablonundan uyarlandı; Boremak'a özgü içerik,
maskot blokları ve kategoriye özel dallanmalar çıkarıldı. Bileşen:
`src/components/UrunDuzen.astro`. Tümü frontmatter'dan sürülür:

```yaml
duzen: urun
banner: /images/uploads/ust-gorsel.jpg
bloklar:                  # görsel + metin, dönüşümlü hizalanır
  - baslik: "Malzeme ve üretim"
    metin: |-
      İlk paragraf. **Kalın** metin desteklenir.

      İkinci paragraf.
    gorsel: /images/uploads/x.jpg
    ters: true            # görsel sağda
    boyut: elli           # ceyrek|otuz|kirk|elli|yari|kucuk — görseli küçültür
tablolar:                 # teknik veri tabloları (yatay kaydırmalı)
  - baslik: "Vermeer Uyumlu Tijler"
    aciklama: "..."
    basliklar: [Model, "Dış Çap (mm)", "Ağırlık (kg)"]
    satirlar:
      - [D7×11, "42", "12"]
galeri:
  - { foto: /images/uploads/y.jpg, alt: "..." }
```

Markdown gövdesi bannerdan sonra, blokların önünde çıkar (giriş metni için).
Alanların hepsi isteğe bağlı. Blok üç şekilde render olur:

| Blokta olan | Sonuç |
| --- | --- |
| görsel + metin | iki sütun, sırayla sağa/sola dönüşümlü |
| yalnız görsel | tam genişlik görsel |
| yalnız metin | tam genişlik metin (boş görsel kutusu bırakmaz) |

### Toplu dönüştürme

`scripts/urun-duzenine-gecir.mjs` taşınmış bir sayfayı markdown akışından bu
düzene çevirir. Canlı sitedeki sıra "metin, sonra onu resimleyen görsel"
olduğu için biriken metin bir görselle karşılaşınca blok kapanır.

```bash
node scripts/urun-duzenine-gecir.mjs --kuru <slug>   # yazmadan göster
node scripts/urun-duzenine-gecir.mjs <slug> [<slug> ...]
```

Başlık/liste/gömü içeren sayfaları reddeder; zaten `duzen` alanı olan sayfayı atlar.

**Geri alınmayanlar:** ekipman kategori indeksi (`/ekipmanlar/`), sekmeli akış
bileşeni (`kaya-akis`), makine vitrin kartları ve maskot blokları. Kategori
açılır menüsü ile ikon şeridi iskelette duruyor ama `KATEGORILER` boş olduğu
için gizli (`src/data/site.ts`).

## Görsel dil

Canlı deltek.com.tr'den alındı, `src/styles/global.css` `:root` içinde tanımlı.

| Değişken | Değer | Nerede |
| --- | --- | --- |
| `--mavi` | `#185ad6` | bağlantılar, butonlar, başlıklar — sitenin ana rengi |
| `--mavi-700` / `--mavi-900` | `#1449ac` / `#0e3578` | koyu yüzeyler, slider degradesi |
| `--sari` | `#ffd658` | başlık altı çizgi, menü hover, CTA üst şeridi |
| `--vurgu` | `#eb9e0f` | ikincil vurgu (buton hover) |
| `--metin` / `--mute` | `#333` / `#777` | başlık / gövde metni |

**Tipografi:** Open Sans (Google Fonts'tan `display=swap` ile yükleniyor —
canlı sitenin kullandığı aile). Üç font değişkeni de (`--f-dis`, `--f-metin`,
`--f-veri`) aynı aileye bakıyor; `.veri` sınıfı yalnızca `tabular-nums` ekler.

**Header** canlı sitedeki gibi açık zeminli: üstte gri iletişim şeridi
(e-posta + telefon + dil), ortada renkli logo, altında büyük harf gezinme.
Logo `public/deltek-logo.png` — canlı siteden alınan gerçek marka dosyası
(200×46, saydam PNG, açık zemin için tasarlanmış).

**Sosyal paylaşım görseli** `public/og-image.jpg` (1200×630) — `npm run og` ile
`scripts/og-gorsel-uret.mjs` üretir: açık mavi zemin, gerçek logo, marka çizgisi,
slogan ve alan adı. Marka bilgisi değişince yeniden çalıştırın; ikili dosyayı
elle düzenlemeyin. Betik `sharp`'ı **doğrudan yoldan** çağırır
(`node_modules/sharp/dist/index.cjs`) — sharp Astro'nun görsel servisinin
bağımlılığı olarak zaten kurulu ama bizim bağımlılığımız değil, bu yüzden düz
`import sharp` çözülmüyor. Astro sharp'ı bırakırsa betik de güncellenmeli.
OG görseli **raster olmak zorunda**: Facebook/X/LinkedIn/WhatsApp SVG render etmez.

**Hero slider** canlı sitedeki Revolution Slider'dan alındı: 9 slayt, arka plan
fotoğrafları `public/images/hero/`, üzerlerine binen saydam katman görselleri
`public/images/hero/katman/` (toplam ~2,4 MB; ilk slayt eager, kalanı lazy).

Slayt verisi `src/pages/index.astro` içindeki `heroFotolar` dizisinde:

| Alan | Ne |
| --- | --- |
| `src` | arka plan fotoğrafı |
| `baslik` | fotoğraf üzerine binen büyük harf başlık |
| `ustSatir` | isteğe bağlı altın renkli üst satır |
| `katmanlar[]` | arka planın üzerindeki saydam PNG'ler: `src` + `x/y/w/h` |

**Katman koordinatları canlı slider'ın 1920×500 tasarım ızgarasındadır**
(`HERO_IZGARA`), render sırasında yüzdeye çevrilir. Bu yüzden `.slider__ray`
en-boy oranı da `1920/500` — oran değişirse katmanlar kayar. Dar ekranda
(≤820px) oran `16/9`'a düşer ve katmanlar gizlenir (`.slide__katman` display:none),
çünkü o boyutta hem yanlış konumlanır hem metni bastırırlar.

Katmanlar `z-2`, metin kutusu `z-3`. `.slide::after` perdesi katmanların
**altında** kaldığı için `.slide__yazi` kendi degradesini taşır — yoksa başlık
katmanların üzerinde okunmuyordu. Katmanlar aktif slaytta yumuşak biçimde
giriyor (`.slide[data-aktif="true"]`).

> Canlı sitedeki 7. slaydın `1woman.png` katmanı sunucuda **404** veriyor,
> bu yüzden alınmadı.

**Bölüm başlıkları** mavi ve altlarında mavi+sarı kısa çizgi var
(`.hero__bilgi h1::after`, `.kanit__bas h2::after`, `.bolum-bas::after`).

Canlı siteden bilinçli olarak sapılanlar: gövde metni 13px yerine ~15px
(okunabilirlik), kart/gölge dili 2015 temasından daha modern bırakıldı.

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

- [x] 10 blog yazısı canlı siteden taşındı (içerik + 9 görsel, slug'lar birebir)
- [ ] Blog yazılarının İngilizce çevirileri (`src/content/blog/en/<slug>.md`) — şu an hiç yok,
      bu yüzden `/en/blog/` boş ve yazılar EN hreflang basmıyor
- [x] Boremak ürün sayfası şablonu geri alındı → `src/components/UrunDuzen.astro`
- [x] Görsel akışlı 14 teknoloji/hizmet sayfası ürün şablonuna geçirildi
- [x] Statik + teknoloji/hizmet sayfaları taşındı (28 sayfa)
- [ ] `/iletisim/` sayfasına çalışan bir iletişim formu ekle (CF7 kaldırıldı)
- [ ] Sayfaların İngilizce çevirileri — şu an hiç yok, bu yüzden EN menüsünde
      yalnızca Blog görünüyor
- [x] Görsel tasarım canlı siteye yaklaştırıldı (palet, tipografi, header, logo)
- [ ] `src/data/site.ts` — WhatsApp numarası (diğer iletişim bilgileri canlı siteden alındı)
- [ ] Hero slaytlarının **İngilizce başlıkları çeviri**, Deltek onayından geçmedi
      (`src/pages/en/index.astro`)
- [ ] Ana sayfa hero başlığı ve hakkımızda kartları (placeholder metin)
- [ ] `public/admin/config.yml` — `backend.repo` gerçek GitHub deposuyla değiştirilmeli

## Taşıma betiği

`scripts/wp-tasi.mjs` (blog) ve `scripts/wp-sayfa-tasi.mjs` (sayfalar) — canlı WordPress'ten içerik çeker. Kaynak olarak `/feed/`
(tam gövde, tarih, özet) ve her yazının kendi sayfasını (öne çıkan görsel:
`attachment-blog-large-image` sınıfı) kullanır; HTML'i markdown'a çevirir,
görselleri `public/images/uploads/` altına WP yol yapısını koruyarak indirir.

```bash
curl -s https://www.deltek.com.tr/feed/ -o feed.xml   # betikle aynı klasöre
node scripts/wp-tasi.mjs .
```

`wp-sayfa-tasi.mjs` sayfanın `#contentWrapper` içeriğini alır, `.page-title` ve
`aside` bloklarını atar; `--liste` ile hiçbir dosya yazmadan envanter raporu verir:

```bash
node scripts/wp-sayfa-tasi.mjs . --liste
```

## Komutlar

| Komut | Ne yapar |
| --- | --- |
| `npm install` | Bağımlılıklar |
| `npm run dev` | Geliştirme sunucusu (http://localhost:4321) |
| `npm run build` | `dist/` üretir |
| `npm run preview` | Build çıktısını yerelde sunar |
| `npm run cms` | Sveltia/Decap yerel backend (panel `/admin/`) |
| `npm run og` | `public/og-image.jpg`'yi yeniden üretir (bkz. aşağı) |
