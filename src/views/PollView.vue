<template>
  <div>
    <h1>Poll id: {{ pollId }} User: {{ this.userId }} </h1>
    <h1 v-if="isAdmin"> You are the host</h1>
    <!-- Render the QuestionComponent and pass the current question as a prop -->
    <hr />
    <!-- Render all questions from the questions array, TA BORT SEN NÄR ALLT FUNKAR -->
     
    <!-- Redo att ta bort all questions nu, lägg till om debug behövs 

    <h3>All Questions:</h3>
    <ul>
      <li v-for="(q, index) in questions" :key="index">
        {{ q }}
      </li>
    </ul>-->

    <div v-if="view === 'question_view'">
      <!-- Render the question component -->
      <QuestionComponent 
        v-bind:question="currentQuestion"
        v-bind:participants="currentQuestion.a"
        v-on:answer="submitAnswer($event)" 
        :voting="hasVoted"
      />
      <button v-if="isAdmin" v-on:click="adminNext()"> 
        Show result
      </button>

     <!-- Amount of votes only visible by admin -->
      <p v-if="isAdmin">
        {{this.numberOfVotes }} out of {{ participants.length }} has voted
      </p>
    </div>

    <div v-if="view === 'results_view'" >
      <!-- Render ResultQuestionComponent -->
      <ResultQuestionComponent :topAnswer="topAnswer" :maxVotes="maxVotes" />

      <!-- so only admin can use buttons -->
      <div v-if="isAdmin === true">
      <button
        @click="adminNext"
        :disabled="currentQuestionIndex === questions.length - 1"
      >
        Next question
      </button>
      </div>
    </div>

    <!-- testar!! för finalview-->
    <div v-if="view === 'final_view'">
      <!-- Render ResultQuestionComponent -->
      <ResultQuestionComponent :topAnswer="topAnswer" :maxVotes="maxVotes" />

      <!-- so only admin can use buttons -->
      <div v-if="isAdmin === true">
      <button @click="adminToResults">Endgame</button>
      </div >
    </div>

    <!-- Navigation to change the current question 
    <button @click="prevQuestion" :disabled="currentQuestionIndex === 0">
      Previous
    </button>-->

    <!-- Visa array av svaren
    <h3>Saved answers:</h3>
    <div>
      <p id="topAnswer">Top Answer:</p>
      <p id="topVotes">Votes:</p>
    </div>
    <ul>
      <li v-for="(votes, name) in submittedAnswers[pollId]" :key="name">
        {{ name }}: {{ votes }} votes
      </li>
    </ul> -->
  </div>
</template>

<script>
// @ is an alias to /src
import QuestionComponent from "@/components/QuestionComponent.vue";
import ResultQuestionComponent from "@/components/ResultQuestionComponent.vue";

// Initialize the WebSocket connection
import io from "socket.io-client";
const socket = io("localhost:3000");

