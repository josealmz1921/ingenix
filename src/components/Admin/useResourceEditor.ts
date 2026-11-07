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
  const [uploadingField, setUploadingField] = useState<string | null>(null);
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
    if (!dirty && !uploadingField) return;
    function warn(event: BeforeUnloadEvent) { event.preventDefault(); event.returnValue = ''; }
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty, uploadingField]);

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
      if (document.published || JSON.parse(saved).published === true) {
        const result = await Swal.fire({
          ...confirmationTheme(),
          title: document.published ? '¿Guardar y publicar?' : '¿Guardar y ocultar?',
          text: document.published ? 'Estos cambios serán visibles en el sitio.' : 'Este contenido dejará de mostrarse en el sitio.',
          icon: 'warning',
          confirmButtonText: document.published ? 'Guardar y publicar' : 'Guardar y ocultar',
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

  async function upload(key: string, file: File) {
    if (!definition.fields.some(field => field.key === key && field.kind === 'image')) {
      throw new Error('Campo de imagen no válido.');
    }
    if (pending.current || loading || loadFailed) {
      throw new Error('Espera a que termine la operación actual.');
    }
    pending.current = true;
    setBusy(true);
    setUploadingField(key);
    setError('');
    setMessage('');
    try {
      const result = await uploadImage(file);
      change(key, result.secure_url);
    } finally {
      pending.current = false;
      setBusy(false);
      setUploadingField(null);
    }
  }

  async function removeImage(key: string) {
    if (!definition.fields.some(field => field.key === key && field.kind === 'image')) return;
    await perform(async () => {
      const result = await Swal.fire({
        ...confirmationTheme(true),
        title: '¿Quitar esta imagen?',
        text: 'Se quitará del registro al guardar. El archivo no se elimina de Cloudinary.',
        icon: 'warning',
        confirmButtonText: 'Quitar imagen',
      });
      if (!result.isConfirmed) return;
      const altKey = key === 'logo' ? 'logoAlt' : 'imageAlt';
      setDocument(current => ({ ...current, [key]: '', [altKey]: '' }));
      setMessage('');
    });
  }

  return { definition, creating, document, slug, setSlug, revision, categories, loading, busy,
    error, message, dirty, disabled: busy || loading || loadFailed, change, save, remove, upload, uploadingField, removeImage };
}
