export const fadeIn = {
  animate: { opacity: 1, y: 0 },
  initial: { opacity: 0, y: 20 },
  transition: { duration: 0.6, ease: 'easeOut' },
}

export const slideUp = {
  animate: { opacity: 1, y: 0 },
  initial: { opacity: 0, y: 40 },
  transition: { duration: 0.8, ease: 'easeOut' },
}

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}
