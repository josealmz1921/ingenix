import { createRoot } from 'react-dom/client';
import Hero from './Hero';

it('should mount', () => {
  const container = document.createElement('div');
  const root = createRoot(container);
  root.render(<Hero />);
  root.unmount();
});