/**
 * Referans logolarının çevresindeki boş payı kırpar.
 *
 *   node scripts/referans-logo-kirp.mjs
 *
 * NEDEN: kaynak logolar çok farklı çerçevelenmiş. Canlı siteden gelen yedi
 * logo 400×400 JPEG ve logo bu karenin içinde küçük duruyor; Saipem/Aramco
 * ise saydam PNG ve görsel çerçeveyi dolduruyor. Hepsi aynı yükseklikte
 * basılınca optik boyut 9 KAT fark ediyordu (144px'lik şeritte Siemens'in
 * görseli 16px, Aramco'nunki 144px).
 *
 * Kırpıldıktan sonra her dosyanın kendisi = logonun kendisi olur; şerit de
 * sabit bir kutuya `object-fit: contain` ile oturttuğu için geniş logolar
 * genişlikten, uzun logolar yükseklikten sınırlanır ve göz dengeli görür.
 *
 * Kaynaklara DOKUNULMAZ; çıktı `public/images/referans/` altına yazılır.
 * Betik yeniden çalıştırılabilir: çıktı klasöründeki dosya varsa üzerine yazar.
 */
import { createRequire } from 'node:module';
import { mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const require = createRequire(import.meta.url);
const sharp = require(path.resolve('node_modules/sharp/dist/index.cjs'));

const HEDEF = 'public/images/referans';

/** çıktı adı → kaynak yolu */
const KAYNAK = {
  'kolin.jpg':    'public/images/uploads/2015/08/kolin.jpg',
  'tcdd.jpg':     'public/images/uploads/2015/08/tcdd.jpg',
  'ericsson.jpg': 'public/images/uploads/2015/08/ericsson.jpg',
  'iski.jpg':     'public/images/uploads/2015/08/iski.jpg',
  'siemens.jpg':  'public/images/uploads/2015/08/siemens.jpg',
  'teias.jpg':    'public/images/uploads/2015/08/teias.jpg',
  'botas.jpg':    'public/images/uploads/2015/08/botas.jpg',
  // Saydam PNG'ler kullanıcı tarafından eklendi; Saipem'in de payı var.
  'saipem.png':   'public/images/referans/kaynak/saipem.png',
  'aramco.png':   'public/images/referans/kaynak/aramco.png',
};

/** Beyaz VEYA saydam sayılan piksel — kırpma bunun dışında kalanı tutar. */
const BOS_ESIK = 244;

async function icerikKutusu(yol) {
  const { data, info } = await sharp(yol).ensureAlpha().raw()
    .toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels: C } = info;
  let x0 = W, y0 = H, x1 = -1, y1 = -1;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = (y * W + x) * C;
    const bos = data[i + 3] < 16 ||
      (data[i] > BOS_ESIK && data[i + 1] > BOS_ESIK && data[i + 2] > BOS_ESIK);
    if (bos) continue;
    if (x < x0) x0 = x; if (y < y0) y0 = y;
    if (x > x1) x1 = x; if (y > y1) y1 = y;
  }
  if (x1 < 0) return null;                       // tamamen boş
  return { left: x0, top: y0, width: x1 - x0 + 1, height: y1 - y0 + 1, W, H };
}

await mkdir(HEDEF, { recursive: true });
for (const [ad, kaynak] of Object.entries(KAYNAK)) {
  const kutu = await icerikKutusu(kaynak).catch(() => null);
  if (!kutu) { console.log(`${ad.padEnd(14)} ATLANDI (kaynak okunamadı: ${kaynak})`); continue; }
  const { left, top, width, height, W, H } = kutu;
  const bicim = ad.endsWith('.png') ? { png: { compressionLevel: 9 } } : { jpeg: { quality: 92, mozjpeg: true } };
  let p = sharp(kaynak).extract({ left, top, width, height });
  p = ad.endsWith('.png') ? p.png(bicim.png) : p.jpeg(bicim.jpeg);
  const { size } = await p.toFile(path.join(HEDEF, ad));
  console.log(`${ad.padEnd(14)} ${String(W + 'x' + H).padEnd(11)} -> ${String(width + 'x' + height).padEnd(11)} ${Math.round(size / 1024)}KB`);
}
console.log(`\nÇıktı: ${HEDEF}/  — src/data/referanslar.ts bu yolları gösterir.`);
