import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Sahadan / Projeler — referanslar, saha foto/videoları, haberler.
// Panelden (Sveltia CMS) düzenlenir. Dosyalar: src/content/projeler/*.md
const projeler = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projeler' }),
  schema: z.object({
    baslik: z.string(),
    ozet: z.string().optional(),
    tarih: z.coerce.date().optional(),
    kapak: z.string().optional(),
    makine: z.string().optional(),   // ilgili ürün / hizmet etiketi
    konum: z.string().optional(),
    video: z.string().optional(),
    galeri: z.array(z.object({ foto: z.string().optional() })).optional(),
    slug: z.string().optional(),
  }),
});

export const collections = { projeler };
