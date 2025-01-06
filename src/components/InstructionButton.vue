<template>
    <div class="instruction-button-container">
      <button @click="toggleInstructions" class="instruction-button">?</button>
      <div v-if="showInstructions" class="instructions-popup">
        <h3>{{ uiLabels.instructions || "Instructions" }}</h3>
        <p>{{ instructions }}</p>
        <button @click="toggleInstructions">Close</button>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: "InstructionButton",
    props: {
        viewKey: {
        type: String,
        required: true,
    },
    },
    data() {
      return {
        showInstructions: false,
        lang: localStorage.getItem("lang") || "en",
        labels: {}, // Placeholder for language-specific labels
        };
    },
    computed: {
        instructions() {
      return this.labels?.INSTRUCTIONS?.[this.viewKey] || "No instructions available.";
    },
    uiLabels() {
      return this.labels.GENERIC || {};
    },
    },
    methods: {
      toggleInstructions() {
        this.showInstructions = !this.showInstructions;
      },
      async loadLabels() {
      try {
        // Dynamisk sökväg baserat på valt språk
        const response = await fetch(`/server/data/labels-${this.lang}.json`);
        if (response.ok) {
          this.labels = await response.json(); // Ladda JSON-data
        } else {
          console.error("Failed to load language file:", response.status);
        }
      } catch (error) {
        console.error("Error loading labels:", error);
      }
    },
  },
  watch: {
    // Kolla om språket ändras i localStorage och ladda om labels
    lang(newLang, oldLang) {
      if (newLang !== oldLang) {
        this.loadLabels();
      }
    },
  },
    created() {
    console.log("Labels loaded:", this.labels); // Kontrollera att labels innehåller INSTRUCTIONS

    this.loadLabels();
    },
  };
  </script>
  
  <style scoped>
  .instruction-button-container {
    position: fixed;
    top: 10px;
    left: 10px;
    z-index: 1000;
  }
  
  .instruction-button {
    width: 40px;
    height: 40px;
    border: none;
    border-radius: 50%;
    background-color: rgb(252, 160, 198);
    color: white;
    font-size: 24px;
    font-weight: bold;
    cursor: pointer;
    text-align: center;
  }
  
  .instruction-button:hover {
    background-color: rgb(255, 131, 203);
  }
  
  .instructions-popup {
    position: absolute;
    top: 50px;
    left: 0;
    width: 300px;
    background: white;
    border: 2px solid rgb(252, 160, 198);
    border-radius: 8px;
    padding: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  .instructions-popup h3 {
    margin: 0 0 10px;
    color: rgb(252, 63, 173);
  }
  .instructions-popup p {
    color: black;
  }
  
  .instructions-popup button {
    margin-top: 10px;
    background-color: rgb(252, 63, 173);
    color: white;
    border: none;
    border-radius: 5px;
    padding: 5px 10px;
    cursor: pointer;
  }
  </style>
  