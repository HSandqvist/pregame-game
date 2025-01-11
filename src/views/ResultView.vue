<template>
  <div>
      <MusicPlayer :viewKey="'RESULTVIEW'"/>
    </div>
  <InstructionButton :uiLabels="uiLabels" :lang="lang" viewKey="RESULTVIEW" />
  
  <header>
    <h1 v-if ="showPopup" v-motion="motionGrowBiggerAndGlow"> TOP...</h1>
    <h1 v-if = "resultsShown && !showPopup" v-motion="motionGrowBiggerAndGlow"> {{this.uiLabels.allResults || "ALL RESULTS"}} </h1>
  </header>

  <div class="result-view">

    <!-- Button to fetch and display results -->
    <button
      v-if="!resultsShown" @click="fetchCategoriesWithAnswers" class="result-button">
      <h1>{{ this.uiLabels.showEndResults|| "Show Results"}}</h1>
    </button>

    <!-- Popup for individual category winners -->
      <div v-if="showPopup" class="popup">
        <h2> {{ currentPopupCategory }}</h2>
        <h1>{{ currentPopupWinner }}</h1>
      </div>
      
      <div v-if="showPopup">
      <button @click="skipToResults" class="skip-button">
      {{this.uiLabels.skip}}
      </button>
      </div>

    <!-- Render the full results after popups -->
    <div v-if="resultsShown && !showPopup" class="results">
      <div
        v-for="(topVoted, category) in topVotedCategories"
        :key="category">
        <h2> {{ this.uiLabels.theMost || "THE MOST"}} {{ category }}</h2>
        <h1 v-motion="motionGrowBiggerAndGlow">{{ topVoted }}!</h1>
      </div>
    </div>

    <div v-if="resultsShown && !showPopup">
      <button v-on:click="returnToStart" class="center-button">
        {{ this.uiLabels.startNewGame|| "Start new game!"}}
      </button>
    </div>
  </div>
  
</template>

<script>
import InstructionButton from "@/components/InstructionButton.vue"; //Import InstructionButton component
import MusicPlayer from "@/components/MusicPlayer.vue";
import { motionGrowBiggerAndGlow } from "@/assets/motions.ts"; //Import motion settings

// Initialize the WebSocket connection
import io from "socket.io-client";
const socket = io("localhost:3000");

// ---- FOR ALLOWING OTHERS TO JOIN, CHANGE TO YOUR LOCAL IP ADDRESS ----
//const socket = io("130.243.223.240:3000"); // Initialize mutliple joiners

