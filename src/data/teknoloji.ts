/**
 * Teknoloji bölümünün bilgi mimarisi.
 *
 * Ağaç, canlı deltek.com.tr'deki "Teknoloji" açılır menüsünden birebir
 * alındı (2026-09-04). Sayfaların kendisi zaten `content/sayfalar/tr/`
 * altında duruyordu ama hiçbir yerden bağlantı verilmiyordu — 19 sayfanın
 * 14'ü yalnızca adresi yazılarak açılabiliyordu.
 *
 * Burada YALNIZCA slug ve menüde görünecek kısa ad tutulur; başlık, özet ve
 * görsel sayfanın kendi frontmatter'ından okunur (bkz. `teknolojiAgaci()`).
 * Böylece bir sayfanın başlığı değişince menü de kendiliğinden değişir.
 *
 * Menüdeki kısa adlar sayfa başlıklarıyla aynı değil (ör. "Auger Boring" ↔
 * "Auger Boring Nedir? Modern Yatay Delgi Teknolojisi"); canlı sitedeki
 * menü etiketleri korundu.
 */
export type TekDugum = {
  /** `content/sayfalar/tr/<slug>.md` — build sırasında varlığı doğrulanır. */
  slug: string;
  /** Header açılır menüsü ve kartlarda görünen kısa ad. */
  ad: string;
  /**
   * Yan menüde görünen ad. Orada yer bol olduğu için canlı sitedeki tam
   * etiket kullanılır; verilmezse `ad`e düşer.
   */
  tamAd?: string;
  alt?: TekDugum[];
};

export const TEKNOLOJI: TekDugum[] = [
  {
    slug: 'yonlendirilebilir-yatay-sondaj',
    ad: 'Yönlendirilebilir Yatay Sondaj',
    alt: [
      { slug: 'yonlendirilebilir-yatay-sondaj-nedir', ad: 'Yönlendirilebilir Yatay Sondaj Nedir?',
        tamAd: 'HDD Nedir?' },
      { slug: 'yonlendirilebilir-yatay-sondaj-yapim-metodu', ad: 'Yapım Metodu',
        tamAd: 'HDD Yapım Metodu' },
      { slug: 'yonlendirilebilir-yatay-sondaj-makinesi', ad: 'Sondaj Makinesi',
        tamAd: 'HDD Makinesi' },
      { slug: 'yatay-sondaj-kazisiz-yatay-delgi', ad: 'Yatay Sondaj Kazısız Yatay Delgi' },
      { slug: 'delgi-tijleri', ad: 'Delgi Tijleri' },
      { slug: 'yonlendirme-basligi', ad: 'Yönlendirme Başlığı' },
      { slug: 'genisletme-basligi', ad: 'Genişletme Başlığı' },
      {
        slug: 'yer-belirleme',
        ad: 'Yer Belirleme',
        alt: [
          { slug: 'uzerinden-takip', ad: 'Üzerinden Takip' },
          { slug: 'manyetik-alan', ad: 'Manyetik Alan' },
        ],
      },
      { slug: 'yatay-sondaj-camuru', ad: 'Yatay Sondaj Çamuru' },
    ],
  },
  { slug: 'boru-surmecakma', ad: 'Boru Sürme/Çakma' },
  { slug: 'boru-yenileme', ad: 'Boru Yenileme' },
  { slug: 'akilli-altyapi', ad: 'Akıllı Altyapı' },
  { slug: 'auger-boring-nedir-modern-yatay-delgi-teknolojisi', ad: 'Auger Boring' },
  { slug: 'mikrotunel-nedir', ad: 'Mikrotünel Nedir' },
  { slug: 'kazisiz-altyapi-ve-kazisiz-teknolojiler', ad: 'Kazısız Altyapı ve Kazısız Teknolojiler' },
];

/** Teknoloji bölümünün kök sayfası — menüdeki "Teknoloji" bağlantısı. */
export const TEKNOLOJI_KOK = 'yatay-sondaj-teknoloji';

/** Ağaçtaki tüm slug'lar, düz liste (doğrulama ve sayım için). */
export function tekSluglar(dugumler: TekDugum[] = TEKNOLOJI): string[] {
  return dugumler.flatMap(d => [d.slug, ...(d.alt ? tekSluglar(d.alt) : [])]);
}
