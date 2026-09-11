# `deltek.com.tr` DNS envanteri

**Ölçüm tarihi: 2026-09-12.** Kayıtlar dışarıdan, genel DNS (8.8.8.8) üzerinden
okundu. Amaç: bölge başka bir hesaba taşınırsa ya da kayıtlar elle yeniden
kurulursa hiçbir şeyin kaybolmaması.

> ## ⚠ BÖLGE BİZİM CLOUDFLARE HESABIMIZDA DEĞİL
>
> `deltek.com.tr` nameserver'ları Cloudflare (`harley` / `rosalyn.ns.cloudflare.com`)
> ama bölge `Yalibuk@gmail.com` hesabında **görünmüyor** — o hesapta yalnız
> `boremak.com`, `boremak.com.tr` ve `yataysondaj.org` var. Yani bölge
> **başka bir Cloudflare hesabında** duruyor.
>
> `YAYIN.md`'deki ADIM 4'ten itibaren her şey bu bölgeye erişim istiyor:
> DNS kaydı yedeği, Search Console TXT kaydı, DNS'in Pages'e çevrilmesi ve
> apex→www Redirect Rule. **Erişim çözülmeden yayına geçilemez.**

## Dışarıdan okunabilen kayıtlar

### Kök ve alt alan adları

Hepsi Cloudflare'in vekil (proxy) IP'lerini döndürüyor — yani turuncu bulut
açık ve gerçek sunucu IP'si gizli.

| Ad | Tür | Görünen değer |
| --- | --- | --- |
| `deltek.com.tr` | A | `104.21.34.11`, `172.67.194.176` (Cloudflare vekil) |
| `deltek.com.tr` | AAAA | `2606:4700:3035::6815:220b`, `2606:4700:3030::ac43:c2b0` |
| `www` | A/AAAA | kökle **aynı** vekil adresler |
| `mail` | A/AAAA | kökle aynı |
| `ftp` | A/AAAA | kökle aynı |
| `ns1` | A/AAAA | kökle aynı |
| `ns2` | A/AAAA | kökle aynı |

**Joker (wildcard) kayıt YOK** — rastgele alt alan adları çözümlenmiyor
(test edildi). Yani yukarıdaki beş ad tek tek tanımlı.

> Vekil IP'ler **taşınmaz**. Yeni bölgede bu adlar kendi CNAME/A kayıtlarıyla
> yeniden kurulur; gerçek kaynak sunucunun IP'si yalnız mevcut hesabın DNS
> ekranında görünür.

### E-posta — GOOGLE WORKSPACE, EN KRİTİK KISIM

| Öncelik | Sunucu |
| --- | --- |
| 1 | `aspmx.l.google.com` |
| 5 | `alt1.aspmx.l.google.com` |
| 5 | `alt2.aspmx.l.google.com` |
| 10 | `aspmx2.googlemail.com` |
| 10 | `aspmx3.googlemail.com` |

**SPF:** `v=spf1 include:_spf.google.com ~all`

> Bu beş MX kaydı ve SPF eksik taşınırsa **şirketin e-postası durur.**
> Bölgeye dokunan her işlemde önce bunlar doğrulanmalı.

### Diğer TXT

| Ad | Değer | Ne işe yarar |
| --- | --- | --- |
| `@` | `google-site-verification=cTc6VPGGFA5yMqE-xZ0DGr1hHeYCXBIsAKG_wS_Xf_M` | Google mülk doğrulaması — **Search Console zaten birinde kurulu olabilir** |
| `_dmarc` | **yok** | DMARC politikası tanımlı değil |
| DKIM | **bulunamadı** | `google`, `default`, `selector1`, `selector2`, `k1` seçicileri denendi |

## Dışarıdan OKUNAMAYAN, mevcut hesaptan alınması gerekenler

Bunlar genel DNS'e yansımıyor; yalnız bölgenin sahibi görebilir:

- ~~Vekil kayıtların arkasındaki gerçek kaynak sunucu IP'si~~ — **bulundu, aşağı bakın**
- Turuncu bulut durumları ve TTL değerleri
- Tahmin listemizde olmayan alt alan adları
- Page Rules / Redirect Rules (apex→www bunlardan biri **değil**, aşağı bakın)
- SSL/TLS modu, Always Use HTTPS, önbellek ayarları

## Kaynak sunucu — IP BULUNDU (2026-09-12)

**`94.73.146.152`** — eski Plesk sunucusu. Natro musteri panelinde
**Hosting Yonetimi -> DNS Yonetimi (deltek.com.tr)** altindaki golge DNS
bolgesinde duruyordu; o bolge yetkili degil (nameserver'lar Cloudflare) ama
hosting tarafinin kendi kayitlarini tutuyor.

Dogrulandi: `--resolve` ile dogrudan baglanildiginda canli WordPress sitesini
donduruyor (`HTTP 200`, `X-Powered-By: PHP/5.6.40`, `PleskLin`,
`Server: mcelebi.net`, dogru `<title>`).

```bash
curl -sSI -k --resolve "www.deltek.com.tr:443:94.73.146.152" https://www.deltek.com.tr/
```

Natro golge bolgesindeki diger kayitlar:

| Ad | Tur | Deger | Not |
| --- | --- | --- | --- |
| `deltek.com.tr` | A | `94.73.146.152` | **kaynak sunucu** |
| `mail.deltek.com.tr` | A | `173.194.78.121` | Google araligi |
| `ns1.deltek.com.tr` | A | `85.159.64.2` | Natro nameserver |
| `ns2.deltek.com.tr` | A | `85.159.67.2` | Natro nameserver |
| `www.deltek.com.tr` | CNAME | `deltek.com.tr.` | |
| `ftp.deltek.com.tr` | CNAME | `deltek.com.tr.` | |

> Bu IP **geri donus icin kritik**. Cloudflare bolgesi bozulursa ya da eski
> siteye donmek gerekirse `www` ve kok kaydi bu adrese cevirmek yeterli.

## Kaynak sunucu (davranis)

Kök adres bugün `https://www.deltek.com.tr/`'ye 301 veriyor ve yanıt
başlıklarında `x-powered-by: PHP/5.6.40` ile `PleskLin` var. Yani **apex→www
yönlendirmesini Cloudflare değil, arkadaki Plesk sunucusu yapıyor.** DNS
Pages'e çevrildiğinde o sunucu devreden çıkar ve yönlendirme kaybolur —
`YAYIN.md` ADIM 7'deki Redirect Rule bu yüzden atlanamaz.

## Nasıl ölçüldü

```bash
nslookup -type=SOA deltek.com.tr 8.8.8.8
nslookup -type=MX  deltek.com.tr 8.8.8.8
nslookup -type=TXT deltek.com.tr 8.8.8.8
nslookup www.deltek.com.tr 8.8.8.8      # mail, ftp, ns1, ns2 için de
nslookup rastgele-xyz-12345.deltek.com.tr 8.8.8.8   # joker testi
curl -sSI https://deltek.com.tr/         # kaynak sunucu izleri
```
