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
  /** İngilizce menü etiketleri; verilmezse EN sayfanın kendi başlığı kullanılır. */
  en?: { ad: string; tamAd?: string };
  alt?: TekDugum[];
};

export const TEKNOLOJI: TekDugum[] = [
  {
    slug: 'yonlendirilebilir-yatay-sondaj',
    ad: 'Yönlendirilebilir Yatay Sondaj',
    en: { ad: 'Horizontal Directional Drilling' },
    alt: [
      { slug: 'yonlendirilebilir-yatay-sondaj-nedir', ad: 'Yönlendirilebilir Yatay Sondaj Nedir?',
        tamAd: 'HDD Nedir?', en: { ad: 'What is HDD?' } },
      { slug: 'yonlendirilebilir-yatay-sondaj-yapim-metodu', ad: 'Yapım Metodu',
        tamAd: 'HDD Yapım Metodu', en: { ad: 'HDD Method', tamAd: 'HDD Construction Method' } },
      { slug: 'yonlendirilebilir-yatay-sondaj-makinesi', ad: 'Sondaj Makinesi',
        tamAd: 'HDD Makinesi', en: { ad: 'HDD Rig', tamAd: 'HDD Drilling Rig' } },
      { slug: 'delgi-tijleri', ad: 'Delgi Tijleri', en: { ad: 'Drill Rods' } },
      { slug: 'yonlendirme-basligi', ad: 'Yönlendirme Başlığı', en: { ad: 'Steering Head' } },
      { slug: 'genisletme-basligi', ad: 'Genişletme Başlığı', en: { ad: 'Reamer' } },
      {
        slug: 'yer-belirleme',
        ad: 'Yer Belirleme',
        en: { ad: 'Locating Systems' },
        alt: [
          { slug: 'uzerinden-takip', ad: 'Üzerinden Takip', en: { ad: 'Walk-over Tracking' } },
          { slug: 'manyetik-alan', ad: 'Manyetik Alan', en: { ad: 'Magnetic Guidance' } },
        ],
      },
      { slug: 'yatay-sondaj-camuru', ad: 'Yatay Sondaj Çamuru', en: { ad: 'Drilling Fluid' } },
    ],
  },
  { slug: 'boru-surmecakma', ad: 'Boru Sürme/Çakma', en: { ad: 'Pipe Jacking / Auger Boring' } },
  { slug: 'boru-yenileme', ad: 'Boru Yenileme', en: { ad: 'Pipe Bursting' } },
  { slug: 'akilli-altyapi', ad: 'Akıllı Altyapı', en: { ad: 'Smart Undergrounding' } },
];

/**
 * Konu rehberleri — ağaçta olmayan, görselsiz uzun makale sayfaları.
 * Canlı siteden taşınmışlardı ama hiçbir yerden bağlantı verilmiyordu (yetim);
 * bölüm haritasında ve ana sayfada "rehber" olarak listelenirler.
 */
export const TEK_REHBERLER = [
  'yatay-sondaj',
  'yatay-delgi-nedir',
  'yonlendirilebilir-yatay-delgi',
];

/** Teknoloji bölümünün kök sayfası — menüdeki "Teknoloji" bağlantısı. */
export const TEKNOLOJI_KOK = 'yatay-sondaj-teknoloji';

/** Ağaçtaki tüm slug'lar, düz liste (doğrulama ve sayım için). */
export function tekSluglar(dugumler: TekDugum[] = TEKNOLOJI): string[] {
  return dugumler.flatMap(d => [d.slug, ...(d.alt ? tekSluglar(d.alt) : [])]);
}
