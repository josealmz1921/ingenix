import { createRoot } from 'react-dom/client';
import Card from './Card';

it('should mount', () => {
  const container = document.createElement('div');
  const root = createRoot(container);
  root.render(<Card />);
  root.unmount();
});