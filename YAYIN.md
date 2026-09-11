# Deltek — canlıya alma kılavuzu

Yeni site GitHub'da hazır: `github.com/yalibuk/deltek`, dal `main`.
Canlı `deltek.com.tr` bugün **WordPress/Plesk** üzerinde çalışıyor ve
`deltek.com.tr` → `www.deltek.com.tr` yönlendirmesini **o sunucu** yapıyor.

Adımlar sırayla takip edilir. **1-5 canlı siteye hiç dokunmaz**; site
ancak **6. adımda** değişir.

---

## Geçişten önce bilinmesi gerekenler

| Konu | Durum |
| --- | --- |
| Alan adı | **Zaten Cloudflare'de** (NS: `harley` / `rosalyn.ns.cloudflare.com`) — nameserver değiştirmeye gerek yok |
| apex → www 301 | **Eski Plesk sunucusunda.** DNS değişince KAYBOLUR; Cloudflare'de yeniden kurulmalı (adım 7) |
| Eski sunucu | Geri dönüş için **kapatılmamalı** (en az 1 hafta) |
| Slug'lar | Canlı sitedeki Türkçe adreslerin hepsi birebir korundu; kaldırılan sayfalar için `public/_redirects`'te 301 var |
| Eski görsel adresleri | `/wp-content/uploads/*` → `/images/uploads/:splat` 301'i var, hedef dosyalar depoda |
| Tahmini süre | 45-60 dakika (DNS yayılması dahil) |

---

# ADIM 1 — Son kontrol (yerelde, 3 dakika)

**1.1** Terminali `deltek-site` klasöründe açın.

**1.2** Derleyin ve denetleyin:

```bash
npm run seo
```

**1.3** Çıktının son üç satırını okuyun. Beklenen:

```
GENEL PUAN: 100/100
Sayfa ortalaması: 100/100 · En düşük: 89% (/404.html)
Alt eksik görsel: 0 · width/height eksik: 0 · Yetim sayfa: 0
```

100/100 değilse **durun** — `npm run seo:ayrinti` hangi sayfada ne olduğunu yazar.

**1.4** Çalışma alanının temiz olduğunu doğrulayın:

```bash
git status --short
```

Boş çıkmalı. Çıkmıyorsa commit'leyip push edin — **Cloudflare GitHub'daki hâli
derler, sizin bilgisayarınızdakini değil.**

```bash
git add -A
git commit -m "Yayin oncesi son degisiklikler"
git push origin main
```

---

# ADIM 2 — Cloudflare Pages projesini oluşturun (5 dakika)

