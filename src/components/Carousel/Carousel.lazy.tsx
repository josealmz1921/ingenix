import { lazy, Suspense, ComponentProps } from 'react';

const LazyCarousel = lazy(() => import('./Carousel'));

const Carousel = (props: ComponentProps<typeof LazyCarousel>) => (
  <Suspense fallback={null}>
    <LazyCarousel {...props} />
  </Suspense>
);

export default Carousel;
