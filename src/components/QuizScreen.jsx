import React, { useState } from "react";

function QuizScreen({ questions }) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});

  function handleAnswer(option) {
    console.log(option);
    
    setAnswers({ ...answers, [current]: option });
    if (current + 1 < questions.length) {
      setCurrent(current + 1);
    } else {
      alert("Quiz finished! Answers: " + JSON.stringify(answers, null, 2));
    }
  }

  const q = questions[current];

  return (
    <div className="quiz-screen">
      <h2>Question {current + 1}</h2>
      <p>{q.question}</p>
      <ul>
        {q.options.map((opt, idx) => (
            <button onClick={() => handleAnswer(opt)}>{opt}</button>
        ))}
      </ul>
    </div>
  );
}

export default QuizScreen;
