<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Convenciones de legibilidad

- Los retornos JSX de los componentes se escriben siempre con `return (` y cierre `);` en líneas separadas, incluso si solo devuelven un componente autocerrado.
- Distribuye el JSX, sus atributos largos, los condicionales y los `.map()` en varias líneas con indentación de dos espacios. Usa llaves en los condicionales que devuelven JSX.
- No agregues fragmentos si ya existe un único elemento raíz. Conserva estos paréntesis aunque un formateador proponga quitarlos en retornos cortos.
