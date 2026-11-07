import type { ResourceDocument } from './adminResources';
import type { ActionContent, PageDocument } from '@/src/page-builder/types/page';

export const socialNetworks = [
  { key: 'facebook', label: 'Facebook' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'linkedin', label: 'LinkedIn' },
  { key: 'x', label: 'X' },
  { key: 'youtube', label: 'YouTube' },
  { key: 'tiktok', label: 'TikTok' },
  { key: 'github', label: 'GitHub' },
] as const;

export type ContactChannel = typeof socialNetworks[number]['key'] | 'email' | 'phone' | 'whatsapp' | 'maps';
export type ContactLink = { channel: ContactChannel; label: string; href: string };
export type PublicContact = { address: string; links: ContactLink[] };
export const emptyContact: PublicContact = { address: '', links: [] };

/** Only call with a validated document. No environment or placeholder fallback. */
export function projectContact(document?: ResourceDocument | null): PublicContact {
  if (document?.published !== true) return emptyContact;
  const links: ContactLink[] = [];
  if (document.email) {
    links.push({ channel: 'email', label: String(document.email), href: `mailto:${document.email}` });
  }
  if (document.phone) {
    links.push({ channel: 'phone', label: String(document.phone), href: `tel:${String(document.phone).replace(/[\s()-]/g, '')}` });
  }
  if (document.whatsapp && document.whatsappVisible === true) {
    const message = document.whatsappMessage ? `?text=${encodeURIComponent(String(document.whatsappMessage))}` : '';
    links.push({ channel: 'whatsapp', label: 'WhatsApp', href: `https://wa.me/${String(document.whatsapp).replace(/\D/g, '')}${message}` });
  }
  if (document.mapsUrl) {
    links.push({ channel: 'maps', label: 'Ver ubicación', href: String(document.mapsUrl) });
  }
  for (const network of socialNetworks) {
    const href = document[`${network.key}Url`];
    if (href && document[`${network.key}Visible`] === true) {
      links.push({ channel: network.key, label: network.label, href: String(href) });
    }
  }
  return { address: String(document.address || ''), links };
}

export function hasContactData(contact: PublicContact) {
  return Boolean(contact.address || contact.links.length);
}

export function contactSectionAvailable(page: PageDocument) {
  return page.sections.some((section) => section.id === 'contacto' && section.type === 'text' && section.visible);
}

/** Runtime host composition; the portable builder and saved page remain independent. */
export function composeHomeContact(page: PageDocument, contact: PublicContact): PageDocument {
  const available = hasContactData(contact) && contactSectionAvailable(page);
  const withoutContact = (actions: ActionContent[] = []) => actions.filter((action) =>
    !['#contacto', '/#contacto'].includes(action.href),
  );
  return {
    ...page,
    sections: page.sections.map((section) => {
      if (section.id === 'contacto' && section.type === 'text') {
        return {
          ...section,
          visible: section.visible && available,
          content: {
            ...section.content,
            actions: [],
            note: undefined,
          },
        };
      }
      if (!available && section.type === 'hero') {
        return { ...section, content: { ...section.content, actions: withoutContact(section.content.actions) } };
      }
      if (!available && section.type === 'text') {
        return { ...section, content: { ...section.content, actions: withoutContact(section.content.actions) } };
      }
      if (!available && section.type === 'banner') {
        return { ...section, content: { ...section.content, actions: withoutContact(section.content.actions) } };
      }
      return section;
    }),
  };
}
