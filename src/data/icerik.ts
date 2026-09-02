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
