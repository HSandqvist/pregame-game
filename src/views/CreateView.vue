<template>
  <div class="create-game">
    <!-- Language switcher component -->
    <LanguageSwitcher @language-changed="updateLanguage" />
    <h1 id="create-game-headline">
      {{ this.uiLabels.createGame || "Create Game" }}
    </h1>

    <!-- Step 1: Select amount of questions -->
    <div v-if="step === 1" class="amount-questions-section">
      <InstructionButton
        :uiLabels="uiLabels"
        :viewKey="'NOQUESTIONS'"
      />
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

    <!-- step 2: select language for questions -->
    <div v-else-if="step === 2" class="language-for-questions-section">
      <InstructionButton
        :uiLabels="uiLabels"
        :viewKey="'LANGUAGECHOICE'"  
      />
      <h2>
        {{
          this.uiLabels.languageForQuestions ||
          "Choose language for questions "
        }}:
      </h2>
      <div class="language-for-questions-buttons">
        <button
          v-on:click="tempLangQuestions = 'sv'"
          :class="{ selected: tempLangQuestions === 'sv' }"
        >
          {{ this.uiLabels.swedish || "Swedish" }}
        </button>
        <button
          v-on:click="tempLangQuestions = 'en'"
          :class="{ selected: tempLangQuestions === 'en' }"
        >
          {{ this.uiLabels.english || "English" }}
        </button>
      </div>

      <div class="action-buttons">
        <button v-on:click="backStep">
          {{ this.uiLabels.back || "back" }}
        </button>
        <button
          id="create-game-button"
          v-on:click="finalizeLang"
          :disabled="!tempLangQuestions"
        >
          {{ this.uiLabels.createGame || "Create Game" }}
        </button>
      </div>
    </div>

    <div class="back-to-start">
      <button @click="goToStartPage">
        {{ this.uiLabels.backToStart || "Back to Start" }}
      </button>
    </div>
  </div>
</template>

<script>
import questionsEn from "@/assets/questions-en.json"; //läsas in i server istället
import questionsSv from "@/assets/questions-sv.json";
import InstructionButton from "@/components/InstructionButton.vue";

import io from "socket.io-client";
import LanguageSwitcher from "@/components/LanguageSwitcher.vue";

// Initialize the WebSocket connection to the server
const socket = io("localhost:3000");

// ---- FOR ALLOWING OTHERS TO JOIN, CHANGE TO YOUR LOCAL IP ADDRESS ----
//const socket = io("130.243.223.240:3000"); // Initialize mutliple joiners

export default {
  name: "CreateView",
  components: {
    LanguageSwitcher,
    InstructionButton,
  },
  data: function () {
    return {
      step: 1, // Current step of the game creation process
      lang: localStorage.getItem("lang") || "en",
      pollId: "",
      pollData: {}, // Poll data received from the server
      uiLabels: {}, // UI labels for different langs

      // Temporary values for selections
      tempQuestionsCount: null,
      tempLangQuestions: null,

      // Finalized values for the poll
      selectedQuestionCount: null,
      selectedLang: null,

      adminId: null,
    };
  },

  created: function () {
    // Listen for incoming events from the server
    socket.on("uiLabels", (labels) => (this.uiLabels = labels));
    socket.on("pollData", (data) => (this.pollData = data));
    socket.emit("getUILabels", this.lang);
    },

  methods: {
    // Update language when changed in LanguageSwitcher
    updateLanguage(lang) {
      this.lang = lang;
      socket.emit("getUILabels", this.lang);
    },

    generatePollID: function () {
      this.pollId = Math.floor(100000 + Math.random() * 900000).toString();
    },

    generateAdminID: function () {
      this.adminId = Math.floor(10000 + Math.random() * 90000); //specified adminId to set a participant to admin
      const userId = this.adminId;

      //setting in local storage name item, visuable to admin only
      localStorage.setItem("userId", userId);
    },

    finalizeQuestions: function () {
      this.selectedQuestionCount = this.tempQuestionsCount;
      this.nextStep();
    },

    finalizeLang: function () {
      this.selectedLang = this.tempLangQuestions;
      // Send file with questions to server
      this.loadQuestionsFromFile(); // read json file questions and send to server

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

      socket.emit("createPoll", {
        pollId: this.pollId,
        lang: this.lang,
        adminId: this.adminId,
        questionCount: this.selectedQuestionCount,
      });

      socket.emit("joinPoll", this.pollId);

      socket.emit("thisIsAdminId", {
        pollId: this.pollId,
        adminId: this.adminId,
      });

      this.$router.push(`/lobby/${this.pollId}`);
    },

    // Method to load the questions from the file, send to server
    loadQuestionsFromFile: function () {
      // Choose the appropriate JSON data based on the selected language in question
      const allQuestionsFromFile =
        this.selectedLang === "en" ? questionsEn : questionsSv;

      // Emit the JSON data to the server
      try {
        socket.emit("sendQuestionsFromFileData", allQuestionsFromFile); // Send data to the server
      } catch (error) {
        console.error("Error sending questions to server:", error);
      }
    },

    goToStartPage: function() {
      this.$router.push("/");
    },
  },
};
</script>

<style scoped>
/* General styling */
.create-game {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  font-family: Arial, sans-serif;
  text-align: center;
  position: relative;
  color: white;
}



/* Button groups */
.amount-questions-buttons,
.language-for-questions-buttons {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-top: 20px;
  background: none; /* If body or parent has background */
}
/* Add spacing between the action buttons */
.action-buttons {
  margin-top: 40px; /* Adjust this value as needed */
  display: flex;
  justify-content: center;
  gap: 20px; /* Keeps space between the buttons themselves */
  background: none; /* If body or parent has background */
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

/* jump to start page button */
.back-to-start {
  position: fixed;
  bottom: 3rem; /* Distance from the bottom of the screen */
  left: 3rem; /* Distance from the left side of the screen */
}
</style>
