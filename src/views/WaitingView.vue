<template>
  <div v-if="isAdmin">
    <MusicPlayer :viewKey="'LOBBYVIEW'" />
  </div>

  <div class="screen-container">
    <div class="language-switcher-container">
      <!-- Language switcher component -->
      <LanguageSwitcher @language-changed="updateLanguage" />
      <div v-if="isAdmin">
        <InstructionButton
          :uiLabels="uiLabels"
          :lang="lang"
          viewKey="ADMINLOBBYVIEW"
        />
      </div>
      <div v-if="!isAdmin">
        <InstructionButton
          :uiLabels="uiLabels"
          :lang="lang"
          viewKey="LOBBYVIEW"
        />
      </div>
    </div>

    <div class="top-box">
      <div class="waiting-area">
        <h1 id="game-id-headline">
          {{ this.uiLabels.gameID || "Game ID" }}: {{ pollId }}
        </h1>
        <h2>
          {{ this.uiLabels.numberOfPlayers || "Number of players" }}:
          {{ participants.length }}
        </h2>
      </div>
    </div>

    <div class="middle-box">
      <!-- Participants grid -->
      <div class="participants-grid" :class="{ 'multi-participants': participants.length > 1 }">
        <div
          v-for="(participant, index) in participants"
          :key="index"
          :class="[
            'participant-item',
            { 'current-user': participant.userId === userId },
          ]"
        >
          <!-- Participant avatar -->
          <div class="curved-text">
            <span
              v-for="(char, i) in participant.name.split('')"
              :key="i"
              :style="getCurvedStyle(i, participant.name.length)"
            >
              {{ char }}
            </span>
          </div>
          <img
            :src="participant.avatar"
            alt="User Avatar"
            class="avatar"
            :class="{ host: participant.isAdmin }"
          />
        </div>
      </div>
    </div>

    <div class="bottom-box">
      <!-- Actions -->
      <div class="submit-section">
        <button
          v-if="isAdmin"
          v-on:click="adminStartGame"
          :disabled="!joined || participants.length < 3"
        >
          {{ this.uiLabels.startGame || "Start Game" }}
        </button>

        <!-- Leave Poll Button -->
        <button
          v-if="!isAdmin"
          v-on:click="showModal = true"
          :disabled="!joined"
        >
          {{ this.uiLabels.leaveLobby || "Leave Lobby" }}
        </button>
        <!-- Admin Leave Poll Button -->
        <button
          v-if="isAdmin"
          v-on:click="showModalAdmin = true"
          :disabled="!joined"
        >
          {{ this.uiLabels.leaveLobby || "Leave Lobby" }}
        </button>

        <ConfirmLeaveModal
          :show="showModal"
          :uiLabels="uiLabels"
          :lang="lang"
          @confirm="leavePoll"
          @cancel="showModal = false"
        />
        <ConfirmLeaveModal
          :show="showModalAdmin"
          :uiLabels="uiLabels"
          :lang="lang"
          @confirm="adminLeavePoll"
          @cancel="showModalAdmin = false"
        />
      </div>
    </div>
  </div>
</template>

<script>
import io from "socket.io-client";
import LanguageSwitcher from "@/components/LanguageSwitcher.vue"; // Import LanguageSwitcher component
import MusicPlayer from "@/components/MusicPlayer.vue";
import InstructionButton from "@/components/InstructionButton.vue"; //Import InstructionButton component
import ConfirmLeaveModal from "@/components/ConfirmLeaveModal.vue";

const socket = io("localhost:3000");

// ---- FOR ALLOWING OTHERS TO JOIN, CHANGE TO YOUR LOCAL IP ADDRESS ----
//const socket = io("130.243.223.240:3000"); // Initialize mutliple joiners

