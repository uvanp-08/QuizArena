import express from "express";
import http from "http";
import { Server } from "socket.io";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

const rooms = {}; // memory store

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Create Room
  socket.on("createRoom", ({ name }, callback) => {
    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    rooms[roomCode] = {
      players: [{ id: socket.id, name }],
      quizSettings: null,
      quiz: null,
    };
    socket.join(roomCode);
    console.log("Room created:", roomCode);
    callback({ roomCode, players: rooms[roomCode].players, isHost: true });
  });

  // Join Room
  socket.on("joinRoom", ({ roomCode, name }, callback) => {
    if (rooms[roomCode]) {
      rooms[roomCode].players.push({ id: socket.id, name });
      socket.join(roomCode);
      console.log(`${name} joined room: ${roomCode}`);
      io.to(roomCode).emit("roomUpdate", rooms[roomCode].players);
      callback({ success: true, players: rooms[roomCode].players, isHost: false });
    } else {
      callback({ success: false });
    }
  });

  // Save quiz settings & fetch Gemini questions
  socket.on("setQuizSettings", async ({ roomCode, settings }) => {
    rooms[roomCode].quizSettings = settings;
    io.to(roomCode).emit("quizSettingsSaved", settings);

    const prompt = `Generate ${settings.numQuestions} multiple-choice quiz questions on ${settings.topic} (difficulty: ${settings.difficulty}). 
    Provide ONLY JSON in this exact format:
    [
      { "question": "Q1?", "options": ["A","B","C","D"], "answer": "A" }
    ]`;

    try {
      console.log("Fetching questions from Gemini...");
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      );

      const data = await response.json();
      console.log("Gemini raw response:", JSON.stringify(data, null, 2));

      let text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "[]";

      // Extract only JSON
      const match = text.match(/\[[\s\S]*\]/);
      if (match) text = match[0];

      let quiz = [];
      try {
        quiz = JSON.parse(text);
      } catch (e) {
        console.error("JSON parse failed:", e, text);
      }

      rooms[roomCode].quiz = quiz;
      io.to(roomCode).emit("quizReady", quiz);
    } catch (err) {
      console.error("Error fetching quiz:", err);
    }
  });

  // Start Quiz (with countdown)
  socket.on("startQuiz", ({ roomCode }) => {
    const quiz = rooms[roomCode]?.quiz;
    if (!quiz || quiz.length === 0) {
      console.error("No quiz found for room:", roomCode);
      return;
    }

    let countdown = 10;
    const countdownInterval = setInterval(() => {
      io.to(roomCode).emit("quizStarting", countdown);
      countdown--;
      if (countdown < 0) {
        clearInterval(countdownInterval);
        runQuiz(roomCode, quiz);
      }
    }, 1000);
  });

  // Disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    for (const roomCode in rooms) {
      rooms[roomCode].players = rooms[roomCode].players.filter((p) => p.id !== socket.id);
      io.to(roomCode).emit("roomUpdate", rooms[roomCode].players);
    }
  });
});

// Quiz loop
function runQuiz(roomCode, quiz) {
  let index = 0;
  const settings = rooms[roomCode].quizSettings || { timePerQuestion: 10 };

  function nextQuestion() {
    if (index >= quiz.length) {
      io.to(roomCode).emit("quizEnd", "Quiz Finished!");
      return;
    }

    io.to(roomCode).emit("showQuestion", quiz[index]);
    index++;

    setTimeout(nextQuestion, settings.timePerQuestion * 1000);
  }

  nextQuestion();
}

const PORT = 3001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
