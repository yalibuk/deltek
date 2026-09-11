/**
 * SAYFA DÜZENİ DENETİMİ — bütün sayfalarda, birkaç ekran genişliğinde.
 *
 *   node scripts/duzen-denetim.mjs [url-kok] [genislikler]
 *   node scripts/duzen-denetim.mjs http://localhost:4324/ 1880,1280,900,390
 *
 * Sayfa listesi `dist/` altındaki `index.html`lerden çıkarılır, yani
 * ÖNCE `npm run build` gerekir. Dev sunucusunda çalıştırmayın: Astro'nun
 * geliştirme sunucusu bileşen `<style>`larını güvenilir tazelemiyor
 * (bkz. CLAUDE.md "Bilinen tuzak"), ölçüm eski CSS üzerinden yapılır.
 *
 * ÜÇ ŞEY ARANIR:
 *
 * 1. **Yatay taşma** — `scrollWidth > innerWidth`. Sayfayı yana kaydırılabilir
 *    yapan öğe bulunur. `body { overflow-x: hidden }` bunu GİZLER ama
 *    düzeltmez; ölçüm gizlenmeden önceki gerçeği söyler.
 *
 * 2. **Yapışkan/sabit öğe çakışması** — `position: sticky|fixed` bir öğenin
 *    kutusu, akrabası olmayan bir metin/görsel öğesinin üstüne biniyor mu.
 *    Sayfanın üç yerinde bakılır (tepe, orta, dip): yapışkan menü ancak
 *    belirli kaydırma noktalarında komşusunun üstüne çıkar — bu yüzden tek
 *    noktada bakmak yetmiyor. Sabit header (`.ust`) hariç, o zaten içeriği
 *    örtmek için var.
 *
 * 3. **Izgarada yanlış sütun** — iki sütunlu `.yazi--yan` düzeninde doğrudan
 *    çocuk sayısı ikiden fazlaysa uyarır. Otomatik yerleşim fazlalığı
 *    1. sütun / 2. satıra, yani yan menünün altına atıyor (yaşandı: sayfa
 *    sonundaki telefon CTA'sı 268 px'lik şeride dönüşüp yapışkan menünün
 *    altında kalmıştı).
 *
 * MOBİL GENİŞLİKLERDE (768 px altı) ÜÇ ŞEY DAHA:
 *
 * 4. **Dokunma hedefi** — buton/kart/gezinme bağlantısı 40 px'ten küçükse.
 *    Paragraf içindeki satır arası bağlantılar hariç; onların küçük olması
 *    normal, kutu değiller.
 * 5. **Okunmayacak punto** — 12 px altında metin.
 * 6. **Kabına sığmayan öğe** — `scrollWidth > clientWidth`. Tablo, kod bloğu
 *    ya da uzun bir kelime kendi kutusunu yarıyor mu.
 *
 * Mobil genişlikler GERÇEK cihaz öykünmesiyle açılır (dokunma, mobil UA,
 * `deviceScaleFactor: 2`) — masaüstü kullanıcı aracısıyla ölçmek `hover`a
 * bağlı kuralları ve yükleme anında cihaza bakan kodu yanlış çalıştırır.
 *
 * Bulgu varsa çıkış kodu 1.
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const { chromium } = await import(
  pathToFileURL(path.resolve('node_modules/playwright-core/index.mjs')).href
);

/**
 * BEKLENEN çakışmalar — bunlar raporda görünür ama hata saymaz.
 *
 * `.mobil-tel`: 980 px altında sayfanın dibine yapışan telefon çubuğu.
 * İçeriğin üstünden geçmesi TASARIM GEREĞİ; kaydırırken paragrafları örtüyor
 * ama hiçbir şey kalıcı olarak gizli kalmıyor — `body { padding-bottom: 70px }`
 * yer ayırıyor ve sayfanın en dibinde son metin çubuğun 18 px üstünde bitiyor
 * (390 / 900 / 979 px'te ölçüldü).
 */
const BEKLENEN = ['mobil-tel'];

const KOK = (process.argv[2] || 'http://localhost:4324/').replace(/\/$/, '');
const GENISLIKLER = (process.argv[3] || '1880,1280,900,390').split(',').map(Number);
const CHROME = process.env.CHROME_YOL || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
/** Bu genişliğin altı GERÇEK mobil bağlamda (dokunma + mobil UA) açılır. */
const MOBIL_ESIK = 768;

