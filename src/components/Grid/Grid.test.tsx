import { createRoot } from 'react-dom/client';
import Grid from './Grid';

it('should mount', () => {
  const container = document.createElement('div');
  const root = createRoot(container);
  root.render(<Grid />);
  root.unmount();
});