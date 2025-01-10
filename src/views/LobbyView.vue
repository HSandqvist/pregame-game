<template>
  <div class="global-music-control" v-if="isAdmin">
    <button @click="toggleMusic">
      <img
        :src="isMusicPlaying ? musicIconOn : musicIconOff"
        alt="Music Icon"
        class="music-icon"
      />
    </button>
  </div>
  <div class="center-container">
    <!-- Language switcher component -->
    <LanguageSwitcher @language-changed="updateLanguage" />
    <!-- Step 1: Enter your name -->
    <div v-if="step === 1" class="name-entry-section">
      <InstructionButton :uiLabels="uiLabels" :lang="lang" viewKey="NAMEVIEW" />
      <h1>{{ this.uiLabels.pleaseEnterYourName || "Enter your name" }}:</h1>
      <input type="text" v-model="userName" />

      <div class="action-buttons">
        <button v-on:click="nextStep" :disabled="!userName">
          {{ this.uiLabels.next || "Next" }}
        </button>
      </div>
    </div>

    <!-- Step 2: Capture avatar from the camera -->
    <div v-else-if="step === 2" class="camera-container">
      <InstructionButton
        :uiLabels="uiLabels"
        :lang="lang"
        viewKey="CAMERAVIEW"
      />
      <h1 v-if="!choseCustomAvatar">
        {{ this.uiLabels.captureYourAvatar || "Capture your avatar" }}:
      </h1>
      <h1 v-if="choseCustomAvatar">
        {{ this.uiLabels.chooseYourAvatar || "Choose your avatar" }}:
      </h1>

      <div class="camera-picture-container" v-if="!choseCustomAvatar">
        <!-- Camera view -->
        <div class="camera-view">
          <p v-if="!isPictureTaken">
            <video ref="video" width="320" height="240" autoplay></video>
          </p>

          <!-- show the picture before creating final avatar -->
          <p v-if="isPictureTaken">
            <img :src="avatar" alt="User Avatar" width="320" height="240" />
          </p>
          <!-- Show the custom avatar -->
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
      <div class="camera-picture-container" v-if="choseCustomAvatar">
        <div class="camera-view">
          <p>
            <img :src="avatar" alt="User Avatar" width="320" height="240" />
          </p>
        </div>
        <div class="camera-buttons">
          <button v-on:click="choseOptionOne">
            {{ this.uiLabels.gorankan || "Gorankan" }}
          </button>
          <button v-on:click="choseOptionTwo">
            {{ this.uiLabels.liankan || "Liankan" }}
          </button>
          <button v-on:click="choseOptionThree">
            {{ this.uiLabels.plankan || "Plankan" }}
          </button>
          <button v-on:click="choseOptionFour">
            {{ this.uiLabels.bankan || "Bankan" }}
          </button>
        </div>
      </div>

      <!-- Action buttons-->
      <div class="action-buttons">
        <button v-on:click="backStep" :disabled="disableSwitcher">
          {{ this.uiLabels.back || "Back" }}
        </button>

        <button
          v-on:click="chooseAvatar"
          v-if="!choseCustomAvatar"
          :disabled="disableSwitcher"
        >
          {{ this.uiLabels.choosePreMadeAvatar || "Choose Pre-made Avatar" }}
        </button>

        <button v-on:click="returnToPictureMode" v-if="choseCustomAvatar">
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
        :lang="lang"
        viewKey="AVATARVIEW"
      />
      <h2> {{ this.uiLabels.yourAvatar || "Your avatar" }} </h2>
        <h1> {{ userName }} </h1>
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
          {{ this.uiLabels.participateInPoll || "Participate in poll" }}
        </button>
      </div>
    </div>
  </div>
  <audio ref="backgroundMusic" loop>
    <source :src="lobbyviewMusic" type="audio/mpeg" />
    {{
      this.uiLabels.music || "Your browser does not support the audio element."
    }}
  </audio>
</template>

<script>
import io from "socket.io-client";
import lobbyviewMusic from "@/assets/lobbyviewMusic/lobbyviewMusic.mp3";
import InstructionButton from "@/components/InstructionButton.vue"; //Import InstructionButton component
import LanguageSwitcher from "@/components/LanguageSwitcher.vue"; // Import LanguageSwitcher component
import ConfirmLeaveModal from "@/components/ConfirmLeaveModal.vue";

