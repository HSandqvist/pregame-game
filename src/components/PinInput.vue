<template>
    <div class="pin-container">
      <div class="pin-box-container">
        <input
          v-for="(digit, index) in pinDigits"
          :key="index"
          type="text"
          maxlength="1"
          inputmode="numeric"
          class="pin-box"
          v-model="pinDigits[index]"
          @input="handleInput(index)"
          @keydown.backspace="handleBackspace(index)"
          ref="pinBoxes"
        />
      </div>
      <button class="btn" @click="submitPin">Submit PIN</button>
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    </div>
  </template>
  
  <script>
  export default {
    name: "PinInput",
    props: {
      onPinSubmit: {
        type: Function,
        required: true,
      },
    },
    data() {
      return {
        pinDigits: ["", "", "", "", "", ""], // Holds the 6 PIN digits
        errorMessage: "", // Error message for invalid PIN
      };
    },
    computed: {
      gamePin() {
        return this.pinDigits.join(""); // Combine the digits into a single PIN
      },
    },
    methods: {
      // Handle input for each PIN box
      handleInput(index) {
        const value = this.pinDigits[index];
        // Only allow numbers
        if (!/^\d$/.test(value)) {
          this.pinDigits[index] = ""; // Clear if non-numeric
          return;
        }
        // Move to the next box if a valid number is entered
        if (index < this.pinDigits.length - 1) {
          this.$refs.pinBoxes[index + 1].focus();
        }
      },
      // Handle backspace for each PIN box
      handleBackspace(index) {
        if (this.pinDigits[index] === "" && index > 0) {
          this.$refs.pinBoxes[index - 1].focus();
        }
      },
      // Submit PIN for validation
      submitPin() {
        if (this.gamePin.length !== 6 || this.gamePin.includes("")) {
          this.errorMessage = "Please enter a valid 6-digit PIN.";
        } else {
          this.errorMessage = "";
          this.onPinSubmit(this.gamePin); // Pass PIN to parent
        }
      },
    },
  };
  </script>
  
  <style scoped>
  /* Container for the PIN input and buttons */
  .pin-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }
  
  /* Align all PIN input boxes in a row */
  .pin-box-container {
    display: flex;
    justify-content: center;
    gap: 1rem;
  }
  
  /* Style each PIN input box */
  .pin-box {
    width: 2.5rem;
    height: 2.5rem;
    font-size: 1.5rem;
    text-align: center;
    border: 2px solid #343a40;
    border-radius: 0.5rem;
  }
  
  /* Button for submitting the PIN */
  .btn {
    padding: 0.75rem 1.5rem;
    background-color: #007bff;
    color: white;
    text-decoration: none;
    font-size: 1.2rem;
    border-radius: 0.5rem;
    text-align: center;
    cursor: pointer;
  }
  
  /* Button hover effect */
  .btn:hover {
    background-color: #0056b3;
  }
  
  /* Error message styling */
  .error-message {
    color: red;
    font-size: 0.9rem;
    margin-top: 0.5rem;
  }
  </style>
  