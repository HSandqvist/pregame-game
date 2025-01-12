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
      uiLabels: { type: Object, default: () => ({})},     // Labels for UI texts, fallback is an empty object
    },
    methods: {
      confirm() {
        this.$emit("confirm");
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
  