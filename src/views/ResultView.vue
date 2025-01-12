<template>
  <div>
    <MusicPlayer :viewKey="'RESULTVIEW'" />
  </div>
  <InstructionButton :uiLabels="uiLabels" :lang="lang" viewKey="RESULTVIEW" />
  <LanguageSwitcher @language-changed="updateLanguage" />
  <header id = "header-text">
    <h1 v-if ="showPopup" v-motion="popEffect"> {{ this.uiLabels.theMost || "THE MOST"}} </h1>
    <h1 v-if = "resultsShown && !showPopup"> {{this.uiLabels.allResults || "ALL RESULTS"}} </h1>
  </header>

  <div class="result-view">
    <!-- Button to fetch and display results -->
    <button
      v-if="!resultsShown"
      @click="fetchCategoriesWithAnswers"
      class="result-button"
      v-motion="motionGlowNeon"
    >
      <p>{{ this.uiLabels.showEndResults || "Show Results" }}</p>
    </button>

      <div v-if="showPopup" class="popup">
        <h2>{{ currentPopupCategory }}</h2>
        <div class="winner-details">
        <img :src="currentPopupWinnerAvatar" alt="Winner Avatar" class="winner-avatar" v-if="currentPopupWinnerAvatar" />
        <h1>{{ currentPopupWinner}}</h1>
        </div>
    </div>
      
      <div v-if="showPopup">
      <button @click="skipToResults" class="skip-button">
      {{this.uiLabels.skip|| "Skip"}}
      </button>
    </div>

    <!-- Render the full results after popups -->
    <div v-if="resultsShown && !showPopup" class="results">
      <div
        v-for="(topVoted, category) in topVotedCategories"
        :key="category">
        <div class="one-result-each"> 
        <h2> <span id="the-most"> {{ this.uiLabels.theMost || "THE MOST"}} </span> {{ category }}</h2>
        <h1 v-motion="motionGrowBiggerAndGlow">{{ topVoted.name }}!</h1>
      </div>
      </div>
    </div>

    <div v-if="resultsShown && !showPopup">
      <button v-on:click="showReturnStartModal = true" class="center-button">
        {{ this.uiLabels.startNewGame || "Start new game!" }}
      </button>
    </div>
  </div>
  <ReturnStartModal
    :show="showReturnStartModal"
    v-model:uiLabels="uiLabels"
    @confirm="returnToStart"
  />
</template>

