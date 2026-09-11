// Ana sayfa hero slider verisi.
//
// GÖRSEL KATMANLAR canlı deltek.com.tr'deki Revolution Slider'dan birebir
// çıkarıldı: konum, geçiş tipi, gecikme ve süre orijinaliyle aynı
// (ör. 6. slaytta sondaj biti soldan gelip toprak adasına giriyor).
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
// Not: 3. slaydın deltek-proje-danismani.png katmanı canlı sunucuda 404 veriyor; orijinali
// web arşivinden (2025-04-01 anlık görüntüsü) alınıp depoya kondu.

export type HeroKatman = {
  tur: 'gorsel' | 'video';
  src?: string; video?: string; w: number; h: number;
  x: number; y: number;
  gecis: string;
  basla: number; sure: number;
  /**
   * Slider 1450 px'in altına inince bu katman gizlenir.
   *
   * Gerekçe: yazı kuşağı SABİT 1077 px, katmanlar ise ekranla ORANTILI
   * ölçekleniyor. Ekran daraldıkça yazı, tasarım ızgarasında giderek daha
   * sağa uzanır (1920 px'te sağ kenarı x1499, 885 px'te x1843). Bu yüzden
   * sağa hizalı bir yazının yanında duran sağ kenar katmanları dar
   * ekranlarda kaçınılmaz olarak yazının altında kalır.
   */
  darGizle?: boolean;
};

export type HeroYazi = {
  ustlik?: string;          // küçük, aralıklı üst satır
  baslik: string;
  /**
   * Başlığın puntosu — 1920×500 tasarım ızgarasında. Verilmezse **52**.
   *
   * Katman koordinatlarıyla aynı birim, yani ekranla orantılı ölçeklenir;
   * `punto: 42` her genişlikte "varsayılanın %81'i" demektir. Dar ekran
   * düzeni de bu değeri kullanır (oradaki oran sabit: %75'i).
   *
   * Uzun başlıklar için: 52'de üç-dört satıra sarıp hem hantal duruyor hem
   * de metin bloğu aşağı uzayıp katmanlara yaklaşıyor. Puntoyu düşürmek
   * ikisini birden çözüyor.
   */
  punto?: number;
  satirlar?: string[];
  eylem?: string;           // buton metni
  /**
   * Butonun bağlantısı. Verilmezse `/iletisim/`; EN slaytlarda
   * `eylemHref: '/en/contact/'` açıkça yazılır.
   */
  eylemHref?: string;
  /**
   * Metin bloğunun yatay yeri — görsel katmanların boş bıraktığı taraf.
   * 'merkez' bloğu sayfanın tam ortasına alır ve metni ortalar; katmanı
   * olmayan ya da katmanları iki yana dağılmış slaytlar için.
   * (Değer 'orta' DEĞİL: 'orta' `dikey`de kullanılıyor, aynı CSS sınıfını
   * üretip çakışırdı.)
   */
  konum: 'sol' | 'merkez' | 'sag';
  /** Dikey hizası — katmanların kapladığı bandın dışına konumlanır. */
  dikey: 'ust' | 'orta' | 'alt';
  /**
   * `konum`/`dikey` ile seçilen dokuz hazır yerin üstüne İNCE AYAR.
   * Birim, katmanlarla AYNI: 1920×500 tasarım ızgarası pikseli — yani ekranla
   * birlikte orantılı ölçeklenir, sabit CSS pikseli değildir. Böylece bir
   * katmanı `x: 40` kaydırmakla yazıyı `kaydir: { x: 40 }` kaydırmak aynı
   * mesafeyi verir.
   *
   *   x: pozitif → sağa,  negatif → sola
   *   y: pozitif → aşağı, negatif → yukarı
   *
   * İki sınırı var:
   * - **Dar ekranda (≤820px) yok sayılır.** Orada katmanlar gizleniyor ve
   *   yazı tam genişlikte ortalanıyor; masaüstü için verilen kaydırma o
   *   düzeni bozardı.
   * - `eylemKonum: 'dip'` ile ayrılan buton bloğuna yalnız **x** uygulanır.
   *   Buton bilerek slaytın dibine sabit; y'yi ona da uygulamak o sabitlemeyi
   *   anlamsız kılardı. x uygulanır ki buton yazıyla hizalı kalsın.
   */
  kaydir?: { x?: number; y?: number };
  /** Arka plan koyu mu açık mı: yazı ve perde rengini belirler. */
  tema: 'koyu' | 'acik';
  /**
   * Butonun yeri. Varsayılan 'akis': metin bloğunun sonunda, akış içinde.
   * 'dip': metin bloğundan koparılıp slaytın en altına sabitlenir — metnin
   * altındaki bandı bir katman kapladığında kullanılır (bkz. 6. slayt).
   */
  eylemKonum?: 'akis' | 'dip';
};

