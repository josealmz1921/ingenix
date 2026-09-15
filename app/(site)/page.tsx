import Banner from "@/src/components/Banner/Banner.lazy";
import Hero from "@/src/components/Hero/Hero.lazy";
import Carousel from "@/src/components/Carousel/Carousel";
import Card from "@/src/components/Card/Card.lazy";
import TextBlock from "@/src/components/TextBlock/TextBlock.lazy";

import GridCard from '@/src/components/GridCard/GridCard';
import { Progress } from '@/src/components/Progress/Progress';
import { Grid } from '@/src/components/Grid/Grid';
import { Section } from '@/src/components/Section/Section';
import { SectionHeader } from '@/src/components/SectionHeader/SectionHeader';
import {
  CodeBracketIcon,
  ShieldCheckIcon,
  CloudIcon,
  ArrowPathIcon,
  WrenchScrewdriverIcon,
  RocketLaunchIcon,
  ChartBarIcon,
  Cog8ToothIcon
} from "@heroicons/react/24/solid";
import Button from "@/src/components/Button/Button.lazy";
import { HeroProps } from "@/src/components/Hero/HeroProps.types";

const capabilities = [
  {
    title: 'Integraciones',
    description:
      'Conectamos tu software con APIs, servicios externos, sistemas de pago, plataformas de marketing y herramientas empresariales.',
    progress: 75,
    icon: <CodeBracketIcon className="h-6 w-6" />,
  },
  {
    title: 'Automatización',
    description:
      'Convertimos procesos manuales y repetitivos en flujos digitales que ahorran tiempo y reducen errores.',
    progress: 65,
    icon: <Cog8ToothIcon className="h-6 w-6" />,
  },
  {
    title: 'Cloud & Deployment',
    description:
      'Preparamos y desplegamos aplicaciones en infraestructura cloud con ambientes adecuados para desarrollo, pruebas y producción.',
    progress: 70,
    icon: <CloudIcon className="h-6 w-6" />,
  },
  {
    title: 'Seguridad preventiva',
    description:
      'Aplicamos buenas prácticas de seguridad, validación, autenticación y configuración para reducir riesgos y vulnerabilidades comunes.',
    progress: 60,
    icon: <ShieldCheckIcon className="h-6 w-6" />,
  },
  {
    title: 'Modernización',
    description:
      'Ayudamos a evolucionar aplicaciones existentes, actualizar tecnologías y mejorar arquitecturas sin tener que empezar desde cero.',
    progress: 65,
    icon: <ArrowPathIcon className="h-6 w-6" />,
  },
  {
    title: 'Mantenimiento',
    description:
      'Corregimos problemas, actualizamos dependencias y evolucionamos el software conforme cambian las necesidades del negocio.',
    progress: 60,
    icon: <WrenchScrewdriverIcon className="h-6 w-6" />,
  },
  {
    title: 'Analítica & seguimiento',
    description:
      'Integramos herramientas de analítica y medición para entender cómo utilizan tus clientes tus productos digitales.',
    progress: 70,
    icon: <ChartBarIcon className="h-6 w-6" />,
  },
  {
    title: 'Optimización',
    description:
      'Analizamos problemas de rendimiento y optimizamos aplicaciones para mejorar tiempos de carga, consumo de recursos y experiencia de usuario.',
    progress: 65,
    icon: <RocketLaunchIcon className="h-6 w-6" />,
  },
];

export const solutions = [
  {
    img: "/img/mobile_1.jpg",
    title: 'Aplicación móvil',
    description: 'Apps para Android y iOS diseñadas alrededor de las necesidades de tus usuarios y tu negocio.',
    link: 'Ver desarrollo móvil',
  },
  {
    img: "/img/web_site_1.jpg",
    title: 'Página web',
    description: 'Sitios corporativos, landing pages y experiencias digitales rápidas, modernas y adaptadas a cualquier dispositivo.',
    link: 'Crear mi sitio web',
  },
  {
    img: "/img/web_system.jpg",
    title: 'Sistema web',
    description: 'Plataformas, dashboards y herramientas empresariales para digitalizar y simplificar tus procesos.',
    link: 'Crear mi plataforma',
  },
  {
    img: "/img/ecommerce_1.jpg",
    title: 'Tienda online',
    description: 'E-commerce con Shopify y otras tecnologías para ayudarte a vender tus productos y gestionar tu operación.',
    link: 'Crear mi tienda',
  },
  {
    img: "/img/automation.jpg",
    title: 'Automatización',
    description: 'Convertimos tareas repetitivas en procesos digitales que ahorran tiempo y reducen errores.',
    link: 'Automatizar mi negocio',
  },
  {
    img: "/img/integration.png",
    title: 'Integraciones',
    description: 'Conectamos tus aplicaciones, APIs, sistemas de pago y herramientas para que trabajen juntas.',
    link: 'Conectar mis sistemas',
  },
];

