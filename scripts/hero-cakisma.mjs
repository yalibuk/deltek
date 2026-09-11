/**
 * Hero slaytlarında METİN–KATMAN ÇAKIŞMASI denetimi.
 *
 *   node scripts/hero-cakisma.mjs [url] [enAz] [enCok] [adim]
 *   node scripts/hero-cakisma.mjs http://localhost:4322/ 900 1920 40
 *
 * NEDEN BİR BETİK: yazı kuşağı SABİT 1077 px, katmanlar ise 1920×500
 * ızgarasına göre ORANTILI ölçekleniyor. İkisi aynı hızda büyümediği için
 * çakışma bazı genişliklerde var, bazılarında yok — tek bir ekran ölçüsünde
 * bakmak yanıltıyor (1920'de temiz duran 7. slayt 1600'de %100 örtüşüyordu).
 * Bu yüzden bir aralık taranır.
 *
 * NEDEN SINIR KUTUSU DEĞİL PİKSEL: katmanların büyük bölümü saydam. Sınır
 * kutuları kesişse bile altta boş piksel olabilir. Katman canvas'a çizilip
 * metin satırının altına düşen piksellerin ALFA'sı sayılıyor. Satır kutuları
 * satır aralığını da içerdiği için dikeyde %16 daraltılıyor (harfin gövdesi
 * kadar kalsın diye).
 *
 * Çıktı: her genişlik için bulunan çakışmalar; sonda özet. Çakışma yoksa
 * çıkış kodu 0, varsa 1.
 */
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const { chromium } = await import(
  pathToFileURL(path.resolve('node_modules/playwright-core/index.mjs')).href
);

const URL_ = process.argv[2] || 'http://localhost:4321/';
const EN_AZ = Number(process.argv[3] || 900);
const EN_COK = Number(process.argv[4] || 1920);
const ADIM = Number(process.argv[5] || 40);
const CHROME = process.env.CHROME_YOL || 'C:/Program Files/Google/Chrome/Application/chrome.exe';

/** Bu oranın altındaki örtüşme "değmiş sayılmaz" — kenar yumuşatma payı. */
const ESIK = 0.02;

/**
 * KABUL EDİLEN çakışmalar. Burada listelenenler raporda görünür ama hata
 * saymaz (çıkış kodu 0 kalır) — böylece betik her çalıştığında aynı bilinen
 * durumu bağırıp gerçek yeni çakışmaları gölgelemez.
 *
 * Bir satır eklemeden önce iki soruyu cevaplayın: (1) örtüşen şey NESNE mi
 * yoksa gölge/dolgu mu, (2) başka türlü çözülebiliyor mu. Cevap "nesne" ya
 * da "çözülebilir" ise listeye eklemeyin, düzeltin.
 */
const KABUL = [
  {
    slayt: 6, parca: 'eylem', katman: 'yatay-sondaj-delgi-tiji-ve-bit.webp',
    neden: 'Buton bilerek borunun ALTINDA (eylemKonum: dip). Arkasında kalan ' +
           'şey boru değil, borunun açık gri gölgesi (y405-449); boru ile ' +
           'gölge arasında 29 px var, buton 63 px, yani ikisinden birine ' +
           'değmeden yerleştirilemiyor.',
  },
];
const kabulMu = b => KABUL.some(k =>
  k.slayt === b.slayt && k.parca === b.parca && b.katman.includes(k.katman));

const tarayici = await chromium.launch({ executablePath: CHROME, headless: true });
const sayfa = await tarayici.newPage({ viewport: { width: EN_COK, height: 900 } });
await sayfa.goto(URL_, { waitUntil: 'networkidle' });
// Katmanlar `loading="lazy"`: ekranda olmayan slaytların görselleri hiç
// yüklenmez, canvas'a çizilecek piksel de olmaz. Hepsini zorluyoruz.
await sayfa.evaluate(() => document.querySelectorAll('.slider img').forEach(i => (i.loading = 'eager')));
await sayfa.waitForFunction(
  () => [...document.querySelectorAll('.slider img')].every(i => i.complete && i.naturalWidth),
  null, { timeout: 30_000 });

