import { createRoot } from 'react-dom/client';
import GridCard from './GridCard';

it('should mount', () => {
  const container = document.createElement('div');
  const root = createRoot(container);
  root.render(<GridCard />);
  root.unmount();
});