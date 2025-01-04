<template>
  <div class="result-view">
    <!-- Display the selected language and current question -->
    <!-- lang: {{ lang }} -->

    <!-- Button to fetch and display results -->
    <button
      v-if="!resultsShown" 
      @click="fetchCategoriesWithAnswers"
      class="center-button"
    >
      Show Results
    </button>

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
  </div>

  <!-- ANVÄNDS EJ NU -->
  <!-- Render the BarsComponent to visualize answers -->
  <BarsComponent v-bind:labels="question.a" v-bind:data="submittedAnswers" />
  <!-- Display the raw data of submitted answers -->
  <!-- <span>{{ submittedAnswers }}</span> -->
</template>

<script>
// @ is an alias to /src
import BarsComponent from "@/components/BarsComponent.vue";
// Initialize the WebSocket connection


import io from "socket.io-client";
const socket = io("localhost:3000");

// ---- FOR ALLOWING OTHERS TO JOIN, CHANGE TO YOUR LOCAL IP ADDRESS ----
//const socket = io("192.168.0.195:3000"); // Initialize mutliple joiners

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
      resultsShown: false, // Track whether the results have been shown

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
        const topVoted = Object.entries(votes).reduce(
          (max, [person, count]) => {
            if (count > max.count) return { person, count };
            return max;
          },
          { person: null, count: -1 }
        ).person;

        result[category] = topVoted;
      }
      return result;
    },
  },
  methods: {
    // Method to fetch categories with answers
    fetchCategoriesWithAnswers() {
      this.resultsShown = true; // Mark the results as shown after button is clicked

      socket.emit("getCategoriesWithAnswers", this.pollId);
    },
  },
};
</script>

<style>
.result-view {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  position: absolute; /* Make it position absolute */
  top: 50%; /* Move it 50% from the top of the screen */
  left: 50%; /* Move it 50% from the left of the screen */
  transform: translate(-50%, -50%); /* Offset by 50% of its own size to center it exactly */
  width: 100%; /* Make sure it spans full width */
  height: 100vh; /* Full viewport height */
}

.center-button {
  padding: 1rem 2rem;
  font-size: 1.5rem;
  background-color: rgb(252, 160, 198);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  z-index: 10; /* Ensure it's above other content */
}

.center-button:hover {
  background-color: rgb(255, 131, 203);
}

/* Ensure the button disappears when clicked */
.center-button:disabled {
  visibility: hidden;
}

</style>