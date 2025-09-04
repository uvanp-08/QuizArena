# QUIZ ARENA

Quiz Arena is a **real-time multiplayer quiz web app** where a host can create a room, set quiz settings, and AI generates questions based on the chosen topic. Players can join the room, play together, and view the leaderboard.

---

##  Features
-  **Room System** – Host creates a room with a unique code, others join.
-  **Multiplayer Support** – Entire class can play together in real time.
-  **AI-Powered Quiz Generation** – Questions generated dynamically using Google Gemini API.
-  **Custom Settings** – Host can set:
  - Topic of the quiz
  - Number of questions
  - Difficulty (Easy / Medium / Hard)
  - Time per question
-  **Countdown & Timed Questions** – Quiz starts with a 10s countdown and each question is timed.
-  **Leaderboard** – Tracks scores of all players.

---

## 🛠️ Tech Stack

### Frontend
-  React (Vite)
-  Tailwind CSS (UI styling)
-  Socket.IO Client (real-time communication)

### Backend
-  Node.js + Express
-  Socket.IO Server
-  Google Gemini API (AI question generation)
-  MongoDB (for storing rooms, players, results – optional)
