This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# Component Generator — React / Next.js

Guía rápida para crear componentes reutilizables en el proyecto.

## 1. Requisitos

Ejecuta los comandos desde la **raíz del proyecto**, es decir, la carpeta que contiene `package.json`.

Verifica:

```bash
pwd
```

y confirma que existe:

```text
package.json
```

---

## 2. Generar un componente

El proyecto utiliza `generate-react-cli` para acelerar la creación de componentes.

Comando:

```bash
npx generate-react-cli component NombreDelComponente
```

Ejemplo:

```bash
npx generate-react-cli component Button
```

> Importante: no uses `npx generate-react component Button`. El comando correcto incluye `generate-react-cli`.

---

## 3. Archivos generados

Dependiendo del template configurado, el generator puede crear una estructura similar a:

```text
Button/
├── Button.tsx
├── Button.module.css
├── Button.test.tsx
├── Button.stories.tsx
├── Button.types.ts
└── index.ts
```

El archivo `index.ts` sirve como punto de entrada del componente.

Ejemplo:

```ts
export { Button } from './Button';
export type { ButtonProps } from './Button.types';
```

Esto permite importar el componente de forma limpia:

```tsx
import { Button } from '@/components/ui/Button';
```

en lugar de:

```tsx
import { Button } from '@/components/ui/Button/Button';
```

---

## 4. Convención de carpetas

Los componentes reutilizables deben organizarse por responsabilidad.

### UI

Componentes visuales y reutilizables:

```text
components/
└── ui/
    ├── Button/
    ├── Card/
    ├── Progress/
    └── Badge/
```

### Layout

Componentes relacionados con estructura y distribución:

```text
components/
└── layout/
    ├── Section/
    ├── Container/
    └── Grid/
```

### Secciones

Componentes que representan una composición específica de una página:

```text
components/
└── sections/
    ├── Hero/
    ├── Services/
    └── Contact/
```

Las secciones pueden utilizar componentes de `ui` y `layout`, pero los componentes de `ui` deben mantenerse independientes del contenido específico de una página.

---

## 5. Regla principal: reutilización

Evita crear componentes demasiado específicos cuando la estructura puede ser genérica.

### Evitar

```text
EngineeringCapabilitiesCard/
ServicesForSmallBusinessesCard/
```

Si visualmente cumplen la misma función, utiliza un componente genérico:

```text
Card/
```

y cambia su contenido mediante props.

Ejemplo:

```tsx
<Card>
  <h3>Code Quality</h3>
  <p>Readable and maintainable code.</p>
</Card>
```

El mismo componente puede utilizarse para:

```tsx
<Card>
  <h3>Web Development</h3>
  <p>Modern websites for your business.</p>
</Card>
```

---

## 6. Variantes

Cuando un componente tiene diferentes estilos visuales, utiliza variantes en lugar de crear componentes separados.

Ejemplo:

```tsx
<Card variant="default" />
<Card variant="outlined" />
<Card variant="glass" />
<Card variant="interactive" />
```

Esto mantiene una API consistente y evita duplicación.

---

## 7. Componentes compuestos

Para componentes más complejos se puede utilizar composición.

Ejemplo:

```tsx
<Card>
  <Card.Header>
    ...
  </Card.Header>

  <Card.Body>
    ...
  </Card.Body>

  <Card.Footer>
    ...
  </Card.Footer>
</Card>
```

Esto permite reutilizar la estructura sin acoplarla a un tipo concreto de contenido.

---

## 8. Datos separados de la UI

Cuando una sección contiene varias cards, elementos de navegación o contenido repetitivo, mantener los datos en archivos separados.

Ejemplo:

```text
src/
├── components/
├── data/
│   ├── solutions.ts
│   ├── industries.ts
│   └── capabilities.ts
└── app/
```

Ejemplo:

```ts
export const solutions = [
  {
    title: 'Aplicaciones móviles',
    description: 'Apps para Android y iOS.',
  },
  {
    title: 'Páginas web',
    description: 'Sitios rápidos y modernos.',
  },
];
```

