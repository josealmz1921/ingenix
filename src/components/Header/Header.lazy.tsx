import { lazy, Suspense, ComponentProps } from 'react';

const LazyHeader = lazy(() => import('./Header'));

const Header = (props: ComponentProps<typeof LazyHeader>) => (
  <Suspense fallback={null}>
    <LazyHeader {...props} />
  </Suspense>
);

export default Header;
