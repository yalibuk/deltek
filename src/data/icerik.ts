import { getCollection, type CollectionEntry } from 'astro:content';

export type Dil = 'tr' | 'en';
export type Tur = 'yazi' | 'sayfa';

/**
 * Bir içerik kaydı.
 *
 * `anahtar` — DOSYA ADI (`content/<koleksiyon>/<dil>/<anahtar>.md`). İki dilde
 *   AYNIDIR; TR/EN eşleşmesi (hreflang, dil düğmesi, teknoloji ağacı, `ilgili`
 *   listeleri, `TEK_REHBERLER`) hep bununla yapılır. CMS'in i18n yapısı
 *   (`multiple_folders`) da her dilde aynı dosya adını şart koşar.
 * `slug` — URL. Frontmatter `adres` doluysa o, değilse anahtar. İngilizce
 *   sayfalar İngilizce adreslerle yayınlanır (`/en/contact/`), dosya adı
 *   Türkçe kalır (`en/iletisim.md`). TR'de `adres` verilmesi build'i
 *   durdurur: canlı deltek.com.tr adresleri dosya adının kendisidir.
 *
 * Kural: bir kaydı BULMAK için anahtar, ona BAĞLANMAK için slug.
 */
export type Kayit = {
  tur: Tur;
  entry: CollectionEntry<'blog'> | CollectionEntry<'sayfalar'>;
  anahtar: string;
  slug: string;
};

const ms = (d: unknown) => (d ? new Date(d as any).getTime() : 0);
const SLUG_BICIMI = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const dilSuz = (hepsi: any[], dil: Dil, tur: Tur): Kayit[] =>
  hepsi.filter(e => e.id.startsWith(dil + '/'))
       .map(e => {
         const anahtar = e.id.slice(dil.length + 1);
         const ozel = (e.data as any).adres as string | undefined;   // alan adı `slug` olamaz: Astro glob yükleyicisi onu id yapar
         if (ozel && dil === 'tr') {
           throw new Error(
             `${dil}/${anahtar}.md: Türkçe içerikte "adres" alanı KULLANILMAZ — canlı ` +
             `deltek.com.tr adresi dosya adının kendisidir. Alanı silin.`);
         }
         if (ozel && !SLUG_BICIMI.test(ozel)) {
           throw new Error(`${dil}/${anahtar}.md: adres "${ozel}" geçersiz — yalnız küçük harf, rakam ve tire.`);
         }
         return { tur, entry: e, anahtar, slug: ozel || anahtar };
       });

/** Bir dildeki blog yazıları, tarihe göre yeniden eskiye. */
export async function yazilar(dil: Dil): Promise<Kayit[]> {
  const hepsi = await getCollection('blog');
  return dilSuz(hepsi, dil, 'yazi')
    .sort((a, b) => ms((b.entry.data as any).tarih) - ms((a.entry.data as any).tarih));
}

/** Bir dildeki kurumsal/teknoloji sayfaları. */
export async function sayfalar(dil: Dil): Promise<Kayit[]> {
  const hepsi = await getCollection('sayfalar');
  return dilSuz(hepsi, dil, 'sayfa');
}

/**
 * Kök dizinde yayınlanan her şey: yazılar + sayfalar.
 * İki koleksiyon aynı URL alanını paylaştığı için slug çakışması
 * sessizce kazanan/kaybeden üretmek yerine build'i durdurur.
 */
export async function kokIcerik(dil: Dil): Promise<Kayit[]> {
  const hepsi = [...await yazilar(dil), ...await sayfalar(dil)];
  const gorulen = new Map<string, Kayit>();
  for (const k of hepsi) {
    const onceki = gorulen.get(k.slug);
    if (onceki) {
      throw new Error(
        `URL çakışması (${dil}): "/${k.slug}/" hem ${onceki.tur}/${onceki.anahtar} hem ${k.tur}/${k.anahtar} ` +
        `tarafından kullanılıyor. Kök dizinde iki içerik aynı adresi paylaşamaz — ` +
        `birini yeniden adlandırın (TR'de public/_redirects'e 301 ekleyin, bkz. CLAUDE.md).`);
    }
    gorulen.set(k.slug, k);
  }
  return hepsi;
}

/** Verilen anahtarın diğer dilde karşılığı var mı? */
export async function cevirisiVarMi(anahtar: string, hedefDil: Dil): Promise<boolean> {
  return (await karsiSlug(anahtar, hedefDil)) !== null;
}

/**
 * Bir kaydın diğer dildeki URL slug'ı — hreflang ve dil düğmesi için.
 * Çevirisi yoksa null.
 */
export async function karsiSlug(anahtar: string, hedefDil: Dil): Promise<string | null> {
  const k = [...await yazilar(hedefDil), ...await sayfalar(hedefDil)].find(k => k.anahtar === anahtar);
  return k ? k.slug : null;
}

/** Bir anahtarın verilen dildeki URL slug'ı; sayfa yoksa anahtarın kendisi. */
export async function sayfaSlugu(dil: Dil, anahtar: string): Promise<string> {
  return (await karsiSlug(anahtar, dil)) ?? anahtar;
}

/** Header menüsünde gösterilecek sayfalar (menuSira dolu olanlar, sıralı). */
export async function menuSayfalari(dil: Dil): Promise<Kayit[]> {
  return (await sayfalar(dil))
    .filter(k => typeof (k.entry.data as any).menuSira === 'number')
    .sort((a, b) => (a.entry.data as any).menuSira - (b.entry.data as any).menuSira);
}

/* ─── Teknoloji bölümü ──────────────────────────────────────── */

import { TEKNOLOJI, TEK_REHBERLER, type TekDugum } from './teknoloji';

