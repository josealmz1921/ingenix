# Administración de Ingenix

## Estructura y responsabilidades

| Ubicación | Responsabilidad |
| --- | --- |
| `app/(admin)/dashboard/` | Rutas administrativas; no contiene acceso directo a datos |
| `src/components/Admin/` | Login, estado de sesión, navegación, formularios y listas |
| `useResourceEditor.ts` / `ResourceField.tsx` | Operaciones asíncronas separadas del formulario y de sus campos |
| `src/components/PageBuilder/` | Editor visual, edición directa, arrastre, confirmaciones y vista previa |
| `src/page-builder/` | Módulo portable de bloques, contrato, validación y renderizado |
| `src/content/adminResources.ts` | Campos y metadatos compartidos de los módulos |
| `src/server/adminApi.ts` | Autorización, respuestas seguras, JSON acotado y límites |
| `src/server/resources.ts` / `resourceValidation.ts` / `contentStore.ts` | Operaciones, validación y colección compartida de los catálogos |
| `src/server/pages.ts` / `publishedHome.ts` | Borrador, publicación y lectura pública del inicio |
| `src/server/publicContent.ts` | Proyección validada exclusivamente de contenido publicado |
| `src/firebase/` | SDK cliente y cabeceras autenticadas; sin credenciales privadas |
| `src/cloudinary/`, `app/api/cloudinary/` | Firma y eliminación autenticadas de archivos |

Se reutilizan el constructor y controles de Holística. Los formularios de catálogo se adaptan a un modelo común de Ingenix, sin importar cuentas, base de datos, imágenes ni contenido del otro sitio. No se copia el perfil de terapeuta: aquí existe un perfil de empresa.

### Tema y distribución del administrador

La distribución sigue Holística: menú lateral en escritorio, cabecera y área de trabajo con scroll independiente; en móvil, navegación inferior con desplazamiento horizontal para mantener accesibles todas las secciones. Los enlaces conservan el estado activo dentro de los editores anidados. La salida de sesión permanece accesible junto a la navegación móvil.

`src/components/Admin/theme.module.css` centraliza la paleta oscura de Ingenix (azul profundo, acentos azules y texto claro), estados y fuentes Asap/DM Sans. `admin.module.css` define la distribución y formularios, y `confirmation.module.css` junto con `confirmationTheme.ts` comparte SweetAlert2 entre catálogos y constructor. Los portales incluyen su propia clase de tema, sin depender de que estén dentro del menú o formulario.

El tema administrativo **no define tokens `--pb-*` ni modifica estilos públicos**. El constructor conserva catálogo/lienzo/inspector y su renderizador independiente. Los contrastes de texto de los tokens, incluido el hover de botones primarios, se comprueban automáticamente; esto no sustituye una auditoría completa de accesibilidad. Se mantienen focos visibles, cancelación enfocada en diálogos, etiquetas para botones de solo icono y reducción de movimiento.

## Rutas y comportamiento

- `/login`: correo y contraseña, sin registro público ni asignación de roles.
- `/dashboard`: resumen y acceso a páginas, servicios, proyectos, categorías, blog y empresa.
- `/dashboard/pages/home`: edita **toda la portada**; se mantienen colores y tipografías de Ingenix. La plantilla local copia `src/content/home.ts` y nunca escribe en la base por sí sola.
- `/dashboard/{services|projects|categories|blog|company}`: listas de hasta 50 registros por página; formularios en `/{id}` o `/new`.
- `/servicios`, `/proyectos`, `/blog`: listados públicos paginados; detalles en `/{id}`. Categorías organizan registros y no crean páginas públicas propias.
- `/empresa`: perfil único publicado (`profile`). Se enlaza desde el pie cuando existe.
- `/builder-preview`: documento local de la sesión, solo para administradores; noindex y sin scripts de medición.

**Guardar borrador no publica la portada.** Publicar valida otra vez el borrador guardado y crea `pagePublished/home`. Las revisiones impiden sobrescribir cambios de otra sesión (409). Si falla la lectura pública o su validación, se conserva la portada original; `PAGE_BUILDER_HOME_DISABLED=true` fuerza ese fallback tras reiniciar/re desplegar. La navegación del encabezado y pie sigue las secciones visibles publicadas.

