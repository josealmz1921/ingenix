import { lazy, Suspense, ComponentProps } from 'react';

const LazyCard = lazy(() => import('./Card'));

const Card = (props: ComponentProps<typeof LazyCard>) => (
  <Suspense fallback={null}>
    <LazyCard {...props} />
  </Suspense>
);

export default Card;
