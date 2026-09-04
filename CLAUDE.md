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
  sayfası **form olmadan** yeniden tasarlandı (`duzen: iletisim`): telefon ve
  e-posta büyük dokunma hedefleri olarak en üstte, altında ofis kartları ve
  harita. Form gerekirse ayrı bir karar — bir arka uç servisi gerektirir.
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
| `iletisim` | İletişim şablonu (form yok) | `iletisim` |

Hangi sayfa hangi düzende olduğunu görmek için:

```bash
grep -l "^duzen: urun" src/content/sayfalar/tr/*.md      # ürün şablonu (14)
grep -l "^duzen: iletisim" src/content/sayfalar/tr/*.md  # iletişim şablonu (1)
grep -L "^duzen:" src/content/sayfalar/tr/*.md           # normal akış (12)
```

**Normal akışta kalanlar ve nedeni:** `hakkimizda`, `hizmetlerimiz`,
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
> yazılıyor. Koyu zemine telefon butonu koyan başka bir yer olursa aynı tuzak.

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

**Hero slider** — `src/components/HeroSlider.astro`, veri `src/data/hero.ts`.

**Görsel katmanlar** canlı deltek.com.tr'deki Revolution Slider'dan birebir alındı:
9 slayt, 9 görsel + 1 YouTube katmanı; konum, geçiş tipi, gecikme ve süre
orijinaliyle aynı (4. slaytta sondaj biti soldan gelip toprak adasına giriyor).
Koordinatlar canlı slider'ın **1920×500 tasarım ızgarasındaki** pikseller
(`HERO_IZGARA`); bileşen container-query birimiyle (`--olcek`) orantılı ölçekler.
**`.slider__ray` en-boy oranı `1920/500` olmak zorunda** — değişirse katmanlar kayar.

3. slayttaki YouTube gömüsü tablet çerçevesinin (`video-screen.png`) koyu ekran
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
  baslik: '...'                  # 52/1920 punto, 800 ağırlık
  satirlar: ['...']              # gövde satırları
  eylem: 'Bize ulaşın'           # buton (isteğe bağlı)
  eylemKonum: akis | dip         # 'dip': buton slaytın en altına sabitlenir
  konum: sol | sag               # görsel katmanların boş bıraktığı yan
  dikey: ust | orta | alt        # katmanların kapladığı bandın dışı
  tema:  koyu | acik             # arka plan koyu mu açık mı
