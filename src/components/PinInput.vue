<template>
  <div class="pin-input-container">
    <input
      v-for="(value, index) in pin"
      :key="index"
      type="text"
      maxlength="1"
      class="pin-input"
      v-model="pin[index]"
      :ref="'pin-' + index"
      @input="handleInput(index, $event)"
      @keydown="handleBackspace(index, $event)"
    />
  </div>
</template>

<script>
export default {
  name: "PinInput",
  props: {
    pinLength: {
      type: Number,
      default: 6, // Default PIN length
    },
  },
  data() {
    return {
      pin: Array(this.pinLength).fill(""), // Initialize PIN array based on length
    };
  },
  emits: ["pin-updated"],
  methods: {
    handleInput(index, event) {
      const value = event.target.value;
      if (!/^\d$/.test(value)) {
        this.pin[index] = ""; // Clear invalid input
        return;
      }
      this.pin[index] = value;
      if (index < this.pinLength - 1) {
        this.$refs[`pin-${index + 1}`][0].focus(); // Move focus to next box
      }
      this.$emit("pin-updated", this.pin.join("")); // Emit updated PIN
    },
    handleBackspace(index, event) {
      if (event.key === "Backspace") {
        this.pin[index] = ""; // Clear current box
        if (index > 0) {
          this.$refs[`pin-${index - 1}`][0].focus(); // Focus previous box
        }
        this.$emit("pin-updated", this.pin.join("")); // Emit updated PIN
      }
    },
    focusFirstInput() {
      this.$nextTick(() => {
        const firstInput = this.$refs["pin-0"]?.[0];
        if (firstInput) firstInput.focus(); // Focus the first input box
      });
    },
  },
  mounted() {
    this.focusFirstInput(); // Automatically focus the first input box when mounted
  },
};
</script>

<style scoped>
/* Same styles as before */
.pin-input-container {
  display: flex;
  gap: 0.5rem;
}

.pin-input {
  width: 2rem;
  height: 2rem;
  text-align: center;
  font-size: 1.5rem;
  border: 1px solid #ccc;
  border-radius: 0.25rem;
}

.pin-input:focus {
  border-color: #007bff;
  outline: none;
}
</style>