export const audiences = [
  {
    img: "/img/entrepreneur.jpg",
    title: 'Emprendedores',
    description: 'Convierte una idea en un producto digital real y empieza a construir tu negocio.',
    link: 'Comenzar un proyecto',
  },
  {
    img: "/img/pymes.jpg",
    title: 'Pequeñas y medianas empresas',
    description: 'Digitaliza procesos y mejora la forma en que trabaja tu equipo.',
    link: 'Digitalizar mi negocio',
  },
  {
    img: "/img/growing_companies.jpg",
    title: 'Empresas en crecimiento',
    description: 'Evoluciona tu tecnología conforme crece tu operación y aparecen nuevos retos.',
    link: 'Impulsar mi negocio',
  },
  {
    img: "/img/tech_team.jpg",
    title: 'Equipos de tecnología',
    description: 'Complementamos equipos existentes para acelerar proyectos y cubrir necesidades específicas.',
    link: 'Trabajar con nosotros',
  },
];

export const engineeringCapabilities = [
  {
    title: 'Code Quality',
    description:
      'Código legible, mantenible y basado en buenas prácticas de desarrollo.',
    img: "/img/architecture.png",
  },
  {
    title: 'Architecture',
    description:
      'Soluciones pensadas para escalabilidad, separación de responsabilidades y evolución futura.',
    img: "/img/architecture.png",
  },
  {
    title: 'Performance',
    description:
      'Aplicaciones optimizadas para ofrecer experiencias rápidas y eficientes.',
    img: "/img/performance.png",
  },
  {
    title: 'Security',
    description:
      'Prácticas de seguridad desde el desarrollo para reducir riesgos y vulnerabilidades.',
    img: "/img/security.png",
  },
  {
    title: 'Testing',
    description:
      'Validación del comportamiento del software para reducir errores antes y después de producción.',
    img: "/img/testing.png",
  },
  {
    title: 'Integrations',
    description:
      'Integraciones confiables entre aplicaciones, APIs y servicios externos.',
    img: "/img/integrations.png",
  },
  {
    title: 'Collaboration',
    description:
      'Control de versiones, revisión de código y procesos que mantienen el desarrollo ordenado.',
    img: "/img/collaboration.png",
  },
  {
    title: 'Business Knowledge',
    description:
      'Entendemos la lógica detrás del negocio antes de convertirla en software.',
    img: "/img/businessKnowledge.png",
  },
];

export const experience = [
  {
    title: 'Servicios financieros y seguros',
    description:
      'Experiencia desarrollando soluciones digitales para productos financieros, seguros, cotizaciones, contratación y procesos relacionados.',
  },
  {
    title: 'E-commerce',
    description:
      'Desarrollo de experiencias de comercio electrónico, catálogos, productos, pagos, checkout e integraciones con servicios externos.',
  },
  {
    title: 'Retail',
    description:
      'Soluciones digitales para operaciones de venta, catálogos, promociones, clientes y procesos comerciales.',
  },
  {
    title: 'Automotriz',
    description:
      'Desarrollo de experiencias digitales relacionadas con productos, servicios y procesos comerciales del sector automotriz.',
  },
  {
    title: 'Manufactura',
    description:
      'Aplicaciones y soluciones digitales orientadas a procesos empresariales y necesidades específicas de operación.',
  },
  {
    title: 'Plataformas empresariales',
    description:
      'Sistemas y aplicaciones para automatizar procesos, integrar servicios y facilitar la operación de equipos.',
  },
];

