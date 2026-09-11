/**
 * apple-touch-icon ve PWA/manifest ikonlarını üretir (tek seferlik).
 *
 *   node scripts/ikon-uret.mjs
 *
 * Kaynak: public/deltek-logo.png (300×73, mavi yazı, saydam zemin). Beyaz
 * kare zemine ortalanır; iOS kendi köşe yuvarlatmasını uygular, o yüzden
 * köşeler düz bırakılır. favicon.svg'deki "D" harfi kullanılmadı: librsvg
 * Windows'ta Open Sans'ı bulamayıp yedek yazı tipiyle çiziyor, sonuç markayı
 * temsil etmiyor.
 */
import sharp from '../node_modules/sharp/dist/index.cjs';
import path from 'node:path';

const LOGO = path.resolve('public/deltek-logo.png');
const BOYUTLAR = [['apple-touch-icon.png', 180], ['icon-192.png', 192], ['icon-512.png', 512]];

for (const [ad, boy] of BOYUTLAR) {
  const icPay = Math.round(boy * 0.10);
  const logo = await sharp(LOGO).resize({ width: boy - icPay * 2, fit: 'inside' }).toBuffer();
  await sharp({ create: { width: boy, height: boy, channels: 4, background: '#ffffff' } })
    .composite([{ input: logo, gravity: 'centre' }])
    .png({ compressionLevel: 9 })
    .toFile(path.resolve('public', ad));
  console.log(ad, boy + 'x' + boy);
}