/** Ağaç düğümü + sayfanın kendi verisi (başlık, özet, banner). */
export type TekKart = {
  /** URL slug'ı (dile göre değişir); ağaçtaki kimlik `anahtar`. */
  slug: string;
  anahtar: string;
  ad: string;
  /** Yan menüde kullanılan tam etiket (bkz. teknoloji.ts). */
  tamAd: string;
  baslik: string;
  ozet?: string;
  gorsel?: string;
  alt: TekKart[];
};

/**
 * TEKNOLOJI ağacını içerik koleksiyonuyla birleştirir. Ağaç düğümleri
 * ANAHTARLA (dosya adıyla) tanımlı; her dilde o dilin URL slug'ı basılır.
 *
 * Ağaçtaki bir anahtarın sayfası yoksa build'i DURDURUR: menüde 404'e giden
 * bağlantı bırakmaktansa hatayı derlemede görmek daha iyi.
 */
export async function teknolojiAgaci(dil: Dil, zorunlu = dil === 'tr'): Promise<TekKart[]> {
  const hepsi = new Map((await sayfalar(dil)).map(k => [k.anahtar, k]));
  const donustur = (dugumler: TekDugum[]): TekKart[] =>
    dugumler.flatMap(d => {
      const k = hepsi.get(d.slug);
      if (!k) {
        // TR'de eksik sayfa build'i durdurur; EN'de çevirisi olmayan düğüm
        // (alt dalıyla birlikte) menüden düşer — 404'e giden bağlantı basılmaz.
        if (!zorunlu) return [];
        throw new Error(
          `Teknoloji ağacındaki "${d.slug}" için sayfa yok ` +
          `(src/content/sayfalar/${dil}/${d.slug}.md). Sayfa yeniden ` +
          `adlandırıldıysa src/data/teknoloji.ts da güncellenmeli.`);
      }
      const v = k.entry.data as any;
      const etiket = dil === 'en' ? d.en : undefined;
      return [{
        slug: k.slug,
        anahtar: k.anahtar,
        ad: etiket?.ad || (dil === 'en' ? v.baslik : d.ad) || v.baslik,
        tamAd: etiket?.tamAd || etiket?.ad || (dil === 'en' ? v.baslik : (d.tamAd || d.ad)) || v.baslik,
        baslik: v.baslik,
        ozet: v.ozet,
        gorsel: v.banner || v.kapak,
        alt: d.alt ? donustur(d.alt) : [],
      }];
    });
  return donustur(TEKNOLOJI);
}

/**
 * Verilen ANAHTARLARIN sayfa kayıtları (URL slug + başlık + özet) — "İlgili
 * sayfalar" ve rehber listeleri için. Frontmatter `ilgili` listeleri ve
 * `TEK_REHBERLER` anahtar (dosya adı) taşır; iki dilde aynıdır.
 */
export async function ilgiliSayfalar(dil: Dil, anahtarlar: string[]): Promise<{ slug: string; baslik: string; ozet?: string }[]> {
  const hepsi = new Map((await kokIcerik(dil)).map(k => [k.anahtar, k]));
  return anahtarlar.flatMap(anahtar => {
    const k = hepsi.get(anahtar);
    if (!k) return [];
    const v = k.entry.data as any;
    return [{ slug: k.slug, baslik: v.baslik, ozet: v.ozet }];
  });
}

/** Teknoloji bölümünün konu rehberleri — ağaçta olmayan uzun makale sayfaları. */
export async function teknolojiRehberleri(dil: Dil) {
  return ilgiliSayfalar(dil, TEK_REHBERLER);
}

/** Teknoloji ağacındaki bir sayfanın komşuları — sayfa altı gezinme için. */
export type TekKomsu = {
  /** Ağaçta bir önceki/sonraki sayfa (derinlik öncelikli sıra = menü sırası). */
  onceki: TekKart | null;
  sonraki: TekKart | null;
  /** Aynı üst düğümü paylaşan diğer sayfalar (kendisi hariç). */
  kardesler: TekKart[];
  /** Kardeşlerin bağlı olduğu üst düğüm; en üst seviyedeyse null. */
  ust: TekKart | null;
  /** Sayfanın kendi düğümü — alt sayfası varsa liste ondan kurulur. */
  kendi: TekKart;
};

/**
 * Verilen ANAHTAR teknoloji ağacında yoksa null döner — çağıran taraf böylece
 * "bu sayfa bölümün parçası mı" sorusunu ayrıca sormak zorunda kalmaz.
 */
export async function teknolojiKomsulari(dil: Dil, anahtar: string): Promise<TekKomsu | null> {
  const agac = await teknolojiAgaci(dil);

  // Derinlik öncelikli düz liste + her düğümün üstü ve kardeş kümesi
  const duz: TekKart[] = [];
  const ustu = new Map<string, TekKart | null>();
  const kardesKume = new Map<string, TekKart[]>();
  const gez = (dugumler: TekKart[], ust: TekKart | null) => {
    for (const d of dugumler) {
      duz.push(d);
      ustu.set(d.anahtar, ust);
      kardesKume.set(d.anahtar, dugumler);
      if (d.alt.length) gez(d.alt, d);
    }
  };
  gez(agac, null);

  const i = duz.findIndex(d => d.anahtar === anahtar);
  if (i < 0) return null;
  return {
    onceki: duz[i - 1] ?? null,
    sonraki: duz[i + 1] ?? null,
    kardesler: (kardesKume.get(anahtar) ?? []).filter(d => d.anahtar !== anahtar),
    ust: ustu.get(anahtar) ?? null,
    kendi: duz[i],
  };
}
