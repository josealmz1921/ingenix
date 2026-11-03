# Compatibilidad

El módulo reutilizable vive ahora en [`src/page-builder`](../../page-builder/README.md).

Los archivos de esta carpeta mantienen las importaciones antiguas mediante reexportaciones. Para nuevas páginas usar `PageRenderer`; para el administrador usar `src/page-builder/editor`.

El contenido de Ingenix permanece en `src/content/home.ts`. No debe copiarse junto al módulo a Flor de luna.
