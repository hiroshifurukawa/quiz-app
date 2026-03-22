let quizData = [];
let currentQuestion = null;
let totalCount = 0;
let correctCount = 0;
let answered = false;

async function loadQuiz() {
  try {
    const response = await fetch("./kumite_quiz_merged.csv");
    if (!response.ok) {
      throw new Error("quiz.csv の読み込みに失敗しました");
    }

    const csvText = await response.text();
    quizData = parseCSV(csvText);

    if (quizData.length === 0) {
      document.getElementById("question").textContent = "問題がありません。";
      return;
    }

    showRandomQuestion();
  } catch (error) {
    document.getElementById("question").textContent = "エラー: " + error.message;
  }
}

function parseCSV(csvText) {
  const lines = csvText.trim().split("\n");
  const rows = lines.map(line => line.split(","));

  const header = rows[0];
  const questionIndex = header.indexOf("question");
  const answerIndex = header.indexOf("answer");
  const explanationIndex = header.indexOf("explanation");

  if (questionIndex === -1 || answerIndex === -1 || explanationIndex === -1) {
    throw new Error("CSVのヘッダーは question,answer,explanation にしてください");
  }

  return rows.slice(1).map(row => ({
    question: row[questionIndex]?.trim() || "",
    answer: row[answerIndex]?.trim() || "",
    explanation: row[explanationIndex]?.trim() || ""
  })).filter(item => item.question && item.answer);
}

function showRandomQuestion() {
  const randomIndex = Math.floor(Math.random() * quizData.length);
  currentQuestion = quizData[randomIndex];

  document.getElementById("question").textContent = currentQuestion.question;
  document.getElementById("result").textContent = "";
  document.getElementById("explanation").textContent = "";

  answered = false;

  // ボタン有効化
  document.querySelectorAll(".answer-btn").forEach(btn => btn.disabled = false);
}

function normalizeText(text) {
  return text.trim().toLowerCase();
}

function answer(userAnswer) {
  if (!currentQuestion) return;

  // すでに答えてたら無視
  if (answered) return;

  answered = true; // 回答済みにする

  // ボタン無効化
  document.querySelectorAll(".answer-btn").forEach(btn => btn.disabled = true);

  totalCount++;

  const resultEl = document.getElementById("result");
  const explanationEl = document.getElementById("explanation");

  if (userAnswer === currentQuestion.answer) {
    correctCount++;
    resultEl.textContent = "正解！";
  } else {
    resultEl.textContent = `不正解（正解: ${currentQuestion.answer}）`;
  }

  explanationEl.textContent = currentQuestion.explanation || "";

  updateScore();
}

function updateScore() {
  document.getElementById("score").textContent =
    `${totalCount}問中 ${correctCount}問正解`;
}

document.getElementById("checkButton").addEventListener("click", checkAnswer);
document.getElementById("nextButton").addEventListener("click", showRandomQuestion);

document.getElementById("answerInput").addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    checkAnswer();
  }
});

loadQuiz();
