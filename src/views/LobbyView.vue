<template>
  <div>
    {{ pollId }}

    <!-- Step 1: Enter your name -->
    <div v-if="step === 1" class="name-entry-section">
      <h1>Please enter your name:</h1>
      <input type="text" v-model="userName" />
      <button v-on:click="nextStep" :disabled="!userName">Next</button>
    </div>

    <!-- Step 2: Capture avatar from the camera -->
    <div v-else-if="step === 2" class="camera-container">
      <h1>Capture your avatar:</h1>
      <video ref="video" width="320" height="240" autoplay></video>
      <button v-on:click="startCamera"> Start Camera </button>
      <button v-on:click="captureImage"> Take Picture </button>
      <button v-on:click="nextStep" :disabled="!isPictureTaken"> Next </button>
      <button v-on:click="backStep"> Back </button>
    </div>

    <!-- Step 3: Display captured avatar and submit -->
    <div v-else-if="step === 3" class="avatar-container">
      <h1>Your Avatar: {{ this.userName }} </h1>
      <img :src="avatar" alt="User Avatar" class="avatar" />

      <div class="submit-section"> 
        <button v-on:click="participateInPoll" id="submitNameButton">
        READY
        {{ this.uiLabels.participateInPoll }}
      </button>
      <button v-on:click="backStep"> Back </button>
      </div>
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
      userName: "", // User's name
      pollId: "inactive poll", // Placeholder for poll ID
      uiLabels: {}, // UI labels for different languages
      joined: false, // If the user has joined
      avatar: null, // Avatar image data
      lang: localStorage.getItem("lang") || "en", // Language preference
      participants: [],
      stream: null, // The video stream to access the camera

      isPictureTaken: false, //Tracks that camera is closed and picture taken
    };
  },
  created: function () {
    // Set the poll ID from the route parameter
    this.pollId = this.$route.params.id;
    // Listen for server events
    socket.on("uiLabels", (labels) => (this.uiLabels = labels)); // Update UI labels
    socket.on("participantsUpdate", (p) => (this.participants = p)); // Update participants list
    // Navigate to the poll page when the poll starts
    socket.on("startPoll", () => this.$router.push("/poll/" + this.pollId));

    // Emit events to join the poll and get UI labels
    socket.emit("joinPoll", this.pollId);
    socket.emit("getUILabels", this.lang);
  },
  methods: {
    // Move to the next step
    nextStep() {
      if (this.step < 5) {
        this.step++;
      }
    },
    // Move to the previous step
    backStep() {
      if (this.step > 1) {
        this.step--;
        this.isPictureTaken=false;
      }
    },
    // Start the camera stream
    startCamera() {
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
        const tracks = this.stream.getTracks();
        tracks.forEach((track) => track.stop());
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
        console.log("Captured Avatar: ", this.avatar);

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
      if (!this.avatar) {
        alert("Please select or capture an avatar!");
        return;
      }
      socket.emit("participateInPoll", {
        pollId: this.pollId,
        name: this.userName,
        avatar: this.avatar,
      });
      this.joined = true;
    },
  },
};
</script>

<style scoped>
/* Add styles for each section as needed */
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