Los catálogos son independientes: su opción **Publicado** determina visibilidad y guardar una entrada marcada pide confirmación. Desmarcarla y guardar la retira del sitio. No tienen un segundo borrador separado de una versión pública: para preparar cambios privados hay que despublicar la entrada. Solo la portada usa instantáneas separadas. Los identificadores públicos no cambian después de crear el registro. Categorías deben existir y estar publicadas para asociarlas a un contenido publicado; eliminar una categoría no borra sus registros ni sus referencias.

**Servicios y Proyectos son la fuente única de sus datos.** En el inspector de bloques `cards` y `projects`, **Origen de las tarjetas** permite usar contenido local genérico, mostrar todos los publicados (hasta 100 por bloque, ordenados por identificador), o seleccionar registros concretos y ordenarlos con los controles subir/bajar. El catálogo de referencia es fijo por tipo: `cards` utiliza servicios y `projects`, proyectos; no acepta nombres de colecciones arbitrarias.

La configuración `catalog` guarda únicamente `mode` (`all`, `selected` o `static`) y referencias ordenadas `{ recordId }`, hasta 100 y sin duplicados. Al guardar, las listas locales `content.items` de bloques conectados quedan vacías: nunca se persisten copias de textos o imágenes del catálogo. `src/content/homeCatalogs.ts` resuelve los registros publicados en tiempo de lectura, respetando títulos, variantes, columnas, orden y visibilidad del constructor. Una selección vacía no muestra tarjetas; una referencia eliminada o despublicada se omite sin volver a los ejemplos estáticos. Los cambios a un registro publicado se reflejan al recargar el home; los cambios de selección requieren guardar y publicar la portada.

El lienzo, la vista previa privada y el home usan el mismo compositor y registros publicados. `/api/admin/pages/catalogs` exige autorización administrativa y responde `no-store`; el selector no queda limitado a los primeros 25 registros del listado público. **Actualizar catálogo** refresca sus textos e imágenes sin alterar la selección ni escribir datos. Los textos de tarjetas conectadas no se pueden editar en línea; el inspector enlaza a Servicios/Proyectos. Imágenes, empresas, logos y etiquetas son opcionales y nunca se inventan para completar un registro.

Los documentos antiguos con secciones `servicios`/`cards` y `proyectos`/`projects` se adaptan en memoria a `all` sin cambiar su apariencia ni escribir en Firestore. La próxima operación explícita de guardar/publicar conserva esa configuración por referencias. Los bloques conectados mantienen su origen aunque cambies su identificador; el modo `static` desactiva explícitamente la conexión para usar contenido local. Las tarjetas de experiencia y otros bloques locales no se migran. La plantilla original sigue disponible para importar datos. `PAGE_BUILDER_HOME_DISABLED` restaura su estructura, pero no desconecta los catálogos. Blog y empresa mantienen páginas propias, sin sustituir automáticamente los datos de marca, correo o textos legales del encabezado/pie.

### Bloques reutilizables adicionales

El catálogo del constructor ofrece **Carrusel** e **Indicadores de progreso**. El carrusel admite tarjetas con imágenes/enlaces, variantes con imagen superior o compacta y columnas responsivas. Los indicadores admiten títulos, valores actuales y máximos, en lista o presentación compacta. Ambos permiten hasta 30 elementos; una lista vacía se guarda como borrador, pero no se puede publicar. Los valores actuales de progreso no pueden superar su máximo ni ser negativos; no son métricas automáticas del negocio.

Los textos se editan en el lienzo y los elementos, imágenes y números en el inspector. El carrusel se desplaza con controles, teclado o gesto táctil, sin reproducción automática ni dependencia de Slick. El componente antiguo `Progress` redirige a la implementación portable. No se elimina el carrusel antiguo ni se modifica el Header global. Estos bloques solo afectan al sitio al insertarlos, guardar el borrador y publicar explícitamente.

### Importar el contenido original al catálogo

