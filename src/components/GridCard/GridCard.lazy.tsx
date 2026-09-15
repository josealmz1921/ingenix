import { lazy, Suspense, ComponentProps } from 'react';

const LazyGridCard = lazy(() => import('./GridCard'));

const GridCard = (props: ComponentProps<typeof LazyGridCard>) => (
  <Suspense fallback={null}>
    <LazyGridCard {...props} />
  </Suspense>
);

export default GridCard;
