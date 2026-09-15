import { createRoot } from 'react-dom/client';
import Header from './Header';

it('should mount', () => {
  const container = document.createElement('div');
  const root = createRoot(container);
  root.render(<Header />);
  root.unmount();
});