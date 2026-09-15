import { createRoot } from 'react-dom/client';
import TextBlock from './TextBlock';

it('should mount', () => {
  const container = document.createElement('div');
  const root = createRoot(container);
  root.render(<TextBlock />);
  root.unmount();
});