export default {
  name: "PollView",
  components: {
    QuestionComponent, // Register the QuestionComponent
    ResultQuestionComponent, //Register the ResultQuestionComponent
  },
  data: function () {
    return {
      // Current question data (question text and answer options)
      //question: {q: "", a: [],}, // Legacy object for compatibility
      currentParticipant: {}, //the participant using a certain poll client
      userId: "",

      participants: [], // List of participants for the question
      pollId: "inactive poll",
      submittedAnswers: {},
      isAdmin: false,
      numberOfVotes: 0,

      questionCount: 0,
      questions: [], // Array of all questions
      currentQuestionIndex: 0, // Tracks the index of the current question
      currentQuestion: { q: "", a: [] }, // Represents the current question and its answers
      siteUserId: null,
      topAnswer: "", // Initialize with an empty string
      maxVotes: 0, // Initialize with 0
      hasVoted: false,
      view: "question_view", // 'question_view' or 'results_view'
    };
  },

  created: function () {
    // Poll ID    // Set the poll ID from route params
    this.pollId = this.$route.params.id;

    // User ID    // Set the user ID from route params
    this.userId = this.$route.params.userId;
    
    this.checkAdminStatus()

  
    socket.emit("getCurrentParticipant", {
      pollId: this.pollId,
      userId: this.userId,

      
    });
    socket.emit("participantsUpdate")
    socket.on("participantsUpdate", (p) => (this.participants = p));
    //Listen for admin to press next
    

    // Get this participant
    socket.on("currentParticipant", (participantData) => {
      this.currentParticipant = participantData;
      console.log("Participant name received:", participantData.name);
    });

    // Listen for server events to update the question and submitted answers
    socket.on("questionUpdate", (q) => {
      this.currentQuestion = q;
      //console.log("Updated question:", q); // Add this log
    }); // Update the current question

    socket.on("participantNextQuestion", () => this.particpantNext()

  );
  //LISTENER FOR GAME END
  socket.on("finishGame" ,() => this.toResults()
      );

    socket.on(
      "submittedAnswersUpdate",
      (answers) => (this.submittedAnswers = answers)
    ); // Update the submitted answers

    socket.on("uiLabels", (labels) => (this.uiLabels = labels)); // Update UI labels

    // Emit events to get UI labels and join the poll
    socket.emit("getUILabels", this.lang);

    socket.emit("joinPoll", this.pollId);

    // Begär redan sparade svar från servern
    socket.emit("getSubmittedAnswers", this.pollId);

    socket.on("previousAnswers", (answers) => {
      this.submittedAnswers = answers;
      //console.log("Tidigare svar hämtade från servern:", answers);
    });

    //ask server for chosen questions
    socket.emit("getQuestionsForGame", this.pollId);

    //Get questions from server
    socket.on("questionsForGame", (qs) => {
      if (qs) {
        this.questions = qs;
        this.updateCurrentQuestion(0); // Start with the first question
        //console.log("Questions received from server:", this.questions);
      } else {
        console.error("Received empty questions array from server.");
      }
    });

    //Kolla så kallas på efter att folk har röstat
    socket.off("topAnswerUpdate"); // Clear any existing listeners

    socket.on("topAnswerUpdate", (data) => {
      //console.log("Received data:", data); // Log the received data
      const { topAnswer, maxVotes } = data;
      console.log(`Most voted answer: ${topAnswer} with ${maxVotes} votes.`);
      this.topAnswer = topAnswer;
      this.maxVotes = maxVotes;

      //Uppdaterar röstare. Kan vara problematisk
      socket.on("updateNumberOfVotes", () => {
        if(this.isAdmin){
        this.numberOfVotes += 1
      
        if(this.numberOfVotes === this.participants.length){
          
          this.adminNext()
        }}
        
        socket.off("updateNumberOfVotes");
      })
    });

  },

  methods: {
    submitAnswer: function (answer) {
      const voter = this.currentParticipant; // Assume `currentParticipant` contains the voter's info

      // Emit the answer to the server
      socket.emit("submitAnswer", {
        pollId: this.pollId,
        answer: answer,
        //voter: this.userId,
        voter: this.userId,
      });
      console.log("Answer sent:", answer, "by voter", voter.name);

      //uppdatera topanswer och votecounten
     
      socket.emit("runQuestionResults", this.pollId);
      this.hasVoted= true;
      socket.emit("playerVoted", this.userId)
      //flyttat socket.on top answer update till created delen

      return result;
    },
  //},
   
    switchView(){
    
      //const answers = poll.answers[currentQuestion];
      
       // If it's the last question, transition to final view
      if (this.currentQuestionIndex === this.questions.length - 1) {
        console.log("Last question answered. Switching to final view.");
        this.view = "final_view";
      } else {
        // Switch view to show the result after answer submission
        this.view = "results_view";
        console.log("Changed to result view.");
      }
    },
    
    checkAdminStatus(callback) {
     
      // Emit admin check request
      socket.emit("checkAdmin", { pollId: this.pollId, userId: this.userId });

      // Listen for the server's response
      socket.on("adminCheckResult", (data) => {
        if (data.isAdmin) {
          console.log("You are the admin for this poll.");
          this.isAdmin = true; // Set admin flag
        } else if (data.error) {
          console.error(data.error); // Handle errors (e.g., poll does not exist)
          alert(data.error);
          return; // Stop further execution
        } else {
          console.log("You are not the admin for this poll.");
          this.isAdmin = false; // Set participant flag
        }
        // Execute the callback after admin check
        if (typeof callback === "function") callback();
      });
    },

    // Update the question with server data or a randomly selected question
    updateQuestion: function (serverQuestion) {
      if (serverQuestion && serverQuestion.q) {
        this.currentQuestion.q = serverQuestion.q;
        this.currentQuestion.a = serverQuestion.a || [];

        console.log("current q:", this.currentQuestion.q);
      }
    },

    nextQuestion: function () {
      
      // Check if the current question is NOT the last question
      if (this.currentQuestionIndex < this.questions.length - 1) {
        this.currentQuestionIndex += 1; // Increment the index
        this.updateCurrentQuestion(this.currentQuestionIndex); // Update the question
        console.log("Current question index:", this.currentQuestionIndex);

        // Switch back to 'question' view
        this.view = "question_view";
      }
      // If it's the last question, switch to the final view
      else if (this.currentQuestionIndex === this.questions.length - 1) {
        console.log("No more questions. Switching to final view."); //printas aldrig

        this.view = "final_view";
    
      }
      
      this.hasVoted= false;
      this.numberOfVotes= 0;
    },
    
    adminNext(){
      socket.emit("nextQuestion", this.pollId, this.userId);
      console.log("IN Admin NExt")
    },

    particpantNext(){
      if( this.view === "question_view"){
        console.log("participant next result")
       
        this.switchView()
      }
      
      else if( this.view === "results_view" || this.view ==="final_view"){
        console.log("participant next question");
        if(this.isAdmin){
          socket.emit("votingReset", this.pollId)
        }
          this.nextQuestion()
        }
      
  },
      

    updateCurrentQuestion: function (index) {
      console.log("Updating current question to index:", index);
      if (this.questions && this.questions[index]) {
        this.currentQuestion = this.questions[index];
        console.log("Current question data:", this.currentQuestion);
      } else {
        console.error("Invalid question index:", index);
      }
    },
    adminToResults(){
      socket.emit("toResults", this.pollId, this.userId);
      console.log("IN Admin FINAL")

    },

    toResults: function () {
      console.log("game finished, going to result view");
      this.$router.push(`/result/${this.pollId}`);
    },
  },

};
</script>
