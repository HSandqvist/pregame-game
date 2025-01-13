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
    data.createPoll(d.pollId, d.lang, d.adminId, d.questionCount);

    // Emit the poll data back to the client
    socket.emit("pollData", data.getPoll(d.pollId));
  });

  socket.on("leavePoll", function (d) {
    const { pollId, userId } = d;
    const poll = data.getPoll(pollId);
    console.log("leavePoll körs av ", userId);

    
    if (poll) {
      // Remove the participant from the poll
      console.log("leavePoll körs från socket", pollId);
      console.log("participants innan", poll.participants);
      try{if(poll.participants.length === 1){
        poll.participants = {};
        console.log("deleting poll");
        delete data.polls[pollId];

      console.log("polls after delete", data.polls);
      }
      else{
        poll.participants = poll.participants.filter(
          (participant) => participant.userId != userId)}
        }
        catch(err){console.log("Rushing in socket for deleting poll caught", err)}
     
      // Notify all clients in the poll room about the updated participant list
      console.log("participants update kördes från socket", poll.participants);

      io.to(pollId).emit("waitingParticipantsUpdate", poll.participants);
      console.log("participants update blev", poll.participants);}
    
  });

  socket.on("updatePollInfo", function (d) {
    console.log("updateView körs från socket", d.pollId);
    data.updateView(d.pollId, d.currentView);
    const poll = data.getPoll(d.pollId, d.currentView);
    console.log("updateView ändrar från socket", poll.currentView);

    io.to(d.pollId).emit("pollInfoUpdate", {
      pollId: poll.pollId,
      currentView: poll.currentView,
      currentQuestion: poll.currentQuestion,
    });
  });

  socket.on("pollInfoUpdatePersonal", function (d) {
    const poll = data.getPoll(d.pollId);

    socket.emit("pollInfoUpdate", {
      pollId: poll.pollId,
      currentView: poll.currentView,
      currentQuestion: poll.currentQuestion,
    });
  });

  socket.on("adminLeavePoll", function (d) {
    const poll = data.getPoll(d.pollId);
    if (poll) {
      // Remove the poll from the data
      
      // Notify all clients in the poll room that the poll has ended
      io.to(d.pollId).emit("adminLeftPoll");
    }
  });

  // Event: Join a poll
  socket.on("joinPoll", function (pollId) {
    // Add the client to the specified poll room
    socket.join(pollId);
    // Emit the current question data to the client
    //socket.emit("questionUpdate", data.getQuestion(pollId));
    // Emit the submitted answers for the current question to the client
    socket.emit("submittedAnswersUpdate", data.getSubmittedAnswers(pollId));
    console.log(pollId, "från socket.js i joinPoll");

    //ev lägga till
    // Send the adminId to the client after joining
    const poll = data.getPoll(pollId);
    socket.emit("adminId", poll.adminId);

    // Send currently taken avatars to the client
    const takenAvatars = data.getSelectedAvatars(pollId);
    io.to(pollId).emit("updateTakenAvatars", takenAvatars);
  });

  // Handle avatar selection
  socket.on("select-avatar", ({ pollId, userId, avatar }) => {
    data.storeSelectedAvatar(pollId, userId, avatar);

    // Broadcast updated avatar list to all clients in the poll
    const updatedAvatars = data.getSelectedAvatars(pollId);
    io.to(pollId).emit("updateTakenAvatars", updatedAvatars);
  });

  socket.on("getAllParticipantsForGame", function (pollId) {
    console.log("getting participants in socket from data");
    io.to(pollId).emit("allParticpantsForGame", data.getParticipants(pollId));
  });

  // Event: Participate in a poll
  socket.on("participateInPoll", function (d) {
    //see who is joining
    console.log("Participant joining poll:", d.name);

    const poll = data.getPoll(d.pollId);
    if (poll.participants.length >= 8) {
      socket.emit("error", { message: "Lobby is full. Maximum participants reached." });
      return; // Stop further processing
    }

    // Add a new participant to the poll
    var testerIsAdmin= false;
    if( d.userId == data.getPoll(d.pollId).adminId) { 
      testerIsAdmin = true;
    }

    data.participateInPoll(d.pollId, d.name, d.avatar, d.userId, testerIsAdmin);
    // Notify all clients in the poll room about the updated participant list
    io.to(d.pollId).emit("participantsUpdate", data.getParticipants(d.pollId));
    //console.log("participants update körs från socket", data.getParticipants(d.pollId));
  });

  socket.on("getParticipants", function (pollId) {
    console.log("getParticipants event triggered for pollId:", pollId);
    io.emit("participantsUpdate", data.getParticipants(pollId));
  });
  socket.on("getPolls", function (pollId) {
    io.to(pollId).emit("pollsUpdate", data.getPoll(pollId));
  });

  // Event: Start a poll
  socket.on("startGame", function (pollId) {
    // Notify all clients in the poll room that the poll has started
    console.log("In socket Admin start");
    io.to(pollId).emit("adminStartGame");
  });

  socket.on("nextQuestion", function (pollId) {
    // Notify all clients in the poll room that the poll has started
    console.log("In socket Admin next");
    io.to(pollId).emit("participantNextQuestion", pollId);
  });

  socket.on("toResults", function (pollId, userId) {
    console.log("in to Results socket");
    io.to(pollId).emit("finishGame");
  });

  socket.on("getCurrentParticipant", function ({ pollId, userId }) {
    // Retrieve the poll using the provided pollId
    const poll = data.getPoll(pollId);

    if (poll && poll.participants) {
      // Find the participant with the matching userId
      const participantData = poll.participants.find(
        (participant) => participant.userId == userId
      );

      if (participantData) {
        // Emit the participant data back to the client
        socket.emit("currentParticipant", participantData);
        io.to(pollId).emit("participantsUpdate", poll.participants);
      } else {
        // Emit an error if no participant with the given userId was found
        socket.emit("currentParticipant", { error: "Participant not found" });
      }
    } else {
      // Emit an error if the poll does not exist or has no participants
      socket.emit("currentParticipant", { error: "Poll not found" });
    }
  });

  socket.on("votingReset", function (pollId) {
    data.votingReset(pollId);
    console.log("är i socket on votingReset");
  });

  // Event: använda för handling när resultatet per fråga ska visas?
  socket.on("runQuestionResults", function (pollId) {
    // Run the question logic (determine the top answer)
    const { topAnswer, maxVotes, topAvatar } = data.runQuestion(pollId); // Now we get the result directly   //NAMN RUNQUESTION BRA NAMN FÖR DETTA?

    console.log(
      `Socket runQuestionResults: Top answer for question: ${topAnswer} with ${maxVotes} votes.`
    );

    console.log(`Emitting topAnswerUpdate: ${topAnswer}, ${maxVotes}`); // Log data before emitting
    // Emit the most voted answer to all clients in the poll room
    io.to(pollId).emit("topAnswerUpdate", { topAnswer, maxVotes, topAvatar });

    // Emit the updated question to the clients
    const question = data.getQuestion(pollId);
    io.to(pollId).emit("questionUpdate", question); //ANVÄNDS DENNA VERKLIGEN?

    // Emit the submitted answers //NÖDVÄNDIGT?
    io.to(pollId).emit(
      //ANVÄNDS DENNA VERKLIGEN?
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

    console.log(`Answer received: ${answer.name} for poll ${pollId}`);
  });

  //Player voted function //behövs thePlayer här? används ej
  socket.on("playerVoted", function (pollId) {
    io.to(pollId).emit("updateNumberOfVotes");
  });

  // Event: Check if user is the admin
  socket.on("checkAdmin", function (d) {
    const { pollId, userId } = d; // Extract pollId and userId from the client


    if (data.pollExists(pollId)) {
      const isAdmin = data.getPoll(pollId).adminId == userId; // Compare userId with adminId
      console.log(`User ${userId} is admin for poll ${pollId}: ${isAdmin}`);
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
      const poll = data.getPoll(pollId);
      const isLobbyFull = poll.participants.length >= 8;
      callback({ exists: true, isFull: isLobbyFull }); // Respond with true if the poll exists
    } else {
      callback({ exists: false, isFull: false }); // Respond with false if the poll doesn't exist
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

  socket.on("getCategoriesWithAnswers", function (pollId) {
    const categoriesWithAnswers = data.polls[pollId].categoryWinners;
    socket.emit("categoriesWithAnswers", categoriesWithAnswers);
    console.log("är i socket categorieswithanswers skickar", categoriesWithAnswers)
  });
}

// Export the sockets function for use in other modules
export { sockets };
