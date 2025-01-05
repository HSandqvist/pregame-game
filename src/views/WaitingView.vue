<template>
  <div class="global-music-control">
    <button @click="toggleMusic">
      {{ isMusicPlaying ? "Turn Music Off" : "Turn Music On" }}
    </button>
  </div>
  <div class="center-container">
    <div class="language-switcher-container">
      <!-- Language switcher component -->
      <LanguageSwitcher @language-changed="updateLanguage" />
    </div>
    

    <!-- Step 4: Show waiting area with other participants -->
    <div class="waiting-area">
      <h1>{{ this.uiLabels.lobbyForPoll || "Lobby for poll" }}: {{ pollId }}</h1>
      <h2>{{ this.uiLabels.numberOfPlayers || "Number of players" }}: {{ participants.length }}</h2>
      <h3>{{ this.uiLabels.players || "Players" }}:</h3>

      <!-- Participants grid -->
      <div class="participants-grid">
        <div
          v-for="(participant, index) in participants"
          :key="index"
          :class="[
            'participant-item',
            { 'current-user': participant.userId === userId },
          ]"
        >
          <!-- Participant avatar -->
          <img
            :src="participant.avatar"
            alt="User Avatar"
            class="avatar"
            :class="{ host: participant.isAdmin }"
          />

          <p>{{ participant.name }}</p>
        </div>
      </div>

      <!-- Actions -->
      <div class="submit-section">
        <button
          v-if="isAdmin"
          v-on:click="adminStartGame"
          :disabled="!joined || !atLeastThree"
        >
          {{ this.uiLabels.startGame || "Start Game" }}
        </button>

        <!-- Leave Poll Button -->
        <button v-on:click="leavePoll" :disabled="!joined || isAdmin">
          {{ this.uiLabels.leaveLobby || "Leave Lobby" }}
        </button>
        
      </div>
    </div>
  </div>

  <audio ref="backgroundMusic" loop>
    <source :src="lobbyviewMusic" type="audio/mpeg" />
    Your browser does not support the audio element.
  </audio>
</template>

<script>
import io from "socket.io-client";
import lobbyviewMusic from "@/assets/lobbyviewMusic/lobbyviewMusic.mp3";
import LanguageSwitcher from "@/components/LanguageSwitcher.vue"; // Import LanguageSwitcher component

const socket = io("localhost:3000");

// ---- FOR ALLOWING OTHERS TO JOIN, CHANGE TO YOUR LOCAL IP ADDRESS ----
//const socket = io("172.20.10.2:3000"); // Initialize mutliple joiners

