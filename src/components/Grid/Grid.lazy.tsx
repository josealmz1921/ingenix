import { lazy, Suspense, ComponentProps } from 'react';

const LazyGrid = lazy(() => import('./Grid'));

const Grid = (props: ComponentProps<typeof LazyGrid>) => (
  <Suspense fallback={null}>
    <LazyGrid {...props} />
  </Suspense>
);

export default Grid;
