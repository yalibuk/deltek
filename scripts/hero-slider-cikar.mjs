// Canlı deltek.com.tr ana sayfasındaki Revolution Slider'ı ham HTML'den
// tam olarak çıkarır: her slaydın arka planı + her katmanın içeriği,
// konumu, animasyon sınıfı, gecikmesi ve süresi.
import { readFile, writeFile } from 'node:fs/promises';

const h = await readFile('anasayfa.html', 'utf8');
const bas = h.indexOf('rev_slider_3_1');
const ulBas = h.indexOf('<ul>', bas);
const ulSon = h.indexOf('</ul>', ulBas);
const blok = h.slice(ulBas, ulSon);

/** acilisIdx'teki etiketin eşleşen kapanışını bulur. */
function eslesme(s, i, etiket) {
  const re = new RegExp(`<${etiket}\\b[^>]*>|</${etiket}\\s*>`, 'gi');
  re.lastIndex = i;
  let d = 0, m, basla = -1;
  while ((m = re.exec(s))) {
    if (m[0][1] !== '/') { if (d === 0) basla = m.index + m[0].length; d++; }
    else { d--; if (d === 0) return { ic: s.slice(basla, m.index), son: re.lastIndex }; }
  }
  return null;
}

const attr = (s, a) => (s.match(new RegExp(`${a}="([^"]*)"`)) || [])[1] || '';
const ENT = { amp:'&', lt:'<', gt:'>', quot:'"', apos:"'", nbsp:' ', hellip:'…',
  ldquo:'“', rdquo:'”', lsquo:'‘', rsquo:'’', mdash:'—', ndash:'–' };
const decode = (s) => s
  .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d))
  .replace(/&([a-z]+);/gi, (m, n) => (n.toLowerCase() in ENT ? ENT[n.toLowerCase()] : m));

// RevSlider geçiş sınıfları — animasyon adı olarak ayrılır
const GECIS = ['sfl','sfr','sft','sfb','lfl','lfr','lft','lfb','randomrotate',
               'tp-fade','fade','skewfromleft','skewfromright'];

const slaytlar = [];
let li = blok.indexOf('<li');
while (li >= 0) {
  const e = eslesme(blok, li, 'li');
  if (!e) break;
  const s = e.ic;
  const arka = (s.match(/src="([^"]*wp-content\/uploads[^"]*)"/) || [])[1] || null;

  const katmanlar = [];
  let ci = s.indexOf('<div class="tp-caption');
  while (ci >= 0) {
    const ce = eslesme(s, ci, 'div');
    if (!ce) break;
    const acilis = s.slice(ci, s.indexOf('>', ci) + 1);
    const sinifTam = attr(acilis, 'class').replace(/^tp-caption\s*/, '').trim();
    const siniflar = sinifTam.split(/\s+/).filter(Boolean);
    const gecis = siniflar.filter(c => GECIS.includes(c));
    const stil = siniflar.filter(c => !GECIS.includes(c) && !['tp-resizeme','start','fadeout','str','tp-videolayer'].includes(c));

    const imgTag = ce.ic.match(/<img[^>]*>/);
    const tur = imgTag ? 'gorsel' : (/<iframe|tp-videolayer/.test(ce.ic + acilis) ? 'video' : 'metin');
    const metin = tur === 'metin'
      ? decode(ce.ic.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '')).replace(/[ \t]+/g, ' ').trim()
      : null;

    katmanlar.push({
      tur,
      ...(tur === 'gorsel' ? {
        src: attr(imgTag[0], 'src'),
        w: +attr(imgTag[0], 'width') || null,
        h: +attr(imgTag[0], 'height') || null,
      } : {}),
      ...(metin ? { metin } : {}),
      ...(tur === 'video' ? { ham: ce.ic.slice(0, 300) } : {}),
      x: +attr(acilis, 'data-x') || 0,
      y: +attr(acilis, 'data-y') || 0,
      gecis: gecis[0] || 'fade',
      fadeout: /\bfadeout\b/.test(sinifTam),
      stil,
      basla: +attr(acilis, 'data-start') || 0,
      sure: +attr(acilis, 'data-speed') || 500,
      easing: attr(acilis, 'data-easing'),
    });
    ci = s.indexOf('<div class="tp-caption', ce.son);
  }

  slaytlar.push({ no: slaytlar.length + 1, arka, katmanlar });
  li = blok.indexOf('<li', e.son);
}

await writeFile('slider.json', JSON.stringify(slaytlar, null, 2), 'utf8');
console.log(`${slaytlar.length} slayt, ${slaytlar.reduce((a, s) => a + s.katmanlar.length, 0)} katman -> slider.json`);
for (const s of slaytlar) {
  console.log(`\nSLAYT ${s.no}  ${(s.arka || '').split('/').pop()}`);
  for (const k of s.katmanlar) {
    const ic = k.tur === 'gorsel' ? k.src.split('/').pop() : (k.metin || k.tur).slice(0, 46).replace(/\n/g, ' / ');
    console.log(`  ${k.tur.padEnd(7)} ${k.gecis.padEnd(12)} x=${String(k.x).padStart(4)} y=${String(k.y).padStart(3)} start=${String(k.basla).padStart(4)} sure=${String(k.sure).padStart(4)} stil=[${k.stil.join(' ')}] ${ic}`);
  }
}
