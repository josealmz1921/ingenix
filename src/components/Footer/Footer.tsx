import type { FC } from 'react';
import styles from './Footer.module.css';

interface FooterProps {}

const Footer: FC<FooterProps> = () => (
  <footer className={styles.footer}>
    <div className={styles.container}>
      <div className={styles.brand}>
        <h2>Ingenix</h2>

        <p>
          Soluciones digitales para empresas que buscan crecer,
          optimizar y transformar sus procesos.
        </p>
      </div>

      <div className={styles.column}>
        <h3>Servicios</h3>

        <a href="/services/web-development">Desarrollo Web</a>
        <a href="/services/mobile-apps">Apps Móviles</a>
        <a href="/services/software">Software</a>
        <a href="/services/ecommerce">E-commerce</a>
      </div>

      <div className={styles.column}>
        <h3>Empresa</h3>

        <a href="/about">Nosotros</a>
        <a href="/projects">Proyectos</a>
        <a href="/industries">Industrias</a>
        <a href="/contact">Contacto</a>
      </div>

      <div className={styles.column}>
        <h3>Contacto</h3>

        <a href="mailto:hello@brandname.com">
          hello@brandname.com
        </a>

        <a href="/contact">Solicitar cotización</a>

        <div className={styles.socials}>
          {/* <a href="#">LinkedIn</a>
          <a href="#">GitHub</a> */}
        </div>
      </div>
    </div>

    <div className={styles.bottom}>
      <p>
        © {new Date().getFullYear()} Ingenix. Todos los derechos reservados.
      </p>

      <div className={styles.legal}>
        <a href="/privacy">Privacidad</a>
        <a href="/terms">Términos y condiciones</a>
      </div>
    </div>
  </footer>
);

export default Footer;
