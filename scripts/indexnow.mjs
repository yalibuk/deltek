/**
 * IndexNow — Bing, Yandex, Seznam, Naver (ve Bing'in dizinini kullanan
 * ChatGPT/Copilot aramaları) için anında dizin bildirimi.
 *
 *   npm run build && node scripts/indexnow.mjs            # sitemap'teki tüm URL'ler
 *   node scripts/indexnow.mjs https://www.deltek.com.tr/blog/ ...   # yalnız verilenler
 *
 * Anahtar: public/<ANAHTAR>.txt dosyası sitede yayında olmalı (IndexNow
 * sahipliği böyle doğrular). Anahtar değişirse dosya adını da değiştirin.
 * Google IndexNow'a katılmıyor; onun için Search Console'daki sitemap yeter.
 *
 * Yanıt: 200/202 kabul, 400 anahtar/biçim hatası, 403 anahtar dosyası
 * bulunamadı, 422 URL'ler bu host'a ait değil, 429 çok sık.
 */
import { readFile } from 'node:fs/promises';

export const INDEXNOW_ANAHTAR = '7f3c9a1e4b8d2f6a0c5e9b7d3a1f8c2e';
const HOST = 'www.deltek.com.tr';

const verilen = process.argv.slice(2).filter(a => a.startsWith('http'));
let urlList = verilen;
if (!urlList.length) {
  const sm = await readFile('dist/sitemap-0.xml', 'utf8');
  urlList = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
}
if (!urlList.length) { console.error('Gönderilecek URL yok (önce npm run build).'); process.exit(1); }

const govde = { host: HOST, key: INDEXNOW_ANAHTAR, keyLocation: `https://${HOST}/${INDEXNOW_ANAHTAR}.txt`, urlList };
const r = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify(govde),
});
console.log(`${urlList.length} URL gönderildi → HTTP ${r.status} ${r.statusText}`);
if (r.status >= 400) { console.error(await r.text()); process.exit(1); }
