<template>
  <div class="camera-component-container">
    <h1>{{ uiLabels.captureYourAvatar || "Capture your avatar" }}</h1>
    <div class="camera-container">
      <!-- camera view -->
      <div class="camera-view">
        <p v-if="!cameraState && !isPictureTaken">
          <img
            :src="noImageIcon"
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

    <CameraError
      :show="isCameraAvailable"
      :uiLabels="uiLabels"
      @confirm="isCameraAvailable = false"
    />
  </div>
</template>

<script>
//importera bild på kamera att ha som default när ingen bild har tagits
import noImageIcon from "@/assets/img/noImageIcon.png";
import CameraError from "@/components/modals/CameraError.vue";

export default {
  name: "CameraComponent",
  components: {
    CameraError,
  },
  props: {
    uiLabels: {},
    disableSwitcher: {},
    isPictureTaken: {},
    cameraState: {},
  },
  data: function () {
    return {
      avatar: null, // Ensure avatar is defined in the data
      stream: null, // The video stream to access the camera
      noImageIcon,
      isCameraAvailable: false,
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
      this.$emit("update:cameraState", true);

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
        })
        .catch((error) => {
          console.error("Error accessing camera:", error);
          this.stopCamera();
          this.isCameraAvailable = true;
          this.$emit("update:cameraState", false); // Allow retry if error occurs
          this.$emit("update:isPictureTaken", false); // Allow retry if error occurs
        });
    },

    // Stop the camera stream
    stopCamera: function () {
      if (this.stream) {
        const tracks = this.stream.getTracks();
        tracks.forEach((track) => track.stop()); //stop all tracks
        this.stream = null; //added
      }
      if (this.$refs.video) {
        this.$refs.video.srcObject = null; // Clear the video element source
      }
      this.$emit("update:cameraState", false);
      this.$emit("update:disableSwitcher", false);
    },

    // Capture the image from the video stream
    captureImage: function () {
      const video = this.$refs.video;
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

        this.$emit("update:cameraState", false); // Disable camera actions

        // Stop the camera stream after capturing the image
        this.stopCamera();
      } else {
        console.error("Video stream is not available.");
        this.stopCamera();
        this.isCameraAvailable = true;
        this.$emit("update:cameraState", false); 
        this.$emit("update:isPictureTaken", false);
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
  background-color: rgb(252, 63, 173);
  min-width: 10rem;
  border: solid 0.06rem rgb(214, 25, 135);
}

.camera-buttons button:hover {
  background-color: rgb(214, 25, 135); /* Darker hover effect */
}

button {
  min-width: 8rem;
  min-height: 3rem;
}

/* Ensure responsive design */
@media (max-width: 768px) {
  .camera-container {
    flex-direction: column; /* Stack vertically on smaller screens */
    align-items: center; /* Center items horizontally */
  }

  .camera-view {
    min-width: 12rem; /* Make the camera view smaller on mobile */
    min-height: 12rem;
  }

  .camera-buttons {
    align-items: center; /* Center the buttons */
    flex-direction: row;
    width: 100%;
    gap: 1rem;
  }

  button {
    min-height: 4rem;
    width: 100%;
  }
}

@media (max-height: 667px) {
  .camera-picture-container {
    margin-top: 3rem;
    max-height: 40%;
  }
  .camera-view {
    max-width: 12rem; /* Make the camera view smaller on mobile */
    max-height: 12rem;
    margin-bottom: 0;
  }
  .camera-buttons {
    margin: 0;
  }
}
</style>
