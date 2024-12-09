'use strict';
import { readFileSync } from "fs"; // Import the readFileSync function for reading files

// Define a Data class to encapsulate poll data and keep the global namespace clean.
// In a real-world scenario, this would interface with a database.
function Data() {
  this.polls = {}; // Object to store all polls
  // Initialize with a sample poll for testing purposes
  this.polls['test'] = {
    lang: "en", // Language for the poll
    questions: [ // Array of questions
      {
        q: "How old are you?", // Question text
        a: ["0-13", "14-18", "19-25", "26-35", "36-45", "45-"] // Answer options
      },
      {
        q: "How much do you enjoy coding?", // Another question
        a: ["1", "2", "3", "4", "5"] // Answer options
      }
    ],
    answers: [], // Placeholder for submitted answers
    currentQuestion: 0, // Index of the current question
    participants: [] // Array of participants in the poll
  };
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
  if (!["en", "sv"].some(el => el === lang)) lang = "en";
  // Read the appropriate labels file
  const labels = readFileSync("./server/data/labels-" + lang + ".json");
  return JSON.parse(labels); // Parse and return the labels as an object
};

// Create a new poll if it doesn't already exist
Data.prototype.createPoll = function (pollId, lang = "en") {
  if (!this.pollExists(pollId)) {
    let poll = {
      lang: lang, // Poll language
      questions: [], // Empty array for questions
      answers: [], // Empty array for answers
      participants: [], // Empty array for participants
      currentQuestion: 0 // Start with the first question
    };
    this.polls[pollId] = poll; // Add the poll to the polls object
    console.log("poll created", pollId, poll);
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
Data.prototype.participateInPoll = function (pollId, name) {
  console.log("participant will be added to", pollId, name);
  if (this.pollExists(pollId)) {
    this.polls[pollId].participants.push({ name: name, answers: [] });
  }
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
    if (typeof poll.questions[poll.currentQuestion] !== 'undefined') {
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

    // Create an answers object if none exists
    if (typeof answers !== 'object') {
      answers = {};
      answers[answer] = 1;
      poll.answers.push(answers);
    }
    // Add a new answer property if it doesn't exist
    else if (typeof answers[answer] === 'undefined') {
      answers[answer] = 1;
    }
    // Increment the count if the answer already exists
    else {
      answers[answer] += 1;
    }
    console.log("answers looks like ", answers, typeof answers);
  }
};

// Export the Data class
export { Data };