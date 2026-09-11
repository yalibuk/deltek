/**
 * Astro entegrasyonu — build bittikten sonra `dist/` üzerinde dört SEO işi:
 *
 *  1. sitemap `<lastmod>`: her URL için kaynak markdown'ın son git commit
 *     tarihi (blog yazısında frontmatter `guncelleme` varsa o). Google lastmod'u
 *     yalnızca "tutarlı ve doğrulanabilir" ise kullanır; commit tarihi ikisi de.
 *     Liste sayfaları (/, /blog/, /en/, /en/blog/) altındaki en yeni tarihi alır.
 *
 *     DİKKAT — Cloudflare Pages depoyu SHALLOW klonluyor: build ortamında
 *     `git log` geçmişi YOK, her dosya aynı (ya da boş) tarihi verirdi ve
 *     tüm sayfalar build zamanını alırdı. Google tutarsız lastmod'u yok sayar.
 *     Bu yüzden tarihler tam geçmişin olduğu YEREL build'de hesaplanıp
 *     `src/data/icerik-tarihleri.json`a yazılır ve depoya commit'lenir;
 *     Pages orada o dosyayı okur. Dosya yoksa dosya mtime'ına düşer ve
 *     build günlüğüne uyarı basar.
 *  2. RSS: /rss.xml (TR) ve /en/rss.xml (EN) — blog yazıları. Bing/feed
 *     okuyucular ve içerik keşfi için; @astrojs/rss kurmadan üretilir.
 *  3. /llms.txt: sayfa listesi + özetler (markdown). Google gerekmediğini
 *     söylüyor; diğer yapay zekâ tarayıcıları için ucuz bir dizin.
 *  4. Dış bağlantılara `rel="noopener noreferrer"` + `target="_blank"`
 *     (markdown gövdesinden gelen `<a>`ler bunları taşımıyor).
 *
 * @astrojs/sitemap dosyasını aynı kancada yazdığı için bu entegrasyon
 * astro.config.mjs'de ONDAN SONRA kayıtlı olmalı.
 */
import { readFile, writeFile, readdir, stat } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const SITE = 'https://www.deltek.com.tr';
const KAYNAK = path.resolve('src/content');
const DILLER = ['tr', 'en'];
const KOLEKSIYONLAR = ['blog', 'sayfalar'];

