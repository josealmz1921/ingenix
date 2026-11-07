import type { ContentField, ResourceRecord } from '@/src/content/adminResources';

type Props = {
  field: ContentField;
  value: string;
  categories: ResourceRecord[];
  onChange: (value: string) => void;
};

export default function ResourceField({ field, value, categories, onChange }: Props) {
  const common = {
    required: field.required,
    value,
    onChange: (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    ) => onChange(event.target.value),
  };
  return (
    <label>
      {field.label}
      {field.kind === 'textarea' ? (
        <textarea {...common} maxLength={field.max} />
      ) : field.kind === 'category' ? (
        <select {...common}>
          <option value="">Sin categoría</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {String(category.document.title)}
              {category.document.published ? '' : ' (borrador)'}
            </option>
          ))}
        </select>
      ) : (
        <input
          {...common}
          type={field.kind === 'phone' ? 'tel' : field.kind === 'url' || field.kind === 'email' ? field.kind : 'text'}
          maxLength={field.max}
        />
      )}
    </label>
  );
}
