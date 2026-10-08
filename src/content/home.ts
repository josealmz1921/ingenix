import type { PageSection } from '@/src/features/page-builder/types';
import { site } from './site';

/** Serializable content: array order is display order. No JSX or component instances. */
export const homeSections: PageSection[] = [
  {
    id: 'nosotros', type: 'hero', variant: 'left', visible: true, navigationLabel: 'Nosotros',
    content: {
      eyebrow: 'Ingenix · Desarrollo de software',
      title: 'Un equipo de tecnología. Un aliado para tu negocio.',
      description: 'Somos Ingenix. Diseñamos y desarrollamos software a medida para empresas que necesitan convertir ideas, procesos y retos en soluciones digitales.',
      subtitle: 'Entendemos tu negocio. Construimos contigo. Evolucionamos tu tecnología.',
      image: { src: '/img/hero_1.jpg', alt: '' },
      actions: [
        { label: 'Hablemos de tu proyecto', href: '#contacto', priority: 'primary' },
        { label: 'Conoce nuestra experiencia', href: '#experiencia', priority: 'secondary' },
      ],
    },
  },
  {
    id: 'enfoque', type: 'text', variant: 'left', visible: true,
    content: {
      eyebrow: 'Nuestra forma de trabajar',
      title: 'Primero entendemos el negocio. Después construimos la solución.',
      description: 'Trabajamos cerca de tu equipo para definir lo que necesitas, diseñar una solución clara y desarrollar tecnología que puedas mantener y hacer crecer. Desde la primera conversación hasta la puesta en producción, priorizamos la comunicación y los objetivos de tu proyecto.',
    },
  },
  {
    id: 'experiencia', type: 'cards', variant: 'default', visible: true, navigationLabel: 'Experiencia', tone: 'panel', columns: 3,
    content: {
      eyebrow: 'Experiencia profesional',
      title: 'Conocimiento técnico en distintos contextos de negocio.',
      description: 'Nuestra experiencia profesional incluye la participación en proyectos de sectores con necesidades operativas, comerciales y de integración diferentes.',
      items: [
        { id: 'seguros', title: 'Servicios financieros y seguros', description: 'Experiencias digitales para cotización, contratación y procesos relacionados con productos financieros y seguros.' },
        { id: 'comercio', title: 'E-commerce y retail', description: 'Catálogos, checkout, pagos e integraciones para conectar la experiencia de compra con la operación del negocio.' },
        { id: 'automotriz', title: 'Automotriz', description: 'Plataformas y experiencias comerciales orientadas a productos, servicios y usuarios del sector automotriz.' },
        { id: 'manufactura', title: 'Manufactura', description: 'Soluciones digitales adaptadas a procesos empresariales y necesidades específicas de operación.' },
        { id: 'plataformas', title: 'Plataformas empresariales', description: 'Sistemas que simplifican tareas, conectan herramientas y facilitan el trabajo de los equipos.' },
        { id: 'ingenieria', title: 'Ingeniería de software', description: 'Arquitectura, pruebas, mantenimiento e integración de servicios para acompañar la evolución de las aplicaciones.' },
      ],
      note: 'Parte de esta experiencia corresponde a proyectos sujetos a acuerdos de confidencialidad. Diferenciamos la participación profesional de los proyectos que podemos publicar como Ingenix.',
    },
  },
  {
    id: 'servicios', type: 'cards', variant: 'image-top', visible: true, navigationLabel: 'Servicios', columns: 3,
    content: {
      eyebrow: 'Nuestros servicios',
      title: 'Software a medida para lo que tu empresa necesita.',
      description: 'Desde tu presencia digital hasta las herramientas que sostienen tu operación. Definimos el alcance y la tecnología según tus objetivos.',
      items: [
        { id: 'web', title: 'Sitios web corporativos', description: 'Sitios y landing pages que presentan tu empresa con claridad, se adaptan a cualquier dispositivo y facilitan el contacto.', image: { src: '/img/web_site_1.jpg', alt: 'Diseño y desarrollo de sitios web' } },
        { id: 'sistemas', title: 'Sistemas y plataformas web', description: 'Herramientas personalizadas, dashboards y plataformas para digitalizar procesos y organizar tu operación.', image: { src: '/img/web_system.jpg', alt: 'Plataformas web para empresas' } },
        { id: 'apps', title: 'Aplicaciones móviles', description: 'Aplicaciones para Android y iOS diseñadas alrededor de tus usuarios y conectadas con los servicios de tu negocio.', image: { src: '/img/mobile_1.jpg', alt: 'Desarrollo de aplicaciones móviles' } },
        { id: 'tiendas', title: 'Tiendas online', description: 'E-commerce con Shopify y otras tecnologías: catálogos, pagos e integraciones para gestionar tus ventas.', image: { src: '/img/ecommerce_1.jpg', alt: 'Soluciones de comercio electrónico' } },
        { id: 'integraciones', title: 'Automatización e integraciones', description: 'Conectamos aplicaciones y APIs para reducir tareas repetitivas y mantener tus herramientas trabajando juntas.', image: { src: '/img/automation.jpg', alt: 'Automatización de procesos de negocio' } },
        { id: 'evolucion', title: 'Mantenimiento y evolución', description: 'Actualizamos, corregimos y optimizamos aplicaciones existentes para acompañar las nuevas necesidades de tu empresa.', image: { src: '/img/integration.png', alt: 'Mantenimiento e integración de software' } },
      ],
    },
  },
  {
    id: 'proyectos', type: 'projects', variant: 'image-top', visible: true, navigationLabel: 'Proyectos', columns: 2,
    content: {
      eyebrow: 'Proyectos realizados',
      title: 'Nuestro trabajo, llevado a la práctica.',
      description: 'Vista previa con proyectos ficticios. Las empresas, imágenes y enlaces son de demostración y se reemplazarán por proyectos reales.',
      // Temporary demos. example.com is a reserved example domain, not a client site.
      items: [
        {
          id: 'demo-sitio-corporativo',
          company: 'Empresa demo · Consultoría',
          title: 'Sitio corporativo y catálogo de servicios',
          category: 'Sitio web · Demo',
          description: 'Proyecto ficticio de un sitio empresarial con presentación de servicios, información del equipo y puntos de contacto para clientes potenciales.',
          image: { src: '/img/web_site_1.jpg', alt: 'Imagen ilustrativa del proyecto demo de sitio corporativo' },
          logo: { src: '/img/demo-company-logo.svg', alt: 'Logo de demostración, no corresponde a un cliente real' },
          link: { text: 'Visitar sitio de ejemplo', href: 'https://example.com/?proyecto=sitio-corporativo', target: '_blank' },
        },
        {
          id: 'demo-tienda-online',
          company: 'Empresa demo · Comercio',
          title: 'Tienda online para una marca de productos',
          category: 'E-commerce · Demo',
          description: 'Proyecto ficticio de comercio electrónico con catálogo, carrito de compra y una experiencia de navegación adaptada a dispositivos móviles.',
          image: { src: '/img/ecommerce_1.jpg', alt: 'Imagen ilustrativa del proyecto demo de tienda online' },
          logo: { src: '/img/demo-company-logo.svg', alt: 'Logo de demostración, no corresponde a un cliente real' },
          link: { text: 'Visitar sitio de ejemplo', href: 'https://example.com/?proyecto=tienda-online', target: '_blank' },
        },
        {
          id: 'demo-plataforma-operativa',
          company: 'Empresa demo · Operaciones',
          title: 'Plataforma de gestión empresarial',
          category: 'Sistema web · Demo',
          description: 'Proyecto ficticio de una plataforma para centralizar información, consultar indicadores y dar seguimiento a tareas y procesos internos.',
          image: { src: '/img/web_system.jpg', alt: 'Imagen ilustrativa del proyecto demo de plataforma empresarial' },
          logo: { src: '/img/demo-company-logo.svg', alt: 'Logo de demostración, no corresponde a un cliente real' },
          link: { text: 'Visitar sitio de ejemplo', href: 'https://example.com/?proyecto=plataforma-empresarial', target: '_blank' },
        },
        {
          id: 'demo-aplicacion-movil',
          company: 'Empresa demo · Servicios',
          title: 'Aplicación móvil de atención al cliente',
          category: 'Aplicación móvil · Demo',
          description: 'Proyecto ficticio de una aplicación para consultar servicios, gestionar solicitudes y mantener al usuario informado desde su teléfono.',
          image: { src: '/img/mobile_1.jpg', alt: 'Imagen ilustrativa del proyecto demo de aplicación móvil' },
          logo: { src: '/img/demo-company-logo.svg', alt: 'Logo de demostración, no corresponde a un cliente real' },
          link: { text: 'Visitar sitio de ejemplo', href: 'https://example.com/?proyecto=aplicacion-movil', target: '_blank' },
        },
      ],
      emptyMessage: 'Estamos preparando una selección de proyectos autorizados para publicación. Próximamente podrás conocer aquí las empresas, las soluciones y sus sitios web.',
    },
  },
  {
    id: 'contacto', type: 'text', variant: 'left', visible: true, tone: 'panel',
    content: {
      eyebrow: 'El siguiente paso',
      title: 'Hablemos de lo que tu empresa necesita.',
      description: 'Cuéntanos qué quieres lograr, qué proceso necesitas mejorar o qué producto tienes en mente. Empecemos por entender tu proyecto.',
      actions: site.email ? [{ label: 'Cuéntanos tu proyecto ↗', href: `mailto:${site.email}`, priority: 'primary' }] : [],
      note: site.email ? undefined : 'Próximamente publicaremos nuestros canales de contacto.',
    },
  },
];

export const homeNavigation = homeSections
  .filter((section) => section.visible && section.navigationLabel)
  .map((section) => ({ label: section.navigationLabel!, href: `/#${section.id}` }));
