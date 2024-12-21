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
  name: "QuestionComponent",
  props: {
    question: Object, // The question object containing the question text and answer options
    participants: Array, // List of participants (objects with at least `name` property)
  },
  emits: ["answer"], // Declare the custom event "answer" emitted by this component

  data() {
    return {
      randomOptions: [], // Store the randomly selected participants
    };
  },

  methods: {
    // Select 3 random participants from the list
    selectRandomParticipants() {
      const shuffled = this.participants.sort(() => 0.5 - Math.random()); // Shuffle participants
      this.randomOptions = shuffled.slice(0, 3); // Take the first 3 after shuffle
    },

    // Method to handle answer selection
    answer: function (answer) {
      // Emit the "answer" event to the parent component with the selected answer as payload
      this.$emit("answer", answer);
    },

    mounted() {
      // Select random participants when the component is mounted
      if (this.participants.length > 3) {
        this.selectRandomParticipants();
      } else {
        this.randomOptions = [...this.participants]; // Use all participants if fewer than 3
      }
    },
  },
};
</script>