> ## ⚠ EN SIK YAPILAN HATA: WORKERS PROJESİ OLUŞTURMAK
>
> "Create application" ekranı **Workers sekmesi açık** gelir. Orada devam
> ederseniz Cloudflare bunu bir **Worker** sanır, Astro'yu algılayıp
> `@astrojs/cloudflare` adapter'ını kendi kurar ve `wrangler deploy`
> çalıştırır. Bizim site **statik** — adapter'a ihtiyacı yok ve kurulan sürüm
> Astro 7 ile uyumsuz. Derleme şu hatayla düşer:
>
> ```
> [MISSING_EXPORT] "renderForPrerender" is not exported by
>   "node_modules/astro/dist/core/app/entrypoints/index.js"
>   ┌─[ node_modules/@astrojs/cloudflare/dist/utils/prerender.js:1:10 ]
> ...
> Failed: error occurred while running deploy command
> ```
>
> **Nasıl anlarsınız:** tarayıcı adresinde `/workers/services/view/...` yazar
> (Pages'te `/pages/view/...` olur) ve proje sekmeleri arasında **Bindings**,
> **Observability**, **Access** bulunur. Pages projesinde bunlar yoktur;
> orada **Custom domains** ve **Deployments** vardır.
>
> **Düzeltme:** o projeyi silin (**Settings** → en altta **Delete project**)
> ve aşağıdaki adımları **Pages sekmesinden** tekrarlayın. Depoda hiçbir
> değişiklik gerekmez — `package.json`da adapter yok, `astro.config.mjs`de
> `adapter`/`output` ayarı yok, `wrangler` dosyası yok. Doğrusu bu.

**2.1** [dash.cloudflare.com](https://dash.cloudflare.com) adresine girin.

**2.2** Sol menüden **Workers & Pages** → **Create application** düğmesi.

**2.3** Açılan ekranda **Pages** sekmesine geçin (varsayılan Workers'tır) →
**Connect to Git**.

**2.4** GitHub hesabınızla oturum açın. İlk kez bağlıyorsanız
**Install & Authorize** deyin; depo listesinde `yalibuk/deltek` görünmüyorsa
GitHub izin ekranında "All repositories" ya da en az `deltek` seçili olmalı.

**2.5** `yalibuk/deltek` deposunu seçin → **Begin setup**.

**2.6** "Set up builds and deployments" ekranını şöyle doldurun:

| Alan | Değer |
| --- | --- |
| Project name | `deltek` |
| Production branch | `main` |
| Framework preset | `Astro` (yoksa `None`) |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory (advanced) | *boş bırakın* |

**2.7** Environment variables bölümüne **hiçbir şey eklemeyin.** Node sürümü
depodaki `.node-version` dosyasından (22.12.0) geliyor.

**2.8** **Save and Deploy** deyin. Derleme 1-3 dakika sürer.

**2.9** Derleme günlüğünü açın ve şu satırları arayın:

```
sitemap: 70 URL'ye lastmod, 70 URL'ye hreflang eklendi
rss: /rss.xml (11 yazı)
llms.txt yazıldı
73 page(s) built
```

**2.10** Günlükte şu uyarı **ÇIKMAMALI**:
`git geçmişi yok ve src/data/icerik-tarihleri.json bulunamadı`.
Çıkarsa tarih dosyası commit'lenmemiş demektir; adım 1.4'e dönün.

**2.11** Derleme başarısızsa en sık iki sebep: Node sürümü (günlükte
`engine` hatası) ya da eksik commit. Günlüğün son 20 satırını okuyun.

---

# ADIM 3 — `pages.dev` adresinde test edin (15 dakika, canlı site etkilenmez)

Pages size `deltek.pages.dev` adresini verdi. **Hata bulmanın ucuz olduğu son
an burasıdır.**

> ## ⚠ `pages.dev` TÜRKİYE'DEN ENGELLİ — test için geçici alt alan adı açın
>
> Bu ağdan `*.pages.dev` ve `*.workers.dev` adreslerinin **tamamı** TCP
> seviyesinde sıfırlanıyor (`Connection was reset`). Siteyle ilgisi yok:
> var olmayan bir `pages.dev` adresi de aynı hatayı veriyor, buna karşılık
> normal Cloudflare siteleri (`developers.cloudflare.com`) 200 dönüyor.
> Engelleme aralıklı — bir koşu tamamen geçip bir sonraki baştan sona
> çökebiliyor, yani "bir kere çalıştı" güvenilir değil. 2026-09-12'de ölçüldü.
>
> Belirtisi: betik her sayfaya `✗ ulaşılamadı` diyor, sayfa hatası
> göstermiyor. Bu bir dağıtım hatası DEĞİLDİR.
>
> **Çözüm — `yeni.deltek.com.tr` alt alan adını Pages projesine bağlayın:**
>
> 1. Pages projesi → **Custom domains** → **Set up a custom domain**
> 2. `yeni.deltek.com.tr` yazın → **Continue** → **Activate domain**
> 3. Listede göründüğünde durumunun **Active** olmasını bekleyin (birkaç dakika)
> 4. **DNS kaydını DOĞRULAYIN.** Pages normalde kaydı kendi ekler ama
>    eklemediği oluyor. `deltek.com.tr` → **DNS** → **Records**'ta şu kayıt
>    olmalı:
>
>    | Type | Name | Target | Proxy |
>    | --- | --- | --- | --- |
>    | `CNAME` | `yeni` | `deltek.pages.dev` | **Proxied** (turuncu bulut) |
>
>    Yoksa **Add record** ile elle ekleyin. Hedefin `pages.dev` olması sorun
>    değil: çözümleme Cloudflare kenarında yapılıyor, tarayıcı `pages.dev`
>    adresine hiç bağlanmıyor, dolayısıyla engel devreye girmiyor.
>
> 5. Kaydın yayıldığını teyit edin — çıktı bir adres vermeli:
>
> ```bash
> nslookup yeni.deltek.com.tr
> ```
>
> 6. Testleri bu adrese karşı çalıştırın:
>
> ```bash
> npm run yayin -- https://yeni.deltek.com.tr
> ```
>
> Betik başarısız olursa özetin altında sebebi yazar: `ENOTFOUND` DNS kaydı
> yok demek, `ECONNRESET` ağ engeli demek. İkisi ekranda aynı görünüyordu
> (`ulaşılamadı`), artık ayrılıyor.
>
> **`www` ve kök kayda dokunulmuyor, canlı site etkilenmiyor.** Betik
> canonical'ı sabit `https://www.deltek.com.tr` ile karşılaştırdığı için
> hangi adresten test ettiğiniz sonucu değiştirmez.
>
> Yayın sonrası bu alt alan adını **Custom domains**'ten kaldırın. Arama
> motorlarına karşı riski düşük (tüm canonical'lar `www`yi gösteriyor) ama
> gereksiz bir ikiz kopya bırakmanın anlamı yok.

**3.0 — Önce otomatik denetim.** Tek komut 60'tan fazla şeyi kontrol eder:
sayfa durum kodları (TR + EN), 301 yönlendirmeleri ve hedefleri, teknik
dosyalar, güvenlik ve önbellek başlıkları, 404 sayfaları, canonical + hreflang
eşleşmesi, sitemap'te lastmod/hreflang/noindex, eski `uploads/` ve Google Fonts
kalıntıları.

```bash
npm run yayin -- https://deltek.pages.dev
```

Hepsi `✓` olmalı. Bir şey `✗` çıkarsa özet listesinde nedeniyle görünür.

Sonra gözle bakın — betik düzeni ve görünümü göremez:

**3.1** Bu sayfaları tek tek açın:

- [ ] `/` — hero slider dönüyor mu, menü, footer
- [ ] `/hizmetlerimiz/` — kart ızgaraları
- [ ] `/yatay-sondaj-teknoloji/` — bölüm haritası
- [ ] `/yonlendirilebilir-yatay-sondaj/` — yan menü, sayfa altı gezinme
- [ ] `/iletisim/` — telefon/e-posta kartları, ofis kartları
- [ ] `/blog/` ve bir blog yazısı
- [ ] `/referanslar/` — logo şeridi kayıyor mu

**3.2** İngilizce tarafı:

- [ ] `/en/`
- [ ] `/en/contact/`
- [ ] `/en/horizontal-directional-drilling/`
- [ ] `/en/services/`

**3.3** Dil değiştiriciyi **iki yönde de** deneyin: `/iletisim/` sayfasında
EN'e basın → `/en/contact/` açılmalı. Oradan TR'ye basın → `/iletisim/`e
dönmeli.

**3.4** Telefonunuzdan (ya da tarayıcı geliştirici araçlarında mobil görünümde)
bakın:

- [ ] Ana sayfa hero'su — yazı üstte, fotoğraf kuşağı altta
- [ ] Menü açılıyor mu
- [ ] `/iletisim/` — telefon butonuna basılıyor mu

**3.5** Teknik dosyalar açılıyor mu:

- [ ] `/sitemap-index.xml`
- [ ] `/robots.txt`
- [ ] `/rss.xml` ve `/en/rss.xml`
- [ ] `/llms.txt`

**3.6** Olmayan bir adres deneyin (`/xyz/`) — 404 sayfası çıkmalı, boş sayfa değil.
Aynısını `/en/xyz/` için de yapın.

**3.7** CMS panelini açın: `/admin/`. Giriş ekranı gelmeli.

> **`pages.dev` adresi hakkında.** Cloudflare önizleme dağıtımlarına
> kendiliğinden `noindex` ekliyor ama **üretim** `pages.dev` adresine
> eklemiyor. Bizde sorun değil: her sayfa `<link rel="canonical">` ile
> `www.deltek.com.tr`yi gösteriyor, Google onu tercih eder. Yine de
> `pages.dev` adresini kimseyle paylaşmayın.

---

# ADIM 4 — Mevcut DNS kaydını NOT ALIN (2 dakika, atlamayın)

> ## ⛔ ÖNCE ERİŞİM: BÖLGE BİZİM HESABIMIZDA DEĞİL (2026-09-12)
>
> `deltek.com.tr` nameserver'ları Cloudflare (`harley` / `rosalyn.ns.cloudflare.com`)
> ama bölge `Yalibuk@gmail.com` hesabında **görünmüyor**; o hesapta yalnız
> `boremak.com`, `boremak.com.tr`, `yataysondaj.org` var. Bölge **başka bir
> Cloudflare hesabında**.
>
> **Bu adımdan sonraki her şey o bölgeye erişim istiyor:** DNS yedeği (4),
> Search Console TXT kaydı (5), DNS'in Pages'e çevrilmesi (6), apex→www
> Redirect Rule (7). Test alt alan adı `yeni.deltek.com.tr` de aynı sebeple
> eklenemedi.
>
> Mevcut kayıtların dışarıdan okunabilen envanteri: **`DNS-ENVANTER.md`**.
> **E-posta Google Workspace üzerinde** — beş MX kaydı ve SPF kaybolursa
> şirketin e-postası durur. Bölgeye dokunan her işlemde önce bunlar
> doğrulanmalı.
>
> ### İki yol var
>
> **A — Mevcut hesaba erişim alın (tercih edilen).** Bölgeyi tutan hesap
> büyük olasılıkla eski siteyi işleten firmada: kaynak sunucu Plesk + PHP 5.6
> ve apex→www yönlendirmesini o sunucu yapıyor. Onlardan istenecek:
> Cloudflare hesabına **Member** olarak eklenmek, ya da bölgeyi
> **Yalibuk@gmail.com** hesabına devretmeleri (Cloudflare'de hesaplar arası
> bölge taşıma var, kayıtlar ve ayarlar korunur).
>
> **B — Bölgeyi sıfırdan bu hesaba kurun.** `Add domain` ile `deltek.com.tr`
> eklenir, Cloudflare yeni bir nameserver çifti verir ve bu çift **alan adı
> kayıt kuruluşunda (registrar)** değiştirilir. Registrar erişimi gerekir.
>
> > **B yolunun riski:** vekillenmiş (turuncu bulut) bir bölge dışarıdan tam
> > olarak okunamaz. Cloudflare'in tarayıcısı bazı kayıtları kaçırır ve
> > eksik kalanı kimse fark etmez — en tehlikelisi MX/SPF, yani e-posta.
> > `DNS-ENVANTER.md` dışarıdan görünen her şeyi tutuyor ama **gerçek kaynak
> > sunucu IP'si dışarıdan görünmüyor**; o olmadan eski siteye geri dönüş
> > planı da çalışmaz. A yolu bu yüzden tercih edilir.
>
> Erişim çözülene kadar aşağıdaki adımlar yapılamaz. Site tarafında
> yapılabilecek her şey bitti: `deltek.pages.dev` yayında ve doğrulandı.

Bu, geçiş sorun çıkarırsa geri dönüş planınız.

**4.1** Cloudflare panelinde sol üstten hesabınıza, oradan **`deltek.com.tr`**
alan adına girin.

**4.2** **DNS** → **Records** sekmesini açın.

**4.3** Şu iki kaydın **ekran görüntüsünü alın** ya da bir yere yazın:

| Ne | Not alınacaklar |
| --- | --- |
| `www` kaydı | Type (A / CNAME), Content (IP ya da hedef), Proxy durumu (turuncu bulut açık mı) |
| Kök kayıt (`deltek.com.tr` ya da `@`) | Aynı bilgiler |

**4.4** Diğer kayıtlara **dokunmayın** — özellikle `MX` (e-posta) kayıtları.
Bu geçiş e-postayı etkilemez, ama yanlışlıkla silinmesin.

---

# ADIM 4B — Bölgeyi kendi hesabınıza kurun (B yolu, seçilen)

Kullanıcı 2026-09-12'de B yolunu seçti: bölge `Yalibuk@gmail.com` hesabına
sıfırdan kurulacak, sonra alan adı kayıt kuruluşunda (registrar) nameserver
çifti değiştirilecek.

**Sıra önemli. Nameserver'ı EN SONA bırakın** — yeni bölge eksikken NS
değiştirilirse site de e-posta da aynı anda düşer.

## 4B.0 — Önce şunu deneyin: Cloudflare eklemeyi reddedebilir

`deltek.com.tr` şu anda **başka bir Cloudflare hesabında aktif**. Cloudflare
aynı alan adını ikinci bir hesaba eklemeyi reddedebiliyor ("already
associated with another account" benzeri bir hata).

**Add domain** deyip ne olduğuna bakın:

* Kabul ederse (bölge `Pending Nameserver Update` durumunda açılır) → devam.
* Reddederse B yolu tek başına yürümez: eski hesabın bölgeyi bırakması ya da
  devretmesi gerekir, yani yine o tarafla iletişim şart. Bu durumda A yoluna
  dönün (bkz. ADIM 4 kutusu).

## 4B.1 — Alan adını ekleyin

**Account home** → **Add domain** → `deltek.com.tr` → **Free** planı seçin.

## 4B.2 — İÇE AKTARILAN A/AAAA KAYITLARINI SİLİN (tuzak)

Cloudflare ekledikten sonra genel DNS'i tarayıp bulduklarını kayıt olarak
içe aktarır. **Burada bulacağı adresler Cloudflare'in kendi vekil IP'leri**
(`104.21.34.11`, `172.67.194.176` ve IPv6 karşılıkları) — çünkü bölge zaten
vekilleniyor. Bunlar A kaydı olarak bırakılırsa site açılmaz; Cloudflare
kendi adresine yönlenmiş bir kayda `Error 1000` verir.

**Silin:** kök (`@`) ve `www` için içe aktarılmış tüm `A` ve `AAAA` kayıtları.
Doğrusunu 4B.4'te Pages kendisi oluşturacak.

`mail`, `ftp`, `ns1`, `ns2` içe aktarıldıysa **onları da silin.** Ölçüldü
(2026-09-12): `mail` → 525, `ns1`/`ns2` → 522, yani üçü zaten bozuk; `ftp`
yalnızca Plesk'in varsayılan sayfasını döndürüyor ve FTP protokolü (port 21)
bağlantı zaman aşımına uğruyor. Sertifika şeffaflık kayıtlarında da yalnız
`deltek.com.tr` ve `www.deltek.com.tr` var. Yani bu dördünü taşımamak
hiçbir şey kaybettirmiyor.

## 4B.3 — E-POSTA KAYITLARINI KURUN (en kritik adım)

**Şirketin e-postası Google Workspace üzerinde.** Bu yedi kayıt eksik
kalırsa e-posta durur. Elle ekleyin:

| Tür | Ad | İçerik | Öncelik |
| --- | --- | --- | --- |
| `MX` | `@` | `aspmx.l.google.com` | 1 |
| `MX` | `@` | `alt1.aspmx.l.google.com` | 5 |
| `MX` | `@` | `alt2.aspmx.l.google.com` | 5 |
| `MX` | `@` | `aspmx2.googlemail.com` | 10 |
| `MX` | `@` | `aspmx3.googlemail.com` | 10 |
| `TXT` | `@` | `v=spf1 include:_spf.google.com ~all` | — |
| `TXT` | `@` | `google-site-verification=cTc6VPGGFA5yMqE-xZ0DGr1hHeYCXBIsAKG_wS_Xf_M` | — |

Son TXT kaydı bir Google mülk doğrulaması; silinirse birinin Search Console
ya da Workspace doğrulaması düşebilir. Ne işe yaradığı belirsiz olduğu için
**aynen taşınıyor.**

Kaydettikten sonra listeyi bir kez daha okuyup yukarıdaki tabloyla
karşılaştırın. Bu adımda acele etmeyin.

## 4B.4 — Siteyi bağlayın

Pages projesi (`deltek`) → **Custom domains** → **Set up a custom domain**:

1. `www.deltek.com.tr` ekleyin
2. `deltek.com.tr` ekleyin

Bölge artık **aynı hesapta** olduğu için Cloudflare gerekli CNAME kayıtlarını
kendisi oluşturur ve turuncu bulutu açar — `yeni.deltek.com.tr` denemesindeki
elle CNAME ekranı çıkmaz. Çıkarsa kaydı elle ekleyin: `CNAME`, hedef
`deltek.pages.dev`, **Proxied**.

## 4B.5 — apex → www yönlendirme kuralı (ADIM 7 buraya çekildi)

`deltek.com.tr` → `www.deltek.com.tr` 301'ini bugün **eski Plesk sunucusu**
yapıyor (ölçüldü: 301 yanıtında `x-powered-by: PleskLin`). Nameserver
değişince o sunucu devreden çıkar ve **yönlendirme kaybolur.** Kuralı
NS değişikliğinden ÖNCE kurun; ayrıntılı adımlar ADIM 7'de.

## 4B.6 — SSL/TLS modu

Bölge → **SSL/TLS** → **Overview** → **Full (strict)**. Pages geçerli
sertifika sunuyor, daha gevşek bir mod gereksiz.

## 4B.7 — NS'İ DEĞİŞTİRMEDEN ÖNCE YENİ BÖLGEYİ DOĞRUDAN TEST EDİN

**Bu adım B yolunun tüm riskini alır.** Cloudflare size iki yeni nameserver
verdi. Bölge henüz canlı değil ama o sunucuları **doğrudan** sorgulayarak
yeni yapılandırmayı tam olarak görebilirsiniz:

```bash
NS=size-verilen-ad.ns.cloudflare.com
nslookup -type=MX  deltek.com.tr $NS
nslookup -type=TXT deltek.com.tr $NS
nslookup www.deltek.com.tr $NS
nslookup deltek.com.tr $NS
```

Beklenen: beş MX kaydı, iki TXT kaydı, `www` ve kök için cevap. Eksik bir şey
varsa **burada düzeltin** — canlıya geçtikten sonra düzeltmek çok daha pahalı.

## 4B.8 — Registrar'da nameserver'ları değiştirin

Alan adının kayıt kuruluşunda nameserver çiftini Cloudflare'in verdiği yeni
çiftle değiştirin.

> **ESKİ DEĞERLERİ ŞİMDİ NOT ALIN — geri dönüş planınız bu:**
>
> ```
> harley.ns.cloudflare.com
> rosalyn.ns.cloudflare.com
> ```

`.tr` tarafında yayılma birkaç saat sürebilir. Bu süre boyunca bazı
ziyaretçiler eski, bazıları yeni siteyi görür; ikisi de çalıştığı için sorun
değil.

## 4B.9 — Doğrulama

```bash
npm run yayin -- https://www.deltek.com.tr
```

Ayrıca **e-postayı mutlaka test edin**: dışarıdaki bir adresten şirket
adresine bir e-posta gönderin ve ulaştığını görün. DNS geçişlerinde en sık
gözden kaçan şey budur.

## Geri dönüş

Registrar'da nameserver'ları `harley` / `rosalyn.ns.cloudflare.com` olarak
geri alın. Eski bölge diğer hesapta **olduğu gibi duruyor**, tüm kayıtlarıyla
birlikte devreye geri girer.

> **Eski bölgeyi kimseye SİLDİRMEYİN.** Geri dönüş planınız o. Hem eski
> sitenin gerçek sunucu IP'si yalnız orada görünüyor — dışarıdan okunamıyor.

---

# ADIM 5 — Google Search Console'u hazırlayın (10 dakika)

Henüz kurulu değilse **şimdi** kurun: geçişin etkisini ölçebilmek için
öncesine ait veriye ihtiyacınız var.

**5.1** [search.google.com/search-console](https://search.google.com/search-console)
adresine girin.

**5.2** **Mülk ekle** → **Alan adı** (Domain) türünü seçin → `deltek.com.tr` yazın.

**5.3** Doğrulama için bir TXT kaydı isteyecek. Cloudflare DNS → **Records** →
**Add record** → Type `TXT`, Name `@`, Content olarak Google'ın verdiği değeri
yapıştırın → **Save**.

**5.4** Search Console'a dönüp **Doğrula** deyin. Cloudflare'de kayıt anında
yayıldığı için genelde ilk denemede geçer.

**5.5** Sol menüden **Sayfalar** raporunu açın. **Dizine eklendi** sayısını
bir yere yazın — geçişten sonra bu sayının korunması gerekiyor.

**5.6** **Performans** raporunda son 3 ayın toplam tıklama sayısını da not alın.

---

# ADIM 6 — Özel alan adını bağlayın (5 dakika) — **SİTE BU ADIMDA DEĞİŞİR**

> **B yolunu izliyorsanız bu adım 4B.4'te yapıldı.** Orada alan adı bölgeye
> nameserver değişikliğinden ÖNCE bağlanıyor; sitenin değiştiği an bu adım
> değil, **4B.8'deki nameserver değişikliği** oluyor. Aşağısı A yolu (bölge
> zaten erişilebilir hesapta) için duruyor.

**6.1** Cloudflare → **Workers & Pages** → `deltek` projesine girin.

**6.2** **Custom domains** sekmesi → **Set up a domain**.

**6.3** `www.deltek.com.tr` yazın → **Continue**.

**6.4** Cloudflare size oluşturacağı DNS kaydını gösterir (mevcut kaydın
yerine geçecek bir `CNAME`). Onaylayın.

**6.5** Durum `Active` olana kadar bekleyin — genelde 1-3 dakika, sertifika
için bazen 10 dakikaya kadar çıkabilir.

**6.6** Tarayıcıda `https://www.deltek.com.tr/` açın. **Yeni site gelmeli.**

**6.7** Terminalden doğrulayın:

```bash
curl -sI https://www.deltek.com.tr/ | grep -iE "^HTTP|^server|^x-powered"
```

Beklenen: `HTTP/2 200` ve `server: cloudflare`.
**`x-powered-by: PHP` satırı ÇIKMAMALI** — çıkıyorsa hâlâ eski sunucuya
gidiyorsunuz, birkaç dakika daha bekleyin.

---

# ADIM 7 — apex → www yönlendirmesini kurun (5 dakika) — **ATLAMAYIN**

Bu yapılmazsa `deltek.com.tr` (www'suz) ya çalışmaz ya da www ile **ikiz
içerik** üretir. İkisi de SEO kaybı.

> **B yolunda bu kural nameserver değişikliğinden ÖNCE kurulur** (4B.5).
> Sebebi: apex→www 301'ini bugün eski Plesk sunucusu veriyor ve nameserver
> değişince kaybolur. Sonraya bırakılırsa arada bir boşluk oluşur.

**7.1** Önce apex için proxy'li bir DNS kaydı olduğundan emin olun.
Cloudflare → `deltek.com.tr` → **DNS** → **Records**.

Kök kayıt (`@` ya da `deltek.com.tr`) varsa **turuncu bulut açık** (Proxied)
olmalı. Yoksa ekleyin:

| Alan | Değer |
| --- | --- |
| Type | `AAAA` |
| Name | `@` |
| IPv6 address | `100::` |
| Proxy status | **Proxied** (turuncu) |

> `100::` kara delik adresidir; trafik oraya hiç gitmez, Cloudflare isteği
> proxy katmanında yakalayıp yönlendirme kuralını uygular. Yönlendirme
> kuralları yalnızca **proxy'li** trafikte çalışır.

**7.2** Sol menüden **Rules** → **Overview** → **Create rule** →
**Redirect Rule**.

**7.3** Kuralı şöyle doldurun:

| Alan | Değer |
| --- | --- |
| Rule name | `apex → www` |
| When incoming requests match | **Wildcard pattern** |
| Request URL | `http*://deltek.com.tr/*` |
| Then / Type | **Dynamic** ya da **Wildcard** |
| Target URL | `https://www.deltek.com.tr/${1}` |
| Status code | **301** |
| Preserve query string | ✅ açık |

**7.4** **Deploy** deyin.

**7.5** Doğrulayın — yalnız ana sayfa değil, **yol da korunmalı**:

```bash
curl -sI https://deltek.com.tr/iletisim/ | grep -iE "^HTTP|^location"
```

Beklenen:

```
HTTP/2 301
location: https://www.deltek.com.tr/iletisim/
```

`location: https://www.deltek.com.tr/` (yolsuz) gelirse kuralda `${1}`
eksiktir — 7.3'e dönün.

---

# ADIM 8 — Geçiş sonrası doğrulama (10 dakika)

**8.1** Aynı betiği bu kez canlı adrese karşı çalıştırın:

```bash
npm run yayin -- https://www.deltek.com.tr
```

Bu sefer **hepsi geçmeli** — adım 3'te yalnız Cloudflare'de çalışan
yönlendirme ve başlık testleri de dahil. `ÖZET  geçen: 72 · kalan: 0` görün.

**8.2** apex yönlendirmesini ayrıca doğrulayın (betik yalnız verilen adresi
denetler):

```bash
curl -sI https://deltek.com.tr/iletisim/ | grep -iE "^HTTP|^location"
```

**8.3** Tarayıcıda son bir tur: ana sayfa, bir teknoloji sayfası, iletişim,
telefondan ana sayfa.

---

# ADIM 9 — Arama motorlarına haber verin (10 dakika)

**9.1** Search Console → **Site haritaları** → `sitemap-index.xml` yazıp
**Gönder**.

**9.2** Search Console → üstteki arama kutusuna `https://www.deltek.com.tr/`
yazıp **URL Denetimi** → **Dizine eklenmeyi iste**.

**9.3** Aynısını şu 4 sayfa için tekrarlayın:

- `/hizmetlerimiz/`
- `/yonlendirilebilir-yatay-sondaj/`
- `/iletisim/`
- `/en/`

**9.4** [bing.com/webmasters](https://www.bing.com/webmasters) → siteyi ekleyin.
**Import from Google Search Console** seçeneği iki dakikada halleder.

**9.5** Bing'de de sitemap gönderin.

**9.6** IndexNow ile anında bildirin:

```bash
npm run build && npm run indexnow
```

Beklenen: `70 URL gönderildi → HTTP 200 OK` (ya da `202`).

> Bing dizinini ChatGPT ve Copilot da kullanıyor. Bu adım yapay zekâ
> aramalarında görünürlük için Google kadar önemli.

**9.7** Bundan sonra **her içerik güncellemesinden sonra** 9.6'yı tekrarlayın.

---

# ADIM 10 — İlk hafta izleme

| Ne zaman | Ne | Nerede | Beklenen |
| --- | --- | --- | --- |
| 1. gün | Tarama hataları | Search Console → Sayfalar | 404 artışı yok |
| 1. gün | Core Web Vitals | PageSpeed Insights (mobil) | LCP < 2,5 s · CLS < 0,1 · INP < 200 ms |
| 1. gün | Zengin sonuçlar | Rich Results Test | aşağıdaki 4 adres |
| 3. gün | İndekslenen sayfa | Search Console | artmaya başlamalı |
| 7. gün | İndekslenen sayfa | Search Console | adım 5.5'teki sayıya yaklaşmalı |
| 7. gün | Eski sunucu | — | **artık kapatılabilir** |
| 14-28. gün | Sıralama | Search Console → Performans | dalgalanma normaldir |

**10.1** Rich Results Test ([search.google.com/test/rich-results](https://search.google.com/test/rich-results))
ile şu dört adresi ayrı ayrı deneyin:

| Adres | Beklenen şema |
| --- | --- |
| `https://www.deltek.com.tr/` | Organization, WebSite, ItemList |
| `https://www.deltek.com.tr/iletisim/` | LocalBusiness (2 adet), FAQPage |
| `https://www.deltek.com.tr/gunde-1-km/` | Article (şemada `BlogPosting`), BreadcrumbList |
| `https://www.deltek.com.tr/yonlendirilebilir-yatay-sondaj/` | Service, WebPage |

"Uyarı" (warning) çoğunlukla isteğe bağlı alanlar içindir, sorun değil.
**"Hata" (error) varsa** bana bildirin.

**10.2** PageSpeed Insights'ta mobil puanı ölçün. Üçüncü taraf istek olarak
Google Fonts **görünmemeli** — yazı tipleri artık kendi sunucumuzdan geliyor.

**10.3** Search Console'da **Sayfalar → Dizine eklenmedi** listesine bakın.
Orada yalnız `/404.html`, `/en/404.html` ve `/admin/` olmalı.

---

## Geri dönüş planı

Ciddi bir sorun çıkarsa:

1. Cloudflare → `deltek.com.tr` → **DNS** → **Records**
2. `www` kaydını **adım 4.3'te not aldığınız** eski değere geri çevirin
3. Yayılma birkaç dakika

Pages projesi ve yönlendirme kuralı dursun, zarar vermezler.

---

## Sonrası: Deltek'in yapacakları

Yayına engel değil, SEO'yu tamamlar. Ayrıntısı `SEO-REHBER.md`:

1. **Ofis koordinatları ve çalışma saatleri** → `src/data/site.ts` → `OFISLER`
2. **Sosyal profiller + kuruluş yılı** → `SITE.sosyal`, `SITE.kurulus`
3. **Google Business Profile** — İzmir ve İstanbul için ayrı kayıt
4. **İngilizce metinlerin Deltek onayı** — şu an çeviri, doğrulanmadı
5. **Hizmet sayfalarına SSS** — "Sık sorulan sorular" başlığı + `**Soru?** Cevap`
   biçimi yeter, FAQPage şeması kendiliğinden üretilir
6. **Ekip/yazar bilgisi** — E-E-A-T; şu an her şey şirket adına

> **CMS'ten içerik düzenlerken "Son güncelleme" alanını doldurun.** Cloudflare
> depoyu shallow klonladığı için sitemap `lastmod` değerleri
> `src/data/icerik-tarihleri.json`dan geliyor; CMS o dosyayı güncellemiyor,
> `guncelleme` alanı ise onu eziyor (bkz. CLAUDE.md → Deploy hedefi).