export default {
  name: "WaitingView",
  components: {
    LanguageSwitcher,
  },
  data: function () {
    return {
      step: 1, // Tracks the current step
      pollId: "inactive poll", // Placeholder for poll ID

      //user
      userId: "", //alla ha egen sida sen hej
      userName: "", // User's name
      joined: false, // If the user has joined
      avatar: null, // Avatar image data
      isAdmin: false, //flag for admin status, deklarerad här nu men tror det ska göras lite annorlunda
      adminId: null, //placeholder for eventual adminId, if present
      choseCustomAvatar: false,

      uiLabels: {}, // UI labels for different languages
      lang: localStorage.getItem("lang") || "en", // Language preference
      participants: [],
      atLeastThree: false,

      //music
      isMusicPlaying: false,
    };
  },
  created: function () {
    // Set the poll ID from the route parameter
    this.pollId = this.$route.params.id;

    //set user id
  

    // Listen for server events
    socket.on("uiLabels", (labels) => (this.uiLabels = labels)); // Update UI labels
    socket.emit("getUILabels", this.lang);


    socket.on("participantsUpdate", (p) => {
      this.participants = p;
      this.checkAtLeastThree(); // Ensure the check runs after the participants array is updated
      //console.log("participants är", this.participants);
    });

    


    //Listen for start game from server
    socket.on("startGame", () => this.participantStartGame());

    // Navigate to the poll page when the poll starts
    socket.on("startPoll", () => this.$router.push("/poll/" + this.pollId));

    // Emit events to join the poll and get UI labels
    socket.emit("joinPoll", { pollId: this.pollId });
  },

  methods: {
    // Update language when changed in LanguageSwitcher
    updateLanguage(lang) {
      this.lang = lang;
      socket.emit("getUILabels", this.lang);
    },

    leavePoll() {
      // Emit an event to the server to remove the participant
      socket.emit("leavePoll", {
        pollId: this.pollId,
        userId: this.userId,
      });

      // Reset local state
      this.joined = false;
      this.userName = "";
      this.avatar = null;
      this.step = 1; // Go back to the first step

      // Optionally, navigate back to the start view
      if (!this.isAdmin) {
        this.$router.push("/");
      }
    },
    // Move to the next step
  
    adminStartGame: function () {
      socket.emit("startGame", this.pollId);
    },

    participantStartGame: function () {
      this.$router.push(`/poll/${this.pollId}/${this.userId}`);
    },

    // Function to check if the user is an admin
    // Move to the previous step
  
    toggleMusic: function () {
      const audio = this.$refs.backgroundMusic;
      if (!audio) {
        console.error("Audio element not found!");
        return;
      }

      audio.volume = 1.0; // Full volym (värde mellan 0.0 och 1.0)

      if (this.isMusicPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
      this.isMusicPlaying = !this.isMusicPlaying;
    },

    // Handle manual avatar upload
    handleAvatarUpload: function (event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          this.avatar = reader.result;
        };
        reader.readAsDataURL(file); // Convert image to base64
      }
    },

    // Participate in the poll
    participateInPoll: function () {
      //if (!this.avatar) {
      //alert("Please select or capture an avatar!");
      //return;
      //}

      socket.emit("participateInPoll", {
        userId: this.userId,
        pollId: this.pollId,
        name: this.userName,
        avatar: this.avatar,
        isAdmin: this.isAdmin,
      });

      this.joined = true;
      if (this.participants.length >= 3) {
        this.atLeastThree = true;
      }

      this.nextStep(); //hoppa till nästa steg
    },

    checkAtLeastThree: function () {
      if (this.participants.length >= 3) {
        this.atLeastThree = true;
      }
    },
  },
};
</script>

<style scoped>
/* Utility class for centering containers */
.center-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  min-height: 100vh; /* Ensures it takes up the full viewport height */
  text-align: center;
  position: relative;
  color: white;
}

/* Adjust other containers to ensure consistent styling */
.avatar-container,
.camera-container,
.name-entry-section,
.waiting-area {
  width: 100%; /* Ensures it spans the full width of the parent */
  max-width: 400px; /* Optional: Limit the container width */
  margin: auto; /* Center the container horizontally */
  padding: 20px; /* Optional: Add padding */
  box-sizing: border-box; /* Include padding in width/height calculations */
}

/* General Button Styling */
button {
  padding: 15px 25px;
  background-color: rgb(252, 160, 198);
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 20px;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  transition: all 0.2s ease;
}

button:hover {
  background-color: rgb(255, 131, 203);
}

/* Action Buttons Container */
.action-buttons {
  margin-top: 50px; /* Adds spacing from the content above */
  display: flex; /* Align buttons horizontally */
  justify-content: center; /* Center the buttons */
  gap: 20px; /* Space between buttons */
}

/* Camera and camera buttons styling*/
.camera-picture-container {
  display: flex; /* Arrange items in a row */
  align-items: center; /* Center items vertically */
  justify-content: space-between; /* Add space between camera view and buttons */
  gap: 20px; /* Optional: Space between elements */
}

