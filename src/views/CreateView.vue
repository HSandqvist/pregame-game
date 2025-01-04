<template>
  <body>
    <div class="create-game">
      <h1 id="create-game-headline">
        {{ this.uiLabels.createGame || "Create Game" }}
      </h1>

      <!-- Step 1: Select amount of questions -->
      <div v-if="step === 1" class="amount-questions-section">
        <h2>{{ this.uiLabels.numberOfQuestions || "Number of questions" }}:</h2>
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
      <div class="action-buttons">
        <button @click="finalizeQuestions" :disabled="!tempQuestionsCount">
          {{ this.uiLabels.next || "Next" }}
        </button>
        </div>
      </div>

      <!-- Step 2: Select time per question -->
      <div v-else-if="step === 2" class="time-per-question-section">
        <h2>
          {{ this.uiLabels.secondsPerQuestion || "Seconds per question " }}:
        </h2>
        <div class="time-per-question-buttons">
          <button
            v-for="time in [10, 20, 30]"
            :key="time"
            v-on:click="tempTimePerQuestion = time"
            :class="{ selected: tempTimePerQuestion === time }"
          >
            {{ time }}
          </button>
        </div>
        <div class="action-buttons">
          <button v-on:click="backStep">
            {{ this.uiLabels.back || "back" }}
          </button>
          <button
            id="create-game-button"
            v-on:click="finalizeTime"
            :disabled="!tempTimePerQuestion"
          >
            {{ this.uiLabels.createGame || "Create Game" }}
          </button>
        </div>
      </div>

      <!-- Step 3: Display poll data -->
      <div v-else class="poll-container">
        <div class="poll-data-section">
          <router-link :to="'/result/' + pollId"> Check result </router-link>
          Data: {{ pollData }}
        </div>
      </div>
    </div>
  </body>
</template>

<script>
import questionsEn from "@/assets/questions-en.json"; //läsas in i server istället
import questionsSv from "@/assets/questions-sv.json";

import io from "socket.io-client";
import { toHandlers } from "vue";

// Initialize the WebSocket connection to the server
//const socket = io("localhost:3000");


// ---- FOR ALLOWING OTHERS TO JOIN, CHANGE TO YOUR LOCAL IP ADDRESS ----
const socket = io("192.168.0.195:3000"); // Initialize mutliple joiners


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

      adminId: null,
    };
  },

  created: function () {
    // Listen for incoming events from the server
    socket.on("uiLabels", (labels) => (this.uiLabels = labels));
    socket.on("pollData", (data) => (this.pollData = data));
    socket.emit("getUILabels", this.lang);
    //this.generateAdminID() görs redan
  },

  methods: {
    generatePollID: function () {
      this.pollId = Math.floor(100000 + Math.random() * 900000).toString();
    },

    generateAdminID: function () {
      this.adminId = Math.floor(10000 + Math.random() * 90000).toString(); //specified adminId to set a participant to admin
      const userId = this.adminId;
      console.log("Admin ID is:", this.adminId);

      //setting in local storage name item, visuable to admin only
      localStorage.setItem("userId", userId);
      console.log("User ID stored:", localStorage.getItem("userId"));
    },

    finalizeQuestions: function () {
      this.selectedQuestionCount = this.tempQuestionsCount;
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
      this.generateAdminID();

      this.generatePollID();

      // Send file with questions to server
      this.loadQuestionsFromFile(); // read json file questions and send to server

      socket.emit("createPoll", {
        pollId: this.pollId,
        lang: this.lang,
        adminId: this.adminId,
        questionCount: this.selectedQuestionCount,
        timerCount: this.selectedTime,
      });

      socket.emit("joinPoll", { pollId: this.pollId });

      socket.emit("thisIsAdminId", {
        pollId: this.pollId,
        adminId: this.adminId,
      });

      this.$router.push(`/lobby/${this.pollId}`);
    },

    // Method to load the questions from the file, send to server
    loadQuestionsFromFile: function () {
      // Choose the appropriate JSON data based on the selected language
      const allQuestionsFromFile =
        this.lang === "en" ? questionsEn : questionsSv;

      // Emit the JSON data to the server
      try {
        //console.log("Questions to be sent:", allQuestionsFromFile);
        socket.emit("sendQuestionsFromFileData", allQuestionsFromFile); // Send data to the server
      } catch (error) {
        console.error("Error sending questions to server:", error);
      }
    },
  },
};
</script>

<style scoped>
/* General styling */
body {
  margin: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-family: Arial, sans-serif;
  color: white;
}

/* Buttons */
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
  gap: 30px;
  margin-top: 20px;
}
/* Add spacing between the time buttons and the action buttons */
.action-buttons {
  margin-top: 40px; /* Adjust this value as needed */
  display: flex;
  justify-content: center;
  gap: 20px; /* Keeps space between the buttons themselves */
}

#create-game-headline {
  color: rgb(255, 205, 226);
}

#create-game-button {
  background-color: rgb(252, 63, 173);
}

#create-game-button:hover {
  background-color: rgb(219, 34, 142);
}
</style>
