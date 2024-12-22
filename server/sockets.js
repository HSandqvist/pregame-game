const polls = {};
// Define the sockets function to handle WebSocket events
function sockets(io, socket, data) {
  // Event: Request UI labels based on language
  socket.on("getUILabels", function (lang) {
    // Emit the UI labels back to the client
    socket.emit("uiLabels", data.getUILabels(lang));
  });

  // Event: Create a new poll
  socket.on("createPoll", function (d) {
    // Create a poll with the given ID and language
    data.createPoll(d.pollId, d.lang, d.adminId, d.questionCount, d.timerCount);

    // Emit the poll data back to the client
    socket.emit("pollData", data.getPoll(d.pollId));
  });

  // Event: Add a new question to a poll
  socket.on("addQuestion", function (d) {
    // Add the question and answer options to the specified poll
    data.addQuestion(d.pollId, { q: d.q, a: d.a });
    // Emit the updated question data to the client
    socket.emit("questionUpdate", data.getQuestion(d.pollId));
  });

  // Event: Join a poll
  socket.on("joinPoll", function (d) {
    // Add the client to the specified poll room
    socket.join(d.pollId);
    //data.addParticipant(d.pollId, d.myName);
    // Emit the current question data to the client
    socket.emit("questionUpdate", data.getQuestion(d.pollId));
    // Emit the submitted answers for the current question to the client
    socket.emit("submittedAnswersUpdate", data.getSubmittedAnswers(d.pollId));

    //debug
    console.log("Poll ID:", this.pollId);
    console.log("Current Question:", this.currentQuestion);
    console.log("Submitted Answers:", this.submittedAnswers);

    //ev lägga till
    // Send the adminId to the client after joining
    const poll = data.getPoll(d.pollId);
    socket.emit("adminId", poll.adminId);
  });

  // Event: Participate in a poll
  socket.on("participateInPoll", function (d) {
    //see who is joining
    console.log("Participant joining poll:", d.name);
    // Add a new participant to the poll
    data.participateInPoll(d.pollId, d.name, d.avatar, d.userId, d.isAdmin);
    // Notify all clients in the poll room about the updated participant list
    io.to(d.pollId).emit("participantsUpdate", data.getParticipants(d.pollId));
  });

  // Event: Start a poll
  socket.on("startPoll", function (pollId) {
    // Notify all clients in the poll room that the poll has started
    io.to(pollId).emit("startPoll");
  });

  // Event: Run a specific question in a poll
  socket.on("runQuestion", function (d) {
    // Get the specified question and update the current question in the poll
    let question = data.getQuestion(d.pollId, d.questionNumber);
    // Notify all clients in the poll room with the question data
    io.to(d.pollId).emit("questionUpdate", question);
    // Notify all clients with the submitted answers for the current question
    io.to(d.pollId).emit(
      "submittedAnswersUpdate",
      data.getSubmittedAnswers(d.pollId)
    );
  });

  socket.on("submitAnswer", function ({ pollId, answer }) {
    // Ensure the poll exists in memory
    if (!polls[pollId]) {
      polls[pollId] = { answers: {}, currentQuestion: null }; // Initialize poll if not created
      console.log(`Poll ${pollId} initialized. Poll structure:`, polls[pollId]);

      data.submitAnswer(pollId, answer);
      console.log(`Answer received: ${answer} for poll ${pollId}`);
    }
    const pollAnswers = polls[pollId].answers;

    // Initialize the structure for the current question's answers if it doesn't exist
    if (!pollAnswers[polls[pollId].currentQuestion]) {
      pollAnswers[polls[pollId].currentQuestion] = {}; // Initialize answers for current question
      console.log(
        `Answers for question ${polls[pollId].currentQuestion} initialized in poll ${pollId}`
      );
    }

    // Ensure the answers object for the current question exists
    if (!pollAnswers[polls[pollId].currentQuestion]) {
      pollAnswers[polls[pollId].currentQuestion] = {};
      console.log(
        "Answers for question ${polls[pollId].currentQuestion} initialized in poll ${pollId}"
      );
    }

    const currentQuestionAnswers = pollAnswers[polls[pollId].currentQuestion];

    // If the answer doesn't exist for this question, initialize it with a count of 0 and empty voters
    if (!currentQuestionAnswers[answer]) {
      currentQuestionAnswers[answer] = { count: 0, voters: [] }; // Initialize the answer
    }

    // Increment the vote count for the selected answer
    currentQuestionAnswers[answer].count += 1; // Increment vote count
    currentQuestionAnswers[answer].voters.push(answer); // Optionally track voters

    console.log(
      `Updated answers for question ${polls[pollId].currentQuestion} in poll ${pollId}:`,
      currentQuestionAnswers
    );

    // Find the answer with the most votes
    let topAnswer = null;
    let maxVotes = 0;

    // Iterate over the answers and find the one with the most votes
    for (let answerKey in currentQuestionAnswers) {
      const voteCount = currentQuestionAnswers[answerKey];
      if (voteCount > maxVotes) {
        maxVotes = voteCount;
        topAnswer = answerKey; // Store the answer with the highest votes
      }
    }

    console.log(
      `Top answer for poll ${pollId}: ${topAnswer} with ${maxVotes} votes.`
    );

    // Emit the most voted answer to all clients in the poll room
    io.to(pollId).emit("topAnswerUpdate", { topAnswer, maxVotes });
  });

  socket.on("endQuestion", ({ pollId }) => {
    if (data.pollExists(pollId)) {
      data.runQuestion(pollId, data.getPoll(pollId).currentQuestion + 1);

      // Emit updated results for the category
      const poll = data.getPoll(pollId);
      const currentCategory = data.getCategoryForQuestion(
        poll.questions[poll.currentQuestion].q
      );
      const categoryResults = data.totalAnswers.categories[currentCategory];
      io.to(pollId).emit("categoryResultsUpdate", categoryResults);
    }
  });

  // Event: Check if user is the admin
  socket.on("checkAdmin", function (d) {
    const { pollId, userId } = d; // Extract pollId and userId from the client
    if (data.pollExists(pollId)) {
      const isAdmin = data.getPoll(pollId).adminId === userId; // Compare userId with adminId
      socket.emit("adminCheckResult", { isAdmin }); // Emit result back to the client
    } else {
      socket.emit("adminCheckResult", {
        isAdmin: false,
        error: "Poll does not exist",
      }); // Error handling
    }
  });

  socket.on("getSubmittedAnswers", function (pollId) {
    const answers = polls[pollId]?.answers || [];
    socket.emit("previousAnswers", answers);
    console.log(`Sent answers for poll ${pollId}:`, answers);
  });

  socket.on("endPoll", function (pollId) {
    if (polls[pollId]) {
      delete polls[pollId]; // Remove the poll data
      console.log(`Poll ${pollId} ended and data removed.`);
    }
  });

  //FÖR ATT SPARA KATEGORIN MM
  socket.on("runQuestion", function (d) {
    const { pollId, questionNumber } = d;

    // Call the updated Data method to reset answers and save category winners
    data.runQuestion(pollId, questionNumber);

    // Emit the updated question to the clients
    const question = data.getQuestion(pollId, questionNumber);
    io.to(pollId).emit("questionUpdate", question);

    // Emit the reset submitted answers
    io.to(pollId).emit(
      "submittedAnswersUpdate",
      data.getSubmittedAnswers(pollId)
    );

    // Emit the updated category winners
    const poll = data.getPoll(pollId);
    io.to(pollId).emit("categoryWinnersUpdate", poll.categoryWinners);
  });
  //slut - FÖR ATT SPARA KATEGORIN MM (finns även lite i submit answer)

  //ladda in val av antal frågor (och sen även tid per fråga) till spelet

  // Socket event to set the number of questions
  socket.on("getQuestionCount", (pollId) => {
    //const { pollId, questionCount } = d;

    if (data.polls && data.polls[pollId]) {
      // Store the question count for the poll
      const questionCount = data.polls[pollId].questionCount;
      console.log(`Poll ${pollId} set to have ${questionCount} questions.`);

      socket.emit("sendQuestionCount", { questionCount });
    } else {
      console.error(`Poll with ID ${pollId} does not exist.`);
      socket.emit("error", {
        message: `Poll with ID ${pollId} does not exist.`,
      });
    }
  });

  //slut - ladda in val av antal frågor (och sen även tid per fråga) till spelet

  //Spara frågor på servern och skicka till clienter
  socket.on("saveQuestionsForClients", ({ pollId, questions }) => {
    // Check if the pollId exists in the polls object
    if (!polls[pollId]) {
      // If it doesn't exist, initialize it
      polls[pollId] = { questions: [] }; // Initialize with an empty array for questions or other default structure
    }

    // Now you can safely set the questions
    polls[pollId].questions = questions;

    // Broadcast the questions to all clients in the room
    io.to(pollId).emit("questionsForGame", { questions: questions });
    console.log("Emitting questionsForGame event:", questions);
  });
}

// Export the sockets function for use in other modules
export { sockets };
