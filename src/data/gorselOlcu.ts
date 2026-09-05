/**
 * `public/` altındaki bir görselin en/boy oranını DERLEME sırasında okur.
 *
 * Neden gerekti: teknoloji sayfalarındaki görsellerin 35'inin 30'u 1170×350,
 * yani en/boy oranı 3,34. Bunlar iki sütunlu blokta yarım genişliğe
 * oturtulunca 270×81 piksellik bir şeride dönüşüyor, etrafı bomboş kalıyordu.
 * `UrunDuzen` artık oranı buradan okuyup çok geniş görselleri tam genişliğe
 * yayıyor (bkz. GENIS_ESIK).
 *
 * Neden sharp değil: sharp bu projede DOĞRUDAN bağımlılık değil, Astro'nun
 * görsel servisi üzerinden geliyor. Uygulama kodunun ona dayanmaması için
 * ölçü doğrudan dosya başlığından okunuyor. Desteklenmeyen bir biçimde
 * `null` döner; çağıran taraf o zaman eski (iki sütunlu) düzende bırakır.
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';

/** Aynı görsel birden çok blokta geçebilir; dosya bir kez okunur. */
const bellek = new Map<string, { en: number; boy: number } | null>();

/** JPEG çerçeve başlıkları (SOF0-SOF15); DHT/JPG/DAC bunların dışında. */
const SOF = new Set([
  0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7,
  0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf,
]);

function jpeg(b: Buffer) {
  let i = 2;
  while (i + 9 < b.length) {
    if (b[i] !== 0xff) { i++; continue; }
    const im = b[i + 1];
    if (im === 0xd8 || im === 0x01 || (im >= 0xd0 && im <= 0xd7)) { i += 2; continue; }
    if (im === 0xd9 || im === 0xda) break;          // EOI / görüntü verisi
    if (SOF.has(im)) return { boy: b.readUInt16BE(i + 5), en: b.readUInt16BE(i + 7) };
    i += 2 + b.readUInt16BE(i + 2);
  }
  return null;
}

function png(b: Buffer) {
  return { en: b.readUInt32BE(16), boy: b.readUInt32BE(20) };
}

function gif(b: Buffer) {
  return { en: b.readUInt16LE(6), boy: b.readUInt16LE(8) };
}

/** `/images/…` yolundan ölçü. Dosya yoksa ya da biçim tanınmazsa `null`. */
export async function gorselOlcu(src: string) {
  if (bellek.has(src)) return bellek.get(src)!;
  let sonuc: { en: number; boy: number } | null = null;
  try {
    const b = await readFile(path.join(process.cwd(), 'public', src.replace(/^\//, '')));
    if (b.length > 24) {
      if (b[0] === 0xff && b[1] === 0xd8) sonuc = jpeg(b);
      else if (b.toString('ascii', 1, 4) === 'PNG') sonuc = png(b);
      else if (b.toString('ascii', 0, 3) === 'GIF') sonuc = gif(b);
    }
  } catch {
    sonuc = null;   // yol yanlışsa sayfa yine de derlensin
  }
  if (sonuc && (!sonuc.en || !sonuc.boy)) sonuc = null;
  bellek.set(src, sonuc);
  return sonuc;
}

/** En/boy oranı; ölçülemiyorsa `null`. */
export async function gorselOrani(src: string) {
  const o = await gorselOlcu(src);
  return o ? o.en / o.boy : null;
}
