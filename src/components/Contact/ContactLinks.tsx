import type { PublicContact } from '@/src/content/contact';
import { hasContactData } from '@/src/content/contact';
import ContactIcon from './ContactIcon';
import styles from './contact.module.css';

export default function ContactLinks({ contact }: { contact: PublicContact }) {
  if (!hasContactData(contact)) return null;
  return (
    <div className={styles.contact}>
      {contact.address && <p className={styles.address}>{contact.address}</p>}
      {contact.links.length > 0 && (
        <ul className={styles.links} aria-label="Canales de contacto y redes sociales">
          {contact.links.map((link) => (
            <li key={link.channel}>
              <a
                href={link.href}
                {...(link.href.startsWith('https:') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              >
                <ContactIcon channel={link.channel} />
                <span>{link.label}</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
