// Site geneli sabitler. İletişim bilgileri PLACEHOLDER — gerçek Deltek
// bilgileriyle değiştirilmeli (bkz. CLAUDE.md "Yapılacaklar").
export const SITE = {
  isim: "Deltek",
  slogan: "",                              // TODO: Deltek sloganı
  telefon: "+90 000 000 0000",             // TODO
  telefonHam: "+900000000000",             // TODO
  whatsapp: "",                            // boş bırakılırsa WhatsApp butonu render edilmez
  eposta: "info@deltek.com.tr",
  adres: "",                               // TODO
  adres1: "",                              // TODO
  adres2: "",                              // TODO
  kanonikal: "https://www.deltek.com.tr",
};

// Ürün/hizmet kategorileri. Boş bırakıldığında header'daki açılır menü ve
// ikon şeridi otomatik gizlenir; doldurulduğunda geri gelir.
// Örn: { slug: 'ornek-kategori', ad: 'Örnek Kategori', ikon: '/icons/ornek.svg' }
export const KATEGORILER: { slug: string; ad: string; ikon: string }[] = [];

// Header'ın altındaki ikon şeridi (kbar). Varsayılan olarak kategorilerden türer.
export const KBAR = KATEGORILER.map(k => ({
  href: `/kategori/${k.slug}`,
  ad: k.ad,
  ikon: k.ikon,
  anahtar: k.slug,
}));
