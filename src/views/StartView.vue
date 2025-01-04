<template>
  <div class="frontpage">
    <div class="language-switcher-container">
      <!-- Language switcher component -->
      <LanguageSwitcher @language-changed="updateLanguage" />
    </div>
    <!-- Title of the game -->
    <h1 class="game-title">Pre(game)<sup>2</sup></h1>

    <!-- Input field for Lobby ID and Join Game button -->
    <div v-if="joinGameClicked" class="join-game-container">
      <input
        type="text"
        v-model="inputedID"
        placeholder="Enter Lobby ID" 
        class="lobby-input"
        
      />
      <button class="btn" @click="attemptJoin">Join Game</button>
    </div>

    <!-- Show action buttons if not joining a game -->
    <div v-else class="action-buttons">
      <router-link class="btn" to="/create/">{{ uiLabels.createGame || "Create Game" }}</router-link>
      <button class="btn" @click="showPinEntry">{{ uiLabels.participateGame || "Join Game" }}</button>

    </div>
  </div>
</template>

<script>
import io from "socket.io-client"; // Import WebSocket library
import LanguageSwitcher from "@/components/LanguageSwitcher.vue"; // Import LanguageSwitcher component


// ---- FOR Normal TESTING ----
//const socket = io("localhost:3000"); // Initialize WebSocket connection

// ---- FOR ALLOWING OTHERS TO JOIN, CHANGE TO YOUR LOCAL IP ADDRESS ----
const socket = io("192.168.0.195:3000"); // Initialize mutliple joiners

export default {
  name: "StartView",
  components: {
    LanguageSwitcher,
  },
  data() {
    return {
      uiLabels: {}, // Dynamic UI labels for multilingual support
      lang: localStorage.getItem("lang") || "en", // Language preference
      joinGameClicked: false, // Tracks whether "Join Game" was clicked

      inputedID: "", // Holds the entered lobby ID
      errorMessage: "", // Error message for invalid Lobby ID
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
      socket.emit("getUILabels", this.lang);
    },

    // Show Join Game input
    showPinEntry() {
      this.joinGameClicked = true;
    },

    // Attempt to join a lobby
    attemptJoin() {
      const lobbyId = this.inputedID.trim();

      if (!lobbyId) {
        this.errorMessage = "Please enter a valid Lobby ID.";
        alert(this.errorMessage);
        return;
      }
      // Validate lobby existence
      socket.emit("checkLobbyExists", lobbyId, (response) => {
        if (response.exists) {
          localStorage.removeItem("userId");
          this.$router.push(`/lobby/${lobbyId}`);
        } else {
          this.errorMessage = "Lobby does not exist. Please check the ID.";
          alert(this.errorMessage);
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

/* Input field for Lobby ID */
.lobby-input {
  padding: 0.5rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 0.25rem;
  width: 15rem;
  text-align: center;
}

/* Button styles */
.btn {
  all: unset; /* Ta bort alla standardstilar */
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
  line-height: 1.5; /* Ställ in vertikal linjehöjd */
  height: auto; /* Undvik att knappar har en fast höjd */
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

/* Wrapper for LanguageSwitcher */
.language-switcher-container {
  position: absolute;
  top: 1rem; /* Distance from the top */
  right: 1rem; /* Distance from the right */
  display: flex;
  justify-content: flex-end;
  z-index: 10; /* Ensures it stays above other elements */
}

.language-toggle {
  justify-content: flex-end; /* Override center alignment in LanguageSwitcher */
}

</style>
