<template>
  <div class="language-switcher-container">
  <div class="language-toggle">
    <!-- English Flag Button -->
    <button
      class="flag-button"
      :class="{ active: lang === 'en' }"
      @click="switchLanguage('en')"
    >
      <img
        src="/src/assets/img/flagEng.png"
        alt="English Flag"
        class="flag-icon"
      />
    </button>

    <!-- Swedish Flag Button -->
    <button
      class="flag-button"
      :class="{ active: lang === 'sv' }"
      @click="switchLanguage('sv')"
    >
      <img
        src="/src/assets/img/flagSwe.png"
        alt="Swedish Flag"
        class="flag-icon"
      />
    </button>
  </div>
</div>
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
    switchLanguage(language) {
      if (this.lang !== language) {
        this.lang = language;
        localStorage.setItem("lang", this.lang);
        this.$emit("language-changed", this.lang); // Emit an event when the language changes
      }
    },
  },
};
</script>

<style scoped>
.language-toggle {
  position: fixed;
  top: 1rem;
  right: 1rem; /* Right side for the language switcher */
  z-index: 9999;
  display: flex;
  gap: 0.8rem;
  align-items: center;
  justify-content: center;
}

.flag-button {
 width: 2.5rem;
 height: 2.5rem;
 border: none;
 border-radius: 50%;
 overflow: hidden;
 padding: 0;
 cursor: pointer;
 display: flex;
 align-items: center;
 justify-content: center;
 transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.flag-button:hover {
 transform: scale(1.1);
 box-shadow: 0 0.4rem 0.6rem rgba(0, 0, 0, 0.2);
}

.flag-icon {
 width: 100%;
 height: 100%;
 object-fit: cover;
}

.flag-button.active {
 box-shadow: 0 0 0 3px #007bff; /* Highlight the active language */
}

</style>
