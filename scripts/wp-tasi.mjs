// deltek.com.tr WordPress -> Astro içerik taşıma
// Kaynak: /feed/ (tam içerik) + her yazının sayfasından öne çıkan görsel
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const ROOT = process.argv[2];
if (!ROOT) { console.error('kullanım: node migrate.mjs <deltek-site yolu>'); process.exit(1); }
const OUT_MD = path.join(ROOT, 'src/content/blog/tr');
const OUT_IMG = path.join(ROOT, 'public/images/uploads');
const HOST = 'https://www.deltek.com.tr';

// ── yardımcılar ────────────────────────────────────────────────
const ENT = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', hellip: '…',
  ldquo: '“', rdquo: '”', lsquo: '‘', rsquo: '’', mdash: '—', ndash: '–',
  bull: '•', deg: '°', laquo: '«', raquo: '»', euro: '€', pound: '£', copy: '©',
};
function decode(s) {
  return s
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&([a-z]+);/gi, (m, n) => (n.toLowerCase() in ENT ? ENT[n.toLowerCase()] : m));
}
const yaml = (s) => '"' + String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';

// WordPress kırpma ekini at: foo-850x300.jpg -> foo.jpg
const orijinal = (u) => u.replace(/-\d{2,4}x\d{2,4}(\.[a-z]{3,4})$/i, '$1');

async function indir(url, hedef) {
  if (existsSync(hedef)) return true;
  const r = await fetch(url);
  if (!r.ok) return false;
  const buf = Buffer.from(await r.arrayBuffer());
  if (buf.length < 100) return false;
  await mkdir(path.dirname(hedef), { recursive: true });
  await writeFile(hedef, buf);
  return true;
}

/** wp-content/uploads/... URL'sini yerel yola çevirir, indirir, /images/uploads/... döner */
async function gorselAl(url, rapor) {
  const m = url.match(/wp-content\/uploads\/(.+)$/);
  if (!m) return null;
  const rel = decodeURIComponent(m[1]);
  const relOrj = orijinal(rel);
  // önce orijinali dene, olmazsa kırpılmış hâline düş
  for (const [uzak, yerel] of [[orijinal(url), relOrj], [url, rel]]) {
    const hedef = path.join(OUT_IMG, yerel);
    if (await indir(uzak, hedef)) {
      rapor.push(yerel);
      return '/images/uploads/' + yerel.split(path.sep).join('/');
    }
  }
  return null;
}

// ── HTML -> Markdown ───────────────────────────────────────────
function tabloyaMd(html) {
  const satirlar = [...html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)].map(tr =>
    [...tr[1].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)]
      .map(td => satirIci(td[1]).replace(/\|/g, '\\|').replace(/\s+/g, ' ').trim())
  );
  if (!satirlar.length) return '';
  const en = Math.max(...satirlar.map(r => r.length));
  const doldur = r => { const c = r.slice(); while (c.length < en) c.push(''); return c; };
  const [bas, ...govde] = satirlar;
  return [
    '| ' + doldur(bas).join(' | ') + ' |',
    '| ' + Array(en).fill('---').join(' | ') + ' |',
    ...govde.map(r => '| ' + doldur(r).join(' | ') + ' |'),
  ].join('\n');
}

function satirIci(s) {
  return decode(s
    .replace(/<\s*(strong|b)\s*>([\s\S]*?)<\s*\/\s*\1\s*>/gi, (_, __, i) => {
      const t = i.replace(/<[^>]+>/g, '').trim();
      return t ? `**${t}**` : '';
    })
    .replace(/<\s*(em|i)\s*>([\s\S]*?)<\s*\/\s*\1\s*>/gi, (_, __, i) => {
      const t = i.replace(/<[^>]+>/g, '').trim();
      return t ? `*${t}*` : '';
    })
    .replace(/<[^>]+>/g, ''));
}

