'use client';
import { createContext, useContext, useId, useRef, useState } from 'react';
import { createListIdentity } from './fieldIdentity';
import type { BlockType, EditorField, ValidationIssue } from '@/src/page-builder/editor';
import { isInlineField } from './inlineEditing';
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ArrowsUpDownIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  TrashIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { uploadImage } from '@/src/utilities/cloudinary';
import styles from './builder.module.css';

type Values = Record<string, unknown>;
export type UpdateValues = (current: Values) => Values;
export const UploadActivity = createContext<(delta: number) => void>(() => {});
export const InlineEditingType = createContext<BlockType | null>(null);
export function blankFields(fields: readonly EditorField[]): Values {
  return Object.fromEntries(
    fields
      .filter((field) => field.required)
      .map((field) => [
        field.name,
        field.kind === 'object'
          ? blankFields(field.fields || [])
          : field.kind === 'list'
            ? []
            : field.kind === 'boolean'
              ? true
              : field.kind === 'select'
                ? field.options?.[0]
                : field.kind === 'number'
                  ? Math.min(
                      field.max ?? Infinity,
                      Math.max(field.min ?? 0, field.name === 'max' ? 100 : 0),
                    )
                  : field.name === 'id'
                    ? `item-${crypto.randomUUID()}`
                    : '',
      ]),
  );
}

function ImageField({
  id,
  value,
  onChange,
}: {
  id: string;
  value: string;
  onChange: (url: string) => void;
}) {
  const handled = useRef(new WeakSet<File>());
  const activity = useContext(UploadActivity);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function select(file?: File) {
    if (!file || handled.current.has(file)) return;
    handled.current.add(file);
    setBusy(true);
    activity(1);
    setError('');
    try {
      const result = await uploadImage(file);
      onChange(result.secure_url);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No se pudo subir la imagen.');
    } finally {
      setBusy(false);
      activity(-1);
    }
  }
  return (
    <div>
      <input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="/img/imagen.jpg o URL de tu Cloudinary"
      />
      <label>
        Subir imagen JPG o PNG
        <input
          type="file"
          accept="image/jpeg,image/png"
          disabled={busy}
          onChange={(event) => {
            void select(event.target.files?.[0]);
            event.target.value = '';
          }}
        />
      </label>
      {busy && <p role="status">Subiendo imagen… Espera antes de guardar.</p>}
      {error && <p role="alert">{error}</p>}
      <p className={styles.help}>
        Subida firmada existente. Quitar una referencia no elimina el archivo de Cloudinary.
      </p>
    </div>
  );
}

interface FieldsProps {
  fields: readonly EditorField[];
  value: Values;
  onChange: (update: UpdateValues) => void;
  prefix: string;
  path?: string;
  issues?: ValidationIssue[];
}

function SortableListItem({
  id,
  index,
  item,
  fields,
  prefix,
  path,
  issues,
  total,
  onChange,
  onMove,
  onRemove,
}: {
  id: string;
  index: number;
  item: Values;
  fields: readonly EditorField[];
  prefix: string;
  path: string;
  issues: ValidationIssue[];
  total: number;
  onChange: (update: UpdateValues) => void;
  onMove: (delta: number) => void;
  onRemove: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });
  const title = String(item.title || item.label || item.text || `Elemento ${index + 1}`);
  return (
    <div
      ref={setNodeRef}
      className={`${styles.listItem} ${isDragging ? styles.dragging : ''}`}
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      <button
        ref={setActivatorNodeRef}
        type="button"
        className={styles.dragHandle}
        aria-label={`Arrastrar elemento ${index + 1}`}
        {...attributes}
        {...listeners}
      >
        <ArrowsUpDownIcon />
      </button>
      <details open={total === 1} className={styles.itemDetails}>
        <summary>
          <span>{String(index + 1).padStart(2, '0')}</span>
          {title}
        </summary>
        <Fields
          prefix={`${prefix}-${id}`}
          path={`${path}[${index}]`}
          issues={issues}
          fields={fields}
          value={item}
          onChange={onChange}
        />
      </details>
      <div className={styles.itemActions}>
        <button
          type="button"
          disabled={!index}
          onClick={() => onMove(-1)}
          aria-label={`Subir elemento ${index + 1}`}
        >
          <ArrowUpIcon />
        </button>
        <button
          type="button"
          disabled={index === total - 1}
          onClick={() => onMove(1)}
          aria-label={`Bajar elemento ${index + 1}`}
        >
          <ArrowDownIcon />
        </button>
        <button
          type="button"
          className={styles.danger}
          onClick={onRemove}
          aria-label={`Quitar elemento ${index + 1}`}
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  );
}