/** dist/ altındaki her index.html bir sayfa. */
function sayfalar(kok = 'dist') {
  const cikti = [];
  (function tara(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const t = path.join(d, e.name);
      if (e.isDirectory()) {
        if (['_astro', 'images', 'admin'].includes(e.name)) continue;
        tara(t);
      } else if (e.name === 'index.html') {
        const göreli = path.relative(kok, d).split(path.sep).filter(Boolean).join('/');
        cikti.push('/' + (göreli ? göreli + '/' : ''));
      }
    }
  })(kok);
  return cikti.sort();
}

const denetimKodu = () => {
  const ad = e => e.tagName.toLowerCase() +
    (e.id ? '#' + e.id : '') +
    (typeof e.className === 'string' && e.className ? '.' + e.className.trim().split(/\s+/).join('.') : '');
  const gorunur = e => {
    const c = getComputedStyle(e);
    return c.display !== 'none' && c.visibility !== 'hidden' && +c.opacity > 0.05;
  };
  const bulgular = [];

  // ── 1. Yatay taşma ─────────────────────────────────────────────────────
  const belge = document.documentElement;
  if (belge.scrollWidth > innerWidth + 1) {
    const suclular = [];
    document.querySelectorAll('body *').forEach(e => {
      if (!gorunur(e)) return;
      const b = e.getBoundingClientRect();
      if (b.width < 1 || b.right <= innerWidth + 1) return;
      // Yalnız EN İÇTEKİ suçluyu bildir: taşan bir çocuğu varsa atla.
      if ([...e.children].some(c => c.getBoundingClientRect().right > innerWidth + 1)) return;
      suclular.push(`${ad(e)} sağ kenar ${Math.round(b.right)}`);
    });
    bulgular.push({
      tur: 'yatay-tasma',
      detay: `scrollWidth ${belge.scrollWidth} > ${innerWidth}` +
             (suclular.length ? ' — ' + suclular.slice(0, 3).join(' | ') : ''),
    });
  }

  // ── 2/3 için: yapışkan ve sabit öğeler ────────────────────────────────
  const yapiskanlar = [...document.querySelectorAll('body *')].filter(e => {
    const c = getComputedStyle(e);
    return (c.position === 'sticky' || c.position === 'fixed') && gorunur(e) &&
      !e.classList.contains('ust');           // sabit header içeriği örtmek için var
  });

  // ── 3. Izgarada yanlış sütun ───────────────────────────────────────────
  document.querySelectorAll('.yazi--yan').forEach(g => {
    const n = [...g.children].filter(c => gorunur(c)).length;
    if (n > 2) bulgular.push({
      tur: 'izgara-fazla-cocuk',
      detay: `${ad(g)} içinde ${n} doğrudan çocuk var (2 olmalı: yan menü + .yazi__ana). ` +
             `Fazlalık 1. sütun / 2. satıra, yan menünün altına düşer: ` +
             [...g.children].filter(gorunur).map(ad).join(', '),
    });
  });

  // ── 4-6. Yalnız mobil genişliklerde ────────────────────────────────────
  if (innerWidth < 768) {
    // 4. Dokunma hedefi — İKİ KADEME.
    //    24 px WCAG 2.5.8'in (AA) normatif alt sınırı: altı İHLAL.
    //    40 px Apple/Google tavsiyesi: arası "dar", hata değil.
    //    Tek eşikle bakmak işe yaramıyordu — 36-38 px'lik onlarca öğe,
    //    14x11 px'lik gerçek ihlali (dil değiştirici) gömüyordu.
    const ihlal = [], dar = [];
    document.querySelectorAll('a, button').forEach(e => {
      if (!gorunur(e)) return;
      const c = getComputedStyle(e);
      // Paragraf içi satır bağlantısı değil, kendi kutusu olan öğeler
      if (c.display === 'inline' && !e.closest('nav, footer, .nokta')) return;
      // GERİLMİŞ BAĞLANTI: kartlarda tıklanabilir alan bağlantının kendisi
      // değil, `::after` ile kaplanan kartın tamamı (bkz. CLAUDE.md "Kart
      // deseni"). Metin kutusuna bakmak yanlış ihlal bildiriyordu
      // (`a.tkart__ad 282x21`, oysa hedef 282x120'lik kart).
      const sonra = getComputedStyle(e, '::after');
      if (sonra.content !== 'none' && sonra.position === 'absolute') return;
      const b = e.getBoundingClientRect();
      if (b.width < 1 || b.height < 1) return;
      const olcu = `${ad(e)} ${Math.round(b.width)}x${Math.round(b.height)}`;
      if (b.width < 24 || b.height < 24) ihlal.push(olcu);
      else if (b.width < 40 || b.height < 40) dar.push(olcu);
    });
    const ozet = l => [...new Set(l)].slice(0, 5).join(' | ') +
      (new Set(l).size > 5 ? ` (+${new Set(l).size - 5})` : '');
    if (ihlal.length) bulgular.push({ tur: 'dokunma-hedefi-IHLAL (<24px)', detay: ozet(ihlal) });
    if (dar.length) bulgular.push({ tur: 'dokunma-hedefi-dar (24-40px)', detay: ozet(dar) });

    // 5. Okunmayacak punto
    const minik = [];
    document.querySelectorAll('p, li, span, a, td, th, dd, dt, figcaption, small').forEach(e => {
      if (!gorunur(e) || !e.textContent.trim()) return;
      if ([...e.children].some(c => c.textContent.trim())) return;   // yalnız yaprak
      const px = parseFloat(getComputedStyle(e).fontSize);
      if (px >= 12) return;
      minik.push(`${ad(e)} ${px.toFixed(1)}px "${e.textContent.trim().slice(0, 24)}"`);
    });
    if (minik.length) bulgular.push({
      tur: 'kucuk-punto',
      detay: [...new Set(minik)].slice(0, 5).join(' | ') +
             (minik.length > 5 ? ` (+${minik.length - 5})` : ''),
    });

    // 6. Kabına sığmayan öğe.
    //    ÜST SOYA DA BAKILIR: karusel rayı gibi öğeler bilerek kutularından
    //    geniştir, onları kırpan bir ata vardır (`.slider { overflow: hidden }`).
    //    Yalnız kendi `overflow`una bakmak 8 slaytlık `.slider__ray`i
    //    (3120 > 390) her sayfada hata diye bildiriyordu.
    const kirpanAtaVar = e => {
      for (let a = e.parentElement; a && a !== document.body; a = a.parentElement) {
        if (getComputedStyle(a).overflowX !== 'visible') return true;
      }
      return false;
    };
    const tasan = [];
    document.querySelectorAll('body *').forEach(e => {
      if (!gorunur(e)) return;
      const c = getComputedStyle(e);
      if (c.overflowX !== 'visible') return;            // kaydırmalı kutular kasıtlı
      if (kirpanAtaVar(e)) return;
      // TAM GENİŞLİK deseni: `width: 100vw; margin-inline: calc(50% - 50vw)`
      // ile kabından KASITLI taşan şeritler (logo şeridi, tecrübe bandı).
      // İmzası çocukta negatif yatay kenar boşluğu.
      if ([...e.children].some(c => {
        const k = getComputedStyle(c);
        return parseFloat(k.marginLeft) < -1 || parseFloat(k.marginRight) < -1;
      })) return;
      if (e.scrollWidth > e.clientWidth + 2 && e.clientWidth > 0) {
        tasan.push(`${ad(e)} ${e.scrollWidth}>${e.clientWidth}`);
      }
    });
    if (tasan.length) bulgular.push({
      tur: 'kaba-sigmayan',
      detay: [...new Set(tasan)].slice(0, 5).join(' | ') +
             (tasan.length > 5 ? ` (+${tasan.length - 5})` : ''),
    });
  }

  return { bulgular, yapiskanSayisi: yapiskanlar.length };
};

