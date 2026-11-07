import { parsePageDocument } from '@/src/page-builder/editor';
import type { PageDocument } from '@/src/page-builder/types/page';
import type { PublicContact } from '@/src/content/contact';
import { hasContactData } from '@/src/content/contact';
import type { PageBuilderTheme } from '@/src/page-builder/styles/themes';
import type { TextRenderer } from '@/src/page-builder/types/render';
import BlockRenderer from '@/src/page-builder/renderer/BlockRenderer';
import Section from '@/src/page-builder/components/layout/Section/Section';
import TextBlock from '@/src/page-builder/components/ui/TextBlock/TextBlock';
import pageStyles from '@/src/page-builder/styles/PageBuilder.module.css';
import sectionStyles from '@/src/page-builder/styles/Sections.module.css';
import '@/src/page-builder/styles/tokens.css';
import ContactLinks from './ContactLinks';

/** Brand-specific icons stay in the host, never in the portable PageBuilder. */
type Props = {
  page: PageDocument;
  contact: PublicContact;
  theme?: PageBuilderTheme;
  mode?: 'draft' | 'publish';
  renderText?: TextRenderer;
};

export default function HomePageRenderer({ page, contact, theme, mode = 'publish', renderText }: Props) {
  const document = parsePageDocument(page, { mode });
  return (
    <div data-page-builder="" className={pageStyles.root} style={theme}>
      <div className={pageStyles.inner}>
        {document.sections.map((section) => {
          if (section.id !== 'contacto' || section.type !== 'text') {
            return (
              <BlockRenderer key={section.id} section={section} />
            );
          }
          if (!section.visible || !hasContactData(contact)) return null;
          return (
            <Section
              key={section.id}
              id={section.id}
              container={false}
              aria-label={section.content.title}
              className={`${sectionStyles.section} ${sectionStyles.anchor} ${section.tone === 'panel' ? sectionStyles.panel : ''}`}
            >
              <TextBlock
                renderText={renderText ? (path, value) => renderText(`content.${path}`, value) : undefined}
                eyebrow={section.content.eyebrow}
                title={section.content.title}
                description={section.content.description}
                align={section.variant}
                className={`${sectionStyles.heading} ${sectionStyles[`heading-${section.variant}`]}`}
              />
              <ContactLinks contact={contact} />
            </Section>
          );
        })}
      </div>
    </div>
  );
}
