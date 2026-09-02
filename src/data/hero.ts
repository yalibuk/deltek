// Ana sayfa hero slider verisi — canlı deltek.com.tr'deki Revolution
// Slider'dan birebir çıkarıldı (slayt arka planları, katman görselleri,
// metin katmanları, konumlar, geçiş tipleri, gecikme ve süreler).
//
// KOORDİNAT SİSTEMİ: tüm x/y/w/h ve yazı boyutları canlı slider'ın
// 1920×500 tasarım ızgarasındaki piksel değerleridir. HeroSlider bileşeni
// bunları container-query birimleriyle orantılı olarak ölçekler, yani
// slider hangi genişlikte olursa olsun kompozisyon korunur.
//
// GEÇİŞLER (RevSlider sınıfları):
//   sfl/sfr/sft/sfb  kısa mesafeden (sol/sağ/üst/alt) kayarak gelir
//   lfl/lfr/lft/lfb  ekran dışından (uzun mesafe) kayarak gelir
//   randomrotate     dönerek ve büyüyerek gelir
//   tp-fade          yalnızca belirir
//
// Not: 7. slaydın 1woman.png katmanı canlı sunucuda 404 verdiği için yok.

export type HeroKatman = {
  tur: 'gorsel' | 'metin' | 'video';
  src?: string; video?: string; w?: number; h?: number;
  metin?: string;
  stil?: string;
  x: number; y: number;
  gecis: string;
  basla: number; sure: number;
};
export type HeroSlayt = { arka: string; alt: string; katmanlar: HeroKatman[] };

/** Canlı slider'ın tasarım ızgarası — ölçekleme bu değerlere göre yapılır. */
export const HERO_IZGARA = { g: 1920, y: 500 };

