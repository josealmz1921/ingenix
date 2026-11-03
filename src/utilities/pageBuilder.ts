import type { PageDocument } from "../page-builder/editor";

export const PREVIEW_KEY = "ingenix:page-builder-preview:v1";

// These IDs belong to retained site sections, navigation and site chrome.
const homeReservedIds = new Set(['contenido']);

export function pageHomeErrors(document: PageDocument): string[] {
    return [...pageImageErrors(document), ...document.sections.filter(section => homeReservedIds.has(section.id)).map(section => `El ancla "${section.id}" está reservada para una sección del sitio. Usa otro identificador.`)];
}

// Matches next.config.ts without expanding the allowed remote image origins.
export function isAllowedImageSource(source: string): boolean {
    if (/^\/img\/[\w./-]+$/.test(source) && !source.includes('..')) return true;
    try {
        const url = new URL(source);
        const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        return Boolean(cloud) && url.protocol === 'https:' && url.hostname === 'res.cloudinary.com'
            && !url.username && !url.password && !url.port && url.pathname.startsWith(`/${cloud}/`);
    } catch { return false; }
}

export function pageImageErrors(document: PageDocument): string[] {
    const errors: string[] = [];
    function visit(value: unknown) {
        if (!value || typeof value !== "object") return;
        if ("src" in value && typeof value.src === "string") {
            if (!isAllowedImageSource(value.src)) errors.push("Usa imágenes locales de /img/ o del Cloudinary configurado para este sitio.");
        }
        for (const child of Object.values(value)) visit(child);
    }
    visit(document);
    return [...new Set(errors)];
}
