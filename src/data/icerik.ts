import { getCollection, type CollectionEntry } from 'astro:content';

export type Dil = 'tr' | 'en';
export type Tur = 'yazi' | 'sayfa';

export type Kayit = {
  tur: Tur;
  entry: CollectionEntry<'blog'> | CollectionEntry<'sayfalar'>;
  slug: string;
};

const ms = (d: unknown) => (d ? new Date(d as any).getTime() : 0);
const dilSuz = (hepsi: any[], dil: Dil, tur: Tur): Kayit[] =>
  hepsi.filter(e => e.id.startsWith(dil + '/'))
       .map(e => ({ tur, entry: e, slug: e.id.slice(dil.length + 1) }));

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
  const gorulen = new Map<string, Tur>();
  for (const k of hepsi) {
    const onceki = gorulen.get(k.slug);
    if (onceki) {
      throw new Error(
        `Slug çakışması: "${k.slug}" hem blog/${dil} hem sayfalar/${dil} altında var. ` +
        `Kök dizinde iki içerik aynı adresi paylaşamaz — birini yeniden adlandırıp ` +
        `public/_redirects'e 301 ekleyin (bkz. CLAUDE.md).`);
    }
    gorulen.set(k.slug, k.tur);
  }
  return hepsi;
}

/** Verilen slug'ın diğer dilde karşılığı var mı? hreflang için. */
export async function cevirisiVarMi(slug: string, hedefDil: Dil): Promise<boolean> {
  const [b, s] = [await getCollection('blog'), await getCollection('sayfalar')];
  return [...b, ...s].some(e => e.id === `${hedefDil}/${slug}`);
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
  slug: string;
  ad: string;
  /** Yan menüde kullanılan tam etiket (bkz. teknoloji.ts). */
  tamAd: string;
  baslik: string;
  ozet?: string;
  gorsel?: string;
  alt: TekKart[];
};

/**
 * TEKNOLOJI ağacını içerik koleksiyonuyla birleştirir.
 *
 * Ağaçtaki bir slug'ın sayfası yoksa build'i DURDURUR: menüde 404'e giden
 * bağlantı bırakmaktansa hatayı derlemede görmek daha iyi. Aynı şekilde bir
 * sayfa yeniden adlandırılırsa burada yakalanır.
 */
export async function teknolojiAgaci(dil: Dil, zorunlu = dil === 'tr'): Promise<TekKart[]> {
  const hepsi = new Map((await sayfalar(dil)).map(k => [k.slug, k]));
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
        slug: d.slug,
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

/** Verilen slug'ların sayfa kayıtları (başlık + özet) — "İlgili sayfalar" ve rehber listeleri için. */
export async function ilgiliSayfalar(dil: Dil, sluglar: string[]): Promise<{ slug: string; baslik: string; ozet?: string }[]> {
  const hepsi = new Map((await kokIcerik(dil)).map(k => [k.slug, k]));
  return sluglar.flatMap(slug => {
    const k = hepsi.get(slug);
    if (!k) return [];
    const v = k.entry.data as any;
    return [{ slug, baslik: v.baslik, ozet: v.ozet }];
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
 * Verilen slug teknoloji ağacında yoksa null döner — çağıran taraf böylece
 * "bu sayfa bölümün parçası mı" sorusunu ayrıca sormak zorunda kalmaz.
 */
export async function teknolojiKomsulari(dil: Dil, slug: string): Promise<TekKomsu | null> {
  const agac = await teknolojiAgaci(dil);

  // Derinlik öncelikli düz liste + her düğümün üstü ve kardeş kümesi
  const duz: TekKart[] = [];
  const ustu = new Map<string, TekKart | null>();
  const kardesKume = new Map<string, TekKart[]>();
  const gez = (dugumler: TekKart[], ust: TekKart | null) => {
    for (const d of dugumler) {
      duz.push(d);
      ustu.set(d.slug, ust);
      kardesKume.set(d.slug, dugumler);
      if (d.alt.length) gez(d.alt, d);
    }
  };
  gez(agac, null);

  const i = duz.findIndex(d => d.slug === slug);
  if (i < 0) return null;
  return {
    onceki: duz[i - 1] ?? null,
    sonraki: duz[i + 1] ?? null,
    kardesler: (kardesKume.get(slug) ?? []).filter(d => d.slug !== slug),
    ust: ustu.get(slug) ?? null,
    kendi: duz[i],
  };
}
