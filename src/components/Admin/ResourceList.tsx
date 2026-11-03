'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  resourceDefinitions,
  type ResourceName,
  type ResourceRecord,
} from '@/src/content/adminResources';
import { contentRequest } from './contentRequest';
import styles from './admin.module.css';

export default function ResourceList({ resource }: { resource: ResourceName }) {
  const definition = resourceDefinitions[resource];
  const [records, setRecords] = useState<ResourceRecord[]>([]);
  const [next, setNext] = useState<string | null>(null);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    contentRequest(resource)
      .then((data) => {
        if (active) {
          setRecords(data.records);
          setNext(data.next);
        }
      })
      .catch((reason) => {
        if (active) setError(reason.message);
      })
      .finally(() => {
        if (active) setBusy(false);
      });
    return () => {
      active = false;
    };
  }, [resource]);
  async function loadMore() {
    setBusy(true);
    setError('');
    try {
      const data = await contentRequest(`${resource}?after=${encodeURIComponent(next!)}`);
      setRecords((current) => [...current, ...data.records]);
      setNext(data.next);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No se pudo cargar.');
    } finally {
      setBusy(false);
    }
  }
  const createPath = `/dashboard/${resource}/new`;
  return (
    <main className={styles.content}>
      <h1>{definition.label}</h1>
      <p>
        Solo el contenido marcado como publicado aparece en el sitio. Las imágenes no se eliminan al
        quitar un registro.
      </p>
      {!definition.singleton || !records.length ? (
        <Link className={styles.button} href={createPath}>
          Crear {definition.singular.toLowerCase()}
        </Link>
      ) : null}
      {error && <p role="alert">{error}</p>}
      <ul className={styles.list}>
        {records.map((record) => (
          <li className={styles.row} key={record.id}>
            <div>
              <strong>{String(record.document.title)}</strong>
              <p>
                {record.document.published ? 'Publicado' : 'Borrador'} · revisión {record.revision}
              </p>
            </div>
            <Link href={`/dashboard/${resource}/${record.id}`}>Editar →</Link>
          </li>
        ))}
      </ul>
      {busy && <p role="status">Cargando…</p>}
      {!busy && !error && !records.length && <p>No hay contenido todavía.</p>}
      {next && (
        <button disabled={busy} onClick={loadMore}>
          Cargar más
        </button>
      )}
    </main>
  );
}
