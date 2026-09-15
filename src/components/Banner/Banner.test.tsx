import { createRoot } from 'react-dom/client';
import Banner from './Banner';

it('should mount', () => {
  const container = document.createElement('div');
  const root = createRoot(container);
  root.render(<Banner />);
  root.unmount();
});