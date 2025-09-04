import React from "react";

function QuizSettings({ roomCode, socket }) {
  function handleSaveSettings(e) {
    e.preventDefault();
    const settings = {
      maxPlayers: e.target.maxPlayers.value,
      topic: e.target.topic.value,
      description: e.target.description.value,
      difficulty: e.target.difficulty.value,
      numQuestions: e.target.numQuestions.value,
      timePerQuestion: e.target.timePerQuestion.value,
    };
    socket.emit("setQuizSettings", { roomCode, settings });
  }

  return (
    <form onSubmit={handleSaveSettings}>
      <h3>Quiz Setup</h3>
      <input
        name="maxPlayers"
        type="number"
        placeholder="No. of players"
        required
      />
      <input name="topic" type="text" placeholder="Quiz topic" required />
      <input
        name="description"
        type="text"
        placeholder="Description (optional)"
      />
      <select name="difficulty">
        <option value="easy">Easy</option>
        <option value="medium">Medium</option>
        <option value="hard">Hard</option>
      </select>
      <input
        name="numQuestions"
        type="number"
        placeholder="No. of questions"
        required
      />
      <input name="timePerQuestion" type="number" placeholder="Time per question (s)" required />
        
      <button type="submit">Save Settings</button>
    </form>
  );
}

export default QuizSettings;