/**
 * Bir slaydın İngilizce metni.
 *
 * DÜZEN ALANLARI BURADA YOK: `konum`, `dikey`, `tema`, `eylemKonum` ve
 * `kaydir` slaydın Türkçe tanımından miras alınır — düzen dile göre değil
 * arka plandaki görsele göre seçiliyor, iki dilde ayrı tutmanın anlamı yok.
 * (Ayrı tutulduğunda kaçınılmaz olarak ayrışıyordu: TR'de düzeltilen bir
 * konum EN'de eski haliyle kalıyordu.)
 *
 * Gerçekten dile bağlı bir istisna çıkarsa — İngilizce başlık bir satır
 * uzun sarıp katmana değiyor gibi — o alanı burada yazıp ezebilirsiniz;
 * yanına NEDEN gerektiğini de yazın.
 */
export type HeroYaziEN =
  Pick<HeroYazi, 'ustlik' | 'baslik' | 'satirlar' | 'eylem' | 'eylemHref'> &
  Partial<Pick<HeroYazi, 'konum' | 'dikey' | 'tema' | 'eylemKonum' | 'kaydir' | 'punto'>>;

export type HeroSlayt = {
  arka: string;
  alt: string;
  yazi: HeroYazi;
  katmanlar: HeroKatman[];
  /**
   * Slaydın İngilizcesi — metin ve arka plan alt'ı. Her slaydın KENDİ
   * içinde durur; eskiden ayrı `EN_YAZI`/`EN_ALT` dizilerindeydi ve
   * slaytlarla sıra numarasından eşleşiyordu. Bir slayt eklemek, silmek
   * ya da yer değiştirmek diziyi kaydırıp her slaydı yanlış İngilizce
   * metinle eşliyordu; üstelik hata vermeden, yalnız /en/ sayfasında.
   */
  en: { alt: string; yazi: HeroYaziEN };
};

/** Canlı slider'ın tasarım ızgarası — ölçekleme bu değerlere göre yapılır. */
export const HERO_IZGARA = { g: 1920, y: 500 };

