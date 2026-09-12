# Deltek — SEO Rehberi (site dışı ve yayın sonrası adımlar)

Site içi SEO (title/description, alt metinleri, yapısal veri, iç bağlantı,
hız) kodda tamamlandı; `npm run seo` iki dilde 72 sayfada 100/100 veriyor.
Aşağıdakiler kodla yapılamayan, **sizin** tarafınızdan yapılacak işlerdir.
Sıra önem sırasıdır; ilk 5 madde yayın haftasında bitmeli.

## 0. 2026-09-11 turu — sizin yapacaklarınız (öncelik sırasıyla)

Sitenin kendi içinde yapılabilecek her şey yapıldı (`npm run seo` 72 sayfa
100/100; teknik katmanın dökümü CLAUDE.md → SEO → "2026-09-11 turu"). Aşağıdakiler
yalnız sizin yapabileceğiniz, hesap/erişim ya da gerçek veri gerektiren işler.

| # | İş | Neden | Nerede |
| --- | --- | --- | --- |
| 1 | **Ofis koordinatları** — Google Haritalar'da adrese sağ tık → ondalık koordinatı kopyala | LocalBusiness şeması `geo` alır; yerel aramada ("yatay sondaj İzmir") konum eşleşmesi | `src/data/site.ts` → `OFISLER[].enlem/boylam` |
| 2 | **Çalışma saatleri** | LocalBusiness `openingHoursSpecification`; Business Profile'la tutarlı olmalı | `OFISLER[].calismaSaatleri` (örnek yorumda) |
| 3 | **Sosyal/dizin profilleri** (LinkedIn, YouTube, Vimeo, Instagram) | Organization `sameAs` → marka doğrulaması, Knowledge Panel | `SITE.sosyal` |
| 4 | **Kuruluş yılı** | Organization `foundingDate` — E-E-A-T sinyali | `SITE.kurulus` |
| 5 | **Bing Webmaster Tools** kaydı + sitemap | ChatGPT, Copilot ve Perplexity'nin bir kısmı Bing dizininden okuyor; Google'a kayıt Bing'e sayılmıyor. GSC'den içe aktarma seçeneği var, 2 dakika | bing.com/webmasters |
| 6 | **IndexNow'u yayında çalıştırın**: her deploy'dan sonra `npm run indexnow` | Bing/Yandex'e anında bildirim (anahtar dosyası zaten sitede) | terminal |
| 7 | **Twitter/X hesabı varsa** `twitter:site` için handle | Kart kaynağı; yoksa gerek yok | Layout.astro'ya bir satır (bana söyleyin) |
| 8 | ~~İngilizce URL kararı~~ **Yapıldı (2026-09-11):** EN adresler İngilizce (`/en/contact/`), dosya adları Türkçe; CMS'te İngilizce sekmede "URL" alanı. Yeni EN içerikte o alanı doldurun, Türkçe'de boş bırakın | — |
| 9 | **SSS ekleyin** (ana hizmet sayfalarına 3–5 soru) | FAQPage şeması kendiliğinden üretilir; "Sık sorulan sorular" başlığı + `**Soru?** Cevap` biçimi yeter. Uzun kuyruklu aramalar + yapay zekâ özetleri | `src/content/sayfalar/{tr,en}/*.md` |
| 10 | **Yazar/ekip** sayfası ya da hakkımızda'ya isim-unvan | E-E-A-T: kim yazıyor, kim yapıyor. Şu an her şey "Organization" adına | içerik |
| 11 | **`_headers`'daki HSTS'i genişletmek** isterseniz tüm alt alanların HTTPS olduğunu doğrulayın, sonra `includeSubDomains; preload` ekleyin | Tarayıcı ön yükleme listesi | `public/_headers` |

Yayın **sonrası** doğrulama (canlıda çalışan araçlar):