export const HERO_TR: HeroSlayt[] = [
  {
    arka: '/images/hero/onshoreRig3-1.jpg',
    alt: "Deltek",
    katmanlar: [
      { tur: 'metin', metin: "ONSHORE / OFFSHORE\n\nHDD PROJELERİNDE\n\nGÜVENİLİR İŞ ORTAĞINIZ", stil: 'mavis3', x: 1027, y: 257, gecis: 'sfb', basla: 900, sure: 1000 },
    ],
  },
  {
    arka: '/images/hero/pipesite.jpg',
    alt: "Deltek",
    katmanlar: [
      { tur: 'metin', metin: "ELEKTRİK", stil: 'turuncu2', x: 395, y: 37, gecis: 'sfl', basla: 500, sure: 500 },
      { tur: 'metin', metin: "DOĞALGAZ", stil: 'turuncu2', x: 396, y: 102, gecis: 'sfl', basla: 1000, sure: 500 },
      { tur: 'metin', metin: "KANALİZASYON", stil: 'turuncu2', x: 395, y: 160, gecis: 'sfl', basla: 1500, sure: 500 },
      { tur: 'metin', metin: "TELEKOMÜNİKASYON", stil: 'turuncu2', x: 400, y: 219, gecis: 'sfl', basla: 2000, sure: 500 },
      { tur: 'metin', metin: "İÇME SUYU VE DRENAJ", stil: 'turuncu2', x: 396, y: 282, gecis: 'sfl', basla: 2500, sure: 500 },
      { tur: 'metin', metin: "YATAY SONDAJ'a ihtiyaç duyduğunuz her alanda yanınızdayız...", stil: 'beyaz', x: 400, y: 404, gecis: 'tp-fade', basla: 3000, sure: 500 },
      { tur: 'metin', metin: "Ayrıntılı bilgi ve referans listemiz için lütfen İLETİŞİME GEÇİN!", stil: 'beyaz', x: 402, y: 442, gecis: 'tp-fade', basla: 3450, sure: 500 },
    ],
  },
  {
    arka: '/images/hero/yatay-sondaj-wordaholic-bg.jpg',
    alt: "Deltek",
    katmanlar: [
      { tur: 'gorsel', src: '/images/hero/katman/video-screen.png', w: 574, h: 400, x: 1060, y: 80, gecis: 'sfb', basla: 500, sure: 1500 },
      { tur: 'video', video: 'https://www.youtube.com/embed/96BoFl4XQOc', w: 476, h: 267, x: 1109, y: 99, gecis: 'sfb', basla: 500, sure: 300 },
      { tur: 'metin', metin: "KAYA DELGİ & MUAZZAM GÜÇ", stil: 'heyt', x: 1045, y: 20, gecis: 'lft', basla: 500, sure: 1000 },
    ],
  },
  {
    arka: '/images/hero/slide-6-bg.jpg',
    alt: "Deltek",
    katmanlar: [
      { tur: 'gorsel', src: '/images/hero/katman/bit.png', w: 1530, h: 141, x: -2, y: 312, gecis: 'lfl', basla: 1000, sure: 1000 },
      { tur: 'gorsel', src: '/images/hero/katman/toprak.png', w: 325, h: 430, x: 1132, y: 102, gecis: 'lfr', basla: 1000, sure: 1000 },
      { tur: 'metin', metin: "YATAY DELGİ VE SONDAJ", stil: 'mavis', x: 390, y: 33, gecis: 'lft', basla: 2000, sure: 1000 },
      { tur: 'metin', metin: "TEKNOLOJİLERİ", stil: 'mavis', x: 390, y: 87, gecis: 'lft', basla: 2250, sure: 1000 },
      { tur: 'metin', metin: "AMACINIZA EN UYGUN", stil: 'medium_bg_red', x: 390, y: 174, gecis: 'lfr', basla: 3500, sure: 1000 },
      { tur: 'metin', metin: "YATAY SONDAJ YÖNTEMİNİ", stil: 'medium_bg_darkblue', x: 390, y: 227, gecis: 'lfr', basla: 3750, sure: 1000 },
      { tur: 'metin', metin: "SEÇEREK İŞE BAŞLAYIN", stil: 'medium_bg_red', x: 390, y: 279, gecis: 'lfr', basla: 4000, sure: 1000 },
      { tur: 'metin', metin: "BİZE ULAŞIN", stil: 'beyaz', x: 400, y: 381, gecis: 'sfr', basla: 5000, sure: 1000 },
    ],
  },
  {
    arka: '/images/hero/zzz.jpg',
    alt: "Deltek",
    katmanlar: [
      { tur: 'gorsel', src: '/images/hero/katman/machinery1.png', w: 799, h: 232, x: 370, y: 76, gecis: 'sfl', basla: 500, sure: 2500 },
      { tur: 'gorsel', src: '/images/hero/katman/ok-worker.png', w: 202, h: 500, x: 1283, y: 9, gecis: 'sfr', basla: 3350, sure: 1000 },
      { tur: 'metin', metin: "DOĞRU YERDESİNİZ", stil: 'mediumbgdarkblue', x: 981, y: 47, gecis: 'sft', basla: 3600, sure: 1000 },
      { tur: 'metin', metin: "YATAY SONDAJ UZMANI", stil: 'mavis', x: 613, y: 358, gecis: 'randomrotate', basla: 1500, sure: 1500 },
      { tur: 'metin', metin: "YÜKSEK TEKNOLOJİK ALTYAPI", stil: 'turuncu', x: 607, y: 346, gecis: 'sfl', basla: 2500, sure: 1500 },
      { tur: 'metin', metin: "GENİŞ MAKİNE PARKI", stil: 'turuncu', x: 1040, y: 416, gecis: 'sfr', basla: 2500, sure: 1500 },
    ],
  },
  {
    arka: '/images/hero/slide-2-bg.jpg',
    alt: "Deltek",
    katmanlar: [
      { tur: 'gorsel', src: '/images/hero/katman/deltek-robot-engineer.png', w: 489, h: 506, x: 360, y: 20, gecis: 'lfb', basla: 500, sure: 3000 },
      { tur: 'gorsel', src: '/images/hero/katman/yatay-sondaj-pipe-analysis.png', w: 437, h: 261, x: 1094, y: 6, gecis: 'lfr', basla: 500, sure: 3000 },
      { tur: 'metin', metin: "Uygulanacak projeyi bilgisayar yazılımları ile sanal ortamda modelliyoruz.\n\n\nBu simülasyon sayesinde en uygun makine ve ekipman seçimi yapabiliyor,\n\n\nen doğru senaryoya karar veriyoruz.", stil: 'mediumbgorange2', x: 880, y: 278, gecis: 'lfb', basla: 2500, sure: 1000 },
      { tur: 'metin', metin: "- Başarı, tesadüften fazlasını gerektirir / KŞ", stil: 'mediumbgdarkblue3', x: 1078, y: 427, gecis: 'sfb', basla: 5000, sure: 1000 },
    ],
  },
  {
    arka: '/images/hero/slide-1-bg.jpg',
    alt: "Deltek",
    katmanlar: [
      { tur: 'metin', metin: "HEMEN ARAYIN", stil: 'mavis', x: 390, y: 14, gecis: 'sfr', basla: 1500, sure: 1000 },
      { tur: 'metin', metin: "SİZİN İÇİN PROJELENDİRELİM", stil: 'turuncu2', x: 390, y: 70, gecis: 'sfr', basla: 2000, sure: 1000 },
      { tur: 'metin', metin: "Hepsi alanında uzman mühendis ve teknik elemanlardan oluşan ekibimiz", stil: 'turuncu', x: 390, y: 149, gecis: 'lfb', basla: 3500, sure: 1000 },
      { tur: 'metin', metin: "hergün 2mm'den 2000mm'ye varan çaplarda sayısız altyapı projesine", stil: 'turuncu', x: 390, y: 182, gecis: 'lfb', basla: 3500, sure: 1000 },
      { tur: 'metin', metin: "YATAY SONDAJ ve TEKNOLOJİK DELGİ çözümleri sunuyor.", stil: 'turuncu', x: 390, y: 217, gecis: 'lfb', basla: 3500, sure: 1000 },
      { tur: 'metin', metin: "Bir sonraki neden sizinki olmasın?", stil: 'mavi2', x: 390, y: 255, gecis: 'lfb', basla: 3500, sure: 1000 },
      { tur: 'metin', metin: "HEMEN TEKLİF İSTE", stil: 'mediumbgdarkblue', x: 390, y: 365, gecis: 'randomrotate', basla: 4500, sure: 1000 },
    ],
  },
  {
    arka: '/images/hero/button-bg-1.jpg',
    alt: "Deltek",
    katmanlar: [
      { tur: 'gorsel', src: '/images/hero/katman/button-hand.png', w: 290, h: 277, x: 940, y: 225, gecis: 'lfb', basla: 4000, sure: 1000 },
      { tur: 'metin', metin: "ALT YAPIDA FARK YARATAN", stil: 'mavis2', x: 694, y: 16, gecis: 'lft', basla: 1500, sure: 1000 },
      { tur: 'metin', metin: "ETKİN ÇÖZÜMLERİMİZLE", stil: 'turunc2', x: 725, y: 57, gecis: 'sft', basla: 2000, sure: 1000 },
      { tur: 'metin', metin: "RAKİPLERİNİZİN ÖNÜNE", stil: 'mavis2', x: 726, y: 102, gecis: 'lft', basla: 2500, sure: 1000 },
      { tur: 'metin', metin: "GEÇİN", stil: 'mavis2', x: 891, y: 146, gecis: 'lft', basla: 3000, sure: 1000 },
    ],
  },
  {
    arka: '/images/hero/deltek-yatay-sondaj-marka.jpg',
    alt: "Deltek",
    katmanlar: [
      { tur: 'metin', metin: "DELTEK", stil: 'mavis2', x: 886, y: 300, gecis: 'lfb', basla: 1500, sure: 1000 },
      { tur: 'metin', metin: "YATAY SONDAJDA", stil: 'mavis2', x: 798, y: 350, gecis: 'lfb', basla: 2000, sure: 1000 },
      { tur: 'metin', metin: "BİR DÜNYA MARKASI", stil: 'mavis2', x: 773, y: 405, gecis: 'lfb', basla: 2500, sure: 1000 },
    ],
  },
];

