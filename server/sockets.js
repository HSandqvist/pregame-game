// Define the `sockets` function to handle WebSocket events
function sockets(io, socket, data) {
  
  // Event: Request UI labels based on language
  socket.on('getUILabels', function(lang) {
    // Emit the UI labels back to the client
    socket.emit('uiLabels', data.getUILabels(lang));
  });

  // Event: Create a new poll
  socket.on('createPoll', function(d) {
    // Create a poll with the given ID and language
    data.createPoll(d.pollId, d.lang, d.adminId);
    // Emit the poll data back to the client
    socket.emit('pollData', data.getPoll(d.pollId));
  });

  // Event: Add a new question to a poll
  socket.on('addQuestion', function(d) {
    // Add the question and answer options to the specified poll
    data.addQuestion(d.pollId, { q: d.q, a: d.a });
    // Emit the updated question data to the client
    socket.emit('questionUpdate', data.getQuestion(d.pollId));
  });

  // Event: Join a poll
  socket.on('joinPoll', function(d) {
    // Add the client to the specified poll room
    socket.join(d.pollId);       

    // Emit the current question data to the client
    socket.emit('questionUpdate', data.getQuestion(pollId));
    // Emit the submitted answers for the current question to the client
    socket.emit('submittedAnswersUpdate', data.getSubmittedAnswers(pollId));
  });

  // Event: Participate in a poll
  socket.on('participateInPoll', function(d) {
    // Add a new participant to the poll
    data.participateInPoll(d.pollId, d.name, d.avatar, d.userId, d.isAdmin);
    // Notify all clients in the poll room about the updated participant list
    io.to(d.pollId).emit('participantsUpdate', data.getParticipants(d.pollId));
  });

  // Event: Start a poll
  socket.on('startPoll', function(pollId) {
    // Notify all clients in the poll room that the poll has started
    io.to(pollId).emit('startPoll');
  });

  // Event: Run a specific question in a poll
  socket.on('runQuestion', function(d) {
    // Get the specified question and update the current question in the poll
    let question = data.getQuestion(d.pollId, d.questionNumber);
    // Notify all clients in the poll room with the question data
    io.to(d.pollId).emit('questionUpdate', question);
    // Notify all clients with the submitted answers for the current question
    io.to(d.pollId).emit('submittedAnswersUpdate', data.getSubmittedAnswers(d.pollId));
  });

  // Event: Submit an answer for a poll question
  socket.on('submitAnswer', function(d) {
    // Add the submitted answer to the poll
    data.submitAnswer(d.pollId, d.answer);
    // Notify all clients in the poll room with the updated submitted answers
    io.to(d.pollId).emit('submittedAnswersUpdate', data.getSubmittedAnswers(d.pollId));
  });
}

// Export the `sockets` function for use in other modules
export { sockets };