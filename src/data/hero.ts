// Ana sayfa hero slider verisi.
//
// GÖRSEL KATMANLAR canlı deltek.com.tr'deki Revolution Slider'dan birebir
// çıkarıldı: konum, geçiş tipi, gecikme ve süre orijinaliyle aynı
// (ör. 4. slaytta sondaj biti soldan gelip toprak adasına giriyor).
//
// YAZILAR ise yeniden tasarlandı. Orijinaldeki metin katmanları 2016 tema
// efektleriyle geliyordu (sert çift gölge, renkli kutucuklar, 17px'e düşen
// puntolar, slayt başına 4-7 ayrı katman). İçerik korundu ama tek bir
// tipografik blokta toplandı; konumu ve teması her slaydın arka planına ve
// o slayttaki görsel katmanların kapladığı alana göre seçildi.
//
// KOORDİNAT SİSTEMİ: katman x/y/w/h değerleri canlı slider'ın 1920×500
// tasarım ızgarasındaki piksellerdir. HeroSlider bunları container-query
// birimiyle orantılı ölçekler.
//
// Not: 7. slaydın 1woman.png katmanı canlı sunucuda 404 veriyor; orijinali
// web arşivinden (2025-04-01 anlık görüntüsü) alınıp depoya kondu.

export type HeroKatman = {
  tur: 'gorsel' | 'video';
  src?: string; video?: string; w: number; h: number;
  x: number; y: number;
  gecis: string;
  basla: number; sure: number;
};

export type HeroYazi = {
  ustlik?: string;          // küçük, aralıklı üst satır
  baslik: string;
  satirlar?: string[];
  eylem?: string;           // buton metni
  /** Metin bloğunun yatay yeri — görsel katmanların boş bıraktığı taraf. */
  konum: 'sol' | 'sag';
  /** Dikey hizası — katmanların kapladığı bandın dışına konumlanır. */
  dikey: 'ust' | 'orta' | 'alt';
  /** Arka plan koyu mu açık mı: yazı ve perde rengini belirler. */
  tema: 'koyu' | 'acik';
};

export type HeroSlayt = { arka: string; alt: string; yazi: HeroYazi; katmanlar: HeroKatman[] };

/** Canlı slider'ın tasarım ızgarası — ölçekleme bu değerlere göre yapılır. */
export const HERO_IZGARA = { g: 1920, y: 500 };

