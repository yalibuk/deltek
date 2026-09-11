/**
 * Yayın doğrulaması — bir adresteki canlı siteyi baştan sona denetler.
 *
 *   npm run yayin -- https://deltek.pages.dev        # Pages testi (YAYIN.md adım 3)
 *   npm run yayin -- https://www.deltek.com.tr       # canlı doğrulama (adım 8)
 *
 * Ölçülenler: sayfa durum kodları (TR + EN), 301 yönlendirmeleri ve HEDEFLERİ,
 * teknik dosyalar, güvenlik/önbellek başlıkları, 404, canonical + hreflang
 * eşleşmesi, sitemap'te lastmod/hreflang, kalıntı `/images/uploads/` bağlantısı,
 * Google Fonts kalıntısı.
 *
 * Bağımlılık yok (Node 22+ fetch). Bir hata varsa çıkış kodu 1.
 *
 * `_redirects` ve `_headers` YALNIZCA Cloudflare'de çalışır — yerel bir statik
 * sunucuda bu iki grup başarısız çıkar, beklenen budur.
 */
const temel = (process.argv[2] || '').replace(/\/$/, '');
if (!temel.startsWith('http')) {
  console.error('Kullanım: npm run yayin -- https://deltek.pages.dev');
  process.exit(1);
}
const KANONIK = 'https://www.deltek.com.tr';

const TR = ['/', '/hakkimizda/', '/hizmetlerimiz/', '/yatay-sondaj-teknoloji/',
  '/yonlendirilebilir-yatay-sondaj/', '/yonlendirilebilir-yatay-sondaj-nedir/', '/boru-surmecakma/',
  '/boru-yenileme/', '/akilli-altyapi/', '/delgi-tijleri/', '/iletisim/', '/referanslar/',
  '/blog/', '/gunde-1-km/', '/4058-metre-dunya-rekoru/'];
const EN = ['/en/', '/en/about/', '/en/services/', '/en/trenchless-technologies/',
  '/en/horizontal-directional-drilling/', '/en/what-is-hdd/', '/en/pipe-jacking-auger-boring/',
  '/en/pipe-bursting/', '/en/smart-undergrounding/', '/en/hdd-drill-rods/', '/en/contact/',
  '/en/references/', '/en/blog/', '/en/1-km-hdd-a-day/'];
const DOSYALAR = ['/sitemap-index.xml', '/sitemap-0.xml', '/robots.txt', '/rss.xml',
  '/en/rss.xml', '/llms.txt', '/manifest.webmanifest', '/apple-touch-icon.png',
  '/favicon.ico', '/og-image.jpg', '/7f3c9a1e4b8d2f6a0c5e9b7d3a1f8c2e.txt'];
/** [istenen yol, 301 hedefinin içermesi gereken parça] */
const YONLENDIRME = [
  ['/mikrotunel-nedir/', '/boru-surmecakma/'],
  ['/auger-boring-nedir-modern-yatay-delgi-teknolojisi/', '/boru-surmecakma/'],
  ['/boru-surme-boru-cakma-auger-boring/', '/boru-surmecakma/'],
  ['/yatay-sondaj-kazisiz-yatay-delgi/', '/yonlendirilebilir-yatay-sondaj-nedir/'],
  ['/kazisiz-altyapi-ve-kazisiz-teknolojiler/', '/yatay-sondaj-teknoloji/'],
  ['/medyalar/', '/deltek-yatay-sondaj-kaya-delgi-rock-drilling/'],
  ['/feed/', '/blog/'],
  ['/wp-login.php', '/'],
  ['/2017/11/eski-yazi/', '/blog/'],
  ['/wp-content/uploads/2015/08/018.jpg', '/images/uploads/2015/08/018.jpg'],
  // 2026-09-12: canlı site taranarak bulundu. Hepsi bugün deltek.com.tr'de
  // 200 dönüyor, yani Google dizininde olabilirler.
  ['/sitemap.xml', '/sitemap-index.xml'],          // Search Console'a KAYITLI adres
  ['/wp-sitemap.xml', '/sitemap-index.xml'],
  ['/kategori/genel/', '/blog/'],                  // WP kategori arşivleri
  ['/kategori/yonlendirilebilir-yatay-sondaj-hdd/', '/blog/'],
  ['/author/admin/', '/blog/'],                    // WP yazar arşivi
  ['/home1/', '/'],
  ['/comments/feed/', '/blog/'],
  ['/hakkimizda/feed/', '/hakkimizda/'],           // sayfa başına WP yorum akışı
];
const BASLIKLAR = ['strict-transport-security', 'x-content-type-options', 'x-frame-options',
  'referrer-policy', 'permissions-policy'];

