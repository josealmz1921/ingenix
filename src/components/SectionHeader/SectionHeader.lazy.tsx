import { lazy, Suspense, ComponentProps } from 'react';

const LazySectionHeader = lazy(() => import('./SectionHeader'));

const SectionHeader = (props: ComponentProps<typeof LazySectionHeader>) => (
  <Suspense fallback={null}>
    <LazySectionHeader {...props} />
  </Suspense>
);

export default SectionHeader;
