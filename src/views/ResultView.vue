<template>
  <div>
    <!-- Display the selected language and current question -->
    <!-- lang: {{ lang }} -->


    <!-- Button to fetch and display results -->
    <button @click="fetchCategoriesWithAnswers">Show Results</button>

    <!-- Render the categories only when data is available -->
    <div v-if="Object.keys(categoriesAnswers).length > 0">
      <div
        v-for="(topVoted, category) in topVotedCategories"
        :key="category"
        class="category"
      >
        <h2>{{ category }}</h2>
        <p>Top voted: {{ topVoted }}</p>
      </div>
    </div>


    <!-- Render the categories only when data is available 
    <div v-if="Object.keys(categoriesAnswers).length > 0">
      <div
        v-for="(value, category) in categoriesAnswers"
        :key="category"
        class="category"
      >
        <h2>{{ category }}</h2>
        <pre>{{ value }}</pre>
      </div>
    </div> -->
  </div>
  <!-- Render the BarsComponent to visualize answers -->
  <BarsComponent v-bind:labels="question.a" v-bind:data="submittedAnswers" />
  <!-- Display the raw data of submitted answers -->
  <span>{{ submittedAnswers }}</span>
</template>

<script>
// @ is an alias to /src
import BarsComponent from "@/components/BarsComponent.vue";
// Initialize the WebSocket connection
import io from "socket.io-client";
const socket = io("localhost:3000");

export default {
  name: "ResultView",
  components: {
    BarsComponent, // Register the BarsComponent
  },
  data: function () {
    return {
      lang: localStorage.getItem("lang") || "en", // Language preference
      pollId: "",
      question: "",
      submittedAnswers: {},

      categoriesAnswers: {},
    };
  },
  created: function () {
    // Set the poll ID from the route parameter
    this.pollId = this.$route.params.id;
    // Listen for server events
    socket.on("uiLabels", (labels) => (this.uiLabels = labels)); // Update UI labels
    socket.on(
      "submittedAnswersUpdate",
      (update) => (this.submittedAnswers = update)
    ); // Update submitted answers
    socket.on("questionUpdate", (update) => (this.question = update)); // Update the current question

    // Emit events to get UI labels and join the poll
    socket.emit("getUILabels", this.lang);
    socket.emit("joinPoll", this.pollId);

    socket.on("categoriesWithAnswers", (categories) => {
      this.categoriesAnswers = categories;
    });
  },

  computed: {
    // Computed property to determine the top-voted person for each category
    topVotedCategories() {
      const result = {};
      for (const [category, votes] of Object.entries(this.categoriesAnswers)) {
        const topVoted = Object.entries(votes)
          .reduce((max, [person, count]) => {
            if (count > max.count) return { person, count };
            return max;
          }, { person: null, count: -1 }).person;

        result[category] = topVoted;
      }
      return result;
    },
  },

  methods: {
   // Method to fetch categories with answers
   fetchCategoriesWithAnswers() {
      socket.emit("getCategoriesWithAnswers", this.pollId);
    },

  }
};
</script>


<style scoped>
</style>