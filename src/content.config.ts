import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Blog — Sveltia CMS i18n (structure: multiple_folders):
//   src/content/blog/tr/<slug>.md   (Türkçe, ana dil)
//   src/content/blog/en/<slug>.md   (İngilizce çeviri — zorunlu değil)
//
// DOSYA ADI = URL SLUG'I. Canlı deltek.com.tr'deki yazı slug'ı birebir
// korunmalı (bkz. CLAUDE.md "URL / slug kuralı"). Frontmatter'da slug
// alanı bilerek yok — tek doğru kaynak dosya adıdır.
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

export const collections = { blog };
