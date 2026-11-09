type Item = Record<string, unknown>;
const itemKeys = new WeakMap<object, string>();
let sequence = 0;

export function editorItemKey(item: object): string {
  let key = itemKeys.get(item);
  if (!key) {
    key = 'id' in item && typeof item.id === 'string' && item.id ? `item-${item.id}` : `row-${sequence++}`;
    itemKeys.set(item, key);
  }
  return key;
}

export function preserveItemIdentity<T extends object>(previous: T, next: T): T {
  itemKeys.set(next, editorItemKey(previous));
  return next;
}

export function sameItemIdentity(previous: Item, next: Item): boolean {
  return editorItemKey(previous) === editorItemKey(next);
}

/** Replace positional list segments with item identities for contenteditable React keys. */
export function inlineFieldKey(value: unknown, path: string): string {
  return path.split('.').map(key => {
    const next = value && typeof value === 'object' ? (value as Item)[key] : undefined;
    const part = Array.isArray(value) && next && typeof next === 'object' ? editorItemKey(next) : key;
    value = next;
    return part;
  }).join('.');
}

/** UI-only identity, including lists whose schema has no persisted ID (e.g. buttons). */
export function createListIdentity(scope: string) {
  function keyFor(item: Item): string {
    return `${scope}-${editorItemKey(item)}`;
  }
  function update(items: Item[], key: string, transform: (item: Item) => Item): Item[] {
    return items.map(item => {
      if (keyFor(item) !== key) return item;
      return preserveItemIdentity(item, transform(item));
    });
  }
  return { keyFor, update };
}