<script>
import InstructionButton from "@/components/InstructionButton.vue"; //Import InstructionButton component
import LanguageSwitcher from "@/components/LanguageSwitcher.vue"; // Import LanguageSwitcher component
import MusicPlayer from "@/components/MusicPlayer.vue";
import ReturnStartModal from "@/components/modals/ReturnStartModal.vue";
import {
  motionGrowBiggerAndGlow,
  motionGlowNeon,
  popEffect,
} from "@/assets/motions.ts"; //Import motion settings

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
    LanguageSwitcher,
    ReturnStartModal,
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
      showPopup: false, 
      popupQueue: [], 
      currentPopupCategory: "", 
      currentPopupWinner: "", 
      motionGrowBiggerAndGlow, 
      motionGlowNeon,
      popEffect,
      showReturnStartModal: false,
    };
  },

  created: function () {
    this.pollId = this.$route.params.id;
    // Listen for server events
    socket.on("uiLabels", (labels) => (this.uiLabels = labels)); // Update UI labels

    socket.on(
      "submittedAnswersUpdate",
      (update) => (this.submittedAnswers = update)
    ); 
    // Emit events to get UI labels and join the poll
    socket.emit("getUILabels", this.lang);
    socket.emit("joinPoll", this.pollId);
    socket.on("categoriesWithAnswers", (categories) => {
      this.categoriesAnswers = categories;
    });
  },

  computed: {
    topVotedCategories() {
    const result = {};
    for (const [category, votes] of Object.entries(this.categoriesAnswers)) {
      const topVoted = Object.entries(votes).reduce(
        (max, [person, data]) => {
          if (data.count > max.count) return { name: person, avatar: data.avatar, count: data.count };
          return max;
        },
        { name: null, avatar: null, count: -1 }
      );
      result[category] = topVoted; // Include avatar and name
    }
    return result;
  },
  },
  methods: {
    // Update language when changed in LanguageSwitcher
    updateLanguage(lang) {
      this.lang = lang;
      socket.emit("getUILabels", this.lang);
    },

    // Method to fetch categories with answers
    fetchCategoriesWithAnswers() {
      this.resultsShown = true; 
      socket.emit("getCategoriesWithAnswers", this.pollId);
      socket.on("categoriesWithAnswers", (categories) => {
        console.log("är i socket on categorieswith answers");
        this.categoriesAnswers = categories;
        this.handleResults();
      });
    },

    handleResults() {
      const categories = Object.keys(this.categoriesAnswers);
      if (categories.length <= 5) {
      // Add both winner name and avatar to the popupQueue
      this.popupQueue = categories.map((category) => {
        const winner = this.topVotedCategories[category];
          return {
        category,
        winnerName: winner.name,
        winnerAvatar: winner.avatar,
          };
        });
      this.displayNextPopup();
  }
    },

    skipToResults() {
        this.showPopup = false; 
        this.popupQueue = [];
        this.resultsShown = true; 
    },

    displayNextPopup() {
    if (this.popupQueue.length > 0) {
    const nextPopup = this.popupQueue.shift();
    this.currentPopupCategory = nextPopup.category;
    this.currentPopupWinner = nextPopup.winnerName;
    this.currentPopupWinnerAvatar = nextPopup.winnerAvatar; 
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
      //här borde läggas till så pollen tas bort/användare tas bort som i waitingroom

      this.showReturnStartModal = false;
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
  position: absolute; 
  top: 0; 
  left: 50%; 
  transform: translate(-50%,0); 
  margin-top: 4rem; 
  width: 100%;
  height: calc(100vh - 4rem); /* Subtract header height */
  box-sizing: border-box; /* Include padding and borders in the height calculation */
}

header {
  display: flex;
  justify-content: center; 
  align-items: center; 
  width: 100%;
  height: 100px; 
  position: fixed; 
  top: 3rem;
  z-index: 2000; 
}

.result-button {
  padding: 0.7rem;
  font-size: 2rem;
  background-color: linear-gradient(135deg, rgb(210, 66, 133),rgb(102, 0, 153));
  border: 0.3rem solid white;
  border-radius: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
  z-index: 10;
}

.result-button:hover {
  transform: scale(1.1);
}

.result-button:disabled {
  visibility: hidden;
  cursor: pointer;
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
  z-index: 10; 
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
  border: 0.3rem solid white;
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
  margin: 2rem;
  padding: 1rem;
  text-align: center;
  background: linear-gradient(135deg, rgb(210, 66, 133),rgb(102, 0, 153));
  border-radius: 2rem;
  border: 0.3rem solid white;
  font-size: 1rem;
  animation: bounce 1.5s infinite; 
  max-width: 80%; 
  max-height: 60vh; 
  overflow-y: auto; 
  overflow-x: hidden; 
  box-sizing: border-box; 
}

#the-most {
  color: rgb(255, 156, 222 );
  text-shadow: -0.05rem -0.05rem 0 white, 0.05rem -0.05rem 0 white, 0.05rem 0.05rem 0 white,
  0.05rem 0.05rem 0 white;
}

@keyframes pulse {
  0%,
  100% {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2), 0 0 10px #f8b4d9, 0 0 20px #ff80b5;
  }
  50% {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2), 0 0 30px #ff99c8, 0 0 60px #ff80b5;
  }
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.skip-button {
  position: fixed; 
  bottom: 5%;
  left: 50%; 
  transform: translateX(-50%); 
  z-index: 999;
}

@media (max-width: 430px) {
  .result-view h1 {
    font-size: 1.5em;
  }

  .result-view h2 {
    font-size: 1.2em;
  }
}

#header-text{
  text-shadow: -0.1rem -0.1rem 0 rgb(102, 0, 153), 0.1rem -0.1rem 0 rgb(102, 0, 153), 0.1rem 0.1rem 0 rgb(102, 0, 153),
  0.1rem 0.1rem 0 rgb(102, 0, 153);
}

.one-result-each {
  margin-bottom: 2rem;
}

h1,h2 {
  margin: 2%;
}

.winner-details {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.winner-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin-bottom: 1rem;
  border: 3px solid white;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}
</style>
