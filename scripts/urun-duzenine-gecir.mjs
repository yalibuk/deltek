/**
 * Taşınan bir sayfayı markdown akışından `duzen: urun` düzenine çevirir.
 *
 * Canlı deltek.com.tr sayfalarındaki sıra: [banner] metin, görsel, metin, görsel…
 * yani her görsel KENDİNDEN ÖNCEKİ metni resimliyor. Dönüşüm bunu korur:
 * biriken metin bir görselle karşılaşınca blok kapanır.
 *
 * Yalnızca görsel + metin akışı olan sayfalarda anlamlı. Başlık/liste yapılı
 * makale sayfaları (mikrotunel-nedir, yatay-sondaj …) normal akışta kalmalı.
 *
 *   node scripts/urun-duzenine-gecir.mjs <slug> [<slug> ...]
 *   node scripts/urun-duzenine-gecir.mjs --kuru <slug>     # yazmadan göster
 */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const KURU = process.argv.includes('--kuru');
const sluglar = process.argv.slice(2).filter(a => !a.startsWith('--'));
if (!sluglar.length) { console.error('kullanım: node scripts/urun-duzenine-gecir.mjs <slug> ...'); process.exit(1); }

const DIZIN = 'src/content/sayfalar/tr';

/** YAML blok skaları için girintili gövde üretir. */
const blokMetin = (s, girinti = '      ') =>
  s.split('\n').map(l => (l.trim() ? girinti + l : '')).join('\n');

for (const slug of sluglar) {
  const dosya = path.join(DIZIN, slug + '.md');
  // Windows'ta git checkout CRLF yazabiliyor; blok ayırıcı \n{2,} bozulmasın diye normalize et
  const ham = (await readFile(dosya, 'utf8')).replace(/\r\n/g, '\n');

  const m = ham.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) { console.error(`✗ ${slug}: frontmatter okunamadı`); continue; }
  const [, fm, govde] = m;

  if (/^duzen:/m.test(fm)) { console.log(`— ${slug}: zaten bir düzeni var, atlandı`); continue; }

  // Satır bazlı ayrıştırma: bazı sayfalarda görseller metinden boş satırla
  // ayrılmamış, hemen alt satırda duruyor. Blok bazlı bölme bunları kaçırıyordu.
  const GORSEL = /^!\[[^\]]*\]\(([^)]+)\)$/;
  const belirtecler = [];
  let paragraf = [];
  const paragrafKapat = () => {
    if (paragraf.length) { belirtecler.push({ tip: 'm', deger: paragraf.join('\n') }); paragraf = []; }
  };
  for (const satir of govde.split('\n')) {
    const t = satir.trim();
    if (!t) { paragrafKapat(); continue; }
    const g = t.match(GORSEL);
    if (g) { paragrafKapat(); belirtecler.push({ tip: 'g', deger: g[1] }); continue; }
    paragraf.push(t);
  }
  paragrafKapat();

  if (belirtecler.some(b => b.tip === 'm' && /^(#|[-|]|<)/.test(b.deger))) {
    console.error(`✗ ${slug}: başlık/liste/gömü içeriyor — ürün düzenine uygun değil`);
    continue;
  }

  let banner = null;
  let i = 0;
  if (belirtecler.length && belirtecler[0].tip === 'g') { banner = belirtecler[0].deger; i = 1; }

  const cikti = [];
  let biriken = [];
  for (; i < belirtecler.length; i++) {
    const b = belirtecler[i];
    if (b.tip === 'g') {
      cikti.push({ metin: biriken.join('\n\n'), gorsel: b.deger });
      biriken = [];
    } else {
      biriken.push(b.deger);
    }
  }
  if (biriken.length) cikti.push({ metin: biriken.join('\n\n'), gorsel: null });

  if (!cikti.length) { console.error(`✗ ${slug}: blok üretilemedi`); continue; }

  const satirlar = ['---', fm, 'duzen: urun'];
  if (banner) satirlar.push(`banner: ${JSON.stringify(banner)}`);
  satirlar.push('bloklar:');
  for (const b of cikti) {
    const parcalar = [];
    if (b.metin) parcalar.push(`    metin: |-\n${blokMetin(b.metin)}`);
    if (b.gorsel) parcalar.push(`    gorsel: ${JSON.stringify(b.gorsel)}`);
    satirlar.push('  -' + parcalar.join('\n').slice(3));
  }
  satirlar.push('---', '');

  const yeni = satirlar.join('\n');
  const ozet = cikti.map(b => (b.gorsel ? (b.metin ? 'görsel+metin' : 'görsel') : 'metin')).join(', ');
  console.log(`✓ ${slug}: banner=${banner ? 'var' : 'yok'}  ${cikti.length} blok (${ozet})`);
  if (KURU) console.log(yeni.slice(0, 700) + '\n…\n');
  else await writeFile(dosya, yeni, 'utf8');
}
