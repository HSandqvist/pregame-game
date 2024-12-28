<template>
  <div>
    <h1>Poll id: {{ pollId }} User: {{ this.userId }}</h1>
    <!-- Render the QuestionComponent and pass the current question as a prop -->
    <hr />
    <!-- Render all questions from the questions array -->
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

      <!-- alt byta till denna på v-on v-on:answer="submitAnswer($event)" -->
    </div>

    <div v-if="view === 'results_view' && topAnswer && maxVotes >= 0">
      <!-- Render ResultQuestionComponent -->
      <ResultQuestionComponent :topAnswer="topAnswer" :maxVotes="maxVotes" />

      <div v-if="isAdmin === true">
        <button
          @click="nextQuestion"
          :disabled="currentQuestionIndex === questions.length - 1"
        >
          Next question
        </button>
      </div>
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
import questionsEn from "@/assets/questions-en.json"; 
import questionsSv from "@/assets/questions-sv.json";

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
      siteUserId: null,
      topAnswer: "", // Initialize with an empty string
      maxVotes: 0, // Initialize with 0

      view: "question_view", // 'question_view' or 'results_view'
    };
  },

  created: function () {
    // Poll ID    // Set the poll ID from // Collected answers for the poll the route parameter
    this.pollId = this.$route.params.id;


    this.loadQuestionsFromFile(); // read json file questions and send to server


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
    socket.emit("getQuestionsForGame", (this.pollId));

    //Get questions from server
    socket.on("questionsForGame", (qs) => {
      console.log("Data received from server (for game):", qs);

      if (qs) {
        console.log("Data received from server (for game):",qs); // Add this to verify data reception
        this.questions = qs;
        this.updateCurrentQuestion(0); // Start with the first question
        console.log("Questions received from server:", this.questions);
      } else {
        console.error("Received empty questions array from server.");
      }
    });

    //VARIANT 3 - fixa så att man kan visa vem som fått mest röster här sen!!
    //Kolla så kallas på efter att folk har röstat
    socket.on("topAnswerUpdate", ({ topAnswer, maxVotes }) => {
      console.log(`Most voted answer: ${topAnswer} with ${maxVotes} votes.`);

      this.topAnswer = topAnswer;
      console.log("mest röster har", topAnswer, "med", maxVotes);
      this.maxVotes = maxVotes;
    });

    //ev onödig här
    // Listen for category results update
    socket.on("categoryResultsUpdate", (results) => {
      console.log("Category Results:", results);
      // Update state to display results in the result component
      this.categoryResults = results;
    });
  },

  methods: {
    submitAnswer: function (answer) {
      // Emit the answer to the server
      socket.emit("submitAnswer", { pollId: this.pollId, answer: answer });
      console.log("Answer sent:", answer);

      // Switch view to show the result after answer submission
      this.view = "results_view";
    },

    // Triggered when the current question ends
    endQuestion: function () {
      socket.emit("endQuestion", { pollId: this.pollId });
    },

    // Listen for updated category results from the server
    updateCategoryResults: function () {
      socket.on("categoryResultsUpdate", (data) => {
        console.log("Category Results Updated:", data);
        // Update your frontend state with the updated results
      });
    },

    // Update the question with server data or a randomly selected question
    updateQuestion: function (serverQuestion) {
      if (serverQuestion && serverQuestion.q) {
        this.currentQuestion.q = serverQuestion.q;
        this.currentQuestion.a = serverQuestion.a || [];
      }
    },

    nextQuestion: function () {
      if (this.currentQuestionIndex < this.questions.length - 1) {
        this.updateCurrentQuestion(this.currentQuestionIndex + 1);
      }

      // Switch back to 'question' view
      this.view = "question_view";
    },

    updateCurrentQuestion: function (index) {
      console.log("Updating current question to index:", index);
      if (this.questions && this.questions[index]) {
        console.log("Current question data:", this.questions[index]);
        // Add logic to display the current question
      } else {
        console.error("Invalid question index:", index);
      }
    },

    // Method to load the questions from the file, send to server
    loadQuestionsFromFile: function() {

      // Choose the appropriate JSON data based on the selected language
      const allQuestionsFromFile = this.lang === "en" ? questionsEn : questionsSv;

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
