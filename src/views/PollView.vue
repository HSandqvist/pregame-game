<template>
  <div>
    <h1> Poll id: {{ pollId }} </h1>
    <!-- Render the QuestionComponent and pass the current question as a prop -->
    <hr>
    <h3>Who's most likely to...</h3>
    <span>{{ question.q }}</span>
    <!-- Display the submitted answers -->
    <!-- Ta bort options under sen-->
    <h3> Options: </h3>
    <QuestionComponent v-bind:question="question" v-bind:participants="question.a" v-on:answer="submitAnswer($event)" />
  </div>
</template>

<script>
// @ is an alias to /src
import QuestionComponent from '@/components/QuestionComponent.vue';
import questionsEn from "@/assets/questions-en.json";

// Initialize the WebSocket connection
import io from 'socket.io-client';
const socket = io("localhost:3000");

export default {
  name: 'PollView',
  components: {
    QuestionComponent // Register the QuestionComponent
  },
  data: function () {
    return {
      // Current question data (question text and answer options)
      question: {
        q: "",
        a: []
      },
      participants: [], // List of participants for the question
      pollId: "inactive poll",
      submittedAnswers: {}
    }
  },
  created: function () {
    // Poll ID    // Set the poll ID from // Collected answers for the poll the route parameter
    this.pollId = this.$route.params.id;
    // Listen for server events to update the question and submitted answers
    socket.on("questionUpdate", q => this.question = q); // Update the current question
    socket.on("submittedAnswersUpdate", answers => this.submittedAnswers = answers); // Update the submitted answers
    socket.on("uiLabels", labels => this.uiLabels = labels); // Update UI labels

    // Emit events to get UI labels and join the poll
    socket.emit("getUILabels", this.lang);
    socket.emit("joinPoll", this.pollId);

    // Fallback to load a random question if no question is received from the server
    setTimeout(() => {
      if (!this.question.q) {
        this.loadRandomQuestion();
      }
      if (!this.question.a.length) {
        this.loadRandomAnswer();
      }
    }, 1000); // Wait a second for potential server response
  },
  methods: {
    // Emit an event to submit an answer to the server
    submitAnswer: function (answer) {
      socket.emit("submitAnswer", { pollId: this.pollId, answer: answer })
    },



    // Update the question with server data or a randomly selected question
    updateQuestion(serverQuestion) {
      if (serverQuestion && serverQuestion.q) {
        this.question.q = serverQuestion.q;
        this.question.a = serverQuestion.a || [];
      }
    },

    // Load a random question from the local `questionsEn.json`
    loadRandomQuestion() {
      const categories = Object.keys(questionsEn.categories);
      const randomCategory =
        categories[Math.floor(Math.random() * categories.length)];
      const randomQuestion =
        questionsEn.categories[randomCategory][
        Math.floor(
          Math.random() * questionsEn.categories[randomCategory].length
        )
        ];
      this.question.q = randomQuestion;
      console.log("frågan", this.question.q);
      this.question.a = []; // Optional: You can customize this with specific options
    },

    loadRandomAnswer() {
      const usernames = ["Alice", "Bob", "Charlie", "David", "Eva", "Frank", "Grace"];
      const selectedAnswers = [];

      // Slumpa fram tre unika användarnamn
      while (selectedAnswers.length < 3) {
        const randomUsername = usernames[Math.floor(Math.random() * usernames.length)];

        // Förhindra att samma användarnamn väljs flera gånger
        if (!selectedAnswers.includes(randomUsername)) {
          selectedAnswers.push(randomUsername);
        }
      }

      // Uppdatera svarsalternativen för frågan
      this.question.a = selectedAnswers;

      // Logga de valda användarnamnen
      console.log("Slumpmässiga svar:", this.question.a);
    }

    // Slumpa fram tre användarnamn från listan


  }

}
</script>
