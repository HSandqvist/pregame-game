<template>
  <div>
    <h3>{{ this.uiLabels.whichPlayer || "Which player?" }}</h3>

    <h2>{{ question.q }}</h2>

    <!-- Draggable answer options -->
    <div v-if="!voting" class="answer-options">
      <div
        v-for="(participant, index) in participants"
        :key="index"
        class="draggable"
        draggable="true"
        @dragstart="onDragStart(participant)"
      >
        {{ participant.name }}
      </div>
    </div>

    <!-- Drop zone -->
    <div v-if="!voting" class="drop-zone" @dragover.prevent @drop="onDrop">
      {{ this.uiLabels.dropAnswerHere || "Drop answer here" }}
    </div>

    <p v-if="voting"> {{ this.uiLabels.waitingForAnswers || "Waiting for answers.." }} </p>
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
  },

  methods: {
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

/* Draggable answer options */
.draggable {
  width: 120px; /* Set a fixed width for the answer boxes */
  height: 50px; /* Set a fixed height for the answer boxes */
  margin: 0.5rem;
  padding: 0.5rem; /* Adjust padding for better content fit */
  background-color: rgb(252, 160, 198);
  color: white;
  border-radius: 5px;
  text-align: center;
  cursor: grab;
  user-select: none;
  display: flex; /* Flexbox for centering text */
  justify-content: center;
  align-items: center;
  transition: transform 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  /* font styling specific */
  font-family: "Siracha", Arial, Helvetica, sans-serif;
  font-size: 1rem;
  font-weight: bold;
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
.drop-zone {
  width: 140px; /* Slightly larger than the answer boxes */
  height: 60px; /* Slightly taller than the answer boxes */
  padding: 0.5rem;
  background-color: rgba(0, 0, 0, 0.05);
  border: 6px dotted rgb(252, 160, 198);
  border-radius: 10px;
  text-align: center;
  color: rgb(252, 160, 198);
  font-size: 1rem;
  display: flex; /* Flexbox for centering text */
  justify-content: center;
  align-items: center;
  transition: background-color 0.3s ease, transform 0.2s ease;
  margin: 0 auto; /* Center the drop zone horizontally */

  /* font styling specific */
  font-family: "Siracha", Arial, Helvetica, sans-serif;
  font-size: 1rem;
  font-weight: bold;
}

.drop-zone:hover {
  background-color: rgba(252, 160, 198, 0.1);
  transform: scale(1.05);
}
</style>
