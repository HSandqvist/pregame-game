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

  /*
  // Event: Add a new question to a poll
  socket.on("addQuestion", function (d) {
    // Add the question and answer options to the specified poll
    data.addQuestion(d.pollId, { q: d.q, a: d.a });
    // Emit the updated question data to the client
    socket.emit("questionUpdate", data.getQuestion(d.pollId));
  });*/

  // Event: Add a new question to a poll
  socket.on("addQuestion", function (d) {
    const pollId = d.pollId;
    const question = d.q; // The question text

    // Add the question and random answer options to the poll
    data.addQuestion(pollId, question);

    // Emit the updated question data with answers to the client
    const questionData = data.getQuestion(pollId);
    socket.emit("questionUpdate", questionData);

    // Optionally, broadcast the updated question to all participants
    io.to(pollId).emit("questionUpdate", questionData);
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

  /*// Event: Run a specific question in a poll
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
  });*/

  // Event: Run a specific question in a poll (with random question handling)
  socket.on("runQuestion", function (d) {
    const pollId = d.pollId;

    // Get all questions from the poll
    const poll = data.getPoll(pollId);
    const questionCount = poll.questions.length;

    // Select a random question if there are multiple questions
    const randomQuestionIndex = Math.floor(Math.random() * questionCount);
    const randomQuestion = poll.questions[randomQuestionIndex];

    // Emit the random question to the clients
    io.to(pollId).emit("questionUpdate", randomQuestion);

    // Emit the random answers for this question
    io.to(pollId).emit(
      "submittedAnswersUpdate",
      data.getSubmittedAnswers(pollId)
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

  //send chosen questions for the game to clients
  socket.on("getQuestionsForGame", function (pollId) {
    console.log("in getquestionsforgame");
    console.log(data.polls[pollId].questions);

    if (polls[pollId]) {
      data.generateQuestions(pollId, polls[pollId].questionCount);

      const gameQuestions = polls[pollId].questions;

      console.log("server skickar frågorna", gameQuestions);
      socket.emit("questionsForGame", gameQuestions);
    } else {
      console.log("frågor laddades inte i server, poll existerar inte")
    }
  });


  // get questions from json file in create view
  socket.on("sendQuestionsFromFileData", (questionsData) => {
    // Store the categories received from the client
    data.categories = questionsData.categories;
  
    console.log('Received and stored categories:', data.categories);
  });

  //FÖR ATT SPARA KATEGORIN MM
  /*socket.on("runQuestion", function (d) {
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
  });*/
  //slut - FÖR ATT SPARA KATEGORIN MM (finns även lite i submit answer)
}

// Export the sockets function for use in other modules
export { sockets };
