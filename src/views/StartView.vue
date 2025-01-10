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
      <ErrorMessage :message="errorMessage" />
      <button class="btn" @click="attemptJoin">
        {{ uiLabels.participateGame || "Join Game" }}
      </button>
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
import InstructionButton from "@/components/InstructionButton.vue"; //Import InstructionButton component
import ErrorMessage from "../components/ErrorMessage.vue";

import { motionGrowBiggerAndGlow } from "@/assets/motions.ts"; //Import motion settings

// ---- FOR Normal TESTING ----
const socket = io("localhost:3000"); // Initialize WebSocket connection

//const socket = io("172.20.10.2:3000"); // Initialize mutliple joiners

export default {
  name: "StartView",
  components: {
    LanguageSwitcher,
    InstructionButton,
    ErrorMessage,
  },
  data() {
    return {
      uiLabels: {}, // Dynamic UI labels for multilingual support
      lang: localStorage.getItem("lang") || "en", // Language preference
      joinGameClicked: false, // Tracks whether "Join Game" was clicked

      pin: Array(6).fill(""), // Holds the six digits of the PIN
      errorMessage: "", // Error message for invalid Lobby ID

      motionGrowBiggerAndGlow, // Motion settings
    };
  },
  created() {
    // Listen for UI label updates from the server
    socket.on("uiLabels", (labels) => (this.uiLabels = labels));
    // Request initial labels based on the saved language
    socket.emit("getUILabels", this.lang);
  },
  watch: {
    // Watch for when the PIN entry screen is shown
    joinGameClicked(newValue) {
      if (newValue) {
        // Automatically focus the first PIN input box
        this.$nextTick(() => {
          this.$refs["pin-0"][0].focus();
        });
      }
    },
  },
  methods: {
    // Update language when changed in LanguageSwitcher
    updateLanguage(lang) {
      this.lang = lang;
      localStorage.setItem("lang", lang); // Använd "lang" istället
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

    // Handle input to allow only numbers and move to the next box
    handleInput(index, event) {
      const value = event.target.value;
      if (!/^\d$/.test(value)) {
        this.pin[index] = ""; // Clear the input if it's not a number
        return;
      }
      this.pin[index] = value; // Ensure only numbers are set
      if (index < 5) {
        this.$refs[`pin-${index + 1}`][0].focus(); // Move focus to the next box
      }
    },

    // Handle backspace to clear current and focus the previous box
    handleBackspace(index, event) {
      if (event.key === "Backspace") {
        this.pin[index] = ""; // Clear the current box
        if (index > 0) {
          this.$refs[`pin-${index - 1}`][0].focus(); // Move focus to the previous box
        }
      }
    },

    // Attempt to join a lobby
    attemptJoin() {
      const lobbyId = this.pin.join("").trim(); // Concatenate PIN values into a single string

      if (!lobbyId || lobbyId.length < 6) {
        this.errorMessage = "Please enter a valid 6-digit Lobby ID.";
        return;
      }

      // Validate lobby existence
      socket.emit("checkLobbyExists", lobbyId, (response) => {
        if (response.exists) {
          localStorage.removeItem("userId");
          this.$router.push(`/lobby/${lobbyId}`);
        } else {
          this.errorMessage = "Lobby does not exist. Please check the ID.";
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
  height: 100vw;
  width:100vw;
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
  font-family: "Limelight", cursive; /* Match font family from CreateView */
}

/* Container for Join Game input and button */
.join-game-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}

/* PIN input container */
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

/* Button styles */
.btn {
  all: unset; /* Remove all default styles */
  padding: 0.75rem 1.5rem;
  width: 160px;
  background-color: rgb(252, 160, 198);
  color: white;
  text-decoration: none;
  font-size: 18px;
  font-weight: bold;
  border-radius: 0.5rem;
  text-align: center;
  cursor: pointer;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  transition: all 0.2s ease;
  line-height: 1.5; /* Set vertical line height */
  height: auto; /* Avoid fixed height for buttons */
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
  display: flex; /* Arrange buttons in a row */
  flex-direction: column;
  gap: 1rem;
  justify-content: center;
  align-items: center;
  margin-top: 2rem; /* Optional: Add spacing from the title */
}
</style>