export default {
  name: "WaitingView",
  components: {
    LanguageSwitcher,
    InstructionButton,
    MusicPlayer,
    ConfirmLeaveModal,
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
      pollData: {}, // Poll data received from the server

      uiLabels: {}, // UI labels for different languages
      lang: localStorage.getItem("lang") || "en", // Language preference
      participants: [],
      atLeastThree: false,

      //leave poll lobby
      showModal: false,
      showModalAdmin: false,
    };
  },
  created: function () {
    // Set the poll ID from the route parameter
    this.pollId = this.$route.params.id; //set poll id
    this.userId = this.$route.params.userId; //set user id

    socket.emit("joinPoll", this.pollId);
    // Listen for server events
    socket.on("uiLabels", (labels) => (this.uiLabels = labels));
    // Update UI labels
    socket.emit("getUILabels", this.lang);

    socket.on("pollsUpdate", (data) => {
      console.log("pollData event received:");
      this.pollData = data;
      this.participants = data.participants;

      console.log("pollData är", this.pollData);
      console.log("participants är", this.participants);

      if (this.participants.length >= 3) {
        this.atLeastThree = true;
        console.log("atLeastThree är", this.participants.length);
        console.log("this joined är", this.joined);
      }
    });
    socket.emit("getPolls", this.pollId);
    socket.emit("getParticipants", this.pollId);

    socket.on("adminCheckResult", (data) => {
      if (data.isAdmin) {
        console.log("You are the admin for this poll.");
        this.isAdmin = true; // Set admin flag
      } else if (data.error) {
        console.error(data.error); // Handle errors (e.g., poll does not exist)
        alert(data.error);
        return; // Stop further execution
      } else {
        console.log("You are not the admin for this poll.");
        this.isAdmin = false; // Set participant flag
      }
      // Execute the callback after admin check
      if (typeof callback === "function") callback();
    });

    socket.on("waitingParticipantsUpdate", (p) => {
      console.log("waitingParticipantsUpdate event received:");
      this.participants = p;
      // Ensure the check runs after the participants array is updated
      console.log("participants är", this.participants);
    });

    socket.emit("checkAdmin", { pollId: this.pollId, userId: this.userId });

    //socket.on("participantsUpdate", (p) => {
    // console.log("participantsUpdate event received:");
    // this.participants = p;
    // this.checkAtLeastThree();
    // this.tempUserID= localStorage.getItem("userId")

    // Ensure the check runs after the participants array is updated
    //console.log("participants är", this.participants);
    //});

    //Listen for start game from server
    socket.on("adminStartGame", () => this.participantStartGame());

    // Navigate to the poll page when the poll starts
    socket.on("startPoll", () => this.$router.push("/poll/" + this.pollId));

    // Emit events to join the poll and get UI labels

    socket.on("adminLeftPoll", () => {
      this.leavePoll();
      console.log("adminLeftPoll event received");
      if (!this.isAdmin) {
        alert("The admin has left the poll.");
      }
    });

    this.joined = true;
  },

  methods: {
    // Update language when changed in LanguageSwitcher
    updateLanguage(lang) {
      this.lang = lang;
      socket.emit("getUILabels", this.lang);
    },

    adminLeavePoll() {
      this.showModalAdmin = false;
      socket.emit("adminLeavePoll", {
        pollId: this.pollId,
      });
    },

    leavePoll() {
      this.showModal = false;
      // Emit an event to the server to remove the participant
      socket.emit("leavePoll", {
        pollId: this.pollId,
        userId: this.userId,
      });
      // Reset local state
      this.$router.push("/");
    },
    // Move to the next step

    adminStartGame: function () {
      console.log("adminStartGame event emitted");
      socket.emit("startGame", this.pollId);
    },

    participantStartGame: function () {
      this.$router.push(`/poll/${this.pollId}/${this.userId}`);
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

    getCurvedStyle(index, length) {
      const angleStep = 12; // Adjust for curvature intensity
      const midpoint = length / 2;
      const rotationAngle = (index - midpoint) * angleStep;

      return {
        transform: `rotate(${rotationAngle}deg) translateY(-10px)`,
      };
    },
  },
};
</script>

<style scoped>
/* Utility class for centering containers */
.screen-container {
  display: flex;
  flex-direction: column;
  height: 100vh; /* Full height of the screen */
  width: 100vw; /* Fill screen width */
  gap: 0.2rem; /* Optional: Adds space between boxes */
  margin: 0; /* Remove default margin */
  padding: 0; /* Remove default padding */
}

/* Top box styles */
.top-box {
  min-height: 15vh; /* Fixed height, adjust as needed */
  text-align: center;
  display: flex;
  justify-content: center;
  padding-top: 4rem;
}

/* Middle box styles */
.middle-box {
  flex-grow: 1; /* Take up remaining space */
  min-height: 45vh; /* Adjust based on available space */
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Bottom box styles */
.bottom-box {
  min-height: 30vh; /* Adjust height as needed */
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Adjust other containers to ensure consistent styling */
.waiting-area {
  width: 100%; /* Ensures it spans the full width of the parent */
  margin: auto; /* Center the container horizontally */
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

/* Add spacing between the action buttons */
.submit-section {
  margin-top: 40px; /* Adjust this value as needed */
  display: flex;
  justify-content: center;
  gap: 20px; /* Keeps space between the buttons themselves */
  background: none; /* If body or parent has background */
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

.participants-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  width: 60rem;
  max-width: 100%;
  box-sizing: border-box; 
  margin: 2rem;
}

.participant-item.current-user img.avatar {
  border-color: rgb(255, 139, 230);
  /* Lila kant runt aktuell användare */
  border-style: solid;
  /* Fylld kant */
  animation: borderHighlight 0.8s infinite alternate;
  /* Animerar kantfärgen */
}

@keyframes borderHighlight {
  from {
    border-color: rgb(153, 51, 204);
    /* Startfärg */
  }

  to {
    border-color: rgb(245, 85, 160);
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

.curved-text {
  display: flex;
  flex-direction: row;
  justify-content: center;
  transform: translateY(-0.02rem); /* Moves text above the avatar */
  position: relative;
}

.curved-text span {
  display: inline-block;
  transform-origin: bottom center;
  font-size: 18px;
  font-weight: bold;
  color: rgb(252, 160, 198);
  letter-spacing: 0.05rem; /* Adjusts spacing between letters */
}

img.avatar {
  width: 100%;
  height: auto;
  aspect-ratio: 1 / 1;
  border-radius: 50%;
  object-fit: cover;
  border: 0.3rem solid transparent;
  border-color: white;
  transition: border-color 0.3s ease;
  height: 8rem;
  width: 8rem;
}

@media (max-width: 480px) {
  .participants-grid {
    grid-template-columns: repeat(2, 1fr);
    /* Två bilder per rad på små skärmar */
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

#game-id-headline {
  color: rgb(252, 181, 212);

  position: fixed;
  top: 3rem;
  left: 50%; /* Center horizontally */
  transform: translate(-50%, -50%); /* Adjust for centering */
  z-index: 2; /* Ensures it stays above other content */
  text-align: center;
}
</style>
