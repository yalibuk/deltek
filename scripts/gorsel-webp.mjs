/**
 * Görselleri WebP'ye çevirir (sayfa ağırlığı / PageSpeed).
 *
 *   node scripts/gorsel-webp.mjs --kuru                       # yazmadan ölç ve raporla
 *   node scripts/gorsel-webp.mjs                              # hero'yu çevir, kaynağı bırak
 *   node scripts/gorsel-webp.mjs --sil                        # üret ve kaynağı sil
 *   node scripts/gorsel-webp.mjs --klasor public/images/uploads --kullanilan
 *
 * SEÇENEKLER
 *   --klasor <yol[,yol]>  Taranacak klasör(ler). Varsayılan: public/images/hero
 *   --kullanilan          Yalnız `src/` içinden BAĞLANAN dosyaları çevirir.
 *                         Ziyaretçinin indirmediği bir dosyayı çevirmek hız
 *                         kazandırmaz; uploads klasöründe 24 yetim dosya var.
 *                         DİKKAT: tek seferliktir. Referanslar .webp'ye
 *                         çevrildikten sonra kaynak .jpg'ler artık "bağlı"
 *                         görünmez ve bayrak her şeyi eler. Sonradan tek dosya
 *                         çevirmek gerekirse --klasor ile o klasörü verin.
 *   --sil                 Kaynağı siler. Verilmezse kaynak yerinde kalır.
 *   --kuru                Hiçbir şey yazmaz, yalnız ölçer.
 *
 * ÖLÇÜ DEĞİŞMEZ. Arka planlar `object-fit: cover` ile basılıyor ve slider
 * dar ekranda `4/3` oranına geçiyor (HeroSlider `.slider__ray`); kaynağı
 * 1920x500'e kırpmak masaüstünde işe yarar ama mobilde görselin yanlarını
 * kırpardı. Bu yüzden yalnızca BİÇİM değişir, piksel ölçüsü aynı kalır.
 *
 * KALİTE ÖLÇÜMÜ: kaynak ile çıktı düz gri zemine düzleştirilip (alfa dahil
 * edilerek) piksel piksel karşılaştırılır; yani ölçülen şey EKRANDA GÖRÜNEN
 * farktır. Saydam bölgedeki RGB değerleri iki biçimde farklı olabilir ama
 * görünmez — düzleştirmeden ölçmek 255'e varan sahte farklar üretiyordu.
 * Ortalama fark 0-255 ölçeğinde ~3'ün altındaysa gözle ayırt edilemez.
 *
 * KALİTE SEÇİMİ (fotoğraflar): q78 ile başlanır; kazanç %10'un altında
 * kalırsa q72 denenir, o da yetmezse dosya ATLANIR. Kural: hiçbir görsel
 * dönüşümle ağırlaşmasın, ağırlaşmıyorsa da kazanç anlamlı olsun.
 * Kaynaklar zaten JPEG (kayıplı); ölçülen fark kaynağa göredir.
 *
 * Saydam PNG katmanları q90 + `alphaQuality: 100`: bunlar fotoğraf üstüne
 * binen kesim görselleri. Katmanların hepsi `loading="lazy"` (LCP olan 1.
 * slaytta katman yok), yani birkaç KB'lık fazlalık ilk boyamayı geciktirmez;
 * bu yüzden katmanlarda kalite lehine seçim yapıldı.
 *
 * `smartSubsample: true` HER İKİSİNDE de açık. Ölçüldü: kalan farkların
 * çoğu nicemlemeden değil, WebP'nin varsayılan 4:2:0 renk altörneklemesinden
 * geliyordu — kaliteyi q86'dan q97'ye çıkarmak görünür farkı %6.03'ten ancak
 * %5.48'e indiriyor (dosya %54 büyüyor), oysa `smartSubsample` ~1 KB
 * karşılığında %4.82'ye indiriyor. Aynısı fotoğraflarda da geçerli
 * (LCP görselinde %1.80 → %1.00).
 */
import { readdir, readFile, writeFile, stat, unlink } from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';

// sharp bu projede DOĞRUDAN bağımlılık değil; Astro'nun görsel servisi
// üzerinden geliyor. Düz `import sharp` çözülmediği için doğrudan yoldan
// çağrılır (aynı yöntem scripts/og-gorsel-uret.mjs içinde de kullanılıyor).
const require = createRequire(import.meta.url);
const sharp = require('../node_modules/sharp/dist/index.cjs');

