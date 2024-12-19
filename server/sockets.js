const polls = {};
// Define the `sockets` function to handle WebSocket events
function sockets(io, socket, data) {
  // Event: Request UI labels based on language
  socket.on("getUILabels", function (lang) {
    // Emit the UI labels back to the client
    socket.emit("uiLabels", data.getUILabels(lang));
  });

  // Event: Create a new poll
  socket.on("createPoll", function (d) {
    // Create a poll with the given ID and language
    data.createPoll(d.pollId, d.lang, d.adminId);
    // Emit the poll data back to the client
    socket.emit("pollData", data.getPoll(d.pollId));

    // Emit the adminId for the client to use
    //socket.emit("adminId", d.adminId);
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

    //ev lägga till
    // Send the adminId to the client after joining
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

  
  /*socket.on("submitAnswer", function ({ pollId, answer }) {
    // Check if the poll exists in the in-memory store
    if (!polls[pollId]) {
      polls[pollId] = { answers: [] }; // Initialize poll data if not already created
    }

    const pollAnswers = polls[pollId].answers;
  
    // Ensure the current question's answers object exists
    if (!pollAnswers[polls[pollId].currentQuestion]) {
      pollAnswers[polls[pollId].currentQuestion] = {};
    }
  
    const currentQuestionAnswers = pollAnswers[polls[pollId].currentQuestion];
  
    // Increment the vote count for the selected answer (participant's name)
    if (!currentQuestionAnswers[answer]) {
      currentQuestionAnswers[answer] = 1; // First vote for this participant
    } else {
      currentQuestionAnswers[answer] += 1; // Increment vote count
    }
  
    console.log(`Answer updated for poll ${pollId}:`, currentQuestionAnswers);
  
    // Notify all clients in the poll room with the updated answers
    io.to(pollId).emit("submittedAnswersUpdate", currentQuestionAnswers);

  });*/




 /* //VARIANT 2 Hare en bra struktur för hur vi loggar svaren för categoreer
  socket.on("submitAnswer", function ({ pollId, answer, userId }) {
    // Ensure the poll exists
    if (!polls[pollId]) {
      polls[pollId] = { answers: {}, currentQuestion: null }; // Initialize poll data if not already created
    }
  
    const pollAnswers = polls[pollId].answers;
  
    // Ensure the current question's answers object exists
    if (!pollAnswers[polls[pollId].currentQuestion]) {
      pollAnswers[polls[pollId].currentQuestion] = {};
      console.log(`Poll ${pollId} created. Poll structure:`, polls[pollId]);
    }
  
    const currentQuestionAnswers = pollAnswers[polls[pollId].currentQuestion];
  
    // Increment the vote count for the selected answer
    if (!currentQuestionAnswers[answer]) {
      currentQuestionAnswers[answer] = { count: 1, voters: [userId] }; // First vote for this answer
    } else {
      currentQuestionAnswers[answer].count += 1; // Increment vote count
      currentQuestionAnswers[answer].voters.push(userId); // Track the voter
    }
  
    console.log(`Answer updated for poll ${pollId}:`, currentQuestionAnswers);
  
    // Find the answer with the most votes
    let topAnswer = null;
    let maxVotes = 0;
    for (let answerKey in currentQuestionAnswers) {
      const answerData = currentQuestionAnswers[answerKey];
      if (answerData.count > maxVotes) {
        maxVotes = answerData.count;
        topAnswer = answerKey; // Save the answer with the highest vote count
      }
    }
  
    // Emit the most popular answer to clients
    io.to(pollId).emit("topAnswerUpdate", { topAnswer, maxVotes });
  });*/


  //VARIANT 3
  socket.on("submitAnswer", function ({ pollId, answer }) {
    // Ensure the poll exists in memory
    if (!polls[pollId]) {
      polls[pollId] = { answers: {}, currentQuestion: null }; // Initialize poll if not created
      console.log(`Poll ${pollId} initialized. Poll structure:`, polls[pollId]);
    }
    const pollAnswers = polls[pollId].answers;
  
    // If this answer doesn't exist, initialize it with a vote count of 0
    if (pollAnswers[answer]) {
      pollAnswers[answer] = { count : 0, voters : []};
    }

  
    // Ensure the answers object for the current question exists
    if (!pollAnswers[polls[pollId].currentQuestion]) {
      pollAnswers[polls[pollId].currentQuestion] = {};
      console.log(`Answers for question ${polls[pollId].currentQuestion} initialized in poll ${pollId}`);
    }
  
    const currentQuestionAnswers = pollAnswers[polls[pollId].currentQuestion];
  
    // Increment the vote count for the selected answer
    if (!currentQuestionAnswers[answer]) {
      currentQuestionAnswers[answer] = 1; // First vote for this answer
    } else {
      currentQuestionAnswers[answer] += 1; // Increment vote count
    }
  
    console.log(`Updated answers for question ${polls[pollId].currentQuestion} in poll ${pollId}:`, currentQuestionAnswers);
  
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
  
    console.log(`Top answer for poll ${pollId}: ${topAnswer} with ${maxVotes} votes.`);
  
    // Emit the most voted answer to all clients in the poll room
    io.to(pollId).emit("topAnswerUpdate", { topAnswer, maxVotes });
  });
  


  

  socket.on('checkAdmin', function(d) {
    const { pollId, userId } = d;
    const isAdmin = data.isAdmin(pollId, userId);
    socket.emit('adminCheckResult', { isAdmin });
  });

   // Event: Check if user is the admin
   socket.on('checkAdmin', function(d) {
    const { pollId, userId } = d; // Extract pollId and userId from the client
    if (data.pollExists(pollId)) {
      const isAdmin = data.getPoll(pollId).adminId === userId; // Compare userId with adminId
      socket.emit('adminCheckResult', { isAdmin }); // Emit result back to the client
    } else {
      socket.emit('adminCheckResult', { isAdmin: false, error: "Poll does not exist" }); // Error handling
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
    io.to(pollId).emit("submittedAnswersUpdate", data.getSubmittedAnswers(pollId));

    // Emit the updated category winners
    const poll = data.getPoll(pollId);
    io.to(pollId).emit("categoryWinnersUpdate", poll.categoryWinners);
});
//slut - FÖR ATT SPARA KATEGORIN MM (finns även lite i submit answer)




 
//ladda in val av antal frågor (och sen även tid per fråga) till spelet
let pollData = {}; // Example of in-memory storage, can be replaced with database ALT andvända DATA.JS?

// Socket event to set the number of questions
socket.on('setQuestionCount', (data) => {
  const { pollId, questionCount } = data;
  
  // Store the question count for the poll
  pollData[pollId] = pollData[pollId] || {};
  pollData[pollId].questionCount = questionCount;
  console.log(`Poll ${pollId} set to have ${questionCount} questions.`);
});

socket.on('getQuestionCount', (data) => {
  const { pollId } = data;
  const questionCount = pollData[pollId] ? pollData[pollId].questionCount : 0;

  socket.emit('sendQuestionCount', { questionCount });
});
//slut - ladda in val av antal frågor (och sen även tid per fråga) till spelet


}

// Export the `sockets` function for use in other modules
export { sockets };