Y en el componente:

```tsx
{solutions.map((solution) => (
  <Card key={solution.title}>
    <h3>{solution.title}</h3>
    <p>{solution.description}</p>
  </Card>
))}
```

No repetir manualmente el mismo bloque de JSX.

---

## 9. Crear componentes de layout

Para estructuras repetitivas utiliza componentes genéricos.

Ejemplo:

```tsx
<Section>
  <SectionHeader
    title="Our Services"
    description="Solutions for your business."
  />

  <Grid columns={3}>
    ...
  </Grid>
</Section>
```

En lugar de repetir:

```tsx
<section>
  <div className="container">
    ...
  </div>
</section>
```

en cada página.

---

## 10. CSS Modules

Los componentes deben utilizar CSS Modules cuando necesiten estilos propios.

Ejemplo:

```tsx
import styles from './Button.module.css';

export function Button() {
  return (
    <button className={styles.button}>
      Button
    </button>
  );
}
```

Archivo:

```text
Button.module.css
```

Evitar estilos globales salvo que sean realmente globales.

---

## 11. TypeScript

Las props deben estar tipadas.

Preferiblemente:

```text
Button/
├── Button.tsx
├── Button.types.ts
└── index.ts
```

Ejemplo:

```ts
export interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}
```

Y:

```tsx
import type { ButtonProps } from './Button.types';

export function Button({
  children,
  variant = 'primary',
  disabled = false,
}: ButtonProps) {
  // ...
}
```

---

## 12. Checklist antes de crear un componente

Antes de crear un componente nuevo, revisar:

- [ ] ¿Ya existe un componente que haga algo parecido?
- [ ] ¿Puede resolverse mediante una variante?
- [ ] ¿El componente está demasiado ligado a una página específica?
- [ ] ¿Sus datos deberían estar en `data/`?
- [ ] ¿Las props están correctamente tipadas?
- [ ] ¿Utiliza CSS Module si necesita estilos propios?
- [ ] ¿Tiene `index.ts`?
- [ ] ¿Puede reutilizarse en otro proyecto?

---

## 13. Ejemplos rápidos

### Crear Button

```bash
npx generate-react-cli component Button
```

### Crear Card

```bash
npx generate-react-cli component Card
```

### Crear Grid

```bash
npx generate-react-cli component Grid
```

### Crear Section

```bash
npx generate-react-cli component Section
```

### Crear un componente de sección

```bash
npx generate-react-cli component Services
```

Después revisar si realmente debe vivir en `sections/` o si puede convertirse en una composición de componentes genéricos.

---

## 14. Filosofía del proyecto

La arquitectura debe seguir esta idea:

```text
Componentes pequeños
        ↓
Componentes reutilizables
        ↓
Composición
        ↓
Secciones
        ↓
Páginas
```

No construir cada página como un conjunto de componentes únicos.

La meta es poder reutilizar la misma base para diferentes proyectos cambiando principalmente:

- contenido
- imágenes
- variantes
- configuración
- datos

sin tener que reconstruir la UI desde cero.

---

## 15. Estructura recomendada

```text
src/
├── app/
│
├── components/
│   ├── ui/
│   │   ├── Button/
│   │   ├── Card/
│   │   ├── Progress/
│   │   └── ...
│   │
│   ├── layout/
│   │   ├── Section/
│   │   ├── Container/
│   │   ├── Grid/
│   │   └── ...
│   │
│   └── sections/
│       ├── Hero/
│       ├── Services/
│       └── ...
│
├── data/
│   ├── solutions.ts
│   ├── industries.ts
│   └── capabilities.ts
│
└── ...
```

## Comando principal

Siempre que necesites crear un componente:

```bash
npx generate-react-cli component NombreDelComponente
```

Ejemplo:

```bash
npx generate-react-cli component Testimonial
```

Después mueve el componente a la categoría correspondiente (`ui`, `layout` o `sections`) si el generator no lo crea directamente ahí.
