<template>
  <div class="frontpage">
    <!-- Language switcher component -->
    <LanguageSwitcher @language-changed="updateLanguage" />

    <!-- Title of the game -->
    <h1 class="game-title">Pre(game)<sup>2</sup></h1>

    <!-- Show PIN input form if joinGameClicked is true -->
    <PinInput v-if="joinGameClicked" :onPinSubmit="validatePin" />

    <!-- Show action buttons if joinGameClicked is false -->
    <div v-else class="action-buttons">
      <router-link class="btn" to="/create/">
        {{ uiLabels.createGame || "Create Game" }}
      </router-link>
      <button class="btn" v-on:click="showPinEntry">
        {{ uiLabels.participateGame || "Join Game" }}
      </button>
    </div>
  </div>
</template>

<script>
import io from "socket.io-client"; // Import WebSocket library
import PinInput from "@/components/PinInput.vue"; // Import PinInput component
import LanguageSwitcher from "@/components/LanguageSwitcher.vue"; // Import LanguageSwitcher component
const socket = io("localhost:3000"); // Initialize WebSocket connection

export default {
  name: "StartView",
  components: {
    PinInput,
    LanguageSwitcher,
  },
  data: function () {
    return {
      uiLabels: {}, // Dynamic UI labels for multilingual support
      lang: localStorage.getItem("lang") || "en", // Language preference
      joinGameClicked: false, // Tracks whether "Join Game" was clicked
    };
  },
  created: function () {
    // Listen for UI label updates from the server
    socket.on("uiLabels", (labels) => (this.uiLabels = labels));
    // Request initial labels based on the saved language
    socket.emit("getUILabels", this.lang);
  },
  methods: {
    // Update language when changed in LanguageSwitcher
    updateLanguage(lang) {
      this.lang = lang;
      socket.emit("getUILabels", this.lang);
    },
    // Show PIN entry form
    showPinEntry: function () {
      this.joinGameClicked = true;
    },
    // Validate PIN and handle server response
    validatePin(pin) {
      socket.emit("validatePin", pin, (response) => {
        if (response.valid) {
          this.$router.push(`/lobby/${response.pollId}`);
        } else {
          alert("Invalid PIN. Please try again.");
        }
      });
    },
  },
};
</script>

<style scoped>
.frontpage {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  font-family: Arial, sans-serif;
  text-align: center;
  position: relative;
}

/* Style for the game title */
.game-title {
  font-size: 3rem;
  color: #343a40;
  margin-bottom: 2rem;
}

/* Container for action buttons */
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Button styles */
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
.btn:hover {
  background-color: #0056b3;
}
</style>
