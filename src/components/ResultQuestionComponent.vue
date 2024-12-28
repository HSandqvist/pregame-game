<template>
    <div>
      <h2> Results </h2>
      <p> Top Answer: {{ topAnswer }} </p>
      <p> Votes: {{ maxVotes }} </p> 
    </div>

    <!-- Display category-level results if needed TA BORT sEN -->
     <!-- 
    <div v-if="categories">
      <h3>Category Results:</h3>
      <ul>
        <li v-for="(votes, participant) in categories" :key="participant">
          {{ participant }}: {{ votes }} votes
        </li>
      </ul>
    </div> -->

  </template>
  
  <script>
  export default {
    name: "ResultQuestionComponent",
    props: {
      topAnswer: { type: String, default: "",required: true },
      maxVotes: { type: Number, default: 0, required: true },
      //categories: { type: Object, default: () => ({}) }, // Optional category results
    },
  };
  </script>