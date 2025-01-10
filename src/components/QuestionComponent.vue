<template>
  <div>
    <div v-if="!voting">
    <h3>{{ this.uiLabels.whichPlayer || "Which player?" }}</h3>

    <h2 >{{ question.q }}</h2>

    <!-- Draggable answer options -->
    <div  class="answer-options">
      <div
        v-for="(participant, index) in participants"
        :key="index"
        class="draggable"
        draggable="true"
        @dragstart="onDragStart(participant)"
      >
      <img
          :src="participant.avatar"
          alt="Participant Avatar"
          class="participant-avatar"
        />
      </div>
    </div>

    <!-- Drop zone -->
    <div  class="drop-zone" @dragover.prevent @drop="onDrop">
      {{ this.uiLabels.dropAnswerHere || "Drop answer here" }}
    </div>
  </div>

  <h2 v-if="voting">
    <span 
      v-for="(char, index) in textArray" 
      :key="index" 
      class="bouncing-char"
      :style="{ animationDelay: getDelay(index) + 's' }"
    >
      {{ char }}
    </span>
  </h2>

    <!-- h2 v-if="voting" v-motion="jumpingCharacter"> {{ this.uiLabels.waitingForAnswers || "Waiting for answers.." }} </h2 -->
  </div>
</template>

<script>
// Initialize the WebSocket connection
import io from "socket.io-client";
const socket = io("localhost:3000");

export default {
  name: "QuestionComponent",
  props: {
    question: Object, // The question object containing the question text and answer options
    participants: Array, // List of participants, // Already randomized in data
    voting: Boolean,
  },
  emits: ["answer"], // Declare the custom event "answer" emitted by this component

  data() {
    return {
      draggedParticipant: null, // Temporarily holds the dragged participant
      uiLabels: {}, // UI labels for different languages
      lang: localStorage.getItem("lang") || "en", // Language preference
    };
  },

  created: function () {
    socket.on("uiLabels", (labels) => (this.uiLabels = labels)); // Update UI labels
    // Emit events to get UI labels and join the poll
    socket.emit("getUILabels", this.lang);
    //console.log("Participants data:", this.participants);

  },

  computed: {
    textArray() {
      // Split the text into an array of individual characters
      return (this.uiLabels.waitingForAnswers || "Waiting for answers..").split('');
    },
  },

  methods: {
    getDelay(index) {
      // Apply a wave effect delay to each character, making it look like a wave
      const waveDelay = Math.sin(index * 0.5) * 0.5; // Using sine for smooth wave pattern
      return waveDelay;
    },

    // When dragging starts, store the dragged participant
    onDragStart: function(participant) {
      this.draggedParticipant = participant;
    },

    // When an item is dropped in the drop zone
    onDrop: function() {
      if (this.draggedParticipant) {
        // Emit the dragged participant as the selected answer
        this.$emit("answer", this.draggedParticipant);

        // Clear the temporary variable
        this.draggedParticipant = null;
      }
    },

    /*
    // Method to handle answer selection
    answer: function (participant) {
      // Emit the "answer" event to the parent component with the selected answer as payload
      this.$emit("answer", participant);
    },
    */
  },
};
</script>

<style>
/* Siracha - lite skriv-aktig men läsbar */
@import url("https://fonts.googleapis.com/css2?family=Sriracha&display=swap");

.participant-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%; /* Makes the avatars round */
  object-fit: cover; /* Ensures the image fills the container without distortion */
  border: 2px solid #ccc;
  cursor: grab;
  transition: transform 0.2s ease;
  -webkit-user-drag: none;
}

.participant-avatar:active {
  transform: scale(1.1); /* Slightly enlarge the avatar when dragging */
}

/* Draggable answer options */
.draggable {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0.5rem;
}

.drop-zone {
  width: 140px;
  height: 140px;
  border: 6px dotted rgb(252, 160, 198);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 1rem auto;
  background-color: rgba(252, 160, 198, 0.1);
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.draggable:active {
  cursor: grabbing;
  transform: scale(1.05);
}

/* Container for draggable items */
.answer-options {
  display: flex;
  flex-wrap: wrap; /* Allow items to wrap if they exceed container width */
  gap: 1rem; /* Space between items */
  justify-content: center;
  margin-bottom: 2rem;
}

/* Drop zone for answers */
.drop-zone:hover {
  background-color: rgba(252, 160, 198, 0.1);
  transform: scale(1.05);
}




@keyframes bounce {
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px); /* Bounce upwards */
  }
  100% {
    transform: translateY(0);
  }
}

.bouncing-char {
  display: inline-block;
  animation: bounce 5s ease-in-out infinite; /* Apply bounce animation */
}

h2 span {
  display: inline-block;
  margin: 0 2px; /* Small space between characters */
}
</style>
