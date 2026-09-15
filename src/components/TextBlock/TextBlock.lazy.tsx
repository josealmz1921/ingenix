import { lazy, Suspense, ComponentProps } from 'react';

const LazyTextBlock = lazy(() => import('./TextBlock'));

const TextBlock = (props: ComponentProps<typeof LazyTextBlock>) => (
  <Suspense fallback={null}>
    <LazyTextBlock {...props} />
  </Suspense>
);

export default TextBlock;
