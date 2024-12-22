<template>
  <div>
    <h1>Poll id: {{ pollId }}</h1>
    <!-- Render the QuestionComponent and pass the current question as a prop -->
    <hr />
    <!-- Render all questions from the questions array -->
    <h3>All Questions:</h3>
    <ul>
      <li v-for="(q, index) in questions" :key="index">
        {{ q }}
      </li>
    </ul>

    <div v-if="view === 'question'">
      <!-- Render the question component -->
      <QuestionComponent
        v-bind:question="currentQuestion"
        v-bind:participants="currentQuestion.a"
        v-on:answer="submitAnswer($event)"
      />

      <!-- alt byta till denna på v-on v-on:answer="submitAnswer($event)" -->
    </div>

    <div v-if="view === 'results' && topAnswer && maxVotes >= 0">
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

      topAnswer: "", // Initialize with an empty string
      maxVotes: 0, // Initialize with 0

      view: "question", // 'question' or 'results'
    };
  },

  created: function () {
    // Poll ID    // Set the poll ID from // Collected answers for the poll the route parameter
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

    //DENNA DEL KRÄVER NÅN FORM AV CHECK SÅ ATT EX BARA ADMIN KAN LADDA FRÅGOR OCH DE UPPDATERAS FÖR ALLA KILNETER, FUNKAR INTE DE SÄTT JAG TESTAT
    // Get the question count for the poll
    socket.emit("getQuestionCount", this.pollId);

    socket.on("sendQuestionCount", (data) => {
      this.questionCount = data.questionCount; // Store question count in a local variable
      console.log(`Poll ${this.pollId} has ${this.questionCount} questions.`);

      // Load questions based on the question count
      this.loadQuestions(this.questionCount);

      // Emit the questions to all clients after they have been loaded
      socket.emit("saveQuestionsForClients", {
        pollId: this.pollId,
        questions: this.questions,
      });
    });
    //SLUT DEL SOM BEHÖVER ADMIN CHECKAS


    //Get questions from server, admin has randomized
    socket.on("questionsForGame", (data) => {
      console.log("Data received from server (for game):", data);

      if (data.questions) {
        console.log("Data received from server(for game):", data); // Add this to verify data reception

        this.questions = data.questions;
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
      this.view = "results";
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

    loadRandomAnswer: function () {
      //uppdatera så den läser in participants sen!!!
      const usernames = [
        "Alice",
        "Bob",
        "Charlie",
        "David",
        "Eva",
        "Frank",
        "Grace",
      ];
      const selectedAnswers = [];

      // Randomize three unique usernames
      while (selectedAnswers.length < 3) {
        const randomUsername =
          usernames[Math.floor(Math.random() * usernames.length)];

        //  Prevent same person be chosen many times
        if (!selectedAnswers.includes(randomUsername)) {
          selectedAnswers.push(randomUsername);
        }
      }
      console.log("Slupade users svar:", selectedAnswers); // Log chose users as answer
      return selectedAnswers;
    },

    //FÅ INFO OM ANTAL FRÅGOR FRÅN CREATE VIEW
    loadQuestions: function (questionCount) {
      // Fetch the required number of random questions
      console.log("question count är", questionCount);
      const questions = [];
      for (let i = 0; i < questionCount; i++) {
        const randomQuestion = this.loadRandomQuestion();
        const selectedRandomAnswers = this.loadRandomAnswer();


        //socket.emit("addQuestion", {pollId: this.pollId, q: randomQuestion, a: selectedRandomAnswers})

        questions.push({ q: randomQuestion, a: selectedRandomAnswers });

        //LäGG IN METOD SOM KOLLAR OM FRÅGAN FÖREKOMMER FLERA GÅNGER; ISF LADDA NY FRÅGA
      }
      // Store the random questions to be displayed and used during the game
      this.questions = questions;

      // Initialize the first question
      if (this.questions.length > 0) {
        this.updateCurrentQuestion(0);
      }
    },

    /*
    //change between questions uppdatera sen så man hoppar mellan componnets
    prevQuestion() {
      if (this.currentQuestionIndex > 0) {
        this.updateCurrentQuestion(this.currentQuestionIndex - 1);
      }
    },*/

    nextQuestion: function () {
      if (this.currentQuestionIndex < this.questions.length - 1) {
        this.updateCurrentQuestion(this.currentQuestionIndex + 1);
      }

      // Switch back to 'question' view
      this.view = "question";
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

    // Load a random question from the local questionsEn.json
    loadRandomQuestion: function () {
      const categories = Object.keys(questionsEn.categories);
      const randomCategory =
        categories[Math.floor(Math.random() * categories.length)];
      const randomQuestion =
        questionsEn.categories[randomCategory][
          Math.floor(
            Math.random() * questionsEn.categories[randomCategory].length
          )
        ];
      console.log("Chosen question:", randomQuestion);

      return randomQuestion; //return randomly chosen question
    },
  },
};
</script>
