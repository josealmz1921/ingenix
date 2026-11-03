import {
  Squares2X2Icon, RectangleGroupIcon, WrenchScrewdriverIcon, TagIcon,
  BriefcaseIcon, NewspaperIcon, BuildingOffice2Icon,
} from '@heroicons/react/24/outline';

export const adminNavigation = [
  { href: '/dashboard', label: 'Resumen', Icon: Squares2X2Icon },
  { href: '/dashboard/pages', label: 'Páginas', Icon: RectangleGroupIcon },
  { href: '/dashboard/services', label: 'Servicios', Icon: WrenchScrewdriverIcon },
  { href: '/dashboard/categories', label: 'Categorías', Icon: TagIcon },
  { href: '/dashboard/projects', label: 'Proyectos', Icon: BriefcaseIcon },
  { href: '/dashboard/blog', label: 'Blog', Icon: NewspaperIcon },
  { href: '/dashboard/company', label: 'Empresa', Icon: BuildingOffice2Icon },
] as const;

export function isActiveAdminPath(pathname: string, href: string): boolean {
  return pathname === href || (href !== '/dashboard' && pathname.startsWith(`${href}/`));
}
