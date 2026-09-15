import { lazy, Suspense, ComponentProps } from 'react';

const LazySection = lazy(() => import('./Section'));

const Section = (props: ComponentProps<typeof LazySection>) => (
  <Suspense fallback={null}>
    <LazySection {...props} />
  </Suspense>
);

export default Section;
