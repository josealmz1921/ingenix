import type { PageDocument } from '../types/page';
import { parsePageDocument } from '../schemas/page.schema';
import type { PageBuilderTheme } from '../styles/themes';
import BlockRenderer from './BlockRenderer';
import styles from '../styles/PageBuilder.module.css';
import '../styles/tokens.css';

export interface PageRendererProps {
  document: PageDocument;
  theme?: PageBuilderTheme;
  mode?: 'draft' | 'publish';
  className?: string;
}

/** Same render tree for public pages and the admin preview. No data fetching. */
export default function PageRenderer({ document, theme, mode = 'publish', className = '' }: PageRendererProps) {
  const page = parsePageDocument(document, { mode });

  return (
    <div data-page-builder="" className={`${styles.root} ${className}`} style={theme}>
      <div className={styles.inner}>
        {page.sections.map((section) => <BlockRenderer key={section.id} section={section} />)}
      </div>
    </div>
  );
}