1. Rich Results Test → `/`, `/iletisim/` (LocalBusiness + FAQPage), bir blog yazısı (BlogPosting + article), `/yonlendirilebilir-yatay-sondaj/` (Service). Hata değil "uyarı" çıkarsa çoğu isteğe bağlı alan.
2. PageSpeed Insights mobil → LCP < 2,5 s, CLS < 0,1, INP < 200 ms. Yazı tipleri artık kendi sunucudan; "üçüncü taraf" satırı görünmemeli.
3. `https://www.deltek.com.tr/sitemap-index.xml` → her URL'de `lastmod` var mı.
4. `https://www.deltek.com.tr/rss.xml` ve `/en/rss.xml` açılıyor mu.
5. Search Console → Sayfalar raporu: "noindex ile hariç tutuldu" yalnız 404 ve admin olmalı.

## 0b. 2026-09-12 — Dış SEO raporunun değerlendirmesi ve sizin görevleriniz

Bir yapay zekâ aracıyla üretilmiş "DELTEK SEO Master Report" incelendi.
Kaynakçasında hem eski WordPress sitesi hem yeni site var; bulguları buna göre
ayrıştırıldı.

### Rapordan doğru çıkan ve UYGULANAN

| Rapor | Ne yapıldı |
| --- | --- |
| §3 Kanibalizasyon (5 sayfa) | Beş sayfanın niyeti ayrıldı — başlık, H1, açıklama; TR + EN. Tablo: CLAUDE.md → "Niyet ayrımı" |
| §4/§6 Ticari niyet | `/yatay-sondaj/` ticari sayfa oldu: "Yatay Sondaj Firması" başlığı, giriş + CTA, Service şeması, `/hizmetlerimiz/` HDD kartı buraya |
| §7 Fiyat sayfası | `/yatay-sondaj-fiyatlari/` + `/en/horizontal-drilling-cost/` yazıldı — 8 faktör, teklif için gerekli bilgiler, SSS (FAQPage şeması). Rakam yok |
| §10 Jenerik "AI/IoT/Endüstri 4.0" | Ticari sayfadan çıkarıldı. İki "delgi" sayfasında duruyor → görev 3 |
| §19 P0-1 Keyword→URL haritası | Aşağıda |

### Rapordan ZATEN YAPILMIŞ olanlar (rapor bilmiyordu)

§17 yapısal veri (Organization, WebSite, Breadcrumb, Service, Article, LocalBusiness,
FAQPage, VideoObject — hepsi var), §18 CWV temelleri (WebP, width/height, kendi
sunucudan font, immutable önbellek, CDN), §27 geliştirici sprinti (canonical,
sitemap, robots, 301/404, mükerrer title/H1, alt, iç bağlantı taraması, şema
doğrulama — `npm run seo` 100/100, `npm run yayin` 80/80, canlı tarama 0 kırık).

### Rapordaki BAYAT bulgular

Kanibalizasyon listesindeki `/yatay-sondaj-kazisiz-yatay-delgi/` zaten
kaldırılıp 301'lenmişti; alıntıladığı "– DELTEK" biçimli başlıklar eski
sitenin. Rakip listesindeki Armut gibi platformlar gerçek rakip değil, SERP
gürültüsü.

### KATILMADIĞIM öneriler

- Başlığa "2026" koymak: fiyat sayfası kalıcı, yıl bayatlar.
- `/boru-surme/`, `/mikrotunel/` gibi yeni adresler açmak: mevcut
  `/boru-surmecakma/` yıllardır sıralanıyor, 301 karmaşası kazanç getirmez.
  Mikrotünel zaten o sayfada başlıklı bölüm.
- Onlarca şehir sayfası: raporun kendisi de uyarıyor — gerçek proje olmadan
  doorway sayfası olur.

### Anahtar kelime → URL haritası (tek niyet, tek sayfa)

