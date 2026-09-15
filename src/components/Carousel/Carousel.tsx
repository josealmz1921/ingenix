'use client';

import { useEffect, useState, type FC, type ReactNode } from 'react';
import Slider, { type Settings } from 'react-slick';

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

import styles from './Carousel.module.css';

interface CarouselProps extends Settings {
  children: ReactNode;
  className?: string;
}

const getSlidesToShow = (slidesToShow: number): number => {
  const width = window.innerWidth;

  if (width < 480) {
    return 1;
  }

  if (width < 768) {
    return Math.min(slidesToShow, 2);
  }

  if (width < 992) {
    return Math.min(slidesToShow, 3);
  }

  if (width < 1200) {
    return Math.min(slidesToShow, 4);
  }

  return slidesToShow;
};

const Carousel: FC<CarouselProps> = ({
  children,
  className,
  slidesToShow = 1,
  slidesToScroll = 1,
  responsive,
  ...settings
}) => {
  const [currentSlidesToShow, setCurrentSlidesToShow] =
    useState(slidesToShow);

  useEffect(() => {
    const updateSlidesToShow = () => {
      setCurrentSlidesToShow(getSlidesToShow(slidesToShow));
    };

    updateSlidesToShow();

    window.addEventListener('resize', updateSlidesToShow);

    return () => {
      window.removeEventListener('resize', updateSlidesToShow);
    };
  }, [slidesToShow]);

  const carouselSettings: Settings = {
    slidesToShow: currentSlidesToShow,
    slidesToScroll,
    infinite: true,
    arrows: true,
    dots: false,
    autoplay: false,
    speed: 500,

    ...settings,

    responsive: responsive ?? [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: Math.min(slidesToShow, 4),
        },
      },
      {
        breakpoint: 992,
        settings: {
          slidesToShow: Math.min(slidesToShow, 3),
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: Math.min(slidesToShow, 2),
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  return (
    <div className={`${styles.Carousel} ${className ?? ''}`}>
      <Slider {...carouselSettings}>
        {children}
      </Slider>
    </div>
  );
};

export default Carousel;