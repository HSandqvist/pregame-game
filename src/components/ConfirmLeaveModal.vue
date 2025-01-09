<template>
  <div v-if="show" class="modal-overlay">
    <div class="modal-content">
      <p>
        {{
          this.uiLabels.sureLeaveGame ||
          "Are you sure you want to leave the poll?"
        }}
      </p>
      <button @click="confirm">{{ this.uiLabels.yes || "Yes" }}</button>
      <button @click="cancel">{{ this.uiLabels.no || "No" }}</button>
    </div>
  </div>
</template>

<script>
import io from "socket.io-client";
const socket = io("localhost:3000");

export default {
  props: {
    show: Boolean,
    lang: Object,
  },
  data: function () {
    return {
      //lang: {}, // Language preference
      uiLabels: {}, // UI labels for different languages}
    };
  },
  created: function () {
    // Listen for server events
    socket.on("uiLabels", (labels) => (this.uiLabels = labels)); // Update UI labels
    if (this.lang) {
    socket.emit("getUILabels", this.lang);
  }

  },
  methods: {
    confirm() {
      this.$emit("confirm");
    },
    cancel() {
      this.$emit("cancel");
    },
  },
};
</script>

<style>
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
}
.modal-content {
  background: rgb(252, 160, 198);
  padding: 1.5rem;
  border-radius: 5px;
  border: 0.2rem solid rgb(248, 99, 161);
  text-align: center;
}

.modal-content button {
  background: rgb(248, 99, 161);
  border-radius: 1rem;
  border: 0.01rem solid rgb(243, 68, 141);
  padding: 10px;
  font-weight: bold;
  font-size: 1.2em;
  color: white;
  margin: 0 0.5rem; /* Horizontal spacing between buttons */
}

.modal-content button:hover {
  background: rgb(254, 70, 147);
  cursor: pointer;
}
.modal-content p {
  color: black; /* Ensure the text is a visible color */
  font-size: 1.1em; /* Make text readable */
  margin: 1rem 0; /* Add spacing */
}
</style>
