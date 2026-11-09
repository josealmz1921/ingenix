import { createBlock, type BlockType, type PageDocument, type PageSection } from "../../page-builder/editor";
import { preserveItemIdentity } from './fieldIdentity';

export const blockDescriptions: Record<BlockType, string> = {
    hero: "Presentación y llamada a la acción",
    text: "Títulos, párrafos y botones",
    banner: "Imagen y mensaje destacado",
    cards: "Colección de tarjetas editables",
    projects: "Galería con imágenes y enlaces",
    carousel: "Tarjetas deslizables con imágenes y enlaces",
    progress: "Indicadores con valores y máximos editables",
};

/** Resolve the target at commit time, not by a position captured before insertion/reordering. */
export function updateBlockById(page: PageDocument, id: string, update: (block: PageSection) => PageSection): PageDocument {
    const index = page.sections.findIndex(block => block.id === id);
    if (index < 0) return page;
    const block = preserveItemIdentity(page.sections[index], update(page.sections[index]));
    if (block === page.sections[index]) return page;
    return { ...page, sections: page.sections.map((entry, position) => position === index ? block : entry) };
}

/** Gap is a position in the original array, including the position after its end. */
export function moveBlockToGap(sections: PageSection[], from: number, gap: number): PageSection[] {
    if (from < 0 || from >= sections.length || gap < 0 || gap > sections.length) return sections;
    const next = [...sections];
    const [block] = next.splice(from, 1);
    next.splice(gap > from ? gap - 1 : gap, 0, block);
    return next;
}

export function insertBlock(page: PageDocument, type: BlockType, index: number, id: string): PageDocument {
    if (page.sections.length >= 100) return page;
    const block = createBlock(type, id);
    if (block.type === 'projects') block.catalog = { mode: 'all', items: [] };
    // Preserve a single visible H1, even when adding another portada.
    if (type === "hero" && page.sections.some(section => section.type === "hero" && section.visible)) block.visible = false;
    const sections = [...page.sections];
    sections.splice(Math.max(0, Math.min(index, sections.length)), 0, block);
    return { ...page, sections };
}

export function duplicateBlock(page: PageDocument, index: number, id: string): PageDocument {
    if (!page.sections[index] || page.sections.length >= 100) return page;
    const block = structuredClone(page.sections[index]);
    block.id = id;
    if (block.type === "hero") block.visible = false;
    const sections = [...page.sections];
    sections.splice(index + 1, 0, block);
    return { ...page, sections };
}
