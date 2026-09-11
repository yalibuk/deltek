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

### İngilizce adresler: dosya adı anahtar, `adres` URL (2026-09-11)

EN sayfalar **İngilizce URL** ile yayınlanır (`/en/contact/`,
`/en/horizontal-directional-drilling/`), dosya adı ise Türkçe kalır
(`content/sayfalar/en/iletisim.md`). Frontmatter `adres` alanı URL'yi verir;
boşsa dosya adı. Neden dosya adı değişmedi: CMS'in i18n yapısı
(`multiple_folders`) her dilde **aynı dosya adını** şart koşuyor ve TR/EN
eşleşmesi (hreflang, dil düğmesi, teknoloji ağacı, `ilgili`, `TEK_REHBERLER`)
buna dayanıyor.

Kod tarafında kural tek cümle: **bir kaydı BULMAK için `anahtar` (dosya adı),
ona BAĞLANMAK için `slug` (URL)** — `src/data/icerik.ts` `Kayit` tipi. Ağaç
düğümleri, `ilgili` listeleri, `TEK_REHBERLER`, `HIZMET_SAYFALARI` hep anahtar
taşır; bileşenler `k.slug` ile bağlanır. Diğer dilin adresi `karsiSlug()` ile
bulunur; `[slug].astro` bunu Layout'a `karsiYol` olarak verir (hreflang + dil
düğmesi). Sitemap eklentisinin `i18n` seçeneği **kapatıldı** — yolları önekle
eşliyordu (`/x/` ↔ `/en/x/`); hreflang çiftleri artık
`scripts/seo-integration.mjs`'de anahtar üzerinden yazılıyor.

Üç koruma derlemede:

* TR dosyada `adres` verilirse build durur — canlı deltek.com.tr adresleri
  dosya adının kendisidir, değişemez.
