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
    // İçerik düzeni: 'logo-izgara' art arda gelen görselleri yan yana dizer
    // (referans logoları gibi). Boşsa normal makale akışı.
    duzen: z.enum(['logo-izgara']).optional(),
  }),
});

export const collections = { blog, sayfalar };
