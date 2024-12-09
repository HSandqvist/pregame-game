<template>
  <div>
    {{pollId}}
    <!-- Render the QuestionComponent and pass the current question as a prop -->
    <QuestionComponent v-bind:question="question"
              v-on:answer="submitAnswer($event)"/>
    <hr>
    <!-- Display the submitted answers -->
    <span>{{submittedAnswers}}</span>
  </div>
</template>

<script>
// @ is an alias to /src
import QuestionComponent from '@/components/QuestionComponent.vue';
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
      pollId: "inactive poll",
      submittedAnswers: {}
    }
  },
  created: function () {
    // Set the poll ID from the route parameter
    this.pollId = this.$route.params.id;
    // Listen for server events to update the question and submitted answers
    socket.on( "questionUpdate", q => this.question = q ); // Update the current question
    socket.on( "submittedAnswersUpdate", answers => this.submittedAnswers = answers ); // Update the submitted answers
    socket.on( "uiLabels", labels => this.uiLabels = labels ); // Update UI labels

    // Emit events to get UI labels and join the poll
    socket.emit( "getUILabels", this.lang );
    socket.emit( "joinPoll", this.pollId );
  },
  methods: {
    // Emit an event to submit an answer to the server
    submitAnswer: function (answer) {
      socket.emit("submitAnswer", {pollId: this.pollId, answer: answer})
    }
  }
}
</script>