/** Verilen kaydırma noktasında yapışkan öğelerin çakışmasına bakar. */
const cakismaKodu = () => {
  const ad = e => e.tagName.toLowerCase() +
    (typeof e.className === 'string' && e.className ? '.' + e.className.trim().split(/\s+/)[0] : '');
  const gorunur = e => {
    const c = getComputedStyle(e);
    return c.display !== 'none' && c.visibility !== 'hidden' && +c.opacity > 0.05;
  };
  const cikti = [];
  const yapiskanlar = [...document.querySelectorAll('body *')].filter(e => {
    const c = getComputedStyle(e);
    return (c.position === 'sticky' || c.position === 'fixed') && gorunur(e) && !e.classList.contains('ust');
  });
  for (const y of yapiskanlar) {
    const a = y.getBoundingClientRect();
    if (a.width < 2 || a.height < 2) continue;
    document.querySelectorAll('a, button, p, h1, h2, h3, h4, li, img, figure, span.btn').forEach(e => {
      if (y.contains(e) || e.contains(y) || !gorunur(e)) return;
      const b = e.getBoundingClientRect();
      if (b.width < 2 || b.height < 2) return;
      const w = Math.min(a.right, b.right) - Math.max(a.left, b.left);
      const h = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
      if (w <= 2 || h <= 2) return;
      // Kendi içinde taşan öğeleri elemek için: yalnız yaprak benzeri olanlar
      if ([...e.children].some(c => {
        const cb = c.getBoundingClientRect();
        return Math.min(a.right, cb.right) - Math.max(a.left, cb.left) > 2 &&
               Math.min(a.bottom, cb.bottom) - Math.max(a.top, cb.top) > 2;
      })) return;
      cikti.push(`${ad(y)} ↔ ${ad(e)} (${Math.round(w)}x${Math.round(h)} px)`);
    });
  }
  return [...new Set(cikti)];
};

