/**
 * Teknoloji banner'larından başlık metnini atar, sembolü src/assets/banner/
 * altına yazar. Üretilen dosyalar depoda duruyor; bu betik yalnızca kaynak
 * görseller değişirse veya kesim yeri düzeltilecekse yeniden çalıştırılır.
 *
 *   node scripts/banner-sembol-kes.mjs
 *
 * NEDEN: canlı deltek.com.tr'de sayfa başlığı bu 1170x350'lik JPEG'lerin
 * SOLUNA gömülüydü; hemen üstünde bir de gerçek <h1> vardı, yani aynı başlık
 * sayfada iki kez çıkıyordu. Başlık artık yalnızca HTML metni olarak
 * basılıyor (src/components/SayfaBanner.astro), görselde yalnız sembol kalıyor.
 *
 * KESİM YERİ: metin bloğu ile sembol arasında, görselin TAMAMEN boş (yalnız
 * zemin gradyanı) kaldığı bir sütun aralığı var. Aşağıdaki `sol` değerleri o
 * aralıktan seçildi: sembolün soluna en çok 40px pay bırakacak şekilde
 * `sol = max(boşlukBaşı, boşlukSonu - 40)`. Değerler elle doğrulandı; kaynak
 * görsel değişirse yeniden bulunmalı.
 */
import { createRequire } from 'node:module';
import { mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';

// sharp'ı doğrudan yoldan çağırıyoruz (bkz. og-gorsel-uret.mjs'deki not).
const require = createRequire(import.meta.url);
const sharp = require(path.resolve('node_modules/sharp/dist/index.cjs'));

const KAYNAK = 'public/images/uploads/2015/08';
const HEDEF = 'src/assets/banner';

/** kaynak dosya adı → kesimin başladığı x. Çıktı adı `-1` eki atılarak üretilir. */
const KESIM = {
  'kazisiz-akilli-altyapi-1.jpg': 784,
  'yatay-sondaj-boru-surme-cakma-1.jpg': 713,
  'kazisiz-boru-yenileme-1.jpg': 486,
  'yonlendirilebilir-yatay-sondaj-delgi-tijleri-1.jpg': 694,
  'yonlendirilebilir-yatay-sondaj-genisletme-basligi-1.jpg': 617,
  'yonlendirilebilir-yatay-sondaj-manyetik-yonlendirme-1.jpg': 729,
  'yonlendirilebilir-yatay-sondaj-uzerinden-takip-1.jpg': 787,
  'yonlendirilebilir-yatay-sondaj-camuru-1.jpg': 650,
  'yonlendirilebilir-yatay-sondaj-yer-belirleme-sistemleri-1.jpg': 751,
  'yonlendirilebilir-yatay-sondaj-makinesi-1.jpg': 653,
  'yonlendirilebilir-yatay-sondaj-nedir-1.jpg': 878,
  'yonlendirilebilir-yatay-sondaj-metodu-1.jpg': 760,
  'yonlendirilebilir-yatay-sondaj-yonlendirme-basligi-1.jpg': 719,
};

// Kaynakların zemini x'ten bağımsız düşey gri gradyan. Banner kutusu da aynı
// iki tonu kullanır (--banner-ust / --banner-alt), dikiş bu yüzden görünmüyor.
const ZEMIN_UST = 245, ZEMIN_ALT = 236;
// Beyaz kutu temizliği: TAM ve üzeri tamamen zemine boyanır, YUMUSAK–TAM arası
// kademeli (nesnenin kenarındaki JPEG bulanıklığında halo kalmasın diye).
const YUMUSAK = 246, TAM = 250;

/**
 * Bazı clipart'ların kırpılmamış BEYAZ kutusu var; gradyan zeminin üstünde
 * açık bir dikdörtgen olarak görünüyor. Kenara bitişik beyaz bölgeyi
 * taşma-doldurmayla bulup zemine boyar — nesnenin İÇİNDEKİ beyaz parlamalar
 * kenara bağlı olmadığı için korunur.
 */
function beyazKutuyuTemizle(data, W, H, C) {
  const bekle = (y) => ZEMIN_UST - (ZEMIN_UST - ZEMIN_ALT) * (y / (H - 1));
  const parlak = (x, y) => {
    const i = (y * W + x) * C, r = data[i], g = data[i + 1], b = data[i + 2];
    return Math.min(r, g, b) >= YUMUSAK && Math.max(r, g, b) - Math.min(r, g, b) < 6;
  };
  const bolge = new Uint8Array(W * H);
  const yigin = [];
  for (let x = 0; x < W; x++) yigin.push(x, x + (H - 1) * W);
  for (let y = 0; y < H; y++) yigin.push(y * W, W - 1 + y * W);
  while (yigin.length) {
    const k = yigin.pop();
    if (bolge[k]) continue;
    const x = k % W, y = (k - x) / W;
    if (!parlak(x, y)) continue;
    bolge[k] = 1;
    if (x + 1 < W) yigin.push(k + 1);
    if (x > 0) yigin.push(k - 1);
    if (y + 1 < H) yigin.push(k + W);
    if (y > 0) yigin.push(k - W);
  }
  let n = 0;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const k = y * W + x;
    if (!bolge[k]) continue;
    const i = k * C;
    const agirlik = Math.min(1, Math.max(0, (data[i] - YUMUSAK) / (TAM - YUMUSAK)));
    if (agirlik <= 0) continue;
    const hedef = bekle(y);
    for (let c = 0; c < 3; c++) data[i + c] = Math.round(data[i + c] * (1 - agirlik) + hedef * agirlik);
    n++;
  }
  return n;
}

await mkdir(HEDEF, { recursive: true });
for (const [ad, sol] of Object.entries(KESIM)) {
  const kaynak = path.join(KAYNAK, ad);
  const cikti = path.join(HEDEF, ad.replace(/-1\.jpg$/, '.jpg'));

  const { data, info } = await sharp(kaynak)
    .extract({ left: sol, top: 0, width: 1170 - sol, height: 350 })
    .raw().toBuffer({ resolveWithObject: true });

  const boyanan = beyazKutuyuTemizle(data, info.width, info.height, info.channels);
  const { size } = await sharp(data, { raw: info })
    .jpeg({ quality: 88, mozjpeg: true }).toFile(cikti);

  console.log(`${String(info.width).padStart(4)}x${info.height}  ${String(Math.round(size / 1024)).padStart(3)}KB` +
    `  ${boyanan ? String(boyanan).padStart(6) + ' px boyandı' : '              '}  ${path.basename(cikti)}`);
}

const n = (await readdir(HEDEF)).filter((f) => f.endsWith('.jpg')).length;
console.log(`\n${n} sembol → ${HEDEF}/`);
console.log('Yeni sembol eklendiyse public/admin/config.yml bannerSembol listesine de yaz.');
