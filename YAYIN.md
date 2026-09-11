# Deltek — canlıya alma kılavuzu

Yeni site GitHub'da hazır: `github.com/yalibuk/deltek`, dal `main`.
Canlı `deltek.com.tr` bugün **WordPress/Plesk** üzerinde çalışıyor ve
`deltek.com.tr` → `www.deltek.com.tr` yönlendirmesini **o sunucu** yapıyor.

Bu kılavuz sırayla takip edilir. **1-5. adımlar canlı siteye hiç dokunmaz**;
site ancak 6. adımda değişir.

---

## Geçişten önce bilinmesi gerekenler

| Konu | Durum |
| --- | --- |
| Alan adı | **Zaten Cloudflare'de** (NS: `harley` / `rosalyn.ns.cloudflare.com`) — nameserver değiştirmeye gerek yok |
| apex → www 301 | **Eski Plesk sunucusunda.** DNS değişince KAYBOLUR; Cloudflare'de yeniden kurulmalı (adım 7) |
| Eski sunucu | Geri dönüş için **kapatılmamalı** (en az 1 hafta) |
| Slug'lar | Canlı sitedeki Türkçe adreslerin hepsi birebir korundu; kaldırılan sayfalar için `public/_redirects`'te 301 var |
| Eski görsel adresleri | `/wp-content/uploads/*` → `/images/uploads/:splat` 301'i var, hedef dosyalar depoda |

---

## 1. Son kontrol (yerelde, 2 dakika)

```bash
cd deltek-site
npm run seo
```

Beklenen: `GENEL PUAN: 100/100`, 73 sayfa, `Alt eksik görsel: 0 · width/height eksik: 0 · Yetim sayfa: 0`.

`git status` temiz olmalı. Kirliyse commit'leyip push edin — Cloudflare
GitHub'daki hâli derler, yereldekini değil.

---

## 2. Cloudflare Pages projesini oluşturun

Cloudflare paneli → **Workers & Pages** → **Create** → **Pages** →
**Connect to Git** → `yalibuk/deltek` deposunu seçin.

Build ayarları:

| Alan | Değer |
| --- | --- |
| Framework preset | Astro (ya da None) |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | *(boş — depo kökü)* |
| Production branch | `main` |

Node sürümü **ayrıca girilmesine gerek yok**: depodaki `.node-version`
dosyası 22.12.0 diyor, Pages onu okuyor.

**Save and Deploy** deyin. İlk derleme 1-3 dakika sürer.

> Derleme günlüğünde şunlar görünmeli:
> `sitemap: 70 URL'ye lastmod, 70 URL'ye hreflang eklendi`,
> `rss: /rss.xml`, `llms.txt yazıldı`, `73 page(s) built`.
> "git geçmişi yok ve icerik-tarihleri.json bulunamadı" uyarısı **çıkmamalı**.

---

## 3. `*.pages.dev` adresinde test edin (DNS'e dokunmadan)

Pages size `deltek-xxxx.pages.dev` gibi bir adres verir. **Burada test edin**,
çünkü 6. adımdan sonra hata bulmak pahalı olur.

Bakılacaklar:

- [ ] Ana sayfa, hero slider, menü, footer
- [ ] `/iletisim/`, `/hizmetlerimiz/`, `/yatay-sondaj-teknoloji/`
- [ ] Bir blog yazısı ve `/blog/`
- [ ] **İngilizce taraf**: `/en/`, `/en/contact/`, `/en/horizontal-directional-drilling/`
- [ ] Dil değiştirici iki yönde de doğru sayfaya gidiyor mu
- [ ] Telefonda: hero, menü, iletişim sayfası
- [ ] `/sitemap-index.xml`, `/rss.xml`, `/robots.txt`, `/llms.txt` açılıyor mu
- [ ] Olmayan bir adres (`/xyz/`) 404 sayfasını veriyor mu

