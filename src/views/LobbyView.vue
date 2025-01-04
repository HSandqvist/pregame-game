<template>
  <div class="global-music-control">
    <button @click="toggleMusic">
      {{ isMusicPlaying ? "Turn Music Off" : "Turn Music On" }}
    </button>
  </div>
  <div class="center-container">
    <!-- Step 1: Enter your name -->
    <div v-if="step === 1" class="name-entry-section">
      <h1>
        {{ this.uiLabels.pleaseEnterYourName || "Please enter your name" }}:
      </h1>
      <input type="text" v-model="userName" />

      <div class="action-buttons">
        <button v-on:click="nextStep" :disabled="!userName">
          {{ this.uiLabels.next || "Next" }}
        </button>
      </div>
    </div>

    <!-- Step 2: Capture avatar from the camera -->
    <div v-else-if="step === 2" class="camera-container">
      <h1>{{ this.uiLabels.captureYourAvatar || "Capture your avatar" }}:</h1>

      <div class="camera-picture-container">
        <!-- Camera view -->
        <div class="camera-view">
          <p v-if="!isPictureTaken">
            <video ref="video" width="320" height="240" autoplay></video>
          </p>

          <!-- show the picture before creating final avatar -->
          <p v-if="isPictureTaken">
            <img :src="avatar" alt="User Avatar" width="320" height="240" />
          </p>
        </div>

        <!-- Camera buttons-->
        <div class="camera-buttons">
          <button v-on:click="startCamera" :disabled="cameraState">
            {{ this.uiLabels.startCamera || "Start camera" }}
          </button>
          <button v-on:click="captureImage" :disabled="!cameraState">
            {{ this.uiLabels.takePicture || "Take picture" }}
          </button>
        </div>
      </div>
      <!-- Action buttons-->
      <div class="action-buttons">
        <button v-on:click="backStep">
          {{ this.uiLabels.back || "Back" }}
        </button>
        <button v-on:click="nextStep" :disabled="!isPictureTaken">
          {{ this.uiLabels.next || "Next" }}
        </button>
      </div>
    </div>

    <!-- Step 3: Display captured avatar and go to wait area -->
    <div v-else-if="step === 3" class="avatar-container">
      <h1>Your Avatar: {{ this.userName }}</h1>
      <img :src="avatar" alt="User Avatar" class="avatar" />

      <div class="action-buttons">
        <button v-on:click="backStep">Back</button>
        <button
          v-on:click="participateInPoll"
          id="submitNameButton"
          :disabled="joined"
        >
          {{ this.uiLabels.participateInPoll || "Participate in poll" }}
        </button>
      </div>
    </div>

    <!-- Step 4: Show waiting area with other participants -->
    <div v-else-if="step === 4" class="waiting-area">
      <h1>Lobby for poll: {{ pollId }}</h1>
      <h2>Number of participants: {{ participants.length }}</h2>
      <h3>Participants:</h3>

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
          Start Game
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
const socket = io("localhost:3000");

