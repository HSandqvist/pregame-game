<template>
  <body>
    <div class="create-game">
      <h1 id="create-game-headline">Create game</h1>

      <!-- Step 1: Select amount of questions -->
      <div v-if="step === 1" class="amount-questions-section">
        <h2> Number of questions: </h2>
        <div class="amount-questions-buttons">
          <button
            v-for="count in [5, 10, 15]"
            :key="count"
            @click="tempQuestionsCount = count"
            :class="{ selected: tempQuestionsCount === count }"
          >
            {{ count }}
          </button>
        </div>
        <button @click="finalizeQuestions" :disabled="!tempQuestionsCount">
          Next
        </button>
      </div>

      <!-- Step 2: Select time per question -->
      <div v-else-if="step === 2" class="time-per-question-section">
        <h2>Seconds per question:</h2>
        <div class="time-per-question-buttons">
          <button
            v-for="time in [10, 20, 30]"
            :key="time"
            @click="tempTimePerQuestion = time"
            :class="{ selected: tempTimePerQuestion === time }"
          >
            {{ time }}
          </button>
        </div>
        <button @click="backStep">Back</button>
        <button @click="finalizeTime" :disabled="!tempTimePerQuestion">
          Create game
        </button>
      </div>

      <!-- Step 3: Display poll data -->
      <div v-else class="poll-container">
        <div class="poll-data-section">
          <router-link :to="'/result/' + pollId">Check result</router-link>
          Data: {{ pollData }}
        </div>
      </div>
    </div>
  </body>
</template>

<script>
import io from "socket.io-client";
// Initialize the WebSocket connection to the server
const socket = io("localhost:3000");

export default {
  name: "CreateView",
  data: function () {
    return {
      step: 1, // Current step of the game creation process
      lang: localStorage.getItem("lang") || "en",
      pollId: "",
      pollData: {}, // Poll data received from the server
      uiLabels: {}, // UI labels for different langs

      // Temporary values for selections
      tempQuestionsCount: null,
      tempTimePerQuestion: null,

      // Finalized values for the poll
      selectedQuestionCount: null,
      selectedTime: null,
    };
  },

  created: function () {
    // Listen for incoming events from the server
    socket.on("uiLabels", (labels) => (this.uiLabels = labels));
    socket.on("pollData", (data) => (this.pollData = data));
    socket.emit("getUILabels", this.lang);
  },

  methods: {
    generatePollID: function () {
      this.pollId = Math.floor(100000 + Math.random() * 900000).toString();
    },

    finalizeQuestions: function () {
      this.selectedQuestionCount = this.tempQuestionsCount;
      socket.emit("setAmountQuestions", {
        pollId: this.pollId,
        count: this.selectedQuestionCount,
      });
      this.nextStep();
    },

    finalizeTime: function () {
      this.selectedTime = this.tempTimePerQuestion;
      socket.emit("setTimePerQuestion", {
        pollId: this.pollId,
        time: this.selectedTime,
      });
      this.createPoll();
    },

    nextStep: function () {
      this.step++;
    },

    backStep: function () {
      this.step--;
    },

    createPoll: function () {
      this.generatePollID();
      socket.emit("createPoll", { pollId: this.pollId, lang: this.lang });
      socket.emit("joinPoll", this.pollId);
      this.$router.push(`/lobby/${this.pollId}`);
    },
  },
};
</script>

<style scoped>
/* @import url('https://fonts.googleapis.com/css2?family=Limelight&family=Truculenta:opsz,wght@12..72,100..900&display=swap'); */
/* General styling */
body {
  margin: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(to right, rgb(210, 66, 133), purple);
  font-family: Arial, sans-serif;
  color: white;
}

/* h1 {
  font-family: "Limelight", sans-serif;
  font-size: 50pt;
  margin-bottom: 10px;
} */

/* h2 {
  font-family: "Truculenta", sans-serif;
  margin-top: -10px;
} */

/* Buttons */
button {
  padding: 15px 30px;
  background-color: pink;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 18px;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  transition: all 0.2s ease;
}

button:hover {
  background-color: rgb(255, 131, 203);
}

button.selected {
  background-color: rgb(255, 131, 203);
  border: 2px solid white;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Button groups */
.amount-questions-buttons,
.time-per-question-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
}
</style>
