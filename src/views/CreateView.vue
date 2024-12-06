<template>
  <div>
    Poll link: 
    <!-- Input field for entering the poll ID -->
    <input type="text" v-model="pollId">
    <button v-on:click="createPoll">
      Create poll
    </button>
    <div>
      <!-- Input field for entering a question -->
      {{ uiLabels.question }}:
      <input type="text" v-model="question">
      <div>
        <!-- List of answer options -->
        Answers:
        <input v-for="(_, i) in answers" 
               v-model="answers[i]" 
               v-bind:key="'answer' + i">
        <!-- Button to add another answer option -->
        <button v-on:click="addAnswer">
          Add answer alternative
        </button>
      </div>
    </div>
    <!-- Button to add a question to the poll -->
    <button v-on:click="addQuestion">
      Add question
    </button>
    <!-- Input field for specifying the question number to run -->
    <input type="number" v-model="questionNumber">
    <!-- Button to start the poll -->
    <button v-on:click="startPoll">
      Start poll
    </button>
    <!-- Button to run a specific question -->
    <button v-on:click="runQuestion">
      Run question
    </button>
    <!-- Link to view poll results -->
    <router-link v-bind:to="'/result/' + pollId">Check result</router-link>
    <!-- Display poll data -->
    Data: {{ pollData }}
  </div>
</template>

<script>
import io from 'socket.io-client';
// Initialize the WebSocket connection to the server
const socket = io("localhost:3000");

export default {
  name: 'CreateView',
  data: function () {
    return {
      lang: localStorage.getItem("lang") || "en",
      pollId: "",
      question: "",
      answers: ["", ""],
      questionNumber: 0,
      pollData: {}, // Poll data received from the server
      uiLabels: {}, // UI labels for different langs
    }
  },
  created: function () {
    // Listen for incoming events from the server
    socket.on( "uiLabels", labels => this.uiLabels = labels );
    socket.on( "pollData", data => this.pollData = data );
    socket.on( "participantsUpdate", p => this.pollData.participants = p );
    // Request UI labels from the server based on the selected language
    socket.emit( "getUILabels", this.lang );
  },
  methods: {
    // Emits an event to create a poll and join it
    createPoll: function () {
      socket.emit("createPoll", {pollId: this.pollId, lang: this.lang })
      socket.emit("joinPoll", this.pollId);
    },
    // Emits an event to start the poll
    startPoll: function () {
      socket.emit("startPoll", this.pollId)
    },
    // Emits an event to add a question to the poll
    addQuestion: function () {
      socket.emit("addQuestion", {pollId: this.pollId, q: this.question, a: this.answers } )
    },
    // Adds an empty answer field to the list
    addAnswer: function () {
      this.answers.push("");
    },
    // Emits an event to run a specific question in the poll
    runQuestion: function () {
      socket.emit("runQuestion", {pollId: this.pollId, questionNumber: this.questionNumber})
    }
  }
}
</script>
