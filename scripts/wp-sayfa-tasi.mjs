// deltek.com.tr statik + teknoloji/hizmet sayfalarını Astro içeriğine taşır.
// Kaynak: her sayfanın ana içerik sütunu (.md-padding içindeki .col-md-9 / .col-md-12)
import { writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const ROOT = process.argv[2];
const SADECE_LISTE = process.argv.includes('--liste');
const OUT_MD = path.join(ROOT, 'src/content/sayfalar/tr');
const OUT_IMG = path.join(ROOT, 'public/images/uploads');
const HOST = 'https://www.deltek.com.tr';

const YOLLAR = [
  '/hakkimizda/', '/hizmetlerimiz/', '/referanslar/', '/medyalar/', '/iletisim/',
  '/yatay-sondaj-teknoloji/', '/yonlendirilebilir-yatay-sondaj-nedir/',
  '/yonlendirilebilir-yatay-sondaj-yapim-metodu/', '/yonlendirilebilir-yatay-sondaj-makinesi/',
  '/yatay-delgi-nedir/', '/yatay-sondaj/', '/yonlendirilebilir-yatay-delgi/',
  '/yonlendirilebilir-yatay-sondaj/', '/delgi-tijleri/', '/yonlendirme-basligi/',
  '/genisletme-basligi/', '/yer-belirleme/', '/uzerinden-takip/', '/manyetik-alan/',
  '/yatay-sondaj-camuru/', '/boru-surmecakma/', '/boru-yenileme/', '/akilli-altyapi/',
  '/auger-boring-nedir-modern-yatay-delgi-teknolojisi/', '/mikrotunel-nedir/',
  '/boru-surme-boru-cakma-auger-boring/', '/kazisiz-altyapi-ve-kazisiz-teknolojiler/',
  '/yatay-sondaj-kazisiz-yatay-delgi/',
];

// ── yardımcılar ────────────────────────────────────────────────
const ENT = { amp:'&', lt:'<', gt:'>', quot:'"', apos:"'", nbsp:' ', hellip:'…', ldquo:'“',
  rdquo:'”', lsquo:'‘', rsquo:'’', mdash:'—', ndash:'–', bull:'•', deg:'°', laquo:'«',
  raquo:'»', euro:'€', pound:'£', copy:'©', times:'×', middot:'·' };
const decode = (s) => s
  .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d))
  .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
  .replace(/&([a-z]+);/gi, (m, n) => (n.toLowerCase() in ENT ? ENT[n.toLowerCase()] : m));
const yaml = (s) => '"' + String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
const orijinal = (u) => u.replace(/-\d{2,4}x\d{2,4}(\.[a-z]{3,4})$/i, '$1');

/**
 * acilisIdx'teki etiketin eşleşen kapanışını bulur.
 * { ic: iç HTML, son: kapanış etiketinden sonraki indeks }
 */
function eslesme(html, acilisIdx, etiket = 'div') {
  const re = new RegExp(`<${etiket}\\b[^>]*>|</${etiket}\\s*>`, 'gi');
  re.lastIndex = acilisIdx;
  let derinlik = 0, m, basla = -1;
  while ((m = re.exec(html))) {
    if (m[0][1] !== '/') { if (derinlik === 0) basla = m.index + m[0].length; derinlik++; }
    else { derinlik--; if (derinlik === 0) return { ic: html.slice(basla, m.index), son: re.lastIndex }; }
  }
  return null;
}

/** acilisRe ile eşleşen blokları (etiketiyle birlikte) siler. */
function bloguSil(html, acilisRe, etiket = 'div') {
  let out = html;
  for (let i = 0; i < 20; i++) {
    const idx = out.search(acilisRe);
    if (idx < 0) break;
    const e = eslesme(out, idx, etiket);
    if (!e) break;
    out = out.slice(0, idx) + out.slice(e.son);
  }
  return out;
}

/**
 * Sayfanın ana içeriği = #contentWrapper içindeki her şey, eksi:
 *  - .page-title (H1 + breadcrumb; başlık zaten frontmatter'a gidiyor)
 *  - aside.sidebar (yan menü — yeni sitede header/nav karşılıyor)
 * Sayfalar .md-padding, .sm-padding veya çok sayıda .section bloğu
 * kullanabildiği için tek bir sarmalayıcı seçilmiyor, hepsi alınıyor.
 */
function anaSutun(html) {
  const i = html.search(/<div[^>]*id="contentWrapper"/i);
  if (i < 0) return null;
  const e = eslesme(html, i);
  if (!e) return null;
  let ic = bloguSil(e.ic, /<div[^>]*class="[^"]*\bpage-title\b[^"]*"/i);
  ic = bloguSil(ic, /<aside\b[^>]*>/i, 'aside');
  return ic;
}

async function indir(url, hedef) {
  if (existsSync(hedef)) return true;
  try {
    const r = await fetch(url);
    if (!r.ok) return false;
    const buf = Buffer.from(await r.arrayBuffer());
    if (buf.length < 100) return false;
    await mkdir(path.dirname(hedef), { recursive: true });
    await writeFile(hedef, buf);
    return true;
  } catch { return false; }
}