export const HERO_TR: HeroSlayt[] = [
  {
    // Saha fotoğrafı: sondaj makinesi solda, deniz sağda → yazı sağa.
    arka: '/images/hero/onshoreRig3-1.jpg',
    alt: 'Onshore HDD sahası',
    yazi: {
      ustlik: 'Onshore / Offshore',
      baslik: 'HDD projelerinde güvenilir iş ortağınız',
      konum: 'sag', dikey: 'orta', tema: 'koyu',
    },
    katmanlar: [],
  },
  {
    // Koyu mavi tonlu şantiye; sağdaki boru hattı dolu → yazı sola.
    arka: '/images/hero/pipesite.jpg',
    alt: 'Boru hattı sahası',
    yazi: {
      ustlik: 'Kullanım alanları',
      baslik: 'Yatay sondaja ihtiyaç duyduğunuz her alanda yanınızdayız',
      satirlar: ['Elektrik · Doğalgaz · Kanalizasyon · Telekomünikasyon · İçme suyu ve drenaj'],
      eylem: 'İletişime geçin',
      konum: 'sol', dikey: 'orta', tema: 'koyu',
    },
    katmanlar: [],
  },
  {
    // Video ekranı katmanı sağda (x1060) → yazı sola.
    arka: '/images/hero/yatay-sondaj-wordaholic-bg.jpg',
    alt: 'Kaya delgi',
    yazi: {
      ustlik: 'Sert zemin',
      baslik: 'Kaya delgi & muazzam güç',
      konum: 'sol', dikey: 'orta', tema: 'koyu',
    },
    katmanlar: [
      { tur: 'gorsel', src: '/images/hero/katman/video-screen.png', w: 574, h: 400, x: 1060, y: 80, gecis: 'sfb', basla: 500, sure: 1500 },
      // Ölçüler tablet PNG'sinin koyu ekran dikdörtgeninden ölçüldü (474×351 @ 1110,104).
      // Canlı slider 486×356 @ 1109,99 diyor ama o değer ekranı birkaç piksel taşırıyor.
      { tur: 'video', video: 'https://www.youtube.com/embed/96BoFl4XQOc', w: 474, h: 351, x: 1110, y: 104, gecis: 'sfb', basla: 500, sure: 300 },
    ],
  },
  {
    // Tij şeridi altta (y312+), toprak adası sağda → yazı sol üste.
    arka: '/images/hero/slide-6-bg.jpg',
    alt: 'Yatay delgi ve sondaj teknolojileri',
    yazi: {
      ustlik: 'Teknoloji',
      baslik: 'Yatay delgi ve sondaj teknolojileri',
      satirlar: ['Amacınıza en uygun yatay sondaj yöntemini seçerek işe başlayın.'],
      eylem: 'Bize ulaşın',
      konum: 'sol', dikey: 'ust', tema: 'acik',
    },
    katmanlar: [
      { tur: 'gorsel', src: '/images/hero/katman/bit.png', w: 1530, h: 141, x: -2, y: 312, gecis: 'lfl', basla: 1000, sure: 1000 },
      // Orijinalinde sağdan kayarak giriyordu (lfr); istek üzerine yerinde
      // belirecek şekilde değiştirildi. Tij (bit.png) soldan gelişini koruyor.
      { tur: 'gorsel', src: '/images/hero/katman/toprak.png', w: 325, h: 430, x: 1132, y: 102, gecis: 'fade', basla: 1000, sure: 1200 },
    ],
  },
  {
    // Makine görseli üst bandı kaplıyor (y76-308) → yazı sol alta.
    arka: '/images/hero/zzz.jpg',
    alt: 'Makine parkı',
    yazi: {
      ustlik: 'Doğru yerdesiniz',
      baslik: 'Yatay sondaj uzmanı',
      satirlar: ['Yüksek teknolojik altyapı, geniş makine parkı'],
      konum: 'sol', dikey: 'alt', tema: 'acik',
    },
    katmanlar: [
      { tur: 'gorsel', src: '/images/hero/katman/machinery1.png', w: 799, h: 232, x: 370, y: 76, gecis: 'sfl', basla: 500, sure: 2500 },
      { tur: 'gorsel', src: '/images/hero/katman/ok-worker.png', w: 202, h: 500, x: 1283, y: 9, gecis: 'sfr', basla: 3350, sure: 1000 },
    ],
  },
  {
    // Mühendis solda, analiz görseli sağ üstte (y6-267) → yazı sağ alta.
    arka: '/images/hero/slide-2-bg.jpg',
    alt: 'Proje modelleme',
    yazi: {
      ustlik: 'Mühendislik',
      baslik: 'Başarı, tesadüften fazlasını gerektirir',
      satirlar: ['Uygulanacak projeyi bilgisayar yazılımlarıyla modelliyor, sonuçları işe başlamadan paylaşıyoruz.'],
      konum: 'sag', dikey: 'alt', tema: 'acik',
    },
    katmanlar: [
      { tur: 'gorsel', src: '/images/hero/katman/deltek-robot-engineer.png', w: 489, h: 506, x: 360, y: 20, gecis: 'lfb', basla: 500, sure: 3000 },
      { tur: 'gorsel', src: '/images/hero/katman/yatay-sondaj-pipe-analysis.png', w: 437, h: 261, x: 1094, y: 6, gecis: 'lfr', basla: 500, sure: 3000 },
    ],
  },
  {
    // Portre katmanı sağda (x1295) → yazı sola.
    arka: '/images/hero/slide-1-bg.jpg',
    alt: 'Altyapı projesi',
    yazi: {
      ustlik: 'Hemen arayın',
      baslik: 'Sizin için projelendirelim',
      satirlar: ["2 mm'den 2000 mm'ye varan çaplarda altyapı projelerine çözüm."],
      eylem: 'Teklif isteyin',
      konum: 'sol', dikey: 'orta', tema: 'acik',
    },
    katmanlar: [
      { tur: 'gorsel', src: '/images/hero/katman/1woman.png', w: 309, h: 451, x: 1295, y: 38, gecis: 'sfb', basla: 500, sure: 2500 },
    ],
  },
  {
    // El görseli sağ altta (x940 y225) → yazı sola.
    arka: '/images/hero/button-bg-1.jpg',
    alt: 'Altyapı çözümleri',
    yazi: {
      ustlik: 'Altyapıda fark',
      baslik: 'Etkin çözümlerimizle rakiplerinizin önüne geçin',
      konum: 'sol', dikey: 'orta', tema: 'acik',
    },
    katmanlar: [
      { tur: 'gorsel', src: '/images/hero/katman/button-hand.png', w: 290, h: 277, x: 940, y: 225, gecis: 'lfb', basla: 4000, sure: 1000 },
    ],
  },
  {
    // Makine sağ-ortada, sol taraf boş → yazı sola.
    arka: '/images/hero/deltek-yatay-sondaj-marka.jpg',
    alt: 'Deltek yatay sondaj makinesi',
    yazi: {
      ustlik: 'Deltek',
      baslik: 'Yatay sondajda bir dünya markası',
      konum: 'sol', dikey: 'orta', tema: 'acik',
    },
    katmanlar: [],
  },
];

