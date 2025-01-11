<template>
  <div class="camera-component-container">
    <h1>{{ uiLabels.captureYourAvatar || "Capture your avatar" }}</h1>
    <div class="camera-container">
      <!-- camera view -->
      <div class="camera-view">
        <p v-if="!cameraState && !isPictureTaken">
          <img
            :src="cameraPicIcon"
            alt="Default Camera Placeholder"
            width="320"
            height="240"
          />
        </p>
        <p v-if="cameraState && !isPictureTaken">
          <video ref="video" width="320" height="240" autoplay></video>
        </p>
        <p v-if="isPictureTaken">
          <img :src="avatar" alt="User Avatar" width="320" height="240" />
        </p>
      </div>
      <!-- camera buttons-->
      <div class="camera-buttons">
        <button @click="startCamera" :disabled="cameraState">
          {{ uiLabels.startCamera || "Start camera" }}
        </button>
        <button @click="captureImage" :disabled="!cameraState">
          {{ uiLabels.takePicture || "Take picture" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
//importera bild på kamera att ha som default när ingen bild har tagits
import cameraPicIcon from "@/assets/img/cameraPicIcon.png";

export default {
  name: "CameraComponent",
  props: {
    uiLabels: {},
    disableSwitcher: {},
    isPictureTaken: {},
  },
  data: function () {
    return {
      avatar: null, // Ensure avatar is defined in the data
      cameraState: false,
      stream: null, // The video stream to access the camera
      cameraPicIcon,
    };
  },
  methods: {
    toggleSwitcher() {
      // Emit event to parent to update disableSwitcher state
      this.$emit("update:disableSwitcher", !this.disableSwitcher);
    },
    takePicture() {
      // Emit event to parent to update isPictureTaken state
      this.$emit("update:isPictureTaken", true);
    },
    // Start the camera stream
    startCamera: function () {
      this.$emit("update:isPictureTaken", false);
      this.$emit("update:disableSwitcher", true);
      //this.isPictureTaken = false;
      this.cameraState = true;
      //this.disableSwitcher = true;

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
          this.cameraState = false; // Allow retry if error occurs
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
      this.cameraState = false;
      this.$emit("update:disableSwitcher", false);
      //this.disableSwitcher = false;
    },

    // Capture the image from the video stream
    captureImage: function () {
      const video = this.$refs.video;

      //this.isPictureTaken = true;
      this.$emit("update:isPictureTaken", true);

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

      this.$emit("update:avatar", this.avatar);
    },

    beforeUnmount: function () {
      this.stopCamera(); // Clean up the stream when leaving component
    },
  },
};
</script>

<style scoped>
/* Camera and camera buttons styling */
.camera-component-container {
  display: flex;
  flex-direction: column;
  align-items: center; /* Vertically center items */
  justify-content: center; /* Horizontally center */
  width: 100%;
  box-sizing: border-box;
}

.camera-component-container h1 {
  margin-bottom: 3rem; /* Remove default margin from h1 */
  padding: 1rem; /* Remove any padding */
}

.camera-container {
  display: flex;
  align-items: center; /* Center vertically in the container */
  justify-content: center; /* Align to the left */
  gap: 4rem; /* Space between camera view and the buttons */
}

.camera-view {
  position: relative;
  display: flex; /* Enable flexbox for centering */
  align-items: center; /* Vertical centering */
  justify-content: center; /* Horizontal centering */
  border: 0.1rem solid #f01984;
  border-radius: 50%;
  background-color: #f01984;
  width: 15rem;
  height: 15rem;
  overflow: hidden; /* Clip overflow to maintain circular shape */
}

/* Camera video style */
video,
img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.camera-buttons {
  display: flex; /* Arrange buttons vertically */
  flex-direction: column;
  gap: 0.6rem;
  align-items: flex-start; /* Align buttons to the left of the container */
}

.camera-buttons button {
  padding: 0.75rem 1.25rem;
  background-color: rgb(225, 95, 150); /* Darker pink */
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  transition: all 0.2s ease;
}

.camera-buttons button:hover {
  background-color: rgb(205, 85, 140); /* Darker hover effect */
}

button:disabled {
  pointer-events: none; /* Prevent any mouse interactions */
  opacity: 0.5; /* Make the button appear transparent */
  cursor: not-allowed; /* Change the cursor to indicate the button is disabled */
  transition: none; /* Disable any hover or transition effects */
}

/* Ensure responsive design */
@media (max-width: 768px) {
  .camera-picture-container {
    flex-direction: column; /* Stack vertically on smaller screens */
    align-items: center; /* Center items horizontally */
  }

  .camera-view {
    width: 80%; /* Make the camera view smaller on mobile */
    height: auto;
  }

  .camera-buttons {
    width: 100%;
    align-items: center; /* Center the buttons */
  }

  button {
    width: 100%; /* Buttons take full width */
  }
}
</style>