async function gorselAl(url, rapor) {
  const m = url.match(/wp-content\/uploads\/(.+)$/);
  if (!m) return null;
  const rel = decodeURIComponent(m[1]);
  for (const [uzak, yerel] of [[orijinal(url), orijinal(rel)], [url, rel]]) {
    if (await indir(uzak, path.join(OUT_IMG, yerel))) {
      rapor.push(yerel);
      return '/images/uploads/' + yerel.split(path.sep).join('/');
    }
  }
  return null;
}

// ── HTML -> Markdown ───────────────────────────────────────────
function satirIci(s) {
  return decode(s
    .replace(/<\s*(strong|b)\s*>([\s\S]*?)<\s*\/\s*\1\s*>/gi, (_, __, i) => {
      const t = i.replace(/<[^>]+>/g, '').trim(); return t ? `**${t}**` : ''; })
    .replace(/<\s*(em|i)\s*>([\s\S]*?)<\s*\/\s*\1\s*>/gi, (_, __, i) => {
      const t = i.replace(/<[^>]+>/g, '').trim(); return t ? `*${t}*` : ''; })
    .replace(/<[^>]+>/g, ''));
}

function tabloyaMd(html) {
  const satirlar = [...html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)].map(tr =>
    [...tr[1].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)]
      .map(td => satirIci(td[1]).replace(/\|/g, '\\|').replace(/\s+/g, ' ').trim()));
  if (!satirlar.length) return '';
  const en = Math.max(...satirlar.map(r => r.length));
  const doldur = r => { const c = r.slice(); while (c.length < en) c.push(''); return c; };
  const [bas, ...govde] = satirlar;
  return ['| ' + doldur(bas).join(' | ') + ' |',
          '| ' + Array(en).fill('---').join(' | ') + ' |',
          ...govde.map(r => '| ' + doldur(r).join(' | ') + ' |')].join('\n');
}

/** Cloudflare e-posta gizlemesini çözer: data-cfemail="<hex>" */
function cfEpostaCoz(kod) {
  const anahtar = parseInt(kod.slice(0, 2), 16);
  let s = '';
  for (let i = 2; i < kod.length; i += 2) s += String.fromCharCode(parseInt(kod.slice(i, i + 2), 16) ^ anahtar);
  return s;
}

function markdowna(html, gorselHarita) {
  let s = html;
  s = s.replace(/<(script|style|noscript)[\s\S]*?<\/\1>/gi, '');

  // Contact Form 7 formu: statik sitede çalışmaz, alan etiketleri düz metin
  // olarak sızıyor. Formu tamamen at — iletişim formu yeniden kurulacak.
  s = bloguSil(s, /<div[^>]*class="[^"]*\bwpcf7\b[^"]*"/i);
  s = s.replace(/<form\b[\s\S]*?<\/form>/gi, '');

  // Cloudflare ile gizlenmiş e-posta adreslerini çöz
  s = s.replace(/<a\b[^>]*data-cfemail="([a-f0-9]+)"[^>]*>[\s\S]*?<\/a>/gi,
    (_, kod) => { const e = cfEpostaCoz(kod); return `<a href="mailto:${e}">${e}</a>`; });
  s = s.replace(/<span\b[^>]*data-cfemail="([a-f0-9]+)"[^>]*>[\s\S]*?<\/span>/gi,
    (_, kod) => cfEpostaCoz(kod));

  // iframe'ler (Vimeo/YouTube gömüleri) korunur — etiket temizliğinden
  // kaçırmak için önce yer tutucuya alınıp sonunda geri konur.
  const gomu = [];
  s = s.replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>|<iframe\b[^>]*\/?>/gi, (tag) => {
    const src = (tag.match(/src=["']([^"']+)["']/i) || [])[1];
    if (!src) return '';
    gomu.push(`<div class="gomu"><iframe src="${src.replace(/^http:/, 'https:')}" loading="lazy" allowfullscreen></iframe></div>`);
    return `\n\n@@GOMU${gomu.length - 1}@@\n\n`;
  });
  const gomuGeriKoy = (t) => t.replace(/@@GOMU(\d+)@@/g, (_, i) => gomu[+i]);

  // WPBakery sekmeleri: başlıklar <ul class="wpb_tabs_nav">, gövdeler .wpb_tab
  // Sekmeleri ve akordiyonları düz başlık + metin olarak açıyoruz.
  s = s.replace(/<h3[^>]*class="[^"]*wpb_accordion_header[^"]*"[^>]*>([\s\S]*?)<\/h3>/gi,
    (_, ic) => `\n\n### ${satirIci(ic).replace(/\s+/g, ' ').trim()}\n\n`);
  s = s.replace(/<ul[^>]*class="[^"]*wpb_tabs_nav[^"]*"[\s\S]*?<\/ul>/gi, '');
  s = s.replace(/<div[^>]*class="[^"]*wpb_tab\b[^"]*"[^>]*data-title="([^"]*)"/gi,
    (_, t) => `<div><h3>${t}</h3>`);

  // görseller
  s = s.replace(/<img\b[^>]*>/gi, (tag) => {
    const src = (tag.match(/src=["']([^"']+)["']/i) || [])[1];
    const alt = decode((tag.match(/alt=["']([^"']*)["']/i) || [, ''])[1]);
    const yeni = src && gorselHarita.get(src);
    return yeni ? `\n\n![${alt}](${yeni})\n\n` : '';
  });
  s = s.replace(/<a\b[^>]*>\s*(!\[[^\]]*\]\([^)]*\))\s*<\/a>/gi, '$1');

  s = s.replace(/<table[\s\S]*?<\/table>/gi, (t) => '\n\n' + tabloyaMd(t) + '\n\n');
  s = s.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (_, ic) => '\n\n' +
    [...ic.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)]
      .map(li => '- ' + satirIci(li[1]).replace(/\s+/g, ' ').trim()).filter(l => l !== '- ').join('\n') + '\n\n');
  s = s.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (_, ic) => '\n\n' +
    [...ic.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)]
      .map((li, i) => `${i + 1}. ` + satirIci(li[1]).replace(/\s+/g, ' ').trim()).join('\n') + '\n\n');
  s = s.replace(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi, (_, lv, ic) => {
    const t = satirIci(ic).replace(/\s+/g, ' ').trim();
    return t ? '\n\n' + '#'.repeat(Math.max(2, Math.min(4, +lv))) + ' ' + t + '\n\n' : '';
  });
  s = s.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_, ic) =>
    '\n\n' + satirIci(ic).trim().split('\n').map(l => '> ' + l.trim()).join('\n') + '\n\n');
  s = s.replace(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, (_, href, ic) => {
    const t = satirIci(ic).replace(/\s+/g, ' ').trim();
    if (!t) return '';
    return `[${t}](${href.replace(/^https?:\/\/(www\.)?deltek\.com\.tr/, '')})`;
  });
  s = s.replace(/<br\s*\/?>/gi, '\n');
  s = s.replace(/<\/(p|div|section)>/gi, '\n\n').replace(/<(p|div|section)[^>]*>/gi, '');
  s = satirIci(s);

  s = s.split('\n').map(l => l.replace(/^[ \t]+/, '').replace(/[ \t]+$/, ''))
    .join('\n').replace(/\n{3,}/g, '\n\n').trim();
  return gomuGeriKoy(s);
}

