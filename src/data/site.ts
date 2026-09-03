// Site geneli sabitler. İletişim bilgileri canlı deltek.com.tr/iletisim/
// sayfasından alındı (e-posta Cloudflare gizlemesinden çözüldü).
export const SITE = {
  isim: "Deltek",
  unvan: "DELTEK KAZISIZ GEÇİŞ TEKNOLOJİLERİ İNŞ. SAN. ve TİC. LTD. ŞTİ.",
  slogan: "Yatay Sondaj, Boru Sürme ve Kazısız Geçiş Teknolojileri",
  telefon: "0850 888 3585",
  telefonHam: "+908508883585",
  whatsapp: "",                            // numara girilirse WhatsApp butonu görünür
  eposta: "info@deltek.com.tr",
  // Merkez ofis — footer ve JSON-LD bu ikisini kullanır
  adres1: "Vişnezade Mah. Çekirdek Sok. No:8 Kat:1",
  adres2: "34357 Beşiktaş - İstanbul",
  kanonikal: "https://www.deltek.com.tr",
};

// Tüm ofisler — /iletisim/ sayfasında (duzen: iletisim) kart olarak listelenir.
// `merkez` yalnızca bir ofiste true olmalı; harita bölümü onu gösterir.
export const OFISLER = [
  {
    sehir: "İstanbul",
    merkez: true,
    adres: "Vişnezade Mah. Çekirdek Sok. No:8 Kat:1",
    adres2: "34357 Beşiktaş - İstanbul",
  },
  {
    sehir: "İzmir",
    merkez: false,
    adres: "Maltepe Mah. 66. Sok. No: 35",
    adres2: "35310 Güzelbahçe - İzmir",
  },
];

/** Google Haritalar yol tarifi bağlantısı — ofis adresinden üretilir, ayrıca saklanmaz. */
export const yolTarifi = (o: { adres: string; adres2: string }) =>
  'https://www.google.com/maps/search/?api=1&query=' +
  encodeURIComponent(`${o.adres} ${o.adres2}`);

// Ürün/hizmet kategorileri. Boş bırakıldığında header'daki açılır menü ve
// ikon şeridi otomatik gizlenir; doldurulduğunda geri gelir.
export const KATEGORILER: { slug: string; ad: string; ikon: string }[] = [];

// Header'ın altındaki ikon şeridi (kbar). Varsayılan olarak kategorilerden türer.
export const KBAR = KATEGORILER.map(k => ({
  href: `/kategori/${k.slug}`,
  ad: k.ad,
  ikon: k.ikon,
  anahtar: k.slug,
}));