```

`tema` yazı ve perde rengini belirler: **1-3. slaytlar koyu fotoğraf** (beyaz yazı,
koyu perde), **4-9. slaytlar çok açık zemin** (lacivert yazı, açık perde). Perde
fotoğrafın tamamını değil yalnızca yazının olduğu yanı yumuşatır.

**Satır kırmak için `
` kullanılır**, `<br />` değil. Metinler kaçışlanarak
basıldığı için ham HTML düz metin olarak görünür; `
` bileşende gerçek `<br>`'ye
çevrilir (`satirlaraBol`). Hem `baslik` hem `satirlar` için geçerli.

`konum`/`dikey` her slaytta o slayttaki katmanların kapladığı alana göre seçildi.

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
Bu yöntemle bugünkü durum:

| Sayfa | Slayt | Katman | Çakışan genişlik | Altındaki opak piksel |
| --- | --- | --- | --- | --- |
| `/` ve `/en/` | 4 | `bit.png` (gri gölge şeridi) | 100 px | %95 |
| `/en/` | 5 | `machinery1.png` | 330 px | %86 |

**4. slayt kabul edilen durum.** `bit.png` iki ayrı opak banttan oluşuyor:
**mavi delgi borusu y334-376** ve altında **açık gri gölge şeridi y405-449**
(`rgb(225,225,225)`). Buton akışta kalınca boruya biniyordu; `eylemKonum: 'dip'`
ile slaytın dibine alındı (y411-474) ve **boru 35 px boşlukla tamamen kurtuldu**.
Gölge şeridine değmesi kaçınılmaz: şeridin altında 50 px kalıyor, buton 63 px.
Sıfırlamak isteyen butonu küçültmeli ya da `bit.png`'yi yukarı almalı — ikisi de
görsel bir bedel.

**5. slayt yalnızca `/en/`'de bozuk.** `Horizontal drilling specialists` başlığı
İngilizcede iki satıra sarıyor (TR'de tek satır), blok y244'ten başlayıp makine
görselinin bandına (y76-308) giriyor. Başlık tek satıra inmeden çözülmüyor.

Giderilenler:

- **8. slayt** (`button-hand.png`): `dikey: orta` iken başlığın ilk satırı elin
  tuttuğu düğmeye biniyordu → `dikey: ust`.
  > **`HERO_TR` ve `EN_YAZI` ayrı dizilerdir.** Bir slaydın `yazi` alanını
  > değiştirirken ikisini birden güncelleyin; bu düzeltme önce yalnızca TR'ye
  > uygulanmış, `/en/` bozuk kalmıştı.
- **6. slayt** (`yatay-sondaj-pipe-analysis.png`): görselin alt kenarı başlığa
  biniyordu → %30 küçültülüp (437→306) 150 px sola alındı (x 1094→944).
  Görselin `h` alanı yalnızca belgeleme amaçlı; **görsel katmanların yüksekliği
  veriden değil, `w` ve doğal en-boy oranından gelir** (yalnızca video katmanı
  `h`'yi kullanır), o yüzden ikisini orantılı tutun.


**Metin kuşağı.** Slayt yazıları slider'ın kenarına değil, ortalanmış sabit bir
şeride yaslanır: ana menü satırı (`.ust__gez`, TR menüsünde **797px**) iki yanına
**140'ar piksel** eklenerek **1077px**'lik kuşak elde edildi. Sol hizalı slaytlar
kuşağın sol sınırından, sağ hizalı slaytlar sağ sınırından başlar; hiçbir metin
dışarı taşmaz (9 slaytta ölçüldü). Ekran daraldığında kuşak `.kap` iç payına
kadar kısalır, taşma yine olmaz.

`--kusak` değeri `.yazi` içinde **elle yazılı sabittir** — container query içinden
header'ın ölçüsü okunamıyor. **Menü öğeleri değişirse** (`menuSira`/`menuAd` ile
sayfa eklenip çıkarılırsa) `.ust__gez` yeniden ölçülüp `--kusak` güncellenmeli:

```js
document.querySelector('.ust__gez').getBoundingClientRect().width + 280
```

**Giriş animasyonu** kademeli: üstlik 0,18 sn → başlık 0,32 sn → gövde satırları
0,48 sn'den itibaren 0,1 sn arayla → buton 0,66 sn. Her parça 0,72 sn'de aşağıdan
yukarı yumuşakça belirir. Animasyon yalnızca aktif slaytta çalışır
(`.slide[data-aktif="true"]`), böylece slayt her göründüğünde baştan oynar.
Otomatik geçiş 8 sn — en geç görsel katman 4000 ms gecikmeli.

**Dar ekran (≤820px):** oran `4/3`'e çıkar, dekoratif katmanlar gizlenir, perde
alttan yukarı koyulaşır ve yazı tam genişlikte ortalanıp beyaza döner.

> Canlı sitedeki 7. slaydın `1woman.png` katmanı sunucuda **404** veriyor —
> orijinali (309×451, saydam PNG) web arşivinin 2025-04-01 anlık görüntüsünden
> alınıp depoya kondu.
> `HERO_EN` metinleri Türkçe orijinallerin çevirisidir, Deltek onayından geçmedi.

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
- [x] `/iletisim/` sayfası form olmadan yeniden tasarlandı (`duzen: iletisim`) —
      telefon/e-posta kartları, ofis kartları, harita, kapanış çağrısı
- [ ] İletişim formu istenirse: statik sitede arka uç servisi gerekir
      (Cloudflare Pages Functions, Formspree vb.) — ayrı karar
- [ ] Sayfaların İngilizce çevirileri — şu an hiç yok, bu yüzden EN menüsünde
      yalnızca Blog görünüyor
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
