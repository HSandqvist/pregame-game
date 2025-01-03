import e from "express";

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
  socket.on("startGame", function (pollId) {
    // Notify all clients in the poll room that the poll has started
    io.to(pollId).emit("startGame");
  });

  socket.on("nextQuestion", function (pollId, userId ) {
    // Notify all clients in the poll room that the poll has started
    console.log("In socket Admin next")
    io.emit("participantNextQuestion", pollId, userId);
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

  socket.on("getCurrentParticipant", function ({ pollId, userId }) {
    // Retrieve the poll using the provided pollId
    const poll = data.getPoll(pollId);

    if (poll && poll.participants) {
      // Find the participant with the matching userId
      const participantData = poll.participants.find(
        (participant) => participant.userId === userId
      );

      if (participantData) {
        // Emit the participant data back to the client
        socket.emit("currentParticipant", participantData);
      } else {
        // Emit an error if no participant with the given userId was found
        socket.emit("currentParticipant", { error: "Participant not found" });
      }
    } else {
      // Emit an error if the poll does not exist or has no participants
      socket.emit("currentParticipant", { error: "Poll not found" });
    }
  });

  socket.on("votingReset", function(pollId){
    data.votingReset(pollId);
    console.log("är i socket on votingReset")
  });

  // Event: använda för handling när resultatet per fråga ska visas?
  socket.on("runQuestionResults", function (pollId) {
    //NEDAN BORDE TYP GÖRAS NÄR TIDEN TAGIT SLUT FÖR EN FRÅGA?
    // Run the question logic (determine the top answer)
    const { topAnswer, maxVotes } = data.runQuestion(pollId); // Now we get the result directly

    console.log(
      `Socket runQuestionResults: Top answer for question: ${topAnswer} with ${maxVotes} votes.`
    );

    console.log(`Emitting topAnswerUpdate: ${topAnswer}, ${maxVotes}`); // Log data before emitting
    // Emit the most voted answer to all clients in the poll room
    //io.to(pollId).emit("topAnswerUpdate", { topAnswer, maxVotes }); //uppdatera för alla som är inne i pollen
    io.emit("topAnswerUpdate", { topAnswer, maxVotes });

    // Emit the updated question to the clients
    const question = data.getQuestion(pollId);
    io.to(pollId).emit("questionUpdate", question);

    // Emit the submitted answers //NÖDVÄNDIGT?
    io.to(pollId).emit(
      "submittedAnswersUpdate",
      data.getSubmittedAnswers(pollId)
    );
  });

  socket.on("submitAnswer", function ({ pollId, answer, voter }) {
    // Ensure the poll exists before submitting an answer
    const poll = data.getPoll(pollId);
    if (!poll) {
      console.error(`Poll with ID ${pollId} does not exist.`);
      return; // Early exit if poll doesn't exist
    }
    // Submit the answer via the data function
    data.submitAnswer(pollId, answer, voter);

    console.log(`Answer received: ${answer} for poll ${pollId}`);
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

  socket.on("checkLobbyExists", (pollId, callback) => {
    if (data.pollExists(pollId)) {
      callback({ exists: true }); // Respond with true if the poll exists
    } else {
      callback({ exists: false }); // Respond with false if the poll doesn't exist
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

  // get questions from json file in create view
  socket.on("sendQuestionsFromFileData", (questionsData) => {
    // Store the categories received from the client
    data.categories = questionsData.categories;
    //console.log('Received and stored categories:', data.categories); //DENNA FUNKAR
  });

  //send chosen questions for the game to clients
  socket.on("getQuestionsForGame", function (pollId) {
    const poll = data.polls[pollId];

    //if poll doesn't exist
    if (!poll) {
      console.log(
        `Questions could not load, poll with ID ${pollId} does not exist.`
      );
      return null; // Poll does not exist
    }
    // Generate questions if they don't already exist
    if (!poll.questions || poll.questions.length === 0) {
      const questionCount = poll.questionCount;
      poll.questions = data.generateQuestions(pollId, questionCount);
      console.log(`Generated ${questionCount} questions for poll ID ${pollId}`);
    }
    //send generated questions to game room
    socket.emit("questionsForGame", poll.questions);
    //io.to(pollId).emit("questionsForGame", poll.questions);//denna rad funkar inte...? varför?
  });

  socket.on("getCategoriesWithAnswers", function(pollId) {    
    const categoriesWithAnswers = data.polls[pollId].categoryWinners;
    socket.emit("categoriesWithAnswers", categoriesWithAnswers)
  });




}

// Export the sockets function for use in other modules
export { sockets };
