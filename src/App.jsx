import { useState, useEffect } from "react";
import io from "socket.io-client";
import QuizSettings from "./components/QuizSettings";
import "./App.css";

const socket = io("http://localhost:3001");

function App() {
  const [name, setName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [inRoom, setInRoom] = useState(false);
  const [players, setPlayers] = useState([]);
  const [error, setError] = useState("");
  const [isHost, setIsHost] = useState(false);
  const [quizSettings, setQuizSettings] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to server with id:", socket.id);
    });

    socket.on("roomUpdate", (players) => {
      setPlayers(players || []);
    });

    socket.on("quizSettingsSaved", (settings) => {
      setQuizSettings(settings);
    });

    socket.on("quizReady", (quizData) => {
      setQuiz(quizData);
    });

    socket.on("quizStarting", (timeLeft) => {
      setCountdown(timeLeft);
    });

    socket.on("showQuestion", (question) => {
      setCountdown(null);
      setCurrentQuestion(question);
    });

    socket.on("quizEnd", (msg) => {
      setCurrentQuestion(null);
      alert(msg);
    });

    return () => {
      socket.off("connect");
      socket.off("roomUpdate");
      socket.off("quizSettingsSaved");
      socket.off("quizReady");
      socket.off("quizStarting");
      socket.off("showQuestion");
      socket.off("quizEnd");
    };
  }, []);

  function handleCreateRoom() {
    if (!name) {
      setError("Enter your name first!");
      return;
    }
    socket.emit("createRoom", { name }, ({ roomCode, players, isHost }) => {
      setRoomCode(roomCode);
      setPlayers(players || []);
      setInRoom(true);
      setIsHost(isHost);
    });
  }

  function handleJoinRoom() {
    if (!name || !roomCode) {
      setError("Enter both name and room code!");
      return;
    }
    socket.emit("joinRoom", { roomCode, name }, ({ success, players, isHost }) => {
      if (success) {
        setPlayers(players || []);
        setInRoom(true);
        setIsHost(isHost);
      } else {
        setError("Room not found!");
      }
    });
  }

  function handleStartQuiz() {
    console.log("Start quiz clicked!");
    socket.emit("startQuiz", { roomCode });
  }

  // ---------------- UI ----------------
  if (inRoom) {
    return (
      <div className="welcome">
        <h1>Quiz Arena</h1>
        <h2>Room Code: {roomCode}</h2>
        <h3>Players:</h3>
        <ul>
          {(players || []).map((p) => (
            <li key={p.id}>{p.name}</li>
          ))}
        </ul>

        {isHost && !quizSettings && (
          <QuizSettings roomCode={roomCode} socket={socket} />
        )}

        {!isHost && !quizSettings && <p>Waiting for host to set quiz...</p>}

        {quizSettings && !quiz && (
          <p>Waiting for AI to generate questions...</p>
        )}

        {quiz && !currentQuestion && !countdown && isHost && (
          <button onClick={handleStartQuiz}>Start Quiz</button>
        )}

        {countdown !== null && (
          <h2>Quiz starts in: {countdown} seconds...</h2>
        )}

        {currentQuestion && (
          <div>
            <h2>{currentQuestion.question}</h2>
            <ul>
              {currentQuestion.options.map((opt, idx) => (
                <li key={idx}>{opt}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  return (
    <main className="bg-container">
      <div className="container">
        <div className="float-animation">
          <h1>Quiz Arena</h1>
          <h2>Battle of the Brains</h2>
        </div>
        <input
          type="text"
          placeholder="Enter Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="code"
          id="name"
        />
        <div id="join-room">
          <input
            type="text"
            placeholder="Enter room code"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            className="code"
          />
          <button id="join-button" onClick={handleJoinRoom}>
            Join
          </button>
        </div>
        <button id="create-button" onClick={handleCreateRoom}>
          Create Room
        </button>
        <h2>{error}</h2>
      </div>
    </main>
  );
}

export default App;
