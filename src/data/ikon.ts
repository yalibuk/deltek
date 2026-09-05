/**
 * Tek renkli çizgi ikonlar — hepsi 24×24 kutuda, `stroke: currentColor`.
 *
 * Önce yalnız `HizmetDuzen.astro` içindeydi; ana sayfadaki hizmet kartları
 * da aynı ikonları kullandığı için buraya alındı. Yeni bir ikon eklenirken
 * 24×24 kutuda ve yalnız `path`/`rect` gövdesi olarak yazılmalı — `svg`
 * etiketini kullanan bileşen basar.
 */
export const IKON: Record<string, string> = {
  // yer altına yönlenen delgi ucu
  sondaj: '<path d="M3 6h11l5 4-5 4H3" /><path d="M3 18h7" /><path d="M14 10h5" />',
  // itilen boru kesiti
  boru: '<rect x="2.5" y="8" width="13" height="8" rx="1.5" /><path d="M15.5 10h6M15.5 14h6" /><path d="M6 8v8" />',
  // yenileme — dairesel ok
  yenileme: '<path d="M20 12a8 8 0 1 1-2.6-5.9" /><path d="M20 4v4h-4" />',
  // akıllı altyapı — ampul
  akilli: '<path d="M9 18h6" /><path d="M10 21h4" /><path d="M12 3a6 6 0 0 1 3.5 10.9c-.5.4-.8 1-.8 1.6H9.3c0-.6-.3-1.2-.8-1.6A6 6 0 0 1 12 3Z" />',
  // kablo / fiş
  kablo: '<path d="M9 3v5M15 3v5" /><path d="M6 8h12v3a6 6 0 0 1-6 6 6 6 0 0 1-6-6V8Z" /><path d="M12 17v4" />',
  // basınçlı hat — damla
  basinc: '<path d="M12 3s6 6.3 6 10a6 6 0 0 1-12 0c0-3.7 6-10 6-10Z" /><path d="M9 13a3 3 0 0 0 3 3" />',
  // cazibeli akış — aşağı inen dalgalar
  cazibe: '<path d="M3 7c3-2 6 2 9 0s6-2 9 0" /><path d="M3 13c3-2 6 2 9 0s6-2 9 0" /><path d="M12 17v4M9.5 18.5 12 21l2.5-2.5" />',
  // nehir geçişi — köprü ve su
  nehir: '<path d="M2 9h20" /><path d="M5 9v5M12 9v7M19 9v5" /><path d="M2 19c3-2 5 2 8 0s5-2 8 0" />',
};

/** Anahtar yoksa `null` döner; çağıran taraf ikonu hiç basmaz. */
export const ikonCiz = (a?: string) => (a && IKON[a]) || null;
