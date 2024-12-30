<template>
  <div class="frontpage">
    <!-- Language switcher component -->
    <LanguageSwitcher @language-changed="updateLanguage" />

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
      <router-link class="btn" to="/create/">
        {{ uiLabels.createGame || "Create Game" }}
      </router-link>
      <button class="btn" @click="showPinEntry">
        {{ uiLabels.participateGame || "Join Game" }}
      </button>
    </div>
  </div>
</template>

<script>
import io from "socket.io-client"; // Import WebSocket library
import LanguageSwitcher from "@/components/LanguageSwitcher.vue"; // Import LanguageSwitcher component
const socket = io("localhost:3000"); // Initialize WebSocket connection

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
          localStorage.removeItem("userId")
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

/* Container for action buttons */
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
