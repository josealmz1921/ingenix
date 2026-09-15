import type { ReactNode } from 'react';

export interface SectionHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
}