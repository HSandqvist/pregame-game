<template>
  <div class="pin-container">
    <div class="pin-box-container">
      <input
        v-for="(digit, index) in digits"
        :key="index"
        type="text"
        maxlength="1"
        inputmode="numeric"
        class="pin-box"
        :value="digit"
        @input="$emit('input-change', index, $event.target.value)"
        @keydown.backspace="$emit('backspace', index)"
        ref="pinBoxes"
      />
    </div>
    <button class="btn" @click="$emit('submit')">Submit PIN</button>
    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
  </div>
</template>

<script>
export default {
  name: "PinInput",
  props: {
    digits: {
      type: Array,
      required: true,
    },
    errorMessage: {
      type: String,
      default: "",
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
