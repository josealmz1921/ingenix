import { lazy, Suspense, ComponentProps } from 'react';

const LazyHero = lazy(() => import('./Hero'));

const Hero = (props: ComponentProps<typeof LazyHero>) => (
  <Suspense fallback={null}>
    <LazyHero {...props} />
  </Suspense>
);

export default Hero;