export const industryExperience = [
  {
    title: 'Seguros',
    description:
      'Experiencia participando en soluciones digitales para productos de seguros, cotizaciones, contratación y experiencias orientadas al cliente.',
  },
  {
    title: 'E-commerce y Retail',
    description:
      'Desarrollo de experiencias de comercio electrónico, catálogos, productos, promociones, pagos, checkout e integraciones.',
  },
  {
    title: 'Automotriz',
    description:
      'Soluciones digitales para productos y servicios del sector automotriz, incluyendo experiencias comerciales y plataformas orientadas al cliente.',
  },
  {
    title: 'Manufactura e Industria',
    description:
      'Desarrollo de soluciones digitales para empresas industriales, procesos empresariales y necesidades específicas de operación.',
  },
  {
    title: 'Alimentos y Consumo',
    description:
      'Experiencia desarrollando soluciones digitales para empresas de productos de consumo, alimentos y servicios relacionados.',
  },
  {
    title: 'Plataformas Empresariales',
    description:
      'Sistemas y aplicaciones orientados a automatizar procesos, integrar servicios y facilitar la operación de equipos y negocios.',
  },
];

export const hero: HeroProps = {
  title: 'Software que convierte ideas en soluciones reales.',
  description:
    'Diseñamos y desarrollamos aplicaciones, sitios web, tiendas online y soluciones digitales a la medida de tu negocio.',
  subtitle:
    'Desarrollo personalizado. Tecnología moderna. Sin soluciones genéricas.',

  image: '/img/hero_1.jpg',
  imageAlt: 'Soluciones digitales',

  alignment: 'center',
  verticalAlignment: 'center',

  parallax: true,

  imageOpacity: 0.35,

  overlay: true,
  overlayOpacity: 0.35,

  actions: [
    {
      label: 'Cuéntanos tu proyecto',
      href: '/contacto',
      priority: 'primary',
      showIcon: true,
    },
    {
      label: 'Ver soluciones',
      href: '/soluciones',
      priority: 'secondary',
      showIcon: false,
    },
  ],
};

