"use client";
import { useEffect, useState, useRef } from "react";
import type { FC } from 'react';
import styles from './Header.module.css';
import Link from 'next/link';
import { ArrowRightIcon, Bars3Icon } from '@heroicons/react/24/solid'
import { useIsMobile } from '@/src/hooks/useIsMobile';

interface HeaderProps { }

const Header: FC<HeaderProps> = () => {

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMobile = useIsMobile(1024);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const useOutsideAlerter = (ref: any) => {
    useEffect(() => {
      function handleClickOutside(event: any) {
        if (ref.current && !ref.current.contains(event.target)) {
          setIsMenuOpen(false);
        }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [ref]);
  }

  const wrapperRef = useRef(null);
  useOutsideAlerter(wrapperRef);

  return (
    <div className={styles.Header}>
      <div className={styles.logo}>Ingenix</div>
      {
        ((isMobile && isMenuOpen) || !isMobile) && (
          <nav ref={wrapperRef} className={styles.nav}>
            <Link className={styles.link} href="/">Servicios</Link>
            <Link className={styles.link} href="/about">Soluciones</Link>
            <Link className={styles.link} href="/contact">Proyectos</Link>
            <Link className={styles.link} href="/contact">Proceso</Link>
          </nav>
        )
      }
      <Link className={styles.linkContact} href="/contact">
        <button className={styles.button}>
          Hablar con un experto
          <ArrowRightIcon className={styles.icon} />
        </button>
      </Link>
      <Bars3Icon onClick={toggleMenu} className={styles.barsIcon} />
    </div>
  )
};

export default Header;