.camera-view {
  border: 1px solid #ccc;
  border-radius: 10px;
  width: 320px;
  height: 240px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.camera-buttons {
  display: flex; /* Arrange buttons in a column */
  flex-direction: column; /* Keep buttons stacked vertically */
  gap: 10px; /* Space between buttons */
}
/* Add spacing between the time buttons and the action buttons */
.submit-section {
  margin-top: 40px; /* Adjust this value as needed */
  display: flex;
  justify-content: center;
  gap: 20px; /* Keeps space between the buttons themselves */
  background: none; /* If body or parent has background */
}

.camera-buttons button {
  padding: 12px 20px;
  background-color: rgb(225, 95, 150); /* Darker pink */
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  transition: all 0.2s ease;
}

.camera-buttons button:hover {
  background-color: rgb(205, 85, 140); /* Darker hover effect */
}

/*  When button is disabled styling */
/* General styling for all buttons */
button:disabled {
  pointer-events: none; /* Prevent any mouse interactions */
  opacity: 0.5; /* Make the button appear transparent */
  cursor: not-allowed; /* Change the cursor to indicate the button is disabled */
  transition: none; /* Disable any hover or transition effects */
}

/* Special styling for button: */
#submitNameButton {
  background-color: rgb(252, 63, 173);
}

#submitNameButton:hover {
  background-color: rgb(219, 34, 142);
}

/* Avatar styles */
.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #ccc;
}

/* Camera styling */
video {
  border: 1px solid #ccc;
  border-radius: 10px;
}

.participants-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box; /* Inkludera padding i bredden */
}

.participant-item.current-user img.avatar {
  border-color: rgb(255, 139, 230);
  /* Lila kant runt aktuell användare */
  border-style: solid;
  /* Fylld kant */
  animation: borderHighlight 1s infinite alternate;
  /* Animerar kantfärgen */
}

@keyframes borderHighlight {
  from {
    border-color: rgb(255, 139, 230);
    /* Startfärg */
  }

  to {
    border-color: rgb(244, 34, 255);
    /* Slutfärg */
  }
}

.participant-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

img.avatar {
  width: 100%;
  /* Gör bilderna flexibla */
  height: auto;
  /* Behåll proportionerna */
  aspect-ratio: 1 / 1;
  /* Fyrkantiga bilder */
  border-radius: 50%;
  /* Runda bilder */
  object-fit: cover;
  /* Beskär inte bilder */
  max-width: 150px;
  /* Maximal bildstorlek */
  border: 4px solid transparent;
  /* Standardkant */
  border-color: white;
  /* Default-kantfärg */
  transition: border-color 0.3s ease;
  /* Mjuk övergång för kantfärg */
}

img.avatar.host {
  border-color: rgb(15, 177, 69);
  /* Grön kant för admin */
}

.participant-item p {
  margin-top: 10px;
  /* Avstånd mellan bild och namn */
  font-size: 14px;
  /* Mindre textstorlek */
}

@media (max-width: 768px) {
  .participants-grid {
    grid-template-columns: repeat(2, 1fr);
    /* Två bilder per rad på små skärmar */
  }
  .global-music-control button {
    font-size: 8px;
  }
}

@media (max-width: 480px) {
  .participants-grid {
    grid-template-columns: repeat(1, 1fr);
    /* En bild per rad på mycket små skärmar */
  }
}

/* Style for the name input box */
input[type="text"] {
  width: 100%;
  /* Makes it span the full width of the container */
  max-width: 150px;
  /* Optional: Limit the max width */
  padding: 8px;
  /* Increases the size inside the box */
  font-size: 18px;
  /* Adjusts text size */
  border: 1px solid #df2f8d;
  border-radius: 0.5rem;
  /* Rounded corners */
  box-sizing: border-box;
  /* text placed in center */
  text-align: center;
}

.global-music-control {
  position: fixed;
  top: 10px;
  right: 10px;
  z-index: 1000;
}

.global-music-control button {
  padding: 8px 16px;
  font-size: 14px;
  background-color: pink;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
  transition: all 0.2s ease;
  text-decoration: none;
}

.global-music-control button:hover {
  background-color: rgb(255, 131, 203);
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