import musicIconOn from "@/assets/img/musicIcon.png";
import musicIconOff from "@/assets/img/musicIconOff.png";

const socket = io("localhost:3000");

// ---- FOR ALLOWING OTHERS TO JOIN, CHANGE TO YOUR LOCAL IP ADDRESS ----
//const socket = io("172.20.10.2:3000"); // Initialize mutliple joiners

export default {
  name: "LobbyView",
  components: {
    LanguageSwitcher,
    InstructionButton,
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

      uiLabels: {}, // UI labels for different languages
      lang: localStorage.getItem("lang") || "en", // Language preference
      participants: [],
      atLeastThree: false,

      //camera
      stream: null, // The video stream to access the camera
      isPictureTaken: false, //Tracks that camera is closed and picture taken
      cameraState: false, // Tracks whether the camera is active
      disableSwitcher: false, //connected to choose premade avatar button

      //music
      isMusicPlaying: false,
      musicIconOn, // Importera den ljusa ikonen
      musicIconOff,
      lobbyviewMusic,

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
     // Ensure the check runs after the participants array is updated
      //console.log("participants är", this.participants);

      this.$router.push(`/waiting/${this.pollId}/${this.userId}`);

      
    });
    //Listen for start game from server
  

    // Navigate to the poll page when the poll starts
    socket.on("startPoll", () => this.$router.push("/poll/" + this.pollId));

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
      console.log(this.step);
    },

    adminStartGame: function () {
      socket.emit("startGame", this.pollId);
    },

    participantStartGame: function () {
      this.$router.push(`/poll/${this.pollId}/${this.userId}`);
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
    backStep: function () {
      if (this.step > 1) {
        this.step--;
      }
    },

    // Start the camera stream
    startCamera: function () {
      this.isPictureTaken = false;
      this.cameraState = true;
      this.disableSwitcher = true;

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
    stopCamera: function () {
      if (this.stream) {
        console.log("stopping stream", this.stream);
        const tracks = this.stream.getTracks();
        tracks.forEach((track) => track.stop()); //stop all tracks
        this.stream = null; //added
      }
      if (this.$refs.video) {
        this.$refs.video.srcObject = null; // Clear the video element source
      }
      this.disableSwitcher = false;
    },

    // Capture the image from the video stream
    captureImage: function () {
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
    chooseAvatar() {
      this.stopCamera();
      this.choseCustomAvatar = true;
      this.isPictureTaken = true;
    },

    choseOptionOne() {
      this.avatar = "/src/assets/img/Gorankan.png";
    },

    choseOptionTwo() {
      this.avatar = "/src/assets/img/Liankan.png";
    },
    choseOptionThree() {
      this.avatar = "/src/assets/img/Plankan.png";
    },
    choseOptionFour() {
      this.avatar = "/src/assets/img/Bankan.png";
    },

    returnToPictureMode() {
      this.choseCustomAvatar = false;
      this.isPictureTaken = false;
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

      if(this.isAdmin){
      localStorage.setItem("userId", this.userId);
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
.avatar-container,
.camera-container,
.name-entry-section,
.waiting-area {
  width: 100%; /* Ensures it spans the full width of the parent */
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
  border: 0.1rem solid #f01984;
  border-radius: 50%;
  background-color: #f01984;
  width: 15rem;
  height: 14rem;
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
/* Add spacing between the action buttons */
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
  top: 1rem;
  left: 4rem;
  z-index: 1000;
}

.global-music-control button {
  padding: 1px;
  background-color: pink;
  color: white;
  border: none;
  border-radius: 50%; /* Gör ikonen rund */
  cursor: pointer;
  display: flex; /* Använd flexbox för att centrera ikonen */
  background-color: rgb(252, 160, 198);
}

.music-icon {
  width: 40px;
  height: 40px;
  object-fit: cover;
  transition: filter 0.3s ease, transform 0.2s ease; /* Smidig övergång */
}

.global-music-control button:hover {
  background-color: rgb(255, 131, 203); /* Lättare hover-effekt för ringen */
}

.music-icon:hover {
  transform: scale(1.1); /* Liten zoom vid hover */
}

#game-id-headline {
  color: rgb(252, 181, 212);

  position: fixed; 
  top: 1rem;
  left: 50%; /* Center horizontally */
  transform: translate(-50%, -50%); /* Adjust for centering */
  z-index: 2; /* Ensures it stays above other content */
  text-align: center;
}
</style>
