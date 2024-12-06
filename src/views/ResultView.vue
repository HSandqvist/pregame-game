<template>
  <div>
    <!-- Display the selected language and current question -->
    lang: {{ lang }}
    {{ question.q }}
  </div>
  <!-- Render the BarsComponent to visualize answers -->
  <BarsComponent v-bind:labels="question.a" v-bind:data="submittedAnswers"/>
  <!-- Display the raw data of submitted answers -->
  <span>{{ submittedAnswers }}</span>
</template>

<script>
// @ is an alias to /src
import BarsComponent from '@/components/BarsComponent.vue';
// Initialize the WebSocket connection
import io from 'socket.io-client';
const socket = io("localhost:3000");

export default {
  name: 'ResultView',
  components: {
    BarsComponent // Register the BarsComponent
  },
  data: function () {
    return {
      lang: localStorage.getItem("lang") || "en", // Language preference
      pollId: "",
      question: "",
      submittedAnswers: {}
    }
  },
  created: function () {
    // Set the poll ID from the route parameter
    this.pollId = this.$route.params.id
    // Listen for server events
    socket.on( "uiLabels", labels => this.uiLabels = labels ); // Update UI labels
    socket.on("submittedAnswersUpdate", update => this.submittedAnswers = update); // Update submitted answers
    socket.on("questionUpdate", update => this.question = update ); // Update the current question

    // Emit events to get UI labels and join the poll
    socket.emit( "getUILabels", this.lang );
    socket.emit( "joinPoll", this.pollId );
  }
}
</script>