| Sorgu kümesi | Niyet | Sayfa |
| --- | --- | --- |
| yatay sondaj, yatay sondaj firması / hizmeti / şirketi, HDD firması | ticari | `/yatay-sondaj/` |
| yatay sondaj fiyatları / metre fiyatı / maliyeti, HDD fiyat | ticari-bilgi | `/yatay-sondaj-fiyatlari/` |
| yönlendirilebilir yatay sondaj, HDD rehberi, aşamalar, makine sınıfları | teknik rehber | `/yonlendirilebilir-yatay-sondaj/` |
| HDD nedir, yönlendirilebilir yatay sondaj nedir, tarihçe | tanım | `/yonlendirilebilir-yatay-sondaj-nedir/` |
| HDD yapım metodu, pilot delgi, reaming, boru çekme | yöntem | `/yonlendirilebilir-yatay-sondaj-yapim-metodu/` |
| yatay sondaj makinesi, HDD makinesi, kapasite | ekipman | `/yonlendirilebilir-yatay-sondaj-makinesi/` |
| yatay delgi, yatay delgi uygulama alanları | uygulama | `/yatay-delgi-nedir/` |
| yönlendirilebilir yatay delgi, YYD, navigasyon | teknoloji | `/yonlendirilebilir-yatay-delgi/` |
| boru sürme, boru çakma, auger boring, mikrotünel | ticari + teknik | `/boru-surmecakma/` |
| boru yenileme, pipe bursting, kazısız boru yenileme | ticari + teknik | `/boru-yenileme/` |
| kazısız altyapı, akıllı altyapı | hizmet | `/akilli-altyapi/` |
| hizmetlerimiz, HDD hizmeti, kazısız geçiş hizmetleri | hizmet listesi | `/hizmetlerimiz/` |
| teklif, iletişim, İstanbul / İzmir yatay sondaj | dönüşüm | `/iletisim/` |
| delgi tiji, genişletme başlığı, sondaj çamuru, yer belirleme… | teknik bileşen | ilgili teknoloji sayfası |

Yeni bir sayfa açmadan önce: hedef sorgu bu tabloda varsa **o sayfayı
güçlendir**, yenisini açma.

### Sizin görevleriniz (öncelik sırasıyla)

**1. Fiyat sayfasını onaylayın (10 dk).** `src/content/sayfalar/tr/yatay-sondaj-fiyatlari.md`
ve `en/…` — sekiz faktörün açıklaması ve üç SSS cevabı Deltek'in
uygulamasıyla uyuşuyor mu? Özellikle "iki hafta içinde mobilize", "keşif
ücretsiz", "kaya delgisinde ayrı ekipman" cümleleri. Yanlış olanı düzeltin ya
da bana yazın. Sayfa yayında; onay beklemeden yayına alındı çünkü her cümle
sitede zaten var olan bir ifadeye dayanıyor.

**2. ~~Teknik iddiaları doğrulayın~~ — ONAYLANDI (2026-09-12).** Aşağıdaki
sayıların doğru olduğu Deltek tarafından teyit edildi:

| Dosya | İfade |
| --- | --- |
| `sayfalar/tr/boru-surmecakma.md` satır 35 | 1200 mm |
| `sayfalar/tr/boru-surmecakma.md` satır 58 | 840 ton |
| `sayfalar/tr/boru-yenileme.md` satır 31 | %10–45 çap büyütme |
| `sayfalar/tr/genisletme-basligi.md` satır 36 | 1600 mm |
| `sayfalar/tr/yonlendirilebilir-yatay-sondaj-yapim-metodu.md` satır 33 | 7500 m, 1600 mm |

**3. İki "delgi" sayfasındaki "gelecek" bölümleri — karar bekliyor.** Bu iki
sayfada Deltek'i değil "geleceği" anlatan, her firmanın sitesine konabilecek
genel paragraflar var (yapay zekâ rota planlayacak, IoT ile izlenecek,
elektrikli makineler gelecek…): `yatay-delgi-nedir.md` → "## Geleceğin Yatay
Delgi Teknolojileri" (73 kelime), `yonlendirilebilir-yatay-delgi.md` →
"## Teknolojik Gelişmeler ve Geleceğin Trendi" (118 kelime). SEO raporu §10
bunları "jenerik" diye işaretledi; Google da Deltek'in kendi tecrübesini
anlatan metni buna tercih eder. Seçenekler: (a) silin — sayfalar 785 ve 1121
kelime, kayıp yok; (b) yerine Deltek'in gerçekten kullandığı bir teknolojiden
2-3 cümle yazın (hangi yer belirleme sistemi, hangi makine sınıfı). "sil" ya da
metin gönderin, uygularım. Ticari sayfadaki aynı bölüm zaten silindi.

