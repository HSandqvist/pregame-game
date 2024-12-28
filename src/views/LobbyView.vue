<template>
  <div>
    

    <!-- Step 1: Enter your name -->
    <div v-if="step === 1" class="name-entry-section">
      <h1>{{this.uiLabels.pleaseEnterYourName || "Please enter your name"}}:</h1>
      <input type="text" v-model="userName" />
      <button v-on:click="nextStep" :disabled="!userName">{{this.uiLabels.next || "Next"}}</button>

      <div>
        
      </div>
    </div>

    <!-- Step 2: Capture avatar from the camera -->
    <div v-else-if="step === 2" class="camera-container">
      <h1>{{this.uiLabels.captureYourAvatar || "Capture your avatar"}}: </h1>

      <p v-if="!isPictureTaken">
        <video ref="video" width="320" height="240" autoplay></video>
      </p>

      <!-- show the picture before creating final avatar -->
      <p v-if="isPictureTaken">
        <img :src="avatar" alt="User Avatar" width="320" height="240" />
      </p>

      <button v-on:click="startCamera" :disabled="cameraState">
        {{this.uiLabels.startCamera || "Start camera"}}
      </button>
      <button v-on:click="captureImage" :disabled="!cameraState">
        {{this.uiLabels.takePicture || "Take picture"}}
      </button>

      <button v-on:click="nextStep" :disabled="!isPictureTaken">{{this.uiLabels.next || "Next"}}</button>
      <button v-on:click="backStep">{{this.uiLabels.back || "Back"}}</button>
    </div>

    <!-- Step 3: Display captured avatar and submit -->
    <div v-else-if="step === 3" class="avatar-container">
      <h1>
        {{ pollId }}
      </h1>
          <hr>
      <h1>{{this.uiLabels.yourAvatar || "Your Avatar "}}: {{ this.userName }}</h1>

      <!-- Know if user is admin or not -->
      <h2 v-if="isAdmin" class="admin-tag">You are the Admin!</h2>
      <h2 v-else class="participant-tag">You are a Participant</h2>

      <img :src="avatar" alt="User Avatar" class="avatar" />

      <div class="submit-section">
        <!-- ADDED FOR ADMIN -->
        <!-- div v-for="participant in participants" :key="participant.id">
          <p>
            {{ participant.name }}
            <span v-if="participant.isAdmin" class="admin-tag">(Admin)</span>
          </p>
        </div>
         ADDED FOR ADMIN END -->

        <button v-on:click="participateInPoll" id="submitNameButton" :disabled="joined">
          {{ this.uiLabels.participateInPoll || "Participate in poll"}}
        </button>
        <button v-on:click="backStep"> {{ this.uiLabels.back  || "Back"}}</button>

        <button v-if="isAdmin" v-on:click="startGame">
          Start Game
        </button>
      </div>
      <div> {{ participants }}</div>
    </div>
  </div>
</template>

<script>
import io from "socket.io-client";
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

      //camera
      stream: null, // The video stream to access the camera
      isPictureTaken: false, //Tracks that camera is closed and picture taken
      cameraState: false, // Tracks whether the camera is active
    };
  },
  created: function () {
    // Set the poll ID from the route parameter
    this.pollId = this.$route.params.id;

    // Listen for server events
    socket.on("uiLabels", (labels) => (this.uiLabels = labels)); // Update UI labels
    socket.emit("getUILabels", this.lang);
    socket.on("participantsUpdate", (p) => (this.participants = p)); // Update participants list

    // Navigate to the poll page when the poll starts
    socket.on("startPoll", () => this.$router.push("/poll/" + this.pollId));

    // Emit events to join the poll and get UI labels
    socket.emit("joinPoll", { pollId: this.pollId });
    
  },
  methods: {
    // Move to the next step
    nextStep() {
      if (this.step == 2) {
        // Check admin status before moving to Step 3
        this.checkAdminStatus(() => {
          this.step++; // Move to Step 3 after admin check
        });
      } else if (this.step < 5) {
        this.step++;
      }
    },
    startGame(){
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
        this.isPictureTaken = false;
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
        console.log("Avatar captured")
        //console.log("Captured Avatar: ", this.avatar);

        this.cameraState = false; // Disable camera actions

        // Stop the camera stream after capturing the image
        this.stopCamera();
      } else {
        console.error("Video stream is not available.");
      }
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
      //if (!this.avatar) {
      //  alert("Please select or capture an avatar!");
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

      //this.$router.push(`/poll/${this.pollId}`);
      //this.$router.push(`/poll/${this.pollId}/${this.userId}`); //all participants show their own page in poll to save their answers
    },
  },
};
</script>

<style scoped>
/* Add styles for each section as negit eded */
.avatar-container,
.camera-container,
.name-entry-section,
.avatar-upload-section,
.submit-section {
  margin-bottom: 20px;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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
</style>
