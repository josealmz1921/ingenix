'use client';

/* eslint-disable @next/next/no-img-element -- Local selections use blob previews. */
import { useEffect, useId, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, rectSortingStrategy, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { PhotoIcon, TrashIcon } from '@heroicons/react/24/outline';
import Swal from 'sweetalert2';
import { confirmationTheme } from '@/src/components/Admin/confirmationTheme';
import SortableItem from './SortableItem';
import type { DropzoneProps, PreviewFile } from './types';
import styles from './dropzone.module.css';

/** Selection and ordering only: persistence belongs to the enclosing form. */
export default function Dropzone({
  label,
  values,
  onChange,
  onDelete,
  maxFiles = 0,
  alt,
  disabled = false,
  uploading = false,
}: DropzoneProps) {
  const id = useId();
  const blobUrls = useRef(new Set<string>());
  const [error, setError] = useState('');
  const [confirming, setConfirming] = useState(false);
  const locked = disabled || uploading || confirming;
  const atLimit = maxFiles > 0 && values.length >= maxFiles;
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  useEffect(() => {
    for (const url of blobUrls.current) {
      if (!values.some((asset) => asset.preview === url)) {
        URL.revokeObjectURL(url);
        blobUrls.current.delete(url);
      }
    }
  }, [values]);

  useEffect(() => {
    const urls = blobUrls.current;
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
      urls.clear();
    };
  }, []);

  function update(files: PreviewFile[]) {
    onChange(files.map((file, position) => ({ ...file, position })));
    setError('');
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'] },
    multiple: maxFiles !== 1,
    maxFiles,
    minSize: 1,
    maxSize: 5 * 1024 * 1024,
    disabled: locked,
    onDropRejected: () => {
      setError('Selecciona imágenes JPG o PNG de máximo 5 MiB, sin superar el límite de archivos.');
    },
    onDrop: (files, rejections) => {
      if (locked || rejections.length || !files.length) return;
      const retained = maxFiles === 1 ? [] : values;
      if (maxFiles > 0 && retained.length + files.length > maxFiles) {
        setError(`Este campo admite un máximo de ${maxFiles} archivos.`);
        return;
      }
      const selected = files.map((file) => {
        const preview = URL.createObjectURL(file);
        blobUrls.current.add(preview);
        return { file, preview, name: file.name };
      });
      update([...retained, ...selected]);
    },
  });

  function reorder({ active, over }: DragEndEvent) {
    if (locked || !over || active.id === over.id) return;
    const from = values.findIndex((file) => file.preview === active.id);
    const to = values.findIndex((file) => file.preview === over.id);
    if (from >= 0 && to >= 0) update(arrayMove(values, from, to));
  }

  async function remove(asset: PreviewFile) {
    if (locked) return;
    setConfirming(true);
    try {
      const result = await Swal.fire({
        ...confirmationTheme(true),
        title: '¿Quitar esta imagen?',
        text: 'El cambio se aplicará al guardar. El archivo no se elimina de Cloudinary.',
        icon: 'warning',
        confirmButtonText: 'Quitar imagen',
      });
      if (result.isConfirmed) {
        await onDelete?.(asset);
        update(values.filter((file) => file.preview !== asset.preview));
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No se pudo quitar la imagen.');
    } finally {
      setConfirming(false);
    }
  }

  return (
    <div className={`${styles.root} ${maxFiles === 1 ? styles.single : ''}`} aria-busy={uploading}>
      <span id={`${id}-label`} className={styles.label}>{label}</span>
      <div className={styles.imageList}>
        <DndContext
          sensors={locked || maxFiles === 1 ? [] : sensors}
          collisionDetection={closestCenter}
          onDragEnd={reorder}
        >
          <SortableContext items={values.map((file) => file.preview)} strategy={rectSortingStrategy}>
            {values.map((asset, index) => (
              <SortableItem
                key={asset.preview}
                id={asset.preview}
                disabled={locked || maxFiles === 1}
                label={`Mover ${asset.name || label}, posición ${index + 1}`}
              >
                <div className={styles.imageContainer}>
                  <div
                    {...(maxFiles === 1 ? getRootProps({
                      role: 'button',
                      'aria-label': `Reemplazar ${label.toLowerCase()}`,
                      'aria-describedby': `${id}-help`,
                      'aria-disabled': locked,
                    }) : {})}
                    className={`${styles.previewTarget} ${isDragActive && maxFiles === 1 ? styles.active : ''}`}
                  >
                    {maxFiles === 1 && (
                      <input {...getInputProps({ 'aria-label': `Seleccionar ${label.toLowerCase()}` })} />
                    )}
                    <img
                      src={asset.preview}
                      alt={alt || asset.name || `Vista previa de ${label.toLowerCase()}`}
                    />
                    {maxFiles === 1 && (
                      <span className={styles.replaceHint}>
                        {isDragActive ? 'Suelta para reemplazar' : 'Haz clic o arrastra para reemplazar'}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    className={styles.deleteButton}
                    aria-label={`Quitar ${asset.name || label}`}
                    disabled={locked}
                    onClick={() => { void remove(asset); }}
                  >
                    <TrashIcon />
                  </button>
                </div>
                <p className={styles.fileData}>
                  {maxFiles !== 1 && `${index + 1}. `}
                  {asset.name || 'Imagen guardada'}
                  {asset.file && ` · ${(asset.file.size / 1024).toFixed(1)} KB`}
                </p>
              </SortableItem>
            ))}
          </SortableContext>
        </DndContext>
        {!atLimit && (
          <div
            {...getRootProps({
              role: 'button',
              'aria-labelledby': `${id}-label ${id}-prompt`,
              'aria-describedby': `${id}-help`,
              'aria-disabled': locked,
            })}
            className={`${styles.target} ${isDragActive ? styles.active : ''}`}
          >
            <input {...getInputProps({ 'aria-label': `Seleccionar ${label.toLowerCase()}` })} />
            <PhotoIcon />
            <span id={`${id}-prompt`}>
              {isDragActive ? 'Suelta la imagen aquí' : 'Selecciona o arrastra imágenes aquí'}
            </span>
          </div>
        )}
      </div>
      <span id={`${id}-help`} className={styles.help}>JPG o PNG · Máximo 5 MiB por imagen</span>
      {uploading && (
        <p role="status">Subiendo {label.toLowerCase()}…</p>
      )}
      {!uploading && values.some((asset) => asset.file) && (
        <p role="status">Selección pendiente. Se subirá al guardar.</p>
      )}
      {error && (
        <p role="alert">{error}</p>
      )}
    </div>
  );
}
