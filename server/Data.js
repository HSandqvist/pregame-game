"use strict";
import { readFileSync } from "fs"; // Import the readFileSync function for reading files, reading questions

// Define a Data class to encapsulate poll data and keep the global namespace clean.
// In a real-world scenario, this would interface with a database.

function Data() {
  this.polls = {}; // Object to store all polls

  this.categories = {}; //Store categories from external json file

  this.totalAnswers = { categories: {} }; // Object to store votes per category

  /*
  // Initialize with a sample poll for testing purposes
  this.polls["test"] = {
    lang: "en", // Language for the poll
    questions: [
      // Array of questions
      {
        q: "How old are you?", // Question text
        a: ["0-13", "14-18", "19-25", "26-35", "36-45", "45-"], // Answer options
      },
      {
        q: "How much do you enjoy coding?", // Another question
        a: ["1", "2", "3", "4", "5"], // Answer options
      },
    ],
    answers: [], // Placeholder for submitted answers
    currentQuestion: 0, // Index of the current question
    participants: [], // Array of participants in the poll

    totalAnswers: {
      categories: {}, // Object to store votes per category
    },
  };*/
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
  timerCount,
) {
  if (!this.pollExists(pollId)) {
    let poll = {
      lang: lang, // Poll language

      questionCount: questionCount, // The number of questions for the poll
      timerCount: timerCount, // Time allocated per question

      questions: [], // Empty array for questions
      answers: [], // Empty array for answers
      participants: [], // Empty array for participants
      currentQuestion: 0, // Start with the first question
      adminId: adminId,
      categoryWinners: {}, // To store the top participants for each category
      categories: this.categories, // Add the passed categories
    };
    this.polls[pollId] = poll; // Add the poll to the polls object
    console.log("poll created", pollId, poll, "Admin is:", adminId);
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

// Add a question to a poll
Data.prototype.addQuestion = function (pollId, q) {
  if (this.pollExists(pollId)) {
    this.polls[pollId].questions.push(q);
  }
};

// Retrieve a specific question from a poll
Data.prototype.getQuestion = function (pollId, qId = null) {
  if (this.pollExists(pollId)) {
    const poll = this.polls[pollId];
    if (qId !== null) {
      poll.currentQuestion = qId; // Update the current question index
    }
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
Data.prototype.submitAnswer = function (pollId, answer) {
  if (this.pollExists(pollId)) {
    const poll = this.polls[pollId];
    let answers = poll.answers[poll.currentQuestion];

    // Create an answers object for the current question if it doesn't exist
    if (typeof answers !== "object") {
      answers = {};
      poll.answers[poll.currentQuestion] = answers;
    }

    // Increment the count for the participant (keyed by their name)
    if (typeof answers[answer] === "undefined") {
      answers[answer] = 1; // First vote for this participant
    } else {
      answers[answer] += 1; // Increment vote count
    }

    console.log("Updated answers for question:", poll.currentQuestion, answers);
  }
};

Data.prototype.runQuestion = function (pollId, qId) {
  if (this.pollExists(pollId)) {
    const poll = this.polls[pollId];

    // Save the top participant for the current question
    if (poll.answers[poll.currentQuestion]) {
      const answers = poll.answers[poll.currentQuestion];
      let maxVotes = 0;
      let topParticipant = null;

      for (const [name, votes] of Object.entries(answers)) {
        if (votes > maxVotes) {
          maxVotes = votes;
          topParticipant = name;
        }
      }
    }
    // Map the current question to its category
    const question = poll.questions[poll.currentQuestion];
    const category = this.getCategoryForQuestion(question.q);
    console.log(`Category for question: ${currentQuestion.q} is '${category}`);

    // Save the top participant in the category winners object
    if (category && topParticipant) {
      poll.categoryWinners[category] = topParticipant;
      console.log(
        `Saved top participant '${topParticipant}' for category '${category}`
      );
    }

    // Initialize category in totalAnswers if not already
    if (!this.totalAnswers.categories[category]) {
      this.totalAnswers.categories[category] = {};
    }

    // Initialize username in the category if not already
    if (!this.totalAnswers.categories[category][topParticipant]) {
      this.totalAnswers.categories[category][topParticipant] = 0;
    }

    // Increment the vote count for the top participant in the category
    this.totalAnswers.categories[category][topParticipant] += 1;

    console.log(
      `Updated totalAnswers for category '${category}':`,
      this.totalAnswers.categories[category]
    );

    // Reset key-value pair for the new question
    poll.currentQuestion = qId;
    poll.answers[qId] = {}; // Reset answers for the new question
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

// Store top participants for category for results

//vi gör redan detta i konstruktorn ovan
/*Data.prototype.totalAnswers = {
    categories: {}, // Object to store votes per category
  };*/

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
      //const selectedRandomAnswers = this.loadRandomAnswers(pollId); // Load random answers

      questions.push({ q: randomQuestion, a: ["test1", "test2", "test3"] }); //for testing purposes
      //questions.push({ q: randomQuestion, a: selectedRandomAnswers });
    }

    poll.questions = questions; // Assign the questions to the poll
    console.log(`Generated questions for poll ${pollId}:`, questions);

    return questions;//behövs nog inte om inte för debug
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

    // Randomize three unique usernames
    while (selectedAnswers.length < 3) {
      const randomUsername =
        participants[Math.floor(Math.random() * participants.length)].name;

      // Prevent the same person from being chosen multiple times
      if (!selectedAnswers.includes(randomUsername)) {
        selectedAnswers.push(randomUsername);
      }
    }
    return selectedAnswers; // Return an array of 3 random usernames
  }
  return []; // Return empty array if poll doesn't exist
};
//};

// Export the Data class
export { Data };