// İngilizce metinler Türkçe orijinallerin çevirisidir, Deltek onayından
// geçmedi (bkz. CLAUDE.md).
export const HERO_EN: HeroSlayt[] = [
  {
    arka: '/images/hero/onshoreRig3-1.jpg',
    alt: "Deltek",
    katmanlar: [
      { tur: 'metin', metin: "YOUR RELIABLE PARTNER\n\nIN ONSHORE / OFFSHORE\n\nHDD PROJECTS", stil: 'mavis3', x: 1027, y: 257, gecis: 'sfb', basla: 900, sure: 1000 },
    ],
  },
  {
    arka: '/images/hero/pipesite.jpg',
    alt: "Deltek",
    katmanlar: [
      { tur: 'metin', metin: "POWER", stil: 'turuncu2', x: 395, y: 37, gecis: 'sfl', basla: 500, sure: 500 },
      { tur: 'metin', metin: "NATURAL GAS", stil: 'turuncu2', x: 396, y: 102, gecis: 'sfl', basla: 1000, sure: 500 },
      { tur: 'metin', metin: "SEWERAGE", stil: 'turuncu2', x: 395, y: 160, gecis: 'sfl', basla: 1500, sure: 500 },
      { tur: 'metin', metin: "TELECOMS", stil: 'turuncu2', x: 400, y: 219, gecis: 'sfl', basla: 2000, sure: 500 },
      { tur: 'metin', metin: "POTABLE WATER & DRAINAGE", stil: 'turuncu2', x: 396, y: 282, gecis: 'sfl', basla: 2500, sure: 500 },
      { tur: 'metin', metin: "Wherever you need HORIZONTAL DRILLING, we are with you...", stil: 'beyaz', x: 400, y: 404, gecis: 'tp-fade', basla: 3000, sure: 500 },
      { tur: 'metin', metin: "For details and our reference list, please GET IN TOUCH!", stil: 'beyaz', x: 402, y: 442, gecis: 'tp-fade', basla: 3450, sure: 500 },
    ],
  },
  {
    arka: '/images/hero/yatay-sondaj-wordaholic-bg.jpg',
    alt: "Deltek",
    katmanlar: [
      { tur: 'gorsel', src: '/images/hero/katman/video-screen.png', w: 574, h: 400, x: 1060, y: 80, gecis: 'sfb', basla: 500, sure: 1500 },
      { tur: 'video', video: 'https://www.youtube.com/embed/96BoFl4XQOc', w: 476, h: 267, x: 1109, y: 99, gecis: 'sfb', basla: 500, sure: 300 },
      { tur: 'metin', metin: "ROCK DRILLING & IMMENSE POWER", stil: 'heyt', x: 1045, y: 20, gecis: 'lft', basla: 500, sure: 1000 },
    ],
  },
  {
    arka: '/images/hero/slide-6-bg.jpg',
    alt: "Deltek",
    katmanlar: [
      { tur: 'gorsel', src: '/images/hero/katman/bit.png', w: 1530, h: 141, x: -2, y: 312, gecis: 'lfl', basla: 1000, sure: 1000 },
      { tur: 'gorsel', src: '/images/hero/katman/toprak.png', w: 325, h: 430, x: 1132, y: 102, gecis: 'lfr', basla: 1000, sure: 1000 },
      { tur: 'metin', metin: "HORIZONTAL DRILLING AND", stil: 'mavis', x: 390, y: 33, gecis: 'lft', basla: 2000, sure: 1000 },
      { tur: 'metin', metin: "BORING TECHNOLOGIES", stil: 'mavis', x: 390, y: 87, gecis: 'lft', basla: 2250, sure: 1000 },
      { tur: 'metin', metin: "START BY CHOOSING", stil: 'medium_bg_red', x: 390, y: 174, gecis: 'lfr', basla: 3500, sure: 1000 },
      { tur: 'metin', metin: "THE DRILLING METHOD", stil: 'medium_bg_darkblue', x: 390, y: 227, gecis: 'lfr', basla: 3750, sure: 1000 },
      { tur: 'metin', metin: "THAT FITS YOUR PURPOSE", stil: 'medium_bg_red', x: 390, y: 279, gecis: 'lfr', basla: 4000, sure: 1000 },
      { tur: 'metin', metin: "CONTACT US", stil: 'beyaz', x: 400, y: 381, gecis: 'sfr', basla: 5000, sure: 1000 },
    ],
  },
  {
    arka: '/images/hero/zzz.jpg',
    alt: "Deltek",
    katmanlar: [
      { tur: 'gorsel', src: '/images/hero/katman/machinery1.png', w: 799, h: 232, x: 370, y: 76, gecis: 'sfl', basla: 500, sure: 2500 },
      { tur: 'gorsel', src: '/images/hero/katman/ok-worker.png', w: 202, h: 500, x: 1283, y: 9, gecis: 'sfr', basla: 3350, sure: 1000 },
      { tur: 'metin', metin: "YOU ARE IN THE RIGHT PLACE", stil: 'mediumbgdarkblue', x: 981, y: 47, gecis: 'sft', basla: 3600, sure: 1000 },
      { tur: 'metin', metin: "HORIZONTAL DRILLING SPECIALIST", stil: 'mavis', x: 613, y: 358, gecis: 'randomrotate', basla: 1500, sure: 1500 },
      { tur: 'metin', metin: "ADVANCED TECHNICAL INFRASTRUCTURE", stil: 'turuncu', x: 607, y: 346, gecis: 'sfl', basla: 2500, sure: 1500 },
      { tur: 'metin', metin: "EXTENSIVE MACHINE FLEET", stil: 'turuncu', x: 1040, y: 416, gecis: 'sfr', basla: 2500, sure: 1500 },
    ],
  },
  {
    arka: '/images/hero/slide-2-bg.jpg',
    alt: "Deltek",
    katmanlar: [
      { tur: 'gorsel', src: '/images/hero/katman/deltek-robot-engineer.png', w: 489, h: 506, x: 360, y: 20, gecis: 'lfb', basla: 500, sure: 3000 },
      { tur: 'gorsel', src: '/images/hero/katman/yatay-sondaj-pipe-analysis.png', w: 437, h: 261, x: 1094, y: 6, gecis: 'lfr', basla: 500, sure: 3000 },
      { tur: 'metin', metin: "We model the project with computer software and share the results with you before we start.", stil: 'mediumbgorange2', x: 880, y: 278, gecis: 'lfb', basla: 2500, sure: 1000 },
      { tur: 'metin', metin: "- Başarı, tesadüften fazlasını gerektirir / KŞ", stil: 'mediumbgdarkblue3', x: 1078, y: 427, gecis: 'sfb', basla: 5000, sure: 1000 },
    ],
  },
  {
    arka: '/images/hero/slide-1-bg.jpg',
    alt: "Deltek",
    katmanlar: [
      { tur: 'metin', metin: "CALL US NOW", stil: 'mavis', x: 390, y: 14, gecis: 'sfr', basla: 1500, sure: 1000 },
      { tur: 'metin', metin: "LET US ENGINEER IT FOR YOU", stil: 'turuncu2', x: 390, y: 70, gecis: 'sfr', basla: 2000, sure: 1000 },
      { tur: 'metin', metin: "Our team of specialist engineers and technicians", stil: 'turuncu', x: 390, y: 149, gecis: 'lfb', basla: 3500, sure: 1000 },
      { tur: 'metin', metin: "delivers HORIZONTAL DRILLING and boring solutions every day, for diameters from 2 mm to 2000 mm,", stil: 'turuncu', x: 390, y: 182, gecis: 'lfb', basla: 3500, sure: 1000 },
      { tur: 'metin', metin: "across countless infrastructure projects.", stil: 'turuncu', x: 390, y: 217, gecis: 'lfb', basla: 3500, sure: 1000 },
      { tur: 'metin', metin: "Why not make the next one yours?", stil: 'mavi2', x: 390, y: 255, gecis: 'lfb', basla: 3500, sure: 1000 },
      { tur: 'metin', metin: "REQUEST A QUOTE", stil: 'mediumbgdarkblue', x: 390, y: 365, gecis: 'randomrotate', basla: 4500, sure: 1000 },
    ],
  },
  {
    arka: '/images/hero/button-bg-1.jpg',
    alt: "Deltek",
    katmanlar: [
      { tur: 'gorsel', src: '/images/hero/katman/button-hand.png', w: 290, h: 277, x: 940, y: 225, gecis: 'lfb', basla: 4000, sure: 1000 },
      { tur: 'metin', metin: "GET AHEAD OF YOUR RIVALS", stil: 'mavis2', x: 694, y: 16, gecis: 'lft', basla: 1500, sure: 1000 },
      { tur: 'metin', metin: "WITH EFFECTIVE SOLUTIONS", stil: 'turunc2', x: 725, y: 57, gecis: 'sft', basla: 2000, sure: 1000 },
      { tur: 'metin', metin: "THAT MAKE A DIFFERENCE", stil: 'mavis2', x: 726, y: 102, gecis: 'lft', basla: 2500, sure: 1000 },
      { tur: 'metin', metin: "IN INFRASTRUCTURE", stil: 'mavis2', x: 891, y: 146, gecis: 'lft', basla: 3000, sure: 1000 },
    ],
  },
  {
    arka: '/images/hero/deltek-yatay-sondaj-marka.jpg',
    alt: "Deltek",
    katmanlar: [
      { tur: 'metin', metin: "DELTEK", stil: 'mavis2', x: 886, y: 300, gecis: 'lfb', basla: 1500, sure: 1000 },
      { tur: 'metin', metin: "A GLOBAL BRAND IN", stil: 'mavis2', x: 798, y: 350, gecis: 'lfb', basla: 2000, sure: 1000 },
      { tur: 'metin', metin: "HORIZONTAL DRILLING", stil: 'mavis2', x: 773, y: 405, gecis: 'lfb', basla: 2500, sure: 1000 },
    ],
  },
];
