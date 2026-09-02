// slider.json -> deltek-site/src/data/hero.ts
import { readFile, writeFile } from 'node:fs/promises';

const HEDEF = process.argv[2];
const slaytlar = JSON.parse(await readFile('slider.json', 'utf8'));

// Türkçe metin -> İngilizce karşılığı (çeviri; Deltek onayından geçmedi)
const EN = {
  'ONSHORE / OFFSHORE\n\nHDD PROJELERİNDE\n\nGÜVENİLİR İŞ ORTAĞINIZ': 'YOUR RELIABLE PARTNER\n\nIN ONSHORE / OFFSHORE\n\nHDD PROJECTS',
  'ELEKTRİK': 'POWER',
  'DOĞALGAZ': 'NATURAL GAS',
  'KANALİZASYON': 'SEWERAGE',
  'TELEKOMÜNİKASYON': 'TELECOMS',
  'İÇME SUYU VE DRENAJ': 'POTABLE WATER & DRAINAGE',
  "YATAY SONDAJ'a ihtiyaç duyduğunuz her alanda yanınızdayız...": 'Wherever you need HORIZONTAL DRILLING, we are with you...',
  'Ayrıntılı bilgi ve referans listemiz için lütfen İLETİŞİME GEÇİN!': 'For details and our reference list, please GET IN TOUCH!',
  'KAYA DELGİ & MUAZZAM GÜÇ': 'ROCK DRILLING & IMMENSE POWER',
  'YATAY DELGİ VE SONDAJ': 'HORIZONTAL DRILLING AND',
  'TEKNOLOJİLERİ': 'BORING TECHNOLOGIES',
  'AMACINIZA EN UYGUN': 'START BY CHOOSING',
  'YATAY SONDAJ YÖNTEMİNİ': 'THE DRILLING METHOD',
  'SEÇEREK İŞE BAŞLAYIN': 'THAT FITS YOUR PURPOSE',
  'BİZE ULAŞIN': 'CONTACT US',
  'DOĞRU YERDESİNİZ': 'YOU ARE IN THE RIGHT PLACE',
  'YATAY SONDAJ UZMANI': 'HORIZONTAL DRILLING SPECIALIST',
  'YÜKSEK TEKNOLOJİK ALTYAPI': 'ADVANCED TECHNICAL INFRASTRUCTURE',
  'GENİŞ MAKİNE PARKI': 'EXTENSIVE MACHINE FLEET',
  '- Başarı, tesadüften fazlasını gerektirir\n\nKŞ': '- Success takes more than coincidence\n\nKŞ',
  'HEMEN ARAYIN': 'CALL US NOW',
  'SİZİN İÇİN PROJELENDİRELİM': 'LET US ENGINEER IT FOR YOU',
  'Bir sonraki neden sizinki olmasın?': 'Why not make the next one yours?',
  'HEMEN TEKLİF İSTE': 'REQUEST A QUOTE',
  'ALT YAPIDA FARK YARATAN': 'GET AHEAD OF YOUR RIVALS',
  'ETKİN ÇÖZÜMLERİMİZLE': 'WITH EFFECTIVE SOLUTIONS',
  'RAKİPLERİNİZİN ÖNÜNE': 'THAT MAKE A DIFFERENCE',
  'GEÇİN': 'IN INFRASTRUCTURE',
  'DELTEK': 'DELTEK',
  'YATAY SONDAJDA': 'A GLOBAL BRAND IN',
  'BİR DÜNYA MARKASI': 'HORIZONTAL DRILLING',
};
const enCevir = (t) => {
  if (EN[t]) return EN[t];
  // uzun paragraflar
  if (t.startsWith('Uygulanacak projeyi')) return 'We model the project with computer software and share the results with you before we start.';
  if (t.startsWith('Hepsi alanında uzman')) return 'Our team of specialist engineers and technicians';
  if (t.startsWith('hergün')) return "delivers HORIZONTAL DRILLING and boring solutions every day, for diameters from 2 mm to 2000 mm,";
  if (t.startsWith('YATAY SONDAJ ve TEKNOLOJİK')) return 'across countless infrastructure projects.';
  return t;
};