// İngilizce metinler Türkçe orijinallerin çevirisidir, Deltek onayından
// geçmedi (bkz. CLAUDE.md). Görsel katmanlar TR ile aynıdır.
const EN_YAZI: HeroYazi[] = [
  { ustlik: 'Onshore / Offshore', baslik: 'Your reliable partner in HDD projects',
    konum: 'sag', dikey: 'orta', tema: 'koyu' },
  { ustlik: 'Where we work', baslik: 'Wherever you need horizontal drilling, we are with you',
    satirlar: ['Power · Natural gas · Sewerage · Telecoms · Potable water and drainage'],
    eylem: 'Get in touch', konum: 'sol', dikey: 'orta', tema: 'koyu' },
  { ustlik: 'Hard ground', baslik: 'Rock drilling & immense power',
    konum: 'sol', dikey: 'orta', tema: 'koyu' },
  { ustlik: 'Technology', baslik: 'Horizontal drilling and boring technologies',
    satirlar: ['Start by choosing the drilling method that fits your purpose.'],
    eylem: 'Contact us', konum: 'sol', dikey: 'ust', tema: 'acik' },
  { ustlik: 'You are in the right place', baslik: 'Horizontal drilling specialists',
    satirlar: ['Advanced technical infrastructure, extensive machine fleet'],
    konum: 'sol', dikey: 'alt', tema: 'acik' },
  { ustlik: 'Engineering', baslik: 'Success takes more than coincidence',
    satirlar: ['We model the project in software and share the results before work begins.'],
    konum: 'sag', dikey: 'alt', tema: 'acik' },
  { ustlik: 'Call us now', baslik: 'Let us engineer it for you',
    satirlar: ['Solutions for infrastructure projects from 2 mm to 2000 mm in diameter.'],
    eylem: 'Request a quote', konum: 'sol', dikey: 'orta', tema: 'acik' },
  { ustlik: 'A difference in infrastructure', baslik: 'Get ahead of your competitors with effective solutions',
    konum: 'sol', dikey: 'orta', tema: 'acik' },
  { ustlik: 'Deltek', baslik: 'A global brand in horizontal drilling',
    konum: 'sol', dikey: 'orta', tema: 'acik' },
];

export const HERO_EN: HeroSlayt[] = HERO_TR.map((s, i) => ({ ...s, yazi: EN_YAZI[i] }));