const olcumKodu = () => {
  const cikti = [];
  document.querySelectorAll('.slide').forEach((s, i) => {
    const parcalar = [];
    s.querySelectorAll('.yazi__ustlik,.yazi__baslik,.yazi__satir,.yazi__eylem').forEach(el => {
      const rg = document.createRange();
      rg.selectNodeContents(el);
      [...rg.getClientRects()].forEach(b => {
        if (b.width > 2 && b.height > 2) parcalar.push({ t: el.className.replace('yazi__', ''), b });
      });
    });
    s.querySelectorAll('img.kat').forEach(k => {
      const kb = k.getBoundingClientRect();
      if (!kb.width || !k.naturalWidth) return;           // darGizle ile gizlenmiş
      const c = document.createElement('canvas');
      c.width = Math.max(1, Math.round(kb.width));
      c.height = Math.max(1, Math.round(kb.height));
      const ctx = c.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(k, 0, 0, c.width, c.height);
      for (const p of parcalar) {
        const b = p.b, dy = b.height * 0.16;
        const x1 = Math.max(b.left, kb.left), x2 = Math.min(b.right, kb.right);
        const y1 = Math.max(b.top + dy, kb.top), y2 = Math.min(b.bottom - dy, kb.bottom);
        if (x2 - x1 <= 1 || y2 - y1 <= 1) continue;
        const w = Math.round(x2 - x1), h = Math.round(y2 - y1);
        const d = ctx.getImageData(Math.round(x1 - kb.left), Math.round(y1 - kb.top), w, h).data;
        let opak = 0;
        for (let n = 3; n < d.length; n += 4) if (d[n] > 24) opak++;
        const oran = opak / (d.length / 4);
        if (oran > 0.02) cikti.push({
          slayt: i + 1, katman: k.currentSrc.split('/').pop(), parca: p.t,
          genPx: w, opak: +(100 * oran).toFixed(0),
        });
      }
    });
  });
  return cikti;
};

const hepsi = [];
for (let en = EN_COK; en >= EN_AZ; en -= ADIM) {
  await sayfa.setViewportSize({ width: en, height: 900 });
  await sayfa.waitForTimeout(120);
  const bulgular = (await sayfa.evaluate(olcumKodu)).filter(b => !kabulMu(b));
  for (const b of bulgular) hepsi.push({ en, ...b });
  const im = bulgular.length ? bulgular.map(b => `s${b.slayt}:${b.parca}←${b.katman.slice(0, 26)} ${b.genPx}px %${b.opak}`).join(' | ') : 'temiz';
  console.log(String(en).padStart(5), im);
}
await tarayici.close();

// ── Özet: hangi slayt hangi genişlik aralığında çakışıyor ────────────────
const anahtar = b => `slayt ${b.slayt} · ${b.parca} ← ${b.katman}`;
const grup = new Map();
for (const b of hepsi) {
  if (!grup.has(anahtar(b))) grup.set(anahtar(b), []);
  grup.get(anahtar(b)).push(b);
}
console.log('\n── ÖZET ' + '─'.repeat(52));
for (const k of KABUL) console.log(`(kabul edilen) slayt ${k.slayt} · ${k.parca} ← ${k.katman}\n    ${k.neden}`);
if (!grup.size) console.log('Bunun dışında çakışma yok.');
for (const [ad, bs] of grup) {
  const enler = bs.map(b => b.en);
  console.log(`${ad}\n    ${Math.min(...enler)}–${Math.max(...enler)} px arası, ` +
    `en kötü %${Math.max(...bs.map(b => b.opak))} / ${Math.max(...bs.map(b => b.genPx))} px`);
}
process.exit(grup.size ? 1 : 0);
