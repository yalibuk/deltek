// İki dilli arayüz metinleri (TR / EN)
export type Dil = 'tr' | 'en';

export const CEVIRI = {
  tr: {
    dilKod: 'EN',            // dil değiştirici butonunda gösterilen (diğer dil)
    htmlLang: 'tr',
    ogLocale: 'tr_TR',
    nav: {
      urunler: 'Ürünler',
      urunlerAlt: 'Tümü',
      tumUrunler: 'Tüm ürünler',
      projeler: ['Sahadan', 'Projeler'],
      hakkimizda: ['Hakkımızda', ''],
      iletisim: 'İletişim',
    },
    footer: {
      slogan: '',                       // TODO: kısa footer tanıtım cümlesi
      site: 'Site',
      anasayfa: 'Ana sayfa',
      projeler: 'Projeler',
      hakkimizda: 'Hakkımızda',
      iletisim: 'İletişim',
      telif: 'Tüm hakları saklıdır.',
    },
    mobil: { ara: 'Hemen ara', wa: 'WhatsApp' },
    waMesaj: 'Merhaba, Deltek hakkında bilgi almak istiyorum.',
    aria: { home: 'Deltek Ana Sayfa', menu: 'Menüyü aç/kapat', wa: 'WhatsApp ile yazın', dil: 'Change language' },
  },
  en: {
    dilKod: 'TR',
    htmlLang: 'en',
    ogLocale: 'en_US',
    nav: {
      urunler: 'Products',
      urunlerAlt: 'All',
      tumUrunler: 'All products',
      projeler: ['Field', 'Projects'],
      hakkimizda: ['About', 'us'],
      iletisim: 'Contact',
    },
    footer: {
      slogan: '',                       // TODO: short footer blurb
      site: 'Site',
      anasayfa: 'Home',
      projeler: 'Projects',
      hakkimizda: 'About us',
      iletisim: 'Contact',
      telif: 'All rights reserved.',
    },
    mobil: { ara: 'Call now', wa: 'WhatsApp' },
    waMesaj: "Hello, I'd like information about Deltek.",
    aria: { home: 'Deltek Home', menu: 'Open/close menu', wa: 'Message on WhatsApp', dil: 'Dili değiştir' },
  },
} as const;

// Kategori adlarının İngilizcesi (slug'a göre). KATEGORILER doldurulduğunda
// buraya da karşılıkları eklenmeli; eksik slug'lar Türkçe adıyla gösterilir.
export const KATEGORI_EN: Record<string, string> = {};
