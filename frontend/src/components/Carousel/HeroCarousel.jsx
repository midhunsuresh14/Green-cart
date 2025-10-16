import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

const HeroCarousel = ({ images, autoPlay = true, interval = 5000, children }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!autoPlay || images.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, interval, images.length]);

  const slideVariants = {
    enter: {
      opacity: 0,
      scale: 1.05,
    },
    center: {
      opacity: 1,
      scale: 1,
      transition: {
        opacity: { duration: 1.8, ease: [0.25, 0.46, 0.45, 0.94] },
        scale: { duration: 12, ease: 'linear' },
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: {
        opacity: { duration: 1.8, ease: [0.25, 0.46, 0.45, 0.94] },
        scale: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] },
      },
    },
  };

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: { xs: 420, sm: 520, md: 640 },
        display: 'grid',
        alignItems: 'center',
        overflow: 'hidden',
        color: 'common.white',
      }}
    >
      {/* Background Images with Crossfade */}
      <AnimatePresence mode="sync">
        <motion.div
          key={currentIndex}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.35)), url(${images[currentIndex]})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            zIndex: 1,
          }}
        />
      </AnimatePresence>

      {/* Content Overlay */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          height: '100%',
          display: 'grid',
          alignItems: 'center',
        }}
      >
        {children}
      </Box>

      {/* Slide Indicators */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 1,
          zIndex: 3,
        }}
      >
        {images.map((_, index) => (
          <Box
            key={index}
            onClick={() => setCurrentIndex(index)}
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: index === currentIndex ? 'white' : 'rgba(255,255,255,0.5)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: 'white',
                transform: 'scale(1.1)',
              },
            }}
          />
        ))}
      </Box>

      {/* Navigation Arrows */}
      <Box
        onClick={() => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)}
        sx={{
          position: 'absolute',
          left: 20,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 40,
          height: 40,
          borderRadius: '50%',
          backgroundColor: 'rgba(255,255,255,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 3,
          transition: 'all 0.3s ease',
          '&:hover': {
            backgroundColor: 'rgba(255,255,255,0.3)',
            transform: 'translateY(-50%) scale(1.1)',
          },
        }}
      >
        <Box
          component="svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="white"
        >
          <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
        </Box>
      </Box>

      <Box
        onClick={() => setCurrentIndex((prev) => (prev + 1) % images.length)}
        sx={{
          position: 'absolute',
          right: 20,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 40,
          height: 40,
          borderRadius: '50%',
          backgroundColor: 'rgba(255,255,255,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 3,
          transition: 'all 0.3s ease',
          '&:hover': {
            backgroundColor: 'rgba(255,255,255,0.3)',
            transform: 'translateY(-50%) scale(1.1)',
          },
        }}
      >
        <Box
          component="svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="white"
        >
          <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
        </Box>
      </Box>
    </Box>
  );
};

export default HeroCarousel;
