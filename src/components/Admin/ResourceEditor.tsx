'use client';

import Link from 'next/link';
import type { ResourceName } from '@/src/content/adminResources';
import { useResourceEditor } from './useResourceEditor';
import ResourceField from './ResourceField';
import styles from './admin.module.css';
import LoadingPage from '@/src/components/LoadingPage/LoadingPage';
import Dropzone from '@/src/components/Dropzone/Dropzone';
import Switch from '@/src/components/Switch/Switch';

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
      {definition.fields.some((field) => field.kind === 'image') && (
        <p>Las imágenes se asocian al registro al guardar. Cada campo admite una sola imagen.</p>
      )}
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

          {definition.fields.map((field) => {
            if (field.kind === 'image') {
              return (
                <Dropzone
                  key={field.key}
                  label={field.label}
                  value={String(document[field.key] || '')}
                  alt={String(document[field.key === 'logo' ? 'logoAlt' : 'imageAlt'] || '')}
                  disabled={disabled}
                  uploading={editor.uploadingField === field.key}
                  onUpload={(file) => editor.upload(field.key, file)}
                  onRemove={() => { void editor.removeImage(field.key); }}
                />
              );
            }
            return (
              <ResourceField
                key={field.key}
                field={field}
                value={String(document[field.key] || '')}
                categories={editor.categories}
                onChange={(value) => editor.change(field.key, value)}
              />
            );
          })}
          <Switch
            label="Publicado"
            checked={document.published}
            disabled={disabled}
            onChange={(checked) => editor.change('published', checked)}
          />
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
