import { createRoot } from 'react-dom/client';
import Footer from './Footer';

it('should mount', () => {
  const container = document.createElement('div');
  const root = createRoot(container);
  root.render(<Footer />);
  root.unmount();
});