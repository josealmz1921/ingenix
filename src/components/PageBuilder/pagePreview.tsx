'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { onIdTokenChanged } from 'firebase/auth';
import { PageRenderer } from '@/src/page-builder';
import { validatePageDocument, type PageDocument } from '@/src/page-builder/editor';
import { PREVIEW_KEY, pageHomeErrors } from '@/src/utilities/pageBuilder';
import Header from '@/src/components/Header/Header';
import Footer from '@/src/components/Footer/Footer';
import { builderTheme } from './theme';

export default function BuilderPreview() {
  const [document, setDocument] = useState<PageDocument | null>(null);
  const [message, setMessage] = useState('Comprobando acceso…');
  useEffect(() => {
    let generation = 0;
    let disposed = false;
    let unsubscribe = () => {};
    async function connect() {
      try {
        const { getClientAuth } = await import('@/src/firebase/firebase');
        if (disposed) return;
        unsubscribe = onIdTokenChanged(getClientAuth(), async (user) => {
          const current = ++generation;
          setDocument(null);
          try {
            if (!user || (await user.getIdTokenResult()).claims.admin !== true)
              throw new Error('Esta vista previa requiere una cuenta administradora.');
            const raw = sessionStorage.getItem(PREVIEW_KEY);
            if (!raw) throw new Error('Abre la vista previa desde el constructor.');
            const result = validatePageDocument(JSON.parse(raw), { mode: 'draft' });
            if (!result.success || pageHomeErrors(result.data).length)
              throw new Error('El borrador no es válido para la vista previa.');
            if (current === generation) setDocument(result.data);
          } catch (error) {
            if (current === generation)
              setMessage(
                error instanceof Error ? error.message : 'No se pudo abrir la vista previa.',
              );
          }
        });
      } catch {
        if (!disposed) setMessage('Configura Firebase para habilitar la vista previa.');
      }
    }
    void connect();
    return () => {
      disposed = true;
      generation++;
      unsubscribe();
    };
  }, []);
  if (!document) {
    return (
      <main style={{ padding: '2rem' }}>
        <p role="status">{message}</p>
        <Link href="/dashboard/pages">Volver a Páginas</Link>
      </main>
    );
  }

  const navigation = document.sections
    .filter((section) => section.visible && section.navigationLabel)
    .map((section) => ({ label: section.navigationLabel!, href: `#${section.id}` }));
  return (
    <>
      <div style={{ padding: '.6rem', textAlign: 'center' }}>
        Vista previa privada · cambios locales, no publicados
      </div>
      <Header navigation={navigation} />
      <main id="contenido">
        <PageRenderer document={document} mode="draft" theme={builderTheme} />
      </main>
      <Footer navigation={navigation} />
    </>
  );
}
