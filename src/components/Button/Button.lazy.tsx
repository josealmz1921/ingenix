import { lazy, Suspense, ComponentProps } from 'react';

const LazyButton = lazy(() => import('./Button'));

const Button = (props: ComponentProps<typeof LazyButton>) => (
  <Suspense fallback={null}>
    <LazyButton {...props} />
  </Suspense>
);

export default Button;
