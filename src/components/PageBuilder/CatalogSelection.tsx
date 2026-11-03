import Link from 'next/link';
import type { PageSection } from '@/src/page-builder/editor';
import type { ResourceRecord } from '@/src/content/adminResources';
import styles from './builder.module.css';

type CatalogBlock = Extract<PageSection, { type: 'cards' | 'projects' }>;
type Props = {
  section: CatalogBlock;
  records: ResourceRecord[];
  loading: boolean;
  error: string;
  onRefresh: () => void;
  onChange: (section: CatalogBlock) => void;
};

export default function CatalogSelection({
  section,
  records,
  loading,
  error,
  onRefresh,
  onChange,
}: Props) {
  const mode = section.catalog?.mode ?? 'static';
  const references = section.catalog?.items ?? [];
  const resource = section.type === 'cards' ? 'services' : 'projects';
  const label = resource === 'services' ? 'servicios' : 'proyectos';
  const byId = new Map(records.map((record) => [record.id, record]));
  const available = records.filter(
    (record) => !references.some((item) => item.recordId === record.id),
  );

  function update(items: { recordId: string }[]) {
    onChange({ ...section, catalog: { mode, items } });
  }

  function move(index: number, direction: -1 | 1) {
    const items = [...references];
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    [items[index], items[target]] = [items[target], items[index]];
    update(items);
  }

  return (
    <div className={styles.catalogSelection}>
      <label>
        Origen de las tarjetas
        <select
          value={mode}
          onChange={(event) => {
            const nextMode = event.target.value as 'all' | 'selected' | 'static';
            const catalog = { mode: nextMode, items: nextMode === 'selected' ? references : [] };
            if (nextMode === 'static') {
              onChange({ ...section, catalog });
            } else if (section.type === 'cards') {
              onChange({ ...section, catalog, content: { ...section.content, items: [] } });
            } else {
              onChange({ ...section, catalog, content: { ...section.content, items: [] } });
            }
          }}
        >
          <option value="static">Contenido local del bloque</option>
          <option value="all">Todos los {label} publicados (hasta 100)</option>
          <option value="selected">Seleccionar {label} y ordenar</option>
        </select>
      </label>
      <p className={styles.help}>
        Usar el catálogo reemplaza las tarjetas locales. Sus textos e imágenes se editan una sola
        vez en <Link href={`/dashboard/${resource}`}>{label}</Link>. Aquí decides cuáles mostrar.
      </p>
      {mode !== 'static' && (
        <>
          <button type="button" onClick={onRefresh} disabled={loading}>
            {loading ? 'Cargando catálogo…' : 'Actualizar catálogo'}
          </button>
          {error && <p role="alert">{error}</p>}
          {!loading && !error && (
            <p className={styles.help}>{records.length} registros publicados disponibles.</p>
          )}
        </>
      )}
      {mode === 'selected' && (
        <>
          <label>
            Agregar {resource === 'services' ? 'servicio' : 'proyecto'}
            <select
              value=""
              disabled={loading || Boolean(error) || references.length >= 100}
              onChange={(event) => {
                if (event.target.value) update([...references, { recordId: event.target.value }]);
              }}
            >
              <option value="">Selecciona un registro publicado</option>
              {available.map((record) => (
                <option key={record.id} value={record.id}>
                  {String(record.document.title)}
                </option>
              ))}
            </select>
          </label>
          <ol className={styles.catalogReferences}>
            {references.map(({ recordId }, index) => (
              <li key={recordId}>
                <span>
                  {String(byId.get(recordId)?.document.title || `${recordId} · No disponible`)}
                </span>
                <div>
                  <button
                    type="button"
                    disabled={index === 0}
                    aria-label={`Subir ${recordId}`}
                    onClick={() => move(index, -1)}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    disabled={index === references.length - 1}
                    aria-label={`Bajar ${recordId}`}
                    onClick={() => move(index, 1)}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    aria-label={`Quitar ${recordId}`}
                    onClick={() => update(references.filter((item) => item.recordId !== recordId))}
                  >
                    Quitar
                  </button>
                </div>
              </li>
            ))}
          </ol>
          <p className={styles.help}>
            El orden de esta lista es el orden del sitio. Los registros eliminados o despublicados
            no se muestran; una selección vacía no muestra tarjetas.
          </p>
        </>
      )}
    </div>
  );
}