export default {
  name: "LobbyView",
  data: function () {
    return {
      step: 1, // Tracks the current step
      pollId: "inactive poll", // Placeholder for poll ID

      //user
      userId: null, //alla ha egen sida sen hej
      userName: "", // User's name
      joined: false, // If the user has joined
      avatar: null, // Avatar image data
      isAdmin: false, //flag for admin status, deklarerad här nu men tror det ska göras lite annorlunda
      adminId: null, //placeholder for eventual adminId, if present

      uiLabels: {}, // UI labels for different languages
      lang: localStorage.getItem("lang") || "en", // Language preference
      participants: [],
      atLeastThree: false,

      //camera
      stream: null, // The video stream to access the camera
      isPictureTaken: false, //Tracks that camera is closed and picture taken
      cameraState: false, // Tracks whether the camera is active

      //music
      isMusicPlaying: false,
    };
  },
  created: function () {
    // Set the poll ID from the route parameter
    this.pollId = this.$route.params.id;

    // Listen for server events
    socket.on("uiLabels", (labels) => (this.uiLabels = labels)); // Update UI labels
    socket.emit("getUILabels", this.lang);
    socket.on("participantsUpdate", (p) => (this.participants = p)); // Update participants list
    socket.on("participantsUpdate", () => this.checkAtLeastThree());
    //Listen for start game from server
    socket.on("startGame", () => this.participatStartGame());

    // Navigate to the poll page when the poll starts
    socket.on("startPoll", () => this.$router.push("/poll/" + this.pollId));

    // Emit events to join the poll and get UI labels
    socket.emit("joinPoll", { pollId: this.pollId });
  },

  methods: {
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
      console.log(this.step);
    },
    adminStartGame() {
      socket.emit("startGame", this.pollId);
    },

    participatStartGame() {
      this.$router.push(`/poll/${this.pollId}/${this.userId}`);
    },

    // Function to check if the user is an admin
    checkAdminStatus(callback) {
      if (localStorage.userId) {
        this.userId = localStorage.getItem("userId");
      } else {
        this.userId = Math.ceil(Math.random() * 100000); // Generate userId if not present
      }
      // Emit admin check request
      socket.emit("checkAdmin", { pollId: this.pollId, userId: this.userId });

      // Listen for the server's response
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
    },
    // Move to the previous step
    backStep() {
      if (this.step > 1) {
        this.step--;
      }
    },

    // Start the camera stream
    startCamera() {
      this.isPictureTaken = false;
      this.cameraState = true;

      // Stop any existing camera stream before starting a new one, make sure always turned off
      if (this.stream) {
        const tracks = this.stream.getTracks();
        tracks.forEach((track) => track.stop());
        this.stream = null;
      }

      // Stop the video element from using the old stream
      if (this.$refs.video) {
        this.$refs.video.srcObject = null;
      }

      //start new camera stream
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          this.stream = stream;
          this.$refs.video.srcObject = stream;
          console.log("Camera stream is active:", stream);
        })
        .catch((error) => {
          console.error("Error accessing camera:", error);
          alert(
            "Unable to access the camera. Please check your camera settings."
          );
        });
    },
    // Stop the camera stream
    stopCamera() {
      if (this.stream) {
        console.log("stopping stream", this.stream);
        const tracks = this.stream.getTracks();
        tracks.forEach((track) => track.stop()); //stop all tracks
        this.stream = null; //added
      }
      if (this.$refs.video) {
        this.$refs.video.srcObject = null; // Clear the video element source
      }
    },
    // Capture the image from the video stream
    captureImage() {
      const video = this.$refs.video;

      this.isPictureTaken = true;

      if (video && video.videoWidth > 0 && video.videoHeight > 0) {
        // Create a canvas to capture the image
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Get the context and draw the video frame to the canvas
        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert canvas to a base64 image string
        this.avatar = canvas.toDataURL("image/png");

        // Log to check the base64 image
        console.log("Avatar captured");
        //console.log("Captured Avatar: ", this.avatar);

        this.cameraState = false; // Disable camera actions

        // Stop the camera stream after capturing the image
        this.stopCamera();
      } else {
        console.error("Video stream is not available.");
      }
    },

    toggleMusic() {
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
    handleAvatarUpload(event) {
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
    participateInPoll() {
      if (!this.avatar) {
        alert("Please select or capture an avatar!");
        return;
      }

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
      //this.$router.push(`/poll/${this.pollId}/${this.userId}`); //all participants show their own page in poll to save their answers

      this.nextStep(); //hoppa till nästa steg
    },

    checkAtLeastThree() {
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
  justify-content: center;
  align-items: center;
  flex-direction: column;
  min-height: 100vh; /* Ensures it takes up the full viewport height */
  text-align: center;
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
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  /* Responsiv layout */
  gap: 20px;
  /* Avstånd mellan deltagare */
  margin: 20px 0;
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
}

@media (max-width: 480px) {
  .participants-grid {
    grid-template-columns: repeat(1, 1fr);
    /* En bild per rad på mycket små skärmar */
  }
}

.global-music-control {
  position: fixed;
  top: 10px;
  right: 10px;
  z-index: 1000;
}

.global-music-control button {
  padding: 10px 18px;
  background-color: pink;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  transition: all 0.2s ease;
  text-decoration: none;
}

.global-music-control button:hover {
  background-color: rgb(255, 131, 203);
}
</style>
