import { createRoot } from 'react-dom/client';
import SectionHeader from './SectionHeader';

it('should mount', () => {
  const container = document.createElement('div');
  const root = createRoot(container);
  root.render(<SectionHeader />);
  root.unmount();
});