* `adres` yalnız küçük harf/rakam/tire olabilir.
* Denetim betiği her sayfadaki hreflang hedefinin **gerçekten derlendiğini**
  kontrol eder (yanlış eşleşme 100/100'ü düşürür).

> **Alan adı `slug` OLAMAZ.** İlk denemede öyleydi ve EN sayfaların tamamı
> sessizce kayboldu (73 → 40 sayfa, hata yok): Astro'nun `glob` yükleyicisi
> frontmatter'daki `slug`ı **kayıt kimliği** yapıyor, `en/iletisim` yerine
> `contact` olunca dil süzgeci (`id.startsWith('en/')`) hepsini düşürdü.
> `adres` bu yüzden.

EN adresler hiç yayında olmadığı için eski `/en/<türkçe-slug>/` için 301
eklenmedi. Sabit `/en/…` bağlantıları (hero, ana sayfa, 404, EN markdown
gövdeleri — 54 adet) yeni adreslere çevrildi; denetim betiği 404'e giden iç
bağlantıyı yakalamıyor, ama derleme yetim/eksik hedefleri hreflang üzerinden
yakalar.

### 301 redirect listesi

`public/_redirects` dosyasıyla senkron tutulacak.

| Eski URL | Yeni URL | Not |
| --- | --- | --- |
| `/2017/*`, `/2026/*` | `/blog/` | WordPress tarih arşivleri yeni sitede yok |
| `/feed/` | `/blog/` | WordPress RSS |
| `/wp-login.php` | `/` | WordPress artığı |
| `/boru-surme-boru-cakma-auger-boring/` | `/boru-surmecakma/` | Aynı konuda iki sayfa vardı; menüde mükerrer görünüyordu |
| `/yatay-sondaj-kazisiz-yatay-delgi/` | `/yonlendirilebilir-yatay-sondaj-nedir/` | Sayfa kaldırıldı; HDD Nedir? ile aynı konuyu anlatıyordu |
| `/kazisiz-altyapi-ve-kazisiz-teknolojiler/` | `/yatay-sondaj-teknoloji/` | Sayfa kaldırıldı; bölümün genel bakış sayfasıydı |
| `/auger-boring-nedir-modern-yatay-delgi-teknolojisi/` | `/boru-surmecakma/` | Ayrı sayfa olmaktan çıktı; Boru Sürme/Çakma'da başlıklı bölüm |
| `/mikrotunel-nedir/` | `/boru-surmecakma/` | Ayrı sayfa olmaktan çıktı; Boru Sürme/Çakma'da başlıklı bölüm |
| `/medyalar/` | `/deltek-yatay-sondaj-kaya-delgi-rock-drilling/` | Sayfa kaldırıldı; içindeki tek video blog yazısı oldu |

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
  (son üçü sonradan **kaldırıldı**, 301'leri yukarıdaki tabloda)

> `sitemap.xml` canlı sitede eksikti (`hizmetlerimiz` yok, yeni yazıların çoğu yok).
> Envanter, sitemap + `/feed/` + menü taraması birleştirilerek çıkarıldı.

### Taşımada bilinçli olarak değişenler

- **WPBakery sekmeleri ve akordiyonları düz başlığa açıldı.** İçerik korundu ama
  sekme/akordiyon etkileşimi yok; bölümler art arda `###` başlıkla akıyor.
- **Yan menü (sidebar) atıldı** — yeni sitede header menüsü karşılıyor.
  *(Teknoloji bölümünde geri geldi: bkz. "Teknoloji bölümü".)*
- **Hizmetlerimiz sayfası yeniden tasarlandı** (`duzen: hizmet`). İçerik canlı
  sayfayla aynı; düz makale akışı yerine kart ızgaralarına alındı. Metinde dört
  bilinçli düzeltme var:

  - **"…Daha az kazı, daha çok teknoloji. Giriş/Çıkış"** yarım kalmıştı; tam
    hâli canlı **ana sayfanın** aynı hizmet kartında bulundu ve tamamlandı:
    *"Giriş/Çıkış noktasını verin, gerisini düşünmeyin!"*
  - **"…Ayrıca bütün bu işlemleri sadece"** yarım kalmıştı ve kurtarılamadı
    (web arşivinin 2016-04'ten bugüne tüm anlık görüntülerinde aynı yerde
    kesiliyor). Kartın metni, canlı **ana sayfadaki** aynı hizmetin eksiksiz
    anlatımıyla değiştirildi — farklı bir metin ama şirketin kendi sözleri.
  - Yazım hataları: "he myurt içi" → "hem yurt içinde", "telekömünikasyon" →
    "telekomünikasyon", "yenilebiliyor" → "yenileyebiliyor".
- **Hizmetlerimiz'deki teknik makale Teknoloji sayfasına taşındı.** Canlı
  sitede "Yatay Sondaj Nedir? Kazısız Delgi Yöntemlerine Teknik Bir Bakış"
  başlığından itibaren 6 bölüm `/hizmetlerimiz/` altındaydı; içeriği teknik
  olduğu için `/yatay-sondaj-teknoloji/` sayfasına `bloklar` olarak alındı.
  Metin birebir korundu (kelime kelime doğrulandı). `/hizmetlerimiz/` yalnızca
  hizmet tanıtımı, referans ve uygulama alanlarıyla kaldı.
- **İletişim formu (Contact Form 7) kaldırıldı.** Statik sitede çalışmıyor;
  form alanları düz metin olarak sızdığı için tamamen çıkarıldı. `/iletisim/`
  sayfası **form olmadan** yeniden tasarlandı (`duzen: iletisim`): telefon ve
  e-posta büyük dokunma hedefleri olarak en üstte, altında ofis kartları ve
  harita. Form gerekirse ayrı bir karar — bir arka uç servisi gerektirir.
- **Cloudflare e-posta gizlemesi çözüldü**, adresler gerçek `mailto:` bağlantısı oldu.
- **Google harita ve Vimeo gömüleri korundu** (`<div class="gomu">` sarmalayıcısıyla,
  responsive 16:9).
- **Referans logoları** artık markdown gövdesinde değil, sayfanın başında
  otomatik kayan bir şeritte (`duzen: referanslar`, bkz. aşağı). Eski
  `logo-izgara` düzeni kodda duruyor ama hiçbir sayfa kullanmıyor.

## Ofis yapısı

**Merkez İZMİR, İstanbul ŞUBE.** Tek kaynak `src/data/site.ts`:

* `OFISLER` dizisi — merkez olan başta, `merkez: true` yalnız birinde.
  `/iletisim/` kartları ve footer bu diziden basılır.
* `SITE.adres1/adres2` — **merkezin** adresi; JSON-LD `streetAddress` bunu
  kullanır. `OFISLER`'deki merkezle aynı tutulmalı.

> **"Merkez ofis" / "Şube" ibareleri hiçbir yerde GÖSTERİLMEZ.** Adres geçen
> her yerde (iletişim kartları, footer) yalnız şehir adı ve adres var.
> `merkez` bayrağı sayfada görünmez; yalnızca hangi adresin JSON-LD'ye
> gideceğini ve sıralamayı belirler. `i18n.ts`'teki `merkez`/`bolge`
> etiketleri bu yüzden silindi.

`/iletisim/` sayfasındaki gömülü Google haritası ve üstündeki "Merkez
ofisimiz" başlığı **kaldırıldı**. Tanıtım görseli sayfanın başında,
**`<h1>` ile özet metninin arasında**: frontmatter'daki `gorsel` alanı (eskiden `harita`),
konteyner genişliğinde, yuvarlak köşeli ve gölgeli (arkasında altlık YOK).
Ekranın üstünde durduğu için `loading="lazy"` DEĞİL, `fetchpriority="high"`
kullanılıyor. `width`/`height` **elle yazılmaz**, `gorselOlcu()` ile dosyadan
okunur — elle yazılan 1920×935 dosya 1920×539 çıkınca yanlış oranda yer
ayrılıyordu. Görsel dosyası:
`public/images/iletisim/deltek_iletisim_banner.jpg`.

#### Sayfa genişliği — TEK AYAR

`/iletisim/` sayfasının genişliği `IletisimDuzen.astro`'daki tek bir
değişkenden geliyor; şu an **1100 px**:

```css
.ilet { --ilet-en: 1100px; }
.ilet .kap { max-width: calc(var(--ilet-en) + 2 * var(--kap-pad)); }
```

Bu değer başlığı, tanıtım görselini, telefon/e-posta kartlarını, gövde
metnini, ofis kartlarını ve kapanış çağrısını birden kapsıyor — her bölüm
`.kap` kullandığı için. Bölüm bölüm `max-width` yazmak yeni bir bölüm
eklendiğinde unutulurdu.

**İki tavan var:**

- **1280 px** — `.kap`ın kendi `max-width`i. Daha büyük yazmak bir şey
  değiştirmez.
- **1200 px** — tanıtım görselinin doğal genişliği
  (`deltek_iletisim_banner.jpg`, 1200×337). Bundan büyük bir değerde görsel
  büyütülür ve bulanıklaşır.

`.kap` border-box olduğu için paylar `--ilet-en`in ÜSTÜNE ekleniyor: içerik
tam `--ilet-en` kadar, sarmalayıcı o kadar + 2 pay (ölçüldü, 1100'de içerik
1100 / sarmalayıcı 1188).

> `--kap-pad` global.css'te `:root`ta tanımlı ve konteyner payının TEK
> kaynağı. Önce `clamp(1.15rem, 4vw, 2.75rem)` ifadesi elle kopyalanıyordu
> (HeroSlider'daki metin kuşağı da kullanıyor); biri değişince diğeri
> sessizce kayardı.

#### Görselin boyutunu değiştirme

Tek yer: `src/components/IletisimDuzen.astro` → `.ilet__gorsel` kuralları.
`width`/`height` öznitelikleri boyut belirlemez; onlar dosyadan okunur ve
yalnızca yüklenmeden önce doğru oranda yer ayırmaya yarar.

| İstenen | Yazılacak |
| --- | --- |
| Daha dar (ör. en çok 900px, ortalanmış) | `.ilet__gorsel { max-width: 900px; margin-inline: auto; }` |
| Konteynerin tamamı (şu anki hâli) | `.ilet__gorsel img { width: 100%; }` |
| Ekran kenarından kenara (full-bleed) | `.ilet__gorsel { width: 100vw; margin-inline: calc(50% - 50vw); border-radius: 0; }` ve img'de `border-radius: 0` |
| Sabit yükseklik, taşanı kırp | `.ilet__gorsel img { aspect-ratio: 1920/380; object-fit: cover; }` |
| Üst/alt boşluk | `.ilet__gorsel { margin-block: … }` |

> Başlık bloğunun 62ch sınırı artık `.ilet__bas`ta değil, içindeki iki
> `.ilet__basMetin` sarmalayıcısında — görsel aradan konteynerin tamamını
> kullanabilsin diye. Sınır TEK sarmalayıcıda tutulmalı: çocuklara tek tek
> verilirse `ch` her elemanın kendi puntosuna göre çözülür ve başlık, özet,
> unvan farklı genişliklerde çıkar (denendi, öyle oldu).

### Yazı tipleri

Gövde ve başlıklar **Open Sans** (değişken: ağırlık 400–800 + genişlik
75–100). Ana sayfadaki tecrübe bandı **Montserrat 800** kullanıyor
(`--f-vurgu`). İkisi de TEK Google Fonts isteğinde geliyor, ek istek yok.

Montserrat'ın latin+latin-ext maliyeti tek ağırlıkta **51 KB** ve Türkçe
karakterleri tam. Daha hafif alternatifler (hepsinde latin-ext var):
Poppins 13 KB, Manrope 21 KB, Archivo 27 KB. Değiştirmek için tek yer:
`global.css` → `--f-vurgu` ve `Layout.astro`'daki font bağlantısı.

## Logo

Görünen logoların hepsi **`public/deltek_logo.svg`** (header ve footer);
ana sayfadaki tecrübe bandında tek satırlık beyaz sürüm
**`public/deltek_logo_single_line_white.svg`** kullanılıyor,
oran 674.14×163.78. JSON-LD'deki `logo` alanı bilerek **PNG** kaldı
(`deltek-logo.png`): yapısal veri görselleri için raster bekleniyor, SVG'nin
doğal piksel ölçüsü yok. `scripts/og-gorsel-uret.mjs` de PNG kullanır.

### Logo gölgesi

Header'ın gölgesi YOK (`.ust` yalnız alt çizgi). Gölge sadece logoda ve
`drop-shadow` ile — `box-shadow` dikdörtgen kutuyu gölgelerdi, `drop-shadow`
SVG'nin kendi biçimini takip eder. **Işık açısı 90°**, yani tam tepeden:
yatay kayma 0, gölge düz aşağı düşer.

| Değişken | Ne yapar |
| --- | --- |
| `--lg-y` | gölgenin düşme mesafesi |
| `--lg-bulanik` | yumuşaklık |
| `--lg-koyu` | koyuluk (0–1) |

Kapatmak için: `.logo img { filter: none; }`
Logo yüksekliği 55px (46px'ten %20 büyütüldü).

## Ana sayfa bölümleri

Sırasıyla: hero slider → "DELTEK" şeridi → **rakamlar** → **hizmetler** →
**tecrübe bandı** → hakkımızda → blog → çağrı bandı.

**Tecrübe bandı** (`.tecrube`) tam sayfa genişliğinde ve düzeni kullanıcının
verdiği örnekten (`deltek_hdd_1_sample.webp`) alındı: sağ üstte %50 saydam
tek satırlık beyaz Deltek logosu, ortada ÜÇ satır ortalanmış yazı
("20 yılı aşkın / Uluslararası / Saha tecrübesi"). Yazı tipi `--f-vurgu`
(Montserrat 800), punto örnekle aynı oranda (1920px'te ~111px = 5.8vw),
satır aralığı 1.07, **yazı %78 saydam** (`opacity: .78`) — harflerin içinden
fotoğraf görünüyor.

**Üç satır da aynı genişlikte, harflerin en/boy oranı BOZULMADAN**: her
satırın PUNTOSU farklı (`.tecrube__s`, `font-size: calc(1em * var(--o))`).
`--o` punto çarpanı; en geniş satır 1 kabul edilip diğerleri ona oranlandı.
1920px'te sonuç: 143.7 / 124.2 / 111.4px punto, üç satır da 966px.

Çarpanlar önce doğal genişlik oranından hesaplandı (966/733 = 1.318,
966/860 = 1.123) ama render'da %2 sapma bıraktı: punto değişince harf
yerleşimi tam doğrusal olmuyor. **Render üzerinden düzeltilmiş** son
değerler `1.290` / `1.1149` / `1` — sapma %0.10.

> **Metin değişirse çarpanlar yeniden ölçülmeli.** Yöntem: çarpanları 1
> yapıp her satırın doğal genişliğini ölç, en genişe oranla, sonra render'da
> ölçüp bir tur düzelt.
>
> Yatay esnetme (`scaleX`) da denendi ve bırakıldı: genişlikleri eşitliyor
> ama harfleri geriyor, yani karakterlerin en/boy oranını bozuyor.

Bandın yüksekliği fotoğrafın kendi oranından (`1920×790` → `41.1vw`) —
görselin tamamı görünsün, yatay dilim gibi kırpılmasın diye.

Logo ve yazı `.kap`'a SIĞDIRILMAZ (max 1280px): örnekte logo sayfanın sağ
kenarında ve ikinci satır 1920px'te ~1380px, yani konteynerden geniş.
İkisi de bandın kendi genişliğinde, sayfa payı kadar içeride.

Görselin üstündeki **mavi filtre gerekli** (`--tf-koyu: .50`) ve yazı
saydamlaştıktan sonra daha da gerekli oldu. Ölçüm (en koyu harf pikseli /
en açık zemin pikseli): filtreyle **3.80**, ortalama 8.65; filtre
kaldırılırsa en parlak zemin lekelerinde ~2.25'e düşer (eşik 3.0).
`--tf-koyu`yu düşürmek fotoğrafı parlatır ama okunabilirliği bozar.

> **Görsel `position: absolute` olmak zorunda.** Normal öğe olarak
> bırakıldığında kendi doğal oranıyla bandın yüksekliğini dayatıyor.

Hizmet kartları ve rakamlar `src/pages/index.astro` frontmatter'ında
(`HIZMETLER`, `RAKAMLAR`) duruyor; ikisi de canlı deltek.com.tr ana
sayfasından taşındı (rakamlar birebir, kart metinleri kısaltıldı). Kart
ikonları `src/data/ikon.ts`'ten geliyor — aynı set `HizmetDuzen.astro`'da
da kullanılıyor, bu yüzden bileşenden veri katmanına alındı.

Slider ile "DELTEK" şeridi arasındaki boşluk bilerek dar: 110px'ti
(`hero__ayrac` 46 + `hero__bilgi` üst dolgu 64), blok 60px yukarı alınacak
şekilde 16 + ~34'e indirildi. Sliderin ÜSTÜNDE boşluk yok — `hero__ic`
dolgusu sabit başlığın yüksekliği kadar (`--baslik-y`), azaltılırsa slider
başlığın altına girer.

## Dizin yapısı

```
src/
  layouts/Layout.astro      tek layout — header, dil değiştirici, footer, meta/OG/JSON-LD
  pages/
    index.astro             TR ana sayfa
    [slug].astro            TR yazı VE sayfa → /<slug>/ (iki koleksiyon tek route)
    blog/index.astro        TR blog listesi → /blog/
    en/index.astro          EN ana sayfa → /en/ (TR ile aynı bölümler)
    en/[slug].astro         EN yazı VE sayfa → /en/<slug>/ ([slug].astro'dan türetildi)
    en/blog/index.astro     EN blog listesi → /en/blog/
    404.astro, en/404.astro 404 sayfaları (noindex; EN'inki build sonrası en/404.html'e taşınır)
    admin/index.astro       Sveltia CMS paneli (noindex)
  assets/banner/*.jpg       başlık banner'larının sembolleri (bkz. "Banner sembolleri")
  data/
    site.ts                 SITE sabitleri, KATEGORILER, KBAR
    i18n.ts                 CEVIRI (tr/en) arayüz metinleri
  data/icerik.ts            yazilar() sayfalar() kokIcerik() cevirisiVarMi() menuSayfalari()
  data/gorselOlcu.ts        public/ altındaki görselin en/boy oranı (derleme sırasında)
  data/ikon.ts              çizgi ikon seti (ana sayfa kartları + HizmetDuzen)
  components/IlgiliSayfalar.astro  frontmatter `ilgili` listesinden iç bağlantı bloğu
  data/teknoloji.ts         TEKNOLOJI ağacı (+ `en` etiketleri), TEK_REHBERLER
  content/blog/tr/<slug>.md      Türkçe blog yazıları
  content/blog/en/<slug>.md      İngilizce çevirileri (zorunlu değil)
  content/sayfalar/tr/<slug>.md  Türkçe sayfalar
  content/sayfalar/en/<slug>.md  İngilizce çevirileri (zorunlu değil)
  content.config.ts
  styles/global.css
public/
  admin/config.yml          CMS koleksiyon tanımları (i18n: multiple_folders)
  _redirects                Cloudflare Pages 301'leri
  images/hero/              hero slider görselleri — açıklayıcı adlarla, WebP (bkz. "SEO")
scripts/
  seo-denetim.mjs           dist/ üzerinde statik SEO denetimi (npm run seo)
  gorsel-olcu-integration.mjs  build sonrası <img>'lere width/height + en/404.html taşıma
  gorsel-webp.mjs           hero görsellerini WebP'ye çevirir (npm run webp)
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
- **EN içerik tam (2026-09-06):** 22 sayfa + 11 blog yazısının İngilizcesi
  `content/*/en/` altında. Metinler Türkçe aslından çeviridir, **Deltek onayından
  geçmedi** — yayın öncesi doğrulama gerekiyor. Teknoloji ağacının EN menü
  etiketleri `teknoloji.ts` → `en: { ad, tamAd }`; `teknolojiAgaci('en')`
  çevirisi olmayan düğümü (build'i durdurmadan) menüden düşürür.
- **EN route'ları TR'nin türevidir:** `en/[slug].astro` ve `en/404.astro`,
  TR dosyalarından `dil='en'` + `/en` öneki + `en-GB` tarih değişiklikleriyle
  üretildi. TR route'unda yapılan yapısal bir değişiklik EN'e de işlenmeli.
  Bileşenler (`TeknolojiHaritasi/Gezinme/YanMenu`, `HizmetDuzen`,
  `IlgiliSayfalar`) `dil` prop'u alır; etiketleri `CEVIRI[dil].tek/hizmet/sayfa`.

## Sayfa düzenleri

`sayfalar` koleksiyonundaki her sayfa `duzen` alanıyla üç düzenden birini seçer.
CMS'te "İçerik düzeni" açılır listesinden değiştirilir; kod değişikliği gerekmez.

| `duzen` | Ne yapar | Örnek |
| --- | --- | --- |
| _(boş)_ | Normal makale akışı — markdown gövdesi | `hakkimizda`, `medyalar` |
| `logo-izgara` | Art arda gelen görselleri yan yana dizer | _(kullanan sayfa yok)_ |
| `referanslar` | Kayan logo şeridi + markdown gövdesi | `referanslar` |
| `urun` | Ürün/teknoloji şablonu | `delgi-tijleri` + 13 teknoloji/hizmet sayfası |
| `iletisim` | İletişim şablonu (form yok) | `iletisim` |
| `hizmet` | Hizmetlerimiz şablonu (kart ızgaraları) | `hizmetlerimiz` |

Hangi sayfa hangi düzende olduğunu görmek için:

```bash
grep -l "^duzen: urun" src/content/sayfalar/tr/*.md      # ürün şablonu (14)
grep -l "^duzen: iletisim" src/content/sayfalar/tr/*.md  # iletişim şablonu (1)
grep -L "^duzen:" src/content/sayfalar/tr/*.md           # normal akış (12)
```

**Normal akışta kalanlar ve nedeni:** `hakkimizda`, `hizmetlerimiz`,
`medyalar` kurumsal sayfalar; `yatay-delgi-nedir`, `yatay-sondaj`,
`yonlendirilebilir-yatay-delgi`, `yonlendirilebilir-yatay-sondaj` ise **hiç
görseli olmayan**, başlık/liste yapılı uzun makaleler — ürün şablonuna
sokulursa boş görsel kutuları çıkardı. Bu üç "rehber" sayfası
(`TEK_REHBERLER`, `teknoloji.ts`) eskiden **yetimdi**; artık `yanMenu: true`
ile bölümün yan menüsünü alır, bölüm haritasında "Konu rehberleri" grubunda ve
ana sayfadaki "Rehber" bölümünde listelenir.
(`yatay-sondaj-kazisiz-yatay-delgi`, `kazisiz-altyapi-ve-kazisiz-teknolojiler`,
`boru-surme-boru-cakma-auger-boring`, `auger-boring-nedir-…` ve
`mikrotunel-nedir` de bu gruptaydı, sonradan kaldırıldılar.)

### Makale içinde sağa kayan görsel

Markdown gövdesinde bir görselin yazının etrafından akmasını istiyorsan
görseli `saga-kayan` sınıflı bir `<span>` ile sar:

```markdown
<span class="saga-kayan">![alt](/images/uploads/…/x.jpg)</span>Metin buradan devam eder…
```

Bunu CSS ile otomatik yapmak MÜMKÜN DEĞİL: `p > img:first-child` tek başına
duran görselleri de yakalıyor (referanslar logoları, blog görselleri),
`:not(:only-child)` ise işe yaramıyor — img'den sonra gelen DÜZ METİN element
sayılmadığı için img yine `:only-child` oluyor. Bu yüzden işaret içeriğe
konuluyor. 560px altında kayma kapanır, görsel tam genişliğe döner.

### `duzen: urun`

Boremak sitesindeki ekipman sayfası şablonundan uyarlandı; Boremak'a özgü içerik,
maskot blokları ve kategoriye özel dallanmalar çıkarıldı. Bileşen:
`src/components/UrunDuzen.astro`. Tümü frontmatter'dan sürülür:

```yaml
duzen: urun
bannerSembol: yonlendirilebilir-yatay-sondaj-metodu   # başlık banner'ı (aşağı bak)
banner: /images/uploads/ust-gorsel.jpg                # düz üst görsel — sembol varsa yok sayılır
bloklar:                  # görsel + metin, dönüşümlü hizalanır
  - baslik: "Malzeme ve üretim"
    metin: |-
      İlk paragraf. **Kalın** metin desteklenir.

      İkinci paragraf.
    gorsel: /images/uploads/x.jpg
    ters: true            # görsel sağda
    genis: true           # tam genişlik (görsel üstte, metin altında aynı genişlikte)
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

**Çok geniş görseller tam genişliğe yayılır.** Bir bloğun görselinin en/boy
oranı **>= 2** ise iki sütunlu düzen kullanılmaz: görsel içerik sütununun
tamamını kaplar, metin altına tek sütun olarak (`max-width: 70ch`) yazılır.

**`genis: true` ile ELLE de seçilebilir** — eşik iyi bir varsayılan ama her
zaman doğru karar değil. `/akilli-altyapi/` sayfasının açılış görseli
(`kazisiz-akilli-altyapi-2.webp`, 1170×667, oran 1,75) eşiğin altında kaldığı
için yarım sütuna oturuyordu; `genis: true` ile tam genişliğe alındı.
`genis: false` ise tersini yapar: oranı 2'yi geçen bir görseli iki sütunlu
düzende tutar.

> Elle seçilen blokta **metin görselle aynı genişlikte** olur
> (`.hsg-yatay--tam` 70ch sınırını kaldırır); kendiliğinden bu düzene giren
> bloklarda 70ch sınırı durur. Ayrım kasıtlı: `genis: true` yazan biri
> genişliği bilerek istiyordur, oranından ötürü giren blokta ise satır
> uzunluğunu korumak daha doğru.
Teknoloji sayfalarındaki 35 görselin 30'u 1170x350 (oran 3,34); yarım
genişlikte 270x81'lik bir şeride dönüşüyor, etrafı bomboş kalıyordu.
Oran derlemede dosya başlığından okunur (`src/data/gorselOlcu.ts` — JPEG/PNG/
GIF; sharp'a bağımlı DEĞİL, çünkü sharp bu projede doğrudan bağımlılık değil).
Okunamayan biçimlerde oran `null` gelir ve blok eski düzeninde kalır.

Blok metninde desteklenen tek biçimlendirme **`**kalın**`**, `[bağlantı](/yol/)`
ve satır başındaki **`### Alt başlık`**tır. `### ` ile başlayan bir paragraf
`<h4>` olur; blok başlığı `<h3>` olduğu için hiyerarşi h1 > h3 > h4 kalır.
Tek yıldızlı italik DESTEKLENMEZ — yazarsan sayfada düz yıldız olarak çıkar.

Markdown gövdesi bannerdan sonra, blokların önünde çıkar (giriş metni için).
Alanların hepsi isteğe bağlı. Blok üç şekilde render olur:

| Blokta olan | Sonuç |
| --- | --- |
| görsel + metin | iki sütun, sırayla sağa/sola dönüşümlü |
| yalnız görsel | tam genişlik görsel |
| yalnız metin | tam genişlik metin (boş görsel kutusu bırakmaz) |

### `seoBaslik` — kısa `<h1>`, uzun `<title>`

Üç HDD sayfasının görünen başlığı kısaltıldı (`HDD Nedir?`, `HDD Yapım Metodu`,
`HDD Makinesi`) — banner'da üstteki küçük etiket zaten "YÖNLENDİRİLEBİLİR YATAY
SONDAJ" yazdığı için uzun hâli tekrar oluyordu.

Ama bu sayfaların `<title>`'ı asıl anahtar kelime; kısaltmak arama tarafında
kayıp olurdu. Bu yüzden `baslik` (= `<h1>`) ile `<title>` ayrıldı:

```yaml
baslik: "HDD Nedir?"                                    # <h1>
seoBaslik: "Yönlendirilebilir Yatay Sondaj Nedir?"      # <title>, og:title, JSON-LD
```

`seoBaslik` boşsa `baslik` kullanılır, yani diğer sayfalarda hiç yazılmaz.
`src/data/teknoloji.ts`'teki `ad` (kart/dropdown) ve `tamAd` (yan menü)
etiketleri bundan bağımsız, elle yazılıyor.

### `duzen: referanslar` — kayan logo şeridi

`/referanslar/` sayfasının başında logolar otomatik kayan bir şerit olarak
basılır (`components/LogoSerit.astro`), altında markdown gövdesi gelir.
Reçete **Boremak sitesindeki "Delgi Başlıkları" şeridinden** alındı: liste
DÖRT kez basılır ve ray `-25%` kaydırılır; ikinci kopya tam birincinin yerine
geldiği için ek görünmez, sonsuz döner. Kenarlar `mask-image` ile söner,
fareyle üzerine gelince durur, `prefers-reduced-motion`'da hiç oynamaz.

* Logolar `src/data/referanslar.ts` (`REFERANS_LOGOLARI`) içinde, sıra
  şeritteki sıradır.
* **Dosyası olmayan logo hiç basılmaz** — `gorselOlcu()` null dönerse kayıt
  atlanır. Böylece henüz eklenmemiş bir logo kırık ikon olarak çıkmaz;
  dosya konulduğu anda kendiliğinden görünür.
* **Her logo aynı ALANI kaplar (~10.500 px²), aynı kutuyu değil.** Ölçü
  `LogoSerit.astro`'da derleme sırasında hesaplanır ve `--en`/`--boy` olarak
  hücreye yazılır; `HEDEF_ALAN`, `AZAMI_EN` (240px) ve `AZAMI_BOY` (110px)
  sabitleri orada. 620px altında hepsi `--lserit-olcek: .62` ile küçülür.

  Önce sabit bir kutuya (`240×96`) `object-fit: contain` denendi ve
  **yanlıştı**: contain kutunun KENARINA hizalar, yani geniş logo genişliği,
  uzun logo yüksekliği doldurur. Ölçüldüğünde Kolin 22.936 px², Saipem
  7.088 px² kaplıyordu — **3,2 kat fark**, gözle bariz. Alan normalizasyonuyla
  yayılım **1,15**'e indi (ölçüldü). Azami sınıra dayanan iki logo (Siemens
  6,36 oran; en uzunlar) hedef alana ulaşamıyor, sapmaları %13'ü geçmiyor.
* Logolar **renkli** akar; üzerine gelince **%20 büyür** (`scale(1.2)`) ve
  şerit durur, böylece büyüyen logo kaçmaz. Şeridin dolgusu bu büyümeye yetiyor
  (en uzun logo 110→132px, şeridin iç yüksekliği 164px), yani `overflow: hidden`
  kırpmıyor — ölçüldü.
* Şerit `width: 100vw; margin-inline: calc(50% - 50vw)` ile makale
  sütununun dışına, sayfanın tamamına taşar. `body { overflow-x: hidden }`
  global.css'te tanımlı olduğu için yatay taşma yaratmaz.
* Şeridin zemini **beyaz** olmalı: logolar beyaz kareli JPEG, `--kagit`
  zeminde her biri ayrı bir kare leke gibi görünüyordu.

* **Şeritteki dosyalar KIRPILMIŞ kopyalardır.** `scripts/referans-logo-kirp.mjs`
  kaynaklardaki boş payı atar ve `public/images/referans/` altına yazar; kaynaklar
  `public/images/uploads/2015/08/` (canlı siteden gelen yedi logo) ve
  `public/images/referans/kaynak/` (Saipem, Aramco) altında durur.

  Gerekli, çünkü kaynaklar çok farklı çerçevelenmiş: yedi logo 400×400 JPEG ve
  logo bu karenin içinde küçük duruyor, Saipem/Aramco ise saydam PNG ve görseli
  dolduruyor. Kırpılmadan alan normalizasyonu da işe yaramaz — hesap görselin
  oranına bakar, içindeki boş paya değil.

  ```bash
  node scripts/referans-logo-kirp.mjs
  ```

> **Şeritteki ilk kopya `loading="lazy"` yüzünden hiç yüklenmez** — ray sola
> kaydığı için ilk kopya görüş alanının dışında kalır. Sorun değil (görünen
> kopyalar yükleniyor) ama şeriti ölçerken `loading` değerini `eager` yapmadan
> `naturalWidth` okursanız sıfır görürsünüz.

### Banner sembolleri

Canlı sitede her teknoloji sayfasının tepesinde 1170×350'lik bir JPEG duruyordu:
**solda sayfa başlığı büyük harflerle görselin İÇİNE gömülü**, sağda konuyu
anlatan sembol. Bunun hemen üstünde bir de gerçek `<h1>` vardı — yani aynı
başlık sayfada iki kez görünüyordu, biri de arama motorlarının okuyamadığı
piksel hâlinde.

Çözüm: başlık metni görselden atıldı, geriye yalnız sembol bırakıldı; başlık
sayfanın **tek `<h1>`'i** olarak sembolün yanına, HTML metni olarak basılıyor.
Bileşen: `src/components/SayfaBanner.astro`.

```yaml
bannerSembol: yonlendirilebilir-yatay-sondaj-metodu   # src/assets/banner/<ad>.webp
```

* Dosya `src/assets/banner/` altında (**WebP**); `astro:assets` ile içe aktarılır, böylece
  `width`/`height` derlemede bilinir (CLS yok) ve **dosya yoksa build durur**.
* `bannerSembol` verilen sayfada ayrı bir `<h1>` satırı ve `UrunDuzen`'in düz
  `banner` görseli **basılmaz** — ikisi de aynı başlığı tekrar ederdi.
* Başlığın üstündeki küçük etiket ağaçtaki üst dalın adıdır; **başlık zaten o
  adla başlıyorsa basılmaz** (ör. üst dal "Yönlendirilebilir Yatay Sondaj",
  başlık "Yönlendirilebilir Yatay Sondaj Yapım Metodu" → etiket yok). Aksi
  hâlde giderdiğimiz tekrarın aynısı olurdu.
* Kutu yüksekliği `--sbn-y`: `clamp(147px, 15.8vw, 197px)`. Sembolün genişliği
  `--sbn-y × doğal en/boy` (`--sembol-oran`), üst sınır kutunun %50'si. Yani
  **sembol hiçbir zaman kırpılmaz**: yükseklik değişince o da aynı oranda
  ölçeklenir, üst sınıra dayanan tek sembol (boru-yenileme, 1440px'te %49)
  `object-fit: contain` ile küçülür. Arta kalan yerde banner'ın kendi gradyanı
  göründüğü için letterbox fark edilmez. 720px altında sembol başlığın altına
  iner. `cover` + %47 denenmişti; dört sembolü soldan kırpıyordu.
* Zemin **düz** tek ton (`#F0F0F0` = `--banner-zemin`); banner kutusu birebir
  aynı değeri kullanır, yoksa kesim yerinde dikiş görünür. Ölçüm: mobil ve
  masaüstünde dikişteki fark 0/255.
* Kaynak JPEG'lerde zemin düz DEĞİLDİ: 350px boyunca `#F5F5F5` → `#ECECEC`
  düşey gradyan. Kutuya da aynı gradyan verilmişti ve **yalnız görselin
  yüksekliği kutununkine eşitken** örtüşüyordu. Mobilde sembol başlığın altına
  inip 150px'e düşünce kutu ~236px oluyor, iki gradyan 3-4 ton ayrışıyor ve
  sembolün dikdörtgeni açık bir leke olarak görünüyordu. Çözüm: kesme betiği
  gradyanı düzleştiriyor — her satıra `(240 - beklenen)` farkı ekleniyor, zemin
  her yerde tam 240 oluyor, görselin kendi pikselleri en çok ±5 ton kayıyor
  (gözle ayırt edilemez). Maskeleme/taşma-doldurma gerekmiyor, her görselde
  aynı şekilde çalışıyor.
* İki clipart'ın (`kazisiz-akilli-altyapi`, `..-nedir`) kırpılmamış **beyaz
  kutusu** vardı; kenara bitişik beyaz bölge taşma-doldurma ile gradyana
  boyandı. Nesnenin içindeki parlamalar kenara bağlı olmadığı için korundu.
  Eşik 246 — zemin gradyanının tepesi 245, yani **normal zemine ve fotoğrafların
  açık gri bölgelerine hiç dokunulmuyor**. 241 denendi: sonuç piksel piksel aynı
  ama 13 görselin hepsinde zemini de yeniden boyuyordu, gereksiz risk.
* Başlık, canlı görseldeki gibi **ağır ve sıkışık**: Open Sans'ın DEĞİŞKEN
  sürümü + genişlik ekseni (`font-stretch: 75%`, ağırlık 800). Bunun için
  `Layout.astro`'daki Google Fonts isteği `ital,wdth,wght@0,75..100,400..800`
  oldu — ayrık ağırlıkları tek tek istemekten **ucuz**: latin+latin-ext için
  4 dosya / 192KB, önceki 10 dosya / 359KB. Genişlik ekseni yalnız bu başlıkta
  kullanılıyor, sitenin geri kalanı 100% (varsayılan) genişlikte kalıyor.
* `line-height` 1.02 denenmişti: Türkçe büyük harflerde **J'nin kuyruğu, Ç/Ş
  sedillası ve Ğ'nin şapkası** alt satıra ve sarı çizgiye giriyordu. 1.14 ikisini
  de kurtarıyor. Punto da 3rem'den 2.8rem'e çekildi; 3rem'de "BORU SÜRME/ÇAKMA"
  eğik çizgiden bölünüp iki satıra düşüyordu.
* Semboller `scripts/banner-sembol-kes.mjs` ile üretildi; kesim x'leri ve beyaz
  kutu temizliği orada. Çıktılar depoda duruyor, betik yalnız kaynak görsel
  değişirse yeniden çalıştırılır.
* Metinli **orijinal JPEG'ler silinmedi** (`public/images/uploads/2015/08/…-1.jpg`).
  Artık hiçbir sayfadan bağlanmıyorlar ama WordPress medya URL'leri korunsun
  diye duruyorlar.
* Yeni sembol eklenirse `public/admin/config.yml`'deki `bannerSembol` select
  listesine de yazılmalı.

`yatay-sondaj-teknoloji` (bölüm kök sayfası) bunun dışında: onun banner'ında
gömülü başlık yok, o yüzden eskisi gibi `banner` + ayrı `<h1>` kullanıyor.

### Teknoloji bölümü

19 teknoloji/yöntem sayfası taşınmıştı ama **14'ü yetimdi**: adresi
çalışıyordu, hiçbir yerden bağlantı verilmiyordu. Beşi sonradan kaldırıldı
(mükerrer ya da başka bir sayfaya taşındı, bkz. 301 tablosu) — **bölüm bugün
kök dahil 16 sayfa.** Bilgi mimarisi canlı sitedeki "Teknoloji"
açılır menüsünden alınıp `src/data/teknoloji.ts` içine ağaç olarak yazıldı.

```
Teknoloji (/yatay-sondaj-teknoloji/)
├── Yönlendirilebilir Yatay Sondaj      8 alt sayfa
│   └── Yer Belirleme                   → Üzerinden Takip, Manyetik Alan
└── Diğer kazısız yöntemler             3 sayfa
```

Ağaçta **yalnızca slug ve kısa menü adı** durur; başlık, özet ve görsel
sayfanın kendi frontmatter'ından okunur (`teknolojiAgaci()` — `src/data/icerik.ts`).
Menü etiketleri sayfa başlıklarıyla aynı olmak zorunda değil; canlı sitedeki
kısa adlar korundu.

Yan menüde artık **"Teknolojiye genel bakış" maddesi yok**; bölüm kök sayfası
(`/yatay-sondaj-teknoloji/`) yalnızca banner + kart haritasından ibaret bir
dizin. Oraya header'daki "Teknoloji" bağlantısından ve sayfa altındaki
"Teknoloji bölümünün tamamı" bağlantısından gidilir. Kök sayfanın makale
içeriği `yonlendirilebilir-yatay-sondaj` sayfasının başına taşındı.

**Ağaçtaki bir slug'ın sayfası yoksa build durur.** Menüde 404'e giden bağlantı
bırakmaktansa hatayı derlemede görmek daha iyi; sayfa yeniden adlandırılırsa
burada yakalanır.

Dört yerden görünür:

1. **Header açılır menüsü** (`Layout.astro`) — her sayfada, iki sütun.
   `menu.map` içinde slug `TEKNOLOJI_KOK` ise düz bağlantı yerine `.dd` basılır.
2. **Bölüm haritası** (`components/TeknolojiHaritasi.astro`) — kök sayfanın
   altında kart ızgarası. `bolumHaritasi: true` frontmatter alanıyla açılır.
3. **Sayfa altı gezinme** (`components/TeknolojiGezinme.astro`) — 19 sayfanın
   her birinin altında: önceki/sonraki + komşu sayfa listesi + köke dönüş.
   Veri `teknolojiKomsulari()`; slug ağaçta değilse `null` döner ve bileşen
   hiç basılmaz, yani blog yazılarında ve diğer sayfalarda çıkmaz.
4. **Yan menü** (`components/TeknolojiYanMenu.astro`) — akordiyon ağaç,
   canlı sitedeki sidebar widget'ın karşılığı. **Bölümün 20 sayfasının
   hepsinde** görünür (canlı sitede de öyle): ağaçtaki her sayfada otomatik,
   kök sayfada `yanMenu: true` ile (kök ağacın parçası değil). Sayfa iki
   sütuna geçer (`.yazi--yan`, ≥900px: 268px + kalan; altında tek sütun).
   Aktif sayfa vurgulanır ve dalı **sunucuda** açık gelir, JS beklenmez.

   Yan menü etiketleri `tamAd` alanından gelir, header açılır menüsü ve
   kartlar kısa `ad`ı kullanır. Üç HDD sayfası yan menüde **"HDD Nedir?" /
   "HDD Yapım Metodu" / "HDD Makinesi"** olarak kısaltıldı: üst üste üç kez
   "Yönlendirilebilir Yatay Sondaj" okumak listeyi taratıyordu. `HDD` sitenin
   kendi kısaltması (içerikte 51 kez, `YYS` 17 kez geçiyor).

   **SEO etkisi kabul edilebilir:** sayfaların `<title>`, `<h1>`, URL ve gövde
   metni değişmedi — sıralamayı taşıyan sinyaller onlar. Değişen yalnızca iç
   bağlantı çapası; uzun anahtar kelime "Yönlendirilebilir Yatay Sondaj" üst
   dal etiketinde ve kart ızgarasında hâlâ duruyor.

   > **Üç tuzak:** (a) `<details>` kullanılmadı — kapanırken içerik anında
   > kaybolduğu için geçiş oynamıyor; onun yerine `grid-template-rows: 0fr→1fr`.
   > (b) Kapalı dalın `visibility: hidden` kuralı `>` ile yazılmalı: torun
   > seçici olursa açık bir dalın içindeki kapalı alt dal görünür sayılır ve
   > oradaki bağlantılar Tab sırasında kalır.
   > (c) **`<article class="yazi--yan">`in doğrudan çocuğu SADECE İKİ TANE
   > olmalı** — yan menü ve `.yazi__ana`. Izgara iki sütunlu
   > (`268px minmax(0,1fr)`), yani üçüncü bir çocuk otomatik yerleşimle
   > 1. sütun / 2. satıra, yani **yan menünün altına** düşer. Yaşandı: sayfa
   > sonundaki telefon CTA'sı `.yazi__ana`nın dışındaydı; 268 px'lik dar bir
   > şeride dönüşüyor ve sayfanın dibine inildiğinde yapışkan menü hâlâ orada
   > durduğu için onun altında kalıyordu (ölçüldü: buton x387-655, menü
   > kutusunun tam içinde). Sayfa sonuna bir blok eklerken `.yazi__ana`nın
   > İÇİNE koyun.

Gezinmedeki liste **düğümün alt sayfası varsa onları**, yoksa kardeşlerini
gösterir: bir grup sayfasında (ör. `/yer-belirleme/`) okuyucu zaten o başlığın
içindedir, alt sayfalar daha yakındır.

> **Kart deseni:** kart bir `<a>` DEĞİL `<article>`. "Yer Belirleme" kartının
> içinde iki alt sayfa bağlantısı var; kartı `<a>` yapsaydık iç içe `<a>`
> olurdu. Bunun yerine kart adı "gerilmiş bağlantı" (`.tkart__ad::after`
> kartı kaplar), alt sayfa rozetleri `z-index: 1` ile üstte kalıp kendi
> bağlantılarını korur. Kart görselsizse baş harf rozeti çıkar (5 sayfada).

### `duzen: hizmet`

`/hizmetlerimiz/` sayfasının şablonu. Bileşen: `src/components/HizmetDuzen.astro`.
Canlı sitedeki bölüm sırası korundu, sunum yenilendi:

1. **Dört ana hizmet** — kart ızgarası (4/2/1 sütun), her kart ilgili teknoloji
   sayfasına gider
2. **"Neden Bizi Seçtiler?"** — metin + işaretli madde listesi + görsel, iki sütun
3. **"Son Projeler"** — üç görselli galeri
4. **"Uygulama Alanlarımız"** — dört kart, hepsi `/iletisim/`'e

```yaml
duzen: hizmet
hizmetler:
  - baslik: "Yönlendirilebilir Yatay Sondaj"
    kisaltma: "HDD"        # başlığın altındaki rozet
    ikon: sondaj           # bileşendeki IKON setinden anahtar
    href: "/yonlendirilebilir-yatay-sondaj-nedir/"
    metin: "..."
neden:   { baslik, metin, maddeler: [...], gorsel }
projeler:{ baslik, metin, galeri: [{ foto, alt }] }
alanlar: { baslik, ogeler: [{ baslik, metin, ikon, href }] }
```

Canlı sayfa FontAwesome ikonları kullanıyordu; burada aynı anlamları taşıyan
kendi çizgi ikonlarımız var (`IKON` sabiti: `sondaj boru yenileme akilli kablo
basinc cazibe nehir`). Yeni ikon önce oraya eklenir; **bilinmeyen anahtar
sessizce ikonsuz kalır**, build patlamaz.

Kartlar `<article>`; başlık "gerilmiş bağlantı" (`::after` kartı kaplar), böylece
kartın her yeri tıklanabilir ama iç içe `<a>` üretilmez.

> **Genişlik:** kart ızgaralı sayfalar `.yazi`nin 820px'lik makale sütununa
> sığmaz — dört sütun 170px'e iner ve kartlar 1000px'i aşar. `duzen: hizmet`
> sayfaya `.yazi--genis` (1180px) verir; dört sütuna da ancak makale bu azami
> genişliğe ulaştığında (≥1180px) geçilir.

### `duzen: iletisim`

`/iletisim/` sayfasının şablonu. Bileşen: `src/components/IletisimDuzen.astro`.
**Form yoktur ve bilinçli olarak eklenmedi** — statik çıktıda çalışan bir form
üçüncü taraf bir servise bağlanmayı gerektirir. Sayfa bunun yerine telefon ve
e-postayı sayfanın en üstünde büyük dokunma hedefleri olarak verir.

Bölümler: başlık + `ozet` → telefon/e-posta kartları → (varsa markdown gövdesi)
→ ofis kartları → harita → kapanış çağrısı.

| Veri | Nereden |
| --- | --- |
| Telefon, e-posta, ticari unvan | `SITE` (`src/data/site.ts`) |
| Ofis kartları | `OFISLER` — `merkez: true` olan "Merkez ofis" rozetini alır |
| Yol tarifi bağlantısı | `yolTarifi(ofis)` adresten üretir, ayrıca saklanmaz |
| Harita | sayfanın frontmatter'ındaki `harita` (embed src); boşsa bölüm çıkmaz |
| Etiketler | `CEVIRI[dil].iletisim` — iki dilli metin bileşene gömülmez |

Ofis eklemek/çıkarmak **kod değişikliğidir** (`OFISLER`); CMS'ten yalnızca
harita ve `ozet` değiştirilebilir. İletişim bilgileri zaten `site.ts`'te tek
kaynakta durduğu için bilerek böyle.

> **Tuzak:** `global.css` içindeki `a.btn[href^="tel:"]` tüm telefon butonlarını
> maviye boyar ve özgüllüğü (0,2,1) sıradan bir sınıf seçicisini yener. Lacivert
> CTA şeridindeki sarı buton bu yüzden `.ilet__cta a.btn.ilet__ctaBtn` ile
> yazılıyor. **Ana sayfadaki `.bit-cta` şeridi aynı tuzağa düşmüştü:** buton
> bandın kendisiyle birebir aynı maviye boyanıp görünmez olmuştu; seçici
> `.bit-cta a.btn.bit-cta__btn` (0,4,1) yapıldı, buton beyaz zemin + mavi yazı
> (6.05 kontrast). Koyu zemine telefon butonu koyan başka bir yer olursa aynı
> tuzak — sınıf seçicisi TEK BAŞINA yetmez.

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

## Renk paleti

**Sitedeki her renk bu paletten gelir.** Tanım tek yerde: `src/styles/global.css`
`:root`. Bileşenlerde ham `#hex` ya da `rgba()` **yazılmaz**; yeni bir tona
ihtiyaç olursa önce buraya eklenir.

### Palet

| Değişken | Değer | | Değişken | Değer |
| --- | --- | --- | --- | --- |
| `--blue-50` | `#E5F0FF` | | `--blue-600` | `#0052CC` |
| `--blue-100` | `#CCE0FF` | | `--blue-700` | `#003D99` |
| `--blue-200` | `#99C2FF` | | `--blue-800` | `#002966` |
| `--blue-300` | `#66A3FF` | | `--blue-900` | `#001433` |
| `--blue-400` | `#3385FF` | | `--blue-950` | `#000E24` |
| `--blue-500` | `#0066FF` | | `--marka-mavi` | `#185AD6` |
| `--gold` | `#FFD60A` | | `--sari-okul` | `#FFC300` |
| `--koyu-kirmizi` | `#A4161A` | | `--beyaz` | `#FFFFFF` |
| `--banner-zemin` | `#F0F0F0` | | | |

`--marka-mavi` **Deltek logo mavisi ve değişmez** — bağlantılar, butonlar,
başlıklar bu rengi kullanmaya devam eder. `--beyaz` paletin parçası değil ama
kaçınılmaz (sayfa zemini, mavi üstündeki yazı).

`--banner-zemin` de paletten değil: `src/assets/banner/*.webp` sembollerinin
zemini tam bu nötr gri, banner kutusu onlarla dikişsiz birleşmek zorunda.
**Yalnız `SayfaBanner.astro` kullanır**; başka yerde bu gri yazılmaz.

### Anlamsal takma adlar

Bileşenler doğrudan `--blue-*` yerine bunları kullanır; böylece paletteki bir
tonu değiştirmek tüm siteye tek yerden yansır.

| Takma ad | Kaynak | Nerede |
| --- | --- | --- |
| `--mavi` | `--marka-mavi` | bağlantı, buton, başlık vurgusu |
| `--mavi-700` | `--blue-600` | buton hover |
| `--mavi-900` | `--blue-700` | koyu başlık, koyu yüzey |
| `--mavi-050` / `--mavi-100` | `--blue-50` / `--blue-100` | açık mavi zeminler |
| `--kagit` | `--blue-50` %45 + beyaz | sayfa/footer zemini |
| `--kagit-2` | `--blue-50` | görsel yer tutucu zemini |
| `--metin` | `--blue-950` | başlık metni |
| `--mute` | `--blue-950` %60 + beyaz | gövde metni |
| `--cizgi` / `--cizgi-2` | `--blue-100` / `--blue-200` | kenarlıklar |
| `--sari` | `--gold` | başlık altı çizgi, menü hover, CTA şeridi |
| `--vurgu` | `--sari-okul` | ikincil vurgu — **yalnızca zemin olarak** |
| `--vurgu-metin` | `--blue-600` | açık zeminde vurgulu metin |

### Saydamlık

`rgba(...)` yazmak yerine RGB üçlüsü değişkenleri kullanılır, böylece gölgeler
ve perdeler de palete bağlı kalır:

```css
box-shadow: 0 10px 22px -8px rgb(var(--blue-800-rgb) / .35);
```

Tanımlı üçlüler: `--marka-mavi-rgb`, `--blue-500-rgb`, `--blue-800-rgb`,
`--blue-900-rgb`, `--blue-950-rgb`, `--gold-rgb`, `--koyu-kirmizi-rgb`,
`--beyaz-rgb`.

### Kontrast kuralları (WCAG AA)

Paleti uygularken ölçülen ve düzeltilen tuzaklar — yeni renk seçerken bunlara
dikkat edin:

- **Amber (`--sari-okul` / `--gold`) metin rengi olarak kullanılamaz.** Açık
  zeminde 1.6 kontrast veriyor. Zemin olarak kullanılır ve üstüne
  `--blue-950` yazılır (12.0). Açık zeminde vurgulu metin için `--vurgu-metin`.
- **`--mute` en az `--blue-950` %60 karışımı olmalı.** %55'te beyaz üzerinde
  4.05'e düşüyor, AA sınırının (4.5) altında. %60 → 5.14.
- **Fotoğraf üzerindeki gövde metni `--mute` kullanmaz.** Perde fotoğrafı tam
  beyazlatmadığı için 3.8'e düşüyor; açık slaytlarda `--blue-800` kullanılır.
- **Açık mavi tonlar (`--blue-200`/`--blue-300`) metin için değildir.**
  `--blue-50` üzerinde 1.6–2.2 veriyor; kenarlık ve ayraç içindir.

Denetim yöntemi: sayfadaki her metin ögesinin hesaplanan rengi ile ardındaki
gerçek zemin bulunup WCAG oranı hesaplanır. Slayt yazıları için zemin, arka
plan fotoğrafı canvas'a çizilip metin kutusunun altındaki ortalama renk
alınarak ve perde bindirilerek bulunur (`color-mix` çıktısı `color(srgb 0..1)`
biçiminde gelir — ayrıştırırken 0-255'e çevirmeyi unutmayın).

> **Tuzak:** değiştirme betikleri `#FFFFFF → var(--beyaz)` gibi bir kuralı
> paletin kendi tanımına da uygulayıp `--beyaz: var(--beyaz)` döngüsü
> yaratabilir. Döngüsel özel değişken geçersizdir; ona bağlı `color-mix`
> değerleri de çöker ve metin siyaha düşer. Değişiklikten sonra
> `--mute` / `--kagit` gerçekten hesaplanıyor mu diye bakın.

**OG görseli** paleti SVG içinde elle kopyalar (`scripts/og-gorsel-uret.mjs`,
`MAVI`/`SARI`/`ZEMIN`… sabitleri) — CSS değişkeni okuyamıyor. Palet değişirse
o dosya da güncellenip `npm run og` yeniden çalıştırılmalı.

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

**Hero slider** — `src/components/HeroSlider.astro`, veri `src/data/hero.ts`.

**Görsel katmanlar** canlı deltek.com.tr'deki Revolution Slider'dan birebir alındı:
8 slayt (canlı slider'ın 9.'su kaldırıldı), 8 görsel + 1 YouTube katmanı; konum, geçiş
tipi, gecikme ve süre orijinaliyle aynı (6. slaytta sondaj biti soldan gelip toprak
adasına giriyor). **Slayt sırası canlı siteninkinden farklı** (bkz. "Slaytların
sırasını değiştirmek"), o yüzden canlı slider'a bakarken numaralar tutmaz.
Koordinatlar canlı slider'ın **1920×500 tasarım ızgarasındaki** pikseller
(`HERO_IZGARA`); bileşen container-query birimiyle (`--olcek`) orantılı ölçekler.
**`.slider__ray` en-boy oranı `1920/500` olmak zorunda** — değişirse katmanlar kayar.

7. slayttaki YouTube gömüsü tablet çerçevesinin (`kaya-delgi-video-tablet.webp`) koyu ekran
dikdörtgenine birebir oturur: **474×351 @ (1110,104)**, PNG'nin `#222` ekran
alanı ölçülerek bulundu. Canlı slider `486×356 @ (1109,99)` diyor ama o değer
ekranı birkaç piksel taşırıyor. Video katmanı, görsellerden farklı olarak
yüksekliğini de veriden alır (`k.h`), oranı sabit değildir.

**Yazılar yeniden tasarlandı.** Orijinalde her slaytta 4-7 ayrı metin katmanı vardı
ve 2016 tema efektleriyle geliyordu (sert çift gölge, renkli kutucuklar, 17px'e
düşen puntolar). İçerik korundu, tek bir tipografik blokta toplandı:

```yaml
yazi:
  ustlik: 'Teknoloji'            # küçük, aralıklı, altın/amber üst satır
  baslik: '...'                  # 800 ağırlık, puntosu aşağıdaki `punto`
  punto: 42                      # başlık puntosu (1920 ızgarasında); varsayılan 52
  satirlar: ['...']              # gövde satırları
  eylem: 'Bize ulaşın'           # buton (isteğe bağlı)
  eylemKonum: akis | dip         # 'dip': buton slaytın en altına sabitlenir
  eylemHref: '/iletisim/'        # buton bağlantısı (varsayılan /iletisim/)
  konum: sol | merkez | sag      # yatay yer ('orta' DEĞİL — o `dikey`in değeri)
  dikey: ust | orta | alt        # katmanların kapladığı bandın dışı
  kaydir: { x: -40, y: 20 }      # dokuz hazır yerin üstüne ince ayar (aşağı bak)
  tema:  koyu | acik             # arka plan koyu mu açık mı
```

`tema` yazı ve perde rengini belirler: **2, 4 ve 7. slaytlar koyu fotoğraf** (beyaz
yazı, koyu perde), **kalan beşi çok açık zemin** (lacivert yazı, açık perde). Perde
fotoğrafın tamamını değil yalnızca yazının olduğu yanı yumuşatır.

**Açık slaytlarda başlık ve gövde `--blue-800`** (#002966, lacivert).
Tek yer: `HeroSlider.astro` → `.yazi--acik .yazi__baslik`. İki ton denendi
ve elendi: `--mavi-900` (#003D99) beyaza yakın slayt zemininde lacivert
değil **canlı mavi** okunuyor, `--metin` (#000E24) ise **siyaha** düşüyor.
Başlık ile gövdenin aynı tonda olması kasıtlı — hiyerarşi renkten değil
puntodan geliyor (52 px / 800 ağırlık ile 21 px / 400).

Koyu slaytlarda beyaz yazının fotoğraf üzerindeki kontrastı ölçüldü
(2026-09-10, harf maskesi ±6 px genişletilerek): ortalama **6.1-9.8**,
zeminin yalnız %1-4'ünde 2.6'nın altına düşüyor (fotoğraftaki tekil parlama
lekeleri). Kabul edilen durum.

**Satır kırmak için `\n` kullanılır**, `<br />` değil. Metinler kaçışlanarak
basıldığı için ham HTML düz metin olarak görünür; `\n` bileşende gerçek `<br>`'ye
çevrilir (`satirlaraBol`). Hem `baslik` hem `satirlar` için geçerli.

`konum`/`dikey` her slaytta o slayttaki katmanların kapladığı alana göre seçildi.

### İngilizce metin her slaydın İÇİNDE

Her slaydın bir `en` alanı var; İngilizce sayfa `HERO_EN` ile ondan türetiliyor:

```yaml
en:
  alt: 'Deltek horizontal drilling fleet — ...'   # arka planın EN alt'ı
  yazi:
    ustlik: 'You are in the right place'
    baslik: 'Horizontal\ndrilling\nspecialists'
    satirlar: ['...']
    eylem: 'Request a quote'
    eylemHref: '/en/iletisim/'
```

İki kural:

* **Düzen `en`de YOK.** `konum`, `dikey`, `tema`, `eylemKonum` ve `kaydir`
  Türkçe slayttan miras alınır — düzen dile değil arka plandaki görsele bağlı.
  Gerçekten dile bağlı bir istisna çıkarsa (İngilizce başlık bir satır uzun
  sarıp katmana değiyor gibi) alanı `en.yazi` içinde yazıp ezebilirsiniz,
  ama **neden** gerektiğini de yazın.
* **Metin tamamen `en.yazi`den gelir.** `en.yazi`de olmayan bir metin alanı
  `/en/`de BOŞ kalır, Türkçesine düşmez. Düşseydi eksik çeviri, Türkçe bir
  satır olarak İngilizce sayfada yayına çıkardı.

`en.yazi.eylem` varsa `eylemHref` `/en/` ile başlamak zorunda; başlamazsa
derleme durur. (Varsayılan `/iletisim/`e düşmek, İngilizce butonu Türkçe
iletişim sayfasına götürürdü — sessiz bir kusur.)

> **Neden böyle:** İngilizce metinler eskiden `EN_YAZI`/`EN_ALT` adlı ayrı
> dizilerdeydi ve slaytlarla **sıra numarasından** eşleşiyordu
> (`HERO_TR.map((s, i) => ({ ...s, yazi: EN_YAZI[i] }))`). Bir slayt eklemek,
> silmek ya da yerini değiştirmek diziyi kaydırıp her slaydı yanlış İngilizce
> metinle eşliyordu — hata vermeden, yalnız `/en/` sayfasında. Aynı desen iki
> kez ayrışma üretti (`deltek-cozum-dugmesi-el.webp` slaydında düzeltme yalnız
> TR'ye uygulandı; `deltek-yatay-sondaj-makine-parki.webp` slaydında `dikey` iki
> dilde farklı kaldı).

### Slaytların sırasını değiştirmek

`HERO_TR` içindeki nesneleri yer değiştirmek yeterli — slaytlar dizideki
sırayla çıkar, noktalar ve otomatik geçiş sayıdan türer, İngilizce sayfa da
aynı sırayı alır (metin artık slaydın içinde).

Dikkat edilecek tek şey **1. slaydın LCP olması**: arka planı
`loading="eager"` + `fetchpriority="high"` ile, katmanları da `eager` ile
yüklenir; kalan slaytlar tembel. Yani başa aldığınız slaydın ağırlığı doğrudan
ilk açılış hızına yazılır.

| Slayt | Arka plan | Katman | İlk ekranda inen |
| --- | --- | --- | --- |
| 1 `deltek-yatay-sondaj-makine-parki` | 2 KB | 2 | **97 KB** |
| 2 `deltek-onshore-hdd-yatay-sondaj-sahasi` | 289 KB | — | 289 KB |
| 3 `kazisiz-altyapi-projesi` | 23 KB | 1 | 59 KB |
| 4 `boru-hatti-yatay-sondaj-santiyesi` | 262 KB | — | 262 KB |
| 5 `yatay-sondaj-proje-modelleme` | 36 KB | 2 | 123 KB |
| 6 `yatay-delgi-sondaj-teknolojileri` | 12 KB | 2 | 71 KB |
| 7 `kaya-delgi-yatay-sondaj-arkaplan` | 56 KB | 1 | 58 KB |
| 8 `kazisiz-altyapi-cozumleri` | 3 KB | 1 | 17 KB |

İki ağır fotoğraf (2 ve 4) bilerek başta değil. 1. slaydın 97 KB'ının 53'ü
`deltek-saha-iscisi.webp`, ve o katman **1450 px altında `darGizle` ile
gizleniyor** — yani telefonda ve dar masaüstünde indirilip hiç gösterilmiyor.
Başa daha hafif bir slayt aranırsa 7 (58 KB) ya da 8 (17 KB) var.

Sıra değişirse bu belgedeki ve `hero.ts` yorumlarındaki **slayt numarası
atıfları bayatlar** (7. slayttaki video, 6. slayttaki tij/buton, 8. slayttaki
el gibi) — birlikte güncelleyin. İki kez sıralandı; en sonu **2026-09-08**:
o günkü 5·1·3·4·7·2·6·8 → yeni 1·2·3·4·5·6·7·8. Derleme hata mesajlarındaki numaralar çalışma
anında hesaplandığı için kendiliğinden doğru kalır.

### `kaydir` — dokuz hazır yerin üstüne ince ayar

`konum`/`dikey` dokuz köşe veriyor; arada bir yer gerekiyorsa `kaydir`:

```yaml
kaydir: { x: -40, y: 20 }   # 40 sola, 20 aşağı
```

**Birim katmanlarla aynı: 1920×500 tasarım ızgarası pikseli**, sabit CSS
pikseli değil — yani ekranla orantılı ölçeklenir. Bir katmanı `x: 40`
kaydırmakla yazıyı `kaydir: { x: 40 }` kaydırmak aynı mesafeyi verir.
x pozitif sağa, y pozitif aşağı. Verilmeyen eksen 0.

Ölçüldü (1440 px ekran, ölçek 0.7422): `x: 40` → 29,7 px sağa; `y: -20` →
14,8 px yukarı. Sağa hizalı bloklarda da (`konum: sag`) pozitif x sağa
götürür, yön ters dönmez.

İki sınırı var, ikisi de bilinçli:

* **Dar ekranda (≤820px) yok sayılır.** Orada slayt akış düzenine geçip yazı
  tam genişlikte ortalanıyor; masaüstü için verilmiş bir kaydırma o düzeni
  merkezden kaçırırdı.
  > **`translate` ÖZELLİĞİNİ sıfırlamayın, `--kx`/`--ky` DEĞİŞKENLERİNİ
  > sıfırlayın.** Mobil blokta uzun süre `transform: none !important` ile
  > `translate: none !important` yan yana duruyordu. Lightning CSS (Astro'nun
  > küçültücüsü) ikisini tek `transform: translate(0,0) !important` içinde
  > birleştirip `translate` bildirimini **düşürüyor** — oysa ikisi ayrı
  > özellik ve birbirinin üstüne biniyor. Sonuç: kural dev sunucusunda
  > çalışıyor, **üretim derlemesinde sessizce kayboluyordu**; `kaydir` verilen
  > beş slaytta yazı mobilde 60,5 px kayıp kutudan taşıyordu (2026-09-08'de
  > ölçülüp düzeltildi). Artık `--kx: 0 !important; --ky: 0 !important`
  > yazılıyor; özel değişkenlere küçültücü dokunmuyor. Inline stil `--kx`i
  > elementin üstüne yazdığı için `!important` şart.
* **`eylemKonum: 'dip'` butonuna yalnız `x` uygulanır.** Buton bilerek slaytın
  dibine sabit; `y`'yi ona da uygulamak o sabitlemeyi anlamsız kılardı. `x`
  uygulanır ki buton yazıyla hizalı kalsın. (Ölçüldü: `kaydir: { x: 80, y: 30 }`
  verilen 6. slaytta buton 59 px sağa gitti, dikeyde 1 px oynamadı.)

> **`transform` DEĞİL `translate` üretiliyor.** `.yazi--orta` dikey ortalama
> için zaten `transform: translateY(-50%)` kullanıyor; aynı özelliği ikinci
> kez yazmak onu ezer ve blok dikeyde yerinden oynardı. `translate` ayrı bir
> özellik olduğu için üstüne biniyor. Aynı gerekçe yazının giriş
> animasyonunda da var (`yazi-gir`).

Değer sayı olmak zorunda; `'40px'` gibi bir metin CSS `calc()`'ini sessizce
çökertip kaydırmayı hiç uygulamazdı, o yüzden derlemede yakalanıyor.

> **Geçersiz değer sayfayı sessizce bozar — artık build'de yakalanıyor.**
> Bu alanlar doğrudan CSS sınıfına çevriliyor (`yazi--${konum}` …). 'Kullanım
> alanları' slaytında `konum: 'orta'` yazılmıştı; 'orta' `dikey`in değeri, yataydaki karşılığı
> 'merkez'. Sonuç: `yazi--orta` iki kez basıldı, YATAY konum sınıfı
> (`--sol/--merkez/--sag`) hiç basılmadı. `.yazi` mutlak konumlu ve yatay
> yerini yalnız o sınıflardan aldığı için blok `left` almadan kaldı, slaytın
> sol kenarından taşıp ekranın dışında kesildi. TypeScript bunu yakalar ama
> **`astro build` tip denetimi yapmaz** (`@astrojs/check` kurulu değil), o
> yüzden sessizce geçti. `HeroSlider.astro` artık `konum`, `dikey`, `tema` ve
> `eylemKonum` değerlerini derlemede doğruluyor ve geçersiz değerde slayt
> numarasını yazarak build'i durduruyor.

### Başlık puntosu ve 821-1190 px bandındaki okunurluk (AÇIK KONU)

Slayt yazılarının tamamı `--olcek` ile, yani slider genişliğiyle **doğrusal**
ölçekleniyor (`--olcek: 100cqw / 1920`). Başlık her slaytta aynı: tasarım
ızgarasında 52 px, yani slider genişliğinin **%2,71'i**.

| Slider | Başlık | Gövde | Üstlik |
| --- | --- | --- | --- |
| 1920 px | 52 px | 21 px | 17 px |
| 1440 px | 39 px | 16 px | 13 px |
| 1280 px | 35 px | 14 px | 11 px |
| 1024 px | 28 px | 11 px | 9 px |
| 900 px | 24 px | 10 px | 8 px |

İlk iki satır iyi. **821-1190 px bandı sorunlu**: masaüstü düzeni 821 px'e
kadar sürüyor (akış düzenine geçiş `@media (max-width: 820px)`), orada gövde
metni 10-13 px'e, üstlik 8-10 px'e iniyor. Küçük dizüstü ve yatay tablet bu
banda düşer.

**Denendi ve geri alındı:** yazıya kendi ölçeği verilip taban konuldu
(`--olcek-y: max(var(--olcek), .62px)`). Okunurluk düzeliyor ama metin bloğu
büyüdüğü için 900-1100 px arasında 5. ve 6. slaytta katman çakışması geri
geliyor (ölçüldü). Doğru çözüm tek satırlık değil: ya akış düzeninin eşiği
~1100 px'e çekilmeli (o zaman bu bant zaten stacked düzene düşer), ya da
çakışan slaytların `kaydir` değerleri yeni ölçeğe göre yeniden ayarlanmalı.
İkisi de ayrı bir karar; şimdilik punto olduğu gibi.

**Puntoyu değiştirmenin iki kolu var:**

| İstenen | Yer |
| --- | --- |
| TEK bir slaydın başlığı | `hero.ts` → o slaydın `yazi.punto` alanı (ör. `punto: 42`) |
| TÜM slaytların başlığı | `HeroSlider.astro` → `.yazi__baslik { font-size: calc(var(--punto, 52) * var(--olcek)) }` içindeki **52** |

`punto` da 1920×500 ızgarasının pikselidir, yani ekranla orantılı ölçeklenir:
`punto: 42` her genişlikte "varsayılanın %81'i" demektir. Dar ekran düzeni de
aynı değeri kullanır, oradaki oran sabit (%75'i). Sayı olmayan bir değer
verilirse build durur — yoksa CSS sessizce 52'ye düşerdi.

Bugün yalnız **8. slayt** ezme kullanıyor (`punto: 42`); sitenin en uzun
başlığı, 52'de üç-dört satıra sarıyordu.

> **Punto değiştikten sonra `npm run hero` yeniden çalıştırılmalı.** Punto
> yalnız harf boyunu değil metin bloğunun YÜKSEKLİĞİNİ de değiştirir; blok
> uzayınca alttaki katmanlara girer, kısalınca üsttekilerden uzaklaşır.

### Kritik: yazı kuşağı sabit, katmanlar orantılı

Yazı kuşağı **sabit 1077 px**, katman koordinatları ise 1920×500 ızgarasına
göre **orantılı** ölçekleniyor. Sonuç: ekran daraldıkça yazı, tasarım
ızgarasında giderek daha sağa/sola uzanır.

| Ekran | Sağa hizalı yazının sağ kenarı (tasarım x) |
| --- | --- |
| 1920 px | 1499 |
| 1440 px | 1686 |
| 900 px | 1843 |

Bu yüzden **tek bir genişlikte ölçüm yetmez**; çakışma kontrolü 1920'den
900'e kadar birkaç genişlikte tekrarlanmalı. Sağa hizalı yazının yanındaki sağ
kenar katmanları dar ekranda kaçınılmaz olarak yazının altında kalır — bunun
için katmanlara `darGizle: true` eklenir, katman 1450 px altında gizlenir
(`@container (max-width: 1450px)`, HeroSlider).

**Çakışma ölçümü sınır kutusuyla yapılmaz.** PNG'lerin büyük bölümü saydam
olduğu için sınır kutusu kesişmesi tek başına bir şey söylemiyor; katman
canvas'a çizilip metin satırlarının altına düşen piksellerin alfası sayılmalı
(satır kutuları satır-aralığını da içerdiği için dikeyde ~%16 daraltılarak).

### `npm run hero` — çakışma denetimi

Yöntem betiğe alındı: `scripts/hero-cakisma.mjs` sayfayı Playwright ile açar,
verilen aralıktaki her genişlikte yukarıdaki ölçümü yapar ve hangi slaydın
hangi genişlik bandında çakıştığını yazar. Çakışma varsa çıkış kodu 1.

```bash
npm run build && npm run preview -- --port 4325     # ayrı bir kabukta
npm run hero -- http://localhost:4325/     900 1920 20
npm run hero -- http://localhost:4325/en/  900 1920 20
```

**İki dilde de çalıştırın.** Düzen ortak ama satırlar farklı sarıyor: 8. slaydın
İngilizce başlığı 1720-1920 px arasında el görseline biniyordu, Türkçesi aynı
yerde tertemizdi.

**Dev sunucusunda ölçmeyin.** Astro'nun geliştirme sunucusu bileşen `<style>`
değişikliklerini güvenilir tazelemiyor (bkz. "Bilinen tuzak"); ölçüm eski CSS
üzerinden yapılır ve yanlış sonuç verir. `dist`i sunun.

**KABUL listesi.** Betiğin başındaki `KABUL` dizisi, bilerek bırakılmış
çakışmaları tutar: raporda görünürler ama hata saymazlar (çıkış kodu 0
kalır), böylece her koşuda aynı bilinen durumu bağırıp gerçek yeni
çakışmaları gölgelemezler. Bugün tek kayıt var: 6. slaydın butonu (aşağı
bakın). Listeye eklemeden önce iki soruyu cevaplayın — örtüşen şey NESNE mi
yoksa gölge/dolgu mu, ve başka türlü çözülebiliyor mu.

**Bugünkü durum: 900-1920 px arası, 20 px adımla, iki dilde de KABUL
listesindeki dışında çakışma yok** (ölçüldü 2026-09-10).

### 2026-09-10'da giderilenler

- **1. slayt — makine görseli başlığın altına giriyordu** (1880-1920 px, %28).
  Kök sebep boyut değil VERİ: makine katmanı yeni bir dosyayla değiştirilmiş
  (eski 799×232, yeni 590×318) ama `w: 600, h: 232` olduğu gibi bırakılmıştı.
  Katman yüksekliği CSS'te `height: auto` ile DOSYANIN oranından geldiği için
  görsel 174 px yerine 323 px çıkıyordu — yani "büyümüş" görünmesinin sebebi.
  Düzeltme: `h` gerçek orana çekildi (323), makine ve işçi 160 tasarım px sola
  alındı (x 630→470 ve 480→320). İşçinin `darGizle`si kaldırıldı: artık grubun
  sol ucunda, hiçbir genişlikte yazıya değmiyor.

  > **Aynı hata bir daha sessizce geçmesin diye HeroSlider derlemede
  > doğruluyor:** katmanın `w/h` oranı dosyanın oranından %2'den fazla
  > sapıyorsa build durur ve doğru `h` değerini yazar. Video katmanı hariç —
  > onun yüksekliği bilerek veriden gelir (tabletin ekranına oturmalı).

- **6. slayt — buton delgi tijinin ALTINDA olmalı** (`eylemKonum: 'dip'`,
  y~411-474). Bir ara akışa alınmıştı; orada y~282-340'a düşüp borunun
  ÜSTÜNE çıkıyor, istenen görüntü bozuluyordu.

  Butonun arkasında kalan şey boru değil, borunun **açık gri gölgesi**
  (y405-449). Kurtulmak mümkün değil: boru (y334-376) ile gölge arasında
  29 px var, buton 63 px. Bu yüzden denetim betiğinin KABUL listesinde.

  Butonun yüksekliğini değiştirmek için: `HeroSlider.astro` →
  `.yazi--dip { bottom: calc(26 * var(--olcek)) }`. Büyütmek butonu yukarı,
  küçültmek aşağı taşır. `kaydir.y` bu bloğa UYGULANMAZ (yalnız x) — buton
  bilerek dibe sabit, y'yi ona da uygulamak sabitlemeyi anlamsız kılardı.

- **7. slayt — başlık tabletin üstüne biniyordu** (1480-1640 px, %100).
  1920'de temizdi, o yüzden gözden kaçmıştı. Yazı 60 sola (`kaydir.x` 120→60),
  tablet ve video katmanı 60 sağa (x 1060→1120, 1110→1170) alındı.

- **8. slayt — İngilizce başlık el görseline biniyordu** (1720-1920 px, %98)
  ve Türkçe başlık dört satıra sarıyordu. `punto: 42` (varsayılan 52): başlık
  iki satıra iniyor, blok da yukarıda kalıp el görselinin bandına hiç girmiyor.

  > **El katmanının x/y'si KİLİTLİ, çakışma oradan çözülmez.** Arka planda 14
  > anahtardan oluşan bir sıra var (tasarım y285-343, adım 70 px) ve sırada
  > **bir anahtar eksik: x941-964**. Katmanın mavi düğmesi tam o boşluğa
  > oturuyor (`x: 940` + dosyadaki 4 px = 944) ve sıranın hemen üstünde
  > duruyor — "yukarı kaldırılmış anahtar". Çakışmayı çözmek için katman bir
  > ara x:1140'a alınmıştı; düğme boşluktan çıkıp diğer anahtarların üstüne
  > oturdu ve kompozisyon anlamını yitirdi. Ölçüm dosyadan yapıldı
  > (`kazisiz-altyapi-cozumleri-arkaplan.webp`, arka plan 1920×510 → `cover`
  > ile tasarım y = dosya y − 5).

- **5. slayt — analiz grafiği "MÜHENDİSLİK" üstlüğüne değiyordu.** Piksel
  ölçümü çakışma vermiyordu (aralarında ~10 px vardı) ama gözle bitişik
  duruyordu; grafik y 36→10'a alındı.

Daha önce giderilenler:

- **1. slayt, yalnızca `/en/`'de** (giderildi 2026-09-07): `Horizontal drilling
  specialists` başlığı İngilizcede sarıp makine görselinin bandına giriyordu.
  Sebebi çeviri değil düzen ayrışmasıydı: EN slayt `dikey: 'alt'`, TR aynı
  slayt `dikey: 'orta'` idi. İngilizce metin slaydın içine taşınıp düzen TR'den
  miras alınınca ikisi eşitlendi. Yeniden ölçüldü (880 / 1000 / 1440 px):
  **çakışma yok**, katman altında opak piksel %0.

- **8. slayt** (`deltek-cozum-dugmesi-el.webp`): `dikey: orta` iken başlığın ilk satırı elin
  tuttuğu düğmeye biniyordu → `dikey: ust`.
  > Bu düzeltme önce yalnızca TR'ye uygulanmış, `/en/` bozuk kalmıştı:
  > İngilizce metinler o zaman ayrı bir `EN_YAZI` dizisindeydi ve düzeni de
  > ayrı taşıyordu. Artık düzen tek yerde (aşağıya bakın), bu ayrışma
  > yapısal olarak mümkün değil.
- **5. slayt** (`yatay-sondaj-pipe-analysis.webp`): görselin alt kenarı başlığa
  biniyordu → %30 küçültülüp (437→306) 150 px sola alındı (x 1094→944).
  Görselin `h` alanı yalnızca belgeleme amaçlı; **görsel katmanların yüksekliği
  veriden değil, `w` ve doğal en-boy oranından gelir** (yalnızca video katmanı
  `h`'yi kullanır), o yüzden ikisini orantılı tutun.


**Metin kuşağı.** Slayt yazıları slider'ın kenarına değil, ortalanmış sabit bir
şeride yaslanır: ana menü satırı (`.ust__gez`, TR menüsünde **797px**) iki yanına
**140'ar piksel** eklenerek **1077px**'lik kuşak elde edildi. Sol hizalı slaytlar
kuşağın sol sınırından, sağ hizalı slaytlar sağ sınırından başlar; hiçbir metin
dışarı taşmaz (tüm slaytlarda ölçüldü). Ekran daraldığında kuşak `.kap` iç payına
kadar kısalır, taşma yine olmaz.

`--kusak` değeri `.yazi` içinde **elle yazılı sabittir** — container query içinden
header'ın ölçüsü okunamıyor. **Menü öğeleri değişirse** (`menuSira`/`menuAd` ile
sayfa eklenip çıkarılırsa) `.ust__gez` yeniden ölçülüp `--kusak` güncellenmeli:

```js
document.querySelector('.ust__gez').getBoundingClientRect().width + 280
```

### Katman PNG'lerinde pişmiş beyaz kalıntı (kontrol edildi, sorun değil)

Banner sembollerindeki "pişmiş zemin" kusurunun hero'da da olup olmadığı
kontrol edildi. **Yapısal olarak olamaz**: banner'daki hata, görselin içine
pişmiş gradyanın kutunun CSS zeminiyle yalnız yükseklikler eşitken örtüşmesiydi.
Hero katmanları fotoğrafın üstünde duran saydam PNG'ler — eşleşmesi gereken bir
CSS rengi yok — ve katmanlar da arka plan da aynı container-query ölçeğiyle
(`--olcek`, `object-fit: cover`) birlikte büyüyüp küçülüyor.

Yine de katmanlar siyah zemine bindirilince birkaçında **kırpılmamış beyaz
kalıntı** çıktı: `yatay-sondaj-delgi-tiji-ve-bit.webp` (borunun altında geniş bir beyaz bant),
`yonlendirilebilir-yatay-sondaj-makinesi.webp` (makinenin altında beyaz altlık), `yatay-sondaj-toprak-kesiti.webp`,
`deltek-cozum-dugmesi-el.webp` ve `deltek-robot-engineer.webp` (küçük beyaz lekeler).

Bunlar yerinde **görünmüyor**, çünkü oturdukları alanda arka planın ortalama
parlaklığı 239-255 (neredeyse beyaz):

| Katman | Slayt | Arka plan parlaklığı (ort / en koyu) |
| --- | --- | --- |
| `yatay-sondaj-delgi-tiji-ve-bit.webp` | 4 | 254 / 220 |
| `yatay-sondaj-toprak-kesiti.webp` | 4 | 251 / 202 |
| `yonlendirilebilir-yatay-sondaj-makinesi.webp` | 5 | 246 / 223 |
| `deltek-cozum-dugmesi-el.webp` | 8 | 239 / 198 |
| `deltek-robot-engineer.webp` | 6 | 250 / 193 |

**Risk:** bu slaytlardan birinin arka planı KOYU bir fotoğrafla değiştirilirse
kalıntılar anında görünür hâle gelir. Arka plan değiştirilecekse katmanı önce
siyah zemine bindirip bak (`scripts/` altında betik yok, tek seferlik yapıldı).
Koyu zeminli tek katman `kaya-delgi-video-tablet.webp` (slayt 7, arka plan ort 128) ve onda
matlaşma yok — zaten opak bir tablet.

Ayrıca: slayt 5'teki `yatay-sondaj-pipe-analysis.webp` beyaz zeminde **gri bir
dikdörtgen** olarak duruyor. Bu kesim artığı değil, grafiğin kendi 3B çizim
zemini — yani görselin tasarımı. Değiştirilecekse yeni bir grafik gerekir.

### Slayt butonları

`eylem` yazılan slaytta gerçek bir `<a>` basılır; hedef `eylemHref`, verilmezse
`/iletisim/`. EN slaytlarda `eylemHref: '/en/iletisim/'` açıkça yazılı.

Görünüm `global.css`'teki `.btn--dolu` ile aynı: hover'da koyulaşır, 1 px
yükselir, gölge derinleşir; `:focus-visible`'da sarı çerçeve.

**Gölge İKİ KATMANLI** (`HeroSlider.astro` → `.yazi__eylem`): kısa ve sıkı
bir katman butonun kenarını zeminden ayırıyor, geniş ve yumuşak bir katman
yüksekliği veriyor. Tek katmanla ikisi birden olmuyor — geniş bulanıklık
kenarı tanımlamıyor, dar olan yükseklik hissi vermiyor.

```css
box-shadow: 0  2px  5px -1px rgb(var(--blue-800-rgb) / .30),   /* kenar */
            0 13px 28px -8px rgb(var(--blue-800-rgb) / .60);   /* yükseklik */
```

Üç yerde tanımlı ve üçü de birlikte değişmeli: normal hâl, `:hover`
(daha derin) ve `@media (max-width: 820px)` (daha sığ). Mobil ayrı yazılmak
zorunda çünkü **gölge sabit px, buton ise `--olcek` ile ölçekleniyor**;
aynı gölge küçülen butonun altında orantısız kalıyordu.

Bu buton üç ayrı tuzağın kesiştiği yer — üçü de yaşandı:

1. **Giriş animasyonu `transform` DEĞİL `translate` kullanmalı.** `yazi-gir`
   `animation-fill-mode: both` ile bitiyor; `to { transform: none }` yazsaydı
   animasyon bittikten sonra da `transform`u tutar ve hover'daki
   `translateY(-1px)`i ezerdi. `translate` ayrı bir özellik, çakışmıyor.
2. **Hover arka planı tema seçicisiyle aynı derinlikte yazılmalı.**
   `.yazi--koyu .yazi__eylem` iki sınıflı (0,4,0); tek sınıflı bir
   `.yazi__eylem:hover` (0,3,0) onu yenemez ve renk değişmez. Bu yüzden hover
   arka planı `.yazi--koyu/.yazi--acik` önekiyle yazılıyor.
3. **Ekran dışındaki slaytların butonları klavyeyle odaklanabiliyordu.**
   Slaytlar yan yana durup `translateX` ile kaydırıldığı için pasif slaytlar
   DOM'da ve odaklanabilir kalıyor. `ciz()` artık aktif olmayan slaytlara
   `inert` veriyor (`src/pages/index.astro` ve `en/index.astro`).

**Giriş animasyonu** kademeli: üstlik 0,18 sn → başlık 0,32 sn → gövde satırları
0,48 sn'den itibaren 0,1 sn arayla → buton 0,66 sn. Her parça 0,72 sn'de aşağıdan
yukarı yumuşakça belirir. Animasyon yalnızca aktif slaytta çalışır
(`.slide[data-aktif="true"]`), böylece slayt her göründüğünde baştan oynar.
Otomatik geçiş 8 sn — en geç görsel katman 4000 ms gecikmeli.

### Dar ekran (≤820px): akış düzeni

Slayt mutlak konumu bırakıp **akış düzenine** geçer: yazı üstte, katman
kuşağı altta. Kutunun yüksekliği içerikten gelir (`aspect-ratio: auto`) ve
slaytlar yan yana durduğu için ray'in boyunu **en uzun slayt** belirler,
geçişlerde zıplama olmaz.

> **`.yazi` `relative` ama `inset: auto !important`.** Akış düzeninde `.yazi`
> normalde `static` olurdu; halenin (aşağıda) dayanağı olsun diye `relative`
> yapıldı. Bunun bedeli var: `static` iken yok sayılan masaüstü konum
> kuralları (`.yazi--orta { top: 50% }`, `--ust`, `--alt`, `--dip`) yeniden
> devreye giriyor ve yazıyı akıştaki yerinden kaydırıyor. Ölçüldü: `dikey:
> orta` olan 1 ve 3. slaytta yazı, altındaki makine/danışman görselinin
> üzerine düşüyordu. `inset: auto !important` bunu kesiyor.

**Mobilde slaydı kaplayan perde YOKTUR.** Fotoğraf olduğu gibi görünür;
karartma yalnızca yazının arkasındaki yumuşak kenarlı bir haledir
(`.yazi::before`, eliptik `radial-gradient`, kenarlarda saydama iner).

**Hale slaydın TEMASINA uyar, mobilde metin rengi EZİLMEZ.** Uzun süre mobilde
her slayt beyaz metne zorlanıyordu; sekiz slaydın **beşi açık zeminli** olduğu
için bu, açık fotoğrafların üstüne gereksiz bir koyu blok koymak demekti ve
göz yoruyordu. Artık masaüstündeki tema kuralları (`.yazi--koyu` /
`.yazi--acik`) mobilde de geçerli:

| Tema | Slaytlar | Metin | Hale |
| --- | --- | --- | --- |
| `acik` | 1, 3, 5, 6, 8 | lacivert (masaüstüyle aynı) | **beyaz**, tepe `.86` |
| `koyu` | 2, 4, 7 | beyaz | lacivert, tepe `.72` |

Ölçülen kontrast (metin rengi, halenin alfası kompozit edilerek):

| | En kötü slaytta ort / min |
| --- | --- |
| `acik` slaytlar | 9.39:1 / 4.44:1 |
| `koyu` slaytlar | 5.17:1 / 2.72:1 |

Koyu temada eşik `.72`'de: `.62` iken en kötü slayt (2 — kıyı fotoğrafı, gökyüzü
parlak) **3.75:1** ile AA'nın altına düşüyordu. Açık temada koyu blok tamamen
ortadan kalktığı için hem daha hafif hem daha yüksek kontrast elde edildi.

**Buton gölgesi mobilde küçültülüyor.** `.yazi__eylem`in gölgesi sabit px
(`0 10px 22px`); masaüstünde butona göre ölçülü ama mobilde buton küçüldüğü
için orantısız büyük kalıyor, bu yüzden dar ekranda `0 3px 9px`e iniyor.

Buraya iki denemeden sonra gelindi:

Buraya birkaç denemeden sonra gelindi; hepsi beyaz metin varsayıyordu:

| Yaklaşım | En kötü slaytta min / ort | Fotoğrafın karartılması |
| --- | --- | --- |
| Slaydı kaplayan perde | 3.14:1 / 6.04:1 | kutunun %52'si |
| Yüzdeye bağlı, altta açılan perde | 1.22:1 / 3.58:1 | %37-46 |
| Yazıya bağlı hale, tepe `.84` | 3.85:1 / 7.69:1 | yalnız yazının arkası |
| Yazıya bağlı hale, tepe `.60` | 1.92:1 / 3.40:1 | çok hafif, **AA'nın altı** |

Hepsinin ortak kusuru **beyaz metin dayatmasıydı**: açık fotoğrafın üstünde
beyaz yazıyı okutmak için koyu bir blok şarttı. Temaya uyunca sorun kökten
gitti (yukarı bakın).

Ayrıca **elipsin boyu tepe opaklığı kadar belirleyici**: `.84` sürümünde elips
120%×104%'tü, yazının epeyce ötesine taşıp slaydın üstünde bir **bant** gibi
okunuyordu. Bugün 108%×96%, hale metne yakın duruyor.

Ortadaki yaklaşım hem fotoğrafı hem kontrastı bozdu, çünkü karartmayı kutunun
yüzdesine bağlıyordu; oysa **yazı yüksekliği slayta göre 96-262 px arası
değişiyor** (kutu 376 px), yani "yazı bandı" diye sabit bir yüzde yok — uzun
yazılı slaytta metin solma noktasının altına taşıyordu. Hale yazıyla birlikte
büyüyüp küçüldüğü için bu sorun yapısal olarak ortadan kalkıyor.

Kontrast, arka plan görselinin pikselleri örneklenip halenin alfası
kompozit edilerek ölçüldü (sekiz slayt, beyaz metin). Metnin ayrıca dar bir
gölgesi var (`text-shadow`); WCAG bunu saymadığı için yukarıdaki sayılara
dahil değil, gerçek okunurluğa katkısı sayıların üstünde.

**Neden 1920×500 kompozisyonu telefona taşınamıyor** (ölçüldü, 375 px):
katman koordinatları o ızgaraya bağlı ve ekranla orantılı ölçekleniyor, 375
px'de ölçek **0.195**'e düşüyor. Gizleme kuralı kaldırılıp katmanlar olduğu
gibi bırakıldığında sonuç şu:

| Katman | Mobilde | Sonuç |
| --- | --- | --- |
| proje danışmanı | 60×88 | tanınmaz |
| robot mühendis | 96×99 @ **y823** | 281 px'lik kutunun dışında |
| boru analizi | 60×36 @ **x586** | 375 px'lik kutunun dışında |
| sondaj makinesi | 117×63 | yazının altına biniyor |

Üstelik 1920/500 oranı korunsaydı slider 375×98 px olurdu; oysa yalnız yazı
bloğu 193 px. Yani yazı ile katmanlar aynı kutuya sığmıyor — mesele eksik bir
kural değil, geometri.

### Katman kuşağı: arka plan ve katmanlar TEK ızgarada

Mobilde fotoğraf slaydın tamamını kaplamaz. Slayt ikiye ayrılır: **yazı** düz
bir zeminde üstte, **kompozisyon kuşağı** altta. Kuşağın içinde arka plan ve
katmanlar **aynı 1920×500 ızgarada** durur (`.mkat__ic`), dolayısıyla tek
ölçekle büyüyüp küçülürler — masaüstündeki geometri birebir korunur. `.mkat`
o ızgaraya açılmış penceredir; ızgara telefondan geniş kalır, kenarları
kırpılır.

**Kusur buradaydı ve iki turda ortaya çıktı:**

1. Önce her slayttan bir "ana nesne" seçilip büyütülüyordu, sonra ikincisi de
   eklenip yan yana diziliyordu. Katmanlar **tek tek** ölçeklendiği için
   birbirlerine göre oranları bozuluyordu: delgi tiji masaüstünde toprak
   adasından ~5 kat uzun, ikisi de "bir nesne" boyuna indirilince tij ada
   kadar kısa bir çubuğa dönüyordu.
2. Sonra katmanlar tek parça ölçeklendi, ama **arka plan hâlâ slaydın
   tamamını `cover` ile kaplıyordu**. Ölçüldü: arka plan her slaytta 0.857
   px/tasarım px iken katmanlar 0.23–0.62 arasındaydı, yani katmanlar arka
   plana göre **0.26x–0.73x** kalıyordu. Proje danışmanı slaydında kadın
   figürü arkasındaki ofis fotoğrafına göre iki kat büyük duruyordu.

Arka plan da ızgaranın içine alınınca oran **sekiz slaytta da 1.00x** oldu
(ölçüldü). Bunun bedeli: fotoğraf artık yazının arkasında değil, yalnız
kuşakta.

**Ölçek ve odak `mkatStil`de hesaplanır, elle verilmez.** Ölçek, kuşak
yüksekliği tavanına (`min(56cqw, 250px) / 500`) takılana kadar katman
grubunun tamamı pencereye sığacak şekilde seçilir (`94cqw / grup genişliği`).
Yatay odak, grubun orta noktasıdır. Arka plan ve katmanlar aynı ızgarada
olduğu için ölçeği slayda göre seçmek aralarındaki ilişkiyi bozmaz — yalnızca
kompozisyona ne kadar yakından bakıldığını değiştirir.

| Slayt | Kuşak (375 px) | Katman |
| --- | --- | --- |
| 1 | 210 px | işçi + makine |
| 2, 4 | 210 px | — |
| 3 | 210 px | proje danışmanı |
| 5 | 179 px | robot mühendis + boru analizi |
| 6 | 120 px | delgi tiji + toprak adası |
| 7 | 210 px | tablet + video |
| 8 | 210 px | çözüm düğmesi el |

6. slayt daha kısa, çünkü delgi tiji 1530 px geniş: grubun tamamı sığsın diye
ölçek küçülüyor.

**Yazı kartı olabildiğince kısa.** Hero telefonda ekranın yarısını geçmesin,
fotoğraf kuşağına yer kalsın diye mobilde tipografi ayrıca sıkıştırılıyor:
başlık 52 → **39** tasarım px (`line-height` 1.06), üstlük 17 → 14, buton
küçültüldü, yatay iç pay %6 → **%4**, üst dolgu 34 → 16, boşluk 18 → 8.
En uzun başlık (4. slayt) böylece 4 satırdan 3 satıra iniyor. Kutu **504 →
393 px**, en uzun yazı kartı **293 → 168 px** (375 px'te ölçüldü).

> **Gövde metni 21 tasarım px'te bırakıldı** (375 px'te 12,7 px). Ortak
> `--olcek`i küçültmek başlıkla birlikte gövdeyi de küçültüyordu; onun yerine
> yalnız başlık ve boşluklar kısıldı. 12 px'in altına inmek okunurluğu bozar.

**Yazı düz zeminde, perde/hale YOK.** Fotoğraf yazının arkasında olmadığı için
karartmaya gerek kalmıyor — kontrast tam, `text-shadow` da gereksiz. Zemin
slaydın temasından geliyor (`.slide--acik` / `.slide--koyu`), metin renkleri
masaüstündekiyle aynı. Bu, "üstteki koyu bant göz yoruyor" şikâyetini kökten
bitirdi; daha önce hale opaklığıyla oynanmış ama sorun oydu değil, fotoğrafın
metnin arkasında olmasıydı.

**`darGizle` katmanları mobilde görünür** (saha işçisi böyle geri geldi). O
gizleme, sabit genişlikteki yazı kuşağının katmanlara binmesine karşıydı;
akış düzeninde yazı ayrı bir alanda olduğu için gerekçesi kalmıyor.

**Video mobilde de açık.** Geometri birebir olduğu için iframe tam tabletin
ekranına oturuyor. Kapatılırsa tabletin ekranı boş koyu bir dikdörtgen kalır.
**Bedeli:** hero'ya her telefon ziyaretinde YouTube oynatıcısı iner; kapatmak
gerekirse mobil bloktaki `.kat__video`ya `display: none` yeter.

> **Sarmallar masaüstünde kutu üretmez.** `.mkat` ve `.mkat__ic` orada
> `display: contents`; arka plan ve katmanlar eskisi gibi doğrudan `.slide`e
> göre yerleşir. Doğrulandı (1280 px): ikisinin de hesaplanan `display`
> değeri `contents`, arka plan slaydı tam kaplıyor, oran hâlâ 3.84.

**Mobil ölçek 520 px'te tavan yapar** (`--olcek-m: calc(min(100cqw, 520px) /
620)`). Tavansızken 820 px'lik tablette yazı 1,3 kat büyüyüp kutuyu
**805×866**'ya çıkarıyordu — ekranın dörtte üçü. Tavanla 805×508. Telefonları
etkilemez: 375 px'de ölçek yine 0,605.

Doğrulandı (360 / 375 / 820 px, iki dilde, sekiz slayt): taşma yok, yazı ile
katman kuşağı çakışmıyor, kuşak slaytın dışına sarkmıyor. Masaüstü değişmedi —
1280 px'te oran hâlâ 3.84, tek metin-katman çakışması aşağıda "kabul edilen
durum" diye kayıtlı tij gölge şeridi.

> Canlı sitedeki 7. slaydın (bizde 3. slayt) `deltek-proje-danismani.webp` katmanı sunucuda **404** veriyor —
> orijinali (309×451, saydam PNG) web arşivinin 2025-04-01 anlık görüntüsünden
> alınıp depoya kondu.
> `HERO_EN` metinleri Türkçe orijinallerin çevirisidir, Deltek onayından geçmedi.

**Bölüm başlıkları** mavi ve altlarında mavi+sarı kısa çizgi var
(`.hero__bilgi h1::after`, `.kanit__bas h2::after`, `.bolum-bas::after`).

Canlı siteden bilinçli olarak sapılanlar: gövde metni 13px yerine ~15px
(okunabilirlik), kart/gölge dili 2015 temasından daha modern bırakıldı.

## SEO

Site içi SEO 2026-09-06'da baştan sona elden geçirildi; `npm run seo` iki dilde
72 sayfada **100/100** veriyor (denetim ölçütleri betiğin başında). Sıralama
tarafında kalan işler (Search Console, Business Profile, backlink, içerik
takvimi) `SEO-REHBER.md`'de.

### 2026-09-11 turu: teknik katman

İlk tur (2026-09-06) sayfa içi SEO'ydu; bu tur denetimin ölçmediği teknik
katman. Hepsi `npm run build` ile kendiliğinden üretilir, elle bakım gerekmez.

| Ne | Nerede | Not |
| --- | --- | --- |
| Sitemap `lastmod` | `scripts/seo-integration.mjs` | Kaynak markdown'ın **son git commit tarihi**; blog'da `guncelleme` daha yeniyse o. Liste sayfaları altındaki en yeniyi alır. **Cloudflare shallow klonladığı için tarihler yerelde hesaplanıp `src/data/icerik-tarihleri.json`a yazılır ve commit'lenir** — aşağıya bakın. |
| RSS | aynı | `/rss.xml`, `/en/rss.xml` — `<link rel="alternate">` head'de. `@astrojs/rss` kurulmadan üretiliyor. |
| `llms.txt` | aynı | Sayfa+özet dizini. Google "gerekmiyor" diyor; maliyeti sıfır, diğer yapay zekâ tarayıcıları için. |
| Dış bağlantı `rel="noopener noreferrer" target="_blank"` | aynı | Markdown'dan gelen `<a>`ler bunları taşımıyordu. |
| Yazı tipleri kendi sunucudan | `scripts/font-indir.mjs` → `public/fonts/`, `src/styles/fonts.css` | Google Fonts'un iki üçüncü taraf bağlantısı ve CSS isteği kalktı; gövde fontu `preload`. 6 dosya / 243 KB (latin + latin-ext). Font değişecekse betikteki URL'yi değiştirip `npm run fontlar`. |
| `_headers` | `public/_headers` | nosniff, SAMEORIGIN, Referrer-Policy, Permissions-Policy, HSTS `max-age=31536000; includeSubDomains` (eski WordPress sunucusu da gönderiyordu, düşürmek gerileme olurdu; `preload` yok — alan adı listede değil). `/_astro/*` ve `/fonts/*` `immutable`, `/images/*` 30 gün, `/admin/*` `X-Robots-Tag: noindex`. |
| IndexNow | `scripts/indexnow.mjs`, `public/<anahtar>.txt` | `npm run indexnow` sitemap'teki tüm URL'leri Bing/Yandex'e (ve Bing dizinini kullanan ChatGPT/Copilot'a) bildirir. Google katılmıyor. Yayına aldıktan sonra ve her içerik değişikliğinde çalıştırılır. |
| apple-touch-icon + manifest | `scripts/ikon-uret.mjs` → `public/apple-touch-icon.png`, `icon-192/512.png`, `manifest.webmanifest` | Logo beyaz kare zemine ortalanır. favicon.svg'nin "D"si kullanılmadı: librsvg Windows'ta Open Sans'ı bulamıyor. |
| Skip link, `<main id="icerik">`, `<nav aria-label>` | `Layout.astro` | Erişilebilirlik; Lighthouse'a girer. |

**Yapısal veri eklenenler** (`[slug].astro`, TR ve EN aynı):

* **Service** — dört ana hizmet sayfası + `/hizmetlerimiz/` (`HIZMET_SAYFALARI`). Teknik açıklama sayfaları (tij, çamur, yer belirleme…) hizmet değil, onlara basılmaz.
* **LocalBusiness** (+`GeneralContractor`) — `/iletisim/`de ofis başına, `parentOrganization` → Organization. Google'ın çok şubeli önerisi: Organization site geneli, şube kendi sayfasında. `OFISLER`de `enlem/boylam` ve `calismaSaatleri` dolarsa `geo` ve `openingHoursSpecification` de basılır (şu an boş — kullanıcı dolduracak).
* **FAQPage** — gövdede "Sık sorulan sorular" / "Frequently asked questions" başlığı altındaki `**Soru?** Cevap` paragraflarından `sssCikar()` üretir. Başka yerde soru aramaz. Şu an yalnız `/iletisim/`de içerik var; **başka sayfaya SSS eklemek için aynı biçimde yazmak yeter**, şema kendiliğinden gelir. Google FAQ zengin sonucunu 2023'ten beri yalnız resmi/sağlık sitelerine gösteriyor; şema yine de soru-cevap yapısını yapay zekâ özetlerine açıkça anlatıyor.
* **og:type=article** + `article:published_time/modified_time/section` blog yazılarında (Layout `tur`, `yayin`, `guncelleme` prop'ları). Önceden 24 yazının hepsi `website`ti.
* Organization `logo` ölçüsü 200×46 → **300×73** (dosyanın gerçek ölçüsü; yanlıştı).

**Başlık hiyerarşisi** — her sayfada seviye atlaması vardı, denetim ölçmüyordu:

* Footer sütun etiketleri `<h5>` idi → `<p class="alt__bas">` (her sayfada h2→h5).
* `UrunDuzen` blok başlıkları h3/h4 → **h2/h3** (ürün sayfalarında h1→h3). Bileşenin kendi yorumu "h1 > h3 > h4 korunur" diyordu; yanlıştı.
* Ana sayfa kanıt kartları h4 → h3; blog listesi kart başlıkları h3 → h2; `hakkimizda.md` üst bölümleri `###` → `##`.
* Denetim betiği artık **başlık atlamasını, blog yazısında og:type'ı ve sitemap lastmod'u** puanlıyor.

**Bilerek yapılmayanlar:**

* ~~İngilizce URL'ler~~ — **aynı gün yapıldı**, bkz. "URL / slug kuralı → İngilizce adresler".
* **CSP başlığı** — YouTube/Vimeo gömüleri ve inline script'ler yüzünden dar bir politika siteyi kırar; `_headers`e konmadı.
* **HSTS preload** — alan adı hstspreload.org listesinde değil ("unknown"); listeye girmek geri dönüşü aylar süren bir taahhüt, ayrıca karar verilir.
* `andersonug.com` bağlantısı **http kaldı**: https 525 (TLS el sıkışması) veriyor. Miami bağlantısı https'e çevrildi (200, ama hedef sayfa genel bir partner sayfasına yönlendiriyor; içerik yok olmuş, bağlantı yine de kırık değil).
* Kaya delgi video yazısı tarihsizdi (aslı "Medyalar" sayfasıydı); Vimeo oEmbed `upload_date` ile **2015-12-17** verildi — VideoObject `uploadDate` ve RSS için gerekiyordu.

### Frontmatter alanları (her iki koleksiyon, CMS'te de var)

| Alan | Ne yapar | Kural |
| --- | --- | --- |
| `seoBaslik` | `<title>`, og:title, JSON-LD adı; `<h1>` kısa/uzun/büyük harfli olduğunda | ≤56 karakter (sonuna " — Deltek" ekleniyor, toplam ≤65) |
| `ozet` | `<meta description>`, og:description, kart özetleri, WebPage/BlogPosting açıklaması | **70–160 karakter**, anahtar kelimeyle başlasın |
| `anahtarKelimeler` | `<meta keywords>` + BlogPosting.keywords; boşsa `CEVIRI[dil].seo.anahtar` | virgülle |
| `kapakAlt` | kapak görselinin alt'ı (blog kartları, sayfa kapağı, og:image:alt) | boşsa başlık |
| `bannerAlt` | `SayfaBanner` sembolü ya da düz `banner` görseli alt'ı | boşsa "<başlık> — Deltek … illüstrasyonu" |
| `bloklar[].alt` | blok görselinin alt'ı | boşsa blok başlığı, o da yoksa sayfa başlığı |
| `gorselAlt`, `neden.gorselAlt`, `galeri[].alt` | iletişim görseli, hizmet görseli, galeri | |
| `ilgili` | sayfa altında "İlgili sayfalar" bloğu (`IlgiliSayfalar.astro`) | slug listesi; olmayan slug atlanır |
| `guncelleme` | BlogPosting/WebPage `dateModified` | boşsa `tarih` |
| `video` | YouTube **veya Vimeo** bağlantısı → gömü + `VideoObject` şeması | |

**Hiçbir `<img>` alt'sız çıkmaz**: dekoratif olanlar (hero katmanları, tecrübe
bandı logosu, logo şeridinin 2-4. kopyaları) `alt="" aria-hidden="true"`; geri
kalanı yukarıdaki zincirden bir metin alır. Denetim betiği dekoratif işaretsiz
boş alt'ı hata sayar.

### Yapısal veri (JSON-LD)

`Layout.astro` her sayfada **Organization** (`@id …/#organization`: iki ofis
adresi, contactPoint, areaServed, knowsAbout, `SITE.sosyal` → sameAs) basar;
ana sayfalarda ek **WebSite**. `[slug].astro` sayfaya göre **WebPage** ya da
**BlogPosting** (author/publisher → Organization), her sayfada
**BreadcrumbList** (Ana sayfa › Teknoloji › [üst dal] › sayfa / Ana sayfa ›
Blog › yazı), video varsa **VideoObject**. Ana sayfa `ItemList` içinde dört
**Service**; blog listesi **Blog**. `sema` prop'u nesne dizisi alabilir.
Doğrulama: `dist/` içindeki tüm `ld+json` blokları build sonrası JSON.parse ile
kontrol edildi (144 blok, 0 hata); Google Rich Results Test'te de bakılmalı.

### Görsel klasörleri ve adları (2026-09-11)

| Klasör | Ne var | Kim yazar |
| --- | --- | --- |
| `images/icerik/` | sayfa görselleri (42), **alt metninden türetilmiş açıklayıcı adlar** | CMS `media_folder` (sayfalar) |
| `images/blog/` | blog görselleri (9) | CMS blog koleksiyonu `media_folder` |
| `images/hero/`, `banner/`, `referans/`, `iletisim/` | önceden düzenliydi | elle |
| `images/uploads/YYYY/MM/` | **yalnız eski WordPress orijinalleri** (74 JPEG/PNG/GIF) — `/wp-content/uploads/*` 301'inin hedefi; site hiçbir sayfada buraya bağlanmaz | dokunulmaz |

`uploads/` altındaki `018.webp`, `haberler3.webp` gibi anlamsız adlı WebP'ler
`icerik/`/`blog/` altına **alt metinlerinden üretilen** adlarla taşındı
(`018.webp` → `genisletme-basliginin-hafriyati-sondaj-camuruyla.webp`). Ad
kuralı: alt'ın ana ifadesi (" — " / ": " öncesi), en çok 6 kelime / 50
karakter, sondaki bağlaçlar atılır; 3 kelimeden kısa kalırsa alt'ın tamamı.
Google görsel araması dosya adını da okur; alt zaten vardı, ad artık onunla
tutarlı.

**Orijinaller silinmedi ve taşınmadı.** Canlı sitede indekslenmiş
`/wp-content/uploads/2015/08/018.jpg` adresi 301 ile `/images/uploads/2015/08/018.jpg`'ye
gidiyor; o dosya yerinde. Yalnız `.webp` kopyalar taşındı (hiç yayında
olmadılar). Bilerek JPEG bırakılan iki dosya (`6.jpg`,
`kazisiz-boru-yenileme-3.jpg`) hem yönlendirme hedefi hem sayfada kullanılıyor
diye **kopyalandı**, taşınmadı.

`scripts/referans-logo-kirp.mjs` ve `banner-sembol-kes.mjs` hâlâ
`uploads/` orijinallerini okur (kaynak olarak) — doğru, onlar orada.

### Görseller WebP (2026-09-07)

Sitedeki **tüm kullanılan görseller** WebP'ye çevrildi. Betik:
`scripts/gorsel-webp.mjs` (`npm run webp`).

| Küme | Önce | Sonra | Kazanç |
| --- | --- | --- | --- |
| `public/images/hero/` (8 arka plan + 9 katman) | 2710 KB | 978 KB | %64 |
| `public/images/uploads/` (48 dosya) | 9050 KB | 2815 KB | %69 |
| `src/assets/banner/` (13 sembol) | 309 KB | 171 KB | %45 |

Sayfa başına indirilen görsel ağırlığı:

| Sayfa | Önce | Sonra |
| --- | --- | --- |
| `/yatay-sondaj-camuru/` | 760 KB | 174 KB |
| `/boru-surmecakma/` | 1081 KB | 216 KB |
| `/delgi-tijleri/` | 738 KB | 159 KB |
| `/hizmetlerimiz/` | 714 KB | 333 KB |

Hero, ana sayfanın ilk ekranı olduğu için LCP'yi doğrudan etkiliyor; teknoloji
sayfalarında ise LCP öğesi **banner sembolü** (`fetchpriority="high"`), o da
artık WebP.

* **Ölçü değişmedi, yalnız biçim.** Arka planlar `object-fit: cover` ile
  basılıyor ve slider dar ekranda `4/3` oranına geçiyor; kaynağı 1920×500'e
  kırpmak masaüstünde işe yarar, mobilde görselin yanlarını kırpardı.
* **Kalite fotoğraflarda q78, saydam katmanlarda q86 + `alphaQuality: 100`.**
  Katmanlar fotoğraf üstüne binen kesim görselleri; alfa kenarı bozulursa hale
  yapar. Kazanç %10'un altında kalırsa betik q72'yi dener, o da yetmezse dosyayı
  atlar — hiçbir görsel dönüşümle ağırlaşmaz.
* **Ölçülen görünen fark** (kaynak ile çıktı aynı gri zemine düzleştirilip
  karşılaştırılır) her dosyada ortalama **≤3.3/255**, yani ayırt edilemez.
  Düzleştirmeden ölçmek saydam bölgedeki görünmez RGB farkları yüzünden 255'e
  varan sahte değerler veriyordu — ölçüm bu yüzden düzleştirerek yapılıyor.
* JPEG yedeği (`<picture>`) konulmadı — WebP desteği %97'nin üzerinde ve
  sitede zaten yedeksiz WebP kullanılıyordu (`deltek_hdd_1.webp`).
* **hero ve banner** kaynakları silindi (git geçmişinde duruyorlar).
  **`uploads/` kaynakları YERİNDE BIRAKILDI** — nedeni aşağıda.
* Hiç kullanılmayan iki dosya çevrilmedi: `deltek-yatay-sondaj-marka.jpg`,
  `katman/machinery1_org.png` (betikteki `ATLA` listesi).
* **İki dosya bilerek JPEG kaldı:** `uploads/2015/08/6.jpg` ve
  `uploads/2015/08/kazisiz-boru-yenileme-3.jpg`. Zaten iyi sıkıştırılmışlar;
  WebP hiçbir kalitede %10 kazanç veremiyor, q78'de büyüyorlar bile. Betik
  bunları kendiliğinden atlıyor, referansları `.jpg` kaldı. Karışık
  `.webp`/`.jpg` bir sitede sorun değil.

### uploads: kaynaklar neden silinmedi, `/wp-content/` yönlendirmesi

`public/images/uploads/` altındaki adresler **hiç yayında olmadı**. Taşıma
betiği (`scripts/wp-tasi.mjs`) canlı sitedeki `wp-content/uploads/<yol>`
görsellerini `/images/uploads/<yol>` altına indiriyor — yani indekslenmiş
gerçek adres `/wp-content/...`, sitedeki adres `/images/uploads/...`.
Yönlendirme olmadığı için o adresler **404 veriyordu**.

Bu yüzden iki iş birlikte yapıldı:

1. `public/_redirects` içine `/wp-content/uploads/* → /images/uploads/:splat 301`
   eklendi. Google Görseller'de duran eski adresler yeniden çalışıyor.
2. Kaynak JPEG/PNG'ler **silinmedi**: yönlendirmenin hedefi onlar. Ziyaretçi
   yalnız `.webp` indiriyor (sayfalar ona bağlanıyor), `.jpg` yalnız eski
   adresten gelen isteği karşılıyor. Yayına giden çıktı ~9 MB büyüyor,
   ziyaretçiye maliyeti sıfır.

> `--kullanilan` bayrağı **tek seferliktir**: referanslar `.webp`'ye
> çevrildikten sonra kaynak `.jpg`'ler artık "bağlı" görünmez ve bayrak her
> şeyi eler. Sonradan tek dosya çevirmek gerekirse `--klasor` ile o klasörü
> verin.

### GIF: karar biçime göre değil içeriğe göre

`uploads/2015/09/Kazisiz_Teknoloji_Resim8_Auger_Boring.gif` önce "GIF =
çizim" varsayılıp kayıpsız çevrildi (175 KB, %17). Ölçünce yanlış çıktı:
168 renk ama komşu piksel farkı **16.92** — yani GIF'e kaydedilmiş, dithering
ile renk indirgenmiş bir **saha fotoğrafı**. Kayıpsız, dithering gürültüsünü
de kodlamak zorunda kaldığı için şişiyordu. Kayıplı q78 88 KB veriyor ve iki
sürüm yan yana konup bakıldığında ayırt edilemiyor.

Betikteki kural bu yüzden `dokuOlcusu()` ile içeriğe bakıyor: doku < 8 ise
düz alanlı çizimdir (kayıpsız kazanır), değilse fotoğraf gibi işlenir.

> **`gorselOlcu.ts` artık WebP okuyor.** Okumasaydı hero `<img>`lerine
> width/height basılmaz, sayfa yüklenirken oynardı. Aynı sebeple ana sayfadaki
> tecrübe bandının ölçüsü de artık dosyadan geliyor (önceden elle yazılan
> 1920×790 yedeğine düşüyordu).

### width/height (CLS)

Frontmatter'dan basılan görseller `gorselOznitelik()` ile, markdown
gövdesindekiler ve gözden kaçanlar build sonrası
`scripts/gorsel-olcu-integration.mjs` ile `width`/`height` alır. Remark
eklentisi kullanılamadı: Astro 7'nin varsayılan Markdown işlemcisi
`markdown.remarkPlugins`'i `@astrojs/markdown-remark` kurulmadan kabul etmiyor.
Aynı entegrasyon `dist/en/404/index.html`'i Cloudflare'in beklediği
`dist/en/404.html`'e taşır.

### Head

`robots: index, follow, max-image-preview:large…`; `og:image:alt`,
`og:image:width/height` (yalnız varsayılan 1200×630 görselde), `og:locale:alternate`,
`twitter:image:alt`, `geo.*`, `apple-touch-icon`, `manifest`, RSS `alternate`.
Yazı tipleri 2026-09-11'den beri **kendi sunucudan** (`/fonts/`, gövde fontu
`preload`); Google Fonts bağlantısı yok.

### Denetim betiği

`scripts/seo-denetim.mjs` `dist/` HTML'lerini tarar; title (30–65),
description (70–160), tek h1, canonical, hreflang, lang, alt, width/height,
kelime (≥300), JSON-LD, OG, iç bağlantı (≥3), mükerrer title/description,
**yetim sayfa** (hiçbir sayfadan bağlantı yok) ve sitemap'te bulunmayı puanlar.
Bir sayfa düşük çıkarsa `--ayrinti` bulguları listeler. Harici servislere
(PageSpeed, Search Console) bakmaz; onlar SEO-REHBER.md'de.

## Deploy hedefi: Cloudflare Pages

- Build: `npm run build` · Çıktı: `dist` · Node **`.node-version` dosyasından** (22.12.0)
- Statik çıktı; adapter/SSR **yok**. SSR gerekirse `@astrojs/cloudflare` adapter'ı
  ayrı bir karar.
- 301'ler `public/_redirects`, özel başlıklar `public/_headers`.
- Depo: `github.com/yalibuk/deltek`, dal `main`.

### Cloudflare Pages'in SHALLOW KLONU (2026-09-11)

Pages depoyu **shallow** klonluyor (`git rev-parse --is-shallow-repository` →
`true`, ölçüldü). Orada `git log -1 -- <dosya>`, dosya o commit'te
değişmemiş olsa bile **HEAD commit'inin** tarihini döndürüyor. Yani sitemap'teki
bütün `lastmod` değerleri son deploy tarihi olur; Google tutarsız lastmod'u yok
sayar ve özellik işe yaramaz hâle gelir.

> Bugün fark görünmüyor: tüm içerik tek commit'te (`dbb0ac3`) değiştiği için
> tam klon da tek tarih veriyor. Kusur **ilk içerik güncellemesinde** ortaya
> çıkardı — o yüzden şimdi kapatıldı.

Çözüm `scripts/seo-integration.mjs` içinde:

* Tam geçmiş varsa (yerel build) tarihler git'ten hesaplanır **ve**
  `src/data/icerik-tarihleri.json`a yazılır. Dosya değişmişse build günlüğü
  "COMMIT EDİN" der.
* Shallow ise (Cloudflare) o dosya okunur.
* İkisi de yoksa dosya mtime'ına düşer ve build günlüğüne uyarı basar.

> **Yani `icerik-tarihleri.json` depoya commit'lenmek ZORUNDA.**

**CMS'ten yapılan değişiklikler bu dosyayı güncellemez** — Sveltia doğrudan
GitHub'a commit atıyor, yerel build çalışmıyor. O yüzden CMS'te içerik
düzenleyen kişi **"Son güncelleme" alanını** (`guncelleme`) doldurmalı: kod
onu git/JSON tarihinden daha yeniyse tercih ediyor, yani lastmod doğru kalıyor.
Aynı alan JSON-LD `dateModified`'a da gidiyor.

### Apex → www: YÖNLENDİRMEYİ CLOUDFLARE'DE KURUN

`deltek.com.tr` → `www.deltek.com.tr` 301'ini bugün **eski Plesk sunucusu**
yapıyor (301 yanıtında `x-powered-by: PHP/5.6.40, PleskLin` başlıkları var).
DNS Pages'e çevrildiğinde o sunucu devreden çıkar ve **yönlendirme kaybolur**.
Cloudflare'de bir Redirect Rule kurulmadan geçiş yapılmamalı: apex adresi
ya çalışmaz ya da www ile ikiz içerik üretir.

Alan adı zaten Cloudflare'de (NS: `harley`/`rosalyn.ns.cloudflare.com`), yani
nameserver değişikliği gerekmiyor — yalnız DNS kaydı ve kural.

## Bilinen tuzak

İçerik koleksiyonu **`<proje>/.astro/data-store.json`**'da önbelleklenir
(`node_modules/.astro` DEĞİL — orayı silmek yetmez, bu tuzağa bir kez daha
düşüldü). Bir markdown dosyasını silmek ya da frontmatter'a yeni bir alan
eklemek tek başına yeterli değil: silinen sayfa çıktıda görünmeye, şemaya yeni
eklenen alan ise `undefined` gelmeye devam eder. Dev sunucusu ile `astro build`
farklı sonuç veriyorsa **ilk şüpheli budur**. Yerelde:

```bash
rm -rf node_modules/.astro .astro dist && npm run build
```

Cloudflare Pages'te `node_modules` her build'de sıfırdan kurulduğu için orada sorun olmaz.

**Dev sunucusu bileşen `<style>` ve `<script>` değişikliklerini güvenilir
şekilde tazelemiyor.** Bir bileşenin CSS'ini değiştirdikten sonra tarayıcıda
ESKİ kural yürürlükte kalabiliyor; silinmiş bir CSS değişkenine referans veren
eski kural yüzünden bir kez zemin tamamen kaybolmuş gibi göründü, bir kez de
flex yönü eski hâlinde kaldı. `astro build` çıktısı her seferinde doğruydu.
Tarayıcıda gördüğün ile `dist/` çıktısı çelişiyorsa **önce dist'e bak**, sonra:

```bash
rm -rf .astro node_modules/.astro node_modules/.vite && npm run build
```

ve dev sunucusunu yeniden başlat. Bu oturumda üç kez gerekti.

**Headless Chrome dar ekranı YALAN söylüyor.** Bu makinede
`chrome --headless --window-size=390,H --screenshot` çıktısı 390 piksel
genişliğinde ama sayfa **~474 piksellik bir yerleşim genişliğinde** render
edilip 390'a KIRPILIYOR. Sonuç: içerik sağ kenardan taşıyormuş gibi görünür,
metin kelime ortasından kesilir. 480 ve 500 için istenen genişlikler de aynı
sağ kenarı (x=456) veriyor — yani ~474'ün altındaki her istek kırpma demek.
Dar ekran doğrulaması için **Browser panelini** kullan (gerçek viewport
öykünmesi yapar) ve kararı DOM ölçümüne dayandır:
`document.documentElement.scrollWidth` ile taşan elemanları listele.

## Yapılacaklar

- [x] 10 blog yazısı canlı siteden taşındı (içerik + 9 görsel, slug'lar birebir)
- [x] Blog yazılarının İngilizce çevirileri (`src/content/blog/en/<slug>.md`) — 11 yazı
      (çeviri; Deltek onayı bekliyor)
- [x] Boremak ürün sayfası şablonu geri alındı → `src/components/UrunDuzen.astro`
- [x] Görsel akışlı 14 teknoloji/hizmet sayfası ürün şablonuna geçirildi
- [x] Statik + teknoloji/hizmet sayfaları taşındı (28 sayfa)
- [x] `/iletisim/` sayfası form olmadan yeniden tasarlandı (`duzen: iletisim`) —
      telefon/e-posta kartları, ofis kartları, harita, kapanış çağrısı
- [ ] İletişim formu istenirse: statik sitede arka uç servisi gerekir
      (Cloudflare Pages Functions, Formspree vb.) — ayrı karar
- [x] Sayfaların İngilizce çevirileri — 22 sayfa (çeviri; Deltek onayı bekliyor).
      EN menüsü, Teknoloji açılır menüsü, yan menü ve harita TR ile aynı.
- [ ] **EN metinlerin Deltek tarafından doğrulanması** (sayfalar, yazılar, hero, ana sayfa)
- [x] SEO: title/description/keywords, alt metinleri, JSON-LD, breadcrumb, iç bağlantı,
      404 sayfaları, CLS için width/height — bkz. "SEO" bölümü. `npm run seo` → 100/100.
- [ ] `src/data/site.ts` → `sosyal` (LinkedIn/YouTube/Instagram adresleri) — JSON-LD sameAs
- [ ] Google Search Console + Business Profile — bkz. SEO-REHBER.md
- [x] Görsel tasarım canlı siteye yaklaştırıldı (palet, tipografi, header, logo)
- [ ] `src/data/site.ts` — WhatsApp numarası (diğer iletişim bilgileri canlı siteden alındı)
- [ ] Hero slaytlarının **İngilizce başlıkları çeviri**, Deltek onayından geçmedi
      (`src/pages/en/index.astro`)
- [x] Ana sayfa hero başlığı, tanıtım metni ve hakkımızda kartları dolduruldu —
      metinler `hakkimizda.md` + `hizmetlerimiz.md` içeriğinden türetildi (4E kuralı,
      Smart Undergrounding, 250/800 ton kapasite, 2–2000 mm çap, İstanbul/İzmir).
      **EN karşılıkları çeviridir, Deltek onayından geçmedi.**
- [x] Ana sayfa meta açıklaması yazıldı (TR 154 / EN 147 karakter). Tek alan üç yere
      gidiyor: `<meta name="description">`, `og:`/`twitter:description` ve JSON-LD
      `Organization.description` — bu yüzden sayfayı değil şirketi anlatmalı.
- [x] Ana sayfa `<title>` marka + slogan oldu (TR 52 / EN 54 karakter). Diğer
      sayfalar `${baslik} — ${SITE.isim}` kalıbını kullanıyor; `<title>` aynı
      zamanda `og:title` ve `twitter:title` olarak da basılıyor.
- [ ] Hero: 821-1190 px arasında gövde/üstlik puntosu 8-13 px'e iniyor
      (bkz. "Başlık puntosu ve 821-1190 px bandındaki okunurluk")
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

`scripts/banner-sembol-kes.mjs` teknoloji banner'larından başlığı atıp sembolü
`src/assets/banner/` altına yazar (bkz. "Banner sembolleri"):

```bash
node scripts/banner-sembol-kes.mjs
```

`wp-sayfa-tasi.mjs` sayfanın `#contentWrapper` içeriğini alır, `.page-title` ve
`aside` bloklarını atar; `--liste` ile hiçbir dosya yazmadan envanter raporu verir:

```bash
node scripts/wp-sayfa-tasi.mjs . --liste
```

## `npm run duzen` — sayfa düzeni denetimi

`scripts/duzen-denetim.mjs` **bütün sayfaları** (dist altındaki her
`index.html`) birkaç ekran genişliğinde açar ve üç şeye bakar:

1. **Yatay taşma** — `scrollWidth > innerWidth` ve taşmaya sebep olan en
   içteki öğe. `body { overflow-x: hidden }` bunu gizler ama düzeltmez;
   ölçüm gizlenmeden önceki gerçeği söyler.
2. **Yapışkan/sabit öğe çakışması** — `position: sticky|fixed` bir kutunun,
   akrabası olmayan bir metin/görsel öğesinin üstüne binmesi. Sayfanın ÜÇ
   yerinde bakılır (tepe, orta, dip): yapışkan menü ancak belirli kaydırma
   noktalarında komşusunun üstüne çıkıyor, tek noktada bakmak yetmiyor.
3. **Izgarada yanlış sütun** — `.yazi--yan` düzeninde doğrudan çocuk sayısı
   ikiden fazlaysa uyarır (aşağıdaki tuzak).

**768 px altında üç şey daha** — ve o genişlikler GERÇEK cihaz öykünmesiyle
açılır (dokunma, mobil kullanıcı aracısı, `deviceScaleFactor: 2`). Masaüstü
kullanıcı aracısıyla 390 px ölçmek `hover`a bağlı kuralları ve yükleme anında
cihaza bakan kodu yanlış çalıştırır; bu yüzden betik İKİ ayrı bağlam açıyor
(bu ayarlar bağlam seviyesinde, `setViewportSize` ile değişmiyor).

4. **Dokunma hedefi, iki kademe.** 24 px WCAG 2.5.8'in (AA) normatif alt
   sınırı → `IHLAL`. 40 px Apple/Google tavsiyesi → `dar`, hata değil.
   Tek eşik işe yaramıyordu: 36-38 px'lik onlarca öğe, 14×11 px'lik gerçek
   ihlali gömüyordu.
5. **Okunmayacak punto** — 12 px altı metin.
6. **Kabına sığmayan öğe** — `scrollWidth > clientWidth`.

**Üç yanlış pozitif bilerek eleniyor** (hepsi bu sitede gerçekten var):

| Desen | Neden yanlış pozitif | Nasıl eleniyor |
| --- | --- | --- |
| Karusel rayı | `.slider__ray` 8 slayt kadar geniş, kırpan atası var | üst soyda `overflow-x != visible` aranıyor |
| Tam genişlik şerit | `width: 100vw; margin-inline: calc(50% - 50vw)` kabından kasıtlı taşar | çocukta negatif yatay kenar boşluğu aranıyor |
| Gerilmiş bağlantı | kartlarda hedef metin değil, `::after` ile kaplanan kartın tamamı | `::after` mutlak konumluysa atlanıyor |

```bash
npm run build && npm run preview -- --port 4324    # ayrı bir kabukta
npm run duzen -- http://localhost:4324/ 1880,1280,900,390,360
```

70 sayfa × 4 genişlik ~10 dakika sürüyor; daha hızlısı için genişlik
listesini kısaltın.

**BEKLENEN listesi.** Betiğin başındaki `BEKLENEN` dizisi, tasarım gereği
olan çakışmaları tutar; raporda görünür ama hata saymazlar. Bugün tek kayıt:
`.mobil-tel` — 980 px altında sayfanın dibine yapışan telefon çubuğu.
Kaydırırken paragrafların üstünden geçiyor ama hiçbir şey KALICI olarak
gizli kalmıyor: `body { padding-bottom: 70px }` yer ayırıyor ve sayfanın en
dibinde son metin çubuğun 18 px üstünde bitiyor (390 / 900 / 979 px'te
ölçüldü).

**Bugünkü durum (2026-09-11, 70 sayfa × 1880/1280/900/390/360 px):** yatay
taşma yok, ızgara yerleşim hatası yok, dokunma hedefi ihlali yok, kabına
sığmayan öğe yok, `.mobil-tel` dışında çakışma yok.

Geriye yalnız bilgi amaçlı iki kalem kalıyor, ikisi de ihlal değil:
`dokunma-hedefi-dar` (üst şerit 24 px, logo 38 px, footer bağlantıları 33 px
— hepsi WCAG sınırının üstünde, tavsiye edilen 40'ın altında) ve
`kucuk-punto` (10,9-11,8 px'lik ikincil etiketler: tarihler, künye rozeti,
footer telif satırı, açılır menü başlığı).

### Mobilde giderilenler (2026-09-11)

- **Hero üstlüğü 8,8 px'ti.** Tasarım ızgarasında 14 px ve `--olcek-m`
  390 px'lik telefonda 0,63'e iniyor. Büyük harf + `.16em` harf aralığıyla
  okunmuyordu. `max(calc(14 * var(--olcek)), 12px)` ile tabanlandı; 820 px'te
  bile 11,7 px kalıyordu, yani taban bütün dar ekran bandında iş görüyor.
  Başlık (24,5 px) ve gövde (13,2 px) zaten 12'nin üstünde, dokunulmadı.
- **Dil değiştiricinin hedefi 14×11 px'ti** — WCAG'in 24×24 sınırının bile
  altında. Bağlantılar artık hapın yarısını kaplıyor ve hapın dışına biraz
  taşıyor (37×34, mobilde); zemini olmadığı için taşma görünmüyor.

  > **Özgüllük tuzağı** (`a.btn[href^="tel:"]` ile aynı aile): `.ust-serit a`
  > (0,1,1) sade `.dil-sec__b`yi (0,1,0) YENİYOR. `min-height: 26px` yazılmışken
  > 24 px uygulanıyordu, sessizce. Seçici `.dil-sec .dil-sec__b` (0,2,0)
  > yapıldı — sınıf sayısı 2 > 1 olduğu için kazanıyor.
- **Slider noktaları 9×9 px'ti.** Görünen nokta `::before`e alındı, buton
  26×26 px'lik saydam bir hedef oldu. Saydam bir `::after` uzantısı da işe
  yarardı ama o zaman ölçüm araçları hedefi hâlâ 9 px görür.
- **Üst şerit bağlantıları ve blog "geri" bağlantısı 22 px'ti** (24'ün
  altında). `min-height` ile 24-26 px'e çıkarıldı; şerit zaten 34 px yüksek,
  satır düzeni değişmedi.

## Komutlar

| Komut | Ne yapar |
| --- | --- |
| `npm install` | Bağımlılıklar |
| `npm run dev` | Geliştirme sunucusu (http://localhost:4321) |
| `npm run build` | `dist/` üretir |
| `npm run preview` | Build çıktısını yerelde sunar |
| `npm run cms` | Sveltia/Decap yerel backend (panel `/admin/`) |
| `npm run og` | `public/og-image.jpg`'yi yeniden üretir (bkz. aşağı) |
| `npm run hero` | Hero slaytlarında metin–katman çakışması denetimi |
| `npm run duzen` | Bütün sayfalarda düzen/hizalama denetimi |
| `npm run seo` | Build + `scripts/seo-denetim.mjs` — sayfa başına SEO puanı (bkz. "SEO") |
| `npm run webp` | Görselleri WebP'ye çevirir; `--kuru` yazmadan raporlar, `--klasor` hedefi seçer |
| `npm run seo:ayrinti` | Son build üzerinde her sayfanın tüm bulgularını listeler |
