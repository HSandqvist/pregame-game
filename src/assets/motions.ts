export const motionGlowText = {
  initial: {
    "text-shadow": "0 0 0px rgba(252, 166, 206, 1)", // No glow 255, 145, 195
  },
  enter: {
    "text-shadow": "0 0 20px rgba(252, 166, 206, 1)", // Bright light pink glow
    transition: {
      duration: 1000, // 1 second
      repeat: Infinity,
      repeatType: "reverse",
    },
  },
};

export const motionGrowBiggerAndGlow = {
  initial: {
    "text-shadow": "0 0 0px rgba(255, 107, 174, 1)", // No glow 255, 145, 195
    transform: "scale(0.7)", // Original size
  },
  enter: {
    "text-shadow": "0 0 10px rgba(255, 107, 174, 1)", // Bright pink glow
    transform: "scale(1.2)", //larger size
    transition: {
      delay: 1000, // Delay of 1 seconds
      duration: 2500, // 2 seconds
    },
  },
};

export const motionGrowBigger = {
  initial: {
    transform: "scale(0.9)", // Original size
  },
  enter: {
    transform: "scale(1.1)", // Grow to larger size
    transition: {
      duration: 1500, // Time to grow
      easing: "ease-in-out", // Smooth transition
      repeat: 1, // Repeat the animation once
      repeatType: "mirror", // This will make it grow and then shrink back
    },
  },
};

export const motionGlowNeon = {
  initial: {
    boxShadow: "0 0 10px rgba(232, 218, 239, 1)", // No glow 255, 145, 195
  },
  enter: {
    boxShadow: "0 0 50px rgba(255, 188, 246, 1)", // Bright light pink glow
    transition: {
      duration: 1000, // 1 second
      repeat: Infinity,
      repeatType: "reverse",
    },
  },
};

export const popEffect = {
  initial: {
    scale: 0.5,
    opacity: 0,
  },
  enter: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 10,
    },
  },
  leave: {
    scale: 0.5,
    opacity: 0,
  },
};

export const slowPopEffect = {
  initial: {
    scale: 0.5,
    opacity: 0,
  },
  enter: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 7,
    },
  },
  leave: {
    scale: 0.5,
    opacity: 0,
  },
};
