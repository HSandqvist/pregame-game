"use strict";
import { readFileSync } from "fs"; // Import the readFileSync function for reading files, reading questions

// Define a Data class to encapsulate poll data and keep the global namespace clean.
// In a real-world scenario, this would interface with a database.

function Data() {
  this.polls = {}; // Object to store all polls
  this.categories = {}; //Store categories from external json file
}

/***********************************************
For performance reasons, methods are added to the
prototype of the Data object/class.
***********************************************/

// Check if a poll exists by its ID
Data.prototype.pollExists = function (pollId) {
  return typeof this.polls[pollId] !== "undefined";
};

// Load UI labels from a JSON file based on the specified language
Data.prototype.getUILabels = function (lang) {
  // Default to "en" if the language is invalid
  if (!["en", "sv"].some((el) => el === lang)) lang = "en";
  // Read the appropriate labels file
  const labels = readFileSync("./server/data/labels-" + lang + ".json");
  return JSON.parse(labels); // Parse and return the labels as an object
};

// Create a new poll if it doesn't already exist
Data.prototype.createPoll = function (
  pollId,
  lang = "en",
  adminId,
  questionCount,
  timerCount
) {
  if (!this.pollExists(pollId)) {
    let poll = {
      lang: lang, // Poll language

      questionCount: questionCount, // The number of questions for the poll
      timerCount: timerCount, // Time allocated per question

      //For updating all clients on the current view and question
      currentView: "question_view", // Start with the question view
      currentQuestion: 0, // Start with the first question

      questions: [], // Empty array for questions
      answers: [], // Empty array for answers
      participants: [], // Empty array for participants
      
      adminId: adminId,
      categoryWinners: {}, // To store the top participants for each category
      categories: this.categories, // Add the passed categories
      globalTopAnswer: "test",
    };
    this.polls[pollId] = poll; // Add the poll to the polls object
    //console.log("Poll created", pollId, poll, "Admin is:", adminId);
  }
  return this.polls[pollId];
};

// Retrieve a poll by its ID
Data.prototype.getPoll = function (pollId) {
  if (this.pollExists(pollId)) {
    return this.polls[pollId];
  }
  return {}; // Return an empty object if the poll doesn't exist
};
// Add a participant to a poll
Data.prototype.participateInPoll = function (
  pollId,
  name,
  avatar,
  userId,
  isAdmin
) {
  console.log("participant will be added to", pollId, name, userId, isAdmin);
  // console.log("participant will be added to", pollId, name);
  this.polls[pollId].participants.push({
    name: name,
    avatar: avatar,
    userId: userId,
    isAdmin: isAdmin,
  });
};

// Retrieve participants of a poll
Data.prototype.getParticipants = function (pollId) {
  console.log("participants requested for", pollId);
  if (this.pollExists(pollId)) {
    return this.polls[pollId].participants;
  }
  return [];
};

/* //används inte i nuläget
// Add a question to a poll
Data.prototype.addQuestion = function (pollId, q) {
  if (this.pollExists(pollId)) {
    this.polls[pollId].questions.push(q);
  }
};*/

// Retrieve a specific question from a poll
Data.prototype.getQuestion = function (pollId) {
  if (this.pollExists(pollId)) {
    const poll = this.polls[pollId];
    return poll.questions[poll.currentQuestion];
  }
  return {}; // Return an empty object if the poll doesn't exist
};

// Retrieve submitted answers for the current question of a poll
Data.prototype.getSubmittedAnswers = function (pollId) {
  if (this.pollExists(pollId)) {
    const poll = this.polls[pollId];
    const answers = poll.answers[poll.currentQuestion];
    if (typeof poll.questions[poll.currentQuestion] !== "undefined") {
      return answers;
    }
  }
  return {}; // Return an empty object if no answers are found
};

// Submit an answer to a poll
Data.prototype.submitAnswer = function (pollId, answer, voter) {
  if (this.pollExists(pollId)) {
    const poll = this.polls[pollId];
    const currentQuestion = poll.currentQuestion;

    if (typeof poll.answers[currentQuestion] !== "object") {
      poll.answers[currentQuestion] = {};
    }

    const answers = poll.answers[currentQuestion];

    // Initialize answer count and voters if not already present
    if (!answers[answer.name]) {
      answers[answer.name] = { count: 0, voters: [], avatar: answer.avatar};
      console.log("");
    }
    console.log("answers answer är", answer)

    // Increment the count for this answer
    answers[answer.name].count += 1;

    // Log the voter for the option
    answers[answer.name].voters.push(voter);

    console.log(
      `Sumbit answer: Updated answers for question ${currentQuestion} in poll ${pollId}:`,
      answers
    );
  }
};
Data.prototype.updateView = function (pollId, view) {

  const poll = this.polls[pollId];
    if (view === "question_view") {
     
      poll.currentView = "results_view";
    }
    else if (poll.questionCount -1 === poll.currentQuestion ) {
      console.log("Last question answered. Switching to final view.");
      poll.currentView = "final_view";

    } else {
      // Switch view to show the result after answer submission
      poll.currentView = "question_view";

      console.log("Changed to question view.");
    }
  };


