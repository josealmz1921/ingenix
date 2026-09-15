import { createRoot } from 'react-dom/client';
import Carousel from './Carousel';

it('should mount', () => {
  const container = document.createElement('div');
  const root = createRoot(container);
  root.render(<Carousel />);
  root.unmount();
});