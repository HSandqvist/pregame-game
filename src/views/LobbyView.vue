<template>
  <div class="center-container">
    <!-- Language switcher component -->
    <LanguageSwitcher @language-changed="updateLanguage" />

    <!-- Step 1: Enter your name -->
    <div v-if="step === 1" class="name-entry-section">
      <InstructionButton
        :uiLabels="uiLabels"
        :viewKey="'NAMEVIEW'"
      />
      <h1>{{ this.uiLabels.pleaseEnterYourName || "Enter your name" }}:</h1>
      <input
        type="text"
        v-model="userName"
        maxlength="10"
        @input="validateName"
      />

      <div class="action-buttons">
        <button v-on:click="nextStep" :disabled="!userName">
          {{ this.uiLabels.next || "Next" }}
        </button>
      </div>
    </div>

    <!-- Step 2: Capture avatar from the  or choose avatar -->
    <div v-else-if="step === 2" class="camera-container">
      <InstructionButton
        :uiLabels="uiLabels"
        :viewKey="'CAMERAVIEW'"
      />

      <!-- Camera/Picture for avatar -->
      <div class="camera-picture-container">
        <div v-if="!choseCustomAvatar">
          <CameraComponent
            v-model:isPictureTaken="isPictureTaken"
            :uiLabels="uiLabels"
            :disableSwitcher="disableSwitcher"
            :cameraState="cameraState"
            @update:avatar="avatar = $event"
            @update:disableSwitcher="disableSwitcher = $event"
            @update:isPictureTaken="isPictureTaken = $event"
            @update:cameraState="cameraState = $event"
          />
        </div>
        <div v-if="choseCustomAvatar">
          <ChooseAvatarComponent
            v-model:isPictureTaken="isPictureTaken"
            :uiLabels="uiLabels"
            :takenAvatars="selectedAvatars"
            @update:isPictureTaken="isPictureTaken = $event"
            @avatar-selected="handleAvatarSelection"
          />
        </div>
      </div>

      <!-- Action buttons-->
      <div class="action-buttons">
        <button v-on:click="backStep" :disabled="disableSwitcher">
          {{ this.uiLabels.back || "Back" }}
        </button>

        <button
          id="avatar-or-pic-button"
          v-on:click="chooseAvatar"
          v-if="!choseCustomAvatar"
          :disabled="disableSwitcher"
        >
          {{ this.uiLabels.choosePreMadeAvatar || "Choose Pre-made Avatar" }}
        </button>

        <button
          id="avatar-or-pic-button"
          v-on:click="returnToPictureMode"
          v-if="choseCustomAvatar"
        >
          {{ this.uiLabels.takeAPictureInstead || "Take A Picture Instead" }}
        </button>

        <button v-on:click="nextStep" :disabled="!isPictureTaken">
          {{ this.uiLabels.next || "Next" }}
        </button>
      </div>
    </div>

    <!-- Step 3: Display captured avatar and go to wait area -->
    <div v-else-if="step === 3" class="avatar-container">
      <InstructionButton
        :uiLabels="uiLabels"
        :viewKey="'AVATARVIEW'"
      />
      <h2>{{ this.uiLabels.yourAvatar || "Your avatar" }}:</h2>
      <div class="curved-text">
        <span
          v-for="(char, i) in userName.split('')"
          :key="i"
          :style="getCurvedStyle(i, userName.length)"
        >
          {{ char }}
        </span>
      </div>
      <img :src="avatar" alt="User Avatar" class="avatar" />

      <div class="action-buttons">
        <button v-on:click="backStep">
          {{ this.uiLabels.back || "Back" }}
        </button>
        <button
          v-on:click="participateInPoll"
          id="submitNameButton"
          :disabled="joined"
        >
          {{ this.uiLabels.participateInPoll || "READY!" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import io from "socket.io-client";
import InstructionButton from "@/components/InstructionButton.vue"; //Import InstructionButton component
import LanguageSwitcher from "@/components/LanguageSwitcher.vue"; // Import LanguageSwitcher component
import ConfirmLeaveModal from "@/components/modals/ConfirmLeaveModal.vue";

import CameraComponent from "@/components/CameraComponent.vue";
import ChooseAvatarComponent from "@/components/ChooseAvatarComponent.vue";

const socket = io(sessionStorage.getItem("dataServer"));

// ---- FOR ALLOWING OTHERS TO JOIN, CHANGE TO YOUR LOCAL IP ADDRESS ----
//const socket = io("130.243.223.240:3000"); // Initialize mutliple joiners

export default {
  name: "LobbyView",
  components: {
    LanguageSwitcher,
    InstructionButton,
    ConfirmLeaveModal,
    CameraComponent,
    ChooseAvatarComponent,
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

      selectedAvatars: [],

      uiLabels: {}, // UI labels for different languages
      lang: localStorage.getItem("lang") || "en", // Language preference
      participants: [],
      atLeastThree: false,

      //camera
      disableSwitcher: false, //connected to choose premade avatar button
      isPictureTaken: false,
      cameraState: false,

      //leave poll lobby
      showModal: false,
    };
  },
  created: function () {
    // Set the poll ID from the route parameter
    this.pollId = this.$route.params.id;

    //set user id
    this.setUserId();

    // Listen for server events
    socket.on("uiLabels", (labels) => (this.uiLabels = labels)); // Update UI labels
    socket.emit("getUILabels", this.lang);

    socket.on("participantsUpdate", (p) => {
      this.participants = p;
      this.$router.push(`/waiting/${this.pollId}/${this.userId}`);

      socket.off("participantsUpdate");
    });
    //Listen for start game from server

    // Navigate to the poll page when the poll starts
    socket.on("startPoll", () => this.$router.push("/poll/" + this.pollId));

    socket.on("updateTakenAvatars", (avatars) => {
      this.selectedAvatars = avatars;
    });

    // Emit events to join the poll and get UI labels
    socket.emit("joinPoll", this.pollId);
  },

  methods: {
    // Update language when changed in LanguageSwitcher
    updateLanguage(lang) {
      this.lang = lang;
      socket.emit("getUILabels", this.lang);
    },
    // Move to the next step
    nextStep() {
      if (this.step == 3) {
        // Check admin status before moving to Step 3
        this.checkAdminStatus(() => {
          this.step++; // Move to Step 3 after admin check
        });
      } else if (this.step < 5) {
        this.step++;
      }
    },

    setUserId: function () {
      if (localStorage.userId) {
        this.userId = localStorage.getItem("userId");
      } else {
        this.userId = Math.ceil(Math.random() * 100000); // Generate userId if not present
      }
    },

    // Function to check if the user is an admin
    checkAdminStatus: function (callback) {
      //userid set in created by separate function instead! else problems!!

      // Emit admin check request
      socket.emit("checkAdmin", { pollId: this.pollId, userId: this.userId });

      // Listen for the server's response
      socket.on("adminCheckResult", (data) => {
        if (data.isAdmin) {
          this.isAdmin = true; // Set admin flag
        } else if (data.error) {
          console.error(data.error); // Handle errors (e.g., poll does not exist)
          alert(data.error);
          return; // Stop further execution
        } else {
          this.isAdmin = false; // Set participant flag
        }
        // Execute the callback after admin check
        if (typeof callback === "function") callback();
      });
    },

    // Move to the previous step
    backStep: function () {
      if (this.step > 1) {
        this.cameraState = false;
        this.isPictureTaken = false;

        this.step--;
      }
    },

    returnToPictureMode() {
      this.choseCustomAvatar = false;
      this.isPictureTaken = false;
      this.avatar = null;
    },

    chooseAvatar() {
      this.choseCustomAvatar = true; // Show ChooseAvatarComponent
      this.avatar = null;
    },

    toggleMusic: function () {
      const audio = this.$refs.backgroundMusic;
      if (!audio) {
        console.error("Audio element not found!");
        return;
      }

      audio.volume = 1.0; // Full volym (värde mellan 0.0 och 1.0)

      if (this.isMusicPlaying) {
        audio.pause();
        this.isMusicPlaying = false; // Sätt musiken till av
      } else {
        // Återställ ljudets position till början om det är pausat
        audio.currentTime = 0;
        audio.play();
        this.isMusicPlaying = true; // Sätt musiken till på
      }
    },

    // Participate in the poll
    participateInPoll: function () {
      this.nextStep(); //hoppa till nästa steg

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

      if (this.isAdmin) {
        localStorage.setItem("userId", this.userId);
      }
    },

    handleAvatarSelection(avatar) {
      // Check if the avatar has already been taken
      if (!this.selectedAvatars.includes(avatar)) {
        socket.emit("select-avatar", {
          pollId: this.pollId,
          userId: this.userId,
          avatar,
        }); // Emit avatar selection
        this.selectedAvatars.push(avatar); // Locally update the selected avatars
        this.avatar = avatar; // Update the user's avatar
      }
    },

    getCurvedStyle(index, length) {
      const angleStep = 9; // Adjust for curvature intensity
      const midpoint = length / 2;
      const rotationAngle = (index - midpoint) * angleStep;

      return {
        transform: `rotate(${rotationAngle}deg) translateY(-10px)`,
      };
    },

    validateName(event) {
      if (this.userName.length > 10) {
        this.userName = this.userName.substring(0, 10);
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
}

/* Adjust other containers to ensure consistent styling */
.name-entry-section,
.waiting-area {
  width: 100%; /* Ensures it spans the full width of the parent */
  margin: auto; /* Center the container horizontally */
  padding: 20px; /* Optional: Add padding */
  box-sizing: border-box; /* Include padding in width/height calculations */
}

/* Action Buttons Container */
.action-buttons {
  margin-top: 50px; /* Adds spacing from the content above */
  display: flex; /* Align buttons horizontally */
  justify-content: center; /* Center the buttons */
  gap: 20px; /* Space between buttons */
  padding: 5px;
}

/* Camera and camera buttons styling*/
.camera-picture-container {
  flex-grow: 1;
  display: flex; /* Arrange items in a row */
  flex-direction: column;
  align-items: center; /* Center items vertically */
  justify-content: space-between; /* Add space between camera view and buttons */
  gap: 20px; /* Optional: Space between elements */
  min-height: 60vh; /* Ensure consistent height */
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
#submitNameButton,
#avatar-or-pic-button {
  background-color: rgb(252, 63, 173);
  border: 0.06rem solid rgb(218, 48, 147);
}

#submitNameButton:hover,
#avatar-or-pic-button:hover {
  background-color: rgb(219, 34, 142);
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

/* Avatar styles */
.avatar {
  width: 15rem;
  height: 15rem;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #ccc;
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
  font-size: 1.2rem;
  font-weight: bold;
  color: rgb(249, 191, 215);
  letter-spacing: 0.05rem; /* Adjusts spacing between letters */
}

h2 {
  margin-bottom: 3rem;
}

@media (max-width: 768px) {
  button {
    max-width: 7em;
  }
}

@media (max-height: 667px) {
  .camera-picture-container {
    margin-top: 3rem;
    max-height: 50%;
  }
  .action-buttons {
    margin-bottom: 3rem;
  }
}
</style>
