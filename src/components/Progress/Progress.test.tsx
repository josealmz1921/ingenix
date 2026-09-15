import { createRoot } from 'react-dom/client';
import Progress from './Progress';

it('should mount', () => {
  const container = document.createElement('div');
  const root = createRoot(container);
  root.render(<Progress />);
  root.unmount();
});