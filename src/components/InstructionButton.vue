<template>
  <div class="instruction-button-container">
    <button @click="toggleInstructions" class="instruction-button">
      <span class="instruction-text">?</span>
    </button>

    <div v-if="showInstructions" class="instructions-popup">
      <h3>{{ instructionsTitle }}</h3>
      <p v-html="instructions"></p>
      <button @click="toggleInstructions">X</button>
    </div>
  </div>
</template>

<script>
export default {
  name: "InstructionButton",
  props: {
    viewKey: { type: String, required: true },
    uiLabels: { type: Object, default: () => ({}) },
  },

  data() {
    return {
      showInstructions: false,
    };
  },
  computed: {
    instructions() {
      return (
        this.uiLabels?.INSTRUCTIONS?.[this.viewKey] ??
        "No instructions available."
      );
    },
    instructionsTitle() {
      return (
        this.uiLabels?.instructions || 
        "Instructions" 
      );
    },
  },
  methods: {
    toggleInstructions() {
      this.showInstructions = !this.showInstructions;
    },
    hideInstructions() {
      if (this.showInstructions) {
        this.showInstructions = !this.showInstructions;
      }
    },
  }
};
</script>

<style scoped>
.instruction-button-container {
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 1010;
}

.instruction-button {
  width: 2.5rem;
  height: 2.5rem;
  padding: 0;
  border-radius: 50%;
  background-color: rgb(252, 160, 198);
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
  display: flex;
  cursor: pointer;
  justify-content: center; /* Horisontell centrering */
  align-items: center; /* Vertikal centrering */
  box-sizing: border-box; /* Säkerställer att padding inte påverkar storleken */
}

.instruction-button:hover {
  background-color: rgb(255, 131, 203);
}

.instruction-text:hover {
  transform: scale(1.2); /* Liten zoom vid hover */
}
.instructions-popup {
  position: absolute;
  top: 3.2rem;
  left: 0;
  width: 18.8rem;
  background: white;
  border: 0.2rem solid rgb(252, 160, 198);
  border-radius: 0.5rem;
  padding: 0.7rem;
  box-shadow: 0 0.3rem 0.4rem rgba(0, 0, 0, 0.1);
}

.instructions-popup h3 {
  margin: 0 0 0.6rem;
  color: rgb(252, 63, 173);
}
.instructions-popup p {
  color: black;
}

.instructions-popup button {
  margin-top: 0.6rem;
  background-color: rgb(252, 63, 173);
  color: white;
  border: none;
  border-radius: 0.3rem;
  padding: 0.1rem 0.8rem;
  font-size: 1rem;
  cursor: pointer;
}
.instructions-popup button:hover {
  transform: scale(1.1); /* Liten zoom vid hover */
}
</style>
