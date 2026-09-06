import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Her iki koleksiyon da Sveltia CMS i18n (structure: multiple_folders) ile
// yönetilir: <klasör>/tr/<slug>.md ve <klasör>/en/<slug>.md
//
// DOSYA ADI = URL SLUG'I. Canlı deltek.com.tr'deki slug birebir korunmalı
// (bkz. CLAUDE.md "URL / slug kuralı"). Frontmatter'da slug alanı bilerek yok.

// Blog yazıları → /<slug>/
const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    baslik: z.string(),
    ozet: z.string().optional(),
    tarih: z.coerce.date().optional(),
    kapak: z.string().optional(),
    video: z.string().optional(),
    galeri: z.array(z.object({ foto: z.string().optional() })).optional(),
  }),
});

// Kurumsal / teknoloji / hizmet sayfaları → /<slug>/
// Yazılarla AYNI kök alanı paylaşırlar; slug çakışması build'i durdurur.
const sayfalar = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/sayfalar' }),
  schema: z.object({
    baslik: z.string(),
    ozet: z.string().optional(),
    kapak: z.string().optional(),
    // Header menüsünde görünsün mü ve hangi sırada (boşsa menüde çıkmaz)
    menuSira: z.number().optional(),
    menuAd: z.string().optional(),
    // İçerik düzeni:
    //   'logo-izgara' → art arda gelen görselleri yan yana dizer (referans logoları)
    //   'urun'        → ürün/teknoloji şablonu (banner + görsel-metin blokları
    //                   + teknik tablolar + galeri; bkz. components/UrunDuzen.astro)
    //   'referanslar' → sayfanın başına kayan logo şeridi basar
    //                   (bkz. components/LogoSerit.astro), altına markdown gövdesi
    //   'iletisim'    → iletişim şablonu (hızlı iletişim + ofis kartları + harita;
    //                   ofisler src/data/site.ts OFISLER'den gelir, form YOK)
    // Boşsa normal makale akışı.
    duzen: z.enum(['logo-izgara', 'urun', 'iletisim', 'hizmet', 'referanslar']).optional(),

    // <title> ve OG başlığı. Sayfanın görünen başlığı (<h1>) kısaltıldığında
    // arama motorlarına giden uzun, anahtar kelimeli başlık burada saklanır.
    // Boşsa `baslik` kullanılır — yani normal sayfalarda hiç yazılmaz.
    seoBaslik: z.string().optional(),

    // Başlık banner'ı: src/assets/banner/<deger>.jpg sembolünü sayfanın
    // <h1>'iyle yan yana basar (bkz. components/SayfaBanner.astro). Verilirse
    // `banner` alanı yok sayılır ve ayrı bir <h1> basılmaz — başlık banner'ın
    // içindedir. Dosya yoksa build durur.
    bannerSembol: z.string().optional(),

    // Sayfanın altına Teknoloji bölümünün kart haritasını basar
    // (bkz. components/TeknolojiHaritasi.astro). Yalnızca bölüm kök
    // sayfasında açılır.
    bolumHaritasi: z.boolean().optional(),
    // Sol sütunda Teknoloji bölümünün ağaç menüsünü gösterir.
    yanMenu: z.boolean().optional(),

    // ── duzen: 'hizmet' alanları ──────────────────────────────
    // Hizmetlerimiz sayfası: kart ızgaraları + "neden biz" + proje galerisi.
    // `ikon` HizmetDuzen.astro içindeki SVG setinden bir anahtar.
    hizmetler: z.array(z.object({
      baslik: z.string(),
      kisaltma: z.string().optional(),
      metin: z.string(),
      href: z.string().optional(),
      ikon: z.string().optional(),
    })).optional(),
    neden: z.object({
      baslik: z.string().optional(),
      metin: z.string().optional(),
      maddeler: z.array(z.string()).optional(),
      gorsel: z.string().optional(),
    }).optional(),
    projeler: z.object({
      baslik: z.string().optional(),
      metin: z.string().optional(),
      galeri: z.array(z.object({ foto: z.string(), alt: z.string().optional() })).optional(),
    }).optional(),
    alanlar: z.object({
      baslik: z.string().optional(),
      ogeler: z.array(z.object({
        baslik: z.string(),
        metin: z.string(),
        href: z.string().optional(),
        ikon: z.string().optional(),
      })).optional(),
    }).optional(),

    // ── duzen: 'iletisim' alanları ────────────────────────────
    // duzen: 'iletisim' — sayfanın altındaki tanıtım görseli (public/ yolu).
    // Boşsa o bölüm hiç basılmaz. (Burada önce Google Haritalar gömme adresi
    // vardı; harita bölümü kaldırıldı.)
    gorsel: z.string().optional(),

    // ── duzen: 'urun' alanları ────────────────────────────────
    banner: z.string().optional(),
    bloklar: z.array(z.object({
      baslik: z.string().optional(),
      metin: z.string().optional(),
      gorsel: z.string().optional(),
      ters: z.boolean().optional(),
      boyut: z.enum(['ceyrek', 'otuz', 'kirk', 'elli', 'yari', 'kucuk']).optional(),
    })).optional(),
    tablolar: z.array(z.object({
      baslik: z.string().optional(),
      aciklama: z.string().optional(),
      basliklar: z.array(z.string()).optional(),
      satirlar: z.array(z.union([
        z.array(z.string()),
        z.object({ hucreler: z.array(z.string()) }),
      ])).optional(),
    })).optional(),
    galeri: z.array(z.object({
      foto: z.string().optional(),
      alt: z.string().optional(),
    })).optional(),
  }),
});

export const collections = { blog, sayfalar };