let gecti = 0, kaldi = 0, ulasilamadi = 0;
const sorunlar = [];
const ok = (ad) => { gecti++; };
const hata = (ad, ayrinti) => {
  kaldi++;
  if (ayrinti === 'ulaşılamadı') ulasilamadi++;
  sorunlar.push(`${ad}${ayrinti ? ' — ' + ayrinti : ''}`);
};

/**
 * Ulasilamayan isteklerin ALTTAKI sebebini sayar. "ulaşılamadı" tek basina
 * yaniltici: DNS kaydinin hic olmamasi (ENOTFOUND) ile baglantinin
 * sifirlanmasi (ECONNRESET) bambaska iki sorun, ikisi de ayni satiri basiyordu.
 */
const nedenler = new Map();
function nedenKodu(e) {
  for (let h = e; h; h = h.cause) if (h.code) return h.code;
  return e?.name === 'TimeoutError' ? 'TIMEOUT' : 'BILINMEYEN';
}

/**
 * Kararsız ağlara karşı: 3 deneme, artan bekleme.
 * Gövde HER ZAMAN okunur — okunmadan bırakılan yanıt soketi açık tutuyor ve
 * Node'un HTTP istemcisi bazı sunucularda `assert(!this.paused)` ile çöküyor.
 */
async function iste(yol, opts = {}) {
  for (let i = 0; i < 3; i++) {
    try {
      const r = await fetch(temel + yol, { redirect: 'manual', signal: AbortSignal.timeout(30000), ...opts });
      const govde = await r.text().catch(() => '');
      return { status: r.status, headers: r.headers, govde };
    } catch (e) {
      if (i === 2) {
        const k = nedenKodu(e);
        nedenler.set(k, (nedenler.get(k) || 0) + 1);
        throw e;
      }
      await new Promise(r => setTimeout(r, 1500 * (i + 1)));
    }
  }
}

const bolum = (ad) => console.log(`\n\x1b[1m${ad}\x1b[0m`);
const satir = (durum, ad, not = '') =>
  console.log(`  ${durum ? '\x1b[32m✓\x1b[0m' : '\x1b[31m✗\x1b[0m'} ${ad}${not ? '  \x1b[2m' + not + '\x1b[0m' : ''}`);

console.log(`\nYayın doğrulaması — ${temel}`);

// ── 1. Sayfalar ───────────────────────────────────────────────────────────
for (const [ad, liste] of [['Türkçe sayfalar', TR], ['İngilizce sayfalar', EN]]) {
  bolum(ad);
  for (const y of liste) {
    try {
      const r = await iste(y);
      const iyi = r.status === 200;
      satir(iyi, y, iyi ? '' : `HTTP ${r.status}`);
      iyi ? ok() : hata(`${y}`, `HTTP ${r.status}`);
    } catch (e) { satir(false, y, 'ulaşılamadı'); hata(y, 'ulaşılamadı'); }
  }
}

// ── 2. Teknik dosyalar ────────────────────────────────────────────────────
bolum('Teknik dosyalar');
for (const y of DOSYALAR) {
  try {
    const r = await iste(y);
    const iyi = r.status === 200;
    satir(iyi, y, iyi ? '' : `HTTP ${r.status}`);
    iyi ? ok() : hata(y, `HTTP ${r.status}`);
  } catch { satir(false, y, 'ulaşılamadı'); hata(y, 'ulaşılamadı'); }
}

// ── 3. 301 yönlendirmeleri (yalnız Cloudflare) ────────────────────────────
bolum('301 yönlendirmeleri  \x1b[2m(yalnız Cloudflare\'de çalışır)\x1b[0m');
for (const [y, beklenen] of YONLENDIRME) {
  try {
    const r = await iste(y);
    const hedef = r.headers.get('location') || '';
    const iyi = (r.status === 301 || r.status === 308) && hedef.includes(beklenen);
    satir(iyi, y, iyi ? `→ ${hedef}` : `HTTP ${r.status} → ${hedef || '(yok)'} · beklenen ${beklenen}`);
    iyi ? ok() : hata(y, `HTTP ${r.status} → ${hedef || 'yönlendirme yok'}`);
  } catch { satir(false, y, 'ulaşılamadı'); hata(y, 'ulaşılamadı'); }
}

