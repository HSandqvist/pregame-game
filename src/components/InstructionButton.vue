<template>
    <div class="instruction-button-container">
      <button @click="toggleInstructions" class="instruction-button">
        <span class="instruction-text">?</span>
    </button>

      <div v-if="showInstructions" class="instructions-popup">
        <h3>{{ uiLabels.instructions || "Instructions" }}</h3>
        <p v-html="instructions"></p>
        <button @click="toggleInstructions">X</button>
      </div>
    </div>
  </template>
  
  <script>
  import LanguageSwitcher from "@/components/LanguageSwitcher.vue";


  export default {
    name: "InstructionButton",
    components:{
        LanguageSwitcher,
    },
    props: {
  lang: { type: String, default: "en" },
  viewKey: { type: String, required: true },
  uiLabels: { type: Object, default: () => ({}) },
  showInstructions: { type: Boolean, default: true }, // Ny prop
    },
    
    data() {
      return {
        showInstructions: false,
        labels: {}, // Placeholder for language-specific labels
        };
    },
    computed: {
        instructions() {
      return this.labels?.INSTRUCTIONS?.[this.viewKey] || "No instructions available.";
    },
   
    },
    methods: {
      toggleInstructions() {
        this.showInstructions = !this.showInstructions;
      },
      hideInstructions(){
        if (this.showInstructions){
        this.showInstructions=!this.showInstructions;
        };
      },
      async loadLabels() {
  let response;

  if (this.lang == "en") {
    response = await fetch("/server/data/labels-en.json");
  } else {
    response = await fetch("/server/data/labels-sv.json");
  }

  if (!response.ok) {
    console.error("Failed to load language file:", response.status);
    return;
  }

  this.labels = await response.json();
},
    
    updateLanguage(newLang) {
    this.lang = newLang;
    this.loadLabels();
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
    // Listen for UI label updates from the server
    this.loadLabels();
    },
  };
  </script>
  
  <style scoped>
  .instruction-button-container {
    position: fixed;
    top: 1rem;
    left: 1rem;
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

  .instruction-text:hover {
    transform: scale(1.5); /* Liten zoom vid hover */
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
  