import Banner from '@/src/components/Banner/Banner';
import Button from '@/src/components/Button/Button';
import Card from '@/src/components/Card/Card';
import Grid from '@/src/components/Grid/Grid';
import Hero from '@/src/components/Hero/Hero';
import Section from '@/src/components/Section/Section';
import TextBlock from '@/src/components/TextBlock/TextBlock';
import type { ActionContent, PageSection } from './types';
import styles from './Sections.module.css';

function Actions({ actions }: { actions?: ActionContent[] }) {
  if (!actions?.length) return null;

  return (
    <div className={styles.actions}>
      {actions.map((action) => (
        <Button
          key={action.label}
          type="button"
          href={action.href}
          priority={action.priority}
        >
          {action.label}
        </Button>
      ))}
    </div>
  );
}

export default function SectionRenderer({ section }: { section: PageSection }) {
  if (!section.visible) return null;

  if (section.type === 'hero') {
    const { content } = section;

    return (
      <div id={section.id} className={styles.anchor}>
        <Hero
          title={content.title}
          eyebrow={content.eyebrow}
          description={content.description}
          subtitle={content.subtitle}
          image={content.image.src}
          imageAlt={content.image.alt}
          alignment={section.variant}
          parallax={false}
          imageOpacity={0.3}
          overlayOpacity={0.9}
          actions={content.actions}
        />
      </div>
    );
  }

  if (section.type === 'banner') {
    const { content } = section;

    return (
      <div id={section.id} className={`${styles.section} ${styles.anchor}`}>
        <Banner
          imagePosition={section.variant}
          image={content.image?.src}
          imageAlt={content.image?.alt}
          title={content.title}
          description={content.description}
        >
          <Actions actions={content.actions} />
        </Banner>
      </div>
    );
  }

  return (
    <Section
      id={section.id}
      container={false}
      aria-label={section.content.title}
      className={`${styles.section} ${styles.anchor} ${section.tone === 'panel' ? styles.panel : ''}`}
    >
      <TextBlock
        eyebrow={section.content.eyebrow}
        title={section.content.title}
        description={section.content.description}
        align={section.type === 'text' ? section.variant : 'left'}
        className={styles.heading}
      />

      {section.type === 'text' && (
        <>
          <Actions actions={section.content.actions} />
          {section.content.note && <p className={styles.note}>{section.content.note}</p>}
        </>
      )}

      {section.type === 'cards' && (
        <>
          <Grid columns={section.columns} gap={24}>
            {section.content.items.map((item, index) => (
              <Card
                key={item.id}
                variant={section.variant}
                title={item.title}
                description={item.description}
                image={item.image?.src}
                imageAlt={item.image?.alt}
                link={item.link}
                className={styles.card}
                eyebrow={String(index + 1).padStart(2, '0')}
              />
            ))}
          </Grid>
          {section.content.note && <p className={styles.note}>{section.content.note}</p>}
        </>
      )}

      {section.type === 'projects' && (
        section.content.items.length ? (
          <Grid columns={section.columns} gap={28}>
            {section.content.items.map((project) => (
              <Card
                key={project.id}
                variant={section.variant}
                title={project.title}
                description={project.description}
                image={project.image.src}
                imageAlt={project.image.alt}
                link={project.link}
                company={project.company}
                logo={project.logo?.src}
                logoAlt={project.logo?.alt}
                eyebrow={project.category}
                className={styles.card}
              />
            ))}
          </Grid>
        ) : (
          <div className={styles.emptyProjects}>
            <span className={styles.emptyIcon} aria-hidden="true">↗</span>
            <p>{section.content.emptyMessage}</p>
          </div>
        )
      )}
    </Section>
  );
}
