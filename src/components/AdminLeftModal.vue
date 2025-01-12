<template>
    <div v-if="show" class="modal-overlay">
      <div class="modal-content">
        <p>
          <!-- Display the message, with a fallback if no label is provided -->
          {{
            this.uiLabels.adminLeftGame ||
            "Admin has ended game."
          }}
        </p>
        <!-- Button for confirming the action -->
        <button @click="confirm">{{ this.uiLabels.ok || "Okey" }} </button>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      show: Boolean,
      lang: {type: String, default: "en"},     // Language setting, default is English
      uiLabels: { type: Object, default: () => ({})},     // Labels for UI texts, fallback is an empty object
    },
    data: function () {
      return {
          labels: {}, // placeholder for labels for different languages
      };
    },
    created: function () {
      this.loadLabels();
    },
    methods: {
      confirm() {
        this.$emit("confirm");
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
  };
  </script>
  
  <style scoped>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10011;
  }
  .modal-content {
    background: rgb(252, 160, 198);
    padding: 1.5rem;
    border-radius: 0.3rem;
    border: 0.2rem solid rgb(248, 99, 161);
    text-align: center;
  }
  
  .modal-content button {
    background: rgb(248, 99, 161);
    border: 0.01rem solid rgb(243, 68, 141);
    font-size: 1.2em;
    margin: 0 0.5rem; /* Horizontal spacing between buttons */
  }
  
  .modal-content button:hover {
    background: rgb(254, 70, 147);
    transform: scale(1.1);
  }
  .modal-content p {
    color: black; /* Ensure the text is a visible color */
    font-size: 1.1em; /* Make text readable */
    margin: 1rem 0; /* Add spacing */
  }
  </style>
  