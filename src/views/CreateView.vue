<template>

  <body>
    <div class="create-game">
      <h1 id="create-game-headline">Create game</h1>

      <!-- Step 1: Select amount of questions -->
      <div v-if="step === 1" class="amount-questions-section">
        <h2> Number of questions: </h2>
        <div class="amount-questions-buttons">
        <button v-on:click="setAmountQuestions(5)" :class="{ selected: selectedQuestionCount === 5 }">5</button>
        <button v-on:click="setAmountQuestions(10)" :class="{ selected: selectedQuestionCount === 10 }">10</button>
        <button v-on:click="setAmountQuestions(15)" :class="{ selected: selectedQuestionCount === 15 }">15</button>
      </div>
      <button v-on:click="nextStep" :disabled="!isQuestionsSet">Next</button>
    </div>

      <!-- Step 2: Select time per question -->
      <div v-else-if="step === 2" class="time-per-question-section">
        <h2>Seconds per question:</h2>
        <div class="time-per-question-buttons">
          <button v-on:click="setTimePerQuestion(10)" :class="{ selected: selectedTime === 10 }">10</button>
          <button v-on:click="setTimePerQuestion(20)" :class="{ selected: selectedTime === 20 }">20</button>
          <button :class="{ selected: selectedTime === 30 }" v-on:click="setTimePerQuestion(30)">30</button>
        </div>
       
        <button v-on:click="backStep">Back</button>
        <button v-on:click="createPoll()":disabled="!isTimeSet">Create game</button>
      </div>

      <!-- IS NEVER SHOWN NOW; Step 4: Display poll data,  -->
      <div v-else class="poll-container">
        <!-- Poll Data Display -->
        <div class="poll-data-section">
          <!-- Link to view poll results -->
          <router-link v-bind:to="'/result/' + pollId">Check result</router-link>
          <!-- Display poll data -->
          Data: {{ pollData }}
        </div>
      </div>

  </div>
  </body>

</template>

<script>
import io from "socket.io-client";
// Initialize the WebSocket connection to the server
const socket = io("localhost:3000");

export default {
  name: "CreateView",
  data: function () {
    return {
      step: 1, // Current step of the game creation process
      lang: localStorage.getItem("lang") || "en",
      thePollId: "",
      pollId: "",
      setQuestionsCount: 0,
      pollData: {}, // Poll data received from the server
      uiLabels: {}, // UI labels for different langs


      isQuestionsSet: false, // Tracks if questions are set
      isTimeSet: false, // Tracks if time is set

    };
  },

  created: function () {
    // Listen for incoming events from the server
    socket.on("uiLabels", (labels) => (this.uiLabels = labels));
    socket.on("pollData", (data) => (this.pollData = data));
    socket.on("participantsUpdate", (p) => (this.pollData.participants = p));
    // Request UI labels from the server based on the selected language
    socket.emit("getUILabels", this.lang);
  },

  methods: {
    generatePollID: function () {
      // Generate a random number between 100000 and 999999
      this.pollId = Math.floor(100000 + Math.random() * 900000).toString();
    },

    setAmountQuestions: function (count) {
      // Emit the selected number of random questions to the server
      this.selectedQuestionCount = count; // Spara vald knapp
      this.setQuestionsCount = count;
      this.isQuestionsSet = true; // Mark questions as set
      socket.emit("setAmountQuestions", { pollId: this.pollId, count: count });
      console.log(`Question count set to: ${count}`);
    },

    setTimePerQuestion: function (time) {
      // Emit the selected time for every question to the server
      this.selectedTime = time; // Spara vald knapp
      this.timePerQuestion = time;
      this.isTimeSet = true; // Mark time as set
      socket.emit("setTimePerQuestion", { pollId: this.pollId, time: time });
      console.log(`Time per question set to: ${time} seconds`);
    },

    nextStep: function () {
      //move to next step
      this.step++;
    },

    backStep: function () {
      //move back one step
      this.step--;
    },

    //When clicked you should be redirected to lobby
    // Emits an event to create a poll and join it
    createPoll: function () {
      // Generate a new poll ID if it hasn't been created
      this.generatePollID();

      // Emit events using the generated poll ID
      socket.emit("createPoll", { pollId: this.pollId, lang: this.lang });
      socket.emit("joinPoll", this.pollId);

      // Redirect to the lobby route
      this.$router.push(`/lobby/${this.pollId}`);
    },

    // Emits an event to start the poll
    startPoll: function () {
      socket.emit("startPoll", this.pollId);
    },
  },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Limelight&family=Truculenta:opsz,wght@12..72,100..900&display=swap');

/* Center the main application */
body {
  margin: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(to right, rgb(210, 66, 133), purple);
  font-family: Arial, sans-serif;
  color: white;
}


h1 {
  font-family: "Limelight", sans-serif;
  font-weight: bold;
  font-style: 400;
  font-size: 50pt;
  margin-bottom: 10px;
}

h2 {
  font-family: "Truculenta", sans-serif;
  font-optical-sizing: auto;
  font-weight: normal;
  font-style: normal;
  margin-top: -10px;
}


/* Container for the poll interface */
.poll-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
}

