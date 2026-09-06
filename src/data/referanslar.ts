/**
 * Referans logoları — /referanslar/ sayfasının başındaki kayan şerit.
 *
 * Sıra şeritte göründüğü sıradır. Dosyası olmayan kayıt şeritte HİÇ
 * BASILMAZ (bkz. LogoSerit.astro): kırık görsel yerine boşluk bırakılır,
 * dosya eklendiği anda kendiliğinden görünür.
 *
 * Mevcut yedi logo canlı deltek.com.tr'den taşındı (WordPress yolları
 * korunuyor). Saipem ve Aramco'nun görselleri HENÜZ YOK — dosyalar
 * `public/images/referans/` altına aşağıdaki adlarla konulmalı.
 */
export type ReferansLogo = { src: string; ad: string };

export const REFERANS_LOGOLARI: ReferansLogo[] = [
  { src: '/images/uploads/2015/08/kolin.jpg',    ad: 'Kolin İnşaat' },
  { src: '/images/uploads/2015/08/tcdd.jpg',     ad: 'TCDD' },
  { src: '/images/uploads/2015/08/ericsson.jpg', ad: 'Ericsson' },
  { src: '/images/uploads/2015/08/iski.jpg',     ad: 'İSKİ' },
  { src: '/images/uploads/2015/08/siemens.jpg',  ad: 'Siemens' },
  { src: '/images/uploads/2015/08/teias.jpg',    ad: 'TEİAŞ' },
  { src: '/images/uploads/2015/08/botas.jpg',    ad: 'BOTAŞ' },
  // ── Görseli beklenenler ────────────────────────────────────────
  { src: '/images/referans/saipem.png', ad: 'Saipem' },
  { src: '/images/referans/aramco.png', ad: 'Aramco' },
];
