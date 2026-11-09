import { getBlockFields, type EditorField, type PageSection } from '../../page-builder/editor';
import { preserveItemIdentity, sameItemIdentity } from './fieldIdentity';

export function isInlineField(field: EditorField, type: PageSection['type']) {
    return (field.kind === 'text' || field.kind === 'textarea') && !['id', 'alt'].includes(field.name) && !(type === 'banner' && field.name === 'eyebrow');
}

export function inlineTextFields(section: PageSection) {
    const result: { path: string; label: string; value: string; multiline: boolean }[] = [];
    function visit(fields: readonly EditorField[], value: Record<string, unknown>, prefix: string) {
        for (const field of fields) {
            const path = `${prefix}.${field.name}`;
            const data = value[field.name];
            if (isInlineField(field, section.type)) result.push({ path, label: field.label, value: typeof data === 'string' ? data : '', multiline: field.kind === 'textarea' });
            else if (field.kind === 'object' && data && typeof data === 'object') visit(field.fields || [], data as Record<string, unknown>, path);
            else if (field.kind === 'list' && Array.isArray(data)) data.forEach((item, index) => visit(field.fields || [], item, `${path}.${index}`));
        }
    }
    const content = getBlockFields(section.type).find(field => field.name === 'content');
    const connected = (section.type === 'cards' || section.type === 'projects') && section.catalog && section.catalog.mode !== 'static';
    const contact = section.id === 'contacto' && section.type === 'text';
    const fields = (content?.fields || []).filter(field =>
        !(connected && field.name === 'items') && !(contact && ['actions', 'note'].includes(field.name))
    );
    visit(fields, section.content as unknown as Record<string, unknown>, 'content');
    return result;
}

/** Source must be the rendered projection: filtering can change positions without changing identities. */
export function updateInlineText(section: PageSection, path: string, value: string, source = section): PageSection {
    const keys = path.split('.');
    let previous: unknown = source;
    let current: unknown = section;
    // A late event may refer to an item whose position has changed since rendering.
    for (let position = 0; position < keys.length; position++) {
        const key = keys[position];
        if (Array.isArray(previous) && Array.isArray(current)) {
            const item = previous[Number(key)] as Record<string, unknown> | undefined;
            const index = current.findIndex(entry => item && sameItemIdentity(item, entry));
            if (index < 0) return section;
            keys[position] = String(index);
        }
        previous = previous && typeof previous === 'object'
            ? (previous as Record<string, unknown>)[key] : undefined;
        current = current && typeof current === 'object'
            ? (current as Record<string, unknown>)[keys[position]] : undefined;
    }
    const resolvedPath = keys.join('.');
    if (value.length > 10000 || !inlineTextFields(section).some(field => field.path === resolvedPath) || current === value) return section;
    function replace(target: unknown, depth: number): unknown {
        if (depth === keys.length) return value;
        const key = keys[depth];
        if (Array.isArray(target)) return target.map((item, index) => index === Number(key) ? replace(item, depth + 1) : item);
        const object = target as Record<string, unknown>;
        return preserveItemIdentity(object, { ...object, [key]: replace(object[key], depth + 1) });
    }
    return replace(section, 0) as PageSection;
}
