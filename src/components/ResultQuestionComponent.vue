<template>
  <div>
    <h2>{{this.uiLabels.result || "Results"}}</h2>
    <p> {{ this.uiLabels.topAnswer || "Top Answer:" }} {{ topAnswer }}</p>
    <p> {{ this.uiLabels.amountVotes || "Votes:"}} {{ maxVotes }}</p>
  </div>

  <div>
    <img
          :src="topAvatar"
          alt="Participant Top Avatar"
          class="top-avatar-picture"
        />
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
// Initialize the WebSocket connection
import io from "socket.io-client";
const socket = io("localhost:3000");

export default {
  name: "ResultQuestionComponent",
  props: {
    topAnswer: {typ: String, default:"", required: true },
    maxVotes: { type: Number, default: 0, required: true },
    topAvatar: { typ: String, default:"", required: true },
    //categories: { type: Object, default: () => ({}) }, // Optional category results
  },

  data() {
    return {
      uiLabels: {}, // UI labels for different languages
      lang: localStorage.getItem("lang") || "en", // Language preference
    };
  },

  created: function () {
    socket.on("uiLabels", (labels) => (this.uiLabels = labels)); // Update UI labels
    // Emit events to get UI labels and join the poll
    socket.emit("getUILabels", this.lang);

    console.log("avatar i reuslt question", this.topAvatar);

  },


};
</script>


<style>

.top-avatar-picture {
  width: 100px;
  height: 100px;
  border-radius: 50%; /* Makes the avatars round */
  object-fit: cover; /* Ensures the image fills the container without distortion */
  border: 2px solid #ccc;
  cursor: grab;
  transition: transform 0.2s ease;
  -webkit-user-drag: none;
}
</style>