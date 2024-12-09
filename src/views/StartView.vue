<template>
  <!-- Main container for the front page -->
  <div class="frontpage">
    <!-- Button to toggle language -->
    <button class="language-switcher" v-on:click="switchLanguage">
      {{ lang === 'en' ? 'Switch to Swedish' : 'Switch to English' }}
    </button>

    <!-- Title of the game -->
    <h1 class="game-title">Pregame<sup>2</sup></h1>

    <!-- Buttons for creating and joining a game -->
    <div class="action-buttons">
      <router-link class="btn" to="/create/">
        {{ uiLabels.createGame || "Create Game" }}
      </router-link>
      <router-link class="btn" to="/lobby/">
        {{ uiLabels.participateGame || "Join Game" }}
      </router-link>
    </div>
  </div>
</template>

<script>
import io from "socket.io-client"; // Import WebSocket library
const socket = io("localhost:3000"); // Initialize WebSocket connection

export default {
  name: "StartView",
  data: function () {
    return {
      uiLabels: {}, // Dynamic UI labels for multilingual support
      lang: localStorage.getItem("lang") || "en", // Language preference
    };
  },
  created: function () {
    // Listen for UI label updates from the server
    socket.on("uiLabels", (labels) => (this.uiLabels = labels));
    // Request initial labels based on the saved language
    socket.emit("getUILabels", this.lang);
  },
  methods: {
    // Toggle between English and Swedish
    switchLanguage: function () {
      // Toggle the language state
      this.lang = this.lang === "en" ? "sv" : "en";
      // Save the new language preference in local storage
      localStorage.setItem("lang", this.lang);
      // Emit the updated language preference to the server
      socket.emit("getUILabels", this.lang);
    },
  },
};
</script>

<style scoped>
/* Center content on the page */
.frontpage {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh; /* Full viewport height */
  background-color: #f8f9fa; /* Light background color */
  font-family: Arial, sans-serif;
  text-align: center;
  position: relative; /* For placing the language button in a corner */
}

/* Button to switch languages */
.language-switcher {
  position: absolute; /* Place in the corner */
  top: 1rem; /* Distance from the top */
  right: 1rem; /* Distance from the right */
  background-color: #007bff; /* Blue background */
  color: white; /* White text */
  border: none; /* No border */
  padding: 0.5rem 1rem; /* Padding */
  border-radius: 0.5rem; /* Rounded corners */
  cursor: pointer; /* Pointer cursor for interactivity */
  font-size: 0.9rem; /* Smaller text size */
}

/* Hover effect for the language switcher */
.language-switcher:hover {
  background-color: #0056b3; /* Darker blue on hover */
}

/* Style for the game title */
.game-title {
  font-size: 3rem; /* Large font size for the title */
  color: #343a40; /* Dark text color */
  margin-bottom: 2rem; /* Space below the title */
}

/* Container for action buttons */
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 1rem; /* Space between buttons */
}

/* Button styles */
.btn {
  padding: 0.75rem 1.5rem; /* Padding for buttons */
  background-color: #007bff; /* Blue background */
  color: white; /* White text */
  text-decoration: none; /* Remove underline */
  font-size: 1.2rem; /* Slightly larger text */
  border-radius: 0.5rem; /* Rounded corners */
  text-align: center;
  width: 200px; /* Fixed button width */
}

/* Hover effect for buttons */
.btn:hover {
  background-color: #0056b3; /* Darker blue on hover */
}
</style>