> `*.pages.dev` adresi Google tarafından indekslenebilir. Kalıcı olarak
> tutacaksanız Pages ayarlarından erişimi kısıtlayın; geçici test için sorun değil.

---

## 4. Mevcut DNS kaydını NOT ALIN (geri dönüş için)

Cloudflare paneli → `deltek.com.tr` → **DNS** → **Records**.

`www` kaydının **tipini ve değerini** bir yere yazın ya da ekran görüntüsünü
alın (muhtemelen Plesk sunucusunun IP'sini gösteren bir `A` kaydı). Geçiş
sorun çıkarırsa geri dönüş bu kayıttır.

Aynı şekilde apex (`deltek.com.tr`) kaydını da not alın.

---

## 5. Google Search Console'u hazırlayın

Henüz yoksa **şimdi** kurun; eski siteden veri toplamaya başlasın ve geçişin
etkisini görebilesiniz. Domain doğrulaması Cloudflare DNS üzerinden tek tıkla
yapılıyor.

Geçişten önce mevcut **indekslenmiş sayfa sayısını** not alın
(Sayfalar → Dizine eklendi). Geçişten sonra bu sayının korunması gerekir.

---

## 6. Özel alan adını bağlayın — **SİTE BU ADIMDA DEĞİŞİR**

Pages projesi → **Custom domains** → **Set up a custom domain** →
`www.deltek.com.tr`.

Cloudflare DNS kaydını kendisi günceller (eski `A` kaydını Pages'e bakan bir
kayıtla değiştirir). Sertifika birkaç dakikada hazır olur.

Hemen kontrol edin:

```bash
curl -sI https://www.deltek.com.tr/ | head -3
curl -s https://www.deltek.com.tr/ | grep -c "Deltek"
```

Yanıtta `server: cloudflare` olmalı ve `x-powered-by: PHP` **olmamalı** —
PHP başlığı hâlâ eski sunucuya gittiğinizi gösterir.

---

## 7. apex → www yönlendirmesini kurun — **ATLAMAYIN**

Bu adım yapılmazsa `deltek.com.tr` (www'suz) ya çalışmaz ya da www ile
**ikiz içerik** üretir; ikisi de SEO kaybı.

Cloudflare paneli → `deltek.com.tr` → **Rules** → **Redirect Rules** →
**Create rule**:

| Alan | Değer |
| --- | --- |
| Rule name | `apex → www` |
| If: Custom filter expression | Hostname **equals** `deltek.com.tr` |
| Then: Type | **Dynamic** |
| Expression | `concat("https://www.deltek.com.tr", http.request.uri.path)` |
| Status code | **301** |
| Preserve query string | ✅ |

Kural kaydedildikten sonra apex için bir DNS kaydı gerekir (yoksa kural hiç
çalışmaz). Cloudflare'de apex'e **proxy'li (turuncu bulut)** bir `AAAA` kaydı
`100::` ya da mevcut kaydı proxy'li bırakmak yeterli.

Doğrulayın:

```bash
curl -sI https://deltek.com.tr/iletisim/ | grep -i "^location\|^HTTP"
```

Beklenen: `HTTP/2 301` ve `location: https://www.deltek.com.tr/iletisim/` —
yalnız ana sayfaya değil, **yoluyla birlikte** gitmeli.

---

## 8. Geçiş sonrası doğrulama (ilk saat)

```bash
# Ana adresler
for u in / /iletisim/ /hizmetlerimiz/ /blog/ /en/ /en/contact/; do
  printf "%-22s " "$u"; curl -s -o /dev/null -w "%{http_code}\n" "https://www.deltek.com.tr$u"
done

# 301'ler çalışıyor mu
curl -sI https://www.deltek.com.tr/mikrotunel-nedir/ | grep -i "^location"
curl -sI https://www.deltek.com.tr/wp-content/uploads/2015/08/018.jpg | grep -i "^location"

# Dosyalar
for u in /sitemap-index.xml /robots.txt /rss.xml /llms.txt /_headers; do
  printf "%-22s " "$u"; curl -s -o /dev/null -w "%{http_code}\n" "https://www.deltek.com.tr$u"
done
```

`_headers` **404 vermeli** (Cloudflare onu yapılandırma olarak okur, dosya
olarak sunmaz). Başlıkların uygulandığını şöyle doğrulayın:

```bash
curl -sI https://www.deltek.com.tr/ | grep -iE "strict-transport|x-content-type|referrer-policy"
```

Ayrıca tarayıcıda:

- [ ] Ana sayfa ve birkaç iç sayfa gözle
- [ ] Telefonda ana sayfa
- [ ] `/admin/` paneli açılıyor mu (CMS)

---

## 9. Arama motorlarına haber verin (ilk gün)

1. **Search Console** → Sitemaps → `sitemap-index.xml` gönderin.
2. **URL Denetimi** ile ana sayfa ve 3-4 önemli sayfa için "Dizine eklenmeyi
   iste" deyin.
3. **Bing Webmaster Tools** → siteyi ekleyin (Search Console'dan içe aktarma
   seçeneği var, 2 dakika) → sitemap gönderin.
4. **IndexNow** — her deploy'dan sonra:

```bash
npm run build && npm run indexnow
```

> Bing dizinini ChatGPT ve Copilot da kullanıyor; bu adım yapay zekâ
> aramalarında görünürlük için Google kadar önemli.

---

## 10. İlk hafta izleme

| Ne | Nerede | Ne beklenir |
| --- | --- | --- |
| Tarama hataları | Search Console → Sayfalar | 404 artışı olmamalı |
| İndekslenen sayfa | Search Console | Geçiş öncesi sayıya yaklaşmalı |
| Core Web Vitals | PageSpeed Insights (mobil) | LCP < 2,5 s · CLS < 0,1 · INP < 200 ms |
| Zengin sonuçlar | Rich Results Test | `/` , `/iletisim/` (LocalBusiness + FAQPage), bir blog yazısı (Article), `/yonlendirilebilir-yatay-sondaj/` (Service) |
| Sıralama | Search Console → Performans | İlk 2-4 hafta dalgalanma normaldir |

**Eski sunucuyu en erken bir hafta sonra kapatın.** Geri dönüş gerekirse
4. adımdaki DNS kaydını geri yazmak yeterli.

---

## Geri dönüş planı

Bir sorun çıkarsa: Cloudflare → DNS → `www` kaydını 4. adımda not aldığınız
eski değere geri çevirin. Yayılma birkaç dakika. Pages projesi ve
yönlendirme kuralı dursun, zarar vermez.

---

## Sonrası: benim (Deltek'in) yapacakları

Bunlar yayına engel değil ama SEO'yu tamamlar — ayrıntısı `SEO-REHBER.md`:

1. **Ofis koordinatları ve çalışma saatleri** → `src/data/site.ts` → `OFISLER`
   (LocalBusiness şeması yerel aramada konum eşleşmesi için kullanıyor)
2. **Sosyal profiller + kuruluş yılı** → `SITE.sosyal`, `SITE.kurulus`
3. **Google Business Profile** — iki ofis için ayrı kayıt
4. **İngilizce metinlerin Deltek onayı** — şu an çeviri, doğrulanmadı
5. **Hizmet sayfalarına SSS** — "Sık sorulan sorular" başlığı + `**Soru?** Cevap`
   biçimi yeter, FAQPage şeması kendiliğinden üretilir
6. **Ekip/yazar bilgisi** — E-E-A-T; şu an her şey şirket adına

> **CMS'ten içerik düzenlerken "Son güncelleme" alanını doldurun.** Cloudflare
> depoyu shallow klonladığı için sitemap `lastmod` değerleri
> `src/data/icerik-tarihleri.json`dan geliyor; CMS o dosyayı güncellemiyor,
> `guncelleme` alanı ise onu eziyor (bkz. CLAUDE.md → Deploy hedefi).
