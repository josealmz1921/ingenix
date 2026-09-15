import { createRoot } from 'react-dom/client';
import Section from './Section';

it('should mount', () => {
  const container = document.createElement('div');
  const root = createRoot(container);
  root.render(<Section />);
  root.unmount();
});