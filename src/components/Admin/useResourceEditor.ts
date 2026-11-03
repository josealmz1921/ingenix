"use client";

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { emptyResource, resourceDefinitions, type ResourceName, type ResourceDocument, type ResourceRecord } from '@/src/content/adminResources';
import { uploadImage } from '@/src/utilities/cloudinary';
import { contentRequest } from './contentRequest';
import { confirmationTheme } from './confirmationTheme';

/** Persistence and async state are kept out of the form markup. */
export function useResourceEditor(resource: ResourceName, id: string) {
  const definition = resourceDefinitions[resource];
  const creating = id === 'new';
  const router = useRouter();
  const pending = useRef(false);
  const [document, setDocument] = useState<ResourceDocument>(() => emptyResource(resource));
  const [saved, setSaved] = useState(() => JSON.stringify(emptyResource(resource)));
  const [slug, setSlug] = useState(definition.singleton ? 'profile' : '');
  const [revision, setRevision] = useState(0);
  const [categories, setCategories] = useState<ResourceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const dirty = JSON.stringify(document) !== saved;

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        if (!creating) {
          const record = await contentRequest(`${resource}/${id}`);
          if (active) {
            setDocument(record.document);
            setSaved(JSON.stringify(record.document));
            setRevision(record.revision);
          }
        }
        if (definition.fields.some(field => field.kind === 'category')) {
          const all: ResourceRecord[] = [];
          let cursor: string | null = null;
          do {
            const page = await contentRequest(`categories${cursor ? `?after=${encodeURIComponent(cursor)}` : ''}`);
            all.push(...page.records);
            cursor = page.next;
          } while (cursor && active);
          if (active) setCategories(all);
        }
      } catch (reason) {
        if (active) {
          setLoadFailed(true);
          setError(reason instanceof Error ? reason.message : 'No se pudo cargar.');
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, [creating, definition, id, resource]);

  useEffect(() => {
    if (!dirty) return;
    function warn(event: BeforeUnloadEvent) { event.preventDefault(); event.returnValue = ''; }
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  function change(key: string, value: string | boolean) {
    setDocument(current => ({ ...current, [key]: value }));
    setMessage('');
  }

  /** Ref lock also prevents two actions within the same React render. */
  async function perform(operation: () => Promise<void>) {
    if (pending.current || loading || loadFailed) return;
    pending.current = true;
    setBusy(true); setError(''); setMessage('');
    try { await operation(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'No se pudo completar la operación.'); }
    finally { pending.current = false; setBusy(false); }
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await perform(async () => {
      if (document.published) {
        const result = await Swal.fire({
          ...confirmationTheme(),
          title: '¿Guardar y publicar?', text: 'Estos cambios serán visibles en el sitio.', icon: 'warning',
          confirmButtonText: 'Guardar y publicar',
        });
        if (!result.isConfirmed) return;
      }
      const target = creating ? slug : id;
      const result = await contentRequest(`${resource}/${encodeURIComponent(target)}`, 'PUT', { document, revision });
      setRevision(result.revision);
      setSaved(JSON.stringify(document));
      setMessage(document.published ? 'Contenido publicado.' : 'Borrador guardado.');
      if (creating) router.replace(`/dashboard/${resource}/${target}`);
    });
  }

  async function remove() {
    await perform(async () => {
      const result = await Swal.fire({
        ...confirmationTheme(true),
        title: '¿Eliminar este contenido?', text: 'Dejará de estar disponible. Las imágenes no se borrarán de Cloudinary.',
        icon: 'warning', confirmButtonText: 'Eliminar',
      });
      if (!result.isConfirmed) return;
      await contentRequest(`${resource}/${id}`, 'DELETE', { revision });
      setSaved(JSON.stringify(document));
      router.replace(`/dashboard/${resource}`);
    });
  }

  async function upload(file?: File) {
    if (!file) return;
    await perform(async () => {
      const result = await uploadImage(file);
      change('image', result.secure_url);
    });
  }

  return { definition, creating, document, slug, setSlug, revision, categories, loading, busy,
    error, message, dirty, disabled: busy || loading || loadFailed, change, save, remove, upload };
}
