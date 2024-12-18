<template>
  <div>
    <h1> Poll id: {{ pollId }} </h1>
    <h4> Who is most likely to... </h4>
    <!-- Render the QuestionComponent and pass the current question as a prop -->
    <QuestionComponent v-bind:question="question" 
    v-bind:participants="participants"
      v-on:answer="submitAnswer($event)" 
      />
    <hr>
    <h3>Question:</h3>
    <span>{{ loadRandomQuestion }}</span>
    <!-- Display the submitted answers -->
    <h3>Submitted Answers:</h3>
    <span>{{ submittedAnswers }}</span>
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
        q: "categories[3][3]",
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
      console.log("frågan",this.question.q );
      this.question.a = []; // Optional: You can customize this with specific options
    },
   

    // Emit an event to submit an answer to the server
    submitAnswer: function (answer) {
      socket.emit("submitAnswer", { pollId: this.pollId, answer: answer });
    },

  }

}
</script>