// ── 4. Başlıklar (yalnız Cloudflare) ──────────────────────────────────────
bolum('Güvenlik ve önbellek başlıkları  \x1b[2m(yalnız Cloudflare\'de)\x1b[0m');
try {
  const r = await iste('/');
  for (const b of BASLIKLAR) {
    const v = r.headers.get(b);
    satir(!!v, b, v || 'yok');
    v ? ok() : hata(`başlık ${b}`, 'yok');
  }
  const hsts = r.headers.get('strict-transport-security') || '';
  const alt = hsts.includes('includeSubDomains');
  satir(alt, 'HSTS includeSubDomains', alt ? '' : `"${hsts}"`);
  alt ? ok() : hata('HSTS includeSubDomains', hsts);
} catch { satir(false, 'başlıklar', 'ulaşılamadı'); hata('başlıklar', 'ulaşılamadı'); }

for (const [y, bekle] of [['/fonts/open-sans-normal-400-800-latin.woff2', 'immutable'], ['/images/og-yok.webp', null]]) {
  if (!bekle) continue;
  try {
    const r = await iste(y);
    const cc = r.headers.get('cache-control') || '';
    const iyi = cc.includes(bekle);
    satir(iyi, `cache-control ${y}`, cc || 'yok');
    iyi ? ok() : hata(`cache-control ${y}`, cc || 'yok');
  } catch { satir(false, `cache-control ${y}`, 'ulaşılamadı'); hata(y, 'ulaşılamadı'); }
}

// ── 5. 404 ────────────────────────────────────────────────────────────────
bolum('404 sayfaları');
for (const y of ['/olmayan-sayfa-xyz/', '/en/olmayan-sayfa-xyz/']) {
  try {
    const r = await iste(y);
    const g = r.govde;
    const iyi = r.status === 404 && /noindex/i.test(g);
    satir(iyi, y, `HTTP ${r.status}${/noindex/i.test(g) ? ' · noindex ✓' : ' · noindex YOK'}`);
    iyi ? ok() : hata(y, `HTTP ${r.status}`);
  } catch { satir(false, y, 'ulaşılamadı'); hata(y, 'ulaşılamadı'); }
}

// ── 6. canonical + hreflang eşleşmesi ─────────────────────────────────────
bolum('canonical ve hreflang');
const CIFT = [['/iletisim/', '/en/contact/'], ['/yonlendirilebilir-yatay-sondaj/', '/en/horizontal-directional-drilling/'], ['/', '/en/']];
for (const [tr, en] of CIFT) {
  for (const [yol, kendi] of [[tr, tr], [en, en]]) {
    try {
      const g = (await iste(yol)).govde;
      const kanon = (g.match(/<link rel="canonical" href="([^"]+)"/) || [])[1];
      const htr = (g.match(/hreflang="tr" href="([^"]+)"/) || [])[1];
      const hen = (g.match(/hreflang="en" href="([^"]+)"/) || [])[1];
      const iyi = kanon === KANONIK + kendi && htr === KANONIK + tr && hen === KANONIK + en;
      satir(iyi, yol, iyi ? `canonical + tr/en çifti doğru` : `canonical=${kanon} tr=${htr} en=${hen}`);
      iyi ? ok() : hata(`hreflang ${yol}`, `canonical=${kanon} tr=${htr} en=${hen}`);
    } catch { satir(false, yol, 'ulaşılamadı'); hata(yol, 'ulaşılamadı'); }
  }
}

// ── 7. Sitemap ────────────────────────────────────────────────────────────
bolum('Sitemap');
try {
  const sm = (await iste('/sitemap-0.xml')).govde;
  const loc = (sm.match(/<loc>/g) || []).length;
  const lm = (sm.match(/<lastmod>/g) || []).length;
  const hl = (sm.match(/hreflang="en"/g) || []).length;
  satir(loc >= 70, 'URL sayısı', String(loc));
  loc >= 70 ? ok() : hata('sitemap URL sayısı', String(loc));
  satir(lm === loc, 'lastmod', `${lm}/${loc}`);
  lm === loc ? ok() : hata('sitemap lastmod', `${lm}/${loc}`);
  satir(hl >= 60, 'hreflang çiftleri', String(hl));
  hl >= 60 ? ok() : hata('sitemap hreflang', String(hl));
  const enUrl = sm.includes('/en/contact/');
  satir(enUrl, 'İngilizce adresler', enUrl ? '/en/contact/ var' : 'bulunamadı');
  enUrl ? ok() : hata('sitemap EN adresleri');
  // noindex sayfa sitemap'te olmamalı — Search Console "noindex ile hariç
  // tutuldu" uyarısı verir. `/en/404/` bir ara buraya sızmıştı.
  const yasak = ['/404', '/admin'].filter(p => sm.includes(p));
  satir(!yasak.length, 'noindex sayfa yok', yasak.length ? yasak.join(', ') : '');
  !yasak.length ? ok() : hata('sitemapte noindex sayfa', yasak.join(', '));
} catch { satir(false, 'sitemap', 'ulaşılamadı'); hata('sitemap', 'ulaşılamadı'); }

