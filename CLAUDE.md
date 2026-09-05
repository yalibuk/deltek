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
| `/boru-surme-boru-cakma-auger-boring/` | `/boru-surmecakma/` | Aynı konuda iki sayfa vardı; menüde mükerrer görünüyordu |

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
  assets/banner/*.jpg       başlık banner'larının sembolleri (bkz. "Banner sembolleri")
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
| _(boş)_ | Normal makale akışı — markdown gövdesi | `hakkimizda`, `medyalar` |
| `logo-izgara` | Art arda gelen görselleri yan yana dizer | `referanslar` |
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
bannerSembol: yonlendirilebilir-yatay-sondaj-metodu   # başlık banner'ı (aşağı bak)
banner: /images/uploads/ust-gorsel.jpg                # düz üst görsel — sembol varsa yok sayılır
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
bannerSembol: yonlendirilebilir-yatay-sondaj-metodu   # src/assets/banner/<ad>.jpg
```

* Dosya `src/assets/banner/` altında; `astro:assets` ile içe aktarılır, böylece
  `width`/`height` derlemede bilinir (CLS yok) ve **dosya yoksa build durur**.
* `bannerSembol` verilen sayfada ayrı bir `<h1>` satırı ve `UrunDuzen`'in düz
  `banner` görseli **basılmaz** — ikisi de aynı başlığı tekrar ederdi.
* Başlığın üstündeki küçük etiket ağaçtaki üst dalın adıdır; **başlık zaten o
  adla başlıyorsa basılmaz** (ör. üst dal "Yönlendirilebilir Yatay Sondaj",
  başlık "Yönlendirilebilir Yatay Sondaj Yapım Metodu" → etiket yok). Aksi
  hâlde giderdiğimiz tekrarın aynısı olurdu.
* Sembolün genişliği `banner yüksekliği × doğal en/boy` olarak hesaplanır
  (`--sembol-oran`), üst sınır kutunun %47'si. Dört sembol bu sınıra takılıyor
  ve `object-fit: cover` ile **soldan** kırpılıyor (en çok boru-yenileme,
  145px — orası zaten boş zemin). 720px altında sembol başlığın altına iner.
* Kaynak görsellerin zemini x'ten bağımsız düşey bir gri gradyan: `#F5F5F5` →
  `#ECECEC`. Banner kutusu **birebir bu iki tonu** kullanmak zorunda
  (`--banner-ust` / `--banner-alt`), yoksa kesim yerinde dikiş görünür. Ölçüm:
  13 sayfanın hepsinde dikişteki en büyük fark 1/255.
* İki clipart'ın (`kazisiz-akilli-altyapi`, `..-nedir`) kırpılmamış **beyaz
  kutusu** vardı; kenara bitişik beyaz bölge taşma-doldurma ile gradyana
  boyandı. Nesnenin içindeki parlamalar kenara bağlı olmadığı için korundu.
  Eşik 246 — zemin gradyanının tepesi 245, yani **normal zemine ve fotoğrafların
  açık gri bölgelerine hiç dokunulmuyor**. 241 denendi: sonuç piksel piksel aynı
  ama 13 görselin hepsinde zemini de yeniden boyuyordu, gereksiz risk.
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

19 teknoloji/yöntem sayfası taşınmıştı ama **14'ü yetimdi** (biri sonradan
mükerrer olduğu için kaldırıldı, bkz. 301 tablosu — bölüm bugün 18 sayfa): adresi çalışıyordu,
hiçbir yerden bağlantı verilmiyordu. Bilgi mimarisi canlı sitedeki "Teknoloji"
açılır menüsünden alınıp `src/data/teknoloji.ts` içine ağaç olarak yazıldı.

```
Teknoloji (/yatay-sondaj-teknoloji/)
├── Yönlendirilebilir Yatay Sondaj      9 alt sayfa
│   └── Yer Belirleme                   → Üzerinden Takip, Manyetik Alan
└── Diğer kazısız yöntemler             6 sayfa
```

Ağaçta **yalnızca slug ve kısa menü adı** durur; başlık, özet ve görsel
sayfanın kendi frontmatter'ından okunur (`teknolojiAgaci()` — `src/data/icerik.ts`).
Menü etiketleri sayfa başlıklarıyla aynı değil, canlı sitedeki kısa adlar
korundu ("Auger Boring" ↔ "Auger Boring Nedir? Modern Yatay Delgi Teknolojisi").

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

   > **İki tuzak:** (a) `<details>` kullanılmadı — kapanırken içerik anında
   > kaybolduğu için geçiş oynamıyor; onun yerine `grid-template-rows: 0fr→1fr`.
   > (b) Kapalı dalın `visibility: hidden` kuralı `>` ile yazılmalı: torun
   > seçici olursa açık bir dalın içindeki kapalı alt dal görünür sayılır ve
   > oradaki bağlantılar Tab sırasında kalır.

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
| `--banner-ust` | `#F5F5F5` | | `--banner-alt` | `#ECECEC` |

`--marka-mavi` **Deltek logo mavisi ve değişmez** — bağlantılar, butonlar,
başlıklar bu rengi kullanmaya devam eder. `--beyaz` paletin parçası değil ama
kaçınılmaz (sayfa zemini, mavi üstündeki yazı).

`--banner-ust` / `--banner-alt` de paletten değil: `src/assets/banner/*.jpg`
sembollerinin kendi zemini bu iki nötr gri, banner kutusu onlarla dikişsiz
birleşmek zorunda. **Yalnız `SayfaBanner.astro` kullanır**; başka yerde bu
griler yazılmaz.

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
8 slayt (9.'su kaldırıldı), 8 görsel + 1 YouTube katmanı; konum, geçiş tipi, gecikme ve süre
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
  eylemHref: '/iletisim/'        # buton bağlantısı (varsayılan /iletisim/)
  konum: sol | merkez | sag      # yatay yer ('orta' DEĞİL — o `dikey`in değeri)
  dikey: ust | orta | alt        # katmanların kapladığı bandın dışı
  tema:  koyu | acik             # arka plan koyu mu açık mı
```

`tema` yazı ve perde rengini belirler: **1-3. slaytlar koyu fotoğraf** (beyaz yazı,
koyu perde), **4-8. slaytlar çok açık zemin** (lacivert yazı, açık perde). Perde
fotoğrafın tamamını değil yalnızca yazının olduğu yanı yumuşatır.

**Satır kırmak için `\n` kullanılır**, `<br />` değil. Metinler kaçışlanarak
basıldığı için ham HTML düz metin olarak görünür; `\n` bileşende gerçek `<br>`'ye
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
dışarı taşmaz (tüm slaytlarda ölçüldü). Ekran daraldığında kuşak `.kap` iç payına
kadar kısalır, taşma yine olmaz.

`--kusak` değeri `.yazi` içinde **elle yazılı sabittir** — container query içinden
header'ın ölçüsü okunamıyor. **Menü öğeleri değişirse** (`menuSira`/`menuAd` ile
sayfa eklenip çıkarılırsa) `.ust__gez` yeniden ölçülüp `--kusak` güncellenmeli:

```js
document.querySelector('.ust__gez').getBoundingClientRect().width + 280
```

### Slayt butonları

`eylem` yazılan slaytta gerçek bir `<a>` basılır; hedef `eylemHref`, verilmezse
`/iletisim/`. **EN slaytlar da `/iletisim/`'e gider** — `/en/iletisim/` sayfası
henüz yok; çeviri eklenince `EN_YAZI`'da `eylemHref` yazılmalı.

Görünüm `global.css`'teki `.btn--dolu` ile aynı: hover'da koyulaşır, 1 px
yükselir, gölge derinleşir; `:focus-visible`'da sarı çerçeve.

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

## Komutlar

| Komut | Ne yapar |
| --- | --- |
| `npm install` | Bağımlılıklar |
| `npm run dev` | Geliştirme sunucusu (http://localhost:4321) |
| `npm run build` | `dist/` üretir |
| `npm run preview` | Build çıktısını yerelde sunar |
| `npm run cms` | Sveltia/Decap yerel backend (panel `/admin/`) |
| `npm run og` | `public/og-image.jpg`'yi yeniden üretir (bkz. aşağı) |
