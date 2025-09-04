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

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to server with id:", socket.id);
    });

    socket.on("roomUpdate", (players) => {
      console.log("Room updated:", players);
      setPlayers(players || []);
    });

    socket.on("quizSettingsSaved", (settings) => {
      console.log("Quiz settings received:", settings);
      setQuizSettings(settings);
    });

    socket.on("quizReady", (quizData) => {
      console.log("Quiz ready:", quizData);
      setQuiz(quizData);
    });

    return () => {
      socket.off("connect");
      socket.off("roomUpdate");
      socket.off("quizSettingsSaved");
      socket.off("quizReady");
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

        {quiz && (
          <div className="quiz">
            <h3>Quiz</h3>
            {quiz.map((q, idx) => (
              <div key={idx} className="question">
                <p><b>Q{idx + 1}:</b> {q.question}</p>
                <ul>
                  {q.options.map((opt, i) => (
                    <li key={i}>{opt}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <main className="bg-container">
      <div className="container">
        <h1>Quiz Arena</h1>
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