export const HERO_TR: HeroSlayt[] = [
  {
    // Makine + işçi grubu solda, yazı sağda. Grup 1920'lik ekranda başlığın
    // altına giriyordu (ölçüldü: 62 px, %28 opak); 160 tasarım px sola alındı.
    arka: '/images/hero/deltek-yatay-sondaj-makine-parki.webp',
    alt: 'Deltek yatay sondaj makine parkı — yönlendirilebilir yatay sondaj makinesi',
    yazi: {
      ustlik: 'Doğru yerdesiniz',
      // Makine görseli genişleyince yazı sağa alındı; başlık ve gövde
      // metni dar sütuna sığsın diye \n ile elle kırılıyor.
      baslik: 'Yatay Sondaj\nUzmanı',
      satirlar: ['Yüksek teknolojik altyapı,\ngeniş makine parkı'],
      konum: 'sag', dikey: 'orta', tema: 'acik',
    },
    katmanlar: [
      // Makine soldan girer, ardından işçi sağdan katılır. Orijinalde işçi
      // 3350 ms'de başlıyordu (toplam 4,35 sn); diğer slaytlarla aynı ritmi
      // tutturmak için öne çekildi.
      // h değerleri DOSYANIN gerçek oranından: makine 590x318, işçi 294x800.
      // (Eskiden 232 ve 350 yazıyordu — bir öncekinden kalma; makine 174 px
      // sanılıp 323 px çıkıyordu. Artık HeroSlider derlemede doğruluyor.)
      { tur: 'gorsel', src: '/images/hero/katman/yonlendirilebilir-yatay-sondaj-makinesi.webp', w: 500, h: 273, x: 640, y: 86, gecis: 'sfl', basla: 400, sure: 1800 },
      // `darGizle` kaldırıldı: işçi artık grubun SOL ucunda (x300-470), sağa
      // hizalı yazıya hiçbir genişlikte değmiyor. Gizlemek dar ekranda
      // kompozisyonu boşaltmaktan başka işe yaramıyordu.
      { tur: 'gorsel', src: '/images/hero/katman/deltek-saha-iscisi.webp', w: 150, h: 408, x: 520, y: 90, gecis: 'sfl', basla: 1300, sure: 900 },
    ],
    en: {
      alt: 'Deltek horizontal drilling fleet — horizontal directional drilling rig',
      yazi: {
        ustlik: 'You are in the right place',
        // Başlık TR'de iki, EN'de üç satır; ikisi de makine görselinin sağındaki
        // dar sütuna \n ile elle kırılıyor.
        baslik: 'Horizontal\ndrilling\nspecialists',
        satirlar: ['Advanced technical infrastructure,\nextensive machine fleet'],
      },
    },
  },
  {
    // Saha fotoğrafı: sondaj makinesi solda, deniz sağda → yazı sağa.
    arka: '/images/hero/deltek-onshore-hdd-yatay-sondaj-sahasi.webp',
    alt: 'Deltek onshore yönlendirilebilir yatay sondaj (HDD) sahası — kıyıda kurulu HDD makinesi',
    yazi: {
      ustlik: 'Onshore / Offshore',
      baslik: 'HDD projelerinde güvenilir iş ortağınız',
      kaydir: {x: -100, y:0},
      konum: 'sag', dikey: 'orta', tema: 'koyu',
    },
    katmanlar: [],
    en: {
      alt: 'Deltek onshore horizontal directional drilling (HDD) site — HDD rig set up on the shore',
      yazi: {
        ustlik: 'Onshore / Offshore',
        baslik: 'Your reliable partner in HDD projects',
      },
    },
  },
  {
    // Portre katmanı sağda (x1295) → yazı sola.
    arka: '/images/hero/kazisiz-altyapi-projesi-arkaplan.webp',
    alt: 'Kazısız altyapı projesi — 2 mm ile 2000 mm çap arası yatay sondaj çözümleri',
    yazi: {
      ustlik: 'Hemen arayın',
      baslik: 'Sizin için projelendirelim',
      satirlar: ["2 mm'den 2000 mm'ye varan çaplarda altyapı projelerine çözüm."],
      kaydir: { x:100, y:0},
      eylem: 'Teklif isteyin',
      konum: 'sol', dikey: 'orta', tema: 'acik',
    },
    katmanlar: [
      { tur: 'gorsel', src: '/images/hero/katman/deltek-proje-danismani.webp', w: 309, h: 451, x: 1220, y: 50, gecis: 'sfb', basla: 400, sure: 1800 },
    ],
    en: {
      alt: 'Trenchless infrastructure project — HDD solutions from 2 mm to 2000 mm diameter',
      yazi: {
        ustlik: 'Call us now',
        baslik: 'Let us engineer it for you',
        satirlar: ['Solutions for infrastructure projects from 2 mm to 2000 mm in diameter.'],
        eylem: 'Request a quote', eylemHref: '/en/contact/',
      },
    },
  },
  {
    // Koyu mavi tonlu şantiye; sağdaki boru hattı dolu → yazı sola.
    arka: '/images/hero/boru-hatti-yatay-sondaj-santiyesi.webp',
    alt: 'Yatay sondaj ile döşenen boru hattı şantiyesi — elektrik, doğalgaz ve içme suyu geçişleri',
    yazi: {
      ustlik: 'Kullanım alanları',
      baslik: 'Yatay sondaja ihtiyaç duyduğunuz her alanda yanınızdayız',
      // Satır kırmak için \n kullanılır; <br /> düz metin olarak basılır.
      satirlar: ['Elektrik · Doğalgaz · Kanalizasyon\nTelekomünikasyon · İçme suyu ve drenaj'],
      eylem: 'İletişime geçin',
      konum: 'merkez', dikey: 'orta', tema: 'koyu',
    },
    katmanlar: [],
    en: {
      alt: 'Pipeline construction site with horizontal directional drilling — power, gas and water crossings',
      yazi: {
        ustlik: 'Where we work',
        baslik: 'Wherever you need horizontal drilling, we are with you',
        satirlar: ['Power · Natural gas · Sewerage\nTelecoms · Potable water and drainage'],
        eylem: 'Get in touch', eylemHref: '/en/contact/',
      },
    },
  },
  {
    // Mühendis solda, analiz görseli sağ üstte (y6-267) → yazı sağ alta.
    arka: '/images/hero/yatay-sondaj-proje-modelleme-arkaplan.webp',
    alt: 'Yatay sondaj projesinin bilgisayar ortamında modellenmesi — Deltek mühendislik',
    yazi: {
      ustlik: 'Mühendislik',
      baslik: 'Başarı, tesadüften fazlasını gerektirir',
      satirlar: ['Uygulanacak projeyi bilgisayar yazılımlarıyla modelliyor, sonuçları işe başlamadan paylaşıyoruz.'],
      konum: 'sag', dikey: 'alt', tema: 'acik',
    },
    katmanlar: [
      // Orijinalde ikisi de 500 ms'de başlayıp 3000 ms sürüyordu; aynı anda
      // aynı hızda hareket iki nesneyi tek blok gibi gösteriyordu. Hafif
      // kademelendirildi ve hızlandırıldı.
      { tur: 'gorsel', src: '/images/hero/katman/deltek-robot-engineer.webp', w: 489, h: 506, x: 360, y: 20, gecis: 'lfb', basla: 400, sure: 2000 },
      // %30 küçültüldü (437→306) ve 150 px sola alındı (1094→944): önceki
      // boyutta görselin alt kenarı başlığın ilk satırına biniyordu.
      // y 36 -> 10: piksel ölçümünde çakışma yoktu ama grafiğin alt kenarı
      // "MÜHENDİSLİK" üstlüğünün harflerine değecek kadar yakındı (~10 px).
      { tur: 'gorsel', src: '/images/hero/katman/yatay-sondaj-pipe-analysis.webp', w: 260, h: 155, x: 970, y: 45, gecis: 'lfr', basla: 700, sure: 1800 },
    ],
    en: {
      alt: 'Computer modelling of a horizontal directional drilling project — Deltek engineering',
      yazi: {
        ustlik: 'Engineering',
        baslik: 'Success takes more than coincidence',
        satirlar: ['We model the project in software and share the results before work begins.'],
      },
    },
  },
  {
    // Tij şeridi altta (y312+), toprak adası sağda → yazı sol üste.
    arka: '/images/hero/yatay-delgi-sondaj-teknolojileri-arkaplan.webp',
    alt: 'Yatay delgi ve yatay sondaj teknolojileri — delgi tiji ve toprak kesiti',
    yazi: {
      ustlik: 'Teknoloji',
      baslik: 'Yatay delgi ve sondaj teknolojileri',
      // y kaydırması yok: buton artık akışta değil (aşağıdaki `eylemKonum`),
      // blok da kendi doğal yerinde duruyor.
      kaydir: { x: 100, y: 0 },
      satirlar: ['Amacınıza en uygun yatay sondaj yöntemini seçerek işe başlayın.'],
      eylem: 'Bize ulaşın',
      // Buton metin bloğundan koparılıp slaytın DİBİNE sabitleniyor
      // (y~411-474): delgi tijinin mavi borusu y334-376'da, buton onun
      // ALTINDA kalsın diye. Akışta bırakılırsa y~282-340'a düşüyor, yani
      // borunun üstüne çıkıyor — istenen bu değil.
      //
      // Bedeli: borunun altındaki açık gri gölge şeridi (y405-449) butonun
      // arkasında kalıyor. Gölge, nesne değil; mavi buton üstünde sorunsuz
      // okunuyor. Şeritten de kurtulacak kadar yer yok — boru ile şerit
      // arasında 29 px var, buton 63 px.
      //
      // Butonun yüksekliği: HeroSlider.astro → `.yazi--dip { bottom: ... }`.
      eylemKonum: 'dip',
      konum: 'sol', dikey: 'ust', tema: 'acik',
    },
    katmanlar: [
      { tur: 'gorsel', src: '/images/hero/katman/yatay-sondaj-delgi-tiji-ve-bit.webp', w: 1530, h: 141, x: -2, y: 312, gecis: 'lfl', basla: 500, sure: 1000 },
      // Ada sağdan (lfr), tij soldan (lfl) gelip ortada buluşuyor; ikisi de
      // ~1,5 sn'de yerine oturuyor.
      { tur: 'gorsel', src: '/images/hero/katman/yatay-sondaj-toprak-kesiti.webp', w: 325, h: 430, x: 1132, y: 102, gecis: 'lfr', basla: 200, sure: 1200 },
    ],
    en: {
      alt: 'Horizontal drilling and boring technologies — drill rod and soil cross-section',
      yazi: {
        ustlik: 'Technology',
        baslik: 'Horizontal drilling and boring technologies',
        satirlar: ['Start by choosing the drilling method that fits your purpose.'],
        eylem: 'Contact us', eylemHref: '/en/contact/',
      },
    },
  },
  {
    // Video ekranı katmanı sağda (x1060) → yazı sola.
    arka: '/images/hero/kaya-delgi-yatay-sondaj-arkaplan.webp',
    alt: 'Kaya delgi — sert zeminde yönlendirilebilir yatay sondaj uygulaması',
    yazi: {
      ustlik: 'Sert zemin',
      baslik: 'Kaya delgi & muazzam güç',
      // 120 idi: 1480-1640 px arasında başlık tabletin üstüne biniyordu
      // (%100 opak). Yazı 60 sola, tablet 60 sağa alınarak ayrıldılar.
      kaydir: { x: 60, y: 0 },
      konum: 'sol', dikey: 'orta', tema: 'koyu',
    },
    katmanlar: [
      // x 1060 -> 1120 (yukarıdaki `kaydir` notu). Video katmanı tabletin
      // ekranına oturduğu için AYNI kadar kaydırıldı (1110 -> 1170).
      { tur: 'gorsel', src: '/images/hero/katman/kaya-delgi-video-tablet.webp', w: 574, h: 400, x: 1120, y: 80, gecis: 'sfb', basla: 500, sure: 1500 },
      // Ölçüler tablet PNG'sinin koyu ekran dikdörtgeninden ölçüldü (474×351 @ 1110,104).
      // Canlı slider 486×356 @ 1109,99 diyor ama o değer ekranı birkaç piksel taşırıyor.
      //
      // Orijinalde video da tabletle aynı anda (500 ms) başlıyor ama 300 ms'de
      // yerine oturuyordu; tablet 1500 ms kaydığı için ekran 1,2 sn boyunca
      // çerçeveden ayrık kalıyordu. Artık tablet oturduktan sonra ekran
      // yanıyor — hem kusur gidiyor hem iframe uçarken render edilmiyor.
      { tur: 'video', video: 'https://www.youtube.com/embed/96BoFl4XQOc', w: 474, h: 351, x: 1170, y: 104, gecis: 'fade', basla: 2000, sure: 700 },
    ],
    en: {
      alt: 'Rock drilling — horizontal directional drilling in hard ground',
      yazi: {
        ustlik: 'Hard ground',
        baslik: 'Rock drilling & immense power',
      },
    },
  },
  {
    // El görseli sağ altta (x940-1230, y225-502) → yazı sola.
    // Ortada dururken başlığın ilk satırı ("Etkin çözümlerimizle") elin
    // tuttuğu mavi düğmeye değiyordu; yazı üste alınarak ayrıldı.
    arka: '/images/hero/kazisiz-altyapi-cozumleri-arkaplan.webp',
    alt: 'Kazısız altyapı çözümleri — Deltek yatay sondaj ile rekabet avantajı',
    yazi: {
      ustlik: 'Altyapıda fark',
      baslik: 'Etkin çözümlerimizle rakiplerinizin önüne geçin',
      // Sitenin en uzun başlığı; 52'de üç-dört satıra sarıyor, blok da
      // aşağı uzayıp el görseline yaklaşıyordu. 42'de iki satır.
      punto: 42,
      kaydir: { x: 100, y: 0},
      konum: 'sol', dikey: 'ust', tema: 'acik',
    },
    katmanlar: [
      // Orijinalde 4000 ms'de başlıyordu: yazı 1,4 sn'de bitip slayt 2,6 sn
      // boş kalıyordu. Yazının hemen ardına alındı.
      // x/y KİLİTLİ — arka planın kompozisyonuna oturuyor, serbest değil.
      // Arka planda 14 anahtardan oluşan bir sıra var (dosyada y290-348,
      // yani tasarım y285-343; adım 70 px) ve sırada BİR ANAHTAR EKSİK:
      // x941-964. Katmanın mavi düğmesi tam o boşluğa denk geliyor
      // (katman dosyasında x4-31 → 940 + 4 = 944) ve sıranın hemen üstünde
      // duruyor (tasarım y229-284, sıra 285'te başlıyor) — yani "yukarı
      // kaldırılmış anahtar". Katmanı kaydırmak bu anlatıyı bozar.
      //
      // Bir ara x:1140'a alınmıştı (İngilizce başlık ele biniyordu diye);
      // düğme sıradaki boşluktan çıkıp anahtarların üstüne oturuyordu.
      // Çakışma artık doğru yerden, `punto: 42` ile çözülüyor.
      { tur: 'gorsel', src: '/images/hero/katman/deltek-cozum-dugmesi-el.webp', w: 290, h: 277, x: 940, y: 225, gecis: 'lfb', basla: 1400, sure: 900 },
    ],
    en: {
      alt: 'Trenchless infrastructure solutions — a competitive edge with Deltek HDD',
      yazi: {
        ustlik: 'A difference in infrastructure',
        baslik: 'Get ahead of your competitors with effective solutions',
      },
    },
  },
];

