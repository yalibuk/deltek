import { getCollection, type CollectionEntry } from 'astro:content';

export type Dil = 'tr' | 'en';

export type Yazi = {
  entry: CollectionEntry<'blog'>;
  slug: string;
};

const ms = (d: unknown) => (d ? new Date(d as any).getTime() : 0);

/** Bir dildeki yazılar, tarihe göre yeniden eskiye. */
export async function yazilar(dil: Dil): Promise<Yazi[]> {
  const hepsi = await getCollection('blog');
  return hepsi
    .filter(e => e.id.startsWith(dil + '/'))
    .map(e => ({ entry: e, slug: e.id.slice(dil.length + 1) }))
    .sort((a, b) => ms(b.entry.data.tarih) - ms(a.entry.data.tarih));
}

/** Verilen slug'ın diğer dilde karşılığı var mı? hreflang için kullanılır. */
export async function cevirisiVarMi(slug: string, hedefDil: Dil): Promise<boolean> {
  const hepsi = await getCollection('blog');
  return hepsi.some(e => e.id === `${hedefDil}/${slug}`);
}
