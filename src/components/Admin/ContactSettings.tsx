'use client';

import { resourceDefinitions } from '@/src/content/adminResources';
import { socialNetworks } from '@/src/content/contact';
import { useResourceEditor } from './useResourceEditor';
import ResourceField from './ResourceField';
import ContactIcon from '@/src/components/Contact/ContactIcon';
import LoadingPage from '@/src/components/LoadingPage/LoadingPage';
import Switch from '@/src/components/Switch/Switch';
import styles from './admin.module.css';

export default function ContactSettings() {
  const editor = useResourceEditor('contact', 'profile');
  const contactFields = resourceDefinitions.contact.fields.filter((field) =>
    !socialNetworks.some((network) => field.key.startsWith(network.key)),
  );

  function fieldControl(key: string, hideLabel = false) {
    const field = resourceDefinitions.contact.fields.find((item) => item.key === key)!;
    if (field.kind === 'checkbox') {
      return (
        <Switch
          key={key}
          label={field.label}
          checked={editor.document[key] === true}
          disabled={editor.disabled}
          hideLabel={hideLabel}
          onChange={(checked) => editor.change(key, checked)}
        />
      );
    }
    return (
      <ResourceField
        key={key}
        field={field}
        value={String(editor.document[key] || '')}
        categories={[]}
        onChange={(value) => editor.change(key, value)}
      />
    );
  }

  return (
    <main className={styles.content}>
      <h1>Contacto y redes sociales</h1>
      <p>
        Configuración global del sitio. Los campos vacíos y las redes desactivadas no se muestran.
        Si no hay datos públicos, se oculta también la sección de contacto. No hay datos de ejemplo.
      </p>
      <p>{editor.dirty ? 'Cambios sin guardar' : `Revisión ${editor.revision}`}</p>
      {editor.loading && <LoadingPage message="Cargando configuración…" />}
      {editor.error && <p role="alert">{editor.error}</p>}
      {editor.message && <p role="status">{editor.message}</p>}
      <form onSubmit={editor.save} className={styles.form}>
        <fieldset disabled={editor.disabled} className={styles.form}>
          <legend>Datos de contacto</legend>
          {contactFields.map((field) => fieldControl(field.key))}
        </fieldset>
        <fieldset disabled={editor.disabled} className={styles.form}>
          <legend>Redes sociales</legend>
          {socialNetworks.map((network) => (
            <div key={network.key} className={styles.socialSetting}>
              <div className={styles.socialHeader}>
                <h2>
                  <ContactIcon channel={network.key} />
                  {network.label}
                </h2>
                {fieldControl(`${network.key}Visible`, true)}
              </div>
              {fieldControl(`${network.key}Url`)}
            </div>
          ))}
        </fieldset>
        <fieldset disabled={editor.disabled} className={styles.form}>
          <legend>Visibilidad y guardado</legend>
          <Switch
            label="Publicar configuración de contacto"
            description={editor.document.published ? 'Los canales completados serán visibles.' : 'Los canales permanecerán ocultos.'}
            checked={editor.document.published}
            disabled={editor.disabled}
            onChange={(checked) => editor.change('published', checked)}
          />
          <p>
            Publicar hace visibles únicamente los datos que hayas completado. Desmarcar y guardar
            oculta todos los canales. Los cambios publicados se reflejan al recargar el sitio,
            sin volver a publicar el PageBuilder.
          </p>
          <button type="submit">
            {editor.busy ? 'Procesando…' : editor.document.published ? 'Guardar y publicar' : 'Guardar configuración'}
          </button>
        </fieldset>
      </form>
    </main>
  );
}
