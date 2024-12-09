<template>
  <div>
    {{pollId}}

    <!-- Show the participation form if the user has not joined -->

    <div v-if="!joined">
      <p>
        <h1> 
      Please enter your name:
    </h1>
      </p>
      <!-- Input field for the user to enter their name -->
      <input type="text" v-model="userName">

      <!-- Button to join the poll -->
      <button v-on:click="participateInPoll" id="submitNameButton" >
        {{ this.uiLabels.participateInPoll }}
      </button>
    </div>
    <!-- Show this section if the user has joined the poll -->
    <div v-if="joined">
      <p>Waiting for host to start poll...</p>
      <!-- Display the list of participants -->
       <p>
        {{ participants }}
       </p>
       <p>
        {{ participants.length }}
       </p>
      
  </div>
  <div v-if="isAdmin">
          
       </div>
       <button v-on:click="startGame" id="startGameButton" >
        Start Game
        {{ this.uiLabels.startGame }}
      </button>
  </div>
</template>

<script>
import io from 'socket.io-client';
// Initialize the WebSocket connection to the server
const socket = io("localhost:3000");

export default {
  name: 'LobbyView',
  data: function () {
    return {
      userName: "",
      pollId: "inactive poll",
      uiLabels: {}, // UI labels for different langs
      joined: false,
      lang: localStorage.getItem("lang") || "en", // Lang preference
      participants: [],
      isAdmin: true,
    }
  },
  created: function () {
    // Set the poll ID from the route parameter
    this.pollId = this.$route.params.id;
    // Listen for server events
    socket.on( "uiLabels", labels => this.uiLabels = labels ); // Update UI labels
    socket.on( "participantsUpdate", p => this.participants = p ); // Update participants list
    // Navigate to the poll page when the poll starts
    socket.on( "startPoll", () => this.$router.push("/poll/" + this.pollId) );

    // Emit events to join the poll and get UI labels
    socket.emit( "joinPoll", this.pollId );
    socket.emit( "getUILabels", this.lang );
  },
  methods: {
    // Method to participate in the poll
    participateInPoll: function () {
      // Notify the server of participation
      socket.emit( "participateInPoll", {pollId: this.pollId, name: this.userName} )
      this.joined = true;
    },
    startGame: function() {
      socket.emit()
    }
  }
}
</script>

<style>

#submitNameButton{
  font-size: 25px;
  font-family: "Times New Roman", Times, serif;
  color: rgb(139, 5, 142);
  cursor: pointer;
}

</style>