const ARG = process.argv.slice(2);
const bayrak = (ad) => ARG.includes('--' + ad);
const deger = (ad, varsayilan) => {
  const i = ARG.indexOf('--' + ad);
  return i >= 0 && ARG[i + 1] ? ARG[i + 1] : varsayilan;
};

const KURU = bayrak('kuru');
const SIL = bayrak('sil');
const YALNIZ_KULLANILAN = bayrak('kullanilan');

/** Dönüştürülecek klasörler. Alt klasörler de taranır. */
const KLASORLER = deger('klasor', 'public/images/hero').split(',');

/** Bu dosyalar hiçbir yerden kullanılmıyor; dönüştürmeye değmez. */
const ATLA = new Set([
  'deltek-yatay-sondaj-marka.jpg',   // hiçbir sayfada referansı yok
  'machinery1_org.png',              // makine katmanının eski sürümü (yedek)
]);

const KB = (n) => (n / 1024).toFixed(0).padStart(4) + ' KB';

/**
 * `src/` içinden bağlanan tüm `/images/...` yolları. `--kullanilan` bunu
 * kullanır: yetim dosyayı çevirmek ziyaretçiye hiçbir şey kazandırmaz, yalnız
 * depoyu şişirir. (uploads klasöründeki 24 dosya hiçbir sayfadan bağlanmıyor;
 * eski WordPress içeriğinden kalmışlar.)
 */
