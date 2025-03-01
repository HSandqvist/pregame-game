<template>
  <div v-if="!isAdmin">
    <InstructionButton :uiLabels="uiLabels" :viewKey="'POLLVIEW'" />
  </div>
  <div v-if="isAdmin">
    <InstructionButton
      :uiLabels="uiLabels"
      :viewKey="'ADMINPOLLVIEW'"
    />
    <MusicPlayer :viewKey="'POLLVIEW'" />
  </div>
  <LanguageSwitcher @language-changed="updateLanguage" />

  <div class="screen-container">
    <!-- top screen content -->
    <div class="top-box">
      <h1 id="game-id-headline">
        {{ this.uiLabels.gameID || "Game ID" }}: {{ pollId }}
      </h1>
    </div>
    <!-- middle screen content -->
    <div class="middle-box">
      <div v-if="view === 'question_view'">
        <!-- Render the question component -->
        <QuestionComponent
          v-bind:question="currentQuestion"
          v-bind:participants="currentQuestion.a"
          :voting="hasVoted"
          v-model:uiLabels="uiLabels"
          v-on:answer="submitAnswer($event)"
        />
      </div>

      <div v-if="view === 'results_view'">
        <!-- Render ResultQuestionComponent -->
        <ResultQuestionComponent
          :topAnswer="topAnswer"
          :maxVotes="maxVotes"
          :topAvatar="topAvatar"
          v-model:uiLabels="uiLabels"
        />
      </div>

      <div v-if="view === 'final_view'">
        <!-- Render ResultQuestionComponent -->
        <ResultQuestionComponent
          :topAnswer="topAnswer"
          :maxVotes="maxVotes"
          :topAvatar="topAvatar"
          v-model:uiLabels="uiLabels"
        />
      </div>
    </div>

    <!-- bottom screen content -->
    <div class="bottom-box">
      <div class="admin-functions-in-poll">
        <div v-if="view === 'question_view'">
          <button
            v-if="isAdmin"
            v-on:click="adminNext()"
            :disabled="numberOfVotes == 0"
          >
            {{ this.uiLabels.showResult || "Show result" }}
          </button>
          <!-- Amount of votes only visible by admin -->
          <p v-if="isAdmin">
            {{ this.numberOfVotes }} {{ this.uiLabels.outOf || "out of" }}
            {{ this.totalNumberOfParticipants }}
            {{ this.uiLabels.hasVoted || "has voted" }}
          </p>
        </div>
        <!-- admin result view button and go next-->
        <div v-if="view === 'results_view'">
          <div v-if="isAdmin === true">
            <button
              @click="adminNext"
              :disabled="currentQuestionIndex === questions.length - 1"
            >
              {{ this.uiLabels.nextQuestion || "Next question" }}
            </button>
          </div>
        </div>
        <!-- admin final view button-->
        <div v-if="view === 'final_view'">
          <div v-if="isAdmin === true">
            <button @click="adminToResults">
              {{ this.uiLabels.endgame || "End game" }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import QuestionComponent from "@/components/QuestionComponent.vue";
import ResultQuestionComponent from "@/components/ResultQuestionComponent.vue";
import InstructionButton from "@/components/InstructionButton.vue"; //Import InstructionButton component
import LanguageSwitcher from "@/components/LanguageSwitcher.vue";
import MusicPlayer from "@/components/MusicPlayer.vue";

// Initialize the WebSocket connection
import io from "socket.io-client";
const socket = io(sessionStorage.getItem("dataServer"));

// ---- FOR ALLOWING OTHERS TO JOIN, CHANGE TO YOUR LOCAL IP ADDRESS ----
//const socket = io("130.243.223.240:3000"); // Initialize mutliple joiners

export default {
  name: "PollView",
  components: {
    QuestionComponent, // Register the QuestionComponent
    ResultQuestionComponent, //Register the ResultQuestionComponent
    InstructionButton,
    MusicPlayer,
    LanguageSwitcher,
  },
  data: function () {
    return {
      // Current question data (question text and answer options)
      currentParticipant: {}, //the participant using a certain poll client
      userId: "",

      participants: [], // List of participants for the question
      pollId: "inactive poll",
      submittedAnswers: {},
      isAdmin: false,
      numberOfVotes: 0,
      totalNumberOfParticipants: 0,

      questionCount: 0,
      questions: [], // Array of all questions
      currentQuestionIndex: 0, // Tracks the index of the current question
      currentQuestion: { q: "", a: [] }, // Represents the current question and its answers

      topAnswer: "", // Initialize with an empty string
      maxVotes: 0, // Initialize with 0
      topAvatar: "", //Will store picture of the top voted person

      hasVoted: false,
      view: "question_view", // 'question_view' or 'results_view'

      uiLabels: {}, // UI labels for different languages
      lang: localStorage.getItem("lang") || "en", // Language preference
    };
  },

  created: function () {
    // Poll ID    // Set the poll ID from route params
    this.pollId = this.$route.params.id;

    // User ID    // Set the user ID from route params
    this.userId = this.$route.params.userId;

    this.checkAdminStatus();

    socket.emit("getCurrentParticipant", {
      pollId: this.pollId,
      userId: this.userId,
    });

    socket.emit("pollInfoUpdatePersonal", { pollId: this.pollId });

    socket.on("pollInfoUpdate", (d) => {
      this.view = d.currentView;
      this.currentQuestionIndex = d.currentQuestion; //current question i data är ett index
      this.updateCurrentQuestion(this.currentQuestionIndex);
    });

    socket.emit("getAllParticipantsForGame", this.pollId);

    socket.on("allParticpantsForGame", (participantData) => {
      this.participants = participantData; // Ensure the array is directly assigned here.
      this.totalNumberOfParticipants = participantData.length;
    });

    // Get this participant
    socket.on("currentParticipant", (participantData) => {
      this.currentParticipant = participantData;
    });

    socket.on(
      "participantNextQuestion",
      () => this.particpantNext(),
      this.updateCurrentQuestion(this.currentQuestionIndex)
    );

    //LISTENER FOR GAME END
    socket.on("finishGame", () => this.toResults());

    socket.on(
      "submittedAnswersUpdate",
      (answers) => (this.submittedAnswers = answers)
    ); // Update the submitted answers

    socket.on("uiLabels", (labels) => {
      this.uiLabels = labels;
    });

    // Emit events to get UI labels and join the poll
    socket.emit("getUILabels", this.lang);

    socket.emit("joinPoll", this.pollId);

    // Begär redan sparade svar från servern
    socket.emit("getSubmittedAnswers", this.pollId);

    socket.on("previousAnswers", (answers) => {
      this.submittedAnswers = answers;
    });

    //ask server for chosen questions
    socket.emit("getQuestionsForGame", this.pollId);

    //Get questions from server
    socket.on("questionsForGame", (qs) => {
      if (qs) {
        this.questions = qs;
        // Start with the first question
        this.currentQuestion = this.questions[this.currentQuestionIndex];
      } else {
        console.error("Received empty questions array from server.");
      }
    });

    //Kolla så kallas på efter att folk har röstat
    socket.off("topAnswerUpdate"); // Clear any existing listeners

    socket.on("topAnswerUpdate", (data) => {
      const { topAnswer, maxVotes, topAvatar } = data;
      this.topAnswer = topAnswer;
      this.maxVotes = maxVotes;
      this.topAvatar = topAvatar;

      //Uppdaterar röstare. Kan vara problematisk
      socket.on("updateNumberOfVotes", () => {
        if (this.isAdmin) {
          this.numberOfVotes += 1;

          if (this.numberOfVotes === this.participants.length) {
            this.adminNext();
          }
        }
        socket.off("updateNumberOfVotes");
      });
    });
  },

  methods: {
    updateLanguage(lang) {
      this.lang = lang;
      socket.emit("getUILabels", this.lang);
    },

    submitAnswer: function (answer) {
      // Emit the answer to the server
      socket.emit("submitAnswer", {
        pollId: this.pollId,
        answer: answer,
        voter: this.userId,
      });

      //uppdatera topanswer och votecounten

      socket.emit("runQuestionResults", this.pollId);
      this.hasVoted = true;
      socket.emit("playerVoted", this.pollId);
      //flyttat socket.on top answer update till created delen
    },

    checkAdminStatus: function (callback) {
      // Emit admin check request
      socket.emit("checkAdmin", { pollId: this.pollId, userId: this.userId });

      // Listen for the server's response
      socket.on("adminCheckResult", (data) => {
        if (data.isAdmin) {
          this.isAdmin = true; // Set admin flag
        } else if (data.error) {
          console.error(data.error); // Handle errors (e.g., poll does not exist)
          alert(data.error);
          return; // Stop further execution
        } else {
          this.isAdmin = false; // Set participant flag
        }
        // Execute the callback after admin check
        if (typeof callback === "function") callback();
      });
    },

    nextQuestion: function () {
      // Check if the current question is NOT the last question
      this.hasVoted = false;
      this.numberOfVotes = 0;
    },

    adminNext: function () {
      socket.emit("nextQuestion", this.pollId, this.userId);
      socket.emit("updatePollInfo", {
        pollId: this.pollId,
        currentView: this.view,
      });
    },

    particpantNext: function () {
      if (this.view === "question_view") {
        if (this.isAdmin) {
          socket.emit("votingReset", this.pollId);
        }
      } else if (this.view === "results_view" || this.view === "final_view") {
        this.nextQuestion();
      }
    },
    updateCurrentQuestion: function (index) {
      if (this.questions && this.questions[index]) {
        this.currentQuestion = this.questions[index];
      }
    },

    adminToResults: function () {
      socket.emit("toResults", this.pollId, this.userId);
    },

    toResults: function () {
      this.$router.push(`/result/${this.pollId}/${this.userId}`);
    },
  },
};
</script>

<style scoped>
/* Parent container to manage the layout */
.screen-container {
  display: flex;
  flex-direction: column;
  height: 100vh; /* Full height of the screen */
  width: 100vw; /* Fill screen width */
  gap: 0.2rem; /* Optional: Adds space between boxes */
  margin: 0; /* Remove default margin */
  padding: 0; /* Remove default padding */
}

/* Top box styles */
.top-box {
  min-height: 20vh; /* Fixed height, adjust as needed */
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  position: sticky;
}

/* Middle box styles */
.middle-box {
  flex-grow: 1; /* Take up remaining space */
  min-height: 55vh; /* Adjust based on available space */
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  margin: 1rem;
}

/* Bottom box styles */
.bottom-box {
  min-height: 20vh; /* Adjust height as needed */
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  position: sticky;
}

.admin-functions-in-poll {
  position: absolute; /* i förhållande till bottom box, alt sätta som relative */
  top: 1rem;
  right: 3rem;
  z-index: 3;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.admin-functions-in-poll button {
  margin-top: 10px; /* Adds spacing between buttons and other admin elements */
}

#game-id-headline {
  color: rgb(252, 181, 212);
  text-shadow: 1px 1px 0 rgb(196, 0, 111), -1px 1px 0 rgb(196, 0, 111),
    1px -1px 0 rgb(196, 0, 111), -1px -1px 0 rgb(196, 0, 111);

  position: sticky; /* Kan bli problem på mobiltelefon */
  top: 3rem;
  z-index: 2; /* Ensures it stays above other content */
  max-width: 50%;
}

/* General Button Styling */
button {
  margin-right: 10px; /* Adds spacing between buttons */
}

button:hover {
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.2);
}

@media (max-width: 430px) {
  .admin-functions-in-poll {
    position: absolute; /* i förhållande till bottom box, alt sätta som relative */
    z-index: 3;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 1rem;
    top: 1rem;
    left: 50%;
    transform: translateX(-50%); /* Center element horizontally */
  }
}
</style>
