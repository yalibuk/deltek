/**
 * Referans logoları — /referanslar/ sayfasının başındaki kayan şerit.
 *
 * Sıra şeritte göründüğü sıradır. Dosyası olmayan kayıt şeritte HİÇ
 * BASILMAZ (bkz. LogoSerit.astro): kırık görsel yerine boşluk bırakılır,
 * dosya eklendiği anda kendiliğinden görünür.
 *
 * Buradaki dosyalar KIRPILMIŞ kopyalardır: `scripts/referans-logo-kirp.mjs`
 * kaynaklardaki boş payı atar, böylece her dosya = logonun kendisi olur ve
 * şeritte optik olarak dengeli görünürler. Kaynaklar
 * `public/images/uploads/2015/08/` (canlı siteden gelen yedi logo) ve
 * `public/images/referans/kaynak/` (Saipem, Aramco) altında durur.
 */
export type ReferansLogo = { src: string; ad: string };

export const REFERANS_LOGOLARI: ReferansLogo[] = [
  { src: '/images/referans/kolin.jpg',    ad: 'Kolin İnşaat' },
  { src: '/images/referans/tcdd.jpg',     ad: 'TCDD' },
  { src: '/images/referans/ericsson.jpg', ad: 'Ericsson' },
  { src: '/images/referans/iski.jpg',     ad: 'İSKİ' },
  { src: '/images/referans/siemens.jpg',  ad: 'Siemens' },
  { src: '/images/referans/teias.jpg',    ad: 'TEİAŞ' },
  { src: '/images/referans/botas.jpg',    ad: 'BOTAŞ' },
  { src: '/images/referans/saipem.png',   ad: 'Saipem' },
  { src: '/images/referans/aramco.png',   ad: 'Aramco' },
];