async function srcReferanslari() {
  const gez = async (d) => {
    const c = [];
    for (const ad of await readdir(d)) {
      const p = path.join(d, ad);
      if ((await stat(p)).isDirectory()) c.push(...await gez(p));
      else if (/\.(md|astro|ts|css|yml)$/.test(ad)) c.push(p);
    }
    return c;
  };
  const metin = (await Promise.all((await gez('src')).map(p => readFile(p, 'utf8')))).join('\n');
  return new Set([...metin.matchAll(/\/images\/[^"'\)\s`]+/g)].map(m => m[0]));
}

async function dosyalar(dizin) {
  const sonuc = [];
  for (const ad of await readdir(dizin)) {
    const p = path.join(dizin, ad);
    if ((await stat(p)).isDirectory()) { sonuc.push(...await dosyalar(p)); continue; }
    if (/\.(jpe?g|png|gif)$/i.test(ad) && !ATLA.has(ad)) sonuc.push(p);
  }
  return sonuc;
}

/**
 * İki görselin GÖRÜNEN farkı: ikisi de aynı düz gri zemine düzleştirilir
 * (saydam pikseller böylece zeminle aynı olur ve görünmez fark sayılmaz),
 * sonra piksel piksel karşılaştırılır. Değerler 0-255 ölçeğinde.
 */
async function fark(aBuf, bBuf) {
  const dz = (buf) => sharp(buf).flatten({ background: '#808080' }).raw().toBuffer();
  const [a, b] = await Promise.all([dz(aBuf), dz(bBuf)]);
  if (a.length !== b.length) return null;
  let toplam = 0, azami = 0;
  for (let i = 0; i < a.length; i++) {
    const d = Math.abs(a[i] - b[i]);
    toplam += d;
    if (d > azami) azami = d;
  }
  return { ort: toplam / a.length, azami };
}

/** Anlamlı sayılan en düşük kazanç. Altında kalan dönüşüm yapılmaz. */
const ASGARI_KAZANC = 0.10;

/** Altındaki doku ölçüsü "düz alanlı çizim" sayılır (bkz. dokuOlcusu). */
const DUZ_ESIK = 8;

/**
 * Görselin dokusu: yatay komşu pikseller arasındaki ortalama fark (0-255).
 * Düz alanlı çizim/şemada düşük (genelde < 8), fotoğrafta ve dithering'le
 * renk indirgenmiş görselde yüksek çıkar.
 */
async function dokuOlcusu(girdi) {
  const { data, info } = await sharp(girdi).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  let toplam = 0, n = 0;
  for (let y = 0; y < info.height; y++) {
    for (let x = 1; x < info.width; x++) {
      const i = (y * info.width + x) * info.channels;
      toplam += Math.abs(data[i] - data[i - info.channels]);
      n++;
    }
  }
  return n ? toplam / n : 0;
}

/**
 * Dosyaya uygun WebP çıktısı. Saydam katmanlar tek kalitede; fotoğraflar
 * kazanç eşiğini tutturana kadar kaliteyi kademeli düşürür.
 */
async function webpUret(girdi, meta) {
  const ortak = { effort: 6, smartSubsample: true };

  // GIF bir KAP, içerik değil. Karar biçime göre değil İÇERİĞE göre verilir:
  // düz alanlı çizim/şemada kayıpsız WebP hem küçük hem birebir; dokulu
  // (fotoğraf ya da dithering'le renk indirgenmiş) görselde kayıpsız,
  // gürültüyü de kodlamak zorunda kaldığı için şişer.
  //
  // Bu sitedeki tek GIF ölçüldü: 168 renk ama komşu piksel farkı 16.92 —
  // yani GIF'e kaydedilmiş dithered bir SAHA FOTOĞRAFI. Kayıpsız %17'de
  // kalıyor (175 KB), kayıplı %58 kazanıyor (88 KB) ve yan yana bakıldığında
  // ayırt edilemiyor. Bu yüzden eşik: doku < 8 ise kayıpsız, değilse kayıplı.
  if (meta.format === 'gif') {
    if (await dokuOlcusu(girdi) < DUZ_ESIK) {
      const b = await sharp(girdi).webp({ ...ortak, lossless: true }).toBuffer();
      return { b, q: 'kyps' };
    }
    // dokulu: aşağıdaki fotoğraf yoluna düşsün
  }
  if (meta.hasAlpha) {
    const b = await sharp(girdi).webp({ ...ortak, quality: 90, alphaQuality: 100 }).toBuffer();
    return { b, q: 'q90 ' };
  }
  for (const q of [78, 72]) {
    const b = await sharp(girdi).webp({ ...ortak, quality: q }).toBuffer();
    if (b.length <= girdi.length * (1 - ASGARI_KAZANC)) return { b, q: 'q' + q + ' ' };
    if (q === 72) return { b, q: 'q72 ' };   // son deneme; çağıran taraf eşiğe bakıp atar
  }
}

let hepsi = (await Promise.all(KLASORLER.map(dosyalar))).flat();
let yetim = 0;
if (YALNIZ_KULLANILAN) {
  const ref = await srcReferanslari();
  const once = hepsi.length;
  hepsi = hepsi.filter(p => ref.has('/' + path.relative('public', p).split(path.sep).join('/')));
  yetim = once - hepsi.length;
}
let oncekiToplam = 0, sonrakiToplam = 0, yazilan = 0, atlanan = 0;

console.log(`\n${hepsi.length} görsel — WebP dönüşümü${KURU ? ' (KURU ÇALIŞMA, dosya yazılmaz)' : ''}` +
  `${yetim ? ` · ${yetim} yetim dosya atlandı (src'den bağlanmıyor)` : ''}\n`);
console.log('  kaynak →   webp   kazanç  kal.  fark(ort/azami)  dosya');

for (const kaynak of hepsi.sort()) {
  const girdi = await readFile(kaynak);
  const meta = await sharp(girdi).metadata();
  const { b: cikti, q } = await webpUret(girdi, meta);

  const hedef = kaynak.replace(/\.(jpe?g|png|gif)$/i, '.webp');
  const f = await fark(girdi, cikti);
  const kazanc = 100 * (1 - cikti.length / girdi.length);
  const ad = path.relative(KLASORLER[0], kaynak).split(path.sep).join('/');

  // Kural: kazanç eşiğin altındaysa kaynak olduğu gibi kalır.
  if (cikti.length > girdi.length * (1 - ASGARI_KAZANC)) {
    console.log(`${KB(girdi.length)} → ${KB(cikti.length)}   ATLANDI (kazanç < %10)  ${ad}`);
    atlanan++; oncekiToplam += girdi.length; sonrakiToplam += girdi.length;
    continue;
  }

  console.log(
    `${KB(girdi.length)} → ${KB(cikti.length)}  %${kazanc.toFixed(0).padStart(3)}  ${q}` +
    `   ${f ? f.ort.toFixed(2).padStart(5) + ' / ' + String(f.azami).padStart(3) : '   —  '}` +
    `      ${ad}`);

  oncekiToplam += girdi.length; sonrakiToplam += cikti.length;
  if (!KURU) {
    await writeFile(hedef, cikti);
    if (SIL) await unlink(kaynak);
    yazilan++;
  }
}

console.log(
  `\nToplam ${KB(oncekiToplam)} → ${KB(sonrakiToplam)} ` +
  `(%${(100 * (1 - sonrakiToplam / oncekiToplam)).toFixed(0)} daha küçük)` +
  `${atlanan ? `, ${atlanan} dosya atlandı` : ''}` +
  `${KURU ? '' : `, ${yazilan} .webp yazıldı`}`);
if (!KURU && !SIL && yazilan) {
  console.log('\nKaynak dosyalar yerinde duruyor; site referansları .webp ile güncellenmeli.');
}
