"use client";

import { useEffect, useRef, useState } from "react";
import type { FC } from "react";
import Link from "next/link";
import { ArrowRightIcon, Bars3Icon, XMarkIcon } from "@heroicons/react/24/solid";
import styles from "./Header.module.css";

const Header: FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isMenuOpen) return;

    const closeOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !headerRef.current?.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
        toggleRef.current?.focus();
      }
    };
    const desktop = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = () => {
      if (desktop.matches) setIsMenuOpen(false);
    };

    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    desktop.addEventListener("change", closeOnDesktop);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
      desktop.removeEventListener("change", closeOnDesktop);
    };
  }, [isMenuOpen]);

  return (
    <header
      ref={headerRef}
      className={styles.Header}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setIsMenuOpen(false);
      }}
    >
      <div className={styles.logo}>Ingenix</div>
      <button
        ref={toggleRef}
        type="button"
        className={styles.menuToggle}
        aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={isMenuOpen}
        aria-controls="header-navigation"
        onClick={() => setIsMenuOpen((open) => !open)}
      >
        {isMenuOpen ? <XMarkIcon className={styles.barsIcon} /> : <Bars3Icon className={styles.barsIcon} />}
      </button>
      <nav
        id="header-navigation"
        aria-label="Navegación principal"
        className={`${styles.nav} ${isMenuOpen ? styles.navOpen : ""}`}
        onClick={() => setIsMenuOpen(false)}
      >
        <Link className={styles.link} href="/">Servicios</Link>
        <Link className={styles.link} href="/about">Soluciones</Link>
        <Link className={styles.link} href="/contact">Proyectos</Link>
        <Link className={styles.link} href="/contact">Proceso</Link>
      </nav>
      <Link className={styles.linkContact} href="/contact">
        <span className={styles.button}>
          Hablar con un experto
          <ArrowRightIcon className={styles.icon} />
        </span>
      </Link>
    </header>
  );
};

export default Header;