La migración usa exclusivamente las tarjetas de `servicios` y `proyectos` de `src/content/home.ts`. Conserva títulos, descripciones, imágenes, enlaces, empresas, logos y etiquetas. Crea los 6 servicios como publicados, Kaband y BienTasty como publicados y los otros 2 proyectos demo como borradores. No importa las tarjetas de experiencia, no inventa contenido de blog o empresa, y no cambia usuarios, permisos ni documentos del constructor.

Primero revisa la simulación (lee Firestore, pero no escribe):

```bash
npm run import:site-content
```

Para aplicar, confirma explícitamente el ID del proyecto que muestra la simulación:

```bash
npm run import:site-content -- --apply --project TU_PROJECT_ID
```

La escritura es una transacción create-only: un registro existente se conserva íntegro, incluso si está despublicado o tiene datos distintos; repetir la migración no lo sobrescribe. Se validan documentos, IDs, orígenes de imágenes y descripciones alternativas antes de escribir. No se hacen peticiones a Cloudinary ni se duplican archivos. La simulación y la aplicación requieren una cuenta de servicio con permisos Firestore en el proyecto correcto. Si devuelve `PERMISSION_DENIED`, comprueba la base de datos/API de Firestore y el rol IAM de esa cuenta (por ejemplo, Cloud Datastore User para las operaciones de datos); el custom claim `admin: true` del usuario del navegador no otorga permisos IAM al servidor. No abras las reglas de acceso de clientes para solucionarlo.

Los catálogos y artículos usan texto plano, escapado por React; no interpretan HTML ni incluyen Editor.js en esta adaptación. Imágenes JPG/PNG y URL alternativas están soportadas. No se trasladan las funciones de calendario, terapeuta ni galerías de Flor de luna. Las APIs de archivos admiten firma de video, pero los formularios actuales solo suben imágenes.

## Configurar proveedores (pasos manuales)

1. Usa preferiblemente un **proyecto Firebase independiente de Flor de luna**. Activa Authentication por correo/contraseña, crea únicamente tus cuentas autorizadas y configura los dominios válidos. No hay registro público en la aplicación; comprueba también las políticas del proveedor.
2. Completa `.env.local` a partir de `.env.example`. La configuración web es pública. `FIREBASE_ADMIN_CLIENT_EMAIL` y `FIREBASE_ADMIN_PRIVATE_KEY` son privadas, sin `NEXT_PUBLIC_`. Alternativamente, usa Application Default Credentials en un entorno preparado. Navegador y servidor deben pertenecer al mismo proyecto. La cuenta de servicio necesita los permisos mínimos de verificación de Auth y de lectura/escritura Firestore correspondientes.
3. Asigna el claim **booleano** `admin: true` individualmente. El script conserva otros claims y revoca sesiones anteriores. Ejemplo con un UID ficticio: `node --env-file-if-exists=.env.local scripts/set-admin.mjs --uid UID_DE_EJEMPLO --grant`. Para retirarlo, usa `--revoke`. Vuelve a iniciar sesión. **No ejecutes este script como prueba.**
4. Revisa y despliega `firestore.rules` explícitamente al proyecto correcto. Esta instalación niega **todo acceso directo desde SDK cliente**, incluso como admin: todos los datos se leen/escriben mediante servidor. No uses estas reglas en una base compartida sin revisar sus otros consumidores.
5. Configura Cloudinary con un preset **firmado** de imágenes, sin sobrescritura y con formatos/dimensiones/tamaños restringidos en el proveedor. Elige una carpeta exclusiva en `CLOUDINARY_ASSET_FOLDER` y las variables privadas de firma. Los archivos usan IDs aleatorios; no hay permisos para borrar imágenes fuera de esta carpeta ni excepciones para imágenes antiguas de otro sitio. Si necesitas video, configura su propio preset firmado.
6. Repite las verificaciones de permisos con cuentas de prueba y revisa la composición publicada en un entorno no productivo antes de desplegar.

Crear archivos locales **no activa** reglas, claims, presets, dominios ni permisos remotos. No se han migrado documentos ni publicado contenido como parte de esta integración.

## Seguridad

