# deltek-site

deltek.com.tr için Astro tabanlı statik site. Ayrıntılı proje notları: [CLAUDE.md](./CLAUDE.md)

## Hızlı başlangıç

```sh
npm install
npm run dev      # http://localhost:4321
```

İçerik paneli: `npm run cms` (ayrı terminalde) + http://localhost:4321/admin

## Komutlar

| Komut | Ne yapar |
| :--- | :--- |
| `npm install` | Bağımlılıkları kurar |
| `npm run dev` | Geliştirme sunucusu |
| `npm run build` | `dist/` üretir |
| `npm run preview` | Build çıktısını yerelde sunar |
| `npm run cms` | Sveltia/Decap yerel backend |

## Deploy

Cloudflare Pages — build: `npm run build`, çıktı: `dist`, Node 22.
