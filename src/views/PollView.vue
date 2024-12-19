<template>
  <div>
    <h1>Poll id: {{ pollId }}</h1>
    <!-- Render the QuestionComponent and pass the current question as a prop -->
    <hr />
    <h3>Who's most likely to...</h3>
    <span>{{ question.q }}</span>
    <!-- Display the submitted answers -->
    <!-- Ta bort options under sen-->
    <h3>Options:</h3>
    <QuestionComponent
      v-bind:question="question"
      v-bind:participants="question.a"
      v-on:answer="submitAnswer($event)"
    />

    <!-- Visa array av svaren-->
    <h3>Saved answers:</h3>
    <div>
      <h3 id="topAnswer">Top Answer:</h3>
      <p id="topVotes">Votes:</p>
    </div>
    <ul>
      <li v-for="(votes, name) in submittedAnswers[pollId]" :key="name">
        {{ name }}: {{ votes }} votes
      </li>
    </ul>
  </div>
</template>

<script>
// @ is an alias to /src
import QuestionComponent from "@/components/QuestionComponent.vue";
import questionsEn from "@/assets/questions-en.json";

// Initialize the WebSocket connection
import io from "socket.io-client";
const socket = io("localhost:3000");

export default {
  name: "PollView",
  components: {
    QuestionComponent, // Register the QuestionComponent
  },
  data: function () {
    return {
      // Current question data (question text and answer options)
      question: {
        q: "",
        a: [],
      },
      participants: [], // List of participants for the question
      pollId: "inactive poll",
      submittedAnswers: {},
      questionCount: 0,
      questions: [], // Array of all questions
    };
  },

  created: function () {
    // Poll ID    // Set the poll ID from // Collected answers for the poll the route parameter
    this.pollId = this.$route.params.id;
    // Listen for server events to update the question and submitted answers
    socket.on("questionUpdate", (q) => (this.question = q)); // Update the current question
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
      console.log("Tidigare svar hämtade från servern:", answers);
    });

    //VARIANT 3 - fixa så att man kan visa vem som fått mest röster här sen!!
    socket.on("topAnswerUpdate", function ({ topAnswer, maxVotes }) {
      console.log(`Most voted answer: ${topAnswer} with ${maxVotes} votes.`);

      // Update the UI to show the top answer and the number of votes
      document.getElementById(
        "topAnswer"
      ).innerText = `Top Answer: ${topAnswer}`; //ändrar direkt i html element med det i
      document.getElementById("topVotes").innerText = `Votes: ${maxVotes}`;
    });

    //KOLLA ANTAL FRÅGOR I SERVER
    //socket.emit("setQuestionCount", { pollId: this.pollId })


    socket.emit("getQuestionCount", this.pollId);

    socket.on("sendQuestionCount", (data) => {
      this.questionCount = data.questionCount;
      console.log(`Poll ${this.pollId} has ${this.questionCount} questions.`);

      // Now, load the questions based on this count
      this.loadQuestions(this.questionCount);
    });

    /*
    // Fallback to load a random question if no question is received from the server
    setTimeout(() => {
      if (!this.question.q) {
        this.loadRandomQuestion();
      }
      if (!this.question.a.length) {
        this.loadRandomAnswer();
      }
    }, 1000); // Wait a second for potential server response*/
  },
  methods: {
    submitAnswer: function (answer) {
      // Emit the answer to the server
      socket.emit("submitAnswer", { pollId: this.pollId, answer: answer });

      // Optional: Log the action for debugging purposes
      console.log("Answer sent to server:", {
        pollId: this.pollId,
        answer: answer,
      });
    },

    // Update the question with server data or a randomly selected question
    updateQuestion(serverQuestion) {
      if (serverQuestion && serverQuestion.q) {
        this.question.q = serverQuestion.q;
        this.question.a = serverQuestion.a || [];
      }
    },

    loadRandomAnswer(question) {
      const usernames = [
        "Alice",
        "Bob",
        "Charlie",
        "David",
        "Eva",
        "Frank",
        "Grace",
      ];
      const selectedAnswers = [];

      // Slumpa fram tre unika användarnamn
      while (selectedAnswers.length < 3) {
        const randomUsername =
          usernames[Math.floor(Math.random() * usernames.length)];

        // Förhindra att samma användarnamn väljs flera gånger
        if (!selectedAnswers.includes(randomUsername)) {
          selectedAnswers.push(randomUsername);
        }
      }

      this.question.a = selectedAnswers; // Uppdatera svarsalternativen för frågan

      console.log("Slumpmässiga svar:", this.question.a); // Logga de valda användarnamnen
    },

    //FÅ INFO OM ANTAL FRÅGOR FRÅN CREATE VIEW
    loadQuestions(questionCount) {
      // Fetch the required number of random questions
      console.log("question count är", questionCount);
      const questions = [];
      for (let i = 0; i < questionCount; i++) {
        const randomQuestion = this.loadRandomQuestion();

        questions.push(randomQuestion);

        /*
        //If question not a dublicate, push to array
        if (
          randomQuestion &&
          !this.isQuestionDuplicate(questions, randomQuestion)
        ) {
          questions.push(randomQuestion);
        } else {
          i--; // If the question was a duplicate, try again
        }*/

      }
      // Store the random questions to be displayed and used during the game
      this.questions = questions;
      console.log("Loaded questions:", this.questions);
    },

    // Load a random question from the local `questionsEn.json`
    loadRandomQuestion() {
      //console.log("ÄR I LOAD RANDOM QUESTION");

      const categories = Object.keys(questionsEn.categories);
      //console.log("Available categories:", categories);

      const randomCategory =
        categories[Math.floor(Math.random() * categories.length)];
      //console.log("Random category selected:", randomCategory);
      const randomQuestion =
        questionsEn.categories[randomCategory][
          Math.floor(
            Math.random() * questionsEn.categories[randomCategory].length
          )
        ];
      console.log("Chosen question:", randomQuestion);

      return randomQuestion; //return randomly chosen question

      /*  this.question.q = randomQuestion;
      console.log("frågan", this.question.q);
      return this.question.q;*/
    },

    isQuestionDuplicate(questions, newQuestion) {
      // Check if the new question already exists in the questions array
      return questions.some((q) => q.q === newQuestion.q);
    },
    //slut - FÅ INFO OM ANTAL FRÅGOR FRÅN CREATE VIEW
  },
};
</script>