export default function Home() {
  return (
    <div className="px-4 md:px-8 lg:px-0">
      <Hero
        {...hero}
      />
      <br />
      <div className="max-w-[1600px] mx-auto">
        <br />
        <br />
        <TextBlock
          align="center"
          title="Soluciones digitales para hacer crecer tu negocio."
          subtitle="Desde una primera idea hasta una plataforma completa, desarrollamos soluciones que se adaptan a la forma en que trabaja tu negocio."
        />
        <br />
        <br />
        <br />
        <Carousel
          slidesToShow={3}
        >
          <Card
            variant="image-top"
            title="Aplicaciones móviles"
            image="/img/mobile_apps.jpg"
            description="Creamos aplicaciones para Android y iOS enfocadas en ofrecer experiencias rápidas, intuitivas y conectadas con tu negocio."
          />
          <Card
            variant="image-top"
            title="Sitios y plataformas web"
            image="/img/web_site.jpg"
            description="Diseñamos y desarrollamos sitios web, plataformas y sistemas personalizados que combinan rendimiento, escalabilidad y una buena experiencia de usuario."
          />
          <Card
            variant="image-top"
            title="E-commerce"
            image="/img/ecommerce.jpg"
            description="Construimos tiendas online y experiencias de comercio electrónico con Shopify y otras tecnologías, desde la implementación hasta las integraciones necesarias."
          />
        </Carousel>
        <br />
        <br />
        <br />
        <Banner
          parallax
          contentAlign="center"
          image="/img/banner_1.jpg"
          imagePosition="background"
          title="Tu idea merece más que una plantilla."
          description="Analizamos lo que tu negocio necesita y construimos software pensado para tus procesos, tus usuarios y tus objetivos."
        />
        <br />
        <br />
        <br />
        <TextBlock
          align="center"
          title="De una idea a software que funciona."
          subtitle="No empezamos escribiendo código. Primero entendemos el problema, definimos la solución y después construimos lo que realmente necesitas."
        />
        <Carousel
          slidesToShow={4}
        >
          <Card
            imageStyle="contain"
            variant="image-top"
            title="Descubrimos"
            image="/img/one.png"
            description="Entendemos tu negocio, tus procesos y el problema que quieres resolver."
          />
          <Card
            imageStyle="contain"
            variant="image-top"
            title="Diseñamos"
            image="/img/two.png"
            description="Definimos la arquitectura, experiencia y funcionalidades necesarias para construir una solución sólida.."
          />
          <Card
            imageStyle="contain"
            variant="image-top"
            title="Construimos"
            image="/img/three.png"
            description="Desarrollamos, integramos y probamos el software utilizando tecnologías modernas y prácticas de ingeniería."
          />
          <Card
            imageStyle="contain"
            variant="image-top"
            title="Evolucionamos"
            image="/img/four.png"
            description="Publicamos, damos mantenimiento y seguimos mejorando el producto conforme crece tu negocio."
          />
        </Carousel>
        <br />
        <br />
        <br />
        <TextBlock
          align="center"
          title="¿Tienes una idea? Podemos construirla."
          subtitle="No necesitas saber qué tecnología utilizar. Cuéntanos qué quieres lograr y nosotros nos encargamos de convertirlo en una solución digital."
        />
        <Carousel
          slidesToShow={4}
        >
          {solutions.map((item) => (
            <Card
              key={item.title}
              variant="featured"
              title={item.title}
              image={item.img}
              description={item.description}
            />
          ))}
        </Carousel>
        <br />
        <br />
        <br />
        <TextBlock
          align="center"
          title="Construimos con empresas que quieren avanzar."
        />
        <Carousel
          slidesToShow={4}
        >
          {audiences.map((item) => (
            <Card
              key={item.title}
              variant="image-top"
              title={item.title}
              image={item.img}
              description={item.description}
            />
          ))}
        </Carousel>
        <br />
        <br />
        <br />
        <Section>
          <SectionHeader
            title="Mucho más que desarrollo."
            description="El software no termina cuando se publica. También podemos ayudarte a integrarlo, protegerlo, optimizarlo y mantenerlo."
          />
          <Grid columns={4} gap={12}>
            {capabilities.map((item) => (
              <GridCard key={item.title}>
                <div>
                  <span className="text-white">{item.icon}</span>
                  <h3 className="text-white">{item.title}</h3>
                </div>
                <p className="text-white">
                  {item.description}
                </p>
                <Progress value={item.progress} />
              </GridCard>
            ))}
          </Grid>
        </Section>
        <br />
        <br />
        <br />
        <TextBlock
          align="center"
          title="Ingeniería detrás de cada solución."
          subtitle="No medimos un proyecto por la cantidad de código escrito. Nos enfocamos en construir software mantenible, seguro y preparado para evolucionar."
        />
        <Carousel
          slidesToShow={3}
          autoplay
        >
          {engineeringCapabilities.map((item) => (
            <Card
              key={item.title}
              variant="image-left"
              title={item.title}
              image={item.img}
              imageStyle="contain"
              description={item.description}
            />
          ))}
        </Carousel>
        <br />
        <br />
        <br />
        <Section>
          <SectionHeader
            title="Experiencia adquirida en proyectos reales de alto impacto."
            description="Parte de nuestro trabajo profesional se ha desarrollado para empresas cuyos proyectos y activos digitales están sujetos a acuerdos de confidencialidad. Por respeto a nuestros clientes y sus contratos, no publicamos información privada ni material propietario. Sin embargo, podemos hablar de nuestra experiencia técnica y de los problemas que hemos resuelto."
          />
          <Grid columns={3} gap={12}>
            {experience.map((item) => (
              <GridCard key={item.title}>
                <div>
                  <h3 className="text-white">{item.title}</h3>
                </div>
                <p className="text-white mb-4">
                  {item.description}
                </p>
                <Progress value={80} />
              </GridCard>
            ))}
          </Grid>
        </Section>
        <br />
        <br />
        <br />
        <Banner
          contentAlign="center"
          image="/img/hero-image.jpg"
          imagePosition="left"
          title="¿Ya tienes un proyecto en mente?"
          description="Cuéntanos qué necesitas, qué problema quieres resolver o simplemente qué tienes en mente. Nosotros te ayudamos a definir el siguiente paso."
          children={
            <div>
              <div className="flex justify-center"></div>
              <Button type="button" priority="primary">
                Cuéntanos tu proyecto
              </Button>
            </div>
          }
        />
      </div>
    </div>
  );
}