/**
 * Sitenin İngilizce ana sayfasındaki slaytlar.
 *
 * Görsel katmanlar, arka planlar ve DÜZEN Türkçe slayttan aynen gelir;
 * değişen yalnız metin ve arka plan alt'ıdır. Böylece slayt sırasını
 * değiştirmek, slayt eklemek ya da silmek iki dili birden taşır.
 *
 * Metin alanları TAMAMEN `en.yazi`den alınır: `en.yazi`de olmayan bir metin
 * alanı İngilizce sayfada BOŞ kalır, Türkçesine düşmez. (Düşseydi
 * eksik çeviri, Türkçe bir satır olarak /en/'de yayına çıkardı.)
 *
 * İNGİLİZCE METİNLER ÇEVİRİDİR, Deltek onayından geçmedi (bkz. CLAUDE.md).
 */
export const HERO_EN: HeroSlayt[] = HERO_TR.map((s, i) => {
  // Destructuring metni düzenden ayırıyor: adı yazılanlar metin, geri kalan
  // (`...duzen`) EN'e özel düzen ezmesi.
  const { ustlik, baslik, satirlar, eylem, eylemHref, ...duzen } = s.en.yazi;
  // eylemHref boş bırakılırsa HeroSlider `/iletisim/`e düşer: İngilizce
  // sayfadaki buton Türkçe iletişim sayfasına götürür. Sessiz bir kusur,
  // build'de yakalansın.
  if (eylem && !eylemHref?.startsWith('/en/')) {
    throw new Error(
      `Hero slayt ${i + 1}: en.yazi.eylem var ama eylemHref "/en/" ile başlamıyor ` +
      `— "${eylemHref ?? '(verilmemiş)'}". İngilizce buton Türkçe sayfaya götürür. ` +
      `(src/data/hero.ts)`);
  }
  return {
    ...s,
    alt: s.en.alt,
    yazi: { ...s.yazi, ...duzen, ustlik, baslik, satirlar, eylem, eylemHref },
  };
});