// ── yardımcılar ───────────────────────────────────────────────────────────
const xml = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Frontmatter'ın düz `anahtar: değer` satırlarını okur (liste/iç içe alan gerekmiyor). */
function frontmatter(md) {
  const m = md.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const o = {};
  if (!m) return o;
  for (const satir of m[1].split(/\r?\n/)) {
    const k = satir.match(/^([A-Za-z_][\w]*):\s*(.*)$/);
    if (!k) continue;
    let v = k[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    o[k[1]] = v;
  }
  return o;
}

function gitTarih(dosya) {
  try {
    const t = execFileSync('git', ['log', '-1', '--format=%cI', '--', dosya], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    if (t) return new Date(t);
  } catch { /* git yok ya da dosya izlenmiyor */ }
  return null;
}

/** Depoda tam commit geçmişi var mı? Cloudflare Pages shallow klonluyor. */
function tamGecmis() {
  try {
    return execFileSync('git', ['rev-parse', '--is-shallow-repository'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim() === 'false';
  } catch { return false; }
}

const TARIH_DOSYASI = path.resolve('src/data/icerik-tarihleri.json');
async function tarihAnliksi() {
  try { return JSON.parse(await readFile(TARIH_DOSYASI, 'utf8')); } catch { return null; }
}

async function icerik(logger) {
  const tamlik = tamGecmis();
  const anlik = tamlik ? null : await tarihAnliksi();
  if (!tamlik && !anlik) {
    logger?.warn('git geçmişi yok ve src/data/icerik-tarihleri.json bulunamadı — lastmod dosya tarihine düşüyor');
  }
  const yeniAnlik = {};
  const kayit = []; // { dil, tur, anahtar, slug, baslik, ozet, tarih, lastmod, url }
  for (const tur of KOLEKSIYONLAR) for (const dil of DILLER) {
    const dizin = path.join(KAYNAK, tur, dil);
    let dosyalar = [];
    try { dosyalar = (await readdir(dizin)).filter(f => f.endsWith('.md')); } catch { continue; }
    for (const f of dosyalar) {
      const yol = path.join(dizin, f);
      const md = await readFile(yol, 'utf8');
      const fm = frontmatter(md);
      const slug = f.replace(/\.md$/, '');
      const kimlik = `${tur}/${dil}/${slug}`;
      const kayitliTarih = anlik?.[kimlik] ? new Date(anlik[kimlik]) : null;
      const git = (tamlik ? gitTarih(yol) : kayitliTarih) || (await stat(yol)).mtime;
      if (tamlik) yeniAnlik[kimlik] = iso(git);
      const gunc = fm.guncelleme ? new Date(fm.guncelleme) : null;
      const lastmod = gunc && !isNaN(gunc) && gunc > git ? gunc : git;
      // slug = URL (EN'de frontmatter `adres`, İngilizce); anahtar = dosya adı (TR/EN eşleşmesi)
      const anahtar = slug, urlSlug = (fm.adres && dil !== 'tr') ? fm.adres : slug;
      kayit.push({
        dil, tur, anahtar, slug: urlSlug, baslik: fm.seoBaslik || fm.baslik || slug, ozet: fm.ozet || '',
        tarih: fm.tarih ? new Date(fm.tarih) : null, lastmod,
        url: `${SITE}${dil === 'en' ? '/en' : ''}/${urlSlug}/`,
      });
    }
  }
  // Tam geçmiş varsa anlık görüntüyü tazele — DEĞİŞMİŞSE. Cloudflare build'i
  // bunu okuyacak, o yüzden depoya commit'lenmeli (git status gösterir).
  if (tamlik) {
    const yeni = JSON.stringify(Object.fromEntries(Object.entries(yeniAnlik).sort()), null, 1) + '\n';
    const eski = await readFile(TARIH_DOSYASI, 'utf8').catch(() => null);
    if (eski !== yeni) { await writeFile(TARIH_DOSYASI, yeni); logger?.info('src/data/icerik-tarihleri.json güncellendi — COMMIT EDİN'); }
  }
  return kayit;
}

async function htmlDosyalari(dizin) {
  const s = [];
  for (const ad of await readdir(dizin)) {
    const p = path.join(dizin, ad);
    if ((await stat(p)).isDirectory()) s.push(...await htmlDosyalari(p));
    else if (ad.endsWith('.html')) s.push(p);
  }
  return s;
}

const iso = (d) => d.toISOString().replace(/\.\d{3}Z$/, '+00:00');

// ── 1. sitemap lastmod ────────────────────────────────────────────────────
async function sitemapLastmod(kok, kayit, logger) {
  const dosya = path.join(kok, 'sitemap-0.xml');
  let sm;
  try { sm = await readFile(dosya, 'utf8'); } catch { logger.warn('sitemap-0.xml yok, lastmod atlandı'); return; }
  if (sm.includes('<lastmod>')) return;
  const tarih = new Map(kayit.map(k => [k.url, k.lastmod]));
  const enYeni = (dil, tur) => kayit.filter(k => k.dil === dil && (!tur || k.tur === tur)).reduce((a, k) => (!a || k.lastmod > a ? k.lastmod : a), null);
  for (const dil of DILLER) {
    const on = dil === 'en' ? '/en' : '';
    tarih.set(`${SITE}${on}/`, enYeni(dil));
    tarih.set(`${SITE}${on}/blog/`, enYeni(dil, 'blog'));
  }
  // hreflang çiftleri: dosya adı (anahtar) üzerinden TR ↔ EN. Sitemap
  // eklentisinin i18n seçeneği kapalı (astro.config.mjs'de gerekçesi var).
  const cift = new Map(); // url -> { tr, en }
  const ekleCift = (trUrl, enUrl) => { const c = { tr: trUrl, en: enUrl }; if (trUrl) cift.set(trUrl, c); if (enUrl) cift.set(enUrl, c); };
  const anahtarla = new Map();
  for (const k of kayit) { const c = anahtarla.get(k.tur + ':' + k.anahtar) || {}; c[k.dil] = k.url; anahtarla.set(k.tur + ':' + k.anahtar, c); }
  for (const c of anahtarla.values()) ekleCift(c.tr, c.en);
  ekleCift(`${SITE}/`, `${SITE}/en/`);
  ekleCift(`${SITE}/blog/`, `${SITE}/en/blog/`);
  const hreflang = (url) => {
    const c = cift.get(url); if (!c) return '';
    const s = [];
    if (c.tr) s.push(`<xhtml:link rel="alternate" hreflang="tr" href="${c.tr}"/>`);
    if (c.en) s.push(`<xhtml:link rel="alternate" hreflang="en" href="${c.en}"/>`);
    s.push(`<xhtml:link rel="alternate" hreflang="x-default" href="${c.tr || c.en}"/>`);
    return s.join('');
  };
  if (!sm.includes('xmlns:xhtml')) sm = sm.replace('<urlset ', '<urlset xmlns:xhtml="http://www.w3.org/1999/xhtml" ');
  let n = 0, h = 0;
  sm = sm.replace(/<loc>([^<]+)<\/loc>/g, (m, url) => {
    const t = tarih.get(url);
    const hl = hreflang(url); if (hl) h++;
    if (t) n++;
    return `${m}${t ? `<lastmod>${iso(t)}</lastmod>` : ''}${hl}`;
  });
  await writeFile(dosya, sm);
  logger.info(`sitemap: ${n} URL'ye lastmod, ${h} URL'ye hreflang eklendi`);
}

// ── 2. RSS ────────────────────────────────────────────────────────────────
async function rss(kok, kayit, logger) {
  const AD = { tr: ['Deltek Blog', 'Yatay sondaj, kazısız geçiş ve altyapı teknolojileri üzerine yazılar.'],
               en: ['Deltek Blog', 'Articles on horizontal directional drilling, trenchless crossings and infrastructure technology.'] };
  for (const dil of DILLER) {
    const yazilar = kayit.filter(k => k.dil === dil && k.tur === 'blog' && k.tarih && !isNaN(k.tarih))
      .sort((a, b) => b.tarih - a.tarih);
    if (!yazilar.length) continue;
    const on = dil === 'en' ? '/en' : '';
    const kanal = `${SITE}${on}/blog/`;
    const ogeler = yazilar.map(y => `    <item>
      <title>${xml(y.baslik)}</title>
      <link>${y.url}</link>
      <guid isPermaLink="true">${y.url}</guid>
      <pubDate>${y.tarih.toUTCString()}</pubDate>
      ${y.ozet ? `<description>${xml(y.ozet)}</description>` : ''}
    </item>`).join('\n');
    const govde = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${xml(AD[dil][0])}</title>
    <link>${kanal}</link>
    <description>${xml(AD[dil][1])}</description>
    <language>${dil}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE}${on}/rss.xml" rel="self" type="application/rss+xml"/>
${ogeler}
  </channel>
</rss>
`;
    await writeFile(path.join(kok, dil === 'en' ? 'en' : '', 'rss.xml'), govde);
    logger.info(`rss: ${on}/rss.xml (${yazilar.length} yazı)`);
  }
}

// ── 3. llms.txt ───────────────────────────────────────────────────────────
async function llms(kok, kayit, logger) {
  const satir = (k) => `- [${k.baslik}](${k.url})${k.ozet ? `: ${k.ozet}` : ''}`;
  const bolum = (dil, tur) => kayit.filter(k => k.dil === dil && k.tur === tur).sort((a, b) => a.baslik.localeCompare(b.baslik, dil)).map(satir).join('\n');
  const govde = `# Deltek

> Yönlendirilebilir yatay sondaj (HDD), boru sürme/çakma (auger boring, mikrotünel), kazısız boru yenileme (pipe bursting) ve akıllı altyapı danışmanlığı yüklenicisi. İstanbul ve İzmir ofisleri, Türkiye geneli hizmet. / Horizontal directional drilling, auger boring, microtunnelling and pipe bursting contractor based in Istanbul and Izmir, Türkiye.

Site: ${SITE}/ (Türkçe) · ${SITE}/en/ (English)

## Sayfalar (TR)
${bolum('tr', 'sayfalar')}

## Blog (TR)
${bolum('tr', 'blog')}

## Pages (EN)
${bolum('en', 'sayfalar')}

## Blog (EN)
${bolum('en', 'blog')}
`;
  await writeFile(path.join(kok, 'llms.txt'), govde);
  logger.info('llms.txt yazıldı');
}

// ── 4. dış bağlantılar ────────────────────────────────────────────────────
async function disBaglantilar(kok, logger) {
  let n = 0;
  for (const dosya of await htmlDosyalari(kok)) {
    const html = await readFile(dosya, 'utf8');
    const yeni = html.replace(/<a\b([^>]*\shref="https?:\/\/(?!(?:www\.)?deltek\.com\.tr)[^"]*"[^>]*)>/gi, (m, ic) => {
      let s = ic;
      if (!/\srel=/.test(s)) s += ' rel="noopener noreferrer"';
      if (!/\starget=/.test(s)) s += ' target="_blank"';
      if (s !== ic) n++;
      return `<a${s}>`;
    });
    if (yeni !== html) await writeFile(dosya, yeni);
  }
  logger.info(`${n} dış bağlantıya rel/target eklendi`);
}

export default function seoEk() {
  return {
    name: 'deltek-seo',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const kok = fileURLToPath(dir);
        const kayit = await icerik(logger);
        await sitemapLastmod(kok, kayit, logger);
        await rss(kok, kayit, logger);
        await llms(kok, kayit, logger);
        await disBaglantilar(kok, logger);
      },
    },
  };
}