- El bloqueo de interfaz no es la barrera efectiva. **Todas** las APIs administrativas verifican `verifyIdToken(token, true)`, incluida revocación, y exigen `admin === true` antes de tocar la base.
- El SDK Admin evita las reglas de Firestore: no añadir endpoints sin esa autorización. Las lecturas públicas usan rutas/colecciones fijas, filtran `published`, validan y solo devuelven los campos públicos del contrato; nunca consultan borradores de páginas.
- Colecciones: `pageDrafts/home`, `pagePublished/home`, `cms_services`, `cms_projects`, `cms_categories`, `cms_blog`, `cms_company/profile`. No se reutilizan colecciones de Flor de luna.
- Las revisiones son optimistas. Publicar una portada no acepta documentos arbitrarios del navegador. El JSON de portada se limita a 256 KiB; recursos a cuerpos de 128 KiB y campos con límites explícitos. Los cambios tienen límite local de 20 solicitudes/minuto por UID/acción, **no distribuido** entre procesos.
- Respuestas administrativas `no-store`, sin trazas, tokens ni secretos. Cabeceras `nosniff`, rechazo de iframes y CSP parcial (`frame-ancestors`, `base-uri`, `object-src`); **no es una CSP completa de scripts**.
- `noindex`/robots no son autorización. No exponer `next dev` como servidor público.
- Quitar contenido o una referencia no borra archivos de Cloudinary. No hay biblioteca de medios ni limpieza automática; revisa referencias antes de usar la API de eliminación.
- La protección de salida usa el diálogo nativo del navegador al cerrar/recargar; las confirmaciones editoriales usan SweetAlert2. La navegación interna no ofrece historial ni recuperación automática de cambios sin guardar.

## Verificación

```sh
npx tsc --noEmit
npm run lint
npm run test:page-builder
npm run test:security
npm run test:admin-ui
npm run test:home-catalogs
npm run test:catalog-import
npm run build
npm audit --omit=dev
npm audit
```

Reglas, exclusivamente en un proyecto demo y emulador (requiere Java y Firebase CLI):

```sh
firebase emulators:exec --only firestore --project demo-ingenix-security "npm run test:rules"
```

El archivo de prueba exige `FIRESTORE_EMULATOR_HOST` y usa siempre `demo-ingenix-security`. Las suites de APIs y lectores sustituyen los proveedores por dobles en memoria. No hacer pruebas contra Firebase/Cloudinary de producción.

Estado local al integrar (3 de noviembre de 2026): build y lint pasan (13 advertencias preexistentes en stories), 18 pruebas de constructor/publicación y 19 de seguridad/catálogos, más 3 de reglas en emulador. En servidor de producción local sin credenciales, se verificaron la portada original, el bloqueo del editor y respuestas administrativas 401/no-store. En un montaje aislado con sesión y persistencia simuladas se comprobaron la precarga/cancelación sin escrituras, edición directa y guardado de un borrador, creación de servicio con texto literal y cancelación de publicación con el formulario bloqueado. No se contactaron proveedores reales.

Auditoría sin vulnerabilidades altas/críticas; permanecen 6 moderadas de producción en la cadena transitiva de Google/`rimraf`/`glob`/`minimatch`, y 21 moderadas en la auditoría completa contando herramientas. Se aplicaron actualizaciones compatibles y el override corregido de gRPC; no se forzaron cambios mayores ni se rebajó ESLint. Estas cifras no garantizan auditorías futuras. Pendientes: proveedores reales, cuentas autorizadas y verificación autenticada de extremo a extremo, publicación y despliegue.

Revisión visual del tema: build, TypeScript, lint y 40 pruebas sin emulador (18 de constructor, 19 de seguridad y 3 de tema/navegación). Montaje aislado con sesión y datos simulados en escritorio (1440 px) y ventana móvil de 390 px: navegación activa, acceso por foco al último enlace de la barra móvil, ausencia de desbordamiento horizontal, ajustes SEO y SweetAlert2 oscuros dentro de la pantalla, y cancelación sin escrituras. No se cambiaron permisos, reglas, documentos remotos ni presentación del sitio público durante esta revisión.