// ── 8. Kalıntı taraması ───────────────────────────────────────────────────
bolum('Kalıntı taraması');
try {
  const g = (await iste('/hizmetlerimiz/')).govde;
  const uploads = (g.match(/\/images\/uploads\//g) || []).length;
  satir(uploads === 0, 'eski /images/uploads/ bağlantısı', uploads ? `${uploads} adet` : 'yok');
  uploads === 0 ? ok() : hata('eski uploads bağlantısı', `${uploads} adet`);
  const gf = /fonts\.(googleapis|gstatic)\.com/.test(g);
  satir(!gf, 'Google Fonts bağlantısı', gf ? 'VAR (kendi sunucumuzda olmalı)' : 'yok');
  !gf ? ok() : hata('Google Fonts bağlantısı');
} catch { satir(false, 'kalıntı taraması', 'ulaşılamadı'); hata('kalıntı', 'ulaşılamadı'); }

// ── Özet ──────────────────────────────────────────────────────────────────
console.log(`\n\x1b[1mÖZET\x1b[0m  geçen: ${gecti}  ·  kalan: ${kaldi}`);

/*
 * Her şey "ulaşılamadı" ise bu bir site hatası değil, AĞ hatasıdır.
 * Türkiye'den `*.pages.dev` ve `*.workers.dev` adreslerinin tamamı TCP
 * seviyesinde sıfırlanıyor (2026-09-12'de ölçüldü; var olmayan bir pages.dev
 * adresi de aynı hatayı veriyor, normal Cloudflare siteleri 200 dönüyor).
 * Engelleme aralıklı olduğu için bir koşu geçip sonraki tamamen çökebiliyor.
 */
if (ulasilamadi >= 5 && ulasilamadi >= kaldi * 0.8) {
  const sunucu = new URL(temel).hostname;
  const engelliAlan = /\.(pages|workers)\.dev$/.test(sunucu);
  const kodlar = [...nedenler.entries()].sort((a, b) => b[1] - a[1]);
  const bas = kodlar[0]?.[0];

  console.log(`\n\x1b[33m${ulasilamadi} denetim sunucuya HİÇ ulaşamadı.\x1b[0m`);
  console.log('Bu bir sayfa hatası değil, ağ hatası — sitenin kendisi sağlam olabilir.');
  console.log('Sebep: ' + kodlar.map(([k, n]) => `${k} × ${n}`).join(', '));

  if (bas === 'ENOTFOUND' || bas === 'EAI_AGAIN') {
    console.log(`\n\x1b[1m${sunucu} DNS'te YOK.\x1b[0m Adres hiç çözümlenmiyor, yani`);
    console.log('sunucuya bağlanma denemesi bile yapılmıyor. Cloudflare tarafında:');
    console.log('  1. Pages projesi → Custom domains → alan adı listede ve "Active" mi?');
    console.log('  2. Değilse: Set up a custom domain ile ekleyin, Activate domain deyin.');
    console.log(`  3. DNS → Records'ta CNAME kaydı var mı: Name "${sunucu.split('.')[0]}",`);
    console.log('     Target "deltek.pages.dev", Proxy AÇIK (turuncu bulut).');
    console.log('     Yoksa elle ekleyin — Pages normalde kendi ekler, eklememiş demektir.');
    console.log('\nCNAME hedefi pages.dev olsa da sorun değil: çözümleme Cloudflare');
    console.log('kenarında yapılıyor, tarayıcı pages.dev adresine hiç bağlanmıyor.');
  } else if (engelliAlan) {
    console.log('\n\x1b[1mSebebi büyük olasılıkla şu:\x1b[0m Türkiye\'den *.pages.dev ve');
    console.log('*.workers.dev adreslerinin tamamı engelli. Test için Pages projesine');
    console.log('geçici bir alt alan adı bağlayın (Custom domains → yeni.deltek.com.tr),');
    console.log('sonra:  npm run yayin -- https://yeni.deltek.com.tr');
    console.log('Ayrıntı: YAYIN.md → ADIM 3.');
  } else {
    console.log('\nAdres DNS\'te var ama bağlantı kurulamıyor. Sertifika henüz');
    console.log('hazırlanıyor olabilir (Custom domains\'te durum "Active" mi?),');
    console.log('ya da ağ engelliyor olabilir.');
  }
}

if (kaldi) {
  console.log('\nSorunlar:');
  for (const s of sorunlar) console.log('  • ' + s);
  process.exit(1);
}
console.log('\x1b[32mHepsi geçti.\x1b[0m');