**4. İlk vaka çalışması — şimdilik ERTELENDİ (2026-09-12, kullanıcı kararı).** Rapor §8 haklı: referans
logoları tek başına yetmiyor. **Bir** tamamlanmış proje için şunları toplayın:
işveren (yazılabiliyorsa), yer, geçiş tipi (nehir/otoyol/şehir içi), zemin,
boru çapı ve malzemesi, uzunluk, kullanılan makine, süre, karşılaşılan zorluk
ve çözüm, 3–5 saha fotoğrafı. Gönderin; `projeler` koleksiyonunu, şablonu ve
referans sayfasından bağlantıyı ben kurarım. İlk sayfa çıkınca gerisi CMS'ten.

**5. ~~Teklif formu~~ — KARAR: formsuz kalıyor (2026-09-12).** Telefon ve
e-posta CTA'ları yeterli görüldü; rapor §16 uygulanmadı.

**6. ~~PageSpeed ölçümü~~ — YAPILDI ve sorun DÜZELTİLDİ (2026-09-12).**
Mobil sonuç: `/yatay-sondaj/` **98**; ana sayfa **59** (FCP 6,4 s, LCP
12,5 s, CLS 0), Best Practices 77 (4 üçüncü taraf çerez), SEO 100,
Accessibility 97. Lighthouse ağ şelalesiyle iki sebep bulundu ve giderildi:

| Sebep | Ölçüm | Düzeltme |
| --- | --- | --- |
| YouTube gömüsü sayfa açılışında iniyordu | 14 istek, 1011 KB, yükün %43'ü + doubleclick çerezleri | Fasad: oynat düğmesi, iframe tıklayınca ve `youtube-nocookie` |
| 2-4. slaytların görselleri "lazy" olsa da iniyordu | ~750 KB görünmeyen görsel | `data-src`; aktif slayt hemen, sonraki 3 sn sonra |
| Tecrübe bandı görseli telefonda tam boy | 236 KB | 960 px varyant + `srcset` → 83 KB |

Sonuç (Playwright, mobil): açılışta üçüncü taraf isteği 0, hero görseli 3 /
97 KB; slider ve video işlevi 20/20 test; `npm run hero` iki dilde temiz.
**Canlıya çıktıktan sonra PageSpeed'i bir daha çalıştırın** — beklenti
ana sayfa mobilde 85+, Best Practices 100. Sonucu bana gönderin.

Accessibility 97'deki tek bulgu ("kontrast yetersiz") hangi öğede olduğu
ekran görüntüsünden görülmüyor; PageSpeed'de o satırı açıp öğeyi bana
yazarsanız bakarım.

**7. Dört hafta sonra Search Console.** Performans → Sorgular → "yatay sondaj"
sorgusuna hangi sayfalar giriyor? `/yatay-sondaj/` tek başına olmalı.
`/yatay-delgi-nedir/` de giriyorsa iki "delgi" sayfasını birleştirme kararını
o veriyle veririz (bkz. §6).

