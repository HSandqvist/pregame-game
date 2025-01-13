<template>
  <div class="frontpage">
    <div>
      <InstructionButton
        ref="instructionButton"
        :uiLabels="uiLabels"
        :lang="lang"
        viewKey="STARTVIEW"
      />

      <!-- Language switcher component -->
      <LanguageSwitcher @language-changed="updateLanguage" />

      <!-- Title of the game -->
      <h1 class="game-title" v-motion="motionGrowBiggerAndGlow">
        Pre(game) <sup>2</sup>
      </h1>
    </div>
    <!-- Input field for Lobby ID and Join Game button -->
    <div v-if="joinGameClicked" class="join-game-container">
      <InstructionButton
        :uiLabels="uiLabels"
        :lang="lang"
        :showInstructions="false"
        viewKey="PINVIEW"
      />
      <PinInput :pin-length="6" @pin-updated="updatePin" />
      <ErrorMessage :message="errorMessage" />
      <button class="btn" @click="attemptJoin" :disabled="isLobbyFull">
        {{ uiLabels.participateGame || "Join Game" }}
      </button>

      <div class="back-to-start">
        <button @click="goToStartPage">
          {{ this.uiLabels.backToStart || "Back to Start" }}
        </button>
      </div>
    </div>

    <!-- Show action buttons if not joining a game -->
    <div v-else class="action-buttons">
      <router-link class="btn" to="/create/">{{
        uiLabels.createGame || "Create Game"
      }}</router-link>
      <button class="btn" @click="showPinEntry">
        {{ uiLabels.participateGame || "Join Game" }}
      </button>
    </div>
  </div>
</template>

<script>
import io from "socket.io-client"; // Import WebSocket library
import LanguageSwitcher from "@/components/LanguageSwitcher.vue"; // Import LanguageSwitcher component
import InstructionButton from "@/components/InstructionButton.vue"; // Import InstructionButton component
import ErrorMessage from "@/components/modals/ErrorMessage.vue";
import PinInput from "@/components/PinInput.vue"; // Import PinInput component

import { motionGrowBiggerAndGlow } from "@/assets/motions.ts"; // Import motion settings

// ---- FOR Normal TESTING ----
const socket = io("localhost:3000"); // Initialize WebSocket connection

//const socket = io("172.20.10.2:3000"); // Initialize multiple joiners

export default {
  name: "StartView",
  components: {
    LanguageSwitcher,
    InstructionButton,
    ErrorMessage,
    PinInput,
  },
  data() {
    return {
      uiLabels: {}, // Dynamic UI labels for multilingual support
      lang: localStorage.getItem("lang") || "en", // Language preference
      joinGameClicked: false, // Tracks whether "Join Game" was clicked

      pin: "", // Store the complete PIN as a string
      errorMessage: "", // Error message for invalid Lobby ID

      motionGrowBiggerAndGlow, // Motion settings
      isLobbyFull: false,
    };
  },
  created() {
    // Listen for UI label updates from the server
    socket.on("uiLabels", (labels) => (this.uiLabels = labels));
    // Request initial labels based on the saved language
    socket.emit("getUILabels", this.lang);
  },
  methods: {
    // Update language when changed in LanguageSwitcher
    updateLanguage(lang) {
      this.lang = lang;
      localStorage.setItem("lang", lang); // Save "lang" to localStorage
      socket.emit("getUILabels", this.lang);
    },
    hideInstructions() {
      this.$refs.instructionButton.hideInstructions();
    },

    // Show Join Game input
    showPinEntry() {
      this.joinGameClicked = true;
      this.$refs.instructionButton.hideInstructions();
    },

    // Handle updated PIN from PinInput
    updatePin(updatedPin) {
      this.pin = updatedPin;
    },

    // Attempt to join a lobby
    attemptJoin() {
      const lobbyId = this.pin.trim(); // Trim the concatenated PIN

      if (!lobbyId || lobbyId.length < 6) {
        this.errorMessage = "Please enter a valid 6-digit Lobby ID.";
        return;
      }

      // Validate lobby existence and participant count
      socket.emit("checkLobbyExists", lobbyId, (response) => {
        if (!response.exists) {
          this.errorMessage = "Lobby does not exist. Please check the ID.";
        } else if (response.isFull) {
          this.errorMessage = "Lobby is full. Please try another lobby.";
          this.isLobbyFull = true; // Update the full lobby status
        } else {
          this.isLobbyFull = false; // Reset if not full
          localStorage.removeItem("userId");
          this.$router.push(`/lobby/${lobbyId}`);
        }
      });
    },

    goToStartPage: function () {
      this.$router.go(0);
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
  height: 100vw;
  width: 100vw;
  font-family: Arial, sans-serif;
  text-align: center;
  position: relative;
  color: white;
}

/* Style for the game title */
.game-title {
  font-size: 3rem;
  color: rgb(255, 205, 226);
  margin-bottom: 2rem;
  font-family: "Limelight", cursive;
  min-width: 20rem;
}

/* Container for Join Game input and button */
.join-game-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}

/* Button styles */
.btn {
  all: unset;
  padding: 0.9rem 1.2rem;
  width: 160px;
  background-color: rgb(252, 160, 198);
  color: white;
  text-decoration: none;
  font-size: 18px;
  font-weight: bold;
  border-radius: 0.7rem;
  text-align: center;
  cursor: pointer;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  transition: all 0.2s ease;
  line-height: 1.5;
  height: auto;
}

.btn:hover {
  background-color: rgb(255, 131, 203);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Container for action buttons */
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  justify-content: center;
  align-items: center;
  margin-top: 2rem;
}

/* Back to start page button */
.back-to-start {
  position: fixed;
  bottom: 3rem;
  left: 3rem;
}
</style>