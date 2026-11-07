'use client';

/* eslint-disable @next/next/no-img-element -- Blob previews and stored images must render without the image optimizer. */
import { useEffect, useId, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { ArrowUpTrayIcon, PhotoIcon, TrashIcon } from '@heroicons/react/24/outline';
import styles from './dropzone.module.css';

type Props = {
  label: string;
  value: string;
  alt?: string;
  disabled?: boolean;
  uploading?: boolean;
  onUpload: (file: File) => Promise<void>;
  onRemove: () => void;
};

export default function Dropzone({ label, value, alt, disabled = false, uploading = false, onUpload, onRemove }: Props) {
  const id = useId();
  const pending = useRef(false);
  const blobUrls = useRef(new Set<string>());
  const [selection, setSelection] = useState<{ file: File; preview: string } | null>(null);
  const [error, setError] = useState('');
  const [uploaded, setUploaded] = useState(false);

  useEffect(() => {
    const urls = blobUrls.current;
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
      urls.clear();
    };
  }, []);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    accept: { 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'] },
    multiple: false,
    maxFiles: 1,
    minSize: 1,
    maxSize: 5 * 1024 * 1024,
    disabled: disabled || uploading,
    onDropRejected: () => {
      setUploaded(false);
      setError('Selecciona una sola imagen JPG o PNG, de máximo 5 MiB.');
    },
    onDrop: async (files, rejections) => {
      if (pending.current || disabled || uploading || rejections.length || files.length !== 1) return;
      pending.current = true;
      setError('');
      setUploaded(false);
      const url = URL.createObjectURL(files[0]);
      blobUrls.current.add(url);
      setSelection({ file: files[0], preview: url });
      try {
        await onUpload(files[0]);
        setUploaded(true);
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : 'No se pudo subir la imagen. Inténtalo de nuevo.');
      } finally {
        pending.current = false;
        setSelection(null);
        URL.revokeObjectURL(url);
        blobUrls.current.delete(url);
      }
    },
  });

  const source = selection ? selection.preview : value;
  return (
    <div className={styles.root} aria-busy={uploading}>
      <span id={`${id}-label`} className={styles.label}>{label}</span>
      {source && (
        <div className={styles.preview}>
          <img src={source} alt={alt || `Vista previa de ${label.toLowerCase()}`} />
        </div>
      )}
      <div
        {...getRootProps({
          role: 'button',
          'aria-labelledby': `${id}-label ${id}-prompt`,
          'aria-describedby': `${id}-help`,
          'aria-disabled': disabled || uploading,
        })}
        className={`${styles.target} ${isDragActive ? styles.active : ''}`}
      >
        <input {...getInputProps({ 'aria-label': `Seleccionar ${label.toLowerCase()}` })} />
        {value ? <ArrowUpTrayIcon /> : <PhotoIcon />}
        <span id={`${id}-prompt`}>
          {uploading ? 'Subiendo imagen…' : isDragActive ? 'Suelta la imagen aquí' : value ? 'Arrastra otra imagen para reemplazarla' : 'Arrastra una imagen o haz clic para seleccionarla'}
        </span>
        <span id={`${id}-help`} className={styles.help}>Una imagen · JPG o PNG · Máximo 5 MiB</span>
      </div>
      {value && (
        <div className={styles.actions}>
          <button type="button" disabled={disabled || uploading} onClick={open}>
            <ArrowUpTrayIcon /> Reemplazar
          </button>
          <button
            type="button"
            disabled={disabled || uploading}
            onClick={() => {
              setError('');
              setUploaded(false);
              onRemove();
            }}
          >
            <TrashIcon /> Quitar
          </button>
        </div>
      )}
      {uploading && <p role="status">Subiendo {label.toLowerCase()}… Espera antes de guardar.</p>}
      {!uploading && uploaded && value && <p role="status">Imagen subida correctamente.</p>}
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
