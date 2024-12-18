<template>
  <!-- Generate a button for each answer option in the question object -->
  <button 
    v-for="a in question.a" 
    v-on:click="answer(a)" 
    v-bind:key="a"
  >
    <!-- Display the answer text inside the button -->
    {{ a }}
  </button>
</template>

<script>

export default {
  name: 'QuestionComponent',
  props: {
    question: Object // The question object containing the question text and answer options
  },
  emits: ["answer"], // Declare the custom event "answer" emitted by this component
  methods: {
    // Method to handle answer selection
    answer: function (answer) {
      // Emit the "answer" event to the parent component with the selected answer as payload
      this.$emit("answer", answer);
    }
  }
}
</script>