const YEREL = (u) => '/images/hero/katman/' + u.split('/').pop();
const ARKA = (u) => '/images/hero/' + u.split('/').pop();
// canlı sunucuda 404 veren katman
const ATLA = ['1woman.png'];

const alan = (k, dil) => {
  const p = [`tur: '${k.tur}'`];
  if (k.tur === 'gorsel') p.push(`src: '${YEREL(k.src)}'`, `w: ${k.w}`, `h: ${k.h}`);
  if (k.tur === 'video') p.push(`video: 'https://www.youtube.com/embed/96BoFl4XQOc'`, `w: 476`, `h: 267`);
  if (k.metin) {
    const m = dil === 'en' ? enCevir(k.metin) : k.metin;
    p.push(`metin: ${JSON.stringify(m)}`);
  }
  if (k.stil.length) p.push(`stil: '${k.stil[0]}'`);
  p.push(`x: ${k.x}`, `y: ${k.y}`, `gecis: '${k.gecis}'`, `basla: ${k.basla}`, `sure: ${k.sure}`);
  return '      { ' + p.join(', ') + ' },';
};

function uret(dil) {
  const s = [];
  for (const sl of slaytlar) {
    const kat = sl.katmanlar.filter(k => !(k.tur === 'gorsel' && ATLA.includes(k.src.split('/').pop())));
    s.push(`  {
    arka: '${ARKA(sl.arka)}',
    alt: ${JSON.stringify(dil === 'en' ? (sl.altEn || 'Deltek') : 'Deltek')},
    katmanlar: [
${kat.map(k => alan(k, dil)).join('\n')}
    ],
  },`);
  }
  return s.join('\n');
}

const govde = `// Ana sayfa hero slider verisi — canlı deltek.com.tr'deki Revolution
// Slider'dan birebir çıkarıldı (slayt arka planları, katman görselleri,
// metin katmanları, konumlar, geçiş tipleri, gecikme ve süreler).
//
// KOORDİNAT SİSTEMİ: tüm x/y/w/h ve yazı boyutları canlı slider'ın
// 1920×500 tasarım ızgarasındaki piksel değerleridir. HeroSlider bileşeni
// bunları container-query birimleriyle orantılı olarak ölçekler, yani
// slider hangi genişlikte olursa olsun kompozisyon korunur.
//
// GEÇİŞLER (RevSlider sınıfları):
//   sfl/sfr/sft/sfb  kısa mesafeden (sol/sağ/üst/alt) kayarak gelir
//   lfl/lfr/lft/lfb  ekran dışından (uzun mesafe) kayarak gelir
//   randomrotate     dönerek ve büyüyerek gelir
//   tp-fade          yalnızca belirir
//
// Not: 7. slaydın 1woman.png katmanı canlı sunucuda 404 verdiği için yok.

export type HeroKatman = {
  tur: 'gorsel' | 'metin' | 'video';
  src?: string; video?: string; w?: number; h?: number;
  metin?: string;
  stil?: string;
  x: number; y: number;
  gecis: string;
  basla: number; sure: number;
};
export type HeroSlayt = { arka: string; alt: string; katmanlar: HeroKatman[] };

/** Canlı slider'ın tasarım ızgarası — ölçekleme bu değerlere göre yapılır. */
export const HERO_IZGARA = { g: 1920, y: 500 };

export const HERO_TR: HeroSlayt[] = [
${uret('tr')}
];

// İngilizce metinler Türkçe orijinallerin çevirisidir, Deltek onayından
// geçmedi (bkz. CLAUDE.md).
export const HERO_EN: HeroSlayt[] = [
${uret('en')}
];
`;

await writeFile(HEDEF, govde, 'utf8');
console.log('yazildi:', HEDEF, '—', slaytlar.length, 'slayt');
