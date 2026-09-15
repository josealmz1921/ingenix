import { lazy, Suspense, ComponentProps } from 'react';

const LazyProgress = lazy(() => import('./Progress'));

const Progress = (props: ComponentProps<typeof LazyProgress>) => (
  <Suspense fallback={null}>
    <LazyProgress {...props} />
  </Suspense>
);

export default Progress;
