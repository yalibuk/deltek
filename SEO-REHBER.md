# Deltek — SEO Rehberi (site dışı ve yayın sonrası adımlar)

Site içi SEO (title/description, alt metinleri, yapısal veri, iç bağlantı,
hız) kodda tamamlandı; `npm run seo` iki dilde 72 sayfada 100/100 veriyor.
Aşağıdakiler kodla yapılamayan, **sizin** tarafınızdan yapılacak işlerdir.
Sıra önem sırasıdır; ilk 5 madde yayın haftasında bitmeli.

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

## 6. İçerik: kanibalizasyonu bitirin (ilk 3 ay)

Sitede aynı konuyu farklı terimlerle anlatan üç uzun sayfa var:
`/yatay-sondaj/`, `/yatay-delgi-nedir/`, `/yonlendirilebilir-yatay-delgi/`.
Bugün her biri kendi anahtar kelimesine odaklı; ama metinleri birbirine çok
benziyor. Yapılacak:

1. Search Console **Performans** raporunda 3 ay sonra hangi sayfanın hangi
   sorguda göründüğüne bakın.
2. İki sayfa aynı sorguda yarışıyorsa zayıf olanı güçlüye **301** ile
   yönlendirin (`public/_redirects` + CLAUDE.md tablosu) ya da metnini
   farklılaştırın (biri "fiyat/maliyet", biri "makine/teknik", biri "yöntem
   karşılaştırma" gibi).
3. Diğer sitelerinizle (`yataydelgi.com`, `yataysondaj.org`, Boremak) **aynı
   cümleleri paylaşmayın**; oradan buraya iç bağlantı verin, metin kopyalamayın.

## 7. İçerik takvimi (sürekli)

Blogda 11 yazı var; Google düzenli güncellenen siteyi tercih eder.
Ayda 1–2 yazı yeterli. Türkçe aramada boşluk olan konular:

- "yatay sondaj fiyatları / metre fiyatı nasıl hesaplanır" (sayısal örnekle)
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
