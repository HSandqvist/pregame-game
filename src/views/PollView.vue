<template>
  <div>
    <h1>Poll id: {{ pollId }}</h1>
    <!-- Render the QuestionComponent and pass the current question as a prop -->
    <hr />
    <!-- Render all questions from the questions array, TA BORT SEN NÄR ALLT FUNKAR -->
    <h3>All Questions:</h3>
    <ul>
      <li v-for="(q, index) in questions" :key="index">
        {{ q }}
      </li>
    </ul>

    <div v-if="view === 'question_view'">
      <!-- Render the question component -->
      <QuestionComponent
        v-bind:question="currentQuestion"
        v-bind:participants="currentQuestion.a"
        v-on:answer="submitAnswer($event)"
      />
    </div>

    <div v-if="view === 'results_view'">
      <!-- Render ResultQuestionComponent -->
      <ResultQuestionComponent :topAnswer="topAnswer" :maxVotes="maxVotes" />

      <!-- add so only admin can use buttons -->
      <!-- div v-if="isAdmin === true" -->
      <button
        @click="nextQuestion"
        :disabled="currentQuestionIndex === questions.length - 1"
      >
        Next question
      </button>
      <!-- /div -->
    </div>

    <!-- testar!! för finalview-->
    <div v-if="view === 'final_view'">
      <!-- Render ResultQuestionComponent -->
      <ResultQuestionComponent :topAnswer="topAnswer" :maxVotes="maxVotes" />

      <!-- add so only admin can use buttons -->
      <!-- div v-if="isAdmin === true" -->
      <button @click="toResults">Endgame</button>
      <!-- /div -->
    </div>

    <!-- Navigation to change the current question 
    <button @click="prevQuestion" :disabled="currentQuestionIndex === 0">
      Previous
    </button>-->

    <!-- Visa array av svaren
    <h3>Saved answers:</h3>
    <div>
      <p id="topAnswer">Top Answer:</p>
      <p id="topVotes">Votes:</p>
    </div>
    <ul>
      <li v-for="(votes, name) in submittedAnswers[pollId]" :key="name">
        {{ name }}: {{ votes }} votes
      </li>
    </ul> -->
  </div>
</template>

<script>
// @ is an alias to /src
import QuestionComponent from "@/components/QuestionComponent.vue";
import ResultQuestionComponent from "@/components/ResultQuestionComponent.vue";
//import questionsEn from "@/assets/questions-en.json";
//import questionsSv from "@/assets/questions-sv.json";

// Initialize the WebSocket connection
import io from "socket.io-client";
const socket = io("localhost:3000");

export default {
  name: "PollView",
  components: {
    QuestionComponent, // Register the QuestionComponent
    ResultQuestionComponent, //Register the ResultQuestionComponent
  },
  data: function () {
    return {
      // Current question data (question text and answer options)
      //question: {q: "", a: [],}, // Legacy object for compatibility
      participants: [], // List of participants for the question
      pollId: "inactive poll",
      submittedAnswers: {},

      questionCount: 0,
      questions: [], // Array of all questions
      currentQuestionIndex: 0, // Tracks the index of the current question
      currentQuestion: { q: "", a: [] }, // Represents the current question and its answers

      topAnswer: "", // Initialize with an empty string
      maxVotes: 0, // Initialize with 0

      view: "question_view", // 'question_view' or 'results_view'
    };
  },

  created: function () {
    // Poll ID    // Set the poll ID from
    this.pollId = this.$route.params.id;

    // Listen for server events to update the question and submitted answers
    socket.on("questionUpdate", (q) => {
      this.currentQuestion = q;
      console.log("Updated question:", q); // Add this log
    }); // Update the current question

    socket.on(
      "submittedAnswersUpdate",
      (answers) => (this.submittedAnswers = answers)
    ); // Update the submitted answers

    socket.on("uiLabels", (labels) => (this.uiLabels = labels)); // Update UI labels

    // Emit events to get UI labels and join the poll
    socket.emit("getUILabels", this.lang);

    socket.emit("joinPoll", this.pollId);

    // Begär redan sparade svar från servern
    socket.emit("getSubmittedAnswers", this.pollId);

    socket.on("previousAnswers", (answers) => {
      this.submittedAnswers = answers;
      console.log("Tidigare svar hämtade från servern:", answers);
    });

    //ask server for chosen questions
    socket.emit("getQuestionsForGame", this.pollId);

    //Get questions from server
    socket.on("questionsForGame", (qs) => {
      if (qs) {
        this.questions = qs;
        this.updateCurrentQuestion(0); // Start with the first question
        //console.log("Questions received from server:", this.questions);
      } else {
        console.error("Received empty questions array from server.");
      }
    });
  },

  methods: {
    submitAnswer: function (answer) {
      // Emit the answer to the server
      socket.emit("submitAnswer", { pollId: this.pollId, answer: answer });
      console.log("Answer sent:", answer);

      //uppdatera topanswer och votecounten
      socket.emit("runQuestionResults", this.pollId);

      //Kolla så kallas på efter att folk har röstat
      socket.on("topAnswerUpdate", ({ topAnswer, maxVotes }) => {
        console.log(`Most voted answer: ${topAnswer} with ${maxVotes} votes.`);
        this.topAnswer = topAnswer;
        this.maxVotes = maxVotes;
      });

      // If it's the last question, transition to final view
      if (this.currentQuestionIndex === this.questions.length - 1) {
        console.log("Last question answered. Switching to final view.");
        this.view = "final_view";
      } else {
        // Switch view to show the result after answer submission
        this.view = "results_view";
        console.log("Changed to result view.");
      }
    },

    // Update the question with server data or a randomly selected question
    updateQuestion: function (serverQuestion) {
      if (serverQuestion && serverQuestion.q) {
        this.currentQuestion.q = serverQuestion.q;
        this.currentQuestion.a = serverQuestion.a || [];

        console.log("current q:", this.currentQuestion.q);
      }
    },

    nextQuestion: function () {
      // Check if the current question is NOT the last question
      if (this.currentQuestionIndex < this.questions.length - 1) {
        this.currentQuestionIndex += 1; // Increment the index
        this.updateCurrentQuestion(this.currentQuestionIndex); // Update the question
        console.log("Current question index:", this.currentQuestionIndex);

        // Switch back to 'question' view
        this.view = "question_view";
      }
      // If it's the last question, switch to the final view
      else if (this.currentQuestionIndex === this.questions.length - 1) {
        console.log("No more questions. Switching to final view."); //printas aldrig

        this.view = "final_view";
      }
    },

    updateCurrentQuestion: function (index) {
      console.log("Updating current question to index:", index);
      if (this.questions && this.questions[index]) {
        this.currentQuestion = this.questions[index];
        console.log("Current question data:", this.currentQuestion);
      } else {
        console.error("Invalid question index:", index);
      }
    },

    toResults: function () {
      console.log("game finished, going to result view");
      this.$router.push(`/result/${this.pollId}`);
    },
  },
};
</script>