// ── çalıştır ───────────────────────────────────────────────────
const rapor = [];
const govdeler = new Map();   // yinelenen içerik tespiti için

for (const yol of YOLLAR) {
  const slug = yol.replace(/^\/|\/$/g, '');
  let html;
  try {
    const r = await fetch(HOST + yol);
    if (!r.ok) { rapor.push({ slug, durum: r.status }); continue; }
    html = await r.text();
  } catch { rapor.push({ slug, durum: 'HATA' }); continue; }

  const baslik = decode((html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [, slug])[1])
    .replace(/<[^>]+>/g, '').trim();
  const aciklama = decode((html.match(/<meta name="description" content="([^"]*)"/i) || [, ''])[1]).trim();
  const sutun = anaSutun(html);
  if (!sutun) { rapor.push({ slug, durum: 'SUTUN YOK' }); continue; }

  const inen = [];
  const gorselHarita = new Map();
  for (const m of sutun.matchAll(/<img\b[^>]*src=["']([^"']+)["']/gi)) {
    const src = m[1];
    if (gorselHarita.has(src) || !/wp-content\/uploads/.test(src)) continue;
    const yeni = await gorselAl(src.startsWith('http') ? src : HOST + src, inen);
    if (yeni) gorselHarita.set(src, yeni);
  }

  const govde = markdowna(sutun, gorselHarita);
  const imza = govde.replace(/\s+/g, ' ').slice(0, 300);
  const ikiz = govdeler.get(imza);
  if (imza) govdeler.set(imza, ikiz ? ikiz + ',' + slug : slug);

  // özet: başlık/liste/tablo/görsel/gömü olmayan ilk gerçek paragraf
  const ilkP = govde.split('\n\n').map(b => b.trim())
    .find(b => b && !/^[#>|!\-*\d]/.test(b) && !/^</.test(b) && !/@@GOMU/.test(b)) || '';
  const ozet = (aciklama || ilkP).replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();

  rapor.push({ slug, durum: 200, baslik, kelime: govde.split(/\s+/).filter(Boolean).length,
               gorsel: inen.length, ikiz: ikiz || '' });

  if (!SADECE_LISTE) {
    const fm = ['---', `baslik: ${yaml(baslik)}`,
      ozet ? `ozet: ${yaml(ozet.length > 200 ? ozet.slice(0, 197).trimEnd() + '…' : ozet)}` : null,
      '---', '', ''].filter(x => x !== null).join('\n');
    await mkdir(OUT_MD, { recursive: true });
    await writeFile(path.join(OUT_MD, slug + '.md'), fm + govde + '\n', 'utf8');
  }
}

console.table(rapor);
console.log('\n--- AYNI İÇERİĞE SAHİP SAYFALAR ---');
for (const [, slugs] of govdeler) if (slugs.includes(',')) console.log('  ' + slugs.split(',').join('  ≡  '));