function ListField({
  field,
  items,
  prefix,
  path,
  issues,
  onChange,
}: {
  field: EditorField;
  items: Values[];
  prefix: string;
  path: string;
  issues: ValidationIssue[];
  onChange: (update: (current: Values[]) => Values[]) => void;
}) {
  const scope = useId();
  const [identity] = useState(() => createListIdentity(scope));
  const currentKeys = items.map(identity.keyFor);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 7 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  function move(from: number, to: number) {
    if (to < 0 || to >= items.length) return;
    const sourceKey = currentKeys[from];
    const targetKey = currentKeys[to];
    onChange(current => {
      const start = current.findIndex(item => identity.keyFor(item) === sourceKey);
      const end = current.findIndex(item => identity.keyFor(item) === targetKey);
      return start < 0 || end < 0 ? current : arrayMove(current, start, end);
    });
  }
  return (
    <fieldset className={styles.group}>
      <legend>
        {field.label} <span className={styles.itemCount}>{items.length}</span>
      </legend>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={({ active, over }) => {
          if (!over || over.id === active.id) return;
          const from = currentKeys.indexOf(String(active.id));
          const to = currentKeys.indexOf(String(over.id));
          if (from >= 0 && to >= 0) move(from, to);
        }}
      >
        <SortableContext items={currentKeys} strategy={verticalListSortingStrategy}>
          {items.map((item, index) => (
            <SortableListItem
              key={currentKeys[index]}
              id={currentKeys[index]}
              index={index}
              item={item}
              total={items.length}
              fields={field.fields || []}
              prefix={prefix}
              path={path}
              issues={issues}
              onChange={(update) =>
                onChange(current => identity.update(current, currentKeys[index], update))
              }
              onMove={(delta) => move(index, index + delta)}
              onRemove={() => {
                onChange(current => current.filter(entry => identity.keyFor(entry) !== currentKeys[index]));
              }}
            />
          ))}
        </SortableContext>
      </DndContext>
      {!items.length && <p className={styles.help}>Aún no hay elementos en esta colección.</p>}
      <button
        type="button"
        className={styles.addItem}
        disabled={items.length >= (field.max || 100)}
        onClick={() => {
          const item = blankFields(field.fields || []);
          onChange(current => current.length >= (field.max || 100) ? current : [...current, item]);
        }}
      >
        <PlusIcon />
        Agregar elemento
      </button>
    </fieldset>
  );
}

export default function Fields({
  fields,
  value,
  onChange,
  prefix,
  path = '',
  issues = [],
}: FieldsProps) {
  const inlineType = useContext(InlineEditingType);
  const instanceId = useId();
  const update = (name: string, next: unknown) => {
    onChange(current => {
      const result = { ...current };
      if (next === undefined) delete result[name];
      else result[name] = next;
      return result;
    });
  };
  return (
    <>
      {fields.map((field) => {
        if (inlineType && isInlineField(field, inlineType)) return null;
        const data = value[field.name];
        const id = `${instanceId}-${prefix}-${field.name}`;
        const fieldPath = `${path}.${field.name}`;
        const fieldErrors = issues.filter((issue) => issue.path === fieldPath);
        if (field.kind === 'object') {
          return (
            <fieldset key={field.name} className={styles.group}>
              <legend>{field.label}</legend>
              {data !== undefined ? (
                <>
                  <Fields
                    prefix={id}
                    path={fieldPath}
                    issues={issues}
                    fields={field.fields || []}
                    value={data as Values}
                    onChange={(transform) => onChange(current => {
                      const nested = current[field.name];
                      if (!nested || typeof nested !== 'object') return current;
                      return { ...current, [field.name]: transform(nested as Values) };
                    })}
                  />
                  {!field.required && (
                    <button
                      type="button"
                      className={styles.removeOptional}
                      onClick={() => update(field.name, undefined)}
                    >
                      Quitar {field.label.toLowerCase()}
                    </button>
                  )}
                </>
              ) : (
                <button
                  type="button"
                  className={styles.addItem}
                  onClick={() => update(field.name, blankFields(field.fields || []))}
                >
                  <PlusIcon />
                  Agregar {field.label.toLowerCase()}
                </button>
              )}
            </fieldset>
          );
        }

        if (field.kind === 'list') {
          const items = (data || []) as Values[];
          return (
            <ListField
              key={field.name}
              field={field}
              items={items}
              prefix={id}
              path={fieldPath}
              issues={issues}
              onChange={(transform) => onChange(current => ({
                ...current,
                [field.name]: transform((current[field.name] || []) as Values[]),
              }))}
            />
          );
        }
        return (
          <div
            key={field.name}
            className={styles.field}
            data-invalid={fieldErrors.length ? 'true' : undefined}
          >
            <label htmlFor={id}>
              {field.label}
              {field.required ? ' *' : ''}
            </label>
            {field.kind === 'boolean' ? (
              <input
                id={id}
                type="checkbox"
                checked={Boolean(data)}
                onChange={(event) => update(field.name, event.target.checked)}
              />
            ) : field.kind === 'select' ? (
              <select
                id={id}
                value={String(data ?? '')}
                onChange={(event) => {
                  const selected = field.options?.find(
                    (option) => String(option) === event.target.value,
                  );
                  update(field.name, selected);
                }}
              >
                {!field.required && <option value="">Automático</option>}
                {field.options?.map((option) => (
                  <option key={option} value={String(option)}>
                    {option}
                  </option>
                ))}
              </select>
            ) : field.kind === 'textarea' ? (
              <textarea
                id={id}
                value={String(data ?? '')}
                onChange={(event) => update(field.name, event.target.value)}
              />
            ) : field.kind === 'image-url' ? (
              <ImageField
                id={id}
                value={String(data ?? '')}
                onChange={(next) => update(field.name, next)}
              />
            ) : (
              <input
                id={id}
                type={field.kind === 'number' ? 'number' : 'text'}
                step={field.kind === 'number' ? 'any' : undefined}
                min={field.min}
                max={field.max}
                value={String(data ?? '')}
                onChange={(event) =>
                  update(
                    field.name,
                    field.kind === 'number'
                      ? event.target.value === ''
                        ? undefined
                        : Number(event.target.value)
                      : event.target.value,
                  )
                }
              />
            )}
            {fieldErrors.length > 0 && (
              <p className={styles.fieldError} role="alert">
                {fieldErrors.map((issue) => issue.message).join(' ')}
              </p>
            )}
          </div>
        );
      })}
    </>
  );
}
