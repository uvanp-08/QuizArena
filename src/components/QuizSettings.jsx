import React from "react";

function QuizSettings({ roomCode, socket }) {
  function handleSaveSettings(e) {
    e.preventDefault();
    const settings = {
      maxPlayers: Number(e.target.maxPlayers.value),
      topic: e.target.topic.value.trim(),
      description: e.target.description.value.trim(),
      difficulty: e.target.difficulty.value,
      numQuestions: Number(e.target.numQuestions.value),
      timePerQuestion: Number(e.target.timePerQuestion.value),
    };
    socket.emit("setQuizSettings", { roomCode, settings });
  }

  return (
    <form onSubmit={handleSaveSettings} style={{ marginTop: 16 }}>
      <h3>Quiz Setup</h3>

      <input name="maxPlayers" type="number" placeholder="No. of players" min="1" defaultValue="20" required />
      <input name="topic" type="text" placeholder="Quiz topic" required />
      <input name="description" type="text" placeholder="Description (optional)" />

      <select name="difficulty" defaultValue="easy">
        <option value="easy">Easy</option>
        <option value="medium">Medium</option>
        <option value="hard">Hard</option>
      </select>

      <input name="numQuestions" type="number" placeholder="No. of questions" min="1" max="30" defaultValue="5" required />

      <select name="timePerQuestion" defaultValue="15">
        <option value="10">10 seconds</option>
        <option value="15">15 seconds</option>
        <option value="30">30 seconds</option>
        <option value="60">60 seconds</option>
      </select>

      <button type="submit">Save Settings</button>
    </form>
  );
}

export default QuizSettings;