function markdowna(html, gorselHarita) {
  let s = html;

  // script/style/iframe temizliği (iframe'i koru — video gömüleri)
  s = s.replace(/<(script|style)[\s\S]*?<\/\1>/gi, '');

  // görselleri markdown'a (yerel yola çevrilmiş olanlar)
  s = s.replace(/<img\b[^>]*>/gi, (tag) => {
    const src = (tag.match(/src=["']([^"']+)["']/i) || [])[1];
    const alt = decode((tag.match(/alt=["']([^"']*)["']/i) || [, ''])[1]);
    const yeni = src && gorselHarita.get(src);
    return yeni ? `\n\n![${alt}](${yeni})\n\n` : '';
  });

  // görsel sarmalayan linkleri sadeleştir (lightbox <a> -> içerik)
  s = s.replace(/<a\b[^>]*>\s*(!\[[^\]]*\]\([^)]*\))\s*<\/a>/gi, '$1');

  // tablolar
  s = s.replace(/<table[\s\S]*?<\/table>/gi, (t) => '\n\n' + tabloyaMd(t) + '\n\n');

  // listeler
  s = s.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (_, ic) =>
    '\n\n' + [...ic.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)]
      .map(li => '- ' + satirIci(li[1]).replace(/\s+/g, ' ').trim()).join('\n') + '\n\n');
  s = s.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (_, ic) =>
    '\n\n' + [...ic.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)]
      .map((li, i) => `${i + 1}. ` + satirIci(li[1]).replace(/\s+/g, ' ').trim()).join('\n') + '\n\n');

  // başlıklar (h1 kullanılmaz — sayfa başlığı zaten frontmatter'da)
  s = s.replace(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi, (_, lv, ic) => {
    const n = Math.max(2, Math.min(4, +lv));
    return '\n\n' + '#'.repeat(n) + ' ' + satirIci(ic).replace(/\s+/g, ' ').trim() + '\n\n';
  });

  s = s.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_, ic) =>
    '\n\n' + satirIci(ic).trim().split('\n').map(l => '> ' + l.trim()).join('\n') + '\n\n');

  // bağlantılar
  s = s.replace(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, (_, href, ic) => {
    const t = satirIci(ic).trim();
    if (!t) return '';
    const h = href.replace(/^https?:\/\/(www\.)?deltek\.com\.tr/, '');
    return `[${t}](${h})`;
  });

  s = s.replace(/<br\s*\/?>/gi, '\n');
  s = s.replace(/<\/p>/gi, '\n\n').replace(/<p[^>]*>/gi, '');
  s = s.replace(/<\/div>/gi, '\n\n').replace(/<div[^>]*>/gi, '');

  s = satirIci(s);

  // WordPress girintilerini tamamen at — markdown'da 4 boşluk/1 tab kod bloğu demek.
  // Liste, tablo ve başlık satırları zaten sıfırıncı sütunda üretiliyor.
  return s
    .split('\n').map(l => l.replace(/^[ \t]+/, '').replace(/[ \t]+$/, ''))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// ── feed ayrıştırma ────────────────────────────────────────────
const feed = await readFile(path.join(path.dirname(new URL(import.meta.url).pathname.slice(1)), 'feed.xml'), 'utf8');
const items = [...feed.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(m => m[1]);
const al = (blok, etiket) => {
  const m = blok.match(new RegExp(`<${etiket}[^>]*>([\\s\\S]*?)<\\/${etiket}>`));
  if (!m) return '';
  return m[1].replace(/^\s*<!\[CDATA\[/, '').replace(/\]\]>\s*$/, '').trim();
};

console.log(`feed'de ${items.length} yazı bulundu\n`);

const ozet = [];
for (const it of items) {
  const link = al(it, 'link');
  const slug = new URL(link).pathname.replace(/^\/|\/$/g, '');
  const baslik = decode(al(it, 'title'));
  const tarih = new Date(al(it, 'pubDate')).toISOString().slice(0, 10);
  const govdeHtml = al(it, 'content:encoded');
  const aciklama = decode(al(it, 'description')).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

  const inen = [];

  // içerikteki görseller
  const gorselHarita = new Map();
  for (const m of govdeHtml.matchAll(/<img\b[^>]*src=["']([^"']+)["']/gi)) {
    const src = m[1];
    if (gorselHarita.has(src)) continue;
    const yeni = await gorselAl(src.startsWith('http') ? src : HOST + src, inen);
    if (yeni) gorselHarita.set(src, yeni);
  }

  // öne çıkan görsel (WP post thumbnail): tema bunu
  // class="... attachment-blog-large-image ... wp-post-image" ile basıyor.
  // Bu sınıf yoksa yazının canlı sitede de kapağı yok demektir.
  let kapak = null;
  try {
    const sayfa = await fetch(link).then(r => r.text());
    const tag = sayfa.match(/<img\b[^>]*class="[^"]*attachment-blog-large-image[^"]*"[^>]*>/i);
    const src = tag && (tag[0].match(/src=["']([^"']+)["']/i) || [])[1];
    if (src) kapak = await gorselAl(src.startsWith('http') ? src : HOST + src, inen);
  } catch (e) { /* kapak yoksa geç */ }

  const govde = markdowna(govdeHtml, gorselHarita);

  // RSS description boşsa özeti gövdenin ilk paragrafından üret
  const ilkParagraf = govde.split('\n\n')
    .map(b => b.trim())
    .find(b => b && !/^[#>|!\-*\d]/.test(b)) || '';
  const ozetMetni = (aciklama || ilkParagraf).replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();

  const fm = [
    '---',
    `baslik: ${yaml(baslik)}`,
    ozetMetni ? `ozet: ${yaml(ozetMetni.length > 200 ? ozetMetni.slice(0, 197).trimEnd() + '…' : ozetMetni)}` : null,
    `tarih: ${tarih}`,
    kapak ? `kapak: ${yaml(kapak)}` : null,
    '---',
    '',
    '',
  ].filter(x => x !== null).join('\n');

  await mkdir(OUT_MD, { recursive: true });
  await writeFile(path.join(OUT_MD, slug + '.md'), fm + govde + '\n', 'utf8');

  ozet.push({ slug, tarih, kapak: kapak ? 'var' : 'YOK', gorsel: inen.length, kelime: govde.split(/\s+/).length });
  console.log(`✓ ${slug}\n   tarih=${tarih} kapak=${kapak || '—'} görsel=${inen.length} kelime=${govde.split(/\s+/).length}`);
}

console.log('\n--- özet ---');
console.table(ozet);
