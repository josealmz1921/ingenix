import { createRoot } from 'react-dom/client';
import Button from './Button';

it('should mount', () => {
  const container = document.createElement('div');
  const root = createRoot(container);
  root.render(<Button />);
  root.unmount();
});