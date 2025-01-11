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
      transform: "scale(1)", // Original size
    },
    enter: {
      transform: "scale(2)", // Grow to larger size
      transition: {
        duration: 1500, // Time to grow
        easing: "ease-in-out", // Smooth transition
        repeat: 1, // Repeat the animation once
        repeatType: "mirror", // This will make it grow and then shrink back
      },
    },
  };
