# Bloques de página

La portada se define en `src/content/home.ts`. `page.tsx` no contiene contenido comercial: renderiza la lista de secciones en su orden, incluido el cierre de contacto.

## Edición

- `id`: identificador único, estable y válido como ancla.
- `type`: bloque registrado en `block-registry.ts`.
- `variant`: variante permitida para ese bloque.
- `visible`: permite ocultar una sección sin borrarla.
- `navigationLabel`: añade la sección al menú y al pie de página.
- `tone`: presentación normal o panel.
- `columns`: columnas de tarjetas; la cuadrícula se adapta a tablet y móvil.
- `content`: textos, imágenes y elementos del bloque, sin JSX.

Debe existir un único bloque `hero` visible, al inicio: aporta el H1. Las demás secciones utilizan H2 y las tarjetas H3. No duplicar IDs ni usar `contenido`, reservado para la página. Conservar `contacto` mientras el encabezado tenga enlaces a esa ancla.

## Proyectos

Agregar elementos a `content.items` del bloque `projects` con esta forma:

```json
{
  "id": "identificador-del-proyecto",
  "company": "Nombre real de la empresa",
  "title": "Nombre del proyecto",
  "category": "Plataforma web",
  "description": "Necesidad del cliente y trabajo realizado.",
  "image": { "src": "/img/proyectos/captura.jpg", "alt": "Captura del proyecto" },
  "logo": { "src": "/img/proyectos/logo.png", "alt": "Logo de la empresa" },
  "link": { "text": "Visitar sitio", "href": "https://dominio-real-del-proyecto", "target": "_blank" }
}
```

El ejemplo solo explica el formato: no se publica. Logo y enlace son opcionales; publicar únicamente material autorizado. Las imágenes locales se guardan en `public`. Para imágenes remotas, configurar los dominios autorizados de Next Image.

## Futuro administrador

El catálogo y la unión discriminada `PageSection` son el contrato inicial del editor. El panel podrá generar los controles por tipo, guardar datos serializables y reutilizar `SectionRenderer` para la vista previa. Aún no incluye autenticación, base de datos, subida de archivos ni validación de contenido recibido por API. Antes de conectar una API, validar en servidor el esquema, IDs, un único H1, URLs seguras y variantes permitidas.

## Publicación y SEO

Configurar `NEXT_PUBLIC_SITE_URL` con el dominio real y `NEXT_PUBLIC_CONTACT_EMAIL` con el correo comercial (ver `.env.example`). El dominio habilita canonical y sitemap; el correo habilita el enlace de contacto. Reiniciar o reconstruir al cambiar estas variables. No se utiliza un dominio ni un correo ficticios como sustitutos.
