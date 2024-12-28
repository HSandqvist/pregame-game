<template>
  <div>
    <h3>Who's most likely to...</h3>
    <h2>{{ question.q }}</h2>

    <!-- Debugging: Check if question.q is valid -->
    <p v-if="!question.q">Question is not available!</p>

    <div v-for="(participant, index) in participants" :key="index">
      <button @click="answer(participant)">{{ participant }}</button>
    </div>
  
  </div>

  <!-- GAMLA VARIANTEN INNAN TUSEN ÄNDRINGAR-->
  <!-- Generate a button for each answer option in the question object 
    <button 
      v-for="a in question.a" 
      v-on:click="answer(a)" 
      v-bind:key="a"
    > -->
  <!-- Display the answer text inside the button 
      {{ a }}
    </button>*/-->
</template>

<script>
export default {
  name: "QuestionComponent",
  props: {
    question: Object, // The question object containing the question text and answer options
    participants: Array, // List of participants, // Already randomized in the parent
  },
  emits: ["answer"], // Declare the custom event "answer" emitted by this component

  methods: {
    // Method to handle answer selection
    answer: function (participant) {
      // Emit the "answer" event to the parent component with the selected answer as payload
      this.$emit("answer", participant);
    },
  },
};
</script>

<style>
/* ADD CSS LATER ex knappar brevid varandra */
</style>
