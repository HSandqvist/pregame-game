<template>
    <button class="language-switcher" @click="switchLanguage">
      {{ lang === 'en' ? 'Switch to Swedish' : 'Switch to English' }}
    </button>
  </template>
  
  <script>
  export default {
    name: "LanguageSwitcher",
    data() {
      return {
        lang: localStorage.getItem("lang") || "en", // Language preference
      };
    },
    methods: {
      switchLanguage() {
        this.lang = this.lang === "en" ? "sv" : "en";
        localStorage.setItem("lang", this.lang);
        this.$emit("language-changed", this.lang); // Emit an event when the language changes
      },
    },
  };
  </script>
  
  <style scoped>
  .language-switcher {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background-color: #007bff;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    cursor: pointer;
    font-size: 0.9rem;
  }
  .language-switcher:hover {
    background-color: #0056b3;
  }
  </style>
  