const yollar = sayfalar();
const tarayici = await chromium.launch({ executablePath: CHROME, headless: true });

/**
 * İki AYRI bağlam: dokunma ve mobil kullanıcı aracısı bağlam seviyesinde
 * ayarlanıyor, sonradan `setViewportSize` ile değiştirilemiyor. Masaüstü
 * kullanıcı aracısıyla 390 px ölçmek `hover`a bağlı kuralları ve yükleme
 * anında cihaza bakan kodu yanlış çalıştırırdı.
 */
const masaustu = await tarayici.newPage({ viewport: { width: 1880, height: 900 } });
const mobil = await tarayici.newPage({
  viewport: { width: 390, height: 844 }, deviceScaleFactor: 2,
  isMobile: true, hasTouch: true,
  userAgent: 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 ' +
             '(KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
});

let toplam = 0;
console.log(`${yollar.length} sayfa × ${GENISLIKLER.length} genişlik (${GENISLIKLER.join(', ')})\n`);

for (const yol of yollar) {
  const satirlar = [];
  for (const en of GENISLIKLER) {
    const sayfa = en < MOBIL_ESIK ? mobil : masaustu;
    await sayfa.setViewportSize({ width: en, height: en < MOBIL_ESIK ? 844 : 900 });
    await sayfa.goto(KOK + yol, { waitUntil: 'domcontentloaded' });
    await sayfa.waitForTimeout(160);
    const { bulgular } = await sayfa.evaluate(denetimKodu);
    for (const b of bulgular) satirlar.push(`${en}px · ${b.tur}: ${b.detay}`);
    // üç kaydırma noktası: tepe, orta, dip
    for (const oran of [0, 0.5, 1]) {
      await sayfa.evaluate(o => window.scrollTo(0, (document.body.scrollHeight - innerHeight) * o), oran);
      await sayfa.waitForTimeout(120);
      for (const c of await sayfa.evaluate(cakismaKodu)) {
        if (BEKLENEN.some(b => c.includes(b))) continue;
        satirlar.push(`${en}px · çakışma (kaydırma %${oran * 100}): ${c}`);
      }
    }
  }
  const benzersiz = [...new Set(satirlar)];
  toplam += benzersiz.length;
  if (benzersiz.length) {
    console.log(`${yol}`);
    for (const s of benzersiz) console.log('   ' + s);
  }
}

await tarayici.close();
console.log(`\n── ÖZET ${'─'.repeat(52)}`);
console.log(`Beklenen (hata sayılmaz): ${BEKLENEN.join(', ')}`);
console.log(toplam ? `${toplam} bulgu.` : 'Bunun dışında bulgu yok.');
process.exit(toplam ? 1 : 0);