Data.prototype.votingReset = function (pollId) {
  if (this.pollExists(pollId)) {
    const poll = this.polls[pollId];
    const currentQuestion = poll.currentQuestion; //ger ett index??
    console.log("data votingreset har currentquestion:", currentQuestion);
    // Save the winner to the category using the complementary function
    this.updateCategoryWinner(
      pollId,
      poll.questions[currentQuestion].q,
      this.globalTopAnswer
    );

    // Move to the next question
    poll.currentQuestion += 1; // Increment to the next question
   

    poll.answers[poll.currentQuestion] = {}; // Initialize answers for the new question
    console.log(
      "data votingreset har uppdaterat currentquestion till:",
      currentQuestion
    );
  }
};

Data.prototype.runQuestion = function (pollId) {
  if (this.pollExists(pollId)) {
    const poll = this.polls[pollId];
    const currentQuestion = poll.currentQuestion; //ger ett index??
    console.log("data runQuestion har currentquestion:", currentQuestion);

    // Determine the top answer for the current question
    const answers = poll.answers[currentQuestion];
    let maxVotes = 0;
    let topAnswer = {};
    let topAvatar = ""

    for (const [answer, answerdata] of Object.entries(answers)) {
      const { count, voters, avatar } = answerdata; //kanske vill spara voters sen för specifik funktionalitet

      if (count > maxVotes) {
        maxVotes = count;
        topAnswer = answer;
        topAvatar = avatar
        //topAnswer = {answer, avatar};
        this.globalTopAnswer = topAnswer;
      }
    }

    // Log the top answer for the current question
    console.log(
      `Top answer for poll ${pollId}, question ${poll.questions[currentQuestion].q}: ${topAnswer} with ${maxVotes} votes.`
    );

    // Return the topAnswer and maxVotes (to sockets then to clients)
    return { topAnswer, maxVotes, topAvatar };
  }
};

Data.prototype.updateCategoryWinner = function (
  pollId,
  question,
  topParticipant
) {
  if (this.pollExists(pollId)) {
    const poll = this.polls[pollId];

    // Use the helper function to get the category for the question
    const category = this.getCategoryForQuestion(question);

    // Initialize the category in categoryWinners if not already present
    if (!poll.categoryWinners[category]) {
      poll.categoryWinners[category] = {};
    }

    // Increment the vote count for the topParticipant in the category winners object
    if (!poll.categoryWinners[category][topParticipant]) {
      poll.categoryWinners[category][topParticipant] = 0; // Initialize count
    }

    poll.categoryWinners[category][topParticipant] += 1; // Increment count

    console.log(
      `Updated categoryWinners for category '${category}':`,
      poll.categoryWinners[category]
    );
  } else {
    console.error(`Poll ID ${pollId} does not exist.`);
  }
};

// Helper function to map a question to its category
Data.prototype.getCategoryForQuestion = function (question) {
  for (const [category, questions] of Object.entries(this.categories)) {
    if (questions.includes(question)) {
      return category;
    }
  }
  return null;
};

// Check if a given userId is the admin of a poll
Data.prototype.isAdmin = function (pollId, userId) {
  if (this.pollExists(pollId)) {
    return this.polls[pollId].adminId === userId;
  }
  return false;
};

// Function to generate random questions based on count and participant names
Data.prototype.generateQuestions = function (pollId, questionCount) {
  if (this.pollExists(pollId)) {
    const poll = this.polls[pollId];
    const questions = [];
    for (let i = 0; i < questionCount; i++) {
      const randomQuestion = this.loadRandomQuestion(); // Load random question
      const selectedRandomAnswers = this.loadRandomAnswers(pollId); // Load random answers

      questions.push({ q: randomQuestion, a: selectedRandomAnswers });
      //questions.push({ q: randomQuestion, a: selectedRandomAnswers });
    }

    poll.questions = questions; // Assign the questions to the poll
    console.log(`Generated questions for poll ${pollId}:`, questions);

    return questions; //behövs nog inte om inte för debug
  }
  return []; //behövs nog inte om inte för debug
};

// Function to load a random question from the categories
Data.prototype.loadRandomQuestion = function () {
  const categories = Object.keys(this.categories);
  //const categories = Object.keys(questionsEn.categories);
  const randomCategory =
    categories[Math.floor(Math.random() * categories.length)]; // Select a random category

  const randomQuestions = this.categories[randomCategory];
  const randomQuestion =
    randomQuestions[Math.floor(Math.random() * randomQuestions.length)]; // Select a random question from that category

  return randomQuestion;
};

// Method to load random answer options
Data.prototype.loadRandomAnswers = function (pollId) {
  if (this.pollExists(pollId)) {
    const poll = this.polls[pollId];
    const participants = poll.participants;
    const selectedAnswers = [];

    // Randomize three unique users
    while (selectedAnswers.length < 3) {
      const randomUser =
        participants[Math.floor(Math.random() * participants.length)];

      // Prevent the same person from being chosen multiple times
      if (!selectedAnswers.includes(randomUser)) {
        selectedAnswers.push(randomUser);
      }
    }
    return selectedAnswers; // Return an array of 3 random users
  }
  return []; // Return empty array if poll doesn't exist
};
//};

// Export the Data class
export { Data };