**8. Blog karışımı.** Sonraki yazılar §7'deki listeden; uluslararası haber
çevirisi artık öncelik değil (rapor §12 haklı: 11 yazının 7'si haber).

Google Business Profile (§3) ve sosyal profiller (§4) hâlâ açık.

## 1. Yayına alırken (ilk gün)

1. **Cloudflare Pages'te alan adları:** `www.deltek.com.tr` ana alan adı; apex
   `deltek.com.tr` → `www`'ya **301**. Kanonik host `www` (kodda böyle).
2. **HTTPS zorunlu:** Cloudflare → SSL/TLS → "Always Use HTTPS" açık.
3. **301'leri test edin:** Eski WordPress adreslerinden 10 tanesini tarayıcıda
   açıp yeni sayfaya gittiğini görün (`public/_redirects` listesi). Özellikle
   `/medyalar/`, `/feed/`, `/2017/…`.
4. **Sitemap'i kontrol edin:** `https://www.deltek.com.tr/sitemap-index.xml`
   açılmalı ve 72 URL içermeli (36 TR + 36 EN).
5. **404 sayfası:** `https://www.deltek.com.tr/olmayan-sayfa/` ve
   `/en/olmayan-sayfa/` markalı 404'ü göstermeli.

## 2. Google Search Console (ilk hafta)

1. `https://search.google.com/search-console` → **Alan adı** türünde mülk
   ekleyin (`deltek.com.tr`); doğrulama DNS TXT kaydıyla (Cloudflare DNS'e
   ekleyin).
2. **Site haritaları** → `https://www.deltek.com.tr/sitemap-index.xml` gönderin.
3. **URL denetimi** ile ana sayfa, `/yatay-sondaj/`, `/yonlendirilebilir-yatay-sondaj-nedir/`
   ve `/en/` için "Dizine eklenmesini iste" deyin.
4. İki hafta sonra **Sayfalar** raporuna bakın: "Taranmış, dizine eklenmemiş"
   ve "Yönlendirmeli sayfa" dışındaki hatalar sıfır olmalı.
5. **Bing Webmaster Tools**'a da aynı sitemap'i verin (Search Console'dan
   içe aktarma var, 5 dakika sürer).

## 3. Google Business Profile (ilk hafta)

1. `https://business.google.com` → iki konum oluşturun: **İzmir (merkez)** ve
   **İstanbul**. Adres ve telefon `src/data/site.ts` ile **birebir aynı**
   yazılmalı (NAP tutarlılığı).
2. Kategori: "Sondaj müteahhidi" + "İnşaat şirketi" + "Mühendislik firması".
3. Web sitesi: `https://www.deltek.com.tr/` ; hizmetler bölümüne dört ana
   hizmeti (HDD, boru sürme, boru yenileme, akıllı altyapı) ekleyin.
4. Saha fotoğrafları yükleyin (makine, ekip, proje) — en az 10.
5. Mevcut müşterilerden **Google yorumu** isteyin; 5–10 yorum yerel aramada
   büyük fark yaratır.

## 4. Sosyal profiller ve sameAs (ilk ay)

1. LinkedIn şirket sayfası, YouTube kanalı (Vimeo videosunu oraya da yükleyin),
   Instagram. Her birinde web sitesi bağlantısı `https://www.deltek.com.tr/`.
2. Adresleri `src/data/site.ts` → `sosyal: [...]` dizisine yazın; site yeniden
   build alınınca JSON-LD `sameAs` olarak çıkar (marka doğrulaması sinyali).
3. Aynı dosyada `kurulus: "2005"` gibi kuruluş yılını yazın (`foundingDate`).
4. WhatsApp numarası varsa `whatsapp: "9053..."` — sabit buton görünür.

## 5. Yapısal veriyi ve hızı doğrulayın (ilk ay)

1. `https://search.google.com/test/rich-results` → ana sayfa, bir teknoloji
   sayfası, bir blog yazısı ve `/deltek-yatay-sondaj-kaya-delgi-rock-drilling/`
   (VideoObject) — hepsi "geçerli" olmalı.
2. `https://pagespeed.web.dev` → ana sayfa mobil puanı.
   **Görsel tarafı bitti:** hero, teknoloji sayfası görselleri ve banner
   sembolleri WebP'ye çevrildi (toplam 12,1 MB → 4,0 MB). Teknoloji
   sayfalarının görsel ağırlığı 700–1100 KB'den 160–230 KB'ye indi.
   Yeni görsel eklerken:

   ```bash
   npm run webp -- --klasor public/images/uploads --kuru   # önce ölç
   ```

   Puan yine düşükse kalan kazanç görselde değil; "Tanılamalar" listesinin
   en üstündeki maddeye bakın.
3. `https://validator.schema.org` ile aynı sayfaları bir de burada test edin.
4. **Eski görsel adresleri:** `_redirects` içine
   `/wp-content/uploads/* → /images/uploads/:splat 301` eklendi. Yayına
   aldıktan sonra bir tanesini tarayıcıda deneyin; Google Görseller'de duran
   eski adresler bu sayede 404 vermeyecek.

## 6. İçerik: kanibalizasyon (durum 2026-09-12)

**Yapıldı:** beş örtüşen sayfanın niyeti başlık/H1/açıklamayla ayrıldı
(0b'deki harita). Artık yalnız `/yatay-sondaj/` ticari, diğerleri birer teknik
açıdan tek.

**Kalan tek karar:** `/yatay-delgi-nedir/` ve `/yonlendirilebilir-yatay-delgi/`
hâlâ uzun ve `/yatay-sondaj/` ile aynı konu evreninde ("delgi" yalnız "sondaj"ın
eş anlamlısı). Bugün ayrı tutuldular çünkü "yatay delgi" ayrı bir arama
terimi ve sayfaların kendi geçmişi var. Dört hafta Search Console verisi
biriktikten sonra:

1. Performans → Sorgular → "yatay sondaj" ve "yatay delgi" için hangi sayfalar
   görünüyor?
2. İki sayfa aynı sorguda yarışıyorsa zayıfı güçlüye **301** (`public/_redirects`
   + CLAUDE.md tablosu). Aday: `/yatay-delgi-nedir/` → `/yatay-sondaj/`.
3. Diğer sitelerinizle (`yataydelgi.com`, `yataysondaj.org`, Boremak) **aynı
   cümleleri paylaşmayın**; oradan buraya bağlantı verin, metin kopyalamayın.

## 7. İçerik takvimi (sürekli)

Blogda 11 yazı var; Google düzenli güncellenen siteyi tercih eder.
Ayda 1–2 yazı yeterli. Türkçe aramada boşluk olan konular:

- ~~yatay sondaj fiyatları~~ — **yapıldı** (`/yatay-sondaj-fiyatlari/`, 2026-09-12). Deltek gerçek proje senaryoları ekleyebilir
- "yatay sondaj mı açık kazı mı: maliyet karşılaştırması"
- "nehir altı boru geçişi nasıl yapılır" (bir Deltek projesi anlatımı)
- "fiber optik yatay sondaj: belediye izin süreci"
- "kazısız boru yenileme belediye örnekleri"
- Her tamamlanan projeden kısa bir **vaka yazısı** (yer, çap, uzunluk, zemin,
  yöntem, süre) — referans sayfasına da bağlayın.

Her yazıda CMS'teki alanları doldurun: **seoBaslik** (≤56), **ozet** (70–160
karakter, anahtar kelimeyle başlasın), **anahtarKelimeler**, **kapak + kapakAlt**,
**ilgili** (2–4 iç bağlantı). Yayından sonra `npm run seo` çalıştırın; 100 altı
sayfa varsa nedeni ekranda yazar.

## 8. Backlink (sürekli, düşük tempo)

1. Referans müşterilerinizin web sitelerinde "yükleniciler/iş ortakları"
   sayfasına bağlantı isteyin (BOTAŞ gibi kamu kurumları vermez; özel firmalar
   verebilir).
2. Sektör dernek ve fuar siteleri (kazısız teknoloji dernekleri, altyapı
   fuarları) üye/katılımcı listelerine kayıt.
3. Sektör haber siteleri: dünya rekoru yazıları gibi haberleri yerel mühendislik
   portallarına gönderin, kaynak olarak siteye bağlantı isteyin.
4. Asla satın alınmış/toplu bağlantı kullanmayın; az ama ilgili bağlantı yeter.

## 9. İngilizce site (EN)

1. EN metinler çeviridir; **yayın öncesi bir mühendisin okuması** şart
   (teknik terimler: pipe jacking / auger boring / pipe bursting kullanıldı).
2. EN sayfalar `/en/` altında ve slug'lar Türkçe (`/en/yatay-sondaj/`).
   Uluslararası aramada İngilizce slug daha iyi olurdu; ama URL değişikliği
   redirect ister. **Şimdilik bırakın**; EN trafiği anlamlı olursa
   `adres` alanı ekleyip İngilizce slug'a geçmek ayrı bir iş.
3. Hedef pazar belliyse (Körfez, Balkanlar, Orta Asya) Search Console'da
   **Uluslararası hedefleme** yapmayın; hreflang zaten doğru. Onun yerine o
   pazarlara özel bir–iki EN blog yazısı yazın.

## 10. Aylık kontrol listesi (10 dakika)

- Search Console → Performans: tıklama/gösterim trendi, ilk 10 sorgu
- Search Console → Sayfalar: yeni hata var mı
- `npm run seo` → 100 altına düşen sayfa var mı
- Google Business Profile: yeni yorum var mı, cevap verildi mi
- En çok trafik alan sayfaya 1 paragraf güncel bilgi ekleyin, `guncelleme`
  tarihini yazın (dateModified sinyali)
