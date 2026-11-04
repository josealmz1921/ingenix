'use client';

import Link from 'next/link';
import type { ResourceName } from '@/src/content/adminResources';
import { useResourceEditor } from './useResourceEditor';
import ResourceField from './ResourceField';
import styles from './admin.module.css';
import LoadingPage from '@/src/components/LoadingPage/LoadingPage';

export default function ResourceEditor({ resource, id }: { resource: ResourceName; id: string }) {
  const editor = useResourceEditor(resource, id);
  const { definition, creating, document, revision, dirty, loading, error, message, disabled } =
    editor;

  return (
    <main className={styles.content}>
      <Link href={`/dashboard/${resource}`}>← Volver a {definition.label}</Link>
      <h1>
        {creating ? 'Crear' : 'Editar'} {definition.singular.toLowerCase()}
      </h1>
      <p>
        {dirty ? 'Cambios sin guardar' : `Revisión ${revision}`} · El contenido se guarda como texto
        plano, sin interpretar HTML.
      </p>
      {loading && <LoadingPage message="Cargando contenido…" />}
      {error && <p role="alert">{error}</p>}
      {message && <p role="status">{message}</p>}

      <form onSubmit={editor.save} className={styles.form}>
        <fieldset disabled={disabled} className={styles.form}>
          {creating && !definition.singleton && (
            <label>
              Identificador / URL (no se podrá cambiar)
              <input
                value={editor.slug}
                onChange={(event) => editor.setSlug(event.target.value)}
                required
                maxLength={100}
                pattern="[a-z0-9]+(-[a-z0-9]+)*"
                placeholder="mi-proyecto"
              />
            </label>
          )}

          {definition.fields.map((field) => (
            <ResourceField
              key={field.key}
              field={field}
              value={String(document[field.key] || '')}
              categories={editor.categories}
              onChange={(value) => editor.change(field.key, value)}
            />
          ))}

          {definition.fields.some((field) => field.kind === 'image') && (
            <label>
              Subir imagen (JPG/PNG, máximo 5 MiB)
              <input
                type="file"
                accept="image/jpeg,image/png"
                onChange={(event) => {
                  void editor.upload(event.target.files?.[0]);
                  event.target.value = '';
                }}
              />
            </label>
          )}
          <label>
            Publicado
            <input
              type="checkbox"
              checked={document.published}
              onChange={(event) => editor.change('published', event.target.checked)}
            />
          </label>
          <p>
            Desmarcar Publicado y guardar retira el contenido del sitio. Los servicios y proyectos
            publicados pueden mostrarse en la portada según la selección configurada en Páginas.
            Allí se define su orden, diseño y visibilidad, sin copiar los registros al borrador.
          </p>
          <div className={styles.actions}>
            <button type="submit">
              {editor.busy
                ? 'Procesando…'
                : document.published
                  ? 'Guardar y publicar'
                  : 'Guardar borrador'}
            </button>
            {!creating && (
              <button className={styles.danger} type="button" onClick={editor.remove}>
                Eliminar
              </button>
            )}
          </div>
        </fieldset>
      </form>
    </main>
  );
}