export default {
  name: "ResultView",
  components: {
    InstructionButton,
    MusicPlayer,
  },

  data: function () {
    return {
      lang: localStorage.getItem("lang") || "en", 
      uiLabels: {},
      pollId: "",
      question: "",
      submittedAnswers: {},
      resultsShown: false, 
      categoriesAnswers: {},
      showPopup: false, // Track if a popup is being displayed
      popupQueue: [], // Queue to hold the category winners for the popup
      currentPopupCategory: "", // Current category being displayed in the popup
      currentPopupWinner: "", // Current winner being displayed in the popup
      motionGrowBiggerAndGlow, // Motion settings
    };
  },

  created: function () {
    // Set the poll ID from the route parameter
    this.pollId = this.$route.params.id;
    // Listen for server events
    socket.on("uiLabels", (labels) => (this.uiLabels = labels)); // Update UI labels

    socket.on("submittedAnswersUpdate",
      (update) => (this.submittedAnswers = update)
    ); // Update submitted answers
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
      socket.on("categoriesWithAnswers", (categories) => {
        console.log("är i socket on categorieswith answers");
        this.categoriesAnswers = categories;
        this.handleResults();
      });
    },

    handleResults() {
      const categories = Object.keys(this.topVotedCategories);
      if (categories.length <= 5) {
        // Prepare popups for categories
        this.popupQueue = categories.map((category) => ({
          category,
          winner: this.topVotedCategories[category],
        }));
        this.displayNextPopup();
      }
    },

    skipToResults() {
        this.showPopup = false; // Hide the popup
        this.popupQueue = []; // Clear the popup queue
        this.resultsShown = true; // Show the full results
    },

    displayNextPopup() {
      if (this.popupQueue.length > 0) {
        const nextPopup = this.popupQueue.shift();
        this.currentPopupCategory = nextPopup.category;
        this.currentPopupWinner = nextPopup.winner;
        this.showPopup = true;

        setTimeout(() => {
          this.showPopup = false;
          this.displayNextPopup();
        }, 2000);
      } else {
        this.showPopup = false;
      }
    },

    returnToStart() {
      alert("Returning to start");
      this.$router.push("/");
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
  top: 0; /* Move it 50% from the top of the screen */
  left: 50%; /* Move it 50% from the left of the screen */
  transform: translate(-50%,0); /* Offset by 50% of its own size to center it exactly */

  margin-top: 100px; /* Set to the height of the header (100px) */
  width: 100%;
  height: calc(100vh - 100px); /* Subtract header height from full viewport height */
  box-sizing: border-box; /* Include padding and borders in the height calculation */
}

header {
  display: flex;
  justify-content: center; /* Center the content horizontally */
  align-items: center; /* Center the content vertically */
  width: 100%; /* Full width */
  height: 100px; /* Adjust height as needed */
  position: fixed; /* Fix it at the top of the page */
  top: 3rem;
  z-index: 2000; /* Ensure it stays above other content */
}

.result-button {
  padding: 1rem 2rem;
  font-size: 1.5rem;
  background: linear-gradient(135deg, rgb(210, 66, 133),rgb(102, 0, 153));
  border: 4px solid white;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  z-index: 10; /* Ensure it's above other content */
}

.result-button:disabled {
  visibility: hidden;
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
  margin-top: 2rem;
}

.center-button:hover {
  background-color: rgb(255, 131, 203);
}

.center-button:disabled {
  visibility: hidden;
}

.popup {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 2rem;
  background: linear-gradient(135deg, rgb(210, 66, 133),rgb(102, 0, 153));
  border: 4px solid white;
  border-radius: 16px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2), 0 0 20px #ff99c8, 0 0 40px #ff80b5;
  text-align: center;
  z-index: 1000;
  animation: popupIn 0.6s ease-out; 
}

@keyframes popupIn {
  0% {
    transform: scale(0.5) translate(-50%, -50%);
    opacity: 0;
  }
  100% {
    transform: scale(1) translate(-50%, -50%);
    opacity: 1;
  }
}

.results {
  padding: 1rem;
  text-align: center;
  background: linear-gradient(135deg, rgb(210, 66, 133),rgb(102, 0, 153));/* Gradient pink background */
  border-radius: 8px;
  border: 0.2rem solid white;
  font-size: 1.2rem;
  animation: bounce 1.5s infinite; /* Bouncy animation */
  max-width: 80%; /* Ensures it doesn’t exceed 90% of the screen width */
  max-height: 60vh; /* Limits the height to 70% of the viewport */
  overflow-y: auto; /* Adds a scroll bar if the content overflows vertically */
  overflow-x: hidden; /* Hides horizontal overflow if needed */
  box-sizing: border-box; /* Ensures padding is included in the total size */
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2), 0 0 10px #f8b4d9, 0 0 20px #ff80b5;
  }
  50% {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2), 0 0 30px #ff99c8, 0 0 60px #ff80b5;
  }
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.skip-button {
  position: fixed; /* Fix the button relative to the viewport */
  bottom: 5%; /* Position it near the bottom of the screen */
  left: 50%; /* Center it horizontally */
  transform: translateX(-50%); /* Offset by half its width to align it perfectly */
  z-index: 999; /* Ensure it's below the popup (popup z-index is 1000) */
}


@media (max-width: 430px) {
  .result-view h1 {
    font-size: 1.5em;
  }

  .result-view h2 {
    font-size: 1.2em;
  }
}
</style>