/* Button styling */
/* Add spacing and positioning for buttons */
button {
  padding: 10px 20px;
  background-color: pink;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  font-size: 18px;
  /* Öka textstorleken */
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  padding: 15px 30px;
  transition: all 0.2s ease;
  /* Mjuk övergång vid hover */

}

.next-button {
  opacity: 0;
  /* Dold standard */
  pointer-events: none;
  /* Knappen är inte klickbar */
  transition: opacity 0.3s ease;
  /* Smidig övergång */
}

.next-button.visible {
  opacity: 1;
  /* Gör knappen synlig */
  pointer-events: auto;
  /* Gör knappen klickbar */

}

button:hover {
  background-color: rgb(255, 131, 203);
}

button.selected {
  background-color: rgb(255, 131, 203);
  /* Grön bakgrund för valda knappar */
  border: 2px solid white;
}

/* Style for disabled buttons */
button:disabled {
  opacity: 0.5; /* Make the button a bit transparent */
  cursor: not-allowed; /* Change the cursor to show it's disabled */
}
ß
/* Create a container for buttons to manage spacing */
.amount-questions-buttons,
.time-per-question-buttons,
#create-game-section-buttons {
  display: flex;
  justify-content: center; /* Center align the buttons */
  gap: 20px; /* Add space between buttons */
  margin-top: 20px; /* Move buttons further down */
}

/* For step 3 buttons extra styling */
#create-game-section-buttons {
  display: flex;
  flex-direction: column; /* Stack buttons vertically */
  align-items: center; /* Center align the buttons */
  gap: 10px; /* Add space between the buttons */
  margin-top: 50px; /* Add space from the top */
}

#create-game-section-buttons button {
  width: auto; /* Ensure buttons retain their default width */
}

.create-game {
  padding: 20px;
  /* Space around the entire container */
  text-align: center;
  /* Ensure text is centered */
  transform: translateY(-20%);
}

/* Add spacing between the label and buttons */
.amount-questions-section label,
.time-per-question-section label {
  display: block;
  margin-bottom: 10px;
  /* Space between the label and buttons */
}


/* Add spacing between buttons */
.amount-questions-buttons button,
.time-per-question-buttons button {
  margin: 5px;
  /* Add spacing around each button */
  margin-bottom: 15px;
}

/* Styling for inputs */
input[type="text"],
input[type="number"] {
  padding: 8px;
  width: 100%;
  max-width: 400px;
  box-sizing: border-box;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-top: 5px;
}

/* Link styling */
.poll-data-section a {
  color: #007bff;
  text-decoration: none;
}

.poll-data-section a:hover {
  text-decoration: underline;
}
</style>
